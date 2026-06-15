import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchContent } from "@/lib/siteContent";

export { fetchContent };

export async function uploadMedia(file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const folder = (file.type || "").startsWith("video/") ? "videos" : "images";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("site-media")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  return data.publicUrl;
}

/* Lists files the studio has uploaded to the site-media storage bucket, with
   public URLs, so they show up alongside the bundled /public assets. */
export async function listUploadedMedia() {
  const groups = [
    { key: "images", type: "image" },
    { key: "videos", type: "video" },
  ];
  const out = [];
  for (const g of groups) {
    const { data, error } = await supabase.storage
      .from("site-media")
      .list(g.key, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) continue;
    for (const obj of data) {
      if (!obj.name || obj.name.startsWith(".")) continue;
      const storagePath = `${g.key}/${obj.name}`;
      const { data: pub } = supabase.storage.from("site-media").getPublicUrl(storagePath);
      const mime = obj.metadata?.mimetype || "";
      out.push({
        name: obj.name,
        path: pub.publicUrl,
        storagePath,
        folder: "Uploads",
        size: obj.metadata?.size || 0,
        type: mime.startsWith("video/") ? "video" : g.type,
        usage: "Uploaded — copy the URL to use anywhere",
        uploaded: true,
      });
    }
  }
  return out;
}

export async function deleteUploadedMedia(storagePath) {
  const { error } = await supabase.storage.from("site-media").remove([storagePath]);
  if (error) throw error;
}

export async function saveContent(entries) {
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value: value ?? "",
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return;
  const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}

/* Loads a flat map of editable keys from site_content (falling back to the
   supplied defaults), tracks a draft + dirty state, and persists only the
   changed keys. Used by admin editors with a save/discard bar. */
export function useContentDraft(defaults) {
  const keys = Object.keys(defaults);
  const [draft, setDraft] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchContent()
      .then((c) => {
        if (!active) return;
        const next = { ...defaults };
        for (const k of keys) if (c[k] != null) next[k] = c[k];
        setDraft(next);
        setSaved(next);
      })
      .catch((e) => { if (active) setError(e.message || "Could not load settings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const dirty = keys.some((k) => draft[k] !== saved[k]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const changed = Object.fromEntries(keys.filter((k) => draft[k] !== saved[k]).map((k) => [k, draft[k]]));
      await saveContent(changed);
      setSaved(draft);
    } catch (e) {
      setError(e.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  function discard() { setDraft(saved); }

  return { draft, set, setDraft, dirty, loading, saving, error, save, discard };
}

/* Read-only flat map of all site_content keys, for public pages that fall back
   to their own defaults (e.g. the Brand Access page). */
export function useContentMap() {  const [content, setContent] = useState({});
  useEffect(() => {
    let active = true;
    fetchContent().then((c) => { if (active) setContent(c); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return content;
}

/* Reports which server-side integration secrets are actually configured (as
   booleans only — values never leave the edge function). Used by the admin
   Settings page to show honest, read-only integration status. */
export function useIntegrationStatus() {
  const [status, setStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.functions
      .invoke("integration-status")
      .then(({ data }) => {
        if (!active || !data?.ok) return;
        setStatus(data.status);
        if (Array.isArray(data.models)) setModels(data.models);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { status, models, loading };
}
