import { notFound } from "next/navigation";
import "../landing.css";
import Marque from "../../Marque.tsx";
import Visite from "./Visite.tsx";
import FormulaireRdv from "./FormulaireRdv.tsx";
import { membrePublic } from "@/lib/depot.ts";
import { placesDuMois } from "@/lib/regles.ts";

export const dynamic = "force-dynamic";

// La page où mène un lien de référence. Contenu public : aucun prix, aucun gain chiffré, aucun témoignage.
export default async function PageReference({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const membre = await membrePublic(slug);
  if (!membre) notFound();
  const qui = membre.prenom ?? "Un de nos membres";
  const places = placesDuMois();

  return (
    <div className="landing">
      <Visite slug={slug} />
      <div className="reco"><div className="wrap">
        <div className="reco-qui"><span className="av">{(membre.prenom ?? "★")[0]}</span><span><b>{qui}</b> vous recommande l'Agence Jutras</span></div>
        <Marque />
      </div></div>

      <header className="hero"><div className="wrap">
        <div>
          <div className="logo-k"><b>KAIROS</b><i /><small>SOUMISSION</small></div>
          {/* Le prénom de l'ambassadeur dans le titre (Alexis, 22 nov. 2026), s'il a accepté de l'afficher. */}
          <h1>
            {membre.prenom && <span className="h1-qui">{membre.prenom} vous recommande Kairos.</span>}
            Vos soumissions, <em>réglées avant le souper.</em>
          </h1>
          <p className="lede">Toutes vos demandes au même endroit, une tournée de visites qui se planifie seule, et des devis que vous dictez à voix haute dans le camion.</p>
          <a className="btn" href="#rdv">Réserver mes 15 minutes <span aria-hidden="true">→</span></a>
          {places && <div><span className="places">{places.nombre} nouvelles places seulement en {places.mois}</span></div>}
        </div>
        <div className="ecrans">
          <div className="portable"><img src="/img/demandes.webp" alt="Kairos : toutes les demandes réunies dans une seule liste" width={2400} height={1500} /></div>
          <div className="tel"><img src="/img/m-dictee.webp" alt="Kairos sur téléphone : dicter un devis" width={900} height={1948} /></div>
        </div>
      </div></header>

      <section className="s"><div className="wrap">
        <div className="titre-s"><span className="etiq">Ce que Kairos règle</span><h2>Trois tâches qui vous <em>volent vos soirées.</em></h2></div>
        <div className="probleme">
          <div className="p-txt"><span className="num">01</span>
            <p className="avant">Avant : des demandes sur Messenger, au téléphone, dans deux boîtes courriel. Il y en a qui passent entre les mailles.</p>
            <h3>Toutes vos demandes, <em>au même endroit.</em></h3>
            <p>Texto, appel, courriel : chaque demande arrive dans une seule liste, avec l'adresse et les travaux. Rien ne se perd.</p></div>
          <div className="p-img"><img src="/img/demandes.webp" alt="Liste des demandes dans Kairos" width={2400} height={1500} loading="lazy" /></div>
        </div>
        <div className="probleme inverse">
          <div className="p-txt"><span className="num">02</span>
            <p className="avant">Avant : vous placez vos visites à l'œil, et vous traversez la ville deux fois.</p>
            <h3>Une tournée de visites <em>qui se planifie seule.</em></h3>
            <p>Choisissez votre journée de visites : Kairos place les adresses dans le meilleur ordre, et vous n'avez qu'à suivre la route.</p></div>
          <div className="p-img"><img src="/img/vendredi.webp" alt="La tournée de visites dans Kairos" width={2400} height={1500} loading="lazy" /></div>
        </div>
        <div className="probleme">
          <div className="p-txt"><span className="num">03</span>
            <p className="avant">Avant : les devis tapés le soir, une fois les enfants couchés.</p>
            <h3>Le devis, <em>dicté sur place.</em></h3>
            <p>Après la visite, décrivez les travaux et vos prix à voix haute. Kairos prépare les lignes du devis et calcule les taxes. Vous relisez, vous envoyez.</p></div>
          <div className="p-img"><img src="/img/devis.webp" alt="Un devis préparé par Kairos" width={2400} height={1500} loading="lazy" /></div>
        </div>
      </div></section>

      <section className="s sombre"><div className="wrap">
        <div className="titre-s"><span className="etiq">Comment ça se passe</span><h2>Simple, <em>et sans engagement.</em></h2><p>Pas de diaporama, pas de jargon. On regarde votre vraie semaine.</p></div>
        <div className="etapes-l">
          <div className="etape"><div className="rond">1</div><h3>On se parle 15 minutes</h3><p>Comment vos demandes rentrent, combien de soumissions vous faites, ce que vous utilisez déjà.</p></div>
          <div className="etape"><div className="rond">2</div><h3>On installe Kairos chez vous</h3><p>À votre nom, avec vos services et votre façon de faire vos prix. On vous montre comment l'utiliser.</p></div>
          <div className="etape"><div className="rond">3</div><h3>Votre premier mois est offert</h3><p>Vous l'utilisez dans votre vraie saison. Vous décidez ensuite si vous continuez.</p></div>
        </div>
        <p className="preuve">Kairos est <b>en service chez Émondage JMF</b>, dans la région de Québec, depuis octobre 2026.</p>
      </div></section>

      <section className="s" id="rdv"><div className="wrap rdv">
        <div className="qui">
          <img src="/img/alexis-rond.webp" alt="Alexis Jutras" width={640} height={640} />
          <h2>Choisissez <em>votre moment.</em></h2>
          <p>C'est moi, Alexis, que vous rencontrez sur Google Meet. 15 minutes pour voir si Kairos peut vous redonner vos soirées. Si ce n'est pas pour vous, je vous le dis.</p>
          <ul><li>15 minutes sur Google Meet</li><li>Aucun engagement</li><li>On parle de votre volume, puis du prix</li></ul>
        </div>
        <FormulaireRdv slug={slug} qui={membre.prenom} />
      </div></section>

      <section className="s" style={{ paddingTop: 20 }}><div className="wrap">
        <div className="titre-s"><span className="etiq">Vos questions</span><h2>Avant de <em>réserver.</em></h2></div>
        <div className="faq">
          <details><summary>Je suis trop petit pour ça.</summary><p>C'est justement pour vous. Kairos est fait pour l'entrepreneur qui fait ses soumissions lui-même, sans adjointe.</p></details>
          <details><summary>Je ne suis pas bon avec la technologie.</summary><p>Si vous savez envoyer un texto, vous savez utiliser Kairos. On l'installe pour vous et on vous montre comment faire.</p></details>
          <details><summary>Combien ça coûte?</summary><p>Ça dépend de votre volume de soumissions. On en parle pendant les 15 minutes, une fois qu'on connaît votre réalité. Et votre premier mois est offert.</p></details>
          {places && <details><summary>Pourquoi des places limitées?</summary><p>Chaque installation est faite à la main, avec vous. Pour bien servir chaque client, on en prend {places.nombre} nouveaux en {places.mois}, pas plus.</p></details>}
        </div>
        <p style={{ textAlign: "center", marginTop: 40 }}><a className="btn" href="#rdv">Réserver mes 15 minutes <span aria-hidden="true">→</span></a></p>
      </div></section>

      <footer><div className="wrap">
        <Marque />
        <span>Moins de paperasse, plus de temps en famille.</span>
        <span>581-349-1258 · alexis@agencejutras.com</span>
      </div></footer>
    </div>
  );
}
