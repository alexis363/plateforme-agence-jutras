// Mots de passe : hachés avec scrypt et un sel propre à chaque membre. Le mot de passe lui-même n'est jamais gardé.
// Le blocage après 5 essais ratés est dans lib/depot.ts (estBloque, noterEchec, effacerEchecs) : il vit dans la base.
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

export const LONGUEUR_MIN = 10;

function deriver(motDePasse: string, sel: Buffer): Promise<Buffer> {
  return new Promise((ok, ko) => scrypt(motDePasse, sel, 64, { N: 16384, r: 8, p: 1 }, (e, cle) => (e ? ko(e) : ok(cle))));
}

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  return `scrypt$${sel.toString("base64")}$${(await deriver(motDePasse, sel)).toString("base64")}`;
}

export async function verifierMotDePasse(motDePasse: string, garde: string | null): Promise<boolean> {
  // Sans mot de passe gardé, on calcule quand même : la réponse prend le même temps qu'un compte existe ou non.
  const [, sel, attendu] = (garde ?? `scrypt$${randomBytes(16).toString("base64")}$${randomBytes(64).toString("base64")}`).split("$");
  const calcule = await deriver(motDePasse, Buffer.from(sel, "base64"));
  const a = Buffer.from(attendu, "base64");
  return garde !== null && a.length === calcule.length && timingSafeEqual(a, calcule);
}
