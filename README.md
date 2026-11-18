# Espace compte — Agence Jutras

Le programme de référence et la console d'Alexis : un membre s'inscrit, confirme son courriel, obtient son lien
`agencejutras.com/r/<prénom>`, partage la page d'arrivée de Kairos, et suit ses références. Alexis fait avancer chaque
référence dans la console. Bâti à partir des maquettes « Espace utilisateur » et « Console admin » (17 nov. 2026).

> **Statut au 17 novembre 2026 : fonctionne sur l'ordinateur seulement**, avec un fichier de données local.
> Avant la mise en ligne : brancher Supabase (base au Canada, séparée de Kairos) et Resend, voir « Ce qui manque ».

## Démarrer sur l'ordinateur

```bash
npm install
```

```bash
npm run demo
```

```bash
npm run local
```

Puis `http://localhost:3100/connexion`, avec `sophie@exemple.ca` (membre) ou `alexis@agencejutras.com` (console),
mot de passe `demonstration`. Les courriels (confirmation, mot de passe oublié) arrivent dans la boîte locale,
`http://localhost:3100/dev/courriels`. La page d'arrivée d'un lien : `http://localhost:3100/r/sophie-g`.

## Prouver l'isolation

Avec l'application en marche :

```bash
npm run test:isolation
```

Vérifie, par les vraies routes : les mots de passe (mauvais refusé, compte non confirmé fermé, blocage après 5 essais,
réinscription qui ne change rien, lien « mot de passe oublié » à usage unique, hachage jamais affiché) ; un membre ne voit
pas les références d'un autre ; la console et ses API sont fermées aux membres ; un témoin falsifié ou absent renvoie à
la connexion ; un lien non confirmé n'existe pas ; se référer soi-même ne compte pas ; le premier qui réfère gagne.

## Les règles du programme

Dans `lib/regles.ts` : 100 $, Kairos seulement, 6 mois, les 6 étapes, les places limitées par mois. Elles viennent de
`2 - Ventes/Programme de référence.md` dans le coffre : changer l'un, c'est changer l'autre.

## Architecture

| Fichier | Rôle |
|---|---|
| `lib/depot.ts` | **Seul accès aux données.** Une fonction qu'un membre déclenche reçoit le membre de la session, jamais un identifiant du navigateur |
| `lib/session.ts`, `lib/signature.ts` | Témoin de session signé (HMAC), rôle admin selon `ADMIN_COURRIELS` |
| `lib/courriel.ts` | Boîte locale sur l'ordinateur, Resend en ligne |
| `app/compte/` | Espace du membre : lien, statistiques, références, règles, services, profil |
| `app/r/[slug]/` | Page d'arrivée d'un lien, avec la demande de rendez-vous |
| `app/admin/` | Console : Aujourd'hui, Références, Membres. Clients, Suivis, Avis, Factures et Soutien viennent au bloc 2 |

Connexion par **courriel et mot de passe**, pour les membres comme pour la console (décision d'Alexis du 17 nov. 2026).
Mots de passe hachés avec scrypt (`lib/motdepasse.ts`), 10 caractères minimum, blocage de 15 min après 5 essais ratés.
Le courriel est confirmé une fois, par un lien valide 48 h ; « Mot de passe oublié » envoie un lien valide 30 min, à usage unique.

## Ce qui manque avant la mise en ligne

1. **Le moteur Supabase** de `lib/depot.ts` (le moteur actuel est un fichier local ; en ligne, l'application refuse de démarrer sans base).
2. **Resend** branché sur agencejutras.com (`RESEND_API_KEY`, `COURRIEL_EXPEDITEUR`).
3. **Variables** : `SESSION_SECRET` (32 caractères ou plus), `ADMIN_COURRIELS`, `APP_URL`, `SITE_URL`.
4. **Les adresses** : `compte.agencejutras.com` pour l'application ; une redirection `agencejutras.com/r/*` vers l'application.
5. **La Loi 25** : la politique de confidentialité du site doit parler du programme (noms, cellulaires, courriels Interac, témoin `aj_ref` de 90 jours).
6. **La prise de rendez-vous** : la page demande un moment préféré ; Alexis rappelle. Pas encore relié à son agenda.
7. **Le blocage après 5 essais** vit dans la mémoire du serveur : en ligne (plusieurs serveurs), le garder dans la base.
   Changer de mot de passe ne ferme pas encore les autres sessions ouvertes.

## Règles du projet

- Interface et code en français québécois, vouvoiement.
- **Aucun prix de l'Agence Jutras, aucun gain chiffré, aucun témoignage** sur les pages publiques. La récompense de 100 $ n'est pas un prix.
- Données de démonstration **fictives** (`scripts/demo-local.mjs`). Aucune donnée réelle dans `.donnees/` ni dans Git.
- Clés : seulement dans `.env.local`. Commit et push seulement quand Alexis le demande.
