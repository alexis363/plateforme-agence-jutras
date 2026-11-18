// Lance l'application sur l'ordinateur, branchée sur la VRAIE base Supabase (clés dans .env.local).
// Les courriels restent dans la boîte locale (/dev/courriels) tant que SENDGRID_API_KEY est vide.
import { spawn } from "node:child_process";

spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3100"], {
  env: { ...process.env, COMPTE_LOCAL: "" },
  stdio: "inherit",
});
