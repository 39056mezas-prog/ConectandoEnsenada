# ConectandoEnsenada.org — Product Roadmap
**Architecture:** v2.1 (locked) · **Updated:** August 2026

## Status Overview
| Phase | Sprint | Scope | Status |
|---|---|---|---|
| Setup | 2 | Monorepo, tooling | ✅ Complete |
| Setup | Brand | Assets, fonts, colors | ✅ Complete |
| Setup | DB | 15 SQL migrations | ✅ Written |
| Phase 1 | **3** | Business Directory + MapLibre | ✅ Complete |
| Phase 1 | **4** | Auth + Homepage + Tourism + Legal | ✅ Complete |
| Phase 1 | **5** | Events + News + Jobs + Sitemap | 📋 Next |
| Phase 1 | 6 | Admin panel + Moderation | 📋 Planned |
| Phase 2 | 7 | Marketplace + Real Estate + PWA | 📋 Planned |
| Phase 3 | 8 | AI Assistant (RAG + embeddings) | 📋 Planned |
| Phase 4 | 9 | Monetization (Premium plans) | 📋 Planned |
| Phase 5 | 10+ | Mobile app + Public API | 📋 Future |

---

## Sprint 5 — Events, News, Jobs, Sitemap
**Success criterion:** Users return weekly to check events and news.

### Events (/eventos)
- Listing with date/category filters + map
- Detail page with JSON-LD Event schema (Google Events integration)
- Submit form (authenticated users)
- "This weekend" section on homepage

### News (/noticias)
- Article listing + detail pages
- JSON-LD NewsArticle schema
- TipTap editor in admin
- Government RSS importer (Supabase Edge Function + cron)
  - Audit: ayuntamiento-ensenada.gob.mx portals first

### Jobs (/empleos)
- Listing with type/salary filters
- JSON-LD JobPosting schema
- Apply click counter (no CV storage)
- Only verified Pro+ businesses can post

### Sitemap + SEO
- /sitemap.xml — dynamic, all active places/events/articles
- /robots.txt — refined
- Google Search Console verification tag
- Structured data validation

### Email (Resend)
- Welcome email on signup
- "Your place is live" notification
- Contact form → admin notification

---

## Sprint 6 — Admin Panel + Moderation
**Success criterion:** Team can moderate all content without touching the database.

- /admin — protected, admin/super_admin only
- Moderation queue: pending places, reviews, listings, events, jobs
- One-click approve/reject with optional note
- Reports dashboard
- User management (view, change roles, ban)
- Analytics overview

---

## Sprint 7 — Marketplace + Real Estate + PWA
- /clasificados — classifieds (buyer contacts seller directly)
- /bienes-raices — real estate using Directory Template System
- Progressive Web App: manifest.json, service worker, offline fallback

---

## Sprint 8 — AI Assistant
**Prerequisites:** >100 places in DB
- Embedding pipeline: text-embedding-3-small → pgvector
- "Ensenada AI" chat (RAG: question → vector search → GPT-4o → answer)
- Bilingual (ES/EN auto-detect), rate limited via Upstash Redis
- /api/ai/chat — streaming route handler

---

## Sprint 9 — Monetization
**Prerequisites:** >50 registered businesses
- Plan upgrade flow: PayPal + MercadoPago + SPEI manual
- /dashboard — analytics, plan management, edit profile
- Premium enforcement: photos, jobs, featured ranking

### Pricing (suggested)
| Plan | MXN/mo |
|---|---|
| Free | $0 |
| Starter | $299 |
| Pro | $699 |
| Enterprise | Acordado |

---

## Sprint 10+ — Mobile + API
- React Native / Expo (reuses Turborepo shared packages)
- Push notifications, offline map tiles
- Public REST API (/api/v1/) with rate limiting + OpenAPI docs

---

## Infrastructure Scaling
| Stage | Traffic | Action |
|---|---|---|
| Launch | <10k/mo | Supabase Free + Vercel Hobby |
| Growth | 10k–100k/mo | Supabase Pro ($25/mo) |
| Scale | 100k–500k/mo | Add Meilisearch + Upstash |
| Enterprise | >500k/mo | Evaluate microservice extraction |

**Meilisearch migration trigger:** search quality complaints OR >10k places.

---

## Technical Debt
| Item | Priority | Sprint |
|---|---|---|
| Generate Supabase TS types after migrations | High | 5 |
| Replace RPC type assertions with generated types | High | 5 |
| Add Suspense boundaries to client-heavy pages | Medium | 6 |
| E2E tests (Playwright) for auth flows | Medium | 7 |
| apple-touch-icon.png — replace placeholder | Medium | Before launch |
| Internationalize Tourism/Legal pages (EN content) | Low | 7 |
