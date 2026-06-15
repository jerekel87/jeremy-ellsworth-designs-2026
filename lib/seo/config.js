/* ── je.design SEO / GEO single source of truth ──────────────────────────────
   Every canonical, OG URL, sitemap entry, robots rule and JSON-LD entity is
   derived from the values here. Items tagged `CONFIRM` should be verified by
   the studio before relying on them for structured data.

   The published host is read from NEXT_PUBLIC_SITE_URL and falls back to the
   primary domain. It MUST be the host that 200s without redirecting. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://je.design"
).replace(/\/$/, "");

export const seoConfig = {
  siteUrl: SITE_URL,
  brandName: "je.design",
  legalName: "Jeremy Ellsworth Designs LLC",
  shortName: "je.design",
  tagline: "Building Brands That Empower Growth",
  description:
    "Jeremy Ellsworth Designs LLC (je.design) is a full-service creative agency specializing in brand identity, vehicle wraps, websites, packaging and print for home-service and small businesses — every project drawn by hand, in-house.",
  logo: `${SITE_URL}/assets/img/logo-white.webp`,
  defaultOgImage: `${SITE_URL}/assets/img/logo-white.webp`, // CONFIRM: replace with a real 1200x630 card
  locale: "en_US",

  founder: {
    name: "Jeremy Ellsworth",
    jobTitle: "Founder & Creative Director",
    sameAs: [], // CONFIRM: LinkedIn / personal profile URLs
  },

  contact: {
    email: "inquiry@jeremynellsworth.com", // CONFIRM: move to an @je.design inbox
    phone: "", // CONFIRM: public phone in +1XXXXXXXXXX form, or leave empty
  },

  address: {
    // CONFIRM: public business address; leave fields empty to omit PostalAddress.
    streetAddress: "",
    addressLocality: "",
    addressRegion: "TX",
    postalCode: "",
    addressCountry: "US",
  },

  geo: {
    // CONFIRM: latitude / longitude if you want a precise map pin.
    latitude: null,
    longitude: null,
  },

  // Public profiles that reinforce the same entity for search + AI engines.
  sameAs: [
    // CONFIRM / claim:
    // "https://www.behance.net/...",
    // "https://dribbble.com/...",
    // "https://clutch.co/profile/...",
    // "https://www.designrush.com/agency/profile/...",
  ],

  reviewStats: {
    // 1,800+ across Google Business + Facebook (confirmed). Aggregate rating
    // markup is intentionally left OFF until per-source counts are itemized.
    count: 1800,
    rating: 5,
    emitAggregateRating: false,
  },

  keywords: [
    "brand identity design",
    "logo design",
    "vehicle wrap design",
    "mascot logo design",
    "home service branding",
    "small business branding",
    "packaging design",
    "website design",
    "Jeremy Ellsworth Designs",
    "je.design",
    "hand-drawn logo design",
    "no-AI logo design",
    "contractor branding",
    "flat-rate branding",
    "branding financing",
    "logo design payment plan",
    "custom mascot logo",
    "esports mascot logo",
    "character logo design",
    "truck wrap design",
    "HVAC branding",
    "plumbing branding",
    "roofing branding",
    "electrician branding",
    "construction branding",
  ],

  services: [
    "Brand Identity & Logo Design",
    "Vehicle Wrap Design",
    "Website Design & Development",
    "Print Collateral",
    "Packaging & Labels",
    "Company Apparel",
  ],
};

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* The set of identity fields the admin can override. siteUrl stays env-derived
   (it's the deploy host, not editable content) so schema @ids remain stable. */
export const EDITABLE_SEO_FIELDS = [
  "brandName",
  "legalName",
  "shortName",
  "tagline",
  "description",
  "defaultOgImage",
  "logo",
];

const str = (v) => (typeof v === "string" ? v.trim() : "");
const arr = (v) => (Array.isArray(v) ? v.filter((x) => str(x)) : []);

/* Deep-merge admin overrides onto the hardcoded defaults. Blank strings and
   empty arrays are ignored so an unset field always falls back to its default.
   Returns a new effective config; never mutates seoConfig. */
export function mergeConfig(overrides) {
  if (!overrides || typeof overrides !== "object") return seoConfig;
  const o = overrides;
  const out = { ...seoConfig };

  for (const key of EDITABLE_SEO_FIELDS) {
    if (str(o[key])) out[key] = str(o[key]);
  }

  out.founder = { ...seoConfig.founder };
  if (o.founder) {
    if (str(o.founder.name)) out.founder.name = str(o.founder.name);
    if (str(o.founder.jobTitle)) out.founder.jobTitle = str(o.founder.jobTitle);
    if (arr(o.founder.sameAs).length) out.founder.sameAs = arr(o.founder.sameAs);
  }

  out.contact = { ...seoConfig.contact };
  if (o.contact) {
    if (str(o.contact.email)) out.contact.email = str(o.contact.email);
    if (str(o.contact.phone)) out.contact.phone = str(o.contact.phone);
  }

  out.address = { ...seoConfig.address };
  if (o.address) {
    for (const k of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry"]) {
      if (str(o.address[k])) out.address[k] = str(o.address[k]);
    }
  }

  if (arr(o.sameAs).length) out.sameAs = arr(o.sameAs);
  if (arr(o.keywords).length) out.keywords = arr(o.keywords);

  return out;
}
