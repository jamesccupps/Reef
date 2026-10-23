// wild3kit.js — the toolkit of the lakes' animals on screen (browser layer; render3/wild3view.js and shallows3view.js use it).
// BODIES are low-poly shapes built from ellipsoids, tubes and flat sheets, each vertex carrying a PALETTE: its mix of the four colours
// an instance gives (A, B, C, D — none at all is black: eyes, a loon's bill), so one body serves a drake and a hen, a summer and a
// winter coat. An animal is drawn from PARTS — a torso, a head on its neck, legs, wings — each one instanced mesh holding every
// animal's copy of it, posed each frame by matrices (a wingbeat, a stride, a heron's strike), sent only for the instances in use.
// The water between a part and the eye is the fish's (water3.js waterOut: a part's 'sy', the local surface, below which it is dimmed
// and tinted). And the lakes' PLACES the animals use: their open water, shallows and shores, the land at the water's edge, and a
// sampler of the sim's fish (the prey a hunter looks for). Cosmetic: a hash and Math.random, never core.rand.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER, LAND } from '../geometry.js';
import { waterOut } from './water3.js';
const { attribute, positionWorld, float } = THREE.TSL;

export const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
// the water surface's height (three's y) over (x, y): each lake's own level, the brook's falling one
export const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
export const hash = (i, k) => { let h = Math.imul(i | 0, 374761393) + Math.imul(k | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
export const rnd = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const angD = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
export const col = h => new THREE.Color(h);

// ---------- bodies ----------
const PAL = { A: [1, 0, 0, 0], B: [0, 1, 0, 0], C: [0, 0, 1, 0], D: [0, 0, 0, 1], K: [0, 0, 0, 0] };
const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
// a rotation by (x, y, z) rad, about z first, then y, then x (three's 'XYZ' Euler)
const rotor = r => {
  if (!r) return v => v;
  const cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
  return v => { let x = v[0], y = v[1], z = v[2], t; t = x * cz - y * sz; y = x * sz + y * cz; x = t; t = x * cy + z * sy; z = -x * sy + z * cy; x = t; t = y * cx - z * sx; z = y * sx + z * cx; y = t; return [x, y, z]; };
};
// a body in the making: the animal's frame is +x forward, +y up, +z its right side (m). k: a palette letter, a weight [A, B, C, D],
// or a function of the point (an ellipsoid's: its unit-sphere point; a tube's: t along it 0–1 and its angle) returning one
export function shape() {
  const P = [], N = [], W = [];
  const pw = (k, a, b) => typeof k === 'function' ? pw(k(a, b)) : typeof k === 'string' ? PAL[k] : k;
  const push = (p, n, w) => { P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); W.push(w[0], w[1], w[2], w[3]); };
  // a triangle, its corners counter-clockwise seen from the side it faces (two: both sides — a wing, a fin, a flag)
  function tri(a, b, c, k, two = false) {
    const n = nrm(cross(sub(b, a), sub(c, a))), w = pw(k, a);
    push(a, n, w); push(b, n, w); push(c, n, w);
    if (two) { const m = [-n[0], -n[1], -n[2]]; push(a, m, w); push(c, m, w); push(b, m, w); }
  }
  const quad = (a, b, c, d, k, two) => { tri(a, b, c, k, two); tri(a, c, d, k, two); };
  // an ellipsoid about c with radii r, turned by rot ([x, y, z] rad), w × h facets, smooth
  function ell(c, r, k, { w = 8, h = 6, rot = null } = {}) {
    const R = rotor(rot), V = [], NN = [], WW = [];
    for (let j = 0; j <= h; j++) {
      const v = j / h * Math.PI, sv = Math.sin(v), cv = Math.cos(v);
      for (let i = 0; i <= w; i++) {
        const u = i / w * Math.PI * 2, s = [Math.cos(u) * sv, cv, Math.sin(u) * sv], p = R([s[0] * r[0], s[1] * r[1], s[2] * r[2]]);
        V.push([p[0] + c[0], p[1] + c[1], p[2] + c[2]]); NN.push(R(nrm([s[0] / r[0], s[1] / r[1], s[2] / r[2]]))); WW.push(pw(k, s));
      }
    }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const a = j * (w + 1) + i, b = a + 1, d = a + w + 1, e = d + 1;
      for (const q of [a, b, d, b, e, d]) push(V[q], NN[q], WW[q]);
    }
  }
  // a tube through the points pts ([x, y, z] each) with radii rs (a number each, or [across, up] for a flattened one), seg sides,
  // its ends capped
  function tube(pts, rs, k, seg = 6, cap = true) {
    const n = pts.length, T = [], Nf = [], Bf = [];
    for (let i = 0; i < n; i++) T.push(nrm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])));
    const ref = Math.abs(T[0][1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    let B = nrm(cross(T[0], ref)), Nv = cross(B, T[0]);
    for (let i = 0; i < n; i++) { if (i) { B = nrm(cross(T[i], Nv)); Nv = cross(B, T[i]); } Nf.push(Nv); Bf.push(B); }
    const R = i => { const r = rs[i]; return Array.isArray(r) ? r : [r, r]; };
    const ring = (i, s) => { const a = s / seg * Math.PI * 2, [ra, ru] = R(i), c = Math.cos(a), si = Math.sin(a), p = pts[i], Nv = Nf[i], Bv = Bf[i];
      return [[p[0] + Nv[0] * c * ru + Bv[0] * si * ra, p[1] + Nv[1] * c * ru + Bv[1] * si * ra, p[2] + Nv[2] * c * ru + Bv[2] * si * ra],
        nrm([Nv[0] * c / Math.max(ru, 1e-4) + Bv[0] * si / Math.max(ra, 1e-4), Nv[1] * c / Math.max(ru, 1e-4) + Bv[1] * si / Math.max(ra, 1e-4), Nv[2] * c / Math.max(ru, 1e-4) + Bv[2] * si / Math.max(ra, 1e-4)]), pw(k, i / (n - 1), a)]; };
    for (let i = 0; i < n - 1; i++) for (let s = 0; s < seg; s++) {
      const a = ring(i, s), b = ring(i, s + 1), c = ring(i + 1, s), d = ring(i + 1, s + 1);
      for (const v of [a, b, c, b, d, c]) push(v[0], v[1], v[2]);
    }
    if (cap) for (const [i, sg] of [[0, -1], [n - 1, 1]]) {
      const [ra, ru] = R(i); if (!(ra > 1e-4 && ru > 1e-4)) continue;
      const c = pts[i], nn = T[i].map(v => v * sg), w = pw(k, i / (n - 1), 0);
      for (let s = 0; s < seg; s++) { const a = ring(i, s)[0], b = ring(i, s + 1)[0]; if (sg > 0) { push(c, nn, w); push(a, nn, w); push(b, nn, w); } else { push(c, nn, w); push(b, nn, w); push(a, nn, w); } }
    }
  }
  // a box centred at c, sizes s (along x, y, z), turned by rot
  function box(c, s, k, rot = null) {
    const R = rotor(rot), h = s.map(v => v / 2), F = [[[1, 0, 0], [0, 1, 0]], [[-1, 0, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 1]], [[0, -1, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0]], [[0, 0, -1], [1, 0, 0]]];
    for (const [n, u] of F) {
      const v = cross(n, u), at = (a, b) => { const p = R([n[0] * h[0] + u[0] * a * h[0] + v[0] * b * h[0], n[1] * h[1] + u[1] * a * h[1] + v[1] * b * h[1], n[2] * h[2] + u[2] * a * h[2] + v[2] * b * h[2]]); return [p[0] + c[0], p[1] + c[1], p[2] + c[2]]; };
      quad(at(-1, -1), at(1, -1), at(1, 1), at(-1, 1), k);
    }
  }
  function done() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('pal', new THREE.Float32BufferAttribute(W, 4)); return g;
  }
  return { tri, quad, ell, tube, box, done };
}

