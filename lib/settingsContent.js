/* Single source of truth for site-wide Settings copy.
   The admin editor (pages/admin/Settings.jsx) edits these keys and saves them
   to site_content; public components (Footer, GoogleBadge) read the same keys
   via useSettings(), falling back to these defaults. Keep both in sync by
   importing here.

   NOTE: integration secrets (Anthropic / Resend API keys, from/reply-to
   addresses, inbound webhook secret) are intentionally NOT stored here or in
   site_content — they live only in edge-function env on the server. The admin
   Settings page shows their presence read-only via the integration-status
   edge function; it never reads or writes their values. */

import { useContentMap } from "@/lib/contentApi";

export const SETTINGS_DEFAULTS = {
  "settings.business.legal_name": "Jeremy Ellsworth Designs LLC",
  "settings.business.brand_name": "je.design",
  "settings.business.inquiry_email": "inquiry@jeremynellsworth.com",
  "settings.business.reply_email": "hello@je.design",
  "settings.business.team_size": "10",
  "settings.business.years": "20",
  "settings.proof.rating": "5.0",
  "settings.proof.badge": "Based on 700+ reviews",
  "settings.proof.stories": "1,800+ success stories",
  "settings.proof.brands": "100+",
  "settings.booking.cal_link": "jeremyellsworth/design-consultation",
  "settings.booking.heading": "Book your FREE design consultation",
  "settings.booking.marker": "it's free—grab a slot!",
  "settings.int.anthropic_model": "claude-haiku-4-5",
  "settings.int.cal_user": "jeremyellsworth/design-consultation",
  "settings.int.analytics_provider": "",
  "settings.int.analytics_id": "",
  "settings.int.quote_url": "https://agreement.je.design/get-started",
  "settings.ai.instructions": "",
  "settings.ai.knowledge": `Facts you may use (never invent others):
- 20 years in business, 10-person in-house team
- Every design is drawn by hand, never AI-generated, no templates
- 1,800+ five-star reviews across Google and Facebook (5.0 rating)
- First concepts in 5 to 7 business days, most projects done in 2 to 3 weeks
- Files delivered in AI, SVG, PDF, JPG and PNG, and the client owns everything
- To get a quote or get started, send people to https://agreement.je.design/get-started
- There is also a free design consultation they can book from the homepage

Brand Access Program (our payment plan): $150 down, then $150/month until it's paid off. Full file access from day one, work starts right away, revisions included, cancel anytime after completion. Only bring this up if the person says their budget is tight or asks about payment options. Do not lead with it.`,
  "settings.opt.preloader": "on",
  "settings.opt.smooth_scroll": "on",
  "settings.opt.custom_cursor": "on",
  "settings.opt.concierge": "on",
  "settings.opt.rating_badge": "on",
  "settings.opt.ticket_cut": "on",
  "settings.opt.maintenance": "off",
  "settings.seo.title_template": "%s | je.design",
  "settings.seo.default_title": "je.design — your five-star creative design agency",
  "settings.seo.default_desc": "Premium creative brand agency for small businesses — logos, vehicle wraps, websites and mascots. Drawn by hand, never AI.",
  "settings.seo.share_image": "/assets/img/work/boss-hawgs.jpg",
  "settings.social.instagram": "https://instagram.com/jeremyellsworthdesigns",
  "settings.social.facebook": "https://facebook.com/jeremyellsworthdesigns",
  "settings.social.youtube": "https://youtube.com/@jeremyellsworth",
  "settings.social.x": "https://x.com/je_design",
};

/* Read-only flat map of settings keys for public components, falling back to
   the shared defaults above. */
export function useSettings() {
  const content = useContentMap();
  return (key) => (content[key] != null ? content[key] : (SETTINGS_DEFAULTS[key] ?? ""));
}
