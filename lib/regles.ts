// Les termes du programme de référence, décidés par Alexis le 12 et le 17 novembre 2026.
// Source : « 2 - Ventes/Programme de référence.md » dans le coffre. Changer un terme ici = le changer là aussi.

export const RECOMPENSE = 100; // $ par entrepreneur devenu client
export const VALIDITE_MOIS = 6; // une référence reste attribuée au membre pendant 6 mois
export const PRODUIT = "Kairos Soumission"; // le programme couvre Kairos seulement

// Les 6 étapes du cycle client (Alexis, 19 nov. 2026), les mêmes dans la console et l'espace membre.
// Alexis fait avancer chaque référence depuis la console. À l'étape 5, la récompense est due (24 h).
export const ETAPES = [
  "Demande de rendez-vous",
  "Rendez-vous découverte",
  "Rendez-vous d'installation",
  "Essai gratuit",
  "Client",
  "Ambassadeur payé",
] as const;

// Places limitées de Kairos, par mois (« Prix et offres », 13 et 17 nov. 2026).
// Un mois absent d'ici n'affiche aucune limite : demander à Alexis la règle avant de l'ajouter.
export const PLACES: Record<string, number> = { "2026-11": 2, "2026-12": 3 };

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function placesDuMois(date = new Date()): { nombre: number; mois: string } | null {
  const cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const nombre = PLACES[cle];
  return nombre ? { nombre, mois: `${MOIS[date.getMonth()]} ${date.getFullYear()}` } : null;
}

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."];

export function dateCourte(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS_COURTS[d.getMonth()]}`;
}

export function dateLongue(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}
