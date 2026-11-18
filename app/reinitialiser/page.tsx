import Link from "next/link";
import Marque from "../Marque.tsx";
import Formulaire from "./Formulaire.tsx";

export const metadata = { title: "Nouveau mot de passe · Agence Jutras" };

export default async function Reinitialiser({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  return (
    <div className="acces">
      <div className="boite">
        <Marque />
        <h1>Nouveau <em>mot de passe</em></h1>
        <p className="sous">Choisissez-en un d'au moins 10 caractères. Une courte phrase se retient mieux qu'un mot compliqué.</p>
        {jeton ? <Formulaire jeton={jeton} /> : <p className="erreur">Ce lien est incomplet. <Link href="/mot-de-passe-oublie">Demandez-en un nouveau</Link>.</p>}
      </div>
    </div>
  );
}
