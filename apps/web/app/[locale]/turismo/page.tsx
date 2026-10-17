import type { Metadata } from 'next'
import { Wine, Umbrella, Fish, Mountain, Waves, Palette, UtensilsCrossed, ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { SeaWaves } from '@/components/layout/SeaWaves'

export const metadata: Metadata = {
  title: 'Turismo en Ensenada — Qué hacer, ver y disfrutar',
  description: 'Guía completa de turismo en Ensenada: playas, vino, gastronomía, aventura y cultura.',
}

const SECTIONS: { Icon: LucideIcon; title: string; description: string; href: string; cta: string; bg: string; highlights: string[] }[] = [
  { Icon: Wine, title: 'Valle de Guadalupe', description: 'La capital del vino mexicano a 30 min de Ensenada. 100+ bodegas, gastronomía de autor y paisajes únicos.', href: '/negocios?categoria=vino-bodegas', cta: 'Explorar bodegas', bg: 'linear-gradient(135deg, #4C1D95, #6D28D9)', highlights: ['100+ bodegas', 'Gastronomía de autor', 'Festivales de vino', 'Glamping y cabañas'] },
  { Icon: Umbrella, title: 'Playas del Pacífico', description: 'Kilómetros de costa con playas para todos los gustos: urbanas, remotas y de surf.', href: '/playas', cta: 'Ver playas', bg: 'linear-gradient(135deg, #0B3C6F, #1a6fa8)', highlights: ['Playa Hermosa', 'El Faro', 'La Bufadora', 'Punta Banda'] },
  { Icon: Fish, title: 'Gastronomía', description: 'Mariscos frescos del Pacífico, tacos de pescado y la mejor langosta estilo Puerto Nuevo.', href: '/restaurantes', cta: 'Ver restaurantes', bg: 'linear-gradient(135deg, #C2410C, #ea580c)', highlights: ['Mariscos frescos', 'Tacos de pescado', 'Langosta Puerto Nuevo', 'Cocina de autor'] },
  { Icon: Mountain, title: 'Aventura y Naturaleza', description: 'Rutas de senderismo, montañas, cañones y parques naturales a pocas horas.', href: '/negocios?q=senderismo', cta: 'Buscar rutas', bg: 'linear-gradient(135deg, #065F46, #059669)', highlights: ['Sierra Juárez', 'Cañón de Guadalupe', 'Observatorio', 'Kayak y buceo'] },
  { Icon: Waves, title: 'Vida Marina', description: 'Avistamiento de ballenas, lobos marinos, delfines y La Bufadora, el géiser marino más grande de América.', href: '/turismo', cta: 'Explorar', bg: 'linear-gradient(135deg, #0E7490, #0891b2)', highlights: ['Avistamiento de ballenas', 'La Bufadora', 'Buceo', 'Pesca deportiva'] },
  { Icon: Palette, title: 'Arte y Cultura', description: 'Museos, galerías, el Malecón histórico y una escena cultural vibrante.', href: '/noticias?categoria=cultura-news', cta: 'Más cultura', bg: 'linear-gradient(135deg, #7C3AED, #a855f7)', highlights: ['Museo de Historia', 'Malecón', 'Galerías de arte', 'Festivales'] },
]

export default function TurismoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)' }}>
      <section className="sea" style={{ padding: 'clamp(2.75rem, 6vw, 4.5rem) 0 clamp(6rem, 10vw, 8rem)' }}>
        <div className="sea-sun" aria-hidden="true" />
        <div className="container-app sea-content" style={{ maxWidth: '1280px' }}>
          <div style={{ maxWidth: '700px' }}>
            <h1 className="rise rise-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.125rem, 5.4vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem', textWrap: 'balance' }}>Ensenada, la ciudad que lo tiene todo</h1>
            <p className="rise rise-3" style={{ color: 'rgb(214 232 247 / 0.92)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '540px' }}>A solo 90 minutos de la frontera, Ensenada ofrece vino de clase mundial, playas del Pacífico, gastronomía de autor y aventura en la naturaleza.</p>
            <div className="rise rise-4" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/playas" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-full)' }}><Umbrella size={17} aria-hidden="true" /> Ver playas</Link>
              <Link href="/restaurantes" className="btn-ghost-light" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.75rem 1.375rem', borderRadius: 'var(--radius-full)' }}><UtensilsCrossed size={17} aria-hidden="true" /> Restaurantes</Link>
            </div>
          </div>
        </div>
        <SeaWaves next="var(--color-surface-raised)" />
      </section>
      <section style={{ padding: '1rem 0 3.5rem' }}>
        <div className="container-app">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.375rem, 2.4vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-navy-600)', marginBottom: '1.75rem' }}>Qué hacer en Ensenada</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {SECTIONS.map(({ Icon, title, description, href, cta, bg, highlights }) => (
              <div key={title} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)' }} className="tourism-card card">
                <div style={{ background: bg, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-inset-top)' }}>
                  <Icon aria-hidden="true" size={170} strokeWidth={1} style={{ position: 'absolute', right: -34, bottom: -34, color: 'rgb(255 255 255 / 0.14)' }} />
                  <div style={{ position: 'relative' }}>
                    <span aria-hidden="true" style={{ width: 48, height: 48, marginBottom: '0.875rem', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', background: 'rgb(255 255 255 / 0.18)', border: '1px solid rgb(255 255 255 / 0.3)', boxShadow: 'var(--shadow-inset-top)' }}><Icon size={24} strokeWidth={1.85} color="#fff" /></span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>{title}</h3>
                  </div>
                  <Link href={href} className="btn-ghost-light" style={{ position: 'relative', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>{cta} <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" /></Link>
                </div>
                <div style={{ padding: '1.75rem' }}>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>{description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {highlights.map(h => <span key={h} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy-600)', background: 'var(--color-navy-50)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-navy-100)' }}>{h}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`@media (max-width: 640px) { .tourism-card { grid-template-columns: 1fr !important; } } @media (hover: hover) { .tourism-card:hover { transform: translateY(-3px); } }`}</style>
    </div>
  )
}
