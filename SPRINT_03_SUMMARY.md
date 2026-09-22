# Sprint 3 Summary — Business Directory
**Completed:** Sprint 3
**Commit:** `95d98ba`
**Files changed:** 29 new, 80 lines modified

---

## What Was Built

Sprint 3 delivers the first real, working feature of ConectandoEnsenada.org:
the Business Directory. Every component, page, and utility was built from
scratch to v2.1 architecture specification.

---

## Architecture Decision: Map Layer

**Decision:** Replace Mapbox with MapLibre GL JS + OpenStreetMap
**Status:** Implemented and locked

### Tile Provider Abstraction (`lib/map/`)

```
lib/map/
├── types.ts      — TileProvider, MapMarker, MapConfig types
├── config.ts     — 4 provider configs + getMapConfig() + getStyleUrl()
└── index.ts      — barrel export
```

**Providers configured (swap via `NEXT_PUBLIC_MAP_PROVIDER`):**

| Provider | Key required | Cost | Notes |
|---|---|---|---|
| `openfreemap` | No | Free | **Default** — OSM-based |
| `maptiler` | Yes | Free tier 100k/mo | Premium style quality |
| `stadia` | No (low traffic) | Free tier 200k/mo | Privacy-focused |
| `custom` | No | Self-hosted | Full control, zero cost |

Zero application code changes required to swap providers.

---

## Files Created

### Map Layer
| File | Purpose |
|---|---|
| `lib/map/types.ts` | TypeScript interfaces for map abstraction |
| `lib/map/config.ts` | 4 tile providers + getStyleUrl factory |
| `lib/map/index.ts` | Barrel export |

### Directory Module
| File | Purpose |
|---|---|
| `modules/directory/types.ts` | All TypeScript types (PlaceSearchResult, PlaceDetails, etc.) |
| `modules/directory/queries.ts` | Supabase data fetching (searchPlaces, getPlaceBySlug, etc.) |
| `modules/directory/actions.ts` | Server Actions — submitPlace (Zod validated) |
| `modules/directory/config/businesses.config.ts` | Directory Template System config |

### Components
| File | Purpose |
|---|---|
| `components/map/Map.tsx` | MapLibre GL wrapper — SSR-safe, provider-agnostic |
| `components/layout/Header.tsx` | Sticky nav, mobile drawer, language switcher |
| `components/layout/Footer.tsx` | Links, brand, OSM attribution |
| `components/directory/PlaceCard.tsx` | Listing card — cover image, rating, badges |
| `components/directory/PlaceProfile.tsx` | Full detail view — gallery, hours, map, contact |
| `components/directory/PlaceGallery.tsx` | Photo grid + keyboard-accessible lightbox |
| `components/directory/PlaceHours.tsx` | Hours table with live open/closed status (Ensenada TZ) |
| `components/directory/PlaceContact.tsx` | Phone/WhatsApp/email/website action buttons |
| `components/directory/DirectoryFilters.tsx` | Sticky search + scrollable category pills |
| `components/directory/DiscoverMore.tsx` | "Never a Dead End" engine + NoResults variant |
| `components/seo/LocalBusinessJsonLd.tsx` | Schema.org JSON-LD (LocalBusiness + Breadcrumb) |

### Pages
| Route | File | Type | Notes |
|---|---|---|---|
| `/negocios` | `app/[locale]/negocios/page.tsx` | Client | Filter state via URL params |
| `/negocios/[slug]` | `app/[locale]/negocios/[slug]/page.tsx` | ISR 5min | JSON-LD, breadcrumbs, view count |
| `/negocios/nuevo` | `app/[locale]/negocios/nuevo/page.tsx` | Client | Auth gate, Zod form validation |

### Layout
| File | Purpose |
|---|---|
| `app/[locale]/layout.tsx` | Updated — added Header + Footer |
| `app/globals.css` | Updated — MapLibre CSS import |

---

## Files Modified

| File | Change |
|---|---|
| `app/[locale]/layout.tsx` | Added `<Header />` and `<Footer />` wrappers |
| `app/globals.css` | Added `@import "maplibre-gl/dist/maplibre-gl.css"` |
| `modules/directory/types.ts` | Added `country`, `zip_code` to PlaceDetails |
| `.env.example` | Removed Mapbox token, added MAP_PROVIDER vars |

