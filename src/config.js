// config.js — all tunable constants for the world & environment (no species here).
//
// SCALING MODEL (Phase 0): the world is now much larger than the screen and is
// explored through a camera. Every population/resource number below is a *density*
// expressed for a reference 760×460 pond; the sim multiplies them by WORLD.AREA_SCALE
// so a bigger lake is automatically more populated at the same per-area balance.
// To grow (or shrink) the whole lake, change only WORLD.W / WORLD.H.

const REF_W = 760, REF_H = 460;            // the reference pond all densities are tuned for
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = s => { s = clamp(s, 0, 1); return s * s * (3 - 2 * s); };

export const WORLD = {
  W: 2048,           // internal sim width  (≈16:9 lake; ~6.7× the reference area)
  H: 1152,           // internal sim height
  REF_W, REF_H,
  get FLOOR() { return BASIN.DEEP_Y * this.H; },  // deepest point of the lake bed
  get AREA_SCALE() { return (this.W * this.H) / (REF_W * REF_H); },
  get GLOBAL_MAX() { return Math.round(150 * this.AREA_SCALE); }, // hard cap on total agents
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
  AGG_SEASON: 0.5,   // the species' seasonal factor must exceed this (≈ the central part of its spawning season)
  // (and the fish must be breedReady)
  GROUND_X: 0.09,    // spawning-ground centre as a fraction of lake width from each shore (mid-littoral shelf)
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
  MISS_CD: 0.5,     // s a piscivore recovers after a missed strike before it can strike again (species.js `capture` = success)
  PREY_MIN: 0.07,   // a piscivore ignores fish shorter than this fraction of its own length (not worth the chase). Real
                    //   piscivores mostly eat prey well below their gape: a 65-cm pike's MEDIAN prey is ~7 cm (Gaeta et al.
                    //   2018: 5.05·TL^0.413 mm), so big pike do eat minnow-sized fish; larvae are left to the small fish
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
  N_PER_AGENT: 3,      // survivors per recruited individual
  MAX_RECRUITS: 12,    // recruits one school yields at most
  TICK: 0.2,           // s between a school's feeding / physiology / mortality updates (staggered across schools; each
                       //   integrates the time elapsed — the schools' cost is a fraction of a step)
  EAT_R: 40,           // px a school forages over
  SEEK_R: 160,         // px: a school moves toward the nearest food it eats within this
  FEEDS: 6,            // food patches a school crops per update at most
  R_WMIN: 0.1,         // g: below this a larva's mass-specific respiration is held at this mass's (larval metabolism scales
                       //   ~isometrically — Oikawa et al. 1991, Post & Lee 1996 — where FB4's W^RB, fit to bigger fish, would
                       //   give a 1-mg bass larva ~2,300 J/g/day, several times the measured larval rates)
  BENTH_L: 2.5,        // cm: young fish this long also forage the bottom (insect larvae; detritus for the bottom feeders)
  M_LARVA: 0.02,       // /day extra natural mortality of the youngest larvae at 1 cm (∝ 1/length, fading out by ~3 cm:
                       //   the "critical period" — first-feeding larvae lose 5–30 %/day in the field, most of it to the
                       //   predators and starvation the lake simulates; this is the unsimulated rest: disease, deformity,
                       //   failed first feeding). Past it the schools die at the agents' size-scaled share of the species'
                       //   M (BIOE.M_OTHER; Lorenzen 1996)
  SWIM: 8,             // px/s a school's drift (× its fish's length/2, 0.5–4×)
  CATCH: 0.03,         // larvae a plankton/insect eater catches from a school per handling slot (dense school) — larvae
                       //   are dispersed and hard to find among the zooplankton
  ATTACK: 100,         // young fish/s a PISCIVORE at a school catches × its capture success — a feeding BOUT: one behavioural
                       //   second is ~5 h of the fish's day, and a bass or perch working a school of young-of-year takes
                       //   dozens an hour; its gut and Cmax cap the meal. Weed cover shelters them (COVER.REFUGE)
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
  // the cost of guarding: nesting male bass are ~2× as active day and night (Cooke et al. 2002) with metabolic rate up to
  // +60 % (smallmouth: Hinch & Collins 1991) while their feeding is cut 70–100 % — they lose condition over the nest
  GUARD_METAB: 1.6, GUARD_FEED: 0.2,
  // NURSERY: young fish shelter in vegetation and structure (the littoral nursery habitat), more so when frightened
  NURSERY: 0.45,        // cover-seeking steer weight for juveniles (age < half their maturity), × (1 + fear)
  SCATTER: [14, 40],  // px: newborns are placed this far (annulus) from the parent(s), clamped into the water column
};

