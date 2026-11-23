"use client";
import { useState } from "react";

export default function Formulaire(_: { local?: boolean }) {
  const [etat, setEtat] = useState<"saisie" | "envoi">("saisie");
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("motDePasse")).length < 10) return setErreur("Le mot de passe doit avoir au moins 10 caractères.");
    if (f.get("motDePasse") !== f.get("motDePasse2")) return setErreur("Les deux mots de passe ne sont pas pareils.");
    if (!f.get("regles")) return setErreur("Acceptez les règles du programme pour continuer.");
    setEtat("envoi");
    setErreur("");
    const rep = await fetch("/api/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: f.get("prenom"), nom: f.get("nom"), cellulaire: f.get("cellulaire"), courriel: f.get("courriel"), motDePasse: f.get("motDePasse"),
        accepteRegles: true, prenomVisible: f.get("prenomVisible") === "on",
      }),
    });
    const corps = await rep.json().catch(() => ({}));
    // Plus de courriel à confirmer (23 nov. 2026) : on entre directement dans son espace.
    if (rep.ok) { window.location.href = corps.vers ?? "/compte"; return; }
    setErreur(corps.erreur ?? "Une erreur est survenue. Réessayez.");
    setEtat("saisie");
  }

  return (
    <form onSubmit={envoyer} noValidate={false}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="champ"><span>Prénom</span><input name="prenom" required maxLength={60} autoComplete="given-name" /></label>
        <label className="champ"><span>Nom</span><input name="nom" required maxLength={60} autoComplete="family-name" /></label>
      </div>
      <label className="champ"><span>Cellulaire</span><input name="cellulaire" required inputMode="tel" placeholder="418-555-0123" autoComplete="tel" /></label>
      <label className="champ"><span>Courriel (aussi pour vos virements Interac)</span><input name="courriel" type="email" required autoComplete="email" /></label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="champ"><span>Mot de passe</span><input name="motDePasse" type="password" required minLength={10} autoComplete="new-password" /></label>
        <label className="champ"><span>Encore une fois</span><input name="motDePasse2" type="password" required minLength={10} autoComplete="new-password" /></label>
      </div>
      <p className="note" style={{ margin: "-6px 0 14px" }}>Au moins 10 caractères. Une courte phrase se retient mieux qu'un mot compliqué.</p>
      <label className="case"><input type="checkbox" name="regles" /> J'accepte les <a href="/regles" target="_blank">règles du programme ambassadeur Kairos</a>.</label>
      <label className="case"><input type="checkbox" name="prenomVisible" defaultChecked /> Mon prénom peut apparaître sur la page de mon lien (« Sophie vous recommande l'Agence Jutras »).</label>
      <button className="btn" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "Obtenir mon lien"}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="note" style={{ margin: 0 }}>Vos renseignements servent seulement au programme ambassadeur Kairos et à vous verser vos récompenses.</p>
    </form>
  );
}
