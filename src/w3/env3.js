// env3.js — the 3-D lakes' water (pure: no DOM; Node and browser). Stage 3, slice 1: the water columns, temperature, ice and
// the water's movement. docs/HOT_BROOK_3D.md §3; research: docs/research_notes/Whole lake 3D fish simulation/
// shallow_lake_3d_physics.md.
//
// GRID. Columns of COL × COL m (world; 50 m real) over the 1/10 lakes, each a stack of DZ-m layers down to its bed. Built
// from the 1.5-m geometry grid, so every layer cell has its TRUE water volume and bed area (a column's bed slopes within it),
// and every pair of neighbouring columns its true shared face per layer (the brook's 4-m channel included).
//
// CLOCKS (clock3.js): REAL TIME — a sim second is a real second; every rate is per real second (the 2-D sim's calibrated
// per-second rates × TS = PER2D), so a step of any length integrates the same rates (the fidelity ladder). Until stage R2
// step 5 the day–night cycle keeps the 1-hour year's length (DAY_LEN, 12.2 calendar days), and the constants still calibrated
// on that clock are marked "compat" (÷ OLD_S).
//
// TRANSPORT (finite volume, conservative, volume-preserving): per layer at every face a horizontal volume flux — the wind's
// depth-averaged circulation (two precomputed fields, linear in wind stress), a surface drift with its bottom return, and the
// inflow → Upper → brook → Lower → outlet through-flow — with the vertical fluxes that continuity requires; upwind,
// sub-stepped for stability. Horizontal mixing at the grid scale; the night thermal siphon and its under-ice cousin as
// closed exchange loops; vertical mixing in each column's wind/convection-mixed layer.
import { GEO, LAND, UPPER, LOWER, BROOK, cellIndex } from './geometry.js';
import { ENV, ICE, THERMAL, WIND, SEASON, WEATHER3, seasonalTemp } from '../config.js';
import { rand, clamp } from '../core.js';

import { CLOCK3, TS, REAL_S, DAY3, OLD_S } from './clock3.js';
import { Chem3 } from './chem3.js';
import { Plants3, PL3 } from './plants3.js';
import { Littoral3 } from './littoral3.js';
export { CLOCK3, TS, REAL_S, DAY3 };
export const H3 = {
  COL: 50 * GEO.SCALE,  // m (world) column side — 50 m real (5 at 1/10)
  DZ: 0.5,              // m layer thickness
  REAL: 1 / GEO.SCALE,  // real metres per world metre, horizontally (10: the lakes at 1/10; 1 at true scale — TRUE_SCALE.md)
  // the wind's depth-averaged circulation: two counter-rotating gyres, downwind over the shallows and upwind over the deep axis;
  // its strength set so the area-weighted RMS current is CIRC_RMS at 5 m/s wind (small shallow lakes: 1–10 cm/s)
  CIRC_RMS: 0.02,       // m/s real at 5 m/s wind
  DRIFT: 0.012,         // the top layer's mean drift as a fraction of the wind speed (the surface's 2.5–4 % fades within tens of cm;
                        //   averaged over the top 0.5 m ~1–1.5 %), returning below
  WIND_MS: [2.5, 4.0, 6.5, 10.0],   // m/s real wind per weather state (clear → storm)
  K_H: 3.6e-4 * Math.pow(50, 1.07), // m²/s real horizontal mixing at the 50-m cell scale (Lawrence et al. 1995: 3.6e-4 L^1.07)
  // the night thermal siphon (Doda et al. 2022, Rotsee): on calm nights the cooler shallows' water runs down the slope
  // (~0.9 cm/s, peaks 2.6) with a surface return; the wind stops it above ~5 m/s
  SIPHON_V: 0.009, SIPHON_DT: 0.3, SIPHON_WIND: 5,
  ICE_SLOPE_V: 0.003,   // m/s: under ice the bed's heat drives a down-slope current of a few mm/s (Malm et al. 1997)
  ICE_CHILL: 0.1,       // /s (2-D clock): the water touching the ice relaxes toward 0 °C
  BED_HEAT: 0.03,       // /s (2-D clock) per unit bed-area-per-0.5-m-of-water: the bed's stored heat warms the water over it toward 4 °C
  // through-flow: water residence ~100 days in Upper, ~55 in Lower (hot_brook_lake_records: watersheds 66 / 77 km²)
  RES_UPPER_D: 100, RES_LOWER_D: 55,
  MIX_RATE: 1 / 1800,   // /s: mixing inside the wind- or convection-mixed layer — an e-fold of 30 min: convective velocities
                        //   of 1–50 mm/s turn a few metres over in ~15–90 min (Bouffard & Wüest 2019; shallow_lake_3d_physics
                        //   §2); windrows mix within 5–10 min
  BROOK_SEG: 20,        // m real: the brook's own columns' length along it (TRUE SCALE: buildColumns3)
  MAX_SUB: 24,          // transport sub-steps at most per update (beyond it gales would slow the wind-driven currents: not
                        //   reached at water steps ≤ ~30 min — stage R2; at 4 the 1-hour year throttled every wet spell)
  THRU_EVERY: 3,        // the through-flow runs every this-many updates (with as many steps' worth)
  K_STRAT: 0.02 / OLD_S, // /s: exchange between adjacent layers below the mixed layer and under ice (compat: ~5 days per
                           //   layer; R2 step 4: Kz / DZ²)
  DIEL_SKIN: THERMAL.DIEL_M, // m: e-folding depth of the day's heating (a shallow mixed layer swings more)
  WEATHER_DWELL_MUL: 1 / TS, // the weather's dwell times are sim seconds on the 2-D clock
  // first ice: sheltered coves skim over on a calm cold night while the wind keeps the open water stirred and open — an exposed
  // column's surface must be this many °C per m/s of wind colder than FORM_T before ice can start (× its exposure: the share of
  // the 8 directions with no land within the plants' SHELTER_R)
  ICE_WIND: 0.12,
  ICE_GONE: 0.03,       // m: (E10a, WEATHER3.HYDRO) the lake-wide ice thickness below which its cover can melt
  // THE SKY'S LIGHT in lux, what the fish see by (research realtime_foraging.md §1.2, §9.1): LUX_NOON at a clear summer noon (the
  // light fields' 1); TWILIGHT after sunset and before sunrise — TWI_LUX at the sun's edge, falling TWI_DEC decades an hour
  // (civil twilight's end ~3.4 lx ~35 min after sunset, nautical ~0.008 lx at ~80 min, at Maine's latitude in summer) — to a
  // starlit night's NIGHT_LUX
  LUX_NOON: 100000, TWI_LUX: 500, TWI_DEC: 3.7, NIGHT_LUX: 0.002,
};
const DAY = 86400;
// (E9b) the share of the time the weather chain (_weather) spends in each sky state: its transitions' stationary distribution × each
// state's mean dwell (ENV.WEATHER_DWELL: spells of 2–5 days, so a 1,752-s step's rounding is < 1 %) — each month's expected
// precipitation its normal (a century's realised total within ~5 %: the spells' own variability)
function weatherShares() {
  const T = WEATHER3.SYN ? WEATHER3.CHAIN : [[0.6, 0.4, 0, 0], [0.4, 0.15, 0.45, 0], [0, 0.45, 0.2, 0.35], [0, 0, 0.7, 0.3]];
  let pi = [0.25, 0.25, 0.25, 0.25]; for (let it = 0; it < 500; it++) { const q = [0, 0, 0, 0]; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) q[b] += pi[a] * T[a][b]; pi = q; }
  const w = pi.map((v, k) => v * dwell(k)), t = w.reduce((a, b) => a + b, 0); return w.map(v => v / t);
}
const dwell = k => WEATHER3.SYN ? WEATHER3.DWELL[k] * DAY : ENV.WEATHER_DWELL[k] * H3.WEATHER_DWELL_MUL;   // (a sky state's mean spell, s; E9d's fronts)
const expm = x => -Math.expm1(-x);   // 1 − e^(−x): the share a first-order process completes over a step (exact at any dt)

const daylight = (t, dayFrac) => { const x = (t - (0.5 - dayFrac / 2)) / dayFrac; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); };
function seasonalSun(yf) {
  const s = 0.5 + 0.5 * Math.cos(2 * Math.PI * (yf - SEASON.SOLSTICE));
  return { dayFrac: SEASON.DAY_FRAC[0] + (SEASON.DAY_FRAC[1] - SEASON.DAY_FRAC[0]) * s, noon: SEASON.NOON[0] + (SEASON.NOON[1] - SEASON.NOON[0]) * s };
}

