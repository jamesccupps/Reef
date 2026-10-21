// layout.js — the GPU fish engine's DATA (docs/GPU_SIM.md, G1) — pure, DOM-free: no WebGPU here, so Node can test it.
// The engine (gpufish.js) keeps the fish and the young schools on the GPU as STRUCTS OF ARRAYS: one f32 buffer per kind, field-
// major (field f of agent i at f·cap + i — neighbouring threads read neighbouring words), the integer fields as their bit
// patterns (bitcast<u32> in WGSL). This module defines the fields, packs a Fish3's agents into those arrays and back, packs the
// lakes' static tables (the bed's rasters, the water's columns and cells, the fish's species and FB4 sets, the brook's path…)
// and writes the WGSL constants for all of it FROM THE CPU SIM'S OWN CONFIG — the two engines read one set of numbers.
import { GEO, LAND, UPPER, LOWER, BROOK } from '../geometry.js';
import { F3, S3, KEYS3, HID3, genomeLen3, W2OFF3, NW2_3, IN3, OUT3, PREY_LR0, GATE, LAKE_NEAR, leak3, newFish, newYoy } from '../fish3.js';
import { CLOCK3, TS, DAY3, OLD_S } from '../clock3.js';
import { A2 } from '../chem3.js';
import { OXYCAL } from '../../bioenergetics.js';
import { LIT3 } from '../littoral3.js';
import { ENV, BIOE, PLANKTON, ZOO3, BENTHOS, PREY, FEED, LEARN, BRAIN, ACTION, SPAWN, ICE, FRY, BROOD, WINTER0, winterWindow, winterWindowJE } from '../../config.js';

export const NG = genomeLen3(HID3);   // 346 genome weights
export const NBR = NW2_3 + HID3 + OUT3.length;   // the brain's state an agent: its plastic hidden→output block (60), h (10), o (6)
export const NGENES = 7;
export const NGN = NG + NGENES;   // an agent's (or a young school's) row in GN/YG: its genome, then its 7 genes

// ---------- the agent's fields (type 'u' u32, 'i' i32, else f32) ----------
// times: age in whole seconds (u32 — f32 would round a block's 1,752 s at a 17-year age by ~0.5 %), lastSpawn and tripEnd in DAYS
// since the clock's zero (f32: a day's 0.002 at fifty years)
export const AGENT_FIELDS = [
  ['id', 'u'], ['k', 'u'], ['flags', 'u'], ['sex', 'u'], ['gen', 'u'], ['active', 'u'], ['lake', 'u'], ['inLake', 'u'], ['spYr', 'i'], ['runYr', 'i'],
  ['c', 'i'], ['j', 'i'], ['jb', 'i'], ['fk', 'u'], ['prey', 'i'], ['threat', 'i'], ['mate', 'i'], ['mateId', 'u'], ['age', 'u'],
  'lastSpawnD', 'tripEndD',
  'n', 'x', 'y', 'z', 'yaw', 'pitch', 'spd', 'hx', 'hy', 'L', 'W', 'K', 'Lmat', 'gon', 'gut', 'gutE', 'hue', 'mateCd', 'hunger', 'fear', 'energy',
  'uAvg', 'xo', 'xt', 'rO2', 'eaten', 'cons', 'consMax', 'thrust', 'missCd', 'tAvg',
  'spdGene', 'turnMax0', 'sense0', 'bodyMul', 'tempTol', 'o2Crit', 'o2Lethal', 'o2Ice', 'uilt', 'metabMul',
  'gape', 'bdep', 'spdMax', 'turnMax', 'senseR', 'bed', 'T', 'o2', 'vis', 'cover', 'visF', '_vx', '_vy', '_need',
  'fx', 'fy', 'fz', 'fd', 'fv', 'td', 'ax', 'ay', 'az', 'an', 'nt', 'nx', 'ny', 'nz', 'nestX', 'nestY', 'spX', 'spY',
  'lhx', 'lhy', 'tpx', 'tpy', 'dhx', 'dhy', 'cm', 'surfG',
  // SCRATCH (the block's working values on the GPU; never packed nor unpacked): the feeding's room, want, got…, a strike's claim
  ['fGEff', 's'], ['fPerf', 's'], ['fRoom', 's'], ['fWant', 's'], ['fGot', 's'], ['gut0', 's'], ['claim', 'si'], ['claimP', 'su'],
  ['qB', 's'], ['qW', 's'], ['qC', 's'], ['qS', 's'], ['qZD', 's'], ['qZC', 's'], ['qFlags', 's'], ['qSed', 's'], ['birth', 'si'], ['bid', 'su'],
].map(f => Array.isArray(f) ? f : [f, 'f']);
export const AF = Object.fromEntries(AGENT_FIELDS.map(([n], i) => [n, i]));
export const NAF = AGENT_FIELDS.length;
// flag bits
export const FL = { ALIVE: 1, SCHOOL: 2, MATURE: 4, RIPE: 8, BROOKIE: 16, BROOKRUN: 32, INRUN: 64, DECIDED: 128, ATE: 256, FAR: 512, ESC: 1024 };
const FLAG_OF = [['alive', FL.ALIVE], ['school', FL.SCHOOL], ['mature', FL.MATURE], ['ripe', FL.RIPE], ['brookie', FL.BROOKIE], ['brookRun', FL.BROOKRUN],
  ['inRun', FL.INRUN], ['_ate', FL.ATE], ['_far', FL.FAR]];

// ---------- a young school's fields ----------
export const YOY_FIELDS = [
  ['id', 'u'], ['k', 'u'], ['flags', 'u'], ['gen', 'u'], ['c', 'i'], ['j', 'i'], ['jb', 'i'], ['guard', 'u'], ['gref', 'i'], ['age', 'u'],
  'n', 'x', 'y', 'z', 'tx', 'ty', 'tz', 'bed', 'L', 'W', 'bdep', 'hue', 'tk', 'rO2', 'p', 'cover', 'nx', 'ny', 'hd', 'spotBed',
  // SCRATCH: where it began the block; this tick's water, wants, its requests of each food, what it got, its starvation hazard
  ['sx', 's'], ['sy', 's'], ['sz', 's'], ['feeds', 's'], ['st', 's'], ['yT', 's'], ['yo2', 's'], ['want', 's'], ['got', 's'], ['J', 's'], ['hS', 's'],
  ['qPrey', 'si'], ['qPk', 's'], ['qD', 's'], ['qC', 's'], ['qR', 's'], ['qWs', 's'], ['qWl', 's'], ['qB', 's'], ['qSed', 's'], ['eaten', 's'], ['recruit', 's'], ['wZ', 's'],
  ['yb', 'si'], ['ya', 's'],   // (stage Y1: its prey-table bin and the n of it available — fish3 _yTable)
].map(f => Array.isArray(f) ? f : [f, 'f']);
export const YF = Object.fromEntries(YOY_FIELDS.map(([n], i) => [n, i]));
export const NYF = YOY_FIELDS.length;
export const YFL = { ALIVE: 1 };

