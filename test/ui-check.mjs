// test/ui-check.mjs — UI-layer hardening checks (audit fixes: XSS escaping, CSP, caps, import, weather sync, pause,
// inspector, downloads, DPR) against a small recording DOM stub. Browser-free; complements test/smoke.mjs.
// Run: node test/ui-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----------------------------- recording DOM / canvas stub -----------------------------
function makeCtx() {
  const grad = { addColorStop() {} }, c = { texts: [], strokes: [] };
  Object.assign(c, {
    globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: '', textBaseline: '',
    fillRect() {}, clearRect() {}, strokeRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, arc() {}, ellipse() {}, setLineDash() {},
    stroke() { c.strokes.push(c.strokeStyle); }, fillText(t) { c.texts.push(String(t)); },
    save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {}, drawImage() {}, measureText() { return { width: 10 }; },
    createLinearGradient() { return grad; }, createRadialGradient() { return grad; },
  });
  return c;
}
function makeEl(tag = 'div') {
  const el = {
    tagName: tag, width: tag === 'canvas' ? 300 : 0, height: tag === 'canvas' ? 150 : 0, children: [], attrs: {},
    clientWidth: 1280, clientHeight: 720, _innerHTML: '', textContent: '', value: 'auto', checked: false, files: [], dataset: {},
    style: { setProperty(k, v) { this[k] = v; } },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    set innerHTML(v) { this._innerHTML = v; this.children = []; }, get innerHTML() { return this._innerHTML; },
    appendChild(c) { this.children.push(c); return c; }, setAttribute(k, v) { this.attrs[k] = String(v); }, removeAttribute() {},
    addEventListener() {}, removeEventListener() {}, setPointerCapture() {}, releasePointerCapture() {}, click() {}, focus() {}, remove() {},
    requestFullscreen() { return Promise.resolve(); }, getContext() { return this._ctx || (this._ctx = makeCtx()); },
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight, right: this.clientWidth, bottom: this.clientHeight }; },
    querySelectorAll() { return []; },
  };
  return el;
}
const ids = new Map(), CANVAS = new Set(['tank', 'brain', 'charts', 'minimap', 'depthprofile']);
const doc = {
  createElement: tag => makeEl(tag),
  getElementById: id => { if (!ids.has(id)) ids.set(id, makeEl(CANVAS.has(id) ? 'canvas' : 'div')); return ids.get(id); },
  querySelectorAll: () => [], addEventListener() {}, removeEventListener() {}, fullscreenElement: null, exitFullscreen() {}, activeElement: null,
};
doc.body = makeEl('body');
globalThis.document = doc;
globalThis.window = { devicePixelRatio: 2, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
const revoked = [];
globalThis.URL = { createObjectURL: () => 'blob:x', revokeObjectURL(u) { revoked.push(u); } };
globalThis.Blob = class { constructor() {} };
globalThis.confirm = () => true;
let readerUsed = 0;
globalThis.FileReader = class { readAsText() { readerUsed++; } };
const $ = id => doc.getElementById(id);

// ------------------------------- the test -------------------------------
const { seed } = await import('../src/core.js');
const { WORLD, CAMERA, PLANKTON, scaleCount } = await import('../src/config.js');
const { World } = await import('../src/world.js');
const { Camera } = await import('../src/camera.js');
const { SPECIES } = await import('../src/species.js');
const { Inspector } = await import('../src/inspector.js');
const { UI, escapeHTML, sanitizeChampions, DL_REVOKE_MS, MAX_IMPORT_BYTES } = await import('../src/ui.js');

let fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) fail++; };
const toast = () => $('toast').textContent;

seed(11);
let world = new World();
for (let i = 0; i < 60; i++) world.step(1 / 30);
const camera = new Camera(WORLD.W, WORLD.H, CAMERA); camera.setViewport(1280, 720);
const renderer = { opts: {}, stats: { fps: 60, drawn: 0, total: 0, sprites: 0, dots: 0, simMs: 0 }, sprites: { map: new Map() }, canvas: { width: 1280, height: 720 }, resize() {}, drawMinimap() {} };
const inspector = new Inspector($('brain'));
const ui = new UI(world, renderer, inspector, camera);
// one full ~8 Hz refresh: it's spread over consecutive frames (one slice each), so run frames until the cycle ends
const tick = () => { ui._acc = 1; ui.frame(1 / 30); for (let i = 0; i < 20 && ui._uiSlot != null; i++) ui.frame(0); };

