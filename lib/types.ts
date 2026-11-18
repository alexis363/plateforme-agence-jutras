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
  membreId: string;
  entreprise: string;
  contact: string;
  metier: string;
  cellulaire: string;
  courriel: string;
  casseTete: string;
  moment: string; // le moment préféré pour l'appel, choisi sur la page du lien
  creeLe: string;
  etape: number; // 1 à 6, voir ETAPES
  fermee: string | null; // raison, si la référence ne mène nulle part
  notes: string; // privées : la console seulement, jamais montrées au membre
  historique: Evenement[];
};

export type Visite = { membreId: string; le: string };

export type Jeton = {
  hash: string;
  membreId: string;
  but: "confirmer" | "reinitialiser";
  expire: string;
  utilise: boolean;
};

export type CourrielLocal = { a: string; sujet: string; texte: string; lien: string | null; le: string };

export type Base = {
  membres: Membre[];
  references: Reference[];
  visites: Visite[];
  jetons: Jeton[];
  courriels: CourrielLocal[]; // boîte locale, sur l'ordinateur seulement
};
