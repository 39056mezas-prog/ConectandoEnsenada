'use client'

// ============================================================================
// app/[locale]/negocios/nuevo/page.tsx
// Contribute form — submit a new business for review.
// Requires authentication. Uses Server Action for submission.
// ============================================================================

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { submitPlace } from '@/modules/directory/actions'
import type { SubmitPlaceState } from '@/modules/directory/actions'
import { createClient } from '@/lib/supabase/client'

const INITIAL_STATE: SubmitPlaceState = { success: false }

const PLACE_TYPES = [
  { value: 'business',     label: '🏪 Negocio general' },
  { value: 'restaurant',   label: '🍽️ Restaurante / Café' },
  { value: 'attraction',   label: '🎡 Atractivo turístico' },
  { value: 'organization', label: '🏢 Organización / ONG' },
] as const

export default function NuevoNegocioPage() {
  const [state, formAction, pending] = useActionState(submitPlace, INITIAL_STATE)
  const [authed, setAuthed] = useState<boolean | null>(null)

  // Check auth status client-side
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user))
  }, [])

  // Show success screen
  if (state.success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
            ¡Enviado con éxito!
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {state.message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/negocios" style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
              Ver directorio
            </Link>
            <Link href="/negocios/nuevo" style={{ display: 'inline-block', border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600, padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
              Agregar otro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Auth loading
  if (authed === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not authenticated
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.75rem' }}>
            Inicia sesión para continuar
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Necesitas una cuenta para agregar un negocio al directorio.
            Es gratis y toma menos de un minuto.
          </p>
          <Link href="/login?next=/negocios/nuevo" style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', paddingBlock: '2rem' }}>
      <div className="container-app" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/negocios" style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
            ← Volver al directorio
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>
            Agregar un lugar
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Tu envío será revisado por nuestro equipo antes de publicarse. Gratis.
          </p>
        </div>

        {/* Error message */}
        {state.message && !state.success && (
          <div style={{ padding: '0.875rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#991B1B' }}>
            {state.message}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Type */}
          <Field label="Tipo de lugar *" error={state.errors?.place_type?.[0]}>
            <select name="place_type" required style={inputStyle}>
              {PLACE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          {/* Name */}
          <Field label="Nombre del lugar *" error={state.errors?.name_es?.[0]}>
            <input name="name_es" type="text" required placeholder="Ej. Bodega de Santo Tomás" style={inputStyle} />
          </Field>

          {/* Short description */}
          <Field label="Descripción breve" hint="Máx. 160 caracteres — aparece en el directorio">
            <input name="short_desc_es" type="text" maxLength={160} placeholder="Una línea que describa el lugar" style={inputStyle} />
          </Field>

          {/* Full description */}
          <Field label="Descripción completa">
            <textarea name="description_es" rows={4} placeholder="Cuéntanos más sobre este lugar..." style={{ ...inputStyle, resize: 'vertical' as const, minHeight: '100px' }} />
          </Field>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Address */}
          <Field label="Dirección">
            <input name="address" type="text" placeholder="Calle, número, colonia" style={inputStyle} />
          </Field>

          {/* Neighborhood */}
          <Field label="Colonia / Zona">
            <input name="neighborhood" type="text" placeholder="Ej. Centro, Zona Río, El Sauzal" style={inputStyle} />
          </Field>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Teléfono">
              <input name="phone" type="tel" placeholder="646 123 4567" style={inputStyle} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" type="tel" placeholder="646 123 4567" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Correo electrónico">
              <input name="email" type="email" placeholder="contacto@negocio.com" style={inputStyle} />
            </Field>
            <Field label="Sitio web">
              <input name="website" type="url" placeholder="https://..." style={inputStyle} />
            </Field>
          </div>

          {/* Submit */}
          <div style={{ paddingTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: pending ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: pending ? 'wait' : 'pointer',
                transition: 'opacity var(--transition-fast)',
              }}
            >
              {pending ? 'Enviando…' : 'Enviar para revisión →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem' }}>
              Al enviar, aceptas nuestros{' '}
              <Link href="/terminos" style={{ color: 'var(--color-accent)' }}>términos de servicio</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.875rem',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '0.9375rem',
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
}

function Field({ label, hint, error, children }: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy-600)', marginBottom: '0.375rem' }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.375rem' }}>{hint}</p>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  )
}
