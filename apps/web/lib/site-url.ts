/**
 * The public site URL, always valid.
 *
 * `NEXT_PUBLIC_SITE_URL` is typed by hand in Vercel. A value like `conectandoensenada.org`
 * (no https://) made `new URL(...)` throw inside the root layout metadata, which turned EVERY
 * page into "Algo salió mal". Now we tolerate: missing protocol, quotes, spaces, trailing
 * slashes or paths, and fall back to the real domain if the value is unusable.
 */
export const DEFAULT_SITE_URL = 'https://www.conectandoensenada.org'

export function getSiteUrl(fallback: string = DEFAULT_SITE_URL): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/^["']+|["']+$/g, '').trim()
  if (!raw) return fallback
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    return new URL(withProtocol).origin
  } catch {
    return fallback
  }
}

/** True when the raw env value would have broken `new URL()` on its own. */
export function siteUrlNeedsFix(): boolean {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (!raw) return false
  try { new URL(raw); return false } catch { return true }
}
