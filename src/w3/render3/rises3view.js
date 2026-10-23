// rises3view.js — the insects on the water and the fish that take them, on screen (browser layer). The human: "don't forget
// about the bugs on the surface and bass or some fish jumping to get them". The sim counts each fish's surface feeding as single
// insects (fish3 RISES: [x, y, length cm, species, id, count] per step, carried by sim3worker.js in each snapshot); here each
// becomes a RISE — an expanding ring on the water where it was taken, with a splash for a fish of a hand's length or more — and
// some, for smallmouth and pumpkinseed, a LEAP: the fish arcs out of the water at a damselfly or dragonfly over the weeds and
// falls back in a splash (cosmetic: the sim's fish stay in the water and the leaps are chosen with Math.random, never
// core.rand). The insects themselves float on the film near where the camera looks, at the sim's density on each water column
// (littoral3 surfA + surfT, g wet/m², ÷ an insect's mass) — the weeds' midges and mayflies, the land's ants and beetles.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { KEYS3, F3 } from '../fish3.js';
import { LAYER } from './plants3view.js';
const { attribute } = THREE.TSL;

const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
const RING_MAX = 800, RING_LIFE = 2.6, RING_V = 0.28;    // rings at once; s a ring lasts; m/s it spreads
const SPLASH_MAX = 200, SPLASH_LIFE = 0.45;              // the white of a splash, s
// per kind: the chance a rise is a LEAP, its height (m) and its time in the air (s) — smallmouth leap at damselflies and
// dragonflies over the weeds; pumpkinseed pop at the surface, now and then clear of it
const LEAP = { bass: [0.25, 0.35, 0.6], sunfish: [0.06, 0.12, 0.4] };
const BUG_MAX = 3000, BUG_NEAR = 12, BUG_SCAN = 0.4;    // insects drawn at most; m about the camera's target; s between rescans
const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

