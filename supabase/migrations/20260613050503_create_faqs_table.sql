/*
  # Create faqs table (single-tenant CMS content)

  ## Summary
  Adds the `faqs` table that powers the two public FAQ surfaces and the admin
  FAQs workspace:
    - the site-wide FAQ (Home, About, Service pages)
    - the Brand Access Program FAQ (/brand-access-program)
  FAQ copy is public marketing content, so it is intentionally public/shared —
  there is no per-user ownership.

  ## 1. New Tables
  - `faqs`
    - `id` (uuid, primary key)
    - `faq_group` (text, not null) — 'site' or 'bap'
    - `question` (text, not null)
    - `answer` (text, not null) — plain text, rendered escaped on the public site
    - `sort_order` (int, default 0) — display ordering within a group
    - `created_at` (timestamptz, default now())

  ## 2. Security
  - Enable RLS on `faqs`.
  - Public marketing content managed from the admin (anon key); SELECT/INSERT/
    UPDATE/DELETE allowed for `anon` and `authenticated` with USING (true) /
    WITH CHECK (true).

  ## 3. Seed
  - Seeds the seven site FAQs and eight Brand Access FAQs that currently live in
    the page components, only when the table is empty (safe to re-run).
*/

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_group text NOT NULL DEFAULT 'site',
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_faqs" ON faqs;
CREATE POLICY "public_select_faqs" ON faqs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_faqs" ON faqs;
CREATE POLICY "public_insert_faqs" ON faqs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_faqs" ON faqs;
CREATE POLICY "public_update_faqs" ON faqs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_faqs" ON faqs;
CREATE POLICY "public_delete_faqs" ON faqs FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM faqs) THEN
    INSERT INTO faqs (faq_group, question, answer, sort_order) VALUES
    ('site', 'How does payment work?', 'We currently offer the following payment options, ensuring a smooth transaction with je.design: Square Invoicing, Afterpay, Cashapp, Venmo, PayPal Invoicing, and crypto such as Bitcoin, Litecoin, Solana and XRP. If there is a payment option you do not see and you''d like to inquire about it, you may reach out to us at inquiry@jeremynellsworth.com.', 1),
    ('site', 'Which files will I receive?', 'You''ll receive the final design in the following formats: AI, JPG, PNG, SVG, and PDF. For crisp, high-quality printing, we recommend AI, SVG, or PDF files, while JPG and PNG are best for displaying your logo online.', 2),
    ('site', 'How long does it take to complete a project?', 'On average, it takes 2–3 weeks.', 3),
    ('site', 'How many revisions do I get?', 'This depends on what type of package you''re going to get, but it''s typically 5 to 7 revisions.', 4),
    ('site', 'What if I don''t like the design?', 'Our goal is to ensure you feel confident about your brand''s direction from the very first step. We begin every project with a thorough discovery phase, clarifying your vision, objectives, and preferences so we can present a concept that aligns with your goals. If you are not happy and want to pivot or request a different direction, we allow for one concept change early in the process to keep our timeline on track. That way, if something isn''t sitting right, we can address it promptly before moving forward with refinements. By staying in close communication throughout, we strive to deliver a final design that meets — and exceeds — your expectations.', 5),
    ('site', 'How soon before I see the first draft?', 'You can typically expect your initial design within 5 to 7 business days after payment is received. This timeframe allows us to conduct thorough research, explore creative options, and present a well-thought-out concept. In certain cases, we can expedite delivery if your project requires a quicker turnaround.', 6),
    ('site', 'Are your designs 100% original?', 'Absolutely. Every concept we create starts with blank pages and fresh ideas — no templates, no recycled elements. We take pride in doing all of our work in-house at je.design, conducting thorough research and brainstorming to ensure each logo is truly unique.', 7),
    ('bap', 'Is this a subscription?', 'No. It''s a fixed payment plan — $150 down, then $150/month until your project balance is paid off. Once it''s paid, you''re done. No recurring fees, no renewals.', 1),
    ('bap', 'Do I get my files right away?', 'Yes — full file access from day one. We never hold your assets hostage while you''re paying. Every client, no exceptions.', 2),
    ('bap', 'How fast do we start?', 'Immediately. The moment you activate for $150, your project goes into production — no waiting weeks for deposits to clear or approval rounds to schedule.', 3),
    ('bap', 'What if I already have a logo?', 'Perfect — the program covers rebrands and refreshes too. We''ll take what''s working, fix what isn''t, and deliver a brand system you can actually grow with.', 4),
    ('bap', 'Is this only for new businesses?', 'Not at all. We work with new launches and established companies that have outgrown their DIY branding alike.', 5),
    ('bap', 'What types of businesses do you work with?', 'Service-based businesses — trades, contractors and companies that build things: roofing, HVAC, plumbing, electrical, landscaping and beyond.', 6),
    ('bap', 'How do revisions work?', 'They''re included. We work through revision rounds collaboratively until you love it — no per-round fees, no scope creep.', 7),
    ('bap', 'How do I get an instant quote?', 'Click any "Get Instant Quote" button on this page — it takes about 60 seconds and there''s no obligation.', 8);
  END IF;
END $$;
