import type { Reference } from "./types.ts";
import { RECOMPENSE, dateCourte } from "./regles.ts";

// Visites du lien, regroupées par semaine (lundi), sur les 8 dernières semaines.
export function visitesParSemaine(visites: string[], semaines = 8): { debut: string; nombre: number }[] {
  const lundi = new Date();
  lundi.setHours(0, 0, 0, 0);
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
  const debuts = Array.from({ length: semaines }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(d.getDate() - 7 * (semaines - 1 - i));
    return d;
  });
  return debuts.map((d, i) => {
    const fin = i + 1 < debuts.length ? debuts[i + 1] : new Date(8.64e15);
    return { debut: dateCourte(d.toISOString()), nombre: visites.filter((v) => new Date(v) >= d && new Date(v) < fin).length };
  });
}

// Chiffres du membre. Une référence fermée (doublon, soi-même, pas intéressée) compte comme demande, pas plus loin.
export function chiffresMembre(visites: string[], refs: Reference[]) {
  const actives = refs.filter((r) => !r.fermee);
  const atteint = (etape: number) => actives.filter((r) => r.etape >= etape).length;
  return {
    visites: visites.length,
    demandes: refs.length,
    contactes: atteint(2),
    rencontres: atteint(3),
    clients: atteint(4),
    // Étape 4 « Devenu client » = Kairos installé, mois d'essai gratuit ; étape 5 = premier paiement.
    // Compté comme un entonnoir : ceux qui ont commencé l'essai, y compris ceux qui paient déjà.
    enEssai: atteint(4),
    payants: atteint(5),
    verses: atteint(6),
    recu: atteint(6) * RECOMPENSE,
    aVenir: (atteint(4) - atteint(6)) * RECOMPENSE,
  };
}
