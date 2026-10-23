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
// SHARDS (docs/TRUE_SCALE.md T5): on the true-size lakes, when the page is cross-origin isolated (shared memory) and the machine
// has the cores, the fish live in SHARD WORKERS — Upper's in one, Lower's and the brook's in another (render3/shard3worker.js) —
// side by side on the one water model, which this worker keeps and steps; `?shards=0` keeps them here.
// THE GPU (docs/GPU_SIM.md G3): where WebGPU is (the true-size lakes; `?gpu=0` off, `?gpu=1` on the 1/10 world too), the
// fast-forward blocks run on the GPU engine (src/w3/gpu/gpufish.js, ~70 ms a true-size block against ~2.5 s on the CPU's cores)
// and the fine speeds on one Fish3 here: the lakes are handed to the GPU when the speed goes past FINE_UP and back when it drops
// (a few seconds each way), and while the GPU holds them the view gets only what it draws, gathered there.
import { R5 } from './world3sel.js';   // (first: the world the page asked for — its URL's ?world=true — before geometry.js loads)
import { Env3 } from '../env3.js';
import { Fish3, stageR5 } from '../fish3.js';
import { CLOCK3 } from '../clock3.js';
import { WORLD_TRUE } from '../geometry.js';
import { PLANKTON } from '../../config.js';
import { ShardPool } from '../shardpool3.js';
import { getRandState } from '../../core.js';
import { remember, drawnOf, packDrawn, selInfoOf, statsPart, statsMerge, histPoint, gpuStatsPart, gpuCard, FISH_STRIDE, YOY_STRIDE, DRAW_CAM, DRAW_R } from './fishside3.js';

const BUDGET = 40;   // ms of stepping per tick at most (the view never waits on it: it draws the last snapshot meanwhile)
const PLANTS_MS = WORLD_TRUE ? 20000 : 4000;   // the weeds change slowly: their field every this often (the true lakes': ~257,000 bed cells × 13 forms)
let cam = null, stepMs = 0;
const FINE = 0.1, FINE_UP = 6, BLOCKS_S = 3, BLOCK_MAX = 1752, ENV_FINE = 60;   // s; ×; blocks a second; s; s of water step when fine
let env = null, side = null, run = true, speed = 1, acc = 0, envAcc = 0, h = FINE, show = 'plain', ticks = 0, plantsAt = -1e9;
const RISES_MAX = 300;   // rises a snapshot carries at most (the view's rings: the insects taken at the surface)
// THE WILDLIFE'S KILLS (fish3 wildEv: [x, y, z, WILDK index, length cm, species] per fish taken — render-only): at the fine speeds a
// snapshot carries up to WILD_MAX of them, so the view's loon dives and osprey plunges where a fish was really taken (render3/
// wild3view.js); at the fast-forward blocks none (the view times its hunts itself)
const WILD_MAX = 120;
let wildEv = [];
const takeWild = (src, dt) => { if (dt > FINE) return; for (let q = 0; q + 5 < src.length && wildEv.length < WILD_MAX * 6; q += 6) for (let k = 0; k < 6; k++) wildEv.push(src[q + k]); };
const FOCUS_R = [40, 250], NEAR_MAX = 6000;   // m: the true-size lakes' focus radius, twice the camera's distance within these — and shrunk
// while more than NEAR_MAX agents live in it (~50 ms a 0.1-s step: real time with room; a spawning colony packs 20,000 into 250 m)
let focusR = 150, focus = null;
let rises = [];
const STATS_MS = 2000;   // the data page's numbers every this often while it is open (render3/data3.js)
let statsOn = false, statsAt = -1e9, selId = -1, selKind = 'fish';
// THE RUN'S HISTORY (TRUE_SCALE T8: the graphs had filled only while the data page was open): a point every histDt simulated
// seconds whether it is open or not (fishside3.histPoint); when HIST_MAX are kept, every other is dropped and the spacing
// doubles — the whole run since the lake opened, coarser as it grows. The page gets them all when it opens, then the new ones
const HIST_MAX = 2000; let hist = [], histDt = 30, histAt = -1e9, histSent = 0;
function histTick() {
  if (env.time - histAt < histDt) return;
  const c = side.counts(); histAt = env.time; hist.push(histPoint(env, c.cnt, c.bio, c.lakeHa));
  if (hist.length > HIST_MAX) { hist = hist.filter((_, i) => i % 2 === 0); histDt *= 2; if (statsOn) sendHistory(); }
}
function sendHistory() { postMessage({ type: 'history', hist }); histSent = hist.length; }
function postStats(m) { m.histAdd = hist.slice(histSent); histSent = hist.length; postMessage(m); }

