/*
  # Create reviews table (single-tenant CMS content)

  ## Summary
  Adds the `reviews` table that powers the public home-page review marquee,
  the service-page testimonials and the admin Reviews workspace. The brand's
  reviews are real, public testimonials sourced from Google & Facebook, so the
  data is intentionally public/shared — there is no per-user ownership.

  ## 1. New Tables
  - `reviews`
    - `id` (uuid, primary key) — stable identifier
    - `name` (text, not null) — reviewer's name
    - `company` (text, not null) — reviewer's business
    - `short` (text, not null) — punchy excerpt shown on the marquee cards
    - `full_text` (text, not null) — complete review shown in the lightbox
    - `source` (text, default 'Google') — Google or Facebook (verification)
    - `rating` (int, default 5) — star rating 1–5
    - `featured` (boolean, default true) — whether shown on the public site
    - `sort_order` (int, default 0) — display ordering
    - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS on `reviews`.
  - Reviews are intentionally public content managed from the admin, which uses
    the anon key. Policies therefore allow SELECT/INSERT/UPDATE/DELETE for both
    `anon` and `authenticated` with `USING (true)` / `WITH CHECK (true)`.

  ## 3. Seed
  - Seeds the six featured reviews that currently live in `lib/reviews.js`,
    only when the table is empty (safe to re-run).
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  short text NOT NULL,
  full_text text NOT NULL,
  source text NOT NULL DEFAULT 'Google',
  rating int NOT NULL DEFAULT 5,
  featured boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_reviews" ON reviews;
CREATE POLICY "public_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_reviews" ON reviews;
CREATE POLICY "public_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_reviews" ON reviews;
CREATE POLICY "public_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM reviews) THEN
    INSERT INTO reviews (name, company, short, full_text, source, rating, sort_order) VALUES
    ('Shevan Rowland', 'Lakeview Roofing LLC',
     'I recently had the pleasure of working with this company for a logo design, t-shirt design, yard sign design, and several other projects. The results were absolutely incredible! The designs exceeded my expectations in every way.',
     'I recently had the pleasure of working with this company for a logo design, t-shirt design, yard sign design, and several other projects. The results were absolutely incredible! The designs exceeded my expectations in every way. Communication was seamless throughout the entire process, and the delivery was outstanding. Highly recommend their services!',
     'Google', 5, 1),
    ('Ryan', 'Big Country Heat & Air',
     'They did great at designing my logo. I wouldn''t have gone with anyone else!',
     'They did great at designing my logo. I wouldn''t have gone with anyone else!',
     'Google', 5, 2),
    ('Paul Margott', 'Window Blasters',
     'These guys are top notch!! I have had many designers in the past that do not even come close to what these guys put out. I am extremely happy with the design of my logo and I know for sure it is going to grab attention.',
     'These guys are top notch!! Seriously, I have had many designers in the past that do not even come close to what these guys put out. I am extremely happy with the design of my logo and I know for sure without a doubt it is going to grab attention. I am so happy in fact that I am having them do any and all design work my company has going forward including shirts and business cards which are in the process. Well worth paying the money for something such as the face of your company.',
     'Google', 5, 3),
    ('Ezri Valdes', 'TrashPanda',
     'I 100% recommend working with Jeremy and his team. He is very professional, very quick to respond and the logo he did for my small business turned out AMAZING!',
     'I 100% recommend working with Jeremy and his team. He is very professional, very quick to respond and the logo he did for my small business turned out AMAZING! His work is well worth the money and I for sure will be using his services again in the future!',
     'Google', 5, 4),
    ('Julio Santiago', 'August Hardscapes',
     'My experience with the Jeremy Ellsworth team was phenomenal. They brought my existing logo to life with some beautiful colors that really help my brand pop. Quick turnaround & very professional. I give the team a 10/10.',
     'My experience with the Jeremy Ellsworth team was phenomenal. They brought my existing logo to life with some beautiful colors that really help my brand pop. Quick turnaround & very professional. Super on point with the few versions of logos they showed me and they were quick to finish everything up & provide me the final files. I give the team a 10/10. Would absolutely use again and highly recommend you guys to use them to keep your brand cohesive throughout.',
     'Google', 5, 5),
    ('Nick Boyles', 'Breeze Painting',
     'Their communication was excellent — I was constantly informed and updated on the process and timeline. Not to mention the quality of our new logo is incredible. Working with Jeremy was an insane value!',
     'I had a fantastic experience working with Jeremy and the team on a new logo for my business. Their communication was excellent, I was constantly informed and updated on the process and timeline. I could not have asked for a better experience. Not to mention the quality of our new logo is incredible. Working with Jeremy was an insane value!',
     'Google', 5, 6);
  END IF;
END $$;
