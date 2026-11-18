import { redirect } from "next/navigation";
import { membreConnecte } from "@/lib/session.ts";

export default async function Accueil() {
  const m = await membreConnecte();
  redirect(!m ? "/connexion" : m.role === "admin" ? "/admin" : "/compte");
}
