-- ============================================================================
-- Migration 011: events.events
-- City-wide event calendar. Anyone authenticated can submit an event.
-- Events start as 'pending' and are approved by a moderator.
-- ============================================================================

CREATE TABLE events.events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Optional: links event to a registered place (venue in the directory)
  place_id         uuid        REFERENCES directory.places(id) ON DELETE SET NULL,

  -- ── Content (bilingual) ───────────────────────────────────────────────────
  title_es         text        NOT NULL,
  title_en         text,
  slug             text        NOT NULL UNIQUE,
  description_es   text,
  description_en   text,
  featured_image   text,
  category_id      uuid        REFERENCES public.categories(id) ON DELETE SET NULL,

  -- ── Schedule ──────────────────────────────────────────────────────────────
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz,
  is_recurring     boolean     NOT NULL DEFAULT false,
  recurrence_rule  text,       -- RRULE string for recurring events (e.g. "FREQ=WEEKLY")

  -- ── Location ──────────────────────────────────────────────────────────────
  -- Populated if the venue is NOT in the directory (place_id is null)
  venue_name       text,
  venue_address    text,
  latitude         numeric(10, 7),
  longitude        numeric(10, 7),

  -- ── Tickets / Access ──────────────────────────────────────────────────────
  is_free          boolean     NOT NULL DEFAULT true,
  price            numeric(8, 2),
  currency         text        NOT NULL DEFAULT 'MXN',
  tickets_url      text,       -- external link for ticket purchase

  -- ── Contact ───────────────────────────────────────────────────────────────
  contact_name     text,
  contact_phone    text,
  contact_email    text,
  contact_website  text,

  -- ── Status ────────────────────────────────────────────────────────────────
  status           public.place_status NOT NULL DEFAULT 'pending',
  is_featured      boolean     NOT NULL DEFAULT false,
  view_count       integer     NOT NULL DEFAULT 0,

  -- ── SEO ───────────────────────────────────────────────────────────────────
  seo_title        text,
  seo_description  text,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,

  CONSTRAINT event_dates_valid CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

COMMENT ON TABLE events.events IS
  'City event calendar. Bilingual, with optional link to a registered venue.';

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events.events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE events.events ENABLE ROW LEVEL SECURITY;

-- Public: active, future or ongoing, non-deleted events
CREATE POLICY "events_public_read" ON events.events FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "events_organizer_read" ON events.events FOR SELECT
  USING (organizer_id = auth.uid());

CREATE POLICY "events_authenticated_insert" ON events.events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND organizer_id = auth.uid() AND status = 'pending');

CREATE POLICY "events_organizer_update" ON events.events FOR UPDATE
  USING (organizer_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "events_admin_all" ON events.events FOR ALL
  USING (public.is_moderator_or_above());
