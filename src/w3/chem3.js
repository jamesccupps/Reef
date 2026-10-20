// chem3.js — the 3-D lakes' chemistry and plankton (pure). Stage 3, slice 2: O₂, ammonium, nitrate, phosphate, the three
// algae (green phytoplankton, diatoms, cyanobacteria), dissolved organic matter, zooplankton (Daphnia, copepods, rotifers and
// their resting eggs), the bed's bound-P store, its organic layer and its worms and scuds — the 2-D sim's calibrated processes
// (environment.js) on every cell of the 3-D water, with closed N and P budgets.
//
// UNITS. Water fields keep the 2-D sim's units as CONCENTRATIONS: "per 2-D cell" (V2 = WORLD.CELL_L litres); the bed's stores
// "per 2-D column" (A2 = SLICE_M2 / FIELD_COLS m² of bed). So every 2-D constant carries over unchanged; a 3-D cell of
// volume v and bed area b holds c·v/V2 of a field and s·b/A2 of a bed store. A flux between the bed and the water (per unit
// of bed, as the 2-D formulas give it) changes the water's concentration by flux × (b/A2)/(v/V2) — the bed's area over the
// water's volume, × the 2-D bed cell's thickness: thin water over a lot of bed changes fastest (the coves, under ice).
// Rates: the 2-D sim's per-second rates × TS; its per-day rates on the calendar day DAY3.
import { ENV, NUTRIENT, PHYTO, DIATOM, CYANO, MICROBE, NCYCLE, SED_P, SEDOM, BENTHOS, PLANKTON, ZOO3, TURBIDITY, ICE, SEASON, WORLD, GRID, seasonalTemp } from '../config.js';
import { photoRate } from '../environment.js';
import { clamp } from '../core.js';
import { TS, DAY3, CLOCK3 } from './clock3.js';
import { GEO, UPPER, LOWER, BROOK } from './geometry.js';
import { PL3 } from './plants3.js';

export const V2 = WORLD.CELL_L / 1000;                 // m³: the 2-D cell the water units are "per"
export const A2 = WORLD.SLICE_M2 / GRID.FIELD_COLS;    // m²: the 2-D column of bed the bed units are "per"
const HREF_M = WORLD.DEPTH_REF / WORLD.PX_PER_M;
const UGL = PLANKTON.UGL;                              // µg dry/L per g wet per 2-D cell (a config getter: read once)       // m: the 14.6-m column the 2-D light and band constants are fractions of
export const CHEM3 = {
  // THE BROOK AS A LAKE-OUTLET STREAM (docs/research_notes/Whole lake 3D fish simulation/brook_food_web.md): the filter feeders
  // on its stones — net-spinning caddis, blackflies — strain the algae from Upper's outflow (blackflies alone take 0.24–0.35 %
  // a metre, 21–30 % a 100 m, at ~0.3 m/s; outlet filterers peak 40–160 m below a lake and the whole 150-m brook lies in that
  // zone), up to what they can catch (Maine's outlet filterers track their capture capacity, not the seston's amount — Demi et
  // al. 2012; a hydropsychid makes ~18 g DW/m²/yr just below an outlet, ~5× that eaten). What they catch feeds the brook bed's
  // invertebrates (its organic layer: they ARE them); its nutrients go back to the water as the algae's decay's would. Riffles
  // hold more invertebrates than a lake's mud (BROOK_BENTH × the bed's capacity). Without this the brook fed its dace like a
  // patch of lake bed and they starved (Maine's Piscataquis dace make 5.3 g wet/m²/yr on ~4.7 g AFDM/m²/yr of prey)
  BROOK_FILTER: 8.6e-4,   // /s (real): the share of the water's algae a filter-feeder bed takes, −ln(0.75) per 100 m at 0.3 m/s
  BROOK_CAP: 1.5,         // g wet/m²/day at 20 °C: what they can catch (~90 g DW/m²/yr eaten for ~18 g DW/m²/yr made)
  BROOK_BENTH: 3,         // × BENTHOS.CAP: a riffle's invertebrate stock against a lake bed's
  // SURFACE GAS EXCHANGE (stage R2; research_notes/Whole lake 3D fish simulation/oxygen_metabolism.md §1): the lake-size wind
  // model k600 = 2.51 + 1.48·U + 0.39·U·log10(A) cm/h (Vachon & Prairie 2013; A the real lake's km²: 1.6–4.7 m/day at 2.5–10
  // m/s on Upper — measured on a 64-ha boreal lake ~1.4 m/day), with a floor on cooling nights from convection (K600_NIGHT: 0.34–
  // 0.93 m/day at 25–200 W/m² of heat loss — Read et al. 2012, Tedford et al. 2014), to O₂ by the Schmidt number (Sc/600)^-½;
  // none under ice. (The 1-hour year's weather-state rate gave ~0.5 m/day all day — a calm pond's)
  K600_NIGHT: 0.6,      // m/day
  // O₂ AT SATURATION: Garcia & Gordon 1992 (the Benson & Krause fit), freshwater, mL/L → mg/L × 1.42905, at the lakes' ~130 m
  // (× SAT_P) — the 2-D sim's linear curve read 6–10 % low at 0–4 °C
  SAT_P: 0.985,
  // the BED'S ALGAE (periphyton: SEDOM.PERI_G, into the organic layer) release their photosynthesis's O₂ into the water over the
  // bed: ~50 g C per 1,000 g wet × 32/12 (their respiration, and the decay of what they make, are in the bed's O₂ demand O2_SED).
  // ~0.9 g O₂/m² of lake/day in summer — benthic algae make 5–80 % of a shallow lake's production (oxygen_metabolism.md §2)
  PERI_O2: 0.133,
  // what the inflow brings (concentrations, 2-D units). The 2-D slice's load (FLOW.NUTRIENT per second over its wet cells)
  // per unit of lake volume, delivered by the 3-D inflow at the real discharge: ~1.1 units of nutrient per 2-D cell of inflow
  // water, INFLOW_P of it phosphate, the rest ammonium (runoff) — to be re-judged with the catchment's real loads (stage D)
  IN_NUT: 1.1,
  IN_NO3: NCYCLE.NO3_START, IN_DOM: 0.05, IN_ALGAE: 0.1,   // stream water: its nitrate, a little organic matter and algae (× START)
  IN_ZOO: 0.05,                                            // … and few zooplankton (× START)
  SLOW: 3,                                                 // the slow processes run every SLOW-th update (see step)
  // THE BED'S BOUNDARY LAYER for dissolved P: the 2-D sim's bed exchanged with its 0.3-m bed cell, a film the binding and the P
  // rain drew down locally (diffusion refilled it slowly) — that film is what throttled the bed. A 3-D bed cell's water is the
  // column's mixed water, so the bed's capture of dissolved P (BIND, RAIN_BASE) is × this factor (a diffusive boundary layer);
  // settling algae (particles) are not. Calibrated so a lake without fish holds its P over a year as the 2-D one does
  BED_EXCH: 0.35,
  // BURIAL of the bed's bound P (× SED_P.BURY): the 2-D slice, flushed once a year with little outflow, buried nearly all its
  // load (its burial empties the bound store in ~20 days). Lakes flushed every 2–3 months keep only ~half their P load (the
  // rest leaves by the outlet — Vollenweider/Kirchner–Dillon retention ~0.4–0.7 at these flushing rates); calibrated so a
  // year without fish keeps its P inventory (Larsen–Mercier R = 1/(1+√τ): Upper 0.66, Lower 0.72; the model ~0.75)
  BURY_MUL: 0.15,
  // OXIC RELEASE of the bed's bound P (/s on the 2-D clock at 20 °C, × REL_Q10 per 10 °C): a shallow lake's internal loading is
  // driven by temperature, highest in summer, even over oxic sediment — the mineralisation of the bed's organic P (Søndergaard
  // et al. 2003; Jensen & Andersen 1992) — the redox switch (SED_P.RELEASE) adds to it when the bed goes anoxic. (0: off)
  // (0.0015: the summer's dissolved P holds up 2–4×, and a year without fish keeps ~two-thirds of its P load: Larsen–Mercier
  // 0.66–0.72 — the bed's release balancing its binding and burial)
  REL_OXIC: 0.0015, REL_Q10: 2.5,
  // COLOURED WATER (step 4b): the dissolved colour of a spruce–fir and wetland catchment (30–60 SPU) sets most of the light's
  // attenuation (/m, added to the algae's and the stirred sediment's) — Secchi ~3 m, where the 2-D sim's water read 6–9 m
  // (Maine report: colour, not phytoplankton, dominates a Hot Brook basin's light; stained Kd·SD ≈ 2.4–2.7 — Koenings &
  // Edmundson 1991)
  KD_COLOUR: 0.5,
  // CATCHMENT ORGANIC MATTER — a brown lake's subsidy to its bed: ALLOCH g wet per m² of bed a year, half settling evenly (the
  // inflow's and the runoff's particles, the wetland margins' detritus), half the autumn leaf fall (LEAF_YF), concentrated
  // near the shore (e-folding LEAF_R m, world). In coloured lakes terrestrial carbon is often half or more of what the bed's
  // animals live on (allochthony); colour shades out the bed's own algae (stage 7a)
  ALLOCH: 800, LEAF_YF: [0.58, 0.72], LEAF_R: 150 * GEO.SCALE,   // (LEAF_R: ~150 m real; 15 at 1/10)
    // (800: the low-middle of brown lakes' ~20–100 g C/m²/yr; 3 seeds: late-summer starvation halves)
};

