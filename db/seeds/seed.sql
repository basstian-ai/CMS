insert into public.cms_pages (slug, title, status, meta, blocks, published_at)
values
  ('home', 'Homepage', 'published', '{"title": "Welcome"}'::jsonb, '[{"type":"hero","headline":"Hello"}]'::jsonb, timezone('utc', now())),
  ('about', 'About', 'draft', '{}', '[]', null)
ON CONFLICT (slug) DO NOTHING;

insert into public.pim_categories (id, name, slug)
values
  (gen_random_uuid(), 'Apparel', 'apparel'),
  (gen_random_uuid(), 'Accessories', 'accessories')
ON CONFLICT (slug) DO NOTHING;

with cats as (
  select slug, id from public.pim_categories where slug in ('apparel','accessories')
),
prod as (
  select
    gen_random_uuid() as id,
    jsonb_build_object(
      'sku', sku,
      'name', name,
      'description', description,
      'default_image_url', default_image_url
    ) as payload
  from (values
    ('TSHIRT-001','Starter Tee','Soft cotton tee','https://placehold.co/400x400'),
    ('HOODIE-001','Comfy Hoodie','Cozy layer for cooler days','https://placehold.co/400x400'),
    ('CAP-001','Classic Cap','Adjustable cap for everyday wear','https://placehold.co/400x400')
  ) as p(sku,name,description,default_image_url)
)
insert into public.pim_products (id, sku, name, description, default_image_url)
select
  prod.id,
  (prod.payload->>'sku'),
  (prod.payload->>'name'),
  (prod.payload->>'description'),
  (prod.payload->>'default_image_url')
from prod
on conflict (sku) do nothing;

with products as (
  select id, sku from public.pim_products where sku in ('TSHIRT-001','HOODIE-001','CAP-001')
),
variants as (
  select
    gen_random_uuid() as id,
    product_id,
    sku || '-VAR' as sku,
    name || ' Variant' as name,
    case when sku = 'CAP-001' then 2999 else 4999 end as price_cents
  from products
  join public.pim_products p on p.id = products.id
)
insert into public.pim_variants (id, product_id, sku, name, price_cents)
select id, product_id, sku, name, price_cents from variants
on conflict (sku) do nothing;

insert into public.stock_levels (variant_id, quantity)
select id, 50 from public.pim_variants
on conflict (variant_id) do nothing;

insert into public.pim_product_categories (product_id, category_id)
select p.id, c.id
from public.pim_products p
join public.pim_categories c on c.slug = case when p.sku = 'CAP-001' then 'accessories' else 'apparel' end
on conflict do nothing;
