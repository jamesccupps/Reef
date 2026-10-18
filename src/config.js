// config.js — all tunable constants for the world & environment (no species here).
//
// SCALING MODEL (Phase 0): the world is now much larger than the screen and is
// explored through a camera. Every population/resource number below is a *density*
// expressed for a reference 760×460 pond; the sim multiplies them by WORLD.AREA_SCALE
// so a bigger lake is automatically more populated at the same per-area balance.
// To grow (or shrink) the whole lake, change only WORLD.W / WORLD.H.

import { HOTBROOK } from './hotbrook_profile.js';   // the real Hot Brook cross-section (generated data)

const REF_W = 760, REF_H = 460;            // the reference pond all densities are tuned for
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = s => { s = clamp(s, 0, 1); return s * s * (3 - 2 * s); };

export const WORLD = {
  // THE REAL HOT BROOK LAKES (2026-10-15): the aquatic world spans the water from Upper Hot Brook Lake's south shore to Lower
  // Hot Brook Lake's north shore (LANDSCAPE: Upper → the connecting brook → Lower), ending where the water is SHORE_D deep
  // as before; the banks above the water lie just outside it (x < 0, x > W). H = the deepest water (Upper's north basin,
  // 18 ft) plus a bed margin. Depths are true; the lakes are compressed ~90× along the slice (docs/HOT_BROOK_SIM.md)
  get W() { return LANDSCAPE.W_PX; },
  get H() { return LANDSCAPE.H_PX; },
  REF_W, REF_H,
  get FLOOR() { return LANDSCAPE.MAX_D * this.PX_PER_M; },  // deepest point of the lake bed
  // DEPTH_REF: the column the "fraction of the column" parameters were calibrated on (the old 14.6-m lake, 1152 px). Light
  // attenuation, crayfish/snail depth limits, the depth sensors, wind and outflow layers keep their ABSOLUTE depths by
  // reading their fractions against this, not against the (now 5.8-m) world height
  DEPTH_REF: 1152,
  // habitat size: the WATER cross-section (∫ bed depth dx) relative to the single deep lake all densities were tuned on
  // (1,499,639 px² at AREA_SCALE 6.7486 — 2048×1152 against the 760×460 reference pond) — a shallower or wider landscape
  // carries proportionally more or fewer organisms
  get AREA_SCALE() { return 6.7486 * wetArea() / 1499639; },
  get GLOBAL_MAX() { return Math.round(150 * this.AREA_SCALE); }, // hard cap on total agents
  // REAL SCALE: the 2-D world is a vertical slice drawn at true size (79 px per metre) standing for SLICE_M2 of water
  // surface — the third dimension is SLICE_M2 / width (~27 m, the same for every column: 700 m² per 2048 px). A field cell
  // is then a ~0.3 × 0.3 × 27 m box of CELL_L litres (densities in µg/L, fish in kg/ha)
  PX_PER_M: 79,
  get SLICE_M2() { return 700 * this.W / 2048; },
  get CELL_L() { return (this.W / GRID.FIELD_COLS / this.PX_PER_M) * (this.H / GRID.FIELD_ROWS / this.PX_PER_M) * this.SLICE_M2 / (this.W / this.PX_PER_M) * 1000; },
};

// scale a reference-pond count to the current world area (never below 1)
export const scaleCount = n => Math.max(1, Math.round(n * WORLD.AREA_SCALE));

// ---------- time: one master calendar (the single source of truth for all timescales) ----------
// REALISTIC RATIOS, WATCHABLE SCALE (the chosen design). The day:season:year and maturity:lifespan ratios
// are realistic; the absolute scale is compressed so a year is watchable AND the neuroevolution still turns over.
//   • A YEAR = 12 MONTHS = 4 SEASONS (the calendar ratios are exact — see Environment.monthIndex/seasonName).
//   • The day/night cycle is a DECOUPLED cosmetic/diel clock (ambiance + diel behaviour); it is NOT counted as a
//     calendar "day" (a true 1:365 day:year would force either a strobing day or a multi-hour year). At these
//     numbers the sun cycles several times per displayed month — read it as a sped-up lake, not a literal day count.
//   • Fish ages (species.js matureAge/maxAge) are set to realistic RELATIVE ratios — a carp lives ~10× a minnow,
//     each matures at ~⅓ of its life, the long-lived species persist across multiple seasons — but at an absolute
//     scale where fast species still turn over generations watchably (true multi-decade lifespans would freeze
//     evolution). See species.js for the per-species year-equivalents.
export const TIME = {
  DAY_LEN: 60,     // sim-seconds per cosmetic day/night cycle (diel light + behaviour; decoupled from the calendar)
  YEAR_LEN: 1800,  // sim-seconds per year (= 30 min) → MONTH 150 s, SEASON 450 s (7.5 min); ~30 day/nights per year
  // (species life histories are written in years — species.js yr(); the old LIFE_SCALE seconds multiplier is retired)
  // derived (for reference; computed live from the two knobs above):
  get MONTH_LEN() { return this.YEAR_LEN / 12; },
  get SEASON_LEN() { return this.YEAR_LEN / 4; },
};

// ---------- seasonal spawning (temperature-triggered, spring/summer only) ----------
// Real temperate fish spawn when the shallows warm into their species' window (SP.spawnT, °C) — pike just after
// ice-out, perch/bass/carp in spring, sunfish and minnows repeatedly through summer — and not at all outside it (no
// off-season breeding, no breeding on the autumn cooling path, none under ice). world.js computes the factor per step.
export const SPAWN = {
  EDGE: 1.5,        // °C soft edge on each side of a species' spawning window
  SEASON_END: 0.5,  // year-fraction (Sept 1) after which nothing spawns (the autumn cooling path)
  MATE_REACH: 2.5,  // in season the mate-search radius grows to ×(1 + this): spawners aggregate and court over a wider area
  // READINESS (world.js breedReady): mature, gonads ripe and in fair condition. A spawning's eggs (species fec × her
  // ovaries' ripeness) × egg survival to swim-up (sHatch) become fry schools (FRY)
  GON_READY: 0.8,   // gonads at ≥ this share of the species' ripe GSI
  K_READY: 0.8,     // condition K at least this (a fish that has lost > ~20 % of its mass skips spawning)
  // spawning AGGREGATION (species with innate.spawnGround): in season, breeding-ready adults migrate to the littoral
  // spawning ground on their side of the lake so a sparse population can find mates (world.js innate block)
  MIG_FORAGE_D: 60,  // px: a ripe in-season fish farther than this from its spawning ground migrates instead of foraging
  AGG_SEASON: 0.5,   // the species' seasonal factor must exceed this (≈ the central part of its spawning season)
  // (and the fish must be breedReady)
  GROUND_X: 0.09,    // spawning-ground centre as a fraction of lake width from each shore (mid-littoral shelf)
  NEST_D: 2.5,       // m: a nest (or egg mass) goes no deeper than this — moved shoreward from the pair to water this shallow
                     //   (smallmouth nest at 1.2–3 m, pumpkinseed under 1 m, perch strands at 1.0–3.7 m — Maine report)
  // SPARSE SPAWNERS: when a species is this rare in the lake, a ready spawner homes in on the nearest ready mate within CUE_R
  // (chemical / sound cues — how a thin population still finds mates); a common one just meets mates nearby
  RARE: 12,
  CUE_R: 700,        // px
};

// ---------- feeding handling time (dt-independent intake of discrete food items) ----------
// A fish used to take ONE item per food type per STEP, so its max intake per second doubled at the browser's 1/60 step
// vs the headless 1/30. Now it gets one item per food type per HANDLE seconds (a handling time; the fractional remainder
// carries over), so intake per second is the same at any fixed step. HANDLE = 1/60 reproduces the browser exactly.
export const FEED = {
  HANDLE: 1 / 60,   // s per discrete item (zooplankton, insect, larva, detritus, snail, crayfish) per food type
  // (satiation is the gut — see BIOE — and a piscivore attacks only a fish that fits the room left in it)
  MISS_CD: 0.1,     // s a piscivore recovers after a missed strike before it can strike again (species.js `capture` = success)
  HUNT_R: 4,        // a piscivore's hunting arena: this × its strike reach (eatRadius) — ~ one body length (takePrey)
  ATTACK: 6,        // strikes per s at a fish in the arena (× closeness): a behavioural second is ~5 h of hunting (takePrey)
  SIZE_SEL: 2,      // the size refuge: a strike's success × (1 − prey depth / gape)^SIZE_SEL (big prey are seldom caught)
  PREY_MIN: 0.07,   // a piscivore ignores fish shorter than this fraction of its own length (not worth the chase). Real
                    //   piscivores mostly eat prey well below their gape: a 65-cm pike's MEDIAN prey is ~7 cm (Gaeta et al.
                    //   2018: 5.05·TL^0.413 mm), so big pike do eat minnow-sized fish; larvae are left to the small fish
  RESIDE: 0.3,      // a forager feeding in a patch slows to this × its thrust (stays and picks — patch residence) …
  RESIDE_T: 1.0,    // … while its last good meal was under this many s ago and the food it senses is within PREY.PATCH_R
  POOR_GUT: 0.15,   // poor food (detritus, algae, plants) only tops a hungry fish's gut up to this share of its capacity
  SCHOOL_MIN: 0.035, // … but a dense school of young fish is worth fish half that size (a feeding bout takes many: bass
                    //   20–35 cm feed heavily on 2–4-cm young-of-year sunfish and perch)
};

// ---------- BIOENERGETICS (world.js step; equations in bioenergetics.js, per-species parameters in species.js) ----------
// Every fish runs the Wisconsin bioenergetics model ("Fish Bioenergetics 4.0", Deslauriers et al. 2017) on its real mass:
// consumption up to the published Cmax(W, T), respiration, SDA, egestion and excretion in joules, growth in grams.
export const BIOE = {
  get DAY() { return TIME.YEAR_LEN / 365; },   // sim-seconds per real day: the seasonal calendar runs a real year per YEAR_LEN
  K_STARVE: 0.6,    // condition K at which the reserve (the brain's "energy" sense, the UI bar) reads 0; it reads 1 at K = 1
  K_START: [0.92, 1.0],   // condition range of founders and immigrants
  // STARVATION: daily survival is logistic in condition K — 50 % per day at K_S50, 99 % at K_S99. Fish die after losing
  // roughly 35–45 % of their mass (starvation-endurance studies; the basis of size-selective overwinter mortality, Shuter
  // & Post 1990). K is W / the standard weight (the 75th-percentile weight-at-length, so populations average ~0.85–1.0
  // and a lean fish at 0.8 is thin, not dying). Not computed above K_HAZARD (negligible there).
  K_S50: 0.55, K_S99: 0.68, K_HAZARD: 0.78,
  // the energy density's slope with condition below the standard weight (bioenergetics.js energyOf): adults lose fat first
  // (~7–9 kJ/g of winter loss), the year's young leaner tissue (~5–6 kJ/g) — docs/research_notes/Predator winter energetics
  ED_K: 0.8, ED_K_JUV: 0.3,
  // METABOLIC DEPRESSION under food deprivation: below condition K_DEPRESS respiration falls, linearly to STARVE_DEPRESS
  // less at K_S50 (food-deprived fish lower their standard metabolism 10–40 %: Méndez & Wieser 1993; Mehner & Wieser 1994)
  K_DEPRESS: 0.9, STARVE_DEPRESS: 0.3,
  get STARVE_B() { return Math.log(99) / (this.K_S99 - this.K_S50); },
  get STARVE_A() { return -this.STARVE_B * this.K_S50; },
  // SWIMMING COST: respiration × e^(SWIM·(u − u_routine)), u = the ~1-day mean speed / top cruising speed (never below
  // routine). At the critical swimming speed active metabolism is ~5–10× STANDARD (Brett 1964) — ~3–5× the routine rate
  // FB4's respiration already describes — so from a routine pace of u ≈ 0.3 to u = 1: e^(2.0·0.7) ≈ 4×
  SWIM: 2.0,
  // HEAT: at its upper incipient lethal temperature (UILT — the temperature half of a population survives ~10,000 min,
  // Fry 1947) half die within UILT_DAYS, ×e faster per HEAT_STEEP °C hotter (resistance time falls log-linearly with T)
  UILT_DAYS: 7, HEAT_STEEP: 0.7,
  UILT_GENE: 6,     // °C shift of the UILT per unit of the tolerance gene above 1 (±~2 °C across the gene's range)
  // HYPOXIA: below its acute lethal DO (species.js BIO o2Lethal, at 25 °C) half die within HYPOXIA_DAYS (published lethal levels
  // are the lowest DO survived in 1–4-day tests), ×e faster per 1/HYPOXIA_STEEP of the way to anoxia
  HYPOXIA_DAYS: 2, HYPOXIA_STEEP: 1.5,
  O2_LETHAL_T: 0.055,
  EXPOSE_TAU: 0.5,      // s (~2.4 h of physiology): the time constant of the O₂/temperature exposure that heat and hypoxia act on   // the lethal DO rises ~5.5 % per °C (bluegill 0.75→1.23 mg/L 25→35 °C; trout 1.3→2.4 mg/L 10→20 °C)
  // GASTRIC EVACUATION per day (He & Wurtsbaugh 1993, 121 rates / 22 species: 0.049·e^(0.072·T) per hour → ×24), × each
  // species' gerMul (pike ~0.25, bass ~0.4, sunfish ~0.5 of the general rate — big meals of big prey digest slowly); capped
  // by Cmax (world.js)
  GER: 1.176, GER_T: 0.072,
  // the SIZE gene sets the maturation length: Lmat × gene^LMAT_GENE
  LMAT_GENE: 1.0,
  // MATURATION REACTION NORM (2026-10-15): the length a fish matures at falls with its age past sp.matMinAge — PMRN_SLOPE of
  // Lmat a year, to at most PMRN_FLOOR × Lmat — so a slow-growing (stunted, crowded) fish matures older AND smaller, a fast
  // grower younger and larger: pumpkinseed in winterkill ponds mature 1–2 years earlier and >20 mm smaller (Fox & Keast
  // 1991); stunted Nova Scotia perch at age 2 near 9.5 cm; faster-growing perch stocks younger but larger (Feiner et al. 2017)
  PMRN_SLOPE: 0.12, PMRN_FLOOR: 0.7,
  // the share of each species' published natural mortality M (species.js BIO) charged as the hazard of causes the lake
  // doesn't simulate — disease, parasites, birds and mammals besides the loon, angling. The rest of M is the lake's own
  // predation and starvation, which emerge.
  M_OTHER: 0.5,
  // GONADS: a mature fish puts this share of its surplus into its gonads until they reach the ripe GSI; below K_RESORB a
  // starving fish resorbs them (atresia) before burning its body
  REPRO_ALLOC: 0.5, K_RESORB: 0.75,
};

