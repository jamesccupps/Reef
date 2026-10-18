// check_stl.mjs — checks the Hot Brook print's STL files and draws a top-down preview of each version from them.
//
//   node tools/print3d/check_stl.mjs [dir=exports/print3d]
//
// Reads dir/hotbrook_print3d.json (written by export_stl.mjs) and, per version (x5, true):
//   each STL: watertight (every edge in exactly two triangles), consistently wound (each edge once each way), no degenerate
//     triangles, every shell's volume positive (normals outward), its bounding box in mm;
//   each water insert against the land: its outline at least the clearance from the basin's walls (the distance between the
//     walls' and the insert's vertical faces, seen from above), every point of its footprint over the basin's floor, its underside
//     above the basin (the vertical gap at its vertices, edge midpoints and centroids), its top flat at the waterline, and the
//     basin's rim against that waterline;
//   writes hotbrook_preview_<v>.png: the land shaded (lit from the image's upper left) and tinted by height, the inserts in blue
//     (darker where thicker: the bed's depth), a north arrow and a 1-km bar. Everything is read back from the STL files.
// Pure Node (node:zlib for the PNG); no dependencies. Exports readSTL, analyse, fitCheck, preview, runChecks.
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// ---------- reading ----------
export function readSTL(file) {
  const b = readFileSync(file);
  if (b.length < 84) throw new Error(`${file}: too short for a binary STL`);
  const n = b.readUInt32LE(80);
  if (b.length !== 84 + 50 * n) throw new Error(`${file}: ${b.length} bytes, expected ${84 + 50 * n} for ${n} triangles (not a binary STL?)`);
  const tri = new Float32Array(n * 9), nrm = new Float32Array(n * 3);
  for (let t = 0, o = 84; t < n; t++, o += 50) {
    for (let k = 0; k < 3; k++) nrm[3 * t + k] = b.readFloatLE(o + 4 * k);
    for (let k = 0; k < 9; k++) tri[9 * t + k] = b.readFloatLE(o + 12 + 4 * k);
  }
  return { file, n, tri, nrm };
}
const cross = (t, T) => {   // the (unnormalised) normal of triangle t
  const o = 9 * t, ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2], vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2];
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
};

