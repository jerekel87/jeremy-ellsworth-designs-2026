import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    short: row.short,
    full: row.full_text,
    source: row.source,
    rating: row.rating,
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.company !== undefined) row.company = data.company;
  if (data.short !== undefined) row.short = data.short;
  if (data.full !== undefined) row.full_text = data.full;
  if (data.source !== undefined) row.source = data.source;
  if (data.rating !== undefined) row.rating = data.rating;
  if (data.featured !== undefined) row.featured = data.featured;
  if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  return row;
}

export async function fetchReviews({ featuredOnly = false } = {}) {
  let query = supabase.from("reviews").select("*").order("sort_order", { ascending: true });
  if (featuredOnly) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function fetchReview(id) {
  const { data, error } = await supabase.from("reviews").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createReview(data) {
  const { data: row, error } = await supabase.from("reviews").insert(toRow(data)).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function updateReview(id, data) {
  const { data: row, error } = await supabase.from("reviews").update(toRow(data)).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
