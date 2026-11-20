import { redirect } from "next/navigation";

// Les règles vivent maintenant dans « Comment ça fonctionne » (Alexis, 20 nov. 2026) : l'ancienne adresse y mène.
export default function ReglesMembre() {
  redirect("/compte/comment-ca-fonctionne#regles");
}
