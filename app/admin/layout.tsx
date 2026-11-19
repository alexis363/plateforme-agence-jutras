import Cadre from "../Cadre.tsx";
import { exigerAdmin } from "@/lib/session.ts";
import { adminTout } from "@/lib/depot.ts";

export const dynamic = "force-dynamic";

export default async function Console({ children }: { children: React.ReactNode }) {
  const admin = await exigerAdmin();
  const { references } = await adminTout();
  const aTraiter = references.filter((r) => !r.fermee && (r.etape === 1 || r.etape === 5)).length;
  return (
    <Cadre
      membre={admin}
      etiquette="Console"
      entrees={[
        { href: "/admin", texte: "Aujourd'hui", icone: "soleil" },
        { href: "/admin/references", texte: "Mes prospects", icone: "lien", groupe: "Programme de référence", nb: aTraiter },
        { href: "/admin/membres", texte: "Ambassadeurs", icone: "personne", groupe: "Programme de référence" },
        // Les sections de la maquette qui viennent au bloc 2 (décembre 2026).
        { href: "/admin/clients", texte: "Mes clients", icone: "groupe", groupe: "Clients", bientot: true },
        { href: "/admin/suivis", texte: "Suivis", icone: "calendrier", groupe: "Clients", bientot: true },
        { href: "/admin/avis", texte: "Avis des clients", icone: "etoile", groupe: "Clients", bientot: true },
        { href: "/admin/factures", texte: "Factures", icone: "facture", groupe: "Argent et soutien", bientot: true },
        { href: "/admin/soutien", texte: "Soutien", icone: "bulle", groupe: "Argent et soutien", bientot: true },
        { href: "/admin/reglages", texte: "Réglages", icone: "reglages", groupe: "Agence" },
      ]}
    >
      {children}
    </Cadre>
  );
}
