-- ============================================================================
-- Migration 010: jobs.jobs
-- Job board. Only verified business accounts with plan Pro+ can post.
-- No CV storage — candidates apply directly to the employer.
-- ============================================================================

CREATE TABLE jobs.jobs (
  id                uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Must be a verified place (business) with plan = pro or enterprise
  business_id       uuid              NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,

  -- ── Content ───────────────────────────────────────────────────────────────
  title             text              NOT NULL,
  slug              text              NOT NULL UNIQUE,
  description       text              NOT NULL,
  requirements      text,
  benefits          text,
  category_id       uuid              REFERENCES public.categories(id) ON DELETE SET NULL,

  -- ── Job details ───────────────────────────────────────────────────────────
  job_type          public.job_type   NOT NULL DEFAULT 'full_time',
  location_type     public.location_type NOT NULL DEFAULT 'on_site',

  -- ── Compensation ──────────────────────────────────────────────────────────
  salary_min        numeric(10, 2),
  salary_max        numeric(10, 2),
  salary_currency   text              NOT NULL DEFAULT 'MXN',
  salary_period     text              NOT NULL DEFAULT 'month'
                                      CHECK (salary_period IN ('hour','day','week','month','year')),
  salary_visible    boolean           NOT NULL DEFAULT true,

  -- ── How to apply (no internal CV storage) ────────────────────────────────
  -- Candidates contact the employer directly using this information.
  apply_method      text              NOT NULL DEFAULT 'email'
                                      CHECK (apply_method IN ('email','phone','url','in_person')),
  apply_contact     text              NOT NULL,
                    -- email address, phone number, URL, or "Presentarse en"

  -- ── Status ────────────────────────────────────────────────────────────────
  status            public.place_status NOT NULL DEFAULT 'pending',
  expires_at        timestamptz,
  view_count        integer           NOT NULL DEFAULT 0,
  application_count integer           NOT NULL DEFAULT 0,
                    -- Incremented by app when someone clicks "Apply" — no data stored

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at        timestamptz       NOT NULL DEFAULT now(),
  updated_at        timestamptz       NOT NULL DEFAULT now(),
  deleted_at        timestamptz,

  -- Salary range must be valid
  CONSTRAINT salary_range_valid CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
  )
);

COMMENT ON TABLE jobs.jobs IS
  'Job listings. Only verified businesses with Pro+ plan can post. No CV storage.';
COMMENT ON COLUMN jobs.jobs.application_count IS
  'Click counter only. No personal data from applicants is stored on the platform.';

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs.jobs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── Auto-expire jobs ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION jobs.set_expiry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + INTERVAL '60 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_set_expiry
  BEFORE INSERT ON jobs.jobs
  FOR EACH ROW EXECUTE PROCEDURE jobs.set_expiry();

-- ── Enforce: only verified Pro+ businesses can post jobs ─────────────────────
CREATE OR REPLACE FUNCTION jobs.check_business_can_post(business uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM directory.places
    WHERE id = business
      AND verified = true
      AND plan_type IN ('pro', 'enterprise')
      AND status = 'active'
      AND deleted_at IS NULL
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE jobs.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_public_read" ON jobs.jobs FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "jobs_business_read" ON jobs.jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM directory.places WHERE id = business_id AND owner_id = auth.uid()
  ));

CREATE POLICY "jobs_business_insert" ON jobs.jobs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND jobs.check_business_can_post(business_id)
    AND EXISTS (
      SELECT 1 FROM directory.places WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "jobs_business_update" ON jobs.jobs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM directory.places WHERE id = business_id AND owner_id = auth.uid()
  ));

CREATE POLICY "jobs_admin_all" ON jobs.jobs FOR ALL
  USING (public.is_moderator_or_above());