// ---------- YOUNG-OF-YEAR: schools of young fish (world.js _stepFry) ----------
// A spawning's eggs that survive to swim-up (species.js sHatch) become SCHOOLS of young fish — real fish, simulated as
// SUPER-INDIVIDUALS (Scheffer et al. 1995: one record carries n identical fish) so a lake's huge annual crop of young costs
// no agents. Each school's fish run the same bioenergetics (FB4; the juvenile set where one exists) on what they find —
// zooplankton first, then (bigger) the bottom's insect larvae and detritus as their species does, other young fish for the
// young piscivores — die naturally at a size-dependent rate, starve, cook or suffocate like the agents, and are FOOD for
// everything whose mouth they fit. Through their first summer, autumn and winter they are the lake's main forage: in real
// lakes young-of-year fish are most of what bass, pike and perch eat. Survivors RECRUIT as followed individuals (agents)
// when they reach their species' recruit length (L0 — fast growers in their first summer) or in the spring after their
// first winter, as yearlings: one agent per N_PER_AGENT survivors, at most the species' room under its agent budget
// (species pop.max — the followed fish a lake this size holds; the rest of the year-class isn't carried on). So
// year-class strength emerges from egg production × food for the young × predation on them — the classic determinants.
export const FRY = {
  PATCH_N: 1500,       // larvae per school at swim-up (a spawning's larvae split into schools of about this many)
  N_HALF: 30,          // a school thinned to this many fish yields predators half its full catch rate (n / (n + N_HALF))
  MAX_PER_SPAWN: 4,    // schools one spawning makes at most (more larvae → bigger schools)
  CAP: 80,             // schools in the lake at most (× area)
  SP_SHARE: 0.3,       // … of which one species holds at most this share (so an early, prolific spawner can't take every slot)
  MERGE_DAYS: 14,      // a spawning finding no free slot joins its species' youngest school if that is younger than this
                       //   (days; the school's genome is kept or replaced in proportion to the fish each side brings);
                       //   otherwise its larvae are lost
  // LARVAL APPETITE: FB4 consumption, fitted to juveniles and adults, understates larvae — Michigan pond bluegill fry grew as
  // observed only with the Cmax intercept raised 50 % (Breck 1997), and limnetic larvae growing 0.4 mm/day eat above FB4 Cmax
  // (docs/ECOLOGY_RESEARCH.md): a school's Cmax × CMAX_LARVA up to LARVA_CM[0] cm, easing to × 1 by LARVA_CM[1]
  CMAX_LARVA: 1.5, LARVA_CM: [2, 4],
  N_PER_AGENT: 3,      // survivors per recruited individual
  MAX_RECRUITS: 12,    // recruits one school yields at most
  TICK: 0.2,           // s between a school's feeding / physiology / mortality updates (staggered across schools; each
                       //   integrates the time elapsed — the schools' cost is a fraction of a step)
  EAT_R: 24,           // px a school forages over (a fish's patch reach, PREY.PATCH_R, + the school's own spread — no
                       //   better than the same fish foraging alone, or the young would out-compete everything else)
  SEEK_R: 160,         // px: a school moves toward the nearest food it eats within this
  FEEDS: 6,            // food patches a school crops per update at most
  R_WMIN: 0.1,         // g: below this a larva's mass-specific respiration is held at this mass's (larval metabolism scales
                       //   ~isometrically — Oikawa et al. 1991, Post & Lee 1996 — where FB4's W^RB, fit to bigger fish, would
                       //   give a 1-mg bass larva ~2,300 J/g/day, several times the measured larval rates)
  BENTH_L: 2.5,        // cm: young fish this long also forage the bottom (insect larvae; detritus for the bottom feeders) — a
                       //   species may set its own `benthL` (bullheads feed on the bottom from swim-up)
  M_LARVA: 0.08,       // /day extra natural mortality of the youngest larvae at 1 cm (∝ 1/length — ~0.16 at swim-up — fading out
                       //   by ~3 cm). Field larvae die at Z ≈ 0.04 (Oneida perch) to 0.15–0.5/day, MOSTLY TO PREDATORS (Houde 2008),
                       //   and freshwater larvae reach metamorphosis at ~5 % (Houde 1994); the lake's own fish eat only ~1 % of its
                       //   larvae (verify/fryfate.mjs), so this stands for the predators it doesn't simulate — cyclopoid copepods,
                       //   Chaoborus, small fish and insects — plus disease and failed first feeding (2026-10-15: at 0.02 the
                       //   surviving swarms of fry ate 8–10 kg of zooplankton a month, 2–4× a strong real year class, and
                       //   stripped the lake by August). Past it the schools die at the agents' size-scaled share of the
                       //   species' M (BIOE.M_OTHER; Lorenzen 1996)
  M_JUV: 0.035,        // /day at 20 °C: JUVENILES (taking over from M_LARVA as it fades, ~3 cm on) keep dying to predators the lake
  // JUVENILE COMPENSATION (2026-10-15): the juvenile rate M_JUV holds at JUV_DREF fish/m² of that species' juveniles and
  // scales with their density as (D + JUV_D50)/(JUV_DREF + JUV_D50) — a crowded cohort grows slower, draws predators and
  // cannibals, and dies faster; a sparse one survives several times better. Real lakes: survival 18 mm → age 2 doubles each
  // time density halves, so recruits stay within ~8 % across a fourfold range (Oneida perch: 0.41, 0.85, 1.56 %, Rose et al.
  // 2001); bluegill nest poisoning didn't cut autumn young (Beyerle & Williams 1967). Larval mortality stays density-
  // independent (Irwin et al. 2009). M = M0·(1 + N/N50) is the Beverton–Holt form
  JUV_DREF: 3, JUV_D50: 0.5,
  M_JUV_Q10: 3,        //   doesn't simulate — Oneida age-0 perch from 18 mm to autumn: Z ≈ 0.035/day, ~1.3 % surviving (Irwin et al.
                       //   2009) — slower in cold water (× Q10: ~0.005/day under the ice, so ~40–50 % die over a first winter as
                       //   with predators present, Neuswanger et al. 2015). The Q10 scales M_LARVA too, below 20 °C only
                       //   (2026-10-15: larval mortality falls in cold water — Pepin 1991; without it a 2–2.6-cm fingerling still
                       //   small in November died under the ice at the summer larval rate, ~4 %/day, and no young-of-year ever
                       //   reached spring; capped at the summer field rates — a Q10 about 20 °C ran August at ~1.7× them and
                       //   killed ~85 % of the fingerlings a month). (2026-10-15: without it a strong cohort of 2–4-cm
                       //   fry stripped the zooplankton every late July and the adults starved through the autumn)
  SWIM: 8,             // px/s a school's drift (× its fish's length/2, 0.5–4×)
  ESCAPE: 60,          // px/s a school swims up out of water below its critical O₂ (or down from near-lethal heat) — the
                       //   drift pace is ~3 cm per physiological 5 h; a larva leaves an anoxic layer within the hour
  CATCH: 0.03,         // larvae a plankton/insect eater catches from a school per handling slot (dense school) — larvae
                       //   are dispersed and hard to find among the zooplankton
  ATTACK: 100,         // young fish/s a PISCIVORE at a school catches × its capture success — a feeding BOUT: one behavioural
                       //   second is ~5 h of the fish's day, and a bass or perch working a school of young-of-year takes
                       //   dozens an hour; its gut and Cmax cap the meal. Weed cover shelters them (COVER.REFUGE)
  PELAGIC_X: [0.3, 0.7], // the open-water band (× W) a limnetic-phase school (sp.pelagicFry) keeps to …
  PELAGIC_D: 0.3,      // … above this × the lake's depth (the lit, zooplankton-rich epilimnion)
  LARVA_L: 2.0,        // cm: larvae this small are taken by any plankton/insect eater whose mouth they fit (≤ ⅓ of its length)
  SPRING_YF: 0.08,     // year-fraction (late March) from which an overwintered school recruits whatever it has become …
  OVERWINTER: 0.4,     // … if it is at least this old (yr)
};

// ---------- PREY as food (world.js feeding): wet mass per item (g), energy density (J/g wet), digestible share ----------
// Energy densities are measured values (Cummins & Wuycheck 1971; the prey energy-density database of Hermann et al. 2025,
// Ecology 106:e70154 — Kelso 1973, Ciancio et al. 2007/2013; Anderson et al. 2016 for detritus). Small invertebrates are drawn as
// single particles but each particle is a PATCH of many animals (a zooplankton swarm, a patch of midge larvae); its mass
// is the one calibrated quantity (it stands in for the slice of lake the 2-D world represents). Crayfish, snails, nymphs,
// tadpoles, frogs and turtle hatchlings are single animals at their real masses. Digestibility < 1 is the indigestible
// part beyond the species' own egestion (shells, exoskeleton, plant fibre, refractory detritus).
export const PREY = {
  PATCH_R: 14,                    // px: a patch (swarm) of small prey spans ~15–20 cm — a fish anywhere within it can feed
  DAPH_G: 2.0, DAPH_ED: 2400,     // a Daphnia swarm patch; Daphnia ~2,400 J/g wet (D. pulicaria 2,214–2,612: Snow 1972)
  COPE_G: 1.2, COPE_ED: 2700,     // a copepod patch (smaller per patch; copepods ~2,700 J/g)
  ROT_ED: 2300,                   // rotifers and nauplii, J/g wet
  BENTH_ED: 3300,                 // the bed's worms and scuds (amphipods ~3,500, oligochaetes ~3,200 J/g wet — Cummins & Wuycheck 1971)
  LARVA_G: 3.0, LARVA_ED: 2700,   // a patch of chironomid / mayfly larvae (chironomids 2,300–2,750; mayflies 2,700–6,900 J/g)
  INSECT_G: 1.5, INSECT_ED: 4000, // emerged adult aquatic insects at the surface (mayflies ~3,300–4,400 J/g)
  NYMPH_G: 0.5, NYMPH_ED: 4000,    // one late-instar dragonfly nymph (~0.2–1 g; Odonata 1,330–5,410, typically ~4,000 J/g)
  SNAIL_G: 0.4, SNAIL_ED: 1660, SNAIL_DIG: 0.6,   // one pond snail WITH its shell: 1,660 J/g whole (Ciancio et al. 2007); fish
                                                   //   assimilate ~27–65 % of a snail's energy (Vinson & Baker 2008)
  CRAY_G: 12, CRAY_ED: 3500, CRAY_DIG: 0.85,      // one adult crayfish (~10–25 g; exoskeleton partly indigestible)
  DETRITUS_G: 1.0, DETRITUS_ED: 979, DETRITUS_DIG: 0.35,    // organic detritus 979 J/g wet (Anderson et al. 2016) — poor food
  ALGAE_G: 2.0, ALGAE_ED: 1630, ALGAE_DIG: 0.45,  // g wet algae per unit of phytoplankton grazed; ~1,630 J/g (≈ detritus/0.6,
                                                   //   Anderson et al. 2016); fish digest algae poorly
  PLANT_ED: 1340, PLANT_DIG: 0.4,  // macrophyte tissue ~1,340 J/g wet (Boyd 1968/70; 700–2,550) — g per px is PLANT.GRAMS_PER_PX
  TAD_ED: 2100, FROG_ED: 4000, TURTLE_ED: 3000,   // whole tadpoles (~7–12 % dry matter), frogs (~20 %), turtle hatchlings (prior)
};

// ---------- brood protection (newborn cannibalism) ----------
// Newborns used to appear ±6 px from their parents — inside strike reach — and qPrey had no kin filter, so bass/pike
// ate their own brood within ~2 s for MORE energy than the spawning cost (an energy pump lifetime learning rewarded).
// A short post-birth GRACE (eggs/larvae hidden in the nest/weeds) makes a conspecific newborn not-prey for its first
// seconds; the brood is SCATTERED out of immediate strike range; and qThreat is symmetric with qPrey, so after the
// grace a juvenile senses (and can flee) a cannibal adult of its own kind. Real post-grace cannibalism stays possible.
export const BROOD = {
  GRACE: 5,      // s after birth during which a fish is not prey for its OWN species (other species can still eat it)
  // NEST GUARDING (species with sp.nestGuard s): the spawning parent stays on the nest and drives predators off while its
  // fry stay close — largemouth bass and sunfish males do this for 1–4 weeks, catfish too. Fry near a guarded nest are
  // much harder to catch (PROTECT shrinks a predator's strike reach there).
  GUARD_R: 60,          // px: the guarded zone around the nest
  PROTECT: 0.8,         // strike-reach cut on a guarded fry inside the zone while its guardian is there
  GUARD_TETHER: 2.5,    // steer weight pulling a guardian back to its nest (outweighs a brain's full turn once ~half-way out)
  HOVER: 0.3,           // a guardian on station with no intruder slows to this × its cruise (hovering/fanning over the nest)
  FRY_TETHER: 0.9,      // steer weight keeping guarded fry near the nest
  // THE COST OF GUARDING, staged (docs/research_notes/Predator winter energetics/nest_guarding_costs.md): the eggs to swim-up (the
  // first GUARD_EARLY days) cost most — respiration ×1.4, feeding ~0.12 of a free fish's; the free-swimming fry's weeks ×1.12, ~0.45
  // (smallmouth +17.6 % averaged over the whole guard, Cooke et al. 2002; ×1.2–1.28, Steinhart et al. 2005; 60–100 % of guards with
  // food in the gut, Mackereth et al. 1999 — the old ×1.6 was Hinch & Collins's PEAK, and with feeding ×0.2 starved ~14 % of the adult
  // bass on their nests where real ones lose 3–8 % of their mass over ~4 weeks and none starve). A guard's chases are in the ×, not
  // charged again as swimming; one whose condition falls below GUARD_QUIT leaves its nest (males abandon rather than starve)
  GUARD_METAB: 1.6, GUARD_FEED: 0.2,   // (the 2-D sim's, unchanged)
  GUARD_METAB3: [1.4, 1.12], GUARD_FEED3: [0.12, 0.45], GUARD_EARLY: 9, GUARD_QUIT: 0.8,   // (the 3-D lakes', by stage)
  // NURSERY: young fish shelter in vegetation and structure (the littoral nursery habitat), more so when frightened
  NURSERY: 0.45,        // cover-seeking steer weight for juveniles (age < half their maturity), × (1 + fear)
  SCATTER: [14, 40],  // px: newborns are placed this far (annulus) from the parent(s), clamped into the water column
};

// ---------- the landscape: the REAL Upper and Lower Hot Brook Lake and the brook between them (2026-10-15) ----------
// The human: "lets just model the real upper and lower hotbrook lake … make sure proportions and amount of water and animals
// is realistic". The bed is DATA (src/hotbrook_profile.js, generated by tools/hotbrook/slice_profile.py from the landscape
// model: the 1949 MDIFW soundings fitted to today's shoreline). Left to right: Upper Hot Brook Lake from its south shore (its
// deep north basin, 18 ft, lies by the outlet) → the connecting brook (the deeper pool at its upper mouth, riffles, a
// shallower run — the angler's description) → Lower Hot Brook Lake to its north shore (a flat 10–12-ft saucer, 13 ft max).
// Depths are true; each lake has its real share of area at each depth (Upper 44 % ≤ 3 m, mean 3.06 m; Lower 56 %, 2.68 m);
// along the slice the lakes are compressed ~90× (3.2 km → 36 m), the brook ~11×. docs/HOT_BROOK_SIM.md.
// x = 0 is Upper's south waterline (SHORE_D deep), x = W Lower's north one; the banks rise beyond them (bedY < 0 there).
export const LANDSCAPE = (() => {
  const D = HOTBROOK.DEPTH, DX = HOTBROOK.DX, n = D.length, P = 79, SH = 0.25;
  // the two waterlines: where the water first and last reaches SHORE_D deep (interpolated between profile points)
  let iL = 0; while (iL < n - 2 && D[iL + 1] < SH) iL++;
  const xL = (iL + (SH - D[iL]) / (D[iL + 1] - D[iL])) * DX;
  let iR = n - 1; while (iR > 1 && D[iR - 1] < SH) iR--;
  const xR = (iR - (SH - D[iR]) / (D[iR - 1] - D[iR])) * DX;
  const maxD = Math.max(...D), seg = HOTBROOK.SEGMENTS;
  const px = m => (m - xL) * P;   // profile metres → world px
  return {
    NAME: 'Upper and Lower Hot Brook Lake, T8 R4 NBPP / Danforth, Maine',
    PROFILE: HOTBROOK, X0_M: xL, X1_M: xR,
    W_PX: Math.round((xR - xL) * P),
    H_PX: Math.ceil((maxD + 0.2) * P / 24) * 24,     // the deepest water + a bed margin, in whole 24-px field rows
    MAX_D: maxD,
    SHORE_D: SH,       // m of water at the world's two edges (the waterline the aquatic world ends at)
    LITTORAL_D: 3.5,   // m: water this shallow (or less) counts as LITTORAL (spawning grounds, plant seeding, structure) — about the
                       //   deepest rooted plants in a Secchi ~3 m lake (Canfield et al. 1985: log Zc = 0.61 log SD + 0.26 → 3.6 m)
    // world-px bounds of the three water bodies (each join halfway across the profile's one-step seam)
    UPPER: [px(seg.upper[0]), (px(seg.upper[1]) + px(seg.brook[0])) / 2],
    BROOK: [(px(seg.upper[1]) + px(seg.brook[0])) / 2, (px(seg.brook[1]) + px(seg.lower[0])) / 2],
    LOWER: [(px(seg.brook[1]) + px(seg.lower[0])) / 2, px(seg.lower[1])],
    get LAKE_W() { return this.UPPER[1]; },   // (older call sites: the width of the first water body)
  };
})();
// the bed depth (px; larger y = deeper) at world x — the profile, linearly interpolated; NEGATIVE beyond the waterlines (the
// banks above the water, x < 0 or x > W)
export function bedY(x) {
  const D = HOTBROOK.DEPTH, n = D.length, u = (x / WORLD.PX_PER_M + LANDSCAPE.X0_M) / HOTBROOK.DX;
  if (u <= 0) return D[0] * WORLD.PX_PER_M;
  if (u >= n - 1) return D[n - 1] * WORLD.PX_PER_M;
  const i = Math.floor(u), f = u - i;
  return (D[i] + (D[i + 1] - D[i]) * f) * WORLD.PX_PER_M;
}
// kept for older call sites and tests: the old analytic basin's names, now the real lakes' figures
export const BASIN = { get DEEP_D() { return LANDSCAPE.MAX_D; } };
export const STREAM = { DEPTH: 0.35, POOL_D: 1.1 };   // m: the brook's riffles and its pools (the angler: "3 or 4 feet deep")
// the three water bodies, left to right: [x0, x1) in world px. Kinds stay 'lake' / 'stream' / 'pond' (code keys on them);
// `name` is what to show
export const BASINS = [
  { id: 0, kind: 'lake', name: 'Upper Hot Brook Lake', get x0() { return 0; }, get x1() { return LANDSCAPE.UPPER[1]; } },
  { id: 1, kind: 'stream', name: 'Hot Brook', get x0() { return LANDSCAPE.BROOK[0]; }, get x1() { return LANDSCAPE.BROOK[1]; } },
  { id: 2, kind: 'pond', name: 'Lower Hot Brook Lake', get x0() { return LANDSCAPE.LOWER[0]; }, get x1() { return WORLD.W; } },
];
export const basinAt = x => x < LANDSCAPE.BROOK[0] ? BASINS[0] : x < LANDSCAPE.BROOK[1] ? BASINS[1] : BASINS[2];
// a basin's deep centre (world px): the deepest point of each lake (Upper's north basin), the brook's midpoint
const _deepest = b => { let bx = (b.x0 + b.x1) / 2, bd = -1; for (let x = b.x0; x < b.x1; x += 4) { const d = bedY(x); if (d > bd) { bd = d; bx = x; } } return bx; };
let _centres = null;
export const basinCenterX = b => (_centres || (_centres = BASINS.map(B => B.kind === 'stream' ? (B.x0 + B.x1) / 2 : _deepest(B))))[b.id];
// the water cross-section (px²) — memoised (the geometry is fixed for the run)
let _wetArea = 0;
export function wetArea() { if (!_wetArea) { for (let x = 0; x < WORLD.W; x += 2) _wetArea += Math.max(0, bedY(x + 1)) * 2; } return _wetArea; }
// is the bed at x littoral (≤ LANDSCAPE.LITTORAL_D)?
export const isLittoralX = x => bedY(x) <= LANDSCAPE.LITTORAL_D * WORLD.PX_PER_M;
// a random littoral x (any basin), drawn with the caller's RNG R(lo, hi) — rejection sampling, deterministic for a seeded R
export function littoralX(R) {
  let x = 0;
  for (let k = 0; k < 64; k++) { x = R(6, WORLD.W - 6); if (isLittoralX(x)) return x; }
  return x;
}
// which way is the nearer shore (shallower water) from x: −1 left, +1 right
export const shoreDir = x => bedY(Math.max(0, x - 48)) <= bedY(Math.min(WORLD.W, x + 48)) ? -1 : 1;
// the basin a fish at x belongs to for spawning and open water (a fish in the stream counts with the nearer basin)
export const homeBasinAt = x => { const b = basinAt(x); if (b.kind !== 'stream') return b; return x - b.x0 < b.x1 - x ? BASINS[0] : BASINS[2]; };

