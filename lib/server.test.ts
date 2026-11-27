import { describe, expect, it } from "vitest";
import { MemoryHashStore } from "./hashStore";
import { advanceRound, createRoom, getView, joinRoom, leaveRoom, playMove, startGame } from "./server";

/** Horloge contrôlée par le test. */
function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, tick: (ms: number) => (t += ms) };
}

async function setup(names = ["Matthieu", "Aziz", "Léa"]) {
  const store = new MemoryHashStore();
  const c = clock();
  const ctx = { store, now: c.now, rng: Math.random };
  const created = await createRoom(ctx, names[0]);
  if (!created.ok) throw new Error(created.error);
  const tokens = [created.token];
  for (const n of names.slice(1)) {
    const j = await joinRoom(ctx, created.code, n);
    if (!j.ok) throw new Error(j.error);
    tokens.push(j.token);
  }
  return { ctx, c, code: created.code, tokens };
}

describe("Tâche 3 - serveur (faux stockage en mémoire)", () => {
  it("Critère 1 et 2 - créer puis rejoindre : chacun voit la liste des joueurs", async () => {
    const { ctx, code, tokens } = await setup(["Matthieu", "Aziz"]);
    const v = await getView(ctx, code, tokens[1]);
    expect(v.ok && v.view.players.map((p) => p.name)).toEqual(["Matthieu", "Aziz"]);
  });

  it("Critère 2 - prénom déjà pris : refusé", async () => {
    const { ctx, code } = await setup(["Matthieu"]);
    expect(await joinRoom(ctx, code, "Matthieu")).toEqual({ ok: false, error: "Prénom déjà pris dans cette salle" });
  });

  it("Salle inconnue : message clair", async () => {
    const { ctx } = await setup(["Matthieu"]);
    expect(await joinRoom(ctx, "ZZZZ", "Aziz")).toEqual({ ok: false, error: "Salle introuvable" });
  });

  it("Jeton invalide : refusé", async () => {
    const { ctx, code } = await setup(["Matthieu"]);
    expect(await getView(ctx, code, "faux-jeton")).toEqual({ ok: false, error: "Joueur inconnu dans cette salle" });
  });

  it("Critères 4 à 7 - partie complète à 3 : lancer, jouer, révéler, avancer, classement", async () => {
    const { ctx, code, tokens } = await setup();
    expect((await startGame(ctx, code, tokens[1])).ok).toBe(false); // pas administrateur
    expect((await startGame(ctx, code, tokens[0])).ok).toBe(true);
    for (let r = 0; r < 10; r++) {
      await playMove(ctx, code, tokens[0], "paper");
      await playMove(ctx, code, tokens[1], "rock");
      const before = await getView(ctx, code, tokens[0]);
      expect(before.ok && before.view.phase).toBe("choose");
      await playMove(ctx, code, tokens[2], "rock");
      const after = await getView(ctx, code, tokens[1]);
      expect(after.ok && after.view.phase).toBe("reveal");
      expect((await advanceRound(ctx, code, tokens[0])).ok).toBe(true);
    }
    const end = await getView(ctx, code, tokens[2]);
    expect(end.ok && end.view.phase).toBe("over");
    expect(end.ok && end.view.winners.length).toBe(1);
  });

  it("Double clic sur « Manche suivante » : on n'avance que d'une manche", async () => {
    const { ctx, code, tokens } = await setup(["Matthieu", "Aziz"]);
    await startGame(ctx, code, tokens[0]);
    await playMove(ctx, code, tokens[0], "paper");
    await playMove(ctx, code, tokens[1], "rock");
    await Promise.all([advanceRound(ctx, code, tokens[0]), advanceRound(ctx, code, tokens[0])]);
    const v = await getView(ctx, code, tokens[0]);
    expect(v.ok && v.view.round).toBe(1);
  });

  it("Critère 9 - le créateur quitte : le suivant devient administrateur", async () => {
    const { ctx, code, tokens } = await setup(["Matthieu", "Aziz"]);
    await leaveRoom(ctx, code, tokens[0]);
    const v = await getView(ctx, code, tokens[1]);
    expect(v.ok && v.view.isAdmin).toBe(true);
  });

  it("Critère 9 - un joueur qui n'interroge plus depuis plus de 10 s est compté parti", async () => {
    const { ctx, c, code, tokens } = await setup(["Matthieu", "Aziz"]);
    c.tick(11_000);
    const v = await getView(ctx, code, tokens[1]);
    expect(v.ok && v.view.players.find((p) => p.name === "Matthieu")!.present).toBe(false);
    expect(v.ok && v.view.isAdmin).toBe(true);
  });

  it("Le jeton secret n'apparaît jamais dans la vue", async () => {
    const { ctx, code, tokens } = await setup(["Matthieu", "Aziz"]);
    const v = await getView(ctx, code, tokens[0]);
    expect(JSON.stringify(v)).not.toContain(tokens[1]);
  });
});
