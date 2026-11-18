// SEUL fichier qui touche aux données.
//
// Règle d'isolation : une fonction qu'un membre déclenche reçoit le membre de la SESSION (lib/session.ts),
// jamais un identifiant envoyé par le navigateur. Les fonctions « admin… » ne s'appellent qu'après exigerAdmin().
//
// Moteur actuel : un fichier JSON dans .donnees/ (ordinateur seulement). Le moteur Supabase viendra avant la
// mise en ligne ; d'ici là, l'application refuse de démarrer en ligne (voir moteurPret()).
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID, createHash, randomBytes } from "node:crypto";
import type { Base, Membre, Reference, Jeton, CourrielLocal } from "./types.ts";
import { VALIDITE_MOIS } from "./regles.ts";

const FICHIER = path.join(process.cwd(), ".donnees", "base.json");
const VIDE: Base = { membres: [], references: [], visites: [], jetons: [], courriels: [] };

export function estLocal(): boolean {
  return process.env.COMPTE_LOCAL === "oui" && !process.env.VERCEL;
}

function moteurPret(): void {
  if (!estLocal()) throw new Error("Aucune base configurée : le moteur Supabase n'est pas encore branché.");
}

async function lire(): Promise<Base> {
  moteurPret();
  try {
    return { ...VIDE, ...JSON.parse(await fs.readFile(FICHIER, "utf8")) };
  } catch {
    return structuredClone(VIDE);
  }
}

// Les écritures passent l'une après l'autre : deux demandes simultanées ne s'écrasent pas.
let file: Promise<unknown> = Promise.resolve();
function ecrire<T>(changer: (b: Base) => T): Promise<T> {
  const suite = file.then(async () => {
    const b = await lire();
    const resultat = changer(b);
    await fs.mkdir(path.dirname(FICHIER), { recursive: true });
    await fs.writeFile(FICHIER, JSON.stringify(b, null, 2));
    return resultat;
  });
  file = suite.catch(() => undefined);
  return suite;
}

const maintenant = () => new Date().toISOString();
export const normaliserCourriel = (c: string) => c.trim().toLowerCase();
export const normaliserCellulaire = (c: string) => c.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

// ---------- Membres ----------

export async function membreParId(id: string): Promise<Membre | null> {
  return (await lire()).membres.find((m) => m.id === id) ?? null;
}

export async function membreParCourriel(courriel: string): Promise<Membre | null> {
  const c = normaliserCourriel(courriel);
  return (await lire()).membres.find((m) => m.courriel === c) ?? null;
}

// Pour la page publique du lien : seulement un membre confirmé, et seulement ce que la page affiche.
export async function membrePublic(slug: string): Promise<{ id: string; prenom: string | null } | null> {
  const m = (await lire()).membres.find((x) => x.slug === slug && x.confirme);
  return m ? { id: m.id, prenom: m.prenomVisible ? m.prenom : null } : null;
}

function slugLibre(b: Base, prenom: string, nom: string): string {
  const base = `${prenom}-${nom.slice(0, 1)}`
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "membre";
  let slug = base;
  for (let n = 2; b.membres.some((m) => m.slug === slug); n++) slug = `${base}${n}`;
  return slug;
}

export type NouveauMembre = { prenom: string; nom: string; cellulaire: string; courriel: string; prenomVisible: boolean; motDePasse: string };

// Retourne le membre existant si le courriel est déjà inscrit : l'inscription ne révèle pas qui est membre,
// et ne change jamais le mot de passe d'un compte existant. `d.motDePasse` est déjà haché.
export async function creerMembre(d: NouveauMembre, role: Membre["role"]): Promise<Membre> {
  return ecrire((b) => {
    const courriel = normaliserCourriel(d.courriel);
    const existant = b.membres.find((m) => m.courriel === courriel);
    if (existant) return existant;
    const m: Membre = {
      id: randomUUID(), prenom: d.prenom.trim(), nom: d.nom.trim(), cellulaire: d.cellulaire.trim(), courriel,
      slug: slugLibre(b, d.prenom, d.nom), motDePasse: d.motDePasse, role, confirme: false, accepteRegles: maintenant(),
      prenomVisible: d.prenomVisible, creeLe: maintenant(),
    };
    b.membres.push(m);
    return m;
  });
}

export async function majProfil(membreId: string, d: { prenom: string; nom: string; cellulaire: string; prenomVisible: boolean }): Promise<void> {
  await ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (!m) throw new Error("Membre introuvable");
    Object.assign(m, { prenom: d.prenom.trim(), nom: d.nom.trim(), cellulaire: d.cellulaire.trim(), prenomVisible: d.prenomVisible });
  });
}

export async function poserRole(membreId: string, role: Membre["role"]): Promise<void> {
  await ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (m) m.role = role;
  });
}

export async function changerMotDePasse(membreId: string, hache: string): Promise<void> {
  await ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (!m) throw new Error("Membre introuvable");
    m.motDePasse = hache;
  });
}

// ---------- Liens envoyés par courriel (jetons à usage unique, gardés hachés) ----------

const hacher = (s: string) => createHash("sha256").update(s).digest("hex");

