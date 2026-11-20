import Link from "next/link";
import Regles from "../../Regles.tsx";
import { RECOMPENSE } from "@/lib/regles.ts";

// « Comment ça fonctionne » : le programme ambassadeur Kairos en trois étapes, puis les règles, sur la même page
// (Alexis, 20 nov. 2026). On tutoie les ambassadeurs.
const ETAPES_SIMPLES = [
  {
    titre: "Partage ton lien",
    texte: "Envoie ton lien personnel à un entrepreneur qui fait ses soumissions le soir : par texto, par courriel ou sur Messenger.",
  },
  {
    titre: "Il réserve un rendez-vous",
    texte: "S'il réserve un rendez-vous grâce à ton lien, il t'est attribué automatiquement.",
  },
  {
    titre: `Tu reçois ${RECOMPENSE} $`,
    texte: `S'il devient ensuite client de Kairos, tu reçois ${RECOMPENSE} $ par Interac. Simple de même.`,
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
      </div>

      <h2 id="regles" className="titre cf-titre-regles">Les <em>règles</em></h2>
      <p className="sous">Simples, et les mêmes pour tout le monde.</p>
      <Regles />
    </>
  );
}
