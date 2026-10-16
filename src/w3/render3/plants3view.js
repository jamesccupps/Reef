// plants3view.js — the weeds of the 3-D lakes on screen (browser layer). The plants are a field on the bed (src/w3/plants3.js:
// shoots per bed cell of the water model and growth form, sent by render3/sim3worker.js every few seconds); here each 1.5-m
// cell of the lake bed gets instances of the forms its water-model cell holds, in proportion to their stands — fronds for the
// submerged canopy (as tall as the canopy), lily pads on the surface, reeds standing out of the water, low tufts for the
// rosettes and the deep meadow — fresh green in spring, browning in autumn as the shoots die back (the evergreen rosettes and
// mosses stay green). Stems are drawn only near where the camera looks (the submerged forms within about the camera's
// distance, the pads and reeds on the surface twice as far) and rebuilt when new plant data arrives or the view moves on;
// farther off, each bed cell's weed cover tints the bed (main3), where single stems would be smaller than a pixel anyway.
// Cosmetic scatter uses a hash (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER, LAND } from '../geometry.js';
import { FORMS3, NF3, PL3 } from '../plants3.js';
import { waterOut } from './water3.js';
const { attribute, positionLocal, positionGeometry, positionWorld, sin, cos, time, vec3 } = THREE.TSL;

const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
const PER = { EM: 5, FL: 6, SC: 3, IS: 3, DM: 3 };          // instances per 1.5-m cell at a full stand
const TINT = { EM: 0.5, FL: 0.15, SC: 1, IS: 0.5, DM: 0.7 };  // how much each form's stand colours the bed seen from afar
const COL = { EM: 0x6f8a3a, FL: 0x3f7434, SC: 0x4f6b2c, IS: 0x5f7a44, DM: 0x2c4630 };
const SPRING = new THREE.Color(0x8fb04a), BROWN = new THREE.Color(0x7d6a38);
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
const GEOM = {
  EM: () => tuft(6, 0.03, 0.006, 0.12, 2, 1.6),     // reeds and pickerelweed: thin stiff stems
  FL: pad,
  SC: () => tuft(5, 0.09, 0.045, 0.38, 3, 1.3),     // pondweeds: ribbon fronds that lean and sway
  IS: () => tuft(8, 0.03, 0.005, 0.10, 1, 1),       // rosettes: short stiff spikes in a ring
  DM: () => tuft(6, 0.10, 0.06, 0.18, 1, 1),        // Nitella and moss: a low bushy tuft
};
const SWAY = { EM: 0.03, FL: 0, SC: 0.16, IS: 0.005, DM: 0.03 };   // m of sway at a 1-m plant's tip (× its height)

