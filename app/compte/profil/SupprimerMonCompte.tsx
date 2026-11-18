"use client";
import ConfirmerSuppression from "../../ConfirmerSuppression.tsx";

export default function SupprimerMonCompte({ slug }: { slug: string }) {
  return (
    <ConfirmerSuppression
      bouton="Supprimer mon compte"
      titre="Supprimer votre compte"
      pertes={[
        `Votre lien agencejutras.com/r/${slug} cesse de fonctionner.`,
        "Vos références et leur suivi sont effacés.",
        "Les récompenses pas encore versées sont perdues.",
        "Votre profil et votre mot de passe sont effacés.",
      ]}
      motAEcrire="SUPPRIMER"
      consigneMot="Pour confirmer, écrivez :"
      demanderMotDePasse
      url="/api/compte"
      corps={(mot, motDePasse) => ({ confirmation: mot, motDePasse })}
      apres={() => { window.location.href = "/connexion?supprime=1"; }}
    />
  );
}
