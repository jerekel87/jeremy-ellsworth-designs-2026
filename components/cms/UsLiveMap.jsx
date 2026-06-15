import { useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import statesTopo from "us-atlas/states-10m.json";

/* us-atlas TopoJSON is pre-projected to a 975x610 canvas using the standard
   d3 geoAlbersUsa fit below. We reuse the exact same projection to place live
   lon/lat pins on top of the baked nation + state borders. */
const WIDTH = 975;
const HEIGHT = 610;
const projection = geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]);
const MAX_ZOOM = 4;

function useMapPaths() {
  return useMemo(() => {
    const path = geoPath();
    const nation = feature(statesTopo, statesTopo.objects.nation);
    const borders = mesh(statesTopo, statesTopo.objects.states, (a, b) => a !== b);
    return { land: path(nation), borders: path(borders) };
  }, []);
}

/* Project each state pin (pin.at = state centroid) into canvas space and total
   the city counts. Drop anything geoAlbersUsa can't place (outside the US). */
function projectStates(pins) {
  const out = [];
  for (const p of pins || []) {
    const xy = projection(p.at);
    if (!xy) continue;
    const cities = [];
    let total = 0;
    for (const [name, lon, lat, n] of p.cities || []) {
      const c = projection([lon, lat]);
      total += n;
      if (c) cities.push({ key: `${name}-${lon}-${lat}`, name, x: c[0], y: c[1], n });
    }
    out.push({ key: p.state, state: p.state, x: xy[0], y: xy[1], total, cities });
  }
  return out.sort((a, b) => b.total - a.total);
}

export default function UsLiveMap({ pins = [] }) {
  const { land, borders } = useMapPaths();
  const states = useMemo(() => projectStates(pins), [pins]);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(null);

  const total = states.reduce((s, d) => s + d.total, 0);
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  function zoomBy(factor) {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, +(z * factor).toFixed(2))));
  }
  function reset() {
    setZoom(1);
    setOpen(null);
  }

  const inv = 1 / zoom;

  return (
    <div className="cms-map">
      <div className="cms-map__controls">
        <button type="button" onClick={() => zoomBy(1.6)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
        <button type="button" onClick={reset} disabled={zoom === 1 && !open} aria-label="Reset view">⊙</button>
      </div>
      <div className="cms-map__frame">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Live visitors across the United States">
          <g
            className="cms-map__world"
            transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}
          >
            <path d={land} className="cms-map__land" />
            <path d={borders} className="cms-map__borders" />
            {states.map((s, i) => {
              const expanded = open === s.state;
              const r = 4.5 + s.total * 0.5;
              const delay = `${(i % 8) * 0.35}s`;
              return (
                <g key={s.key}>
                  <g className="cms-map__pin" transform={`translate(${s.x} ${s.y}) scale(${inv})`}>
                    <circle r={r + 7} className="cms-map__pulse" style={{ animationDelay: delay }} />
                    <circle r={r} className="cms-map__dot" />
                    {s.total > 1 && <text y={0.5} fontSize={r * 1.1} className="cms-map__num">{s.total}</text>}
                    <circle
                      r={r + 8}
                      className="cms-map__hit"
                      onClick={() => setOpen(expanded ? null : s.state)}
                    >
                      <title>{`${s.state} — ${s.total} active · click for cities`}</title>
                    </circle>
                  </g>
                  {expanded && s.cities.map((c) => {
                    const cr = 3 + c.n * 0.4;
                    return (
                      <g key={c.key} className="cms-map__pin" transform={`translate(${c.x} ${c.y}) scale(${inv})`}>
                        <circle r={cr} className="cms-map__dot" />
                        <circle r={cr + 8} className="cms-map__hit">
                          <title>{`${c.name} — ${c.n} active`}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <span className="cms-map__legend">
        {total > 0
          ? `${total} active visitor${total === 1 ? "" : "s"} across ${states.length} state${states.length === 1 ? "" : "s"} · click a dot to see cities`
          : "No live visitors right now. Pins appear here the moment someone opens the site."}
      </span>
    </div>
  );
}
