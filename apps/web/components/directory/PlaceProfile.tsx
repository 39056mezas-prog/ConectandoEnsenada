'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { PlaceDetails } from '@/modules/directory/types'
import { PlaceGallery } from './PlaceGallery'
import { PlaceHours } from './PlaceHours'
import { PlaceContact } from './PlaceContact'
import { VerifiedBadge, FeaturedBadge } from '@/components/ui'

// Map is client-only — load without SSR
const Map = dynamic(() => import('@/components/map/Map').then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '280px',
        background: 'var(--color-navy-50)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-tertiary)', fontSize: '0.875rem',
      }}
    >
      Cargando mapa…
    </div>
  ),
})

interface PlaceProfileProps {
  place: PlaceDetails
  locale?: string
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1,2,3,4,5].map((s) => (
          <svg key={s} width="16" height="16" viewBox="0 0 24 24"
            fill={s <= filled ? '#F59E0B' : '#D1D5DB'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
        ({count} {count === 1 ? 'reseña' : 'reseñas'})
      </span>
    </div>
  )
}

export function PlaceProfile({ place, locale = 'es' }: PlaceProfileProps) {
  const p    = place.place
  const bd   = place.business_details
  const name = locale === 'en' && p.name_en ? p.name_en : p.name_es
  const desc = locale === 'en' && p.description_en ? p.description_en : p.description_es
  const hasMap = p.latitude && p.longitude

  const mapMarker = hasMap
    ? [{ id: p.id, slug: `negocios/${p.slug ?? ''}`, name: p.name_es, lat: p.latitude!, lng: p.longitude! }]
    : []

  return (
    <div>
      {/* ── Gallery ──────────────────────────────────────────────────────── */}
      {place.media && place.media.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <PlaceGallery media={place.media} placeName={p.name_es} />
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'inherit' }}>Inicio</Link>
          <span>›</span>
          <Link href="/negocios" style={{ color: 'inherit' }}>Negocios</Link>
          {place.category && (
            <>
              <span>›</span>
              <Link href={`/negocios?categoria=${place.category.slug}`} style={{ color: 'inherit' }}>
                {place.category.name_es}
              </Link>
            </>
          )}
        </nav>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
          {p.verified && <VerifiedBadge />}
          {p.featured && <FeaturedBadge />}
          {place.category && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--color-accent)',
              background: 'var(--color-cyan-50)',
              padding: '0.125rem 0.625rem',
              borderRadius: 'var(--radius-full)',
            }}>
              {place.category.name_es}
            </span>
          )}
        </div>

        {/* Name */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 800,
            color: 'var(--color-navy-600)',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          {name}
        </h1>

        {/* Rating */}
        <StarRating rating={p.avg_rating} count={p.review_count} />
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: '2rem',
          alignItems: 'start',
        }}
        className="place-layout"
      >
        {/* ── Left: Info ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>

          {/* Description */}
          {desc && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
                Acerca de
              </h2>
              <div
                style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: 'none' }}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </section>
          )}

          {/* Hours */}
          {place.hours && place.hours.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
                Horarios
              </h2>
              <PlaceHours hours={place.hours} />
            </section>
          )}

          {/* Business details chips */}
          {bd && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
                Información
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {bd.price_range && (
                  <Chip label={`Precio: ${bd.price_range}`} icon="💰" />
                )}
                {bd.accepts_cards && <Chip label="Acepta tarjetas" icon="💳" />}
                {bd.has_parking   && <Chip label="Estacionamiento" icon="🅿️" />}
                {bd.is_accessible && <Chip label="Accesible" icon="♿" />}
                {bd.year_founded  && <Chip label={`Desde ${bd.year_founded}`} icon="📅" />}
                {bd.cuisine_type && bd.cuisine_type.length > 0 && (
                  <Chip label={bd.cuisine_type.join(', ')} icon="🍽️" />
                )}
              </div>
            </section>
          )}

          {/* Address */}
          {(p.address || p.neighborhood) && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
                Ubicación
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0 }}>📍</span>
                <span>
                  {[p.address, p.neighborhood, p.city, p.state].filter(Boolean).join(', ')}
                </span>
              </p>
              {p.google_maps_url && (
                <a
                  href={p.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}
                >
                  Ver en Google Maps ↗
                </a>
              )}
            </section>
          )}

          {/* Social links */}
          {p.social_links && Object.keys(p.social_links).length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
                Redes sociales
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(p.social_links).map(([network, url]) => (
                  <a
                    key={network}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.375rem 0.875rem',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      textTransform: 'capitalize',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {network}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: Contact + Map ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Contact card */}
          <div
            className="card"
            style={{ padding: '1.25rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '1rem' }}>
              Contacto
            </h2>
            <PlaceContact
              phone={p.phone}
              whatsapp={p.whatsapp}
              email={p.email}
              website={p.website}
              name_es={p.name_es}
            />
          </div>

          {/* Map */}
          {hasMap && (
            <div>
              <Map
                center={{ lat: p.latitude!, lng: p.longitude! }}
                zoom={15}
                markers={mapMarker}
                height="280px"
                interactive={true}
              />
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginTop: '0.375rem', textAlign: 'right' }}>
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>OpenStreetMap</a> contributors
              </p>
            </div>
          )}

          {/* Report link */}
          <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            ¿Información incorrecta?{' '}
            <Link href={`/reportar?tipo=place&id=${p.id}`} style={{ color: 'var(--color-accent)' }}>
              Reportar
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive layout: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .place-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Chip({ label, icon }: { label: string; icon: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.3125rem 0.75rem',
      background: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8125rem',
      color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
