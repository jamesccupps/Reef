// controls3.js — a free camera rig for the 3-D lakes (browser layer): orbit a target (drag), pan (right- or shift-drag),
// zoom (wheel, pinch), move (W A S D, R F); eased; never below the ground or the lake bed.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';

export class CameraRig {
  constructor(camera, el, { groundAt, maxDist = 2200 }) {   // (maxDist: the farthest zoom out — the true-size lakes need kilometres)
    this.camera = camera; this.el = el; this.groundAt = groundAt; this.maxDist = maxDist;
    this.target = new THREE.Vector3(); this.yaw = 0; this.pitch = -0.6; this.dist = 300;
    this.goal = { target: new THREE.Vector3(), yaw: 0, pitch: -0.6, dist: 300 };
    this.keys = new Set(); this._drag = null; this._pts = new Map();
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); this._pts.set(e.pointerId, [e.clientX, e.clientY]); this._drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; el.classList.add('drag'); });
    el.addEventListener('pointermove', e => this._move(e));
    const up = e => { this._pts.delete(e.pointerId); if (!this._pts.size) { this._drag = null; el.classList.remove('drag'); } this._pinch = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); this.goal.dist = THREE.MathUtils.clamp(this.goal.dist * Math.exp(e.deltaY * 0.0011), 1.2, this.maxDist); }, { passive: false });
    addEventListener('keydown', e => { if (!(e.target instanceof HTMLInputElement)) this.keys.add(e.key.toLowerCase()); });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
  }
  set(target, yaw, pitch, dist) { this.goal.target.copy(target); this.goal.yaw = yaw; this.goal.pitch = pitch; this.goal.dist = dist; }
  _move(e) {
    if (!this._drag) return;
    if (this._pts.has(e.pointerId)) this._pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (this._pts.size === 2) {   // pinch: zoom
      const [a, b] = [...this._pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (this._pinch) this.goal.dist = THREE.MathUtils.clamp(this.goal.dist * this._pinch / Math.max(d, 1), 1.2, this.maxDist);
      this._pinch = d; return;
    }
    const dx = e.clientX - this._drag.x, dy = e.clientY - this._drag.y; this._drag.x = e.clientX; this._drag.y = e.clientY;
    if (this._drag.pan || e.shiftKey) {
      const k = this.goal.dist * 0.0016, c = Math.cos(this.goal.yaw), s = Math.sin(this.goal.yaw);
      this.goal.target.x -= (dx * c + dy * s) * k; this.goal.target.z -= (-dx * s + dy * c) * k;
    } else { this.goal.yaw -= dx * 0.005; this.goal.pitch = THREE.MathUtils.clamp(this.goal.pitch - dy * 0.004, -1.5, 0.6); }
  }
  update(dt) {
    const g = this.goal, sp = Math.max(4, g.dist * 0.8) * dt, c = Math.cos(g.yaw), s = Math.sin(g.yaw), K = this.keys;
    if (K.has('w')) { g.target.x -= s * sp; g.target.z -= c * sp; }
    if (K.has('s')) { g.target.x += s * sp; g.target.z += c * sp; }
    if (K.has('a')) { g.target.x -= c * sp; g.target.z += s * sp; }
    if (K.has('d')) { g.target.x += c * sp; g.target.z -= s * sp; }
    if (K.has('r')) g.target.y += sp * 0.4;
    if (K.has('f')) g.target.y -= sp * 0.4;
    const k = 1 - Math.exp(-dt * 6);
    this.target.lerp(g.target, k); this.yaw += (g.yaw - this.yaw) * k; this.pitch += (g.pitch - this.pitch) * k; this.dist += (g.dist - this.dist) * k;
    const cp = Math.cos(this.pitch), p = this.camera.position;
    p.set(this.target.x + Math.sin(this.yaw) * cp * this.dist, this.target.y - Math.sin(this.pitch) * this.dist, this.target.z + Math.cos(this.yaw) * cp * this.dist);
    const floor = this.groundAt(p.x, p.z) + 0.25;   // never through the ground or the lake bed
    if (p.y < floor) p.y = floor;
    this.camera.lookAt(this.target);
  }
}
