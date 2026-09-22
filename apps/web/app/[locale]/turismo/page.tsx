import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Turismo en Ensenada — Qué hacer, ver y disfrutar',
  description: 'Guía completa de turismo en Ensenada: playas, vino, gastronomía, aventura y cultura.',
}

const SECTIONS = [
  { emoji: '🍷', title: 'Valle de Guadalupe', description: 'La capital del vino mexicano a 30 min de Ensenada. 100+ bodegas, gastronomía de autor y paisajes únicos.', href: '/negocios?categoria=vino-bodegas', cta: 'Explorar bodegas', bg: 'linear-gradient(135deg, #4C1D95, #6D28D9)', highlights: ['100+ bodegas', 'Gastronomía de autor', 'Festivales de vino', 'Glamping y cabañas'] },
  { emoji: '🏖️', title: 'Playas del Pacífico', description: 'Kilómetros de costa con playas para todos los gustos: urbanas, remotas y de surf.', href: '/playas', cta: 'Ver playas', bg: 'linear-gradient(135deg, #0B3C6F, #1a6fa8)', highlights: ['Playa Hermosa', 'El Faro', 'La Bufadora', 'Punta Banda'] },
  { emoji: '🦞', title: 'Gastronomía', description: 'Mariscos frescos del Pacífico, tacos de pescado y la mejor langosta estilo Puerto Nuevo.', href: '/restaurantes', cta: 'Ver restaurantes', bg: 'linear-gradient(135deg, #C2410C, #ea580c)', highlights: ['Mariscos frescos', 'Tacos de pescado', 'Langosta Puerto Nuevo', 'Cocina de autor'] },
  { emoji: '🥾', title: 'Aventura y Naturaleza', description: 'Rutas de senderismo, montañas, cañones y parques naturales a pocas horas.', href: '/senderismo', cta: 'Ver rutas', bg: 'linear-gradient(135deg, #065F46, #059669)', highlights: ['Sierra Juárez', 'Cañón de Guadalupe', 'Observatorio', 'Kayak y buceo'] },
  { emoji: '🐋', title: 'Vida Marina', description: 'Avistamiento de ballenas, lobos marinos, delfines y La Bufadora, el géiser marino más grande de América.', href: '/turismo', cta: 'Explorar', bg: 'linear-gradient(135deg, #0E7490, #0891b2)', highlights: ['Avistamiento de ballenas', 'La Bufadora', 'Buceo', 'Pesca deportiva'] },
  { emoji: '🎨', title: 'Arte y Cultura', description: 'Museos, galerías, el Malecón histórico y una escena cultural vibrante.', href: '/noticias', cta: 'Más cultura', bg: 'linear-gradient(135deg, #7C3AED, #a855f7)', highlights: ['Museo de Historia', 'Malecón', 'Galerías de arte', 'Festivales'] },
]

export default function TurismoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)' }}>
      <section style={{ background: 'linear-gradient(135deg, #041528 0%, #0b3c6f 100%)', padding: '3rem 1.5rem 3.5rem' }}>
        <div className="container-app" style={{ maxWidth: '700px' }}>
          <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Guía Turística</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1rem' }}>Ensenada, la ciudad que lo tiene todo</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '540px' }}>A solo 90 minutos de la frontera, Ensenada ofrece vino de clase mundial, playas del Pacífico, gastronomía de autor y aventura en la naturaleza.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/playas" style={{ display: 'inline-block', background: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)' }}>🏖️ Ver playas</Link>
            <Link href="/restaurantes" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)' }}>🍽️ Restaurantes</Link>
          </div>
        </div>
      </section>
      <section style={{ padding: '2.5rem 1.5rem' }}>
        <div className="container-app">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.25rem' }}>Qué hacer en Ensenada</h2>
          <div style={{ width: '3rem', height: '3px', background: 'var(--color-accent)', borderRadius: 'var(--radius-full)', marginBottom: '2rem' }} />
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {SECTIONS.map(({ emoji, title, description, href, cta, bg, highlights }) => (
              <div key={title} style={{ display: 'grid', gridTemplateColumns: '260px 1fr', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }} className="tourism-card">
                <div style={{ background: bg, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{emoji}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>{title}</h3>
                  </div>
                  <Link href={href} style={{ display: 'inline-block', marginTop: '1.25rem', background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1.5px solid rgba(255,255,255,0.3)' }}>{cta} →</Link>
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
      <style>{`@media (max-width: 640px) { .tourism-card { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