// ============================================================ the column grid (static, from the geometry) =============
export function buildColumns3(COL = H3.COL, DZ = H3.DZ) {
  const { NX, NY, CELL, X0, Y0 } = GEO;
  const CX = Math.ceil(NX * CELL / COL), CY = Math.ceil(NY * CELL / COL);
  const colOfFine = new Int32Array(GEO.N).fill(-1), gridCol = new Int32Array(CX * CY).fill(-1);
  const fineIn = [];   // per column: its fine water cells
  // THE BROOK'S OWN COLUMNS (TRUE SCALE T2): where the columns are much wider than the brook — true scale's 50-m columns and an
  // 8-m brook — its water would vanish into its banks' columns (1 of 2,622 at 50 m, none at 100 m), and with it the brook's
  // moss, dace and riffles. Its fine cells go to their own columns, BROOK_SEG m (real) stretches along its path, never merged
  // away; their faces (fBrook) carry no wind circulation or drift — a sheltered stream, its flow the lakes' through-flow
  // (implicit: stable however small the stretch). The 1/10 world's brook, half scale in 5-m columns, is a column wide already
  const ownBrook = COL > 4 * GEO.BROOK_W, brookSeg = new Map(), isBrookCol = [];
  const BPp = GEO.BROOK_PATH, BC = [0]; for (let k = 1; k < BPp.length; k++) BC.push(BC[k - 1] + Math.hypot(BPp[k][0] - BPp[k - 1][0], BPp[k][1] - BPp[k - 1][1]));
  const alongBrook = (x, y) => { let best = 1e18, u = 0; for (let k = 0; k < BPp.length - 1; k++) { const ax = BPp[k][0], ay = BPp[k][1], dx = BPp[k + 1][0] - ax, dy = BPp[k + 1][1] - ay, L2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2; if (d < best) { best = d; u = BC[k] + t * Math.sqrt(L2); } } return u; };
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] === LAND || GEO.depth[i] <= 0) continue;
    if (ownBrook && GEO.body[i] === BROOK) {
      const [x, y] = GEO.cellCentre(i), sg = Math.floor(alongBrook(x, y) / (H3.BROOK_SEG * GEO.SCALE));
      if (!brookSeg.has(sg)) { brookSeg.set(sg, fineIn.length); fineIn.push([]); isBrookCol[fineIn.length - 1] = 1; }
      colOfFine[i] = brookSeg.get(sg); fineIn[colOfFine[i]].push(i); continue;
    }
    const [x, y] = GEO.cellCentre(i), gx = Math.floor((x - X0) / COL), gy = Math.floor((y - Y0) / COL), g = gy * CX + gx;
    if (gridCol[g] < 0) { gridCol[g] = fineIn.length; fineIn.push([]); }
    colOfFine[i] = gridCol[g]; fineIn[gridCol[g]].push(i);
  }
  for (let c = 0; c < fineIn.length; c++) isBrookCol[c] = isBrookCol[c] || 0;
  // small shore columns (a few fine cells of water at a column's corner) join the neighbour they share most edge with — a tiny
  // cell under the currents would force tiny time steps
  {
    let merged = true;
    while (merged) {
      merged = false;
      for (let c = 0; c < fineIn.length; c++) {
        if (!fineIn[c].length || isBrookCol[c] || fineIn[c].length * CELL * CELL >= 0.4 * COL * COL) continue;   // (the brook's own stretches stay)
        const share = new Map();
        for (const i of fineIn[c]) for (const j of [i - 1, i + 1, i - NX, i + NX]) { if (j < 0 || j >= GEO.N) continue; const o = colOfFine[j]; if (o >= 0 && o !== c) share.set(o, (share.get(o) || 0) + 1); }
        if (!share.size) continue;
        let best = -1, bn = 0; for (const [o, n] of share) if (n > bn && fineIn[o].length && !isBrookCol[o]) { bn = n; best = o; }   // (a lake's sliver joins its lake, not the brook)
        if (best < 0) continue;
        for (const i of fineIn[c]) { colOfFine[i] = best; fineIn[best].push(i); }
        fineIn[c] = []; merged = true;
      }
    }
    const keep = [], keepB = []; const remap = new Int32Array(fineIn.length).fill(-1);
    fineIn.forEach((f, c) => { if (f.length) { remap[c] = keep.length; keep.push(f); keepB.push(isBrookCol[c]); } });
    isBrookCol.length = 0; isBrookCol.push(...keepB);
    for (let i = 0; i < GEO.N; i++) if (colOfFine[i] >= 0) colOfFine[i] = remap[colOfFine[i]];
    for (let g = 0; g < gridCol.length; g++) if (gridCol[g] >= 0) gridCol[g] = remap[gridCol[g]];
    // grid squares whose column was merged away point at the column that took their water
    for (let i = 0; i < GEO.N; i++) { if (colOfFine[i] < 0) continue; const [x, y] = GEO.cellCentre(i), g = Math.floor((y - Y0) / COL) * CX + Math.floor((x - X0) / COL); if (gridCol[g] < 0) gridCol[g] = colOfFine[i]; }
    fineIn.length = 0; fineIn.push(...keep);
  }
  const NC = fineIn.length, A1 = CELL * CELL;
  const cx = new Float32Array(NC), cy = new Float32Array(NC), area = new Float32Array(NC), depthMax = new Float32Array(NC), depthMean = new Float32Array(NC);
  const nL = new Uint8Array(NC), body = new Uint8Array(NC);
  for (let c = 0; c < NC; c++) {
    let sx = 0, sy = 0, sd = 0, dm = 0; const bc = [0, 0, 0, 0];
    for (const i of fineIn[c]) { const [x, y] = GEO.cellCentre(i); sx += x; sy += y; sd += GEO.depth[i]; dm = Math.max(dm, GEO.depth[i]); bc[GEO.body[i]]++; }
    const n = fineIn[c].length; cx[c] = sx / n; cy[c] = sy / n; area[c] = n * A1; depthMean[c] = sd / n; depthMax[c] = dm;
    body[c] = bc.indexOf(Math.max(...bc));
    // layers: one per DZ down to the deepest point, but a sliver at the bottom (a bed just dipping past a layer boundary)
    // joins the layer above — a tiny cell under big vertical fluxes is unstable
    let L = Math.max(1, Math.ceil(dm / DZ - 1e-6));
    const full = isBrookCol[c] ? n * A1 : COL * COL;   // (a brook stretch's layers against its own area)
    while (L > 1) { let v = 0; for (const i of fineIn[c]) v += clamp(GEO.depth[i] - (L - 1) * DZ, 0, DZ) * A1; if (v >= 0.35 * full * DZ) break; L--; }
    nL[c] = L;
  }
  // layer cells: volume (m³) and bed area (m²: the part of the column's bed lying in this layer) and horizontal area at its top
  const cell0 = new Int32Array(NC + 1); for (let c = 0; c < NC; c++) cell0[c + 1] = cell0[c] + nL[c];
  const NCELL = cell0[NC], vol = new Float32Array(NCELL), bedA = new Float32Array(NCELL), topA = new Float32Array(NCELL), zMid = new Float32Array(NCELL), colOfCell = new Int32Array(NCELL), layer = new Uint8Array(NCELL);
  for (let c = 0; c < NC; c++) for (let k = 0; k < nL[c]; k++) {
    const j = cell0[c] + k; colOfCell[j] = c; layer[j] = k; let v = 0, wz = 0, ta = 0, ba = 0;
    const last = k === nL[c] - 1, bot = last ? Infinity : (k + 1) * DZ;   // (the bottom layer holds everything below it)
    for (const i of fineIn[c]) {
      const d = GEO.depth[i], th = clamp(Math.min(d, bot) - k * DZ, 0, bot - k * DZ);
      if (th > 0) { v += th * A1; wz += th * A1 * (k * DZ + th / 2); ta += A1; }
      if (d > k * DZ && d <= bot) ba += A1;                    // its bed lies in this layer
    }
    vol[j] = Math.max(v, 1e-3); topA[j] = ta; bedA[j] = ba; zMid[j] = v > 0 ? wz / v : k * DZ + DZ / 2;
  }
  // faces: neighbouring columns sharing fine-cell edges (4-neighbour); per layer the shared wet area
  const faceMap = new Map(), fa = [], fb = [], fl = [], fArea = [];
  const add = (i, j) => {
    const a = colOfFine[i], b = colOfFine[j]; if (a < 0 || b < 0 || a === b) return;
    const lo = Math.min(a, b), hi = Math.max(a, b), key = lo * NC + hi;
    let f = faceMap.get(key); if (f === undefined) { f = fa.length; faceMap.set(key, f); fa.push(lo); fb.push(hi); fl.push(0); fArea.push(new Float32Array(Math.max(nL[lo], nL[hi]))); }
    fl[f] += CELL; const dmin = Math.min(GEO.depth[i], GEO.depth[j]), kmax = Math.min(nL[lo], nL[hi]) - 1;
    for (let k = 0; k * DZ < dmin; k++) fArea[f][Math.min(k, kmax)] += CELL * clamp(dmin - k * DZ, 0, DZ);   // (deeper overlap folds into the shallower side's bottom layer)
  };
  for (let r = 0; r < NY; r++) for (let q = 0; q < NX; q++) { const i = r * NX + q; if (colOfFine[i] < 0) continue; if (q + 1 < NX) add(i, i + 1); if (r + 1 < NY) add(i, i + NX); }
  const NF = fa.length, ML = Math.max(...nL);
  const fA = new Float32Array(NF * ML), fnx = new Float32Array(NF), fny = new Float32Array(NF), fd = new Float32Array(NF), fh = new Float32Array(NF), fBrook = new Uint8Array(NF);
  for (let f = 0; f < NF; f++) {
    let s = 0; for (let k = 0; k < fArea[f].length; k++) { fA[f * ML + k] = fArea[f][k]; s += fArea[f][k]; }
    const dx = cx[fb[f]] - cx[fa[f]], dy = cy[fb[f]] - cy[fa[f]], d = Math.hypot(dx, dy) || COL;
    fnx[f] = dx / d; fny[f] = dy / d; fd[f] = Math.max(d, isBrookCol[fa[f]] || isBrookCol[fb[f]] ? CELL : COL * 0.5); fh[f] = s / fl[f];
    fBrook[f] = isBrookCol[fa[f]] || isBrookCol[fb[f]] ? 1 : 0;
  }
  return { COL, DZ, CX, CY, X0, Y0, NC, NCELL, NF, ML, gridCol, colOfFine, ownBrook, cx, cy, area, depthMax, depthMean, nL, body, cell0, vol, bedA, topA, zMid, colOfCell, layer,
    fa: Int32Array.from(fa), fb: Int32Array.from(fb), fl: Float32Array.from(fl), fA, fnx, fny, fd, fh, fBrook };
}