// ---------- lake basin (non-rectangular bed) ----------
// The lake is a cross-section: flat surface on top. Real lakes are not a smooth U — each shore
// has a flat shallow **littoral shelf**, then a steeper **drop-off** into a flat-ish deep basin.
// bedY(x) is the world-y of the bed at a given x (larger y = deeper).
export const BASIN = {
  SHELF_Y: 0.25,     // depth fraction (of H) of the flat shallow shelf hugging each shore (littoral)
  DROP_Y: 0.86,      // depth fraction at the foot of the drop-off (top of the deep basin)
  DEEP_Y: 0.985,     // depth fraction at the deepest point (basin centre)
  CENTER: 0.54,      // where the deepest point sits across the width (slightly off-centre)
  SHELF_T: 0.34,     // the flat shelf spans this fraction of the shore→centre distance (a broad littoral zone)
  DROP_T: 0.18,      // the drop-off slope spans the next fraction of that distance
  SHELF_FRAC: 0.30,  // ≈ width fraction from each shore that stays littoral (shelf + upper slope; for seeding)
};
export function bedY(x) {
  const H = WORLD.H, c = BASIN.CENTER, u = clamp(x / WORLD.W, 0, 1);
  const t = u < c ? u / c : (1 - u) / (1 - c);          // 0 at the shore → 1 at the deep centre
  const { SHELF_Y, DROP_Y, DEEP_Y, SHELF_T, DROP_T } = BASIN;
  const shelfFoot = SHELF_Y + (DROP_Y - SHELF_Y) * 0.05; // shelf deepens a hair toward its outer edge
  let frac;
  if (t <= SHELF_T) {
    frac = SHELF_Y + (shelfFoot - SHELF_Y) * (t / SHELF_T);                 // flat shallow shelf
  } else if (t <= SHELF_T + DROP_T) {
    frac = lerp(shelfFoot, DROP_Y, smoothstep((t - SHELF_T) / DROP_T));     // steep drop-off
  } else {
    frac = lerp(DROP_Y, DEEP_Y, smoothstep((t - SHELF_T - DROP_T) / (1 - SHELF_T - DROP_T))); // deep basin
  }
  return frac * H;
}

