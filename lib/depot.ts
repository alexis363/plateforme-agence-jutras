// SEUL fichier qui touche aux données.
//
// Règle d'isolation : une fonction qu'un membre déclenche reçoit le membre de la SESSION (lib/session.ts),
// jamais un identifiant envoyé par le navigateur. Les fonctions « admin… » ne s'appellent qu'après exigerAdmin().
//
// Deux moteurs :
//  - Supabase, dès que SUPABASE_URL et SUPABASE_SECRET_KEY sont là (en ligne, et sur l'ordinateur avec .env.local) ;
//  - un fichier JSON dans .donnees/, sur l'ordinateur seulement (npm run local), pour les démonstrations et le test.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID, createHash, randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Base, Membre, Reference, RdvSite, ReglagesAgenda, Jeton, CourrielLocal, Evenement } from "./types.ts";
import { VALIDITE_MOIS } from "./regles.ts";

const DOSSIER = path.join(process.cwd(), ".donnees");
const FICHIER = path.join(DOSSIER, "base.json");
const VIDE: Base = { membres: [], references: [], rdvSite: [], visites: [], jetons: [], courriels: [] };

// Sur l'ordinateur, sans Supabase : le fichier local.
export function estLocal(): boolean {
  return process.env.COMPTE_LOCAL === "oui" && !process.env.VERCEL;
}

// La boîte locale des courriels : sur l'ordinateur, tant que SendGrid n'est pas branché.
export function boiteLocale(): boolean {
  return !process.env.VERCEL && !process.env.SENDGRID_API_KEY;
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SECRET_KEY;
  if (!url || !cle) return null;
  client ??= createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function moteur(): "supabase" | "fichier" {
  if (sb()) return "supabase";
  if (estLocal()) return "fichier";
  throw new Error("Aucune base configurée : SUPABASE_URL et SUPABASE_SECRET_KEY manquent.");
}

// Une erreur de Supabase arrête tout : jamais de donnée à moitié écrite en silence.
function ok<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(`Base de données : ${r.error.message}`);
  return r.data;
}

// Même chose pour une requête qui renvoie une liste : jamais null.
function liste<T>(r: { data: T[] | null; error: { message: string } | null }): T[] {
  if (r.error) throw new Error(`Base de données : ${r.error.message}`);
  return r.data ?? [];
}

// ---------- Moteur fichier ----------

async function lire(): Promise<Base> {
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
    await fs.mkdir(DOSSIER, { recursive: true });
    await fs.writeFile(FICHIER, JSON.stringify(b, null, 2));
    return resultat;
  });
  file = suite.catch(() => undefined);
  return suite;
}

// ---------- Conversions ligne Supabase ↔ objet ----------

type Ligne = Record<string, unknown>;

const membreDe = (r: Ligne): Membre => ({
  id: r.id as string, prenom: r.prenom as string, nom: r.nom as string, cellulaire: r.cellulaire as string,
  courriel: r.courriel as string, slug: r.slug as string, motDePasse: (r.mot_de_passe as string) ?? null,
  role: r.role as Membre["role"], confirme: r.confirme as boolean, accepteRegles: (r.accepte_regles as string) ?? null,
  prenomVisible: r.prenom_visible as boolean, creeLe: r.cree_le as string,
});

const refDe = (r: Ligne): Reference => ({
  id: r.id as string, membreId: r.membre_id as string, entreprise: r.entreprise as string, contact: r.contact as string,
  metier: r.metier as string, cellulaire: r.cellulaire as string, courriel: r.courriel as string,
  casseTete: r.casse_tete as string, moment: r.moment as string, rendezVous: (r.rendez_vous as string) ?? null,
  evenementId: (r.evenement_id as string) ?? null, creeLe: r.cree_le as string, etape: r.etape as number,
  fermee: (r.fermee as string) ?? null, notes: r.notes as string, historique: (r.historique as Evenement[]) ?? [],
});