// Q10 temperature factors from lookup tables (T −2 … 40 °C in 0.05° steps) — a step computes ~10 per cell
const qLUT = (q10, ref) => { const t = new Float32Array(841); for (let i = 0; i < 841; i++) t[i] = Math.pow(q10, (i * 0.05 - 2 - ref) / 10); return t; };
const qAt = (tab, T) => { let i = ((T + 2) * 20 + 0.5) | 0; if (i < 0) i = 0; else if (i > 840) i = 840; return tab[i]; };
const Q = {
  ph: qLUT(PHYTO.Q10, 20), mic12: qLUT(MICROBE.Q10, 12), mic: qLUT(MICROBE.Q10, MICROBE.REF_TEMP), n: qLUT(NCYCLE.Q10, 20), som: qLUT(SEDOM.Q10, 20),
  ben: qLUT(BENTHOS.Q10, 20), zD: qLUT(PLANKTON.Q10_D, 20), zC: qLUT(PLANKTON.Q10_C, 20), zL: qLUT(PLANKTON.Q10_L, 20), zR: qLUT(PLANKTON.Q10_R, 20),
  zLD: qLUT(ZOO3.Q10_LD, 20), zLC: qLUT(ZOO3.Q10_LC, 20), zC3: qLUT(ZOO3.Q10_C, 20),
};
const sun = yf => { const s = 0.5 + 0.5 * Math.cos(2 * Math.PI * (yf - SEASON.SOLSTICE)); return { dayFrac: SEASON.DAY_FRAC[0] + (SEASON.DAY_FRAC[1] - SEASON.DAY_FRAC[0]) * s, noon: SEASON.NOON[0] + (SEASON.NOON[1] - SEASON.NOON[0]) * s }; };

