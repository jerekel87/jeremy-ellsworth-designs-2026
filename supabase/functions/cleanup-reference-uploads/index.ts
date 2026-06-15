import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BUCKET = "site-media";
const FOLDER = "refs";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PAGE = 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server not configured." }, 200);

  const sb = createClient(url, serviceKey);
  const cutoff = Date.now() - MAX_AGE_MS;
  const stale: string[] = [];

  try {
    let offset = 0;
    while (true) {
      const { data, error } = await sb.storage.from(BUCKET).list(FOLDER, {
        limit: PAGE,
        offset,
        sortBy: { column: "created_at", order: "asc" },
      });
      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const obj of data) {
        const created = obj.created_at ? new Date(obj.created_at).getTime() : 0;
        if (created && created < cutoff) stale.push(`${FOLDER}/${obj.name}`);
      }

      if (data.length < PAGE) break;
      offset += PAGE;
    }

    let removed = 0;
    for (let i = 0; i < stale.length; i += 100) {
      const batch = stale.slice(i, i + 100);
      const { error } = await sb.storage.from(BUCKET).remove(batch);
      if (error) throw error;
      removed += batch.length;
    }

    return json({ removed });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e).slice(0, 300) }, 200);
  }
});