// ---------- seasons & thermal structure ----------
// A temperate (dimictic) lake, year-fraction 0 = March 1. Surface water: ~0–1 °C under winter ice (Jan–Feb), ~4 °C at
// ice-out (~April), ~20 °C in June, peaking ~24–25 °C around Aug 1, back to ~4 °C by late November. (It used to run
// 22 °C on Mar 1 → 31 °C on Jun 1 → never below 13 °C: no winter, no ice, a June heat peak.)
export const SEASON = {
  get YEAR_LEN() { return TIME.YEAR_LEN; },   // live alias of the master TIME.YEAR_LEN (not a load-time copy)
  // THE MAINE CALENDAR (2026-10-15): the surface/epilimnion base temperature through the year — a periodic monotone
  // cubic through these [year-fraction, °C] knots (yf 0 = March 1), not a sine: a sine fitted to an end-of-April ice-out
  // reaches 15 °C only in mid-June, where Maine lakes warm FAST once the ice goes and cool slowly in autumn. Anchors (docs/
  // reports/Maine lakes ponds and streams.md): ice-out ~Apr 23 (West Grand Lake 1979–2008 mean Apr 24, USGS OFR 2010-1214);
  // 15 °C by ~May 25 (Spednic's modelled median start of smallmouth spawning May 28, Dudley & Trial 2014); a ~24 °C peak at
  // the end of July (August surveys 21–26 °C; Hot Brook 23.3 °C in August 1949); 10 °C by mid-October → 208 days below
  // 10 °C (Spednic 208 ± 4); ice-on ~Dec 1 (Nov–Dec, weakly sourced). Weather (ENV.TEMP_WEATHER) and the day add to it.
  TEMP_KNOTS: [[0, 0.3], [0.115, 0.5], [0.150, 4.0], [0.197, 10.0], [0.235, 15.0], [0.300, 20.5], [0.415, 24.0],
               [0.510, 21.0], [0.570, 16.0], [0.627, 10.0], [0.695, 5.0], [0.760, 1.0], [0.800, 0.3]],
  START_YF: 0.22,            // a fresh lake opens in mid/late May (ice gone, plants and fish active)
  // daylight: day length and noon sun height follow the solstice (Jun 21 = yf 0.307) — ~9 h days in winter, ~15 h in
  // summer, and a winter noon sun about half as strong
  SOLSTICE: 0.307,
  DAY_FRAC: [0.38, 0.62],    // fraction of the 24 h cycle that is daylight, [winter solstice, summer solstice]
  NOON: [0.5, 1.0],          // noon irradiance factor, [winter, summer]
};
// the seasonal base surface temperature (°C) at year-fraction yf — SEASON.TEMP_KNOTS through a periodic monotone cubic
// (Fritsch–Carlson tangents: no overshoot between knots, so winter stays at its floor and the peak is the peak knot)
const _tk = (() => {
  const K = SEASON.TEMP_KNOTS, n = K.length, X = [...K.map(k => k[0]), 1], Y = [...K.map(k => k[1]), K[0][1]], d = [], m = [];
  for (let i = 0; i < n; i++) d.push((Y[i + 1] - Y[i]) / (X[i + 1] - X[i]));
  for (let i = 0; i <= n; i++) { const dl = d[(i - 1 + n) % n], dr = d[i % n]; m.push(dl * dr <= 0 ? 0 : 2 / (1 / dl + 1 / dr)); }
  return { n, X, Y, m };
})();
export function seasonalTemp(yf) {
  const { n, X, Y, m } = _tk; yf = ((yf % 1) + 1) % 1;
  let i = 0; while (i < n - 1 && yf >= X[i + 1]) i++;
  const h = X[i + 1] - X[i], t = (yf - X[i]) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1];
}
// A fish-eating diving BIRD (a common loon): visits the open lake from ice-out to late autumn, rests on the surface and
// dives in daylight to chase fish underwater (loons pursue prey by sight, propelled by their feet), surfacing for air
// between dives, and flies off once sated. Fish sense a diving loon as a threat (World.qThreat). Times are sim seconds.
export const BIRD = {
  MAX: 1,              // loons hunting at once (one territorial bird/pair on a lake this size)
  ARRIVE: 0.004,       // /s chance one arrives when none is present (in season, open water)
  SEASON: [0.14, 0.76],// year-fraction window it can be on the lake (≈ Maine ice-out → late November; open water only)
  STAY: [500, 1100],   // s a visit lasts at most before it flies off
  SPEED: 62,           // px/s swimming underwater (between perch cruising and a pike's burst)
  TURN: 3.2,           // rad/s underwater turn rate
  SURFACE: [5, 14],    // s resting at the surface between dives
  DIVE: [9, 18],       // s of breath per dive
  SIGHT: 230,          // px it spots prey underwater (× water clarity: a visual hunter)
  PREY_MAX: 25,        // cm: the longest fish it swallows (common loons take fish ~10–20 cm, rarely ~25): minnows, perch,
                       //   sunfish, young bass/pike/catfish/trout
  REACH: 9,            // px catch reach
  LIGHT_MIN: 0.15,     // it only dives in daylight
  MEALS: 5,            // fish per visit before it's sated and leaves
  LEN: 50,             // world px body length (≈ an adult pike: a loon is ~80 cm long)
};

// lake ICE: forms when the surface water nears freezing, melts in spring. Under ice (+ snow) little light gets in, the
// wind can't mix or aerate the water, and the column is calm and weakly inverse-stratified (~0 °C under the ice, 4 °C
// at the bottom) — so dissolved O₂ slowly falls all winter (the classic winterkill risk in productive lakes).
export const ICE = {
  FORM_T: 1.2,     // °C: surface (diel-free) temperature below which ice grows
  MELT_T: 3.5,     // °C: above which it melts (hysteresis → it doesn't flicker on mild winter days)
  GROW: 0.03,      // /s cover growth toward full while cold
  MELT: 0.05,      // /s melt rate while warm
  LIGHT_CUT: 0.6,  // fraction of daylight blocked at full cover (clear ice with patchy snow: enough light gets through
                   //   for cold-adapted diatoms to photosynthesize — a real under-ice O₂ source)
  STRAT: 0.85,     // stratification strength under full ice (calm, inversely stratified, no wind) — vertical mixing is weak,
                   //   so the deep water runs down on its own while the upper water keeps the under-ice photosynthesis
};
export const THERMAL = {
  // MIXING IN METRES (2026-10-15, the real Hot Brook lakes — was the top 28 % / below 60 % of a 14.6-m column). The
  // wind-mixed layer of a lake ~3 km long reaches ~5–7 m in summer (empirical fetch relations, e.g. Patalas 1984), deeper
  // than Upper Hot Brook (5.5 m) — MDIFW: "the lake is shallow and does not stratify during summer months". Calm clear
  // weather shoals it (× the weather's wind, WIND.WEATHER), so a few calm hot days can stratify the bottom of the north
  // basin weakly until the next wind; Lower (3.9 m) and the brook stay mixed.
  MIX_M: 6.0,          // m: the wind-mixed depth at ordinary (cloudy-day) wind; × the weather's wind, clamped to …
  MIX_CALM: 0.75,      // … at least this in calm clear weather (4.5 m: only the bottom metre of Upper's north basin can stratify
                       //   — the 1949 August survey: 74 °F at the surface, ~71 °F at the bottom)
  FULLMIX_EROSION: 0.6,// /s: once the mixed layer reaches the deepest water the whole lake mixes and stratification breaks down …
  HYPO_TAU_FULLMIX: 3, // … and its bottom water takes the surface temperature within a day or so (s)
  NIGHT_MIX_M: 6.0,    // m: NIGHT CONVECTION — the surface cools after dark, sinks and mixes the column this deep: a shallow lake's
                       //   daytime stratification breaks most nights (why a 5.5-m lake "does not stratify" through a calm, clear week)
  META_M: 1.5,         // m: the thermocline's thickness under the mixed layer
  ICE_TOP_M: 0.3,      // m: under ice, 0 °C water just under the ice warms with depth …
  ICE_META_M: 2.7,     // … to the 4 °C bottom water over this (the calm column's inverse stratification)
  STRAT_O2_MIX: 0.16,  // vertical O₂ mixing across/below the thermocline when stratified (low)
  TURNOVER_MIX: 3.2,   // vigorous vertical mixing when stratification collapses (wind-driven overturn)
  STRAT_RELAX: 0.5,    // /s rate stratification eases toward its seasonal target (re-stratification after mixing)
  WIND_EROSION: 0.04,  // /s per unit weather-wind above calm that strong wind erodes stratification (rain ≈0.024/s, storm ≈0.056/s)
  RESTRAT_MAX_WIND: 2.0, // re-stratification HALTS while the weather-wind multiplier is ≥ this (storms) → a sustained storm
                       //   genuinely breaks the thermocline (~18 s to full mix) instead of settling at target − erosion/relax
  OVERTURN: 0.25,      // /s rate the sub-epilimnion O₂ relaxes toward the surface O₂, × (1 − strat) (turnover overturn)
  // HYPOLIMNION TEMPERATURE — the deep water has its own slow state (env.tempHypo), not the surface minus a fixed drop:
  // it follows the diurnal-free surface temperature quickly while the lake is mixed and only very slowly once stratified,
  // so it is "set" by the late-winter/spring mixed column and stays cool & steady all summer (no diurnal swing).
  HYPO_TAU_MIX: 150,   // s: deep-water temperature lag behind the surface when fully mixed (column heat capacity)
  HYPO_TAU_STRAT: 3000,// s: slow summer warming of the stratified hypolimnion (heat leaking through the thermocline)
  DIEL_M: 0.9,         // m: e-folding depth of the surface diurnal temperature swing (a shallow skin; was 0.06 × the 14.6-m column)
};
export const WIND = {
  BASE: 5,             // baseline surface drift speed (px/s), direction flips slowly
  WEATHER: [0.6, 1.0, 1.6, 2.4], // wind multiplier per weather state (clear→storm)
  SURFACE_M: 4.4,      // m the wind-driven surface current reaches down (was 0.30 × the 14.6-m column)
};

// ---------- habitat structure & cover (refuge from predation) ----------
export const STRUCTURE = {
  REEDS: 16,            // reed clumps along the shallow shores (reference; scales with width, not area)
  LOGS: 6,              // submerged logs scattered on the bed (scales with width)
  WEEDBEDS: 9,          // submerged macrophyte beds on the littoral/drop-off — tall cover bands reaching up
  REED_D: 0.9,          // m: emergent reeds (bulrush, pickerelweed) stand in water this shallow or less
  WEED_D: [0.8, 5.0],   // m: submerged weed beds root between these depths (plants to ~4–5.5 m in a Secchi 2–3 m lake)
  MUSSEL_D: 6.0,        // m: mussel beds on the lit bed shallower than this
};
export const COVER = {
  RADIUS: 30,           // how close a fish must be to structure/weeds to gain cover
  REFUGE: 0.7,          // max shrink of a predator's effective strike range when prey is in full cover
};
// ---------- inflow / outflow through-current ----------
export const FLOW = {
  SPEED: 3.2,           // gentle rightward through-current (px/s, inflow left → outflow right), weaker deep — the profile
                        //   the dissolved and suspended FIELDS are advected with (OUTFLOW: ~1-year water residence)
  LAKE_FRAC: 0.03,      // the share of that current a FISH or surface insect feels out on the lake or the pond: a 300-ha lake's
                        //   through-flow moves at ~mm/s — the stream (a few metres wide) carries it all (2026-10-15: at the full
                        //   3.2 px/s everywhere, the surface current carried the lake's golden shiners down the stream into the
                        //   pond's far end, where they crowded, ate it bare and starved every August–September)
  PLUME_COLS: 6,        // the inflow plume: this many field columns from the left shore …
  PLUME_ROWS: 4,        // … × this many surface rows (the stream spreads over the near-shore surface water)
  O2_MIX: 0.25,         // /s the plume's O₂ relaxes toward saturation (aerated stream water — also under ice)
  NUTRIENT: 3.3,        // nutrient (N+P)/s the inflow loads into the left littoral (sets the lake's trophic state /
                        // baseline productivity — higher = more mesotrophic, lower = oligotrophic). × INFLOW_P 0.12 ⇒ ≈0.40
                        // P/s (was 1.7 × 0.60 ≈ 1.02 P/s while grazing, fish detritus and the all-cells decay leaked ~2.6 P/s;
                        // with the budget closed the lake RETAINS its P — sinks are only the outflow + sediment burial).
};

// ---------- turbidity & water clarity ----------
// Murk rises with suspended algae (plankton density) and storm-stirred sediment; it dims the
// deeper water (more light attenuation → shallower photic zone) and shortens visual range.
// OUTFLOW — the through-flow. The inflow→outflow current advects every dissolved/suspended field (phosphate, ammonium,
// nitrate, phyto, cyano, DOM) rightward through the surface layer and out of the outlet at the right shore. With burial
// confined to the sediment, this makes inflow → lake → outflow a real through-flow (a nutrient sink). Tallied in env.ledger.
export const OUTFLOW = {
  ADVECT: 1.0,          // field advection speed as a multiple of FLOW.SPEED's depth profile (1 → ~1-year water residence)
  DEPTH_M: 3.6,         // m: the advected outflow layer (a surface outlet; was 0.25 × the 14.6-m column) — in Hot Brook nearly
                        //   the whole column moves toward the outlet
};

export const TURBIDITY = {
  BASE: 0.10,                       // baseline murk of clear-ish water (0 clear … 1 pea soup)
  FROM_ALGAE: 0.65,                 // murk added at full phytoplankton density
  FROM_STORM: [0, 0.04, 0.18, 0.42],// sediment stir per weather state (clear→storm)
  ATTEN: 1.6,                       // how much full turbidity multiplies light attenuation
  RELAX: 0.08,                      // /s easing toward the target turbidity
  SENSE: 0.40,                      // how much full turbidity cuts visual sense range
};

