// Les rendez-vous de 15 minutes, pris directement dans l'agenda Google d'Alexis (option A, choisie le 18 nov. 2026).
//
// 1. Les plages viennent des disponibilités ci-dessous (heure de Québec), moins le préavis de 12 h.
// 2. Ce qui est déjà inscrit dans l'agenda Google les bloque (requête « freeBusy »).
// 3. La réservation crée l'événement dans l'agenda, et Google envoie l'invitation à l'entrepreneur.
//
// Sans les clés Google (sur l'ordinateur), l'agenda est simulé : les plages s'affichent, rien n'est bloqué ni créé.

export const FUSEAU = "America/Toronto"; // l'heure de Québec
export const DUREE_MIN = 15;
export const PREAVIS_H = 12;

// Les disponibilités d'Alexis au 18 nov. 2026 (0 = dimanche … 6 = samedi), en heures de Québec.
// Vendredi, samedi et dimanche : aucune plage.
export const DISPONIBILITES: Record<number, [string, string][]> = {
  1: [["19:00", "21:00"]],
  2: [["19:30", "21:00"]],
  3: [["19:00", "22:00"]],
  4: [["08:00", "10:00"], ["19:30", "21:00"]],
};

import { rendezVousPris } from "./depot.ts";

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

function plagesTheoriques(maintenant = Date.now()): { debut: number; jourCle: string; libelle: string; heure: string }[] {
  const auj = enQuebec(maintenant);
  const premier = maintenant + PREAVIS_H * 3600e3;
  const sortie = [];
  // Cette semaine et la semaine prochaine seulement (décision d'Alexis du 18 nov. 2026) : jusqu'au dimanche
  // de la semaine prochaine, la semaine allant du lundi au dimanche.
  const jourSemaine = new Date(Date.UTC(auj.a, auj.m - 1, auj.j)).getUTCDay();
  const horizon = ((7 - jourSemaine) % 7) + 7;
  for (let i = 0; i <= horizon; i++) {
    const d = new Date(Date.UTC(auj.a, auj.m - 1, auj.j + i));
    const [a, m, j] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    for (const [de, a2] of DISPONIBILITES[d.getUTCDay()] ?? []) {
      const [h1, m1] = de.split(":").map(Number), [h2, m2] = a2.split(":").map(Number);
      for (let t = h1 * 60 + m1; t + DUREE_MIN <= h2 * 60 + m2; t += DUREE_MIN) {
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

async function occupe(de: number, a: number): Promise<{ debut: number; fin: number }[]> {
  const deja = (await rendezVousPris(new Date(de - DUREE_MIN * 60e3).toISOString()))
    .map((iso) => ({ debut: Date.parse(iso), fin: Date.parse(iso) + DUREE_MIN * 60e3 }));
  if (!googleConfigure()) return deja;
  const rep = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${await jetonGoogle()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: new Date(de).toISOString(), timeMax: new Date(a).toISOString(), items: [{ id: decodeURIComponent(calendrier()) }] }),
  });
  if (!rep.ok) throw new Error(`Google Agenda ne répond pas (${rep.status})`);
  const d = await rep.json();
  const cal = Object.values(d.calendars ?? {})[0] as { busy?: { start: string; end: string }[]; errors?: unknown[] } | undefined;
  if (!cal || cal.errors?.length) throw new Error("Agenda Google introuvable");
  return [...deja, ...(cal.busy ?? []).map((b) => ({ debut: Date.parse(b.start), fin: Date.parse(b.end) }))];
}

const chevauche = (debut: number, pris: { debut: number; fin: number }[]) =>
  pris.some((p) => debut < p.fin && debut + DUREE_MIN * 60e3 > p.debut);

// Les plages libres de cette semaine et de la suivante, regroupées par jour.
export async function plagesLibres(): Promise<JourDePlages[]> {
  const toutes = plagesTheoriques();
  if (!toutes.length) return [];
  const pris = await occupe(toutes[0].debut, toutes[toutes.length - 1].debut + DUREE_MIN * 60e3);
  const jours = new Map<string, JourDePlages>();
  for (const p of toutes) {
    if (chevauche(p.debut, pris)) continue;
    const jour = jours.get(p.jourCle) ?? { date: p.jourCle, libelle: p.libelle, plages: [] };
    jour.plages.push({ debut: new Date(p.debut).toISOString(), heure: p.heure });
    jours.set(p.jourCle, jour);
  }
  return [...jours.values()];
}

// Vérifie, au moment de réserver, que la plage existe encore et qu'elle est toujours libre.
export async function plageEncoreLibre(debutIso: string): Promise<boolean> {
  const debut = Date.parse(debutIso);
  if (!plagesTheoriques().some((p) => p.debut === debut)) return false;
  return !chevauche(debut, await occupe(debut, debut + DUREE_MIN * 60e3));
}

// ambassadeur : le membre qui a référé, ou null pour un rendez-vous pris sur le site web.
export type Rdv = { debut: string; entreprise: string; contact: string; metier: string; cellulaire: string; courriel: string; casseTete: string; ambassadeur: string | null };

// Crée le rendez-vous dans l'agenda d'Alexis ; Google envoie l'invitation à l'entrepreneur s'il a laissé un courriel.
// Retourne l'identifiant de l'événement (null en agenda simulé).
export async function creerRendezVous(r: Rdv): Promise<string | null> {
  if (!googleConfigure()) return null;
  const debut = Date.parse(r.debut);
  const description = [
    r.ambassadeur ? `Recommandé par : ${r.ambassadeur}` : "Pris sur le site agencejutras.com",
    `Entreprise : ${r.entreprise}${r.metier ? ` (${r.metier})` : ""}`,
    `Contact : ${r.contact}, ${r.cellulaire}`,
    r.casseTete ? `Son plus gros casse-tête : ${r.casseTete}` : "",
    "",
    r.ambassadeur
      ? "Alexis vous appelle au numéro ci-dessus. Pris par le programme de référence de l'Agence Jutras."
      : "Alexis vous appelle au numéro ci-dessus.",
  ].filter((l, i, t) => l || i === t.length - 2).join("\n");
  const rep = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendrier()}/events?sendUpdates=all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await jetonGoogle()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: r.ambassadeur ? `Appel 15 min · Kairos · ${r.entreprise}` : `Appel 15 min · Agence Jutras · ${r.entreprise}`,
      description,
      start: { dateTime: new Date(debut).toISOString(), timeZone: FUSEAU },
      end: { dateTime: new Date(debut + DUREE_MIN * 60e3).toISOString(), timeZone: FUSEAU },
      attendees: r.courriel ? [{ email: r.courriel, displayName: r.contact }] : [],
      reminders: { useDefault: true },
    }),
  });
  if (!rep.ok) throw new Error(`Google n'a pas créé le rendez-vous (${rep.status})`);
  return (await rep.json()).id ?? null;
}
