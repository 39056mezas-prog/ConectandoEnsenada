import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@ce/types'

/**
 * Creates a Supabase client for use in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * This client automatically handles cookie-based auth session.
 * It must be called inside an async function (cookies() is async in Next.js 15).
 *
 * Usage:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component.
            // Cookies can only be set in middleware or Route Handlers.
            // Auth session is refreshed in middleware — this is safe to ignore.
          }
        },
      },
    }
  )
}

// Static import is safe here — this file is only ever imported by server-side
// code (Server Components, Server Actions, Route Handlers). Next.js tree-shakes
// it from client bundles automatically when used correctly.
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with full database access.
 * Use ONLY in server-side code for admin operations.
 * NEVER expose service role key to the browser.
 *
 * Safety: This module must never be imported by Client Components.
 * If you see it in the client bundle, something is wrong.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
