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
  LIFE_SCALE: 1.6, // global multiplier on every species' matureAge & maxAge (species.js) → fish live & mature
                   // proportionally longer in sim-seconds (calmer turnover, more seasons per life), keeping ratios
  // derived (for reference; computed live from the two knobs above):
  get MONTH_LEN() { return this.YEAR_LEN / 12; },
  get SEASON_LEN() { return this.YEAR_LEN / 4; },
};

// ---------- seasonal spawning (fish breed on a seasonal calendar, not year-round) ----------
// Real temperate fish spawn in a season — most in spring / early summer as the water warms; pike spawn earliest
// (cool early spring). Breeding probability PEAKS at each species' `SP.spawnPeak` (a year-fraction) and tapers to
// FLOOR off-season → a visible spring/early-summer BABY BOOM. It is SOFT (never zero) so recruitment stays seasonal
// & realistic without starving the population in the off-season (which, with the realistic slow life histories,
// would over-collapse the larger species). Keyed off the continuous year-fraction (Environment.yearFrac).
export const SPAWN = {
  FLOOR: 0.12,   // off-season breeding chance as a fraction of the peak (low → most recruitment is in-season; >0 so it's soft, never a hard stop)
  SHARP: 4,      // how tightly breeding concentrates around the peak (≈⅓-of-a-year spawning season — a recognizable spring/summer boom)
  // spawning AGGREGATION (species with innate.spawnGround): in season, breeding-ready adults migrate to the littoral
  // spawning ground on their side of the lake so a sparse population can find mates (world.js innate block)
  AGG_SEASON: 0.5,   // the species' seasonal factor must exceed this (≈ the central part of its spawning season)
  AGG_READY: 0.8,    // and the fish must hold ≥ this fraction of its reproEnergy (in breeding condition)
  GROUND_X: 0.09,    // spawning-ground centre as a fraction of lake width from each shore (mid-littoral shelf)
};

// ---------- feeding handling time (dt-independent intake of discrete food items) ----------
// A fish used to take ONE item per food type per STEP, so its max intake per second doubled at the browser's 1/60 step
// vs the headless 1/30. Now it gets one item per food type per HANDLE seconds (a handling time; the fractional remainder
// carries over), so intake per second is the same at any fixed step. HANDLE = 1/60 reproduces the browser exactly.
export const FEED = {
  HANDLE: 1 / 60,   // s per discrete item (zooplankton, insect, larva, detritus, snail, crayfish) per food type
};

