CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_site_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "auth_insert_site_content" ON site_content FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "auth_update_site_content" ON site_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_delete_site_content" ON site_content FOR DELETE
  TO authenticated USING (true);