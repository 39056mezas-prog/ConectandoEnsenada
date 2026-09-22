'use client'
import Link from 'next/link'
import { useActionState } from 'react'
import { submitContact } from './actions'

const SUBJECTS = ['Reportar un problema técnico','Agregar o corregir información','Solicitud de eliminación de cuenta','Consulta sobre planes premium','Propuesta de colaboración','Prensa y medios','Otro']
const inp: React.CSSProperties = { width: '100%', padding: '0.5625rem 0.875rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--color-text-primary)', background: 'var(--color-surface)', transition: 'border-color var(--transition-fast)' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>{label}</label>{children}</div>
}

export default function ContactoPage() {
  const [state, formAction, pending] = useActionState(submitContact, null)
  if (state?.success) return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>Mensaje recibido</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Gracias por contactarnos. Te responderemos en 1–3 días hábiles.</p>
        <Link href="/" style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>Volver al inicio</Link>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', paddingBlock: '3rem' }}>
      <div className="container-app" style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>Contacto</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>¿Tienes una pregunta o necesitas ayuda? Escríbenos.</p>
        </div>
        <div className="card" style={{ padding: '1.75rem' }}>
          {state?.error && <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: '#991B1B', marginBottom: '1.25rem' }}>{state.error}</div>}
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <Field label="Nombre *"><input name="name" type="text" required placeholder="Tu nombre" style={inp} onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} /></Field>
              <Field label="Correo *"><input name="email" type="email" required placeholder="tu@correo.com" style={inp} onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} /></Field>
            </div>
            <Field label="Asunto"><select name="subject" style={inp}>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="Mensaje *"><textarea name="message" required rows={5} placeholder="¿En qué podemos ayudarte?" style={{ ...inp, resize: 'vertical', minHeight: '120px' }} onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} /></Field>
            <button type="submit" disabled={pending} style={{ padding: '0.6875rem', background: pending ? 'var(--color-text-tertiary)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: pending ? 'wait' : 'pointer' }}>{pending ? 'Enviando…' : 'Enviar mensaje →'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
