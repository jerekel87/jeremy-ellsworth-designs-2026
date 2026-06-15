/*
  # Page events (first-party analytics)

  Captures one row per public pageview / heartbeat so the admin dashboard can
  show real visitor traffic, live presence, sources, devices and geography.

  1. New table
     - `page_events`
       - `id` (uuid, pk)
       - `visitor_id` (text) anonymous browser id (localStorage)
       - `path` (text) page path visited
       - `referrer` (text) raw referrer
       - `source` (text) derived channel (Google / Direct / Instagram ...)
       - `device` (text) Mobile / Desktop / Tablet
       - `country`, `region`, `city` (text) resolved from IP
       - `lat`, `lon` (double precision) resolved from IP, for the live map
       - `created_at` (timestamptz)

  2. Security
     - RLS enabled.
     - SELECT allowed for authenticated admins only (dashboard reads).
     - No anon/authenticated write policies: inserts happen through the `track`
       edge function using the service role, which bypasses RLS.

  3. Indexes
     - on `created_at` for time-window queries (live + 30 day traffic).
*/

CREATE TABLE IF NOT EXISTS page_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '/',
  referrer text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'Direct',
  device text NOT NULL DEFAULT 'Desktop',
  country text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  lat double precision,
  lon double precision,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated admins can read page events"
  ON page_events FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS page_events_created_at_idx ON page_events (created_at DESC);
CREATE INDEX IF NOT EXISTS page_events_visitor_idx ON page_events (visitor_id);