// O₂ at saturation in mg/L (Garcia & Gordon 1992, Benson & Krause coefficients; freshwater)
function o2SatMgL(T) {
  const Ts = Math.log((298.15 - T) / (273.15 + T));
  return Math.exp(2.00907 + Ts * (3.22014 + Ts * (4.0501 + Ts * (4.94457 + Ts * (-0.256847 + Ts * 3.88767))))) * 1.42905;
}
export class Chem3 {
  constructor(env) {
    this.env = env; const G = this.G = env.G, n = G.NCELL;
    const F = v => new Float32Array(n).fill(v);
    this.o2 = F(ENV.O2_START); this.nh4 = F(NCYCLE.NH4_START); this.no3 = F(NCYCLE.NO3_START); this.phos = F(NUTRIENT.P_START);
    this.phyto = F(PHYTO.START); this.diatom = F(DIATOM.START); this.cyano = F(CYANO.START); this.dom = F(MICROBE.START);
    this.zooD = F(PLANKTON.START_D); this.zooC = F(PLANKTON.START_C); this.zooR = F(PLANKTON.START_R);
    // the bed's stores, per 2-D column of bed, on the cells whose bed lies in them (zero elsewhere)
    this.sedP = new Float32Array(n); this.sedOM = new Float32Array(n); this.benth = new Float32Array(n); this.eggD = new Float32Array(n); this.eggC = new Float32Array(n);
    this.bedCells = []; for (let j = 0; j < n; j++) if (G.bedA[j] > 0) this.bedCells.push(j);
    this.bedCells = Int32Array.from(this.bedCells);
    for (const j of this.bedCells) { this.sedP[j] = SED_P.START; this.sedOM[j] = SEDOM.START; this.benth[j] = BENTHOS.START * A2; this.eggD[j] = PLANKTON.EGG_START_D; this.eggC[j] = PLANKTON.EGG_START_C; }
    // per cell: the water in 2-D cells (w) and the bed in 2-D columns (a); r = a / w, the bed–water coupling
    this.w = new Float32Array(n); this.a = new Float32Array(n); this.r = new Float32Array(n);
    for (let j = 0; j < n; j++) { this.w[j] = G.vol[j] / V2; this.a[j] = G.bedA[j] / A2; this.r[j] = this.a[j] / this.w[j]; }
    // per column: its bed area (for sharing the algae that die in it), its depth's DVM refuge for zooplankton
    this.colBedA = new Float32Array(G.NC); for (let c = 0; c < G.NC; c++) for (let k = 0; k < G.nL[c]; k++) this.colBedA[c] += G.bedA[G.cell0[c] + k];
    this.brookCols = []; for (let c = 0; c < G.NC; c++) if (G.body[c] === BROOK) this.brookCols.push(c);
    this.brookCell = new Uint8Array(n); for (const c of this.brookCols) for (let k = 0; k < G.nL[c]; k++) this.brookCell[G.cell0[c] + k] = 1;
    this.brookCaught = 0;   // g wet of algae the brook's filter feeders have taken (a running total, for the diagnostics)
    this.refAv = new Float32Array(G.NC); for (let c = 0; c < G.NC; c++) this.refAv[c] = clamp((G.depthMax[c] / HREF_M - PLANKTON.REF_DEPTH) / PLANKTON.REF_RAMP, 0, 1);
    this.colDecay = new Float64Array(G.NC); this._w = new Float64Array(G.ML);
    // each column's share of the leaf fall: nearer the shore more (normalised to a bed-area mean of 1)
    this.leafW = new Float32Array(G.NC); { let s = 0, A = 0; for (let c = 0; c < G.NC; c++) { const w = Math.exp(-Math.max(0, GEO.shoreDist(G.cx[c], G.cy[c])) / CHEM3.LEAF_R); this.leafW[c] = w; s += w * this.colBedA[c]; A += this.colBedA[c]; } for (let c = 0; c < G.NC; c++) this.leafW[c] *= A / Math.max(1e-9, s); }
    this.plantMap = new Float32Array(n);   // (the 2-D sim's weed stems per cell — unused in 3-D: plantRef)
    this.plantRef = new Float32Array(n);   // the weeds' zooplankton refuge per cell, 0–0.8 (plants3.js: from the weed volume)
    this.zv = new Float32Array(n);         // a visual planktivore's sight in each cell by the day's light (zooVis; set each update)
    this.turbidity = TURBIDITY.BASE; this.fishKgHa = 0; this._migD = 0; this._migC = 0;
    this.meanPhyto = PHYTO.START; this.meanDiatom = DIATOM.START; this.meanCyano = CYANO.START; this.meanDOM = MICROBE.START;
    this.ledger = { inP: 0, inN: 0, outP: 0, outN: 0, buryP: 0, denitN: 0, fixN: 0 };
    this.zooProd = 0; this.benthProd = 0; this._slowN = 0; this.algProd = 0; this.algDecay = 0;   // (the green algae's and diatoms' growth and die-off, units × 2-D cells — diagnostics)
    // transported with the water (the inflow brings `in`): the budget's P and N weights per field, for the ledger
    const nIn = CHEM3.IN_NUT * (1 - NUTRIENT.INFLOW_P), pIn = CHEM3.IN_NUT * NUTRIENT.INFLOW_P;
    this.tf = [
      { name: 'o2', a: this.o2, in: ENV.O2_START, p: 0, n: 0 },
      { name: 'nh4', a: this.nh4, in: nIn, p: 0, n: 1 }, { name: 'no3', a: this.no3, in: CHEM3.IN_NO3, p: 0, n: 1 }, { name: 'phos', a: this.phos, in: pIn, p: 1, n: 0 },
      { name: 'phyto', a: this.phyto, in: PHYTO.START * CHEM3.IN_ALGAE, p: PHYTO.P_USE, n: PHYTO.N_USE },
      { name: 'diatom', a: this.diatom, in: DIATOM.START * CHEM3.IN_ALGAE, p: PHYTO.P_USE, n: PHYTO.N_USE },
      { name: 'cyano', a: this.cyano, in: CYANO.START * CHEM3.IN_ALGAE, p: CYANO.P_USE, n: CYANO.N_USE },
      { name: 'dom', a: this.dom, in: CHEM3.IN_DOM, p: NUTRIENT.ORGANIC_P, n: 1 - NUTRIENT.ORGANIC_P },
      { name: 'zooD', a: this.zooD, in: PLANKTON.START_D * CHEM3.IN_ZOO, p: 0, n: 0 }, { name: 'zooC', a: this.zooC, in: PLANKTON.START_C * CHEM3.IN_ZOO, p: 0, n: 0 },
      { name: 'zooR', a: this.zooR, in: PLANKTON.START_R * CHEM3.IN_ZOO, p: 0, n: 0 },
    ];
    env.fields.push(...this.tf);
  }
  prime() {   // a fresh lake at the season's start: O₂ at saturation for each cell's water
    const T = this.env.temp; for (let j = 0; j < this.G.NCELL; j++) this.o2[j] = this.sat(T[j]) * 0.95;
    this._sight();
  }
  _sight() {   // (zooVis per cell, its lake-wide terms hoisted; ln(I/VIS_I0) = ln(I0/VIS_I0) − kd·z: one log a column, no exp a cell)
    const G = this.G, P = PLANKTON, e = this.env, kd = this.attenuation(), cl = this.clarity(), iden = 1 / Math.log(P.VIS_I1 / P.VIS_I0), zv = this.zv;
    for (let c = 0; c < G.NC; c++) {
      const I0 = e.lightDay * (1 - ICE.LIGHT_CUT * e.ice[c]), L0 = I0 > 0 ? Math.log(I0 / P.VIS_I0) : -Infinity;
      for (let k = 0, j = G.cell0[c]; k < G.nL[c]; k++, j++) { const x = L0 - kd * G.zMid[j]; zv[j] = x > 0 ? Math.min(1, x * iden) * cl : 0; }
    }
  }

  // ---------- light and O₂ solubility ----------
  sat(T) { return o2SatMgL(T) * CHEM3.SAT_P / ENV.O2_MGL; }   // O₂ at saturation (normalised: × ENV.O2_MGL for mg/L)
  attenuation() { return ENV.LIGHT_ATTEN * (1 + TURBIDITY.ATTEN * this.turbidity) / HREF_M + CHEM3.KD_COLOUR; }   // per metre
  secchi() { return 2.55 / this.attenuation(); }   // m (stained water: Kd·SD ≈ 2.55)
  // the light at depth z in column c (the surface's × the ice's cut × the water's attenuation)
  lightAt(c, z) { const e = this.env; return e.light * (1 - ICE.LIGHT_CUT * e.ice[c]) * Math.exp(-this.attenuation() * z); }

  // ============================================================ step ===================================================
  step(dt) {
    const e = this.env, G = this.G, yf = e.yearFrac(), T = e.temp, dd = dt / DAY3;
    // the lake's murk from its algae and the storms' stirred sediment (the 2-D sim's, lake-wide)
    const algae = clamp((this.meanPhyto + this.meanDiatom) / PHYTO.CAP + CYANO.TURB * (this.meanCyano / CYANO.CAP), 0, 1);
    const turbT = clamp(TURBIDITY.BASE + TURBIDITY.FROM_ALGAE * algae + TURBIDITY.FROM_STORM[e.weather] * (1 - e.iceMean), 0, 1);
    this.turbidity += (turbT - this.turbidity) * clamp(dt * TURBIDITY.RELAX * TS, 0, 1);
    for (const fd of this.tf) if (fd.name === 'o2') fd.in = this.sat(seasonalTemp(yf));   // stream water is well aerated
    this._algae(dt);
    this._brookFilter(dt);
    this._o2Demand(dt);
    // the slow processes (rates per day: zooplankton, bacteria, the N cycle, the bed) run every SLOW-th update with SLOW × dt
    // — the algae and O₂, which follow the day and night, every update
    if (++this._slowN >= CHEM3.SLOW) {
      const ds = dt * this._slowN; this._slowN = 0;
      this._zooplankton(ds, ds / DAY3, yf);
      this._microbial(ds);
      this._sedimentP(ds);
      this._sedimentOM(ds);
      this._benthos(ds);
      this._nitrogen(ds);
    }
    this._aerate(dt);
    this._sight();
    const o2 = this.o2; for (let j = 0; j < G.NCELL; j++) { const v = o2[j]; o2[j] = v < 0 ? 0 : v > 2.6 ? 2.6 : v; }   // (weed beds reach 205–235 % of saturation by afternoon)
  }

