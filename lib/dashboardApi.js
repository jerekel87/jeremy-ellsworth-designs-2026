import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function countRows(table, build) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

/* Builds a 30-day series of daily inquiry counts, zero-filled so the chart
   always spans the full window even on quiet days. */
function buildSeries(rows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];
  const index = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    index[key] = buckets.length;
    buckets.push({ date: fmtDate(d), inquiries: 0 });
  }
  for (const r of rows) {
    if (!r.created_at) continue;
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    if (key in index) buckets[index[key]].inquiries += 1;
  }
  return buckets;
}

const STATUS_ORDER = ["new", "replied", "booked"];
const STATUS_LABEL = { new: "New", replied: "Replied", booked: "Booked" };

function byStatus(rows) {
  const counts = {};
  for (const r of rows) {
    const s = r.status || "new";
    counts[s] = (counts[s] || 0) + 1;
  }
  const keys = [...STATUS_ORDER.filter((k) => counts[k]), ...Object.keys(counts).filter((k) => !STATUS_ORDER.includes(k))];
  return keys.map((k) => ({ key: k, label: STATUS_LABEL[k] || k, count: counts[k] }));
}

function byService(rows) {
  const counts = {};
  for (const r of rows) {
    const s = (r.service || "").trim() || "Not specified";
    counts[s] = (counts[s] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export async function fetchDashboard() {
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, company, service, budget, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const inquiries = data || [];

  const [projects, services, reviews] = await Promise.all([
    countRows("projects"),
    countRows("services"),
    countRows("reviews"),
  ]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newInquiries = inquiries.filter((r) => (r.status || "new") === "new").length;
  const weekInquiries = inquiries.filter((r) => r.created_at && new Date(r.created_at).getTime() >= weekAgo).length;

  const recent = inquiries.slice(0, 8).map((r) => ({
    id: r.id,
    name: r.name,
    business: r.company || "",
    service: r.service || "",
    budget: r.budget || "",
    status: r.status || "new",
    date: r.created_at ? fmtDate(r.created_at) : "",
  }));

  return {
    counts: { newInquiries, totalInquiries: inquiries.length, weekInquiries, projects, services, reviews },
    recent,
    series: buildSeries(inquiries),
    statuses: byStatus(inquiries),
    services: byService(inquiries),
  };
}

/* Live count of inquiries still marked "new", for the sidebar badge. Returns 0
   until loaded so the badge stays hidden rather than flashing a stale number. */
export function useNewInquiryCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    countRows("inquiries", (q) => q.eq("status", "new"))
      .then((n) => { if (active) setCount(n); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  return count;
}
