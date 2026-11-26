"use client";
import { useEffect, useState } from "react";

type Jour = { date: string; libelle: string; plages: { debut: string; heure: string }[] };

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const MC = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."];
const enDate = (cle: string) => new Date(Date.UTC(+cle.slice(0, 4), +cle.slice(5, 7) - 1, +cle.slice(8, 10)));

// Le calendrier (demande d'Alexis du 26 nov. 2026) : des semaines du dimanche au samedi, de la semaine de la
// première plage à celle de la dernière.
function semaines(jours: Jour[]) {
  const d0 = enDate(jours[0].date), d1 = enDate(jours[jours.length - 1].date);
  d0.setUTCDate(d0.getUTCDate() - d0.getUTCDay());
  d1.setUTCDate(d1.getUTCDate() + 6 - d1.getUTCDay());
  const cases: { cle: string; n: number; mois: number }[] = [];
  for (const c = new Date(d0); c <= d1; c.setUTCDate(c.getUTCDate() + 1))
    cases.push({ cle: c.toISOString().slice(0, 10), n: c.getUTCDate(), mois: c.getUTCMonth() });
  const [m1, m2] = [d0.getUTCMonth(), d1.getUTCMonth()];
  const titre = (m1 === m2 ? MOIS[m1] : `${MOIS[m1]} – ${MOIS[m2]}`) + ` ${d1.getUTCFullYear()}`;
  return { cases, titre: titre.charAt(0).toUpperCase() + titre.slice(1) };
}

