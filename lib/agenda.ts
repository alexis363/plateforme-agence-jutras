// Les rendez-vous de 15 minutes, pris directement dans l'agenda Google d'Alexis (option A, choisie le 18 nov. 2026).
//
// 1. Les plages viennent des réglages de la console (durée, pause, disponibilités, en heure de Québec),
//    moins le préavis de 12 h. Sans réglages enregistrés, les valeurs par défaut ci-dessous s'appliquent.
// 2. Ce qui est déjà inscrit dans N'IMPORTE LEQUEL des agendas du compte Google les bloque (requête « freeBusy ») :
//    cours, devoirs, études, entraînement, famille, trajet de bus… (demande d'Alexis du 26 nov. 2026).
// 3. La réservation crée l'événement dans l'agenda, et Google envoie l'invitation à l'entrepreneur.
//
// Sans les clés Google (sur l'ordinateur), l'agenda est simulé : les plages s'affichent, rien n'est bloqué ni créé.

export const FUSEAU = "America/Toronto"; // l'heure de Québec
export const PREAVIS_H = 12;
// Une plage commence à chaque quart d'heure, quels que soient la durée et le temps entre les rendez-vous :
// plus de choix pour le client (demande d'Alexis du 18 nov. 2026). La pause sert seulement à bloquer
// les plages autour d'un rendez-vous déjà pris.
const PAS_MIN = 15;

import { rendezVousPris, lireReglagesAgenda } from "./depot.ts";
import type { ReglagesAgenda } from "./types.ts";

// Les valeurs par défaut : les disponibilités d'Alexis au 18 nov. 2026 (0 = dimanche … 6 = samedi), 15 minutes, sans pause.
export const REGLAGES_DEFAUT: ReglagesAgenda = {
  duree: 15,
  pause: 0,
  disponibilites: {
    "0": [], "1": [["19:00", "21:00"]], "2": [["19:30", "21:00"]], "3": [["19:00", "22:00"]],
    "4": [["08:00", "10:00"], ["19:30", "21:00"]], "5": [], "6": [],
  },
};

export async function reglagesAgenda(): Promise<ReglagesAgenda> {
  return (await lireReglagesAgenda()) ?? REGLAGES_DEFAUT;
}

// ---------- Heure de Québec ↔ instant universel, sans bibliothèque ----------

const morceaux = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSEAU, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function enQuebec(instant: number) {
  const p = Object.fromEntries(morceaux.formatToParts(new Date(instant)).map((x) => [x.type, x.value]));
  return { a: +p.year, m: +p.month, j: +p.day, h: +p.hour, mi: +p.minute };
}

function decalage(instant: number): number {
  const q = enQuebec(instant);
  return Date.UTC(q.a, q.m - 1, q.j, q.h, q.mi) - Math.floor(instant / 60000) * 60000;
}

// Une heure de Québec (an, mois 1-12, jour, heure, minute) → l'instant correspondant.
export function depuisQuebec(a: number, m: number, j: number, h: number, mi: number): Date {
  const devine = Date.UTC(a, m - 1, j, h, mi);
  let t = devine - decalage(devine);
  const corrige = devine - decalage(t);
  if (corrige !== t) t = corrige;
  return new Date(t);
}

const JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."];
const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const heureTexte = (h: number, mi: number) => `${h} h${mi ? ` ${String(mi).padStart(2, "0")}` : ""}`;

// « lundi 23 novembre à 19 h 15 », en heure de Québec.
export function momentTexte(iso: string): string {
  const q = enQuebec(new Date(iso).getTime());
  const jourSemaine = new Date(Date.UTC(q.a, q.m - 1, q.j)).getUTCDay();
  return `${JOURS_LONGS[jourSemaine]} ${q.j} ${MOIS_LONGS[q.m - 1]} à ${heureTexte(q.h, q.mi)}`;
}

// « 24 nov. à 19 h », pour les listes.
export function momentCourt(iso: string): string {
  const q = enQuebec(new Date(iso).getTime());
  return `${q.j} ${MOIS[q.m - 1]} à ${heureTexte(q.h, q.mi)}`;
}

// ---------- Les plages ----------

export type Plage = { debut: string; heure: string };
export type JourDePlages = { date: string; libelle: string; plages: Plage[] };

