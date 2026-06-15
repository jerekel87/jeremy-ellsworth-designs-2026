import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ROLE = `You are "The Letter" — je.design's concierge. je.design (Jeremy Ellsworth Designs LLC) is a premium creative brand agency for small businesses, especially home services (HVAC, electrical, plumbing, roofing, painting).

Your job: convince the visitor, warmly but candidly, that waiting on their branding is the real risk, the difference between being forgotten and being the company everyone remembers. Move them to act: getting a quote (share the get-started link from your knowledge below) or booking the free design consultation on the homepage.`;

// Used only if the studio owner hasn't set a knowledge base in Settings. Keep
// in sync with settings.ai.knowledge in lib/settingsContent.js.
const DEFAULT_KNOWLEDGE = `Facts you may use (never invent others):
- 20 years in business, 10-person in-house team
- Every design is drawn by hand, never AI-generated, no templates
- 1,800+ five-star reviews across Google and Facebook (5.0 rating)
- First concepts in 5 to 7 business days, most projects done in 2 to 3 weeks
- Files delivered in AI, SVG, PDF, JPG and PNG, and the client owns everything
- To get a quote or get started, send people to https://agreement.je.design/get-started
- There is also a free design consultation they can book from the homepage

Brand Access Program (our payment plan): $150 down, then $150/month until it's paid off. Full file access from day one, work starts right away, revisions included, cancel anytime after completion. Only bring this up if the person says their budget is tight or asks about payment options. Do not lead with it.`;

const STYLE = `Style: Keep replies SHORT. 1 to 2 sentences, like a quick text back. Get straight to the point and sound like you genuinely know branding, no fluff, no hype, no sales clichés. Relaxed and confident, contractions are good (you're, we'll, that's). Don't dump facts or list everything you know; answer what they asked and ask at most one quick question when it helps. If they share their business type, speak to their market specifically. If asked, be honest that you're an AI assistant for the website, and the design work itself is 100% human.

Formatting rules (important): NEVER use em dashes or en dashes (— or –); use a comma or a period instead. No asterisks, bold, markdown, bullet points, or emoji. No semicolons. Just plain sentences the way a person actually types in a chat. When you share a link, paste the full URL starting with https:// so it's clickable.`;

const DEFAULT_MODEL = "claude-haiku-4-5";

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function getSettings(supabase: any): Promise<{ instructions: string; knowledge: string; model: string }> {
  const fallback = { instructions: "", knowledge: "", model: DEFAULT_MODEL };
  if (!supabase) return fallback;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["settings.ai.instructions", "settings.ai.knowledge", "settings.int.anthropic_model"]);
    const map: Record<string, string> = {};
    for (const row of data || []) map[row.key] = String(row.value || "");
    return {
      instructions: (map["settings.ai.instructions"] || "").trim(),
      knowledge: (map["settings.ai.knowledge"] || "").trim(),
      model: (map["settings.int.anthropic_model"] || "").trim() || DEFAULT_MODEL,
    };
  } catch (_e) {
    return fallback;
  }
}

function buildSystem(knowledge: string, extra: string): string {
  let system = `${ROLE}

What you know (only use these facts, never invent others):
${knowledge || DEFAULT_KNOWLEDGE}

${STYLE}`;
  if (extra) {
    system += `

Additional instructions from the studio owner (follow these closely, they take priority over style defaults above):
${extra}`;
  }
  return system;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";
}

async function callClaude(key: string, model: string, system: string, messages: any[]) {
  return await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 160, system, messages }),
  });
}

// Generate a reply, falling back to the default model if the chosen model is
// rejected (e.g. it was disabled after the owner selected it). This guarantees
// the visitor still gets a reply and never silently fails.
async function generateReply(key: string, model: string, system: string, messages: any[]): Promise<string | null> {
  let res = await callClaude(key, model, system, messages);
  if (!res.ok && model !== DEFAULT_MODEL && (res.status === 404 || res.status === 400)) {
    res = await callClaude(key, DEFAULT_MODEL, system, messages);
  }
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.content?.[0]?.text || null;
  return raw ? scrubDashes(raw) : null;
}

// Guarantee no em/en dashes or markdown emphasis reach the visitor, even if the
// model slips one in.
function scrubDashes(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\*+/g, "")
    .replace(/,\s*,/g, ",")
    .trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const action = String(body.action || "chat");
    const visitorId = String(body.visitorId || "").trim();
    const supabase = serviceClient();

    // Return the saved conversation for this visitor + whether there's an AI
    // reply they haven't seen yet (drives the "new notification" state).
    if (action === "load") {
      if (!supabase || !visitorId) return json({ thread: [], agent: null, hasUnseen: false });
      const { data } = await supabase
        .from("concierge_conversations")
        .select("thread, agent, last_sender, seen")
        .eq("visitor_id", visitorId)
        .maybeSingle();
      if (!data) return json({ thread: [], agent: null, hasUnseen: false });
      return json({
        thread: Array.isArray(data.thread) ? data.thread : [],
        agent: data.agent || null,
        hasUnseen: data.last_sender === "ai" && data.seen === false,
      });
    }

    // Mark the latest AI reply as seen (visitor opened the chat).
    if (action === "seen") {
      if (supabase && visitorId) {
        await supabase
          .from("concierge_conversations")
          .update({ seen: true, updated_at: new Date().toISOString() })
          .eq("visitor_id", visitorId);
      }
      return json({ ok: true });
    }

    // Default: generate a reply to the latest message.
    const messages = body.messages || [];
    const agent = String(body.agent || "").trim();
    const key = Deno.env.get("ANTHROPIC_API_KEY");

    const trimmed = (messages || []).slice(-12).map((m: { role: string; text?: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.text || "").slice(0, 2000),
    }));

    let reply: string | null = null;
    if (key) {
      const { instructions, knowledge, model } = await getSettings(supabase);
      reply = await generateReply(key, model, buildSystem(knowledge, instructions), trimmed);
    }

    // Persist the full conversation. The reply is stored as unseen so that if
    // the visitor leaves before reading it, they're notified on return.
    if (supabase && visitorId) {
      const stored = (messages || [])
        .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && m.text)
        .map((m: any) => ({ role: m.role, text: String(m.text), agent: m.agent }));
      if (reply) stored.push({ role: "assistant", text: reply, agent: agent || undefined });
      const now = new Date().toISOString();
      await supabase
        .from("concierge_conversations")
        .upsert(
          {
            visitor_id: visitorId,
            ip: clientIp(req),
            user_agent: (req.headers.get("user-agent") || "").slice(0, 500),
            agent: agent || "",
            thread: stored,
            last_sender: reply ? "ai" : "visitor",
            seen: false,
            updated_at: now,
          },
          { onConflict: "visitor_id" },
        );
    }

    return json({ reply });
  } catch (_e) {
    return json({ reply: null });
  }
});
