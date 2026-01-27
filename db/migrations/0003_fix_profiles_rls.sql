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

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin"
  on profiles for select
  using (auth.uid() = id or is_cms_admin());

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = current_cms_role()
  );
