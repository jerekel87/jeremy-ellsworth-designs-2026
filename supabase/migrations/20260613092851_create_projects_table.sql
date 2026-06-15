/*
  # Create projects table (portfolio / case studies)

  ## Summary
  Adds the `projects` table that powers the public Work listing (/work), the
  case-study detail pages (/work/:slug) and the admin Projects editor. Project
  content is public marketing/portfolio data, so it is intentionally shared
  with no per-user ownership.

  ## 1. New Tables
  - `projects`
    - `id` (uuid, primary key)
    - `slug` (text, unique, not null) — public URL segment
    - `title` (text, not null)
    - `category` (text)
    - `industry` (text)
    - `cat` (text) — filter bucket used on the Work grid
    - `img` (text) — cover image path
    - `blurb` (text) — case-page hero copy
    - `gallery` (jsonb, default '[]') — ordered image paths
    - `services` (jsonb, default '[]') — related service slugs
    - `deliverables` (jsonb, default '[]') — "The Solution" spec list
    - `testimonial` (jsonb) — { quote, name, company }
    - `external` (text) — original case-study link (nullable)
    - `sort_order` (int, default 0)
    - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS on `projects`.
  - Public marketing content managed from the admin (anon key); SELECT/INSERT/
    UPDATE/DELETE allowed for `anon` and `authenticated`.

  ## 3. Seed
  - Seeds the twelve projects that currently live in lib/projects.js, only when
    the table is empty (safe to re-run).
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text DEFAULT '',
  industry text DEFAULT '',
  cat text DEFAULT '',
  img text DEFAULT '',
  blurb text DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  testimonial jsonb,
  external text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_projects" ON projects;
CREATE POLICY "public_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_projects" ON projects;
CREATE POLICY "public_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_projects" ON projects;
CREATE POLICY "public_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_projects" ON projects;
CREATE POLICY "public_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects) THEN
    INSERT INTO projects (slug, title, category, industry, cat, img, blurb, gallery, services, deliverables, testimonial, external, sort_order) VALUES
    ('boss-hawgs-bbq', 'Boss Hawgs BBQ', 'Brand Identity', 'Food & Beverage', 'food', '/assets/img/work/boss-hawgs.jpg',
      'A bold, mouth-watering identity for a backyard-style BBQ brand — built around a mascot with serious attitude and applied across aprons, signage and packaging.',
      '["/assets/img/work/boss-hawgs.jpg","/assets/img/work/stoopid-energy.jpg","/assets/img/mascots/layer-8.jpg","/assets/img/mascots/layer-12.jpg","/assets/img/work/jump-party.jpg","/assets/img/mascots/layer-7.jpg","/assets/img/work/macdavy.jpg","/assets/img/mascots/layer-14.jpg"]'::jsonb,
      '["brand-identity","company-apparel"]'::jsonb,
      '["Logo design","Mascot illustration","Five-page style guide","Apparel & collateral"]'::jsonb,
      '{"quote":"These guys are top notch!! I have had many designers in the past that do not even come close to what these guys put out.","name":"Paul Margott","company":"Window Blasters"}'::jsonb,
      'https://je.design/projects/boss-hawgs-bbq-brand-identity', 1),

    ('stoopid-energy', 'Stoopid Energy', 'Brand Identity + Product', 'Food & Beverage', 'food', '/assets/img/work/stoopid-energy.jpg',
      'An energy drink brand that refuses to whisper — identity and can design engineered to jump off the shelf and into the cooler.',
      '["/assets/img/work/stoopid-energy.jpg","/assets/img/work/boss-hawgs.jpg","/assets/img/mascots/layer-8.jpg","/assets/img/mascots/layer-12.jpg","/assets/img/work/jump-party.jpg","/assets/img/mascots/layer-7.jpg","/assets/img/work/macdavy.jpg","/assets/img/mascots/layer-14.jpg"]'::jsonb,
      '["brand-identity","packaging-labels"]'::jsonb,
      '["Logo design","Can & label design","Five-page style guide","Launch collateral"]'::jsonb,
      '{"quote":"The results were absolutely incredible! The designs exceeded my expectations in every way.","name":"Shevan Rowland","company":"Lakeview Roofing LLC"}'::jsonb,
      'https://je.design/projects/stoopid-energy-brand-identity-product-design', 2),

    ('high-caliber-electric', 'High Caliber Electric', 'Brand Identity', 'Home Service', 'home', '/assets/img/work/high-caliber.jpg',
      'A sharp, trustworthy identity for an electrical contractor — designed to read instantly on trucks, yard signs and business cards alike.',
      '["/assets/img/work/high-caliber.jpg","/assets/img/work/spartan-hvac.jpg","/assets/img/work/salty-soft-wash.jpg","/assets/img/work/macdavy.jpg","/assets/img/revenue/rev-1.jpg","/assets/img/revenue/rev-5.jpg","/assets/img/mascots/layer-9.jpg","/assets/img/mascots/layer-10.jpg"]'::jsonb,
      '["brand-identity","print-collateral"]'::jsonb,
      '["Logo design","Five-page style guide","Business cards","Yard signs"]'::jsonb,
      '{"quote":"Very professional, very quick to respond — and the logo turned out AMAZING!","name":"Ezri Valdes","company":"TrashPanda"}'::jsonb,
      'https://je.design/projects/high-caliber-electric-brand-identity', 3),

    ('spartan-hvac', 'Spartan HVAC', 'Brand Identity', 'Home Service', 'home', '/assets/img/work/spartan-hvac.jpg',
      'A battle-ready brand for an HVAC crew — a mascot-led identity that makes uniforms feel like armor and trucks impossible to miss.',
      '["/assets/img/work/spartan-hvac.jpg","/assets/img/work/high-caliber.jpg","/assets/img/work/salty-soft-wash.jpg","/assets/img/work/macdavy.jpg","/assets/img/revenue/rev-1.jpg","/assets/img/revenue/rev-5.jpg","/assets/img/mascots/layer-9.jpg","/assets/img/mascots/layer-10.jpg"]'::jsonb,
      '["brand-identity","company-apparel"]'::jsonb,
      '["Logo design","Mascot illustration","Five-page style guide","Company apparel"]'::jsonb,
      '{"quote":"Quick turnaround & very professional. I give the team a 10/10.","name":"Julio Santiago","company":"August Hardscapes"}'::jsonb,
      'https://je.design/projects/spartan-hvac-brand-identity', 4),

    ('salty-soft-wash', 'Salty Soft Wash', 'Brand Identity', 'Home Service', 'home', '/assets/img/work/salty-soft-wash.jpg',
      'A coastal-flavored identity for a pressure washing company — wrapped across the fleet for thousands of daily impressions.',
      '["/assets/img/work/salty-soft-wash.jpg","/assets/img/work/high-caliber.jpg","/assets/img/work/spartan-hvac.jpg","/assets/img/work/macdavy.jpg","/assets/img/revenue/rev-1.jpg","/assets/img/revenue/rev-5.jpg","/assets/img/mascots/layer-9.jpg","/assets/img/mascots/layer-10.jpg"]'::jsonb,
      '["brand-identity","vehicle-wraps"]'::jsonb,
      '["Logo design","Vehicle wrap design","Five-page style guide","Collateral design"]'::jsonb,
      '{"quote":"I could not have asked for a better experience. Working with Jeremy was an insane value!","name":"Nick Boyles","company":"Breeze Painting"}'::jsonb,
      'https://je.design/projects/salty-soft-wash-brand-identity', 5),

    ('macdavy-heating-air', 'MacDavy Heating & Air', 'Brand Identity', 'Home Service', 'home', '/assets/img/work/macdavy.jpg',
      'A friendly, memorable face for a heating and air company — identity and collateral that make a local business feel established.',
      '["/assets/img/work/macdavy.jpg","/assets/img/work/high-caliber.jpg","/assets/img/work/spartan-hvac.jpg","/assets/img/work/salty-soft-wash.jpg","/assets/img/revenue/rev-1.jpg","/assets/img/revenue/rev-5.jpg","/assets/img/mascots/layer-9.jpg","/assets/img/mascots/layer-10.jpg"]'::jsonb,
      '["brand-identity","print-collateral"]'::jsonb,
      '["Logo design","Mascot illustration","Business cards","Collateral design"]'::jsonb,
      '{"quote":"They did great at designing my logo. I wouldn''t have gone with anyone else!","name":"Ryan","company":"Big Country Heat & Air"}'::jsonb,
      'https://je.design/projects/macdavy-heating-and-air', 6),

    ('graybeard-construction', 'Graybeard Construction', 'Brand Identity', 'Construction', 'construction', '/assets/img/work/graybeard.jpg',
      'Experience is in the name — a rugged, character-driven identity carried across jerseys, trucks and job-site signage.',
      '["/assets/img/work/graybeard.jpg","/assets/img/work/bison-roofing.jpg","/assets/img/work/big-spring.jpg","/assets/img/mascots/layer-16.jpg","/assets/img/revenue/rev-3.jpg","/assets/img/revenue/rev-4.jpg","/assets/img/mascots/layer-14.jpg","/assets/img/work/salty-soft-wash.jpg"]'::jsonb,
      '["brand-identity","company-apparel"]'::jsonb,
      '["Logo design","Mascot illustration","Company apparel","Five-page style guide"]'::jsonb,
      '{"quote":"These guys are top notch!! I have had many designers in the past that do not even come close to what these guys put out.","name":"Paul Margott","company":"Window Blasters"}'::jsonb,
      'https://je.design/projects/graybeard-construction-and-maintenance-brand-identity', 7),

    ('bison-roofing', 'Bison Roofing & Construction', 'Brand Identity', 'Construction', 'construction', '/assets/img/work/bison-roofing.jpg',
      'A heavyweight mark for a roofing crew — strength you can read from the street, applied from helmets to estimates.',
      '["/assets/img/work/bison-roofing.jpg","/assets/img/work/graybeard.jpg","/assets/img/work/big-spring.jpg","/assets/img/mascots/layer-16.jpg","/assets/img/revenue/rev-3.jpg","/assets/img/revenue/rev-4.jpg","/assets/img/mascots/layer-14.jpg","/assets/img/work/salty-soft-wash.jpg"]'::jsonb,
      '["brand-identity","print-collateral"]'::jsonb,
      '["Logo design","Five-page style guide","Print collateral","Yard signs"]'::jsonb,
      '{"quote":"The results were absolutely incredible! The designs exceeded my expectations in every way.","name":"Shevan Rowland","company":"Lakeview Roofing LLC"}'::jsonb,
      'https://je.design/projects/bison-roofing-and-construction', 8),

    ('big-spring-builders', 'Big Spring Builders, Co.', 'Brand Identity', 'Construction', 'construction', '/assets/img/work/big-spring.jpg',
      'A classic, established feel for a builder that plays the long game — identity, fleet graphics and collateral in one cohesive system.',
      '["/assets/img/work/big-spring.jpg","/assets/img/work/graybeard.jpg","/assets/img/work/bison-roofing.jpg","/assets/img/mascots/layer-16.jpg","/assets/img/revenue/rev-3.jpg","/assets/img/revenue/rev-4.jpg","/assets/img/mascots/layer-14.jpg","/assets/img/work/salty-soft-wash.jpg"]'::jsonb,
      '["brand-identity","vehicle-wraps","print-collateral"]'::jsonb,
      '["Logo design","Vehicle graphics","Five-page style guide","Collateral design"]'::jsonb,
      '{"quote":"Very professional, very quick to respond — and the logo turned out AMAZING!","name":"Ezri Valdes","company":"TrashPanda"}'::jsonb,
      'https://je.design/projects/big-spring-builders-co-brand-identity', 9),

    ('jump-party', 'Jump Party!', 'Brand Identity', 'Party / Entertainment', 'entertainment', '/assets/img/work/jump-party.jpg',
      'Pure bottled fun — a high-energy identity for a party rental company, built to make kids point and parents remember.',
      '["/assets/img/work/jump-party.jpg","/assets/img/mascots/layer-7.jpg","/assets/img/mascots/layer-19.jpg","/assets/img/work/boss-hawgs.jpg","/assets/img/mascots/layer-21.jpg","/assets/img/work/stoopid-energy.jpg","/assets/img/mascots/layer-11.jpg","/assets/img/mascots/layer-13.jpg"]'::jsonb,
      '["brand-identity","company-apparel"]'::jsonb,
      '["Logo design","Mascot illustration","Company apparel","Five-page style guide"]'::jsonb,
      '{"quote":"Quick turnaround & very professional. I give the team a 10/10.","name":"Julio Santiago","company":"August Hardscapes"}'::jsonb,
      'https://je.design/projects/jump-party-brand-identity', 10),

    ('zero-gravity-atv', 'Zero Gravity ATV Rental', 'Website Design', 'Recreation', 'web', '/assets/img/work/zero-gravity.jpg',
      'An adrenaline-first website for an ATV rental outfit — built to get visitors from landing page to booked ride in as few clicks as possible.',
      '["/assets/img/work/zero-gravity.jpg","/assets/img/work/bags-website.jpg","/assets/img/work/zero-gravity.jpg","/assets/img/work/bags-website.jpg","/assets/img/revenue/rev-6.jpg","/assets/img/revenue/rev-8.jpg","/assets/img/work/zero-gravity.jpg","/assets/img/work/bags-website.jpg"]'::jsonb,
      '["websites"]'::jsonb,
      '["Website design","Development","Booking flow","Content layout"]'::jsonb,
      '{"quote":"I could not have asked for a better experience. Working with Jeremy was an insane value!","name":"Nick Boyles","company":"Breeze Painting"}'::jsonb,
      NULL, 11),

    ('bags', 'Bags', 'Website Design', 'Fashion / eCommerce', 'web', '/assets/img/work/bags-website.jpg',
      'A clean, conversion-focused storefront for a fashion brand — product-first layouts that let the merchandise do the talking.',
      '["/assets/img/work/bags-website.jpg","/assets/img/work/zero-gravity.jpg","/assets/img/work/zero-gravity.jpg","/assets/img/work/bags-website.jpg","/assets/img/revenue/rev-6.jpg","/assets/img/revenue/rev-8.jpg","/assets/img/work/zero-gravity.jpg","/assets/img/work/bags-website.jpg"]'::jsonb,
      '["websites"]'::jsonb,
      '["Website design","Development","eCommerce layout","Brand application"]'::jsonb,
      '{"quote":"They did great at designing my logo. I wouldn''t have gone with anyone else!","name":"Ryan","company":"Big Country Heat & Air"}'::jsonb,
      NULL, 12);
  END IF;
END $$;
