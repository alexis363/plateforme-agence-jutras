// Lance l'espace compte sur l'ordinateur, sans aucun service en ligne : les données vivent dans .donnees/
// (ignoré par Git) et les courriels s'affichent dans la boîte locale, à /dev/courriels.
// Avant la première fois : node scripts/demo-local.mjs
import { spawn } from "node:child_process";

spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3100"], {
  env: { ...process.env, SUPABASE_URL: "", SUPABASE_SECRET_KEY: "", RESEND_API_KEY: "", COMPTE_LOCAL: "oui" },
  stdio: "inherit",
});
