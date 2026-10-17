import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, ShieldAlert } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { formatMoney, formatShortDate, timeAgo } from '@/lib/format'
import { getClassified } from '@/modules/classifieds/queries'
import { pickLang } from '@/modules/news/types'
import { Thumb } from '@/components/front/Thumb'

export const revalidate = 300
type P = { locale: string; slug: string }

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const { slug } = await params
  const a = await getClassified(slug)
  if (!a) return {}
  return { title: a.title, description: a.description?.slice(0, 160) ?? undefined, openGraph: { images: a.photos[0] ? [{ url: a.photos[0] }] : undefined } }
}

const digits = (s: string) => s.replace(/[^\d+]/g, '')

export default async function ClassifiedPage({ params }: { params: Promise<P> }) {
  const { locale, slug } = await params
  const [a, t] = await Promise.all([getClassified(slug), getTranslations({ locale, namespace: 'front' })])
  if (!a) notFound()

  const price = a.is_free ? t('free') : a.price != null ? formatMoney(a.price, a.currency, locale) : t('price_ask')
  const cat = pickLang(a.category_name_es, a.category_name_en, locale)
  const phone = a.contact_phone ? digits(a.contact_phone) : null
  const wa = a.contact_whatsapp ? digits(a.contact_whatsapp).replace(/^\+/, '') : null
  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }

  return (
    <article className="container-app" style={{ maxWidth: '980px', paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      <Link href="/clasificados" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '700 0.8125rem var(--font-display)', color: 'var(--color-cyan-700)' }}><ArrowLeft size={14} aria-hidden="true" /> {t('ads_back')}</Link>
      <div style={{ display: 'grid', gap: '1.75rem 2.5rem', marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <Thumb src={a.photos[0] ?? null} ratio="4 / 3" priority />
          {a.photos.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.5rem' }}>
              {a.photos.slice(1, 7).map(src => <Thumb key={src} src={src} ratio="1 / 1" />)}
            </div>
          )}
        </div>
        <div>
          <h1 className="fp-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800 }}>{a.title}</h1>
          <p className="fp-price" style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{price}{a.price_negotiable && !a.is_free && <span style={{ font: '700 0.8125rem var(--font-sans)', color: 'var(--color-text-secondary)', marginLeft: '0.625rem' }}>{t('negotiable')}</span>}</p>
          <p className="fp-meta" style={{ marginBottom: '1.25rem' }}>
            {(a.neighborhood || a.city) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={13} aria-hidden="true" />{[a.neighborhood, a.city].filter(Boolean).join(', ')}</span>}
            {cat && <b>{cat}</b>}
            <time dateTime={a.created_at}>{timeAgo(a.created_at, locale)}</time>
            {a.expires_at && <span>{t('ad_expires')} {formatShortDate(a.expires_at, locale)}</span>}
          </p>
          {a.description && <div className="fp-prose">{a.description.split(/\n{2,}/).map((p, i) => <p key={i} style={{ fontSize: '1.0625rem' }}>{p}</p>)}</div>}

          <section className="fp-panel" aria-labelledby="contact-h" style={{ marginTop: '1.75rem' }}>
            <h2 id="contact-h">{t('contact')}</h2>
            {a.contact_name && <p className="fp-small" style={{ fontSize: '0.9375rem', margin: '0.5rem 0 0.75rem' }}>{a.contact_name}</p>}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-accent" style={btn}><MessageCircle size={17} aria-hidden="true" /> {t('contact_whatsapp')}</a>}
              {phone && <a href={`tel:${phone}`} style={{ ...btn, background: 'var(--color-navy-600)', color: '#fff' }}><Phone size={17} aria-hidden="true" /> {t('contact_call')}</a>}
              {a.contact_email && <a href={`mailto:${a.contact_email}`} style={{ ...btn, background: '#fff', border: '1px solid var(--color-border-strong)', color: 'var(--color-navy-600)' }}><Mail size={17} aria-hidden="true" /> {t('contact_email')}</a>}
            </div>
            <p className="fp-small" style={{ marginTop: '1rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <ShieldAlert size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-navy-600)' }} />
              <span><strong>{t('safety_title')}.</strong> {t('safety_body')}</span>
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}
