/**
 * Supabase environment — read ONCE, validated, never trusted blindly.
 *
 * Why this exists: a wrong value in Vercel (a trailing space, quotes, the URL of the REST
 * endpoint instead of the project URL, or the SECRET key pasted where the public key goes)
 * used to crash every page with "Algo salió mal". Now a bad value is reported (see
 * /api/health) and the site keeps rendering with empty data instead of crashing.
 *
 * NOTE: NEXT_PUBLIC_* must be referenced literally so Next.js can inline them at build time.
 */
export type KeyKind = 'publishable' | 'legacy-anon-jwt' | 'secret' | 'unknown' | 'missing'

export interface SupabaseEnv {
  url: string
  key: string
  ok: boolean
  keyKind: KeyKind
  problems: string[]
}

export const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
export const PLACEHOLDER_KEY = 'placeholder-key'

const clean = (v: string | undefined) => (v ?? '').trim().replace(/^["']+|["']+$/g, '').trim()

export function classifyKey(key: string): KeyKind {
  if (!key) return 'missing'
  if (key.startsWith('sb_secret_')) return 'secret'
  if (key.startsWith('sb_publishable_')) return 'publishable'
  if (key.split('.').length === 3 && key.startsWith('eyJ')) {
    // legacy JWT keys: payload has role "anon" or "service_role"
    try {
      const payload = JSON.parse(atob((key.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')))
      return payload.role === 'service_role' ? 'secret' : 'legacy-anon-jwt'
    } catch {
      return 'unknown'
    }
  }
  return 'unknown'
}

export function readSupabaseEnv(): SupabaseEnv {
  const rawUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const problems: string[] = []

  let url = ''
  if (!rawUrl) {
    problems.push('NEXT_PUBLIC_SUPABASE_URL está vacía o no existe.')
  } else {
    try {
      // Accept "https://xxx.supabase.co/" or ".../rest/v1" by keeping only the origin.
      const parsed = new URL(rawUrl)
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('protocol')
      url = parsed.origin
    } catch {
      problems.push('NEXT_PUBLIC_SUPABASE_URL no es una URL válida (debe empezar con https://).')
    }
  }

  const keyKind = classifyKey(key)
  if (keyKind === 'missing') problems.push('NEXT_PUBLIC_SUPABASE_ANON_KEY está vacía o no existe.')
  if (keyKind === 'secret')
    problems.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY contiene una llave SECRETA. Usa la llave pública (sb_publishable_…). La secreta nunca debe ir en una variable NEXT_PUBLIC.'
    )

  return { url, key, ok: problems.length === 0, keyKind, problems }
}
