import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "RPS Arena",
  description: "Pierre-Feuille-Ciseaux où la minorité gagne",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
