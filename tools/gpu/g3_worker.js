// GPU stage G3: the browser's sim worker (src/w3/render3/sim3worker.js) with the GPU engine, driven as the view drives it — a tick
// after each snapshot — without the renderer: real time on the CPU, then fast-forward (the lakes handed to the GPU; the drawn fish
// gathered there; a fish followed; the data page's numbers), then real time again (the lakes handed back). Each stage's numbers and
// timings are logged.   http://localhost:8000/tools/gpu/g3_worker.html?gpu=1   (the 1/10 world)   ·   ?world=true   (the true lakes)
import '../../src/w3/render3/world3sel.js';
const { GEO, WORLD_TRUE } = await import('../../src/w3/geometry.js');
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const W = new Worker(new URL('../../src/w3/render3/sim3worker.js' + location.search, import.meta.url), { type: 'module' });
const waiters = []; let stats = null;
W.onmessage = ev => { const m = ev.data; if (m.type === 'stats') stats = m; if (m.type === 'error') log('ERROR', m.text); for (const w of waiters.splice(0)) w(m); };
W.onerror = e => log('WORKER ERROR', e.message || e.type);
const next = type => new Promise(res => { const f = m => (m.type === type ? res(m) : waiters.push(f)); waiters.push(f); });
await next('loaded');
const [cx, cy] = GEO.NOTES[2].xy, cam = [cx, cy, WORLD_TRUE ? 300 : 120];
const t0 = performance.now(); W.postMessage({ type: 'init', cam }); const ready = await next('ready'); await next('snap');
log(`ready in ${((performance.now() - t0) / 1000).toFixed(1)} s · GPU ${ready.gpu || 'none'} · camera over ${GEO.NOTES[2].name || 'note 2'}`);
// (each tick's dt the real seconds since the last, as the view's frame loop sends it — at least a 60-Hz frame's)
let tLast = performance.now();
const tick = async n => { let s = null; for (let i = 0; i < n; i++) { const now = performance.now(), dt = Math.max(1 / 60, (now - tLast) / 1000); tLast = now; W.postMessage({ type: 'tick', dt, cam }); s = await next('snap'); } return s; };
const show = (tag, s, ms) => log(`${tag}: ${(s.time / 86400).toFixed(3)} d · step ${s.h.toFixed(1)} s · ${s.gpu ? 'on the GPU (' + s.gpu + ')' : 'on the CPU'} · ${Math.round(s.count).toLocaleString()} fish, ${s.agents.toLocaleString()} brains, ${s.nyAll.toLocaleString()} schools · drawn ${s.nf} fish, ${s.ny} schools${ms ? ` · ${ms.toFixed(0)} ms` : ''}${s.sel ? ` · card: ${s.sel.gone ? 'GONE ' + s.sel.cause : s.sel.name + ' ' + s.sel.L.toFixed(1) + ' cm, ' + s.sel.doing}` : ''}`);
// the speed the sim keeps over n ticks (simulated s per wall s) and its step's cost
// (at the fine speeds the snapshot's clock is the water's, which moves once a simulated minute: the speed a 0.1-s step's cost allows instead)
const rateOf = async (n, tag) => { await tick(1); const b = await tick(n); show(`${tag} (a 0.1-s step ${b.stepMs.toFixed(1)} ms: at most ${(100 / Math.max(1e-3, b.stepMs)).toFixed(1)}× real time)`, b); return b; };
let s = await rateOf(60, 'real time (1×)');
W.postMessage({ type: 'speed', speed: 4 }); s = await rateOf(60, '4×'); W.postMessage({ type: 'speed', speed: 1 });
// fast-forward
W.postMessage({ type: 'speed', speed: 3600 }); let ta = performance.now(); s = await tick(1); show('1 h/s, first tick (the hand-over)', s, performance.now() - ta);
const tm0 = s.time; ta = performance.now(); s = await tick(60); const wall = (performance.now() - ta) / 1000;
show(`1 h/s, 60 ticks (${((s.time - tm0) / wall).toFixed(0)}× real time over ${wall.toFixed(1)} s)`, s);
// follow a drawn fish
let pick = -1; for (let q = 0; q < s.nf; q++) if (s.fish[q * 18 + 16] < 0.5) { pick = s.fish[q * 18 + 15]; break; }
if (pick < 0 && s.nf) pick = s.fish[15];
W.postMessage({ type: 'select', id: pick, kind: 'fish' }); s = await tick(3); show(`followed fish ${pick}`, s);
log('   card: ' + JSON.stringify(s.sel || {}).slice(0, 400));
// the data page while the GPU holds the lakes
W.postMessage({ type: 'stats', on: true }); stats = null; await tick(4); for (let i = 0; i < 80 && !stats; i++) await tick(1);
if (stats) log(`   data page: ${stats.agents} brains, ${stats.yoySchools} schools · ` + Object.entries(stats.sp).map(([k, r]) => `${k} ${Math.round(r.n)} (${r.kgHa.toFixed(1)} kg/ha, up ${Math.round(r.up)}/low ${Math.round(r.low)})`).join(' · ') + ` · spawnings ${Object.values(stats.sp).reduce((t, r) => t + (r.spawns || 0), 0)}`);
else log('   data page: NO STATS');
W.postMessage({ type: 'stats', on: false });
// the max speed
W.postMessage({ type: 'speed', speed: 1e6 }); const tmx = s.time; ta = performance.now(); s = await tick(40); const wm = (performance.now() - ta) / 1000;
show(`max, 40 ticks (${((s.time - tmx) / wm).toFixed(0)}× real time; a day in ${(86400 / ((s.time - tmx) / wm)).toFixed(1)} s)`, s);
// back to real time: the lakes handed back
const before = s; W.postMessage({ type: 'speed', speed: 1 }); ta = performance.now(); s = await tick(1); show('1×, first tick (handed back)', s, performance.now() - ta);
s = await rateOf(60, 'real time again');
log(`fish before / after the hand-back: ${Math.round(before.count)} / ${Math.round(s.count)} · brains ${before.agents} / ${s.agents}`);
W.postMessage({ type: 'select', id: pick, kind: 'fish' }); s = await tick(3); log('   the followed fish on the CPU: ' + JSON.stringify(s.sel || {}).slice(0, 300));
document.title = 'done';
