"use client";
import { useEffect, useState } from "react";

type Jour = { date: string; libelle: string; plages: { debut: string; heure: string }[] };

// Un seul formulaire (exigence d'Alexis du 18 nov. 2026) : les coordonnées et la plage, ensemble.
// Les plages sont les vraies disponibilités d'Alexis, lues dans son agenda Google.
export default function FormulaireRdv({ slug, qui }: { slug: string; qui: string | null }) {
  const [jours, setJours] = useState<Jour[] | null>(null);
  const [jour, setJour] = useState(0);
  const [debut, setDebut] = useState<string | null>(null);
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
        <p style={{ color: "var(--sec)" }}>{fait.moment ? `Je vous appelle ${fait.moment}.` : "Je vous appelle sous peu pour fixer le moment."}</p>
        <p style={{ color: "var(--sec)", fontSize: 14 }}>Si vous avez laissé votre courriel, l'invitation est dans votre boîte. Un empêchement? Écrivez-moi au 581-349-1258.</p>
      </div></div>
    );

  const plages = jours?.[jour]?.plages ?? [];
  return (
    <form className="formrdv" onSubmit={envoyer}>
      {qui && <span className="reco-tag">✓ Recommandé par {qui}</span>}
      <h3>Réservez vos 15 minutes</h3>
      <p className="s">Choisissez votre plage : je vous appelle à l'heure choisie.</p>

      {jours === null && <p className="s">Chargement de mes disponibilités…</p>}
      {jours?.length === 0 && (
        <p className="erreur" style={{ marginBottom: 16 }}>Aucune plage libre cette semaine ni la suivante. Laissez vos coordonnées : je vous appelle pour en trouver une.</p>
      )}
      {!!jours?.length && (
        <>
          <div className="jours">
            {jours.map((j, i) => {
              const [nom, num] = j.libelle.split(" ");
              return (
                <button type="button" key={j.date} className={`jour${i === jour ? " actif" : ""}`} onClick={() => { setJour(i); setDebut(null); }}>
                  <small>{nom}</small><b>{num}</b>
                </button>
              );
            })}
          </div>
          <div className="heures">
            {plages.map((p) => (
              <button type="button" key={p.debut} className={`heure${p.debut === debut ? " actif" : ""}`} onClick={() => { setDebut(p.debut); setErreur(""); }}>{p.heure}</button>
            ))}
          </div>
        </>
      )}

      <div className="champs">
        <label className="champ"><span>Prénom</span><input name="prenom" required maxLength={40} autoComplete="given-name" placeholder="Martin" /></label>
        <label className="champ"><span>Nom</span><input name="nom" required maxLength={40} autoComplete="family-name" placeholder="Roy" /></label>
        <label className="champ"><span>Nom de votre entreprise</span><input name="entreprise" required maxLength={80} autoComplete="organization" placeholder="Paysagement Roy" /></label>
        <label className="champ"><span>Cellulaire</span><input name="cellulaire" required inputMode="tel" placeholder="418-555-0123" /></label>
        <label className="champ large"><span>Courriel (pour recevoir l'invitation)</span><input name="courriel" type="email" maxLength={120} /></label>
        <label className="champ large"><span>Votre plus gros casse-tête administratif</span><textarea name="casseTete" maxLength={600} placeholder="Les soumissions le soir, les demandes éparpillées…" /></label>
      </div>
      <button className="btn" disabled={occupe || jours === null}>{occupe ? "Réservation…" : <>Réserver mes 15 minutes <span aria-hidden="true">→</span></>}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="legal">Vos renseignements servent seulement à préparer notre appel.{qui ? ` Votre demande est attribuée à ${qui}, qui vous a recommandé.` : ""} <a href="https://www.agencejutras.com/politique-de-confidentialite.html">Politique de confidentialité</a>.</p>
    </form>
  );
}
