-- Migration 012: analytics + AI (applied to project pdoznhmckwovmrerlcro)
CREATE TABLE analytics.analytics_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   text        NOT NULL,
  entity_type  text,
  entity_id    uuid,
  session_id   text,
  user_id      uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  referrer     text,
  country      text,
  city         text,
  device_type  text        CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  metadata     jsonb       DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE analytics.analytics_events IS 'Privacy-first analytics. No emails, names, or IPs stored. Used for business dashboards.';
ALTER TABLE analytics.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_service_only" ON analytics.analytics_events FOR ALL USING (false);

CREATE TABLE ai.embeddings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text        NOT NULL CHECK (entity_type IN ('place','listing','job','event','article','category')),
  entity_id    uuid        NOT NULL,
  content_es   text,
  content_en   text,
  embedding    vector(1536),
  metadata     jsonb       DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
COMMENT ON TABLE ai.embeddings IS 'Vector embeddings for the Ensenada AI assistant (Phase 3). Uses pgvector.';

CREATE TRIGGER embeddings_updated_at
  BEFORE UPDATE ON ai.embeddings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE ai.embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "embeddings_service_only" ON ai.embeddings FOR ALL USING (false);

CREATE TABLE ai.ai_chat_sessions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token   text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  language        text        NOT NULL DEFAULT 'es' CHECK (language IN ('es','en')),
  message_count   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai.ai_chat_sessions IS 'Chat session tracking for the Ensenada AI assistant. Messages not stored for privacy. Anonymous sessions are handled server-side with the service role.';
ALTER TABLE ai.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions_own" ON ai.ai_chat_sessions FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_sessions_admin" ON ai.ai_chat_sessions FOR ALL
  USING (public.is_admin());

-- analytics + embeddings are service-role only.
GRANT USAGE ON SCHEMA analytics TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO service_role;
GRANT USAGE ON SCHEMA ai TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ai TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai.ai_chat_sessions TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai GRANT ALL ON TABLES TO service_role;
