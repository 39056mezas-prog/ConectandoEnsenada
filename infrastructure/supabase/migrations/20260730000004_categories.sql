-- ============================================================================
-- Migration 004: Categories + Tags
-- Shared taxonomy used by all directory modules.
-- Hierarchical categories (parent → child, e.g. Comida → Mariscos).
-- ============================================================================

-- ── Categories ───────────────────────────────────────────────────────────────

CREATE TABLE public.categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  module      text        NOT NULL,   -- which module owns this category
  name_es     text        NOT NULL,
  name_en     text,
  slug        text        NOT NULL,
  icon        text,                   -- Lucide icon name, e.g. 'utensils'
  color       text,                   -- hex color for UI, e.g. '#0B3C6F'
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (module, slug)
);

COMMENT ON TABLE public.categories IS
  'Hierarchical categories shared across all directory modules.';
COMMENT ON COLUMN public.categories.module IS
  'One of: businesses, restaurants, beaches, trails, events, marketplace, jobs, real_estate, tourism, news';

-- ── Tags ─────────────────────────────────────────────────────────────────────

CREATE TABLE public.tags (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es    text        NOT NULL,
  name_en    text,
  slug       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags       ENABLE ROW LEVEL SECURITY;

-- Categories and tags are read-only for the public
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "tags_public_read" ON public.tags
  FOR SELECT USING (true);

-- Only admins can manage categories and tags
CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "tags_admin_all" ON public.tags
  FOR ALL USING (public.is_admin());

-- ── Seed: Business categories ─────────────────────────────────────────────────
-- Core categories for the Business Directory (Phase 1 MVP).
-- Subcategories and other modules added in later migrations.

INSERT INTO public.categories (module, name_es, name_en, slug, icon, sort_order) VALUES
  -- ── Negocios / Businesses ──
  ('businesses', 'Restaurantes y Comida',   'Food & Restaurants',  'restaurantes',   'utensils',       1),
  ('businesses', 'Tiendas y Retail',        'Shops & Retail',      'tiendas',        'shopping-bag',   2),
  ('businesses', 'Servicios',               'Services',            'servicios',      'briefcase',      3),
  ('businesses', 'Salud y Bienestar',       'Health & Wellness',   'salud',          'heart-pulse',    4),
  ('businesses', 'Educación',               'Education',           'educacion',      'graduation-cap', 5),
  ('businesses', 'Automotriz',              'Automotive',          'automotriz',     'car',            6),
  ('businesses', 'Construcción y Hogar',    'Home & Construction', 'construccion',   'hammer',         7),
  ('businesses', 'Belleza y Estética',      'Beauty & Aesthetics', 'belleza',        'sparkles',       8),
  ('businesses', 'Tecnología',              'Technology',          'tecnologia',     'laptop',         9),
  ('businesses', 'Entretenimiento',         'Entertainment',       'entretenimiento','music',          10),
  ('businesses', 'Turismo y Hospedaje',     'Tourism & Lodging',   'turismo-hospedaje','hotel',        11),
  ('businesses', 'Finanzas y Legal',        'Finance & Legal',     'finanzas',       'landmark',       12),
  ('businesses', 'Gobierno y Org. Pública', 'Government & Public', 'gobierno',       'building-2',     13),
  ('businesses', 'Otro',                    'Other',               'otro',           'ellipsis',       99),

  -- ── Turismo / Tourism ──
  ('tourism',    'Playas',                  'Beaches',             'playas',         'waves',           1),
  ('tourism',    'Gastronomía',             'Gastronomy',          'gastronomia',    'chef-hat',        2),
  ('tourism',    'Vino y Bodegas',          'Wine & Wineries',     'vino',           'wine',            3),
  ('tourism',    'Aventura y Naturaleza',   'Adventure & Nature',  'aventura',       'mountain',        4),
  ('tourism',    'Historia y Cultura',      'History & Culture',   'historia',       'museum',          5),
  ('tourism',    'Vida Marina',             'Marine Life',         'marina',         'fish',            6),

  -- ── Playas / Beaches ──
  ('beaches',    'Playa Urbana',            'Urban Beach',         'urbana',         'sun',             1),
  ('beaches',    'Playa Remota',            'Remote Beach',        'remota',         'compass',         2),
  ('beaches',    'Playa Rocosa',            'Rocky Beach',         'rocosa',         'mountain',        3),

  -- ── Rutas / Trails ──
  ('trails',     'Senderismo',              'Hiking',              'senderismo',     'footprints',      1),
  ('trails',     'Ciclismo',                'Cycling',             'ciclismo',       'bike',            2),
  ('trails',     'Escalada',                'Climbing',            'escalada',       'mountain-snow',   3),

  -- ── Eventos / Events ──
  ('events',     'Música y Conciertos',     'Music & Concerts',    'musica',         'music',           1),
  ('events',     'Gastronomía',             'Food & Drink',        'gastronomia-ev', 'chef-hat',        2),
  ('events',     'Arte y Cultura',          'Arts & Culture',      'arte',           'palette',         3),
  ('events',     'Deportes',                'Sports',              'deportes',       'trophy',          4),
  ('events',     'Familia',                 'Family',              'familia',        'baby',            5),
  ('events',     'Negocios',                'Business',            'negocios-ev',    'briefcase',       6),
  ('events',     'Turismo',                 'Tourism',             'turismo-ev',     'map',             7),
  ('events',     'Otro',                    'Other',               'otro-ev',        'ellipsis',        99),

  -- ── Empleos / Jobs ──
  ('jobs',       'Tecnología',              'Technology',          'tech',           'laptop',          1),
  ('jobs',       'Hostelería y Turismo',    'Hospitality & Tourism','hosteleria',    'hotel',           2),
  ('jobs',       'Comercio y Ventas',       'Sales & Commerce',    'ventas',         'shopping-bag',    3),
  ('jobs',       'Construcción',            'Construction',        'const',          'hammer',          4),
  ('jobs',       'Educación',               'Education',           'edu',            'graduation-cap',  5),
  ('jobs',       'Salud',                   'Health',              'salud-jobs',     'heart-pulse',     6),
  ('jobs',       'Administrativo',          'Administrative',      'admin',          'clipboard',       7),
  ('jobs',       'Arte y Diseño',           'Art & Design',        'arte-jobs',      'palette',         8),
  ('jobs',       'Otro',                    'Other',               'otro-jobs',      'ellipsis',        99),

  -- ── Marketplace ──
  ('marketplace','Vehículos',               'Vehicles',            'vehiculos',      'car',             1),
  ('marketplace','Electrónica',             'Electronics',         'electronica',    'laptop',          2),
  ('marketplace','Muebles y Hogar',         'Furniture & Home',    'muebles',        'sofa',            3),
  ('marketplace','Ropa y Accesorios',       'Clothing',            'ropa',           'shirt',           4),
  ('marketplace','Herramientas',            'Tools',               'herramientas',   'wrench',          5),
  ('marketplace','Servicios',               'Services',            'servicios-mkt',  'briefcase',       6),
  ('marketplace','Deportes',                'Sports',              'deportes-mkt',   'trophy',          7),
  ('marketplace','Otro',                    'Other',               'otro-mkt',       'ellipsis',        99),

  -- ── Bienes Raíces / Real Estate ──
  ('real_estate','Casa',                    'House',               'casa',           'home',            1),
  ('real_estate','Departamento',            'Apartment',           'departamento',   'building-2',      2),
  ('real_estate','Terreno',                 'Land',                'terreno',        'map-pin',         3),
  ('real_estate','Local Comercial',         'Commercial',          'comercial',      'store',           4),
  ('real_estate','Bodega / Industrial',     'Warehouse',           'bodega',         'warehouse',       5),

  -- ── Noticias / News ──
  ('news',       'Local',                   'Local',               'local',          'map-pin',         1),
  ('news',       'Gobierno',                'Government',          'gobierno-news',  'landmark',        2),
  ('news',       'Turismo',                 'Tourism',             'turismo-news',   'map',             3),
  ('news',       'Negocios',                'Business',            'negocios-news',  'briefcase',       4),
  ('news',       'Deportes',                'Sports',              'deportes-news',  'trophy',          5),
  ('news',       'Cultura',                 'Culture',             'cultura-news',   'palette',         6);
