// fish3.js — the fish of the 3-D lakes (pure: no DOM; Node and browser). Stage 5, slice a: the agent core — founders at the
// real lakes' densities, 3-D senses and brains, innate habitat drives, movement, feeding on the water's fields and on each
// other, bioenergetics, hazards and death, lifetime learning. docs/HOT_BROOK_3D.md §4; the 2-D pipeline this ports is
// world.js (its formulas are kept where they carry over, with the 2-D clock's times ÷ TS).
//
// AGENTS. One brain per fish (pumpkinseed, brown bullhead, smallmouth bass, chain pickerel, white sucker) or per SCHOOL
// (yellow perch, white perch, golden shiner): a school agent carries n fish of one genome and one body record (length, mass,
// gut, gonads). The super-individual rules (Scheffer et al. 1995; research_notes/Whole lake 3D fish simulation/
// super_individuals.md): natural, heat, hypoxia and starvation losses take a FRACTION of n (real-valued; a school below one
// fish is gone); a strike on a school takes ONE fish; a school eats n fish's worth from the water around it, so crowding and
// competition come from the fish (Σ n × mass), never from agent counts; schools of one species and size merge (the merged
// school keeps one parent's genome, chosen ∝ n — never averaged weights) and split above twice their size.
//
// UNITS. Positions in world metres (x east, y north, z depth below the local water surface, down). Bodies, swimming speeds,
// senses and densities are REAL (fish per square metre at the real lakes' numbers), so a fish meets its school, its prey and
// its predators at real rates per second of its swimming; the lakes are 1/10 of their real size, and the PHYSIOLOGY runs on
// the calendar (a real day = DAY3 ≈ 9.9 s: CLOCK3). Feeding on the water's fields (zooplankton, the bed's worms and scuds) is a
// functional response to the local density — what a fish meets over the hours one sim second stands for — and its rates
// follow the day's light (lightDay), not the hour's: a two-minute day–night cycle stands for ~12 real days, each with its own
// days and nights. BEHAVIOUR follows the hour: where a fish chooses to be by day and by night, how active it is.
import { GEO, LAND, UPPER, LOWER, BODIES, cellIndex } from './geometry.js';
import { CLOCK3, TS, DAY3 } from './clock3.js';
import { A2 } from './chem3.js';
import { SP, SPECIES } from '../species.js';
import { rand, clamp, angDiff, randomGenes } from '../core.js';
import { cmax, respStd, routineActivity, wasteFractions, energyDensity, stdWeight, lengthFor, OXYCAL } from '../bioenergetics.js';
import { ENV, BIOE, PLANKTON, BENTHOS, PREY, FEED, LEARN, BRAIN, ACTION, SPAWN, TIME, ICE } from '../config.js';

const YEAR = CLOCK3.YEAR_LEN, DAY = DAY3, Y2 = TIME.YEAR_LEN;   // (the 2-D sim's ages and times are on its 1800-s year)
const LN2 = Math.LN2;

// ============================================================ tunables ===============================================
export const F3 = {
  HC: 4,                // m: the neighbour hash's cell (≥ the longest sense range in clear water)
  DECIDE_EVERY: 2,      // steps between a fish's decisions (senses → brain): 5 Hz at the 10-Hz step, staggered by id
  ALLY_R: 2.5,          // m: a fish counts its own kind within this
  DRAG: 1.4,            // /s: speed relaxes toward thrust × top speed at this rate
  PITCH_MAX: 0.6,       // rad: the steepest a fish climbs or dives
  PITCH_K: 1.5,         // rad of pitch per metre the fish is off its target depth (clamped)
  PITCH_RATE: 3,        // /s: pitch eases toward its target
  BRAIN_TURN: 0.6,      // the brain's turn command as a share of the turning rate (the innate drives steer the rest) …
  TURN_HP: 3,           // s: … less its running mean (a constant bias would circle)
  BRAIN_PITCH: 0.3,     // … and its pitch command as a share of PITCH_MAX
  HAB_W: 0.8,           // weight of steering back into the species' bottom-depth band (per metre outside it, ≤ 1)
  FORAGE_W: 0.9, PURSUIT_W: 1.6, FLEE_W: 2.2, COHERE_W: 0.6, HOME_W: 0.5, AVOID_W: 4,
  ESC_O2: 3, ESC_PITCH: 1.1,   // below ESC_O2 × its lethal O2 (or half its critical) a fish escapes upward at up to ESC_PITCH rad
  LOOK: 1.2,            // s of swimming it looks ahead for shallows and shore (at least 0.8 m)
  ZTOP: 0.08, ZBOT: 0.04,   // m of clearance under the surface and over the bed
  ICE_M: 0.35,          // m: the ice's thickness at full cover (fish stay under it)
  FEAR_DECAY: 0.5,      // /s (the 2-D sim's DRIVE.FEAR_DECAY — a moment-to-moment behaviour, not a calendar rate)
  // PISCIVORY: a predator's kill hazard is ATTACK × Σ over the catchable fish within its strike reach of (1 − d/R) × capture ×
  // the prey's vulnerability × size selection × concealment, a school counting n^SCHOOL_EXP (dilution and confusion: the
  // per-capita risk falls with school size — Turner & Pitcher 1986)
  ATTACK: 2.0, SCHOOL_EXP: 0.5,
  SHALLOW_REFUGE: 0.6,  // very shallow water hides small fish from gape-limited predators: cover = this × clamp((0.8 − bed)/0.6)
  BENTH_REACH: 0.35,    // m above the bed a fish feeds on it
  MERGE_EVERY: 10,      // steps between the schools' merge/split pass
  MERGE_R: 2.5, MERGE_LR: 1.2, MERGE_MAX: 1.6, SPLIT: 2,
};