// ---------- one mesh: topology, orientation, volume ----------
export function analyse({ n, tri, nrm }) {
  const map = new Map(), id = new Int32Array(n * 3), P = [];
  for (let k = 0; k < n * 3; k++) {
    const key = `${tri[3 * k]},${tri[3 * k + 1]},${tri[3 * k + 2]}`;
    let v = map.get(key); if (v === undefined) { v = P.length / 3; map.set(key, v); P.push(tri[3 * k], tri[3 * k + 1], tri[3 * k + 2]); }
    id[k] = v;
  }
  const nv = P.length / 3;
  const bb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let v = 0; v < nv; v++) for (let k = 0; k < 3; k++) { bb[k] = Math.min(bb[k], P[3 * v + k]); bb[k + 3] = Math.max(bb[k + 3], P[3 * v + k]); }
  let degenerate = 0, normalsDisagree = 0;
  const E = new Map();
  for (let t = 0; t < n; t++) {
    const a = id[3 * t], b = id[3 * t + 1], c = id[3 * t + 2], cr = cross(t, tri), area = Math.hypot(...cr) / 2;
    if (a === b || b === c || a === c || area < 1e-9) degenerate++;
    if (cr[0] * nrm[3 * t] + cr[1] * nrm[3 * t + 1] + cr[2] * nrm[3 * t + 2] < 0) normalsDisagree++;
    for (const [p, q] of [[a, b], [b, c], [c, a]]) { const key = p * nv + q; E.set(key, (E.get(key) || 0) + 1); }
  }
  let edges = 0, paired = 0, boundary = 0, misoriented = 0, nonManifold = 0;
  for (const [key, c] of E) {
    const a = Math.floor(key / nv), b = key - a * nv, r = E.get(b * nv + a) || 0;
    if (r && a > b) continue;   // (each undirected edge once)
    edges++;
    if (c === 1 && r === 1) paired++; else if (c + r === 1) boundary++; else if (c + r === 2) misoriented++; else nonManifold++;
  }
  // shells (union–find over vertices) and their signed volumes about the box's centre
  const par = new Int32Array(nv); for (let v = 0; v < nv; v++) par[v] = v;
  const find = v => { while (par[v] !== v) { par[v] = par[par[v]]; v = par[v]; } return v; };
  for (let t = 0; t < n; t++) { const a = find(id[3 * t]), b = find(id[3 * t + 1]), c = find(id[3 * t + 2]); par[b] = a; par[find(c)] = a; }
  const cx = (bb[0] + bb[3]) / 2, cy = (bb[1] + bb[4]) / 2, cz = (bb[2] + bb[5]) / 2, shells = new Map();
  for (let t = 0; t < n; t++) {
    const o = 9 * t, ax = tri[o] - cx, ay = tri[o + 1] - cy, az = tri[o + 2] - cz, bx = tri[o + 3] - cx, by = tri[o + 4] - cy, bz = tri[o + 5] - cz;
    const qx = tri[o + 6] - cx, qy = tri[o + 7] - cy, qz = tri[o + 8] - cz;
    const vol = (ax * (by * qz - bz * qy) - ay * (bx * qz - bz * qx) + az * (bx * qy - by * qx)) / 6;
    const r = find(id[3 * t]), s = shells.get(r) || { triangles: 0, volume: 0 }; s.triangles++; s.volume += vol; shells.set(r, s);
  }
  const sh = [...shells.values()].sort((p, q) => q.volume - p.volume);
  const watertight = boundary === 0 && nonManifold === 0;
  const res = {
    triangles: n, vertices: nv, edges, euler: nv - edges + n, watertight, consistentWinding: misoriented === 0, boundaryEdges: boundary,
    misorientedEdges: misoriented, nonManifoldEdges: nonManifold, degenerate, normalsDisagree,
    shells: sh.map(s => ({ triangles: s.triangles, volume_mm3: +s.volume.toFixed(2) })),
    volume_mm3: +sh.reduce((t, s) => t + s.volume, 0).toFixed(2), bbox_mm: { min: bb.slice(0, 3).map(v => +v.toFixed(3)), max: bb.slice(3).map(v => +v.toFixed(3)), size: [0, 1, 2].map(k => +(bb[k + 3] - bb[k]).toFixed(3)) },
  };
  res.ok = watertight && res.consistentWinding && degenerate === 0 && sh.every(s => s.volume > 0);
  return res;
}

