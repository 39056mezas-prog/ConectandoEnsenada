-- Migration 010: jobs (applied to project pdoznhmckwovmrerlcro)
-- Only verified Pro+ businesses can post. No CV storage.
CREATE TABLE jobs.jobs (
  id                uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid              NOT NULL REFERENCES directory.places(id) ON DELETE CASCADE,
  title             text              NOT NULL,
  slug              text              NOT NULL UNIQUE,
  description       text              NOT NULL,
  requirements      text,
  benefits          text,
  category_id       uuid              REFERENCES public.categories(id) ON DELETE SET NULL,
  job_type          public.job_type   NOT NULL DEFAULT 'full_time',
  location_type     public.location_type NOT NULL DEFAULT 'on_site',
  salary_min        numeric(10, 2),
  salary_max        numeric(10, 2),
  salary_currency   text              NOT NULL DEFAULT 'MXN',
  salary_period     text              NOT NULL DEFAULT 'month' CHECK (salary_period IN ('hour','day','week','month','year')),
  salary_visible    boolean           NOT NULL DEFAULT true,
  apply_method      text              NOT NULL DEFAULT 'email' CHECK (apply_method IN ('email','phone','url','in_person')),
  apply_contact     text              NOT NULL,
  status            public.place_status NOT NULL DEFAULT 'pending',
  expires_at        timestamptz,
  view_count        integer           NOT NULL DEFAULT 0,
  application_count integer           NOT NULL DEFAULT 0,
  created_at        timestamptz       NOT NULL DEFAULT now(),
  updated_at        timestamptz       NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  CONSTRAINT salary_range_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);
COMMENT ON TABLE jobs.jobs IS 'Job listings. Only verified businesses with Pro+ plan can post. No CV storage.';
COMMENT ON COLUMN jobs.jobs.application_count IS 'Click counter only. No personal data from applicants is stored on the platform.';

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs.jobs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION jobs.set_expiry()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION jobs.check_business_can_post(business uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, directory AS $$
  SELECT EXISTS (
    SELECT 1 FROM directory.places
    WHERE id = business AND verified = true AND plan_type IN ('pro', 'enterprise')
      AND status = 'active' AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION jobs.protect_job_privileged_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, jobs AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT public.is_moderator_or_above() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.business_id IS DISTINCT FROM OLD.business_id
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
       OR NEW.view_count IS DISTINCT FROM OLD.view_count
       OR NEW.application_count IS DISTINCT FROM OLD.application_count THEN
      RAISE EXCEPTION 'Not allowed to change moderation or counter fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_protect_privileged
  BEFORE UPDATE ON jobs.jobs
  FOR EACH ROW EXECUTE PROCEDURE jobs.protect_job_privileged_columns();

ALTER TABLE jobs.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_public_read" ON jobs.jobs FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "jobs_business_read" ON jobs.jobs FOR SELECT
  USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = business_id AND p.owner_id = auth.uid()));

CREATE POLICY "jobs_business_insert" ON jobs.jobs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'pending'
    AND view_count = 0 AND application_count = 0
    AND jobs.check_business_can_post(business_id)
    AND EXISTS (SELECT 1 FROM directory.places p WHERE p.id = business_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "jobs_business_update" ON jobs.jobs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = business_id AND p.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM directory.places p WHERE p.id = business_id AND p.owner_id = auth.uid()));

CREATE POLICY "jobs_admin_all" ON jobs.jobs FOR ALL
  USING (public.is_moderator_or_above());

GRANT USAGE ON SCHEMA jobs TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA jobs TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA jobs TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA jobs GRANT ALL ON TABLES TO service_role;
