-- Base de la plateforme de l'Agence Jutras (programme de référence et console).
-- À exécuter UNE fois, dans Supabase → SQL Editor, sur le projet de la plateforme (jamais celui de Kairos).
--
-- Sécurité : seul le serveur de l'application lit et écrit, avec la clé secrète (qui passe outre la sécurité
-- par ligne). La sécurité par ligne est activée partout SANS aucune politique : la clé publique (anon) et les
-- comptes Supabase Auth ne voient rien. L'isolation entre membres est faite par lib/depot.ts.

create table if not exists membres (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  cellulaire text not null,
  courriel text not null unique,
  slug text not null unique,
  mot_de_passe text,
  role text not null default 'membre' check (role in ('membre', 'client', 'admin')),
  confirme boolean not null default false,
  accepte_regles timestamptz,
  prenom_visible boolean not null default true,
  cree_le timestamptz not null default now()
);

-- « refs » : le mot « references » est réservé en SQL.
create table if not exists refs (
  id uuid primary key default gen_random_uuid(),
  membre_id uuid not null references membres(id) on delete cascade,
  entreprise text not null,
  contact text not null,
  metier text not null,
  cellulaire text not null,
  cellulaire_norm text not null, -- chiffres seulement : sert au « premier qui réfère gagne »
  courriel text not null default '',
  casse_tete text not null default '',
  moment text not null,
  rendez_vous timestamptz, -- rendez-vous de 15 min pris dans l'agenda Google d'Alexis
  evenement_id text, -- l'événement Google Agenda correspondant
  cree_le timestamptz not null default now(),
  etape smallint not null default 1 check (etape between 1 and 6),
  fermee text,
  notes text not null default '',
  historique jsonb not null default '[]'
);
create index if not exists refs_membre on refs (membre_id, cree_le desc);
create index if not exists refs_cellulaire on refs (cellulaire_norm, cree_le desc);

create table if not exists visites (
  id bigint generated always as identity primary key,
  membre_id uuid not null references membres(id) on delete cascade,
  le timestamptz not null default now()
);
create index if not exists visites_membre on visites (membre_id, le);

-- Liens envoyés par courriel (confirmation, mot de passe oublié). Gardés hachés, à usage unique.
create table if not exists jetons (
  hash text primary key,
  membre_id uuid not null references membres(id) on delete cascade,
  but text not null check (but in ('confirmer', 'reinitialiser')),
  expire timestamptz not null,
  utilise boolean not null default false
);

-- Essais de connexion ratés : 5 essais, puis 15 minutes de blocage.
create table if not exists tentatives (
  courriel text primary key,
  n integer not null default 0,
  jusqua timestamptz not null
);

-- Rendez-vous de 15 minutes pris sur le site web (agencejutras.com), sans lien de référence.
create table if not exists rdv_site (
  id uuid primary key default gen_random_uuid(),
  entreprise text not null,
  contact text not null,
  metier text not null,
  cellulaire text not null,
  courriel text not null default '',
  casse_tete text not null default '',
  moment text not null,
  rendez_vous timestamptz,
  evenement_id text,
  cree_le timestamptz not null default now()
);
create index if not exists rdv_site_rendez_vous on rdv_site (rendez_vous);

alter table membres enable row level security;
alter table refs enable row level security;
alter table visites enable row level security;
alter table jetons enable row level security;
alter table tentatives enable row level security;
alter table rdv_site enable row level security;

revoke all on membres, refs, visites, jetons, tentatives, rdv_site from anon, authenticated;
grant all on membres, refs, visites, jetons, tentatives, rdv_site to service_role;
