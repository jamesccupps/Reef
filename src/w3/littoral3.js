// littoral3.js — the 3-D lakes' littoral food (pure: no DOM; Node and browser). Stage 7b: the invertebrates that live ON the
// weeds (two sizes: the small — early-instar midges, naidid worms, small crustaceans, food for young fish — and the large —
// late-instar midges, mayfly, caddis and damselfly nymphs, amphipods and isopods), the SNAILS of a soft-water lake, and the
// SURFACE: the insects emerging from the lake and the land's insects falling in from the forested banks; and (stage 7c) the
// CRAYFISH — virile crayfish, adults and the year's young, by the shelter of the bed; and (stage 7d) the FRESHWATER MUSSELS —
// eastern elliptio, filtering the water over the bed. Energy pools outside
// the N/P budget, like the bed's organic layer and its worms and scuds (chem3 sedOM, benth), in g WET per m² of each bed cell
// of the water model (the plants' cells) or, for the surface, per m² of a column's water.
// Research: docs/research_notes/Whole lake 3D fish simulation/littoral_invertebrates.md (§1 the weed fauna per g of plant,
// production, seasons; §2 snails in soft water; §3 young fish diets; §4 emergence; §6 the stems' refuge); emergence and the
// land's insects: docs/research_notes/Maine lake shores and catchment/land_lake_subsidies.md §1, §6. Design:
// docs/HOT_BROOK_3D.md §5 "Design (stage 7b)".
import { clamp } from '../core.js';
import { GEO, LAND } from './geometry.js';
import { BENTHOS, PLANKTON, PREY, PHYTO, CYANO, SEDOM, ENV, seasonalTemp } from '../config.js';
import { DAY3 } from './clock3.js';
import { FORMS3, NF3 } from './plants3.js';

