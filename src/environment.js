// environment.js — day/night, seasons, weather, a depth-stratified temperature profile,
// wind-driven surface current, and dissolved-oxygen & nutrient fields. Pure.
//
// WET/DRY MASK: the field grid spans the full W×H rectangle, but ~35% of its cells lie entirely below the lake bed.
// A cell is WET if any part of it is above the bed (its top is above the deepest bed point across its column), so a
// column's wet cells are rows 0..bedRow[cx] and each row's wet cells are one contiguous run lo[cy]..hi[cy] (the basin
// is unimodal). Every process loop visits WET cells only, diffusion is no-flux at the bed, all means are over wet
// cells, and cellOf() clamps any point to its column's bed cell. Dry cells stay inert at their constructed defaults
// (array shapes unchanged → save-compatible). Partial bed cells count as whole cells (unit volume).
//
// MASS BUDGET: every N/P transfer debits its source. Sources/sinks that cross the lake boundary are tallied in
// `this.ledger` (inflow, outflow, sediment burial, denitrification, N-fixation) so the inventory can be audited.
import { WORLD, GRID, ENV, NUTRIENT, SED_P, NCYCLE, MICROBE, MACRO, SEASON, THERMAL, WIND, TURBIDITY, FLOW, OUTFLOW, PHYTO, CYANO, BASIN, bedY } from './config.js';
import { rand, clamp, TAU } from './core.js';

const W = WORLD.W, H = WORLD.H;
const COLS = GRID.FIELD_COLS, ROWS = GRID.FIELD_ROWS;
const CW = W / COLS, CH = H / ROWS;
// calendar month names — index 0 = March (year-fraction 0 = mid-spring), running through the year
const MONTHS = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];

// ambient surface light from time-of-day (0..1, sunrise .25 / noon .5 / sunset .75)
function daylight(t) {
  const x = (t - 0.25) / 0.5;
  return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
}

// wet/dry mask from the basin profile (pure function of config): per column the deepest wet row, per row the wet run.
export function buildWetMask() {
  const bedRow = new Int32Array(COLS), wet = new Uint8Array(COLS * ROWS);
  const lo = new Int32Array(ROWS).fill(COLS), hi = new Int32Array(ROWS).fill(-1);
  const S = 16;
  for (let cx = 0; cx < COLS; cx++) {
    let maxBed = 0;   // deepest bed point across the column's x-span (both edges + interior samples)
    for (let k = 0; k <= S; k++) { const b = bedY(Math.min(W, (cx + k / S) * CW)); if (b > maxBed) maxBed = b; }
    const c = W * BASIN.CENTER; if (c >= cx * CW && c <= (cx + 1) * CW) maxBed = Math.max(maxBed, bedY(c));   // basin centre
    bedRow[cx] = clamp(Math.floor(maxBed / CH - 1e-9), 0, ROWS - 1);   // a row is wet iff its top lies above the bed
  }
  for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) if (cy <= bedRow[cx]) { if (cx < lo[cy]) lo[cy] = cx; if (cx > hi[cy]) hi[cy] = cx; }
  // the wet set of a row is one contiguous run (unimodal basin) — define it that way so loops & the mask agree exactly
  let n = 0;
  for (let cy = 0; cy < ROWS; cy++) for (let cx = lo[cy]; cx <= hi[cy]; cx++) { wet[cy * COLS + cx] = 1; n++; }
  for (let cx = 0; cx < COLS; cx++) { let r = 0; while (r + 1 < ROWS && wet[(r + 1) * COLS + cx]) r++; bedRow[cx] = r; }
  return { bedRow, wet, lo, hi, n };
}

export class Environment {
  constructor() {
    this.t = 0.30;                 // start mid-morning
    this.weather = 0;              // 0 clear,1 cloudy,2 rain,3 storm
    this.weatherTimer = ENV.WEATHER_DWELL[0];
    this.flash = 0;                // lightning visual (render only)
    this.light = daylight(this.t);
    this.tempC = ENV.TEMP_BASE;    // surface / epilimnion temperature (incl. the diurnal swing)
    this.tempDiel = 0;             // the diurnal part of tempC (same lag) — damped with depth in tempAt
    this.tempHypo = ENV.TEMP_BASE; // hypolimnion temperature: its own slow seasonal state (THERMAL.HYPO_TAU_*)
    this.tempNorm = 0.5;
    this.year = 0;                 // years elapsed (fractional)
    this.strat = 0;                // thermal stratification strength 0..1 (1 = strong summer)
    this.wind = 0; this._windT = 0;// signed surface current (px/s)
    this.turbidity = TURBIDITY.BASE; // water murk 0..1 (algae + sediment)
    this.mask = buildWetMask();    // wet/dry cells (static: depends only on the basin config)
    this.o2 = new Float32Array(COLS * ROWS).fill(ENV.O2_START);
    // dissolved inorganic nitrogen, split by the N cycle: ammonium (reduced) ⇌ nitrate (oxidized)
    this.nh4 = new Float32Array(COLS * ROWS).fill(NCYCLE.NH4_START);  // ammonium — from decomposition; phyto prefers it
    this.no3 = new Float32Array(COLS * ROWS).fill(NCYCLE.NO3_START);  // nitrate — made by nitrification, lost to denitrification
    this.phos = new Float32Array(COLS * ROWS).fill(NUTRIENT.P_START); // phosphate (the usual limiting nutrient)
    this.sedP = new Float32Array(COLS).fill(SED_P.START);             // benthic bound-P store per column (Mortimer redox)
    this.phyto = new Float32Array(COLS * ROWS).fill(PHYTO.START); // phytoplankton biomass field
    this._meanPhyto = PHYTO.START;
    this.cyano = new Float32Array(COLS * ROWS).fill(CYANO.START); // cyanobacteria (N-fixing strain) biomass field
    this._meanCyano = CYANO.START;     // surface-band (scum) density
    this.dom = new Float32Array(COLS * ROWS).fill(MICROBE.START); // dissolved organic matter — the bacterial substrate (microbial loop)
    this._meanDOM = MICROBE.START;
    this._tmp = new Float32Array(COLS * ROWS);
    // cumulative boundary fluxes (diagnostic, not saved): P/N in by the inflow, out by the outlet, P buried in the deep
    // sediment, N lost to denitrification (N₂) and gained by cyanobacterial N-fixation. Inventory change = in − out.
    this.ledger = { inP: 0, inN: 0, outP: 0, outN: 0, buryP: 0, denitN: 0, fixN: 0 };
  }

