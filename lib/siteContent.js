import { supabase } from "@/lib/supabase";

/* React-free reader for the site_content table. Lives apart from contentApi.js
   (which also exports client hooks) so it can be imported by Server Components
   during static rendering without dragging React hooks into the server graph. */
export async function fetchContent() {
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw error;
  const map = {};
  for (const row of data || []) map[row.key] = row.value;
  return map;
}
