import { MapPin, Plus, Package } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { formatMoney, timeAgo } from '@/lib/format'
import { pickLang } from '@/modules/news/types'
import type { ClassifiedItem } from '@/modules/classifieds/types'
import { Thumb } from './Thumb'

export async function ClassifiedCard({ item, locale }: { item: ClassifiedItem; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  const isDemo = item.id.startsWith('demo-')
  const cat = pickLang(item.category_name_es, item.category_name_en, locale)
  const price = item.is_free ? t('free') : item.price != null ? formatMoney(item.price, item.currency, locale) : t('price_ask')
  const body = (
    <>
      <Thumb src={item.photo_url} ratio="4 / 3" style={{ borderRadius: 0 }} />
      <div style={{ padding: '0.75rem 0.875rem 0.875rem', display: 'grid', gap: '0.25rem' }}>
        <p className="fp-price">{price}{item.price_negotiable && !item.is_free && <span style={{ font: '700 0.6875rem var(--font-sans)', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>{t('negotiable')}</span>}</p>
        <h3 style={{ font: '700 0.9375rem/1.3 var(--font-display)', color: 'var(--color-text-primary)' }}>{item.title}</h3>
        <p className="fp-meta" style={{ marginTop: '0.25rem' }}>
          {item.neighborhood && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={12} aria-hidden="true" />{item.neighborhood}</span>}
          {cat && <span>{cat}</span>}
          <time dateTime={item.created_at}>{timeAgo(item.created_at, locale)}</time>
        </p>
      </div>
    </>
  )
  return isDemo ? <div className="fp-ad-card">{body}</div> : <Link href={`/clasificados/${item.slug}`} className="fp-ad-card">{body}</Link>
}

export function ClassifiedsGrid({ items, locale, home = false }: { items: ClassifiedItem[]; locale: string; home?: boolean }) {
  return <div className={home ? 'fp-ads fp-ads--home' : 'fp-ads'}>{items.map(i => <ClassifiedCard key={i.id} item={i} locale={locale} />)}</div>
}

export async function ClassifiedsEmpty({ locale, filtered = false }: { locale: string; filtered?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'front' })
  return (
    <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#fff', border: '1.5px dashed var(--color-border-strong)', borderRadius: 'var(--radius-lg)' }}>
      <Package size={28} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--color-navy-600)', margin: '0 auto 0.75rem' }} />
      <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--color-navy-600)' }}>{filtered ? t('ads_empty_filtered') : t('ads_empty_title')}</p>
      {!filtered && <p className="fp-small" style={{ fontSize: '0.9375rem', margin: '0.375rem 0 1.25rem' }}>{t('ads_empty_body')}</p>}
      <PostAdLink label={t('ads_post')} />
      {!filtered && <p className="fp-small" style={{ marginTop: '0.625rem' }}>{t('ads_post_hint')}</p>}
    </div>
  )
}

export function PostAdLink({ label }: { label: string }) {
  return (
    <Link href="/contacto" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
      <Plus size={15} strokeWidth={2.75} aria-hidden="true" /> {label}
    </Link>
  )
}
