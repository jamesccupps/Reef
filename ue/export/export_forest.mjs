// export_forest.mjs — THE FOREST ABOUT THE HOT BROOK LAKES FOR UNREAL (Node): every tree as a record — place, ground, species, height,
// turn — for HotBrookForest (ue/HotBrook/Source/HotBrook) to stand true-size Nanite trees on. Unlike the browser's forest (one
// crown per ~45 m², ~220 trees a hectare — "the tree sizes and density don't seem realistic", the human, with photos of a shore
// that is a wall of spruce, fir, cedar, birch and maple under towering white pines), this one is stocked as Maine's mixed woods:
//   - a CANOPY of ~420 stems a hectare at full stocking (mature northern mixed forest carries ~400–900 stems ≥ 10 cm; the canopy
//     layer ~350–500), spruce 14–22 m, balsam fir 10–18 m, red maple 13–21 m, birch and aspen 14–23 m, beech 14–20 m; white pines
//     EMERGENT above it, 24–33 m — one conifer in twelve inland, one in four along the shores (the photos' skyline);
//   - an UNDERSTORY of ~350 saplings a hectare, 1.5–9 m (balsam fir the commonest, then maple, spruce, beech, aspen), in the
//     lakes' band where the walker goes;
//   - the SHORE: northern white cedar thick within ~15 m of the water; a band of speckled alder and willow in the first 5 m on
//     wooded and wet shores (none at the camps, their paths, the beaches and the launch);
//   - where it grows and what: the aerial photos (src/w3/true/canopy3.jpg, 4-m cells: tree cover, conifer share, bare ground, how
//     far to trust them) where trusted, the land cover (NLCD) elsewhere; nothing on the camps' footprints and yards or the roads.
// Out: Import/trees.bin — "HBT1", uint32 n, then n × 16 bytes: float32 x, y (sim m), z (ground, m above sea level), uint8 species,
// uint8 turn (×2π/256), uint16 height (dm). Species: 0 spruce, 1 fir, 2 white pine, 3 cedar, 4 birch, 5 aspen, 6 maple, 7 beech,
// 8 alder, 9 hazel, 10 willow, 11 dead pine, 12 conifer sapling, 13 hardwood sapling. Seeded: the same forest every run.
//   HB_WORLD=true node ue/export/export_forest.mjs [out dir]   (after canopy_raw.py has written Import/canopy.bin)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
if (process.env.HB_WORLD !== 'true') { console.error('run with HB_WORLD=true'); process.exit(1); }
const { GEO, LAND, cellIndex } = await import('../../src/w3/geometry.js');
const { FAR3 } = await import('../../src/w3/true/far3d.js');
const { CAMPS3D } = await import('../../src/w3/true/camps3d.js');
const OUT = process.argv[2] || 'G:/HotBrookUE/Import';
let seed = 20261023; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pois = m => { let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; };   // (a Poisson count: real stands clump)

// ---------- the ground, the cover classes, the photos ----------
const dec = (b64, T) => { const s = Buffer.from(b64, 'base64'); return new T(s.buffer, s.byteOffset, s.length / T.BYTES_PER_ELEMENT); };
const FE = dec(FAR3.elev_cm, Uint16Array), FC = dec(FAR3.cover, Uint8Array);
const farCell = (x, y) => { const q = Math.floor((x - FAR3.X0) / FAR3.CELL), r = Math.floor((y - FAR3.Y0) / FAR3.CELL); return q >= 0 && r >= 0 && q < FAR3.NX && r < FAR3.NY ? r * FAR3.NX + q : -1; };
const farAt = (x, y) => {
  const u = Math.min(FAR3.NX - 1.001, Math.max(0, (x - FAR3.X0) / FAR3.CELL - 0.5)), v = Math.min(FAR3.NY - 1.001, Math.max(0, (y - FAR3.Y0) / FAR3.CELL - 0.5));
  const i = u | 0, j = v | 0, a = u - i, b = v - j, o = j * FAR3.NX + i, e = k => FAR3.E0 + FE[k] / 100;
  return e(o) * (1 - a) * (1 - b) + e(o + 1) * a * (1 - b) + e(o + FAR3.NX) * (1 - a) * b + e(o + FAR3.NX + 1) * a * b;
};
const inBand = (x, y) => x > GEO.X0 && x < GEO.XMAX && y > GEO.Y0 && y < GEO.YMAX;
const EDGE = 30, groundAt = (x, y) => {   // (export_world.mjs's: the heightmap the landscape is)
  if (!inBand(x, y)) return farAt(x, y);
  const b = GEO.bodyAt(x, y), d = GEO.depthAt(x, y), h = b !== LAND && d > 0 ? GEO.levelAt(x, y) - d : GEO.elevAt(x, y);
  const e = Math.min(x - GEO.X0, GEO.XMAX - x, y - GEO.Y0, GEO.YMAX - y); return e >= EDGE ? h : h * (e / EDGE) + farAt(x, y) * (1 - e / EDGE);
};
const CLS = GEO.CLASSES, ci = n => CLS.indexOf(n);
const coverAt = (x, y) => { if (inBand(x, y)) { const i = cellIndex(x, y); if (i >= 0) return GEO.body[i] !== LAND ? ci('water') : GEO.cover[i]; } const f = farCell(x, y); return f >= 0 ? FC[f] : ci('mixed'); };
const toWaterAt = (x, y) => { if (!inBand(x, y)) return 1e9; const i = cellIndex(x, y); return i >= 0 ? GEO.toWater[i] : 1e9; };
// [stocking at full canopy, conifer share] by land cover (where the photos aren't trusted)
const BASE = { evergreen: [1, 0.85], mixed: [1, 0.5], deciduous: [1, 0.18], woody_wet: [0.75, 0.6], shrub_wet: [0.15, 0.5], emergent_wet: [0, 0], shrub: [0.25, 0.4], grass: [0.05, 0.4],
  pasture: [0.02, 0.3], crops: [0, 0], dev_open: [0.1, 0.4], dev_low: [0.3, 0.4], dev_med: [0.1, 0.4], dev_high: [0, 0], barren: [0, 0], beach: [0, 0], rock_shore: [0.2, 0.6], stream: [0.3, 0.5], water: [0, 0] };
