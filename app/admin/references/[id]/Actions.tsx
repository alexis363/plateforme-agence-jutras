"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ETAPES = ["Demande reçue", "Contacté", "Rencontre", "Devenu client", "Premier paiement", "Ambassadeur payé"];

export default function Actions({ id, etape, fermee, notes }: { id: string; etape: number; fermee: string | null; notes: string }) {
  const router = useRouter();
  const [occupe, setOccupe] = useState(false);
  const [texte, setTexte] = useState(notes);
  const [msg, setMsg] = useState("");

  async function maj(corps: object, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setOccupe(true);
    const rep = await fetch(`/api/admin/references/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
    setOccupe(false);
    setMsg(rep.ok ? "✓ Enregistré" : "Erreur : rien n'a changé.");
    if (rep.ok) router.refresh();
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <>
      {!fermee && (
        <div className="boutons-etapes">
          {ETAPES.map((e, i) => (
            <button key={e} className={`btn-2${i + 1 === etape ? " actif" : ""}`} disabled={occupe || i + 1 === etape}
              onClick={() => maj({ etape: i + 1 }, i + 1 === 6 ? "Confirmez que la récompense a été versée par Interac." : undefined)}>
              {i + 1}. {e}
            </button>
          ))}
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        {fermee
          ? <button className="lien" disabled={occupe} onClick={() => maj({ fermee: null })}>Rouvrir la référence</button>
          : <button className="lien" disabled={occupe} onClick={() => {
              const raison = window.prompt("Pourquoi fermer cette référence? (ex. : pas intéressé)");
              if (raison) maj({ fermee: raison });
            }}>Fermer la référence</button>}
      </div>
      <label className="champ" style={{ marginTop: 18 }}><span>Notes privées (jamais montrées au membre)</span>
        <textarea value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={2000} />
      </label>
      <button className="btn" disabled={occupe || texte === notes} onClick={() => maj({ notes: texte })}>Enregistrer les notes</button>
      <span className="ok" style={{ marginLeft: 14 }} role="status">{msg}</span>
    </>
  );
}
