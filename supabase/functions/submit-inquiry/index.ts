import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_MODEL = "claude-haiku-4-5";
const SUBJECT = "Your inquiry with Jeremy Ellsworth Designs";
const AGENTS = ["Robin", "Robert", "Paul"];
function pickAgent() {
  return AGENTS[Math.floor(Math.random() * AGENTS.length)];
}

const SYSTEM = `You are the first responder for Jeremy Ellsworth Designs (je.design) — a premium, 100% hand-drawn creative brand agency for small businesses, especially home-services companies (HVAC, electrical, plumbing, roofing, painting, lawn care, cleaning, concrete, pest control). You reply by email to people who just submitted an inquiry on the website.

YOUR REAL JOB IS NOT TO SELL. It is to help the person see the gap between where their brand is today and where they want their business to be — and let them arrive at the conclusion themselves. Use a consultative, question-led approach (gap selling):
1. Acknowledge what they wrote, specifically and warmly.
2. Reflect their current situation back to them as you understand it.
3. Ask ONE or TWO sharp, genuinely curious questions that make them think about the gap: where they are now, where they want to be, and the cost of staying where they are. Examples: "How many bids do you think you lose to a competitor who just looks more established?" or "If your trucks pulled up looking like the biggest company in town, what would that change for you?"
4. Do NOT list services or prices unless they ask. Never use pushy, salesy clichés. You are a trusted advisor, not a closer.

Tone: warm, confident, human, a little bold. Plain language. Short paragraphs.

Email format:
- Write ONLY the email body. Never include a "Subject:" line or any header.
- Open with "Hi {first name}," using only their first name.
- 2–4 short paragraphs, under ~180 words total.
- End with one clear question that invites them to reply.
- Sign off exactly as:
__AGENT__
Jeremy Ellsworth Designs

If asked whether you are a person or AI, be honest: you're an AI assistant that handles first replies for the studio, and every bit of the actual design work is done by hand by real humans — which is the whole point.`;

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

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function getModel(supabase: any) {
  try {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "settings.int.anthropic_model")
      .maybeSingle();
    const model = String(data?.value || "").trim();
    return model || DEFAULT_MODEL;
  } catch (_e) {
    return DEFAULT_MODEL;
  }
}

async function generateReply(messages: { role: string; content: string }[], system: string, model: string) {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 700, system, messages }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.[0]?.text || null;
}

async function getSystem(supabase: any, agent: string) {
  const base = SYSTEM.replace("__AGENT__", agent);
  try {
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["settings.ai.instructions", "settings.ai.knowledge"]);
    const map: Record<string, string> = {};
    for (const row of data || []) map[row.key] = String(row.value || "").trim();
    const knowledge = map["settings.ai.knowledge"] || DEFAULT_KNOWLEDGE;
    const extra = map["settings.ai.instructions"] || "";
    let system = `${base}

What you know (only use these facts, never invent others):
${knowledge}`;
    if (extra) {
      system += `

Additional instructions from the studio owner (follow these closely, they take priority over style defaults above):
${extra}`;
    }
    return system;
  } catch (_e) {
    return `${base}

What you know (only use these facts, never invent others):
${DEFAULT_KNOWLEDGE}`;
  }
}

function buildFrom(agent: string) {
  const raw = Deno.env.get("RESEND_FROM") || "Jeremy Ellsworth Designs <onboarding@resend.dev>";
  const m = raw.match(/<([^>]+)>/);
  const email = m ? m[1] : raw;
  return `${agent} at Jeremy Ellsworth Designs <${email}>`;
}

async function sendEmail(to: string, text: string, subject: string, from?: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const fromAddr = from || Deno.env.get("RESEND_FROM") || "Jeremy Ellsworth Designs <onboarding@resend.dev>";
  const replyTo = Deno.env.get("RESEND_REPLY_TO") || undefined;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${text
    .split("\n")
    .map((l) => (l.trim() ? `<p style="margin:0 0 12px">${escapeHtml(l)}</p>` : ""))
    .join("")}</div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromAddr, to: [to], subject, text, html, reply_to: replyTo }),
  });
  return res.ok;
}

async function autoRespond(supabase: any, row: any) {
  const context = `A new inquiry just came in through the website contact form. Write the opening email reply.

Name: ${row.name}
Business: ${row.company || "—"}
Service they're interested in: ${row.service || "not specified"}
Budget: ${row.budget || "not specified"}
Their message: ${row.message || "(no message left)"}`;

  const agent = pickAgent();
  const model = await getModel(supabase);
  const reply = await generateReply([{ role: "user", content: context }], await getSystem(supabase, agent), model);
  if (!reply) return;

  const created = new Date(row.created_at);
  const now = new Date();
  const thread = [
    { from: "customer", date: fmtDate(created), time: fmtTime(created), text: row.message || "(no message left)" },
    { from: "team", date: fmtDate(now), time: fmtTime(now), text: reply, auto: true, agent },
  ];

  await supabase
    .from("inquiries")
    .update({ thread, status: "replied", updated_at: now.toISOString() })
    .eq("id", row.id);

  await sendEmail(row.email, reply, SUBJECT, buildFrom(agent));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    if (!name || !email) return json({ ok: false, error: "Name and email are required." }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: row, error } = await supabase
      .from("inquiries")
      .insert({
        name,
        email,
        phone: String(body.phone || ""),
        company: String(body.company || ""),
        service: String(body.service || ""),
        budget: String(body.budget || ""),
        message: String(body.message || ""),
        source: String(body.source || "Website contact form"),
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    const task = autoRespond(supabase, row).catch((e) => console.error("autoRespond failed", e));
    // @ts-ignore Supabase edge runtime background task
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) EdgeRuntime.waitUntil(task);
    else await task;

    return json({ ok: true, id: row.id });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "Could not submit inquiry." }, 500);
  }
});
