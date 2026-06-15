import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    group: row.faq_group,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.group !== undefined) row.faq_group = data.group;
  if (data.question !== undefined) row.question = data.question;
  if (data.answer !== undefined) row.answer = data.answer;
  if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  return row;
}

export async function fetchFaqs(group) {
  let query = supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  if (group) query = query.eq("faq_group", group);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createFaq(data) {
  const { data: row, error } = await supabase.from("faqs").insert(toRow(data)).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function updateFaq(id, data) {
  const { data: row, error } = await supabase.from("faqs").update(toRow(data)).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}

export async function deleteFaq(id) {
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw error;
}
