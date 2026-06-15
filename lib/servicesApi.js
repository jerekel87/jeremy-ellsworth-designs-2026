import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    num: row.num,
    title: row.title,
    short: row.short || "",
    note: row.note || "",
    industries: row.industries || "",
    desc: row.description || "",
    bullets: row.bullets || [],
    img: row.img || "",
    sortOrder: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.slug !== undefined) row.slug = data.slug;
  if (data.num !== undefined) row.num = data.num;
  if (data.title !== undefined) row.title = data.title;
  if (data.short !== undefined) row.short = data.short;
  if (data.note !== undefined) row.note = data.note;
  if (data.industries !== undefined) row.industries = data.industries;
  if (data.desc !== undefined) row.description = data.desc;
  if (data.bullets !== undefined) row.bullets = data.bullets;
  if (data.img !== undefined) row.img = data.img;
  if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  return row;
}

export async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function fetchService(slug) {
  const { data, error } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createService(data) {
  const { data: row, error } = await supabase.from("services").insert(toRow(data)).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function updateService(id, data) {
  const { data: row, error } = await supabase.from("services").update(toRow(data)).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function deleteService(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}
