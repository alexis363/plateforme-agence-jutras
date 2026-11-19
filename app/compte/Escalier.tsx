// Le parcours des références de l'ambassadeur, en escalier qui descend (demande d'Alexis du 19 nov. 2026) :
// la hauteur de chaque marche suit son nombre, comme un entonnoir couché. La couleur se réchauffe vers l'argent.
type Marche = { n: number; texte: string; note?: string };

// Hauteurs en pixels. C'est une hauteur minimale : si le texte demande plus de place (petit écran, note « 100 $
// chacun »), la marche grandit au lieu de laisser le texte déborder (demande d'Alexis du 19 nov. 2026).
const MIN = 104, MAX = 220;

export default function Escalier({ marches }: { marches: Marche[] }) {
  const plus = Math.max(1, ...marches.map((m) => m.n));
  return (
    <div className="escalier" role="list" aria-label="Le parcours de vos références">
      {marches.map((m, i) => (
        <div key={m.texte} role="listitem" className={`marche marche-${i + 1}`} style={{ minHeight: Math.round(MIN + ((MAX - MIN) * m.n) / plus) }}>
          {m.note && <small className="marche-note">{m.note}</small>}
          <b>{m.n}</b>
          <span>{m.texte}</span>
        </div>
      ))}
    </div>
  );
}
