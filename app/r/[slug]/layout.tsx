import type { Metadata } from "next";
import { membrePublic } from "@/lib/depot.ts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = await membrePublic((await params).slug);
  return {
    title: m?.prenom ? `${m.prenom} vous recommande Kairos · Agence Jutras` : "Kairos Soumission · Agence Jutras",
    description: "Vos soumissions, réglées avant le souper. Réservez 15 minutes avec Alexis Jutras.",
  };
}

export default function Gabarit({ children }: { children: React.ReactNode }) {
  return children;
}
