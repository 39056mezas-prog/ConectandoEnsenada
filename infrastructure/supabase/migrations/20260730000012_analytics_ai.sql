-- ============================================================================
-- Migration 012: Analytics + AI
-- analytics.analytics_events — privacy-first, no PII stored
-- ai.embeddings               — vector store for RAG (Phase 3)
-- ai.ai_chat_sessions         — conversation history (Phase 3)
-- ============================================================================

-- ── analytics_events ─────────────────────────────────────────────────────────
-- Every meaningful user action is logged here for the business dashboard
-- and platform analytics. No names, emails, or IPs stored.

CREATE TABLE analytics.analytics_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- What happened
  event_type   text        NOT NULL,
                           -- 'page_view' | 'place_view' | 'place_contact_click'
                           -- | 'place_phone_click' | 'place_whatsapp_click'
                           -- | 'place_website_click' | 'search' | 'listing_view'
                           -- | 'job_view' | 'job_apply_click' | 'event_view'
  -- What entity was involved
  entity_type  text,       -- 'place' | 'listing' | 'job' | 'event' | 'article'
  entity_id    uuid,
  -- Session (browser-generated, not tied to identity)
  session_id   text,       -- random UUID generated client-side per browser session
  user_id      uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
                           -- null for anonymous visitors
  -- Context (no PII)
  referrer     text,       -- referring URL
  country      text,       -- derived from IP by Vercel Edge (not stored raw)
  city         text,
  device_type  text        CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  -- Payload (arbitrary extra data, no PII)
  metadata     jsonb       DEFAULT '{}',
                           -- e.g. { "search_query": "tacos", "results_count": 12 }
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE analytics.analytics_events IS
  'Privacy-first analytics. No emails, names, or IPs stored. Used for business dashboards.';

-- Partition by month would be ideal at scale — add when row count exceeds 10M
-- For now, a single table with indexes is sufficient.

ALTER TABLE analytics.analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics inserts come from server-side API routes only (service role)
-- Regular users cannot read raw analytics — only aggregated dashboards
CREATE POLICY "analytics_service_only" ON analytics.analytics_events
  FOR ALL USING (false);  -- blocked for all roles; only service_role bypasses RLS

-- ── ai.embeddings ────────────────────────────────────────────────────────────
-- Vector embeddings of all platform content.
-- Used by the "Ensenada AI" assistant for RAG (Phase 3).
-- Table is ready now so Phase 3 doesn't require a schema migration.

CREATE TABLE ai.embeddings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text        NOT NULL
               CHECK (entity_type IN ('place','listing','job','event','article','category')),
  entity_id    uuid        NOT NULL,
  -- The text chunk that was embedded (for display/debugging)
  content_es   text,
  content_en   text,
  -- The embedding vector (1536 dimensions = OpenAI text-embedding-3-small)
  embedding    vector(1536),
  -- Extra context passed to the LLM alongside the retrieved chunk
  metadata     jsonb       DEFAULT '{}',
                           -- e.g. { "name": "Bodega de Santo Tomás", "category": "Vino" }
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id) -- one embedding record per entity (updated on content change)
);

COMMENT ON TABLE ai.embeddings IS
  'Vector embeddings for the Ensenada AI assistant (Phase 3). Uses pgvector.';

CREATE TRIGGER embeddings_updated_at
  BEFORE UPDATE ON ai.embeddings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE ai.embeddings ENABLE ROW LEVEL SECURITY;

-- Embeddings are internal — never exposed directly to users
CREATE POLICY "embeddings_service_only" ON ai.embeddings
  FOR ALL USING (false);

-- ── ai.ai_chat_sessions ───────────────────────────────────────────────────────
CREATE TABLE ai.ai_chat_sessions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token   text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  language        text        NOT NULL DEFAULT 'es' CHECK (language IN ('es','en')),
  message_count   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai.ai_chat_sessions IS
  'Chat session tracking for the Ensenada AI assistant. Messages not stored for privacy.';

ALTER TABLE ai.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions_own" ON ai.ai_chat_sessions FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "chat_sessions_admin" ON ai.ai_chat_sessions FOR ALL
  USING (public.is_admin());
