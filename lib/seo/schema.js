/* JSON-LD builders + per-page composers. Pure functions — no React, no async —
   safe to import in Server Components and route handlers. Output is plain
   objects that <JsonLd> serializes into <script type="application/ld+json">. */

import { seoConfig, absoluteUrl } from "./config";

const ORG_ID = `${seoConfig.siteUrl}/#organization`;
const WEBSITE_ID = `${seoConfig.siteUrl}/#website`;
const FOUNDER_ID = `${seoConfig.siteUrl}/#founder`;

function postalAddress(cfg) {
  const a = cfg.address;
  if (!a.streetAddress && !a.addressLocality && !a.postalCode) return undefined;
  return {
    "@type": "PostalAddress",
    ...(a.streetAddress && { streetAddress: a.streetAddress }),
    ...(a.addressLocality && { addressLocality: a.addressLocality }),
    ...(a.addressRegion && { addressRegion: a.addressRegion }),
    ...(a.postalCode && { postalCode: a.postalCode }),
    addressCountry: a.addressCountry,
  };
}

export function organizationSchema(cfg = seoConfig) {
  const node = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: cfg.legalName,
    alternateName: cfg.brandName,
    url: cfg.siteUrl,
    logo: { "@type": "ImageObject", url: cfg.logo },
    description: cfg.description,
    slogan: cfg.tagline,
    founder: { "@id": FOUNDER_ID },
    knowsAbout: cfg.keywords,
  };
  const address = postalAddress(cfg);
  if (address) node.address = address;
  if (cfg.contact.email || cfg.contact.phone) {
    node.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      ...(cfg.contact.email && { email: cfg.contact.email }),
      ...(cfg.contact.phone && { telephone: cfg.contact.phone }),
      areaServed: "US",
      availableLanguage: ["English"],
    };
  }
  if (cfg.sameAs.length) node.sameAs = cfg.sameAs;
  if (
    cfg.reviewStats.emitAggregateRating &&
    cfg.reviewStats.count
  ) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: cfg.reviewStats.rating,
      reviewCount: cfg.reviewStats.count,
    };
  }
  return node;
}

export function personSchema(cfg = seoConfig) {
  const node = {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: cfg.founder.name,
    jobTitle: cfg.founder.jobTitle,
    worksFor: { "@id": ORG_ID },
    url: cfg.siteUrl,
  };
  if (cfg.founder.sameAs.length) node.sameAs = cfg.founder.sameAs;
  return node;
}

export function websiteSchema(cfg = seoConfig) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: cfg.siteUrl,
    name: cfg.brandName,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

export function breadcrumbSchema(trail = []) {
  if (!trail.length) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(faqs = []) {
  const list = (faqs || []).filter((f) => f && f.question && f.answer);
  if (!list.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceSchema(service) {
  if (!service) return null;
  return {
    "@type": "Service",
    name: service.title,
    description: service.desc || service.note || seoConfig.description,
    serviceType: service.title,
    provider: { "@id": ORG_ID },
    areaServed: "US",
    url: absoluteUrl(`/services/${service.slug}`),
    ...(service.img && { image: absoluteUrl(service.img) }),
  };
}

export function creativeWorkSchema(project) {
  if (!project) return null;
  const node = {
    "@type": "CreativeWork",
    name: project.title,
    description: project.blurb || `${project.title} brand project.`,
    creator: { "@id": ORG_ID },
    url: absoluteUrl(`/work/${project.slug}`),
    ...(project.img && { image: absoluteUrl(project.img) }),
    ...(project.category && { genre: project.category }),
    ...(project.industry && { about: project.industry }),
  };
  if (project.testimonial && project.testimonial.quote) {
    node.review = {
      "@type": "Review",
      reviewBody: project.testimonial.quote,
      author: {
        "@type": "Person",
        name: project.testimonial.name || "Client",
      },
      itemReviewed: { "@id": ORG_ID },
    };
  }
  return node;
}

/* Wrap a set of nodes into a single @graph document. Drops falsy entries. */
export function graph(nodes = []) {
  const clean = nodes.filter(Boolean);
  return { "@context": "https://schema.org", "@graph": clean };
}

/* The global entity graph that belongs on every page (root layout). */
export function siteGraph(cfg = seoConfig) {
  return graph([organizationSchema(cfg), websiteSchema(cfg), personSchema(cfg)]);
}

export function projectGraph(project, trail) {
  return graph([creativeWorkSchema(project), breadcrumbSchema(trail)]);
}

export function serviceGraph(service, trail, faqs) {
  return graph([
    serviceSchema(service),
    breadcrumbSchema(trail),
    faqSchema(faqs),
  ]);
}

export function faqPageGraph(faqs, trail) {
  return graph([faqSchema(faqs), breadcrumbSchema(trail)]);
}
