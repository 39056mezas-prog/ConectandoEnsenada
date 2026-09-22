import { defineRouting } from 'next-intl/routing'

/**
 * Routing strategy:
 * - Spanish (default): no prefix → /negocios/[slug]
 * - English: /en/ prefix → /en/businesses/[slug]
 *
 * This keeps Spanish URLs clean (most traffic) while English
 * remains accessible for tourists.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
})

export type Routing = typeof routing
