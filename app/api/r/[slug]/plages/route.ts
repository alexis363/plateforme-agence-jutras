import { membrePublic } from "@/lib/depot.ts";
import { plagesLibres } from "@/lib/agenda.ts";

// Les plages libres d'Alexis, cette semaine et les 3 suivantes. Rien de privé : seulement des heures libres.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await membrePublic((await params).slug))) return Response.json({ erreur: "Ce lien n'est pas actif." }, { status: 404 });
  try {
    return Response.json({ jours: await plagesLibres() });
  } catch {
    return Response.json({ erreur: "L'agenda ne répond pas pour l'instant." }, { status: 502 });
  }
}
