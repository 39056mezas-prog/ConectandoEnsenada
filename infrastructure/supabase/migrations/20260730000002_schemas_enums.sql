-- ============================================================================
-- Migration 002: Schemas + Enums
-- One schema per domain. Enums are global (public schema).
-- ============================================================================

-- ── Schemas ──────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS directory;   -- places, extensions, reviews
CREATE SCHEMA IF NOT EXISTS content;     -- articles, CMS
CREATE SCHEMA IF NOT EXISTS listings;    -- marketplace classifieds
CREATE SCHEMA IF NOT EXISTS jobs;        -- job board
CREATE SCHEMA IF NOT EXISTS events;      -- city events
CREATE SCHEMA IF NOT EXISTS moderation;  -- reports, review queue
CREATE SCHEMA IF NOT EXISTS analytics;   -- page views, click events
CREATE SCHEMA IF NOT EXISTS ads;         -- campaigns, placements
CREATE SCHEMA IF NOT EXISTS ai;          -- embeddings, chat sessions

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM (
  'user',
  'business_owner',
  'editor',
  'moderator',
  'admin',
  'super_admin'
);

CREATE TYPE public.place_type AS ENUM (
  'business',
  'restaurant',
  'beach',
  'trail',
  'park',
  'attraction',
  'organization',
  'nature_spot',
  'real_estate'
);

CREATE TYPE public.place_status AS ENUM (
  'pending',    -- just submitted, awaiting review
  'active',     -- approved and visible
  'rejected',   -- reviewed and rejected (admin adds reason)
  'suspended'   -- was active, now hidden (e.g. reported)
);

CREATE TYPE public.plan_type AS ENUM (
  'free',
  'starter',
  'pro',
  'enterprise'
);

CREATE TYPE public.report_reason AS ENUM (
  'spam',
  'fake',
  'inappropriate',
  'wrong_info',
  'scam',
  'offensive',
  'duplicate',
  'other'
);

CREATE TYPE public.report_status AS ENUM (
  'pending',
  'reviewed',
  'action_taken',
  'dismissed'
);

CREATE TYPE public.listing_type AS ENUM (
  'marketplace',
  'real_estate'
);

CREATE TYPE public.job_type AS ENUM (
  'full_time',
  'part_time',
  'freelance',
  'internship'
);

CREATE TYPE public.location_type AS ENUM (
  'on_site',
  'hybrid',
  'remote'
);
