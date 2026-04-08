import { prisma } from "@/lib/prisma";

export type StandingRow = {
  userId: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
};

/** 3 pts victoria, 1 empate, 0 derrota (empates poco habituales en sets a juegos). */
export async function computeStandings(): Promise<StandingRow[]> {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
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
    });
  }

  const finished = await prisma.match.findMany({
    where: {
      scoreTeamA: { not: null },
      scoreTeamB: { not: null },
    },
  });

  const addTeam = (
    ids: [string, string],
    teamWon: boolean | null,
    draw: boolean,
  ) => {
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
    const a = m.scoreTeamA ?? 0;
    const b = m.scoreTeamB ?? 0;
    const draw = a === b;
    const aWon = a > b;
    const bWon = b > a;
    addTeam([m.playerA1Id, m.playerA2Id], draw ? null : aWon, draw);
    addTeam([m.playerB1Id, m.playerB2Id], draw ? null : bWon, draw);
  }

  return [...byId.values()].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (y.wins !== x.wins) return y.wins - x.wins;
    return x.name.localeCompare(y.name, "es");
  });
}
