"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// kairos : une entrée du programme ambassadeur Kairos (titre de groupe et onglet actif en olive, 20 nov. 2026).
export type Entree = { href: string; texte: string; icone: string; groupe?: string; bientot?: boolean; nb?: number; kairos?: boolean };

const ICONES: Record<string, string> = {
  accueil: "M4 11 12 4l8 7v9h-5v-6H9v6H4Z",
  lien: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  doc: "M6 3h9l4 4v14H6ZM9 12h7M9 16h5",
  grille: "M4 4h7v7H4ZM13 4h7v7h-7ZM4 13h7v7H4ZM13 13h7v7h-7Z",
  personne: "M8 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0",
  soleil: "M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 2v2M12 20v2M2 12h2M20 12h2",
  groupe: "M5.5 8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6",
  calendrier: "M4 5h16v16H4ZM4 10h16M9 3v4M15 3v4",
  etoile: "m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7Z",
  facture: "M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 8h6M9 12h6",
  bulle: "M4 5h16v11H9l-5 4Z",
  reglages: "M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4",
};

export function Icone({ nom }: { nom: string }) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={ICONES[nom]} /></svg>;
}

// Menu de côté, partagé par l'espace membre et la console. Sur téléphone, le bouton « Menu » l'ouvre.
export default function Navigation({ entrees, pied }: { entrees: Entree[]; pied?: React.ReactNode }) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => setOuvert(false), [chemin]);
  useEffect(() => {
    const bouton = document.querySelector<HTMLButtonElement>(".menu-mobile");
    const basculer = () => setOuvert((o) => !o);
    bouton?.addEventListener("click", basculer);
    return () => bouton?.removeEventListener("click", basculer);
  }, []);

  const actif = (href: string) => chemin === href || (href.split("/").length > 2 && chemin.startsWith(href + "/"));
  let groupe: string | undefined;
  return (
    <nav className={`cote${ouvert ? " ouvert" : ""}`} aria-label="Menu">
      {entrees.map((e) => {
        const titre = e.groupe && e.groupe !== groupe ? <div className={`groupe${e.kairos ? " kairos" : ""}`}>{e.groupe}</div> : null;
        groupe = e.groupe;
        return (
          <span key={e.href} style={{ display: "contents" }}>
            {titre}
            <Link href={e.href} className={`${actif(e.href) ? "actif" : ""}${e.bientot ? " bientot" : ""}${e.kairos ? " kairos" : ""}`} aria-disabled={e.bientot}>
              <Icone nom={e.icone} />{e.texte}
              {e.bientot ? <small>Bientôt</small> : e.nb ? <span className="nb">{e.nb}</span> : null}
            </Link>
          </span>
        );
      })}
      {pied}
    </nav>
  );
}
