// year_cdp.mjs — THE GPU YEAR RUNNER UNATTENDED (docs/GPU_SIM.md G3): opens tools/gpu/year.html in a Chrome window of its own whose
// background throttling is off (a page in a hidden pane or an occluded window pauses — runs stalled for minutes), and through the
// DevTools protocol copies the page's lines (window.YEAR) to a file as they come; exits when the page's title says 'done'.
//   node tools/gpu/year_cdp.mjs "<year.html query>" <out file> [port] [page]
//   e.g. node tools/gpu/year_cdp.mjs "world=true&seeds=611&yf=0.22&days=365&every=14" year611.txt
// [page]: another of tools/gpu's pages (e.g. g2_run — the CPU⇄GPU parity runs): its #out text is written when its title says 'done'
// Needs the project's server (npm run serve) on :8000 and Chrome with WebGPU. The window is small; close it to stop the run.
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const query = process.argv[2] || 'world=true&seeds=611&days=365&every=14', outFile = process.argv[3] || 'year_cdp.txt', port = +(process.argv[4] || 9335), page = process.argv[5] || 'year';
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = join(process.env.LOCALAPPDATA || '.', 'SynapseReef', port === 9335 ? 'gpuyear' : 'gpuyear' + port); mkdirSync(profile, { recursive: true });   // (a profile a port: runs side by side)
const url = `http://localhost:8000/tools/gpu/${page}.html?${query}`;
const proc = spawn(chrome, [`--app=${url}`, `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--window-size=720,520', '--no-first-run',
  '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'], { detached: true, stdio: 'ignore' });
proc.unref();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target = null;
for (let t = 0; t < 60 && !target; t++) { await sleep(1000); try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = list.find(x => x.type === 'page' && x.url.includes(`/tools/gpu/${page}.html`)); } catch {} }
if (!target) { console.error('no page found on the debugging port'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl); let nextId = 1; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
const send = (method, params = {}) => new Promise(res => { const id = nextId++; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expr => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); return r.result?.result?.value; };
writeFileSync(outFile, `# ${url}\n`);
const seen = {};
for (;;) {
  await sleep(15000);
  let v; try { v = await evaluate(page === 'year' ? `JSON.stringify({ t: document.title, y: window.YEAR || {} })` : `JSON.stringify({ t: document.title, y: document.title === 'done' ? { out: (document.getElementById('out')?.textContent || '').split(String.fromCharCode(10)) } : {} })`); } catch { break; }
  if (!v) continue;
  const { t, y } = JSON.parse(v);
  for (const [sd, lines] of Object.entries(y)) { const from = seen[sd] || 0; if (lines.length > from) { const add = lines.slice(from).join('\n') + '\n'; appendFileSync(outFile, add); process.stdout.write(add); seen[sd] = lines.length; } }
  if (t === 'done') { appendFileSync(outFile, '# done\n'); break; }
}
try { await send('Page.close'); } catch {}
try { process.kill(proc.pid); } catch {}
process.exit(0);