// ---------- parts: one instanced mesh of a body, its copies posed each frame ----------
const marks = (buf, n) => { buf.clearUpdateRanges(); buf.addUpdateRange(0, n); buf.needsUpdate = true; };
// geo: a shape's geometry; cap: copies at most. water: dimmed by the water above it (water3.js); layer: 2 keeps it out of the water's
// mirror (main3: the small animals of the shallows)
export function partMesh(geo, cap, { water = true, rough = 0.85, metal = 0, side = THREE.FrontSide, layer = 0, opacity = 1 } = {}) {
  const dyn = (n, k) => new THREE.InstancedBufferAttribute(new Float32Array(n * k), k).setUsage(THREE.DynamicDrawUsage);
  // (the fourth colour carries the local surface's height in w: a WebGPU pipeline takes at most 8 vertex buffers — position, normal,
  // pal, iA–iD and the instance matrix are 8 — and with 'sy' on its own every part dimmed by the water (water: true) failed to draw)
  for (const k of ['iA', 'iB', 'iC']) geo.setAttribute(k, dyn(cap, 3));
  geo.setAttribute('iD', dyn(cap, 4));
  const transparent = opacity < 1, mat = new THREE.MeshStandardNodeMaterial({ roughness: rough, metalness: metal, side, transparent, depthWrite: !transparent });
  const w = attribute('pal', 'vec4');
  mat.colorNode = attribute('iA', 'vec3').mul(w.x).add(attribute('iB', 'vec3').mul(w.y)).add(attribute('iC', 'vec3').mul(w.z)).add(attribute('iD', 'vec4').xyz.mul(w.w));
  if (transparent) mat.opacityNode = float(opacity);
  if (water) mat.outputNode = waterOut(attribute('iD', 'vec4').w.sub(positionWorld.y));
  const mesh = new THREE.InstancedMesh(geo, mat, cap); mesh.count = 0; mesh.frustumCulled = false; mesh.visible = false; mesh.layers.set(layer);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const M = mesh.instanceMatrix.array, AT = geo.attributes, CA = AT.iA.array, CB = AT.iB.array, CC = AT.iC.array, CD = AT.iD.array;
  const P = {
    mesh, n: 0, cap,
    // one copy: matrix m, colours [A, B, C, D] (THREE.Color each), the local water surface's height sy (three's y; far below: never wet)
    put(m, c, sy = -1e4) {
      if (P.n >= cap) return; const o = P.n++;
      M.set(m.elements, o * 16); CD[o * 4 + 3] = sy;
      const a = c[0], b = c[1] || a, cc = c[2] || a, d = c[3] || a;
      CA[o * 3] = a.r; CA[o * 3 + 1] = a.g; CA[o * 3 + 2] = a.b; CB[o * 3] = b.r; CB[o * 3 + 1] = b.g; CB[o * 3 + 2] = b.b;
      CC[o * 3] = cc.r; CC[o * 3 + 1] = cc.g; CC[o * 3 + 2] = cc.b; CD[o * 4] = d.r; CD[o * 4 + 1] = d.g; CD[o * 4 + 2] = d.b;
    },
    end() {
      const n = P.n; mesh.count = n; mesh.visible = n > 0; P.n = 0; if (!n) return;
      marks(mesh.instanceMatrix, n * 16); for (const a of [AT.iA, AT.iB, AT.iC]) marks(a, n * 3); marks(AT.iD, n * 4);
    },
  };
  return P;
}

