-- 18 nov. 2026 : le rendez-vous se prend dans la plateforme (agenda Google d'Alexis).
-- À exécuter UNE fois dans Supabase → SQL Editor, sur le projet de la plateforme.
alter table refs add column if not exists rendez_vous timestamptz;
alter table refs add column if not exists evenement_id text;
