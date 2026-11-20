"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { METIERS, photoMetier, messageMetier, type Metier } from "@/lib/metiers.ts";

const SEUIL = 110; // px de glissement pour décider

export default function Paquet({ lien }: { lien: string }) {
  const [index, setIndex] = useState(0);
  const [historique, setHistorique] = useState<number[]>([]);
  const [connus, setConnus] = useState<Metier[]>([]);
  const [choisi, setChoisi] = useState<Metier | null>(null);
  const [texte, setTexte] = useState("");
  const [copie, setCopie] = useState("");
  const [glisse, setGlisse] = useState(0);
  const [part, setPart] = useState<0 | 1 | -1>(0); // carte qui s'en va : 1 droite, -1 gauche
  const depart = useRef<number | null>(null);
  const zone = useRef<HTMLTextAreaElement>(null);

  // La zone du message grandit avec le texte : tout le message se lit d'un coup (Alexis, 19 nov. 2026).
  useLayoutEffect(() => {
    const t = zone.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${t.scrollHeight + 2}px`;
  }, [texte, choisi]);

  function decider(connait: boolean) {
    if (index >= METIERS.length || part) return;
    const m = METIERS[index];
    setPart(connait ? 1 : -1);
    if (connait) {
      setConnus((c) => (c.includes(m) ? c : [...c, m]));
      ouvrir(m);
    }
    setTimeout(() => {
      setHistorique((h) => [...h, index]);
      setIndex((i) => i + 1);
      setPart(0);
      setGlisse(0);
    }, 260);
  }

  function ouvrir(m: Metier) {
    setChoisi(m);
    setTexte(messageMetier(m, lien));
    setCopie("");
  }

  function retour() {
    const h = historique.at(-1);
    if (h === undefined) return;
    setHistorique((x) => x.slice(0, -1));
    setIndex(h);
  }

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") decider(true);
      if (e.key === "ArrowLeft") decider(false);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  });

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie("Message copié. Colle-le dans Messenger ou ailleurs.");
    } catch {
      zone.current?.select();
      setCopie("Sélectionné : fais Ctrl+C pour copier.");
    }
  }

  const pile = METIERS.slice(index, index + 3);
  const fini = index >= METIERS.length;

  return (
    <div className="qr-scene">
      <div className="qr-zone">
        <div className="qr-compteurs">
          <div><b>{Math.min(index, METIERS.length)}</b><span>métiers vus</span></div>
          <div><b>{connus.length}</b><span>j'en connais un</span></div>
        </div>

        <div className="qr-paquet" aria-live="polite">
          {fini ? (
            <div className="qr-fin">
              <h2>Tu as fait le tour !</h2>
              <p>{connus.length ? `Tu connais quelqu'un dans ${connus.length} métier${connus.length > 1 ? "s" : ""}. Ta liste est à côté.` : "Personne pour l'instant. Reviens quand tu croiseras un entrepreneur."}</p>
              <button type="button" className="btn" onClick={() => { setIndex(0); setHistorique([]); }}>Recommencer</button>
            </div>
          ) : (
            [...pile].reverse().map((m) => {
              const rang = pile.indexOf(m);
              const dessus = rang === 0;
              const decal = dessus ? (part ? part * 640 : glisse) : 0;
              const style = dessus
                ? { transform: `translateX(${decal}px) rotate(${decal / 18}deg)`, opacity: part ? 0 : 1 }
                : undefined;
              return (
                <article key={m.nom} className={`qr-carte${dessus ? "" : rang === 1 ? " dessous" : " dessous2"}${dessus && depart.current !== null ? " tire" : ""}`} style={style}
                  onPointerDown={dessus ? (e) => { depart.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } : undefined}
                  onPointerMove={dessus ? (e) => { if (depart.current !== null) setGlisse(e.clientX - depart.current); } : undefined}
                  onPointerUp={dessus ? () => { depart.current = null; if (glisse > SEUIL) decider(true); else if (glisse < -SEUIL) decider(false); else setGlisse(0); } : undefined}
                  onPointerCancel={dessus ? () => { depart.current = null; setGlisse(0); } : undefined}>
                  <div className="qr-illus">
                    <img src={photoMetier(m.photo)} alt="" draggable={false} />
                    <span className="qr-voile" aria-hidden="true" />
                    {m.vedette && <span className="qr-vedette">Métier vedette</span>}
                    <span className="qr-numero">{METIERS.indexOf(m) + 1} / {METIERS.length}</span>
                    <svg className="qr-picto" viewBox="0 0 24 24" aria-hidden="true"><path d={m.icone} /></svg>
                    <span className="qr-credit">Photo : Unsplash</span>
                    {dessus && <span className="qr-tampon oui" style={{ opacity: Math.max(0, Math.min(1, glisse / SEUIL)) }}>J'en connais un</span>}
                    {dessus && <span className="qr-tampon non" style={{ opacity: Math.max(0, Math.min(1, -glisse / SEUIL)) }}>Personne</span>}
                  </div>
                  <div className="qr-texte"><h2>{m.nom}</h2><p>{m.phrase}</p></div>
                </article>
              );
            })
          )}
        </div>

        <div className="qr-choix">
          <button type="button" className="qr-rond retour" onClick={retour} aria-label="Revenir à la carte précédente"><svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" /></svg></button>
          <button type="button" className="qr-rond non" onClick={() => decider(false)} aria-label="Personne pour ce métier"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
          <button type="button" className="qr-rond oui" onClick={() => decider(true)} aria-label="J'en connais un"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg></button>
        </div>
        <div className="qr-libelles"><span>Retour</span><span>Personne</span><span>J'en connais un</span></div>
      </div>

      <aside className="qr-cote">
        {choisi && (
          <div className="qr-partage">
            <h3>Envoie-lui <em>ton lien</em></h3>
            <p>Pour ton contact en {choisi.nom.toLowerCase()} : ajoute son prénom, puis envoie.</p>
            <label htmlFor="qr-message" className="qr-cache">Message à envoyer</label>
            <textarea id="qr-message" ref={zone} value={texte} onChange={(e) => setTexte(e.target.value)} rows={4} />
            <div className="qr-boutons">
              <button type="button" className="qr-principal" onClick={copier}>Copier</button>
              <a href={`sms:?&body=${encodeURIComponent(texte)}`}>Par texto</a>
              <a href={`mailto:?subject=${encodeURIComponent("Un logiciel pour tes soumissions")}&body=${encodeURIComponent(texte)}`}>Courriel</a>
            </div>
            <div className="copie" role="status">{copie}</div>
          </div>
        )}
        <div className="bloc">
          <h2>Tes « j'en connais un »</h2>
          {connus.length === 0 ? (
            <p className="vide">Glisse une carte vers la droite pour l'ajouter ici. Tu pourras y revenir pour envoyer ton lien plus tard.</p>
          ) : (
            <ul className="qr-liste">
              {connus.map((m) => (
                <li key={m.nom}><span>{m.nom}</span><button type="button" onClick={() => ouvrir(m)}>Envoyer</button></li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
