import Cadre from "../Cadre.tsx";
import { exigerMembre } from "@/lib/session.ts";

export const dynamic = "force-dynamic";
// Le programme porte sur Kairos : son nom partout, y compris dans l'onglet du navigateur (20 nov. 2026).
export const metadata = { title: "Programme ambassadeur Kairos · Agence Jutras" };

export default async function EspaceMembre({ children }: { children: React.ReactNode }) {
  const m = await exigerMembre();
  return (
    <Cadre
      membre={m}
      etiquette="Mon compte"
      entrees={[
        { href: "/compte", texte: "Accueil", icone: "accueil", groupe: "Ambassadeur Kairos", kairos: true },
        { href: "/compte/references", texte: "Mes références", icone: "lien", groupe: "Ambassadeur Kairos", kairos: true },
        { href: "/compte/qui-referer", texte: "Qui référer ?", icone: "etoile", groupe: "Ambassadeur Kairos", kairos: true },
        { href: "/compte/regles", texte: "Les règles", icone: "doc", groupe: "Ambassadeur Kairos", kairos: true },
        { href: "/compte/services", texte: "Nos services", icone: "grille", groupe: "Mon compte", agence: true },
        { href: "/compte/profil", texte: "Mon profil", icone: "personne", groupe: "Mon compte", agence: true },
      ]}
      pied={<div className="statut-compte"><span className="badge-kairos"><b>Kairos</b>Ambassadeur</span>Votre espace client s'ouvrira dès que vous achèterez un service.</div>}
    >
      {children}
    </Cadre>
  );
}
