import HomeView from "./HomeView";
import { fetchContent } from "@/lib/siteContent";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchReviews } from "@/lib/reviewsApi";
import { resolveMetadata } from "@/lib/seo/metadata";

// Incremental Static Regeneration: the page is statically rendered at build
// time (so crawlers get full HTML) and revalidated in the background.
export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/",
    title:
      "Jeremy Ellsworth Designs LLC | Premium Brand & Vehicle Wrap Design Services",
    description:
      "je.design — Building Brands That Empower Growth. Tailored creative solutions, logo design, and vehicle wrap services that make your business stand out.",
  });
}

export default async function HomePage() {
  const [content, projects, reviews] = await Promise.all([
    fetchContent().catch(() => ({})),
    fetchProjects().catch(() => []),
    fetchReviews({ featuredOnly: true }).catch(() => []),
  ]);

  return <HomeView content={content} projects={projects} reviews={reviews} />;
}
