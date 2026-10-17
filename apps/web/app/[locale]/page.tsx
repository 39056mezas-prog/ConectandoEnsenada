import { Building2, UtensilsCrossed, Palmtree, Umbrella, Newspaper, Package, Plus, type LucideIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createPublicClient } from '@/lib/supabase/server'
import { getUsdMxn } from '@/lib/live/fx'
import { getMarine, getWeather } from '@/lib/live/weather'
import { getNews } from '@/modules/news/queries'
import { getClassifieds } from '@/modules/classifieds/queries'
import { PlaceCard } from '@/components/directory/PlaceCard'
import { Dateline } from '@/components/front/Dateline'
import { Ticker } from '@/components/front/Ticker'
import { SectionHead } from '@/components/front/SectionHead'
import { LeadStory, StoryCard, StoryRow } from '@/components/front/Stories'
import { FxPanel, WeatherPanel } from '@/components/front/Board'
import { ClassifiedsEmpty, ClassifiedsGrid } from '@/components/front/Classifieds'
import { AdSlot } from '@/components/front/AdSlot'
import type { PlaceSearchResult } from '@/modules/directory/types'

// ISR: the page is rebuilt at most every 5 minutes; live data (fx / weather) has its own, longer cache.
export const revalidate = 300

const EXPLORE: { Icon: LucideIcon; key: string; href: string }[] = [
  { Icon: Newspaper,       key: 'news',        href: '/noticias' },
  { Icon: Package,         key: 'marketplace', href: '/clasificados' },
  { Icon: Building2,       key: 'businesses',  href: '/negocios' },
  { Icon: UtensilsCrossed, key: 'restaurants', href: '/restaurantes' },
  { Icon: Palmtree,        key: 'tourism',     href: '/turismo' },
  { Icon: Umbrella,        key: 'beaches',     href: '/playas' },
]