// ---------- phytoplankton (free-floating algae field — the base of the food web) ----------
// A biomass field per O₂/nutrient cell: grows with light × nutrient, produces O₂ by day and
// respires/decomposes (an O₂ sink) always, shades the water (turbidity), and is grazed by
// zooplankton (the drifting particles). Nutrient spikes → blooms → night/decay O₂ crashes.
// DIATOMS — the cold-water algae of the spring bloom (and the under-ice bloom in clear ice): they grow best in cold,
// mixed, bright water and SINK out once the lake stratifies (heavy silica shells), so a temperate lake's algae succeed
// diatoms (spring) → green algae (early summer) → cyanobacteria (late summer). Same Redfield stoichiometry as PHYTO
// (they draw on the same N and P pools, so the budgets stay closed); zooplankton graze them like green algae.
export const DIATOM = {
  GROW: 0.7,        // max growth /s at full light × nutrient × the cold-water temperature window
  TEMP_OPT: 7,      // °C of fastest growth (cold-adapted)
  TEMP_TOL: 10,     // °C half-width: little growth above ~17 °C
  DECAY: 0.035,     // /s mortality (× the Q10 like the other algae)
  SINK: 0.5,        // /s fraction a cell's diatoms sink one row, × stratification (calm, warm water can't keep them up)
  START: 0.06,
  BAND: 0.30,       // the upper-column band their lake mean is taken over (HUD, turbidity)
};

export const PHYTO = {
  Q10: 1.9,              // temperature dependence of algal growth, respiration and decay (Eppley ≈ 1.88), ×1 at 20 °C
  GROW: 0.95,            // max growth /s at full light × Liebig-limited nutrient (raised 0.85→0.95: faster recovery from the night/graze lows so the base reads non-zero more of the time)
  CAP: 1.0,              // max biomass per cell
  P_USE: 0.09,           // P content of one unit of algal biomass (drawn on growth, returned in full on decay/grazing)
  N_USE: 0.6023,         // N content per unit biomass = P_USE·(1−ORGANIC_P)/ORGANIC_P (Redfield-consistent with P and with
                         // DOM). Was 0.08 while decay returned 0.609 → N was created ~7.6× faster than used and never limited.
  O2_PHOTO: 0.85,        // O₂ produced per (biomass × light)
  O2_RESP: 0.05,         // O₂ consumed per biomass, always (respiration + decomposition)
  DARK_RESP: 0.15,       // respiration fraction kept by algae in a dark light climate (below the photic zone / under snowy ice):
                         //   starved cells cut their metabolism to ~10–20 % (dark survival) instead of respiring at full rate
  RESP_IK: 0.1,          // day-peak light at which respiration is fully active (night in the photic zone still respires fully)
  DECAY: 0.06,          // /s natural die-off (returns ALL its N+P)
  RECYCLE: 0.7,          // fraction of decayed biomass whose N+P returns directly as ammonium+phosphate; the rest
                         // (1−RECYCLE) dissolves into DOM for the microbial loop (was silently destroyed)
  BAND: 0.45,            // depth fraction of the photic band meanPhyto() averages over (where algae live)
  DIFFUSE: 0.06,         // spreads between cells
  START: 0.12,
};

// ---------- cyanobacteria (the N-fixing phytoplankton strain — a 2nd producer field) ----------
// A second biomass field beside `phyto` with a different ecology: it FIXES its own nitrogen from N₂, so its
// growth is NOT N-limited (only light × phosphate × warmth) — its competitive edge exactly when the N cycle's
// denitrification has drawn the lake down to LOW N : HIGH P. It is a slower grower than green phyto (GROW <
// PHYTO.GROW), so when N is plentiful the faster green phyto out-draws it for the shared phosphate; when N is
// scarce the green phyto stalls (N-limited) and frees P → cyano blooms. It is BUOYANT (floats to a surface
// SCUM in calm warm water; storms mix it down), shades the water (turbidity), crashes O₂ on a scum die-off,
// and LEAKS fixed N back into the lake (`FIX_N`) → a net N source that counteracts denitrification (the
// self-regulating end of the N cycle). Late-summer surface blooms emerge; autumn turnover/cooling end them.
export const CYANO = {
  GROW: 1.6,             // max PER-CAPITA growth /s at full light × P × warmth (logistic; was a zero-order 0.55 vs
                         // PHYTO.GROW 0.95) — a bloom must build from the standing stock, so it needs a sustained warm,
                         // bright, P-rich spell (net growth ≈ 0 at the baseline summer surface: GROW·L·P·warmth ≈ DECAY)
  INOC: 0.002,           // inoculum floor added to the standing biomass in the growth term (resting cells/akinetes →
                         // cyano can always re-establish, but only slowly from nothing)
  CAP: 1.0,              // max biomass per cell
  P_USE: 0.09,           // P content per unit biomass — drawn from the SAME phosphate pool green phyto uses (competition)
  N_USE: 0.6023,         // N content per unit biomass (Redfield, = PHYTO.N_USE) — FIXED from N₂ on growth, so it is a net
                         // N SOURCE to the lake once the biomass decays (tallied in env.ledger.fixN)
  TEMP_OPT: 25,          // °C — a warm-water bloomer (late summer); growth falls off away from this (real cyanobacteria peak ~25–30 °C)
  TEMP_TOL: 11,          // °C half-width of the thermal growth window (0 growth beyond ±TEMP_TOL): ~none below ~14 °C
  O2_PHOTO: 0.85,        // O₂ produced per (biomass × light) by day
  O2_RESP: 0.06,         // O₂ consumed per biomass always (a thick scum → night/decay O₂ crash)
  DECAY: 0.06,           // /s die-off (returns ALL its P and fixed N). Was 0.05: with grazing-immune buoyant growth the
                         // surface scum saturated whenever it was warm; a bloom now needs warmth AND above-baseline P
  RECYCLE: 0.7,          // fraction of decayed N+P returned directly as phosphate+ammonium; the rest dissolves into DOM
  FIX_N: 0.045,          // fixed N leaked to ammonium per unit growth — the net-new-N enrichment feedback
  BUOY: 0.6,             // /s upward float in CALM water (forms the surface scum); storms (turbulence) suppress it
  DIFFUSE: 0.05,         // spreads between cells
  TURB: 0.6,             // surface-scum turbidity contribution at full surface density
  SCUM_BAND: 0.12,       // depth fraction of the surface band meanCyano() averages over (the scum layer)
  START: 0.005,          // small ever-present seed strain (so it's ready to bloom when conditions favour it). Was 0.02:
                         // buoyancy alone floated a deep column's seed (0.02 × 48 rows ≈ 1) into a TOXIC scum with no growth
  // CYANOTOXINS (harmful-algal-bloom toxicity, e.g. microcystin): a DENSE surface scum (local cyano > TOX_THRESH·CAP)
  // releases a toxin that harms FISH (extra energy drain) and ZOOPLANKTON (extra death) — so a bloom can kill by
  // POISON, not only via the night/decay O₂ crash. Exposure is naturally surface-concentrated (the scum is buoyant),
  // so it mainly hits surface fish (minnows). A topical pollution/climate-scenario amplifier.
  TOX_THRESH: 0.6,       // local cyano (fraction of CAP) above which the scum turns toxic — a DENSE scum (was 0.4: 81 of 85
                         // surface cells exceeded it every early summer, so the toxin was simply "on" all summer)
  RESP_STRESS: 1.5,      // × respiration added per unit (fraction of CAP) of cyano above the threshold (detoxification, gill
                         //   and liver damage) — a fish in the densest scum burns ~1.6× its normal metabolism
  TOX_ZOO: 0.4,          // /s extra zooplankton death rate inside a toxic scum
};

// ---------- mussels (benthic filter feeders that clear the water) ----------
export const MUSSEL = {
  COUNT: 44,             // beds (reference; scales with width), on the shallow/mid bed — native unionids (eastern elliptio,
                         //   Elliptio complanata, Maine's common lake mussel); "lots of freshwater mussels" at Hot Brook (the human)
  FILTER: 0.10,          // phytoplankton biomass cleared /s per bed from the water above it
};

export const GRID = {
  AGENT_CELL: 36,    // spatial grid cell for agents (kept constant → O(local) queries at any scale)
  FOOD_CELL: 30,     // spatial grid cell for plankton/detritus
  // field resolution tracks world size so each O₂/nutrient cell stays ~24px (constant physics scale)
  FIELD_COLS: Math.round(WORLD.W / 24),
  FIELD_ROWS: Math.round(WORLD.H / 24),
};

// camera / viewport (browser-only consumers, but kept here so it's all data-driven).
// Zoom is in screen(device) px per world unit. "fit" = the zoom that frames the whole
// lake; min/max/tour zooms are expressed as multiples of fit so they hold at any screen.
export const CAMERA = {
  FIT_PAD: 0.97,       // framing the whole lake leaves a hair of margin
  MIN_ZOOM_REL: 0.80,  // allow zooming a little past whole-lake fit
  MAX_ZOOM_REL: 120,   // closest zoom-in: ~120× the whole-landscape fit (~64× the lake's) → one organism fills the view
  FOLLOW_LERP: 4.0,    // follow/recenter smoothing (1/s)
  ZOOM_LERP: 9.0,      // zoom easing (1/s)
  TOUR_DWELL: [8, 14],     // seconds spent on each cinematic shot
  TOUR_ZOOM_REL: [11, 30], // zoom range (× the whole-landscape fit; ×1.9 the lake's) for close FOLLOW shots (was 9–30, then 7–22: one fish filling the screen loses the scene around it)
  // screensaver tour (camera.js): a mix of shot types instead of nothing but close follows, with soft cinematic easing
  TOUR_WIDE: 0.16,         // share of WIDE establishing shots (whole lake, slow drift)
  TOUR_HABITAT: 0.26,      // share of HABITAT shots (weed beds, the shelves, the deep basin — medium zoom, slow pan)
  TOUR_FOLLOW_LERP: 1.3,   // pan easing while touring (1/s) — slower than FOLLOW_LERP so shots glide, not whip
  TOUR_ZOOM_LERP: 0.9,     // zoom easing while touring (1/s)
  TOUR_TRAVEL: 2.4,        // s spent pulled-back while travelling to a far subject before pushing in
};

export const ENV = {
  get DAY_LEN() { return TIME.DAY_LEN; },   // live alias of the master TIME.DAY_LEN (not a load-time copy)
  LIGHT_ATTEN: 3.2,        // how fast light dims with depth — a shallow photic zone, dark deep water

  // weather: 0 clear, 1 cloudy, 2 rain, 3 storm
  WEATHER_DWELL: [26, 20, 16, 10], // avg seconds spent in each state
  CLOUD_COVER: [0.0, 0.45, 0.7, 0.85], // light reduction per state
  TURBULENCE: [0.25, 0.4, 0.85, 1.0],  // surface mixing (aeration) per state
  RAIN: [0, 0, 0.6, 1.0],              // rain intensity per state

  // temperature (deg C, normalised internally)
  TEMP_BASE: 12.5,         // a starting surface temperature before the calendar sets it (the curve is SEASON.TEMP_KNOTS)
  TEMP_DIURNAL: 4,         // +/- swing over the day (surface; damped with depth — THERMAL.DIEL_M)
  TEMP_RELAX: 0.4,         // /s rate the surface temperature eases toward its seasonal+diurnal+weather target
  TEMP_WEATHER: [0, -1, -2.5, -3], // cooling per weather state

  // oxygen field dynamics (values are normalised 0..~1.2, 1 = reference saturation)
  O2_DIFFUSE: 0.25,        // diffusion rate /step-ish
  O2_AERATE: 0.30,         // surface re-aeration toward saturation
  AERATE_CALM: 0.4,        // aeration = O2_AERATE·(AERATE_CALM + turbulence) + rain·AERATE_RAIN …
  AERATE_RAIN: 0.12,
  AERATE_ROW1: 0.4,        // … and the row just below the surface aerates at this fraction of the surface rate
  O2_PHOTO: 1.7,           // O2 produced per (biomass*light) unit
  O2_PER_GO2: 0.044,       // normalised O₂ removed from a fish's cell per g O₂ it respires (its bioenergetic respiration, world.js
                           //   rO2) — the one constant tying real grams to the 2-D field; set so the community's total draw equals
                           //   the earlier calibration of the lake's O₂ budget (fish ≈ 15–40 % of the sediment demand, as in real lakes)
  O2_PLANT_NIGHT: 0.006,   // plant respiration at night
  // (2026-10-15, the real Hot Brook lakes: with the demand now acting on the whole bed, 0.15 / 0.009 drew a 2–5-m column down
  // 0.2–0.3 mg/L/day under the ice — 2–3× the 0.06–0.12 of lakes this deep — and the bed's 0.5 g O₂/m²/day is well above cold
  // sediment's ~0.1–0.2. Halved: ~0.8 g/m²/day at 20 °C and ~0.25 at 4 °C on a 3-m bed)
  O2_SED: 0.08,            // SEDIMENT O₂ demand /s at each column's bed cell (× O2_DEMAND_Z's depth ramp, × Q10 about 12 °C)
  O2_PELAGIC: 0.005,       // water-column O₂ demand /s (decomposition of sinking particulate organic matter, × the ramp)
  // the demand's depth profile (2026-10-15, was "below the epilimnion" — 4.1 m of a 14.6-m column, which left a 5.5-m lake's
  // whole bed without sediment O₂ demand, so its winter O₂ could never fall): every bed and water cell respires, rising with
  // depth from O2_DEMAND_MIN at the surface to full at O2_DEMAND_Z — sand and rock in the shallows, organic muck focused in
  // the deep basins (MDIFW: "the lake bottom is mostly muddy")
  O2_DEMAND_MIN: 0.15, O2_DEMAND_Z: 10.5,
  O2_START: 0.85,
  SAT_TEMP_K: 0.020,       // saturation drop per deg above 18C
  HYPOXIA: 0.35,           // default critical O2 (species override via sp.o2Crit); below it, fish take stress
  HYPOXIA_AVOID: 1.0,      // innate oxyregulation: a fish whose local O₂ < its o2Crit × this steers upward out of it (world.js)
  O2_MGL: 9.5,             // mg/L of dissolved O₂ at normalised 1.0 (saturation at ~18 °C) — converts published DO limits

  // metabolism scales with temperature exponentially (fish Q10 ≈ 2–2.5): ×1 at 18 °C, ~×0.3 at 3 °C, ~×1.7 at 25 °C — so
  // winter fish idle on their reserves and a hot summer is costly
  METAB_Q10: 2.2,

  // thermal niche: each species has a preferred temperature (sp.tempOpt, behavioural) and an upper tolerance; heat stress
  // itself is in the bioenergetics (appetite collapses toward CTM, respiration climbs) and lethality in BIOE (UILT). Cold
  // is NOT stressful for these temperate natives (all overwinter under ice): below tempOpt they just slow down — swimming
  // and foraging fall with a thermal performance curve (COLD_PERF).
  COLD_PERF_MIN: 0.2,      // activity/feeding factor at ≤ 2 °C (rises linearly to 1 at the species' tempOpt)
};

// Nutrients are split into PHOSPHATE (`phos`) and dissolved inorganic NITROGEN — the latter itself split into
// AMMONIUM (`nh4`) + NITRATE (`no3`) by the nitrogen cycle (see NCYCLE). Phytoplankton/plant growth is
// **Liebig co-limited** = min(Monod(N=nh4+no3), Monod(P)); whichever is scarcer caps growth. Phosphate is the
// usual limiting nutrient (scarce, low half-saturation), so P loading drives blooms.
export const NUTRIENT = {
  DIFFUSE: 0.12,
  // (the old all-cells DECAY "burial" is gone: P is now buried only from the sediment store (SED_P.BURY), N leaves by
  //  denitrification, and both leave through the OUTFLOW — so every sink is explicit and tallied in env.ledger)
  FROM_DETRITUS: 0.5,      // N+P (DOM units) carried by each SEEDED detritus particle. Fish-death detritus carries 0 —
                           // fish hold no N/P in this model, so their remains are food (energy) but nutrient-neutral.
  GRAZE_EXCRETE: 0.6,      // fraction of grazed algal N+P excreted straight back as ammonium+phosphate; the rest is
                           // egested as DOM (zooplankton/mussels/snails/fish don't store nutrient — nothing is destroyed)
  PLANT_UPTAKE: 0.05,      // total nutrient a growing plant draws (split N+P)
  P_START: 0.10,           // phosphate — scarce; the usual limiting nutrient
  KN: 0.30,                // half-saturation for N-limited growth (Monod)
  KP: 0.10,                // half-saturation for P-limited growth (P limits across the working range)
  ORGANIC_P: 0.13,         // P fraction of organic matter (Redfield-ish N:P ≈ 7:1 → P ≈ ⅛ of N+P); DOM and algae share it
  INFLOW_P: 0.12,          // P fraction of the inflow load: runoff N:P ≈ 7.3 (just above Redfield 6.7). Was 0.60 (N:P 0.67),
                           // harmless while N was created on recycling; with N conserved it starved the whole lake of N all
                           // year (≈80% of cells N-limited even in winter) and handed it to the N-fixers.
};

