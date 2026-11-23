import Link from "next/link";
import Partage from "./Partage.tsx";
import Montagne from "./Montagne.tsx";
import { exigerMembre } from "@/lib/session.ts";
import { referencesDuMembre, visitesDuMembre } from "@/lib/depot.ts";
import { lienReference } from "@/lib/courriel.ts";
import { chiffresMembre } from "@/lib/stats.ts";
import { RECOMPENSE, dateCourte } from "@/lib/regles.ts";

export default async function AccueilMembre() {
  const m = await exigerMembre();
  const [refs, visites] = await Promise.all([referencesDuMembre(m.id), visitesDuMembre(m.id)]);
  const c = chiffresMembre(visites, refs);
  const lien = lienReference(m.slug);
  // Les dernières nouvelles : l'historique de ses références (jamais les notes privées de la console).
  const nouvelles = refs
    .flatMap((r) => r.historique.map((h) => ({ ...h, entreprise: r.entreprise })))
    .sort((a, b) => b.le.localeCompare(a.le))
    .slice(0, 4);
  // La montagne : une référence active = un grimpeur, avec sa dernière nouvelle (jamais les notes privées).
  const grimpeurs = refs
    .filter((r) => !r.fermee)
    .map((r) => {
      const derniere = [...r.historique].sort((a, b) => b.le.localeCompare(a.le))[0];
      return { id: r.id, prenom: r.contact.trim().split(/\s+/)[0] || "Ta référence", etape: r.etape, nouvelle: derniere ? `${derniere.quoi} · ${dateCourte(derniere.le)}` : "" };
    });

  return (
    <>
      <div className="haut-membre">
        <div>
          <h1 className="titre">Bonjour {m.prenom}, <em>prêt à parler de Kairos Soumission&nbsp;?</em></h1>
          <p className="sous">Tu présentes un entrepreneur ; s'il devient client de Kairos, tu reçois {RECOMPENSE} $.</p>
        </div>
        <div className="chiffre argent argent-haut"><b>{c.recu} $</b><span>reçus{c.aVenir ? ` · ${c.aVenir} $ à venir` : ""}</span></div>
      </div>

      <div className="lien-carte">
        <h2>Ton lien <em>personnel</em></h2>
        <p>Envoie-le à un entrepreneur qui passe ses soirées dans la paperasse. Quand il remplit sa demande par ce lien, elle t'est attribuée automatiquement.</p>
        <Partage url={lien.url} affiche={lien.affiche} slug={m.slug} />
      </div>

      <Montagne visites={c.visites} grimpeurs={grimpeurs} />

      {/* Les chiffres en un coup d'œil, sous la montagne (Alexis, 22 nov. 2026). Chaque nombre inclut ceux qui sont allés plus loin. */}
      <div className="chiffres chiffres-montagne">
        <div className="chiffre"><b>{c.visites}</b><span>{c.visites > 1 ? "visites" : "visite"} du lien</span></div>
        <div className="chiffre"><b>{c.demandes}</b><span>{c.demandes > 1 ? "demandes" : "demande"} de rendez-vous</span></div>
        <div className="chiffre"><b>{c.enEssai}</b><span>{c.enEssai > 1 ? "essais gratuits" : "essai gratuit"}</span></div>
        <div className="chiffre argent"><b>{c.payants}</b><span>{c.payants > 1 ? "clients" : "client"} · {RECOMPENSE} $ chacun</span></div>
      </div>

      <div className="deux">
        <div className="bloc">
          <h2>Dernières nouvelles</h2>
          {nouvelles.length === 0 && <p className="vide">Rien pour l'instant. Dès qu'un entrepreneur remplit sa demande par ton lien, tu le verras ici.</p>}
          {nouvelles.map((n, i) => (
            <div className="ligne" key={i}><span className="n">→</span><div><b>{n.entreprise}</b><small>{n.quoi} · {dateCourte(n.le)}</small></div></div>
          ))}
          {refs.length > 0 && <div style={{ marginTop: 12 }}><Link className="btn" href="/compte/references">Voir mes références</Link></div>}
        </div>
        <div className="bloc">
          <h2>Qui référer?</h2>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--sec)" }}>Un propriétaire d'entreprise de services qui fait ses soumissions et sa paperasse le soir : émondage, ramonage, paysagement, entretien extérieur…</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--sec)" }}>Ton beau-frère, ton voisin, l'entrepreneur qui a fait ton terrain l'été passé.</p>
          <div style={{ marginTop: 14 }}><Link className="btn" href="/compte/qui-referer">Faire défiler les métiers</Link></div>
        </div>
      </div>
    </>
  );
}