export async function creerJeton(membreId: string, but: Jeton["but"]): Promise<string> {
  const brut = randomBytes(32).toString("base64url");
  const duree = but === "confirmer" ? 48 * 3600e3 : 30 * 60e3; // 48 h pour confirmer le courriel, 30 min pour changer le mot de passe
  await ecrire((b) => {
    b.jetons = b.jetons.filter((j) => !j.utilise && new Date(j.expire) > new Date());
    b.jetons.push({ hash: hacher(brut), membreId, but, expire: new Date(Date.now() + duree).toISOString(), utilise: false });
  });
  return brut;
}

// Consomme un jeton du bon type. Les deux confirment le courriel (le lien est arrivé dans sa boîte) ;
// « reinitialiser » pose en plus le nouveau mot de passe, déjà haché. Null si le lien est invalide, expiré ou déjà utilisé.
export async function consommerJeton(brut: string, but: Jeton["but"], nouveauHache?: string): Promise<Membre | null> {
  return ecrire((b) => {
    const j = b.jetons.find((x) => x.hash === hacher(brut));
    if (!j || j.but !== but || j.utilise || new Date(j.expire) < new Date()) return null;
    const m = b.membres.find((x) => x.id === j.membreId);
    if (!m) return null;
    if (but === "reinitialiser") {
      if (!nouveauHache) return null;
      m.motDePasse = nouveauHache;
      // Un changement de mot de passe annule les autres liens encore valides de ce membre.
      b.jetons.filter((x) => x.membreId === m.id && x.but === "reinitialiser").forEach((x) => (x.utilise = true));
    }
    j.utilise = true;
    m.confirme = true;
    return m;
  });
}

// ---------- Références : côté membre (toujours le membre de la session) ----------

export async function referencesDuMembre(membreId: string): Promise<Reference[]> {
  return (await lire()).references
    .filter((r) => r.membreId === membreId)
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}

export async function visitesDuMembre(membreId: string): Promise<string[]> {
  return (await lire()).visites.filter((v) => v.membreId === membreId).map((v) => v.le);
}

// ---------- Page publique du lien ----------

export async function ajouterVisite(membreId: string): Promise<void> {
  await ecrire((b) => { b.visites.push({ membreId, le: maintenant() }); });
}

export type NouvelleDemande = Pick<Reference, "entreprise" | "contact" | "metier" | "cellulaire" | "courriel" | "casseTete" | "moment">;

// Le premier qui réfère gagne : une entreprise déjà référée (même cellulaire) dans les 6 derniers mois reste au premier.
// Se référer soi-même ne compte pas. Dans les deux cas, la demande est gardée, mais fermée avec sa raison.
export async function creerReference(membreId: string, d: NouvelleDemande): Promise<Reference> {
  return ecrire((b) => {
    const membre = b.membres.find((m) => m.id === membreId && m.confirme);
    if (!membre) throw new Error("Lien inactif");
    const cell = normaliserCellulaire(d.cellulaire);
    const limite = new Date();
    limite.setMonth(limite.getMonth() - VALIDITE_MOIS);
    const deja = b.references.find((r) => !r.fermee && normaliserCellulaire(r.cellulaire) === cell && new Date(r.creeLe) > limite);
    const soiMeme = normaliserCellulaire(membre.cellulaire) === cell || (d.courriel && normaliserCourriel(d.courriel) === membre.courriel);
    const fermee = soiMeme ? "Le membre s'est référé lui-même" : deja ? (deja.membreId === membreId ? "Déjà référée par ce membre" : "Déjà référée par un autre membre") : null;
    const r: Reference = {
      id: randomUUID(), membreId, ...d, creeLe: maintenant(), etape: 1, fermee, notes: "",
      historique: [{ le: maintenant(), quoi: fermee ? `Demande reçue, fermée : ${fermee}` : "Demande reçue par le lien" }],
    };
    b.references.push(r);
    return r;
  });
}

// ---------- Console d'admin (après exigerAdmin() seulement) ----------

export async function adminTout(): Promise<Pick<Base, "membres" | "references" | "visites">> {
  const { membres, references, visites } = await lire();
  return { membres, references, visites };
}

export async function adminMajReference(id: string, d: { etape?: number; fermee?: string | null; notes?: string; quoi?: string }): Promise<Reference | null> {
  return ecrire((b) => {
    const r = b.references.find((x) => x.id === id);
    if (!r) return null;
    if (d.etape !== undefined && d.etape >= 1 && d.etape <= 6) r.etape = d.etape;
    if (d.fermee !== undefined) r.fermee = d.fermee;
    if (d.notes !== undefined) r.notes = d.notes;
    if (d.quoi) r.historique.push({ le: maintenant(), quoi: d.quoi });
    return r;
  });
}

// ---------- Courriels de la boîte locale ----------

export async function garderCourrielLocal(c: Omit<CourrielLocal, "le">): Promise<void> {
  await ecrire((b) => { b.courriels.unshift({ ...c, le: maintenant() }); b.courriels = b.courriels.slice(0, 50); });
}

export async function courrielsLocaux(): Promise<CourrielLocal[]> {
  return (await lire()).courriels;
}
