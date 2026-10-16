// geometry.js — the 3-D sim's world: both Hot Brook lakes and the brook between them (pure: no DOM; Node and browser).
// The data (hotbrook3d.js) is the real landscape model at 1/10 of its horizontal size with TRUE depths, the brook at 1/2.
// Coordinates: x east, y north (m) from the brook's upper mouth; z = depth below the local water surface (m, down).
// Bodies: 0 land, 1 Upper Hot Brook Lake, 2 Lower Hot Brook Lake, 3 the connecting brook.
import { HB3 } from './hotbrook3d.js';

const decode = (b64, T) => {
  const s = atob(b64), u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return new T(u.buffer);
};
export const LAND = 0, UPPER = 1, LOWER = 2, BROOK = 3;
export const BODY_NAMES = ['land', 'Upper Hot Brook Lake', 'Lower Hot Brook Lake', 'Hot Brook'];

const { NX, NY, CELL, X0, Y0, E0 } = HB3;
const body = decode(HB3.body, Uint8Array);
const depthCm = decode(HB3.depth_cm, Uint16Array);
const elevCm = decode(HB3.elev_cm, Uint16Array);
const cover = decode(HB3.cover, Uint8Array);
const N = NX * NY;

// the local water level each cell belongs to (m above sea level): its own body's surface for water; for land, the nearer
// lake's (the brook's banks: the brook's surface where it passes) — so the bed runs on smoothly through the shoreline
const level = new Float32Array(N), depth = new Float32Array(N), elev = new Float32Array(N);
for (let i = 0; i < N; i++) elev[i] = E0 + elevCm[i] / 100;

// distance (m) from each cell to the nearest cell matching `pred` (two-pass chamfer, 8-neighbour)
function chamfer(pred) {
  const d = new Float32Array(N), D2 = CELL * Math.SQRT2;
  for (let i = 0; i < N; i++) d[i] = pred(i) ? 0 : 1e9;
  for (let r = 0; r < NY; r++) for (let c = 0; c < NX; c++) {
    const i = r * NX + c; let v = d[i]; if (!v) continue;
    if (c) v = Math.min(v, d[i - 1] + CELL);
    if (r) { v = Math.min(v, d[i - NX] + CELL); if (c) v = Math.min(v, d[i - NX - 1] + D2); if (c < NX - 1) v = Math.min(v, d[i - NX + 1] + D2); }
    d[i] = v;
  }
  for (let r = NY - 1; r >= 0; r--) for (let c = NX - 1; c >= 0; c--) {
    const i = r * NX + c; let v = d[i]; if (!v) continue;
    if (c < NX - 1) v = Math.min(v, d[i + 1] + CELL);
    if (r < NY - 1) { v = Math.min(v, d[i + NX] + CELL); if (c < NX - 1) v = Math.min(v, d[i + NX + 1] + D2); if (c) v = Math.min(v, d[i + NX - 1] + D2); }
    d[i] = v;
  }
  return d;
}
const toUpper = chamfer(i => body[i] === UPPER), toLower = chamfer(i => body[i] === LOWER), toBrook = chamfer(i => body[i] === BROOK);
const shore = chamfer(i => body[i] === LAND);            // water cells: metres to the nearest land
const toWater = chamfer(i => body[i] !== LAND);          // land cells: metres to the nearest water
// the brook's water level at a point: its surface falls linearly along its path from Upper's level to Lower's
const BP = HB3.BROOK.path, BCUM = [0]; for (let k = 1; k < BP.length; k++) BCUM.push(BCUM[k - 1] + Math.hypot(BP[k][0] - BP[k - 1][0], BP[k][1] - BP[k - 1][1]));
function brookLevel(x, y) {
  let best = 1e9, u = 0;
  for (let k = 0; k < BP.length - 1; k++) {
    const ax = BP[k][0], ay = BP[k][1], dx = BP[k + 1][0] - ax, dy = BP[k + 1][1] - ay, L2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)), d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d < best) { best = d; u = (BCUM[k] + t * Math.sqrt(L2)) / BCUM[BCUM.length - 1]; }
  }
  return HB3.SURF.upper + (HB3.SURF.lower - HB3.SURF.upper) * u;
}
for (let i = 0; i < N; i++) {
  const b = body[i];
  if (b !== LAND) { level[i] = elev[i]; depth[i] = depthCm[i] / 100; continue; }
  // land: the level of the water around it, blended smoothly between the two lakes and the brook by distance (so the
  // ground's height above the water is continuous — what the renderer scales when it raises or lowers the land)
  const [x, y] = [X0 + ((i % NX) + 0.5) * CELL, Y0 + (Math.floor(i / NX) + 0.5) * CELL];
  const wu = 1 / (toUpper[i] + 4) ** 2, wl = 1 / (toLower[i] + 4) ** 2, wb = 1 / (toBrook[i] + 4) ** 2;
  level[i] = (wu * HB3.SURF.upper + wl * HB3.SURF.lower + wb * brookLevel(x, y)) / (wu + wl + wb);
  depth[i] = -(elev[i] - level[i]);                       // land: negative depth = the ground's height above that water
}

