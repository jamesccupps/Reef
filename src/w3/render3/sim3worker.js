// sim3worker.js — the 3-D lakes' simulation off the main thread (browser layer: a module Worker that imports only the pure
// sim, src/w3/env3.js + fish3.js). The view sends {type: 'tick', dt} once a frame — and only after this worker's previous
// reply — and the worker advances the lakes by dt × speed sim seconds (REAL TIME at 1×: stage R5), on the FIDELITY LADDER
// (docs/HOT_BROOK_3D.md §4 "Design (stage R3)"): up to FINE_UP× the fish live second by second (0.1-s steps, brains at 5 Hz,
// the water every simulated minute); faster, in coarse BLOCKS sized to ~BLOCKS_S a second (each fish's brain decides once a
// block and it goes where it chose), up to 1,752-s blocks (the gate's) — within a time budget, then it replies
// with a snapshot: the clock and the weather, the ice
// per column, every fish with where it was a step before (the view interpolates), the schools of young, and the field the
// cut-away shows. Every few seconds (and after a season jump) it also sends the weeds: the shoots per growth form per bed cell
// (render3/plants3view.js). When the sim can't keep up (the higher speeds on a slow machine) it runs slower than asked.
import './world3sel.js';   // (first: the world the page asked for — its URL's ?world=true — before geometry.js loads)
import { Env3 } from '../env3.js';
import { Fish3, S3, KEYS3 } from '../fish3.js';
import { FORMS3 } from '../plants3.js';
import { CLOCK3 } from '../clock3.js';
import { WORLD_TRUE, GEO, BODIES, UPPER, LOWER, BROOK } from '../geometry.js';
import { PLANKTON, ENV } from '../../config.js';

const FISH_STRIDE = 18, YOY_STRIDE = 12;   // (render3/fish3view.js reads the same layout)
const BUDGET = 40;   // ms of stepping per tick at most (the view never waits on it: it draws the last snapshot meanwhile)
const PLANTS_MS = WORLD_TRUE ? 20000 : 4000;   // the weeds change slowly: their field every this often (the true lakes': ~257,000 bed cells × 13 forms)
// THE TRUE-SIZE LAKES (TRUE_SCALE.md T6a): a snapshot carries the fish and young within DRAW_R of where the view looks — not the
// 300,000 agents (~22 MB a frame) — and each step remembers the poses of those about the focus only
const DRAW_R = 320, DRAW_CAM = 900;   // (m about where the view looks; none when the camera is farther than DRAW_CAM: they'd be sub-pixel)
let cam = null, stepMs = 0;
const FINE = 0.1, FINE_UP = 6, BLOCKS_S = 3, BLOCK_MAX = 1752, ENV_FINE = 60;   // s; ×; blocks a second; s; s of water step when fine
let env = null, F = null, run = true, speed = 1, acc = 0, envAcc = 0, h = FINE, show = 'plain', ticks = 0, plantsAt = -1e9;
const RISES_MAX = 300;
const FOCUS_R = [40, 250], NEAR_MAX = 6000;   // m: the true-size lakes' focus radius, twice the camera's distance within these — and shrunk
// while more than NEAR_MAX agents live in it (~50 ms a 0.1-s step: real time with room; a spawning colony packs 20,000 into 250 m)
let focusR = 150;   // rises a snapshot carries at most (the view's rings: the insects taken at the surface)
let rises = [];

