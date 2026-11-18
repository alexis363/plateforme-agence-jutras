"use client";
import { useState } from "react";

// La page de réservation Google d'Alexis, la même que sur le site (agencejutras.com, section contact).
const AGENDA = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2rf0pkYJiDEFPNuvUroU_E617grZ2-LitCoBvRcUXLQ-f_Olx2UAg9QTdR7Oy-3pzrp2rNwExM?gv=true";
const AGENDA_ONGLET = "https://calendar.app.google/4XiSMLPryGaq8Hou8";

// Deux temps : 1. l'entrepreneur se présente (la demande est attribuée au membre, même s'il ne réserve pas) ;
// 2. il choisit sa plage dans l'agenda Google, qui envoie lui-même la confirmation.
export default function FormulaireRdv({ slug, qui }: { slug: string; qui: string | null }) {
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [prenom, setPrenom] = useState<string | null>(null);

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setOccupe(true);
    setErreur("");
    const rep = await fetch(`/api/r/${encodeURIComponent(slug)}/demande`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: f.get("contact"), entreprise: f.get("entreprise"), metier: f.get("metier"),
        cellulaire: f.get("cellulaire"), courriel: f.get("courriel") ?? "", casseTete: f.get("casseTete") ?? "",
        moment: "Plage choisie dans l'agenda Google",
      }),
    });
    setOccupe(false);
    if (rep.ok) setPrenom(String(f.get("contact")).trim().split(/\s+/)[0] || "");
    else setErreur((await rep.json().catch(() => ({}))).erreur ?? "Une erreur est survenue. Appelez-moi au 581-349-1258.");
  }

  if (prenom !== null)
    return (
      <div className="formrdv">
        <span className="reco-tag">✓ Étape 1 faite{qui ? ` · recommandé par ${qui}` : ""}</span>
        <h3>Merci{prenom ? ` ${prenom}` : ""}. Choisissez votre plage.</h3>
        <p className="s">Mes disponibilités, en direct. Vous recevez la confirmation par courriel, et je vous appelle à l'heure choisie.</p>
        <iframe className="agenda" src={AGENDA} title="Choisir une plage de 15 minutes avec Alexis Jutras" />
        <p className="legal">L'agenda ne s'affiche pas? <a href={AGENDA_ONGLET} target="_blank" rel="noopener">Ouvrez-le dans un nouvel onglet</a>, ou écrivez-moi au 581-349-1258.</p>
      </div>
    );

  return (
    <form className="formrdv" onSubmit={envoyer}>
      {qui && <span className="reco-tag">✓ Recommandé par {qui}</span>}
      <h3>Réservez vos 15 minutes</h3>
      <p className="s">Étape 1 sur 2 : présentez-vous. À l'étape 2, vous choisissez votre plage dans mon agenda.</p>
      <div className="champs">
        <label className="champ"><span>Prénom et nom</span><input name="contact" required maxLength={80} placeholder="Martin Roy" /></label>
        <label className="champ"><span>Entreprise</span><input name="entreprise" required maxLength={80} placeholder="Paysagement Roy" /></label>
        <label className="champ"><span>Métier</span><input name="metier" required maxLength={60} placeholder="Émondage, ramonage…" /></label>
        <label className="champ"><span>Cellulaire</span><input name="cellulaire" required inputMode="tel" placeholder="418-555-0123" /></label>
        <label className="champ large"><span>Courriel (facultatif)</span><input name="courriel" type="email" maxLength={120} /></label>
        <label className="champ large"><span>Votre plus gros casse-tête administratif</span><textarea name="casseTete" maxLength={600} placeholder="Les soumissions le soir, les demandes éparpillées…" /></label>
      </div>
      <button className="btn" disabled={occupe}>{occupe ? "Envoi…" : <>Voir mes disponibilités <span aria-hidden="true">→</span></>}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="legal">Vos renseignements servent seulement à préparer notre appel.{qui ? ` Votre demande est attribuée à ${qui}, qui vous a recommandé.` : ""} <a href="https://www.agencejutras.com/politique-de-confidentialite.html">Politique de confidentialité</a>.</p>
    </form>
  );
}
