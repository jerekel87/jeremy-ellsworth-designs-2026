import { seoConfig, absoluteUrl } from "@/lib/seo/config";
import { fetchServices } from "@/lib/servicesApi";
import { services as staticServices } from "@/lib/services";

export const revalidate = 300;

export async function GET() {
  const svc = await fetchServices().catch(() => []);
  const services = svc.length ? svc : staticServices;

  const serviceLines = services
    .map(
      (s: { title: string; slug: string; desc?: string; note?: string }) =>
        `- [${s.title}](${absoluteUrl(`/services/${s.slug}`)}): ${
          s.desc || s.note || ""
        }`
    )
    .join("\n");

  const body = `# ${seoConfig.legalName} (${seoConfig.brandName})

> ${seoConfig.tagline}. ${seoConfig.description}

## About
${seoConfig.legalName} is a full-service creative studio founded by ${seoConfig.founder.name}. Every brand is researched, sketched by hand and produced in-house — specializing in home-service and small-business clients across the United States. The studio has earned ${seoConfig.reviewStats.count}+ five-star reviews.

## Services
${serviceLines}

## Key Pages
- [Home](${absoluteUrl("/")})
- [Our Work](${absoluteUrl("/work")})
- [Services](${absoluteUrl("/services")})
- [About](${absoluteUrl("/about")})
- [Brand Access Program](${absoluteUrl("/brand-access-program")}): full professional branding for $150 down and $150/month, with file access from day one.

## Contact
- Email: ${seoConfig.contact.email}
- Website: ${seoConfig.siteUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