// SEDIMENT PHOSPHORUS — the Mortimer redox switch / internal loading. A benthic P store per column binds
// dissolved P while the overlying water is OXIC (iron-bound), and RELEASES it when the bottom goes anoxic
// (Fe reduces). Reuses the summer hypolimnetic dead zone we already model → a self-reinforcing eutrophication
// feedback (anoxia frees legacy P → fuels blooms → more organic settling → more sediment P → worse anoxia).
export const SED_P = {
  START: 0.6,              // initial bound-P per benthic column
  SETTLE: 0.02,            // P/s settling onto the sediment ∝ (bed-cell phyto + RAIN_BASE) — DRAWN from the bed cell's
                           // algae (their N is ammonified back to the water) and, for the baseline, its phosphate
  RAIN_BASE: 0.05,         // baseline settling (P scavenged from the bed-cell water even without algae)
  BURY: 0.01,              // /s permanent burial of the bound store (deep sediment) — the lake's P sink besides the outflow
  O2_THRESH: 0.25,         // benthic O₂ below which iron-bound P is released (the redox switch)
  RELEASE: 0.5,            // /s release rate of bound P when anoxic (scaled by how far below threshold)
  BIND: 0.06,              // /s rate at which oxic sediment binds dissolved P back out of the water
  MAX: 4.0,                // cap on the bound-P store: settling/binding stop at it (headroom-limited — no P destroyed)
};

// ---------- nitrogen cycle (nitrification ⇌ denitrification) ----------
// The dissolved inorganic N pool (old `din`) is split into AMMONIUM (`nh4`, the reduced form released by
// decomposition/excretion, energetically preferred by phytoplankton) and NITRATE (`no3`, the oxidized form).
//   • NITRIFICATION (NH₄→NO₃) is AEROBIC and CONSUMES O₂ (~2 mol O₂ per mol N) — a real O₂ demand in the
//     oxygenated water column (it contributes to the stratifying-summer O₂ decline, like real hypolimnetic
//     nitrification). It runs ONLY above the anoxic threshold `DENITRIF_O2` (nitrifiers are obligate aerobes),
//     so it HALTS in the dead zone itself — the residual deep-O₂ floor stays governed by the sediment demand.
//   • DENITRIFICATION (NO₃→N₂ gas, PERMANENTLY LOST) is ANAEROBIC and runs ONLY below that same threshold (the
//     anoxic summer hypolimnion / sediment we already model) → a real, irreversible N sink. The two processes
//     are redox-separated and mutually exclusive per cell at `DENITRIF_O2` (the SAME O₂ cline the sediment-P
//     Mortimer switch uses — one coherent redox boundary). This is *why* P (not N) is the ultimate limiter of a
//     lake, and it sets up N-fixing cyanobacteria winning at low N:P (a later slice).
// Total available N for growth = nh4 + no3 (Liebig N-Monod over the sum). Pure / deterministic (no RNG).
export const NCYCLE = {
  Q10: 2.0,                // nitrification/denitrification temperature dependence (bacterial; ×1 at 20 °C, ~×0.3 near 3 °C)
  NH4_START: 0.30,         // initial ammonium (reduced N) — with NO3_START, 0.60 total inorganic N at start
  NO3_START: 0.30,         // initial nitrate (oxidized N)
  NITRIF: 0.05,            // /s nitrification rate (NH₄→NO₃) at full O₂ (supply-limited at steady state)
  NITRIF_O2_HALF: 0.30,    // O₂ half-saturation (Monod) for nitrification — nitrifiers need oxygen
  NITRIF_O2_COST: 0.8,     // O₂ consumed per unit N nitrified (normalized ~2:1 stoichiometry)
  DENITRIF: 0.08,          // /s denitrification rate (NO₃→N₂, lost) at full anoxia
  DENITRIF_O2: 0.25,       // O₂ below which denitrification runs (anoxic; matches the dead-zone threshold)
};

// ---------- microbial loop (bacterial decomposition of organic matter) ----------
// Real lakes don't remineralize organic matter instantly. Settling DETRITUS (and fish corpses, which already
// become detritus) dissolves into a DISSOLVED-ORGANIC-MATTER pool (`dom`) that heterotrophic bacteria decompose
// GRADUALLY. The rate is TEMPERATURE-DEPENDENT (a Q10 ≈ 2.3 → ~2.3× faster per +10 °C) and O₂-LIMITED (Monod) —
// so in the cold, hypoxic hypolimnion decomposition STALLS and DOM accumulates over the stratified summer, then
// mineralizes in a pulse at autumn turnover (warmer + re-oxygenated). Decomposition CONSUMES O₂ (a real,
// organic-matter-proportional demand that concentrates where detritus settles — the bed — deepening hypolimnetic
// hypoxia) and RELEASES the bound N (as ammonium) + P (phosphate) back to the inorganic pools, Redfield-split.
// The nutrient released exactly equals the organic matter consumed (mass-conserving) — this is the realistic,
// delayed, temperature-gated replacement for the old instant detritus→nutrient release. Pure / deterministic.
export const MICROBE = {
  START: 0.0,              // initial DOM (the lake starts with its detritus stock still particulate, undissolved)
  BACT: 0.05,              // /s base bacterial decomposition rate at REF_TEMP & full O₂ (DOM fraction cleared/s)
  Q10: 2.3,                // decomposition speeds ×Q10 per +10 °C (warm epilimnion fast, cold hypolimnion slow)
  REF_TEMP: 20,            // °C reference temperature at which BACT is the rate
  O2_HALF: 0.10,           // O₂ half-saturation (Monod) — aerobic decomposition slows as O₂ falls (DOM lingers in the dead zone)
  O2_COST: 0.6,            // O₂ consumed per unit DOM decomposed (the bacterial respiration demand)
  DIFFUSE: 0.10,           // DOM blurs/spreads like the other dissolved fields
};

// ---------- sediment organic matter (the bed's detritus layer) ----------
// Dead algae, plant litter and the remains of animals settle onto the bed as a layer of organic detritus: the food of the
// deposit-feeding insect larvae (chironomids, mayfly nymphs) and of the bottom-sifting fish, decomposed by bacteria. Kept
// per field column (`env.sedOM`, grams wet). In: a share SINK of the algae dying in the column above (PP_G g per unit of
// the algal fields), plant litter (PLANT.LITTER_G) and expired detritus particles. Out: first-order decomposition (Q10,
// slower without O₂), the larvae (INSECT.GROW / YIELD) and sifting fish (SIFT). Carbon/energy only: the N and P of the
// dying algae go where they always went (back to the water, DOM and the sediment-P store), so the N/P budgets are closed
// as before. This replaces larval recruitment gated on the count of fresh detritus PARTICLES (kept near zero by the bottom
// feeders), which made benthic production independent of the lake's productivity.
export const SEDOM = {
  START: 600,              // g per column at the start (≈ the lake-wide summer mean: the deep basin holds more, the shallows less)
  PP_G: 60,                // g wet algae per unit of algal biomass dying in the fields: sets the default lake's labile
                           //   sedimentation to ~750 g wet/m²/yr (≈ 37 g C/m²/yr — 25 % of a mesotrophic lake's ~150 g C/m²/yr
                           //   primary production; 20–50 % of production reaches the bed in shallow lakes)
  SINK: 0.25,              // share of the dying algae that reaches the bed as labile detritus (the rest is respired on the way down)
  PERI_G: 180,             // g wet /s per column of BENTHIC ALGAE (periphyton, epipelon) at full light on its bed at 20 °C — the
                           //   littoral's own production (10–100 g C/m²/yr in lakes; up to most of a clear lake's primary production,
                           //   Vadeboncoeur et al. 2003), lost as the water turns murky. ~1,000 g wet (~50 g C)/m²/yr on the lit
                           //   shallows of the default lake (2026-10-15: was 110 → ~600; with realistic zooplankton the fish need the
                           //   bed's ~50–65 % share of their food — Vander Zanden & Vadeboncoeur 2002 — and zoobenthos producing
                           //   ~100–125 g/m²/yr, Bay of Quinte)
  get K20() { return 0.144 / BIOE.DAY; },   // /s decomposition at 20 °C: plankton detritus 0.144/day (0.078–0.20) with Q10 1.94
  Q10: 1.94,               //   (Otsuki & Hanya-type incubations; periphyton and plant detritus 0.08–0.2/day at 20 °C)
  ANOX: 0.3,               // decomposition on an anoxic bed runs at this × the oxic rate (anaerobic pathways are slower)
  O2_HALF: 0.1,            // bottom-water O₂ (normalised) at which aerobic decomposition runs at half its rate
  SIFT: 0.5,               // a bottom-sifting fish (diet.detritus: carp, bullhead) takes up to this × its gut capacity a second
};

// BENTHOS — the bed's NON-INSECT invertebrates (oligochaete worms, amphipods/scuds, isopods, small clams), a pool of g wet per
// column of bed (env.benth) on the organic layer (SEDOM) they eat (2026-10-15). In real lakes they are about half the zoobenthos
// — Bay of Quinte: chironomids 4.9 g/m² (P/B 14), oligochaetes 2.7 (P/B 10), amphipods 1.9 (P/B 4.4) — and unlike the insect
// larvae (INSECT) none of their production leaves the lake as emerging adults: it is all fish food. Fish get ~50–65 % of their
// food from the bottom (Vander Zanden & Vadeboncoeur 2002); with the zooplankton no longer an unlimited supply this pool closes
// the sim's benthic gap (larvae alone ~35 g/m²/yr vs ~125 for all zoobenthos). Grows (logistic toward CAP, Monod in the
// column's layer, Q10), dies slowly (worms outlast anoxia, scuds don't), and a REFUGE of every column (burrowed in the mud, deep
// in the weeds) is out of fish reach. Rates per real day (÷ BIOE.DAY).
export const BENTHOS = {
  START: 4,                // g wet/m² at the lake's opening (Quinte oligochaetes + amphipods ≈ 4.6 g/m²)
  CAP: 15,                 // g/m² the bed can hold (logistic; littoral zoobenthos 5–20 g/m²)
  get G() { return 0.16 / BIOE.DAY; },     // /s growth at 20 °C on ample organic matter (2026-10-15: 0.08 → 0.16 — the bed's whole
                                           //   zoobenthos then produces ~110–125 g/m²/yr as in the Bay of Quinte, oligochaete P/B ~10/yr;
                                           //   at 0.08 it made ~78, with ~0.4× Quinte's bed food per kg of fish)
  get M() { return 0.01 / BIOE.DAY; },     // /s natural mortality at 20 °C (back to the organic layer)
  Q10: 2.0,
  K_SOM: 150,              // g of organic layer per column at which they grow at half speed (as the insect larvae)
  YIELD: 0.25,             // g of invertebrate per g of organic matter eaten (as INSECT.YIELD)
  O2_MIN: 0.05,            // bottom O₂ (normalised) below which they die off at …
  get ANOX_M() { return 0.02 / BIOE.DAY; },   // … this /s at 20 °C (oligochaetes tolerate weeks of anoxia; amphipods leave or die)
  REFUGE: 3,               // g/m² of every column out of fish reach (fish-exclusion studies: fish cut benthos only 20–60 %)
  K_FISH: 0.5,             // g/m² of reachable invertebrates at which a bottom-foraging fish gets half its ration from them (type II) —
                           //   handling-limited: a sunfish working ~1 g/m² of exposed midges and scuds (~1,000+/m²) meets prey faster
                           //   than it can handle them, so the response saturates well below 1 g/m² (2026-10-15: was 2, which held
                           //   fish at ~45 % of their ration on a bed they had grazed to ~1.6 g/m²); what limits them is the refuge
  REACH: 120,              // px (~1.5 m) above the bed within which a bottom forager feeds on them (the mud and the weed band)
  Q: 1.0,                  // a forager refills its gut with them at up to Q × its Cmax rate (bigger prey than zooplankton, fewer captures)
  SENSE_MIN: 0.5,          // g/m² above the refuge a bed must hold for a forager to sense it as worth feeding on (env.benthBest)
};

