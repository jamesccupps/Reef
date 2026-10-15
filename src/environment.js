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
import { WORLD, GRID, ENV, NUTRIENT, SED_P, SEDOM, NCYCLE, MICROBE, MACRO, SEASON, THERMAL, WIND, TURBIDITY, FLOW, OUTFLOW, PHYTO, CYANO, DIATOM, BASIN, ICE, PLANT, PLANKTON, BENTHOS, BIOE, bedY } from './config.js';
import { rand, clamp, TAU } from './core.js';

const W = WORLD.W, H = WORLD.H;
const COLS = GRID.FIELD_COLS, ROWS = GRID.FIELD_ROWS;
const CW = W / COLS, CH = H / ROWS;
const COL_M2 = WORLD.SLICE_M2 / COLS;   // m² of lake bed per field column (the slice's area shared by its columns)
// calendar month names — index 0 = March (year-fraction 0 = mid-spring), running through the year
const MONTHS = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];

// ambient surface light from time-of-day (0..1): a sine arch from sunrise to sunset centred on noon (t = .5). dayFrac =
// the fraction of the cycle that is daylight (0.5 → sunrise .25 / sunset .75; longer in summer, shorter in winter).
function daylight(t, dayFrac = 0.5) {
  const x = (t - (0.5 - dayFrac / 2)) / dayFrac;
  return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
}
// the season's day length and noon sun strength (SEASON.DAY_FRAC / NOON), peaking at the summer solstice
export function seasonalSun(yearFrac) {
  const s = 0.5 + 0.5 * Math.cos(TAU * (yearFrac - SEASON.SOLSTICE));   // 1 at the summer solstice, 0 at the winter one
  return { dayFrac: SEASON.DAY_FRAC[0] + (SEASON.DAY_FRAC[1] - SEASON.DAY_FRAC[0]) * s, noon: SEASON.NOON[0] + (SEASON.NOON[1] - SEASON.NOON[0]) * s };
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
    this.ice = 0;                  // lake ice cover 0..1 (ICE): forms near 0 °C, blocks light, wind and re-aeration
    this.lightDay = 1;             // today's clear-sky noon light under the ice (derived each step: the algae's light climate)
    this.sun = 0;                  // clear-sky sun height 0..1 (derived each step; display only)
    this.strat = 0;               // thermal stratification strength 0..1 (1 = strong summer)
    this.wind = 0; this._windT = 0;// signed surface current (px/s)
    this.turbidity = TURBIDITY.BASE; // water murk 0..1 (algae + sediment)
    this.mask = buildWetMask();    // wet/dry cells (static: depends only on the basin config)
    this.o2 = new Float32Array(COLS * ROWS).fill(ENV.O2_START);
    // dissolved inorganic nitrogen, split by the N cycle: ammonium (reduced) ⇌ nitrate (oxidized)
    this.nh4 = new Float32Array(COLS * ROWS).fill(NCYCLE.NH4_START);  // ammonium — from decomposition; phyto prefers it
    this.no3 = new Float32Array(COLS * ROWS).fill(NCYCLE.NO3_START);  // nitrate — made by nitrification, lost to denitrification
    this.phos = new Float32Array(COLS * ROWS).fill(NUTRIENT.P_START); // phosphate (the usual limiting nutrient)
    this.sedP = new Float32Array(COLS).fill(SED_P.START);             // benthic bound-P store per column (Mortimer redox)
    this.sedOM = new Float32Array(COLS).fill(SEDOM.START);            // the bed's organic detritus layer, g wet per column (SEDOM)
    this._colDecay = new Float32Array(COLS);                          // algae that died in each column this step (→ the bed)
    this.benth = new Float32Array(COLS).fill(BENTHOS.START * COL_M2);   // the bed's worms and scuds, g wet per column (BENTHOS)
    this.phyto = new Float32Array(COLS * ROWS).fill(PHYTO.START); // phytoplankton biomass field
    this._meanPhyto = PHYTO.START;
    this.diatom = new Float32Array(COLS * ROWS).fill(DIATOM.START);   // cold-water diatoms (the spring bloom)
    this._meanDiatom = DIATOM.START;
    this.cyano = new Float32Array(COLS * ROWS).fill(CYANO.START); // cyanobacteria (N-fixing strain) biomass field
    this._meanCyano = CYANO.START;     // surface-band (scum) density
    this.dom = new Float32Array(COLS * ROWS).fill(MICROBE.START); // dissolved organic matter — the bacterial substrate (microbial loop)
    this._meanDOM = MICROBE.START;
    // ZOOPLANKTON (PLANKTON): Daphnia and copepods, g wet per cell (wet cells only); the weed map and the columns' DVM refuge
    this.zooD = this._zooFill(PLANKTON.START_D);
    this.zooC = this._zooFill(PLANKTON.START_C);
    this.zooR = this._zooFill(PLANKTON.START_R);   // rotifers and nauplii (the larvae's first food)
    this.zooEgg = this._eggFill();                    // the sediment's resting-egg bank, g per column: [col × 2] Daphnia, [col × 2 + 1] copepods
    this._plantMap = new Float32Array(COLS * ROWS);   // weed stems per cell (rebuilt every step from the plants; not saved)
    this._refAv = new Float32Array(COLS);             // 0..1: how well each column's depth lets migrants hide (static geometry)
    for (let cx = 0; cx < COLS; cx++) this._refAv[cx] = clamp(((this.mask.bedRow[cx] + 1) / ROWS - PLANKTON.REF_DEPTH) / PLANKTON.REF_RAMP, 0, 1);
    this.fishKgHa = 0;                 // the lake's fish biomass, kg/ha (set by the world each step: the kairomone level for DVM)
    this._migD = 0; this._migC = 0;    // DVM migrant shares (derived each step from fishKgHa)
    this.zooProd = 0;                  // DIAGNOSTIC: cumulative zooplankton production, g (growth before losses; not saved, never read by the sim)
    this.benthProd = 0;                // DIAGNOSTIC: cumulative production of the bed's worms and scuds, g (not saved, never read by the sim)
    this._zI = new Int32Array(9); this._zD = new Float64Array(9); this._zC = new Float64Array(9); this._zR = new Float64Array(9);   // zooFeed scratch
    this._zW = new Float64Array(ROWS);   // the daily-round weights down a column (scratch)
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
  // algal respiration activity at depth y: full where the day's peak light reaches PHYTO.RESP_IK (so night in the photic
  // zone still respires fully), falling to PHYTO.DARK_RESP in a dark light climate (deep water, snowy ice) — dark survival
  algaeRespAt(y) { return PHYTO.DARK_RESP + (1 - PHYTO.DARK_RESP) * Math.min(1, this.lightDay * Math.exp(-this.attenuation() * (y / H)) / PHYTO.RESP_IK); }
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
  // the bed's organic detritus layer (SEDOM): g wet per column. `sedOMAt` = the column under x; add/take move grams in
  // and out (take returns what was actually there to take)
  // ---- ZOOPLANKTON (PLANKTON): two biomass fields, g wet per cell ----
  _zooFill(g) { const f = new Float32Array(COLS * ROWS); for (let i = 0; i < f.length; i++) if (this.mask.wet[i]) f[i] = g; return f; }
  _eggFill() { const f = new Float32Array(COLS * 2); for (let c = 0; c < COLS; c++) { f[c * 2] = PLANKTON.EGG_START_D; f[c * 2 + 1] = PLANKTON.EGG_START_C; } return f; }
  zooEggTotal(k) { let s = 0; for (let c = 0; c < COLS; c++) s += this.zooEgg[c * 2 + k]; return s; }   // g wet in the egg bank
  zooTotal(k) { const f = k === 2 ? this.zooR : k ? this.zooC : this.zooD; let s = 0; for (let i = 0; i < f.length; i++) s += f[i]; return s; }   // g wet, lake-wide
  meanZooUgl() { return (this.zooTotal(0) + this.zooTotal(1)) / this.mask.n * PLANKTON.UGL; }   // whole-lake mean, µg dry/L
  // the DVM migrant shares at the lake's fish biomass (kg/ha, the kairomone level): f = DVM_MAX × B/(B + DVM_B50)
  _zooMig() { const b = Math.max(0, this.fishKgHa || 0), s = b / (b + PLANKTON.DVM_B50); this._migD = PLANKTON.DVM_MAX_D * s; this._migC = PLANKTON.DVM_MAX_C * s; }
  // VISUAL FEEDING at depth y: today's noon light there, from blind (VIS_I0) to full sight (VIS_I1) on a log scale, × the
  // water's clarity — fish see millimetre prey poorly in the dim deep water and under snow-covered ice
  zooVis(y) {
    const P = PLANKTON, I = this.lightDay * Math.exp(-this.attenuation() * (y / H));
    if (!(I > P.VIS_I0)) return 0;
    return Math.min(1, Math.log(I / P.VIS_I0) / Math.log(P.VIS_I1 / P.VIS_I0)) * this.clarity();
  }
  // the share of a cell's zooplankton a visual fish can get: migrants (DVM, where the column is deep enough to hide in) meet
  // fish only at twilight, and dense weeds hide some — for Daphnia (k 0) or copepods (k 1). DVM is a refuge from the VISUAL
  // ADULT planktivores and grows with prey size (Lampert): the small prey larval fish take — nauplii, small cladocerans — stay
  // up in the lit water (dvm = false for the fry)
  zooExposed(i, k, dvm = true) {
    const P = PLANKTON, ra = this._refAv[i % COLS], m = dvm ? (k ? this._migC : this._migD) : 0;
    return (1 - m * ra * (1 - P.TWILIGHT)) * (1 - P.WEED_REF * Math.min(1, this._plantMap[i]));
  }
  // A FISH OR A SCHOOL FEEDS on the zooplankton around (x, y) — the 3×3 cells about it: each kind's grams × what the eater
  // can catch (cD Daphnia, cC copepods) × the share exposed (zooExposed) × sight at that depth (zooVis) = the exposed prey;
  // intake = want × E/(E + K) — type II in the exposed density E (µg dry/L; `sig`: type III, E²/(E² + K²) — a fish with other
  // food switches away from scarce zooplankton) — and at most CROP of what is exposed. Taken
  // from the cells in proportion to what each exposes; the grams of Daphnia → out[0], copepods → out[1].
  zooFeed(x, y, cD, cC, want, K, out, sig = false, dvm = true, cR = 0) {
    out[0] = 0; out[1] = 0; out[2] = 0;
    if (!(want > 0)) return out;
    const vis = this.zooVis(y);
    if (vis <= 0) return out;
    const P = PLANKTON, c0 = clamp((x / CW) | 0, 0, COLS - 1), r0 = clamp((y / CH) | 0, 0, ROWS - 1), wet = this.mask.wet;
    const ZI = this._zI, ED = this._zD, EC = this._zC, ER = this._zR;
    let n = 0, sD = 0, sC = 0, sR = 0;
    for (let r = r0 - 1; r <= r0 + 1; r++) {
      if (r < 0 || r >= ROWS) continue;
      for (let c = c0 - 1; c <= c0 + 1; c++) {
        if (c < 0 || c >= COLS) continue;
        const i = r * COLS + c; if (!wet[i]) continue;
        const eD = this.zooD[i] * cD * this.zooExposed(i, 0, dvm), eC = this.zooC[i] * cC * this.zooExposed(i, 1, dvm);
        const eR = cR > 0 ? this.zooR[i] * cR * (1 - P.WEED_REF * Math.min(1, this._plantMap[i])) : 0;   // (rotifers: no DVM)
        ZI[n] = i; ED[n] = eD; EC[n] = eC; ER[n] = eR; n++; sD += eD; sC += eC; sR += eR;
      }
    }
    const S = (sD + sC + sR) * vis;
    if (!(S > 1e-12)) return out;
    const E = S / n * P.UGL, take = Math.min(want * (sig ? E * E / (E * E + K * K) : E / (E + K)), P.CROP * S);   // type III (sig: prey switching) or II
    const tot = sD + sC + sR, tD = take * sD / tot, tC = take * sC / tot, tR = take - tD - tC;
    for (let k = 0; k < n; k++) {
      const i = ZI[k];
      if (sD > 0) this.zooD[i] = Math.max(0, this.zooD[i] - tD * ED[k] / sD);
      if (sC > 0) this.zooC[i] = Math.max(0, this.zooC[i] - tC * EC[k] / sC);
      if (sR > 0) this.zooR[i] = Math.max(0, this.zooR[i] - tR * ER[k] / sR);
    }
    out[0] = tD; out[1] = tC; out[2] = tR;
    return out;
  }
  // the richest zooplankton within r of (x, y) as an adult fish would rate it (exposed, seen) — a patch it notices only at
  // ≥ SENSE_MIN × K_ADULT; fills and returns `o` ({ item: {x, y}, dist }) or null. (The brain's "plankton" sense.)
  zooBest(x, y, r, o) {
    const P = PLANKTON, c0 = clamp((x / CW) | 0, 0, COLS - 1), r0 = clamp((y / CH) | 0, 0, ROWS - 1), wet = this.mask.wet;
    const nc = Math.ceil(r / CW), nr = Math.ceil(r / CH), r2 = r * r, esc = 1 - P.COPE_ESCAPE;
    let best = P.SENSE_MIN * P.K_ADULT / P.UGL, bx = 0, by = 0, bd = -1;
    for (let rr = Math.max(0, r0 - nr); rr <= Math.min(ROWS - 1, r0 + nr); rr++) {
      const cyy = (rr + 0.5) * CH, dy = cyy - y; if (dy * dy > r2) continue;
      const vis = this.zooVis(cyy); if (vis <= 0) continue;
      for (let cc = Math.max(0, c0 - nc); cc <= Math.min(COLS - 1, c0 + nc); cc++) {
        const i = rr * COLS + cc; if (!wet[i]) continue;
        const cxx = (cc + 0.5) * CW, dx = cxx - x, d2 = dx * dx + dy * dy; if (d2 > r2) continue;
        const e = (this.zooD[i] * this.zooExposed(i, 0) + this.zooC[i] * esc * this.zooExposed(i, 1)) * vis;
        if (e > best) { best = e; bx = cxx; by = cyy; bd = d2; }
      }
    }
    if (bd < 0) return null;
    o.item.x = bx; o.item.y = by; o.dist = Math.sqrt(bd);
    return o;
  }
  // the update: each kind GROWS on its cell's algae (Holling, K_D / K_C; copepods also on the weed beds' periphyton) at
  // G × Q10, less maintenance + background mortality (R + M, × Q10), less a DVM_COST share of growth for the migrants; GRAZES
  // the cell's algae (type II; the N+P returned at once, as grazePhyto); dies in anoxic water and in a toxic cyanobacterial
  // scum (Daphnia DAPH_TOX × faster; Daphnia also can't grow amid cyanobacteria); swims up out of anoxic water; is kept at a
  // tiny FLOOR in oxic water (overwintering animals, resting eggs); mixes. Rates per real day (÷ BIOE.DAY).
  zooplankton(dt) {
    const P = PLANKTON, D = this.zooD, Cz = this.zooC, Rz = this.zooR, ph = this.phyto, di = this.diatom, cyf = this.cyano, o2 = this.o2;
    const pm = this._plantMap, ra = this._refAv, phos = this.phos, nh4 = this.nh4, dom = this.dom;
    const ex = NUTRIENT.GRAZE_EXCRETE, pU = PHYTO.P_USE, nU = PHYTO.N_USE, { lo, hi } = this.mask, dd = dt / BIOE.DAY;
    this._zooMig();
    const costD = P.DVM_COST * this._migD, costC = P.DVM_COST * this._migC;
    const gD0 = P.G_D * dd, gC0 = P.G_C * dd, lD0 = (P.R_D + P.M_D) * dd, lC0 = (P.R_C + P.M_C) * dd, anox = P.ANOX_M * dd;
    // the season's cues: shortening days below DORM_DAY → resting stages (in cool water); lengthening days → the bank hatches
    const yf = this.yearFrac(), shorten = (((yf - SEASON.SOLSTICE) % 1) + 1) % 1 < 0.5, dorm = shorten && seasonalSun(yf).dayFrac < P.DORM_DAY;
    const eg = this.zooEgg, dmD = P.DORM_D * dd, dmC = P.DORM_C * dd;
    const toxAt = CYANO.TOX_THRESH * CYANO.CAP, kD = 1 - Math.min(1, CYANO.TOX_ZOO * P.DAPH_TOX * dt), kC = 1 - Math.min(1, CYANO.TOX_ZOO * dt);
    const flr = Math.min(1, P.FLOOR_RATE * dt);
    for (let cy = 0; cy < ROWS; cy++) {
      const T = this.tempAt(0, (cy + 0.5) * CH), qD = Math.pow(P.Q10_D, (T - 20) / 10), qC = Math.pow(P.Q10_C, (T - 20) / 10), qL = Math.pow(P.Q10_L, (T - 20) / 10);
      const wD = clamp((T - P.DAPH_T[0]) / (P.DAPH_T[1] - P.DAPH_T[0]), 0, 1) * clamp((P.DAPH_HOT[1] - T) / (P.DAPH_HOT[1] - P.DAPH_HOT[0]), 0, 1);
      const qR = Math.pow(P.Q10_R, (T - 20) / 10), grR = P.GR_R * qR * dt, gR0 = P.G_R * dd, lR0 = (P.R_R + P.M_R) * dd, iR = P.DAPH_INTERF * dd, m2R = P.M2_R * dd;
      const grD = P.GR_D * qD * dt, grC = P.GR_C * qC * dt, base = cy * COLS, cold = dorm && T < P.DORM_T;
      for (let cx = lo[cy]; cx <= hi[cy]; cx++) {
        const i = base + cx, A = ph[i] + di[i], zd = D[i], zc = Cz[i], rf = ra[cx], lit = P.LIT_FOOD * Math.min(1, pm[i]);
        const cyn = Math.max(0, 1 - P.DAPH_CYANO * cyf[i] / CYANO.CAP);
        const pd = zd * gD0 * A / (A + P.K_D) * cyn * wD * (1 - costD * rf) * qD, pc = zc * gC0 * (A + lit) / (A + lit + P.K_C) * (1 - costC * rf) * qC;
        this.zooProd += pd + pc;   // (diagnostic: the step's production, g — never read by the sim)
        let nd = zd + pd - zd * lD0 * qL;
        let nc = zc + pc - zc * lC0 * qL;
        const zr = Rz[i]; let nr = zr + zr * (gR0 * A / (A + P.K_R) * qR - (lR0 + iR * zd + m2R * zr) * qL);   // rotifers (Daphnia interfere; invertebrate predators ∝ density)
        if (cold) { const ed = zd * dmD, ec = zc * dmC; nd -= ed; nc -= ec; eg[cx * 2] += ed * P.EGG_EFF; eg[cx * 2 + 1] += ec * P.EGG_EFF; }   // → the egg bank
        let g = zd * grD * A / (A + P.K_D) + zc * grC * A / (A + P.K_C) + zr * grR * A / (A + P.K_R);
        if (g > 0) {
          if (g > A) g = A;
          const gp = Math.min(ph[i], g), gd = g - gp;
          ph[i] -= gp; di[i] -= gd;
          phos[i] += g * ex * pU; nh4[i] += g * ex * nU; dom[i] += g * (1 - ex) * (pU + nU);
        }
        const ox = o2[i] >= P.O2_MIN;
        if (!ox) { nd -= zd * anox; nc -= zc * anox; nr -= zr * anox; }
        if (cyf[i] > toxAt) { nd *= kD; nc *= kC; nr *= kC; }
        if (ox) { if (nd < P.FLOOR) nd += (P.FLOOR - nd) * flr; if (nc < P.FLOOR) nc += (P.FLOOR - nc) * flr; if (nr < P.FLOOR) nr += (P.FLOOR - nr) * flr; }
        D[i] = nd > 0 ? nd : 0; Cz[i] = nc > 0 ? nc : 0; Rz[i] = nr > 0 ? nr : 0;
      }
    }
    // the EGG BANK: on lengthening days part of it hatches into the oxic bottom water once the bed is warm enough; eggs are
    // slowly buried or die
    const lossE = 1 - P.EGG_LOSS * dd / 365, hz = P.HATCH * dd, bedRow = this.mask.bedRow;
    for (let cx = 0; cx < COLS; cx++) {
      eg[cx * 2] *= lossE; eg[cx * 2 + 1] *= lossE;
      if (shorten) continue;
      const by = bedRow[cx], i = by * COLS + cx; if (o2[i] < P.O2_MIN) continue;
      const T = this.tempAt(0, (by + 0.5) * CH);
      if (T >= P.HATCH_T_D) { const h = eg[cx * 2] * hz; eg[cx * 2] -= h; D[i] += h; }
      if (T >= P.HATCH_T_C) { const h = eg[cx * 2 + 1] * hz; eg[cx * 2 + 1] -= h; Cz[i] += h; }
    }
    // THE DAILY ROUND: the field is the animals' daily-mean place. Over a day they spread through their column's OXIC water —
    // wind mixes the epilimnion, migrants swim down by day and back up to the algae at night — and they spend their time
    // where the food is: each column's oxic cells relax at MIX /s toward the column's total shared in proportion to the
    // cell's algae + FOOD0 (conservative). So time spent in the cold, dark deep water is real but brief (the DVM refuge from
    // fish itself is zooExposed's daily mean); anoxic water below is left (they avoid it — below)
    const mx = Math.min(1, P.MIX * dt), wq = this._zW;
    for (let cx = 0; cx < COLS; cx++) {
      let r1 = -1; for (let cy = 0, br = bedRow[cx]; cy <= br && o2[cy * COLS + cx] >= P.O2_MIN; cy++) r1 = cy;
      if (r1 < 1) continue;
      let sd = 0, sc = 0, sr = 0, sw = 0;
      for (let cy = 0; cy <= r1; cy++) { const i = cy * COLS + cx; sd += D[i]; sc += Cz[i]; sr += Rz[i]; const v = ph[i] + di[i] + P.FOOD0; wq[cy] = v; sw += v; }
      const fd = sd / sw, fc = sc / sw, fr = sr / sw;
      for (let cy = 0; cy <= r1; cy++) { const i = cy * COLS + cx; D[i] += (fd * wq[cy] - D[i]) * mx; Cz[i] += (fc * wq[cy] - Cz[i]) * mx; Rz[i] += (fr * wq[cy] - Rz[i]) * mx; }
    }
    // out of anoxic water: a share swims up a cell each step (the cell above a wet cell is always wet)
    const av = Math.min(1, P.AVOID * dt);
    for (let cy = 1; cy < ROWS; cy++) {
      const base = cy * COLS;
      for (let cx = lo[cy]; cx <= hi[cy]; cx++) {
        const i = base + cx; if (o2[i] >= P.O2_MIN) continue;
        const j = i - COLS, md = D[i] * av, mc = Cz[i] * av, mr = Rz[i] * av;
        D[i] -= md; D[j] += md; Cz[i] -= mc; Cz[j] += mc; Rz[i] -= mr; Rz[j] += mr;
      }
    }
    // HORIZONTAL MIXING: wind-driven currents (cm/s) carry the plankton across a small lake many times a day — each depth layer
    // relaxes toward its lake-wide mean at HMIX /s (≈ once a day), so a patch cropped by fish refills from the open water
    // (conservative per row); plus small-scale diffusion
    // (SHORE AVOIDANCE: open-water Daphnia swim away from the shore — Siebeck 1980 — so their share leans to the deep columns:
    // each column weighted SHORE + (1 − SHORE) × its DVM refuge depth; copepods and the littoral's own crustaceans spread evenly)
    const hm = Math.min(1, P.HMIX * dt);
    for (let cy = 0; cy < ROWS; cy++) {
      const base = cy * COLS, a = lo[cy], b = hi[cy], n = b - a + 1; if (n < 2) continue;
      let sd = 0, sc = 0, sr = 0, sw = 0; for (let cx = a; cx <= b; cx++) { const i = base + cx; sd += D[i]; sc += Cz[i]; sr += Rz[i]; sw += P.SHORE + (1 - P.SHORE) * ra[cx]; }
      const fd = sd / sw, mc = sc / n, mr = sr / n;
      for (let cx = a; cx <= b; cx++) { const i = base + cx; D[i] += (fd * (P.SHORE + (1 - P.SHORE) * ra[cx]) - D[i]) * hm; Cz[i] += (mc - Cz[i]) * hm; Rz[i] += (mr - Rz[i]) * hm; }
    }
    diffuse(D, this._tmp, P.DIFFUSE * dt, this.mask);
    diffuse(Cz, this._tmp, P.DIFFUSE * dt, this.mask);
    diffuse(Rz, this._tmp, P.DIFFUSE * dt, this.mask);
  }
  colOf(x) { return clamp((x / CW) | 0, 0, COLS - 1); }
  sedOMAt(x) { return this.sedOM[this.colOf(x)]; }
  totalBenth() { let s = 0; for (let i = 0; i < COLS; i++) s += this.benth[i]; return s; }   // g wet of the bed's worms and scuds
  // a bottom-foraging fish (or school) at x takes from the column's worms and scuds: want × E/(E + K_FISH), E the reachable
  // density above the REFUGE (g/m²), at most CROP of what is reachable; returns the grams taken
  takeBenth(x, want) {
    if (!(want > 0)) return 0;
    const c = this.colOf(x), reach = this.benth[c] - BENTHOS.REFUGE * COL_M2; if (!(reach > 0)) return 0;
    const E = reach / COL_M2, g = Math.min(want * E / (E + BENTHOS.K_FISH), PLANKTON.CROP * reach);
    this.benth[c] -= g; return g;
  }
  // a bottom forager's SENSE of the bed's worms and scuds: the column within r (its bed point, from (x, y)) whose bed holds the
  // most of them above the refuge — at least BENTHOS.SENSE_MIN g/m² — under water with at least o2min O₂ (a fish won't feed in
  // a dead zone). Fish sample the bed and settle where it pays, moving within days as the returns shift (Werner et al. 1983).
  // Writes the point just above that bed into o (as zooBest); null when no column in reach qualifies.
  benthBest(x, y, r, o2min, o) {
    const B = BENTHOS, br = this.mask.bedRow, r2 = r * r;
    const c0 = clamp(Math.floor((x - r) / CW), 0, COLS - 1), c1 = clamp(Math.floor((x + r) / CW), 0, COLS - 1);
    let best = B.SENSE_MIN, bx = 0, by = 0, bd = -1;
    for (let c = c0; c <= c1; c++) {
      const yb = (br[c] + 0.5) * CH, cx = (c + 0.5) * CW, dx = cx - x, dy = yb - y, d2 = dx * dx + dy * dy; if (d2 > r2) continue;
      const e = this.benth[c] / COL_M2 - B.REFUGE; if (!(e > best) || this.o2[br[c] * COLS + c] < o2min) continue;
      best = e; bx = cx; by = yb; bd = d2;
    }
    if (bd < 0) return null;
    o.item.x = bx; o.item.y = by; o.dist = Math.sqrt(bd);
    return o;
  }
  // the update: growth on the column's organic layer (Monod, logistic toward CAP, Q10; takes the layer at 1/YIELD), natural
  // mortality and an anoxic die-off returned to the layer
  benthos(dt) {
    const B = BENTHOS, br = this.mask.bedRow, som = this.sedOM, o2 = this.o2, cap = B.CAP * COL_M2;
    for (let cx = 0; cx < COLS; cx++) {
      const by = br[cx], b = this.benth[cx], T = this.tempAt(cx * CW, (by + 0.5) * CH), q = Math.pow(B.Q10, (T - 20) / 10);
      const s = som[cx], want = B.G * q * s / (s + B.K_SOM) * b * Math.max(0, 1 - b / cap) * dt;
      const ate = Math.min(s, want / B.YIELD); som[cx] = s - ate;
      const die = b * (B.M + (o2[by * COLS + cx] < B.O2_MIN ? B.ANOX_M : 0)) * q * dt;
      som[cx] += die; this.benth[cx] = b + ate * B.YIELD - die; this.benthProd += ate * B.YIELD;   // (diagnostic tally)
    }
  }
  totalSedOM() { let s = 0; for (let i = 0; i < COLS; i++) s += this.sedOM[i]; return s; }
  addSedOM(x, g) { if (g > 0) this.sedOM[this.colOf(x)] += g; }
  takeSedOM(x, g) { const c = this.colOf(x), t = Math.min(this.sedOM[c], Math.max(0, g)); this.sedOM[c] -= t; return t; }
  // SEDIMENT ORGANIC MATTER: a share SEDOM.SINK of the algae that died in each column this step settles onto its bed as
  // detritus (g via SEDOM.PP_G), and the layer decomposes first-order (fresh algal detritus 0.144/day at 20 °C, Q10 1.94),
  // slower where the bottom water has lost its O₂ (anaerobic decomposition, SEDOM.ANOX). Carbon/energy only — the N+P of
  // that dying algae is already returned to the water and the sediment-P store, so the N/P budgets are untouched.
  // BENTHIC ALGAE: on a lit bed the periphyton and epipelon grow (SEDOM.PERI_G × the light reaching the bed × Q10) straight
  // into the layer — the littoral's own production, lost when the water turns murky.
  sedimentOM(dt) {
    const br = this.mask.bedRow, som = this.sedOM, colD = this._colDecay, o2 = this.o2;
    for (let cx = 0; cx < COLS; cx++) {
      const by = br[cx], ox = Math.max(0, o2[by * COLS + cx]), yb = (by + 0.5) * CH, T = this.tempAt(cx * CW, yb);
      const k = SEDOM.K20 * Math.pow(SEDOM.Q10, (T - 20) / 10) * (SEDOM.ANOX + (1 - SEDOM.ANOX) * ox / (ox + SEDOM.O2_HALF));
      const peri = SEDOM.PERI_G * this.lightAtDepth(yb) * Math.pow(PHYTO.Q10, (T - 20) / 10) * dt;
      som[cx] = som[cx] * Math.max(0, 1 - k * dt) + SEDOM.SINK * SEDOM.PP_G * colD[cx] + peri;
      colD[cx] = 0;
    }
  }
  // total P / N held in the water + sediment + algae + DOM (wet cells; excludes detritus particles & plants, which
  // the World owns) — the inventory the mass-budget audit tracks
  inventoryP() { return this.wetSum(this.phos) + (this.wetSum(this.phyto) + this.wetSum(this.diatom)) * PHYTO.P_USE + this.wetSum(this.cyano) * CYANO.P_USE + this.wetSum(this.dom) * NUTRIENT.ORGANIC_P + this.meanSedP() * COLS; }
  inventoryN() { return this.wetSum(this.nh4) + this.wetSum(this.no3) + (this.wetSum(this.phyto) + this.wetSum(this.diatom)) * PHYTO.N_USE + this.wetSum(this.cyano) * CYANO.N_USE + this.wetSum(this.dom) * (1 - NUTRIENT.ORGANIC_P); }
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
      // both are bacterial processes: strongly temperature-dependent (Q10 ≈ 2; nitrification nearly stalls in ice-cold water)
      const q = Math.pow(NCYCLE.Q10, (this.tempAt(0, (cy + 0.5) * CH) - 20) / 10);
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const oxy = o2[i] > 0 ? o2[i] : 0;   // a transiently negative O₂ must never drive a rate
        if (oxy >= NCYCLE.DENITRIF_O2) {
          // OXIC: nitrification (ammonium → nitrate), rate ∝ ammonium × O₂ availability (Monod); it consumes O₂.
          const nitr = NCYCLE.NITRIF * q * nh4[i] * (oxy / (oxy + NCYCLE.NITRIF_O2_HALF)) * dt;
          nh4[i] -= nitr; no3[i] += nitr; o2[i] = Math.max(0, oxy - nitr * NCYCLE.NITRIF_O2_COST);
        } else {
          // ANOXIC: nitrifiers halt (obligate aerobes); denitrification reduces nitrate to N₂ gas — lost for good.
          const dn = NCYCLE.DENITRIF * q * no3[i] * (1 - oxy / NCYCLE.DENITRIF_O2) * dt;
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
  // DIATOMS (DIATOM): cold-water algae. Growth = GROW × min(light, a cold-centred temperature window (best ~7 °C)) ×
  // Liebig nutrient — so they bloom in the bright, cold, freshly-mixed spring lake (and slowly under clear ice) — with
  // Redfield uptake like green algae; respiration and decay follow the Q10; decayed biomass recycles exactly as PHYTO's.
  // Once the lake STRATIFIES they sink (one row per step, × strat; mass-conserving, held at the bottom wet row where they
  // then decay) — the end of the spring bloom. Runs after cyano, before the means.
  diatoms(dt) {
    const dia = this.diatom, phos = this.phos, nh4 = this.nh4, no3 = this.no3, dom = this.dom, o2 = this.o2, colD = this._colDecay, { lo, hi, bedRow } = this.mask;
    const pU = PHYTO.P_USE, nU = PHYTO.N_USE, R = PHYTO.RECYCLE, toDom = (1 - R) * (pU + nU);
    let sum = 0, cnt = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH, lit = this.lightAtDepth(y), T = this.tempAt(0, y);
      const tf = clamp(1 - Math.abs(T - DIATOM.TEMP_OPT) / DIATOM.TEMP_TOL, 0, 1), qP = Math.pow(PHYTO.Q10, (T - 20) / 10), rA = this.algaeRespAt(y);
      const pl = Math.min(lit, tf);   // Blackman: the temperature window caps the light-saturated rate; dim light is T-independent
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const b = dia[i], p = phos[i], a = nh4[i], nTot = a + no3[i];
        const nLim = Math.min(nTot / (nTot + NUTRIENT.KN), p / (p + NUTRIENT.KP));
        let growth = DIATOM.GROW * pl * nLim * (1 - b / PHYTO.CAP) * dt;
        if (growth * pU > p) growth = p / pU;
        if (growth * nU > nTot) growth = nTot / nU;
        if (growth < 0) growth = 0;
        const decay = DIATOM.DECAY * qP * b * dt;
        dia[i] = b + growth - decay; colD[i - cy * COLS] += decay;
        phos[i] = p - growth * pU + decay * R * pU;
        const nNeed = growth * nU, upA = nNeed < a ? nNeed : a;
        nh4[i] = a - upA + decay * R * nU;
        if (nNeed > upA) no3[i] -= nNeed - upA;
        dom[i] += decay * toDom;
        o2[i] += (PHYTO.O2_PHOTO * b * pl - PHYTO.O2_RESP * rA * b * qP) * dt;
        if ((cy + 0.5) / ROWS < DIATOM.BAND) { sum += dia[i]; cnt++; }
      }
    }
    this._meanDiatom = cnt ? sum / cnt : 0;
    // sinking in a stratified (calm) lake: bottom-up so a cell's load moves one row per step at most
    const k = clamp(DIATOM.SINK * this.strat * dt, 0, 0.5);
    if (k > 1e-5) for (let cy = ROWS - 2; cy >= 0; cy--) {
      for (let cx = lo[cy]; cx <= hi[cy]; cx++) {
        if (cy >= bedRow[cx]) continue;   // the bottom wet cell of this column holds them
        const i = cy * COLS + cx, m = dia[i] * k; dia[i] -= m; dia[i + COLS] += m;
      }
    }
  }
  // green-phyto loop so green phyto (faster) gets first call on the shared P.
  cyanobacteria(dt) {
    const cyn = this.cyano, phos = this.phos, nh4 = this.nh4, no3 = this.no3, dom = this.dom, o2 = this.o2, tmp = this._tmp, colD = this._colDecay, { lo, hi } = this.mask;
    const pU = CYANO.P_USE, nU = CYANO.N_USE, R = CYANO.RECYCLE, toDom = (1 - R) * (pU + nU);
    let surfSum = 0, surfCount = 0, fixed = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH, lit = this.lightAtDepth(y), frac = (cy + 0.5) / ROWS;
      const tempFac = clamp(1 - Math.abs(this.tempAt(0, y) - CYANO.TEMP_OPT) / CYANO.TEMP_TOL, 0, 1);   // warm-water bloomer
      const qC = Math.pow(PHYTO.Q10, (this.tempAt(0, y) - 20) / 10);   // respiration + decay slow in the cold (as green algae)
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const cb = cyn[i], p = phos[i];
        const pMon = p / (p + NUTRIENT.KP);                                                             // P-limited only (N-fixing)
        // PER-CAPITA (logistic) growth from the standing biomass + a tiny inoculum (resting cells / akinetes) — a bloom
        // must BUILD UP through a warm, bright, P-rich spell. (It was zero-order — every lit cell produced cyano from
        // nothing and buoyancy stacked a whole column's output into a toxic row-0 scum every summer.)
        let cgrow = CYANO.GROW * lit * pMon * tempFac * (cb + CYANO.INOC) * (1 - cb / CYANO.CAP) * dt;
        if (cgrow * pU > p) cgrow = p / pU;                                                              // never take P the cell lacks
        if (cgrow < 0) cgrow = 0;
        const cdecay = CYANO.DECAY * qC * cb * dt;
        cyn[i] = cb + cgrow - cdecay; colD[i - cy * COLS] += cdecay;
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
        o2[i] += (CYANO.O2_PHOTO * cb * lit - CYANO.O2_RESP * qC * cb) * dt;
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
  meanDiatom() { return this._meanDiatom; }   // upper-column diatom density (the spring bloom)
  diatomAt(x, y) { return this.diatom[this.cellOf(x, y)]; }
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
    const i = this.cellOf(x, y), gp = Math.min(this.phyto[i], amt), gd = Math.min(this.diatom[i], amt - gp), g = gp + gd;   // green algae, then diatoms
    if (g > 0) {
      const ex = NUTRIENT.GRAZE_EXCRETE;
      this.phyto[i] -= gp; this.diatom[i] -= gd;
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
  // Uptake is STOICHIOMETRIC (organic matter has a fixed N:P): the take is limited by whichever element is scarcer, so
  // the returned amount is balanced organic units that later remineralize (via DOM) to exactly the N and P drawn.
  takeNutrient(x, y, amt) {
    const i = this.cellOf(x, y), fp = NUTRIENT.ORGANIC_P;
    const take = Math.max(0, Math.min(amt, this.phos[i] / fp, (this.nh4[i] + this.no3[i]) / (1 - fp)));
    if (!(take > 0)) return 0;
    this.phos[i] = Math.max(0, this.phos[i] - take * fp);   // P-limited: phos − (phos/fp)·fp can round to −1e-22
    let nNeed = take * (1 - fp);
    const aT = Math.min(this.nh4[i], nNeed); this.nh4[i] -= aT; nNeed -= aT;
    this.no3[i] = Math.max(0, this.no3[i] - nNeed);
    return take;
  }
  // O₂ solubility: cold water holds more (~1.35× the 18 °C reference near 0 °C, as real 14.6 vs ~9.5 mg/L)
  saturation() { return clamp(1.0 - (this.tempC - 18) * ENV.SAT_TEMP_K, 0.5, 1.4); }
  metabolismFactor() { return Math.pow(ENV.METAB_Q10, (this.tempC - 18) / 10); }
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
  metabAt(x, y) { return Math.pow(ENV.METAB_Q10, (this.tempAt(x, y) - 18) / 10); }   // Q10 metabolism (×1 at 18 °C)
  // wind-driven surface current: strongest at the surface, fades to 0 below SURFACE_FRAC of depth
  windAt(y) { return this.wind * clamp(1 - clamp(y / H, 0, 1) / WIND.SURFACE_FRAC, 0, 1); }
  // gentle inflow→outflow through-current (rightward, weaker with depth)
  flowAt(y) { return FLOW.SPEED * (1 - 0.5 * clamp(y / H, 0, 1)); }
  // total horizontal current a drifter feels = wind (surface) + through-flow
  currentAt(x, y) { return this.windAt(y) + this.flowAt(y); }
  // meteorological seasons on the calendar (year-fraction 0 = March 1): spring Mar–May, summer Jun–Aug, autumn Sep–Nov,
  // winter Dec–Feb (the climate's ~0 °C January and ~25 °C late July sit in the middle of winter and summer)
  seasonName() {
    const p = ((this.year % 1) + 1) % 1;
    return p < 0.25 ? 'Spring' : p < 0.5 ? 'Summer' : p < 0.75 ? 'Autumn' : 'Winter';
  }
  // calendar month (a year = 12 months), month 0 = March. Display-only: seasonal timing in the sim (spawning, ice,
  // temperature) keys off the continuous year-fraction and the water temperature, not this.
  monthIndex() { return Math.floor((((this.year % 1) + 1) % 1) * 12) % 12; }   // 0..11
  monthName() { return MONTHS[this.monthIndex()]; }
  // continuous fraction through the current year [0,1) — the precise clock seasonal behaviour keys off
  yearFrac() { return (((this.year % 1) + 1) % 1); }

  // start a fresh lake at `time` with the season's thermal state already in place (no warm-up transient): the surface at
  // its seasonal temperature, the deep at a plausible lagged value, stratification and ice to match
  primeSeason(time) {
    this.year = time / SEASON.YEAR_LEN;
    const surf = Math.max(0.3, ENV.TEMP_BASE + SEASON.TEMP_AMP * Math.sin((this.year - SEASON.TEMP_PHASE) * TAU));
    this.tempC = surf; this.tempDiel = 0; this.tempNorm = clamp(surf / 26, 0, 1);
    // the hypolimnion keeps roughly its spring-turnover temperature and warms slowly through the stratified season (~6 →
    // ~15 °C by September, as the full model runs), is mixed with the surface through autumn, and sits ~5 °C under ice
    const yfp = ((this.year % 1) + 1) % 1;
    this.tempHypo = surf <= 4 ? 5 : yfp < 0.6 ? Math.min(surf, 6 + 9 * clamp((yfp - 0.1) / 0.45, 0, 1)) : Math.max(4, Math.min(surf, 15));
    this.ice = surf < ICE.FORM_T ? 1 : 0;
    this.strat = Math.max(clamp((surf - this.tempHypo - 1) / 6, 0, 1) * (1 - this.ice), ICE.STRAT * this.ice);
  }
  setWeather(w) { this.weather = w; this.weatherTimer = ENV.WEATHER_DWELL[w] * (0.6 + rand() * 0.8); this.forced = true; }

  // `world` is optional: without one (env-only tests) the calendar advances on its own clock and the plant/fish
  // O₂ terms are skipped.
  step(dt, world) {
    // --- time of day + season (day length and noon sun follow the solstice; ice + snow block most of the light) ---
    this.t = (this.t + dt / ENV.DAY_LEN) % 1;
    this.year = world ? world.time / SEASON.YEAR_LEN : this.year + dt / SEASON.YEAR_LEN;
    const yf = this.yearFrac(), sun = seasonalSun(yf);
    const cover = ENV.CLOUD_COVER[this.weather];
    this.light = daylight(this.t, sun.dayFrac) * sun.noon * (1 - cover) * (1 - ICE.LIGHT_CUT * this.ice);
    this.lightDay = sun.noon * (1 - ICE.LIGHT_CUT * this.ice);
    this.sun = daylight(this.t, sun.dayFrac);   // clear-sky sun height 0..1 (display: day/dawn/night whatever the cloud or ice)

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

    // --- season: a slow yearly cycle (SEASON.TEMP_PHASE: ~Aug 1 peak, ~Jan 21 low) that warms/cools the lake ---
    const seasonal = SEASON.TEMP_AMP * Math.sin((this.year - SEASON.TEMP_PHASE) * TAU);
    const iceOpen = 1 - this.ice;                       // the open-water fraction: wind and weather act only there

    // --- surface (epilimnion) temperature: seasonal + diurnal + weather, lags slightly; liquid water can't go much below
    // freezing (ice forms instead), and the diurnal skin swing vanishes under ice ---
    const diurnal = Math.sin((this.t - 0.30) * Math.PI * 2) * iceOpen;
    const relax = clamp(dt * ENV.TEMP_RELAX, 0, 1);
    const target = Math.max(0.3, ENV.TEMP_BASE + seasonal + ENV.TEMP_DIURNAL * diurnal + ENV.TEMP_WEATHER[this.weather] * iceOpen);
    this.tempC += (target - this.tempC) * relax;
    this.tempDiel += (ENV.TEMP_DIURNAL * diurnal - this.tempDiel) * relax;   // the diurnal component (same lag)
    this.tempNorm = clamp(this.tempC / 26, 0, 1);
    const surfT = this.tempC - this.tempDiel;           // diel-free surface temperature

    // --- ice: grows while the surface sits near freezing, melts once it warms (hysteresis) ---
    if (surfT < ICE.FORM_T) this.ice = Math.min(1, this.ice + ICE.GROW * dt);
    else if (surfT > ICE.MELT_T) this.ice = Math.max(0, this.ice - ICE.MELT * dt);

    // --- stratification, driven by the surface–deep temperature contrast: summer warming outpaces mixing → a thermocline;
    // it collapses when the surface cools back to the deep water in autumn (turnover) and is absent at ice-out (spring
    // turnover). Under ice the calm, inversely stratified column mixes weakly (ICE.STRAT). Strong wind (rain/storm)
    // ERODES it, and while it is storming (wind ≥ RESTRAT_MAX_WIND) the lake can't re-stratify at all.
    const windMul = WIND.WEATHER[this.weather] * iceOpen;
    const stratT = Math.max(clamp((surfT - this.tempHypo - 1) / 6, 0, 1) * iceOpen, ICE.STRAT * this.ice);
    if (windMul < THERMAL.RESTRAT_MAX_WIND) this.strat += (stratT - this.strat) * clamp(dt * THERMAL.STRAT_RELAX, 0, 1);
    this.strat = Math.max(0, this.strat - THERMAL.WIND_EROSION * Math.max(0, windMul - 1.0) * dt);
    // hypolimnion: follows the surface fast while mixed, barely at all once stratified — and never below 4 °C, the
    // temperature of densest water that settles to the bottom (so the deep stays ~4 °C under winter ice)
    const hk = (1 - this.strat) * (1 - this.strat) / THERMAL.HYPO_TAU_MIX + 1 / THERMAL.HYPO_TAU_STRAT;
    this.tempHypo += (Math.max(4, surfT) - this.tempHypo) * clamp(hk * dt, 0, 1);

    // --- wind: a slowly reversing surface current, stronger in foul weather — none under ice ---
    this._windT += dt;
    this.wind = WIND.BASE * Math.sin(this._windT * 0.045) * WIND.WEATHER[this.weather] * iceOpen;

    // --- turbidity: murk from suspended algae (green phyto + a heavily-shading cyanobacteria surface scum) + storm sediment ---
    const algae = clamp((this._meanPhyto + this._meanDiatom) / PHYTO.CAP + CYANO.TURB * (this._meanCyano / CYANO.CAP), 0, 1);
    const turbTarget = clamp(TURBIDITY.BASE + TURBIDITY.FROM_ALGAE * algae + TURBIDITY.FROM_STORM[this.weather] * (1 - this.ice), 0, 1);   // no storm-stirred sediment under ice
    this.turbidity += (turbTarget - this.turbidity) * clamp(dt * TURBIDITY.RELAX, 0, 1);

    // the inflow stream loads P-enriched nutrient into the left littoral (runoff → the eutrophication driver)
    // The stream enters as a PLUME over the near-shore surface water (FLOW.PLUME_COLS × PLUME_ROWS cells), not into one
    // cell — a single-cell point source made an artificial nitrifying dead zone at the inflow. And stream water is
    // well-aerated: the plume relaxes toward O₂ saturation (FLOW.O2_MIX) — all year, so under ice the inflow is one of the
    // few O₂ sources of the sealed lake, as in real winters.
    const load = FLOW.NUTRIENT * dt, pc = FLOW.PLUME_COLS, pr = FLOW.PLUME_ROWS, per = load / (pc * pr), sat = this.saturation();
    for (let cy = 0; cy < pr; cy++) for (let cx = 0; cx < pc; cx++) {
      const x = (cx + 0.5) * CW, y = (cy + 0.5) * CH;
      this.addNutrient(x, y, per, NUTRIENT.INFLOW_P);
      const i = this.cellOf(x, y); this.o2[i] += (sat - this.o2[i]) * clamp(FLOW.O2_MIX * dt, 0, 1);
    }
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
    const ph = this.phyto, pU = PHYTO.P_USE, nU = PHYTO.N_USE, R = PHYTO.RECYCLE, toDom = (1 - R) * (pU + nU), colD = this._colDecay;
    let litSum = 0, litCount = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const frac = (cy + 0.5) / ROWS, lit = this.lightAtDepth((cy + 0.5) * CH), band = frac < PHYTO.BAND;
      // algal metabolism follows temperature (Eppley-type Q10 ≈ 1.9 about 20 °C): respiration, decay and the light-SATURATED
      // photosynthesis (Pmax) slow in cold water, but LIGHT-LIMITED photosynthesis is photochemistry and barely depends on
      // temperature (Blackman) — so under clear ice the dim-light algae still make O₂ while their respiration idles
      const qP = Math.pow(PHYTO.Q10, (this.tempAt(0, (cy + 0.5) * CH) - 20) / 10), rA = this.algaeRespAt((cy + 0.5) * CH);
      const pl = photoRate(lit, qP);
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) {
        const b = ph[i], p = phos[i], a = nh4[i], nTot = a + no3[i];                                // available inorganic N
        const nLim = Math.min(nTot / (nTot + NUTRIENT.KN), p / (p + NUTRIENT.KP));                  // Liebig minimum
        let growth = PHYTO.GROW * pl * nLim * (1 - b / PHYTO.CAP) * dt;
        if (growth * pU > p) growth = p / pU;                                                      // stoichiometric ceiling
        if (growth * nU > nTot) growth = nTot / nU;
        if (growth < 0) growth = 0;
        const decay = PHYTO.DECAY * qP * b * dt;
        ph[i] = b + growth - decay; colD[i - cy * COLS] += decay;
        phos[i] = p - growth * pU + decay * R * pU;
        // N uptake: draw ammonium first (energetically preferred), then nitrate. Decomposed biomass recycles as ammonium.
        const nNeed = growth * nU, upA = nNeed < a ? nNeed : a;
        nh4[i] = a - upA + decay * R * nU;
        if (nNeed > upA) no3[i] -= nNeed - upA;
        dom[i] += decay * toDom;
        o2[i] += (PHYTO.O2_PHOTO * b * pl - PHYTO.O2_RESP * rA * b * qP) * dt;
        if (band) { litSum += ph[i]; litCount++; }   // algae density where it lives (the photic zone)
      }
    }
    this._meanPhyto = litCount ? litSum / litCount : 0;

    // cyanobacteria: the N-fixing strain competes for the (now-reduced) P, floats to a surface scum, leaks fixed N
    this.cyanobacteria(dt);
    this.diatoms(dt);

    if (world) {
      // photosynthesis (rooted plants add O2 by day) / plant respiration (night)
      // spread over the cells the plant occupies (base → top): the leaves photosynthesize and respire along the whole
      // stem — charging the whole plant to its tip cell drove single cells anoxic every night (real dense beds sag, but
      // over the bed's volume)
      const pm = this._plantMap; pm.fill(0);   // + the weed map (stems per cell × the plant's cover): the zooplankton's weed refuge and littoral food
      for (const p of world.plants) {
        if (p.dead) continue;
        const topY = p.baseY - p.height, om = p.o2 != null ? p.o2 : MACRO[p.v].o2;   // per-plant photosynthetic capacity (genes × variety)
        const lit = this.lightAtDepth(topY), n = Math.max(1, Math.ceil(p.height / CH)), share = p.biomass * om * dt / n;
        const flux = lit > 0.02 ? ENV.O2_PHOTO * lit : -ENV.O2_PLANT_NIGHT * Math.pow(PLANT.RESP_Q10, (this.tempAt(p.x, topY) - 20) / 10);   // dormant cold plants barely respire
        const cv = 0.5 * (p.cover ?? 1);
        for (let k = 0; k < n; k++) { const y = topY + (k + 0.5) * p.height / n; this.addO2(p.x, y, flux * share); pm[this.cellOf(p.x, y)] += cv; }
      }
      // fish respiration (consume O₂): each fish's actual respiration from its bioenergetics (world.js `rO2`, g O₂ per
      // sim-second — mass, temperature and swimming effort), converted to the normalised O₂ field by ENV.O2_PER_GO2
      for (const a of world.agents) {
        if (a.dead) continue;
        this.addO2(a.x, a.y, -ENV.O2_PER_GO2 * (a.rO2 || 0) * dt);
      }
      for (const f of world.fry || []) if (!f.dead && f.rO2) this.addO2(f.x, f.y, -ENV.O2_PER_GO2 * f.rO2 * dt);   // + the young-of-year schools
    }
    this.zooplankton(dt);   // the zooplankton grow on (and graze) this step's algae

    // oxygen demand below the epilimnion (drives hypolimnetic hypoxia): a SEDIMENT demand at each column's bed cell
    // (the benthic sediment respiration) + a weaker water-column demand (sinking particulate organic matter), both
    // ramping with depth. With weak vertical mixing when stratified, this drives the summer hypolimnion hypoxic.
    // Both are bacterial respiration, so they follow the local water temperature (Q10, calibrated at the ~12 °C summer
    // hypolimnion): about half the summer rate in the ~4 °C water under winter ice — without it the sealed winter lake went
    // anoxic top to bottom by March, where real lakes lose O₂ slowly and only the deep water runs out late in winter.
    const ramp = f => (f <= THERMAL.EPI_FRAC ? 0 : (f - THERMAL.EPI_FRAC) / (1 - THERMAL.EPI_FRAC));
    const qT = y => Math.pow(MICROBE.Q10, (this.tempAt(0, y) - 12) / 10);
    const pel = ENV.O2_PELAGIC * dt;
    for (let cy = 0; cy < ROWS; cy++) {
      const r = ramp((cy + 0.5) / ROWS);
      if (r <= 0) continue;
      const d = pel * r * qT((cy + 0.5) * CH);
      for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) o2[i] = Math.max(0, o2[i] - d);
    }
    for (let cx = 0; cx < COLS; cx++) {
      const by = bedRow[cx], i = by * COLS + cx, r = ramp((by + 0.5) / ROWS);
      if (r > 0) o2[i] = Math.max(0, o2[i] - ENV.O2_SED * dt * r * qT((by + 0.5) * CH));
    }

    // microbial loop: bacteria decompose DOM at a Q10 temperature- & O₂-limited rate, consuming O₂ and
    // remineralizing N (→ ammonium) + P (→ phosphate). Runs before sediment-P and the N-cycle so the freed P/N feed
    // them, and before surface re-aeration so the epilimnion can offset its (small) surface O₂ draw.
    this.microbialLoop(dt);

    // sediment-P internal loading (Mortimer redox): the anoxic summer deep RELEASES iron-bound P → blooms
    this.sedimentP(dt);
    this.sedimentOM(dt);   // the bed's organic detritus layer: the dying algae settle into it, bacteria decompose it
    this.benthos(dt);   // the bed's worms and scuds grow on that layer (BENTHOS)

    // nitrogen cycle: nitrification (NH₄→NO₃, draws O₂ here) + denitrification (NO₃→N₂, permanent N loss in
    // the anoxic deep). Runs before surface re-aeration so aeration can offset the surface nitrification O₂ draw.
    this.nitrogenCycle(dt);

    // surface re-aeration (top rows toward saturation, faster with turbulence + rain)
    const aer = (ENV.O2_AERATE * (ENV.AERATE_CALM + turb) + rainBoost * ENV.AERATE_RAIN) * (1 - this.ice);   // sealed under ice
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
    // water down — relax the hypolimnion toward the epilimnion O₂ at a rate set by (1 − strat). It is WIND-driven, so
    // the ice lid stops it (under ice the sealed column only diffuses: the deep water depletes, the top keeps its O₂).
    const overturn = clamp((1 - this.strat) * (1 - this.ice) * THERMAL.OVERTURN * dt, 0, 0.5);
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

    for (let cy = 0; cy < ROWS; cy++) for (let i = cy * COLS + lo[cy], e = cy * COLS + hi[cy]; i <= e; i++) o2[i] = clamp(o2[i], 0, 1.5);
  }

  // THROUGH-FLOW: the inflow→outflow current carries every dissolved/suspended field (phosphate, ammonium, nitrate,
  // phyto, cyano, DOM) rightward through the surface outflow layer (top OUTFLOW.DEPTH of the column, all wet across
  // the lake) — conservative first-order upwind — and what crosses the right shore leaves through the outlet
  // (tallied). With sediment burial this is the lake's N/P sink besides denitrification, so the inflow → lake →
  // outflow path is a real through-flow (≈ OUTFLOW.ADVECT × FLOW.SPEED; ~1-year water residence at the defaults).
  _throughFlow(dt) {
    const rows = Math.min(Math.max(1, Math.round(OUTFLOW.DEPTH * ROWS)), this.mask.bedRow.reduce((m, r) => Math.min(m, r + 1), ROWS));
    const fields = [this.phos, this.nh4, this.no3, this.phyto, this.cyano, this.dom, this.diatom];
    const pW = [1, 0, 0, PHYTO.P_USE, CYANO.P_USE, NUTRIENT.ORGANIC_P, PHYTO.P_USE], nW = [0, 1, 1, PHYTO.N_USE, CYANO.N_USE, 1 - NUTRIENT.ORGANIC_P, PHYTO.N_USE];
    let outP = 0, outN = 0;
    for (let cy = 0; cy < rows; cy++) {
      const a = clamp(OUTFLOW.ADVECT * this.flowAt((cy + 0.5) * CH) * dt / CW, 0, 0.5), base = cy * COLS;
      if (a <= 0) continue;
      for (let k = 0; k < fields.length; k++) {
        const f = fields[k];
        const gone = f[base + COLS - 1] * a; f[base + COLS - 1] -= gone; outP += gone * pW[k]; outN += gone * nW[k];   // out of the outlet
        for (let cx = COLS - 2; cx >= 0; cx--) { const i = base + cx, m = f[i] * a; f[i] -= m; f[i + 1] += m; }
      }
    }
    this.ledger.outP += outP; this.ledger.outN += outN;
  }

  // ---- serialization (for save/load) ----
  // Everything that shapes the future is saved — incl. the cached means (turbidity reads them BEFORE the next step
  // recomputes them) and the grid dimensions (so a different-sized grid is RESAMPLED, not row-sheared, on load).
  toJSON() {
    return {
      t: this.t, weather: this.weather, tempC: this.tempC, turbidity: this.turbidity,
      strat: this.strat, windT: this._windT, weatherTimer: this.weatherTimer, forced: !!this.forced,
      light: this.light, tempNorm: this.tempNorm, year: this.year, wind: this.wind, flash: this.flash, ice: this.ice,
      meanPhyto: this._meanPhyto, meanCyano: this._meanCyano, meanDOM: this._meanDOM, meanDiatom: this._meanDiatom, diatom: Array.from(this.diatom),
      tempHypo: this.tempHypo, tempDiel: this.tempDiel,   // the slow hypolimnion temperature + the diurnal part of tempC
      W, H, cols: COLS, rows: ROWS,
      o2: Array.from(this.o2), nh4: Array.from(this.nh4), no3: Array.from(this.no3), phos: Array.from(this.phos),
      phyto: Array.from(this.phyto), cyano: Array.from(this.cyano), sedP: Array.from(this.sedP),
      dom: Array.from(this.dom), sedOM: Array.from(this.sedOM),   // v28 the bed's organic layer (_colDecay is filled and emptied within a step)
      benth: Array.from(this.benth),   // v30 the bed's worms and scuds
      zooD: Array.from(this.zooD), zooC: Array.from(this.zooC), zooR: Array.from(this.zooR), zooEgg: Array.from(this.zooEgg),   // v30 the zooplankton fields + egg bank (the weed map and DVM shares are rebuilt each step)
    };
  }
  // Two-phase, validated load: everything is parsed into locals first and a descriptive Error is thrown BEFORE any field
  // changes if the input is unusable; then it commits. Every scalar is checked (finite, in range, defaulted when missing);
  // every field cell must be a finite number (else it keeps the fresh default) and is clamped to [0, FIELD_MAX] so an
  // absurd value can't overflow into NaN. `hint` = { W, H, time } from the world save (older env saves lack dims/year).
  load(s, hint = {}) {
    if (s == null || typeof s !== 'object' || Array.isArray(s)) throw new Error('environment: expected a saved environment object');
    const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
    let t = num(s.t, 0.30); if (!(t >= 0 && t < 1)) t = ((t % 1) + 1) % 1;              // time of day wrapped into [0,1)
    const weather = Number.isInteger(s.weather) && s.weather >= 0 && s.weather <= 3 ? s.weather : 0;
    const tempC = clamp(num(s.tempC, ENV.TEMP_BASE), -20, 60);
    const strat = clamp(num(s.strat, 0), 0, 1), turbidity = clamp(num(s.turbidity, TURBIDITY.BASE), 0, 1);
    const windT = num(s.windT, 0), weatherTimer = num(s.weatherTimer, ENV.WEATHER_DWELL[weather]), forced = s.forced === true;
    const light = clamp(num(s.light, daylight(t) * (1 - ENV.CLOUD_COVER[weather])), 0, 1);   // (only a fallback: the next step recomputes it)
    const tempNorm = clamp(num(s.tempNorm, tempC / 26), 0, 1);
    const ice = clamp(num(s.ice, 0), 0, 1);   // v25+; older saves had no ice (their climate never froze)
    const year = Math.max(0, num(s.year, num(hint.time, 0) / SEASON.YEAR_LEN));
    const wind = num(s.wind, WIND.BASE * Math.sin(windT * 0.045) * WIND.WEATHER[weather]), flash = clamp(num(s.flash, 0), 0, 1);
    // thermal states (v24+); older saves: the diurnal part from the clock, the deep as the surface minus the old fixed
    // summer drop (10 °C × strat) — both clamped to a sane water range
    const tempDiel = clamp(num(s.tempDiel, ENV.TEMP_DIURNAL * Math.sin((t - 0.30) * Math.PI * 2)), -20, 20);
    const tempHypo = clamp(num(s.tempHypo, tempC - tempDiel - 10 * strat), -5, 45);
    // grid dims of the save: explicit (v24+), else inferred from the saved world size, else assumed current
    let sc = s.cols, sr = s.rows;
    if (!(Number.isInteger(sc) && Number.isInteger(sr) && sc > 0 && sr > 0)) {
      const hw = num(hint.W, 0), hh = num(hint.H, 0);
      if (hw > 0 && hh > 0) { sc = Math.max(1, Math.round(hw * COLS / W)); sr = Math.max(1, Math.round(hh * ROWS / H)); } else { sc = COLS; sr = ROWS; }
    }
    const FIELD_MAX = 1e6;
    const cell = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, 0, FIELD_MAX) : d);
    // read a 2-D field into a fresh copy of `def` — direct when the grid matches, nearest-cell RESAMPLE by (cx,cy) when
    // the saved grid differs; an unreadable shape keeps the default. `xf` transforms each value (legacy pool splits).
    const field2 = (src, def, xf = v => v) => {
      const out = Float32Array.from(def);
      if (!Array.isArray(src)) return out;
      let c = sc, r = sr;
      if (src.length !== c * r) { if (src.length === COLS * ROWS) { c = COLS; r = ROWS; } else return out; }
      for (let cy = 0; cy < ROWS; cy++) {
        const oy = r === ROWS ? cy : Math.min(r - 1, Math.floor((cy + 0.5) * r / ROWS));
        for (let cx = 0; cx < COLS; cx++) {
          const ox = c === COLS ? cx : Math.min(c - 1, Math.floor((cx + 0.5) * c / COLS)), i = cy * COLS + cx;
          out[i] = cell(xf(src[oy * c + ox]), out[i]);
        }
      }
      return out;
    };
    const field1 = (src, def) => {   // per-column (sedP)
      const out = Float32Array.from(def);
      if (!Array.isArray(src)) return out;
      const c = src.length === sc ? sc : src.length === COLS ? COLS : 0; if (!c) return out;
      for (let cx = 0; cx < COLS; cx++) out[cx] = cell(src[c === COLS ? cx : Math.min(c - 1, Math.floor((cx + 0.5) * c / COLS))], out[cx]);
      return out;
    };
    const o2 = field2(s.o2, new Float32Array(COLS * ROWS).fill(ENV.O2_START));
    const phyto = field2(s.phyto, new Float32Array(COLS * ROWS).fill(PHYTO.START));
    const diatom = field2(s.diatom, new Float32Array(COLS * ROWS).fill(DIATOM.START));   // v25+ (older saves: the seed)
    const cyano = field2(s.cyano, new Float32Array(COLS * ROWS).fill(CYANO.START));
    const dom = field2(s.dom, new Float32Array(COLS * ROWS).fill(MICROBE.START));   // older saves lack it → the seed
    const sedP = field1(s.sedP, new Float32Array(COLS).fill(SED_P.START));
    const sedOM = field1(s.sedOM, new Float32Array(COLS).fill(SEDOM.START));   // v28 (older saves: the start layer)
    const zooD = field2(s.zooD, this._zooFill(PLANKTON.START_D)), zooC = field2(s.zooC, this._zooFill(PLANKTON.START_C));   // v30 (older: the start)
    const zooR = field2(s.zooR, this._zooFill(PLANKTON.START_R));
    const benth = field1(s.benth, new Float32Array(COLS).fill(BENTHOS.START * COL_M2));   // v30 (older: the start stock)
    const zooEgg = this._eggFill();   // v30 egg bank: [col × 2 + kind] for the current grid (another grid size → the start bank)
    if (Array.isArray(s.zooEgg) && s.zooEgg.length === COLS * 2) for (let k = 0; k < COLS * 2; k++) zooEgg[k] = cell(s.zooEgg[k], zooEgg[k]);
    let phos = field2(s.phos, new Float32Array(COLS * ROWS).fill(NUTRIENT.P_START));
    let nh4 = new Float32Array(COLS * ROWS).fill(NCYCLE.NH4_START), no3 = new Float32Array(COLS * ROWS).fill(NCYCLE.NO3_START);
    // Nitrogen pools. v9+ saves the nh4/no3 split directly; tolerate older saves:
    //   v7/v8 had a single `din` pool → split it half ammonium / half nitrate;
    //   legacy (≤v6) `nut` was a single combined N+P pool → split off the N share, then halve it across nh4/no3.
    const fin = v => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
    if (s.nh4 || s.no3) { nh4 = field2(s.nh4, nh4); no3 = field2(s.no3, no3); }
    else if (s.din) { nh4 = field2(s.din, nh4, v => fin(v) * 0.5); no3 = field2(s.din, no3, v => fin(v) * 0.5); }
    else if (s.nut) {
      nh4 = field2(s.nut, nh4, v => fin(v) * (1 - NUTRIENT.ORGANIC_P) * 0.5); no3 = field2(s.nut, no3, v => fin(v) * (1 - NUTRIENT.ORGANIC_P) * 0.5);
      phos = field2(s.nut, phos, v => fin(v) * NUTRIENT.ORGANIC_P);
    }
    // cached means: saved (v24+) or recomputed from the loaded fields with the step's definitions — over WET cells only
    // (this.mask is geometry built in the constructor, independent of the save), photic band for green phyto, surface
    // scum band for cyano, every wet cell for DOM
    const { lo, hi } = this.mask;
    const bandMean = (f, maxFrac) => { let sm = 0, n = 0; for (let cy = 0; cy < ROWS; cy++) { if (maxFrac < 1 && (cy + 0.5) / ROWS >= maxFrac) continue; for (let cx = lo[cy]; cx <= hi[cy]; cx++) { sm += f[cy * COLS + cx]; n++; } } return n ? sm / n : 0; };
    const meanPhyto = Math.max(0, num(s.meanPhyto, bandMean(phyto, PHYTO.BAND)));
    const meanDiatom = Math.max(0, num(s.meanDiatom, bandMean(diatom, DIATOM.BAND)));
    const meanCyano = Math.max(0, num(s.meanCyano, bandMean(cyano, CYANO.SCUM_BAND)));
    const meanDOM = Math.max(0, num(s.meanDOM, bandMean(dom, 1)));
    // ---- commit (nothing above touched `this`) ----
    Object.assign(this, { t, weather, tempC, strat, turbidity, weatherTimer, forced, light, tempNorm, year, wind, flash, tempDiel, tempHypo, ice });
    this._windT = windT; this._meanPhyto = meanPhyto; this._meanCyano = meanCyano; this._meanDOM = meanDOM; this._meanDiatom = meanDiatom;
    this.o2.set(o2); this.phyto.set(phyto); this.diatom.set(diatom); this.cyano.set(cyano); this.dom.set(dom); this.sedP.set(sedP); this.sedOM.set(sedOM); this._colDecay.fill(0); this.zooD.set(zooD); this.zooC.set(zooC); this.zooR.set(zooR); this.zooEgg.set(zooEgg); this.benth.set(benth); this.phos.set(phos); this.nh4.set(nh4); this.no3.set(no3);
  }
}

// CONSERVATIVE diffusion in flux form over the WET cells: every pair of wet neighbours exchanges (k/4)·(f[j] − f[i]),
// which enters the two cells with opposite signs → the field total is conserved exactly (to float rounding). No flux
// crosses the lake edges or the bed (no-flux boundaries; the old mean-of-neighbours stencil destroyed mass at edges).
// Interior cells behave exactly as before. Dry cells are copied through untouched.
// algal photosynthesis rate (relative) at light `lit` and temperature factor qP (Q10, 1 at 20 °C): Blackman-type —
// LIGHT-LIMITED photosynthesis is photochemistry and nearly temperature-independent, only the light-SATURATED maximum
// follows the Q10; above 20 °C the warm boost applies to the whole curve (the pre-existing summer calibration)
export function photoRate(lit, qP) { return qP >= 1 ? lit * qP : Math.min(lit, qP); }

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
