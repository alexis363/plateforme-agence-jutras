"use client";
import { useState } from "react";

export default function ChangerMotDePasse() {
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);
  const [occupe, setOccupe] = useState(false);

  async function changer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (String(f.get("nouveau")).length < 10) return setMsg({ ok: false, texte: "Le nouveau mot de passe doit avoir au moins 10 caractères." });
    if (f.get("nouveau") !== f.get("nouveau2")) return setMsg({ ok: false, texte: "Les deux nouveaux mots de passe ne sont pas pareils." });
    setOccupe(true);
    const rep = await fetch("/api/mot-de-passe", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actuel: f.get("actuel"), nouveau: f.get("nouveau") }),
    });
    setOccupe(false);
    if (rep.ok) { form.reset(); setMsg({ ok: true, texte: "✓ Mot de passe changé" }); }
    else setMsg({ ok: false, texte: (await rep.json().catch(() => ({}))).erreur ?? "Une erreur est survenue." });
  }

  return (
    <form onSubmit={changer}>
      <label className="champ"><span>Mot de passe actuel</span><input name="actuel" type="password" required autoComplete="current-password" /></label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="champ"><span>Nouveau</span><input name="nouveau" type="password" required minLength={10} autoComplete="new-password" /></label>
        <label className="champ"><span>Encore une fois</span><input name="nouveau2" type="password" required minLength={10} autoComplete="new-password" /></label>
      </div>
      <button className="btn" disabled={occupe}>{occupe ? "Enregistrement…" : "Changer le mot de passe"}</button>
      {msg && <p className={msg.ok ? "ok" : "erreur"} role="status" style={{ marginTop: 10 }}>{msg.texte}</p>}
    </form>
  );
}
