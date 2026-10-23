// controls3.js — a free camera rig for the 3-D lakes (browser layer): orbit a target (drag), pan (right- or shift-drag, or two
// fingers moved together), zoom (wheel, pinch), move (W A S D, R F); eased; never below the ground or the lake bed.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';

// (a key typed into a text field is not a move — but a ticked box, a slider or a button keeps the focus, and W A S D must still work)
export const typing = t => !!t && (t.isContentEditable || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement
  || (t instanceof HTMLInputElement && !/^(checkbox|radio|range|button|submit|reset|color|file|image)$/.test(t.type)));
const wrapPi = a => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));
const clamp = THREE.MathUtils.clamp;

export class CameraRig {
  // (maxDist: the farthest zoom out — the true-size lakes need kilometres; bounds: {x0, x1, z0, z1} the target stays within — the
  // land drawn; onPan(): the user moved the target himself — a pan or the keys — so whatever the camera was following lets go)
  constructor(camera, el, { groundAt, maxDist = 2200, bounds = null, onPan = null }) {
    this.camera = camera; this.el = el; this.groundAt = groundAt; this.maxDist = maxDist; this.bounds = bounds; this.onPan = onPan;
    this.target = new THREE.Vector3(); this.yaw = 0; this.pitch = -0.6; this.dist = 300;
    this.goal = { target: new THREE.Vector3(), yaw: 0, pitch: -0.6, dist: 300 };
    this.keys = new Set(); this._drag = null; this._pts = new Map(); this._pinch = null; this._mid = null;
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); this._pts.set(e.pointerId, [e.clientX, e.clientY]); this._drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; this._pinch = null; this._mid = null; el.classList.add('drag'); });
    el.addEventListener('pointermove', e => this._move(e));
    // (a finger lifted from a pinch: the one left on the glass carries on from where it is now, not from where it was when the
    // pinch began — that jumped the view)
    const up = e => {
      this._pts.delete(e.pointerId); this._pinch = null; this._mid = null;
      if (!this._pts.size) { this._drag = null; el.classList.remove('drag'); } else if (this._drag) { const [p] = this._pts.values(); this._drag.x = p[0]; this._drag.y = p[1]; }
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); this.goal.dist = clamp(this.goal.dist * Math.exp(e.deltaY * 0.0011), 1.2, this.maxDist); }, { passive: false });
    addEventListener('keydown', e => { if (!typing(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) this.keys.add(e.key.toLowerCase()); });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
  }
  // a named view, a found animal…: eased to — the shorter way round (the drags' yaw runs on past ±π: an absolute goal spun the view
  // several whole turns)
  set(target, yaw, pitch, dist) { this.goal.target.copy(target); this.goal.yaw = this.yaw + wrapPi(yaw - this.yaw); this.goal.pitch = pitch; this.goal.dist = dist; }
  _pan(dx, dy) {   // the target moved across the ground by a drag of (dx, dy) px
    const k = this.goal.dist * 0.0016, c = Math.cos(this.goal.yaw), s = Math.sin(this.goal.yaw);
    this.goal.target.x -= (dx * c + dy * s) * k; this.goal.target.z -= (-dx * s + dy * c) * k;
    if (this.onPan) this.onPan();
  }
  _move(e) {
    if (!this._drag) return;
    if (this._pts.has(e.pointerId)) this._pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (this._pts.size === 2) {   // two fingers: pinch to zoom; moved together, a pan (once their middle has gone 16 px: a pinch alone doesn't pan)
      const [a, b] = [...this._pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (this._pinch) this.goal.dist = clamp(this.goal.dist * this._pinch / Math.max(d, 1), 1.2, this.maxDist);
      this._pinch = d;
      const M = this._mid;
      if (!M) this._mid = { x: mx, y: my, x0: mx, y0: my, on: false };
      else { if (!M.on && Math.hypot(mx - M.x0, my - M.y0) > 16) M.on = true; if (M.on) this._pan(mx - M.x, my - M.y); M.x = mx; M.y = my; }
      return;
    }
    const dx = e.clientX - this._drag.x, dy = e.clientY - this._drag.y; this._drag.x = e.clientX; this._drag.y = e.clientY;
    if (this._drag.pan || e.shiftKey) this._pan(dx, dy);
    else { this.goal.yaw -= dx * 0.005; this.goal.pitch = clamp(this.goal.pitch - dy * 0.004, -1.5, 0.6); }
  }
  update(dt) {
    const g = this.goal, sp = Math.max(4, g.dist * 0.8) * dt, c = Math.cos(g.yaw), s = Math.sin(g.yaw), K = this.keys;
    if (K.has('w')) { g.target.x -= s * sp; g.target.z -= c * sp; }
    if (K.has('s')) { g.target.x += s * sp; g.target.z += c * sp; }
    if (K.has('a')) { g.target.x -= c * sp; g.target.z += s * sp; }
    if (K.has('d')) { g.target.x += c * sp; g.target.z -= s * sp; }
    if (K.has('r')) g.target.y += sp * 0.4;
    if (K.has('f')) g.target.y -= sp * 0.4;
    if (this.onPan && (K.has('w') || K.has('s') || K.has('a') || K.has('d') || K.has('r') || K.has('f'))) this.onPan();
    // (the target stays over the land drawn, and between the ground — or the lake bed — and a ceiling: R / F and the keys ran it
    // hundreds of metres underground or off the map)
    const B = this.bounds; if (B) { g.target.x = clamp(g.target.x, B.x0, B.x1); g.target.z = clamp(g.target.z, B.z0, B.z1); }
    const gt = this.groundAt(g.target.x, g.target.z); g.target.y = clamp(g.target.y, gt - 0.5, gt + this.maxDist * 0.25);
    const k = 1 - Math.exp(-dt * 6);
    this.target.lerp(g.target, k); this.yaw += (g.yaw - this.yaw) * k; this.pitch += (g.pitch - this.pitch) * k; this.dist += (g.dist - this.dist) * k;
    const cp = Math.cos(this.pitch), p = this.camera.position;
    p.set(this.target.x + Math.sin(this.yaw) * cp * this.dist, this.target.y - Math.sin(this.pitch) * this.dist, this.target.z + Math.cos(this.yaw) * cp * this.dist);
    const floor = this.groundAt(p.x, p.z) + 0.25;   // never through the ground or the lake bed
    if (p.y < floor) p.y = floor;
    this.camera.lookAt(this.target);
  }
}
