// ============================================================================
// modules/directory/types.ts
// ============================================================================

export type PlaceType =
  | 'business' | 'restaurant' | 'beach' | 'trail'
  | 'park' | 'attraction' | 'organization' | 'nature_spot' | 'real_estate'

export type PlaceStatus = 'pending' | 'active' | 'rejected' | 'suspended'
export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise'

// ── Raw row returned by search_places() RPC ──────────────────────────────────
export interface PlaceSearchResult {
  id: string
  place_type: PlaceType
  name_es: string
  name_en: string | null
  slug: string
  short_desc_es: string | null
  address: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  avg_rating: number
  review_count: number
  verified: boolean
  featured: boolean
  plan_type: PlanType
  category_id: string | null
  rank: number
}

// ── Full place with all related data (get_place_with_details RPC) ─────────────
export interface PlaceDetails {
  place: {
    id: string
    place_type: PlaceType
    name_es: string
    name_en: string | null
    slug: string
    short_desc_es: string | null
    short_desc_en: string | null
    description_es: string | null
    description_en: string | null
    address: string | null
    neighborhood: string | null
    city: string
    state: string
    country: string
    zip_code: string | null
    latitude: number | null
    longitude: number | null
    google_maps_url: string | null
    phone: string | null
    whatsapp: string | null
    email: string | null
    website: string | null
    social_links: Record<string, string>
    verified: boolean
    featured: boolean
    plan_type: PlanType
    avg_rating: number
    review_count: number
    view_count: number
    seo_title: string | null
    seo_description: string | null
    published_at: string | null
    created_at: string
  }
  business_details: {
    rfc: string | null
    year_founded: number | null
    employee_count: string | null
    accepts_cards: boolean | null
    has_parking: boolean | null
    is_accessible: boolean | null
    price_range: string | null
    cuisine_type: string[] | null
    menu_url: string | null
  } | null
  beach_details: {
    beach_type: string | null
    is_swimmable: boolean | null
    has_lifeguard: boolean | null
    has_facilities: boolean | null
    has_parking: boolean | null
    pet_friendly: boolean | null
    difficulty: string | null
    best_season: string[] | null
  } | null
  trail_details: {
    distance_km: number | null
    elevation_gain_m: number | null
    difficulty: string | null
    trail_type: string | null
    surface: string | null
    features: string[] | null
    dog_friendly: boolean | null
    estimated_hours: number | null
  } | null
  real_estate: {
    listing_type: string
    property_type: string | null
    price: number | null
    currency: string
    bedrooms: number | null
    bathrooms: number | null
    area_sqm: number | null
    furnished: boolean | null
    contact_name: string | null
    contact_phone: string | null
    contact_email: string | null
  } | null
  media: PlaceMedia[] | null
  hours: PlaceHour[] | null
  category: CategoryRow | null
}

export interface PlaceMedia {
  id: string
  url: string
  caption_es: string | null
  caption_en: string | null
  media_type: 'photo' | 'video'
  is_cover: boolean
  sort_order: number
}

export interface PlaceHour {
  id: string
  day_of_week: number
  opens_at: string | null
  closes_at: string | null
  is_closed: boolean
}

export interface CategoryRow {
  id: string
  parent_id: string | null
  module: string
  name_es: string
  name_en: string | null
  slug: string
  icon: string | null
  color: string | null
  sort_order: number
}

// ── Filters for the listing page (from URL search params) ────────────────────
export interface DirectoryFilters {
  q?: string           // search query
  categoria?: string   // category slug
  pagina?: number      // page number (1-based)
}

// ── Form data for submitting a new place ─────────────────────────────────────
export interface SubmitPlaceData {
  place_type: PlaceType
  name_es: string
  name_en?: string
  category_id?: string
  short_desc_es?: string
  description_es?: string
  address?: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  social_links?: Record<string, string>
  // Business-specific
  price_range?: string
  accepts_cards?: boolean
  has_parking?: boolean
}

