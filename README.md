# Bykirken CMS (MVP)

Dette repoet er klargjort for en enkel, stabil og kostnadseffektiv monolitt basert på Next.js App Router med TypeScript og Tailwind, samt Supabase for database, autentisering og lagring.

## Overordnede prinsipper
- Next.js App Router + TypeScript + Tailwind i én repo (monolitt).
- Supabase til DB + Auth + Storage (bilder + MP3).
- SSG/ISR på alt publikum ser (unngå DB-kall per visning).
- Admin på `/admin` med Supabase Auth + RLS.
- Migrering i to nivåer:
  1. Innhold: ta med det dere faktisk trenger (ikke alt historisk).
  2. Media: bare det som er nødvendig + podcast MP3 (kritisk pga legacy URL).

## Scope (MVP)

### Frontend (publikum)
- Forside: hero, neste gudstjeneste/kommende events, siste 3–4 nyheter, snarveier.
- Nyheter: liste + detalj (tekst + bilder).
- Kalender: liste + detalj (dato/tid/sted/beskrivelse).
- Podcast/Taler: liste + detalj + MP3-avspiller + lenker Spotify/Apple.
- Infosider (redigerbare): Om oss, Team, Lifegrupper, Barn & Ungdom, Misjon, Kulturskole, Gi.
- Kontakt: kontaktskjema + footer med kart/SoMe.
- Språk: NO/EN (MVP med “valgfri oversettelse” per innhold).

### CMS/Admin
- Innlogging (magic link eller passord).
- CRUD for: posts, events, sermons, pages.
- Media-opplasting (bilder + MP3).
- Publisering (draft/published + published_at).
- Enkel editor: Markdown eller “Rich text light” (MVP: Markdown anbefales).

### Migrering
- WordPress WXR XML import for:
  - Pages + Posts.
  - Events (tribe_events) – bare hvis dere vil beholde historikk.
- Media: kun “utvalgte” bilder (ikke alt).
- Podcast legacy:
  - MP3-filer til Supabase bucket `podcasts`.
  - Rewrites for `/images/stories/media/:filename`.
  - RSS-feed på nøyaktig legacy URL `.../bykirken.xml`.

## Foreløpig filstruktur
```
app/                # Next.js App Router
  (public)/         # Publikumsflaten
  admin/            # Admin/CMS
components/         # Delt UI (senere)
content/            # Midlertidig innhold/fixtures (senere)
db/                 # Migrasjoner og DB-scripts
  migrations/
lib/                # Delte util-funksjoner
public/             # Statiske assets
scripts/            # Migrering og vedlikehold
```

> Ingen applikasjonskode er lagt inn ennå. Neste steg er å definere datamodell, ruter og minimums-UI basert på scope.