const DAY = DAY3, YEAR = CLOCK3.YEAR_LEN;
const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer), i32 = new Int32Array(f32.buffer);
const asF = (v, t) => { if (t === 'u' || t === 'su') { u32[0] = v >>> 0; return f32[0]; } if (t === 'i' || t === 'si') { i32[0] = v | 0; return f32[0]; } return v; };
const fromF = (v, t) => { f32[0] = v; return t === 'u' || t === 'su' ? u32[0] : t === 'i' || t === 'si' ? i32[0] : v; };
const SCRATCH = t => t[0] === 's';
const cleanF = v => v === Infinity ? 3e38 : v === -Infinity ? -3e38 : v !== v ? 0 : v;   // (NaN fields — "none" — packed as 0 with a flag where it matters)
const tD = t => t < -1e17 ? -1e18 : t / DAY;   // (a time, s → days; "never" stays "never")

// THE AGENTS of a Fish3 (or a list of them) into the struct of arrays: A (NAF × cap), GN (genomes, NG × cap), BR (the brain's
// state, NBR × cap) — GN holds the genes too, after the genome (NGN rows). Returns the slot of each fish (Map fish → slot) so references (prey, mate, a brood's
// guardian) can be written as slots. Spawning sites, a plant spawner's chosen place and last year's nest are NaN when unset: they
// pack as NaN-free values with flags in spare bits of `flags` (bit 16 spX set, bit 17 nest set)
export const FL_SP = 1 << 16, FL_NEST = 1 << 17;
// (the fields' kinds, once: a plain number of its type, a scratch value, or one of the special cases below — the writes and reads go
// straight through the arrays' u32/i32 views: G3's hand-overs move 300,000 fish each way)
const SPECIAL = new Set(['flags', 'prey', 'threat', 'mate', 'mateId', 'age', 'lastSpawnD', 'tripEndD', 'dhx', 'dhy', 'cm']);
const FK = AGENT_FIELDS.map(([name, t], f) => ({ f, name, t, sp: SPECIAL.has(name) }));
const FK_PLAIN = FK.filter(k => !k.sp && !SCRATCH(k.t)), FK_SCR = FK.filter(k => SCRATCH(k.t));
const views = A => [new Uint32Array(A.buffer, A.byteOffset, A.length), new Int32Array(A.buffer, A.byteOffset, A.length)];
export function packAgents(fish, cap, out = null) {
  const A = out?.A || new Float32Array(NAF * cap), GN = out?.GN || new Float32Array(NGN * cap), BR = out?.BR || new Float32Array(NBR * cap), [Au, Ai] = views(A);
  const slot = new Map(); let n = 0;
  for (const a of fish) { if (!a.alive) continue; slot.set(a, n++); }
  if (n > cap) throw new Error(`packAgents: ${n} fish over capacity ${cap}`);
  const ref = r => r && slot.has(r) ? slot.get(r) : -1;
  for (const [a, i] of slot) {
    let flags = 0; for (const [k, b] of FLAG_OF) if (a[k]) flags |= b;
    if (a._dh) flags |= FL.DECIDED; if (a.esc) flags |= FL.ESC;
    if (a.spX === a.spX) flags |= FL_SP; if (a.nestX === a.nestX) flags |= FL_NEST;
    for (const k of FK_PLAIN) { const o = k.f * cap + i, v = a[k.name]; if (k.t === 'f') A[o] = cleanF(+v); else if (k.t === 'u') Au[o] = v >>> 0; else Ai[o] = v | 0; }
    for (const k of FK_SCR) { if (k.t === 'si') Ai[k.f * cap + i] = -1; else A[k.f * cap + i] = 0; }
    Au[AF.flags * cap + i] = flags >>> 0;
    Ai[AF.prey * cap + i] = ref(a.prey); Ai[AF.threat * cap + i] = ref(a.threat); Ai[AF.mate * cap + i] = ref(a.mate); Au[AF.mateId * cap + i] = a.mate ? a.mate.id >>> 0 : 0;
    Au[AF.age * cap + i] = Math.round(a.age) >>> 0; A[AF.lastSpawnD * cap + i] = cleanF(tD(a.lastSpawn)); A[AF.tripEndD * cap + i] = cleanF(tD(a.tripEnd));
    A[AF.dhx * cap + i] = a._dh ? cleanF(a._dh[0]) : 0; A[AF.dhy * cap + i] = a._dh ? cleanF(a._dh[1]) : 0; A[AF.cm * cap + i] = 0;
    const g = a.g, lw = a.lw, h = a.h, o = a.o, ge = a.genes;
    for (let q = 0; q < NG; q++) GN[q * cap + i] = g[q];
    for (let q = 0; q < NW2_3; q++) BR[q * cap + i] = lw[q];
    for (let q = 0; q < HID3; q++) BR[(NW2_3 + q) * cap + i] = h[q];
    for (let q = 0; q < OUT3.length; q++) BR[(NW2_3 + HID3 + q) * cap + i] = o[q];
    for (let q = 0; q < NGENES; q++) GN[(NG + q) * cap + i] = ge[q];
  }
  return { A, GN, BR, n, slot };
}
// one agent's fields from the arrays (plain numbers by name; references as slots) — for the checks
export function readAgent(A, cap, i) {
  const o = {}; for (let f = 0; f < NAF; f++) { const [name, t] = AGENT_FIELDS[f]; o[name] = fromF(A[f * cap + i], t); }
  for (const [k, b] of FLAG_OF) o[k] = !!(o.flags & b); o.decided = !!(o.flags & FL.DECIDED); o.esc = o.flags & FL.ESC ? 1 : 0;
  return o;
}
// the arrays back into the Fish3's objects (by slot), every simulated field — genome, learned block, brain state too; references
// resolved through the slots (fishBySlot: slot → fish)
export function unpackAgents(P, cap, fishBySlot, opts = {}) {
  const { A, GN, BR } = P, [Au, Ai] = views(A);
  for (let i = 0; i < fishBySlot.length; i++) {
    const a = fishBySlot[i]; if (!a) continue;
    for (const k of FK_PLAIN) { const o = k.f * cap + i; a[k.name] = k.t === 'f' ? A[o] : k.t === 'u' ? Au[o] : Ai[o]; }
    const flags = Au[AF.flags * cap + i];
    for (const [k, b] of FLAG_OF) a[k] = !!(flags & b);
    a.esc = flags & FL.ESC ? 1 : 0; a._dh = flags & FL.DECIDED ? [A[AF.dhx * cap + i], A[AF.dhy * cap + i]] : null;
    a.age = Au[AF.age * cap + i];
    const ls = A[AF.lastSpawnD * cap + i], te = A[AF.tripEndD * cap + i]; a.lastSpawn = ls < -1e17 ? -1e18 : ls * DAY; a.tripEnd = te < -1e17 ? -1e18 : te * DAY;
    if (!(flags & FL_SP)) { a.spX = NaN; a.spY = NaN; } if (!(flags & FL_NEST)) { a.nestX = NaN; a.nestY = NaN; }
    const pr = Ai[AF.prey * cap + i], th = Ai[AF.threat * cap + i], ma = Ai[AF.mate * cap + i];
    a.prey = pr >= 0 ? fishBySlot[pr] || null : null; a.threat = th >= 0 ? fishBySlot[th] || null : null;
    a.mate = ma >= 0 && fishBySlot[ma] && Au[AF.id * cap + ma] === Au[AF.mateId * cap + i] ? fishBySlot[ma] : null;   // (the mate's id as the arrays hold it: a new object later in the list has no id yet)
    if (opts.brain !== false) {
      const g = a.g, lw = a.lw, h = a.h, o = a.o, ge = a.genes;
      for (let q = 0; q < NG; q++) g[q] = GN[q * cap + i];
      for (let q = 0; q < NW2_3; q++) lw[q] = BR[q * cap + i];
      for (let q = 0; q < HID3; q++) h[q] = BR[(NW2_3 + q) * cap + i];
      for (let q = 0; q < OUT3.length; q++) o[q] = BR[(NW2_3 + HID3 + q) * cap + i];
      for (let q = 0; q < NGENES; q++) ge[q] = GN[(NG + q) * cap + i];
    }
  }
}

