-- RLS: mensagens directas
drop policy if exists "Participants view conversations" on public.conversations;
create policy "Participants view conversations"
  on public.conversations for select to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users create conversations" on public.conversations;
create policy "Users create conversations"
  on public.conversations for insert to authenticated
  with check (true);

drop policy if exists "Participants update conversation" on public.conversations;
create policy "Participants update conversation"
  on public.conversations for update to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Participants view membership" on public.conversation_participants;
create policy "Participants view membership"
  on public.conversation_participants for select to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users join conversations" on public.conversation_participants;
create policy "Users join conversations"
  on public.conversation_participants for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Participants view messages" on public.messages;
create policy "Participants view messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Recipients mark messages read" on public.messages;
create policy "Recipients mark messages read"
  on public.messages for update to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = (select auth.uid())
    )
  );

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists conversation_participants_user_idx on public.conversation_participants(user_id);

-- Poemas colaborativos
create table if not exists public.collaborative_poems (
  id uuid default uuid_generate_v4() primary key,
  title text not null default 'Sem título',
  status text not null default 'active' check (status in ('active', 'published', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.collaborative_participants (
  collab_id uuid references public.collaborative_poems(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (collab_id, user_id)
);

create table if not exists public.collaborative_verses (
  id uuid default uuid_generate_v4() primary key,
  collab_id uuid references public.collaborative_poems(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  position int not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists collaborative_verses_collab_idx on public.collaborative_verses(collab_id, position);
create index if not exists collaborative_participants_user_idx on public.collaborative_participants(user_id);

alter table public.collaborative_poems enable row level security;
alter table public.collaborative_participants enable row level security;
alter table public.collaborative_verses enable row level security;

drop policy if exists "Collab participants view poem" on public.collaborative_poems;
create policy "Collab participants view poem"
  on public.collaborative_poems for select to authenticated
  using (
    exists (
      select 1 from public.collaborative_participants cp
      where cp.collab_id = id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users create collabs" on public.collaborative_poems;
create policy "Users create collabs"
  on public.collaborative_poems for insert to authenticated
  with check (true);

drop policy if exists "Participants update collab" on public.collaborative_poems;
create policy "Participants update collab"
  on public.collaborative_poems for update to authenticated
  using (
    exists (
      select 1 from public.collaborative_participants cp
      where cp.collab_id = id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Collab participants view roster" on public.collaborative_participants;
create policy "Collab participants view roster"
  on public.collaborative_participants for select to authenticated
  using (
    exists (
      select 1 from public.collaborative_participants cp
      where cp.collab_id = collab_id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users join collab" on public.collaborative_participants;
create policy "Users join collab"
  on public.collaborative_participants for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Collab participants view verses" on public.collaborative_verses;
create policy "Collab participants view verses"
  on public.collaborative_verses for select to authenticated
  using (
    exists (
      select 1 from public.collaborative_participants cp
      where cp.collab_id = collab_id and cp.user_id = (select auth.uid())
    )
  );

drop policy if exists "Participants add verses" on public.collaborative_verses;
create policy "Participants add verses"
  on public.collaborative_verses for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.collaborative_participants cp
      where cp.collab_id = collab_id and cp.user_id = (select auth.uid())
    )
  );

grant select, insert, update on public.collaborative_poems to authenticated;
grant select, insert on public.collaborative_participants to authenticated;
grant select, insert on public.collaborative_verses to authenticated;

-- Hashtags em tendência (poemas públicos)
create or replace function public.trending_hashtags(limit_count int default 12)
returns table (tag text, poem_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select lower(trim(h)) as tag, count(*)::bigint as poem_count
  from public.poems p
  cross join lateral unnest(p.hashtags) as h
  where p.privacy = 'public' and trim(h) <> ''
  group by 1
  order by poem_count desc, tag asc
  limit greatest(1, least(limit_count, 50));
$$;

grant execute on function public.trending_hashtags(int) to anon, authenticated;
