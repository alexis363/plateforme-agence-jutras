import { z } from "zod";
import { membreConnecte } from "@/lib/session.ts";
import { membreParId, supprimerMembre } from "@/lib/depot.ts";

// La console supprime le compte d'un membre (demande d'Alexis du 18 nov. 2026). Trois confirmations dans la page ;
// ici, on revérifie que le courriel du membre a été écrit au complet. Un compte admin ne se supprime jamais.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await membreConnecte();
  if (admin?.role !== "admin") return Response.json({ erreur: "Réservé à la console" }, { status: 403 });
  const { id } = await params;
  const m = await membreParId(id);
  if (!m) return Response.json({ erreur: "Ce compte n'existe plus." }, { status: 404 });
  if (m.role === "admin") return Response.json({ erreur: "Un compte de la console ne se supprime pas." }, { status: 403 });
  const d = z.object({ confirmation: z.string().max(200) }).safeParse(await req.json().catch(() => null));
  if (!d.success || d.data.confirmation.trim().toLowerCase() !== m.courriel.toLowerCase())
    return Response.json({ erreur: "Écrivez le courriel du membre au complet pour confirmer." }, { status: 400 });
  await supprimerMembre(m.id);
  return Response.json({ ok: true });
}
