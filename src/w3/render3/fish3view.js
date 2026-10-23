// fish3view.js — the fish of the 3-D lakes on screen (browser layer). Every fish is an instance of one low-poly body, placed
// from snapshots of the sim's agents (src/w3/fish3.js, stepped in render3/sim3worker.js) and interpolated between its
// 10-Hz steps (each fish's place a step before rides in the snapshot). A school agent (one record standing for n fish in the
// sim) is drawn as its n fish, EACH A SWIMMER OF ITS OWN in the view: a place in the school (~3 body lengths apart by day,
// looser at night) that it swims to with its own inertia, turning no faster than a fish turns, its body along its own heading
// — so a school turns as fish do, one after another, never as a rigid pattern. The
// body swims: a travelling wave down its rear half (the vertex shader), its beat with the fish's speed. In sunlit shallow water
// each fish casts a soft SHADOW on the bed below it, along the sun's direction — often what gives a fish away from above.
// Far fish take a coarse body, and those a fraction of a pixel long on screen none (PX_FAR, PX_MIN).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, UPPER, LOWER } from '../geometry.js';
import { S3, KEYS3 } from '../fish3.js';
import { waterOut, WU } from './water3.js';

const { attribute, positionLocal, positionGeometry, sin, float, max: tmax, uv, vec3, smoothstep, length } = THREE.TSL;
const BASE = GEO.SURF.upper, LOWER_DY = GEO.SURF.lower - BASE, TAU = Math.PI * 2;
export const FISH_MAX = 40000;   // instances
const MEMBERS_MAX = 160;         // fish drawn per school at most
const YOY_DRAW = 14, YOY_NEAR = 40;   // young-of-year: fish drawn per school, and within how far of the camera (m, × the size shown)
const FISH_STRIDE = 18, YOY_STRIDE = 12;   // (the snapshot's layout: render3/fishside3.js packDrawn — the ids as u32 bits)
// THE DETAIL BY A FISH'S SIZE ON SCREEN (its length × PX_RAD ÷ its distance from the camera, px): the full body down to PX_FAR px,
// a coarse one below (58 triangles against 256: ~8,000 fish were 2 M triangles at any distance), none below PX_MIN — a fish a
// fraction of a pixel long under the brown water is not seen; a school's swimmers fewer as they shrink (about halving with their
// size, 32 at least; its spread kept). PX_RAD: px a radian of the view — a 1,200-px-high one at 50° (update may be given the real one)
const PX_RAD = 1300, PX_FAR = 10, PX_MIN = 0.5;

