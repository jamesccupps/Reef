// export_print.mjs — the Hot Brook lakes and the land around them as 3-D-PRINTABLE models (3MF with named parts, and STL), from the
// true-size world: the 5-m grid of the lake beds (the 1949 soundings) and the shore band (src/w3/geometry.js, HB_WORLD=true), inside the
// real land out to 1.5 km beyond it (src/w3/true/far3d.js, 20-m cells). Made for the human's Bambu Lab A1 (256 mm bed) and A1 mini
// (180 mm), both with an AMS (4 filaments), a 0.4 nozzle by default.
//   node tools/hotbrook/export_print.mjs [--printer a1|a1mini|both] [--vex 4] [--dex 20] [--base 3] [--nozzle 0.4] [--res mm]
//                                        [--layer 0.2] [--clear 0.2] [--out exports/print]
// Into <out>/<printer>/:
//   1. onepiece.3mf + .stl        the terrain with flat lakes, one solid — one colour, to paint
//   2. fourcolor.3mf              the same shape in 4 parts for the AMS: the land in three HEIGHT BANDS (a filament change only where a
//                                 band starts) and the lakes' top skin — assign a filament to each part in Bambu Studio
//   3. terrain_basins.3mf + .stl  the terrain with the lakes' basins open (a step at the shoreline), for the clear water inserts; the
//                                 3MF in 4 height bands (the lake beds, then three of land), the STL one solid
//   4. water_inserts.3mf + .stl   each lake's water as its own piece, for CLEAR PETG: the bed's shape below, the flat water surface on
//                                 top — exported upside down (the flat face on the plate prints smooth and glossy), with a clearance
// Heights are exaggerated: the land by --vex over the lowest ground, the water's depth by --dex below the (exaggerated) water surface —
// at 1:40,000 the 5.5-m-deep basin would be 0.14 mm. The brook (8 m wide) is widened to two nozzle widths so it prints.
// HOW A PART IS BUILT: every part is the solid between two height fields over the print grid, B ≤ z ≤ T, cut to a band za ≤ z ≤ zb —
// its top (min(T, zb)) and bottom (max(B, za)) surfaces meet where the thickness falls to zero, so no inside walls are needed; only the
// model's outer frame has walls. Each grid triangle is clipped exactly (convex polygons, the cut points computed the same way from both
// sides of a shared edge), so every part is closed and manifold (checked below), and the parts tile the model without overlapping.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
process.env.HB_WORLD = 'true';
const { GEO, LAND } = await import('../../src/w3/geometry.js');
const { FAR3 } = await import('../../src/w3/true/far3d.js');

// ---------- options ----------
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PRINTERS = { a1: { bed: 256, name: 'Bambu Lab A1' }, a1mini: { bed: 180, name: 'Bambu Lab A1 mini' } };
const which = arg('printer', 'both'), OUT = arg('out', 'exports/print');
const VEX = +arg('vex', 4), DEX = +arg('dex', 20), BASE = +arg('base', 3), NOZ = +arg('nozzle', 0.4), LAYER = +arg('layer', 0.2), CLEAR = +arg('clear', 0.2);
const RES = +arg('res', Math.max(0.2, 0.75 * NOZ));   // mm: the print grid (finer than the nozzle's line is wasted)
const SKIN = 3 * LAYER;    // mm: the 4-colour model's water — the lakes' top three layers
const STEP = 4 * LAYER;    // mm: the open basins' step at the shoreline — the insert's thinnest edge
const BROOK_MM = 2 * NOZ;  // mm: the brook printed two nozzle lines wide
const FOREST = +arg('forest', 1);   // the forest's canopy raised on the land (0: the bare ground)
const CROWN = +arg('crown', Math.max(1.2 * NOZ / 0.4, 4 * RES));   // mm: the treetops' spacing on the print (three nozzle lines a crown at 0.4)

