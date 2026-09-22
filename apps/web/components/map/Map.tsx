'use client'

// ============================================================================
// components/map/Map.tsx
// MapLibre GL JS wrapper — SSR-safe, provider-agnostic.
// Tile provider is read from environment via getMapConfig().
// To swap providers: change NEXT_PUBLIC_MAP_PROVIDER in .env.local.
// ============================================================================

import { useEffect, useRef, useCallback, useState } from 'react'
import { getMapConfig, getStyleUrl, ENSENADA_CENTER, ENSENADA_DEFAULT_ZOOM } from '@/lib/map'
import type { MapMarker } from '@/lib/map'

// Types only — no runtime import at module level (SSR-safe)
import type { Map as MaplibreMap, Marker as MaplibreMarker } from 'maplibre-gl'

interface MapProps {
  /** Map center coordinates */
  center?: { lat: number; lng: number }
  zoom?: number
  /** Array of place markers to render */
  markers?: MapMarker[]
  /** Called when a marker is clicked — receives the place slug */
  onMarkerClick?: (slug: string) => void
  /** Height of the map container */
  height?: string
  /** Whether the map is interactive (zoom, pan) */
  interactive?: boolean
  className?: string
}

export function Map({
  center = ENSENADA_CENTER,
  zoom = ENSENADA_DEFAULT_ZOOM,
  markers = [],
  onMarkerClick,
  height = '400px',
  interactive = true,
  className,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<MaplibreMap | null>(null)
  const markersRef   = useRef<MaplibreMarker[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const config   = getMapConfig()
  const styleUrl = getStyleUrl(config)

  // ── Initialize map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    // Dynamic import — runs only in browser, never on server
    import('maplibre-gl')
      .then(({ Map: MLMap, NavigationControl }) => {
        if (cancelled || !containerRef.current) return

        const map = new MLMap({
          container:   containerRef.current,
          style:       styleUrl,
          center:      [center.lng, center.lat],   // MapLibre uses [lng, lat]
          zoom,
          interactive,
          attributionControl: { compact: true },
        })

        map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

        map.on('load', () => {
          if (!cancelled) setLoaded(true)
        })

        map.on('error', (e) => {
          console.error('[Map] MapLibre error:', e)
          if (!cancelled) setError('No se pudo cargar el mapa.')
        })

        mapRef.current = map
      })
      .catch((err) => {
        console.error('[Map] Failed to load MapLibre:', err)
        if (!cancelled) setError('No se pudo cargar la librería de mapas.')
      })

    return () => {
      cancelled = true
      // Clean up markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      // Clean up map
      mapRef.current?.remove()
      mapRef.current = null
      setLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl, interactive])

  // ── Sync center/zoom when props change ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    map.flyTo({ center: [center.lng, center.lat], zoom, duration: 600 })
  }, [center.lat, center.lng, zoom, loaded])

  // ── Render markers ──────────────────────────────────────────────────────────
  const renderMarkers = useCallback(async () => {
    const map = mapRef.current
    if (!map || !loaded) return

    // Import MapLibre dynamically (already cached after first call)
    const { Marker, Popup } = await import('maplibre-gl')

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    markers.forEach((place) => {
      if (!place.lat || !place.lng) return

      // Custom marker element — branded pin
      const el = document.createElement('div')
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', place.name)
      el.style.cssText = `
        width: 32px; height: 40px;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(11,60,111,0.4));
        transition: transform 150ms ease, filter 150ms ease;
      `
      el.innerHTML = `
        <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z"
            fill="${place.active ? '#2AABE2' : '#0B3C6F'}"/>
          <circle cx="16" cy="16" r="7" fill="white"/>
        </svg>
      `
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)'
        el.style.filter = 'drop-shadow(0 4px 8px rgba(11,60,111,0.5))'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.filter = 'drop-shadow(0 2px 4px rgba(11,60,111,0.4))'
      })

      // Popup
      const popup = new Popup({
        closeButton: false,
        offset: 42,
        className: 'ce-map-popup',
        maxWidth: '220px',
      }).setHTML(`
        <div style="
          font-family: 'Manrope', sans-serif;
          padding: 0.375rem 0.125rem;
        ">
          <p style="
            font-weight: 700;
            font-size: 0.875rem;
            color: #0B1F36;
            margin: 0 0 0.25rem;
            line-height: 1.3;
          ">${place.name}</p>
          ${place.category ? `<p style="font-size:0.75rem;color:#3D5470;margin:0;">${place.category}</p>` : ''}
        </div>
      `)

      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map)

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(place.slug))
      }

      markersRef.current.push(marker)
    })

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const lngs = markers.map((m) => m.lng)
      const lats = markers.map((m) => m.lat)
      map.fitBounds(
        [
          [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
          [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
        ],
        { padding: 40, maxZoom: 15, duration: 500 }
      )
    }
  }, [markers, loaded, onMarkerClick])

  useEffect(() => {
    renderMarkers()
  }, [renderMarkers])

  // ── Render ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          height,
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          gap: '0.5rem',
          fontSize: '0.875rem',
        }}
        className={className}
      >
        <span style={{ fontSize: '1.5rem' }}>🗺️</span>
        <span>{error}</span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=14/${center.lat}/${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}
        >
          Ver en OpenStreetMap ↗
        </a>
      </div>
    )
  }

  return (
    <div
      style={{ position: 'relative', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      className={className}
    >
      {/* Map container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--color-navy-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <div
              style={{
                width: '32px', height: '32px', border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-accent)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem',
              }}
            />
            <p style={{ fontSize: '0.75rem' }}>Cargando mapa…</p>
          </div>
        </div>
      )}

      {/* OSM attribution note */}
      <style>{`
        .maplibregl-ctrl-attrib { font-size: 10px !important; }
        .ce-map-popup .maplibregl-popup-content {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(11,60,111,0.15) !important;
          padding: 0.625rem 0.875rem !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
