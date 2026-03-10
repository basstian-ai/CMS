alter table if exists pages
  add column if not exists summary jsonb default '{}'::jsonb,
  add column if not exists hero_image_path text,
  add column if not exists cta_label jsonb default '{}'::jsonb,
  add column if not exists cta_href text,
  add column if not exists layout_variant text not null default 'standard';

update pages
set layout_variant = 'standard'
where layout_variant is null;

create index if not exists pages_layout_variant_idx on pages (layout_variant);
