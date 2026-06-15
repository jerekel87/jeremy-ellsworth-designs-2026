import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const REFRESH_MS = 20000;

/* Fetches the real first-party analytics summary (live presence, 30-day
   traffic, geo breakdowns) from the analytics-summary edge function, refreshing
   on an interval so the live panels stay current without a page reload. */
export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load(initial) {
      try {
        const { data: res, error: err } = await supabase.functions.invoke("analytics-summary");
        if (!active) return;
        if (err) throw err;
        if (!res || res.ok === false) throw new Error(res?.error || "Could not load analytics.");
        setData(res);
        setError(null);
      } catch (e) {
        if (active && initial) setError(e.message || "Could not load analytics.");
      } finally {
        if (active && initial) setLoading(false);
      }
    }

    load(true);
    const id = setInterval(() => load(false), REFRESH_MS);
    return () => { active = false; clearInterval(id); };
  }, []);

  return { data, loading, error };
}
