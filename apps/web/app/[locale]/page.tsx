import { Building2, UtensilsCrossed, Palmtree, Umbrella, Mountain, PartyPopper, Newspaper, Briefcase, Package, Home, Wine, Search, Plus, ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlaceCard } from '@/components/directory/PlaceCard'
import { SeaWaves } from '@/components/layout/SeaWaves'
import { BrandMark } from '@/components/brand/BrandLogo'
import type { PlaceSearchResult } from '@/modules/directory/types'

export const revalidate = 300

const CATEGORIES: { Icon: LucideIcon; label: string; href: string }[] = [
  { Icon: Building2,       label: 'Negocios',      href: '/negocios' },
  { Icon: UtensilsCrossed, label: 'Restaurantes',  href: '/restaurantes' },
  { Icon: Palmtree,        label: 'Turismo',       href: '/turismo' },
  { Icon: Umbrella,        label: 'Playas',        href: '/playas' },
  { Icon: Mountain,        label: 'Senderismo',    href: '/senderismo' },
  { Icon: PartyPopper,     label: 'Eventos',       href: '/eventos' },
  { Icon: Newspaper,       label: 'Noticias',      href: '/noticias' },
  { Icon: Briefcase,       label: 'Empleos',       href: '/empleos' },
  { Icon: Package,         label: 'Clasificados',  href: '/clasificados' },
  { Icon: Home,            label: 'Bienes Raíces', href: '/bienes-raices' },
]

const TOURISM: { Icon: LucideIcon; title: string; subtitle: string; href: string; bg: string }[] = [
  { Icon: Wine,     title: 'Valle de Guadalupe', subtitle: 'Capital del vino mexicano', href: '/turismo',    bg: 'linear-gradient(155deg, #6D28D9 0%, #4C1D95 55%, #2e1065 100%)' },
  { Icon: Umbrella, title: 'Playas',             subtitle: 'Costa del Pacífico',        href: '/playas',     bg: 'linear-gradient(155deg, #1a96cc 0%, #0B3C6F 60%, #072240 100%)' },
  { Icon: Mountain, title: 'Aventura',           subtitle: 'Rutas y naturaleza',        href: '/senderismo', bg: 'linear-gradient(155deg, #059669 0%, #065F46 60%, #022c22 100%)' },
]

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.375rem, 2.4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em', textWrap: 'balance' }

