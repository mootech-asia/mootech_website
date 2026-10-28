// 產生地圖點陣遮罩：npm i world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1 後執行 node tools/map-mask.mjs，把輸出貼到 index.html 的 MASK
import fs from 'fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(topo, topo.objects.land);
const out = {};
for (const [name, step] of [['ab', 1.7], ['c', 1.5]]) {
  const lats = [], lons = [];
  for (let lat = 55; lat > -42; lat -= step) lats.push(lat);
  for (let lon = 61; lon < 160; lon += step) lons.push(lon);
  const bits = [];
  for (const lat of lats) for (const lon of lons) {
    const q = step * 0.3;
    const pts = [[lon, lat], [lon - q, lat - q], [lon + q, lat - q], [lon - q, lat + q], [lon + q, lat + q]];
    bits.push(pts.filter(p => geoContains(land, p)).length >= 2 ? 1 : 0);
  }
  const bytes = Buffer.alloc(Math.ceil(bits.length / 8));
  bits.forEach((b, i) => { if (b) bytes[i >> 3] |= 128 >> (i & 7); });
  out[name] = { s: step, c: lons.length, r: lats.length, b: bytes.toString('base64') };
  console.error(name, lons.length, 'x', lats.length, 'dots', bits.filter(Boolean).length);
}
console.log(JSON.stringify(out));