// ---------- brood protection (newborn cannibalism) ----------
// Newborns used to appear ±6 px from their parents — inside strike reach — and qPrey had no kin filter, so bass/pike
// ate their own brood within ~2 s for MORE energy than the spawning cost (an energy pump lifetime learning rewarded).
// A short post-birth GRACE (eggs/larvae hidden in the nest/weeds) makes a conspecific newborn not-prey for its first
// seconds; the brood is SCATTERED out of immediate strike range; and qThreat is symmetric with qPrey, so after the
// grace a juvenile senses (and can flee) a cannibal adult of its own kind. Real post-grace cannibalism stays possible.
export const BROOD = {
  GRACE: 5,      // s after birth during which a fish is not prey for its OWN species (other species can still eat it)
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
export const SEASON = {
  get YEAR_LEN() { return TIME.YEAR_LEN; },   // live alias of the master TIME.YEAR_LEN (not a load-time copy)
  TEMP_AMP: 9,               // seasonal swing (±°C) of the surface/epilimnion base temperature
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
export const PHYTO = {
  GROW: 0.95,            // max growth /s at full light × Liebig-limited nutrient (raised 0.85→0.95: faster recovery from the night/graze lows so the base reads non-zero more of the time)
  CAP: 1.0,              // max biomass per cell
  P_USE: 0.09,           // P content of one unit of algal biomass (drawn on growth, returned in full on decay/grazing)
  N_USE: 0.6023,         // N content per unit biomass = P_USE·(1−ORGANIC_P)/ORGANIC_P (Redfield-consistent with P and with
                         // DOM). Was 0.08 while decay returned 0.609 → N was created ~7.6× faster than used and never limited.
  O2_PHOTO: 0.85,        // O₂ produced per (biomass × light)
  O2_RESP: 0.05,         // O₂ consumed per biomass, always (respiration + decomposition)
  DECAY: 0.06,           // /s natural die-off (returns ALL its N+P)
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
  TEMP_OPT: 28,          // °C — a warm-water bloomer (late summer); growth falls off away from this
  TEMP_TOL: 9,           // °C half-width of the thermal growth window (0 growth beyond ±TEMP_TOL)
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
  TOXIN: 0.10,           // fish energy drained /s per unit cyano above the threshold
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
  TOUR_ZOOM_REL: [7, 22],  // zoom range (× fit) for close FOLLOW shots (was 9–30: tight enough to lose all context)
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
  TEMP_BASE: 22,
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
  O2_RESP_FISH: 0.012,     // O2 consumed per (respiration*size*metabolism)
  O2_PLANT_NIGHT: 0.006,   // plant respiration at night
  O2_SED: 0.15,            // SEDIMENT O₂ demand /s at each column's bed cell (×depth ramp below the epilimnion)
  O2_PELAGIC: 0.009,       // water-column O₂ demand /s below the epilimnion (decomposition of sinking particulate organic
                           // matter, ×depth ramp). Together with O2_SED ≈ the old all-cells 0.018 ramp for a deep column.
  O2_START: 0.85,
  SAT_TEMP_K: 0.020,       // saturation drop per deg above 18C
  HYPOXIA: 0.35,           // default critical O2 (species override via sp.o2Crit); below it, fish take stress
  HYPOXIA_SEVERE: 0.15,    // below this the hypoxia drain is 2.5× (lethal water)
  HYPOXIA_PENALTY: 0.10,   // energy/s at zero O2 (scaled by deficit)
  HYPOXIA_AVOID: 1.2,      // innate oxyregulation: a fish whose local O₂ < its o2Crit × this steers upward out of it (world.js)

  // metabolism scales with temperature
  METAB_TEMP_K: 0.030,

  // thermal niche: each species has a preferred temperature band (sp.tempOpt ± sp.tempTol);
  // outside it, energy drains at THERMAL_STRESS per °C of exceedance — warm- vs cool-water guilds,
  // and the classic summer "temperature–oxygen squeeze" (warm surface + hypoxic deep), emerge.
  THERMAL_STRESS: 0.0035,  // energy/s per °C beyond a species' tolerance band
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
  ENERGY: 0.20,            // energy a planktivore gains per zooplankter eaten
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
  FALLBACK_VALUE: 4.2,     // energy per unit phyto grazed (efficient → sustenance from little phyto; grazed×value ≈ a modest meal)
};

export const DETRITUS = {
  CAP: 220,                // reference-pond cap (auto-scaled by world area)
  SINK: 5,                 // px/s downward
  LIFE: 26,                // seconds before it decays into nutrient
  ENERGY: 0.22,            // energy per detritus eaten (bottom feeders)
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
  LARVA_RATE: 22,          // /s larval recruitment at full detritus availability (× area), capped — detritus → insects
  LARVA_ENERGY: 0.18,      // energy a bottom fish gains per larva eaten
  DEV_RATE: 0.05,          // /s development at the optimum temperature (→ ~20 s to mature when warm; ~0 when cold → overwinter)
  DEV_TEMP_MIN: 10,        // °C below which larvae barely develop
  DEV_TEMP_OPT: 25,        // °C of fastest development
  HATCH_TEMP: 17,          // °C: a mature larva EMERGES only above this → warm-season pulsed hatches
  ADULT_CAP: 220,          // max surface adults (× area)
  ADULT_LIFE: 7,           // s adult surface lifespan
  ADULT_DRIFT: 9,          // px/s surface drift scale
  ADULT_ENERGY: 0.20,      // energy a surface fish gains per adult insect eaten
  EGG: 0.6,                // fraction of expired (uneaten) adults that lay an egg → a new larva (closes the cycle)
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
  ENERGY: 0.16,            // energy a molluscivore (sunfish/carp) gains per snail eaten
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
  ENERGY: 0.32,            // energy a predator fish (bass/pike/catfish) gains per crayfish eaten — a substantial meal
  SENESCE: 0.004,          // /s background death (turnover). NB: crayfish have no explicit STARVATION path (unlike snails) —
                           // deaths = this senescence + predation; population is held in check by the detritus-gated +
                           // logistic recruitment above (the sole density regulator), which is sufficient & self-limiting.
};

export const PLANT = {
  MAX: 120,                // reference-pond cap (auto-scaled by world area)
  SEED_RATE: 3.4,          // new plants /s up to MAX (scaled by area) — gated by seasonal vigor (mostly spring/summer)
  GROWTH: 20,              // height units /s at full light, nutrient & seasonal vigor (per-plant max height: MACRO[v].maxH × the maxH gene)
  BIOMASS_PER_PX: 0.018,   // biomass = height * this
  BITE_RATE: 300,          // px of plant height a grazing herbivore removes per SECOND (× dt) — = the old 5 px/step at the
                           //   browser's 1/60 step (per-step bites made grazing dt-dependent: half the rate headless at 1/30)
  ENERGY_PER_PX: 0.04,     // energy a herbivore gains per px grazed (× the plant's palatability) — = the old 0.20 per 5-px bite
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
  STRIKE_COST: 0.05,   // /s energy cost at full strike (lunging is expensive → only worth it when prey is catchable)
  FLEE_BURST: 0.9,     // a full flee drives thrust toward 1 (a panic sprint)
  BURST_SPEED: 0.35,   // strike/flee also lift the speed cap by up to +35% → a sprint briefly exceeds cruise speed
  FLEE_COST: 0.06,     // /s energy cost at full flee (a sprint is the most expensive act)
  HIDE_STILL: 0.85,    // a full hide suppresses thrust by this much (freeze — hold position)
  HIDE_COVER: 0.6,     // …and steers toward the nearest cover (reed/log/weed bed) to hold in it
  HIDE_CONCEAL: 0.5,   // a freezing/hiding prey shrinks a predator's strike reach by up to this (harder to detect/catch)
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
  COAST_DEPTH: 0.65,   // depth of the thrust pulse around the intent (0 = steady thrust; 0.65 → swings ~±65% over a stroke)
  COAST_RATE: 1.1,     // stroke cycles per second while cruising (scaled up a little with speed)
};

// DRIVE — INTERNAL STATE / motivation. Persistent per-fish drive scalars (0..1) fed back as the last brain INPUTS, so a
// fish's behaviour depends on its own internal state, not just its surroundings (a starving fish takes risks a sated one
// won't; a recently-scared one stays cautious). They are PERCEPTION (the brain decides what to do with them — emergent,
// not scripted) and feed the gated action space (strike/flee/hide). HUNGER is an appetite drive (rises with time since a
// meal, sated by eating — distinct from the instantaneous energy LEVEL the brain already senses). FEAR jumps to the
// nearest-threat proximity and decays after the threat leaves (lingering caution). Deterministic; see world.js move step.
export const DRIVE = {
  HUNGER_GAIN: 0.03,   // /s hunger accrues with time since a meal
  SATE: 0.4,           // hunger removed per meal eaten (eating sates the appetite)
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
// (the old SEED_FROM_BEST_CHANCE is retired — immigration's IMMIGRATION.FROM_BEST is now the single source of truth)

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
  RESCUE_N: 8,         // immigration engages below this many individuals (a rarity threshold, not a pop target)
  REFUGE: 2,           // absolute quasi-extinction backstop: never let a species literally vanish (≪ the old floor)
  RATE: 2.0,           // immigrants/s per species at zero population (Poisson trickle; → 0 at RESCUE_N)
  FROM_BEST: 0.6,      // fraction seeded as a mutated copy of the species' current best (preserves learned behavior)
};
