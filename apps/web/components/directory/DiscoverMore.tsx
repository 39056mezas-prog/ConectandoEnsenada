'use client'

import { Umbrella, UtensilsCrossed, Package, Newspaper, Building2, Waves, SearchX, Plus, type LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface DiscoverMoreProps {
  title?: string
  subtitle?: string
  /** The module that was empty (e.g. 'negocios') */
  emptyModule?: string
  /** Label for the contribute CTA */
  contributeLabel?: string
  contributeHref?: string
}

const POPULAR_SECTIONS: { Icon: LucideIcon; label: string; href: string }[] = [
  { Icon: Umbrella,        label: 'Playas',       href: '/playas'      },
  { Icon: UtensilsCrossed, label: 'Restaurantes', href: '/restaurantes' },
  { Icon: Package,         label: 'Clasificados', href: '/clasificados' },
  { Icon: Newspaper,       label: 'Noticias',     href: '/noticias'    },
  { Icon: Building2,       label: 'Negocios',     href: '/negocios'    },
  { Icon: Waves,           label: 'Turismo',      href: '/turismo'     },
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
      <div aria-hidden="true" style={{ width: 64, height: 64, margin: '0 auto 1.25rem', borderRadius: 'var(--radius-xl)', display: 'grid', placeItems: 'center', background: 'linear-gradient(145deg, var(--color-cyan-50), var(--color-cyan-100))', boxShadow: 'var(--shadow-2)', color: 'var(--color-cyan-600)' }}>
        <Waves size={30} strokeWidth={1.75} />
      </div>

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
        {POPULAR_SECTIONS.map(({ Icon, label, href }) => (
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
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
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
          className="btn-accent"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            padding: '0.625rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
          }}
        >
          <Plus size={16} strokeWidth={2.75} aria-hidden="true" style={{ marginRight: 4, verticalAlign: '-2px' }} />{contributeLabel}
        </Link>
      </div>
    </div>
  )
}

// Compact inline variant — used inside search results
export function NoResults({ query }: { query?: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <SearchX size={28} strokeWidth={1.75} aria-hidden="true" style={{ margin: '0 auto 0.5rem', color: 'var(--color-text-tertiary)' }} />
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
