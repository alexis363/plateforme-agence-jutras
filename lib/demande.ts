import { z } from "zod";

// Le formulaire de rendez-vous, commun aux pages de référence et au site web.
// Depuis le 18 nov. 2026 (demande d'Alexis) : prénom et nom séparés, plus de métier.
// « contact » et « metier » restent acceptés le temps que les anciennes pages ouvertes se rechargent.
const Schema = z.object({
  prenom: z.string().trim().max(40).optional(),
  nom: z.string().trim().max(40).optional(),
  contact: z.string().trim().max(80).optional(),
  entreprise: z.string().trim().min(2).max(80),
  metier: z.string().trim().max(60).optional(),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  courriel: z.union([z.literal(""), z.email().max(120)]),
  casseTete: z.string().trim().max(600),
  debut: z.iso.datetime().optional(), // absent seulement quand aucune plage n'est libre
  site: z.string().max(0).optional(), // champ piège invisible : un robot le remplit, une personne non
});

export const MESSAGE_INVALIDE = "Vérifiez vos coordonnées et choisissez une plage : le prénom, le nom, l'entreprise et le cellulaire sont requis.";

export type Coordonnees = { contact: string; entreprise: string; metier: string; cellulaire: string; courriel: string; casseTete: string };

export function lireDemande(corps: unknown): { coordonnees: Coordonnees; debut?: string } | null {
  const d = Schema.safeParse(corps);
  if (!d.success) return null;
  const { prenom, nom, contact, entreprise, metier, cellulaire, courriel, casseTete, debut } = d.data;
  const nomComplet = prenom !== undefined || nom !== undefined
    ? (prenom && nom ? `${prenom} ${nom}` : "")
    : (contact ?? "");
  if (nomComplet.length < 3) return null;
  return { coordonnees: { contact: nomComplet, entreprise, metier: metier ?? "", cellulaire, courriel, casseTete }, debut };
}
