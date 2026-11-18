import { NextResponse } from "next/server";
import { fermerSession } from "@/lib/session.ts";
import { adresseApp } from "@/lib/courriel.ts";

export async function POST() {
  await fermerSession();
  return NextResponse.redirect(`${adresseApp()}/connexion`, 303);
}
