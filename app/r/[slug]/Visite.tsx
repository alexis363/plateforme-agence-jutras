"use client";
import { useEffect } from "react";

// Compte une visite par session de navigation (pas à chaque rechargement), et pas les robots d'aperçu de lien.
export default function Visite({ slug }: { slug: string }) {
  useEffect(() => {
    const cle = `vu-${slug}`;
    try {
      if (sessionStorage.getItem(cle)) return;
      sessionStorage.setItem(cle, "1");
    } catch { /* navigation privée : on compte quand même */ }
    fetch(`/api/r/${encodeURIComponent(slug)}/visite`, { method: "POST" }).catch(() => undefined);
  }, [slug]);
  return null;
}
