// w3_cpu_profile.mjs — WHERE THE 3-D VIEW'S MAIN THREAD SPENDS A FRAME (browser): opens w3.html in an unthrottled Chrome window (as
// w3_render_bench.mjs), places the camera, records the page's CPU profile for a few seconds through the DevTools protocol and prints
// the functions taking the most time (self time, and by file).
//   node tools/w3_cpu_profile.mjs ["query"] [spot: woods | shore | water | both]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const query = process.argv[2] || '', spotName = process.argv[3] || 'woods';
const SPOT = { woods: [334.8 + 20 * Math.sin(0.67), 6, 575.6 - 20 * Math.cos(0.67), -0.67, 0.12, 12], shore: [334.8, 4, 575.6, -0.672, -0.08, 45], water: 'On the water', both: 'Both lakes' }[spotName];
const port = +(process.env.PORT || 9342), chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', SECS = +(process.env.SECS || 4);
const profile = join(process.env.LOCALAPPDATA || '.', 'SynapseReef', 'cpuprofile'); mkdirSync(profile, { recursive: true });
const proc = spawn(chrome, ['--app=about:blank', `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--window-size=2294,900', '--force-device-scale-factor=1.5',
  '--no-first-run', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-gpu-vsync', '--disable-frame-rate-limit'], { detached: true, stdio: 'ignore' });
proc.unref();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target = null;
for (let t = 0; t < 60 && !target; t++) { await sleep(1000); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl); let nextId = 1; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
const send = (method, params = {}) => new Promise(res => { const id = nextId++; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expr, timeout = 60000) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout })).result?.result?.value;
// (the display's own rate: an empty page's frames a second)
console.log('display:', await evaluate('new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); })'), 'frames a second on an empty page');
await send('Page.navigate', { url: `http://localhost:${process.env.REEF_PORT || 8000}/w3.html${query ? '?' + query : ''}` });
let ok = false; for (let t = 0; t < 120 && !ok; t++) { await sleep(1000); try { ok = await evaluate(`!!(window.hb3 && document.getElementById('busy').classList.contains('done') && !/starting/.test(document.body.textContent))`, 5000); } catch {} }
await sleep(4000);
await evaluate(typeof SPOT === 'string' ? `hb3.go(${JSON.stringify(SPOT)})` : `hb3.rig.set(new hb3.camera.position.constructor(${SPOT.slice(0, 3)}), ${SPOT[3]}, ${SPOT[4]}, ${SPOT[5]})`);
await sleep(5000);
await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start');
const f0 = await evaluate('(() => { let n = 0; const t = () => { n++; window.__nf = n; requestAnimationFrame(t); }; requestAnimationFrame(t); return 0; })()');
await sleep(SECS * 1000);
const nf = await evaluate('window.__nf'); void f0;
const { result } = await send('Profiler.stop'); const prof = result.profile;
const self = new Map(), byFile = new Map(), dtUs = prof.timeDeltas.reduce((a, b) => a + b, 0), counts = new Map();
for (const s of prof.samples) counts.set(s, (counts.get(s) || 0) + 1);
const per = dtUs / prof.samples.length / 1000;   // ms a sample
for (const n of prof.nodes) {
  const c = counts.get(n.id) || 0; if (!c) continue;
  const fn = n.callFrame.functionName || '(anon)', url = (n.callFrame.url || '').replace(/^.*\//, ''), key = `${fn} ${url}:${n.callFrame.lineNumber + 1}`;
  self.set(key, (self.get(key) || 0) + c * per); byFile.set(url || fn, (byFile.get(url || fn) || 0) + c * per);
}
const frames = nf || 1, top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 28), files = [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 14);
console.log(`frames ${frames} in ${SECS} s (${(frames / SECS).toFixed(1)} fps); ms a frame by function (self):`);
for (const [k, ms] of top) console.log(`${(ms / frames).toFixed(2).padStart(7)}  ${k}`);
console.log('\nms a frame by file:');
for (const [k, ms] of files) console.log(`${(ms / frames).toFixed(2).padStart(7)}  ${k}`);
try { await send('Browser.close'); } catch {}
try { process.kill(proc.pid); } catch {}
process.exit(0);
