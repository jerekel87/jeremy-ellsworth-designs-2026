import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LIVE_WINDOW_MIN = 5;

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Tally [label, count] pairs sorted desc, optionally limited.
function tally(rows: any[], pick: (r: any) => string, limit?: number) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = (pick(r) || "").trim();
    if (!k) continue;
    counts[k] = (counts[k] || 0) + 1;
  }
  const out = Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  return limit ? out.slice(0, limit) : out;
}

function buildTraffic(rows: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: { date: string; key: string; set: Set<string> }[] = [];
  const index: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    index[key] = buckets.length;
    buckets.push({ date: fmtDate(d), key, set: new Set() });
  }
  for (const r of rows) {
    if (!r.created_at) continue;
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    if (key in index) buckets[index[key]].set.add(r.visitor_id || "?");
  }
  return buckets.map((b) => ({ date: b.date, visitors: b.set.size }));
}

// Group live rows into per-state pins with city breakdowns for the US map.
function buildGeoPins(rows: any[]) {
  const states: Record<string, { lats: number[]; lons: number[]; cities: Record<string, { lon: number; lat: number; n: number }> }> = {};
  for (const r of rows) {
    if (r.lat == null || r.lon == null || !r.region) continue;
    const st = (states[r.region] ||= { lats: [], lons: [], cities: {} });
    st.lats.push(r.lat);
    st.lons.push(r.lon);
    const cityName = r.city ? `${r.city}, ${r.region}` : r.region;
    const c = (st.cities[cityName] ||= { lon: r.lon, lat: r.lat, n: 0 });
    c.n += 1;
  }
  return Object.entries(states).map(([state, d]) => ({
    state,
    at: [d.lons.reduce((a, b) => a + b, 0) / d.lons.length, d.lats.reduce((a, b) => a + b, 0) / d.lats.length],
    cities: Object.entries(d.cities).map(([name, c]) => [name, c.lon, c.lat, c.n]),
  }));
}

// Per-minute distinct-visitor counts over the last 30 minutes for the live
// sparkline. Zero-filled so the line always spans the full window.
function buildSpark(rows: any[], now: number) {
  const buckets: { time: string; key: number; set: Set<string> }[] = [];
  const index: Record<number, number> = {};
  const base = Math.floor(now / 60000);
  for (let i = 29; i >= 0; i--) {
    const minute = base - i;
    const d = new Date(minute * 60000);
    index[minute] = buckets.length;
    buckets.push({ time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), key: minute, set: new Set() });
  }
  for (const r of rows) {
    if (!r.created_at) continue;
    const minute = Math.floor(new Date(r.created_at).getTime() / 60000);
    if (minute in index) buckets[index[minute]].set.add(r.visitor_id || "?");
  }
  return buckets.map((b) => ({ time: b.time, active: b.set.size }));
}

function pct(rows: any[], pick: (r: any) => string, limit?: number) {
  const t = tally(rows, pick, limit);
  const total = t.reduce((s, x) => s + x.count, 0) || 1;
  return t.map((x) => [x.label, Math.round((x.count / total) * 100)] as [string, number]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = serviceClient();
    if (!supabase) return json({ ok: false });

    const now = Date.now();
    const liveCutoff = new Date(now - LIVE_WINDOW_MIN * 60 * 1000).toISOString();
    const monthCutoff = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: monthRows, error } = await supabase
      .from("page_events")
      .select("visitor_id, path, source, device, country, region, city, lat, lon, created_at")
      .gte("created_at", monthCutoff)
      .order("created_at", { ascending: false });
    if (error) return json({ ok: false, error: error.message });

    const rows = monthRows || [];
    const liveRows = rows.filter((r) => r.created_at && r.created_at >= liveCutoff);

    const liveVisitors = new Set(liveRows.map((r) => r.visitor_id)).size;

    return json({
      ok: true,
      live: {
        count: liveVisitors,
        pages: tally(liveRows, (r) => r.path, 6),
        sources: tally(liveRows, (r) => r.source, 6),
        devices: pct(liveRows, (r) => r.device),
        pins: buildGeoPins(liveRows),
        spark: buildSpark(rows, now),
      },
      traffic: buildTraffic(rows),
      totalViews: rows.length,
      geo: {
        Countries: pct(rows, (r) => r.country, 6),
        States: pct(rows, (r) => r.region, 6),
        Cities: pct(rows, (r) => (r.city ? `${r.city}, ${r.region}` : ""), 6),
      },
    });
  } catch (e) {
    return json({ ok: false, error: String(e) });
  }
});
