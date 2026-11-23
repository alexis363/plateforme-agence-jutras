import { z } from "zod";
import { membreParCourriel, confirmerMembre, normaliserCourriel, estBloque, noterEchec, effacerEchecs } from "@/lib/depot.ts";
import { ouvrirSession, estCourrielAdmin } from "@/lib/session.ts";
import { verifierMotDePasse } from "@/lib/motdepasse.ts";
import { amorcerAdmin } from "@/lib/amorce.ts";

const MAUVAIS = "Courriel ou mot de passe incorrect.";

// Connexion par courriel et mot de passe, pour les membres comme pour la console (décision du 17 nov. 2026).
export async function POST(req: Request) {
  const d = z.object({ courriel: z.email(), motDePasse: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: MAUVAIS }, { status: 400 });
  const courriel = normaliserCourriel(d.data.courriel);

  if (await estBloque(courriel)) return Response.json({ erreur: "Trop d'essais. Réessayez dans 15 minutes, ou choisissez « Mot de passe oublié »." }, { status: 429 });

  const m = await membreParCourriel(courriel);

  // Première connexion d'Alexis : son compte admin se crée à partir des réglages (lib/amorce.ts).
  if (!m) {
    const admin = await amorcerAdmin(courriel, d.data.motDePasse);
    if (admin) {
      await ouvrirSession(admin);
      return Response.json({ vers: "/admin" });
    }
  }

  const bon = await verifierMotDePasse(d.data.motDePasse, m?.motDePasse ?? null);
  if (!m || !bon) {
    await noterEchec(courriel);
    return Response.json({ erreur: MAUVAIS }, { status: 401 });
  }
  await effacerEchecs(courriel);

  // Un compte créé avant le 23 nov. 2026 et jamais confirmé : le bon mot de passe suffit maintenant.
  if (!m.confirme) await confirmerMembre(m.id);

  await ouvrirSession({ ...m, confirme: true });
  return Response.json({ vers: estCourrielAdmin(m.courriel) ? "/admin" : "/compte" });
}
