// export_world.mjs — THE HOT BROOK LAKES' WORLD FOR UNREAL (Node; the pure modules only): writes into the Unreal project's Import
// folder what HotBrookBuild (ue/HotBrook/Source/HotBrookEditor) makes the level from, all in the sim's coordinates (m: x east, y
// north, the origin at the brook's upper mouth; heights in m above sea level) — HotBrookCoords.h places them in Unreal's cm.
//   - heightmap.r16 + heightmap.json: the ground AND the lake beds (the 2017 lidar about the lakes, the 1949 soundings under them —
//     src/w3/geometry.js at 1.5 m; the far land at 20 m beyond: src/w3/true/far3d.js) at 2 m, sized for a landscape of 127-quad
//     components, row 0 north, uint16 = 32768 + (h − DATUM) × 128 (a landscape's Z scale 100: 1/128 m a step, ±256 m)
//   - water.bin: the water's surface (m) per 1.5-m cell of the lakes' band, −1e9 on land (the walker wades and swims by it)
//   - lakes.json: each lake's shoreline (the 0.25-m waterline the sim ends at), simplified to ~1.5 m, and its level; the brook's
//     course, width and levels
//   - camps.json: the camps, docks, roads, the launch and the beaches (src/w3/true/camps3d.js as published — no addresses)
//   HB_WORLD=true node ue/export/export_world.mjs [out dir, default G:/HotBrookUE/Import]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
if (process.env.HB_WORLD !== 'true') { console.error('run with HB_WORLD=true (the true-size world)'); process.exit(1); }
const { GEO, LAND } = await import('../../src/w3/geometry.js');
const { FAR3 } = await import('../../src/w3/true/far3d.js');
const { CAMPS3D } = await import('../../src/w3/true/camps3d.js');
const OUT = process.argv[2] || 'G:/HotBrookUE/Import'; mkdirSync(OUT, { recursive: true });
const DATUM = 110;   // (HotBrookCoords::Datum)

// ---------- the ground: the band's model inside, the far land's grid beyond, blended over 30 m at the band's edge ----------
const dec = b64 => { const s = Buffer.from(b64, 'base64'); return new Uint16Array(s.buffer, s.byteOffset, s.length / 2); };
const FE = dec(FAR3.elev_cm), farAt = (x, y) => {   // bilinear on the far grid's cell centres
  const u = Math.min(FAR3.NX - 1.001, Math.max(0, (x - FAR3.X0) / FAR3.CELL - 0.5)), v = Math.min(FAR3.NY - 1.001, Math.max(0, (y - FAR3.Y0) / FAR3.CELL - 0.5));
  const i = u | 0, j = v | 0, a = u - i, b = v - j, o = j * FAR3.NX + i, e = k => FAR3.E0 + FE[k] / 100;
  return e(o) * (1 - a) * (1 - b) + e(o + 1) * a * (1 - b) + e(o + FAR3.NX) * (1 - a) * b + e(o + FAR3.NX + 1) * a * b;
};
const inBand = (x, y) => x > GEO.X0 && x < GEO.XMAX && y > GEO.Y0 && y < GEO.YMAX;
const bandAt = (x, y) => { const b = GEO.bodyAt(x, y), d = GEO.depthAt(x, y); return b !== LAND && d > 0 ? GEO.levelAt(x, y) - d : GEO.elevAt(x, y); };
const EDGE = 30, groundAt = (x, y) => {
  if (!inBand(x, y)) return farAt(x, y);
  const e = Math.min(x - GEO.X0, GEO.XMAX - x, y - GEO.Y0, GEO.YMAX - y), h = bandAt(x, y);
  return e >= EDGE ? h : h * (e / EDGE) + farAt(x, y) * (1 - e / EDGE);
};
const Q = 127, CELL = 2;   // (127-quad components, 2 m a quad)
const W0 = FAR3.NX * FAR3.CELL, H0 = FAR3.NY * FAR3.CELL, CX = Math.floor(W0 / CELL / Q), CY = Math.floor(H0 / CELL / Q);
const NXh = CX * Q + 1, NYh = CY * Q + 1, X0 = FAR3.X0 + (W0 - (NXh - 1) * CELL) / 2, YN = FAR3.Y0 + H0 - (H0 - (NYh - 1) * CELL) / 2;   // (centred on the far grid; row 0 at YN, the north)
const hm = new Uint16Array(NXh * NYh); let lo = 1e9, hi = -1e9;
for (let r = 0; r < NYh; r++) for (let q = 0; q < NXh; q++) {
  const h = groundAt(X0 + q * CELL, YN - r * CELL); lo = Math.min(lo, h); hi = Math.max(hi, h);
  hm[r * NXh + q] = Math.max(0, Math.min(65535, Math.round(32768 + (h - DATUM) * 128)));
}
writeFileSync(join(OUT, 'heightmap.r16'), Buffer.from(hm.buffer));
const meta = { nx: NXh, ny: NYh, cell: CELL, quadsPerComponent: Q, componentsX: CX, componentsY: CY, x0: X0, yNorth: YN, datum: DATUM, zScale: 100, hMin: +lo.toFixed(2), hMax: +hi.toFixed(2),
  surf: GEO.SURF, note: 'row 0 north at yNorth, column 0 at x0 (sim m); uint16 = 32768 + (h - datum) * 128' };
