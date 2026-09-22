-- ============================================================================
-- Migration 007: Media, Hours, Reviews, Reports
-- ============================================================================

-- ── place_media ───────────────────────────────────────────────────────────────
CREATE TABLE directory.place_media (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid        NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  uploaded_by   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  url           text        NOT NULL,   -- Supabase Storage public URL
  caption_es    text,
  caption_en    text,
  media_type    text        NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo','video')),
  is_cover      boolean     NOT NULL DEFAULT false,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE directory.place_media IS
  'Photos and videos for a place. Stored in Supabase Storage bucket "places".';

ALTER TABLE directory.place_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_media_public_read" ON directory.place_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM directory.places
    WHERE id = place_id AND status = 'active' AND deleted_at IS NULL
  ));

CREATE POLICY "place_media_owner_write" ON directory.place_media FOR ALL
  USING (
    public.is_moderator_or_above()
    OR EXISTS (
      SELECT 1 FROM directory.places
      WHERE id = place_id AND owner_id = auth.uid()
    )
  );

-- ── place_hours ───────────────────────────────────────────────────────────────
CREATE TABLE directory.place_hours (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid    NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  day_of_week   integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
                        -- 0=Sunday, 1=Monday … 6=Saturday
  opens_at      time,
  closes_at     time,
  is_closed     boolean NOT NULL DEFAULT false,
  UNIQUE (place_id, day_of_week)
);

ALTER TABLE directory.place_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_hours_public_read" ON directory.place_hours FOR SELECT USING (true);

CREATE POLICY "place_hours_owner_write" ON directory.place_hours FOR ALL
  USING (
    public.is_moderator_or_above()
    OR EXISTS (
      SELECT 1 FROM directory.places WHERE id = place_id AND owner_id = auth.uid()
    )
  );

-- ── reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE directory.reviews (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid        NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  author_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         text,
  content       text,
  status        public.place_status NOT NULL DEFAULT 'pending',
  helpful_count integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  UNIQUE (author_id, place_id)  -- one review per user per place
);

COMMENT ON TABLE directory.reviews IS
  'User reviews for any place. Starts as pending, published after moderation.';

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON directory.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Trigger: update avg_rating and review_count on places after review changes
CREATE OR REPLACE FUNCTION directory.refresh_place_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE directory.places
  SET
    avg_rating   = (
      SELECT COALESCE(AVG(rating), 0)
      FROM directory.reviews
      WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        AND status = 'active'
        AND deleted_at IS NULL
    ),
    review_count = (
      SELECT COUNT(*)
      FROM directory.reviews
      WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        AND status = 'active'
        AND deleted_at IS NULL
    )
  WHERE id = COALESCE(NEW.place_id, OLD.place_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON directory.reviews
  FOR EACH ROW EXECUTE PROCEDURE directory.refresh_place_rating();

ALTER TABLE directory.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON directory.reviews FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "reviews_own_read" ON directory.reviews FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "reviews_authenticated_insert" ON directory.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "reviews_own_update" ON directory.reviews FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "reviews_admin_all" ON directory.reviews FOR ALL
  USING (public.is_moderator_or_above());

-- ── reports ───────────────────────────────────────────────────────────────────
-- Reports can target any entity (place, review, profile, listing, job, event).
-- Reporting a profile triggers review of ALL content from that profile.

CREATE TABLE moderation.reports (
  id              uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid               REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type     text               NOT NULL
                                     CHECK (entity_type IN (
                                       'place','review','profile',
                                       'listing','job','event','article'
                                     )),
  entity_id       uuid               NOT NULL,
  reason          public.report_reason NOT NULL,
  description     text,              -- reporter's additional context
  status          public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by     uuid               REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  moderator_notes text,
  created_at      timestamptz        NOT NULL DEFAULT now()
);

COMMENT ON TABLE moderation.reports IS
  'User reports on any entity. Reporting a profile flags all their content for review.';

ALTER TABLE moderation.reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit a report
CREATE POLICY "reports_authenticated_insert" ON moderation.reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can see their own reports
CREATE POLICY "reports_own_read" ON moderation.reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Moderators and admins see and manage all reports
CREATE POLICY "reports_moderator_all" ON moderation.reports FOR ALL
  USING (public.is_moderator_or_above());
