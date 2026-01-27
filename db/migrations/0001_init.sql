create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  excerpt jsonb default '{}'::jsonb,
  content_md jsonb not null default '{}'::jsonb,
  cover_image_path text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  description_md jsonb not null default '{}'::jsonb,
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists sermons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  preacher text,
  bible_ref text,
  description text,
  published_at timestamptz,
  filename text unique,
  audio_path text,
  external_spotify_url text,
  external_apple_url text,
  duration_seconds integer,
  file_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  content_md jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null unique,
  alt jsonb not null default '{}'::jsonb,
  caption jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists redirects (
  from_path text primary key,
  to_path text not null,
  code integer not null default 301,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function current_cms_role()
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select role
  from profiles
  where id = auth.uid();
$$;

create or replace function is_cms_editor()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(current_cms_role() in ('admin', 'editor'), false);
$$;

create or replace function is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(current_cms_role() = 'admin', false);
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
before update on profiles
for each row execute procedure set_updated_at();

drop trigger if exists posts_updated_at on posts;
create trigger posts_updated_at
before update on posts
for each row execute procedure set_updated_at();

drop trigger if exists events_updated_at on events;
create trigger events_updated_at
before update on events
for each row execute procedure set_updated_at();

drop trigger if exists sermons_updated_at on sermons;
create trigger sermons_updated_at
before update on sermons
for each row execute procedure set_updated_at();

drop trigger if exists pages_updated_at on pages;
create trigger pages_updated_at
before update on pages
for each row execute procedure set_updated_at();

drop trigger if exists media_updated_at on media;
create trigger media_updated_at
before update on media
for each row execute procedure set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

alter table profiles enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
alter table sermons enable row level security;
alter table pages enable row level security;
alter table media enable row level security;
alter table redirects enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (auth.uid() = id or is_cms_admin());

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = current_cms_role()
  );

create policy "profiles_admin_update"
  on profiles for update
  using (is_cms_admin())
  with check (is_cms_admin());

create policy "profiles_admin_insert"
  on profiles for insert
  with check (is_cms_admin());

create policy "posts_public_read"
  on posts for select
  using (status = 'published' and published_at <= now());

create policy "posts_admin_all"
  on posts for all
  using (is_cms_editor())
  with check (is_cms_editor());

create policy "events_public_read"
  on events for select
  using (status = 'published' and published_at <= now());

create policy "events_admin_all"
  on events for all
  using (is_cms_editor())
  with check (is_cms_editor());

create policy "sermons_public_read"
  on sermons for select
  using (published_at is not null and published_at <= now());

create policy "sermons_admin_all"
  on sermons for all
  using (is_cms_editor())
  with check (is_cms_editor());

create policy "pages_public_read"
  on pages for select
  using (status = 'published' and published_at <= now());

create policy "pages_admin_all"
  on pages for all
  using (is_cms_editor())
  with check (is_cms_editor());

create policy "media_public_read"
  on media for select
  using (true);

create policy "media_admin_all"
  on media for all
  using (is_cms_editor())
  with check (is_cms_editor());

create policy "redirects_public_read"
  on redirects for select
  using (true);

create policy "redirects_admin_all"
  on redirects for all
  using (is_cms_editor())
  with check (is_cms_editor());

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('podcasts', 'podcasts', true)
on conflict (id) do nothing;

create policy "storage_public_read"
  on storage.objects for select
  using (bucket_id in ('images', 'podcasts'));

create policy "storage_admin_all"
  on storage.objects for all
  using (is_cms_editor())
  with check (is_cms_editor());