export const LIT3 = {
  // THE WEEDS' INVERTEBRATES — their carrying capacity is the plants they live on: ~5 mg DW of fauna per g DW of plant (3–10;
  // Kasprzak; the macrophytes note) ≈ 30 mg wet, × the growth form's factor (submerged > floating-leaved > emergent; the
  // Chara/Nitella meadows as rich as the canopy; rosettes unmeasured — half). A full pondweed canopy (150 g DW/m²): ~4.5 g
  // wet/m² (0.5–1.5 g DW/m²; Kirby 4,000–17,000 animals/m²), 7–20× the bare bed's plant-type fauna
  KAPPA: 0.03, FORM: { EM: 0.25, FL: 0.5, SC: 1, IS: 0.5, DM: 1 },
  BARE: 0.1, BARE_Z: 3,    // g wet/m² on bare lit bed (< BARE_Z m: midges and mayflies grazing the stones' film)
  R_S: 0.10, R_L: 0.04,    // /day at 20 °C: the small and the large fauna's production (logistic in the capacity; Q10 below)
  K_S: 0.3,                // the small fauna's own capacity, a share of the stand's (they eat the fine film and detritus on the
                           //   leaves; the large graze, shred and prey — and in spring the overwintered large are in the bed)
  MATURE: 0.04,            // /day at 20 °C: the small grow into the large
  EGGS: 0.15,              // g of new small larvae per g of emerging adults (females' eggs, ~30 % of their mass), spread over the beds
  M: 0.01,                 // /day at 20 °C: natural deaths (to the bed's organic layer)
  Q10: 2, T_MIN: 4,        // nothing grows below T_MIN °C (under the ice the stocks wait)
  FLOOR: 0.02,             // share of its capacity a stand never falls below while growing (eggs, drift, re-colonisation)
  // their FOOD: the film on the leaves and the fine detritus — the bed cell's organic layer with its periphyton (chem3 sedOM),
  // at the bed fauna's yield (BENTHOS.YIELD, g of invertebrate per g eaten); at most half of what is there a step
  // EMERGENCE on a degree-day clock from ice-out (> DD_BASE °C, the littoral's mean): the overwintered cohort at ~100–600
  // degree-days (mid-May–June), a second generation at ~1,500–2,200 (August–September); the peak share of the large fauna
  // emerging a day in each window. ~30 % of insect production emerges (Vander Zanden & Gratton 2011)
  DD_BASE: 4, EMERGE: [[100, 600, 0.08], [1500, 2200, 0.01]],   // (the spring hatch the main one: 60–80 % of a year's midges; most
                           //   of the summer generation overwinters — a fifth or so emerges in August–September)
  REF: 0.15,               // g wet/m²: the weed fauna out of every fish's reach (in stems, cases, mines)
  S50: 250,                // stems/m² at which half a searching fish's captures are foiled (small sunfish forage inside beds:
                           //   above the piscivores' 150 — Crowder & Cooper 1982; the research note §6)
  // SNAILS — soft water (calcium ~2–5 mg/L, unmeasured, inferred: Vermont soft lakes at pH ≥ 6 still held snails) caps them:
  // ~20 mg wet per g DW of broad-leaved plant (the floating-leaved and the canopy 1, emergents 0.5, rosettes and meadow 0.3)
  // and a little on bare lit bed — weed beds 0.5–5 g wet/m², bare mud ≤ 0.5. Growth 0.02/day at 20 °C (P/B 2–3 a year),
  // young born from May to July above SN_T °C
  SN_KAPPA: 0.02, SN_FORM: { EM: 0.5, FL: 1, SC: 1, IS: 0.3, DM: 0.3 }, SN_BARE: 0.2,
  SN_R: 0.02, SN_T: 10, SN_YF: [0.2, 0.45], SN_M: 0.003, SN_REF: 0.1,   // (M: most live about a year — Physa 12–13 months)
  SN_W: 0.1,               // g wet a snail with its shell (an ~8-mm Physa, Gyraulus or Amnicola) — for the view: 5–50 a m² in the weeds
  // THE SURFACE — the land's insects fall in from forested banks: ~50 mg DW per m of bank a day at the July–August peak
  // (20–120; Mehner et al. 2005; streams under a canopy 25–80 mg/m²/day), a fraction in spring and autumn; per world metre
  // of bank × GEO.SCALE (the lakes are 1/10: their area per m of bank is) — by the bank's cover (forest 1, shrub 0.5, open 0.2)
  FALL: 0.05, FALL_YF: [0.15, 0.65], FALL_WW: 3.3,   // g DW/m/day; the season (Apr 25 → Oct 25, a sine); wet/dry of beetles, flies
  FLY: 6,                  // /day: emerged adults leave the water within hours (they are exported: the lake loses them)
  DROWN: 1.5,              // /day: the land's insects drown and sink to the bed's organic layer
  SURF_Z: 1.0,             // m: a fish this near the surface feeds on what is there
  K_SURF: 0.02,            // g wet/m² at which a surface feeder gets half its ration there: big, conspicuous items (a 20-mg beetle per
                           //   few m² is found — a fish searching the surface sweeps hundreds of m² an hour)
  // YOUNG FISH take the small fauna from WEED_L and the large from LARGE_L (cm): smallmouth eat copepods, then midge larvae by
  // 1.5–2.5 cm and mainly insects by 2.5–5 cm (Lake Opeongo); perch and pumpkinseed likewise
  WEED_L: 1.2, LARGE_L: 2.5,
  ED_INS: 2700,            // J/g wet: the weed insects (chironomids 2,300–2,750, mayflies 2,700+ — PREY.LARVA_ED)
  // CRAYFISH (stage 7c; research: invertebrates_plankton_plants.md §1, littoral_invertebrates.md §5). Two cohorts per bed cell
  // (g wet/m²): ADULTS (age 1+, CR_WA g each) and the YEAR'S YOUNG with a lake-wide individual mass (released at CR_W0 g — 6 mm
  // carapace — in early July; ~1.4 g, 14 mm, by mid-September; ~5 g, 21 mm, by the next June: W ≈ 0.00052·CL³)
  CR_WA: 12, CR_W0: 0.11,
  CR_GY: 0.047, CR_GA: 0.004,   // /day at 20 °C above CR_T_GROW: the young's growth at release size (slowing as (W/CR_W0)^−¼: 0.11 g in
                                //   July → ~1.4 g mid-September → ~4–5 g the next July); the adults' (moult) growth (P/B ~1/yr with recruitment)
  CR_T_ACT: [5, 12], CR_T_GROW: 10,   // °C: dormant below 5 (burrowed, in deeper water), fully active from 12; no moult or growth ≤ 10
  CR_RELEASE_YF: 0.33,     // early July: the young leave the females (Michigan: "shortly after being shed by the female", July)
  CR_FEC: 0.23,            // g of young released per g of adults: ½ females × ~100 eggs × ½ surviving to release × 0.11 g / 12 g
  CR_MY: 0.01, CR_MY_D: 0.03, CR_MY_D50: 5,     // /day the young's deaths: a base + cannibalism with their density (young/m²): ~85 % die
                                                //   July → mid-September (Michigan 0.60–0.91; 13–14/m² in June, 1.2–1.5 in September)
  CR_MY_OLD: 0.0075,       // /day after September (× their activity: 0.74 of the rest die by the next August)
  CR_MA: 0.0022,           // /day adults' deaths (~0.8/yr: a 3-year life)
  // SHELTER (g wet/m² of adults it holds): the wave-washed shallows (< CR_ROCK_Z m — gravel, cobble, rock: MDIFW "mostly rocky
  // shores"), weed beds (up to CR_WEED at CR_WEED_B g DW/m² of plants), bare mud, the deep basin; whole-lake 5–20 g/m²
  // (Michigan 4.6–21, the shoals and weeds 3–10× the average); adults the shelter can't hold die faster (CR_EVICT)
  CR_ROCK: 25, CR_ROCK_Z: 1.5, CR_WEED: 15, CR_WEED_B: 100, CR_MUD: 2, CR_DEEP: 0.5, CR_DEEP_Z: 4, CR_EVICT: 0.01,
  CR_SNAIL: 0.002, CR_SNAIL_K: 0.5,   // g of snails a g of crayfish eats a day at 20 °C (type II in the snails within reach, g/m²) — they
  CR_SNAIL_REF: 0.5,       //   cut snail beds hard (Lodge et al. 1994), but the share on the upper leaves (this × the snails' capacity) is
                           //   out of their reach: snails persist in native-crayfish lakes
  CR_OUT: [0.3, 0.7],      // the share of the active crayfish out foraging by day, by night (the rest in burrows, under stones)
  CR_S50: 150,             // stems/m² at which the weeds hide half of those out
  CR_WIDTH: 2.2,           // cm: a 12-g crayfish's body width; × (W/12)^⅓ — a fish takes those its gape fits
  // FRESHWATER MUSSELS (stage 7d; eastern elliptio, Maine's commonest — invertebrates_plankton_plants.md §2; the human: "lots
  // of mussels"), mussels/m² per bed cell. Their CAPACITY by the bed: firm margins at MU_Z 15/m² (Maine 0.4–27.6; northeastern
  // lakes 1–25), sheltered coves (the plants' wave shelter ≥ MU_COVE_SHELTER of 8 directions) beds of 40 (30–60; Connecticut,
  // Ontario to 210), the scoured edge under 0.5 m 3, the soft mud past 3 m 2 (0.5–5: elliptio avoids deep semi-liquid silt)
  MU_FIRM: 15, MU_COVE: 40, MU_EDGE: 3, MU_DEEP: 2, MU_Z: [0.5, 3], MU_COVE_SHELTER: 5,
  MU_W: 1.0,               // g dry soft tissue a 70–80-mm adult (Lake Pocotopaug ~1.04 g)
  MU_R: 0.25, MU_M: 0.04,  // /yr: recruitment toward the capacity (× the hosts, in June; per capita × (1 − N/K)) and deaths — they
                           //   live 15–30 years: a long-lived stock that holds near its capacity on modest, sporadic recruitment
  MU_HOST50: 40,           // kg/ha of fish at which the glochidia find half their best share of hosts (yellow perch, white perch,
                           //   pumpkinseed, smallmouth, white sucker — all Hot Brook's; released in June at 15–18 °C)
  MU_YF: [0.27, 0.36],     // June: the glochidia's weeks on the fish (juveniles drop off weeks later — recruitment then)
  MU_ANOX: 0.0015, MU_ANOX_MGL: 1,  // /day deaths in water under 1 mg/L (closed up, anaerobic for weeks)
  MU_CR: 0.8,              // L/h a mussel clears at 20 °C (Q10 2) — lab 0.05–0.19, field 2.6–3.1: the dominant uncertainty
  MU_T: 5,                 // °C: below it they are burrowed (December–March) and filter nothing
  MU_CYANO: 0.5, MU_ROT: 0.2,   // of the cyanobacteria and the rotifers in the water they clear, the share they retain
  MU_P_DISS: 0.5,          // of the filtered algae's P, the share excreted dissolved (the rest to the bed's store as biodeposits)
  MU_ASSIM: 0.3,           // of the filtered organic matter, the share assimilated (the rest to the bed's organic layer)
  MU_O2: 0.15,             // mg O₂ a mussel uses an hour at 20 °C (~0.15 mg/g DW/h; Q10 2; a fifth when burrowed)
  CR_PREF: 5,              // a gram of catchable crayfish counts this many grams of small bed food in a forager's food response: big,
                           //   conspicuous meals (~1 out per 13 m² of bed: a bass meets several an hour and needs one or two a day) —
                           //   at the worms' half-saturation (3 g/m²) the crayfish eaters fed at p 0.2–0.3 and starved twice as often
};
const FOREST = { evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.5, shrub: 0.5, emergent_wet: 0.5 };