// conjugate gradients on the graph Laplacian (Lx)_a = Σ_f w_f (x_a − x_b) = rhs (Σ rhs = 0; x defined up to a constant)
function solveLaplace(G, w, rhs, iters = 20000, tol = 1e-18) {   // (the lidar-and-photo beds' thin shallow fringe stiffens it; a tight tolerance: the smallest shallow columns hold ~2.7 m³, so a residual imbalance there shows)
  const n = G.NC, x = new Float64Array(n), r = Float64Array.from(rhs), p = new Float64Array(n), Ap = new Float64Array(n);
  let m = 0; for (let i = 0; i < n; i++) m += r[i]; m /= n; for (let i = 0; i < n; i++) r[i] -= m;   // (project out the null space)
  p.set(r); let rr = 0; for (let i = 0; i < n; i++) rr += r[i] * r[i]; const r0 = rr;
  for (let it = 0; it < iters && rr > tol * r0; it++) {
    Ap.fill(0);
    for (let f = 0; f < G.NF; f++) { const a = G.fa[f], b = G.fb[f], d = w[f] * (p[a] - p[b]); Ap[a] += d; Ap[b] -= d; }
    let pAp = 0; for (let i = 0; i < n; i++) pAp += p[i] * Ap[i]; if (pAp <= 0) break;
    const al = rr / pAp; let rn = 0;
    for (let i = 0; i < n; i++) { x[i] += al * p[i]; r[i] -= al * Ap[i]; rn += r[i] * r[i]; }
    const be = rn / rr; rr = rn; for (let i = 0; i < n; i++) p[i] = r[i] + be * p[i];
  }
  return x;
}

// the wind's depth-averaged circulation for a unit wind stress along (ex, ey): transport across face a→b
// Q_f ∝ h_f L_f (τ·n_f) − (h_f² L_f / d_f) (η_b − η_a), with ∇·Q = 0 (steady, friction-dominated, no Coriolis in a lake this
// small); returns the per-face depth-averaged velocity pattern (arbitrary scale — calibrated afterwards)
// Friction is stronger in the shallows — quadratic bottom drag on thin water, and the summer weed beds that cut currents ~90 %
// (James & Barko) — so the transport there carries the factor shallowDamp(h) (inside the solve, so ∇·Q = 0 still holds)
export const shallowDamp = h => clamp((h - 0.3) / 2.2, 0.12, 1);
function windPattern(G, ex, ey) {
  const w = new Float64Array(G.NF), rhs = new Float64Array(G.NC);
  for (let f = 0; f < G.NF; f++) {
    const h = G.fh[f], L = G.fl[f], k = G.fBrook[f] ? 0 : shallowDamp(h); w[f] = k * h * h * L / G.fd[f];   // (no wind gyre through the brook's own stretches)
    const tn = k * h * L * (ex * G.fnx[f] + ey * G.fny[f]); rhs[G.fa[f]] -= tn; rhs[G.fb[f]] += tn;   // (−div of the stress-driven transport)
  }
  const eta = solveLaplace(G, w, rhs), u = new Float32Array(G.NF);
  for (let f = 0; f < G.NF; f++) { const h = G.fh[f], L = G.fl[f], Q = (G.fBrook[f] ? 0 : shallowDamp(h)) * h * L * (ex * G.fnx[f] + ey * G.fny[f]) - w[f] * (eta[G.fb[f]] - eta[G.fa[f]]); u[f] = Q / (h * L); }
  return u;
}

// the through-flow's path: a potential flow from the inflow to the outlet (Lower's local inflow enters by the brook's mouth)
function throughPattern(G, src) {
  const w = new Float64Array(G.NF), rhs = new Float64Array(G.NC);
  for (let f = 0; f < G.NF; f++) w[f] = G.fh[f] * G.fl[f] / G.fd[f];
  for (const [c, q] of src) rhs[c] += q;
  const phi = solveLaplace(G, w, rhs), Q = new Float32Array(G.NF);
  for (let f = 0; f < G.NF; f++) Q[f] = -w[f] * (phi[G.fb[f]] - phi[G.fa[f]]);   // (a → b), units of the sources
  return { Q, phi };
}

// ============================================================ the environment =========================================
export class Env3 {
  constructor({ yf0 = SEASON.START_YF, col = H3.COL, chem = true, plants = true, plantInit = true } = {}) {
    const G = this.G = buildColumns3(col);
    this.time = yf0 * CLOCK3.YEAR_LEN;
    this.t = 0.30;                                   // time of day (0..1), mid-morning
    this.weather = 0; this.weatherTimer = dwell(0); this.forced = false; this._pMult = 1;   // (E9d: the wet episode's rain, × the month's rate)
    // THE WEATHER'S OWN RANDOM STREAM (mulberry32, seeded once from the sim's): the fish's and the plants' draws no longer shift
    // the spells — a change to how a fish chooses its spawning place gave seed 511 a stormier, colder spring and read as a
    // week's delay in the perch's spawning. Deterministic as before (the seed sets both streams)
    this._wx = ((rand() * 4294967296) >>> 0) || 1;
    // (E9a, WEATHER3.AIR) the air's anomalies about the Maine calendar — synoptic and seasonal (°C) — on a stream of their own (from
    // the weather's seed: the spells' draws are unchanged), and the surface water's share of them (°C, _heat's target and the ice)
    this._wy = (this._wx ^ 0x9E3779B9) | 0 || 1; this.airSyn = 0; this.airSea = 0; this.airSky = 0; this.wxT = 0;   // (E9d: airSky, the storms' warm air)
    // (E9b, WEATHER3.HYDRO) the catchment's water (mm): the snowpack's water, the soil, the quick and slow stores; the flow now (mm/day)
    // and its ratio to the mean, which scales the lakes' through-flow — spun up from the year before on the normals
    this.swe = 0; this.soil = 0; this.uz = 0; this.lz = 0; this.qMm = WEATHER3.Q_REF; this.qFac = 1; this.precip = 0; this._thQ = 0;
    // (E10a) the lakes' ice (black and white, m) and the snow on it (mm of water); the daylight a full cover blocks (1 − its transmission)
    this.iceB = 0; this.iceW = 0; this.iceSnow = 0; this.iceCut = ICE.LIGHT_CUT;
    this._wxShares = weatherShares(); GEO.brookLevel = 1; if (WEATHER3.HYDRO) { this._hydroSpin(yf0); GEO.brookLevel = Math.min(WEATHER3.BROOK_LV[1], Math.max(WEATHER3.BROOK_LV[0], Math.pow(this.qFac, WEATHER3.BROOK_EXP))); }   // (E9c: the world's brook level is this lake's)
    this.windDir = Math.PI * 1.25; this.windSpeed = H3.WIND_MS[0];   // direction the wind blows FROM (radians, 0 = from the north, clockwise)
    this.light = 0; this.lightDay = 1; this.sun = 0; this.dayFrac = 0.5; this.lux = 0;
    this.temp = new Float32Array(G.NCELL);
    this.age = new Float32Array(G.NCELL);           // water age: sim seconds since the water entered (a through-flow tracer)
    this.ice = new Float32Array(G.NC);
    this.fields = [{ name: 'temp', a: this.temp }, { name: 'age', a: this.age, in: 0 }];   // transported fields (the chemistry adds its own)
    this._statics();
    this.chem = chem ? new Chem3(this) : null;   // O₂, N, P, algae, DOM, zooplankton, the bed (chem3.js)
    this.primeSeason(this.time);
    this.plants = this.chem && plants ? new Plants3(this, { init: plantInit }) : null;   // the weeds on the bed (plants3.js; plantInit false: the bare seeding, not the spun-up start)
    this.lit = this.plants ? new Littoral3(this) : null;              // the weeds' invertebrates, snails, the surface (littoral3.js)
  }

