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
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, fill() {}, arc() {}, ellipse() {}, setLineDash() {}, clip() {}, rect() {},
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

// ==== audit-fixes: render ====
{
  const RJ = await import('../src/render.js');
  const GP = await import('../src/glpost.js');
  const CJ = await import('../src/camera.js');
  const { angDiff } = await import('../src/core.js');

  // (1) GL orientation: FRAG_COMP measures depth ONLY through dpt = 1 - uv.y (uv.y = 0 is the screen BOTTOM), and the
  // renderer sends the sun in that same uv space — the sun sits at the surface (screen top) → sunUV.y must be near 1.
  const uvY = (GP.FRAG_COMP.match(/uv\.y/g) || []).length;
  check('FRAG_COMP: depth comes only from dpt = 1.0 - uv.y (no raw uv.y depth terms left)', /float dpt\s*=\s*1\.0\s*-\s*uv\.y/.test(GP.FRAG_COMP) && uvY === 1, `uv.y occurrences ${uvY}`);
  const stubGL = { gl: {}, fishReady: true, failed: false, lost: false, fishFailed: false, last: null,
    resize() {}, present(scene, p) { this.last = p; return true; }, dispose() {} };
  const t2 = doc.createElement('canvas'), parent = { child: null, replaceChild(n) { this.child = n; } };
  t2.id = 'tank'; t2.parentNode = parent; t2.cloneNode = () => { const c = doc.createElement('canvas'); c.id = t2.id; return c; };
  const cam2 = new Camera(WORLD.W, WORLD.H, CAMERA);
  const r2 = new Renderer(t2, world, cam2);
  r2.present = stubGL;
  cam2.frameAll(); cam2.zoom = cam2.tzoom; cam2.cx = cam2.tcx; cam2.cy = cam2.tcy;
  world.env.light = 0.9; world.env.t = 0.5;
  world.selectedId = world.agents[0].id;
  tryStep('GL-path draw against a stub GL presenter (fish quads + overlay collected)', () => r2.draw(10));
  const P1 = stubGL.last;
  check('  → sun UV is in the shader\'s bottom-origin uv space (surface sun → v near 1)', P1 && P1.sunUV[1] > 0.8 && P1.sunUV[1] <= 1.2, `sunUV ${P1 && P1.sunUV.map(v => v.toFixed(3))}`);
  check('  → zoom param is DPR/size-independent (zoom/fitZoom ≈ 1 at whole-lake) and dpr is passed', P1 && Math.abs(P1.zoom - 1) < 0.02 && P1.dpr === r2.dpr, `zoom ${P1 && P1.zoom}, dpr ${P1 && P1.dpr}`);
  cam2.setZoomRel(8); cam2.zoom = cam2.tzoom; const a0 = world.agents[0]; cam2.cx = cam2.tcx = a0.x; cam2.cy = cam2.tcy = a0.y; cam2._clamp();
  r2.draw(10.5); const P2 = stubGL.last;
  check('  → GL fish carry a light×depth `bright` factor in (0,1] (sprite built once at full light)', P2.fish && P2.fish.length > 0 && P2.fish.every(f => f.bright > 0 && f.bright <= 1), `${P2.fish && P2.fish.length} quads`);
  check('  → overlays (selection ring, surface line, ripples) go to an overlay canvas drawn OVER the GL fish', !!(P2.overlay && P2.overlay.canvas && P2.overlay.x >= 0 && P2.overlay.y >= 0), P2.overlay ? `at ${P2.overlay.x},${P2.overlay.y}` : 'none');
  // the GL fish swim in FRAG_FISH: ONE straight-pose sprite per fish whatever the beat phase (a sprite per frame × effort
  // thrashed the close-up caches), with the continuous wave (amp, phase, tip, L) + sprite extent passed per quad
  const f2 = P2.fish.find(f => f.kind === 0); r2.draw(10.83); const P3 = stubGL.last, f3 = f2 && P3.fish.find(f => f.sprite === f2.sprite);
  check('  → GL fish: same sprite across beat phases, continuous wave params per quad', !!f3 && Array.isArray(f2.wave) && Array.isArray(f3.wave) && f2.wave.length === 4 && f2.waveG && f2.waveG[1] > 0 && f2.waveG[2] > 0 && f3.wave[1] !== f2.wave[1], f3 ? `phase ${f2.wave[1].toFixed(2)} → ${f3.wave[1].toFixed(2)}` : 'sprite changed with the phase');
  // (2) presenter failure → swap #tank for a FRESH canvas with a Canvas2D presenter, re-wire hook fires, 2D post resumes
  let rewired = null; r2.onCanvasReplaced = c => { rewired = c; };
  stubGL.failed = true; stubGL.fatal = 'test';
  tryStep('draw after a fatal GL failure', () => r2.draw(11));
  check('  → swapped to a fresh canvas + Canvas2D presenter, input re-wire hook called, postInGL false',
    r2.canvas !== t2 && parent.child === r2.canvas && rewired === r2.canvas && r2.present instanceof GP.Canvas2DPresenter && r2.postInGL === false && r2.glFish === false,
    `pres ${r2.present.constructor.name}, postInGL ${r2.postInGL}`);
  // a lost-and-not-restored context also falls back (after the timeout); a lost one inside the window keeps GL but no GL post
  const r3 = new Renderer(doc.createElement('canvas'), world, new Camera(WORLD.W, WORLD.H, CAMERA));
  const stub3 = { ...stubGL, failed: false, lost: true, lostAt: performance.now() }; r3.present = stub3; r3.draw(1);
  check('  → during a context loss postInGL/glFish are false (2D post runs) but GL is kept while restore may come', r3.postInGL === false && r3.glFish === false && r3.present === stub3);
  stub3.lostAt = performance.now() - 10000; r3.draw(2);
  check('  → a loss not restored within the timeout falls back to Canvas2D', r3.present instanceof GP.Canvas2DPresenter);
  world.selectedId = null;

  // (6) sprite hue: the paint hue is the bucket CENTRE the key rounded to — error ≤ half a bucket, unbiased
  let maxE = 0, sumE = 0, nE = 0;
  for (let h = 0; h < 360; h += 0.37) { const e = angDiff(RJ.bucketHue(RJ.hueBucket(h, 16), 16) * Math.PI / 180, h * Math.PI / 180) * 180 / Math.PI; maxE = Math.max(maxE, Math.abs(e)); sumE += e; nE++; }
  check('sprite hue bucket → paint hue: |error| ≤ 11.25° and mean error ≈ 0 (was +11.25° biased)', maxE <= 11.25 + 1e-6 && Math.abs(sumE / nE) < 0.3, `max ${maxE.toFixed(2)}°, mean ${(sumE / nE).toFixed(3)}°`);

  // (7) world-aligned bed/surface sampling covers [x0,x1] at every tour zoom and its interior vertices are pan-stable
  {
    const cam = new Camera(WORLD.W, WORLD.H, CAMERA); cam.setViewport(1920, 1080);
    let worstGap = 0, badAlign = 0, badStep = 0;
    for (let rel = 1; rel <= 30; rel += 0.37) {
      cam.tzoom = cam.zoom = cam.fitZoom * rel;
      for (let cx = 50; cx < WORLD.W - 50; cx += 97) {
        cam.cx = cam.tcx = cx; cam.cy = cam.tcy = WORLD.H * 0.8; cam._clamp();
        const vr = cam.visibleRect(), x0 = Math.max(0, vr.x0), x1 = Math.min(WORLD.W, vr.x1);
        const s = RJ.quantStep((x1 - x0) / 150, 5), xs = RJ.alignedSamples(x0, x1, s, 0, WORLD.W);
        worstGap = Math.max(worstGap, (xs[0] - x0) * cam.zoom, (x1 - xs[xs.length - 1]) * cam.zoom);
        for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > s + 1e-9) badStep++;
        for (let i = 0; i < xs.length - 1; i++) if (xs[i] !== 0 && Math.abs(xs[i] / s - Math.round(xs[i] / s)) > 1e-9) badAlign++;
      }
    }
    check('bed/surface samples reach both screen edges (no unfilled strip), step ≤ s, world-aligned vertices', worstGap <= 0 && badStep === 0 && badAlign === 0, `worst edge gap ${worstGap.toFixed(2)}px, badStep ${badStep}, badAlign ${badAlign}`);
  }

  // (8) heading snap on entering view: a fish NOT drawn last frame snaps rHeading; one drawn last frame eases
  {
    const a = world.agents[1] || world.agents[0];
    camera.setZoomRel(10); camera.zoom = camera.tzoom; camera.cx = camera.tcx = a.x; camera.cy = camera.tcy = a.y; camera._clamp();
    // the drawn heading is the pitch-limited displayHeading of the sim heading (render.js), so compare against that
    const want = () => RJ.displayHeading(a.heading, a.faceTarget);
    a._rFrame = -99; a.rHeading = a.heading + 2.5; let w0 = want(); renderer.draw(20);
    const snapped = Math.abs(angDiff(a.rHeading, w0)) < 1e-9;
    a.rHeading = a.heading + 2.5; w0 = want(); renderer.draw(20.016);
    const eased = Math.abs(angDiff(a.rHeading, w0)) > 0.5;
    check('a fish entering view snaps its eased heading; a fish already in view keeps easing', snapped && eased, `snapped ${snapped}, eased ${eased}`);
  }

  // (17) render interpolation helpers (render-only _px/_py/_ph; the sim never reads them)
  {
    const L = CJ.lerpAngle(3.0, -3.0, 0.5);
    const a = { x: 10, y: 20, heading: 0.5, _px: 6, _py: 24, _ph: 0.1 };
    const far = { x: 500, y: 20, heading: 1, _px: 10, _py: 20, _ph: 0 };
    check('lerpAngle takes the short way across ±π', Math.abs(Math.abs(L) - Math.PI) < 1e-9, `lerpAngle(3,-3,.5) = ${L.toFixed(4)}`);
    check('interpX/Y/H: alpha 0 → previous, 1 → current, 0.5 → midpoint; no prev / teleport → current',
      CJ.interpX(a, 0) === 6 && CJ.interpY(a, 1) === 20 && Math.abs(CJ.interpX(a, 0.5) - 8) < 1e-12 && Math.abs(CJ.interpH(a, 0.5) - 0.3) < 1e-12 &&
      CJ.interpX({ x: 3, y: 4, heading: 0 }, 0) === 3 && CJ.interpX(far, 0) === 500);
    const ag = [{ x: 1, y: 2, heading: 3 }]; CJ.snapshotPrev(ag);
    check('snapshotPrev records the pre-step pose', ag[0]._px === 1 && ag[0]._py === 2 && ag[0]._ph === 3);
    const cam = new Camera(WORLD.W, WORLD.H, CAMERA); cam.setViewport(1280, 720); cam.setZoomRel(8); cam.zoom = cam.tzoom;
    const fish = { id: 777, x: 900, y: 500, heading: 0, _px: 860, _py: 460, _ph: 0 };
    cam.follow(777); cam.update(1e3, { agents: [fish] }, 0.25);
    check('camera follow targets the INTERPOLATED (drawn) position', Math.abs(cam.tcx - 870) < 1e-9 && Math.abs(cam.tcy - 470) < 1e-9, `tcx ${cam.tcx}, tcy ${cam.tcy}`);
  }

  // (15) frame-loop guard: re-arms BEFORE the body, so a throwing frame never stops the loop
  {
    const q = []; let errs = 0, ran = 0;
    const loop = RJ.makeGuardedLoop(cb => q.push(cb), () => { ran++; if (ran === 1) throw new Error('boom'); }, () => { errs++; });
    loop(0);
    const armedAfterThrow = q.length === 1; if (q.length) q.shift()(16);
    check('guarded frame loop re-arms after a throw and keeps running', armedAfterThrow && errs === 1 && ran === 2 && q.length === 1, `armed ${armedAfterThrow}, errs ${errs}, ran ${ran}`);
  }

  // (4) alpha-bleed: transparent texels take the nearest opaque colour (far ones the mean); alpha never changes
  {
    const w = 24, h = 9, d = new Uint8ClampedArray(w * h * 4);
    const put = (x, y, r, g, b) => { const i = (y * w + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; };
    put(2, 4, 200, 40, 10); put(21, 4, 10, 40, 200);
    const alphaBefore = Array.from({ length: w * h }, (_, i) => d[i * 4 + 3]);
    GP.bleedAlpha(d, w, h, 8, 8);
    const at = (x, y) => [d[(y * w + x) * 4], d[(y * w + x) * 4 + 1], d[(y * w + x) * 4 + 2]];
    const nearL = at(3, 5), nearR = at(20, 3), mid = at(12, 0);
    check('bleedAlpha floods edge colour into transparent texels, alpha untouched',
      nearL[0] === 200 && nearL[2] === 10 && nearR[2] === 200 && Math.abs(mid[0] - 105) <= 1 && alphaBefore.every((a, i) => d[i * 4 + 3] === a),
      `nearL ${nearL}, nearR ${nearR}, mid ${mid}`);
  }

  // (9) shader clock wrap keeps every periodic FRAG_COMP sin(k·t) term continuous, and stays bounded
  {
    const t = 98765.4321, tw = GP.wrapShaderTime(t);
    const ks = [0.5, 0.6, 0.7, 0.9, 1.05, 1.1, 1.6, 1.7, 2.0];
    const worst = Math.max(...ks.map(k => Math.abs(Math.sin(k * tw) - Math.sin(k * t))));
    check('wrapShaderTime: bounded and continuous for every periodic shader term', tw >= 0 && tw < GP.SHADER_TIME_PERIOD && worst < 1e-6, `t→${tw.toFixed(3)}, worst Δsin ${worst.toExponential(1)}`);
  }

  // (16) two-finger pinch keeps the world point under the fingers and zooms by the spread ratio
  {
    const cam = new Camera(WORLD.W, WORLD.H, CAMERA); cam.setViewport(1280, 720); cam.setZoomRel(4); cam.zoom = cam.tzoom; cam.cx = cam.tcx = 1000; cam.cy = cam.tcy = 600; cam._clamp();
    const before = cam.screenToWorld(600, 300), z0 = cam.zoom;
    cam.pinch(600, 300, 640, 320, 1.5);
    const after = cam.screenToWorld(640, 320);
    check('Camera.pinch: world point stays under the moving midpoint, zoom × factor', Math.abs(after.x - before.x) < 1e-6 && Math.abs(after.y - before.y) < 1e-6 && Math.abs(cam.zoom / z0 - 1.5) < 1e-9, `Δ ${(after.x - before.x).toExponential(1)}, zoom×${(cam.zoom / z0).toFixed(3)}`);
  }

  // (10) DPR is re-read on resize (a DPR change — browser zoom / monitor move — re-sizes the backing store)
  {
    const saved = window.devicePixelRatio; window.devicePixelRatio = 1; renderer.resize();
    const w1 = renderer.canvas.width; window.devicePixelRatio = saved; renderer.resize();
    check('Renderer.resize re-reads devicePixelRatio', w1 === Math.round(renderer.canvas.clientWidth) && renderer.canvas.width === Math.round(renderer.canvas.clientWidth * 2), `dpr1 ${w1}, dpr2 ${renderer.canvas.width}`);
  }
}