// Les plages possibles selon les réglages : une tous les quarts d'heure, et le rendez-vous finit avant la fin
// de la disponibilité.
function plagesTheoriques(r: ReglagesAgenda, maintenant = Date.now()): { debut: number; jourCle: string; libelle: string; heure: string }[] {
  const auj = enQuebec(maintenant);
  const premier = maintenant + PREAVIS_H * 3600e3;
  const sortie = [];
  // Cette semaine et les 3 semaines suivantes (demande d'Alexis du 26 nov. 2026 : « au moins les 3 prochaines
  // semaines ») : jusqu'au dimanche, 3 semaines plus loin, la semaine allant du lundi au dimanche.
  const jourSemaine = new Date(Date.UTC(auj.a, auj.m - 1, auj.j)).getUTCDay();
  const horizon = ((7 - jourSemaine) % 7) + 21;
  for (let i = 0; i <= horizon; i++) {
    const d = new Date(Date.UTC(auj.a, auj.m - 1, auj.j + i));
    const [a, m, j] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    for (const [de, a2] of r.disponibilites[String(d.getUTCDay())] ?? []) {
      const [h1, m1] = de.split(":").map(Number), [h2, m2] = a2.split(":").map(Number);
      for (let t = h1 * 60 + m1; t + r.duree <= h2 * 60 + m2; t += PAS_MIN) {
        const debut = depuisQuebec(a, m, j, Math.floor(t / 60), t % 60).getTime();
        if (debut < premier) continue;
        sortie.push({
          debut,
          jourCle: `${a}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`,
          libelle: `${JOURS[d.getUTCDay()]} ${j} ${MOIS[m - 1]}`,
          heure: heureTexte(Math.floor(t / 60), t % 60),
        });
      }
    }
  }
  return sortie;
}

// ---------- Google Agenda ----------

function googleConfigure(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

export function agendaSimule(): boolean {
  return !googleConfigure();
}

const calendrier = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");

let jeton: { valeur: string; expire: number } | null = null;
async function jetonGoogle(): Promise<string> {
  if (jeton && jeton.expire > Date.now() + 60e3) return jeton.valeur;
  const rep = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!, grant_type: "refresh_token",
    }),
  });
  if (!rep.ok) throw new Error(`Google a refusé le jeton (${rep.status})`);
  const d = await rep.json();
  jeton = { valeur: d.access_token, expire: Date.now() + d.expires_in * 1000 };
  return jeton.valeur;
}

// Tous les agendas du compte Google : l'agenda principal, plus chaque agenda de la liste (« Cours du cégep »,
// « Devoirs », « Famille »…). Les jours fériés et les anniversaires des contacts ne bloquent rien.
// Si Google refuse la liste (droits du jeton), on garde au moins l'agenda principal.
let agendas: { ids: string[]; expire: number } | null = null;
async function tousLesAgendas(): Promise<string[]> {
  if (agendas && agendas.expire > Date.now()) return agendas.ids;
  const principal = decodeURIComponent(calendrier());
  const ids = new Set([principal]);
  try {
    const rep = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=freeBusyReader&maxResults=250", {
      headers: { Authorization: `Bearer ${await jetonGoogle()}` },
    });
    if (rep.ok) {
      const d = await rep.json() as { items?: { id: string }[] };
      for (const c of d.items ?? []) if (!/#holiday@|#contacts@|addressbook#/.test(c.id)) ids.add(c.id);
    }
  } catch { /* la liste reste à l'agenda principal */ }
  agendas = { ids: [...ids].slice(0, 50), expire: Date.now() + 10 * 60e3 };
  return agendas.ids;
}

// Ce qui est déjà pris entre deux instants, dans tous les agendas. Les rendez-vous de la plateforme comptent pour
// la durée réglée.
async function occupe(de: number, a: number, duree: number): Promise<{ debut: number; fin: number }[]> {
  const deja = (await rendezVousPris(new Date(de - 120 * 60e3).toISOString()))
    .map((iso) => ({ debut: Date.parse(iso), fin: Date.parse(iso) + duree * 60e3 }));
  if (!googleConfigure()) return deja;
  const ids = await tousLesAgendas();
  const rep = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${await jetonGoogle()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: new Date(de).toISOString(), timeMax: new Date(a).toISOString(), items: ids.map((id) => ({ id })) }),
  });
  if (!rep.ok) throw new Error(`Google Agenda ne répond pas (${rep.status})`);
  const d = await rep.json();
  const cals = (d.calendars ?? {}) as Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
  // L'agenda principal doit répondre ; un autre agenda en erreur est simplement ignoré.
  const principal = cals[ids[0]];
  if (!principal || principal.errors?.length) throw new Error("Agenda Google introuvable");
  const pris = Object.values(cals).flatMap((c) => (c.errors?.length ? [] : c.busy ?? []));
  return [...deja, ...pris.map((b) => ({ debut: Date.parse(b.start), fin: Date.parse(b.end) }))];
}

