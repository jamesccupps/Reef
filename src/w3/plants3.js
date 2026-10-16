// plants3.js — the 3-D lakes' aquatic plants (pure: no DOM; Node and browser). Stage 7a: the weeds as a field on the bed —
// per bed cell and growth form, the living shoots and the storage they overwinter in (rhizomes, tubers, turions; g dry mass
// per m² of that cell's bed), growing with the light at their canopy, the temperature and the nutrients, dying back in autumn,
// with their N and P inside the lakes' closed budgets. What the others read: the zooplankton's refuge in the weed volume
// (chem3 plantRef), the stems that hide small fish (stems per m² per column), the O₂ the beds make by day and use at night,
// the shade floating leaves cast on the bed.
// Research: docs/research_notes/Whole lake 3D fish simulation/macrophytes.md (§8 the parameters per growth form; §7 the
// suggested mechanisms; sources and their weaknesses there).
import { clamp } from '../core.js';
import { GEO, LAND } from './geometry.js';
import { ENV, ICE, SEASON } from '../config.js';
import { TS, DAY3, CLOCK3 } from './clock3.js';

// THE GROWTH FORMS (Hot Brook is soft, coloured water — Hellquist 1980's group I/II pondweeds; Nitella and mosses, not Chara,
// the deep low form). depth: the bed depths it roots in (m); lightLim: the share of the surface's (season-mean) light at its
// canopy top where its growth just meets its respiration — its DEPTH LIMIT emerges there (floating-leaved and emergent forms
// are set by their depth window instead: their leaves are in full light); Bmax its stand's peak shoot mass (g DW/m²); mu its
// maximum net growth at 20 °C (/day); tStart the water temperature its shoots grow from (°C); carry the share of the summer's
// mass that overwinters (storage, or evergreen shoots); N / P its tissue content (% of dry mass); root the share of its P
// taken from the bed (Carignan 1982); hFull its canopy's height at full biomass (m, ≤ the water's depth); stem g DW per shoot;
// refuge/cover how much its weed volume shelters zooplankton and its stems hide fish (floating-leaved and emergent 0.3×);
// core (floating-leaved and emergent): the depths it grows best in — deeper, its leaves must climb farther on its stores (a
// lily is densest ~1 m, gone by ~2.5–2.9 m; an emergent stand thins past ~0.6 m); KL its light half-saturation (share of the
// day-mean surface light: K½ 80–100 µmol/m²/s ≈ 15 %; Nitella and moss lower); shelter: the floating-leaved and emergent
// forms need shelter from the waves (their leaves tear) — land in at least this many of 8 directions within SHELTER_R (full
// growth one more): coves, not open shores (the aerial photo's likely lily beds are in Upper's south and south-west coves)
export const FORMS3 = [
  { key: 'EM', name: 'Emergent (pickerelweed, bulrush)', depth: [0, 1.0], window: true, core: [0, 0.6], shelter: 4, Bmax: 500, mu: 0.03, tStart: 9, carry: 0.5,
    N: 2.1, P: 0.14, root: 1.0, hFull: 99, stem: 5, refuge: 0.3, cover: 0.6 },
  { key: 'FL', name: 'Floating-leaved (lilies, watershield)', depth: [0.3, 2.5], window: true, core: [0.5, 1.4], shelter: 5, Bmax: 120, mu: 0.035, tStart: 9, carry: 0.75,
    N: 2.7, P: 0.20, root: 0.85, hFull: 99, stem: 2, refuge: 0.3, cover: 0.8 },
  { key: 'SC', name: 'Submerged canopy (pondweeds, bladderwort)', depth: [0.4, 6], lightLim: 0.18, KL: 0.15, Bmax: 150, mu: 0.10, tStart: 6, carry: 0.25,
    N: 2.0, P: 0.15, root: 0.8, hFull: 3.0, stem: 0.5, refuge: 1.0, cover: 1.0 },
  { key: 'IS', name: 'Isoetid rosettes (pipewort, quillwort)', depth: [0, 1.5], lightLim: 0.40, KL: 0.15, Bmax: 100, mu: 0.008, tStart: 3, carry: 0.9,
    N: 1.5, P: 0.10, root: 0.87, hFull: 0.12, stem: 0.3, refuge: 0.1, cover: 0.2, mineral: true },
  { key: 'DM', name: 'Deep low meadow (Nitella, moss)', depth: [1.0, 6], lightLim: 0.07, KL: 0.08, Bmax: 40, mu: 0.02, tStart: 3, carry: 0.9,
    N: 2.0, P: 0.15, root: 0.3, hFull: 0.2, stem: 0.2, refuge: 0.15, cover: 0.2 },
];
export const NF3 = FORMS3.length;
export const PL3 = {
  RESP: 0.022,          // /day at 20 °C: the shoots' maintenance respiration (0.02–0.024; Q10 below)
  Q10: 2.5,             // growth and respiration (2–3)
  SLOW: 3,              // growth runs every SLOW-th water update (with SLOW × dt)
  SPROUT: 0.10,         // /day: storage feeds the new shoots in spring at up to this (CHARISMA ≤ 10 %)
  SEED: 0.5,            // g DW/m² a bare cell in a form's range is colonised to (spores, fragments, seeds: the bed is never sterile)
  YF_STORE: 0.53,       // year-fraction (~Sep 10) from which the shoots reallocate to storage (PCLake: day 259 + 15)
  STORE_RATE: 0.07,     // /day, autumn: shoots → storage (the carry share) and litter (the rest)
  SHADE_FL: 0.9,        // floating leaves at full cover cut the light below them by this
  SELF: 0.01,           // m²/g: a canopy's self-shading (0.006–0.02)
  WAVE_D: 0.15,         // m: the wave mortality's half-saturation depth (CHARISMA) — the shallowest beds are scoured
  WAVE_M: 0.03,         // /day of the shoots at the water's edge
  ICE_SCOUR: 0.5,       // m: shoots shallower than this are lost when the ice forms (ice scour)
  // N and P in the sim's units per g DW per % of tissue content (the water's units are abstract: these set the beds' share of
  // the lakes' nutrients — ~10 % of the P at a summer's peak)
  P_UNIT: 0.003, N_UNIT: 0.0028,   // (N:P by mass ~13 in plants vs ~7 in algae — the units carry that ratio)
  DEATH_DISS: 0.25,     // share of a dying shoot's P released dissolved into the water (the rest stays in the bed's store)
  O2_YIELD: 1.07,       // g O₂ per g DW of growth (and of respiration)
  // the effects: the weed volume (PVI) → a zooplankton refuge 0.8 × logistic(PVI: ½ at 20 %); stems → fish cover (a searching
  // predator's capture falls as 1/(1 + (S/S50)³), S50 ~150 stems/m² — Crowder & Cooper 1982; Savino & Stein 1982)
  REF_MAX: 0.8, PVI_HALF: 0.2, PVI_STEEP: 0.05, S50: 150,
  SHELTER_R: 20,        // m (world; ~200 m real): a direction is sheltered if land lies within this
};

