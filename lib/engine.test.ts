import { describe, expect, it } from "vitest";
import { drawModifiers, scoreRound, totals, winners, type Move, type RoundMoves } from "./engine";

/** Construit une manche : { rock: 1, scissors: 4 } donne rock0, scissors1..scissors4. */
function round(spec: Partial<Record<Move, number>>): RoundMoves {
  const out: RoundMoves = {};
  let i = 0;
  for (const [move, count] of Object.entries(spec))
    for (let k = 0; k < (count ?? 0); k++) out[`${move}${i++}`] = move as Move;
  return out;
}

describe("Tâche 1 - score d'une manche, cas standard", () => {
  it("Critère 1 - 1 Pierre contre 4 Ciseaux : la Pierre marque 4, chaque Ciseaux 0", () => {
    const s = scoreRound(round({ rock: 1, scissors: 4 }), null);
    expect(s.rock0).toBe(4);
    for (const p of ["scissors1", "scissors2", "scissors3", "scissors4"]) expect(s[p]).toBe(0);
  });

  it("Critère 2 - 4 Ciseaux contre 1 Feuille : chaque Ciseaux marque 0,25, la Feuille 0", () => {
    const s = scoreRound(round({ scissors: 4, paper: 1 }), null);
    for (const p of ["scissors0", "scissors1", "scissors2", "scissors3"]) expect(s[p]).toBe(0.25);
    expect(s.paper4).toBe(0);
  });

  it("Critère 3 - 10 joueurs, Feuille +0,5 : Pierre 0,60, Ciseaux 2/3, Feuille 3,00", () => {
    const s = scoreRound(round({ rock: 5, scissors: 3, paper: 2 }), { move: "paper", value: 0.5 });
    expect(s.rock0).toBeCloseTo(0.6);
    expect(s.scissors5).toBeCloseTo(2 / 3);
    expect(s.paper8).toBeCloseTo(3);
  });

  it("Critère 6 - un absent marque 0 et ne compte ni dans b ni dans n", () => {
    const s = scoreRound({ a: "rock", b: "scissors", absent: null }, null);
    expect(s.absent).toBe(0);
    expect(s.a).toBe(1); // b = 1 seul Ciseaux, l'absent n'est pas compté
  });
});

describe("Tâche 2 - cas limites du score", () => {
  it("Critère 4 - tout le monde joue pareil : personne ne marque, même avec le modificateur sur ce coup", () => {
    const s = scoreRound(round({ paper: 4 }), { move: "paper", value: 0.5 });
    expect(Object.values(s)).toEqual([0, 0, 0, 0]);
  });

  it("Critère 5 - modificateur en défaite : le perdant marque -0,5 (total négatif possible)", () => {
    const s = scoreRound({ a: "rock", b: "paper" }, { move: "rock", value: -0.5 });
    expect(s.a).toBe(-0.5);
    expect(s.b).toBe(1);
  });

  it("Cas limite - un seul joueur a joué, les autres absents : personne ne marque", () => {
    const s = scoreRound({ a: "rock", b: null, c: null }, { move: "rock", value: 0.5 });
    expect(s).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("Cas limite - modificateur sur un coup que personne n'a joué : aucun effet", () => {
    const s = scoreRound({ a: "rock", b: "scissors" }, { move: "paper", value: 0.5 });
    expect(s).toEqual({ a: 1, b: 0 });
  });
});

describe("Tâche 3 - fin de partie", () => {
  it("Critère 7 - le total est la somme des manches, une égalité en tête est partagée", () => {
    const t = totals([{ a: 1, b: 2, c: 0 }, { a: 2, b: 1, c: 0.5 }]);
    expect(t).toEqual({ a: 3, b: 3, c: 0.5 });
    expect(winners(t).sort()).toEqual(["a", "b"]);
  });

  it("Critère 7 - un seul meilleur total donne un seul gagnant", () => {
    expect(winners({ a: 3, b: 2.5 })).toEqual(["a"]);
  });

  it("Parade arrondis - mêmes points dans un ordre différent (2,5 contre 2,4999999999999996) : égalité", () => {
    const t = totals([
      { a: 2 / 3, b: 0.5 },
      { a: 2 / 3, b: 2 / 3 },
      { a: 2 / 3, b: 2 / 3 },
      { a: 0.5, b: 2 / 3 },
    ]);
    expect(t.a).not.toBe(t.b); // l'arrondi existe bien
    expect(winners(t).sort()).toEqual(["a", "b"]);
  });
});

/** Hasard fixe et rejouable (suite pseudo-aléatoire à partir d'une graine). */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe("Tâche 4 - tirage des modificateurs", () => {
  it("Critère 8 - 10 modificateurs, chacun vise un coup avec +0,5 ou -0,5", () => {
    const mods = drawModifiers();
    expect(mods).toHaveLength(10);
    for (const m of mods) {
      expect(["rock", "paper", "scissors"]).toContain(m.move);
      expect([0.5, -0.5]).toContain(m.value);
    }
  });

  it("Critère 8 - même hasard fixe, même tirage", () => {
    expect(drawModifiers(10, seeded(42))).toEqual(drawModifiers(10, seeded(42)));
  });
});
