'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signInWithMagicLink } from '@/lib/auth/actions'
import type { MagicLinkState } from '@/lib/auth/actions'
import { AuthShell, Divider, GoogleIcon, authInputStyle } from '@/components/auth/AuthShell'

const INIT: MagicLinkState = {}

export default function RegistroPage() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const [state, formAction, pending] = useActionState(signInWithMagicLink, INIT)

  if (state.sent) return (
    <AuthShell>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.5rem' }}>¡Bienvenido!</h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Revisa tu correo y haz clic en el enlace de activación.</p>
      </div>
    </AuthShell>
  )

  return (
    <AuthShell title="Crear cuenta" subtitle="Únete a la comunidad de Ensenada">
      <div style={{ background: 'var(--color-navy-50)', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
        {['Agrega y gestiona tu negocio', 'Publica empleos y eventos', 'Deja reseñas de lugares'].map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-navy-600)', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>✓</span>{b}
          </div>
        ))}
      </div>
      <form action={async () => { await signInWithGoogle(next) }}>
        <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.6875rem 1rem', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--color-border)', background: '#fff', color: '#374151', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <GoogleIcon /> Registrarse con Google
        </button>
      </form>
      <Divider label="o con tu correo" />
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="reg-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>Correo electrónico</label>
          <input id="reg-email" name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" style={authInputStyle(!!state.fieldError)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = state.fieldError ? 'var(--color-error)' : 'var(--color-border)')} />
          {(state.fieldError ?? state.error) && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>{state.fieldError ?? state.error}</p>}
        </div>
        <button type="submit" disabled={pending} style={{ width: '100%', padding: '0.6875rem', borderRadius: 'var(--radius-full)', border: 'none', background: pending ? 'var(--color-text-tertiary)' : 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: pending ? 'wait' : 'pointer' }}>
          {pending ? 'Enviando…' : 'Crear cuenta gratis →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '1.25rem' }}>
        ¿Ya tienes cuenta?{' '}<Link href={`/login?next=${encodeURIComponent(next)}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Iniciar sesión</Link>
      </p>
    </AuthShell>
  )
}
