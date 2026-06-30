# Admin Dashboard — full export

Everything that makes up the **Dashboard** page (`/admin`): components, data layer, the live US map, and all the CSS. Copy these into the matching paths in your other project.

The codebase uses the `@/` import alias pointing at the project root (configure in `jsconfig.json` / `vite.config` / `tsconfig`). Adjust paths if your alias differs.

---

## 1. Dependencies

```bash
npm install d3-geo topojson-client us-atlas recharts react-router-dom @supabase/supabase-js
```

| Package | Used for |
| --- | --- |
| `recharts` | Traffic area chart + live sparkline |
| `d3-geo` | Projecting live lon/lat pins onto the US map |
| `topojson-client` + `us-atlas` | One-time generation of the baked US map path strings (build step only) |
| `react-router-dom` | `<Link>` navigation + `useNavigate` |
| `@supabase/supabase-js` | Data (inquiries/projects/services/reviews) + analytics edge function |

---

## 2. Fonts + design tokens

Add the fonts in your `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Tokens the dashboard relies on (in `:root`):

```css
:root {
  --black: #0a0a0a;
  --ink: #000000;
  --yellow: #fff600;
  --white: #f6f6f8;
  --gray: #8f8f8f;
  --gray-dark: #53545c;
  --line: rgba(255, 255, 255, 0.09);
  --font-display: "Archivo", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--black); color: var(--white); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
img { display: block; max-width: 100%; }
```

---

## 3. The `+ New project` button (shared `.btn`)

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font-family: var(--font-display); font-weight: 700; font-size: 15px; letter-spacing: 0.02em;
  padding: 18px 36px; border-radius: 999px;
  position: relative; overflow: hidden;
  transition: color 0.35s var(--ease-out), border-color 0.35s, transform 0.2s;
  appearance: none; -webkit-appearance: none;
  background: transparent; border: none; cursor: pointer;
}
.btn--sm { padding: 15px 32px; font-size: 14.5px; }
.btn span { position: relative; z-index: 1; }
.btn::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  transform: scaleY(0); transform-origin: bottom;
  transition: transform 0.4s var(--ease-out);
}
.btn:hover::before { transform: scaleY(1); }
.btn--solid { background: var(--yellow); color: var(--ink); }
.btn--solid::before { background: var(--white); }
```

---

## 4. Dashboard CSS

All of the `.cms-*` rules the dashboard uses, including the header chrome, stat cards, panels, table, quick actions, charts, live panel, US map, and the geo breakdown.

