-- Corrige recursão infinita em conversation_participants / collaborative_participants (42P17)

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = p_conversation_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_collab_member(p_collab_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collaborative_participants
    where collab_id = p_collab_id
      and user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.is_collab_member(uuid) to authenticated;

drop policy if exists "Participants view membership" on public.conversation_participants;
create policy "Participants view membership"
  on public.conversation_participants for select to authenticated
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Collab participants view roster" on public.collaborative_participants;
create policy "Collab participants view roster"
  on public.collaborative_participants for select to authenticated
  using (public.is_collab_member(collab_id));
