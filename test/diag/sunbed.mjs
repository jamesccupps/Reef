// WHY DON'T SUNFISH EAT THE BED'S WORMS AND SCUDS? At a date (yf), for a few days, per species (sunfish, perch): the share of
// fish-steps within BENTHOS.REACH of the bed, the mean reachable density E (g/m² above refuge) under them, gut fullness
// (gut/gEff ≈ gut/gmax), the benth intake achieved vs the rate the rule allows (Cmax × E/(E+K)), and p.
//   node sunbed.mjs <seed> <yf> [days]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const C = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { cmax } = await import(R + 'bioenergetics.js');
const { TIME, SEASON, BENTHOS: B, WORLD, GRID, BIOE, bedY } = C;
seed(+(process.argv[2] || 1)); const w = new World(); const e = w.env;
const yf = +(process.argv[3] || 0.6), days = +(process.argv[4] || 3), cm2 = WORLD.SLICE_M2 / GRID.FIELD_COLS;
const t0 = w.time; while (w.time - t0 < (yf - SEASON.START_YF) * TIME.YEAR_LEN) w.step(1 / 30);
const S = {}; const st = k => S[k] ??= { n: 0, reach: 0, E: 0, full: 0, got: 0, allow: 0, larva: 0, poor: 0, zoo: 0, h: 0 };
const calls = []; const tb = e.takeBenth.bind(e); e.takeBenth = function (x, want) { const g = tb(x, want); calls.push(x, g); return g; };
const gw = (fn, key) => { const o = w[fn].bind(w); w[fn] = function (a, ...r) { const g0 = a.gut; const res = o(a, ...r); if (S[a.species]) S[a.species][key] += a.gut - g0; return res; }; };
gw('_graze', 'larva'); gw('_meal', 'poor'); gw('_eatZoo', 'zoo');
const steps = Math.round(days * BIOE.DAY * 30);
for (let s = 0; s < steps; s++) {
  // per-fish state before the step (where it is, what the bed under it allows, its gut)
  for (const a of w.agents) {
    if (a.dead || (a.species !== 'sunfish' && a.species !== 'perch') || a.L < 8) continue;
    const o = st(a.species); o.n++;
    const h = bedY(a.x) - a.y; o.h += h;
    if (h < B.REACH) { o.reach++; const c = e.colOf(a.x), E = Math.max(0, e.benth[c] / cm2 - B.REFUGE); o.E += E;
      o.allow += B.Q * cmax(a.sp.bio, a.W, e.tempAt(a.x, a.y)) * a.W * (1 / 30) / BIOE.DAY * E / (E + B.K_FISH); }
    o.full += a.gut / (a.sp.gut * a.W);
  }
  calls.length = 0; w.step(1 / 30);
  // attribute each takeBenth call to the agent at that x (feeding happens after the move, so a.x is the call's x)
  const byX = new Map(); for (const a of w.agents) if (!a.dead) byX.set(a.x, a);
  for (let i = 0; i < calls.length; i += 2) { const a = byX.get(calls[i]); if (a && S[a.species]) S[a.species].got += calls[i + 1]; }
}
console.log(`${e.monthName()} ${e.tempC.toFixed(1)} °C, ${days} days`);
for (const [k, o] of Object.entries(S)) console.log(`${k.padEnd(8)} fish-steps ${o.n}: within REACH ${(o.reach / o.n * 100).toFixed(0)} %, mean height ${(o.h / o.n).toFixed(0)} px, E ${(o.E / Math.max(1, o.reach)).toFixed(2)} g/m², gut ${(o.full / o.n * 100).toFixed(0)} % full | allowed benth ${o.allow.toFixed(1)} g; got benth ${o.got.toFixed(1)} larva ${o.larva.toFixed(1)} poor ${o.poor.toFixed(1)} zoo ${o.zoo.toFixed(1)} g`);
