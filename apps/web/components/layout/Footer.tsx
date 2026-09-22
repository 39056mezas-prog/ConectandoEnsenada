import Link from 'next/link'
import Image from 'next/image'

const FOOTER_LINKS = [
  { label: 'Negocios',    href: '/negocios'    },
  { label: 'Turismo',     href: '/turismo'     },
  { label: 'Playas',      href: '/playas'      },
  { label: 'Eventos',     href: '/eventos'     },
  { label: 'Noticias',    href: '/noticias'    },
  { label: 'Empleos',     href: '/empleos'     },
  { label: 'Clasificados',href: '/clasificados'},
  { label: 'Senderismo',  href: '/senderismo'  },
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
        background: 'var(--color-navy-800)',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 'auto',
      }}
    >
      {/* ── Main footer ─────────────────────────────────────────────────── */}
      <div
        className="container-app"
        style={{ padding: '3rem 1.5rem 2rem' }}
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
            <Image
              src="/logo.svg"
              alt="ConectandoEnsenada.org"
              width={220}
              height={40}
              style={{ height: '36px', width: 'auto', marginBottom: '1rem', opacity: 0.9 }}
            />
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '260px' }}>
              Tu ciudad. Todo en un solo lugar.
              La plataforma digital de Ensenada, Baja California.
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.5 }}>
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
                color: 'rgba(255,255,255,0.4)',
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
                color: 'rgba(255,255,255,0.4)',
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
              style={{
                display: 'inline-block',
                background: 'var(--color-accent)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              + Agregar negocio
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 1.5rem',
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
          <span style={{ opacity: 0.5 }}>
            © {year} ConectandoEnsenada.org — Ensenada, Baja California, México
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ color: 'rgba(255,255,255,0.45)', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
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
