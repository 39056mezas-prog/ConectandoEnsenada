import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─────────────────────────────────────────────────────────────────────────────
// Styling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merges Tailwind CSS class names safely.
 * Resolves conflicts (e.g. p-4 + p-8 → p-8).
 *
 * Usage: cn('text-red-500', isActive && 'font-bold', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────────────────────────────────────
// Strings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a string to a URL-safe slug.
 * Handles Spanish characters (á → a, ñ → n, etc.)
 *
 * Examples:
 *   "Bodega de Santo Tomás" → "bodega-de-santo-tomas"
 *   "La Bufadora Seafood & Grill" → "la-bufadora-seafood-grill"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .trim()
    .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens
}

/**
 * Truncates text to a maximum length, appending ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

/**
 * Capitalizes the first letter of each word.
 */
export function titleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a number as currency.
 * Defaults to MXN for local users.
 *
 * Examples:
 *   formatCurrency(299)              → "$299.00 MXN"
 *   formatCurrency(25, 'USD', 'en') → "$25.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'MXN',
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a date for display.
 * Uses locale-aware formatting.
 */
export function formatDate(
  date: string | Date,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, options)
}

/**
 * Returns a relative time string ("hace 2 días", "2 days ago").
 */
export function timeAgo(date: string | Date, locale: string = 'es'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffDays > 30) return formatDate(date, locale === 'es' ? 'es-MX' : 'en-US')
  if (diffDays > 0) return rtf.format(-diffDays, 'day')
  if (diffHours > 0) return rtf.format(-diffHours, 'hour')
  if (diffMins > 0) return rtf.format(-diffMins, 'minute')
  return rtf.format(-diffSecs, 'second')
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a Mexican RFC format (basic — not verified with SAT).
 * Accepts RFC for personas físicas (13 chars) and morales (12 chars).
 */
export function isValidRFC(rfc: string): boolean {
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i
  return rfcRegex.test(rfc.trim())
}

/**
 * Formats a Mexican phone number for display.
 * Input: "6461234567" → "(646) 123-4567"
 */
export function formatMexicanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// ─────────────────────────────────────────────────────────────────────────────
// URLs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a WhatsApp link from a phone number and optional message.
 */
export function whatsappUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const base = `https://wa.me/${cleaned}`
  if (message) return `${base}?text=${encodeURIComponent(message)}`
  return base
}

/**
 * Ensures a URL has a protocol prefix.
 */
export function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}
