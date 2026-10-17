// Small, dependency-free formatting helpers (Intl only). Ensenada = America/Tijuana.
const TZ = 'America/Tijuana'

export function formatLongDate(date: Date, locale: string) {
  const s = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(date)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatShortDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(iso))
}

/** "hace 3 h" / "3h ago". Falls back to a short date after a week. */
export function timeAgo(iso: string, locale: string, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'es', { numeric: 'auto', style: 'short' })
  if (abs < 3600) return rtf.format(Math.round(diff / 60) || -1, 'minute')
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 7 * 86_400) return rtf.format(Math.round(diff / 86_400), 'day')
  return formatShortDate(iso, locale)
}

export function formatMoney(amount: number, currency: string | null, locale: string) {
  const cur = currency === 'USD' ? 'USD' : 'MXN'
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-MX', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount) + (cur === 'USD' ? ' USD' : '')
}

/** "2026-10-16T06:42" (local Ensenada time from Open-Meteo) → "6:42 a. m." */
export function formatClock(localIso: string | null, locale: string) {
  if (!localIso) return null
  const [h, m] = localIso.slice(11, 16).split(':').map(Number)
  if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return null
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, 0, 1, h, m)))
}

export function formatWeekday(dateIso: string, locale: string) {
  // dateIso is a calendar date (YYYY-MM-DD); format at noon UTC so the weekday never shifts.
  const s = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${dateIso}T12:00:00Z`))
  return s.replace('.', '').charAt(0).toUpperCase() + s.replace('.', '').slice(1)
}

export const num = (n: number, locale: string, digits = 0) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)

export function windCompass(deg: number) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8]!
}
