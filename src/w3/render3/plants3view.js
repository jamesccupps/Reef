// plants3view.js — the weeds of the 3-D lakes on screen (browser layer). The plants are a field on the bed (src/w3/plants3.js:
// shoots per bed cell of the water model and growth form, sent by render3/sim3worker.js every few seconds); here each 1.5-m
// cell of the lake bed gets instances of the forms the water-model cells about it hold (blended, then in clumps — no squares),
// in proportion to their stands — fronds for the
// submerged canopy (as tall as the canopy), lily pads on the surface, reeds standing out of the water, low tufts for the
// rosettes and the deep meadow — fresh green in spring, browning in autumn as the shoots die back (the evergreen rosettes and
// mosses stay green). Stems are drawn only near where the camera looks (the submerged forms within about the camera's
// distance, the pads and reeds on the surface twice as far) and rebuilt when new plant data arrives or the view moves on;
// farther off, each bed cell's weed cover tints the bed (main3), where single stems would be smaller than a pixel anyway.
// The MUSSELS too (littoral3.js, stage 7d): dark shells half-buried in the bed at their real numbers, near the camera only.
// Cosmetic scatter uses a hash (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER, LAND, BROOK } from '../geometry.js';
import { FORMS3, NF3, PL3 } from '../plants3.js';
import { waterOut } from './water3.js';
const { attribute, positionLocal, positionGeometry, positionWorld, sin, cos, time, vec3 } = THREE.TSL;

const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
const PER_K = (GEO.CELL / 1.5) ** 2;   // (the counts below are per 1.5-m cell: a bigger cell — the true-size lakes' 5 m — holds its area's worth)
const PER = Object.fromEntries(Object.entries({ EM: 5, FL: 16, SC: 3, IS: 3, DM: 3 }).map(([k, v]) => [k, Math.round(v * PER_K)]));   // instances per cell at a full stand (lily pads are small: many)
const TINT = { EM: 0.5, FL: 0.15, SC: 1, IS: 0.5, DM: 0.7 };  // how much each form's stand colours the bed seen from afar
const COL = { EM: 0x6f8a3a, FL: 0x3f7434, SC: 0x4f6b2c, IS: 0x5f7a44, DM: 0x2c4630 };
const SPRING = new THREE.Color(0x8fb04a), BROWN = new THREE.Color(0x7d6a38), STRAW = new THREE.Color(0xa8945e);   // (last year's standing stems: plants3 dead)
const DEAD_FULL = 60;   // g DW/m² of standing dead stems drawn as a full cell of them (on the bulrush's mesh)
export const LAYER = 2;

// geometries, y from 0 (the bed) to 1 (scaled to the stand's height): a TUFT of nb thin blades fanning from one base — each a
// strip of segs segments, w0 wide at the base and w1 at the tip (m), leaning out to `spread` m at the top (curving: t^bend);
// a lily pad: a flat notched disc of radius 1
function tuft(nb, w0, w1, spread, segs, bend) {
  const g = new THREE.BufferGeometry(), p = [], n = [], idx = [];
  for (let k = 0; k < nb; k++) {
    const a = (k + 0.37 * (k % 3)) / nb * Math.PI * 2, rx = Math.cos(a), rz = Math.sin(a), tx = -rz, tz = rx, sp = spread * (0.6 + 0.4 * ((k * 7) % 5) / 4);
    const b = p.length / 3;
    for (let q = 0; q <= segs; q++) {
      const t = q / segs, o = sp * Math.pow(t, bend), w = (w0 + (w1 - w0) * t) / 2;
      p.push(rx * o - tx * w, t, rz * o - tz * w, rx * o + tx * w, t, rz * o + tz * w);
      n.push(rx, 0.4, rz, rx, 0.4, rz);
      if (q) { const v = b + q * 2; idx.push(v - 2, v - 1, v + 1, v - 2, v + 1, v); }
    }
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); g.setIndex(idx);
  return g;
}
function pad() { const g = new THREE.CircleGeometry(1, 10, 0.25, Math.PI * 2 - 0.5); g.rotateX(-Math.PI / 2); return g; }
// each species' shape from its form and its look (plants3.js FORMS3 look: blade width w and count n)
const GEOM = {
  EM: L => tuft(L.n || 6, L.w || 0.03, (L.w || 0.03) * 0.2, 0.12, 2, 1.6),   // pickerelweed's broad leaves, bulrush's thin round stems
  FL: () => pad(),
  SC: L => tuft(L.n || 5, L.w || 0.09, (L.w || 0.09) * 0.5, 0.38, 3, 1.3),   // ribbon, broad and fern-like pondweeds; bladderwort's fine shoots
  IS: () => tuft(8, 0.03, 0.005, 0.10, 1, 1),       // rosettes: short stiff spikes in a ring
  DM: () => tuft(6, 0.10, 0.06, 0.18, 1, 1),        // Nitella and moss: a low bushy tuft
};
const INST_MAX = 150000;   // (instances a species' mesh holds at most: only the cells near the camera are drawn)
const SWAY = { EM: 0.03, FL: 0, SC: 0.16, IS: 0.005, DM: 0.03 };   // m of sway at a 1-m plant's tip (× its height)

