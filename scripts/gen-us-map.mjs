import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const topo = JSON.parse(readFileSync("node_modules/us-atlas/states-10m.json", "utf8"));
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = geoPath(projection);
const nation = feature(topo, topo.objects.nation);
const borders = mesh(topo, topo.objects.states, (a, b) => a !== b);

const out = `// Generated from us-atlas/states-10m.json, projected to a 975x610 canvas with
// d3 geoAlbersUsa().scale(1300).translate([487.5, 305]). Static path strings so
// the live map renders without a runtime topojson dependency. Live pins must be
// projected with the same settings to line up. Regenerate: node scripts/gen-us-map.mjs
export const US_VIEWBOX = "0 0 975 610";
export const US_NATION_D = ${JSON.stringify(path(nation))};
export const US_BORDERS_D = ${JSON.stringify(path(borders))};
`;

mkdirSync("lib", { recursive: true });
writeFileSync("lib/usMapPaths.js", out);
console.log("wrote lib/usMapPaths.js", out.length, "bytes");
