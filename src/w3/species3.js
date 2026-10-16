// THE FISH OF THE REAL HOT BROOK LAKES (docs/FISH_CENSUS.md) — pure, DOM-free. The human (2026-10-16): "this should only
// have the fish that are actually in the lakes". The 3-D lakes hold the eleven species MDIFW records there or the human
// catches there: the seven the 2-D sim shares (species.js — their biology and look, unchanged) and four of the 3-D's own —
// REDBREAST SUNFISH (the human's brook catches), FALLFISH, BANDED KILLIFISH and BLACKNOSE DACE (MDIFW's list). Golden shiner,
// the 2-D sim's minnow, is not recorded in either lake and is left out here (the 2-D sim keeps it).
//
// The new species carry the fields fish3.js reads from a species (the 2-D makeSpecies' and BIO's): their FB4 parameter set
// (a surrogate — none of the four has its own model; docs/research_notes/Hot Brook populations and water/
// fish_numbers_and_new_species.md Q6), length–weight, growth, maturity, fecundity, spawning, diet by size, gape, body depth,
// thermal and O₂ limits. "(prior)" marks a value with no measurement behind it.
import { SP } from '../species.js';
import { prepBio } from '../bioenergetics.js';
import { TIME, ENV } from '../config.js';

const yrs = n => n * TIME.YEAR_LEN;   // (the 2-D year: fish3.js converts by sp.maxAge / Y2 × YEAR)

// FB4 sets (Parameters_official.csv, Deslauriers et al. 2017)
const BLUEGILL = { CEQ: 2, CA: 0.182, CB: -0.274, CQ: 2.3, CTO: 27, CTM: 36, REQ: 2, RA: 0.0154, RB: -0.2, RQ: 2.1, RTO: 36, RTM: 40, ACT: 1,
  SDA: 0.172, EGEQ: 2, FA: 0.158, FB: -0.222, FG: 0.631, EXEQ: 2, UA: 0.0253, UB: 0.58, UG: -0.299, PREDEDEQ: 1, ED: 4186 };
const DACE = { CEQ: 2, CA: 0.36, CB: -0.31, CQ: 2.3, CTO: 26, CTM: 29, REQ: 2, RA: 0.0148, RB: -0.2, RQ: 2.1, RTO: 29, RTM: 32, ACT: 1,
  SDA: 0.15, EGEQ: 1, FA: 0.4, EXEQ: 1, UA: 0.1, PREDEDEQ: 1, ED: 5522 };
const FATHEAD = { CEQ: 2, CA: 0.149, CB: -0.242, CQ: 2.4, CTO: 24, CTM: 30, REQ: 2, RA: 0.0096, RB: -0.041, RQ: 2.6, RTO: 28, RTM: 33, ACT: 1,
  SDA: 0.172, EGEQ: 1, FA: 0.1, EXEQ: 1, UA: 0.1, PREDEDEQ: 1, ED: 4186 };

// the defaults a 2-D species gets from makeSpecies that fish3.js reads
const BASE = { tempTol: 8, o2Crit: ENV.HYPOXIA, capture: 0.3, matingCooldown: yrs(0.5), nestGuard: 0 };

