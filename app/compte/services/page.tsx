export default function Services() {
  return (
    <>
      <h1 className="titre">Nos <em>services</em></h1>
      <p className="sous">Vous êtes vous-même entrepreneur? Votre espace client s'ouvre dès votre premier service.</p>
      {/* Aux couleurs de Kairos (jamais celles de l'agence), cliquable vers la vitrine Kairos du site (Alexis, 19 nov. 2026). */}
      <a className="carte-kairos" href="https://www.agencejutras.com/#vitrine" target="_blank" rel="noopener">
        <span className="ck-statut">En service</span>
        <span className="ck-logo" aria-label="Kairos Soumission">
          <small>AGENCE JUTRAS</small>
          <b>KAIROS</b>
          <i aria-hidden="true" />
          <small>SOUMISSION</small>
        </span>
        <span className="ck-texte">Toutes vos demandes au même endroit, une tournée de visites qui se planifie seule, des devis dictés à la voix.</span>
        <span className="ck-plus">En savoir plus sur Kairos <span aria-hidden="true">→</span></span>
      </a>
      <div className="bloc" style={{ borderLeft: "4px solid var(--bordeaux)", maxWidth: 720, marginBottom: 22 }}>
        <div className="etiq">Sur mesure</div>
        <h2>Votre irritant n'est pas dans la liste?</h2>
        <p style={{ margin: 0, color: "var(--sec)", fontSize: 14 }}>On regarde la tâche qui revient chaque semaine et on bâtit l'outil qui la règle.</p>
      </div>
      <a className="btn" href="https://www.agencejutras.com/#contact">On se parle 15 minutes?</a>
    </>
  );
}
