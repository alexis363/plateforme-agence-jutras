// Amorçage du compte admin, à la demande d'Alexis (17 nov. 2026) : son courriel est dans ADMIN_COURRIELS et son
// mot de passe dans ADMIN_MOT_DE_PASSE (réglages Vercel et .env.local). À sa PREMIÈRE connexion, si aucun compte
// n'existe encore pour ce courriel, le compte admin est créé, déjà confirmé, avec ce mot de passe (gardé haché).
// Ensuite, la base fait foi : changer ADMIN_MOT_DE_PASSE ne change plus rien, et on peut le retirer des réglages.
import { createHash, timingSafeEqual } from "node:crypto";
import { creerMembre, confirmerMembre } from "./depot.ts";
import { hacherMotDePasse } from "./motdepasse.ts";
import { estCourrielAdmin } from "./session.ts";
import type { Membre } from "./types.ts";

const empreinte = (s: string) => createHash("sha256").update(s).digest();

export async function amorcerAdmin(courriel: string, motDePasse: string): Promise<Membre | null> {
  const attendu = process.env.ADMIN_MOT_DE_PASSE;
  if (!attendu || attendu.length < 10 || !estCourrielAdmin(courriel)) return null;
  if (!timingSafeEqual(empreinte(motDePasse), empreinte(attendu))) return null;
  const m = await creerMembre(
    { prenom: "Alexis", nom: "Jutras", cellulaire: "581-349-1258", courriel, prenomVisible: true, motDePasse: await hacherMotDePasse(motDePasse) },
    "admin",
  );
  return confirmerMembre(m.id);
}