  // ---------- precomputed transport patterns ----------
  _statics() {
    const G = this.G;
    // the circulation for unit stress east and north; then its scale: area-weighted RMS = CIRC_RMS at 5 m/s
    this.ux = windPattern(G, 1, 0); this.uy = windPattern(G, 0, 1);
    let s = 0, wsum = 0; for (let f = 0; f < G.NF; f++) { const a = G.fh[f] * G.fl[f]; s += a * (this.ux[f] ** 2 + this.uy[f] ** 2) / 2; wsum += a; }
    this.circK = H3.CIRC_RMS / Math.sqrt(s / wsum);   // × (W/5)² × the pattern → m/s real
    // the inflow and the outlet: their columns (the nearest water to the stream ends)
    const nearest = (x, y, b) => { let best = 1e9, k = -1; for (let c = 0; c < G.NC; c++) if (G.body[c] === b) { const d = Math.hypot(G.cx[c] - x, G.cy[c] - y); if (d < best) { best = d; k = c; } } return k; };
    this.inCol = nearest(GEO.INFLOW[0], GEO.INFLOW[1], UPPER); this.outCol = nearest(GEO.OUTLET[0], GEO.OUTLET[1], LOWER);
    const bp = GEO.BROOK_PATH, end = bp[bp.length - 1]; this.lowerInCol = nearest(end[0], end[1], LOWER);
    // discharges (world m³ per sim second): a lake's volume / its residence time (residence is a real-time quantity; world
    // volumes are real / 100, so the calendar's flushing is kept)
    const volOf = b => { let v = 0; for (let c = 0; c < G.NC; c++) if (G.body[c] === b) for (let k = 0; k < G.nL[c]; k++) v += G.vol[G.cell0[c] + k]; return v; };
    this.volUpper = volOf(UPPER); this.volLower = volOf(LOWER);
    const qU = this.volUpper / (H3.RES_UPPER_D * DAY / REAL_S), qL = this.volLower / (H3.RES_LOWER_D * DAY / REAL_S);
    this.qIn = qU; this.qOut = Math.max(qL, qU); this.qLocal = this.qOut - this.qIn;
    const tp = throughPattern(G, [[this.inCol, qU], [this.lowerInCol, this.qLocal], [this.outCol, -this.qOut]]);
    this.through = tp.Q;
    // the through-flow is a potential flow: it never loops, so ordered from high potential to low it is solved IMPLICITLY in one
    // upstream-first pass (stable at any step) — on column means: each column's inflows (from upstream columns, already updated),
    // its source, its outflow
    this._thOrder = Int32Array.from([...Array(G.NC).keys()].sort((a, b) => tp.phi[b] - tp.phi[a]));
    this._thIn = Array.from({ length: G.NC }, () => []); this._thOut = new Float64Array(G.NC);
    for (let f = 0; f < G.NF; f++) { const q = this.through[f]; if (q > 0) { this._thIn[G.fb[f]].push(G.fa[f], q); this._thOut[G.fa[f]] += q; } else if (q < 0) { this._thIn[G.fa[f]].push(G.fb[f], -q); this._thOut[G.fb[f]] -= q; } }
    this._thSrc = new Float64Array(G.NC); this._thSrc[this.inCol] += qU; this._thSrc[this.lowerInCol] += this.qLocal; this._thOut[this.outCol] += this.qOut;
    this._colV = new Float64Array(G.NC); for (let c = 0; c < G.NC; c++) for (let k = 0; k < G.nL[c]; k++) this._colV[c] += G.vol[G.cell0[c] + k];
    // each column's SHELTER from the wind and waves: how many of 8 directions meet land within SHELTER_R (ice; the weeds)
    this.shelter = new Uint8Array(G.NC);
    for (let c = 0; c < G.NC; c++) {
      let k = 0; for (let d = 0; d < 8; d++) { const ang = d * Math.PI / 4, ux = Math.cos(ang), uy = Math.sin(ang); for (let r = PL3.SHELTER_R / 10; r <= PL3.SHELTER_R; r += PL3.SHELTER_R / 10) if (GEO.bodyAt(G.cx[c] + ux * r, G.cy[c] + uy * r) === LAND) { k++; break; } }
      this.shelter[c] = k;
    }
    // each column's EFFECTIVE FETCH (m, real): the open water upwind — per 16 directions the distance to its water's shore (land, or
    // the brook's mouth), cosine-weighted over ±45° (Scheffer et al. 1992; Randall et al. 2004), its most exposed direction's. The
    // storm waves it raises set how deep the bed is stirred (plants3 zWave: the weeds' upper limit). (weed_bed_controls.md §2)
    this.fetch = new Float32Array(G.NC);
    { const ND = 16, D = new Float32Array(ND), step = GEO.CELL, rMax = 6000 * GEO.SCALE, W = [-2, -1, 0, 1, 2].map(k => Math.cos(k * Math.PI / 8));
      for (let c = 0; c < G.NC; c++) {
        const b = G.body[c]; if (b === BROOK) continue;
        for (let d = 0; d < ND; d++) { const ang = d * 2 * Math.PI / ND, ux = Math.cos(ang), uy = Math.sin(ang); let r = step; while (r < rMax && GEO.bodyAt(G.cx[c] + ux * r, G.cy[c] + uy * r) === b) r += step; D[d] = r / GEO.SCALE; }
        let best = 0; for (let d = 0; d < ND; d++) { let s = 0, w = 0; for (let k = -2; k <= 2; k++) { s += W[k + 2] * D[(d + k + ND) % ND]; w += W[k + 2]; } best = Math.max(best, s / w); }
        this.fetch[c] = best;
      }
    }
    // the wet face-layers as a compact list (cells either side, area, layer, face) — the transport's inner loop
    let n = 0; for (let e = 0; e < G.NF * G.ML; e++) if (G.fA[e] > 0) n++;
    const FL = this._FL = { n, ia: new Int32Array(n), ib: new Int32Array(n), a: new Float32Array(n), k: new Uint8Array(n), f: new Int32Array(n), A: new Float32Array(G.NF), top: new Float32Array(G.NF) };
    n = 0;
    for (let f = 0; f < G.NF; f++) for (let k = 0; k < G.ML; k++) {
      const a = G.fA[f * G.ML + k]; if (a <= 0) continue;
      FL.ia[n] = G.cell0[G.fa[f]] + k; FL.ib[n] = G.cell0[G.fb[f]] + k; FL.a[n] = a; FL.k[n] = k; FL.f[n] = f; FL.A[f] += a; if (k === 0) FL.top[f] = a; n++;
    }
    this._Fw = new Float32Array(n); this._F = new Float32Array(n); this._uF = new Float32Array(G.NF); this._unF = new Float32Array(G.NF);
    this._net = new Float64Array(G.NCELL); this._tmp = new Float32Array(G.NCELL); this._out = new Float64Array(G.NCELL); this._thN = 0;
  }

