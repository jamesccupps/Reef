// fishside3.js — the fish's side of the 3-D sim's workers (browser layer, no DOM): what a worker holding fish (render3/sim3worker.js
// alone, or each of the shards' render3/shard3worker.js) does with them for the view — remember their poses before a step (the view
// interpolates), choose and pack the fish and young it draws, the picked fish's card (click-a-fish), and its part of the data
// page's numbers (summed across the shards by statsMerge).
import { S3, KEYS3, IN3 } from '../fish3.js';
import { FORMS3 } from '../plants3.js';
import { CLOCK3, DAY3 } from '../clock3.js';
import { GEO, BODIES, UPPER, LOWER, BROOK } from '../geometry.js';
import { PLANKTON, ENV } from '../../config.js';
import { statsAdd, FL } from '../gpu/layout.js';

export const FISH_STRIDE = 18, YOY_STRIDE = 12;   // (render3/fish3view.js reads the same layout)
export const DRAW_R = 320, DRAW_CAM = 900;        // (m about where the view looks; none when the camera is farther than DRAW_CAM: they'd be sub-pixel)
export const SIZE_CL = [7.5, 15, 25, 35];         // (cm: the data page's size classes)
// THE CENSUS'S SIZE SPLIT (docs/FISH_CENSUS.md §2: fish ≥ 7.5 cm by number, each species in its own bands; smallmouth by age,
// years 1, 2, 3, 4+), for the data page's comparison — bullhead and sucker as revised 2026-10-18 ("The size splits revisited");
// white perch near-normal growth at ~450/ha (the human's catches, 2026-10-18)
export const CENSUS_SIZE = {
  whiteperch: { by: 'L', edges: [15, 22], frac: [0.55, 0.35, 0.10] },
  perch: { by: 'L', edges: [12, 15], frac: [0.60, 0.25, 0.15] },
  catfish: { by: 'L', edges: [20], frac: [0.7, 0.3] },
  sucker: { by: 'L', edges: [30], frac: [0.6, 0.4] },
  pike: { by: 'L', edges: [25, 38], frac: [0.55, 0.30, 0.15] },
  bass: { by: 'age', edges: [2, 3, 4], frac: [0.33, 0.17, 0.10, 0.40] },
};

