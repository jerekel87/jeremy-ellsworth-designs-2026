import ReviewsView from "./ReviewsView";
import { fetchReviews } from "@/lib/reviewsApi";
import { reviews as staticReviews } from "@/lib/reviews";
import { resolveMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/reviews",
    title: "Client Reviews | 5-Star Brand & Vehicle Wrap Design — je.design",
    description:
      "Read what business owners say about Jeremy Ellsworth Designs LLC — verified five-star reviews on logo design, vehicle wraps, websites and full brand identities.",
  });
}

export default async function ReviewsPage() {
  const fetched = await fetchReviews().catch(() => []);
  const reviews = fetched.length ? fetched : staticReviews;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ])}
      />
      <ReviewsView reviews={reviews} />
    </>
  );
}