// 1. XSS: escaping + the selection readout built from a malicious, file-derived gen/eaten
const evil = '<img src=x onerror=alert(1)>';
check('escapeHTML neutralises markup and quotes', escapeHTML(evil) === '&lt;img src=x onerror=alert(1)&gt;' && escapeHTML(`"'&`) === '&quot;&#39;&amp;');
{
  const a = world.agents[0]; a.gen = evil; a.eaten = '<b onmouseover=alert(2)>pwn</b>'; world.selectedId = a.id; tick();
  const html = $('sel').innerHTML;
  check('selection readout: a malicious gen/eaten never reaches innerHTML as markup', html.length > 0 && !/<img|onerror|onmouseover|<b onm/i.test(html) && html.includes('gen —') && html.includes('ate</span> —'), html.slice(0, 90));
  check('selection readout: species colour goes through the CSSOM (no inline style attribute)', !/style=/.test(html) && $('sel').style['--sp'] === a.sp.tag);
  a.gen = 7; a.eaten = 3; tick();
  check('selection readout: numeric gen/eaten still render', $('sel').innerHTML.includes('gen 7') && $('sel').innerHTML.includes('ate</span> 3'));
}
check('no data-derived innerHTML uses inline style attributes (census/legend/evo built via DOM)', !/style=/.test($('census').innerHTML + $('evo').innerHTML + $('legend').innerHTML + $('ps-species').innerHTML));
check('the species legend is built by ui.js (moved out of the inline script): every species + the visiting loon', $('legend').children.length === SPECIES.length + 1, `${$('legend').children.length} items`);
const champsClean = sanitizeChampions({ minnow: { gen: evil, hue: 'x', w: ['1', 'bad', 2] }, trout: { gen: 1 }, __proto__: { pike: 1 } });   // trout: not a species here
check('sanitizeChampions keeps known species + plain finite numbers only', Object.keys(champsClean).join() === 'minnow' && champsClean.minnow.gen === 0 && champsClean.minnow.hue === 0 && champsClean.minnow.w.join() === '1,0,2');

// 2. inspector: footer shows the 5 outputs and the active/total hidden units; masked units draw dimmed
{
  const a = world.agents.find(x => x.species === 'bass') || world.agents[0], ctx = $('brain').getContext('2d'), HID = a.sp.shape.hid;
  a.activeHid = HID; ctx.texts.length = 0; ctx.strokes.length = 0; inspector.draw(a);
  const foot = ctx.texts.find(t => t.startsWith('gen ')) || '';
  check('inspector footer reports OUT = 5 outputs (was a hard-coded 2)', foot.includes(`${a.sp.shape.in}→${HID}→5`), foot);
  const fullDim = ctx.strokes.filter(s => s === 'rgba(140,165,175,0.07)').length;
  a.activeHid = 3; ctx.texts.length = 0; ctx.strokes.length = 0; inspector.draw(a);
  const foot2 = ctx.texts.find(t => t.startsWith('gen ')) || '', dim = ctx.strokes.filter(s => s === 'rgba(140,165,175,0.07)').length;
  check('inspector footer shows active/total hidden units for a smaller evolved brain', foot2.includes(`→3/${HID}→5`), foot2);
  check('masked hidden units’ synapses are drawn dimmed (none when the brain is full)', fullDim === 0 && dim > 0, `${dim} dim strokes`);
  a.gen = evil; ctx.texts.length = 0; inspector.draw(a); a.gen = 1; a.activeHid = HID;
  check('inspector coerces a non-numeric gen for display', (ctx.texts.find(t => t.startsWith('gen ')) || '').startsWith('gen —'));
}

// 3. weather dropdown follows the environment (forced vs auto) — incl. after Reset
{
  world.env.setWeather(3); ui.syncWeatherUI();
  const forced = $('sel-weather').value;
  $('btn-reset').onclick(); world = ui.world;
  check('weather dropdown shows the forced weather, then "Auto" after Reset', forced === '3' && $('sel-weather').value === 'auto', `${forced} → ${$('sel-weather').value}`);
  world.env.setWeather(1); tick();
  check('weather dropdown re-syncs from frame() when the env changes', $('sel-weather').value === '1');
  world.env.forced = false; tick();
}

