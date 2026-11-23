"use client";
import { useEffect, useRef, useState } from "react";

// L'essai de la dictée, repris du site de l'Agence Jutras (demande d'Alexis du 22 nov. 2026) : le visiteur dicte
// ses travaux, un brouillon de devis se remplit. Tout se fait dans son navigateur : rien n'est envoyé ni gardé.
type Ligne = { desc: string; qte: number; prix: number };

const EXEMPLE = "Abattage d'un érable près du garage, 1 200 $. Élagage de 3 cèdres à 150 $ chacun. Ramassage des branches, 250 $.";
const argent = (n: number) => n.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
const nombre = (t: string) => parseFloat(t.replace(/[\s  ]/g, "").replace(",", "."));

// Une phrase = une ligne : « Élagage de 3 cèdres à 150 $ chacun » → 3 × 150 $
function lire(texte: string): Ligne[] {
  const lignes: Ligne[] = [];
  texte.split(/[.;\n]+|,?\s+(?:et ensuite|ensuite|puis)\s+/i).forEach((bout) => {
    const m = bout.match(/(\d[\d\s  ]*(?:[.,]\d{1,2})?)\s*(?:\$|dollars?|piasses?)/i);
    if (!m) return;
    const prix = nombre(m[1]);
    let desc = bout.replace(m[0], "").replace(/\b(chacun|chacune|chaque|l'unité|par unité)\b/gi, "")
      .replace(/[,:]+\s*$|\s+(à|pour|au prix de|ça fait|ça coûte)\s*$/i, "").replace(/^\s*[,:]?\s*/, "").trim();
    const q = desc.match(/\b(\d+)\b/);
    const unitaire = /chacun|chacune|chaque|l'unité|par unité/i.test(bout) && q;
    if (!desc) desc = "Travaux";
    lignes.push({ desc: desc.charAt(0).toUpperCase() + desc.slice(1), qte: unitaire ? parseInt(q![1], 10) : 1, prix });
  });
  return lignes;
}

type Reco = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null; onend: (() => void) | null };

export default function EssaiDictee() {
  const [texte, setTexte] = useState("");
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [ecoute, setEcoute] = useState(false);
  const [offert, setOffert] = useState(true);
  const reco = useRef<Reco | null>(null);
  const base = useRef("");
  const minuterie = useRef<ReturnType<typeof setInterval> | null>(null);
  const dernier = useRef("");

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Reco; webkitSpeechRecognition?: new () => Reco };
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!R) { setOffert(false); return; }
    const r = new R();
    r.lang = "fr-CA"; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let fin = "", provisoire = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript + ". ";
        else provisoire += e.results[i][0].transcript;
      }
      dernier.current = (base.current + fin + provisoire).trim();
      setTexte(dernier.current);
    };
    r.onend = () => { setEcoute(false); if (dernier.current.trim()) setLignes(lire(dernier.current)); };
    reco.current = r;
    return () => { if (minuterie.current) clearInterval(minuterie.current); };
  }, []);

  function micro() {
    const r = reco.current;
    if (!r) return;
    if (ecoute) { r.stop(); return; }
    base.current = texte ? texte.trim() + " " : "";
    dernier.current = texte;
    try { r.start(); } catch { return; }
    setEcoute(true);
  }

  function exemple() {
    if (minuterie.current) clearInterval(minuterie.current);
    let i = 0;
    setTexte("");
    minuterie.current = setInterval(() => {
      i++;
      setTexte(EXEMPLE.slice(0, i));
      if (i >= EXEMPLE.length) { clearInterval(minuterie.current!); setLignes(lire(EXEMPLE)); }
    }, 22);
  }

  const sous = (lignes ?? []).reduce((s, l) => s + l.qte * l.prix, 0);
  const tps = sous * 0.05, tvq = sous * 0.09975;

  return (
    <div className="essai-grille">
      <div>
        <div className="micro-zone">
          <button className="micro" type="button" aria-pressed={ecoute} onClick={micro} disabled={!offert}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" /></svg>
            <span className="micro-onde" aria-hidden="true" />
          </button>
          <b>{!offert ? "Dictée non offerte dans ce navigateur" : ecoute ? "Je vous écoute…" : "Appuyez pour dicter"}</b>
        </div>
        <div className="exemple">
          <span>Essayez, par exemple :</span>
          <q>Abattage d'un érable près du garage, 1&nbsp;200&nbsp;$. Élagage de 3&nbsp;cèdres à 150&nbsp;$ chacun. Ramassage des branches, 250&nbsp;$.</q>
        </div>
        <textarea className="dictee" rows={4} aria-label="Votre dictée" placeholder="Votre dictée s'affichera ici…" value={texte} onChange={(e) => setTexte(e.target.value)} />
        <div className="essai-actions">
          <button className="btn" type="button" onClick={() => setLignes(lire(texte))}>Préparer le devis <span aria-hidden="true">→</span></button>
          <button className="btn ligne" type="button" onClick={exemple}>Voir avec l'exemple</button>
        </div>
      </div>

      <div className="devis-papier" aria-live="polite">
        <div className="devis-haut">
          <div><span className="k">Brouillon de devis</span><b>Votre entreprise</b></div>
          <span className="devis-no">N° 0001</span>
        </div>
        <div className="devis-lignes">
          {lignes === null && <p className="devis-vide">Les lignes apparaîtront ici dès que vous aurez dicté vos travaux.</p>}
          {lignes?.length === 0 && <p className="devis-vide">Aucun montant compris. Dites le prix après chaque travail, par exemple « Élagage d'un érable, 400 $ ».</p>}
          {lignes?.map((l, i) => (
            <div className="ligne-devis" key={`${i}-${l.desc}`} style={{ animationDelay: `${i * 0.15}s` }}>
              <b>{l.desc}</b><span className="m">{argent(l.qte * l.prix)}</span><small>{l.qte > 1 ? `${l.qte} × ${argent(l.prix)}` : "Forfait"}</small>
            </div>
          ))}
        </div>
        <div className="devis-totaux">
          <div><span>Sous-total</span><b>{argent(sous)}</b></div>
          <div><span>TPS (5 %)</span><b>{argent(tps)}</b></div>
          <div><span>TVQ (9,975 %)</span><b>{argent(tvq)}</b></div>
          <div className="total"><span>Total</span><b>{argent(sous + tps + tvq)}</b></div>
        </div>
      </div>
    </div>
  );
}
