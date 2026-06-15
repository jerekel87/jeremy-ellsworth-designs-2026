import { supabase } from "@/lib/supabase";

function fromRow(row) {
  return {
    id: row.id,
    path: row.path,
    metaTitle: row.meta_title || "",
    metaDescription: row.meta_description || "",
    ogImage: row.og_image || "",
    canonicalOverride: row.canonical_override || "",
    robotsNoindex: !!row.robots_noindex,
    faq: Array.isArray(row.faq) ? row.faq : [],
    customJsonld: row.custom_jsonld || null,
    updatedAt: row.updated_at,
  };
}

function toRow(data) {
  const row = {};
  if (data.path !== undefined) row.path = data.path;
  if (data.metaTitle !== undefined) row.meta_title = data.metaTitle || null;
  if (data.metaDescription !== undefined) row.meta_description = data.metaDescription || null;
  if (data.ogImage !== undefined) row.og_image = data.ogImage || null;
  if (data.canonicalOverride !== undefined) row.canonical_override = data.canonicalOverride || null;
  if (data.robotsNoindex !== undefined) row.robots_noindex = data.robotsNoindex;
  if (data.faq !== undefined) row.faq = data.faq;
  if (data.customJsonld !== undefined) row.custom_jsonld = data.customJsonld;
  row.updated_at = new Date().toISOString();
  return row;
}

export async function fetchPageSeoList() {
  const { data, error } = await supabase
    .from("page_seo")
    .select("*")
    .order("path");
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function fetchPageSeo(path) {
  const { data, error } = await supabase
    .from("page_seo")
    .select("*")
    .eq("path", path)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function upsertPageSeo(data) {
  const row = toRow(data);
  row.path = data.path;
  const { data: result, error } = await supabase
    .from("page_seo")
    .upsert(row, { onConflict: "path" })
    .select()
    .maybeSingle();
  if (error) throw error;
  return result ? fromRow(result) : null;
}

export async function deletePageSeo(id) {
  const { error } = await supabase.from("page_seo").delete().eq("id", id);
  if (error) throw error;
}

const GLOBAL_DEFAULTS = {
  brandName: "",
  legalName: "",
  tagline: "",
  description: "",
  defaultOgImage: "",
  contact: { email: "", phone: "" },
  founder: { name: "", jobTitle: "", sameAs: [] },
  address: { streetAddress: "", addressLocality: "", addressRegion: "", postalCode: "", addressCountry: "US" },
  sameAs: [],
  keywords: [],
};

export async function fetchGlobalSeo() {
  const { data, error } = await supabase
    .from("seo_settings")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  const stored = data?.data || {};
  return {
    ...GLOBAL_DEFAULTS,
    ...stored,
    contact: { ...GLOBAL_DEFAULTS.contact, ...(stored.contact || {}) },
    founder: { ...GLOBAL_DEFAULTS.founder, ...(stored.founder || {}), sameAs: stored.founder?.sameAs || [] },
    address: { ...GLOBAL_DEFAULTS.address, ...(stored.address || {}) },
    sameAs: Array.isArray(stored.sameAs) ? stored.sameAs : [],
    keywords: Array.isArray(stored.keywords) ? stored.keywords : [],
  };
}

export async function saveGlobalSeo(data) {
  const { error } = await supabase
    .from("seo_settings")
    .upsert({ id: 1, data, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}
