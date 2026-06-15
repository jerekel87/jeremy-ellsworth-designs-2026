/*
  # Create project_categories table (Work listing filters)

  ## Summary
  Adds a `project_categories` table that drives the filter tabs on the public
  Work listing (/work) and lets the admin manage the available work categories.
  Each project references a category through its existing `projects.cat` text
  column, matched against `project_categories.key`.

  ## 1. New Tables
  - `project_categories`
    - `id` (uuid, primary key)
    - `key` (text, unique, not null) — filter slug stored on projects.cat
    - `label` (text, not null) — display name shown on the filter tab
    - `sort_order` (int, default 0) — controls tab order
    - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS. Categories are public marketing data managed from the admin
    (anon key), mirroring the projects table: SELECT/INSERT/UPDATE/DELETE for
    anon + authenticated.

  ## 3. Seed
  - Seeds the five categories currently hard-coded on the Work page, only when
    the table is empty (safe to re-run).
*/

CREATE TABLE IF NOT EXISTS project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_project_categories" ON project_categories;
CREATE POLICY "public_select_project_categories" ON project_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_project_categories" ON project_categories;
CREATE POLICY "public_insert_project_categories" ON project_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_project_categories" ON project_categories;
CREATE POLICY "public_update_project_categories" ON project_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_project_categories" ON project_categories;
CREATE POLICY "public_delete_project_categories" ON project_categories FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM project_categories) THEN
    INSERT INTO project_categories (key, label, sort_order) VALUES
      ('home', 'Home Service', 1),
      ('construction', 'Construction', 2),
      ('food', 'Food & Beverage', 3),
      ('entertainment', 'Entertainment', 4),
      ('web', 'Web Design', 5);
  END IF;
END $$;
