import { z } from "zod";
import { creerMembre, membreParCourriel, normaliserCourriel } from "@/lib/depot.ts";
import { envoyerCourriel, adresseApp } from "@/lib/courriel.ts";
import { estCourrielAdmin, ouvrirSession } from "@/lib/session.ts";
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

// Plus de vérification du courriel (décision d'Alexis du 23 nov. 2026) : le compte et le lien s'activent tout de
// suite, et la session s'ouvre. Un courriel déjà inscrit ne donne jamais accès au compte existant.
export async function POST(req: Request) {
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: `Vérifiez les champs : tous sont requis, le mot de passe a au moins ${LONGUEUR_MIN} caractères et les règles doivent être acceptées.` }, { status: 400 });

  if (await membreParCourriel(normaliserCourriel(d.data.courriel)))
    return Response.json({ erreur: "Un compte existe déjà avec ce courriel. Connectez-vous, ou choisissez « Mot de passe oublié »." }, { status: 409 });

  const hache = await hacherMotDePasse(d.data.motDePasse);
  const m = await creerMembre({ ...d.data, motDePasse: hache }, estCourrielAdmin(d.data.courriel) ? "admin" : "membre");
  await ouvrirSession(m);

  // Un mot de bienvenue, pour qu'il retrouve son lien. S'il ne part pas, l'inscription reste bonne.
  await envoyerCourriel({
    a: m.courriel,
    sujet: "Bienvenue dans le programme ambassadeur Kairos",
    texte: `Bonjour ${m.prenom}, ton compte est prêt. Ton lien personnel t'attend dans ton espace : partage-le à un entrepreneur qui passe ses soirées dans la paperasse. Ce courriel servira aussi à te verser tes récompenses par virement Interac.`,
    lien: `${adresseApp()}/compte`,
    kairos: true,
    bouton: "Voir mon lien",
  }).catch(() => undefined);

  return Response.json({ vers: m.role === "admin" ? "/admin" : "/compte" });
}
