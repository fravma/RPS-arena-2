// Logique d'une salle partagée : fonctions pures, sans Redis ni réseau.
// Spec : specs/T2a-salle/spec.md

import { scoreRound, totals as sumRounds, winners as topPlayers, type Modifier, type Move, type RoundMoves } from "./engine";

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 2;
/** Un joueur non vu depuis plus longtemps est considéré parti (critère 9). */
export const PRESENCE_TIMEOUT_MS = 10_000;
/** Lettres du code de salle : sans O, I, L ni U (ambiguës à l'oral ou à l'écrit). */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ";
/** Durée d'une manche (décision PM T2b : 10 s, sans réglage). */
export const ROUND_MS = 10_000;

export interface Player {
  id: string;
  name: string;
  /** Ordre d'arrivée (1, 2, 3...). */
  joinedAt: number;
}

/** Données brutes d'une salle, telles que stockées. */
export interface RoomData {
  code: string;
  createdAt: number;
  /** Dans l'ordre d'arrivée. */
  players: Player[];
  /** Dernière interrogation de chaque joueur (horodatage en ms). */
  lastSeen: Record<string, number>;
  /** Joueurs ayant cliqué sur « Quitter la salle ». */
  left: Record<string, boolean>;
  started: boolean;
  modifiers: Modifier[];
  /** Index de la manche en cours (0 à 9). */
  round: number;
  over: boolean;
  /** Coups joués, clé `${manche}:${idJoueur}`. */
  moves: Record<string, Move>;
  /** Manches déjà révélées : une manche révélée le reste, même si un joueur revient. */
  revealed?: Record<number, boolean>;
  /** Heure limite de chaque manche (horodatage serveur en ms), posée à son ouverture. */
  deadlines?: Record<number, number>;
}

export function emptyRoom(code: string, now: number): RoomData {
  return {
    code,
    createdAt: now,
    players: [],
    lastSeen: {},
    left: {},
    started: false,
    modifiers: [],
    round: 0,
    over: false,
    moves: {},
  };
}

export function generateCode(rng: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < 4; i++) code += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  return code;
}

const normalize = (name: string) => name.trim().toLowerCase();

export function isPresent(room: RoomData, playerId: string, now: number): boolean {
  if (room.left[playerId]) return false;
  const seen = room.lastSeen[playerId];
  return seen !== undefined && now - seen <= PRESENCE_TIMEOUT_MS;
}

export function presentPlayers(room: RoomData, now: number): Player[] {
  return room.players.filter((p) => isPresent(room, p.id, now));
}

/** Administrateur : le premier joueur présent dans l'ordre d'arrivée. */
export function adminOf(room: RoomData, now: number): string | null {
  return presentPlayers(room, now)[0]?.id ?? null;
}

/** Peut-on rejoindre avec ce prénom ? null si oui, sinon le message à afficher. */
export function canJoin(room: RoomData, name: string, now: number): string | null {
  if (!name.trim()) return "Saisissez votre prénom";
  if (room.started) return "Partie déjà commencée";
  const present = presentPlayers(room, now);
  if (present.length >= MAX_PLAYERS) return "Salle pleine";
  if (present.some((p) => normalize(p.name) === normalize(name))) return "Prénom déjà pris dans cette salle";
  return null;
}

/** Ce joueur peut-il lancer la partie ? null si oui, sinon le message à afficher. */
export function canStart(room: RoomData, playerId: string, now: number): string | null {
  if (room.started) return "Partie déjà commencée";
  if (adminOf(room, now) !== playerId) return "Seul l'administrateur peut lancer la partie";
  if (presentPlayers(room, now).length < MIN_PLAYERS) return "2 joueurs minimum";
  return null;
}

const moveKey = (round: number, playerId: string) => `${round}:${playerId}`;

/** Révélée si déjà marquée comme telle, ou si tous les joueurs présents ont joué. */
function timeIsUp(room: RoomData, now: number): boolean {
  const deadline = room.deadlines?.[room.round];
  return deadline !== undefined && now >= deadline;
}

