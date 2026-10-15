// bioenergetics.js — the Wisconsin fish bioenergetics model, implemented exactly as "Fish Bioenergetics 4.0" (Deslauriers
// et al. 2017, Fisheries 42:586–596; R source github.com/jim-breck/FB4 R/bioenergetics/*.R; equations as in Hanson et
// al. 1997, "Fish Bioenergetics 3.0"). Pure functions of the published per-species parameter sets (species.js `bio`,
// copied from FB4's Parameters_official.csv), so every fish's consumption, metabolism, waste and growth follow measured
// physiology.
//
// The balance, per gram of fish per day:   G = C − (R + SDA + F + U)
//   C    consumption          = Cmax · f(T) · p,   Cmax = CA · W^CB            (g prey / g fish / day)
//   R    respiration          = RA · W^RB · f(T) · ACTIVITY                    (g O₂ / g fish / day) × OXYCAL J/g O₂
//   SDA  specific dynamic action = SDA · (C − F)
//   F, U egestion, excretion  (EGEQ / EXEQ 1–4)
// and the fish's mass changes by G / ED (J per g of fish: PREDEDEQ — constant, two-piece linear or power in W).
//
// Units: W g wet mass, L cm total length, T °C, energy J. Rates are per DAY; world.js converts with BIOE.DAY (one real
// day = TIME.YEAR_LEN / 365 sim-seconds, because the seasonal calendar runs a real year per YEAR_LEN). Pure / no RNG.

export const OXYCAL = 13560;   // J per g O₂ respired (oxycalorific coefficient, Elliott & Davison 1975; FB4)

// ---------- temperature dependence of consumption ----------
// CEQ 1: exponential (Stewart et al. 1983).  CEQ 2: Kitchell et al. (1977) — warm-water, peaks at CTO, 0 at/above CTM.
// CEQ 3: Thornton & Lessem (1978) — cool/cold-water, the product of a rising and a falling logistic.
// CEQ 4: Bevelhimer et al. (1985) — a cubic polynomial in the exponent (northern pike), no hard upper cutoff.
// `hot: { T, ...overrides }`: a set published as two rows by temperature (FB4's smallmouth bass, Whitledge et al. 2003: CQ
// 4.2 at ≤ 26 °C, 1.95 above) — the warm row's curve above T, blended over T ± 0.5 °C so consumption has no step.
function prepC(b) {
  b._hot = b.hot ? { ...b, ...b.hot, hot: undefined, _hot: undefined } : undefined;   // (a set derived by spreading another — a juvenile row — must not inherit its warm row)
  if (b._hot) prepC(b._hot);
  if (b.CEQ === 2) {
    const Z = Math.log(b.CQ) * (b.CTM - b.CTO), Y = Math.log(b.CQ) * (b.CTM - b.CTO + 2);
    b._cX = (Z * Z * Math.pow(1 + Math.sqrt(1 + 40 / Y), 2)) / 400;
  } else if (b.CEQ === 3) {
    b._g1 = (1 / (b.CTO - b.CQ)) * Math.log((0.98 * (1 - b.CK1)) / (b.CK1 * 0.02));
    b._g2 = (1 / (b.CTL - b.CTM)) * Math.log((0.98 * (1 - b.CK4)) / (b.CK4 * 0.02));
  }
}
export function consumptionT(b, T) {
  if (b._hot && T > b.hot.T - 0.5) {
    const w = Math.min(1, (T - b.hot.T + 0.5)), cold = w < 1 ? consumptionT1(b, T) : 0;
    return cold * (1 - w) + consumptionT1(b._hot, T) * w;
  }
  return consumptionT1(b, T);
}
function consumptionT1(b, T) {
  if (b.CEQ === 1) return Math.exp(b.CQ * T);
  if (b.CEQ === 2) {
    if (T >= b.CTM) return 0;
    const V = (b.CTM - T) / (b.CTM - b.CTO);
    return Math.max(0, Math.pow(V, b._cX) * Math.exp(b._cX * (1 - V)));
  }
  if (b.CEQ === 3) {
    const L1 = Math.exp(b._g1 * (T - b.CQ)), KA = (b.CK1 * L1) / (1 + b.CK1 * (L1 - 1));
    const L2 = Math.exp(b._g2 * (b.CTL - T)), KB = (b.CK4 * L2) / (1 + b.CK4 * (L2 - 1));
    return KA * KB;
  }
  return Math.exp(b.CQ * T + b.CK1 * T * T + b.CK4 * T * T * T);   // CEQ 4
}
// maximum consumption (g prey / g fish / day) of a W-gram fish at T °C
export function cmax(b, W, T) { return b.CA * Math.pow(W, b.CB) * consumptionT(b, T); }

