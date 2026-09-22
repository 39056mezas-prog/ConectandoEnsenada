-- ============================================================================
-- Migration 015: Utility Functions
-- Called from Next.js Server Actions and API routes.
-- All use SECURITY DEFINER so RLS is bypassed only where explicitly safe.
-- ============================================================================

-- ── increment_view_count ──────────────────────────────────────────────────────
-- Called on every place detail page load (from a server action, not client).
-- Accepts any entity type so one function covers all modules.

CREATE OR REPLACE FUNCTION public.increment_view_count(
  p_entity_type text,
  p_entity_id   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, directory, listings, jobs, events, content
AS $$
BEGIN
  CASE p_entity_type
    WHEN 'place'   THEN UPDATE directory.places  SET view_count = view_count + 1 WHERE id = p_entity_id;
    WHEN 'listing' THEN UPDATE listings.listings  SET view_count = view_count + 1 WHERE id = p_entity_id;
    WHEN 'job'     THEN UPDATE jobs.jobs          SET view_count = view_count + 1 WHERE id = p_entity_id;
    WHEN 'event'   THEN UPDATE events.events      SET view_count = view_count + 1 WHERE id = p_entity_id;
    WHEN 'article' THEN UPDATE content.articles   SET view_count = view_count + 1 WHERE id = p_entity_id;
    ELSE NULL;
  END CASE;
END;
$$;

-- ── search_places ─────────────────────────────────────────────────────────────
-- Powers the global search bar (Phase 1).
-- Full-text search across places with optional type/category filter.
-- Returns results ordered by relevance (FTS rank) then avg_rating.

CREATE OR REPLACE FUNCTION public.search_places(
  p_query       text,
  p_place_type  public.place_type DEFAULT NULL,
  p_category_id uuid              DEFAULT NULL,
  p_limit       integer           DEFAULT 20,
  p_offset      integer           DEFAULT 0
)
RETURNS TABLE (
  id            uuid,
  place_type    public.place_type,
  name_es       text,
  name_en       text,
  slug          text,
  short_desc_es text,
  address       text,
  neighborhood  text,
  latitude      numeric,
  longitude     numeric,
  avg_rating    numeric,
  review_count  integer,
  verified      boolean,
  featured      boolean,
  plan_type     public.plan_type,
  category_id   uuid,
  rank          real
)
LANGUAGE sql
STABLE
SET search_path = public, directory
AS $$
  SELECT
    p.id,
    p.place_type,
    p.name_es,
    p.name_en,
    p.slug,
    p.short_desc_es,
    p.address,
    p.neighborhood,
    p.latitude,
    p.longitude,
    p.avg_rating,
    p.review_count,
    p.verified,
    p.featured,
    p.plan_type,
    p.category_id,
    ts_rank(p.fts_es, websearch_to_tsquery('spanish', unaccent(p_query))) AS rank
  FROM directory.places p
  WHERE
    p.status    = 'active'
    AND p.deleted_at IS NULL
    AND (p_place_type  IS NULL OR p.place_type  = p_place_type)
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (
      p_query IS NULL OR p_query = ''
      OR p.fts_es @@ websearch_to_tsquery('spanish', unaccent(p_query))
      -- Fallback: trigram similarity for short / misspelled queries
      OR similarity(unaccent(p.name_es), unaccent(p_query)) > 0.2
    )
  ORDER BY
    -- Premium plans rank higher (featured > pro > starter > free)
    CASE p.plan_type
      WHEN 'enterprise' THEN 4
      WHEN 'pro'        THEN 3
      WHEN 'starter'    THEN 2
      ELSE                   1
    END DESC,
    p.featured DESC,
    rank DESC,
    p.avg_rating DESC,
    p.review_count DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- ── get_place_with_details ────────────────────────────────────────────────────
-- Returns a place + its extension row in a single query.
-- Used on the place detail page (Server Component).

CREATE OR REPLACE FUNCTION public.get_place_with_details(p_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, directory
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'place',            row_to_json(p),
    'business_details', row_to_json(bd),
    'beach_details',    row_to_json(bch),
    'trail_details',    row_to_json(tr),
    'real_estate',      row_to_json(re),
    'media',            (
      SELECT json_agg(m ORDER BY m.is_cover DESC, m.sort_order ASC)
      FROM directory.place_media m WHERE m.place_id = p.id
    ),
    'hours',            (
      SELECT json_agg(h ORDER BY h.day_of_week ASC)
      FROM directory.place_hours h WHERE h.place_id = p.id
    ),
    'category',         row_to_json(c)
  )
  INTO v_result
  FROM directory.places p
  LEFT JOIN directory.business_details  bd  ON bd.place_id  = p.id
  LEFT JOIN directory.beach_details     bch ON bch.place_id = p.id
  LEFT JOIN directory.trail_details     tr  ON tr.place_id  = p.id
  LEFT JOIN directory.real_estate_details re ON re.place_id = p.id
  LEFT JOIN public.categories           c   ON c.id         = p.category_id
  WHERE p.slug = p_slug
    AND p.status = 'active'
    AND p.deleted_at IS NULL;

  RETURN v_result;
END;
$$;

-- ── get_pending_count ─────────────────────────────────────────────────────────
-- Used in the admin panel header to show pending moderation items.

CREATE OR REPLACE FUNCTION public.get_pending_count()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'places',   (SELECT COUNT(*) FROM directory.places   WHERE status = 'pending' AND deleted_at IS NULL),
    'reviews',  (SELECT COUNT(*) FROM directory.reviews  WHERE status = 'pending' AND deleted_at IS NULL),
    'listings', (SELECT COUNT(*) FROM listings.listings  WHERE status = 'pending' AND deleted_at IS NULL),
    'jobs',     (SELECT COUNT(*) FROM jobs.jobs          WHERE status = 'pending' AND deleted_at IS NULL),
    'events',   (SELECT COUNT(*) FROM events.events      WHERE status = 'pending' AND deleted_at IS NULL),
    'reports',  (SELECT COUNT(*) FROM moderation.reports WHERE status = 'pending')
  );
