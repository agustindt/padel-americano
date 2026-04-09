/** Mínimo de partidos para entrar al bloque ordenado por % victorias (más justo si no todos juegan igual). */
export function getMinGamesForOfficialRanking(): number {
  const raw = process.env.NEXT_PUBLIC_MIN_GAMES_FOR_RANKING;
  if (raw === undefined || raw === "") return 3;
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 1) return n;
  return 3;
}
