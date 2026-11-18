import Link from "next/link";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { RECOMPENSE, dateCourte, dateLongue } from "@/lib/regles.ts";

export default async function Aujourdhui() {
  const admin = await exigerAdmin();
  const { membres, references } = await adminTout();
  const nom = (id: string) => membres.find((m) => m.id === id);
  const actives = references.filter((r) => !r.fermee);
  const aAppeler = actives.filter((r) => r.etape === 1).sort((a, b) => a.creeLe.localeCompare(b.creeLe));
  const aVerser = actives.filter((r) => r.etape === 5);
  const semaine = Date.now() - 7 * 86400e3;
  const nouveauxMembres = membres.filter((m) => m.confirme && m.role === "membre" && new Date(m.creeLe).getTime() > semaine);

  return (
    <>
      <h1 className="titre">Bonjour {admin.prenom}, <em>voici votre semaine.</em></h1>
      <p className="sous">{dateLongue(new Date().toISOString())} · ce qui demande votre attention</p>
      <div className="chiffres">
        <div className={`chiffre${aAppeler.length ? " alerte" : ""}`}><b>{aAppeler.length}</b><span>référence{aAppeler.length > 1 ? "s" : ""} à appeler</span></div>
        <div className={`chiffre${aVerser.length ? " argent" : ""}`}><b>{aVerser.length * RECOMPENSE} $</b><span>de récompenses à verser</span></div>
        <div className="chiffre"><b>{actives.filter((r) => r.etape < 6).length}</b><span>références en cours</span></div>
        <div className="chiffre"><b>{membres.filter((m) => m.confirme && m.role === "membre").length}</b><span>membres du programme</span></div>
      </div>
      <div className="deux">
        <div className="bloc">
          <h2>À faire</h2>
          {aAppeler.length + aVerser.length === 0 && <p className="vide">Rien à faire pour le programme de référence. Les nouvelles demandes apparaîtront ici.</p>}
          {aAppeler.map((r) => (
            <div className="tache" key={r.id}>
              <div className="t-txt"><b>Appeler {r.contact}, {r.entreprise}</b><small>{r.metier} · {r.cellulaire} · préfère {r.moment} · référé par {nom(r.membreId)?.prenom ?? "?"}</small></div>
              <Link className="lien" href={`/admin/references/${r.id}`}>Ouvrir</Link>
            </div>
          ))}
          {aVerser.map((r) => {
            const m = nom(r.membreId);
            return (
              <div className="tache" key={r.id}>
                <div className="t-txt"><b>Verser {RECOMPENSE} $ à {m?.prenom} {m?.nom}</b><small>Interac à {m?.courriel} · {r.entreprise} a fait son premier paiement · dans les 24 h</small></div>
                <Link className="lien" href={`/admin/references/${r.id}`}>Ouvrir</Link>
              </div>
            );
          })}
        </div>
        <div className="bloc">
          <h2>Nouveaux membres</h2>
          <p className="note" style={{ marginTop: -6 }}>Les 7 derniers jours</p>
          {nouveauxMembres.length === 0 && <p className="vide">Aucun cette semaine.</p>}
          {nouveauxMembres.map((m) => (
            <div className="tache" key={m.id}><div className="t-txt"><b>{m.prenom} {m.nom}</b><small>inscrit le {dateCourte(m.creeLe)} · /r/{m.slug}</small></div></div>
          ))}
          <div style={{ marginTop: 12 }}><Link className="lien" href="/admin/membres">Tous les membres →</Link></div>
        </div>
      </div>
    </>
  );
}
