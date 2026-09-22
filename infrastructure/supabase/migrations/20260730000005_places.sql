-- ============================================================================
-- Migration 005: directory.places
-- The central table for EVERY directory module:
-- businesses, restaurants, beaches, trails, parks, attractions,
-- organizations, nature spots, and real estate.
--
-- Design: one wide table + thin extension tables per type.
-- This gives us: shared SEO, shared maps, shared reviews,
-- shared moderation — without duplicating infrastructure.
-- ============================================================================

CREATE TABLE directory.places (
  -- ── Identity ──────────────────────────────────────────────────────────────
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid              REFERENCES public.profiles(id) ON DELETE SET NULL,
  place_type      public.place_type NOT NULL,
  category_id     uuid              REFERENCES public.categories(id) ON DELETE SET NULL,

  -- ── Names (bilingual) ─────────────────────────────────────────────────────
  name_es         text              NOT NULL,
  name_en         text,
  slug            text              NOT NULL UNIQUE,

  -- ── Descriptions (bilingual) ──────────────────────────────────────────────
  short_desc_es   text,                            -- max 160 chars (SEO meta)
  short_desc_en   text,
  description_es  text,                            -- full rich text
  description_en  text,

  -- ── Location ──────────────────────────────────────────────────────────────
  address         text,
  neighborhood    text,
  city            text              NOT NULL DEFAULT 'Ensenada',
  state           text              NOT NULL DEFAULT 'Baja California',
  country         text              NOT NULL DEFAULT 'MX',
  zip_code        text,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  google_maps_url text,

  -- ── Contact (all optional — only shown if provided) ───────────────────────
  phone           text,
  whatsapp        text,
  email           text,
  website         text,

  -- ── Social links ──────────────────────────────────────────────────────────
  -- Flexible JSON: { "facebook": "url", "instagram": "url", ... }
  social_links    jsonb             NOT NULL DEFAULT '{}',

  -- ── Moderation / Status ───────────────────────────────────────────────────
  status          public.place_status NOT NULL DEFAULT 'pending',
  rejection_note  text,                            -- admin note on rejection
  verified        boolean           NOT NULL DEFAULT false,
  featured        boolean           NOT NULL DEFAULT false,

  -- ── Monetization ──────────────────────────────────────────────────────────
  plan_type       public.plan_type  NOT NULL DEFAULT 'free',
  plan_expires_at timestamptz,

  -- ── SEO ───────────────────────────────────────────────────────────────────
  -- Empty = auto-generated from name + description
  seo_title       text,
  seo_description text,

  -- ── Counters (denormalized for performance) ───────────────────────────────
  -- Updated by triggers / edge functions — not raw SQL joins on every page
  view_count      integer           NOT NULL DEFAULT 0,
  avg_rating      numeric(3, 2)     NOT NULL DEFAULT 0,
  review_count    integer           NOT NULL DEFAULT 0,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now(),
  published_at    timestamptz,
  deleted_at      timestamptz                       -- soft delete
);

COMMENT ON TABLE directory.places IS
  'Polymorphic base table for all directories. Extended by business_details, beach_details, etc.';
COMMENT ON COLUMN directory.places.slug IS
  'URL-safe unique identifier. /negocios/bodega-de-santo-tomas → slug=bodega-de-santo-tomas';
COMMENT ON COLUMN directory.places.social_links IS
  'JSON map of social networks: {"facebook":"url","instagram":"url","tiktok":"url"}';

-- ── Auto-update timestamp ────────────────────────────────────────────────────
CREATE TRIGGER places_updated_at
  BEFORE UPDATE ON directory.places
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE directory.places ENABLE ROW LEVEL SECURITY;

-- Public: only see active, non-deleted places
CREATE POLICY "places_public_read"
  ON directory.places FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Owner: can see their own places regardless of status
CREATE POLICY "places_owner_read"
  ON directory.places FOR SELECT
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

-- Authenticated users can submit new places (starts as 'pending')
CREATE POLICY "places_authenticated_insert"
  ON directory.places FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND status = 'pending');

-- Owners can update their own places (status changes restricted to admin)
CREATE POLICY "places_owner_update"
  ON directory.places FOR UPDATE
  USING (owner_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (
    owner_id = auth.uid()
    -- Owners cannot change their own status, verified, featured, or plan
    AND status = (SELECT status FROM directory.places WHERE id = places.id)
    AND verified = (SELECT verified FROM directory.places WHERE id = places.id)
    AND featured = (SELECT featured FROM directory.places WHERE id = places.id)
    AND plan_type = (SELECT plan_type FROM directory.places WHERE id = places.id)
  );

-- Admins and moderators have full access
CREATE POLICY "places_admin_all"
  ON directory.places FOR ALL
  USING (public.is_moderator_or_above());

-- ── Soft delete helper ───────────────────────────────────────────────────────
-- Use this instead of DELETE to preserve data for analytics + restore.
CREATE OR REPLACE FUNCTION directory.soft_delete_place(place_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE directory.places
  SET deleted_at = now(), status = 'suspended'
  WHERE id = place_id
    AND (owner_id = auth.uid() OR public.is_admin());
$$;