// ---------- posing ----------
const _l = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
// an animal's frame: at three-space (X, Y, Z), heading yaw (the sim's: 0 east, counter-clockwise — three's turn about y), pitch (nose
// up +), roll (its right side down +), size k
export function frame(out, X, Y, Z, yaw, pitch = 0, roll = 0, k = 1) {
  _e.set(roll, yaw, pitch, 'YZX'); _q.setFromEuler(_e); return out.compose(_v.set(X, Y, Z), _q, _s.set(k, k, k));
}
// a part in the frame f: at (x, y, z) of it, turned by (rx, ry, rz) — about z first (a neck's or a leg's swing, nose-up +), then y
// (a wing's sweep), then x (a wing's beat: its tip down +) — and scaled (sx, sy, sz)
export function part(out, f, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz, 'XYZ'); _q.setFromEuler(_e); _l.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); return out.multiplyMatrices(f, _l);
}
// a straight stick from a to b (three-space), r thick — a fishing line, a branch: maps a unit tube along +x (0 → 1) onto it
export function segment(out, ax, ay, az, bx, by, bz, r) {
  let dx = bx - ax, dy = by - ay, dz = bz - az; const L = Math.hypot(dx, dy, dz) || 1e-6; dx /= L; dy /= L; dz /= L;
  let ux = 0, uy = 1, uz = 0; if (Math.abs(dy) > 0.95) { ux = 1; uy = 0; }
  let zx = dy * uz - dz * uy, zy = dz * ux - dx * uz, zz = dx * uy - dy * ux; const zl = Math.hypot(zx, zy, zz) || 1; zx /= zl; zy /= zl; zz /= zl;
  const yx = zy * dz - zz * dy, yy = zz * dx - zx * dz, yz = zx * dy - zy * dx;
  return out.set(dx * L, yx * r, zx * r, ax, dy * L, yy * r, zy * r, ay, dz * L, yz * r, zz * r, az, 0, 0, 0, 1);
}

