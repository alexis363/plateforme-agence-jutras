import { z } from "zod";
import { creerMembre, creerJeton } from "@/lib/depot.ts";
import { envoyerCourriel, adresseApp } from "@/lib/courriel.ts";
import { estCourrielAdmin } from "@/lib/session.ts";
import { hacherMotDePasse, LONGUEUR_MIN } from "@/lib/motdepasse.ts";

const Schema = z.object({
  prenom: z.string().trim().min(1).max(60),
  nom: z.string().trim().min(1).max(60),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  courriel: z.email().max(120),
  motDePasse: z.string().min(LONGUEUR_MIN).max(200),
  accepteRegles: z.literal(true),
  prenomVisible: z.boolean(),
});

export async function POST(req: Request) {
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: `Vérifiez les champs : tous sont requis, le mot de passe a au moins ${LONGUEUR_MIN} caractères et les règles doivent être acceptées.` }, { status: 400 });

  const hache = await hacherMotDePasse(d.data.motDePasse);
  const m = await creerMembre({ ...d.data, motDePasse: hache }, estCourrielAdmin(d.data.courriel) ? "admin" : "membre");

  // Même réponse que le courriel soit nouveau ou déjà inscrit : la page ne révèle pas qui est membre.
  // Le courriel, lui, dit la vérité à son propriétaire.
  if (m.confirme) {
    await envoyerCourriel({
      a: m.courriel,
      sujet: "Vous avez déjà un compte",
      texte: `Bonjour ${m.prenom}, quelqu'un (sans doute vous) a voulu créer un compte avec ce courriel, mais vous en avez déjà un. Connectez-vous avec votre mot de passe, ou choisissez « Mot de passe oublié » si vous ne vous en souvenez plus.`,
      lien: `${adresseApp()}/connexion`,
    });
  } else {
    const jeton = await creerJeton(m.id, "confirmer");
    await envoyerCourriel({
      a: m.courriel,
      sujet: "Confirmez votre courriel pour activer votre lien",
      texte: `Bonjour ${m.prenom}, merci de vous joindre au programme ambassadeur Kairos de l'Agence Jutras. Confirmez votre courriel pour activer votre lien personnel. Ce courriel servira aussi à vous verser vos récompenses par virement Interac.`,
      lien: `${adresseApp()}/api/verifier?jeton=${jeton}`,
      kairos: true,
      bouton: "Confirmer mon courriel",
    });
  }
  return Response.json({ ok: true });
}
