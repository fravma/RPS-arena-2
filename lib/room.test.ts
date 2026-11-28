import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  MAX_PLAYERS,
  PRESENCE_TIMEOUT_MS,
  adminOf,
  canJoin,
  canStart,
  emptyRoom,
  generateCode,
  presentPlayers,
  canAdvance,
  canPlay,
  isRevealed,
  viewFor,
  type RoomData,
} from "./room";
import type { Modifier } from "./engine";

const T0 = 1_000_000;

/** Salle avec des joueurs arrivés dans l'ordre, tous vus à l'instant T0. */
function roomWith(names: string[], patch: Partial<RoomData> = {}): RoomData {
  const room = emptyRoom("KQZT", T0);
  names.forEach((name, i) => {
    const id = `p${i}`;
    room.players.push({ id, name, joinedAt: T0 + i });
    room.lastSeen[id] = T0;
  });
  return { ...room, ...patch };
}

describe("Tâche 1 - salle d'attente", () => {
  it("Critère 1 - code de 4 lettres, sans O, I, L ni U", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode();
      expect(code).toMatch(/^[A-Z]{4}$/);
      expect(code).not.toMatch(/[OILU]/);
    }
    expect(CODE_ALPHABET).not.toMatch(/[OILU]/);
  });

  it("Critère 2 - rejoindre une salle en attente : accepté", () => {
    expect(canJoin(roomWith(["Matthieu"]), "Aziz", T0)).toBeNull();
  });

  it("Critère 2 - prénom déjà pris (sans tenir compte des majuscules) : refusé", () => {
    expect(canJoin(roomWith(["Matthieu"]), "matthieu ", T0)).toBe("Prénom déjà pris dans cette salle");
  });

  it("Critère 2 - prénom vide : refusé", () => {
    expect(canJoin(roomWith(["Matthieu"]), "  ", T0)).toBe("Saisissez votre prénom");
  });

  it("Critère 3 - salle de 10 joueurs : le onzième voit « Salle pleine »", () => {
    const names = Array.from({ length: MAX_PLAYERS }, (_, i) => `J${i}`);
    expect(canJoin(roomWith(names), "Onzième", T0)).toBe("Salle pleine");
  });

  it("Critère 4 - un seul joueur : lancement refusé (2 joueurs minimum)", () => {
    expect(canStart(roomWith(["Matthieu"]), "p0", T0)).toBe("2 joueurs minimum");
  });

  it("Critère 4 - deux joueurs : seul l'administrateur peut lancer", () => {
    const room = roomWith(["Matthieu", "Aziz"]);
    expect(canStart(room, "p0", T0)).toBeNull();
    expect(canStart(room, "p1", T0)).toBe("Seul l'administrateur peut lancer la partie");
  });

  it("Critère 8 - partie déjà commencée : on ne peut plus rejoindre", () => {
    expect(canJoin(roomWith(["Matthieu", "Aziz"], { started: true }), "Léa", T0)).toBe("Partie déjà commencée");
  });

  it("Critère 9 - le créateur clique sur « Quitter » : le joueur arrivé ensuite devient administrateur", () => {
    const room = roomWith(["Matthieu", "Aziz", "Léa"], { left: { p0: true } });
    expect(adminOf(room, T0)).toBe("p1");
  });

  it("Critère 9 - le créateur n'est plus vu depuis plus de 10 s : l'administration passe au suivant", () => {
    const room = roomWith(["Matthieu", "Aziz"]);
    const later = T0 + PRESENCE_TIMEOUT_MS + 1;
    room.lastSeen.p1 = later;
    expect(adminOf(room, later)).toBe("p1");
    expect(presentPlayers(room, later).map((p) => p.id)).toEqual(["p1"]);
  });

  it("Critère 9 - un joueur parti libère sa place dans une salle pleine", () => {
    const names = Array.from({ length: MAX_PLAYERS }, (_, i) => `J${i}`);
    const room = roomWith(names, { left: { p3: true } });
    expect(canJoin(room, "Nouveau", T0)).toBeNull();
  });
});

const MODS: Modifier[] = Array.from({ length: 10 }, () => ({ move: "paper", value: 0.5 }));