// ============================================================ the species in 3-D ======================================
// Per species: school size (0 = individuals), the design census (fish ≥ 7.5 cm per hectare: docs/HOT_BROOK_3D.md §4),
// cruising and sprint speeds (body lengths/s), turning (rad/s), sense range (m, clear water, full light; nonVis the
// fraction kept in the dark — lateral line, smell), strike reach (m), cohesion with its own kind, home range (m).
// found: the founders' length as a share of the growth curve's (species.js vb is a prior from unstunted lakes; Maine's
// crowded white perch stay ~25–45 g and its yellow perch ~20 cm as adults — docs/HOT_BROOK_3D.md §4).
// tPref the temperature it seeks (°C). HAB: the habitat it chooses — the bottom depth it wants to be over (m; Upper's — in the
// shallower Lower a fish wanting deeper water finds the deepest there is), its place in the column (v 0: h m above the bed;
// 1: the fraction h of the column; 2: h m below the surface) and its activity (× cruise), by day, by night and in winter.
// Values: docs/research_notes/Whole lake 3D fish simulation/habitat3d.md §9 (sources per cell; cruising speeds the field's,
// sustain its 30-min speed and sprint its 3-s burst on the DFO fatigue curves — Katopodis & Gervais 2016).
const H = (bot, v, h, act) => ({ bot, v, h, act });
export const S3 = {
  // golden shiner: schools in the weedy shallows by day, out over open water at dusk to feed on the rising Daphnia (Hall 1979
  // via Reebs 1996), dispersed at night; deeper weed edges under ice
  minnow:     { school: 60, perHa: 430, cruise: 1.5, sprint: 12, sustain: 3.0, turn: 3.0, sense: 2.5, nonVis: 0.25, strikeR: 0, cohere: 0, home: 40, tPref: 25,
    hab: { day: H([0.5, 3.0], 0, 0.8, 0.8), night: H([2.0, 5.0], 2, 0.5, 0.3), winter: H([2.0, 3.5], 0, 0.3, 0.2) } },
  // pumpkinseed: within ~25-30 m (real) of shore in the weeds, pairs and small groups; rests by the bed in cover at night;
  // near-still below 8 °C (Reeve 2022)
  sunfish:    { school: 0, perHa: 215, cruise: 0.75, sprint: 9, sustain: 2.5, turn: 3.0, sense: 2.5, nonVis: 0.2, strikeR: 0, cohere: 0.2, home: 25, tPref: 28,
    hab: { day: H([0.3, 2.5], 0, 0.7, 0.7), night: H([0.3, 2.5], 0, 0.15, 0.35), winter: H([1.5, 3.5], 0, 0.25, 0.05) } },
  // yellow perch: schools of 50-200 over open mud and sand offshore by day; at dusk inshore along the bed, resting on it at night
  // (Imbrock 1996; Hasler & Bardach 1949); the deepest basin in midwinter, active by day under the ice; prefers 18-22 °C
  perch:      { school: 80, perHa: 860, found: 0.8, cruise: 0.75, sprint: 13, sustain: 2.6, turn: 2.6, sense: 3.0, nonVis: 0.2, strikeR: 0.6, cohere: 0, home: 60, tPref: 20,
    hab: { day: H([3.0, 5.5], 0, 0.7, 0.8), night: H([0.5, 2.5], 0, 0.1, 0.25), winter: H([3.9, 5.5], 0, 0.5, 0.4) } },
  // white sucker: loose groups on gentle flats, deep by day, inshore and active at night; the deep flats in winter
  sucker:     { school: 0, perHa: 30, cruise: 0.75, sprint: 10, sustain: 2.0, turn: 2.0, sense: 2.0, nonVis: 0.6, strikeR: 0, cohere: 0.2, home: 80, tPref: 18,
    hab: { day: H([2.5, 5.5], 0, 0.2, 0.5), night: H([0.5, 2.5], 0, 0.2, 0.8), winter: H([3.5, 5.5], 0, 0.2, 0.3) } },
  // brown bullhead: on the bed in soft weedy coves by day; out over the open mud flats once the light falls below ~1 lux, foraging
  // by taste and smell (Eriksson 1978); buried in the mud in winter
  catfish:    { school: 0, perHa: 140, cruise: 0.45, sprint: 7.5, sustain: 2.1, turn: 2.2, sense: 1.5, nonVis: 0.8, strikeR: 0, cohere: 0.2, home: 40, tPref: 28,
    hab: { day: H([0.5, 3.0], 0, 0.02, 0.1), night: H([0.3, 2.5], 0, 0.1, 0.6), winter: H([1.0, 4.0], 0, 0.0, 0.0) } },
  // white perch: schools offshore over level fine sediment by day, 0-2 m over the bed; onto the 0.9-1.5-m flats at night; the
  // open basin's deepest water under the ice, compact and roaming
  whiteperch: { school: 80, perHa: 800, found: 0.72, cruise: 1.0, sprint: 13, sustain: 2.6, turn: 2.6, sense: 3.0, nonVis: 0.25, strikeR: 0.5, cohere: 0, home: 80, tPref: 28,
    hab: { day: H([3.5, 5.5], 0, 1.0, 0.7), night: H([0.5, 1.5], 1, 0.5, 0.6), winter: H([3.9, 5.5], 0, 1.0, 0.5) } },
  // smallmouth bass: solitary, within ~50 m (real) of shore on rock, drop-offs and wood; shallower at night; a few deep wintering
  // sites, nearly still Dec-Mar (Sergio 2026; Suski & Ridgway 2009); ~1 BL/s around the clock in summer (Cooke 2001)
  bass:       { school: 0, perHa: 40, cruise: 1.0, sprint: 7, sustain: 1.9, turn: 2.4, sense: 4.0, nonVis: 0.25, strikeR: 1.0, cohere: 0, home: 50, tPref: 25,
    hab: { day: H([1.5, 4.0], 0, 0.8, 0.8), night: H([1.0, 2.5], 0, 0.2, 0.3), winter: H([2.5, 5.5], 0, 0.0, 0.05) } },
  // chain pickerel: a solitary ambusher in the weeds and their edges, 0.3-1.5 m over the bed; low in cover at night; within ~30 m
  // (real) of shore under the ice, day-active (the ice-fishery's fish); the steepest speed curve (0.5 BL/s sustained, 7.5 burst)
  pike:       { school: 0, perHa: 20, cruise: 0.4, sprint: 7.5, sustain: 0.9, turn: 2.2, sense: 3.5, nonVis: 0.2, strikeR: 1.2, cohere: 0, home: 40, tPref: 25,
    hab: { day: H([0.5, 2.5], 0, 0.9, 0.2), night: H([0.5, 2.0], 0, 0.25, 0.1), winter: H([0.5, 2.5], 0, 0.6, 0.1) } },
};
export const KEYS3 = SPECIES.filter(k => S3[k]);
KEYS3.forEach((k, i) => {
  const s = S3[k], sp = SP[k];
  s.key = k; s.i = i; s.sp = sp; s.name = sp.name;
  s.maxAge = sp.maxAge / Y2 * YEAR; s.matMinAge = sp.matMinAge / Y2 * YEAR; s.mateCd = sp.matingCooldown / Y2 * YEAR;
  s.uRoutine = s.cruise / s.sprint;
  s.pisc = !!sp.diet.fish; s.plank = !!sp.diet.plankton; s.sift = !!sp.diet.detritus;
  s.benthic = !!(sp.diet.larva || sp.diet.snail || sp.diet.detritus || sp.diet.insect);
  // crayfish eaters forage on the bed at any size: until the 3-D lakes have crayfish (stage 7) the bed's invertebrates stand in
  s.cray = !!sp.diet.cray;
  s.gsi = sex => sex === 0 ? sp.gsiF : sex === 1 ? sp.gsiM : (sp.gsiF + sp.gsiM) / 2;   // (a school: half and half)
});
export const speciesIndex = k => S3[k].i;

// ============================================================ the brain ===============================================
// A recurrent MLP (core.js's form: leaky-integrator hidden units with per-unit memory; the hidden units past `active` are
// masked — the evolvable brain size) with the 3-D input layout below and six outputs. Bearings are in the fish's own frame:
// "right"/"ahead" = sin/cos of the target's horizontal bearing from the heading, "above" = how far above (+) or below (−).
export const IN3 = ['food right', 'food ahead', 'food above', 'food near', 'threat right', 'threat ahead', 'threat above', 'threat near',
  'school right', 'school ahead', 'school density', 'depth', 'over bed', 'bottom depth', 'shore near', 'deeper right', 'deeper ahead',
  'light', 'temperature', 'oxygen', 'energy', 'hunger', 'fear', 'home right', 'home ahead', 'home far'];
export const OUT3 = ['turn', 'pitch', 'thrust', 'strike', 'flee', 'hide'];
const NI = IN3.length, NO = OUT3.length;
export const HID3 = 10;
export const genomeLen3 = (hid = HID3) => hid * NI + hid + NO * hid + NO + hid;
export function randomGenome3(hid = HID3) {
  const n = genomeLen3(hid), g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = rand(-0.8, 0.8);
  const B2 = hid * NI + hid + NO * hid;
  for (let k = 3; k < NO; k++) g[B2 + k] = rand(-2.6, -0.9);   // the actions (strike, flee, hide) start ~off
  for (let j = n - hid; j < n; j++) g[j] = rand(-3, -0.5);     // little memory to start (selection can raise it)
  return g;
}
// (leak: the units' memory, sigmoid of the genome's LEAK block — fixed for a genome, so computed once: leak3)
export function leak3(g, hid = HID3) { const LK = hid * NI + hid + NO * hid + NO, l = new Float32Array(hid); for (let j = 0; j < hid; j++) l[j] = 1 / (1 + Math.exp(-g[LK + j])); return l; }
export function forward3(g, inp, h, o, hid, active, leak) {
  const W2 = hid * NI + hid, B2 = W2 + NO * hid;
  for (let j = 0; j < hid; j++) {
    if (j >= active) { h[j] = 0; continue; }
    let s = g[hid * NI + j]; const b = j * NI;
    for (let i = 0; i < NI; i++) s += g[b + i] * inp[i];
    h[j] = leak[j] * h[j] + (1 - leak[j]) * Math.tanh(s);
  }
  for (let k = 0; k < NO; k++) {
    let s = g[B2 + k]; const b = W2 + k * hid;
    for (let j = 0; j < active; j++) s += g[b + j] * h[j];
    o[k] = k < 2 ? Math.tanh(s) : 1 / (1 + Math.exp(-s));
  }
}
// lifetime learning (core.js reinforce, six outputs): reward-modulated Hebbian change of the hidden→output weights in the
// plastic copy lw, pulled back toward the inherited g — Baldwinian (g is never written)
const _post = new Float32Array(NO);
export function reinforce3(lw, g, hid, h, o, reward, dt) {
  const W2 = hid * NI + hid, dec = LEARN.DECAY * dt, R = LEARN.RATE * reward, C = LEARN.CLAMP;
  _post[0] = o[0]; _post[1] = o[1]; for (let k = 2; k < NO; k++) _post[k] = o[k] * 2 - 1;
  for (let k = 0; k < NO; k++) {
    const pk = _post[k], b = W2 + k * hid;
    for (let j = 0; j < hid; j++) {
      const i = b + j; let w = lw[i] + dec * (g[i] - lw[i]);
      if (R > 0) w += R * h[j] * pk;
      lw[i] = w < -C ? -C : w > C ? C : w;
    }
  }
}

