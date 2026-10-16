// bed3view.js — the small animals of the lake bed on screen (browser layer): the CRAYFISH and the SNAILS. The sim keeps them as
// biomass per bed cell (src/w3/littoral3.js: virile crayfish, adults and the year's young, by the shelter of the bed — rock in
// the wave-washed shallows, the weeds, mud — and the soft-water snails on the weeds and the lit bed); every few seconds
// render3/sim3worker.js sends, per bed cell, the crayfish OUT on the bed now (Littoral3.shown: out foraging by night far more
// than by day, none in water under 5 °C, the weeds' stems hiding some — the rest are in burrows and under stones) and the
// snails, per m². Here each 1.5-m cell near where the camera looks gets its real number of each (/m² × 2.25 m²) at hashed places:
// crayfish walk slowly about where they are, claws forward, the year's young at their size; snails sit on the bed. The human
// (2026-10-16): "do you have snails and crawfish too? those are in there". Cosmetic scatter and motion use a hash and the
// frame clock (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { LIT3 } from '../littoral3.js';
import { waterOut } from './water3.js';
import { LAYER } from './plants3view.js';
const { attribute, positionWorld } = THREE.TSL;

const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
const hash = (i, k) => { let h = Math.imul(i, 374761393) + Math.imul(k, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const CR_MAX = 4000, SN_MAX = 12000;
const CR_NEAR = 16, CRY_NEAR = 9, SN_NEAR = 7;     // m about where the camera looks: adults, the young crayfish, the snails
const CR_LEN = 0.085;                              // m: a 12-g adult virile crayfish, rostrum to tail fan (carapace ~4 cm)
const CR_COL = new THREE.Color(0x74502e), SN_COL = new THREE.Color(0x5e4c33);   // (virile crayfish: olive to rusty brown)

// one mesh of several ellipsoids [scale x, y, z, at x, y, z] (a crayfish: forward is +x, the bed at y = 0, length 1)
function blobs(parts) {
  const P = [], N = [], I = []; let base = 0;
  for (const [sx, sy, sz, x, y, z] of parts) {
    const g = new THREE.SphereGeometry(1, 8, 5); g.scale(sx, sy, sz); g.translate(x, y, z);
    const p = g.attributes.position.array, n = g.attributes.normal.array, ix = g.index.array;
    for (let k = 0; k < p.length; k++) { P.push(p[k]); N.push(n[k]); }
    for (let k = 0; k < ix.length; k++) I.push(ix[k] + base);
    base += p.length / 3; g.dispose();
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setIndex(I);
  return g;
}
const crayGeo = () => blobs([
  [0.22, 0.09, 0.12, 0.10, 0.08, 0],        // the carapace
  [0.24, 0.065, 0.09, -0.22, 0.06, 0],      // the abdomen
  [0.07, 0.02, 0.11, -0.45, 0.035, 0],      // the tail fan
  [0.09, 0.025, 0.025, 0.32, 0.06, 0.09], [0.09, 0.025, 0.025, 0.32, 0.06, -0.09],   // the arms
  [0.15, 0.035, 0.055, 0.50, 0.06, 0.12], [0.15, 0.035, 0.055, 0.50, 0.06, -0.12],   // the claws
]);

function instanced(geo, max, rough) {
  geo.setAttribute('sy', new THREE.InstancedBufferAttribute(new Float32Array(max), 1));   // the local surface's height (three y)
  const mat = new THREE.MeshStandardNodeMaterial({ roughness: rough, metalness: 0 });
  mat.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y));   // (the water between it and the eye: water3.js)
  const m = new THREE.InstancedMesh(geo, mat, max); m.count = 0; m.frustumCulled = false;
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3); m.layers.set(LAYER);
  return m;
}