// Une plage est prise si elle touche un moment occupé, en gardant la pause avant et après.
const chevauche = (debut: number, pris: { debut: number; fin: number }[], r: ReglagesAgenda) =>
  pris.some((p) => debut - r.pause * 60e3 < p.fin && debut + (r.duree + r.pause) * 60e3 > p.debut);

// Les plages libres de cette semaine et des 3 suivantes, regroupées par jour.
export async function plagesLibres(): Promise<JourDePlages[]> {
  const r = await reglagesAgenda();
  const toutes = plagesTheoriques(r);
  if (!toutes.length) return [];
  const marge = (r.duree + r.pause) * 60e3;
  const pris = await occupe(toutes[0].debut - r.pause * 60e3, toutes[toutes.length - 1].debut + marge, r.duree);
  const jours = new Map<string, JourDePlages>();
  for (const p of toutes) {
    if (chevauche(p.debut, pris, r)) continue;
    const jour = jours.get(p.jourCle) ?? { date: p.jourCle, libelle: p.libelle, plages: [] };
    jour.plages.push({ debut: new Date(p.debut).toISOString(), heure: p.heure });
    jours.set(p.jourCle, jour);
  }
  return [...jours.values()];
}

// Vérifie, au moment de réserver, que la plage existe encore et qu'elle est toujours libre.
export async function plageEncoreLibre(debutIso: string): Promise<boolean> {
  const r = await reglagesAgenda();
  const debut = Date.parse(debutIso);
  if (!plagesTheoriques(r).some((p) => p.debut === debut)) return false;
  return !chevauche(debut, await occupe(debut - r.pause * 60e3, debut + (r.duree + r.pause) * 60e3, r.duree), r);
}

// ambassadeur : le membre qui a référé, ou null pour un rendez-vous pris sur le site web.
export type Rdv = { debut: string; entreprise: string; contact: string; metier: string; cellulaire: string; courriel: string; casseTete: string; ambassadeur: string | null };

// Crée le rendez-vous dans l'agenda d'Alexis, avec un lien Google Meet ; Google envoie l'invitation à l'entrepreneur.
// Retourne l'identifiant de l'événement (null en agenda simulé).
export async function creerRendezVous(r: Rdv): Promise<string | null> {
  if (!googleConfigure()) return null;
  const { duree } = await reglagesAgenda();
  const debut = Date.parse(r.debut);
  const description = [
    r.ambassadeur ? `Recommandé par : ${r.ambassadeur}` : "Pris sur le site agencejutras.com",
    `Entreprise : ${r.entreprise}${r.metier ? ` (${r.metier})` : ""}`,
    `Contact : ${r.contact}, ${r.cellulaire}`,
    r.casseTete ? `Son plus gros casse-tête : ${r.casseTete}` : "",
    "",
    r.ambassadeur
      ? "On se parle sur Google Meet : le lien est dans cette invitation. Pris par le programme ambassadeur Kairos de l'Agence Jutras."
      : "On se parle sur Google Meet : le lien est dans cette invitation.",
  ].filter((l, i, t) => l || i === t.length - 2).join("\n");
  const evenement = {
    summary: r.ambassadeur ? `Google Meet ${duree} min · Kairos · ${r.entreprise}` : `Google Meet ${duree} min · Agence Jutras · ${r.entreprise}`,
    description,
    start: { dateTime: new Date(debut).toISOString(), timeZone: FUSEAU },
    end: { dateTime: new Date(debut + duree * 60e3).toISOString(), timeZone: FUSEAU },
    attendees: r.courriel ? [{ email: r.courriel, displayName: r.contact }] : [],
    reminders: { useDefault: true },
  };
  const creer = async (avecMeet: boolean) => fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendrier()}/events?sendUpdates=all${avecMeet ? "&conferenceDataVersion=1" : ""}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await jetonGoogle()}`, "Content-Type": "application/json" },
    body: JSON.stringify(avecMeet
      ? { ...evenement, conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } } }
      : evenement),
  });
  // Si Google refuse le lien Meet, le rendez-vous est quand même créé (Alexis ajoute le lien à la main).
  let rep = await creer(true);
  if (!rep.ok) rep = await creer(false);
  if (!rep.ok) throw new Error(`Google n'a pas créé le rendez-vous (${rep.status})`);
  return (await rep.json()).id ?? null;
}