  // ---------- the algae: green phytoplankton, diatoms (cold-water), cyanobacteria (N-fixing, buoyant) ----------
  _algae(dt) {
    const e = this.env, G = this.G, T = e.temp, ph = this.phyto, di = this.diatom, cy = this.cyano, phos = this.phos, nh4 = this.nh4, no3 = this.no3, dom = this.dom, o2 = this.o2;
    const pU = PHYTO.P_USE, nU = PHYTO.N_USE, R = PHYTO.RECYCLE, toDom = (1 - R) * (pU + nU);
    const cpU = CYANO.P_USE, cnU = CYANO.N_USE, cR = CYANO.RECYCLE, ctoDom = (1 - cR) * (cpU + cnU);
    const kd = this.attenuation(), s = sun(e.yearFrac()), mixM = e.mixDepth(), PC = PHYTO.PER_CAPITA;
    let litSum = 0, litN = 0, diaSum = 0, diaN = 0, cySum = 0, cyN = 0, fixed = 0;
    const colD = this.colDecay;
    for (let c = 0; c < G.NC; c++) {
      const j0 = G.cell0[c], n = G.nL[c], iceCut = 1 - ICE.LIGHT_CUT * e.ice[c], Ls = e.light * iceCut, Ld = s.noon * iceCut;
      for (let k = 0; k < n; k++) {
        const j = j0 + k, z = G.zMid[j], att = Math.exp(-kd * z), lit = Ls * att, Tj = T[j], w = this.w[j];
        const qP = qAt(Q.ph, Tj), dark = Math.min(1, Ld * att / PHYTO.RESP_IK), rA = PHYTO.DARK_RESP + (1 - PHYTO.DARK_RESP) * dark;
        const rD = PC ? PHYTO.DARK_DECAY + (1 - PHYTO.DARK_DECAY) * dark : 1;   // (per-capita algae: starved cells in the dark die slower)
        // GREEN PHYTOPLANKTON: light × Liebig-co-limited nutrient, Redfield N+P taken (ammonium first); decay returns N+P
        // (RECYCLE at once, the rest via DOM); O₂ by day, respiration always
        let p = phos[j], a = nh4[j], nTot = a + no3[j], b = ph[j];
        const nLim = Math.min(nTot / (nTot + NUTRIENT.KN), p / (p + NUTRIENT.KP)), pl = photoRate(lit, qP);
        let g = (PC ? PHYTO.GROW_PC * (b + PHYTO.INOC) : PHYTO.GROW) * TS * pl * nLim * (1 - b / PHYTO.CAP) * dt; if (g * pU > p) g = p / pU; if (g * nU > nTot) g = nTot / nU; if (g < 0) g = 0;
        let dc = (PC ? PHYTO.DECAY_PC : PHYTO.DECAY) * TS * qP * rD * b * dt;
        ph[j] = b + g - dc; colD[c] += dc * w; this.algProd += g * w; this.algDecay += dc * w;
        p = p - g * pU + dc * R * pU; let need = g * nU, upA = need < a ? need : a; a = a - upA + dc * R * nU; if (need > upA) no3[j] -= need - upA;
        dom[j] += dc * toDom;
        o2[j] += (PHYTO.O2_PHOTO * b * pl - PHYTO.O2_RESP * rA * b * qP) * TS * dt;
        if (z / HREF_M < PHYTO.BAND) { litSum += ph[j] * w; litN += w; }
        // DIATOMS: cold-centred (best ~7 °C) — the spring bloom; the window caps the light-saturated rate
        b = di[j]; nTot = a + no3[j];
        const tf = clamp(1 - Math.abs(Tj - DIATOM.TEMP_OPT) / DIATOM.TEMP_TOL, 0, 1), pd = Math.min(lit, tf);
        const nLd = Math.min(nTot / (nTot + NUTRIENT.KN), p / (p + NUTRIENT.KP));
        g = (PC ? DIATOM.GROW_PC * (b + PHYTO.INOC) : DIATOM.GROW) * TS * pd * nLd * (1 - b / PHYTO.CAP) * dt; if (g * pU > p) g = p / pU; if (g * nU > nTot) g = nTot / nU; if (g < 0) g = 0;
        dc = (PC ? DIATOM.DECAY_PC : DIATOM.DECAY) * TS * qP * rD * b * dt;
        di[j] = b + g - dc; colD[c] += dc * w; this.algProd += g * w; this.algDecay += dc * w;
        p = p - g * pU + dc * R * pU; need = g * nU; upA = need < a ? need : a; a = a - upA + dc * R * nU; if (need > upA) no3[j] -= need - upA;
        dom[j] += dc * toDom;
        o2[j] += (PHYTO.O2_PHOTO * b * pd - PHYTO.O2_RESP * rA * b * qP) * TS * dt;
        if (z / HREF_M < DIATOM.BAND) { diaSum += di[j] * w; diaN += w; }
        // CYANOBACTERIA: P-limited only (they fix N₂ for the deficit, leaking a little), warm-water, logistic from a tiny inoculum
        b = cy[j];
        const pM = p / (p + NUTRIENT.KP), tc = clamp(1 - Math.abs(Tj - CYANO.TEMP_OPT) / CYANO.TEMP_TOL, 0, 1);
        let cg = CYANO.GROW * TS * lit * pM * tc * (b + CYANO.INOC) * (1 - b / CYANO.CAP) * dt; if (cg * cpU > p) cg = p / cpU; if (cg < 0) cg = 0;
        const cd = CYANO.DECAY * TS * qP * b * dt;
        cy[j] = b + cg - cd; colD[c] += cd * w;
        p = p - cg * cpU + cd * cR * cpU;
        need = cg * cnU; const tA = need < a ? need : a, o = no3[j], tO = need - tA < o ? need - tA : o, fix = need - tA - tO, leak = need > 0 ? cg * CYANO.FIX_N * (fix / need) : 0;
        a = a - tA + leak + cd * cR * cnU; no3[j] = o - tO; dom[j] += cd * ctoDom; fixed += (fix + leak) * w;
        o2[j] += (CYANO.O2_PHOTO * b * lit - CYANO.O2_RESP * qP * b) * TS * dt;
        if (z / HREF_M < CYANO.SCUM_BAND) { cySum += cy[j] * w; cyN += w; }
        phos[j] = p; nh4[j] = a;
      }
      // in calm water the cyanobacteria float up a layer (a scum); a dense one backs up instead of passing CAP
      const rise = clamp(CYANO.BUOY * TS * (1 - ENV.TURBULENCE[e.weather]) * dt, 0, 0.9);
      if (rise > 1e-4) for (let k = 1; k < n; k++) { const j = j0 + k, up = j - 1, amt = Math.min(cy[j] * rise * this.w[j], (CYANO.CAP - cy[up]) * this.w[up]); if (amt > 0) { cy[j] -= amt / this.w[j]; cy[up] += amt / this.w[up]; } }
      // below the mixed layer (a calm spell over the north basin) the diatoms sink a layer a step — the end of a spring bloom
      const kS = clamp(DIATOM.SINK * TS * dt, 0, 0.5);
      for (let k = n - 2; k >= 0; k--) { const j = j0 + k; if (G.zMid[j] < mixM || e.ice[c] > 0.5) continue; const m = di[j] * kS * this.w[j]; di[j] -= m / this.w[j]; di[j + 1] += m / this.w[j + 1]; }
    }
    this.ledger.fixN += fixed;
    this.meanPhyto = litN ? litSum / litN : 0; this.meanDiatom = diaN ? diaSum / diaN : 0; this.meanCyano = cyN ? cySum / cyN : 0;
  }

