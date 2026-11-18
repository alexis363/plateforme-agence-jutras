import { z } from "zod";
import { membreConnecte } from "@/lib/session.ts";
import { adminEcrireReglagesAgenda } from "@/lib/depot.ts";

const JOURS = ["0", "1", "2", "3", "4", "5", "6"];
const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const plage = z.tuple([heure, heure]).refine(([a, b]) => a < b);
const Schema = z.object({
  duree: z.number().int().min(5).max(120),
  pause: z.number().int().min(0).max(120),
  disponibilites: z.record(z.string(), z.array(plage).max(6)),
});

// La console seulement : enregistre la durée, la pause et les disponibilités de l'agenda.
export async function PUT(req: Request) {
  const admin = await membreConnecte();
  if (admin?.role !== "admin") return Response.json({ erreur: "Réservé à la console" }, { status: 403 });
  const d = Schema.safeParse(await req.json().catch(() => null));
  if (!d.success) return Response.json({ erreur: "Vérifiez les heures : chaque plage doit finir après son début." }, { status: 400 });
  // Les plages d'une journée, en ordre, sans chevauchement. Les jours inconnus sont ignorés.
  const disponibilites: Record<string, [string, string][]> = {};
  for (const j of JOURS) {
    const liste = [...(d.data.disponibilites[j] ?? [])].sort((a, b) => a[0].localeCompare(b[0]));
    if (liste.some((p, i) => i > 0 && p[0] < liste[i - 1][1]))
      return Response.json({ erreur: "Deux plages d'une même journée se chevauchent." }, { status: 400 });
    disponibilites[j] = liste;
  }
  await adminEcrireReglagesAgenda({ duree: d.data.duree, pause: d.data.pause, disponibilites });
  return Response.json({ ok: true });
}