  idx(cx, cy) { return cy * COLS + cx; }
  // field cell of a world point — clamped to its column's deepest WET cell, so nothing ever reads/writes rock
  cellOf(x, y) {
    const cx = clamp((x / CW) | 0, 0, COLS - 1), br = this.mask.bedRow[cx];
    let cy = (y / CH) | 0; cy = cy < 0 ? 0 : cy > br ? br : cy;
    return cy * COLS + cx;
  }
  isWet(i) { return this.mask.wet[i] === 1; }
  // mean of a field over WET cells (dry cells are rock and excluded)
  wetMean(f) { const { lo, hi } = this.mask; let s = 0; for (let cy = 0; cy < ROWS; cy++) { const b = cy * COLS; for (let cx = lo[cy]; cx <= hi[cy]; cx++) s += f[b + cx]; } return s / this.mask.n; }
  wetSum(f) { return this.wetMean(f) * this.mask.n; }
  // effective light attenuation rises with turbidity (murky water = shallower photic zone)
  attenuation() { return ENV.LIGHT_ATTEN * (1 + TURBIDITY.ATTEN * this.turbidity); }
  // light reaching depth y (surface + turbidity attenuation)
  lightAtDepth(y) { return this.light * Math.exp(-this.attenuation() * (y / H)); }
  // visual-range multiplier (turbid water shortens how far fish can see)
  clarity() { return clamp(1 - this.turbidity * TURBIDITY.SENSE, 0.35, 1); }
  // Secchi depth: depth (world px) at which light falls to ~10% of the surface
  secchiDepth() { return clamp(H * Math.LN10 / this.attenuation(), 0, H); }

