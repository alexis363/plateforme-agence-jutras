import Cadre from "../Cadre.tsx";
import { exigerMembre } from "@/lib/session.ts";

export const dynamic = "force-dynamic";

export default async function EspaceMembre({ children }: { children: React.ReactNode }) {
  const m = await exigerMembre();
  return (
    <Cadre
      membre={m}
      etiquette="Mon compte"
      entrees={[
        { href: "/compte", texte: "Accueil", icone: "accueil" },
        { href: "/compte/references", texte: "Mes références", icone: "lien" },
        { href: "/compte/regles", texte: "Les règles", icone: "doc" },
        { href: "/compte/services", texte: "Nos services", icone: "grille" },
        { href: "/compte/profil", texte: "Mon profil", icone: "personne" },
      ]}
      pied={<div className="statut-compte"><b>Ambassadeur du programme de référence</b>Votre espace client s'ouvrira dès que vous achèterez un service.</div>}
    >
      {children}
    </Cadre>
  );
}