const rdvSiteDe = (r: Ligne): RdvSite => ({
  id: r.id as string, entreprise: r.entreprise as string, contact: r.contact as string, metier: r.metier as string,
  cellulaire: r.cellulaire as string, courriel: r.courriel as string, casseTete: r.casse_tete as string,
  moment: r.moment as string, rendezVous: (r.rendez_vous as string) ?? null, evenementId: (r.evenement_id as string) ?? null,
  creeLe: r.cree_le as string,
});

const maintenant = () => new Date().toISOString();
export const normaliserCourriel = (c: string) => c.trim().toLowerCase();
export const normaliserCellulaire = (c: string) => c.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

// ---------- Membres ----------

export async function membreParId(id: string): Promise<Membre | null> {
  const s = sb();
  if (moteur() === "supabase") {
    const r = ok(await s!.from("membres").select("*").eq("id", id).maybeSingle());
    return r ? membreDe(r) : null;
  }
  return (await lire()).membres.find((m) => m.id === id) ?? null;
}

export async function membreParCourriel(courriel: string): Promise<Membre | null> {
  const c = normaliserCourriel(courriel);
  if (moteur() === "supabase") {
    const r = ok(await sb()!.from("membres").select("*").eq("courriel", c).maybeSingle());
    return r ? membreDe(r) : null;
  }
  return (await lire()).membres.find((m) => m.courriel === c) ?? null;
}

// Pour la page publique du lien : seulement un membre confirmé, et seulement ce que la page affiche.
export async function membrePublic(slug: string): Promise<{ id: string; prenom: string | null } | null> {
  if (moteur() === "supabase") {
    const r = ok(await sb()!.from("membres").select("id, prenom, prenom_visible").eq("slug", slug).eq("confirme", true).maybeSingle());
    return r ? { id: r.id as string, prenom: r.prenom_visible ? (r.prenom as string) : null } : null;
  }
  const m = (await lire()).membres.find((x) => x.slug === slug && x.confirme);
  return m ? { id: m.id, prenom: m.prenomVisible ? m.prenom : null } : null;
}

function baseSlug(prenom: string, nom: string): string {
  return `${prenom}-${nom.slice(0, 1)}`
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "membre";
}

function slugLibre(base: string, pris: string[]): string {
  let slug = base;
  for (let n = 2; pris.includes(slug); n++) slug = `${base}${n}`;
  return slug;
}

export type NouveauMembre = { prenom: string; nom: string; cellulaire: string; courriel: string; prenomVisible: boolean; motDePasse: string };

// Retourne le membre existant si le courriel est déjà inscrit : l'inscription ne révèle pas qui est membre,
// et ne change jamais le mot de passe d'un compte existant. `d.motDePasse` est déjà haché.
export async function creerMembre(d: NouveauMembre, role: Membre["role"]): Promise<Membre> {
  const courriel = normaliserCourriel(d.courriel);
  const champs = { prenom: d.prenom.trim(), nom: d.nom.trim(), cellulaire: d.cellulaire.trim(), courriel };
  const base = baseSlug(d.prenom, d.nom);

  if (moteur() === "supabase") {
    const existant = await membreParCourriel(courriel);
    if (existant) return existant;
    const pris = liste(await sb()!.from("membres").select("slug").like("slug", `${base}%`)).map((r) => r.slug as string);
    const r = await sb()!.from("membres").insert({
      ...champs, slug: slugLibre(base, pris), mot_de_passe: d.motDePasse, role, confirme: false,
      accepte_regles: maintenant(), prenom_visible: d.prenomVisible,
    }).select("*").single();
    // Deux inscriptions au même instant : l'unicité du courriel tranche, on renvoie le compte gagnant.
    if (r.error) {
      const gagnant = await membreParCourriel(courriel);
      if (gagnant) return gagnant;
      throw new Error(`Base de données : ${r.error.message}`);
    }
    return membreDe(r.data);
  }

  return ecrire((b) => {
    const existant = b.membres.find((m) => m.courriel === courriel);
    if (existant) return existant;
    const m: Membre = {
      id: randomUUID(), ...champs, slug: slugLibre(base, b.membres.map((x) => x.slug)), motDePasse: d.motDePasse,
      role, confirme: false, accepteRegles: maintenant(), prenomVisible: d.prenomVisible, creeLe: maintenant(),
    };
    b.membres.push(m);
    return m;
  });
}