// ---------- the lakes' places ----------
// per water body (1 Upper, 2 Lower, 3 the brook): its water cells; its SHORE (water cells beside land: [x, y, nx, ny] — the unit way
// to the land); its EDGE (land cells beside its water: [x, y, nx, ny] — the way to the water). Built on first use
let PL = null;
export function places() {
  if (PL) return PL;
  PL = { water: {}, shore: {}, edge: {} };
  const NX = GEO.NX, NY = GEO.NY, W = { 1: [], 2: [], 3: [] }, S = { 1: [], 2: [], 3: [] }, E = { 1: [], 2: [], 3: [] };
  for (let i = 0; i < GEO.N; i++) {
    const b = GEO.body[i], r = Math.floor(i / NX), q = i % NX; let nx = 0, ny = 0, nb = 0;
    for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue;
      const o = GEO.body[rr * NX + qq];
      if (b !== LAND && o === LAND) { nx += dq; ny += dr; }
      if (b === LAND && o !== LAND) { nx += dq; ny += dr; nb = o; }
    }
    const [x, y] = GEO.cellCentre(i), l = Math.hypot(nx, ny);
    if (b !== LAND) { W[b].push(i); if (l > 0) S[b].push(x, y, nx / l, ny / l); }
    else if (nb && l > 0) E[nb].push(x, y, nx / l, ny / l);
  }
  for (const b of [1, 2, 3]) { PL.water[b] = Int32Array.from(W[b]); PL.shore[b] = Float32Array.from(S[b]); PL.edge[b] = Float32Array.from(E[b]); }
  // the WATERLINE itself: each shore cell's edge with the land (half a cell toward it) — where a mink runs and an otter hauls out,
  // in front of the bank's thickets
  PL.line = {}; for (const b of [1, 2, 3]) { const S = PL.shore[b], L = new Float32Array(S.length); for (let o = 0; o < S.length; o += 4) { L[o] = S[o] + S[o + 2] * GEO.CELL * 0.45; L[o + 1] = S[o + 1] + S[o + 3] * GEO.CELL * 0.45; L[o + 2] = S[o + 2]; L[o + 3] = S[o + 3]; } PL.line[b] = L; }
  return PL;
}
// a random point in body b's water with its bed dmin–dmax m deep and smin–smax m from the shore (null after `tries` misses); ok(x, y),
// if given, must take it too (wild3view: open water, not the ice)
export function pickWater(b, dmin, dmax, smin = 0, smax = 1e9, tries = 40, near = null, R = 1e9, ok = null) {
  const W = places().water[b]; if (!W || !W.length) return null;
  for (let k = 0; k < tries; k++) {
    const i = W[(Math.random() * W.length) | 0], [cx, cy] = GEO.cellCentre(i), x = cx + (Math.random() - 0.5) * GEO.CELL, y = cy + (Math.random() - 0.5) * GEO.CELL;
    if (near && (x - near[0]) ** 2 + (y - near[1]) ** 2 > R * R) continue;
    if (GEO.bodyAt(x, y) !== b || (ok && !ok(x, y))) continue;
    const d = GEO.depthAt(x, y), s = GEO.shoreDist(x, y); if (d >= dmin && d <= dmax && s >= smin && s <= smax) return [x, y];
  }
  return null;
}
// a random shore point of body b ([x, y, nx, ny]: nx, ny the way to the land), within R of `near` if given
export function pickShore(b, near = null, R = 1e9, tries = 40, which = 'shore') {
  const S = places()[which][b]; if (!S || !S.length) return null;
  for (let k = 0; k < tries; k++) {
    const o = ((Math.random() * S.length / 4) | 0) * 4;
    if (near && (S[o] - near[0]) ** 2 + (S[o + 1] - near[1]) ** 2 > R * R) continue;
    return [S[o] + (Math.random() - 0.5) * GEO.CELL * 0.6, S[o + 1] + (Math.random() - 0.5) * GEO.CELL * 0.6, S[o + 2], S[o + 3]];
  }
  return null;
}
// the shore point of body b nearest (x, y) ([x, y, nx, ny], or null)
export function nearestShore(b, x, y, which = 'shore') {
  const S = places()[which][b]; if (!S) return null; let best = -1, bd = 1e18;
  for (let o = 0; o < S.length; o += 4) { const d = (S[o] - x) ** 2 + (S[o + 1] - y) ** 2; if (d < bd) { bd = d; best = o; } }
  return best < 0 ? null : [S[best], S[best + 1], S[best + 2], S[best + 3]];
}

