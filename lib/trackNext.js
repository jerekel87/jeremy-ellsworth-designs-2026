"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const TRACK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`;
const HEADERS = {
  "content-type": "application/json",
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
const PING_MS = 30000;

function getVisitorId() {
  try {
    let id = localStorage.getItem("je-visitor-id");
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("je-visitor-id", id);
    }
    return id;
  } catch (e) {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function post(body) {
  try {
    fetch(TRACK_URL, { method: "POST", headers: HEADERS, body: JSON.stringify(body), keepalive: true }).catch(() => {});
  } catch (e) { /* tracking is best-effort */ }
}

/* First-party pageview + presence tracking for the public site (Next version).
   Records a "view" on each route change and a lightweight "ping" heartbeat so
   the admin live map can tell who is on the site right now. */
export function usePageTracking() {
  const pathname = usePathname();
  const visitorId = useRef(null);
  const lastPath = useRef(null);

  useEffect(() => {
    visitorId.current = getVisitorId();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        post({ visitorId: visitorId.current, path: lastPath.current || "/", kind: "ping" });
      }
    }, PING_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const path = pathname + (typeof window !== "undefined" ? window.location.search : "");
    lastPath.current = path;
    if (!visitorId.current) visitorId.current = getVisitorId();
    post({
      visitorId: visitorId.current,
      path,
      referrer: document.referrer || "",
      kind: "view",
    });
  }, [pathname]);
}
