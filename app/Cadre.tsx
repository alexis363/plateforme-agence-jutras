import Link from "next/link";
import Marque from "./Marque.tsx";
import Navigation, { Icone, type Entree } from "./Navigation.tsx";
import type { Membre } from "@/lib/types.ts";

// L'en-tête et le menu de côté, communs à l'espace membre et à la console.
export default function Cadre({ membre, etiquette, entrees, pied, children }: {
  membre: Membre; etiquette: string; entrees: Entree[]; pied?: React.ReactNode; children: React.ReactNode;
}) {
  const initiales = `${membre.prenom[0] ?? ""}${membre.nom[0] ?? ""}`.toUpperCase();
  const console_ = etiquette === "Console";
  // Sur téléphone, l'en-tête cache ces liens : ils passent au bas du menu (demande d'Alexis du 19 nov. 2026).
  const basMobile = (
    <div className="menu-bas-mobile">
      {membre.role === "admin" && (
        <Link href={console_ ? "/compte" : "/admin"}>
          <Icone nom={console_ ? "personne" : "reglages"} />{console_ ? "Passer à l'espace membre" : "Passer à la console"}
        </Link>
      )}
      <form action="/api/deconnexion" method="post"><button>Se déconnecter</button></form>
    </div>
  );
  return (
    <>
      <header className="haut">
        <Link href="/" style={{ textDecoration: "none" }}><Marque etiquette={etiquette} /></Link>
        <div className="compte">
          {membre.role === "admin" && (
            <Link className="sortir" href={etiquette === "Console" ? "/compte" : "/admin"} style={{ textDecoration: "none" }}>
              {etiquette === "Console" ? "Mon compte" : "Console"}
            </Link>
          )}
          <span className="avatar">{initiales}</span>
          <span className="nom">{membre.prenom} {membre.nom}</span>
          <form action="/api/deconnexion" method="post"><button className="sortir">Se déconnecter</button></form>
          <button className="menu-mobile" aria-label="Ouvrir le menu">Menu</button>
        </div>
      </header>
      <div className="cadre">
        <Navigation entrees={entrees} pied={<>{pied}{basMobile}</>} />
        <main>{children}</main>
      </div>
    </>
  );
}
