/*
  # Create assistant_actions audit table

  ## Summary
  Records every content change the Studio Assistant (Claude tool-use) makes on
  behalf of the admin, so the owner has a transparent, reviewable audit trail of
  what the AI did and when.

  ## 1. New Table
  - `assistant_actions`
    - `id` (uuid, primary key)
    - `action` (text) — the tool name that ran, e.g. 'create_review'
    - `entity` (text) — the content type, e.g. 'review', 'project'
    - `entity_id` (text, nullable) — id/slug/key of the affected record
    - `summary` (text) — short human-readable description of the change
    - `detail` (jsonb) — the payload that was written
    - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS.
  - The edge function writes rows using the service role (bypasses RLS).
  - Authenticated admins may read and insert (read drives the audit log view).
*/

CREATE TABLE IF NOT EXISTS assistant_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL DEFAULT '',
  entity text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  summary text NOT NULL DEFAULT '',
  detail jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assistant_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_assistant_actions" ON assistant_actions;
CREATE POLICY "auth_select_assistant_actions" ON assistant_actions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_assistant_actions" ON assistant_actions;
CREATE POLICY "auth_insert_assistant_actions" ON assistant_actions FOR INSERT
  TO authenticated WITH CHECK (true);