// ---------- respiration ----------
// REQ 1 (Stewart et al. 1983): exponential in T with a swimming-speed activity term ACTIVITY = e^(RTO·VEL), VEL (cm/s) =
//   ACT·W^RK4·e^(BACT·T) at T ≤ RTL, RK1·W^RK4·e^(RK5·T) above it.  REQ 2 (Kitchell et al. 1977): peaks at RTO, falls to
//   ~0 at RTM (FB4 returns 1e-6 there — a dead fish; here it is held at its value just below RTM, and the heat-lethality
//   hazard in world.js kills the fish instead), with a constant activity multiplier ACT.
function prepR(b) {
  if (b.REQ === 2) {
    const Z = Math.log(b.RQ) * (b.RTM - b.RTO), Y = Math.log(b.RQ) * (b.RTM - b.RTO + 2);
    b._rX = (Z * Z * Math.pow(1 + Math.sqrt(1 + 40 / Y), 2)) / 400;
  }
}
export function respirationT(b, T) {
  if (b.REQ === 1) return Math.exp(b.RQ * T);
  const Tc = Math.min(T, b.RTM - 0.5);
  const V = (b.RTM - Tc) / (b.RTM - b.RTO);
  return Math.max(1e-6, Math.pow(V, b._rX) * Math.exp(b._rX * (1 - V)));
}
// the published ROUTINE activity multiplier (what the parameter set assumes a free-ranging fish does)
export function routineActivity(b, W, T) {
  if (b.REQ === 2) return b.ACT;
  const VEL = T <= b.RTL ? b.ACT * Math.pow(W, b.RK4) * Math.exp(b.BACT * T) : b.RK1 * Math.pow(W, b.RK4) * Math.exp((b.RK5 || 0) * T);
  return Math.exp(b.RTO * VEL);
}
// standard respiration without the activity multiplier, g O₂ / g / day
export function respStd(b, W, T) { return b.RA * Math.pow(W, b.RB) * respirationT(b, T); }
// FB4's full respiration (routine activity), g O₂ / g / day — for checks against published runs
export function respiration(b, W, T) { return respStd(b, W, T) * routineActivity(b, W, T); }

// ---------- egestion & excretion (fractions) ----------
// EGEQ 1: F = FA·C.  EGEQ 2 (Elliott 1976): F = FA·T^FB·e^(FG·p)·C.  EGEQ 3 (Stewart et al. 1983): PE = FA·T^FB·e^(FG·p),
// F = ((PE − 0.1)/0.9)·C for digestible prey (world.js handles each prey's own indigestible share).  EGEQ 4: FA·T^FB·C.
// EXEQ 1: U = UA·(C − F).  EXEQ 2/3: U = UA·T^UB·e^(UG·p)·(C − F).  EXEQ 4: UA·T^UB·(C − F).
// Writes [egested fraction of C, excreted fraction of (C − F)] into `out` (no allocation in the hot loop) and returns it.
export function wasteFractions(b, T, p, out = [0, 0]) {
  const t = Math.max(T, 0.1);   // T^FB with FB < 0 is unbounded at 0 °C — the FB4 guide clamps T to ≥ 0.1 °C (Kao et al. 2015)
  const eg = b.EGEQ === 1 ? b.FA : b.EGEQ === 4 ? b.FA * Math.pow(t, b.FB) : b.FA * Math.pow(t, b.FB) * Math.exp(b.FG * p);
  out[0] = clamp01(b.EGEQ === 3 ? (eg - 0.1) / 0.9 : eg);
  const ex = b.EXEQ === 1 ? b.UA : b.EXEQ === 4 ? b.UA * Math.pow(t, b.UB) : b.UA * Math.pow(t, b.UB) * Math.exp(b.UG * p);
  out[1] = clamp01(ex);
  return out;
}
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);

// ---------- predator energy density (J/g wet) ----------
// PREDEDEQ 1: constant ED.  2: two line segments in W (Alpha1 + Beta1·W below Cutoff g, Alpha2 + Beta2·W above).
// 3: power function Alpha1·W^Beta1.
export function energyDensity(b, W) {
  if (b.PREDEDEQ === 2) return W < b.Cutoff ? b.Alpha1 + b.Beta1 * W : b.Alpha2 + b.Beta2 * W;
  if (b.PREDEDEQ === 3) return b.Alpha1 * Math.pow(W, b.Beta1);
  return b.ED;
}

// ---------- length–weight (standard weight) ----------
// W = a·L^b (g, cm total length). A fish's CONDITION K = W / Ws(L): ~1 when well fed; it starves below ~0.6.
export const stdWeight = (lw, L) => lw.a * Math.pow(L, lw.b);
export const lengthFor = (lw, W) => Math.pow(W / lw.a, 1 / lw.b);

// precompute the derived constants of a parameter set (in place; idempotent)
export function prepBio(b) { prepC(b); prepR(b); return b; }
