import Link from "next/link";
import Marque from "../Marque.tsx";
import Formulaire from "./Formulaire.tsx";
import { boiteLocale } from "@/lib/depot.ts";

export const metadata = { title: "Mot de passe oublié · Agence Jutras" };
export const dynamic = "force-dynamic";

export default function MotDePasseOublie() {
  return (
    <div className="acces">
      <a className="retour-site acces-retour" href="https://www.agencejutras.com"><span aria-hidden="true">←</span> Site web</a>
      <div className="boite">
        <Marque />
        <h1>Mot de passe <em>oublié</em></h1>
        <p className="sous">Entrez votre courriel : on vous envoie un lien pour choisir un nouveau mot de passe.</p>
        <Formulaire local={boiteLocale()} />
        <p className="bas"><Link href="/connexion">Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
