// fish3view.js — the fish of the 3-D lakes on screen (browser layer). Every fish is an instance of one low-poly body, placed
// from the sim's agents (src/w3/fish3.js) and interpolated between its 10-Hz steps (render-only fields _px … on each agent,
// which the sim never reads); a school agent is drawn as its n fish around it — a tight shoal by day, loose at night. The
// body swims: a travelling wave down its rear half (the vertex shader), its beat with the fish's speed.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { S3, KEYS3 } from '../fish3.js';

const { attribute, positionLocal, positionGeometry, sin, time, float, max: tmax } = THREE.TSL;
const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
export const FISH_MAX = 40000;   // instances
const MEMBERS_MAX = 160;         // fish drawn per school at most
const YOY_DRAW = 14, YOY_NEAR = 40;   // young-of-year: fish drawn per school, and within how far of the camera (m, × the size shown)

// a unit fish along +x (snout +0.5 → tail fork −0.5), unit body depth along +y, right side +z; dark back, pale belly
function fishGeometry() {
  const SEG = 12, RING = 10, pos = [], col = [], idx = [];
  const half = t => 0.5 * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * t)), 0.62) * (1 - 0.62 * t * t);   // half-depth, snout t 0 → stalk t 1
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG, x = 0.5 - 0.86 * t, h = Math.max(0.025, half(t)), w = h * 0.42;
    for (let k = 0; k < RING; k++) {
      const a = (k / RING) * Math.PI * 2, y = Math.cos(a) * h, z = Math.sin(a) * w;
      pos.push(x, y, z); const shade = 0.42 + 0.68 * (1 - (Math.cos(a) + 1) / 2); col.push(shade, shade, shade);
    }
  }
  for (let i = 0; i < SEG; i++) for (let k = 0; k < RING; k++) {
    const a = i * RING + k, b = i * RING + (k + 1) % RING, c = a + RING, d = b + RING; idx.push(a, c, b, b, c, d);
  }
  const tip = pos.length / 3; pos.push(0.52, 0, 0); col.push(0.7, 0.7, 0.7);
  for (let k = 0; k < RING; k++) idx.push(tip, k, (k + 1) % RING);
  // the tail (a forked fin) and the dorsal fin, two-sided
  const fin = (pts, shade) => { const b = pos.length / 3; for (const p of pts) { pos.push(...p); col.push(shade, shade, shade); } idx.push(b, b + 1, b + 2, b, b + 2, b + 1); };
  const sx = 0.5 - 0.86;   // the tail stalk
  fin([[sx + 0.02, 0, 0], [-0.52, 0.34, 0], [-0.44, 0.02, 0]], 0.5);
  fin([[sx + 0.02, 0, 0], [-0.44, -0.02, 0], [-0.52, -0.34, 0]], 0.6);
  fin([[0.16, half(0.39) * 0.95, 0], [-0.14, half(0.73) * 0.95, 0], [-0.04, half(0.55) + 0.17, 0]], 0.4);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// a fixed table of offsets in a flattened ball (a school's members), from a hash — cosmetic, so Math.random is fine here
const OFF = new Float32Array(1024 * 4);
for (let i = 0; i < 1024; i++) {
  let x, y, z; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; } while (x * x + y * y + z * z > 1);
  OFF[i * 4] = x; OFF[i * 4 + 1] = y; OFF[i * 4 + 2] = z; OFF[i * 4 + 3] = Math.random() * Math.PI * 2;
}

