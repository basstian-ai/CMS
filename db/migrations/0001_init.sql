-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists ltree;

-- Helper function for local migrations
create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
set search_path = public as
$$
begin
  execute sql;
end;
$$;

grant execute on function public.exec_sql(text) to service_role;

-- CMS tables
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null check (status in ('draft','published')),
  meta jsonb not null default '{}'::jsonb,
  blocks jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  width int,
  height int,
  type text,
  created_at timestamptz not null default timezone('utc', now())
);

-- PIM tables
create table if not exists public.pim_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.pim_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  path ltree,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pim_products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  brand text,
  attributes jsonb not null default '{}'::jsonb,
  default_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pim_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.pim_products(id) on delete cascade,
  sku text not null unique,
  name text not null,
  price_cents int not null,
  currency char(3) not null default 'NOK',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pim_product_categories (
  product_id uuid not null references public.pim_products(id) on delete cascade,
  category_id uuid not null references public.pim_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.stock_levels (
  variant_id uuid primary key references public.pim_variants(id) on delete cascade,
  quantity int not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Commerce tables
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  company text,
  segment text
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  currency char(3) not null default 'NOK',
  subtotal_cents int not null default 0,
  total_cents int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.pim_variants(id) on delete restrict,
  qty int not null,
  unit_price_cents int not null,
  row_total_cents int not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'created' check (status in ('created','paid','shipped','cancelled')),
  currency char(3) not null default 'NOK',
  subtotal_cents int not null default 0,
  total_cents int not null default 0,
  placed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.pim_products(id) on delete restrict,
  variant_id uuid not null references public.pim_variants(id) on delete restrict,
  sku text not null,
  name text not null,
  qty int not null,
  unit_price_cents int not null,
  row_total_cents int not null
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Roles helper table
create table if not exists public.roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor'))
);

-- Timestamp triggers
create or replace function public.set_updated_at()
returns trigger as
$$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_cms_pages
before update on public.cms_pages
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_products
before update on public.pim_products
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_stock
before update on public.stock_levels
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_carts
before update on public.carts
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.cms_pages enable row level security;
alter table public.pim_products enable row level security;
alter table public.pim_variants enable row level security;
alter table public.pim_categories enable row level security;
alter table public.stock_levels enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customers enable row level security;

-- Policies
create policy if not exists "Public read published pages"
  on public.cms_pages for select
  using (status = 'published');

create policy if not exists "Editors manage pages"
  on public.cms_pages for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')));

create policy if not exists "Public read categories" on public.pim_categories for select using (true);
create policy if not exists "Public read products" on public.pim_products for select using (true);
create policy if not exists "Public read variants" on public.pim_variants for select using (true);
create policy if not exists "Public read stock" on public.stock_levels for select using (true);

create policy if not exists "Editors manage categories"
  on public.pim_categories for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')));

create policy if not exists "Editors manage products"
  on public.pim_products for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')));

create policy if not exists "Editors manage variants"
  on public.pim_variants for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')));

create policy if not exists "Editors manage stock"
  on public.stock_levels for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role in ('admin','editor')));

create policy if not exists "Session carts"
  on public.carts for all
  using (session_id = current_setting('request.jwt.claim.session_id', true))
  with check (session_id = current_setting('request.jwt.claim.session_id', true));

create policy if not exists "Session cart items"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and c.session_id = current_setting('request.jwt.claim.session_id', true)
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and c.session_id = current_setting('request.jwt.claim.session_id', true)
    )
  );

create policy if not exists "Own customers"
  on public.customers for all
  using (auth.uid() = id or exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'))
  with check (auth.uid() = id or exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'));

create policy if not exists "Own orders"
  on public.orders for select using (
    exists (
      select 1 from public.customers c
      where c.id = orders.customer_id and (c.id = auth.uid() or exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'))
    )
  );

create policy if not exists "Admins manage orders"
  on public.orders for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'));

create policy if not exists "Order items follow orders"
  on public.order_items for select using (
    exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_items.order_id and (c.id = auth.uid() or exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'))
    )
  );

create policy if not exists "Admins manage order items"
  on public.order_items for all
  using (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'))
  with check (exists (select 1 from public.roles r where r.user_id = auth.uid() and r.role = 'admin'));
