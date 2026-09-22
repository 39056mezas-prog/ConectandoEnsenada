'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { signInWithMagicLink } from '@/lib/auth/actions'
import type { MagicLinkState } from '@/lib/auth/actions'
import { AuthShell, authInputStyle } from '@/components/auth/AuthShell'

const INIT: MagicLinkState = {}

export default function RecuperarPasswordPage() {
  const [state, formAction, pending] = useActionState(signInWithMagicLink, INIT)
  if (state.sent) return (
    <AuthShell>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.5rem' }}>Enlace enviado</h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Si tu correo está registrado, recibirás un enlace para acceder.</p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 600 }}>← Volver al inicio de sesión</Link>
      </div>
    </AuthShell>
  )
  return (
    <AuthShell title="Recuperar acceso" subtitle="Te enviamos un enlace de acceso sin contraseña">
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>Ingresa tu correo y te enviaremos un enlace de acceso instantáneo.</p>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label htmlFor="recovery-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>Correo electrónico</label>
          <input id="recovery-email" name="email" type="email" required placeholder="tu@correo.com" style={authInputStyle(!!state.fieldError)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = state.fieldError ? 'var(--color-error)' : 'var(--color-border)')} />
          {(state.fieldError ?? state.error) && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>{state.fieldError ?? state.error}</p>}
        </div>
        <button type="submit" disabled={pending} style={{ width: '100%', padding: '0.6875rem', border: 'none', borderRadius: 'var(--radius-full)', background: pending ? 'var(--color-text-tertiary)' : 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: pending ? 'wait' : 'pointer' }}>
          {pending ? 'Enviando…' : 'Enviar enlace de acceso →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '1.25rem' }}>
        <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>← Volver al inicio de sesión</Link>
      </p>
    </AuthShell>
  )
}
