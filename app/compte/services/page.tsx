export default function Services() {
  return (
    <>
      <h1 className="titre">Nos <em>services</em></h1>
      <p className="sous">Vous êtes vous-même entrepreneur? Votre espace client s'ouvre dès votre premier service.</p>
      <div className="bloc" style={{ borderLeft: "4px solid var(--olive)", maxWidth: 720, marginBottom: 16 }}>
        <div className="etiq">En service</div>
        <h2>Kairos Soumission</h2>
        <p style={{ margin: 0, color: "var(--sec)", fontSize: 14 }}>Toutes vos demandes au même endroit, une tournée de visites qui se planifie seule, des devis dictés à la voix.</p>
      </div>
      <div className="bloc" style={{ borderLeft: "4px solid var(--bordeaux)", maxWidth: 720, marginBottom: 22 }}>
        <div className="etiq">Sur mesure</div>
        <h2>Votre irritant n'est pas dans la liste?</h2>
        <p style={{ margin: 0, color: "var(--sec)", fontSize: 14 }}>On regarde la tâche qui revient chaque semaine et on bâtit l'outil qui la règle.</p>
      </div>
      <a className="btn" href="https://www.agencejutras.com/#contact">On se parle 15 minutes?</a>
    </>
  );
}
