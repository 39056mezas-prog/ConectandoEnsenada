// ============================================================================
// modules/directory/config/businesses.config.ts
// Configuration for the Business Directory module.
// Add a new directory module = copy this file and adjust values.
// ============================================================================

import type { PlaceType } from '../types'

export interface DirectoryModuleConfig {
  /** Database place_type value */
  placeType: PlaceType
  /** URL path for this directory (no leading slash) */
  path: string
  /** Category module key (matches public.categories.module) */
  categoryModule: string
  /** i18n namespace key for page titles */
  titleKey: string
  /** JSON-LD Schema.org type */
  schemaType: string
  /** Emoji used in empty states and metadata */
  emoji: string
  /** Show hours in card? */
  showHours: boolean
  /** Show price range? */
  showPriceRange: boolean
  /** Allow user contributions? */
  allowContributions: boolean
  /** Require authentication to contribute? */
  requireAuth: boolean
  /** ISR revalidation in seconds */
  revalidate: number
}

export const businessesConfig: DirectoryModuleConfig = {
  placeType:          'business',
  path:               'negocios',
  categoryModule:     'businesses',
  titleKey:           'businesses',
  schemaType:         'LocalBusiness',
  emoji:              '🏪',
  showHours:          true,
  showPriceRange:     false,
  allowContributions: true,
  requireAuth:        true,
  revalidate:         300,   // 5 minutes
}

export const restaurantsConfig: DirectoryModuleConfig = {
  placeType:          'restaurant',
  path:               'restaurantes',
  categoryModule:     'restaurants',
  titleKey:           'restaurants',
  schemaType:         'Restaurant',
  emoji:              '🍽️',
  showHours:          true,
  showPriceRange:     true,
  allowContributions: true,
  requireAuth:        true,
  revalidate:         300,
}

export const beachesConfig: DirectoryModuleConfig = {
  placeType:          'beach',
  path:               'playas',
  categoryModule:     'beaches',
  titleKey:           'beaches',
  schemaType:         'TouristAttraction',
  emoji:              '🏖️',
  showHours:          false,
  showPriceRange:     false,
  allowContributions: true,
  requireAuth:        false,  // beaches can be contributed anonymously
  revalidate:         3600,   // 1 hour
}

export const trailsConfig: DirectoryModuleConfig = {
  placeType:          'trail',
  path:               'senderismo',
  categoryModule:     'trails',
  titleKey:           'trails',
  schemaType:         'TouristAttraction',
  emoji:              '🥾',
  showHours:          false,
  showPriceRange:     false,
  allowContributions: true,
  requireAuth:        false,
  revalidate:         3600,
}

// Registry: path → config (used by dynamic routes)
export const DIRECTORY_CONFIGS: Record<string, DirectoryModuleConfig> = {
  negocios:     businessesConfig,
  restaurantes: restaurantsConfig,
  playas:       beachesConfig,
  senderismo:   trailsConfig,
}