// ---------- seasons & thermal structure ----------
// A temperate (dimictic) lake, year-fraction 0 = March 1. Surface water: ~0–1 °C under winter ice (Jan–Feb), ~4 °C at
// ice-out (~April), ~20 °C in June, peaking ~24–25 °C around Aug 1, back to ~4 °C by late November. (It used to run
// 22 °C on Mar 1 → 31 °C on Jun 1 → never below 13 °C: no winter, no ice, a June heat peak.)
export const SEASON = {
  get YEAR_LEN() { return TIME.YEAR_LEN; },   // live alias of the master TIME.YEAR_LEN (not a load-time copy)
  TEMP_AMP: 13,              // seasonal swing (±°C) of the surface/epilimnion base temperature about ENV.TEMP_BASE
  TEMP_PHASE: 0.17,          // year-fraction of the spring zero crossing → peak at +0.25 (≈ Aug 1), minimum ≈ Jan 21
  START_YF: 0.22,            // a fresh lake opens in mid/late May (ice gone, plants and fish active)
  // daylight: day length and noon sun height follow the solstice (Jun 21 = yf 0.307) — ~9 h days in winter, ~15 h in
  // summer, and a winter noon sun about half as strong
  SOLSTICE: 0.307,
  DAY_FRAC: [0.38, 0.62],    // fraction of the 24 h cycle that is daylight, [winter solstice, summer solstice]
  NOON: [0.5, 1.0],          // noon irradiance factor, [winter, summer]
};
// A fish-eating diving BIRD (a common loon): visits the open lake from ice-out to late autumn, rests on the surface and
// dives in daylight to chase fish underwater (loons pursue prey by sight, propelled by their feet), surfacing for air
// between dives, and flies off once sated. Fish sense a diving loon as a threat (World.qThreat). Times are sim seconds.
export const BIRD = {
  MAX: 1,              // loons hunting at once (one territorial bird/pair on a lake this size)
  ARRIVE: 0.004,       // /s chance one arrives when none is present (in season, open water)
  SEASON: [0.08, 0.72],// year-fraction window it can be on the lake (≈ ice-out → mid-November)
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
  EPI_FRAC: 0.28,      // top fraction of the column = epilimnion (warm, well-mixed)
  HYPO_FRAC: 0.60,     // below this fraction = hypolimnion (cold)
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
  DIEL_DEPTH: 0.06,    // depth fraction (of H) e-folding scale of the surface diurnal temperature swing (shallow skin)
};
export const WIND = {
  BASE: 5,             // baseline surface drift speed (px/s), direction flips slowly
  WEATHER: [0.6, 1.0, 1.6, 2.4], // wind multiplier per weather state (clear→storm)
  SURFACE_FRAC: 0.30,  // top fraction of the column the surface current reaches
};