// ---------- THE FISH'S SIDE, alone in this worker: one Fish3 ----------
function soloSide() {
  const F = new Fish3(env, { young: true }), memo = {};   // (the lake opens with the season's young so far: seedSeason)
  remember(F, WORLD_TRUE);
  return {
    F, memo,
    get nearN() { return F.nearN || 0; },
    setFocus(f) { if (f) F.setFocus(f[0], f[1], f[2]); else F.setFocus(null); },
    step(dt) { remember(F, WORLD_TRUE); F.step(dt); for (let q = 0; q < F.rises.length && rises.length < RISES_MAX * 6; q++) rises.push(F.rises[q]); takeWild(F.wildEv, dt); },
    envStepped() {},
    view() { return packDrawn(F, drawnOf(F, F.fish, F._region, cam, WORLD_TRUE), drawnOf(F, F.yoy, F._yRegion, cam, WORLD_TRUE)); },
    sel() { return selId < 0 ? null : selInfoOf(F, env, memo, selId, selKind, h <= FINE) || { id: selId, kind: selKind, gone: true, cause: 'gone' }; },
    stats() { return statsMerge([statsPart(F)], env, F.lakeHa); },
    totals(count, nf, ny) {   // (the 1/10 world draws every fish; on the true lakes the step's counts, once a simulated second)
      if (!WORLD_TRUE) return { count, agents: nf, nyAll: ny };
      let c = 0; for (let k = 0; k < F.cnt.length; k++) c += F.cnt[k]; return { count: c, agents: F.fish.length, nyAll: F.yoy.length };
    },
    seedSeason(y0, y1) { F.seedSeason(y0, y1, true); remember(F, WORLD_TRUE); },
    counts() { return { cnt: F.cnt, bio: F.bio, lakeHa: F.lakeHa }; },
  };
}

// ---------- THE FISH'S SIDE IN SHARD WORKERS (src/w3/shardpool3.js) ----------
async function poolSide(n, say, st0) {   // (st0: the random state before the water was built — each shard builds its replica alike)
  say(`the fish and the season's young, in ${n} shards`);
  const P = await ShardPool.start(env, n, st0, () => new Worker(new URL('./shard3worker.js' + self.location.search, import.meta.url), { type: 'module' }));
  return {
    pool: true,
    get nearN() { return P.sum('nearN'); },
    setFocus(f) { focus = f; },
    async step(dt) {
      const stats = statsOn && performance.now() - statsAt > STATS_MS;
      const reps = await P.step(dt, { focus, cam, sel: selId >= 0 ? [selId, selKind] : null, stats });
      for (const r of reps) { for (let q = 0; q < r.rises.length && rises.length < RISES_MAX * 6; q++) rises.push(r.rises[q]); if (r.wild) takeWild(r.wild, dt); }
      if (stats) { statsAt = performance.now(); postStats(statsMerge(reps.map(r => r.stats), env, P.lakeHa)); }
    },
    envStepped() { P.envStepped(); },
    view() {   // (the shards' latest drawn fish and young, one after another: a tick with no step draws the last again)
      const parts = P.last.filter(r => r.drawn).map(r => r.drawn), nf = parts.reduce((t, p) => t + p.nf, 0), ny = parts.reduce((t, p) => t + p.ny, 0);
      const fb = new Float32Array(nf * FISH_STRIDE), yb = new Float32Array(ny * YOY_STRIDE); let of = 0, oy = 0, count = 0;
      for (const p of parts) { fb.set(p.fb, of); of += p.fb.length; yb.set(p.yb, oy); oy += p.yb.length; count += p.count; }
      return { fb, yb, nf, ny, count };
    },
    sel() {   // (the shard that holds it alive first: one it left — a young school handed on is marked with no cause — may still report it gone)
      if (selId < 0) return null; let gone = null;
      for (const r of P.last) if (r.sel) { if (!r.sel.gone) return r.sel; gone = gone || r.sel; }
      return gone || { id: selId, kind: selKind, gone: true, cause: 'gone' };
    },
    stats() { return null; },   // (they come with a step: see step)
    totals() { return { count: P.count(), agents: P.sum('agents'), nyAll: P.sum('nyAll') }; },
    seedSeason(y0, y1) { return P.seedSeason(y0, y1); },
    counts() { const cnt = new Float64Array(P.last[0].cnt.length); let bio = 0; for (const r of P.last) { for (let k = 0; k < cnt.length; k++) cnt[k] += r.cnt[k]; bio += r.bio || 0; } return { cnt, bio, lakeHa: P.lakeHa }; },
  };
}

