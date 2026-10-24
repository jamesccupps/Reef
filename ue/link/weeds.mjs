// weeds.mjs — THE LAKES' WATER PLANTS FOR UNREAL (Node, the live host's side): the sim's plants (src/w3/plants3.js: the shoots, g DW/m²,
// per growth form per bed cell of the water model — 50-m columns in 0.5-m layers — as render3/sim3worker.js posts them every few
// seconds) laid on the lake bed as the browser's render3/plants3view.js lays them: each 5-m water cell of the geometry takes its
// stand from the water-model columns about it by nearness (bilinear between their centres, at its own depth between their layers with
// bed), so the beds fade from square to square and follow the bed's contours; then clumped by a smooth random field about 1 on
// average (each form reading it shifted, so the forms clump apart). Only the cells near the walker are packed for Unreal
// (AHotBrookWeeds), "HBP1" (little-endian): f32 yf; u32 nForms, u32 nCells; u32 the keys' length + the forms' keys (ASCII, comma-
// separated, FORMS3 order); then per cell f32 x, y (the sim's metres), depth (m), u8 × nForms each form's stand over its Bmax (×255),
// u8 the mussels (/m² ×10), u8 last year's standing stems (g/m² over 60, ×255), padded to 4 bytes.
// (The code below follows plants3view.js's makePlantsView — kept in step with it: the same weights, the same clump field.)
globalThis.HB_WORLD = 'true';
const { GEO, LAND, BROOK } = await import('../../src/w3/geometry.js');
const { buildColumns3, Env3 } = await import('../../src/w3/env3.js');
const { FORMS3, NF3 } = await import('../../src/w3/plants3.js');

