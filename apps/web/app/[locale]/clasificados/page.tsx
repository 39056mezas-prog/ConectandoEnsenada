import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CLASSIFIED_CATEGORIES, getClassifieds } from '@/modules/classifieds/queries'
import { ClassifiedsEmpty, ClassifiedsGrid, PostAdLink } from '@/components/front/Classifieds'
import { AdSlot } from '@/components/front/AdSlot'

const PER_PAGE = 20
type SP = { categoria?: string; q?: string; pagina?: string }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'front' })
  return { title: t('ads_page_title'), description: t('ads_page_desc') }
}

export default async function ClasificadosPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SP> }) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const t = await getTranslations({ locale, namespace: 'front' })
  const category = CLASSIFIED_CATEGORIES.some(c => c.slug === sp.categoria) ? sp.categoria! : null
  const q = (sp.q ?? '').trim().slice(0, 80) || null
  const page = Math.max(1, Number.parseInt(sp.pagina ?? '1', 10) || 1)
  const { items: fetched, demo } = await getClassifieds({ category, q, limit: PER_PAGE + 1, offset: (page - 1) * PER_PAGE })
  const items = fetched.slice(0, PER_PAGE)
  const hasNext = fetched.length > PER_PAGE
  const href = (c: string | null, p = 1) => {
    const u = new URLSearchParams()
    if (c) u.set('categoria', c)
    if (q) u.set('q', q)
    if (p > 1) u.set('pagina', String(p))
    const s = u.toString()
    return `/clasificados${s ? `?${s}` : ''}`
  }

  return (
    <div className="container-app" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em', color: 'var(--color-navy-600)' }}>{t('ads_page_title')}</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.375rem 0 0', maxWidth: '40rem' }}>{t('ads_page_desc')}</p>
        </div>
        <PostAdLink label={t('ads_post')} />
      </div>
      <hr className="fp-double-rule" style={{ marginTop: '1.25rem' }} />

      <form action="/clasificados" method="get" role="search" className="fp-search" style={{ width: 'min(100%, 520px)', marginTop: '1.25rem' }}>
        {category && <input type="hidden" name="categoria" value={category} />}
        <Search size={16} strokeWidth={2.25} aria-hidden="true" style={{ alignSelf: 'center', marginLeft: '0.875rem', color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <input name="q" type="search" defaultValue={q ?? ''} aria-label={t('ads_search')} placeholder={t('ads_search_placeholder')} />
        <button type="submit">{t('search_btn')}</button>
      </form>

      <nav className="fp-chips" aria-label={t('ads_title')} style={{ margin: '1rem 0 1.75rem' }}>
        <Link href={href(null)} className="fp-chip" aria-current={category === null ? 'true' : undefined}>{t('all_categories')}</Link>
        {CLASSIFIED_CATEGORIES.map(c => (
          <Link key={c.slug} href={href(c.slug)} className="fp-chip" aria-current={category === c.slug ? 'true' : undefined}>{locale === 'en' ? c.en : c.es}</Link>
        ))}
      </nav>

      {demo && <p role="note" className="fp-small" style={{ background: 'var(--color-cyan-50)', color: 'var(--color-navy-800)', padding: '0.5rem 1rem', marginBottom: '1.25rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}>{t('demo_banner')}</p>}

      {items.length === 0 ? <ClassifiedsEmpty locale={locale} filtered={Boolean(q || category)} /> : <ClassifiedsGrid items={items} locale={locale} />}

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
