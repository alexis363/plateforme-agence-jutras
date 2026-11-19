import { z } from "zod";
import { membreConnecte } from "@/lib/session.ts";
import { adminMajReference, adminSupprimerReference } from "@/lib/depot.ts";
import { ETAPES } from "@/lib/regles.ts";

const Schema = z.object({
  etape: z.number().int().min(1).max(6).optional(),
  fermee: z.string().trim().min(1).max(200).nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await membreConnecte();
  if (admin?.role !== "admin") return Response.json({ erreur: "Réservé à la console" }, { status: 403 });
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Données invalides" }, { status: 400 });
  const { id } = await params;
  // L'historique est visible par le membre : il ne reçoit que l'étape, jamais les notes ni la raison exacte.
  const quoi = d.data.etape ? ETAPES[d.data.etape - 1] : d.data.fermee ? "Référence fermée" : d.data.fermee === null ? "Référence rouverte" : undefined;
  const r = await adminMajReference(id, { ...d.data, quoi });
  return r ? Response.json({ ok: true }) : Response.json({ erreur: "Introuvable" }, { status: 404 });
}

// Supprimer une référence : la console seulement, et seulement une référence déjà fermée.
// Trois confirmations dans la page ; ici, on revérifie le mot SUPPRIMER.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await membreConnecte();
  if (admin?.role !== "admin") return Response.json({ erreur: "Réservé à la console" }, { status: 403 });
  const d = z.object({ confirmation: z.string().max(40) }).safeParse(await req.json().catch(() => null));
  if (!d.success || d.data.confirmation.trim().toUpperCase() !== "SUPPRIMER")
    return Response.json({ erreur: "Écrivez SUPPRIMER pour confirmer." }, { status: 400 });
  const resultat = await adminSupprimerReference((await params).id);
  if (resultat === "introuvable") return Response.json({ erreur: "Cette référence n'existe plus." }, { status: 404 });
  if (resultat === "ouverte") return Response.json({ erreur: "Fermez la référence avant de la supprimer." }, { status: 409 });
  return Response.json({ ok: true });
}
