import { CONTENT_DEFAULTS } from "@/lib/pageContent";

/* Builds a synchronous `t(key)` reader from an already-resolved content map
   (typically fetched server-side and passed to a client view as a prop), so
   the editable copy is present in the server-rendered HTML for SEO. Mirrors
   the runtime shape of usePageText().t. */
export function makeText(content = {}) {
  const t = (key) => (content[key] ? content[key] : (CONTENT_DEFAULTS[key] ?? ""));
  t.isCustom = (key) => content[key] != null && content[key] !== CONTENT_DEFAULTS[key];
  return t;
}