export async function majProfil(membreId: string, d: { prenom: string; nom: string; cellulaire: string; prenomVisible: boolean }): Promise<void> {
  const champs = { prenom: d.prenom.trim(), nom: d.nom.trim(), cellulaire: d.cellulaire.trim() };
  if (moteur() === "supabase") {
    ok(await sb()!.from("membres").update({ ...champs, prenom_visible: d.prenomVisible }).eq("id", membreId));
    return;
  }
  await ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (!m) throw new Error("Membre introuvable");
    Object.assign(m, champs, { prenomVisible: d.prenomVisible });
  });
}

export async function poserRole(membreId: string, role: Membre["role"]): Promise<void> {
  if (moteur() === "supabase") {
    ok(await sb()!.from("membres").update({ role }).eq("id", membreId));
    return;
  }
  await ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (m) m.role = role;
  });
}

// Seulement pour l'amorçage du compte admin (lib/amorce.ts) : le compte est créé déjà confirmé.
export async function confirmerMembre(membreId: string): Promise<Membre | null> {
  if (moteur() === "supabase") {
    const r = ok(await sb()!.from("membres").update({ confirme: true }).eq("id", membreId).select("*").maybeSingle());
    return r ? membreDe(r) : null;
  }
  return ecrire((b) => {
    const m = b.membres.find((x) => x.id === membreId);
    if (m) m.confirme = true;
    return m ?? null;
  });
}

export async function changerMotDePasse(membreId: string, hache: string): Promise<void> {
  if (moteur() === "supabase") {
    ok(await sb()!.from("membres").update({ mot_de_passe: hache }).eq("id", membreId));
    return;
  }
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
  const jeton: Jeton = { hash: hacher(brut), membreId, but, expire: new Date(Date.now() + duree).toISOString(), utilise: false };
  if (moteur() === "supabase") {
    ok(await sb()!.from("jetons").delete().or(`utilise.eq.true,expire.lt.${maintenant()}`));
    ok(await sb()!.from("jetons").insert({ hash: jeton.hash, membre_id: membreId, but, expire: jeton.expire }));
    return brut;
  }
  await ecrire((b) => {
    b.jetons = b.jetons.filter((j) => !j.utilise && new Date(j.expire) > new Date());
    b.jetons.push(jeton);
  });
  return brut;
}

// Consomme un jeton du bon type. Les deux confirment le courriel (le lien est arrivé dans sa boîte) ;
// « reinitialiser » pose en plus le nouveau mot de passe, déjà haché. Null si le lien est invalide, expiré ou déjà utilisé.
export async function consommerJeton(brut: string, but: Jeton["but"], nouveauHache?: string): Promise<Membre | null> {
  if (but === "reinitialiser" && !nouveauHache) return null;
  const hash = hacher(brut);

  if (moteur() === "supabase") {
    // Marquer « utilisé » seulement s'il ne l'était pas : deux clics simultanés, un seul gagne.
    const pris = liste(await sb()!.from("jetons").update({ utilise: true })
      .eq("hash", hash).eq("but", but).eq("utilise", false).gt("expire", maintenant()).select("membre_id"));
    if (!pris.length) return null;
    const membreId = pris[0].membre_id as string;
    const changement: Ligne = { confirme: true };
    if (but === "reinitialiser") {
      changement.mot_de_passe = nouveauHache;
      // Un changement de mot de passe annule les autres liens encore valides de ce membre.
      ok(await sb()!.from("jetons").update({ utilise: true }).eq("membre_id", membreId).eq("but", "reinitialiser"));
    }
    const r = ok(await sb()!.from("membres").update(changement).eq("id", membreId).select("*").maybeSingle());
    return r ? membreDe(r) : null;
  }

  return ecrire((b) => {
    const j = b.jetons.find((x) => x.hash === hash);
    if (!j || j.but !== but || j.utilise || new Date(j.expire) < new Date()) return null;
    const m = b.membres.find((x) => x.id === j.membreId);
    if (!m) return null;
    if (but === "reinitialiser") {
      m.motDePasse = nouveauHache!;
      b.jetons.filter((x) => x.membreId === m.id && x.but === "reinitialiser").forEach((x) => (x.utilise = true));
    }
    j.utilise = true;
    m.confirme = true;
    return m;
  });
}