  // ---------- zooplankton ----------
  // Each kind GROWS on its cell's algae (Holling; copepods also on the weed beds' periphyton), less maintenance and mortality
  // (× Q10), GRAZES the algae (the N+P back at once, part via DOM), dies in anoxic water and in a toxic cyanobacterial scum,
  // swims up out of anoxic water, is kept at a tiny FLOOR in oxic water; shortening days send resting eggs to the bed and
  // lengthening ones hatch them; over a day each column's animals spread through its oxic water where the food is.
  _zooplankton(dt, dd, yf) {
    const P = PLANKTON, e = this.env, G = this.G, T = e.temp, D = this.zooD, Cz = this.zooC, Rz = this.zooR, ph = this.phyto, di = this.diatom, cyf = this.cyano, o2 = this.o2;
    const phos = this.phos, nh4 = this.nh4, dom = this.dom, ex = NUTRIENT.GRAZE_EXCRETE, pU = PHYTO.P_USE, nU = PHYTO.N_USE;
    const b = Math.max(0, this.fishKgHa), sB = b / (b + P.DVM_B50); this._migD = P.DVM_MAX_D * sB; this._migC = P.DVM_MAX_C * sB;
    const costD = P.DVM_COST * this._migD, costC = P.DVM_COST * this._migC;
    const Z = ZOO3, gD0 = P.G_D * dd, gC0 = Z.G_C * dd, lD0 = (P.R_D + P.M_D) * dd, lC0 = (Z.R_C + Z.M_C) * dd, anox = P.ANOX_M * dd;
    const shorten = (((yf - SEASON.SOLSTICE) % 1) + 1) % 1 < 0.5, dorm = shorten && sun(yf).dayFrac < P.DORM_DAY;
    const dmD = Z.DORM_D * dd, dmC = Z.DORM_C * dd, toxAt = CYANO.TOX_THRESH * CYANO.CAP;
    const kD = Math.exp(-CYANO.TOX_ZOO * P.DAPH_TOX * TS * dt), kC = Math.exp(-CYANO.TOX_ZOO * TS * dt), flr = -Math.expm1(-P.FLOOR_RATE * TS * dt);
    const gR0 = P.G_R * dd, lR0 = (P.R_R + P.M_R) * dd, iR = P.DAPH_INTERF * dd, m2R = P.M2_R * dd;
    for (let c = 0; c < G.NC; c++) {
      const j0 = G.cell0[c], n = G.nL[c], rf = this.refAv[c];
      for (let k = 0; k < n; k++) {
        const j = j0 + k, Tj = T[j], qD = qAt(Q.zD, Tj), qC = qAt(Q.zC3, Tj), qL = qAt(Q.zL, Tj), qR = qAt(Q.zR, Tj), qLD = qAt(Q.zLD, Tj), qLC = qAt(Q.zLC, Tj);
        const wD = clamp((Tj - P.DAPH_T[0]) / (P.DAPH_T[1] - P.DAPH_T[0]), 0, 1) * clamp((P.DAPH_HOT[1] - Tj) / (P.DAPH_HOT[1] - P.DAPH_HOT[0]), 0, 1);
        const A = ph[j] + di[j], zd = D[j], zc = Cz[j], zr = Rz[j], lit = P.LIT_FOOD * Math.min(1, this.plantRef[j] / 0.8);   // (periphyton in the weeds)
        const cyn = Math.max(0, 1 - P.DAPH_CYANO * cyf[j] / CYANO.CAP);
        const pd = zd * gD0 * A / (A + P.K_D) * cyn * wD * (1 - costD * rf) * qD, pc = zc * gC0 * (A + lit) / (A + lit + Z.K_C) * (1 - costC * rf) * qC;
        this.zooProd += (pd + pc) * this.w[j];
        let nd = zd + pd - zd * lD0 * qLD, nc = zc + pc - zc * lC0 * qLC;
        let nr = zr + zr * (gR0 * A / (A + P.K_R) * qR - (lR0 + iR * zd + m2R * zr) * qL);
        const bedHere = G.bedA[j] > 0;
        if (dorm && Tj < P.DORM_T) {   // → the egg bank (on this column's bed: its bottom bed cell)
          const ed = zd * dmD, ec = zc * dmC; nd -= ed; nc -= ec;
          const jb = j0 + n - 1, s = this.w[j] / this.a[jb]; this.eggD[jb] += ed * P.EGG_EFF * s; this.eggC[jb] += ec * Z.EGG_EFF_C * s;
        }
        let gr = zd * P.GR_D * qD * TS * dt * A / (A + P.K_D) + zc * P.GR_C * qC * TS * dt * A / (A + Z.K_C) + zr * P.GR_R * qR * TS * dt * A / (A + P.K_R);
        if (gr > 0) { if (gr > A) gr = A; const gp = Math.min(ph[j], gr), gd = gr - gp; ph[j] -= gp; di[j] -= gd; phos[j] += gr * ex * pU; nh4[j] += gr * ex * nU; dom[j] += gr * (1 - ex) * (pU + nU); }
        const ox = o2[j] >= P.O2_MIN;
        if (!ox) { nd -= zd * anox; nc -= zc * anox; nr -= zr * anox; }
        if (cyf[j] > toxAt) { nd *= kD; nc *= kC; nr *= kC; }
        if (ox) { if (nd < P.FLOOR) nd += (P.FLOOR - nd) * flr; if (nc < P.FLOOR) nc += (P.FLOOR - nc) * flr; if (nr < P.FLOOR) nr += (P.FLOOR - nr) * flr; }
        D[j] = nd > 0 ? nd : 0; Cz[j] = nc > 0 ? nc : 0; Rz[j] = nr > 0 ? nr : 0;
        void bedHere;
      }
      // the egg bank: on lengthening days part hatches into oxic bottom water once the bed is warm enough; eggs are slowly lost
      const jb = j0 + n - 1, lossE = 1 - P.EGG_LOSS * dd / 365, hzD = Z.HATCH_D * dd, hzC = Z.HATCH_C * dd;
      for (let k = 0; k < n; k++) { const j = j0 + k; if (G.bedA[j] > 0) { this.eggD[j] *= lossE; this.eggC[j] *= lossE; } }
      if (!shorten && o2[jb] >= P.O2_MIN) {
        for (let k = 0; k < n; k++) {
          const j = j0 + k; if (!(G.bedA[j] > 0)) continue; const Tb = T[j], s = this.a[j] / this.w[j];
          if (Tb >= P.HATCH_T_D) { const h = this.eggD[j] * hzD; this.eggD[j] -= h; D[j] += h * s; }
          if (Tb >= Z.HATCH_T_C) { const h = this.eggC[j] * hzC; this.eggC[j] -= h; Cz[j] += h * s; }
        }
      }
      // THE DAILY ROUND: over a day the animals spread through the column's oxic water where the food is (each oxic cell relaxes
      // toward the column's total shared in proportion to its algae + FOOD0, volume-weighted — conservative)
      let k1 = -1; for (let k = 0; k < n && o2[j0 + k] >= P.O2_MIN; k++) k1 = k;
      if (k1 >= 1) {
        const mx = -Math.expm1(-P.MIX * TS * dt), wq = this._w; let sd = 0, sc = 0, sr = 0, sw = 0;
        for (let k = 0; k <= k1; k++) { const j = j0 + k, w = this.w[j]; sd += D[j] * w; sc += Cz[j] * w; sr += Rz[j] * w; const v = (ph[j] + di[j] + P.FOOD0); wq[k] = v; sw += v * w; }
        const fd = sd / sw, fc = sc / sw, fr = sr / sw;
        for (let k = 0; k <= k1; k++) { const j = j0 + k; D[j] += (fd * wq[k] - D[j]) * mx; Cz[j] += (fc * wq[k] - Cz[j]) * mx; Rz[j] += (fr * wq[k] - Rz[j]) * mx; }
      }
      // out of anoxic water: a share swims up a layer each step
      const av = -Math.expm1(-P.AVOID * TS * dt);
      for (let k = 1; k < n; k++) {
        const j = j0 + k; if (o2[j] >= P.O2_MIN) continue; const u = j - 1, f = this.w[j] / this.w[u];
        const md = D[j] * av, mc = Cz[j] * av, mr = Rz[j] * av; D[j] -= md; D[u] += md * f; Cz[j] -= mc; Cz[u] += mc * f; Rz[j] -= mr; Rz[u] += mr * f;
      }
    }
  }

