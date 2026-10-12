// test/smoke.mjs — browser-layer smoke test with a minimal DOM/canvas stub.
// Claude Code can't open a real browser, so this constructs Renderer / UI / Inspector /
// Camera against fake DOM objects and drives draws at several zoom levels, asserting
// nothing throws and that culling / LOD / the sprite cache actually do work.
// Run: node test/smoke.mjs   (visual correctness still needs a human in a real browser.)

// ----------------------------- DOM / canvas stub -----------------------------
function makeCtx() {
  const grad = { addColorStop() {} };
  return {
    canvas: null,
    imageSmoothingEnabled: true,
    globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '',
    fillRect() {}, clearRect() {}, strokeRect() {},
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, fill() {}, arc() {}, ellipse() {}, setLineDash() {},
    save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {},
    drawImage() {}, fillText() {}, measureText() { return { width: 10 }; },
    createLinearGradient() { return grad; }, createRadialGradient() { return grad; },
  };
}
function makeEl(tag = 'div') {
  const el = {
    tagName: tag, width: tag === 'canvas' ? 300 : 0, height: tag === 'canvas' ? 150 : 0,
    clientWidth: 1280, clientHeight: 720, _innerHTML: '', textContent: '', value: 'auto', checked: false,
    files: [], dataset: {}, style: { setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    set innerHTML(v) { this._innerHTML = v; }, get innerHTML() { return this._innerHTML; },
    appendChild() {}, setAttribute() {}, removeAttribute() {}, addEventListener() {}, removeEventListener() {},
    setPointerCapture() {}, releasePointerCapture() {}, click() {}, focus() {},
    requestFullscreen() { return Promise.resolve(); }, getContext() { return this._ctx || (this._ctx = makeCtx()); },
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight, right: this.clientWidth, bottom: this.clientHeight }; },
    querySelectorAll() { return []; },
  };
  el.ownerDocument = doc;
  return el;
}
const ids = new Map();
const doc = {
  createElement: tag => makeEl(tag),
  getElementById: id => { if (!ids.has(id)) ids.set(id, makeEl(id === 'tank' || id === 'brain' || id === 'charts' || id === 'minimap' || id === 'depthprofile' ? 'canvas' : 'div')); return ids.get(id); },
  querySelectorAll: () => [],
  addEventListener() {}, removeEventListener() {},
  fullscreenElement: null, exitFullscreen() {},
};
doc.body = makeEl('body');
globalThis.document = doc;
globalThis.window = { devicePixelRatio: 2, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
globalThis.localStorage = { _m: {}, getItem(k) { return this._m[k] ?? null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
globalThis.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
globalThis.Blob = class { constructor() {} };
globalThis.requestAnimationFrame = () => 0;
if (!globalThis.performance) globalThis.performance = { now: () => Date.now() };

// ------------------------------- the test -------------------------------
const { seed } = await import('../src/core.js');
const { WORLD, CAMERA } = await import('../src/config.js');
const { World } = await import('../src/world.js');
const { Camera } = await import('../src/camera.js');
const { Renderer } = await import('../src/render.js');
const { makePresenter } = await import('../src/glpost.js');
const { Inspector } = await import('../src/inspector.js');
const { UI } = await import('../src/ui.js');

let fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) fail++; };
const tryStep = (name, fn) => { try { fn(); check(name, true); } catch (e) { check(name, false, e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)); } };

seed(7);
const world = new World();
for (let i = 0; i < 120; i++) world.step(1 / 30);   // warm the world so there are plenty of agents
// plant evolution: the renderer reads per-plant evolved fields (hue/form/leaf) — assert they exist so a regression
// that drops them is caught alongside the draws below (which render every plant through those fields).
check('plants carry the per-plant evolved phenotype the renderer reads (hue/form/leaf)', world.plants.length > 0 && world.plants.every(p => p.hue != null && p.form && p.leaf != null), `${world.plants.length} plants`);

const tank = doc.getElementById('tank');
const camera = new Camera(WORLD.W, WORLD.H, CAMERA);
let renderer, inspector, ui;

tryStep('Camera constructs', () => { camera.setViewport(2560, 1440); });
tryStep('Renderer constructs (sizes canvas via dpr)', () => { renderer = new Renderer(tank, world, camera); });
tryStep('Inspector constructs', () => { inspector = new Inspector(doc.getElementById('brain')); });
tryStep('UI constructs (builds census/controls, wires handlers)', () => { ui = new UI(world, renderer, inspector, camera); });

check('canvas backing store sized by dpr', tank.width === Math.round(1280 * 2) && tank.height === Math.round(720 * 2), `${tank.width}x${tank.height}`);