```css
/* ---- Account avatar + dropdown (header) ---- */
.cms-acct { position: relative; }
.cms-acct__btn { padding: 0; }
.cms-acct__menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  min-width: 220px;
  background: #1c1c20; border: 1px solid var(--line); border-radius: 12px;
  padding: 6px; z-index: 200;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 0.12s ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.cms-acct__head {
  display: flex; flex-direction: column; gap: 2px;
  padding: 9px 11px 11px; border-bottom: 1px solid var(--line); margin-bottom: 4px;
}
.cms-acct__role { font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-dark); }
.cms-acct__email { font-size: 13px; color: var(--white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
.cms-acct__signout {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 10px 11px; background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 600; color: var(--gray);
  border-radius: 8px; transition: background 0.15s, color 0.15s;
}
.cms-acct__signout:hover { background: rgba(255, 255, 255, 0.07); color: var(--white); }

/* topbar */
.cms__topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 26px 34px;
  border-bottom: 1px solid var(--line);
}
.cms__title {
  font-family: var(--font-display); font-weight: 800; font-stretch: 115%;
  font-size: 26px; text-transform: uppercase; letter-spacing: -0.01em;
}
.cms__subtitle { color: var(--gray); font-size: 13.5px; margin-top: 4px; }
.cms__topbar-actions { display: flex; align-items: center; gap: 14px; }
.cms__search {
  display: flex; align-items: center; gap: 0;
  background: #141416; border: 1px solid var(--line); border-radius: 999px;
  height: 52px; width: 52px;
  padding: 0 17px;
  color: var(--gray-dark);
  cursor: pointer; overflow: hidden;
  transition: width 0.45s cubic-bezier(0.3, 0, 0.2, 1), border-color 0.3s, gap 0.45s;
}
.cms__search:hover { border-color: rgba(255, 255, 255, 0.3); color: var(--gray); }
.cms__search.is-open { width: 260px; gap: 10px; cursor: text; }
.cms__search svg { flex-shrink: 0; }
.cms__search input {
  background: none; border: 0; outline: 0; width: 100%;
  color: var(--white); font-size: 13px; font-family: var(--font-body);
  opacity: 0;
  transition: opacity 0.3s 0.1s;
}
.cms__search.is-open input { opacity: 1; }
.cms__search input::placeholder { color: var(--gray-dark); }
.cms__avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--yellow); color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 13px;
  border: none; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.cms__avatar:hover { transform: scale(1.05); box-shadow: 0 0 0 3px rgba(255, 246, 0, 0.25); }
.cms__avatar img { filter: invert(1); width: 22px; height: auto; }

/* content */
.cms__content { padding: 30px 34px 60px; display: grid; gap: 26px; }
.cms__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.cms-stat {
  background: #121214; border: 1px solid var(--line); border-radius: 6px;
  padding: 20px 22px;
  display: grid; gap: 8px; align-content: start;
  transition: border-color 0.2s, transform 0.2s;
}
.cms-stat:hover { border-color: rgba(255, 246, 0, 0.4); transform: translateY(-2px); }
.cms-stat__label { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); }
.cms-stat__value {
  font-family: var(--font-display); font-weight: 900; font-stretch: 118%;
  font-size: 38px; line-height: 1; letter-spacing: -0.02em;
}
.cms-stat__delta { font-size: 12.5px; color: var(--gray-dark); }
.cms-stat__delta.is-up { color: #7ee08a; }

.cms-panel { background: #121214; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
.cms-panel__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 26px 16px;
}
.cms-panel__head h2 {
  font-family: var(--font-display); font-weight: 800; font-stretch: 112%;
  font-size: 15px; text-transform: uppercase; letter-spacing: 0.03em;
}
.cms__more { font-size: 12.5px; font-weight: 700; color: var(--gray); }
.cms__more:hover { color: var(--yellow); }

.cms-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cms-table th {
  text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--gray-dark);
  padding: 10px 22px;
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
}
.cms-table td { padding: 13px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #c9cad1; }
.cms-table tr:last-child td { border-bottom: 0; }
.cms-table tbody tr:hover { background: rgba(255, 255, 255, 0.025); }
.cms-table td strong { color: var(--white); font-weight: 600; }
.cms-table__dim { color: var(--gray-dark); white-space: nowrap; }

.cms-chip {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
  border-radius: 99px; padding: 3px 10px;
  white-space: nowrap;
}
.cms-chip--new { background: rgba(255, 246, 0, 0.14); color: var(--yellow); }
.cms-chip--replied { background: rgba(255, 255, 255, 0.08); color: #c9cad1; }
.cms-chip--booked, .cms-chip--live { background: rgba(126, 224, 138, 0.13); color: #7ee08a; }

.cms-actions { display: grid; padding: 4px 10px 12px; }
.cms-action {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; border-radius: 6px;
  font-size: 13.5px; font-weight: 600; color: #c9cad1;
  transition: background 0.2s, color 0.2s;
}
.cms-action:hover { background: rgba(255, 255, 255, 0.05); color: var(--white); }
.cms-action i {
  font-style: normal; width: 30px; height: 30px; border-radius: 6px;
  background: rgba(255, 246, 0, 0.12); color: var(--yellow);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px;
}

/* charts, live, map, geo */
.cms__grid-a { display: grid; grid-template-columns: 2.3fr 1fr; gap: 16px; align-items: stretch; }
.cms__grid-b { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 16px; align-items: stretch; }
.cms-dash__empty { color: var(--gray); font-size: 14px; line-height: 1.6; padding: 28px 4px; text-align: center; }
.cms-panel__meta { font-size: 12px; color: var(--gray); display: inline-flex; align-items: center; gap: 7px; }
.cms-panel__meta strong { color: var(--white); }
.cms-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.cms-dot--yellow { background: var(--yellow); }
.cms-dot--green { background: #7ee08a; }

.cms-chart { padding: 8px 16px 12px; font-size: 11px; }
.cms-spark { padding: 0 14px; }
.cms-tip {
  background: #1c1c1f; border: 1px solid var(--line); border-radius: 6px;
  padding: 8px 12px;
  display: grid; gap: 2px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}
.cms-tip__label { font-size: 11px; color: var(--gray); }
.cms-tip strong { font-size: 13px; font-weight: 700; color: var(--white); }
.cms-chart .recharts-area-curve, .cms-spark .recharts-area-curve { filter: drop-shadow(0 0 6px rgba(255, 246, 0, 0.25)); }

/* live now */
.cms-live { display: flex; flex-direction: column; }
.cms-live__badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
  color: #7ee08a;
}
.cms-live__badge i {
  width: 8px; height: 8px; border-radius: 50%;
  background: #7ee08a;
  animation: cmsLiveBlink 1.6s ease-in-out infinite;
}
@keyframes cmsLiveBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.cms-live__count { display: flex; align-items: baseline; gap: 12px; padding: 2px 22px 10px; }
.cms-live__count strong {
  font-family: var(--font-display); font-weight: 900; font-stretch: 118%;
  font-size: 54px; line-height: 1; letter-spacing: -0.02em;
}
.cms-live__count span { font-size: 13px; color: var(--gray); }
.cms-live__spark-label { font-size: 11px; color: var(--gray-dark); padding: 6px 22px 4px; }
.cms-live__devbar {
  display: flex; gap: 3px;
  height: 7px; border-radius: 99px; overflow: hidden;
  margin-top: 2px;
}
.cms-live__devbar i { display: block; height: 100%; border-radius: 99px; }
.cms-live__dev--1 { background: var(--yellow); }
.cms-live__dev--2 { background: rgba(255, 255, 255, 0.35); }
.cms-live__dev--3 { background: rgba(255, 255, 255, 0.12); }
.cms-live__devlegend { display: flex; gap: 16px; padding-top: 10px; font-size: 11.5px; color: var(--gray); flex-wrap: wrap; }
.cms-live__devlegend span { display: inline-flex; align-items: center; gap: 6px; }
.cms-live__devlegend i { width: 8px; height: 8px; border-radius: 2px; }
.cms-live__group { padding: 12px 22px 0; }
.cms-live__group:last-child { padding-bottom: 18px; }
.cms-live__group + .cms-live__group { margin-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 14px; }
.cms-live__pages { display: grid; }
.cms-live__pages li {
  display: grid; grid-template-columns: minmax(0, 140px) 1fr 24px;
  align-items: center; gap: 12px;
  padding: 7px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12.5px;
}
.cms-live__pages li:first-child { border-top: 0; }
.cms-live__pages span { color: #c9cad1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cms-live__pages i { display: block; height: 4px; border-radius: 99px; background: rgba(255, 246, 0, 0.55); }
.cms-live__pages strong { text-align: right; font-weight: 700; }

/* live map */
.cms-map { position: relative; padding: 4px 14px 14px; }
.cms-map__frame { position: relative; overflow: hidden; }
.cms-map svg { display: block; width: 100%; height: auto; }
.cms-map__num {
  fill: var(--ink); font-weight: 800; font-family: var(--font-body);
  text-anchor: middle; dominant-baseline: middle;
  pointer-events: none;
}
.cms-map__tip {
  position: absolute; z-index: 3;
  transform: translate(-50%, calc(-100% - 12px));
  pointer-events: none;
  white-space: nowrap;
}
.cms-map__legend { display: block; padding-top: 8px; font-size: 11px; color: var(--gray-dark); }
.cms-map__world { transition: transform 0.7s cubic-bezier(0.3, 0, 0.2, 1); }
.cms-map__land { fill: #1c1c20; stroke: rgba(255, 255, 255, 0.22); stroke-linejoin: round; }
.cms-map__borders { fill: none; stroke: rgba(255, 255, 255, 0.11); stroke-linejoin: round; }
.cms-map__pin { transition: transform 0.7s cubic-bezier(0.3, 0, 0.2, 1); }
.cms-map__hit { fill: transparent; cursor: pointer; pointer-events: all; }
.cms-map__dot { fill: var(--yellow); pointer-events: none; }
.cms-map__controls {
  position: absolute; top: 8px; right: 16px; z-index: 2;
  display: grid; gap: 5px;
}
.cms-map__controls button {
  width: 28px; height: 28px; border-radius: 6px;
  background: #1c1c1f; color: var(--white);
  border: 1px solid var(--line);
  font-size: 15px; line-height: 1; font-family: var(--font-body);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
}
.cms-map__controls button:hover:not(:disabled) { background: #28282c; border-color: rgba(255, 255, 255, 0.3); }
.cms-map__controls button:disabled { opacity: 0.35; cursor: default; }
.cms-map__pulse {
  fill: none; stroke: var(--yellow); stroke-width: 1.5;
  transform-box: fill-box; transform-origin: center;
  animation: cmsMapPulse 2.6s ease-out infinite;
}
@keyframes cmsMapPulse {
  0% { transform: scale(0.25); opacity: 0.9; }
  70% { transform: scale(1); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

/* geo breakdown */
.cms-geo { display: flex; flex-direction: column; }
.cms-geo__group { padding: 0 22px 14px; }
.cms-geo__group + .cms-geo__group { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 14px; }
.cms-geo__label {
  display: block;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gray-dark);
  padding-bottom: 8px;
}
.cms-geo__group ul { display: grid; gap: 7px; }
.cms-geo__group li {
  display: grid; grid-template-columns: minmax(0, 130px) 1fr 36px;
  align-items: center; gap: 12px;
  font-size: 12.5px;
}
.cms-geo__group li span { color: #c9cad1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cms-geo__group li i { display: block; height: 4px; border-radius: 99px; background: rgba(255, 255, 255, 0.07); overflow: hidden; }
.cms-geo__group li b { display: block; height: 100%; border-radius: 99px; background: var(--yellow); }
.cms-geo__group li strong { text-align: right; font-weight: 700; }

/* ---- responsive ---- */
@media (max-width: 1200px) {
  .cms__grid-a, .cms__grid-b { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .cms__topbar { flex-wrap: wrap; gap: 14px; }
  .cms__topbar > div:first-child { width: 100%; }
  .cms__title { font-size: 22px; }
  .cms__topbar-actions { width: 100%; justify-content: space-between; gap: 10px; }
  .cms__topbar-actions .btn { flex: 1; justify-content: center; padding-inline: 18px; white-space: nowrap; }
  .cms__search.is-open { width: 200px; }
  .cms__stats { gap: 10px; }
  .cms-stat { padding: 14px 16px; }
  .cms-stat__value { font-size: 28px; }
  .cms-stat__label { font-size: 10.5px; }
  .cms-panel__head { padding: 15px 16px 12px; }
  .cms-live__count { padding-inline: 16px; }
  .cms-live__count strong { font-size: 42px; }
  .cms-live__spark-label { padding-inline: 16px; }
  .cms-live__group { padding-inline: 16px; }
  .cms-geo__group { padding-inline: 16px; }
  .cms-map { padding: 0 10px 12px; }
  .cms-map__legend { padding-left: 4px; }
  /* recent inquiries table -> cards */
  .cms-table thead { display: none; }
  .cms-table, .cms-table tbody { display: block; }
  .cms-table tr {
    display: grid; grid-template-columns: 1fr auto; gap: 3px 14px;
    padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .cms-table tr:last-child { border-bottom: 0; }
  .cms-table tbody tr:hover { background: none; }
  .cms-table td { display: block; padding: 0; border: 0; }
  .cms-table td:nth-child(1) { grid-column: 1; grid-row: 1; font-size: 14.5px; }
  .cms-table td:nth-child(6) { grid-column: 2; grid-row: 1 / span 2; align-self: start; justify-self: end; }
  .cms-table td:nth-child(2) { grid-column: 1; grid-row: 2; color: var(--gray); }
  .cms-table td:nth-child(3) { grid-column: 1; grid-row: 3; color: var(--gray); font-size: 12.5px; }
  .cms-table td:nth-child(4) { grid-column: 1; grid-row: 4; color: var(--gray-dark); font-size: 12.5px; }
  .cms-table td:nth-child(5) { grid-column: 2; grid-row: 4; justify-self: end; font-size: 12px; }
}
@media (max-width: 380px) {
  .cms__stats { grid-template-columns: 1fr 1fr; gap: 8px; }
  .cms-stat__value { font-size: 24px; }
}
```

