import { z } from "zod";
import { membrePublic, membreParId, creerReference } from "@/lib/depot.ts";
import { plageEncoreLibre, creerRendezVous, momentTexte } from "@/lib/agenda.ts";

const Schema = z.object({
  contact: z.string().trim().min(2).max(80),
  entreprise: z.string().trim().min(2).max(80),
  metier: z.string().trim().min(2).max(60),
  cellulaire: z.string().trim().regex(/^[\d\s().+-]{10,20}$/),
  courriel: z.union([z.literal(""), z.email().max(120)]),
  casseTete: z.string().trim().max(600),
  debut: z.iso.datetime().optional(), // absent seulement quand aucune plage n'est libre
});

// Un seul formulaire (exigence d'Alexis du 18 nov. 2026) : l'entrepreneur se présente ET choisit sa plage.
// La demande est attribuée au membre du lien, et le rendez-vous est créé dans l'agenda Google d'Alexis.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = await membrePublic(slug);
  if (!pub) return Response.json({ erreur: "Ce lien n'est pas actif." }, { status: 404 });
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Vérifiez vos coordonnées et choisissez une plage : le nom, l'entreprise, le métier et le cellulaire sont requis." }, { status: 400 });
  const { debut, ...coordonnees } = d.data;

  if (!debut) {
    await creerReference(pub.id, { ...coordonnees, moment: "Aucune plage libre : à rappeler pour fixer un moment", rendezVous: null, evenementId: null });
    return Response.json({ ok: true, moment: null });
  }

  if (!(await plageEncoreLibre(debut).catch(() => false)))
    return Response.json({ erreur: "Cette plage vient d'être prise ou n'est plus disponible. Choisissez-en une autre.", plagePrise: true }, { status: 409 });

  const membre = await membreParId(pub.id);
  const moment = momentTexte(debut);
  let evenementId: string | null = null;
  try {
    evenementId = await creerRendezVous({ ...coordonnees, debut, ambassadeur: `${membre?.prenom ?? ""} ${membre?.nom ?? ""}`.trim() });
  } catch {
    // L'agenda a refusé : la demande est gardée quand même (attribution), et Alexis rappelle pour fixer le moment.
    await creerReference(pub.id, { ...coordonnees, moment: `Souhaitait ${moment} (non réservé : l'agenda a refusé)`, rendezVous: null, evenementId: null });
    return Response.json({ erreur: "Votre demande est reçue, mais la plage n'a pas pu être réservée. Je vous appelle pour fixer le moment." }, { status: 502 });
  }
  await creerReference(pub.id, { ...coordonnees, moment, rendezVous: debut, evenementId });
  return Response.json({ ok: true, moment });
}
