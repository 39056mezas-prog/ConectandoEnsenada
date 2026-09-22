// ============================================================================
// lib/map/config.ts
// All tile provider configurations live here.
// Swap providers by changing MAP_PROVIDER env var — zero app code changes.
// ============================================================================

import type { TileProvider, TileProviderConfig, MapConfig } from './types'

// Ensenada, Baja California — default map center
export const ENSENADA_CENTER = { lat: 31.8675, lng: -116.5965 }
export const ENSENADA_DEFAULT_ZOOM = 12

export const TILE_PROVIDERS: Record<TileProvider, TileProviderConfig> = {
  /**
   * OpenFreeMap — free, OSM-based, no API key required.
   * Default for development and production MVP.
   * https://openfreemap.org
   */
  openfreemap: {
    name: 'OpenFreeMap',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    attribution:
      '© <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    requiresKey: false,
  },

  /**
   * MapTiler — premium tiles, requires API key.
   * Production upgrade option. Beautiful styles, fast CDN.
   * https://maptiler.com — free tier: 100k tiles/month
   */
  maptiler: {
    name: 'MapTiler',
    styleUrl: (key) =>
      `https://api.maptiler.com/maps/streets-v2/style.json?key=${key ?? ''}`,
    attribution:
      '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    requiresKey: true,
  },

  /**
   * Stadia Maps — OSM-based, privacy-focused, requires API key.
   * https://stadiamaps.com — free tier: 200k tiles/month
   */
  stadia: {
    name: 'Stadia Maps',
    styleUrl: (key) =>
      `https://tiles.stadiamaps.com/styles/alidade_smooth.json${key ? `?api_key=${key}` : ''}`,
    attribution:
      '© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    requiresKey: false, // works without key for low traffic
  },

  /**
   * Custom / Self-hosted — full control, zero cost at scale.
   * Run your own TileServer GL with OSM data.
   * Pass the style URL via customStyleUrl in MapConfig.
   */
  custom: {
    name: 'Self-hosted',
    styleUrl: (url) =>
      url ?? 'http://localhost:8080/styles/basic-preview/style.json',
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    requiresKey: false,
  },
}

/**
 * Resolves the active MapConfig from environment variables.
 * Override by setting NEXT_PUBLIC_MAP_PROVIDER in .env.local
 *
 * Defaults to 'openfreemap' — works with zero configuration.
 */
export function getMapConfig(): MapConfig {
  const provider =
    (process.env.NEXT_PUBLIC_MAP_PROVIDER as TileProvider) ?? 'openfreemap'

  return {
    provider,
    apiKey: process.env.NEXT_PUBLIC_MAP_API_KEY,
    customStyleUrl: process.env.NEXT_PUBLIC_MAP_CUSTOM_STYLE_URL,
  }
}

/**
 * Returns the resolved style URL for the active provider.
 * Called inside the Map component — browser only.
 */
export function getStyleUrl(config: MapConfig): string {
  const providerConfig = TILE_PROVIDERS[config.provider]
  const { styleUrl } = providerConfig

  if (typeof styleUrl === 'string') return styleUrl

  if (config.provider === 'custom') return styleUrl(config.customStyleUrl)
  return styleUrl(config.apiKey)
}
