-- Migration 007: Media, hours, reviews, reports (applied to project pdoznhmckwovmrerlcro)

-- Harden the protect triggers: enforce only for API roles (not for trusted
-- SECURITY DEFINER functions / service role / migrations).
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_banned IS DISTINCT FROM OLD.is_banned
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Not allowed to change role, ban status or deletion state';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION directory.protect_place_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, directory AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_moderator_or_above() THEN
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

-- place_media
CREATE TABLE directory.place_media (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid        NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  uploaded_by   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  url           text        NOT NULL,
  caption_es    text,
  caption_en    text,
  media_type    text        NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo','video')),
  is_cover      boolean     NOT NULL DEFAULT false,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE directory.place_media IS 'Photos and videos for a place. Stored in Supabase Storage bucket "places".';
ALTER TABLE directory.place_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_media_public_read" ON directory.place_media FOR SELECT
  USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.status = 'active' AND p.deleted_at IS NULL));

CREATE POLICY "place_media_owner_write" ON directory.place_media FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));

-- place_hours
CREATE TABLE directory.place_hours (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id      uuid    NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  day_of_week   integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
  opens_at      time,
  closes_at     time,
  is_closed     boolean NOT NULL DEFAULT false,
  UNIQUE (place_id, day_of_week)
);
ALTER TABLE directory.place_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_hours_public_read" ON directory.place_hours FOR SELECT
  USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id));

CREATE POLICY "place_hours_owner_write" ON directory.place_hours FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()))
  WITH CHECK (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM directory.places p WHERE p.id = place_id AND p.owner_id = auth.uid()));

-- reviews
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
  UNIQUE (author_id, place_id)
);
COMMENT ON TABLE directory.reviews IS 'User reviews for any place. Starts as pending, published after moderation.';

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON directory.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION directory.refresh_place_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, directory AS $$
BEGIN
  UPDATE directory.places
  SET
    avg_rating   = (SELECT COALESCE(AVG(rating), 0) FROM directory.reviews
                    WHERE place_id = COALESCE(NEW.place_id, OLD.place_id) AND status = 'active' AND deleted_at IS NULL),
    review_count = (SELECT COUNT(*) FROM directory.reviews
                    WHERE place_id = COALESCE(NEW.place_id, OLD.place_id) AND status = 'active' AND deleted_at IS NULL)
  WHERE id = COALESCE(NEW.place_id, OLD.place_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON directory.reviews
  FOR EACH ROW EXECUTE PROCEDURE directory.refresh_place_rating();

-- Authors can't approve their own reviews or fake helpful counts.
CREATE OR REPLACE FUNCTION directory.protect_review_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, directory AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_moderator_or_above() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.helpful_count IS DISTINCT FROM OLD.helpful_count
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.place_id IS DISTINCT FROM OLD.place_id
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Not allowed to change review moderation fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_protect_privileged
  BEFORE UPDATE ON directory.reviews
  FOR EACH ROW EXECUTE PROCEDURE directory.protect_review_privileged_columns();

ALTER TABLE directory.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON directory.reviews FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY "reviews_own_read" ON directory.reviews FOR SELECT
  USING (author_id = auth.uid());
CREATE POLICY "reviews_authenticated_insert" ON directory.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid() AND status = 'pending' AND helpful_count = 0);
CREATE POLICY "reviews_own_update" ON directory.reviews FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "reviews_admin_all" ON directory.reviews FOR ALL
  USING (public.is_moderator_or_above());

-- moderation.reports
CREATE TABLE moderation.reports (
  id              uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid               REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type     text               NOT NULL CHECK (entity_type IN ('place','review','profile','listing','job','event','article')),
  entity_id       uuid               NOT NULL,
  reason          public.report_reason NOT NULL,
  description     text,
  status          public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by     uuid               REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  moderator_notes text,
  created_at      timestamptz        NOT NULL DEFAULT now()
);
COMMENT ON TABLE moderation.reports IS 'User reports on any entity. Reporting a profile flags all their content for review.';
ALTER TABLE moderation.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_authenticated_insert" ON moderation.reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid() AND status = 'pending');
CREATE POLICY "reports_own_read" ON moderation.reports FOR SELECT
  USING (reporter_id = auth.uid());
CREATE POLICY "reports_moderator_all" ON moderation.reports FOR ALL
  USING (public.is_moderator_or_above());

GRANT USAGE ON SCHEMA moderation TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA moderation TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA moderation TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA moderation GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA moderation GRANT ALL ON TABLES TO service_role;
