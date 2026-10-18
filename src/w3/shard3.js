// shard3.js — the 3-D lakes' fish in SHARDS (docs/TRUE_SCALE.md T5) — pure, DOM-free. The fish are split by water: shard 0 holds
// Upper Hot Brook Lake's and the brook's, shard 1 Lower's (the brook with Upper: Upper's pumpkinseed and redbreast summer in its
// pools and run in and out of it all season — with it in the other shard, the true lakes handed ~130 adults a block across the
// line, each missing a step's feeding as it crossed). They share one water model; each steps only its own fish and young,
// which read and write only its own water (fish3.js setShard), so the shards can run side by side — in workers on their own
// cores (render3/shard3worker.js) — or, here, one after another in one thread: the same steps, the same result (each shard keeps
// its own random stream, swapped in for its turn). After each step the fish that swam into the other's water are handed over,
// and the lake-wide couplings are summed: the other shards' fish per species (the recruitment cap), their young (the young's
// density compensation) and the fish biomass the zooplankton answer (chem3 fishKgHa).
import { Fish3, KEYS3 } from './fish3.js';
import { BODIES, LOWER } from './geometry.js';
import { getRandState, setRandState } from '../core.js';

// each water column's shard: 0 for Upper's and the brook's, 1 for Lower's
export function waterOwners(G) { const o = new Int8Array(G.NC); for (let c = 0; c < G.NC; c++) o[c] = G.body[c] === LOWER ? 1 : 0; return o; }
export const shardBudgetHa = me => BODIES[me].area / 1e4;   // (the brains a shard may give: its lake's share — the brook's own fish are outside the budget)
// a shard's random stream, from the founding's state and its number
export const shardSeed = (st, me) => ((Math.imul(st ^ 0x9e3779b9, 0x85ebca6b) + 0x632be5ab * (me + 1)) >>> 0) || 1;
export const ID_STRIDE = 1e9;   // (each shard numbers its new fish in its own range)

export class ShardSet {
  // env: the water model; the random state at this call is the founding's (as `new Fish3(env, …)` would start from)
  constructor(env, { young = false, n = 2 } = {}) {
    this.env = env; this.owner = waterOwners(env.G); this.shards = [];
    const st0 = getRandState(); let after = st0;
    for (let me = 0; me < n; me++) {
      setRandState(st0); const F = new Fish3(env, { young }); after = getRandState();
      F.setShard(me, this.owner, shardBudgetHa(me)); F.nextId += me * ID_STRIDE;
      this.shards.push({ F, rs: shardSeed(st0, me) });
    }
    setRandState(after);   // (the main stream goes on as after one founding: the water's own draws)
    this.handed = 0; this.lakeHa = this.shards[0].F.lakeHa;
  }
  get fish() { return this.shards.flatMap(s => s.F.fish); }
  get yoy() { return this.shards.flatMap(s => s.F.yoy); }
  setFocus(x, y, r) { for (const s of this.shards) s.F.setFocus(x, y, r); }
  // one step of every shard (dt, mv as Fish3.step), then the hand-overs and the couplings
  step(dt, mv) {
    const main = getRandState(), S = this.shards, NK = KEYS3.length;
    // (the couplings all from the step before — as the shards' workers get them, stepping side by side)
    const others = S.map((_, i) => { const cO = new Float64Array(NK), jO = new Float64Array(NK);
      for (let q = 0; q < S.length; q++) if (q !== i) { const G = S[q].F; for (let k = 0; k < NK; k++) { cO[k] += G.cnt[k]; if (G.juvOwn) jO[k] += G.juvOwn[k]; } }
      return [cO, jO]; });
    for (let i = 0; i < S.length; i++) {
      const F = S[i].F; F.cntOther = others[i][0]; F.juvOther = others[i][1];
      setRandState(S[i].rs); F.step(dt, mv); S[i].rs = getRandState();
    }
    setRandState(main);
    this.env.chem.fishKgHa = S.reduce((t, s) => t + s.F.bio, 0) / 1000 / this.lakeHa;   // (each shard's at its last full step)
    this.exchange(S.map(s => s.F.takeOut()));
  }
  // the fish and young that left a shard go to the shard whose water they are in
  exchange(outs) {
    const S = this.shards, ins = S.map(() => ({ fish: [], yoy: [] })), G = this.env;
    outs.forEach((out, i) => {
      for (const kind of ['fish', 'yoy']) for (const d of out[kind]) {
        const c = G.colAt(d.v.x, d.v.y), to = c >= 0 ? this.owner[c] : i;
        ins[to >= 0 && to < S.length ? to : i][kind].push(d); this.handed++;
      }
    });
    ins.forEach((pack, i) => S[i].F.adopt(pack));
    return ins;
  }
  // the whole lakes' census (Fish3.census, merged: means weighted by fish)
  census() {
    const parts = this.shards.map(s => s.F.census()), out = {};
    for (const k of KEYS3) {
      const r = { n: 0, agents: 0, g: 0, L: 0, cons: 0, consMax: 0, mature: 0, yoyN: 0, yoySchools: 0, yoyG: 0, yoyL: 0 };
      for (const p of parts) { const q = p[k]; r.n += q.n; r.agents += q.agents; r.g += q.g; r.L += q.L * q.n; r.cons += q.cons; r.consMax += q.consMax; r.mature += q.mature; r.yoyN += q.yoyN; r.yoySchools += q.yoySchools; r.yoyG += q.yoyG; r.yoyL += q.yoyL * q.yoyN; }
      r.L /= Math.max(1e-9, r.n); r.yoyL /= Math.max(1e-9, r.yoyN); r.p = r.cons / Math.max(1e-12, r.consMax); r.kgHa = r.g / 1000 / this.lakeHa; r.perHa = r.n / this.lakeHa; r.meanW = r.g / Math.max(1e-9, r.n);
      out[k] = r;
    }
    return out;
  }
  // the shards' tallies summed (numbers at any depth)
  get stats() { return sumTree(this.shards.map(s => s.F.stats)); }
}
export function sumTree(list) {
  const a = list[0]; if (typeof a === 'number') return list.reduce((t, v) => t + (v || 0), 0);
  if (!a || typeof a !== 'object') return a;
  const out = {}; const keys = new Set(list.flatMap(o => o ? Object.keys(o) : []));
  for (const k of keys) out[k] = sumTree(list.map(o => o ? o[k] : undefined).filter(v => v !== undefined));
  return out;
}
