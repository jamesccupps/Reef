// export_stl.mjs — a 3-D printable model of the TRUE-SCALE Hot Brook lakes: Upper Hot Brook Lake, the connecting brook, Lower Hot
// Brook Lake and the land around them (the true world's 5-m band, src/w3/true/hotbrook3d.js read through src/w3/geometry.js).
//
//   node tools/print3d/export_stl.mjs [--long=250] [--pitch=0.27] [--min-depth=1.0] [--basin=offset|max] [--north-up]
//                                     [--only=x5|true] [--no-check]
//
// Writes BINARY STL files (millimetres, base on z = 0, longest side along X) to exports/print3d/ (git-ignored):
//   hotbrook_land_<v>.stl          the land: a solid with a flat bottom, vertical sides and a 3-mm base under its lowest point;
//                                  each lake an open basin with vertical walls at the shoreline; the brook a carved groove
//   hotbrook_water_upper_<v>.stl   Upper's drop-in water (print in clear PETG): flat top at the waterline, underside the basin
//   hotbrook_water_lower_<v>.stl   + 0.15 mm, outline inset 0.15 mm from the basin's wall
// for <v> = x5 (heights ×5: land and lake beds) and true (×1); plus hotbrook_print3d.json (the scales and levels) — then checks
// every file and draws a top-down preview of each version from the STLs (tools/print3d/check_stl.mjs).
//
// HEIGHTS match the 3-D view at land ×1 (render3/main3.js): land at its lidar elevation (GEO.elev), the bed at the water level less
// the depth (GEO.level − GEO.depth); in print every height is (metres) × k / (metres per mm), k = 5 or 1.
// THE BASIN below a lake's waterline: MIN_DEPTH + depth × k (--basin=offset, the default) or max(depth × k, MIN_DEPTH)
// (--basin=max). At this horizontal scale (~27.7 m per mm) Upper's deepest 5.5 m is 0.99 mm even at ×5, so the max rule leaves
// both versions' basins flat 1-mm pockets; the offset rule keeps the beds' relief (0–1 mm at ×5) under a 1-mm floor, so the
// inserts are never thinner than MIN_DEPTH − clearance.
// THE PLAN is the same for both versions: the lakes' outlines are resampled onto a ~PITCH-mm grid of squares (each square is
// lake where the cells' lake fraction at its centre is ≥ ½), so the basin walls follow the shoreline as a staircase of
// ~0.27-mm steps (finer than a 0.4-mm nozzle). Ponds under POND_MIN mm² are dropped; islands under ISLAND_MIN mm² are flooded.
// THE INSERT's outline: the basin's squares eroded by one square (8-neighbour), then pushed back out by (pitch − clearance) with
// mitred corners — exactly the basin inset by the clearance wherever the basin is wider than ~2 squares (narrower necks drop out).
// THE BROOK (154 m long, ~8 m wide: ~0.3 mm at this scale) is WIDENED: a groove GROOVE_W wide and GROOVE_D below the brook's
// water level, along its course from Upper's shore to Lower's, with no insert.
// Pure Node (no dependencies); the world's data via the sim's pure modules.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARGS = Object.fromEntries(process.argv.slice(2).map(a => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const LONG_MM = +(ARGS.long ?? 250);              // the longest side (mm)
const PITCH = +(ARGS.pitch ?? 0.27);              // the resampling grid (mm)
const MIN_DEPTH = +(ARGS['min-depth'] ?? 1.0);    // the shallowest basin below a waterline (mm)
const BASIN_RULE = ARGS.basin === 'max' ? 'max' : 'offset';
const BASE_MM = 3.0;                              // solid base under the lowest point of the top surface (mm)
const CLEAR = 0.15;                               // the inserts' clearance, horizontal and vertical (mm)
const GROOVE_W = 1.2, GROOVE_D = 0.6;             // the brook's groove: width, depth below its water level (mm)
const GROOVE_SLOPE = 3;                           // its sides (mm of rise per mm out from the flat floor: ~72°)
const SHORE_EPS = 0.05;                           // a basin wall is at least this tall (mm)
const POND_MIN = 3, ISLAND_MIN = 0.3, INSERT_MIN = 0.5;   // mm²
const VERSIONS = [{ tag: 'x5', k: 5 }, { tag: 'true', k: 1 }].filter(v => !ARGS.only || ARGS.only === v.tag);
const OUT = path.join(ROOT, 'exports', 'print3d');

