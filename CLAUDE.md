# Instructions pour Claude — Espace compte

@README.md

## L'essentiel

- **Parler à Alexis en français.** Interface et code en français québécois. **On tutoie les ambassadeurs** dans leur espace (`app/compte/`, `app/Regles.tsx`) ; le reste (inscription, courriels, page d'un lien, console) vouvoie (Alexis, 20 nov. 2026).
- **Toute donnée passe par `lib/depot.ts`.** Le membre vient de la session, jamais de la requête.
- **Toute nouvelle page ou route de membre a son cas dans `scripts/test-isolation.mjs`**, et le test passe avant de dire que c'est fait.
- **Aucun prix de l'Agence Jutras ni gain chiffré** sur les pages publiques.
- **Clés : seulement dans `.env.local`.** Jamais dans le code, un commit ou le chat.
- **Commit et push seulement quand Alexis le demande.**
