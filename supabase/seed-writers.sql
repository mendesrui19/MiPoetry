-- Seed: 4 escritores demo com 3 poemas e 1 livro cada
-- Password para todos: teste123456

-- Utilizadores (auth + profiles via trigger)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
select * from (values
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111101'::uuid,
    'authenticated', 'authenticated',
    'inesmar@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"inesmar","display_name":"Inês Mar","bio":"Poeta do atlântico. Sal, luar e versos elegantes."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111102'::uuid,
    'authenticated', 'authenticated',
    'tomasverso@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"tomasverso","display_name":"Tomás Verso","bio":"Versos urbanos. Metro, neon e silêncio de elevador."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111103'::uuid,
    'authenticated', 'authenticated',
    'luaferreira@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"luaferreira","display_name":"Lua Ferreira","bio":"Romance em prosa curta. Janelas, mãos e dezembro."}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'b1111111-1111-4111-8111-111111111104'::uuid,
    'authenticated', 'authenticated',
    'zepassaro@demo.mipoetry.pt',
    crypt('teste123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"zepassaro","display_name":"Zé Pássaro","bio":"Campo e rio. Poesia livre com cheiro a pinho."}'::jsonb,
    now(), now(), '', '', '', ''
  )
) as v(instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
where not exists (select 1 from auth.users u where u.email = v.email);

update public.profiles set style_tags = '{mar,elegante,haiku}'
where id = 'b1111111-1111-4111-8111-111111111101';
update public.profiles set style_tags = '{cidade,minimalista}'
where id = 'b1111111-1111-4111-8111-111111111102';
update public.profiles set style_tags = '{amor,íntimo}'
where id = 'b1111111-1111-4111-8111-111111111103';
update public.profiles set style_tags = '{natureza,rural}'
where id = 'b1111111-1111-4111-8111-111111111104';

-- Poemas
insert into public.poems (id, author_id, title, body, font, theme, text_color, font_size, privacy, hashtags, applause_count, snap_count, comment_count, view_count, created_at, updated_at)
values
  ('c2111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111101', 'Maré Baixa',
   '<p style="text-align: center">A maré recua devagar<br>como quem não quer ir embora.<br>Deixa conchas no calçado<br>e promessas na areia molhada.</p>',
   'elegant', 'ocean', '#0c4a6e', 'lg', 'public', '{mar,atlântico}', 62, 28, 3, 418, now() - interval '2 days', now() - interval '2 days'),
  ('c2111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111101', 'Farol Apagado',
   E'O farol dormiu antes da tempestade.\nAlguém contou as ondas de memória\naté perder a conta\n— e ficou só o escuro\na respirar no cais.',
   'classic', 'midnight', '#e2e8f0', 'md', 'public', '{noite,mar}', 41, 19, 1, 276, now() - interval '5 days', now() - interval '5 days'),
  ('c2111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111101', 'Sal na Pele',
   '<p>Verão curto.<br>Vontade longa.<br>O sal fica quando o corpo já foi embora.</p>',
   'sans', 'slate', '#334155', 'sm', 'public', '{verão,corpo}', 88, 44, 2, 531, now() - interval '8 days', now() - interval '8 days'),
  ('c2111111-1111-4111-8111-111111111201', 'b1111111-1111-4111-8111-111111111102', 'Elevador',
   E'Sobe.\nPara.\nDesce.\nNinguém olha.\nTodos chegam\ntarde demais\npara alguma coisa.',
   'typewriter', 'dark', '#fafaf9', 'md', 'public', '{cidade,metro}', 95, 51, 4, 612, now() - interval '1 day', now() - interval '1 day'),
  ('c2111111-1111-4111-8111-111111111202', 'b1111111-1111-4111-8111-111111111102', 'Último Autocarro',
   '<p style="text-align: right">Luzes de sodium.<br>Cartão sem saldo.<br>Cidade a fechar os olhos.<br>Eu ainda acordado<br>com versos no bolso.</p>',
   'typewriter', 'wine', '#fecdd3', 'lg', 'public', '{noite,lisboa}', 73, 36, 2, 489, now() - interval '4 days', now() - interval '4 days'),
  ('c2111111-1111-4111-8111-111111111203', 'b1111111-1111-4111-8111-111111111102', 'Neon',
   '<p style="text-align: center"><span style="color: #be123c">P</span>isca.<br><span style="color: #cbd5e1">Apaga.</span><br>Recomeça.<br>Como tudo o que insistimos em amar.</p>',
   'sans', 'midnight', '#e2e8f0', 'xl', 'public', '{neon,cidade}', 112, 58, 6, 743, now() - interval '6 days', now() - interval '6 days'),
  ('c2111111-1111-4111-8111-111111111301', 'b1111111-1111-4111-8111-111111111103', 'Dezembro',
   E'Em dezembro até o silêncio treme.\nGuardo o teu nome\nentre o cachecol e a respiração,\ncomo quem esconde fogo\nnuma mão pequena.',
   'classic', 'rose', '#881337', 'lg', 'public', '{amor,inverno}', 156, 72, 9, 924, now() - interval '3 days', now() - interval '3 days'),
  ('c2111111-1111-4111-8111-111111111302', 'b1111111-1111-4111-8111-111111111103', 'Mãos',
   '<p style="text-align: center"><em>As tuas mãos sabiam<br>perguntar sem pressa.<br>As minhas aprenderam<br>a ficar.</em></p>',
   'elegant', 'cream', '#92400e', 'md', 'public', '{mãos,ternura}', 98, 49, 5, 567, now() - interval '7 days', now() - interval '7 days'),
  ('c2111111-1111-4111-8111-111111111303', 'b1111111-1111-4111-8111-111111111103', 'Antes do Adeus',
   E'Não digas nada.\nDeixa a frase inteira\nno copo meio cheio\ne no botão do casaco\nque ainda não abro.',
   'classic', 'wine', '#fecdd3', 'md', 'followers', '{adeus,silêncio}', 34, 17, 1, 128, now(), now()),
  ('c2111111-1111-4111-8111-111111111401', 'b1111111-1111-4111-8111-111111111104', 'Trilho',
   E'O trilho não pergunta\npara onde vais.\nSó abre caminho\nentre pinheiros\n e o cheiro a terra\n depois da chuva.',
   'sans', 'forest', '#14532d', 'md', 'public', '{montanha,trilho}', 54, 27, 2, 341, now() - interval '2 days', now() - interval '2 days'),
  ('c2111111-1111-4111-8111-111111111402', 'b1111111-1111-4111-8111-111111111104', 'Rio Lento',
   '<p style="text-align: center">Água que nunca tem pressa.<br>Leva folhas, leva nomes,<br>devolve estrelas ao céu<br>quando anoitece.</p>',
   'classic', 'ocean', '#1e3a5f', 'lg', 'public', '{rio,natureza}', 67, 31, 3, 402, now() - interval '9 days', now() - interval '9 days'),
  ('c2111111-1111-4111-8111-111111111403', 'b1111111-1111-4111-8111-111111111104', 'Campo',
   E'campo aberto\nviento\nsem ponto final',
   'typewriter', 'parchment', '#44403c', 'sm', 'public', '{campo,liberdade}', 39, 18, 1, 215, now() - interval '11 days', now() - interval '11 days')
on conflict (id) do nothing;

-- Livros
insert into public.books (id, author_id, title, description, slug, is_public, created_at, updated_at)
values
  ('d3111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111101', 'Cartas à Orla', 'Poemas escritos entre marés — do atlântico para quem escuta.', 'cartas-a-orla', true, now() - interval '10 days', now() - interval '2 days'),
  ('d3111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111102', 'Cidade Vertical', 'Versos de elevador, autocarro e luzes que não dormem.', 'cidade-vertical', true, now() - interval '8 days', now() - interval '1 day'),
  ('d3111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111103', 'Quarto com Janela', 'Poemas íntimos sobre amor, ausência e o inverno dentro de nós.', 'quarto-com-janela', true, now() - interval '6 days', now() - interval '3 days'),
  ('d3111111-1111-4111-8111-111111111104', 'b1111111-1111-4111-8111-111111111104', 'Debaixo do Céu', 'Trilhos, rios e campos — poesia com cheiro a pinho.', 'debaixo-do-ceu', true, now() - interval '12 days', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.book_poems (book_id, poem_id, position)
values
  ('d3111111-1111-4111-8111-111111111101', 'c2111111-1111-4111-8111-111111111101', 0),
  ('d3111111-1111-4111-8111-111111111101', 'c2111111-1111-4111-8111-111111111102', 1),
  ('d3111111-1111-4111-8111-111111111101', 'c2111111-1111-4111-8111-111111111103', 2),
  ('d3111111-1111-4111-8111-111111111102', 'c2111111-1111-4111-8111-111111111201', 0),
  ('d3111111-1111-4111-8111-111111111102', 'c2111111-1111-4111-8111-111111111202', 1),
  ('d3111111-1111-4111-8111-111111111102', 'c2111111-1111-4111-8111-111111111203', 2),
  ('d3111111-1111-4111-8111-111111111103', 'c2111111-1111-4111-8111-111111111301', 0),
  ('d3111111-1111-4111-8111-111111111103', 'c2111111-1111-4111-8111-111111111302', 1),
  ('d3111111-1111-4111-8111-111111111103', 'c2111111-1111-4111-8111-111111111303', 2),
  ('d3111111-1111-4111-8111-111111111104', 'c2111111-1111-4111-8111-111111111401', 0),
  ('d3111111-1111-4111-8111-111111111104', 'c2111111-1111-4111-8111-111111111402', 1),
  ('d3111111-1111-4111-8111-111111111104', 'c2111111-1111-4111-8111-111111111403', 2)
on conflict do nothing;

insert into public.book_sections (id, book_id, section_type, title, body, placement, position)
values
  ('e4111111-1111-4111-8111-111111111101', 'd3111111-1111-4111-8111-111111111101', 'dedication', null, 'Para quem me ensinou a ouvir o mar antes de o ver.', 'front', 0),
  ('e4111111-1111-4111-8111-111111111102', 'd3111111-1111-4111-8111-111111111101', 'epigraph', null, '«A maré escreve e apaga — nós ficamos com o sal.»', 'front', 1),
  ('e4111111-1111-4111-8111-111111111201', 'd3111111-1111-4111-8111-111111111102', 'epigraph', null, '«Ninguém chega tarde para o poema — só para si.»', 'front', 0),
  ('e4111111-1111-4111-8111-111111111301', 'd3111111-1111-4111-8111-111111111103', 'dedication', null, 'A quem deixou a luz acesa quando eu não sabia voltar.', 'front', 0),
  ('e4111111-1111-4111-8111-111111111401', 'd3111111-1111-4111-8111-111111111104', 'preface', 'Nota', 'Estes poemas nasceram caminhando. Leia-os devagar, como se fosse trilho.', 'front', 0)
on conflict (id) do nothing;

-- Rui Mendes segue os 4 escritores
insert into public.follows (follower_id, following_id)
select '9e2ac4c0-74b8-4e4d-bfa9-d627221acb48', id
from (values
  ('b1111111-1111-4111-8111-111111111101'::uuid),
  ('b1111111-1111-4111-8111-111111111102'::uuid),
  ('b1111111-1111-4111-8111-111111111103'::uuid),
  ('b1111111-1111-4111-8111-111111111104'::uuid)
) as w(id)
on conflict do nothing;
