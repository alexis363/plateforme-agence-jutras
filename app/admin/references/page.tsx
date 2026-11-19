import Link from "next/link";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { ETAPES, dateCourte } from "@/lib/regles.ts";
import { momentCourt } from "@/lib/agenda.ts";
import Pipeline, { type Fiche } from "./Pipeline.tsx";

// « Mes prospects » (19 nov. 2026) : les prospects des liens et du site, dans un pipeline à fiches qu'on glisse
// d'une étape à l'autre, à la manière de GoHighLevel. Les prospects fermés sont listés en dessous.
export default async function MesProspects() {
  await exigerAdmin();
  const { membres, references } = await adminTout();
  const source = (id: string | null) => {
    if (!id) return "Site web";
    const m = membres.find((x) => x.id === id);
    return m ? `${m.prenom} ${m.nom}` : "Ambassadeur supprimé";
  };
  const fiches: Fiche[] = references
    .filter((r) => !r.fermee)
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe))
    .map((r) => ({
      id: r.id, etape: r.etape, entreprise: r.entreprise, contact: r.contact, source: source(r.membreId),
      parAmbassadeur: !!r.membreId, quand: r.rendezVous ? `Rendez-vous le ${momentCourt(r.rendezVous)}` : `Reçu le ${dateCourte(r.creeLe)}`,
    }));
  const fermes = references.filter((r) => r.fermee).sort((a, b) => b.creeLe.localeCompare(a.creeLe));

  return (
    <>
      <h1 className="titre">Mes <em>prospects</em></h1>
      <p className="sous">Glissez une fiche vers l'étape suivante. L'ambassadeur voit l'étape dans son compte ; à « {ETAPES[4]} », versez sa récompense dans les 24 h.</p>
      <Pipeline fiches={fiches} />
      <details className="fermes">
        <summary>Prospects fermés ({fermes.length})</summary>
        {fermes.length === 0 ? <p className="vide">Aucun.</p> : fermes.map((r) => (
          <div className="tache" key={r.id}>
            <div className="t-txt"><b>{r.entreprise}</b><small>{r.contact} · {source(r.membreId)} · fermé : {r.fermee}</small></div>
            <Link className="lien" href={`/admin/references/${r.id}`}>Ouvrir</Link>
          </div>
        ))}
      </details>
    </>
  );
}
