// fish3view.js — the fish of the 3-D lakes on screen (browser layer). Every fish is an instance of one low-poly body, placed
// from snapshots of the sim's agents (src/w3/fish3.js, stepped in render3/sim3worker.js) and interpolated between its
// 10-Hz steps (each fish's place a step before rides in the snapshot); a school agent is drawn as its n fish around it — a tight shoal by day, loose at night. The
// body swims: a travelling wave down its rear half (the vertex shader), its beat with the fish's speed. In sunlit shallow water
// each fish casts a soft SHADOW on the bed below it, along the sun's direction — often what gives a fish away from above.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { S3, KEYS3 } from '../fish3.js';
import { waterOut, WU } from './water3.js';

const { attribute, positionLocal, positionGeometry, sin, time, float, max: tmax, uv, vec3, smoothstep, length } = THREE.TSL;
const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE;
export const FISH_MAX = 40000;   // instances
const MEMBERS_MAX = 160;         // fish drawn per school at most
const YOY_DRAW = 14, YOY_NEAR = 40;
const FISH_STRIDE = 18, YOY_STRIDE = 11;   // (the snapshot's layout: render3/sim3worker.js)   // young-of-year: fish drawn per school, and within how far of the camera (m, × the size shown)

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
  const wz = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX), 1); wz.setUsage(THREE.DynamicDrawUsage);   // depth below the surface (m)
  geo.setAttribute('swim', swim); geo.setAttribute('side', side); geo.setAttribute('wz', wz);
  const mat = new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.12 });
  // the body's wave: a sideways displacement growing toward the tail, travelling backward at the beat (swim.x rad/s, swim.y
  // phase) — on the body's own axis (the unit fish's x), pushed along the fish's side (the instance's, `side`): three applies
  // a node material's positionNode AFTER the instance transform, so the wave is added in the lake's frame
  const sw = attribute('swim', 'vec2'), px = positionGeometry.x, back = tmax(float(0), float(0.25).sub(px));   // (0 ahead of mid-body)
  const wave = sin(time.mul(sw.x).add(sw.y).add(px.mul(7))).mul(back.mul(back)).mul(0.55);
  mat.positionNode = positionLocal.add(attribute('side', 'vec3').mul(wave));
  mat.outputNode = waterOut(attribute('wz', 'float'));   // (the water between the fish and the eye: water3.js)
  const mesh = new THREE.InstancedMesh(geo, mat, FISH_MAX);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 3), 3); mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  // the shadows: a soft dark ellipse per fish on the bed (a disc, its darkness per instance — `sha`), drawn over the bed and
  // under the water's surface
  const sGeo = new THREE.CircleGeometry(0.5, 14); sGeo.rotateX(-Math.PI / 2);
  const sha = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX), 1); sha.setUsage(THREE.DynamicDrawUsage); sGeo.setAttribute('sha', sha);
  const sMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  sMat.colorNode = vec3(0.02, 0.018, 0.01);
  sMat.opacityNode = attribute('sha', 'float').mul(float(1).sub(smoothstep(0.15, 0.5, length(uv().sub(0.5)))));   // (soft edged)
  const shadow = new THREE.InstancedMesh(sGeo, sMat, FISH_MAX); shadow.instanceMatrix.setUsage(THREE.DynamicDrawUsage); shadow.frustumCulled = false; shadow.count = 0; shadow.renderOrder = 1;
  const SM = shadow.instanceMatrix.array, SH = sha.array;
  let sun = [0, 1, 0, 0], ns = 0;   // the sun: direction (x, up, z — three's frame, normalised) and strength
  // a shadow for a fish at (X, Y, Z) (three), heading yaw, length L, `depth` below the surface over a bed `bed` deep (m)
  function shade(X, Z, yaw, L, depth, bed, sY) {
    const gap = bed - depth; if (!(sun[3] > 0.02) || gap > 2.5 || ns >= FISH_MAX) return;
    const t = gap / Math.max(0.25, sun[1]), x = X - sun[0] * t, z = Z - sun[2] * t;   // (along the sun's ray down to the bed)
    const k = Math.exp(-(WU.kd.value.y * 1.0) * bed) * sun[3] * Math.max(0, 1 - gap / 2.5) * 0.6; if (k < 0.02) return;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), Lx = L * (1 + 0.6 * gap), W = L * 0.32 * (1 + 0.8 * gap), o = ns * 16;
    SM[o] = cy * Lx; SM[o + 1] = 0; SM[o + 2] = -sy * Lx; SM[o + 3] = 0;
    SM[o + 4] = 0; SM[o + 5] = 1; SM[o + 6] = 0; SM[o + 7] = 0;
    SM[o + 8] = sy * W; SM[o + 9] = 0; SM[o + 10] = cy * W; SM[o + 11] = 0;
    SM[o + 12] = x; SM[o + 13] = sY - bed + 0.015; SM[o + 14] = z; SM[o + 15] = 1;
    SH[ns++] = k;
  }
  const tint = KEYS3.map(k => new THREE.Color(S3[k].sp.tag));
  const M = mesh.instanceMatrix.array, CC = mesh.instanceColor.array, SW = swim.array, SD = side.array, WZ = wz.array;
  let n = 0;
  // one fish at three-space position (X, Y, Z), heading yaw / pitch (sim frame), length L, depth D (m)
  function put(X, Y, Z, yaw, pitch, L, D, c, shade, beat, phase, depth) {
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
    SW[n * 2] = beat; SW[n * 2 + 1] = phase; SD[n * 3] = rx * W; SD[n * 3 + 1] = ry * W; SD[n * 3 + 2] = rz * W; WZ[n] = depth;
    n++;
  }
  const lerpA = (a, b, t) => { let d = b - a; if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
  // the surface's height (three's y) over (x, y): each lake's own level, the brook's falling one
  const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
  // place every fish from a snapshot of the sim (render3/sim3worker.js: per fish [px py pz pyaw ppitch | x y z yaw pitch | L k n
  // spd bed id school bodyMul], per school of young [px py pz | x y z | L k n id bed]): alpha the interpolation between its last
  // two steps, scale the size shown (1 = true), night 0..1 (schools loosen), t the clock (s, for the members' wander), (cx, cy)
  // the camera's place in the sim's frame — the young, a few centimetres long, are drawn only within YOY_NEAR × scale of it
  const depthR = KEYS3.map(k => S3[k].sp.depthR);
  function update(snap, alpha, scale, night, t, cx = 0, cy = 0, sunDir = null) {
    n = 0; ns = 0; if (sunDir) sun = sunDir;
    const B = snap.fish, NF = snap.nf;
    for (let i = 0, o = 0; i < NF; i++, o += FISH_STRIDE) {
      const x = B[o] + (B[o + 5] - B[o]) * alpha, y = B[o + 1] + (B[o + 6] - B[o + 1]) * alpha, z = B[o + 2] + (B[o + 7] - B[o + 2]) * alpha;
      const yaw = lerpA(B[o + 3], B[o + 8], alpha), pitch = B[o + 4] + (B[o + 9] - B[o + 4]) * alpha;
      const Lc = B[o + 10], k = B[o + 11], nn = B[o + 12], spd = B[o + 13], bed = B[o + 14], id = B[o + 15], school = B[o + 16], bodyMul = B[o + 17];
      const L = Lc / 100 * scale, D = L * depthR[k] * bodyMul * 1.15, c = tint[k];
      const beat = 6 + 18 * Math.min(1, spd / Math.max(1e-3, Lc / 100) / 4), sY = surfY(x, y);
      if (!school || nn < 1.5) { put(x, sY - z, -y, yaw, pitch, L, D, c, 0.85 + 0.3 * OFF[(id & 1023) * 4 + 3] / 6.3, beat, id * 1.7, z); shade(x, -y, yaw, L, z, bed, sY); continue; }
      // a school: its n fish (up to MEMBERS_MAX) about the agent, ~3 body lengths apart by day, ~8 at night; flattened
      const m = Math.min(MEMBERS_MAX, Math.round(nn)), sp1 = (3 + 5 * night) * L, r = sp1 * Math.cbrt(m) * 0.55;
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), zMax = Math.max(0.06, bed - 0.04);
      for (let q = 0; q < m; q++) {
        const h = ((id * 131 + q * 17) & 1023) * 4, ox = OFF[h] * r, oy = OFF[h + 1] * r, oz = OFF[h + 2] * r * 0.35, ph = OFF[h + 3];
        const wx = ox + Math.sin(t * 0.6 + ph) * 0.4 * L, wy = oy + Math.cos(t * 0.5 + ph * 1.3) * 0.4 * L;
        const mx = x + wx * cyw - wy * syw, my = y + wx * syw + wy * cyw, mz = Math.min(zMax, Math.max(0.05, z + oz));
        put(mx, sY - mz, -my, yaw + Math.sin(t * 0.8 + ph) * 0.18, pitch, L * (0.9 + 0.2 * (ph / 6.3)), D, c, 0.8 + 0.35 * (ph / 6.3), beat, ph, mz);
        shade(mx, -my, yaw, L, mz, bed, sY);
      }
    }
    // THE YOUNG-OF-YEAR: a school drawn as up to YOY_DRAW of its fish, a loose cloud about it (near the camera only)
    const Y = snap.yoy, NY = snap.ny, near2 = (YOY_NEAR * scale) ** 2;
    for (let i = 0, o = 0; i < NY; i++, o += YOY_STRIDE) {
      if ((Y[o + 3] - cx) ** 2 + (Y[o + 4] - cy) ** 2 > near2) continue;
      const x = Y[o] + (Y[o + 3] - Y[o]) * alpha, y = Y[o + 1] + (Y[o + 4] - Y[o + 1]) * alpha, z = Y[o + 2] + (Y[o + 5] - Y[o + 2]) * alpha, sY = surfY(x, y);
      const Lc = Y[o + 6], k = Y[o + 7], nn = Y[o + 8], id = Y[o + 9], bed = Y[o + 10];
      const L = Lc / 100 * scale, D = L * depthR[k] * 1.15, c = tint[k], m = Math.min(YOY_DRAW, Math.max(1, Math.round(nn))), r = Math.max(0.15, 10 * L) * (1 + night);
      for (let q = 0; q < m; q++) {
        const h = ((id * 97 + q * 31) & 1023) * 4, ph = OFF[h + 3];
        const mx = x + OFF[h] * r + Math.sin(t * 0.9 + ph) * 3 * L, my = y + OFF[h + 1] * r + Math.cos(t * 0.7 + ph) * 3 * L, mz = Math.min(Math.max(0.06, bed - 0.02), Math.max(0.04, z + OFF[h + 2] * r * 0.4));
        put(mx, sY - mz, -my, ph, 0, L, D, c, 0.75 + 0.3 * (ph / 6.3), 14, ph, mz); shade(mx, -my, ph, L, mz, bed, sY);
      }
    }
    mesh.count = n; shadow.count = ns;
    if (ns) { shadow.instanceMatrix.clearUpdateRanges(); shadow.instanceMatrix.addUpdateRange(0, ns * 16); shadow.instanceMatrix.needsUpdate = true; sha.clearUpdateRanges(); sha.addUpdateRange(0, ns); sha.needsUpdate = true; }
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true; swim.needsUpdate = true; side.needsUpdate = true; wz.needsUpdate = true;
    return n;
  }
  return { mesh, shadow, update };
}
