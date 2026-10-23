// w3_render_bench.mjs — THE 3-D VIEW'S FRAME COST, MEASURED (browser): opens w3.html in a Chrome window of its own whose background
// throttling is off (as tools/gpu/year_cdp.mjs: a page in an occluded window renders ~1 frame a second and its GPU clocks down, so
// any timing taken there is meaningless), at the human's window (2294×825 CSS px at 150 %: their 21:9 screen), and for each query
// (an A/B: e.g. "" against "forest=cpu") and each camera spot reports the frames a second and the GPU's milliseconds a frame
// (WebGPU timestamp queries: renderer.resolveTimestampsAsync), medians over a few seconds.
//   node tools/w3_render_bench.mjs ["query1" "query2" …]      e.g.  node tools/w3_render_bench.mjs "" "forest=cpu" "depth=log"
// Needs the project's server on :8000 and Chrome with WebGPU. Close the other tabs showing the lakes first: they share the GPU.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const queries = process.argv.length > 2 ? process.argv.slice(2) : [''];
const port = +(process.env.PORT || 9341), chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = +(process.env.W || 2294), H = +(process.env.H || 900), SCALE = process.env.SCALE || '1.5', SECS = +(process.env.SECS || 5);
const profile = join(process.env.LOCALAPPDATA || '.', 'SynapseReef', 'renderbench'); mkdirSync(profile, { recursive: true });
const base = `http://localhost:${process.env.REEF_PORT || 8000}/w3.html`;   // (the bench adds res=full unless DYNRES=1: the frame held at full resolution)
// the spots: a named view, or a camera (target x, y, z in three's axes; yaw, pitch, dist) — the forest's floor, a shore at 45 m
const SPOTS = [
  { name: 'in the woods', set: [334.8 + 20 * Math.sin(0.67), 6, 575.6 - 20 * Math.cos(0.67), -0.67, 0.12, 12] },
  { name: 'a shore, 45 m', set: [334.8, 4, 575.6, -0.672, -0.08, 45] },
  { name: 'On the water', view: 'On the water' },
  { name: 'Upper lake', view: 'Upper lake' },
  { name: 'Both lakes', view: 'Both lakes' },
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const proc = spawn(chrome, [`--app=about:blank`, `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, `--force-device-scale-factor=${SCALE}`,
  '--no-first-run', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--enable-webgpu-developer-features'], { detached: true, stdio: 'ignore' });
proc.unref();
let target = null;
for (let t = 0; t < 60 && !target; t++) { await sleep(1000); try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = list.find(x => x.type === 'page'); } catch {} }
if (!target) { console.error('no page on the debugging port'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl); let nextId = 1; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
const send = (method, params = {}) => new Promise(res => { const id = nextId++; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expr, timeout = 120000) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };
// in the page: wait for the lakes; then per spot, place the camera, settle, and count frames and GPU time
const MEASURE = `(async (spot, secs) => {
  const h = hb3, r = h.renderer; r.backend.trackTimestamp = true;
  if (!spot.keep) { if (spot.view) h.go(spot.view); else { const s = spot.set; h.rig.set(new h.camera.position.constructor(s[0], s[1], s[2]), s[3], s[4], s[5]); } }
  await new Promise(q => setTimeout(q, spot.keep ? 1500 : 4000));
  // (the frames counted by their own requestAnimationFrame loop; the GPU's times read by another — awaiting a timestamp read
  // between frames halved the frames counted)
  const gpu = [], dts = []; let last = performance.now(), on = true; const t0 = last;
  let nf = 0, nf0 = 0; const tick = () => { const t = performance.now(); dts.push(t - last); last = t; nf++; if (on) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  // (a read gives the last whole frame's passes, summed; and each pass's own time — the shadow map, the mirror, the scene, the
  // after-effects — by its render context)
  const pass = {};
  while (performance.now() - t0 < secs * 1000) {
    await new Promise(q => setTimeout(q, 100));
    try {
      const g = await r.resolveTimestampsAsync('render'); if (g) gpu.push(g);
      const pool = r.backend.timestampQueryPool?.render, fr = pool?.frames?.at(-1);
      if (pool && fr !== undefined) for (const [k, ms] of pool.timestamps) if (k.endsWith(':f' + fr)) (pass[k.replace(/:f\d+$/, '')] ||= []).push(ms);
    } catch {}
  }
  on = false; dts.shift();
  const med = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN; };
  const p95 = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length * 0.95)] : NaN; };
  const passes = Object.entries(pass).map(([k, v]) => [k, +med(v).toFixed(2)]).filter(x => x[1] > 0.2).sort((x, y) => y[1] - x[1]).slice(0, 8);
  return { fps: +(1000 / med(dts)).toFixed(1), p95ms: +p95(dts).toFixed(1), gpu: +med(gpu).toFixed(2), n: dts.length, passes };
})`;
// (TOGGLES=1: at each spot, the cost of each part — the frame without it)
const TOGGLES = process.env.TOGGLES === '2' ? [['nothing', `[]`]] : process.env.TOGGLES ? [
  ['near trees', `[hb3.tiers.spire, hb3.tiers.pine, hb3.tiers.hard]`],
  ['mid trees', `[hb3.tiers.midConifer, hb3.tiers.midBroad]`],
  ['far trees', `[hb3.tiers.farConifer, hb3.tiers.farBroad].filter(Boolean)`],
  ['water', `[hb3.scene.getObjectByProperty('renderOrder', 2)]`],
  ['fish', `[hb3.fishView.mesh]`], ['wildlife', `[hb3.wildView.group, hb3.shallowsView.group]`], ['camps', `[hb3.campsView.group]`], ['plants', `[hb3.plantsView.group]`],
] : [];
const rows = [];
for (const q of queries) {
  const qq = [q, process.env.DYNRES ? 'res=auto' : ''].filter(Boolean).join('&');
  await send('Page.navigate', { url: base + (qq ? '?' + qq : '') });
  let ok = false; for (let t = 0; t < 120 && !ok; t++) { await sleep(1000); try { ok = await evaluate(`!!(window.hb3 && document.getElementById('busy').classList.contains('done') && !/starting/.test(document.body.textContent))`, 5000); } catch {} }
  if (!ok) { console.error(`${q || '(default)'}: the lakes never finished starting`); continue; }
  await sleep(5000);
  for (const spot of SPOTS.filter(x => !process.env.SPOTS || process.env.SPOTS.split(',').some(k => x.name.toLowerCase().includes(k)))) {
    let m; try { m = await evaluate(`${MEASURE}(${JSON.stringify(spot)}, ${SECS})`); } catch (e) { m = { err: String(e).slice(0, 200) }; }
    rows.push({ query: q || '(default)', spot: spot.name, ...m }); console.log(JSON.stringify(rows[rows.length - 1]));
    for (const [name, objs] of TOGGLES) {
      let t; try { t = await evaluate(`(async () => { const o = ${objs}; o.forEach(x => x.visible = false); const m = await ${MEASURE}({ set: null, view: null, keep: true }, ${SECS}); o.forEach(x => x.visible = true); return m; })()`); } catch (e) { t = { err: String(e).slice(0, 120) }; }
      console.log(JSON.stringify({ spot: spot.name, without: name, gpuSaved: +(m.gpu - t.gpu).toFixed(2), fps: t.fps }));
    }
    const NEAR = `[hb3.tiers.spire, hb3.tiers.pine, hb3.tiers.hard]`;
    if (TOGGLES.length) for (const [name, js] of [['no shadows/post', `hb3.S.post = false`, `hb3.S.post = true`],
      ['near trees cast no shadow', `${NEAR}.forEach(m => m.castShadow = false)`, `${NEAR}.forEach(m => m.castShadow = true)`],
      ['near trees out of the mirror', `${NEAR}.forEach(m => m.layers.set(3)); hb3.camera.layers.enable(3)`, `${NEAR}.forEach(m => m.layers.set(0))`],
      ['shadow map off', `hb3.renderer.shadowMap.enabled = false`, `hb3.renderer.shadowMap.enabled = true`],
      ['pixel ratio 1', `hb3.renderer.setPixelRatio(1)`, `hb3.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`]].map(x => [x[0], x])) {
      let t; try { t = await evaluate(`(async () => { ${js[1]}; const m = await ${MEASURE}({ keep: true }, ${SECS}); ${js[2]}; return m; })()`); } catch (e) { t = { err: String(e).slice(0, 120) }; }
      console.log(JSON.stringify({ spot: spot.name, with: name, gpuSaved: +(m.gpu - t.gpu).toFixed(2), fps: t.fps }));
    }
  }
}
console.table(rows);
try { await send('Browser.close'); } catch {}
try { process.kill(proc.pid); } catch {}
process.exit(0);