---

## 5. Page component — `pages/admin/Dashboard.jsx`

```jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { geoAlbersUsa } from "d3-geo";
import { TrafficChart, LiveSpark } from "@/components/cms/Charts";
import UsLiveMap from "@/components/cms/UsLiveMap";
import SearchExpand from "@/components/cms/SearchExpand";
import AccountMenu from "@/components/cms/AccountMenu";
import { fetchDashboard } from "@/lib/dashboardApi";
import { useAnalytics } from "@/lib/analyticsApi";

const STATUS_LABEL = { new: "New", replied: "Replied", booked: "Booked" };
const DEV_CLASS = ["cms-live__dev--1", "cms-live__dev--2", "cms-live__dev--3"];

// Must match the projection baked into lib/usMapPaths.js exactly (975x610 canvas).
const mapProjection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

/* Project live lon/lat pins into canvas space so they sit on the baked US map.
   Live pin shape: { state, at: [lon, lat], cities: [[name, lon, lat, n], ...] }.
   Anything geoAlbersUsa can't place (outside the US) is dropped. */
function projectPins(pins) {
  const out = [];
  for (const p of pins || []) {
    const xy = mapProjection(p.at);
    if (!xy) continue;
    const cities = [];
    let total = 0;
    for (const [city, lon, lat, n] of p.cities || []) {
      total += n;
      const c = mapProjection([lon, lat]);
      if (c) cities.push({ city, x: +c[0].toFixed(1), y: +c[1].toFixed(1), n });
    }
    out.push({ state: p.state, x: +xy[0].toFixed(1), y: +xy[1].toFixed(1), total, cities });
  }
  return out.sort((a, b) => b.total - a.total);
}

function LivePages({ rows }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  return (
    <ul className="cms-live__pages">
      {rows.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <i style={{ width: `${(r.count / max) * 100}%` }}></i>
          <strong>{r.count}</strong>
        </li>
      ))}
    </ul>
  );
}

function GeoGroup({ label, rows }) {
  if (!rows || !rows.length) return null;
  return (
    <div className="cms-geo__group">
      <span className="cms-geo__label">{label}</span>
      <ul>
        {rows.map(([name, p]) => (
          <li key={name}>
            <span>{name}</span>
            <i><b style={{ width: `${p}%` }}></b></i>
            <strong>{p}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: analytics, loading: aLoading } = useAnalytics();

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((d) => { if (active) setData(d); })
      .catch((e) => { if (active) setError(e.message || "Could not load dashboard data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const c = data?.counts;
  const recent = data?.recent || [];

  const live = analytics?.live;
  const traffic = analytics?.traffic || [];
  const geo = analytics?.geo;
  const liveCount = live?.count || 0;
  const devices = live?.devices || [];
  const hasTraffic = traffic.some((t) => t.visitors > 0);
  const mapStates = useMemo(() => projectPins(live?.pins), [live?.pins]);

  const stats = [
    {
      label: "New inquiries",
      value: c ? c.newInquiries : "—",
      delta: c ? (c.weekInquiries > 0 ? `+${c.weekInquiries} this week` : "None this week") : "",
      up: c ? c.weekInquiries > 0 : false,
      href: "/admin/inquiries",
    },
    { label: "Published projects", value: c ? c.projects : "—", delta: "Live on site", up: false, href: "/admin/projects" },
    { label: "Active services", value: c ? c.services : "—", delta: "Published", up: false, href: "/admin/services" },
    { label: "Reviews", value: c ? c.reviews : "—", delta: "On the site", up: false, href: "/admin/reviews" },
  ];

  return (
    <>
      <header className="cms__topbar">
        <div>
          <h1 className="cms__title">Dashboard</h1>
          <p className="cms__subtitle">Welcome back, Jeremy. Here&rsquo;s what&rsquo;s happening at je.design.</p>
        </div>
        <div className="cms__topbar-actions">
          <SearchExpand />
          <Link to="/admin/projects/new" className="btn btn--sm btn--solid"><span>+ New project</span></Link>
          <AccountMenu />
        </div>
      </header>

      <div className="cms__content">
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}

        <section className="cms__stats">
          {stats.map((s) => (
            <Link className="cms-stat" to={s.href} key={s.label}>
              <span className="cms-stat__label">{s.label}</span>
              <strong className="cms-stat__value">{loading ? "…" : s.value}</strong>
              {s.delta ? <span className={"cms-stat__delta" + (s.up ? " is-up" : "")}>{s.up ? "↑ " : ""}{s.delta}</span> : <span className="cms-stat__delta">&nbsp;</span>}
            </Link>
          ))}
        </section>

        {/* ---- recent inquiries ---- */}
        <section className="cms-panel cms-panel--table">
          <header className="cms-panel__head">
            <h2>Recent inquiries</h2>
            <Link to="/admin/inquiries" className="cms__more">View all →</Link>
          </header>
          {loading ? (
            <p className="cms-dash__empty">Loading inquiries…</p>
          ) : recent.length === 0 ? (
            <p className="cms-dash__empty">No inquiries yet. When someone submits the contact form, they&rsquo;ll show up right here.</p>
          ) : (
            <table className="cms-table">
              <thead>
                <tr><th>Name</th><th>Business</th><th>Interested in</th><th>Budget</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((q) => (
                  <tr key={q.id}>
                    <td><strong>{q.name}</strong></td>
                    <td>{q.business || "—"}</td>
                    <td>{q.service || "—"}</td>
                    <td>{q.budget || "—"}</td>
                    <td className="cms-table__dim">{q.date}</td>
                    <td><span className={"cms-chip cms-chip--" + q.status}>{STATUS_LABEL[q.status] || q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ---- visitor traffic + quick actions ---- */}
        <div className="cms__grid-a">
          <section className="cms-panel">
            <header className="cms-panel__head">
              <h2>Traffic — last 30 days</h2>
              <span className="cms-panel__meta"><i className="cms-dot cms-dot--yellow"></i><strong>{(analytics?.totalViews || 0).toLocaleString()}</strong> views</span>
            </header>
            {aLoading && !analytics ? (
              <p className="cms-dash__empty">Loading…</p>
            ) : hasTraffic ? (
              <TrafficChart data={traffic} dataKey="visitors" suffix=" visitors" />
            ) : (
              <p className="cms-dash__empty">No visits recorded yet. This chart fills in as people browse the public site.</p>
            )}
          </section>

          <section className="cms-panel">
            <header className="cms-panel__head"><h2>Quick actions</h2></header>
            <div className="cms-actions">
              <Link to="/admin/projects/new" className="cms-action"><i>＋</i>Add a project</Link>
              <Link to="/admin/reviews" className="cms-action"><i>★</i>Manage reviews</Link>
              <Link to="/admin/brand-access" className="cms-action"><i>✂</i>Edit Brand Access page</Link>
              <Link to="/admin/media" className="cms-action"><i>▦</i>Upload media</Link>
              <Link to="/admin/pages" className="cms-action"><i>✎</i>Edit page copy</Link>
            </div>
          </section>
        </div>

        {/* ---- live: right now / where visitors are / US map ---- */}
        <div className="cms__grid-b">
          <section className="cms-panel cms-live">
            <header className="cms-panel__head">
              <h2>Right now</h2>
              <span className="cms-live__badge"><i></i>Live</span>
            </header>
            <div className="cms-live__count">
              <strong>{aLoading && !analytics ? "…" : liveCount}</strong>
              <span>{liveCount === 1 ? "visitor" : "visitors"} on the site</span>
            </div>
            <span className="cms-live__spark-label">Active visitors · past hour</span>
            <LiveSpark data={live?.spark || []} />
            {live?.pages?.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Active pages</span>
                <LivePages rows={live.pages} />
              </div>
            )}
            {live?.sources?.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Coming from</span>
                <LivePages rows={live.sources} />
              </div>
            )}
            {devices.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Devices</span>
                <div className="cms-live__devbar">
                  {devices.slice(0, 3).map(([label, p], i) => (
                    <i key={label} className={DEV_CLASS[i]} style={{ width: `${p}%` }} title={`${label} ${p}%`}></i>
                  ))}
                </div>
                <div className="cms-live__devlegend">
                  {devices.slice(0, 3).map(([label, p], i) => (
                    <span key={label}><i className={DEV_CLASS[i]}></i>{label} {p}%</span>
                  ))}
                </div>
              </div>
            )}
            {!aLoading && liveCount === 0 && (
              <p className="cms-dash__empty">No one&rsquo;s on the site this moment. This lights up in real time as visitors arrive.</p>
            )}
          </section>

          <section className="cms-panel cms-geo">
            <header className="cms-panel__head"><h2>Where visitors are</h2></header>
            {aLoading && !analytics ? (
              <p className="cms-dash__empty">Loading…</p>
            ) : geo && (geo.Countries?.length || geo.States?.length || geo.Cities?.length) ? (
              <>
                <GeoGroup label="Countries" rows={geo.Countries} />
                <GeoGroup label="States" rows={geo.States} />
                <GeoGroup label="Cities" rows={geo.Cities} />
              </>
            ) : (
              <p className="cms-dash__empty">No location data yet. This fills in as visitors browse the site.</p>
            )}
          </section>

          <section className="cms-panel">
            <header className="cms-panel__head">
              <h2>Live visitors — USA</h2>
              <span className="cms-panel__meta"><i className="cms-dot cms-dot--green"></i>{liveCount} active</span>
            </header>
            <UsLiveMap states={mapStates} />
          </section>
        </div>
      </div>
    </>
  );
}
```

