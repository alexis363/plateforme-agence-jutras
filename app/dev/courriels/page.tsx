import { notFound } from "next/navigation";
import { boiteLocale, courrielsLocaux } from "@/lib/depot.ts";
import { dateLongue } from "@/lib/regles.ts";

export const dynamic = "force-dynamic";

// La boîte locale : les courriels que l'application enverrait. N'existe jamais en ligne.
export default async function BoiteLocale() {
  if (!boiteLocale()) notFound();
  const courriels = await courrielsLocaux();
  return (
    <main style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 className="titre">Boîte <em>locale</em></h1>
      <p className="sous">Sur l'ordinateur, les courriels s'arrêtent ici au lieu de partir. Le plus récent en haut.</p>
      {courriels.length === 0 && <p className="vide">Aucun courriel pour l'instant.</p>}
      {courriels.map((c, i) => (
        <div className={`bloc${c.kairos ? " courriel-kairos" : ""}`} key={i} style={{ marginBottom: 12 }}>
          {c.kairos && <div className="ck-entete"><small>AGENCE JUTRAS</small><b>KAIROS</b><i aria-hidden="true" /><small>SOUMISSION</small></div>}
          <div className="etiq">À {c.a} · {dateLongue(c.le)} à {new Date(c.le).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</div>
          <h2 style={{ fontSize: 18 }}>{c.sujet}</h2>
          <p style={{ margin: "6px 0 12px", color: "var(--sec)", fontSize: 14 }}>{c.texte}</p>
          {c.lien && <a className="btn" href={c.lien}>Ouvrir le lien</a>}
        </div>
      ))}
    </main>
  );
}
