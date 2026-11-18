import { z } from "zod";
import { membreConnecte } from "@/lib/session.ts";
import { majProfil } from "@/lib/depot.ts";

const Schema = z.object({
  prenom: z.string().trim().min(1).max(60),
  nom: z.string().trim().min(1).max(60),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  prenomVisible: z.boolean(),
});

// Le membre ne modifie que son propre profil : l'identifiant vient de la session.
export async function PUT(req: Request) {
  const m = await membreConnecte();
  if (!m) return Response.json({ erreur: "Connexion requise" }, { status: 401 });
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Champs invalides" }, { status: 400 });
  await majProfil(m.id, d.data);
  return Response.json({ ok: true });
}
