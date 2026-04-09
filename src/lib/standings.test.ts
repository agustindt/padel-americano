import { describe, expect, it } from "vitest";
import { sortStandings, type StandingRow } from "./standings";

function row(partial: Partial<StandingRow> & { userId: string; name: string }): StandingRow {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    winRate: null,
    meetsMinimumGames: false,
    ...partial,
  };
}

describe("sortStandings", () => {
  const minGames = 3;

  it("puts eligible players (>= min games) above others", () => {
    const a = row({
      userId: "a",
      name: "Ana",
      played: 5,
      wins: 3,
      points: 9,
      winRate: 0.6,
      meetsMinimumGames: true,
    });
    const b = row({
      userId: "b",
      name: "Bob",
      played: 2,
      wins: 2,
      points: 6,
      winRate: 1,
      meetsMinimumGames: false,
    });
    const sorted = sortStandings([b, a], minGames);
    expect(sorted[0].userId).toBe("a");
    expect(sorted[1].userId).toBe("b");
  });

  it("among eligible, sorts by win rate then wins", () => {
    const low = row({
      userId: "l",
      name: "Low",
      played: 4,
      wins: 2,
      points: 6,
      winRate: 0.5,
      meetsMinimumGames: true,
    });
    const high = row({
      userId: "h",
      name: "High",
      played: 4,
      wins: 3,
      points: 9,
      winRate: 0.75,
      meetsMinimumGames: true,
    });
    const sorted = sortStandings([low, high], minGames);
    expect(sorted[0].userId).toBe("h");
  });
});
