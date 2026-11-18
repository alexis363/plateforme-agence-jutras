"use client";
import { useRouter } from "next/navigation";
import ConfirmerSuppression from "../../ConfirmerSuppression.tsx";

export default function SupprimerMembre({ id, nom, courriel, nbReferences }: { id: string; nom: string; courriel: string; nbReferences: number }) {
  const router = useRouter();
  return (
    <ConfirmerSuppression
      bouton="Supprimer"
      boutonClasse="lien-danger"
      titre={`Supprimer le compte de ${nom}`}
      pertes={[
        "Son lien de référence cesse de fonctionner.",
        nbReferences ? `Ses ${nbReferences} référence${nbReferences > 1 ? "s" : ""}, avec leurs notes et leur historique.` : "Aucune référence à son nom.",
        "Ses visites, son profil et son mot de passe.",
        "Les rendez-vous déjà créés restent dans votre agenda Google.",
      ]}
      motAEcrire={courriel}
      consigneMot="Pour confirmer, écrivez son courriel au complet :"
      demanderMotDePasse={false}
      url={`/api/admin/membres/${id}`}
      corps={(mot) => ({ confirmation: mot })}
      apres={() => router.refresh()}
    />
  );
}
