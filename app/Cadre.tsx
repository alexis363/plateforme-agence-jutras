import Link from "next/link";
import Marque from "./Marque.tsx";
import Navigation, { type Entree } from "./Navigation.tsx";
import type { Membre } from "@/lib/types.ts";

// L'en-tête et le menu de côté, communs à l'espace membre et à la console.
export default function Cadre({ membre, etiquette, entrees, pied, children }: {
  membre: Membre; etiquette: string; entrees: Entree[]; pied?: React.ReactNode; children: React.ReactNode;
}) {
  const initiales = `${membre.prenom[0] ?? ""}${membre.nom[0] ?? ""}`.toUpperCase();
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
        <Navigation entrees={entrees} pied={pied} />
        <main>{children}</main>
      </div>
    </>
  );
}
