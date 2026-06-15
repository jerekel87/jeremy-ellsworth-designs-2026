import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";
}

function deviceFromUA(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) return "Tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) return "Mobile";
  return "Desktop";
}

function sourceFromReferrer(ref: string): string {
  if (!ref) return "Direct";
  let host = "";
  try { host = new URL(ref).hostname.replace(/^www\./, ""); } catch (_e) { return "Other"; }
  if (!host) return "Direct";
  if (host.includes("google.")) return "Google";
  if (host.includes("bing.")) return "Bing";
  if (host.includes("instagram.")) return "Instagram";
  if (host.includes("facebook.") || host === "fb.com" || host.includes("fb.me")) return "Facebook";
  if (host.includes("youtube.") || host.includes("youtu.be")) return "YouTube";
  if (host === "t.co" || host.includes("twitter.") || host === "x.com") return "X";
  if (host.includes("linkedin.")) return "LinkedIn";
  if (host.includes("duckduckgo.")) return "DuckDuckGo";
  return "Other";
}

// Resolve approximate location from IP. Best-effort: never blocks tracking for
// long, and returns nulls if the lookup fails (e.g. local/private IPs).
async function geoFromIp(ip: string) {
  const empty = { country: "", region: "", city: "", lat: null as number | null, lon: null as number | null };
  if (!ip || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "::1") return empty;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return empty;
    const d = await res.json();
    if (d?.error) return empty;
    return {
      country: String(d.country_name || ""),
      region: String(d.region || ""),
      city: String(d.city || ""),
      lat: typeof d.latitude === "number" ? d.latitude : null,
      lon: typeof d.longitude === "number" ? d.longitude : null,
    };
  } catch (_e) {
    return empty;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = serviceClient();
    if (!supabase) return json({ ok: false });

    const body = await req.json().catch(() => ({}));
    const visitorId = String(body.visitorId || "").slice(0, 80);
    const path = String(body.path || "/").slice(0, 300);
    const referrer = String(body.referrer || "").slice(0, 500);
    const kind = String(body.kind || "view");
    if (!visitorId) return json({ ok: false });

    const ua = (req.headers.get("user-agent") || "").slice(0, 500);
    const device = deviceFromUA(ua);

    let geo = { country: "", region: "", city: "", lat: null as number | null, lon: null as number | null };
    let source = sourceFromReferrer(referrer);

    if (kind === "ping") {
      // Reuse this visitor's most recent location/source so heartbeat rows stay
      // on the live map without burning an extra geolocation lookup.
      const { data: last } = await supabase
        .from("page_events")
        .select("country, region, city, lat, lon, source")
        .eq("visitor_id", visitorId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last) {
        geo = { country: last.country, region: last.region, city: last.city, lat: last.lat, lon: last.lon };
        source = last.source || source;
      }
    } else {
      geo = await geoFromIp(clientIp(req));
    }

    await supabase.from("page_events").insert({
      visitor_id: visitorId,
      path,
      referrer,
      source,
      device,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      lat: geo.lat,
      lon: geo.lon,
    });

    return json({ ok: true });
  } catch (_e) {
    return json({ ok: false });
  }
});
