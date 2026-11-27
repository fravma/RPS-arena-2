// Éléments d'interface partagés par le mode solo et la salle.
import type { Move } from "@/lib/engine";

export const LABEL: Record<Move, string> = { rock: "Pierre", paper: "Feuille", scissors: "Ciseaux" };

export function MoveIcon({ move, size = 40 }: { move: Move; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 64 64", fill: "none", stroke: "#042332", strokeWidth: 3, "aria-hidden": true };
  if (move === "rock")
    return (
      <svg {...common} strokeLinejoin="round">
        <path d="M14 36c-2-10 6-20 18-21 9-1 18 4 19 14 2 11-5 20-17 20-11 0-18-5-20-13z" />
        <path d="M24 30c3-2 7-2 10 0" />
      </svg>
    );
  if (move === "paper")
    return (
      <svg {...common} strokeLinejoin="round">
        <path d="M16 8h22l10 10v38H16z" />
        <path d="M38 8v10h10" />
        <path d="M23 30h18M23 38h18M23 46h12" />
      </svg>
    );
  return (
    <svg {...common} strokeLinecap="round">
      <circle cx="18" cy="46" r="8" />
      <circle cx="46" cy="46" r="8" />
      <path d="M23 40L46 10M41 40L18 10" />
    </svg>
  );
}

export const RULE =
  "Points = joueurs battus ÷ joueurs ayant fait le même coup, plus le modificateur de la manche.";
