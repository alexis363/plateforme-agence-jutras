import type { NextConfig } from "next";

// En-têtes de sécurité, repris de Kairos : le navigateur n'exécute que le code de l'application,
// refuse d'afficher l'application dans le cadre d'un autre site et ne donne pas l'adresse des pages aux autres sites.
// Les polices viennent de Google Fonts, comme sur le site de l'Agence Jutras.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://images.unsplash.com", // photos des métiers de « Qui référer ? »
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const entetes = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "microphone=(), camera=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // En développement, le rechargement à chaud a besoin d'« eval » : la politique ne s'applique qu'en ligne.
    const politique = process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: CSP }] : [];
    return [
      { source: "/(.*)", headers: [...entetes, ...politique] },
      { source: "/api/(.*)", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
