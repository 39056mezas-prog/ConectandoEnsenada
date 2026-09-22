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

### Option B — Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref maacqnwwkkhgzjfcjirg

# Push all migrations
supabase db push
```

## After running migrations

1. Go to **Authentication → Providers** → enable **Google**
2. Add your Google OAuth credentials
3. Set **Site URL** to `https://conectandoensenada.org`
4. Add `http://localhost:3000` to **Redirect URLs** (for local dev)
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
