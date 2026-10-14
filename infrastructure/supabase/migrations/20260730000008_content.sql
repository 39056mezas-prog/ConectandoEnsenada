-- Migration 008: content.articles (applied to project pdoznhmckwovmrerlcro)
CREATE TABLE content.articles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  title_es        text        NOT NULL,
  title_en        text,
  slug            text        NOT NULL UNIQUE,
  excerpt_es      text,
  excerpt_en      text,
  content_es      text,
  content_en      text,
  featured_image  text,
  category_id     uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  source_type     text        NOT NULL DEFAULT 'editorial' CHECK (source_type IN ('editorial', 'government')),
  source_url      text,
  source_name     text,
  status          text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  published_at    timestamptz,
  is_featured     boolean     NOT NULL DEFAULT false,
  seo_title       text,
  seo_description text,
  view_count      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
COMMENT ON TABLE content.articles IS 'News articles. Editorial (team-written) and government (RSS-imported) content.';

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON content.articles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE content.article_tags (
  article_id  uuid NOT NULL REFERENCES content.articles(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES public.tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE content.articles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_public_read" ON content.articles FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "articles_author_read" ON content.articles FOR SELECT
  USING (author_id = auth.uid());
CREATE POLICY "articles_editor_all" ON content.articles FOR ALL
  USING (public.is_moderator_or_above() OR EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = auth.uid() AND pr.role = 'editor' AND pr.is_banned = false));

CREATE POLICY "article_tags_public_read" ON content.article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags_editor_all"  ON content.article_tags FOR ALL USING (public.is_moderator_or_above());

GRANT USAGE ON SCHEMA content TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA content TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA content TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT ALL ON TABLES TO service_role;
