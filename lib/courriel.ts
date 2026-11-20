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

// Les courriels du programme ambassadeur portent l'en-tête Kairos (Alexis, 20 nov. 2026) : une version HTML
// s'ajoute au texte brut. Les polices ne se chargent pas dans les courriels : Georgia italique remplace Playfair.
const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function courrielKairosHtml(texte: string, lien?: string, bouton = "Ouvrir le lien"): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:24px 12px;background:#F5F0EB;font-family:Arial,Helvetica,sans-serif;color:#2C2824">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FDFBF9;border:1px solid #DDD5CB;border-radius:16px;overflow:hidden">
<tr><td style="background:#242919;background-image:linear-gradient(135deg,#1B1E14 0%,#242919 45%,#3B4626 80%,#5B6B3A 100%);padding:26px 30px">
<div style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#A3B07A">AGENCE JUTRAS</div>
<div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:bold;font-size:34px;line-height:1.1;color:#F1F3EA;margin-top:2px">KAIROS</div>
<div style="width:120px;height:2px;background:#A3B07A;margin:6px 0 4px"></div>
<div style="font-size:10px;letter-spacing:4px;color:#A3B07A">SOUMISSION</div>
<div style="font-size:12px;color:#A3B07A;margin-top:12px">Programme ambassadeur</div>
</td></tr>
<tr><td style="padding:26px 30px;font-size:15px;line-height:1.6">${echapper(texte)}${lien ? `
<p style="margin:22px 0 4px"><a href="${echapper(lien)}" style="display:inline-block;background:#C4956A;color:#1A1612;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:1px;padding:13px 22px;border-radius:999px">${echapper(bouton)}</a></p>
<p style="margin:10px 0 0;font-size:12px;color:#7A7068;word-break:break-all">${echapper(lien)}</p>` : ""}</td></tr>
<tr><td style="border-top:1px solid #DDD5CB;padding:14px 30px;font-size:12px;color:#7A7068">${echapper(SIGNATURE)}</td></tr>
</table></body></html>`;
}

export async function envoyerCourriel(c: { a: string; sujet: string; texte: string; lien?: string; kairos?: boolean; bouton?: string }): Promise<void> {
  if (boiteLocale()) {
    await garderCourrielLocal({ a: c.a, sujet: c.sujet, texte: c.texte, lien: c.lien ?? null, kairos: c.kairos });
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
      content: [
        { type: "text/plain", value: c.lien ? `${c.texte}\n\n${c.lien}\n\n${SIGNATURE}` : `${c.texte}\n\n${SIGNATURE}` },
        ...(c.kairos ? [{ type: "text/html", value: courrielKairosHtml(c.texte, c.lien, c.bouton) }] : []),
      ],
      // Pas de suivi des clics : le lien de confirmation doit rester tel quel, sans détour par SendGrid.
      tracking_settings: { click_tracking: { enable: false, enable_text: false }, open_tracking: { enable: false } },
    }),
  });
  if (!rep.ok) throw new Error(`Envoi refusé par SendGrid (${rep.status})`);
}

// L'adresse de l'application (liens dans les courriels) et l'adresse publique des liens de référence.
// Jamais tirée de la requête : un en-tête « Host » trafiqué ferait partir un lien de connexion vers un autre site.
// Ordre : APP_URL ; sinon, sur Vercel, l'adresse de production du projet ; sinon l'ordinateur.
export function adresseApp(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL) throw new Error("APP_URL manquant : impossible de faire un lien vers la plateforme");
  return "http://localhost:3100";
}

export function lienReference(slug: string): { url: string; affiche: string } {
  const site = process.env.SITE_URL; // en ligne : https://www.agencejutras.com
  const url = `${site ?? adresseApp()}/r/${slug}`;
  return { url, affiche: url.replace(/^https?:\/\/(www\.)?/, "") };
}
