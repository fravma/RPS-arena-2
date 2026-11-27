// Partie solo contre des bots : fonctions pures, l'écran ne fait qu'afficher.
// Spec : specs/T1-partie-solo/spec.md

import {
  MOVES,
  ROUNDS,
  drawModifiers,
  scoreRound,
  totals,
  winners,
  type Modifier,
  type Move,
  type Rng,
  type RoundMoves,
} from "./engine";

export const ME = "Vous";
export const BOT_COUNT = 4;
export const ROUND_SECONDS = 20;

export type Phase = "choose" | "reveal" | "over";

export interface RoundResult {
  moves: RoundMoves;
  points: Record<string, number>;
}

export interface SoloGame {
  players: string[];
  modifiers: Modifier[];
  /** Index de la manche en cours (0 à 9). */
  round: number;
  phase: Phase;
  /** Coup choisi pour la manche en cours, modifiable tant que la manche n'est pas révélée. */
  myMove: Move | null;
  history: RoundResult[];
}

export function startGame(rng: Rng = Math.random): SoloGame {
  return {
    players: [ME, ...Array.from({ length: BOT_COUNT }, (_, i) => `Bot ${i + 1}`)],
    modifiers: drawModifiers(ROUNDS, rng),
    round: 0,
    phase: "choose",
    myMove: null,
    history: [],
  };
}

export function chooseMove(game: SoloGame, move: Move): SoloGame {
  if (game.phase !== "choose") return game;
  return { ...game, myMove: move };
}

/** Révèle la manche avec le coup donné pour moi (null = pas joué). Ignoré si déjà révélée. */
function reveal(game: SoloGame, myMove: Move | null, rng: Rng): SoloGame {
  if (game.phase !== "choose") return game;
  const moves: RoundMoves = {};
  for (const p of game.players) moves[p] = p === ME ? myMove : MOVES[Math.floor(rng() * MOVES.length)];
  const points = scoreRound(moves, game.modifiers[game.round]);
  return { ...game, phase: "reveal", history: [...game.history, { moves, points }] };
}

/** Je valide mon coup. Sans coup choisi, rien ne se passe. */
export function validate(game: SoloGame, rng: Rng = Math.random): SoloGame {
  if (!game.myMove) return game;
  return reveal(game, game.myMove, rng);
}

/** Le timer arrive à 0 : un coup choisi mais non validé ne compte pas. */
export function timeUp(game: SoloGame, rng: Rng = Math.random): SoloGame {
  return reveal(game, null, rng);
}

export function nextRound(game: SoloGame): SoloGame {
  if (game.phase !== "reveal") return game;
  if (game.round + 1 >= ROUNDS) return { ...game, phase: "over" };
  return { ...game, round: game.round + 1, phase: "choose", myMove: null };
}

export function gameTotals(game: SoloGame): Record<string, number> {
  const base = Object.fromEntries(game.players.map((p) => [p, 0]));
  return { ...base, ...totals(game.history.map((r) => r.points)) };
}

export function gameWinners(game: SoloGame): string[] {
  return winners(gameTotals(game));
}

/** Joueurs triés par total décroissant. */
export function ranking(game: SoloGame): string[] {
  const t = gameTotals(game);
  return [...game.players].sort((a, b) => t[b] - t[a]);
}