const BASEI = CLS.map(n => BASE[n] || [0.5, 0.5]);
const CAN = (() => { const raw = readFileSync(join(OUT, 'canopy.bin')), W = 1330, H = 2490; return { W, H, P: [0, 1, 2, 3].map(k => raw.subarray(k * W * H, (k + 1) * W * H)) }; })();

// ---------- the clearings: the camps' footprints and yards, the roads, the docks' paths, the beaches, the launch ----------
const CLEAR = []; const segs = [];
for (const c of CAMPS3D.camps) { const a = (c.rot || 0) * Math.PI / 180; CLEAR.push({ x: c.xy[0], y: c.xy[1], hw: (c.w || 10) / 2 + (c.home ? 4 : 2), hl: (c.l || 10) / 2 + (c.home ? 4 : 2), c: Math.cos(a), s: Math.sin(a) }); }
const poly = (P, w) => { for (let k = 0; k + 1 < P.length; k++) segs.push([P[k][0], P[k][1], P[k + 1][0], P[k + 1][1], w]); };
for (const r of CAMPS3D.roads || []) poly(r.pts || [], (r.width || 4.5) / 2 + 1.5);   // (gravel camp roads ~4.5 m, their shoulders)
for (const d of CAMPS3D.docks || []) if (d.base && d.dir) poly([[d.base[0] - d.dir[0] * 25, d.base[1] - d.dir[1] * 25], [d.base[0], d.base[1]]], 1.5);   // (the path down to the dock)
for (const b of CAMPS3D.beaches || []) poly(b.pts || [], 8);
if (CAMPS3D.launch?.shore) { const [sx, sy] = CAMPS3D.launch.shore, [ox, oy] = CAMPS3D.launch.out || [0, 0]; poly([[sx - ox * 40, sy - oy * 40], [sx, sy]], 9); }
const cleared = (x, y) => {
  for (const b of CLEAR) { const dx = x - b.x, dy = y - b.y; if (Math.abs(dx) > 40 || Math.abs(dy) > 40) continue; const u = dx * b.c + dy * b.s, v = -dx * b.s + dy * b.c; if (Math.abs(u) < b.hw && Math.abs(v) < b.hl) return true; }
  for (const [ax, ay, bx, by, w] of segs) { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2)); if (Math.hypot(x - ax - t * vx, y - ay - t * vy) < w) return true; }
  return false;
};
// (the clearings indexed by 50-m tile: the camps sit along the shores, most cells are far from any)
const TILE = 50, tiles = new Map(), tk = (x, y) => Math.floor(x / TILE) * 100003 + Math.floor(y / TILE);
for (let x = FAR3.X0; x < FAR3.X0 + FAR3.NX * FAR3.CELL; x += TILE) for (let y = FAR3.Y0; y < FAR3.Y0 + FAR3.NY * FAR3.CELL; y += TILE) {
  const cx = x + TILE / 2, cy = y + TILE / 2; let near = false;
  for (const b of CLEAR) if (Math.abs(cx - b.x) < 80 && Math.abs(cy - b.y) < 80) { near = true; break; }
  if (!near) for (const [ax, ay, bx, by] of segs) { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((cx - ax) * vx + (cy - ay) * vy) / L2)); if (Math.hypot(cx - ax - t * vx, cy - ay - t * vy) < 60) { near = true; break; } }
  if (near) tiles.set(tk(cx, cy), 1);
}
const clearedFast = (x, y) => tiles.has(tk(x, y)) && cleared(x, y);

