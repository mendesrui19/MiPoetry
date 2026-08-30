-- MiPoetry: schema completo para Supabase
-- Executar no SQL Editor: https://supabase.com/dashboard/project/ukfhgjloqgfwpqkkujac/sql

create extension if not exists "uuid-ossp";

-- ── Tabelas ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text default '' not null,
  avatar_color text default '#C4956A' not null,
  avatar_url text,
  style_tags text[] default '{}' not null,
  pinned_poem_ids uuid[] default '{}' not null,
  created_at timestamptz default now() not null
);

create table if not exists public.poems (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Sem título',
  body text not null default '',
  font text not null default 'classic' check (font in ('classic', 'typewriter', 'sans', 'elegant')),
  theme text not null default 'parchment' check (theme in ('light', 'dark', 'parchment', 'midnight', 'rose', 'forest', 'ocean', 'cream', 'wine', 'slate')),
  text_color text not null default '#1c1917',
  font_size text not null default 'md' check (font_size in ('sm', 'md', 'lg', 'xl')),
  privacy text not null default 'public' check (privacy in ('public', 'private', 'followers')),
  hashtags text[] default '{}' not null,
  applause_count int default 0 not null,
  snap_count int default 0 not null,
  comment_count int default 0 not null,
  view_count int default 0 not null,
  audio_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.drafts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text default '' not null,
  body text default '' not null,
  font text default 'classic' not null check (font in ('classic', 'typewriter', 'sans', 'elegant')),
  theme text default 'parchment' not null check (theme in ('light', 'dark', 'parchment', 'midnight', 'rose', 'forest', 'ocean', 'cream', 'wine', 'slate')),
  text_color text default '#1c1917' not null,
  font_size text default 'md' not null check (font_size in ('sm', 'md', 'lg', 'xl')),
  privacy text default 'public' not null,
  hashtags text[] default '{}' not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create table if not exists public.reactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  poem_id uuid references public.poems(id) on delete cascade not null,
  type text not null check (type in ('applause', 'snap')),
  created_at timestamptz default now() not null,
  unique (user_id, poem_id)
);

create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  poem_id uuid references public.poems(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.bookmark_collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  collection_id uuid references public.bookmark_collections(id) on delete cascade not null,
  poem_id uuid references public.poems(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (collection_id, poem_id)
);

create table if not exists public.books (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '' not null,
  is_public boolean default false not null,
  slug text,
  cover_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.book_poems (
  book_id uuid references public.books(id) on delete cascade not null,
  poem_id uuid references public.poems(id) on delete cascade not null,
  position int default 0 not null,
  primary key (book_id, poem_id)
);

create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  updated_at timestamptz default now() not null
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- ── Índices ────────────────────────────────────────────────────────────────

create index if not exists poems_author_id_idx on public.poems(author_id);
create index if not exists poems_created_at_idx on public.poems(created_at desc);
create index if not exists poems_privacy_idx on public.poems(privacy);
create index if not exists follows_follower_idx on public.follows(follower_id);
create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists comments_poem_id_idx on public.comments(poem_id);
create index if not exists reactions_poem_id_idx on public.reactions(poem_id);

-- ── Trigger: perfil ao registar ────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Trigger: updated_at ────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists poems_updated_at on public.poems;
create trigger poems_updated_at
  before update on public.poems
  for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.drafts enable row level security;
alter table public.follows enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.bookmark_collections enable row level security;
alter table public.bookmarks enable row level security;
alter table public.books enable row level security;
alter table public.book_poems enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select to authenticated, anon using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Poems visibility
drop policy if exists "Poems visible by privacy" on public.poems;
create policy "Poems visible by privacy"
  on public.poems for select to authenticated, anon
  using (
    privacy = 'public'
    or author_id = (select auth.uid())
    or (
      privacy = 'followers'
      and (select auth.uid()) is not null
      and exists (
        select 1 from public.follows
        where follower_id = (select auth.uid()) and following_id = author_id
      )
    )
  );

drop policy if exists "Authors insert poems" on public.poems;
create policy "Authors insert poems"
  on public.poems for insert to authenticated
  with check (author_id = (select auth.uid()));

drop policy if exists "Authors update poems" on public.poems;
create policy "Authors update poems"
  on public.poems for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

drop policy if exists "Authors delete poems" on public.poems;
create policy "Authors delete poems"
  on public.poems for delete to authenticated
  using (author_id = (select auth.uid()));

-- Drafts (private)
drop policy if exists "Own drafts" on public.drafts;
create policy "Own drafts"
  on public.drafts for all to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- Follows
drop policy if exists "Follows viewable" on public.follows;
create policy "Follows viewable"
  on public.follows for select to authenticated, anon using (true);

drop policy if exists "Users manage own follows" on public.follows;
create policy "Users manage own follows"
  on public.follows for insert to authenticated
  with check (follower_id = (select auth.uid()));

drop policy if exists "Users unfollow" on public.follows;
create policy "Users unfollow"
  on public.follows for delete to authenticated
  using (follower_id = (select auth.uid()));

-- Reactions
drop policy if exists "Reactions viewable" on public.reactions;
create policy "Reactions viewable"
  on public.reactions for select to authenticated, anon using (true);

drop policy if exists "Users manage reactions" on public.reactions;
create policy "Users manage reactions"
  on public.reactions for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Comments on visible poems
drop policy if exists "Comments viewable" on public.comments;
create policy "Comments viewable"
  on public.comments for select to authenticated, anon
  using (
    exists (
      select 1 from public.poems p where p.id = poem_id
    )
  );

drop policy if exists "Users add comments" on public.comments;
create policy "Users add comments"
  on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()));

drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments"
  on public.comments for delete to authenticated
  using (author_id = (select auth.uid()));

-- Bookmarks
drop policy if exists "Own collections" on public.bookmark_collections;
create policy "Own collections"
  on public.bookmark_collections for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Own bookmarks" on public.bookmarks;
create policy "Own bookmarks"
  on public.bookmarks for all to authenticated
  using (
    exists (
      select 1 from public.bookmark_collections c
      where c.id = collection_id and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.bookmark_collections c
      where c.id = collection_id and c.user_id = (select auth.uid())
    )
  );

-- Books
drop policy if exists "Books viewable" on public.books;
create policy "Books viewable"
  on public.books for select to authenticated
  using (is_public or author_id = (select auth.uid()));

drop policy if exists "Own books" on public.books;
create policy "Own books"
  on public.books for all to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- Grants for Data API
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- View count (qualquer leitor pode incrementar)
create or replace function public.increment_poem_view(poem_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.poems
  set view_count = view_count + 1
  where id = poem_id;
end;
$$;

grant execute on function public.increment_poem_view(uuid) to anon, authenticated;

-- ── Storage: avatars ───────────────────────────────────────────────────────
-- Bucket criado via migration; políticas em storage.objects

-- ── Push subscriptions ─────────────────────────────────────────────────────

create table if not exists public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now() not null,
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- ── Book sections (elementos pré/pós-textuais) ─────────────────────────────

create table if not exists public.book_sections (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  section_type text not null check (
    section_type in (
      'dedication', 'epigraph', 'preface', 'prologue', 'introduction',
      'acknowledgments', 'afterword', 'appendix', 'note', 'custom'
    )
  ),
  title text,
  body text not null default '',
  placement text not null default 'front' check (placement in ('front', 'back')),
  position int not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists book_sections_book_id_idx on public.book_sections(book_id);

alter table public.book_sections enable row level security;

drop policy if exists "Book sections viewable with book" on public.book_sections;
create policy "Book sections viewable with book"
  on public.book_sections for select to authenticated, anon
  using (
    exists (
      select 1 from public.books b
      where b.id = book_id
      and (b.is_public or b.author_id = (select auth.uid()))
    )
  );

drop policy if exists "Authors manage book sections" on public.book_sections;
create policy "Authors manage book sections"
  on public.book_sections for all to authenticated
  using (
    exists (
      select 1 from public.books b
      where b.id = book_id and b.author_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.books b
      where b.id = book_id and b.author_id = (select auth.uid())
    )
  );

grant select on public.book_sections to anon, authenticated;
grant insert, update, delete on public.book_sections to authenticated;