process.env.HB_WORLD = 'true';   // the true-scale world (geometry.js reads it as it loads)
const { GEO, LAND, UPPER, LOWER, BROOK } = await import('../../src/w3/geometry.js');
if (GEO.SCALE !== 1 || GEO.CELL !== 5) throw new Error(`expected the true-scale world (SCALE 1, 5-m cells), got SCALE ${GEO.SCALE}, CELL ${GEO.CELL}`);
const { NX, NY, N, CELL, X0, Y0 } = GEO;
const SURF = { [UPPER]: GEO.SURF.upper, [LOWER]: GEO.SURF.lower };
const LAKE_NAME = { [UPPER]: 'upper', [LOWER]: 'lower' };
const log = (...a) => console.log(...a);

// ---------- the fields, per 5-m cell ----------
const indU = new Float32Array(N), indL = new Float32Array(N), dep = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const b = GEO.body[i];
  if (b === UPPER) indU[i] = 1; else if (b === LOWER) indL[i] = 1;
  if (b === UPPER || b === LOWER) dep[i] = Math.max(0, GEO.depth[i]);
}
// bilinear over cell centres, clamped at the grid's edge (as geometry.js samples its fields)
function bil(f, x, y) {
  const fx = Math.min(Math.max((x - X0) / CELL - 0.5, 0), NX - 1.0001), fy = Math.min(Math.max((y - Y0) / CELL - 0.5, 0), NY - 1.0001);
  const c = fx | 0, r = fy | 0, tx = fx - c, ty = fy - r, i = r * NX + c;
  return (f[i] * (1 - tx) + f[i + 1] * tx) * (1 - ty) + (f[i + NX] * (1 - tx) + f[i + NX + 1] * tx) * ty;
}

// ---------- the print's plan: the band's cell centres, longest side along X ----------
const xW = X0 + CELL / 2, xE = X0 + NX * CELL - CELL / 2, yS = Y0 + CELL / 2, yN = Y0 + NY * CELL - CELL / 2;
const spanEW = xE - xW, spanNS = yN - yS;
const S = Math.max(spanEW, spanNS) / LONG_MM;                  // metres per mm
const NORTH_UP = !!ARGS['north-up'] || spanEW >= spanNS;       // otherwise north lies along +X (the lakes run north–south)
let Lx, Ly, toWorld, toPrint;
if (NORTH_UP) {   // X east, Y north
  Lx = spanEW / S; Ly = spanNS / S;
  toWorld = (X, Y) => [xW + X * S, yS + Y * S]; toPrint = (x, y) => [(x - xW) / S, (y - yS) / S];
} else {          // X north, Y west (a rotation of the map by 90° clockwise: north to the right, not a mirror)
  Lx = spanNS / S; Ly = spanEW / S;
  toWorld = (X, Y) => [xE - Y * S, yS + X * S]; toPrint = (x, y) => [(y - yS) / S, (xE - x) / S];
}
const nx = Math.round(Lx / PITCH), ny = Math.round(Ly / PITCH), px = Lx / nx, py = Ly / ny;
const NQ = nx * ny, NVX = nx + 1, NVY = ny + 1, NV = NVX * NVY;
const qid = (i, j) => j * nx + i, vid = (i, j) => j * NVX + i;
log(`plan: ${spanNS.toFixed(0)} m N–S × ${spanEW.toFixed(0)} m E–W → ${Lx.toFixed(2)} × ${Ly.toFixed(2)} mm, ${S.toFixed(3)} m per mm; north → ${NORTH_UP ? '+Y' : '+X'}; grid ${nx} × ${ny} squares of ${px.toFixed(4)} × ${py.toFixed(4)} mm`);

