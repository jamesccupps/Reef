// littoral3.js — the 3-D lakes' littoral food (pure: no DOM; Node and browser). Stage 7b: the invertebrates that live ON the
// weeds (two sizes: the small — early-instar midges, naidid worms, small crustaceans, food for young fish — and the large —
// late-instar midges, mayfly, caddis and damselfly nymphs, amphipods and isopods), the SNAILS of a soft-water lake, and the
// SURFACE: the insects emerging from the lake and the land's insects falling in from the forested banks. Energy pools outside
// the N/P budget, like the bed's organic layer and its worms and scuds (chem3 sedOM, benth), in g WET per m² of each bed cell
// of the water model (the plants' cells) or, for the surface, per m² of a column's water.
// Research: docs/research_notes/Whole lake 3D fish simulation/littoral_invertebrates.md (§1 the weed fauna per g of plant,
// production, seasons; §2 snails in soft water; §3 young fish diets; §4 emergence; §6 the stems' refuge); emergence and the
// land's insects: docs/research_notes/Maine lake shores and catchment/land_lake_subsidies.md §1, §6. Design:
// docs/HOT_BROOK_3D.md §5 "Design (stage 7b)".
import { clamp } from '../core.js';
import { GEO, LAND } from './geometry.js';
import { BENTHOS, PLANKTON, PREY, seasonalTemp } from '../config.js';
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
};
const FOREST = { evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.5, shrub: 0.5, emergent_wet: 0.5 };

export class Littoral3 {
  constructor(env) {
    this.env = env; const ch = this.chem = env.chem, G = this.G = env.G, P = this.plants = env.plants;
    const cells = this.cells = P.cells, nb = cells.length;
    this.idx = new Int32Array(G.NCELL).fill(-1); for (let i = 0; i < nb; i++) this.idx[cells[i]] = i;
    this.S = new Float32Array(nb); this.L = new Float32Array(nb); this.sn = new Float32Array(nb);   // g wet/m² of bed
    this.K = new Float32Array(nb); this.Ksn = new Float32Array(nb);
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
    this.dd = this._ddFor(env.yearFrac());
    this._capacity();
    for (let i = 0; i < nb; i++) { this.S[i] = 0.6 * LIT3.K_S * this.K[i]; this.L[i] = 0.5 * this.K[i]; this.sn[i] = 0.6 * this.Ksn[i]; }
  }
  // the degree-days (> DD_BASE) since ice-out at year-fraction yf by the calendar (a new lake; a season jump)
  _ddFor(yf) {
    if (yf < 0.1 || yf > 0.9) return 0;
    let s = 0; for (let y = 0.1; y < yf; y += 1 / 365) s += Math.max(0, seasonalTemp(y) - LIT3.DD_BASE);
    return s;
  }
  jump() { this.dd = this._ddFor(this.env.yearFrac()); this._capacity(); }
  // each bed cell's capacities: the weed fauna's and the snails' from the plants' shoots (and the bare lit bed)
  _capacity() {
    const P = this.plants, K = this.K, Ks = this.Ksn;
    for (let i = 0; i < this.cells.length; i++) {
      let k = 0, s = 0;
      for (let f = 0; f < NF3; f++) { const b = P.Bs[f][i]; if (b > 0) { const key = FORMS3[f].key; k += b * LIT3.FORM[key]; s += b * LIT3.SN_FORM[key]; } }
      const lit = P.zb[i] < LIT3.BARE_Z;
      K[i] = LIT3.KAPPA * k + (lit ? LIT3.BARE : 0); Ks[i] = LIT3.SN_KAPPA * s + (lit ? LIT3.SN_BARE : 0);
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
    // THE SURFACE: the emerged fly off (exported), the land's insects fall in from the banks and drown to the bed
    const fall = yf > L3.FALL_YF[0] && yf < L3.FALL_YF[1] ? L3.FALL * L3.FALL_WW * GEO.SCALE * Math.sin(Math.PI * (yf - L3.FALL_YF[0]) / (L3.FALL_YF[1] - L3.FALL_YF[0])) : 0;
    const fly = Math.min(1, L3.FLY * dd), drown = Math.min(1, L3.DROWN * dd);
    for (let c = 0; c < G.NC; c++) {
      surfA[c] -= surfA[c] * fly;
      if (fall > 0 && this.bank[c] > 0) { const g = fall * this.bank[c] * dd * (1 - e.ice[c]); this.surfT[c] += g / G.area[c]; this.fallen += g; }
      const dr = this.surfT[c] * drown; if (dr > 0) { this.surfT[c] -= dr; ch.addSedOM(this._colBed(c), dr * G.area[c]); }
    }
  }
  _colBed(c) { const G = this.G; for (let k = G.nL[c] - 1; k >= 0; k--) if (G.bedA[G.cell0[c] + k] > 0) return G.cell0[c] + k; return -1; }

  // ============================================================ what the fish take (fish3.js) =========================
  // the share of the weed fauna a searching fish can reach in column c (the stems foil it: 1/(1 + (S/S50)³))
  reach(c) { const s = this.plants.stems[c] / LIT3.S50; return 1 / (1 + s * s * s); }
  // E (g wet/m²) of the weeds' large fauna (and snails for a molluscivore) a fish can reach over bed cells L[0..nL)
  weedEcells(L, nL, moll) {
    let s = 0, A = 0; const G = this.G;
    for (let k = 0; k < nL; k++) {
      const j = L[k], a = G.bedA[j]; A += a; const i = this.idx[j]; if (i < 0) continue;
      s += (Math.max(0, this.L[i] - LIT3.REF) * this.reach(G.colOfCell[j]) + (moll ? Math.max(0, this.sn[i] - LIT3.SN_REF) : 0)) * a;
    }
    return A > 0 ? s / A : 0;
  }
  // take up to `want` g from them (in proportion to what each cell offers, at most CROP of it); this.J: the energy (J) taken
  takeWeedCells(L, nL, want, moll) {
    this.J = 0; if (!(want > 0) || !nL) return 0;
    const G = this.G; let s = 0;
    for (let k = 0; k < nL; k++) { const j = L[k], i = this.idx[j]; if (i < 0) continue; s += (Math.max(0, this.L[i] - LIT3.REF) * this.reach(G.colOfCell[j]) + (moll ? Math.max(0, this.sn[i] - LIT3.SN_REF) : 0)) * G.bedA[j]; }
    if (!(s > 0)) return 0;
    const g = Math.min(want, PLANKTON.CROP * s), f = g / s;
    for (let k = 0; k < nL; k++) {
      const j = L[k], i = this.idx[j]; if (i < 0) continue; const a = G.bedA[j];
      const eL = Math.max(0, this.L[i] - LIT3.REF) * this.reach(G.colOfCell[j]), eS = moll ? Math.max(0, this.sn[i] - LIT3.SN_REF) : 0;
      this.L[i] -= f * eL; this.sn[i] -= f * eS; this.J += f * (eL * LIT3.ED_INS + eS * PREY.SNAIL_ED * PREY.SNAIL_DIG) * a;
    }
    return g;
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
    return { S: S / A, L: L / A, sn: sn / A, vegS: Sv / Math.max(1, Av), vegL: Lv / Math.max(1, Av), vegSn: snv / Math.max(1, Av), vegShare: Av / A };
  }
}
