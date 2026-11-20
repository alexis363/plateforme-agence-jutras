import Link from "next/link";
import Marque from "../Marque.tsx";
import Regles from "../Regles.tsx";

export const metadata = { title: "Règles du programme ambassadeur Kairos · Agence Jutras" };

export default function ReglesPubliques() {
  return (
    <>
      <header className="haut"><Link href="/inscription" style={{ textDecoration: "none" }}><Marque etiquette="Programme ambassadeur Kairos" /></Link></header>
      <main style={{ maxWidth: 820, margin: "0 auto" }}>
        <h1 className="titre">Les <em>règles</em></h1>
        <p className="sous">Simples, et les mêmes pour tout le monde.</p>
        <Regles />
        <p style={{ marginTop: 24 }}><Link className="btn" href="/inscription">Obtenir mon lien</Link></p>
      </main>
    </>
  );
}
