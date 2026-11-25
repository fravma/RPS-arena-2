import { describe, expect, it } from "vitest";
import { scoreRound, type Move, type RoundMoves } from "./engine";

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
