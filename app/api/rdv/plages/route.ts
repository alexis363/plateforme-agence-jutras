import { plagesLibres } from "@/lib/agenda.ts";
import { reponse, preflight } from "@/lib/cors.ts";

// Les plages libres d'Alexis (cette semaine et les 3 suivantes), pour le formulaire du site web.
// Rien de privé : seulement des heures libres.
export async function GET(req: Request) {
  try {
    return reponse(req, { jours: await plagesLibres() });
  } catch {
    return reponse(req, { erreur: "L'agenda ne répond pas pour l'instant." }, 502);
  }
}

export const OPTIONS = preflight;
