// shardpool3.js — the 3-D lakes' fish in SHARD WORKERS, from the side that holds the water (docs/TRUE_SCALE.md T5) — pure, no DOM:
// the workers are whatever spawn(i) returns ({postMessage, onmessage, onerror} — a browser Worker running render3/shard3worker.js,
// or Node's worker_threads through tools/w3_shard_host.mjs). Each step goes to every shard at once; the fish that left one's water
// go to the other's with the next step; each gets the others' couplings from the step before (as shard3.js ShardSet does, one after
// another, in one thread); the water's scalars follow each of its steps; the shards' biomass sets the zooplankton's kairomone.
import { KEYS3 } from './fish3.js';
import { BODIES } from './geometry.js';
import { shareArrays, scalarsOf } from './envshare3.js';
import { waterOwners } from './shard3.js';

export class ShardPool {
  // env: the water model, built from random state st0 (each shard builds its replica alike); n shards
  static async start(env, n, st0, spawn) {
    const P = new ShardPool(); P.env = env; P.n = n; P.lakeHa = (BODIES[0].area + BODIES[1].area) / 1e4; P.owner = waterOwners(env.G);
    const arrays = shareArrays(env), scalars = scalarsOf(env);
    P.W = []; P.waiting = []; P.last = []; P.inbox = []; P.dirty = false;
    for (let i = 0; i < n; i++) {
      const w = spawn(i); P.W.push(w);
      await new Promise((res, rej) => {
        w.onmessage = ev => { const m = ev.data; if (m.type === 'loaded') return res(); const p = P.waiting[i]; P.waiting[i] = null; if (m.type === 'error') p?.rej(new Error(`shard ${i}: ${m.text}`)); else p?.res(m); };
        w.onerror = ev => { const e = new Error(`shard ${i}: ${ev.message || ev}`); const p = P.waiting[i]; P.waiting[i] = null; if (p) p.rej(e); else rej(e); };
      });
    }
    const ready = await Promise.all(P.W.map((w, i) => P.call(i, { type: 'init', me: i, st0, arrays, scalars })));
    if (ready.some(r => r.missed)) throw new Error('a shard could not take the shared water');
    ready.forEach((r, i) => { P.last[i] = r; P.inbox[i] = null; });
    return P;
  }
  call(i, msg, tr = []) { return new Promise((res, rej) => { this.waiting[i] = { res, rej }; this.W[i].postMessage(msg, tr); }); }
  others(i) {
    const NK = KEYS3.length, c = new Float64Array(NK), j = new Float64Array(NK);
    for (let q = 0; q < this.n; q++) if (q !== i) { const r = this.last[q]; for (let k = 0; k < NK; k++) { c[k] += r.cnt[k]; if (r.juvOwn) j[k] += r.juvOwn[k]; } }
    return [c, j];
  }
  sum(f) { return this.last.reduce((t, r) => t + (r[f] || 0), 0); }
  // one step of every shard; opts: focus [x, y, r] | null, cam (what the view draws about) | undefined, sel [id, kind] | null, stats
  async step(dt, { focus = null, cam, sel = null, stats = false } = {}) {
    const scalars = this.dirty ? scalarsOf(this.env) : null; this.dirty = false;
    const reps = await Promise.all(this.W.map((w, i) => { const [c, j] = this.others(i); return this.call(i, { type: 'step', h: dt, scalars, cntOther: c, juvOther: j, adopt: this.inbox[i], focus, cam, sel, stats }); }));
    this.inbox = this.W.map(() => ({ fish: [], yoy: [] })); this.handed = this.handed || 0;
    reps.forEach((r, i) => {
      if (!r.drawn) r.drawn = this.last[i].drawn; this.last[i] = r;
      for (const kind of ['fish', 'yoy']) for (const d of r.out[kind]) { const c = this.env.colAt(d.v.x, d.v.y), to = c >= 0 ? this.owner[c] : i; this.inbox[to >= 0 && to < this.n ? to : i][kind].push(d); this.handed++; }
    });
    this.env.chem.fishKgHa = this.sum('bio') / 1000 / this.lakeHa;   // (the zooplankton's kairomone: every shard's fish)
    return reps;
  }
  envStepped() { this.dirty = true; }   // (the water stepped: its scalars go with the next step)
  async seedSeason(y0, y1) { const scalars = scalarsOf(this.env); const reps = await Promise.all(this.W.map((w, i) => this.call(i, { type: 'season', y0, y1, scalars }))); reps.forEach((r, i) => Object.assign(this.last[i], r)); }
  count() { let c = 0; for (const r of this.last) for (let k = 0; k < r.cnt.length; k++) c += r.cnt[k]; return c; }
  stop() { for (const w of this.W) w.terminate?.(); }
}
