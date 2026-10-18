// GPU stage G3: the engine's arrays GROWN mid-run (GpuFish.grow — the spring's recruits, June's spawnings) change nothing: a run whose
// arrays are re-made larger at block `at` must end bit-identical to one with the larger arrays from the start (the kernels index by
// the stride only); and a run started with almost no room must grow itself as the kernels ask (what has no room waits a block) and
// end near the others.   http://localhost:8000/tools/gpu/g3_grow.html?seed=611&days=3&yf=0.3&at=20
import '../../src/w3/render3/world3sel.js';
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const qs = new URLSearchParams(location.search);
const SEED = +(qs.get('seed') || 611), DAYS = +(qs.get('days') || 3), YF = +(qs.get('yf') || 0.3), AT = +(qs.get('at') || 20), B = 1752, PD = Math.round(86400 / B);
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, KEYS3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
const { GpuFish } = await import('../../src/w3/gpu/gpufish.js');
const { dev } = await GpuFish.device();
const run = async (tag, opts, growAt) => {
  seed(SEED); const env = new Env3({ yf0: YF }), F = new Fish3(env, { young: true });
  const n0 = F.fish.length, y0 = F.yoy.length, o = typeof opts === 'function' ? opts(n0, y0) : opts;
  const G = new GpuFish(dev, F, env, { seed: SEED, ...o }); G.uploadAgents(F.fish); G.uploadYoy(F.yoy); G.clearTallies();
  const cap0 = G.cap, ycap0 = G.ycap;
  for (let b = 0; b < DAYS * PD; b++) { if (b === growAt) await G.grow(G.cap * 1.5, G.ycap * 1.5); await G.block(B); env.step(B); }
  const c = await G.census(), tl = await G.readTallies();
  const sig = KEYS3.map(k => [c[k].n, c[k].g, c[k].L, c[k].yoyN, c[k].yoyL, c[k].yoySchools]).flat();
  log(`${tag}: arrays ${cap0}/${ycap0} → ${G.cap}/${G.ycap} (grown ${G.grew || 0}×) · agents ${G.n}, young schools ${G.ny} · ` + KEYS3.map(k => `${k.slice(0, 5)} ${c[k].n.toFixed(0)}/${(c[k].yoyN / 1e3).toFixed(1)}k`).join(' '));
  G.destroy(); return { sig, tl: Array.from(tl) };
};
const A = await run('A, large arrays from the start', (n0, y0) => ({ cap: Math.ceil(n0 * 1.3 * 1.5), ycap: Math.ceil(Math.max(4096, 3 * y0 + 16384) * 1.5) }));
const A2 = await run('A again (the engine deterministic)', (n0, y0) => ({ cap: Math.ceil(n0 * 1.3 * 1.5), ycap: Math.ceil(Math.max(4096, 3 * y0 + 16384) * 1.5) }));
const Bg = await run(`B, grown ×1.5 before block ${AT}`, (n0, y0) => ({ cap: Math.ceil(n0 * 1.3), ycap: Math.max(4096, 3 * y0 + 16384) }), AT);
const C = await run('C, almost no room (grows as the kernels ask)', (n0, y0) => ({ cap: n0 + 8, ycap: y0 + 32 }));
const same = (x, y) => x.sig.every((v, i) => v === y.sig[i]) && x.tl.every((v, i) => v === y.tl[i]);
log(`A = A again: ${same(A, A2) ? 'IDENTICAL' : 'DIFFERENT'} · B (grown) = A: ${same(Bg, A) ? 'IDENTICAL' : 'DIFFERENT'}`);
const rel = KEYS3.map((k, q) => { const a = A.sig[q * 6], c = C.sig[q * 6]; return `${k.slice(0, 5)} ${(c / Math.max(1, a)).toFixed(3)}`; });
log('C against A (fish): ' + rel.join(' '));
document.title = 'done';