function remember() {
  const near = WORLD_TRUE && F.focus && F._region;   // (with a focus: only the fish and young about it live each step, and are drawn)
  for (const a of near ? F._region : F.fish) { a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch; }
  for (const q of near ? (F._yRegion || []) : F.yoy) { q._px = q.x; q._py = q.y; q._pz = q.z; }
}
// the fish and the young a snapshot carries: all (the 1/10 world), or those within DRAW_R of where the view looks
function drawn(list, near) {
  if (!WORLD_TRUE) return list.filter(a => a.alive);
  if (!cam || cam[2] > DRAW_CAM) return [];
  if (F.focus) return (near || list).filter(a => a.alive && a.near);   // (with a focus: the fish living second by second — the rest jump a block at a time; the region is rebuilt a step after the lists are compacted)
  const R2 = DRAW_R * DRAW_R, [cx, cy] = cam, out = [];
  for (const a of list) if (a.alive && (a.x - cx) ** 2 + (a.y - cy) ** 2 < R2) out.push(a);
  return out;
}
// (a fish that has just come into the focus last remembered its pose long ago: drawn where it is, not glided from there)
const fresh = a => !(F.focus && Math.abs(a._px - a.x) + Math.abs(a._py - a.y) > 5);
// the step for a speed: fine 0.1 s up to FINE_UP×, else a block of speed / BLOCKS_S s (at least 1.5 s, at most BLOCK_MAX) — and
// at least as long as the speed × what a block costs: the true-size lakes' blocks cost ~5 s each whatever their length (every
// agent lives each one), so at 1 min/s a 20-s block ran 4× real time, not 60×; a block of speed × its cost runs at the speed asked
let blockMs = WORLD_TRUE ? 5000 : 0, busyS = 0;
const stepFor = sp => sp <= FINE_UP ? FINE : Math.min(BLOCK_MAX, Math.max(1.5, sp / BLOCKS_S, sp * blockMs * 1.1 / 1000));
function advance(dt) {
  if (!run) return;
  h = stepFor(speed);
  acc += Math.min(Math.max(0.25, 1.5 * busyS), dt) * speed;   // (no catch-up after a pause — but the seconds a long block itself took count)
  const t0 = performance.now();
  while (acc >= h && performance.now() - t0 < BUDGET) {
    const ts = performance.now(); remember(); F.step(h); acc -= h; const dur = performance.now() - ts; stepMs += (dur - stepMs) * 0.1;   // (a step's cost, for the status)
    if (h > FINE) blockMs += (dur - blockMs) * 0.3;   // (a block's cost: the next blocks' length)
    for (let q = 0; q < F.rises.length && rises.length < RISES_MAX * 6; q++) rises.push(F.rises[q]);
    // the water: every simulated minute, or every block when blocks are longer (its physics' scale: minutes to half an hour)
    envAcc += h; if (envAcc >= Math.max(h, ENV_FINE) - 1e-9) { env.step(envAcc); envAcc = 0; }
  }
  acc = Math.min(acc, h);   // (behind: drop the backlog — the sim runs slower than asked rather than lurch)
  busyS = (performance.now() - t0) / 1000;
}
// the cut-away's field: temperature, O₂, algae or zooplankton per cell
function fieldOf(name) {
  const c = env.chem, n = env.G.NCELL, out = new Float32Array(n);
  if (name === 'temp') out.set(env.temp);
  else if (name === 'o2') out.set(c.o2);
  else if (name === 'algae') for (let j = 0; j < n; j++) out[j] = c.phyto[j] + c.diatom[j] + c.cyano[j];
  else if (name === 'zoo') for (let j = 0; j < n; j++) out[j] = (c.zooD[j] + c.zooC[j]) * PLANKTON.UGL;
  return out;
}
function sendPlants() {   // the shoots (g DW/m²) per form, each over the bed cells in chem3.bedCells order
  const P = env.plants; if (!P) return;
  const nb = P.cells.length, out = new Float32Array(P.Bs.length * nb);
  for (let f = 0; f < P.Bs.length; f++) out.set(P.Bs[f], f * nb);
  const mus = env.lit ? Float32Array.from(env.lit.mu) : new Float32Array(nb);   // (the mussels /m², the same cells)
  const surf = new Float32Array(env.G.NC); if (env.lit) for (let c = 0; c < surf.length; c++) surf[c] = env.lit.surfA[c] + env.lit.surfT[c];   // (the insects on the water, g wet/m², per column)
  // the crayfish out on the bed (adults, the year's young /m²; out by night more than by day) and the snails /m², per bed cell, with
  // the young crayfish's mass (render3/bed3view.js)
  const bed = env.lit ? env.lit.shown(env.sun < 0.05) : new Float32Array(nb * 3), wY = env.lit ? env.lit.wY : 1;
  const dead = Float32Array.from(P.dead);   // (last year's standing stems, g DW/m², the same cells)
  postMessage({ type: 'plants', shoots: out, mus, surf, bed, wY, dead, yf: env.yearFrac() }, [out.buffer, mus.buffer, surf.buffer, bed.buffer, dead.buffer]); plantsAt = performance.now();
}
function snapshot() {
  const fs = drawn(F.fish, F._region), Y = drawn(F.yoy, F._yRegion), nf = fs.length, ny = Y.length;
  const fb = new Float32Array(nf * FISH_STRIDE), yb = new Float32Array(ny * YOY_STRIDE);
  let o = 0, count = 0;
  for (const a of fs) {
    if (fresh(a)) { fb[o++] = a._px; fb[o++] = a._py; fb[o++] = a._pz; fb[o++] = a._pyaw; fb[o++] = a._ppitch; }
    else { fb[o++] = a.x; fb[o++] = a.y; fb[o++] = a.z; fb[o++] = a.yaw; fb[o++] = a.pitch; }
    fb[o++] = a.x; fb[o++] = a.y; fb[o++] = a.z; fb[o++] = a.yaw; fb[o++] = a.pitch;
    fb[o++] = a.L; fb[o++] = a.k; fb[o++] = a.n; fb[o++] = a.spd; fb[o++] = a.bed; fb[o++] = a.id; fb[o++] = a.school ? 1 : 0; fb[o++] = a.bodyMul;
    count += a.n;
  }
  o = 0;
  for (const q of Y) {
    if (fresh(q)) { yb[o++] = q._px; yb[o++] = q._py; yb[o++] = q._pz; } else { yb[o++] = q.x; yb[o++] = q.y; yb[o++] = q.z; } yb[o++] = q.x; yb[o++] = q.y; yb[o++] = q.z; yb[o++] = q.L; yb[o++] = q.k; yb[o++] = q.n; yb[o++] = q.id; yb[o++] = q.bed;
    yb[o++] = q.gref && q.gref.alive && q.gref.nt > 0 ? 1 : 0;   // (a brood its parent still guards)
  }
  const ice = Float32Array.from(env.ice), rz = Float32Array.from(rises); rises = [];
  const field = show !== 'plain' && ticks % 10 === 0 ? fieldOf(show) : null;
  const msg = { type: 'snap', time: env.time, t: env.t, yf: env.yearFrac(), weather: env.weather, windSpeed: env.windSpeed, temp0: env.temp[0], sun: env.sun,
    acc, h, nf, ny, simT: F.time, stepMs, sel: selInfo(), fish: fb, yoy: yb, ice, field, show, rises: rz, ...totals(count, nf, ny) };
  const tr = [fb.buffer, yb.buffer, ice.buffer, rz.buffer]; if (field) tr.push(field.buffer);
  postMessage(msg, tr);
}