// a cheap hash for each cell's scatter (cosmetic)
const hash = (i, k) => { let h = Math.imul(i, 374761393) + Math.imul(k, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, y) {   // smooth value noise, 0–1 (cosmetic)
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v;
}
const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };

export function makePlantsView(W3) {
  const G = W3.G, group = new THREE.Group();
  // the bed cells in the order the sim keeps them (chem3.bedCells: every water-model cell with bed area, in index order)
  const bedIdx = new Int32Array(G.NCELL).fill(-1); let nb = 0; for (let j = 0; j < G.NCELL; j++) if (G.bedA[j] > 0) bedIdx[j] = nb++;
  // each 1.5-m water cell's bed cell in the water model: the layer its bed lies in (or the nearest layer with bed)
  const fi = [], fb = [];
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] === LAND || GEO.depth[i] <= 0.05) continue;
    const [x, y] = GEO.cellCentre(i), c = W3.colAt(x, y); if (c < 0) continue;
    const j0 = G.cell0[c], n = G.nL[c], k = Math.min(n - 1, Math.floor(GEO.depth[i] / G.DZ)); let ib = -1;
    for (let d = 0; d < n && ib < 0; d++) for (const kk of [k - d, k + d]) if (kk >= 0 && kk < n && bedIdx[j0 + kk] >= 0) { ib = bedIdx[j0 + kk]; break; }
    if (ib >= 0) { fi.push(i); fb.push(ib); }
  }
  const fineI = Int32Array.from(fi), fineB = Int32Array.from(fb), nF = fineI.length;
  // THE WEEDS WITHOUT THE WATER MODEL'S SQUARES (the human, 2026-10-18: "why is everything like all square? ... the plants in the
  // water"): the sim keeps the plants per column of the water model — 50-m squares in the true-size lakes, 5 m in the 1/10 ones —
  // and per 0.5-m layer of depth in it, so drawn by its column every cell of a square took one stand: a weed bed was a 50-m
  // square. Each cell instead takes its stand from the four columns about it by nearness (bilinear between their centres; a
  // column of the other water left out), each column's at the cell's own depth — between the mid-depths of its layers with bed
  // about it, or, the cell beyond them, its nearest layer's, weighed down by the depth between (DZ_FIT) — so the beds fade from
  // square to square and from depth to depth, following the bed's contours; then grows it in clumps, as real beds grow — patchy
  // at metres to tens of metres (clonal spread from where a plant took, wave exposure, the bed's grain): each form's stand × a
  // smooth random field about 1 on average, its clumps PATCH_L across
  const NW = 8, DZ_FIT = 0.5, WB = new Int32Array(nF * NW).fill(-1), WW = new Float32Array(nF * NW);
  let wq = 0, wo = 0, wd = 0, wb = 0;   // (the cell being weighed: entries so far, its first entry, its depth, its water)
  const put = (ib, w) => { if (w > 1e-4 && wq < NW) { WB[wo + wq] = ib; WW[wo + wq] = w; wq++; } };
  const col = (c, w) => {   // column c's stand at depth wd, weight w
    const j0 = G.cell0[c], n = G.nL[c]; let lo = -1, hi = -1;
    for (let k = 0; k < n; k++) { if (bedIdx[j0 + k] < 0) continue; if (G.zMid[j0 + k] <= wd) lo = k; else { hi = k; break; } }
    if (lo >= 0 && hi >= 0) { const za = G.zMid[j0 + lo], f = (wd - za) / (G.zMid[j0 + hi] - za); put(bedIdx[j0 + lo], w * (1 - f)); put(bedIdx[j0 + hi], w * f); }
    else if (lo >= 0 || hi >= 0) { const k = lo >= 0 ? lo : hi, dz = (wd - G.zMid[j0 + k]) / DZ_FIT; put(bedIdx[j0 + k], w * Math.exp(-dz * dz)); }
  };
  const corner = (X, Y, w) => { if (!(w > 0) || X < 0 || Y < 0 || X >= G.CX || Y >= G.CY) return; const c = G.gridCol[Y * G.CX + X]; if (c >= 0 && G.body[c] === wb) col(c, w); };
  for (let t = 0; t < nF; t++) {
    const i = fineI[t], [x, y] = GEO.cellCentre(i); wb = GEO.body[i]; wd = GEO.depth[i]; wo = t * NW; wq = 0;
    if (G.ownBrook && wb === BROOK) col(G.colOfFine[i], 1);   // (the true-size brook's own stretches: by its own column)
    else {
      const u = (x - G.X0) / G.COL - 0.5, v = (y - G.Y0) / G.COL - 0.5, gx = Math.floor(u), gy = Math.floor(v), fu = u - gx, fv = v - gy;
      corner(gx, gy, (1 - fu) * (1 - fv)); corner(gx + 1, gy, fu * (1 - fv)); corner(gx, gy + 1, (1 - fu) * fv); corner(gx + 1, gy + 1, fu * fv);
    }
    let sw = 0; for (let r = 0; r < wq; r++) sw += WW[wo + r];
    if (!(sw > 1e-6)) { WB[wo] = fineB[t]; WW[wo] = 1; WB[wo + 1] = -1; wq = 1; sw = 1; }
    for (let r = 0; r < wq; r++) WW[wo + r] /= sw;
  }
  // a bed-cell array's value at fine cell t, blended (stride values a bed cell; the off-th)
  const blend = (arr, t, stride = 1, off = 0) => { let s = 0; for (let r = t * NW, e = r + NW; r < e && WB[r] >= 0; r++) s += WW[r] * arr[WB[r] * stride + off]; return s; };
  // (one field of clumps over the cell grid, each form reading it shifted by its own whole number of cells — 7 and 11 a form,
  // more than its clumps' width, so the forms clump apart)
  const PATCH_L = Math.max(9 * GEO.SCALE, 3 * GEO.CELL), PX = GEO.NX + 7 * NF3, PY = GEO.NY + 11 * NF3, PT = new Float32Array(PX * PY);
  for (let r = 0; r < PY; r++) for (let c = 0; c < PX; c++) {
    const X = (GEO.X0 + (c + 0.5) * GEO.CELL) / PATCH_L, Y = (GEO.Y0 + (r + 0.5) * GEO.CELL) / PATCH_L;
    PT[r * PX + c] = 0.65 * vnoise(X, Y) + 0.35 * vnoise(X * 2.7 + 5.5, Y * 2.7 + 9.5);
  }
  const patch = new Float32Array(NF3 * nF);
  for (let t = 0; t < nF; t++) {
    const i = fineI[t], c = i % GEO.NX, r = (i - c) / GEO.NX;
    for (let f = 0; f < NF3; f++) patch[f * nF + t] = 2 * Math.min(1, Math.max(0, (PT[(r + 11 * f) * PX + c + 7 * f] - 0.3) / 0.4));   // (~a tenth of the bed bare between clumps, a tenth twice the stand)
  }
  const stand = new Float32Array(NF3 * nF);   // per form per fine cell: the stand drawn (g DW/m²), blended and clumped
  const cover = new Float32Array(GEO.N);   // per 1.5-m cell: the weeds' tint of the bed, 0–1
  const meshes = FORMS3.map(F => {
    const max = Math.min(INST_MAX, fineI.length * PER[F.form]);
    const mat = new THREE.MeshStandardNodeMaterial({ roughness: F.form === 'FL' ? 0.45 : 0.85, metalness: 0, side: THREE.DoubleSide });
    const geo = GEOM[F.form](F.look || {});
    if (SWAY[F.form] > 0) {   // the stems sway in the water's slow surge: more toward the tip, a wave passing across the bed
      const amp = new THREE.InstancedBufferAttribute(new Float32Array(max), 1); geo.setAttribute('sway', amp);
      const P = positionLocal, ph = time.mul(0.9).add(P.x.mul(0.45)).add(P.z.mul(0.3)), yy = positionGeometry.y.mul(positionGeometry.y);
      const d = attribute('sway', 'float').mul(yy);
      mat.positionNode = P.add(vec3(sin(ph).mul(d), 0, cos(ph.mul(0.8)).mul(d).mul(0.6)));
    }
    geo.setAttribute('sy', new THREE.InstancedBufferAttribute(new Float32Array(max), 1));   // the local surface's height (three y)
    mat.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y));   // (the water between the weed and the eye: water3.js)
    const m = new THREE.InstancedMesh(geo, mat, max); m.count = 0; m.frustumCulled = false;
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
    group.add(m); return m;
  });
  const maxOf = meshes.map((m, f) => Math.min(INST_MAX, fineI.length * PER[FORMS3[f].form]));
  // the mussels: a flattened ellipsoid ~8 × 4 × 2.5 cm (an elliptio's shell), dark brown, half in the bed
  const MU_MAX = 40000, muGeo = new THREE.SphereGeometry(0.5, 8, 5);
  muGeo.setAttribute('sy', new THREE.InstancedBufferAttribute(new Float32Array(MU_MAX), 1));
  const muMat = new THREE.MeshStandardNodeMaterial({ roughness: 0.55, metalness: 0.1 });
  muMat.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y));
  const musMesh = new THREE.InstancedMesh(muGeo, muMat, MU_MAX); musMesh.count = 0; musMesh.frustumCulled = false;
  musMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MU_MAX * 3), 3);
  group.add(musMesh);
  const MU_COL = new THREE.Color(0x2e2618), MU_NEAR = 18;   // (m: shells drawn within this of where the camera looks)
  let mus = null;
  const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  let shoots = null, yf = 0, dirty = false, at = [1e9, 1e9, 1], dead = null;
  const fDead = FORMS3.findIndex(F => F.key === 'bulrush');   // (the dead stems borrow the bulrush's reed mesh)
  // new plant data: shoots (g DW/m²) per form per bed cell (NF3 × nb), at year-fraction yf; the bed's tint at once (every cell)
  function setData(arr, yf0, mu = null, dd = null) {
    if (arr.length !== NF3 * nb) return false;
    shoots = arr; yf = yf0; dirty = true; if (mu && mu.length === nb) mus = mu; dead = dd && dd.length === nb ? dd : null;
    for (let f = 0; f < NF3; f++) { const sub = arr.subarray(f * nb, (f + 1) * nb), o = f * nF; for (let t = 0; t < nF; t++) stand[o + t] = blend(sub, t) * patch[o + t]; }
    for (let t = 0; t < nF; t++) {
      let tint = 0; for (let f = 0; f < NF3; f++) { const F = FORMS3[f], b = stand[f * nF + t]; if (b > 0.3) tint += Math.min(1, b / F.Bmax) * TINT[F.form]; }
      cover[fineI[t]] = Math.min(1, tint);
    }
    return true;
  }
  // the stems about (tx, ty) for a camera dist m away: rebuilt on new data or when the view has moved on
  function update(tx, ty, dist) {
    if (!shoots) return;
    const R = Math.min(110, Math.max(25, dist * 0.9));
    if (!dirty && Math.hypot(tx - at[0], ty - at[1]) < R * 0.25 && Math.abs(Math.log(dist / at[2])) < 0.4) return;
    dirty = false; at = [tx, ty, dist];
    const R2s = R * R, R2f = Math.min(420, Math.max(60, dist * 2)) ** 2;
    // the season's colour: fresh in spring; from the autumn reallocation the shoots yellow and brown (evergreens stay green)
    const fresh = Math.max(0, 1 - Math.abs(yf - 0.22) / 0.08), brownT = Math.min(1, Math.max(0, (yf - PL3.YF_STORE) / 0.15)) * (yf < 0.97 ? 1 : 0);
    const cnt = new Int32Array(NF3);
    for (let t = 0; t < fineI.length; t++) {
      const i = fineI[t], [x0, y0] = GEO.cellCentre(i), r2 = (x0 - tx) ** 2 + (y0 - ty) ** 2;
      if (r2 > R2f) continue;
      const sY = surfY(x0, y0);
      for (let f = 0; f < NF3; f++) {
        const F = FORMS3[f], b = stand[f * nF + t]; if (!(b > 0.3)) continue;
        if (!F.window && r2 > R2s) continue;
        const cov = Math.min(1, b / F.Bmax), per = PER[F.form];
        const n = Math.min(per, Math.floor(cov * per + hash(i, f)), maxOf[f] - cnt[f]);
        const brown = F.carry > 0.8 ? brownT * 0.25 : brownT;
        for (let k = 0; k < n; k++) {
          const x = x0 + (hash(i, k * 7 + f) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 13 + f + 3) - 0.5) * GEO.CELL, rot = hash(i, k + 31 * f) * Math.PI * 2;
          const z = GEO.depthAt(x, y); if (!(z > 0.05)) continue;
          if (F.form === 'FL') {   // pads float on the surface, each species its size: water-lily 10–30 cm across, yellow pond-lily to ~40, watershield 5–13 (the sim keeps them out of the brook)
            const R0 = F.look && F.look.r ? F.look.r : [0.05, 0.15], r = R0[0] + (R0[1] - R0[0]) * hash(i, k + 5); p.set(x, sY + 0.03 + 0.004 * k, -y); s.set(r, 1, r); e.set(0, rot, 0);
          } else if (F.form === 'EM') {   // reeds from the bed through the surface (0.5–1.3 m above it)
            const above = 0.5 + 0.8 * hash(i, k + 9) * (0.4 + 0.6 * cov); p.set(x, sY - z - 0.05, -y); s.set(1, z + above, 1); e.set((hash(i, k + 17) - 0.5) * 0.12, rot, (hash(i, k + 19) - 0.5) * 0.12);
          } else {   // fronds and tufts on the bed: the canopy's height by its stand (never above the surface)
            const h = Math.min(z - 0.08, F.hFull * (F.form === 'SC' ? Math.max(0.12, cov) : 1) * (0.65 + 0.6 * hash(i, k + 11)));   // (rosettes and moss: low at any cover)
            if (!(h > 0.03)) continue;
            p.set(x, sY - z - 0.03, -y); s.set(1, h, 1); e.set((hash(i, k + 17) - 0.5) * 0.35, rot, (hash(i, k + 19) - 0.5) * 0.35);
          }
          q.setFromEuler(e); mat.compose(p, q, s); meshes[f].setMatrixAt(cnt[f], mat);
          if (SWAY[F.form] > 0) meshes[f].geometry.attributes.sway.array[cnt[f]] = SWAY[F.form] * s.y;
          meshes[f].geometry.attributes.sy.array[cnt[f]] = sY;
          c.setHex(F.look && F.look.col ? F.look.col : COL[F.form]).lerp(SPRING, fresh * 0.5).lerp(BROWN, brown).multiplyScalar(0.8 + 0.4 * hash(i, k + 23)); meshes[f].setColorAt(cnt[f], c);
          cnt[f]++;
        }
      }
      // LAST YEAR'S STEMS still standing (plants3 dead): straw-coloured reeds, leaning, a little shorter above the water
      const dv = dead && fDead >= 0 ? blend(dead, t) * patch[fDead * nF + t] : 0;
      if (dv > 1 && r2 <= R2f) {
        const m = meshes[fDead], n = Math.min(PER.EM, Math.floor(Math.min(1, dv / DEAD_FULL) * PER.EM + hash(i, 77)), maxOf[fDead] - cnt[fDead]);
        for (let k = 0; k < n; k++) {
          const x = x0 + (hash(i, k * 11 + 41) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 17 + 43) - 0.5) * GEO.CELL, z = GEO.depthAt(x, y); if (!(z > 0.05)) continue;
          const above = 0.3 + 0.6 * hash(i, k + 47); p.set(x, sY - z - 0.05, -y); s.set(1, z + above, 1); e.set((hash(i, k + 53) - 0.5) * 0.4, hash(i, k + 59) * Math.PI * 2, (hash(i, k + 61) - 0.5) * 0.4);
          q.setFromEuler(e); mat.compose(p, q, s); m.setMatrixAt(cnt[fDead], mat);
          if (SWAY.EM > 0) m.geometry.attributes.sway.array[cnt[fDead]] = SWAY.EM * s.y;
          m.geometry.attributes.sy.array[cnt[fDead]] = sY;
          c.copy(STRAW).multiplyScalar(0.75 + 0.45 * hash(i, k + 67)); m.setColorAt(cnt[fDead], c); cnt[fDead]++;
        }
      }
    }
    // THE MUSSELS near where the camera looks (closer than ~60 m): each 1.5-m cell's real number (/m² × 2.25 m²), at random
    // places and turns in it, half-buried, tilted a little
    let nm = 0;
    if (mus && dist < 60) {
      const R2 = MU_NEAR * MU_NEAR, M = musMesh.instanceMatrix.array, SY = muGeo.attributes.sy.array;
      for (let t = 0; t < fineI.length && nm < MU_MAX; t++) {
        const i = fineI[t], [x0, y0] = GEO.cellCentre(i); if ((x0 - tx) ** 2 + (y0 - ty) ** 2 > R2) continue;
        const n = Math.min(60 * PER_K, Math.floor(blend(mus, t) * GEO.CELL * GEO.CELL + hash(i, 99))), sY = surfY(x0, y0);
        for (let k = 0; k < n && nm < MU_MAX; k++) {
          const x = x0 + (hash(i, k * 5 + 101) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 9 + 103) - 0.5) * GEO.CELL, z = GEO.depthAt(x, y); if (!(z > 0.1)) continue;
          const sz = 0.75 + 0.5 * hash(i, k + 107);
          p.set(x, sY - z + 0.004, -y); s.set(0.08 * sz, 0.025 * sz, 0.04 * sz); e.set((hash(i, k + 109) - 0.5) * 0.5, hash(i, k + 113) * Math.PI * 2, (hash(i, k + 127) - 0.5) * 0.9);
          q.setFromEuler(e); mat.compose(p, q, s); musMesh.setMatrixAt(nm, mat); SY[nm] = sY;
          c.copy(MU_COL).multiplyScalar(0.7 + 0.6 * hash(i, k + 131)); musMesh.setColorAt(nm, c); nm++;
        }
      }
    }
    musMesh.count = nm;
    if (nm) for (const [buf, k] of [[musMesh.instanceMatrix, 16], [musMesh.instanceColor, 3], [muGeo.attributes.sy, 1]]) { buf.clearUpdateRanges(); buf.addUpdateRange(0, nm * k); buf.needsUpdate = true; }
    // (static buffers, sent only on a rebuild and only their used part: a dynamic one would be re-sent whole every frame)
    for (let f = 0; f < NF3; f++) {
      const m = meshes[f], n = cnt[f]; m.count = n;
      for (const [buf, k] of [[m.instanceMatrix, 16], [m.instanceColor, 3], [m.geometry.attributes.sway, 1], [m.geometry.attributes.sy, 1]]) if (buf && n) { buf.clearUpdateRanges(); buf.addUpdateRange(0, n * k); buf.needsUpdate = true; }
    }
  }
  // the stems sit on their own layer (LAYER), which the water's reflection camera leaves out (main3): they would cost a second
  // draw for pads and reed tips that are barely seen in a ripple
  for (const m of meshes) m.layers.set(LAYER); musMesh.layers.set(LAYER);
  return { group, setData, update, cover, nb, fine: fineI, fineB, blend };
}
