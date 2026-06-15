import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    sortOrder: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.key !== undefined) row.key = data.key;
  if (data.label !== undefined) row.label = data.label;
  if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  return row;
}

export function slugifyKey(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("project_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createCategory(data) {
  const { data: row, error } = await supabase
    .from("project_categories")
    .insert(toRow(data))
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function updateCategory(id, data) {
  const { data: row, error } = await supabase
    .from("project_categories")
    .update(toRow(data))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("project_categories").delete().eq("id", id);
  if (error) throw error;
}