// THE PREY A HUNTER LOOKS FOR: among the sim's fish in the latest snapshot (render3/sim3worker.js: per fish [px py pz pyaw ppitch | x
// y z yaw pitch | L k n spd bed id school bodyMul], FISH_STRIDE 18) and its young (YOY_STRIDE 12: [px py pz | x y z | L k n id bed
// guarded]), `tries` random ones, the first that `ok(x, y, z, L cm, k, bed)` takes and within R of (x, y) — its [x, y, z, L], or null
export function preyPick(snap, ok, x0, y0, R, tries = 60, young = true) {
  if (!snap) return null; const B = snap.fish, Y = snap.yoy, nf = snap.nf || 0, ny = young ? snap.ny || 0 : 0, tot = nf + ny; if (!tot) return null;
  for (let k = 0; k < tries; k++) {
    const j = (Math.random() * tot) | 0; let x, y, z, L, kk, bed;
    if (j < nf) { const o = j * 18; x = B[o + 5]; y = B[o + 6]; z = B[o + 7]; L = B[o + 10]; kk = B[o + 11]; bed = B[o + 14]; }
    else { const o = (j - nf) * 12; x = Y[o + 3]; y = Y[o + 4]; z = Y[o + 5]; L = Y[o + 6]; kk = Y[o + 7]; bed = Y[o + 10]; }
    if ((x - x0) ** 2 + (y - y0) ** 2 > R * R) continue;
    if (ok(x, y, z, L, kk, bed)) return [x, y, z, L];
  }
  return null;
}