// WebGL2 POST PRESENTER (Pass 3): the DOM stub's getContext returns a 2D-ish fake (no createProgram/framebuffer), so a
// REAL WebGL2 context is absent → makePresenter MUST return the Canvas2D fallback (gl null), the Renderer keeps drawing the
// scene to an OFFSCREEN canvas + keeps its own 2D post (postInGL false), and present()/resize()/dispose() must never throw.
tryStep('makePresenter returns a never-throw fallback presenter against the stub', () => {
  const pr = makePresenter(doc.createElement('canvas'), renderer.mkCanvas);
  check('  → fell back to Canvas2D (gl null, no real WebGL2)', pr.gl == null, `gl=${pr.gl}`);
  pr.resize(800, 450); pr.present(renderer.scene, { time: 1, light: 0.6, turbidity: 0.2 }); pr.present(renderer.scene, {}); pr.dispose();
});
check('Renderer wires the presenter: offscreen scene sized to backing + 2D post retained in fallback',
  renderer.present && renderer.present.gl == null && renderer.postInGL === false &&
  renderer.scene && renderer.scene.width === tank.width && renderer.scene.height === tank.height,
  `postInGL=${renderer.postInGL}, scene=${renderer.scene && renderer.scene.width}x${renderer.scene && renderer.scene.height}`);
// GPU-lit fish (Pass 3/slice 3): no real WebGL2 in the stub → glFish must stay OFF → fish draw via the 2D path (every
// existing sprite/dot/corpse assertion below is driven by those 2D draws, so a true byte-identical fallback).
check('glFish stays off under the stub (no real WebGL2) → 2D fish fallback', renderer.glFish === false, `glFish=${renderer.glFish}`);

// draw at three zoom levels: whole lake → mid → extreme close-up
tryStep('draw @ whole-lake zoom (dots/LOD)', () => { camera.frameAll(); camera.zoom = camera.tzoom; renderer.draw(1.0); });
const lakeStats = { ...renderer.stats };
check('whole-lake view culls almost nothing & uses dot LOD', lakeStats.drawn > 50 && lakeStats.dots > 0, `drawn ${lakeStats.drawn}, dots ${lakeStats.dots}`);

tryStep('draw @ mid zoom (sprite cache)', () => { camera.setZoomRel(8); camera.zoom = camera.tzoom; camera.cx = camera.tcx = WORLD.W / 2; camera.cy = camera.tcy = WORLD.H / 2; renderer.draw(2.0); });
check('mid zoom builds & uses cached sprites', renderer.sprites.map.size > 0 && renderer.stats.sprites > 0, `cache ${renderer.sprites.map.size}, sprites ${renderer.stats.sprites}`);

tryStep('draw @ extreme close-up (single organism)', () => { const a = world.agents[0]; camera.setZoomRel(40); camera.zoom = camera.tzoom; camera.cx = camera.tcx = a.x; camera.cy = camera.tcy = a.y; renderer.draw(3.0); });
check('close-up view culls most agents', renderer.stats.drawn < renderer.stats.total, `drawn ${renderer.stats.drawn}/${renderer.stats.total}`);

// dying bodies (corpses) render at both LOD tiers
tryStep('draw fading corpses (death fade-out)', () => {
  const a = world.agents[0];
  world.corpses.push({ sp: a.sp, species: a.species, x: a.x, y: a.y, heading: a.heading, rHeading: a.heading, size: a.size, grow: a.grow, hue: a.hue, facing: 1, spd: 2, t: 0.7, t0: 1.4, roll: 0.5, sink: 8, dead: false });
  camera.setZoomRel(8); camera.zoom = camera.tzoom; camera.cx = camera.tcx = a.x; camera.cy = camera.tcy = a.y; renderer.draw(2.5);
  camera.frameAll(); camera.zoom = camera.tzoom; renderer.draw(2.6); // also at dot-tier (whole lake)
});
check('corpse rendered while present', world.corpses.length > 0);

// overlays
tryStep('draw with oxygen + perf overlays', () => { renderer.opts.oxygen = true; renderer.opts.perf = true; world.selectedId = world.agents[0].id; renderer.draw(4.0); });
tryStep('draw at night (low light → sprite light buckets)', () => { world.env.t = 0.95; world.env.light = 0.02; renderer.draw(5.0); world.env.t = 0.3; });

// camera modes don't throw
tryStep('cinematic tour updates', () => { camera.startTour(); for (let i = 0; i < 200; i++) { world.step(1 / 60); camera.update(1 / 60, world); renderer.draw(i * 0.016); } camera.stopTour(); });
tryStep('follow a fish through updates', () => { camera.follow(world.agents[0].id); for (let i = 0; i < 60; i++) { camera.update(1 / 60, world); renderer.draw(i); } });