// Un seul formulaire (exigence d'Alexis du 18 nov. 2026) : les coordonnées et la plage, ensemble.
// Les plages sont les vraies disponibilités d'Alexis, lues dans son agenda Google.
export default function FormulaireRdv({ slug, qui }: { slug: string; qui: string | null }) {
  const [jours, setJours] = useState<Jour[] | null>(null);
  const [jour, setJour] = useState(0);
  const [debut, setDebut] = useState<string | null>(null);
  const [vue, setVue] = useState<"cal" | "liste">("cal");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [fait, setFait] = useState<{ prenom: string; moment: string | null } | null>(null);

  async function chargerPlages() {
    const rep = await fetch(`/api/r/${encodeURIComponent(slug)}/plages`).catch(() => null);
    const d = rep?.ok ? await rep.json() : null;
    setJours(d?.jours ?? []);
    setJour(0);
    setDebut(null);
  }
  useEffect(() => { chargerPlages(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!debut && jours?.length) return setErreur("Choisissez une plage dans l'agenda.");
    const f = new FormData(e.currentTarget);
    setOccupe(true);
    setErreur("");
    const rep = await fetch(`/api/r/${encodeURIComponent(slug)}/demande`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: f.get("prenom"), nom: f.get("nom"), entreprise: f.get("entreprise"),
        cellulaire: f.get("cellulaire"), courriel: f.get("courriel") ?? "", casseTete: f.get("casseTete") ?? "", debut,
      }),
    });
    const corps = await rep.json().catch(() => ({}));
    setOccupe(false);
    if (rep.ok) return setFait({ prenom: String(f.get("prenom")).trim(), moment: corps.moment });
    setErreur(corps.erreur ?? "Une erreur est survenue. Appelez-moi au 581-349-1258.");
    if (corps.plagePrise) chargerPlages();
  }

  if (fait)
    return (
      <div className="formrdv"><div className="merci">
        <div className="rond">✓</div>
        <h3>{fait.moment ? "C'est réservé" : "C'est noté"}{fait.prenom ? `, ${fait.prenom}` : ""}.</h3>
        <p style={{ color: "var(--sec)" }}>{fait.moment ? `On se parle ${fait.moment} sur Google Meet. Le lien est dans l'invitation envoyée à votre courriel.` : "Je vous contacte sous peu pour fixer le moment."}</p>
        <p style={{ color: "var(--sec)", fontSize: 14 }}>Un empêchement? Écrivez-moi au 581-349-1258.</p>
      </div></div>
    );

  const plages = jours?.[jour]?.plages ?? [];
  const heure = (p: { debut: string; heure: string }) => (
    <button type="button" key={p.debut} className={`heure${p.debut === debut ? " actif" : ""}`} onClick={() => { setDebut(p.debut); setErreur(""); }}>{p.heure}</button>
  );
  const cal = jours?.length ? semaines(jours) : null;
  return (
    <form className="formrdv" onSubmit={envoyer}>
      {qui && <span className="reco-tag">✓ Recommandé par {qui}</span>}
      <h3>Réservez vos 15 minutes</h3>
      <p className="s">Choisissez votre plage : on se parle sur Google Meet, le lien vous arrive par courriel.</p>

      {jours === null && <p className="s">Chargement de mes disponibilités…</p>}
      {jours?.length === 0 && (
        <p className="erreur" style={{ marginBottom: 16 }}>Aucune plage libre dans les 3 prochaines semaines. Laissez vos coordonnées : je vous contacte pour en trouver une.</p>
      )}
      {!!jours?.length && (
        <>
          <div className="vues" role="group" aria-label="Choisir la vue">
            <button type="button" className={vue === "cal" ? "actif" : ""} aria-pressed={vue === "cal"} onClick={() => setVue("cal")}>Calendrier</button>
            <button type="button" className={vue === "liste" ? "actif" : ""} aria-pressed={vue === "liste"} onClick={() => setVue("liste")}>Liste</button>
          </div>
          {vue === "cal" && cal && (
            <>
              <p className="mois">{cal.titre}</p>
              <div className="cal">
                {["D", "L", "M", "M", "J", "V", "S"].map((x, i) => <span className="ent" key={i}>{x}</span>)}
                {cal.cases.map((c) => {
                  const i = jours.findIndex((j) => j.date === c.cle);
                  const txt = <>{c.n}{c.n === 1 && <small>{MC[c.mois]}</small>}</>;
                  return i < 0
                    ? <span className="j-vide" key={c.cle}>{txt}</span>
                    : <button type="button" key={c.cle} className={`jcal${i === jour ? " actif" : ""}`} aria-pressed={i === jour}
                        onClick={() => { setJour(i); setDebut(null); }}>{txt}</button>;
                })}
              </div>
              <p className="jour-choisi">{jours[jour].libelle} · choisissez une heure</p>
              <div className="heures">{plages.map(heure)}</div>
            </>
          )}
          {vue === "liste" && (
            <div className="liste">
              {jours.map((j) => (
                <div className="liste-j" key={j.date}><b>{j.libelle}</b><div className="heures">{j.plages.map(heure)}</div></div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="champs">
        <label className="champ"><span>Prénom</span><input name="prenom" required maxLength={40} autoComplete="given-name" placeholder="Martin" /></label>
        <label className="champ"><span>Nom</span><input name="nom" required maxLength={40} autoComplete="family-name" placeholder="Roy" /></label>
        <label className="champ"><span>Nom de votre entreprise</span><input name="entreprise" required maxLength={80} autoComplete="organization" placeholder="Paysagement Roy" /></label>
        <label className="champ"><span>Cellulaire</span><input name="cellulaire" required inputMode="tel" placeholder="418-555-0123" /></label>
        <label className="champ large"><span>Courriel (pour recevoir le lien Google Meet)</span><input name="courriel" type="email" required maxLength={120} /></label>
        <label className="champ large"><span>Votre plus gros casse-tête administratif</span><textarea name="casseTete" maxLength={600} placeholder="Les soumissions le soir, les demandes éparpillées…" /></label>
      </div>
      <button className="btn" disabled={occupe || jours === null}>{occupe ? "Réservation…" : <>Réserver mes 15 minutes <span aria-hidden="true">→</span></>}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="legal">Vos renseignements servent seulement à préparer notre rencontre.{qui ? ` Votre demande est attribuée à ${qui}, qui vous a recommandé.` : ""} <a href="https://www.agencejutras.com/politique-de-confidentialite.html">Politique de confidentialité</a>.</p>
    </form>
  );
}
