import { z } from "zod";
import { consommerJeton, effacerEchecs } from "@/lib/depot.ts";
import { ouvrirSession, estCourrielAdmin } from "@/lib/session.ts";
import { hacherMotDePasse, LONGUEUR_MIN } from "@/lib/motdepasse.ts";

export async function POST(req: Request) {
  const d = z.object({ jeton: z.string().min(20).max(100), motDePasse: z.string().min(LONGUEUR_MIN).max(200) }).safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: `Le mot de passe doit avoir au moins ${LONGUEUR_MIN} caractères.` }, { status: 400 });
  const m = await consommerJeton(d.data.jeton, "reinitialiser", await hacherMotDePasse(d.data.motDePasse));
  if (!m) return Response.json({ erreur: "Ce lien est expiré ou déjà utilisé. Demandez-en un nouveau." }, { status: 400 });
  await effacerEchecs(m.courriel);
  await ouvrirSession(m);
  return Response.json({ vers: estCourrielAdmin(m.courriel) ? "/admin" : "/compte" });
}
