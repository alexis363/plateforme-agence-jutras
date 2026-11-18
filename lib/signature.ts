// Le témoin de session : « <contenu>.<signature> », signé avec SESSION_SECRET.
// Fichier sans dépendance à Next, pour que le test d'isolation puisse fabriquer des sessions.
import { createHmac, timingSafeEqual } from "node:crypto";

export const TEMOIN = "aj_session";
export const DUREE_SESSION_JOURS = 30;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.COMPTE_LOCAL === "oui" && !process.env.VERCEL) return "secret-local-pour-l-ordinateur-seulement-0000";
  throw new Error("SESSION_SECRET manquant (32 caractères ou plus)");
}

const signer = (contenu: string) => createHmac("sha256", secret()).update(contenu).digest("base64url");

export function fabriquerSession(membreId: string): string {
  const exp = Date.now() + DUREE_SESSION_JOURS * 86400e3;
  const contenu = Buffer.from(JSON.stringify({ m: membreId, exp })).toString("base64url");
  return `${contenu}.${signer(contenu)}`;
}

export function lireSession(valeur: string | undefined): string | null {
  if (!valeur) return null;
  const [contenu, sig] = valeur.split(".");
  if (!contenu || !sig) return null;
  const attendu = Buffer.from(signer(contenu));
  const recu = Buffer.from(sig);
  if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) return null;
  try {
    const { m, exp } = JSON.parse(Buffer.from(contenu, "base64url").toString());
    return typeof m === "string" && exp > Date.now() ? m : null;
  } catch {
    return null;
  }
}
