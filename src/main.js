// main.js — boot + fixed-timestep loop + camera input. Browser-only.
import { seed } from './core.js';
import { WORLD, CAMERA } from './config.js';
import { World } from './world.js';
import { Camera } from './camera.js';
import { Renderer } from './render.js';
import { Inspector } from './inspector.js';
import { UI } from './ui.js';

seed((Date.now() ^ (Math.random() * 1e9)) >>> 0);

const world = new World();
const tank = document.getElementById('tank');
const camera = new Camera(WORLD.W, WORLD.H, CAMERA);
const renderer = new Renderer(tank, world, camera);
const inspector = new Inspector(document.getElementById('brain'));
const ui = new UI(world, renderer, inspector, camera);

// start framed a little way in, gently zoomed for a nice first impression
camera.setZoomRel(2.4); camera.tcx = WORLD.W * 0.5; camera.tcy = WORLD.H * 0.5;

// ---- camera input: drag-pan, wheel-zoom, click-select ----
let down = false, dragged = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
const screenScale = () => { const r = tank.getBoundingClientRect(); return { sx: tank.width / Math.max(1, r.width), sy: tank.height / Math.max(1, r.height), r }; };

tank.addEventListener('pointerdown', e => {
  down = true; dragged = false; lastX = e.clientX; lastY = e.clientY; downX = e.clientX; downY = e.clientY;
  tank.setPointerCapture?.(e.pointerId);
});
tank.addEventListener('pointermove', e => {
  if (!down) return;
  const { sx, sy } = screenScale();
  const dx = (e.clientX - lastX), dy = (e.clientY - lastY);
  if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4) dragged = true;
  if (dragged) { camera.panByScreen(dx * sx, dy * sy); }
  lastX = e.clientX; lastY = e.clientY;
});
tank.addEventListener('pointerup', e => {
  down = false;
  if (!dragged) {
    const id = renderer.pickAt(e);
    world.selectedId = id;
    if (id != null) {
      camera.follow(id);                          // click a fish → follow it
      if (camera.zoomFraction() < 0.12) camera.setZoomRel(7); // zoomed way out → close in a bit
    }
  }
});
tank.addEventListener('pointercancel', () => { down = false; });

tank.addEventListener('wheel', e => {
  e.preventDefault();
  const { sx, sy, r } = screenScale();
  const px = (e.clientX - r.left) * sx, py = (e.clientY - r.top) * sy;
  const factor = Math.exp(-e.deltaY * 0.0016);
  camera.zoomAtScreen(px, py, factor);
}, { passive: false });

addEventListener('keydown', e => {
  if (e.key === ' ') { ui.togglePause(); e.preventDefault(); }
  else if (e.key === 'Escape') { world.selectedId = null; camera.stopTour(); if (camera.mode === 'follow') camera.frameAll(); }
  else if (e.key === 'f' || e.key === 'F') { if (world.selectedId != null) camera.follow(world.selectedId); }
  else if (e.key === 'o' || e.key === 'O') { camera.frameAll(); }
  else if (e.key === 't' || e.key === 'T') { camera.mode === 'tour' ? camera.stopTour() : camera.startTour(); }
  else if (e.key === '+' || e.key === '=') { camera.zoomAtScreen(tank.width / 2, tank.height / 2, 1.25); }
  else if (e.key === '-' || e.key === '_') { camera.zoomAtScreen(tank.width / 2, tank.height / 2, 0.8); }
});

addEventListener('resize', () => renderer.resize());

const DT = 1 / 60;
let acc = 0, last = performance.now(), stepCount = 0, rateAcc = 0, fpsAcc = 0, frames = 0;

function loop(now) {
  renderer.resize();   // cheap: only re-sizes the backing store when the canvas box changed
  let real = (now - last) / 1000; last = now; if (real > 0.1) real = 0.1;
  let simMs = 0;
  if (!ui.paused) {
    acc += real * ui.speed;
    let steps = 0; const t0 = performance.now();
    while (acc >= DT && steps < 300) { world.step(DT); acc -= DT; steps++; stepCount++; }
    simMs = performance.now() - t0;
  }
  camera.update(real, world);
  renderer.draw(now / 1000);
  renderer.stats.simMs = simMs;
  ui.frame(real);

  rateAcc += real; fpsAcc += real; frames++;
  if (fpsAcc >= 0.5) { renderer.stats.fps = frames / fpsAcc; frames = 0; fpsAcc = 0; }
  if (rateAcc >= 0.5) { ui.setRate(stepCount / rateAcc); stepCount = 0; rateAcc = 0; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.reef = { world, renderer, inspector, ui, camera };
