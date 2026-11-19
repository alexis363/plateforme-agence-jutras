// Le parcours des références de l'ambassadeur, en escalier qui descend (demande d'Alexis du 19 nov. 2026) :
// la hauteur de chaque marche suit son nombre, comme un entonnoir couché. La couleur se réchauffe vers l'argent.
type Marche = { n: number; texte: string; note?: string };

const MIN = 76, MAX = 200; // hauteurs en pixels : une marche à zéro reste lisible

export default function Escalier({ marches }: { marches: Marche[] }) {
  const plus = Math.max(1, ...marches.map((m) => m.n));
  return (
    <div className="escalier" role="list" aria-label="Le parcours de vos références">
      {marches.map((m, i) => (
        <div key={m.texte} role="listitem" className={`marche marche-${i + 1}`} style={{ height: Math.round(MIN + ((MAX - MIN) * m.n) / plus) }}>
          {m.note && <small className="marche-note">{m.note}</small>}
          <b>{m.n}</b>
          <span>{m.texte}</span>
        </div>
      ))}
    </div>
  );
}