// ---------- habitat structure & cover (refuge from predation) ----------
export const STRUCTURE = {
  REEDS: 16,            // reed clumps along the shallow shores (reference; scales with width, not area)
  LOGS: 6,              // submerged logs scattered on the bed (scales with width)
  WEEDBEDS: 9,          // submerged macrophyte beds on the littoral/drop-off — tall cover bands reaching up
  SHORE_FRAC: 0.11,     // reeds live within this fraction of width from each shore (the littoral shelf)
};
export const COVER = {
  RADIUS: 30,           // how close a fish must be to structure/weeds to gain cover
  REFUGE: 0.7,          // max shrink of a predator's effective strike range when prey is in full cover
};
// ---------- inflow / outflow through-current ----------
export const FLOW = {
  SPEED: 3.2,           // gentle rightward through-current (px/s, inflow left → outflow right), weaker deep
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
  DEPTH: 0.25,          // the advected outflow layer spans the top DEPTH fraction of the column (a surface outlet)
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
  COUNT: 22,             // beds (reference; scales with width), on the shallow/mid bed
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
  MAX_ZOOM_REL: 64,    // closest zoom-in: ~64× the whole-lake fit → one organism fills the view
  FOLLOW_LERP: 4.0,    // follow/recenter smoothing (1/s)
  ZOOM_LERP: 9.0,      // zoom easing (1/s)
  TOUR_DWELL: [8, 14],     // seconds spent on each cinematic shot
  TOUR_ZOOM_REL: [6, 16],  // zoom range (× fit) for close FOLLOW shots (was 9–30, then 7–22: one fish filling the screen loses the scene around it)
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
  TEMP_BASE: 12.5,         // annual-mean surface temperature (the seasonal swing is SEASON.TEMP_AMP about it)
  TEMP_DIURNAL: 4,         // +/- swing over the day (surface; damped with depth — THERMAL.DIEL_DEPTH)
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
  O2_SED: 0.15,            // SEDIMENT O₂ demand /s at each column's bed cell (×depth ramp below the epilimnion)
  O2_PELAGIC: 0.009,       // water-column O₂ demand /s below the epilimnion (decomposition of sinking particulate organic
                           // matter, ×depth ramp). Together with O2_SED ≈ the old all-cells 0.018 ramp for a deep column.
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

// "plankton" particles are ZOOPLANKTON: they graze the phytoplankton field, drift, and are
// eaten by planktivores. Their numbers track the algae (phyto→zoo→planktivore chain).
export const PLANKTON = {
  CAP: 300,                // reference-pond cap (auto-scaled by world area)
  RATE_BASE: 60,           // /s max spawn at full phytoplankton density (scaled by area)
  DRIFT: 6,                // horizontal drift speed
  GRAZE: 0.004,            // phytoplankton biomass each zooplankter clears /s (gentle → stable cycle)
  STARVE: 0.08,            // death rate /s where phytoplankton is depleted (soft starvation)
  STARVE_AT: 0.025,        // phytoplankton level below which zooplankton starve
  // planktivore facultative omnivory (food-web rebalance): when zooplankton is scarce, a hungry planktivore
  // grazes the phytoplankton field directly at a LOW survival ration — real planktivorous fish are facultative
  // phyto grazers. This cushions the boom-bust crash so the forage base (and the predators above it) don't
  // collapse to the refuge in the troughs → a steadier, more self-sustaining web (less immigration dependence).
  FALLBACK_GRAZE: 1.32,    // phyto biomass a hungry planktivore clears per SECOND (× dt) when it finds no zooplankton (= the old
                           //   0.022/step at the browser's 1/60 step; per-step made it dt-dependent — half as much headless at 1/30)
  FALLBACK_MIN: 0.18,      // per SECOND (× dt): grazing less than this in a step finds no meal (= the old 0.003/step at 1/60)
  // TWO KINDS of zooplankter (p.k): 0 = DAPHNIA — big cladoceran filter-feeders: they graze hard (their late-spring boom
  // clears the water — the clear-water phase), are the fishes' favourite, richest prey, can't eat or tolerate
  // cyanobacteria and barely breed in cold water; 1 = COPEPODS — small, quick and evasive, cold-tolerant (they carry the
  // zooplankton through winter), a leaner meal. Daphnia's share of new zooplankton follows temperature and collapses in
  // a cyanobacterial bloom; size-selective fish predation (copepods escape more) does the rest.
  DAPH_T: [9, 15],         // °C over which Daphnia's share of births ramps from 0 to DAPH_MAX
  DAPH_MAX: 0.7,           // Daphnia's max share of new zooplankton
  DAPH_CYANO: 2.5,         // × the cyanobacteria fraction cut from Daphnia's share
  DAPH_GRAZE: 2.4,         // Daphnia graze × GRAZE; copepods × COPE_GRAZE
  COPE_GRAZE: 0.6,
  COPE_ESCAPE: 0.4,        // chance a copepod's escape jump beats a fish's strike
  DAPH_TOX: 2.0,           // Daphnia × the cyanotoxin kill rate (cladocerans are the most sensitive)
  SIGHT: 48,               // px: how far a fish can see a millimetre-sized zooplankter (a few body lengths), whatever its vision range
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
export const INSECT = {
  LARVA_SEED: 50,          // initial benthic larvae (× world area)
  LARVA_CAP: 240,          // max benthic larvae (× area)
  EPIPHYTE: 0.5,           // share of new larval patches that live on the macrophytes (the rest on the bed)
  LARVA_RATE: 22,          // /s larval recruitment at full detritus availability (× area), capped — detritus → insects
  DEV_RATE: 0.05,          // /s development at the optimum temperature (→ ~20 s to mature when warm; ~0 when cold → overwinter)
  DEV_TEMP_MIN: 10,        // °C below which larvae barely develop
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
export const SNAIL = {
  SEED: 38,                // initial snails (× world area)
  CAP: 240,                // max snails (× area)
  RATE: 12,                // /s recruitment at full algae availability (× area), logistic toward CAP
  FLOOR: 6,                // tiny refuge floor (× area): top up below this if any algae present (never quite vanish)
  GRAZE: 0.0012,           // phytoplankton biomass each snail clears /s near the bed (periphyton proxy; gentle so the base holds)
  FOOD_AT: 0.05,           // local phyto below which a snail starves (and recruitment slows)
  STARVE: 0.03,            // /s death rate where food is depleted
  CRAWL: 1.4,              // px/s crawl speed along the bed
  SENESCE: 0.006,          // /s background death (turnover)
};

// CRAYFISH — large benthic OMNIVORE / scavenger and a keystone forage item. A crayfish walks the bed (drifting toward
// the nearest cover, and CREPUSCULAR — more active at night), scavenging the detritus rain (recruitment is gated by
// detritus availability, like the insect larvae) and PREYING on snails (the signature crayfish→snail link + snail
// population control). It is in turn a prime forage for predatory fish: BASS, PIKE & CATFISH eat crayfish →
// detritus + snail → crayfish → {bass, pike, catfish}, giving the chronically-rare piscivores a benthic prey base.
// Particle system (one crayfish = one particle); deterministic (seeded RNG); eaten opportunistically on the bed.
export const CRAYFISH = {
  SEED: 14,                // initial crayfish (× world area)
  CAP: 80,                 // max crayfish (× area) — fewer, larger benthic omnivores than snails
  RATE: 3.2,               // /s recruitment at full detritus availability (× area), logistic toward CAP
  CRAWL: 4,                // px/s base crawl speed along the bed
  NIGHT: 1.7,              // crepuscular: crawl/forage activity multiplier at night vs day
  COVER_PULL: 0.5,         // how strongly a crayfish steers its crawl toward the nearest cover (refuge-seeking)
  EAT_R: 15,               // px reach to catch a snail
  SNAIL_HUNT: 2.0,         // /s rate a crayfish attempts to take a nearby snail
  SENESCE: 0.004,          // /s background death (turnover). NB: crayfish have no explicit STARVATION path (unlike snails) —
                           // deaths = this senescence + predation; population is held in check by the detritus-gated +
                           // logistic recruitment above (the sole density regulator), which is sufficient & self-limiting.
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
  BITE_RATE: 300,          // px of plant height a grazing herbivore removes per SECOND (× dt) — = the old 5 px/step at the
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
  // key            name            zone(beddepth)   maxH        grow  cover o2    palat lightMin tempMin hue  form
  { key: 'pondweed', name: 'Pondweed',   zone: [0.24, 0.70], maxH: [34, 70], grow: 1.0, cover: 1.0, o2: 1.0, palat: 1.0, lightMin: 0.013, tempMin: 14, hue: 128, form: 'stalk' }, // common submerged, shelf→drop-off
  { key: 'milfoil',  name: 'Milfoil',    zone: [0.55, 0.99], maxH: [46, 82], grow: 0.9, cover: 1.3, o2: 1.1, palat: 0.5, lightMin: 0.008, tempMin: 13, hue: 146, form: 'stalk' }, // dense, deep, shade-tolerant, tough (low palat)
  { key: 'lily',     name: 'Water lily', zone: [0.24, 0.40], maxH: [24, 46], grow: 1.0, cover: 1.2, o2: 1.2, palat: 0.8, lightMin: 0.019, tempMin: 17, hue: 108, form: 'pad' },   // floating-leaved, shallow, warm, broad leaves
  { key: 'chara',    name: 'Muskgrass',  zone: [0.24, 0.44], maxH: [8,  22], grow: 0.7, cover: 0.6, o2: 0.9, palat: 0.9, lightMin: 0.045, tempMin: 12, hue: 80,  form: 'mat' },   // low benthic mat, needs CLEAR water (turbidity-sensitive), cool-tolerant
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
