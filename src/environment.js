// environment.js — day/night, seasons, weather, a depth-stratified temperature profile,
// wind-driven surface current, and dissolved-oxygen & nutrient fields. Pure.
import { WORLD, GRID, ENV, NUTRIENT, SED_P, NCYCLE, MICROBE, MACRO, SEASON, THERMAL, WIND, TURBIDITY, FLOW, PHYTO, CYANO, scaleCount, bedY } from './config.js';
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

export class Environment {
  constructor() {
    this.t = 0.30;                 // start mid-morning
    this.weather = 0;              // 0 clear,1 cloudy,2 rain,3 storm
    this.weatherTimer = ENV.WEATHER_DWELL[0];
    this.flash = 0;                // lightning visual (render only)
    this.light = daylight(this.t);
    this.tempC = ENV.TEMP_BASE;    // surface / epilimnion temperature
    this.tempNorm = 0.5;
    this.year = 0;                 // years elapsed (fractional)
    this.strat = 0;                // thermal stratification strength 0..1 (1 = strong summer)
    this.wind = 0; this._windT = 0;// signed surface current (px/s)
    this.turbidity = TURBIDITY.BASE; // water murk 0..1 (algae + sediment)
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
  }

  idx(cx, cy) { return cy * COLS + cx; }
  cellOf(x, y) {
    const cx = clamp((x / CW) | 0, 0, COLS - 1), cy = clamp((y / CH) | 0, 0, ROWS - 1);
    return cy * COLS + cx;
  }
  // effective light attenuation rises with turbidity (murky water = shallower photic zone)
  attenuation() { return ENV.LIGHT_ATTEN * (1 + TURBIDITY.ATTEN * this.turbidity); }
  // light reaching depth y (surface + turbidity attenuation)
  lightAtDepth(y) { return this.light * Math.exp(-this.attenuation() * (y / H)); }
  // visual-range multiplier (turbid water shortens how far fish can see)
  clarity() { return clamp(1 - this.turbidity * TURBIDITY.SENSE, 0.35, 1); }
  // Secchi depth: depth (world px) at which light falls to ~10% of the surface
  secchiDepth() { return clamp(H * Math.LN10 / this.attenuation(), 0, H); }