// ---------- the land's top surface, looked up from above ----------
function topIndex(T, n, B = 0.5) {
  const up = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let t = 0; t < n; t++) {
    const c = cross(t, T); if (c[2] <= 1e-9 * Math.hypot(...c) || c[2] / Math.hypot(...c) < 1e-3) continue;
    up.push(t); for (let k = 0; k < 3; k++) { x0 = Math.min(x0, T[9 * t + 3 * k]); x1 = Math.max(x1, T[9 * t + 3 * k]); y0 = Math.min(y0, T[9 * t + 3 * k + 1]); y1 = Math.max(y1, T[9 * t + 3 * k + 1]); }
  }
  const nbx = Math.ceil((x1 - x0) / B) + 1, nby = Math.ceil((y1 - y0) / B) + 1, cnt = new Int32Array(nbx * nby + 1);
  const span = t => { const o = 9 * t; return [Math.floor((Math.min(T[o], T[o + 3], T[o + 6]) - x0) / B), Math.floor((Math.max(T[o], T[o + 3], T[o + 6]) - x0) / B), Math.floor((Math.min(T[o + 1], T[o + 4], T[o + 7]) - y0) / B), Math.floor((Math.max(T[o + 1], T[o + 4], T[o + 7]) - y0) / B)]; };
  for (const t of up) { const [a, b, c, d] = span(t); for (let j = c; j <= d; j++) for (let i = a; i <= b; i++) cnt[j * nbx + i + 1]++; }
  for (let k = 1; k < cnt.length; k++) cnt[k] += cnt[k - 1];
  const fill = cnt.slice(), list = new Int32Array(cnt[cnt.length - 1]);
  for (const t of up) { const [a, b, c, d] = span(t); for (let j = c; j <= d; j++) for (let i = a; i <= b; i++) list[fill[j * nbx + i]++] = t; }
  // the highest upward face over (x, y), NaN if none
  return (x, y) => {
    const i = Math.floor((x - x0) / B), j = Math.floor((y - y0) / B); if (i < 0 || j < 0 || i >= nbx || j >= nby) return NaN;
    let best = NaN;
    for (let k = cnt[j * nbx + i]; k < cnt[j * nbx + i + 1]; k++) {
      const o = 9 * list[k], ax = T[o], ay = T[o + 1], bx = T[o + 3], by = T[o + 4], qx = T[o + 6], qy = T[o + 7];
      const d = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy); if (Math.abs(d) < 1e-14) continue;
      const l1 = ((by - qy) * (x - qx) + (qx - bx) * (y - qy)) / d, l2 = ((qy - ay) * (x - qx) + (ax - qx) * (y - qy)) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
      const z = l1 * T[o + 2] + l2 * T[o + 5] + l3 * T[o + 8]; if (!(z <= best)) best = z;
    }
    return best;
  };
}
// the vertical faces of a mesh as segments seen from above: [x0, y0, x1, y1, ztop]
function verticalSegments(T, n, keep = () => true) {
  const out = [];
  for (let t = 0; t < n; t++) {
    const c = cross(t, T), l = Math.hypot(...c); if (l === 0 || Math.abs(c[2]) / l > 1e-4) continue;
    const o = 9 * t, pts = [[T[o], T[o + 1]], [T[o + 3], T[o + 4]], [T[o + 6], T[o + 7]]];
    let best = -1, pa = 0, pb = 1;   // the two farthest-apart footprints
    for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) { const d = Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]); if (d > best) { best = d; pa = a; pb = b; } }
    const seg = [pts[pa][0], pts[pa][1], pts[pb][0], pts[pb][1], Math.max(T[o + 2], T[o + 5], T[o + 8])];
    if (best > 1e-6 && keep(seg)) out.push(seg);
  }
  return out;
}
function segDist(a, b) {   // 2-D distance between segments a, b ([x0, y0, x1, y1, …])
  const ptSeg = (px, py, s) => { const dx = s[2] - s[0], dy = s[3] - s[1], L2 = dx * dx + dy * dy; const t = L2 ? Math.max(0, Math.min(1, ((px - s[0]) * dx + (py - s[1]) * dy) / L2)) : 0; return Math.hypot(px - s[0] - t * dx, py - s[1] - t * dy); };
  const orient = (ax, ay, bx, by, cx, cy) => Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  const o1 = orient(a[0], a[1], a[2], a[3], b[0], b[1]), o2 = orient(a[0], a[1], a[2], a[3], b[2], b[3]), o3 = orient(b[0], b[1], b[2], b[3], a[0], a[1]), o4 = orient(b[0], b[1], b[2], b[3], a[2], a[3]);
  if (o1 * o2 < 0 && o3 * o4 < 0) return 0;
  return Math.min(ptSeg(a[0], a[1], b), ptSeg(a[2], a[3], b), ptSeg(b[0], b[1], a), ptSeg(b[2], b[3], a));
}

