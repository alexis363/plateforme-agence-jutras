import { creerRdvSite } from "@/lib/depot.ts";
import { plageEncoreLibre, creerRendezVous, momentTexte } from "@/lib/agenda.ts";
import { reponse, preflight } from "@/lib/cors.ts";
import { lireDemande, MESSAGE_INVALIDE } from "@/lib/demande.ts";

// Le formulaire de réservation du site web (demande d'Alexis du 18 nov. 2026) : le même que sur les pages de
// référence, sans ambassadeur. Le rendez-vous est créé dans l'agenda Google d'Alexis.
export async function POST(req: Request) {
  const d = lireDemande(await req.json().catch(() => null));
  if (!d) return reponse(req, { erreur: MESSAGE_INVALIDE }, 400);
  const { debut, coordonnees } = d;

  if (!debut) {
    await creerRdvSite({ ...coordonnees, moment: "Aucune plage libre : à rappeler pour fixer un moment", rendezVous: null, evenementId: null });
    return reponse(req, { ok: true, moment: null });
  }

  if (!(await plageEncoreLibre(debut).catch(() => false)))
    return reponse(req, { erreur: "Cette plage vient d'être prise ou n'est plus disponible. Choisissez-en une autre.", plagePrise: true }, 409);

  const moment = momentTexte(debut);
  let evenementId: string | null = null;
  try {
    evenementId = await creerRendezVous({ ...coordonnees, debut, ambassadeur: null });
  } catch {
    await creerRdvSite({ ...coordonnees, moment: `Souhaitait ${moment} (non réservé : l'agenda a refusé)`, rendezVous: null, evenementId: null });
    return reponse(req, { erreur: "Votre demande est reçue, mais la plage n'a pas pu être réservée. Je vous contacte pour fixer le moment." }, 502);
  }
  await creerRdvSite({ ...coordonnees, moment, rendezVous: debut, evenementId });
  return reponse(req, { ok: true, moment });
}

export const OPTIONS = preflight;