// ---------- THE FISH'S SIDE WITH THE GPU (docs/GPU_SIM.md G3): the fine steps on the solo side's Fish3, the blocks on the GPU ----------
async function gpuSide(say) {
  const solo = soloSide(), F = solo.F;
  say('the GPU engine');
  const { GpuFish } = await import('../gpu/gpufish.js');
  const { dev, info } = await GpuFish.device();
  const G = new GpuFish(dev, F, env, { seed: (getRandState() ^ 0x5bd1e995) >>> 0 });
  let onGpu = false, drawn = null, card = null, poses = null, fresh = false, handing = 0, gotAt = null;
  const toGpu = async () => { if (onGpu) return; const t0 = performance.now(); await G.upload(); onGpu = true; handing = performance.now() - t0; poses = null; fresh = true; };
  const toCpu = async () => { if (!onGpu) return; const t0 = performance.now(); await G.download(); onGpu = false; handing = performance.now() - t0; remember(F, WORLD_TRUE); solo.memo.sel = null; drawn = null; card = null; gotAt = null; };
  return {
    gpu: info ? `${info.vendor} ${info.architecture}` : 'GPU', get onGpu() { return onGpu; },
    takeHand() { const h = handing; handing = 0; return h; },   // (ms the last hand-over took: not a block's cost)
    get nearN() { return onGpu ? 0 : solo.nearN; },
    setFocus(f) { solo.setFocus(onGpu ? null : f); },
    async step(dt, during) {   // (during: the water's step, run while the GPU works on a block; the CPU's fine step leaves it to the caller)
      if (dt > FINE) { await toGpu(); await G.block(dt, during); fresh = true; }
      else { await toCpu(); solo.step(dt); }
    },
    envStepped() {},
    // (before a snapshot: while the GPU holds the lakes, what the view draws — gathered there after each block — and the card's fish)
    async prep() {
      if (!onGpu) return;
      const want = !(WORLD_TRUE && (!cam || cam[2] > DRAW_CAM)), sel = selId >= 0 ? [selId, selKind] : null;
      const cx = cam ? cam[0] : 0, cy = cam ? cam[1] : 0, moved = !gotAt || Math.hypot(cx - gotAt[0], cy - gotAt[1]) > DRAW_R / 4 || want !== gotAt[2];   // (the camera moved on with no block since: paused, or slow blocks)
      if (fresh || moved || (sel && (!card || card.id !== selId || card.kind !== selKind))) {
        const r = want ? (WORLD_TRUE ? DRAW_R : 1e6) : 0;
        drawn = await G.drawn(cx, cy, r, sel, poses); poses = drawn.poses; fresh = false; gotAt = [cx, cy, want];
        card = sel ? (drawn.selSlot >= 0 ? gpuCard(await G.one(drawn.selSlot, selKind), selKind, env) : { id: selId, kind: selKind, gone: true, cause: 'gone' }) : null;
      }
    },
    view() {
      if (!onGpu) return solo.view();
      if (!drawn) return { fb: new Float32Array(0), yb: new Float32Array(0), nf: 0, ny: 0, count: 0 };
      return { ...drawn, fb: drawn.fb.slice(), yb: drawn.yb.slice() };   // (copies: a snapshot hands its arrays to the view, and a tick with no block sends these again)
    },
    sel() { return onGpu ? card : solo.sel(); },
    async stats() { return onGpu ? statsMerge([await gpuStatsPart(G, F)], env, F.lakeHa) : solo.stats(); },
    totals(count, nf, ny) {
      if (!onGpu) return solo.totals(count, nf, ny);
      let c = 0; for (let k = 0; k < (G.cnt || []).length; k++) c += G.cnt[k]; return { count: c, agents: G.n, nyAll: G.ny };
    },
    async seedSeason(y0, y1) { await toCpu(); solo.seedSeason(y0, y1); },
    counts() { return onGpu && G.cnt ? { cnt: G.cnt, bio: G.bio, lakeHa: F.lakeHa } : solo.counts(); },
  };
}

