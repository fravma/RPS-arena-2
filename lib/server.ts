// Actions du serveur : lire la salle, vérifier la règle (lib/room.ts), écrire un seul champ.
// Les routes app/api/rooms/... ne font qu'appeler ces fonctions.

import { MOVES, drawModifiers, type Move } from "./engine";
import type { HashStore } from "./hashStore";
import {
  canAdvance,
  canJoin,
  canPlay,
  canStart,
  emptyRoom,
  generateCode,
  isRevealed,
  viewFor,
  type PlayerView,
  type RoomData,
} from "./room";

export interface Ctx {
  store: HashStore;
  now: () => number;
  rng: () => number;
}

type Fail = { ok: false; error: string };
type Joined = { ok: true; code: string; token: string; playerId: string };

const ROOM_TTL_SECONDS = 24 * 3600;
const key = (code: string) => `room:${code.toUpperCase()}`;
const randomId = () => crypto.randomUUID().replace(/-/g, "");

/** Reconstruit la salle et la table des jetons à partir des champs stockés. */
function parse(code: string, h: Record<string, string>): { room: RoomData; tokens: Record<string, string> } {
  const room = emptyRoom(code.toUpperCase(), Number(h.createdAt));
  const tokens: Record<string, string> = {};
  room.started = h.started === "1";
  room.over = h.over === "1";
  room.round = Number(h.round ?? 0);
  room.modifiers = h.modifiers ? JSON.parse(h.modifiers) : [];
  room.revealed = {};
  for (const [f, v] of Object.entries(h)) {
    const [kind, a, b] = f.split(":");
    if (kind === "p") room.players.push({ id: a, ...JSON.parse(v) });
    else if (kind === "t") tokens[a] = v;
    else if (kind === "s") room.lastSeen[a] = Number(v);
    else if (kind === "l") room.left[a] = true;
    else if (kind === "m") room.moves[`${a}:${b}`] = v as Move;
    else if (kind === "rv") room.revealed[Number(a)] = true;
  }
  room.players.sort((x, y) => x.joinedAt - y.joinedAt || x.id.localeCompare(y.id));
  return { room, tokens };
}

async function load(ctx: Ctx, code: string) {
  const h = await ctx.store.getAll(key(code));
  return h ? parse(code, h) : null;
}

async function addPlayer(ctx: Ctx, code: string, name: string): Promise<Joined> {
  const playerId = randomId().slice(0, 10);
  const token = randomId();
  const now = ctx.now();
  // Numéro d'arrivée atomique : départage deux arrivées à la même milliseconde (ordre = administrateur suivant).
  const seq = await ctx.store.increment(key(code), "seq");
  await ctx.store.set(key(code), {
    [`p:${playerId}`]: JSON.stringify({ name: name.trim(), joinedAt: seq }),
    [`t:${token}`]: playerId,
    [`s:${playerId}`]: String(now),
  });
  return { ok: true, code: code.toUpperCase(), token, playerId };
}

export async function createRoom(ctx: Ctx, name: string): Promise<Joined | Fail> {
  if (!name.trim()) return { ok: false, error: "Saisissez votre prénom" };
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode(ctx.rng);
    // Réservation atomique du code : échoue si une salle porte déjà ce code.
    if (await ctx.store.setIfAbsent(key(code), "createdAt", String(ctx.now()))) {
      await ctx.store.expire(key(code), ROOM_TTL_SECONDS);
      return addPlayer(ctx, code, name);
    }
  }
  return { ok: false, error: "Impossible de créer une salle, réessayez" };
}

export async function joinRoom(ctx: Ctx, code: string, name: string): Promise<Joined | Fail> {
  const loaded = await load(ctx, code);
  if (!loaded) return { ok: false, error: "Salle introuvable" };
  const refusal = canJoin(loaded.room, name, ctx.now());
  if (refusal) return { ok: false, error: refusal };
  return addPlayer(ctx, code, name);
}

/** Retrouve la salle et le joueur à partir de son jeton secret. */
async function identify(ctx: Ctx, code: string, token: string) {
  const loaded = await load(ctx, code);
  if (!loaded) return { ok: false as const, error: "Salle introuvable" };
  const playerId = loaded.tokens[token];
  if (!playerId) return { ok: false as const, error: "Joueur inconnu dans cette salle" };
  return { ok: true as const, room: loaded.room, playerId };
}

/** Lecture de l'état, appelée toutes les 2 s : marque aussi le joueur comme présent. */
export async function getView(ctx: Ctx, code: string, token: string): Promise<{ ok: true; view: PlayerView } | Fail> {
  const id = await identify(ctx, code, token);
  if (!id.ok) return id;
  const { room, playerId } = id;
  const now = ctx.now();
  room.lastSeen[playerId] = now;
  const writes: Record<string, string> = { [`s:${playerId}`]: String(now) };
  // Une manche révélée est marquée pour le rester (même si un joueur parti revient).
  if (isRevealed(room, now) && !room.revealed?.[room.round]) writes[`rv:${room.round}`] = "1";
  await ctx.store.set(key(code), writes);
  return { ok: true, view: viewFor(room, playerId, now) };
}

export async function startGame(ctx: Ctx, code: string, token: string): Promise<{ ok: true } | Fail> {
  const id = await identify(ctx, code, token);
  if (!id.ok) return id;
  const refusal = canStart(id.room, id.playerId, ctx.now());
  if (refusal) return { ok: false, error: refusal };
  await ctx.store.set(key(code), { modifiers: JSON.stringify(drawModifiers(10, ctx.rng)), round: "0" });
  await ctx.store.setIfAbsent(key(code), "started", "1");
  return { ok: true };
}

export async function playMove(ctx: Ctx, code: string, token: string, move: string): Promise<{ ok: true } | Fail> {
  if (!MOVES.includes(move as Move)) return { ok: false, error: "Coup inconnu" };
  const id = await identify(ctx, code, token);
  if (!id.ok) return id;
  const refusal = canPlay(id.room, id.playerId, ctx.now());
  if (refusal) return { ok: false, error: refusal };
  const written = await ctx.store.setIfAbsent(key(code), `m:${id.room.round}:${id.playerId}`, move);
  return written ? { ok: true } : { ok: false, error: "Coup déjà joué" };
}

export async function advanceRound(ctx: Ctx, code: string, token: string): Promise<{ ok: true } | Fail> {
  const id = await identify(ctx, code, token);
  if (!id.ok) return id;
  const refusal = canAdvance(id.room, id.playerId, ctx.now());
  if (refusal) return { ok: false, error: refusal };
  const r = id.room.round;
  // Un double clic n'avance qu'une fois : seul le premier pose le verrou de la manche.
  if (!(await ctx.store.setIfAbsent(key(code), `adv:${r}`, "1"))) return { ok: true };
  await ctx.store.set(key(code), r + 1 >= 10 ? { over: "1" } : { round: String(r + 1) });
  return { ok: true };
}

export async function leaveRoom(ctx: Ctx, code: string, token: string): Promise<{ ok: true } | Fail> {
  const id = await identify(ctx, code, token);
  if (!id.ok) return id;
  await ctx.store.set(key(code), { [`l:${id.playerId}`]: "1" });
  return { ok: true };
}
