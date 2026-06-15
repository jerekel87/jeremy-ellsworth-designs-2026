import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUBJECT = "Your inquiry with Jeremy Ellsworth Designs";
const AGENTS = ["Robin", "Robert", "Paul"];
function threadAgent(thread: any): string {
  if (Array.isArray(thread)) {
    for (let i = thread.length - 1; i >= 0; i--) {
      if (thread[i]?.from === "team" && thread[i]?.agent) return String(thread[i].agent);
    }
  }
  return AGENTS[Math.floor(Math.random() * AGENTS.length)];
}
function buildFrom(agent: string) {
  const raw = Deno.env.get("RESEND_FROM") || "Jeremy Ellsworth Designs <onboarding@resend.dev>";
  const m = raw.match(/<([^>]+)>/);
  const email = m ? m[1] : raw;
  return `${agent} at Jeremy Ellsworth Designs <${email}>`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { id, text } = await req.json();
    const reply = String(text || "").trim();
    if (!id || !reply) return json({ ok: false, error: "Missing id or text." }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: row, error } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!row) return json({ ok: false, error: "Inquiry not found." }, 404);

    const existing = Array.isArray(row.thread) && row.thread.length
      ? row.thread
      : [{ from: "customer", date: fmtDate(new Date(row.created_at)), time: fmtTime(new Date(row.created_at)), text: row.message || "" }];
    const now = new Date();
    const agent = threadAgent(existing);
    const thread = [...existing, { from: "team", date: fmtDate(now), time: fmtTime(now), text: reply, agent }];

    const { data: updated, error: upErr } = await supabase
      .from("inquiries")
      .update({ thread, status: "replied", updated_at: now.toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (upErr) throw upErr;

    const sent = await sendEmail(row.email, reply, SUBJECT, buildFrom(agent));

    return json({ ok: true, sent, inquiry: updated });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "Could not send reply." }, 500);
  }
});
