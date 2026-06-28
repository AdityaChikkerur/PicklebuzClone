-- PickleBuzz — 007 production onboarding (phone, profile completion, avatars storage)
-- Run AFTER 006_phase9_advanced.sql

-- ----------------------------------------------------------------------------
-- 1. Profile fields for mandatory onboarding
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists phone text,
  add column if not exists profile_complete boolean not null default false;

-- Existing accounts without phone or avatar must complete onboarding.
update public.profiles
set profile_complete = false
where phone is null
   or phone = ''
   or avatar_url is null
   or avatar_url = ''
   or city is null
   or city = '';

-- ----------------------------------------------------------------------------
-- 2. Signup trigger — minimal defaults; onboarding collects the rest
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    city,
    role,
    skill_level,
    dupr_rating,
    phone,
    profile_complete
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'player'::public.user_role
    ),
    '3.0'::public.skill_level,
    3.00,
    null,
    false
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Avatar storage bucket + RLS
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can replace own avatar" on storage.objects;
create policy "Users can replace own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile updates (phone, avatar_url, profile_complete) use existing
-- "Users can update their own profile" policy from 001_initial_schema.sql.
