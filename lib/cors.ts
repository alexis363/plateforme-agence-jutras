// Le formulaire de réservation du site web (www.agencejutras.com) appelle la plateforme depuis une autre adresse.
// Seules ces adresses ont le droit de le faire ; SITE_ORIGINES en ajoute d'autres (séparées par des virgules),
// par exemple l'adresse d'essai du site sur Vercel ou http://localhost:8080 sur l'ordinateur.
const PERMISES = ["https://www.agencejutras.com", "https://agencejutras.com"];

function permise(origine: string | null): string | null {
  if (!origine) return null;
  const extra = (process.env.SITE_ORIGINES ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return [...PERMISES, ...extra].includes(origine) ? origine : null;
}

export function entetesCors(req: Request): Record<string, string> {
  const o = permise(req.headers.get("origin"));
  return o
    ? { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", Vary: "Origin" }
    : { Vary: "Origin" };
}

export function reponse(req: Request, corps: unknown, status = 200): Response {
  return Response.json(corps, { status, headers: entetesCors(req) });
}

export function preflight(req: Request): Response {
  return new Response(null, { status: 204, headers: entetesCors(req) });
}
