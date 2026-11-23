"use client";
import { useState } from "react";

// La calculatrice d'économie, reprise du site de l'Agence Jutras (demande d'Alexis du 22 nov. 2026).
// Le visiteur entre SES chiffres : rien sur le prix de Kairos, aucun gain promis. Rien n'est envoyé.
type Champ = { cle: string; label: string; min: number; max: number; pas: number; depart: number; aide?: string; fmt: (n: number) => string };

const nf = (n: number) => Math.round(n).toLocaleString("fr-CA");
const hm = (h: number) => { const m = Math.round(h * 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };

const CHAMPS: Champ[] = [
  { cle: "soum", label: "Soumissions par semaine", min: 5, max: 50, pas: 1, depart: 25, fmt: nf },
  { cle: "min", label: "Minutes pour taper un devis, le soir", min: 2, max: 30, pas: 1, depart: 10, fmt: (x) => `${x} min` },
  { cle: "perdues", label: "Demandes oubliées de rappeler, par semaine", min: 0, max: 10, pas: 1, depart: 2, fmt: nf, aide: "Un message vu trop tard, un appel jamais rappelé, une demande oubliée." },
  { cle: "taux", label: "Sur 10 soumissions, combien deviennent des contrats ?", min: 1, max: 10, pas: 1, depart: 4, fmt: (x) => `${x} sur 10` },
  { cle: "valeur", label: "Valeur moyenne d'un contrat", min: 200, max: 10000, pas: 100, depart: 1500, fmt: (x) => `${nf(x)} $` },
  { cle: "sem", label: "Semaines de soumissions par année", min: 10, max: 52, pas: 1, depart: 35, fmt: nf },
];

export default function Calculatrice() {
  const [v, setV] = useState<Record<string, number>>(() => Object.fromEntries(CHAMPS.map((c) => [c.cle, c.depart])));
  const hSemaine = (v.soum * v.min) / 60;
  const heures = hSemaine * v.sem;
  const argent = Math.round((v.perdues * (v.taux / 10) * v.valeur * v.sem) / 100) * 100;

  return (
    <div className="calc-grille">
      <div className="calc-entrees">
        {CHAMPS.map((c) => (
          <div className="inp" key={c.cle}>
            <div className="ligne-inp"><label htmlFor={`c-${c.cle}`}>{c.label}</label><output>{c.fmt(v[c.cle])}</output></div>
            <input type="range" id={`c-${c.cle}`} min={c.min} max={c.max} step={c.pas} value={v[c.cle]}
              style={{ ["--p" as string]: `${((v[c.cle] - c.min) / (c.max - c.min)) * 100}%` }}
              onChange={(e) => setV((x) => ({ ...x, [c.cle]: +e.target.value }))} />
            {c.aide && <small>{c.aide}</small>}
          </div>
        ))}
      </div>
      <div className="calc-resultats" aria-live="polite">
        <div className="res">
          <span className="k">Argent qui vous échappe, par année</span>
          <div className="gros">{nf(argent)} $</div>
          <p>Demandes oubliées × taux de signature × valeur d'un contrat × semaines.</p>
        </div>
        <div className="res">
          <span className="k">Temps passé à taper des devis, par année</span>
          <div className="gros">{nf(heures)}<small>heures</small></div>
          <div className="partage"><span>Chaque semaine</span><b>{hm(hSemaine)}</b><span>En soirées de 3 heures</span><b>{nf(heures / 3)}</b></div>
        </div>
        <p className="calc-note">Les valeurs de départ sont des exemples à remplacer par les vôtres.</p>
      </div>
    </div>
  );
}
