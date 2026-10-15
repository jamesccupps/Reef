// world.js — the simulation. Pure (no DOM). Headless-testable in Node.
import { WORLD, SEASON, BIRD, ENV, PLANKTON, BENTHOS, DETRITUS, PLANT, MACRO, NUTRIENT, IMMIGRATION, SPAWN, SEED_COUNTS, scaleCount, GRID, bedY, BASIN, STRUCTURE, COVER, PHYTO, CYANO, MUSSEL, COMPETE, SCHOOL, TOX, ACTION, MOTION, DRIVE, INSECT, SNAIL, CRAYFISH, LEARN, BRAIN, BROOD, FEED, ODONATA, FROG, TURTLE, TIME, BIOE, PREY, FRY, SEDOM, EVO, littoralX, isLittoralX, shoreDir, homeBasinAt, basinAt, basinCenterX, BASINS, LANDSCAPE} from './config.js';
import { cmax, respStd, routineActivity, wasteFractions, energyDensity, stdWeight, lengthFor, OXYCAL } from './bioenergetics.js';
import { rand, gauss, clamp, canEat, angDiff, SpatialGrid, randomGenome, migrateGenome, migrateGenomeInputs, mutate, crossover, forward, reinforce, genomeLen, OUT, randomGenes, crossoverGenes, mutateGenes, GENE_KEYS, randomPlantGenes, PLANT_GENE_KEYS } from './core.js';
import { Environment } from './environment.js';
import { SP, SPECIES } from './species.js';
// save/load integrity (era-aware brain migration, exact resume, validated atomic load)
import { getRandState, setRandState, remapGenome, ACT_LABELS, GENE_MIN, GENE_MAX } from './core.js';
import { brainEraOf } from './species.js';

const W = WORLD.W, H = WORLD.H, FLOOR = WORLD.FLOOR;
const WF = [0, 0];   // scratch for bioenergetics.wasteFractions (egested, excreted fractions) — no allocation per fish-step
const DEATH_FADE = 1.4;   // seconds a natural-death body lingers & fades before becoming detritus

// integer event count for a fractional per-step rate (so spawn rates scale to any world size
// instead of saturating at one-per-step). Uses the seeded RNG → deterministic.
const poissonish = rate => { const n = Math.floor(rate); return n + (rand() < rate - n ? 1 : 0); };
// scaled per-species population targets for the current world area
const popStart = sp => scaleCount(sp.pop.start);
const popMax = sp => scaleCount(sp.pop.max);   // carrying capacity K (logistic reproduction tapers to 0 here)
// (the old hard re-seed floor popMin is retired — Phase 5: see IMMIGRATION rescue + REFUGE in config.js)
// a y within the species' preferred depth band (fraction of the local water column to the bed)
function zoneY(sp, x) {
  const z = sp.zone || [0.1, 0.9], bed = bedY(x);
  return clamp(bed * rand(z[0], z[1]), 6, bed - 3);
}

// PER-WORLD agent ids: each World owns its counter (`world._nextId`, serialized). makeAgent is a module function called
// from many World methods, so it draws from the ACTIVE world's counter; every World entry point that creates agents
// activates its world first (reset/load/addAgent/makeFish/seedFromChampions, and step() via the wrapper at the end of
// this file, so the step body is untouched). A second World can no longer reset or share the first one's ids.
let _idOwner = null;
const nextAgentId = () => (_idOwner ? _idOwner._nextId++ : 0);
// BODY SIZE IS REAL (bioenergetics, 2026-10-13): every fish has a total length L (cm, structural — it never shrinks) and a
// wet mass W (g) that grows and shrinks with its energy budget (see the step). Gape limitation compares real dimensions: a
// predator can swallow a prey whose body DEPTH (its length × the species' depth ratio × its body-depth gene) fits its
// GAPE (its length × its gape ratio) — so deep-bodied sunfish outgrow a bass's mouth while slim minnows never do, and a
// first-year fish fits its own species' adults (pike, perch and bass cannibalise their young-of-year).
const gapeOf = a => a.L * a.sp.gapeR;                                   // cm
// the fish's bioenergetics parameter set: FB4's juvenile set where one exists — for a young-of-year (fit to age-0 fish:
// bluegill, perch), or below a body mass where the species says so (sp.juvW: smallmouth bass, whose adult set starves a
// fish under ~30 g) — else the adult set
const bioOf = a => { const sp = a.sp; return sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < TIME.YEAR_LEN) ? sp.bioJuv : sp.bio; };
const depthOf = a => a.L * a.sp.depthR * (a.bodyMul || 1);              // cm
// is the fish ready to spawn: mature (by length AND age), its gonads ripe (≥ SPAWN.GON_READY of the species' ripe GSI), and
// in fair condition (SPAWN.K_READY) — a spent or starving fish skips spawning, as real ones do
const breedReady = a => a.mature && a.gon >= SPAWN.GON_READY * (a.sex === 0 ? a.sp.gsiF : a.sp.gsiM) * a.W && a.K >= SPAWN.K_READY;
// thermal performance curve: 1 at/above the species' optimum, falling linearly to ENV.COLD_PERF_MIN at 2 °C
// an action intent's ENGAGED intensity: 0 below ACTION.ENGAGE, rising linearly to 1 at full intent
export const engaged = x => x > ACTION.ENGAGE ? (x - ACTION.ENGAGE) / (1 - ACTION.ENGAGE) : 0;
// `floor`: the species' cold-water performance floor — cold- and cool-water fish (trout, pike, perch: SP.coldPerf) stay far more
// active near 0 °C than warm-water centrarchids, carp and catfish (ENV.COLD_PERF_MIN), as real perch and pike feed under the ice
export const coldPerf = (tC, tOpt, floor = ENV.COLD_PERF_MIN) => { const f = Math.max(floor, ENV.COLD_PERF_MIN); return tC >= tOpt ? 1 : clamp(f + (1 - f) * (tC - 2) / Math.max(1, tOpt - 2), f, 1); };
// spatial-query predicates as plain functions (SpatialGrid.nearest passes the querying fish as ctx), so the hot queries
// allocate no closure per call
const notDead = it => !it.dead;
// scratch for the zooplankton field queries (env.zooBest's patch → the brain's plankton sense; env.zooFeed's grams by kind) —
// read at once by the caller, never kept
const ZB = { item: { x: 0, y: 0 }, dist: 0 }, QB = { item: { x: 0, y: 0 }, dist: 0 }, ZF = new Float64Array(3);
// a larval patch with larvae outside the refuge: INSECT.REFUGE_M grams of every patch are burrowed in the mud or cased,
// out of a predator's reach — the stock that rebuilds a grazed-down patch
const larvaFree = it => !it.dead && it.m > INSECT.REFUGE_M + 1e-3;
// …but young-of-year pick the small early instars off the mud surface: for fry only INSECT.REFUGE_FRY of a patch is out of reach
const larvaFreeFry = it => !it.dead && it.m > INSECT.REFUGE_FRY + 1e-3;
// predator/prey relation (shared so qThreat and qPrey stay SYMMETRIC): `pred` could eat `prey` if it's a piscivore,
// the prey fits its gape, and the prey isn't a conspecific still inside its post-birth grace (BROOD.GRACE).
// So a juvenile fears a cannibal adult of its own kind exactly when that adult could actually eat it.
function canPreyFn(pred, prey) {
  if (pred === prey || pred.dead || prey.dead || !pred.sp.diet.fish || pred.L < pred.sp.Lpisc || (pred.species === prey.species && prey.age < BROOD.GRACE)) return false;
  // fits the gape, and long enough to be worth the chase (real piscivores take prey ~10–50 % of their own length)
  return depthOf(prey) <= gapeOf(pred) && prey.L >= FEED.PREY_MIN * pred.L;
}
const isThreatTo = (it, a) => canPreyFn(it, a);
// the SIZE REFUGE: the chance a piscivore's strike ends in a swallowed meal — capture and handling — falls as the prey's
// body depth nears its gape, (1 − depth/gape)^FEED.SIZE_SEL. Capture success is high on prey small for the mouth and drops
// steeply toward the gape limit (Miller et al. 1988 review); pike take the smaller fish of each prey species (Nilsson &
// Brönmark 2000), perch prey far smaller than their gape allows (Paszkowski & Tonn 1994), and across bass, pike and five
// other piscivores the median prey is 10–20 % and the largest 32–46 % of the predator's length (Gaeta et al. 2018) — so
// adult bluegill and perch mostly outgrow the risk, and the predators live on the small fish and the young-of-year
const sizeSel = (prey, pred) => Math.pow(Math.max(0, 1 - depthOf(prey) / gapeOf(pred)), FEED.SIZE_SEL);
const isPiscivore = a => !!(a.sp && a.sp.diet.fish);
const notOwnBrood = (it, a) => it !== a && !it.dead && it.ni !== a.id;   // a nest guardian's intruder: any piscivore but its own fry
// WILDLIFE (dragonflies, frogs, turtles) — herps: k 0 tadpole, 1 frog, 2 turtle. Body depth (cm, the gape check) and wet
// mass (g, the meal) grow with age.
const herpGrowth = h => clamp(h.age / ((h.k === 2 ? TURTLE.MATURE : FROG.MATURE) * TIME.YEAR_LEN), 0, 1);
const herpDepth = h => h.k === 0 ? FROG.DEPTH_TAD : h.k === 1 ? FROG.DEPTH_FROG * (0.5 + 0.5 * herpGrowth(h))
  : TURTLE.DEPTH_HATCH + (TURTLE.DEPTH_ADULT - TURTLE.DEPTH_HATCH) * herpGrowth(h);
const herpMass = h => h.k === 0 ? FROG.MASS_TAD : h.k === 1 ? FROG.MASS_FROG * (0.25 + 0.75 * herpGrowth(h)) : TURTLE.MASS_HATCH;
const isTadpole = h => !h.dead && h.k === 0;
const exposedCray = c => !c.dead && !c.sh;   // a crayfish out of a shelter (fish can take it)
const exposedSnail = s => !s.dead && !s.sh;   // a snail out in the open (not tucked into the weeds — SNAIL.REFUGE)
const isNymphPrey = f => !f.dead && f.L <= ODONATA.FRY_MAX;   // a fish larva small enough for a nymph's labium (cm)
const isNymphFry = f => !f.dead && f.L <= ODONATA.FRY_MAX;     // … in a fry school
// a frog/tadpole/turtle a fish could take: awake (not buried in the winter mud), fits its gape, worth the chase; a fish
// predator takes any of them, a larva-eater only tadpoles
// (worth the chase: at least the mass of a fish PREY_MIN of its own length — mass ∝ length³)
const canEatHerp = (h, a) => !h.dead && h.st !== 2 && (a.sp.diet.fish || h.k === 0) && herpDepth(h) <= gapeOf(a) && herpMass(h) >= FEED.PREY_MIN ** 3 * a.W;
const isShallow = x => bedY(x) < H * 0.35;                     // over the littoral shelf (frogs, tadpoles, nymphs, basking)
const toShore = x => shoreDir(x);          // horizontal direction to the nearer (shallow) shore (the landscape's own slope)
// a nest site from a spawning pair at x: shoreward until the bed is no deeper than the species' nest depth (sp.nestD —
// pumpkinseed nest in water under ~1 m — else SPAWN.NEST_D)
const nestX = (x, sp) => { const d = (sp.nestD ?? SPAWN.NEST_D) * WORLD.PX_PER_M; for (let k = 0; k < 120 && bedY(x) > d; k++) x = clamp(x + shoreDir(x) * 12, 4, W - 4); return x; };
const isLoonPrey = it => !it.dead && it.L <= BIRD.PREY_MAX;   // what a loon can swallow (cm)
const isPreyOf = (it, a) => canPreyFn(a, it);
// a FRY SCHOOL's fish a fish could eat: young fish that fit a piscivore's gape and are worth its chase — a dense school is
// worth smaller fish than a lone one (FEED.SCHOOL_MIN: a bout takes many) — or larvae small enough for any plankton/insect
// eater (≤ ⅓ of its length); never its own guarded brood
const schoolPrey = (f, a) => a.sp.diet.fish && a.L >= a.sp.Lpisc && f.L * SP[f.k].depthR <= gapeOf(a) && f.L >= FEED.SCHOOL_MIN * a.L;
const canEatFry = (f, a) => {
  if (f.dead || f.ni === a.id) return false;
  if (schoolPrey(f, a)) return true;
  return f.L <= FRY.LARVA_L && f.L <= a.L / 3 && !!(a.sp.diet.plankton || a.sp.diet.larva || a.sp.diet.insect || a.L < a.sp.Lzoo);
};
// … a school worth a PISCIVORE's bout (young fish, not larvae it would only pick at): what a big bass or pike hunts —
// larvae are left to the planktivores and to young piscivores still eating insects (below 3× their piscivory length)
const piscSchool = (f, a) => !f.dead && f.ni !== a.id && schoolPrey(f, a);
const fryPreyOf = (a) => a.L < 3 * a.sp.Lpisc ? canEatFry : piscSchool;
// young fish that eat insect larvae: their species does — or a young piscivore not yet big enough to live on fish alone
// (YOY pike and bass eat aquatic insects alongside fish until ~3× their piscivory length: Frost 1954, Keast 1985)
const insectEater = (sp, L) => sp.diet.larva || sp.diet.insect || (sp.diet.fish && L < 3 * sp.Lpisc);
// a school the fish of school `f` (young piscivores: pike, bass) could eat — any other school (their own kind's included:
// young pike are notorious cannibals) whose fish fit their gape and are worth the chase
const canSchoolEat = (q, f) => q !== f && !q.dead && q.L * SP[q.k].depthR <= f.L * SP[f.k].gapeR && q.L >= FEED.PREY_MIN * f.L;
const isMateFor = (it, a) => !it.dead && it !== a && it.species === a.species && it.sex !== a.sex && breedReady(it) && it.mateCd <= 0 && !it._mated;
const PLANT_COL = 32;   // x-column width of the nearestPlant index (world px)
// sub-lethal reproductive impairment from the contaminant body burden: 1 below TOX.REPRO_HARM, falling to 0 as the
// burden rises (PCB/endocrine-style fecundity loss that bites before lethality). Inert when a.tox = 0 (a clean lake).
export function toxFecundity(tox) { return tox > TOX.REPRO_HARM ? Math.max(0, 1 - TOX.REPRO_CUT * (tox - TOX.REPRO_HARM)) : 1; }
// the spawning drive 0..1 of species `sp` at shore water temperature shoreT (°C) on year-fraction yf with ice cover `ice`:
// 1 inside its window SP.spawnT, soft SPAWN.EDGE ramps either side; 0 on the autumn cooling path (yf ≥ SEASON_END) or under ice
export function spawnFactor(sp, shoreT, yf, ice) {
  if (yf >= SPAWN.SEASON_END || ice >= 0.5) return 0;
  const [lo, hi] = sp.spawnT, e = SPAWN.EDGE;
  return clamp((shoreT - lo + e) / e, 0, 1) * clamp((hi + e - shoreT) / e, 0, 1);
}
// guard a loaded/champion brain against the species' CURRENT network shape. The genome LENGTH identifies the save era
// it came from (species.js BRAIN_ERAS, collision-free per species); an older era is MIGRATED by remapping every input
// column / output row BY KEY (base inputs by position, generic extras + outputs by label) — so weights stay on the sensor
// they were learned for even though shared inputs were inserted before the drives, and 2-output brains gain the action
// outputs (~off) and, if pre-recurrence, a memoryless LEAK. Anything unrecognised, ambiguous, or holding a non-numeric /
// non-finite / absurd weight is reseeded (forward() would otherwise index past the end or spread NaN).
// Returns { g, reseeded, migrated }.
const MAX_ABS_WEIGHT = 1e6;   // far beyond any evolved weight (mutate clamps to ±4) — rejects values that overflow Float32
const finiteWeights = w => { for (let i = 0; i < w.length; i++) { const v = w[i]; if (typeof v !== 'number' || !(Math.abs(v) <= MAX_ABS_WEIGHT)) return false; } return true; };
function fitGenome(sp, w) {
  const ok = w != null && (Array.isArray(w) || ArrayBuffer.isView(w)) && finiteWeights(w);
  if (ok && w.length === genomeLen(sp.shape)) return { g: Float32Array.from(w), reseeded: false, migrated: false };
  const era = ok ? brainEraOf(sp, w.length) : null;
  if (era && !era.current) {
    const cur = sp.brainEras.eras[sp.brainEras.eras.length - 1];
    return { g: remapGenome(w, sp.shape.hid, era.inKeys, era.outs, era.leak, cur.inKeys, ACT_LABELS), reseeded: false, migrated: true, era: era.saves };
  }
  return { g: randomGenome(sp.shape), reseeded: true, migrated: false };
}
// guard a trait genome against the CURRENT gene count: an older save with fewer genes (e.g. before the morphology or
// brain-size genes) would read past its end → NaN. Keep the evolved genes, pad any newer gene with EXACTLY 1.0 (the
// species baseline the older fish actually had — a random pad would e.g. shrink ~19% of brains and consume RNG), and
// clamp every gene into [GENE_MIN, GENE_MAX] (a non-numeric/non-finite gene → 1.0; a speed gene of 0 can't NaN the lake).
function fitGenes(gn) {
  const g = new Float32Array(GENE_KEYS.length).fill(1);
  if (gn) for (let i = 0; i < Math.min(gn.length, g.length); i++) { const v = gn[i]; if (typeof v === 'number' && Number.isFinite(v)) g[i] = clamp(v, GENE_MIN, GENE_MAX); }
  return g;
}
// ---- save-file validation helpers (pure). A save is UNTRUSTED input: every value is type-checked, ranged & defaulted. ----
const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const num = (v, d) => (isNum(v) ? v : d);
const nonNegInt = (v, d = 0) => (isNum(v) && v >= 0 ? Math.min(Math.floor(v), Number.MAX_SAFE_INTEGER) : d);   // gen/eaten: never a string (XSS) or NaN
const hueOr = (v, d) => (isNum(v) ? (v >= 0 && v < 360 ? v : ((v % 360) + 360) % 360) : d);   // wrap only when out of range (identity otherwise)
const numArr = (v, len) => { if (!Array.isArray(v) || v.length !== len) return null; for (let i = 0; i < len; i++) if (!(typeof v[i] === 'number' && Math.abs(v[i]) <= MAX_ABS_WEIGHT)) return null; return v; };
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SAVE_ARRAYS = ['agents', 'plants', 'detritus', 'larvae', 'insects', 'snails', 'cray', 'corpses', 'nymphs', 'dflies', 'herps', 'fry'];
const STRUCT_CAP = 4096;   // per structure list (generated lakes hold tens)
const STRUCT_FIELDS = {    // static habitat structure: each element rebuilt from its known numeric fields only
  reeds: q => (isNum(q.x) && isNum(q.baseY) && isNum(q.height) ? { x: q.x, baseY: q.baseY, height: q.height, n: clamp(nonNegInt(q.n, 3), 1, 24) } : null),
  logs: q => (isNum(q.x) && isNum(q.y) && isNum(q.len) && isNum(q.ang) ? { x: q.x, y: q.y, len: q.len, ang: q.ang } : null),
  mussels: q => (isNum(q.x) && isNum(q.y) ? { x: q.x, y: q.y, n: clamp(nonNegInt(q.n, 4), 1, 64) } : null),
  weedbeds: q => (isNum(q.x) && isNum(q.top) && isNum(q.bot) && isNum(q.w) ? { x: q.x, top: q.top, bot: q.bot, w: q.w } : null),
};
// PHASE 1 of World.load: validate a parsed save and build EVERY part of the new world into locals. Throws a descriptive
// Error for a structurally unusable file; per-item problems are repaired or skipped and counted in `rep`. Touches no World.
function parseSave(s) {
  if (!isObj(s)) throw new Error('load: not a Synapse Reef save (expected a JSON object)');
  for (const k of SAVE_ARRAYS) if (s[k] != null && !Array.isArray(s[k])) throw new Error(`load: "${k}" must be an array (got ${typeof s[k]})`);
  if (s.env != null && !isObj(s.env)) throw new Error('load: "env" must be an object');
  const rep = { version: num(s.version, 0), agents: 0, skippedSpecies: 0, skippedInvalid: 0, truncated: 0, reseeded: 0, migrated: 0, regenerated: [] };
  const time = Math.max(0, num(s.time, 0)), maxGen = nonNegInt(s.maxGen);
  const env = new Environment(); env.load(s.env || {}, { W: s.W, H: s.H, time });
  // stats: known counters + any other finite-number counters (or {key: number} maps), never prototype keys
  const stats = { foodEaten: 0, fishEaten: 0, births: {}, immigrants: {} };
  if (isObj(s.stats)) for (const k of Object.keys(s.stats)) {
    const v = s.stats[k]; if (BAD_KEYS.has(k)) continue;
    if (isNum(v)) stats[k] = Math.max(0, v);
    else if (isObj(v)) { const o = {}; for (const kk of Object.keys(v)) if (!BAD_KEYS.has(kk) && isNum(v[kk])) o[kk] = Math.max(0, v[kk]); stats[k] = o; }
  }
  if (!isObj(stats.births)) stats.births = {}; if (!isObj(stats.immigrants)) stats.immigrants = {};
  for (const k of SPECIES) { if (!isNum(stats.births[k])) stats.births[k] = 0; if (!isNum(stats.immigrants[k])) stats.immigrants[k] = 0; }
  // agents (ids drawn from a scratch counter so no World's counter moves during parsing)
  _idOwner = { _nextId: 1 };
  const agents = [], needId = [], usedIds = new Set(); let maxId = 0;
  for (const a of s.agents || []) {
    if (agents.length >= WORLD.GLOBAL_MAX) { rep.truncated++; continue; }
    if (!isObj(a)) { rep.skippedInvalid++; continue; }
    if (typeof a.s !== 'string' || !Object.hasOwn(SP, a.s)) { rep.skippedSpecies++; continue; }
    const sp = SP[a.s], HID = sp.shape.hid, W2 = sp.shape.in * HID + HID;
    const x = clamp(num(a.x, sp.spawnPos(rand).x), 0, W), y = isNum(a.y) ? clamp(a.y, 0, H) : zoneY(sp, x);
    const fit = fitGenome(sp, a.w); if (fit.reseeded) rep.reseeded++; else if (fit.migrated) rep.migrated++;
    // pass age so makeAgent derives a typical length for it (pre-v27 saves: adults reload as adults); missing genes pad to 1.0
    const ag = makeAgent(a.s, x, y, 0.95, nonNegInt(a.g),
      hueOr(a.hu, null) ?? sp.randomHue(rand), fit.g, clamp(num(a.ag, sp.matureAge), 0, 1e9), Array.isArray(a.gn) ? a.gn : []);
    // v27 body: length, mass, sex, maturity, gut contents (older saves keep makeAgent's age-typical length at K 0.95)
    if (a.sx === 0 || a.sx === 1) { ag.sex = a.sx; ag.Lmat = lmatOf(sp, ag.genes[0], ag.sex); }
    if (isNum(a.L) && a.L > 0 && isNum(a.wm) && a.wm > 0) { ag.L = clamp(a.L, 0.2, 400); ag.W = clamp(a.wm, 1e-5, 1e7); }
    ag.mature = typeof a.mt === 'boolean' ? a.mt : matureAt(sp, ag.L, ag.Lmat, ag.age);
    ag.gon = isNum(a.go) ? clamp(a.go, 0, ag.W) : ag.mature ? (ag.sex === 0 ? sp.gsiF : sp.gsiM) * ag.W * 0.5 : 0;
    if (isNum(a.gu) && a.gu > 0) { ag.gut = clamp(a.gu, 0, ag.W); ag.gutE = clamp(num(a.ge, 0), 0, 1e9); }
    if (isNum(a.ro) && a.ro > 0) ag.rO2 = clamp(a.ro, 0, 1e6);
    if (isNum(a.mi) && a.mi > 0) ag.missCd = clamp(a.mi, 0, 60);
    if (isNum(a.xo) && isNum(a.xt)) { ag.xo = clamp(a.xo, 0, 5); ag.xt = clamp(a.xt, -5, 60); }
    if (isNum(a.ua)) ag.uAvg = clamp(a.ua, 0, 3);
    if (isNum(a.ft)) ag.foodT = clamp(a.ft, 0, 1e6);
    settleBody(ag);
    ag.heading = num(a.h, ag.heading); ag.spd = clamp(num(a.sp, 0), 0, 1e4); ag.eaten = nonNegInt(a.ea); ag.vis = 1;
    const m = numArr(a.m, HID); if (m) for (let j = 0; j < HID; j++) ag.act.h[j] = clamp(m[j], -1, 1);   // recurrent working memory
    ag.tox = clamp(num(a.tx, 0), 0, 1e6);                                       // contaminant body burden
    ag.hunger = clamp(num(a.hg, 0), 0, 1); ag.fear = clamp(num(a.fe, 0), 0, 1);  // internal drives
    ag.homeX = clamp(num(a.hx, x), 0, W);                                       // natal-home anchor (older saves: home = here)
    // v24 resume state (older saves: makeAgent's fresh values / lazy step init, as before)
    ag.mateCd = num(a.mc, ag.mateCd);
    ag.turnSmooth = clamp(num(a.ts, 0), -1, 1); ag.thrustSmooth = clamp(num(a.th, 0), 0, 1);
    if (isNum(a.vh)) ag.velHeading = a.vh;
    if (isNum(a.st) && a.st >= 0 && a.st < 1) ag.stroke = a.st;
    const ac = numArr(a.ac, 5);   // last action intents — a prey's `hide` is read by predators BEFORE its own next forward()
    if (ac) { ag.act.turn = clamp(ac[0], -1, 1); ag.act.thrust = clamp(ac[1], 0, 1); ag.act.strike = clamp(ac[2], 0, 1); ag.act.flee = clamp(ac[3], 0, 1); ag.act.hide = clamp(ac[4], 0, 1); }
    const lw = !fit.reseeded && !fit.migrated ? numArr(a.lw, OUT * HID) : null;   // learned (plastic) W2 block — only for the brain it belongs to
    if (lw) ag.lw.set(lw, W2);
    // (v25's digestion timer `dg` is retired: a v27 fish digests what is in its gut)
    if (isNum(a.fa) && a.fa > 0) ag.feedAcc = clamp(a.fa, 0, 1);   // v25 handling-time remainder (fractional in cold water)
    if (isNum(a.da)) ag.dAcc = clamp(a.da, 0, 1);                  // v26 time since the last brain decision
    // v25 nest state (a fry whose guardian id isn't found simply goes off-duty at its next step)
    if (isNum(a.nt) && a.nt > 0 && isNum(a.nx) && isNum(a.ny)) { ag.nt = clamp(a.nt, 0, 1e5); ag.nx = clamp(a.nx, 0, W); ag.ny = clamp(a.ny, 0, H); }
    if (Number.isSafeInteger(a.ni) && a.ni > 0 && isNum(a.nx) && isNum(a.ny)) { ag.ni = a.ni; ag.nx = clamp(a.nx, 0, W); ag.ny = clamp(a.ny, 0, H); }
    if (Number.isSafeInteger(a.id) && a.id > 0 && !usedIds.has(a.id)) { ag.id = a.id; usedIds.add(a.id); if (a.id > maxId) maxId = a.id; } else needId.push(ag);
    agents.push(ag);
  }
  let nextId = Math.max(nonNegInt(s.nid, 1), maxId + 1, 1);
  for (const ag of needId) ag.id = nextId++;   // older saves (no ids) number 1..n in order, exactly as before
  rep.agents = agents.length;
  // plants
  const plants = [], plantCap = scaleCount(PLANT.MAX);
  for (const p of s.plants || []) {
    if (plants.length >= plantCap) { rep.truncated++; continue; }
    if (!isObj(p) || !isNum(p.x)) { rep.skippedInvalid++; continue; }
    const x = clamp(p.x, 0, W), v = Number.isInteger(p.v) && p.v >= 0 && p.v < MACRO.length ? p.v : 0, mv = MACRO[v];
    const baseY = clamp(num(p.b, bedY(x)), 0, H + 4), height = clamp(num(p.h, PLANT.WINTER_MIN), 0, 1000), maxHeight = clamp(num(p.m, mv.maxH[1]), 0, 1000);
    const g = numArr(p.g, PLANT_GENE_KEYS.length);   // genome-length guard: a pre-genome / mismatched save gets fresh genes
    const gn = g ? Float32Array.from(g, q => clamp(q, GENE_MIN, GENE_MAX)) : randomPlantGenes();
    // `la` = the running-mean light the starvation test uses (absent on pre-v24 saves → the step re-initialises it)
    const lightAvg = isNum(p.la) ? clamp(p.la, 0, 2) : undefined;
    // `nu` = the plant's absorbed N+P pool (pre-v24 saves → 0: nothing returned that wasn't taken)
    const nut = clamp(num(p.nu, 0), 0, 1e4);
    const pl = { x, baseY, v, gn, hue: hueOr(p.hu, mv.hue), height, maxHeight, biomass: height * PLANT.BIOMASS_PER_PX, y: baseY - height * 0.5, dead: false, lightAvg, nut };
    derivePlant(pl); plants.push(pl);
  }
  // particles (each list capped at its configured cap)
  const parts = (arr, cap, mk) => {
    const out = [];
    for (const q of arr || []) {
      if (out.length >= cap) { rep.truncated++; continue; }
      if (!isObj(q) || !isNum(q.x)) { rep.skippedInvalid++; continue; }
      out.push(mk(q, clamp(q.x, 0, W)));
    }
    return out;
  };
  const yIn = (v, d) => clamp(num(v, d), 0, H);
  const pm = (q, d) => clamp(num(q.m, d), 0, 1e4);   // v27 patch mass (older saves: a fresh patch)
  // (zooplankton: since v30 two biomass fields in the environment save — an older save's swarm particles are dropped and its
  // lake reopens with the starting zooplankton fields)
  // `n` = organic N+P (DOM units) the particle carries — 0 for fish-derived detritus; absent on pre-v24 saves → 0
  const detritus = parts(s.detritus, scaleCount(DETRITUS.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x)), life: num(q.l, DETRITUS.LIFE), n: clamp(num(q.n, 0), 0, 1e3), m: pm(q, PREY.DETRITUS_G), dead: false }));
  const larvae = parts(s.larvae, scaleCount(INSECT.LARVA_CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), dev: num(q.d, 0), m: pm(q, PREY.LARVA_G), dead: false }));
  const insects = parts(s.insects, scaleCount(INSECT.ADULT_CAP), (q, x) => ({ x, y: yIn(q.y, 8), life: num(q.l, INSECT.ADULT_LIFE), vx: num(q.vx, 0), wob: num(q.wb, 0), m: pm(q, PREY.INSECT_G), dead: false }));
  const snails = parts(s.snails, scaleCount(SNAIL.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), vx: num(q.vx, 0), ph: num(q.ph, 0), dead: false }));
  const cray = parts(s.cray, scaleCount(CRAYFISH.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), vx: num(q.vx, 0), ph: num(q.ph, 0), dead: false }));
  // natural-death bodies still sinking/fading (they turn into detritus when they expire)
  const corpses = [];
  for (const c of s.corpses || []) {
    if (corpses.length >= WORLD.GLOBAL_MAX) { rep.truncated++; continue; }
    if (!isObj(c) || typeof c.s !== 'string' || !Object.hasOwn(SP, c.s) || !isNum(c.x) || !isNum(c.y)) { rep.skippedInvalid++; continue; }
    const sp = SP[c.s], size = clamp(num(c.sz, sp.size), 0.05, 20), h = num(c.h, 0);
    corpses.push({ sp, species: c.s, x: clamp(c.x, 0, W), y: clamp(c.y, 0, H), heading: h, rHeading: num(c.rh, h), size, grow: clamp(num(c.gr, 1), 0, 3), L: clamp(num(c.L, sp.Lref), 0.1, 400),
      hue: hueOr(c.hu, 0), genes: fitGenes(Array.isArray(c.gn) ? c.gn : []), facing: clamp(num(c.fc, 1), -1, 1), spd: clamp(num(c.sp, 0), 0, 1e4),
      t: num(c.t, 0), t0: Math.max(1e-3, num(c.t0, DEATH_FADE)), roll: clamp(num(c.r, 0), 0, 1), sink: num(c.sk, 5 + size * 2), dead: false });
  }
  // static structure: validated element-by-element; a missing or non-array list is REGENERATED (old saves, `reeds: {}`)
  const structs = {}; let fresh = null;
  for (const k in STRUCT_FIELDS) {
    if (Array.isArray(s[k])) {
      const out = [];
      for (const q of s[k]) { if (out.length >= STRUCT_CAP) { rep.truncated++; continue; } const v = isObj(q) ? STRUCT_FIELDS[k](q) : null; if (v) out.push(v); else rep.skippedInvalid++; }
      structs[k] = out;
    } else {
      if (!fresh) { fresh = {}; World.prototype._genStructures.call(fresh); }
      structs[k] = fresh[k]; rep.regenerated.push(k);
    }
  }
  // v25 regional gene pool: every entry's genome guarded against its species' current shape (era migration as for agents);
  // a missing / short pool is topped up with fresh founders (older saves predate it)
  const genePool = {};
  for (const k of SPECIES) {
    const src = isObj(s.genePool) && Array.isArray(s.genePool[k]) ? s.genePool[k] : [], out = [];
    for (const e of src) { if (out.length >= IMMIGRATION.POOL_N) break; if (!isObj(e)) continue; const fit = fitGenome(SP[k], e.w); out.push({ w: fit.g, gn: fitGenes(Array.isArray(e.gn) ? e.gn : []), hue: hueOr(e.hu, null) ?? SP[k].randomHue(rand), gen: nonNegInt(e.g) }); }
    while (out.length < IMMIGRATION.POOL_N) out.push(poolFounder(k));
    genePool[k] = out;
  }
  // v25 visiting loons (older saves: none)
  const birds = [];
  for (const b of Array.isArray(s.birds) ? s.birds : []) {
    if (birds.length >= BIRD.MAX || !isObj(b) || !isNum(b.x) || !isNum(b.y)) continue;
    const st = b.st === 1 || b.st === 2 ? b.st : 0;
    birds.push({ x: clamp(b.x, 0, W), y: clamp(b.y, 0, H), h: num(b.h, Math.PI / 2), st, t: num(b.t, 5), stay: num(b.stay, BIRD.STAY[0]), m: nonNegInt(b.m), vx: clamp(num(b.vx, 0), -20, 20), gone: false });
  }
  // v26 wildlife (older saves: none — a lake loaded from an older save simply has no frogs/turtles/dragonflies yet)
  const nymphs = parts(s.nymphs, scaleCount(ODONATA.CAP), (q, x) => { const h = clamp(num(q.h, 8), 0, 60); return { x, h, y: bedY(x) - h, dev: Math.max(0, num(q.d, 0)), vx: clamp(num(q.vx, 0), -20, 20), dead: false }; });
  const dflies = parts(s.dflies, scaleCount(ODONATA.ADULT_CAP), (q, x) => ({ x, y: -12, vx: clamp(num(q.vx, 0), -200, 200), life: num(q.l, 0), ph: num(q.ph, 0), dead: false }));
  const herps = parts(s.herps, scaleCount(FROG.CAP + FROG.TAD_CAP + TURTLE.CAP), (q, x) => {
    const k = q.k === 0 || q.k === 2 ? q.k : 1, st = q.s === 1 || q.s === 2 ? q.s : 0;
    return { k, x, y: clamp(num(q.y, 2), 0, bedY(x)), vx: clamp(num(q.vx, 0), -50, 50), age: Math.max(0, num(q.a, 0)), e: clamp(num(q.e, 0.5), 0, 1), st, t: num(q.t, 5), cd: num(q.c, 0), dev: Math.max(0, num(q.d, 0)), dead: false };
  });
  // v27 fry schools (older saves: none) — each school's genome guarded like an agent's
  const fry = [];
  for (const q of Array.isArray(s.fry) ? s.fry : []) {
    if (fry.length >= scaleCount(FRY.CAP) || !isObj(q) || typeof q.k !== 'string' || !Object.hasOwn(SP, q.k) || !isNum(q.x) || !isNum(q.n) || !(q.n >= 1)) continue;
    const sp = SP[q.k], x = clamp(q.x, 0, W), L = clamp(num(q.L, sp.Lhatch), 0.1, 100), fit = fitGenome(sp, q.w);
    fry.push({ k: q.k, x, y: clamp(num(q.y, bedY(x) * 0.5), 0, H), n: clamp(q.n, 1, 1e7), L, W: clamp(num(q.W, stdWeight(sp.lw, L)), 1e-7, 1e4), age: Math.max(0, num(q.a, 0)),
      gen: nonNegInt(q.g), hue: hueOr(q.hu, null) ?? sp.randomHue(rand), w: fit.g, gn: fitGenes(Array.isArray(q.gn) ? q.gn : []), vx: clamp(num(q.vx, 0), -50, 50),
      ni: Number.isSafeInteger(q.ni) && q.ni > 0 ? q.ni : 0, nx: clamp(num(q.nx, x), 0, W), ny: clamp(num(q.ny, 0), 0, H),
      tk: clamp(num(q.tk, 0), 0, FRY.TICK), tx: clamp(num(q.tx, x), 0, W), ty: clamp(num(q.ty, 0), 0, H), rO2: clamp(num(q.ro, 0), 0, 1e6), p: clamp(num(q.p, 1), 0, 1), dead: false });
  }
  // the evolution history (older saves: none): time-ordered samples of finite rows of the right length, known species only
  const evo = [], rowLen = 2 + 2 * GENE_KEYS.length;
  for (const e of Array.isArray(s.evo) ? s.evo : []) {
    if (evo.length >= EVO.MAX || !isObj(e) || !isNum(e.t) || !isObj(e.s) || (evo.length && e.t < evo[evo.length - 1].t)) continue;
    const so = {}; for (const k of SPECIES) { const r = e.s[k]; if (Array.isArray(r) && r.length === rowLen && r.every(isNum)) so[k] = r.slice(); }
    evo.push({ t: e.t, s: so });
  }
  const rng = Number.isInteger(s.rng) && s.rng >= 0 && s.rng <= 0xFFFFFFFF ? s.rng : null;
  return { time, maxGen, stats, env, agents, plants, detritus, larvae, insects, snails, cray, corpses, structs, nextId, rng, rep, genePool, birds, nymphs, dflies, herps, fry, evo };
}
// a fish's typical length (cm) at a given age (s): the species' von Bertalanffy curve fitted to north-temperate length-at-
// age data (species.js `vb`). Used ONLY to give a fish of a known age a plausible starting length (founders, immigrants,
// pre-v27 saves) — after that its length is whatever its own energy budget grows (the step's bioenergetics).
export function lengthAtAge(sp, age) {
  const t = age / TIME.YEAR_LEN;
  return clamp(sp.vb.Linf * (1 - Math.exp(-sp.vb.k * (t - sp.vb.t0))), sp.Lhatch, sp.vb.Linf);
}
// RESERVE (0..1) from condition K: 0 at the starvation margin BIOE.K_STARVE, 1 at a normal, well-fed K = 1 — the
// brain's "energy" sense and the UI's condition bar
const reserveOf = K => clamp((K - BIOE.K_STARVE) / (1 - BIOE.K_STARVE), 0, 1);
// SIZE-SCALED behaviour: within a species, swimming speed and acceleration rise with length^0.6 (critical swimming speed
// in cm/s scales as TL^0.60, so a fry is slow in cm/s but quick in body lengths/s), the strike/food reach with length^0.7
// and the visual range with length^0.3 (eye size grows more slowly than the body); small fish turn tighter. Called when
// the length changes (growth); the gene-derived bases (`*0`) are fixed at birth.
function sizeScale(a) {
  const r = a.L / a.sp.Lref, s5 = clamp(Math.pow(r, 0.6), 0.3, 1.3);   // Ucrit ∝ TL^0.60 (Cano-Barbacil et al. 2020, >90 sources)
  a.maxSpeed = a.maxSpeed0 * s5; a.accel = a.accel0 * s5;
  a.eatRadius = a.sp.eatRadius * clamp(Math.pow(r, 0.7), 0.3, 1.4);
  a.senseRange = a.senseRange0 * clamp(Math.pow(r, 0.3), 0.5, 1.15);
  a.maxTurn = a.maxTurn0 * clamp(Math.pow(r, -0.2), 0.9, 1.5);
  a.size = a.sp.size * r; a.grow = r;   // sprite scale (the species' adult sprite at its reference length) + "how grown" for UI/render
}
// maturation length (cm): the species' length at 50 % maturity × the size gene (see makeAgent); males of some species mature
// smaller (perch: sp.LmatM)
// the MATURATION REACTION NORM: a fish past its species' matMinAge matures at a length that falls with age (BIOE.PMRN_SLOPE a
// year, to BIOE.PMRN_FLOOR × its Lmat) — slow growers mature older and smaller, fast growers younger and larger
const lmatAt = (sp, age) => Math.max(BIOE.PMRN_FLOOR, 1 - BIOE.PMRN_SLOPE * Math.max(0, (age - sp.matMinAge) / TIME.YEAR_LEN));
const matureAt = (sp, L, Lmat, age) => age >= sp.matMinAge && L >= Lmat * lmatAt(sp, age);
const lmatOf = (sp, gSize, sex) => sp.Lmat * Math.pow(gSize, BIOE.LMAT_GENE) * (sex === 1 && sp.LmatM ? sp.LmatM / sp.Lmat : 1);
// re-derive everything that follows from the body: condition K, the reserve, gut-fullness hunger, size-scaled behaviour
function settleBody(a) {
  a.K = a.W / stdWeight(a.sp.lw, a.L); a.energy = reserveOf(a.K);
  a.hunger = 1 - clamp(a.gut / (a.sp.gut * a.W), 0, 1); sizeScale(a);
}
// `cond`: the newborn's condition K (W / standard weight for its length); age (s) → its starting length
function makeAgent(species, x, y, cond, gen, hue, genome, age = 0, genes = null) {
  const sp = SP[species], shape = sp.shape;
  // multi-gene genome: size/speed/tol physiology + fin/eye/body MORPHOLOGY → effective per-individual stats.
  // Genes are multipliers ~1.0, so gene≈1 reproduces the species baseline. Every benefit has a cost folded into
  // metabMul (and body/fin add drag), so traits trade off and selection has something to push on.
  const gn = genes ? fitGenes(genes) : randomGenes();   // a brand-new fish gets fresh near-1.0 variation
  const gSize = gn[0], gSpeed = gn[1], gTol = gn[2], gFin = gn[3], gEye = gn[4], gBody = gn[5], gBrain = gn[6];
  // EVOLVABLE BRAIN SIZE: how many hidden units are active (the rest masked in forward). gBrain≈1 → full layer (baseline).
  const activeHid = clamp(Math.round(shape.hid * gBrain), Math.min(BRAIN.HID_MIN, shape.hid), shape.hid);
  const maxTurn0 = sp.maxTurn * (0.6 + 0.4 * gFin);                    // bigger fins → sharper turns (maneuverability)
  const accel0 = sp.accel * (0.8 + 0.2 * gBody);                        // deeper body → more thrust/acceleration
  const senseRange0 = sp.senseRange * (0.6 + 0.4 * gEye);               // bigger eyes → see farther
  const maxSpeed0 = sp.maxSpeed * gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin);  // deep body & big fins drag → slower top speed
  const bodyMul = 0.8 + 0.2 * gBody;                                    // deeper body → harder for a gape-limited predator to swallow
  const tempTol = sp.tempTol * gTol;
  const o2Crit = clamp(sp.o2Crit * (2 - gTol), 0.05, 0.9);              // hardier → lower critical O₂ …
  const o2Lethal = clamp(sp.o2Lethal / ENV.O2_MGL * (2 - gTol), 0.005, 0.5);   // … and lethal O₂ (normalised, at 25 °C)
  const uilt = sp.uilt + BIOE.UILT_GENE * (gTol - 1);                    // …and a higher upper lethal temperature
  // the SIZE gene is the MATURATION SIZE (a life-history trait): mature smaller and earlier, or bigger and later with more
  // eggs — the classic trade-off selection acts on (predation on large fish and fishing favour early maturation)
  // maintenance cost of the traits (× the standard respiration): faster/hardier cost more, and so do big fins/eyes/a deep
  // body; a SMALLER brain is cheaper (per-neuron saving; ×1 at the full-brain baseline)
  const metabMul = (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol)
    * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody)
    * (1 - BRAIN.COST * (shape.hid - activeHid) / shape.hid);
  const brain = genome || randomGenome(shape);   // the inherited genotype; the plastic policy `lw` starts as a copy of it
  const sex = rand() < 0.5 ? 0 : 1;              // 0 female, 1 male
  const L = age > 0 ? lengthAtAge(sp, age) : sp.L0, K = clamp(cond, 0.5, 1.2), W = K * stdWeight(sp.lw, L);
  const Lmat = lmatOf(sp, gSize, sex);
  const a = {
    id: nextAgentId(), species, sp, genes: gn, maxSpeed0, maxTurn0, accel0, senseRange0, bodyMul, tempTol, o2Crit, o2Lethal, uilt, metabMul, activeHid,
    x, y, homeX: x, heading: rand(0, Math.PI * 2), spd: rand(1, 6), vis: 0,   // homeX = natal site (the spatial-cognition homing anchor)
    // body: length (cm), wet mass (g), condition, sex, maturation length; the gut (g of food, J it holds)
    L, W, K, sex, Lmat, mature: matureAt(sp, L, Lmat, age), gut: 0, gutE: 0, energy: reserveOf(K), rO2: 0,
    gon: matureAt(sp, L, Lmat, age) ? (sex === 0 ? sp.gsiF : sp.gsiM) * W * 0.5 : 0,   // gonad mass (g): an adult starts half-ripe
    gen, hue, age, eaten: 0, tox: 0, hunger: 1, fear: 0, mateCd: rand(0, sp.matingCooldown), dead: false, _mated: false, turnSmooth: 0, thrustSmooth: 0,
    g: brain, lw: Float32Array.from(brain),   // g = inherited GENOTYPE (fixed, used for breeding/saving); lw = the PLASTIC policy `forward` runs (lifetime learning nudges it; Baldwinian)
    act: { h: new Float32Array(shape.hid), o: new Float32Array(OUT), turn: 0, thrust: 0, strike: 0, flee: 0, hide: 0, in: new Float32Array(shape.in) },
  };
  settleBody(a);
  return a;
}
// a founder's age (s): 1 yr + an exponential with the species' M (the stable age distribution), within 90 % of maxAge
function foundingAge(sp) {
  const Y = TIME.YEAR_LEN, amax = 0.9 * sp.maxAge / Y;
  for (let i = 0; i < 16; i++) { const a = 1 - Math.log(1 - rand()) / sp.M; if (a < amax) return a * Y; }
  return Y;
}
// a founder of the REGIONAL population a species' immigrants come from: a naive genome + fresh trait genes (a new lake's
// regional pool starts at the same evolutionary point as its own founders, then exchanges genes with the lake)
function poolFounder(k) { const sp = SP[k]; return { w: randomGenome(sp.shape), gn: randomGenes(), hue: sp.randomHue(rand), gen: 0 }; }

