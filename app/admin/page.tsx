import Link from "next/link";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { RECOMPENSE, dateCourte, dateLongue } from "@/lib/regles.ts";
import { momentCourt } from "@/lib/agenda.ts";

export default async function Aujourdhui() {
  const admin = await exigerAdmin();
  const { membres, references } = await adminTout();
  const ambassadeur = (id: string | null) => (id ? membres.find((m) => m.id === id) : undefined);
  const source = (id: string | null) => (id ? `référé par ${ambassadeur(id)?.prenom ?? "?"}` : "pris sur le site web");
  const actifs = references.filter((r) => !r.fermee);
  // Étape 1 « Demande de rendez-vous » : à appeler, le premier rendez-vous en haut.
  const aAppeler = actifs.filter((r) => r.etape === 1).sort((a, b) => (a.rendezVous ?? a.creeLe).localeCompare(b.rendezVous ?? b.creeLe));
  // Étape 5 « Client » d'un prospect référé : la récompense est due dans les 24 h.
  const aVerser = actifs.filter((r) => r.etape === 5 && r.membreId);
  const semaine = Date.now() - 7 * 86400e3;
  const nouveaux = membres.filter((m) => m.confirme && m.role === "membre" && new Date(m.creeLe).getTime() > semaine);
  const pluriel = (n: number, mot: string) => `${mot}${n > 1 ? "s" : ""}`;

  return (
    <>
      <h1 className="titre">Bonjour {admin.prenom}, <em>voici votre semaine.</em></h1>
      <p className="sous">{dateLongue(new Date().toISOString())} · ce qui demande votre attention</p>
      <div className="chiffres">
        <div className={`chiffre${aAppeler.length ? " alerte" : ""}`}><b>{aAppeler.length}</b><span>{pluriel(aAppeler.length, "prospect")} à appeler</span></div>
        <div className={`chiffre${aVerser.length ? " argent" : ""}`}><b>{aVerser.length * RECOMPENSE} $</b><span>de récompenses à verser</span></div>
        <div className="chiffre"><b>{actifs.filter((r) => r.etape < 6).length}</b><span>prospects en cours</span></div>
        <div className="chiffre"><b>{membres.filter((m) => m.confirme && m.role === "membre").length}</b><span>ambassadeurs</span></div>
      </div>
      <div className="deux">
        <div className="bloc">
          <h2>À faire</h2>
          {aAppeler.length + aVerser.length === 0 && <p className="vide">Rien à faire. Les nouvelles demandes de rendez-vous (liens et site web) apparaîtront ici.</p>}
          {aAppeler.map((r) => (
            <div className="tache" key={r.id}>
              <div className="t-txt"><b>Appeler {r.contact}, {r.entreprise}</b><small>{r.cellulaire} · {r.rendezVous ? `rendez-vous le ${momentCourt(r.rendezVous)}` : r.moment} · {source(r.membreId)}</small></div>
              <Link className="lien" href={`/admin/references/${r.id}`}>Ouvrir</Link>
            </div>
          ))}
          {aVerser.map((r) => {
            const m = ambassadeur(r.membreId);
            return (
              <div className="tache" key={r.id}>
                <div className="t-txt"><b>Verser {RECOMPENSE} $ à {m?.prenom} {m?.nom}</b><small>Interac à {m?.courriel} · {r.entreprise} est client · dans les 24 h</small></div>
                <Link className="lien" href={`/admin/references/${r.id}`}>Ouvrir</Link>
              </div>
            );
          })}
        </div>
        <div className="bloc">
          <h2>Nouveaux ambassadeurs</h2>
          <p className="note" style={{ marginTop: -6 }}>Les 7 derniers jours</p>
          {nouveaux.length === 0 && <p className="vide">Aucun cette semaine.</p>}
          {nouveaux.map((m) => (
            <div className="tache" key={m.id}><div className="t-txt"><b>{m.prenom} {m.nom}</b><small>inscrit le {dateCourte(m.creeLe)} · /r/{m.slug}</small></div></div>
          ))}
          <div style={{ marginTop: 12 }}><Link className="lien" href="/admin/membres">Tous les ambassadeurs →</Link></div>
        </div>
      </div>
    </>
  );
}
