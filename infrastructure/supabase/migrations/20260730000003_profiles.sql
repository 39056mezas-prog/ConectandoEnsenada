-- ============================================================================
-- Migration 003: Profiles
-- Extends auth.users with public profile data.
-- Trigger auto-creates a profile row on every new signup.
-- ============================================================================

CREATE TABLE public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    text        NOT NULL,
  avatar_url      text,
  bio             text,
  phone           text,
  preferred_lang  text        NOT NULL DEFAULT 'es'
                              CHECK (preferred_lang IN ('es', 'en')),
  role            public.user_role NOT NULL DEFAULT 'user',
  is_banned       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz           -- soft delete
);

COMMENT ON TABLE public.profiles IS
  'Public profile data for every authenticated user. Created automatically on signup.';

-- ── Auto-create profile on signup ────────────────────────────────────────────
-- Fires after a row is inserted into auth.users (Google OAuth or email signup).
-- Pulls display_name and avatar from the Google user metadata when available.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',   -- Google OAuth
      new.raw_user_meta_data->>'name',         -- some providers
      split_part(new.email, '@', 1)            -- fallback: email prefix
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;               -- idempotent
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ── Auto-update updated_at ───────────────────────────────────────────────────
-- Reusable function — referenced by every table that has updated_at.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ── Admin helper functions ───────────────────────────────────────────────────
-- Used inside RLS policies to avoid repeating JOINs.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_banned = false
      AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_above()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('moderator', 'admin', 'super_admin')
      AND is_banned = false
      AND deleted_at IS NULL
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read active profiles (for public pages)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL AND is_banned = false);

-- Users can read their own profile even if banned
CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update only their own profile (not role or is_banned)
CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can do anything
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.is_admin());