export default async function HomePage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: featuredData } = await (supabase.rpc as any)('search_places', { p_query: null, p_place_type: null, p_category_id: null, p_limit: 6, p_offset: 0 })
  const featured = (featuredData as unknown as PlaceSearchResult[]) ?? []

  return (
    <div style={{ background: 'var(--color-surface-raised)' }}>
      {/* Hero — living sea */}
      <section className="sea" style={{ padding: 'clamp(3rem, 7vw, 5.5rem) 0 clamp(6rem, 11vw, 8.5rem)' }}>
        <div className="sea-sun" aria-hidden="true" />
        <div className="hero-mark" aria-hidden="true"><BrandMark size={440} color="#fff" /></div>
        <div className="container-app sea-content" style={{ maxWidth: '1280px' }}>
          <div style={{ maxWidth: '720px' }}>
            <h1 className="rise rise-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.125rem', textWrap: 'balance' }}>
              Tu ciudad.<br /><span style={{ color: 'var(--color-cyan-300)' }}>Todo en un solo lugar.</span>
            </h1>
            <p className="rise rise-2" style={{ color: 'rgb(214 232 247 / 0.92)', fontSize: 'clamp(1rem, 2vw, 1.1875rem)', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '34rem' }}>
              Negocios, turismo, eventos, empleos y más — todo lo que necesitas de Ensenada, Baja California.
            </p>
            <form className="rise rise-3 hero-search" action="/negocios" method="get" role="search" style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', padding: '0.375rem', background: 'rgb(255 255 255 / 0.96)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-3), 0 0 0 6px rgb(255 255 255 / 0.10)' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={17} strokeWidth={2.25} aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
                <input name="q" type="search" aria-label="Buscar en Ensenada" placeholder="Buscar negocios, playas, restaurantes…" style={{ width: '100%', height: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingBlock: '0.75rem', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', background: 'transparent', color: 'var(--color-text-primary)' }} />
              </div>
              <button type="submit" className="btn-accent" style={{ border: 'none', borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Buscar</button>
            </form>
            <div className="rise rise-4" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              {['Restaurantes', 'Playas', 'Vino', 'Turismo'].map(term => (
                <Link key={term} href={`/negocios?q=${term}`} className="btn-ghost-light" style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0.3125rem 0.875rem', borderRadius: 'var(--radius-full)' }}>{term}</Link>
              ))}
            </div>
          </div>
        </div>
        <SeaWaves next="var(--color-surface)" />
      </section>

      {/* Categories */}
      <section style={{ background: 'var(--color-surface)', padding: '1.5rem 0 3.5rem' }}>
        <div className="container-app">
          <h2 style={{ ...h2, color: 'var(--color-navy-600)', marginBottom: '1.5rem' }}>Explorar Ensenada</h2>
          <div className="cat-grid">
            {CATEGORIES.map(({ Icon, label, href }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="tile" style={{ padding: '1.25rem 0.875rem 1.125rem', background: 'linear-gradient(180deg, #fff, var(--color-surface-raised))', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', textAlign: 'center', boxShadow: 'var(--shadow-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(150deg, var(--color-cyan-400), var(--color-navy-600))', boxShadow: 'var(--shadow-inset-top), 0 8px 16px -6px rgb(11 60 111 / 0.55)' }}>
                    <Icon size={22} strokeWidth={1.9} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-navy-600)' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container-app">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ ...h2, color: 'var(--color-navy-600)' }}>Negocios destacados</h2>
            <Link href="/negocios" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-cyan-700)', fontFamily: 'var(--font-display)' }}>Ver todos <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" /></Link>
          </div>
          {featured.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #fff, var(--color-surface-raised))', border: '1.5px dashed var(--color-border-strong)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-1)' }}>
              <span aria-hidden="true" style={{ width: 56, height: 56, margin: '0 auto 1rem', borderRadius: 'var(--radius-xl)', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(150deg, var(--color-cyan-400), var(--color-navy-600))', boxShadow: 'var(--shadow-2)' }}><Building2 size={26} strokeWidth={1.9} /></span>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-navy-600)', marginBottom: '0.5rem' }}>El directorio está creciendo</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Sé el primero en registrar tu negocio en Ensenada.</p>
              <Link href="/negocios/nuevo" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}><Plus size={16} strokeWidth={2.75} aria-hidden="true" /> Agregar mi negocio gratis</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {featured.map(place => <PlaceCard key={place.id} place={place} />)}
            </div>
          )}
        </div>
      </section>

      {/* Tourism */}
      <section className="sea" style={{ padding: '4.5rem 0 4rem' }}>
        <div className="container-app sea-content">
          <h2 style={{ ...h2, color: '#fff', marginBottom: '1.5rem' }}>Descubre Ensenada</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {TOURISM.map(({ Icon, title, subtitle, href, bg }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="tile" style={{ background: bg, borderRadius: 'var(--radius-2xl)', padding: '1.75rem', minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', border: '1px solid rgb(255 255 255 / 0.16)', boxShadow: 'var(--shadow-inset-top), 0 18px 36px -14px rgb(2 11 24 / 0.7)' }}>
                  <Icon aria-hidden="true" size={150} strokeWidth={1} style={{ position: 'absolute', right: -20, top: -18, color: 'rgb(255 255 255 / 0.13)' }} />
                  <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>{title}</div>
                  <div style={{ position: 'relative', fontSize: '0.9375rem', color: 'rgb(255 255 255 / 0.82)' }}>{subtitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(160deg, #52c4f0 0%, var(--color-cyan-400) 100%)', padding: '3.5rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container-app" style={{ maxWidth: '620px', position: 'relative' }}>
          <h2 style={{ ...h2, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>¿Tienes un negocio en Ensenada?</h2>
          <p style={{ color: 'var(--color-navy-800)', marginBottom: '1.75rem', lineHeight: 1.65 }}>Registra tu negocio gratis y llega a más clientes locales y turistas.</p>
          <Link href="/negocios/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(180deg, var(--color-navy-500), var(--color-navy-700))', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', padding: '0.875rem 2rem', borderRadius: 'var(--radius-full)', textDecoration: 'none', boxShadow: 'var(--shadow-3)' }}>
            <Plus size={18} strokeWidth={2.75} aria-hidden="true" /> Agregar mi negocio gratis
          </Link>
        </div>
      </section>
    </div>
  )
}
