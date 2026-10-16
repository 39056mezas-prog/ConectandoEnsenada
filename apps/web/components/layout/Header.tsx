'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu, X, Plus, Building2, Palmtree, UtensilsCrossed, Umbrella, CalendarDays, Newspaper, type LucideIcon } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { UserMenu } from '@/components/auth/UserMenu'
import { BrandLogo } from '@/components/brand/BrandLogo'

type NavItem = {
  key: 'businesses' | 'tourism' | 'restaurants' | 'beaches' | 'events' | 'news'
  href: string
  icon: LucideIcon
  /** sub-routes that belong to ANOTHER control (e.g. the "add business" button) */
  exclude?: string[]
}

const NAV_LINKS: NavItem[] = [
  { key: 'businesses',  href: '/negocios',     icon: Building2,       exclude: ['/negocios/nuevo'] },
  { key: 'tourism',     href: '/turismo',      icon: Palmtree },
  { key: 'restaurants', href: '/restaurantes', icon: UtensilsCrossed },
  { key: 'beaches',     href: '/playas',       icon: Umbrella },
  { key: 'events',      href: '/eventos',      icon: CalendarDays },
  { key: 'news',        href: '/noticias',     icon: Newspaper },
]

/** `pathname` has no locale prefix (next-intl strips it), so /en/playas → /playas. */
function isActive(pathname: string, { href, exclude = [] }: NavItem) {
  if (exclude.some(x => pathname === x || pathname.startsWith(x + '/'))) return false
  return pathname === href || pathname.startsWith(href + '/')
}

export function Header() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [ink, setInk] = useState<{ x: number; w: number } | null>(null)
  const [inkReady, setInkReady] = useState(false)

  const activeKey = NAV_LINKS.find(l => isActive(pathname, l))?.key

  // Frosted-glass header once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile drawer whenever the page changes.
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Measure the active link so the underline can glide to it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = activeKey ? linkRefs.current[activeKey] : null
      const track = trackRef.current
      if (!el || !track) { setInk(null); return }
      // inset the underline slightly so it sits inside the pill
      setInk({ x: el.offsetLeft + 12, w: Math.max(el.offsetWidth - 24, 12) })
    }
    measure()
    // first measurement is placed instantly; later ones animate
    const id = requestAnimationFrame(() => setInkReady(true))
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure) }
  }, [activeKey])

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', gap: '1rem' }}>
        <Link href="/" aria-label="ConectandoEnsenada.org — inicio" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-md)' }}>
          <BrandLogo tone="light" size={34} />
        </Link>

        <nav aria-label="Navegación principal" className="hidden-mobile">
          <div className="nav-track" ref={trackRef}>
            {NAV_LINKS.map(item => {
              const active = item.key === activeKey
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="nav-link"
                  aria-current={active ? 'page' : undefined}
                  ref={el => { linkRefs.current[item.key] = el }}
                >
                  {t(item.key)}
                </Link>
              )
            })}
            <span
              className="nav-ink"
              aria-hidden="true"
              style={{
                width: ink?.w ?? 0,
                transform: `translateX(${ink?.x ?? 0}px)`,
                opacity: ink ? 1 : 0,
                transitionDuration: inkReady ? undefined : '0ms',
              }}
            />
          </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Link
            href="/negocios/nuevo"
            className="hidden-mobile btn-accent"
            style={{ alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} strokeWidth={2.75} aria-hidden="true" /> {t('add_business')}
          </Link>
          <div className="hidden-mobile"><UserMenu loginLabel={t('login')} /></div>
          <button
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(o => !o)}
            className="show-mobile"
            style={{ background: 'rgb(255 255 255 / 0.10)', border: '1px solid rgb(255 255 255 / 0.18)', color: '#fff', cursor: 'pointer', width: 40, height: 40, placeItems: 'center', borderRadius: 'var(--radius-md)' }}
          >
            {mobileOpen ? <X size={20} strokeWidth={2.25} /> : <Menu size={20} strokeWidth={2.25} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Navegación móvil" className="drawer-in" style={{ background: 'var(--color-navy-800)', borderTop: '1px solid rgb(255 255 255 / 0.08)', padding: '0.75rem 1rem 1.25rem', boxShadow: '0 24px 40px -16px rgb(2 11 24 / 0.7)' }}>
          {NAV_LINKS.map(item => {
            const active = item.key === activeKey
            const Icon = item.icon
            return (
              <Link
                key={item.key}
                href={item.href}
                className="mobile-link"
                aria-current={active ? 'page' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: active ? '#fff' : 'rgb(255 255 255 / 0.82)', fontFamily: 'var(--font-display)', fontWeight: active ? 800 : 600, fontSize: '1rem', padding: '0.75rem 0.75rem', borderRadius: 'var(--radius-md)' }}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" color={active ? 'var(--color-cyan-300)' : 'currentColor'} />
                <span style={{ flex: 1 }}>{t(item.key)}</span>
                {active && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--color-accent)', boxShadow: '0 0 10px 1px rgb(42 171 226 / 0.9)' }} />}
              </Link>
            )
          })}
          <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/negocios/nuevo" className="btn-accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', padding: '0.8rem', borderRadius: 'var(--radius-lg)' }}>
              <Plus size={16} strokeWidth={2.75} aria-hidden="true" /> {t('add_business')}
            </Link>
            <Link href="/login" className="btn-ghost-light" style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', padding: '0.8rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              {t('login')}
            </Link>
          </div>
        </nav>
      )}
      <style>{'@media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } } @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: grid !important; } }'}</style>
    </header>
  )
}