// THE YOUNG SCHOOLS into their arrays: Y (NYF × ycap), YG (genomes, then genes: NGN rows); gref as the guardian's agent slot
export function packYoy(yoy, ycap, agentSlot, out = null) {
  const Y = out?.Y || new Float32Array(NYF * ycap), YG = out?.YG || new Float32Array(NGN * ycap);
  const slot = new Map(); let n = 0;
  for (const q of yoy) { if (!q.alive) continue; slot.set(q, n++); }
  if (n > ycap) throw new Error(`packYoy: ${n} schools over capacity ${ycap}`);
  for (const [q, i] of slot) {
    for (let f = 0; f < NYF; f++) {
      const [name, t] = YOY_FIELDS[f]; let v;
      switch (name) {
        case 'flags': v = YFL.ALIVE; break;
        case 'gref': v = q.gref && agentSlot && agentSlot.has(q.gref) ? agentSlot.get(q.gref) : -1; break;
        case 'age': v = Math.round(q.age); break;
        default: v = SCRATCH(t) ? (t === 'si' ? -1 : 0) : q[name];
      }
      Y[f * ycap + i] = asF(t === 'f' ? cleanF(+v) : v, t);
    }
    for (let k = 0; k < NG; k++) YG[k * ycap + i] = q.g[k];
    for (let k = 0; k < NGENES; k++) YG[(NG + k) * ycap + i] = q.genes[k];
  }
  return { Y, YG, n, slot };
}
export function readYoy(Y, ycap, i) { const o = {}; for (let f = 0; f < NYF; f++) { const [name, t] = YOY_FIELDS[f]; o[name] = fromF(Y[f * ycap + i], t); } o.alive = !!(o.flags & YFL.ALIVE); return o; }

