import { z } from "zod";
import { membreParCourriel, creerJeton, normaliserCourriel } from "@/lib/depot.ts";
import { envoyerCourriel, adresseApp } from "@/lib/courriel.ts";
import { ouvrirSession, estCourrielAdmin } from "@/lib/session.ts";
import { verifierMotDePasse, estBloque, noterEchec, effacerEchecs } from "@/lib/motdepasse.ts";

const MAUVAIS = "Courriel ou mot de passe incorrect.";

// Connexion par courriel et mot de passe, pour les membres comme pour la console (décision du 17 nov. 2026).
export async function POST(req: Request) {
  const d = z.object({ courriel: z.email(), motDePasse: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: MAUVAIS }, { status: 400 });
  const courriel = normaliserCourriel(d.data.courriel);

  if (estBloque(courriel)) return Response.json({ erreur: "Trop d'essais. Réessayez dans 15 minutes, ou choisissez « Mot de passe oublié »." }, { status: 429 });

  const m = await membreParCourriel(courriel);
  const bon = await verifierMotDePasse(d.data.motDePasse, m?.motDePasse ?? null);
  if (!m || !bon) {
    noterEchec(courriel);
    return Response.json({ erreur: MAUVAIS }, { status: 401 });
  }
  effacerEchecs(courriel);

  // Bon mot de passe, mais courriel jamais confirmé : on renvoie le lien de confirmation.
  if (!m.confirme) {
    const jeton = await creerJeton(m.id, "confirmer");
    await envoyerCourriel({
      a: m.courriel,
      sujet: "Confirmez votre courriel pour activer votre lien",
      texte: `Bonjour ${m.prenom}, confirmez votre courriel pour activer votre compte et votre lien personnel.`,
      lien: `${adresseApp()}/api/verifier?jeton=${jeton}`,
    });
    return Response.json({ erreur: "Confirmez d'abord votre courriel : on vient de vous renvoyer le lien." }, { status: 403 });
  }

  await ouvrirSession(m);
  return Response.json({ vers: estCourrielAdmin(m.courriel) ? "/admin" : "/compte" });
}
