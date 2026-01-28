-- Dummy content for local/manual seeding in Supabase.
-- Run in Supabase SQL editor or psql:
--   \i scripts/seed_dummy_content.sql

begin;

insert into posts (id, slug, title, excerpt, content_md, cover_image_path, status, published_at)
values
  (
    gen_random_uuid(),
    'ny-rytme-for-sondager',
    '{"no": "Ny rytme for søndager", "en": "A new rhythm for Sundays"}',
    '{"no": "Vi oppdaterer søndagsflyten med mer tid til fellesskap.", "en": "We are updating our Sunday flow to create more room for community."}',
    '{"no": "## Hva skjer nå?\n\nVi justerer møteplanen slik at det blir mer tid til fellesskap etter samlingen.\n\n**Velkommen innom!**", "en": "## What is new?\n\nWe are adjusting the schedule to create more room for community after service.\n\n**You are welcome!**"}',
    null,
    'published',
    now() - interval '6 days'
  ),
  (
    gen_random_uuid(),
    'frivillighet-som-gjor-en-forskjell',
    '{"no": "Frivillighet som gjør en forskjell", "en": "Volunteering that makes a difference"}',
    '{"no": "Bli med og gjør byen varmere gjennom praktisk tjeneste.", "en": "Join us in making the city warmer through practical service."}',
    '{"no": "### Bli med\n\nVi trenger flere hender på vertskap, teknikk og kafé.", "en": "### Join us\n\nWe are looking for more volunteers for hosting, tech and café."}',
    null,
    'published',
    now() - interval '15 days'
  ),
  (
    gen_random_uuid(),
    'sommerkalender-2024',
    '{"no": "Sommerkalender 2024", "en": "Summer calendar 2024"}',
    '{"no": "Her er oversikten over samlingene i sommer.", "en": "Here is the overview of gatherings this summer."}',
    '{"no": "Vi legger ut full kalender for sommeren her.\n\n- Gudstjenester annenhver søndag\n- Felles grillkveld i juli", "en": "We publish the full summer calendar here.\n\n- Services every other Sunday\n- Community BBQ in July"}',
    null,
    'draft',
    null
  );

insert into events (
  id,
  slug,
  title,
  description_md,
  start_time,
  end_time,
  location,
  status,
  published_at
)
values
  (
    gen_random_uuid(),
    'sondagsgudstjeneste-bydelshuset',
    '{"no": "Søndagsgudstjeneste", "en": "Sunday service"}',
    '{"no": "Velkommen til søndagsgudstjeneste med lovsang og tale.", "en": "Welcome to Sunday service with worship and teaching."}',
    now() + interval '5 days',
    now() + interval '5 days' + interval '2 hours',
    'Bydelshuset, Storgata 1',
    'published',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    'bibelkveld-i-hjemmene',
    '{"no": "Bibelkveld i hjemmene", "en": "Home group Bible night"}',
    '{"no": "Små grupper møtes for bønn og fellesskap.", "en": "Small groups meet for prayer and community."}',
    now() + interval '12 days',
    now() + interval '12 days' + interval '2 hours',
    'Ulike hjem',
    'published',
    now() - interval '2 days'
  );

insert into pages (id, slug, title, content_md, status, published_at)
values
  (
    gen_random_uuid(),
    'om-oss',
    '{"no": "Om oss", "en": "About us"}',
    '{"no": "Bykirken er en lokal kirke midt i byen.\n\nVi ønsker å være et hjem for tro og fellesskap.", "en": "Bykirken is a local church in the city center.\n\nWe want to be a home for faith and community."}',
    'published',
    now() - interval '30 days'
  ),
  (
    gen_random_uuid(),
    'gi',
    '{"no": "Gi", "en": "Give"}',
    '{"no": "Takk for at du vurderer å støtte arbeidet.\n\nBank: 1234.56.78901\nVipps: 123456", "en": "Thank you for considering supporting our work.\n\nBank: 1234.56.78901\nVipps: 123456"}',
    'published',
    now() - interval '30 days'
  ),
  (
    gen_random_uuid(),
    'kontakt',
    '{"no": "Kontakt", "en": "Contact"}',
    '{"no": "Send oss en e-post på hello@bykirken.no eller bruk skjemaet på siden.", "en": "Email us at hello@bykirken.no or use the form on the site."}',
    'published',
    now() - interval '30 days'
  );

insert into sermons (
  id,
  slug,
  title,
  preacher,
  bible_ref,
  description,
  published_at,
  filename,
  audio_path,
  external_spotify_url,
  external_apple_url,
  duration_seconds,
  file_size
)
values
  (
    gen_random_uuid(),
    'hoydepunkter-fra-fellesskapet',
    'Høydepunkter fra fellesskapet',
    'Lise Hansen',
    'Apg 2:42-47',
    'En tale om fellesskap, generøsitet og bønn.',
    now() - interval '4 days',
    '2024-05-12_fellesskap.mp3',
    '2024/05/2024-05-12_fellesskap.mp3',
    'https://open.spotify.com/show/placeholder',
    'https://podcasts.apple.com/no/podcast/placeholder',
    1980,
    50485760
  ),
  (
    gen_random_uuid(),
    'hvorfor-vi-samles',
    'Hvorfor vi samles',
    'Jonas Berg',
    'Heb 10:24-25',
    'Vi ser på hvorfor fellesskap er viktig i en travel hverdag.',
    now() - interval '12 days',
    '2024-05-04_samles.mp3',
    '2024/05/2024-05-04_samles.mp3',
    null,
    null,
    1760,
    46275840
  );

insert into media (id, bucket, path, alt, caption)
values
  (
    gen_random_uuid(),
    'images',
    'placeholders/hero.jpg',
    '{"no": "Gudstjeneste i fellesskap", "en": "Community worship service"}',
    '{"no": "Forsidebilde", "en": "Hero image"}'
  );

insert into redirects (from_path, to_path, code)
values
  ('/om-bykirken', '/om-oss', 301),
  ('/gi-stotte', '/gi', 301);

commit;
