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
  type RoomData,
} from "./room";

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
