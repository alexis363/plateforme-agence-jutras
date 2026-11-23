import Marque from "../Marque.tsx";
import Formulaire from "./Formulaire.tsx";
import { boiteLocale } from "@/lib/depot.ts";

export const metadata = { title: "Connexion · Agence Jutras" };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ lien?: string; supprime?: string }> }) {
  const { lien, supprime } = await searchParams;
  return (
    <div className="acces">
      <div className="boite">
        <Marque />
        <h1>Votre <em>compte</em></h1>
        <p className="sous">Connectez-vous avec votre courriel et votre mot de passe.</p>
        {supprime === "1" && <p className="ok" style={{ marginBottom: 14 }}>✓ Votre compte est supprimé. Merci d'avoir fait partie du programme.</p>}
        {lien === "expire" && <p className="erreur" style={{ marginBottom: 14 }}>Ce lien est expiré ou déjà utilisé. Connectez-vous : si votre courriel n'est pas encore confirmé, on vous renverra le lien.</p>}
        <Formulaire local={boiteLocale()} />
      </div>
    </div>
  );
}
