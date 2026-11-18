import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon compte · Agence Jutras",
  description: "Le programme de référence et l'espace des membres de l'Agence Jutras.",
  robots: { index: false, follow: false },
};

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=DM+Sans:wght@300;400;500&family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Playfair+Display:ital,wght@1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
