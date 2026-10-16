import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware navigation helpers.
 *
 * Use these instead of next/link and next/navigation so that:
 *  - links keep the visitor's language (/en/... stays English)
 *  - usePathname() returns the path WITHOUT the locale prefix, which is what
 *    the main menu needs to know which page is currently active.
 */
export const { Link, usePathname, useRouter, redirect } = createNavigation(routing)