  oxygenAt(x, y) { return this.o2[this.cellOf(x, y)]; }
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
  meanNh4() { let s = 0; for (let i = 0; i < this.nh4.length; i++) s += this.nh4[i]; return s / this.nh4.length; }
  meanNo3() { let s = 0; for (let i = 0; i < this.no3.length; i++) s += this.no3[i]; return s / this.no3.length; }
  meanDin() { return this.meanNh4() + this.meanNo3(); }   // total dissolved inorganic N (nh4 + no3)
  // fraction of inorganic N held as nitrate (the oxidized, nitrification-product form) — a dashboard diagnostic
  nitrateFrac() { const a = this.meanNh4(), o = this.meanNo3(); return a + o > 1e-6 ? o / (a + o) : 0; }
  meanPhos() { let s = 0; for (let i = 0; i < this.phos.length; i++) s += this.phos[i]; return s / this.phos.length; }
  meanSedP() { let s = 0; for (let i = 0; i < this.sedP.length; i++) s += this.sedP[i]; return s / this.sedP.length; }
  // sediment phosphorus — the Mortimer redox switch / internal loading. Per benthic column, the bound-P store
  // takes in settling organic P, BINDS dissolved P while the bottom is oxic, and RELEASES legacy P when the
  // bottom goes anoxic (reusing the summer dead zone) → a self-reinforcing eutrophication feedback. Pure/det.
  sedimentP(dt) {
    for (let cx = 0; cx < COLS; cx++) {
      const x = (cx + 0.5) * CW, bedRow = clamp((bedY(x) / CH) | 0, 0, ROWS - 1), i = bedRow * COLS + cx;
      const o2here = this.o2[i];
      this.sedP[cx] = Math.min(SED_P.MAX, this.sedP[cx] + SED_P.SETTLE * (this.phyto[i] + 0.05) * dt);   // organic P rains down
      if (o2here < SED_P.O2_THRESH) {                                  // anoxic → release iron-bound P (internal loading)
        const rel = SED_P.RELEASE * this.sedP[cx] * (1 - o2here / SED_P.O2_THRESH) * dt;
        this.sedP[cx] -= rel; this.phos[i] += rel;
      } else {                                                         // oxic → bind dissolved P back into the sediment
        const bnd = SED_P.BIND * this.phos[i] * dt;
        this.phos[i] -= bnd; this.sedP[cx] += bnd;
      }
    }
  }
  // nitrogen cycle: NITRIFICATION (NH₄→NO₃, aerobic, O₂-consuming) ⇌ DENITRIFICATION (NO₃→N₂ gas, anaerobic,
  // a permanent N sink) — the two are redox-separated and MUTUALLY EXCLUSIVE per cell at the anoxic threshold
  // `DENITRIF_O2`, the SAME O₂ cline the sediment-P Mortimer switch uses (one coherent redox boundary at 0.25).
  // Above it (OXIC): nitrification runs (O₂-Monod-scaled) and adds a real O₂ demand to the oxygenated water
  // column — it contributes to the stratifying-summer O₂ decline, as real hypolimnetic nitrification does.
  // Below it (ANOXIC): nitrifiers (obligate aerobes) HALT — so nitrification never draws down the established
  // dead zone's residual O₂ (that floor stays governed by the benthic sediment demand) — and denitrification
  // takes over, removing N for good → P stays the ultimate limiter, and low-N:P conditions (the setup for
  // N-fixing cyanobacteria) emerge. Pure/deterministic (no RNG).
  nitrogenCycle(dt) {
    const nh4 = this.nh4, no3 = this.no3, o2 = this.o2;
    for (let i = 0; i < nh4.length; i++) {
      const oxy = o2[i];
      if (oxy >= NCYCLE.DENITRIF_O2) {
        // OXIC: nitrification (ammonium → nitrate), rate ∝ ammonium × O₂ availability (Monod); it consumes O₂.
        const nitr = NCYCLE.NITRIF * nh4[i] * (oxy / (oxy + NCYCLE.NITRIF_O2_HALF)) * dt;
        nh4[i] -= nitr; no3[i] += nitr; o2[i] = Math.max(0, oxy - nitr * NCYCLE.NITRIF_O2_COST);
      } else {
        // ANOXIC: nitrifiers halt (obligate aerobes); denitrification reduces nitrate to N₂ gas — lost for good.
        no3[i] -= NCYCLE.DENITRIF * no3[i] * (1 - oxy / NCYCLE.DENITRIF_O2) * dt;
      }
      if (nh4[i] < 0) nh4[i] = 0; if (no3[i] < 0) no3[i] = 0;
    }
  }
  // microbial loop: heterotrophic bacteria decompose the dissolved-organic-matter pool (`dom`, fed by settling
  // detritus) at a TEMPERATURE-DEPENDENT (Q10) and O₂-LIMITED (Monod) rate — consuming O₂ (bacterial respiration)
  // and REMINERALIZING the bound N (→ ammonium) + P (→ phosphate), Redfield-split. The nutrient released exactly
  // equals the DOM consumed (mass-conserving). Cold/hypoxic deep water decomposes slowly → DOM accumulates over the
  // stratified summer and pulses at turnover; the O₂ demand concentrates where organic matter settles (the bed),
  // reinforcing the hypolimnetic dead zone. This is the realistic, delayed replacement for instant detritus→nutrient.
  // The Q10 depends only on depth (temperature) → hoisted out of the inner loop. Pure / deterministic (no RNG).
  microbialLoop(dt) {
    const dom = this.dom, o2 = this.o2, nh4 = this.nh4, phos = this.phos, tmp = this._tmp;
    const pFrac = NUTRIENT.ORGANIC_P;
    let sum = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH;
      const q10 = Math.pow(MICROBE.Q10, (this.tempAt(0, y) - MICROBE.REF_TEMP) / 10);  // warm → fast, cold → slow
      const baseRate = MICROBE.BACT * q10 * dt;
      for (let cx = 0; cx < COLS; cx++) {
        const i = cy * COLS + cx, m = dom[i];
        if (m > 1e-6) {
          const o2mon = o2[i] / (o2[i] + MICROBE.O2_HALF);   // aerobic decomposition slows in hypoxia
          let d = baseRate * o2mon * m;
          if (d > m) d = m;
          dom[i] = m - d;
          phos[i] += d * pFrac;                              // remineralize P → phosphate
          nh4[i] += d * (1 - pFrac);                         // remineralize N → ammonium (the reduced form)
          o2[i] = Math.max(0, o2[i] - d * MICROBE.O2_COST);  // bacterial respiration O₂ demand
        }
        sum += dom[i];
      }
    }
    this._meanDOM = sum / dom.length;
    diffuse(dom, tmp, MICROBE.DIFFUSE * dt);
  }
  // cyanobacteria: the N-FIXING producer strain. Growth = light × P-Monod × warmth — deliberately NO N-Monod
  // (it fixes its own N), so it wins exactly when the N cycle has drawn the lake to low-N : high-P. It draws the
  // SAME phosphate as green phyto (the competition), is BUOYANT (floats to a surface scum in calm water; storms
  // mix it down), produces/consumes O₂, shades the water, and LEAKS fixed N to ammonium (a net N source → the
  // self-regulating feedback against denitrification). Runs AFTER the green-phyto loop so green phyto (faster)
  // gets first call on the shared P — when N is high it out-draws cyano; when N is low it stalls and frees P.
  cyanobacteria(dt) {
    const cyn = this.cyano, phos = this.phos, nh4 = this.nh4, o2 = this.o2, tmp = this._tmp;
    let surfSum = 0, surfCount = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const y = (cy + 0.5) * CH, lit = this.lightAtDepth(y), frac = (cy + 0.5) / ROWS;
      const tempFac = clamp(1 - Math.abs(this.tempAt(0, y) - CYANO.TEMP_OPT) / CYANO.TEMP_TOL, 0, 1);   // warm-water bloomer
      for (let cx = 0; cx < COLS; cx++) {
        const i = cy * COLS + cx, cb = cyn[i];
        const pMon = phos[i] / (phos[i] + NUTRIENT.KP);                                                 // P-limited only (N-fixing)
        const cgrow = CYANO.GROW * lit * pMon * tempFac * (1 - cb / CYANO.CAP) * dt;
        const cdecay = CYANO.DECAY * cb * dt;
        cyn[i] = clamp(cb + cgrow - cdecay, 0, CYANO.CAP);
        phos[i] = Math.max(0, phos[i] - cgrow * CYANO.P_USE + cdecay * CYANO.RECYCLE * NUTRIENT.ORGANIC_P); // draws & recycles P
        nh4[i] += cgrow * CYANO.FIX_N;                                                                  // leaks FIXED N (net new N)
        o2[i] += (CYANO.O2_PHOTO * cb * lit - CYANO.O2_RESP * cb) * dt;
        if (frac < 0.12) { surfSum += cb; surfCount++; }   // surface-scum density (the band it floats into)
      }
    }
    this._meanCyano = surfCount ? surfSum / surfCount : 0;
    // buoyancy: in CALM water cyano floats up one row per step (forms the surface scum); storm turbulence suppresses it.
    // The transfer is capped at the receiving cell's headroom so a saturated scum backs up instead of exceeding CAP
    // (mass-conserving — no biomass is lost, it just can't pile past the surface mat's max density).
    const rise = clamp(CYANO.BUOY * (1 - ENV.TURBULENCE[this.weather]) * dt, 0, 0.9);
    if (rise > 1e-4) {
      for (let cx = 0; cx < COLS; cx++)
        for (let cy = 1; cy < ROWS; cy++) { const i = cy * COLS + cx, up = i - COLS, f = Math.min(cyn[i] * rise, CYANO.CAP - cyn[up]); if (f > 0) { cyn[i] -= f; cyn[up] += f; } }
    }
    diffuse(cyn, tmp, CYANO.DIFFUSE * dt);
  }
  phytoAt(x, y) { return this.phyto[this.cellOf(x, y)]; }
  meanPhyto() { return this._meanPhyto; }
  cyanoAt(x, y) { return this.cyano[this.cellOf(x, y)]; }
  meanCyano() { return this._meanCyano; }   // surface-band cyanobacteria (scum) density
  domAt(x, y) { return this.dom[this.cellOf(x, y)]; }
  meanDOM() { return this._meanDOM; }        // mean dissolved-organic-matter (bacterial substrate) density
  // add dissolved organic matter at (x,y): settling detritus dissolves into this pool for bacteria to decompose
  addDOM(x, y, amt) { this.dom[this.cellOf(x, y)] += amt; }
  // zooplankton & mussels graze the phytoplankton field at a point
  grazePhyto(x, y, amt) { const i = this.cellOf(x, y); const g = Math.min(this.phyto[i], amt); this.phyto[i] -= g; return g; }
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
  tempAt(x, y) { return this.tempC - THERMAL.DROP * this.strat * this._stratFrac(y); }
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
    this.year = (world ? world.time : 0) / SEASON.YEAR_LEN;
    const seasonal = SEASON.TEMP_AMP * Math.sin(this.year * TAU);   // +amp summer, −amp winter
    // strong stratification in summer; collapses to 0 in spring & autumn (turnover) and winter (mixed)
    this.strat += (Math.max(0, Math.sin(this.year * TAU)) - this.strat) * clamp(dt * 0.5, 0, 1);
    // wind/storm energy ERODES stratification, but only STRONG wind (rain/storm, above the calm
    // baseline) breaks the thermocline — normal summer breezes don't. A storm can then re-oxygenate the
    // deep via the existing strat-gated vertical O₂ mixing + overturn, without erasing the calm-summer dead zone.
    this.strat = Math.max(0, this.strat - THERMAL.WIND_EROSION * Math.max(0, WIND.WEATHER[this.weather] - 1.0) * dt);

    // --- surface (epilimnion) temperature: seasonal + diurnal + weather, lags slightly ---
    const diurnal = Math.sin((this.t - 0.30) * Math.PI * 2);
    const target = ENV.TEMP_BASE + seasonal + ENV.TEMP_DIURNAL * diurnal + ENV.TEMP_WEATHER[this.weather];
    this.tempC += (target - this.tempC) * clamp(dt * 0.4, 0, 1);
    this.tempNorm = clamp((this.tempC - (ENV.TEMP_BASE - 12)) / 22, 0, 1);

    // --- wind: a slowly reversing surface current, stronger in foul weather ---
    this._windT += dt;
    this.wind = WIND.BASE * Math.sin(this._windT * 0.045) * WIND.WEATHER[this.weather];

    // --- turbidity: murk from suspended algae (green phyto + a heavily-shading cyanobacteria surface scum) + storm sediment ---
    const algae = clamp(this._meanPhyto / PHYTO.CAP + CYANO.TURB * (this._meanCyano / CYANO.CAP), 0, 1);
    const turbTarget = clamp(TURBIDITY.BASE + TURBIDITY.FROM_ALGAE * algae + TURBIDITY.FROM_STORM[this.weather], 0, 1);
    this.turbidity += (turbTarget - this.turbidity) * clamp(dt * TURBIDITY.RELAX, 0, 1);

    // the inflow stream loads P-enriched nutrient into the left littoral (runoff → the eutrophication driver)
    this.addNutrient(12, H * 0.22, FLOW.NUTRIENT * dt, NUTRIENT.INFLOW_P);

    this._updateFields(dt, world);
  }

  _updateFields(dt, world) {
    const o2 = this.o2, tmp = this._tmp, phos = this.phos, nh4 = this.nh4, no3 = this.no3;
    const turb = ENV.TURBULENCE[this.weather];
    const sat = this.saturation();
    const rainBoost = ENV.RAIN[this.weather];

    // phytoplankton field: grow with light × **Liebig-co-limited** nutrient (min of N- and P-Monod),
    // drawing P and N down Redfield-weighted, producing O₂ by day and respiring/decomposing always;
    // decayed biomass returns N+P. The dominant open-water producer — and, when it blooms, the cause
    // of night/decay O₂ crashes. P is scarce, so P loading (the inflow) is what tips it into a bloom.
    const ph = this.phyto;
    let litSum = 0, litCount = 0;
    for (let cy = 0; cy < ROWS; cy++) {
      const frac = (cy + 0.5) / ROWS, lit = this.lightAtDepth((cy + 0.5) * CH);
      for (let cx = 0; cx < COLS; cx++) {
        const i = cy * COLS + cx, b = ph[i];
        const nTot = nh4[i] + no3[i];                                                                 // available inorganic N
        const nLim = Math.min(nTot / (nTot + NUTRIENT.KN), phos[i] / (phos[i] + NUTRIENT.KP));        // Liebig minimum
        const growth = PHYTO.GROW * lit * nLim * (1 - b / PHYTO.CAP) * dt;
        const decay = PHYTO.DECAY * b * dt, recycled = decay * PHYTO.RECYCLE;
        ph[i] = clamp(b + growth - decay, 0, PHYTO.CAP);
        phos[i] = Math.max(0, phos[i] - growth * PHYTO.P_USE + recycled * NUTRIENT.ORGANIC_P);
        // N uptake: draw ammonium first (energetically preferred), then nitrate. Decomposed biomass recycles as ammonium.
        let nNeed = growth * PHYTO.N_USE;
        const upA = Math.min(nh4[i], nNeed); nh4[i] -= upA; nNeed -= upA;
        if (nNeed > 0) { const upO = Math.min(no3[i], nNeed); no3[i] -= upO; }
        nh4[i] += recycled * (1 - NUTRIENT.ORGANIC_P);
        o2[i] += (PHYTO.O2_PHOTO * b * lit - PHYTO.O2_RESP * b) * dt;
        if (frac < 0.45) { litSum += b; litCount++; }   // algae density where it lives (the photic zone)
      }
    }
    this._meanPhyto = litCount ? litSum / litCount : 0;

    // cyanobacteria: the N-fixing strain competes for the (now-reduced) P, floats to a surface scum, leaks fixed N
    this.cyanobacteria(dt);

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

    // benthic / decomposition oxygen demand: deeper water consumes O₂ (sediment respiration +
    // organic decay). With weak vertical mixing this is what drives the hypolimnion hypoxic.
    const sed = ENV.O2_SED * dt;
    for (let cy = 0; cy < ROWS; cy++) {
      const frac = (cy + 0.5) / ROWS;
      if (frac <= THERMAL.EPI_FRAC) continue;
      const demand = sed * (frac - THERMAL.EPI_FRAC) / (1 - THERMAL.EPI_FRAC);
      for (let cx = 0; cx < COLS; cx++) { const i = cy * COLS + cx; o2[i] = Math.max(0, o2[i] - demand); }
    }

    // microbial loop: bacteria decompose DOM (fed by settling detritus) at a Q10 temperature- & O₂-limited rate,
    // consuming O₂ and remineralizing N (→ ammonium) + P (→ phosphate). Runs before sediment-P and the N-cycle so the
    // freed P/N feed them, and before surface re-aeration so the epilimnion can offset its (small) surface O₂ draw.
    this.microbialLoop(dt);

    // sediment-P internal loading (Mortimer redox): the anoxic summer deep RELEASES iron-bound P → blooms
    this.sedimentP(dt);

    // nitrogen cycle: nitrification (NH₄→NO₃, draws O₂ here) + denitrification (NO₃→N₂, permanent N loss in
    // the anoxic deep). Runs before surface re-aeration so aeration can offset the surface nitrification O₂ draw.
    this.nitrogenCycle(dt);

    // surface re-aeration (top rows toward saturation, faster with turbulence + rain)
    const aer = ENV.O2_AERATE * (0.4 + turb) + rainBoost * 0.12;
    for (let cx = 0; cx < COLS; cx++) {
      o2[cx] += (sat - o2[cx]) * clamp(aer * dt, 0, 1);                       // row 0 (surface)
      o2[COLS + cx] += (sat - o2[COLS + cx]) * clamp(aer * 0.4 * dt, 0, 1);   // row 1 (just below)
    }

    // diffuse: nutrient blurs isotropically; O₂'s VERTICAL mixing is throttled below the
    // thermocline when the lake is stratified → the hypolimnion isolates and goes hypoxic in
    // summer, then re-oxygenates when stratification collapses at turnover.
    diffuseO2(o2, tmp, ENV.O2_DIFFUSE * dt, this.strat);
    diffuse(phos, tmp, NUTRIENT.DIFFUSE * dt);
    diffuse(nh4, tmp, NUTRIENT.DIFFUSE * dt);
    diffuse(no3, tmp, NUTRIENT.DIFFUSE * dt);
    diffuse(this.phyto, tmp, PHYTO.DIFFUSE * dt);

    // turnover: when stratification has collapsed, vertical overturn brings oxygen-rich surface
    // water down — relax the hypolimnion toward the epilimnion O₂ at a rate set by (1 − strat).
    const overturn = clamp((1 - this.strat) * 0.25 * dt, 0, 0.5);
    if (overturn > 1e-4) {
      for (let cx = 0; cx < COLS; cx++) {
        const ref = (o2[cx] + o2[COLS + cx]) * 0.5;     // epilimnion reference
        for (let cy = 0; cy < ROWS; cy++) {
          if ((cy + 0.5) / ROWS <= THERMAL.EPI_FRAC) continue;
          const i = cy * COLS + cx; o2[i] += (ref - o2[i]) * overturn;
        }
      }
    }

    // nutrient decay (all pools — slow loss to permanent sediment burial; active N removal is denitrification above)
    const dec = clamp(1 - NUTRIENT.DECAY * dt, 0, 1);
    for (let i = 0; i < phos.length; i++) { phos[i] *= dec; if (phos[i] < 0) phos[i] = 0; nh4[i] *= dec; no3[i] *= dec; }
    for (let i = 0; i < o2.length; i++) o2[i] = clamp(o2[i], 0, 1.2);
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

function diffuse(field, tmp, k) {
  if (k <= 0) return;
  k = Math.min(k, 0.5);
  for (let cy = 0; cy < ROWS; cy++)
    for (let cx = 0; cx < COLS; cx++) {
      const i = cy * COLS + cx;
      let sum = 0, n = 0;
      if (cx > 0) { sum += field[i - 1]; n++; }
      if (cx < COLS - 1) { sum += field[i + 1]; n++; }
      if (cy > 0) { sum += field[i - COLS]; n++; }
      if (cy < ROWS - 1) { sum += field[i + COLS]; n++; }
      tmp[i] = field[i] + (sum / n - field[i]) * k;
    }
  field.set(tmp);
}

// like diffuse(), but each cell's VERTICAL exchange is weighted by a mixing factor that drops
// below the epilimnion as `strat` rises — modelling a thermocline that blocks vertical transport.
function diffuseO2(field, tmp, k, strat) {
  if (k <= 0) { return; }
  k = Math.min(k, 0.5);
  for (let cy = 0; cy < ROWS; cy++) {
    const frac = (cy + 0.5) / ROWS;
    // below the epilimnion, vertical mixing is weak when stratified and vigorous at turnover
    const vmix = frac < THERMAL.EPI_FRAC ? 1 : THERMAL.STRAT_O2_MIX + (THERMAL.TURNOVER_MIX - THERMAL.STRAT_O2_MIX) * (1 - strat);
    for (let cx = 0; cx < COLS; cx++) {
      const i = cy * COLS + cx;
      let acc = 0, w = 0;
      if (cx > 0) { acc += field[i - 1]; w += 1; }
      if (cx < COLS - 1) { acc += field[i + 1]; w += 1; }
      if (cy > 0) { acc += field[i - COLS] * vmix; w += vmix; }
      if (cy < ROWS - 1) { acc += field[i + COLS] * vmix; w += vmix; }
      tmp[i] = field[i] + (acc / w - field[i]) * k;
    }
  }
  field.set(tmp);
}

export { daylight };