// ---------- the land and the water ----------
const dec = (b64, T) => { const b = Buffer.from(b64, 'base64'); return new T(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const FE = dec(FAR3.elev_cm, Uint16Array), FC = dec(FAR3.cover, Uint8Array), FW = 0;   // (cover class 0: water)
function farBil(x, y) {
  const fx = Math.min(Math.max((x - FAR3.X0) / FAR3.CELL - 0.5, 0), FAR3.NX - 1.0001), fy = Math.min(Math.max((y - FAR3.Y0) / FAR3.CELL - 0.5, 0), FAR3.NY - 1.0001);
  const c = fx | 0, r = fy | 0, tx = fx - c, ty = fy - r, i = r * FAR3.NX + c, e = k => FAR3.E0 + FE[k] / 100;
  return (e(i) * (1 - tx) + e(i + 1) * tx) * (1 - ty) + (e(i + FAR3.NX) * (1 - tx) + e(i + FAR3.NX + 1) * tx) * ty;
}
const farWater = (x, y) => { const q = Math.floor((x - FAR3.X0) / FAR3.CELL), r = Math.floor((y - FAR3.Y0) / FAR3.CELL); return q >= 0 && r >= 0 && q < FAR3.NX && r < FAR3.NY && FC[r * FAR3.NX + q] === FW; };
const FAR_D = 1.0;   // m: the far ponds' depth (no soundings there) [inf]
const BLEND = 150;   // m: the sim's grid fades into the far land over this inside its edge
// the brook's line (world metres) and the distance to it
const BP = GEO.BROOK_PATH;
function brookDist(x, y) {
  let d = Infinity;
  for (let k = 0; k + 1 < BP.length; k++) { const [ax, ay] = BP[k], [bx, by] = BP[k + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy)); }
  return d;
}
// at (x, y): the ground or lake bed h, the water's level L (m above sea level), and whether it is water
function sample(x, y, brookHalf) {
  const inX = Math.min(x - GEO.X0, GEO.XMAX - x), inY = Math.min(y - GEO.Y0, GEO.YMAX - y), w = Math.max(0, Math.min(1, Math.min(inX, inY) / BLEND));
  const fh = farBil(x, y), fwet = farWater(x, y);
  if (w <= 0) return fwet ? { h: fh - FAR_D, L: fh, wet: true } : { h: fh, L: fh, wet: false };
  const L = GEO.levelAt(x, y), d = GEO.depthAt(x, y), gh = L - d;   // (land: depth < 0 — the ground's height above the water)
  let wet = d > 0, h = w * gh + (1 - w) * (fwet && !wet ? fh - FAR_D : fh);
  if (brookHalf > 0 && brookDist(x, y) <= brookHalf) { wet = true; h = Math.min(h, L - Math.max(0.4, d)); }   // (the widened brook)
  if (w < 0.5 && fwet && !wet) return { h, L: fh, wet: true };
  return { h, L: wet ? L : h, wet };
}

// THE FOREST: the aerial photos' canopy (src/w3/true/canopy3.jpg — tools/hotbrook/build_canopy3.py: USDA NAIP, 4-m cells over the far
// grid's extent, row 0 north; panels tree cover | conifer share | bare ground | trust, 0–255) — the woods stand above the fields,
// clearings, roads, camps, marshes and shore by the canopy's height: spruce and fir 12–20 m, white pine 20–28, red maple, birch and
// aspen 10–20 (the view's trees: render3/main3.js) → ~15 m for hardwood stands, ~18 for conifer [inf: the ranges' middles] × the cover.
// Where the photos aren't trusted (trust 0), NLCD's class says (forest classes 1–3 full, the wooded swamp 0.7). Read once into a cache.
const CAN = (() => {
  const jpg = 'src/w3/true/canopy3.jpg', bin = 'exports/print/cache/canopy3.bin', W = 1330, H = 2490;
  if (!existsSync(bin)) { mkdirSync('exports/print/cache', { recursive: true });
    execFileSync('python', ['-I', '-c', 'import sys; from PIL import Image; import numpy as np; a = np.asarray(Image.open(sys.argv[1]).convert("L")); open(sys.argv[2], "wb").write(a.tobytes())', jpg, bin]); }
  const a = readFileSync(bin), panel = q => (x, y) => { const c = Math.min(W - 1, Math.max(0, Math.floor((x - FAR3.X0) / 4))), r = Math.min(H - 1, Math.max(0, Math.floor((FAR3.Y0 + FAR3.NY * FAR3.CELL - y) / 4))); return a[r * 4 * W + q * W + c] / 255; };
  return { cover: panel(0), conifer: panel(1), bare: panel(2), trust: panel(3) };
})();
const CLASS = (() => { const C = GEO.CLASSES; return n => C.indexOf(n); })(), FOREST_CLS = new Set(['evergreen', 'mixed', 'deciduous'].map(CLASS)), WET_CLS = new Set(['woody_wet', 'shrub_wet', 'emergent_wet'].map(CLASS));
// the land-cover class at (x, y): the sim band's grid inside it (5 m), the far land's (20 m) beyond
function coverAt(x, y) {
  const gx = Math.floor((x - GEO.X0) / GEO.CELL), gy = Math.floor((y - GEO.Y0) / GEO.CELL);
  if (gx >= 0 && gy >= 0 && gx < GEO.NX && gy < GEO.NY) return GEO.cover[gy * GEO.NX + gx];
  const q = Math.floor((x - FAR3.X0) / FAR3.CELL), r = Math.floor((y - FAR3.Y0) / FAR3.CELL); return q >= 0 && r >= 0 && q < FAR3.NX && r < FAR3.NY ? FC[r * FAR3.NX + q] : 0;
}
// the canopy over a print cell (m: averaged over its footprint, d m across) and the tree cover there (0–1)
function canopyAt(x, y, d) {
  let hs = 0, cs = 0, ks = 0; const n = 3;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const px = x + ((a + 0.5) / n - 0.5) * d, py = y + ((b + 0.5) / n - 0.5) * d, t = CAN.trust(px, py), cl = coverAt(px, py);
    const cov = t > 0.05 ? CAN.cover(px, py) : FOREST_CLS.has(cl) ? 1 : cl === CLASS('woody_wet') ? 0.7 : 0, con = t > 0.05 ? CAN.conifer(px, py) : cl === CLASS('evergreen') ? 0.85 : cl === CLASS('mixed') ? 0.5 : 0.2;
    hs += cov * (15 + 3 * con); cs += cov; ks += cov * con; }
  return { h: hs / (n * n), cover: cs / (n * n), conifer: cs > 0 ? ks / cs : 0 };
}

