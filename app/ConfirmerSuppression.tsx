"use client";
import { useRef, useState } from "react";

// Supprimer un compte en trois confirmations (exigence d'Alexis du 18 nov. 2026), pour le membre comme pour la console :
//  1. lire ce qui sera perdu et cocher « Je comprends » ;
//  2. écrire un mot à la main (SUPPRIMER, ou le courriel du membre dans la console) ;
//  3. le dernier bouton (avec le mot de passe, pour le membre).
type Props = {
  bouton: string; // le texte du bouton qui ouvre la fenêtre
  boutonClasse?: string;
  titre: string;
  pertes: string[];
  motAEcrire: string;
  consigneMot: string;
  demanderMotDePasse: boolean;
  url: string;
  corps: (mot: string, motDePasse: string) => object;
  apres: () => void;
};

export default function ConfirmerSuppression(p: Props) {
  const fenetre = useRef<HTMLDialogElement>(null);
  const [etape, setEtape] = useState(1);
  const [compris, setCompris] = useState(false);
  const [mot, setMot] = useState("");
  const [mdp, setMdp] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  const motOk = p.motAEcrire.includes("@")
    ? mot.trim().toLowerCase() === p.motAEcrire.toLowerCase()
    : mot.trim().toUpperCase() === p.motAEcrire;

  function ouvrir() {
    setEtape(1); setCompris(false); setMot(""); setMdp(""); setErreur("");
    fenetre.current?.showModal();
  }
  const fermer = () => fenetre.current?.close();

  async function supprimer() {
    setOccupe(true);
    setErreur("");
    const rep = await fetch(p.url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p.corps(mot, mdp)) });
    setOccupe(false);
    if (rep.ok) { fermer(); p.apres(); return; }
    setErreur((await rep.json().catch(() => ({}))).erreur ?? "Une erreur est survenue. Rien n'a été supprimé.");
  }

  return (
    <>
      <button type="button" className={p.boutonClasse ?? "btn-danger"} onClick={ouvrir}>{p.bouton}</button>
      <dialog ref={fenetre} className="suppression" aria-labelledby="supp-titre">
        <p className="supp-etape">Confirmation {etape} sur 3</p>
        <h2 id="supp-titre">{p.titre}</h2>

        {etape === 1 && (
          <>
            <p>Ce qui sera supprimé, <b>pour de bon</b> :</p>
            <ul>{p.pertes.map((x) => <li key={x}>{x}</li>)}</ul>
            <label className="supp-coche"><input type="checkbox" checked={compris} onChange={(e) => setCompris(e.target.checked)} /> Je comprends que c'est définitif.</label>
            <div className="supp-boutons">
              <button type="button" className="btn-2" onClick={fermer}>Annuler</button>
              <button type="button" className="btn-danger" disabled={!compris} onClick={() => setEtape(2)}>Continuer</button>
            </div>
          </>
        )}

        {etape === 2 && (
          <>
            <p>{p.consigneMot} <b className="supp-mot">{p.motAEcrire}</b></p>
            <label className="champ"><span>Confirmation</span>
              <input value={mot} onChange={(e) => setMot(e.target.value)} autoComplete="off" autoFocus spellCheck={false} />
            </label>
            <div className="supp-boutons">
              <button type="button" className="btn-2" onClick={fermer}>Annuler</button>
              <button type="button" className="btn-danger" disabled={!motOk} onClick={() => setEtape(3)}>Continuer</button>
            </div>
          </>
        )}

        {etape === 3 && (
          <>
            <p>Dernière étape. Après ce clic, il n'y a pas de retour possible.</p>
            {p.demanderMotDePasse && (
              <label className="champ"><span>Votre mot de passe</span>
                <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" autoFocus />
              </label>
            )}
            <p className="erreur" role="alert">{erreur}</p>
            <div className="supp-boutons">
              <button type="button" className="btn-2" onClick={fermer}>Annuler</button>
              <button type="button" className="btn-danger" disabled={occupe || (p.demanderMotDePasse && !mdp)} onClick={supprimer}>
                {occupe ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