// ---------- THE HAND-BACK: the GPU engine's lakes back into a Fish3 (fast-forward ends; the fine steps near the camera resume) ----------
// The live agents (slots 0..n) and young schools (0..ny) as F's objects, in slot order: one that was in F's lists before (by id)
// keeps its object, one born on the GPU gets a new one; every simulated field, the genome (a school's merge may have given it the
// other's — its leak recomputed), the learned block and the brain's state; references through the slots. An object F held that is
// not among them died on the GPU. The fidelity ladder's bookkeeping restarts: the next step rebuilds the lakes' hash and, with a
// focus, the far fish's schedule. P: { A, BR, GN, Y, YG } as the engine's buffers (field-major, strides cap and ycap)
export function materialize(F, P, cap, ycap, n, ny, nextId) {
  const byId = new Map(), yById = new Map(); for (const a of F.fish) byId.set(a.id, a); for (const q of F.yoy) yById.set(q.id, q);
  const { A, Y, YG } = P, seen = new Set(), own = (o, key, len) => { if (!o[key] || o[key].length !== len || seen.has(o[key])) o[key] = new Float32Array(len); seen.add(o[key]); };
  const bySlot = new Array(n).fill(null), fish = [];
  for (let i = 0; i < n; i++) {
    if (!(fromF(A[AF.flags * cap + i], 'u') & FL.ALIVE)) continue;
    const id = fromF(A[AF.id * cap + i], 'u'), k = fromF(A[AF.k * cap + i], 'u');
    let a = byId.get(id); if (a && a.k !== k) a = null;
    if (a) byId.delete(id); else { a = newFish(); a.s = S3[KEYS3[k]]; }
    own(a, 'g', NG); own(a, 'lw', NW2_3); own(a, 'h', HID3); own(a, 'o', OUT3.length); own(a, 'genes', NGENES);   // (arrays a fish shared with another — a merge's genome — made its own)
    bySlot[i] = a; fish.push(a);
  }
  unpackAgents(P, cap, bySlot);
  for (let i = 0; i < fish.length; i++) {
    const a = fish[i]; a.leak = leak3(a.g); a.cause = ''; a.near = false; a._i = i; a._t0 = F.time; a._due = -1; a._out = false;
    a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch;
  }
  for (const a of byId.values()) if (a.alive) { a.alive = false; a.cause = a.cause || 'died'; }
  const yoy = [];
  for (let q = 0; q < ny; q++) {
    if (!(fromF(Y[YF.flags * ycap + q], 'u') & YFL.ALIVE)) continue;
    const o = readYoy(Y, ycap, q); let y = yById.get(o.id); if (y && y.k !== o.k) y = null;
    if (y) yById.delete(o.id); else { y = newYoy(); y.s = S3[KEYS3[o.k]]; }
    for (const [name, t] of YOY_FIELDS) if (!SCRATCH(t) && name !== 'flags' && name !== 'gref') y[name] = o[name];
    y.gref = o.gref >= 0 && o.gref < n ? bySlot[o.gref] : null;
    own(y, 'g', NG); own(y, 'genes', NGENES);
    for (let r = 0; r < NG; r++) y.g[r] = YG[r * ycap + q];
    for (let r = 0; r < NGENES; r++) y.genes[r] = YG[(NG + r) * ycap + q];
    y.alive = true; y.near = false; y._t0 = F.time; y._due = -1; y._out = false; y._px = y.x; y._py = y.y; y._pz = y.z;
    yoy.push(y);
  }
  for (const q of yById.values()) q.alive = false;
  F.fish = fish; F.yoy = yoy; if (nextId !== undefined) F.nextId = nextId;
  F._mixOn = false; F._yMixOn = false; F._needHash = true; F._region = null; F._yRegion = null;
  return { fish: fish.length, yoy: yoy.length };
}
// the engine's tallies (pairs, already summed to numbers: GpuFish.readTallies) into a Fish3's stats tree — what the GPU's blocks
// counted since the tallies were last cleared (wgsl.js TALLY's layout: word offsets / 2)
const T_FOODS = ['zoo', 'benth', 'weed', 'cray', 'surf', 'fish', 'sed', 'yoy', 'yZoo', 'yWeed', 'yBenth', 'ySed'];
const T_CAUSES = ['starve', 'heat', 'hypoxia', 'other', 'old', 'eaten', 'stranded'], T_FATES = ['natural', 'starve', 'heat', 'hypoxia', 'eaten', 'recruited', 'hatched'];
export function statsAdd(st, tl, time = 0) {
  const NK = KEYS3.length, M = 1e6;
  T_FOODS.forEach((f, q) => { st.food[f] = (st.food[f] || 0) + tl[64 + q] / M; });
  KEYS3.forEach((k, q) => {
    st.cross[k] += tl[q] / M; st.settle[k] += tl[16 + q] / M; st.trips[k] += tl[32 + q] / M;
    const g = tl[80 + q] / M; if (g > 0) st.intakeBy[k] = (st.intakeBy[k] || 0) + g;
    KEYS3.forEach((kq, r) => { const v = tl[96 + q * NK + r] / M; if (v > 0) { const key = `${k}>${kq}`; st.eatenBy[key] = (st.eatenBy[key] || 0) + v; st.kills += v; } });
    const d = st.died[k] || (st.died[k] = {}); T_CAUSES.forEach((c, j) => { const v = tl[224 + q * 7 + j] / M; if (v > 0) d[c] = (d[c] || 0) + v; });
    T_FATES.forEach((c, j) => { st.fry[k][c] += tl[320 + q * 7 + j] / M; }); st.fry[k].capped = (st.fry[k].capped || 0) + tl[910 + q] / M;
    const sp = tl[412 + q] / M; st.eggs[k] += tl[400 + q]; st.spawns[k] += sp; st.recruits[k] += tl[460 + q] / M; st.solo[k] += tl[472 + q] / M;
    const at = st.spawnAt[k]; at.sub += tl[424 + q] / M; at.bed += tl[436 + q] / M; at.brook += tl[448 + q] / M; if (sp > 0 && at.first < 0) at.first = time;
  });
  return st;
}

// ---------- the species table (SP_REC floats a species) and the FB4 sets (BIO_REC a set; two a species: adult, juvenile) ----------
export const SPF = ['school', 'perHa', 'perM2', 'cruise', 'sprint', 'sustain', 'turn', 'sense', 'nonVis', 'strikeR', 'cohere', 'home', 'tPref', 'kI', 'uRoutine',
  'pisc', 'plank', 'sift', 'benthic', 'cray', 'preyLR', 'maxAge', 'matMinAge', 'mateCdS', 'forageR', 'mateCue', 'guard', 'gsiF', 'gsiM', 'Lpisc', 'Lzoo',
  'Lsnail', 'benthL', 'capture', 'vuln', 'gapeR', 'depthR', 'gut', 'gerMul', 'tempOpt', 'coldPerf', 'Lref', 'lwA', 'lwB', 'juvMode', 'juvW', 'M',
  'uiltS', 'o2LethalS', 'o2IceS', 'spawnT0', 'spawnT1', 'sbBot0', 'sbBot1', 'sbH', 'sbBrook', 'sbSiteBrook', 'sbSub', 'sbFaith', 'sbSites', 'sbRunK', 'sbBare',
  'brookRes', 'brookYoy', 'dSnail', 'dInsect', 'dLarva', 'dDetritus', 'dPlankton', 'dFish', 'solo', 'group0', 'group1', 'only', 'nearBrook', 'minL', 'found',
  'fecA', 'fecB', 'sHatch', 'Lhatch', 'L0', 'pelagicFry', 'Lmat', 'LmatM', 'tempTolS', 'o2CritS', 'Linf', 'vbK', 'vbT0',
  'mvSettle', 'mvYf0', 'mvYf1', 'mvTrip', 'mvTripYf0', 'mvTripYf1', 'mvTripD',
  // the habitat: day, night, winter × [bot0, bot1, v, h, act]
  'hD0', 'hD1', 'hDv', 'hDh', 'hDa', 'hN0', 'hN1', 'hNv', 'hNh', 'hNa', 'hW0', 'hW1', 'hWv', 'hWh', 'hWa',
  // the cold rule (bioenergetics.js coldResp/coldCmax): mode 0 none, 1 an empirical curve, 2 the adult set's for a juvenile, 3 FB4's × mul
  'cMode', 'cT0', 'cT1', 'cR5', 'cWref', 'cB', 'cQ10', 'cMul', 'cQuiet', 'cQa', 'cQb', 'cAdC',
  'yCover', 'yLpisc',   // (the young's weight on cover, fish3 _yoyTarget; the length a young school starts eating other young, _feedYoy)
  'hJL0', 'hJL1', 'hJ0', 'hJ1', 'hJW0', 'hJW1', 'bury', 'schExp', 'wkMin', 'wkMax', 'wjA', 'wjB', 'wjC',
  'aMax', 'vHunt', 'predCls', 'cs0', 'cs1', 'cs2', 'ppr0', 'act0', 'act1', 'act2', 'shD0', 'shD1', 'shN0', 'shN1', 'shT0', 'shT1', 'g0', 'yBed', 'pGate', 'spineW', 'buryL', 'skW', 'skL', 'skBig', 'spawnEnd', 'insR', 'rockC', 'rockL', 'pprm0', 'pprm1', 'pprm2', 'cmaxL', 'reproA', 'mOther'];   // (mOther: S3 mOther, its adults' unsimulated share of M — BIOE.M_OTHER unless set)   // (reproA: S3 reproA, its gonads' share of its surplus — BIOE.REPRO_ALLOC unless set)   // (cmaxL: S3 cmaxL, its larvae's Cmax multiplier — FRY.CMAX_LARVA unless set)   // (pprm0–2: S3 pprM — the size ratio its capture success was measured at, by predator kind: F3.SIZE_RENORM)   // (rockC/rockL: S3 rockC — the rocky shallows' cover for its fish up to rockL cm)   // (insR: S3 insR, its extra reach for the weeds' and the surface's insects)   // (spawnEnd: S3 spawnEnd, its own spawning season's end yf — 0: SPAWN.SEASON_END)   // (sk*: its cover drive, S3 seek — skW 0: none)   // (buryL: S3 buryL — only the fish up to it bury)   // (spineW: a bullhead's spines in the gape test, S3 spineW)   // (pGate: the hunger gate in proportion to its appetite, S3 pGate)   // (g0: the hunger gate's G0, S3 G0)   // (sh*: its shore band by day, night, twilight in the world's metres — S3 shore; 0: none)   // (F3.STRIKE2: strikes /s at most, its hunting speed, its kind; the prey's capture success by an esocid, a bass, a perch-like predator; its size term's PPR0)   // (hJW: the young's winter band — hJW1 0: the adults')   // (schExp: a predator's school exponent, S3 schoolExp)   // (the young's day band by size, S3 habJ — hJL1 0: none; a burrower's winter cover)
