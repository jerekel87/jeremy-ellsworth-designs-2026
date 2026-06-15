import { supabase } from "@/lib/supabase";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    business: row.company || "",
    service: row.service || "",
    budget: row.budget || "",
    message: row.message || "",
    source: row.source || "",
    status: row.status || "new",
    note: row.note || "",
    thread: Array.isArray(row.thread) ? row.thread : [],
    date: row.created_at ? fmtDate(row.created_at) : "",
    time: row.created_at ? fmtTime(row.created_at) : "",
    createdAt: row.created_at,
  };
}

function toUpdateRow(data) {
  const row = { updated_at: new Date().toISOString() };
  if (data.status !== undefined) row.status = data.status;
  if (data.note !== undefined) row.note = data.note;
  if (data.thread !== undefined) row.thread = data.thread;
  return row;
}

export async function fetchInquiries() {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createInquiry(data) {
  const { data: res, error } = await supabase.functions.invoke("submit-inquiry", {
    body: {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      company: data.company || "",
      service: data.service || "",
      budget: data.budget || "",
      message: data.message || "",
      source: data.source || "Website contact form",
    },
  });
  if (error) throw error;
  if (res && res.ok === false) throw new Error(res.error || "Could not submit inquiry.");
  return res;
}

export async function sendInquiryReply(id, text) {
  const { data: res, error } = await supabase.functions.invoke("send-reply", {
    body: { id, text },
  });
  if (error) throw error;
  if (!res || res.ok === false) throw new Error((res && res.error) || "Could not send reply.");
  return res.inquiry ? fromRow(res.inquiry) : null;
}

export async function updateInquiry(id, data) {
  const { data: row, error } = await supabase
    .from("inquiries")
    .update(toUpdateRow(data))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : null;
}