export function makeFishView() {
  const geo = fishGeometry();
  const swim = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 2), 2); swim.setUsage(THREE.DynamicDrawUsage);
  const side = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 3), 3); side.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('swim', swim); geo.setAttribute('side', side);
  const mat = new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.12 });
  // the body's wave: a sideways displacement growing toward the tail, travelling backward at the beat (swim.x rad/s, swim.y
  // phase) — on the body's own axis (the unit fish's x), pushed along the fish's side (the instance's, `side`): three applies
  // a node material's positionNode AFTER the instance transform, so the wave is added in the lake's frame
  const sw = attribute('swim', 'vec2'), px = positionGeometry.x, back = tmax(float(0), float(0.25).sub(px));   // (0 ahead of mid-body)
  const wave = sin(time.mul(sw.x).add(sw.y).add(px.mul(7))).mul(back.mul(back)).mul(0.55);
  mat.positionNode = positionLocal.add(attribute('side', 'vec3').mul(wave));
  const mesh = new THREE.InstancedMesh(geo, mat, FISH_MAX);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 3), 3); mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const tint = KEYS3.map(k => new THREE.Color(S3[k].sp.tag));
  const M = mesh.instanceMatrix.array, CC = mesh.instanceColor.array, SW = swim.array, SD = side.array;
  let n = 0;
  // one fish at three-space position (X, Y, Z), heading yaw / pitch (sim frame), length L, depth D (m)
  function put(X, Y, Z, yaw, pitch, L, D, c, shade, beat, phase) {
    if (n >= FISH_MAX) return;
    const cp = Math.cos(pitch), spn = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
    const fx = cp * cy, fy = spn, fz = -cp * sy;            // forward (sim x → X, up → Y, sim y → −Z)
    const ux = -spn * cy, uy = cp, uz = spn * sy;            // up
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;   // right = forward × up
    const W = D * 0.9, o = n * 16;
    M[o] = fx * L; M[o + 1] = fy * L; M[o + 2] = fz * L; M[o + 3] = 0;
    M[o + 4] = ux * D; M[o + 5] = uy * D; M[o + 6] = uz * D; M[o + 7] = 0;
    M[o + 8] = rx * W; M[o + 9] = ry * W; M[o + 10] = rz * W; M[o + 11] = 0;
    M[o + 12] = X; M[o + 13] = Y; M[o + 14] = Z; M[o + 15] = 1;
    CC[n * 3] = c.r * shade; CC[n * 3 + 1] = c.g * shade; CC[n * 3 + 2] = c.b * shade;
    SW[n * 2] = beat; SW[n * 2 + 1] = phase; SD[n * 3] = rx * W; SD[n * 3 + 1] = ry * W; SD[n * 3 + 2] = rz * W;
    n++;
  }
  const lerpA = (a, b, t) => { let d = b - a; if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
  // the surface's height (three's y) over (x, y): each lake's own level, the brook's falling one
  const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
  // place every fish: F the sim's fish, alpha the interpolation between its last two steps, scale the size shown (1 = true),
  // night 0..1 (schools loosen), t the clock (s, for the members' wander)
  // (cx, cy: the camera's place in the sim's frame — the young, a few centimetres long, are drawn only within YOY_NEAR × scale of it)
  function update(F, alpha, scale, night, t, cx = 0, cy = 0) {
    n = 0;
    for (const a of F.fish) {
      if (!a.alive) continue;
      const x = a._px + (a.x - a._px) * alpha, y = a._py + (a.y - a._py) * alpha, z = a._pz + (a.z - a._pz) * alpha;
      const yaw = lerpA(a._pyaw, a.yaw, alpha), pitch = a._ppitch + (a.pitch - a._ppitch) * alpha;
      const sp = a.s.sp, L = a.L / 100 * scale, D = L * sp.depthR * a.bodyMul * 1.15, c = tint[a.k];
      const beat = 6 + 18 * Math.min(1, a.spd / Math.max(1e-3, a.L / 100) / 4), sY = surfY(x, y);
      if (!a.school || a.n < 1.5) { put(x, sY - z, -y, yaw, pitch, L, D, c, 0.85 + 0.3 * OFF[(a.id & 1023) * 4 + 3] / 6.3, beat, a.id * 1.7); continue; }
      // a school: its n fish (up to MEMBERS_MAX) about the agent, ~3 body lengths apart by day, ~8 at night; flattened
      const m = Math.min(MEMBERS_MAX, Math.round(a.n)), sp1 = (3 + 5 * night) * L, r = sp1 * Math.cbrt(m) * 0.55;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), zMax = Math.max(0.06, a.bed - 0.04);
      for (let k = 0; k < m; k++) {
        const h = ((a.id * 131 + k * 17) & 1023) * 4, ox = OFF[h] * r, oy = OFF[h + 1] * r, oz = OFF[h + 2] * r * 0.35, ph = OFF[h + 3];
        const wx = ox + Math.sin(t * 0.6 + ph) * 0.4 * L, wy = oy + Math.cos(t * 0.5 + ph * 1.3) * 0.4 * L;
        const mx = x + wx * cy - wy * sy, my = y + wx * sy + wy * cy, mz = Math.min(zMax, Math.max(0.05, z + oz));
        put(mx, sY - mz, -my, yaw + Math.sin(t * 0.8 + ph) * 0.18, pitch, L * (0.9 + 0.2 * (ph / 6.3)), D, c, 0.8 + 0.35 * (ph / 6.3), beat, ph);
      }
    }
    // THE YOUNG-OF-YEAR: a school drawn as up to YOY_DRAW of its fish, a loose cloud about it (near the camera only)
    const near2 = (YOY_NEAR * scale) ** 2;
    for (const q of F.yoy) {
      if (!q.alive || (q.x - cx) ** 2 + (q.y - cy) ** 2 > near2) continue;
      const x = q._px + (q.x - q._px) * alpha, y = q._py + (q.y - q._py) * alpha, z = q._pz + (q.z - q._pz) * alpha, sY = surfY(x, y);
      const L = q.L / 100 * scale, D = L * q.s.sp.depthR * 1.15, c = tint[q.k], m = Math.min(YOY_DRAW, Math.max(1, Math.round(q.n))), r = Math.max(0.15, 10 * L) * (1 + night);
      for (let k = 0; k < m; k++) {
        const h = ((q.id * 97 + k * 31) & 1023) * 4, ph = OFF[h + 3];
        const mx = x + OFF[h] * r + Math.sin(t * 0.9 + ph) * 3 * L, my = y + OFF[h + 1] * r + Math.cos(t * 0.7 + ph) * 3 * L, mz = Math.min(Math.max(0.06, q.bed - 0.02), Math.max(0.04, z + OFF[h + 2] * r * 0.4));
        put(mx, sY - mz, -my, ph, 0, L, D, c, 0.75 + 0.3 * (ph / 6.3), 14, ph);
      }
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true; swim.needsUpdate = true; side.needsUpdate = true;
    return n;
  }
  // before each sim step: remember where every fish was (the interpolation's start)
  function remember(F) {
    for (const a of F.fish) { a._px = a.x; a._py = a.y; a._pz = a.z; a._pyaw = a.yaw; a._ppitch = a.pitch; }
    for (const q of F.yoy) { q._px = q.x; q._py = q.y; q._pz = q.z; }
  }
  return { mesh, update, remember };
}
