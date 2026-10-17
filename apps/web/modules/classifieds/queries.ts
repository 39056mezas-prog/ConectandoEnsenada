// ============================================================================
// modules/classifieds/queries.ts — reads via public RPCs (migration 17). Never throws.
// Demo rows only when FRONT_DEMO=1 and the table is empty/unreachable.
// ============================================================================
import { createPublicClient } from '@/lib/supabase/server'
import type { ClassifiedDetail, ClassifiedItem } from './types'

const DEMO_ENABLED = process.env.FRONT_DEMO === '1'
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const demoRow = (n: number, title: string, price: number | null, cat: [string, string, string], hood: string, h: number): ClassifiedItem => ({
  id: `demo-${n}`, slug: `ejemplo-${n}`, title: `${title} (ejemplo)`, price, currency: 'MXN', price_negotiable: n % 2 === 0, is_free: false,
  neighborhood: hood, city: 'Ensenada', category_slug: cat[0], category_name_es: cat[1], category_name_en: cat[2], photo_url: null, created_at: hoursAgo(h),
})
const DEMO: ClassifiedItem[] = [
  demoRow(1, 'Camioneta pickup', 185000, ['vehiculos', 'Vehículos', 'Vehicles'], 'Zona Centro', 2),
  demoRow(2, 'Refrigerador', 4500, ['muebles', 'Muebles y Hogar', 'Home & Furniture'], 'Playitas', 6),
  demoRow(3, 'Laptop', 7800, ['electronica', 'Electrónica', 'Electronics'], 'Chapultepec', 9),
  demoRow(4, 'Tabla de surf', 3200, ['deportes-mkt', 'Deportes', 'Sports'], 'Playa Hermosa', 15),
  demoRow(5, 'Servicio de plomería', null, ['servicios-mkt', 'Servicios', 'Services'], 'Zona Centro', 20),
  demoRow(6, 'Taladro y herramientas', 1200, ['herramientas', 'Herramientas', 'Tools'], 'Reforma', 27),
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args: Record<string, unknown>) => (createPublicClient().rpc as any)(name, args)

export async function getClassifieds(opts: { category?: string | null; q?: string | null; limit?: number; offset?: number } = {}): Promise<{ items: ClassifiedItem[]; demo: boolean }> {
  const { category = null, q = null, limit = 12, offset = 0 } = opts
  const fallback = () => {
    const rows = DEMO.filter(r => (!category || r.category_slug === category) && (!q || r.title.toLowerCase().includes(q.toLowerCase())))
    return { items: rows.slice(0, limit), demo: true }
  }
  try {
    const { data, error } = await rpc('classifieds_feed', { p_category: category, p_query: q, p_limit: limit, p_offset: offset })
    if (error) throw new Error(error.message)
    const items = Array.isArray(data) ? (data as ClassifiedItem[]) : []
    if (items.length === 0 && DEMO_ENABLED && offset === 0 && !q) return fallback()
    return { items, demo: false }
  } catch (e) {
    console.error('[classifieds] feed failed:', e instanceof Error ? e.message : e)
    return DEMO_ENABLED && offset === 0 ? fallback() : { items: [], demo: false }
  }
}

export async function getClassified(slug: string): Promise<ClassifiedDetail | null> {
  try {
    const { data, error } = await rpc('classified_detail', { p_slug: slug })
    if (error) throw new Error(error.message)
    return Array.isArray(data) && data[0] ? (data[0] as ClassifiedDetail) : null
  } catch (e) {
    console.error('[classifieds] detail failed:', e instanceof Error ? e.message : e)
    return null
  }
}

export const CLASSIFIED_CATEGORIES: { slug: string; es: string; en: string }[] = [
  { slug: 'vehiculos', es: 'Vehículos', en: 'Vehicles' },
  { slug: 'electronica', es: 'Electrónica', en: 'Electronics' },
  { slug: 'muebles', es: 'Muebles y Hogar', en: 'Home & Furniture' },
  { slug: 'ropa', es: 'Ropa y Accesorios', en: 'Clothing' },
  { slug: 'herramientas', es: 'Herramientas', en: 'Tools' },
  { slug: 'servicios-mkt', es: 'Servicios', en: 'Services' },
  { slug: 'deportes-mkt', es: 'Deportes', en: 'Sports' },
  { slug: 'otro-mkt', es: 'Otro', en: 'Other' },
]
