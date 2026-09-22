-- ============================================================================
-- Migration 013: ads schema
-- Advertising infrastructure. Tables are created now so the schema exists,
-- but the system is only activated in Phase 4.
-- Placement types: homepage_banner, directory_featured, sidebar, search_sponsored
-- ============================================================================

CREATE TABLE ads.ad_campaigns (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  place_id       uuid        REFERENCES directory.places(id) ON DELETE SET NULL,
  name           text        NOT NULL,
  status         text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','active','paused','ended','rejected')),
  starts_at      timestamptz,
  ends_at        timestamptz,
  budget         numeric(10, 2),
  currency       text        NOT NULL DEFAULT 'MXN',
  notes          text,       -- internal notes (admin only)
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER ad_campaigns_updated_at
  BEFORE UPDATE ON ads.ad_campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE ads.ad_placements (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid    NOT NULL REFERENCES ads.ad_campaigns(id) ON DELETE CASCADE,
  placement_type   text    NOT NULL
                           CHECK (placement_type IN (
                             'homepage_banner',
                             'directory_featured',
                             'sidebar',
                             'search_sponsored',
                             'category_banner'
                           )),
  content_type     text    NOT NULL DEFAULT 'image'
                           CHECK (content_type IN ('image','text','combined')),
  image_url        text,
  headline         text,
  description      text,
  target_url       text    NOT NULL,
  -- Stats (updated by Edge Function on each impression/click)
  impression_count integer NOT NULL DEFAULT 0,
  click_count      integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE ads.ad_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads.ad_placements ENABLE ROW LEVEL SECURITY;

-- Public sees only active placements (for rendering ads on pages)
CREATE POLICY "ad_placements_public_read" ON ads.ad_placements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ads.ad_campaigns
    WHERE id = campaign_id
      AND status = 'active'
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at   IS NULL OR ends_at   > now())
  ));

-- Advertisers can manage their own campaigns
CREATE POLICY "ad_campaigns_advertiser_read" ON ads.ad_campaigns FOR SELECT
  USING (advertiser_id = auth.uid());

CREATE POLICY "ad_campaigns_advertiser_insert" ON ads.ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND advertiser_id = auth.uid());

-- Admins manage everything
CREATE POLICY "ad_campaigns_admin_all"  ON ads.ad_campaigns  FOR ALL USING (public.is_admin());
CREATE POLICY "ad_placements_admin_all" ON ads.ad_placements FOR ALL USING (public.is_admin());
