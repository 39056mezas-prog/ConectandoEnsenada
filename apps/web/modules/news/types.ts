export interface NewsItem {
  id: string
  slug: string
  title_es: string
  title_en: string | null
  excerpt_es: string | null
  excerpt_en: string | null
  featured_image: string | null
  category_slug: string | null
  category_name_es: string | null
  category_name_en: string | null
  source_type: string | null
  source_name: string | null
  source_url: string | null
  published_at: string
  is_featured: boolean
}

export interface NewsArticle extends NewsItem {
  content_es: string | null
  content_en: string | null
  author_name: string | null
  updated_at: string | null
  seo_title: string | null
  seo_description: string | null
}

/** Pick the right language, falling back to Spanish (the editorial language). */
export const pickLang = <T extends string | null>(es: T, en: T | null | undefined, locale: string): T =>
  (locale === 'en' && en ? en : es) as T
