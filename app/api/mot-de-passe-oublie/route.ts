import { z } from "zod";
import { membreParCourriel, creerJeton } from "@/lib/depot.ts";
import { envoyerCourriel, adresseApp } from "@/lib/courriel.ts";

// Envoie un lien pour choisir un nouveau mot de passe. Réponse identique qu'un compte existe ou non.
export async function POST(req: Request) {
  const d = z.object({ courriel: z.email() }).safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Entrez une adresse courriel valide." }, { status: 400 });
  const m = await membreParCourriel(d.data.courriel);
  if (m) {
    const jeton = await creerJeton(m.id, "reinitialiser");
    await envoyerCourriel({
      a: m.courriel,
      sujet: "Choisir un nouveau mot de passe",
      texte: `Bonjour ${m.prenom}, voici le lien pour choisir un nouveau mot de passe. Il est valide 30 minutes. Si vous n'avez rien demandé, ignorez ce courriel : votre mot de passe actuel reste le même.`,
      lien: `${adresseApp()}/reinitialiser?jeton=${jeton}`,
    });
  }
  return Response.json({ ok: true });
}
