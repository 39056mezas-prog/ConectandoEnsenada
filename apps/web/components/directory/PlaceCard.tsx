import Link from 'next/link'
import Image from 'next/image'
import type { PlaceSearchResult } from '@/modules/directory/types'

interface PlaceCardProps {
  place: PlaceSearchResult
  categoryName?: string
  coverImage?: string | null
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={s <= stars ? '#F59E0B' : '#D1D5DB'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
        {rating > 0 ? `${rating.toFixed(1)} (${count})` : 'Sin reseñas'}
      </span>
    </div>
  )
}

export function PlaceCard({ place, categoryName, coverImage }: PlaceCardProps) {
  const isPremium = ['starter', 'pro', 'enterprise'].includes(place.plan_type)

  return (
    <Link
      href={`/negocios/${place.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="card"
        style={{
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        }}
      >
        {/* ── Cover image / placeholder ──────────────────────────────────── */}
        <div
          style={{
            height: '160px',
            background: coverImage
              ? 'transparent'
              : `linear-gradient(135deg, var(--color-navy-700), var(--color-navy-600))`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={place.name_es}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.25)',
                  userSelect: 'none',
                }}
              >
                {place.name_es.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Plan badge — only for featured/premium */}
          {place.featured && (
            <div
              style={{
                position: 'absolute', top: '0.5rem', left: '0.5rem',
                background: '#F59E0B', color: '#fff',
                fontSize: '0.6875rem', fontWeight: 700,
                fontFamily: 'var(--font-display)',
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              ★ Destacado
            </div>
          )}

          {/* Verified badge */}
          {place.verified && (
            <div
              style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem',
                display: 'flex', alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-accent)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          )}
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '1rem' }}>
          {/* Category */}
          {categoryName && (
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-display)',
              }}
            >
              {categoryName}
            </p>
          )}

          {/* Name */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-navy-600)',
              marginBottom: '0.375rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {place.name_es}
          </h3>

          {/* Short description */}
          {isPremium && place.short_desc_es && (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.5rem',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {place.short_desc_es}
            </p>
          )}

          {/* Rating */}
          <div style={{ marginBottom: '0.5rem' }}>
            <StarRating rating={place.avg_rating} count={place.review_count} />
          </div>

          {/* Address */}
          {place.address || place.neighborhood ? (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.25rem',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span style={{ lineHeight: 1.4 }}>
                {place.neighborhood ?? place.address}
              </span>
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
