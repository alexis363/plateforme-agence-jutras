import { exigerAdmin } from "@/lib/session.ts";
import { reglagesAgenda, plagesLibres, PREAVIS_H, agendaSimule } from "@/lib/agenda.ts";
import FormulaireReglages from "./FormulaireReglages.tsx";

// Réglages de l'agenda (demande d'Alexis du 18 nov. 2026) : durée, pause entre les rendez-vous, disponibilités.
export default async function Reglages() {
  await exigerAdmin();
  const r = await reglagesAgenda();
  const jours = await plagesLibres().catch(() => null);
  const nb = jours?.reduce((n, j) => n + j.plages.length, 0) ?? 0;
  return (
    <>
      <h1 className="titre">Réglages, <em>votre agenda.</em></h1>
      <p className="sous">
        Ce que montrent les formulaires de réservation (site web et liens de référence) · préavis de {PREAVIS_H} h · cette semaine et les 3 suivantes · tous les agendas du compte Google bloquent les plages
        {agendaSimule() ? " · agenda Google non branché ici (simulé)" : ""}
      </p>
      <div className="deux">
        <div className="bloc"><FormulaireReglages initial={r} /></div>
        <div className="bloc">
          <h2>Ce que voient les clients</h2>
          {jours === null && <p className="vide">L'agenda Google ne répond pas pour l'instant.</p>}
          {jours?.length === 0 && <p className="vide">Aucune plage libre dans les 3 prochaines semaines.</p>}
          {!!jours?.length && <p className="note" style={{ marginTop: -6 }}>{nb} plage{nb > 1 ? "s" : ""} libre{nb > 1 ? "s" : ""}, une fois votre agenda Google retiré</p>}
          {jours?.map((j) => (
            <div className="tache" key={j.date}><div className="t-txt"><b>{j.libelle}</b><small>{j.plages.map((p) => p.heure).join(" · ")}</small></div></div>
          ))}
        </div>
      </div>
    </>
  );
}
