"use server";

import { auth } from "@/auth";
import { planRoundMatches } from "@/lib/americano";
import { prisma } from "@/lib/prisma";
import { verdictFromSets, parseSetsJsonField } from "@/lib/match-sets";
import { revalidatePath } from "next/cache";
import type { Prisma, RoundStatus } from "@prisma/client";

export type ActionResult = { ok?: true; error?: string };

function parseRoundStatus(raw: string): RoundStatus | null {
  if (raw === "DRAFT" || raw === "CONFIRMED" || raw === "PLAYED") return raw;
  return null;
}

export async function createRoundAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.groupId) return { error: "No autorizado." };

  const groupId = session.user.groupId;
  const title = String(formData.get("title") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const mapsRaw = String(formData.get("mapsUrl") ?? "").trim();
  const statusRaw = String(formData.get("roundStatus") ?? "CONFIRMED");
  const status = parseRoundStatus(statusRaw) ?? "CONFIRMED";

  let mapsUrl: string | null = null;
  if (mapsRaw) {
    try {
      const u = new URL(mapsRaw);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return { error: "El enlace del mapa tiene que ser http o https." };
      }
      mapsUrl = mapsRaw;
    } catch {
      return { error: "Enlace del mapa inválido." };
    }
  }

  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  const users = await prisma.user.findMany({ where: { groupId }, select: { id: true } });
  if (users.length < 4) {
    return {
      error: "Se necesitan al menos 4 jugadores registrados en el grupo para armar una fecha.",
    };
  }

  const last = await prisma.round.findFirst({
    where: { groupId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const { matches, sitOut } = planRoundMatches(users.map((u) => u.id));

  await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
      data: {
        title: title || `Fecha ${sortOrder}`,
        scheduledAt: scheduledAt ?? undefined,
        venue: venue ?? undefined,
        mapsUrl: mapsUrl ?? undefined,
        sortOrder,
        kind: "AMERICANO_RANDOM",
        status,
        groupId,
      },
    });
    let court = 1;
    for (const m of matches) {
      await tx.match.create({
        data: {
          roundId: round.id,
          courtLabel: `Cancha ${court++}`,
          playerA1Id: m.a1,
          playerA2Id: m.a2,
          playerB1Id: m.b1,
          playerB2Id: m.b2,
        },
      });
    }
    for (const uid of sitOut) {
      await tx.roundSitOut.create({ data: { roundId: round.id, userId: uid } });
    }
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}

export async function createManualMatchAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.groupId) return { error: "No autorizado." };

  const groupId = session.user.groupId;
  const title = String(formData.get("title") ?? "").trim() || "Partido manual";
  const a1 = String(formData.get("playerA1Id") ?? "");
  const a2 = String(formData.get("playerA2Id") ?? "");
  const b1 = String(formData.get("playerB1Id") ?? "");
  const b2 = String(formData.get("playerB2Id") ?? "");
  const ids = [a1, a2, b1, b2];
  if (ids.some((id) => !id)) return { error: "Elegí los cuatro jugadores." };
  if (new Set(ids).size !== 4) return { error: "Los cuatro jugadores tienen que ser distintos." };

  const inGroup = await prisma.user.count({
    where: { id: { in: ids }, groupId },
  });
  if (inGroup !== 4) return { error: "Los cuatro jugadores tienen que ser del mismo grupo." };

  const last = await prisma.round.findFirst({
    where: { groupId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
      data: {
        title,
        sortOrder,
        kind: "MANUAL_SINGLE",
        status: "CONFIRMED",
        groupId,
      },
    });
    await tx.match.create({
      data: {
        roundId: round.id,
        courtLabel: "Cancha 1",
        source: "MANUAL",
        playerA1Id: a1,
        playerA2Id: a2,
        playerB1Id: b1,
        playerB2Id: b2,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}

async function assertMatchInUserGroup(matchId: string, groupId: string): Promise<boolean> {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: { round: { select: { groupId: true } } },
  });
  return m?.round.groupId === groupId;
}

export async function saveMatchScoreAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.groupId) return { error: "No autorizado." };

  const matchId = String(formData.get("matchId") ?? "");
  const setsRaw = String(formData.get("setsJson") ?? "");

  if (!matchId) return { error: "Partido inválido." };
  if (!(await assertMatchInUserGroup(matchId, session.user.groupId))) {
    return { error: "No autorizado." };
  }

  const parsed = parseSetsJsonField(setsRaw);
  if ("error" in parsed) return { error: parsed.error };

  const verdict = verdictFromSets(parsed);
  if (verdict.kind === "invalid") {
    return { error: verdict.message };
  }
  if (verdict.kind === "incomplete") {
    return { error: verdict.message };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { setScores: parsed as unknown as Prisma.InputJsonValue },
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}

export async function deleteMatchAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.groupId) return { error: "No autorizado." };

  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return { error: "Partido inválido." };

  if (!(await assertMatchInUserGroup(matchId, session.user.groupId))) {
    return { error: "No autorizado." };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, roundId: true },
  });
  if (!match) return { error: "No se encontró el partido." };

  await prisma.$transaction(async (tx) => {
    await tx.match.delete({ where: { id: match.id } });
    const remaining = await tx.match.count({ where: { roundId: match.roundId } });
    if (remaining === 0) {
      await tx.round.delete({ where: { id: match.roundId } });
    }
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}

export async function updateRoundStatusAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.groupId) return { error: "No autorizado." };

  const roundId = String(formData.get("roundId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const status = parseRoundStatus(statusRaw);
  if (!roundId || !status) return { error: "Datos inválidos." };

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { groupId: true },
  });
  if (!round || round.groupId !== session.user.groupId) {
    return { error: "No autorizado." };
  }

  await prisma.round.update({
    where: { id: roundId },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}