const colOf = x => Math.floor((x - X0) / CELL), rowOf = y => Math.floor((y - Y0) / CELL);
export const cellIndex = (x, y) => { const c = colOf(x), r = rowOf(y); return c < 0 || r < 0 || c >= NX || r >= NY ? -1 : r * NX + c; };

// bilinear sample of a per-cell field at (x, y) — cell values sit at the cell centres; clamped at the grid edge
function bilinear(f, x, y) {
  const fx = Math.min(Math.max((x - X0) / CELL - 0.5, 0), NX - 1.0001), fy = Math.min(Math.max((y - Y0) / CELL - 0.5, 0), NY - 1.0001);
  const c = fx | 0, r = fy | 0, tx = fx - c, ty = fy - r, i = r * NX + c;
  return (f[i] * (1 - tx) + f[i + 1] * tx) * (1 - ty) + (f[i + NX] * (1 - tx) + f[i + NX + 1] * tx) * ty;
}

export const GEO = {
  NX, NY, CELL, X0, Y0, N,
  XMAX: X0 + NX * CELL, YMAX: Y0 + NY * CELL,
  SCALE: HB3.SCALE, BROOK_SCALE: HB3.BROOK_SCALE, SURF: HB3.SURF, CLASSES: HB3.CLASSES,
  BROOK_PATH: HB3.BROOK.path, BROOK_LEN: HB3.BROOK.len, BROOK_W: HB3.BROOK.width,
  INFLOW: HB3.INFLOW, OUTLET: HB3.OUTLET, NOTES: HB3.NOTES, STATS: HB3.STATS,
  body, depth, elev, level, cover, shore, toWater,
  // the body at (x, y): 0 land, 1 Upper, 2 Lower, 3 brook (the cell's own, no interpolation)
  bodyAt(x, y) { const i = cellIndex(x, y); return i < 0 ? LAND : body[i]; },
  // the bed's depth below the local water surface at (x, y), smooth across cells (m; negative on land: the ground's height)
  depthAt(x, y) { return bilinear(depth, x, y); },
  // metres to the nearest shore (water) or the nearest water (land, as a negative number)
  shoreDist(x, y) { const i = cellIndex(x, y); return i < 0 ? -1e3 : body[i] ? bilinear(shore, x, y) : -toWater[i]; },
  // is the point (x, y, z) in water: inside a water body and between its surface and its bed
  inWater(x, y, z) { return z >= 0 && this.bodyAt(x, y) !== LAND && z < this.depthAt(x, y); },
  coverAt(x, y) { const i = cellIndex(x, y); return i < 0 ? 0 : cover[i]; },
  // the absolute water level (m above sea level) at (x, y): a lake's surface, the brook's falling one, or the nearer water's
  levelAt(x, y) { return bilinear(level, x, y); },
  // the ground or water-surface elevation (m above sea level)
  elevAt(x, y) { return bilinear(elev, x, y); },
  // the bed's downhill direction (unit [dx, dy]) at (x, y): toward deeper water
  downhill(x, y) {
    const h = CELL, gx = this.depthAt(x + h, y) - this.depthAt(x - h, y), gy = this.depthAt(x, y + h) - this.depthAt(x, y - h), g = Math.hypot(gx, gy);
    return g > 1e-9 ? [gx / g, gy / g] : [0, 0];
  },
  cellCentre(i) { return [X0 + ((i % NX) + 0.5) * CELL, Y0 + (Math.floor(i / NX) + 0.5) * CELL]; },
};

// per-body summaries (area m², volume m³, mean/max depth, the deepest point) — what the gate checks against the real lakes
export const BODIES = [UPPER, LOWER, BROOK].map(b => {
  let n = 0, sum = 0, max = 0, deep = -1;
  for (let i = 0; i < N; i++) if (body[i] === b) { n++; sum += depth[i]; if (depth[i] > max) { max = depth[i]; deep = i; } }
  return { id: b, name: BODY_NAMES[b], cells: n, area: n * CELL * CELL, volume: sum * CELL * CELL, mean: sum / Math.max(1, n), max, deepest: GEO.cellCentre(deep) };
});
