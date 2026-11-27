import { describe, expect, it } from "vitest";
import { scoreRound } from "./engine";
import { ME, chooseMove, gameTotals, gameWinners, nextRound, startGame, validate } from "./solo";

/** Hasard fixe et rejouable. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe("Tâche 1 - logique de partie", () => {
  it("Critère 1 - lancer : 5 joueurs (moi + 4 bots), manche 1, 10 modificateurs", () => {
    const g = startGame(seeded(1));
    expect(g.players).toEqual([ME, "Bot 1", "Bot 2", "Bot 3", "Bot 4"]);
    expect(g.round).toBe(0);
    expect(g.phase).toBe("choose");
    expect(g.modifiers).toHaveLength(10);
  });

  it("Critère 2 - je peux changer de coup avant de valider, aucun coup de bot n'existe encore", () => {
    let g = startGame(seeded(1));
    g = chooseMove(g, "rock");
    g = chooseMove(g, "paper");
    expect(g.myMove).toBe("paper");
    expect(g.history).toHaveLength(0);
  });

  it("Critère 2 - valider sans avoir choisi ne fait rien", () => {
    const g = startGame(seeded(1));
    expect(validate(g, seeded(2))).toBe(g);
  });

  it("Critère 3 - valider révèle la manche : tous les coups, points calculés par le moteur", () => {
    let g = chooseMove(startGame(seeded(1)), "scissors");
    g = validate(g, seeded(2));
    expect(g.phase).toBe("reveal");
    const r = g.history[0];
    expect(r.moves[ME]).toBe("scissors");
    for (const bot of ["Bot 1", "Bot 2", "Bot 3", "Bot 4"]) expect(r.moves[bot]).not.toBeNull();
    expect(r.points).toEqual(scoreRound(r.moves, g.modifiers[0]));
  });

  it("Critère 3 - après la révélation, on ne peut plus changer de coup", () => {
    let g = validate(chooseMove(startGame(seeded(1)), "rock"), seeded(2));
    g = chooseMove(g, "paper");
    expect(g.history[0].moves[ME]).toBe("rock");
  });

  it("Critère 5 - après 10 manches, la partie est terminée avec totaux et gagnant(s)", () => {
    let g = startGame(seeded(1));
    const rng = seeded(3);
    for (let i = 0; i < 10; i++) {
      g = nextRound(validate(chooseMove(g, "rock"), rng));
    }
    expect(g.phase).toBe("over");
    expect(g.history).toHaveLength(10);
    const t = gameTotals(g);
    const best = Math.max(...Object.values(t));
    for (const w of gameWinners(g)) expect(t[w]).toBeCloseTo(best);
  });

  it("Critère 6 - rejouer : nouvelle partie à la manche 1, totaux à 0, nouveaux modificateurs", () => {
    const first = startGame(seeded(1));
    const again = startGame(seeded(99));
    expect(again.round).toBe(0);
    expect(Object.values(gameTotals(again))).toEqual([0, 0, 0, 0, 0]);
    expect(again.modifiers).not.toEqual(first.modifiers);
  });
});
