import { RECOMPENSE, VALIDITE_MOIS, PRODUIT } from "@/lib/regles.ts";

// Les règles du programme, telles que décidées par Alexis. Affichées dans le compte et sur la page publique /regles.
export default function Regles() {
  const regles: [string, string][] = [
    [`${RECOMPENSE} $ par entrepreneur qui devient client de ${PRODUIT}`, `Sans limite : 3 références, ${3 * RECOMPENSE} $ ; 10 références, ${(10 * RECOMPENSE).toLocaleString("fr-CA")} $.`],
    ["Versés dans les 24 h suivant son premier paiement", "Par virement Interac, au courriel de votre compte. Le premier paiement arrive après son mois offert."],
    ["C'est l'entrepreneur qui remplit sa demande", "Par votre lien. Il donne lui-même ses coordonnées : personne n'est inscrit sans le savoir."],
    ["Le premier qui réfère gagne", "Si deux personnes présentent la même entreprise, la première demande datée compte."],
    [`Une référence vaut ${VALIDITE_MOIS} mois`, `L'entrepreneur a ${VALIDITE_MOIS} mois après sa demande pour devenir client ; elle vous reste attribuée pendant tout ce temps.`],
    ["On ne se réfère pas soi-même", "Votre propre entreprise ne compte pas."],
  ];
  return (
    <div className="bloc" style={{ maxWidth: 720 }}>
      {regles.map(([titre, detail], i) => (
        <div className="ligne" key={i}><span className="n">{i + 1}</span><div><b>{titre}</b><small>{detail}</small></div></div>
      ))}
    </div>
  );
}
