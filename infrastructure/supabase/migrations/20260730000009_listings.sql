-- Migration 009: listings (marketplace classifieds) (applied to project pdoznhmckwovmrerlcro)
CREATE TABLE listings.listings (
  id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        uuid               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            text               NOT NULL,
  slug             text               NOT NULL UNIQUE,
  description      text,
  category_id      uuid               REFERENCES public.categories(id) ON DELETE SET NULL,
  price            numeric(12, 2),
  currency         text               NOT NULL DEFAULT 'MXN',
  price_negotiable boolean            NOT NULL DEFAULT false,
  is_free          boolean            NOT NULL DEFAULT false,
  contact_name     text               NOT NULL,
  contact_phone    text,
  contact_whatsapp text,
  contact_email    text,
  city             text               NOT NULL DEFAULT 'Ensenada',
  neighborhood     text,
  status           public.place_status NOT NULL DEFAULT 'pending',
  expires_at       timestamptz,
  view_count       integer            NOT NULL DEFAULT 0,
  created_at       timestamptz        NOT NULL DEFAULT now(),
  updated_at       timestamptz        NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);
COMMENT ON TABLE listings.listings IS 'Marketplace classifieds. Buyer contacts seller directly — no platform transactions.';
COMMENT ON COLUMN listings.listings.contact_name IS 'Name of the person to contact. May differ from the seller account name.';

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings.listings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE listings.listing_media (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid        NOT NULL REFERENCES listings.listings(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  sort_order   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION listings.set_expiry()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
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

-- Sellers can't self-approve, change owner, or fake counters / expiry.
CREATE OR REPLACE FUNCTION listings.protect_listing_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, listings AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_moderator_or_above() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
       OR NEW.view_count IS DISTINCT FROM OLD.view_count THEN
      RAISE EXCEPTION 'Not allowed to change moderation or counter fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_protect_privileged
  BEFORE UPDATE ON listings.listings
  FOR EACH ROW EXECUTE PROCEDURE listings.protect_listing_privileged_columns();

ALTER TABLE listings.listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings.listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_public_read" ON listings.listings FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "listings_seller_read" ON listings.listings FOR SELECT
  USING (seller_id = auth.uid());
CREATE POLICY "listings_authenticated_insert" ON listings.listings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid() AND status = 'pending' AND view_count = 0);
CREATE POLICY "listings_seller_update" ON listings.listings FOR UPDATE
  USING (seller_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (seller_id = auth.uid());
CREATE POLICY "listings_admin_all" ON listings.listings FOR ALL
  USING (public.is_moderator_or_above());

CREATE POLICY "listing_media_public_read" ON listings.listing_media FOR SELECT
  USING (EXISTS (SELECT 1 FROM listings.listings l WHERE l.id = listing_id AND l.status = 'active' AND l.deleted_at IS NULL));
CREATE POLICY "listing_media_seller_write" ON listings.listing_media FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM listings.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM listings.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()));

GRANT USAGE ON SCHEMA listings TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA listings TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA listings TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA listings GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA listings GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA listings GRANT ALL ON TABLES TO service_role;