// ---------- a part: the solid B ≤ z ≤ T within za ≤ z ≤ zb over the grid, its triangles deduplicated ----------
class Mesh {
  constructor() { this.v = []; this.t = []; this.map = new Map(); }
  vid(x, y, z) {   // (one vertex per point: exact cut points agree; the quantum is a safety net)
    const q = 1e4, kx = Math.round(x * q), ky = Math.round(y * q), kz = Math.round(z * q), k = kx * 4194304 + ky;
    let m = this.map.get(k); if (!m) { m = new Map(); this.map.set(k, m); }
    let i = m.get(kz); if (i === undefined) { i = this.v.length / 3; this.v.push(x, y, z); m.set(kz, i); } return i;
  }
  tri(a, b, c) { if (a !== b && b !== c && a !== c) this.t.push(a, b, c); }
}
// polygon points: [x, y, T, B]; the cut between two points on a linear function g, canonical (the same from either side of an edge)
function cut(p, q, gp, gq) {
  const swap = p[0] > q[0] || (p[0] === q[0] && p[1] > q[1]); if (swap) { [p, q] = [q, p]; [gp, gq] = [gq, gp]; }
  const t = gp / (gp - gq); return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]), p[2] + t * (q[2] - p[2]), p[3] + t * (q[3] - p[3])];
}
function clip(P, g, keepPos) {   // Sutherland–Hodgman against g ≥ 0 (keepPos) or g ≤ 0
  const out = [], s = keepPos ? 1 : -1;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], ga = s * g(a), gb = s * g(b);
    if (ga >= 0) out.push(a);
    if ((ga > 0 && gb < 0) || (ga < 0 && gb > 0)) out.push(cut(a, b, g(a), g(b)));
  }
  return out;
}
const area2 = P => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s; };
function face(M, P, zf, up) {   // a convex polygon at heights zf(point); up: counter-clockwise seen from above
  if (P.length < 3 || Math.abs(area2(P)) < 1e-10) return;
  const ids = P.map(p => M.vid(p[0], p[1], zf(p)));
  if (P.length === 3) { if (up) M.tri(ids[0], ids[1], ids[2]); else M.tri(ids[0], ids[2], ids[1]); return; }
  let cx = 0, cy = 0, ct = 0, cb = 0; for (const p of P) { cx += p[0]; cy += p[1]; ct += p[2]; cb += p[3]; } const n = P.length, c = [cx / n, cy / n, ct / n, cb / n];
  const ci = M.vid(c[0], c[1], zf(c));   // (a fan from the centre: never degenerate, keeps every edge)
  for (let i = 0; i < n; i++) { const a = ids[i], b = ids[(i + 1) % n]; if (up) M.tri(ci, a, b); else M.tri(ci, b, a); }
}
// a grid triangle (x, y, T, B points, counter-clockwise from above) → its pieces' top and bottom faces
function triPiece(M, P, za, zb, flatBottom) {
  for (const hiT of [false, true]) {
    const P1 = clip(P, p => p[2] - zb, hiT); if (P1.length < 3) continue;   // (hiT: T ≥ zb — the top is the band's cap)
    for (const loB of [false, true]) {
      const P2 = clip(P1, p => p[3] - za, !loB); if (P2.length < 3) continue;   // (loB: B ≤ za — the bottom is the band's floor)
      const top = p => hiT ? zb : p[2], bot = p => loB ? za : p[3];
      const P3 = clip(P2, p => top(p) - bot(p), true); if (P3.length < 3) continue;
      let th = 0; for (const p of P3) th = Math.max(th, top(p) - bot(p)); if (!(th > 1e-7)) continue;   // (no thickness anywhere: nothing here)
      face(M, P3, top, true);
      if (!(flatBottom && loB)) face(M, P3, bot, false);
    }
  }
}
// the outer wall along a frame edge p → q (outside on its right): between max(B, za) and min(T, zb)
function wall(M, p, q, za, zb, bottom) {   // (bottom: an array the wall's bottom-edge vertices are pushed to, in order — the flat bottom's ring)
  // the edge's cut points where T = zb, then where B = za, in order along it (the same points, in the same order, the triangles cut)
  const S = [p, q];
  for (const g of [x => x[2] - zb, x => x[3] - za]) for (let i = 0; i + 1 < S.length; i++) { const a = S[i], b = S[i + 1], ga = g(a), gb = g(b); if ((ga > 0 && gb < 0) || (ga < 0 && gb > 0)) { S.splice(i + 1, 0, cut(a, b, ga, gb)); i++; } }
  for (let i = 0; i + 1 < S.length; i++) {
    const a = S[i], b = S[i + 1], ta = Math.min(a[2], zb), tb = Math.min(b[2], zb), ba = Math.max(a[3], za), bb = Math.max(b[3], za);
    // the polygon in the wall's plane (s along the edge, z), clipped where the thickness top − bottom ≥ 0
    let Q = [[0, ba], [1, bb], [1, tb], [0, ta]].map(([s, z]) => ({ s, z }));
    const ha = ta - ba, hb = tb - bb;
    if (ha <= 0 && hb <= 0) continue;
    if (ha < 0 || hb < 0) { const s0 = ha / (ha - hb), zc = ba + (bb - ba) * s0; Q = ha > 0 ? [{ s: 0, z: ba }, { s: s0, z: zc }, { s: 0, z: ta }] : [{ s: s0, z: zc }, { s: 1, z: bb }, { s: 1, z: tb }]; }
    const ids = Q.map(({ s, z }) => M.vid(a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z));
    if (bottom && Q.length === 4) { if (bottom[bottom.length - 1] !== ids[0]) bottom.push(ids[0]); bottom.push(ids[1]); }
    for (let k = 1; k + 1 < ids.length; k++) M.tri(ids[0], ids[k], ids[k + 1]);   // (counter-clockwise seen from outside: p → q, then up)
  }
}
// the whole part over the grid
function buildPart(G, T, B, za = -Infinity, zb = Infinity, flatBottom = false) {
  // (a height within 2 microns of the band's floor or cap is set 2 microns BELOW it: a cut a hair from a vertex would leave two points a
  // hair apart, and a valley lying exactly on the floor would pinch the band along it — below, the cuts stand clear of the vertex)
  const sn = v => Math.abs(v - zb) < 2e-3 ? zb - 2e-3 : Math.abs(v - za) < 2e-3 ? za - 2e-3 : v;
  const M = new Mesh(), { nx, ny } = G, W = nx + 1, P = (i, j) => [i * RES, j * RES, sn(T[j * W + i]), sn(B[j * W + i])];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    // the diagonal along the smaller height step (a smoother surface)
    if (Math.abs(a[2] - c[2]) <= Math.abs(b[2] - d[2])) { triPiece(M, [a, b, c], za, zb, flatBottom); triPiece(M, [a, c, d], za, zb, flatBottom); }
    else { triPiece(M, [a, b, d], za, zb, flatBottom); triPiece(M, [b, c, d], za, zb, flatBottom); }
  }
  // the frame, counter-clockwise from above (outside on the right of each edge as we walk it)
  const ring = []; for (let i = 0; i < nx; i++) ring.push([i, 0]); for (let j = 0; j < ny; j++) ring.push([nx, j]); for (let i = nx; i > 0; i--) ring.push([i, ny]); for (let j = ny; j > 0; j--) ring.push([0, j]);
  const ids = flatBottom ? [] : null;
  for (let k = 0; k < ring.length; k++) { const [i0, j0] = ring[k], [i1, j1] = ring[(k + 1) % ring.length]; wall(M, P(i0, j0), P(i1, j1), za, zb, ids); }
  if (flatBottom) {   // one flat bottom at za for the whole frame (the lowest band covers the model: a fan from the centre over every wall-bottom vertex)
    if (ids.length > 1 && ids[0] === ids[ids.length - 1]) ids.pop(); const ci = M.vid(nx * RES / 2, ny * RES / 2, za);
    for (let k = 0; k < ids.length; k++) M.tri(ci, ids[(k + 1) % ids.length], ids[k]);
  }
  return M;
}
// A SKIN of constant thickness (surface − core) over the grid triangles of one class — the land-cover colours: each triangle takes its
// vertices' majority class; where a skin's triangle meets another class (or the frame) a vertical wall closes it — the next skin's
// wall is the same face turned round, so the skins tile the top without overlapping (the walls are the skin's thickness, constant)
function buildSkin(G, surf, core, triCls, c) {
  const M = new Mesh(), { nx, ny } = G, W = nx + 1, tris = [], edges = new Map(), ek = (a, b) => a < b ? a * 16777216 + b : b * 16777216 + a;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * W + i, b = a + 1, cc = a + W + 1, d = a + W;
    const ts = Math.abs(surf[a] - surf[cc]) <= Math.abs(surf[b] - surf[d]) ? [[a, b, cc], [a, cc, d]] : [[a, b, d], [b, cc, d]];
    for (const t of ts) { const k = triCls(t, j * nx + i); tris.push([t, k]); for (let e = 0; e < 3; e++) { const key = ek(t[e], t[(e + 1) % 3]); const l = edges.get(key); if (l) l.push(k); else edges.set(key, [k]); } }
  }
  const pt = (v, z) => M.vid((v % W) * RES, Math.floor(v / W) * RES, z);
  for (const [t, k] of tris) { if (k !== c) continue;
    M.tri(pt(t[0], surf[t[0]]), pt(t[1], surf[t[1]]), pt(t[2], surf[t[2]])); M.tri(pt(t[0], core[t[0]]), pt(t[2], core[t[2]]), pt(t[1], core[t[1]]));
    for (let e = 0; e < 3; e++) { const u = t[e], v = t[(e + 1) % 3], l = edges.get(ek(u, v)); if (l.length === 2 && l[0] === c && l[1] === c) continue;   // (inside the skin)
      const ub = pt(u, core[u]), vb = pt(v, core[v]), ut = pt(u, surf[u]), vt = pt(v, surf[v]); M.tri(ub, vb, vt); M.tri(ub, vt, ut); }   // (outward: u → v counter-clockwise, then up)
  }
  return M;
}
// closed and manifold: every directed edge once, its reverse once; the volume
function check(M) {
  const E = new Map(), key = (a, b) => a * 16777216 + b; let bad = 0, vol = 0;
  for (let k = 0; k < M.t.length; k += 3) for (let e = 0; e < 3; e++) { const a = M.t[k + e], b = M.t[k + (e + 1) % 3], kk = key(a, b); E.set(kk, (E.get(kk) || 0) + 1); }
  for (const [kk, n] of E) { const a = Math.floor(kk / 16777216), b = kk % 16777216; if (n !== 1 || E.get(key(b, a)) !== 1) { bad++; if (process.env.DBG && bad <= 6) console.log('   bad edge', n, E.get(key(b, a)), [a, b].map(i => M.v.slice(3 * i, 3 * i + 3).map(x => x.toFixed(4)).join(',')).join(' → ')); } }
  const v = M.v; for (let k = 0; k < M.t.length; k += 3) { const a = 3 * M.t[k], b = 3 * M.t[k + 1], c = 3 * M.t[k + 2];
    vol += (v[a] * (v[b + 1] * v[c + 2] - v[b + 2] * v[c + 1]) - v[a + 1] * (v[b] * v[c + 2] - v[b + 2] * v[c]) + v[a + 2] * (v[b] * v[c + 1] - v[b + 1] * v[c])) / 6; }
  return { tris: M.t.length / 3, verts: M.v.length / 3, badEdges: bad, vol };
}
// rotate a mesh 180° about the x axis (an insert's flat top onto the plate) and set its lowest point at z = 0
function flip(M, zTop) { const v = M.v; for (let k = 0; k < v.length; k += 3) { v[k + 1] = -v[k + 1]; v[k + 2] = zTop - v[k + 2]; } return M; }