// ============================================================ helpers =================================================
const lethalO2 = (l25, floor, T) => Math.max(l25 * Math.exp(BIOE.O2_LETHAL_T * (T - 25)), floor);
const engaged = x => x > ACTION.ENGAGE ? (x - ACTION.ENGAGE) / (1 - ACTION.ENGAGE) : 0;
const coldPerf = (T, tOpt, floor) => { const f = Math.max(floor || 0, ENV.COLD_PERF_MIN); return T >= tOpt ? 1 : clamp(f + (1 - f) * (T - 2) / Math.max(1, tOpt - 2), f, 1); };
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const vbLength = (vb, yrs) => vb.Linf * (1 - Math.exp(-vb.k * (yrs - vb.t0)));
const vbAge = (vb, L) => vb.t0 - Math.log(1 - Math.min(0.98, L / vb.Linf)) / vb.k;
// the light a fish sees by at depth z of column c (0 blind … 1 full sight, a log scale between PLANKTON.VIS_I0 and VIS_I1)
function vision(I) { const P = PLANKTON; return I > P.VIS_I0 ? Math.min(1, Math.log(I / P.VIS_I0) / Math.log(P.VIS_I1 / P.VIS_I0)) : 0; }
const WF = [0, 0];

// one fish, or one school of n fish (every field set here, so every fish has the same shape)
class Fish {
  constructor() {
    this.id = 0; this.k = 0; this.s = null; this.alive = true; this.n = 1; this.school = false; this.cause = '';
    this.x = 0; this.y = 0; this.z = 0; this.yaw = 0; this.pitch = 0; this.spd = 0; this.hx = 0; this.hy = 0;
    this.L = 0; this.W = 0; this.K = 1; this.sex = 0; this.mature = false; this.Lmat = 0; this.gon = 0; this.gut = 0; this.gutE = 0;
    this.age = 0; this.gen = 0; this.hue = 0; this.mateCd = 0;
    this.hunger = 1; this.fear = 0; this.energy = 1; this.uAvg = 0.1; this.xo = 1; this.xt = 15; this.rO2 = 0;
    this.eaten = 0; this.cons = 0; this.consMax = 0; this.thrust = 0; this.yawRate = 0; this.pitchT = 0; this.missCd = 0;
    // heritable traits (from the genes) and the brain
    this.genes = null; this.g = null; this.lw = null; this.h = null; this.leak = null; this._dh = null; this._ate = false; this.tAvg = 0; this.esc = 0; this.o = new Float32Array(NO); this.active = HID3;
    this.spdGene = 1; this.turnMax0 = 1; this.sense0 = 1; this.bodyMul = 1; this.tempTol = 8; this.o2Crit = 0.3; this.o2Lethal = 0.1;
    this.o2Ice = 0; this.uilt = 30; this.metabMul = 1;
    this.gape = 0; this.bdep = 0; this.spdMax = 0; this.turnMax = 0; this.senseR = 0;
    // this step's surroundings (set at the start of the fish's turn)
    this.c = -1; this.j = -1; this.jb = -1; this.bed = 1; this.T = 15; this.o2 = 1; this.vis = 1; this.cover = 0;
    // targets from the senses
    this.fx = 0; this.fy = 0; this.fz = 0; this.fd = -1; this.fv = 0; this.fk = 0;   // food (fk 0 none, 1 fish, 2 bed, 3 plankton)
    this.prey = null; this.threat = null; this.td = -1; this.ax = 0; this.ay = 0; this.az = 0; this.an = 0;
    // RENDER-ONLY (render3/fish3view.js interpolates between steps from these; the sim never reads them)
    this._px = 0; this._py = 0; this._pz = 0; this._pyaw = 0; this._ppitch = 0;
  }
}

// ============================================================ the fish ===============================================
export class Fish3 {
  constructor(env, { founders = true } = {}) {
    this.env = env; this.chem = env.chem; this.G = env.G;
    this.fish = []; this.nextId = 1; this.stepNo = 0; this.time = 0;
    this.events = [];   // this step's strikes (for the renderer): [x, y, z, predator id]
    this.stats = { died: {}, eatenBy: {}, food: { zoo: 0, benth: 0, fish: 0, sed: 0 }, kills: 0, eggs: {}, spawns: {} };
    for (const k of KEYS3) { this.stats.eggs[k] = 0; this.stats.spawns[k] = 0; }
    this.lakeHa = (BODIES[0].area + BODIES[1].area) / 1e4;
    this._inp = new Float32Array(NI);
    this._hashInit(); this._colStatics(); this._slopeStatics();
    if (founders) this.found();
  }

  // ---------- static lookups over the water grid ----------
  _colStatics() {
    const G = this.G;
    // neighbouring columns (from the faces) — where a fish looks for richer water
    const nb = Array.from({ length: G.NC }, () => []);
    for (let f = 0; f < G.NF; f++) { nb[G.fa[f]].push(G.fb[f]); nb[G.fb[f]].push(G.fa[f]); }
    this.nbr = nb.map(a => Int32Array.from(a));
    // the bed cell for each column and layer: the nearest layer of that column whose cell holds some of its bed
    this.bedOf = new Int32Array(G.NC * G.ML).fill(-1);
    this.colBedJ = new Int32Array(G.NC);   // a column's representative bed cell (its mean depth's)
    for (let c = 0; c < G.NC; c++) {
      const j0 = G.cell0[c], n = G.nL[c];
      for (let k = 0; k < G.ML; k++) {
        const kk = Math.min(k, n - 1); let best = -1, bd = 99;
        for (let q = 0; q < n; q++) if (G.bedA[j0 + q] > 0 && Math.abs(q - kk) < bd) { bd = Math.abs(q - kk); best = j0 + q; }
        this.bedOf[c * G.ML + k] = best;
      }
      this.colBedJ[c] = this.bedOf[c * G.ML + Math.min(G.ML - 1, Math.floor(G.depthMean[c] / G.DZ))];
    }
  }
  // THE LAKE'S SHAPE as a fish knows it: the bed's slope smoothed over ~10 m (a basin's flat floor still leads somewhere — the
  // local slope there is noise), per 1.5-m cell: the unit vector toward deeper water (land counts as 0 m)
  _slopeStatics() {
    const { NX, NY, N } = GEO; let d = new Float32Array(N), t = new Float32Array(N);
    for (let i = 0; i < N; i++) d[i] = Math.max(0, GEO.depth[i]);
    const R = 3;
    for (let pass = 0; pass < 3; pass++) {
      for (let r = 0; r < NY; r++) { let s = 0, n = 0; for (let c = -R; c < NX + R; c++) { if (c + R < NX) { s += d[r * NX + c + R]; n++; } if (c - R - 1 >= 0) { s -= d[r * NX + c - R - 1]; n--; } if (c >= 0 && c < NX) t[r * NX + c] = s / n; } }
      for (let c = 0; c < NX; c++) { let s = 0, n = 0; for (let r = -R; r < NY + R; r++) { if (r + R < NY) { s += t[(r + R) * NX + c]; n++; } if (r - R - 1 >= 0) { s -= t[(r - R - 1) * NX + c]; n--; } if (r >= 0 && r < NY) d[r * NX + c] = s / n; } }
    }
    this.slopeX = new Float32Array(N); this.slopeY = new Float32Array(N);
    for (let r = 1; r < NY - 1; r++) for (let c = 1; c < NX - 1; c++) {
      const i = r * NX + c, gx = d[i + 1] - d[i - 1], gy = d[i + NX] - d[i - NX], g = Math.hypot(gx, gy);
      if (g > 1e-6) { this.slopeX[i] = gx / g; this.slopeY[i] = gy / g; }
    }
  }
  deeper(x, y, out) { const i = cellIndex(x, y); out[0] = i < 0 ? 0 : this.slopeX[i]; out[1] = i < 0 ? 0 : this.slopeY[i]; return out; }
  bedCell(c, bed) { return c < 0 ? -1 : this.bedOf[c * this.G.ML + Math.min(this.G.ML - 1, Math.max(0, Math.floor(bed / this.G.DZ)))]; }

  // ---------- the neighbour hash (positions frozen for the step) ----------
  _hashInit() {
    this.HX = Math.ceil((GEO.XMAX - GEO.X0) / F3.HC); this.HY = Math.ceil((GEO.YMAX - GEO.Y0) / F3.HC);
    const NH = this.HX * this.HY; this.hStart = new Int32Array(NH + 1); this.hCur = new Int32Array(NH); this.hItems = new Int32Array(256); this.hCell = new Int32Array(256);
  }
  _hc(x, y) { const gx = clamp(((x - GEO.X0) / F3.HC) | 0, 0, this.HX - 1), gy = clamp(((y - GEO.Y0) / F3.HC) | 0, 0, this.HY - 1); return gy * this.HX + gx; }
  _hashBuild() {
    const f = this.fish, n = f.length, NH = this.HX * this.HY;
    if (this.hItems.length < n) { this.hItems = new Int32Array(n * 2); this.hCell = new Int32Array(n * 2); }
    const S = this.hStart; S.fill(0);
    for (let i = 0; i < n; i++) { const c = this._hc(f[i].x, f[i].y); this.hCell[i] = c; S[c + 1]++; }
    for (let c = 0; c < NH; c++) S[c + 1] += S[c];
    this.hCur.set(S.subarray(0, NH));
    for (let i = 0; i < n; i++) this.hItems[this.hCur[this.hCell[i]]++] = i;
  }