  oxygenAt(x, y) { return this.o2[this.cellOf(x, y)]; }
  meanO2() { return this.wetMean(this.o2); }
  oxygenGrad(x, y) { // positive => more O2 above than below
    const a = this.oxygenAt(x, Math.max(2, y - CH));
    const b = this.oxygenAt(x, Math.min(H - 2, y + CH));
    return a - b;
  }
  // Liebig co-limitation availability [0,1] for growth: min of the N- and P-Monod factors.
  // Available N = ammonium + nitrate (the total dissolved inorganic N pool).
  nutrientAt(x, y) { const i = this.cellOf(x, y); const n = this.nh4[i] + this.no3[i]; return Math.min(n / (n + NUTRIENT.KN), this.phos[i] / (this.phos[i] + NUTRIENT.KP)); }
  dinAt(x, y) { const i = this.cellOf(x, y); return this.nh4[i] + this.no3[i]; }   // total dissolved inorganic N
  nh4At(x, y) { return this.nh4[this.cellOf(x, y)]; }
  no3At(x, y) { return this.no3[this.cellOf(x, y)]; }
  phosAt(x, y) { return this.phos[this.cellOf(x, y)]; }
  meanNh4() { return this.wetMean(this.nh4); }
  meanNo3() { return this.wetMean(this.no3); }
  meanDin() { return this.meanNh4() + this.meanNo3(); }   // total dissolved inorganic N (nh4 + no3)
  // fraction of inorganic N held as nitrate (the oxidized, nitrification-product form) — a dashboard diagnostic
  nitrateFrac() { const a = this.meanNh4(), o = this.meanNo3(); return a + o > 1e-6 ? o / (a + o) : 0; }
  meanPhos() { return this.wetMean(this.phos); }
  meanSedP() { let s = 0; for (let i = 0; i < this.sedP.length; i++) s += this.sedP[i]; return s / this.sedP.length; }
  // total P / N held in the water + sediment + algae + DOM (wet cells; excludes detritus particles & plants, which
  // the World owns) — the inventory the mass-budget audit tracks
  inventoryP() { return this.wetSum(this.phos) + this.wetSum(this.phyto) * PHYTO.P_USE + this.wetSum(this.cyano) * CYANO.P_USE + this.wetSum(this.dom) * NUTRIENT.ORGANIC_P + this.meanSedP() * COLS; }
  inventoryN() { return this.wetSum(this.nh4) + this.wetSum(this.no3) + this.wetSum(this.phyto) * PHYTO.N_USE + this.wetSum(this.cyano) * CYANO.N_USE + this.wetSum(this.dom) * (1 - NUTRIENT.ORGANIC_P); }
  // sediment phosphorus — the Mortimer redox switch / internal loading. Per column, at its BED-ADJACENT WET cell, the
  // bound-P store takes in settling algae (debited: their P is bound, their N ammonified back to the water) + a baseline
  // P rain scavenged from the water, BINDS dissolved P while the bottom is oxic, and RELEASES legacy P when it goes anoxic
  // (reusing the summer dead zone) → a self-reinforcing eutrophication feedback. Settling/binding are headroom-limited at
  // MAX (no P destroyed); a slow first-order BURIAL moves bound P out of the lake for good (tallied). Pure/deterministic.
  sedimentP(dt) {
    const br = this.mask.bedRow, ph = this.phyto, phos = this.phos, nh4 = this.nh4, sed = this.sedP;
    for (let cx = 0; cx < COLS; cx++) {
      const i = br[cx] * COLS + cx;
      const o2here = this.o2[i] > 0 ? this.o2[i] : 0;
      // settling: algae sink onto the sediment (∝ bed-cell phyto) + a baseline P rain — both DEBITED from the water
      let room = SED_P.MAX - sed[cx];
      if (room > 0) {
        const bio = Math.min(ph[i], SED_P.SETTLE * ph[i] * dt / PHYTO.P_USE, room / PHYTO.P_USE);
        ph[i] -= bio; sed[cx] += bio * PHYTO.P_USE; nh4[i] += bio * PHYTO.N_USE; room -= bio * PHYTO.P_USE;
        const rain = Math.min(phos[i], SED_P.SETTLE * SED_P.RAIN_BASE * dt, room);
        phos[i] -= rain; sed[cx] += rain; room -= rain;
      }
      if (o2here < SED_P.O2_THRESH) {                                  // anoxic → release iron-bound P (internal loading)
        const rel = SED_P.RELEASE * sed[cx] * (1 - o2here / SED_P.O2_THRESH) * dt;
        sed[cx] -= rel; phos[i] += rel;
      } else if (room > 0) {                                           // oxic → bind dissolved P back into the sediment
        const bnd = Math.min(SED_P.BIND * phos[i] * dt, room);
        phos[i] -= bnd; sed[cx] += bnd;
      }
      const bury = SED_P.BURY * sed[cx] * dt;                          // permanent burial (out of the lake)
      sed[cx] -= bury; this.ledger.buryP += bury;
    }
  }
  // nitrogen cycle: NITRIFICATION (NH₄→NO₃, aerobic, O₂-consuming) ⇌ DENITRIFICATION (NO₃→N₂ gas, anaerobic,
  // a permanent N sink) — the two are redox-separated and MUTUALLY EXCLUSIVE per cell at the anoxic threshold
  // `DENITRIF_O2`, the SAME O₂ cline the sediment-P Mortimer switch uses (one coherent redox boundary at 0.25).
  // Above it (OXIC): nitrification runs (O₂-Monod-scaled) and adds a real O₂ demand to the oxygenated water
  // column — it contributes to the stratifying-summer O₂ decline, as real hypolimnetic nitrification does.
  // Below it (ANOXIC): nitrifiers (obligate aerobes) HALT — so nitrification never draws down the established
  // dead zone's residual O₂ (that floor stays governed by the benthic sediment demand) — and denitrification
  // takes over, removing N for good (tallied as ledger.denitN) → with N-fixation it sets the N balance.
  nitrogenCycle(dt) {
    const nh4 = this.nh4, no3 = this.no3, o2 = this.o2, { lo, hi } = this.mask;
    let lost = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const oxy = o2[i] > 0 ? o2[i] : 0;   // a transiently negative O₂ must never drive a rate
        if (oxy >= NCYCLE.DENITRIF_O2) {
          // OXIC: nitrification (ammonium → nitrate), rate ∝ ammonium × O₂ availability (Monod); it consumes O₂.
          const nitr = NCYCLE.NITRIF * nh4[i] * (oxy / (oxy + NCYCLE.NITRIF_O2_HALF)) * dt;
          nh4[i] -= nitr; no3[i] += nitr; o2[i] = Math.max(0, oxy - nitr * NCYCLE.NITRIF_O2_COST);
        } else {
          // ANOXIC: nitrifiers halt (obligate aerobes); denitrification reduces nitrate to N₂ gas — lost for good.
          const dn = NCYCLE.DENITRIF * no3[i] * (1 - oxy / NCYCLE.DENITRIF_O2) * dt;
          no3[i] -= dn; lost += dn;
        }
      }
    }
    this.ledger.denitN += lost;
  }
  // microbial loop: heterotrophic bacteria decompose the dissolved-organic-matter pool (`dom`, fed by settling
  // detritus, algal decay and grazers' egestion) at a TEMPERATURE-DEPENDENT (Q10) and O₂-LIMITED (Monod) rate —
  // consuming O₂ (bacterial respiration) and REMINERALIZING the bound N (→ ammonium) + P (→ phosphate), Redfield-split.
  // The nutrient released exactly equals the DOM consumed (mass-conserving). Cold/hypoxic deep water decomposes slowly
  // → DOM accumulates over the stratified summer and pulses at turnover. O₂ is clamped ≥ 0 before the Monod term
  // (a transiently negative O₂ would otherwise run decomposition backwards). Pure / deterministic (no RNG).
  microbialLoop(dt) {
    const dom = this.dom, o2 = this.o2, nh4 = this.nh4, phos = this.phos, tmp = this._tmp, { lo, hi } = this.mask;
    const pFrac = NUTRIENT.ORGANIC_P;
    let sum = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH;
      const q10 = Math.pow(MICROBE.Q10, (this.tempAt(0, y) - MICROBE.REF_TEMP) / 10);  // warm → fast, cold → slow
      const baseRate = MICROBE.BACT * q10 * dt;
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const m = dom[i];
        if (m > 1e-6) {
          const ox = o2[i] > 0 ? o2[i] : 0;
          const o2mon = ox / (ox + MICROBE.O2_HALF);          // aerobic decomposition slows in hypoxia
          let d = baseRate * o2mon * m;
          if (d > m) d = m;
          dom[i] = m - d;
          phos[i] += d * pFrac;                              // remineralize P → phosphate
          nh4[i] += d * (1 - pFrac);                         // remineralize N → ammonium (the reduced form)
          o2[i] = Math.max(0, ox - d * MICROBE.O2_COST);     // bacterial respiration O₂ demand
        }
        sum += dom[i];
      }
    }
    this._meanDOM = sum / this.mask.n;
    diffuse(dom, tmp, MICROBE.DIFFUSE * dt, this.mask);
  }
  // cyanobacteria: the N-FIXING producer strain. Growth = light × P-Monod × warmth — deliberately NO N-Monod
  // (it fixes its own N), so it wins exactly when the N cycle has drawn the lake to low-N : high-P. It draws the
  // SAME phosphate as green phyto (the competition), is BUOYANT (floats to a surface scum in calm water; storms
  // mix it down), produces/consumes O₂, shades the water, and is a net N SOURCE: its biomass N is fixed from N₂ and
  // returned on decay, plus a leak of fixed N to ammonium on growth (both tallied as ledger.fixN). Runs AFTER the
  // green-phyto loop so green phyto (faster) gets first call on the shared P.
  cyanobacteria(dt) {
    const cyn = this.cyano, phos = this.phos, nh4 = this.nh4, no3 = this.no3, dom = this.dom, o2 = this.o2, tmp = this._tmp, { lo, hi } = this.mask;
    const pU = CYANO.P_USE, nU = CYANO.N_USE, R = CYANO.RECYCLE, toDom = (1 - R) * (pU + nU);
    let surfSum = 0, surfCount = 0, fixed = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH, lit = this.lightAtDepth(y), frac = (cy + 0.5) / ROWS;
      const tempFac = clamp(1 - Math.abs(this.tempAt(0, y) - CYANO.TEMP_OPT) / CYANO.TEMP_TOL, 0, 1);   // warm-water bloomer
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const cb = cyn[i], p = phos[i];
        const pMon = p / (p + NUTRIENT.KP);                                                             // P-limited only (N-fixing)
        // PER-CAPITA (logistic) growth from the standing biomass + a tiny inoculum (resting cells / akinetes) — a bloom
        // must BUILD UP through a warm, bright, P-rich spell. (It was zero-order — every lit cell produced cyano from
        // nothing and buoyancy stacked a whole column's output into a toxic row-0 scum every summer.)
        let cgrow = CYANO.GROW * lit * pMon * tempFac * (cb + CYANO.INOC) * (1 - cb / CYANO.CAP) * dt;
        if (cgrow * pU > p) cgrow = p / pU;                                                              // never take P the cell lacks
        if (cgrow < 0) cgrow = 0;
        const cdecay = CYANO.DECAY * cb * dt;
        cyn[i] = cb + cgrow - cdecay;
        phos[i] = p - cgrow * pU + cdecay * R * pU;                                                      // draw P; decay returns it
        // N: take dissolved N first (ammonium, then nitrate) and FIX N₂ only for the deficit — fixation is costly, so
        // it is the self-regulating N source that switches on exactly when the lake is N-poor. A small share of the
        // freshly fixed N leaks to ammonium (FIX_N per unit of N-fixing growth).
        const need = cgrow * nU, a = nh4[i], takeA = need < a ? need : a, o = no3[i], takeO = need - takeA < o ? need - takeA : o;
        const fix = need - takeA - takeO, leak = need > 0 ? cgrow * CYANO.FIX_N * (fix / need) : 0;
        nh4[i] = a - takeA + leak + cdecay * R * nU;                                                     // fixed-N leak + decay N
        no3[i] = o - takeO;
        dom[i] += cdecay * toDom;                                                                        // the rest → DOM
        fixed += fix + leak;
        o2[i] += (CYANO.O2_PHOTO * cb * lit - CYANO.O2_RESP * cb) * dt;
        if (frac < CYANO.SCUM_BAND) { surfSum += cyn[i]; surfCount++; }   // surface-scum density (the band it floats into)
      }
    }
    this.ledger.fixN += fixed;
    this._meanCyano = surfCount ? surfSum / surfCount : 0;
    // buoyancy: in CALM water cyano floats up one row per step (forms the surface scum); storm turbulence suppresses it.
    // The transfer is capped at the receiving cell's headroom so a saturated scum backs up instead of exceeding CAP
    // (mass-conserving — no biomass is lost, it just can't pile past the surface mat's max density). Wet cells only.
    const rise = clamp(CYANO.BUOY * (1 - ENV.TURBULENCE[this.weather]) * dt, 0, 0.9);
    if (rise > 1e-4) {
      const br = this.mask.bedRow;
      for (let cx = 0; cx < COLS; cx++)
        for (let cy = 1; cy <= br[cx]; cy++) { const i = cy * COLS + cx, up = i - COLS, f = Math.min(cyn[i] * rise, CYANO.CAP - cyn[up]); if (f > 0) { cyn[i] -= f; cyn[up] += f; } }
    }
    diffuse(cyn, tmp, CYANO.DIFFUSE * dt, this.mask);
  }
  phytoAt(x, y) { return this.phyto[this.cellOf(x, y)]; }
  meanPhyto() { return this._meanPhyto; }
  cyanoAt(x, y) { return this.cyano[this.cellOf(x, y)]; }
  meanCyano() { return this._meanCyano; }   // surface-band cyanobacteria (scum) density
  domAt(x, y) { return this.dom[this.cellOf(x, y)]; }
  meanDOM() { return this._meanDOM; }        // mean dissolved-organic-matter (bacterial substrate) density
  // add dissolved organic matter at (x,y): settling detritus dissolves into this pool for bacteria to decompose
  addDOM(x, y, amt) { this.dom[this.cellOf(x, y)] += amt; }
  // grazers (zooplankton, mussels, snails, hungry planktivores) eat algae at a point. Nothing is destroyed: the grazed
  // biomass's N+P is returned at the graze site — GRAZE_EXCRETE of it excreted as ammonium+phosphate, the rest egested
  // as DOM (the consumers hold no nutrient pool). Returns the biomass eaten (the grazer's food).
  grazePhyto(x, y, amt) {
    const i = this.cellOf(x, y); const g = Math.min(this.phyto[i], amt);
    if (g > 0) {
      const ex = NUTRIENT.GRAZE_EXCRETE;
      this.phyto[i] -= g;
      this.phos[i] += g * ex * PHYTO.P_USE; this.nh4[i] += g * ex * PHYTO.N_USE;
      this.dom[i] += g * (1 - ex) * (PHYTO.P_USE + PHYTO.N_USE);
    }
    return g;
  }
  addO2(x, y, amt) { this.o2[this.cellOf(x, y)] += amt; }
  // add nutrient at (x,y), split into P and N by pFrac (= phosphate share; default organic/Redfield ratio,
  // the inflow passes a P-enriched fraction). The N share enters as AMMONIUM (decomposition/runoff release
  // reduced N); the nitrogen cycle then nitrifies it to nitrate. So detritus/recycling release N-rich, runoff P-rich.
  addNutrient(x, y, amt, pFrac = NUTRIENT.ORGANIC_P) { const i = this.cellOf(x, y); this.phos[i] += amt * pFrac; this.nh4[i] += amt * (1 - pFrac); }
  // draw nutrient for plant uptake (split organic across both pools; N drawn ammonium-first then nitrate);
  // returns what was actually taken
  takeNutrient(x, y, amt) {
    const i = this.cellOf(x, y);
    const pT = Math.min(this.phos[i], amt * NUTRIENT.ORGANIC_P); this.phos[i] -= pT;
    let nNeed = amt * (1 - NUTRIENT.ORGANIC_P);
    const aT = Math.min(this.nh4[i], nNeed); this.nh4[i] -= aT; nNeed -= aT;
    const oT = Math.min(this.no3[i], nNeed); this.no3[i] -= oT;
    return pT + aT + oT;
  }
  saturation() { return clamp(1.0 - (this.tempC - 18) * ENV.SAT_TEMP_K, 0.5, 1.05); }
  metabolismFactor() { return 1 + (this.tempC - 18) * ENV.METAB_TEMP_K; }
  weatherName() { return ['Clear', 'Cloudy', 'Rain', 'Storm'][this.weather]; }

  // ---- depth-stratified temperature (warm epilimnion → thermocline → cold hypolimnion) ----
  _stratFrac(y) {
    const frac = clamp(y / H, 0, 1);
    const s = clamp((frac - THERMAL.EPI_FRAC) / (THERMAL.HYPO_FRAC - THERMAL.EPI_FRAC), 0, 1);
    return s * s * (3 - 2 * s);   // smoothstep across the thermocline
  }
  // the surface diurnal swing is a shallow skin effect (damped with depth); below the thermocline the water blends,
  // in proportion to stratification, toward the hypolimnion's own slow temperature (tempHypo) — so the deep is cold
  // and steady in summer and the whole column mixes to one temperature at turnover.
  tempAt(x, y) {
    const upper = this.tempC - this.tempDiel * (1 - Math.exp(-clamp(y / H, 0, 1) / THERMAL.DIEL_DEPTH));
    return upper + (this.tempHypo - upper) * this.strat * this._stratFrac(y);
  }
  metabAt(x, y) { return 1 + (this.tempAt(x, y) - 18) * ENV.METAB_TEMP_K; }
  // wind-driven surface current: strongest at the surface, fades to 0 below SURFACE_FRAC of depth
  windAt(y) { return this.wind * clamp(1 - clamp(y / H, 0, 1) / WIND.SURFACE_FRAC, 0, 1); }
  // gentle inflow→outflow through-current (rightward, weaker with depth)
  flowAt(y) { return FLOW.SPEED * (1 - 0.5 * clamp(y / H, 0, 1)); }
  // total horizontal current a drifter feels = wind (surface) + through-flow
  currentAt(x, y) { return this.windAt(y) + this.flowAt(y); }
  seasonName() {
    const p = ((this.year % 1) + 1) % 1;
    return p < 0.125 || p >= 0.875 ? 'Spring' : p < 0.375 ? 'Summer' : p < 0.625 ? 'Autumn' : 'Winter';
  }
  // calendar month (a year = 12 months). Display-only; aligned so month 0 = March (mid-spring, frac 0), summer
  // around the thermal peak. Functional seasonal timing (spawning) keys off the continuous year-fraction, not this.
  monthIndex() { return Math.floor((((this.year % 1) + 1) % 1) * 12) % 12; }   // 0..11
  monthName() { return MONTHS[this.monthIndex()]; }
  // continuous fraction through the current year [0,1) — the precise clock seasonal behaviour keys off
  yearFrac() { return (((this.year % 1) + 1) % 1); }

  setWeather(w) { this.weather = w; this.weatherTimer = ENV.WEATHER_DWELL[w] * (0.6 + rand() * 0.8); this.forced = true; }

  // `world` is optional: without one (env-only tests) the calendar advances on its own clock and the plant/fish
  // O₂ terms are skipped.
  step(dt, world) {
    // --- time of day ---
    this.t = (this.t + dt / ENV.DAY_LEN) % 1;
    const cover = ENV.CLOUD_COVER[this.weather];
    this.light = daylight(this.t) * (1 - cover);

    // --- weather state machine ---
    if (!this.forced) {
      this.weatherTimer -= dt;
      if (this.weatherTimer <= 0) {
        // random walk between adjacent-ish states with a pull toward clear
        const r = rand();
        if (this.weather === 0) this.weather = r < 0.6 ? 0 : 1;
        else if (this.weather === 1) this.weather = r < 0.4 ? 0 : r < 0.85 ? 2 : 1;
        else if (this.weather === 2) this.weather = r < 0.45 ? 1 : r < 0.8 ? 3 : 2;
        else this.weather = r < 0.7 ? 2 : 3;
        this.weatherTimer = ENV.WEATHER_DWELL[this.weather] * (0.6 + rand() * 0.8);
      }
    }
    if (this.weather === 3 && rand() < dt * 0.28) this.flash = 0.8 + rand() * 0.2; // occasional lightning
    this.flash = Math.max(0, this.flash - dt * 3.5);

    // --- season: a slow yearly cycle that warms/cools the lake and drives stratification ---
    this.year = world ? world.time / SEASON.YEAR_LEN : this.year + dt / SEASON.YEAR_LEN;
    const seasonal = SEASON.TEMP_AMP * Math.sin(this.year * TAU);   // +amp summer, −amp winter
    // strong stratification in summer; collapses to 0 in spring & autumn (turnover) and winter (mixed). Strong wind
    // (rain/storm, above the calm baseline) ERODES it; while it is storming (wind ≥ RESTRAT_MAX_WIND) the lake can't
    // re-stratify at all, so a sustained storm genuinely breaks the thermocline (the old relax-vs-erosion balance
    // left a 120 s summer storm at strat ≈ 0.83). Normal breezes and rain only nibble at it.
    const windMul = WIND.WEATHER[this.weather];
    if (windMul < THERMAL.RESTRAT_MAX_WIND) this.strat += (Math.max(0, Math.sin(this.year * TAU)) - this.strat) * clamp(dt * THERMAL.STRAT_RELAX, 0, 1);
    this.strat = Math.max(0, this.strat - THERMAL.WIND_EROSION * Math.max(0, windMul - 1.0) * dt);

    // --- surface (epilimnion) temperature: seasonal + diurnal + weather, lags slightly ---
    const diurnal = Math.sin((this.t - 0.30) * Math.PI * 2);
    const relax = clamp(dt * ENV.TEMP_RELAX, 0, 1);
    const target = ENV.TEMP_BASE + seasonal + ENV.TEMP_DIURNAL * diurnal + ENV.TEMP_WEATHER[this.weather];
    this.tempC += (target - this.tempC) * relax;
    this.tempDiel += (ENV.TEMP_DIURNAL * diurnal - this.tempDiel) * relax;   // the diurnal component (same lag)
    this.tempNorm = clamp((this.tempC - (ENV.TEMP_BASE - 12)) / 22, 0, 1);
    // hypolimnion: follows the diurnal-free surface temperature fast while mixed, barely at all once stratified
    const hk = (1 - this.strat) * (1 - this.strat) / THERMAL.HYPO_TAU_MIX + 1 / THERMAL.HYPO_TAU_STRAT;
    this.tempHypo += (this.tempC - this.tempDiel - this.tempHypo) * clamp(hk * dt, 0, 1);

    // --- wind: a slowly reversing surface current, stronger in foul weather ---
    this._windT += dt;
    this.wind = WIND.BASE * Math.sin(this._windT * 0.045) * WIND.WEATHER[this.weather];

    // --- turbidity: murk from suspended algae (green phyto + a heavily-shading cyanobacteria surface scum) + storm sediment ---
    const algae = clamp(this._meanPhyto / PHYTO.CAP + CYANO.TURB * (this._meanCyano / CYANO.CAP), 0, 1);
    const turbTarget = clamp(TURBIDITY.BASE + TURBIDITY.FROM_ALGAE * algae + TURBIDITY.FROM_STORM[this.weather], 0, 1);
    this.turbidity += (turbTarget - this.turbidity) * clamp(dt * TURBIDITY.RELAX, 0, 1);

    // the inflow stream loads P-enriched nutrient into the left littoral (runoff → the eutrophication driver)
    const load = FLOW.NUTRIENT * dt;
    this.addNutrient(12, H * 0.22, load, NUTRIENT.INFLOW_P);
    this.ledger.inP += load * NUTRIENT.INFLOW_P; this.ledger.inN += load * (1 - NUTRIENT.INFLOW_P);

    this._updateFields(dt, world);
  }

  _updateFields(dt, world) {
    const o2 = this.o2, tmp = this._tmp, phos = this.phos, nh4 = this.nh4, no3 = this.no3, dom = this.dom;
    const M = this.mask, { lo, hi, bedRow } = M;
    const turb = ENV.TURBULENCE[this.weather];
    const sat = this.saturation();
    const rainBoost = ENV.RAIN[this.weather];

    // phytoplankton field: grow with light × **Liebig-co-limited** nutrient (min of N- and P-Monod), taking
    // Redfield N+P (never more than the cell holds), producing O₂ by day and respiring/decomposing always; decayed
    // biomass returns ALL its N+P (RECYCLE straight to ammonium+phosphate, the rest via DOM). The dominant open-water
    // producer — and, when it blooms, the cause of night/decay O₂ crashes. Wet cells only.
    const ph = this.phyto, pU = PHYTO.P_USE, nU = PHYTO.N_USE, R = PHYTO.RECYCLE, toDom = (1 - R) * (pU + nU);
    let litSum = 0, litCount = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const frac = (cy + 0.5) / ROWS, lit = this.lightAtDepth((cy + 0.5) * CH), band = frac < PHYTO.BAND;
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const b = ph[i], p = phos[i], a = nh4[i], nTot = a + no3[i];                                // available inorganic N
        const nLim = Math.min(nTot / (nTot + NUTRIENT.KN), p / (p + NUTRIENT.KP));                  // Liebig minimum
        let growth = PHYTO.GROW * lit * nLim * (1 - b / PHYTO.CAP) * dt;
        if (growth * pU > p) growth = p / pU;                                                      // stoichiometric ceiling
        if (growth * nU > nTot) growth = nTot / nU;
        if (growth < 0) growth = 0;
        const decay = PHYTO.DECAY * b * dt;
        ph[i] = b + growth - decay;
        phos[i] = p - growth * pU + decay * R * pU;
        // N uptake: draw ammonium first (energetically preferred), then nitrate. Decomposed biomass recycles as ammonium.
        const nNeed = growth * nU, upA = nNeed < a ? nNeed : a;
        nh4[i] = a - upA + decay * R * nU;
        if (nNeed > upA) no3[i] -= nNeed - upA;
        dom[i] += decay * toDom;
        o2[i] += (PHYTO.O2_PHOTO * b * lit - PHYTO.O2_RESP * b) * dt;
        if (band) { litSum += ph[i]; litCount++; }   // algae density where it lives (the photic zone)
      }
    }
    this._meanPhyto = litCount ? litSum / litCount : 0;

    // cyanobacteria: the N-fixing strain competes for the (now-reduced) P, floats to a surface scum, leaks fixed N
    this.cyanobacteria(dt);

    if (world) {
      // photosynthesis (rooted plants add O2 by day) / plant respiration (night)
      for (const p of world.plants) {
        if (p.dead) continue;
        const topY = p.baseY - p.height, om = p.o2 != null ? p.o2 : MACRO[p.v].o2;   // per-plant photosynthetic capacity (genes × variety)
        const lit = this.lightAtDepth(topY);
        if (lit > 0.02) this.addO2(p.x, topY, ENV.O2_PHOTO * p.biomass * lit * om * dt);
        else this.addO2(p.x, topY, -ENV.O2_PLANT_NIGHT * p.biomass * om * dt);
      }
      // fish respiration (consume O2) — scaled by the temperature at the fish's depth
      for (const a of world.agents) {
        if (a.dead) continue;
        this.addO2(a.x, a.y, -ENV.O2_RESP_FISH * (a.sp ? a.sp.respiration : 1) * a.size * this.metabAt(a.x, a.y) * dt);
      }
    }

    // oxygen demand below the epilimnion (drives hypolimnetic hypoxia): a SEDIMENT demand at each column's bed cell
    // (the benthic sediment respiration) + a weaker water-column demand (sinking particulate organic matter), both
    // ramping with depth. With weak vertical mixing when stratified, this drives the summer hypolimnion hypoxic.
    const ramp = f => (f <= THERMAL.EPI_FRAC ? 0 : (f - THERMAL.EPI_FRAC) / (1 - THERMAL.EPI_FRAC));
    const pel = ENV.O2_PELAGIC * dt;
    for (let cy = 0; cy < ROWS; cy++) {
      const d = pel * ramp((cy + 0.5) / ROWS);
      if (d <= 0) continue;
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) o2[i] = Math.max(0, o2[i] - d);
    }
    for (let cx = 0; cx < COLS; cx++) {
      const by = bedRow[cx], i = by * COLS + cx, d = ENV.O2_SED * dt * ramp((by + 0.5) / ROWS);
      if (d > 0) o2[i] = Math.max(0, o2[i] - d);
    }

    // microbial loop: bacteria decompose DOM at a Q10 temperature- & O₂-limited rate, consuming O₂ and
    // remineralizing N (→ ammonium) + P (→ phosphate). Runs before sediment-P and the N-cycle so the freed P/N feed
    // them, and before surface re-aeration so the epilimnion can offset its (small) surface O₂ draw.
    this.microbialLoop(dt);

    // sediment-P internal loading (Mortimer redox): the anoxic summer deep RELEASES iron-bound P → blooms
    this.sedimentP(dt);

    // nitrogen cycle: nitrification (NH₄→NO₃, draws O₂ here) + denitrification (NO₃→N₂, permanent N loss in
    // the anoxic deep). Runs before surface re-aeration so aeration can offset the surface nitrification O₂ draw.
    this.nitrogenCycle(dt);

    // surface re-aeration (top rows toward saturation, faster with turbulence + rain)
    const aer = ENV.O2_AERATE * (ENV.AERATE_CALM + turb) + rainBoost * ENV.AERATE_RAIN;
    for (let cx = 0; cx < COLS; cx++) {
      o2[cx] += (sat - o2[cx]) * clamp(aer * dt, 0, 1);                                    // row 0 (surface)
      o2[COLS + cx] += (sat - o2[COLS + cx]) * clamp(aer * ENV.AERATE_ROW1 * dt, 0, 1);   // row 1 (just below)
    }

    // diffuse (conservative flux form, no-flux at the bed & lake edges): nutrient blurs isotropically; O₂'s
    // VERTICAL mixing is throttled below the thermocline when the lake is stratified → the hypolimnion isolates and
    // goes hypoxic in summer, then re-oxygenates when stratification collapses at turnover.
    diffuseO2(o2, tmp, ENV.O2_DIFFUSE * dt, this.strat, M);
    diffuse(phos, tmp, NUTRIENT.DIFFUSE * dt, M);
    diffuse(nh4, tmp, NUTRIENT.DIFFUSE * dt, M);
    diffuse(no3, tmp, NUTRIENT.DIFFUSE * dt, M);
    diffuse(this.phyto, tmp, PHYTO.DIFFUSE * dt, M);

    // turnover: when stratification has collapsed, vertical overturn brings oxygen-rich surface
    // water down — relax the hypolimnion toward the epilimnion O₂ at a rate set by (1 − strat).
    const overturn = clamp((1 - this.strat) * THERMAL.OVERTURN * dt, 0, 0.5);
    if (overturn > 1e-4) {
      for (let cx = 0; cx < COLS; cx++) {
        const ref = (o2[cx] + o2[COLS + cx]) * 0.5;     // epilimnion reference
        for (let cy = 0, br = bedRow[cx]; cy <= br; cy++) {
          if ((cy + 0.5) / ROWS <= THERMAL.EPI_FRAC) continue;
          const i = cy * COLS + cx; o2[i] += (ref - o2[i]) * overturn;
        }
      }
    }

    this._throughFlow(dt);

    for (let cy = 0; cy < ROWS; cy++) for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) o2[i] = clamp(o2[i], 0, 1.2);
  }

  // THROUGH-FLOW: the inflow→outflow current carries every dissolved/suspended field (phosphate, ammonium, nitrate,
  // phyto, cyano, DOM) rightward through the surface outflow layer (top OUTFLOW.DEPTH of the column, all wet across
  // the lake) — conservative first-order upwind — and what crosses the right shore leaves through the outlet
  // (tallied). With sediment burial this is the lake's N/P sink besides denitrification, so the inflow → lake →
  // outflow path is a real through-flow (≈ OUTFLOW.ADVECT × FLOW.SPEED; ~1-year water residence at the defaults).
  _throughFlow(dt) {
    const rows = Math.min(Math.max(1, Math.round(OUTFLOW.DEPTH * ROWS)), this.mask.bedRow.reduce((m, r) => Math.min(m, r + 1), ROWS));
    const fields = [this.phos, this.nh4, this.no3, this.phyto, this.cyano, this.dom];
    const pW = [1, 0, 0, PHYTO.P_USE, CYANO.P_USE, NUTRIENT.ORGANIC_P], nW = [0, 1, 1, PHYTO.N_USE, CYANO.N_USE, 1 - NUTRIENT.ORGANIC_P];
    let outP = 0, outN = 0;
    for (let cy = 0; cy < rows; cy++) {
      const a = clamp(OUTFLOW.ADVECT * this.flowAt((cy + 0.5) * CH) * dt / CW, 0, 0.5), base = cy * COLS;
      if (a <= 0) continue;
      for (let k = 0; k < 6; k++) {
        const f = fields[k];
        const gone = f[base + COLS - 1] * a; f[base + COLS - 1] -= gone; outP += gone * pW[k]; outN += gone * nW[k];   // out of the outlet
        for (let cx = COLS - 2; cx >= 0; cx--) { const i = base + cx, m = f[i] * a; f[i] -= m; f[i + 1] += m; }
      }
    }
    this.ledger.outP += outP; this.ledger.outN += outN;
  }

  // ---- serialization (for save/load) ----
  toJSON() {
    return {
      t: this.t, weather: this.weather, tempC: this.tempC, turbidity: this.turbidity,
      strat: this.strat, windT: this._windT, weatherTimer: this.weatherTimer, forced: this.forced,
      o2: Array.from(this.o2), nh4: Array.from(this.nh4), no3: Array.from(this.no3), phos: Array.from(this.phos),
      phyto: Array.from(this.phyto), cyano: Array.from(this.cyano), sedP: Array.from(this.sedP),
      dom: Array.from(this.dom),
    };
  }
  load(s) {
    this.t = s.t; this.weather = s.weather; this.tempC = s.tempC;
    if (s.turbidity != null) this.turbidity = s.turbidity;
    // restore the slow integrator/timer state so a stratified summer reloads as one (not fully mixed)
    if (s.strat != null) this.strat = s.strat;
    if (s.windT != null) this._windT = s.windT;
    if (s.weatherTimer != null) this.weatherTimer = s.weatherTimer;
    if (s.forced != null) this.forced = s.forced;
    // tolerate field-grid size changes (e.g. a save from a differently-sized world):
    // copy what overlaps, leave the rest at its constructed default.
    const copy = (dst, src) => { if (!src) return; const n = Math.min(dst.length, src.length); for (let i = 0; i < n; i++) dst[i] = src[i]; };
    copy(this.o2, s.o2); copy(this.phyto, s.phyto); copy(this.cyano, s.cyano); copy(this.sedP, s.sedP); copy(this.phos, s.phos);
    copy(this.dom, s.dom);   // dissolved organic matter (microbial loop); older saves lack it → stays at the seed (0)
    // Nitrogen pools. v9+ saves the nh4/no3 split directly; tolerate older saves:
    //   v7/v8 had a single `din` pool → split it half ammonium / half nitrate;
    //   legacy (≤v6) `nut` was a single combined N+P pool → split off the N share, then halve it across nh4/no3.
    if (s.nh4 || s.no3) { copy(this.nh4, s.nh4); copy(this.no3, s.no3); }
    else if (s.din) { const n = Math.min(this.nh4.length, s.din.length); for (let i = 0; i < n; i++) { this.nh4[i] = s.din[i] * 0.5; this.no3[i] = s.din[i] * 0.5; } }
    else if (s.nut) { const n = Math.min(this.nh4.length, s.nut.length); for (let i = 0; i < n; i++) { const din = s.nut[i] * (1 - NUTRIENT.ORGANIC_P); this.nh4[i] = din * 0.5; this.no3[i] = din * 0.5; this.phos[i] = s.nut[i] * NUTRIENT.ORGANIC_P; } }
  }
}