// ---------- which squares are lake ----------
const lake = new Uint8Array(NQ);
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
  const [x, y] = toWorld((i + 0.5) * px, (j + 0.5) * py);
  const u = bil(indU, x, y), l = bil(indL, x, y);
  lake[qid(i, j)] = u >= 0.5 ? UPPER : l >= 0.5 ? LOWER : 0;
}
// connected components of the squares where pred(q); conn 4 or 8 → { label (Int32Array, -1 off), sizes, touchesBorder }
function components(pred, conn) {
  const label = new Int32Array(NQ).fill(-1), sizes = [], border = [], queue = new Int32Array(NQ);
  const nb = conn === 8 ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let q0 = 0; q0 < NQ; q0++) {
    if (label[q0] >= 0 || !pred(q0)) continue;
    const L = sizes.length; let h = 0, t = 0, n = 0, bd = false; queue[t++] = q0; label[q0] = L;
    while (h < t) {
      const q = queue[h++], i = q % nx, j = (q / nx) | 0; n++;
      if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) bd = true;
      for (const [di, dj] of nb) {
        const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
        const r = qid(a, b); if (label[r] < 0 && pred(r)) { label[r] = L; queue[t++] = r; }
      }
    }
    sizes.push(n); border.push(bd);
  }
  return { label, sizes, border };
}
// diagonal-only contacts (two set squares touching at a corner, the other two unset) make a non-manifold vertex: `fill` sets one of
// the unset pair (the land's basins grow), otherwise one of the set pair is cleared (an insert shrinks); until none is left
function fixPinches(m, fill) {
  let n = 0, changed = true;
  while (changed) {
    changed = false;
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const qa = qid(i, j), qb = qa + 1, qc = qa + nx, qd = qc + 1, a = m[qa], b = m[qb], c = m[qc], d = m[qd];
      if (a && d && !b && !c) {
        if (a !== d) throw new Error(`Upper and Lower touch at a corner (square ${i},${j})`);
        if (fill) m[qb] = a; else m[qd] = 0; n++; changed = true;
      } else if (b && c && !a && !d) {
        if (b !== c) throw new Error(`Upper and Lower touch at a corner (square ${i},${j})`);
        if (fill) m[qa] = b; else m[qc] = 0; n++; changed = true;
      }
    }
  }
  return n;
}
const sqmm = px * py;
const plan = { pinchesFilled: fixPinches(lake, true), pondsDropped: [], islandsFlooded: [], islandsKept: [] };
{ // ponds: 4-connected lake pieces under POND_MIN mm²
  for (const id of [UPPER, LOWER]) {
    const C = components(q => lake[q] === id, 4);
    C.sizes.forEach((n, L) => { if (n * sqmm < POND_MIN) { plan.pondsDropped.push(+(n * sqmm).toFixed(3)); for (let q = 0; q < NQ; q++) if (C.label[q] === L) lake[q] = 0; } });
    plan[`${LAKE_NAME[id]}Pieces`] = C.sizes.filter(n => n * sqmm >= POND_MIN).map(n => +(n * sqmm).toFixed(1));
  }
  // islands: 8-connected land inside a lake (not touching the border)
  const C = components(q => lake[q] === 0, 8);
  C.sizes.forEach((n, L) => {
    if (C.border[L]) return;
    const a = +(n * sqmm).toFixed(3);
    if (n * sqmm >= ISLAND_MIN) { plan.islandsKept.push(a); return; }
    plan.islandsFlooded.push(a);
    let id = 0;   // flood it with the lake around it
    for (let q = 0; q < NQ && !id; q++) if (C.label[q] === L) {
      const i = q % nx, j = (q / nx) | 0;
      for (const [a2, b2] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (a2 >= 0 && b2 >= 0 && a2 < nx && b2 < ny && lake[qid(a2, b2)]) id = lake[qid(a2, b2)];
    }
    for (let q = 0; q < NQ; q++) if (C.label[q] === L) lake[q] = id;
  });
  plan.pinchesFilled += fixPinches(lake, true);
}
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if ((i === 0 || j === 0 || i === nx - 1 || j === ny - 1) && lake[qid(i, j)]) throw new Error('a lake reaches the edge of the plan');
log(`lakes: Upper ${plan.upperPieces.join(' + ')} mm², Lower ${plan.lowerPieces.join(' + ')} mm²; ${plan.pondsDropped.length} ponds dropped, ${plan.islandsFlooded.length} islands flooded (< ${ISLAND_MIN} mm²), ${plan.islandsKept.length} kept ${JSON.stringify(plan.islandsKept)}; ${plan.pinchesFilled} corner contacts filled`);

// ---------- per vertex: what it touches, and the world beneath it ----------
const vLand = new Uint8Array(NV), vLake = new Uint8Array(NV), vElev = new Float32Array(NV), vDep = new Float32Array(NV);
for (let j = 0; j < NVY; j++) for (let i = 0; i < NVX; i++) {
  const v = vid(i, j);
  for (let b = j - 1; b <= j; b++) for (let a = i - 1; a <= i; a++) {
    if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
    const id = lake[qid(a, b)];
    if (!id) vLand[v] = 1; else { if (vLake[v] && vLake[v] !== id) throw new Error(`Upper and Lower share a vertex (${i},${j})`); vLake[v] = id; }
  }
  const [x, y] = toWorld(i * px, j * py);
  vElev[v] = bil(GEO.elev, x, y); vDep[v] = Math.max(0, bil(dep, x, y));
}

// ---------- the brook's course in print: from Upper's nearest shore cell, along its path, to Lower's ----------
function nearestCell(id, x0, y0) {
  let best = 1e18, bi = -1;
  for (let i = 0; i < N; i++) if (GEO.body[i] === id) { const [x, y] = GEO.cellCentre(i), d = (x - x0) ** 2 + (y - y0) ** 2; if (d < best) { best = d; bi = i; } }
  return GEO.cellCentre(bi);
}
const BP = GEO.BROOK_PATH, BC = [0];
for (let k = 1; k < BP.length; k++) BC.push(BC[k - 1] + Math.hypot(BP[k][0] - BP[k - 1][0], BP[k][1] - BP[k - 1][1]));
const brookW = [nearestCell(UPPER, ...BP[0]), ...BP, nearestCell(LOWER, ...BP[BP.length - 1])];
const brookLv = [SURF[UPPER], ...BC.map(c => SURF[UPPER] + (SURF[LOWER] - SURF[UPPER]) * c / BC[BC.length - 1]), SURF[LOWER]];
const brookP = brookW.map(([x, y]) => toPrint(x, y));
// distance (mm) from a print point to the course, and the water level (m) at its nearest point
function brookNear(X, Y) {
  let best = 1e9, lv = 0;
  for (let k = 0; k < brookP.length - 1; k++) {
    const [ax, ay] = brookP[k], dx = brookP[k + 1][0] - ax, dy = brookP[k + 1][1] - ay, L2 = dx * dx + dy * dy;
    const t = L2 > 0 ? Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / L2)) : 0, d = Math.hypot(X - ax - t * dx, Y - ay - t * dy);
    if (d < best) { best = d; lv = brookLv[k] + (brookLv[k + 1] - brookLv[k]) * t; }
  }
  return [best, lv];
}

