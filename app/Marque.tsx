export default function Marque({ etiquette }: { etiquette?: string }) {
  return (
    <span className="marque">
      <span className="barre" />
      <span className="wordmark">AGENCE JUTRAS</span>
      {etiquette && <small>{etiquette}</small>}
    </span>
  );
}
