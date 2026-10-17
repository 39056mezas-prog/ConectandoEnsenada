'use client'

import { Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'

const FOOTER_LINKS = [
  { label: 'Negocios',    href: '/negocios'    },
  { label: 'Turismo',     href: '/turismo'     },
  { label: 'Playas',      href: '/playas'      },
  { label: 'Noticias',    href: '/noticias'    },
  { label: 'Clasificados',href: '/clasificados'},
]

const LEGAL_LINKS = [
  { label: 'Privacidad',   href: '/privacidad'  },
  { label: 'Términos',     href: '/terminos'    },
  { label: 'Contacto',     href: '/contacto'    },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'radial-gradient(80% 120% at 90% 0%, rgb(42 171 226 / 0.14), transparent 60%), linear-gradient(180deg, var(--color-navy-800), var(--color-navy-900))',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 'auto',
        boxShadow: 'inset 0 1px 0 rgb(42 171 226 / 0.35)',
      }}
    >
      {/* ── Main footer ─────────────────────────────────────────────────── */}
      <div
        className="container-app"
        style={{ paddingTop: '3rem', paddingBottom: '2rem' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <BrandLogo tone="light" size={36} />
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '260px' }}>
              Tu ciudad. Todo en un solo lugar.
              La plataforma digital de Ensenada, Baja California.
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.7 }}>
              Datos del mapa © <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >OpenStreetMap</a> contributors
            </p>
          </div>

          {/* Directory links */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '1rem',
              }}
            >
              Explorar
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.65)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '1rem',
              }}
            >
              Para negocios
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Registra tu negocio y llega a más clientes en Ensenada. Es gratis.
            </p>
            <Link
              href="/negocios/nuevo"
              className="btn-accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Plus size={15} strokeWidth={2.75} aria-hidden="true" /> Agregar negocio
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 0',
        }}
      >
        <div
          className="container-app"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ opacity: 0.7 }}>
            © {year} ConectandoEnsenada.org — Ensenada, Baja California, México
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ color: 'rgba(255,255,255,0.65)', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
