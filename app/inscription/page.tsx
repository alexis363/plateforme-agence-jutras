import Link from "next/link";
import Marque from "../Marque.tsx";
import Formulaire from "./Formulaire.tsx";
import { estLocal } from "@/lib/depot.ts";
import { RECOMPENSE } from "@/lib/regles.ts";

export const metadata = { title: "Obtenir mon lien · Agence Jutras" };
export const dynamic = "force-dynamic";

export default function Inscription() {
  return (
    <div className="acces">
      <div className="boite">
        <Marque />
        <h1>Obtenez votre <em>lien personnel</em></h1>
        <p className="sous">Présentez un entrepreneur à l'Agence Jutras. S'il devient client de Kairos, vous recevez {RECOMPENSE} $.</p>
        <Formulaire local={estLocal()} />
        <p className="bas">Déjà membre? <Link href="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}
