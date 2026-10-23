// campfx3.js — THE CAMPS' LAKE EFFECTS (pure: no DOM; Node and browser) — config CAMP3 (E15), on in fish3 stageR5; null when off.
// What the lived-in camps at the Hot Brook lakes (camps3.js: their places, docks, roads and the launch, from the aerial photos) do to the
// water and its life, each by its mechanism from the published values (research_notes/Maine lake shores and catchment/
// shoreline_development_effects.md — §1 docks, §2 wood, §3 nutrients, §4 clearing, §5 the calendar, §8 "a camp as a sim entity"):
// - THE FRONTAGE: the shore's water cells in front of each camp — its fallen wood (plants3's spawning wood), its leaf fall (chem3 leafW) and,
//   where the bank's trees are not photographed, its insects' fall (littoral3 bank) as the cleared lot gives them;
// - THE DOCKS (in late May → mid-October): the bed each one covers, a share of its bed cell — the plants beneath grow in its shade
//   (plants3's patches); the shade as cover for small sunfish and no bass nests on a dock's footprint (CAMP3.FISH: the CPU fish only);
// - THE SWIM AREAS: the plants in front of about half the camps hand-pulled each June, taken ashore (out of the budget);
// - THE NUTRIENTS (§3): the septic systems' phosphate and nitrate through the groundwater into the water in front of each camp, by the days
//   it is lived in (camps3 occupied: a stable hash — nothing drawn from the sim's stream); the lots' and the gravel roads' P with the storms
//   and the snowmelt, its available share as phosphate and the rest buried as mineral particles — every gram through chem3's ledger.
// Loads are the real lakes' × the world's share of their area (fa): the 1/10 world's lakes hold 1/100 of the water, so they get 1/100 of
// the load, and a camp raises the world's water as it does the real lakes'.
import { GEO, LAND, BODIES } from './geometry.js';
import { CAMP3, WEATHER3 } from '../config.js';
import { CAMPS, docksIn, occupied, OCC_MONTH, OCC_YEARROUND } from './camps3.js';
import { CHEM3, V2 } from './chem3.js';
import { CLOCK3 } from './clock3.js';

