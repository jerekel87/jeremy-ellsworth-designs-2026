import { createClient } from "@supabase/supabase-js";

/* Resolve credentials from whichever bundler is building this module.
   Vite statically inlines `import.meta.env.VITE_*`; Next inlines the literal
   `process.env.NEXT_PUBLIC_*` (next.config bridges VITE_* → NEXT_PUBLIC_* at
   build so the same Vercel env vars feed both). Keep the literal forms below
   so Next can inline them into the browser bundle. */
const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const url =
  (viteEnv && viteEnv.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined);
const anonKey =
  (viteEnv && viteEnv.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

export const supabase = createClient(url, anonKey);
