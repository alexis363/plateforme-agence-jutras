"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReglagesAgenda } from "@/lib/types.ts";

// Lundi en premier, comme une semaine de travail.
const JOURS: [string, string][] = [["1", "Lundi"], ["2", "Mardi"], ["3", "Mercredi"], ["4", "Jeudi"], ["5", "Vendredi"], ["6", "Samedi"], ["0", "Dimanche"]];
const DUREES = [10, 15, 20, 30, 45, 60];
const PAUSES = [0, 5, 10, 15, 30];

type Plage = [string, string];

export default function FormulaireReglages({ initial }: { initial: ReglagesAgenda }) {
  const router = useRouter();
  const [duree, setDuree] = useState(initial.duree);
  const [pause, setPause] = useState(initial.pause);
  const [dispo, setDispo] = useState<Record<string, Plage[]>>(() =>
    Object.fromEntries(JOURS.map(([j]) => [j, initial.disponibilites[j] ?? []])));
  const [occupe, setOccupe] = useState(false);
  const [msg, setMsg] = useState("");

  const changer = (j: string, i: number, k: 0 | 1, v: string) =>
    setDispo((d) => ({ ...d, [j]: d[j].map((p, n): Plage => (n !== i ? p : k === 0 ? [v, p[1]] : [p[0], v])) }));
  const ajouter = (j: string) =>
    setDispo((d) => {
      const der = d[j][d[j].length - 1];
      const nouvelle: Plage = der ? [der[1], der[1] < "22:00" ? "23:00" : "23:55"] : ["19:00", "21:00"];
      return { ...d, [j]: [...d[j], nouvelle] };
    });
  const retirer = (j: string, i: number) => setDispo((d) => ({ ...d, [j]: d[j].filter((_, n) => n !== i) }));

  async function enregistrer() {
    setOccupe(true);
    setMsg("");
    const rep = await fetch("/api/admin/reglages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duree, pause, disponibilites: dispo }),
    });
    const corps = await rep.json().catch(() => ({}));
    setOccupe(false);
    setMsg(rep.ok ? "✓ Enregistré. Les formulaires de réservation montrent déjà vos nouvelles plages." : corps.erreur ?? "Erreur : rien n'a changé.");
    if (rep.ok) router.refresh();
  }

  return (
    <div className="reglages">
      <h2>Les rendez-vous</h2>
      <div className="reg-ligne">
        <label className="champ"><span>Durée d'un rendez-vous</span>
          <select value={duree} onChange={(e) => setDuree(+e.target.value)}>
            {DUREES.map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </label>
        <label className="champ"><span>Temps entre deux rendez-vous</span>
          <select value={pause} onChange={(e) => setPause(+e.target.value)}>
            {PAUSES.map((m) => <option key={m} value={m}>{m ? `${m} minutes` : "Aucun"}</option>)}
          </select>
        </label>
      </div>
      <p className="note">Les plages commencent toujours aux 15 minutes. Quand un rendez-vous est pris, le temps entre deux rendez-vous reste libre avant et après lui (aussi autour de ce qui est dans votre agenda Google).</p>

      <h2 style={{ marginTop: 22 }}>Vos disponibilités par semaine</h2>
      {JOURS.map(([j, nom]) => (
        <div className="reg-jour" key={j}>
          <b>{nom}</b>
          <div className="reg-plages">
            {dispo[j].length === 0 && <span className="note">Indisponible</span>}
            {dispo[j].map((p, i) => (
              <div className="reg-plage" key={i}>
                <input type="time" step={300} value={p[0]} aria-label={`${nom}, début`} onChange={(e) => changer(j, i, 0, e.target.value)} />
                <span>à</span>
                <input type="time" step={300} value={p[1]} aria-label={`${nom}, fin`} onChange={(e) => changer(j, i, 1, e.target.value)} />
                <button type="button" className="reg-retirer" title="Retirer cette plage" aria-label={`Retirer la plage du ${nom.toLowerCase()}`} onClick={() => retirer(j, i)}>×</button>
              </div>
            ))}
            {dispo[j].length < 6 && <button type="button" className="lien" onClick={() => ajouter(j)}>+ Ajouter une plage</button>}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn" disabled={occupe} onClick={enregistrer}>{occupe ? "Enregistrement…" : "Enregistrer"}</button>
        <span className="note" role="status">{msg}</span>
      </div>
    </div>
  );
}