export function makeRisesView(W3) {
  const group = new THREE.Group();
  // rings and splashes: flat instanced discs on the surface, fading by an instanced attribute
  const mk = (geo, max, color) => {
    geo.rotateX(-Math.PI / 2); geo.setAttribute('fade', new THREE.InstancedBufferAttribute(new Float32Array(max), 1));
    const mat = new THREE.MeshBasicNodeMaterial({ color, transparent: true, depthWrite: false }); mat.opacityNode = attribute('fade', 'float');
    const m = new THREE.InstancedMesh(geo, mat, max); m.count = 0; m.frustumCulled = false; m.layers.set(LAYER); group.add(m); return m;
  };
  const rings = mk(new THREE.RingGeometry(0.86, 1, 32), RING_MAX, 0xdfe9e6), splashes = mk(new THREE.CircleGeometry(1, 18), SPLASH_MAX, 0xf4f8f6);
  // the insects: small dark bodies on the film
  const bugGeo = new THREE.SphereGeometry(0.5, 6, 4), bugMat = new THREE.MeshLambertNodeMaterial({ color: 0x1c1a12 });
  const bugs = new THREE.InstancedMesh(bugGeo, bugMat, BUG_MAX); bugs.count = 0; bugs.frustumCulled = false; bugs.layers.set(LAYER); group.add(bugs);
  const R = [], S = [], leaps = new Map();   // live rings, splashes ({x, y, z, t0, r0, a}); leaping fish by id
  const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  let surf = null, bugAt = -1e9, onLeap = null;   // (onLeap(x, y, t, dur, h, dir): a leap begins — the shallows' view puts a damselfly there)

  const ring = (x, y, t, r0, a) => { if (R.length >= RING_MAX) R.shift(); R.push({ x, z: -y, sy: surfY(x, y), t0: t, r0, a }); };
  const splash = (x, y, t, r0) => { if (S.length >= SPLASH_MAX) S.shift(); S.push({ x, z: -y, sy: surfY(x, y), t0: t, r0 }); };
  // a snapshot's rises: a ring each (a school's spread about it), a splash for the bigger fish, some leaps
  function add(rz, t, scale = 1) {
    const ru = new Uint32Array(rz.buffer, rz.byteOffset, rz.length);   // (the fish's id as u32 bits: sim3worker snapshot)
    for (let o = 0; o + 5 < rz.length; o += 6) {
      const x = rz[o], y = rz[o + 1], Lc = rz[o + 2], kind = KEYS3[rz[o + 3]], id = ru[o + 4], n = rz[o + 5], L = Lc / 100 * scale;
      const lp = LEAP[kind];
      if (lp && n <= 1 && Lc >= 8 && !leaps.has(id) && Math.random() < lp[0]) {   // a leap: up, through the air, back in
        const h = lp[1] * (0.7 + 0.6 * Math.random()) * Math.min(1.5, Lc / 25), dur = lp[2] * (0.8 + 0.4 * Math.random());
        const dir = Math.random() * Math.PI * 2; leaps.set(id, { t0: t, dur, h, x, y, dir });
        ring(x, y, t, 0.05 + L * 0.4, 0.9); splash(x, y, t, 0.06 + L * 0.5);
        if (onLeap) onLeap(x, y, t, dur, h, dir);
        continue;
      }
      const spread = n > 1 ? Math.max(0.3, Math.sqrt(n) * L * 2) : 0;
      for (let k = 0; k < Math.min(n, 4); k++) {
        const rx = x + (Math.random() - 0.5) * spread, ry = y + (Math.random() - 0.5) * spread, dt = Math.random() * 0.4;
        ring(rx, ry, t + dt, 0.02 + L * 0.15, Lc >= 12 ? 0.8 : 0.55);
        if (Lc >= 15) splash(rx, ry, t + dt, 0.03 + L * 0.25);   // (a hand-length fish's take breaks the surface)
      }
    }
  }
  // where a leaping fish is now: {h above the surface, pitch, x, y}, or null — fish3view draws it there instead
  const land = (l, t) => { ring(l.x + Math.cos(l.dir) * 0.3, l.y + Math.sin(l.dir) * 0.3, t, 0.08, 1); splash(l.x + Math.cos(l.dir) * 0.3, l.y + Math.sin(l.dir) * 0.3, t, 0.15); };   // (back in)
  function leapAt(id, t) {
    const l = leaps.get(id); if (!l) return null;
    const ph = (t - l.t0) / l.dur; if (ph < 0) return null;
    if (ph >= 1) { leaps.delete(id); land(l, t); return null; }
    return { h: l.h * Math.sin(Math.PI * ph), pitch: (0.5 - ph) * 2.4, x: l.x + Math.cos(l.dir) * 0.3 * ph, y: l.y + Math.sin(l.dir) * 0.3 * ph };
  }
  function setSurf(arr) { surf = arr; bugAt = -1e9; }
  // each frame: the rings spread and fade, the splashes flash and fade; every BUG_SCAN s the insects about the camera's target
  function update(t, tx, ty, dist) {
    // (a leap ends in leapAt, asked only for the fish drawn: one not drawn — out of the view's list, eaten, gone — ends here a moment
    // after its time, back in with its splash, so its fish can leap again and the map doesn't grow)
    for (const [id, l] of leaps) if (t - l.t0 > l.dur + 0.5) { leaps.delete(id); land(l, t); }
    let n = 0; const F = rings.geometry.attributes.fade.array;
    for (let i = R.length - 1; i >= 0; i--) {
      const r = R[i], age = t - r.t0; if (age > RING_LIFE) { R.splice(i, 1); continue; } if (age < 0) continue;
      const rr = r.r0 + RING_V * age, f = 1 - age / RING_LIFE;
      p.set(r.x, r.sy + 0.004, r.z); sc.set(rr, 1, rr); mat.compose(p, q.identity(), sc); rings.setMatrixAt(n, mat); F[n] = r.a * f * f; n++;
    }
    rings.count = n; rings.instanceMatrix.needsUpdate = true; rings.geometry.attributes.fade.needsUpdate = true;
    n = 0; const FS = splashes.geometry.attributes.fade.array;
    for (let i = S.length - 1; i >= 0; i--) {
      const s = S[i], age = t - s.t0; if (age > SPLASH_LIFE) { S.splice(i, 1); continue; } if (age < 0) continue;
      const rr = s.r0 * (1 + 2 * age), f = 1 - age / SPLASH_LIFE;
      p.set(s.x, s.sy + 0.006, s.z); sc.set(rr, 1, rr); mat.compose(p, q.identity(), sc); splashes.setMatrixAt(n, mat); FS[n] = 0.85 * f; n++;
    }
    splashes.count = n; splashes.instanceMatrix.needsUpdate = true; splashes.geometry.attributes.fade.needsUpdate = true;
    // the insects: each 1.5-m cell near the target gets its column's number (g/m² ÷ an insect's mass × the cell's area), at hashed
    // places that drift a little on the film
    if (t - bugAt < BUG_SCAN) return; bugAt = t;
    let nb = 0;
    if (surf && dist < 45) {
      const c0 = Math.floor((tx - GEO.X0) / GEO.CELL), r0 = Math.floor((ty - GEO.Y0) / GEO.CELL), CR = Math.ceil(BUG_NEAR / GEO.CELL);
      for (let r = r0 - CR; r <= r0 + CR && nb < BUG_MAX; r++) for (let c = c0 - CR; c <= c0 + CR && nb < BUG_MAX; c++) {
        if (r < 0 || c < 0 || r >= GEO.NY || c >= GEO.NX) continue;
        const i = r * GEO.NX + c, [x0, y0] = GEO.cellCentre(i); if (GEO.depthAt(x0, y0) <= 0.05) continue;
        const col = W3.colAt(x0, y0); if (col < 0) continue;
        const m = Math.min(24 * GEO.CELL * GEO.CELL / 2.25, Math.floor(surf[col] / F3.INSECT_G * GEO.CELL * GEO.CELL + hash(i, 7)));   // (the cap per 1.5-m cell's 2.25 m²)
        for (let k = 0; k < m && nb < BUG_MAX; k++) {
          const x = x0 + (hash(i, k * 3 + 1) - 0.5) * GEO.CELL + 0.08 * Math.sin(t * 0.21 + k), y = y0 + (hash(i, k * 3 + 2) - 0.5) * GEO.CELL + 0.08 * Math.cos(t * 0.17 + k);
          const s = 0.6 + 0.9 * hash(i, k * 3 + 3);
          p.set(x, surfY(x, y) + 0.002, -y); e.set(0, hash(i, k + 11) * 6.28, 0); q.setFromEuler(e); sc.set(0.009 * s, 0.003 * s, 0.004 * s);
          mat.compose(p, q, sc); bugs.setMatrixAt(nb++, mat);
        }
      }
    }
    bugs.count = nb; if (nb) bugs.instanceMatrix.needsUpdate = true;
  }
  // the wildlife's marks on the water (render3/wild3view.js, shallows3view.js): a ring spreading from r0 m (strength a) and, with
  // sr > 0, a splash sr m across — a loon's dive, an osprey's plunge, a frog's plop
  const ripple = (x, y, t, r0, a = 0.8, sr = 0) => { ring(x, y, t, r0, a); if (sr > 0) splash(x, y, t, sr); };
  return { group, add, update, leapAt, setSurf, ripple, setLeapHook: fn => { onLeap = fn; }, stats: () => ({ rings: R.length, splashes: S.length, leaps: leaps.size, bugs: bugs.count, surfMax: surf ? Math.max(...surf) : -1, surfMean: surf ? surf.reduce((a, b) => a + b, 0) / surf.length : -1 }) };
}
