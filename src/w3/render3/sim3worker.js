// sim3worker.js — the 3-D lakes' simulation off the main thread (browser layer: a module Worker that imports only the pure
// sim, src/w3/env3.js + fish3.js). The view sends {type: 'tick', dt} once a frame — and only after this worker's previous
// reply — and the worker advances the water and the fish by dt × speed (the fish at 10 steps a sim second, the water every
// second step, as the gate runs them) within a time budget, then replies with a snapshot: the clock and the weather, the ice
// per column, every fish with where it was a step before (the view interpolates), the schools of young, and the field the
// cut-away shows. When the sim can't keep up (the higher speeds on a slow machine) it runs slower than asked.
import { Env3 } from '../env3.js';
import { Fish3 } from '../fish3.js';
import { CLOCK3 } from '../clock3.js';
import { PLANKTON } from '../../config.js';

const FISH_STRIDE = 18, YOY_STRIDE = 11;   // (render3/fish3view.js reads the same layout)
const BUDGET = 40;   // ms of stepping per tick at most (the view never waits on it: it draws the last snapshot meanwhile)
let env = null, F = null, run = true, speed = 1, acc = 0, envN = 0, show = 'plain', ticks = 0;

function remember() {
  for (const a of F.fish) { a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch; }
  for (const q of F.yoy) { q._px = q.x; q._py = q.y; q._pz = q.z; }
}
function advance(dt) {
  if (!run) return;
  acc += Math.min(0.25, dt) * speed;
  const t0 = performance.now();
  while (acc >= 0.1 && performance.now() - t0 < BUDGET) {
    remember(); F.step(0.1); if (++envN % 2 === 0) env.step(0.2); acc -= 0.1;
  }
  acc = Math.min(acc, 0.1);   // (behind: drop the backlog — the sim runs slower than asked rather than lurch)
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
  }
  const ice = Float32Array.from(env.ice);
  const field = show !== 'plain' && ticks % 10 === 0 ? fieldOf(show) : null;
  const msg = { type: 'snap', time: env.time, t: env.t, yf: env.yearFrac(), weather: env.weather, windSpeed: env.windSpeed, temp0: env.temp[0], sun: env.sun,
    acc, nf, ny, fish: fb, yoy: yb, ice, count, agents: nf, field, show };
  const tr = [fb.buffer, yb.buffer, ice.buffer]; if (field) tr.push(field.buffer);
  postMessage(msg, tr);
}

onmessage = ev => {
  const m = ev.data;
  if (m.type === 'init') {
    env = new Env3(); F = new Fish3(env); remember();
    postMessage({ type: 'ready', NC: env.G.NC, NCELL: env.G.NCELL });
    snapshot();
  } else if (m.type === 'tick') { ticks++; advance(m.dt); snapshot(); }
  else if (m.type === 'run') run = !!m.run;
  else if (m.type === 'speed') speed = +m.speed || 1;
  else if (m.type === 'show') show = m.show;
  else if (m.type === 'season') { env.primeSeason(Math.floor(env.time / CLOCK3.YEAR_LEN) * CLOCK3.YEAR_LEN + m.yf * CLOCK3.YEAR_LEN); remember(); }
};