  // ---------- O₂ demand: the water column's (sinking particles) and the bed's (sediment respiration), both bacterial ----------
  _o2Demand(dt) {
    const G = this.G, T = this.env.temp, o2 = this.o2;
    const ramp = z => ENV.O2_DEMAND_MIN + (1 - ENV.O2_DEMAND_MIN) * clamp(z / ENV.O2_DEMAND_Z, 0, 1);
    const pel = ENV.O2_PELAGIC * TS * dt, sed = ENV.O2_SED * TS * dt, rO = this.rootO2;
    for (let j = 0; j < G.NCELL; j++) {
      const qT = qAt(Q.mic12, T[j]), z = G.zMid[j];
      let d = pel * ramp(z) * qT;
      if (G.bedA[j] > 0) {   // per unit of bed: its share of this cell's water — less what the rosettes' roots put into the sand (plants3 rootO2:
        let b = sed * ramp(z) * qT * this.r[j];   //   by day it pays the bed's demand, the rest oxidising the sand; by night the roots draw on it)
        if (rO && rO[j] !== 0) { b = Math.max(0, b - rO[j] / G.vol[j]); rO[j] = 0; }
        d += b;
      }
      o2[j] = Math.max(0, o2[j] - d);
    }
  }

  // ---------- the microbial loop: bacteria decompose DOM (Q10, O₂-Monod), remineralising N and P, using O₂ ----------
  _microbial(dt) {
    const G = this.G, T = this.env.temp, dom = this.dom, o2 = this.o2, nh4 = this.nh4, phos = this.phos, pF = NUTRIENT.ORGANIC_P;
    let sum = 0, vs = 0;
    for (let j = 0; j < G.NCELL; j++) {
      const m = dom[j];
      if (m > 1e-6) {
        const ox = o2[j] > 0 ? o2[j] : 0;
        let d = MICROBE.BACT * TS * qAt(Q.mic, T[j]) * (ox / (ox + MICROBE.O2_HALF)) * m * dt; if (d > m) d = m;
        dom[j] = m - d; phos[j] += d * pF; nh4[j] += d * (1 - pF); o2[j] = Math.max(0, ox - d * MICROBE.O2_COST);
      }
      sum += dom[j] * this.w[j]; vs += this.w[j];
    }
    this.meanDOM = sum / vs;
  }

  // ---------- the bed's bound-P store (the Mortimer redox switch) ----------
  // Per bed cell, per unit of bed: settling algae and a baseline P rain (debited from the water over it), binding of dissolved P
  // while the bottom is oxic, release of legacy P when it goes anoxic, slow burial (out of the lake, tallied)
  _sedimentP(dt) {
    const ph = this.phyto, phos = this.phos, nh4 = this.nh4, sed = this.sedP, o2 = this.o2, pU = PHYTO.P_USE, nU = PHYTO.N_USE, T = this.env.temp;
    const rel0 = CHEM3.REL_OXIC * TS * dt;
    let buried = 0;
    for (const j of this.bedCells) {
      const r = this.r[j], W = 1 / r, ox = o2[j] > 0 ? o2[j] : 0;
      let room = SED_P.MAX - sed[j];
      if (room > 0) {
        const bio = Math.min(ph[j] * W, SED_P.SETTLE * TS * ph[j] * dt / pU, room / pU);
        ph[j] -= bio * r; sed[j] += bio * pU; nh4[j] += bio * nU * r; room -= bio * pU;
        const rain = Math.min(phos[j] * W, SED_P.SETTLE * SED_P.RAIN_BASE * CHEM3.BED_EXCH * TS * dt, room);
        phos[j] -= rain * r; sed[j] += rain; room -= rain;
      }
      const hold = this.lawn ? 1 - PL3.ISO_RET * this.lawn[j] : 1;   // (under a rosette lawn the oxidised sand holds its P on iron: plants3)
      if (rel0 > 0) { const rel = Math.min(sed[j], rel0 * Math.pow(CHEM3.REL_Q10, (T[j] - 20) / 10) * sed[j]) * hold; sed[j] -= rel; phos[j] += rel * r; }   // (oxic, temperature-driven)
      if (ox < SED_P.O2_THRESH) { const rel = SED_P.RELEASE * TS * sed[j] * (1 - ox / SED_P.O2_THRESH) * dt * hold; sed[j] -= rel; phos[j] += rel * r; }
      else if (room > 0) { const bnd = Math.min(SED_P.BIND * CHEM3.BED_EXCH * TS * phos[j] * dt, room, phos[j] * W); phos[j] -= bnd * r; sed[j] += bnd; }
      const bury = SED_P.BURY * CHEM3.BURY_MUL * TS * sed[j] * dt; sed[j] -= bury; buried += bury * this.a[j];
    }
    this.ledger.buryP += buried;
  }

  // ---------- the bed's organic layer: the dying algae settle into it, bacteria decompose it; benthic algae on a lit bed ----------
  _sedimentOM(dt) {
    const G = this.G, e = this.env, T = e.temp, som = this.sedOM, o2 = this.o2, colD = this.colDecay;
    const yf = e.yearFrac(), L = CHEM3.LEAF_YF, leaf = yf >= L[0] && yf < L[1] ? 1 / (L[1] - L[0]) : 0, al = CHEM3.ALLOCH * A2 * dt / CLOCK3.YEAR_LEN;
    for (let c = 0; c < G.NC; c++) {
      const sub = al * (0.5 + 0.5 * leaf * this.leafW[c]);   // (the catchment's organic matter, per 2-D column of bed)
      const j0 = G.cell0[c], n = G.nL[c], share = colD[c] > 0 && this.colBedA[c] > 0 ? SEDOM.SINK * SEDOM.PP_G * colD[c] * A2 / this.colBedA[c] : 0;
      for (let k = 0; k < n; k++) {
        const j = j0 + k; if (!(G.bedA[j] > 0)) continue;
        const ox = Math.max(0, o2[j]), kk = SEDOM.K20 * TS * qAt(Q.som, T[j]) * (SEDOM.ANOX + (1 - SEDOM.ANOX) * ox / (ox + SEDOM.O2_HALF));
        const zb = Math.min(G.depthMax[c], (k + 1) * G.DZ), peri = SEDOM.PERI_G * TS * this.lightAt(c, zb) * qAt(Q.ph, T[j]) * dt;
        som[j] = som[j] * Math.exp(-kk * dt) + share + peri + sub;
        if (peri > 0) o2[j] += peri * G.bedA[j] / A2 * CHEM3.PERI_O2 / (G.vol[j] * ENV.O2_MGL);   // (their O₂, into the water over the bed)
      }
      colD[c] = 0;
    }
  }
  // ---------- the brook's filter feeders (CHEM3.BROOK_FILTER): the outflow's algae → the brook bed's organic layer ----------
  _brookFilter(dt) {
    const G = this.G, T = this.env.temp, som = this.sedOM, w = this.w, PP = SEDOM.PP_G;
    const flds = [[this.phyto, PHYTO.RECYCLE, PHYTO.P_USE, PHYTO.N_USE], [this.diatom, PHYTO.RECYCLE, PHYTO.P_USE, PHYTO.N_USE], [this.cyano, CYANO.RECYCLE, CYANO.P_USE, CYANO.N_USE]];
    const kF = 1 - Math.exp(-CHEM3.BROOK_FILTER * dt);
    for (const c of this.brookCols) {
      const A = this.colBedA[c]; if (!(A > 0)) continue;
      const j0 = G.cell0[c], n = G.nL[c];
      let room = CHEM3.BROOK_CAP * qAt(Q.ben, T[j0 + n - 1]) * A * dt / DAY3, got = 0;   // (g wet they can take this step)
      for (let k = 0; k < n && room > 0; k++) {
        const j = j0 + k;
        for (const [f, R, pU, nU] of flds) {
          const b = f[j]; if (!(b > 0)) continue;
          const take = Math.min(b * kF, room / (w[j] * PP)), g = take * w[j] * PP; if (!(take > 0)) continue;
          f[j] = b - take; room -= g; got += g;
          this.phos[j] += take * R * pU; this.nh4[j] += take * R * nU; this.dom[j] += take * (1 - R) * (pU + nU);   // (as the algae's decay)
        }
      }
      if (got > 0) { const add = got * A2 / A; for (let k = 0; k < n; k++) if (G.bedA[j0 + k] > 0) som[j0 + k] += add; this.brookCaught += got; }
    }
  }
  // ---------- the bed's worms and scuds: grow on the organic layer, die back into it (more in anoxic water) ----------
  _benthos(dt) {
    const B = BENTHOS, T = this.env.temp, som = this.sedOM, o2 = this.o2, cap0 = B.CAP * A2, bc = this.brookCell;
    for (const j of this.bedCells) {
      const b = this.benth[j], q = qAt(Q.ben, T[j]), s = som[j], cap = bc[j] ? cap0 * CHEM3.BROOK_BENTH : cap0;
      const want = B.G * TS * q * s / (s + B.K_SOM) * b * Math.max(0, 1 - b / cap) * dt, ate = Math.min(s, want / B.YIELD);
      som[j] = s - ate;
      const die = b * (B.M + (o2[j] < B.O2_MIN ? B.ANOX_M : 0)) * TS * q * dt;
      som[j] += die; this.benth[j] = b + ate * B.YIELD - die; this.benthProd += ate * B.YIELD * this.a[j];
    }
  }