// a cheap hash for each cell's scatter (cosmetic)
const hash = (i, k) => { let h = Math.imul(i, 374761393) + Math.imul(k, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
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
  const fineI = Int32Array.from(fi), fineB = Int32Array.from(fb);
  const cover = new Float32Array(GEO.N);   // per 1.5-m cell: the weeds' tint of the bed, 0–1
  const meshes = FORMS3.map(F => {
    const max = fineI.length * PER[F.key];
    const mat = new THREE.MeshStandardNodeMaterial({ roughness: F.key === 'FL' ? 0.45 : 0.85, metalness: 0, side: THREE.DoubleSide });
    const geo = GEOM[F.key]();
    if (SWAY[F.key] > 0) {   // the stems sway in the water's slow surge: more toward the tip, a wave passing across the bed
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
  const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  let shoots = null, yf = 0, dirty = false, at = [1e9, 1e9, 1];
  // new plant data: shoots (g DW/m²) per form per bed cell (NF3 × nb), at year-fraction yf; the bed's tint at once (every cell)
  function setData(arr, yf0) {
    if (arr.length !== NF3 * nb) return false;
    shoots = arr; yf = yf0; dirty = true;
    for (let t = 0; t < fineI.length; t++) {
      let tint = 0; for (let f = 0; f < NF3; f++) { const F = FORMS3[f], b = arr[f * nb + fineB[t]]; if (b > 0.3) tint += Math.min(1, b / F.Bmax) * TINT[F.key]; }
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
      const i = fineI[t], ib = fineB[t], [x0, y0] = GEO.cellCentre(i), r2 = (x0 - tx) ** 2 + (y0 - ty) ** 2;
      if (r2 > R2f) continue;
      const sY = surfY(x0, y0);
      for (let f = 0; f < NF3; f++) {
        const F = FORMS3[f], b = shoots[f * nb + ib]; if (!(b > 0.3)) continue;
        if (!F.window && r2 > R2s) continue;
        const cov = Math.min(1, b / F.Bmax), per = PER[F.key];
        const n = Math.min(per, Math.floor(cov * per + hash(i, f)));
        const brown = F.carry > 0.8 ? brownT * 0.25 : brownT;
        for (let k = 0; k < n; k++) {
          const x = x0 + (hash(i, k * 7 + f) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 13 + f + 3) - 0.5) * GEO.CELL, rot = hash(i, k + 31 * f) * Math.PI * 2;
          const z = GEO.depthAt(x, y); if (!(z > 0.05)) continue;
          if (F.key === 'FL') {   // pads float on the surface (a stand of overlapping pads, ~0.3–0.6 m across)
            const r = 0.16 + 0.16 * hash(i, k + 5); p.set(x, sY + 0.03 + 0.004 * k, -y); s.set(r, 1, r); e.set(0, rot, 0);
          } else if (F.key === 'EM') {   // reeds from the bed through the surface (0.5–1.3 m above it)
            const above = 0.5 + 0.8 * hash(i, k + 9) * (0.4 + 0.6 * cov); p.set(x, sY - z - 0.05, -y); s.set(1, z + above, 1); e.set((hash(i, k + 17) - 0.5) * 0.12, rot, (hash(i, k + 19) - 0.5) * 0.12);
          } else {   // fronds and tufts on the bed: the canopy's height by its stand (never above the surface)
            const h = Math.min(z - 0.08, F.hFull * (F.key === 'SC' ? Math.max(0.12, cov) : 1) * (0.65 + 0.6 * hash(i, k + 11)));   // (rosettes and moss: low at any cover)
            if (!(h > 0.03)) continue;
            p.set(x, sY - z - 0.03, -y); s.set(1, h, 1); e.set((hash(i, k + 17) - 0.5) * 0.35, rot, (hash(i, k + 19) - 0.5) * 0.35);
          }
          q.setFromEuler(e); mat.compose(p, q, s); meshes[f].setMatrixAt(cnt[f], mat);
          if (SWAY[F.key] > 0) meshes[f].geometry.attributes.sway.array[cnt[f]] = SWAY[F.key] * s.y;
          meshes[f].geometry.attributes.sy.array[cnt[f]] = sY;
          c.setHex(COL[F.key]).lerp(SPRING, fresh * 0.5).lerp(BROWN, brown).multiplyScalar(0.8 + 0.4 * hash(i, k + 23)); meshes[f].setColorAt(cnt[f], c);
          cnt[f]++;
        }
      }
    }
    // (static buffers, sent only on a rebuild and only their used part: a dynamic one would be re-sent whole every frame)
    for (let f = 0; f < NF3; f++) {
      const m = meshes[f], n = cnt[f]; m.count = n;
      for (const [buf, k] of [[m.instanceMatrix, 16], [m.instanceColor, 3], [m.geometry.attributes.sway, 1], [m.geometry.attributes.sy, 1]]) if (buf && n) { buf.clearUpdateRanges(); buf.addUpdateRange(0, n * k); buf.needsUpdate = true; }
    }
  }
  // the stems sit on their own layer (LAYER), which the water's reflection camera leaves out (main3): they would cost a second
  // draw for pads and reed tips that are barely seen in a ripple
  for (const m of meshes) m.layers.set(LAYER);
  return { group, setData, update, cover, nb, fine: fineI };
}
