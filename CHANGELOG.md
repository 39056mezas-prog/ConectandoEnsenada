# Changelog — ConectandoEnsenada.org

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
