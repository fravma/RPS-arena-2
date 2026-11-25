// Moteur de score RPS Arena : fonctions pures, sans état, sans réseau.
// Spec : specs/T0-moteur/spec.md

export type Move = "rock" | "paper" | "scissors";
export const MOVES: Move[] = ["rock", "paper", "scissors"];

/** Ce que chaque coup bat. */
export const BEATS: Record<Move, Move> = {
  rock: "scissors",
  scissors: "paper",
  paper: "rock",
};

export interface Modifier {
  move: Move;
  value: number;
}

/** Coup de chaque joueur pour une manche. null = absent (pas joué avant la fin du timer). */
export type RoundMoves = Record<string, Move | null>;

export function countMoves(moves: RoundMoves): Record<Move, number> {
  const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const m of Object.values(moves)) if (m) counts[m]++;
  return counts;
}

/**
 * Points de chaque joueur pour une manche : b / n + modificateur.
 * b = joueurs battus, n = joueurs ayant fait le même coup (soi compris).
 * Un absent marque 0 et ne compte ni dans b ni dans n.
 */
export function scoreRound(moves: RoundMoves, modifier: Modifier | null): Record<string, number> {
  const counts = countMoves(moves);
  const result: Record<string, number> = {};
  for (const [player, move] of Object.entries(moves)) {
    if (!move) {
      result[player] = 0;
      continue;
    }
    const b = counts[BEATS[move]];
    const n = counts[move];
    const bonus = modifier && modifier.move === move ? modifier.value : 0;
    result[player] = b / n + bonus;
  }
  return result;
}
