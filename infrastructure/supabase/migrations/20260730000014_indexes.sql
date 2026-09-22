-- ============================================================================
-- Migration 014: Indexes + Full-Text Search
-- Every query pattern from the app has an index here.
-- FTS uses PostgreSQL tsvector — Meilisearch replaces this in Phase 3.
-- ============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_role       ON public.profiles(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- ── categories ───────────────────────────────────────────────────────────────
CREATE INDEX idx_categories_module      ON public.categories(module);
CREATE INDEX idx_categories_parent_id   ON public.categories(parent_id);
CREATE INDEX idx_categories_sort_order  ON public.categories(module, sort_order);

-- ── places — core query patterns ─────────────────────────────────────────────
-- All directory listing pages filter by these
CREATE INDEX idx_places_place_type     ON directory.places(place_type);
CREATE INDEX idx_places_category_id    ON directory.places(category_id);
CREATE INDEX idx_places_status         ON directory.places(status);
CREATE INDEX idx_places_owner_id       ON directory.places(owner_id);
CREATE INDEX idx_places_featured       ON directory.places(featured) WHERE featured = true;
CREATE INDEX idx_places_verified       ON directory.places(verified) WHERE verified = true;
CREATE INDEX idx_places_plan_type      ON directory.places(plan_type);
CREATE INDEX idx_places_created_at     ON directory.places(created_at DESC);
CREATE INDEX idx_places_deleted_at     ON directory.places(deleted_at) WHERE deleted_at IS NULL;

-- Active places — the most common filter, partial index for speed
CREATE INDEX idx_places_active ON directory.places(place_type, category_id)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Geospatial — lat/lng bounding box queries (e.g. "places near me")
CREATE INDEX idx_places_location ON directory.places(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Slug lookups — used on every detail page
CREATE UNIQUE INDEX idx_places_slug ON directory.places(slug);

-- ── places — Full-Text Search (Phase 1) ──────────────────────────────────────
-- tsvector column for fast FTS without external search service.
-- Searches across: name_es, name_en, short_desc_es, description_es, address.
-- Uses 'spanish' dictionary for stemming + unaccent for accent-insensitive search.

ALTER TABLE directory.places ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish',
      unaccent(coalesce(name_es, '')) || ' ' ||
      unaccent(coalesce(name_en, ''))
    ), 'A') ||
    setweight(to_tsvector('spanish',
      unaccent(coalesce(short_desc_es, ''))
    ), 'B') ||
    setweight(to_tsvector('spanish',
      unaccent(coalesce(description_es, '')) || ' ' ||
      unaccent(coalesce(address, '')) || ' ' ||
      unaccent(coalesce(neighborhood, ''))
    ), 'C')
  ) STORED;

-- GIN index on the tsvector — makes FTS fast
CREATE INDEX idx_places_fts_es ON directory.places USING gin(fts_es);

-- Trigram index for ILIKE fuzzy search (e.g. user types "bodag" → finds "bodega")
CREATE INDEX idx_places_name_trgm ON directory.places
  USING gin(unaccent(name_es) gin_trgm_ops);

-- ── articles ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_articles_status       ON content.articles(status);
CREATE INDEX idx_articles_category     ON content.articles(category_id);
CREATE INDEX idx_articles_published_at ON content.articles(published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_articles_featured     ON content.articles(is_featured)
  WHERE is_featured = true AND status = 'published';
CREATE INDEX idx_articles_source_type  ON content.articles(source_type);

-- Articles FTS
ALTER TABLE content.articles ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', unaccent(coalesce(title_es, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(excerpt_es, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(content_es, ''))), 'C')
  ) STORED;

CREATE INDEX idx_articles_fts_es ON content.articles USING gin(fts_es);

-- ── listings ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_listings_seller_id  ON listings.listings(seller_id);
CREATE INDEX idx_listings_category   ON listings.listings(category_id);
CREATE INDEX idx_listings_status     ON listings.listings(status);
CREATE INDEX idx_listings_expires_at ON listings.listings(expires_at)
  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_listings_created_at ON listings.listings(created_at DESC);

-- Active listings composite
CREATE INDEX idx_listings_active ON listings.listings(category_id, created_at DESC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- Listings FTS
ALTER TABLE listings.listings ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(description, ''))), 'B')
  ) STORED;

CREATE INDEX idx_listings_fts_es ON listings.listings USING gin(fts_es);

-- ── jobs ──────────────────────────────────────────────────────────────────────
CREATE INDEX idx_jobs_business_id  ON jobs.jobs(business_id);
CREATE INDEX idx_jobs_category     ON jobs.jobs(category_id);
CREATE INDEX idx_jobs_status       ON jobs.jobs(status);
CREATE INDEX idx_jobs_job_type     ON jobs.jobs(job_type);
CREATE INDEX idx_jobs_expires_at   ON jobs.jobs(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_jobs_created_at   ON jobs.jobs(created_at DESC);

-- Jobs FTS
ALTER TABLE jobs.jobs ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(requirements, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(description, ''))), 'C')
  ) STORED;

CREATE INDEX idx_jobs_fts_es ON jobs.jobs USING gin(fts_es);

-- ── events ────────────────────────────────────────────────────────────────────
CREATE INDEX idx_events_organizer_id ON events.events(organizer_id);
CREATE INDEX idx_events_category     ON events.events(category_id);
CREATE INDEX idx_events_status       ON events.events(status);
CREATE INDEX idx_events_starts_at    ON events.events(starts_at);
CREATE INDEX idx_events_featured     ON events.events(is_featured)
  WHERE is_featured = true AND status = 'active';

-- Upcoming events (most common query)
CREATE INDEX idx_events_upcoming ON events.events(starts_at ASC)
  WHERE status = 'active' AND deleted_at IS NULL;

-- ── reviews ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_reviews_place_id  ON directory.reviews(place_id);
CREATE INDEX idx_reviews_author_id ON directory.reviews(author_id);
CREATE INDEX idx_reviews_status    ON directory.reviews(status);
CREATE INDEX idx_reviews_rating    ON directory.reviews(rating);

-- ── reports ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_reports_entity      ON moderation.reports(entity_type, entity_id);
CREATE INDEX idx_reports_reporter_id ON moderation.reports(reporter_id);
CREATE INDEX idx_reports_status      ON moderation.reports(status);

-- ── analytics ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_analytics_entity     ON analytics.analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_event_type ON analytics.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics.analytics_events(created_at DESC);
-- Dashboard query: "views for business X in last 30 days"
CREATE INDEX idx_analytics_entity_date ON analytics.analytics_events(entity_id, created_at DESC)
  WHERE entity_id IS NOT NULL;

-- ── ai.embeddings ─────────────────────────────────────────────────────────────
-- ivfflat index for approximate nearest neighbor search (Phase 3)
-- lists=100 is good for up to ~1M vectors; increase to 200 at 1M+
CREATE INDEX idx_embeddings_entity  ON ai.embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_vector  ON ai.embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
