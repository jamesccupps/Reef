// world.js — the simulation. Pure (no DOM). Headless-testable in Node.
import { WORLD, ENV, PLANKTON, DETRITUS, PLANT, MACRO, NUTRIENT, IMMIGRATION, SPAWN, SEED_COUNTS, scaleCount, GRID, bedY, BASIN, STRUCTURE, COVER, PHYTO, CYANO, MUSSEL, COMPETE, SCHOOL, TOX, ACTION, MOTION, DRIVE, INSECT, SNAIL, CRAYFISH, LEARN, BRAIN, BROOD, FEED } from './config.js';
import { rand, gauss, clamp, canEat, angDiff, SpatialGrid, randomGenome, migrateGenome, migrateGenomeInputs, mutate, crossover, forward, reinforce, genomeLen, OUT, randomGenes, crossoverGenes, mutateGenes, GENE_KEYS, randomPlantGenes, PLANT_GENE_KEYS } from './core.js';
import { Environment } from './environment.js';
import { SP, SPECIES } from './species.js';
// save/load integrity (era-aware brain migration, exact resume, validated atomic load)
import { getRandState, setRandState, remapGenome, ACT_LABELS, GENE_MIN, GENE_MAX } from './core.js';
import { brainEraOf } from './species.js';

const W = WORLD.W, H = WORLD.H, FLOOR = WORLD.FLOOR;
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
const effSize = a => a.size * (0.6 + 0.4 * (a.grow ?? 1)); // juveniles are smaller -> more vulnerable
// sub-lethal reproductive impairment from the contaminant body burden: 1 below TOX.REPRO_HARM, falling to 0 as the
// burden rises (PCB/endocrine-style fecundity loss that bites before lethality). Inert when a.tox = 0 (a clean lake).
export function toxFecundity(tox) { return tox > TOX.REPRO_HARM ? Math.max(0, 1 - TOX.REPRO_CUT * (tox - TOX.REPRO_HARM)) : 1; }
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
const SAVE_ARRAYS = ['agents', 'plants', 'plankton', 'detritus', 'larvae', 'insects', 'snails', 'cray', 'corpses'];
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
    // pass age so makeAgent derives the correct growth (adults reload as adults); missing genes pad to the 1.0 baseline
    const ag = makeAgent(a.s, x, y, clamp(num(a.e, (sp.startEnergy[0] + sp.startEnergy[1]) / 2), -1e3, 1e3), nonNegInt(a.g),
      hueOr(a.hu, null) ?? sp.randomHue(rand), fit.g, clamp(num(a.ag, sp.matureAge), 0, 1e9), Array.isArray(a.gn) ? a.gn : []);
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
    const pl = { x, baseY, v, gn, hue: hueOr(p.hu, mv.hue), height, maxHeight, biomass: height * PLANT.BIOMASS_PER_PX, y: baseY - height * 0.5, dead: false, lightAvg };
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
  const plankton = parts(s.plankton, scaleCount(PLANKTON.CAP), (q, x) => ({ x, baseY: yIn(q.y, bedY(x) * 0.5), y: 0, phase: num(q.ph, 0), vx: num(q.vx, 0), dead: false }));
  const detritus = parts(s.detritus, scaleCount(DETRITUS.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x)), life: num(q.l, DETRITUS.LIFE), dead: false }));
  const larvae = parts(s.larvae, scaleCount(INSECT.LARVA_CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), dev: num(q.d, 0), dead: false }));
  const insects = parts(s.insects, scaleCount(INSECT.ADULT_CAP), (q, x) => ({ x, y: yIn(q.y, 8), life: num(q.l, INSECT.ADULT_LIFE), vx: num(q.vx, 0), wob: num(q.wb, 0), dead: false }));
  const snails = parts(s.snails, scaleCount(SNAIL.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), vx: num(q.vx, 0), ph: num(q.ph, 0), dead: false }));
  const cray = parts(s.cray, scaleCount(CRAYFISH.CAP), (q, x) => ({ x, y: yIn(q.y, bedY(x) - 2), vx: num(q.vx, 0), ph: num(q.ph, 0), dead: false }));
  // natural-death bodies still sinking/fading (they turn into detritus when they expire)
  const corpses = [];
  for (const c of s.corpses || []) {
    if (corpses.length >= WORLD.GLOBAL_MAX) { rep.truncated++; continue; }
    if (!isObj(c) || typeof c.s !== 'string' || !Object.hasOwn(SP, c.s) || !isNum(c.x) || !isNum(c.y)) { rep.skippedInvalid++; continue; }
    const sp = SP[c.s], size = clamp(num(c.sz, sp.size), 0.05, 20), h = num(c.h, 0);
    corpses.push({ sp, species: c.s, x: clamp(c.x, 0, W), y: clamp(c.y, 0, H), heading: h, rHeading: num(c.rh, h), size, grow: clamp(num(c.gr, 1), 0.35, 1),
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
  const rng = Number.isInteger(s.rng) && s.rng >= 0 && s.rng <= 0xFFFFFFFF ? s.rng : null;
  return { time, maxGen, stats, env, agents, plants, plankton, detritus, larvae, insects, snails, cray, corpses, structs, nextId, rng, rep };
}
function makeAgent(species, x, y, energy, gen, hue, genome, age = 0, genes = null) {
  const sp = SP[species], shape = sp.shape;
  const grow = clamp(0.35 + 0.65 * (age / sp.matureAge), 0.35, 1);
  // multi-gene genome: size/speed/tol physiology + fin/eye/body MORPHOLOGY → effective per-individual stats.
  // Genes are multipliers ~1.0, so gene≈1 reproduces the species baseline. Every benefit has a cost folded into
  // metabMul (and body/fin add drag), so traits trade off and selection has something to push on.
  const gn = genes ? fitGenes(genes) : randomGenes();   // a brand-new fish gets fresh near-1.0 variation
  const gSize = gn[0], gSpeed = gn[1], gTol = gn[2], gFin = gn[3], gEye = gn[4], gBody = gn[5], gBrain = gn[6];
  // EVOLVABLE BRAIN SIZE: how many hidden units are active (the rest masked in forward). gBrain≈1 → full layer (baseline).
  const activeHid = clamp(Math.round(shape.hid * gBrain), Math.min(BRAIN.HID_MIN, shape.hid), shape.hid);
  const size = sp.size * gSize;
  const maxTurn = sp.maxTurn * (0.6 + 0.4 * gFin);                     // bigger fins → sharper turns (maneuverability)
  const accel = sp.accel * (0.8 + 0.2 * gBody);                         // deeper body → more thrust/acceleration
  const senseRange = sp.senseRange * (0.6 + 0.4 * gEye);                // bigger eyes → see farther
  const maxSpeed = sp.maxSpeed * gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin);  // deep body & big fins drag → slower top speed
  const bodyMul = 0.8 + 0.2 * gBody;                                    // deeper body → effectively larger to a gape-limited predator (harder to eat)
  const tempTol = sp.tempTol * gTol;
  const o2Crit = clamp(sp.o2Crit * (2 - gTol), 0.05, 0.6);              // hardier → lower critical O₂
  const metabMul = gSize * (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol)  // bigger/faster/hardier cost more …
    * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody)   // … and so do big fins/eyes/a deep body
    * (1 - BRAIN.COST * (shape.hid - activeHid) / shape.hid);                // … and a SMALLER brain is metabolically cheaper (per-neuron saving; ×1 at the full-brain baseline)
  const brain = genome || randomGenome(shape);   // the inherited genotype; the plastic policy `lw` starts as a copy of it
  return {
    id: nextAgentId(), species, sp, size, grow, genes: gn, maxSpeed, maxTurn, accel, senseRange, bodyMul, tempTol, o2Crit, metabMul, activeHid,
    x, y, homeX: x, heading: rand(0, Math.PI * 2), spd: rand(1, 6), vis: 0,   // homeX = natal site (the spatial-cognition homing anchor)
    energy, gen, hue, age, eaten: 0, tox: 0, hunger: 0, fear: 0, mateCd: rand(0, sp.matingCooldown), dead: false, _mated: false, turnSmooth: 0, thrustSmooth: 0,
    g: brain, lw: Float32Array.from(brain),   // g = inherited GENOTYPE (fixed, used for breeding/saving); lw = the PLASTIC policy `forward` runs (lifetime learning nudges it; Baldwinian)
    act: { h: new Float32Array(shape.hid), o: new Float32Array(OUT), turn: 0, thrust: 0, strike: 0, flee: 0, hide: 0, in: new Float32Array(shape.in) },
  };
}
// pick a macrophyte variety appropriate to the rooting bed-depth fraction (so forms zonate by depth: shallow
// shelf → lily/chara/pondweed, drop-off → pondweed/milfoil, deep → milfoil). Random among the depth-matching forms.
function pickVariety(bedFrac) {
  let cands = null, c0 = -1;
  for (let i = 0; i < MACRO.length; i++) if (bedFrac >= MACRO[i].zone[0] && bedFrac <= MACRO[i].zone[1]) { if (cands) cands.push(i); else if (c0 < 0) c0 = i; else { cands = [c0, i]; } }
  if (cands) return cands[(rand() * cands.length) | 0];
  return c0 >= 0 ? c0 : 0;   // default to pondweed if nothing matches
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
function newPlant(x, mature, parent = null) {
  const base = bedY(x) + rand(-1, 2);                    // rooted on the (curved) lake bed
  const v = pickVariety(clamp(base / WORLD.H, 0, 1)), mv = MACRO[v];
  const gn = parent ? mutateGenes(parent.gn, 0.5, 0.045) : randomPlantGenes();   // slow drift; core.rand → deterministic
  const hue = parent ? wrapHue(parent.hue + gauss() * 7) : wrapHue(mv.hue + rand(-6, 6));
  const maxH = clamp(rand(mv.maxH[0], mv.maxH[1]) * gn[0], 6, 140);
  const height = mature ? rand(PLANT.WINTER_MIN, maxH) : PLANT.WINTER_MIN;
  const p = { x, baseY: base, v, gn, hue, maxHeight: maxH, height, biomass: height * PLANT.BIOMASS_PER_PX, y: base - height * 0.5, dead: false };
  derivePlant(p);
  return p;
}
// macrophytes need light → they form dense beds on the shallow lit littoral shelf and are sparse
// in the dark deep middle. Bias seeding x toward the shelves (the rest still spreads, but those
// deep seedlings are light-limited and tend to uproot — the beds self-concentrate on the shelf).
function plantX() {
  if (rand() < 0.75) return rand() < 0.5 ? rand(8, W * BASIN.SHELF_FRAC) : rand(W * (1 - BASIN.SHELF_FRAC), W - 8);
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
    this.agentGrid = new SpatialGrid(W, H, GRID.AGENT_CELL);
    this.planktonGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);
    this.detritusGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);
    this.larvaeGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);   // benthic insect larvae (bottom-fish food)
    this.insectGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);   // emerged surface insects (surface-fish food)
    this.snailGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);    // benthic grazing snails (sunfish/carp/crayfish food)
    this.crayGrid = new SpatialGrid(W, H, GRID.FOOD_CELL);     // benthic crayfish (bass/pike/catfish food)
    this.time = 0; this.maxGen = 0;
    this.stats = { foodEaten: 0, fishEaten: 0, births: {}, immigrants: {} };  // births = home-bred (sexual+asexual); immigrants = rescue arrivals — per species
    this.series = [];           // {g,c,b...} census + env over time
    this._seriesAcc = 0;
    this.selectedId = null;
    this._counts = {};
    this.reset();
  }

  reset() {
    this._nextId = 1; _idOwner = this;   // per-world id counter (see nextAgentId)
    this.agents = []; this.plankton = []; this.detritus = []; this.plants = []; this.corpses = [];
    this.larvae = []; this.insects = [];   // aquatic-insect life cycle: benthic larvae ↔ emerged surface adults
    this.snails = []; this.cray = [];      // benthic invertebrates: grazing snails + omnivorous crayfish
    this.env = new Environment();
    this.time = 0; this.maxGen = 0; this.stats.foodEaten = 0; this.stats.fishEaten = 0;
    this.stats.births = {}; this.stats.immigrants = {}; for (const k of SPECIES) { this.stats.births[k] = 0; this.stats.immigrants[k] = 0; }
    this.series = []; this._seriesAcc = 0; this.selectedId = null;
    for (const key of SPECIES) {
      const sp = SP[key];
      for (let i = 0; i < popStart(sp); i++) {
        const p = sp.spawnPos(rand);
        this.agents.push(makeAgent(key, p.x, zoneY(sp, p.x), rand(sp.startEnergy[0], sp.startEnergy[1]), 0, sp.randomHue(rand), null, rand(sp.matureAge, sp.matureAge * 1.8)));
      }
    }
    for (let i = 0, n = scaleCount(SEED_COUNTS.plankton); i < n; i++) this.plankton.push(this._mkPlankton());
    for (let i = 0, n = scaleCount(INSECT.LARVA_SEED); i < n; i++) this.larvae.push(this._mkLarva());
    for (let i = 0, n = scaleCount(SNAIL.SEED); i < n; i++) this.snails.push(this._mkSnail());
    for (let i = 0, n = scaleCount(CRAYFISH.SEED); i < n; i++) this.cray.push(this._mkCray());
    for (let i = 0, n = scaleCount(SEED_COUNTS.plants); i < n; i++) this.plants.push(newPlant(plantX(), true));
    for (let i = 0, n = scaleCount(SEED_COUNTS.detritus); i < n; i++) { const x = rand(20, W - 20); this.spawnDetritus(x, bedY(x) - rand(0, 50)); }
    this._genStructures();
  }

  bedY(x) { return bedY(x); }   // world-y of the lake bed at x (for senses & rendering)

  // static habitat structure: reed clumps on the shallow shores, submerged logs on the bed,
  // and mussel beds (benthic filter feeders) on the lit bed
  _genStructures() {
    this.reeds = []; this.logs = []; this.mussels = []; this.weedbeds = [];
    const lin = WORLD.W / WORLD.REF_W, band = STRUCTURE.SHORE_FRAC * W;   // shore/bed features scale with width
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.REEDS * lin)); i < n; i++) {
      const x = rand() < 0.5 ? rand(6, band) : rand(W - band, W - 6);
      this.reeds.push({ x, baseY: bedY(x), height: rand(20, 52), n: 3 + (rand() * 4 | 0) });
    }
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.LOGS * lin)); i < n; i++) {
      const x = rand(50, W - 50);
      this.logs.push({ x, y: bedY(x) - rand(0, 6), len: rand(22, 52), ang: rand(-0.35, 0.35) });
    }
    // submerged macrophyte beds on the littoral / drop-off: tall weed bands rooted on the bed that reach
    // UP into the oxygenated mid-water column — the cover where pike ambush & sunfish hold (avoid the deep
    // hypoxic centre so cover-seekers don't get pulled into water they can't breathe).
    for (let i = 0, n = Math.max(1, Math.round(STRUCTURE.WEEDBEDS * lin)); i < n; i++) {
      const x = rand() < 0.5 ? rand(W * 0.08, W * 0.34) : rand(W * 0.66, W * 0.92);
      const bed = bedY(x), top = clamp(bed - rand(170, 360), H * 0.14, bed - 40);  // reaches up into mid-water
      this.weedbeds.push({ x, top, bot: bed, w: rand(16, 30) });
    }
    for (let i = 0, n = Math.max(1, Math.round(MUSSEL.COUNT * lin)); i < n; i++) {
      // bias to the lit bed (shelves & slopes) where phytoplankton is available to filter
      const x = rand() < 0.5 ? rand(20, W * 0.34) : rand(W * 0.66, W - 20);
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

  _mkPlankton(x, y) {
    const px = x ?? rand(6, W - 6);
    const py = y ?? clamp(rand(16, bedY(px) - 12), 12, bedY(px) - 8);   // stay within the water column
    return { x: px, baseY: py, y: 0, phase: rand(0, 6.28), vx: rand(-PLANKTON.DRIFT, PLANKTON.DRIFT), dead: false };
  }
  spawnDetritus(x, y) {
    if (this.detritus.length >= scaleCount(DETRITUS.CAP)) return;
    const cx = clamp(x, 2, W - 2);
    this.detritus.push({ x: cx, y: clamp(y, 2, bedY(cx)), life: DETRITUS.LIFE * (0.6 + rand() * 0.8), dead: false });
  }
  // a benthic insect larva on the lake bed (detritivore; develops with warmth, then emerges). `dev` 0..1 maturity.
  _mkLarva(x, dev) { const px = x ?? rand(8, W - 8); return { x: px, y: bedY(px) - rand(1, 5), dev: dev ?? rand(0, 0.25), dead: false }; }
  // an emerged adult insect at the surface (drifts, short-lived, surface-fish food). `wob` = render flutter phase.
  _mkInsect(x) { const px = clamp(x ?? rand(8, W - 8), 4, W - 4); return { x: px, y: rand(2, 14), life: INSECT.ADULT_LIFE * (0.7 + rand() * 0.6), vx: rand(-INSECT.ADULT_DRIFT, INSECT.ADULT_DRIFT), wob: rand(0, 6.28), dead: false }; }
  // a benthic snail crawling the lit bed (biased to the littoral shelf where algae/plants concentrate). `ph` = render phase.
  _mkSnail(x) { const px = x ?? plantX(); return { x: px, y: bedY(px) - rand(0, 3), vx: rand(-SNAIL.CRAWL, SNAIL.CRAWL), ph: rand(0, 6.28), dead: false }; }
  // a benthic crayfish walking the bed (drifts toward cover; crepuscular). `ph` = render leg-wiggle phase.
  _mkCray(x) { const px = x ?? rand(8, W - 8); return { x: px, y: bedY(px) - rand(1, 4), vx: rand(-CRAYFISH.CRAWL, CRAYFISH.CRAWL), ph: rand(0, 6.28), dead: false }; }

  // ---------- spatial queries used by senses (visual range shortened by water turbidity) ----------
  qPlankton(x, y, r) { const c = this.env.clarity(); return this.planktonGrid.nearest(x, y, r * c, it => !it.dead); }
  qDetritus(x, y, r) { const c = this.env.clarity(); return this.detritusGrid.nearest(x, y, r * c, it => !it.dead); }
  qInsect(x, y, r) { const c = this.env.clarity(); return this.insectGrid.nearest(x, y, r * c, it => !it.dead); }
  // nearest surface food for a planktivore/omnivore — zooplankton OR an emerged insect (so fish RISE to a hatch).
  qSurfaceFood(a) { const p = this.qPlankton(a.x, a.y, a.senseRange), i = this.qInsect(a.x, a.y, a.senseRange); return !p ? i : !i ? p : (i.dist < p.dist ? i : p); }
  // a fish's plant SENSE: like the other q* senses, its visual range shrinks with water turbidity
  qPlant(x, y, r) { return this.nearestPlant(x, y, r * this.env.clarity()); }
  // nearest live plant within r (linear scan — few plants; point-to-stem distance). NOT clarity-scaled: used directly
  // for non-visual lookups (the seed-parent search), so plant heredity doesn't weaken in murky water.
  nearestPlant(x, y, r) {
    let best = null, bd = r * r;
    for (const p of this.plants) {
      if (p.dead) continue;
      const dx = x - p.x, top = p.baseY - p.height, yc = clamp(y, top, p.baseY), dy = y - yc, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = p; }
    }
    return best ? { item: best, dist: Math.sqrt(bd) } : null;
  }
  // predator/prey relation (shared so qThreat and qPrey stay SYMMETRIC): `pred` could eat `prey` if it's a piscivore,
  // the prey fits its gape, and the prey isn't a conspecific still inside its post-birth grace (BROOD.GRACE).
  // So a juvenile fears a cannibal adult of its own kind exactly when that adult could actually eat it.
  canPrey(pred, prey) {
    return pred !== prey && !pred.dead && !prey.dead && pred.sp.diet.fish && !(pred.species === prey.species && prey.age < BROOD.GRACE) &&
      canEat(effSize(pred), effSize(prey) * (prey.bodyMul || 1));
  }
  qThreat(a) { const r = a.senseRange * 1.1 * this.env.clarity(); return this.agentGrid.nearest(a.x, a.y, r, it => this.canPrey(it, a)); }
  qPrey(a) { const r = a.senseRange * this.env.clarity(); return this.agentGrid.nearest(a.x, a.y, r, it => this.canPrey(a, it)); }
  qMate(a) { return this.agentGrid.nearest(a.x, a.y, a.sp.mateRadius, it => !it.dead && it !== a && it.species === a.species && it.age >= it.sp.matureAge && it.energy >= it.sp.reproEnergy && it.mateCd <= 0 && !it._mated); }
  // trait-based MATE CHOICE (sexual selection): instead of the nearest eligible mate, score every eligible
  // partner nearby by condition (energy) + heritable quality (mean trait gene) + foraging success, and pick
  // the best. So evolution acts on the genome (vigorous, well-fed, good-genes mates are preferred). No RNG.
  chooseMate(a) {
    const r = a.sp.mateRadius, r2 = r * r; let best = null, bestScore = -Infinity;
    this.agentGrid.forNear(a.x, a.y, r, it => {
      if (it.dead || it === a || it.species !== a.species || it.age < it.sp.matureAge || it.energy < it.sp.reproEnergy || it.mateCd > 0 || it._mated) return;
      const dx = it.x - a.x, dy = it.y - a.y; if (dx * dx + dy * dy > r2) return;
      const cond = it.energy / it.sp.reproEnergy;                                  // condition
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
    let n = 0, sx = 0, sy = 0, vc = 0, vs = 0, r2 = r * r;
    this.agentGrid.forNear(a.x, a.y, r, it => {
      if (it.dead || it === a || it.species !== a.species) return;
      const dx = it.x - a.x, dy = it.y - a.y; if (dx * dx + dy * dy > r2) return;
      n++; sx += it.x; sy += it.y; vc += Math.cos(it.heading); vs += Math.sin(it.heading);
    });
    if (!n) return { density: 0, cohSin: 0, cohCos: 0, alignCos: 0 };
    const ca = Math.atan2(sy / n - a.y, sx / n - a.x) - a.heading, avgH = Math.atan2(vs, vc);
    return { density: clamp(n / 8, 0, 1), cohSin: Math.sin(ca), cohCos: Math.cos(ca), alignCos: Math.cos(avgH - a.heading) };
  }

  // ---------- feeding ----------
  // take (kill) up to n of the nearest live items within r; returns how many were taken (0 = none → falsy)
  _takeNearest(grid, x, y, r, n = 1) {
    let k = 0;
    for (; k < n; k++) { const m = grid.nearest(x, y, r, it => !it.dead); if (!m) break; m.item.dead = true; }
    return k;
  }
  // credit a fish with k meals of energy E each (capped at its energyCap) + the dietary toxicant per meal
  _ate(a, k, E) { a.energy = Math.min(a.sp.energyCap, a.energy + k * E); a.eaten += k; this.stats.foodEaten += k; a.tox += k * TOX.FOOD * TOX.AMBIENT; }
  // test/diagnostic hook: build a plant (optionally inheriting from a parent) WITHOUT inserting it, so heredity &
  // gene→phenotype derivation can be probed headlessly. Same code path the seeding step uses.
  makePlant(x, mature = false, parent = null) { return newPlant(x, mature, parent); }
  // test/diagnostic hook: build a fish with specific trait genes (adult by default) WITHOUT inserting it, so the
  // gene → effective-stat derivation (size/speed/tol + fin/eye/body morphology) and the fitGenes guard can be probed.
  // Respects WORLD.GLOBAL_MAX like every other creation path: returns null when the lake is already at the cap.
  makeFish(species, genes = null, age = 9999) {
    if (!Object.hasOwn(SP, species)) throw new Error(`makeFish: unknown species "${species}"`);
    if (this.agents.length >= WORLD.GLOBAL_MAX) return null;
    _idOwner = this;
    return makeAgent(species, 100, 100, 1, 0, 180, null, age, genes ? Float32Array.from(genes) : null);
  }
  // graze the nearest plant for one step of length dt: removes up to PLANT.BITE_RATE·dt px (a per-SECOND rate → the same
  // grazing per second at any fixed step); returns the energy gained. Default dt = one browser step.
  bitePlant(a, dt = FEED.HANDLE) {
    const m = this.qPlant(a.x, a.y, a.sp.eatRadius + 6);
    if (!m) return 0;
    // graze only the above-rootstock biomass — the below-sediment rhizome (WINTER_MIN) survives grazing (and winter)
    const p = m.item, bite = Math.min(PLANT.BITE_RATE * dt, Math.max(0, p.height - PLANT.WINTER_MIN));
    if (bite <= 0) return 0;   // nothing left to graze but the protected rootstock
    p.height -= bite; p.biomass = p.height * PLANT.BIOMASS_PER_PX;
    return PLANT.ENERGY_PER_PX * bite * p.palat;   // energy ∝ biomass grazed; tough/defended forms yield less (per-plant gene)
  }
  takePrey(a) {
    const m = this.qPrey(a);
    if (!m) return null;
    const prey = m.item;
    // a predator's effective strike reach is shrunk by (1) prey hiding in reeds/logs/weeds (cover refuge) AND (2) the
    // prey being tucked in a dense cluster of its OWN species — predator-confusion/dilution. This is a GROUP-SIZE
    // property: any conspecific aggregation dilutes predation (as a real baitball does), so it is NOT gated to
    // "schooling species" — schooling is simply the behaviour that reliably FORMS such a cluster, so it's the trait
    // selection rewards (it makes the innate cohesion ADAPTIVE). Deterministic (allyStats grid query, no RNG).
    const shoal = this.allyStats(prey, SCHOOL.DILUTE_R).density;
    // …and is EXTENDED by the predator committing a brain-gated STRIKE lunge, and SHRUNK by the prey freezing (HIDE
    // concealment) — so the predator's strike decision and the prey's hide decision both bite here (emergent arms race).
    const reach = a.sp.eatRadius * (1 - this.coverAt(prey.x, prey.y) * COVER.REFUGE) * (1 - SCHOOL.DILUTE * shoal)
      * (1 + ACTION.STRIKE_REACH * a.act.strike) * (1 - ACTION.HIDE_CONCEAL * prey.act.hide);
    if (m.dist < reach) {
      prey.dead = true; this._counts[prey.species]--;
      if (prey.id === this.selectedId) this.selectedId = null;
      const n = 1 + (effSize(prey) * DETRITUS.FROM_DEATH * 2 | 0);
      for (let k = 0; k < n; k++) this.spawnDetritus(prey.x + rand(-3, 3), prey.y + rand(-3, 3));
      a.tox += prey.tox * TOX.ASSIM;   // the predator assimilates its prey's whole accumulated burden → BIOMAGNIFICATION up the chain
      return prey;
    }
    return null;
  }

  // ---------- main step ----------
  // biotic shading a plant receives from TALLER neighbours (a 0..1 light multiplier) — linear scan for tests/diagnostics;
  // the step loop uses a bucketed version (same overheadFrom formula) for speed.
  plantShadeFactor(p) { return Math.exp(-COMPETE.SHADE * overheadFrom(p, this.plants, COMPETE.RADIUS)); }
  step(dt) {
    this.time += dt;
    const env = this.env;
    const smoothK = 1 - Math.exp(-dt / 0.65); // ease steering over ~0.5s -> smooth, fish-like motion

    // environment fields (uses current plants & agents)
    env.step(dt, this);

    // zooplankton track the phytoplankton field: they multiply where algae is abundant, graze it
    // down, and starve where it's depleted (rate & cap scale with world area)
    const area = WORLD.AREA_SCALE;
    const planktonCap = scaleCount(PLANKTON.CAP);
    const algae = clamp(env.meanPhyto() / PHYTO.CAP, 0, 1);
    const bloom = PLANKTON.RATE_BASE * area * algae;
    for (let n = poissonish(bloom * dt); n > 0 && this.plankton.length < planktonCap; n--) this.plankton.push(this._mkPlankton());
    const planktonFloor = scaleCount(18);
    if (this.plankton.length < planktonFloor && algae > 0.03) for (let n = poissonish(12 * area * dt); n > 0 && this.plankton.length < planktonFloor; n--) this.plankton.push(this._mkPlankton());
    for (const p of this.plankton) {
      if (p.dead) continue;
      env.grazePhyto(p.x, p.baseY, PLANKTON.GRAZE * dt);                  // eat algae
      if (env.phytoAt(p.x, p.baseY) < PLANKTON.STARVE_AT && rand() < PLANKTON.STARVE * dt) { p.dead = true; continue; }  // starve
      if (env.cyanoAt(p.x, p.baseY) > CYANO.TOX_THRESH * CYANO.CAP && rand() < CYANO.TOX_ZOO * dt) { p.dead = true; continue; }  // cyanotoxin kills zooplankton in a dense scum (HAB)
      p.x += (p.vx + env.currentAt(p.x, p.baseY)) * dt;                   // own drift + wind & inflow→outflow current
      if (p.x < 4) { p.x = 4; p.vx = Math.abs(p.vx); } else if (p.x > W - 4) { p.x = W - 4; p.vx = -Math.abs(p.vx); }
      p.baseY = clamp(p.baseY, 10, bedY(p.x) - 6);                        // ride up the sloping bed; don't drift into the sediment
      p.y = p.baseY + Math.sin(env.t * 6.28 + p.phase) * 3.2;
    }
    // mussels filter phytoplankton from the water just above the bed → clearer water
    for (const m of this.mussels) env.grazePhyto(m.x, m.y - 12, MUSSEL.FILTER * m.n * 0.25 * dt);

    // detritus sinks to the bed & dissolves into DOM (the microbial loop then decomposes it gradually —
    // temperature- & O₂-gated — releasing the bound N+P back to the inorganic pools, instead of an instant dump)
    for (const d of this.detritus) {
      if (d.dead) continue;
      d.y = Math.min(bedY(d.x), d.y + DETRITUS.SINK * dt); d.life -= dt;
      if (d.life <= 0) { d.dead = true; env.addDOM(d.x, d.y, NUTRIENT.FROM_DETRITUS); }
    }

    // aquatic insects — a CROSS-BOUNDARY life cycle. Benthic LARVAE recruit from the detritus pool (detritivores),
    // develop with WARMTH, are eaten by bottom fish, and when mature + warm EMERGE as surface adults (a pulsed, seasonal
    // hatch); surface adults drift, are eaten by surface fish, and an uneaten one lays an egg (→ a larva) before it expires.
    const larvaCap = scaleCount(INSECT.LARVA_CAP);
    const detAvail = clamp(this.detritus.length / (scaleCount(DETRITUS.CAP) * 0.6), 0, 1);   // detritus availability → larval recruitment
    for (let n = poissonish(INSECT.LARVA_RATE * area * (0.3 + 0.7 * detAvail) * dt); n > 0 && this.larvae.length < larvaCap; n--) this.larvae.push(this._mkLarva());
    const devF = clamp((env.tempC - INSECT.DEV_TEMP_MIN) / (INSECT.DEV_TEMP_OPT - INSECT.DEV_TEMP_MIN), 0, 1);   // warmth drives development
    const canHatch = env.tempC > INSECT.HATCH_TEMP, insectCap = scaleCount(INSECT.ADULT_CAP);
    for (const L of this.larvae) {
      if (L.dead) continue;
      L.dev += INSECT.DEV_RATE * devF * dt;
      if (L.dev >= 1 && canHatch) { L.dead = true; if (this.insects.length < insectCap) this.insects.push(this._mkInsect(L.x)); }   // EMERGE: larva → surface adult
    }
    for (const I of this.insects) {
      if (I.dead) continue;
      I.life -= dt;
      I.x += (I.vx + env.currentAt(I.x, I.y)) * dt;                       // drift on its own motion + the surface current
      if (I.x < 4) { I.x = 4; I.vx = Math.abs(I.vx); } else if (I.x > W - 4) { I.x = W - 4; I.vx = -Math.abs(I.vx); }
      if (I.life <= 0) { I.dead = true; if (rand() < INSECT.EGG && this.larvae.length < larvaCap) this.larvae.push(this._mkLarva(I.x, 0)); }   // an uneaten adult lays an egg → a larva
    }

    // benthic INVERTEBRATES — grazing SNAILS + omnivorous CRAYFISH. Both are particle populations on the bed whose
    // recruitment tracks their food base (snails ∝ the algae base; crayfish ∝ the detritus rain — like the insect
    // larvae), logistic toward a cap. They crawl the bed, are eaten by fish opportunistically (no dedicated brain
    // sense), and close two benthic web links: phyto→snail→{sunfish,carp,crayfish} and detritus→crayfish→{bass,pike,catfish}.
    const snailCap = scaleCount(SNAIL.CAP), snailFloor = scaleCount(SNAIL.FLOOR);
    for (let n = poissonish(SNAIL.RATE * area * algae * clamp(1 - this.snails.length / snailCap, 0, 1) * dt); n > 0 && this.snails.length < snailCap; n--) this.snails.push(this._mkSnail());
    if (this.snails.length < snailFloor && algae > 0.03) for (let n = poissonish(6 * area * dt); n > 0 && this.snails.length < snailFloor; n--) this.snails.push(this._mkSnail());
    for (const s of this.snails) {
      if (s.dead) continue;
      env.grazePhyto(s.x, s.y - 4, SNAIL.GRAZE * dt);                                          // scrape periphyton (≈ the phyto field just above the bed)
      if (env.phytoAt(s.x, s.y - 4) < SNAIL.FOOD_AT && rand() < SNAIL.STARVE * dt) { s.dead = true; continue; }   // starve where the algae is depleted (overgrazing self-limits)
      if (rand() < SNAIL.SENESCE * dt) { s.dead = true; continue; }                            // background turnover
      s.x += s.vx * dt; if (s.x < 4) { s.x = 4; s.vx = Math.abs(s.vx); } else if (s.x > W - 4) { s.x = W - 4; s.vx = -Math.abs(s.vx); }
      s.y = bedY(s.x) - 2;                                                                      // ride the sloping bed
    }
    this.snailGrid.rebuild(this.snails);   // built here (snails don't move again this step) so crayfish + fish can query it
    const crayCap = scaleCount(CRAYFISH.CAP), nightF = 1 + (CRAYFISH.NIGHT - 1) * (1 - env.light);  // crepuscular: more active at night
    for (let n = poissonish(CRAYFISH.RATE * area * detAvail * clamp(1 - this.cray.length / crayCap, 0, 1) * dt); n > 0 && this.cray.length < crayCap; n--) this.cray.push(this._mkCray());
    for (const cf of this.cray) {
      if (cf.dead) continue;
      if (rand() < CRAYFISH.SENESCE * dt) { cf.dead = true; continue; }
      const cv = this.nearestCover(cf.x, cf.y, 300);                                            // refuge-seeking: steer the crawl toward the nearest cover
      if (cv && Math.abs(cv.x - cf.x) > 6) cf.vx += Math.sign(cv.x - cf.x) * CRAYFISH.COVER_PULL * CRAYFISH.CRAWL * dt;
      cf.vx = clamp(cf.vx, -CRAYFISH.CRAWL, CRAYFISH.CRAWL);
      cf.x += cf.vx * nightF * dt; if (cf.x < 4) { cf.x = 4; cf.vx = Math.abs(cf.vx); } else if (cf.x > W - 4) { cf.x = W - 4; cf.vx = -Math.abs(cf.vx); }
      cf.y = bedY(cf.x) - 2;
      if (rand() < CRAYFISH.SNAIL_HUNT * nightF * dt) this._takeNearest(this.snailGrid, cf.x, cf.y, CRAYFISH.EAT_R);   // prey on a nearby snail (snail population control)
    }
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
        p.height = Math.min(p.maxHeight, p.height + grow);
        env.takeNutrient(p.x, p.baseY, NUTRIENT.PLANT_UPTAKE * grow);
      }
      // autumn/winter senescence: die back toward the overwintering rootstock; shed biomass dissolves into the DOM pool
      // (the realistic fall organic-matter pulse the microbial loop then remineralizes). Floors at the WINTER_MIN rootstock
      // (which grazing can't remove either), so the perennial regrows in spring — only light-starvation kills it.
      if (vigor < 1 && p.height > PLANT.WINTER_MIN) {
        const shed = Math.min(p.height - PLANT.WINTER_MIN, PLANT.SENESCE * (1 - vigor) * p.height * dt);
        p.height -= shed;
        env.addDOM(p.x, p.baseY, shed * PLANT.BIOMASS_PER_PX * PLANT.SENESCE_TO_DOM);
      }
      p.biomass = p.height * PLANT.BIOMASS_PER_PX; p.y = p.baseY - p.height * 0.5;
      // death is now LIGHT-starvation, not grazing: a macrophyte whose RUNNING-MEAN light is below its light tolerance (too
      // deep / too turbid / too shaded to photosynthesize) uproots over time → the realistic depth limit + the seed of the
      // clear↔turbid feedback (forms differ: turbidity-sensitive chara needs clear water, shade-tolerant milfoil persists
      // deep). Judged on the daily mean, so night is not starvation; rootstock is grazing- & winter-proof → beds persist.
      if (p.lightAvg < p.lightMin && rand() < PLANT.SHADE_DEATH * dt) { p.dead = true; env.addDOM(p.x, p.baseY, p.height * PLANT.BIOMASS_PER_PX * PLANT.SENESCE_TO_DOM); }   // a light-starved plant DECOMPOSES → DOM (mass-conserving; was a silent nutrient leak the microbial loop now reclaims)
    }
    // recruitment is seasonal too — new plants establish mostly in the warm growing season (vigor off the surface temp)
    const seedVigor = clamp((env.tempC - PLANT.GROW_TEMP_MIN) / tWin, 0, 1);
    const plantCap = scaleCount(PLANT.MAX);
    if (plantCount < plantCap) for (let n = poissonish(PLANT.SEED_RATE * area * seedVigor * dt); n > 0 && plantCount < plantCap; n--) {
      const x = plantX();
      // local seed dispersal: a seedling inherits (mutated) the genes of the nearest established plant; an isolated
      // seed (sparse deep, or cold-start) founds with fresh genes → heredity where beds exist, colonisation elsewhere.
      const near = this.nearestPlant(x, bedY(x) - 10, 240);   // unscaled: seed dispersal is not a fish's visual sense
      const sd = newPlant(x, false, near ? near.item : null);
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
    this.planktonGrid.rebuild(this.plankton);
    this.detritusGrid.rebuild(this.detritus);
    this.larvaeGrid.rebuild(this.larvae);
    this.insectGrid.rebuild(this.insects);

    // counts + clear mating flags
    const counts = this._counts = {}; for (const k of SPECIES) counts[k] = 0;
    for (const a of this.agents) { if (!a.dead) counts[a.species]++; a._mated = false; }

    // seasonal spawning: per-species breeding multiplier, peaking at SP.spawnPeak (a year-fraction) and tapering to
    // SPAWN.FLOOR off-season → a spring/early-summer baby boom (pike earliest). Computed once per step (same for all).
    const yf = env.yearFrac(), spawnF = {};
    for (const k of SPECIES) {
      const d = Math.abs(((yf - SP[k].spawnPeak + 1.5) % 1) - 0.5);          // angular distance to the peak, [0,0.5]
      spawnF[k] = SPAWN.FLOOR + (1 - SPAWN.FLOOR) * Math.pow(Math.cos(d * Math.PI), SPAWN.SHARP);  // 1 at peak → FLOOR a half-year off
    }

    const newborns = [];
    for (const a of this.agents) {
      if (a.dead) continue;
      const sp = a.sp;
      a.age += dt; a.mateCd -= dt; a.grow = clamp(0.35 + 0.65 * (a.age / sp.matureAge), 0.35, 1);

      sp.senses(a, this);
      // INTERNAL DRIVES (motivation): persistent per-fish state fed back as the last two brain inputs, so behaviour is
      // state-dependent (the NN learns to use them — emergent). HUNGER accrues with time since a meal (sated in the feed
      // step below); FEAR jumps to the nearest-threat proximity and decays after it leaves (lingering caution). The brain
      // wires these to its gated actions (a starving fish gambles on a strike; a scared one hides/flees).
      const drv = this.qThreat(a), threatNear = drv ? clamp(1 - drv.dist / (a.senseRange * 1.1), 0, 1) : 0;
      a.fear = Math.max(threatNear, a.fear * Math.exp(-DRIVE.FEAR_DECAY * dt));
      a.hunger = clamp(a.hunger + DRIVE.HUNGER_GAIN * dt, 0, 1);
      // SPATIAL COGNITION (allocentric sense of place & direction): a COMPASS (sin/cos of the absolute body heading) +
      // a HOME bearing (signed horizontal displacement to the natal site, normalised by lake width). Written into the
      // spatial block [base, base+1, base+2] (drives stay in the last two slots). Pure functions of sim state → deterministic.
      const sb = sp.baseInputs; if (a.homeX === undefined) a.homeX = a.x;   // older saves lacking homeX home to their current spot
      a.act.in[sb] = Math.sin(a.heading); a.act.in[sb + 1] = Math.cos(a.heading);
      a.act.in[sb + 2] = clamp((a.homeX - a.x) / W, -1, 1);   // >0 ⇒ home is to the right; the substrate for evolved homing/site-fidelity/migration
      // RICHER PERCEPTION: lateral-line flow (mechanosensory → NOT clarity-scaled, works when vision fails) + prey-size selectivity (piscivores)
      a.act.in[sb + 3] = clamp(env.currentAt(a.x, a.y) / 12, -1, 1);   // signed local current (rheotaxis); the turbidity-proof sense
      let preySz = 0; if (sp.diet.fish) { const pr = this.qPrey(a); if (pr) preySz = clamp(effSize(pr.item) / Math.max(effSize(a), 1e-3), 0, 1); }
      a.act.in[sb + 4] = preySz;   // relative size of the nearest CATCHABLE prey (0 = none / not a piscivore) → evolved prey-size selectivity
      a.act.in[sp.shape.in - 2] = a.hunger; a.act.in[sp.shape.in - 1] = a.fear;
      if (!a.lw) a.lw = Float32Array.from(a.g);   // older saves lack the plastic copy → derive it from the genotype
      forward(a.lw, a.act.in, a.act, sp.shape, a.activeHid);   // run the PLASTIC policy (lifetime learning), with only `activeHid` hidden units active (evolvable brain size)
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
      if (IN) {
        const bedX = bedY(a.x), prefY = clamp(IN.homeDepth * bedX, 8, bedX - 8), vBias = clamp((prefY - a.y) / 120, -1, 1);
        if (Math.abs(vBias) > 0.05) {
          const desired = Math.atan2(vBias, Math.cos(a.heading) >= 0 ? 0.7 : -0.7);   // keep heading-ish, bias toward home depth
          a.heading += angDiff(desired, a.heading) * a.maxTurn * IN.depthPull * Math.abs(vBias) * dt;
        }
        // ease activity toward the species' cruise norm — nocturnal species (catfish) crank it up at night
        // and rest by day (surface time-of-day drives diel activity, not the fish's local depth light)
        const cruiseT = IN.nocturnal ? IN.cruise * (1.5 - env.light) : IN.cruise;
        thrust += (cruiseT - thrust) * IN.weight * 0.5;
        // schooling: gently steer toward the local shoal's centroid (cohesion) → loose, realistic schools
        if (IN.school) {
          const al = this.allyStats(a, 56);
          if (al.density > 0.05) a.heading += clamp(Math.atan2(al.cohSin, al.cohCos), -1.2, 1.2) * a.maxTurn * IN.school * al.density * dt;
        }
        // ambush: a lurker eases toward a near-still hold until prey comes CLOSE (sensor[2] = 'prey near'),
        // then bursts. A weighted BLEND (not a hard clamp) so a strongly-committed evolved brain can still
        // override the lurk reflex — i.e. the NN modulates this like every other innate term.
        if (IN.ambush && (a.act.in[2] || 0) < 0.45) thrust += (IN.cruise * 0.45 - thrust) * (IN.ambushW || 0.6);
        // cover-seeking: littoral/ambush fish migrate to the nearest cover (weed bed / reed / log) and hold
        // there — a pike lurks at a weed-bed edge, a sunfish hovers in the weeds. A gentle long-range
        // attractor that eases off once at cover; the NN can override to chase or roam.
        if (IN.cover) {
          const cv = this.nearestCover(a.x, a.y, 280);
          if (cv) { const d = Math.hypot(cv.x - a.x, cv.y - a.y); if (d > 14) a.heading += angDiff(Math.atan2(cv.y - a.y, cv.x - a.x), a.heading) * a.maxTurn * IN.cover * clamp(d / 200, 0.2, 1) * dt; }
        }
      }

      // ---- brain-GATED ACTIONS: the fish DECIDES (beyond steer+thrust) to STRIKE-lunge / FLEE-sprint / HIDE-freeze ----
      // Continuous "intents" (sigmoid outputs), not a hard argmax: evolution searches a smooth landscape, and the three
      // trade off through their EFFECTS — hide suppresses the very thrust strike/flee demand, and strike/flee cost energy
      // — so a brain can't usefully raise all three. The NN learns WHEN to fire each from its prey/threat/energy senses;
      // strike's reach + hide's concealment live in takePrey(). Deterministic (no RNG). Inert at the OFF baseline.
      const aStrike = a.act.strike, aFlee = a.act.flee, aHide = a.act.hide;
      const burst = Math.max(ACTION.STRIKE_BURST * aStrike, ACTION.FLEE_BURST * aFlee);
      thrust = (thrust + (1 - thrust) * burst) * (1 - ACTION.HIDE_STILL * aHide);   // lunge/sprint drive thrust up; a freeze holds still
      const capMul = 1 + ACTION.BURST_SPEED * Math.max(aStrike, aFlee);             // a sprint briefly exceeds cruise speed
      // a committed hide darts the fish to the nearest cover and holds there (anti-predator); only a strong hide steers
      if (aHide > ACTION.GATE) { const cv = this.nearestCover(a.x, a.y, 260); if (cv) { const d = Math.hypot(cv.x - a.x, cv.y - a.y); if (d > 10) a.heading += angDiff(Math.atan2(cv.y - a.y, cv.x - a.x), a.heading) * a.maxTurn * ACTION.HIDE_COVER * aHide * dt; } }
      a.energy -= (ACTION.STRIKE_COST * aStrike + ACTION.FLEE_COST * aFlee) * dt;   // bursts are metabolically expensive
      // burst-and-coast: pulse the delivered thrust around the intent (a ZERO-MEAN cosine → the cycle-average ≈ the
      // intent, so it's ~balance-neutral) so a cruising fish SURGES then GLIDES instead of holding steady thrust; the
      // momentum model carries it through each glide. Gated to cruising — suppressed during a flee/strike sprint (flat-out)
      // and when barely swimming. Deterministic (stroke advanced by dt; per-fish phase offset, no RNG).
      if (a.stroke === undefined) a.stroke = (a.id * 0.1366) % 1;
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
      a.x += Math.cos(a.velHeading) * a.spd * dt + env.currentAt(a.x, a.y) * sp.drift * dt;  // move along the (lagging) travel direction; + current
      a.y += Math.sin(a.velHeading) * a.spd * dt + sp.sink * dt;

      // side walls turn the fish around; the surface & curved bed make it GLIDE along the
      // boundary (heading eased toward horizontal) instead of bouncing — so bottom-dwellers
      // foraging on the bed swim smoothly along it rather than flip-flopping their heading.
      const bed = bedY(a.x), mvx = Math.cos(a.velHeading) * a.spd, INTO = 1.5, glide = Math.min(1, 9 * dt);
      if (a.x < 1) { a.x = 1; if (mvx < -INTO) { a.heading = Math.PI - a.heading; a.velHeading = Math.PI - a.velHeading; a.spd *= 0.86; a.energy -= 0.006; } }
      else if (a.x > W - 1) { a.x = W - 1; if (mvx > INTO) { a.heading = Math.PI - a.heading; a.velHeading = Math.PI - a.velHeading; a.spd *= 0.86; a.energy -= 0.006; } }
      const horiz = Math.cos(a.heading) >= 0 ? 0 : Math.PI;
      if (a.y < 1) { a.y = 1; if (Math.sin(a.heading) < 0) { a.heading += angDiff(horiz, a.heading) * glide; a.spd *= 0.985; } }
      else if (a.y > bed) { a.y = bed; if (Math.sin(a.heading) > 0) { a.heading += angDiff(horiz, a.heading) * glide; a.spd *= 0.985; } }

      // metabolism (temperature at this fish's depth × its gene-derived metabolic cost) + thermal stress + hypoxia
      a.energy -= (sp.metabolism * a.metabMul * env.metabAt(a.x, a.y) + sp.moveCost * thrust + sp.turnCost * Math.abs(turn)) * dt;
      // cyanotoxin (HAB): a DENSE cyanobacteria surface scum poisons fish — extra energy drain where the local cyano is
      // above the toxic threshold (the scum is buoyant, so this mainly hits surface fish). A bloom can kill by poison.
      const cyTox = env.cyanoAt(a.x, a.y) - CYANO.TOX_THRESH * CYANO.CAP;
      if (cyTox > 0) a.energy -= CYANO.TOXIN * cyTox * dt;
      // contaminant body burden: gill uptake of the dissolved toxicant − SLOW first-order excretion (dietary intake &
      // prey-burden assimilation are added in the feed step below). TOX.AMBIENT = 0 (a clean lake) ⇒ this is 0 → inert.
      a.tox += (TOX.GILL * TOX.AMBIENT - TOX.EXCRETE * a.tox) * dt;
      // thermal stress: drain rises outside the fish's tolerance band (sp.tempOpt ± its a.tempTol gene) →
      // warm/cool guilds + the summer temperature–O₂ squeeze (cool fish can't use the warm surface NOR the hypoxic deep)
      const tStress = Math.max(0, Math.abs(env.tempAt(a.x, a.y) - sp.tempOpt) - a.tempTol);
      if (tStress > 0) a.energy -= ENV.THERMAL_STRESS * tStress * dt;
      // hypoxia: each fish has its own critical O₂ (a.o2Crit gene-modified); below it energy drains, worse when severe
      const o2 = this.oxygenAt(a.x, a.y);
      if (o2 < a.o2Crit) { const def = (a.o2Crit - o2) / a.o2Crit; a.energy -= ENV.HYPOXIA_PENALTY * def * (o2 < ENV.HYPOXIA_SEVERE ? 2.5 : 1) * dt; }

      // feeding by diet
      const cap = sp.energyCap, eaten0 = a.eaten;   // (eaten0: meals before this step → sate the hunger drive after, if the fish fed)
      if (sp.diet.fish) { const prey = this.takePrey(a); if (prey) { a.energy = Math.min(cap, a.energy + sp.foodValueFish * effSize(prey)); a.eaten++; this.stats.fishEaten++; } }   // (takePrey transfers the prey's contaminant burden → biomagnification)
      // HANDLING TIME (FEED.HANDLE): one discrete item per food type per HANDLE s — `slots` items this step (1 at the
      // browser's 1/60 step, 2 at the headless 1/30), so intake per SECOND doesn't depend on dt. Continuous grazing (the
      // phyto fallback, plant bites) is a per-second rate × dt and counts `slots` meals. The remainder is transient
      // (always 0 at 1/60 and 1/30 → nothing to persist). Deterministic (no RNG).
      a.feedAcc = (a.feedAcc || 0) + dt / FEED.HANDLE;
      const slots = Math.floor(a.feedAcc + 1e-9); a.feedAcc = Math.max(0, a.feedAcc - slots);
      let k;
      // juvenile piscivores subsist on zooplankton until they can reliably hunt fish (so lineages survive)
      if (sp.diet.fish && a.grow < 0.55 && (k = this._takeNearest(this.planktonGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, PLANKTON.ENERGY * 0.8);
      let atePlankton = false;
      if (sp.diet.plankton && (k = this._takeNearest(this.planktonGrid, a.x, a.y, sp.eatRadius, slots))) { this._ate(a, k, PLANKTON.ENERGY); atePlankton = true; }
      // planktivore facultative omnivory: when a hungry planktivore finds no zooplankton it grazes the
      // phytoplankton field directly. This lets minnow/sunfish SELF-SUSTAIN through the boom-bust trough
      // (cushioning the crash + the predators above it → much less immigration dependence). The grazed amount is
      // kept small with an efficient conversion so it feeds the fish without scouring the phyto base into the ground.
      // A per-SECOND rate × dt (was per step → twice the grazing per second in the browser as headless).
      if (sp.diet.plankton && !atePlankton && a.energy < cap * 0.85) {
        const g = env.grazePhyto(a.x, a.y, PLANKTON.FALLBACK_GRAZE * dt);
        if (g > PLANKTON.FALLBACK_MIN * dt) { this._ate(a, slots, 0); a.energy = Math.min(cap, a.energy + g * PLANKTON.FALLBACK_VALUE); }
      }
      if (sp.diet.detritus && (k = this._takeNearest(this.detritusGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, DETRITUS.ENERGY);
      if (sp.diet.larva && (k = this._takeNearest(this.larvaeGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, INSECT.LARVA_ENERGY);      // bottom fish graze benthic insect larvae
      if (sp.diet.insect && (k = this._takeNearest(this.insectGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, INSECT.ADULT_ENERGY);   // surface fish rise to emerged insects
      if (sp.diet.snail && (k = this._takeNearest(this.snailGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, SNAIL.ENERGY);            // molluscivores (sunfish/carp) graze benthic snails
      if (sp.diet.cray && (k = this._takeNearest(this.crayGrid, a.x, a.y, sp.eatRadius, slots))) this._ate(a, k, CRAYFISH.ENERGY);           // predators (bass/pike/catfish) eat benthic crayfish
      if (sp.diet.plants) { const g = this.bitePlant(a, dt); if (g > 0) { this._ate(a, slots, 0); a.energy = Math.min(cap, a.energy + g); } }   // per-second grazing (PLANT.BITE_RATE × dt)
      if (a.eaten > eaten0) a.hunger = clamp(a.hunger - DRIVE.SATE * (a.eaten - eaten0), 0, 1);   // a meal sates the hunger drive
      // LIFETIME LEARNING: a reward-modulated Hebbian nudge to the PLASTIC policy (a.lw) — reinforce the action just taken
      // when the fish ATE; a homeostatic decay (runs every step) pulls it back toward the inherited genotype a.g. Baldwinian
      // (a.g untouched → offspring inherit the evolved brain, not the learned weights). Deterministic (no RNG).
      reinforce(a.lw, a.g, sp.shape, a.act, a.eaten > eaten0 ? 1 : 0, dt, LEARN.RATE, LEARN.DECAY, LEARN.CLAMP);

      // sexual reproduction (crossover + mutation). Density-dependence is now LOGISTIC: the chance of breeding
      // when eligible tapers smoothly to 0 as the species approaches its carrying capacity K (= popMax) —
      // rand() < (1 − N/K) — so the population self-limits at K instead of hitting a hard cap (and the boom is damped).
      if (a.age >= sp.matureAge && a.energy >= sp.reproEnergy && a.mateCd <= 0 && !a._mated &&
          (this.agents.length + newborns.length) < WORLD.GLOBAL_MAX && rand() < clamp(1 - counts[a.species] / popMax(sp), 0, 1) * spawnF[a.species] * toxFecundity(a.tox)) {   // contaminated fish breed less (sub-lethal); inert at tox=0
        const m = this.chooseMate(a);
        if (m) {
          // sexual: crossover of both parents' genomes + mutation (partner chosen by trait/condition).
          // CLUTCH (condition-dependent fecundity): a well-fed pair produces SEVERAL young — real fish are highly
          // fecund, which is what lets the slow-maturing larger species self-sustain. Each young costs BOTH parents
          // reproCost, so the brood is bounded by the leaner parent's energy (only well-fed fish afford a big clutch),
          // by the species' `clutch` max, and by the global headroom (never overshoots the cap). The logistic gate
          // above already throttles breeding near K, so clutches mostly accelerate sparse-population recovery.
          const b = m.item;
          a.mateCd = sp.matingCooldown; b.mateCd = sp.matingCooldown; a._mated = true; b._mated = true;
          const dh = ((b.hue - a.hue + 540) % 360) - 180;
          const headroom = WORLD.GLOBAL_MAX - (this.agents.length + newborns.length);
          const clutch = Math.max(1, Math.min(sp.clutch, Math.floor(Math.min(a.energy, b.energy) / sp.reproCost), headroom));
          for (let ci = 0; ci < clutch; ci++) {
            a.energy -= sp.reproCost; b.energy -= sp.reproCost;
            const childHue = (a.hue + dh * 0.5 + gauss() * 5 + 360) % 360, bp = broodPos((a.x + b.x) / 2, (a.y + b.y) / 2);
            const child = makeAgent(a.species, bp.x, bp.y,
              sp.childEnergy, Math.max(a.gen, b.gen) + 1, childHue, mutate(crossover(a.g, b.g)), 0, mutateGenes(crossoverGenes(a.genes, b.genes)));
            counts[a.species]++; newborns.push(child); child.bornSexual = true; this.stats.births[a.species]++; if (child.gen > this.maxGen) this.maxGen = child.gen;
          }
        } else {
          // asexual budding fallback (no mate found): keeps sparse populations EVOLVING. The gate
          // is density-aware — a sparse species (e.g. apex predators near their floor) buds at the
          // normal reproEnergy so its learned brain actually reproduces instead of being frozen and
          // replaced by re-seeds; a dense species needs the old higher surplus. It buds a SMALLER clutch
          // (single parent) so a mate-less apex still gets a recruitment boost, not just one bud.
          const sparse = counts[a.species] < popMax(sp) * 0.5;
          if (a.energy >= (sparse ? sp.reproEnergy : sp.reproEnergy * 1.25)) {
            a.mateCd = sp.matingCooldown; a._mated = true;
            // a lone parent pays the WHOLE cost of each young — what the two sexual parents pay together (2·reproCost),
            // and never less than the energy the child is born with — so budding can't create energy (it used to cost
            // reproCost×1 for a childEnergy ≈ 2·reproCost child: a free-energy pump).
            const costMul = sparse ? 1.0 : 1.3, budCost = Math.max(2 * sp.reproCost, sp.childEnergy) * costMul;
            const headroom = WORLD.GLOBAL_MAX - (this.agents.length + newborns.length);
            const clutch = Math.max(1, Math.min(Math.ceil(sp.clutch / 2), Math.floor(a.energy / budCost), headroom));
            for (let ci = 0; ci < clutch; ci++) {
              a.energy -= budCost;
              const bp = broodPos(a.x, a.y);
              const child = makeAgent(a.species, bp.x, bp.y,
                sp.childEnergy, a.gen + 1, (a.hue + gauss() * 6 + 360) % 360, mutate(a.g), 0, mutateGenes(a.genes));
              counts[a.species]++; newborns.push(child); this.stats.births[a.species]++; if (child.gen > this.maxGen) this.maxGen = child.gen;
            }
          }
        }
      }

      // death -> linger as a fading, sinking body (then recycle as detritus). Eaten fish are
      // removed by takePrey() instead, so this is natural death (starvation / old age) only.
      if (!(a.energy > 0) || a.age > sp.maxAge || (a.tox > TOX.HARM && rand() < TOX.MORT * (a.tox - TOX.HARM) * dt)) {   // contaminant mortality above the harm threshold (apex predators, which biomagnify, are hit hardest)
        a.dead = true; counts[a.species]--;
        if (a.id === this.selectedId) this.selectedId = null;
        this.corpses.push({ sp, species: a.species, x: a.x, y: a.y, heading: a.heading, rHeading: a.rHeading ?? a.heading,
          size: a.size, grow: a.grow, hue: a.hue, genes: a.genes, facing: a.facing ?? 1, spd: a.spd, t: DEATH_FADE, t0: DEATH_FADE, roll: 0, sink: 5 + a.size * 2, dead: false });
      }
    }

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
        const src = this._bestOf(key), use = src && rand() < IMMIGRATION.FROM_BEST;
        const fromLeft = rand() < 0.5, ex = fromLeft ? rand(2, 28) : rand(W - 28, W - 2);
        // immigrants from connected waters arrive as grown adults carrying the source's learned brain AND its evolved
        // trait genes (consistent with the home-bred paths); a fresh random newcomer when the species is locally extinct.
        const f = makeAgent(key, ex, zoneY(sp, ex), rand(sp.startEnergy[0], sp.startEnergy[1]),
          use ? src.gen : 0, use ? (src.hue + gauss() * 8 + 360) % 360 : sp.randomHue(rand),
          use ? mutate(src.g) : randomGenome(sp.shape), rand(sp.matureAge, sp.matureAge * 1.8),
          use ? mutateGenes(src.genes) : null);
        f.heading = fromLeft ? rand(-0.6, 0.6) : Math.PI + rand(-0.6, 0.6);
        f.immigrant = true; counts[key]++; liveTotal++; newborns.push(f); this.stats.immigrants[key]++;
        if (f.gen > this.maxGen) this.maxGen = f.gen;
      };
      // quasi-extinction refuge: a tiny last-resort backstop so a species never literally vanishes (≪ the old floor)
      while (counts[key] < IMMIGRATION.REFUGE && liveTotal < WORLD.GLOBAL_MAX) immigrate();
      // rarity rescue: a stochastic trickle, engaging only when genuinely rare, tapering to 0 at RESCUE_N
      const deficit = 1 - counts[key] / IMMIGRATION.RESCUE_N;
      if (deficit > 0 && liveTotal < WORLD.GLOBAL_MAX && rand() < IMMIGRATION.RATE * deficit * dt) immigrate();
    }

    // compact arrays
    this.agents = this.agents.filter(a => !a.dead).concat(newborns);
    this.plankton = this.plankton.filter(p => !p.dead);
    this.detritus = this.detritus.filter(d => !d.dead);
    this.larvae = this.larvae.filter(l => !l.dead);
    this.insects = this.insects.filter(i => !i.dead);
    this.snails = this.snails.filter(s => !s.dead);
    this.cray = this.cray.filter(c => !c.dead);
    this.plants = this.plants.filter(p => !p.dead);
    this.corpses = this.corpses.filter(c => !c.dead);

    // time-series sample
    this._seriesAcc += dt;
    if (this._seriesAcc >= 1) {
      this._seriesAcc -= 1;
      const c = this.census();
      this.series.push({ ...c, o2: this.avgO2(), temp: env.tempNorm, light: env.light, phyto: env.meanPhyto(), cyano: env.meanCyano(), dom: env.meanDOM(), zoo: this.plankton.length });
      if (this.series.length > 200) this.series.shift();
    }
  }

  _bestOf(key) { let best = null, bv = -1; for (const a of this.agents) { if (a.dead || a.species !== key) continue; const v = a.eaten / Math.max(a.age, 1); if (v > bv) { bv = v; best = a; } } return best; }
  topPerformer() { let best = null, bv = -1; for (const a of this.agents) { const v = a.eaten / Math.max(a.age, 1); if (v > bv) { bv = v; best = a; } } return best; }
  census() { const c = {}; for (const k of SPECIES) c[k] = 0; for (const a of this.agents) c[a.species]++; return c; }
  avgO2() { const f = this.env.o2; let s = 0; for (let i = 0; i < f.length; i++) s += f[i]; return s / f.length; }
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
      // which nutrient is limiting growth in the lit littoral (the bloom controller)?
      limiting: e.meanDin() / (e.meanDin() + NUTRIENT.KN) < e.meanPhos() / (e.meanPhos() + NUTRIENT.KP) ? 'N' : 'P',
      phyto: e.meanPhyto(), secchi: e.secchiDepth(), clarity: e.clarity(), turbidity: e.turbidity, avgO2: this.avgO2(),
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
        // metapopulation dependence: fraction of all recruits since reset that arrived as rescue immigrants (vs home-bred)
        immFrac: (b + im) > 0 ? im / (b + im) : 0,
        // zonation: littoral (near a shore) vs profundal (deep middle) vs pelagic (open mid-water)
        littoral: ag.filter(a => a.x < W * BASIN.SHELF_FRAC || a.x > W * (1 - BASIN.SHELF_FRAC)).length,
        deep: ag.filter(a => a.y > bedY(a.x) * 0.7).length,
      };
    }
    return out;
  }
  // standing biomass (~ summed effective size) grouped by trophic role, plus the producer/zoo base
  biomassByTrophic() {
    const out = { phytoplankton: this.env.meanPhyto(), cyanobacteria: this.env.meanCyano(), macrophyte: this.plants.reduce((s, p) => s + (p.dead ? 0 : p.biomass), 0), zooplankton: this.plankton.reduce((s, p) => s + (p.dead ? 0 : 1), 0) * 0.02,
      snail: this.snails.reduce((s, p) => s + (p.dead ? 0 : 1), 0) * 0.05, crayfish: this.cray.reduce((s, p) => s + (p.dead ? 0 : 1), 0) * 0.4 };   // benthic invertebrates (count × a nominal mass)
    for (const a of this.agents) { const m = a.size * (0.6 + 0.4 * (a.grow ?? 1)); out[a.sp.trophic] = (out[a.sp.trophic] || 0) + m; }
    return out;
  }
  // live counts of the non-fish biota (the resource base + benthic inverts) — for the food-web dashboard
  resourceCounts() {
    const live = arr => arr.reduce((s, x) => s + (x.dead ? 0 : 1), 0);
    return {
      zooplankton: live(this.plankton), larvae: live(this.larvae), insects: live(this.insects),
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
    const a = makeAgent(key, x, opts.y ?? zoneY(sp, x), rand(sp.startEnergy[0], sp.startEnergy[1]),
      src ? src.gen : 0, src ? (src.hue + gauss() * 6 + 360) % 360 : sp.randomHue(rand),
      opts.genome ? fitGenome(sp, opts.genome).g : (src ? mutate(src.g) : randomGenome(sp.shape)), rand(sp.matureAge, sp.matureAge * 1.8));
    this.agents.push(a); return a;
  }

  // ---------- save / load ----------
  // v24: a FAITHFUL RESUME — everything that shapes the future is saved, so load → step reproduces the uninterrupted run
  // byte-for-byte: the RNG stream position (`rng`), the per-world id counter (`nid`), each fish's id / mating cooldown /
  // smoothed controls / travel heading / stroke phase / last action intents / learned W2 block, the sinking corpses, the
  // benthic particles' y, and the env's cached means (see Environment.toJSON). Older saves still load on defaults.
  toJSON() {
    return {
      version: 24, W, H, time: this.time, maxGen: this.maxGen, stats: this.stats, rng: getRandState(), nid: this._nextId,
      env: this.env.toJSON(),
      agents: this.agents.map(a => {
        const HID = a.sp.shape.hid, W2 = a.sp.shape.in * HID + HID, act = a.act;
        return { s: a.species, x: a.x, y: a.y, h: a.heading, sp: a.spd, e: a.energy, g: a.gen, hu: a.hue, ag: a.age, ea: a.eaten, w: Array.from(a.g), gn: Array.from(a.genes), m: Array.from(act.h), tx: a.tox, hg: a.hunger, fe: a.fear, hx: a.homeX,   // `m` recurrent memory; `tx` contaminant burden; `hg`/`fe` drives; `hx` natal home
          id: a.id, mc: a.mateCd, ts: a.turnSmooth, th: a.thrustSmooth, vh: a.velHeading, st: a.stroke,   // resume state (vh/st absent until first stepped)
          ac: [act.turn, act.thrust, act.strike, act.flee, act.hide],                                        // last action intents
          lw: a.lw ? Array.from(a.lw.subarray(W2, W2 + OUT * HID)) : undefined };                           // learned policy: only W2 can differ from `w`
      }),
      plants: this.plants.map(p => ({ x: p.x, b: p.baseY, h: p.height, m: p.maxHeight, v: p.v, g: Array.from(p.gn), hu: p.hue, la: p.lightAvg })),
      plankton: this.plankton.map(p => ({ x: p.x, y: p.baseY, ph: p.phase, vx: p.vx })),
      detritus: this.detritus.map(d => ({ x: d.x, y: d.y, l: d.life })),
      larvae: this.larvae.map(l => ({ x: l.x, y: l.y, d: l.dev })),
      insects: this.insects.map(i => ({ x: i.x, y: i.y, l: i.life, vx: i.vx, wb: i.wob })),
      snails: this.snails.map(s => ({ x: s.x, y: s.y, vx: s.vx, ph: s.ph })),
      cray: this.cray.map(c => ({ x: c.x, y: c.y, vx: c.vx, ph: c.ph })),
      corpses: this.corpses.map(c => ({ s: c.species, x: c.x, y: c.y, h: c.heading, rh: c.rHeading, sz: c.size, gr: c.grow, hu: c.hue, gn: Array.from(c.genes),
        fc: c.facing, sp: c.spd, t: c.t, t0: c.t0, r: c.roll, sk: c.sink })),
      reeds: this.reeds, logs: this.logs, mussels: this.mussels, weedbeds: this.weedbeds,
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
    this.agents = P.agents; this.plants = P.plants; this.plankton = P.plankton; this.detritus = P.detritus;
    this.larvae = P.larvae; this.insects = P.insects; this.snails = P.snails; this.cray = P.cray; this.corpses = P.corpses;
    this.reeds = P.structs.reeds; this.logs = P.structs.logs; this.mussels = P.structs.mussels; this.weedbeds = P.structs.weedbeds;
    if (P.rep.reseeded) this.stats.brainsReseeded = P.rep.reseeded;
    this._nextId = P.nextId; _idOwner = this;
    this.series = []; this._seriesAcc = 0; this.selectedId = null; this.lastLoad = P.rep;
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
        this.agents.push(makeAgent(k, p.x, zoneY(sp, p.x), rand(sp.startEnergy[0], sp.startEnergy[1]), gen,
          (hue + gauss() * 8 + 360) % 360, fit.reseeded ? randomGenome(sp.shape) : mutate(fit.g)));
        added++; if (fit.reseeded) reseeded++; if (gen > this.maxGen) this.maxGen = gen;
      }
    }
    return { added, reseeded };
  }
}

// Activate the stepping world's id counter (see nextAgentId) — a wrapper so the step() body itself stays untouched.
{ const rawStep = World.prototype.step; World.prototype.step = function (...args) { _idOwner = this; return rawStep.apply(this, args); }; }