---

## 6. Charts — `components/cms/Charts.jsx`

```jsx
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";

const YELLOW = "#FFF600";
const GRID = "rgba(255, 255, 255, 0.06)";
const TICK = { fill: "#6b6c75", fontSize: 11, fontFamily: "inherit" };

function ChartTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="cms-tip">
      {label ? <span className="cms-tip__label">{label}</span> : null}
      <strong>{payload[0].value.toLocaleString()}{suffix || ""}</strong>
    </div>
  );
}

export function LiveSpark({ data, dataKey = "active", suffix = " active" }) {
  return (
    <div className="cms-spark">
      <ResponsiveContainer width="100%" height={78}>
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cmsSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YELLOW} stopOpacity={0.3} />
              <stop offset="100%" stopColor={YELLOW} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={false} />
          <Area
            type="monotone" dataKey={dataKey}
            stroke={YELLOW} strokeWidth={2}
            fill="url(#cmsSpark)"
            activeDot={{ r: 3.5, fill: YELLOW, stroke: "#121214", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficChart({ data, dataKey = "visitors", suffix = " visitors" }) {
  return (
    <div className="cms-chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="cmsTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YELLOW} stopOpacity={0.24} />
              <stop offset="100%" stopColor={YELLOW} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date" tick={TICK} tickLine={false} axisLine={false}
            interval="preserveStartEnd" minTickGap={48} dy={6}
          />
          <YAxis
            tick={TICK} tickLine={false} axisLine={false} width={42}
            allowDecimals={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : v)}
          />
          <Tooltip
            content={<ChartTooltip suffix={suffix} />}
            cursor={{ stroke: "rgba(255, 246, 0, 0.35)", strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone" dataKey={dataKey}
            stroke={YELLOW} strokeWidth={2.5}
            fill="url(#cmsTraffic)"
            activeDot={{ r: 4.5, fill: YELLOW, stroke: "#121214", strokeWidth: 2 }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 7. Live US map — `components/cms/UsLiveMap.jsx`

```jsx
import { useState } from "react";
import { US_VIEWBOX, US_NATION_D, US_BORDERS_D } from "@/lib/usMapPaths";

