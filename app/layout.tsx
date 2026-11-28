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
          href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