// pick a macrophyte variety appropriate to the rooting bed-depth fraction (so forms zonate by depth: shallow
// shelf → lily/chara/pondweed, drop-off → pondweed/milfoil, deep → milfoil). Random among the depth-matching forms.
function pickVariety(bedM) {
  let cands = null, c0 = -1;
  for (let i = 0; i < MACRO.length; i++) if (bedM >= MACRO[i].zone[0] && bedM <= MACRO[i].zone[1]) { if (cands) cands.push(i); else if (c0 < 0) c0 = i; else { cands = [c0, i]; } }
  if (cands) return cands[(rand() * cands.length) | 0];
  if (c0 >= 0) return c0;
  // no zone fits (shallower or deeper than every form): the form whose zone is nearest — deep beds get the deep, shade-
  // tolerant milfoil (which then starves of light below its limit, as real plants do)
  let best = 0, bd = Infinity; for (let i = 0; i < MACRO.length; i++) { const z = MACRO[i].zone, d = bedM < z[0] ? z[0] - bedM : bedM - z[1]; if (d < bd) { bd = d; best = i; } }
  return best;
}
// a newborn's spawn point: scattered in an annulus BROOD.SCATTER around (x, y) — out of the parents' immediate strike
// reach — and kept inside the water column (above the bed, below the surface). Seeded RNG → deterministic.
function broodPos(x, y) {
  const ang = rand(0, Math.PI * 2), r = rand(BROOD.SCATTER[0], BROOD.SCATTER[1]);
  const bx = clamp(x + Math.cos(ang) * r, 2, W - 2);
  return { x: bx, y: clamp(y + Math.sin(ang) * r, 2, bedY(bx) - 2) };
}
const wrapHue = h => ((h % 360) + 360) % 360;
// derive a plant's EFFECTIVE per-individual params from its variety (MACRO[v]) × its trait genes (p.gn). Genes are
// multipliers around 1.0, so at gene≈1 these equal the variety baseline (a fresh lake = the pre-evolution behaviour).
// Trade-offs: shade-tolerance (lower light gene → lower lightMin, survives darker) and grazing-defence (lower palat
// gene → tougher) both COST growth, and bigger leaves raise the light requirement — so no gene trivially maximises.
export function derivePlant(p) {
  const mv = MACRO[p.v] || MACRO[0], g = p.gn;
  const gMaxH = g[0], gGrow = g[1], gLight = g[2], gWarmth = g[3], gPalat = g[4], gLeaf = g[5];
  p.form = mv.form;
  p.leaf = gLeaf;                                         // leaf area (visible: drawn leaf/pad size)
  p.cover = mv.cover * gLeaf;                             // bigger leaves → more refuge cover
  p.o2 = mv.o2 * gLeaf;                                   // …and more photosynthetic area
  p.palat = mv.palat * gPalat;                            // grazing palatability (tough forms yield less energy)
  p.tempMin = mv.tempMin * gWarmth;                       // warmth REQUIREMENT (higher gene → needs warmer water; cold tolerance is its inverse)
  p.lightMin = mv.lightMin * gLight * (0.85 + 0.15 * gLeaf);   // shade tolerance (light-starvation death threshold)
  p.growMul = mv.grow * gGrow * (0.6 + 0.4 * gLight) * (0.6 + 0.4 * gPalat);   // growth, minus tolerance/defence costs
}
// Create a plant. With a `parent` it inherits (clonal seeding) the parent's genes + colour, MUTATED — heredity, so
// selection accumulates; without one it gets fresh near-1.0 genes (colonisation / cold-start founders). The VARIETY is
// always re-chosen by rooting depth (depth-zonation is an ecological constraint, not heritable here) — genes drift
// WITHIN each form. Macrophytes are predominantly clonal, so single-parent inheritance is the realistic default.
function newPlant(x, mature, parent = null, clone = false) {
  const base = bedY(x) + rand(-1, 2);                    // rooted on the (curved) lake bed
  // a RUNNER (clone) is the parent's own species wherever it roots; a seedling's form is set by its rooting depth
  const v = clone && parent ? parent.v : pickVariety(base / WORLD.PX_PER_M), mv = MACRO[v];   // (zones in metres of bed depth)
  const gn = parent ? mutateGenes(parent.gn, clone ? 0.25 : 0.5, 0.045) : randomPlantGenes();   // slow drift (clones barely); core.rand → deterministic
  const hue = parent ? wrapHue(parent.hue + gauss() * 7) : wrapHue(mv.hue + rand(-6, 6));
  const maxH = clamp(rand(mv.maxH[0], mv.maxH[1]) * gn[0], 6, Math.max(6, Math.min(140, base - 2)));   // (no taller than the water)
  const height = mature ? rand(PLANT.WINTER_MIN, maxH) : PLANT.WINTER_MIN;
  // `nut` = the N+P (balanced organic units) this plant has actually absorbed. It starts EMPTY — a seedling's or founder's
  // starting biomass carries none, so nothing is ever returned that wasn't taken — and every loss (shed, grazed, death)
  // returns its proportional share. That makes the plant pool mass-conserving.
  const p = { x, baseY: base, v, gn, hue, maxHeight: maxH, height, biomass: height * PLANT.BIOMASS_PER_PX, y: base - height * 0.5, dead: false, nut: 0 };
  derivePlant(p);
  return p;
}
// macrophytes need light → they form dense beds on the shallow lit littoral shelf and are sparse
// in the dark deep middle. Bias seeding x toward the shelves (the rest still spreads, but those
// deep seedlings are light-limited and tend to uproot — the beds self-concentrate on the shelf).
function plantX() {
  if (rand() < 0.75) return littoralX(rand);   // most seeds land on the littoral (any water body)
  return rand(6, W - 6);
}
// shading competition: sum the overhead leaf-cover that TALLER plants in `neighbours` cast on plant `p` (within
// COMPETE.RADIUS, with a horizontal falloff). The caller turns it into a light multiplier exp(-SHADE·overhead).
// Deterministic (no RNG); cover already folds in the per-plant leaf gene → big-leaved plants shade harder.
function overheadFrom(p, neighbours, RAD) {
  let o = 0;
  for (let i = 0; i < neighbours.length; i++) {
    const q = neighbours[i];
    if (q === p || q.dead || q.height <= p.height) continue;   // only strictly taller neighbours shade
    const dx = Math.abs(q.x - p.x); if (dx >= RAD) continue;
    o += q.cover * (1 - dx / RAD);
  }
  return o;
}

