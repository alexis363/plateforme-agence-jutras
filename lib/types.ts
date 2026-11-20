export type Role = "membre" | "admin";

export type Membre = {
  id: string;
  prenom: string;
  nom: string;
  cellulaire: string;
  courriel: string; // aussi le courriel des virements Interac
  slug: string; // agencejutras.com/r/<slug>
  motDePasse: string | null; // haché (lib/motdepasse.ts) ; ne quitte jamais le serveur
  role: Role;
  confirme: boolean; // le lien ne s'active qu'une fois le courriel confirmé
  accepteRegles: string | null; // date d'acceptation des règles
  prenomVisible: boolean; // « Sophie vous recommande » sur la page du lien
  creeLe: string;
};

export type Evenement = { le: string; quoi: string };

export type Reference = {
  id: string;
  membreId: string | null; // l'ambassadeur ; null pour un prospect venu par le site web
  source: "lien" | "site"; // d'où vient le prospect (19 nov. 2026 : liens et site dans « Mes prospects »)
  entreprise: string;
  contact: string;
  metier: string;
  cellulaire: string;
  courriel: string;
  casseTete: string;
  moment: string; // le rendez-vous en texte (« lundi 23 novembre à 19 h »), ou ce qui en tient lieu
  rendezVous: string | null; // début du rendez-vous de 15 min pris dans l'agenda Google d'Alexis
  evenementId: string | null; // l'événement correspondant dans Google Agenda
  creeLe: string;
  etape: number; // 1 à 6, voir ETAPES
  fermee: string | null; // raison, si la référence ne mène nulle part
  notes: string; // privées : la console seulement, jamais montrées au membre
  historique: Evenement[];
};

// Les réglages de l'agenda, modifiables dans la console (page Réglages, demande d'Alexis du 18 nov. 2026).
// disponibilites : 0 = dimanche … 6 = samedi, des plages « HH:MM » en heure de Québec.
export type ReglagesAgenda = {
  duree: number; // durée d'un rendez-vous, en minutes
  pause: number; // temps libre gardé avant et après chaque rendez-vous, en minutes
  disponibilites: Record<string, [string, string][]>;
};

export type Visite = { membreId: string; le: string };

// Un rendez-vous de 15 minutes pris sur le site web (agencejutras.com), sans lien de référence.
export type RdvSite = {
  id: string;
  entreprise: string;
  contact: string;
  metier: string;
  cellulaire: string;
  courriel: string;
  casseTete: string;
  moment: string; // en texte, ou ce qui en tient lieu
  rendezVous: string | null;
  evenementId: string | null;
  creeLe: string;
};

export type Jeton = {
  hash: string;
  membreId: string;
  but: "confirmer" | "reinitialiser";
  expire: string;
  utilise: boolean;
};

// kairos : courriel du programme ambassadeur, envoyé avec l'en-tête Kairos (20 nov. 2026).
export type CourrielLocal = { a: string; sujet: string; texte: string; lien: string | null; le: string; kairos?: boolean };

export type Base = {
  membres: Membre[];
  references: Reference[];
  rdvSite: RdvSite[];
  reglagesAgenda?: ReglagesAgenda | null;
  visites: Visite[];
  jetons: Jeton[];
  courriels: CourrielLocal[]; // boîte locale, sur l'ordinateur seulement
};
