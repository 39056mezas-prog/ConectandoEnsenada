# Changelog — ConectandoEnsenada.org

## [Unreleased] — Newspaper front page ("EnsenadaHoy 2.0")

### Added
- **Front page rebuilt as a newspaper**: dated folio line + directory search, live ticker strip, lead story + secondary stories, "more news", USD→MXN panel (14-day sparkline + converter), weather (now, 5-day, °C/°F) and sea state (waves, period, water temp), classifieds band, house ad slots, featured businesses, explore tiles. Serif headlines (Newsreader) + Manrope for UI.
- `/noticias` (categories, pagination), `/noticias/[slug]` (NewsArticle JSON-LD, source attribution), `/clasificados` (search, categories, pagination) and `/clasificados/[slug]` (photos, WhatsApp/call/email, safety note).
- Migration `20260730000017_frontpage_feeds.sql`: read-only public RPCs `news_feed`, `news_article`, `classifieds_feed`, `classified_detail` (SECURITY INVOKER, so existing RLS decides visibility; contact data only in the detail function). Already applied to the live project.
- `lib/live/fx.ts` (Frankfurter / ECB reference rate) and `lib/live/weather.ts` (Open-Meteo forecast + marine). Every source fails safe: a down API hides its widget, never the page. Optional `OPEN_METEO_API_KEY` switches to the paid commercial hosts.
- `FRONT_DEMO=1` shows clearly-labelled sample content while the database is empty (preview only).
- `front` namespace in `messages/es.json` and `messages/en.json`.

### Changed
- Menu: "Eventos" replaced by "Clasificados". Removed links to pages that do not exist yet (Eventos, Empleos, Senderismo) from the footer and the "discover more" block; tourism cards re-pointed to working pages.

## [Unreleased] — Logo fix + production crash hardening

### Fixed
- **Logo**: the mark is now traced from the owner's ORIGINAL logo PNG (`components/brand/mark-path.ts`) instead of a hand-drawn approximation. Same pin, hollow, anchor and eye. Also `public/logo-mark.svg` (white) and `public/logo-mark-navy.svg`; `apple-touch-icon.png` regenerated from it.
- **"Algo salió mal" on every page in production**: reproduced locally. A `NEXT_PUBLIC_SITE_URL` without `https://` (e.g. `conectandoensenada.org`) made `new URL()` throw in the root layout metadata. New `lib/site-url.ts` normalises it (adds https, strips quotes/paths, falls back to the real domain).
- Invalid Supabase env values (secret key pasted into the public key variable, URL with `/rest/v1`, quotes/spaces) no longer crash pages: `lib/supabase/env.ts` validates and normalises; server, browser and middleware clients fall back to a harmless placeholder.
- Homepage featured list uses a cookie-free client (`createPublicClient`) so the page is cached/ISR as intended, and a failed query shows the empty state instead of an error.

### Added
- `GET /api/health`: deployment self-check (env present/valid, key type, Supabase reachable, `search_places` works). Never prints secrets.
- Error pages show a collapsible "Detalles técnicos" (message + digest) and there is now an `app/global-error.tsx` for root-layout failures.

## [Unreleased] — Living Coast redesign

### Added
- `BrandLogo` / `BrandMark` (`components/brand/BrandLogo.tsx`): inline-SVG pin-and-anchor mark matching `favicon.ico`, plus live-text wordmark in Manrope. Replaces the 1800px-wide `logo.svg` in header, footer, login/register and homepage (that file rendered as unreadable tiny text, and its navy pin vanished on the navy header). `public/logo-mark.svg` is a standalone copy of the mark.
- Active-page indicator in the main menu (desktop + mobile): highlighted pill, `aria-current="page"`, and a glowing underline that glides between items. Locale-aware (`/en/playas` ⇒ Beaches) and nested-route aware (`/negocios/[slug]` keeps Businesses active; `/negocios/nuevo` does not).
- `i18n/navigation.ts`: next-intl `Link`/`usePathname` helpers. All internal links now keep the visitor's language.
- `PageHero` + `SeaWaves`: shared layered sea hero (drifting parallax waves, glow, grain) used on directory pages, tourism and the homepage.
- Depth system in `globals.css`: layered navy-tinted shadow scale, lifting `.card`/`.tile`, `.btn-accent`, `.btn-ghost-light`, frosted-glass sticky header on scroll, themed selection/scrollbar/focus ring, reduced-motion support.
- Branded `apple-touch-icon.png` (white mark on navy) replacing the solid-navy placeholder.