export const SP_REC = 180;   // (≥ SPF.length: room to add fields)
if (SPF.length > SP_REC) throw new Error(`layout: ${SPF.length} species fields overflow SP_REC ${SP_REC}`);   // (a silent overflow would write into the next species)
export const SPO = Object.fromEntries(SPF.map((n, i) => [n, i]));
const K_I = { sunfish: 5, perch: 1, sucker: 2, catfish: 5, whiteperch: 0.5, bass: 0.003, pike: 0.5, redbreast: 5, fallfish: 1, killifish: 0.5, dace: 1 };   // (fish3.js K_I)
const SUB_KIND = { rigid: 1, mat: 2, plant: 3 };
export const BIOF = ['CEQ', 'CA', 'CB', 'CQ', 'CTO', 'CTM', 'CTL', 'CK1', 'CK4', '_cX', '_g1', '_g2', 'hotT', 'cTmax',
  'hCEQ', 'hCA', 'hCB', 'hCQ', 'hCTO', 'hCTM', 'hCTL', 'hCK1', 'hCK4', 'h_cX', 'h_g1', 'h_g2',
  'REQ', 'RA', 'RB', 'RQ', 'RTO', 'RTM', 'RTL', 'RK1', 'RK4', 'RK5', 'ACT', 'BACT', '_rX',
  'SDA', 'EGEQ', 'FA', 'FB', 'FG', 'EXEQ', 'UA', 'UB', 'UG', 'PREDEDEQ', 'ED', 'Alpha1', 'Beta1', 'Cutoff', 'Alpha2', 'Beta2'];
