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
import { Env3 } from '../env3.js';
import { Fish3 } from '../fish3.js';
import { CLOCK3 } from '../clock3.js';
import { PLANKTON } from '../../config.js';

const FISH_STRIDE = 18, YOY_STRIDE = 12;   // (render3/fish3view.js reads the same layout)
const BUDGET = 40;   // ms of stepping per tick at most (the view never waits on it: it draws the last snapshot meanwhile)
const PLANTS_MS = 4000;   // the weeds change slowly: their field every this often
const FINE = 0.1, FINE_UP = 6, BLOCKS_S = 3, BLOCK_MAX = 1752, ENV_FINE = 60;   // s; ×; blocks a second; s; s of water step when fine
let env = null, F = null, run = true, speed = 1, acc = 0, envAcc = 0, h = FINE, show = 'plain', ticks = 0, plantsAt = -1e9;
const RISES_MAX = 300;   // rises a snapshot carries at most (the view's rings: the insects taken at the surface)
let rises = [];

function remember() {
  for (const a of F.fish) { a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch; }
  for (const q of F.yoy) { q._px = q.x; q._py = q.y; q._pz = q.z; }
}
// the step for a speed: fine 0.1 s up to FINE_UP×, else a block of speed / BLOCKS_S s (at least 1.5 s, at most BLOCK_MAX)
const stepFor = sp => sp <= FINE_UP ? FINE : Math.min(BLOCK_MAX, Math.max(1.5, sp / BLOCKS_S));
function advance(dt) {
  if (!run) return;
  h = stepFor(speed);
  acc += Math.min(0.25, dt) * speed;
  const t0 = performance.now();
  while (acc >= h && performance.now() - t0 < BUDGET) {
    remember(); F.step(h); acc -= h;
    for (let q = 0; q < F.rises.length && rises.length < RISES_MAX * 6; q++) rises.push(F.rises[q]);
    // the water: every simulated minute, or every block when blocks are longer (its physics' scale: minutes to half an hour)
    envAcc += h; if (envAcc >= Math.max(h, ENV_FINE) - 1e-9) { env.step(envAcc); envAcc = 0; }
  }
  acc = Math.min(acc, h);   // (behind: drop the backlog — the sim runs slower than asked rather than lurch)
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
  const fs = F.fish, Y = F.yoy;
  let nf = 0; for (const a of fs) if (a.alive) nf++;
  let ny = 0; for (const q of Y) if (q.alive) ny++;
  const fb = new Float32Array(nf * FISH_STRIDE), yb = new Float32Array(ny * YOY_STRIDE);
  let o = 0, count = 0;
  for (const a of fs) {
    if (!a.alive) continue;
    fb[o++] = a._px; fb[o++] = a._py; fb[o++] = a._pz; fb[o++] = a._pyaw; fb[o++] = a._ppitch;
    fb[o++] = a.x; fb[o++] = a.y; fb[o++] = a.z; fb[o++] = a.yaw; fb[o++] = a.pitch;
    fb[o++] = a.L; fb[o++] = a.k; fb[o++] = a.n; fb[o++] = a.spd; fb[o++] = a.bed; fb[o++] = a.id; fb[o++] = a.school ? 1 : 0; fb[o++] = a.bodyMul;
    count += a.n;
  }
  o = 0;
  for (const q of Y) {
    if (!q.alive) continue;
    yb[o++] = q._px; yb[o++] = q._py; yb[o++] = q._pz; yb[o++] = q.x; yb[o++] = q.y; yb[o++] = q.z; yb[o++] = q.L; yb[o++] = q.k; yb[o++] = q.n; yb[o++] = q.id; yb[o++] = q.bed;
    yb[o++] = q.gref && q.gref.alive && q.gref.nt > 0 ? 1 : 0;   // (a brood its parent still guards)
  }
  const ice = Float32Array.from(env.ice), rz = Float32Array.from(rises); rises = [];
  const field = show !== 'plain' && ticks % 10 === 0 ? fieldOf(show) : null;
  const msg = { type: 'snap', time: env.time, t: env.t, yf: env.yearFrac(), weather: env.weather, windSpeed: env.windSpeed, temp0: env.temp[0], sun: env.sun,
    acc, h, nf, ny, fish: fb, yoy: yb, ice, count, agents: nf, field, show, rises: rz };
  const tr = [fb.buffer, yb.buffer, ice.buffer, rz.buffer]; if (field) tr.push(field.buffer);
  postMessage(msg, tr);
}

onmessage = ev => {
  const m = ev.data;
  if (m.type === 'init') {
    env = new Env3(); F = new Fish3(env, { young: true }); remember();   // (the lake opens with the season's young so far: seedSeason)
    postMessage({ type: 'ready', NC: env.G.NC, NCELL: env.G.NCELL });
    sendPlants(); snapshot();
  } else if (m.type === 'tick') { ticks++; advance(m.dt); if (performance.now() - plantsAt > PLANTS_MS) sendPlants(); snapshot(); }
  else if (m.type === 'run') run = !!m.run;
  else if (m.type === 'speed') speed = +m.speed || 1;
  else if (m.type === 'show') show = m.show;
  else if (m.type === 'season') {   // (a jump forward in the year carries the young along and adds the spawnings it skipped)
    const y0 = env.yearFrac(); env.primeSeason(Math.floor(env.time / CLOCK3.YEAR_LEN) * CLOCK3.YEAR_LEN + m.yf * CLOCK3.YEAR_LEN);
    if (env.yearFrac() > y0) F.seedSeason(y0, env.yearFrac(), true);
    remember(); sendPlants();
  }
};
