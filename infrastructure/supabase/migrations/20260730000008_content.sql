-- ============================================================================
-- Migration 008: content.articles
-- Powers the News module. Two source types:
--   'editorial'  → written by the team (TipTap editor in admin panel)
--   'government' → imported from official RSS feeds (cron job, Phase 2)
-- ============================================================================

CREATE TABLE content.articles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- ── Content (bilingual) ───────────────────────────────────────────────────
  title_es        text        NOT NULL,
  title_en        text,
  slug            text        NOT NULL UNIQUE,
  excerpt_es      text,                     -- shown in cards / meta description
  excerpt_en      text,
  content_es      text,                     -- HTML from TipTap editor
  content_en      text,
  featured_image  text,                     -- Supabase Storage URL

  -- ── Classification ────────────────────────────────────────────────────────
  category_id     uuid        REFERENCES public.categories(id) ON DELETE SET NULL,

  -- ── Source ────────────────────────────────────────────────────────────────
  source_type     text        NOT NULL DEFAULT 'editorial'
                              CHECK (source_type IN ('editorial', 'government')),
  source_url      text,       -- original URL (government articles only)
  source_name     text,       -- e.g. "Ayuntamiento de Ensenada"

  -- ── Publishing ────────────────────────────────────────────────────────────
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','review','published','archived')),
  published_at    timestamptz,
  is_featured     boolean     NOT NULL DEFAULT false,

  -- ── SEO ───────────────────────────────────────────────────────────────────
  seo_title       text,
  seo_description text,

  -- ── Stats ─────────────────────────────────────────────────────────────────
  view_count      integer     NOT NULL DEFAULT 0,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

COMMENT ON TABLE content.articles IS
  'News articles. Editorial (team-written) and government (RSS-imported) content.';

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON content.articles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── article_tags (many-to-many) ───────────────────────────────────────────────
CREATE TABLE content.article_tags (
  article_id  uuid NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES public.tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE content.articles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.article_tags ENABLE ROW LEVEL SECURITY;

-- Public reads published, non-deleted articles
CREATE POLICY "articles_public_read" ON content.articles FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

-- Authors can read their own drafts
CREATE POLICY "articles_author_read" ON content.articles FOR SELECT
  USING (author_id = auth.uid());

-- Editors, moderators, and admins can do everything
CREATE POLICY "articles_editor_all" ON content.articles FOR ALL
  USING (
    public.is_moderator_or_above()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "article_tags_public_read" ON content.article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags_editor_all"  ON content.article_tags FOR ALL
  USING (public.is_moderator_or_above());