// the lakes' fish (Σ n), agents and schools of young for the status line: those drawn are all of them in the 1/10 world; in the true
// one the step's counts by species (fish3's cnt, once a simulated second) and the lists' lengths
function totals(count, nf, ny) {
  if (!WORLD_TRUE) return { count, agents: nf, nyAll: ny };
  let c = 0; for (let k = 0; k < F.cnt.length; k++) c += F.cnt[k];
  return { count: c, agents: F.fish.length, nyAll: F.yoy.length };
}

// THE DATA PAGE (TRUE_SCALE T8; render3/data3.js): while it is open, every STATS_MS the lakes' numbers — the census by species,
// lake and size against docs/FISH_CENSUS.md's, the young's fates, deaths by cause, who eats whom, the spawnings, the brook's
// traffic, the water per lake, the weeds and mussels. And CLICK-A-FISH: the fish (or school of young) the view picked rides in
// every snapshot — its body, state, what it is doing, the water about it, its genes and its brain's outputs
const STATS_MS = 2000, SIZE_CL = [7.5, 15, 25, 35];   // (cm: the size classes' edges)
let statsOn = false, statsAt = -1e9, selId = -1, selKind = 'fish', sel = null;
const lakeArea = id => BODIES.find(b => b.id === id).area;
function sendStats() {
  const c = F.census(), sp = {}, Gc = env.G, ch = env.chem;
  for (const k of KEYS3) {
    const r = c[k], S = S3[k];
    sp[k] = { name: S.name || k, tag: S.tag || (S.sp && S.sp.tag) || '#999', n: r.n, agents: r.agents, kgHa: r.kgHa, perHa: r.perHa, L: r.L, mature: r.mature, p: r.p,
      yoyN: r.yoyN, yoySchools: r.yoySchools, yoyL: r.yoyL, target: F._target(S) / F.lakeHa, up: 0, low: 0, brook: 0, size: [0, 0, 0, 0, 0],
      fry: F.stats.fry[k], died: F.stats.died[k] || {}, spawns: F.stats.spawns[k], eggs: F.stats.eggs[k], recruits: F.stats.recruits[k],
      cross: F.stats.cross[k], settle: F.stats.settle[k], trips: F.stats.trips[k] };
  }
  for (const a of F.fish) {
    if (!a.alive) continue; const r = sp[a.s.key], L = a.L;
    if (a.lake === UPPER) r.up += a.n; else r.low += a.n;
    if (GEO.bodyAt(a.x, a.y) === BROOK) r.brook += a.n;
    let q = 0; while (q < SIZE_CL.length && L >= SIZE_CL[q]) q++; r.size[q] += a.n;
  }
  // the water per lake: area-weighted at the surface and the bottom, the zooplankton over the column, the ice
  const water = {};
  for (const lake of [UPPER, LOWER]) {
    let A = 0, ts = 0, tb = 0, os = 0, ob = 0, alg = 0, zoo = 0, ice = 0, zv = 0;
    for (let col = 0; col < Gc.NC; col++) {
      if (Gc.body[col] !== lake) continue; const a = Gc.area[col], j0 = Gc.cell0[col], jb = j0 + Gc.nL[col] - 1;
      A += a; ts += env.temp[j0] * a; tb += env.temp[jb] * a; os += ch.o2[j0] * a; ob += ch.o2[jb] * a; alg += (ch.phyto[j0] + ch.diatom[j0] + ch.cyano[j0]) * a; ice += env.ice[col] * a;
      for (let j = j0; j <= jb; j++) { zoo += (ch.zooD[j] + ch.zooC[j]) * Gc.vol[j]; zv += Gc.vol[j]; }
    }
    water[lake] = { ha: lakeArea(lake) / 1e4, tS: ts / A, tB: tb / A, oS: os / A * ENV.O2_MGL, oB: ob / A * ENV.O2_MGL, algae: alg / A, zoo: zoo / Math.max(1e-9, zv) * PLANKTON.UGL, ice: ice / A };
  }
  const P = env.plants, weeds = P ? FORMS3.map((Fm, f) => ({ name: Fm.name, kgHa: P.total(f) / 1000 / F.lakeHa })) : [];
  let mussels = 0; if (env.lit && P) for (let i = 0; i < P.cells.length; i++) mussels += env.lit.mu[i] * Gc.bedA[P.cells[i]];
  const eaten = Object.entries(F.stats.eatenBy).sort((a, b) => b[1] - a[1]).slice(0, 14);
  postMessage({ type: 'stats', time: env.time, yf: env.yearFrac(), lakeHa: F.lakeHa, sizeCl: SIZE_CL, sp, water, weeds, mussels, eaten, secchi: ch.secchi(),
    food: F.stats.food, agents: F.fish.length, yoySchools: F.yoy.length });
  statsAt = performance.now();
}
// the picked fish's (or young school's) state, for its card; found by id once, then followed
function selInfo() {
  if (selId < 0) return null;
  if (!sel || sel.id !== selId) sel = (selKind === 'yoy' ? F.yoy : F.fish).find(a => a.id === selId) || null;
  if (!sel) return { id: selId, kind: selKind, gone: true, cause: 'gone' };
  const a = sel, S = a.s, base = { id: a.id, kind: selKind, key: S.key, name: S.name || S.key, n: a.n, L: a.L, W: a.W, age: a.age / CLOCK3.YEAR_LEN, x: a.x, y: a.y, z: a.z, bed: a.bed };
  if (!a.alive) return { ...base, gone: true, cause: a.cause || 'died' };
  if (selKind === 'yoy') return { ...base, guarded: !!(a.gref && a.gref.alive && a.gref.nt > 0), T: a.j >= 0 ? env.temp[a.j] : null, o2: a.j >= 0 ? env.chem.o2[a.j] * ENV.O2_MGL : null };
  const doing = a.nt > 0 ? 'guarding its nest' : a.esc ? 'escaping low oxygen' : a.threat && a.fear > 0.2 ? `wary of a ${a.threat.s.name || a.threat.s.key}` : a.fk === 1 && a.prey ? `hunting a ${a.prey.s.name || a.prey.s.key}`
    : a.ripe ? (a.mate && a.mate !== a ? 'ripe, with a mate in view' : 'ripe, heading for its spawning ground') : a.tripEnd > env.time ? 'on a trip to the other lake'
    : a.fk === 2 ? 'feeding on the bed' : a.fk === 3 ? 'feeding on zooplankton' : a.hunger > 0.6 ? 'searching for food' : 'cruising';
  return { ...base, sex: a.sex, mature: a.mature, ripe: a.ripe, school: a.school, K: a.K, hunger: a.hunger, fear: a.fear, energy: a.energy, gen: a.gen,
    p: a.cons / Math.max(1e-12, a.consMax), T: a.T, o2: a.o2 * ENV.O2_MGL, lake: a.lake, near: F.focus ? !!a.near : h <= FINE, doing,   // (near: lived second by second — every fish at the fine speeds when there is no focus) genes: Array.from(a.genes || []),
    out: Array.from(a.o), vis: a.vis, spd: a.spd, yaw: a.yaw };
}

