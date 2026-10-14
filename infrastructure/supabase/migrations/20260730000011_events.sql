-- Migration 011: events (applied to project pdoznhmckwovmrerlcro)
CREATE TABLE events.events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  place_id         uuid        REFERENCES directory.places(id) ON DELETE SET NULL,
  title_es         text        NOT NULL,
  title_en         text,
  slug             text        NOT NULL UNIQUE,
  description_es   text,
  description_en   text,
  featured_image   text,
  category_id      uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz,
  is_recurring     boolean     NOT NULL DEFAULT false,
  recurrence_rule  text,
  venue_name       text,
  venue_address    text,
  latitude         numeric(10, 7),
  longitude        numeric(10, 7),
  is_free          boolean     NOT NULL DEFAULT true,
  price            numeric(8, 2),
  currency         text        NOT NULL DEFAULT 'MXN',
  tickets_url      text,
  contact_name     text,
  contact_phone    text,
  contact_email    text,
  contact_website  text,
  status           public.place_status NOT NULL DEFAULT 'pending',
  is_featured      boolean     NOT NULL DEFAULT false,
  view_count       integer     NOT NULL DEFAULT 0,
  seo_title        text,
  seo_description  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  CONSTRAINT event_dates_valid CHECK (ends_at IS NULL OR ends_at >= starts_at)
);
COMMENT ON TABLE events.events IS 'City event calendar. Bilingual, with optional link to a registered venue.';

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events.events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION events.protect_event_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, events AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_moderator_or_above() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
       OR NEW.organizer_id IS DISTINCT FROM OLD.organizer_id
       OR NEW.view_count IS DISTINCT FROM OLD.view_count
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Not allowed to change moderation or counter fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_protect_privileged
  BEFORE UPDATE ON events.events
  FOR EACH ROW EXECUTE PROCEDURE events.protect_event_privileged_columns();

ALTER TABLE events.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_public_read" ON events.events FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "events_organizer_read" ON events.events FOR SELECT
  USING (organizer_id = auth.uid());
CREATE POLICY "events_authenticated_insert" ON events.events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND organizer_id = auth.uid() AND status = 'pending' AND is_featured = false AND view_count = 0);
CREATE POLICY "events_organizer_update" ON events.events FOR UPDATE
  USING (organizer_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "events_admin_all" ON events.events FOR ALL
  USING (public.is_moderator_or_above());

GRANT USAGE ON SCHEMA events TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA events TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA events TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA events GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA events GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA events GRANT ALL ON TABLES TO service_role;
