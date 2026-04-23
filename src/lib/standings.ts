import { prisma } from "@/lib/prisma";
import { getMinGamesForOfficialRanking } from "@/lib/ranking-config";
import { parseSetScoresFromDb, verdictFromSets } from "@/lib/match-sets";
import { Prisma } from "@prisma/client";

export type StandingRow = {
  userId: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  /** wins / played, null si no jugó */
  winRate: number | null;
  /** Jugó al menos N partidos (N configurable) */
  meetsMinimumGames: boolean;
};

/** 3 pts victoria, 1 empate, 0 derrota. Ignora partidos de fechas en borrador. */
export async function computeStandings(groupId: string): Promise<StandingRow[]> {
  const minGames = getMinGamesForOfficialRanking();
  const users = await prisma.user.findMany({
    where: { groupId },
    orderBy: { name: "asc" },
  });
  const byId = new Map<string, StandingRow>();
  for (const u of users) {
    byId.set(u.id, {
      userId: u.id,
      name: u.name,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      winRate: null,
      meetsMinimumGames: false,
    });
  }

  const finished = await prisma.match.findMany({
    where: {
      setScores: { not: Prisma.DbNull },
      round: {
        groupId,
        status: { not: "DRAFT" },
      },
    },
  });

  const addTeam = (ids: string[], teamWon: boolean | null, draw: boolean) => {
    for (const id of ids) {
      const row = byId.get(id);
      if (!row) continue;
      row.played += 1;
      if (draw) {
        row.draws += 1;
        row.points += 1;
      } else if (teamWon) {
        row.wins += 1;
        row.points += 3;
      } else {
        row.losses += 1;
      }
    }
  };

  for (const m of finished) {
    const sets = parseSetScoresFromDb(m.setScores);
    if (!sets || sets.length === 0) continue;
    const verdict = verdictFromSets(sets);
    if (verdict.kind !== "counted") continue;

    const draw = verdict.draw;
    const aWon = verdict.teamAWon === true;
    const bWon = verdict.teamAWon === false;
    const sideA: string[] = m.playerA2Id
      ? [m.playerA1Id, m.playerA2Id]
      : [m.playerA1Id];
    const sideB: string[] = m.playerB2Id
      ? [m.playerB1Id, m.playerB2Id]
      : [m.playerB1Id];
    addTeam(sideA, draw ? null : aWon, draw);
    addTeam(sideB, draw ? null : bWon, draw);
  }

  const rows: StandingRow[] = [...byId.values()].map((row) => {
    const winRate = row.played > 0 ? row.wins / row.played : null;
    return {
      ...row,
      winRate,
      meetsMinimumGames: row.played >= minGames,
    };
  });

  return sortStandings(rows, minGames);
}

export function sortStandings(rows: StandingRow[], minGames: number): StandingRow[] {
  return [...rows].sort((a, b) => {
    const aEl = a.played >= minGames;
    const bEl = b.played >= minGames;
    if (aEl !== bEl) return aEl ? -1 : 1;

    if (aEl) {
      const wrA = a.winRate ?? 0;
      const wrB = b.winRate ?? 0;
      if (wrB !== wrA) return wrB - wrA;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.played !== a.played) return b.played - a.played;
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name, "es");
    }

    if (b.points !== a.points) return b.points - a.points;
    const wrA = a.winRate ?? 0;
    const wrB = b.winRate ?? 0;
    if (wrB !== wrA) return wrB - wrA;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name, "es");
  });
}
