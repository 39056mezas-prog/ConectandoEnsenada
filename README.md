# ConectandoEnsenada.org

**La plataforma digital más completa de Ensenada, Baja California.**

Directorio de negocios · Turismo · Eventos · Empleos · Noticias · Clasificados · IA

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google + Magic Link) |
| Storage | Supabase Storage |
| Search | Supabase FTS → Meilisearch (Phase 3) |
| Maps | Mapbox GL JS |
| AI | OpenAI GPT-4o + pgvector |
| Payments | PayPal + MercadoPago + SPEI |
| Email | Resend |
| Hosting | Vercel |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
conectando-ensenada/
├── apps/
│   └── web/              ← Next.js 15 application
├── packages/
│   ├── types/            ← Shared TypeScript types
│   └── config/           ← Shared TS/ESLint config
└── infrastructure/
    └── supabase/
        ├── migrations/   ← SQL migrations (versioned)
        ├── functions/    ← Supabase Edge Functions
        └── seed/         ← Seed data
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/conectando-ensenada.git
cd conectando-ensenada
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example apps/web/.env.local
# Fill in your Supabase URL, anon key, and Mapbox token
```

### 3. Run the development server

```bash
pnpm dev
# → http://localhost:3000
```

## Development

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Production build
pnpm type-check   # TypeScript check (no emit)
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Architecture

See [`/infrastructure/`](./infrastructure/) for database design.
See the v2.1 Architecture Document for the full technical spec.

## Roadmap

| Phase | Scope | Target |
|---|---|---|
| **1** | Infrastructure + Business Directory | Weeks 1–12 |
| **2** | Tourism, News, Events, Restaurants | Weeks 12–24 |
| **3** | Marketplace, Jobs, AI Assistant | Weeks 24–36 |
| **4** | Monetization (Premium Plans) | Weeks 36–48 |
| **5** | Mobile App, Public API | Month 12+ |

## Contributing

All content submitted by users enters a `pending` state and requires admin approval before going live. See the moderation module for details.

---

*Architecture v2.1 — July 2026*