// ZOOPLANKTON as two biomass FIELDS on the environment grid (env.zooD — Daphnia and the other cladocerans; env.zooC — copepods
// with their nauplii and copepodites), in g WET per field cell (2026-10-15, docs/ECOLOGY_RESEARCH.md). They used to be ~2,000
// swarm particles refilled at full size in proportion to the algae — production about right, but the standing stock 3–6×
// too low (16 µg dry/L in June) and fish ate ~all of each month's production. Now each kind GROWS on the algae in its own
// cell (a Holling food response) at a temperature-set rate (Q10), less maintenance and background mortality; GRAZES that
// cell's algae (type II, returning the N+P as before); dies in anoxic water and in a toxic cyanobacterial scum; mixes; and
// escapes visual fish by DIEL VERTICAL MIGRATION (a daily-mean refuge: the share of migrants grows with the lake's fish
// biomass — the kairomone response — wherever the column is deep enough to hide in, and costs them growth in the cold dark
// water). Fish and fry feed on the cells around them at a rate set by the local exposed density (type II, µg dry/L), so
// young fish starve where the water holds too few prey per litre and planktivores turn to the bed when the zooplankton thins.
// Rates are per REAL day (÷ BIOE.DAY) like the fish's own physiology; the diel light cycle is cosmetic (one sim night lasts
// several physiological days), so DVM and visual feeding are daily means, not tied to it.
export const PLANKTON = {
  DRY: 0.1,                // dry : wet mass of crustacean zooplankton (Johannsson et al. 2000); carbon is ~48 % of dry (Andersen & Hessen 1991)
  START_D: 1.0,            // g wet per cell at the lake's opening — Daphnia (1.0 g/cell ≈ 40 µg dry/L) …
  START_C: 0.6,            // … and copepods (≈ 24 µg dry/L; summer crustacean zooplankton 45–100 µg/L in mesotrophic lakes, Gyllström 2005)
  // GROWTH /day at 20 °C on saturating food (× Q10 with the cell's temperature × the food response): Daphnia populations
  // grow 0.3–0.5/day on ample food; the field P/B — growth on natural, limiting food — is ~0.13–0.16/day above 10 °C and
  // ~0.04 below for herbivorous cladocerans, ~0.10 for cyclopoids and ~0.04 for calanoids at 20 °C (Stockwell & Johannsson
  // 1997; Johannsson et al. 2000; Shuter & Ing 1997: log P/B rises 0.043/°C, Q10 ≈ 2.7)
  G_D: 0.6, G_C: 0.3,      // (set so the REALISED production — after the migrants' cold dark hours and the DVM cost — matches the field P/B)
  R_D: 0.08, R_C: 0.05,    // /day maintenance at 20 °C: below food ≈ (R + M)/G of saturation a population shrinks — set so Daphnia stop
                           //   growing at ~0.035 algae units ≈ 0.05–0.1 mg C/L (0.06–0.10 mg C/L of good food — Boersma & Kreutzer 2002; one algae
                           //   unit ≈ 1.5–3 mg C/L — the mapping is uncertain ~2×) and copepods a little above (at 0.05/0.03 the zooplankton lived on next to no algae)
  M_D: 0.03, M_C: 0.02,    // /day background mortality at 20 °C (invertebrate predators — Chaoborus, Leptodora, cyclopoids — and senescence)
  Q10_D: 3.0, Q10_C: 2.7,  // growth: Daphnia are warm-water breeders (eggs develop in 20 d at 4 °C, 7.6 at 10, 2.7 at 20 — Bottrell et al.
                           //   1976); copepods' field P/B rises 0.043 log units/°C (Q10 2.7 — Shuter & Ing 1997), but they keep growing in
                           //   cold water and carry the zooplankton through winter
  Q10_L: 2.0,              // maintenance and mortality — less temperature-sensitive than growth (so cold water favours losses)
  DAPH_T: [4, 10],         // °C: Daphnia barely reproduce in ice-cold water — their growth ramps in from 4 °C to full at 10 …
  DAPH_HOT: [25, 30],      // … and falls off above 25 °C (heat stress; the temperate Daphnia's upper limit is ~30 °C)
  K_D: 0.15, K_C: 0.2,     // edible algae (green + diatoms, field units) at which growth runs at half its maximum. Big Daphnia have the
                           //   LOWER threshold food level (zero growth at ~0.03 here vs ~0.05 for copepods): they win the competition for
                           //   algae unless fish strip them out (Gliwicz 1990; the size-efficiency hypothesis, Brooks & Dodson 1965)
  LIT_FOOD: 0.1,           // algae-equivalent food the weed beds add for the littoral copepods and chydorids (periphyton and detritus on
                           //   the plants — plant-associated taxa are about half the zooplankton of shallow lakes, Gyllström 2005)
  DAPH_CYANO: 2.5,         // × the local cyanobacteria fraction cut from Daphnia's growth (they can't eat or tolerate them)
  DAPH_TOX: 2.0,           // Daphnia × the cyanotoxin kill rate in a toxic scum (cladocerans are the most sensitive)
  // GRAZING (type II): a gram of each kind clears up to this much algae (field units) a sim-second at 20 °C on rich food
  // (× Q10, × A/(A + K)); the grazed algae's N+P is returned at once (excreted or egested), as before. A spring Daphnia peak
  // can clear the water (the clear-water phase: 14–170 % of the lake filtered a day — Lampert et al. 1986; Luecke et al. 1990)
  GR_D: 0.0048, GR_C: 0.002,
  DIFFUSE: 0.15,           // small-scale mixing between cells (swimming and turbulence)
  HMIX: 0.2,               // /s: each depth layer relaxes toward its lake-wide mean (wind currents cross a small lake many times a day; ≈ daily here)
  SHORE: 0.25,             // … but open-water Daphnia avoid the shore (Siebeck 1980): a shallow column holds this share of a deep one's
  MIX: 1.0,                // /s: over a day the animals spread through their column's oxic water (wind mixing + the migrants' daily
                           //   round trip), spending their time where the food is — the field is their daily-mean place …
  FOOD0: 0.03,             // … each oxic cell weighted by its algae + this (non-migrants keep to the food; migrants spend only the
                           //   daylight hours in the cold dark water)
  O2_MIN: 0.12,            // normalised O₂ below which zooplankton die (ANOX_M /day at any temperature) and swim up out of it (AVOID /s)
  ANOX_M: 1.0, AVOID: 0.5,
  FLOOR: 0.002,            // g/cell: new arrivals — resting eggs blown in on dust, carried on birds' feet and in inflowing water — keep a
  FLOOR_RATE: 0.05,        //   trace of zooplankton in all oxic water ("everything is everywhere"); /s toward it
  // RESTING EGGS (env.zooEgg, g per column of bed): as the days shorten in autumn and the water cools, Daphnia switch to sexual
  // reproduction and lay ephippia, and many copepods enter diapause — the active plankton dwindles into an EGG BANK in the
  // sediment (thousands to millions per m², viable for decades); warming water and lengthening days hatch part of it in
  // spring. Overwintering adults (Daphnia at 0–2.5/L, copepods more) carry the rest (Cáceres 1998; Hampton et al. 2017:
  // under ice ~25 % of the summer stock)
  DORM_DAY: 0.5,           // day-length fraction below which, on shortening days, …
  DORM_T: 12,              // … in water colder than this (°C), the active zooplankton turn to resting stages at …
  DORM_D: 0.04, DORM_C: 0.015,   // … this share a day (Daphnia, copepods)
  EGG_EFF: 0.3,            // share of that mass that becomes viable resting eggs in the bank
  HATCH_T_D: 8, HATCH_T_C: 5,    // °C at the bed above which, on lengthening days, …
  HATCH: 0.005,            // … this share of the bank hatches a day (part of the bank each spring)
  EGG_LOSS: 0.2,           // /yr: eggs buried out of reach or dead
  EGG_START_D: 20, EGG_START_C: 10,   // g wet per column of bed at the lake's opening (≈ 2.4 and 1.2 g/m²)
  // DIEL VERTICAL MIGRATION — a daily-mean refuge from visual fish. A share f = DVM_MAX × B/(B + DVM_B50) of each kind migrates
  // (B = the lake's fish biomass, kg/ha: fish kairomones induce DVM and its amplitude grows with fish density — Hahn et al.
  // 2019) where the column is deep enough to hide in (REF_DEPTH … + REF_RAMP of the lake's depth: little protection with less
  // than ~6 m to migrate). Migrants meet fish only at twilight (TWILIGHT of a resident's exposure) and grow DVM_COST slower in
  // the cold dark water (Stich & Lampert 1981)
  DVM_MAX_D: 0.85, DVM_MAX_C: 0.4,
  DVM_B50: 50,
  REF_DEPTH: 0.3, REF_RAMP: 0.2,
  TWILIGHT: 0.15,
  DVM_COST: 0.3,
  // VISUAL FEEDING: fish see millimetre prey well in daylight, poorly in dim deep water and under snow-covered ice — the noon
  // light at the fish's depth, from VIS_I0 (blind) to VIS_I1 (full sight) on a log scale
  VIS_I0: 0.002, VIS_I1: 0.1,
  WEED_REF: 0.5,           // dense weeds hide this share of their zooplankton from fish (a structural refuge)
  // FEEDING on the exposed density over the 3×3 cells around the fish (µg dry/L). Adults: a TYPE-III (sigmoid) response, half
  // their zooplankton intake at K_ADULT — they switch to other food as it thins (Murdoch 1969), and in real lakes fish take
  // only ~10–30 % of the zooplankton's production and get ~50–65 % of their food from the bottom (Mills & Forney 1983; Vander
  // Zanden & Vadeboncoeur 2002): K_ADULT is calibrated to that budget (verify/zooflux2.mjs). Larvae and young fish: type II,
  // needing far denser prey (K_FRY: their growth falls below ~20–50 crustaceans/L — Breck 1997; Hoxmeier et al. 2004 — about
  // 30–75 µg/L of the small prey they take)
  K_ADULT: 25,             // (≈ 5 Daphnia/L; at 60 adults barely touched a typical 20–40 µg/L summer stock and starved)
  K_FRY: 30,
  Q: 1.0,                  // at saturating density an adult refills its gut with zooplankton at up to Q × its Cmax rate — catching thousands
                           //   of millimetre prey takes time, and fish carry 2–3× the digestive capacity they use (Armstrong & Schindler 2011);
                           //   field panfish eat 1–4 % of body weight a day in summer (Seaburg & Moyle 1964, bias-corrected). (At 2 the adults
                           //   ate at ~Cmax all June, stripped the zooplankton and starved from August; at 0.5 they couldn't hold their weight even
                           //   among plentiful zooplankton — FB4 bluegill break even near 0.55–0.65 of Cmax.)
  CROP: 0.3,               // a fish or school takes at most this share of the zooplankton within reach in one step
  FRY_DAPH_L: [0.6, 1.0],  // cm: fry take the cladoceran field fully from 1.0 cm, from first feeding only its small animals (FRY_DAPH_MIN:
  FRY_DAPH_MIN: 0.3,       //   Bosmina, Ceriodaphnia, newborn Daphnia) — first-feeding larvae of 4.5–6 mm eat nauplii, rotifers and small
                           //   cyclopoids, cladocerans from ~8–10 mm (Keast 1980; Siefert 1972) …
  // ROTIFERS AND NAUPLII (env.zooR): the microzooplankton — tiny, fast-breeding (r 0.3–1.4/day), the first food of every fish
  // larva (nauplii, rotifers and small cyclopoids of 0.1–0.3 mm at 4.5–6 mm — Keast 1980; Siefert 1972), too small for adult
  // fish, and not migrating. They carry the larvae through a Daphnia crash (2026-10-15: without them every young sunfish under
  // ~1.5 cm died when the year's cohort stripped the crustaceans in late July). Daphnia out-compete them (a lower food threshold)
  // and kill them by mechanical interference (Gilbert 1988).
  START_R: 0.3,            // g wet per cell (≈ 12 µg dry/L — rotifers are typically a tenth to a third of the crustaceans' biomass)
  G_R: 1.0, R_R: 0.2, M_R: 0.05, Q10_R: 2.5, K_R: 0.15,   // /day at 20 °C; zero growth at ~0.05 algae units (above Daphnia's)
  DAPH_INTERF: 0.05,       // /day extra rotifer mortality per g/cell of Daphnia (interference)
  M2_R: 0.3,               // /day per g/cell: density-dependent loss to their invertebrate predators (cyclopoid copepods, Chaoborus, Asplanchna) —
                           //   keeps them near ~50 µg/L in summer and a few in winter (rotifers seldom exceed ~100–300 µg/L; without it they
                           //   reached ~1,000 µg/L under the ice and out-competed the crustaceans)
  GR_R: 0.006,             // algae a gram of rotifers clears per sim-second at 20 °C on rich food (type II, K_R)
  FRY_ROT_L: [0.7, 2.0],   // cm: fry take them fully up to 0.7 cm, down to FRY_ROT_MIN of them by 2 cm (bigger fry pass up tiny prey)
  FRY_ROT_MIN: 0.2,
  FRY_COPE: 0.3,           // … and catch the copepod field's animals at this rate (nauplii easily, copepodites and adults seldom; an adult
                           //   fish: 1 − COPE_ESCAPE)
  BITE_MIN: 0.002,         // a zooplankton intake ≥ this × the gut's capacity in a step counts as a meal (learning, foraging)
  SENSE_MIN: 0.3,          // a fish notices a zooplankton patch at ≥ this × K_ADULT of exposed density
  COPE_ESCAPE: 0.5,        // chance a copepod's escape jump beats a fish's strike (fish catch 0.8–0.95 of the Daphnia they attack, 0.07–0.6
                           //   of copepods; lake herring 87 % of cladocerans, 49 % of copepods — Link 1996)
  SIGHT: 48,               // px: how far a fish can see a millimetre-sized zooplankter (a few body lengths), whatever its vision range
  // planktivore facultative omnivory: when it finds no zooplankton, a hungry planktivore grazes the phytoplankton field at a
  // low survival ration (real planktivorous fish are facultative algae and detritus eaters)
  FALLBACK_GRAZE: 1.32,    // phyto biomass a hungry planktivore clears per SECOND (× dt) when it finds no zooplankton
  FALLBACK_MIN: 0.18,      // per SECOND (× dt): grazing less than this in a step finds no meal
  get UGL() { return this.DRY * 1e6 / WORLD.CELL_L; },   // µg DRY per litre for 1 g WET per field cell
};

export const DETRITUS = {
  CAP: 220,                // reference-pond cap (auto-scaled by world area)
  SINK: 5,                 // px/s downward
  LIFE: 26,                // seconds before it decays into nutrient
  FROM_DEATH: 0.6,         // fraction of a dead fish's "mass" returned as detritus
};

// INSECT — aquatic insects close a missing trophic level with a CROSS-BOUNDARY life cycle. Benthic LARVAE (mayfly/midge
// nymphs) live on the bed as detritivores (recruited from the detritus pool), develop with WARMTH, and are eaten by
// bottom fish. When mature AND warm they EMERGE — rise to the surface as adult insects (a seasonal, pulsed HATCH) that
// surface fish rise to feed on; uneaten adults lay eggs (→ new larvae) before they expire, closing the loop. The hatch
// is the benthic→surface flux that's been missing. All deterministic (seeded RNG); particle systems like plankton/detritus.
// LARVAE GROW ON THE BED'S DETRITUS (SEDOM): a patch's grams grow by eating the organic layer of its column (Monod in it),
// with warmth, and shrink by respiration when there is too little — so benthic production follows the lake's productivity
// (real littoral benthos produce ~10–100 g wet/m²/yr; the turnover P/B 2–3 a year in the littoral, Lake Sevan). New
// patches start small (eggs from the emerging adults + a warm-season background).
export const INSECT = {
  LARVA_SEED: 160,         // initial benthic larval patches (× world area), full-grown (≈ 4.5 g wet/m² of benthos in May)
  LARVA_CAP: 400,          // max benthic larval patches (× area) — a computing bound, kept above what the food supports (at 240 it was
                           //   the limit itself: the patch count sat on it all summer)
  EPIPHYTE: 0.5,           // share of new larval patches that live on the macrophytes (the rest on the bed)
  LARVA_RATE: 6,           // /s new larval patches in the warm season (× area), where the bed has detritus to eat, capped
  LARVA_M0: 0.3,           // g: a new patch (young instars); it grows toward PREY.LARVA_G
  REFUGE_M: 1.0,           // g of every patch out of predators' reach — larvae burrowed in the mud, in tubes or cases (fish take the
                           //   exposed and the emerging; the burrowed stock regrows a grazed-down patch). A third of a full patch:
                           //   fish cut a patch's biomass by up to ~2/3 — fish-exclusion studies find 20–60 % less benthos with fish
                           //   (at 0.3 g the fish held every patch on its floor and benthic production fell to ~15 g/m²/yr)
  REFUGE_FRY: 0.05,        // g of a patch out of reach of YOUNG-OF-YEAR fish: fry pick the small early instars off the mud surface
                           //   (a 1-g refuge for fry starved the bullhead fry — 80–90 % of them died of hunger by July)
  get GROW() { return 0.3 / BIOE.DAY; },    // /s a patch's biomass growth at DEV_TEMP_OPT on ample food (0.3/day; chironomid larvae
                                            //   grow ~0.2–0.4/day at 20 °C; at 0.2 a patch only tripled before emerging and fish
                                            //   got next to none of it above the refuge)
  get RESP() { return 0.03 / BIOE.DAY; },   // /s weight loss of a starving patch at DEV_TEMP_OPT (respiration ~0.02–0.05/day)
  YIELD: 0.25,             // g of larvae per g of detritus eaten, wet (2026-10-15: 0.15 → 0.25, mid-range) (deposit feeders on fresh algal detritus: assimilation 30–50 % ×
                           //   net growth 30–60 % ≈ 0.1–0.3 by dry mass; ~2/3 of that wet, the larvae holding more dry matter)
  K_SOM: 150,              // g of detritus per column at which a patch grows at half its rate
  get DEV_RATE() { return 1 / (19 * BIOE.DAY); },   // /s development at DEV_TEMP_OPT: 26 days to emerge at 20 °C and ~40 at 15 °C
                           //   (Chironomus decorus reared from hatch: 50 % emerged at 26 days at 20 °C, 37 at 15 °C)
  O2_MIN: 0.05,            // bottom O₂ (normalised) below which larvae die off (chironomids tolerate hypoxia, not lasting anoxia)
  get ANOX_DEATH() { return 0.05 / BIOE.DAY; },   // /s death of a patch in that anoxia at 20 °C (0.05/day), × Q10 2 — Chironomus outlast
                                                 //   weeks of anoxia by anaerobic metabolism, longest in cold water (a winter under ice)
  EMERGE_M: 0.6,           // an emerging patch's adults keep this share of its mass (the shed larval/pupal skins)
  DEV_TEMP_MIN: 6,         // °C below which larvae don't develop or grow
  DEV_TEMP_OPT: 25,        // °C of fastest development
  HATCH_TEMP: 17,          // °C: a mature larva EMERGES only above this → warm-season pulsed hatches
  ADULT_CAP: 220,          // max surface adults (× area)
  ADULT_LIFE: 7,           // s adult surface lifespan
  ADULT_DRIFT: 9,          // px/s surface drift scale
  EGG: 0.6,                // fraction of expired (uneaten) adults that lay an egg → a new larva (closes the cycle)
};

// DRAGONFLIES (ODONATA) — predatory benthic NYMPHS live a year or two in the weedy shallows, ambushing insect larvae,
// zooplankton, tadpoles and fish fry with their hinged, extendable jaw; perch, sunfish, bass, catfish and the other
// larva-eaters eat them. A mature nymph climbs out on a warm early-summer day and emerges as an adult dragonfly that
// patrols low over the water hawking emerged insects and dips to lay eggs (→ new nymphs) before it dies. Deterministic.
export const ODONATA = {
  SEED: 10,                // initial nymphs (× world area), mixed ages
  CAP: 50,                 // max nymphs (× area)
  DEV_FULL: 0.4,           // years to mature if the water were 25 °C all year (in a real season ≈ 1–2 years)
  DEV_T: 8,                // °C below which nymphs barely develop
  EMERGE_T: 18,            // °C: a mature nymph emerges only in water warmer than this, by day (early summer)
  EAT_R: 8,                // px: strike reach of the extendable labium
  HUNT: 0.6,               // /s strike attempts (ambush; × warmth)
  BITE: 0.05,              // g of insect larvae a strike takes from a patch (a late-instar nymph eats ~0.1–0.25 g a day)
  FRY_MAX: 2.5,            // cm: the largest fish larva a nymph's labium can take (larvae and early fry only)
  CRAWL: 2,                // px/s
  CRYPTIC: 0.02,          // per-step chance a fish foraging over a nymph actually finds it (they hide among weeds and in the silt)
  SENESCE: 0.0003,         // /s background nymph mortality (≈ 60 % survive a year: they live 1–2 years as nymphs)
  ADULT_LIFE: 70,          // s an adult dragonfly lives (≈ a few weeks)
  FLY: 70,                 // px/s patrol speed low over the water
  HAWK_R: 14,              // px: it snatches emerged insects within this of its flight path
  EGG_RATE: 0.3,           // /s egg-laying dips (each a surviving nymph's worth of eggs, while under CAP)
  ADULT_CAP: 12,           // max adults on the wing (× area)
  VISIT: 0.02,             // /s chance an adult flies in from other waters in the warm season (strong fliers that colonize ponds)
  VISIT_YF: [0.28, 0.5],   // year-fraction window of the flight season (June → August)
};