export class World {
  constructor(opts = {}) {
    this.W = W; this.H = H; this.FLOOR = FLOOR;
    this.env = new Environment();
    // agentGrid.sub = the piscivores alone (only a fish-eater can pass canPreyFn as the predator), so qThreat scans those
    // instead of every fish in sight; filled in the same rebuild pass → identical bucket placement and order
    this.agentGrid = new SpatialGrid(W, H, GRID.AGENT_CELL, isPiscivore);
    this.detritusGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);
    this.larvaeGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);   // benthic insect larvae (bottom-fish food)
    this.insectGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);   // emerged surface insects (surface-fish food)
    this.snailGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);    // benthic grazing snails (sunfish/carp/crayfish food)
    this.crayGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);     // benthic crayfish (bass/pike/catfish food)
    this.nymphGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);    // dragonfly nymphs (fish food)
    this.herpGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);     // tadpoles, frogs, turtles (fish food when they fit)
    this.fryGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);      // young-of-year fry schools (FRY)
    this.time = 0; this.maxGen = 0;
    this.stats = { foodEaten: 0, fishEaten: 0, births: {}, immigrants: {} };  // births = home-bred (sexual+asexual); immigrants = rescue arrivals — per species
    this.series = [];           // {g,c,b...} census + env over time
    this._seriesAcc = 0;
    this.evo = []; this._evoSlot = -1;   // the evolution history (EVO): trait means/SDs per species over the whole run
    this.selectedId = null;
    this._counts = {};
    this.reset();
  }

  reset() {
    this._nextId = 1; _idOwner = this;   // per-world id counter (see nextAgentId)
    this.agents = []; this.detritus = []; this.plants = []; this.corpses = [];
    this.larvae = []; this.insects = [];   // aquatic-insect life cycle: benthic larvae ↔ emerged surface adults
    this.snails = []; this.cray = [];      // benthic invertebrates: grazing snails + omnivorous crayfish
    this.birds = [];                       // visiting fish-eating diving birds (loons) — BIRD
    this.env = new Environment();
    // a fresh lake opens in late spring (SEASON.START_YF) with that season's thermal state, not an ice-bound March 1
    this.time = SEASON.START_YF * SEASON.YEAR_LEN; this.env.primeSeason(this.time); this.maxGen = 0; this.stats.foodEaten = 0; this.stats.fishEaten = 0;
    this.stats.births = {}; this.stats.immigrants = {}; for (const k of SPECIES) { this.stats.births[k] = 0; this.stats.immigrants[k] = 0; }
    this.series = []; this._seriesAcc = 0; this.selectedId = null; this.evo = []; this._evoSlot = -1;
    for (const key of SPECIES) {
      const sp = SP[key];
      for (let i = 0; i < popStart(sp); i++) {
        const p = sp.spawnPos(rand);
        // a STABLE AGE STRUCTURE — what the species' natural mortality M leaves: yearlings and older, ages drawn from
        // e^(−M·(age − 1 yr)) well inside its lifespan. So a lake opens with many small young fish and few big old ones, as a
        // real one does (a pike population is mostly 1–4-year-olds; most bluegills are under 15 cm). The first two of each
        // species are a breeding pair (adults, female and male): even the rarest species' few founders include its adults
        let age = foundingAge(sp);
        for (let t = 0; i < 2 && t < 50 && age < sp.matureAge; t++) age = foundingAge(sp);
        const f = makeAgent(key, p.x, zoneY(sp, p.x), rand(BIOE.K_START[0], BIOE.K_START[1]), 0, sp.randomHue(rand), null, age);
        if (i < 2) {   // (grown past its own genetic maturation length if the age draw left it short)
          f.sex = i; f.Lmat = lmatOf(sp, f.genes[0], f.sex);
          if (f.L < f.Lmat * 1.05) { f.L = f.Lmat * 1.05; f.W = f.K * stdWeight(sp.lw, f.L); settleBody(f); }
          f.mature = f.age >= sp.matMinAge;
        }
        f.mateCd = 0;   // founders haven't spawned yet this year (the water-temperature window alone decides when they can)
        if (f.mature) f.gon = (f.sex === 0 ? sp.gsiF : sp.gsiM) * f.W;   // …and carry the ripe gonads they built over the winter
        this.agents.push(f);
      }
    }
    // the REGIONAL gene pool immigrants come from (connected waters' populations), per species — see the step's gene flow
    this.genePool = {}; for (const k of SPECIES) { this.genePool[k] = []; for (let i = 0; i < IMMIGRATION.POOL_N; i++) this.genePool[k].push(poolFounder(k)); }
    for (let i = 0, n = scaleCount(INSECT.LARVA_SEED); i < n; i++) this.larvae.push(this._mkLarva(undefined, rand(0, 0.9), PREY.LARVA_G));   // the overwintered, full-grown cohort
    for (let i = 0, n = scaleCount(SNAIL.SEED); i < n; i++) this.snails.push(this._mkSnail());
    for (let i = 0, n = scaleCount(CRAYFISH.SEED); i < n; i++) this.cray.push(this._mkCray());
    // wildlife: dragonfly nymphs of mixed ages, adult frogs and painted turtles (no adults on the wing / tadpoles in May yet)
    this.nymphs = []; this.dflies = []; this.herps = []; this.fry = [];
    for (let i = 0, n = scaleCount(ODONATA.SEED); i < n; i++) this.nymphs.push(this._mkNymph());
    for (let i = 0, n = scaleCount(FROG.SEED); i < n; i++) this.herps.push(this._mkHerp(1, plantX(), 2, rand(FROG.MATURE, FROG.LIFE * 0.6) * TIME.YEAR_LEN));
    for (let i = 0, n = scaleCount(TURTLE.SEED); i < n; i++) this.herps.push(this._mkHerp(2, plantX(), 2, rand(TURTLE.MATURE, TURTLE.LIFE * 0.6) * TIME.YEAR_LEN));
    for (let i = 0, n = scaleCount(SEED_COUNTS.plants); i < n; i++) this.plants.push(newPlant(plantX(), true));
    for (let i = 0, n = scaleCount(SEED_COUNTS.detritus); i < n; i++) { const x = rand(20, W - 20); this.spawnDetritus(x, bedY(x) - rand(0, 50), NUTRIENT.FROM_DETRITUS); }   // seeded detritus carries organic N+P
    this._genStructures();
  }

  bedY(x) { return bedY(x); }   // world-y of the lake bed at x (for senses & rendering)
  // jump a lake to a calendar date (year-fraction, 0 = March 1) with that season's thermal state, ice and stratification
  // (tests and scenarios; setting `time` alone leaves the opening May water in place until it slowly relaxes)
  setDate(yf) { this.time = yf * SEASON.YEAR_LEN; this.env.primeSeason(this.time); return this; }

  // static habitat structure: reed clumps on the shallow shores, submerged logs on the bed,
  // and mussel beds (benthic filter feeders) on the lit bed
  _genStructures() {
    this.reeds = []; this.logs = []; this.mussels = []; this.weedbeds = [];
    const lin = WORLD.W / WORLD.REF_W, P = WORLD.PX_PER_M;   // shore/bed features scale with width
    // an x whose bed depth (m) lies in [d0, d1] — rejection sampling with the sim RNG (the landscape's own littoral)
    const xAt = (d0, d1) => { let x = 0; for (let k = 0; k < 80; k++) { x = rand(6, W - 6); const d = bedY(x) / P; if (d >= d0 && d <= d1) return x; } return x; };
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.REEDS * lin)); i < n; i++) {
      const x = xAt(0, STRUCTURE.REED_D);   // emergent reeds at the water's edge
      this.reeds.push({ x, baseY: bedY(x), height: rand(20, 52), n: 3 + (rand() * 4 | 0) });
    }
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.LOGS * lin)); i < n; i++) {
      const x = rand(50, W - 50);
      this.logs.push({ x, y: bedY(x) - rand(0, 6), len: rand(22, 52), ang: rand(-0.35, 0.35) });
    }
    // submerged macrophyte beds on the littoral and the upper slope: weed bands rooted on the bed reaching up through 15–85 %
    // of the water column — the cover where pickerel ambush and sunfish hold (not the deep, hypoxic centre)
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.WEEDBEDS * lin)); i < n; i++) {
      const x = xAt(STRUCTURE.WEED_D[0], STRUCTURE.WEED_D[1]), bed = bedY(x);
      this.weedbeds.push({ x, top: Math.max(6, bed * rand(0.15, 0.6)), bot: bed, w: rand(16, 30) });
    }
    for (let i = 0, n = Math.max(1, Math.round(MUSSEL.COUNT * lin)); i < n; i++) {
      const x = xAt(0.3, STRUCTURE.MUSSEL_D);   // the lit bed where phytoplankton is there to filter
      this.mussels.push({ x, y: bedY(x), n: 4 + (rand() * 5 | 0) });
    }
  }

  // cover (0..1): refuge from predators provided by nearby reeds, logs, and tall weeds
  coverAt(x, y) {
    const R = COVER.RADIUS, R2 = R * R; let c = 0;
    for (const r of this.reeds) { const dx = x - r.x, dy = y - (r.baseY - r.height * 0.5); const d2 = dx * dx + dy * dy; if (d2 < R2) c += 0.7 * (1 - Math.sqrt(d2) / R); }
    for (const lg of this.logs) { const dx = x - lg.x, dy = y - lg.y; const d2 = dx * dx + dy * dy; if (d2 < R2) c += 0.6 * (1 - Math.sqrt(d2) / R); }
    for (const p of this.plants) { if (p.dead || Math.abs(x - p.x) > R) continue; const top = p.baseY - p.height; if (y < top - 8 || y > p.baseY + 6) continue; const dx = x - p.x, d = Math.abs(dx); c += 0.45 * p.cover * clamp(p.height / 40, 0, 1) * (1 - d / R); }
    for (const wb of this.weedbeds) { const dx = Math.abs(x - wb.x); if (dx > wb.w || y < wb.top - 8 || y > wb.bot + 6) continue; c += 0.6 * (1 - dx / wb.w); }
    return c < 1 ? (c < 0 ? 0 : c) : 1;
  }
  // nearest cover STRUCTURE (weed bed / reed clump / log) within r — a long-range attractor for
  // cover-seeking fish. Weed beds are targeted at mid-bed height (oxygenated mid-water), reeds/logs at theirs.
  nearestCover(x, y, r) {
    let best = null, bd = r * r;
    for (const wb of this.weedbeds) { const my = (wb.top + wb.bot) * 0.5, dx = x - wb.x, dy = y - my, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { x: wb.x, y: my }; } }
    for (const s of this.reeds) { const sy = s.baseY - s.height * 0.5, dx = x - s.x, dy = y - sy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { x: s.x, y: sy }; } }
    for (const s of this.logs) { const dx = x - s.x, dy = y - s.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { x: s.x, y: s.y }; } }
    return best;
  }

  // add g grams of zooplankton (k 0 Daphnia, 1 copepods) to the field cell at (x, y) — the UI's "scatter plankton" and tests
  addZoo(x, y, g, k = 0) { const e = this.env, i = e.cellOf(x, y); if (e.isWet(i) && g > 0) (k ? e.zooC : e.zooD)[i] += g; }
  // `n` = organic N+P (DOM units) the particle carries. Default 0: fish-death detritus is nutrient-NEUTRAL (fish hold no
  // N/P in this model — their remains are food/energy, not a nutrient source). Only seeded detritus carries nutrient.
  spawnDetritus(x, y, n = 0) {
    if (this.detritus.length >= scaleCount(DETRITUS.CAP)) { if (n > 0) this.env.addDOM(x, y, n); return; }   // at cap: dissolve now (never destroy N/P)
    const cx = clamp(x, 2, W - 2);
    this.detritus.push({ x: cx, y: clamp(y, 2, bedY(cx)), life: DETRITUS.LIFE * (0.6 + rand() * 0.8), n, m: PREY.DETRITUS_G, dead: false });
  }
  // a benthic insect larva on the lake bed (detritivore; develops with warmth, then emerges). `dev` 0..1 maturity.
  // a patch of insect larvae: on the bed (at x, if given) — or, for a share INSECT.EPIPHYTE of new patches, up the stem of a
  // macrophyte (the plant-dwelling midges, mayflies and caddis that are most of a bluegill's and young perch's food in
  // the weeds; invertebrates are densest on plants, Diehl 1992 / Cyr & Downing 1988)
  // `m` = its grams (a new patch of young instars starts at INSECT.LARVA_M0 and grows on the bed's detritus)
  _mkLarva(x, dev, m = INSECT.LARVA_M0) {
    dev = dev ?? rand(0, 0.25);
    if (x === undefined && this.plants.length && rand() < INSECT.EPIPHYTE) {
      const p = this.plants[(rand() * this.plants.length) | 0];
      if (!p.dead && p.height > 6) return { x: clamp(p.x + rand(-3, 3), 4, W - 4), y: Math.max(2, p.baseY - p.height * rand(0.15, 0.9)), dev, m, dead: false };   // (in the water, below the surface)
    }
    const px = x ?? rand(8, W - 8); return { x: px, y: bedY(px) - rand(1, 5), dev, m, dead: false };
  }
  // an emerged adult insect at the surface (drifts, short-lived, surface-fish food). `wob` = render flutter phase.
  _mkInsect(x, m = PREY.INSECT_G) { const px = clamp(x ?? rand(8, W - 8), 4, W - 4); return { x: px, y: rand(2, 14), life: INSECT.ADULT_LIFE * (0.7 + rand() * 0.6), vx: rand(-INSECT.ADULT_DRIFT, INSECT.ADULT_DRIFT), wob: rand(0, 6.28), m, dead: false }; }
  // a benthic snail crawling the lit bed (biased to the littoral shelf where algae/plants concentrate; shallower than
  // SNAIL.MAX_DEPTH). `ph` = render phase.
  _mkSnail(x) { let px = x ?? plantX(); for (let t = 0; x === undefined && t < 20 && bedY(px) > SNAIL.MAX_DEPTH * H; t++) px = plantX(); return { x: px, y: bedY(px) - rand(0, 3), vx: rand(-SNAIL.CRAWL, SNAIL.CRAWL), ph: rand(0, 6.28), dead: false }; }
  // a benthic crayfish walking the bed (drifts toward cover; crepuscular). `ph` = render leg-wiggle phase.
  // (on the littoral/sublittoral bed: shallower than CRAYFISH.MAX_DEPTH × H)
  _mkCray(x) {
    let px = x ?? rand(8, W - 8);
    for (let t = 0; x === undefined && t < 20 && bedY(px) > CRAYFISH.MAX_DEPTH * H; t++) px = rand(8, W - 8);
    return { x: px, y: bedY(px) - rand(1, 4), vx: rand(-CRAYFISH.CRAWL, CRAYFISH.CRAWL), ph: rand(0, 6.28), dead: false };
  }

  // a dragonfly nymph sprawled on the bed of the weedy shallows: `h` = how high it sits above the bed, `dev` 0..1 maturity
  _mkNymph(x, dev) { const px = x ?? plantX(); return { x: px, h: rand(1, 4), y: bedY(px) - 2, dev: dev ?? rand(0, 0.9), vx: rand(-ODONATA.CRAWL, ODONATA.CRAWL), dead: false }; }
  // an adult dragonfly on the wing, low over the water (negative y = above the surface)
  _mkDragonfly(x) { return { x: clamp(x, 10, W - 10), y: -12, vx: (rand() < 0.5 ? -1 : 1) * ODONATA.FLY * (0.5 + rand() * 0.5), life: ODONATA.ADULT_LIFE * (0.7 + rand() * 0.6), ph: rand(0, 6.28), dead: false }; }
  // a herp: k 0 tadpole, 1 frog, 2 turtle; e = energy 0..1, st = state (frog 0 surface / 1 diving / 2 hibernating; turtle
  // 0 foraging below / 1 up for air / 2 hibernating), t = state timer, cd = breeding cooldown, dev = tadpole development
  _mkHerp(k, x, y, age = 0) {
    const px = clamp(x, 6, W - 6);
    return { k, x: px, y: clamp(y, 1, bedY(px) - 2), vx: rand(-4, 4), age, e: k === 0 ? 0.5 : 0.8, st: 0, t: rand(5, 30), cd: 0, dev: 0, dead: false };
  }

  // ---------- spatial queries used by senses (visual range shortened by water turbidity) ----------
  qPlankton(x, y, r) { return this.env.zooBest(x, y, Math.min(r, PLANKTON.SIGHT) * this.env.clarity(), ZB); }   // tiny prey: the richest zooplankton within a few body lengths
  qDetritus(x, y, r) { const c = this.env.clarity(); return this.detritusGrid.nearest(x, y, r * c, notDead); }
  qInsect(x, y, r) { const c = this.env.clarity(); return this.insectGrid.nearest(x, y, r * c, notDead); }
  qLarva(x, y, r) { const c = this.env.clarity(); return this.larvaeGrid.nearest(x, y, r * c, larvaFree); }   // benthic insect larvae (perch, bottom feeders)
  // the bed's worms and scuds (BENTHOS): the richest stretch of bed in sight that holds them above their refuge, under water the
  // fish can breathe (env.benthBest) — so a bottom forager whose own patch is grazed bare moves on to a richer one
  qBed(a) { return this.env.benthBest(a.x, a.y, a.senseRange * this.env.clarity(), a.sp.o2Crit, QB); }
  // nearest surface food for a planktivore/omnivore — zooplankton OR an emerged insect (so fish RISE to a hatch).
  qSurfaceFood(a) { const p = this.qPlankton(a.x, a.y, a.senseRange), i = this.qInsect(a.x, a.y, a.senseRange); return !p ? i : !i ? p : (i.dist < p.dist ? i : p); }
  // a fish's plant SENSE: like the other q* senses, its visual range shrinks with water turbidity
  qPlant(x, y, r) { return this.nearestPlant(x, y, r * this.env.clarity()); }
  // nearest live plant within r (linear scan — few plants; point-to-stem distance). NOT clarity-scaled: used directly
  // for non-visual lookups (the seed-parent search), so plant heredity doesn't weaken in murky water.
  // Plants are bucketed by x (they never move), so only the columns within r are scanned instead of every plant for
  // every fish (~7% of a step). Ties keep the LOWEST array index, exactly what the old first-wins linear scan returned.
  nearestPlant(x, y, r) {
    const P = this.plants, idx = this._plantCols(), C = PLANT_COL, last = idx.length - 1;
    const c0 = clamp(Math.floor((x - r) / C), 0, last), c1 = clamp(Math.floor((x + r) / C), 0, last);
    let best = null, bi = -1, bd = r * r;
    for (let c = c0; c <= c1; c++) {
      const col = idx[c];
      for (let k = 0; k < col.length; k++) {
        const i = col[k], p = P[i];
        if (p.dead) continue;
        const dx = x - p.x, top = p.baseY - p.height, yc = clamp(y, top, p.baseY), dy = y - yc, d = dx * dx + dy * dy;
        if (d < bd || (d === bd && best !== null && i < bi)) { bd = d; best = p; bi = i; }
      }
    }
    return best ? { item: best, dist: Math.sqrt(bd) } : null;
  }
  // x-column index of this.plants (array indices, ascending). Plants only change by push (length) or filter/load (new
  // array), so (array, length) identifies a still-valid index; a stale one is rebuilt on the next query.
  _plantCols() {
    const P = this.plants;
    if (this._pcArr === P && this._pcLen === P.length) return this._pc;
    const n = Math.ceil(W / PLANT_COL) + 1, idx = this._pc && this._pc.length === n ? this._pc : Array.from({ length: n }, () => []);
    for (const col of idx) col.length = 0;
    for (let i = 0; i < P.length; i++) idx[clamp(Math.floor(P[i].x / PLANT_COL), 0, n - 1)].push(i);
    this._pc = idx; this._pcArr = P; this._pcLen = P.length;
    return idx;
  }
  canPrey(pred, prey) { return canPreyFn(pred, prey); }   // see canPreyFn (module scope)
  bioOf(a) { return bioOf(a); }   // the fish's FB4 parameter set (see bioOf, module scope)
  // the last result is remembered (_qtA/_qtR, _qpA/_qpR) so step() can reuse what senses() just computed for the same fish.
  // A DIVING loon close by that could swallow this fish is a threat too (whichever is nearer).
  qThreat(a) {
    const r = a.senseRange * 1.1 * this.env.clarity(); this._qtA = a;
    let res = this.agentGrid.sub.nearest(a.x, a.y, r, isThreatTo, a);
    if (this.birds.length && a.L <= BIRD.PREY_MAX) for (const b of this.birds) {
      if (b.st !== 1) continue;   // only underwater
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d < r && (!res || d < res.dist)) res = { item: b, dist: d };
    }
    return (this._qtR = res);
  }
  // the nearer of a catchable fish and a school of young fish it could eat (the prey sense; takePrey kills only fish —
  // schools are cropped in _eatFry)
  qPrey(a) {
    const r = a.senseRange * this.env.clarity(); this._qpA = a;
    let m = this.agentGrid.nearest(a.x, a.y, r, isPreyOf, a);
    if (this.fry.length && a.sp.diet.fish && a.L >= a.sp.Lpisc) { const f = this.fryGrid.nearest(a.x, a.y, m ? m.dist : r, fryPreyOf(a), a); if (f && (!m || f.dist < m.dist)) m = f; }
    return (this._qpR = m);
  }
  // an exposed crayfish in sight that this fish could take (a crayfish eater whose gape fits one — CRAYFISH.WIDTH): the bass's
  // and pickerel's prey sense sees crayfish as well as fish (crayfish are 60–90 % of an adult smallmouth's diet)
  qCray(a) {
    if (!a.sp.diet.cray || gapeOf(a) < CRAYFISH.WIDTH || !this.cray.length) return null;
    return this.crayGrid.nearest(a.x, a.y, a.senseRange * this.env.clarity(), exposedCray);
  }
  qMate(a) { return this.agentGrid.nearest(a.x, a.y, a.sp.mateRadius, isMateFor, a); }
  // trait-based MATE CHOICE (sexual selection): instead of the nearest eligible mate, score every eligible
  // partner nearby by condition (energy) + heritable quality (mean trait gene) + foraging success, and pick
  // the best. So evolution acts on the genome (vigorous, well-fed, good-genes mates are preferred). No RNG.
  chooseMate(a, reach = 1) {
    const r = a.sp.mateRadius * reach, r2 = r * r; let best = null, bestScore = -Infinity;
    this.agentGrid.forNear(a.x, a.y, r, it => {
      if (it.dead || it === a || it.species !== a.species || it.sex === a.sex || !breedReady(it) || it.mateCd > 0 || it._mated) return;
      const dx = it.x - a.x, dy = it.y - a.y; if (dx * dx + dy * dy > r2) return;
      const cond = it.K;                                                           // condition
      const quality = (it.genes[0] + it.genes[1] + it.genes[2]) / 3 - 1;           // mean trait gene above baseline
      const score = cond + 0.6 * quality + 0.003 * it.eaten;                       // good-condition + good-genes + proven forager
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return best ? { item: best } : null;
  }
  oxygenAt(x, y) { return this.env.oxygenAt(x, y); }
  oxygenGrad(x, y) { return this.env.oxygenGrad(x, y); }
  // depth-local light & temperature (for senses → emergent diel vertical migration)
  lightAt(x, y) { return this.env.lightAtDepth(y); }
  tempAt(x, y) { return this.env.tempAt(x, y); }
  allyStats(a, r) {
    // computed once per fish per step and radius: its senses and its schooling reflex both ask (no other fish moves between)
    if (a._alS === this._stepNo && a._alR === r) return a._al;
    let n = 0, sx = 0, sy = 0, vc = 0, vs = 0;
    const r2 = r * r, G = this.agentGrid, c = G.cell, cols = G.cols, B = G.buckets, ax = a.x, ay = a.y, spc = a.species;
    // forNear's exact bucket walk, inlined (no per-item closure call); same visit order → same float sums
    const minx = clamp(((ax - r) / c) | 0, 0, cols - 1), maxx = clamp(((ax + r) / c) | 0, 0, cols - 1);
    const miny = clamp(((ay - r) / c) | 0, 0, G.rows - 1), maxy = clamp(((ay + r) / c) | 0, 0, G.rows - 1);
    for (let cy = miny; cy <= maxy; cy++)
      for (let cx = minx; cx <= maxx; cx++) {
        const b = B[cy * cols + cx];
        for (let i = 0; i < b.length; i++) {
          const it = b[i];
          if (it.dead || it === a || it.species !== spc) continue;
          const dx = it.x - ax, dy = it.y - ay; if (dx * dx + dy * dy > r2) continue;
          n++; sx += it.x; sy += it.y; vc += Math.cos(it.heading); vs += Math.sin(it.heading);
        }
      }
    a._alS = this._stepNo; a._alR = r;
    if (!n) return (a._al = { density: 0, cohSin: 0, cohCos: 0, alignCos: 0 });
    const ca = Math.atan2(sy / n - a.y, sx / n - a.x) - a.heading, avgH = Math.atan2(vs, vc);
    return (a._al = { density: clamp(n / 8, 0, 1), cohSin: Math.sin(ca), cohCos: Math.cos(ca), alignCos: Math.cos(avgH - a.heading) });
  }

  // ---------- feeding ----------
  // take (kill) up to n of the nearest live items within r; returns how many were taken (0 = none → falsy)
  _takeNearest(grid, x, y, r, n = 1, pred = notDead) {
    let k = 0;
    for (; k < n; k++) { const m = grid.nearest(x, y, r, pred); if (!m) break; m.item.dead = true; }
    return k;
  }
  // a bite of up to g grams from the nearest larval patch within r that has larvae outside its refuge; returns the grams
  _biteLarva(x, y, r, g) {
    const m = this.larvaeGrid.nearest(x, y, r, larvaFree); if (!m) return 0;
    const take = Math.min(g, m.item.m - INSECT.REFUGE_M); m.item.m -= take; return take;
  }
  // ZOOPLANKTON MEALS from the fields around the fish (env.zooFeed): it refills its gut at up to PLANKTON.Q × its Cmax rate
  // (cm g/g/day) × a TYPE-III (sigmoid) response to the exposed density (K_ADULT): a fish with other food turns to it when the
  // zooplankton thins (prey switching — Murdoch 1969), so it doesn't hunt the last of them out — a copepod's escape jump beats COPE_ESCAPE of
  // strikes, a Daphnia never escapes (and is the richer meal), and migrants and weed-hidden animals are mostly out of
  // reach. Into the gut; counts a meal when the step's intake is worth it. Returns the meals (0/1).
  _eatZoo(a, room, cm, dt) {
    const t = this.env.zooFeed(a.x, a.y, 1, 1 - PLANKTON.COPE_ESCAPE, Math.min(room, PLANKTON.Q * cm * a.W * dt / BIOE.DAY), PLANKTON.K_ADULT, ZF, true);
    const g = t[0] + t[1]; if (!(g > 0)) return 0;
    a.gut += g; a.gutE += t[0] * PREY.DAPH_ED + t[1] * PREY.COPE_ED;
    if (g < PLANKTON.BITE_MIN * a.sp.gut * a.W) return 0;
    a.eaten++; this.stats.foodEaten++; a.tox += TOX.FOOD * TOX.AMBIENT;
    return 1;
  }
  // GRAZE PATCHES (larvae, insects, detritus): up to n handling slots, take from the nearest live patch in reach as much
  // as the gut has room for — a small fish crops part of a patch, a big one clears it (then it's gone). A detritus patch's
  // organic N+P goes with the eaten share (excreted back as nutrients, as before). Returns the bites taken. `keep` grams
  // of each patch are out of reach (the larvae's refuge: `pred` then skips patches grazed down to it).
  _graze(a, grid, n, room, ed, dig, keep = 0, pred = notDead) {
    let k = 0, g = 0;
    for (let i = 0; i < n && room - g > 1e-9; i++) {
      const mm = grid.nearest(a.x, a.y, Math.max(a.eatRadius, PREY.PATCH_R), pred); if (!mm) break;
      const it = mm.item, take = Math.min(it.m - keep, room - g);
      if (it.n > 0) { const nu = it.n * take / it.m; it.n -= nu; this.env.addNutrient(it.x, it.y, nu); }
      it.m -= take; if (it.m <= 1e-9) it.dead = true;
      k++; g += take;
    }
    if (k) { a.gut += g; a.gutE += g * ed * dig; a.eaten += k; this.stats.foodEaten += k; a.tox += k * TOX.FOOD * TOX.AMBIENT; }
    return k;
  }
  // swallow k food items of g grams each, energy density ed (J/g), digestible fraction dig → into the gut; + the dietary
  // toxicant per meal
  _ate(a, k, g, ed, dig) { a.gut += k * g; a.gutE += k * g * ed * dig; a.eaten += k; this.stats.foodEaten += k; a.tox += k * TOX.FOOD * TOX.AMBIENT; }
  // swallow g grams of one food (a whole prey, or a grazed mouthful) counting n meals
  _meal(a, g, ed, dig, n = 1) { a.gut += g; a.gutE += g * ed * dig; a.eaten += n; this.stats.foodEaten += n; a.tox += n * TOX.FOOD * TOX.AMBIENT; }
  // test/diagnostic hook: build a plant (optionally inheriting from a parent) WITHOUT inserting it, so heredity &
  // gene→phenotype derivation can be probed headlessly. Same code path the seeding step uses.
  makePlant(x, mature = false, parent = null) { return newPlant(x, mature, parent); }
  // test/diagnostic hook: build a fish with specific trait genes (adult by default) WITHOUT inserting it, so the
  // gene → effective-stat derivation (size/speed/tol + fin/eye/body morphology) and the fitGenes guard can be probed.
  // Respects WORLD.GLOBAL_MAX like every other creation path: returns null when the lake is already at the cap.
  // Default age = a living adult (1.5 × matureAge: fully grown, well under maxAge). The old default (9999) was past every
  // maxAge, so a makeFish fish that was STEPPED died of old age at once.
  makeFish(species, genes = null, age = null) {
    if (!Object.hasOwn(SP, species)) throw new Error(`makeFish: unknown species "${species}"`);
    if (this.agents.length >= WORLD.GLOBAL_MAX) return null;
    _idOwner = this;
    return makeAgent(species, 100, 100, 1, 0, 180, null, age ?? SP[species].matureAge * 1.5, genes ? Float32Array.from(genes) : null);
  }
  // graze the nearest plant for one step of length dt: removes up to PLANT.BITE_RATE·dt px (a per-SECOND rate → the same
  // grazing per second at any fixed step); returns the grams of plant swallowed. Default dt = one browser step.
  bitePlant(a, dt = FEED.HANDLE, maxG = Infinity) {
    const m = this.qPlant(a.x, a.y, (a.eatRadius ?? a.sp.eatRadius) + 6);
    if (!m) return 0;
    // graze only the above-rootstock biomass — the below-sediment rhizome (WINTER_MIN) survives grazing (and winter) — and
    // no more than the gut has room for (maxG grams)
    const p = m.item, bite = Math.min(PLANT.BITE_RATE * dt, Math.max(0, p.height - PLANT.WINTER_MIN), maxG / Math.max(1e-9, PLANT.GRAMS_PER_PX * p.palat));
    if (bite <= 0) return 0;   // nothing left to graze but the protected rootstock
    // the grazed tissue's N+P isn't destroyed: the grazer excretes GRAZE_EXCRETE of it as ammonium+phosphate and egests
    // the rest as DOM where it fed (fish hold no nutrient pool) — the same routing as algal grazing
    const ret = (p.nut || 0) * bite / Math.max(p.height, 1e-6);
    if (ret > 0) { p.nut -= ret; this.env.addNutrient(a.x, a.y, ret * NUTRIENT.GRAZE_EXCRETE); this.env.addDOM(a.x, a.y, ret * (1 - NUTRIENT.GRAZE_EXCRETE)); }
    p.height -= bite; p.biomass = p.height * PLANT.BIOMASS_PER_PX;
    return PLANT.GRAMS_PER_PX * bite * p.palat;   // g wet tissue swallowed ∝ height grazed; tough/defended forms yield less (per-plant gene)
  }
  // VISITING LOON (BIRD): arrives in the open-water season; st 0 = resting on the surface, 1 = diving/pursuing, 2 =
  // ascending for air. It chases the nearest fish it can swallow that it can see, catches within reach, surfaces after
  // every catch (to swallow) or when out of breath, and leaves once sated or its visit is over. Seeded RNG → deterministic.
  _stepBirds(dt, counts) {
    const env = this.env, yf = env.yearFrac();
    const inSeason = yf >= BIRD.SEASON[0] && yf <= BIRD.SEASON[1] && env.ice < 0.1;
    if (inSeason && this.birds.length < BIRD.MAX && rand() < BIRD.ARRIVE * dt) {
      this.birds.push({ x: rand(W * 0.2, W * 0.8), y: 0, h: Math.PI / 2, st: 0, t: rand(BIRD.SURFACE[0], BIRD.SURFACE[1]), stay: rand(BIRD.STAY[0], BIRD.STAY[1]), m: 0, vx: rand(-6, 6), gone: false });
    }
    for (const b of this.birds) {
      b.t -= dt; b.stay -= dt;
      if (b.st === 0) {                                   // resting/paddling on the surface
        b.x = clamp(b.x + b.vx * dt, 30, W - 30); b.y = 0;
        if (b.x <= 30 || b.x >= W - 30) b.vx = -b.vx;
        if (b.stay <= 0 || b.m >= BIRD.MEALS || !inSeason) b.gone = true;   // flies off
        else if (b.t <= 0 && env.light > BIRD.LIGHT_MIN) { b.st = 1; b.t = rand(BIRD.DIVE[0], BIRD.DIVE[1]); b.h = Math.PI / 2 + rand(-0.7, 0.7); }
        continue;
      }
      if (b.st === 1) {                                   // underwater: pursue the nearest catchable fish in sight
        if (b.t <= 0) { b.st = 2; continue; }
        const m = this.agentGrid.nearest(b.x, b.y, BIRD.SIGHT * env.clarity(), isLoonPrey, null);
        let want = b.h;
        if (m) {
          want = Math.atan2(m.item.y - b.y, m.item.x - b.x);
          if (m.dist < BIRD.REACH) {                      // caught: swallowed whole, then up for air
            const f = m.item; f.dead = true; f.eatenBy = 'loon'; counts[f.species]--; this._counts[f.species] = counts[f.species];
            if (f.id === this.selectedId) this.selectedId = null;
            b.m++; this.stats.birdEaten = (this.stats.birdEaten || 0) + 1; b.st = 2; continue;
          }
        }
        b.h += clamp(angDiff(want, b.h), -BIRD.TURN * dt, BIRD.TURN * dt);
        b.x = clamp(b.x + Math.cos(b.h) * BIRD.SPEED * dt, 4, W - 4);
        b.y = clamp(b.y + Math.sin(b.h) * BIRD.SPEED * dt, 1, bedY(b.x) - 4);
        continue;
      }
      // st 2: back up to the surface for air
      b.h += clamp(angDiff(-Math.PI / 2, b.h), -BIRD.TURN * dt, BIRD.TURN * dt);
      b.y -= BIRD.SPEED * 0.8 * dt; b.x = clamp(b.x + Math.cos(b.h) * BIRD.SPEED * 0.3 * dt, 4, W - 4);
      if (b.y <= 1) { b.y = 0; b.st = 0; b.h = Math.PI / 2; b.t = rand(BIRD.SURFACE[0], BIRD.SURFACE[1]); }
    }
    if (this.birds.some(b => b.gone)) this.birds = this.birds.filter(b => !b.gone);
  }
  // WILDLIFE (ODONATA, FROG, TURTLE): dragonfly nymphs ambush small prey and emerge as adults that hawk insects over the
  // water and lay eggs; tadpoles graze algae and metamorphose; frogs float at the surface over the shallows, dive from
  // predators, breed in spring and hibernate on the bottom; painted turtles forage below, surface to breathe/bask and
  // hibernate in the mud. Runs after the fish (fry a nymph takes are removed like the loon's catch). Seeded RNG.
  _stepWildlife(dt, counts) {
    const env = this.env, yf = env.yearFrac(), Y = TIME.YEAR_LEN, q = T => Math.pow(2.2, (T - 20) / 10);
    const nCap = scaleCount(ODONATA.CAP), sun = env.sun || 0;
    // --- dragonfly nymphs ---
    for (const n of this.nymphs) {
      if (n.dead) continue;
      if (rand() < ODONATA.SENESCE * dt) { n.dead = true; continue; }
      const T = env.tempAt(n.x, n.y), wf = clamp((T - ODONATA.DEV_T) / (25 - ODONATA.DEV_T), 0, 1);
      n.dev += wf * dt / (ODONATA.DEV_FULL * Y);
      n.x += n.vx * wf * dt; if (n.x < 4 || n.x > W - 4) { n.vx = -n.vx; n.x = clamp(n.x, 4, W - 4); }
      if (!isShallow(n.x)) n.vx = toShore(n.x) * Math.abs(n.vx);
      n.y = bedY(n.x) - n.h;
      // emergence: a mature nymph climbs out on a warm, sunny day and becomes an adult dragonfly
      if (n.dev >= 1 && T > ODONATA.EMERGE_T && sun > 0.5) { n.dead = true; if (this.dflies.length < scaleCount(ODONATA.ADULT_CAP)) this.dflies.push(this._mkDragonfly(n.x)); continue; }
      // ambush (x warmth): an insect larva, a tadpole, a fish fry, or a zooplankter within the labium's reach
      if (rand() < ODONATA.HUNT * wf * dt) {
        const R = ODONATA.EAT_R;
        if (this._biteLarva(n.x, n.y, R, ODONATA.BITE)) continue;   // a few larvae from a patch, not the whole patch
        const td = this.herpGrid.nearest(n.x, n.y, R, isTadpole); if (td) { td.item.dead = true; td.item.eatenBy = 'nymph'; continue; }
        const fr = this.agentGrid.nearest(n.x, n.y, R, isNymphPrey);
        if (fr) { const f = fr.item; f.dead = true; f.eatenBy = 'nymph'; counts[f.species]--; this._counts[f.species] = counts[f.species]; if (f.id === this.selectedId) this.selectedId = null; this.stats.nymphEaten = (this.stats.nymphEaten || 0) + 1; continue; }
        const sc = this.fry.length ? this.fryGrid.nearest(n.x, n.y, R, isNymphFry) : null;   // or a few larvae from a school
        if (sc) { const f = sc.item; f.n -= Math.min(f.n, 3); if (f.n < 1) f.dead = true; continue; }
        this.env.zooFeed(n.x, n.y, 1, 1, ODONATA.BITE * dt, PLANKTON.K_ADULT, ZF);   // or zooplankton (an ambusher's few mouthfuls)
      }
    }
    // --- adult dragonflies: dart low over the water, snatch emerged insects, dip to lay eggs over the shallows; in the
    //     flight season more fly in from other waters (dragonflies disperse strongly and colonize ponds and lakes) ---
    if (yf >= ODONATA.VISIT_YF[0] && yf <= ODONATA.VISIT_YF[1] && env.ice === 0 && this.dflies.length < scaleCount(ODONATA.ADULT_CAP) && rand() < ODONATA.VISIT * dt) this.dflies.push(this._mkDragonfly(rand(30, W - 30)));
    for (const d of this.dflies) {
      if (d.dead) continue;
      d.life -= dt; if (d.life <= 0 || env.tempC < 12 || env.ice > 0) { d.dead = true; continue; }
      if (rand() < 0.6 * dt) d.vx = (rand() < 0.5 ? -1 : 1) * ODONATA.FLY * (0.5 + rand() * 0.5);   // patrol turns
      d.x += d.vx * dt; if (d.x < 10 || d.x > W - 10) { d.vx = -d.vx; d.x = clamp(d.x, 10, W - 10); }
      d.ph += dt; d.y = -12 - 8 * Math.sin(d.ph * 0.9);
      const m = this.insectGrid.nearest(d.x, 4, ODONATA.HAWK_R, notDead); if (m) m.item.dead = true;
      if (isShallow(d.x) && this.nymphs.length < nCap && rand() < ODONATA.EGG_RATE * dt) this.nymphs.push(this._mkNymph(d.x, 0));
    }
    // --- frogs, tadpoles, turtles ---
    let tads = 0, turtles = 0, frogs = 0;
    for (const h of this.herps) if (!h.dead) { if (h.k === 0) tads++; else if (h.k === 1) frogs++; else turtles++; }
    const tadCap = scaleCount(FROG.TAD_CAP), turtleCap = scaleCount(TURTLE.CAP), frogCap = scaleCount(FROG.CAP);
    const winter = env.ice > 0.3 || env.tempC < 6, sT = env.tempC - env.tempDiel;
    for (let i = 0, nH = this.herps.length; i < nH; i++) {
      const h = this.herps[i];
      if (h.dead) continue;
      const T = env.tempAt(h.x, Math.max(2, h.y)), qf = q(T);
      if (h.k === 0) {                                    // TADPOLE: graze the shallows, grow, metamorphose
        h.age += dt; h.e -= FROG.METAB * 0.6 * qf * dt;
        h.e = Math.min(1, h.e + env.grazePhyto(h.x, h.y, FROG.TAD_GRAZE * qf * dt) * FROG.TAD_VALUE);
        if (h.e <= 0) { h.dead = true; continue; }
        h.dev += clamp((T - FROG.TAD_DEV_T) / (25 - FROG.TAD_DEV_T), 0, 1) * dt / (FROG.TAD_DEV_FULL * Y);
        if (rand() < 0.5 * dt) h.vx = rand(-8, 8);
        if (!isShallow(h.x)) h.vx = toShore(h.x) * 8;
        h.x = clamp(h.x + h.vx * (winter ? 0.1 : 1) * dt, 4, W - 4);
        h.y = Math.min(h.y + (bedY(h.x) - 8 - h.y) * Math.min(1, 0.5 * dt), bedY(h.x) - 2);   // never below the (sloping) bed
        if (h.dev >= 1 && !winter && frogs < frogCap) { h.k = 1; h.age = 0; h.e = Math.max(h.e, 0.6); h.st = 0; h.cd = 0.5 * Y; frogs++; tads--; }   // metamorphosis
        continue;
      }
      h.age += dt; h.cd -= dt;
      if (h.k === 1) {                                    // FROG
        h.e -= FROG.METAB * qf * dt;
        if (h.e <= 0 || h.age > FROG.LIFE * Y) { h.dead = true; continue; }
        if (winter) {                                     // hibernate on the bottom of the shallows
          if (!isShallow(h.x)) h.x += toShore(h.x) * FROG.SWIM * dt;
          h.y = Math.min(h.y + (bedY(h.x) - 3 - h.y) * Math.min(1, 1.5 * dt), bedY(h.x) - 2); h.st = 2; continue;
        }
        if (h.st === 2) h.st = 0;                          // spring: awake
        if (h.st === 0) {                                  // a predator that could swallow it close by -> dive to the bottom
          const sz = herpDepth(h), thr = this.agentGrid.sub.nearest(h.x, h.y, FROG.DIVE_R, it => !it.dead && sz <= gapeOf(it));
          if (thr) { h.st = 1; h.t = 4 + rand() * 4; }
        }
        if (h.st === 1) { h.t -= dt; h.y += (bedY(h.x) - 4 - h.y) * Math.min(1, 2 * dt); if (h.t <= 0) h.st = 0; }
        else {
          h.y += (2 - h.y) * Math.min(1, 1.5 * dt);          // float at the surface
          h.e = Math.min(1, h.e + FROG.SHORE_FOOD * qf * dt);   // foraging along the shore (mostly terrestrial insects)
          if (h.y < 8) { const m = this.insectGrid.nearest(h.x, 4, FROG.EAT_R, notDead); if (m) { m.item.dead = true; h.e = Math.min(1, h.e + FROG.INSECT_E); } }
          if (rand() < 0.3 * dt) h.vx = rand(-FROG.SWIM, FROG.SWIM);
        }
        if (!isShallow(h.x)) h.vx = toShore(h.x) * FROG.SWIM;
        h.x = clamp(h.x + h.vx * 0.5 * dt, 4, W - 4); h.y = Math.min(h.y, bedY(h.x) - 2);
        // spring spawning in the warm shallows: an egg mass -> tadpoles
        if (h.age >= FROG.MATURE * Y && h.cd <= 0 && sT >= FROG.BREED_T[0] && sT <= FROG.BREED_T[1] && yf < 0.4 && h.e > 0.5 && rand() < FROG.BREED_RATE * dt) {
          h.cd = 0.8 * Y; h.e -= 0.2;
          for (let c = 0; c < FROG.CLUTCH && tads < tadCap; c++, tads++) this.herps.push(this._mkHerp(0, h.x + rand(-20, 20), bedY(h.x) - rand(4, 14)));
        }
        continue;
      }
      // TURTLE
      h.e -= TURTLE.METAB * qf * dt;
      if (h.e <= 0 || h.age > TURTLE.LIFE * Y) { h.dead = true; continue; }
      if (winter || env.tempC < TURTLE.ACTIVE_T) {       // torpid; buried in the mud of the shallows over winter
        if (!isShallow(h.x)) h.x += toShore(h.x) * TURTLE.SWIM * 0.3 * dt;
        h.y = Math.min(h.y + (bedY(h.x) - 4 - h.y) * Math.min(1, dt), bedY(h.x) - 2); h.st = 2; continue;
      }
      if (h.st === 2) { h.st = 1; h.t = 6; }              // spring: up for air
      h.t -= dt;
      if (h.st === 0) {                                   // foraging along the bottom
        const ty = bedY(h.x) - 6; h.y += clamp(ty - h.y, -TURTLE.SWIM * dt, TURTLE.SWIM * dt);
        if (rand() < 0.4 * dt) h.vx = rand(-TURTLE.SWIM, TURTLE.SWIM);
        if (!isShallow(h.x) && rand() < 0.5 * dt) h.vx = toShore(h.x) * TURTLE.SWIM;
        if (h.y > ty - 8 && h.e < 0.95 && rand() < dt) {
          if (this._takeNearest(this.snailGrid, h.x, h.y, TURTLE.EAT_R, 1, exposedSnail)) h.e += TURTLE.SNAIL_E;
          else if (this._biteLarva(h.x, h.y, TURTLE.EAT_R, PREY.LARVA_G)) h.e += TURTLE.LARVA_E;
          else if (this._takeNearest(this.detritusGrid, h.x, h.y, TURTLE.EAT_R)) h.e += TURTLE.DETRITUS_E;   // carrion and plant debris
          h.e = Math.min(1, h.e);
        }
        if (h.t <= 0) { h.st = 1; h.t = rand(TURTLE.BASK[0], TURTLE.BASK[1]) * (1 + sun); }
      } else {                                            // up to breathe, then bask at the surface (longer in sunshine)
        h.y += clamp(1 - h.y, -TURTLE.SWIM * dt, TURTLE.SWIM * dt);
        if (h.t <= 0) { h.st = 0; h.t = rand(TURTLE.DIVE[0], TURTLE.DIVE[1]); }
      }
      h.x += h.vx * dt; if (h.x < 6 || h.x > W - 6) { h.vx = -h.vx; h.x = clamp(h.x, 6, W - 6); }
      h.y = Math.min(h.y, bedY(h.x) - 2);
      // late summer: hatchlings from the shore nests reach the water
      if (h.age >= TURTLE.MATURE * Y && h.cd <= 0 && yf >= TURTLE.HATCH[0] && yf <= TURTLE.HATCH[1] && rand() < TURTLE.HATCH_RATE * dt) {
        h.cd = 0.8 * Y;
        for (let c = 0; c < TURTLE.CLUTCH && turtles < turtleCap; c++, turtles++) {
          const hx = toShore(h.x) < 0 ? rand(8, 110) : rand(W - 110, W - 8), t2 = this._mkHerp(2, hx, 2, 0); t2.e = 0.6; this.herps.push(t2);
        }
      }
    }
  }
  // ---------- YOUNG-OF-YEAR (FRY schools) ----------
  // a school of n larvae of species k at swim-up: its fish's length/mass, the genome its recruits will carry (made from
  // both parents at spawning), and (nest guarders) the guardian's id and the nest
  _mkFry(k, x, y, n, gen, hue, w, gn) {
    const sp = SP[k], L = sp.Lhatch;
    return { k, x, y, n, L, W: stdWeight(sp.lw, L), age: 0, gen, hue, w, gn, vx: rand(-1, 1) * FRY.SWIM, ni: 0, nx: x, ny: y,
      tk: rand() * FRY.TICK, tx: x, ty: y, rO2: 0, p: 1, dead: false };
  }
  // every school, every step: its fish move — over the nest while its guardian is on duty, else toward the food they found
  // at the last update. Every FRY.TICK s (staggered) they feed (_feedFry), and die at the natural, starvation, heat and
  // hypoxia rates over the time elapsed (deterministic: n is an expected count); they pick their next food target; and the
  // survivors RECRUIT as individuals on reaching the recruit length L0, or as yearlings in the spring after their first
  // winter: one agent per FRY.N_PER_AGENT, within the species' agent budget (pop.max) — see FRY in config
  _stepFry(dt, counts, newborns) {
    if (!this.fry.length) return;
    const env = this.env, yf = env.yearFrac(), guards = this._guards, Y = TIME.YEAR_LEN;
    // each species' JUVENILE density (fish/m² past the larval stage — weighted by 1 − lf): JUVENILE COMPENSATION (FRY.JUV_*)
    const juvD = this._juvD || (this._juvD = {}); for (const k of SPECIES) juvD[k] = 0;
    for (const f of this.fry) if (!f.dead) juvD[f.k] += f.n * (1 - Math.exp(-((f.L / FRY.LARVA_L) ** 2))) / WORLD.SLICE_M2;
    for (const f of this.fry) {
      if (f.dead) continue;
      const sp = SP[f.k], d = sp.diet;
      f.age += dt; f.tk += dt;
      // (a guarded school forages in a cloud around its nest — within BROOD.GUARD_R of it — as bass and sunfish fry do)
      const g = f.ni && guards ? guards.get(f.ni) : null, sw = FRY.SWIM * clamp(f.L / 2, 0.5, 4), held = g && g.nt > 0 && !g.dead;
      if (!held) f.ni = 0;
      const R = BROOD.GUARD_R, tx = held ? clamp(f.tx, f.nx - R, f.nx + R) : f.tx, ty = held ? clamp(f.ty, f.ny - R, f.ny + R) : f.ty;
      const dx = tx - f.x;
      if (Math.abs(dx) > 4) f.vx += Math.sign(dx) * sw * 2 * dt; else f.vx *= 1 - Math.min(1, dt);
      // (in water it can't breathe, or near its lethal heat, a school swims out at its ESCAPE speed: one behavioural second
      // is ~5 h of a larva's life, in which it can swim far — at the drift pace it sat for days in a thin anoxic layer)
      const vy = env.oxygenAt(f.x, f.y) < sp.o2Crit || env.tempAt(f.x, f.y) > sp.uilt - 3 ? FRY.ESCAPE : sw * 0.6;
      f.y += clamp(ty - f.y, -vy * dt, vy * dt);
      f.vx = clamp(f.vx, -sw * 2, sw * 2);
      f.x = clamp(f.x + f.vx * dt, 4, W - 4); f.y = clamp(f.y, 3, bedY(f.x) - 3);
      if (f.tk < FRY.TICK) continue;
      const st = f.tk; f.tk = 0;
      const T = env.tempAt(f.x, f.y);
      const hS = this._feedFry(f, sp, st, T);   // (its starvation hazard, /s)
      // MORTALITY over st: natural — the larval "critical period" (FRY.M_LARVA ∝ 1/length, fading out by ~3 cm), then the
      // juveniles' predation (FRY.M_JUV, slower in cold water) + the agents' size-scaled share of the species' M (Lorenzen) —
      // then starvation (_feedFry), heat and hypoxia as for the agents
      const o2 = env.oxygenAt(f.x, f.y), o2L = sp.o2Lethal / ENV.O2_MGL * Math.exp(BIOE.O2_LETHAL_T * (T - 25));
      const lf = Math.exp(-((f.L / FRY.LARVA_L) ** 2));   // the larval term's weight (fades by ~3 cm) — the juvenile term takes over
      // (both slow in cold water, × M_JUV_Q10 below 20 °C: their predators eat little there — larval mortality falls with
      // temperature, Pepin 1991 — so a small fingerling isn't culled at the summer rate under the ice; never above the
      // summer field rates they were measured at)
      const hN = (FRY.M_LARVA / Math.max(0.3, f.L) * lf + FRY.M_JUV * (1 - lf) * (juvD[f.k] + FRY.JUV_D50) / (FRY.JUV_DREF + FRY.JUV_D50)) * Math.min(1, Math.pow(FRY.M_JUV_Q10, (T - 20) / 10)) / BIOE.DAY
        + sp.M * BIOE.M_OTHER * Math.min(30, Math.pow(f.L / sp.Lref, -0.87)) / Y;
      const hH = T > sp.uilt - 2 ? Math.LN2 / (BIOE.UILT_DAYS * BIOE.DAY) * Math.exp((T - sp.uilt) / BIOE.HEAT_STEEP) : 0;
      const hO = o2 < o2L ? Math.LN2 / (BIOE.HYPOXIA_DAYS * BIOE.DAY) * Math.exp(BIOE.HYPOXIA_STEEP * (o2L - o2) / o2L) : 0;
      const h = hN + hS + hH + hO, lost = f.n * (1 - Math.exp(-h * st));
      if (this.fryDiag && h > 0) { const q = this.fryDiag[f.k] ??= { natural: 0, starve: 0, heat: 0, hypoxia: 0 }; q.natural += lost * hN / h; q.starve += lost * hS / h; q.heat += lost * hH / h; q.hypoxia += lost * hO / h; }   // (diagnostic only)
      f.n -= lost;
      // (a school thinned below one fish: its last fish lives on with probability n — stochastic rounding keeps the expected
      // survivors; dropping every fraction culled the last few fingerlings of a winter school by truncation alone)
      if (f.n < 1) { if (rand() < f.n) f.n = 1; else { f.dead = true; continue; } }
      // NEXT TARGET: the nearest food these fish eat within SEEK_R; in water below their critical O₂ they head up, and
      // near their lethal temperature down (the young fish's own habitat choice)
      if (o2 < sp.o2Crit) { f.tx = f.x; f.ty = Math.max(4, f.y - 60); }
      else if (T > sp.uilt - 3) { f.tx = f.x; f.ty = f.y + 60; }
      else {
        const zoo = d.plankton || f.L < sp.Lzoo, benth = f.L >= (sp.benthL ?? FRY.BENTH_L);
        // YOUNG BOTTOM FORAGERS (past benthL) LIVE ON THE BED: young sunfish back from their limnetic phase, perch moving
        // inshore and bullheads stay in the weeds on the littoral invertebrates (Werner & Hall 1988; Post & McQueen 1988),
        // taking the zooplankton among them — they go out after open-water zooplankton only when the bed in reach has none
        // (insect larvae, the richest stretch of worms and scuds, detritus — the nearest)
        let best = null, m;
        if (benth && (d.larva || d.snail || d.detritus)) best = this.env.benthBest(f.x, f.y, FRY.SEEK_R, sp.o2Crit, QB);
        if (benth && insectEater(sp, f.L) && (m = this.larvaeGrid.nearest(f.x, f.y, best ? best.dist : FRY.SEEK_R, larvaFreeFry))) best = m;
        if (benth && d.detritus && (m = this.detritusGrid.nearest(f.x, f.y, best ? best.dist : FRY.SEEK_R, notDead))) best = m;
        if (!best && zoo) best = this.env.zooBest(f.x, f.y, FRY.SEEK_R, ZB);
        if (d.fish && f.L >= sp.Lpisc && (m = this.fryGrid.nearest(f.x, f.y, best ? best.dist : FRY.SEEK_R, canSchoolEat, f))) best = m;
        // nothing in range: wander — young bottom feeders (larvae, detritus) head down to the bed to look there
        if (best) { f.tx = best.item.x; f.ty = best.item.y; } else { f.tx = clamp(f.x + rand(-80, 80), 4, W - 4); f.ty = benth && (d.larva || d.detritus) ? bedY(f.x) - 8 : f.y; }
      }
      // a LIMNETIC PHASE (sp.pelagicFry cm): bluegill fry leave the nest for the open water and feed on its zooplankton for
      // weeks, coming back to the weeds at ~2–2.5 cm (Werner 1967, 1969) — so the lake's young sunfish spread over its whole
      // open-water zooplankton instead of crowding the shallows (and the young bass there) — once no guardian holds them
      if (sp.pelagicFry && f.L < sp.pelagicFry && !held) { const pb = homeBasinAt(f.x), pw = pb.x1 - pb.x0; f.tx = clamp(f.tx, pb.x0 + pw * FRY.PELAGIC_X[0], pb.x0 + pw * FRY.PELAGIC_X[1]); f.ty = clamp(f.ty, 8, H * FRY.PELAGIC_D); }
      // RECRUITMENT: one individual per N_PER_AGENT survivors (stochastic rounding; seeded RNG), as many as the species'
      // agent budget has room for, carrying the school's genome (its siblings a fresh mutation of it) at the school's size
      if (f.L >= sp.L0 || (f.age > FRY.OVERWINTER * Y && yf >= FRY.SPRING_YF && yf < SPAWN.SEASON_END)) {
        f.dead = true;
        const nRec = Math.min(FRY.MAX_RECRUITS, Math.max(0, popMax(sp) - counts[f.k]), Math.floor(f.n / FRY.N_PER_AGENT + rand()));
        for (let i = 0; i < nRec && this.agents.length + newborns.length < WORLD.GLOBAL_MAX; i++) {
          const c = makeAgent(f.k, f.x, f.y, 1, f.gen, (f.hue + (i ? gauss() * 5 : 0) + 360) % 360, i ? mutate(f.w) : f.w, 0, i ? mutateGenes(f.gn) : f.gn);
          c.L = f.L; c.W = f.W; c.age = f.age; c.mature = false; c.gon = 0; settleBody(c);
          counts[f.k]++; newborns.push(c); c.bornSexual = true; this.stats.births[f.k]++; if (c.gen > this.maxGen) this.maxGen = c.gen;
        }
      }
    }
  }
  // one school's update of length st (s) at temperature T: its fish crop up to FRY.FEEDS food patches within EAT_R — other
  // young fish first (young piscivores), then zooplankton (every young fish below its species' Lzoo, and the planktivores),
  // the bottom's insect larvae and detritus (once BENTH_L long, as its species eats them), algae as the planktivores' last
  // resort — up to the school's appetite (n × Cmax); then one fish's energy budget (FB4: the juvenile set where one
  // exists) runs on its share, as the agents' does (routine activity: young fish are always on the move).
  // SCRAMBLE COMPETITION: a school's fish don't share a shortfall equally — some find food, some don't. When what the school
  // found can't keep every fish at maintenance, it keeps as many as it can (their mass holds) and the rest STARVE over the
  // time their reserves last (losing ~40 % of their energy: a day or two for a first-feeding larva in summer, months for a
  // fingerling under the ice — the physiology of size-selective overwinter starvation). So a school shrinks to what its
  // food supports, rather than every fish starving at once (a super-individual has no spread of its own).
  // Returns the starvation hazard (/s).
  _feedFry(f, sp, st, T) {
    const env = this.env, b = sp.bioJuv || sp.bio, dd = st / BIOE.DAY, d = sp.diet;   // (young-of-year: FB4's juvenile set where one exists)
    const want = f.n * cmax(b, f.W, T) * f.W * dd * (1 + (FRY.CMAX_LARVA - 1) * clamp((FRY.LARVA_CM[1] - f.L) / (FRY.LARVA_CM[1] - FRY.LARVA_CM[0]), 0, 1));   // (larval appetite, FRY.CMAX_LARVA)
    let got = 0, J = 0, feeds = FRY.FEEDS, foundZoo = false;
    if (d.fish && f.L >= sp.Lpisc) {
      const m = this.fryGrid.nearest(f.x, f.y, FRY.EAT_R, canSchoolEat, f);
      if (m) {
        const q = m.item, k = Math.min(q.n, (want - got) / q.W, f.n * FRY.ATTACK * sp.capture * SP[q.k].vuln * q.n / (q.n + FRY.N_HALF) * (1 - this.coverAt(q.x, q.y) * COVER.REFUGE) * st);
        if (k > 0) { q.n -= k; if (q.n < 1) q.dead = true; got += k * q.W; J += k * q.W * energyDensity(SP[q.k].bio, q.W); this.stats.fryEaten = (this.stats.fryEaten || 0) + k; }
      }
    }
    if ((d.plankton || f.L < sp.Lzoo) && want - got > 1e-12) {   // zooplankton: type II in the density of prey they can take (K_FRY)
      const PL = PLANKTON, gD = PL.FRY_DAPH_MIN + (1 - PL.FRY_DAPH_MIN) * clamp((f.L - PL.FRY_DAPH_L[0]) / (PL.FRY_DAPH_L[1] - PL.FRY_DAPH_L[0]), 0, 1);
      const cR = PL.FRY_ROT_MIN + (1 - PL.FRY_ROT_MIN) * clamp((PL.FRY_ROT_L[1] - f.L) / (PL.FRY_ROT_L[1] - PL.FRY_ROT_L[0]), 0, 1);   // rotifers & nauplii
      const t = env.zooFeed(f.x, f.y, gD, PL.FRY_COPE, want - got, PL.K_FRY, ZF, false, false, cR), g = t[0] + t[1] + t[2];   // (the small prey larvae take don't migrate)
      if (g > 0) { got += g; J += t[0] * PREY.DAPH_ED + t[1] * PREY.COPE_ED + t[2] * PREY.ROT_ED; foundZoo = true; feeds--; }
    }
    if (f.L >= (sp.benthL ?? FRY.BENTH_L) && insectEater(sp, f.L)) for (; feeds > 0 && want - got > 1e-12; feeds--) {
      const m = this.larvaeGrid.nearest(f.x, f.y, FRY.EAT_R, larvaFreeFry); if (!m) break;
      const it = m.item, take = Math.min(it.m - INSECT.REFUGE_FRY, want - got);
      it.m -= take;
      got += take; J += take * PREY.LARVA_ED;
    }
    if (f.L >= (sp.benthL ?? FRY.BENTH_L) && (d.larva || d.snail || d.detritus) && want - got > 1e-12 && f.y > bedY(f.x) - BENTHOS.REACH) {   // the bed's worms and scuds
      const g = env.takeBenth(f.x, want - got); if (g > 0) { got += g; J += g * PREY.BENTH_ED; }
    }
    if (f.L >= (sp.benthL ?? FRY.BENTH_L) && d.detritus) for (; feeds > 0 && want - got > 1e-12; feeds--) {
      const m = this.detritusGrid.nearest(f.x, f.y, FRY.EAT_R, notDead); if (!m) break;
      const it = m.item, take = Math.min(it.m, want - got);
      if (it.n > 0) { const nu = it.n * take / it.m; it.n -= nu; env.addNutrient(it.x, it.y, nu); }   // its organic N+P is excreted
      it.m -= take; if (it.m <= 1e-9) it.dead = true;
      got += take; J += take * PREY.DETRITUS_ED * PREY.DETRITUS_DIG;
    }
    if (d.plankton && !foundZoo && want - got > 1e-12) {
      const gz = env.grazePhyto(f.x, f.y, (want - got) / PREY.ALGAE_G);
      if (gz > 0) { got += gz * PREY.ALGAE_G; J += gz * PREY.ALGAE_G * PREY.ALGAE_ED * PREY.ALGAE_DIG; }
    }
    const p = want > 0 ? Math.min(1, got / want) : 0;
    wasteFractions(b, T, p, WF);
    // (below FRY.R_WMIN the mass-specific respiration stops rising: the published allometries were fit to juveniles and
    // adults, and larval metabolism scales nearly isometrically — extrapolating W^RB to a 1-mg larva overstates it ~4×)
    const Wr = Math.max(f.W, FRY.R_WMIN), r = respStd(b, Wr, T) * routineActivity(b, Wr, T) * f.W, Rj = r * OXYCAL * dd;   // g O₂/day per fish; J this update
    const eff = (1 - WF[0]) * (1 - WF[1] - b.SDA), edF = got > 0 ? J / got : PREY.DAPH_ED;     // net share of what's eaten; J/g of it
    const need = Rj / Math.max(1e-9, eff * edF), ed = energyDensity(b, f.W);                    // g per fish to break even
    let hS = 0;
    f.rO2 = f.n * r / BIOE.DAY;                       // the school's O₂ draw (g O₂ / sim-s — the env charges it)
    f.p += (p - f.p) * Math.min(1, st / BIOE.DAY);   // realised p, ~1-day mean (diagnostic)
    if (got >= f.n * need) {   // every fish at least at maintenance: they share the surplus and grow
      const C = J / f.n, F = WF[0] * C, U = WF[1] * (C - F), S = b.SDA * (C - F);
      f.W = Math.max(1e-7, f.W + (C - F - U - S - Rj) / ed);
      if (f.W > stdWeight(sp.lw, f.L)) f.L = lengthFor(sp.lw, f.W);
    } else {                   // only got/need of them are fed: the rest starve as their reserves run out
      const tStarve = 0.4 * ed / Math.max(1e-9, r * OXYCAL / f.W);   // days a fish lasts on ~40 % of its energy
      hS = (1 - got / Math.max(1e-12, f.n * need)) / (tStarve * BIOE.DAY);
    }
    return hS;
  }
  // a fish crops the nearest school of young fish it can eat (a Poisson draw, as many as fit its gut). A PISCIVORE takes a
  // feeding bout: FRY.ATTACK × its capture success fish per second (fewer from a school thinned to a few fish — a type-II
  // response in the school's size, FRY.N_HALF); a plankton/insect eater picks off larvae at FRY.CATCH per handling slot.
  // Weed cover shelters the young (COVER.REFUGE), and a school in its guarded nest zone (guardian on duty, on station) is
  // mostly protected (BROOD.PROTECT). (Tried: bouts across the whole hunting arena at 4× the rate — perch and the other
  // piscivores ate ~5× more young-of-year, recruitment failed and the lake thinned year on year; the bass gained nothing.)
  _eatFry(a, gEff, slots, dt, perf = 1) {
    const R0 = a.eatRadius + 6, pisc0 = a.sp.diet.fish && a.L >= a.sp.Lpisc, Ra = R0 * FEED.HUNT_R;
    // a piscivore works the nearest school of young FISH in its HUNTING ARENA (FEED.HUNT_R × its reach, as for single fish
    // prey: one behavioural second is hours of hunting, and a school is spread over the weeds, not a point), at full rate
    // within its reach and less with distance (tiny larvae nearer by don't hide it); failing that, a fish that eats larvae
    // (a big piscivore no longer does) picks at a school of them that it is in
    let m = pisc0 ? this.fryGrid.nearest(a.x, a.y, Ra, piscSchool, a) : null;
    if (!m && (!pisc0 || a.L < 3 * a.sp.Lpisc)) m = this.fryGrid.nearest(a.x, a.y, R0, canEatFry, a);
    if (!m) return;
    const f = m.item, pisc = schoolPrey(f, a), close = pisc ? clamp((Ra - m.dist) / (Ra - R0), 0, 1) : 1;
    const dens = f.n / (f.n + FRY.N_HALF) * (1 - this.coverAt(f.x, f.y) * COVER.REFUGE);   // a school is dense until it's down to a few fish
    const sz = pisc ? Math.pow(Math.max(0, 1 - f.L * SP[f.k].depthR / gapeOf(a)), FEED.SIZE_SEL) : 1;   // (the size refuge, as sizeSel)
    const k = Math.min(Math.floor(f.n), Math.floor((gEff - a.gut) / f.W), poissonish(pisc ? FRY.ATTACK * a.sp.capture * SP[f.k].vuln * sz * dens * close * perf * dt : FRY.CATCH * slots * dens));   // (slots carry the cold slowdown already)
    if (k < 1) return;
    if (f.ni && this._guards) { const g = this._guards.get(f.ni); if (g && g.nt > 0 && !g.dead && Math.hypot(g.x - f.nx, g.y - f.ny) < BROOD.GUARD_R * 1.5 && rand() < BROOD.PROTECT) return; }
    f.n -= k; if (f.n < 1) f.dead = true;
    this._meal(a, k * f.W, energyDensity(SP[f.k].bio, f.W), 1);
    this.stats.fryEaten = (this.stats.fryEaten || 0) + k;
  }
  // a fry inside its guarded nest zone, with its guardian on duty and on station, is hard to take (BROOD.PROTECT)
  _guardCut(prey) {
    if (!prey.ni || !this._guards) return 1;
    const g = this._guards.get(prey.ni), R = BROOD.GUARD_R;
    if (!g || !(g.nt > 0) || g.dead) return 1;
    const dn = Math.hypot(prey.x - prey.nx, prey.y - prey.ny), dg = Math.hypot(g.x - prey.nx, g.y - prey.ny);
    return dn < R && dg < R * 1.5 ? 1 - BROOD.PROTECT : 1;
  }
  // PREDATION ON FISH, AT COMPRESSED TIME. One behavioural second is ~5 h of a predator's day (BIOE.DAY), in which a real
  // bass or pike makes many approaches and strikes — one lunge per encounter would feed it a twentieth of its ration in a
  // lake full of prey. So a piscivore with catchable fish in its HUNTING ARENA (FEED.HUNT_R × its strike reach) strikes at
  // a RATE (FEED.ATTACK per s, × water clarity: a visual hunter finds less in murky water), spread over those fish by how
  // close each is (1 − d/reach), and each strike connects with its capture success × the prey's vulnerability
  // (sp.capture × BIO vuln: pike ~0.6, perch ~0.15; a fathead 1, a spiny bluegill 0.35) × the SIZE refuge (sizeSel: big prey,
  // whose depth nears the gape, are seldom caught and swallowed). Kills and misses are thinned
  // Poisson draws on the seeded RNG. Behaviour decides whether there is prey in the arena at all — search, pursuit, flight,
  // shoaling, cover — and each prey's REACH is cut by the weed/reeds/logs it hides in (COVER.REFUGE), by being tucked in a
  // dense cluster of its own species (predator confusion/dilution — a GROUP-SIZE property, so cohesion is adaptive), by
  // freezing (HIDE concealment) and by its guardian on station, and extended by the predator committing a brain-gated
  // STRIKE lunge — so the strike and hide decisions both bite here (an arms race). A miss leaves the predator recovering
  // FEED.MISS_CD s and the prey alarmed (it flees on its fear drive). `maxW`: the most the predator can swallow now (the
  // room in its gut, g) — heavier fish aren't attacked. `dt` omitted: ONE strike at the best-placed prey (the tests' probe).
  takePrey(a, maxW = Infinity, dt = Infinity, perf = 1) {
    if (a.missCd > 0) return null;   // still recovering from a missed strike
    const lunge = 1 + ACTION.STRIKE_REACH * engaged(a.act.strike), R = a.eatRadius * FEED.HUNT_R * lunge;
    const C = this._huntC || (this._huntC = []); C.length = 0;
    let sK = 0, sM = 0, best = null, bestW = 0, bestS = 0;
    this.agentGrid.forNear(a.x, a.y, R, it => {
      if (!isPreyOf(it, a) || it.W + it.gon > maxW) return;
      const hide = 1 - ACTION.HIDE_CONCEAL * engaged(it.act.hide);
      const reach = R * (1 - this.coverAt(it.x, it.y) * COVER.REFUGE) * (1 - SCHOOL.DILUTE * this._shoalOf(it)) * hide * this._guardCut(it);
      const d = Math.hypot(it.x - a.x, it.y - a.y); if (d >= reach) return;
      const w = 1 - d / reach, s = a.sp.capture * it.sp.vuln * sizeSel(it, a) * lunge * hide;   // how well placed it is; a strike's success
      C.push(it, w, s); sK += w * s; sM += w * Math.max(0, 1 - s);
      if (w > bestW) { best = it; bestW = w; bestS = s; }
    });
    if (!best) return null;
    let prey = null;
    if (dt === Infinity) {   // one strike at the best-placed fish
      if (rand() >= bestS) { a.missCd = FEED.MISS_CD; best.fear = 1; return null; }
      prey = best;
    } else {
      const rate = FEED.ATTACK * this.env.clarity() * perf * dt;   // (a cold predator hunts more slowly: coldPerf)
      if (rand() < 1 - Math.exp(-rate * sK)) {   // a kill: which fish ∝ closeness × success
        let u = rand() * sK; for (let i = 0; i < C.length; i += 3) { prey = C[i]; u -= C[i + 1] * C[i + 2]; if (u <= 0) break; }
      } else {
        if (sM > 0 && rand() < 1 - Math.exp(-rate * sM)) {   // a miss: the fish it lunged at bolts
          let u = rand() * sM, m = null; for (let i = 0; i < C.length; i += 3) { m = C[i]; u -= C[i + 1] * Math.max(0, 1 - C[i + 2]); if (u <= 0) break; }
          a.missCd = FEED.MISS_CD; m.fear = 1;
        }
        return null;
      }
    }
    prey.dead = true; this._counts[prey.species]--;
    if (prey.id === this.selectedId) this.selectedId = null;
    const n = 1 + (prey.size * DETRITUS.FROM_DEATH * 2 | 0);   // scraps, scales and slime (a messier kill for a bigger prey)
    for (let k = 0; k < n; k++) this.spawnDetritus(prey.x + rand(-3, 3), prey.y + rand(-3, 3));
    a.tox += prey.tox * TOX.ASSIM;   // the predator assimilates its prey's whole accumulated burden → BIOMAGNIFICATION up the chain
    return prey;
  }
  // a prey fish's shoal density for predator confusion/dilution (allyStats over SCHOOL.DILUTE_R), once per fish per step —
  // every predator hunting near it asks
  _shoalOf(p) {
    const s = this._stepNo || 0;
    if (p._dlS !== s || p._dl === undefined) { p._dlS = s; p._dl = this.allyStats(p, SCHOOL.DILUTE_R).density; }
    return p._dl;
  }

  // ---------- main step ----------
  // biotic shading a plant receives from TALLER neighbours (a 0..1 light multiplier) — linear scan for tests/diagnostics;
  // the step loop uses a bucketed version (same overheadFrom formula) for speed.
  plantShadeFactor(p) { return Math.exp(-COMPETE.SHADE * overheadFrom(p, this.plants, COMPETE.RADIUS)); }
  step(dt) {
    this.time += dt; this._stepNo = (this._stepNo || 0) + 1;
    const env = this.env;
    const smoothK = 1 - Math.exp(-dt / 0.65); // ease steering over ~0.5s -> smooth, fish-like motion

    // the lake's fish biomass (kg/ha — the kairomone level that sets the zooplankton's vertical migration, PLANKTON.DVM_*)
    { let g = 0; for (const a of this.agents) if (!a.dead) g += a.W; for (const f of this.fry) if (!f.dead) g += f.n * f.W; env.fishKgHa = g / 1000 / (WORLD.SLICE_M2 / 1e4); }
    // environment fields (uses current plants & agents; the zooplankton fields grow and graze inside it)
    env.step(dt, this);

    const area = WORLD.AREA_SCALE;   // (densities below are per reference pond, × the world's area)
    // mussels filter phytoplankton from the water just above the bed → clearer water
    for (const m of this.mussels) env.grazePhyto(m.x, m.y - 12, MUSSEL.FILTER * m.n * 0.25 * dt);

    // detritus sinks to the bed & dissolves into DOM (the microbial loop then decomposes it gradually —
    // temperature- & O₂-gated — releasing the bound N+P back to the inorganic pools, instead of an instant dump)
    for (const d of this.detritus) {
      if (d.dead) continue;
      d.y = Math.min(bedY(d.x), d.y + DETRITUS.SINK * dt); d.life -= dt;
      if (d.life <= 0) { d.dead = true; env.addSedOM(d.x, d.m); if (d.n > 0) { env.addDOM(d.x, d.y, d.n); d.n = 0; } }   // its matter joins the bed's organic layer; its N+P (if any) dissolves into DOM
    }

    // aquatic insects — a CROSS-BOUNDARY life cycle. Benthic LARVAE are deposit feeders: a patch GROWS on the organic
    // detritus of the bed under it (SEDOM — Monod in the column's layer, with warmth) and loses weight when there is too
    // little; it develops with WARMTH, is eaten by bottom fish, dies off in an anoxic bottom, and when mature + warm
    // EMERGES as surface adults (a pulsed, seasonal hatch); surface adults drift, are eaten by surface fish, and an uneaten
    // one lays an egg (→ a new patch) before it expires. New patches also settle in the warm season where there is food.
    const larvaCap = scaleCount(INSECT.LARVA_CAP), lTw = INSECT.DEV_TEMP_OPT - INSECT.DEV_TEMP_MIN;
    const devF = clamp((env.tempC - INSECT.DEV_TEMP_MIN) / lTw, 0, 1);   // warmth drives development (surface temperature)
    for (let n = poissonish(INSECT.LARVA_RATE * area * devF * dt); n > 0 && this.larvae.length < larvaCap; n--) {
      const L = this._mkLarva(), s = env.sedOMAt(L.x);
      if (env.oxygenAt(L.x, L.y) >= INSECT.O2_MIN && rand() < s / (s + INSECT.K_SOM)) this.larvae.push(L);   // the young settle where the bed has food and O₂
    }
    const canHatch = env.tempC > INSECT.HATCH_TEMP, insectCap = scaleCount(INSECT.ADULT_CAP);
    for (const L of this.larvae) {
      if (L.dead) continue;
      const th = clamp((env.tempAt(L.x, L.y) - INSECT.DEV_TEMP_MIN) / lTw, 0, 1);   // the warmth of the water it lives in
      L.dev += INSECT.DEV_RATE * th * dt;   // (in the cold summer hypolimnion the profundal larvae develop slowly — a 1–2-year life)
      if (L.dev >= 1 && canHatch) { L.dead = true; if (this.insects.length < insectCap) this.insects.push(this._mkInsect(L.x, L.m * INSECT.EMERGE_M)); continue; }   // EMERGE: larva → surface adult
      if (th > 0) {   // grow on the column's detritus (debited at 1/YIELD), or lose weight when it runs short
        const s = env.sedOMAt(L.x), want = INSECT.GROW * th * s / (s + INSECT.K_SOM) * L.m * Math.max(0, 1 - L.m / PREY.LARVA_G) * dt;
        const lg = env.takeSedOM(L.x, want / INSECT.YIELD) * INSECT.YIELD; this._larvaProd = (this._larvaProd || 0) + lg;   // (diagnostic production tally, never read by the sim)
        L.m += lg - INSECT.RESP * th * L.m * dt;
        if (L.m < 0.02) { L.dead = true; continue; }
      }
      if (env.oxygenAt(L.x, L.y) < INSECT.O2_MIN && rand() < INSECT.ANOX_DEATH * Math.pow(2, (env.tempAt(L.x, L.y) - 20) / 10) * dt) { L.dead = true; env.addSedOM(L.x, L.m); }   // anoxic bottom: the patch dies (and rots) — slowly in cold water
    }
    for (const I of this.insects) {
      if (I.dead) continue;
      I.life -= dt;
      I.x += (I.vx + env.currentAt(I.x, I.y)) * dt;                       // drift on its own motion + the surface current
      if (I.x < 4) { I.x = 4; I.vx = Math.abs(I.vx); } else if (I.x > W - 4) { I.x = W - 4; I.vx = -Math.abs(I.vx); }
      if (I.life <= 0) { I.dead = true; if (rand() < INSECT.EGG && this.larvae.length < larvaCap) this.larvae.push(this._mkLarva(I.x, 0)); }   // an uneaten adult lays its eggs → a new patch of young larvae
    }

    // benthic INVERTEBRATES — grazing SNAILS + omnivorous CRAYFISH, particle populations on the bed. Snails graze the bed's
    // algae-and-detritus layer (below); crayfish follow a SEASONAL LOGISTIC toward a shelter-limited carrying
    // capacity (CRAYFISH: per-capita CRAYFISH.R a year in warm water, natural mortality CRAYFISH.M — production ~1–1.5× the
    // stock a year, as measured) and are eaten by fish. They crawl the bed, are eaten by fish opportunistically (no
    // dedicated brain sense), and close two benthic web links: bed algae→snail→{sunfish,carp,bullhead,crayfish} and crayfish→{bass,pike,
    // catfish,perch}.
    // SNAILS: a seasonal per-capita logistic (SNAIL.R a year in warm water) toward SNAIL.CAP, the young settling where the
    // bed's layer can feed them; each scrapes the layer under it (SNAIL.GRAZE × Q10 2), dies of age (SNAIL.M, about a year's
    // life) or of hunger where the layer runs out, and keeps to the lit littoral bed
    const snailCap = scaleCount(SNAIL.CAP), snailFloor = scaleCount(SNAIL.FLOOR), nSn = Math.max(this.snails.length, 3);
    const snT = clamp((env.tempC - SNAIL.R_T[0]) / (SNAIL.R_T[1] - SNAIL.R_T[0]), 0, 1);
    for (let n = poissonish(SNAIL.R / TIME.YEAR_LEN * snT * nSn * clamp(1 - this.snails.length / snailCap, 0, 1) * dt); n > 0 && this.snails.length < snailCap; n--) {
      const s = this._mkSnail(), f = env.sedOMAt(s.x);
      if (rand() < f / (f + SNAIL.K_SOM)) this.snails.push(s);
    }
    if (this.snails.length < snailFloor) for (let n = poissonish(6 * area * dt); n > 0 && this.snails.length < snailFloor; n--) this.snails.push(this._mkSnail());
    const snLim = SNAIL.MAX_DEPTH * H;
    for (const s of this.snails) {
      if (s.dead) continue;
      if (rand() < SNAIL.M / TIME.YEAR_LEN * dt) { s.dead = true; continue; }                  // old age (an annual life)
      const want = SNAIL.GRAZE * Math.pow(2, (env.tempAt(s.x, s.y) - 20) / 10) * dt;
      if (env.takeSedOM(s.x, want) < 0.5 * want && rand() < SNAIL.STARVE * dt) { s.dead = true; continue; }   // the layer can't feed it
      if (bedY(s.x) > snLim) s.vx = shoreDir(s.x) * SNAIL.CRAWL;           // below the lit bed: crawl back up
      s.x += s.vx * dt; if (s.x < 4) { s.x = 4; s.vx = Math.abs(s.vx); } else if (s.x > W - 4) { s.x = W - 4; s.vx = -Math.abs(s.vx); }
      s.y = bedY(s.x) - 2;                                                                      // ride the sloping bed
    }
    // REFUGE: the first SNAIL.REFUGE × CAP snails (array order) are tucked into the weeds and stems, out of reach of fish,
    // crayfish and turtles — the stock that rebuilds a grazed-down population (snails persist among molluscivores this way)
    { const nR = Math.round(SNAIL.REFUGE * snailCap); let i = 0; for (const s of this.snails) if (!s.dead) s.sh = i++ < nR; }
    this.snailGrid.rebuild(this.snails);   // built here (snails don't move again this step) so crayfish + fish can query it
    const crayCap = scaleCount(CRAYFISH.CAP), nightF = 1 + (CRAYFISH.NIGHT - 1) * (1 - env.light);  // crepuscular: more active at night
    const crT = clamp((env.tempC - CRAYFISH.R_T[0]) / (CRAYFISH.R_T[1] - CRAYFISH.R_T[0]), 0, 1), nCr = Math.max(this.cray.length, 3);
    for (let n = poissonish(CRAYFISH.R / TIME.YEAR_LEN * crT * nCr * clamp(1 - this.cray.length / crayCap, 0, 1) * dt); n > 0 && this.cray.length < crayCap; n--) this.cray.push(this._mkCray());
    for (const cf of this.cray) {
      if (cf.dead) continue;
      if (rand() < CRAYFISH.M / TIME.YEAR_LEN * dt) { cf.dead = true; continue; }
      const cv = this.nearestCover(cf.x, cf.y, 300);                                            // refuge-seeking: steer the crawl toward the nearest cover
      if (cv && Math.abs(cv.x - cf.x) > 6) cf.vx += Math.sign(cv.x - cf.x) * CRAYFISH.COVER_PULL * CRAYFISH.CRAWL * dt;
      cf.vx = clamp(cf.vx, -CRAYFISH.CRAWL, CRAYFISH.CRAWL);
      // a crayfish stays on the littoral/sublittoral bed: one below CRAYFISH.MAX_DEPTH (an old save) walks back up toward
      // the nearer shore, and one about to crawl deeper turns back
      const crLim = CRAYFISH.MAX_DEPTH * H, x0 = cf.x;
      if (bedY(cf.x) > crLim) cf.vx = shoreDir(cf.x) * CRAYFISH.CRAWL;
      cf.x += cf.vx * nightF * dt; if (cf.x < 4) { cf.x = 4; cf.vx = Math.abs(cf.vx); } else if (cf.x > W - 4) { cf.x = W - 4; cf.vx = -Math.abs(cf.vx); }
      if (bedY(cf.x) > crLim && bedY(cf.x) > bedY(x0)) { cf.x = x0; cf.vx = -cf.vx; }
      cf.y = bedY(cf.x) - 2;
      if (rand() < CRAYFISH.SNAIL_HUNT * nightF * dt) this._takeNearest(this.snailGrid, cf.x, cf.y, CRAYFISH.EAT_R, 1, exposedSnail);   // prey on a nearby snail (snail population control)
    }
    // shelter holders: the oldest CRAYFISH.SHELTER × K crayfish (the array is in order of birth) sit in burrows, out of reach
    { const nSh = Math.round(CRAYFISH.SHELTER * crayCap); let i = 0; for (const cf of this.cray) if (!cf.dead) cf.sh = i++ < nSh; }
    this.crayGrid.rebuild(this.cray);

    // plants grow (light + nutrient + SEASONAL vigor); senesce and die back in the cold season → a fall DOM pulse
    let plantCount = 0;
    const tWin = PLANT.GROW_TEMP_OPT - PLANT.GROW_TEMP_MIN;
    // shading competition: bucket live plants into RADIUS-wide x-columns so each only checks its own ± 1 bucket for
    // taller overhead neighbours (O(n), not O(n²)). Per-plant effective params (p.growMul/tempMin/lightMin) = genes × variety.
    const RAD = COMPETE.RADIUS, nB = Math.ceil(W / RAD) + 1, pcols = Array.from({ length: nB }, () => []);
    const kLight = 1 - Math.exp(-dt / PLANT.LIGHT_TAU), atten = env.attenuation();   // light-EMA step; attenuation for seedling init
    for (const q of this.plants) if (!q.dead) pcols[clamp((q.x / RAD) | 0, 0, nB - 1)].push(q);
    for (const p of this.plants) {
      if (p.dead) continue; plantCount++;
      const topY = p.baseY - p.height, nutr = env.nutrientAt(p.x, p.baseY);
      // effective light = abiotic light at the plant's top × biotic shading from TALLER neighbours (→ stratified canopy + self-thinning)
      const ci = clamp((p.x / RAD) | 0, 0, nB - 1);
      let oh = 0; for (let b = Math.max(0, ci - 1); b <= Math.min(nB - 1, ci + 1); b++) oh += overheadFrom(p, pcols[b], RAD);
      const shade = oh > 0 ? Math.exp(-COMPETE.SHADE * oh) : 1, lit = env.lightAtDepth(topY) * shade;
      // running-mean light (EMA over ~LIGHT_TAU) — what light-starvation is judged on. A new seedling (or a plant from an
      // older save lacking it) starts at the long-run mean light expected at its top, so it isn't born "starving" at night.
      if (p.lightAvg == null) p.lightAvg = PLANT.DAY_MEAN_LIGHT * Math.exp(-atten * (topY / H)) * shade;
      else p.lightAvg += (lit - p.lightAvg) * kLight;
      // seasonal vigor (0..1): a temperature-driven growing-season factor — full when warm, 0 below the variety's
      // cold threshold (autumn/winter or the cold deep). Per-depth temp ⇒ deep/cold beds can't grow tall (a depth limit).
      const vigor = clamp((env.tempAt(p.x, p.baseY) - p.tempMin) / Math.max(3, PLANT.GROW_TEMP_OPT - p.tempMin), 0, 1);  // floor the window so a high cold-tolerance gene can't make vigor a near-step
      if (vigor > 0 && p.height < p.maxHeight) {
        const grow = PLANT.GROWTH * p.growMul * vigor * lit * (0.35 + 0.65 * clamp(nutr, 0, 1)) * dt;
        p.height = Math.min(p.maxHeight, p.baseY - 2, p.height + grow);   // (no taller than the water: in the shallows a plant tops out at the surface)
        p.nut = (p.nut || 0) + env.takeNutrient(p.x, p.baseY, NUTRIENT.PLANT_UPTAKE * grow);   // bank what was actually absorbed
      }
      // autumn/winter senescence: die back toward the overwintering rootstock; shed biomass dissolves into the DOM pool
      // (the realistic fall organic-matter pulse the microbial loop then remineralizes). Floors at the WINTER_MIN rootstock
      // (which grazing can't remove either), so the perennial regrows in spring — only light-starvation kills it.
      if (vigor < 1 && p.height > PLANT.WINTER_MIN) {
        const shed = Math.min(p.height - PLANT.WINTER_MIN, PLANT.SENESCE * (1 - vigor) * p.height * dt);
        const ret = (p.nut || 0) * shed / Math.max(p.height, 1e-6);   // the shed tissue's share of the plant's N+P
        p.height -= shed; p.nut -= ret;
        env.addDOM(p.x, p.baseY, ret); env.addSedOM(p.x, shed * PLANT.LITTER_G);   // its N+P dissolves; the litter joins the bed's organic layer
      }
      p.biomass = p.height * PLANT.BIOMASS_PER_PX; p.y = p.baseY - p.height * 0.5;
      // death is now LIGHT-starvation, not grazing: a macrophyte whose RUNNING-MEAN light is below its light tolerance (too
      // deep / too turbid / too shaded to photosynthesize) uproots over time → the realistic depth limit + the seed of the
      // clear↔turbid feedback (forms differ: turbidity-sensitive chara needs clear water, shade-tolerant milfoil persists
      // deep). Judged on the daily mean, so night is not starvation; rootstock is grazing- & winter-proof → beds persist.
      // A DORMANT plant (cold water at its base — winter, often under ice and snow) has shut down to its rootstock / winter
      // buds and can't starve: real pondweeds and milfoils overwinter this way instead of dying (and rotting) under the ice.
      const dormant = env.tempAt(p.x, p.baseY) < PLANT.DORMANT_T;
      if (!dormant && p.lightAvg < p.lightMin && rand() < PLANT.SHADE_DEATH * dt) { p.dead = true; env.addDOM(p.x, p.baseY, p.nut || 0); p.nut = 0; env.addSedOM(p.x, p.height * PLANT.LITTER_G); }   // a light-starved plant DECOMPOSES → all its N+P to DOM, its tissue to the bed's litter
    }
    // recruitment is seasonal too — new plants establish mostly in the warm growing season (vigor off the surface temp)
    const seedVigor = clamp((env.tempC - PLANT.GROW_TEMP_MIN) / tWin, 0, 1);
    const plantCap = scaleCount(PLANT.MAX);
    if (plantCount < plantCap) for (let n = poissonish(PLANT.SEED_RATE * area * seedVigor * dt); n > 0 && plantCount < plantCap; n--) {
      // CLONAL SPREAD: most new shoots are RUNNERS (rhizome/stolon ramets) a short way from an established plant, of its own
      // species — real pondweeds, milfoil and muskgrass spread mainly this way, so beds grow outward as patches. The rest
      // are SEEDS landing anywhere: a seedling inherits (mutated) the nearest plant's genes, an isolated one founds fresh.
      let x, parent = null, clone = false;
      if (this.plants.length && rand() < PLANT.CLONAL) {
        const q = this.plants[(rand() * this.plants.length) | 0];
        if (!q.dead && q.height >= PLANT.WINTER_MIN * 1.5) { parent = q; clone = true; x = clamp(q.x + (rand() < 0.5 ? -1 : 1) * rand(PLANT.RUNNER[0], PLANT.RUNNER[1]), 4, W - 4); }
      }
      if (!clone) { x = plantX(); const near = this.nearestPlant(x, bedY(x) - 10, 240); parent = near ? near.item : null; }   // unscaled: dispersal is not a fish's visual sense
      const sd = newPlant(x, false, parent, clone);
      // ESTABLISHMENT needs light: a seed only takes root where the daily-mean light expected at its top — after depth
      // attenuation AND the shade of the existing canopy — meets its own light requirement. Seeds landing under a closed
      // bed or in the dark deep simply fail (as real macrophyte seedlings do) instead of spawning a doomed seedling that
      // starves within seconds — which, with the seed rain far exceeding the canopy's room, was most of the bed churn.
      // Gaps and lit shallows still get colonised. Deterministic (no RNG beyond newPlant's).
      const ci = clamp((sd.x / RAD) | 0, 0, nB - 1);
      let oh = 0; for (let b = Math.max(0, ci - 1); b <= Math.min(nB - 1, ci + 1); b++) oh += overheadFrom(sd, pcols[b], RAD);
      const expLight = PLANT.DAY_MEAN_LIGHT * Math.exp(-atten * ((sd.baseY - sd.height) / H)) * (oh > 0 ? Math.exp(-COMPETE.SHADE * oh) : 1);
      if (expLight < sd.lightMin) continue;
      sd.lightAvg = expLight;
      this.plants.push(sd); plantCount++;
    }

    // rebuild spatial grids
    this.agentGrid.rebuild(this.agents);
    this.detritusGrid.rebuild(this.detritus);
    this.larvaeGrid.rebuild(this.larvae);
    this.insectGrid.rebuild(this.insects);
    this.nymphGrid.rebuild(this.nymphs);
    this.herpGrid.rebuild(this.herps);
    this.fryGrid.rebuild(this.fry);

    // counts + clear mating flags
    const counts = this._counts = {}; for (const k of SPECIES) counts[k] = 0;
    for (const a of this.agents) { if (!a.dead) counts[a.species]++; a._mated = false; }
    const fryN = {}; for (const k of SPECIES) fryN[k] = 0;   // live young-of-year schools per species (spawning slots)
    for (const f of this.fry) if (!f.dead) fryN[f.k]++;
    // parents currently guarding a nest (by id) — their fry look them up; takePrey checks the guarded zone
    const guards = this._guards || (this._guards = new Map()); guards.clear();
    for (const a of this.agents) if (!a.dead && a.nt > 0) guards.set(a.id, a);

    // TEMPERATURE-TRIGGERED SPAWNING: real fish spawn when the shallows warm into their species' window (SP.spawnT, °C)
    // in spring/summer — pike just after ice-out (4–11 °C), bass in late spring (15–21), sunfish/minnows repeatedly
    // through summer — not on fixed calendar dates, and never on the autumn cooling path or under ice. Soft edges (SPAWN.
    // EDGE °C); 0 outside the season. A warm spring brings spawning forward, as in real lakes. Once per step for all.
    const yf = env.yearFrac(), spawnF = {}, shoreT = env.tempC - env.tempDiel;
    for (const k of SPECIES) spawnF[k] = spawnFactor(SP[k], shoreT, yf, env.ice);

    const newborns = [];
    for (const a of this.agents) {
      if (a.dead) continue;
      const sp = a.sp;
      a.age += dt; a.mateCd -= dt; if (a.missCd > 0) a.missCd -= dt;
      // MATURATION by size AND age (a maturation reaction norm): a fish matures once it reaches its maturation length —
      // the size gene's target — and is old enough; a well-fed lineage therefore matures younger than a stunted one
      if (!a.mature && matureAt(sp, a.L, a.Lmat, a.age)) a.mature = true;   // (the reaction norm: lmatAt)

      // senses() is read-only, so a threat/prey query it made for THIS fish is still exact for the drive + perception reads
      // below (each was otherwise computed twice per fish per step). The caches are cleared before senses and after use.
      // DECISION RATE: a fish re-senses and re-thinks at BRAIN.DECIDE_HZ (real fish react in ~30–100 ms), acting on its last
      // (smoothed) intent in between; movement still integrates every step. dt-agnostic: the headless 1/30 step decides every
      // step, the browser's 1/60 every other (staggered by id), so both run the brain at the same rate. `dAcc` is saved.
      if (a.dAcc === undefined) a.dAcc = (a.id & 1) * 0.5 / BRAIN.DECIDE_HZ;
      a.dAcc += dt; a.fear *= Math.exp(-DRIVE.FEAR_DECAY * dt);   // (hunger = the gut's emptiness, set by the feeding step)
      if (a.dAcc >= 1 / BRAIN.DECIDE_HZ - 1e-9) {
        a.dAcc -= 1 / BRAIN.DECIDE_HZ;
        this._qtA = this._qpA = null;
        sp.senses(a, this);
        // INTERNAL DRIVES (motivation): persistent per-fish state fed back as the last two brain inputs, so behaviour is
        // state-dependent (the NN learns to use them — emergent). HUNGER accrues with time since a meal (sated in the feed
        // step below); FEAR jumps to the nearest-threat proximity and decays after it leaves (lingering caution). The brain
        // wires these to its gated actions (a starving fish gambles on a strike; a scared one hides/flees).
        const drv = this._qtA === a ? this._qtR : this.qThreat(a), threatNear = drv ? clamp(1 - drv.dist / (a.senseRange * 1.1), 0, 1) : 0;
        a.fear = Math.max(threatNear, a.fear);
        // SPATIAL COGNITION (allocentric sense of place & direction): a COMPASS (sin/cos of the absolute body heading) +
        // a HOME bearing (signed horizontal displacement to the natal site, normalised by lake width). Written into the
        // spatial block [base, base+1, base+2] (drives stay in the last two slots). Pure functions of sim state → deterministic.
        const sb = sp.baseInputs; if (a.homeX === undefined) a.homeX = a.x;   // older saves lacking homeX home to their current spot
        a.act.in[sb] = Math.sin(a.heading); a.act.in[sb + 1] = Math.cos(a.heading);
        a.act.in[sb + 2] = clamp((a.homeX - a.x) / W, -1, 1);   // >0 ⇒ home is to the right; the substrate for evolved homing/site-fidelity/migration
        // RICHER PERCEPTION: lateral-line flow (mechanosensory → NOT clarity-scaled, works when vision fails) + prey-size selectivity (piscivores)
        a.act.in[sb + 3] = clamp(env.currentAt(a.x, a.y) / 12, -1, 1);   // signed local current (rheotaxis); the turbidity-proof sense
        let preySz = 0; if (sp.diet.fish) { const pr = this._qpA === a ? this._qpR : this.qPrey(a); if (pr) preySz = clamp(pr.item.L / a.L, 0, 1); }
        this._qtA = this._qpA = null;
        a.act.in[sb + 4] = preySz;   // relative size of the nearest CATCHABLE prey (0 = none / not a piscivore) → evolved prey-size selectivity
        a.act.in[sp.shape.in - 2] = a.hunger; a.act.in[sp.shape.in - 1] = a.fear;
        if (!a.lw) a.lw = Float32Array.from(a.g);   // older saves lack the plastic copy → derive it from the genotype
        forward(a.lw, a.act.in, a.act, sp.shape, a.activeHid);   // run the PLASTIC policy (lifetime learning), with only `activeHid` hidden units active (evolvable brain size)
      }
      a.turnSmooth += (a.act.turn - a.turnSmooth) * smoothK;
      a.thrustSmooth += (a.act.thrust - a.thrustSmooth) * smoothK;
      const turn = a.turnSmooth; let thrust = a.thrustSmooth;
      const h0 = a.heading;   // body heading at the START of the frame → total turn this frame = angDiff(heading, h0) (for momentum)

      // turn authority drops with speed → fast fish bank in smooth arcs instead of darting (less twitch)
      const turnAuth = clamp(1 - 0.5 * (a.spd / a.maxSpeed), 0.4, 1);
      a.heading += turn * a.maxTurn * turnAuth * dt;

      // gentle, anticipatory edge avoidance: curve away from side walls & the surface *before*
      // contact so fish don't ram and bounce. (The floor is left to sink + bottom-feeding.)
      const m = 44;
      let steer = 0;
      if (a.x < m) steer = angDiff(0, a.heading);                 // toward +x
      else if (a.x > W - m) steer = angDiff(Math.PI, a.heading);  // toward -x
      else if (a.y < m) steer = angDiff(Math.PI / 2, a.heading);  // downward, away from surface
      if (steer) a.heading += clamp(steer, -1, 1) * a.maxTurn * 0.55 * dt;

      // innate behavioral baseline (ethogram): a depth-home reflex toward the species' real preferred
      // zone + a species cruise style — the NN MODULATES this, it doesn't replace it. The depth-home pull
      // SCALES with displacement (∝ |vBias|): gentle near home depth, firmer the further a fish strays,
      // so the brain stays the primary driver in its home zone. No RNG → deterministic. So a catfish hugs
      // the bottom, a minnow rides shallow, a pike lurks — as a baseline the brain refines.
      const IN = sp.innate;
      let escUp = null, o2Climb = 0;   // the O₂ ESCAPE heading (near-lethal water) and the hypoxia climb rate (× maxSpeed), below
      if (IN) {
        const bedX = bedY(a.x);
        let prefY = clamp(IN.homeDepth * bedX, 8, bedX - 8);
        // HYPOXIA AVOIDANCE (behavioural oxyregulation): real fish leave water below their critical O₂ rather than sit in
        // it. When the local O₂ is under the fish's own o2Crit × ENV.HYPOXIA_AVOID margin, the depth reflex retargets
        // UPWARD (in a stratified lake O₂ rises toward the surface), harder the worse the deficit. Innate + deterministic;
        // the brain still modulates it, like the depth-home pull it adjusts.
        const o2Want = a.o2Crit * ENV.HYPOXIA_AVOID, o2Here = env.oxygenAt(a.x, a.y);
        // BEHAVIOURAL THERMOREGULATION: a fish too warm at its home depth (above its optimum + half its tolerance) seeks the
        // shallowest cooler water below — trout and pike drop to the thermocline in summer. The O₂ check that follows lifts
        // it back out of anoxic water, so a cold-water fish ends up squeezed between warm and oxygen-starved water.
        const tooWarm = sp.tempOpt + a.tempTol * 0.5, hot = env.tempAt(a.x, a.y) > tooWarm;
        if (env.tempAt(a.x, prefY) > tooWarm) {
          let y = prefY; while (y < bedX - 12 && env.tempAt(a.x, y) > tooWarm) y += 24;
          // no cool water under it (the warm shallow shelf): don't settle on the warm bottom — head offshore, over the deep
          // basin, where the cool water is
          if (env.tempAt(a.x, Math.min(y, bedX - 8)) > tooWarm) { const off = shoreDir(a.x) < 0 ? 0 : Math.PI; a.heading += angDiff(off, a.heading) * a.maxTurn * 1.5 * dt; }
          else prefY = Math.min(y, bedX - 8);
        }
        // OXYGEN-LIMITED HABITAT: a fish doesn't settle where the water can't support it. If its preferred depth lies in
        // water below its O₂ limit (the summer anoxic hypolimnion, the late-winter deep), the target rises to the deepest
        // water above that still holds enough O₂ — and a bottom-dweller whose local bed is anoxic heads for the shallower
        // shelf, where the bottom lies in oxygenated water (the summer "habitat squeeze" of real stratified lakes).
        if (env.oxygenAt(a.x, prefY) < o2Want) {
          let y = prefY; while (y > 12 && env.oxygenAt(a.x, y) < o2Want) y -= 24;
          prefY = Math.max(8, y);
          if (IN.homeDepth >= 0.75) {
            const toShore = shoreDir(a.x) < 0 ? Math.PI : 0;   // the nearer shore = shallower bed
            a.heading += angDiff(toShore + (Math.cos(toShore) > 0 ? -0.25 : 0.25), a.heading) * a.maxTurn * 1.0 * dt;   // (toward the shore and a little UP)
          }
        }
        if (o2Here < o2Want) { const def = clamp((o2Want - o2Here) / o2Want, 0, 1); prefY = Math.min(prefY, a.y - 20 - 60 * def); o2Climb = 0.5 * def; }
        // ESCAPE: in water near its LETHAL O₂ a fish bolts straight up and toward the shore (one behavioural second here is
        // hours of exposure for its physiology, so it can't afford to linger)
        // (applied after every other modulation — a resting, cold or day-resting fish still bolts: see below)
        if (o2Here < a.o2Lethal * Math.exp(BIOE.O2_LETHAL_T * (env.tempAt(a.x, a.y) - 25)) * 3) { escUp = -Math.PI / 2 + (shoreDir(a.x) < 0 ? -0.25 : 0.25); o2Climb = 1.5; }
        // HEAT ESCAPE, the same way: in water within 3 °C of its lethal temperature a fish leaves at once — down if the
        // water below is cooler and breathable, else offshore over the deep basin — whatever it was chasing or eating
        // (a trout makes brief raids into the warm shallows; a behavioural second there is ~5 h of heat)
        else if (env.tempAt(a.x, a.y) > a.uilt - 3) {
          const below = Math.min(a.y + 60, bedY(a.x) - 6), cooler = env.tempAt(a.x, below) < env.tempAt(a.x, a.y) - 1 && env.oxygenAt(a.x, below) > a.o2Crit;
          escUp = cooler ? Math.PI / 2 : (shoreDir(a.x) < 0 ? 0.15 : Math.PI - 0.15);
        }
        // SPAWNING AGGREGATION target (applied below): in its spawning season a breeding-ready adult migrates to the
        // littoral spawning ground — ONE per species (sp.spawnSide −1 left = the inflow marsh, +1 right shelf), so a sparse
        // population converges where mates can find each other, as real pike do on a traditional spawning marsh
        let mig = null;
        if (IN.spawnGround && spawnF[a.species] > SPAWN.AGG_SEASON && breedReady(a)) {
          // (in the fish's own water body — the lake or the pond; a fish in the stream counts with the nearer one: its inflow
          // side −1, its far side +1)
          // (a species without its own side gathers at its water body's INFLOW side — the lake's inlet marsh, the pond's stream
          // mouth: one shared ground per water body, so a sparse species' spawners meet instead of splitting between shores)
          const hb = homeBasinAt(a.x), hw = hb.x1 - hb.x0, side = sp.spawnSide || -1;
          const gx = side < 0 ? hb.x0 + hw * SPAWN.GROUND_X : hb.x1 - hw * SPAWN.GROUND_X, gb = bedY(gx);
          const gy = clamp(gb * 0.6, 8, gb - 8);
          mig = { gx, gy, d: Math.hypot(gx - a.x, gy - a.y) };
        }
        const vBias = clamp((prefY - a.y) / 120, -1, 1);
        if (Math.abs(vBias) > 0.05) {
          // keep heading-ish (or, migrating, toward the spawning ground — else depth-keeping pins a fish that must turn
          // back through the vertical), biased toward the home depth
          const hx = mig && mig.d > 30 ? (mig.gx < a.x ? -0.7 : 0.7) : Math.cos(a.heading) >= 0 ? 0.7 : -0.7;
          const desired = Math.atan2(vBias, hx);
          a.heading += angDiff(desired, a.heading) * a.maxTurn * IN.depthPull * Math.abs(vBias) * (hot ? 2.5 : 1) * dt;   // heat stress: a strong pull
        }
        // ease activity toward the species' cruise norm — nocturnal species (catfish) crank it up at night
        // and rest by day (surface time-of-day drives diel activity, not the fish's local depth light)
        const cruiseT = IN.nocturnal ? IN.cruise * (1.5 - env.light) : IN.cruise;
        thrust += (cruiseT - thrust) * IN.weight * 0.5;
        // DIEL REST: the cruise blend above is a weak (~22%) pull, so on its own a nocturnal fish was only ~8% busier at
        // night. Real catfish rest by day and forage at night — scale the DELIVERED thrust down in daylight (a
        // multiplicative rhythm the brain still drives within; it doesn't override what the brain wants, just damps it).
        if (IN.dayRest) thrust *= 1 - IN.dayRest * env.light;
        // schooling: gently steer toward the local shoal's centroid (cohesion) → loose, realistic schools
        if (IN.school) {
          const al = this.allyStats(a, 56);
          if (al.density > 0.05) a.heading += clamp(Math.atan2(al.cohSin, al.cohCos), -1.2, 1.2) * a.maxTurn * IN.school * al.density * dt;
        }
        // ambush: a lurker eases toward a near-still hold until prey comes CLOSE (sensor[2] = 'prey near'),
        // then bursts. A weighted BLEND (not a hard clamp) so a strongly-committed evolved brain can still
        // override the lurk reflex — i.e. the NN modulates this like every other innate term.
        if (IN.ambush && (a.act.in[2] || 0) < 0.45) thrust += (IN.cruise * 0.45 - thrust) * (IN.ambushW || 0.6);
        // pursuit: a piscivore turns toward prey it senses — the prey-orienting reflex real predators are born with —
        // harder the closer it is. A weighted nudge the brain can override or build on; it bootstraps hunting so predator
        // lineages don't starve before selection can refine it. Uses the species' prey sensors (inputs 0..2 = prey ∠sin,
        // ∠cos, near; set `pursuit` only on species whose senses() put them there).
        if (IN.pursuit && (a.act.in[2] || 0) > 0) {
          const rel = Math.atan2(a.act.in[0], a.act.in[1]);   // prey bearing relative to the body heading
          a.heading += clamp(rel, -1, 1) * a.maxTurn * IN.pursuit * a.act.in[2] * dt;
        }
        // FORAGING: a hungry forager turns toward the food it senses (every species' first sensor is its food), harder the
        // hungrier and the closer — the innate orienting response to food that real fish are born with. With real life
        // histories a generation takes years, so a lineage can't wait for its brains to evolve the basics before it starves;
        // the brain refines it like the other reflexes
        // (a ripe fish on its spawning migration — `mig`, more than SPAWN.MIG_FORAGE_D px from its ground — travels rather
        // than forages: spawners cut feeding and move; the food pull and patch residence would hold it in the first rich patch)
        const migrating = mig && mig.d > SPAWN.MIG_FORAGE_D;
        if (IN.forage && !migrating && (a.act.in[2] || 0) > 0) {
          const rel = Math.atan2(a.act.in[0], a.act.in[1]);
          a.heading += clamp(rel, -1, 1) * a.maxTurn * IN.forage * a.act.in[2] * a.hunger * dt;
        }
        // PATCH RESIDENCE (the marginal-value rule): a forager that has just been feeding in a food patch stays in it —
        // slowing to a hover and picking at it as its stomach empties — rather than cruising off after each bite. A small
        // fish's stomach holds a few hours' ration and one behavioural second is ~5 h, so a fish that left after every
        // mouthful would starve in a lake full of food. It moves on once the patch is gone (its food sense points further).
        if (IN.forage && !migrating && (a.foodT ?? 9) < FEED.RESIDE_T && (a.act.in[2] || 0) > 1 - PREY.PATCH_R / a.senseRange) thrust *= FEED.RESIDE;
        // SPAWNING AGGREGATION (target `mig` above): bass nest in the shallows, pike/carp spawn in flooded weed margins,
        // catfish nest in shallow cavities. Innate + deterministic; the brain modulates it like the other reflexes, and it
        // switches off out of season or once the fish is spent.
        // A migrating spawner TRAVELS: it holds a purposeful pace (real fish reach their spawning grounds in a day or two —
        // the whole slice is a few dozen metres) and doesn't stop to hold in cover on the way
        if (mig && mig.d > 30) { a.heading += angDiff(Math.atan2(mig.gy - a.y, mig.gx - a.x), a.heading) * a.maxTurn * (IN.spawnGround + 0.6) * clamp(mig.d / 300, 0.2, 1) * dt; if (mig.d > 120) thrust = Math.max(thrust, 0.75); }
        // SPARSE SPAWNERS find each other: in a rare species an in-season, breeding-ready adult homes in on the nearest ready
        // mate over a long range (SPAWN.CUE_R — chemical/sound cues), so a thin population still pairs up
        else if (counts[a.species] < SPAWN.RARE && spawnF[a.species] > SPAWN.AGG_SEASON && breedReady(a) && a.mateCd <= 0) {
          const mt = this.agentGrid.nearest(a.x, a.y, SPAWN.CUE_R, isMateFor, a);
          if (mt && mt.dist > 20) a.heading += angDiff(Math.atan2(mt.item.y - a.y, mt.item.x - a.x), a.heading) * a.maxTurn * 0.8 * dt;
        }
        // NEST GUARDING: a guarding parent holds station over its nest and drives off any piscivore that comes into the
        // guarded zone (it turns on the intruder); its fry stay close while it's on duty. Off duty (time up, or the
        // guardian is gone) the fry disperse on their own.
        if (a.nt > 0) {
          a.nt = Math.max(0, a.nt - dt);
          const intr = this.agentGrid.sub.nearest(a.nx, a.ny, BROOD.GUARD_R, notOwnBrood, a);
          const tx = intr ? intr.item.x : a.nx, ty = intr ? intr.item.y : a.ny, dd = Math.hypot(tx - a.x, ty - a.y);
          if (dd > (intr ? 4 : BROOD.GUARD_R * 0.35)) a.heading += angDiff(Math.atan2(ty - a.y, tx - a.x), a.heading) * a.maxTurn * BROOD.GUARD_TETHER * clamp(dd / 60, 0.3, 1) * dt;
          // on station with no intruder it HOVERS over the nest (fanning the eggs, as guarding males do), not cruising off
          if (!intr && dd < BROOD.GUARD_R) thrust += (IN.cruise * BROOD.HOVER - thrust) * 0.7;
        }
        if (a.ni) {
          const g = guards.get(a.ni);
          if (!g || !(g.nt > 0)) a.ni = 0;
          else { const d = Math.hypot(a.nx - a.x, a.ny - a.y); if (d > BROOD.GUARD_R * 0.6) a.heading += angDiff(Math.atan2(a.ny - a.y, a.nx - a.x), a.heading) * a.maxTurn * BROOD.FRY_TETHER * dt; }
        } else if (a.L < sp.Lmat * 0.5) {
          // NURSERY: unguarded young shelter in vegetation/structure (the littoral nursery), harder when frightened
          const cv = this.nearestCover(a.x, a.y, 220);
          if (cv) { const d = Math.hypot(cv.x - a.x, cv.y - a.y); if (d > 12) a.heading += angDiff(Math.atan2(cv.y - a.y, cv.x - a.x), a.heading) * a.maxTurn * BROOD.NURSERY * (1 + a.fear) * clamp(d / 150, 0.2, 1) * dt; }
        }
        // cover-seeking: littoral/ambush fish migrate to the nearest cover (weed bed / reed / log) and hold
        // there — a pike lurks at a weed-bed edge, a sunfish hovers in the weeds. A gentle long-range
        // attractor that eases off once at cover; the NN can override to chase or roam.
        if (IN.cover && !(mig && mig.d > 120)) {
          const cv = this.nearestCover(a.x, a.y, 280);
          if (cv) { const d = Math.hypot(cv.x - a.x, cv.y - a.y); if (d > 14) a.heading += angDiff(Math.atan2(cv.y - a.y, cv.x - a.x), a.heading) * a.maxTurn * IN.cover * clamp(d / 200, 0.2, 1) * dt; }
        }
        // LITTORAL habitat: a fish of the shelf and the drop-off (largemouth bass) that finds itself out over water deeper
        // than its habitat (IN.littoral × the lake's depth) turns back toward the nearer shore — harder the further out it
        // is. Real summer bass are fish of the littoral weed beds and the drop-off, seldom out over the open basin.
        if (IN.littoral && !(mig && mig.d > 120)) {
          const over = (bedY(a.x) - IN.littoral * H) / (0.25 * H);
          if (over > 0) a.heading += angDiff(shoreDir(a.x) < 0 ? Math.PI : 0, a.heading) * a.maxTurn * (0.3 + clamp(over, 0, 1)) * dt;
        }
      }

      // ---- brain-GATED ACTIONS: the fish DECIDES (beyond steer+thrust) to STRIKE-lunge / FLEE-sprint / HIDE-freeze ----
      // Continuous "intents" (sigmoid outputs), not a hard argmax: evolution searches a smooth landscape, and the three
      // trade off through their EFFECTS — hide suppresses the very thrust strike/flee demand, and strike/flee cost energy
      // — so a brain can't usefully raise all three. The NN learns WHEN to fire each from its prey/threat/energy senses;
      // strike's reach + hide's concealment live in takePrey(). Deterministic (no RNG). Inert at the OFF baseline.
      // ENGAGED intensity: an action only takes effect (and costs energy) once the brain's intent passes ACTION.ENGAGE —
      // a weak background urge no longer means a permanent half-sprint, whose cost (charged continuously) was the
      // biggest single energy drain once metabolism was made realistic
      const aStrike = engaged(a.act.strike), aFlee = engaged(a.act.flee), aHide = engaged(a.act.hide);
      const burst = Math.max(ACTION.STRIKE_BURST * aStrike, ACTION.FLEE_BURST * aFlee);
      thrust = (thrust + (1 - thrust) * burst) * (1 - ACTION.HIDE_STILL * aHide);   // lunge/sprint drive thrust up; a freeze holds still
      const capMul = 1 + ACTION.BURST_SPEED * Math.max(aStrike, aFlee);             // a sprint briefly exceeds cruise speed
      // a committed hide darts the fish to the nearest cover and holds there (anti-predator); only a strong hide steers
      if (aHide > ACTION.GATE) { const cv = this.nearestCover(a.x, a.y, 260); if (cv) { const d = Math.hypot(cv.x - a.x, cv.y - a.y); if (d > 10) a.heading += angDiff(Math.atan2(cv.y - a.y, cv.x - a.x), a.heading) * a.maxTurn * ACTION.HIDE_COVER * aHide * dt; } }
      // (bursts are metabolically expensive: their cost is the swimming-speed term of the respiration below)
      // burst-and-coast: pulse the delivered thrust around the intent (a ZERO-MEAN cosine → the cycle-average ≈ the
      // intent, so it's ~balance-neutral) so a cruising fish SURGES then GLIDES instead of holding steady thrust; the
      // momentum model carries it through each glide. Gated to cruising — suppressed during a flee/strike sprint (flat-out)
      // and when barely swimming. Deterministic (stroke advanced by dt; per-fish phase offset, no RNG).
      if (a.stroke === undefined) a.stroke = (a.id * 0.1366) % 1;
      // THERMAL PERFORMANCE: a cold fish is sluggish — below its optimum, swimming effort (and feeding, below) falls
      // linearly toward ENV.COLD_PERF_MIN at ~2 °C. Cold slows ectotherms; it doesn't stress these temperate natives.
      const tHere = env.tempAt(a.x, a.y), perf = coldPerf(tHere, sp.tempOpt, sp.coldPerf);
      thrust *= perf;
      // the O₂ ESCAPE overrides the cruise norm, the diel rest and the cold: an anaerobic burst up and out of lethal water
      if (escUp !== null) { a.heading += angDiff(escUp, a.heading) * Math.min(1, 6 * dt); thrust = Math.max(thrust, 0.8); }
      a.stroke = (a.stroke + MOTION.COAST_RATE * (0.6 + 0.6 * clamp(a.spd / a.maxSpeed, 0, 1)) * dt) % 1;
      const coastAmp = MOTION.COAST_DEPTH * clamp(1 - Math.max(aFlee, aStrike), 0, 1) * clamp(thrust * 3, 0, 1);
      thrust = clamp(thrust * (1 + coastAmp * Math.cos(a.stroke * 2 * Math.PI)), 0, 1);
      a.spd += (thrust * a.accel - sp.drag * a.spd) * dt; a.spd = clamp(a.spd, 0, a.maxSpeed * capMul);
      // ---- MOMENTUM / carving turns: the fish has inertia, so (1) a hard turn SCRUBS forward speed (you can't bank
      // sharply at full tilt), and (2) the actual TRAVEL direction `velHeading` LAGS the body heading — more so the
      // faster it's going (more momentum) — so it carves/drifts through a turn instead of pivoting on a dime. The body
      // still points along `heading` (what render draws); the path follows `velHeading`. Deterministic (no RNG). (MOTION knobs.)
      if (a.velHeading === undefined) a.velHeading = a.heading;
      const dH = angDiff(a.heading, h0);                                          // total heading change commanded this frame (dt-scaled)
      a.spd *= Math.max(0.55, 1 - MOTION.TURN_DRAG * Math.abs(dH));               // turn-induced speed loss
      const realign = clamp(1 - Math.exp(-MOTION.TURN_RESPONSE * (1 - MOTION.SPEED_LAG * clamp(a.spd / a.maxSpeed, 0, 1)) * dt), 0, 1);
      a.velHeading += angDiff(a.heading, a.velHeading) * realign;                 // travel direction eases toward the body heading (lags when fast)
      // + the current, less what the fish holds against it (MOTION.RHEO: positive rheotaxis)
      const cur = env.currentAt(a.x, a.y) * sp.drift, hold = MOTION.RHEO * a.maxSpeed * perf;
      a.x += Math.cos(a.velHeading) * a.spd * dt + Math.sign(cur) * Math.max(0, Math.abs(cur) - hold) * dt;  // move along the (lagging) travel direction
      // a bottom-hugger's negative buoyancy (sp.sink) settles it toward the bed — but not down into water too low in O₂ for it
      const y0 = a.y;
      a.y += Math.sin(a.velHeading) * a.spd * dt + (sp.sink && env.oxygenAt(a.x, a.y + 12) >= a.o2Crit * ENV.HYPOXIA_AVOID ? sp.sink * dt : 0);
      // lethal water is a wall: a fish doesn't swim DOWN into water whose O₂ is below twice its lethal level (it senses it
      // and turns back — real fish avoid anoxic water sharply); it can always rise out of it
      if (a.y > y0) { const o2L0 = a.o2Lethal * Math.exp(BIOE.O2_LETHAL_T * (tHere - 25)) * 2; if (env.oxygenAt(a.x, a.y) < o2L0 && env.oxygenAt(a.x, y0) > env.oxygenAt(a.x, a.y)) a.y = y0; }
      // …and a fish in water below its critical O₂ CLIMBS out of it — slowly when barely hypoxic, at a burst (an anaerobic
      // sprint) from near-lethal water — whatever its momentum, the bed slope, its diel rest or a brain still steering it
      // along the bottom. In a stratified lake O₂ rises toward the surface. (One behavioural second is ~5 h of exposure for
      // the physiology, so a fish crawling out of a thickening anoxic layer at cruising speed would never make it.)
      if (o2Climb > 0) a.y -= a.maxSpeed * o2Climb * dt;

      // side walls turn the fish around; the surface & curved bed make it GLIDE along the
      // boundary (heading eased toward horizontal) instead of bouncing — so bottom-dwellers
      // foraging on the bed swim smoothly along it rather than flip-flopping their heading.
      const bed = bedY(a.x), mvx = Math.cos(a.velHeading) * a.spd, INTO = 1.5, glide = Math.min(1, 9 * dt);
      if (a.x < 1) { a.x = 1; if (mvx < -INTO) { a.heading = Math.PI - a.heading; a.velHeading = Math.PI - a.velHeading; a.spd *= 0.86; } }
      else if (a.x > W - 1) { a.x = W - 1; if (mvx > INTO) { a.heading = Math.PI - a.heading; a.velHeading = Math.PI - a.velHeading; a.spd *= 0.86; } }
      const horiz = Math.cos(a.heading) >= 0 ? 0 : Math.PI;
      if (a.y < 1) { a.y = 1; if (Math.sin(a.heading) < 0) { a.heading += angDiff(horiz, a.heading) * glide; a.spd *= 0.985; } }
      else if (a.y > bed) { a.y = bed; if (Math.sin(a.heading) > 0) { a.heading += angDiff(horiz, a.heading) * glide; a.spd *= 0.985; } }

      // ===== BIOENERGETICS — the Wisconsin model (bioenergetics.js) with each species' published parameters (species.js
      // `bio`). A fish's physiological day runs on the seasonal calendar: one real day = BIOE.DAY sim-seconds (a year
      // of TIME.YEAR_LEN), so the per-day rates become per-step amounts with dt/DAY. Everything is grams and joules.
      // the lethal O₂ rises ~5.5 %/°C (Moss & Scott 1961; Downing & Merkens 1957) — cold fish survive far lower O₂ under ice
      const o2L = a.o2Lethal * Math.exp(BIOE.O2_LETHAL_T * (tHere - 25));
      const Wg = a.W, dd = dt / BIOE.DAY, gmax = sp.gut * Wg, bp = bioOf(a);   // young-of-year: FB4's juvenile set where one exists (bluegill, perch — fit to age-0 fish, with their warmer optimum); yearlings on the adult set
      const o2 = this.oxygenAt(a.x, a.y);
      // DIGESTION: the stomach empties exponentially at the measured gastric-evacuation rate (He & Wurtsbaugh 1993: 22
      // species, R = 0.049·e^(0.072·T) per hour, × the species' own speed — pike digest a fish meal in ~2 days, sunfish an
      // insect meal in ~1) — but never faster than the published maximum consumption Cmax(W,T): however much food there is,
      // a fish can't process more than Cmax, and the share of Cmax it achieves (the bioenergetics "p") is set by the food it
      // actually finds. A big meal therefore takes days (a pike's 15 % perch ≈ 3 days at 20 °C). Assimilated as it passes.
      let C = 0, pNow = 0;
      const cm = cmax(bp, Wg, tHere);
      if (a.gut > 0) {
        // (never slower than a FULL stomach must empty to pass Cmax — Cmax is measured ad libitum, gut and all; a small
        // fish on small prey turns its stomach over faster than the adult-meal rates behind gerMul)
        const ev = Math.min(a.gut, Math.min(Math.max(BIOE.GER * Math.exp(BIOE.GER_T * tHere) * sp.gerMul, cm / sp.gut) * a.gut, cm * Wg) * dd);
        C = a.gutE * ev / a.gut; a.gut -= ev; a.gutE -= C; pNow = cm > 0 ? ev / (cm * Wg * dd) : 0;
        if (a.gut < 1e-9) { a.gut = 0; a.gutE = 0; }
      }
      a.pAvg = (a.pAvg || 0) + (pNow - (a.pAvg || 0)) * Math.min(1, dd);   // DIAGNOSTIC only (never read by the sim): ~1-day mean p
      // WASTE + COSTS (J): egestion and excretion (FB4 EGEQ/EXEQ at this step's p), specific dynamic action, and
      // respiration = standard × the published routine activity × this fish's swimming effort over the last ~day against
      // its species' routine pace (BIOE.SWIM: a fish that keeps sprinting pays several times cruising; a brief dash is a
      // few minutes of a day — the behavioural second is ~5 h of physiology, so the mean, not the instant, is what the
      // day's metabolism sees; saved `ua`) × any toxic stress
      wasteFractions(bp, tHere, clamp(pNow, 0, 1), WF);
      const F = WF[0] * C, U = WF[1] * (C - F), S = bp.SDA * (C - F);
      // cyanotoxin (HAB): a DENSE cyanobacteria surface scum poisons fish (microcystin) — detoxification and gill/liver
      // damage raise its metabolic costs where the local cyano is above the toxic threshold (mostly surface fish)
      const cyTox = env.cyanoAt(a.x, a.y) - CYANO.TOX_THRESH * CYANO.CAP;
      const stress = cyTox > 0 ? 1 + CYANO.RESP_STRESS * cyTox / CYANO.CAP : 1;
      a.uAvg = a.uAvg === undefined ? sp.uRoutine : a.uAvg + (a.spd / a.maxSpeed - a.uAvg) * Math.min(1, dd);
      // (never below the published routine: FB4's respiration is for a routinely active fish — one hovering in the weeds
      // on screen is resting between bouts, not metabolising below routine)
      const act = routineActivity(bp, Wg, tHere) * Math.exp(BIOE.SWIM * Math.max(0, a.uAvg - sp.uRoutine));
      const guard = a.nt > 0 ? BROOD.GUARD_METAB : 1;   // a nest-guarding male fans and patrols: metabolism up (BROOD.GUARD_METAB)
      // a fish losing condition turns its metabolism down (food-deprived fish cut their standard metabolic rate 10–40 %:
      // Méndez & Wieser 1993, Mehner & Wieser 1994) — so a lean summer stunts a crowded population rather than starving it
      const depress = 1 - BIOE.STARVE_DEPRESS * clamp((BIOE.K_DEPRESS - a.K) / (BIOE.K_DEPRESS - BIOE.K_S50), 0, 1);
      const rO2 = respStd(bp, Wg, tHere) * a.metabMul * act * stress * guard * depress * Wg;   // g O₂ / day
      a.rO2 = rO2 / BIOE.DAY;                                                 // g O₂ / sim-s (the lake's O₂ demand, env)
      // GROWTH: the net energy changes the fish's mass (J ÷ its energy density). A fish in better than standard condition
      // puts the surplus into LENGTH — the structural size never shrinks, a starving fish just gets thinner (as inSTREAM)
      // GONADS: a mature fish puts BIOE.REPRO_ALLOC of its surplus into its gonads until they reach the species' ripe
      // gonadosomatic index (gsiF / gsiM of body mass) — eggs grow over the summer and autumn and are carried through the
      // winter, so pike and perch can spawn right after ice-out on gonads built months before; a starving fish resorbs
      // them (atresia) before it burns its body
      let net = C - F - U - S - rO2 * OXYCAL * dd;
      const ed = energyDensity(bp, Wg), gsi = a.sex === 0 ? sp.gsiF : sp.gsiM;
      if (net > 0) { if (a.mature && a.gon < gsi * Wg) { const toG = Math.min(net * (sp.reproAlloc ?? BIOE.REPRO_ALLOC), (gsi * Wg - a.gon) * ed); a.gon += toG / ed; net -= toG; } }
      else if (a.gon > 0 && a.K < BIOE.K_RESORB) { const fromG = Math.min(a.gon * ed, -net); a.gon -= fromG / ed; net += fromG; }
      a.W = Math.max(1e-6, Wg + net / ed);
      if (a.W > stdWeight(sp.lw, a.L)) { a.L = lengthFor(sp.lw, a.W); sizeScale(a); }
      a.K = a.W / stdWeight(sp.lw, a.L); a.energy = reserveOf(a.K);   // (the same formula settleBody uses → exact resume)
      // contaminant body burden: gill uptake of the dissolved toxicant − SLOW first-order excretion (dietary intake &
      // prey-burden assimilation are added in the feed step below). TOX.AMBIENT = 0 (a clean lake) ⇒ this is 0 → inert.
      a.tox += (TOX.GILL * TOX.AMBIENT - TOX.EXCRETE * a.tox) * dt;
      // MORTALITY HAZARDS (per day → per step), all physiological:
      //  • STARVATION — daily survival falls logistically with condition (inSTREAM: 90 % at K_S90, 10 % at K_S10): a
      //    fish that has lost a third of its mass dies within days; small fish starve first over winter (their reserves
      //    are smaller relative to their metabolism), which is what makes real age-0 overwinter survival size-selective
      //  • HEAT — above its upper incipient lethal temperature (the species' UILT ± its tolerance gene) half die within
      //    BIOE.UILT_DAYS, faster the hotter (×e per BIOE.HEAT_STEEP⁻¹ °C). Sub-lethal heat already costs it through the
      //    bioenergetics: appetite collapses toward CTM while respiration keeps rising — the summer squeeze
      //  • HYPOXIA — below its acute lethal O₂ (published, temperature-dependent, gene-modified), the same form
      //    (BIOE.HYPOXIA_DAYS / _STEEP). Between that and o2Crit it only loses its appetite (the feeding step)
      //  • CONTAMINANT — above the harm threshold (apex predators, which biomagnify, are hit hardest)
      const hS = a.K < BIOE.K_HAZARD ? -Math.log(Math.max(1e-9, 1 / (1 + Math.exp(-(BIOE.STARVE_A + BIOE.STARVE_B * a.K))))) / BIOE.DAY : 0;
      // EXPOSURE, not instants: heat and hypoxia act through the temperature and O₂ a fish has EXPERIENCED over the last
      // few hours (BIOE.EXPOSE_TAU — a fish rides out a brief dip into anoxic or hot water on its anaerobic reserve and
      // thermal inertia). One behavioural second here is ~5 hours of physiology, so judging lethality on the instant would
      // kill a fish for brushing past the anoxic bottom cell (saved: `xo`, `xt`)
      const kx = Math.min(1, dt / BIOE.EXPOSE_TAU);
      if (a.xo === undefined) { a.xo = o2; a.xt = tHere; }
      a.xo += (o2 - a.xo) * kx; a.xt += (tHere - a.xt) * kx;
      const o2Lx = a.o2Lethal * Math.exp(BIOE.O2_LETHAL_T * (a.xt - 25));
      const hH = a.xt > a.uilt - 2 ? Math.LN2 / (BIOE.UILT_DAYS * BIOE.DAY) * Math.exp((a.xt - a.uilt) / BIOE.HEAT_STEEP) : 0;
      const hO = a.xo < o2Lx ? Math.LN2 / (BIOE.HYPOXIA_DAYS * BIOE.DAY) * Math.exp(BIOE.HYPOXIA_STEEP * (o2Lx - a.xo) / o2Lx) : 0;
      const hX = a.tox > TOX.HARM ? TOX.MORT * (a.tox - TOX.HARM) : 0;
      //  • OTHER — the share BIOE.M_OTHER of the species' published natural mortality M that the lake doesn't simulate
      //    (disease, parasites, herons, ospreys, otters, angling), higher for smaller fish (Lorenzen 1996: M ∝ W^−0.29)
      const hM = sp.M * BIOE.M_OTHER * clamp(Math.pow(a.L / sp.Lref, -0.87), 0.5, 3) / TIME.YEAR_LEN;
      const hz = hS + hH + hO + hX + hM;

      // FEEDING into the gut. A fish takes food while its gut has room — and it loses its appetite in hypoxic water (feeding
      // falls off below its critical O₂ and stops at the lethal level: growth −20…−65 % at 2–5 mg/L, EPA 1986). Everything it swallows is a real mass of prey with that
      // prey's energy density (J/g): fish flesh is rich, zooplankton and insects middling, plants, algae and detritus poor
      // and only partly digestible (config PREY). Satiation is physical: a full gut, not an energy cap.
      // (a nest-guarding male barely eats — BROOD.GUARD_FEED)
      const eaten0 = a.eaten, gEff = gmax * clamp((o2 - o2L) / Math.max(1e-3, a.o2Crit - o2L), 0, 1) * (a.nt > 0 ? BROOD.GUARD_FEED : 1);   // the room it will fill (appetite)
      // PISCIVORY: a piscivore past its diet-shift length (sp.Lpisc) strikes only at a fish whose whole body fits in its
      // gut — after a big meal it is out of action until it has digested room (a pike eats a fish every few days), and a
      // bass that snaps up a fry is ready again soon but gained little. The prey's energy is its own species' ED.
      if (sp.diet.fish && a.L >= sp.Lpisc && a.gut < gEff) {
        const prey = this.takePrey(a, gEff - a.gut, dt, perf);   // (transfers the prey's contaminant burden → biomagnification)
        if (prey) { this._meal(a, prey.W + prey.gon, energyDensity(prey.sp.bio, prey.W), 1); this.stats.fishEaten++; }
      }
      // amphibian / reptile prey: a hungry fish predator takes a frog, tadpole or turtle hatchling that fits its gape and
      // its gut (larva-eaters take small tadpoles)
      if ((sp.diet.fish || sp.diet.larva) && a.gut < gEff) {
        const hm = this.herpGrid.nearest(a.x, a.y, a.eatRadius, canEatHerp, a);
        if (hm && herpMass(hm.item) <= gEff - a.gut) {
          const h = hm.item; h.dead = true; h.eatenBy = a.species;
          this._meal(a, herpMass(h), h.k === 2 ? PREY.TURTLE_ED : h.k === 1 ? PREY.FROG_ED : PREY.TAD_ED, 1); this.stats.herpEaten = (this.stats.herpEaten || 0) + 1;
        }
      }
      // HANDLING TIME (FEED.HANDLE): one discrete item per food type per HANDLE s — `slots` items this step (1 at the
      // browser's 1/60 step, 2 at the headless 1/30), so intake per SECOND doesn't depend on dt. Continuous grazing (the
      // phyto fallback, plant bites) is a per-second rate × dt and counts `slots` meals. A cold fish forages more slowly
      // (coldPerf), so the remainder can be fractional — it is saved (`fa`). Deterministic (no RNG).
      a.feedAcc = (a.feedAcc || 0) + dt / FEED.HANDLE * perf;   // a cold fish forages more slowly
      const slots = Math.floor(a.feedAcc + 1e-9); a.feedAcc = Math.max(0, a.feedAcc - slots);
      let k;
      // Every bite is limited to the room left in the gut (gEff − gut): a small fish crops part of a patch, a big one
      // clears it; whole animals (snails, crayfish, nymphs) only if they fit.
      const R = a.eatRadius;
      // YOUNG-OF-YEAR: fry schools (FRY) are food for anything whose mouth they fit — larval fish for the planktivores and
      // invertivores, fingerlings for the piscivores (see _eatFry)
      if (this.fry.length && a.gut < gEff) this._eatFry(a, gEff, slots, dt, perf);
      // The rest in order of PROFITABILITY (digestible J per g — optimal foraging: a fish takes the best food in reach
      // first): zooplankton and the benthic/surface invertebrates; the POOR foods — detritus (~340 J/g digestible),
      // algae (~730), plants (~540) — only as a hungry fish's filler: when it found nothing better this step, and only up
      // to FEED.POOR_GUT of its gut (a gut kept full of weed between the good meals would starve it at full ration).
      // FRY EAT ZOOPLANKTON: nearly every fish starts life as a zooplankton eater, whatever it eats as an adult (pike and
      // bass fry, carp and catfish fry alike), shifting to its adult diet past a species-specific length (sp.Lzoo)
      const apt = gEff / gmax;   // the appetite (O₂ and brood guarding cut it) scales the feeding RATES too, not only the gut room
      if (a.gut < gEff && (sp.diet.plankton || a.L < sp.Lzoo)) this._eatZoo(a, gEff - a.gut, cm * apt, dt);
      // (a piscivore past ~3× its piscivory length no longer bothers with insects — a 35-cm bass or a pike lives on fish and
      // crayfish; perch and trout, whose piscivory starts late, keep eating them — `bugs`)
      const bugs = !sp.diet.fish || a.L < 3 * sp.Lpisc;
      if (bugs && a.gut < gEff && sp.diet.insect) this._graze(a, this.insectGrid, slots, gEff - a.gut, PREY.INSECT_ED, 1);   // surface fish rise to emerged insects
      if (bugs && gEff - a.gut >= PREY.NYMPH_G && (sp.diet.larva || sp.diet.insect) && this.nymphs.length && rand() < ODONATA.CRYPTIC && (k = this._takeNearest(this.nymphGrid, a.x, a.y, R, 1))) this._ate(a, k, PREY.NYMPH_G, PREY.NYMPH_ED, 1);   // dragonfly nymphs (cryptic): a big insect meal
      // a crayfish is a big meal (bass above all; bullheads, big perch, now and then a pike) — but a defended one, sheltered
      // by day: a fish forages for them across its hunting arena (FEED.HUNT_R × its reach, as for fish prey: one behavioural
      // second is hours of searching the bottom) and a strike lands with its species' skill (diet.cray: bass 0.25 … pike
      // 0.05) × closeness, less in cover and by day (CRAYFISH.SHELTER_DAY) — one try per handling slot
      // (only a fish whose gape takes a crayfish's width — CRAYFISH.WIDTH; and in cold water they lie dormant in their burrows)
      if (sp.diet.cray && gEff - a.gut >= PREY.CRAY_G && this.cray.length && gapeOf(a) >= CRAYFISH.WIDTH) {
        const Rc = R * FEED.HUNT_R, crAct = clamp((tHere - CRAYFISH.ACT_T[0]) / (CRAYFISH.ACT_T[1] - CRAYFISH.ACT_T[0]), 0, 1);
        if (crAct > 0 && (k = this.crayGrid.nearest(a.x, a.y, Rc, exposedCray)) && rand() < 1 - Math.pow(1 - sp.diet.cray * crAct * (1 - k.dist / Rc)
          * (1 - this.coverAt(k.item.x, k.item.y) * COVER.REFUGE) * (1 - CRAYFISH.SHELTER_DAY * env.light), Math.max(1, slots))) { k.item.dead = true; this._ate(a, 1, PREY.CRAY_G, PREY.CRAY_ED, PREY.CRAY_DIG); }
      }
      if (bugs && a.gut < gEff && sp.diet.larva) this._graze(a, this.larvaeGrid, slots, gEff - a.gut, PREY.LARVA_ED, 1, INSECT.REFUGE_M, larvaFree);   // benthic insect larvae (those outside their refuge)
      // the bed's worms and scuds (BENTHOS): a bottom forager in the weedy water near the bed (BENTHOS.REACH — scuds live on the
      // weeds as much as in the mud) takes them at a rate set by their reachable density
      if (bugs && a.gut < gEff && (sp.diet.larva || sp.diet.snail || sp.diet.detritus) && a.y > bedY(a.x) - BENTHOS.REACH) {
        const g = env.takeBenth(a.x, Math.min(gEff - a.gut, BENTHOS.Q * cm * apt * a.W * dt / BIOE.DAY));
        if (g > 0) { a.gut += g; a.gutE += g * PREY.BENTH_ED; if (g >= PLANKTON.BITE_MIN * gmax) { a.eaten++; this.stats.foodEaten++; } }
      }
      let nS;
      if (sp.diet.snail && a.L >= (sp.Lsnail || 0) && (nS = Math.min(slots, Math.floor((gEff - a.gut) / PREY.SNAIL_G))) > 0 && (k = this._takeNearest(this.snailGrid, a.x, a.y, R, nS, exposedSnail))) this._ate(a, k, PREY.SNAIL_G, PREY.SNAIL_ED, PREY.SNAIL_DIG);   // molluscivores (sunfish/carp) crush snails, shell and all
      const pRoom = Math.min(gEff, FEED.POOR_GUT * gmax);   // the gut level poor food fills up to
      a.foodT = a.eaten > eaten0 ? 0 : (a.foodT ?? 9) + dt;   // time since its last GOOD meal (patch residence, below; saved `ft`)
      // bottom feeders take the detritus particles in reach, else, at the bed, sift its organic layer (SEDOM — a poor food:
      // ~340 digestible J/g; at most SEDOM.SIFT × the gut's capacity a second)
      if (a.eaten === eaten0 && a.gut < pRoom && sp.diet.detritus && !this._graze(a, this.detritusGrid, slots, pRoom - a.gut, PREY.DETRITUS_ED, PREY.DETRITUS_DIG) && a.y > bedY(a.x) - R - 4) {
        const g = env.takeSedOM(a.x, Math.min(pRoom - a.gut, SEDOM.SIFT * gmax * dt));
        if (g > 0) this._meal(a, g, PREY.DETRITUS_ED, PREY.DETRITUS_DIG, slots);
      }
      // planktivore facultative omnivory: a hungry planktivore that found NOTHING else this step grazes the phytoplankton
      // field directly (fathead minnows and sunfish do eat algae and detritus) — algae are a poor, part-indigestible food
      // (PREY.ALGAE_*), a last resort that carries the forage fish through the zooplankton troughs. A per-SECOND rate × dt.
      if (sp.diet.plankton && a.eaten === eaten0 && a.gut < pRoom) {
        const g = env.grazePhyto(a.x, a.y, Math.min(PLANKTON.FALLBACK_GRAZE * dt, (pRoom - a.gut) / PREY.ALGAE_G));
        if (g > PLANKTON.FALLBACK_MIN * dt) this._meal(a, g * PREY.ALGAE_G, PREY.ALGAE_ED, PREY.ALGAE_DIG, slots);
      }
      if (a.eaten === eaten0 && a.gut < pRoom && sp.diet.plants) { const g = this.bitePlant(a, dt, pRoom - a.gut); if (g > 0) this._meal(a, g, PREY.PLANT_ED, PREY.PLANT_DIG, slots); }   // per-second grazing (PLANT.BITE_RATE × dt), g wet plant
      a.hunger = 1 - clamp(a.gut / gmax, 0, 1);   // HUNGER = the gut's emptiness (the brain's drive input)
      // LIFETIME LEARNING: a reward-modulated Hebbian nudge to the PLASTIC policy (a.lw) — reinforce the action just taken
      // when the fish ATE; a homeostatic decay (runs every step) pulls it back toward the inherited genotype a.g. Baldwinian
      // (a.g untouched → offspring inherit the evolved brain, not the learned weights). Deterministic (no RNG).
      reinforce(a.lw, a.g, sp.shape, a.act, a.eaten > eaten0 ? 1 : 0, dt, LEARN.RATE, LEARN.DECAY, LEARN.CLAMP);

      // sexual reproduction (crossover + mutation). A ripe fish in its spawning season spawns whatever the crowd: density
      // acts on the YOUNG (food for the larvae, predation on them, starvation, cannibalism — then the species' agent budget
      // at recruitment, _stepFry), as it does in real lakes, not on the adults' readiness to spawn.
      if (breedReady(a) && a.mateCd <= 0 && !a._mated &&
          rand() < spawnF[a.species] * toxFecundity(a.tox)) {   // contaminated fish breed less (sub-lethal); inert at tox=0
        const m = this.chooseMate(a, 1 + SPAWN.MATE_REACH * spawnF[a.species]);   // in season, spawners gather → mates are found further off
        if (m) {
          // sexual: a FEMALE and a MALE (partner chosen by condition/traits); crossover of both genomes + mutation.
          // FECUNDITY scales with the female's MASS (species.js `fec`: eggs = a·W^b, published relations) — a big old
          // female lays many times a first spawner's eggs — times how ripe her ovaries are, and the species' early
          // survival `s0` (egg → free-swimming juvenile, published orders of magnitude: high for nest-guarded or big-egged
          // young, tiny for scattered eggs) turns the eggs into the young that join the lake (stochastic rounding, seeded
          // RNG). Both parents shed their gonads (built from food over the months before — see the growth step), so a
          // spent fish must feed back up before it can spawn again; poor condition means no spawning (breedReady).
          const b = m.item, fem = a.sex === 0 ? a : b, mal = a.sex === 0 ? b : a;
          a.mateCd = sp.matingCooldown; b.mateCd = sp.matingCooldown; a._mated = true; b._mated = true;
          const dh = ((b.hue - a.hue + 540) % 360) - 180;
          // the eggs that survive to swim-up (sHatch: published egg survival — high in guarded nests, a few % for pike and
          // carp) become SCHOOLS of larvae (FRY): real young fish that feed, grow and are eaten through the summer before
          // the survivors recruit (_stepFry)
          const eggs = sp.fec.a * Math.pow(fem.L, sp.fec.b) * clamp(fem.gon / (sp.gsiF * fem.W), 0, 1);
          const larvae = eggs * sp.sHatch * toxFecundity(fem.tox);
          fem.gon = 0; mal.gon = 0;
          // a nest-guarding species spawns ON THE BOTTOM where the pair meets (a fanned-out nest); the MALE guards it (as
          // male bass, sunfish, bullheads and fathead minnows do)
          // the eggs go in the LITTORAL, wherever the pair met: nests on the shallow shelf's bed (bass, sunfish and bullheads
          // fan nests in 0.3–2 m of water), egg strands and scattered eggs over the shallows (perch, pike, carp, fatheads) —
          // never on the deep, oxygen-poor bed
          const px = (a.x + b.x) / 2, mx = nestX(px, sp);   // (the nest: shoreward from the pair to water no deeper than its nest depth)
          const nest = sp.nestGuard ? { x: mx, y: Math.max(8, bedY(mx) - 8) } : null;
          // schools: up to MAX_PER_SPAWN, while the lake (CAP) and the species (SP_SHARE of it) have free slots — else the
          // larvae join the species' youngest school if it is under MERGE_DAYS old (its genome kept or replaced in
          // proportion to the fish each side brings: one seeded draw), or are lost
          const cap = scaleCount(FRY.CAP);
          const nSch = larvae >= 1 ? Math.min(FRY.MAX_PER_SPAWN, Math.ceil(larvae / FRY.PATCH_N), Math.max(0, cap - this.fry.length), Math.max(0, Math.ceil(cap * FRY.SP_SHARE) - fryN[a.species])) : 0;
          if (larvae >= 1 && nSch === 0) {
            let yg = null; for (const q of this.fry) if (!q.dead && q.k === a.species && q.age < FRY.MERGE_DAYS * BIOE.DAY && (!yg || q.age < yg.age)) yg = q;
            if (yg) {
              const tot = yg.n + larvae;
              yg.W = (yg.n * yg.W + larvae * stdWeight(sp.lw, sp.Lhatch)) / tot; yg.L = Math.min(yg.L, lengthFor(sp.lw, yg.W));
              if (rand() < larvae / tot) { yg.w = mutate(crossover(a.g, b.g)); yg.gn = mutateGenes(crossoverGenes(a.genes, b.genes)); yg.gen = Math.max(a.gen, b.gen) + 1; }
              yg.n = tot; this.stats.spawned = (this.stats.spawned || 0) + 1;
            }
          }
          for (let ci = 0; ci < nSch; ci++) {
            const hue = (a.hue + dh * 0.5 + gauss() * 5 + 360) % 360, bp = nest ? broodPos(nest.x, nest.y) : broodPos(mx, Math.min((a.y + b.y) / 2, bedY(mx) * 0.7));
            const f = this._mkFry(a.species, bp.x, bp.y, larvae / nSch, Math.max(a.gen, b.gen) + 1, hue, mutate(crossover(a.g, b.g)), mutateGenes(crossoverGenes(a.genes, b.genes)));
            if (nest) { f.ni = mal.id; f.nx = nest.x; f.ny = nest.y; }
            this.fry.push(f); fryN[a.species]++; this.stats.spawned = (this.stats.spawned || 0) + 1;
            if (f.gen > this.maxGen) this.maxGen = f.gen;   // a new generation exists from the moment it hatches
          }
          if (nest && nSch > 0) { mal.nt = sp.nestGuard; mal.nx = nest.x; mal.ny = nest.y; guards.set(mal.id, mal); }   // (on duty from now: its fry look it up this step)
          if (larvae >= 1) { const sb = this.stats.spawns || (this.stats.spawns = {}); sb[a.species] = (sb[a.species] || 0) + 1; }   // spawnings per species
        }
        // (no mate in reach → no spawning. Fish reproduce only sexually; the old asexual "budding" fallback — which made
        // nearly every young bass, pike, carp, catfish and sunfish a clone-bud of an immigrant adult — is gone. Sparse
        // populations find mates the way real ones do: by gathering on spawning grounds in season — see chooseMate.)
      }

      // death -> linger as a fading, sinking body (then recycle as detritus). Eaten fish are removed by takePrey() instead,
      // so this is natural death: a hazard (starvation, heat, hypoxia, contaminant — drawn only when one is non-zero, so
      // a healthy fish uses no RNG) or old age. The cause is tallied (stats.died) for the dashboards and validation.
      const old = a.age > sp.maxAge, hit = hz > 0 && rand() < 1 - Math.exp(-hz * dt);
      if (!(a.W > 0) || old || hit) {
        a.dead = true; counts[a.species]--;
        const cause = old ? 'old' : !(a.W > 0) || hS >= Math.max(hH, hO, hX, hM) ? 'starve' : hH >= Math.max(hO, hX, hM) ? 'heat' : hO >= Math.max(hX, hM) ? 'hypoxia' : hX >= hM ? 'toxin' : 'other';
        const died = this.stats.died || (this.stats.died = {}); died[cause] = (died[cause] || 0) + 1; a.cause = cause;
        if (a.id === this.selectedId) this.selectedId = null;
        this.corpses.push({ sp, species: a.species, x: a.x, y: a.y, heading: a.heading, rHeading: a.rHeading ?? a.heading,
          size: a.size, grow: a.grow, L: a.L, hue: a.hue, genes: a.genes, facing: a.facing ?? 1, spd: a.spd, t: DEATH_FADE, t0: DEATH_FADE, roll: 0, sink: 5 + a.size * 2, dead: false });
      }
    }

    this._stepBirds(dt, counts);
    this._stepWildlife(dt, counts);
    this._stepFry(dt, counts, newborns);

    // bodies sink, roll belly-up, fade — then drop their detritus and vanish
    for (const c of this.corpses) {
      c.t -= dt; c.spd *= Math.max(0, 1 - dt * 1.2); c.roll = Math.min(1, c.roll + dt * 1.3);
      c.x += Math.cos(c.heading) * c.spd * dt; c.y = Math.min(bedY(c.x), c.y + c.sink * dt);
      if (c.t <= 0) { c.dead = true; const n = 1 + (c.size * DETRITUS.FROM_DEATH * 2 | 0); for (let k = 0; k < n; k++) this.spawnDetritus(c.x + rand(-3, 3), c.y + rand(-3, 3)); }
    }

    // metapopulation rescue (replaces the hard pop floor): populations now self-determine via logistic
    // reproduction; immigration only RESCUES genuine rarity. A minimal REFUGE backstop guarantees no literal
    // extinction, and a stochastic trickle (rate rising as count → 0, OFF above RESCUE_N) recolonizes the deep
    // boom-bust troughs and supports apex predators that can't self-sustain in a small lake. Immigrants arrive
    // from a lake margin seeded from the current best (preserving learned behavior), swimming inward — not popping in.
    // Gate immigration on a LIVE agent count (sum of the per-species live counts + this-step newborns), NOT
    // this.agents.length — the array isn't compacted until below, so its length still includes agents that died
    // THIS step; using it would falsely block the REFUGE backstop near the cap and let a species end extinct.
    let liveTotal = 0; for (const k of SPECIES) liveTotal += counts[k];
    for (const key of SPECIES) {
      const sp = SP[key];
      const immigrate = () => {
        // an immigrant from connected waters carries a genome from the REGIONAL pool (gene flow), NOT a mutated copy of the
        // lake's current best fish — which made immigration a form of artificial elite breeding (FROM_BEST is retired)
        const pool = this.genePool[key], src = pool[(rand() * pool.length) | 0];
        // colonists come through the connected waters — mostly up the INFLOW stream (left shore), some via the outlet — so
        // successive arrivals of a rare species tend to meet near the inflow and can breed
        const fromLeft = rand() < 0.8, ex = fromLeft ? rand(2, 28) : rand(W - 28, W - 2);
        const f = makeAgent(key, ex, zoneY(sp, ex), rand(BIOE.K_START[0], BIOE.K_START[1]),
          src.gen, (src.hue + gauss() * 8 + 360) % 360, mutate(src.w), rand(sp.matureAge, sp.matureAge * 1.8), mutateGenes(src.gn));
        f.heading = fromLeft ? rand(-0.6, 0.6) : Math.PI + rand(-0.6, 0.6); f.mateCd = 0;   // arrives ready to spawn in season
        // the colonists of a RARE species pair up: an arrival is of the sex its kind's few adults here lack (a refuge of
        // one sex could never breed — the recolonists that count are the ones that find a mate)
        if (counts[key] < rescueN) {
          let nF = 0, nM = 0;
          for (const q of this.agents) if (!q.dead && q.species === key && q.mature) { if (q.sex === 0) nF++; else nM++; }
          for (const q of newborns) if (q.species === key && q.mature) { if (q.sex === 0) nF++; else nM++; }
          if (nF !== nM) { f.sex = nF < nM ? 0 : 1; f.Lmat = lmatOf(sp, f.genes[0], f.sex); f.mature = matureAt(sp, f.L, f.Lmat, f.age); }
        }
        if (f.mature) f.gon = (f.sex === 0 ? sp.gsiF : sp.gsiM) * f.W;
        f.immigrant = true; counts[key]++; liveTotal++; newborns.push(f); this.stats.immigrants[key]++;
        if (f.gen > this.maxGen) this.maxGen = f.gen;
      };
      // GENE FLOW OUT: now and then a lake adult leaves (down the outflow, or the lake is one of several connected
      // waters) and its genes join the regional population — so the pool slowly tracks the lake, with a lag, unselected
      if (counts[key] > 0 && rand() < IMMIGRATION.EMIGRATE * dt) {
        let n = 0; for (const q of this.agents) if (!q.dead && q.species === key && q.mature) n++;
        if (n > 0) {
          let k = (rand() * n) | 0, pick = null;
          for (const q of this.agents) if (!q.dead && q.species === key && q.mature && k-- === 0) { pick = q; break; }
          this.genePool[key][(rand() * this.genePool[key].length) | 0] = { w: Float32Array.from(pick.g), gn: Float32Array.from(pick.genes), hue: pick.hue, gen: pick.gen };
        }
      }
      // quasi-extinction refuge: a tiny last-resort backstop so a species never literally vanishes (≪ the old floor)
      // (per species: an apex predator's refuge and rescue threshold are lower — a slice of lake this size feeds one or two
      // pike, and a backstop of more would eat out the forage base — species.js pop.refuge / pop.rescue)
      const refuge = Math.min(IMMIGRATION.REFUGE, sp.pop.refuge ?? Infinity), rescueN = Math.min(IMMIGRATION.RESCUE_N, sp.pop.rescue ?? Infinity);
      // VISITORS (sp.pop.visit — wide-ranging fish: pike, trout): the slice is a small part of their home range, so each one
      // leaves after a stay of ~visit.stay days (gone to the rest of the lake: removed, not a death) and, when none is here,
      // another comes in after a gap of ~visit.gap days (from the regional gene pool) — present stay/(stay + gap) of the time
      if (sp.pop.visit) {
        const v = sp.pop.visit, leave = dt / (v.stay * BIOE.DAY);
        for (const q of this.agents) if (!q.dead && q.species === key && rand() < leave) { q.dead = true; q.left = true; counts[key]--; if (q.id === this.selectedId) this.selectedId = null; }
        this._counts[key] = counts[key];
        if (counts[key] <= 0 && liveTotal < WORLD.GLOBAL_MAX && rand() < dt / (v.gap * BIOE.DAY)) immigrate();
        continue;
      }
      while (counts[key] < refuge && liveTotal < WORLD.GLOBAL_MAX) immigrate();
      // rarity rescue: a stochastic trickle, engaging only when genuinely rare, tapering to 0 at RESCUE_N
      const deficit = 1 - counts[key] / rescueN;
      if (deficit > 0 && liveTotal < WORLD.GLOBAL_MAX && rand() < IMMIGRATION.RATE * deficit * dt) immigrate();
    }

    // eaten detritus: its organic N+P is not destroyed — the consumer excretes it (ammonium + phosphate) where it fed
    for (const d of this.detritus) if (d.dead && d.n > 0) { env.addNutrient(d.x, d.y, d.n); d.n = 0; }

    // compact arrays
    this.agents = this.agents.filter(a => !a.dead).concat(newborns);
    if (this.fry.some(f => f.dead)) this.fry = this.fry.filter(f => !f.dead);
    this.detritus = this.detritus.filter(d => !d.dead);
    this.larvae = this.larvae.filter(l => !l.dead);
    this.insects = this.insects.filter(i => !i.dead);
    this.snails = this.snails.filter(s => !s.dead);
    this.cray = this.cray.filter(c => !c.dead);
    this.plants = this.plants.filter(p => !p.dead);
    this.corpses = this.corpses.filter(c => !c.dead);
    if (this.nymphs.some(n => n.dead)) this.nymphs = this.nymphs.filter(n => !n.dead);
    if (this.dflies.some(d => d.dead)) this.dflies = this.dflies.filter(d => !d.dead);
    if (this.herps.some(h => h.dead)) this.herps = this.herps.filter(h => !h.dead);

    // time-series sample
    this._seriesAcc += dt;
    if (this._seriesAcc >= 1) {
      this._seriesAcc -= 1;
      const c = this.census();
      this.series.push({ ...c, o2: this.avgO2(), temp: env.tempNorm, light: env.light, phyto: env.meanPhyto(), cyano: env.meanCyano(), dom: env.meanDOM(), zoo: env.meanZooUgl() });
      if (this.series.length > 200) this.series.shift();
    }
    // evolution history: a sample each time the clock enters a new EVO.SAMPLE slot (absolute time, so a resumed run
    // samples exactly where the uninterrupted one does)
    const es = Math.floor(this.time / EVO.SAMPLE);
    if (es !== this._evoSlot) { this._evoSlot = es; this._evoRecord(); }
  }

  // one EVOLUTION-HISTORY sample (EVO): per species [n, mean generation, the 7 trait genes' means, their SDs] over the
  // recruited fish (young-of-year schools are next year's sample); thinned to keep the whole run within EVO.MAX
  _evoRecord() {
    const nG = GENE_KEYS.length, s = {}, r4 = v => Math.round(v * 1e4) / 1e4;
    for (const k of SPECIES) {
      let n = 0, gen = 0; const m = new Float64Array(nG), q = new Float64Array(nG);
      for (const a of this.agents) { if (a.dead || a.species !== k) continue; n++; gen += a.gen; for (let i = 0; i < nG; i++) { const g = a.genes[i]; m[i] += g; q[i] += g * g; } }
      const row = [n, n ? gen / n : 0];
      for (let i = 0; i < nG; i++) row.push(n ? m[i] / n : 0);
      for (let i = 0; i < nG; i++) row.push(n > 1 ? Math.sqrt(Math.max(0, q[i] / n - (m[i] / n) ** 2)) : 0);
      s[k] = row.map(r4);
    }
    this.evo.push({ t: Math.round(this.time * 10) / 10, s });
    if (this.evo.length > EVO.MAX) { const half = this.evo.length >> 1; this.evo = this.evo.filter((e, i) => i >= half || i % 2 === 0); }
  }

  _bestOf(key) { let best = null, bv = -1; for (const a of this.agents) { if (a.dead || a.species !== key) continue; const v = a.eaten / Math.max(a.age, 1); if (v > bv) { bv = v; best = a; } } return best; }
  topPerformer() { let best = null, bv = -1; for (const a of this.agents) { const v = a.eaten / Math.max(a.age, 1); if (v > bv) { bv = v; best = a; } } return best; }
  census() { const c = {}; for (const k of SPECIES) c[k] = 0; for (const a of this.agents) c[a.species]++; return c; }
  avgO2() { return this.env.meanO2(); }   // mean over WET cells only (below-bed rock cells excluded)
  avgNutrient() { return this.env.meanDin() + this.env.meanPhos(); }   // total dissolved nutrient (N + P)

  // ---- detailed statistics (pure; consumed by the UI dashboards, headless-testable) ----
  // depth-resolved water chemistry & physics down a representative central column
  envDetail() {
    const e = this.env, cx = W * 0.5, midY = H * 0.40, deepY = bedY(cx) - 14;
    return {
      tempSurf: e.tempAt(cx, 16), tempMid: e.tempAt(cx, midY), tempDeep: e.tempAt(cx, deepY),
      o2Surf: e.oxygenAt(cx, 16), o2Mid: e.oxygenAt(cx, midY), o2Deep: e.oxygenAt(cx, deepY),
      strat: e.strat, nutrient: this.avgNutrient(), nitrogen: e.meanDin(), phosphate: e.meanPhos(), sedP: e.meanSedP(),
      ammonium: e.meanNh4(), nitrate: e.meanNo3(), nitrateFrac: e.nitrateFrac(),   // N-cycle split (nitrification product)
      cyano: e.meanCyano(),   // cyanobacteria surface-scum density (the N-fixing strain)
      dom: e.meanDOM(),       // dissolved organic matter awaiting bacterial decomposition (the microbial loop)
      bedOM: e.totalSedOM() / 1000,   // kg of organic detritus on the bed (SEDOM: the larvae's and bottom feeders' food)
      benth: e.totalBenth() / 1000,   // kg of the bed's worms and scuds (BENTHOS)
      // which nutrient is limiting growth in the lit littoral (the bloom controller)?
      limiting: e.meanDin() / (e.meanDin() + NUTRIENT.KN) < e.meanPhos() / (e.meanPhos() + NUTRIENT.KP) ? 'N' : 'P',
      phyto: e.meanPhyto(), secchi: e.secchiDepth(), clarity: e.clarity(), turbidity: e.turbidity, avgO2: this.avgO2(),
      diatom: e.meanDiatom(), ice: e.ice, birds: this.birds.length,   // cold-water algae, lake ice cover, loons on the lake
      // zooplankton by kind; dragonflies (nymphs / adults on the wing); frogs + tadpoles; turtles
      daphnia: e.zooTotal(0) / 1000, copepods: e.zooTotal(1) / 1000, zooUgl: e.meanZooUgl(),   // kg wet of each kind; the lake mean, µg dry/L
      zooEggs: (e.zooEggTotal(0) + e.zooEggTotal(1)) / 1000,   // kg in the sediment's resting-egg bank
      rotifers: e.zooTotal(2) / 1000,                           // kg of rotifers and nauplii
      nymphs: this.nymphs.length, dragonflies: this.dflies.length,
      frogs: this.herps.reduce((c, h) => c + (h.k === 1 ? 1 : 0), 0), tadpoles: this.herps.reduce((c, h) => c + (h.k === 0 ? 1 : 0), 0),
      turtles: this.herps.reduce((c, h) => c + (h.k === 2 ? 1 : 0), 0),
    };
  }
  // depth-resolved water-column profile down the column at x (pure; consumed by the UI "Water column" view).
  // Samples surface→bed; each point carries the physical/chemical state at that depth so the panel can plot the
  // thermocline, the hypoxic deep, the nutricline, and where phyto vs the buoyant cyano scum sit.
  depthProfile(x, n = 28) {
    const e = this.env, bed = bedY(x), top = 6, samples = [];
    for (let i = 0; i < n; i++) {
      const frac = i / (n - 1), y = top + (bed - top) * frac;
      samples.push({ frac, y, tempC: e.tempAt(x, y), o2: e.oxygenAt(x, y), din: e.dinAt(x, y), phos: e.phosAt(x, y), phyto: e.phytoAt(x, y), cyano: e.cyanoAt(x, y), dom: e.domAt(x, y), light: e.lightAtDepth(y) });
    }
    return { x, bed, samples };
  }
  // per-species rollup: population, evolution (generation), mean trait genes, condition, and zonation
  speciesDetail() {
    const out = {};
    for (const k of SPECIES) {
      const ag = this.agents.filter(a => a.species === k), n = ag.length, d = n || 1;
      const mean = f => ag.reduce((s, a) => s + f(a), 0) / d;
      const b = this.stats.births[k] || 0, im = this.stats.immigrants[k] || 0;   // cumulative since reset
      out[k] = {
        count: n, maxGen: ag.reduce((m, a) => Math.max(m, a.gen), 0), meanGen: mean(a => a.gen),
        // full 6-gene trait genome (size/speed/tol physiology + fin/eye/body morphology) — watch the body evolve
        gSize: mean(a => a.genes[0]), gSpeed: mean(a => a.genes[1]), gTol: mean(a => a.genes[2]),
        gFin: mean(a => a.genes[3]), gEye: mean(a => a.genes[4]), gBody: mean(a => a.genes[5]), gBrain: mean(a => a.genes[6]),
        meanActiveHid: mean(a => a.activeHid),   // realized mean active hidden-unit count (the evolved brain size)
        meanEnergy: mean(a => a.energy), meanAge: mean(a => a.age),
        // the body: mean length (cm), mass (g), condition K; adults' mean length; share mature
        meanL: mean(a => a.L), meanW: mean(a => a.W), meanK: mean(a => a.K), mature: ag.filter(a => a.mature).length,
        // metapopulation dependence: fraction of all recruits since reset that arrived as rescue immigrants (vs home-bred)
        immFrac: (b + im) > 0 ? im / (b + im) : 0,
        // zonation: littoral (near a shore) vs profundal (deep middle) vs pelagic (open mid-water)
        littoral: ag.filter(a => isLittoralX(a.x)).length,
        deep: ag.filter(a => a.y > bedY(a.x) * 0.7).length,
      };
    }
    return out;
  }
  // standing biomass (~ summed effective size) grouped by trophic role, plus the producer/zoo base
  biomassByTrophic() {
    const out = { phytoplankton: this.env.meanPhyto(), cyanobacteria: this.env.meanCyano(), macrophyte: this.plants.reduce((s, p) => s + (p.dead ? 0 : p.biomass), 0), zooplankton: (this.env.zooTotal(0) + this.env.zooTotal(1)) / 1000,
      snail: this.snails.reduce((s, p) => s + (p.dead ? 0 : 1), 0) * 0.05, crayfish: this.cray.reduce((s, p) => s + (p.dead ? 0 : 1), 0) * 0.4 };   // benthic invertebrates (count × a nominal mass)
    for (const k of SPECIES) out[SP[k].trophic] ??= 0;   // every fish level, even one absent now (a visiting pike away)
    for (const a of this.agents) out[a.sp.trophic] += a.W / 1000;   // fish: real wet biomass, kg
    return out;
  }
  // live counts of the non-fish biota (the resource base + benthic inverts) — for the food-web dashboard
  resourceCounts() {
    const live = arr => arr.reduce((s, x) => s + (x.dead ? 0 : 1), 0);
    return {
      zooplankton: Math.round(this.env.meanZooUgl()), larvae: live(this.larvae), insects: live(this.insects),
      snails: live(this.snails), crayfish: live(this.cray), detritus: live(this.detritus),
      plants: live(this.plants), mussels: this.mussels.length,
    };
  }
  // fleet-wide cognition/behaviour aggregates (pure): internal-drive levels, the brain-gated action mix,
  // recurrent-memory strength, and the mean contaminant burden. Surfaces the brain/drive state the sim computes
  // but never displayed. Action "rates" = the fraction of live fish whose intent exceeds the firing gate.
  cognitionDetail() {
    const ag = this.agents, n = ag.length, d = n || 1;
    let hunger = 0, fear = 0, strike = 0, flee = 0, hide = 0, mem = 0, tox = 0;
    for (const a of ag) {
      hunger += a.hunger || 0; fear += a.fear || 0; tox += a.tox || 0;
      const act = a.act;
      if (act.strike > ACTION.GATE) strike++;
      if (act.flee > ACTION.GATE) flee++;
      if (act.hide > ACTION.GATE) hide++;
      // memory strength = mean leak-gate (fraction of the previous hidden activation each unit retains) = the
      // recurrence the brain evolved; the LEAK block is the genome tail (last `hid` weights).
      const HID = a.sp.shape.hid, base = a.g.length - HID; let s = 0;
      for (let j = 0; j < HID; j++) s += 1 / (1 + Math.exp(-a.g[base + j]));
      mem += s / HID;
    }
    return { count: n, meanHunger: hunger / d, meanFear: fear / d, pStrike: strike / d, pFlee: flee / d, pHide: hide / d, meanMemory: mem / d, meanTox: tox / d };
  }
  inspectAgent() { if (this.selectedId != null) { const f = this.agents.find(a => a.id === this.selectedId); if (f) return f; } return this.topPerformer(); }

  // returns the new fish, or null when the lake is at WORLD.GLOBAL_MAX (the UI should say "lake full")
  addAgent(key, opts = {}) {
    if (!Object.hasOwn(SP, key)) throw new Error(`addAgent: unknown species "${key}"`);
    if (this.agents.length >= WORLD.GLOBAL_MAX) return null;
    _idOwner = this;
    const sp = SP[key], p = sp.spawnPos(rand), src = opts.fromBest ? this._bestOf(key) : null;
    const x = opts.x ?? p.x;
    const a = makeAgent(key, x, opts.y ?? zoneY(sp, x), rand(BIOE.K_START[0], BIOE.K_START[1]),
      src ? src.gen : 0, src ? (src.hue + gauss() * 6 + 360) % 360 : sp.randomHue(rand),
      opts.genome ? fitGenome(sp, opts.genome).g : (src ? mutate(src.g) : randomGenome(sp.shape)), rand(sp.matureAge, sp.matureAge * 1.8));
    this.agents.push(a); return a;
  }

  // ---------- save / load ----------
  // v24: a FAITHFUL RESUME — everything that shapes the future is saved, so load → step reproduces the uninterrupted run
  // byte-for-byte: the RNG stream position (`rng`), the per-world id counter (`nid`), each fish's id / mating cooldown /
  // smoothed controls / travel heading / stroke phase / last action intents / learned W2 block, the sinking corpses, the
  // benthic particles' y, and the env's cached means (see Environment.toJSON). Older saves still load on defaults.
  // v32 (2026-10-15): the Maine species set — an older save's carp and trout (species no longer in the lake) are skipped
  // on load (rep.skippedSpecies) and the white perch and white sucker arrive by the refuge; the other six keep their fish.
  toJSON() {
    return {
      version: 32, W, H, time: this.time, maxGen: this.maxGen, stats: this.stats, rng: getRandState(), nid: this._nextId,
      evo: this.evo,   // the evolution history (EVO) — a record only: it never shapes the future
      env: this.env.toJSON(),
      agents: this.agents.map(a => {
        const HID = a.sp.shape.hid, W2 = a.sp.shape.in * HID + HID, act = a.act;
        return { s: a.species, x: a.x, y: a.y, h: a.heading, sp: a.spd, g: a.gen, hu: a.hue, ag: a.age, ea: a.eaten, w: Array.from(a.g), gn: Array.from(a.genes), m: Array.from(act.h), tx: a.tox, hg: a.hunger, fe: a.fear, hx: a.homeX,   // `m` recurrent memory; `tx` contaminant burden; `hg`/`fe` drives; `hx` natal home
          L: a.L, wm: a.W, sx: a.sex, mt: a.mature, go: a.gon, gu: a.gut > 0 ? a.gut : undefined, ge: a.gut > 0 ? a.gutE : undefined,   // v27 body: length cm, mass g, sex, maturity, gonads g, gut
          ro: a.rO2 || undefined,   // v27 last respiration (g O₂/s) — the env charges it at the start of the next step
          mi: a.missCd > 0 ? a.missCd : undefined,   // v27 recovery time left after a missed strike
          xo: a.xo, xt: a.xt,                         // v27 the O₂ / temperature it has experienced (hours-scale exposure)
          ua: a.uAvg,                                 // v27 its ~1-day mean swimming effort (the activity cost)
          ft: a.foodT,                                // v27 time since its last good meal (patch residence)
          id: a.id, mc: a.mateCd, ts: a.turnSmooth, th: a.thrustSmooth, vh: a.velHeading, st: a.stroke,   // resume state (vh/st absent until first stepped)
          ac: [act.turn, act.thrust, act.strike, act.flee, act.hide],                                        // last action intents
          lw: a.lw ? Array.from(a.lw.subarray(W2, W2 + OUT * HID)) : undefined,                           // learned policy: only W2 can differ from `w`
          // v25 nest state: a guardian's remaining duty `nt` + nest; a fry's guardian id `ni` + nest (absent = none)
          fa: a.feedAcc > 0 ? a.feedAcc : undefined, da: a.dAcc,   // v25 handling-time remainder (a cold fish forages slower → fractional)
          nt: a.nt > 0 ? a.nt : undefined, ni: a.ni || undefined, nx: (a.nt > 0 || a.ni) ? a.nx : undefined, ny: (a.nt > 0 || a.ni) ? a.ny : undefined };
      }),
      plants: this.plants.map(p => ({ x: p.x, b: p.baseY, h: p.height, m: p.maxHeight, v: p.v, g: Array.from(p.gn), hu: p.hue, la: p.lightAvg, nu: p.nut })),
      detritus: this.detritus.map(d => ({ x: d.x, y: d.y, l: d.life, n: d.n, m: d.m })),
      larvae: this.larvae.map(l => ({ x: l.x, y: l.y, d: l.dev, m: l.m })),
      insects: this.insects.map(i => ({ x: i.x, y: i.y, l: i.life, vx: i.vx, wb: i.wob, m: i.m })),
      snails: this.snails.map(s => ({ x: s.x, y: s.y, vx: s.vx, ph: s.ph })),
      cray: this.cray.map(c => ({ x: c.x, y: c.y, vx: c.vx, ph: c.ph })),
      corpses: this.corpses.map(c => ({ s: c.species, x: c.x, y: c.y, h: c.heading, rh: c.rHeading, sz: c.size, gr: c.grow, L: c.L, hu: c.hue, gn: Array.from(c.genes),
        fc: c.facing, sp: c.spd, t: c.t, t0: c.t0, r: c.roll, sk: c.sink })),
      reeds: this.reeds, logs: this.logs, mussels: this.mussels, weedbeds: this.weedbeds,
      birds: this.birds.map(b => ({ x: b.x, y: b.y, h: b.h, st: b.st, t: b.t, stay: b.stay, m: b.m, vx: b.vx })),   // v25 visiting loon(s)
      // v26 wildlife: dragonfly nymphs + adults, frogs / tadpoles / turtles
      nymphs: this.nymphs.map(n => ({ x: n.x, h: n.h, d: n.dev, vx: n.vx })),
      dflies: this.dflies.map(d => ({ x: d.x, vx: d.vx, l: d.life, ph: d.ph })),
      herps: this.herps.map(h => ({ k: h.k, x: h.x, y: h.y, vx: h.vx, a: h.age, e: h.e, s: h.st, t: h.t, c: h.cd, d: h.dev })),
      // v27 young-of-year fry schools
      fry: this.fry.map(f => ({ k: f.k, x: f.x, y: f.y, n: f.n, L: f.L, W: f.W, a: f.age, g: f.gen, hu: f.hue, w: Array.from(f.w), gn: Array.from(f.gn), vx: f.vx, ni: f.ni || undefined, nx: f.nx, ny: f.ny, tk: f.tk, tx: f.tx, ty: f.ty, ro: f.rO2, p: f.p })),
      genePool: Object.fromEntries(SPECIES.map(k => [k, (this.genePool[k] || []).map(e => ({ w: Array.from(e.w), gn: Array.from(e.gn), hu: e.hue, g: e.gen }))])),
    };
  }
  // ATOMIC, VALIDATED load. Phase 1 (parseSave) validates the file and builds the whole new world into locals — a
  // structurally unusable file throws a descriptive Error and leaves this world (and the RNG stream) exactly as it was;
  // bad items are repaired or skipped and counted. Phase 2 commits everything at once. The RNG is restored LAST to the
  // saved stream position (older saves: to where it was before the load), so draws made while parsing don't matter.
  // Returns the load report (also kept as `this.lastLoad`, not serialized).
  load(s) {
    const rng0 = getRandState(), owner0 = _idOwner;
    let P;
    try { P = parseSave(s); } catch (e) { setRandState(rng0); _idOwner = owner0; throw e; }
    this.time = P.time; this.maxGen = P.maxGen; this.stats = P.stats; this.env = P.env;
    this.agents = P.agents; this.plants = P.plants; this.detritus = P.detritus;
    this.larvae = P.larvae; this.insects = P.insects; this.snails = P.snails; this.cray = P.cray; this.corpses = P.corpses;
    this.reeds = P.structs.reeds; this.logs = P.structs.logs; this.mussels = P.structs.mussels; this.weedbeds = P.structs.weedbeds;
    this.genePool = P.genePool; this.birds = P.birds; this.nymphs = P.nymphs; this.dflies = P.dflies; this.herps = P.herps; this.fry = P.fry;
    if (P.rep.reseeded) this.stats.brainsReseeded = P.rep.reseeded;
    this._nextId = P.nextId; _idOwner = this;
    this.series = []; this._seriesAcc = 0; this.selectedId = null; this.lastLoad = P.rep;
    this.evo = P.evo; this._evoSlot = this.evo.length ? Math.floor(this.time / EVO.SAMPLE) : -1;   // (continue sampling where the saved run would)
    setRandState(P.rng != null ? P.rng : rng0);
    return P.rep;
  }

  // champion brains per species (best genome), for export/seeding
  champions() {
    const out = {};
    for (const k of SPECIES) { const b = this._bestOf(k); if (b) out[k] = { gen: b.gen, hue: b.hue, w: Array.from(b.g) }; }
    return out;
  }
  // Seed a few fish per species from saved champion brains. The input is untrusted (localStorage / an imported file):
  // only known species, gen coerced to a non-negative integer, hue to a number, an older-era brain migrated and an
  // unusable one reseeded, and never past WORLD.GLOBAL_MAX. Returns { added, reseeded } (fish added, and how many of them
  // got a fresh random brain because their champion's brain was unusable).
  seedFromChampions(champs) {
    if (!isObj(champs)) throw new Error('seedFromChampions: expected { species: { gen, hue, w } }');
    _idOwner = this;
    let added = 0, reseeded = 0;
    for (const k of SPECIES) {
      if (!Object.hasOwn(champs, k) || !isObj(champs[k])) continue;
      const c = champs[k], sp = SP[k], gen = nonNegInt(c.gen), hue = hueOr(c.hue, null) ?? sp.randomHue(rand);
      const fit = fitGenome(sp, c.w);   // guard the champion genome against the current shape before mutating
      for (let i = 0; i < Math.max(2, Math.floor(popStart(sp) / 2)) && this.agents.length < WORLD.GLOBAL_MAX; i++) {
        const p = sp.spawnPos(rand);
        this.agents.push(makeAgent(k, p.x, zoneY(sp, p.x), rand(BIOE.K_START[0], BIOE.K_START[1]), gen,
          (hue + gauss() * 8 + 360) % 360, fit.reseeded ? randomGenome(sp.shape) : mutate(fit.g), rand(sp.matureAge * 0.5, sp.matureAge * 1.5)));   // a mix of young and adult fish
        added++; if (fit.reseeded) reseeded++; if (gen > this.maxGen) this.maxGen = gen;
      }
    }
    return { added, reseeded };
  }
}

// Activate the stepping world's id counter (see nextAgentId) — a wrapper so the step() body itself stays untouched.
{ const rawStep = World.prototype.step; World.prototype.step = function (...args) { _idOwner = this; return rawStep.apply(this, args); }; }
