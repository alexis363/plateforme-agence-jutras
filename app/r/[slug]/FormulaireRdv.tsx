"use client";
import { useMemo, useState } from "react";

const PLAGES = ["Avant-midi", "Midi", "Fin de journée", "Soirée"];
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// Les 5 prochains jours de semaine, à partir de demain.
function prochainsJours(): Date[] {
  const jours: Date[] = [];
  const d = new Date();
  while (jours.length < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) jours.push(new Date(d));
  }
  return jours;
}

export default function FormulaireRdv({ slug, qui }: { slug: string; qui: string | null }) {
  const jours = useMemo(prochainsJours, []);
  const [jour, setJour] = useState(0);
  const [plage, setPlage] = useState<number | null>(null);
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [fait, setFait] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (plage === null) return setErreur("Choisissez un moment de la journée.");
    const f = new FormData(e.currentTarget);
    const d = jours[jour];
    const moment = `${["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}, ${PLAGES[plage].toLowerCase()}`;
    setOccupe(true);
    setErreur("");
    const rep = await fetch(`/api/r/${encodeURIComponent(slug)}/demande`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: f.get("contact"), entreprise: f.get("entreprise"), metier: f.get("metier"),
        cellulaire: f.get("cellulaire"), courriel: f.get("courriel") ?? "", casseTete: f.get("casseTete") ?? "", moment,
      }),
    });
    setOccupe(false);
    if (rep.ok) setFait(moment);
    else setErreur((await rep.json().catch(() => ({}))).erreur ?? "Une erreur est survenue. Appelez-moi au 581-349-1258.");
  }

  if (fait)
    return (
      <div className="formrdv"><div className="merci">
        <div className="rond">✓</div>
        <h3>C'est noté.</h3>
        <p style={{ color: "var(--sec)" }}>Je vous appelle {fait}.</p>
        <p style={{ color: "var(--sec)", fontSize: 14 }}>Si le moment ne convient plus, écrivez-moi au 581-349-1258.</p>
      </div></div>
    );

  return (
    <form className="formrdv" onSubmit={envoyer}>
      {qui && <span className="reco-tag">✓ Recommandé par {qui}</span>}
      <h3>Réservez vos 15 minutes</h3>
      <p className="s">Choisissez le moment qui vous convient : je vous appelle.</p>
      <div className="jours">
        {jours.map((d, i) => (
          <button type="button" key={i} className={`jour${i === jour ? " actif" : ""}`} onClick={() => setJour(i)}>
            <small>{JOURS[d.getDay()]}</small><b>{d.getDate()}</b>
          </button>
        ))}
      </div>
      <div className="heures">
        {PLAGES.map((p, i) => (
          <button type="button" key={p} className={`heure${i === plage ? " actif" : ""}`} onClick={() => { setPlage(i); setErreur(""); }}>{p}</button>
        ))}
      </div>
      <div className="champs">
        <label className="champ"><span>Prénom et nom</span><input name="contact" required maxLength={80} placeholder="Martin Roy" /></label>
        <label className="champ"><span>Entreprise</span><input name="entreprise" required maxLength={80} placeholder="Paysagement Roy" /></label>
        <label className="champ"><span>Métier</span><input name="metier" required maxLength={60} placeholder="Émondage, ramonage…" /></label>
        <label className="champ"><span>Cellulaire</span><input name="cellulaire" required inputMode="tel" placeholder="418-555-0123" /></label>
        <label className="champ large"><span>Courriel (facultatif)</span><input name="courriel" type="email" maxLength={120} /></label>
        <label className="champ large"><span>Votre plus gros casse-tête administratif</span><textarea name="casseTete" maxLength={600} placeholder="Les soumissions le soir, les demandes éparpillées…" /></label>
      </div>
      <button className="btn" disabled={occupe}>{occupe ? "Envoi…" : <>Réserver mes 15 minutes <span aria-hidden="true">→</span></>}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="legal">Vos renseignements servent seulement à préparer notre appel.{qui ? ` Votre demande est attribuée à ${qui}, qui vous a recommandé.` : ""} <a href="https://www.agencejutras.com/politique-de-confidentialite.html">Politique de confidentialité</a>.</p>
    </form>
  );
}