  // ---------- creating fish ----------
  // a fish (n = 1) or a school (n > 1) of species k at (x, y) (z from its habitat when null), `yrs` old
  add(k, x, y, z = null, yrs = 1, n = 1, genome = null, genes = null, Lmul = 1) {
    const s = S3[k], sp = s.sp, a = new Fish();
    a.id = this.nextId++; a.k = s.i; a.s = s; a.n = n; a.school = !!s.school;
    a.x = x; a.y = y; a.hx = x; a.hy = y; a.yaw = rand(0, Math.PI * 2);
    a.age = yrs * YEAR; a.sex = a.school ? 2 : rand() < 0.5 ? 0 : 1;
    a.genes = genes || randomGenes(); a.g = genome || randomGenome3(); a.lw = Float32Array.from(a.g); a.h = new Float32Array(HID3); a.leak = leak3(a.g);
    this._traits(a);
    a.L = clamp(vbLength(sp.vb, yrs) * Lmul, sp.Lhatch, sp.vb.Linf); a.K = rand(BIOE.K_START[0], BIOE.K_START[1]); a.W = a.K * stdWeight(sp.lw, a.L);
    a.mature = this._matureAt(a);
    a.mateCd = rand(0, s.mateCd);
    a.hue = rand(0, 1);
    this._settle(a);
    a.bed = Math.max(0.05, GEO.depthAt(x, y)); a.z = z === null ? this._zTarget(a, s.hab.day) : z;
    a.z = clamp(a.z, F3.ZTOP, Math.max(F3.ZTOP, a.bed - F3.ZBOT));
    a.spd = s.cruise * a.L / 100; a.uAvg = s.uRoutine;
    a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = 0;
    this.fish.push(a);
    return a;
  }
  _traits(a) {
    const s = a.s, sp = s.sp, [gSize, gSpeed, gTol, gFin, gEye, gBody, gBrain] = a.genes;
    a.active = clamp(Math.round(HID3 * gBrain), Math.min(BRAIN.HID_MIN, HID3), HID3);
    a.turnMax0 = s.turn * (0.6 + 0.4 * gFin); a.sense0 = s.sense * (0.6 + 0.4 * gEye);
    a.spdGene = gSpeed * (1.18 - 0.18 * gBody) * (1.05 - 0.05 * gFin); a.bodyMul = 0.8 + 0.2 * gBody;
    a.tempTol = sp.tempTol * gTol; a.o2Crit = clamp(sp.o2Crit * (2 - gTol), 0.05, 0.9);
    a.o2Lethal = clamp(sp.o2Lethal / ENV.O2_MGL * (2 - gTol), 0.005, 0.5); a.o2Ice = clamp((sp.o2Ice ?? 0) / ENV.O2_MGL * (2 - gTol), 0, 0.5);
    a.uilt = sp.uilt + BIOE.UILT_GENE * (gTol - 1);
    a.metabMul = (0.85 + 0.15 * gSpeed) * (0.9 + 0.1 * gTol) * (0.95 + 0.05 * gFin) * (0.93 + 0.07 * gEye) * (0.92 + 0.08 * gBody) * (1 - BRAIN.COST * (HID3 - a.active) / HID3);
    const lm = sp.Lmat * Math.pow(gSize, BIOE.LMAT_GENE);
    a.Lmat = a.sex === 1 && sp.LmatM ? lm * sp.LmatM / sp.Lmat : a.sex === 2 && sp.LmatM ? lm * (1 + sp.LmatM / sp.Lmat) / 2 : lm;
  }
  _matureAt(a) {
    const s = a.s, lmatAt = Math.max(BIOE.PMRN_FLOOR, 1 - BIOE.PMRN_SLOPE * Math.max(0, (a.age - s.matMinAge) / YEAR));
    return a.age >= s.matMinAge && a.L >= a.Lmat * lmatAt;
  }
  // the size-dependent abilities (speed, turning, senses, gape) and the condition's reserve
  _settle(a) {
    const s = a.s, sp = s.sp, r = a.L / sp.Lref;
    a.spdMax = s.sprint * a.L / 100 * a.spdGene;
    a.turnMax = a.turnMax0 * clamp(Math.pow(r, -0.2), 0.9, 1.5);
    a.senseR = a.sense0 * clamp(Math.pow(r, 0.3), 0.5, 1.15);
    a.gape = a.L * sp.gapeR; a.bdep = a.L * sp.depthR * a.bodyMul;
    a.K = a.W / stdWeight(sp.lw, a.L); a.energy = clamp((a.K - 0.6) / 0.4, 0, 1);
    a.hunger = 1 - clamp(a.gut / (sp.gut * a.W), 0, 1);
  }

  // THE FOUNDERS: each species at the design census (fish ≥ 7.5 cm per hectare of lake) over its daytime habitat; ages from
  // its natural mortality (the age at 7.5 cm + an exponential with mean 1/M years), schools one cohort each
  found() {
    for (const k of KEYS3) {
      const s = S3[k], sp = s.sp, target = Math.round(s.perHa * this.lakeHa), [lo, hi] = s.hab.day.bot;
      const cand = []; for (let i = 0; i < GEO.N; i++) { const b = GEO.body[i]; if ((b === UPPER || b === LOWER) && GEO.depth[i] >= lo && GEO.depth[i] <= hi) cand.push(i); }
      const a0 = Math.max(0.5, vbAge(sp.vb, 7.5 / (s.found || 1))), maxY = sp.maxAge / Y2;
      let made = 0;
      while (made < target) {
        let yrs = 0; for (let t = 0; t < 16; t++) { yrs = a0 - Math.log(1 - rand()) / sp.M; if (yrs < 0.9 * maxY) break; yrs = a0; }
        const n = s.school ? Math.min(target - made, Math.max(4, Math.round(s.school * (0.5 + rand())))) : 1;
        const i = cand[(rand() * cand.length) | 0], [cx, cy] = GEO.cellCentre(i);
        const a = this.add(k, cx + (rand() - 0.5) * GEO.CELL, cy + (rand() - 0.5) * GEO.CELL, null, yrs, n, null, null, s.found || 1);
        // mature fish carry gonads: ripe if their spawning is still ahead (the lake opens in mid-May)
        if (a.mature) a.gon = s.gsi(a.sex) * a.W * (sp.spawnT[0] > 14 ? 1 : 0.15);
        made += n;
      }
    }
  }

  // ---------- where a fish wants to be ----------
  // the habitat mode now: day ↔ night by the sun, → winter in cold water
  _mode(a) {
    const s = a.s, H = s.hab, e = this.env, nf = 1 - smooth(0.02, 0.3, e.sun), wf = clamp((9 - a.T) / 4, 0, 1);
    const m = this._m || (this._m = { bot: [0, 0], v: 0, h: 0, act: 0 });
    const blend = (p, q, t) => p + (q - p) * t;
    const lo = blend(H.day.bot[0], H.night.bot[0], nf), hi = blend(H.day.bot[1], H.night.bot[1], nf);
    m.bot[0] = blend(lo, H.winter.bot[0], wf); m.bot[1] = blend(hi, H.winter.bot[1], wf);
    const md = wf > 0.5 ? H.winter : nf < 0.5 ? H.day : H.night;   // (its place in the column: blended when day and night agree on the kind)
    m.v = md.v; m.h = md !== H.winter && H.day.v === H.night.v ? blend(H.day.h, H.night.h, nf) : md.h;
    m.act = blend(blend(H.day.act, H.night.act, nf), H.winter.act, wf);
    return m;
  }
  _zTarget(a, m) {
    const bed = a.bed;
    return m.v === 0 ? bed - m.h - a.L / 200 : m.v === 1 ? bed * m.h : Math.min(m.h, bed * 0.8);
  }