export const BIO_REC = 64;
export const BIOO = Object.fromEntries(BIOF.map((n, i) => [n, i]));
function packBio(b, out, o) {
  const v = n => { const x = b[n]; return x === undefined ? 0 : cleanF(x); };
  for (const n of BIOF) {
    let x;
    if (n === 'hotT') x = b.hot ? b.hot.T : 3e38;
    else if (n.startsWith('h') && n !== 'hotT' && BIOF.includes(n.slice(1))) { const h = b._hot; x = h ? (h[n.slice(1)] === undefined ? 0 : cleanF(h[n.slice(1)])) : 0; }
    else x = v(n);
    out[o + BIOO[n]] = x;
  }
}
export function packSpecies() {
  const NK = KEYS3.length, SPT = new Float32Array(NK * SP_REC), BIO = new Float32Array(NK * 2 * BIO_REC);
  KEYS3.forEach((k, i) => {
    const s = S3[k], sp = s.sp, sb = s.spawn, mv = s.move || {}, o = i * SP_REC, d = sp.diet;
    const V = {
      school: s.school || 0, perHa: s.perHa || 0, perM2: s.perM2 || 0, cruise: s.cruise, sprint: s.sprint, sustain: s.sustain, turn: s.turn, sense: s.sense, nonVis: s.nonVis,
      strikeR: s.strikeR, cohere: s.cohere, home: s.home, tPref: s.tPref, kI: K_I[k] ?? 1, uRoutine: s.uRoutine, pisc: s.pisc ? 1 : 0, plank: s.plank ? 1 : 0,
      sift: s.sift ? 1 : 0, benthic: s.benthic ? 1 : 0, cray: s.cray ? +d.cray : 0, preyLR: s.preyLR ?? PREY_LR0, maxAge: s.maxAge, matMinAge: s.matMinAge,
      mateCdS: s.mateCd, forageR: s.forageR, mateCue: s.mateCue, guard: s.guard, gsiF: sp.gsiF, gsiM: sp.gsiM, Lpisc: sp.Lpisc, Lzoo: sp.Lzoo ?? 0,
      Lsnail: sp.Lsnail || 0, benthL: sp.benthL ?? FRY.BENTH_L, capture: sp.capture, vuln: sp.vuln, gapeR: sp.gapeR, depthR: sp.depthR, gut: sp.gut,
      gerMul: sp.gerMul, tempOpt: sp.tempOpt, coldPerf: sp.coldPerf || 0, Lref: sp.Lref, lwA: sp.lw.a, lwB: sp.lw.b,
      juvMode: sp.bioJuv ? (sp.juvW ? 1 : 2) : 0, juvW: sp.juvW || 0, M: sp.M, uiltS: sp.uilt, o2LethalS: sp.o2Lethal, o2IceS: sp.o2Ice ?? 0,
      spawnT0: sp.spawnT[0], spawnT1: sp.spawnT[1], sbBot0: sb.bot[0], sbBot1: sb.bot[1], sbH: sb.h, sbBrook: sb.brook || 0, sbSiteBrook: sb.site === 'brook' ? 1 : 0,
      sbSub: SUB_KIND[sb.sub] || 0, sbFaith: sb.faith || 0, sbSites: sb.sites || 0, sbRunK: sb.runK || 0, sbBare: sb.bare ?? 1,
      brookRes: s.brookRes ? 1 : 0, brookYoy: s.brookYoy ? 1 : 0, dSnail: d.snail ? 1 : 0, dInsect: d.insect ? 1 : 0, dLarva: d.larva ? 1 : 0,
      dDetritus: d.detritus ? 1 : 0, dPlankton: d.plankton ? 1 : 0, dFish: d.fish ? 1 : 0, solo: s.solo ? 1 : 0, group0: s.group ? s.group[0] : 0,
      group1: s.group ? s.group[1] : 0, only: s.only || 0, nearBrook: s.nearBrook || 0, minL: s.minL || 7.5, found: s.found || 1,
      fecA: sp.fec.a, fecB: sp.fec.b, sHatch: sp.sHatch, Lhatch: sp.Lhatch, L0: sp.L0, pelagicFry: sp.pelagicFry || 0, Lmat: sp.Lmat, LmatM: sp.LmatM || 0,
      tempTolS: sp.tempTol, o2CritS: sp.o2Crit, Linf: sp.vb.Linf, vbK: sp.vb.k, vbT0: sp.vb.t0,
      mvSettle: mv.settle || 0, mvYf0: mv.yf ? mv.yf[0] : -1, mvYf1: mv.yf ? mv.yf[1] : -1, mvTrip: mv.trip || 0,
      mvTripYf0: mv.tripYf ? mv.tripYf[0] : -1, mvTripYf1: mv.tripYf ? mv.tripYf[1] : -1, mvTripD: mv.tripD || 0, yCover: s.yCover || 0, yLpisc: sp.yLpisc ?? sp.Lpisc,
      hJL0: s.habJ ? s.habJ.L[0] : 0, hJL1: s.habJ ? s.habJ.L[1] : 0, hJ0: s.habJ ? s.habJ.bot[0] : 0, hJ1: s.habJ ? s.habJ.bot[1] : 0,
      hJW0: s.habJ?.wbot ? s.habJ.wbot[0] : 0, hJW1: s.habJ?.wbot ? s.habJ.wbot[1] : 0, bury: s.bury || 0, schExp: s.schoolExp ?? F3.SCHOOL_EXP,
      wkMin: WINTER0.K[k] ? WINTER0.K[k][0] : 0, wkMax: WINTER0.K[k] ? WINTER0.K[k][1] : 0,
      wjA: F3.WIN_JE && WINTER0.JE[k] ? WINTER0.JE[k][0] : 0, wjB: F3.WIN_JE && WINTER0.JE[k] ? WINTER0.JE[k][1] : 0, wjC: F3.WIN_JE && WINTER0.JE[k] ? WINTER0.JE[k][2] : 0,   // (F3.WIN_JE: its own measured winter)
      aMax: s.aMax, vHunt: s.vHunt, predCls: s.predCls, cs0: s.cs[0], cs1: s.cs[1], cs2: s.cs[2], ppr0: s.ppr0, act0: s.act[0], act1: s.act[1], act2: s.act[2],
      shD0: s.shore ? GEO.SCALE * s.shore.day[0] : 0, shD1: s.shore ? GEO.SCALE * s.shore.day[1] : 0, shN0: s.shore ? GEO.SCALE * s.shore.night[0] : 0, shN1: s.shore ? GEO.SCALE * s.shore.night[1] : 0, shT0: s.shore ? GEO.SCALE * s.shore.tw[0] : 0, shT1: s.shore ? GEO.SCALE * s.shore.tw[1] : 0, g0: s.G0 || 0, yBed: s.yBed || 0, pGate: s.pGate || 0, spineW: s.spineW || 1, buryL: s.buryL || 0, skW: s.seek ? s.seek.w : 0, skL: s.seek ? s.seek.L : 0, skBig: s.seek ? s.seek.big : 0, spawnEnd: s.spawnEnd || 0, insR: s.insR || 0, rockC: s.rockC || 0, rockL: s.rockL || 0, pprm0: s.pprM ? s.pprM[0] : 0, pprm1: s.pprM ? s.pprM[1] : 0, pprm2: s.pprM ? s.pprM[2] : 0, cmaxL: s.cmaxL ?? FRY.CMAX_LARVA, reproA: s.reproA ?? BIOE.REPRO_ALLOC, mOther: s.mOther ?? BIOE.M_OTHER,   // (the first winter's ramp, config WINTER0: 0 none)
    };
    for (const [m, H] of [['D', s.hab.day], ['N', s.hab.night], ['W', s.hab.winter]]) { V['h' + m + '0'] = H.bot[0]; V['h' + m + '1'] = H.bot[1]; V['h' + m + 'v'] = H.v; V['h' + m + 'h'] = H.h; V['h' + m + 'a'] = H.act; }
    { const c = sp.cold; Object.assign(V, c ? { cMode: c.R5 ? 1 : c.adultR ? 2 : 3, cT0: c.T0, cT1: c.T1, cR5: c.R5 || 0, cWref: c.Wref || 1, cB: c.b || 0, cQ10: c.Q10 || 1,
      cMul: c.mul ?? 1, cQuiet: c.quiet || 0, cQa: c.quietT ? c.quietT[0] : 1, cQb: c.quietT ? c.quietT[1] : 0, cAdC: c.adultC ? 1 : 0 }
      : { cMode: 0, cT0: 0, cT1: -1e9, cR5: 0, cWref: 1, cB: 0, cQ10: 1, cMul: 1, cQuiet: 0, cQa: 1, cQb: 0, cAdC: 0 }); }
    for (const n of SPF) SPT[o + SPO[n]] = cleanF(V[n]);
    packBio(sp.bio, BIO, (2 * i) * BIO_REC); packBio(sp.bioJuv || sp.bio, BIO, (2 * i + 1) * BIO_REC);
  });
  return { SPT, BIO };
}