### Changed
- Emoji used as icons replaced with lucide icons across homepage, directory, tourism and menus.
- Accent buttons use navy text on cyan (white on `#2AABE2` was 2.6:1); tertiary text darkened to meet 4.5:1.
- Content gutters aligned with the header at every breakpoint; search placeholder now matches the section (beaches, restaurants…).
- Removed the "Guía Turística" eyebrow label above the tourism headline.

## [Unreleased] — Deploy fix + new Supabase project

### Fixed
- Every page returned 500: `Footer`, `DiscoverMore`, `PlaceCard`, `PlaceContact` use event handlers and are now Client Components.
- Browser crash ("Application error: a client-side exception") when `NEXT_PUBLIC_SUPABASE_*` were missing at build time: `lib/supabase/client.ts` now falls back to a placeholder instead of throwing.
- Middleware no longer crashes when Supabase env vars are missing or Supabase is unreachable.

### Changed
- Supabase project is now `pdoznhmckwovmrerlcro` (`.env.example`, RUNBOOK updated).
- SQL migrations rewritten to match what is deployed (security fixes, immutable `f_unaccent` for FTS, HNSW vector index, API grants). Added migration 016.
- `.env.example`: Mapbox variables replaced with MapLibre provider variables.
- Added `.gitignore`, `.prettierrc.json`; removed committed `tsconfig.tsbuildinfo`.

## [0.4.0] — Sprint 4 — August 2026
### Added
- Auth system: Google OAuth + email magic link (passwordless)
- Protected routes: /perfil, /dashboard, /negocios/nuevo
- Auth-only redirect for /login, /registro, /recuperar-password
- User profile page with edit form and submitted places list
- Homepage redesign: hero search, category grid, featured places, tourism, CTA
- Tourism landing page (/turismo) — 6 curated sections
- Beaches directory (/playas) using DirectoryListing
- Restaurants directory (/restaurantes) using DirectoryListing
- DirectoryListing — reusable parameterized component (eliminates page duplication)
- Legal pages: /privacidad, /terminos, /contacto
- apple-touch-icon.png placeholder (180×180, navy #0B3C6F)
- UserMenu component — live auth state in header

### Changed
- Header: replaced static login link with UserMenu
- Middleware: added route protection and auth-only guards
- Layout: added apple-touch-icon metadata

## [0.3.0] — Sprint 3 — August 2026
### Added
- MapLibre GL JS replacing Mapbox (open source, zero vendor lock-in)
- Map abstraction: 4 tile providers (OpenFreeMap default, MapTiler, Stadia, custom)
- Business Directory (/negocios) — listing, filters, map toggle
- Business detail pages (/negocios/[slug]) — ISR, JSON-LD, full profile
- Contribute form (/negocios/nuevo) — Zod validation, auth gate
- Header + Footer
- PlaceCard, PlaceProfile, PlaceGallery, PlaceHours, PlaceContact
- DirectoryFilters, DiscoverMore, LocalBusinessJsonLd
- Directory Template System (add new directory = one config file)

### Removed
- Mapbox GL JS and all proprietary map dependencies

## [0.2.0] — Database — August 2026
### Added
- 15 SQL migration files: 9 schemas, 26 tables, 8 enums, full RLS
- pgvector for AI embeddings, FTS indexes, 57 seed categories
- 6 utility functions, auto-create profile trigger, rating refresh trigger

## [0.1.1] — Brand — August 2026
### Added
- logo.svg, favicon.ico, og-default.png
- Design tokens: navy #0B3C6F, cyan #2AABE2
- Manrope font (self-hosted via @fontsource)

## [0.1.0] — Setup — August 2026
### Added
- Turborepo monorepo, Next.js 15, TypeScript 5, Tailwind CSS 4
- Supabase SSR clients, next-intl ES/EN routing
- Base UI components, translation files
