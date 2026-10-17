import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getSiteUrl } from '@/lib/site-url'
import { formatShortDate } from '@/lib/format'
import { getArticle } from '@/modules/news/queries'
import { pickLang } from '@/modules/news/types'
import { Thumb } from '@/components/front/Thumb'
import { AdSlot } from '@/components/front/AdSlot'

export const revalidate = 300
type P = { locale: string; slug: string }

export async function generateMetadata({ params }: { params: Promise<P> }): Promise<Metadata> {
  const { locale, slug } = await params
  const a = await getArticle(slug)
  if (!a) return {}
  const title = a.seo_title ?? pickLang(a.title_es, a.title_en, locale)
  const description = a.seo_description ?? pickLang(a.excerpt_es, a.excerpt_en, locale) ?? undefined
  return {
    title, description,
    openGraph: { type: 'article', title, description, publishedTime: a.published_at, images: a.featured_image ? [{ url: a.featured_image }] : undefined },
  }
}

export default async function ArticlePage({ params }: { params: Promise<P> }) {
  const { locale, slug } = await params
  const [a, t] = await Promise.all([getArticle(slug), getTranslations({ locale, namespace: 'front' })])
  if (!a) notFound()

  const title = pickLang(a.title_es, a.title_en, locale)
  const excerpt = pickLang(a.excerpt_es, a.excerpt_en, locale)
  const body = pickLang(a.content_es, a.content_en, locale) ?? ''
  const paragraphs = body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const cat = pickLang(a.category_name_es, a.category_name_en, locale)
  const external = a.source_type !== 'original' && a.source_type !== 'demo' && a.source_name
  const safeSource = a.source_url && /^https?:\/\//i.test(a.source_url) ? a.source_url : null

  // Structured data for Google News / search. `<` is escaped so content can never close the script tag.
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: title, datePublished: a.published_at,
    dateModified: a.updated_at ?? a.published_at, image: a.featured_image ? [a.featured_image] : undefined,
    author: a.author_name ? { '@type': 'Person', name: a.author_name } : { '@type': 'Organization', name: 'ConectandoEnsenada.org' },
    publisher: { '@type': 'Organization', name: 'ConectandoEnsenada.org', url: getSiteUrl() },
  }).replace(/</g, '\\u003c')

  return (
    <article className="container-app" style={{ maxWidth: '820px', paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Link href="/noticias" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '700 0.8125rem var(--font-display)', color: 'var(--color-cyan-700)' }}><ArrowLeft size={14} aria-hidden="true" /> {t('back_news')}</Link>
      <h1 className="fp-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, margin: '0.875rem 0 0.75rem', color: 'var(--color-navy-900)' }}>{title}</h1>
      {excerpt && <p className="fp-excerpt" style={{ fontSize: '1.3125rem', marginBottom: '1rem' }}>{excerpt}</p>}
      <div className="fp-meta" style={{ paddingBlock: '0.75rem', borderBlock: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        {cat && <b>{cat}</b>}
        {a.author_name && <span>{t('by')} {a.author_name}</span>}
        <time dateTime={a.published_at}>{t('published')} {formatShortDate(a.published_at, locale)}</time>
        {a.updated_at && a.updated_at.slice(0, 10) !== a.published_at.slice(0, 10) && <time dateTime={a.updated_at}>{t('updated')} {formatShortDate(a.updated_at, locale)}</time>}
      </div>
      {a.featured_image && <div style={{ marginBottom: '1.75rem' }}><Thumb src={a.featured_image} alt="" ratio="16 / 9" priority /></div>}
      <div className="fp-prose">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
      {external && (
        <p className="fp-small" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
          {t('source')}: <strong>{a.source_name}</strong>
          {safeSource && <> · <a href={safeSource} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--color-cyan-700)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t('source_open')} <ExternalLink size={13} aria-hidden="true" /></a></>}
        </p>
      )}
      <div style={{ marginTop: '2.5rem' }}><AdSlot locale={locale} wide /></div>
    </article>
  )
}