onmessage = ev => {
  const m = ev.data;
  if (m.type === 'init') {
    if (m.cam) cam = m.cam;
    // (the true-size lakes take seconds to found: the view shows each stage; an error is reported, not swallowed)
    try {
      const t0 = performance.now(), say = text => postMessage({ type: 'progress', text, s: (performance.now() - t0) / 1000 });
      say('the water'); env = new Env3();
      say("the fish and the season's young"); F = new Fish3(env, { young: true }); remember();   // (the lake opens with the season's young so far: seedSeason)
      say('the first look'); postMessage({ type: 'ready', NC: env.G.NC, NCELL: env.G.NCELL });
      sendPlants(); snapshot();
    } catch (e) { postMessage({ type: 'error', text: String(e && e.stack || e) }); }
  } else if (m.type === 'tick') {
    // FIDELITY BY DISTANCE (TRUE_SCALE.md T3): on the true-size lakes, at the fine speeds, the fish within FOCUS_R of where the view
    // looks live second by second and the rest in banked blocks (the 1/10 world, every fish drawn, steps them all alike)
    if (m.cam) cam = m.cam;
    if (WORLD_TRUE && m.cam && stepFor(speed) === FINE) {
      const want = m.cam[2] > DRAW_CAM ? FOCUS_R[0] : Math.min(FOCUS_R[1], Math.max(FOCUS_R[0], m.cam[2] * 2)), nn = F.nearN || 0;
      if (nn > NEAR_MAX) focusR *= 0.85; else if (nn < 0.75 * NEAR_MAX) focusR = focusR * 1.1 + 1;
      focusR = Math.max(FOCUS_R[0] / 2, Math.min(want, focusR));
      F.setFocus(m.cam[0], m.cam[1], focusR);
    } else F.setFocus(null);
    ticks++; advance(m.dt); if (performance.now() - plantsAt > PLANTS_MS) sendPlants(); snapshot();
    if (statsOn && performance.now() - statsAt > STATS_MS) sendStats(); }
  else if (m.type === 'stats') { statsOn = !!m.on; if (statsOn) sendStats(); }
  else if (m.type === 'select') { selId = m.id ?? -1; selKind = m.kind || 'fish'; sel = null; }
  else if (m.type === 'run') run = !!m.run;
  else if (m.type === 'speed') speed = +m.speed || 1;
  else if (m.type === 'show') show = m.show;
  else if (m.type === 'season') {   // (a jump forward in the year carries the young along and adds the spawnings it skipped)
    const y0 = env.yearFrac(); env.primeSeason(Math.floor(env.time / CLOCK3.YEAR_LEN) * CLOCK3.YEAR_LEN + m.yf * CLOCK3.YEAR_LEN);
    if (env.yearFrac() > y0) F.seedSeason(y0, env.yearFrac(), true);
    remember(); sendPlants();
  }
};
postMessage({ type: 'loaded' });   // (the view waits for this before it sends init: see main3 start)
