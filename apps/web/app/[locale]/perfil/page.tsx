import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'

export const metadata = { title: 'Mi perfil' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/perfil')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any).from('profiles').select('display_name,bio,phone,preferred_lang,role,created_at').eq('id', user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: places } = await (supabase as any).schema('directory').from('places').select('id,name_es,slug,status').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(10)

  const p = profile as { display_name: string; bio: string | null; phone: string | null; preferred_lang: string; role: string; created_at: string } | null
  const STATUS: Record<string, { label: string; bg: string; color: string }> = {
    active: { label: 'Activo', bg: '#D1FAE5', color: '#065F46' },
    pending: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E' },
    rejected: { label: 'Rechazado', bg: '#FEE2E2', color: '#991B1B' },
    suspended: { label: 'Suspendido', bg: '#F3F4F6', color: '#374151' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', paddingBlock: '2rem' }}>
      <div className="container-app" style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '0.25rem' }}>Mi perfil</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }} className="profile-layout">
          <ProfileForm initialData={{ display_name: p?.display_name ?? (user.user_metadata?.full_name as string) ?? '', bio: p?.bio ?? '', phone: p?.phone ?? '', preferred_lang: (p?.preferred_lang ?? 'es') as 'es' | 'en' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.875rem' }}>Mis lugares</h2>
              {!places || places.length === 0 ? (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>Aún no has enviado ningún lugar.</p>
                  <Link href="/negocios/nuevo" style={{ fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 600 }}>+ Agregar lugar →</Link>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {(places as Array<{ id: string; name_es: string; slug: string; status: string }>).map((pl) => (
                    <li key={pl.id}>
                      <Link href={`/negocios/${pl.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy-600)', fontFamily: 'var(--font-display)', marginBottom: '0.125rem' }}>{pl.name_es}</div>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', background: (STATUS[pl.status] ?? STATUS['pending']!).bg, color: (STATUS[pl.status] ?? STATUS['pending']!).color }}>{(STATUS[pl.status] ?? STATUS['pending']!).label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
