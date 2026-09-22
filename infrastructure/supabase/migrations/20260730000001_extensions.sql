-- ============================================================================
-- Migration 001: Extensions
-- Run this first. Everything else depends on these.
-- ============================================================================

-- UUID generation (gen_random_uuid() is built-in PG 13+, but this adds
-- uuid_generate_v4() as an alias some tools expect)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search with accent support (búsqueda → busqueda)
-- Used by Supabase FTS in Phase 1 before Meilisearch in Phase 3
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Trigram similarity — powers fuzzy search ("bodag" finds "bodega")
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector embeddings — ready for Phase 3 AI assistant
-- Enabled now so the ai.embeddings table can be created without a migration later
CREATE EXTENSION IF NOT EXISTS "vector";
