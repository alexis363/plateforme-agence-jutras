-- 18 nov. 2026 : la page Réglages de la console (durée, pause, disponibilités de l'agenda).
-- À exécuter UNE fois dans Supabase → SQL Editor, sur le projet de la plateforme.
-- Réglages modifiables dans la console (page Réglages) : une ligne par sujet, ex. « agenda ».
create table if not exists reglages (
  cle text primary key,
  valeur jsonb not null,
  maj_le timestamptz not null default now()
);

alter table reglages enable row level security;
revoke all on reglages from anon, authenticated;
grant all on reglages to service_role;
