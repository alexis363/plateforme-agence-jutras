-- 19 nov. 2026 : « Mes prospects ». Les rendez-vous pris sur le site deviennent des prospects comme ceux des
-- liens (table refs, sans ambassadeur), pour suivre tout le monde dans les mêmes 6 étapes.
-- À exécuter UNE fois dans Supabase → SQL Editor, sur le projet de la plateforme.
alter table refs alter column membre_id drop not null;
alter table refs add column if not exists source text not null default 'lien';

-- Les rendez-vous déjà pris sur le site passent dans refs, puis sont retirés de rdv_site (rien n'est perdu).
insert into refs (membre_id, source, entreprise, contact, metier, cellulaire, cellulaire_norm, courriel, casse_tete,
                  moment, rendez_vous, evenement_id, cree_le, etape, historique)
select null, 'site', entreprise, contact, metier, cellulaire,
       regexp_replace(regexp_replace(cellulaire, '\D', '', 'g'), '^1(\d{10})$', '\1'),
       courriel, casse_tete, moment, rendez_vous, evenement_id, cree_le, 1,
       jsonb_build_array(jsonb_build_object('le', cree_le, 'quoi', 'Demande de rendez-vous sur le site web'))
from rdv_site;
delete from rdv_site;