// 4. caps: +species / Load brains / Scatter food respect GLOBAL_MAX and the plankton cap
{
  const cap = WORLD.GLOBAL_MAX;
  localStorage.setItem('synapse-reef.champions', JSON.stringify(world.champions()));
  for (let i = 0; i < 10; i++) $('btn-load').onclick();
  check('10× Load brains never exceeds GLOBAL_MAX', world.agents.length <= cap, `${world.agents.length} / ${cap}`);
  while (world.agents.length < cap) world.addAgent('minnow');
  const n0 = world.agents.length;
  const added = ui.addSpecies('pike');
  check('+species is refused at GLOBAL_MAX with a toast', !added && world.agents.length === n0 && /full/.test(toast()), toast());
  $('btn-load').onclick();
  check('Load brains is refused at GLOBAL_MAX with a toast', world.agents.length === n0 && /full/.test(toast()), toast());
  world.agents.length = Math.floor(cap / 2);
  const pcap = scaleCount(PLANKTON.CAP);
  while (world.plankton.length < pcap - 5) world.plankton.push(world._mkPlankton());
  const k1 = ui.scatterFood(); const k2 = ui.scatterFood();
  check('Scatter food tops up to the plankton cap, then refuses', k1 === 5 && k2 === 0 && world.plankton.length === pcap && /plenty/.test(toast()), `${k1}, ${k2}, ${world.plankton.length}/${pcap}`);
}