// ---------- an insert against the land ----------
export function fitCheck(land, water, { waterline, clearance, minDepth, landBox }) {
  const LT = land.tri, WT = water.tri, zTop = topIndex(LT, land.n);
  let wx0 = Infinity, wy0 = Infinity, wx1 = -Infinity, wy1 = -Infinity, topMin = Infinity, topMax = -Infinity;
  for (let k = 0; k < water.n * 3; k++) { wx0 = Math.min(wx0, WT[3 * k]); wx1 = Math.max(wx1, WT[3 * k]); wy0 = Math.min(wy0, WT[3 * k + 1]); wy1 = Math.max(wy1, WT[3 * k + 1]); }
  // the underside's gap and the footprint over the basin: at every vertex, edge midpoint and centroid of the insert's faces
  let gapMin = Infinity, gapSum = 0, gapN = 0, outside = 0, samples = 0, noLand = 0;
  for (let t = 0; t < water.n; t++) {
    const c = cross(t, WT), l = Math.hypot(...c), nz = c[2] / l, o = 9 * t;
    if (nz > 1e-3) { for (let k = 0; k < 3; k++) { topMin = Math.min(topMin, WT[o + 3 * k + 2]); topMax = Math.max(topMax, WT[o + 3 * k + 2]); } }
    const P = [0, 1, 2].map(k => [WT[o + 3 * k], WT[o + 3 * k + 1], WT[o + 3 * k + 2]]);
    const pts = nz < -1e-3 || nz > 1e-3 ? [...P, ...[[0, 1], [1, 2], [2, 0]].map(([a, b]) => P[a].map((v, i) => (v + P[b][i]) / 2)), P[0].map((v, i) => (v + P[1][i] + P[2][i]) / 3)] : [];
    for (const [x, y, z] of pts) {
      const zl = zTop(x, y); samples++;
      if (Number.isNaN(zl)) { noLand++; continue; }
      if (zl > waterline - minDepth + 1e-3) outside++;   // not over the basin's floor (which is at least minDepth below the waterline)
      if (nz < -1e-3) { const g = z - zl; gapMin = Math.min(gapMin, g); gapSum += g; gapN++; }
    }
  }
  // the outline against the walls: the land's interior vertical faces (the basin walls) near the insert, vs the insert's sides
  const R = 0.6, eps = 1e-3;
  const onEdge = s => [s[0], s[2]].every(x => Math.abs(x - landBox.min[0]) < eps) || [s[0], s[2]].every(x => Math.abs(x - landBox.max[0]) < eps) ||
    [s[1], s[3]].every(y => Math.abs(y - landBox.min[1]) < eps) || [s[1], s[3]].every(y => Math.abs(y - landBox.max[1]) < eps);
  const walls = verticalSegments(LT, land.n, s => !onEdge(s) && Math.max(s[0], s[2]) > wx0 - 2 && Math.min(s[0], s[2]) < wx1 + 2 && Math.max(s[1], s[3]) > wy0 - 2 && Math.min(s[1], s[3]) < wy1 + 2);
  const sides = verticalSegments(WT, water.n);
  const B = 0.5, gx0 = wx0 - 3, gy0 = wy0 - 3, nbx = Math.ceil((wx1 - wx0 + 6) / B) + 1, nby = Math.ceil((wy1 - wy0 + 6) / B) + 1, bins = new Map();
  for (const s of walls) {
    const a = Math.floor((Math.min(s[0], s[2]) - gx0) / B), b = Math.floor((Math.max(s[0], s[2]) - gx0) / B), c = Math.floor((Math.min(s[1], s[3]) - gy0) / B), d = Math.floor((Math.max(s[1], s[3]) - gy0) / B);
    for (let j = Math.max(0, c); j <= Math.min(nby - 1, d); j++) for (let i = Math.max(0, a); i <= Math.min(nbx - 1, b); i++) { const k = j * nbx + i; if (!bins.has(k)) bins.set(k, []); bins.get(k).push(s); }
  }
  let hMin = Infinity;
  const facing = new Set();   // the walls within R of the insert's sides: this basin's own (not the other lake's, nor the island's far side)
  for (const s of sides) {
    const a = Math.floor((Math.min(s[0], s[2]) - R - gx0) / B), b = Math.floor((Math.max(s[0], s[2]) + R - gx0) / B), c = Math.floor((Math.min(s[1], s[3]) - R - gy0) / B), d = Math.floor((Math.max(s[1], s[3]) + R - gy0) / B);
    for (let j = Math.max(0, c); j <= Math.min(nby - 1, d); j++) for (let i = Math.max(0, a); i <= Math.min(nbx - 1, b); i++) for (const w of bins.get(j * nbx + i) || []) {
      const dd = segDist(s, w); hMin = Math.min(hMin, dd); if (dd < R) facing.add(w);
    }
  }
  // the basin's rim (the tops of the walls it faces) against the waterline
  const rim = [...facing].map(s => s[4] - waterline).sort((p, q) => p - q);
  const rimAt = f => rim.length ? +rim[Math.min(rim.length - 1, Math.floor(f * rim.length))].toFixed(4) : NaN;
  const res = {
    horizontal_clearance_min_mm: +(hMin === Infinity ? R : hMin).toFixed(4), wall_segments_facing: facing.size, insert_side_segments: sides.length,
    vertical_gap_mm: { min: +gapMin.toFixed(4), mean: +(gapSum / Math.max(1, gapN)).toFixed(4) },
    footprint_samples: samples, footprint_outside_basin: outside, footprint_off_land: noLand,
    top_z_mm: [+topMin.toFixed(4), +topMax.toFixed(4)], waterline_mm: waterline, top_flush: Math.abs(topMin - waterline) < 1e-3 && Math.abs(topMax - waterline) < 1e-3,
    rim_minus_waterline_mm: { min: rimAt(0), p01: rimAt(0.01), median: rimAt(0.5), share_at_or_above: +(rim.filter(r => r >= -1e-3).length / Math.max(1, rim.length)).toFixed(4) },
  };
  res.ok = res.horizontal_clearance_min_mm >= clearance - 1e-3 && outside === 0 && noLand === 0 && gapMin >= clearance - 2e-3 && res.top_flush;
  return res;
}

