// ============================================================================
// Demo content — ONLY used when FRONT_DEMO=1 and the database has no real articles.
// Clearly marked as "ejemplo" so it can never be mistaken for real news. Lets the
// founder preview the front page layout before the newsroom has published anything.
// ============================================================================
import type { NewsArticle, NewsItem } from './types'

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const LOREM = 'Este es texto de ejemplo para visualizar el diseño de la portada. Cuando la redacción publique notas reales, aparecerán aquí en su lugar.'

const base = (n: number, cat: [string, string, string], h: number, featured = false): NewsItem => ({
  id: `demo-${n}`, slug: `ejemplo-${n}`,
  title_es: `Titular de ejemplo ${n}: aquí irá una nota real de Ensenada`,
  title_en: `Sample headline ${n}: a real Ensenada story will go here`,
  excerpt_es: LOREM, excerpt_en: 'Sample text to preview the front-page layout. Real stories will replace it once published.',
  featured_image: null, category_slug: cat[0], category_name_es: cat[1], category_name_en: cat[2],
  source_type: 'demo', source_name: 'Contenido de ejemplo', source_url: null, published_at: hoursAgo(h), is_featured: featured,
})

export const DEMO_NEWS: NewsItem[] = [
  base(1, ['local', 'Local', 'Local'], 1, true),
  base(2, ['gobierno-news', 'Gobierno', 'Government'], 3),
  base(3, ['turismo-news', 'Turismo', 'Tourism'], 5),
  base(4, ['negocios-news', 'Negocios', 'Business'], 8),
  base(5, ['deportes-news', 'Deportes', 'Sports'], 12),
  base(6, ['cultura-news', 'Cultura', 'Culture'], 20),
  base(7, ['local', 'Local', 'Local'], 26),
  base(8, ['turismo-news', 'Turismo', 'Tourism'], 30),
]

export const demoArticle = (slug: string): NewsArticle | null => {
  const item = DEMO_NEWS.find(n => n.slug === slug)
  return item ? { ...item, content_es: `${LOREM}\n\n${LOREM}`, content_en: null, author_name: null, updated_at: null, seo_title: null, seo_description: null } : null
}
