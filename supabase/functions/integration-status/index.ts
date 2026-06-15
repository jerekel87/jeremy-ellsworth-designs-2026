import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const has = (k: string) => Boolean((Deno.env.get(k) || "").trim());

type Model = { id: string; name: string };
// Warm-instance cache so we don't re-test every model on every page load.
let cache: { at: number; models: Model[] } | null = null;
const CACHE_MS = 10 * 60 * 1000;

// A model only earns a place in the dropdown if it actually answers a live
// request right now. 200 = usable. 404 / model-shaped 400 = retired or
// disabled, so we drop it. Transient errors (429 / 5xx) keep the model.
async function modelWorks(key: string, id: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: id, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    });
    if (res.ok) return true;
    if (res.status === 404) return false;
    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      const msg = String(data?.error?.message || "").toLowerCase();
      // Drop only when the model itself is the problem.
      return !(msg.includes("model") || msg.includes("deprecat") || msg.includes("not found"));
    }
    return true;
  } catch (_e) {
    return true;
  }
}

async function listClaudeModels(): Promise<Model[]> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return [];
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.models;
  try {
    const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    });
    if (!res.ok) return cache?.models || [];
    const data = await res.json();
    const candidates: Model[] = (data?.data || [])
      .filter((m: any) => m && m.type === "model" && typeof m.id === "string" && m.id.startsWith("claude-"))
      .map((m: any) => ({ id: String(m.id), name: String(m.display_name || m.id) }));
    // Verify each candidate truly works before exposing it.
    const checked = await Promise.all(
      candidates.map(async (m) => ((await modelWorks(key, m.id)) ? m : null)),
    );
    const models = checked.filter((m): m is Model => m !== null);
    cache = { at: Date.now(), models };
    return models;
  } catch (_e) {
    return cache?.models || [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const status = {
    anthropic_key: has("ANTHROPIC_API_KEY"),
    resend_key: has("RESEND_API_KEY"),
    resend_from: has("RESEND_FROM"),
    resend_reply_to: has("RESEND_REPLY_TO"),
    inbound_secret: has("INBOUND_SECRET"),
  };

  const models = await listClaudeModels();

  return new Response(JSON.stringify({ ok: true, status, models }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
