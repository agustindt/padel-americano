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

  await prisma.match.update({
    where: { id: matchId },
    data: { scoreTeamA: scoreA, scoreTeamB: scoreB },
  });

  revalidatePath("/");
  revalidatePath("/fechas");
  revalidatePath("/posiciones");
  return { ok: true };
}
