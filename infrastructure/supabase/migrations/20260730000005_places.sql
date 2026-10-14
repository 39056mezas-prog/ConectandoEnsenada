-- Migration 005: directory.places (applied to project pdoznhmckwovmrerlcro)
-- Polymorphic base table for every directory module.
CREATE TABLE directory.places (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid              REFERENCES public.profiles(id) ON DELETE SET NULL,
  place_type      public.place_type NOT NULL,
  category_id     uuid              REFERENCES public.categories(id) ON DELETE SET NULL,
  name_es         text              NOT NULL,
  name_en         text,
  slug            text              NOT NULL UNIQUE,
  short_desc_es   text,
  short_desc_en   text,
  description_es  text,
  description_en  text,
  address         text,
  neighborhood    text,
  city            text              NOT NULL DEFAULT 'Ensenada',
  state           text              NOT NULL DEFAULT 'Baja California',
  country         text              NOT NULL DEFAULT 'MX',
  zip_code        text,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  google_maps_url text,
  phone           text,
  whatsapp        text,
  email           text,
  website         text,
  social_links    jsonb             NOT NULL DEFAULT '{}',
  status          public.place_status NOT NULL DEFAULT 'pending',
  rejection_note  text,
  verified        boolean           NOT NULL DEFAULT false,
  featured        boolean           NOT NULL DEFAULT false,
  plan_type       public.plan_type  NOT NULL DEFAULT 'free',
  plan_expires_at timestamptz,
  seo_title       text,
  seo_description text,
  view_count      integer           NOT NULL DEFAULT 0,
  avg_rating      numeric(3, 2)     NOT NULL DEFAULT 0,
  review_count    integer           NOT NULL DEFAULT 0,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now(),
  published_at    timestamptz,
  deleted_at      timestamptz
);

COMMENT ON TABLE directory.places IS 'Polymorphic base table for all directories. Extended by business_details, beach_details, etc.';
COMMENT ON COLUMN directory.places.slug IS 'URL-safe unique identifier.';
COMMENT ON COLUMN directory.places.social_links IS 'JSON map of social networks.';

CREATE TRIGGER places_updated_at
  BEFORE UPDATE ON directory.places
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Owners cannot change moderation / plan / counter fields.
-- (Redefined in migration 007 to apply only to API roles.)
CREATE OR REPLACE FUNCTION directory.protect_place_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, directory
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_moderator_or_above() THEN
    IF NEW.status          IS DISTINCT FROM OLD.status
       OR NEW.verified     IS DISTINCT FROM OLD.verified
       OR NEW.featured     IS DISTINCT FROM OLD.featured
       OR NEW.plan_type    IS DISTINCT FROM OLD.plan_type
       OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
       OR NEW.owner_id     IS DISTINCT FROM OLD.owner_id
       OR NEW.rejection_note IS DISTINCT FROM OLD.rejection_note
       OR NEW.view_count   IS DISTINCT FROM OLD.view_count
       OR NEW.avg_rating   IS DISTINCT FROM OLD.avg_rating
       OR NEW.review_count IS DISTINCT FROM OLD.review_count
       OR NEW.deleted_at   IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Not allowed to change moderation, plan or counter fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER places_protect_privileged
  BEFORE UPDATE ON directory.places
  FOR EACH ROW EXECUTE PROCEDURE directory.protect_place_privileged_columns();

ALTER TABLE directory.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "places_public_read" ON directory.places FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "places_owner_read" ON directory.places FOR SELECT
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "places_authenticated_insert" ON directory.places FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND owner_id = auth.uid()
    AND status = 'pending'
    AND verified = false
    AND featured = false
    AND plan_type = 'free'
  );

CREATE POLICY "places_owner_update" ON directory.places FOR UPDATE
  USING (owner_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "places_admin_all" ON directory.places FOR ALL
  USING (public.is_moderator_or_above());

CREATE OR REPLACE FUNCTION directory.soft_delete_place(place_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, directory
AS $$
  UPDATE directory.places
  SET deleted_at = now(), status = 'suspended'
  WHERE id = place_id
    AND (owner_id = auth.uid() OR public.is_admin());
$$;

-- API grants for the directory schema (RLS still decides row access).
-- NOTE: the schema must also be added to Dashboard > Settings > Data API > Exposed schemas.
GRANT USAGE ON SCHEMA directory TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA directory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA directory TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA directory TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA directory GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA directory GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA directory GRANT ALL ON TABLES TO service_role;
