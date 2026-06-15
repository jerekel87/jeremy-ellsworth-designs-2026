import { supabase } from "@/lib/supabase";

/* Sends the running Anthropic-format message thread to the studio-assistant
   edge function, which runs Claude's tool-use loop against the site content
   and returns the updated thread plus any write actions it performed. */
export async function sendAssistant(messages) {
  const { data, error } = await supabase.functions.invoke("studio-assistant", {
    body: { messages },
  });
  if (error) throw new Error(error.message || "The assistant is unavailable right now.");
  if (data?.error && !data?.messages) throw new Error(data.error);
  return {
    messages: Array.isArray(data?.messages) ? data.messages : messages,
    actions: Array.isArray(data?.actions) ? data.actions : [],
    error: data?.error || null,
  };
}

/* Pulls the last N audit-log rows recording what the assistant changed. */
export async function fetchAssistantActions(limit = 20) {
  const { data, error } = await supabase
    .from("assistant_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/* ---- Saved conversations ---- */

export async function listConversations() {
  const { data, error } = await supabase
    .from("assistant_conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function loadConversation(id) {
  const { data, error } = await supabase
    .from("assistant_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createConversation(messages = [], title = "New chat") {
  const { data, error } = await supabase
    .from("assistant_conversations")
    .insert({ messages, title })
    .select("id, title, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function saveConversation(id, messages, title) {
  const patch = { messages, updated_at: new Date().toISOString() };
  if (title != null) patch.title = title;
  const { error } = await supabase
    .from("assistant_conversations")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteConversation(id) {
  const { error } = await supabase.from("assistant_conversations").delete().eq("id", id);
  if (error) throw error;
}

/* Derives a short title from the first user message in a thread. */
export function titleFromMessages(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  const text = typeof first.content === "string"
    ? first.content
    : (first.content || []).filter((b) => b.type === "text").map((b) => b.text).join(" ");
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "New chat";
  return clean.length > 48 ? clean.slice(0, 48) + "…" : clean;
}

/* Reduces an Anthropic message thread to the chat bubbles we render: user text
   and assistant text. Tool-use / tool-result blocks are surfaced separately as
   the actions list, so they're skipped here. */
export function threadToBubbles(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === "user") {
      if (typeof m.content === "string") {
        if (m.content.trim()) out.push({ role: "user", text: m.content, images: [] });
        continue;
      }
      const blocks = m.content || [];
      const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("");
      const images = blocks
        .filter((b) => b.type === "image" && b.source?.type === "url")
        .map((b) => b.source.url);
      if (text.trim() || images.length) out.push({ role: "user", text, images });
    } else if (m.role === "assistant") {
      const text = typeof m.content === "string"
        ? m.content
        : (m.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      if (text.trim()) out.push({ role: "assistant", text, images: [] });
    }
  }
  return out;
}