// ---------- Essais de connexion ratés : 5, puis 15 minutes de blocage ----------

const MAX_ESSAIS = 5;
const BLOCAGE = 15 * 60e3;
const essais = new Map<string, { n: number; jusqua: number }>(); // moteur fichier

export async function estBloque(courriel: string): Promise<boolean> {
  if (moteur() === "supabase") {
    const r = ok(await sb()!.from("tentatives").select("n, jusqua").eq("courriel", courriel).maybeSingle());
    return !!r && (r.n as number) >= MAX_ESSAIS && new Date(r.jusqua as string) > new Date();
  }
  const e = essais.get(courriel);
  return !!e && e.n >= MAX_ESSAIS && e.jusqua > Date.now();
}

export async function noterEchec(courriel: string): Promise<void> {
  const jusqua = Date.now() + BLOCAGE;
  if (moteur() === "supabase") {
    const r = ok(await sb()!.from("tentatives").select("n, jusqua").eq("courriel", courriel).maybeSingle());
    const n = r && new Date(r.jusqua as string) > new Date() ? (r.n as number) + 1 : 1;
    ok(await sb()!.from("tentatives").upsert({ courriel, n, jusqua: new Date(jusqua).toISOString() }));
    return;
  }
  const e = essais.get(courriel);
  essais.set(courriel, { n: e && e.jusqua > Date.now() ? e.n + 1 : 1, jusqua });
}

export async function effacerEchecs(courriel: string): Promise<void> {
  if (moteur() === "supabase") {
    ok(await sb()!.from("tentatives").delete().eq("courriel", courriel));
    return;
  }
  essais.delete(courriel);
}

// ---------- Références : côté membre (toujours le membre de la session) ----------

export async function referencesDuMembre(membreId: string): Promise<Reference[]> {
  if (moteur() === "supabase") {
    return liste(await sb()!.from("refs").select("*").eq("membre_id", membreId).order("cree_le", { ascending: false })).map(refDe);
  }
  return (await lire()).references
    .filter((r) => r.membreId === membreId)
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}

export async function visitesDuMembre(membreId: string): Promise<string[]> {
  if (moteur() === "supabase") {
    return liste(await sb()!.from("visites").select("le").eq("membre_id", membreId)).map((v) => v.le as string);
  }
  return (await lire()).visites.filter((v) => v.membreId === membreId).map((v) => v.le);
}

// ---------- Page publique du lien ----------

export async function ajouterVisite(membreId: string): Promise<void> {
  if (moteur() === "supabase") {
    ok(await sb()!.from("visites").insert({ membre_id: membreId }));
    return;
  }
  await ecrire((b) => { b.visites.push({ membreId, le: maintenant() }); });
}

export type NouvelleDemande = Pick<Reference, "entreprise" | "contact" | "metier" | "cellulaire" | "courriel" | "casseTete" | "moment" | "rendezVous" | "evenementId">;

// Le premier qui réfère gagne : une entreprise déjà référée (même cellulaire) dans les 6 derniers mois reste au premier.
// Se référer soi-même ne compte pas. Dans les deux cas, la demande est gardée, mais fermée avec sa raison.
function raisonFermeture(membre: Membre, d: NouvelleDemande, deja: { membreId: string } | undefined): string | null {
  const soiMeme = normaliserCellulaire(membre.cellulaire) === normaliserCellulaire(d.cellulaire)
    || (!!d.courriel && normaliserCourriel(d.courriel) === membre.courriel);
  if (soiMeme) return "Le membre s'est référé lui-même";
  if (deja) return deja.membreId === membre.id ? "Déjà référée par ce membre" : "Déjà référée par un autre membre";
  return null;
}

