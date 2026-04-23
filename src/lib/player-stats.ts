import { prisma } from "@/lib/prisma";
import { parseSetScoresFromDb, verdictFromSets, formatSetsDisplay, type GameSet } from "@/lib/match-sets";
import { Prisma } from "@prisma/client";

export type PlayerMatchRow = {
  matchId: string;
  roundTitle: string | null;
  courtLabel: string | null;
  setScores: GameSet[] | null;
  display: string;
  won: boolean | null;
  wasTeamA: boolean;
  opponentNames: string;
};

export async function getPlayerMatchHistory(
  userId: string,
  groupId: string,
  limit = 15,
): Promise<PlayerMatchRow[]> {
  const matches = await prisma.match.findMany({
    where: {
      round: { groupId, status: { not: "DRAFT" } },
      OR: [
        { playerA1Id: userId },
        { playerA2Id: userId },
        { playerB1Id: userId },
        { playerB2Id: userId },
      ],
      setScores: { not: Prisma.DbNull },
    },
    orderBy: [{ round: { sortOrder: "desc" } }, { courtLabel: "asc" }],
    take: 120,
    include: {
      round: { select: { title: true, sortOrder: true } },
      playerA1: { select: { name: true } },
      playerA2: { select: { name: true } },
      playerB1: { select: { name: true } },
      playerB2: { select: { name: true } },
    },
  });

  const rows: PlayerMatchRow[] = [];

  for (const m of matches) {
    const sets = parseSetScoresFromDb(m.setScores);
    if (!sets?.length) continue;
    const v = verdictFromSets(sets);
    if (v.kind !== "counted") continue;

    const wasTeamA = m.playerA1Id === userId || m.playerA2Id === userId;
    const teamAWon = v.teamAWon === true;
    const teamBWon = v.teamAWon === false;
    const won = v.draw ? null : wasTeamA ? teamAWon : teamBWon;

    const labelB =
      m.playerB2 == null
        ? m.playerB1.name
        : `${m.playerB1.name} / ${m.playerB2.name}`;
    const labelA =
      m.playerA2 == null
        ? m.playerA1.name
        : `${m.playerA1.name} / ${m.playerA2.name}`;

    rows.push({
      matchId: m.id,
      roundTitle: m.round.title,
      courtLabel: m.courtLabel,
      setScores: sets,
      display: formatSetsDisplay(sets),
      won,
      wasTeamA,
      opponentNames: wasTeamA ? labelB : labelA,
    });
    if (rows.length >= limit) break;
  }

  return rows;
}

/** Parejas: cuenta con cuántas veces compartiste equipo (misma cancha, mismo bando). */
export async function getTeammateFrequency(
  userId: string,
  groupId: string,
): Promise<{ name: string; count: number }[]> {
  const matches = await prisma.match.findMany({
    where: {
      round: { groupId, status: { not: "DRAFT" } },
      OR: [{ playerA1Id: userId }, { playerA2Id: userId }, { playerB1Id: userId }, { playerB2Id: userId }],
      setScores: { not: Prisma.DbNull },
    },
    select: {
      playerA1Id: true,
      playerA2Id: true,
      playerB1Id: true,
      playerB2Id: true,
      playerA1: { select: { name: true } },
      playerA2: { select: { name: true } },
      playerB1: { select: { name: true } },
      playerB2: { select: { name: true } },
    },
  });

  const counts = new Map<string, number>();
  for (const m of matches) {
    let partnerName: string | null = null;
    if (m.playerA1Id === userId) partnerName = m.playerA2?.name ?? null;
    else if (m.playerA2Id === userId) partnerName = m.playerA1.name;
    else if (m.playerB1Id === userId) partnerName = m.playerB2?.name ?? null;
    else if (m.playerB2Id === userId) partnerName = m.playerB1.name;
    if (partnerName) {
      counts.set(partnerName, (counts.get(partnerName) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
