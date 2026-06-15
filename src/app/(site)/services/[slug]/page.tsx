import { notFound } from "next/navigation";
import ServiceDetailView from "./ServiceDetailView";
import { fetchServices } from "@/lib/servicesApi";
import { fetchProjects } from "@/lib/projectsApi";
import { services as staticServices } from "@/lib/services";
import { projects as staticProjects } from "@/lib/projects";
import { resolveMetadata } from "@/lib/seo/metadata";
import { serviceGraph } from "@/lib/seo/schema";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

async function loadData() {
  const [svc, proj] = await Promise.all([
    fetchServices().catch(() => []),
    fetchProjects().catch(() => []),
  ]);
  return {
    services: svc.length ? svc : staticServices,
    projects: proj.length ? proj : staticProjects,
  };
}

export async function generateStaticParams() {
  const svc = await fetchServices().catch(() => []);
  const list = svc.length ? svc : staticServices;
  return list.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { services } = await loadData();
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Service not found | je.design" };
  return resolveMetadata({
    path: `/services/${s.slug}`,
    title: `${s.title} | je.design`,
    description:
      s.desc || `${s.title} by Jeremy Ellsworth Designs LLC — drawn by hand, in-house.`,
    image: s.img,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const { services, projects } = await loadData();
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <>
      <JsonLd
        data={serviceGraph(s, [
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.title, path: `/services/${s.slug}` },
        ])}
      />
      <ServiceDetailView service={s} services={services} projects={projects} />
    </>
  );
}