export const NEW3 = {
  // REDBREAST SUNFISH (Lepomis auritus) — native to eastern Maine; a nest-guarding Lepomis of slow river reaches and vegetated
  // margins that grows slowly at the north of its range (New Brunswick: 64, 88, 111, 127, 141 mm at 1+–5+; COSEWIC). The
  // human's brook redbreast run ~18–20 cm ("those are typical, mostly from the brook, some are bigger") — larger than New
  // Brunswick's lake fish: the growth curve is a prior between NB and North Carolina, and the brook's fish should grow there
  // on its own. FB4: bluegill (Kitchell et al. 1974), a congener of the same size and diet
  redbreast: {
    key: 'redbreast', name: 'Redbreast sunfish', tag: '#e0703a', ...BASE,
    diet: { plankton: true, larva: true, insect: true, snail: true },   // cladocerans and copepods young; insects (caddis, mayflies, midges), molluscs; some fish (not modelled)
    tempOpt: 26, tempTol: 8, o2Crit: 0.32, spawnT: [19, 26], nestGuard: yrs(0.005), matingCooldown: yrs(0.1),   // NB: late June–early July as the water nears 20 °C; peaks 16.7–27.8 °C across the range; preferendum (prior, Lepomis-like)
    bio: { ...BLUEGILL, src: 'Kitchell et al. 1974 (FB4 bluegill adult) — redbreast stand-in' },
    bioJuv: { CTO: 31, CTM: 37, RTO: 37, RTM: 41, src: 'Kitchell et al. 1974 (FB4 bluegill juvenile)' },
    lw: { a: 0.0209, b: 3.01 }, vb: { Linf: 24, k: 0.25, t0: -0.2 },   // W–L Alabama (n 3,937; Yoho Lake's 126 mm / 42 g fits); growth (prior): ~6, 10, 13, 16, 17, 19 cm at 1–6
    Lhatch: 0.49, sHatch: 0.5, L0: 5, Lref: 15, Lmat: 10.3, LmatM: 10, matMinAge: yrs(2), maxAge: yrs(8), matureAge: yrs(3), M: 0.6,   // larvae 4.9 mm, 1–2 weeks in the nest; matures at ~23 g (Carlander) ≈ 10 cm — age 3 on NB growth; to age 8 (COSEWIC)
    gut: 0.05, gerMul: 0.5, gsiF: 0.06, gsiM: 0.01,   // (as pumpkinseed: panfish)
    fec: { a: 16.8, b: 1.92 },   // through Florida's 1,396–4,138 eggs at 10–17.5 cm (Bass & Hitt 1974): 20 cm → ~5,300 (NC 963–8,250 at 14–23.5 cm)
    benthL: 1.8, Lsnail: 12,   // young leave the nest for the weedy littoral (no limnetic phase recorded); adults take molluscs (prior size)
    Lzoo: 4, Lpisc: Infinity, gapeR: 0.09, depthR: 0.38, uilt: 34, o2Lethal: 0.8, o2Ice: 0.4, vuln: 0.35,   // UILT and O₂ limits unmeasured: Lepomis-like (prior)
  },
  // FALLFISH (Semotilus corporalis) — the largest native minnow of the east (to 45–54 cm; adults 15–37 cm, 0.04–0.7 kg), of
  // gravel pools and runs and lake margins; males build pyramidal gravel mounds at 14–19 °C (no guarding); partly piscivorous
  // above ~10 cm (Ontario LHD; MassWildlife). The human catches "lots". FB4: no fallfish model — the Phoxinus "dace" set
  // (He 1986; Trudel & Boisclair 1994) for the young, and for adults the northern pikeminnow's consumption allometry (Petersen
  // & Ward 1999 — the only large, partly piscivorous cyprinid in FB4) on the dace set's temperatures and respiration (a stated
  // construction, unvalidated)
  fallfish: {
    key: 'fallfish', name: 'Fallfish', tag: '#c9c2a4', ...BASE,
    diet: { plankton: true, larva: true, insect: true, fish: true, plants: true, cray: 0.1 },   // juveniles midges and zooplankton; adults fish, terrestrial and aquatic insects, crayfish, algae (Massachusetts stomachs)
    tempOpt: 22.3, tempTol: 7, o2Crit: 0.4, spawnT: [15, 20], matingCooldown: yrs(0.5), coldPerf: 0.45, capture: 0.15,   // preferred 22.3 °C (Ontario LHD); spawns from 15 °C (best 17), pausing below it; a cool-water fish (cold floor: prior)
    bio: { ...DACE, CA: 0.278, CB: -0.197, src: 'pikeminnow CA/CB (Petersen & Ward 1999) on the FB4 dace set — fallfish adult stand-in (constructed)' },
    bioJuv: { ...DACE, src: 'He 1986; Trudel & Boisclair 1994 (FB4 dace) — young fallfish stand-in' }, juvW: 15,   // (g ≈ 10 cm: the diet's switch)
    lw: { a: 0.004682, b: 3.304 }, vb: { Linf: 42, k: 0.22, t0: -0.1 },   // Ontario log10 W = −5.6336 + 3.3039·log10 TL(mm) (40 g at 15.5 cm, 680 at 36.5); growth (prior): ~9, 16, 21, 26, 30 cm at 1–5
    Lhatch: 0.68, sHatch: 0.15, L0: 7, Lref: 25, Lmat: 18, LmatM: 15, matMinAge: yrs(2), maxAge: yrs(10), matureAge: yrs(3.5), M: 0.6,   // larvae 6.8 mm; ♂ III+, ♀ IV+ (Massachusetts); 6–10 yr (Ontario)
    gut: 0.05, gerMul: 1.0, gsiF: 0.10, gsiM: 0.03,   // a stomachless cyprinid (gonads: prior)
    fec: { a: 0.12, b: 3.3 },   // F ≈ 159 + 26.4·W (Massachusetts) ≈ 26 eggs/g: 20 cm → ~2,400, 30 cm → ~9,300 (range 2,000–12,321)
    benthL: 2.0, Lzoo: 10, Lpisc: 10, gapeR: 0.10, depthR: 0.21, uilt: 31, o2Lethal: 1.5, o2Ice: 0.8, vuln: 0.7,   // a big terminal mouth; fusiform; UILT and O₂ unmeasured (prior: a cool-water stream cyprinid)
  },
  // BANDED KILLIFISH (Fundulus diaphanus) — a topminnow of shallow, clear, low-current water over sand or mud with plants; in
  // shoals of 25–40 sorted by size; matures at age 1 (≥ 64 mm in Lake Erie, 42 mm in Quebec), lives 3–4 years, spawns
  // repeatedly at 19–23 °C on plants (Potamogeton), inactive below ~12 °C, broad thermal and O₂ tolerance (UILT 34.5 °C;
  // COSEWIC 2014; Phillips et al. 2007). FB4: the fathead minnow (Duffy 1998) — a small, hardy, warm-tolerant forage fish of
// the same size. (The congener's set, California killifish — Madon et al. 2001, CTM 34 °C — was tried first: its respiration,
// with ACT 1.25, outruns its intake at any feeding level below ~75 % of the maximum ration on the lake's 3,300-J/g prey, and
// the lake's killifish starved — 481 of 1,499 in a summer month at 57 % of the ration; it was fit to a salt-marsh fish)
  killifish: {
    key: 'killifish', name: 'Banded killifish', tag: '#a3ad74', ...BASE,
    diet: { plankton: true, larva: true, insect: true },   // cladocerans young; midges and amphipods older; flying insects at the surface
    tempOpt: 21, tempTol: 9, o2Crit: 0.3, spawnT: [19, 26], matingCooldown: yrs(0.04),   // preferred 21.0 °C (Nova Scotia fish; Pennsylvania 28.6); ~3 clutches a season
    bio: { ...FATHEAD, src: 'Duffy 1998 (FB4 fathead minnow) — banded killifish stand-in' },
    lw: { a: 0.01343, b: 2.919 }, vb: { Linf: 10, k: 0.6, t0: -0.15 },   // fall fish ln W = −11.032 + 2.919 ln L(mm) (80 mm → 5.8 g); growth: 0+ 32–50 mm by October, 1+ 52–67, 2+ 63–79, 3+ 93
    Lhatch: 0.6, sHatch: 0.3, L0: 4, Lref: 7, Lmat: 5.5, LmatM: 5, matMinAge: yrs(0.9), maxAge: yrs(4), matureAge: yrs(1), M: 1.35,   // eggs 2 mm on plants, no care (hatch: prior); M = 5.4/4
    gut: 0.05, gerMul: 1.0, gsiF: 0.16, gsiM: 0.03,   // GSI peaks at 15.8 % (Lake Erie)
    fec: { a: 0.58, b: 2.85 },   // per CLUTCH: total ln eggs = −6.00 + 2.85 ln L(mm) (694 at 78 mm) over ~3 clutches (201 yolked at a time)
    Lzoo: 10, Lpisc: Infinity, gapeR: 0.07, depthR: 0.22, uilt: 34.5, o2Lethal: 0.8, o2Ice: 0.5, vuln: 1.0,   // a small upturned mouth; O₂: "broad tolerance" (values prior)
  },
  // BLACKNOSE DACE (Rhinichthys atratulus) — a 6–8-cm riffle minnow of clear, cool, gravelly streams (Ontario LHD): Hot Brook's
  // brook, not the lakes. Matures at age 2, spawns over gravel at 15.5–22 °C, no care, lives 3–4 years; the least
  // heat-tolerant of the four (UILT 28.8–29.9 °C; Terpin et al. 1976). FB4: the Phoxinus "dace" set (He 1986; Trudel &
  // Boisclair 1994), whose CTM 29 °C matches its UILT
  dace: {
    key: 'dace', name: 'Blacknose dace', tag: '#8f8672', ...BASE,
    diet: { larva: true, insect: true, plankton: true },   // midge larvae the only consistent food (Noble 1965); drifting insects
    tempOpt: 21, tempTol: 6, o2Crit: 0.45, spawnT: [19, 23], matingCooldown: yrs(0.5), coldPerf: 0.4,   // preferred 19–25 °C (Ontario LHD); spawns 15.5–22 °C across the range, from ~21 °C in the north (habitat3d_new_species.md); a stream fish active in cold water (floor: prior)
    bio: { ...DACE, src: 'He 1986; Trudel & Boisclair 1994 (FB4 dace)' },
    lw: { a: 0.0091, b: 3.07 }, vb: { Linf: 9, k: 0.55, t0: -0.1 },   // Central Appalachia W = 0.0091·TL^3.07; growth: age 0 2.4–2.7 cm, I ~5, adults 5.6–8.3, max 9.9
    Lhatch: 0.5, sHatch: 0.2, L0: 3.5, Lref: 6.5, Lmat: 5, LmatM: 5, matMinAge: yrs(1.5), maxAge: yrs(4), matureAge: yrs(2), M: 1.4,   // eggs scattered over gravel, no care (hatch: prior)
    gut: 0.05, gerMul: 1.0, gsiF: 0.12, gsiM: 0.03,   // (prior)
    fec: { a: 0.82, b: 3.42 },   // through 166–1,116 eggs (Ontario LHD): 5 cm → ~200, 8 cm → ~1,000
    Lzoo: 3, Lpisc: Infinity, gapeR: 0.06, depthR: 0.2, uilt: 29.3, o2Lethal: 1.5, o2Ice: 1.0, vuln: 1.0,   // a small subterminal mouth; O₂ limits unmeasured (prior: a stream fish)
  },
};
for (const k in NEW3) { const d = NEW3[k]; prepBio(d.bio); if (d.bioJuv) d.bioJuv = prepBio({ ...d.bio, ...d.bioJuv }); }

// the 3-D lakes' species, in the 3-D's order (the shared seven as species.js has them, then the four of the 3-D's own)
export const SP3 = {};
for (const k of Object.keys(SP)) if (k !== 'minnow') SP3[k] = SP[k];
Object.assign(SP3, NEW3);
export const SPECIES3 = Object.keys(SP3);
