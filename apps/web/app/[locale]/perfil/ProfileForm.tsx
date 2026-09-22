'use client'
import { useActionState } from 'react'
import { updateProfile } from '@/lib/auth/actions'
import type { UpdateProfileState } from '@/lib/auth/actions'

const INIT: UpdateProfileState = {}
const inp: React.CSSProperties = { width: '100%', padding: '0.5625rem 0.875rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--color-text-primary)', background: 'var(--color-surface)', transition: 'border-color var(--transition-fast)' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-navy-600)', marginBottom: '0.375rem' }

export function ProfileForm({ initialData }: { initialData: { display_name: string; bio: string; phone: string; preferred_lang: 'es' | 'en' } }) {
  const [state, formAction, pending] = useActionState(updateProfile, INIT)
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '1.25rem' }}>Información personal</h2>
      {state.success && <div style={{ padding: '0.75rem 1rem', background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: '#065F46', marginBottom: '1.25rem' }}>✅ Perfil actualizado.</div>}
      {state.error   && <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: '#991B1B', marginBottom: '1.25rem' }}>{state.error}</div>}
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        <div>
          <label style={lbl}>Nombre *</label>
          <input name="display_name" type="text" required defaultValue={initialData.display_name} style={inp} onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          {state.errors?.display_name && <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>{state.errors.display_name[0]}</p>}
        </div>
        <div>
          <label style={lbl}>Descripción breve</label>
          <textarea name="bio" rows={3} defaultValue={initialData.bio} style={{ ...inp, resize: 'vertical', minHeight: '80px' }} onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
        </div>
        <div>
          <label style={lbl}>Teléfono</label>
          <input name="phone" type="tel" defaultValue={initialData.phone} placeholder="646 123 4567" style={inp} onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
        </div>
        <div>
          <label style={lbl}>Idioma preferido</label>
          <select name="preferred_lang" defaultValue={initialData.preferred_lang} style={inp}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <button type="submit" disabled={pending} style={{ padding: '0.6875rem 1.5rem', background: pending ? 'var(--color-text-tertiary)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', cursor: pending ? 'wait' : 'pointer', alignSelf: 'flex-start' }}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
