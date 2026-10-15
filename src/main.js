// main.js — boot + fixed-timestep loop + camera input. Browser-only.
import { seed } from './core.js';
import { WORLD, CAMERA, LANDSCAPE } from './config.js';
import { World } from './world.js';
import { Camera, snapshotPrev } from './camera.js';
import { Renderer, makeGuardedLoop } from './render.js';
import { Inspector } from './inspector.js';
import { UI } from './ui.js';

seed((Date.now() ^ (Math.random() * 1e9)) >>> 0);

const world = new World();
let tank = document.getElementById('tank');   // `let`: the Renderer may swap in a fresh #tank (WebGL failure → Canvas2D)
const camera = new Camera(WORLD.W, WORLD.H, CAMERA);
const renderer = new Renderer(tank, world, camera);
tank = renderer.canvas;                          // (already swapped if WebGL died during construction)
const inspector = new Inspector(document.getElementById('brain'));
const ui = new UI(world, renderer, inspector, camera);

// open on the WHOLE LAKE (shores, weed beds, the deep basin, every fish) — the "big picture first, then zoom to one
// fish" the project is about; the stream and the pond lie to its right (pan or zoom out for the whole landscape)
camera.setZoomRel(WORLD.W / LANDSCAPE.LAKE_W); camera.tcx = LANDSCAPE.LAKE_W * 0.5; camera.tcy = WORLD.H * 0.5;

// ---- camera input: drag-pan (primary pointer), two-finger pinch-zoom, wheel-zoom, click-select ----
// Each pointer is tracked by id, so a second finger never makes the camera jump: one pointer pans, two pinch
// (Camera.pinch: exact pan+zoom about the finger midpoint), and lifting one finger re-bases on the remaining one.
const pointers = new Map();   // pointerId → { x, y } (client px)
let dragged = false, multi = false, lastX = 0, lastY = 0, downX = 0, downY = 0, pinchD = 0;
const screenScale = () => { const r = tank.getBoundingClientRect(); return { sx: tank.width / Math.max(1, r.width), sy: tank.height / Math.max(1, r.height), r }; };
const midpoint = () => { let x = 0, y = 0; for (const p of pointers.values()) { x += p.x; y += p.y; } return { x: x / pointers.size, y: y / pointers.size }; };
const spread = () => { const it = pointers.values(), a = it.next().value, b = it.next().value; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; };

function onPointerDown(e) {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { tank.setPointerCapture?.(e.pointerId); } catch (_) { /* pointer already gone */ }
  if (pointers.size === 1) { dragged = false; multi = false; lastX = downX = e.clientX; lastY = downY = e.clientY; }
  else { multi = true; dragged = true; pinchD = spread(); const m = midpoint(); lastX = m.x; lastY = m.y; }
}
function onPointerMove(e) {
  const p = pointers.get(e.pointerId); if (!p) return;
  p.x = e.clientX; p.y = e.clientY;
  const { sx, sy, r } = screenScale();
  if (pointers.size >= 2) {
    const m = midpoint(), d = spread();
    const factor = pinchD > 0 && d > 0 ? d / pinchD : 1;
    camera.pinch((lastX - r.left) * sx, (lastY - r.top) * sy, (m.x - r.left) * sx, (m.y - r.top) * sy, factor);
    pinchD = d; lastX = m.x; lastY = m.y;
    return;
  }
  if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4) dragged = true;
  if (dragged) camera.panByScreen((e.clientX - lastX) * sx, (e.clientY - lastY) * sy);
  lastX = e.clientX; lastY = e.clientY;
}
function onPointerUp(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);
  if (pointers.size > 0) {   // a finger lifted mid-gesture: re-base on what's left (no jump)
    if (pointers.size === 1) pinchD = 0; else pinchD = spread();
    const m = midpoint(); lastX = m.x; lastY = m.y;
    return;
  }
  if (e.type === 'pointerup' && !dragged && !multi) {
    const id = renderer.pickAt(e);
    world.selectedId = id;
    if (id != null) {
      camera.follow(id);                          // click a fish → follow it
      if (camera.zoomFraction() < 0.12) camera.setZoomRel(7); // zoomed way out → close in a bit
    }
  }
}
function onWheel(e) {
  e.preventDefault();
  const { sx, sy, r } = screenScale();
  const px = (e.clientX - r.left) * sx, py = (e.clientY - r.top) * sy;
  camera.zoomAtScreen(px, py, Math.exp(-e.deltaY * 0.0016));
}
// (re-)attach the canvas listeners — re-run when the Renderer swaps #tank for a fresh canvas
let inputAbort = null;
function wireCanvas(c) {
  if (inputAbort) inputAbort.abort();
  inputAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const sig = inputAbort ? { signal: inputAbort.signal } : {};
  c.addEventListener('pointerdown', onPointerDown, sig);
  c.addEventListener('pointermove', onPointerMove, sig);
  c.addEventListener('pointerup', onPointerUp, sig);
  c.addEventListener('pointercancel', onPointerUp, sig);
  c.addEventListener('wheel', onWheel, { passive: false, ...sig });
}
wireCanvas(tank);
renderer.onCanvasReplaced = c => { tank = c; pointers.clear(); wireCanvas(c); };

