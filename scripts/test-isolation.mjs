// Prouve qu'un membre ne voit jamais les références d'un autre, et que la console est fermée aux membres.
// Le test passe par les vraies routes : inscription, courriel de confirmation, session, pages et API.
//
//   npm run local, puis npm run test:isolation                       → sur le fichier local
//   npm run supabase, puis npm run test:isolation -- --supabase      → sur la vraie base Supabase (.env.local)
//
// Il lit la base seulement pour retrouver ce qu'un humain lirait ailleurs (le lien reçu par courriel, l'adresse
// du lien) et pour vérifier qu'une référence n'a pas bougé. Les membres de test s'appellent « …@test.local ».
import { readFileSync } from "node:fs";

const SUPABASE = process.argv.includes("--supabase");
if (SUPABASE) process.loadEnvFile(".env.local");
const APP = process.env.TEST_APP_URL ?? "http://localhost:3100";
const id = Date.now().toString(36);
let echecs = 0;
const verifier = (ok, quoi) => { console.log(`${ok ? "✓" : "✗"} ${quoi}`); if (!ok) echecs++; };
const json = (corps) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });

async function table(nom) {
  const rep = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${nom}?select=*`, {
    headers: { apikey: process.env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` },
  });
  if (!rep.ok) throw new Error(`Lecture de ${nom} : ${rep.status}`);
  return rep.json();
}
async function lireBase() {
  if (SUPABASE) {
    const [membres, references] = await Promise.all([table("membres"), table("refs")]);
    return { membres, references };
  }
  return JSON.parse(readFileSync(".donnees/base.json", "utf8"));
}
let instantane = { membres: [], references: [] };
const base = () => instantane;
const relire = async () => { instantane = await lireBase(); };
const courriels = () => { try { return JSON.parse(readFileSync(".donnees/courriels.json", "utf8")); } catch { return []; } };

const MDP = "un mot de passe de test";

async function inscrire(prenom, cell) {
  const courriel = `${prenom.toLowerCase()}-${id}@test.local`;
  const rep = await fetch(`${APP}/api/inscription`, json({ prenom, nom: "Test", cellulaire: cell, courriel, motDePasse: MDP, accepteRegles: true, prenomVisible: true }));
  verifier(rep.ok, `inscription de ${prenom}`);
  await relire();
  const membre = base().membres.find((m) => m.courriel === courriel);
  return { courriel, slug: membre.slug };
}

async function confirmer(courriel) {
  const lien = courriels().find((c) => c.a === courriel)?.lien;
  const rep = await fetch(lien, { redirect: "manual" });
  const temoin = (rep.headers.get("set-cookie") ?? "").split(";")[0];
  verifier(rep.status >= 300 && rep.status < 400 && temoin.startsWith("aj_session="), `confirmation du courriel de ${courriel.split("-")[0]}`);
  return { temoin, lien };
}

const page = (chemin, temoin) => fetch(`${APP}${chemin}`, { redirect: "manual", headers: temoin ? { Cookie: temoin } : {} });

// 1. Deux membres, A et B. Le lien de C n'est jamais confirmé.
const A = await inscrire("Annie", "418-555-1001");
const B = await inscrire("Bruno", "418-555-1002");
const C = await inscrire("Carl", "418-555-1003");
const sa = await confirmer(A.courriel);
const sb = await confirmer(B.courriel);

// 2. Un lien de confirmation ne sert qu'une fois.
const reutilise = await fetch(sa.lien, { redirect: "manual" });
verifier((reutilise.headers.get("location") ?? "").includes("lien=expire"), "un lien de confirmation déjà utilisé est refusé");

// 2b. Connexion par courriel et mot de passe.
const connecter = (courriel, motDePasse) => fetch(`${APP}/api/connexion`, json({ courriel, motDePasse }));
verifier((await connecter(A.courriel, "mauvais mot de passe")).status === 401, "un mauvais mot de passe est refusé");
const bonne = await connecter(A.courriel, MDP);
const temoinA2 = (bonne.headers.get("set-cookie") ?? "").split(";")[0];
verifier(bonne.ok && temoinA2.startsWith("aj_session="), "le bon mot de passe ouvre la session");
verifier((await page("/compte", temoinA2)).status === 200, "la session ouverte par mot de passe donne accès au compte");
verifier(!(await (await page("/compte/profil", temoinA2)).text()).includes("scrypt$"), "le mot de passe haché n'apparaît jamais dans une page");
const nonConfirme = await connecter(C.courriel, MDP);
verifier(nonConfirme.status === 403 && !(nonConfirme.headers.get("set-cookie") ?? "").includes("aj_session"), "un compte non confirmé ne s'ouvre pas, même avec le bon mot de passe");

// Se réinscrire avec le même courriel ne change pas le mot de passe.
await fetch(`${APP}/api/inscription`, json({ prenom: "Pirate", nom: "Test", cellulaire: "418-555-9999", courriel: A.courriel, motDePasse: "le mot de passe du pirate", accepteRegles: true, prenomVisible: true }));
verifier((await connecter(A.courriel, "le mot de passe du pirate")).status === 401 && (await connecter(A.courriel, MDP)).ok, "se réinscrire avec un courriel existant ne change pas son mot de passe");

// Trop d'essais : bloqué, même avec le bon mot de passe.
const D = await inscrire("Denis", "418-555-1004");
await confirmer(D.courriel);
for (let i = 0; i < 5; i++) await connecter(D.courriel, "pas le bon");
verifier((await connecter(D.courriel, MDP)).status === 429, "après 5 essais ratés, le compte est bloqué 15 minutes");

