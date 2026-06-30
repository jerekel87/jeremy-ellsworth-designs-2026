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
