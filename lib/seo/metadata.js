/* Metadata composition: best-practice defaults derived from page data + config,
   then per-field admin overrides from Supabase (page_seo) layered on top.
   Returns a Next.js Metadata object. No React — safe in Server Components. */

import { absoluteUrl } from "./config";
import { getPageSeo, resolveConfig } from "./store";

/* Root metadata applied in src/app/layout.tsx. metadataBase lets Next resolve
   every relative canonical / OG image to an absolute URL. Built from the
   effective config (defaults + admin-authored global overrides). */
export async function getBaseMetadata() {
  const cfg = await resolveConfig();
  return {
    metadataBase: new URL(cfg.siteUrl),
    title: {
      default: `${cfg.legalName} | ${cfg.tagline}`,
      template: `%s | ${cfg.brandName}`,
    },
    description: cfg.description,
    applicationName: cfg.brandName,
    keywords: cfg.keywords,
    authors: [{ name: cfg.founder.name }],
    creator: cfg.legalName,
    publisher: cfg.legalName,
    icons: { icon: "/assets/img/logo-white.webp" },
    openGraph: {
      type: "website",
      siteName: cfg.brandName,
      locale: cfg.locale,
      url: cfg.siteUrl,
      images: [{ url: cfg.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.legalName,
      description: cfg.description,
      images: [cfg.defaultOgImage],
    },
    robots: { index: true, follow: true },
  };
}

function clamp(value, max) {
  if (!value) return value;
  return value.length > max ? value.slice(0, max - 1).trimEnd() + "…" : value;
}

/* Merge defaults with admin overrides for a single route.
   - title/description default from the page, then page_seo wins per field.
   - canonical is self-referential unless an override is set.
   - robots_noindex flips the page to noindex,nofollow. */
export async function resolveMetadata({
  path,
  title,
  description,
  image,
  type = "website",
}) {
  const [override, cfg] = await Promise.all([getPageSeo(path), resolveConfig()]);

  const finalTitle = override?.meta_title || title;
  const finalDescription = clamp(
    override?.meta_description || description || cfg.description,
    300
  );
  const finalImage = absoluteUrl(
    override?.og_image || image || cfg.defaultOgImage
  );
  const canonical = override?.canonical_override || absoluteUrl(path);
  const noindex = override?.robots_noindex === true;

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    alternates: { canonical },
    openGraph: {
      type,
      title: finalTitle,
      description: finalDescription,
      url: canonical,
      siteName: cfg.brandName,
      images: [{ url: finalImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [finalImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
