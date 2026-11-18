"use client";
import { useState } from "react";

export default function Formulaire({ local }: { local: boolean }) {
  const [envoye, setEnvoye] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOccupe(true);
    setErreur("");
    const rep = await fetch("/api/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courriel: new FormData(e.currentTarget).get("courriel") }),
    });
    setOccupe(false);
    if (rep.ok) setEnvoye(true);
    else setErreur((await rep.json().catch(() => ({}))).erreur ?? "Une erreur est survenue. Réessayez.");
  }

  if (envoye)
    return (
      <div>
        <p className="ok" style={{ fontSize: 15 }}>✓ Si un compte existe pour ce courriel, un lien vient de partir.</p>
        <p className="note">Il est valide 30 minutes. Pensez à regarder dans les indésirables.</p>
        {local && <p className="local">Sur l'ordinateur, les courriels arrivent dans la <a href="/dev/courriels">boîte locale</a>.</p>}
      </div>
    );

  return (
    <form onSubmit={envoyer}>
      <label className="champ"><span>Courriel</span><input name="courriel" type="email" required autoComplete="email" /></label>
      <button className="btn" disabled={occupe}>{occupe ? "Envoi…" : "Recevoir le lien"}</button>
      <p className="erreur" role="alert">{erreur}</p>
    </form>
  );
}
