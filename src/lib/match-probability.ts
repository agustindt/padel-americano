export type PlayerStrengthInput = {
  wins: number;
  played: number;
};

/**
 * Fuerza suavizada (evita div/0): (wins+1)/(played+2).
 * Si played=0 → ~0.33 (neutral).
 */
export function playerStrength(p: PlayerStrengthInput): number {
  return (p.wins + 1) / (p.played + 2);
}

export type TeamWinEstimate = {
  teamA: number;
  teamB: number;
};

/**
 * P(A gana) = media fuerzas A / (media A + media B). Orientativo.
 */
export function estimateTeamWinProbability(
  a1: PlayerStrengthInput,
  a2: PlayerStrengthInput,
  b1: PlayerStrengthInput,
  b2: PlayerStrengthInput,
): TeamWinEstimate {
  const sa = (playerStrength(a1) + playerStrength(a2)) / 2;
  const sb = (playerStrength(b1) + playerStrength(b2)) / 2;
  const sum = sa + sb;
  if (sum <= 0) return { teamA: 0.5, teamB: 0.5 };
  return { teamA: sa / sum, teamB: sb / sum };
}

/** P(A1 gana) para partido 1v1. */
export function estimate1v1WinProbability(
  a: PlayerStrengthInput,
  b: PlayerStrengthInput,
): TeamWinEstimate {
  const sa = playerStrength(a);
  const sb = playerStrength(b);
  const sum = sa + sb;
  if (sum <= 0) return { teamA: 0.5, teamB: 0.5 };
  return { teamA: sa / sum, teamB: sb / sum };
}

export function formatPct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
