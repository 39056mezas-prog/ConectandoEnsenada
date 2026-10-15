import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@ce/types'

/**
 * Creates a Supabase client for use in Client Components ('use client').
 *
 * NOTE: NEXT_PUBLIC_* variables are baked into the browser bundle at BUILD
 * time. If they were missing when the site was built (e.g. added to Vercel
 * after the build), the site must be REDEPLOYED. Until then we fall back to a
 * placeholder so the page still renders (signed-out) instead of crashing.
 *
 * Usage:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('profiles').select('*')
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing at build time. Add them in Vercel and redeploy.'
    )
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  return createBrowserClient<Database>(url, key)
}
