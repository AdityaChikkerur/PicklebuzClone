-- ============================================================================
-- PickleBuzz — 022_cancel_match_no_events.sql
-- Allow creators to cancel unscored live matches (covers legacy invite_status rows).
-- Run AFTER 021_cancel_match_by_creator.sql.
-- ============================================================================

create or replace function public.cancel_match_by_creator(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_match record;
  v_has_events boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id, created_by, status
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if v_match.created_by <> v_uid then
    raise exception 'Only the match creator can cancel this match';
  end if;

  if v_match.status not in ('draft', 'live') then
    raise exception 'This match can no longer be cancelled';
  end if;

  select exists (
    select 1
    from public.match_events
    where match_id = p_match_id
  )
  into v_has_events;

  if public.match_all_invites_accepted(p_match_id) and v_has_events then
    raise exception 'Cannot cancel after all players have accepted and scoring has started';
  end if;

  delete from public.matches where id = p_match_id;

  return jsonb_build_object('cancelled', true);
end;
$$;

create or replace function public.creator_can_cancel_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.created_by = auth.uid()
      and m.status in ('draft', 'live')
      and (
        not public.match_all_invites_accepted(p_match_id)
        or not exists (
          select 1
          from public.match_events e
          where e.match_id = p_match_id
        )
      )
  );
$$;

grant execute on function public.creator_can_cancel_match(uuid) to authenticated;
