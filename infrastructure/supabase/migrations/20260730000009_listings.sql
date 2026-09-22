-- ============================================================================
-- Migration 009: listings.listings + listing_media
-- Marketplace classifieds. No payments, no escrow.
-- Buyer contacts seller directly using the info on the listing.
-- Real estate listings live in directory.places (place_type='real_estate').
-- This table is for: junk removal, furniture, vehicles, services, etc.
-- ============================================================================

CREATE TABLE listings.listings (
  id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        uuid               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- ── Content ───────────────────────────────────────────────────────────────
  title            text               NOT NULL,
  slug             text               NOT NULL UNIQUE,
  description      text,
  category_id      uuid               REFERENCES public.categories(id) ON DELETE SET NULL,

  -- ── Price ─────────────────────────────────────────────────────────────────
  price            numeric(12, 2),
  currency         text               NOT NULL DEFAULT 'MXN',
  price_negotiable boolean            NOT NULL DEFAULT false,
  is_free          boolean            NOT NULL DEFAULT false,

  -- ── Direct contact (no internal messaging) ────────────────────────────────
  -- Buyers contact sellers using this information directly.
  -- At least one contact method required (enforced at app level).
  contact_name     text               NOT NULL,
  contact_phone    text,
  contact_whatsapp text,
  contact_email    text,

  -- ── Location (general — no exact address for security) ────────────────────
  city             text               NOT NULL DEFAULT 'Ensenada',
  neighborhood     text,

  -- ── Status ────────────────────────────────────────────────────────────────
  status           public.place_status NOT NULL DEFAULT 'pending',
  expires_at       timestamptz,       -- listings expire after 90 days by default
  view_count       integer            NOT NULL DEFAULT 0,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at       timestamptz        NOT NULL DEFAULT now(),
  updated_at       timestamptz        NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

COMMENT ON TABLE listings.listings IS
  'Marketplace classifieds. Buyer contacts seller directly — no platform transactions.';
COMMENT ON COLUMN listings.listings.contact_name IS
  'Name of the person to contact. May differ from the seller account name.';

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings.listings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── listing_media ─────────────────────────────────────────────────────────────
CREATE TABLE listings.listing_media (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid        NOT NULL REFERENCES listings.listings(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  sort_order   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Auto-expire listings ──────────────────────────────────────────────────────
-- Sets expires_at to 90 days from now on INSERT if not provided.
CREATE OR REPLACE FUNCTION listings.set_expiry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_set_expiry
  BEFORE INSERT ON listings.listings
  FOR EACH ROW EXECUTE PROCEDURE listings.set_expiry();

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE listings.listings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings.listing_media ENABLE ROW LEVEL SECURITY;

-- Public reads active, non-expired, non-deleted listings
CREATE POLICY "listings_public_read" ON listings.listings FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Sellers can see their own listings at any status
CREATE POLICY "listings_seller_read" ON listings.listings FOR SELECT
  USING (seller_id = auth.uid());

-- Authenticated users can create listings (starts as pending)
CREATE POLICY "listings_authenticated_insert" ON listings.listings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid() AND status = 'pending');

-- Sellers can update/soft-delete their own listings
CREATE POLICY "listings_seller_update" ON listings.listings FOR UPDATE
  USING (seller_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "listings_admin_all" ON listings.listings FOR ALL
  USING (public.is_moderator_or_above());

-- Media inherits from listing
CREATE POLICY "listing_media_public_read" ON listings.listing_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listings.listings
    WHERE id = listing_id AND status = 'active' AND deleted_at IS NULL
  ));

CREATE POLICY "listing_media_seller_write" ON listings.listing_media FOR ALL
  USING (
    public.is_moderator_or_above()
    OR EXISTS (
      SELECT 1 FROM listings.listings WHERE id = listing_id AND seller_id = auth.uid()
    )
  );
