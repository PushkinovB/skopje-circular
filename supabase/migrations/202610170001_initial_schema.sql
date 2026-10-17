create extension if not exists pgcrypto;

create table if not exists public.collection_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  municipality text not null default 'Skopje' check (municipality = 'Skopje'),
  address text,
  latitude double precision not null check (latitude between 41.8 and 42.2),
  longitude double precision not null check (longitude between 21.2 and 21.7),
  accepted_materials text[] not null check (cardinality(accepted_materials) > 0 and accepted_materials <@ array['paper','plastic','glass','metal','organics']::text[]),
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  last_checked_at timestamptz not null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.host_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.interest_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 2 and 100),
  phone text not null check (length(trim(phone)) between 7 and 30 and phone ~ '^[+()0-9 .-]{7,30}$'),
  contact_channel text not null check (contact_channel in ('call','sms','viber','whatsapp')),
  neighborhood text check (neighborhood is null or length(neighborhood) <= 80),
  materials text[] not null check (cardinality(materials) > 0 and materials <@ array['paper','plastic','glass','metal','organics']::text[]),
  consent boolean not null check (consent = true),
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  contacted_at timestamptz
);

create index if not exists interest_signups_retention_idx on public.interest_signups (created_at) where reviewed_at is null;
create index if not exists collection_locations_verified_idx on public.collection_locations (is_verified, name);

alter table public.collection_locations enable row level security;
alter table public.host_users enable row level security;
alter table public.interest_signups enable row level security;

revoke all on public.collection_locations from anon, authenticated;
revoke all on public.host_users from anon, authenticated;
revoke all on public.interest_signups from anon, authenticated;

grant select on public.collection_locations to anon, authenticated;
grant select (user_id) on public.host_users to authenticated;
grant insert (full_name, phone, contact_channel, neighborhood, materials, consent, consented_at) on public.interest_signups to anon;
grant select, delete on public.interest_signups to authenticated;

drop policy if exists "public can read verified locations" on public.collection_locations;
create policy "public can read verified locations"
  on public.collection_locations for select to anon, authenticated
  using (is_verified = true);

drop policy if exists "hosts can read own host membership" on public.host_users;
create policy "hosts can read own host membership"
  on public.host_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "anonymous users can submit an interest signup" on public.interest_signups;
create policy "anonymous users can submit an interest signup"
  on public.interest_signups for insert to anon
  with check (consent = true and consented_at is not null and reviewed_at is null and contacted_at is null);

create or replace function public.is_interest_host()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.host_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_interest_host() from public;
grant execute on function public.is_interest_host() to authenticated;

drop policy if exists "only hosts can read signups" on public.interest_signups;
create policy "only hosts can read signups"
  on public.interest_signups for select to authenticated
  using ((select public.is_interest_host()));

drop policy if exists "only hosts can delete signups" on public.interest_signups;
create policy "only hosts can delete signups"
  on public.interest_signups for delete to authenticated
  using ((select public.is_interest_host()));

create or replace function public.mark_interest_contacted_once(p_signup_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_interest_host()) then
    raise exception 'Not authorized';
  end if;

  update public.interest_signups
  set contacted_at = now(), reviewed_at = now()
  where id = p_signup_id and contacted_at is null;

  if not found then
    raise exception 'Signup not found or already contacted';
  end if;
end;
$$;

revoke all on function public.mark_interest_contacted_once(uuid) from public;
grant execute on function public.mark_interest_contacted_once(uuid) to authenticated;

comment on table public.collection_locations is 'Curated, source-attributed Skopje recycling points. Add only after local acceptance is verified.';
comment on table public.interest_signups is 'Private interest in a future pilot; not a pickup job. Unreviewed rows are removed after six months.';
comment on table public.host_users is 'Allowlist of approved Supabase Auth users who may review interest signups.';
