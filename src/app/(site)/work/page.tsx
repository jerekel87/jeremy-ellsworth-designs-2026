import WorkView from "./WorkView";
import { fetchContent } from "@/lib/siteContent";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchCategories } from "@/lib/categoriesApi";
import { resolveMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateMetadata() {
  return resolveMetadata({
    path: "/work",
    title: "Our Work | Brand Identity, Vehicle Wraps & More — je.design",
    description:
      "Explore brand transformations from Jeremy Ellsworth Designs LLC — logos, vehicle wraps, websites and packaging, every one drawn by hand and built in-house.",
  });
}

export default async function WorkPage() {
  const [content, projects, categories] = await Promise.all([
    fetchContent().catch(() => ({})),
    fetchProjects().catch(() => []),
    fetchCategories().catch(() => []),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <WorkView content={content} projects={projects} categories={categories} />
    </>
  );
}
