import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { routing } from '@/i18n/routing'

const handleI18nRouting = createMiddleware(routing)
const PROTECTED = ['/perfil', '/dashboard', '/negocios/nuevo']
const AUTH_ONLY  = ['/login', '/registro', '/recuperar-password']

function stripLocale(p: string) { return p.replace(/^\/en(\/|$)/, '/') || '/' }
function isProtected(p: string) { const s = stripLocale(p); return PROTECTED.some(r => s === r || s.startsWith(r + '/')) }
function isAuthOnly(p: string)  { const s = stripLocale(p); return AUTH_ONLY.some(r => s === r || s.startsWith(r + '/')) }

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request)
  const pathname = request.nextUrl.pathname
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // If Supabase env vars are missing (e.g. misconfigured deploy), keep public
  // pages alive instead of crashing every request. Protected routes still redirect to login.
  if (!supabaseUrl || !supabaseKey) {
    if (isProtected(pathname)) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', stripLocale(pathname))
      return NextResponse.redirect(url)
    }
    return response
  }
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    { cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cs: { name: string; value: string; options: CookieOptions }[]) {
        cs.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    }},
  )
  let user = null
  try {
    user = (await supabase.auth.getUser()).data.user
  } catch {
    user = null // Supabase unreachable: treat as signed out, don't crash the site
  }
  if (isProtected(pathname) && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', stripLocale(pathname))
    return NextResponse.redirect(url)
  }
  if (isAuthOnly(pathname) && user) return NextResponse.redirect(new URL('/', request.url))
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|logo.svg|og-default.png|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)'],
}
