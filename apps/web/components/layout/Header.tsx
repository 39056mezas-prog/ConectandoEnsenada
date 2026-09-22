'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { UserMenu } from '@/components/auth/UserMenu'

const NAV_LINKS = [
  { key: 'businesses',  href: '/negocios' },
  { key: 'tourism',     href: '/turismo' },
  { key: 'restaurants', href: '/restaurantes' },
  { key: 'beaches',     href: '/playas' },
  { key: 'events',      href: '/eventos' },
  { key: 'news',        href: '/noticias' },
] as const

export function Header() {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1020, background: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(11,60,111,0.3)' }}>
      <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', gap: '1rem' }}>
        <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.svg" alt="ConectandoEnsenada.org" width={200} height={36} priority style={{ height: '32px', width: 'auto' }} />
        </Link>
        <nav aria-label="Navegación principal" className="hidden-mobile" style={{ display: 'flex', gap: '0.125rem', alignItems: 'center' }}>
          {NAV_LINKS.map(({ key, href }) => (
            <Link key={key} href={href} style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-display)', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast), color var(--transition-fast)', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)' }}>
              {t(key)}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Link href="/negocios/nuevo" className="hidden-mobile" style={{ background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
            + {t('add_business')}
          </Link>
          <div className="hidden-mobile"><UserMenu loginLabel={t('login')} /></div>
          <button aria-label="Abrir menú" onClick={() => setMobileOpen(o => !o)} className="show-mobile"
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.375rem', borderRadius: 'var(--radius-md)' }}>
            {mobileOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav style={{ background: 'var(--color-navy-700)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1rem 1rem' }}>
          {NAV_LINKS.map(({ key, href }) => (
            <Link key={key} href={href} onClick={() => setMobileOpen(false)} style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', padding: '0.625rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {t(key)}
            </Link>
          ))}
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/negocios/nuevo" onClick={() => setMobileOpen(false)} style={{ display: 'block', background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>+ {t('add_business')}</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', border: '1.5px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>{t('login')}</Link>
          </div>
        </nav>
      )}
      <style>{'@media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } } @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }'}</style>
    </header>
  )
}
