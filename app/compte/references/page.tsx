import { exigerMembre } from "@/lib/session.ts";
import { referencesDuMembre, visitesDuMembre } from "@/lib/depot.ts";
import { chiffresMembre, visitesParSemaine } from "@/lib/stats.ts";
import { ETAPES, RECOMPENSE, dateCourte } from "@/lib/regles.ts";
import type { Reference } from "@/lib/types.ts";
import { momentCourt } from "@/lib/agenda.ts";

function statut(r: Reference): [string, string] {
  if (r.fermee) return ["Fermée", "p-neutre"];
  if (r.etape === 6) return [`${RECOMPENSE} $ versés`, "p-ok"];
  if (r.etape === 5) return [`Vos ${RECOMPENSE} $ partent dans les 24 h`, "p-cours"];
  if (r.etape <= 2 && r.rendezVous) return [`Rencontre le ${momentCourt(r.rendezVous)}`, "p-cours"];
  return [ETAPES[r.etape - 1], r.etape === 1 ? "p-neutre" : "p-cours"];
}

export default async function MesReferences() {
  const m = await exigerMembre();
  const [refs, visites] = await Promise.all([referencesDuMembre(m.id), visitesDuMembre(m.id)]);
  const c = chiffresMembre(visites, refs);
  const semaines = visitesParSemaine(visites);
  const max = Math.max(1, ...semaines.map((s) => s.nombre));
  const entonnoir: [string, number][] = [
    ["Visites du lien", c.visites], ["Demandes", c.demandes], ["Contactés", c.contactes],
    ["Rencontrés", c.rencontres], ["Devenus clients", c.clients], ["Récompenses versées", c.verses],
  ];
  const base = Math.max(1, c.visites, c.demandes);

  return (
    <>
      <h1 className="titre">Mes <em>références</em></h1>
      <p className="sous">Où en est chaque entrepreneur que vous avez présenté.</p>
      <div className="deux">
        <div className="bloc">
          <h2>Visites de votre lien</h2>
          <p className="note" style={{ margin: "-6px 0 0" }}>Les 8 dernières semaines</p>
          <div className="graph">
            {semaines.map((s, i) => <div key={i}><span>{s.nombre}</span><i style={{ height: `${(s.nombre / max) * 100}%` }} /></div>)}
          </div>
          <div className="graph-dates">{semaines.map((s, i) => <span key={i}>{s.debut}</span>)}</div>
        </div>
        <div className="bloc">
          <h2>Du lien au client</h2>
          <div className="entonnoir">
            {entonnoir.map(([n, v]) => (
              <div key={n}><span>{n}</span><span className="barre-f"><i style={{ width: `${Math.max(v ? 2 : 0, (v / base) * 100)}%` }} /></span><b>{v}</b></div>
            ))}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 22, margin: "28px 0 14px" }}>
        {refs.length === 0 ? "Aucune référence pour l'instant" : `Vos ${refs.length} référence${refs.length > 1 ? "s" : ""}`}
      </h2>
      {refs.length === 0 && <p className="vide">Partagez votre lien : chaque demande remplie par ce lien apparaîtra ici, avec son avancement.</p>}
      {refs.map((r) => {
        const [texte, classe] = statut(r);
        return (
          <div className="ref" key={r.id}>
            <div className="ref-haut">
              <div><b>{r.entreprise}</b><small>{r.contact} · demande du {dateCourte(r.creeLe)}{r.fermee ? ` · ${r.fermee}` : ""}</small></div>
              <span className={`pastille ${classe}`}>{texte}</span>
            </div>
            {!r.fermee && (
              <div className="etapes">
                {ETAPES.map((e, i) => <span key={e} className={`${i < r.etape ? "fait" : ""}${i === r.etape - 1 ? " ici" : ""}`}>{e}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