// Persist the two thermal STATES added by the chemistry rework (the hypolimnion temperature and the diurnal part of the
// surface temperature) by WRAPPING toJSON/load (whatever their implementation), so a stratified summer resumes with the
// same deep temperature. MERGE NOTE: fold these two fields into toJSON/load directly. Older saves lack them → the deep
// is reconstructed as the surface minus the old fixed summer drop (10 °C × strat) and the diurnal part from the clock.
{
  const _toJSON = Environment.prototype.toJSON, _load = Environment.prototype.load;
  Environment.prototype.toJSON = function () { const s = _toJSON.call(this); s.tempHypo = this.tempHypo; s.tempDiel = this.tempDiel; return s; };
  Environment.prototype.load = function (s) {
    _load.call(this, s);
    this.tempDiel = s && Number.isFinite(s.tempDiel) ? s.tempDiel : ENV.TEMP_DIURNAL * Math.sin((this.t - 0.30) * Math.PI * 2);
    this.tempHypo = s && Number.isFinite(s.tempHypo) ? s.tempHypo : this.tempC - this.tempDiel - 10 * this.strat;
  };
}

// CONSERVATIVE diffusion in flux form over the WET cells: every pair of wet neighbours exchanges (k/4)·(f[j] − f[i]),
// which enters the two cells with opposite signs → the field total is conserved exactly (to float rounding). No flux
// crosses the lake edges or the bed (no-flux boundaries; the old mean-of-neighbours stencil destroyed mass at edges).
// Interior cells behave exactly as before. Dry cells are copied through untouched.
function diffuse(field, tmp, k, M) {
  if (k <= 0) return;
  const c = Math.min(k, 0.5) * 0.25, { lo, hi, wet } = M;
  for (let cy = 0; cy < ROWS; cy++) {
    const L = lo[cy], R = hi[cy], base = cy * COLS, down = cy < ROWS - 1;
    for (let cx = L; cx <= R; cx++) {
      const i = base + cx, f = field[i];
      let a = 0;
      if (cx > L) a += field[i - 1] - f;
      if (cx < R) a += field[i + 1] - f;
      if (cy > 0) a += field[i - COLS] - f;            // the cell above a wet cell is always wet
      if (down && wet[i + COLS]) a += field[i + COLS] - f;
      tmp[i] = f + c * a;
    }
  }
  for (let cy = 0; cy < ROWS; cy++) for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) field[i] = tmp[i];
}

