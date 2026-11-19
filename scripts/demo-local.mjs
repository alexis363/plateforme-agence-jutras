// Prépare des données de démonstration FICTIVES dans .donnees/base.json (ordinateur seulement).
// Alexis (admin) et une membre, « Sophie Gagnon », avec 4 références à différentes étapes.
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID, randomBytes, scryptSync } from "node:crypto";

// Même format que lib/motdepasse.ts. Mot de passe de démonstration pour tous : « demonstration ».
const MOT_DE_PASSE = "demonstration";
const hacher = () => { const sel = randomBytes(16); return `scrypt$${sel.toString("base64")}$${scryptSync(MOT_DE_PASSE, sel, 64, { N: 16384, r: 8, p: 1 }).toString("base64")}`; };

const jours = (n) => new Date(Date.now() - n * 86400e3).toISOString();
const alexis = { id: randomUUID(), prenom: "Alexis", nom: "Jutras", cellulaire: "581-349-1258", courriel: "alexis@agencejutras.com", slug: "alexis-j", motDePasse: hacher(), role: "admin", confirme: true, accepteRegles: jours(30), prenomVisible: true, creeLe: jours(30) };
const sophie = { id: randomUUID(), prenom: "Sophie", nom: "Gagnon", cellulaire: "418-555-0177", courriel: "sophie@exemple.ca", slug: "sophie-g", motDePasse: hacher(), role: "membre", confirme: true, accepteRegles: jours(40), prenomVisible: true, creeLe: jours(40) };
const luc = { id: randomUUID(), prenom: "Luc", nom: "Bérubé", cellulaire: "418-555-0190", courriel: "luc@exemple.ca", slug: "luc-b", motDePasse: hacher(), role: "membre", confirme: true, accepteRegles: jours(3), prenomVisible: true, creeLe: jours(3) };

const ETAPES = ["Demande de rendez-vous", "Rendez-vous découverte", "Rendez-vous d'installation", "Essai gratuit", "Client", "Ambassadeur payé"];
const ref = (entreprise, contact, metier, cellulaire, il, etape, moment) => ({
  id: randomUUID(), membreId: sophie.id, entreprise, contact, metier, cellulaire, courriel: "", casseTete: "Les soumissions le soir.",
  moment, creeLe: jours(il), etape, fermee: null, notes: "",
  historique: ETAPES.slice(0, etape).map((quoi, i) => ({ le: jours(il - i * 4), quoi: i === 0 ? "Demande reçue par le lien" : quoi })),
});

const references = [
  ref("Émondage Lavoie", "Kevin Lavoie", "Émondage", "418-555-0101", 57, 6, "mardi, avant-midi"),
  ref("Paysagement Roy", "Martin Roy", "Paysagement", "418-555-0102", 36, 5, "jeudi, fin de journée"),
  ref("Excavation Pelletier", "Marie Pelletier", "Excavation", "418-555-0103", 15, 2, "lundi, midi"),
  ref("Lavage Vitres Nadeau", "Samuel Nadeau", "Lavage de vitres", "418-555-0104", 2, 1, "mercredi, soirée"),
];
const visites = [1, 3, 2, 5, 4, 2, 6, 4].flatMap((n, s) => Array.from({ length: n }, (_, k) => ({ membreId: sophie.id, le: jours((7 - s) * 7 + k) })));

mkdirSync(".donnees", { recursive: true });
writeFileSync(".donnees/base.json", JSON.stringify({ membres: [alexis, sophie, luc], references, visites, jetons: [], courriels: [] }, null, 2));
console.log("Données de démonstration prêtes : Alexis (console), Sophie et Luc (membres).");
console.log(`Connexion : http://localhost:3100/connexion, mot de passe « ${MOT_DE_PASSE} » pour les trois comptes.`);