// ---------- a triangle mesh ----------
class Mesh {
  constructor() { this.P = []; this.T = []; }
  v(x, y, z) { this.P.push(x, y, z); return this.P.length / 3 - 1; }
  t(a, b, c) { this.T.push(a, b, c); }
  nrm(a, b, c) {
    const P = this.P, ux = P[3 * b] - P[3 * a], uy = P[3 * b + 1] - P[3 * a + 1], uz = P[3 * b + 2] - P[3 * a + 2];
    const vx = P[3 * c] - P[3 * a], vy = P[3 * c + 1] - P[3 * a + 1], vz = P[3 * c + 2] - P[3 * a + 2];
    return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  }
  // a vertical quad: top edge t0–t1 over bottom edge b0–b1, its face toward (ox, oy)
  wall(t0, t1, b0, b1, ox, oy) {
    const n = this.nrm(b0, b1, t1);
    if (n[0] * ox + n[1] * oy >= 0) { this.t(b0, b1, t1); this.t(b0, t1, t0); } else { this.t(b0, t1, b1); this.t(b0, t0, t1); }
  }
  get triangles() { return this.T.length / 3; }
}
// binary STL: 80-byte header, count, then per triangle its unit normal, three vertices (float32) and a zero attribute
function writeSTL(file, mesh, header) {
  const nT = mesh.triangles, buf = Buffer.alloc(84 + 50 * nT), P = mesh.P, T = mesh.T;
  buf.write(header.slice(0, 80).padEnd(80, ' '), 0, 'ascii'); buf.writeUInt32LE(nT, 80);
  let o = 84;
  for (let t = 0; t < nT; t++) {
    const a = T[3 * t], b = T[3 * t + 1], c = T[3 * t + 2], n = mesh.nrm(a, b, c), l = Math.hypot(n[0], n[1], n[2]) || 1;
    buf.writeFloatLE(n[0] / l, o); buf.writeFloatLE(n[1] / l, o + 4); buf.writeFloatLE(n[2] / l, o + 8); o += 12;
    for (const v of [a, b, c]) { buf.writeFloatLE(P[3 * v], o); buf.writeFloatLE(P[3 * v + 1], o + 4); buf.writeFloatLE(P[3 * v + 2], o + 8); o += 12; }
    buf.writeUInt16LE(0, o); o += 2;
  }
  writeFileSync(file, buf);
  return buf.length;
}

// ---------- the inserts' plans (the same for both versions) ----------
function insertPlan(id) {
  const m = new Uint8Array(NQ);
  for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    let all = true;
    for (let b = j - 1; b <= j + 1 && all; b++) for (let a = i - 1; a <= i + 1; a++) if (lake[qid(a, b)] !== id) { all = false; break; }
    if (all) m[qid(i, j)] = 1;
  }
  const pinches = fixPinches(m, false);
  const C = components(q => m[q] === 1, 4), pieces = [], dropped = [];
  C.sizes.forEach((n, L) => { if (n * sqmm < INSERT_MIN) { dropped.push(+(n * sqmm).toFixed(3)); for (let q = 0; q < NQ; q++) if (C.label[q] === L) m[q] = 0; } else pieces.push(+(n * sqmm).toFixed(1)); });
  fixPinches(m, false);
  return { m, pinches, pieces, dropped };
}
const INSERTS = [UPPER, LOWER].map(id => ({ id, ...insertPlan(id) }));
for (const I of INSERTS) log(`insert ${LAKE_NAME[I.id]}: ${I.pieces.length} piece(s) ${JSON.stringify(I.pieces)} mm²${I.dropped.length ? `, ${I.dropped.length} slivers dropped` : ''}`);