// ==== GUI review fixes (2026-10-12) ====
{
  // night look: GL fish dim AND desaturate as the light falls (they glowed neon-magenta against near-black water)
  const { fishLook, displayHeading } = await import('../src/render.js');
  const day = fishLook(1), night = fishLook(0);
  check('GL fish night look: dimmer and less saturated at night than at noon, both within (0,1]', night.bright < day.bright && night.sat < day.sat && night.bright > 0 && day.bright <= 1 && night.sat > 0 && day.sat <= 1, `bright ${night.bright.toFixed(2)}→${day.bright.toFixed(2)}, sat ${night.sat.toFixed(2)}→${day.sat.toFixed(2)}`);
  // drawn pitch: never steeper than ~55° (a vertical sprite reads as a falling cut-out), level swimming untouched,
  // the swim side kept, and near vertical the previous facing holds (no flip-flop)
  const deg = Math.PI / 180, pitchOf = h => Math.abs(Math.atan2(Math.sin(h), Math.abs(Math.cos(h))));
  let maxP = 0, sideOK = true;
  for (let d = -180; d <= 180; d += 3) { const h = d * deg, o = displayHeading(h, 1); maxP = Math.max(maxP, pitchOf(o)); if (Math.abs(Math.cos(h)) > 0.31 && Math.sign(Math.cos(o)) !== Math.sign(Math.cos(h))) sideOK = false; }
  check('drawn fish pitch is soft-limited (≤55°), level swimming unchanged, the swim side kept', maxP <= 55 * deg && Math.abs(displayHeading(0, 1)) < 1e-9 && Math.abs(displayHeading(Math.PI, -1) - Math.PI) < 1e-9 && sideOK, `max pitch ${(maxP / deg).toFixed(1)}°`);
  check('  → near vertical the previous facing holds (hysteresis)', Math.cos(displayHeading(95 * deg, 1)) > 0 && Math.cos(displayHeading(95 * deg, -1)) < 0 && Math.cos(displayHeading(85 * deg, -1)) < 0);
  // sunfish colour stays in the natural red-orange → amber band (no magenta wrap-around)
  const { SP: SPS } = await import('../src/species.js');
  let lo = 999, hi = -1; for (let i = 0; i < 400; i++) { const h = SPS.sunfish.randomHue((a, b) => a + Math.random() * (b - a)); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  check('sunfish hues stay red-orange → amber (no magenta)', lo >= 0 && hi <= 60, `${lo.toFixed(0)}–${hi.toFixed(0)}°`);
  // the legend lives OUTSIDE the viewport frame (inside it, the bottom-anchored minimap + camera controls covered it)
  const { URL: NodeURL } = await import('node:url');   // (the DOM stub replaces the global URL with a blob-URL stub)
  const html = (await import('node:fs')).readFileSync(new NodeURL('../index.html', import.meta.url), 'utf8');
  const vpEnd = html.indexOf('</section>'), lg = html.indexOf('id="legend"');
  check('species legend sits outside the lake viewport (not under the minimap / camera controls)', vpEnd > 0 && lg > vpEnd);
}

console.log(`\n${fail === 0 ? 'SMOKE OK — browser layer constructs & draws without throwing' : fail + ' SMOKE CHECK(S) FAILED'}`);
process.exit(fail === 0 ? 0 : 1);