// a unit fish along +x (snout +0.5 → tail fork −0.5), unit body depth along +y, right side +z; dark back, pale belly (SEG rings of
// RING vertices: the full body 12 × 10, the far one 6 × 4)
function fishGeometry(SEG = 12, RING = 10) {
  const pos = [], col = [], idx = [];
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

// WHAT THE VIEW DREW LAST (render3/data3.js's click-a-fish picks among it): the fish's mesh (hidden with the Fish toggle), and the
// spread (m, as drawn) of each school and school of young it drew — the young only those near the camera
export const SHOWN = { mesh: null, spread: new Map() };

export function makeFishView() {
  const mat = new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.12 });
  // the body's wave: a sideways displacement growing toward the tail, travelling backward (swim: its phase, rad, advanced by the
  // fish's beat each frame on the CPU — a phase of the shader's clock × the beat jumped by clock × Δbeat whenever the beat changed, so
  // the tails twitched, and lost precision as the clock grew) — on the body's own axis (the unit fish's x), pushed along the fish's
  // side (the instance's, `side`): three applies a node material's positionNode AFTER the instance transform, so the wave is added
  // in the lake's frame
  const sw = attribute('swim', 'float'), px = positionGeometry.x, back = tmax(float(0), float(0.25).sub(px));   // (0 ahead of mid-body)
  const wave = sin(sw.add(px.mul(7))).mul(back.mul(back)).mul(0.55);
  mat.positionNode = positionLocal.add(attribute('side', 'vec3').mul(wave));
  mat.outputNode = waterOut(attribute('wz', 'float'));   // (the water between the fish and the eye: water3.js)
  // two bodies on the one material: the full one, and the coarse one for the far fish — a child of the full one's mesh, so it is
  // shown, hidden and clipped with it
  const body = geo => {
    const swim = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX), 1), side = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 3), 3);
    const wz = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX), 1);   // depth below the surface (m)
    for (const b of [swim, side, wz]) b.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('swim', swim); geo.setAttribute('side', side); geo.setAttribute('wz', wz);
    const mesh = new THREE.InstancedMesh(geo, mat, FISH_MAX);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(FISH_MAX * 3), 3); mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    return { mesh, swim, side, wz, M: mesh.instanceMatrix.array, CC: mesh.instanceColor.array, SW: swim.array, SD: side.array, WZ: wz.array, n: 0 };
  };
  const NEAR = body(fishGeometry()), FAR = body(fishGeometry(6, 4)), mesh = NEAR.mesh;
  mesh.add(FAR.mesh); SHOWN.mesh = mesh;
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
  let n = 0;   // (the fish drawn, both bodies)
  // one fish at three-space position (X, Y, Z), heading yaw / pitch (sim frame), length L, depth D (m), its tail's phase (rad), on
  // the far body when `far`
  // (wr: the body's width as a share of its depth — the unit fish is 0.42 as wide as deep; the tail's wave keeps its old reach)
  function put(X, Y, Z, yaw, pitch, L, D, c, shade, phase, depth, wr = 0.378, far = false) {
    if (n >= FISH_MAX) return;
    const T = far ? FAR : NEAR, M = T.M, j = T.n, o = j * 16;
    const cp = Math.cos(pitch), spn = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
    const fx = cp * cy, fy = spn, fz = -cp * sy;            // forward (sim x → X, up → Y, sim y → −Z)
    const ux = -spn * cy, uy = cp, uz = spn * sy;            // up
    const rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux;   // right = forward × up
    const W = D * wr / 0.42, Ww = D * 0.9;
    M[o] = fx * L; M[o + 1] = fy * L; M[o + 2] = fz * L; M[o + 3] = 0;
    M[o + 4] = ux * D; M[o + 5] = uy * D; M[o + 6] = uz * D; M[o + 7] = 0;
    M[o + 8] = rx * W; M[o + 9] = ry * W; M[o + 10] = rz * W; M[o + 11] = 0;
    M[o + 12] = X; M[o + 13] = Y; M[o + 14] = Z; M[o + 15] = 1;
    T.CC[j * 3] = c.r * shade; T.CC[j * 3 + 1] = c.g * shade; T.CC[j * 3 + 2] = c.b * shade;
    T.SW[j] = phase; T.SD[j * 3] = rx * Ww; T.SD[j * 3 + 1] = ry * Ww; T.SD[j * 3 + 2] = rz * Ww; T.WZ[j] = depth;
    T.n++; n++;
  }
  const lerpA = (a, b, t) => { let d = b - a; if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
  const angD = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  // THE SWIMMERS of the schools (cosmetic, the view's own state): per school (keyed by its id) each drawn member's position
  // (sim frame: x east, y north, z depth), velocity, heading and its tail's phase. Each frame a member is pulled toward its place
  // in the school — a critically damped follow (OMEGA) with the school's own velocity fed forward — at no more than a fish's
  // sprint, and turns toward the way it is going at no more than TURN; when barely moving it turns to its own way about the school's
  const OMEGA = 2.2, TURN = 3.5, crews = new Map(), yCrews = new Map();
  let lastT = -1, frame = 0;
  // each single fish's tail phase (rad) by id, advanced by its beat every frame (kept while it is seen; a school's swimmers keep
  // theirs in their crew)
  const PH = new Map();
  const phaseOf = (id, dp) => { let e = PH.get(id); if (!e) { e = { p: (id * 1.7) % TAU, s: 0 }; PH.set(id, e); } e.p = (e.p + dp) % TAU; e.s = frame; return e.p; };
  function crewOf(map, id, m, x, y, z) {
    let c = map.get(id);
    if (!c || c.m !== m) {
      const o = c, P = new Float32Array(m * 3), V = new Float32Array(m * 3), H = new Float32Array(m), Pt = new Float32Array(m), Ph = new Float32Array(m);
      const keep = o ? Math.min(o.m, m) : 0;
      if (o) { P.set(o.P.subarray(0, keep * 3)); V.set(o.V.subarray(0, keep * 3)); H.set(o.H.subarray(0, keep)); Pt.set(o.Pt.subarray(0, keep)); Ph.set(o.Ph.subarray(0, keep)); }
      c = { m, P, V, H, Pt, Ph, ax: o ? o.ax : x, ay: o ? o.ay : y, az: o ? o.az : z, hy: o ? o.hy : 0, fresh: keep, seen: frame, init: !!o };
      map.set(id, c);
    }
    c.seen = frame; return c;
  }
  // one school's members: centre (x, y, z), the school's heading yaw (not a number: it hasn't moved — it keeps the way it faced),
  // member length L, its spread r (m), the deepest a member may go zMax, the seed id, frame dt (s), and the drawing (c colour, D body
  // depth, k shade base, far: the coarse body)
  function swimCrew(c, id, x, y, z, yaw, L, r, zMax, dt, draw, loose = 0) {
    if (!Number.isFinite(yaw)) yaw = c.init ? c.hy : OFF[(id & 1023) * 4 + 3];
    // the school as drawn: its velocity, and a heading that turns at no more than 1.5 rad/s (the members' places turn with it)
    let vax = 0, vay = 0, vaz = 0; const jump = Math.hypot(x - c.ax, y - c.ay) > Math.max(5, 40 * L);
    if (dt > 0 && c.init && !jump) { vax = (x - c.ax) / dt; vay = (y - c.ay) / dt; vaz = (z - c.az) / dt; }
    c.ax = x; c.ay = y; c.az = z;
    if (!c.init || jump) c.hy = yaw; else c.hy += Math.max(-1.5 * dt, Math.min(1.5 * dt, angD(yaw, c.hy)));
    // (scattered individuals: their places don't turn with the group, each wanders farther and slower, and follows gently)
    const ch = loose ? 1 : Math.cos(c.hy), sh = loose ? 0 : Math.sin(c.hy), P = c.P, V = c.V, H = c.H, Pt = c.Pt, Ph = c.Ph, om = loose ? 0.8 : OMEGA, w2 = om * om, w = 2 * om, wan = loose ? 3 : 0.8, wf = loose ? 0.4 : 1;
    const vmax = Math.max(6 * L, 1.6 * Math.hypot(vax, vay)), tSec = draw.t;
    for (let q = 0; q < c.m; q++) {
      const h = ((id * 131 + q * 17) & 1023) * 4, ph = OFF[h + 3];
      // (idle: the way it faces while the school idles — its own, about the school's: ±26° in a school, any way scattered; all
      // facing the school's one way, a still brood lay in parallel rows)
      const idle = c.hy + (ph / Math.PI - 1) * (loose ? Math.PI : 0.45);
      // its place: the slot about the school's centre (in the school's frame), and a slow wander of its own
      const ox = OFF[h] * r + Math.sin(tSec * 0.31 * wf + ph) * wan * L, oy = OFF[h + 1] * r + Math.cos(tSec * 0.27 * wf + ph * 1.3) * wan * L, oz = OFF[h + 2] * r * (loose ? 0.1 : 0.35);
      const tx = x + ox * ch - oy * sh, ty = y + ox * sh + oy * ch, tz = Math.min(zMax, Math.max(0.05, z + oz));
      const i3 = q * 3;
      if (!c.init || jump || q >= c.fresh && !c.init) { P[i3] = tx; P[i3 + 1] = ty; P[i3 + 2] = tz; V[i3] = vax; V[i3 + 1] = vay; V[i3 + 2] = 0; H[q] = idle; Pt[q] = 0; Ph[q] = ph; }
      else if (q >= c.fresh) { P[i3] = x; P[i3 + 1] = y; P[i3 + 2] = tz; V[i3] = vax; V[i3 + 1] = vay; V[i3 + 2] = 0; H[q] = idle; Pt[q] = 0; Ph[q] = ph; }
      else if (dt > 0) {
        let vx = V[i3] + (w2 * (tx - P[i3]) + w * (vax - V[i3])) * dt, vy = V[i3 + 1] + (w2 * (ty - P[i3 + 1]) + w * (vay - V[i3 + 1])) * dt;
        let vz = V[i3 + 2] + (w2 * (tz - P[i3 + 2]) + w * (vaz - V[i3 + 2])) * dt;
        const s = Math.hypot(vx, vy); if (s > vmax) { vx *= vmax / s; vy *= vmax / s; }
        vz = Math.max(-2 * L, Math.min(2 * L, vz));
        V[i3] = vx; V[i3 + 1] = vy; V[i3 + 2] = vz; P[i3] += vx * dt; P[i3 + 1] += vy * dt; P[i3 + 2] = Math.min(zMax, Math.max(0.04, P[i3 + 2] + vz * dt));
        // its body: along its own way when it is going somewhere, its idle way when it idles; a fish turns at ≤ TURN rad/s
        const sp = Math.hypot(vx, vy), want = sp > 0.3 * L ? Math.atan2(vy, vx) : idle;
        H[q] += Math.max(-TURN * dt, Math.min(TURN * dt, angD(want, H[q])));
        Pt[q] += (Math.max(-0.5, Math.min(0.5, -Math.atan2(vz, Math.max(sp, 0.2 * L)))) - Pt[q]) * Math.min(1, 3 * dt);
      }
      // IN THE WATER (its place in the school can reach past the shore — near a bank members were drawn in the bed or on land): one
      // over dry ground or the bare edge is pulled in halfway to the school's centre (a few times at most, else to it), and it swims
      // no deeper than its own bed less half its body
      let mx = P[i3], my = P[i3 + 1], zb = GEO.depthAt(mx, my);
      for (let k = 0; k < 3 && !(zb > 0.05); k++) { mx = P[i3] = (mx + x) / 2; my = P[i3 + 1] = (my + y) / 2; V[i3] *= 0.5; V[i3 + 1] *= 0.5; zb = GEO.depthAt(mx, my); }
      if (!(zb > 0.05)) { mx = P[i3] = x; my = P[i3 + 1] = y; zb = Math.max(0.06, GEO.depthAt(x, y)); }
      const zLim = Math.max(0.04, Math.min(zMax, zb - 0.5 * draw.D)); if (P[i3 + 2] > zLim) { P[i3 + 2] = zLim; if (V[i3 + 2] > 0) V[i3 + 2] = 0; }
      const sp = Math.hypot(V[i3], V[i3 + 1]), mz = P[i3 + 2], sY = surfY(mx, my);
      const Lq = L * (0.9 + 0.2 * (ph / 6.3)), beat = 5 + 20 * Math.min(1, sp / Math.max(1e-3, Lq) / 4);
      Ph[q] = (Ph[q] + beat * dt) % TAU;
      put(mx, sY - mz, -my, H[q], Pt[q], Lq, draw.D, draw.c, draw.k + 0.35 * (ph / 6.3), Ph[q], mz, draw.wr, draw.far);
      shade(mx, -my, H[q], Lq, mz, zb, sY);
    }
    c.init = true; c.fresh = c.m;
  }
  const DRAW = { t: 0, D: 0, c: null, k: 0.8, wr: 0.378, far: false };
  // the surface's height (three's y) over (x, y): each lake's own level, the brook's falling one
  const surfY = (x, y) => { const b = GEO.bodyAt(x, y); return b === UPPER ? 0 : b === LOWER ? LOWER_DY : GEO.levelAt(x, y) - BASE; };
  // place every fish from a snapshot of the sim (render3/fishside3.js packDrawn: per fish [px py pz pyaw ppitch | x y z yaw pitch |
  // L k n spd bed id school bodyMul], per school of young [px py pz | x y z | L k n id bed guarded], the ids as u32 bits): alpha the
  // interpolation between its last two steps, scale the size shown (1 = true), night 0..1 (schools loosen), t the clock (s, for the
  // members' wander), (cx, cy) the camera's place in the sim's frame — the young, a few centimetres long, are drawn only within
  // YOY_NEAR × scale of it — and camY its height (three's y; without it a fish's distance is taken across the water only: nearer,
  // never less detail), pxRad the view's px a radian
  const depthR = KEYS3.map(k => S3[k].sp.depthR);
  // THE BODY'S WIDTH, as a share of its depth (the human, 2026-10-16: "why do all the fish look real thin" — every fish was drawn
  // as flat as a sunfish, 0.38, so the round-bodied ones were needles from above): flat-sided sunfish and white perch, perch and
  // bass between, the near-round suckers, pickerel, dace and minnows, the bullhead about as wide as deep (approximate body
  // sections — Scott & Crossman's descriptions: "laterally compressed", "terete", "round")
  const WIDTH = { sunfish: 0.42, redbreast: 0.45, whiteperch: 0.48, perch: 0.6, bass: 0.6, fallfish: 0.65, killifish: 0.65, dace: 0.8, sucker: 0.85, pike: 0.85, catfish: 1.0, alewife: 0.4 };   // (E8: the alewife a thin, laterally compressed herring)
  const widthR = KEYS3.map(k => WIDTH[k] ?? 0.5);
  let DS = new Float32Array(1024), MS = new Int32Array(1024), OR = new Uint32Array(1024);   // (per agent: its distance, the fish it is drawn as, the order)
  function update(snap, alpha, scale, night, t, cx = 0, cy = 0, sunDir = null, leapAt = null, camY = null, pxRad = PX_RAD) {   // (leapAt(id, t): a fish in a leap — rises3view)
    n = 0; NEAR.n = 0; FAR.n = 0; ns = 0; if (sunDir) sun = sunDir; SHOWN.spread.clear();
    FAR.mesh.layers.mask = mesh.layers.mask;   // (a child keeps its own layers: the far body on the full one's — main3 may move it off the mirror's)
    const dt = lastT < 0 ? 0 : Math.max(0, Math.min(0.1, t - lastT)); lastT = t; frame++; DRAW.t = t;
    const dist = (x, y, z) => Math.max(0.05, Math.sqrt((x - cx) ** 2 + (y - cy) ** 2 + (camY === null ? 0 : (camY + z) ** 2)));
    const B = snap.fish, NF = snap.nf, Bu = new Uint32Array(B.buffer, B.byteOffset, B.length);
    // (first each agent's distance and the fish it is drawn as; past FISH_MAX in all, the nearest are drawn first)
    if (DS.length < NF) { const k = Math.ceil(NF * 1.5); DS = new Float32Array(k); MS = new Int32Array(k); OR = new Uint32Array(k); }
    let want = 0;
    for (let i = 0, o = 0; i < NF; i++, o += FISH_STRIDE) {
      const d = dist(B[o + 5], B[o + 6], B[o + 7]), pxL = B[o + 10] / 100 * scale * pxRad / d, nn = B[o + 12];
      let m = pxL < PX_MIN ? 0 : !B[o + 16] || nn < 1.5 ? 1 : Math.min(MEMBERS_MAX, Math.round(nn));
      if (m > 1 && pxL < PX_FAR) m = Math.min(m, Math.max(32, 2 ** Math.ceil(Math.log2(MEMBERS_MAX * pxL / PX_FAR))));   // (in steps: a crew resized loses no swimmers it keeps)
      DS[i] = d; MS[i] = m; OR[i] = i; want += m;
    }
    const ord = OR.subarray(0, NF); if (want > FISH_MAX) ord.sort((a, b) => DS[a] - DS[b]);
    for (let q = 0; q < NF; q++) {
      const i = ord[q], o = i * FISH_STRIDE, mDraw = MS[i]; if (!mDraw) continue;
      const x = B[o] + (B[o + 5] - B[o]) * alpha, y = B[o + 1] + (B[o + 6] - B[o + 1]) * alpha, z = B[o + 2] + (B[o + 7] - B[o + 2]) * alpha;
      const yaw = lerpA(B[o + 3], B[o + 8], alpha), pitch = B[o + 4] + (B[o + 9] - B[o + 4]) * alpha;
      const Lc = B[o + 10], k = B[o + 11], nn = B[o + 12], spd = B[o + 13], bed = B[o + 14], id = Bu[o + 15], school = B[o + 16], bodyMul = B[o + 17];
      const L = Lc / 100 * scale, D = L * depthR[k] * bodyMul * 1.15, c = tint[k], far = L * pxRad / DS[i] < PX_FAR;
      const beat = 6 + 18 * Math.min(1, spd / Math.max(1e-3, Lc / 100) / 4), sY = surfY(x, y);
      if (!school || nn < 1.5) {
        const lp = leapAt ? leapAt(id, t) : null;   // (leaping at an insect: up out of the water and back — drawn in the air)
        if (lp) { put(lp.x, surfY(lp.x, lp.y) + lp.h, -lp.y, yaw, lp.pitch, L, D, c, 0.85 + 0.3 * OFF[(id & 1023) * 4 + 3] / 6.3, phaseOf(id, beat * 1.5 * dt), -lp.h, widthR[k], far); continue; }
        put(x, sY - z, -y, yaw, pitch, L, D, c, 0.85 + 0.3 * OFF[(id & 1023) * 4 + 3] / 6.3, phaseOf(id, beat * dt), z, widthR[k], far); shade(x, -y, yaw, L, z, bed, sY); continue;
      }
      // a school: its n fish (up to MEMBERS_MAX; fewer far off — its spread kept), each a swimmer (swimCrew), ~3 body lengths apart by
      // day, ~8 at night; flattened
      const sp1 = (3 + 5 * night) * L, r = sp1 * Math.cbrt(Math.min(MEMBERS_MAX, Math.round(nn))) * 0.55;
      DRAW.D = D; DRAW.c = c; DRAW.k = 0.8; DRAW.wr = widthR[k]; DRAW.far = far; SHOWN.spread.set(id, r);
      swimCrew(crewOf(crews, id, mDraw, x, y, z), id, x, y, z, yaw, L, r, Math.max(0.06, bed - 0.04), dt, DRAW);
    }
    // THE YOUNG-OF-YEAR: a school drawn as up to YOY_DRAW of its fish, a loose cloud about it (near the camera only)
    const Y = snap.yoy, NY = snap.ny, Yu = new Uint32Array(Y.buffer, Y.byteOffset, Y.length), near2 = (YOY_NEAR * scale) ** 2;
    for (let i = 0, o = 0; i < NY; i++, o += YOY_STRIDE) {
      if ((Y[o + 3] - cx) ** 2 + (Y[o + 4] - cy) ** 2 > near2) continue;
      const x = Y[o] + (Y[o + 3] - Y[o]) * alpha, y = Y[o + 1] + (Y[o + 4] - Y[o + 1]) * alpha, z = Y[o + 2] + (Y[o + 5] - Y[o + 2]) * alpha, sY = surfY(x, y);
      const Lc = Y[o + 6], k = Y[o + 7], nn = Y[o + 8], id = Yu[o + 9], bed = Y[o + 10];
      // how the young of each kind keep together (Keast 1980; Scott & Crossman): perch, white perch, suckers, fallfish, killifish
      // and dace in SCHOOLS; smallmouth, bullhead and redbreast fry in a tight BALL while a parent guards them; settled sunfish
      // (past their open-water larval weeks), bass and bullheads after their parents leave, and pickerel SCATTERED — each a loose
      // individual in the weeds
      const kk = KEYS3[k], guarded = Y[o + 11] > 0, Lr = Lc / 100;
      const mode = guarded ? 'ball' : kk === 'pike' || ((kk === 'sunfish' || kk === 'redbreast') && Lc >= 1.8) || ((kk === 'bass' || kk === 'catfish') && Lc >= 2.5) ? 'scatter' : 'school';
      const L = Lr * scale, pxL = L * pxRad / dist(x, y, z); if (pxL < PX_MIN) continue;
      const D = L * depthR[k] * 1.15, c = tint[k], m = Math.min(YOY_DRAW, Math.max(1, Math.round(nn)));
      const r = mode === 'ball' ? Math.max(0.04, 1.5 * L * Math.cbrt(m)) : mode === 'scatter' ? Math.max(1.5, 40 * L) : Math.max(0.15, 6 * L) * (1 + night);
      // the young school's heading: the way it is going (its last step) — one that barely moved keeps the way it faced (swimCrew;
      // atan2 of no move is east, and every still brood faced east) — its members swimmers like the adults'
      const dx = Y[o + 3] - Y[o], dy = Y[o + 4] - Y[o + 1], yaw = dx * dx + dy * dy > (0.05 * Lr) ** 2 ? Math.atan2(dy, dx) : NaN;
      DRAW.D = D; DRAW.c = c; DRAW.k = 0.75; DRAW.wr = widthR[k]; DRAW.far = pxL < PX_FAR; SHOWN.spread.set(id, r);
      swimCrew(crewOf(yCrews, id, m, x, y, z), id + 7919, x, y, z, yaw, L, r, Math.max(0.06, bed - 0.02), dt, DRAW, mode === 'scatter' ? 1 : 0);
    }
    // (schools gone — eaten, merged, out of sight — leave their swimmers behind after a few seconds; fish their tail's phase)
    if ((frame & 127) === 0) { for (const map of [crews, yCrews]) for (const [key, c] of map) if (frame - c.seen > 240) map.delete(key); for (const [key, e] of PH) if (frame - e.s > 240) PH.delete(key); }
    // (each buffer sent only as far as it is used: flagged whole, all FISH_MAX slots went to the GPU every frame — ~4 MB)
    for (const T of [NEAR, FAR]) {
      T.mesh.count = T.n; if (!T.n) continue;
      for (const [b, k] of [[T.mesh.instanceMatrix, 16], [T.mesh.instanceColor, 3], [T.swim, 1], [T.side, 3], [T.wz, 1]]) { b.clearUpdateRanges(); b.addUpdateRange(0, T.n * k); b.needsUpdate = true; }
    }
    shadow.count = ns;
    if (ns) { shadow.instanceMatrix.clearUpdateRanges(); shadow.instanceMatrix.addUpdateRange(0, ns * 16); shadow.instanceMatrix.needsUpdate = true; sha.clearUpdateRanges(); sha.addUpdateRange(0, ns); sha.needsUpdate = true; }
    return n;
  }
  return { mesh, shadow, update };
}