export async function creerReference(membreId: string, d: NouvelleDemande): Promise<Reference> {
  const cell = normaliserCellulaire(d.cellulaire);
  const limite = new Date();
  limite.setMonth(limite.getMonth() - VALIDITE_MOIS);
  const historique = (fermee: string | null): Evenement[] => [
    { le: maintenant(), quoi: fermee ? `Demande reçue, fermée : ${fermee}` : "Demande reçue par le lien" },
    ...(d.rendezVous && !fermee ? [{ le: maintenant(), quoi: `Rencontre prévue le ${d.moment}` }] : []),
  ];

  if (moteur() === "supabase") {
    const membre = await membreParId(membreId);
    if (!membre?.confirme) throw new Error("Lien inactif");
    const deja = liste(await sb()!.from("refs").select("membre_id").eq("cellulaire_norm", cell).is("fermee", null)
      .gt("cree_le", limite.toISOString()).order("cree_le").limit(1))[0];
    const fermee = raisonFermeture(membre, d, deja ? { membreId: deja.membre_id as string } : undefined);
    const r = ok(await sb()!.from("refs").insert({
      membre_id: membreId, entreprise: d.entreprise, contact: d.contact, metier: d.metier, cellulaire: d.cellulaire,
      cellulaire_norm: cell, courriel: d.courriel, casse_tete: d.casseTete, moment: d.moment, rendez_vous: d.rendezVous,
      evenement_id: d.evenementId, fermee, historique: historique(fermee),
    }).select("*").single());
    return refDe(r);
  }

  return ecrire((b) => {
    const membre = b.membres.find((m) => m.id === membreId && m.confirme);
    if (!membre) throw new Error("Lien inactif");
    const deja = b.references.find((r) => !r.fermee && normaliserCellulaire(r.cellulaire) === cell && new Date(r.creeLe) > limite);
    const fermee = raisonFermeture(membre, d, deja);
    const r: Reference = { id: randomUUID(), membreId, ...d, creeLe: maintenant(), etape: 1, fermee, notes: "", historique: historique(fermee) };
    b.references.push(r);
    return r;
  });
}

// Les rendez-vous déjà pris par la plateforme (à partir d'une date) : ils bloquent leur plage même si
// Google Agenda ne les montre pas encore. Seulement des heures : rien sur qui les a pris.
export async function rendezVousPris(apres: string): Promise<string[]> {
  if (moteur() === "supabase") {
    const [r, s] = await Promise.all([
      sb()!.from("refs").select("rendez_vous").gte("rendez_vous", apres),
      sb()!.from("rdv_site").select("rendez_vous").gte("rendez_vous", apres),
    ]);
    // Tant que la table rdv_site n'existe pas (migration du 18 nov. 2026 pas encore exécutée), les liens de
    // référence continuent de marcher : seuls leurs rendez-vous comptent.
    if (s.error) console.error(`rdv_site : ${s.error.message}`);
    return [...liste(r), ...(s.data ?? [])].map((x) => x.rendez_vous as string);
  }
  const b = await lire();
  return [...b.references, ...b.rdvSite].filter((r) => r.rendezVous && r.rendezVous >= apres).map((r) => r.rendezVous!);
}

// ---------- Réglages de l'agenda (lus par tous, écrits seulement par la console) ----------

// null tant qu'Alexis n'a rien enregistré : lib/agenda.ts prend alors ses valeurs par défaut.
export async function lireReglagesAgenda(): Promise<ReglagesAgenda | null> {
  if (moteur() === "supabase") {
    const r = await sb()!.from("reglages").select("valeur").eq("cle", "agenda").maybeSingle();
    // Table absente (migration pas encore exécutée) : les valeurs par défaut s'appliquent, rien ne casse.
    if (r.error) { console.error(`reglages : ${r.error.message}`); return null; }
    return (r.data?.valeur as ReglagesAgenda) ?? null;
  }
  return (await lire()).reglagesAgenda ?? null;
}

