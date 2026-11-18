// Envoi des courriels. Sur l'ordinateur : la boîte locale (/dev/courriels). En ligne : Resend.
import { estLocal, garderCourrielLocal } from "./depot.ts";

export async function envoyerCourriel(c: { a: string; sujet: string; texte: string; lien?: string }): Promise<void> {
  if (estLocal()) {
    await garderCourrielLocal({ a: c.a, sujet: c.sujet, texte: c.texte, lien: c.lien ?? null });
    return;
  }
  const cle = process.env.RESEND_API_KEY;
  if (!cle) throw new Error("RESEND_API_KEY manquant");
  const texte = c.lien ? `${c.texte}\n\n${c.lien}\n\nAgence Jutras — Moins de paperasse, plus de temps en famille.` : c.texte;
  const rep = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.COURRIEL_EXPEDITEUR ?? "Agence Jutras <compte@agencejutras.com>", to: c.a, subject: c.sujet, text: texte }),
  });
  if (!rep.ok) throw new Error(`Envoi refusé par Resend (${rep.status})`);
}

// L'adresse de l'application (liens dans les courriels) et l'adresse publique des liens de référence.
export function adresseApp(): string {
  return process.env.APP_URL ?? "http://localhost:3100";
}

export function lienReference(slug: string): { url: string; affiche: string } {
  const site = process.env.SITE_URL; // en ligne : https://www.agencejutras.com
  const url = `${site ?? adresseApp()}/r/${slug}`;
  return { url, affiche: url.replace(/^https?:\/\/(www\.)?/, "") };
}
