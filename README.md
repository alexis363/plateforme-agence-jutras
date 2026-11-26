# Espace compte — Agence Jutras

Le programme de référence et la console d'Alexis : un membre s'inscrit, confirme son courriel, obtient son lien
`agencejutras.com/r/<prénom>`, partage la page d'arrivée de Kairos, et suit ses références. Alexis fait avancer chaque
référence dans la console. Bâti à partir des maquettes « Espace utilisateur » et « Console admin » (17 nov. 2026).

> **Statut au 17 novembre 2026 : fonctionne sur l'ordinateur seulement**, avec un fichier de données local.
> Supabase branché ; courriels par SendGrid (compte de l'Agence Jutras). Voir « Ce qui manque ».

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

## Brancher la vraie base (Supabase)

1. Dans Supabase, projet de la plateforme (jamais celui de Kairos) : **SQL Editor** → coller tout `supabase/installation.sql` → **Run**.
2. **Project Settings → API** : copier l'adresse du projet dans `SUPABASE_URL` et la **clé secrète** dans `SUPABASE_SECRET_KEY`, dans `.env.local`.
3. `npm run supabase` : l'application tourne sur `http://localhost:3100` avec la vraie base ; les courriels restent dans la boîte locale tant que `SENDGRID_API_KEY` est vide.
4. `npm run test:isolation -- --supabase` : le même test, sur la vraie base. Il crée des membres « …@test.local ».

## Les rendez-vous (agenda Google d'Alexis)

Sur la page d'un lien, l'entrepreneur remplit **un seul formulaire** : ses coordonnées et une plage de 15 minutes
(décision d'Alexis du 18 nov. 2026). `lib/agenda.ts` calcule les plages à partir de ses disponibilités (heure de
Québec, préavis de 12 h, cette semaine et les 3 suivantes jusqu'au dimanche), retire ce qui est occupé dans tous les agendas de son compte Google et ce que la plateforme a déjà
réservé, puis crée l'événement dans l'agenda (Google envoie l'invitation). La référence garde `rendez_vous` et
`evenement_id` ; le membre voit « Rencontre le … », la console aussi.

- **Changer la durée, le temps entre les rendez-vous et les disponibilités** : console → **Réglages** (table `reglages`,
  demande d'Alexis du 18 nov. 2026). Sans réglages enregistrés, `REGLAGES_DEFAUT` dans `lib/agenda.ts` s'applique.
- **Brancher l'agenda** : `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env.local`, puis `npm run google`
  (une fois) ; copier les trois `GOOGLE_*` dans Vercel. Sans eux, l'agenda est simulé : rien n'est bloqué ni créé.
- **Base existante** : exécuter `supabase/migration-2026-11-18-rendez-vous.sql`, `supabase/migration-2026-11-18-rdv-site.sql`,
  `supabase/migration-2026-11-18-reglages.sql`, puis `supabase/migration-2026-11-19-prospects.sql`, une fois chacun.

### Le formulaire du site web

La section contact de www.agencejutras.com a le même formulaire, sans ambassadeur (demande d'Alexis du 18 nov. 2026).
Il appelle `GET /api/rdv/plages` et `POST /api/rdv` ; depuis le 19 nov. 2026 la demande devient un **prospect** dans
`refs` (sans ambassadeur, `source = 'site'`), suivi dans « Mes prospects » comme ceux des liens ; l'adresse de la plateforme est dans
l'attribut `data-api` du bloc `#rdv` de `index.html`. Seuls `https://www.agencejutras.com` et `https://agencejutras.com`
peuvent l'appeler (`lib/cors.ts`) ; `SITE_ORIGINES` en ajoute d'autres pour un essai. Un champ piège invisible arrête
les robots simples.

## Le compte admin

Deux façons, au choix :

- **Par les réglages** (choix d'Alexis, 17 nov. 2026) : `ADMIN_COURRIELS` et `ADMIN_MOT_DE_PASSE` dans Vercel (et
  `.env.local`). À la première connexion avec ce courriel et ce mot de passe, le compte admin se crée, déjà confirmé
  (`lib/amorce.ts`). Ensuite la base fait foi : on peut retirer `ADMIN_MOT_DE_PASSE` des réglages.
- **Par un script** : `npm run creer-admin` crée ou remet à neuf le compte dans la vraie base ; le mot de passe se tape
  dans le terminal.

## Supprimer un compte

Demande d'Alexis du 18 nov. 2026 : le membre (Profil → Supprimer mon compte) et la console (Membres → Supprimer) peuvent
supprimer un compte, toujours en **trois confirmations** (`app/ConfirmerSuppression.tsx`) : cocher « Je comprends », écrire
un mot à la main (SUPPRIMER pour le membre, son courriel au complet pour la console), puis le dernier bouton (avec le mot
de passe pour le membre). Les routes revérifient le mot et le mot de passe. Un compte admin ne se supprime jamais. Le
membre part avec ses références, ses visites et ses liens (`supprimerMembre` dans `lib/depot.ts`) ; les rendez-vous déjà
créés restent dans l'agenda Google.

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

Affichées avec le fonctionnement en 3 étapes dans « Comment ça fonctionne » (`/compte/comment-ca-fonctionne` ; `/compte/regles` y renvoie, 20 nov. 2026). Dans `lib/regles.ts` : 100 $, Kairos seulement, 6 mois, les 6 étapes, les places limitées par mois. Elles viennent de
`2 - Ventes/Programme de référence.md` dans le coffre : changer l'un, c'est changer l'autre.

## Architecture

| Fichier | Rôle |
|---|---|
| `lib/depot.ts` | **Seul accès aux données.** Une fonction qu'un membre déclenche reçoit le membre de la session, jamais un identifiant du navigateur |
| `lib/session.ts`, `lib/signature.ts` | Témoin de session signé (HMAC), rôle admin selon `ADMIN_COURRIELS` |
| `lib/courriel.ts` | Boîte locale sur l'ordinateur, SendGrid en ligne (sans suivi des clics) |
| `app/compte/` | Espace du membre : lien, statistiques, références, règles, services, profil |
| `app/r/[slug]/` | Page d'arrivée d'un lien, avec la demande de rendez-vous |
| `app/admin/` | Console : Aujourd'hui, Mes prospects (pipeline à fiches qu'on glisse), Ambassadeurs, Réglages (agenda). Clients, Suivis, Avis, Factures et Soutien viennent au bloc 2 |

Connexion par **courriel et mot de passe**, pour les membres comme pour la console (décision d'Alexis du 17 nov. 2026).
Mots de passe hachés avec scrypt (`lib/motdepasse.ts`), 10 caractères minimum, blocage de 15 min après 5 essais ratés
(table `tentatives` dans la base).
Plus de confirmation du courriel depuis le 23 nov. 2026 (choix d'Alexis) : l'inscription active le compte et ouvre la session,
puis envoie un courriel de bienvenue ; un courriel déjà inscrit est refusé (409) sans ouvrir de session. « Mot de passe oublié »
envoie un lien valide 30 min, à usage unique.

## Ce qui manque avant la mise en ligne

1. ~~Supabase~~ : branché le 17 nov. 2026. Tables installées, test de sécurité passé sur la vraie base, base vide et propre.
   Il faudra copier `SUPABASE_URL` et `SUPABASE_SECRET_KEY` dans Vercel.
2. **SendGrid** (choix du 17 nov. 2026, domaine déjà authentifié) : mettre `SENDGRID_API_KEY` (permission « Mail Send ») et `COURRIEL_EXPEDITEUR` dans Vercel.
3. **Variables** : `SESSION_SECRET` (32 caractères ou plus), `ADMIN_COURRIELS`, `APP_URL`, `SITE_URL`.
4. **Les adresses** : ~~`compte.agencejutras.com`~~ branchée le 22 nov. 2026, `APP_URL` à jour dans Vercel le même jour. Reste une redirection `agencejutras.com/r/*` vers l'application.
5. **La Loi 25** : la politique de confidentialité du site doit parler du programme (noms, cellulaires, courriels Interac, témoin `aj_ref` de 90 jours).
6. Changer de mot de passe ne ferme pas encore les autres sessions ouvertes.

## Règles du projet

- Interface et code en français québécois. On tutoie les ambassadeurs dans leur espace ; le reste vouvoie (20 nov. 2026).
- **Aucun prix de l'Agence Jutras, aucun gain chiffré, aucun témoignage** sur les pages publiques. La récompense de 100 $ n'est pas un prix.
- Données de démonstration **fictives** (`scripts/demo-local.mjs`). Aucune donnée réelle dans `.donnees/` ni dans Git.
- Clés : seulement dans `.env.local`. Commit et push seulement quand Alexis le demande.