const DAY = 86400, YEAR = CLOCK3.YEAR_LEN;
const MDAYS = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28];   // (March … February: camps3's months, yf 0 = March 1)
// a stable draw per place (not the sim's stream): which camps keep a swim area
const hashU = i => { let h = Math.imul((i + 1) ^ 0x2545f491, 0x9e3779b1); h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
// grams of P (or N) → the sim's units × 2-D cells (CHEM3.P_UGL µg/L a unit, as chem3's air and inflow loads: mg / (P_UGL · V2))
export const gToUnits = g => g * 1000 / (CHEM3.P_UGL * V2);

export class Camps3 {
  constructor(env) {
    this.env = env; const G = this.G = env.G, S = GEO.SCALE, C = CAMP3, NX = GEO.NX, NY = GEO.NY, CELL = GEO.CELL;
    this.fa = (BODIES[0].area + BODIES[1].area) / 1e4 / C.LAKES_HA;   // (the world's share of the real lakes: 1 at true scale, ~0.01 at 1/10)
    this.home = []; CAMPS.camps.forEach((c, i) => { if (c.home) this.home.push(i); });
    const nH = this.home.length;
    // ---- each lived-in camp's water: the column in front of its shore point (out along its `out` until water) and that column's surface cell
    this.hCol = new Int32Array(nH).fill(-1); this.hJ = new Int32Array(nH).fill(-1);
    this.home.forEach((i, k) => { const c = this._shoreCol(CAMPS.camps[i].shore, CAMPS.camps[i].out); this.hCol[k] = c; this.hJ[k] = c >= 0 ? G.cell0[c] : -1; });
    // ---- THE FRONTAGE: the shore's water cells (a land neighbour) within FRONT/2 of a camp's shore point; per column its share of the shore
    this.front = new Uint8Array(GEO.N); const R = C.FRONT / 2 * S, rc = Math.ceil(R / CELL) + 1;
    const shoreCell = i => { if (GEO.body[i] === LAND) return false; const r = Math.floor(i / NX), q = i % NX; for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qq = q + dq, rr = r + dr; if (qq >= 0 && rr >= 0 && qq < NX && rr < NY && GEO.body[rr * NX + qq] === LAND) return true; } return false; };
    for (const i of this.home) {
      const [sx, sy] = CAMPS.camps[i].shore, q0 = Math.floor((sx - GEO.X0) / CELL), r0 = Math.floor((sy - GEO.Y0) / CELL);
      for (let r = r0 - rc; r <= r0 + rc; r++) for (let q = q0 - rc; q <= q0 + rc; q++) {
        if (q < 0 || r < 0 || q >= NX || r >= NY) continue; const g = r * NX + q, [x, y] = GEO.cellCentre(g);
        if (Math.hypot(x - sx, y - sy) <= R && shoreCell(g)) this.front[g] = 1;
      }
    }
    { const all = new Float64Array(G.NC), fr = new Float64Array(G.NC); let n = 0;
      for (let g = 0; g < GEO.N; g++) { if (!shoreCell(g)) continue; const [x, y] = GEO.cellCentre(g), c = env.colAt(x, y); if (c < 0) continue; all[c]++; if (this.front[g]) { fr[c]++; n++; } }
      this.frontShare = new Float32Array(G.NC); for (let c = 0; c < G.NC; c++) if (all[c] > 0) this.frontShare[c] = fr[c] / all[c];
      this.nFront = n; }
    // ---- THE DOCKS: each one's footprint (for the fish) and the bed it covers per bed cell (for the plants)
    const dockA = new Map(), W = C.DOCK_W * S;   // (chem cell → m² of bed under docks)
    this.docks = []; this.dockCol = new Map();
    for (const d of CAMPS.docks) {
      const len = d.len, dl = Math.hypot(d.dir[0], d.dir[1]) || 1, dx = d.dir[0] / dl, dy = d.dir[1] / dl, D = { lake: d.lake, bx: d.base[0], by: d.base[1], dx, dy, len, hw: W / 2, area: 0 };
      const nA = Math.max(3, Math.ceil(len / (CELL / 4))), nW = 3, a1 = len * W / (nA * nW), cols = new Set();
      for (let s = 0; s < nA; s++) for (let t = 0; t < nW; t++) {
        const u = (s + 0.5) / nA * len, v = ((t + 0.5) / nW - 0.5) * W, x = D.bx + dx * u - dy * v, y = D.by + dy * u + dx * v;
        const z = GEO.depthAt(x, y), c = env.colAt(x, y); if (!(z > 0.05) || c < 0 || GEO.bodyAt(x, y) === LAND) continue;
        const j = this._bedCell(c, z); if (j < 0) continue; dockA.set(j, (dockA.get(j) || 0) + a1); D.area += a1; cols.add(c);
      }
      const id = this.docks.length; this.docks.push(D);
      for (const c of cols) { let L = this.dockCol.get(c); if (!L) this.dockCol.set(c, L = []); L.push(id); }
    }
    // ---- THE SWIM AREAS: at SWIM_SHARE of the lived-in camps' shore points (camps sharing a path to the water share one), SWIM_W across ×
    // SWIM_OUT out in front, on the bed at SWIM_Z — the part of each bed cell it covers (less a dock's own footprint there)
    const swimA = new Map(), seen = new Set(); this.nSwim = 0; this.swimArea = 0; this.swimAreas = [];
    for (const i of this.home) {
      const c0 = CAMPS.camps[i], key = c0.shore[0].toFixed(2) + ',' + c0.shore[1].toFixed(2); if (seen.has(key)) continue; seen.add(key);
      if (hashU(i) >= C.SWIM_SHARE) continue;
      const [sx, sy] = c0.shore, ol = Math.hypot(c0.out[0], c0.out[1]) || 1, ox = c0.out[0] / ol, oy = c0.out[1] / ol, SW = C.SWIM_W * S, SO = C.SWIM_OUT * S, n = 8, a1 = SW * SO / (n * n);
      let got = 0;
      for (let s = 0; s < n; s++) for (let t = 0; t < n; t++) {
        const u = (s + 0.5) / n * SO, v = ((t + 0.5) / n - 0.5) * SW, x = sx + ox * u - oy * v, y = sy + oy * u + ox * v;
        const z = GEO.depthAt(x, y), c = env.colAt(x, y); if (!(z >= C.SWIM_Z[0] && z <= C.SWIM_Z[1]) || c < 0 || GEO.bodyAt(x, y) === LAND) continue;
        const j = this._bedCell(c, z); if (j < 0) continue; swimA.set(j, (swimA.get(j) || 0) + a1); got += a1;
      }
      if (got > 0) { this.nSwim++; this.swimArea += got; this.swimAreas.push(got); }
    }
    // ---- the PATCHES plants3 grows on their own light: [chem cell, share of its bed, kind (0 dock, 1 swim area)] — at most 0.9 of a cell
    this.patches = [];
    for (const [j, a] of dockA) { const phi = Math.min(0.9, a / G.bedA[j]); if (phi > 0) this.patches.push({ j, phi, kind: 0 }); }
    for (const [j, a0] of swimA) {
      const dk = this.patches.find(p => p.j === j && p.kind === 0), a = Math.max(0, a0 - (dockA.get(j) || 0)), phi = Math.min(0.9 - (dk ? dk.phi : 0), a / G.bedA[j]);
      if (phi > 0) this.patches.push({ j, phi, kind: 1 });
    }
    // ---- THE SEPTIC SYSTEMS: a day's P and N (g, × fa) while lived in; each camp's plume time to the water (s): phosphate, nitrate
    this.pDay = new Float64Array(nH); this.nDay = new Float64Array(nH); this.tauP = new Float64Array(nH); this.tauN = new Float64Array(nH);
    this.SP = new Float64Array(nH); this.SN = new Float64Array(nH);
    this.home.forEach((i, k) => {
      const c = CAMPS.camps[i], d = Math.max(1, c.toWater);   // (real m from the camp to the water)
      this.pDay[k] = C.SEPTIC_P * 1000 / C.SEPTIC_D * this.fa; this.nDay[k] = C.N_PERSON * C.PERSONS * (1 - C.N_LOSS) * this.fa;
      this.tauP[k] = d / C.P_V * YEAR; this.tauN[k] = d / C.GW_V * DAY;
    });
    // ---- THE GRAVEL ROADS within ROAD_R of the water: each segment's area (real ha) into its nearest water's surface cell; the launch's lot
    const roadHa = new Map(); this.roadKm = 0; const RR = C.ROAD_R * S;
    for (const rd of CAMPS.roads) {
      if (rd.kind !== 'gravel') continue; const P = rd.pts;
      for (let k = 0; k + 1 < P.length; k++) {
        const mx = (P[k][0] + P[k + 1][0]) / 2, my = (P[k][1] + P[k + 1][1]) / 2, L = Math.hypot(P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]);
        if (!(L > 0) || -GEO.shoreDist(mx, my) > RR) continue;
        const c = this._nearCol(mx, my, RR + 2 * CELL); if (c < 0) continue; const j = G.cell0[c];
        roadHa.set(j, (roadHa.get(j) || 0) + L / S * C.ROAD_W / 1e4); this.roadKm += L / S / 1000;
      }
    }
    this.roadJ = Int32Array.from(roadHa.keys()); this.roadHa = Float64Array.from(roadHa.values());
    this.launchJ = -1; if (CAMPS.launch) { const c = this._shoreCol(CAMPS.launch.shore, CAMPS.launch.out); if (c >= 0) this.launchJ = G.cell0[c]; }
    // the tallies (world grams): the septic systems' P and N, the lots', roads' and launch's P (all forms), what went in available (by water
    // body: 1 Upper, 2 Lower, 3 the brook) and what was buried at once; the plants pulled from the swim areas (g DW)
    this.tally = { septicP: 0, septicN: 0, lotP: 0, roadP: 0, launchP: 0, buriedP: 0, avail: [0, 0, 0, 0], pulled: 0 };
    this._swimYr = -1;
  }
  // the column of the water in front of a shore point: out along `out` until wet, else the nearest water within a few cells
  _shoreCol(shore, out) {
    const ol = Math.hypot(out[0], out[1]) || 1, ox = out[0] / ol, oy = out[1] / ol, CELL = GEO.CELL;
    for (let d = 0; d <= 12 * CELL; d += CELL / 2) { const x = shore[0] + ox * d, y = shore[1] + oy * d, c = this.env.colAt(x, y); if (c >= 0 && GEO.bodyAt(x, y) !== LAND && GEO.depthAt(x, y) > 0.05) return c; }
    return this._nearCol(shore[0], shore[1], 12 * CELL);
  }
  // the column of the nearest wet GEO cell to (x, y) within R (m, world); −1 if none
  _nearCol(x, y, R) {
    const CELL = GEO.CELL, NX = GEO.NX, NY = GEO.NY, q0 = Math.floor((x - GEO.X0) / CELL), r0 = Math.floor((y - GEO.Y0) / CELL), rc = Math.ceil(R / CELL);
    let best = -1, bd = R * R;
    for (let r = Math.max(0, r0 - rc); r <= Math.min(NY - 1, r0 + rc); r++) for (let q = Math.max(0, q0 - rc); q <= Math.min(NX - 1, q0 + rc); q++) {
      const g = r * NX + q; if (GEO.body[g] === LAND || !(GEO.depth[g] > 0.05)) continue;
      const [cx, cy] = GEO.cellCentre(g), d = (cx - x) ** 2 + (cy - y) ** 2; if (d > bd) continue; const c = this.env.colAt(cx, cy); if (c >= 0) { bd = d; best = c; }
    }
    return best;
  }
  // the chem cell of column c whose bed lies at depth z (plants3's layer rule: z in (k·DZ, (k+1)·DZ], the bottom layer all below) — or the
  // nearest layer of that column with bed
  _bedCell(c, z) {
    const G = this.G, DZ = G.DZ, n = G.nL[c]; let k = Math.floor(z / DZ); if (k * DZ >= z) k--; k = Math.min(Math.max(0, k), n - 1);
    for (let q = 0; q < n; q++) { for (const kk of q ? [k - q, k + q] : [k]) if (kk >= 0 && kk < n && G.bedA[G.cell0[c] + kk] > 0) return G.cell0[c] + kk; }
    return -1;
  }

  // ============================================================ what the others read ====================================
  // the light under the docks for the plants beneath (plants3 patches): DOCK_LIGHT while the docks are in
  dockLight(yf = this.env.yearFrac()) { return docksIn(yf) ? CAMP3.DOCK_LIGHT : 1; }
  // a shore water cell g's wood weight from one wooded land edge w: at a camp's frontage WOOD_FRONT of the undeveloped (plants3)
  woodEdge(g, w) { return this.front[g] ? Math.min(w, CAMP3.WOOD_FRONT * (GEO.canopy ? 1 : w)) : w; }
  // … its insects' fall weight w: where the bank's trees are not photographed, the frontage's cleared share as open bank (littoral3)
  fallEdge(g, w) { return this.front[g] && !GEO.canopy ? w * (1 - CAMP3.CLEAR) + Math.min(w, CAMP3.OPEN) * CAMP3.CLEAR : w; }
  // the leaf fall per column (chem3 leafW, after its normalisation): × LEAF_FRONT over the column's shore in front of camps
  leafAdjust(leafW) { for (let c = 0; c < leafW.length; c++) if (this.frontShare[c] > 0) leafW[c] *= 1 - (1 - CAMP3.LEAF_FRONT) * this.frontShare[c]; }
  docksInNow() { return docksIn(this.env.yearFrac()); }
  // (FISH) the docks' shade now: in, the sun high, the sky clear
  shadeOn() { const e = this.env; return !!CAMP3.FISH && docksIn(e.yearFrac()) && e.sun > CAMP3.SHADE_SUN && e.weather === 0; }
  _inDock(D, x, y) { const px = x - D.bx, py = y - D.by, t = px * D.dx + py * D.dy; return t >= 0 && t <= D.len && Math.abs(px * D.dy - py * D.dx) <= D.hw; }
  // is (x, y) on a dock's footprint (whatever the season)
  underDock(x, y) {
    const c = this.env.colAt(x, y); if (c < 0) return false; const L = this.dockCol.get(c); if (!L) return false;
    for (const d of L) if (this._inDock(this.docks[d], x, y)) return true;
    return false;
  }
  // the nearest dock within R of (x, y): its axis point nearest (out[0], out[1]) and the distance (out[2]); false if none
  dockNear(x, y, R, out) {
    let best = R;
    for (const D of this.docks) {
      const t = Math.min(D.len, Math.max(0, (x - D.bx) * D.dx + (y - D.by) * D.dy)), px = D.bx + D.dx * t, py = D.by + D.dy * t, d = Math.hypot(px - x, py - y);
      if (d < best) { best = d; out[0] = px; out[1] = py; out[2] = d; }
    }
    return best < R;
  }
  // the available P (kg a year, real) the camps send to lake b (1 Upper, 2 Lower) on average: the septic systems at their expected days, the
  // lots', roads' and launch's available shares — §3's L_camp, for its whole-lake formula
  annualAvail(b) {
    const G = this.G, C = CAMP3, sd = OCC_MONTH.reduce((t, f, m) => t + f * MDAYS[m], 0); let kg = 0;
    this.home.forEach((i, k) => { const j = this.hJ[k]; if (j < 0 || G.body[G.colOfCell[j]] !== b) return; kg += C.SEPTIC_P / C.SEPTIC_D * (CAMPS.camps[i].yr ? OCC_YEARROUND * 365 : sd) + C.LOT_P * C.LOT_AV; });
    this.roadJ.forEach((j, r) => { if (G.body[G.colOfCell[j]] === b) kg += this.roadHa[r] * C.ROAD_P * C.ROAD_AV; });
    if (this.launchJ >= 0 && G.body[G.colOfCell[this.launchJ]] === b) kg += C.LAUNCH_P * C.ROAD_AV;
    return kg;
  }

  // ============================================================ the date jumped / opened =================================
  // the septic systems' groundwater stores at their steady state for the date (the camps have stood for decades): a year of the expected
  // use (each month's share; the year-round homes' OCC_YEARROUND) decayed at each plume's τ, summed over all the years before
  jump() {
    const yf = this.env.yearFrac(), nH = this.home.length;
    for (let k = 0; k < nH; k++) {
      const c = CAMPS.camps[this.home[k]]; let sp = 0, sn = 0;
      for (let d = 0; d < 365; d++) {
        const y = ((yf - (d + 0.5) / 365) % 1 + 1) % 1, f = c.yr ? OCC_YEARROUND : OCC_MONTH[Math.min(11, Math.floor(y * 12))], t = (d + 0.5) * DAY;
        sp += this.pDay[k] * f * Math.exp(-t / this.tauP[k]); sn += this.nDay[k] * f * Math.exp(-t / this.tauN[k]);
      }
      this.SP[k] = sp / -Math.expm1(-YEAR / this.tauP[k]); this.SN[k] = sn / -Math.expm1(-YEAR / this.tauN[k]);
    }
  }

  // ============================================================ step ===================================================
  step(dt) {
    const e = this.env, ch = e.chem; if (!ch) return;
    const C = CAMP3, yf = e.yearFrac(), day = Math.floor(e.time / DAY), T = this.tally;
    // THE SWIM AREAS: pulled once each June (from SWIM_YF; a lake opened more than ~5 weeks after skips that year's)
    if (e.plants && this.nSwim) { const yr = Math.floor(e.time / YEAR); if (yf >= C.SWIM_YF && yf < C.SWIM_YF + 0.1 && this._swimYr !== yr) { this._swimYr = yr; T.pulled += e.plants.pullPatches(1, C.SWIM_LEFT); } }
    // THE SEPTIC SYSTEMS: a lived-in day's load into the groundwater store; the plume's share of it reaching the water over dt
    for (let k = 0; k < this.home.length; k++) {
      const j = this.hJ[k]; if (j < 0) continue;
      if (occupied(this.home[k], yf, day)) { this.SP[k] += this.pDay[k] * dt / DAY; this.SN[k] += this.nDay[k] * dt / DAY; }
      const xp = this.SP[k] * -Math.expm1(-dt / this.tauP[k]), xn = this.SN[k] * -Math.expm1(-dt / this.tauN[k]);
      this.SP[k] -= xp; this.SN[k] -= xn; this._srp(j, xp); this._no3(j, xn); T.septicP += xp; T.septicN += xn;
    }
    // THE LOTS, THE ROADS, THE LAUNCH: their year's P (× fa) washed in with the catchment's flow (its particulate P's law: a year's mean 1)
    const fq = WEATHER3.HYDRO ? Math.pow(e.qFac, 1 + CHEM3.PP_B) / CHEM3.PP_NORM : 1, perKg = 1000 * dt / YEAR * this.fa * fq;   // (g over dt for 1 kg a year)
    for (let k = 0; k < this.home.length; k++) { const j = this.hJ[k]; if (j < 0) continue; const g = C.LOT_P * perKg; this._srp(j, g * C.LOT_AV); this._bury(g * (1 - C.LOT_AV)); T.lotP += g; }
    for (let r = 0; r < this.roadJ.length; r++) { const g = this.roadHa[r] * C.ROAD_P * perKg; this._srp(this.roadJ[r], g * C.ROAD_AV); this._bury(g * (1 - C.ROAD_AV)); T.roadP += g; }
    if (this.launchJ >= 0) { const g = C.LAUNCH_P * perKg; this._srp(this.launchJ, g * C.ROAD_AV); this._bury(g * (1 - C.ROAD_AV)); T.launchP += g; }
  }
  // g of P as phosphate into chem cell j (the ledger's in); of N as nitrate; of P as mineral particles settling and buried at once
  _srp(j, g) { if (!(g > 0)) return; const ch = this.env.chem, x = gToUnits(g); ch.phos[j] += x / ch.w[j]; ch.ledger.inP += x; this.tally.avail[this.G.body[this.G.colOfCell[j]]] += g; }
  _no3(j, g) { if (!(g > 0)) return; const ch = this.env.chem, x = gToUnits(g); ch.no3[j] += x / ch.w[j]; ch.ledger.inN += x; }
  _bury(g) { if (!(g > 0)) return; const L = this.env.chem.ledger, x = gToUnits(g); L.inP += x; L.buryP += x; this.tally.buriedP += g; }
}