const CX = 487.5, CY = 305;
const K_MIN = 1, K_MAX = 8, K_STATE = 4.5;
const K_CITY_MODE = 2.5; // past this zoom, dots break down into cities

export default function UsLiveMap({ states = [] }) {
  const [view, setView] = useState({ k: 1, x: CX, y: CY });
  const [tip, setTip] = useState(null);

  function clampView(k, x, y) {
    k = Math.min(K_MAX, Math.max(K_MIN, k));
    const hw = CX / k, hh = CY / k;
    x = Math.min(975 - hw, Math.max(hw, x));
    y = Math.min(610 - hh, Math.max(hh, y));
    return { k, x, y };
  }
  const apply = (next) => { setTip(null); setView(next); };
  const zoom = (f) => apply(clampView(view.k * f, view.x, view.y));
  const reset = () => apply({ k: 1, x: CX, y: CY });

  const { k, x, y } = view;
  const toScreen = (p) => [CX - k * x + k * p.x, CY - k * y + k * p.y];

  const cities = states.flatMap((s) => s.cities);
  const cityMode = view.k >= K_CITY_MODE && cities.length > 0;
  const maxState = Math.max(1, ...states.map((s) => s.total));
  const maxCity = Math.max(1, ...cities.map((c) => c.n));
  const total = states.reduce((sum, s) => sum + s.total, 0);

  const pins = cityMode
    ? cities.map((c) => ({ ...c, label: `${c.city} — ${c.n} active`, r: 3 + (c.n / maxCity) * 3, onClick: () => apply(clampView(k, c.x, c.y)) }))
    : states.map((s) => ({ ...s, n: s.total, label: `${s.state} — ${s.total} active`, r: 4.5 + (s.total / maxState) * 4, onClick: () => apply(clampView(K_STATE, s.x, s.y)) }));

  return (
    <div className="cms-map">
      <div className="cms-map__controls">
        <button type="button" onClick={() => zoom(1.6)} disabled={k >= K_MAX} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(1 / 1.6)} disabled={k <= K_MIN} aria-label="Zoom out">−</button>
        <button type="button" onClick={reset} aria-label="Reset view" disabled={k === 1}>⌂</button>
      </div>
      <div className="cms-map__frame">
        <svg viewBox={US_VIEWBOX} role="img" aria-label="Map of live visitors across the United States">
          <g className="cms-map__world" style={{ transform: `translate(${CX - k * x}px, ${CY - k * y}px) scale(${k})` }}>
            <path d={US_NATION_D} className="cms-map__land" style={{ strokeWidth: 1 / k }} />
            <path d={US_BORDERS_D} className="cms-map__borders" style={{ strokeWidth: 0.7 / k }} />
            {pins.map((p, i) => (
              <g key={p.label} transform={`translate(${p.x}, ${p.y})`}>
                <g className="cms-map__pin" style={{ transform: `scale(${1 / k})` }}>
                  <circle r={p.r + 7} className="cms-map__pulse" style={{ animationDelay: `${(i % 8) * 0.35}s` }} />
                  <circle r={p.r} className="cms-map__dot" />
                  {p.n > 1 ? <text y={0.5} className="cms-map__num" style={{ fontSize: p.r * 1.1 }}>{p.n}</text> : null}
                  <circle r={p.r + 8} className="cms-map__hit" onClick={p.onClick}
                    onMouseEnter={() => setTip({ label: p.label, at: toScreen(p) })}
                    onMouseLeave={() => setTip(null)} />
                </g>
              </g>
            ))}
          </g>
        </svg>
        {tip ? (
          <div className="cms-tip cms-map__tip"
            style={{ left: `${(tip.at[0] / 975) * 100}%`, top: `${(tip.at[1] / 610) * 100}%` }}>
            <strong>{tip.label}</strong>
          </div>
        ) : null}
      </div>
      <span className="cms-map__legend">
        {total === 0
          ? "No live visitors right now. Pins appear here the moment someone opens the site."
          : cityMode
            ? "Showing cities · zoom out for state totals"
            : "One dot per state · zoom in to see cities"}
      </span>
    </div>
  );
}
```

### 7a. The map geometry — `lib/usMapPaths.js` (GENERATED, ~174 KB)

This file is a generated module exporting three constants:

```js
export const US_VIEWBOX = "0 0 975 610";
export const US_NATION_D  = "M647.957,492.431L651.827,…"; // full nation outline path (~one giant string)
export const US_BORDERS_D = "M…";                          // state borders mesh path (~one giant string)
```

It's far too large to paste here. **Generate it** in your project with this script, then run `node scripts/gen-us-map.mjs` (requires `d3-geo`, `topojson-client`, `us-atlas` installed):

```js
// scripts/gen-us-map.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/us-atlas/states-10m.json", "utf8"));
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = geoPath(projection);
const nation = feature(topo, topo.objects.nation);
const borders = mesh(topo, topo.objects.states, (a, b) => a !== b);