export class Littoral3 {
  constructor(env) {
    this.env = env; const ch = this.chem = env.chem, G = this.G = env.G, P = this.plants = env.plants;
    const cells = this.cells = P.cells, nb = cells.length;
    this.idx = new Int32Array(G.NCELL).fill(-1); for (let i = 0; i < nb; i++) this.idx[cells[i]] = i;
    this.S = new Float32Array(nb); this.L = new Float32Array(nb); this.sn = new Float32Array(nb);   // g wet/m² of bed
    this.K = new Float32Array(nb); this.Ksn = new Float32Array(nb);
    this.crA = new Float32Array(nb); this.crY = new Float32Array(nb); this.Kcr = new Float32Array(nb);   // crayfish, g wet/m²; shelter
    this.mu = new Float32Array(nb); this.Kmu = new Float32Array(nb);   // mussels /m²; their capacity
    this.muCleared = 0; this.muWater = 0;   // L cleared since the last read (the gate); the water those cells hold (L)
    this.surfA = new Float32Array(G.NC); this.surfT = new Float32Array(G.NC);                       // g wet/m² of water
    // the forested bank along each column (world m × the bank's cover weight): every water cell's land edges
    this.bank = new Float32Array(G.NC);
    const NX = GEO.NX, NY = GEO.NY;
    for (let i = 0; i < GEO.N; i++) {
      if (GEO.body[i] === LAND) continue;
      const r = Math.floor(i / NX), q = i % NX; let w = 0;
      for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue;
        const k = rr * NX + qq; if (GEO.body[k] !== LAND) continue;
        w += FOREST[GEO.CLASSES[GEO.cover[k]]] ?? 0.2;
      }
      if (!w) continue;
      const [x, y] = GEO.cellCentre(i), c = env.colAt(x, y); if (c >= 0) this.bank[c] += w * GEO.CELL * 0.8;   // (a raster shore's stair-steps overstate its length)
    }
    this._n = 0; this.emerged = 0; this.fallen = 0; this.prod = 0; this.J = 0; this._emStep = 0;
    this.crProd = 0; this.crEaten = 0; this.crG = 0; this.crReleased = 0;
    this.dd = this._ddFor(env.yearFrac());
    this._capacity();
    // the mussels' capacity by the bed (fixed: the substrate and the shelter), the stock at 80 % of it
    for (let i = 0; i < nb; i++) {
      const z = P.zb[i], sh = P.shelter[P.col[i]], L3 = LIT3;
      this.Kmu[i] = z < L3.MU_Z[0] ? L3.MU_EDGE : z > L3.MU_Z[1] ? L3.MU_DEEP : sh >= L3.MU_COVE_SHELTER ? L3.MU_COVE : L3.MU_FIRM;
      this.mu[i] = 0.8 * this.Kmu[i];
    }
    for (let i = 0; i < nb; i++) { this.S[i] = 0.6 * LIT3.K_S * this.K[i]; this.L[i] = 0.5 * this.K[i]; this.sn[i] = 0.6 * this.Ksn[i]; this.crA[i] = 0.6 * this.Kcr[i]; }
    this._crDate(env.yearFrac(), true);
  }
  // the degree-days (> DD_BASE) since ice-out at year-fraction yf by the calendar (a new lake; a season jump)
  _ddFor(yf) {
    if (yf < 0.1 || yf > 0.9) return 0;
    let s = 0; for (let y = 0.1; y < yf; y += 1 / 365) s += Math.max(0, seasonalTemp(y) - LIT3.DD_BASE);
    return s;
  }
  jump() {
    this.dd = this._ddFor(this.env.yearFrac()); this._capacity();
    const was = this.crReleased; this._crDate(this.env.yearFrac(), false);
    if (this.crReleased && !was) for (let i = 0; i < this.cells.length; i++) { const nY = LIT3.CR_FEC * this.crA[i] * (this.wY / LIT3.CR_W0) * this._surv; this.crA[i] += this.crY[i]; this.crY[i] = nY; }   // (a jump across the release)
  }
  // the young crayfish's cohort for a date (a new lake; a season jump): before the July release, last year's young as
  // yearlings; after it, this year's, grown by the calendar and thinned (conserving nothing on a jump but their own pools)
  _crDate(yf, fresh) {
    const L3 = LIT3, rel = yf >= L3.CR_RELEASE_YF && yf < 0.95;
    let w = L3.CR_W0, surv = 1;
    if (rel) { for (let y = L3.CR_RELEASE_YF; y < yf; y += 1 / 365) { const T = seasonalTemp(y); if (T > L3.CR_T_GROW) w *= Math.exp(L3.CR_GY * Math.pow(w / L3.CR_W0, -0.25) * Math.pow(2, (T - 20) / 10)); surv *= Math.exp(-(T > L3.CR_T_ACT[0] ? L3.CR_MY + L3.CR_MY_D * 0.5 : 0.002)); } }
    else { w = 3.5; surv = 1; }
    this.wY = w; this.crReleased = rel ? 1 : 0; this._surv = surv;
    if (fresh) for (let i = 0; i < this.cells.length; i++) this.crY[i] = rel ? L3.CR_FEC * this.crA[i] * (w / L3.CR_W0) * surv : 0.1 * this.crA[i];
  }
  // each bed cell's capacities: the weed fauna's and the snails' from the plants' shoots (and the bare lit bed)
  _capacity() {
    const P = this.plants, K = this.K, Ks = this.Ksn;
    for (let i = 0; i < this.cells.length; i++) {
      let k = 0, s = 0;
      for (let f = 0; f < NF3; f++) { const b = P.Bs[f][i]; if (b > 0) { const key = FORMS3[f].key; k += b * LIT3.FORM[key]; s += b * LIT3.SN_FORM[key]; } }
      const lit = P.zb[i] < LIT3.BARE_Z;
      K[i] = LIT3.KAPPA * k + (lit ? LIT3.BARE : 0); Ks[i] = LIT3.SN_KAPPA * s + (lit ? LIT3.SN_BARE : 0);
      // the crayfish's shelter: rock and gravel in the wave-washed shallows, the weeds' stems and roots, mud, the deep basin
      const z = P.zb[i], L3 = LIT3;
      let tot = 0; for (let f = 0; f < NF3; f++) tot += P.Bs[f][i] + P.Br[f][i];
      this.Kcr[i] = z < L3.CR_ROCK_Z ? L3.CR_ROCK : Math.max(z > L3.CR_DEEP_Z ? L3.CR_DEEP : L3.CR_MUD, L3.CR_WEED * Math.min(1, tot / L3.CR_WEED_B));
    }
  }

  // ============================================================ step ===================================================
  step(dt) { if (++this._n >= 3) { this._grow(dt * this._n); this._n = 0; } }
  _grow(ds) {
    const e = this.env, ch = this.chem, G = this.G, T = e.temp, yf = e.yearFrac(), dd = ds / DAY3, L3 = LIT3;
    this._capacity();
    // the degree-day clock: from ice-out; reset under the late-year ice
    if (e.iceMean > 0.5 && yf > 0.7) this.dd = 0;
    let tS = 0, aS = 0; for (let i = 0; i < this.cells.length; i++) if (this.plants.zb[i] < 2) { const A = G.bedA[this.cells[i]]; tS += T[this.cells[i]] * A; aS += A; }
    const Tlit = aS > 0 ? tS / aS : T[0];
    if (e.iceMean < 0.5) this.dd += Math.max(0, Tlit - L3.DD_BASE) * dd;
    let em = 0; for (const [a, b, r] of L3.EMERGE) if (this.dd > a && this.dd < b) em += r * Math.sin(Math.PI * (this.dd - a) / (b - a));
    // the last step's emergence lays this step's eggs: new small larvae over the beds by their small-fauna capacity
    let kS = 0; for (let i = 0; i < this.cells.length; i++) kS += this.K[i] * G.bedA[this.cells[i]];
    const eggs = kS > 0 ? L3.EGGS * this._emStep / kS : 0; this._emStep = 0;
    const snBorn = yf > L3.SN_YF[0] && yf < L3.SN_YF[1];
    const surfA = this.surfA;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], A = G.bedA[j], Tj = T[j], K = this.K[i], warm = Tj > L3.T_MIN, q = Math.pow(L3.Q10, (Tj - 20) / 10);
      let S = this.S[i], Lg = this.L[i], sn = this.sn[i];
      if (warm && K > 0) {
        const KS = L3.K_S * K; S = Math.max(S, L3.FLOOR * KS) + eggs * K;
        let pS = L3.R_S * q * S * Math.max(0, 1 - S / KS) * dd, pL = L3.R_L * q * Lg * Math.max(0, 1 - Lg / K) * dd;
        const need = (pS + pL) * A / BENTHOS.YIELD, have = 0.5 * ch.sedOM[j] * ch.a[j];
        if (need > have) { const k = have / need; pS *= k; pL *= k; }
        ch.sedOM[j] -= Math.min(need, have) / ch.a[j];
        const mat = Math.min(S, L3.MATURE * q * S * dd);
        S += pS - mat; Lg += pL + mat; this.prod += (pS + pL) * A;
        // emergence: the large fauna's share this window leaves for the surface (and then the lake)
        if (em > 0) { const out = Math.min(Lg, em * Lg * dd); Lg -= out; const c = G.colOfCell[j]; surfA[c] += out * A / G.area[c]; this.emerged += out * A; this._emStep += out * A; }
      }
      // natural deaths (to the bed's organic layer). As the shoots die back the fauna stays, in the bed beneath them, above the
      // shrinking capacity (no production there): the overwintering larvae that emerge next spring
      const die = (S + Lg) * L3.M * (warm ? q : 0.2) * dd; if (die > 0) { const fS = S / Math.max(1e-9, S + Lg); S -= die * fS; Lg -= die * (1 - fS); ch.addSedOM(j, die * A); }
      // snails: born in early summer above SN_T, growing toward their capacity; a few die through the year
      const Ks = this.Ksn[i];
      if (Tj > L3.SN_T && Ks > 0) {   // (grazing the same film: the organic layer's periphyton)
        const r = (snBorn ? L3.SN_R : L3.SN_R * 0.3) * q; let g = r * Math.max(sn, 0.01 * Ks) * Math.max(0, 1 - sn / Ks) * dd;
        const need = g * A / BENTHOS.YIELD, have = 0.5 * ch.sedOM[j] * ch.a[j]; if (need > have) g *= have / need;
        ch.sedOM[j] -= Math.min(need, have) / ch.a[j]; sn += g; this.prod += g * A;
      }
      const snD = sn * L3.SN_M * dd + (sn > Ks && Tj > L3.SN_T ? (sn - Ks) * 0.02 * dd : 0); sn -= snD; ch.addSedOM(j, snD * A);   // (crowding only while warm: in winter they wait in the bed)
      this.S[i] = Math.max(0, S); this.L[i] = Math.max(0, Lg); this.sn[i] = Math.max(0, sn);
    }
    this._crayfish(dd, yf, Tlit);
    this._mussels(dd, yf);
    // THE SURFACE: the emerged fly off (exported), the land's insects fall in from the banks and drown to the bed
    const fall = yf > L3.FALL_YF[0] && yf < L3.FALL_YF[1] ? L3.FALL * L3.FALL_WW * GEO.SCALE * Math.sin(Math.PI * (yf - L3.FALL_YF[0]) / (L3.FALL_YF[1] - L3.FALL_YF[0])) : 0;
    const fly = Math.min(1, L3.FLY * dd), drown = Math.min(1, L3.DROWN * dd);
    for (let c = 0; c < G.NC; c++) {
      surfA[c] -= surfA[c] * fly;
      if (fall > 0 && this.bank[c] > 0) { const g = fall * this.bank[c] * dd * (1 - e.ice[c]); this.surfT[c] += g / G.area[c]; this.fallen += g; }
      const dr = this.surfT[c] * drown; if (dr > 0) { this.surfT[c] -= dr; ch.addSedOM(this._colBed(c), dr * G.area[c]); }
    }
  }
  // CRAYFISH over dd days: the July release (last year's young join the adults), growth above CR_T_GROW on the bed's organic
  // layer and snails (at the bed fauna's yield), the young's density-dependent deaths, the adults' deaths and eviction
  _crayfish(dd, yf, Tlit) {
    const L3 = LIT3, e = this.env, ch = this.chem, G = this.G, T = e.temp;
    if (yf < 0.1) this.crReleased = 0;
    if (!this.crReleased && yf >= L3.CR_RELEASE_YF && yf < 0.6) {
      this.crReleased = 1; this.wY = L3.CR_W0;
      for (let i = 0; i < this.cells.length; i++) { const nY = L3.CR_FEC * this.crA[i]; this.crA[i] += this.crY[i]; this.crY[i] = nY; }
    }
    const qL = Math.pow(2, (Tlit - 20) / 10), gY = L3.CR_GY * Math.pow(this.wY / L3.CR_W0, -0.25);   // (the young's growth slows with size)
    if (Tlit > L3.CR_T_GROW) this.wY *= Math.exp(gY * qL * dd);
    const old = yf > 0.55 || yf < L3.CR_RELEASE_YF;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], A = G.bedA[j], Tj = T[j], q = Math.pow(2, (Tj - 20) / 10), act = clamp((Tj - L3.CR_T_ACT[0]) / (L3.CR_T_ACT[1] - L3.CR_T_ACT[0]), 0, 1);
      let a = this.crA[i], y = this.crY[i]; if (!(a + y > 0)) continue;
      // growth (moults above CR_T_GROW), paid for in snails and then the organic layer
      let g = Tj > L3.CR_T_GROW ? (gY * y + L3.CR_GA * a) * q * dd : 0;
      if (g > 0) {
        const sn = this.sn[i], snR = Math.max(0, sn - L3.CR_SNAIL_REF * this.Ksn[i]), eatSn = Math.min(0.5 * snR, L3.CR_SNAIL * q * act * (a + y) * snR / (snR + L3.CR_SNAIL_K) * dd);
        this.sn[i] = sn - eatSn; let need = g / BENTHOS.YIELD - eatSn;
        if (need > 0) { const have = 0.5 * ch.sedOM[j] * ch.a[j] / A; if (need > have) { g *= (have + eatSn) / (need + eatSn); need = have; } ch.sedOM[j] -= need * A / ch.a[j]; }
        const gy = g * (gY * y) / (gY * y + L3.CR_GA * a + 1e-12); y += gy; a += g - gy; this.crProd += g * A;
      }
      // deaths: the young's by their density (cannibalism), slower after September; the adults', and those the shelter can't hold
      const D = y / this.wY, slow = Math.max(0.2, act);
      const dY = y * (old ? L3.CR_MY_OLD : L3.CR_MY + L3.CR_MY_D * D / (D + L3.CR_MY_D50)) * slow * dd;
      const dA = a * L3.CR_MA * slow * dd + Math.max(0, a - this.Kcr[i]) * L3.CR_EVICT * slow * dd;
      y -= dY; a -= dA; ch.addSedOM(j, (dY + dA) * A);
      this.crA[i] = Math.max(0, a); this.crY[i] = Math.max(0, y);
    }
  }
  // MUSSELS over dd days: filtering the water of the cell they sit in (algae and rotifers) — the algae's N back as ammonium, its
  // P half dissolved and half to the bed's store, the organic matter mostly to the bed's organic layer — their O₂, their slow
  // numbers (recruitment in June by the host fish; deaths; long anoxia)
  _mussels(dd, yf) {
    const L3 = LIT3, e = this.env, ch = this.chem, G = this.G, T = e.temp, hours = dd * 24;
    const hosts = Math.max(0, ch.fishKgHa || 0), hostF = hosts / (hosts + L3.MU_HOST50);
    const june = yf >= L3.MU_YF[0] && yf < L3.MU_YF[1], recr = june ? L3.MU_R / (365 * (L3.MU_YF[1] - L3.MU_YF[0])) : 0;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], N = this.mu[i]; if (!(N > 0)) continue;
      const Tj = T[j], A = G.bedA[j], q = Math.pow(2, (Tj - 20) / 10), open = Tj >= L3.MU_T;
      if (open) {
        const vol = G.vol[j] * 1000, Vc = N * A * L3.MU_CR * q * hours, f = -Math.expm1(-Vc / vol), w = ch.w[j];   // (the share of the water cleared: exact at any step)
        this.muCleared += Vc;
        const rP = f * ch.phyto[j], rD = f * ch.diatom[j], rC = f * L3.MU_CYANO * ch.cyano[j], rR = f * L3.MU_ROT * ch.zooR[j];
        ch.phyto[j] -= rP; ch.diatom[j] -= rD; ch.cyano[j] -= rC; ch.zooR[j] -= rR;
        const uA = (rP + rD) * w, uC = rC * w;   // (algae units × the cell's 2-D cells)
        const Pa = uA * PHYTO.P_USE + uC * CYANO.P_USE, Na = uA * PHYTO.N_USE + uC * CYANO.N_USE;
        ch.phos[j] += Pa * L3.MU_P_DISS / w; ch.sedP[j] += Pa * (1 - L3.MU_P_DISS) / ch.a[j]; ch.nh4[j] += Na / w;
        ch.addSedOM(j, ((uA + uC) * SEDOM.PP_G + rR * w) * (1 - L3.MU_ASSIM));   // (faeces and pseudofaeces)
      }
      // their breath: from the cell's water (a fifth when burrowed and cold)
      const o2g = N * A * L3.MU_O2 * (open ? q : 0.2 * Math.min(1, q)) * hours / 1000;   // g O₂
      ch.o2[j] = Math.max(0, ch.o2[j] - o2g / G.vol[j] / ENV.O2_MGL);
      // numbers: June's recruits by the hosts (toward the capacity), deaths, long anoxia
      const K = this.Kmu[i], anox = ch.o2[j] * ENV.O2_MGL < L3.MU_ANOX_MGL ? L3.MU_ANOX : 0;
      this.mu[i] = Math.max(0, N + (recr * hostF * N * Math.max(0, 1 - N / K) - (L3.MU_M / 365 + anox) * N) * dd);
    }
  }
  // FOR THE VIEW (render3/bed3view.js), per bed cell: the crayfish out on the bed now — adults and the year's young, /m²: those
  // out foraging by day or night as the water lets them, the weeds' stems hiding some, and every adult the shelter can't hold
  // (as crayE) — and the snails (/m², at SN_W each)
  shown(night, out = new Float32Array(this.cells.length * 3)) {
    const L3 = LIT3;
    for (let i = 0; i < this.cells.length; i++) {
      const j = this.cells[i], act = clamp((this.env.temp[j] - L3.CR_T_ACT[0]) / (L3.CR_T_ACT[1] - L3.CR_T_ACT[0]), 0, 1);
      const st = this.plants.stems[this.G.colOfCell[j]] / L3.CR_S50, o = act * L3.CR_OUT[night ? 1 : 0] / (1 + st * st * st);
      const a = this.crA[i], over = Math.max(0, a - this.Kcr[i]);
      out[i * 3] = (over + (a - over) * o) / L3.CR_WA; out[i * 3 + 1] = this.crY[i] * Math.min(1, o * 1.5) / this.wY; out[i * 3 + 2] = this.sn[i] / L3.SN_W;
    }
    return out;
  }
  // the crayfish a fish can take in bed cell index i (g wet/m²): those out (by day or night, as active as the water lets them;
  // the weeds' stems hide some) and every adult the shelter can't hold, of the sizes its gape fits, × its strike success
  crayE(i, gape, s, night) {
    if (!(s > 0) || !(gape > 0)) return 0;
    const L3 = LIT3, j = this.cells[i], Tj = this.env.temp[j], act = clamp((Tj - L3.CR_T_ACT[0]) / (L3.CR_T_ACT[1] - L3.CR_T_ACT[0]), 0, 1);
    if (!(act > 0)) return 0;
    const st = this.plants.stems[this.G.colOfCell[j]] / L3.CR_S50, out = act * L3.CR_OUT[night ? 1 : 0] / (1 + st * st * st);
    let E = 0;
    if (L3.CR_WIDTH <= gape) { const a = this.crA[i], over = Math.max(0, a - this.Kcr[i]); E += over + (a - over) * out; }
    if (L3.CR_WIDTH * Math.cbrt(this.wY / L3.CR_WA) <= gape) E += this.crY[i] * out * 1.5;   // (the young: less shelter of their own)
    return E * s;
  }
  _colBed(c) { const G = this.G; for (let k = G.nL[c] - 1; k >= 0; k--) if (G.bedA[G.cell0[c] + k] > 0) return G.cell0[c] + k; return -1; }

  // ============================================================ what the fish take (fish3.js) =========================
  // the share of the weed fauna a searching fish can reach in column c (the stems foil it: 1/(1 + (S/S50)³))
  reach(c) { const s = this.plants.stems[c] / LIT3.S50; return 1 / (1 + s * s * s); }
  // E (g wet/m²) of the weeds' large fauna (and snails for a molluscivore; crayfish for a crayfish eater on the bed, gape cg and
  // strike success cs — crayE) a fish can reach over bed cells L[0..nL); `ins` 0 leaves out the weeds' insects
  weedEcells(L, nL, moll, cg = 0, cs = 0, ins = 1) {
    let s = 0, A = 0; const G = this.G, night = cs > 0 && this.env.isNight();
    for (let k = 0; k < nL; k++) {
      const j = L[k], a = G.bedA[j]; A += a; const i = this.idx[j]; if (i < 0) continue;
      s += (ins * Math.max(0, this.L[i] - LIT3.REF) * this.reach(G.colOfCell[j]) + (moll ? Math.max(0, this.sn[i] - LIT3.SN_REF) : 0) + (cs > 0 ? LIT3.CR_PREF * this.crayE(i, cg, cs, night) : 0)) * a;
    }
    return A > 0 ? s / A : 0;   // (crayfish weighted by CR_PREF: the food response's grams, not the grams there)
  }
  // take up to `want` g from them (in proportion to what each cell offers, at most CROP of it); this.J: the energy (J) taken;
  // this.crG: the grams of it that were crayfish
  takeWeedCells(L, nL, want, moll, cg = 0, cs = 0, ins = 1) {
    this.J = 0; this.crG = 0; if (!(want > 0) || !nL) return 0;
    const G = this.G, night = cs > 0 && this.env.isNight(), E = this._E || (this._E = []); let s = 0;
    for (let k = 0; k < nL; k++) {
      const j = L[k], i = this.idx[j]; if (i < 0) { E[k * 3] = E[k * 3 + 1] = E[k * 3 + 2] = 0; continue; }
      const eL = ins * Math.max(0, this.L[i] - LIT3.REF) * this.reach(G.colOfCell[j]), eS = moll ? Math.max(0, this.sn[i] - LIT3.SN_REF) : 0, eC = cs > 0 ? this.crayE(i, cg, cs, night) : 0;
      E[k * 3] = eL; E[k * 3 + 1] = eS; E[k * 3 + 2] = eC; s += (eL + eS + LIT3.CR_PREF * eC) * G.bedA[j];
    }
    if (!(s > 0)) return 0;
    // the grams wanted, split over the cells and the kinds by what each offers (crayfish weighted by CR_PREF), each kind taken
    // at most CROP of what is catchable; returns the grams actually taken
    const crop = PLANKTON.CROP, f = Math.min(want, crop * s) / s; let got = 0;
    for (let k = 0; k < nL; k++) {
      const j = L[k], i = this.idx[j]; if (i < 0) continue; const a = G.bedA[j], eL = E[k * 3], eS = E[k * 3 + 1], eC = E[k * 3 + 2];
      this.L[i] -= f * eL; this.sn[i] -= f * eS;
      let c = 0;
      if (eC > 0) {   // (the crayfish taken: from the adults and the young in proportion to what of each was catchable)
        c = Math.min(f * LIT3.CR_PREF, crop) * eC; const cA = this.crA[i], cY = this.crY[i], tot = cA + cY;
        if (tot > 0) { const fa = Math.min(1, c * (cA / tot) / Math.max(1e-12, cA)), fy = Math.min(1, c * (cY / tot) / Math.max(1e-12, cY)); this.crA[i] -= fa * cA; this.crY[i] -= fy * cY; }
        this.crG += c * a;
      }
      got += (f * (eL + eS) + c) * a;
      this.J += (f * (eL * LIT3.ED_INS + eS * PREY.SNAIL_ED * PREY.SNAIL_DIG) + c * PREY.CRAY_ED * PREY.CRAY_DIG) * a;
    }
    this.crEaten += this.crG;
    return got;
  }
  // a school of young of length Lcm in bed cell jb: the small fauna from WEED_L, the large (stem-shielded) from LARGE_L
  weedEyoy(jb, Lcm) {
    const i = jb >= 0 ? this.idx[jb] : -1; if (i < 0 || Lcm < LIT3.WEED_L) return 0;
    return this.S[i] + (Lcm >= LIT3.LARGE_L ? Math.max(0, this.L[i] - LIT3.REF) * this.reach(this.G.colOfCell[jb]) : 0);
  }
  takeYoy(jb, want, Lcm, K) {
    this.J = 0; const E = this.weedEyoy(jb, Lcm); if (!(E > 0) || !(want > 0)) return 0;
    const i = this.idx[jb], a = this.G.bedA[jb], g = Math.min(want * E / (E + K), PLANKTON.CROP * E * a), f = g / (E * a);
    const eL = E - this.S[i]; this.S[i] -= f * this.S[i]; if (eL > 0) this.L[i] -= f * eL;
    this.J = g * LIT3.ED_INS; return g;
  }
  // THE SURFACE over columns C[0..n): what an insect eater near it can get (g wet/m²) and take
  surfEcols(C, n) { let s = 0, A = 0; const G = this.G; for (let k = 0; k < n; k++) { const c = C[k], a = G.area[c]; s += (this.surfA[c] + this.surfT[c]) * a; A += a; } return A > 0 ? s / A : 0; }
  takeSurfCols(C, n, want) {
    if (!(want > 0) || !n) return 0;
    const G = this.G; let s = 0; for (let k = 0; k < n; k++) { const c = C[k]; s += (this.surfA[c] + this.surfT[c]) * G.area[c]; }
    if (!(s > 0)) return 0;
    const g = Math.min(want, PLANKTON.CROP * s), f = g / s;
    for (let k = 0; k < n; k++) { const c = C[k]; this.surfA[c] -= f * this.surfA[c]; this.surfT[c] -= f * this.surfT[c]; }
    return g;
  }
  // lake-wide summaries (g wet/m² of the vegetated or the whole bed) for the gate and the harnesses
  stock() {
    const G = this.G; let A = 0, S = 0, L = 0, sn = 0, Av = 0, Lv = 0, Sv = 0, snv = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const a = G.bedA[this.cells[i]]; A += a; S += this.S[i] * a; L += this.L[i] * a; sn += this.sn[i] * a;
      let b = 0; for (let f = 0; f < NF3; f++) b += this.plants.Bs[f][i] + this.plants.Br[f][i];
      if (b > 30) { Av += a; Sv += this.S[i] * a; Lv += this.L[i] * a; snv += this.sn[i] * a; }   // (the weed beds: shoots + storage)
    }
    let cA = 0, cY = 0; for (let i = 0; i < this.cells.length; i++) { const a = G.bedA[this.cells[i]]; cA += this.crA[i] * a; cY += this.crY[i] * a; }
    return { S: S / A, L: L / A, sn: sn / A, vegS: Sv / Math.max(1, Av), vegL: Lv / Math.max(1, Av), vegSn: snv / Math.max(1, Av), vegShare: Av / A,
      crA: cA / A, crY: cY / A, crAn: cA / A / LIT3.CR_WA, crYn: cY / A / this.wY, wY: this.wY, mu: this.mu.reduce((s, v, i) => s + v * G.bedA[this.cells[i]], 0) / A };
  }
}