// ---------- the preview ----------
const FONT = {   // 5 × 7
  N: ['X...X', 'XX..X', 'XX..X', 'X.X.X', 'X..XX', 'X..XX', 'X...X'], k: ['X....', 'X....', 'X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.'],
  m: ['.....', '.....', 'XX.X.', 'X.X.X', 'X.X.X', 'X.X.X', 'X.X.X'], x: ['.....', '.....', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
  1: ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'], 5: ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return (crc ^ 0xffffffff) >>> 0;
}
export function encodePNG(W, H, rgb) {
  const raw = Buffer.alloc((3 * W + 1) * H);
  for (let r = 0; r < H; r++) { raw[r * (3 * W + 1)] = 0; rgb.copy ? rgb.copy(raw, r * (3 * W + 1) + 1, 3 * W * r, 3 * W * (r + 1)) : raw.set(rgb.subarray(3 * W * r, 3 * W * (r + 1)), r * (3 * W + 1) + 1); }
  const chunk = (type, data) => { const len = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type, 'ascii'), data]), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
// rasterise the faces of T that pass `face(nz)` from above into buf (W × H, pix mm a pixel, row 0 at y = y1), keeping the highest z
function raster(T, n, face, buf, W, H, pix, x0, y1) {
  for (let t = 0; t < n; t++) {
    const c = cross(t, T), l = Math.hypot(...c); if (!l || !face(c[2] / l)) continue;
    const o = 9 * t, X = [0, 1, 2].map(k => (T[o + 3 * k] - x0) / pix), Y = [0, 1, 2].map(k => (y1 - T[o + 3 * k + 1]) / pix), Z = [0, 1, 2].map(k => T[o + 3 * k + 2]);
    const d = (Y[1] - Y[2]) * (X[0] - X[2]) + (X[2] - X[1]) * (Y[0] - Y[2]); if (Math.abs(d) < 1e-12) continue;
    const c0 = Math.max(0, Math.floor(Math.min(...X))), c1 = Math.min(W - 1, Math.ceil(Math.max(...X))), r0 = Math.max(0, Math.floor(Math.min(...Y))), r1 = Math.min(H - 1, Math.ceil(Math.max(...Y)));
    for (let r = r0; r <= r1; r++) for (let q = c0; q <= c1; q++) {
      const px = q + 0.5, py = r + 0.5;
      const l1 = ((Y[1] - Y[2]) * (px - X[2]) + (X[2] - X[1]) * (py - Y[2])) / d, l2 = ((Y[2] - Y[0]) * (px - X[2]) + (X[0] - X[2]) * (py - Y[2])) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-7 || l2 < -1e-7 || l3 < -1e-7) continue;
      const z = l1 * Z[0] + l2 * Z[1] + l3 * Z[2], k = r * W + q; if (!(buf[k] >= z)) buf[k] = z;
    }
  }
}
// region: [x0, y0, x1, y1] mm to draw a close-up of (default: the whole land)
export function preview(land, waters, { pix = 0.125, label = '', north = '+X', mPerMm = 27.68, region = null } = {}) {
  const LT = land.tri; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let k = 0; k < land.n * 3; k++) { x0 = Math.min(x0, LT[3 * k]); x1 = Math.max(x1, LT[3 * k]); y0 = Math.min(y0, LT[3 * k + 1]); y1 = Math.max(y1, LT[3 * k + 1]); }
  if (region) [x0, y0, x1, y1] = region;
  const W = Math.ceil((x1 - x0) / pix), H = Math.ceil((y1 - y0) / pix), FOOT = 64, HH = H + FOOT;
  const zl = new Float32Array(W * H).fill(NaN), wt = new Float32Array(W * H).fill(NaN), wb = new Float32Array(W * H).fill(NaN);
  raster(LT, land.n, nz => nz > 1e-3, zl, W, H, pix, x0, y1);
  for (const w of waters) { raster(w.tri, w.n, nz => nz > 1e-3, wt, W, H, pix, x0, y1); raster(w.tri, w.n, nz => nz < -1e-3, wb, W, H, pix, x0, y1); }
  let lo = Infinity, hi = -Infinity, tlo = Infinity, thi = -Infinity;
  for (let k = 0; k < W * H; k++) {
    if (!Number.isNaN(zl[k]) && Number.isNaN(wt[k])) { lo = Math.min(lo, zl[k]); hi = Math.max(hi, zl[k]); }
    if (!Number.isNaN(wt[k]) && !Number.isNaN(wb[k])) { tlo = Math.min(tlo, wt[k] - wb[k]); thi = Math.max(thi, wt[k] - wb[k]); }
  }
  const STOPS = [[0, [86, 118, 66]], [0.25, [118, 142, 82]], [0.55, [164, 146, 104]], [0.8, [190, 176, 150]], [1, [236, 230, 218]]];
  const ramp = t => { t = Math.max(0, Math.min(1, t)); for (let s = 1; s < STOPS.length; s++) if (t <= STOPS[s][0]) { const [ta, ca] = STOPS[s - 1], [tb, cb] = STOPS[s], f = (t - ta) / (tb - ta); return ca.map((v, i) => v + (cb[i] - v) * f); } return STOPS[STOPS.length - 1][1]; };
  const L = [-1, 1, 1.4], Ll = Math.hypot(...L); L[0] /= Ll; L[1] /= Ll; L[2] /= Ll;
  const img = Buffer.alloc(W * HH * 3, 245);
  const zAt = (q, r) => { q = Math.max(0, Math.min(W - 1, q)); r = Math.max(0, Math.min(H - 1, r)); const z = zl[r * W + q]; return Number.isNaN(z) ? lo : z; };
  for (let r = 0; r < H; r++) for (let q = 0; q < W; q++) {
    const k = r * W + q; if (Number.isNaN(zl[k])) { img.fill(255, 3 * k, 3 * k + 3); continue; }
    const gx = (zAt(q + 1, r) - zAt(q - 1, r)) / (2 * pix), gy = (zAt(q, r - 1) - zAt(q, r + 1)) / (2 * pix), nl = Math.hypot(gx, gy, 1);
    const shade = Math.max(0, (-gx * L[0] - gy * L[1] + L[2]) / nl);
    let col = ramp((zl[k] - lo) / Math.max(1e-6, hi - lo)).map(v => v * (0.3 + 0.75 * shade));
    if (!Number.isNaN(wt[k]) && wt[k] >= zl[k] - 1e-6) {
      const f = Number.isNaN(wb[k]) ? 0.5 : (wt[k] - wb[k] - tlo) / Math.max(1e-6, thi - tlo), wc = [150 + (22 - 150) * f, 206 + (74 - 206) * f, 236 + (146 - 236) * f];
      col = wc.map((v, i) => v * 0.85 + col[i] * 0.15);
    }
    img[3 * k] = Math.round(Math.min(255, col[0])); img[3 * k + 1] = Math.round(Math.min(255, col[1])); img[3 * k + 2] = Math.round(Math.min(255, col[2]));
  }
  // the footer: label, north arrow, a 1-km bar
  const put = (q, r, c) => { if (q >= 0 && r >= 0 && q < W && r < HH) { const k = 3 * (r * W + q); img[k] = c[0]; img[k + 1] = c[1]; img[k + 2] = c[2]; } };
  const rect = (qa, ra, qb, rb, c) => { for (let r = ra; r <= rb; r++) for (let q = qa; q <= qb; q++) put(q, r, c); };
  const text = (s, q, r, sc, c) => { for (const ch of s) { const g = FONT[ch] || FONT[' ']; for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) if (g[gy][gx] === 'X') rect(q + gx * sc, r + gy * sc, q + gx * sc + sc - 1, r + gy * sc + sc - 1, c); q += 6 * sc; } };
  const ink = [40, 40, 40], fy = H + 12;
  text(label, 16, fy, 5, ink);
  const ax = 220, ay = H + FOOT / 2;
  if (north === '+X') { rect(ax, ay - 3, ax + 70, ay + 3, ink); for (let d = 0; d < 16; d++) rect(ax + 70 + d, ay - 16 + d, ax + 70 + d, ay + 16 - d, ink); text('N', ax + 96, ay - 14, 4, ink); }
  else { rect(ax - 3, ay - 10, ax + 3, ay + 24, ink); for (let d = 0; d < 14; d++) rect(ax - d, ay - 24 + d, ax + d, ay - 24 + d, ink); text('N', ax + 18, ay - 14, 4, ink); }
  const whole = Math.max(W, H) * pix * mPerMm > 2500, kmPx = Math.round((whole ? 1000 / mPerMm : 1) / pix), bx = 420;   // (a close-up: a bar of 1 mm of print)
  rect(bx, ay - 4, bx + kmPx, ay + 4, ink); rect(bx, ay - 14, bx + 3, ay + 14, ink); rect(bx + kmPx - 3, ay - 14, bx + kmPx, ay + 14, ink);
  text(whole ? '1 km' : '1 mm', bx + kmPx + 20, ay - 14, 4, ink);
  return { png: encodePNG(W, HH, img), W, H: HH, landZ: [lo, hi], insertThickness: [tlo, thi] };
}

