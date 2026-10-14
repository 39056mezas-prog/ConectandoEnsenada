-- Migration 006: Place extension tables (applied to project pdoznhmckwovmrerlcro)
CREATE TABLE directory.business_details (
  place_id          uuid        PRIMARY KEY REFERENCES directory.places(id) ON DELETE CASCADE,
  rfc               text,
  year_founded      integer     CHECK (year_founded > 1800),
  employee_count    text        CHECK (employee_count IN ('1-5','6-20','21-50','50+')),
  accepts_cards     boolean,
  has_parking       boolean,
  is_accessible     boolean,
  price_range       text        CHECK (price_range IN ('$','$$','$$$','$$$$')),
  cuisine_type      text[],
  menu_url          text
);
COMMENT ON TABLE directory.business_details IS 'Extra fields for place_type IN (business, restaurant). One row per place.';
COMMENT ON COLUMN directory.business_details.rfc IS 'Mexican tax ID. Collected but not validated. Admin reviews manually. TODO: hide from public reads before premium signup ships.';

CREATE TABLE directory.beach_details (
  place_id          uuid        PRIMARY KEY REFERENCES directory.places(id) ON DELETE CASCADE,
  beach_type        text        CHECK (beach_type IN ('sandy','rocky','mixed')),
  is_swimmable      boolean,
  has_lifeguard     boolean,
  has_facilities    boolean,
  has_parking       boolean,
  pet_friendly      boolean,
  difficulty        text        CHECK (difficulty IN ('easy','moderate','hard')),
  best_season       text[]
);

CREATE TABLE directory.trail_details (
  place_id          uuid        PRIMARY KEY REFERENCES directory.places(id) ON DELETE CASCADE,
  distance_km       numeric(6, 2),
  elevation_gain_m  integer,
  difficulty        text        CHECK (difficulty IN ('easy','moderate','hard','expert')),
  trail_type        text        CHECK (trail_type IN ('loop','out_and_back','point_to_point')),
  surface           text        CHECK (surface IN ('dirt','paved','rocky','mixed')),
  features          text[],
  dog_friendly      boolean,
  estimated_hours   numeric(4, 1)
);

CREATE TABLE directory.real_estate_details (
  place_id          uuid        PRIMARY KEY REFERENCES directory.places(id) ON DELETE CASCADE,
  listing_type      text        NOT NULL CHECK (listing_type IN ('sale','rent')),
  property_type     text        CHECK (property_type IN ('house','apartment','land','commercial','warehouse')),
  price             numeric(12, 2),
  currency          text        NOT NULL DEFAULT 'USD',
  bedrooms          integer,
  bathrooms         numeric(3, 1),
  area_sqm          numeric(8, 2),
  furnished         boolean,
  contact_name      text,
  contact_phone     text,
  contact_email     text,
  expires_at        timestamptz
);

ALTER TABLE directory.business_details    ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.beach_details       ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.trail_details       ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory.real_estate_details ENABLE ROW LEVEL SECURITY;

-- Read: only if the caller can read the parent place (places RLS applies in the subquery).
CREATE POLICY "business_details_read"    ON directory.business_details    FOR SELECT USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id));
CREATE POLICY "beach_details_read"       ON directory.beach_details       FOR SELECT USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id));
CREATE POLICY "trail_details_read"       ON directory.trail_details       FOR SELECT USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id));
CREATE POLICY "real_estate_details_read" ON directory.real_estate_details FOR SELECT USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id));

CREATE POLICY "business_details_write"    ON directory.business_details    FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));
CREATE POLICY "beach_details_write"       ON directory.beach_details       FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));
CREATE POLICY "trail_details_write"       ON directory.trail_details       FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));
CREATE POLICY "real_estate_details_write" ON directory.real_estate_details FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));
