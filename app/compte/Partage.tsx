"use client";
import { useState } from "react";

const MESSAGE = "Je te recommande l'Agence Jutras : Kairos règle les soumissions (demandes au même endroit, tournée de visites, devis dictés). Réserve 15 minutes ici :";

export default function Partage({ url, affiche, slug }: { url: string; affiche: string; slug: string }) {
  const [msg, setMsg] = useState("");
  const texte = `${MESSAGE} ${url}`;
  const debut = affiche.slice(0, affiche.length - slug.length);

  async function copier() {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Lien copié. Colle-le dans un texto ou un message.");
    } catch {
      setMsg(`Copie ce lien : ${url}`);
    }
    setTimeout(() => setMsg(""), 4000);
  }

  async function partager() {
    if (navigator.share) {
      try { await navigator.share({ title: "Agence Jutras", text: MESSAGE, url }); } catch { /* annulé */ }
    } else copier();
  }

  return (
    <>
      <div className="url"><code>{debut}<b>{slug}</b></code><button className="btn" onClick={copier}>Copier</button></div>
      <div className="partage">
        <a href={`sms:?&body=${encodeURIComponent(texte)}`}><Svg d="M4 5h16v11H9l-5 4Z" />Par texto</a>
        <a href={`mailto:?subject=${encodeURIComponent("Je te recommande l'Agence Jutras")}&body=${encodeURIComponent(texte)}`}><Svg d="M3 5h18v14H3ZM3 7l9 6 9-6" />Courriel</a>
        <button onClick={partager}><Svg d="M12 3v12M8 7l4-4 4 4M5 13v7h14v-7" />Messenger et autres</button>
      </div>
      <div className="copie" role="status">{msg}</div>
    </>
  );
}

function Svg({ d }: { d: string }) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
}