// FROGS (green/leopard frogs) — AMPHIBIANS with two lives: TADPOLES graze algae in the warm shallows and grow through the
// summer (late ones overwinter as tadpoles, as green-frog tadpoles do); they metamorphose into FROGS that float at the
// surface over the shallows snapping up emerged insects, dive to the bottom when a predator comes near, breed in spring
// when the shallows warm to ~10–20 °C, and hibernate on the bottom of the shallows under the ice. Bass, pike and perch eat
// tadpoles and frogs that fit their gape; sunfish and minnow-sized fish take small tadpoles; dragonfly nymphs take tadpoles.
export const FROG = {
  SEED: 6,                 // initial adult frogs (× area)
  CAP: 12,                 // max adult frogs (× area)
  TAD_CAP: 140,            // max tadpoles (× area)
  BREED_T: [10, 20],       // °C window of the shallows in which frogs spawn (spring)
  CLUTCH: 10,              // tadpoles per spawning (an egg mass of thousands, most of which die as eggs)
  BREED_RATE: 0.03,        // /s chance a ready adult spawns while in the window (then waits for next spring)
  MATURE: 1,               // years to maturity (as a frog)
  LIFE: 5,                 // years: maximum life
  TAD_DEV_FULL: 0.12,      // years to metamorphose if the water were 25 °C (in a real summer ≈ 2–3 months)
  TAD_DEV_T: 10,           // °C below which tadpoles barely develop
  TAD_GRAZE: 0.003,        // phyto a tadpole grazes /s
  TAD_VALUE: 6,            // energy per unit phyto grazed
  METAB: 0.0016,           // energy /s at 20 °C (Q10 2.2 — near zero in winter)
  EAT_R: 12,               // px: a frog's tongue reach for an emerged insect
  INSECT_E: 0.12,          // energy per insect
  SHORE_FOOD: 0.0018,      // energy /s at 20 °C from foraging along the shore while at the surface (mostly land insects)
  DEPTH_TAD: 1.6,          // cm body depth of a ranid tadpole — what must fit a fish's gape
  DEPTH_FROG: 3.5,         // cm (an adult green/leopard frog's body; half that just after metamorphosis)
  MASS_TAD: 4,             // g wet: a tadpole near metamorphosis (~3–8 g)
  MASS_FROG: 40,           // g wet: an adult frog (green ~30–80 g, leopard ~20–60 g); a quarter of that as a new froglet
  DIVE_R: 70,              // px: a frog dives when a piscivore it could fit is this close
  SWIM: 18,                // px/s
};

// TURTLES (painted turtle) — a long-lived OMNIVOROUS reptile: it paddles slowly between the bottom and the surface (it must
// breathe), basks at the surface on sunny days, grazes water plants and eats snails, insect larvae and carrion, and spends
// the winter buried in the mud of the shallows, cold and still, breathing through its skin. Eggs are laid on land, so
// hatchlings enter the lake in late summer; a pike or bass can take a hatchling, nothing in the lake takes an adult.
export const TURTLE = {
  SEED: 2,                 // initial adults (× area)
  CAP: 7,                  // max turtles (× area)
  MATURE: 6,               // years
  LIFE: 30,                // years
  HATCH: [0.42, 0.5],      // year-fraction window hatchlings enter the lake (late summer)
  HATCH_RATE: 0.005,       // /s per mature turtle in the window (once a year)
  CLUTCH: 3,               // hatchlings that reach the water
  ACTIVE_T: 10,            // °C: below this it's torpid; in winter it hibernates on the bottom of the shallows
  SWIM: 14,                // px/s
  DIVE: [25, 60],          // s foraging below between breaths
  BASK: [8, 20],           // s at the surface (longer in sunshine)
  EAT_R: 12,
  METAB: 0.0008,           // energy /s at 20 °C (Q10 2.2); reptiles are thrifty
  SNAIL_E: 0.12, LARVA_E: 0.08, DETRITUS_E: 0.06,   // energy per snail / insect larva / bit of carrion or plant debris
  DEPTH_HATCH: 2.6, DEPTH_ADULT: 13,   // cm shell width: a hatchling fits a big pike's or bass's gape, an adult nothing's
  MASS_HATCH: 4.5,         // g wet: a painted-turtle hatchling (~3.5–5 g)
};

// SNAIL — benthic gastropod GRAZERS. A snail crawls slowly over the lit bed scraping attached algae (periphyton;
// modelled here as a gentle local draw on the phytoplankton field near the bed — we don't track periphyton
// separately). Recruitment tracks the algae base (food → fecundity), so snails BLOOM after an algal bloom and
// thin out in lean/cold water. They are an abundant forage item: molluscivorous SUNFISH & CARP eat them, and
// CRAYFISH prey on them heavily → phyto → snail → {sunfish, carp, crayfish}. Particle system like the insects
// (one snail = one particle); all deterministic (seeded RNG). Eaten opportunistically (no dedicated brain sense).
// SNAILS — pulmonate pond snails (Physa, Lymnaea, Helisoma): they scrape the algae-and-detritus film of the lit bed (the
// SEDOM layer), live about a year and breed through the warm months — food for sunfish (pumpkinseed are snail specialists),
// carp, bullheads, crayfish and turtles. One particle = one ~0.4-g snail (PREY.SNAIL_G). (Before: a 34-day life on the phyto
// field near the bed, ~0.1 g/m² — a tenth to a hundredth of a weedy shallows' snail stock.)
export const SNAIL = {
  SEED: 120,               // initial snails (× area: ~800 ≈ 0.3 kg in May)
  CAP: 900,                // capacity (× area: ~6,000 ≈ 2.4 kg ≈ 3 g/m² lake-wide, ~10 g/m² on the shallows; littoral snail stocks run
                           //   ~1–30 g/m², and a lymnaeid population produced 137 g/m²/yr at P/B ~16 — Radix, Lake Dianchi)
  R: 6,                    // per-capita recruitment /yr in warm water × the food where the young settle (logistic toward CAP)
  R_T: [12, 20],           // °C: breeding ramps up from 12 to 20 °C (egg masses through late spring and summer)
  M: 1.2,                  // natural mortality /yr — about a year's life (Physa gyrina lives 12–13 months in the field)
  K_SOM: 150,              // g of the bed layer per column at which a young snail settles with even odds
  get GRAZE() { return 0.01 / BIOE.DAY; },   // g wet of the bed layer a snail scrapes a second at 20 °C (× Q10 2): ~1 mg ash-free dry
                           //   mass a day — snails remove 0.1–2.2 mg AFDW a day each, by size, temperature and food
  get STARVE() { return 0.05 / BIOE.DAY; },  // /s death of a snail the layer can't feed (they last weeks unfed)
  MAX_DEPTH: 0.5,          // they keep to the lit littoral bed (× the lake's depth); deeper ones crawl back up
  REFUGE: 0.12,            // share of CAP that shelters among the weeds and stems, out of reach of fish, crayfish and turtles (pumpkinseed
                           //   and crayfish can strip a bed of snails — Brönmark et al. 1992, Lodge et al. 1994 — but the weeds keep a stock)
  FLOOR: 6,                // tiny refuge floor (× area): top up below this (never quite vanish)
  CRAWL: 1.4,              // px/s crawl speed along the bed
};

// CRAYFISH — large benthic OMNIVORE / scavenger and a keystone forage item. A crayfish walks the bed (drifting toward
// the nearest cover, and CREPUSCULAR — more active at night), scavenging the detritus rain (recruitment is gated by
// detritus availability, like the insect larvae) and PREYING on snails (the signature crayfish→snail link + snail
// population control). It is in turn a prime forage for predatory fish: BASS, PIKE & CATFISH eat crayfish →
// detritus + snail → crayfish → {bass, pike, catfish}, giving the chronically-rare piscivores a benthic prey base.
// Particle system (one crayfish = one particle); deterministic (seeded RNG); eaten opportunistically on the bed.
// Crayfish are a lake's big benthic omnivores and the largemouth bass's staple: in three Michigan lakes O. virilis stood at
// 46–213 kg/ha and produced 60–142 kg/ha a year (P/B 0.94–1.53, Momot & Gowing 1977); crayfish were 55 % by weight of all
// a Wisconsin flowage's bass ate April–October, and 80 % of bass prey in June in another Wisconsin lake. Each crayfish here
// is one ~12-g animal (PREY.CRAY_G); their numbers follow a seasonal logistic toward a shelter-limited carrying capacity.
export const CRAYFISH = {
  SEED: 48,                // initial crayfish (× world area) — ~0.6 of the carrying capacity: a lake's crayfish stand near equilibrium
  CAP: 80,                 // carrying capacity (× area → 540 × 12 g ≈ 6.5 kg ≈ 9 g/m² over the ~700-m² slice; 4.6–21 g/m² measured)
  R: 8,                    // per-capita recruitment /yr at low density in the warm season (logistic): recruitment runs ~40 % of the
                           //   year, so production near the usual stock is ~1–1.5× it a year, as measured
  R_T: [10, 20],           // °C: recruitment (young released, juveniles growing) ramps from 0 at 10 °C to full at 20 °C
  M: 0.8,                  // natural (non-fish) mortality /yr — a 2–4-year life (replaces the old 0.004/s ≈ a 25-day life)
  WIDTH: 2.2,              // cm: a ~12-g crayfish's body width — it fits only a gape at least this wide (a big bass, pike, bullhead
                           //   or perch; small perch take only the small juveniles, which these adults stand for less)
  ACT_T: [4, 12],          // °C: crayfish are dormant in their burrows in cold water — exposure to fish ramps in from 4 to 12 °C
  SHELTER: 0.4,            // SHELTER-LIMITED: burrows and stones for this share of the carrying capacity; the oldest crayfish hold
                           //   them (bigger crayfish win shelter contests, Capelli & Munjal 1982) and are out of fish reach, the rest
                           //   — mostly the young — are exposed (unsheltered crayfish suffer far higher predation: Stein & Magnuson
                           //   1976, Hill & Lodge 1994). The stock can't be eaten below the shelter it holds
  SHELTER_DAY: 0.7,        // share of the crayfish sheltered in burrows and under stones by day (they forage at night — and hide
                           //   more when fish are about, Stein & Magnuson 1976); a fish's strike success is the species' diet.cray
  MAX_DEPTH: 0.55,         // crayfish live on the littoral and sublittoral bed down to this × the lake's depth (~8 m; trapped out
                           //   to ~9 m in Michigan lakes, Momot & Gowing 1977) — not on the deep, summer-hypoxic profundal floor
  CRAWL: 4,                // px/s base crawl speed along the bed
  NIGHT: 1.7,              // crepuscular: crawl/forage activity multiplier at night vs day
  COVER_PULL: 0.5,         // how strongly a crayfish steers its crawl toward the nearest cover (refuge-seeking)
  EAT_R: 15,               // px reach to catch a snail
  SNAIL_HUNT: 0.3,         // /s a crayfish tries for a nearby snail (× night activity) — ~one a day: crayfish eat ~1–3 % of their
                           //   mass a day, and snails are a part of a broad omnivore's diet (they do strongly cut snail stocks)
};

export const PLANT = {
  CLONAL: 0.75,            // share of new shoots that are RUNNERS from an established plant (the rest are seeds)
  RUNNER: [6, 26],         // px: how far a runner roots from its parent (beds expand as patches)
  DORMANT_T: 6,            // °C: colder than this at its base, a macrophyte is DORMANT (rootstock/turions) — it can't starve of light
  RESP_Q10: 2.0,           // night-respiration temperature dependence (×1 at 20 °C) — dormant winter plants barely respire
  MAX: 120,                // reference-pond cap (auto-scaled by world area)
  SEED_RATE: 3.4,          // new plants /s up to MAX (scaled by area) — gated by seasonal vigor (mostly spring/summer)
  GROWTH: 20,              // height units /s at full light, nutrient & seasonal vigor (per-plant max height: MACRO[v].maxH × the maxH gene)
  BIOMASS_PER_PX: 0.018,   // biomass = height * this
  LITTER_G: 6,             // g of labile litter a drawn plant (a clump of shoots) drops on the bed per px of height it sheds or
                           //   loses dying (macrophyte litter is a large share of a weedy littoral's sediment food; SEDOM): ~30 % of the
                           //   default lake's labile input (its plants shed ~40,000 px a year)
  BITE_RATE: 300,         // px of plant height a grazing herbivore removes per SECOND (× dt) — = the old 5 px/step at the
                           //   browser's 1/60 step (per-step bites made grazing dt-dependent: half the rate headless at 1/30)
  GRAMS_PER_PX: 0.02,      // g wet plant tissue a herbivore swallows per px of height grazed (× the plant's palatability:
                           //   tough, defended forms yield less)
  // SEASONAL PHENOLOGY: macrophytes grow in the warm season, senesce (die back) in autumn → a fall detritus/DOM pulse,
  // and overwinter as rootstock — driven by the LOCAL water temperature (env.tempAt), so a warmer climate lengthens the
  // growing season (a climate-scenario lever) and the cold/dark deep can't support tall beds (an emergent depth limit).
  GROW_TEMP_MIN: 14,       // °C below which growth stops & die-back dominates (winter / cold deep)
  GROW_TEMP_OPT: 23,       // °C at/above which the seasonal growth factor (vigor) is full
  SENESCE: 0.05,           // /s die-back rate, scaled by how far below the growth window (autumn/winter shedding)
  WINTER_MIN: 6,           // px rootstock/rhizome height — senescence AND grazing both floor here (below-sediment, survives
                           //   winter & grazing → the perennial regrows in spring). Plant death is now light-starvation, not grazing.
  SHADE_DEATH: 0.05,       // /s uproot rate when light-starved → deep/turbid beds die back, freeing bed slots for the lit littoral
                           //   (the light-starvation threshold is per variety: MACRO[v].lightMin × the plant's light/leaf genes)
  // Starvation is judged on each plant's RUNNING-MEAN light `p.lightAvg` (an EMA of its effective top-of-plant light),
  // NOT the instantaneous value — otherwise every plant is "starving" all night (light = 0) and beds churn. A seed only
  // ESTABLISHES where the mean light expected at its top (DAY_MEAN_LIGHT × depth attenuation × canopy shade) meets its
  // lightMin (seeds under a closed canopy or in the dark deep fail), and its EMA starts at that expectation.
  LIGHT_TAU_DAYS: 1.5,     // EMA time constant in day/night cycles (→ LIGHT_TAU s) — smooths the diel cycle + passing weather
  get LIGHT_TAU() { return this.LIGHT_TAU_DAYS * TIME.DAY_LEN; },
  DAY_MEAN_LIGHT: 0.20,    // long-run mean surface light: the daylight half-sine averages 1/π over a day/night cycle, × ≈0.64
                           //   mean sky clearness (1 − ENV.CLOUD_COVER weighted by the weather chain's time in each state)
};

