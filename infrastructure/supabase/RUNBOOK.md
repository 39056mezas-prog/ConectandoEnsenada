# Database Setup Runbook

## How to run these migrations

### Option A — Supabase Dashboard (Recommended for beginners)

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **+ New query**
4. Paste the contents of each migration file **in order** and click **Run**

Run in this exact order:

| File | What it creates |
|---|---|
| `20260730000001_extensions.sql` | pgvector, pg_trgm, unaccent |
| `20260730000002_schemas_enums.sql` | 8 schemas + all enums |
| `20260730000003_profiles.sql` | profiles table + signup trigger |
| `20260730000004_categories.sql` | categories + tags + seed data |
| `20260730000005_places.sql` | directory.places (core table) |
| `20260730000006_place_extensions.sql` | business/beach/trail/real_estate details |
| `20260730000007_media_hours_reviews_reports.sql` | media, hours, reviews, reports |
| `20260730000008_content.sql` | articles (news CMS) |
| `20260730000009_listings.sql` | marketplace classifieds |
| `20260730000010_jobs.sql` | job board |
| `20260730000011_events.sql` | events calendar |
| `20260730000012_analytics_ai.sql` | analytics + AI embeddings |
| `20260730000013_ads.sql` | advertising (Phase 4 placeholder) |
| `20260730000014_indexes.sql` | all indexes + FTS columns |
| `20260730000015_functions.sql` | search, view counts, moderation |
| `20260730000016_security_hardening.sql` | lock down helper functions |

### Option B — Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref pdoznhmckwovmrerlcro

# Push all migrations
supabase db push
```

## Current live project

- Name: `conectando-ensenada` — ref `pdoznhmckwovmrerlcro` — region us-west-1
- URL: `https://pdoznhmckwovmrerlcro.supabase.co`
- All 16 migrations below are ALREADY applied to it. Only run them again on a brand-new project.

## After running migrations

0. **Settings → Data API → Exposed schemas**: add `directory, content, listings, jobs, events, moderation, ads`.
   Without this the app cannot read its own tables.

1. Go to **Authentication → Providers** → enable **Google**
2. Add your Google OAuth credentials
3. Set **Site URL** to `https://www.conectandoensenada.org`
4. Add these **Redirect URLs**: `http://localhost:3000/**`, `https://www.conectandoensenada.org/**`, `https://conectandoensenada.vercel.app/**`
5. Go to **Storage** → create bucket `places` (public)
6. Create bucket `listings` (public)
7. Create bucket `articles` (public)

## Verify it worked

Run this in the SQL Editor — should return counts:

```sql
SELECT
  (SELECT COUNT(*) FROM public.categories)    AS categories,
  (SELECT COUNT(*) FROM public.profiles)      AS profiles,
  (SELECT COUNT(*) FROM directory.places)     AS places;
```

Expected: `categories = 57`, `profiles = 0`, `places = 0`


## Vercel environment variables (Settings → Environment Variables, then redeploy)

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pdoznhmckwovmrerlcro.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key (`sb_publishable_...`, see `.env.example`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → secret key. NEVER commit it. |
| `NEXT_PUBLIC_SITE_URL` | `https://www.conectandoensenada.org` |

> **Important:** `NEXT_PUBLIC_*` variables are baked into the site when Vercel BUILDS it.
> After adding or changing any of them, go to Deployments → ⋯ on the latest deployment → **Redeploy**
> (untick "Use existing Build Cache"). Just saving the variable is not enough.
> Make sure each variable is enabled for the **Production** environment.


## After every Vercel deploy: open `/api/health`

Open `https://www.conectandoensenada.org/api/health` in the browser. It must say `"healthy": true`.
If not, `env.problems` tells you exactly which Vercel variable is wrong (wrong format, secret key in the
public slot, missing `https://`, …). Fix it in Vercel → Settings → Environment Variables (tick **Production**),
then redeploy **without** build cache.

## Publishing the first news / classifieds (until the admin panel exists)

The front page reads **published** articles and **active** classifieds. Until there is an admin screen,
add them in Supabase → SQL Editor. Replace every `<…>` with your real text (do not run the placeholders).

```sql
-- A news story (status must be 'published' to appear)
insert into content.articles (title_es, slug, excerpt_es, content_es, category_id, source_type, status, published_at, is_featured, featured_image)
values (
  '<Titular>', '<titular-en-minusculas-con-guiones>', '<Resumen de 1-2 líneas>',
  E'<Párrafo 1>\n\n<Párrafo 2>',
  (select id from public.categories where slug = 'local'),   -- local | gobierno-news | turismo-news | negocios-news | deportes-news | cultura-news
  'original', 'published', now(), false, null                 -- featured_image: URL of an image you have rights to, or null
);

-- A classified (seller_id = the id of a user in public.profiles; status 'active' to show)
insert into listings.listings (seller_id, title, slug, description, category_id, price, currency, contact_name, contact_whatsapp, neighborhood, city, status)
values (
  '<uuid-de-un-perfil>', '<Título>', '<titulo-con-guiones>', '<Descripción>',
  (select id from public.categories where slug = 'vehiculos'), -- vehiculos | electronica | muebles | ropa | herramientas | servicios-mkt | deportes-mkt | otro-mkt
  0, 'MXN', '<Nombre>', '<52646XXXXXXX>', '<Colonia>', 'Ensenada', 'active'
);
```
If you aggregate news from another outlet, set `source_type` to `aggregated`, fill `source_name` and `source_url`,
and write your own summary — the story page shows the credit and a link to the original.
