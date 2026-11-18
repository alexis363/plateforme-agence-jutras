import { z } from "zod";
import { membreConnecte } from "@/lib/session.ts";
import { changerMotDePasse } from "@/lib/depot.ts";
import { hacherMotDePasse, verifierMotDePasse, LONGUEUR_MIN } from "@/lib/motdepasse.ts";

// Changer son mot de passe depuis le profil : il faut l'actuel.
export async function PUT(req: Request) {
  const m = await membreConnecte();
  if (!m) return Response.json({ erreur: "Connexion requise" }, { status: 401 });
  const d = z.object({ actuel: z.string().min(1).max(200), nouveau: z.string().min(LONGUEUR_MIN).max(200) }).safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: `Le nouveau mot de passe doit avoir au moins ${LONGUEUR_MIN} caractères.` }, { status: 400 });
  if (!(await verifierMotDePasse(d.data.actuel, m.motDePasse))) return Response.json({ erreur: "Le mot de passe actuel n'est pas le bon." }, { status: 400 });
  await changerMotDePasse(m.id, await hacherMotDePasse(d.data.nouveau));
  return Response.json({ ok: true });
}
