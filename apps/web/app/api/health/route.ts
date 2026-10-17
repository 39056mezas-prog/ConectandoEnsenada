import { NextResponse } from 'next/server'
import { readSupabaseEnv } from '@/lib/supabase/env'
import { getSiteUrl, siteUrlNeedsFix } from '@/lib/site-url'

/**
 * GET /api/health — self-check for the deployment. Open it in the browser after a deploy.
 *
 * Reports (never prints secrets): whether the Supabase variables exist and look right, what
 * kind of key was pasted, and whether Supabase actually answers from the server.
 * Safe to leave in production; remove it if you prefer.
 */
export const dynamic = 'force-dynamic'

async function probe(url: string, init: RequestInit) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(6000), cache: 'no-store' })
    const text = await res.text()
    return { status: res.status, ok: res.ok, detail: res.ok ? undefined : text.slice(0, 200) }
  } catch (e) {
    return { status: 0, ok: false, detail: e instanceof Error ? e.message : String(e) }
  }
}

export async function GET() {
  const env = readSupabaseEnv()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const siteNeedsFix = siteUrlNeedsFix()
  const siteOk = !siteNeedsFix
  if (siteNeedsFix) env.problems.push(`NEXT_PUBLIC_SITE_URL ("${site}") debe empezar con https:// — el sitio la corrige solo, pero conviene arreglarla en Vercel.`)

  const report: Record<string, unknown> = {
    time: new Date().toISOString(),
    env: {
      supabaseUrlHost: env.url ? new URL(env.url).host : null,
      anonKeyKind: env.keyKind, // publishable | legacy-anon-jwt | secret | unknown | missing
      anonKeyLength: env.key.length,
      serviceRoleKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      siteUrlRaw: site || null,
      siteUrlUsed: getSiteUrl(),
      siteUrlValid: siteOk,
      problems: env.problems,
    },
  }

  if (env.ok) {
    const headers = { apikey: env.key, Authorization: `Bearer ${env.key}`, 'Content-Type': 'application/json' }
    report.supabase = {
      authHealth: await probe(`${env.url}/auth/v1/health`, { headers }),
      searchPlacesRpc: await probe(`${env.url}/rest/v1/rpc/search_places`, {
        method: 'POST', headers, body: JSON.stringify({ p_query: null, p_limit: 1, p_offset: 0 }),
      }),
    }
  }

  const supa = report.supabase as { authHealth: { ok: boolean }; searchPlacesRpc: { ok: boolean } } | undefined
  const healthy = env.ok && siteOk && !!supa?.authHealth.ok && !!supa?.searchPlacesRpc.ok
  return NextResponse.json({ healthy, ...report }, { status: healthy ? 200 : 503 })
}