$$;

-- ── approve_entity / reject_entity ────────────────────────────────────────────
-- Moderator actions. Single function handles all entity types.

CREATE OR REPLACE FUNCTION public.approve_entity(
  p_entity_type text,
  p_entity_id   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, directory, listings, jobs, events, content
AS $$
BEGIN
  IF NOT public.is_moderator_or_above() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  CASE p_entity_type
    WHEN 'place'   THEN UPDATE directory.places  SET status = 'active', published_at = COALESCE(published_at, now()) WHERE id = p_entity_id;
    WHEN 'listing' THEN UPDATE listings.listings  SET status = 'active' WHERE id = p_entity_id;
    WHEN 'job'     THEN UPDATE jobs.jobs          SET status = 'active' WHERE id = p_entity_id;
    WHEN 'event'   THEN UPDATE events.events      SET status = 'active' WHERE id = p_entity_id;
    WHEN 'review'  THEN UPDATE directory.reviews  SET status = 'active' WHERE id = p_entity_id;
    WHEN 'article' THEN UPDATE content.articles   SET status = 'published', published_at = COALESCE(published_at, now()) WHERE id = p_entity_id;
    ELSE RAISE EXCEPTION 'Unknown entity type: %', p_entity_type;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_entity(
  p_entity_type text,
  p_entity_id   uuid,
  p_reason      text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, directory, listings, jobs, events
AS $$
BEGIN
  IF NOT public.is_moderator_or_above() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  CASE p_entity_type
    WHEN 'place'   THEN UPDATE directory.places  SET status = 'rejected', rejection_note = p_reason WHERE id = p_entity_id;
    WHEN 'listing' THEN UPDATE listings.listings  SET status = 'rejected' WHERE id = p_entity_id;
    WHEN 'job'     THEN UPDATE jobs.jobs          SET status = 'rejected' WHERE id = p_entity_id;
    WHEN 'event'   THEN UPDATE events.events      SET status = 'rejected' WHERE id = p_entity_id;
    WHEN 'review'  THEN UPDATE directory.reviews  SET status = 'rejected' WHERE id = p_entity_id;
    ELSE RAISE EXCEPTION 'Unknown entity type: %', p_entity_type;
  END CASE;
END;
$$;
