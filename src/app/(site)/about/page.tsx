import AboutView from "./AboutView";
import { fetchContent } from "@/lib/siteContent";
import { resolveMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/about",
    title: "About je.design | The Team Behind 1,800+ Five-Star Brands",
    description:
      "Jeremy Ellsworth Designs LLC is a full-service design agency specializing in home service brands — built on 20 years of craft and a 10-person in-house creative team.",
  });
}

export default async function AboutPage() {
  const content = await fetchContent().catch(() => ({}));
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <AboutView content={content} />
    </>
  );
}
