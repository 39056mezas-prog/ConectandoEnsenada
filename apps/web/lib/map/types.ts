// ============================================================================
// lib/map/types.ts
// Shared types for the map abstraction layer.
// ============================================================================

export type TileProvider = 'openfreemap' | 'maptiler' | 'stadia' | 'custom'

export interface TileProviderConfig {
  /** Human-readable name */
  name: string
  /** URL or factory function returning the MapLibre style JSON URL */
  styleUrl: string | ((keyOrUrl?: string) => string)
  /** Attribution text shown on the map */
  attribution: string
  /** Whether this provider requires an API key */
  requiresKey: boolean
}

export interface MapMarker {
  id: string
  slug: string
  name: string
  lat: number
  lng: number
  /** Optional: category for marker color */
  category?: string
  /** Optional: used to highlight the active marker */
  active?: boolean
}

export interface MapCenter {
  lat: number
  lng: number
}

export interface MapConfig {
  provider: TileProvider
  /** API key — required for maptiler / stadia */
  apiKey?: string
  /** Only used when provider is 'custom' */
  customStyleUrl?: string
}