// Mot de passe oublié : le lien sert une fois, l'ancien mot de passe ne marche plus.
await fetch(`${APP}/api/mot-de-passe-oublie`, json({ courriel: B.courriel }));
const jetonReinit = new URL(courriels().find((c) => c.a === B.courriel && c.lien?.includes("/reinitialiser")).lien).searchParams.get("jeton");
const NOUVEAU = "un tout nouveau mot de passe";
verifier((await fetch(`${APP}/api/reinitialiser`, json({ jeton: jetonReinit, motDePasse: NOUVEAU }))).ok, "le lien « mot de passe oublié » permet d'en choisir un nouveau");
verifier((await fetch(`${APP}/api/reinitialiser`, json({ jeton: jetonReinit, motDePasse: "encore un autre essai" }))).status === 400, "ce lien ne sert qu'une fois");
verifier((await connecter(B.courriel, MDP)).status === 401 && (await connecter(B.courriel, NOUVEAU)).ok, "l'ancien mot de passe ne marche plus, le nouveau oui");
verifier((await fetch(`${APP}/api/reinitialiser`, json({ jeton: new URL(sa.lien).searchParams.get("jeton"), motDePasse: "avec un lien de confirmation" }))).status === 400, "un lien de confirmation ne peut pas changer un mot de passe");
verifier((await fetch(`${APP}/api/mot-de-passe`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actuel: MDP, nouveau: "x".repeat(12) }) })).status === 401, "sans session, le mot de passe ne se change pas");

// 3. Une référence pour B seulement.
const secret = `Secret ${id}`;
const rep = await fetch(`${APP}/api/r/${B.slug}/demande`, json({ contact: "Dany Client", entreprise: secret, metier: "Émondage", cellulaire: "418-555-2001", courriel: "", casseTete: "", moment: "lundi, midi" }));
verifier(rep.ok, "une demande arrive par le lien de B");

const htmlB = await (await page("/compte/references", sb.temoin)).text();
const htmlA = await (await page("/compte/references", sa.temoin)).text();
verifier(htmlB.includes(secret), "B voit sa référence");
verifier(!htmlA.includes(secret), "A ne voit PAS la référence de B");
verifier(!(await (await page("/compte", sa.temoin)).text()).includes(secret), "l'accueil de A ne montre pas la référence de B");

// 4. La console est fermée aux membres et aux visiteurs.
for (const chemin of ["/admin", "/admin/references", "/admin/membres", "/admin/reglages"]) {
  const r = await page(chemin, sa.temoin);
  verifier(r.status >= 300 && r.status < 400 && !(r.headers.get("location") ?? "").includes("/admin"), `un membre est renvoyé hors de ${chemin}`);
}
await relire();
const refB = base().references.find((r) => r.entreprise === secret);
const patch = await fetch(`${APP}/api/admin/references/${refB.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: sa.temoin }, body: JSON.stringify({ etape: 6 }) });
verifier(patch.status === 403, "un membre ne peut pas faire avancer une référence");
await relire();
verifier(base().references.find((r) => r.id === refB.id).etape === 1, "la référence n'a pas bougé");
const corpsReg = JSON.stringify({ duree: 60, pause: 0, disponibilites: {} });
const reg = await fetch(`${APP}/api/admin/reglages`, { method: "PUT", headers: { "Content-Type": "application/json", Cookie: sa.temoin }, body: corpsReg });
verifier(reg.status === 403, "un membre ne peut pas changer les réglages de l'agenda");
const regAnonyme = await fetch(`${APP}/api/admin/reglages`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: corpsReg });
verifier(regAnonyme.status === 403, "sans session, les réglages ne changent pas");

// 5. Sans session, ou avec un témoin falsifié : renvoyé à la connexion.
verifier(((await page("/compte")).headers.get("location") ?? "").includes("/connexion"), "sans session, /compte renvoie à la connexion");
const faux = sa.temoin.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
verifier(((await page("/compte", faux)).headers.get("location") ?? "").includes("/connexion"), "un témoin falsifié est refusé");
verifier((await fetch(`${APP}/api/profil`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: "{}" })).status === 401, "sans session, le profil ne se modifie pas");

// 6. Un lien jamais confirmé ne fonctionne pas.
verifier((await page(`/r/${C.slug}`)).status === 404, "le lien d'un membre non confirmé n'existe pas");

// 7. Les règles : se référer soi-même, et le premier qui réfère gagne.
await fetch(`${APP}/api/r/${B.slug}/demande`, json({ contact: "Bruno Test", entreprise: `Moi ${id}`, metier: "Ramonage", cellulaire: "418-555-1002", courriel: "", casseTete: "", moment: "lundi, midi" }));
await relire();
verifier(!!base().references.find((r) => r.entreprise === `Moi ${id}`)?.fermee, "se référer soi-même ne compte pas");
await fetch(`${APP}/api/r/${A.slug}/demande`, json({ contact: "Dany Client", entreprise: `Doublon ${id}`, metier: "Émondage", cellulaire: "(418) 555-2001", courriel: "", casseTete: "", moment: "mardi, midi" }));
await relire();
verifier(base().references.find((r) => r.entreprise === `Doublon ${id}`)?.fermee === "Déjà référée par un autre membre", "le premier qui réfère gagne");

// Sur la vraie base : retirer les membres de test (leurs références, visites et liens partent avec eux).
if (SUPABASE) {
  const entetes = { apikey: process.env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` };
  for (const t of ["membres", "tentatives"]) {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/${t}?courriel=like.*%40test.local`, { method: "DELETE", headers: entetes });
  }
  const restants = (await table("membres")).filter((m) => m.courriel.endsWith("@test.local")).length;
  verifier(restants === 0, "les membres de test sont retirés de la base");
}

console.log(echecs ? `\n${echecs} échec(s)` : "\nTout passe.");
process.exit(echecs ? 1 : 0);
