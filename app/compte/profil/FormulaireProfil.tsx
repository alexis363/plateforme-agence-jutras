"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormulaireProfil(p: { prenom: string; nom: string; cellulaire: string; prenomVisible: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [occupe, setOccupe] = useState(false);

  async function enregistrer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setOccupe(true);
    const rep = await fetch("/api/profil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom: f.get("prenom"), nom: f.get("nom"), cellulaire: f.get("cellulaire"), prenomVisible: f.get("prenomVisible") === "on" }),
    });
    setOccupe(false);
    setMsg(rep.ok ? "✓ Enregistré" : "Vérifiez les champs, puis réessayez.");
    if (rep.ok) router.refresh();
  }

  return (
    <form onSubmit={enregistrer}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="champ"><span>Prénom</span><input name="prenom" defaultValue={p.prenom} required maxLength={60} /></label>
        <label className="champ"><span>Nom</span><input name="nom" defaultValue={p.nom} required maxLength={60} /></label>
      </div>
      <label className="champ"><span>Cellulaire</span><input name="cellulaire" defaultValue={p.cellulaire} required inputMode="tel" /></label>
      <label className="case"><input type="checkbox" name="prenomVisible" defaultChecked={p.prenomVisible} /> Mon prénom peut apparaître sur la page de mon lien (« {p.prenom} vous recommande l'Agence Jutras »).</label>
      <button className="btn" disabled={occupe}>{occupe ? "Enregistrement…" : "Enregistrer"}</button>
      <span className="ok" style={{ marginLeft: 14 }} role="status">{msg}</span>
    </form>
  );
}
