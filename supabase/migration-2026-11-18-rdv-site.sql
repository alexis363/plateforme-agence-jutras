-- 18 nov. 2026 : le formulaire de réservation du site web (sans lien de référence).
-- À exécuter UNE fois dans Supabase → SQL Editor, sur le projet de la plateforme.
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

alter table rdv_site enable row level security;
revoke all on rdv_site from anon, authenticated;
grant all on rdv_site to service_role;
