# Sprint 4 Summary — Auth, Homepage, Tourism, Legal
**Build:** 31 pages · Types: ✅ · Lint: ✅ · Warnings: 0

## Files Created (25)
| File | Purpose |
|---|---|
| app/api/auth/callback/route.ts | Google OAuth code exchange |
| app/api/auth/confirm/route.ts | Email magic link verification |
| lib/auth/actions.ts | signInWithGoogle, signInWithMagicLink, signOut, updateProfile |
| components/auth/AuthShell.tsx | Shared auth layout, Divider, GoogleIcon, authInputStyle |
| components/auth/UserMenu.tsx | Live auth state — login button or avatar + dropdown |
| components/auth/index.ts | Barrel export |
| app/[locale]/login/page.tsx | Google OAuth + magic link |
| app/[locale]/registro/page.tsx | Registration with benefits |
| app/[locale]/recuperar-password/page.tsx | Passwordless recovery |
| app/[locale]/perfil/page.tsx | User profile (SSR) |
| app/[locale]/perfil/ProfileForm.tsx | Editable profile form |
| app/[locale]/page.tsx (rewritten) | Homepage redesign (Server Component, ISR 5min) |
| components/directory/DirectoryListing.tsx | Reusable parameterized listing |
| app/[locale]/turismo/page.tsx | Tourism landing — 6 curated sections |
| app/[locale]/playas/page.tsx | Beaches directory |
| app/[locale]/restaurantes/page.tsx | Restaurants directory |
| app/[locale]/privacidad/page.tsx | Privacy policy (LFPDPPP) |
| app/[locale]/terminos/page.tsx | Terms of service |
| app/[locale]/contacto/page.tsx | Contact form |
| app/[locale]/contacto/actions.ts | Contact server action |
| public/apple-touch-icon.png | 180×180 placeholder (TODO: replace) |

## Files Modified (5)
| File | Change |
|---|---|
| middleware.ts | Protected + auth-only route guards |
| components/layout/Header.tsx | Replaced login link with UserMenu |
| app/[locale]/layout.tsx | Added apple-touch-icon metadata + Header/Footer |
| components/directory/index.ts | Added DirectoryListing export |
| components/auth/index.ts | Added AuthShell exports |

## Key Decisions
1. **Passwordless auth only** — Google OAuth + magic link, no password hashing
2. **AuthShell in components/auth/** — Next.js forbids named exports from page files
3. **DirectoryListing eliminates duplication** — /playas, /restaurantes = 3 lines each
4. **Homepage as ISR Server Component** — search form is native HTML GET (SEO-friendly)
5. **apple-touch-icon.png** — valid PNG placeholder; replace with branded icon pre-launch

## Auth Flows
```
Google OAuth: signInWithGoogle() → Google → /api/auth/callback → session → next URL
Magic Link:   signInWithMagicLink() → email → /api/auth/confirm → session → next URL
Profile auto-created by DB trigger (handle_new_user) on first login
```

## Route Protection
```
PROTECTED (→ /login if unauthenticated): /perfil, /dashboard, /negocios/nuevo
AUTH_ONLY  (→ / if authenticated):       /login, /registro, /recuperar-password
```

## How to Test Locally
```bash
cd conectando-ensenada && pnpm install
cp .env.example apps/web/.env.local
# Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
# Run SQL migrations (see infrastructure/supabase/RUNBOOK.md)
# Enable Google OAuth in Supabase dashboard
pnpm dev  # → http://localhost:3000
```

## Sprint 5 Recommendation
Events (/eventos), News (/noticias), Jobs (/empleos), dynamic sitemap.
These unlock regular return visits from locals and SEO for time-sensitive content.
