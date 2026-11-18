import { z } from "zod";
import { membrePublic, creerReference } from "@/lib/depot.ts";

const Schema = z.object({
  contact: z.string().trim().min(2).max(80),
  entreprise: z.string().trim().min(2).max(80),
  metier: z.string().trim().min(2).max(60),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  courriel: z.union([z.literal(""), z.email().max(120)]),
  casseTete: z.string().trim().max(600),
  moment: z.string().trim().min(3).max(80),
});

// La demande remplie par l'entrepreneur lui-même, sur la page du lien. Elle est attribuée au membre du lien.
// Alexis la voit dans la console, à « Aujourd'hui » : c'est l'avis choisi le 17 nov. 2026.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await membrePublic(slug);
  if (!m) return Response.json({ erreur: "Ce lien n'est pas actif." }, { status: 404 });
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Vérifiez vos coordonnées : le nom, l'entreprise, le métier et le cellulaire sont requis." }, { status: 400 });
  await creerReference(m.id, d.data);
  return Response.json({ ok: true });
}
