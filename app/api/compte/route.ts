import { z } from "zod";
import { membreConnecte, fermerSession } from "@/lib/session.ts";
import { supprimerMembre, estBloque, noterEchec } from "@/lib/depot.ts";
import { verifierMotDePasse } from "@/lib/motdepasse.ts";

const MOT_SUPPRESSION = "SUPPRIMER";

// Le membre supprime son propre compte (demande d'Alexis du 18 nov. 2026). Trois confirmations dans la page ;
// ici, on revérifie les deux qui comptent : le mot écrit à la main et le mot de passe.
export async function DELETE(req: Request) {
  const m = await membreConnecte();
  if (!m) return Response.json({ erreur: "Connexion requise" }, { status: 401 });
  if (m.role === "admin") return Response.json({ erreur: "Le compte de la console ne se supprime pas d'ici." }, { status: 403 });
  const d = z.object({ motDePasse: z.string().min(1).max(200), confirmation: z.string().max(40) }).safeParse(await req.json().catch(() => null));
  if (!d.success || d.data.confirmation.trim().toUpperCase() !== MOT_SUPPRESSION)
    return Response.json({ erreur: `Écrivez ${MOT_SUPPRESSION} pour confirmer.` }, { status: 400 });
  if (await estBloque(m.courriel)) return Response.json({ erreur: "Trop d'essais. Réessayez dans 15 minutes." }, { status: 429 });
  if (!(await verifierMotDePasse(d.data.motDePasse, m.motDePasse))) {
    await noterEchec(m.courriel);
    return Response.json({ erreur: "Le mot de passe n'est pas le bon." }, { status: 400 });
  }
  await supprimerMembre(m.id);
  await fermerSession();
  return Response.json({ ok: true });
}
