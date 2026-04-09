/** Un set = juegos a favor equipo A vs equipo B (ej. 6–3). */

export type GameSet = { a: number; b: number };

export const MAX_SETS = 5;

export function parseSetScoresFromDb(raw: unknown): GameSet[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  const out: GameSet[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const rec = item as { a?: unknown; b?: unknown };
    const a = rec.a;
    const b = rec.b;
    if (typeof a !== "number" || typeof b !== "number" || !Number.isFinite(a) || !Number.isFinite(b)) {
      return null;
    }
    out.push({ a: Math.trunc(a), b: Math.trunc(b) });
  }
  return out;
}

export function normalizeSets(sets: GameSet[]): GameSet[] {
  return sets.filter((s) => !(s.a === 0 && s.b === 0));
}

export type MatchVerdict =
  | { kind: "counted"; draw: boolean; teamAWon: boolean | null }
  | { kind: "incomplete"; message: string }
  | { kind: "invalid"; message: string };

/**
 * Reglas: al mejor de tres sets (como jugás en la cancha).
 * - Un solo set cargado: vale como partido de un set (retrocompatible).
 * - Varios sets: tiene que quedar definido un ganador (2 sets para el mismo equipo), sin empates por set.
 */
export function verdictFromSets(sets: GameSet[]): MatchVerdict {
  const v = normalizeSets(sets);
  if (v.length === 0) {
    return { kind: "invalid", message: "Cargá al menos un set con resultado (no 0–0)." };
  }
  if (v.length > MAX_SETS) {
    return { kind: "invalid", message: `Como máximo ${MAX_SETS} sets.` };
  }

  for (const s of v) {
    if (s.a < 0 || s.b < 0 || s.a > 99 || s.b > 99) {
      return { kind: "invalid", message: "Los juegos por set tienen que estar entre 0 y 99." };
    }
  }

  let winsA = 0;
  let winsB = 0;
  for (const s of v) {
    if (s.a === s.b) {
      if (v.length === 1) {
        return { kind: "counted", draw: true, teamAWon: null };
      }
      return {
        kind: "invalid",
        message: "Si cargás más de un set, cada set tiene que tener ganador (no empates como 6–6 sin desempate).",
      };
    }
    if (s.a > s.b) winsA++;
    else winsB++;
  }

  if (v.length === 1) {
    const s = v[0];
    return { kind: "counted", draw: false, teamAWon: s.a > s.b };
  }

  if (winsA >= 2) {
    return { kind: "counted", draw: false, teamAWon: true };
  }
  if (winsB >= 2) {
    return { kind: "counted", draw: false, teamAWon: false };
  }

  if (v.length === 2 && winsA === 1 && winsB === 1) {
    return {
      kind: "incomplete",
      message: "Quedó 1–1 en sets: falta el tercer set (o corregí si hubo un error).",
    };
  }

  return {
    kind: "incomplete",
    message: "Al mejor de tres tiene que ganar un equipo 2 sets. Revisá los resultados.",
  };
}

export function formatSetsDisplay(sets: GameSet[]): string {
  return sets.map((s) => `${s.a}–${s.b}`).join(" · ");
}

export function parseSetsJsonField(raw: string): GameSet[] | { error: string } {
  const t = raw.trim();
  if (t === "" || t === "[]") {
    return { error: "Cargá al menos un set con resultado." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Formato de sets inválido." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Los sets tienen que ser una lista." };
  }
  const out: GameSet[] = [];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) {
      return { error: "Cada set tiene que ser un objeto { a, b }." };
    }
    const o = item as { a?: unknown; b?: unknown };
    const a = Number(o.a);
    const b = Number(o.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { error: "Los juegos de cada set tienen que ser números." };
    }
    out.push({ a: Math.trunc(a), b: Math.trunc(b) });
  }
  return out;
}