// plantsView: its per-1.5-m-cell map onto the water model's bed cells (fine, fineB)
export function makeBedView(plantsView) {
  const group = new THREE.Group(), fineI = plantsView.fine, fineB = plantsView.fineB, nb = plantsView.nb;
  const cray = instanced(crayGeo(), CR_MAX, 0.6), snail = instanced(new THREE.SphereGeometry(0.5, 6, 5), SN_MAX, 0.5);
  group.add(cray, snail);
  let bed = null, wY = 1, dirty = false, at = [1e9, 1e9, 1];
  const C = [];   // the crayfish drawn: {bx, by, L, ph, ph2, R, w}
  const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  // new data: per bed cell [adult crayfish out /m², young crayfish out /m², snails /m²], the young crayfish's mass (g)
  function setData(arr, w) { if (!arr || arr.length !== nb * 3) return; bed = arr; wY = w || 1; dirty = true; }
  // which animals near (tx, ty): rebuilt on new data or when the view has moved on
  function rebuild(tx, ty, dist) {
    dirty = false; at = [tx, ty, dist]; C.length = 0;
    let ns = 0; const SY = snail.geometry.attributes.sy.array;
    if (bed && dist < 60) {
      const R2 = CR_NEAR * CR_NEAR, Ly = CR_LEN * Math.cbrt(Math.min(1, wY / LIT3.CR_WA)), near = (x, y, r) => (x - tx) ** 2 + (y - ty) ** 2 <= r * r;
      for (let t = 0; t < fineI.length; t++) {
        const i = fineI[t], ib = fineB[t], [x0, y0] = GEO.cellCentre(i); if ((x0 - tx) ** 2 + (y0 - ty) ** 2 > R2) continue;
        const A = GEO.CELL * GEO.CELL, nA = Math.min(12, Math.floor(bed[ib * 3] * A + hash(i, 201))), nY = near(x0, y0, CRY_NEAR) ? Math.min(20, Math.floor(bed[ib * 3 + 1] * A + hash(i, 203))) : 0;
        for (let k = 0; k < nA + nY && C.length < CR_MAX; k++) {
          const x = x0 + (hash(i, k * 3 + 211) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 3 + 213) - 0.5) * GEO.CELL; if (!(GEO.depthAt(x, y) > 0.08)) continue;
          C.push({ bx: x, by: y, L: k < nA ? CR_LEN * (0.75 + 0.4 * hash(i, k + 221)) : Ly * (0.8 + 0.4 * hash(i, k + 223)), ph: hash(i, k + 227) * 6.28, ph2: hash(i, k + 229) * 6.28,
            R: 0.12 + 0.3 * hash(i, k + 231), w: 0.04 + 0.05 * hash(i, k + 233), tint: 0.7 + 0.6 * hash(i, k + 237) });
        }
        if (dist < 30 && near(x0, y0, SN_NEAR)) {   // the snails: ~5–50 a m² in the weeds, a few on bare lit bed
          const n = Math.min(60, Math.floor(bed[ib * 3 + 2] * A + hash(i, 241))), sY = surfY(x0, y0);
          for (let k = 0; k < n && ns < SN_MAX; k++) {
            const x = x0 + (hash(i, k * 5 + 251) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 5 + 253) - 0.5) * GEO.CELL, z = GEO.depthAt(x, y); if (!(z > 0.08)) continue;
            const sz = 0.006 + 0.006 * hash(i, k + 257);
            p.set(x, sY - z + sz * 0.35, -y); s.set(sz, sz * 1.25, sz * 0.8); e.set((hash(i, k + 259) - 0.5) * 0.8, hash(i, k + 261) * 6.28, 0.5 + 0.4 * hash(i, k + 263));
            q.setFromEuler(e); mat.compose(p, q, s); snail.setMatrixAt(ns, mat); SY[ns] = sY;
            c.copy(SN_COL).multiplyScalar(0.7 + 0.6 * hash(i, k + 267)); snail.setColorAt(ns, c); ns++;
          }
        }
      }
    }
    snail.count = ns;
    if (ns) for (const [buf, k] of [[snail.instanceMatrix, 16], [snail.instanceColor, 3], [snail.geometry.attributes.sy, 1]]) { buf.clearUpdateRanges(); buf.addUpdateRange(0, ns * k); buf.needsUpdate = true; }
    const CC = cray.instanceColor.array;
    for (let k = 0; k < C.length; k++) { c.copy(CR_COL).multiplyScalar(C[k].tint); CC[k * 3] = c.r; CC[k * 3 + 1] = c.g; CC[k * 3 + 2] = c.b; }
    if (C.length) { cray.instanceColor.clearUpdateRanges(); cray.instanceColor.addUpdateRange(0, C.length * 3); cray.instanceColor.needsUpdate = true; }
  }
  // each frame: the crayfish walk — a slow wander about where each is (2–5 cm/s, pausing as the two phases drift apart), facing
  // the way it goes, on the bed
  function update(t, tx, ty, dist) {
    if (dirty || Math.hypot(tx - at[0], ty - at[1]) > 4 || Math.abs(Math.log(dist / at[2])) > 0.4) rebuild(tx, ty, dist);
    const SY = cray.geometry.attributes.sy.array;
    let n = 0;
    for (const k of C) {
      const a = t * k.w + k.ph, b = t * k.w * 1.37 + k.ph2, go = 0.5 + 0.5 * Math.sin(t * 0.11 + k.ph * 3);   // (go: walking or still)
      const x = k.bx + k.R * Math.sin(a) * go, y = k.by + k.R * Math.sin(b) * go;
      const vx = Math.cos(a), vy = 1.37 * Math.cos(b), z = GEO.depthAt(x, y); if (!(z > 0.05)) continue;
      const sY = surfY(x, y);
      p.set(x, sY - z, -y); e.set(0, Math.atan2(vy, vx), 0); s.set(k.L, k.L, k.L);   // (local +x forward → (cos, sin) in the sim's x, y)
      q.setFromEuler(e); mat.compose(p, q, s); cray.setMatrixAt(n, mat); SY[n] = sY; n++;
    }
    cray.count = n;
    if (n) for (const [buf, k] of [[cray.instanceMatrix, 16], [cray.geometry.attributes.sy, 1]]) { buf.clearUpdateRanges(); buf.addUpdateRange(0, n * k); buf.needsUpdate = true; }
  }
  return { group, setData, update, stats: () => ({ crayfish: cray.count, snails: snail.count, wY }) };
}
