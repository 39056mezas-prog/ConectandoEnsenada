# ConectandoEnsenada.org — Project Status
**Updated:** Sprint 4 complete — August 2026 | **Architecture:** v2.1 | **Branch:** main

## Build Status
| Check | Status |
|---|---|
| `pnpm type-check` | ✅ Zero errors |
| `pnpm build` | ✅ 31 pages, 0 warnings |
| `pnpm lint` | ✅ Zero errors |

## Routes (31 pages)
| Route | Type | Sprint |
|---|---|---|
| `/` | SSG ISR 5min | 4 |
| `/negocios` | SSG+Client | 3 |
| `/negocios/[slug]` | ISR 5min | 3 |
| `/negocios/nuevo` | SSG+Client | 3 |
| `/login` | SSG+Client | 4 |
| `/registro` | SSG+Client | 4 |
| `/recuperar-password` | SSG+Client | 4 |
| `/perfil` | SSG+SSR | 4 |
| `/turismo` | SSG | 4 |
| `/playas` | SSG+Client | 4 |
| `/restaurantes` | SSG+Client | 4 |
| `/privacidad` | SSG | 4 |
| `/terminos` | SSG | 4 |
| `/contacto` | SSG+Client | 4 |
| `/api/auth/callback` | Dynamic | 4 |
| `/api/auth/confirm` | Dynamic | 4 |
| `/en/*` | All above in English | — |

**Pending (Sprint 5+):** `/eventos` · `/noticias` · `/empleos` · `/clasificados`
`/senderismo` · `/bienes-raices` · `/dashboard` · `/admin`

## Infrastructure
| Service | Status | Action needed |
|---|---|---|
| Supabase DB | ⏳ Migrations pending | Run 15 SQL files per RUNBOOK.md |
| Supabase Auth | ⏳ OAuth pending | Enable Google in dashboard |
| Supabase Storage | ⏳ Pending | Create buckets: places, listings, articles |
| Vercel | ⏳ Pending | Connect repo after GitHub push |
| OpenFreeMap | ✅ Active | No key needed |
| Mapbox | 🗑️ Removed | Replaced by MapLibre |

## Deploy Checklist
- [ ] Run 15 SQL migrations (Supabase → SQL Editor)
- [ ] Enable Google OAuth (Supabase → Auth → Providers)
- [ ] Set Site URL: https://conectandoensenada.org
- [ ] Add localhost:3000 to redirect URLs
- [ ] Create storage buckets (places, listings, articles — all public)
- [ ] Push to GitHub → connect Vercel
- [ ] Add all env vars from .env.example to Vercel
- [ ] Replace apple-touch-icon.png with branded 180×180 icon

## Missing Assets
| Asset | Priority |
|---|---|
| `apple-touch-icon.png` branded version | Medium — placeholder exists |
| Google OAuth credentials | High — blocks auth |
| Mapbox token (optional) | Low — OpenFreeMap is default |
