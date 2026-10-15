// who eats what: per species, kg eaten per month by food type (agents only), plus the species' biomass
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const C = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { PREY, TIME } = C;
seed(+(process.argv[2] || 1)); const w = new World(); const e = w.env;
const T = {}; const add = (sp, k, g) => { const o = T[sp] ??= {}; o[k] = (o[k] || 0) + g; };
const gw = (fn, kindOf) => { const o = w[fn].bind(w); w[fn] = function (a, ...r) { const g0 = a.gut; const res = o(a, ...r); if (a.gut > g0) add(a.species, kindOf(a, r), a.gut - g0); return res; }; };
gw('_eatZoo', () => 'zoo'); gw('_graze', (a, r) => r[0] === w.larvaeGrid ? 'larva' : r[0] === w.insectGrid ? 'insect' : 'detr'); gw('_eatFry', () => 'fry');
gw('_ate', (a, r) => r[1] === PREY.SNAIL_G ? 'snail' : r[1] === PREY.CRAY_G ? 'cray' : 'other'); gw('_meal', (a, r) => r[1] === PREY.DETRITUS_ED ? 'detr' : (r[1] === PREY.ALGAE_ED || r[1] === PREY.PLANT_ED) ? 'poor' : r[1] >= 3500 ? 'fish' : 'herp');
let cur = null; const tb = e.takeBenth.bind(e); e.takeBenth = function (...a) { const g = tb(...a); if (cur) add(cur, 'benth', g); return g; };
// attribute takeBenth to the agent being processed: wrap the per-agent step via _eatZoo call order is unreliable — instead tag by the agent loop
const st = w.step.bind(w);
const months = +(process.argv[3] || 4), rep = Math.round(TIME.YEAR_LEN / 12 * 30);
// hook: the feeding block reads a.species; patch takeBenth callers by wrapping World.prototype? simplest: track last agent in _eatZoo (called just before benth for planktivores) and in _graze
for (const fn of ['_eatZoo', '_graze', '_eatFry']) { const o = w[fn]; w[fn] = function (a, ...r) { cur = a.species; return o.call(this, a, ...r); }; }
for (let m = 1; m <= months; m++) {
  for (let s = 0; s < rep; s++) st(1 / 30);
  const bio = {}; for (const a of w.agents) if (!a.dead) bio[a.species] = (bio[a.species] || 0) + a.W;
  console.log(`--- month ${m} (${e.monthName()}, ${e.tempC.toFixed(1)} °C)`);
  for (const [sp, o] of Object.entries(T)) { const tot = Object.values(o).reduce((s, v) => s + v, 0); console.log(`${sp.padEnd(8)} ${(bio[sp] / 1000 || 0).toFixed(2)} kg fish | ate ${(tot / 1000).toFixed(2)} kg = ${(tot / (bio[sp] || 1) / 30 * 100).toFixed(1)} %bw/day: ${Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / 1000).toFixed(2)}`).join(' ')}`); }
  for (const k in T) delete T[k];
}
