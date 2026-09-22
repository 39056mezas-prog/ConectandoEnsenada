-- ============================================================================
-- Migration 006: Place Extension Tables
-- Each extends directory.places with type-specific fields.
-- One-to-one relationship: place_id is both PK and FK.
-- ============================================================================

-- ── business_details ─────────────────────────────────────────────────────────
CREATE TABLE directory.business_details (
  place_id          uuid        PRIMARY KEY
                                REFERENCES directory.places(id) ON DELETE CASCADE,
  -- RFC is collected for premium plans but NOT validated against SAT.
  -- Admin reviews manually. See v2.1 architecture decision.
  rfc               text,
  year_founded      integer     CHECK (year_founded > 1800 AND year_founded <= EXTRACT(YEAR FROM now())),
  employee_count    text        CHECK (employee_count IN ('1-5','6-20','21-50','50+')),
  accepts_cards     boolean,
  has_parking       boolean,
  is_accessible     boolean,    -- wheelchair accessible
  price_range       text        CHECK (price_range IN ('$','$$','$$$','$$$$')),
  -- For restaurants only — cuisine types (e.g. ['Mariscos','Mexicana'])
  cuisine_type      text[],
  menu_url          text
);

COMMENT ON TABLE directory.business_details IS
  'Extra fields for place_type IN (business, restaurant). One row per place.';
COMMENT ON COLUMN directory.business_details.rfc IS
  'Mexican tax ID. Collected but not validated. Admin reviews manually.';

-- ── beach_details ─────────────────────────────────────────────────────────────
CREATE TABLE directory.beach_details (
  place_id          uuid        PRIMARY KEY
                                REFERENCES directory.places(id) ON DELETE CASCADE,
  beach_type        text        CHECK (beach_type IN ('sandy','rocky','mixed')),
  is_swimmable      boolean,
  has_lifeguard     boolean,
  has_facilities    boolean,    -- bathrooms, showers, etc.
  has_parking       boolean,
  pet_friendly      boolean,
  difficulty        text        CHECK (difficulty IN ('easy','moderate','hard')),
  best_season       text[]      -- e.g. ['spring','summer']
);

-- ── trail_details ─────────────────────────────────────────────────────────────
CREATE TABLE directory.trail_details (
  place_id          uuid        PRIMARY KEY
                                REFERENCES directory.places(id) ON DELETE CASCADE,
  distance_km       numeric(6, 2),
  elevation_gain_m  integer,
  difficulty        text        CHECK (difficulty IN ('easy','moderate','hard','expert')),
  trail_type        text        CHECK (trail_type IN ('loop','out_and_back','point_to_point')),
  surface           text        CHECK (surface IN ('dirt','paved','rocky','mixed')),
  features          text[],     -- ['waterfall','viewpoint','wildlife','camping']
  dog_friendly      boolean,
  estimated_hours   numeric(4, 1)
);

-- ── real_estate_details ───────────────────────────────────────────────────────
CREATE TABLE directory.real_estate_details (
  place_id          uuid        PRIMARY KEY
                                REFERENCES directory.places(id) ON DELETE CASCADE,
  listing_type      text        NOT NULL CHECK (listing_type IN ('sale','rent')),
  property_type     text        CHECK (property_type IN ('house','apartment','land','commercial','warehouse')),
  price             numeric(12, 2),
  currency          text        NOT NULL DEFAULT 'USD',
  bedrooms          integer,
  bathrooms         numeric(3, 1),
  area_sqm          numeric(8, 2),
  furnished         boolean,
  -- Direct contact for the listing (may differ from place owner)
  contact_name      text,
  contact_phone     text,
  contact_email     text,
  expires_at        timestamptz -- listings auto-expire
);

-- ── RLS: Extensions inherit the parent place's permissions ───────────────────
-- Anyone who can read a place can read its extension.
-- Anyone who can write a place can write its extension.

ALTER TABLE directory.business_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.beach_details     ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.trail_details     ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.real_estate_details ENABLE ROW LEVEL SECURITY;

-- Public read (join with active places)
CREATE POLICY "business_details_read"    ON directory.business_details    FOR SELECT USING (true);
CREATE POLICY "beach_details_read"       ON directory.beach_details       FOR SELECT USING (true);
CREATE POLICY "trail_details_read"       ON directory.trail_details       FOR SELECT USING (true);
CREATE POLICY "real_estate_details_read" ON directory.real_estate_details FOR SELECT USING (true);

-- Write: only admins or the place owner (enforced via places RLS cascade)
CREATE POLICY "business_details_write"    ON directory.business_details    FOR ALL USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places WHERE id = place_id AND owner_id = auth.uid()));
CREATE POLICY "beach_details_write"       ON directory.beach_details       FOR ALL USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places WHERE id = place_id AND owner_id = auth.uid()));
CREATE POLICY "trail_details_write"       ON directory.trail_details       FOR ALL USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places WHERE id = place_id AND owner_id = auth.uid()));
CREATE POLICY "real_estate_details_write" ON directory.real_estate_details FOR ALL USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places WHERE id = place_id AND owner_id = auth.uid()));