// the step for a speed: fine 0.1 s up to FINE_UP×, else a block of speed / BLOCKS_S s (at least 1.5 s, at most BLOCK_MAX) — and
// at least as long as the speed × what a block costs: the true-size lakes' blocks cost ~5 s each whatever their length (every
// agent lives each one), so at 1 min/s a 20-s block ran 4× real time, not 60×; a block of speed × its cost runs at the speed asked
let blockMs = WORLD_TRUE ? 5000 : 0, busyS = 0;
const stepFor = sp => sp <= FINE_UP ? FINE : Math.min(BLOCK_MAX, Math.max(1.5, sp / BLOCKS_S, sp * blockMs * 1.1 / 1000));
async function advance(dt) {
  if (!run) return;
  h = stepFor(speed);
  acc += Math.min(Math.max(0.25, 1.5 * busyS), dt) * speed;   // (no catch-up after a pause — but the seconds a long block itself took count)
  const t0 = performance.now();
  while (acc >= h && performance.now() - t0 < BUDGET) {
    // the water: every simulated minute, or every block when blocks are longer (its physics' scale: minutes to half an hour) — after
    // the fish's step, or (a GPU block) while the GPU works, the fish's takes added to it after (gpufish.js block's `during`)
    envAcc += h; let stepped = false; const water = () => { env.step(envAcc); envAcc = 0; stepped = true; };
    const due = envAcc >= Math.max(h, ENV_FINE) - 1e-9;
    const ts = performance.now(); await side.step(h, due ? water : null); acc -= h; if (due && !stepped) water();
    const dur = performance.now() - ts - (side.takeHand ? side.takeHand() : 0); stepMs += (dur - stepMs) * 0.1;   // (a step's cost — its water's too — for the status; a hand-over to or from the GPU isn't one)
    if (stepped) side.envStepped();
    histTick();
    if (h > FINE) blockMs += (dur - blockMs) * 0.3;   // (a block's cost: the next blocks' length)
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
  else if (name === 'zoo') for (let j = 0; j < n; j++) out[j] = (c.zooD[j] + c.zooC[j] + c.zooS[j]) * PLANKTON.UGL;
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
  // THE SHALLOWS' ANIMALS (render3/shallows3view.js): the herps' numbers now (herps3 n — none under full ice or out of their season),
  // the tadpoles per bed cell by cohort (g wet/m², stride 5: the green and mink frogs' this year's and last year's, the bullfrogs'
  // three) and each cohort's mean tadpole (g), the shallows' water (°C, < 2 m), the weeds' large fauna per bed cell (g wet/m²: the
  // damselfly and dragonfly nymphs among it) and the shore's fallen wood per column (plants3 wood)
  const H = env.herps, fauna = env.lit ? Float32Array.from(env.lit.L) : new Float32Array(nb), wood = Float32Array.from(P.wood || new Float32Array(env.G.NC));
  const tad = new Float32Array(nb * 5); let tS = 0, aS = 0;
  for (let i = 0; i < nb; i++) { if (P.zb[i] < 2) { const a = env.G.bedA[P.cells[i]]; tS += env.temp[P.cells[i]] * a; aS += a; } if (H) { tad[i * 5] = H.tg[0][i]; tad[i * 5 + 1] = H.tg[1][i]; tad[i * 5 + 2] = H.tb[0][i]; tad[i * 5 + 3] = H.tb[1][i]; tad[i * 5 + 4] = H.tb[2][i]; } }
  const herp = { n: H ? { ...H.n } : null, tadW: H ? [...H.mG, ...H.mB] : null, tl: aS > 0 ? tS / aS : env.temp[0] };
  postMessage({ type: 'plants', shoots: out, mus, surf, bed, wY, dead, yf: env.yearFrac(), herp, tad, fauna, wood }, [out.buffer, mus.buffer, surf.buffer, bed.buffer, dead.buffer, tad.buffer, fauna.buffer, wood.buffer]); plantsAt = performance.now();
}
// THE FOREST'S LARGE ANIMALS (src/w3/forest3.js: env.forest — null while it is off or not built): its bears, deer and moose packed for
// the view (render3/wild3view.js reads the same two lists), 8 numbers each: id, kind, x, y (the sim's metres), heading, act, young, length m
const FOREST_KIND = ['bear', 'deer', 'moose'], FOREST_ACT = ['walk', 'graze', 'browse', 'drink', 'wade', 'fish', 'bed', 'den'];
function forestOf() {
  const fo = env.forest, A = fo && fo.animals; if (!A || !A.length) return null;
  const out = new Float32Array(A.length * 8);
  for (let i = 0; i < A.length; i++) { const a = A[i], o = i * 8; out[o] = a.id; out[o + 1] = FOREST_KIND.indexOf(a.kind); out[o + 2] = a.x; out[o + 3] = a.y; out[o + 4] = a.heading || 0; out[o + 5] = Math.max(0, FOREST_ACT.indexOf(a.act)); out[o + 6] = a.young ? 1 : 0; out[o + 7] = a.len || 0; }
  return out;
}
function snapshot() {
  const { fb, yb, nf, ny, count } = side.view();
  const ice = Float32Array.from(env.ice), rz = Float32Array.from(rises), wz = Float32Array.from(wildEv);
  const ru = new Uint32Array(rz.buffer); for (let o = 4; o < rz.length; o += 6) ru[o] = rises[o];   // (each rise's fish id as u32 bits — exact past 2^24: rises3view reads it so)
  rises = []; wildEv = [];
  const field = show !== 'plain' && ticks % 10 === 0 ? fieldOf(show) : null;
  const msg = { type: 'snap', time: env.time, t: env.t, yf: env.yearFrac(), weather: env.weather, windSpeed: env.windSpeed, temp0: env.temp[0], sun: env.sun, air: env.airT ? env.airT() : null,
    acc, h, nf, ny, simT: env.time + envAcc, stepMs,   // (simT: the fish's clock — the water's steps a simulated minute at a time at the fine speeds)
    shards: side.pool ? 2 : 0, gpu: side.onGpu ? side.gpu : null, sel: side.sel(), fish: fb, yoy: yb, ice, field, show, rises: rz, wild: wz, forest: forestOf(), ...side.totals(count, nf, ny) };
  const tr = [fb.buffer, yb.buffer, ice.buffer, rz.buffer, wz.buffer]; if (field) tr.push(field.buffer); if (msg.forest) tr.push(msg.forest.buffer);
  postMessage(msg, tr);
}

// THE MESSAGES ONE AT A TIME: each handled after the one before has finished. (A tick's steps are awaited — the GPU's blocks, the
// shards' replies — and messages once ran in between: a season jump in the middle of a GPU block, a shard call overwriting the step's
// own reply so the step never ended and the lakes froze; and a tick that came while one still ran was dropped, which left the view
// waiting for its snapshot.) A tick that arrives while another still waits its turn joins it — their seconds summed, the newer
// camera — rather than queue behind it
let queue = Promise.resolve(), tickQ = null;
onmessage = ev => {
  const m = ev.data;
  if (m.type === 'tick') { if (tickQ) { tickQ.dt += m.dt; if (m.cam) tickQ.cam = m.cam; return; } tickQ = { ...m }; }
  const job = m.type === 'tick' ? tickQ : m;
  queue = queue.then(() => { if (job === tickQ) tickQ = null; return handle(job); });
};
async function handle(m) {
  try {
    if (m.type === 'init') {
      if (m.cam) cam = m.cam;
      // (the true-size lakes take seconds to found: the view shows each stage; an error is reported, not swallowed)
      const t0 = performance.now(), say = text => postMessage({ type: 'progress', text, s: (performance.now() - t0) / 1000 });
      const q = new URLSearchParams(self.location.search), cores = self.navigator?.hardwareConcurrency || 2;
      const shards = WORLD_TRUE && self.crossOriginIsolated && cores >= 4 && q.get('shards') !== '0';
      const gpu = !!self.navigator?.gpu && (WORLD_TRUE ? q.get('gpu') !== '0' : q.get('gpu') === '1');
      stageR5(R5);   // (the whole model: world3sel R5 — before the water and the fish are built)
      say('the water'); const st0 = getRandState(); env = new Env3();
      if (gpu) { say("the fish and the season's young"); try { side = await gpuSide(say); blockMs = 100; } catch (e) { console.warn('no GPU engine:', e); side = null; } }
      if (!side && shards) side = await poolSide(2, say, st0);
      else if (!side) { say("the fish and the season's young"); side = soloSide(); }
      say('the first look'); postMessage({ type: 'ready', NC: env.G.NC, NCELL: env.G.NCELL, shards: side.pool ? 2 : 0, gpu: side.gpu || null });
      sendPlants(); snapshot();
    } else if (m.type === 'tick') {
      // FIDELITY BY DISTANCE (TRUE_SCALE.md T3): on the true-size lakes, at the fine speeds, the fish within FOCUS_R of where the view
      // looks live second by second and the rest in banked blocks (the 1/10 world, every fish drawn, steps them all alike)
      if (m.cam) cam = m.cam;
      if (WORLD_TRUE && m.cam && stepFor(speed) === FINE) {
        const want = m.cam[2] > DRAW_CAM ? FOCUS_R[0] : Math.min(FOCUS_R[1], Math.max(FOCUS_R[0], m.cam[2] * 2)), nn = side.nearN;
        if (nn > NEAR_MAX) focusR *= 0.85; else if (nn < 0.75 * NEAR_MAX) focusR = focusR * 1.1 + 1;
        focusR = Math.max(FOCUS_R[0] / 2, Math.min(want, focusR));
        side.setFocus([m.cam[0], m.cam[1], focusR]);
      } else side.setFocus(null);
      ticks++; await advance(m.dt); if (performance.now() - plantsAt > PLANTS_MS) sendPlants(); if (side.prep) await side.prep(); snapshot();
      if (statsOn && !side.pool && performance.now() - statsAt > STATS_MS) { statsAt = performance.now(); postStats(await side.stats()); }
    }
    else if (m.type === 'stats') { statsOn = !!m.on; if (statsOn) sendHistory(); if (statsOn && !side.pool) { statsAt = performance.now(); postStats(await side.stats()); } else statsAt = -1e9; }
    else if (m.type === 'select') { selId = m.id ?? -1; selKind = m.kind || 'fish'; }
    else if (m.type === 'run') run = !!m.run;
    else if (m.type === 'speed') speed = +m.speed || 1;
    else if (m.type === 'show') show = m.show;
    else if (m.type === 'season') {   // (a jump forward in the year carries the young along and adds the spawnings it skipped)
      const y0 = env.yearFrac(); env.primeSeason(Math.floor(env.time / CLOCK3.YEAR_LEN) * CLOCK3.YEAR_LEN + m.yf * CLOCK3.YEAR_LEN);
      if (env.yearFrac() > y0) await side.seedSeason(y0, env.yearFrac());
      side.envStepped(); sendPlants();
    }
  } catch (e) { postMessage({ type: 'error', text: String(e && e.stack || e) }); }
}
postMessage({ type: 'loaded' });   // (the view waits for this before it sends init: see main3 start)