// the poses a step starts from (with a focus on the true lakes: only the fish and young about it — they are the ones drawn)
export function remember(F, trueWorld) {
  const near = trueWorld && F.focus && F._region;
  for (const a of near ? F._region : F.fish) { a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch; }
  for (const q of near ? (F._yRegion || []) : F.yoy) { q._px = q.x; q._py = q.y; q._pz = q.z; }
}
// the fish (or young) a snapshot carries: all (the 1/10 world); on the true lakes those living second by second (the focus), or
// without a focus those within DRAW_R of where the view looks — none when the camera is too far to see them
export function drawnOf(F, list, near, cam, trueWorld) {
  if (!trueWorld) return list.filter(a => a.alive);
  if (!cam || cam[2] > DRAW_CAM) return [];
  if (F.focus) return (near || list).filter(a => a.alive && a.near);   // (the region is rebuilt a step after the lists are compacted)
  const R2 = DRAW_R * DRAW_R, [cx, cy] = cam, out = [];
  for (const a of list) if (a.alive && (a.x - cx) ** 2 + (a.y - cy) ** 2 < R2) out.push(a);
  return out;
}
// the drawn fish and young packed (a fish that has just come into the focus last remembered its pose long ago: drawn where it is).
// THE IDS AS 32-BIT INTEGERS, through a Uint32Array on the same buffer (a float holds an integer exactly only to 2^24, and the second
// shard numbers its fish from 1e9 — shard3 ID_STRIDE — where floats are 64 apart: picked fish were lost, schools shared their
// swimmers); every reader takes them back the same way (fish3view, data3, the GPU's gpufish drawn)
export function packDrawn(F, fs, Y) {
  const fresh = a => !(F.focus && Math.abs(a._px - a.x) + Math.abs(a._py - a.y) > 5);
  const fb = new Float32Array(fs.length * FISH_STRIDE), yb = new Float32Array(Y.length * YOY_STRIDE), fu = new Uint32Array(fb.buffer), yu = new Uint32Array(yb.buffer);
  let o = 0, count = 0;
  for (const a of fs) {
    if (fresh(a)) { fb[o++] = a._px; fb[o++] = a._py; fb[o++] = a._pz; fb[o++] = a._pyaw; fb[o++] = a._ppitch; }
    else { fb[o++] = a.x; fb[o++] = a.y; fb[o++] = a.z; fb[o++] = a.yaw; fb[o++] = a.pitch; }
    fb[o++] = a.x; fb[o++] = a.y; fb[o++] = a.z; fb[o++] = a.yaw; fb[o++] = a.pitch;
    fb[o++] = a.L; fb[o++] = a.k; fb[o++] = a.n; fb[o++] = a.spd; fb[o++] = a.bed; fu[o++] = a.id; fb[o++] = a.school ? 1 : 0; fb[o++] = a.bodyMul;
    count += a.n;
  }
  o = 0;
  for (const q of Y) {
    if (fresh(q)) { yb[o++] = q._px; yb[o++] = q._py; yb[o++] = q._pz; } else { yb[o++] = q.x; yb[o++] = q.y; yb[o++] = q.z; }
    yb[o++] = q.x; yb[o++] = q.y; yb[o++] = q.z; yb[o++] = q.L; yb[o++] = q.k; yb[o++] = q.n; yu[o++] = q.id; yb[o++] = q.bed;
    yb[o++] = q.gref && q.gref.alive && q.gref.nt > 0 ? 1 : 0;   // (a brood its parent still guards)
  }
  return { fb, yb, nf: fs.length, ny: Y.length, count };
}
// the picked fish's (or young school's) state, for its card: found by id once (held in memo), then followed; null if this side
// doesn't hold it (a shard: another one does)
export function selInfoOf(F, env, memo, selId, selKind, fine) {
  if (selId < 0) return null;
  // (found again when the one held left: a fish handed to the other shard and back is a new object here; a young school's going has no cause)
  const lost = F.shard && memo.sel && memo.sel.id === selId && !memo.sel.alive && (memo.sel.cause === 'handed' || selKind === 'yoy' && !memo.sel.cause);
  if (!memo.sel || memo.sel.id !== selId || lost) memo.sel = (selKind === 'yoy' ? F.yoy : F.fish).find(a => a.id === selId && a.alive) || (lost ? memo.sel : null);
  if (!memo.sel) return null;
  const a = memo.sel, S = a.s, base = { id: a.id, kind: selKind, key: S.key, name: S.name || S.key, n: a.n, L: a.L, W: a.W, age: a.age / CLOCK3.YEAR_LEN, x: a.x, y: a.y, z: a.z, bed: a.bed };
  // (handed to another shard: it reports it; a young school gone with its fish still in it recruited — fish3 _recruit — one emptied died out)
  if (!a.alive) return a.cause === 'handed' ? null : { ...base, gone: true, cause: a.cause || (selKind === 'yoy' ? (a.n >= 1 ? 'recruited' : 'died') : 'died') };
  if (selKind === 'yoy') return { ...base, guarded: !!(a.gref && a.gref.alive && a.gref.nt > 0), T: a.j >= 0 ? env.temp[a.j] : null, o2: a.j >= 0 ? env.chem.o2[a.j] * ENV.O2_MGL : null };
  const doing = a.nt > 0 ? 'guarding its nest' : a.esc ? 'escaping low oxygen' : a.threat && a.fear > 0.2 ? `wary of a ${a.threat.s.name || a.threat.s.key}` : a.fk === 1 && a.prey ? `hunting a ${a.prey.s.name || a.prey.s.key}`
    : a.ripe ? (a.mate && a.mate !== a ? 'ripe, with a mate in view' : 'ripe, heading for its spawning ground') : a.tripEnd > env.time ? 'on a trip to the other lake'
    : a.fk === 2 ? 'feeding on the bed' : a.fk === 3 ? 'feeding on zooplankton' : a.hunger > 0.6 ? 'searching for food' : 'cruising';
  return { ...base, sex: a.sex, mature: a.mature, ripe: a.ripe, school: a.school, K: a.K, hunger: a.hunger, fear: a.fear, energy: a.energy, gen: a.gen,
    p: a.cons / Math.max(1e-12, a.consMax), T: a.T, o2: a.o2 * ENV.O2_MGL, lake: a.lake, doing, genes: Array.from(a.genes || []),
    near: F.focus ? !!a.near : fine,   // (lived second by second: every fish at the fine speeds when there is no focus)
    out: Array.from(a.o), vis: a.vis, spd: a.spd, yaw: a.yaw,
    inp: Array.from(F.senses(a, new Float64Array(IN3.length), F.deeper(a.x, a.y, [0, 0]))) };   // (what it senses: its brain's inputs, read without touching it)
}
// this side's part of the data page's numbers: sums by species (summed again across the shards)
export function statsPart(F) {
  const c = F.census(), sp = {};
  for (const k of KEYS3) {
    const r = c[k];
    sp[k] = { n: r.n, agents: r.agents, g: r.g, Ln: r.L * r.n, mature: r.mature, cons: r.cons, consMax: r.consMax, yoyN: r.yoyN, yoySchools: r.yoySchools, yoyLn: r.yoyL * r.yoyN,
      up: 0, low: 0, brook: 0, runIn: 0, runBack: 0, size: [0, 0, 0, 0, 0], cs: CENSUS_SIZE[k] ? new Array(CENSUS_SIZE[k].frac.length).fill(0) : [], target: F._target(S3[k]) };
  }
  for (const a of F.fish) {
    if (!a.alive) continue; const r = sp[a.s.key], L = a.L;
    if (a.lake === UPPER) r.up += a.n; else r.low += a.n;
    if (GEO.bodyAt(a.x, a.y) === BROOK) r.brook += a.n;
    if (a.ripe && a.brookRun) { if (a.inRun) r.runIn += a.n; else if (a.runYr === F._yr) r.runBack += a.n; }   // (the spawning run: on the brook's nest sites; turned back to the shoals)
    let q = 0; while (q < SIZE_CL.length && L >= SIZE_CL[q]) q++; r.size[q] += a.n;
    const cz = CENSUS_SIZE[a.s.key]; if (cz && L >= 7.5) { const v = cz.by === 'age' ? a.age / CLOCK3.YEAR_LEN : L; let b = 0; while (b < cz.edges.length && v >= cz.edges[b]) b++; r.cs[b] += a.n; }
  }
  return { sp, stats: F.stats, agents: F.fish.filter(a => a.alive).length, yoySchools: F.yoy.filter(q => q.alive).length };
}
// THE SAME WHILE THE GPU ENGINE HOLDS THE LAKES (docs/GPU_SIM.md G3): its census, a light copy of every agent's census fields, and
// the stats tree with the GPU's tallies so far folded into a copy (G: a GpuFish; F the Fish3 it hands the lakes back to)
export async function gpuStatsPart(G, F) {
  const c = await G.census(), Lt = await G.lite(), tl = await G.readTallies(), stats = statsAdd(JSON.parse(JSON.stringify(F.stats)), tl, F.env.time), sp = {};
  let agents = 0, yoySchools = 0;
  for (const k of KEYS3) {
    const r = c[k]; agents += r.agents; yoySchools += r.yoySchools;
    sp[k] = { n: r.n, agents: r.agents, g: r.g, Ln: r.L * r.n, mature: r.mature, cons: r.cons, consMax: r.consMax, yoyN: r.yoyN, yoySchools: r.yoySchools, yoyLn: r.yoyL * r.yoyN,
      up: 0, low: 0, brook: 0, runIn: 0, runBack: 0, size: [0, 0, 0, 0, 0], cs: CENSUS_SIZE[k] ? new Array(CENSUS_SIZE[k].frac.length).fill(0) : [], target: F._target(S3[k]) };
  }
  const u = a => new Uint32Array(a.buffer, a.byteOffset, a.length), fl = u(Lt.flags), kk = u(Lt.k), lk = u(Lt.lake), ag = u(Lt.age), ry = new Int32Array(Lt.runYr.buffer, Lt.runYr.byteOffset, Lt.runYr.length);
  for (let i = 0; i < Lt.n_; i++) {
    if (!(fl[i] & FL.ALIVE)) continue;
    const key = KEYS3[kk[i]], r = sp[key], L = Lt.L[i], n = Lt.n[i];
    if (lk[i] === UPPER) r.up += n; else r.low += n;
    if (GEO.bodyAt(Lt.x[i], Lt.y[i]) === BROOK) r.brook += n;
    if ((fl[i] & FL.RIPE) && (fl[i] & FL.BROOKRUN)) { if (fl[i] & FL.INRUN) r.runIn += n; else if (ry[i] === F._yr) r.runBack += n; }
    let q = 0; while (q < SIZE_CL.length && L >= SIZE_CL[q]) q++; r.size[q] += n;
    const cz = CENSUS_SIZE[key]; if (cz && L >= 7.5) { const v = cz.by === 'age' ? ag[i] / CLOCK3.YEAR_LEN : L; let b = 0; while (b < cz.edges.length && v >= cz.edges[b]) b++; r.cs[b] += n; }
  }
  return { sp, stats, agents, yoySchools };
}
// the followed fish's (or young school's) card from its fields on the GPU (GpuFish.one: readAgent / readYoy's names) — selInfoOf's
// shape, without what only the CPU's objects know (the prey's or threat's species, the brain's inputs)
export function gpuCard(o, kind, env) {
  const S = S3[KEYS3[o.k]], base = { id: o.id, kind, key: S.key, name: S.name || S.key, n: o.n, L: o.L, W: o.W, age: o.age / CLOCK3.YEAR_LEN, x: o.x, y: o.y, z: o.z, bed: o.bed };
  if (kind === 'yoy') return { ...base, T: o.j >= 0 ? env.temp[o.j] : null, o2: o.j >= 0 ? env.chem.o2[o.j] * ENV.O2_MGL : null };
  const doing = o.nt > 0 ? 'guarding its nest' : o.esc ? 'escaping low oxygen' : o.threat >= 0 && o.fear > 0.2 ? 'wary of a predator' : o.fk === 1 && o.prey >= 0 ? 'hunting'
    : o.ripe ? 'ripe, heading for its spawning ground' : o.tripEndD * DAY3 > env.time ? 'on a trip to the other lake'
    : o.fk === 2 ? 'feeding on the bed' : o.fk === 3 ? 'feeding on zooplankton' : o.hunger > 0.6 ? 'searching for food' : 'cruising';
  return { ...base, sex: o.sex, mature: o.mature, ripe: o.ripe, school: o.school, K: o.K, hunger: o.hunger, fear: o.fear, energy: o.energy, gen: o.gen,
    p: o.cons / Math.max(1e-12, o.consMax), T: o.T, o2: o.o2 * ENV.O2_MGL, lake: o.lake, doing, genes: o.genes || [], near: false, out: o.out || [], vis: o.vis, spd: o.spd, yaw: o.yaw };
}
const lakeArea = id => BODIES.find(b => b.id === id).area;
const addTree = (a, b) => { if (typeof b === 'number') return (a || 0) + b; if (!b || typeof b !== 'object') return a ?? b; const o = a && typeof a === 'object' ? a : {}; for (const k of Object.keys(b)) o[k] = addTree(o[k], b[k]); return o; };
// the water per lake: area-weighted at the surface and the bottom, the zooplankton over the column, the ice
export function waterOf(env) {
  const Gc = env.G, ch = env.chem, water = {};
  for (const lake of [UPPER, LOWER]) {
    let A = 0, ts = 0, tb = 0, os = 0, ob = 0, alg = 0, zoo = 0, ice = 0, zv = 0;
    for (let col = 0; col < Gc.NC; col++) {
      if (Gc.body[col] !== lake) continue; const a = Gc.area[col], j0 = Gc.cell0[col], jb = j0 + Gc.nL[col] - 1;
      A += a; ts += env.temp[j0] * a; tb += env.temp[jb] * a; os += ch.o2[j0] * a; ob += ch.o2[jb] * a; alg += (ch.phyto[j0] + ch.diatom[j0] + ch.cyano[j0]) * a; ice += env.ice[col] * a;
      for (let j = j0; j <= jb; j++) { zoo += (ch.zooD[j] + ch.zooC[j] + ch.zooS[j]) * Gc.vol[j]; zv += Gc.vol[j]; }
    }
    water[lake] = { ha: lakeArea(lake) / 1e4, tS: ts / A, tB: tb / A, oS: os / A * ENV.O2_MGL, oB: ob / A * ENV.O2_MGL, algae: alg / A, zoo: zoo / Math.max(1e-9, zv) * PLANKTON.UGL, ice: ice / A };
  }
  return water;
}
// THE RUN'S HISTORY, a point (render3/sim3worker.js keeps them whether the data page is open or not): the fish by species (the
// step's counts, cnt in KEYS3 order), their biomass (kg/ha), each lake's surface and bottom temperature and O₂
export function histPoint(env, cnt, bio, lakeHa) {
  const W = waterOf(env), n = {}; KEYS3.forEach((k, i) => { n[k] = cnt[i]; });
  return { t: env.time, yf: env.yearFrac(), n, kg: bio / 1000 / lakeHa, w: [W[UPPER], W[LOWER]].map(w => [w.tS, w.tB, w.oS, w.oB]) };
}
// the data page's message from the sides' parts and the water model (render3/data3.js reads it)
export function statsMerge(parts, env, lakeHa) {
  const sp = {}, Gc = env.G, ch = env.chem; let stats = null, agents = 0, yoySchools = 0;
  for (const p of parts) { stats = addTree(stats, JSON.parse(JSON.stringify(p.stats))); agents += p.agents; yoySchools += p.yoySchools; }
  for (const k of KEYS3) {
    const r = { n: 0, agents: 0, g: 0, Ln: 0, mature: 0, cons: 0, consMax: 0, yoyN: 0, yoySchools: 0, yoyLn: 0, up: 0, low: 0, brook: 0, runIn: 0, runBack: 0, size: [0, 0, 0, 0, 0], cs: CENSUS_SIZE[k] ? new Array(CENSUS_SIZE[k].frac.length).fill(0) : [] };
    for (const p of parts) { const q = p.sp[k]; for (const f of Object.keys(r)) if (f === 'size' || f === 'cs') (q[f] || []).forEach((v, i) => { r[f][i] += v; }); else r[f] += q[f]; }
    const S = S3[k];
    sp[k] = { name: S.name || k, tag: S.tag || (S.sp && S.sp.tag) || '#999', n: r.n, agents: r.agents, kgHa: r.g / 1000 / lakeHa, perHa: r.n / lakeHa, L: r.Ln / Math.max(1e-9, r.n), mature: r.mature,
      p: r.cons / Math.max(1e-12, r.consMax), yoyN: r.yoyN, yoySchools: r.yoySchools, yoyL: r.yoyLn / Math.max(1e-9, r.yoyN), target: parts[0].sp[k].target / lakeHa,
      up: r.up, low: r.low, brook: r.brook, size: r.size, cs: r.cs, fry: stats.fry[k], died: stats.died[k] || {}, spawns: stats.spawns[k], eggs: stats.eggs[k], recruits: stats.recruits[k],
      cross: stats.cross[k], settle: stats.settle[k], trips: stats.trips[k], runIn: r.runIn, runBack: r.runBack, sites: S.spawn.runK ? S.spawn.runK * lakeArea(BROOK) : 0 };
  }
  const water = waterOf(env);
  const P = env.plants, weeds = P ? FORMS3.map((Fm, f) => ({ name: Fm.name, kgHa: P.total(f) / 1000 / lakeHa })) : [];
  let mussels = 0; if (env.lit && P) for (let i = 0; i < P.cells.length; i++) mussels += env.lit.mu[i] * Gc.bedA[P.cells[i]];
  const eaten = Object.entries(stats.eatenBy).sort((a, b) => b[1] - a[1]).slice(0, 14);
  return { type: 'stats', time: env.time, yf: env.yearFrac(), lakeHa, sizeCl: SIZE_CL, sp, water, weeds, mussels, eaten, secchi: ch.secchi(), food: stats.food, agents, yoySchools };
}