  // ---------- clock, sun, weather, wind ----------
  yearFrac() { return ((this.time / CLOCK3.YEAR_LEN) % 1 + 1) % 1; }
  isNight() { return daylight(this.t, seasonalSun(this.yearFrac()).dayFrac) <= 0; }
  windVec() {   // the direction the wind blows TOWARD (unit), and its speed (m/s real); none under full ice
    const d = this.windDir + Math.PI; return [Math.sin(d), Math.cos(d), this.windSpeed];
  }
  _wrand() {   // (the weather's stream: core.rand's mulberry32 on its own state)
    this._wx = (this._wx + 0x6D2B79F5) | 0;
    let t = Math.imul(this._wx ^ (this._wx >>> 15), 1 | this._wx);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  _wyrand() { this._wy = (this._wy + 0x6D2B79F5) | 0; let t = Math.imul(this._wy ^ (this._wy >>> 15), 1 | this._wy); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  _gauss() { const u = Math.max(1e-12, this._wyrand()), v = this._wyrand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // (E9a) the air's anomalies step as Ornstein–Uhlenbeck processes (exact over dt: x·e^(−dt/τ) + σ·√(1 − e^(−2dt/τ))·N)
  _air(dt) {
    const W = WEATHER3; if (!W.AIR) { this.wxT = 0; return; }
    const yf = this.yearFrac(), m = Math.min(11, Math.floor(yf * 12)), sd = W.SYN_SD[m];
    const aS = Math.exp(-dt / (W.SYN_TAU * DAY)), aL = Math.exp(-dt / (W.SEA_TAU * DAY));
    this.airSyn = this.airSyn * aS + sd * Math.sqrt(1 - aS * aS) * this._gauss();
    this.airSea = this.airSea * aL + W.SEA_SD * Math.sqrt(1 - aL * aL) * this._gauss();
    if (W.SYN) { const sh = this._wxShares, wS = sh[2] + sh[3], a = W.WET_T[m], tg = this.weather >= 2 ? a : -a * wS / (1 - wS); this.airSky = tg + (this.airSky - tg) * Math.exp(-dt / (W.SKY_TAU * DAY)); }
    else this.airSky = 0;
    this.wxT = W.K_WATER * (this.airSyn + this.airSea + this.airSky);
  }
  // (E9b) the air's temperature now (°C): its monthly normal (interpolated at mid-months) + the anomalies
  airT(yf = this.yearFrac()) { const N = WEATHER3.AIR_N, x = yf * 12 - 0.5, i = Math.floor(x), f = x - i, a = N[(i + 12) % 12], b = N[(i + 13) % 12]; return a + (b - a) * f + this.airSyn + this.airSea + this.airSky; }
  // the catchment over dt s at air temperature Ta with P mm of precipitation: snow below 0 °C, degree-day melt, ET from the soil,
  // HBV's soil–quick–slow stores; the flow (mm/day) and its ratio to the mean
  _catch(dt, Ta, P) {
    const W = WEATHER3, d = dt / DAY;
    let liq = 0; if (Ta < 0) this.swe += P; else liq = P;
    const melt = Math.min(this.swe, W.DDF * Math.max(0, Ta) * d); this.swe -= melt; liq += melt;
    const rch = liq * Math.min(1, Math.pow(Math.max(0, this.soil) / W.FC, W.BETA)); this.soil += liq - rch;
    const es = 6.108 * Math.exp(17.26939 * Ta / (Ta + 237.3)), pet = Ta > 0 ? 0.1651 * 2 * seasonalSun(this._hyYf ?? this.yearFrac()).dayFrac * 216.7 * es / (Ta + 273.3) * W.KPEC : 0;
    this.soil = Math.max(0, this.soil - pet * d * Math.min(1, this.soil / (W.LP * W.FC))); if (this.soil > W.FC) { this.uz += this.soil - W.FC; this.soil = W.FC; }
    this.uz += rch; const pc = Math.min(this.uz, W.PERC * d); this.uz -= pc; this.lz += pc;
    const q1 = this.uz * -Math.expm1(-W.K1 * d), q2 = this.lz * -Math.expm1(-W.K2 * d); this.uz -= q1; this.lz -= q2;
    this.qMm = (q1 + q2) / Math.max(1e-9, d); this.qFac = Math.max(0.005, this.qMm / W.Q_REF);
  }
  _hydro(dt) {
    const W = WEATHER3; if (!W.HYDRO) { this.qFac = 1; this.iceCut = ICE.LIGHT_CUT; GEO.brookLevel = 1; return; }
    const yf = this.yearFrac(), m = Math.min(11, Math.floor(yf * 12)), sh = this._wxShares, perDay = W.PRCP_N[m] / (365 / 12) / (sh[2] + W.STORM_K * sh[3]);
    const P = (this.weather === 2 ? perDay : this.weather === 3 ? W.STORM_K * perDay : 0) * (W.SYN ? this._pMult : 1) * dt / DAY; this.precip += P;
    const Ta = this.airT(yf); this._catch(dt, Ta, P); this._iceSnow(dt, Ta, P);
    GEO.brookLevel = Math.min(W.BROOK_LV[1], Math.max(W.BROOK_LV[0], Math.pow(this.qFac, W.BROOK_EXP)));   // (E9c: the brook's depth with its flow)
  }
  // (E10a) the ice's growth (Stefan), the snow on it, the slush that floods it to white ice, the spring's thinning; the light through it
  _iceSnow(dt, Ta, P) {
    const W = WEATHER3, d = dt / DAY;
    if (this.iceMean < 0.05) { this.iceB = 0; this.iceW = 0; this.iceSnow = 0; }
    else if (this.iceMean > 0.5) {
      const hs = this.iceSnow / W.SNOW_RHO, a = W.STEFAN[1] + (W.STEFAN[0] - W.STEFAN[1]) * Math.exp(-hs / W.STEFAN_SNOW);   // (cm/(°C·d)^½)
      if (Ta < 0) { const hcm = Math.max(1, 100 * this.iceB); this.iceB += a * a * -Ta * d / (2 * hcm) / 100; if (P > 0) this.iceSnow += P * W.LAKE_SNOW; }
      else { const m = Math.min(this.iceSnow, W.DDF * Ta * d + (P > 0 ? P : 0)); this.iceSnow -= m; let th = W.MELT_ICE * Ta * d; const tw = Math.min(this.iceW, th); this.iceW -= tw; th -= tw; this.iceB = Math.max(0, this.iceB - th); }
      const hi = this.iceB + this.iceW, ex = this.iceSnow - 83 * hi;   // (the snow's load past the ice's freeboard, kg/m²: (1000 − 917)·h_i)
      if (ex > 0) { this.iceSnow -= ex; this.iceW += 2 * ex / 917; }   // (flooded: snow-ice ≈ half snow, half lake water [inf])
    }
    const hs = this.iceSnow / W.SNOW_RHO, hb = this.iceB, hw = this.iceW, h = hb + hw;
    const top = hw > 0 ? W.WHITE_ALB : W.BLACK_ALB * Math.min(1, h / 0.05), alb = top + (W.SNOW_ALB - top) * Math.min(1, hs / 0.03);   // (a few cm of snow: an opaque top [inf])
    const T = h > 0 || hs > 0 ? (1 - alb) * Math.exp(-W.SNOW_K * hs - W.WHITE_K * hw - W.BLACK_K * hb) : 1;
    this.iceCut = 1 - T;
  }
  // a year of the catchment on the normals (each day its month's mean precipitation and air) before yf0: a climatological state
  _hydroSpin(yf0) {
    const W = WEATHER3; this.soil = 0.8 * W.FC; this.lz = 0.6 * W.Q_REF / W.K2;
    for (let k = 0; k < 2 * 365; k++) { const yf = this._hyYf = ((yf0 - 2 + k / 365) % 1 + 1) % 1, m = Math.min(11, Math.floor(yf * 12)); const s0 = this.airSyn, s1 = this.airSea, s2 = this.airSky; this.airSyn = 0; this.airSea = 0; this.airSky = 0; const Ta = this.airT(yf); this.airSyn = s0; this.airSea = s1; this.airSky = s2; this._catch(DAY, Ta, W.PRCP_N[m] / (365 / 12)); }
    this._hyYf = undefined;
  }
  // (E10a) a lake opened under ice: its ice and the snow on it from the normals since the air last went below 0 °C — Stefan's growth day by
  // day, the season's snowfall × LAKE_SNOW, flooding — then the light through it
  _iceSpin(yf) {
    const W = WEATHER3, s0 = this.airSyn, s1 = this.airSea, s2 = this.airSky; this.airSyn = 0; this.airSea = 0; this.airSky = 0;
    let k0 = 0; while (k0 < 365 && this.airT(((yf - k0 / 365) % 1 + 1) % 1) < 0) k0++;   // (days back to the last thaw)
    this.iceB = 0; this.iceW = 0; this.iceSnow = 0; this.iceMean = 1;
    for (let k = k0; k > 0; k--) { const y = ((yf - k / 365) % 1 + 1) % 1, m = Math.min(11, Math.floor(y * 12)); this._iceSnow(DAY, this.airT(y), W.PRCP_N[m] / (365 / 12)); }
    this.airSyn = s0; this.airSea = s1; this.airSky = s2; this._iceSnow(0, -1, 0);
  }
  _weather(dt) {
    this._air(dt);
    if (!this.forced) {
      this.weatherTimer -= dt;
      if (this.weatherTimer <= 0) {
        const r = this._wrand(), w = this.weather;
        if (WEATHER3.SYN) { const row = WEATHER3.CHAIN[w]; let c = 0, nx = 3; for (let s = 0; s < 4; s++) { c += row[s]; if (r < c) { nx = s; break; } } this.weather = nx; }
        else this.weather = w === 0 ? (r < 0.6 ? 0 : 1) : w === 1 ? (r < 0.4 ? 0 : r < 0.85 ? 2 : 1) : w === 2 ? (r < 0.45 ? 1 : r < 0.8 ? 3 : 2) : (r < 0.7 ? 2 : 3);
        this.weatherTimer = dwell(this.weather) * (0.6 + this._wrand() * 0.8);
        if (WEATHER3.SYN && this.weather >= 2 && w < 2) this._pMult = this._gammaW(WEATHER3.P_K);   // (a new wet episode: its system's rain)
        // Maine's prevailing winds: from the SW in summer, the NW the rest of the year; each spell veers about it
        const yf = this.yearFrac(), summer = yf > 0.22 && yf < 0.55, prev = summer ? Math.PI * 1.25 : Math.PI * 1.75;
        this.windDir = prev + (this._wrand() - 0.5) * 1.4;
      }
    }
    this.windSpeed = H3.WIND_MS[this.weather];
  }
  // the surface's light in lux at time of day t (the day's sun and this weather's clouds), twilight included
  _lux(t, sun, cover) {
    const day = daylight(t, sun.dayFrac) * sun.noon * (1 - cover) * H3.LUX_NOON;
    const rise = 0.5 - sun.dayFrac / 2, set = 0.5 + sun.dayFrac / 2;
    const h = t > set ? Math.min(t - set, 1 - t + rise) * 24 : t < rise ? Math.min(rise - t, t + 1 - set) * 24 : 0;   // hours from the sun's edge (0 by day)
    return Math.max(day, H3.TWI_LUX * Math.pow(10, -H3.TWI_DEC * h) * (1 - 0.5 * cover), H3.NIGHT_LUX);
  }
  // the light ahead by s seconds (the same weather): a coarse block that spans dusk samples it
  luxAhead(s) { const sun = seasonalSun(this.yearFrac()); return this._lux(((this.t + s / CLOCK3.DAY_LEN) % 1 + 1) % 1, sun, ENV.CLOUD_COVER[this.weather]); }
  setWeather(w) { this.weather = w; this.weatherTimer = dwell(w); this.forced = true; this.windSpeed = H3.WIND_MS[w]; }
  // (E9d) a gamma(k) draw of mean 1 on the weather's stream (Marsaglia & Tsang 2000; k ≥ 1; normals by Box–Muller)
  _gammaW(k) {
    const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (let it = 0; it < 100; it++) {
      const x = Math.sqrt(-2 * Math.log(Math.max(1e-12, this._wrand()))) * Math.cos(2 * Math.PI * this._wrand()), v0 = 1 + c * x; if (v0 <= 0) continue;
      const v = v0 * v0 * v0, u = this._wrand(); if (u < 1 - 0.0331 * x ** 4 || Math.log(Math.max(1e-12, u)) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v / k;
    }
    return 1;
  }

  // the mixed layer (m) the wind and the night's convection reach in an open column (2-D sim: THERMAL.MIX_M × weather, night
  // convection to NIGHT_MIX_M); under ice the calm column's top layer
  mixDepth() {
    let m = THERMAL.MIX_M * clamp(WIND.WEATHER[this.weather], THERMAL.MIX_CALM, 1);
    if (this.isNight()) m = Math.max(m, THERMAL.NIGHT_MIX_M);
    return m;
  }

  // ---------- start a lake at a date, its water already at the season's temperature ----------
  primeSeason(time) {
    this.time = time; const yf = this.yearFrac(), surf = Math.max(0.3, seasonalTemp(yf)), G = this.G;
    const frozen = surf < ICE.FORM_T;
    for (let c = 0; c < G.NC; c++) {
      this.ice[c] = frozen ? 1 : 0;
      for (let k = 0; k < G.nL[c]; k++) { const j = G.cell0[c] + k; this.temp[j] = frozen ? this._iceProfile(G.zMid[j]) : surf; }
    }
    // the water's age: well mixed at its lake's residence (a steady through-flow)
    for (let j = 0; j < G.NCELL; j++) { const b = G.body[G.colOfCell[j]]; this.age[j] = (b === LOWER ? H3.RES_LOWER_D : H3.RES_UPPER_D) * DAY / REAL_S; }
    if (frozen && WEATHER3.HYDRO) this._iceSpin(yf);   // (E10a: the season's ice and snow on it so far)
    if (this.chem) this.chem.prime();
    if (this.plants) this.plants.jump();   // (the weeds take the new season's shape, conserving their mass)
    if (this.lit) this.lit.jump();
    this._light();   // (the sky at once: a lake opened at 7 a.m. is in daylight before its first step)
  }
  // the light now: the sun's height, the daylight under the cloud, the surface's lux (by the hour, the season, the weather)
  _light() {
    const sun = seasonalSun(this.yearFrac()), cover = ENV.CLOUD_COVER[this.weather];
    this.light = daylight(this.t, sun.dayFrac) * sun.noon * (1 - cover);
    this.lightDay = sun.noon; this.sun = daylight(this.t, sun.dayFrac); this.dayFrac = sun.dayFrac;
    this.lux = this._lux(this.t, sun, cover);
  }
  _iceProfile(z) { const s = clamp((z - THERMAL.ICE_TOP_M) / THERMAL.ICE_META_M, 0, 1); return 0.2 + 3.8 * s * s * (3 - 2 * s); }   // ~0 °C under the ice → 4 °C at depth

  // ============================================================ step ===================================================
  step(dt) {
    const G = this.G;
    this.time += dt; this.t = (this.t + dt / CLOCK3.DAY_LEN) % 1;
    const yf = this.yearFrac();
    this._weather(dt); this._hydro(dt);
    let iceMean = 0; for (let c = 0; c < G.NC; c++) iceMean += this.ice[c] * G.area[c]; iceMean /= this._area || (this._area = G.area.reduce((s, a) => s + a, 0));
    this.iceMean = iceMean;
    this._light();
    this._heat(dt, yf);
    if (this.chem) this.chem.step(dt);
    if (this.plants) this.plants.step(dt);
    if (this.lit) this.lit.step(dt);
    this._transport(dt);
    if (this.chem) this.chem._ledgerFlows();   // (the through-flow's in and out, tallied after it moved them)
    for (let j = 0; j < G.NCELL; j++) this.age[j] += dt;
  }

  // ---------- temperature and ice, per column ----------
  // The mixed layer relaxes toward the season's surface temperature (the Maine calendar, SEASON.TEMP_KNOTS) + the weather +
  // the day's swing; a SHALLOW mixed layer swings more and follows faster (less water to heat: the day's heating, e-folding over
  // DIEL_SKIN, is shared over the mixed depth) — so on calm nights the coves cool below the basin and their water siphons down.
  _heat(dt, yf) {
    const G = this.G, T = this.temp, seasonal = seasonalTemp(yf), mixM = this.mixDepth();
    const diurnal = Math.sin((this.t - 0.30) * Math.PI * 2), wOff = ENV.TEMP_WEATHER[this.weather] + this.wxT;   // (E9a: the air's anomaly)
    for (let c = 0; c < G.NC; c++) {
      const j0 = G.cell0[c], n = G.nL[c], depth = G.depthMax[c], iceC = this.ice[c];
      if (iceC > 0.5) {
        // under ice: the ice chills the water touching it toward 0 °C; the BED gives off the summer's stored heat (1–4.5 W/m²,
        // Malm et al. 1997) and warms the water over it toward 4 °C — the densest water, which slides down the slopes into the
        // basin (_siphon). Thin water over a lot of bed warms fastest: the rate × the cell's bed area per volume
        T[j0] += (0.2 - T[j0]) * expm(H3.ICE_CHILL * TS * dt);
        for (let q = 0; q < n; q++) { const j = j0 + q; if (G.bedA[j] > 0) T[j] += (4 - T[j]) * expm(H3.BED_HEAT * TS * dt * G.bedA[j] * H3.DZ / G.vol[j]); }
      } else {
        // below 4 °C water grows LIGHTER as it cools, so in late autumn the cold water floats: only the wind mixes it down,
        // the surface layer chills and freezes while the deep water stays near 4 °C (the lake's inverse stratification)
        let M = Math.max(0.3, Math.min(depth, mixM)); if (seasonal + wOff < 4) M = Math.min(M, Math.max(0.6, 1.5 * WIND.WEATHER[this.weather]));
        const skin = H3.DIEL_SKIN;
        const amp = ENV.TEMP_DIURNAL * Math.min(1, skin / M * (1 - Math.exp(-M / skin)));   // the mixed layer's mean diel swing
        const target = Math.max(0.3, seasonal + wOff + amp * diurnal);
        const rate = ENV.TEMP_RELAX * TS * clamp(2.5 / M, 0.25, 4);
        const k = expm(rate * dt);
        for (let q = 0; q < n; q++) if (G.zMid[j0 + q] <= M + 0.25) T[j0 + q] += (target - T[j0 + q]) * k;
      }
      // ice: forms on a column whose surface water nears freezing, then keeps growing while the season is cold (whatever the
      // water under it — the ice is the air's doing); melts once the season's water would be warm, shallow first
      // (the melt counts the day's warmth — spring sun on the ice by afternoons — as its DAILY MEAN on the real day: thin
      // November ice doesn't melt every afternoon; the shallows, colder on clear nights, freeze first and keep their ice)
      const surfT = T[j0], warm = seasonal + wOff + 0.6 * (1 - Math.min(1, depth / 3)) + ENV.TEMP_DIURNAL * 0.5 / Math.PI;
      // (E10a: with the ice's thickness modelled, a winter thaw can't lift 40 cm of ice in a day — the cover goes once the ice is melted
      // through, < ICE_GONE m, or wasn't there yet: thin first ice in a warm spell)
      if (warm > ICE.MELT_T && (!WEATHER3.HYDRO || this.iceB + this.iceW < H3.ICE_GONE)) { if (iceC > 0) this.ice[c] = Math.max(0, iceC - ICE.MELT * TS * dt); }
      else if (iceC < 1 && (surfT < ICE.FORM_T - H3.ICE_WIND * this.windSpeed * (1 - this.shelter[c] / 8) || iceC > 0.5)) this.ice[c] = Math.min(1, iceC + ICE.GROW * TS * dt);
    }
  }

  // ---------- horizontal transport ----------
  _transport(dt) {
    const G = this.G, FL = this._FL, Fw = this._Fw, net = this._net, out = this._out;
    const [wx, wy, W] = this.windVec();
    const iceOpen = 1 - this.iceMean;
    // depth-averaged wind circulation (m/s real) per face, × the open water; the surface drift and its return per layer.
    // (u m/s real across a world face of a m² is u·a·REAL real m³ per real second; world volumes are real / 100 and a sim
    // second is REAL_S real seconds: u · a · REAL_S / REAL world m³ per sim second)
    const circ = this.circK * (W / 5) ** 2 * iceOpen, drift = H3.DRIFT * W * iceOpen, toW = REAL_S / H3.REAL;
    const uF = this._uF, unF = this._unF, key = `${this.weather}|${this.windDir}|${Math.round(this.iceMean * 50)}|${dt}`;
    if (key === this._windKey) { this._transportRun(dt); return; }   // (the same wind as last update: the same fluxes)
    this._windKey = key;
    for (let f = 0; f < G.NF; f++) { uF[f] = circ * (wx * this.ux[f] + wy * this.uy[f]); unF[f] = G.fBrook[f] ? 0 : drift * shallowDamp(G.fh[f]) * (wx * G.fnx[f] + wy * G.fny[f]); }
    for (let e = 0; e < FL.n; e++) {
      const f = FL.f[e], a = FL.a[e], un = unF[f], top = FL.top[f], A = FL.A[f];
      // the drift in the top layer, returned below (zero net) — a face only one layer deep has nowhere to return it: no drift
      const sh = A - top <= 1e-6 ? 0 : FL.k[e] === 0 ? un : -un * top / (A - top);
      Fw[e] = (uF[f] + sh) * a * toW;
    }
    // stability: no cell may lose more than ~90 % of its water in one sub-step (out through its faces and vertically out of
    // it); at most MAX_SUB sub-steps — in a gale the wind-driven currents are slowed (uniformly, so they still balance)
    // rather than the step taking ever longer: the lakes still mix within hours (this.transportScale records it)
    const rate = s => {
      out.fill(0); net.fill(0);
      for (let e = 0; e < FL.n; e++) { const q = s * Fw[e]; if (q > 0) out[FL.ia[e]] += q; else out[FL.ib[e]] -= q; net[FL.ia[e]] -= q; net[FL.ib[e]] += q; }
      let worst = 0;
      for (let col = 0; col < G.NC; col++) { const j0 = G.cell0[col]; let up = 0;
        for (let k = G.nL[col] - 1; k >= 0; k--) { const j = j0 + k, upIn = up; up += net[j]; const r = (out[j] + Math.max(0, up) + Math.max(0, -upIn)) / G.vol[j]; if (r > worst) worst = r; } }
      return worst * dt;
    };
    const CFL = 0.9;   // upwind is stable while a cell loses at most all its water in a sub-step (all outflows counted); a margin
    let scale = 1, worst = rate(1), nSub = Math.max(1, Math.ceil(worst / CFL));
    if (nSub > H3.MAX_SUB) { scale = Math.min(1, CFL * H3.MAX_SUB / worst); for (let it = 0; it < 3 && rate(scale) > CFL * H3.MAX_SUB; it++) scale *= 0.85; nSub = H3.MAX_SUB; }
    this.transportScale = scale; this.nSub = nSub;
    const F = this._F; for (let e = 0; e < FL.n; e++) F[e] = scale * Fw[e];
    this._windOn = scale * Math.abs(W) > 0;
    this._transportRun(dt);
  }
  _transportRun(dt) {
    const F = this._F, nSub = this.nSub, h = dt / nSub;
    // all the fields move together, packed side by side (one pass over the faces per sub-step instead of one per field)
    this._pack();
    if (this._windOn) for (let s = 0; s < nSub; s++) this._advectAll(F, h);
    // the through-flow (residences of months) every THRU_EVERY-th update with that many steps' worth (implicit: stable)
    this._thQ += dt * this.qFac;   // (E9b: the catchment's flow now against its mean)
    if (++this._thN >= H3.THRU_EVERY) { this._throughFlowAll(this._thQ); this._thN = 0; this._thQ = 0; }
    this._mixHAll(dt);        // horizontal mixing between neighbouring columns (layer by layer)
    this._siphonAll(dt);      // the night siphon (calm nights) and the under-ice down-slope current
    this._mixVerticalAll(dt); // the mixed layer mixes fast; below it (and under ice) layers exchange slowly
    this._unpack();
  }
  _pack() {   // (a field whose process is off — fd.idle: all zero, and zero in the inflow — is not carried: _fAct the carried ones)
    const G = this.G, fs = this._fAct = this.fields.filter(fd => !fd.idle), NF = fs.length, n = G.NCELL;
    if (!this._buf || this._bufNF !== NF) { this._buf = new Float64Array(n * NF); this._dbuf = new Float64Array(n * NF); this._bufNF = NF; this._cm = new Float64Array(G.NC * NF); this._cn = new Float64Array(G.NC * NF); this._acc = new Float64Array(NF); }
    const B = this._buf; for (let f = 0; f < NF; f++) { const a = fs[f].a; for (let j = 0; j < n; j++) B[j * NF + f] = a[j]; }
  }
  _unpack() { const fs = this._fAct, NF = fs.length, B = this._buf, n = this.G.NCELL; for (let f = 0; f < NF; f++) { const a = fs[f].a; for (let j = 0; j < n; j++) a[j] = B[j * NF + f]; } }
  // one upwind sub-step of every field (the wind-driven fluxes): the face fluxes per layer, then the vertical fluxes
  // continuity requires (what a layer gains horizontally rises — or sinks — through the layers above it)
  _advectAll(F, h) {
    const G = this.G, FL = this._FL, NF = this._bufNF, B = this._buf, D = this._dbuf, net = this._net;
    D.fill(0); net.fill(0);
    for (let e = 0; e < FL.n; e++) {
      const q = F[e], ia = FL.ia[e], ib = FL.ib[e], src = (q > 0 ? ia : ib) * NF, da = ia * NF, db = ib * NF;
      net[ia] -= q; net[ib] += q;
      for (let f = 0; f < NF; f++) { const m = q * B[src + f]; D[da + f] -= m; D[db + f] += m; }
    }
    for (let col = 0; col < G.NC; col++) {
      const j0 = G.cell0[col]; let up = 0;
      for (let k = G.nL[col] - 1; k > 0; k--) {
        up += net[j0 + k]; const j = j0 + k, src = (up > 0 ? j : j - 1) * NF, dj = j * NF, du = (j - 1) * NF;
        for (let f = 0; f < NF; f++) { const m = up * B[src + f]; D[dj + f] -= m; D[du + f] += m; }
      }
    }
    for (let j = 0; j < G.NCELL; j++) { const k = h / G.vol[j], b = j * NF; for (let f = 0; f < NF; f++) B[b + f] += D[b + f] * k; }
  }
  // THROUGH-FLOW (as _throughFlow) on all fields: column means, the upstream-first implicit pass, each layer the column's change
  _throughFlowAll(dt) {
    const G = this.G, NF = this._bufNF, B = this._buf, M = this._cm, NM = this._cn, fs = this._fAct, acc = this._acc;
    M.fill(0);
    for (let col = 0; col < G.NC; col++) {
      const j0 = G.cell0[col], V = this._colV[col], mb = col * NF;
      for (let k = 0; k < G.nL[col]; k++) { const j = j0 + k, v = G.vol[j], b = j * NF; for (let f = 0; f < NF; f++) M[mb + f] += B[b + f] * v; }
      for (let f = 0; f < NF; f++) M[mb + f] /= V;
    }
    acc.fill(0);
    for (const col of this._thOrder) {
      const V = this._colV[col], ins = this._thIn[col], mb = col * NF, den = V + dt * this._thOut[col], S = this._thSrc[col];
      for (let f = 0; f < NF; f++) {
        let num = V * M[mb + f];
        for (let i = 0; i < ins.length; i += 2) num += dt * ins[i + 1] * NM[ins[i] * NF + f];
        if (S > 0) { const cin = fs[f].in; const a = dt * S * (cin ?? M[mb + f]); num += a; acc[f] += a; }
        NM[mb + f] = num / den;
      }
    }
    const ob = this.outCol * NF;
    for (let f = 0; f < NF; f++) { fs[f].inAmt = (fs[f].inAmt || 0) + acc[f]; fs[f].outAmt = (fs[f].outAmt || 0) + dt * this.qOut * NM[ob + f]; }
    for (let col = 0; col < G.NC; col++) {
      const j0 = G.cell0[col], mb = col * NF;
      for (let k = 0; k < G.nL[col]; k++) { const b = (j0 + k) * NF; for (let f = 0; f < NF; f++) B[b + f] += NM[mb + f] - M[mb + f]; }
    }
  }
  _mixHAll(dt) {
    const G = this.G, FL = this._FL, NF = this._bufNF, B = this._buf, D = this._dbuf, K = H3.K_H * REAL_S / 100;
    D.fill(0);
    for (let e = 0; e < FL.n; e++) {
      const ka = K * FL.a[e] / G.fd[FL.f[e]], da = FL.ia[e] * NF, db = FL.ib[e] * NF;
      for (let f = 0; f < NF; f++) { const m = ka * (B[da + f] - B[db + f]); D[da + f] -= m; D[db + f] += m; }
    }
    for (let j = 0; j < G.NCELL; j++) { const k = dt / G.vol[j], b = j * NF; for (let f = 0; f < NF; f++) B[b + f] += D[b + f] * k; }
  }
  _siphonAll(dt) {
    const G = this.G, iceOpen = this.iceMean < 0.5, NF = this._bufNF, B = this._buf;
    this.siphonQ = 0;
    const night = this.isNight(), calm = this.windSpeed < H3.SIPHON_WIND;
    if (iceOpen && !(night && calm)) return;
    const toW = REAL_S / H3.REAL, loop = this._loop || (this._loop = new Int32Array(2 * G.ML + 2));
    if (!this._prevB || this._prevB.length < (2 * G.ML + 2) * NF) this._prevB = new Float64Array((2 * G.ML + 2) * NF);
    const prev = this._prevB, tb = this._fAct.findIndex(fd => fd.a === this.temp);
    for (let f = 0; f < G.NF; f++) {
      if (G.fBrook[f]) continue;   // (the brook's own stretches flow: no density currents down them)
      let a = G.fa[f], b = G.fb[f]; if (G.depthMean[a] > G.depthMean[b]) { const t = a; a = b; b = t; }   // a: the shallower
      const na = G.nL[a], nb = G.nL[b]; if (nb <= na) continue;                             // only down a real slope
      const a0 = G.cell0[a], b0 = G.cell0[b], Ta = B[(a0 + na - 1) * NF + tb], Tb0 = B[b0 * NF + tb], Tbk = B[(b0 + na - 1) * NF + tb];
      let u;
      if (iceOpen) { const dT = Tb0 - Ta; if (dT <= 0) continue; u = H3.SIPHON_V * clamp(dT / H3.SIPHON_DT, 0, 2.9); }
      else { const ex = Math.abs(Tbk - 4) - Math.abs(Ta - 4); if (ex <= 0.05) continue; u = H3.ICE_SLOPE_V * clamp(ex / 0.5, 0, 1); }   // under ice: only denser water
      const q = u * G.fl[f] * Math.max(H3.DZ, G.depthMean[a]) * 0.5 * toW;   // the down-slope flow's cross-section: half the shallow depth
      let n = 0; for (let k = 0; k < na; k++) loop[n++] = a0 + k; for (let k = na - 1; k >= 0; k--) loop[n++] = b0 + k;   // down a, out along its bed into b, up b
      let vmin = Infinity; for (let i = 0; i < n; i++) vmin = Math.min(vmin, G.vol[loop[i]]);
      const steps = Math.min(20, Math.max(1, Math.ceil(q * dt / (0.4 * vmin)))), hh = dt / steps;
      this.siphonQ += q;
      for (let s = 0; s < steps; s++) {
        for (let i = 0; i < n; i++) { const src = loop[(i - 1 + n) % n] * NF; for (let fq = 0; fq < NF; fq++) prev[i * NF + fq] = B[src + fq]; }
        for (let i = 0; i < n; i++) { const j = loop[i], k = q * hh / G.vol[j], b = j * NF; for (let fq = 0; fq < NF; fq++) B[b + fq] += k * (prev[i * NF + fq] - B[b + fq]); }
      }
    }
  }
  _mixVerticalAll(dt) {
    const G = this.G, NF = this._bufNF, B = this._buf, mixM = this.mixDepth(), kMix = expm(H3.MIX_RATE * dt), kStrat = 0.5 * expm(2 * H3.K_STRAT * dt);
    const cold = seasonalTemp(this.yearFrac()) + ENV.TEMP_WEATHER[this.weather] + this.wxT < 4, tb = this._fAct.findIndex(fd => fd.a === this.temp), mean = this._acc;
    for (let col = 0; col < G.NC; col++) {
      const j0 = G.cell0[col], n = G.nL[col]; if (n < 2) continue;
      let M = this.ice[col] > 0.5 ? 0 : Math.min(G.depthMax[col], mixM);
      if (M > 0 && B[j0 * NF + tb] < 4 && cold) M = Math.min(M, Math.max(0.6, 1.5 * WIND.WEATHER[this.weather]));   // (cold water floats: see _heat)
      let sv = 0, nm = 0; mean.fill(0);
      for (let k = 0; k < n; k++) { const j = j0 + k; if (G.zMid[j] <= M) { const v = G.vol[j], b = j * NF; sv += v; for (let f = 0; f < NF; f++) mean[f] += B[b + f] * v; nm = k + 1; } }
      if (nm > 1) { for (let f = 0; f < NF; f++) mean[f] /= sv; for (let k = 0; k < nm; k++) { const b = (j0 + k) * NF; for (let f = 0; f < NF; f++) B[b + f] += (mean[f] - B[b + f]) * kMix; } }
      for (let k = Math.max(1, nm); k < n; k++) {   // below: a slow exchange with the layer above (volume-weighted, conservative)
        const j = j0 + k, i = j - 1, w = kStrat * Math.min(G.vol[i], G.vol[j]), bj = j * NF, bi = i * NF, vj = G.vol[j], vi = G.vol[i];
        for (let f = 0; f < NF; f++) { const m = (B[bi + f] - B[bj + f]) * w; B[bj + f] += m / vj; B[bi + f] -= m / vi; }
      }
    }
  }
  // THROUGH-FLOW, implicit upwind on column means in potential order (see _statics): c_new = (V c_old + dt Σ q_in c_up,new + dt S c_in)
  // / (V + dt q_out); each layer of the column takes the same change (the column's vertical profile kept; mass conserved)
  _throughFlow(fd, dt) {
    const G = this.G, c = fd.a, mean = this._colMean || (this._colMean = new Float64Array(G.NC)), newM = this._colNew || (this._colNew = new Float64Array(G.NC));
    for (let col = 0; col < G.NC; col++) { const j0 = G.cell0[col]; let s = 0; for (let k = 0; k < G.nL[col]; k++) s += c[j0 + k] * G.vol[j0 + k]; mean[col] = s / this._colV[col]; }
    const cin = fd.in ?? null; let inAmt = 0;
    for (const col of this._thOrder) {
      const V = this._colV[col], ins = this._thIn[col]; let num = V * mean[col];
      for (let i = 0; i < ins.length; i += 2) num += dt * ins[i + 1] * newM[ins[i]];
      if (this._thSrc[col] > 0) { const a = dt * this._thSrc[col] * (cin ?? mean[col]); num += a; inAmt += a; }
      newM[col] = num / (V + dt * this._thOut[col]);
    }
    fd.inAmt = (fd.inAmt || 0) + inAmt; fd.outAmt = (fd.outAmt || 0) + dt * this.qOut * newM[this.outCol];   // (m³ × concentration, cumulative)
    for (let col = 0; col < G.NC; col++) { const dlt = newM[col] - mean[col]; if (dlt === 0) continue; const j0 = G.cell0[col]; for (let k = 0; k < G.nL[col]; k++) c[j0 + k] += dlt; }
  }
  // one upwind sub-step of a field (the wind-driven fluxes): the face fluxes per layer, then the vertical fluxes continuity requires
  _advect(fd, F, h) {
    const G = this.G, FL = this._FL, c = fd.a, net = this._net, d = this._tmp;
    d.fill(0); net.fill(0);
    for (let e = 0; e < FL.n; e++) {
      const q = F[e], ia = FL.ia[e], ib = FL.ib[e], m = q > 0 ? q * c[ia] : q * c[ib];   // mass a → b
      d[ia] -= m; d[ib] += m; net[ia] -= q; net[ib] += q;
    }
    // vertical: what a layer gains horizontally rises (or sinks) through the layers above it, so every cell keeps its volume
    for (let col = 0; col < G.NC; col++) {
      const j0 = G.cell0[col]; let up = 0;
      for (let k = G.nL[col] - 1; k > 0; k--) {
        up += net[j0 + k];
        const m = up > 0 ? up * c[j0 + k] : up * c[j0 + k - 1];
        d[j0 + k] -= m; d[j0 + k - 1] += m;
      }
    }
    for (let j = 0; j < G.NCELL; j++) c[j] += d[j] * h / G.vol[j];
  }
  // (real flux K·A_real·Δc/d_real with A_real = A·REAL and d_real = d·REAL → K·A·Δc/d real m³ per real second; world volumes are
  // real/100; × REAL_S per sim second)
  _mixH(c, dt) {
    const G = this.G, ML = G.ML, d = this._tmp, K = H3.K_H * REAL_S / 100; d.fill(0);
    for (let f = 0; f < G.NF; f++) {
      const base = f * ML, a0 = G.cell0[G.fa[f]], b0 = G.cell0[G.fb[f]], e = K / G.fd[f];
      for (let k = 0; k < ML; k++) { const A = G.fA[base + k]; if (A <= 0) continue; const m = e * A * (c[a0 + k] - c[b0 + k]); d[a0 + k] -= m; d[b0 + k] += m; }
    }
    for (let j = 0; j < G.NCELL; j++) c[j] += d[j] * dt / G.vol[j];
  }
  // the night siphon: across each face whose shallower column is the colder on a calm night, a closed loop — down through the
  // shallow column, out along its bed into the deeper column at that depth, up it, and back over the surface. Under ice the
  // bed's heat drives the same down-slope loop, slower.
  _siphon(dt) {
    const G = this.G, T = this.temp, iceOpen = this.iceMean < 0.5;
    const night = this.isNight(), calm = this.windSpeed < H3.SIPHON_WIND;
    if (iceOpen && !(night && calm)) return;
    const toW = REAL_S / H3.REAL, loop = this._loop || (this._loop = new Int32Array(2 * G.ML + 2)), prev = this._prev || (this._prev = new Float64Array(2 * G.ML + 2));
    this.siphonQ = 0;
    for (let f = 0; f < G.NF; f++) {
      if (G.fBrook[f]) continue;   // (the brook's own stretches flow: no density currents down them)
      let a = G.fa[f], b = G.fb[f]; if (G.depthMean[a] > G.depthMean[b]) { const t = a; a = b; b = t; }   // a: the shallower
      const na = G.nL[a], nb = G.nL[b]; if (nb <= na) continue;                             // only down a real slope
      const a0 = G.cell0[a], b0 = G.cell0[b];
      let u;
      if (iceOpen) { const dT = T[b0] - T[a0 + na - 1]; if (dT <= 0) continue; u = H3.SIPHON_V * clamp(dT / H3.SIPHON_DT, 0, 2.9); }
      else {   // under ice: only water DENSER than the basin's at that depth (nearer 4 °C, warmed by the bed) slides down
        const ex = Math.abs(T[b0 + na - 1] - 4) - Math.abs(T[a0 + na - 1] - 4); if (ex <= 0.05) continue; u = H3.ICE_SLOPE_V * clamp(ex / 0.5, 0, 1);
      }
      const q = u * G.fl[f] * Math.max(H3.DZ, G.depthMean[a]) * 0.5 * toW;   // the down-slope flow's cross-section: half the shallow depth
      let n = 0; for (let k = 0; k < na; k++) loop[n++] = a0 + k;   // down a …
      for (let k = na - 1; k >= 0; k--) loop[n++] = b0 + k;          // … out along its bed into b at that depth, up b (b's top returns to a's top)
      let vmin = Infinity; for (let i = 0; i < n; i++) vmin = Math.min(vmin, G.vol[loop[i]]);
      const steps = Math.min(20, Math.max(1, Math.ceil(q * dt / (0.4 * vmin)))), hh = dt / steps;
      this.siphonQ += q;
      for (const fd of this.fields) {
        const c = fd.a;
        for (let s = 0; s < steps; s++) {
          for (let i = 0; i < n; i++) prev[i] = c[loop[(i - 1 + n) % n]];
          for (let i = 0; i < n; i++) { const j = loop[i]; c[j] += q * hh / G.vol[j] * (prev[i] - c[j]); }
        }
      }
    }
  }
  // ---------- vertical mixing: the mixed layer mixes fast; below it (and under ice) layers exchange slowly ----------
  _mixVertical(dt) {
    const G = this.G, mixM = this.mixDepth(), kMix = expm(H3.MIX_RATE * dt), kStrat = 0.5 * expm(2 * H3.K_STRAT * dt);
    const cold = seasonalTemp(this.yearFrac()) + ENV.TEMP_WEATHER[this.weather] + this.wxT < 4;
    for (const fd of this.fields) {
      const c = fd.a;
      for (let col = 0; col < G.NC; col++) {
        const j0 = G.cell0[col], n = G.nL[col]; if (n < 2) continue;
        let M = this.ice[col] > 0.5 ? 0 : Math.min(G.depthMax[col], mixM);
        if (M > 0 && this.temp[j0] < 4 && cold) M = Math.min(M, Math.max(0.6, 1.5 * WIND.WEATHER[this.weather]));   // (cold water floats: see _heat)
        let sv = 0, sm = 0, nm = 0;
        for (let k = 0; k < n; k++) { const j = j0 + k; if (G.zMid[j] <= M) { sv += G.vol[j]; sm += c[j] * G.vol[j]; nm = k + 1; } }
        if (nm > 1) { const mean = sm / sv; for (let k = 0; k < nm; k++) c[j0 + k] += (mean - c[j0 + k]) * kMix; }
        for (let k = Math.max(1, nm); k < n; k++) {   // below: a slow exchange with the layer above (volume-weighted, conservative)
          const j = j0 + k, i = j - 1, m = (c[i] - c[j]) * kStrat * Math.min(G.vol[i], G.vol[j]); c[j] += m / G.vol[j]; c[i] -= m / G.vol[i];
        }
      }
    }
  }

  // ============================================================ queries ==================================================
  colAt(x, y) {   // (a water cell's own column — the brook's stretches at true scale — else the coarse square's)
    const G = this.G; if (G.ownBrook) { const i = cellIndex(x, y); if (i >= 0 && G.colOfFine[i] >= 0) return G.colOfFine[i]; }
    const gx = Math.floor((x - G.X0) / G.COL), gy = Math.floor((y - G.Y0) / G.COL); return gx < 0 || gy < 0 || gx >= G.CX || gy >= G.CY ? -1 : G.gridCol[gy * G.CX + gx];
  }
  cellAt(x, y, z) { const c = this.colAt(x, y); if (c < 0) return -1; const k = Math.min(this.G.nL[c] - 1, Math.max(0, Math.floor(z / this.G.DZ))); return this.G.cell0[c] + k; }
  tempAt(x, y, z) { const j = this.cellAt(x, y, z); return j < 0 ? seasonalTemp(this.yearFrac()) : this.temp[j]; }
  iceAt(x, y) { const c = this.colAt(x, y); return c < 0 ? 0 : this.ice[c]; }
  // a field's volume-weighted total over a water body (diagnostics and budgets)
  total(a, body = 0) { const G = this.G; let s = 0; for (let j = 0; j < G.NCELL; j++) if (!body || G.body[G.colOfCell[j]] === body) s += a[j] * G.vol[j]; return s; }
  mean(a, body = 0) { const G = this.G; let s = 0, v = 0; for (let j = 0; j < G.NCELL; j++) if (!body || G.body[G.colOfCell[j]] === body) { s += a[j] * G.vol[j]; v += G.vol[j]; } return s / v; }
}
