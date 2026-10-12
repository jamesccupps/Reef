// camera.js — world-space camera: pan, zoom, follow, cinematic auto-tour.
// PURE & DOM-free: it only does math on numbers (viewport size is passed in as px),
// so it is unit-tested headlessly alongside the sim. The renderer draws through it.
import { clamp, lerp, TAU } from './core.js';
import { CAMERA, bedY } from './config.js';

// render-time randomness (tour subject picks) must NOT touch the sim's seeded RNG,
// or it would desync determinism. Use Math.random here, never core.rand.
const rrand = (a, b) => a + Math.random() * (b - a);

// ---- render interpolation (audit: fixed 1/60 s step + no interpolation → ~30 Hz fish at ½× or on 120/144 Hz screens) ----
// main.js snapshots each agent's pre-step pose into RENDER-ONLY transient fields (_px/_py/_ph) right before every
// world.step; the renderer and the camera then draw at lerp(prev, cur, alpha) with alpha = accumulator/DT. The sim never
// reads these fields and they are not serialized (World.toJSON lists its fields explicitly), so determinism is untouched.
const TELEPORT2 = 80 * 80;   // a jump this large in one step is a respawn/relocation → don't smear it across frames
export function lerpAngle(a, b, t) {
  let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU;
  return a + d * t;
}
export function snapshotPrev(agents) { for (let i = 0; i < agents.length; i++) { const a = agents[i]; a._px = a.x; a._py = a.y; a._ph = a.heading; } }
const _hasPrev = a => a._px !== undefined && (a.x - a._px) * (a.x - a._px) + (a.y - a._py) * (a.y - a._py) < TELEPORT2;
export function interpX(a, alpha) { return _hasPrev(a) ? a._px + (a.x - a._px) * alpha : a.x; }
export function interpY(a, alpha) { return _hasPrev(a) ? a._py + (a.y - a._py) * alpha : a.y; }
export function interpH(a, alpha) { return _hasPrev(a) && a._ph !== undefined ? lerpAngle(a._ph, a.heading, alpha) : a.heading; }

export class Camera {
  constructor(worldW, worldH, cfg = CAMERA) {
    this.W = worldW; this.H = worldH; this.cfg = cfg;
    this.vw = 1; this.vh = 1;                  // viewport in device px
    this.zoom = 1; this.tzoom = 1;             // current & target zoom (px per world unit)
    this.cx = worldW / 2; this.cy = worldH / 2;
    this.tcx = this.cx; this.tcy = this.cy;    // target centre
    this.mode = 'free';                        // 'free' | 'follow' | 'tour'
    this.followId = null;
    this._tourTimer = 0; this._tourId = null;
    this.setViewport(this.vw, this.vh);
    this.fitNow();
  }

  setViewport(vw, vh) {
    this.vw = Math.max(1, vw); this.vh = Math.max(1, vh);
    this.fitZoom = Math.min(this.vw / this.W, this.vh / this.H) * this.cfg.FIT_PAD;
    this.minZoom = this.fitZoom * this.cfg.MIN_ZOOM_REL;
    this.maxZoom = this.fitZoom * this.cfg.MAX_ZOOM_REL;
    this.zoom = clamp(this.zoom, this.minZoom, this.maxZoom);
    this.tzoom = clamp(this.tzoom, this.minZoom, this.maxZoom);
    this._clamp();
  }

  // ---- transforms (device px) ----
  worldToScreen(wx, wy) {
    return { x: (wx - this.cx) * this.zoom + this.vw / 2, y: (wy - this.cy) * this.zoom + this.vh / 2 };
  }
  screenToWorld(sx, sy) {
    return { x: (sx - this.vw / 2) / this.zoom + this.cx, y: (sy - this.vh / 2) / this.zoom + this.cy };
  }
  // visible world rectangle (may extend past the world edges when zoomed out)
  visibleRect() {
    const hw = this.vw / (2 * this.zoom), hh = this.vh / (2 * this.zoom);
    return { x0: this.cx - hw, y0: this.cy - hh, x1: this.cx + hw, y1: this.cy + hh, hw, hh };
  }

  // ---- imperative controls ----
  fitNow() { this.tzoom = this.zoom = this.fitZoom; this.tcx = this.cx = this.W / 2; this.tcy = this.cy = this.H / 2; this.mode = 'free'; this.followId = null; this._clampNow(); }
  frameAll() { this.tzoom = this.fitZoom; this.tcx = this.W / 2; this.tcy = this.H / 2; this.mode = 'free'; this.followId = null; }

