import { describe, expect, it } from "vitest";
import { pairsToObject } from "./hashStore";

describe("Lecture d'une salle depuis Redis", () => {
  it("liste [champ, valeur, ...] renvoyée par le client Upstash : convertie en objet", () => {
    expect(pairsToObject(["createdAt", "1", "t:abc", "p1"])).toEqual({ createdAt: "1", "t:abc": "p1" });
  });

  it("objet déjà formé : conservé, valeurs en texte", () => {
    expect(pairsToObject({ round: 2 })).toEqual({ round: "2" });
  });

  it("salle absente : null", () => {
    expect(pairsToObject(null)).toBeNull();
    expect(pairsToObject([])).toBeNull();
  });
});
