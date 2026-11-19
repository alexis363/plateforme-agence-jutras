"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ETAPES, RECOMPENSE } from "@/lib/regles.ts";

export type Fiche = { id: string; etape: number; entreprise: string; contact: string; source: string; parAmbassadeur: boolean; quand: string };

// Le pipeline des prospects : une colonne par étape, des fiches qu'on glisse (ordinateur) ou qu'on avance avec
// les flèches (téléphone). Une zone « Fermer » en bas, comme « Lost » dans GoHighLevel.
export default function Pipeline({ fiches: depart }: { fiches: Fiche[] }) {
  const router = useRouter();
  const [fiches, setFiches] = useState(depart);
  const [tiree, setTiree] = useState<string | null>(null);
  const [survol, setSurvol] = useState<number | "fermer" | null>(null);
  const [msg, setMsg] = useState("");

  async function patch(id: string, corps: object): Promise<boolean> {
    const rep = await fetch(`/api/admin/references/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
    return rep.ok;
  }

  async function deplacer(id: string, etape: number) {
    const f = fiches.find((x) => x.id === id);
    if (!f || f.etape === etape) return;
    if (etape === 6 && f.parAmbassadeur && !window.confirm(`Confirmez que la récompense de ${RECOMPENSE} $ a été versée par Interac.`)) return;
    const avant = fiches;
    setFiches((l) => l.map((x) => (x.id === id ? { ...x, etape } : x)));
    if (await patch(id, { etape })) { setMsg(`✓ ${f.entreprise} : ${ETAPES[etape - 1]}`); router.refresh(); }
    else { setFiches(avant); setMsg("Erreur : la fiche n'a pas bougé."); }
  }

  async function fermer(id: string) {
    const f = fiches.find((x) => x.id === id);
    const raison = f && window.prompt(`Pourquoi fermer ${f.entreprise}? (ex. : pas intéressé)`);
    if (!f || !raison) return;
    const avant = fiches;
    setFiches((l) => l.filter((x) => x.id !== id));
    if (await patch(id, { fermee: raison })) { setMsg(`✓ ${f.entreprise} est fermé`); router.refresh(); }
    else { setFiches(avant); setMsg("Erreur : la fiche n'a pas bougé."); }
  }

  const deposer = (cible: number | "fermer") => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || tiree;
    setSurvol(null); setTiree(null);
    if (id) cible === "fermer" ? fermer(id) : deplacer(id, cible);
  };
  const zone = (cible: number | "fermer") => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setSurvol(cible); },
    onDragLeave: () => setSurvol((s) => (s === cible ? null : s)),
    onDrop: deposer(cible),
  });

  return (
    <>
      <div className="pipeline">
        {ETAPES.map((nom, i) => {
          const etape = i + 1;
          const liste = fiches.filter((f) => f.etape === etape);
          return (
            <section key={nom} className={`colonne${survol === etape ? " survol" : ""}${etape === 1 || etape === 5 ? " a-faire" : ""}`} {...zone(etape)}>
              <header><b>{etape}. {nom}</b><span>{liste.length}</span></header>
              {liste.map((f) => (
                <article key={f.id} className={`fiche${tiree === f.id ? " tiree" : ""}`} draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", f.id); setTiree(f.id); }}
                  onDragEnd={() => { setTiree(null); setSurvol(null); }}>
                  <Link href={`/admin/references/${f.id}`} className="fiche-titre">{f.entreprise}</Link>
                  <small>{f.contact}</small>
                  <small className={`fiche-source${f.parAmbassadeur ? "" : " site"}`}>{f.parAmbassadeur ? `Référé par ${f.source}` : f.source}</small>
                  <small>{f.quand}</small>
                  <div className="fiche-fleches">
                    <button type="button" disabled={etape === 1} onClick={() => deplacer(f.id, etape - 1)} aria-label={`Ramener ${f.entreprise} à l'étape ${etape - 1}`}>←</button>
                    <button type="button" disabled={etape === 6} onClick={() => deplacer(f.id, etape + 1)} aria-label={`Avancer ${f.entreprise} à l'étape ${etape + 1}`}>→</button>
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
      <div className={`zone-fermer${survol === "fermer" ? " survol" : ""}`} {...zone("fermer")}>Glissez une fiche ici pour fermer le prospect</div>
      <p className="ok" role="status" style={{ minHeight: 18 }}>{msg}</p>
    </>
  );
}