// MACROPHYTE VARIETIES — the real submerged/floating growth forms. Each dynamic plant (world.plants) is ONE of these,
// chosen by its rooting depth (`zone` = bed-depth fraction: 0 = the shallow shelf … 1 = the deep basin). They differ in
// depth zone, size, growth/cover/O₂, palatability (grazing value), shade/turbidity tolerance (`lightMin`, the
// light-starvation death threshold) and cold tolerance (`tempMin`, the seasonal growth threshold), and how they render
// (`form` + `hue`). PLANT.* holds the rates shared by every form (growth, senescence, grazing, seeding). *(Emergent reeds + the tall
// static cover weedbeds remain separate structures; free-floating duckweed — a drifting surface mat — is a follow-up,
// it needs surface-drift mechanics.)* The per-plant trait EVOLUTION slice mutates these values per individual.
// `zone` = the rooting bed-depth fraction (bedY/H), which spans ~0.25 (shallow shelf) → ~0.99 (deep basin centre).
// `lightMin` is on the RUNNING-MEAN light scale (p.lightAvg: day+night+weather average of lightAtDepth at the plant top;
// the surface mean is PLANT.DAY_MEAN_LIGHT ≈ 0.20) — re-calibrated (÷π) from the old instantaneous-noon thresholds, so
// it is ~4% (milfoil) / 6% (pondweed) / 9% (lily) / 22% (chara) of the surface mean. With summer turbidity (~0.3) that
// puts the depth limit near bed-depth ~0.6–0.7 for pondweed and ~0.7–0.8 for milfoil (deeper in clear winter water).
export const MACRO = [
  // key            name            zone (bed depth, m — 2026-10-15: Maine zonation; was fractions of the old lake's H)   maxH (px)   grow  cover o2    palat lightMin tempMin hue  form
  { key: 'pondweed', name: 'Pondweed',   zone: [0.4, 4.5],  maxH: [34, 70], grow: 1.0, cover: 1.0, o2: 1.0, palat: 1.0, lightMin: 0.013, tempMin: 14, hue: 128, form: 'stalk' }, // common submerged, shelf→drop-off
  { key: 'milfoil',  name: 'Milfoil',    zone: [1.5, 6.0],  maxH: [46, 82], grow: 0.9, cover: 1.3, o2: 1.1, palat: 0.5, lightMin: 0.008, tempMin: 13, hue: 146, form: 'stalk' }, // dense, deep, shade-tolerant, tough (low palat)
  { key: 'lily',     name: 'Water lily', zone: [0.4, 2.5],  maxH: [24, 46], grow: 1.0, cover: 1.2, o2: 1.2, palat: 0.8, lightMin: 0.019, tempMin: 17, hue: 108, form: 'pad' },   // floating-leaved, shallow, warm, broad leaves
  { key: 'chara',    name: 'Muskgrass',  zone: [0.3, 4.0],  maxH: [8,  22], grow: 0.7, cover: 0.6, o2: 0.9, palat: 0.9, lightMin: 0.045, tempMin: 12, hue: 80,  form: 'mat' },   // low benthic mat, needs CLEAR water (turbidity-sensitive), cool-tolerant
];

// PLANT INTERACTIONS — SHADING COMPETITION between macrophytes. A TALLER plant within RADIUS cuts a shorter
// neighbour's effective light by exp(-SHADE · overhead), overhead = Σ(taller-neighbour cover × horizontal falloff)
// → a stratified canopy + self-thinning of dense beds, and (since the per-plant `light` requirement gene sets the
// light-starvation threshold) it SELECTS for shade-tolerance & for HEIGHT under a closed canopy — an emergent eco-evo
// interaction with the plant genome.
//   *(The other arm of plant interactions — the macrophyte↔phytoplankton clear↔turbid alternative-stable-states
//   feedback — is deferred to the Phase-5 regime-shift work: in a closed, mass-conserving, P-limited lake a simple
//   per-column nutrient draw is compensated/saturates, so a CORRECT clear-water arm needs a tracked macrophyte-P
//   biomass stock + bistability/hysteresis validation. The existing turbidity→light-starvation arm is already in place.)*
export const COMPETE = {
  RADIUS: 22,        // px: horizontal range over which a taller plant shades a shorter neighbour
  SHADE: 0.6,        // shading strength per unit overhead cover  (effLight = light · exp(-SHADE · overhead))
};

// SCHOOL — predator-confusion / dilution. A prey tucked in a dense shoal of its OWN species is harder to single out,
// so a predator's effective strike reach shrinks with the prey's local conspecific density (0..1, from allyStats).
// This makes the innate schooling cohesion ADAPTIVE — it pays off against predation, so tight shoals are SELECTED for
// (emergent, not scripted). Stacks with the reeds/weeds cover refuge.
export const SCHOOL = {
  DILUTE_R: 44,      // px: radius over which a prey's same-species neighbours count toward its shoal density
  DILUTE: 0.5,       // max fraction the predator's strike reach is cut when the prey is in a fully dense shoal
};

// ACTION — the brain-GATED action space (beyond steer + thrust). Each fish's net emits three extra 0..1 "intents" —
// STRIKE (predatory lunge), FLEE (escape sprint), HIDE (freeze + seek cover) — that the move/feed steps turn into
// VISIBLE behaviour. They're continuous (not a hard argmax) so neuroevolution searches a smooth landscape, and they
// trade off through their effects (hide kills the thrust strike/flee need; strike/flee burn energy) so a brain can't
// max all three. Started ~OFF at init (negative output bias in randomGenome) → a fresh lake swims at the old baseline
// and evolves these where the prey/predator senses make them pay. All deterministic (no RNG in the effects).
export const ACTION = {
  STRIKE_BURST: 0.7,   // a full strike drives thrust toward 1 (a committed lunge)
  STRIKE_REACH: 0.6,   // …and EXTENDS the predator's eat reach by up to +60% (takePrey) — the snatch at the end of a lunge
  FLEE_BURST: 0.9,     // a full flee drives thrust toward 1 (a panic sprint)
  BURST_SPEED: 0.35,   // strike/flee also lift the speed cap by up to +35% → a sprint briefly exceeds cruise speed
  HIDE_STILL: 0.85,    // a full hide suppresses thrust by this much (freeze — hold position)
  HIDE_COVER: 0.6,     // …and steers toward the nearest cover (reed/log/weed bed) to hold in it
  HIDE_CONCEAL: 0.5,   // a freezing/hiding prey shrinks a predator's strike reach by up to this (harder to detect/catch)
  ENGAGE: 0.35,        // an intent below this has NO effect or cost; above it the action ramps in (world.js engaged())
  GATE: 0.5,           // an intent above this "fires" (used for the hide cover-steer trigger & the inspector's dominant-act readout)
};

// MOTION — locomotion MOMENTUM so fish carve through turns instead of pivoting on a dime (real fish have inertia). The
// body points along `heading` (the NN steers it); the actual TRAVEL direction `velHeading` eases toward heading at
// TURN_RESPONSE, slowed at speed (SPEED_LAG) so a fast fish carries momentum and drifts wider through a turn. And a hard
// turn SCRUBS forward speed (TURN_DRAG) — you can't bank sharply at full tilt. All deterministic (no RNG); render reads
// `heading` for the body so the fish visibly crabs/banks through a fast turn. Complements turnAuth (which caps turn RATE).
export const MOTION = {
  TURN_RESPONSE: 7.0,  // /s rate the travel direction realigns to the body heading (lower → more drift / wider carve)
  SPEED_LAG: 0.6,      // fraction that realignment SLOWS at top speed (fast fish carry more momentum → drift more)
  TURN_DRAG: 0.14,     // forward speed bled per radian of turning this frame (a sharp turn scrubs speed; kept gentle so chasing predators aren't crippled)
  // BURST-AND-COAST — real fish pulse the tail then GLIDE rather than holding steady thrust. The delivered thrust is
  // modulated by a per-fish stroke oscillation that is ZERO-MEAN (a cosine) → the cycle-average ≈ the brain's intent,
  // so it's ~balance-neutral; the momentum model carries the fish through each glide. Suppressed during a flee/strike
  // sprint (those swim flat-out) and when barely swimming. Deterministic (stroke advanced by dt, per-fish phase offset).
  COAST_DEPTH: 0.35,   // depth of the thrust pulse around the intent (0 = steady thrust; 0.35 → swings ~±35% over a stroke — a
                       //   gentle surge-and-glide; ±65 % read as twitchy jerks)
  COAST_RATE: 1.1,     // stroke cycles per second while cruising (scaled up a little with speed)
  // RHEOTAXIS — a fish turns into a current and holds its station against it (positive rheotaxis, the lateral line): a
  // current carries it only by what exceeds RHEO × its top cruising speed (× its cold performance) — a shiner holds against
  // a lake's wind drift, an April stream in spate carries small fish down. Fry schools drift on their own (FRY).
  RHEO: 0.15,
};

// DRIVE — INTERNAL STATE / motivation. Persistent per-fish drive scalars (0..1) fed back as the last brain INPUTS, so a
// fish's behaviour depends on its own internal state, not just its surroundings (a starving fish takes risks a sated one
// won't; a recently-scared one stays cautious). They are PERCEPTION (the brain decides what to do with them — emergent,
// not scripted) and feed the gated action space (strike/flee/hide). HUNGER is an appetite drive (rises with time since a
// meal, sated by eating — distinct from the instantaneous energy LEVEL the brain already senses). FEAR jumps to the
// nearest-threat proximity and decays after the threat leaves (lingering caution). Deterministic; see world.js move step.
export const DRIVE = {
  FEAR_DECAY: 0.5,     // /s exponential decay of fear once no threat is near (recently-scared fish stay cautious a while)
};

// LEARN — LIFETIME LEARNING (within-life neural plasticity). The brain's POLICY layer (the hidden→output weights, W2) is
// PLASTIC during a fish's life: a 3-factor REWARD-MODULATED HEBBIAN rule reinforces the hidden→action links that were active
// when the fish ATE (reward), so it gets better within its life at repeating what fed it — a fish ADAPTS before its lineage
// does. It is BALDWINIAN, not Lamarckian: learning acts on a per-fish PLASTIC copy `a.lw` (what `forward` runs); the inherited
// GENOTYPE `a.g` is never touched, so offspring inherit the EVOLVED brain, not the learned weights (acquired traits aren't
// inherited — the Baldwin effect: learning guides evolution without passing on the learned state). Bounded & safe: a
// HOMEOSTATIC decay pulls the plastic weights back toward the genotype (so unreinforced changes fade → transient adaptation),
// and a hard clip caps them — the policy stays near the evolved baseline, just nudged by recent success. Pure/deterministic
// (a function of activations + the eat-reward, NO RNG). `a.lw` is transient (re-derived from the genotype on load).
export const LEARN = {
  RATE: 0.03,          // reward-modulated Hebbian step on W2 per eat (small → a gentle nudge, not a rewrite)
  DECAY: 0.5,          // /s homeostatic pull of the plastic weights back toward the inherited genotype (transient, bounded adaptation)
  CLAMP: 4,            // hard clip on the plastic weights (matches the mutate clamp) — absolute safety bound
};

// BRAIN — EVOLVABLE BRAIN SIZE + a per-neuron metabolic cost (the encephalization trade-off). The heritable `brain` gene
// (core.js GENE_KEYS) sets how many of a species' hidden units are ACTIVE: activeHid = clamp(round(shape.hid · brainGene),
// HID_MIN, shape.hid). The surplus units are MASKED inert in forward(), and a SMALLER brain is metabolically CHEAPER (a
// per-neuron SAVING vs the full-brain baseline, folded into metabMul) — so a lineage in a simple niche evolves a smaller,
// thriftier brain, while one that needs complex cognition keeps the full net (their hidden units have to EARN their cost in
// extra food). At brainGene ≈ 1.0 the full layer is active and the saving is 0 → a fresh lake = the pre-slice baseline.
// *(This is the SHRINK direction of NEAT — masking within the fixed per-species max. Growing the layer BEYOND the species
// max — true variable-topology NEAT with structural mutation — needs variable-length genomes and is deferred.)*
export const BRAIN = {
  DECIDE_HZ: 30,          // decisions (sense + think) per second — a fish's reaction time ≈ 33 ms; movement still integrates every step
  HID_MIN: 4,          // floor on active hidden units (a brain can shrink, but keeps a minimum of compute)
  COST: 0.22,          // max metabolic SAVING (fraction of metabMul) for a fully-masked brain vs the full-brain baseline
};

// TOX — a persistent CONTAMINANT (e.g. mercury / PCB) that BIOMAGNIFIES up the food chain. Each fish carries a body
// burden `a.tox` that rises from (1) gill uptake of the dissolved toxicant, (2) a small dose per base-food meal
// (plankton/plant/detritus), and (3) — the key — ASSIMILATING its fish PREY's whole accumulated burden when it eats
// one; it falls only by SLOW first-order excretion. Because elimination lags dietary intake, the burden CONCENTRATES
// at each trophic step → apex pike/bass carry the highest load (the real mercury story). Above HARM it raises mortality.
// AMBIENT = 0 ⇒ a CLEAN lake: every term is ×0 and the harm check short-circuits, so this is INERT by default — a
// SCENARIO sets AMBIENT > 0 (a pollution pulse) to study how a contaminant moves through the lake (the research lever).
export const TOX = {
  AMBIENT: 0,        // dissolved waterborne toxicant level (0 = clean lake; a scenario sets it > 0)
  GILL: 0.01,        // /s gill uptake of the dissolved toxicant per unit ambient
  FOOD: 0.02,        // body burden gained per base-food (plankton/plant/detritus) meal per unit ambient
  ASSIM: 0.8,        // fraction of a fish PREY's accumulated burden assimilated when eaten → biomagnification
  EXCRETE: 0.008,    // /s slow first-order elimination (slower than intake → the burden concentrates up the chain)
  HARM: 3.0,         // body burden above which the toxicant raises mortality (the LETHAL end)
  MORT: 0.03,        // /s extra mortality hazard per unit burden above HARM
  // SUB-LETHAL: reproductive impairment bites at a LOWER burden than mortality — the classic bioaccumulant concern
  // (PCBs / endocrine disruptors cut fecundity well before they kill). A contaminated fish's breeding chance is scaled
  // down above REPRO_HARM (and reaches 0 — effective sterility — before/around the lethal HARM threshold).
  REPRO_HARM: 1.0,   // burden above which fecundity starts to fall
  REPRO_CUT: 0.5,    // fraction of fecundity lost per unit burden above REPRO_HARM (→ sterile exactly at HARM=3.0)
};

// reference-pond starting counts for the three resource fields (auto-scaled by area)
export const SEED_COUNTS = { plankton: 210, plants: 92, detritus: 28 };
// (the old SEED_FROM_BEST_CHANCE and IMMIGRATION.FROM_BEST are retired — immigrants come from the regional gene pool)

// ---------- carrying capacity & metapopulation rescue (Phase 5 — replaces the hard pop floor & cap) ----------
// Populations are now LOGISTIC + rescued, not hard-clamped:
//   • Reproduction tapers smoothly to zero as a species approaches its carrying capacity K (= pop.max,
//     area-scaled) — classic density-dependent fecundity (rand() < 1 − N/K) — instead of a hard cap cutoff.
//     NB: the planktivore boom-bust is mainly FOOD/SEASON-driven (the zooplankton crash), so this density term
//     only damps the very TOP of the boom; the real lever for a steadier oscillation is the food base (FLOW.NUTRIENT
//     / PHYTO), not K. (`npm run balance` prints a per-species CV so "steadier" is measured, not assumed.)
//   • The old "snap to a hard floor every step" re-seed is replaced by METAPOPULATION IMMIGRATION — a low
//     stochastic trickle of fish from connected waters whose rate RISES as a species falls below its rescue
//     threshold and tapers to ZERO above it (the ecological "rescue effect"). Self-sustaining species (catfish,
//     carp, well-fed minnow) float free of it; a struggling apex predator (which genuinely can't self-sustain
//     in a small lake) gets a gentle, believable trickle from the margins rather than an instant artificial refill.
// Diagnostic (floors off, 3 yr): catfish/carp self-sustain; minnow/sunfish boom-bust; bass/pike chronically rare.
// Immigration engages only when a species is genuinely RARE (below RESCUE_N — a low rarity threshold, NOT the old
// population target of ~42), so abundant/self-sustaining species float completely free of it and only the
// boom-bust troughs + struggling apex predators are rescued. A minimal REFUGE guarantees no literal extinction
// (a tiny last-resort refuge population — far below the old hard floor), without pinning the population at a target.
export const IMMIGRATION = {
  RESCUE_N: 3,         // immigration engages below this many individuals (a rarity threshold, not a pop target)
  REFUGE: 2,           // absolute quasi-extinction backstop: never let a species literally vanish (≪ the old floor)
  RATE: 0.05,          // immigrants/s per species at zero population (a rare trickle from connected waters; → 0 at RESCUE_N)
  POOL_N: 12,          // genomes per species in the REGIONAL gene pool immigrants are drawn from (connected waters)
  EMIGRATE: 0.02,      // /s per species: chance a random lake adult's genes join the regional pool (gene flow out)
};

// ---------- evolution history (the visible record of natural selection) ----------
// A long, low-rate record of every species' heritable traits (`world.evo`): every EVO.SAMPLE s, per species, the number
// of fish, their mean generation, and the mean and standard deviation of each of the 7 trait genes (GENE_KEYS) — so the
// UI can draw how the lake's fish evolve over years and decades (and the spread selection works on). Thinned (every other
// sample of the older half dropped) when it reaches EVO.MAX, so it always spans the whole run. Read-only for the sim.
export const EVO = {
  get SAMPLE() { return TIME.YEAR_LEN / 24; },   // s between samples (twice a month)
  MAX: 960,                // samples kept (40 years at full resolution; older ones thinned beyond that)
};
