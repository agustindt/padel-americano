"use server";

import { auth } from "@/auth";
import { planRoundMatches } from "@/lib/americano";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok?: true; error?: string };

export async function createRoundAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado." };

  const title = String(formData.get("title") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const mapsRaw = String(formData.get("mapsUrl") ?? "").trim();
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

  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length < 4) {
    return {
      error: "Se necesitan al menos 4 jugadores registrados para armar una fecha.",
    };
  }

  const last = await prisma.round.findFirst({ orderBy: { sortOrder: "desc" } });
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
  if (!session?.user?.id) return { error: "No autorizado." };

  const title = String(formData.get("title") ?? "").trim() || "Partido manual";
  const a1 = String(formData.get("playerA1Id") ?? "");
  const a2 = String(formData.get("playerA2Id") ?? "");
  const b1 = String(formData.get("playerB1Id") ?? "");
  const b2 = String(formData.get("playerB2Id") ?? "");
  const ids = [a1, a2, b1, b2];
  if (ids.some((id) => !id)) return { error: "Elegí los cuatro jugadores." };
  if (new Set(ids).size !== 4) return { error: "Los cuatro jugadores tienen que ser distintos." };

  const last = await prisma.round.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
      data: {
        title,
        sortOrder,
        kind: "MANUAL_SINGLE",
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

export async function saveMatchScoreAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado." };

  const matchId = String(formData.get("matchId") ?? "");
  const scoreA = Number.parseInt(String(formData.get("scoreTeamA") ?? ""), 10);
  const scoreB = Number.parseInt(String(formData.get("scoreTeamB") ?? ""), 10);

  if (!matchId) return { error: "Partido inválido." };
  if (Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
    return { error: "Ingresá juegos numéricos para ambos equipos." };
  }
  if (scoreA < 0 || scoreB < 0) {
    return { error: "Los juegos no pueden ser negativos." };
  }
  if (scoreA === 0 && scoreB === 0) {
    return {
      error: "0–0 no cuenta como partido jugado. Cargá el marcador real (ej. 6–4).",
    };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { scoreTeamA: scoreA, scoreTeamB: scoreB },
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}
