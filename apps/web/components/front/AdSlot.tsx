import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

/** House ad (our own "advertise here" promo) — becomes a real ad slot once there are advertisers. */
export async function AdSlot({ locale, wide = false }: { locale: string; wide?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  return (
    <aside className="fp-house-ad" aria-label={t('ad_label')} style={wide ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem 2rem', flexWrap: 'wrap', padding: '1.75rem 1.5rem 1.25rem' } : undefined}>
      <small>{t('ad_label')}</small>
      <div style={{ maxWidth: wide ? '40rem' : undefined }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-navy-600)', lineHeight: 1.2 }}>{t('ad_title')}</p>
        <p className="fp-small" style={{ margin: '0.375rem 0 0.875rem', fontSize: '0.875rem', marginBottom: wide ? 0 : undefined }}>{t('ad_body')}</p>
      </div>
      <Link href="/contacto" className="btn-accent" style={{ display: 'inline-block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)', marginTop: wide ? 0 : undefined }}>{t('ad_cta')}</Link>
    </aside>
  )
}
