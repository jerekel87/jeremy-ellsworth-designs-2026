CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  num text DEFAULT '',
  title text NOT NULL DEFAULT '',
  short text DEFAULT '',
  note text DEFAULT '',
  industries text DEFAULT '',
  description text DEFAULT '',
  bullets jsonb DEFAULT '[]'::jsonb,
  img text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

INSERT INTO services (slug, num, title, short, note, industries, description, bullets, img, sort_order) VALUES
('brand-identity', '01', 'Logo & Branding', '', 'If you only invest in one thing, make it this — everything else we make is built on top of it.', 'HVAC · Electrical · Plumbing · Roofing · Painting · Startups', 'The cornerstone of everything. We research your market, sketch by hand and build an original logo system with a five-page style guide — so every future application stays consistent, from business cards to billboards.', '["Logo design","Five-page style guide","Color & type system","Usage rules"]'::jsonb, '/assets/img/work/boss-hawgs.jpg', 1),
('vehicle-wraps', '02', 'Vehicle Wrap', '', 'One wrapped truck can out-advertise a billboard — and yours is parked in the customer''s neighborhood.', 'Service trucks · Vans · Trailers · Fleets', 'Your trucks are billboards that drive themselves. We design wraps that read instantly at 40mph — bold, legible and impossible to ignore — turning every job site and stoplight into an impression.', '["Full & partial wrap design","Fleet consistency","Print-ready files","Installer coordination"]'::jsonb, '/assets/img/work/salty-soft-wash.jpg', 2),
('websites', '03', 'Website Design & Dev.', 'Website', 'Designed to match your brand exactly — not a theme that looks like everyone else''s.', 'Home service · Rentals · eCommerce · Local business', 'A strategic website that captures your identity and converts visitors into customers. Designed and developed in-house to match your brand exactly — fast, modern and built to grow with you.', '["Design & development","Mobile-first build","Conversion-focused layout","Launch support"]'::jsonb, '/assets/img/work/zero-gravity.jpg', 3),
('print-collateral', '04', 'Print Collateral', '', 'Everything arrives print-ready in AI, SVG and PDF — your printer will thank you.', 'Business cards · Brochures · Menus · Yard signs', 'Business cards, brochures, menus, yard signs — the physical touchpoints that make a small business feel established. Print-crisp files in every format your printer could ask for.', '["Business cards","Brochures & menus","Yard signs","Trade collateral"]'::jsonb, '/assets/img/work/macdavy.jpg', 4),
('packaging-labels', '05', 'Packaging & Labels', 'Package / Labels', 'We design for the shelf and the photo feed — both matter now.', 'Beverage · Food · Retail products', 'Shelf-ready product design that makes customers reach for yours first. From cans to boxes to label systems — designed to pop in a lineup and photograph beautifully.', '["Label design","Package design","Dieline-ready files","Mockups"]'::jsonb, '/assets/img/work/stoopid-energy.jpg', 5),
('company-apparel', '06', 'Company Apparel', '', 'When the crew looks pro, customers assume the work is too.', 'Crews · Uniforms · Trade shows · Merch', 'Shirts and uniforms your crew will actually want to wear. Apparel that turns your team into walking proof that your company has its act together.', '["Shirt & uniform design","Mascot applications","Print-ready artwork","Vendor-ready files"]'::jsonb, '/assets/img/work/graybeard.jpg', 6);
