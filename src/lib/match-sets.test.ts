import { describe, expect, it } from "vitest";
import { verdictFromSets, normalizeSets, parseSetScoresFromDb, formatSetsDisplay } from "./match-sets";

describe("verdictFromSets", () => {
  it("counts single-set win for team A", () => {
    const v = verdictFromSets([{ a: 6, b: 3 }]);
    expect(v).toEqual({ kind: "counted", draw: false, teamAWon: true });
  });

  it("counts best-of-three when A wins 2 sets", () => {
    const v = verdictFromSets([
      { a: 6, b: 4 },
      { a: 3, b: 6 },
      { a: 6, b: 2 },
    ]);
    expect(v).toEqual({ kind: "counted", draw: false, teamAWon: true });
  });

  it("returns incomplete for 1–1 in sets", () => {
    const v = verdictFromSets([
      { a: 6, b: 4 },
      { a: 4, b: 6 },
    ]);
    expect(v.kind).toBe("incomplete");
  });

  it("rejects tie sets when more than one set", () => {
    const v = verdictFromSets([
      { a: 6, b: 4 },
      { a: 6, b: 6 },
    ]);
    expect(v.kind).toBe("invalid");
  });
});

describe("parseSetScoresFromDb", () => {
  it("parses valid JSON array", () => {
    expect(parseSetScoresFromDb([{ a: 6, b: 3 }])).toEqual([{ a: 6, b: 3 }]);
  });

  it("returns null for invalid input", () => {
    expect(parseSetScoresFromDb("nope")).toBeNull();
  });
});

describe("formatSetsDisplay", () => {
  it("joins sets with middle dot", () => {
    expect(formatSetsDisplay([{ a: 6, b: 4 }])).toBe("6–4");
  });
});

describe("normalizeSets", () => {
  it("drops 0–0 placeholders", () => {
    expect(normalizeSets([{ a: 0, b: 0 }, { a: 6, b: 3 }])).toEqual([{ a: 6, b: 3 }]);
  });
});