// ---------- the trees ----------
const N0 = 3_500_000; let n = 0; const buf = Buffer.alloc(8 + N0 * 16);
const put = (x, y, sp, h) => { if (n >= N0) return; const o = 8 + n * 16; buf.writeFloatLE(x, o); buf.writeFloatLE(y, o + 4); buf.writeFloatLE(groundAt(x, y), o + 8); buf.writeUInt8(sp, o + 12); buf.writeUInt8((rnd() * 256) | 0, o + 13); buf.writeUInt16LE(Math.round(h * 10), o + 14); n++; };
const range = (a, b) => a + (b - a) * rnd(), skew = (a, b) => a + (b - a) * Math.pow(rnd(), 0.8);
const count = new Array(14).fill(0);
const A = 16 / 10000;   // (a 4-m cell's hectares)
const H0 = FAR3.NY * FAR3.CELL;
for (let j = 0; j < CAN.H; j++) for (let i = 0; i < CAN.W; i++) {
  const o = j * CAN.W + i, cx = FAR3.X0 + (i + 0.5) * 4, cy = FAR3.Y0 + H0 - (j + 0.5) * 4;
  const cls = coverAt(cx, cy); if (CLS[cls] === 'water') continue;
  const [b0, s0] = BASEI[cls], t = CAN.P[3][o] / 255, cov = CAN.P[0][o] / 255, con = CAN.P[1][o] / 255, bare = CAN.P[2][o] / 255;
  let stock = t * cov * (1 - bare) * (CLS[cls] === 'shrub_wet' ? 0.3 : CLS[cls] === 'emergent_wet' ? 0.2 : 1) + (1 - t) * b0, share = t * con + (1 - t) * s0;
  const band = inBand(cx, cy), dw = toWaterAt(cx, cy), wet = /wet/.test(CLS[cls]);
  const nCan = pois(420 * A * stock), nUnd = band ? pois(350 * A * stock) : 0;
  const nShore = band && dw < 5 && dw > 0.2 && (b0 > 0.1 || wet) ? pois(0.5 + 0.8 * (wet ? 1 : 0.5)) : 0;
  for (let k = 0; k < nCan + nUnd + nShore; k++) {
    const x = cx + range(-2, 2), y = cy + range(-2, 2); if (clearedFast(x, y)) continue;
    const d = toWaterAt(x, y); if (d < 0.6) continue;   // (the trunks stand back of the waterline)
    let sp, h;
    if (k < nCan) {
      if (rnd() < share) {
        const pine = d < 30 ? 0.25 : 0.08, cedar = d < 15 ? 0.4 : wet ? 0.15 : 0.03, u = rnd();
        if (u < pine) { if (rnd() < 0.04) { sp = 11; h = range(10, 22); } else { sp = 2; h = skew(24, 33); } }
        else if (u < pine + cedar) { sp = 3; h = range(8, 15); }
        else if (rnd() < 0.45) { sp = 1; h = range(10, 18); }
        else { sp = 0; h = range(14, 22); }
      } else {
        const u = rnd();
        if (u < 0.25) { sp = 4; h = range(14, 21); } else if (u < 0.4) { sp = 5; h = range(15, 23); } else if (u < (wet ? 0.95 : 0.85)) { sp = 6; h = range(13, 21); } else { sp = 7; h = range(14, 20); }
      }
    } else if (k < nCan + nUnd) {
      const u = rnd(); sp = u < 0.6 ? 12 : 13; h = range(1.5, 9) * (u < 0.6 ? 1 : 0.9);
    } else { const u = rnd(); sp = u < 0.6 ? 8 : u < 0.85 ? 10 : 9; h = range(2, 5); }
    put(x, y, sp, h); count[sp]++;
  }
}
buf.write('HBT1', 0, 'ascii'); buf.writeUInt32LE(n, 4);
writeFileSync(join(OUT, 'trees.bin'), buf.subarray(0, 8 + n * 16));
const NAMES = ['spruce', 'fir', 'white pine', 'cedar', 'birch', 'aspen', 'maple', 'beech', 'alder', 'hazel', 'willow', 'dead pine', 'conifer sapling', 'hardwood sapling'];
console.log(`${n.toLocaleString()} trees →`, join(OUT, 'trees.bin'));
console.log(NAMES.map((s, k) => `${s} ${count[k].toLocaleString()}`).join(', '));