// keyboard shortcuts — never with Ctrl/Meta/Alt held (Ctrl+F / Ctrl+± / Ctrl+O are the browser's), and never while
// focus is in a form control (typing / Space on a focused button must not also drive the camera).
const FORM_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON']);
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = e.target;
  if (tg && (FORM_TAGS.has(tg.tagName) || tg.isContentEditable)) return;
  if (e.key === ' ') { ui.togglePause(); e.preventDefault(); }
  else if (e.key === 'Escape') {
    if (ui.screensaverOn() && !document.fullscreenElement) {   // leave the window screensaver for the full page
      ui.setWindowScreensaver(false);
      if (wantScreensaver()) history.replaceState(null, '', location.pathname + location.search);   // so a reload stays out
      return;
    }
    world.selectedId = null; camera.stopTour(); if (camera.mode === 'follow') camera.frameAll();
  }
  else if (e.key === 'f' || e.key === 'F') { if (world.selectedId != null) camera.follow(world.selectedId); }
  else if (e.key === 'o' || e.key === 'O') { camera.frameAll(); }
  else if (e.key === 't' || e.key === 'T') { camera.mode === 'tour' ? camera.stopTour() : camera.startTour(); }
  else if (e.key === '+' || e.key === '=') { camera.zoomAtScreen(tank.width / 2, tank.height / 2, 1.25); }
  else if (e.key === '-' || e.key === '_') { camera.zoomAtScreen(tank.width / 2, tank.height / 2, 0.8); }
});

addEventListener('resize', () => renderer.resize());

// "#screensaver" in the URL (the screensaver launcher opens it in a full-screen browser window): the lake fills the
// window and runs the relaxed tour with the chrome fading when idle. Esc returns to the full page.
function wantScreensaver() { return /(^#|&)screensaver(&|$)/i.test(location.hash); }
if (wantScreensaver()) ui.setWindowScreensaver(true);
addEventListener('hashchange', () => ui.setWindowScreensaver(wantScreensaver()));

// The sim steps at 30 Hz — the same step the headless tests run, so the browser lake behaves exactly like the tested one —
// and the renderer interpolates every frame between the last two states (alpha), so motion stays smooth at 60–144 fps.
const DT = 1 / 30, MAX_STEPS = 2;
let acc = 0, last = performance.now(), stepCount = 0, rateAcc = 0, fpsAcc = 0, frames = 0;

function frame(now) {
  renderer.resize();   // cheap: re-reads devicePixelRatio; only re-sizes the backing store when the box/DPR changed
  let real = (now - last) / 1000; last = now; if (real > 0.1) real = 0.1;
  let simMs = 0;
  if (!ui.paused) {
    // never catch up in a burst: after a slow frame (a GC pause, a busy tab) the lake slows for a moment instead of every fish
    // jumping forward together; at a higher sim speed (ui.speed) more steps per frame are allowed
    acc = Math.min(acc + real * ui.speed, DT * MAX_STEPS * Math.max(1, ui.speed));
    let steps = 0; const t0 = performance.now();
    // snapshot the pre-step pose (render-only _px/_py/_ph) so the renderer can interpolate between the last two states
    while (acc >= DT && steps < 300) { snapshotPrev(world.agents); world.step(DT); acc -= DT; steps++; stepCount++; }
    simMs = performance.now() - t0;
  }
  const alpha = Math.min(1, Math.max(0, acc / DT));   // render-interpolation fraction between the last two sim states
  camera.update(real, world, alpha);
  renderer.draw(now / 1000, alpha);
  renderer.stats.simMs = simMs;
  ui.frame(real);

  rateAcc += real; fpsAcc += real; frames++;
  if (fpsAcc >= 0.5) { renderer.stats.fps = frames / fpsAcc; frames = 0; fpsAcc = 0; }
  if (rateAcc >= 0.5) { ui.setRate(stepCount / rateAcc); stepCount = 0; rateAcc = 0; }
}

// Frame-loop guard (audit Tier 2 #8): the next frame is re-armed BEFORE the body runs, so one exception can never
// freeze the app. On a throw: log (throttled), pause the sim, and tell the user once via the UI toast.
let errCount = 0, lastErrLog = -Infinity;
function onFrameError(e) {
  errCount++;
  const t = performance.now();
  if (errCount === 1 || t - lastErrLog > 5000) { console.error(`Synapse Reef: frame error #${errCount} — simulation paused`, e); lastErrLog = t; }
  if (!ui.paused) {
    try { ui.togglePause(); } catch (_) { /* UI itself broken */ }
    ui.paused = true;
    try { if (typeof ui.toast === 'function') ui.toast('Something went wrong — simulation paused (details in the console)'); } catch (_) { /* no toast */ }
  }
}
// FRAME PACING. On a high-refresh display (120/144/165/240 Hz) a frame that also runs a sim step (~7–12 ms) can't fit in
// one refresh, so the picture alternated between 1- and 2-refresh frames: visible judder even at a high average fps.
// Render on every k-th refresh instead, k = round(16.7 ms / refresh), for a STEADY ~60–72 fps. On a 60 Hz display k = 1
// (every refresh). The refresh interval is the shortest rAF gap seen over the last ~120 callbacks (gaps are whole
// refreshes, so the minimum is one refresh), re-measured continually so moving the window to another monitor adapts.
let vsync = 1000 / 60, vsMin = Infinity, vsN = 0, lastTick = 0, lastDraw = -Infinity;
function paced(now) {
  const d = now - lastTick; lastTick = now;
  if (d > 2 && d < 50) { if (d < vsMin) vsMin = d; if (++vsN >= 120) { vsync = vsMin; vsMin = Infinity; vsN = 0; } }
  const k = Math.max(1, Math.round(16.7 / vsync));
  if (k > 1 && now - lastDraw < (k - 0.5) * vsync) return;   // not this refresh
  lastDraw = now;
  frame(now);
}
requestAnimationFrame(makeGuardedLoop(cb => requestAnimationFrame(cb), paced, onFrameError));

window.reef = { world, renderer, inspector, ui, camera };
