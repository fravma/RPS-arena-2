// Affichage des nombres : l'arrondi se fait ici, jamais dans le moteur (décision T0).

function round2(x: number): number {
  const r = Math.round(x * 100) / 100;
  return r === 0 ? 0 : r; // évite « -0 »
}

/** Format français, 2 décimales au plus, signe moins en tiret simple. */
function fr(x: number): string {
  return round2(x).toString().replace(".", ",");
}

export function formatPoints(x: number): string {
  return fr(x);
}

export function formatModifier(x: number): string {
  return x > 0 ? `+${fr(x)}` : fr(x);
}
