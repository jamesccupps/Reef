// camera.js — world-space camera: pan, zoom, follow, cinematic auto-tour.
// PURE & DOM-free: it only does math on numbers (viewport size is passed in as px),
// so it is unit-tested headlessly alongside the sim. The renderer draws through it.
import { clamp, lerp, TAU } from './core.js';
import { CAMERA } from './config.js';

// render-time randomness (tour subject picks) must NOT touch the sim's seeded RNG,
// or it would desync determinism. Use Math.random here, never core.rand.
const rrand = (a, b) => a + Math.random() * (b - a);

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

  follow(id) { if (id == null) return; this.mode = 'follow'; this.followId = id; }
  isFollowing(id) { return this.mode === 'follow' && this.followId === id; }

  startTour() { this.mode = 'tour'; this._tourTimer = 0; this._tourId = null; }
  stopTour() { if (this.mode === 'tour') { this.mode = 'free'; this._tourId = null; } }

  // ---- per-frame update ----
  update(dt, world) {
    if (this.mode === 'tour') this._tour(dt, world);

    if (this.mode === 'follow' || (this.mode === 'tour' && this._tourId != null)) {
      const id = this.mode === 'follow' ? this.followId : this._tourId;
      const a = this._find(world, id);
      if (a) { this.tcx = a.x; this.tcy = a.y; }
      else if (this.mode === 'follow') { this.mode = 'free'; this.followId = null; }
      else { this._tourTimer = 0; } // tour subject gone → repick next tick
    }

    const ez = 1 - Math.exp(-dt * this.cfg.ZOOM_LERP);
    const ec = 1 - Math.exp(-dt * this.cfg.FOLLOW_LERP);
    this.zoom = lerp(this.zoom, this.tzoom, ez);
    this.cx = lerp(this.cx, this.tcx, ec);
    this.cy = lerp(this.cy, this.tcy, ec);
    this._clamp();
  }

  _tour(dt, world) {
    this._tourTimer -= dt;
    if (this._tourTimer > 0 && this._tourId != null && this._find(world, this._tourId)) return;
    // pick a fresh subject — favour bigger/predatory fish for drama, else any agent
    const ags = world.agents;
    if (!ags || !ags.length) { this._tourId = null; this.tcx = this.W / 2; this.tcy = this.H / 2; this.setZoomRel(2); this._tourTimer = 4; return; }
    let pick = null, best = -1;
    const samples = Math.min(ags.length, 40);
    for (let i = 0; i < samples; i++) {
      const a = ags[(Math.random() * ags.length) | 0];
      const score = a.size * (a.sp && a.sp.diet && a.sp.diet.fish ? 2.4 : 1) * (0.5 + Math.random());
      if (score > best) { best = score; pick = a; }
    }
    this._tourId = pick ? pick.id : null;
    const [zlo, zhi] = this.cfg.TOUR_ZOOM_REL;
    this.setZoomRel(rrand(zlo, zhi));
    const [dlo, dhi] = this.cfg.TOUR_DWELL;
    this._tourTimer = rrand(dlo, dhi);
  }

  _find(world, id) {
    const ags = world.agents;
    for (let i = 0; i < ags.length; i++) if (ags[i].id === id) return ags[i];
    return null;
  }

  // clamp the *target* centre so the view stays over the world (centre if the world is smaller than the view)
  _clamp() {
    const hw = this.vw / (2 * this.tzoom), hh = this.vh / (2 * this.tzoom);
    this.tcx = hw * 2 >= this.W ? this.W / 2 : clamp(this.tcx, hw, this.W - hw);
    this.tcy = hh * 2 >= this.H ? this.H / 2 : clamp(this.tcy, hh, this.H - hh);
    const hw2 = this.vw / (2 * this.zoom), hh2 = this.vh / (2 * this.zoom);
    this.cx = hw2 * 2 >= this.W ? this.W / 2 : clamp(this.cx, hw2, this.W - hw2);
    this.cy = hh2 * 2 >= this.H ? this.H / 2 : clamp(this.cy, hh2, this.H - hh2);
  }
  _clampNow() { this._clamp(); }

  // a stable [0..1] "zoom-ness" for UI (0 = whole lake, 1 = closest)
  zoomFraction() { return clamp((this.zoom - this.fitZoom) / (this.maxZoom - this.fitZoom), 0, 1); }
}