  // ---------- the nitrogen cycle: nitrification (oxic, uses O₂) ⇌ denitrification (anoxic, N lost as N₂) ----------
  _nitrogen(dt) {
    const G = this.G, T = this.env.temp, nh4 = this.nh4, no3 = this.no3, o2 = this.o2;
    let lost = 0;
    for (let j = 0; j < G.NCELL; j++) {
      const q = qAt(Q.n, T[j]), oxy = o2[j] > 0 ? o2[j] : 0;
      if (oxy >= NCYCLE.DENITRIF_O2) { const nt = NCYCLE.NITRIF * TS * q * nh4[j] * (oxy / (oxy + NCYCLE.NITRIF_O2_HALF)) * dt; nh4[j] -= nt; no3[j] += nt; o2[j] = Math.max(0, oxy - nt * NCYCLE.NITRIF_O2_COST); }
      else { const dn = NCYCLE.DENITRIF * TS * q * no3[j] * (1 - oxy / NCYCLE.DENITRIF_O2) * dt; no3[j] -= dn; lost += dn * this.w[j]; }
    }
    this.ledger.denitN += lost;
  }

  // ---------- surface re-aeration (faster with wind and rain; sealed under ice) ----------
  // The 2-D surface cell (0.3 m) relaxes at the rate, its second row at AERATE_ROW1 × — the same transfer per unit of
  // surface, spread over the 3-D top layer's thickness
  _aerate(dt) {
    const e = this.env, G = this.G, T = e.temp, o2 = this.o2, U = e.windSpeed, night = e.isNight();
    if (!this._kU) { this._kU = {}; this._kU[UPPER] = Math.log10(GEO.STATS.upper.area_m2 * 100 / 1e6); this._kU[LOWER] = Math.log10(GEO.STATS.lower.area_m2 * 100 / 1e6); }   // (log10 of the real lakes' km²)
    const kU = this._kU;
    for (let c = 0; c < G.NC; c++) {
      const j = G.cell0[c], open = 1 - e.ice[c]; if (open <= 0) continue;
      const lgA = kU[G.body[c]] ?? -1.5;   // (the brook: a stream's surface, ~0.03 km²)
      const k600 = Math.max((2.51 + 1.48 * U + 0.39 * U * lgA) * 0.24, night ? CHEM3.K600_NIGHT : 0);   // m/day
      const t = T[j], Sc = 1568 - 86.04 * t + 2.142 * t * t - 0.0216 * t * t * t, k = k600 * Math.sqrt(600 / Math.max(300, Sc)) / 86400;   // m/s of O₂
      const thick = G.vol[j] / Math.max(1e-6, G.topA[j]);
      o2[j] += (this.sat(T[j]) - o2[j]) * -Math.expm1(-k * open * dt / thick);
    }
  }

  // ---------- the budget's boundary flows: what the through-flow brought in and carried out ----------
  _ledgerFlows() {
    for (const fd of this.tf) {
      const inA = (fd.inAmt || 0) / V2, outA = (fd.outAmt || 0) / V2; fd.inAmt = 0; fd.outAmt = 0;   // (env3 tallies m³ × conc; → 2-D units)
      this.ledger.inP += inA * fd.p; this.ledger.inN += inA * fd.n; this.ledger.outP += outA * fd.p; this.ledger.outN += outA * fd.n;
    }
  }

  // ---------- inventories (2-D units: what the budget audit tracks) ----------
  inventoryP() {
    let s = 0; for (let j = 0; j < this.G.NCELL; j++) s += (this.phos[j] + (this.phyto[j] + this.diatom[j]) * PHYTO.P_USE + this.cyano[j] * CYANO.P_USE + this.dom[j] * NUTRIENT.ORGANIC_P) * this.w[j];
    for (const j of this.bedCells) s += this.sedP[j] * this.a[j];
    if (this.env.plants) s += this.env.plants.inventoryP();
    return s;
  }
  inventoryN() {
    let s = 0; for (let j = 0; j < this.G.NCELL; j++) s += (this.nh4[j] + this.no3[j] + (this.phyto[j] + this.diatom[j]) * PHYTO.N_USE + this.cyano[j] * CYANO.N_USE + this.dom[j] * (1 - NUTRIENT.ORGANIC_P)) * this.w[j];
    if (this.env.plants) s += this.env.plants.inventoryN();
    return s;
  }
  // O₂ in mg/L at a cell
  o2mgl(j) { return this.o2[j] * ENV.O2_MGL; }

