import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_MODEL = "claude-haiku-4-5";
const SUBJECT = "Re: Your inquiry with Jeremy Ellsworth Designs";
const AGENTS = ["Robin", "Robert", "Paul"];
function threadAgent(thread: any): string {
  if (Array.isArray(thread)) {
    for (let i = thread.length - 1; i >= 0; i--) {
      if (thread[i]?.from === "team" && thread[i]?.agent) return String(thread[i].agent);
    }
  }
  return AGENTS[Math.floor(Math.random() * AGENTS.length)];
}

const SYSTEM = `You are the ongoing email responder for Jeremy Ellsworth Designs (je.design) — a premium, 100% hand-drawn creative brand agency for small businesses, especially home-services companies (HVAC, electrical, plumbing, roofing, painting, lawn care, cleaning, concrete, pest control). You are continuing an email conversation with someone who inquired through the website.

YOUR REAL JOB IS NOT TO SELL. It is to help the person see the gap between where their brand is today and where they want their business to be — and let them arrive at the conclusion themselves. Use a consultative, question-led approach (gap selling): acknowledge what they just said, reflect their situation back, and ask sharp, genuinely curious questions about where they are now, where they want to be, and the cost of staying where they are. Do NOT list services or prices unless they ask. Never use pushy, salesy clichés. You are a trusted advisor, not a closer. Once they show clear intent, gently point them to the next step (a quick call or activating the Brand Access Program).

Tone: warm, confident, human, a little bold. Plain language. Short paragraphs.

Email format:
- Write ONLY the email body. Never include a "Subject:" line or any header.
- Open with "Hi {first name}," using only their first name.
- 2–4 short paragraphs, under ~180 words total.
- End with one clear question that invites them to reply.
- Sign off exactly as:
__AGENT__
Jeremy Ellsworth Designs

Facts you may use (never invent others): 20 years in business; 10-person in-house team; every design drawn by hand, never AI, no templates; 1,800+ five-star reviews (5.0 rating); Brand Access Program — $150 down then $150/month until paid off, work starts immediately, full file access from day one, revisions included, cancel anytime after completion; first concepts in 5–7 business days, most projects done in 2–3 weeks; clients own every file (AI, SVG, PDF, JPG, PNG). Only mention these if relevant or asked.

If asked whether you are a person or AI, be honest: you're an AI assistant that handles email replies for the studio, and every bit of the actual design work is done by hand by real humans — which is the whole point.`;

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function extractEmail(v: unknown): string {
  if (!v) return "";
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.email === "string") return o.email.toLowerCase();
    if (Array.isArray(v) && v.length) return extractEmail(v[0]);
  }
  const m = String(v).match(/[^<>\s]+@[^<>\s]+/);
  return m ? m[0].toLowerCase() : "";
}
// strip quoted history / signatures from a reply so Claude sees only the new text
function cleanReply(text: string): string {
  const lines = String(text || "").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^\s*>/.test(line)) break;
    if (/^\s*On .+wrote:\s*$/.test(line)) break;
    if (/^\s*-{2,}\s*Original Message\s*-{2,}/i.test(line)) break;
    out.push(line);
  }
  return out.join("\n").trim() || String(text || "").trim();
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
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
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
      .select("value")
      .eq("key", "settings.ai.instructions")
      .maybeSingle();
    const extra = String(data?.value || "").trim();
    if (!extra) return base;
    return `${base}

Additional instructions from the studio owner (follow these closely, they take priority over style defaults above):
${extra}`;
  } catch (_e) {
    return base;
  }
}

function buildFrom(agent: string) {
  const raw = Deno.env.get("RESEND_FROM") || "Jeremy Ellsworth Designs <onboarding@resend.dev>";
  const m = raw.match(/<([^>]+)>/);
  const email = m ? m[1] : raw;
  return `${agent} at Jeremy Ellsworth Designs <${email}>`;
}

async function sendEmail(to: string, text: string, from?: string) {
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
    body: JSON.stringify({ from: fromAddr, to: [to], subject: SUBJECT, text, html, reply_to: replyTo }),
  });
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const secret = Deno.env.get("INBOUND_SECRET");
    if (secret) {
      const provided = req.headers.get("x-webhook-secret") || new URL(req.url).searchParams.get("secret");
      if (provided !== secret) return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const payload = await req.json();
    const data = payload?.data ?? payload;
    const fromEmail = extractEmail(data?.from);
    const incoming = cleanReply(data?.text || data?.["text/plain"] || data?.html || "");
    if (!fromEmail || !incoming) return json({ ok: true, skipped: "no usable email content" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("email", fromEmail)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    const row = rows && rows[0];
    if (!row) return json({ ok: true, skipped: "no matching inquiry" });

    const now = new Date();
    const existing = Array.isArray(row.thread) && row.thread.length
      ? row.thread
      : [{ from: "customer", date: fmtDate(new Date(row.created_at)), time: fmtTime(new Date(row.created_at)), text: row.message || "" }];
    const withCustomer = [...existing, { from: "customer", date: fmtDate(now), time: fmtTime(now), text: incoming }];

    const history = withCustomer.map((m: any) => ({
      role: m.from === "team" ? "assistant" : "user",
      content: String(m.text || "").slice(0, 4000),
    }));

    const agent = threadAgent(row.thread);
    const model = await getModel(supabase);
    const reply = await generateReply(history, await getSystem(supabase, agent), model);

    let thread = withCustomer;
    let status = "new";
    if (reply) {
      const after = new Date();
      thread = [...withCustomer, { from: "team", date: fmtDate(after), time: fmtTime(after), text: reply, auto: true, agent }];
      status = "replied";
    }

    await supabase
      .from("inquiries")
      .update({ thread, status, updated_at: new Date().toISOString() })
      .eq("id", row.id);

    if (reply) await sendEmail(row.email, reply, buildFrom(agent));

    return json({ ok: true, replied: Boolean(reply) });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "Inbound handling failed." }, 500);
  }
});
