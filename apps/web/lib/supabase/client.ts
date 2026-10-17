import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@ce/types'
import { PLACEHOLDER_KEY, PLACEHOLDER_URL, readSupabaseEnv } from './env'

/**
 * Creates a Supabase client for use in Client Components ('use client').
 *
 * NOTE: NEXT_PUBLIC_* variables are baked into the browser bundle at BUILD
 * time. If they were missing/invalid when the site was built, the site must be
 * REDEPLOYED. Until then we fall back to a placeholder so the page still renders
 * (signed-out) instead of crashing. Problems are listed at /api/health.
 *
 * Usage:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('profiles').select('*')
 */
export function createClient() {
  const env = readSupabaseEnv()
  if (!env.ok) {
    console.warn('[supabase] configuración inválida:', env.problems.join(' | '))
    return createBrowserClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY)
  }
  return createBrowserClient<Database>(env.url, env.key)
}
