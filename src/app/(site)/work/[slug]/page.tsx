import { notFound } from "next/navigation";
import WorkDetailView from "./WorkDetailView";
import { fetchProjects } from "@/lib/projectsApi";
import { projects as staticProjects } from "@/lib/projects";
import { resolveMetadata } from "@/lib/seo/metadata";
import { projectGraph } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

async function loadProjects() {
  const proj = await fetchProjects().catch(() => []);
  return proj.length ? proj : staticProjects;
}

export async function generateStaticParams() {
  const projects = await loadProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const projects = await loadProjects();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return { title: "Project not found | je.design" };
  return resolveMetadata({
    path: `/work/${p.slug}`,
    title: `${p.title} — ${p.category} | je.design`,
    description: p.blurb || `${p.title} brand project by Jeremy Ellsworth Designs LLC.`,
    image: p.img,
    type: "article",
  });
}

export default async function WorkDetailPage({ params }) {
  const { slug } = await params;
  const projects = await loadProjects();
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd
        data={projectGraph(p, [
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: p.title, path: `/work/${p.slug}` },
        ])}
      />
      <WorkDetailView project={p} projects={projects} />
    </>
  );
}
