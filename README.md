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

## Kom i gang

```bash
npm install
npm run dev
```

### Miljøvariabler
Kopier `.env.example` til `.env.local` og fyll inn følgende:

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GOOGLE_CALENDAR_ICS_URL=
CRON_SECRET=
```

### Google Calendar → Supabase sync
For å importere en offentlig Google Calendar til tabellen `events`, bruk skriptet under. Det henter en offentlig `.ics`-feed og oppdaterer `events` med `status = published`.

Krav:
- `SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` må være satt (f.eks. i `.env.local`).
- Valgfritt: `GOOGLE_CALENDAR_ICS_URL` for å overskrive standard-URLen i skriptet.

```bash
npm run sync:google-calendar
```

Skriptet bruker `slug` som unik nøkkel og gjør en `upsert`, så kjør det gjerne som et cron-jobb.

#### Automatisk cron i Vercel
Prosjektet har en API-route på `/api/google-calendar-sync` og en cron-konfig i `vercel.json` som kjører daglig kl. 03:00 (UTC).

For å få dette til å kjøre i produksjon:
1. Legg inn `SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` i Vercel (Production + Preview).
2. (Valgfritt) Sett `GOOGLE_CALENDAR_ICS_URL` hvis du vil overstyre kalender-URL.
3. Sett `CRON_SECRET`. Vercel Cron sender denne som `Authorization: Bearer <CRON_SECRET>`, og ruten støtter også `x-cron-secret` header eller `/api/google-calendar-sync?secret=...` for manuell testing.


### Supabase (milepæl 2)
- Kjør migrasjonen i `db/migrations/0001_init.sql` i Supabase SQL editor.
- Opprett en admin-bruker og sett rollen i `profiles` til `admin`.

### Vercel
- Legg inn miljøvariablene over i Vercel (Production + Preview).
- Sett preview-beskyttelse etter behov (Vercel project settings).

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
components/         # Delt UI
content/            # Midlertidig innhold/fixtures (senere)
db/                 # Migrasjoner og DB-scripts
  migrations/
lib/                # Delte util-funksjoner
public/             # Statiske assets
scripts/            # Migrering og vedlikehold
```

> Neste steg er datamodell, ruter og minimums-UI basert på scope.
