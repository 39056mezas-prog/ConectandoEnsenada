import { Link } from '@/i18n/navigation'
import { timeAgo } from '@/lib/format'
import { pickLang, type NewsItem } from '@/modules/news/types'
import { Thumb } from './Thumb'

const isDemo = (n: NewsItem) => n.source_type === 'demo'

function Meta({ item, locale, demoLabel }: { item: NewsItem; locale: string; demoLabel: string }) {
  const cat = pickLang(item.category_name_es, item.category_name_en, locale)
  return (
    <div className="fp-meta">
      {isDemo(item) && <b>{demoLabel}</b>}
      {!isDemo(item) && cat && <b>{cat}</b>}
      <time dateTime={item.published_at}>{timeAgo(item.published_at, locale)}</time>
      {item.source_name && !isDemo(item) && item.source_type !== 'original' && <span>{item.source_name}</span>}
    </div>
  )
}

function StoryLink({ item, children }: { item: NewsItem; children: React.ReactNode }) {
  // Demo stories have no real page behind them, so they are not links.
  return isDemo(item)
    ? <span>{children}</span>
    : <Link href={`/noticias/${item.slug}`} className="fp-title-link">{children}</Link>
}

/** Big story: image on top, large serif headline, excerpt. */
export function LeadStory({ item, locale, demoLabel }: { item: NewsItem; locale: string; demoLabel: string }) {
  const title = pickLang(item.title_es, item.title_en, locale)
  const excerpt = pickLang(item.excerpt_es, item.excerpt_en, locale)
  return (
    <article className="fp-story" style={{ display: 'grid', gap: '0.875rem' }}>
      <StoryLink item={item}><Thumb src={item.featured_image} ratio="16 / 9" priority /></StoryLink>
      <h3 className="fp-title" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)', fontWeight: 800 }}><StoryLink item={item}>{title}</StoryLink></h3>
      {excerpt && <p className="fp-excerpt">{excerpt}</p>}
      <Meta item={item} locale={locale} demoLabel={demoLabel} />
    </article>
  )
}

/** Compact row: headline + meta on the left, small thumbnail on the right. */
export function StoryRow({ item, locale, demoLabel, showThumb = true }: { item: NewsItem; locale: string; demoLabel: string; showThumb?: boolean }) {
  const title = pickLang(item.title_es, item.title_en, locale)
  return (
    <article className="fp-story fp-row" style={showThumb ? undefined : { gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <div style={{ display: 'grid', gap: '0.375rem' }}>
        <h3 className="fp-title" style={{ fontSize: '1.1875rem' }}><StoryLink item={item}>{title}</StoryLink></h3>
        <Meta item={item} locale={locale} demoLabel={demoLabel} />
      </div>
      {showThumb && <StoryLink item={item}><Thumb src={item.featured_image} ratio="1 / 1" /></StoryLink>}
    </article>
  )
}

/** Text-led card for the "more news" grid: thumbnail, headline, meta. */
export function StoryCard({ item, locale, demoLabel }: { item: NewsItem; locale: string; demoLabel: string }) {
  const title = pickLang(item.title_es, item.title_en, locale)
  return (
    <article className="fp-story" style={{ display: 'grid', gap: '0.625rem', alignContent: 'start' }}>
      <StoryLink item={item}><Thumb src={item.featured_image} ratio="3 / 2" /></StoryLink>
      <h3 className="fp-title" style={{ fontSize: '1.25rem' }}><StoryLink item={item}>{title}</StoryLink></h3>
      <Meta item={item} locale={locale} demoLabel={demoLabel} />
    </article>
  )
}
