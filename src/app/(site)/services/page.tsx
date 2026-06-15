import ServicesView from "./ServicesView";
import { fetchContent } from "@/lib/siteContent";
import { fetchServices } from "@/lib/servicesApi";
import { resolveMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/services",
    title: "Services | Branding, Vehicle Wraps, Websites & Print — je.design",
    description:
      "Six ways Jeremy Ellsworth Designs LLC makes your business impossible to ignore — brand identity, vehicle wraps, websites, print, packaging and apparel, all in-house.",
  });
}

export default async function ServicesPage() {
  const [content, services] = await Promise.all([
    fetchContent().catch(() => ({})),
    fetchServices().catch(() => []),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <ServicesView content={content} services={services} />
    </>
  );
}