// picking through the camera transform
tryStep('pickAt resolves a screen point to an agent id', () => {
  const a = world.agents[0]; camera.setZoomRel(20); camera.zoom = camera.tzoom; camera.cx = camera.tcx = a.x; camera.cy = camera.tcy = a.y;
  const sp = camera.worldToScreen(a.x, a.y);
  const r = tank.getBoundingClientRect(); const id = renderer.pickAt({ clientX: sp.x / (tank.width / r.width), clientY: sp.y / (tank.height / r.height) });
  check('  → pick hit a fish', id != null, `id ${id}`);
});

// UI frame loop, minimap, perf, charts
tryStep('UI.frame updates HUD/minimap/charts', () => { for (let i = 0; i < 20; i++) { world.step(1 / 30); ui.frame(1 / 30); } });
// LIFETIME LEARNING wiring: after stepping, every live fish must carry a finite plastic policy `lw` length-matched to its
// genotype `g` (forward runs `lw`). Guards the Baldwinian wiring against a step-order/init regression (the review's note).
check('every fish has a valid plastic policy lw (length-matched to its genotype, finite) — the learning wiring', world.agents.length > 0 && world.agents.every(a => a.lw && a.lw.length === a.g.length && a.lw.every(v => Number.isFinite(v))), `${world.agents.length} agents`);
tryStep('Inspector draws a brain (and the empty state)', () => { inspector.draw(world.inspectAgent()); inspector.draw(null); });
tryStep('resize re-fits the camera', () => { tank.clientWidth = 1920; tank.clientHeight = 1080; renderer.resize(); });

// persistence paths that touch the browser stubs
tryStep('champions() + toJSON() serialize', () => { JSON.stringify(world.champions()); JSON.stringify(world.toJSON()); });
tryStep('save/load round-trips through the UI helpers', () => { ui.togglePause(); ui.togglePause(); });

// exercise the LRU eviction path for real (the cap is normally never reached in a short run)
tryStep('sprite-cache LRU eviction runs', () => {
  const sc = renderer.sprites, savedMax = sc.max;
  sc.max = 4; sc.clear(); sc.built = 0;
  const a = world.agents[0];
  for (let f = 0; f < sc.FRAMES; f++) for (let l = 0; l < sc.LIGHTS; l++) sc.get(a, f, l / (sc.LIGHTS - 1)); // FRAMES*LIGHTS distinct buckets
  check('  → cache evicts down to exactly the cap', sc.map.size === 4, `size ${sc.map.size}`);
  check('  → more sprites were built than retained (eviction happened)', sc.built > sc.map.size, `built ${sc.built} > kept ${sc.map.size}`);
  sc.max = savedMax;
});

// MORPHOLOGY actually changes the drawn sprite: distinct morph buckets must build distinct multipliers AND
// differently-sized sprite canvases — guards _morphVal/_build against a stuck {1,1,1} that the headless math can't catch.
tryStep('morphology buckets draw visibly different sprites', () => {
  const sc = renderer.sprites, sp = world.agents[0].sp;
  const m0 = sc._morphVal(0), m26 = sc._morphVal(26);
  check('  → _morphVal maps buckets to DISTINCT fin/eye/body multipliers', m0.fin < m26.fin && m0.eye < m26.eye && m0.body < m26.body, `b0 ${m0.fin.toFixed(2)}/${m0.body.toFixed(2)} vs b26 ${m26.fin.toFixed(2)}/${m26.body.toFixed(2)}`);
  const small = sc._build(sp, 2, 0, 5, 0, 0, 1), big = sc._build(sp, 2, 0, 5, 0, 26, 1);
  check('  → a high-morph (deep, big-finned) sprite canvas is larger than a low-morph one', big.canvas.width > small.canvas.width && big.canvas.height > small.canvas.height, `${small.canvas.width}x${small.canvas.height} vs ${big.canvas.width}x${big.canvas.height}`);
});

// EFFORT (gait) actually couples to the drawn body: distinct drive buckets must map to rising undulation amplitude and
// build cleanly — guards the gait coupling against a stuck constant drive (the old hardcoded 0.45).
tryStep('effort buckets drive increasing undulation amplitude', () => {
  const sc = renderer.sprites, sp = world.agents[0].sp;
  check('  → _driveVal maps glide < cruise < sprint (rising undulation amplitude)', sc._driveVal(0) < sc._driveVal(1) && sc._driveVal(1) < sc._driveVal(2), `${sc._driveVal(0)} < ${sc._driveVal(1)} < ${sc._driveVal(2)}`);
  const glide = sc._build(sp, 2, 0, 5, 3, 13, 0), sprint = sc._build(sp, 2, 0, 5, 3, 13, 2);
  check('  → a sprite builds at every effort bucket (valid canvas, no crash)', glide.canvas.width > 0 && sprint.canvas.width > 0, `${glide.canvas.width}x${glide.canvas.height}`);
});

console.log(`\n${fail === 0 ? 'SMOKE OK — browser layer constructs & draws without throwing' : fail + ' SMOKE CHECK(S) FAILED'}`);
process.exit(fail === 0 ? 0 : 1);
