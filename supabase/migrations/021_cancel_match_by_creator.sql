-- ============================================================================
-- PickleBuzz — 021_cancel_match_by_creator.sql
-- Let match creators remove live/draft matches while opponents still haven't accepted.
-- Run AFTER 020_creator_can_score_live.sql.
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

  if public.match_all_invites_accepted(p_match_id) then
    raise exception 'Cannot cancel after all players have accepted';
  end if;

  delete from public.matches where id = p_match_id;

  return jsonb_build_object('cancelled', true);
end;
$$;

grant execute on function public.cancel_match_by_creator(uuid) to authenticated;