const hash = (i, k) => { let h = Math.imul(i, 374761393) + Math.imul(k, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v;
}

export function makeWeeds() {
  const W3 = { G: buildColumns3() }; W3.colAt = Env3.prototype.colAt;
  const G = W3.G;
  const bedIdx = new Int32Array(G.NCELL).fill(-1); let nb = 0; for (let j = 0; j < G.NCELL; j++) if (G.bedA[j] > 0) bedIdx[j] = nb++;
  const fi = [], fb = [];
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] === LAND || GEO.depth[i] <= 0.05) continue;
    const [x, y] = GEO.cellCentre(i), c = W3.colAt(x, y); if (c < 0) continue;
    const j0 = G.cell0[c], n = G.nL[c], k = Math.min(n - 1, Math.floor(GEO.depth[i] / G.DZ)); let ib = -1;
    for (let d = 0; d < n && ib < 0; d++) for (const kk of [k - d, k + d]) if (kk >= 0 && kk < n && bedIdx[j0 + kk] >= 0) { ib = bedIdx[j0 + kk]; break; }
    if (ib >= 0) { fi.push(i); fb.push(ib); }
  }
  const fineI = Int32Array.from(fi), fineB = Int32Array.from(fb), nF = fineI.length;
  const FX = new Float32Array(nF), FY = new Float32Array(nF); for (let t = 0; t < nF; t++) { const c = GEO.cellCentre(fineI[t]); FX[t] = c[0]; FY[t] = c[1]; }
  const NW = 8, DZ_FIT = 0.5, WB = new Int32Array(nF * NW).fill(-1), WW = new Float32Array(nF * NW);
  let wq = 0, wo = 0, wd = 0, wb = 0;
  const put = (ib, w) => { if (w > 1e-4 && wq < NW) { WB[wo + wq] = ib; WW[wo + wq] = w; wq++; } };
  const col = (c, w) => {
    const j0 = G.cell0[c], n = G.nL[c]; let lo = -1, hi = -1;
    for (let k = 0; k < n; k++) { if (bedIdx[j0 + k] < 0) continue; if (G.zMid[j0 + k] <= wd) lo = k; else { hi = k; break; } }
    if (lo >= 0 && hi >= 0) { const za = G.zMid[j0 + lo], f = (wd - za) / (G.zMid[j0 + hi] - za); put(bedIdx[j0 + lo], w * (1 - f)); put(bedIdx[j0 + hi], w * f); }
    else if (lo >= 0 || hi >= 0) { const k = lo >= 0 ? lo : hi, dz = (wd - G.zMid[j0 + k]) / DZ_FIT; put(bedIdx[j0 + k], w * Math.exp(-dz * dz)); }
  };
  const corner = (X, Y, w) => { if (!(w > 0) || X < 0 || Y < 0 || X >= G.CX || Y >= G.CY) return; const c = G.gridCol[Y * G.CX + X]; if (c >= 0 && G.body[c] === wb) col(c, w); };
  for (let t = 0; t < nF; t++) {
    const i = fineI[t], x = FX[t], y = FY[t]; wb = GEO.body[i]; wd = GEO.depth[i]; wo = t * NW; wq = 0;
    if (G.ownBrook && wb === BROOK) col(G.colOfFine[i], 1);
    else {
      const u = (x - G.X0) / G.COL - 0.5, v = (y - G.Y0) / G.COL - 0.5, gx = Math.floor(u), gy = Math.floor(v), fu = u - gx, fv = v - gy;
      corner(gx, gy, (1 - fu) * (1 - fv)); corner(gx + 1, gy, fu * (1 - fv)); corner(gx, gy + 1, (1 - fu) * fv); corner(gx + 1, gy + 1, fu * fv);
    }
    let sw = 0; for (let r = 0; r < wq; r++) sw += WW[wo + r];
    if (!(sw > 1e-6)) { WB[wo] = fineB[t]; WW[wo] = 1; WB[wo + 1] = -1; wq = 1; sw = 1; }
    for (let r = 0; r < wq; r++) WW[wo + r] /= sw;
  }
  const blend = (arr, t, off = 0) => { let s = 0; for (let r = t * NW, e = r + NW; r < e && WB[r] >= 0; r++) s += WW[r] * arr[off + WB[r]]; return s; };
  // the clumps: one field over the cell grid, each form shifted by its own whole number of cells (7 and 11 a form)
  const PATCH_L = Math.max(9 * GEO.SCALE, 3 * GEO.CELL), PX = GEO.NX + 7 * NF3;
  const patchAt = (t, f) => {
    const i = fineI[t], c = i % GEO.NX + 7 * f, r = (i - (i % GEO.NX)) / GEO.NX + 11 * f;
    const X = (GEO.X0 + (c + 0.5) * GEO.CELL) / PATCH_L, Y = (GEO.Y0 + (r + 0.5) * GEO.CELL) / PATCH_L;
    const n = 0.65 * vnoise(X, Y) + 0.35 * vnoise(X * 2.7 + 5.5, Y * 2.7 + 9.5);
    return 2 * Math.min(1, Math.max(0, (n - 0.3) / 0.4));
  };
  const KEYS = Buffer.from(FORMS3.map(F => F.key).join(','), 'ascii');
  const REC = Math.ceil((12 + NF3 + 2) / 4) * 4;
  console.log(`weeds: ${nF} water cells over ${nb} bed cells, ${NF3} forms`);
  return {
    nb,
    // each form's densest cell over both lakes (a look's aim: the host logs them once)
    best(m) {
      const out = {}; if (!m.shoots || m.shoots.length !== NF3 * nb) return out;
      for (let f = 0; f < NF3; f++) { let bv = 0, bt = -1; for (let t = 0; t < nF; t += 3) { const v = blend(m.shoots, t, f * nb); if (v > bv) { bv = v; bt = t; } } if (bt >= 0) out[FORMS3[f].key] = [Math.round(FX[bt]), Math.round(FY[bt]), +(bv / FORMS3[f].Bmax).toFixed(2)]; }
      return out;
    },
    // the cells within R m of (cx, cy), packed for Unreal — or null when the plant data doesn't fit the bed
    pack(m, cx, cy, R = 150) {
      const shoots = m.shoots; if (!shoots || shoots.length !== NF3 * nb) return null;
      const near = []; const R2 = R * R;
      for (let t = 0; t < nF; t++) { const dx = FX[t] - cx, dy = FY[t] - cy; if (dx * dx + dy * dy <= R2) near.push(t); }
      const head = 4 + 4 + 8 + 4 + KEYS.length, pad = (4 - head % 4) % 4, buf = Buffer.alloc(head + pad + near.length * REC);
      let o = 0; buf.write('HBP1', o, 'ascii'); o += 4; buf.writeFloatLE(m.yf || 0, o); o += 4; buf.writeUInt32LE(NF3, o); o += 4; buf.writeUInt32LE(near.length, o); o += 4;
      buf.writeUInt32LE(KEYS.length, o); o += 4; KEYS.copy(buf, o); o += KEYS.length + pad;
      for (const t of near) {
        buf.writeFloatLE(FX[t], o); buf.writeFloatLE(FY[t], o + 4); buf.writeFloatLE(GEO.depth[fineI[t]], o + 8);
        for (let f = 0; f < NF3; f++) { const b = blend(shoots, t, f * nb) * patchAt(t, f); buf[o + 12 + f] = Math.max(0, Math.min(255, Math.round(b / FORMS3[f].Bmax * 255))); }
        buf[o + 12 + NF3] = m.mus && m.mus.length === nb ? Math.min(255, Math.round(blend(m.mus, t) * 10)) : 0;
        buf[o + 13 + NF3] = m.dead && m.dead.length === nb ? Math.min(255, Math.round(blend(m.dead, t) / 60 * 255)) : 0;
        o += REC;
      }
      return buf;
    },
  };
}