// ---------- every file of every version ----------
export function runChecks(dir, manifest) {
  let ok = true;
  const say = (...a) => console.log(...a);
  for (const [tag, V] of Object.entries(manifest.versions)) {
    say(`\n== ${tag} (heights ×${V.k}) ==`);
    const land = readSTL(path.join(dir, V.files.land.file)), A = analyse(land);
    say(`${V.files.land.file}: ${A.ok ? 'OK' : 'FAIL'} · ${JSON.stringify(A)}`); ok = ok && A.ok;
    if (A.shells.length !== 1) { say('   FAIL: the land should be one shell'); ok = false; }
    const waters = [];
    for (const lake of ['upper', 'lower']) {
      const f = V.files[lake]; if (!f) continue;
      const w = readSTL(path.join(dir, f.file)), B = analyse(w); waters.push(w);
      say(`${f.file}: ${B.ok ? 'OK' : 'FAIL'} · ${JSON.stringify(B)}`); ok = ok && B.ok;
      const F = fitCheck(land, w, { waterline: V.waterline_mm[lake], clearance: manifest.clearance_mm, minDepth: manifest.min_depth_mm, landBox: A.bbox_mm });
      say(`   fit in its basin: ${F.ok ? 'OK' : 'FAIL'} · ${JSON.stringify(F)}`); ok = ok && F.ok;
    }
    const P = preview(land, waters, { label: tag === 'true' ? 'x1' : tag, north: manifest.north, mPerMm: manifest.m_per_mm });
    const pf = path.join(dir, `hotbrook_preview_${tag}.png`); writeFileSync(pf, P.png);
    say(`preview: ${pf} (${P.W} × ${P.H} px)`);
    if (manifest.brook_print_mm) {   // a close-up of the brook's groove between the lakes
      const xs = manifest.brook_print_mm.map(p => p[0]), ys = manifest.brook_print_mm.map(p => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const Z = preview(land, waters, { pix: 0.02, label: tag === 'true' ? 'x1' : tag, north: manifest.north, mPerMm: manifest.m_per_mm, region: [cx - 12, cy - 6, cx + 12, cy + 6] });
      const zf = path.join(dir, `hotbrook_preview_${tag}_brook.png`); writeFileSync(zf, Z.png);
      say(`close-up of the brook: ${zf} (${Z.W} × ${Z.H} px, 24 × 12 mm)`);
    }
  }
  say(`\n${ok ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  return ok;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dir = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../exports/print3d'));
  const manifest = JSON.parse(readFileSync(path.join(dir, 'hotbrook_print3d.json'), 'utf8'));
  process.exit(runChecks(dir, manifest) ? 0 : 1);
}