// ---------- one version ----------
function buildVersion({ tag, k }) {
  const kz = k / S;                                   // print mm per metre of height
  const Eref = SURF[LOWER];
  const Wz = { [UPPER]: (SURF[UPPER] - Eref) * kz, [LOWER]: 0 };
  const zl = new Float64Array(NV), zb = new Float64Array(NV);
  let raised = 0, raisedN = 0, grooved = 0, wallFix = 0;
  for (let v = 0; v < NV; v++) {
    if (vLand[v]) zl[v] = (vElev[v] - Eref) * kz;
    if (vLake[v]) { const d = vDep[v] * kz; zb[v] = Wz[vLake[v]] - (BASIN_RULE === 'max' ? Math.max(d, MIN_DEPTH) : MIN_DEPTH + d); }
    if (vLand[v] && vLake[v] && zl[v] < Wz[vLake[v]]) { raised = Math.max(raised, Wz[vLake[v]] - zl[v]); raisedN++; zl[v] = Wz[vLake[v]]; }   // the shore at least at the waterline
  }
  // the brook's groove
  let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
  for (const [X, Y] of brookP) { bx0 = Math.min(bx0, X); by0 = Math.min(by0, Y); bx1 = Math.max(bx1, X); by1 = Math.max(by1, Y); }
  const reach = GROOVE_W / 2 + 3;
  const a = GROOVE_W / 2;
  let grooveTouches = { [UPPER]: false, [LOWER]: false };
  for (let j = Math.max(0, Math.floor((by0 - reach) / py)); j <= Math.min(ny, Math.ceil((by1 + reach) / py)); j++)
    for (let i = Math.max(0, Math.floor((bx0 - reach) / px)); i <= Math.min(nx, Math.ceil((bx1 + reach) / px)); i++) {
      const v = vid(i, j); if (!vLand[v]) continue;
      const [d, lv] = brookNear(i * px, j * py); if (d > reach) continue;
      const floor = (lv - Eref) * kz - GROOVE_D, g = floor + Math.max(0, d - a) * GROOVE_SLOPE;
      if (g < zl[v]) { zl[v] = g; grooved++; if (vLake[v]) grooveTouches[vLake[v]] = true; }
    }
  for (let v = 0; v < NV; v++) if (vLand[v] && vLake[v] && zl[v] < zb[v] + SHORE_EPS) { zl[v] = zb[v] + SHORE_EPS; wallFix++; }
  // lift so that the lowest point of the top surface stands BASE_MM above the bed
  let zmin = 1e9, zmax = -1e9;
  for (let v = 0; v < NV; v++) { if (vLand[v]) { zmin = Math.min(zmin, zl[v]); zmax = Math.max(zmax, zl[v]); } if (vLake[v]) zmin = Math.min(zmin, zb[v]); }
  const off = BASE_MM - zmin;
  for (let v = 0; v < NV; v++) { zl[v] += off; zb[v] += off; }
  Wz[UPPER] += off; Wz[LOWER] += off;

  // ---- the land ----
  const M = new Mesh(), li = new Int32Array(NV).fill(-1), bi = new Int32Array(NV).fill(-1);
  for (let j = 0; j < NVY; j++) for (let i = 0; i < NVX; i++) {
    const v = vid(i, j);
    if (vLand[v]) li[v] = M.v(i * px, j * py, zl[v]);
    if (vLake[v]) bi[v] = M.v(i * px, j * py, zb[v]);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const I = lake[qid(i, j)] ? bi : li, A = I[vid(i, j)], B = I[vid(i + 1, j)], Cc = I[vid(i + 1, j + 1)], D = I[vid(i, j + 1)];
    M.t(A, B, Cc); M.t(A, Cc, D);
  }
  let wallEdges = 0;
  for (let j = 0; j < ny; j++) for (let i = 1; i < nx; i++) {   // the basin walls on the squares' vertical edges
    const L = lake[qid(i - 1, j)] > 0, R = lake[qid(i, j)] > 0; if (L === R) continue;
    const v0 = vid(i, j), v1 = vid(i, j + 1); M.wall(li[v0], li[v1], bi[v0], bi[v1], L ? -1 : 1, 0); wallEdges++;
  }
  for (let j = 1; j < ny; j++) for (let i = 0; i < nx; i++) {   // …and horizontal edges
    const Bq = lake[qid(i, j - 1)] > 0, Aq = lake[qid(i, j)] > 0; if (Bq === Aq) continue;
    const v0 = vid(i, j), v1 = vid(i + 1, j); M.wall(li[v0], li[v1], bi[v0], bi[v1], 0, Bq ? -1 : 1); wallEdges++;
  }
  // the sides and the flat bottom (a fan about the centre)
  const ring = [];
  for (let i = 0; i < nx; i++) ring.push([i, 0]);
  for (let j = 0; j < ny; j++) ring.push([nx, j]);
  for (let i = nx; i > 0; i--) ring.push([i, ny]);
  for (let j = ny; j > 0; j--) ring.push([0, j]);
  const bot = ring.map(([i, j]) => M.v(i * px, j * py, 0)), ctr = M.v(Lx / 2, Ly / 2, 0);
  for (let r = 0; r < ring.length; r++) {
    const s = (r + 1) % ring.length, [i0, j0] = ring[r], [i1, j1] = ring[s];
    M.wall(li[vid(i0, j0)], li[vid(i1, j1)], bot[r], bot[s], j1 - j0, -(i1 - i0));   // (counter-clockwise ring: outward on its right)
    M.t(ctr, bot[s], bot[r]);
  }

  // ---- the inserts ----
  const sx = px - CLEAR, sy = py - CLEAR;
  // the land's basin surface at a print point (the land mesh's own triangles: diagonal from (i, j) to (i+1, j+1))
  function basinAt(X, Y, id) {
    const i = Math.min(nx - 1, Math.max(0, Math.floor(X / px))), j = Math.min(ny - 1, Math.max(0, Math.floor(Y / py)));
    if (lake[qid(i, j)] !== id) throw new Error(`insert vertex (${X.toFixed(3)}, ${Y.toFixed(3)}) is not over its basin`);
    const u = X / px - i, w = Y / py - j, za = zb[vid(i, j)], zB = zb[vid(i + 1, j)], zc = zb[vid(i + 1, j + 1)], zd = zb[vid(i, j + 1)];
    return u >= w ? za + u * (zB - za) + w * (zc - zB) : za + u * (zc - zd) + w * (zd - za);
  }
  const water = INSERTS.map(({ id, m }) => {
    const W = new Mesh(), ti = new Int32Array(NV).fill(-1), ui = new Int32Array(NV).fill(-1), fl = new Uint8Array(NV), has = new Uint8Array(NV);
    const inM = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && m[qid(i, j)] === 1;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (m[qid(i, j)]) { has[vid(i, j)] = has[vid(i + 1, j)] = has[vid(i, j + 1)] = has[vid(i + 1, j + 1)] = 1; }
    for (let j = 0; j < ny; j++) for (let i = 0; i <= nx; i++) {   // boundary edges' outward normals at their ends: 1 +X, 2 −X, 4 +Y, 8 −Y
      const L = inM(i - 1, j), R = inM(i, j);
      if (L && !R) { fl[vid(i, j)] |= 1; fl[vid(i, j + 1)] |= 1; } else if (R && !L) { fl[vid(i, j)] |= 2; fl[vid(i, j + 1)] |= 2; }
    }
    for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) {
      const Bq = inM(i, j - 1), Aq = inM(i, j);
      if (Bq && !Aq) { fl[vid(i, j)] |= 4; fl[vid(i + 1, j)] |= 4; } else if (Aq && !Bq) { fl[vid(i, j)] |= 8; fl[vid(i + 1, j)] |= 8; }
    }
    let gapMin = 1e9, thick = [1e9, -1e9];
    for (let j = 0; j < NVY; j++) for (let i = 0; i < NVX; i++) {
      const v = vid(i, j); if (!has[v]) continue;
      const f = fl[v]; if ((f & 3) === 3 || (f & 12) === 12) throw new Error('insert pinch left');
      const X = i * px + sx * ((f & 1 ? 1 : 0) - (f & 2 ? 1 : 0)), Y = j * py + sy * ((f & 4 ? 1 : 0) - (f & 8 ? 1 : 0));
      const zu = basinAt(X, Y, id) + CLEAR;
      ti[v] = W.v(X, Y, Wz[id]); ui[v] = W.v(X, Y, zu);
      thick[0] = Math.min(thick[0], Wz[id] - zu); thick[1] = Math.max(thick[1], Wz[id] - zu);
    }
    let flipped = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      if (!m[qid(i, j)]) continue;
      const a0 = vid(i, j), b0 = vid(i + 1, j), c0 = vid(i + 1, j + 1), d0 = vid(i, j + 1);
      W.t(ti[a0], ti[b0], ti[c0]); W.t(ti[a0], ti[c0], ti[d0]); W.t(ui[a0], ui[c0], ui[b0]); W.t(ui[a0], ui[d0], ui[c0]);
      if (W.nrm(ti[a0], ti[b0], ti[c0])[2] <= 0 || W.nrm(ti[a0], ti[c0], ti[d0])[2] <= 0) flipped++;
    }
    if (flipped) throw new Error(`insert ${LAKE_NAME[id]}: ${flipped} squares folded by the outline's offset`);
    // where the outline was offset, an underside triangle no longer matches the basin's triangles, and the basin can bend up
    // inside it: raise such a triangle's three corners by the largest shortfall found (its corners, the basin's grid vertices
    // inside it, its edges every 0.01 mm and a barycentric lattice), so the gap is at least CLEAR everywhere (raising only
    // ever widens the gaps of the triangles around it)
    let raisedTris = 0, raisedMax = 0;
    const P = W.P, T = W.T;
    for (let t = 0; t < T.length; t += 3) {
      const a = T[t], b = T[t + 1], c = T[t + 2];
      if (P[3 * a + 2] === Wz[id] || P[3 * b + 2] === Wz[id] || P[3 * c + 2] === Wz[id]) continue;   // (the top, or a side)
      const ax = P[3 * a], ay = P[3 * a + 1], az = P[3 * a + 2], bx = P[3 * b], by = P[3 * b + 1], bz = P[3 * b + 2], cx = P[3 * c], cy = P[3 * c + 1], cz = P[3 * c + 2];
      const onGrid = [[ax, ay], [bx, by], [cx, cy]].every(([x, y]) => Math.abs(x / px - Math.round(x / px)) < 1e-9 && Math.abs(y / py - Math.round(y / py)) < 1e-9);
      if (onGrid) continue;   // (all three corners on the basin's grid: the triangle is one of the basin's own, lifted by CLEAR)
      const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      const plane = (x, y) => { const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / det, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / det; return l1 * az + l2 * bz + (1 - l1 - l2) * cz; };
      const pts = [];
      for (const [x0, y0, x1, y1] of [[ax, ay, bx, by], [bx, by, cx, cy], [cx, cy, ax, ay]]) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.01)); for (let s = 0; s <= n; s++) pts.push([x0 + (x1 - x0) * s / n, y0 + (y1 - y0) * s / n]); }
      for (let u = 0; u <= 10; u++) for (let w = 0; u + w <= 10; w++) pts.push([ax + (bx - ax) * u / 10 + (cx - ax) * w / 10, ay + (by - ay) * u / 10 + (cy - ay) * w / 10]);
      for (let j = Math.floor(Math.min(ay, by, cy) / py); j <= Math.ceil(Math.max(ay, by, cy) / py); j++) for (let i = Math.floor(Math.min(ax, bx, cx) / px); i <= Math.ceil(Math.max(ax, bx, cx) / px); i++) {
        const x = i * px, y = j * py, l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / det, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / det;
        if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) pts.push([x, y]);
      }
      let short = 0;
      for (const [x, y] of pts) short = Math.max(short, basinAt(x, y, id) + CLEAR - plane(x, y));
      if (short > 1e-7) { short += 1e-4; for (const q of [a, b, c]) P[3 * q + 2] += short; raisedTris++; raisedMax = Math.max(raisedMax, short); }
    }
    thick = [1e9, -1e9];
    for (let q = 0; q < P.length / 3; q++) if (P[3 * q + 2] !== Wz[id]) { thick[0] = Math.min(thick[0], Wz[id] - P[3 * q + 2]); thick[1] = Math.max(thick[1], Wz[id] - P[3 * q + 2]); }
    for (let j = 0; j < ny; j++) for (let i = 1; i < nx; i++) {
      const L = inM(i - 1, j), R = inM(i, j); if (L === R) continue;
      const v0 = vid(i, j), v1 = vid(i, j + 1); W.wall(ti[v0], ti[v1], ui[v0], ui[v1], L ? 1 : -1, 0);
    }
    for (let j = 1; j < ny; j++) for (let i = 0; i < nx; i++) {
      const Bq = inM(i, j - 1), Aq = inM(i, j); if (Bq === Aq) continue;
      const v0 = vid(i, j), v1 = vid(i + 1, j); W.wall(ti[v0], ti[v1], ui[v0], ui[v1], 0, Bq ? 1 : -1);
    }
    return { id, mesh: W, thick, raisedTris, raisedMax };
  });

  let rimMin = 1e9;
  for (let v = 0; v < NV; v++) if (vLand[v] && vLake[v]) rimMin = Math.min(rimMin, zl[v] - Wz[vLake[v]]);
  return {
    tag, k, M, water, Wz, off,
    info: {
      k, mm_per_m_vertical: kz, height_mm: zmax + off, base_mm: BASE_MM,
      waterline_mm: { upper: +Wz[UPPER].toFixed(4), lower: +Wz[LOWER].toFixed(4) },
      basin_rule: BASIN_RULE === 'max' ? `max(depth*k, ${MIN_DEPTH})` : `${MIN_DEPTH} + depth*k`,
      basin_depth_mm: Object.fromEntries([['upper', GEO.STATS.upper.max], ['lower', GEO.STATS.lower.max]].map(([n, d]) =>
        [`${n}_shore_to_deepest`, [MIN_DEPTH, +(BASIN_RULE === 'max' ? Math.max(MIN_DEPTH, d * kz) : MIN_DEPTH + d * kz).toFixed(3)]])),
      true_depth_mm_unclamped: { upper_max: +(GEO.STATS.upper.max * kz).toFixed(3), lower_max: +(GEO.STATS.lower.max * kz).toFixed(3) },
      insert_thickness_mm: Object.fromEntries(water.map(w => [LAKE_NAME[w.id], [+w.thick[0].toFixed(3), +w.thick[1].toFixed(3)]])),
      insert_underside_raised: Object.fromEntries(water.map(w => [LAKE_NAME[w.id], { triangles: w.raisedTris, max_mm: +w.raisedMax.toFixed(4) }])),
      shore_raised: { vertices: raisedN, max_mm: +raised.toFixed(4) }, groove_vertices: grooved, groove_reaches: { upper: grooveTouches[UPPER], lower: grooveTouches[LOWER] },
      walls_heightened: wallFix, basin_wall_edges: wallEdges, rim_min_above_waterline_mm: +rimMin.toFixed(4),
    },
  };
}

