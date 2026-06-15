import BrandAccessView from "./BrandAccessView";
import { fetchContent } from "@/lib/siteContent";
import { fetchFaqs } from "@/lib/faqsApi";
import { resolveMetadata } from "@/lib/seo/metadata";
import { faqPageGraph } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/brand-access-program",
    title: "Brand Access Program | $150 Down, Pay As You Grow — je.design",
    description:
      "Get full professional branding for $150 down and $150 a month — full file access from day one, work starts immediately, revisions included. By Jeremy Ellsworth Designs LLC.",
  });
}

export default async function BrandAccessPage() {
  const [content, faqs] = await Promise.all([
    fetchContent().catch(() => ({})),
    fetchFaqs("bap").catch(() => []),
  ]);
  return (
    <>
      <JsonLd
        data={faqPageGraph(faqs, [
          { name: "Home", path: "/" },
          { name: "Brand Access Program", path: "/brand-access-program" },
        ])}
      />
      <BrandAccessView content={content} faqs={faqs} />
    </>
  );
}