  // ============================================================ step ===================================================
  step(dt) {
    const e = this.env, ch = this.chem, G = this.G, f = this.fish;
    this.time += dt; this.stepNo++; this.events.length = 0;
    this._hashBuild();
    // the lake's fish biomass (kg/ha) — the zooplankton's kairomone level (diel vertical migration)
    let bio = 0; for (const a of f) if (a.alive) bio += a.n * a.W; ch.fishKgHa = bio / 1000 / this.lakeHa;
    const yf = e.yearFrac(), att = ch.attenuation(), clar = ch.clarity();
    const vDay0 = e.lightDay;   // (the day's noon light — rates follow the day's light)
    for (let i = 0; i < f.length; i++) {
      const a = f[i]; if (!a.alive) continue;
      const s = a.s, sp = s.sp;
      a.age += dt; a.mateCd -= dt; if (a.missCd > 0) a.missCd -= dt;
      if (!a.mature && this._matureAt(a)) a.mature = true;
      // surroundings
      a.bed = Math.max(0.05, GEO.depthAt(a.x, a.y));
      const c = a.c = e.colAt(a.x, a.y);
      if (c < 0) { this._tallyDeath(s.key, 'stranded', a.n); a.alive = false; a.cause = 'stranded'; continue; }   // (never: movement keeps fish in the water)
      const k = Math.min(G.nL[c] - 1, Math.max(0, (a.z / G.DZ) | 0)), j = a.j = G.cell0[c] + k;
      a.jb = this.bedCell(c, a.bed);
      a.T = e.temp[j]; a.o2 = ch.o2[j];
      const iceCut = 1 - ICE.LIGHT_CUT * e.ice[c], fade = Math.exp(-att * a.z);
      a.vis = Math.max(s.nonVis, vision(e.light * iceCut * fade)) * clar;
      const visDay = Math.max(s.nonVis, vision(vDay0 * iceCut * fade)) * clar;
      a.cover = F3.SHALLOW_REFUGE * clamp((0.8 - a.bed) / 0.6, 0, 1);
      a.fear *= Math.exp(-F3.FEAR_DECAY * dt);
      // decide (senses → brain), then the innate drives, then move
      const m = this._mode(a);
      if ((this.stepNo + a.id) % F3.DECIDE_EVERY === 0 || !a._dh) {
        // learning (on the decision just acted on: rewarded if it ate since), then the next decision
        if (a._dh) { reinforce3(a.lw, a.g, HID3, a.h, a.o, a._ate ? 1 : 0, dt * F3.DECIDE_EVERY); a._ate = false; }
        this._sense(a, i); this._brain(a, m, dt);
      }
      else if (a.prey && !a.prey.alive) { a.prey = null; a.fk = 0; }
      this._drive(a, m, dt);
      this._move(a, dt);
      // the body, food, hazards
      const T = a.T, bp = (sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio;
      const cm = this._energetics(a, bp, T, dt);
      const ate = this._feed(a, i, cm, visDay, dt);
      a.hunger = 1 - clamp(a.gut / (sp.gut * a.W), 0, 1);
      if (ate) a._ate = true;
      this._spawn(a, yf, e.ice[c]);
      // O₂: this step's respiration (all n fish) from the fish's water
      ch.o2[a.j] = Math.max(0, ch.o2[a.j] - a.n * a.rO2 * dt / (G.vol[a.j] * ENV.O2_MGL));
      this._hazards(a, T, dt);
    }
    if (this.stepNo % F3.MERGE_EVERY === 0) this._schools();
    if (this.stepNo % 20 === 0 || f.some(a => !a.alive)) this.fish = f.filter(a => a.alive);
  }

  // ---------- senses: one pass over the neighbours (food fish, the nearest threat, the school) + the food fields ----------
  _sense(a, i) {
    const s = a.s, f = this.fish, R = Math.max(0.6, a.senseR * a.vis), Rt = Math.max(0.8, a.senseR * 1.1 * a.vis), Ra = F3.ALLY_R;
    const RR = Math.max(R, Rt, Ra), R2 = RR * RR;
    a.prey = null; a.threat = null; a.td = -1; a.fk = 0; a.fd = -1; a.fv = 0; a.an = 0;
    let pd = R, td = Rt, sx = 0, sy = 0, sz = 0, sn = 0;
    const canEat = s.pisc && a.L >= s.sp.Lpisc;
    const gx0 = clamp(((a.x - RR - GEO.X0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + RR - GEO.X0) / F3.HC) | 0, 0, this.HX - 1);
    const gy0 = clamp(((a.y - RR - GEO.Y0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + RR - GEO.Y0) / F3.HC) | 0, 0, this.HY - 1);
    const S = this.hStart, I = this.hItems;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.HX + gx;
      for (let q = S[c]; q < S[c + 1]; q++) {
        const jx = I[q]; if (jx === i) continue; const b = f[jx]; if (!b.alive) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R2) continue;
        const d = Math.sqrt(d2);
        if (b.k === a.k && d < Ra) { sx += b.x * b.n; sy += b.y * b.n; sz += b.z * b.n; sn += b.n; }
        if (d < td && this.canPrey(b, a)) { td = d; a.threat = b; }
        if (canEat && d < pd && this.canPrey(a, b)) { pd = d; a.prey = b; }
      }
    }
    if (a.threat) { a.td = td; a.fear = Math.max(a.fear, clamp(1 - td / Rt, 0, 1)); }
    if (sn > 0) { a.ax = sx / sn; a.ay = sy / sn; a.az = sz / sn; a.an = sn; }
    if (a.prey) { a.fk = 1; a.fx = a.prey.x; a.fy = a.prey.y; a.fz = a.prey.z; a.fd = pd; a.fv = 1; return; }
    // the fields: the richest bed (bottom feeders) or zooplankton (planktivores) about it — its own column and the next ones
    const G = this.G, ch = this.chem, small = !s.pisc || a.L < 3 * s.sp.Lpisc || s.cray;
    if (s.benthic && small) {
      let best = BENTHOS.SENSE_MIN, bc = -1;
      const tryC = cc => { const jb = this.colBedJ[cc]; if (jb < 0 || ch.o2[jb] < a.o2Crit) return; const E = ch.benth[jb] / A2 - BENTHOS.REFUGE; if (E > best) { best = E; bc = cc; } };
      tryC(a.c); const nb = this.nbr[a.c]; for (let q = 0; q < nb.length; q++) tryC(nb[q]);
      if (bc >= 0) {
        const v = best / (best + BENTHOS.K_FISH);
        if (v > a.fv) { a.fk = 2; a.fv = v; a.fx = bc === a.c ? a.x : G.cx[bc]; a.fy = bc === a.c ? a.y : G.cy[bc]; a.fz = bc === a.c ? a.bed - 0.15 : Math.max(0.1, G.depthMean[bc] - 0.15); }
      }
    }
    if (s.plank || a.L < s.sp.Lzoo) {
      const K = PLANKTON.K_ADULT; let best = PLANKTON.SENSE_MIN * K, bj = -1;
      const k0 = a.j - G.cell0[a.c];
      const tryJ = jj => { const E = ch.zooE(jj); if (E > best) { best = E; bj = jj; } };
      tryJ(a.j); if (k0 > 0) tryJ(a.j - 1); if (k0 < G.nL[a.c] - 1) tryJ(a.j + 1);
      const nb = this.nbr[a.c]; for (let q = 0; q < nb.length; q++) { const cc = nb[q]; tryJ(G.cell0[cc] + Math.min(G.nL[cc] - 1, k0)); }
      if (bj >= 0) {
        const v = best * best / (best * best + K * K);
        if (v > a.fv) { const cc = G.colOfCell[bj]; a.fk = 3; a.fv = v; a.fx = cc === a.c ? a.x : G.cx[cc]; a.fy = cc === a.c ? a.y : G.cy[cc]; a.fz = G.zMid[bj]; }
      }
    }
    if (a.fk >= 2) { const dx = a.fx - a.x, dy = a.fy - a.y; a.fd = Math.hypot(dx, dy, a.fz - a.z); }
  }
  // can `p` eat `q`: a fish-eater at its piscivorous length, q's body no deeper than p's gape and not too small to bother with
  canPrey(p, q) {
    const s = p.s; if (!s.pisc || p.L < s.sp.Lpisc || p === q) return false;
    return q.bdep <= p.gape && q.L >= FEED.PREY_MIN * p.L;
  }

  // ---------- the brain ----------
  _brain(a, m, dt) {
    const inp = this._inp, s = a.s, cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    const rel = (tx, ty, o) => { const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy) || 1e-6; inp[o] = (dx * sy - dy * cy) / d; inp[o + 1] = (dx * cy + dy * sy) / d; };   // (right, ahead)
    if (a.fk) { rel(a.fx, a.fy, 0); inp[2] = clamp((a.z - a.fz) / 2, -1, 1); inp[3] = a.fk === 1 ? clamp(1 - a.fd / Math.max(0.6, a.senseR), 0, 1) : a.fv; }
    else inp[0] = inp[1] = inp[2] = inp[3] = 0;
    if (a.threat) { rel(a.threat.x, a.threat.y, 4); inp[6] = clamp((a.z - a.threat.z) / 2, -1, 1); inp[7] = a.fear; } else inp[4] = inp[5] = inp[6] = inp[7] = 0;
    if (a.an > 0) { rel(a.ax, a.ay, 8); inp[10] = clamp(a.an / 8, 0, 1); } else inp[8] = inp[9] = inp[10] = 0;
    inp[11] = clamp(a.z / 6, 0, 1); inp[12] = clamp((a.bed - a.z) / 3, 0, 1); inp[13] = clamp(a.bed / 6, 0, 1);
    inp[14] = clamp(1 - GEO.shoreDist(a.x, a.y) / 20, 0, 1);
    a._dh = this.deeper(a.x, a.y, a._dh || [0, 0]);   // (the lake's smoothed slope toward deeper water)
    const [gx, gy] = a._dh; inp[15] = gx * sy - gy * cy; inp[16] = gx * cy + gy * sy;
    inp[17] = a.vis; inp[18] = clamp((a.T - s.sp.tempOpt) / 10, -1, 1); inp[19] = clamp(a.o2 / 1.2, 0, 1);
    inp[20] = a.energy; inp[21] = a.hunger; inp[22] = a.fear;
    const hd = Math.hypot(a.hx - a.x, a.hy - a.y);
    if (hd > 0.5) rel(a.hx, a.hy, 23); else inp[23] = inp[24] = 0;
    inp[25] = clamp(hd / (2 * s.home), 0, 1);
    forward3(a.lw, inp, a.h, a.o, HID3, a.active, a.leak);
  }

  // ---------- innate drives: steer (yaw rate), a target depth (pitch) and thrust ----------
  _drive(a, m, dt) {
    const s = a.s, o = a.o, tm = a.turnMax;
    // the brain's turn, high-passed: a constant bias (a fresh random brain's) would only make the fish circle; it steers by change
    a.tAvg += (o[0] - a.tAvg) * Math.min(1, dt / F3.TURN_HP);
    let yr = (o[0] - a.tAvg) * tm * F3.BRAIN_TURN;
    const steer = (bx, by, w) => { yr += angDiff(Math.atan2(by, bx), a.yaw) * tm * w; };
    // habitat: back into the bottom-depth band (downhill when too shallow, uphill when too deep)
    const [lo, hi] = m.bot, [gx, gy] = a._dh; let off = 0;
    if (a.bed < lo) { off = lo - a.bed; if (gx || gy) steer(gx, gy, F3.HAB_W * clamp(off, 0.2, 1)); }
    else if (a.bed > hi) { off = a.bed - hi; if (gx || gy) steer(-gx, -gy, F3.HAB_W * clamp(off, 0.2, 1)); }
    // food: forage toward it (hungry), pursue a prey fish — less while it is on its way to its habitat (the dusk and dawn moves
    // go whatever the food), and no lingering in a patch then
    const going = clamp(off - 0.3, 0, 1), inPatch = a.fk >= 2 && a.fd < 1.5 && going <= 0;
    if (a.fk === 1) steer(a.fx - a.x, a.fy - a.y, F3.PURSUIT_W * clamp(1 - a.fd / Math.max(0.6, a.senseR), 0.2, 1) * (0.4 + 0.6 * a.hunger));
    else if (a.fk >= 2 && !inPatch) steer(a.fx - a.x, a.fy - a.y, F3.FORAGE_W * a.hunger * a.fv * (1 - 0.8 * going));
    // a threat: away from it (small fish also toward the shallows)
    if (a.threat && a.fear > 0.05) {
      let bx = a.x - a.threat.x, by = a.y - a.threat.y; const d = Math.hypot(bx, by) || 1; bx /= d; by /= d;
      if (a.L < 15 && (gx || gy)) { bx -= 0.6 * gx; by -= 0.6 * gy; }
      steer(bx, by, F3.FLEE_W * a.fear);
    }
    // its own kind: schools keep together (their agents meet and merge); loose aggregations (sunfish colonies)
    if (a.an > 0 && s.cohere > 0) { const d = Math.hypot(a.ax - a.x, a.ay - a.y); if (d > 1) steer(a.ax - a.x, a.ay - a.y, s.cohere * clamp(a.an / 6, 0, 1)); }
    // home range
    const hd = Math.hypot(a.hx - a.x, a.hy - a.y); if (hd > s.home) steer(a.hx - a.x, a.hy - a.y, F3.HOME_W * clamp((hd - s.home) / s.home, 0, 1));
    // look ahead for shallows and shore: turn toward the deeper side
    // (only water too shallow to swim in is an obstacle — a rising bed the fish follows by its depth control)
    const look = Math.max(0.8, a.spd * F3.LOOK), cy = Math.cos(a.yaw), sy = Math.sin(a.yaw), need = F3.ZTOP + F3.ZBOT + 0.1 + a.L / 300;
    const dAhead = GEO.depthAt(a.x + cy * look, a.y + sy * look);
    if (dAhead < need || GEO.bodyAt(a.x + cy * look, a.y + sy * look) === LAND) {
      const l = a.yaw + 0.8, r = a.yaw - 0.8, dl = GEO.depthAt(a.x + Math.cos(l) * look, a.y + Math.sin(l) * look), dr = GEO.depthAt(a.x + Math.cos(r) * look, a.y + Math.sin(r) * look);
      yr += (dl >= dr ? 1 : -1) * tm * F3.AVOID_W;
    }
    a.yawRate = clamp(yr, -tm, tm);
    // depth: the habitat's, the food's when foraging, up out of low O₂, down out of heat
    let zT = this._zTarget(a, m);
    if (a.fk && (a.fk === 1 || a.hunger > 0.3)) zT += (a.fz - zT) * clamp(a.fk === 1 ? 0.8 : a.hunger * a.fv, 0, 1);
    if (a.o2 < a.o2Crit) zT = Math.min(zT, a.z - 0.5);
    if (a.T > s.tPref + a.tempTol / 4) zT = Math.max(zT, a.z + 0.5);
    zT = clamp(zT, F3.ZTOP, Math.max(F3.ZTOP, a.bed - F3.ZBOT));
    a.pitchT = clamp((a.z - zT) * F3.PITCH_K, -F3.PITCH_MAX, F3.PITCH_MAX) + o[1] * F3.PITCH_MAX * F3.BRAIN_PITCH;
    // ESCAPE from water near its lethal O2: straight up and out, fast (world.js escUp)
    a.esc = a.o2 < F3.ESC_O2 * lethalO2(a.o2Lethal, a.o2Ice, a.T) || a.o2 < 0.5 * a.o2Crit ? 1 : 0;
    if (a.esc) a.pitchT = F3.ESC_PITCH;
    // thrust: cruise × the mode's activity × the brain (0.5–1.5), travel, the actions
    // the brain's actions act in their context: a strike at prey it senses, a flight from a threat it senses (or its fear)
    const aS = a.fk === 1 ? engaged(o[3]) : 0, aF = a.threat || a.fear > 0.1 ? engaged(o[4]) : 0, aH = engaged(o[5]);
    // a fish outside its habitat (the dusk and dawn moves, a long way from home) travels at up to its 30-min sustained speed —
    // the dusk hour is ~5 s of the sim's day, so the move is made at the pace a real fish keeps up for half an hour
    let th = s.uRoutine * m.act * (0.5 + o[2]);
    const trip = clamp(Math.max((off - 0.2) / 0.3, hd / s.home - 1.5), 0, 1);
    if (trip > 0) th = Math.max(th, trip * s.sustain / s.sprint * (0.75 + 0.5 * o[2]));
    if (inPatch && a.hunger > 0.2) th *= FEED.RESIDE;
    const burst = Math.max(ACTION.STRIKE_BURST * aS, ACTION.FLEE_BURST * Math.max(aF, a.fear > 0.4 ? a.fear : 0));
    th = (th + (1 - th) * burst) * (1 - ACTION.HIDE_STILL * aH);
    a.thrust = clamp(th * coldPerf(a.T, s.sp.tempOpt, s.sp.coldPerf), 0, 1);
    if (a.esc) a.thrust = Math.max(a.thrust, 0.7);
  }

  // ---------- movement in 3-D, kept in the water ----------
  _move(a, dt) {
    a.yaw += a.yawRate * dt; if (a.yaw > Math.PI) a.yaw -= 2 * Math.PI; else if (a.yaw < -Math.PI) a.yaw += 2 * Math.PI;
    const pm = a.esc ? F3.ESC_PITCH : F3.PITCH_MAX;
    a.pitch += (a.pitchT - a.pitch) * Math.min(1, F3.PITCH_RATE * (a.esc ? 3 : 1) * dt); a.pitch = clamp(a.pitch, -pm, pm);
    a.spd += (a.thrust * a.spdMax - a.spd) * Math.min(1, F3.DRAG * dt);
    const hs = Math.cos(a.pitch) * a.spd * dt;
    let nx = a.x + Math.cos(a.yaw) * hs, ny = a.y + Math.sin(a.yaw) * hs, nz = a.z - Math.sin(a.pitch) * a.spd * dt;
    let bed = GEO.depthAt(nx, ny);
    const zTop = F3.ZTOP + F3.ICE_M * (a.c >= 0 ? this.env.ice[a.c] : 0);
    if (GEO.bodyAt(nx, ny) === LAND || bed < zTop + F3.ZBOT + 0.02) {
      // too shallow: stay put and turn toward deeper water
      nx = a.x; ny = a.y; bed = a.bed; a.spd *= 0.6;
      const [gx, gy] = GEO.downhill(a.x, a.y); if (gx || gy) a.yaw += angDiff(Math.atan2(gy, gx), a.yaw) * Math.min(1, 6 * dt);
    }
    a.x = nx; a.y = ny; a.z = clamp(nz, zTop, Math.max(zTop, bed - F3.ZBOT));
  }

  // ---------- the body: digestion, waste, respiration, gonads, growth (FB4; world.js) ----------
  _energetics(a, bp, T, dt) {
    const s = a.s, sp = s.sp, Wg = a.W, dd = dt / DAY, cm = cmax(bp, Wg, T);
    let C = 0, pNow = 0;
    if (a.gut > 0) {
      const ev = Math.min(a.gut, Math.min(Math.max(BIOE.GER * Math.exp(BIOE.GER_T * T) * sp.gerMul, cm / sp.gut) * a.gut, cm * Wg) * dd);
      C = a.gutE * ev / a.gut; a.gut -= ev; a.gutE -= C; pNow = ev / Math.max(1e-12, cm * Wg * dd);
      a.cons += ev;
    }
    a.consMax += cm * Wg * dd;
    wasteFractions(bp, T, clamp(pNow, 0, 1), WF);
    const F = WF[0] * C, U = WF[1] * (C - F), S = bp.SDA * (C - F);
    a.uAvg += (a.spd / Math.max(1e-6, a.spdMax) - a.uAvg) * Math.min(1, dd);
    const act = routineActivity(bp, Wg, T) * Math.exp(BIOE.SWIM * Math.max(0, a.uAvg - s.uRoutine));
    const depress = 1 - 0.3 * clamp((0.9 - a.K) / (0.9 - 0.55), 0, 1);
    const rO2 = respStd(bp, Wg, T) * a.metabMul * act * depress * Wg;   // g O₂ a day
    a.rO2 = rO2 / DAY;
    let net = C - F - U - S - rO2 * OXYCAL * dd;
    const ed = energyDensity(bp, Wg), gsi = s.gsi(a.sex);
    if (net > 0 && a.mature && a.gon < gsi * Wg) { const toG = Math.min(net * BIOE.REPRO_ALLOC, (gsi * Wg - a.gon) * ed); a.gon += toG / ed; net -= toG; }
    else if (net <= 0 && a.gon > 0 && a.K < BIOE.K_RESORB) { const fromG = Math.min(a.gon * ed, -net); a.gon -= fromG / ed; net += fromG; }
    a.W = Math.max(1e-6, Wg + net / ed);
    if (a.W > stdWeight(sp.lw, a.L)) a.L = lengthFor(sp.lw, a.W);
    this._settle(a);
    return cm;
  }

  // ---------- feeding: fish, the bed's worms and scuds, zooplankton, the bed's organic layer (poor food) ----------
  _feed(a, i, cm, visDay, dt) {
    const s = a.s, sp = s.sp, ch = this.chem, gmax = sp.gut * a.W, n = a.n;
    const o2L = lethalO2(a.o2Lethal, a.o2Ice, a.T);
    const gEff = gmax * clamp((a.o2 - o2L) / Math.max(1e-3, a.o2Crit - o2L), 0, 1), apt = gEff / gmax;
    const perf = coldPerf(a.T, sp.tempOpt, sp.coldPerf);
    let room = gEff - a.gut; if (!(room > 0)) return false;
    let want = cm * apt * a.W * dt / DAY, got = 0;   // what it can take this step (per fish)
    const g0 = a.gut;
    if (s.pisc && a.L >= sp.Lpisc && a.missCd <= 0) { const g = this._strike(a, i, room, visDay, perf, dt); if (g > 0) { a.gut += g; a.gutE += g * this._preyED; room -= g; got += g; this.stats.food.fish += g; } }
    const small = !s.pisc || a.L < 3 * sp.Lpisc || s.cray;
    if (s.benthic && small && room > 0 && want > got && a.jb >= 0 && a.bed - a.z <= F3.BENTH_REACH + a.L / 200) {
      const g = ch.takeBenth(a.jb, Math.min(room, (want - got) * BENTHOS.Q) * n) / n;
      if (g > 0) { a.gut += g; a.gutE += g * PREY.BENTH_ED; room -= g; got += g; this.stats.food.benth += g * n; }
    }
    if ((s.plank || a.L < sp.Lzoo) && room > 0 && want > got) {
      const out = this._zo || (this._zo = [0, 0, 0]);
      ch.zooFeed(a.j, 1, 1 - PLANKTON.COPE_ESCAPE, Math.min(room, (want - got) * PLANKTON.Q) * n, PLANKTON.K_ADULT, out, true, true, 0);
      const g = (out[0] + out[1] + out[2]) / n;
      if (g > 0) { a.gut += g; a.gutE += (out[0] * PREY.DAPH_ED + out[1] * PREY.COPE_ED + out[2] * PREY.ROT_ED) / n; room -= g; got += g; this.stats.food.zoo += g * n; }
    }
    // poor food when nothing else was had: a bottom-sifter takes the bed's organic layer
    if (got <= 0 && s.sift && a.jb >= 0 && a.bed - a.z <= F3.BENTH_REACH + a.L / 200) {
      const pRoom = Math.min(gEff, FEED.POOR_GUT * gmax) - a.gut;
      if (pRoom > 0) { const g = ch.takeSedOM(a.jb, Math.min(pRoom, (want - got)) * n) / n; if (g > 0) { a.gut += g; a.gutE += g * PREY.DETRITUS_ED * PREY.DETRITUS_DIG; got += g; this.stats.food.sed += g * n; } }
    }
    const ate = a.gut - g0 >= PLANKTON.BITE_MIN * gmax * dt / (1 / 30);   // (a meal: the 2-D bite threshold per 1/30-s step)
    if (ate) a.eaten++;
    return ate;
  }
  // a piscivore's strike: the kill hazard over the catchable fish within its reach; one fish taken (a school loses one)
  _strike(a, i, room, visDay, perf, dt) {
    const s = a.s, f = this.fish, lunge = 1 + ACTION.STRIKE_REACH * (a.fk === 1 ? engaged(a.o[3]) : 0);
    const R = s.strikeR * lunge * Math.max(0.3, visDay), R2 = R * R;
    let sK = 0, best = null;
    const gx0 = clamp(((a.x - R - GEO.X0) / F3.HC) | 0, 0, this.HX - 1), gx1 = clamp(((a.x + R - GEO.X0) / F3.HC) | 0, 0, this.HX - 1);
    const gy0 = clamp(((a.y - R - GEO.Y0) / F3.HC) | 0, 0, this.HY - 1), gy1 = clamp(((a.y + R - GEO.Y0) / F3.HC) | 0, 0, this.HY - 1);
    const S = this.hStart, I = this.hItems, cand = this._cand || (this._cand = []); cand.length = 0;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const c = gy * this.HX + gx;
      for (let q = S[c]; q < S[c + 1]; q++) {
        const b = f[I[q]]; if (!b.alive || I[q] === i) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R2) continue;
        if (!this.canPrey(a, b) || b.W + b.gon > room) continue;
        const d = Math.sqrt(d2), hide = 1 - ACTION.HIDE_CONCEAL * engaged(b.o[5]);
        const sel = Math.pow(Math.max(0, 1 - b.bdep / a.gape), FEED.SIZE_SEL);
        const w = (1 - d / R) * s.sp.capture * b.s.sp.vuln * sel * hide * (1 - b.cover) * (b.n > 1 ? Math.pow(b.n, F3.SCHOOL_EXP) : 1);
        if (w > 0) { sK += w; cand.push(b, w); }
      }
    }
    if (!(sK > 0)) return 0;
    const rate = F3.ATTACK * perf * dt;
    if (rand() >= 1 - Math.exp(-rate * sK)) return 0;
    let r = rand() * sK; for (let q = 0; q < cand.length; q += 2) { r -= cand[q + 1]; if (r <= 0) { best = cand[q]; break; } }
    best = best || cand[cand.length - 2];
    const g = best.W + best.gon; this._preyED = energyDensity(best.s.sp.bio, best.W);
    this.events.push(best.x, best.y, best.z, a.id);
    this.stats.kills++; const key = `${s.key}>${best.s.key}`; this.stats.eatenBy[key] = (this.stats.eatenBy[key] || 0) + 1;
    if (best.n > 1.5) best.n -= 1; else { best.alive = false; best.cause = 'eaten'; best.n = 0; }
    this._tallyDeath(best.s.key, 'eaten', 1);
    a.missCd = FEED.MISS_CD / TS;
    return g;
  }

  // ---------- spawning (slice a: the eggs are laid and counted — the young-of-year come in slice b) ----------
  _spawn(a, yf, ice) {
    const s = a.s, sp = s.sp;
    if (!a.mature || a.mateCd > 0 || yf >= SPAWN.SEASON_END || ice >= 0.5) return;
    const gsi = s.gsi(a.sex); if (a.gon < SPAWN.GON_READY * gsi * a.W || a.K < SPAWN.K_READY) return;
    const E = SPAWN.EDGE, [lo, hi] = sp.spawnT, f = clamp((a.T - lo + E) / E, 0, 1) * clamp((hi + E - a.T) / E, 0, 1);
    if (!(f > 0.5) || rand() > f * 0.02) return;
    const females = a.sex === 0 ? 1 : a.sex === 2 ? a.n / 2 : 0;
    const eggs = females * sp.fec.a * Math.pow(a.L, sp.fec.b) * clamp(a.gon / (sp.gsiF * a.W), 0, 1);
    this.stats.eggs[s.key] += eggs; this.stats.spawns[s.key]++;
    a.gon = 0; a.mateCd = s.mateCd;
  }

  // ---------- hazards: starvation, heat, hypoxia, other natural causes, old age ----------
  _hazards(a, T, dt) {
    const s = a.s, sp = s.sp;
    const hS = a.K < BIOE.K_HAZARD ? -Math.log(Math.max(1e-9, 1 / (1 + Math.exp(-(BIOE.STARVE_A + BIOE.STARVE_B * a.K))))) / DAY : 0;
    const kx = Math.min(1, dt * TS / BIOE.EXPOSE_TAU); a.xo += (a.o2 - a.xo) * kx; a.xt += (T - a.xt) * kx;
    const hH = a.xt > a.uilt - 2 ? LN2 / (BIOE.UILT_DAYS * DAY) * Math.exp((a.xt - a.uilt) / BIOE.HEAT_STEEP) : 0;
    const o2Lx = lethalO2(a.o2Lethal, a.o2Ice, a.xt);
    const hO = a.xo < o2Lx ? LN2 / (BIOE.HYPOXIA_DAYS * DAY) * Math.exp(BIOE.HYPOXIA_STEEP * (o2Lx - a.xo) / o2Lx) : 0;
    const hM = sp.M * BIOE.M_OTHER * clamp(Math.pow(a.L / sp.Lref, -0.87), 0.5, 3) / YEAR;
    const hz = hS + hH + hO + hM, old = a.age > s.maxAge;
    const cause = old ? 'old' : hS >= hH && hS >= hO && hS >= hM ? 'starve' : hH >= hO && hH >= hM ? 'heat' : hO >= hM ? 'hypoxia' : 'other';
    if (old || !(a.W > 0)) return this._die(a, cause, a.n);
    if (a.n > 1) {   // a school loses a fraction; the shares by cause
      const lost = a.n * (1 - Math.exp(-hz * dt));
      if (lost > 0) { for (const [c, h] of [['starve', hS], ['heat', hH], ['hypoxia', hO], ['other', hM]]) if (h > 0) this._tallyDeath(s.key, c, lost * h / hz); this.chem.addSedOM(a.jb, lost * a.W); a.n -= lost; }
      if (a.n < 1) { a.alive = false; a.cause = cause; this.chem.addSedOM(a.jb, a.n * a.W); a.n = 0; }
    } else if (hz > 0 && rand() < 1 - Math.exp(-hz * dt)) this._die(a, cause, 1);
  }
  _die(a, cause, n) { a.alive = false; a.cause = cause; this._tallyDeath(a.s.key, cause, n); this.chem.addSedOM(a.jb, n * a.W); a.n = 0; }
  _tallyDeath(k, cause, n) { const d = this.stats.died; (d[k] || (d[k] = {}))[cause] = (d[k][cause] || 0) + n; }

  // ---------- schools meet and merge, and split when large ----------
  _schools() {
    const f = this.fish, born = [];
    for (let i = 0; i < f.length; i++) {
      const a = f[i]; if (!a.alive || !a.school) continue;
      const s = a.s;
      if (a.n > s.school * F3.SPLIT) { born.push(this._split(a)); continue; }
      // the nearest school of its kind and size within reach
      const S = this.hStart, I = this.hItems, hc = this._hc(a.x, a.y);
      for (let q = S[hc]; q < S[hc + 1]; q++) {
        const b = f[I[q]]; if (!b || b === a || !b.alive || b.k !== a.k || !b.school) continue;
        if (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > F3.MERGE_R) continue;
        const lr = a.L > b.L ? a.L / b.L : b.L / a.L; if (lr > F3.MERGE_LR || a.n + b.n > s.school * F3.MERGE_MAX) continue;
        this._merge(a, b); break;
      }
    }
    for (const b of born) this.fish.push(b);
  }
  _merge(a, b) {   // b joins a; the school keeps one parent's genome, chosen ∝ n
    const tot = a.n + b.n, wa = a.n / tot, wb = b.n / tot;
    if (rand() < wb) { a.g = b.g; a.lw = b.lw; a.h = b.h; a.leak = b.leak; a.genes = b.genes; a.gen = b.gen; a.hue = b.hue; this._traits(a); }
    a.W = a.W * wa + b.W * wb; a.L = Math.max(a.L * wa + b.L * wb, 0.1); a.gut = a.gut * wa + b.gut * wb; a.gutE = a.gutE * wa + b.gutE * wb;
    a.gon = a.gon * wa + b.gon * wb; a.age = a.age * wa + b.age * wb; a.cons = a.cons + b.cons; a.consMax = a.consMax + b.consMax;
    a.mature = a.mature || b.mature; a.n = tot; b.alive = false; b.cause = 'merged'; b.n = 0;
    this._settle(a);
  }
  _split(a) {
    const b = new Fish(); Object.assign(b, a);
    b.id = this.nextId++; b.lw = Float32Array.from(a.lw); b.h = Float32Array.from(a.h); b.o = Float32Array.from(a.o);
    b.n = a.n / 2; a.n -= b.n; b.cons = a.cons = a.cons / 2; b.consMax = a.consMax = a.consMax / 2;
    b.yaw = a.yaw + (rand() < 0.5 ? 0.7 : -0.7); b.prey = b.threat = null;
    return b;
  }

  // ---------- reading the fish ----------
  count(k) { let n = 0; for (const a of this.fish) if (a.alive && (k === undefined || a.s.key === k)) n += a.n; return n; }
  biomass(k) { let w = 0; for (const a of this.fish) if (a.alive && (k === undefined || a.s.key === k)) w += a.n * a.W; return w; }   // g
  census() {
    const out = {};
    for (const k of KEYS3) out[k] = { n: 0, agents: 0, g: 0, L: 0, cons: 0, consMax: 0, mature: 0 };
    for (const a of this.fish) {
      if (!a.alive) continue; const r = out[a.s.key];
      r.n += a.n; r.agents++; r.g += a.n * a.W; r.L += a.n * a.L; r.cons += a.n * a.cons; r.consMax += a.n * a.consMax; if (a.mature) r.mature += a.n;
    }
    for (const k of KEYS3) { const r = out[k]; r.L /= Math.max(1e-9, r.n); r.p = r.cons / Math.max(1e-12, r.consMax); r.kgHa = r.g / 1000 / this.lakeHa; r.perHa = r.n / this.lakeHa; r.meanW = r.g / Math.max(1e-9, r.n); }
    return out;
  }
  resetIntake() { for (const a of this.fish) { a.cons = 0; a.consMax = 0; } }
  // the fish for the renderer: [x, y, z, yaw, pitch, length (cm), species index, n, speed] per agent
  snapshot(out) {
    const f = this.fish; let q = 0; const need = f.length * 9; if (!out || out.length < need) out = new Float32Array(need * 1.25 | 0);
    for (const a of f) { if (!a.alive) continue; out[q++] = a.x; out[q++] = a.y; out[q++] = a.z; out[q++] = a.yaw; out[q++] = a.pitch; out[q++] = a.L; out[q++] = a.k; out[q++] = a.n; out[q++] = a.spd; }
    return { buf: out, n: q / 9 };
  }
}
