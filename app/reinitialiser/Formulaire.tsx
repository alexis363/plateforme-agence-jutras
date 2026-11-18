"use client";
import { useState } from "react";

export default function Formulaire({ jeton }: { jeton: string }) {
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("motDePasse")).length < 10) return setErreur("Le mot de passe doit avoir au moins 10 caractères.");
    if (f.get("motDePasse") !== f.get("motDePasse2")) return setErreur("Les deux mots de passe ne sont pas pareils.");
    setOccupe(true);
    setErreur("");
    const rep = await fetch("/api/reinitialiser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jeton, motDePasse: f.get("motDePasse") }),
    });
    const corps = await rep.json().catch(() => ({}));
    if (rep.ok && corps.vers) return window.location.assign(corps.vers);
    setOccupe(false);
    setErreur(corps.erreur ?? "Une erreur est survenue. Réessayez.");
  }

  return (
    <form onSubmit={envoyer}>
      <label className="champ"><span>Nouveau mot de passe</span><input name="motDePasse" type="password" required minLength={10} autoComplete="new-password" /></label>
      <label className="champ"><span>Encore une fois</span><input name="motDePasse2" type="password" required minLength={10} autoComplete="new-password" /></label>
      <button className="btn" disabled={occupe}>{occupe ? "Enregistrement…" : "Enregistrer et me connecter"}</button>
      <p className="erreur" role="alert">{erreur}</p>
    </form>
  );
}