// ---------- write ----------
mkdirSync(OUT, { recursive: true });
const manifest = {
  generated: new Date().toISOString(), source: 'src/w3/true/hotbrook3d.js (5-m cells) via src/w3/geometry.js',
  m_per_mm: S, size_mm: [Lx, Ly], pitch_mm: [px, py], grid: [nx, ny], north: NORTH_UP ? '+Y' : '+X',
  print_to_world: NORTH_UP ? `x_east = ${xW} + X*${S}, y_north = ${yS} + Y*${S} (m, the world's origin at the brook's upper mouth)` : `x_east = ${xE} - Y*${S}, y_north = ${yS} + X*${S} (m, the world's origin at the brook's upper mouth)`,
  clearance_mm: CLEAR, min_depth_mm: MIN_DEPTH, basin_rule: BASIN_RULE, groove_mm: { width: GROOVE_W, depth: GROOVE_D },
  brook_print_mm: brookP.map(([X, Y]) => [+X.toFixed(3), +Y.toFixed(3)]),
  plan, inserts: Object.fromEntries(INSERTS.map(I => [LAKE_NAME[I.id], { pieces_mm2: I.pieces, slivers_dropped: I.dropped.length }])),
  versions: {},
};
for (const V of VERSIONS) {
  const t0 = Date.now(), R = buildVersion(V), files = {};
  const sz = writeSTL(path.join(OUT, `hotbrook_land_${V.tag}.stl`), R.M, `binary STL Hot Brook lakes land ${V.tag} (mm) synapse-reef tools/print3d`);
  files.land = { file: `hotbrook_land_${V.tag}.stl`, triangles: R.M.triangles, bytes: sz };
  for (const w of R.water) {
    const name = `hotbrook_water_${LAKE_NAME[w.id]}_${V.tag}.stl`;
    const b = writeSTL(path.join(OUT, name), w.mesh, `binary STL Hot Brook ${LAKE_NAME[w.id]} lake water insert ${V.tag} (mm) synapse-reef`);
    files[LAKE_NAME[w.id]] = { file: name, triangles: w.mesh.triangles, bytes: b };
  }
  manifest.versions[V.tag] = { ...R.info, files };
  log(`${V.tag}: ${Object.values(files).map(f => `${f.file} ${(f.bytes / 1e6).toFixed(1)} MB (${f.triangles} tris)`).join(', ')} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  log(`   ${JSON.stringify(R.info)}`);
}
writeFileSync(path.join(OUT, 'hotbrook_print3d.json'), JSON.stringify(manifest, null, 1));

if (!ARGS['no-check']) {
  const { runChecks } = await import('./check_stl.mjs');
  const ok = runChecks(OUT, manifest);
  process.exit(ok ? 0 : 1);
}
