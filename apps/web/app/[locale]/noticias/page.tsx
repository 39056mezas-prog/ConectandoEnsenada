import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Newspaper } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getNews, NEWS_CATEGORIES } from '@/modules/news/queries'
import { LeadStory, StoryCard, StoryRow } from '@/components/front/Stories'
import { SectionHead } from '@/components/front/SectionHead'
import { AdSlot } from '@/components/front/AdSlot'

const PER_PAGE = 12
type SP = { categoria?: string; pagina?: string }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'front' })
  return { title: t('news_page_title'), description: t('news_page_desc') }
}

export default async function NoticiasPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const t = await getTranslations({ locale, namespace: 'front' })
  const category = NEWS_CATEGORIES.some(c => c.slug === sp.categoria) ? sp.categoria! : null
  const page = Math.max(1, Number.parseInt(sp.pagina ?? '1', 10) || 1)
  // Ask for one extra row so we know whether a "next page" exists.
  const { items: fetched, demo } = await getNews({ category, limit: PER_PAGE + 1, offset: (page - 1) * PER_PAGE })
  const items = fetched.slice(0, PER_PAGE)
  const hasNext = fetched.length > PER_PAGE
  const demoLabel = t('demo_tag')
  const href = (c: string | null, p = 1) => {
    const q = new URLSearchParams()
    if (c) q.set('categoria', c)
    if (p > 1) q.set('pagina', String(p))
    const s = q.toString()
    return `/noticias${s ? `?${s}` : ''}`
  }
  const showLead = page === 1 && items.length > 0
  const lead = showLead ? items[Math.max(0, items.findIndex(n => n.is_featured))] : undefined
  const rest = lead ? items.filter(n => n !== lead) : items

  return (
    <div className="container-app" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em', color: 'var(--color-navy-600)' }}>{t('news_page_title')}</h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0.375rem 0 1.25rem', maxWidth: '40rem' }}>{t('news_page_desc')}</p>
      <hr className="fp-double-rule" />
      <nav className="fp-chips" aria-label={t('news_title')} style={{ margin: '1.25rem 0 1.75rem' }}>
        <Link href={href(null)} className="fp-chip" aria-current={category === null ? 'true' : undefined}>{t('all_categories')}</Link>
        {NEWS_CATEGORIES.map(c => (
          <Link key={c.slug} href={href(c.slug)} className="fp-chip" aria-current={category === c.slug ? 'true' : undefined}>{locale === 'en' ? c.en : c.es}</Link>
        ))}
      </nav>

      {demo && <p role="note" className="fp-small" style={{ background: 'var(--color-cyan-50)', color: 'var(--color-navy-800)', padding: '0.5rem 1rem', marginBottom: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}>{t('demo_banner')}</p>}

      {items.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', background: 'var(--color-surface-raised)', border: '1.5px dashed var(--color-border-strong)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <Newspaper size={28} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--color-navy-600)', margin: '0 auto 0.75rem' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.625rem', color: 'var(--color-navy-600)' }}>{t('news_empty_title')}</p>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.375rem auto 0', maxWidth: '34rem' }}>{t('news_empty_body')}</p>
        </div>
      ) : (
        <>
          {lead && (
            <div className="fp-lead-grid" style={{ marginBottom: '2.25rem' }}>
              <LeadStory item={lead} locale={locale} demoLabel={demoLabel} />
              <div className="fp-rows">{rest.slice(0, 3).map(n => <StoryRow key={n.id} item={n} locale={locale} demoLabel={demoLabel} />)}</div>
            </div>
          )}
          {(lead ? rest.slice(3) : rest).length > 0 && (
            <>
              {lead && <SectionHead title={t('more_news')} />}
              <div className="fp-cols" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                {(lead ? rest.slice(3) : rest).map(n => <StoryCard key={n.id} item={n} locale={locale} demoLabel={demoLabel} />)}
              </div>
            </>
          )}
        </>
      )}

      {(page > 1 || hasNext) && (
        <nav style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }} aria-label="Paginación">
          {page > 1 ? <Link href={href(category, page - 1)} className="fp-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} aria-hidden="true" /> {page - 1}</Link> : <span />}
          {hasNext && <Link href={href(category, page + 1)} className="fp-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{page + 1} <ArrowRight size={14} aria-hidden="true" /></Link>}
        </nav>
      )}
      <div style={{ marginTop: '2.5rem' }}><AdSlot locale={locale} wide /></div>
    </div>
  )
}