// Après exigerAdmin() seulement.
export async function adminEcrireReglagesAgenda(r: ReglagesAgenda): Promise<void> {
  if (moteur() === "supabase") {
    ok(await sb()!.from("reglages").upsert({ cle: "agenda", valeur: r, maj_le: maintenant() }));
    return;
  }
  await ecrire((b) => { b.reglagesAgenda = r; });
}

// ---------- Rendez-vous pris sur le site web (sans lien de référence) ----------

export async function creerRdvSite(d: Omit<RdvSite, "id" | "creeLe">): Promise<RdvSite> {
  if (moteur() === "supabase") {
    return rdvSiteDe(ok(await sb()!.from("rdv_site").insert({
      entreprise: d.entreprise, contact: d.contact, metier: d.metier, cellulaire: d.cellulaire, courriel: d.courriel,
      casse_tete: d.casseTete, moment: d.moment, rendez_vous: d.rendezVous, evenement_id: d.evenementId,
    }).select("*").single()) as Ligne);
  }
  return ecrire((b) => {
    const r: RdvSite = { id: randomUUID(), ...d, creeLe: maintenant() };
    b.rdvSite.push(r);
    return r;
  });
}

// ---------- Console d'admin (après exigerAdmin() seulement) ----------

export async function adminTout(): Promise<Pick<Base, "membres" | "references" | "rdvSite" | "visites">> {
  if (moteur() === "supabase") {
    const [m, r, s, v] = await Promise.all([
      sb()!.from("membres").select("*"),
      sb()!.from("refs").select("*"),
      sb()!.from("rdv_site").select("*").gte("cree_le", new Date(Date.now() - 30 * 86400e3).toISOString()),
      sb()!.from("visites").select("membre_id, le"),
    ]);
    return {
      membres: liste(m).map(membreDe),
      references: liste(r).map(refDe),
      rdvSite: liste(s).map(rdvSiteDe),
      visites: liste(v).map((x) => ({ membreId: x.membre_id as string, le: x.le as string })),
    };
  }
  const { membres, references, rdvSite, visites } = await lire();
  return { membres, references, rdvSite, visites };
}

export async function adminMajReference(id: string, d: { etape?: number; fermee?: string | null; notes?: string; quoi?: string }): Promise<Reference | null> {
  const appliquer = (r: Reference) => {
    if (d.etape !== undefined && d.etape >= 1 && d.etape <= 6) r.etape = d.etape;
    if (d.fermee !== undefined) r.fermee = d.fermee;
    if (d.notes !== undefined) r.notes = d.notes;
    if (d.quoi) r.historique.push({ le: maintenant(), quoi: d.quoi });
    return r;
  };
  if (moteur() === "supabase") {
    const ligne = ok(await sb()!.from("refs").select("*").eq("id", id).maybeSingle());
    if (!ligne) return null;
    const r = appliquer(refDe(ligne));
    ok(await sb()!.from("refs").update({ etape: r.etape, fermee: r.fermee, notes: r.notes, historique: r.historique }).eq("id", id));
    return r;
  }
  return ecrire((b) => {
    const r = b.references.find((x) => x.id === id);
    return r ? appliquer(r) : null;
  });
}

// ---------- Boîte locale des courriels (ordinateur, sans SendGrid) : toujours un fichier ----------

const BOITE = path.join(DOSSIER, "courriels.json");

export async function garderCourrielLocal(c: Omit<CourrielLocal, "le">): Promise<void> {
  const liste = await courrielsLocaux();
  liste.unshift({ ...c, le: maintenant() });
  await fs.mkdir(DOSSIER, { recursive: true });
  await fs.writeFile(BOITE, JSON.stringify(liste.slice(0, 50), null, 2));
}

export async function courrielsLocaux(): Promise<CourrielLocal[]> {
  try {
    return JSON.parse(await fs.readFile(BOITE, "utf8"));
  } catch {
    return [];
  }
}