export function isRevealed(room: RoomData, now: number): boolean {
  if (!room.started) return false;
  if (room.revealed?.[room.round]) return true;
  if (timeIsUp(room, now)) return true;
  const present = presentPlayers(room, now);
  if (present.length === 0) return false;
  return present.every((p) => room.moves[moveKey(room.round, p.id)]);
}

export function canPlay(room: RoomData, playerId: string, now: number): string | null {
  if (!room.started) return "La partie n'a pas commencé";
  if (room.over) return "Partie terminée";
  if (!room.players.some((p) => p.id === playerId)) return "Joueur inconnu dans cette salle";
  if (timeIsUp(room, now)) return "Temps écoulé";
  if (isRevealed(room, now)) return "Manche déjà révélée";
  if (room.moves[moveKey(room.round, playerId)]) return "Coup déjà joué";
  return null;
}

export function canAdvance(room: RoomData, playerId: string, now: number): string | null {
  if (!room.started || room.over) return "Aucune manche en cours";
  if (adminOf(room, now) !== playerId) return "Seul l'administrateur peut passer à la manche suivante";
  if (!isRevealed(room, now)) return "La manche n'est pas encore révélée";
  return null;
}

/** Coups d'une manche pour tous les joueurs (null = pas joué). */
function roundMoves(room: RoomData, round: number): RoundMoves {
  const out: RoundMoves = {};
  for (const p of room.players) out[p.id] = room.moves[moveKey(round, p.id)] ?? null;
  return out;
}

export type Phase = "lobby" | "choose" | "reveal" | "over";

export interface PlayerView {
  code: string;
  phase: Phase;
  meId: string;
  isAdmin: boolean;
  players: { id: string; name: string; present: boolean; isAdmin: boolean; hasPlayed: boolean }[];
  /** Index de la manche en cours (0 à 9). */
  round: number;
  modifier: Modifier | null;
  /** Heure limite de la manche en cours (horloge du serveur), null avant le lancement. */
  deadline: number | null;
  /** Heure du serveur au moment de la réponse : le navigateur en déduit son décalage d'horloge. */
  serverNow: number;
  myMove: Move | null;
  /** Résultat de la manche en cours, seulement une fois révélée. */
  result: { moves: RoundMoves; points: Record<string, number> } | null;
  totals: Record<string, number>;
  winners: string[];
  canStart: boolean;
  canAdvance: boolean;
}

/** Ce qu'un joueur a le droit de voir : les coups des autres restent cachés avant la révélation. */
export function viewFor(room: RoomData, meId: string, now: number): PlayerView {
  const admin = adminOf(room, now);
  const revealed = isRevealed(room, now);
  const phase: Phase = !room.started ? "lobby" : room.over ? "over" : revealed ? "reveal" : "choose";

  // Manches comptées : toutes les précédentes, plus la courante si elle est révélée.
  const lastCounted = revealed || room.over ? room.round : room.round - 1;
  const perRound: Record<string, number>[] = [];
  for (let r = 0; r <= lastCounted && room.started; r++) perRound.push(scoreRound(roundMoves(room, r), room.modifiers[r]));
  const totals = Object.fromEntries(room.players.map((p) => [p.id, 0]));
  Object.assign(totals, sumRounds(perRound));

  return {
    code: room.code,
    phase,
    meId,
    isAdmin: admin === meId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      present: isPresent(room, p.id, now),
      isAdmin: admin === p.id,
      hasPlayed: room.started && Boolean(room.moves[moveKey(room.round, p.id)]),
    })),
    round: room.round,
    modifier: room.started ? room.modifiers[room.round] ?? null : null,
    deadline: room.started ? room.deadlines?.[room.round] ?? null : null,
    serverNow: now,
    myMove: room.moves[moveKey(room.round, meId)] ?? null,
    result: revealed || room.over ? { moves: roundMoves(room, room.round), points: perRound[room.round] } : null,
    totals,
    winners: room.over ? topPlayers(totals) : [],
    canStart: canStart(room, meId, now) === null,
    canAdvance: canAdvance(room, meId, now) === null,
  };
}
