import Link from "next/link";
import Partage from "./Partage.tsx";
import Entonnoir from "./Entonnoir.tsx";
import { exigerMembre } from "@/lib/session.ts";
import { referencesDuMembre, visitesDuMembre } from "@/lib/depot.ts";
import { lienReference } from "@/lib/courriel.ts";
import { chiffresMembre } from "@/lib/stats.ts";
import { ETAPES, RECOMPENSE, dateCourte } from "@/lib/regles.ts";

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

  return (
    <>
      <div className="haut-membre">
        <div>
          <h1 className="titre">Bonjour {m.prenom}, <em>merci de parler de nous.</em></h1>
          <p className="sous">Vous présentez un entrepreneur ; s'il devient client de Kairos, vous recevez {RECOMPENSE} $.</p>
        </div>
        <div className="chiffre argent argent-haut"><b>{c.recu} $</b><span>reçus{c.aVenir ? ` · ${c.aVenir} $ à venir` : ""}</span></div>
      </div>

      <div className="lien-carte">
        <h2>Votre lien <em>personnel</em></h2>
        <p>Envoyez-le à un entrepreneur qui passe ses soirées dans la paperasse. Quand il remplit sa demande par ce lien, elle vous est attribuée automatiquement.</p>
        <Partage url={lien.url} affiche={lien.affiche} slug={m.slug} />
      </div>

      <Entonnoir bandes={[
        { n: c.visites, texte: "Visites du lien" },
        { n: c.demandes, texte: ETAPES[0] },
        { n: c.rencontres, texte: ETAPES[1] },
        { n: c.installations, texte: ETAPES[2] },
        { n: c.enEssai, texte: ETAPES[3] },
        { n: c.payants, texte: ETAPES[4], note: `${RECOMPENSE} $ chacun` },
        { n: c.verses, texte: ETAPES[5] },
      ]} />

      <div className="deux">
        <div className="bloc">
          <h2>Dernières nouvelles</h2>
          {nouvelles.length === 0 && <p className="vide">Rien pour l'instant. Dès qu'un entrepreneur remplit sa demande par votre lien, vous le verrez ici.</p>}
          {nouvelles.map((n, i) => (
            <div className="ligne" key={i}><span className="n">→</span><div><b>{n.entreprise}</b><small>{n.quoi} · {dateCourte(n.le)}</small></div></div>
          ))}
          {refs.length > 0 && <div style={{ marginTop: 12 }}><Link className="btn" href="/compte/references">Voir mes références</Link></div>}
        </div>
        <div className="bloc">
          <h2>Qui référer?</h2>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--sec)" }}>Un propriétaire d'entreprise de services qui fait ses soumissions et sa paperasse le soir : émondage, ramonage, paysagement, entretien extérieur…</p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--sec)" }}>Votre beau-frère, votre voisin, l'entrepreneur qui a fait votre terrain l'été passé.</p>
        </div>
      </div>
    </>
  );
}