// ---------- THE STATICS: one f32 buffer of sections (offsets → WGSL constants) ----------
// The bed's rasters on GEO's fine grid (depth, body, the water column of each cell, the smoothed slope toward deeper water, the
// distance to shore and to water), the water's columns and cells (env3 buildColumns3), the fish's own lookups (fish3: bedOf,
// colBedJ, the neighbour rings, each column's bed cells, the footprints per radius), the littoral and plants' cell indices,
// the species and FB4 tables, the brook's path, its gates, the water near each end, the home cells by species and lake
export function packStatics(F, env) {
  const G = env.G, sec = [], add = (name, arr, type = 'f') => sec.push({ name, arr, type });
  // geometry
  const N = GEO.N, bodyU = new Uint32Array(N); for (let i = 0; i < N; i++) bodyU[i] = GEO.body[i];
  add('gDepth', GEO.depth); add('gBody', bodyU, 'u'); add('gColF', G.colOfFine, 'i'); add('gSlX', F.slopeX); add('gSlY', F.slopeY);
  add('gShore', GEO.shore); add('gToWater', GEO.toWater);
  // water columns and cells
  add('wGridCol', G.gridCol, 'i'); add('wCell0', G.cell0, 'i'); add('wNL', Uint32Array.from(G.nL), 'u'); add('wCX', G.cx); add('wCY', G.cy);
  add('wDepthMean', G.depthMean); add('wDepthMax', G.depthMax); add('wCBody', Uint32Array.from(G.body), 'u'); add('wArea', G.area);
  add('wZMid', G.zMid); add('wColOfCell', G.colOfCell, 'i'); add('wBedA', G.bedA); add('wVol', G.vol); add('wW', env.chem.w); add('wA', env.chem.a);
  add('wRefAv', env.chem.refAv);
  // the fish's lookups
  add('fBedOf', F.bedOf, 'i'); add('fColBedJ', F.colBedJ, 'i');
  const csr = (lists, name) => { const s = new Int32Array(lists.length + 1); for (let c = 0; c < lists.length; c++) s[c + 1] = s[c] + lists[c].length; const l = new Int32Array(s[lists.length]); for (let c = 0; c < lists.length; c++) l.set(lists[c], s[c]); add(name + '0', s, 'i'); add(name + 'L', l, 'i'); };
  csr(F.nbr, 'fNbr'); csr(F.nbr2, 'fNbr2'); csr(F.colBed, 'fColBed');
  // footprints: one CSR per distinct forage radius (fish3 _footprint: the columns within R of the column's centre)
  const radii = [...new Set(KEYS3.map(k => S3[k].forageR))].sort((a, b) => a - b), fpR = KEYS3.map(k => radii.indexOf(S3[k].forageR));
  for (let r = 0; r < radii.length; r++) { const R = radii[r], L = []; for (let c = 0; c < G.NC; c++) L.push(F._footprint(R, c)); csr(L, 'fFp' + r); }
  // littoral and plant indices (chem cell → their bed-cell index)
  add('litIdx', env.lit ? env.lit.idx : new Int32Array(G.NCELL).fill(-1), 'i');
  add('plIdx', env.plants ? env.plants.idxOf : new Int32Array(G.NCELL).fill(-1), 'i');
  // species and FB4 sets
  const { SPT, BIO } = packSpecies(); add('spT', SPT); add('bioT', BIO);
  add('fpRad', Int32Array.from(fpR), 'i');
  // the brook: its path, each lake's gate out of it, the water ≥ 1.5 m nearest each end
  const BP = GEO.BROOK_PATH, bp = new Float32Array(BP.length * 2); BP.forEach((p, q) => { bp[2 * q] = p[0]; bp[2 * q + 1] = p[1]; }); add('bPath', bp);
  add('bGate', Float32Array.from([0, 0, GATE[UPPER][0], GATE[UPPER][1], GATE[LOWER][0], GATE[LOWER][1]])); add('bLakeNear', Float32Array.from([0, 0, LAKE_NEAR[UPPER][0], LAKE_NEAR[UPPER][1], LAKE_NEAR[LOWER][0], LAKE_NEAR[LOWER][1]]));
  // home cells by species and lake (fish3 _homeIn: water of its daytime bottom depths)
  const hl = []; for (const k of KEYS3) for (const lake of [UPPER, LOWER]) { const [lo, hi] = S3[k].hab.day.bot, l = []; for (let i = 0; i < N; i++) if (GEO.body[i] === lake && GEO.depth[i] >= lo && GEO.depth[i] <= hi) l.push(i); hl.push(l); }
  csr(hl, 'fHome');
  // the lake's roam weights (fish3 _roamMean) per lake
  add('fRoamMean', Float32Array.from([0, F._roamMean(UPPER), F._roamMean(LOWER), 0]));
  // assemble
  let off = 0; const offs = {};
  for (const s of sec) { offs[s.name] = off; off += s.arr.length; off = (off + 3) & ~3; }
  const ST = new Float32Array(off), U = new Uint32Array(ST.buffer), I = new Int32Array(ST.buffer);
  for (const s of sec) { const o = offs[s.name]; if (s.type === 'u') U.set(s.arr, o); else if (s.type === 'i') I.set(s.arr, o); else ST.set(s.arr, o); }
  const lens = Object.fromEntries(sec.map(s => [s.name, s.arr.length]));
  return { ST, offs, lens, radii, nFp: radii.length };
}

// ---------- THE SPAWNING GROUNDS (fish3 sites: per species and lake; re-chosen each spring by _siteSub) — a small buffer of their own:
// a header of 4 words per (species, lake) [first coordinate, count, grid offset or −1, grid length], the coordinates, then the
// nearest-site grids of the lakes with many (fish3 _siteIndex: MATE_HC cells, _sNX across)
export function packSites(F) {
  const NK = KEYS3.length, H = NK * 2 * 4, coords = [], grids = [], head = new Int32Array(H);
  KEYS3.forEach((k, ki) => [UPPER, LOWER].forEach((lake, li) => {
    const h = (ki * 2 + li) * 4, L = F.sites[k] ? F.sites[k][lake] : null, g = F._sGrid && F._sGrid[k] && F._sGrid[k][lake];
    head[h] = coords.length / 2; head[h + 1] = L ? L.length : 0; head[h + 2] = -1; head[h + 3] = 0;
    if (L) for (const p of L) coords.push(p[0], p[1]);
    if (g) { head[h + 2] = grids.length; head[h + 3] = g.length; for (let q = 0; q < g.length; q++) grids.push(g[q]); }
  }));
  const nC = coords.length, out = new Float32Array(H + nC + grids.length + 4), I = new Int32Array(out.buffer);
  I.set(head, 0); out.set(coords, H); I.set(grids, H + nC);
  return { SI: out, coordOff: H, gridOff: H + nC, sNX: F._sNX || 1 };
}

