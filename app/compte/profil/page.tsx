import { exigerMembre } from "@/lib/session.ts";
import { dateLongue } from "@/lib/regles.ts";
import FormulaireProfil from "./FormulaireProfil.tsx";
import ChangerMotDePasse from "./ChangerMotDePasse.tsx";

export default async function Profil() {
  const m = await exigerMembre();
  return (
    <>
      <h1 className="titre">Mon <em>profil</em></h1>
      <p className="sous">Ce qu'il faut pour vous verser vos récompenses.</p>
      <div className="bloc" style={{ maxWidth: 720 }}>
        <FormulaireProfil prenom={m.prenom} nom={m.nom} cellulaire={m.cellulaire} prenomVisible={m.prenomVisible} />
        <label className="champ" style={{ marginTop: 18 }}><span>Courriel pour les virements Interac</span><input value={m.courriel} readOnly /></label>
        <p className="ok" style={{ margin: "-6px 0 6px" }}>✓ Courriel confirmé · votre lien est actif</p>
        <p className="note" style={{ margin: 0 }}>Règles acceptées le {m.accepteRegles ? dateLongue(m.accepteRegles) : "—"}. Pour changer de courriel, écrivez à alexis@agencejutras.com.</p>
      </div>
      <div className="bloc" style={{ maxWidth: 720, marginTop: 20 }}>
        <h2>Mot de passe</h2>
        <ChangerMotDePasse />
      </div>
    </>
  );
}
