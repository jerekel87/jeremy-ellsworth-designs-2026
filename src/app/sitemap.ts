import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/config";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchServices } from "@/lib/servicesApi";
import { projects as staticProjects } from "@/lib/projects";
import { services as staticServices } from "@/lib/services";

export const revalidate = 300;

const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/work", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  {
    path: "/brand-access-program",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [projects, services] = await Promise.all([
    fetchProjects().catch(() => []),
    fetchServices().catch(() => []),
  ]);
  const projectList = projects.length ? projects : staticProjects;
  const serviceList = services.length ? services : staticServices;

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const serviceEntries = serviceList.map((s: { slug: string }) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectEntries = projectList.map((p: { slug: string }) => ({
    url: absoluteUrl(`/work/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...serviceEntries, ...projectEntries];
}
