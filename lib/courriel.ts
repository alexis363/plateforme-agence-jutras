// Envoi des courriels. Sur l'ordinateur sans SendGrid : la boîte locale (/dev/courriels). Sinon : SendGrid,
// le compte de l'Agence Jutras déjà utilisé pour Kairos (choix d'Alexis du 17 nov. 2026), avec une clé « Mail Send » à part.
import { boiteLocale, garderCourrielLocal } from "./depot.ts";

const SIGNATURE = "Agence Jutras — Moins de paperasse, plus de temps en famille.";

// « Agence Jutras <alexis@agencejutras.com> » → nom et adresse séparés, comme SendGrid les demande.
function expediteur(): { name: string; email: string } {
  const brut = process.env.COURRIEL_EXPEDITEUR ?? "Agence Jutras <alexis@agencejutras.com>";
  const m = brut.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1], email: m[2] } : { name: "Agence Jutras", email: brut.trim() };
}

export async function envoyerCourriel(c: { a: string; sujet: string; texte: string; lien?: string }): Promise<void> {
  if (boiteLocale()) {
    await garderCourrielLocal({ a: c.a, sujet: c.sujet, texte: c.texte, lien: c.lien ?? null });
    return;
  }
  const cle = process.env.SENDGRID_API_KEY;
  if (!cle) throw new Error("SENDGRID_API_KEY manquant");
  const de = expediteur();
  const rep = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: c.a }] }],
      from: de,
      reply_to: de,
      subject: c.sujet,
      content: [{ type: "text/plain", value: c.lien ? `${c.texte}\n\n${c.lien}\n\n${SIGNATURE}` : `${c.texte}\n\n${SIGNATURE}` }],
      // Pas de suivi des clics : le lien de confirmation doit rester tel quel, sans détour par SendGrid.
      tracking_settings: { click_tracking: { enable: false, enable_text: false }, open_tracking: { enable: false } },
    }),
  });
  if (!rep.ok) throw new Error(`Envoi refusé par SendGrid (${rep.status})`);
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