const MIX = 1e-9;
export class Plants3 {
  constructor(env) {
    this.env = env; const ch = this.chem = env.chem, G = this.G = env.G;
    const cells = this.cells = ch.bedCells, nb = cells.length;
    this.Bs = Array.from({ length: NF3 }, () => new Float32Array(nb));   // shoots, g DW/m²
    this.Br = Array.from({ length: NF3 }, () => new Float32Array(nb));   // storage, g DW/m²
    this.gnet = Array.from({ length: NF3 }, () => new Float32Array(nb)); // the last net growth, g DW/m²/day (the O₂ it makes)
    // each bed cell: its column, its bed depth (the cell's mid-depth — the layer its bed lies in), its water cells above
    this.col = new Int32Array(nb); this.zb = new Float32Array(nb);
    for (let i = 0; i < nb; i++) { const j = cells[i]; this.col[i] = G.colOfCell[j]; this.zb[i] = Math.max(0.05, G.zMid[j]); }
    // each column's SHELTER from the waves: how many of 8 directions meet land within SHELTER_R (env3 computes it: ice uses it too)
    this.shelter = env.shelter;
    // per column: the stems (per m², for the fish), the floating-leaf cover, the weed volume's refuge; per water cell: the
    // refuge (chem3.plantRef, read by the zooplankton feeding)
    this.stems = new Float32Array(G.NC); this.flCover = new Float32Array(G.NC); this.pvi = new Float32Array(G.NC);
    this.ref = new Float32Array(G.NC); this._colA = new Float32Array(G.NC); this._canopy = new Float32Array(G.NC);   // (_canopy: the weeds' height per column, m)
    if (!ch.plantRef) ch.plantRef = new Float32Array(G.NCELL);
    this._n = 0; this.prod = 0; this.litter = 0;
    this.seed();
  }
  // a lake's plants at its start: each form in its range, at the share of its stand the season allows (from storage)
  seed() {
    const yf = this.env.yearFrac(), T = this.env.temp;
    for (let f = 0; f < NF3; f++) {
      const F = FORMS3[f];
      for (let i = 0; i < this.cells.length; i++) {
        if (!this._inRange(F, i)) continue;
        const grow = yf > 0.15 && yf < 0.6 && T[this.cells[i]] > F.tStart;   // (growing season: part of its stand up)
        this.Br[f][i] = F.Bmax * 0.15; this.Bs[f][i] = grow ? F.Bmax * 0.15 : F.Bmax * (F.carry > 0.8 ? 0.6 : 0.02);
      }
    }
    this._outputs();
  }
  // the date JUMPED (the view's season buttons): each stand takes the new season's shape at once, conserving its mass, N and P —
  // into dormancy the shoots go to storage at the form's carry share and the rest dies (its N and P to the water and the bed);
  // into the growing season the storage sprouts (the evergreen rosettes and mosses keep their shoots either way)
  jump() {
    const e = this.env, ch = this.chem, G = this.G, yf = e.yearFrac(), T = e.temp, dormantYr = yf >= PL3.YF_STORE || yf < 0.1;
    for (let f = 0; f < NF3; f++) {
      const F = FORMS3[f], Bs = this.Bs[f], Br = this.Br[f]; if (F.carry > 0.8) continue;
      for (let i = 0; i < this.cells.length; i++) {
        const j = this.cells[i];
        if (dormantYr || T[j] <= F.tStart) {
          const b = Bs[i]; if (!(b > 0)) continue;
          Br[i] += b * F.carry; this.litter += this._die(f, i, b * (1 - F.carry), j, G.bedA[j], ch.a[j], ch.w[j]); Bs[i] = 0;
        } else { const m = Br[i] * 0.85; Br[i] -= m; Bs[i] += m; }
        this.gnet[f][i] = 0;
      }
    }
    this._outputs();
  }
  _inRange(F, i) {
    const z = this.zb[i]; if (z < F.depth[0] || z > F.depth[1]) return false;
    return true;
  }
  // N and P held by the plants (the sim's units) — counted in chem3's inventories
  inventoryP() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].P * PL3.P_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } return s; }
  inventoryN() { let s = 0; for (let f = 0; f < NF3; f++) { const u = FORMS3[f].N * PL3.N_UNIT, Bs = this.Bs[f], Br = this.Br[f]; for (let i = 0; i < this.cells.length; i++) s += (Bs[i] + Br[i]) * u * this.G.bedA[this.cells[i]]; } return s; }
  total(f) { let s = 0; const B = this.Bs[f]; for (let i = 0; i < this.cells.length; i++) s += B[i] * this.G.bedA[this.cells[i]]; return s; }   // g DW of shoots

  // ============================================================ step ===================================================
  step(dt) {
    if (++this._n >= PL3.SLOW) { this._grow(dt * this._n); this._n = 0; this._outputs(); }
    this._o2(dt);
  }
  // GROWTH, PHENOLOGY, DEATH over ds (s): per cell and form
  _grow(ds) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, yf = e.yearFrac(), dd = ds / DAY3, kd = ch.attenuation();
    const store = yf >= PL3.YF_STORE && yf < 0.9, spring = yf > 0.1 && yf < PL3.YF_STORE;
    const seasonL = e.lightDay;   // (the season's noon height: the light's share of the summer's)
    let prod = 0, lit = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], a = ch.a[j], w = ch.w[j], z = this.zb[i], Tj = T[j];
      const qT = Math.pow(PL3.Q10, (Tj - 20) / 10), iceCut = 1 - ICE.LIGHT_CUT * e.ice[c];
      // the light at the bed: the surface's day-mean × the ice × the water × the floating leaves' shade
      const flShade = 1 - PL3.SHADE_FL * this.flCover[c];
      for (let f = 0; f < NF3; f++) {
        const F = FORMS3[f], Bs = this.Bs[f], Br = this.Br[f];
        if (!this._inRange(F, i)) { if (Bs[i] + Br[i] > 0) { lit += this._die(f, i, Bs[i] + Br[i], j, A, a, w); Bs[i] = 0; Br[i] = 0; } this.gnet[f][i] = 0; continue; }
        let b = Bs[i];
        // COLONISATION: a bare cell in the form's range gets a propagule (spores, fragments, seeds) — paid for in nutrients
        if (b < PL3.SEED && Br[i] < PL3.SEED && Tj > F.tStart && !store) b += this._take(F, PL3.SEED - b, j, A, a, w);
        // SPRING: storage feeds the shoots from the form's start temperature
        if (spring && Tj > F.tStart && Br[i] > 0) { const s = Math.min(Br[i], Br[i] * PL3.SPROUT * dd); Br[i] -= s; b += s; }
        // GROWTH: light at the canopy top (submerged forms; floating-leaved and emergent leaves are in full light, their growth
        // set by their depth window), the temperature, the nutrients (P from the bed and the water; N from the water). LOSSES:
        // the form's own — respiration and, past it, what the field's light limits imply: epiphyte shading, sloughing, grazing,
        // the cost of next year's stores — set so that its growth just pays them at its light limit (lightLim of the day-mean
        // surface light): its DEPTH LIMIT emerges there, while plants near the surface grow light-saturated
        let fL, lossR = PL3.RESP;
        if (F.window) fL = (z <= F.core[1] ? (z >= F.core[0] ? 1 : clamp((z - F.depth[0]) / Math.max(0.05, F.core[0] - F.depth[0]), 0, 1)) : clamp((F.depth[1] - z) / (F.depth[1] - F.core[1]), 0, 1))
          * clamp(this.shelter[c] - F.shelter + 1, 0, 2) / 2;   // (and the waves: half growth at its shelter, full one direction more)
        else {
          const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1)), Itop = iceCut * flShade * Math.exp(-kd * (z - h)) * Math.exp(-PL3.SELF * b * 0.3);   // (share of the surface's)
          fL = Itop * seasonL / (Itop * seasonL + F.KL);
          const phi = F.lightLim / (F.lightLim + F.KL); lossR = Math.max(PL3.RESP, F.mu * phi / (1 - phi));
        }
        const sp = ch.sedP[j], ph = ch.phos[j], nT = ch.nh4[j] + ch.no3[j];
        const fP = (sp * F.root + ph * 4 * (1 - F.root)) / (sp * F.root + ph * 4 * (1 - F.root) + 0.15), fN = nT / (nT + 0.1);
        const growing = Tj > F.tStart && !store;
        const rate = growing ? (F.mu + lossR) * qT * fL * Math.min(fP, fN) - lossR * qT : -lossR * qT * 0.3;   // (/day; dormant: a third)
        let g = rate > 0 ? rate * Math.max(0, 1 - b / F.Bmax) * b * dd : 0;   // (space limits the net growth: a good site fills its stand)
        if (g > 0) { g = this._take(F, g, j, A, a, w); b += g; prod += g * A; }
        this.gnet[f][i] = g / Math.max(MIX, dd);
        let loss = rate < 0 ? -rate * b * dd : 0;
        // and the shallowest beds' wave scour, autumn's reallocation, ice scour
        if (z < 0.6) loss += PL3.WAVE_M * PL3.WAVE_D / (z + PL3.WAVE_D) * b * dd;
        if (store && b > 0) {   // shoots → storage (carry) and litter (the rest)
          const m = Math.min(b, b * PL3.STORE_RATE * dd);
          Br[i] += m * F.carry; loss += m * (1 - F.carry); b -= m * F.carry;
        }
        if (e.ice[c] > 0.5 && z < PL3.ICE_SCOUR) loss += b * Math.min(1, dd);
        loss = Math.min(loss, b);
        if (loss > 0) { lit += this._die(f, i, loss, j, A, a, w); b -= loss; }
        Bs[i] = b;
        // storage slowly ages (respiration of the reserves)
        if (Br[i] > 0) { const r = Br[i] * PL3.RESP * 0.1 * qT * dd; Br[i] -= r; lit += this._die(f, i, r, j, A, a, w, true); }
      }
    }
    this.prod += prod; this.litter += lit;
  }
  // build g (g DW/m²) of form F in bed cell j: its N and P (per m² of bed → the cell's units) from the bed's store (the roots'
  // share) and the water (the shoots'), at most half of what each holds a step; returns the g DW actually built
  _take(F, g, j, A, a, w) {
    const ch = this.chem, pNeed = g * A * F.P * PL3.P_UNIT, nNeed = g * A * F.N * PL3.N_UNIT;
    const pBed = Math.min(pNeed * F.root, ch.sedP[j] * a * 0.5), pW = Math.min(pNeed - pBed, ch.phos[j] * w * 0.5), Pav = pBed + pW;
    const nAv = (ch.nh4[j] + ch.no3[j]) * w * 0.5;
    const frac = Math.min(1, Pav / Math.max(MIX, pNeed), nAv / Math.max(MIX, nNeed)); if (!(frac > 0)) return 0;
    const pTake = pNeed * frac; if (Pav > 0) { ch.sedP[j] -= pTake * (pBed / Pav) / a; ch.phos[j] -= pTake * (pW / Pav) / w; }
    const nTake = nNeed * frac, fromA = Math.min(nTake, ch.nh4[j] * w); ch.nh4[j] -= fromA / w; ch.no3[j] -= (nTake - fromA) / w;
    return g * frac;
  }
  // a dying mass m (g DW/m²): its N to ammonium; its P DEATH_DISS to the water, the rest to the bed's store; its body to the
  // bed's organic layer (food for its worms and scuds). Returns the g DW lost.
  _die(f, i, m, j, A, a, w, quiet = false) {
    const F = FORMS3[f], ch = this.chem, p = m * A * F.P * PL3.P_UNIT, n = m * A * F.N * PL3.N_UNIT;
    ch.phos[j] += p * PL3.DEATH_DISS / w; ch.sedP[j] += p * (1 - PL3.DEATH_DISS) / a; ch.nh4[j] += n / w;
    if (!quiet) ch.sedOM[j] += m * A / a;
    return m * A;
  }
  // O₂: the shoots photosynthesise by the hour's light (growth's O₂ spread over the day as the light comes) and respire always,
  // in the water about their canopy (the bed cell's and the ones above it the canopy reaches)
  _o2(dt) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, dd = dt / DAY3;
    const now = e.sun / Math.max(1e-3, e.dayFrac * 2 / Math.PI);   // (the sun's curve over its day's mean: a day's sum is the day's)
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], A = G.bedA[j], qT = Math.pow(PL3.Q10, (T[j] - 20) / 10);
      let gross = 0, resp = 0, h = 0; const z = this.zb[i];
      for (let f = 0; f < NF3; f++) {
        const b = this.Bs[f][i]; if (!(b > 0)) continue; const F = FORMS3[f];
        resp += PL3.RESP * qT * b;
        gross += (this.gnet[f][i] + PL3.RESP * qT * b) * now;   // (the day's gross production, made as the light comes)
        h = Math.max(h, F.window ? z : Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1)));
      }
      if (!(gross > 0 || resp > 0)) continue;
      const dO = (gross - resp) * A * dd * PL3.O2_YIELD / ENV.O2_MGL;   // normalised O₂ × m³
      // spread over the water the canopy fills: the bed cell and the layers above it up to the canopy's top
      const c = this.col[i], j0 = G.cell0[c], kTop = Math.max(0, Math.floor((z - h) / G.DZ)), kB = j - j0;
      let V = 0; for (let k = Math.min(kTop, kB); k <= kB; k++) V += G.vol[j0 + k];
      for (let k = Math.min(kTop, kB); k <= kB; k++) ch.o2[j0 + k] = Math.max(0, ch.o2[j0 + k] + dO / V);
    }
  }
  // what the others read: per column the stems per m² (fish cover), the floating leaves' cover (shade), the weed volume (PVI)
  // and its zooplankton refuge — the refuge applied to the column's water cells the canopy reaches
  _outputs() {
    const G = this.G, ch = this.chem, st = this.stems, fl = this.flCover, pv = this.pvi, cA = this._colA;
    st.fill(0); fl.fill(0); pv.fill(0); cA.fill(0); this._canopy.fill(0);
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], c = this.col[i], A = G.bedA[j], z = this.zb[i]; cA[c] += A;
      for (let f = 0; f < NF3; f++) {
        const b = this.Bs[f][i]; if (!(b > 0)) continue; const F = FORMS3[f], cov = clamp(b / F.Bmax, 0, 1);
        st[c] += b / F.stem * A * F.cover;
        if (F.key === 'FL') fl[c] += cov * A;
        const h = Math.min(z, F.hFull * clamp(b / F.Bmax, 0.05, 1));
        pv[c] += cov * (h / z) * F.refuge * A;
        this._canopy[c] = Math.max(this._canopy[c], F.window ? z : h);
      }
    }
    for (let c = 0; c < G.NC; c++) {
      if (cA[c] > 0) { st[c] /= cA[c]; fl[c] = clamp(fl[c] / cA[c], 0, 1); pv[c] /= cA[c]; }
      this.ref[c] = PL3.REF_MAX / (1 + Math.exp(-(pv[c] - PL3.PVI_HALF) / PL3.PVI_STEEP));
      if (pv[c] < 0.02) this.ref[c] = 0;
      const j0 = G.cell0[c], n = G.nL[c], top = G.depthMax[c] - this._canopy[c];
      for (let k = 0; k < n; k++) { const j = j0 + k; ch.plantRef[j] = G.zMid[j] >= top - 0.25 ? this.ref[c] : 0; }
    }
  }
  // fish cover at column c: the share of a searching predator's strikes the stems foil (1 − 1/(1 + (S/S50)³))
  coverAt(c) { if (c < 0) return 0; const s = this.stems[c] / PL3.S50; return 1 - 1 / (1 + s * s * s); }
}