// ---------- writers ----------
function stl(path, meshes) {
  let n = 0; for (const M of meshes) n += M.t.length / 3;
  const buf = Buffer.alloc(84 + 50 * n); buf.write('Hot Brook lakes — Synapse Reef', 0); buf.writeUInt32LE(n, 80); let o = 84;
  for (const M of meshes) { const v = M.v, t = M.t; for (let k = 0; k < t.length; k += 3) {
    const a = 3 * t[k], b = 3 * t[k + 1], c = 3 * t[k + 2], ux = v[b] - v[a], uy = v[b + 1] - v[a + 1], uz = v[b + 2] - v[a + 2], wx = v[c] - v[a], wy = v[c + 1] - v[a + 1], wz = v[c + 2] - v[a + 2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (const f of [nx, ny, nz, v[a], v[a + 1], v[a + 2], v[b], v[b + 1], v[b + 2], v[c], v[c + 1], v[c + 2]]) { buf.writeFloatLE(f, o); o += 4; } buf.writeUInt16LE(0, o); o += 2; } }
  writeFileSync(path, buf);
}
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function zip(path, files) {   // (a minimal zip: deflated entries, a central directory)
  const parts = [], cen = []; let off = 0;
  for (const [name, data] of files) {
    const nm = Buffer.from(name), z = deflateRawSync(data, { level: 6 }), crc = crc32(data), h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0, 6); h.writeUInt16LE(8, 8); h.writeUInt32LE(0, 10); h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(z.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nm.length, 26); h.writeUInt16LE(0, 28);
    parts.push(h, nm, z);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0, 8); c.writeUInt16LE(8, 10); c.writeUInt32LE(0, 12);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(z.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nm.length, 28); c.writeUInt32LE(off, 42);
    cen.push(c, nm); off += 30 + nm.length + z.length;
  }
  const cd = Buffer.concat(cen), e = Buffer.alloc(22); e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10);
  e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16); writeFileSync(path, Buffer.concat([...parts, cd, e]));
}
// a 3MF: each part a mesh object; `group` true → one object made of the parts (a multi-part object: a filament per part), else one
// object per part (separate pieces); centred on the printer's bed
function threeMF(path, parts, bed, group, title0) {
  // (plain ASCII names, XML-escaped: any slicer reads them)
  const asc = t => t.replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'), title = asc(title0);
  const ch = [], put = s => ch.push(Buffer.from(s));
  put(`<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n`);
  put(`<metadata name="Title">${title}</metadata><metadata name="Designer">Synapse Reef (tools/hotbrook/export_print.mjs)</metadata>\n<resources>\n`);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const { M } of parts) for (let k = 0; k < M.v.length; k += 3) { x0 = Math.min(x0, M.v[k]); x1 = Math.max(x1, M.v[k]); y0 = Math.min(y0, M.v[k + 1]); y1 = Math.max(y1, M.v[k + 1]); }
  const tx = bed / 2 - (x0 + x1) / 2, ty = bed / 2 - (y0 + y1) / 2;
  parts.forEach(({ M, name }, n) => {
    put(`<object id="${n + 1}" name="${asc(name)}" type="model"><mesh><vertices>\n`);
    const v = M.v; let s = ''; for (let k = 0; k < v.length; k += 3) { s += `<vertex x="${v[k].toFixed(4)}" y="${v[k + 1].toFixed(4)}" z="${v[k + 2].toFixed(4)}"/>`; if (s.length > 1 << 20) { put(s); s = ''; } } put(s + '\n</vertices><triangles>\n');
    const t = M.t; s = ''; for (let k = 0; k < t.length; k += 3) { s += `<triangle v1="${t[k]}" v2="${t[k + 1]}" v3="${t[k + 2]}"/>`; if (s.length > 1 << 20) { put(s); s = ''; } } put(s + '\n</triangles></mesh></object>\n');
  });
  const T = `1 0 0 0 1 0 0 0 1 ${tx.toFixed(3)} ${ty.toFixed(3)} 0`;
  if (group) { put(`<object id="${parts.length + 1}" name="${title}" type="model"><components>`); parts.forEach((_, n) => put(`<component objectid="${n + 1}"/>`)); put(`</components></object>\n</resources>\n<build><item objectid="${parts.length + 1}" transform="${T}"/></build>\n</model>\n`); }
  else { put('</resources>\n<build>'); parts.forEach((_, n) => put(`<item objectid="${n + 1}" transform="${T}"/>`)); put('</build>\n</model>\n'); }
  zip(path, [
    ['[Content_Types].xml', Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>\n')],
    ['_rels/.rels', Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>\n')],
    ['3D/3dmodel.model', Buffer.concat(ch)],
  ]);
}

// ---------- one printer's set ----------
function build(pk) {
  const pr = PRINTERS[pk], t0 = Date.now(), log = [];
  const X0 = FAR3.X0, Y0 = FAR3.Y0, EW = FAR3.NX * FAR3.CELL, EH = FAR3.NY * FAR3.CELL;   // (the whole land the data cover: 5.3 × 10 km)
  const fitMM = pr.bed - 10, S = Math.min(fitMM / EH, fitMM / EW);   // mm a metre (north up, the long side along the bed's y)
  const nx = Math.round(EW * S / RES), ny = Math.round(EH * S / RES), W = nx + 1, NV = W * (ny + 1);
  const brookHalf = BROOK_MM / 2 / S;   // m: the widened brook's half-width in the world
  // sample every grid vertex
  const h = new Float64Array(NV), L = new Float64Array(NV), wet = new Uint8Array(NV), can = new Float64Array(NV), cov = new Float64Array(NV), con = new Float64Array(NV), cls = new Uint8Array(NV);   // (cls: 0 forest, 1 open, 2 wetland)
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const x = X0 + i * RES / S, y = Y0 + j * RES / S, s = sample(x, y, brookHalf), k = j * W + i; h[k] = s.h; L[k] = s.L; wet[k] = s.wet ? 1 : 0;
    if (!wet[k]) { const c = canopyAt(x, y, RES / S); can[k] = FOREST ? c.h : 0; cov[k] = c.cover; con[k] = c.conifer; cls[k] = c.cover >= 0.5 ? 0 : WET_CLS.has(coverAt(x, y)) ? 2 : 1; } }
  let Z0 = Infinity; for (let k = 0; k < NV; k++) Z0 = Math.min(Z0, wet[k] ? L[k] : h[k]);
  const up = e => BASE + (e - Z0) * VEX * S;                    // the land's and the water surface's print height
  // THE TREETOPS (the human, 2026-10-22: "not the actual trees, more just simulate the top of the forest, to make it look like trees when
  // printed"): real crowns (~6–8 m) would be ~0.15–0.2 mm on the print, under one nozzle line, so the canopy is drawn as CROWNS a print
  // size can hold — one every CROWN mm on a jittered lattice, a crown where the photos' tree cover says (its chance = the cover there),
  // pointed for a conifer (the photos' conifer share) and domed for a hardwood. The canopy's top: the ground + its height × (0.7 + 0.3 ×
  // the crown's profile) — the gaps between crowns 30 % down. (Cosmetic and deterministic: a hash of the lattice cell)
  const hsh = (a, b, s) => { let x = (a * 374761393 + b * 668265263 + s * 2246822519) | 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  const prof = new Float64Array(NV);
  if (FOREST) { const na = Math.ceil(nx * RES / CROWN) + 1, nb = Math.ceil(ny * RES / CROWN) + 1, cro = [];
    for (let b = 0; b < nb; b++) for (let a = 0; a < na; a++) { const u = (a + 0.5 + 0.7 * (hsh(a, b, 1) - 0.5)) * CROWN, v = (b + 0.5 + 0.7 * (hsh(a, b, 2) - 0.5)) * CROWN;
      const kk = Math.min(ny, Math.max(0, Math.round(v / RES))) * W + Math.min(nx, Math.max(0, Math.round(u / RES)));
      cro.push(!wet[kk] && hsh(a, b, 4) < cov[kk] ? [u, v, CROWN * (0.5 + 0.2 * hsh(a, b, 3)), hsh(a, b, 5) < con[kk]] : null); }
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const k = j * W + i; if (wet[k] || !(can[k] > 0)) continue; const u = i * RES, v = j * RES, a0 = Math.floor(u / CROWN), b0 = Math.floor(v / CROWN); let pm = 0;
      for (let b = b0 - 1; b <= b0 + 1; b++) for (let a = a0 - 1; a <= a0 + 1; a++) { if (a < 0 || b < 0 || a >= na || b >= nb) continue; const c = cro[b * na + a]; if (!c) continue; const d = Math.hypot(u - c[0], v - c[1]) / c[2]; if (d < 1) pm = Math.max(pm, c[3] ? 1 - d : Math.sqrt(1 - d * d)); }
      prof[k] = pm; } }
  const land = new Float64Array(NV), lev = new Float64Array(NV), bed = new Float64Array(NV);
  for (let k = 0; k < NV; k++) { lev[k] = up(wet[k] ? L[k] : h[k]); land[k] = wet[k] ? lev[k] : up(h[k]) + can[k] * VEX * S * (0.7 + 0.3 * prof[k]); bed[k] = wet[k] ? lev[k] - Math.max(0, L[k] - h[k]) * DEX * S : land[k]; }
  let bedMin = Infinity; for (let k = 0; k < NV; k++) bedMin = Math.min(bedMin, bed[k]);
  const lift = Math.max(0, 1.0 - bedMin);
  if (lift > 0) { for (let k = 0; k < NV; k++) { land[k] += lift; lev[k] += lift; bed[k] += lift; } }   // (≥ 1 mm under the deepest bed)
  const G = { nx, ny };
  // the surfaces of each model
  const one = new Float64Array(NV), landOnly = new Float64Array(NV), basin = new Float64Array(NV), zero = new Float64Array(NV).fill(-1);   // (zero: the bottom below everything — the band's floor za is the bottom)
  for (let k = 0; k < NV; k++) { one[k] = wet[k] ? lev[k] : land[k]; landOnly[k] = wet[k] ? lev[k] - SKIN : land[k]; basin[k] = wet[k] ? Math.min(bed[k], lev[k] - STEP) : land[k]; }
  // the land's height bands: the land's (not the water's) print heights at the 45th and 85th percentiles
  const lh = []; for (let k = 0; k < NV; k++) if (!wet[k]) lh.push(land[k]); lh.sort((a, b) => a - b);
  const q = f => lh[Math.floor(f * (lh.length - 1))], z1 = q(0.45) + 1e-5, z2 = q(0.85) + 1e-5;
  const toM = z => Z0 + (z - BASE) / (VEX * S);
  const zLake = up(GEO.SURF.upper) + lift - STEP + LAYER / 2;   // (Upper's surface, the higher lake)   // (the basins' band: everything below the open basins' floor step — the lake beds — half a layer clear of the flat floors)
  const dir = `${OUT}/${pk}`; mkdirSync(dir, { recursive: true });
  // (each part also as its own STL in parts/: Bambu Studio loads several STLs at once as ONE object with parts — the fallback if a 3MF's parts don't come in as parts)
  const partsStl = (model, parts) => { mkdirSync(`${dir}/parts`, { recursive: true }); parts.forEach(({ M }, n) => stl(`${dir}/parts/${model}_${n + 1}.stl`, [M])); };
  const report = [], done = (name, parts) => { for (const { M, name: pn } of parts) { const c = check(M); report.push(`${name} · ${pn}: ${c.tris} triangles, ${(c.vol / 1000).toFixed(1)} cm³, ${c.badEdges ? c.badEdges + ' BAD EDGES' : 'closed and manifold'}`); } };
  // 1. one piece
  { const M = buildPart(G, one, zero, 0, Infinity, true), parts = [{ M, name: 'Hot Brook lakes (one piece)' }]; done('onepiece', parts);
    threeMF(`${dir}/onepiece.3mf`, parts, pr.bed, false, 'Hot Brook lakes — one piece'); stl(`${dir}/onepiece.stl`, [M]); }
  // 2. four colours: the land's three bands (below the water's skin) and the lakes' skin (its top a micron under the land at dry vertices:
  //    two water lobes meeting at one shore edge would otherwise pinch there — a non-manifold edge)
  { const skinTop = one.map((v, k) => wet[k] ? v : landOnly[k] - 1e-3), parts = [
      { M: buildPart(G, landOnly, zero, 0, z1, true), name: '1 land, low (below ' + toM(z1).toFixed(0) + ' m)' },
      { M: buildPart(G, landOnly, zero, z1, z2), name: '2 land, middle (' + toM(z1).toFixed(0) + '–' + toM(z2).toFixed(0) + ' m)' },
      { M: buildPart(G, landOnly, zero, z2, Infinity), name: '3 land, high (above ' + toM(z2).toFixed(0) + ' m)' },
      { M: buildPart(G, skinTop, landOnly), name: '4 water (the lakes, the brook and the ponds)' }];
    done('fourcolor', parts); threeMF(`${dir}/fourcolor.3mf`, parts, pr.bed, true, 'Hot Brook lakes — 4 colours'); partsStl('fourcolor', parts); }
  // 2b. four colours by LAND COVER: the forest (the core and its own skin, one filament), the open land (fields, clearings, roads, camps,
  //     beach and rock), the wetlands (marsh, shrub and wooded swamp without a closed canopy) and the water — each the top 3 layers
  //     (the colour shows on the surface: a filament change in every layer where two covers meet — more purge than the height bands)
  { const core = new Float64Array(NV); for (let k = 0; k < NV; k++) core[k] = (wet[k] ? lev[k] : land[k]) - SKIN;
    // (each grid square takes its corners' majority cover — water if half or more are wet; two squares of one cover meeting only at a
    // corner would pinch the skin there, so a checkerboard corner takes the other cover)
    const qc = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const vs = [j * W + i, j * W + i + 1, (j + 1) * W + i, (j + 1) * W + i + 1]; let w = 0; const n = [0, 0, 0]; for (const v of vs) { if (wet[v]) w++; else n[cls[v]]++; }
      qc[j * nx + i] = w >= 2 ? 3 : n[0] >= n[1] && n[0] >= n[2] ? 0 : n[1] >= n[2] ? 1 : 2; }
    for (let pass = 0, changed = 1; changed && pass < 20; pass++) { changed = 0;
      for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
        if (qc[a] === qc[d] && qc[b] !== qc[a] && qc[c] !== qc[a]) { qc[d] = qc[b]; changed++; } else if (qc[b] === qc[c] && qc[a] !== qc[b] && qc[d] !== qc[b]) { qc[c] = qc[a]; changed++; } } }
    const triCls = (t, qi) => qc[qi];
    const parts = [{ M: buildPart(G, core, zero, 0, Infinity, true), name: '1 forest (the core)' }, { M: buildSkin(G, one, core, triCls, 0), name: '1 forest (the canopy top — the same filament as the core)' },
      { M: buildSkin(G, one, core, triCls, 1), name: '2 open land (fields, clearings, roads, camps, beach, rock)' }, { M: buildSkin(G, one, core, triCls, 2), name: '3 wetlands (marsh, shrub and wooded swamp)' },
      { M: buildSkin(G, one, core, triCls, 3), name: '4 water' }];
    done('cover4', parts); threeMF(`${dir}/cover4.3mf`, parts, pr.bed, true, 'Hot Brook lakes — 4 colours by land cover'); partsStl('cover4', parts); }
  // 3. the terrain with open basins: one solid (STL) and four bands (3MF: the lake beds, then the land's three)
  { const M = buildPart(G, basin, zero, 0, Infinity, true); done('terrain_basins', [{ M, name: 'one piece' }]); stl(`${dir}/terrain_basins.stl`, [M]);
    const zl = Math.min(zLake, z1 - 0.01), parts = [
      { M: buildPart(G, basin, zero, 0, zl, true), name: '1 lake beds (below the water)' },
      { M: buildPart(G, basin, zero, zl, z1), name: '2 land, low (below ' + toM(z1).toFixed(0) + ' m)' },
      { M: buildPart(G, basin, zero, z1, z2), name: '3 land, middle (' + toM(z1).toFixed(0) + '–' + toM(z2).toFixed(0) + ' m)' },
      { M: buildPart(G, basin, zero, z2, Infinity), name: '4 land, high (above ' + toM(z2).toFixed(0) + ' m)' }];
    done('terrain_basins (4 bands)', parts); threeMF(`${dir}/terrain_basins.3mf`, parts, pr.bed, true, 'Hot Brook lakes — terrain with open basins'); partsStl('terrain_basins', parts); }
  // 4. the water inserts: the flat surface on top, the basin's shape below lifted by the clearance and shrunk from the walls (a 3×3 max of
  //    the basin: one grid cell clear of every wall); each lake its own piece, flipped flat side down
  { const bot = new Float64Array(NV), top = new Float64Array(NV);
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const k = j * W + i; let m = -Infinity;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii >= 0 && jj >= 0 && ii <= nx && jj <= ny) m = Math.max(m, basin[jj * W + ii]); }
      bot[k] = m + CLEAR; top[k] = wet[k] ? lev[k] : Math.min(lev[k], bot[k] - 0.01); }
    // each lake: the wet vertices' connected pieces (the brook's sloping strip and pieces under 20 mm² are left out: too thin to stand)
    const comp = new Int32Array(NV).fill(-1), comps = []; let nc = 0;
    for (let s0 = 0; s0 < NV; s0++) { if (!wet[s0] || comp[s0] >= 0 || !(top[s0] > bot[s0])) continue; const st = [s0], cells = []; comp[s0] = nc;
      while (st.length) { const k = st.pop(); cells.push(k); const i = k % W, j = (k - i) / W; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii > nx || jj > ny) continue; const kk = jj * W + ii; if (wet[kk] && comp[kk] < 0 && top[kk] > bot[kk]) { comp[kk] = nc; st.push(kk); } } }
      comps.push(cells); nc++; }
    const pieces = [];
    comps.map((cells, c) => ({ c, n: cells.length, cells })).sort((a, b) => b.n - a.n).forEach(({ c, n, cells }) => {
      if (n * RES * RES < 20) return;
      let zt = -Infinity, ztMin = Infinity; for (const k of cells) { zt = Math.max(zt, lev[k]); ztMin = Math.min(ztMin, lev[k]); }
      if (zt - ztMin > 0.05) return;   // (a sloping surface — the brook — won't lie flat)
      const T = new Float64Array(NV), B = new Float64Array(NV); for (let k = 0; k < NV; k++) { T[k] = comp[k] === c ? zt : -1; B[k] = comp[k] === c ? bot[k] : 0; }
      pieces.push({ M: flip(buildPart(G, T, B), zt), zt, n, name: '' });
    });
    // (the two Hot Brook lakes are the two biggest pieces: Upper's surface is 0.7 m above Lower's — GEO.SURF; the rest are the land's ponds)
    const big = pieces.slice(0, 2).sort((a, b) => b.zt - a.zt); if (big[0]) big[0].name = 'water — Upper Hot Brook Lake'; if (big[1]) big[1].name = 'water — Lower Hot Brook Lake';
    pieces.forEach((p, i) => { if (!p.name) p.name = 'water — pond ' + (i - 1); });
    done('water_inserts', pieces); threeMF(`${dir}/water_inserts.3mf`, pieces, pr.bed, false, 'Hot Brook lakes — clear water inserts'); stl(`${dir}/water_inserts.stl`, pieces.map(p => p.M));
  }
  const top = lh[lh.length - 1];
  const info = [
    `${pr.name}: the model ${(nx * RES).toFixed(0)} × ${(ny * RES).toFixed(0)} mm (north up, along the bed's y), scale 1:${Math.round(1000 / S).toLocaleString('en-US')} — ${(EW / 1000).toFixed(1)} × ${(EH / 1000).toFixed(1)} km of land`,
    `heights ×${VEX} (the land over its lowest ground, ${Z0.toFixed(0)} m), the lakes' depth ×${DEX}; base ${BASE} mm; the tallest point ${top.toFixed(1)} mm${FOREST ? ' (with the forest)' : ''}; grid ${RES.toFixed(2)} mm; the brook ${BROOK_MM} mm wide`,
    `4-colour bands (print heights): land low < ${z1.toFixed(2)} mm (${toM(z1).toFixed(0)} m), middle to ${z2.toFixed(2)} mm (${toM(z2).toFixed(0)} m), high above; the water: the lakes' top ${SKIN.toFixed(1)} mm`,
    `terrain with open basins: a ${STEP.toFixed(1)}-mm step at the shoreline; the lake-bed band below ${Math.min(zLake, z1 - 0.01).toFixed(2)} mm; the inserts sit ${CLEAR} mm above the beds and one grid cell (${RES.toFixed(2)} mm) in from the walls`,
    ...report, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`];
  const how = [
    '', 'THE FILES', '',
    'onepiece.3mf / .stl     The whole terrain with flat lakes, one solid. Print in one colour (white or light grey PLA) and paint it.',
    'fourcolor.3mf           Four parts by HEIGHT for the AMS: 1 land low, 2 land middle, 3 land high, 4 water (the lakes\' top 3 layers).',
    '                        Suggested: 1 light green, 2 dark green, 3 brown or grey, 4 blue. Filament changes only where two bands share a',
    '                        layer (the water\'s 3 layers and the band edges): little purge.',
    'cover4.3mf              Four colours by LAND COVER from the aerial photos: 1 forest (TWO parts, the core and the canopy top: give both',
    '                        the same filament), 2 open land (fields, clearings, roads, camps, beach, rock: tan), 3 wetlands (olive), 4 water',
    '                        (blue). The colours are the top 3 layers, so the AMS changes filament in most layers: more purge and time -',
    '                        turn on "flush into objects\' infill" in Bambu Studio to save filament.',
    'terrain_basins.3mf/.stl The terrain with the lakes OPEN (a step at the shoreline) for the clear water inserts. The STL is one solid; the',
    '                        3MF is four height parts: 1 the lake beds (blue or dark blue: seen through the clear water it reads as depth),',
    '                        2-4 the land low / middle / high.',
    'water_inserts.3mf/.stl  Each lake\'s water as its own piece for CLEAR PETG, exported UPSIDE DOWN: the flat water surface is on the',
    '                        plate (smooth and glossy on a smooth plate; a textured plate gives it ripples). Thicker where the lake is',
    `                        deeper. Turn it over and drop it into its basin: it clears the bed by ${CLEAR} mm and the walls by one grid cell.`,
    'parts/                  Every multi-part model\'s parts as separate STLs: if a 3MF\'s parts open as separate objects, select these',
    '                        STLs together and load them as ONE object with multiple parts.',
    '', 'IN BAMBU STUDIO', '',
    'Open the .3mf. A multi-part model shows its parts in the object list: pick each part\'s filament (its AMS slot) there. The part names',
    'say which is which. North is up the bed\'s y axis; Upper Hot Brook Lake is the northern lake.',
    '', 'SETTINGS (0.4 nozzle)', '',
    'Terrain: 0.2 mm layers (0.12 for finer contours: the treetops and the shore show more), 2-3 walls, 10-15 % infill, no supports.',
    'Clear inserts: PETG, 100 % infill (aligned rectilinear, for clarity), slower outer walls, flat face down; if a piece is tight, scale it',
    'to 99 % in X and Y. A 0.2 nozzle gives finer treetops and shorelines: re-run the exporter with --nozzle 0.2.',
    '', 'Made by tools/hotbrook/export_print.mjs from the Synapse Reef model of the Hot Brook lakes: the beds from the 1949 MDIFW soundings,',
    'the land from lidar, the forest from the USDA NAIP aerial photos. Re-run it for other sizes or exaggerations (--vex, --dex, --base).'];
  writeFileSync(`${dir}/README.txt`, info.join('\n') + '\n' + how.join('\n') + '\n');
  console.log(info.join('\n'));
}
for (const pk of which === 'both' ? ['a1', 'a1mini'] : [which]) build(pk);
