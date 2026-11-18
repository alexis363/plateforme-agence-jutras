import { z } from "zod";
import { creerRdvSite } from "@/lib/depot.ts";
import { plageEncoreLibre, creerRendezVous, momentTexte } from "@/lib/agenda.ts";
import { reponse, preflight } from "@/lib/cors.ts";

const Schema = z.object({
  contact: z.string().trim().min(2).max(80),
  entreprise: z.string().trim().min(2).max(80),
  metier: z.string().trim().min(2).max(60),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  courriel: z.union([z.literal(""), z.email().max(120)]),
  casseTete: z.string().trim().max(600),
  debut: z.iso.datetime().optional(), // absent seulement quand aucune plage n'est libre
  site: z.string().max(0).optional(), // champ piège invisible : un robot le remplit, une personne non
});

// Le formulaire de réservation du site web (demande d'Alexis du 18 nov. 2026) : le même que sur les pages de
// référence, sans ambassadeur. Le rendez-vous est créé dans l'agenda Google d'Alexis.
export async function POST(req: Request) {
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return reponse(req, { erreur: "Vérifiez vos coordonnées et choisissez une plage : le nom, l'entreprise, le métier et le cellulaire sont requis." }, 400);
  const { debut, site: _piege, ...coordonnees } = d.data;

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
    return reponse(req, { erreur: "Votre demande est reçue, mais la plage n'a pas pu être réservée. Je vous appelle pour fixer le moment." }, 502);
  }
  await creerRdvSite({ ...coordonnees, moment, rendezVous: debut, evenementId });
  return reponse(req, { ok: true, moment });
}

export const OPTIONS = preflight;
