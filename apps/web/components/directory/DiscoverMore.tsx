import Link from 'next/link'

interface DiscoverMoreProps {
  title?: string
  subtitle?: string
  /** The module that was empty (e.g. 'negocios') */
  emptyModule?: string
  /** Label for the contribute CTA */
  contributeLabel?: string
  contributeHref?: string
}

const POPULAR_SECTIONS = [
  { emoji: '🏖️', label: 'Playas',       href: '/playas'      },
  { emoji: '🍽️', label: 'Restaurantes', href: '/restaurantes' },
  { emoji: '🎉', label: 'Eventos',       href: '/eventos'     },
  { emoji: '🗞️', label: 'Noticias',      href: '/noticias'   },
  { emoji: '🥾', label: 'Senderismo',    href: '/senderismo'  },
  { emoji: '🌊', label: 'Turismo',       href: '/turismo'     },
]

export function DiscoverMore({
  title = 'Descubre más en Ensenada',
  subtitle = 'Esta sección está creciendo. Mientras tanto, explora:',
  contributeLabel = '¿Conoces un lugar? Agrégalo gratis',
  contributeHref = '/negocios/nuevo',
}: DiscoverMoreProps) {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        maxWidth: '640px',
        marginInline: 'auto',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.375rem',
          fontWeight: 800,
          color: 'var(--color-navy-600)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
        {subtitle}
      </p>

      {/* Section pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.625rem',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        {POPULAR_SECTIONS.map(({ emoji, label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--color-navy-600)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-navy-600)'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'var(--color-navy-600)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-surface)'
              e.currentTarget.style.color = 'var(--color-navy-600)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Contribute CTA */}
      <div
        style={{
          background: 'var(--color-navy-50)',
          border: '1.5px dashed var(--color-navy-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--color-navy-600)',
            marginBottom: '0.75rem',
            fontSize: '1rem',
          }}
        >
          ¿Conoces un lugar en Ensenada?
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Ayúdanos a construir el directorio más completo de la ciudad.
          Agregar un lugar es gratis y toma menos de 2 minutos.
        </p>
        <Link
          href={contributeHref}
          style={{
            display: 'inline-block',
            background: 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            padding: '0.625rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            transition: 'opacity var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + {contributeLabel}
        </Link>
      </div>
    </div>
  )
}

// Compact inline variant — used inside search results
export function NoResults({ query }: { query?: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🔍</p>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>
        {query ? `Sin resultados para "${query}"` : 'Sin resultados'}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Prueba con un término diferente o{' '}
        <Link href="/negocios/nuevo" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
          agrega el negocio que buscas
        </Link>.
      </p>
    </div>
  )
}
