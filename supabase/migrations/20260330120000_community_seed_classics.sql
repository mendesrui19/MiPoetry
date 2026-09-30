-- Comunidade viva: login demo, clássicos (domínio público), social graph, auto-seguir poetas curados

-- ── Identities em falta (login email nos escritores demo) ───────────────────
insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now()
from auth.users u
where u.email like '%@demo.mipoetry.pt'
  and not exists (select 1 from auth.identities i where i.user_id = u.id);

-- ── Novos escritores contemporâneos (demo) ───────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
select * from (values
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111105'::uuid,
    'authenticated', 'authenticated',
    'sofiaalmeida@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"sofiaalmeida","display_name":"Sofia Almeida","bio":"Sonetos curtos e silêncio de cozinha. Escrevo entre chávenas."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111106'::uuid,
    'authenticated', 'authenticated',
    'miguelarruda@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"miguelarruda","display_name":"Miguel Arruda","bio":"Poesia de estrada. Combustível, mapas e estrelas no retrovisor."}'::jsonb,
    now(), now(), '', '', '', ''
  )
) as v(instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
where not exists (select 1 from auth.users u where u.id = v.id);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  now(),
  now()
from auth.users u
where u.id in (
  'b1111111-1111-4111-8111-111111111105'::uuid,
  'b1111111-1111-4111-8111-111111111106'::uuid
)
and not exists (select 1 from auth.identities i where i.user_id = u.id);

update public.profiles set
  style_tags = '{íntimo,soneto}',
  pinned_poem_ids = '{c2111111-1111-4111-8111-111111111501}'
where id = 'b1111111-1111-4111-8111-111111111105';

update public.profiles set
  style_tags = '{estrada,liberdade}',
  pinned_poem_ids = '{c2111111-1111-4111-8111-111111111601}'
where id = 'b1111111-1111-4111-8111-111111111106';

-- ── Clássicos (domínio público · perfis curados) ───────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
select * from (values
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b2222222-2222-4222-8222-222222222201'::uuid,
    'authenticated', 'authenticated',
    'fernandopessoa@classics.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"fernandopessoa","display_name":"Fernando Pessoa","bio":"Perfil curado · obra de domínio público (1888–1935)."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b2222222-2222-4222-8222-222222222202'::uuid,
    'authenticated', 'authenticated',
    'florbela@classics.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"florbelaespanca","display_name":"Florbela Espanca","bio":"Perfil curado · obra de domínio público (1894–1930)."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b2222222-2222-4222-8222-222222222203'::uuid,
    'authenticated', 'authenticated',
    'cesarioverde@classics.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"cesarioverde","display_name":"Cesário Verde","bio":"Perfil curado · obra de domínio público (1855–1886)."}'::jsonb,
    now(), now(), '', '', '', ''
  )
) as v(instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
where not exists (select 1 from auth.users u where u.id = v.id);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  now(),
  now()
from auth.users u
where u.email like '%@classics.mipoetry.pt'
  and not exists (select 1 from auth.identities i where i.user_id = u.id);

update public.profiles set style_tags = '{clássico,modernismo}'
where id = 'b2222222-2222-4222-8222-222222222201';
update public.profiles set style_tags = '{clássico,amor}'
where id = 'b2222222-2222-4222-8222-222222222202';
update public.profiles set style_tags = '{clássico,cidade}'
where id = 'b2222222-2222-4222-8222-222222222203';

-- ── Poemas novos ───────────────────────────────────────────────────────────
insert into public.poems (id, author_id, title, body, font, theme, text_color, font_size, privacy, hashtags, applause_count, snap_count, comment_count, view_count, created_at, updated_at)
values
  ('c2111111-1111-4111-8111-111111111501', 'b1111111-1111-4111-8111-111111111105', 'Chávena',
   E'Ferve a água\ncomo quem tem pressa\na dizer o que importa.\nEu espero\naté o silêncio\nficar doce.',
   'classic', 'cream', '#78350f', 'md', 'public', '{chá,manhã,soneto}', 47, 22, 2, 312, now() - interval '1 day', now() - interval '1 day'),
  ('c2111111-1111-4111-8111-111111111502', 'b1111111-1111-4111-8111-111111111105', 'Toalha na Varanda',
   '<p style="text-align: center">A toalha seca ao sol<br>como bandeira de casa.<br>Passa o vento —<br>fica o cheiro<br>a sabão e a tarde.</p>',
   'elegant', 'rose', '#881337', 'lg', 'public', '{casa,varanda}', 61, 29, 1, 388, now() - interval '4 days', now() - interval '4 days'),
  ('c2111111-1111-4111-8111-111111111503', 'b1111111-1111-4111-8111-111111111105', 'Antes de Dormir',
   E'Apago a luz\ne ainda vejo versos\nno tecto.\nSão teus ou meus —\nnão importa.\nImporta que ficaram.',
   'sans', 'midnight', '#e2e8f0', 'sm', 'public', '{noite,amor}', 83, 40, 3, 445, now() - interval '6 days', now() - interval '6 days'),
  ('c2111111-1111-4111-8111-111111111601', 'b1111111-1111-4111-8111-111111111106', 'Posto de Gasolina',
   E'Luzes a 24 horas.\nCafé amargo.\nMapa aberto\nno banco do passageiro.\nO destino muda\na cada curva.',
   'typewriter', 'dark', '#fafaf9', 'md', 'public', '{estrada,viagem}', 52, 26, 1, 298, now() - interval '2 days', now() - interval '2 days'),
  ('c2111111-1111-4111-8111-111111111602', 'b1111111-1111-4111-8111-111111111106', 'Retrovisor',
   '<p style="text-align: right">A estrada fica pequena<br>como memória.<br>Adiante só há<br>asfalto e rádio<br>a procurar sinal.</p>',
   'sans', 'slate', '#334155', 'md', 'public', '{estrada,solidão}', 71, 33, 2, 367, now() - interval '5 days', now() - interval '5 days'),
  ('c2111111-1111-4111-8111-111111111603', 'b1111111-1111-4111-8111-111111111106', 'Paragem',
   E'Paro.\nRespiro.\nO mundo não para comigo —\ne isso\né um alívio.',
   'typewriter', 'forest', '#14532d', 'lg', 'public', '{pausa,natureza}', 44, 19, 0, 201, now() - interval '8 days', now() - interval '8 days'),
  ('c2222222-2222-4222-8222-222222222201', 'b2222222-2222-4222-8222-222222222201', 'Autopsicografia',
   E'O poeta é um fingidor.\nFinge tão completamente\nQue chega a fingir que é dor\nA dor que deveras sente.\n\nE os que lêem o que escreve,\nNa dor lida sentem bem,\nNão as duas que ele teve,\nMas só a que eles não têm.',
   'classic', 'parchment', '#44403c', 'md', 'public', '{clássico,pessoa,modernismo}', 210, 98, 8, 1842, now() - interval '30 days', now() - interval '30 days'),
  ('c2222222-2222-4222-8222-222222222202', 'b2222222-2222-4222-8222-222222222201', 'Tabacaria (excerto)',
   E'Não sou nada.\nNunca serei nada.\nNão posso querer ser nada.\nTenho em mim todos os sonhos do mundo.',
   'classic', 'midnight', '#e2e8f0', 'lg', 'public', '{clássico,pessoa,existência}', 178, 85, 5, 1520, now() - interval '45 days', now() - interval '45 days'),
  ('c2222222-2222-4222-8222-222222222203', 'b2222222-2222-4222-8222-222222222202', 'Amar',
   E'Amar é ter medo de o perder\nComo se o amor\nFosse um frágil cristal\nQue um gesto brusco\nPode partir em mil pedaços.',
   'elegant', 'wine', '#fecdd3', 'md', 'public', '{clássico,amor,florbela}', 192, 91, 6, 1678, now() - interval '28 days', now() - interval '28 days'),
  ('c2222222-2222-4222-8222-222222222204', 'b2222222-2222-4222-8222-222222222202', 'Vozes na Escuridão',
   E'Na escuridão da minha solidão\nOuço vozes a chamar por mim\nVozes do passado, do presente, do futuro\nVozes de amor e de dor\nQue me fazem viver e sofrer.',
   'classic', 'rose', '#881337', 'md', 'public', '{clássico,florbela,noite}', 145, 67, 4, 1204, now() - interval '35 days', now() - interval '35 days'),
  ('c2222222-2222-4222-8222-222222222205', 'b2222222-2222-4222-8222-222222222203', 'O Sentimento dum Poeta (excerto)',
   E'As pálidas neblinas do crepúsculo\nVão envolvendo a cidade\nNum manto de tristeza e de silêncio,\nE eu, poeta triste e solitário,\nContemplo a vida a passar.',
   'classic', 'ocean', '#0c4a6e', 'md', 'public', '{clássico,lisboa,cesário}', 134, 58, 3, 1098, now() - interval '40 days', now() - interval '40 days'),
  ('c2222222-2222-4222-8222-222222222206', 'b2222222-2222-4222-8222-222222222203', 'Noite de Verão',
   E'Ó noite de verão,\nComo és bela e serena!\nAs estrelas no céu\nParecem diamantes\nNum manto de veludo azul.',
   'elegant', 'midnight', '#e2e8f0', 'lg', 'public', '{clássico,verão,cesário}', 118, 52, 2, 987, now() - interval '50 days', now() - interval '50 days')
on conflict (id) do nothing;

update public.profiles set pinned_poem_ids = '{c2222222-2222-4222-8222-222222222201}'
where id = 'b2222222-2222-4222-8222-222222222201';
update public.profiles set pinned_poem_ids = '{c2222222-2222-4222-8222-222222222203}'
where id = 'b2222222-2222-4222-8222-222222222202';

update public.profiles set pinned_poem_ids = '{c2111111-1111-4111-8111-111111111101}'
where id = 'b1111111-1111-4111-8111-111111111101';
update public.profiles set pinned_poem_ids = '{c2111111-1111-4111-8111-111111111203}'
where id = 'b1111111-1111-4111-8111-111111111102';
update public.profiles set pinned_poem_ids = '{c2111111-1111-4111-8111-111111111301}'
where id = 'b1111111-1111-4111-8111-111111111103';

-- ── Seguir poetas curados (todos os utilizadores existentes) ─────────────────
insert into public.follows (follower_id, following_id)
select p.id, w.id
from public.profiles p
cross join (
  values
    ('b1111111-1111-4111-8111-111111111101'::uuid),
    ('b1111111-1111-4111-8111-111111111102'::uuid),
    ('b1111111-1111-4111-8111-111111111103'::uuid),
    ('b1111111-1111-4111-8111-111111111104'::uuid),
    ('b1111111-1111-4111-8111-111111111105'::uuid),
    ('b1111111-1111-4111-8111-111111111106'::uuid),
    ('b2222222-2222-4222-8222-222222222201'::uuid),
    ('b2222222-2222-4222-8222-222222222202'::uuid),
    ('b2222222-2222-4222-8222-222222222203'::uuid)
) as w(id)
where p.id <> w.id
on conflict do nothing;

-- Rede entre escritores
insert into public.follows (follower_id, following_id)
values
  ('b1111111-1111-4111-8111-111111111101', '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48'),
  ('b1111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111101'),
  ('b1111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111103'),
  ('b1111111-1111-4111-8111-111111111105', 'b1111111-1111-4111-8111-111111111103'),
  ('b1111111-1111-4111-8111-111111111106', 'b1111111-1111-4111-8111-111111111102')
on conflict do nothing;

-- ── Reacções e comentários ─────────────────────────────────────────────────
insert into public.reactions (id, user_id, poem_id, type, created_at)
values
  ('f3111111-1111-4111-8111-111111111001', '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48', 'c2111111-1111-4111-8111-111111111101', 'applause', now() - interval '1 day'),
  ('f3111111-1111-4111-8111-111111111002', '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48', 'c2111111-1111-4111-8111-111111111301', 'snap', now() - interval '2 days'),
  ('f3111111-1111-4111-8111-111111111003', '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48', 'c2111111-1111-4111-8111-111111111203', 'applause', now() - interval '1 day'),
  ('f3111111-1111-4111-8111-111111111004', 'b1111111-1111-4111-8111-111111111103', 'c2111111-1111-4111-8111-111111111102', 'snap', now() - interval '3 days'),
  ('f3111111-1111-4111-8111-111111111005', 'b1111111-1111-4111-8111-111111111102', 'c2111111-1111-4111-8111-111111111301', 'applause', now() - interval '2 days'),
  ('f3111111-1111-4111-8111-111111111006', 'b1111111-1111-4111-8111-111111111101', 'c2222222-2222-4222-8222-222222222201', 'applause', now() - interval '5 days'),
  ('f3111111-1111-4111-8111-111111111007', 'b1111111-1111-4111-8111-111111111105', 'c2111111-1111-4111-8111-111111111203', 'snap', now() - interval '1 day'),
  ('f3111111-1111-4111-8111-111111111008', 'b1111111-1111-4111-8111-111111111106', 'c2111111-1111-4111-8111-111111111101', 'applause', now() - interval '4 days')
on conflict (user_id, poem_id) do nothing;

insert into public.comments (id, poem_id, author_id, body, created_at)
values
  ('a4111111-1111-4111-8111-111111111001', 'c2111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111102', 'A imagem da maré a recuar ficou comigo o dia inteiro.', now() - interval '1 day'),
  ('a4111111-1111-4111-8111-111111111002', 'c2111111-1111-4111-8111-111111111101', '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48', 'O alinhamento ao centro funciona muito bem aqui.', now() - interval '12 hours'),
  ('a4111111-1111-4111-8111-111111111003', 'c2111111-1111-4111-8111-111111111301', 'b1111111-1111-4111-8111-111111111101', 'Dezembro nunca me pareceu tão gentil.', now() - interval '2 days'),
  ('a4111111-1111-4111-8111-111111111004', 'c2222222-2222-4222-8222-222222222201', 'b1111111-1111-4111-8111-111111111105', 'Releio isto sempre que bloqueio num verso.', now() - interval '3 days'),
  ('a4111111-1111-4111-8111-111111111005', 'c2111111-1111-4111-8111-111111111501', 'b1111111-1111-4111-8111-111111111103', 'O silêncio doce — que imagem.', now() - interval '1 day'),
  ('a4111111-1111-4111-8111-111111111006', 'c2111111-1111-4111-8111-111111111203', 'b1111111-1111-4111-8111-111111111106', 'Neon como metáfora do amor: perfeito.', now() - interval '2 days')
on conflict (id) do nothing;

-- ── Novos registos seguem poetas curados automaticamente ───────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  curated uuid;
begin
  uname := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );
  insert into public.profiles (id, username, display_name, bio)
  values (
    new.id,
    uname,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), uname),
    coalesce(new.raw_user_meta_data->>'bio', '')
  );
  insert into public.bookmark_collections (user_id, name)
  values (new.id, 'Favoritos');

  foreach curated in array array[
    'b1111111-1111-4111-8111-111111111101'::uuid,
    'b1111111-1111-4111-8111-111111111102'::uuid,
    'b1111111-1111-4111-8111-111111111103'::uuid,
    'b1111111-1111-4111-8111-111111111104'::uuid,
    'b1111111-1111-4111-8111-111111111105'::uuid,
    'b1111111-1111-4111-8111-111111111106'::uuid,
    'b2222222-2222-4222-8222-222222222201'::uuid,
    'b2222222-2222-4222-8222-222222222202'::uuid,
    'b2222222-2222-4222-8222-222222222203'::uuid
  ]
  loop
    if curated <> new.id and exists (select 1 from public.profiles where id = curated) then
      insert into public.follows (follower_id, following_id)
      values (new.id, curated)
      on conflict do nothing;
    end if;
  end loop;

  return new;
end;
$$;