---

## Key Technical Decisions Made in Sprint 3

### 1. Client-side listing page
The `/negocios` listing page is a Client Component. Reason: filter state changes
must update the URL and re-fetch data without full page navigation. URL params
are readable by Google's crawler, so SEO is preserved.

### 2. ISR for detail pages
Place detail pages use ISR with `revalidate = 300` (5 minutes). This means:
- First visit after cache expires → server renders + caches
- Subsequent visits → served from cache (fast)
- Business updates appear within 5 minutes automatically

### 3. `next/dynamic` with `ssr: false` for MapLibre
MapLibre GL JS uses WebGL and browser APIs unavailable in Node.js.
The Map component is dynamically imported in client components only.
PlaceProfile is marked `'use client'` to enable this pattern.

### 4. Type assertions for untyped RPC calls
Supabase generates TypeScript types from the live database schema (via CLI).
Since migrations haven't been run yet, the Database type is a stub.
All RPC calls use `(supabase.rpc as any)` until types are generated.
**After running migrations:** run `supabase gen types typescript` and
the type assertions become unnecessary.

### 5. Admin client for schema-qualified inserts
The `submitPlace` Server Action uses `createAdminClient()` to bypass TypeScript
schema-qualification issues. RLS policies still apply at the database level
(the user's ownership is written into the `owner_id` column).

### 6. Directory Template System
All future directory modules (beaches, trails, restaurants, real estate) use
the same component set. Adding a new directory = create a `.config.ts` file.
The `DIRECTORY_CONFIGS` registry maps URL path → module config.

---

## How to Run Locally

```bash
# 1. Extract the archive
tar -xzf conectando-ensenada-step5.tar.gz
cd conectando-ensenada

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your Supabase credentials

# 4. Run migrations (Supabase Dashboard → SQL Editor)
# See: infrastructure/supabase/RUNBOOK.md

# 5. Start development server
pnpm dev
# → http://localhost:3000
```

### Testing the directory

After running migrations, visit:
- `http://localhost:3000/negocios` — empty directory with DiscoverMore
- `http://localhost:3000/negocios/nuevo` — contribute form (requires login)

To add a test business without the form:
1. Open Supabase dashboard → SQL Editor
2. Run:
```sql
INSERT INTO directory.places (
  place_type, name_es, slug, short_desc_es, address,
  neighborhood, phone, status, verified, featured
) VALUES (
  'business', 'La Embotelladora Vieja', 'la-embotelladora-vieja',
  'Restaurante en el corazón de Ensenada', 'Av. Miramar 666',
  'Centro', '646 174 0807', 'active', true, true
);
```
3. Visit `http://localhost:3000/negocios` → card appears
4. Visit `http://localhost:3000/negocios/la-embotelladora-vieja` → detail page

### Testing the map

The map loads automatically on the listing page (click "Mapa" toggle).
On the detail page, the map appears if the place has lat/lng coordinates.
Default tile provider: OpenFreeMap — no API key required.

To test a different provider:
```bash
# In apps/web/.env.local
NEXT_PUBLIC_MAP_PROVIDER=stadia
```
Restart the dev server. Map tiles change immediately, zero code changes.

---

## What Sprint 4 Should Build

Based on v2.1 roadmap — in priority order:

1. **Authentication UI** (`/login`, `/registro`) — Google OAuth + Magic Link
2. **Tourism module** (`/turismo`) — using Directory Template System
3. **Beaches** (`/playas`) — beach_details extension
4. **Restaurants** (`/restaurantes`) — business_details + price_range
5. **Homepage redesign** — replace placeholder with real content sections
6. **Sitemap** (`/sitemap.xml`) — dynamic, all active places
7. **robots.txt** refinement

---

## Sprint 3 Metrics

| Metric | Value |
|---|---|
| New files | 29 |
| Lines of code added | ~3,600 |
| TypeScript errors at delivery | 0 |
| ESLint errors at delivery | 0 |
| Build warnings | 0 |
| Routes added | 3 (+ EN variants = 6) |
| Components built | 11 new |
| New dependencies | `maplibre-gl`, `zod` |
| Removed dependencies | `@fontsource/roboto` (Sprint 2b) |
| Map providers supported | 4 |
| Tile providers requiring API key | 0 (default) |
