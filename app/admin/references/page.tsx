import Link from "next/link";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { ETAPES, dateCourte } from "@/lib/regles.ts";
import type { Reference } from "@/lib/types.ts";

const FILTRES: [string, string, (r: Reference) => boolean][] = [
  ["a-faire", "À faire", (r) => !r.fermee && (r.etape === 1 || r.etape === 5)],
  ["en-cours", "En cours", (r) => !r.fermee && r.etape < 6],
  ["payees", "Ambassadeur payé", (r) => !r.fermee && r.etape === 6],
  ["fermees", "Fermées", (r) => !!r.fermee],
  ["toutes", "Toutes", () => true],
];

export default async function References({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await exigerAdmin();
  const { f = "en-cours" } = await searchParams;
  const { membres, references } = await adminTout();
  const filtre = FILTRES.find(([cle]) => cle === f) ?? FILTRES[1];
  const liste = references.filter(filtre[2]).sort((a, b) => b.creeLe.localeCompare(a.creeLe));
  const membre = (id: string) => membres.find((m) => m.id === id);

  return (
    <>
      <h1 className="titre">Les <em>références</em></h1>
      <p className="sous">Chaque demande remplie par un lien. Faites-la avancer : le membre voit l'étape dans son compte.</p>
      <div className="filtres">
        {FILTRES.map(([cle, texte, test]) => (
          <Link key={cle} href={`/admin/references?f=${cle}`} className={`filtre${cle === filtre[0] ? " actif" : ""}`}>{texte} ({references.filter(test).length})</Link>
        ))}
      </div>
      {liste.length === 0 ? <p className="vide">Aucune référence ici.</p> : (
        <div className="table-defile"><table>
          <thead><tr><th>Entreprise</th><th>Référée par</th><th>Reçue</th><th>Étape</th></tr></thead>
          <tbody>
            {liste.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/references/${r.id}`} style={{ textDecoration: "none" }}><b style={{ fontWeight: 500 }}>{r.entreprise}</b><br /><small style={{ color: "var(--sec)" }}>{r.contact}{r.metier ? ` · ${r.metier}` : ""}</small></Link></td>
                <td>{membre(r.membreId)?.prenom} {membre(r.membreId)?.nom}</td>
                <td>{dateCourte(r.creeLe)}</td>
                <td>{r.fermee ? <span className="pastille p-neutre">Fermée</span> : <span className={`pastille ${r.etape === 1 || r.etape === 5 ? "p-alerte" : r.etape === 6 ? "p-ok" : "p-cours"}`}>{r.etape}. {ETAPES[r.etape - 1]}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