writeFileSync(join(OUT, 'heightmap.json'), JSON.stringify(meta, null, 1));
console.log(`heightmap ${NXh}x${NYh} at ${CELL} m (${CX}x${CY} components), ground ${lo.toFixed(1)}–${hi.toFixed(1)} m; surfaces`, GEO.SURF);

// ---------- the water's surface per band cell ----------
{
  const n = GEO.NX * GEO.NY, buf = Buffer.alloc(24 + n * 4);
  buf.write('HBW1', 0, 'ascii'); buf.writeInt32LE(GEO.NX, 4); buf.writeInt32LE(GEO.NY, 8); buf.writeFloatLE(GEO.X0, 12); buf.writeFloatLE(GEO.Y0, 16); buf.writeFloatLE(GEO.CELL, 20);
  let wet = 0; for (let i = 0; i < n; i++) { const w = GEO.body[i] !== LAND && GEO.depth[i] > 0; if (w) wet++; buf.writeFloatLE(w ? GEO.level[i] : -1e9, 24 + i * 4); }
  writeFileSync(join(OUT, 'water.bin'), buf); console.log(`water ${GEO.NX}x${GEO.NY} cells at ${GEO.CELL} m, ${wet} wet`);
}

// ---------- the lakes' shorelines: the boundary of each lake's wet cells, traced and simplified ----------
function outline(body) {
  const { NX, NY } = GEO, wet = (q, r) => q >= 0 && r >= 0 && q < NX && r < NY && GEO.body[r * NX + q] === body && GEO.depth[r * NX + q] > 0;
  // (the cells' edges between wet and dry, chained into loops; the longest loop is the shore — islands are holes the lake keeps)
  const next = new Map(), key = (q, r) => q * 100003 + r;
  const edge = (a, b) => next.set(key(a[0], a[1]), b);
  for (let r = -1; r <= NY; r++) for (let q = -1; q <= NX; q++) {
    if (!wet(q, r)) continue;
    if (!wet(q, r - 1)) edge([q, r], [q + 1, r]); if (!wet(q + 1, r)) edge([q + 1, r], [q + 1, r + 1]);
    if (!wet(q, r + 1)) edge([q + 1, r + 1], [q, r + 1]); if (!wet(q - 1, r)) edge([q, r + 1], [q, r]);
  }
  const seen = new Set(), loops = [];
  for (const [k0, b0] of next) {
    if (seen.has(k0)) continue; const loop = []; let k = k0, p = b0;
    while (!seen.has(k)) { seen.add(k); loop.push(p); k = key(p[0], p[1]); p = next.get(k); if (!p) break; }
    loops.push(loop);
  }
  loops.sort((a, b) => b.length - a.length);
  const pts = loops[0].map(([q, r]) => [GEO.X0 + q * GEO.CELL, GEO.Y0 + r * GEO.CELL]);
  return { pts: simplify(pts, GEO.CELL), islands: loops.slice(1).filter(l => l.length > 40).length };
}
function simplify(P, tol) {   // Douglas–Peucker on a closed loop
  const keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
  const st = [[0, P.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1; const [ax, ay] = P[a], [bx, by] = P[b], L = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - P[i][1]) - (ax - P[i][0]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return P.filter((_, i) => keep[i]).map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
}
const lakes = [1, 2].map(b => { const o = outline(b); return { name: b === 1 ? 'Upper Hot Brook Lake' : 'Lower Hot Brook Lake', body: b, level: b === 1 ? GEO.SURF.upper : GEO.SURF.lower, ...o }; });
const brook = { path: GEO.BROOK_PATH, width: GEO.BROOK_W, scale: GEO.BROOK_SCALE, levels: GEO.BROOK_PATH.map(([x, y]) => +GEO.levelAt(x, y).toFixed(3)) };
writeFileSync(join(OUT, 'lakes.json'), JSON.stringify({ lakes, brook }, null, 1));
console.log('lakes:', lakes.map(l => `${l.name} ${l.pts.length} pts, level ${l.level}`).join('; '), `; brook ${brook.path.length} pts`);
writeFileSync(join(OUT, 'camps.json'), JSON.stringify(CAMPS3D));
console.log(`camps ${CAMPS3D.camps.length}, docks ${(CAMPS3D.docks || []).length}, roads ${(CAMPS3D.roads || []).length} → ${OUT}`);
