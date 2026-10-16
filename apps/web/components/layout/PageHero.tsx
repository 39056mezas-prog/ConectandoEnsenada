import type { LucideIcon } from 'lucide-react'
import { SeaWaves } from './SeaWaves'

/**
 * PageHero — banner at the top of directory/section pages.
 * Sea-gradient with drifting waves; the icon sits in a raised glass tile
 * (a real icon, not an emoji) so every section has the same visual signature.
 */
export function PageHero({
  icon: Icon,
  title,
  subtitle,
  children,
  next,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children?: React.ReactNode
  /** colour of the section below, so the front wave blends into it */
  next?: string
}) {
  return (
    <section className="sea" style={{ padding: '2.25rem 0 5.25rem' }}>
      <div className="sea-sun" aria-hidden="true" />
      <div className="container-app sea-content" style={{ display: 'flex', alignItems: 'center', gap: '1.125rem' }}>
        <span
          className="rise rise-1"
          aria-hidden="true"
          style={{
            width: 56, height: 56, borderRadius: 'var(--radius-xl)', flexShrink: 0,
            display: 'grid', placeItems: 'center',
            background: 'linear-gradient(145deg, rgb(255 255 255 / 0.22), rgb(255 255 255 / 0.06))',
            border: '1px solid rgb(255 255 255 / 0.28)',
            boxShadow: 'var(--shadow-inset-top), 0 10px 24px -8px rgb(2 11 24 / 0.6)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Icon size={28} strokeWidth={1.75} color="#fff" />
        </span>
        <div>
          <h1 className="rise rise-2" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.625rem, 3.4vw, 2.375rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textWrap: 'balance' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="rise rise-3" style={{ color: 'rgb(214 232 247 / 0.9)', fontSize: '1rem', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && <div className="container-app sea-content rise rise-4" style={{ marginTop: '1.5rem' }}>{children}</div>}
      <SeaWaves next={next} />
    </section>
  )
}