// ---------- THE WATER the fish read each block (uploaded after the water model steps): a dynamic f32 buffer of sections ----------
export function waterSections(env) {
  const G = env.G, ch = env.chem, lit = env.lit, pl = env.plants, NB = lit ? lit.cells.length : 1, NP = pl ? pl.spawnS.rigid.length : 1;
  return [['temp', G.NCELL], ['o2', G.NCELL], ['zooD', G.NCELL], ['zooC', G.NCELL], ['zooR', G.NCELL], ['zv', G.NCELL], ['plantRef', G.NCELL],
    ['benth', G.NCELL], ['sedOM', G.NCELL], ['ice', G.NC], ['canopy', G.NC], ['coverC', G.NC], ['o2Best', G.NC], ['surfA', G.NC], ['surfT', G.NC],
    ['litL', NB], ['litSn', NB], ['litS', NB], ['litCrA', NB], ['litCrY', NB], ['litKcr', NB], ['spRigid', NP], ['spMat', NP], ['spPlant', NP], ['pCov', NP], ['pReach', NP]];   // (pCov, pReach: plants3 cov, reachB per bed cell)
}
export function waterLayout(env) { let off = 0; const offs = {}, lens = {}; for (const [n, l] of waterSections(env)) { offs[n] = off; lens[n] = l; off += l; off = (off + 3) & ~3; } return { offs, lens, size: off }; }
// fill the dynamic water buffer from the env (o2Best: each column's better-oxygenated neighbour, fish3 _o2Better, or −1)
export function packWater(F, env, WL, out = null) {
  const W = out || new Float32Array(WL.size), I = new Int32Array(W.buffer), ch = env.chem, lit = env.lit, pl = env.plants, G = env.G, o = WL.offs;
  W.set(env.temp, o.temp); W.set(ch.o2, o.o2); W.set(ch.zooD, o.zooD); W.set(ch.zooC, o.zooC); W.set(ch.zooR, o.zooR); W.set(ch.zv, o.zv); W.set(ch.plantRef, o.plantRef);
  W.set(ch.benth, o.benth); W.set(ch.sedOM, o.sedOM); W.set(env.ice, o.ice);
  if (pl) { W.set(pl.cov, o.pCov); W.set(pl.reachB, o.pReach); W.set(pl._canopy, o.canopy); for (let c = 0; c < G.NC; c++) W[o.coverC + c] = pl.coverAt(c); W.set(pl.spawnS.rigid, o.spRigid); W.set(pl.spawnS.mat, o.spMat); W.set(pl.spawnS.plant, o.spPlant); }
  F._o2cAt = -1; for (let c = 0; c < G.NC; c++) I[o.o2Best + c] = F._o2Better(c);
  if (lit) { W.set(lit.surfA, o.surfA); W.set(lit.surfT, o.surfT); W.set(lit.L, o.litL); W.set(lit.sn, o.litSn); W.set(lit.S, o.litS); W.set(lit.crA, o.litCrA); W.set(lit.crY, o.litCrY); W.set(lit.Kcr, o.litKcr); }
  return W;
}

// ---------- THE WGSL CONSTANTS: every number the kernels share with the CPU sim, from its own config ----------
const wf = v => { if (v === Infinity || v >= 3e38) return '3e38'; if (v === -Infinity) return '-3e38'; const s = String(+v); return /[.eE]/.test(s) ? s : s + '.0'; };
export function wgslConstants(STL, WL, extra = {}) {
  const L = [];
  const C = (n, v) => L.push(`const ${n}: f32 = ${wf(v)};`), CU = (n, v) => L.push(`const ${n}: u32 = ${v >>> 0}u;`), CI = (n, v) => L.push(`const ${n}: i32 = ${v | 0};`);
  // the world
  CU('GNX', GEO.NX); CU('GNY', GEO.NY); CU('GNCELLS', GEO.N); C('GCELL', GEO.CELL); C('GX0', GEO.X0); C('GY0', GEO.Y0); C('GXMAX', GEO.XMAX); C('GYMAX', GEO.YMAX);
  C('GSCALE', GEO.SCALE); C('GBROOK_SCALE', GEO.BROOK_SCALE); CU('LAND', LAND); CU('UPPER', UPPER); CU('LOWER', LOWER); CU('BROOK', BROOK);
  CU('BPN', GEO.BROOK_PATH.length); CU('BLAST', GEO.BROOK_PATH.length - 1);
  const G = extra.G; CU('WNC', G.NC); CU('WNCELL', G.NCELL); CU('WML', G.ML); C('WDZ', G.DZ); C('WCOL', G.COL); CU('WCX', G.CX); CU('WCY', G.CY); C('WX0', G.X0); C('WY0', G.Y0);
  CU('OWN_BROOK', G.ownBrook ? 1 : 0); C('A2', A2);
  // the fish's tunables
  for (const [k, v] of Object.entries(F3)) if (typeof v === 'number') C('F3_' + k, v);
  for (const [blk, o] of [['BIOE', BIOE], ['PLANKTON', PLANKTON], ['ZOO3', ZOO3], ['BENTHOS', BENTHOS], ['PREY', PREY], ['FEED', FEED], ['LEARN', LEARN], ['BRAIN', BRAIN], ['ACTION', ACTION], ['SPAWN', SPAWN], ['ICE', ICE], ['FRY', FRY], ['BROOD', BROOD], ['LIT3', LIT3], ['WINTER0', WINTER0]])
    for (const [k, v] of Object.entries(o)) { if (typeof v === 'number') C(blk + '_' + k, v); else if (Array.isArray(v) && v.length <= 4 && v.every(x => typeof x === 'number')) v.forEach((x, q) => C(`${blk}_${k}_${q}`, x)); }
  C('WINTER0_ON', WINTER0.ON ? 1 : 0); C('WIN_YF0', winterWindow[0]); C('WIN_YF1', winterWindow[1]); C('WINJE_YF0', winterWindowJE[0]); C('WINJE_YF1', winterWindowJE[1]);
  C('ENV_O2_MGL', ENV.O2_MGL); C('ENV_COLD_PERF_MIN', ENV.COLD_PERF_MIN); C('ENV_HYPOXIA', ENV.HYPOXIA);
  C('OXYCAL', OXYCAL); C('YEAR', YEAR); C('DAY', DAY); C('TS', TS); C('OLD_S', OLD_S);
  CU('NK', KEYS3.length); CU('HID', HID3); CU('NI', IN3.length); CU('NO', OUT3.length); CU('NG', NG); CU('NBR', NBR); CU('NW2', NW2_3); CU('W2OFF', W2OFF3); CU('NGENES', NGENES); CU('NGN', NGN);
  CU('NAF', NAF); for (const [n] of AGENT_FIELDS) CU('A_' + n, AF[n]);
  CU('NYF', NYF); for (const [n] of YOY_FIELDS) CU('Y_' + n, YF[n]);
  for (const [n, b] of Object.entries(FL)) CU('FL_' + n, b); CU('FL_SP', FL_SP); CU('FL_NEST', FL_NEST);
  CU('SP_REC', SP_REC); for (const n of SPF) CU('S_' + n, SPO[n]);
  CU('BIO_REC', BIO_REC); for (const n of BIOF) CU('B' + n.replace(/^_/, 'u_'), BIOO[n]);
  for (const [n, o] of Object.entries(STL.offs)) CU('O_' + n, o);
  for (const [n, o] of Object.entries(WL.offs)) CU('W_' + n, o);
  CU('NFP', STL.nFp);
  for (const [k, v] of Object.entries(extra.consts || {})) typeof v === 'number' ? C(k, v) : null;
  return L.join('\n');
}
