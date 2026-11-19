import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { dateCourte } from "@/lib/regles.ts";
import SupprimerMembre from "./SupprimerMembre.tsx";

export default async function Membres() {
  await exigerAdmin();
  const { membres, references, visites } = await adminTout();
  const liste = membres.filter((m) => m.role === "membre").sort((a, b) => b.creeLe.localeCompare(a.creeLe));

  return (
    <>
      <h1 className="titre">Les <em>ambassadeurs</em></h1>
      <p className="sous">Les personnes inscrites au programme de référence. Un lien ne s'active qu'une fois le courriel confirmé.</p>
      {liste.length === 0 ? <p className="vide">Aucun ambassadeur pour l'instant.</p> : (
        <div className="table-defile"><table>
          <thead><tr><th>Ambassadeur</th><th>Lien</th><th>Inscrit le</th><th>Visites du lien</th><th>Demandes de rendez-vous</th><th>Clients</th><th></th></tr></thead>
          <tbody>
            {liste.map((m) => {
              const refs = references.filter((r) => r.membreId === m.id);
              return (
                <tr key={m.id}>
                  <td><b style={{ fontWeight: 500 }}>{m.prenom} {m.nom}</b><br /><small style={{ color: "var(--sec)" }}>{m.courriel} · {m.cellulaire}</small></td>
                  <td>{m.confirme ? `/r/${m.slug}` : <span className="pastille p-neutre">Courriel à confirmer</span>}</td>
                  <td>{dateCourte(m.creeLe)}</td>
                  <td>{visites.filter((v) => v.membreId === m.id).length}</td>
                  <td>{refs.length}</td>
                  <td>{refs.filter((r) => !r.fermee && r.etape >= 5).length}</td>
                  <td><SupprimerMembre id={m.id} nom={`${m.prenom} ${m.nom}`} courriel={m.courriel} nbReferences={refs.length} /></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
    </>
  );
}
