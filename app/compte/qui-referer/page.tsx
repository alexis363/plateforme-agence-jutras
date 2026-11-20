import Paquet from "./Paquet.tsx";
import { exigerMembre } from "@/lib/session.ts";
import { lienReference } from "@/lib/courriel.ts";

// « Qui référer ? » : les métiers en cartes à faire glisser (Alexis, 19 nov. 2026, d'après la maquette
// « Maquette - Qui référer (cartes métiers).html »). Vers la droite : le message prêt à envoyer avec son lien.
export default async function QuiReferer() {
  const m = await exigerMembre();
  const lien = lienReference(m.slug);
  return (
    <>
      <h1 className="titre">Qui <em>référer</em> ?</h1>
      <p className="sous">Fais défiler les métiers. Tu penses à quelqu'un ? Glisse la carte vers la droite : ton message est prêt à envoyer avec ton lien.</p>
      <Paquet lien={lien.url} />
    </>
  );
}
