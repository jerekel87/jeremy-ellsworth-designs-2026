-- SEO / AI-discoverability layer storage.
-- seo_settings: single-row global entity config (mirrors lib/seo/config.js defaults).
-- page_seo: per-route editable overrides (NULL fields fall back to defaults).
-- ai_visibility_log: tracker for whether AI engines cite the studio.

CREATE TABLE IF NOT EXISTS seo_settings (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_settings_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  og_image text,
  canonical_override text,
  robots_noindex boolean NOT NULL DEFAULT false,
  faq jsonb,
  custom_jsonld jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_visibility_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine text NOT NULL,
  queried_on date NOT NULL DEFAULT CURRENT_DATE,
  cited boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_log ENABLE ROW LEVEL SECURITY;

-- seo_settings + page_seo are public SEO metadata: the published site reads them
-- at render time with the anon key, so SELECT is open. Writes are admin-only.
CREATE POLICY "seo_settings_public_select" ON seo_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "seo_settings_auth_insert" ON seo_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "seo_settings_auth_update" ON seo_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "seo_settings_auth_delete" ON seo_settings FOR DELETE TO authenticated USING (true);

CREATE POLICY "page_seo_public_select" ON page_seo FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "page_seo_auth_insert" ON page_seo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "page_seo_auth_update" ON page_seo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "page_seo_auth_delete" ON page_seo FOR DELETE TO authenticated USING (true);

-- ai_visibility_log is internal analytics: admin-only across the board.
CREATE POLICY "ai_visibility_auth_select" ON ai_visibility_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_visibility_auth_insert" ON ai_visibility_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ai_visibility_auth_update" ON ai_visibility_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ai_visibility_auth_delete" ON ai_visibility_log FOR DELETE TO authenticated USING (true);
