// Le parcours des références de l'ambassadeur, en entonnoir vertical (décision d'Alexis du 19 nov. 2026) :
// les 7 noms du lexique (Visites du lien + les 6 étapes), la largeur de chaque bande suit son nombre.
// La couleur se réchauffe vers l'argent. Chaque nombre inclut ceux qui sont allés plus loin.
type Bande = { n: number; texte: string; note?: string };

const MIN = 34; // % : une bande à zéro reste lisible

export default function Entonnoir({ bandes }: { bandes: Bande[] }) {
  const plus = Math.max(1, ...bandes.map((b) => b.n));
  return (
    <ol className="entonnoir-v" aria-label="Le parcours de vos références">
      {bandes.map((b, i) => (
        <li key={b.texte} className={`bande bande-${i + 1}`} style={{ width: `${Math.round(MIN + ((100 - MIN) * b.n) / plus)}%` }}>
          <span>{b.texte}{b.note && <small> · {b.note}</small>}</span>
          <b>{b.n}</b>
        </li>
      ))}
    </ol>
  );
}
