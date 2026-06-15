import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    industry: row.industry,
    cat: row.cat,
    img: row.img,
    blurb: row.blurb,
    gallery: row.gallery || [],
    layout: row.layout || [],
    services: row.services || [],
    deliverables: row.deliverables || [],
    testimonial: row.testimonial || null,
    external: row.external,
    sortOrder: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.slug !== undefined) row.slug = data.slug;
  if (data.title !== undefined) row.title = data.title;
  if (data.category !== undefined) row.category = data.category;
  if (data.industry !== undefined) row.industry = data.industry;
  if (data.cat !== undefined) row.cat = data.cat;
  if (data.img !== undefined) row.img = data.img;
  if (data.blurb !== undefined) row.blurb = data.blurb;
  if (data.gallery !== undefined) row.gallery = data.gallery;
  if (data.layout !== undefined) row.layout = data.layout;
  if (data.services !== undefined) row.services = data.services;
  if (data.deliverables !== undefined) row.deliverables = data.deliverables;
  if (data.testimonial !== undefined) row.testimonial = data.testimonial;
  if (data.external !== undefined) row.external = data.external;
  if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  return row;
}

export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function fetchProject(slug) {
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createProject(data) {
  const { data: row, error } = await supabase.from("projects").insert(toRow(data)).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function updateProject(id, data) {
  const { data: row, error } = await supabase.from("projects").update(toRow(data)).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