  // drag-pan by a screen delta (1:1, snappy). Leaves follow/tour mode.
  panByScreen(dx, dy) {
    this.mode = 'free'; this.followId = null;
    this.cx -= dx / this.zoom; this.cy -= dy / this.zoom;
    this.tcx = this.cx; this.tcy = this.cy; this._clampNow();
  }
  // zoom toward a screen point by a multiplicative factor, keeping that world point fixed
  zoomAtScreen(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.tzoom = clamp(this.tzoom * factor, this.minZoom, this.maxZoom);
    // snap zoom enough to recompute the anchor, then ease in update()
    const z = this.tzoom;
    // keep world point `before` under the cursor at the *target* zoom
    this.tcx = before.x - (sx - this.vw / 2) / z;
    this.tcy = before.y - (sy - this.vh / 2) / z;
    if (this.mode !== 'follow') this.mode = 'free';
    this._clamp();
  }
  setZoomRel(rel) { this.tzoom = clamp(this.fitZoom * rel, this.minZoom, this.maxZoom); }
  // two-finger pinch (immediate, no easing): zoom by `factor` and keep the world point that was under the previous
  // finger midpoint (psx,psy) under the new midpoint (sx,sy) — pan + zoom in one exact step. Leaves follow/tour mode.
  pinch(psx, psy, sx, sy, factor) {
    const before = this.screenToWorld(psx, psy);
    this.zoom = this.tzoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    this.cx = before.x - (sx - this.vw / 2) / this.zoom; this.cy = before.y - (sy - this.vh / 2) / this.zoom;
    this.tcx = this.cx; this.tcy = this.cy; this.mode = 'free'; this.followId = null; this._clampNow();
  }

  follow(id) { if (id == null) return; this.mode = 'follow'; this.followId = id; }
  isFollowing(id) { return this.mode === 'follow' && this.followId === id; }

  startTour() { this.mode = 'tour'; this._tourTimer = 0; this._tourId = null; this._shot = null; }
  stopTour() { if (this.mode === 'tour') { this.mode = 'free'; this._tourId = null; this._shot = null; } }

  // ---- per-frame update ----
  // alpha: render-interpolation fraction (main.js passes accumulator/DT) so the follow target tracks the DRAWN fish.
  update(dt, world, alpha = 1) {
    if (this.mode === 'tour') this._tour(dt, world);

    if (this.mode === 'follow' || (this.mode === 'tour' && this._tourId != null)) {
      const id = this.mode === 'follow' ? this.followId : this._tourId;
      const a = this._find(world, id);
      if (a) { this.tcx = interpX(a, alpha); this.tcy = interpY(a, alpha); }
      else if (this.mode === 'follow') { this.mode = 'free'; this.followId = null; }
      else { this._tourTimer = 0; } // tour subject gone → repick next tick
    }

    const touring = this.mode === 'tour', c = this.cfg;
    const ez = 1 - Math.exp(-dt * (touring ? (c.TOUR_ZOOM_LERP ?? c.ZOOM_LERP) : c.ZOOM_LERP));
    const ec = 1 - Math.exp(-dt * (touring ? (c.TOUR_FOLLOW_LERP ?? c.FOLLOW_LERP) : c.FOLLOW_LERP));
    this.zoom = lerp(this.zoom, this.tzoom, ez);
    this.cx = lerp(this.cx, this.tcx, ec);
    this.cy = lerp(this.cy, this.tcy, ec);
    this._clamp();
  }