const out = `// Generated from us-atlas/states-10m.json, projected to a 975x610 canvas with
// d3 geoAlbersUsa().scale(1300).translate([487.5, 305]). Regenerate: node scripts/gen-us-map.mjs
export const US_VIEWBOX = "0 0 975 610";
export const US_NATION_D = ${JSON.stringify(path(nation))};
export const US_BORDERS_D = ${JSON.stringify(path(borders))};
`;

mkdirSync("lib", { recursive: true });
writeFileSync("lib/usMapPaths.js", out);
console.log("wrote lib/usMapPaths.js");
```

The projection in `Dashboard.jsx` (`geoAlbersUsa().scale(1300).translate([487.5, 305])`) **must stay identical** to the one in this script, otherwise the dots won't line up with the map. After generation you can remove `topojson-client` and `us-atlas` from runtime — they're only needed to build this file.

---

## 8. Search box — `components/cms/SearchExpand.jsx`

```jsx
import { useRef, useState } from "react";

export default function SearchExpand() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <label
      className={"cms__search" + (open ? " is-open" : "")}
      onClick={() => {
        if (!open) {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search content…"
        tabIndex={open ? 0 : -1}
        onBlur={(e) => { if (!e.target.value) setOpen(false); }}
        onKeyDown={(e) => { if (e.key === "Escape") { e.target.value = ""; e.target.blur(); } }}
      />
    </label>
  );
}
```

---

## 9. Account menu — `components/cms/AccountMenu.jsx`

> Depends on an auth context at `@/lib/auth` exposing `useAuth() -> { user, signOut }`. If you don't have auth, replace with a static avatar.

```jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function AccountMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [open]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="cms-acct" ref={ref}>
      <button
        type="button"
        className="cms__avatar cms-acct__btn"
        title="Account"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img src="/assets/img/logo-white.webp" alt="JE" width="22" height="21" />
      </button>
      {open && (
        <div className="cms-acct__menu" role="menu">
          {user?.email && (
            <div className="cms-acct__head">
              <span className="cms-acct__role">Signed in as</span>
              <span className="cms-acct__email" title={user.email}>{user.email}</span>
            </div>
          )}
          <button type="button" className="cms-acct__signout" onClick={handleSignOut} role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Data layer

Both modules import a Supabase client from `@/lib/supabase` (a standard `createClient(url, anonKey)` export named `supabase`).

### `lib/dashboardApi.js`

```js
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
  };
}
```

> The original file also had `buildSeries`/`byStatus`/`byService` helpers and a `useNewInquiryCount()` hook for the sidebar badge — not used by the dashboard view itself, so omitted here. Add them back if you need the sidebar badge.

### `lib/analyticsApi.js`

```js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const REFRESH_MS = 20000;

/* Fetches the analytics summary (live presence, 30-day traffic, geo breakdowns)
   from the `analytics-summary` edge function, refreshing on an interval. */
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
```

---

## 11. Backend prerequisites (Supabase)

- **Tables:** `inquiries` (columns used: `id, name, company, service, budget, status, created_at`), `projects`, `services`, `reviews`. Enable RLS with read policies for your admin role.
- **Edge function `analytics-summary`** must return JSON shaped like this (every field optional — panels show empty states when missing):

```jsonc
{
  "totalViews": 12840,
  "traffic": [{ "date": "Jun 1", "visitors": 120 }],          // 30-day series
  "geo": {
    "Countries": [["United States", 82]],                      // [name, percent]
    "States":    [["Texas", 34]],
    "Cities":    [["Dallas", 12]]
  },
  "live": {
    "count": 23,
    "spark":   [{ "time": "10:01", "active": 5 }],              // past hour
    "pages":   [{ "label": "/work", "count": 6 }],
    "sources": [{ "label": "Google", "count": 9 }],
    "devices": [["Desktop", 61], ["Mobile", 34], ["Tablet", 5]],
    "pins": [
      { "state": "Texas", "at": [-99.3, 31.4], "cities": [["Dallas, TX", -96.8, 32.8, 4]] }
    ]
  }
}
```

The `live.pins` shape (`state`, `at: [lon, lat]`, `cities: [[name, lon, lat, count]]`) is what `Dashboard.jsx` projects onto the US map. As long as you return lon/lat, the map places them correctly.
```
```