// like diffuse(), but VERTICAL exchange is weighted by a mixing factor that drops below the epilimnion as `strat`
// rises — modelling a thermocline that blocks vertical transport. The factor belongs to each INTERFACE (taken from the
// deeper row of the pair) so the exchange stays symmetric and the stencil conservative.
const _vRow = new Float32Array(ROWS);
function diffuseO2(field, tmp, k, strat, M) {
  if (k <= 0) { return; }
  const { lo, hi, wet } = M;
  for (let cy = 0; cy < ROWS; cy++) {
    const frac = (cy + 0.5) / ROWS;
    // below the epilimnion, vertical mixing is weak when stratified and vigorous at turnover
    _vRow[cy] = frac < THERMAL.EPI_FRAC ? 1 : THERMAL.STRAT_O2_MIX + (THERMAL.TURNOVER_MIX - THERMAL.STRAT_O2_MIX) * (1 - strat);
  }
  const vMax = Math.max(1, THERMAL.STRAT_O2_MIX, THERMAL.TURNOVER_MIX);
  const c = Math.min(k, 0.45 * 4 / (2 + 2 * vMax)) * 0.25;   // keep the explicit step stable at the strongest mixing
  for (let cy = 0; cy < ROWS; cy++) {
    const L = lo[cy], R = hi[cy], base = cy * COLS, down = cy < ROWS - 1;
    const vUp = _vRow[cy], vDn = down ? _vRow[cy + 1] : 0;   // interface (cy−1|cy) uses row cy; (cy|cy+1) uses row cy+1
    for (let cx = L; cx <= R; cx++) {
      const i = base + cx, f = field[i];
      let a = 0;
      if (cx > L) a += field[i - 1] - f;
      if (cx < R) a += field[i + 1] - f;
      if (cy > 0) a += (field[i - COLS] - f) * vUp;
      if (down && wet[i + COLS]) a += (field[i + COLS] - f) * vDn;
      tmp[i] = f + c * a;
    }
  }
  for (let cy = 0; cy < ROWS; cy++) for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) field[i] = tmp[i];
}

export { daylight, diffuse, diffuseO2 };
