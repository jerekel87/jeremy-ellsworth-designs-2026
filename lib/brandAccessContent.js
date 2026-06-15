/* Single source of truth for the Brand Access Program copy.
   The admin editor (pages/admin/BrandAccess.jsx) edits these keys and saves
   them to site_content; the public page (pages/BrandAccess.jsx) reads the same
   keys, falling back to these defaults. Keep both in sync by importing here. */

export const COMPARE_ROWS = [
  ["To get started", "$150 down", "Months of saving"],
  ["Cash flow", "$150/mo, predictable", "One $5,000+ check"],
  ["Work begins", "Immediately", "Whenever the budget allows"],
  ["Your capital", "Stays in the business", "Tied up in design fees"],
  ["Your brand", "Working from day one", "Still the DIY logo"],
  ["Risk", "Cancel anytime", "All-in, all at once"],
];

export const DELIVERABLES = [
  ["Primary logo + variations", "Dark, light and icon-only formats delivered in every format you need for print, web and signage — AI, SVG, PNG and PDF."],
  ["Brand color palette + typography", "A complete color system with hex codes and carefully selected font pairings that define your brand voice."],
  ["All source files delivered", "Every file format you'll ever need — vector files for print, optimized files for web, and editable source files. AI, SVG, PNG, PDF, EPS."],
  ["Brand guidelines document", "Logo usage rules, minimum sizes, clear space, color applications, and do/don't examples — all in one document."],
  ["Revision rounds included", "We work collaboratively through multiple revision rounds to refine every detail until you love it. No extra fees."],
];

export const STEPS = [
  ["Activate for $150", "One small payment gets your project started. No massive deposit. No financial risk."],
  ["We start immediately", "Once activated, your brand creatives go into production right away. No approval queues."],
  ["Full access while you pay", "Use your files from day one. Pay $150/month until complete — then you're done."],
];

export const STATS = [
  ["100+", "Brands built through Brand Access"],
  ["$150", "To get started — not thousands upfront"],
  ["100%", "File ownership from day one"],
  ["0", "Contracts, lock-ins or hidden fees"],
];

export const BRAND_ACCESS_DEFAULTS = {
  "ba.hero.eyebrow": "Brand Access Program",
  "ba.hero.headline": "Get branded now, pay as you grow",
  "ba.hero.sub": "Full professional branding for $150 down and $150 a month — your capital stays where it belongs: in your business.",
  "ba.hero.proof": "★★★★★ 100+ five-star brands launched through Brand Access",
  "ba.hero.quote_url": "https://agreement.je.design/brand-access-program",
  "ba.pass.down": "$150",
  "ba.pass.number": "NO. 0150",
  "ba.pass.then": "$150 / month until paid off",
  "ba.pass.files": "Full access from day one",
  "ba.pass.starts": "Immediately",
  "ba.problem.headline": "Real branding costs real money",
  "ba.problem.sub": "A brand done right runs thousands — and that's cash most owners need for payroll, trucks and materials.",
  "ba.problem.p1": "$3K–$10K is the honest cost of a full brand done right",
  "ba.problem.p2": "Paying it in one check drains the cash your business runs on",
  "ba.problem.p3": "So the rebrand waits — and the DIY logo keeps costing you jobs",
  "ba.problem.quote": '"We\'ll get to branding when we can afford it." — every owner running on tight cash flow',
  "ba.step1_title": STEPS[0][0],
  "ba.step1_text": STEPS[0][1],
  "ba.step2_title": STEPS[1][0],
  "ba.step2_text": STEPS[1][1],
  "ba.step3_title": STEPS[2][0],
  "ba.step3_text": STEPS[2][1],
  "ba.compare.headline": "Start now, not someday",
  "ba.compare.left": "Brand Access",
  "ba.compare.right": "Saving Up First",
  "ba.compare.r1_label": COMPARE_ROWS[0][0], "ba.compare.r1_us": COMPARE_ROWS[0][1], "ba.compare.r1_them": COMPARE_ROWS[0][2],
  "ba.compare.r2_label": COMPARE_ROWS[1][0], "ba.compare.r2_us": COMPARE_ROWS[1][1], "ba.compare.r2_them": COMPARE_ROWS[1][2],
  "ba.compare.r3_label": COMPARE_ROWS[2][0], "ba.compare.r3_us": COMPARE_ROWS[2][1], "ba.compare.r3_them": COMPARE_ROWS[2][2],
  "ba.compare.r4_label": COMPARE_ROWS[3][0], "ba.compare.r4_us": COMPARE_ROWS[3][1], "ba.compare.r4_them": COMPARE_ROWS[3][2],
  "ba.compare.r5_label": COMPARE_ROWS[4][0], "ba.compare.r5_us": COMPARE_ROWS[4][1], "ba.compare.r5_them": COMPARE_ROWS[4][2],
  "ba.compare.r6_label": COMPARE_ROWS[5][0], "ba.compare.r6_us": COMPARE_ROWS[5][1], "ba.compare.r6_them": COMPARE_ROWS[5][2],
  "ba.compare.foot": "Same five-star brand either way. One starts today.",
  "ba.get.headline": "Everything you need to look professional",
  "ba.get.sub": "No partial deliveries. No locked files. Every asset below is yours to use from day one — click any row for the details.",
  "ba.get.i1_title": DELIVERABLES[0][0], "ba.get.i1_text": DELIVERABLES[0][1],
  "ba.get.i2_title": DELIVERABLES[1][0], "ba.get.i2_text": DELIVERABLES[1][1],
  "ba.get.i3_title": DELIVERABLES[2][0], "ba.get.i3_text": DELIVERABLES[2][1],
  "ba.get.i4_title": DELIVERABLES[3][0], "ba.get.i4_text": DELIVERABLES[3][1],
  "ba.get.i5_title": DELIVERABLES[4][0], "ba.get.i5_text": DELIVERABLES[4][1],
  "ba.get.fineprint": "Exact deliverables confirmed at onboarding based on your package. We deliver design files — printing and installation are handled by your preferred vendors.",
  "ba.testi.quote": "We went from a DIY logo to a brand that gets us taken seriously. Clients now say we look like a million-dollar company.",
  "ba.testi.name": "Marcus R.",
  "ba.testi.attr": "Roofing Contractor, TX",
  "ba.show.headline": "Owners who started here",
  "ba.show.sub": "Service businesses that branded through Brand Access — drawn by hand, on trucks and uniforms today.",
  "ba.show.projects": "high-caliber-electric, spartan-hvac, salty-soft-wash, macdavy-heating-air, graybeard-construction, bison-roofing",
  "ba.stats.s1_value": STATS[0][0], "ba.stats.s1_label": STATS[0][1],
  "ba.stats.s2_value": STATS[1][0], "ba.stats.s2_label": STATS[1][1],
  "ba.stats.s3_value": STATS[2][0], "ba.stats.s3_label": STATS[2][1],
  "ba.stats.s4_value": STATS[3][0], "ba.stats.s4_label": STATS[3][1],
  "ba.industries": "Roofing, HVAC, Plumbing, Electrical, Concrete, Landscaping, Remodeling, Painting, Flooring, Handyman, Lawn Care, Foundations, Pool Service, Fencing, Pest Control, Cleaning, Moving, Demolition",
};
