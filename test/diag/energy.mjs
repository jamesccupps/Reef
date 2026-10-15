// WHOLE-LAKE ENERGY AUDIT (per month and per year, kg wet in the ~700 m² slice and g/m²): zooplankton gross production,
// benthic larvae growth (production), what fish (agents) eat by food type, what fry schools eat, fish growth (agents'
// mass gain incl. gonads) — to compare with real lakes (Bay of Quinte: zoo 240, zoobenthos 125, fish 20 g wet/m²/yr;
// fish consumption ~6× their biomass a year; zoobenthos ~50–65 % of fish food).
//   node energy.mjs <seed> <years>
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { TIME, WORLD, PREY } = CFG;
const S = +(process.argv[2] || 1), Y = +(process.argv[3] || 1), dt = 1 / 30, YL = TIME.YEAR_LEN, M2 = WORLD.SLICE_M2;
seed(S); const w = new World(); const e = w.env;
const Z = () => ({ zoo: 0, benth: 0, larva: 0, insect: 0, detr: 0, snail: 0, cray: 0, nymph: 0, fish: 0, fry: 0, herp: 0, poor: 0 });
let A = Z(), Fr = Z(), yrA = Z(), yrF = Z();
const add = (o, k, g) => { o[k] += g; };
// agents: wrap the feeding paths and attribute gut gains
const gutWrap = (fn, kindOf) => { const o = w[fn].bind(w); w[fn] = function (a, ...r) { const g0 = a.gut; const res = o(a, ...r); const g = a.gut - g0; if (g > 0) add(A, kindOf(a, r, res), g); return res; }; };
gutWrap('_eatZoo', () => 'zoo');
gutWrap('_graze', (a, r) => r[0] === w.larvaeGrid ? 'larva' : r[0] === w.insectGrid ? 'insect' : 'detr');
gutWrap('_eatFry', () => 'fry');
gutWrap('_ate', (a, r) => { const g = r[1]; return g === PREY.SNAIL_G ? 'snail' : g === PREY.CRAY_G ? 'cray' : g === PREY.NYMPH_G ? 'nymph' : 'poor'; });
gutWrap('_meal', (a, r) => { const ed = r[1]; return ed === PREY.DETRITUS_ED ? 'detr' : (ed === PREY.ALGAE_ED || ed === PREY.PLANT_ED) ? 'poor' : ed >= 3500 ? 'fish' : 'herp'; });
// fry schools: wrap the env feeding (zoo) and estimate the rest from the school's update — attribute zoo only (the dominant food)
const zf = e.zooFeed ? e.zooFeed.bind(e) : null; let inFry = false;
const ff = w._feedFry.bind(w); w._feedFry = function (...r) { inFry = true; const h = ff(...r); inFry = false; return h; };
if (e.takeBenth) { const tb = e.takeBenth.bind(e); e.takeBenth = function (...args) { const g = tb(...args); add(inFry ? Fr : A, 'benth', g); return g; }; }
if (zf) e.zooFeed = function (...args) { const r = zf(...args); if (inFry) add(Fr, 'zoo', r[0] + r[1]); return r; };
// productions
let zp0 = e.zooProd || 0, larvaProd = 0;
const lm = () => w.larvae.reduce((s, L) => s + (L.dead ? 0 : L.m), 0);
let fishG = () => w.agents.reduce((s, a) => s + (a.dead ? 0 : a.W + (a.gon || 0)), 0);
const steps = Math.round(Y * YL / dt), rep = Math.round(YL / 12 / dt);
const MON = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
let yr = { zooP: 0, larP: 0, benP: 0 }, bp0 = e.benthProd || 0;
console.log('mon  T°C | fish kg  | zooP  larvP benP (kg) | AGENTS eat kg: zoo benth larva insect detr snail cray nymph fish fry herp poor | FRY zoo benth | benth kg');
for (let s = 1; s <= steps; s++) {
  // larvae production = growth of existing patches (mass gain before predation): sample mass before/after the larvae update
  const l0 = lm(); w.step(dt); const l1 = lm();
  if (l1 > l0) larvaProd += 0; // (net change; production estimated below from the step's growth hook if present)
  if (s % rep) continue;
  const zooP = (e.zooProd || 0) - zp0; zp0 = e.zooProd || 0;
  const k = v => (v / 1000).toFixed(2);
  const mo = MON[Math.floor(e.yearFrac() * 12) % 12];
  console.log(`${mo}  ${e.tempC.toFixed(1).padStart(5)} | ${k(fishG()).padStart(6)} | ${k(zooP).padStart(5)} ${k(w._larvaProd || 0).padStart(5)} ${k((e.benthProd || 0) - bp0).padStart(5)} | ${Object.keys(A).map(q => k(A[q])).join(' ')} | ${k(Fr.zoo)} ${k(Fr.benth)} | ${k(e.totalBenth ? e.totalBenth() : 0)}`);
  for (const q in A) { yrA[q] += A[q]; yrF[q] += Fr[q]; }
  yr.zooP += zooP; yr.larP += (w._larvaProd || 0); w._larvaProd = 0; yr.benP += (e.benthProd || 0) - bp0; bp0 = e.benthProd || 0;
  A = Z(); Fr = Z();
}
const gm2 = v => (v / M2).toFixed(1);
const tot = Object.values(yrA).reduce((s, v) => s + v, 0);
console.log(`\nPER YEAR (g wet/m²): zoo production ${gm2(yr.zooP)}, larvae production ${gm2(yr.larP)}, worms+scuds production ${gm2(yr.benP)}; agents ate ${gm2(tot)} (zoo ${gm2(yrA.zoo)}, benthos [benth+larva+insect+snail+cray+nymph+detr] ${gm2(yrA.benth + yrA.larva + yrA.insect + yrA.snail + yrA.cray + yrA.nymph + yrA.detr)}, fish+fry ${gm2(yrA.fish + yrA.fry)}, poor ${gm2(yrA.poor)}); fry schools ate zoo ${gm2(yrF.zoo)}`);
console.log('census', JSON.stringify(w.census()));
