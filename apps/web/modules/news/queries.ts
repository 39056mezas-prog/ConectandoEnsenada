// ============================================================================
// modules/news/queries.ts — reads go through public RPCs (see migration 17).
// Cookie-free client → pages stay statically cacheable (ISR). Never throws.
// ============================================================================
import { createPublicClient } from '@/lib/supabase/server'
import { DEMO_NEWS, demoArticle } from './demo'
import type { NewsArticle, NewsItem } from './types'

export const DEMO_ENABLED = process.env.FRONT_DEMO === '1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args: Record<string, unknown>) => (createPublicClient().rpc as any)(name, args)

export async function getNews(opts: { category?: string | null; limit?: number; offset?: number } = {}): Promise<{ items: NewsItem[]; demo: boolean }> {
  const { category = null, limit = 12, offset = 0 } = opts
  try {
    const { data, error } = await rpc('news_feed', { p_category: category, p_limit: limit, p_offset: offset })
    if (error) throw new Error(error.message)
    const items = Array.isArray(data) ? (data as NewsItem[]) : []
    if (items.length === 0 && DEMO_ENABLED && offset === 0) {
      const demo = DEMO_NEWS.filter(n => !category || n.category_slug === category).slice(0, limit)
      return { items: demo, demo: true }
    }
    return { items, demo: false }
  } catch (e) {
    console.error('[news] feed failed:', e instanceof Error ? e.message : e)
    return DEMO_ENABLED && offset === 0
      ? { items: DEMO_NEWS.filter(n => !category || n.category_slug === category).slice(0, limit), demo: true }
      : { items: [], demo: false }
  }
}

export async function getArticle(slug: string): Promise<NewsArticle | null> {
  if (DEMO_ENABLED && slug.startsWith('ejemplo-')) return demoArticle(slug)
  try {
    const { data, error } = await rpc('news_article', { p_slug: slug })
    if (error) throw new Error(error.message)
    return Array.isArray(data) && data[0] ? (data[0] as NewsArticle) : null
  } catch (e) {
    console.error('[news] article failed:', e instanceof Error ? e.message : e)
    return null
  }
}

/** Category chips for /noticias (module = 'news'). */
export const NEWS_CATEGORIES: { slug: string; es: string; en: string }[] = [
  { slug: 'local', es: 'Local', en: 'Local' },
  { slug: 'gobierno-news', es: 'Gobierno', en: 'Government' },
  { slug: 'turismo-news', es: 'Turismo', en: 'Tourism' },
  { slug: 'negocios-news', es: 'Negocios', en: 'Business' },
  { slug: 'deportes-news', es: 'Deportes', en: 'Sports' },
  { slug: 'cultura-news', es: 'Cultura', en: 'Culture' },
]
