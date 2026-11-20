"use client";
import ConfirmerSuppression from "../../ConfirmerSuppression.tsx";

export default function SupprimerMonCompte({ slug }: { slug: string }) {
  return (
    <ConfirmerSuppression
      bouton="Supprimer mon compte"
      titre="Supprimer ton compte"
      pertes={[
        `Ton lien agencejutras.com/r/${slug} cesse de fonctionner.`,
        "Tes références et leur suivi sont effacés.",
        "Les récompenses pas encore versées sont perdues.",
        "Ton profil et ton mot de passe sont effacés.",
      ]}
      motAEcrire="SUPPRIMER"
      consigneMot="Pour confirmer, écris :"
      demanderMotDePasse
      url="/api/compte"
      corps={(mot, motDePasse) => ({ confirmation: mot, motDePasse })}
      apres={() => { window.location.href = "/connexion?supprime=1"; }}
    />
  );
}
