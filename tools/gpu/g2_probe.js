// G2 probe: one species' young schools on the GPU engine every `every` days — count, the largest, ages, recruits — against the same
// on fish3 (?mode=cpu). http://localhost:8000/tools/gpu/g2_probe.html?seed=612&sp=dace&days=30&every=5[&mode=cpu]
import '../../src/w3/render3/world3sel.js';
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const qs = new URLSearchParams(location.search);
const SEED = +(qs.get('seed') || 612), SP = qs.get('sp') || 'dace', DAYS = +(qs.get('days') || 30), EVERY = +(qs.get('every') || 5), YF = +(qs.get('yf') || 0.3), MODE = qs.get('mode') || 'gpu';
const B = 1752, PD = Math.round(86400 / B);
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, S3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
const L = await import('../../src/w3/gpu/layout.js');
const { GpuFish } = await import('../../src/w3/gpu/gpufish.js');
seed(SEED); const env = new Env3({ yf0: YF }), F = new Fish3(env, { young: true }); const k = S3[SP].i;
let G = null; if (MODE === 'gpu') { const { dev } = await GpuFish.device(); G = new GpuFish(dev, F, env, { seed: SEED }); G.uploadAgents(F.fish); G.uploadYoy(F.yoy); G.clearTallies(); }
const show = async day => {
  let rows = [];
  if (G) { const Y = await G.readYoyArr(); for (let q = 0; q < G.ny; q++) { const o = L.readYoy(Y, G.ycap, q); if (o.alive && o.k === k) rows.push(o); } }
  else rows = F.yoy.filter(q => q.alive && q.k === k).map(q => ({ L: q.L, n: q.n, age: q.age, W: q.W, p: q.p }));
  rows.sort((a, b) => b.L - a.L);
  const c = G ? await G.census() : F.census();
  log(`day ${day}: ${rows.length} schools of young ${SP}, ${rows.reduce((t, r) => t + r.n, 0).toFixed(0)} fish · adults ${c[SP].n.toFixed(0)} · largest: ` + rows.slice(0, 5).map(r => `${r.L.toFixed(2)} cm (${r.n.toFixed(0)} fish, ${(r.age / 86400).toFixed(0)} d, p ${(r.p ?? 0).toFixed(2)})`).join(' · '));
};
await show(0);
for (let day = 1; day <= DAYS; day++) {
  for (let b = 0; b < PD; b++) { if (G) await G.block(B); else F.step(B); env.step(B); }
  if (day % EVERY === 0) await show(day);
}
if (G) { const tl = await G.readTallies(); log(`recruits ${(tl[460 + k] / 1e6).toFixed(0)}`); } else log(`recruits ${F.stats.recruits[SP]}`);
document.title = 'done';
