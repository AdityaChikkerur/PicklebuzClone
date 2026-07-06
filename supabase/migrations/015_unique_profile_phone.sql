-- ============================================================================
-- PickleBuzz — 015_unique_profile_phone.sql
-- Enforce one profile per phone number (normalized).
-- Run AFTER 014_match_invite_notifications.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Resolve existing duplicates before adding the unique index.
--    Keep the profile that completed onboarding first; otherwise the oldest.
-- ----------------------------------------------------------------------------

with ranked as (
  select
    p.id,
    row_number() over (
      partition by public.normalize_phone(p.phone)
      order by p.profile_complete desc, p.created_at asc
    ) as rn
  from public.profiles p
  where p.phone is not null
    and p.phone <> ''
    and public.normalize_phone(p.phone) <> ''
)
update public.profiles p
set
  phone = null,
  profile_complete = false
from ranked r
where p.id = r.id
  and r.rn > 1;

-- ----------------------------------------------------------------------------
-- 2. Unique index on normalized phone (replaces non-unique index from 011)
-- ----------------------------------------------------------------------------

drop index if exists public.idx_profiles_phone_normalized;

create unique index idx_profiles_phone_normalized
  on public.profiles (public.normalize_phone(phone))
  where phone is not null
    and phone <> ''
    and public.normalize_phone(phone) <> '';
