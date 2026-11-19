"use client";
import { useRouter } from "next/navigation";
import ConfirmerSuppression from "../../../ConfirmerSuppression.tsx";

export default function SupprimerReference({ id, entreprise, membre }: { id: string; entreprise: string; membre: string | null }) {
  const router = useRouter();
  return (
    <ConfirmerSuppression
      bouton="Supprimer le prospect"
      boutonClasse="lien-danger"
      titre={`Supprimer ${entreprise}`}
      pertes={[
        "La fiche de l'entrepreneur : coordonnées, casse-tête, notes privées et historique.",
        membre ? `Il disparaît aussi de l'espace de ${membre}.` : "Il venait du site web : aucun ambassadeur n'est touché.",
        "Le rendez-vous, s'il y en a un, reste dans votre agenda Google.",
      ]}
      motAEcrire="SUPPRIMER"
      consigneMot="Pour confirmer, écrivez :"
      demanderMotDePasse={false}
      url={`/api/admin/references/${id}`}
      corps={(mot) => ({ confirmation: mot })}
      apres={() => { router.push("/admin/references"); router.refresh(); }}
    />
  );
}
