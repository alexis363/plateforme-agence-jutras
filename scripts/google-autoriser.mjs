// Donne à la plateforme l'accès à l'agenda Google d'Alexis, une seule fois.
//
//   npm run google
//
// Prérequis dans .env.local : GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET (client OAuth « Application de bureau »).
// Le script ouvre la page d'accord de Google, reçoit la réponse sur l'ordinateur, puis écrit GOOGLE_REFRESH_TOKEN
// dans .env.local. Aucune clé ne s'affiche. Accès demandés : voir les heures occupées, créer des rendez-vous.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { exec } from "node:child_process";

process.loadEnvFile(".env.local");
const ID = process.env.GOOGLE_CLIENT_ID, SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!ID || !SECRET) { console.error("GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manque dans .env.local."); process.exit(1); }

const PORT = 3101;
const RETOUR = `http://127.0.0.1:${PORT}/rappel`;
const ACCES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.freebusy"];
const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: ID, redirect_uri: RETOUR, response_type: "code", scope: ACCES.join(" "),
  access_type: "offline", prompt: "consent", login_hint: "alexis@agencejutras.com",
});

function ecrireEnv(cle, valeur) {
  let t = readFileSync(".env.local", "utf8");
  t = new RegExp(`^${cle}=.*$`, "m").test(t) ? t.replace(new RegExp(`^${cle}=.*$`, "m"), `${cle}=${valeur}`) : `${t.trimEnd()}\n${cle}=${valeur}\n`;
  writeFileSync(".env.local", t);
}

const serveur = createServer(async (req, res) => {
  const q = new URL(req.url, RETOUR);
  if (q.pathname !== "/rappel") { res.writeHead(404).end(); return; }
  const code = q.searchParams.get("code");
  if (!code) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Accès refusé. Vous pouvez fermer cet onglet.");
    console.error("Google n'a pas donné l'accès :", q.searchParams.get("error"));
    serveur.close(); return;
  }
  const rep = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: ID, client_secret: SECRET, redirect_uri: RETOUR, grant_type: "authorization_code" }),
  });
  const d = await rep.json();
  if (!d.refresh_token) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Google n'a pas renvoyé de jeton. Réessayez.");
    console.error(`Pas de jeton de Google : ${d.error ?? rep.status}${d.error_description ? ` (${d.error_description})` : ""}`);
    if (d.error === "internal_failure") console.error("Souvent passager quand le client OAuth vient d'être créé : attendez 5 minutes, puis relancez npm run google.");
    serveur.close(); return;
  }
  ecrireEnv("GOOGLE_REFRESH_TOKEN", d.refresh_token);
  // Vérification : lire les heures occupées de la semaine.
  const essai = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST", headers: { Authorization: `Bearer ${d.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 7 * 86400e3).toISOString(), items: [{ id: "primary" }] }),
  });
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end("<p style='font-family:sans-serif'>✓ C'est fait. Vous pouvez fermer cet onglet et revenir à la plateforme.</p>");
  console.log(`\n✓ Accès à l'agenda enregistré dans .env.local (GOOGLE_REFRESH_TOKEN).`);
  console.log(essai.ok ? "✓ Lecture de l'agenda : ça marche." : `⚠ Lecture de l'agenda refusée (${essai.status}).`);
  console.log("  Copiez GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_REFRESH_TOKEN dans Vercel, puis Redeploy.");
  serveur.close();
});

serveur.listen(PORT, "127.0.0.1", () => {
  console.log("La page d'accord de Google s'ouvre dans votre navigateur. Si rien ne s'ouvre, copiez cette adresse :\n");
  console.log(url + "\n");
  exec(`start "" "${url}"`);
});
