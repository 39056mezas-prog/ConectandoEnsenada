export interface ClassifiedItem {
  id: string
  slug: string
  title: string
  price: number | null
  currency: string | null
  price_negotiable: boolean | null
  is_free: boolean | null
  neighborhood: string | null
  city: string | null
  category_slug: string | null
  category_name_es: string | null
  category_name_en: string | null
  photo_url: string | null
  created_at: string
}

export interface ClassifiedDetail extends Omit<ClassifiedItem, 'photo_url'> {
  description: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_whatsapp: string | null
  contact_email: string | null
  photos: string[]
  expires_at: string | null
}