  // SCREENSAVER TOUR: a varied sequence of shots — WIDE establishing views of the whole lake, HABITAT shots (weed beds,
  // the shallow shelves, the deep basin) with a slow pan, and close FOLLOWs of a fish (biased to predators). Moving to a
  // far subject PULLS BACK first, glides, then pushes in (ease-out/ease-in) instead of whip-panning at close zoom.
  // All picks use Math.random (render-only), never the sim's seeded RNG.
  _tour(dt, world) {
    this._tourTimer -= dt;
    const shot = this._shot;
    if (shot) {
      if (shot.kind === 'follow' && !this._find(world, this._tourId)) this._tourTimer = 0;   // subject gone → next shot
      if (shot.travel > 0) { shot.travel -= dt; if (shot.travel <= 0) this.setZoomRel(shot.zoom); }
      if (shot.drift) { this.tcx += shot.drift[0] * dt; this.tcy += shot.drift[1] * dt; }
      if (this._tourTimer > 0) return;
    }
    this._pickShot(world);
  }
  _pickShot(world) {
    const c = this.cfg, ags = world.agents || [], r = Math.random();
    const pW = c.TOUR_WIDE ?? 0.16, pH = c.TOUR_HABITAT ?? 0.26;
    let kind = r < pW ? 'wide' : r < pW + pH ? 'habitat' : 'follow';
    if (kind === 'follow' && !ags.length) kind = 'wide';
    const shot = { kind, zoom: 1, travel: 0, drift: null };
    this._tourId = null;
    let tx = this.W / 2, ty = this.H / 2;
    if (kind === 'wide') {
      shot.zoom = rrand(1.0, 1.35); tx = this.W * rrand(0.44, 0.56); ty = this.H * rrand(0.45, 0.55); shot.drift = [rrand(-14, 14), 0];
    } else if (kind === 'habitat') {
      const spots = [];
      for (const wb of world.weedbeds || []) spots.push([wb.x, (wb.top + wb.bot) / 2]);
      for (const fx of [0.09, 0.91, 0.5]) { const x = this.W * fx; spots.push([x, bedY(x) * (fx === 0.5 ? 0.82 : 0.7)]); }   // shelves + deep basin
      const s = spots[(Math.random() * spots.length) | 0]; tx = s[0]; ty = s[1];
      shot.zoom = rrand(3, 6); shot.drift = [rrand(-20, 20), rrand(-4, 4)];
    } else {
      let pick = null, best = -1;
      for (let i = 0, n = Math.min(ags.length, 40); i < n; i++) {
        const a = ags[(Math.random() * ags.length) | 0];
        const score = a.size * (a.sp && a.sp.diet && a.sp.diet.fish ? 2.4 : 1) * (0.5 + Math.random());
        if (score > best) { best = score; pick = a; }
      }
      if (pick) { this._tourId = pick.id; tx = pick.x; ty = pick.y; }
      const [zlo, zhi] = c.TOUR_ZOOM_REL; shot.zoom = rrand(zlo, zhi);
    }
    this.tcx = tx; this.tcy = ty;
    // far subject at a close zoom → pull back to a medium view while travelling, push in on arrival
    const viewW = this.vw / Math.max(this.zoom, 1e-6), far = Math.hypot(tx - this.cx, ty - this.cy) > viewW * 0.6;
    if (far && shot.zoom > 2.5) { shot.travel = c.TOUR_TRAVEL ?? 2.4; this.setZoomRel(Math.min(2.5, this.zoom / this.fitZoom)); }
    else this.setZoomRel(shot.zoom);
    const [dlo, dhi] = c.TOUR_DWELL;
    this._shot = shot; this._tourTimer = rrand(dlo, dhi) * (kind === 'wide' ? 1.2 : 1);
  }

  _find(world, id) {
    const ags = world.agents;
    for (let i = 0; i < ags.length; i++) if (ags[i].id === id) return ags[i];
    return null;
  }

  // clamp the *target* centre so the view stays over the world. Wider than the world → centre horizontally. TALLER than
  // the world (16:10, 4:3, portrait) → keep the water surface near the top (a margin of at most 3% of the lake height)
  // and let the spare height fall below the bed, where it reads as more sediment; centring left a band of empty
  // letterbox "sky" with god-ray streaks above the water. At 16:9 the FIT_PAD margin is under 3% → still centred.
  _clamp() {
    const yFit = hh => hh - Math.min(0.03 * this.H, hh - this.H / 2);   // world top sits min(3% H, spare/2) below the screen top
    const hw = this.vw / (2 * this.tzoom), hh = this.vh / (2 * this.tzoom);
    this.tcx = hw * 2 >= this.W ? this.W / 2 : clamp(this.tcx, hw, this.W - hw);
    this.tcy = hh * 2 >= this.H ? yFit(hh) : clamp(this.tcy, hh, this.H - hh);
    const hw2 = this.vw / (2 * this.zoom), hh2 = this.vh / (2 * this.zoom);
    this.cx = hw2 * 2 >= this.W ? this.W / 2 : clamp(this.cx, hw2, this.W - hw2);
    this.cy = hh2 * 2 >= this.H ? yFit(hh2) : clamp(this.cy, hh2, this.H - hh2);
  }
  _clampNow() { this._clamp(); }

  // a stable [0..1] "zoom-ness" for UI (0 = whole lake, 1 = closest)
  zoomFraction() { return clamp((this.zoom - this.fitZoom) / (this.maxZoom - this.fitZoom), 0, 1); }
}
