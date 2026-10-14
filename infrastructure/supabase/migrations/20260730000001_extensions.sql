-- Migration 001: Extensions (applied to project pdoznhmckwovmrerlcro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "vector";     -- pgvector, Phase 3 AI
