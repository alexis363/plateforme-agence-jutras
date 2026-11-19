import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";
import { RECOMPENSE, VALIDITE_MOIS, dateCourte, dateLongue } from "@/lib/regles.ts";
import Actions from "./Actions.tsx";
import SupprimerReference from "./SupprimerReference.tsx";
import { momentTexte } from "@/lib/agenda.ts";

export default async function FicheReference({ params }: { params: Promise<{ id: string }> }) {
  await exigerAdmin();
  const { id } = await params;
  const { membres, references } = await adminTout();
  const r = references.find((x) => x.id === id);
  if (!r) notFound();
  const m = r.membreId ? membres.find((x) => x.id === r.membreId) : undefined;
  const expire = new Date(r.creeLe);
  expire.setMonth(expire.getMonth() + VALIDITE_MOIS);

  return (
    <>
      <Link className="retour" href="/admin/references">← Mes prospects</Link>
      <h1 className="titre">{r.entreprise}</h1>
      <p className="sous">{r.contact}{r.metier ? ` · ${r.metier}` : ""} · demande du {dateLongue(r.creeLe)}{r.fermee ? ` · fermé : ${r.fermee}` : ""}</p>
      <div className="deux">
        <div className="pile">
          <div className="bloc">
            <h2>Faire avancer</h2>
            <p className="note" style={{ marginTop: -6 }}>{m ? `L'ambassadeur voit l'étape dans son compte. À l'étape 5, versez sa récompense de ${RECOMPENSE} $ dans les 24 h, puis passez à 6.` : "Prospect venu par le site web : aucune récompense à verser."}</p>
            <Actions id={r.id} etape={r.etape} fermee={r.fermee} notes={r.notes} />
          </div>
          <div className="bloc zone-danger">
            <h2>Supprimer le prospect</h2>
            {r.fermee
              ? <SupprimerReference id={r.id} entreprise={r.entreprise} membre={m ? `${m.prenom} ${m.nom}` : null} />
              : <p className="note" style={{ margin: 0 }}>Fermez d'abord le prospect (plus haut, « Fermer le prospect ») : le bouton pour le supprimer apparaîtra ici.</p>}
          </div>
          <div className="bloc">
            <h2>Historique</h2>
            <div className="chrono">{r.historique.map((h, i) => <div key={i}><small>{dateCourte(h.le)}</small>{h.quoi}</div>)}</div>
          </div>
        </div>
        <div className="pile">
          <div className="bloc">
            <h2>L'entrepreneur</h2>
            <div className="infos">
              <div><span>Contact</span><b>{r.contact}</b></div>
              <div><span>Cellulaire</span><b><a href={`tel:${r.cellulaire}`}>{r.cellulaire}</a></b></div>
              <div><span>Courriel</span><b>{r.courriel || "—"}</b></div>
              <div><span>Rendez-vous</span><b>{r.rendezVous ? momentTexte(r.rendezVous) : r.moment}</b></div>
              {m && <div><span>Attribué à l'ambassadeur jusqu'au</span><b>{dateLongue(expire.toISOString())}</b></div>}
            </div>
            {r.casseTete && <><div className="etiq" style={{ marginTop: 14 }}>Son plus gros casse-tête</div><p style={{ margin: 0, fontSize: 14 }}>{r.casseTete}</p></>}
          </div>
          {!m && <div className="bloc"><h2>Source</h2><p style={{ margin: 0, fontSize: 14 }}>Rendez-vous pris sur le site web, sans ambassadeur.</p></div>}
          {m && <div className="bloc">
            <h2>L'ambassadeur qui l'a référé</h2>
            <div className="infos">
              <div><span>Nom</span><b>{m?.prenom} {m?.nom}</b></div>
              <div><span>Cellulaire</span><b>{m?.cellulaire}</b></div>
              <div><span>Courriel Interac</span><b>{m?.courriel}</b></div>
              <div><span>Son lien</span><b>/r/{m?.slug}</b></div>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}
