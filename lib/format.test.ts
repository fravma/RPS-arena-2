import { describe, expect, it } from "vitest";
import { formatModifier, formatPoints } from "./format";

describe("Tâche 3 - affichage des points (2 décimales au plus)", () => {
  it("Critère 3 - 0,6 / 0,67 / 3 / -0,5", () => {
    expect(formatPoints(0.6)).toBe("0,6");
    expect(formatPoints(2 / 3)).toBe("0,67");
    expect(formatPoints(3)).toBe("3");
    expect(formatPoints(-0.5)).toBe("-0,5");
  });

  it("Critère 3 - un total arrondi à zéro ne s'affiche pas « -0 »", () => {
    expect(formatPoints(-0.001)).toBe("0");
  });

  it("Critère 1 - modificateur affiché avec son signe : +0,5 / -0,5", () => {
    expect(formatModifier(0.5)).toBe("+0,5");
    expect(formatModifier(-0.5)).toBe("-0,5");
  });
});
