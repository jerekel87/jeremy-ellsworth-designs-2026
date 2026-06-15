CREATE TABLE IF NOT EXISTS concierge_conversations (
  visitor_id text PRIMARY KEY,
  ip text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  agent text NOT NULL DEFAULT '',
  thread jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_sender text NOT NULL DEFAULT '',
  seen boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE concierge_conversations ENABLE ROW LEVEL SECURITY;

-- Visitor conversations are written only by the concierge edge function using
-- the service role (which bypasses RLS). No anon access. Authenticated admins
-- may read them for support visibility.
CREATE POLICY "admin_select_concierge_conversations" ON concierge_conversations FOR SELECT
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_concierge_conversations_ip ON concierge_conversations (ip);
CREATE INDEX IF NOT EXISTS idx_concierge_conversations_updated_at ON concierge_conversations (updated_at DESC);