  // ============================================================ what the fish take (fish3.js) =========================
  clarity() { return clamp(1 - this.turbidity * TURBIDITY.SENSE, 0.35, 1); }
  // VISUAL FEEDING at depth z in column c: the day's noon light there — a sim day stands for ~12 real days, so feeding follows
  // the day's light, not the hour's — from blind (VIS_I0) to full sight (VIS_I1) on a log scale, × the water's clarity
  zooVis(c, z) {
    const P = PLANKTON, e = this.env, I = e.lightDay * (1 - ICE.LIGHT_CUT * e.ice[c]) * Math.exp(-this.attenuation() * z);
    return I > P.VIS_I0 ? Math.min(1, Math.log(I / P.VIS_I0) / Math.log(P.VIS_I1 / P.VIS_I0)) * this.clarity() : 0;
  }
  // the share of a cell's zooplankton (kind 0 Daphnia, 1 copepods) a visual fish can get: the migrants of a column deep enough
  // to hide in meet fish only at twilight; dense weeds hide some (environment.js zooExposed)
  zooExposed(j, kind, dvm = true) {
    const P = PLANKTON, m = dvm ? (kind ? this._migC : this._migD) : 0;
    return (1 - m * this.refAv[this.G.colOfCell[j]] * (1 - P.TWILIGHT)) * (1 - this.plantRef[j]);
  }
  // the exposed zooplankton (µg dry/L) an adult planktivore rates at cell j — the fish's plankton sense
  zooE(j) {
    const v = this.zv[j]; if (v <= 0) return 0;
    return (this.zooD[j] * this.zooExposed(j, 0) + this.zooC[j] * (1 - ZOO3.COPE_ESCAPE) * this.zooExposed(j, 1)) * v * UGL;
  }
  // … and as a larva rates it (what it can catch: cD Daphnia, cC copepods, cR rotifers and nauplii — no migration: the small
  // prey larvae take stay up in the lit water)
  zooEl(j, cD, cC, cR) { const v = this.zv[j]; return v > 0 ? (this.zooD[j] * cD + this.zooC[j] * cC + this.zooR[j] * cR) * v * UGL : 0; }
  // A FISH OR A SCHOOL FEEDS on the zooplankton of its cell and the layers above and below it (environment.js zooFeed): what it
  // can catch (cD Daphnia, cC copepods, cR rotifers) × the share exposed × sight = the exposed prey, E its density (µg dry/L);
  // intake = want × E/(E + K) — type II (sig: type III, E²/(E² + K²): a fish with other food switches away from scarce
  // zooplankton) — at most CROP of what is exposed, taken from the cells in proportion to what each exposes. Grams (all
  // eaters together, e.g. a school's n fish) of Daphnia, copepods and rotifers → out[0..2]
  zooFeed(j, cD, cC, want, K, out, sig = false, dvm = true, cR = 0) {
    const G = this.G, c = G.colOfCell[j], j0 = G.cell0[c], L = this._zl || (this._zl = new Int32Array(3)); let n = 0;
    for (let q = Math.max(j0, j - 1); q <= Math.min(j0 + G.nL[c] - 1, j + 1); q++) L[n++] = q;
    return this.zooFeedCells(L, n, cD, cC, want, K, out, sig, dvm, cR);
  }
  // … over a list of cells (a fish's foraging footprint: fish.js), each seen by its own light
  zooFeedCells(L, nL, cD, cC, want, K, out, sig = false, dvm = true, cR = 0, vis = -1) {   // (vis ≥ 0: the feeding fish's own sight, else the cells' zv)
    out[0] = out[1] = out[2] = 0; if (!(want > 0) || !nL) return out;
    const P = PLANKTON;
    let sD = 0, sC = 0, sR = 0, sw = 0;
    for (let i = 0; i < nL; i++) {
      const q = L[i], w = this.w[q], v = vis >= 0 ? vis : this.zv[q]; sw += w; if (v <= 0) continue;
      sD += this.zooD[q] * cD * this.zooExposed(q, 0, dvm) * w * v; sC += this.zooC[q] * cC * this.zooExposed(q, 1, dvm) * w * v;
      if (cR > 0) sR += this.zooR[q] * cR * (1 - this.plantRef[q]) * w * v;
    }
    const S = sD + sC + sR; if (!(S > 1e-12)) return out;
    const E = S / sw * UGL, take = Math.min(want * (sig ? E * E / (E * E + K * K) : E / (E + K)), P.CROP * S);   // (E: the mean seen density, µg dry/L)
    const tot = sD + sC + sR, tD = take * sD / tot, tC = take * sC / tot, tR = take - tD - tC;
    const fD = sD > 0 ? tD / sD : 0, fC = sC > 0 ? tC / sC : 0, fR = sR > 0 ? tR / sR : 0;   // (each cell gives this share of its exposed, seen grams)
    for (let i = 0; i < nL; i++) {
      const q = L[i], v = vis >= 0 ? vis : this.zv[q]; if (v <= 0) continue;
      if (fD > 0) this.zooD[q] *= 1 - fD * cD * this.zooExposed(q, 0, dvm) * v;
      if (fC > 0) this.zooC[q] *= 1 - fC * cC * this.zooExposed(q, 1, dvm) * v;
      if (fR > 0) this.zooR[q] *= 1 - fR * cR * (1 - this.plantRef[q]) * v;
    }
    out[0] = tD; out[1] = tC; out[2] = tR;
    return out;
  }
  // the seen, exposed zooplankton density (µg dry/L) over a list of cells — what an adult planktivore rates its footprint at
  zooEcells(L, nL) {
    let s = 0, sw = 0; const esc = 1 - ZOO3.COPE_ESCAPE;
    for (let i = 0; i < nL; i++) { const q = L[i], w = this.w[q]; sw += w; const v = this.zv[q]; if (v > 0) s += (this.zooD[q] * this.zooExposed(q, 0) + this.zooC[q] * esc * this.zooExposed(q, 1)) * v * w; }
    return sw > 0 ? s / sw * UGL : 0;
  }
  // the bed's worms and scuds over a list of bed cells: the reachable density (g/m² above the refuge, area-weighted) and a take
  benthEcells(L, nL) { let s = 0, A = 0; for (let i = 0; i < nL; i++) { const j = L[i], a = this.G.bedA[j]; A += a; s += Math.max(0, this.benth[j] / A2 - BENTHOS.REFUGE) * a; } return A > 0 ? s / A : 0; }
  takeBenthCells(L, nL, want, K) {
    if (!(want > 0) || !nL) return 0;
    let s = 0, A = 0; for (let i = 0; i < nL; i++) { const j = L[i], a = this.G.bedA[j]; A += a; s += Math.max(0, this.benth[j] / A2 - BENTHOS.REFUGE) * a; }
    if (!(s > 0)) return 0;
    const E = s / A, g = Math.min(want * E / (E + K), PLANKTON.CROP * s), f = g / s;
    for (let i = 0; i < nL; i++) { const j = L[i], e = this.benth[j] / A2 - BENTHOS.REFUGE; if (e > 0) this.benth[j] -= f * e * this.G.bedA[j] / this.a[j]; }
    return g;
  }
  // a bottom forager (or a school) takes from the worms and scuds of bed cell jb: want × E/(E + K_FISH), E the density above
  // the REFUGE (g/m²), at most CROP of what is reachable; returns the grams taken
  takeBenth(jb, want, K = BENTHOS.K_FISH) {
    if (!(want > 0) || jb < 0) return 0;
    const E = this.benth[jb] / A2 - BENTHOS.REFUGE; if (!(E > 0)) return 0;
    const g = Math.min(want * E / (E + K), PLANKTON.CROP * E * this.G.bedA[jb]);
    this.benth[jb] -= g / this.a[jb]; return g;
  }
  // a bottom-sifter takes the bed's organic layer (poor food); a dead fish's body joins it
  takeSedOM(jb, want) {
    if (!(want > 0) || jb < 0) return 0;
    const g = Math.min(want, PLANKTON.CROP * this.sedOM[jb] * this.a[jb]); this.sedOM[jb] -= g / this.a[jb]; return g;
  }
  addSedOM(jb, g) { if (jb >= 0 && g > 0) this.sedOM[jb] += g / this.a[jb]; }
}
