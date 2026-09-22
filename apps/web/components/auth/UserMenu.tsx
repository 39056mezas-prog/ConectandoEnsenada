'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth/actions'
import type { User } from '@supabase/supabase-js'

export function UserMenu({ loginLabel = 'Iniciar sesión' }: { loginLabel?: string }) {
  const [user, setUser]     = useState<User | null>(null)
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null); setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (loading) return <div style={{ width: '80px', height: '32px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.12)' }} />

  if (!user) return (
    <Link href="/login" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.8125rem', fontWeight: 600, padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-full)', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'all var(--transition-fast)', whiteSpace: 'nowrap' }}>
      {loginLabel}
    </Link>
  )

  const initials = ((user.user_metadata?.full_name as string) ?? user.email ?? 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Mi cuenta" aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', padding: '0.25rem 0.5rem 0.25rem 0.25rem', cursor: 'pointer' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {avatarUrl ? <Image src={avatarUrl} alt={initials} width={28} height={28} style={{ objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{initials}</span>}
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-modal)', minWidth: '200px', zIndex: 1050, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy-600)', marginBottom: '0.125rem' }}>{(user.user_metadata?.full_name as string) ?? 'Mi cuenta'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
          </div>
          {[{ href: '/perfil', label: '👤 Mi perfil' }, { href: '/negocios/nuevo', label: '+ Agregar lugar' }].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.625rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)' }}>
            <form action={signOut}>
              <button type="submit" style={{ width: '100%', textAlign: 'left', padding: '0.625rem 1rem', fontSize: '0.875rem', color: 'var(--color-error)', fontFamily: 'var(--font-display)', fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