// 5. import: size limit, atomic UI update on failure, brain-reseed reporting
{
  readerUsed = 0;
  $('file-import').onchange({ target: { files: [{ name: 'huge.json', size: MAX_IMPORT_BYTES + 1 }], value: 'x' } });
  check('an oversized import is refused before it is read', readerUsed === 0 && /too large/.test(toast()), toast());
  $('file-import').onchange({ target: { files: [{ name: 'ok.json', size: 1000 }], value: 'x' } });
  check('a normal-sized import is read', readerUsed === 1);

  const fresh = new World(); for (let i = 0; i < 30; i++) fresh.step(1 / 30);
  const good = JSON.stringify(fresh.toJSON());
  const a = world.agents[0]; world.selectedId = a.id; camera.follow(a.id); world.env.setWeather(2); ui.syncWeatherUI();
  const cerr = console.error; console.error = () => {};   // the expected failure is logged by importText
  // structurally unusable (agents must be an array) — the validated World.load rejects it outright; an unknown species
  // alone is no longer a failure (it is skipped and counted), so it can't be used to provoke one
  const ok = ui.importText('{"agents":{"s":"perch"}}', 'bad.json'); console.error = cerr;
  check('a failed import keeps the camera, the selection and the weather control as they were', !ok && camera.mode === 'follow' && camera.followId === a.id && world.selectedId === a.id && $('sel-weather').value === '2' && /could not be loaded/.test(toast()), toast());
  ui.world = world = new World();   // (the pre-hardening World.load can half-apply before throwing — start clean)

  const o = JSON.parse(good); o.agents[0].w = [1, 2, 3]; o.stats.brainsReseeded = 99;
  const ok2 = ui.importText(JSON.stringify(o), 'old.json');
  check('a successful import reframes the camera, clears the selection and re-syncs weather', ok2 && camera.mode === 'free' && world.selectedId == null && $('sel-weather').value === (world.env.forced ? String(world.env.weather) : 'auto'));
  check('the import toast reports how many brains were reseeded (and not a stale count from the file)', /1 brain didn't fit/.test(toast()) && !/99/.test(toast()), toast());
  const o2 = JSON.parse(good); o2.stats.brainsReseeded = 42; ui.importText(JSON.stringify(o2), 'clean.json');
  check('a clean import mentions no reseeding', /^imported clean\.json/.test(toast()) && !/reseeded/.test(toast()), toast());

  const orig = world.seedFromChampions;
  world.seedFromChampions = function (c) { orig.call(this, c); return { added: 3, reseeded: 2 }; };
  ui.importText(JSON.stringify(world.champions()), 'champs.json');
  check('champion seeding reports the reseed count from seedFromChampions()’s return value', /2 brains didn't fit/.test(toast()), toast());
  world.seedFromChampions = orig;
  ui.importText('{"hello":1}', 'junk.json');
  check('a file that is neither a lake nor champions is refused clearly', /no lake state or champion brains/.test(toast()), toast());
}

// 6. leaving fullscreen restores the paused state (setSpeedVal used to force-unpause)
{
  ui.setSpeedVal(2); ui._setPaused(true);
  doc.fullscreenElement = $('viewport'); ui._onFullscreenChange();
  const inFs = !ui.paused && ui.speed === ui.relaxSpeed;
  doc.fullscreenElement = null; ui._onFullscreenChange();
  check('fullscreen runs the relaxed screensaver, and leaving it restores pause + speed', inFs && ui.paused && ui.speed === 2, `paused ${ui.paused}, speed ${ui.speed}`);
  ui.setSpeedVal(1);
}

// 6b. the window screensaver (#screensaver, from the launcher) behaves like fullscreen, and overlapping it with element
// fullscreen doesn't double-enter (which would record the relaxed pace as the "prior" speed) or exit early
{
  ui.setSpeedVal(2);
  ui.setWindowScreensaver(true);
  const on1 = ui.screensaverOn() && ui.speed === ui.relaxSpeed && ui.camera.mode === 'tour';
  doc.fullscreenElement = $('viewport'); ui._onFullscreenChange();
  doc.fullscreenElement = null; ui._onFullscreenChange();
  const still = ui.screensaverOn() && ui.speed === ui.relaxSpeed && ui.camera.mode === 'tour';
  ui.setWindowScreensaver(false);
  check('the window screensaver relaxes + tours, survives an element-fullscreen round trip, and restores the speed', on1 && still && !ui.screensaverOn() && ui.speed === 2 && ui.camera.mode !== 'tour', `on ${on1} still ${still} speed ${ui.speed} mode ${ui.camera.mode}`);
  ui.setSpeedVal(1);
}

// 7. °F/°C readout on the water overlay: toggles, and the click doesn't propagate (no fish select/deselect)
{
  const a = world.agents[0]; world.selectedId = a.id; const f0 = ui.tempF; let stopped = 0;
  $('ps-temp').onclick({ stopPropagation() { stopped++; } });
  $('ps-temp').onpointerdown({ stopPropagation() { stopped++; } });
  check('#ps-temp click toggles °F/°C without propagating or touching the selection', ui.tempF === !f0 && stopped === 2 && world.selectedId === a.id);
  tick(); check('the overlay readout shows the new unit', /°C$/.test($('ps-temp').textContent) === f0, $('ps-temp').textContent);
}

// 8. downloads revoke their blob URL later, not synchronously
{
  const realST = globalThis.setTimeout, timers = []; revoked.length = 0;
  globalThis.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return 0; };
  try { $('btn-export').onclick(); } finally { globalThis.setTimeout = realST; }
  const t = timers.find(x => x.ms === DL_REVOKE_MS);
  check('export defers URL.revokeObjectURL (~60 s) instead of revoking synchronously', revoked.length === 0 && !!t);
  if (t) t.fn(); check('  → the deferred revoke does run', revoked.length === 1);
}

// 9. charts / inspector re-read devicePixelRatio (moving between monitors)
{
  window.devicePixelRatio = 1; tick(); inspector.draw(world.agents[0]);
  const w1 = $('charts').width, i1 = $('brain').width;
  window.devicePixelRatio = 2; tick(); inspector.draw(world.agents[0]);
  check('chart + inspector backing stores follow a devicePixelRatio change', w1 === 1280 && $('charts').width === 2560 && i1 === 1280 && $('brain').width === 2560, `${w1}→${$('charts').width}, ${i1}→${$('brain').width}`);
  window.devicePixelRatio = 1.25; tick(); const w3 = $('charts').width; tick();
  check('a fractional dpr sizes once (rounded) instead of re-sizing every frame', w3 === 1600 && $('charts').width === 1600);
}

// 10. index.html: CSP meta, no inline script, no inline style attributes
{
  const html = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
  const csp = (/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html) || [])[1] || '';
  check('index.html carries a CSP meta with script-src \'self\', object-src \'none\', base-uri \'none\'', /script-src 'self'(;|$)/.test(csp) && csp.includes("object-src 'none'") && csp.includes("base-uri 'none'") && !csp.includes('unsafe-'), csp.slice(0, 60));
  const { CSP } = await import('../serve.mjs');
  const pyCsp = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'serve.py'), 'utf8').replace(/"\s*\n\s*"/g, '');
  check('the CSP is identical in index.html, serve.mjs and serve.py', csp === CSP && pyCsp.includes(CSP));
  check('index.html has no inline <script> and no style= attributes (both would be blocked by the CSP)', !/<script(?![^>]*\bsrc=)[^>]*>/i.test(html) && !/\sstyle=/i.test(html));
}

console.log(`\n${fail === 0 ? 'UI CHECKS OK' : fail + ' UI CHECK(S) FAILED'}`);
process.exit(fail === 0 ? 0 : 1);
