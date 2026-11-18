// Qui est connecté. Le membre vient toujours du témoin signé, jamais de la requête.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEMOIN, DUREE_SESSION_JOURS, fabriquerSession, lireSession } from "./signature.ts";
import { membreParId, poserRole } from "./depot.ts";
import type { Membre } from "./types.ts";

// Les adresses d'Alexis : ADMIN_COURRIELS="alexis@agencejutras.com,…". Le rôle se recalcule à chaque connexion.
export function estCourrielAdmin(courriel: string): boolean {
  const liste = (process.env.ADMIN_COURRIELS ?? (process.env.COMPTE_LOCAL === "oui" ? "alexis@agencejutras.com" : ""))
    .split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
  return liste.includes(courriel.toLowerCase());
}

export async function ouvrirSession(m: Membre): Promise<void> {
  const role = estCourrielAdmin(m.courriel) ? "admin" : "membre";
  if (role !== m.role) await poserRole(m.id, role);
  (await cookies()).set(TEMOIN, fabriquerSession(m.id), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: DUREE_SESSION_JOURS * 86400,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function fermerSession(): Promise<void> {
  (await cookies()).delete(TEMOIN);
}

export async function membreConnecte(): Promise<Membre | null> {
  const id = lireSession((await cookies()).get(TEMOIN)?.value);
  if (!id) return null;
  const m = await membreParId(id);
  return m?.confirme ? m : null;
}

export async function exigerMembre(): Promise<Membre> {
  const m = await membreConnecte();
  if (!m) redirect("/connexion");
  return m;
}

export async function exigerAdmin(): Promise<Membre> {
  const m = await exigerMembre();
  if (m.role !== "admin") redirect("/compte");
  return m;
}
