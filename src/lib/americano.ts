/** Fisher–Yates shuffle (in-place copy). */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Construye cruces para una fecha americana: bloques de 4 jugadores → dos parejas que se enfrentan.
 * El resto queda sin jugar esa ronda (no suman ni restan).
 */
export function planRoundMatches(userIds: string[]): {
  matches: { a1: string; a2: string; b1: string; b2: string }[];
  sitOut: string[];
} {
  const pool = shuffle(userIds);
  const matches: { a1: string; a2: string; b1: string; b2: string }[] = [];

  while (pool.length >= 4) {
    const chunk = pool.splice(0, 4);
    const [p1, p2, p3, p4] = shuffle(chunk);
    matches.push({ a1: p1, a2: p2, b1: p3, b2: p4 });
  }

  return { matches, sitOut: pool };
}

/**
 * Cruces 1v1: de a dos jugadores → un partido. El resto descansa.
 */
export function planRoundMatches1v1(userIds: string[]): {
  matches: { a1: string; b1: string }[];
  sitOut: string[];
} {
  const pool = shuffle(userIds);
  const matches: { a1: string; b1: string }[] = [];

  while (pool.length >= 2) {
    const [p1, p2] = shuffle(pool.splice(0, 2));
    matches.push({ a1: p1, b1: p2 });
  }

  return { matches, sitOut: pool };
}
