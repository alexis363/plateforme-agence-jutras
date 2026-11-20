import Link from "next/link";
import { RECOMPENSE } from "@/lib/regles.ts";

// « Comment ça fonctionne » : le programme ambassadeur Kairos en trois étapes (Alexis, 20 nov. 2026).
const ETAPES_SIMPLES = [
  {
    titre: "Partagez votre lien",
    texte: "Envoyez votre lien personnel à un entrepreneur qui fait ses soumissions le soir : par texto, par courriel ou sur Messenger.",
  },
  {
    titre: "Il réserve un rendez-vous",
    texte: "S'il réserve un rendez-vous grâce à votre lien, il vous est attribué automatiquement.",
  },
  {
    titre: `Vous recevez ${RECOMPENSE} $`,
    texte: `S'il devient ensuite client de Kairos, vous recevez ${RECOMPENSE} $ par Interac. Simple de même.`,
  },
];

export default function CommentCaFonctionne() {
  return (
    <>
      <h1 className="titre">Comment ça <em>fonctionne</em></h1>
      <p className="sous">Le programme ambassadeur Kairos, en trois étapes.</p>
      <ol className="cf-etapes">
        {ETAPES_SIMPLES.map((e, i) => (
          <li key={i}>
            <span className="cf-num">{i + 1}</span>
            <h2>{e.titre}</h2>
            <p>{e.texte}</p>
          </li>
        ))}
      </ol>
      <div className="cf-bas">
        <Link className="btn" href="/compte">Voir mon lien</Link>
        <Link className="cf-regles" href="/compte/regles">Les règles en détail →</Link>
      </div>
    </>
  );
}
