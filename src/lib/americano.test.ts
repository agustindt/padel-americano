import { describe, expect, it } from "vitest";
import { planRoundMatches, shuffle } from "./americano";

describe("shuffle", () => {
  it("preserves length and elements", () => {
    const a = ["1", "2", "3", "4"];
    const s = shuffle(a);
    expect(s).toHaveLength(4);
    expect([...s].sort()).toEqual([...a].sort());
  });
});

describe("planRoundMatches", () => {
  it("with 4 players creates one match and no sit-outs", () => {
    const ids = ["a", "b", "c", "d"];
    const { matches, sitOut } = planRoundMatches(ids);
    expect(matches).toHaveLength(1);
    expect(sitOut).toHaveLength(0);
    const m = matches[0];
    const used = new Set([m.a1, m.a2, m.b1, m.b2]);
    expect(used.size).toBe(4);
  });

  it("with 5 players leaves one sitting out", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const { matches, sitOut } = planRoundMatches(ids);
    expect(matches).toHaveLength(1);
    expect(sitOut).toHaveLength(1);
  });

  it("with 8 players creates two matches", () => {
    const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const { matches, sitOut } = planRoundMatches(ids);
    expect(matches).toHaveLength(2);
    expect(sitOut).toHaveLength(0);
  });
});
