-- Migration 014: indexes + full-text search (applied to project pdoznhmckwovmrerlcro)

-- unaccent() is only STABLE, so it can't be used in generated columns or index
-- expressions. This IMMUTABLE wrapper is the standard fix. (Hardened in 016.)
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

CREATE INDEX idx_profiles_role       ON public.profiles(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX idx_categories_module      ON public.categories(module);
CREATE INDEX idx_categories_parent_id   ON public.categories(parent_id);
CREATE INDEX idx_categories_sort_order  ON public.categories(module, sort_order);

CREATE INDEX idx_places_place_type     ON directory.places(place_type);
CREATE INDEX idx_places_category_id    ON directory.places(category_id);
CREATE INDEX idx_places_status         ON directory.places(status);
CREATE INDEX idx_places_owner_id       ON directory.places(owner_id);
CREATE INDEX idx_places_featured       ON directory.places(featured) WHERE featured = true;
CREATE INDEX idx_places_verified       ON directory.places(verified) WHERE verified = true;
CREATE INDEX idx_places_plan_type      ON directory.places(plan_type);
CREATE INDEX idx_places_created_at     ON directory.places(created_at DESC);
CREATE INDEX idx_places_active ON directory.places(place_type, category_id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_places_location ON directory.places(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE directory.places ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(name_es, '')) || ' ' || public.f_unaccent(coalesce(name_en, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(short_desc_es, ''))), 'B') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(description_es, '')) || ' ' || public.f_unaccent(coalesce(address, '')) || ' ' || public.f_unaccent(coalesce(neighborhood, ''))), 'C')
  ) STORED;

CREATE INDEX idx_places_fts_es ON directory.places USING gin(fts_es);
CREATE INDEX idx_places_name_trgm ON directory.places USING gin(public.f_unaccent(name_es) gin_trgm_ops);

CREATE INDEX idx_articles_status       ON content.articles(status);
CREATE INDEX idx_articles_category     ON content.articles(category_id);
CREATE INDEX idx_articles_published_at ON content.articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_featured     ON content.articles(is_featured) WHERE is_featured = true AND status = 'published';
CREATE INDEX idx_articles_source_type  ON content.articles(source_type);

ALTER TABLE content.articles ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(title_es, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(excerpt_es, ''))), 'B') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(content_es, ''))), 'C')
  ) STORED;
CREATE INDEX idx_articles_fts_es ON content.articles USING gin(fts_es);

CREATE INDEX idx_listings_seller_id  ON listings.listings(seller_id);
CREATE INDEX idx_listings_category   ON listings.listings(category_id);
CREATE INDEX idx_listings_status     ON listings.listings(status);
CREATE INDEX idx_listings_expires_at ON listings.listings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_listings_created_at ON listings.listings(created_at DESC);
CREATE INDEX idx_listings_active ON listings.listings(category_id, created_at DESC) WHERE status = 'active' AND deleted_at IS NULL;

ALTER TABLE listings.listings ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(description, ''))), 'B')
  ) STORED;
CREATE INDEX idx_listings_fts_es ON listings.listings USING gin(fts_es);

CREATE INDEX idx_jobs_business_id  ON jobs.jobs(business_id);
CREATE INDEX idx_jobs_category     ON jobs.jobs(category_id);
CREATE INDEX idx_jobs_status       ON jobs.jobs(status);
CREATE INDEX idx_jobs_job_type     ON jobs.jobs(job_type);
CREATE INDEX idx_jobs_expires_at   ON jobs.jobs(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_jobs_created_at   ON jobs.jobs(created_at DESC);

ALTER TABLE jobs.jobs ADD COLUMN IF NOT EXISTS fts_es tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(requirements, ''))), 'B') ||
    setweight(to_tsvector('spanish', public.f_unaccent(coalesce(description, ''))), 'C')
  ) STORED;
CREATE INDEX idx_jobs_fts_es ON jobs.jobs USING gin(fts_es);

CREATE INDEX idx_events_organizer_id ON events.events(organizer_id);
CREATE INDEX idx_events_category     ON events.events(category_id);
CREATE INDEX idx_events_status       ON events.events(status);
CREATE INDEX idx_events_starts_at    ON events.events(starts_at);
CREATE INDEX idx_events_featured     ON events.events(is_featured) WHERE is_featured = true AND status = 'active';
CREATE INDEX idx_events_upcoming     ON events.events(starts_at ASC) WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX idx_reviews_place_id  ON directory.reviews(place_id);
CREATE INDEX idx_reviews_author_id ON directory.reviews(author_id);
CREATE INDEX idx_reviews_status    ON directory.reviews(status);
CREATE INDEX idx_reviews_rating    ON directory.reviews(rating);

CREATE INDEX idx_reports_entity      ON moderation.reports(entity_type, entity_id);
CREATE INDEX idx_reports_reporter_id ON moderation.reports(reporter_id);
CREATE INDEX idx_reports_status      ON moderation.reports(status);

CREATE INDEX idx_analytics_entity     ON analytics.analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_event_type ON analytics.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_entity_date ON analytics.analytics_events(entity_id, created_at DESC) WHERE entity_id IS NOT NULL;

-- Foreign-key indexes
CREATE INDEX idx_events_place_id      ON events.events(place_id);
CREATE INDEX idx_place_media_place_id ON directory.place_media(place_id);
CREATE INDEX idx_place_hours_place_id ON directory.place_hours(place_id);
CREATE INDEX idx_listing_media_listing ON listings.listing_media(listing_id);
CREATE INDEX idx_ad_campaigns_advertiser ON ads.ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_placements_campaign  ON ads.ad_placements(campaign_id);
CREATE INDEX idx_articles_author ON content.articles(author_id);

-- HNSW (not ivfflat): works from an empty table, no training step needed.
CREATE INDEX idx_embeddings_entity ON ai.embeddings(entity_type, entity_id);
CREATE INDEX idx_embeddings_vector ON ai.embeddings USING hnsw (embedding vector_cosine_ops);
