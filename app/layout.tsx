import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "RPS Arena",
  description: "Pierre-Feuille-Ciseaux où la minorité gagne",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