/** Partie lancée à 3 joueurs (p0 administrateur), manche 1. */
function game(patch: Partial<RoomData> = {}): RoomData {
  return roomWith(["Matthieu", "Aziz", "Léa"], { started: true, modifiers: MODS, ...patch });
}

describe("Tâche 2 - partie", () => {
  it("Critère 5 - un joueur peut jouer une fois par manche", () => {
    const room = game();
    expect(canPlay(room, "p1", T0)).toBeNull();
    room.moves["0:p1"] = "rock";
    expect(canPlay(room, "p1", T0)).toBe("Coup déjà joué");
  });

  it("Critère 5 - les autres voient « a joué » mais pas le coup", () => {
    const room = game({ moves: { "0:p1": "rock" } });
    const v = viewFor(room, "p0", T0);
    const aziz = v.players.find((p) => p.id === "p1")!;
    expect(aziz.hasPlayed).toBe(true);
    expect(JSON.stringify(v)).not.toContain("rock");
    expect(viewFor(room, "p1", T0).myMove).toBe("rock");
  });

  it("Critère 6 - révélation automatique quand tous ont joué, points calculés par le moteur", () => {
    const room = game({ moves: { "0:p0": "paper", "0:p1": "rock", "0:p2": "rock" } });
    expect(isRevealed(room, T0)).toBe(true);
    const v = viewFor(room, "p2", T0);
    expect(v.phase).toBe("reveal");
    // Feuille bat 2 Pierre : 2 / 1 + 0,5 = 2,5 ; Pierre : 0
    expect(v.result!.points.p0).toBe(2.5);
    expect(v.result!.moves.p1).toBe("rock");
    expect(v.totals.p0).toBe(2.5);
  });

  it("Critère 6 - tant qu'un joueur présent n'a pas joué, pas de révélation", () => {
    const room = game({ moves: { "0:p0": "paper", "0:p1": "rock" } });
    expect(isRevealed(room, T0)).toBe(false);
    expect(viewFor(room, "p0", T0).phase).toBe("choose");
  });

  it("Critère 6 - une manche révélée le reste, même si un joueur parti revient", () => {
    const room = game({ moves: { "0:p0": "paper", "0:p1": "rock" }, revealed: { 0: true } });
    expect(isRevealed(room, T0)).toBe(true);
    expect(canPlay(room, "p2", T0)).toBe("Manche déjà révélée");
  });

  it("Critère 7 - seul l'administrateur passe à la manche suivante, après la révélation", () => {
    const room = game({ moves: { "0:p0": "paper", "0:p1": "rock", "0:p2": "rock" } });
    expect(canAdvance(room, "p0", T0)).toBeNull();
    expect(canAdvance(room, "p1", T0)).toBe("Seul l'administrateur peut passer à la manche suivante");
    expect(canAdvance(game(), "p0", T0)).toBe("La manche n'est pas encore révélée");
  });

  it("Critère 7 - après la manche 10, même classement final pour tous", () => {
    const moves: Record<string, "rock" | "paper"> = {};
    for (let r = 0; r < 10; r++) {
      moves[`${r}:p0`] = "paper";
      moves[`${r}:p1`] = "rock";
      moves[`${r}:p2`] = "rock";
    }
    const room = game({ moves, round: 9, over: true });
    const a = viewFor(room, "p0", T0);
    const b = viewFor(room, "p1", T0);
    expect(a.phase).toBe("over");
    expect(a.totals).toEqual(b.totals);
    expect(a.totals.p0).toBeCloseTo(25);
    expect(a.winners).toEqual(["p0"]);
  });

  it("Critère 9 - un joueur parti ne bloque pas la révélation et marque 0 pour la manche", () => {
    const room = game({ moves: { "0:p0": "paper", "0:p1": "rock" }, left: { p2: true } });
    expect(isRevealed(room, T0)).toBe(true);
    expect(viewFor(room, "p0", T0).result!.points.p2).toBe(0);
  });

  it("Critère 9 - l'administrateur parti, le suivant peut faire avancer", () => {
    const room = game({ moves: { "0:p1": "paper", "0:p2": "rock" }, left: { p0: true } });
    expect(canAdvance(room, "p1", T0)).toBeNull();
    expect(viewFor(room, "p1", T0).isAdmin).toBe(true);
  });
});
