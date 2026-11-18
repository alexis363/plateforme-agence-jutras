// Crée (ou remet à neuf) le compte admin d'Alexis directement dans la vraie base Supabase.
// Le compte est créé déjà confirmé, sans courriel.
//
//   npm run creer-admin
//
// Le mot de passe se tape dans le terminal, sans s'afficher. Il est haché ici (même format que lib/motdepasse.ts)
// et seule l'empreinte part vers la base. Les clés viennent de .env.local et ne s'affichent jamais.
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

process.loadEnvFile(".env.local");
const URL_BASE = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const CLE = process.env.SUPABASE_SECRET_KEY;
if (!URL_BASE || !CLE) { console.error("SUPABASE_URL ou SUPABASE_SECRET_KEY manque dans .env.local."); process.exit(1); }

// Une seule interface pour toutes les questions ; pendant un mot de passe, rien de ce qui est tapé ne s'affiche.
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
let masque = false;
const ecrireOriginal = rl._writeToOutput?.bind(rl);
rl._writeToOutput = (s) => { if (!masque) ecrireOriginal ? ecrireOriginal(s) : process.stdout.write(s); };
// Les lignes tapées (ou reçues d'un autre programme) attendent dans une file : aucune ne se perd.
const file = [], attente = [];
rl.on("line", (l) => (attente.length ? attente.shift()(l) : file.push(l)));
function question(texte, cache = false) {
  process.stdout.write(texte);
  masque = cache;
  return new Promise((ok) => {
    const repondre = (r) => { masque = false; if (cache) process.stdout.write("\n"); ok(r.trim()); };
    file.length ? repondre(file.shift()) : attente.push(repondre);
  });
}

const courriel = ((await question("Courriel admin [alexis@agencejutras.com] : ")) || "alexis@agencejutras.com").toLowerCase();
const motDePasse = await question("Mot de passe (10 caractères ou plus, ne s'affiche pas) : ", true);
const encore = await question("Encore une fois : ", true);
rl.close();
if (motDePasse.length < 10) { console.error("\nTrop court : 10 caractères ou plus."); process.exit(1); }
if (motDePasse !== encore) { console.error("\nLes deux mots de passe ne sont pas pareils."); process.exit(1); }

const sel = randomBytes(16);
const hache = `scrypt$${sel.toString("base64")}$${scryptSync(motDePasse, sel, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`;
const entetes = { apikey: CLE, Authorization: `Bearer ${CLE}`, "Content-Type": "application/json", Prefer: "return=representation" };

const existant = await (await fetch(`${URL_BASE}/rest/v1/membres?courriel=eq.${encodeURIComponent(courriel)}&select=id`, { headers: entetes })).json();
let rep;
if (existant.length) {
  rep = await fetch(`${URL_BASE}/rest/v1/membres?id=eq.${existant[0].id}`, {
    method: "PATCH", headers: entetes, body: JSON.stringify({ mot_de_passe: hache, role: "admin", confirme: true }),
  });
} else {
  rep = await fetch(`${URL_BASE}/rest/v1/membres`, {
    method: "POST", headers: entetes,
    body: JSON.stringify({ prenom: "Alexis", nom: "Jutras", cellulaire: "581-349-1258", courriel, slug: "alexis-j",
      mot_de_passe: hache, role: "admin", confirme: true, accepte_regles: new Date().toISOString(), prenom_visible: true }),
  });
}
if (!rep.ok) { console.error(`\nLa base a refusé (${rep.status}) : ${await rep.text()}`); process.exit(1); }
await fetch(`${URL_BASE}/rest/v1/tentatives?courriel=eq.${encodeURIComponent(courriel)}`, { method: "DELETE", headers: entetes });
console.log(`\n✓ Compte admin ${existant.length ? "mis à jour" : "créé"} pour ${courriel}. Connectez-vous à /connexion.`);
console.log("  Rappel : ADMIN_COURRIELS doit contenir ce courriel, sur Vercel comme dans .env.local.");
