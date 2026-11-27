// Logique d'une salle partagée : fonctions pures, sans Redis ni réseau.
// Spec : specs/T2a-salle/spec.md

import type { Modifier, Move } from "./engine";

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 2;
/** Un joueur non vu depuis plus longtemps est considéré parti (critère 9). */
export const PRESENCE_TIMEOUT_MS = 10_000;
/** Lettres du code de salle : sans O, I, L ni U (ambiguës à l'oral ou à l'écrit). */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ";

export interface Player {
  id: string;
  name: string;
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
