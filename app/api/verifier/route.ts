import { NextResponse } from "next/server";
import { consommerJeton } from "@/lib/depot.ts";
import { ouvrirSession, estCourrielAdmin } from "@/lib/session.ts";
import { adresseApp } from "@/lib/courriel.ts";

// Le lien de confirmation reçu après l'inscription : il active le compte et ouvre la session.
export async function GET(req: Request) {
  const jeton = new URL(req.url).searchParams.get("jeton") ?? "";
  const m = jeton ? await consommerJeton(jeton, "confirmer") : null;
  if (!m) return NextResponse.redirect(`${adresseApp()}/connexion?lien=expire`);
  await ouvrirSession(m);
  return NextResponse.redirect(`${adresseApp()}${estCourrielAdmin(m.courriel) ? "/admin" : "/compte"}`);
}
