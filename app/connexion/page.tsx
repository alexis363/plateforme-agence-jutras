import Link from "next/link";
import Marque from "../Marque.tsx";
import Formulaire from "./Formulaire.tsx";
import { estLocal } from "@/lib/depot.ts";

export const metadata = { title: "Connexion · Agence Jutras" };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ lien?: string }> }) {
  const { lien } = await searchParams;
  return (
    <div className="acces">
      <div className="boite">
        <Marque />
        <h1>Votre <em>compte</em></h1>
        <p className="sous">Connectez-vous avec votre courriel et votre mot de passe.</p>
        {lien === "expire" && <p className="erreur" style={{ marginBottom: 14 }}>Ce lien est expiré ou déjà utilisé. Connectez-vous : si votre courriel n'est pas encore confirmé, on vous renverra le lien.</p>}
        <Formulaire local={estLocal()} />
        <p className="bas">Pas encore membre? <Link href="/inscription">Obtenir mon lien</Link></p>
      </div>
    </div>
  );
}
