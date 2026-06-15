/* The editability seam. Reads admin-authored SEO overrides from Supabase using
   the same anon client the rest of the app uses (server-safe — no React, no
   service-role key). RLS allows public SELECT on these tables, so this works
   during static rendering and ISR. Every read fails soft to null so the
   best-practice defaults always win when the DB is empty or unreachable. */

import { supabase } from "@/lib/supabase";
import { seoConfig, mergeConfig } from "./config";

export async function getPageSeo(path) {
  try {
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .eq("path", path)
      .maybeSingle();
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}

export async function getGlobalSeo() {
  try {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error) return null;
    return data?.data || null;
  } catch {
    return null;
  }
}

/* Effective identity config = hardcoded defaults with admin overrides merged
   on top. Always returns a usable config, even when the DB is empty. */
export async function resolveConfig() {
  const overrides = await getGlobalSeo();
  return overrides ? mergeConfig(overrides) : seoConfig;
}
