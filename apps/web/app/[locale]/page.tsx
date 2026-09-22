import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { PlaceCard } from '@/components/directory/PlaceCard'
import type { PlaceSearchResult } from '@/modules/directory/types'

export const revalidate = 300

const CATEGORIES = [
  { emoji: '🏪', label: 'Negocios',     href: '/negocios' },
  { emoji: '🍽️', label: 'Restaurantes', href: '/restaurantes' },
  { emoji: '🌊', label: 'Turismo',      href: '/turismo' },
  { emoji: '🏖️', label: 'Playas',       href: '/playas' },
  { emoji: '🥾', label: 'Senderismo',   href: '/senderismo' },
  { emoji: '🎉', label: 'Eventos',      href: '/eventos' },
  { emoji: '📰', label: 'Noticias',     href: '/noticias' },
  { emoji: '💼', label: 'Empleos',      href: '/empleos' },
  { emoji: '📦', label: 'Clasificados', href: '/clasificados' },
  { emoji: '🏠', label: 'Bienes Raíces',href: '/bienes-raices' },
]

const TOURISM = [
  { emoji: '🍷', title: 'Valle de Guadalupe', subtitle: 'Capital del vino mexicano', href: '/turismo', bg: '#4C1D95' },
  { emoji: '🌊', title: 'Playas',             subtitle: 'Costa del Pacífico',        href: '/playas',  bg: '#0B3C6F' },
  { emoji: '🥾', title: 'Aventura',           subtitle: 'Rutas y naturaleza',        href: '/senderismo', bg: '#065F46' },
]

export default async function HomePage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: featuredData } = await (supabase.rpc as any)('search_places', { p_query: null, p_place_type: null, p_category_id: null, p_limit: 6, p_offset: 0 })
  const featured = (featuredData as unknown as PlaceSearchResult[]) ?? []

  return (
    <div style={{ background: 'var(--color-surface-raised)' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #041528 0%, #072240 40%, #0b3c6f 100%)', padding: '3.5rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 70%, rgba(42,171,226,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(42,171,226,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="container-app" style={{ position: 'relative', maxWidth: '720px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Image src="/logo.svg" alt="ConectandoEnsenada.org" width={320} height={56} priority style={{ height: '48px', width: 'auto' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1rem' }}>
            Tu ciudad.<br /><span style={{ color: 'var(--color-accent)' }}>Todo en un solo lugar.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '520px' }}>
            Negocios, turismo, eventos, empleos y más — todo lo que necesitas de Ensenada, Baja California.
          </p>
          <form action="/negocios" method="get" style={{ display: 'flex', gap: '0.5rem', maxWidth: '560px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.5" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input name="q" type="search" placeholder="Buscar negocios, playas, restaurantes…" style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingBlock: '0.75rem', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }} />
            </div>
            <button type="submit" style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Buscar</button>
          </form>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            {['Restaurantes','Playas','Vino','Turismo'].map(term => (
              <Link key={term} href={`/negocios?q=${term}`} style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>{term}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: 'var(--color-surface)', padding: '2.5rem 1.5rem' }}>
        <div className="container-app">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.25rem' }}>Explorar Ensenada</h2>
          <div style={{ width: '3rem', height: '3px', background: 'var(--color-accent)', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {CATEGORIES.map(({ emoji, label, href }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.125rem 0.875rem', background: 'var(--color-surface-raised)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.18s' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-navy-600)' }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: '2.5rem 1.5rem' }}>
        <div className="container-app">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.25rem' }}>Negocios destacados</h2>
              <div style={{ width: '3rem', height: '3px', background: 'var(--color-accent)', borderRadius: 'var(--radius-full)' }} />
            </div>
            <Link href="/negocios" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>Ver todos →</Link>
          </div>
          {featured.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--color-surface)', border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏪</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.5rem' }}>El directorio está creciendo</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>Sé el primero en registrar tu negocio en Ensenada.</p>
              <Link href="/negocios/nuevo" style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-full)' }}>+ Agregar mi negocio gratis</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {featured.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          )}
        </div>
      </section>

      {/* Tourism */}
      <section style={{ background: 'var(--color-navy-800)', padding: '2.5rem 1.5rem' }}>
        <div className="container-app">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Descubre Ensenada</h2>
          <div style={{ width: '3rem', height: '3px', background: 'var(--color-accent)', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {TOURISM.map(({ emoji, title, subtitle, href, bg }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ background: bg, borderRadius: 'var(--radius-xl)', padding: '2rem 1.5rem', cursor: 'pointer', transition: 'transform 0.2s', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: '#fff', marginBottom: '0.25rem' }}>{title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>{subtitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-accent)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container-app" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 800, color: '#fff', marginBottom: '0.625rem' }}>¿Tienes un negocio en Ensenada?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Registra tu negocio gratis y llega a más clientes locales y turistas.</p>
          <Link href="/negocios/nuevo" style={{ display: 'inline-block', background: '#fff', color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', padding: '0.875rem 2rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>+ Agregar mi negocio gratis →</Link>
        </div>
      </section>
    </div>
  )
}
