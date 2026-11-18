import { membrePublic, ajouterVisite } from "@/lib/depot.ts";

// Une visite de la page du lien. Le témoin « aj_ref » garde la référence 90 jours dans le navigateur du visiteur.
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await membrePublic(slug);
  if (!m) return new Response(null, { status: 204 });
  await ajouterVisite(m.id);
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": `aj_ref=${encodeURIComponent(slug)}; Path=/; Max-Age=${90 * 86400}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}` },
  });
}
