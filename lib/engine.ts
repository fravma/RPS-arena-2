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

  // Décision PM : si un seul coup a été joué (tout le monde pareil, ou un seul joueur présent),
  // personne ne marque, modificateur compris.
  const distinctMoves = MOVES.filter((m) => counts[m] > 0).length;
  if (distinctMoves <= 1) {
    for (const player of Object.keys(moves)) result[player] = 0;
    return result;
  }

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

/** Total de chaque joueur : somme de ses points sur toutes les manches. */
export function totals(rounds: Record<string, number>[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rounds) for (const [player, pts] of Object.entries(r)) out[player] = (out[player] ?? 0) + pts;
  return out;
}

/** Écart en dessous duquel deux totaux sont considérés égaux (parade sur les arrondis, plan T0 risque 1). */
export const TIE_TOLERANCE = 1e-9;

/** Gagnant(s) : tous les joueurs à égalité en tête. */
export function winners(playerTotals: Record<string, number>): string[] {
  const entries = Object.entries(playerTotals);
  if (entries.length === 0) return [];
  const best = Math.max(...entries.map(([, t]) => t));
  return entries.filter(([, t]) => best - t < TIE_TOLERANCE).map(([p]) => p);
}

/** Source de hasard : renvoie un nombre dans [0, 1[. Injectable pour les tests. */
export type Rng = () => number;

/** Valeurs autorisées des modificateurs (décision PM : ±0,5 uniquement). */
export const MODIFIER_VALUES = [0.5, -0.5];
export const ROUNDS = 10;

/** Tire un modificateur par manche, au hasard. */
export function drawModifiers(rounds: number = ROUNDS, rng: Rng = Math.random): Modifier[] {
  return Array.from({ length: rounds }, () => ({
    move: MOVES[Math.floor(rng() * MOVES.length)],
    value: MODIFIER_VALUES[Math.floor(rng() * MODIFIER_VALUES.length)],
  }));
}