async function getFeaturedPlaces(): Promise<PlaceSearchResult[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createPublicClient().rpc as any)('search_places', { p_query: null, p_place_type: null, p_category_id: null, p_limit: 4, p_offset: 0 })
    if (error) console.error('[home] search_places error:', error.message ?? error)
    return Array.isArray(data) ? (data as PlaceSearchResult[]) : []
  } catch (e) {
    console.error('[home] featured places failed:', e)
    return []
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, tNav] = await Promise.all([
    getTranslations({ locale, namespace: 'front' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  // Everything is fetched in parallel and every source fails safe (null / empty), so one
  // broken source never takes the front page down.
  const [fx, wx, sea, news, ads, featured] = await Promise.all([
    getUsdMxn(), getWeather(), getMarine(),
    getNews({ limit: 24 }), getClassifieds({ limit: 10 }), getFeaturedPlaces(),
  ])

  const items = news.items
  const leadIdx = Math.max(0, items.findIndex(n => n.is_featured))
  const lead = items[leadIdx]
  const rest = items.filter((_, i) => i !== leadIdx)
  const secondary = rest.slice(0, 3)
  const more = rest.slice(3, 9)
  const demoLabel = t('demo_tag')
  const showDemoBanner = news.demo || ads.demo

  return (
    <div style={{ background: 'var(--color-surface)' }}>
      <Dateline locale={locale} />
      <Ticker locale={locale} fx={fx} wx={wx} sea={sea} />

      {showDemoBanner && (
        <p role="note" className="fp-small" style={{ background: 'var(--color-cyan-50)', color: 'var(--color-navy-800)', textAlign: 'center', padding: '0.5rem 1rem', fontWeight: 700 }}>{t('demo_banner')}</p>
      )}

      <div className="container-app">
        <div className="fp-grid">
          {/* ── Lead + secondary stories ─────────────────────────────── */}
          <section className="fp-lead" aria-labelledby="news-h">
            <SectionHead id="news-h" title={t('news_title')} href="/noticias" linkLabel={t('news_all')} />
            {lead ? (
              <div className="fp-lead-grid">
                <LeadStory item={lead} locale={locale} demoLabel={demoLabel} />
                <div className="fp-rows">
                  {secondary.map(n => <StoryRow key={n.id} item={n} locale={locale} demoLabel={demoLabel} />)}
                </div>
              </div>
            ) : (
              <div style={{ padding: '2.5rem 1.5rem', background: 'var(--color-surface-raised)', border: '1.5px dashed var(--color-border-strong)', borderRadius: 'var(--radius-lg)' }}>
                <Newspaper size={28} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--color-navy-600)', marginBottom: '0.75rem' }} />
                <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.625rem', color: 'var(--color-navy-600)' }}>{t('news_empty_title')}</p>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.375rem', maxWidth: '36rem' }}>{t('news_empty_body')}</p>
              </div>
            )}
          </section>

          {/* ── Today board: dollar, weather, sea, ad ─────────────────── */}
          <aside className="fp-board" aria-label={t('today_title')}>
            <FxPanel locale={locale} fx={fx} />
            <WeatherPanel locale={locale} wx={wx} sea={sea} />
            <div style={{ marginTop: '1.25rem' }}><AdSlot locale={locale} /></div>
          </aside>

          {/* ── More news ─────────────────────────────────────────────── */}
          {more.length > 0 && (
            <section className="fp-more" aria-labelledby="more-h">
              <SectionHead id="more-h" title={t('more_news')} href="/noticias" linkLabel={t('news_all')} />
              <div className="fp-cols" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
                {more.map(n => <StoryCard key={n.id} item={n} locale={locale} demoLabel={demoLabel} />)}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Classifieds ──────────────────────────────────────────────── */}
      <section className="fp-ads-band" aria-labelledby="ads-h">
        <div className="container-app">
          <SectionHead id="ads-h" title={t('ads_title')} href="/clasificados" linkLabel={t('ads_all')} />
          {ads.items.length > 0 ? <ClassifiedsGrid items={ads.items} locale={locale} home /> : <ClassifiedsEmpty locale={locale} />}
          <div style={{ marginTop: '1.75rem' }}><AdSlot locale={locale} wide /></div>
        </div>
      </section>

      {/* ── Directory ────────────────────────────────────────────────── */}
      <section style={{ padding: '2.5rem 0 1rem' }} aria-labelledby="dir-h">
        <div className="container-app">
          <SectionHead id="dir-h" title={t('directory_title')} href="/negocios" linkLabel={t('directory_all')} />
          {featured.length === 0 ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'var(--color-surface-raised)', border: '1.5px dashed var(--color-border-strong)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--color-navy-600)' }}>{t('directory_empty_title')}</p>
              <p className="fp-small" style={{ fontSize: '0.9375rem', margin: '0.375rem 0 1.25rem' }}>{t('directory_empty_body')}</p>
              <Link href="/negocios/nuevo" className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)' }}><Plus size={15} strokeWidth={2.75} aria-hidden="true" /> {t('directory_add')}</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {featured.map(p => <PlaceCard key={p.id} place={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Explore ──────────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 0 3rem' }} aria-labelledby="explore-h">
        <div className="container-app">
          <SectionHead id="explore-h" title={t('explore_title')} />
          <div className="cat-grid cat-grid--6">
            {EXPLORE.map(({ Icon, key, href }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="tile" style={{ padding: '1.125rem 0.75rem', background: 'linear-gradient(180deg, #fff, var(--color-surface-raised))', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', textAlign: 'center', boxShadow: 'var(--shadow-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
                  <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(150deg, var(--color-cyan-500), var(--color-navy-600))', boxShadow: 'var(--shadow-inset-top), 0 8px 16px -6px rgb(11 60 111 / 0.55)' }}><Icon size={20} strokeWidth={1.9} /></span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-navy-600)' }}>{tNav(key)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business CTA ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #52c4f0 0%, var(--color-cyan-400) 100%)', padding: '3.25rem 0', textAlign: 'center' }}>
        <div className="container-app" style={{ maxWidth: '620px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 'clamp(1.625rem, 3vw, 2.125rem)', letterSpacing: '-0.01em', color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>{t('cta_title')}</h2>
          <p style={{ color: 'var(--color-navy-800)', marginBottom: '1.5rem', lineHeight: 1.65 }}>{t('cta_body')}</p>
          <Link href="/negocios/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(180deg, var(--color-navy-500), var(--color-navy-700))', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, padding: '0.875rem 2rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-3)' }}>
            <Plus size={18} strokeWidth={2.75} aria-hidden="true" /> {t('directory_add')}
          </Link>
        </div>
      </section>
    </div>
  )
}
