# Starter Commerce CMS

Minimal Next.js 14 + Supabase starter that bundles a CMS, product information management, and simple commerce API into a single deployable app.

## Features

- Next.js 14 App Router with Tailwind styling and shadcn-inspired primitives
- Supabase Postgres schema with RLS, Auth, and seed data for pages, products, categories, and variants
- REST API covering content, PIM, cart, and orders suitable for a BFF adapter
- Admin dashboard with CRUD for pages, categories, products, and read-only order list
- Vitest-powered smoke tests for schemas and cart totals

## Quickstart

1. Create a Supabase project and copy the project URL + keys into `.env.local`.

   ```bash
   cp .env.example .env.local
   # fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
   ```

2. Run the SQL migration and seed scripts (requires a Supabase Postgres function `exec_sql` created by the migration).

   ```bash
   pnpm install
   pnpm db:migrate
   pnpm db:seed
   ```

3. Create an Auth user in Supabase and assign a role for dashboard access.

   ```sql
   insert into public.roles (user_id, role)
   values ('<user-uuid>', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```

4. Start the development server.

   ```bash
   pnpm dev
   ```

   Visit `http://localhost:3000/login` to sign in and reach the admin dashboard.

## API Overview

All endpoints live under `/api` and return JSON. Public GET endpoints include permissive CORS headers (`Access-Control-Allow-Origin: *`) and short-term caching (`Cache-Control: s-maxage=60`).

### Content

- `GET /api/content/pages?limit=&offset=` → `{ items: Page[], total }`
- `GET /api/content/pages/[slug]`
- `POST /api/content/pages` (auth: editor/admin)
- `PUT|PATCH /api/content/pages/[slug]` (auth)
- `DELETE /api/content/pages/[slug]` (auth)

### PIM

- `GET /api/pim/categories`
- `POST /api/pim/categories` (auth)
- `GET /api/pim/categories/[id]`
- `PUT|DELETE /api/pim/categories/[id]` (auth)
- `GET /api/pim/products?search=&category=&limit=&offset=`
- `GET /api/pim/products/[id]`
- `POST /api/pim/products` (auth)

### Commerce

- `POST /api/commerce/cart` → create or fetch cart bound to a session cookie
- `GET /api/commerce/cart` → current cart for session
- `POST /api/commerce/cart/items` → add/update line item
- `POST /api/commerce/orders` (auth) → convert cart to order
- `GET /api/commerce/orders` (auth) → list customer orders

Example response for `GET /api/pim/products/[id]`:

```json
{
  "id": "...",
  "sku": "TSHIRT-001",
  "name": "Starter Tee",
  "description": "Soft cotton tee",
  "brand": null,
  "attributes": {},
  "defaultImageUrl": "https://placehold.co/400x400",
  "categories": [
    { "id": "...", "name": "Apparel", "slug": "apparel" }
  ],
  "variants": [
    {
      "id": "...",
      "sku": "TSHIRT-001-VAR",
      "name": "Starter Tee Variant",
      "priceCents": 4999,
      "currency": "NOK",
      "stockQty": 50
    }
  ]
}
```

## Database

- Migration file: `db/migrations/0001_init.sql`
- Seed data: `db/seeds/seed.sql`
- Uses UUID primary keys, foreign keys, and timestamp triggers
- RLS policies restrict writes to `roles.role IN ('admin','editor')` while permitting anonymous read access for published content and products

### Extending the data model

- Add customer-specific pricing: introduce a `price_lists` table and join to `pim_variants`, then extend the `GET /api/pim/products/[id]` handler to select list-specific prices based on auth context.
- Introduce quotes: add `quotes` and `quote_items` tables mirroring the `orders` structure and expose `/api/commerce/quotes` endpoints.

## Auth & Security

- Supabase Auth handles email/password sign-in.
- `roles` table controls admin/editor dashboard access; public GET APIs do not expose the service role key.
- Route handlers validate payloads with Zod before writing to Supabase.
- RLS ensures carts and orders are scoped to either the anonymous session (for carts) or authenticated owner/admin.

## Scripts & Testing

- `pnpm dev` – start Next.js locally
- `pnpm build && pnpm start` – production build
- `pnpm db:migrate` / `pnpm db:seed` – execute SQL scripts against Supabase
- `pnpm test` – run Vitest unit tests

