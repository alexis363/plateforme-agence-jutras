"use client";
import { useState } from "react";
import Link from "next/link";

export default function Formulaire({ local }: { local: boolean }) {
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setOccupe(true);
    setErreur("");
    const rep = await fetch("/api/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courriel: f.get("courriel"), motDePasse: f.get("motDePasse") }),
    });
    const corps = await rep.json().catch(() => ({}));
    if (rep.ok && corps.vers) return window.location.assign(corps.vers);
    setOccupe(false);
    setErreur(corps.erreur ?? "Une erreur est survenue. Réessayez.");
  }

  return (
    <form onSubmit={envoyer}>
      <label className="champ"><span>Courriel</span><input name="courriel" type="email" required autoComplete="email" /></label>
      <label className="champ"><span>Mot de passe</span><input name="motDePasse" type="password" required autoComplete="current-password" /></label>
      <button className="btn" disabled={occupe}>{occupe ? "Connexion…" : "Se connecter"}</button>
      <p className="erreur" role="alert">{erreur}</p>
      <p className="bas" style={{ marginTop: 4 }}><Link href="/mot-de-passe-oublie">Mot de passe oublié?</Link></p>
      {local && erreur.includes("Confirmez") && <p className="local">Sur l'ordinateur, les courriels arrivent dans la <a href="/dev/courriels">boîte locale</a>.</p>}
    </form>
  );
}
