// shallows3view.js — the small life of the lakes' shallows and their edge on screen (browser layer): the HERPS of the sim (src/w3/
// herps3.js; config HERP3 and fish3 WILD3's snapping turtle and bullfrog rows) — painted turtles, snapping turtles, green and mink frogs,
// bullfrogs, red-spotted newts — the TADPOLES (herps3's cohorts per bed cell: this year's and last year's green and mink frogs', the
// bullfrogs' three, each its mean size), the DRAGONFLIES and DAMSELFLIES over the weeds in summer, and what the turtles bask on: the
// shore's FALLEN TREES (plants3's wood along the forested bank) and the boulders of the rocky shallows (the bed's substrate map).
// AT THE REAL NUMBERS NEAR THE CAMERA, as the crayfish (bed3view.js): each 1.5-m cell near where the view looks gets its real number of
// each — painted turtles 10 a hectare of the water under 2 m (HERP3 painted), snappers 1 a hectare (WILD3 snapper), green and mink
// frogs 0.3 a metre of vegetated shore (HERP3 frog), bullfrogs 10 a km of shore (WILD3 bullfrog), newts 300 a hectare to 1.5 m (HERP3
// newt), the tadpoles their cohorts' g/m² ÷ their mean mass — when the sim has them out (herps3 n: none under full ice, none out of their
// season; the tadpoles all year, under the ice too). The painted turtles BASK on the logs and boulders on sunny warm days, gathered from
// the shallows about them, and slide off when the camera comes close; the frogs sit at the water's edge and jump in; the newts creep
// through the weeds and rise to gulp air; the snappers walk the bed; the tadpoles wriggle on the shallow bed. The dragonflies (darners
// patrolling, the bluets hovering low over the pads and reeds) fly June to mid-September by day in warm dry weather, over the weed beds
// as the weeds' fauna (their nymphs among it — littoral3) is rich, and one hovers where rises3view's smallmouth leap. Cosmetic places and
// motion: a hash and Math.random (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, LAND, cellIndex } from '../geometry.js';
import { HERP3 } from '../../config.js';
import { WILD3 } from '../fish3.js';
import { shape, partMesh, frame, part, surfY, hash, rnd, clamp, angD, col, places } from './wild3kit.js';
import { waterOut } from './water3.js';
const { attribute, positionLocal, positionGeometry, positionWorld, sin, time, float, max: tmax } = THREE.TSL;

const LAYER = 2, TAU = Math.PI * 2;
const A = GEO.CELL * GEO.CELL;   // m² a 1.5-m cell (the true lakes' 5-m cells: their area's worth)
// (the forested bank's weight, as littoral3 FOREST: forest 1, shrubs and marsh 0.5, open 0.2)
const BANKW = GEO.CLASSES.map(k => ({ evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.5, shrub: 0.5, emergent_wet: 0.5 })[k] ?? 0.2);
const FORESTED = GEO.CLASSES.map(k => ({ evergreen: 1, mixed: 1, deciduous: 1, woody_wet: 1, shrub_wet: 0.4 })[k] ?? 0);

// ---------- the bodies ----------
const PAINT_C = [col(0x262a1e), col(0xc8a83a), col(0x9a3a1a), col(0x1c1e16)], SNAP_C = [col(0x2e2c22), col(0x4a4636), col(0x5a5a3a), col(0x141210)];
const GREEN_C = [col(0x5a7a3a), col(0xe0dcc0), col(0xc8a840), col(0x3a2a1a)], MINKF_C = [col(0x46602c), col(0xd8d0a8), col(0xb89a40), col(0x2a2416)], BULL_C = [col(0x4a5e2e), col(0xe8e4c8), col(0xb89a40), col(0x3a3020)];
const NEWT_C = [col(0x5a6a2a), col(0xd8b030), col(0xd03020), col(0x2a2a18)];
const LOG_C = [col(0x6a5e50), col(0x4a4036), col(0x3a4a2a)], ROCK_C = [col(0x5a5650), col(0x6a6458), col(0x3e4a30)];
const DARNER_C = [col(0x3a7a4a), col(0x2a5aa8), col(0x2a4a8a), col(0x111111)], BLUET_C = [col(0x3a8ad0), col(0x3a8ad0), col(0x1a3a6a), col(0x101010)], WING_C = [col(0xdfe8ee), col(0xa0a8a0)];
function paintedGeo() {
  const S = shape();
  S.ell([0, 0.026, 0], [0.075, 0.03, 0.06], s => s[1] > 0.15 ? 'A' : s[1] > -0.3 ? 'C' : 'B', { w: 10, h: 6 });
  S.tube([[0.055, 0.016, 0], [0.085, 0.022, 0]], [0.011, 0.01], (t, a) => Math.floor((a / TAU) * 8) % 2 ? 'B' : 'D', 8);
  S.ell([0.095, 0.024, 0], [0.019, 0.014, 0.014], (s) => Math.abs(s[2]) > 0.6 && s[1] > -0.3 ? 'B' : 'D', { w: 6, h: 4 });
  for (const [x, z] of [[0.045, 1], [0.045, -1], [-0.045, 1], [-0.045, -1]]) S.ell([x, 0.008, z * 0.058], [0.018, 0.007, 0.012], s => s[0] > 0.3 ? 'C' : 'D', { w: 5, h: 3 });
  S.tube([[-0.07, 0.015, 0], [-0.095, 0.01, 0]], [0.006, 0.001], 'D', 4);
  return S.done();
}
function snapperGeo() {
  const S = shape();
  S.ell([0, 0.06, 0], [0.19, 0.07, 0.16], s => s[1] > 0.6 ? 'C' : 'A', { w: 10, h: 6 });
  for (const z of [-0.06, 0, 0.06]) for (let k = 0; k < 4; k++) S.ell([-0.12 + k * 0.08, 0.12 + (z ? -0.012 : 0), z], [0.022, 0.018, 0.014], 'A', { w: 4, h: 3 });
  S.tube([[0.15, 0.05, 0], [0.22, 0.05, 0]], [0.045, 0.04], 'B', 7);
  S.ell([0.27, 0.05, 0], [0.065, 0.045, 0.052], 'B', { w: 8, h: 5 }); S.tube([[0.31, 0.04, 0], [0.335, 0.015, 0]], [[0.02, 0.025], 0.004], 'D', 5);
  for (const z of [-1, 1]) S.ell([0.3, 0.07, z * 0.035], [0.008, 0.008, 0.005], 'D', { w: 4, h: 3 });
  S.tube([[-0.17, 0.05, 0], [-0.3, 0.04, 0], [-0.45, 0.015, 0]], [0.04, 0.03, 0.005], 'B', 6);
  for (let k = 0; k < 5; k++) S.tube([[-0.2 - k * 0.05, 0.07 - k * 0.006, 0], [-0.21 - k * 0.05, 0.095 - k * 0.01, 0]], [0.012, 0.001], 'B', 4, false);
  for (const [x, z] of [[0.11, 1], [0.11, -1], [-0.1, 1], [-0.1, -1]]) S.ell([x, 0.02, z * 0.15], [0.045, 0.022, 0.035], 'B', { w: 6, h: 4 });
  return S.done();
}
function frogGeo() {   // a green frog sitting (snout +x, ~8 cm); bullfrogs and mink frogs scaled
  const S = shape();
  S.ell([0, 0.02, 0], [0.036, 0.018, 0.024], s => s[1] < -0.3 ? 'B' : 'A', { w: 8, h: 6, rot: [0, 0, 0.25] });
  S.ell([0.03, 0.026, 0], [0.021, 0.013, 0.02], s => s[1] < -0.4 ? 'B' : 'A', { w: 8, h: 5 });
  for (const z of [-1, 1]) {
    S.ell([0.034, 0.038, z * 0.012], [0.0075, 0.0075, 0.0075], 'C', { w: 5, h: 4 }); S.ell([0.038, 0.04, z * 0.016], [0.003, 0.004, 0.003], 'K', { w: 4, h: 3 });
    S.ell([0.022, 0.028, z * 0.0195], [0.007, 0.007, 0.002], 'D', { w: 5, h: 3 });
    S.tube([[-0.024, 0.012, z * 0.016], [0.006, 0.012, z * 0.038], [-0.028, 0.003, z * 0.045], [-0.05, 0.002, z * 0.05]], [0.009, 0.007, 0.005, 0.004], (t) => Math.floor(t * 6) % 2 ? 'D' : 'A', 5);
    S.tube([[0.02, 0.012, z * 0.016], [0.03, 0.002, z * 0.024]], [0.005, 0.004], 'A', 4);
  }
  return S.done();
}
function newtGeo() {   // a red-spotted newt (~9 cm): olive, the belly yellow, red spots down each side
  const S = shape();
  S.tube([[-0.05, 0.006, 0], [-0.02, 0.008, 0], [0.015, 0.008, 0], [0.032, 0.007, 0]], [0.004, 0.0065, 0.0065, 0.005], (t, a) => Math.cos(a) < -0.4 ? 'B' : 'A', 6);
  S.tube([[-0.05, 0.006, 0], [-0.09, 0.0075, 0]], [[0.0025, 0.007], [0.0005, 0.0015]], 'A', 4);
  S.ell([0.042, 0.007, 0], [0.011, 0.005, 0.0065], 'A', { w: 6, h: 4 });
  for (const z of [-1, 1]) { for (let k = 0; k < 3; k++) S.ell([-0.025 + k * 0.017, 0.0105, z * 0.0045], [0.0022, 0.0015, 0.0022], 'C', { w: 4, h: 3 }); for (const x of [0.02, -0.03]) S.tube([[x, 0.005, z * 0.005], [x + 0.004, 0.0, z * 0.013]], [0.002, 0.0015], 'A', 3, false); }
  return S.done();
}
function logGeo() {   // a fallen tree: a trunk along +x (0 → 1, radius 1), a few broken limbs
  const S = shape();
  S.tube([[0, 0, 0], [0.5, 0, 0], [1, 0, 0]], [1, 0.85, 0.55], (t, a) => Math.cos(a) > 0.6 && t > 0.2 ? 'C' : (Math.floor(a * 3 + t * 7) % 3 ? 'A' : 'B'), 7);
  for (const [t, a, l] of [[0.3, 0.9, 2.2], [0.55, -1.1, 1.8], [0.75, 0.6, 1.4], [0.85, -0.4, 1.2]]) S.tube([[t, 0, 0], [t + 0.05, Math.sin(a) * l * 0.3, Math.cos(a) * l * 0.35]], [0.35, 0.15], 'B', 4, false);
  S.ell([-0.03, -0.4, 0], [0.04, 2.0, 2.3], 'B', { w: 8, h: 5, rot: [0, 0, 0.25] });   // (the root plate torn up from the bank)
  return S.done();
}
function rockGeo() { const S = shape(); S.ell([0, 0, 0], [0.5, 0.42, 0.45], s => s[1] > 0.55 ? 'B' : s[1] < -0.2 ? 'C' : 'A', { w: 7, h: 5 }); return S.done(); }
function flyGeo(L, darner) {   // a dragonfly (darner, L m) or a damselfly (bluet): thorax, the long abdomen, the eyes
  const S = shape();
  S.ell([0.1 * L, 0, 0], [0.1 * L, 0.06 * L, 0.06 * L], 'A', { w: 6, h: 4 });
  S.tube([[0.02 * L, 0, 0], [-0.4 * L, 0.005 * L, 0], [-0.82 * L, 0.0, 0]], darner ? [0.035 * L, 0.03 * L, 0.025 * L] : [0.025 * L, 0.02 * L, 0.02 * L], (t) => Math.floor(t * 10) % 2 ? 'B' : (darner ? 'D' : 'B'), 5);
  S.ell([0.21 * L, 0.012 * L, 0], [0.04 * L, 0.05 * L, 0.075 * L], 'C', { w: 6, h: 4 });
  return S.done();
}
function wingsGeo(L, darner) {   // the four wings, about the thorax (+z right); held flat (dragonfly) or folded up over the back (damselfly)
  const S = shape(), sp = darner ? 0.62 * L : 0.6 * L, ch = darner ? 0.14 * L : 0.08 * L;
  for (const z of [-1, 1]) for (const [x0, k] of [[0.13 * L, 1], [0.04 * L, 0.95]]) S.quad([x0, 0.04 * L, z * 0.03 * L], [x0 + ch * 0.3, 0.04 * L, z * sp * k], [x0 - ch * 0.7, 0.04 * L, z * sp * k * 0.97], [x0 - ch, 0.04 * L, z * 0.03 * L], 'A', true);
  return S.done();
}
function tadpoleMesh(cap) {   // unit length (snout +0.5): a round body, a flat fin tail; wriggling by the shader (the fish's travelling wave)
  const S = shape();
  S.ell([0.24, 0, 0], [0.24, 0.16, 0.18], s => s[1] < -0.3 ? 'B' : 'A', { w: 8, h: 5 });
  S.quad([0.05, 0.08, 0], [-0.5, 0.0, 0], [-0.5, -0.01, 0], [0.05, -0.08, 0], 'A', true);
  S.tube([[0.08, 0, 0], [-0.45, 0, 0]], [0.06, 0.008], 'A', 5, false);
  const g = S.done(), dyn = (n, k) => new THREE.InstancedBufferAttribute(new Float32Array(n * k), k);
  g.setAttribute('swim', dyn(cap, 2)); g.setAttribute('side', dyn(cap, 3)); g.setAttribute('sy', dyn(cap, 1));
  const mat = new THREE.MeshStandardNodeMaterial({ roughness: 0.6, side: THREE.DoubleSide });
  const sw = attribute('swim', 'vec2'), px = positionGeometry.x, back = tmax(float(0), float(0.15).sub(px));
  const wave = sin(time.mul(sw.x).add(sw.y).add(px.mul(9))).mul(back.mul(back)).mul(1.1);
  mat.positionNode = positionLocal.add(attribute('side', 'vec3').mul(wave));
  // (the palette's back and belly as a shade; each tadpole's colour is its instance colour, which three multiplies in)
  const w = attribute('pal', 'vec4'); mat.colorNode = THREE.TSL.vec3(1, 1, 1).mul(w.x.mul(0.85).add(w.y.mul(1.3)).add(0.15));
  mat.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y));
  const mesh = new THREE.InstancedMesh(g, mat, cap); mesh.count = 0; mesh.frustumCulled = false; mesh.layers.set(LAYER); mesh.visible = false;
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
  return mesh;
}

// plants: render3/plants3view.js (its fine cells' map onto the bed cells, the weed cover per 1.5-m cell); colAt: the water model's
// column at (x, y); ripple: risesView's rings; groundY(x, y) (optional): the ground or the lake's bed as main3 draws it (three's y) —
// without it a frog on the bank sits at the water's level
export function makeShallowsView({ plants, colAt, ripple, groundY = null }) {
  const group = new THREE.Group(), PARTS = [], PL = places();
  const pm = (geo, cap, o = {}, still = false) => { const p = partMesh(geo, cap, { layer: LAYER, ...o }); if (!still) PARTS.push(p); group.add(p.mesh); return p; };
  // (the shore cells that may hold a fallen tree — placeLogs' test without the sim's wood, which only thins them: the logs' mesh holds
  // every one — the true lakes' ~1,200 too — so none is dropped while its basking places stay)
  const logCell = (S, o) => { const i = cellIndex(S[o], S[o + 1]), li = cellIndex(S[o] + S[o + 2] * GEO.CELL, S[o + 1] + S[o + 3] * GEO.CELL); if (i < 0 || li < 0) return -1; const f = FORESTED[GEO.cover[li]] || 0; return f > 0 && !(hash(i, 401) > f * GEO.CELL / 12) ? i : -1; };
  let LOG_CAP = 0; for (const b of [1, 2]) for (let o = 0; o < PL.shore[b].length; o += 4) if (logCell(PL.shore[b], o) >= 0) LOG_CAP++;
  // (the logs and the boulders are still: put once when placed, not sent again each frame)
  const P = { painted: pm(paintedGeo(), 400), snapper: pm(snapperGeo(), 40), frog: pm(frogGeo(), 600), newt: pm(newtGeo(), 400), log: pm(logGeo(), Math.max(1, LOG_CAP), { layer: 0 }, true), rock: null,
    // (the wings: thin sheets back to back, one-sided — one layer seen at a time; drawn after the water's surface when the eye is above it)
    darner: pm(flyGeo(0.075, true), 80), bluet: pm(flyGeo(0.036, false), 300), dWing: pm(wingsGeo(0.075, true), 80, { opacity: 0.4, water: false }), bWing: pm(wingsGeo(0.036, false), 300, { opacity: 0.4, water: false }) };
  const TAD_MAX = 8000, tad = tadpoleMesh(TAD_MAX); group.add(tad);
  const fineI = plants.fine, nb = plants.nb, blend = plants.blend, nF = fineI.length;
  const FX = new Float32Array(nF), FY = new Float32Array(nF); for (let t = 0; t < nF; t++) { const c = GEO.cellCentre(fineI[t]); FX[t] = c[0]; FY[t] = c[1]; }   // (the cells' centres, once: the rebuilds scan them all)
  // ---------- the static things: the fallen trees and the boulders (their places once; their heights with the water's) ----------
  const LOGS = [], ROCKS = [], Mf = new THREE.Matrix4(), Mp = new THREE.Matrix4(), V3 = new THREE.Vector3(), C1 = new THREE.Color();
  {   // boulders: in the rocky shallows (substrate rock ≥ 0.45, the bed 5–40 cm), about one in six such cells
    for (const b of [1, 2]) for (const i of PL.water[b]) {
      if (GEO.depth[i] < 0.05 || GEO.depth[i] > 0.4 || !GEO.subData || GEO.subData.rock[i] < 115 || hash(i, 301) > 0.17 * Math.min(1, A / 2.25)) continue;
      const [cx, cy] = GEO.cellCentre(i), x = cx + (hash(i, 303) - 0.5) * GEO.CELL, y = cy + (hash(i, 305) - 0.5) * GEO.CELL, r = 0.3 + 0.35 * hash(i, 307), d = GEO.depthAt(x, y); if (!(d > 0.03)) continue;
      // (drawn: its centre 0.3 r over the bed, 0.462 r high (rockGeo's 0.42 × 1.1) — its top 0.762 r − d over the water; a third or so
      // are awash or under, and give no basking place)
      ROCKS.push({ x, y, r, d, rot: hash(i, 309) * TAU, top: 0.762 * r - d });
    }
    P.rock = pm(rockGeo(), Math.max(1, ROCKS.length), { layer: 0 }, true);   // (room for every one: ~50 on the 1/10 lakes, ~560 on the true)
    for (const R of ROCKS) { const sY = surfY(R.x, R.y); frame(Mf, R.x, sY - R.d + R.r * 0.3, -R.y, R.rot, 0, 0, 1); Mf.scale(V3.set(R.r * 2, R.r * 1.1, R.r * 1.7)); P.rock.put(Mf, ROCK_C, sY); }
    P.rock.end();
  }
  function placeLogs(wood) {   // where the bank is wooded and the sim keeps fallen wood (plants3 wood per column): one per ~12 m of shore
    LOGS.length = 0;
    for (const b of [1, 2]) { const S = PL.shore[b];
      for (let o = 0; o < S.length; o += 4) {
        const x0 = S[o], y0 = S[o + 1], nx = S[o + 2], ny = S[o + 3], i = logCell(S, o); if (i < 0 || LOGS.length >= P.log.cap) continue;
        const c = colAt(x0, y0), w = c >= 0 && wood ? wood[c] : 0;
        if (!(w > 0)) continue;
        // from the bank (its root plate at the waterline) out into the water, a little across the shore's normal, its top end sunk
        const a = Math.atan2(-ny, -nx) + (hash(i, 403) - 0.5) * 1.2, L = 3 + 5 * hash(i, 405), r = 0.12 + 0.12 * hash(i, 407);
        const xs = x0 + nx * GEO.CELL * 0.4, ys = y0 + ny * GEO.CELL * 0.4, xe = xs + Math.cos(a) * L, ye = ys + Math.sin(a) * L, de = GEO.bodyAt(xe, ye) === LAND ? 0 : Math.max(0, GEO.depthAt(xe, ye));
        LOGS.push({ xs, ys, a, L, r, drop: Math.min(de, L * 0.25) + r * 0.3, rise: 0.12 + 0.15 * hash(i, 409), roll: hash(i, 411) * TAU, tint: 0.75 + 0.5 * hash(i, 413) });
      }
    }
    for (const L of LOGS) {   // (put once: still)
      const sY = surfY(L.xs, L.ys); C1.set(0).copy(LOG_C[0]).multiplyScalar(L.tint);
      frame(Mf, L.xs, sY + L.rise, -L.ys, L.a, -Math.atan2(L.rise + L.drop, L.L), L.roll, 1); Mf.scale(V3.set(L.L, L.r, L.r));
      P.log.put(Mf, [C1, LOG_C[1], LOG_C[2]], sY);
    }
    P.log.end();
  }
  // THE TOP OF A BASKING PLACE over its water (spot.base), off m along it: a log's — its trunk tilted down from the bank (its axis
  // rise − (rise + drop)·s at s of its length across the ground), tapering (radius 1 → 0.85 → 0.55 of r along it, logGeo), its 7-sided
  // section's top ~0.95 r, seen upright through the tilt (1/cos); a boulder's — its ellipsoid's crown, lower off its middle
  const logR = t => t < 0.5 ? 1 - 0.3 * t : 0.85 - 0.6 * (t - 0.5);
  function spotTop(sp, off) {
    if (sp.log) { const L = sp.L, k = (L.rise + L.drop) / L.L, c = 1 / Math.sqrt(1 + k * k), s = sp.s + off / L.L; return L.rise - (L.rise + L.drop) * s + L.r * 0.95 * logR(clamp(s / c, 0, 1)) / c; }
    const R = sp.R, u = off / R.r; return -R.d + 0.3 * R.r + 0.462 * R.r * Math.sqrt(Math.max(0, 1 - u * u));
  }
  // basking places: along each log where its top is a hand's height above the water — 0.7 m apart, each with three turtles' room
  // (slots at −0.22, 0, +0.22 m along it) — and atop each boulder clear of the water (two, at ±0.11 m)
  const baskSpots = [];
  function placeSpots() {
    baskSpots.length = 0;
    for (const L of LOGS) for (let s = 0.15; s < 0.9; s += Math.max(0.08, 0.7 / L.L)) {
      const x = L.xs + Math.cos(L.a) * L.L * s, y = L.ys + Math.sin(L.a) * L.L * s, sp = { x, y, base: surfY(L.xs, L.ys), yaw: L.a, log: true, L, s, occ: 0 }; sp.top = spotTop(sp, 0);
      if (GEO.bodyAt(x, y) !== LAND && sp.top > 0.03 && sp.top < 0.45) baskSpots.push(sp);
    }
    for (const R of ROCKS) if (R.top > 0.03) { const sp = { x: R.x, y: R.y, base: surfY(R.x, R.y), yaw: R.rot, log: false, R, occ: 0 }; sp.top = spotTop(sp, 0); baskSpots.push(sp); }
  }
  // (off a log or a rock into the water: a log's side — across it — toward the deeper water; a boulder's any way that is deeper)
  function slideDir(sp, x, y) {
    let best = sp.yaw + Math.PI / 2, bd = -1e9; const n = sp.log ? 2 : 8;
    for (let k = 0; k < n; k++) { const e = sp.log ? sp.yaw + (k ? -1 : 1) * Math.PI / 2 : k * TAU / n, qx = x + Math.cos(e) * 0.5, qy = y + Math.sin(e) * 0.5, d = GEO.bodyAt(qx, qy) === LAND ? -1 : GEO.depthAt(qx, qy); if (d > bd) { bd = d; best = e; } }
    return best;
  }
  // ---------- the sim's state ----------
  let herp = null, tadA = null, fauna = null, wood = null, yf = 0, dirty = false, logsDirty = false, at = [1e9, 1e9, 1];
  function setData(h, tadArr, faunaArr, woodArr, yf0) {
    herp = h; yf = yf0;
    if (tadArr && tadArr.length === nb * 5) tadA = tadArr; if (faunaArr && faunaArr.length === nb) fauna = faunaArr;
    if (woodArr && !wood) { wood = woodArr; logsDirty = true; }
    dirty = true;
  }
  // ---------- who is near (rebuilt on new data or when the view has moved on) ----------
  let T = [], SN = [], FR = [], NW = [], OD = [];   // turtles, snappers, frogs (all three kinds), newts, odonates
  const victims = [];   // the damselflies a leaping bass takes (rises3view)
  // (each animal keeps its state — basking, jumped in — while the view moves: kept by its place's key between rebuilds)
  const KEEP = new Map(); let gen = 0;
  const keep = (key, make) => { let o = KEEP.get(key); if (!o) { o = make(); KEEP.set(key, o); } o.gen = gen; return o; };
  function rebuild(tx, ty, dist, S) {
    dirty = false; at = [tx, ty, dist]; T = []; SN = []; FR = []; NW = []; OD = []; gen++;
    const n = herp && herp.n ? herp.n : {}, on = !!herp && HERP3.ON;
    const R_T = clamp(dist * 1.3, 25, 90), R_F = clamp(dist * 0.9, 12, 40), R_N = 12, R_TAD = 10, R_OD = clamp(dist * 0.8, 12, 30);
    const near = (x, y, r) => (x - tx) ** 2 + (y - ty) ** 2 <= r * r;
    if (on && dist < 160) for (let t = 0; t < nF; t++) {
      const i = fineI[t], x0 = FX[t], y0 = FY[t]; if (!near(x0, y0, R_T)) continue;
      const z = GEO.depth[i];
      // painted turtles: 10 /ha of the water under 2 m (each cell its expected share, drawn by its hash)
      if (n.painted > 0 && z <= HERP3.painted.z && hash(i, 501) < HERP3.painted.perHa / 1e4 * A) T.push(keep('p' + i, () => ({ hx: x0 + (hash(i, 503) - 0.5) * GEO.CELL, hy: y0 + (hash(i, 505) - 0.5) * GEO.CELL, id: i, k: 0.75 + 0.45 * hash(i, 507), mode: 'swim', mt: 5, ph: hash(i, 509) * 9, fresh: true })));
      // snapping turtles: 1 /ha of the water to 3 m (WILD3 snapper: its bed to 2–4 m), in its season
      if (n.snapper > 0 && z <= 3 && hash(i, 521) < WILD3.snapper.perHa / 1e4 * A) SN.push(keep('s' + i, () => ({ hx: x0, hy: y0, yaw: hash(i, 523) * TAU, k: 0.8 + 0.4 * hash(i, 525), id: i, peri: hash(i, 527) < 0.15, ph: hash(i, 529) * 9 })));
    }
    if (on && dist < 90) {   // the shore's frogs: green and mink frogs 0.3 a metre of vegetated shore, bullfrogs 10 a km
      for (const b of [1, 2]) { const Sh = PL.shore[b];
        for (let o = 0; o < Sh.length; o += 4) {
          const x0 = Sh[o], y0 = Sh[o + 1]; if (!near(x0, y0, R_F)) continue;
          const i = cellIndex(x0, y0), li = cellIndex(x0 + Sh[o + 2] * GEO.CELL, y0 + Sh[o + 3] * GEO.CELL), w = li >= 0 ? BANKW[GEO.cover[li]] : 0.2, m = GEO.CELL * 0.8;
          const nf = n.frog > 0 ? HERP3.frog.perM * m * w : 0, nbf = n.bullfrog > 0 ? WILD3.bullfrog.perKm / 1000 * m : 0;
          for (let k = 0; k < 3; k++) {
            if (hash(i, 541 + k) < nf - k) FR.push(keep('f' + i + ':' + k, () => {   // at the waterline: on the bank's edge, or in the shallows among the plants (a mink frog on the pads)
              const mink = hash(i, 551 + k) < 0.35, out = mink ? 0.5 + 2 * hash(i, 553 + k) : -0.3 + 0.6 * hash(i, 555 + k), [x, y] = atEdge(x0, y0, Sh[o + 2], Sh[o + 3], (hash(i, 561 + k) - 0.5) * GEO.CELL, out), wd = Math.atan2(-Sh[o + 3], -Sh[o + 2]);
              return { x, y, wd, yaw: wd + (hash(i, 557 + k) - 0.5) * 1.6, kind: mink ? 'mink' : 'green', k: mink ? 0.8 : 1, C: mink ? MINKF_C : GREEN_C, mode: 'sit', mt: 0, ph: hash(i, 559 + k) * 9 };
            }));
          }
          if (hash(i, 581) < nbf) FR.push(keep('b' + i, () => { const [x, y] = atEdge(x0, y0, Sh[o + 2], Sh[o + 3], (hash(i, 589) - 0.5) * GEO.CELL, 0.8 + 2.7 * hash(i, 583)); return { x, y, wd: Math.atan2(-Sh[o + 3], -Sh[o + 2]), yaw: hash(i, 585) * TAU, kind: 'bull', k: 1.9, C: BULL_C, mode: 'sit', mt: 0, ph: hash(i, 587) * 9 }; }));
        }
      }
    }
    if (on && n.newt > 0 && dist < 40) for (let t = 0; t < nF; t++) {   // newts: 300 /ha of the water to 1.5 m
      const i = fineI[t], x0 = FX[t], y0 = FY[t]; if (!near(x0, y0, R_N) || GEO.depth[i] > HERP3.newt.z) continue;
      const m = HERP3.newt.perHa / 1e4 * A; for (let k = 0; k < 3; k++) if (hash(i, 601 + k) < m - k) NW.push(keep('n' + i + ':' + k, () => ({ hx: x0 + (hash(i, 611 + k) - 0.5) * GEO.CELL, hy: y0 + (hash(i, 621 + k) - 0.5) * GEO.CELL, id: i, yaw: hash(i, 631 + k) * TAU, ph: hash(i, 641 + k) * 50, k: 0.8 + 0.4 * hash(i, 651 + k) })));
    }
    // THE TADPOLES: each cohort's tadpoles per m² (g wet/m² ÷ its mean mass), at their size (~4.6 cm × W^⅓ g), on the shallow bed
    let nt = 0;
    if (tadA && herp && herp.tadW && dist < 40) {
      const W = herp.tadW, Lc = W.map(w => Math.min(14, 4.6 * Math.cbrt(Math.max(1e-3, w))) / 100), sw = tad.geometry.attributes.swim.array, sd = tad.geometry.attributes.side.array, SY = tad.geometry.attributes.sy.array, IC = tad.instanceColor.array;
      const cG = col(0x4a4428), cB = col(0x48552a), c = new THREE.Color();
      for (let t = 0; t < nF && nt < TAD_MAX; t++) {
        const i = fineI[t], x0 = FX[t], y0 = FY[t]; if (!near(x0, y0, R_TAD)) continue;
        for (let q = 0; q < 5 && nt < TAD_MAX; q++) {
          const g = blend(tadA, t, 5, q); if (!(g > 0)) continue;
          const m = Math.min(30 * A / 2.25, Math.floor(g / Math.max(1e-3, W[q]) * A + hash(i, 701 + q)));
          for (let k = 0; k < m && nt < TAD_MAX; k++) {
            const x = x0 + (hash(i, k * 7 + 711 + q) - 0.5) * GEO.CELL, y = y0 + (hash(i, k * 7 + 713 + q) - 0.5) * GEO.CELL, z = GEO.depthAt(x, y); if (!(z > 0.04)) continue;
            const L = Lc[q] * (0.8 + 0.4 * hash(i, k + 721 + q)), yaw = hash(i, k + 731) * TAU, sY = surfY(x, y), up = hash(i, k + 741) < 0.15 ? z * hash(i, k + 743) : 0;
            frame(Mf, x, sY - z + L * 0.12 + up, -y, yaw, 0, 0, 1); Mf.scale(V3.set(L, L, L)); tad.setMatrixAt(nt, Mf);
            const rx = Math.sin(yaw), rz = Math.cos(yaw);   // (its right side, three's frame: the sim's (sin, −cos) → three (sin, cos)… the side to wave along)
            sd[nt * 3] = rx * L * 0.25; sd[nt * 3 + 1] = 0; sd[nt * 3 + 2] = rz * L * 0.25; sw[nt * 2] = 7 + 6 * hash(i, k + 751); sw[nt * 2 + 1] = hash(i, k + 753) * 9; SY[nt] = sY;
            c.copy(q < 2 ? cG : cB).multiplyScalar(0.75 + 0.5 * hash(i, k + 761)); IC[nt * 3] = c.r; IC[nt * 3 + 1] = c.g; IC[nt * 3 + 2] = c.b; nt++;
          }
        }
      }
    }
    tad.count = nt; tad.visible = nt > 0;
    if (nt) { for (const [b, k] of [[tad.instanceMatrix, 16], [tad.instanceColor, 3], [tad.geometry.attributes.swim, 2], [tad.geometry.attributes.side, 3], [tad.geometry.attributes.sy, 1]]) { b.clearUpdateRanges(); b.addUpdateRange(0, nt * k); b.needsUpdate = true; } }
    // THE DRAGONFLIES AND DAMSELFLIES over the weeds: June – mid-September, by day, warm and dry; damselflies to ~0.3 a m² of a full
    // stand's edge, darners a tenth of that, more where the weeds' fauna (their nymphs) is rich
    if (S && S.flying && dist < 80) for (let t = 0; t < nF; t++) {
      const i = fineI[t], x0 = FX[t], y0 = FY[t]; if (!near(x0, y0, R_OD) || GEO.depth[i] > 2.5) continue;
      const cov = plants.cover[i] || 0; if (!(cov > 0.05)) continue;
      const fa = fauna ? clamp(blend(fauna, t) / 1.5, 0.2, 1.5) : 0.6, edge = Math.exp(-Math.max(0, GEO.shore[i] - 2) / 8);
      const nB = 0.3 * cov * fa * edge * A * S.flying, nD = 0.03 * cov * fa * A * S.flying;
      for (let k = 0; k < 4; k++) if (hash(i, 801 + k) < nB - k) OD.push(keep('o' + i + ':' + k, () => ({ hx: x0 + (hash(i, 811 + k) - 0.5) * GEO.CELL, hy: y0 + (hash(i, 821 + k) - 0.5) * GEO.CELL, darner: false, ph: hash(i, 831 + k) * 50, r: 0.3 + 0.8 * hash(i, 841 + k), h: 0.12 + 0.35 * hash(i, 851 + k), perch: 0 })));
      if (hash(i, 861) < nD) OD.push(keep('d' + i, () => ({ hx: x0, hy: y0, darner: true, ph: hash(i, 871) * 50, r: 2 + 3 * hash(i, 881), h: 0.5 + 1.0 * hash(i, 891), perch: 0 })));
    }
    for (const [key, o] of KEEP) if (o.gen !== gen) KEEP.delete(key);   // (after all of them are kept: the odonates too)
  }
  // ---------- each frame ----------
  const cam = [0, 0, 0];
  const wetAt = (x, y, dmin = 0.05) => GEO.bodyAt(x, y) !== LAND && GEO.depthAt(x, y) > dmin;
  const ease = (v, to, step) => v + clamp(to - v, -step, step);
  // (a wanderer toward its wander's point (tx, ty) at ≤ v m/s, keeping to the water — a point on the land, or too shallow, is not taken:
  // it holds to the last wet one, no jump home — turning the way it goes; it starts at its home, or its cell's middle if that is dry)
  function wander(u, tx, ty, v, dt) {
    if (u.x === undefined) { const h = wetAt(u.hx, u.hy) ? [u.hx, u.hy] : GEO.cellCentre(u.id); u.x = u.gx = h[0]; u.y = u.gy = h[1]; }
    if (wetAt(tx, ty)) { u.gx = tx; u.gy = ty; }
    const dx = u.gx - u.x, dy = u.gy - u.y, d = Math.hypot(dx, dy);
    if (d > 1e-3) { const s = Math.min(d, v * dt); u.x += dx / d * s; u.y += dy / d * s; if (s > 0.01 * dt) u.yaw += angD(Math.atan2(dy, dx), u.yaw) * Math.min(1, 3 * dt); }
  }
  // (a frog's place: dx along the shore cell's edge, then out m from the waterline as drawn — where the bed meets the water's level —
  // into the water (−: up the bank); found by stepping from the cell's middle toward the land)
  function atEdge(x0, y0, nx, ny, dx, out) {
    const px = x0 - ny * dx, py = y0 + nx * dx; let w = 0.5 * GEO.CELL;
    for (let s = 0; s <= 1.5 * GEO.CELL; s += GEO.CELL / 16) { const qx = px + nx * s, qy = py + ny * s; if (GEO.bodyAt(qx, qy) === LAND || !(GEO.depthAt(qx, qy) > 0)) { w = s; break; } }
    return [px + nx * (w - out), py + ny * (w - out)];
  }
  // (the ground or the bed under (x, y) as drawn — main3's groundY; without it, the water's level on the bank and the bed in the water)
  const gY = (x, y) => groundY ? groundY(x, y) : GEO.bodyAt(x, y) === LAND ? surfY(x, y) + 0.02 : surfY(x, y) - Math.max(0, GEO.depthAt(x, y));
  // a frog at rest: a bullfrog — or any in over 6 cm of water — floating with its head out; else on the shallow bed or the bank
  const frogY = (f, x, y) => { const d = GEO.depthAt(x, y); return GEO.bodyAt(x, y) !== LAND && d > 0 && (f.kind === 'bull' || d > 0.06) ? surfY(x, y) - 0.014 * f.k : gY(x, y); };
  let lastT = -1, lastFly = 0;
  function update(t, snap, tx, ty, dist, camPos, scale) {
    const dt = lastT < 0 ? 0 : Math.min(0.1, Math.max(0, t - lastT)); lastT = t;
    if (logsDirty && wood) { logsDirty = false; placeLogs(wood); placeSpots(); }
    if (!snap) return;
    cam[0] = camPos.x; cam[1] = -camPos.z; cam[2] = camPos.y;
    // (the wings are see-through: drawn after the water's surface (main3's, renderOrder 2) while the eye is above it — else the surface
    // washes over them — and before it from under the water, where the surface hides them)
    const ro = cam[2] > surfY(cam[0], cam[1]) || GEO.bodyAt(cam[0], cam[1]) === LAND ? 3 : 0; P.dWing.mesh.renderOrder = P.bWing.mesh.renderOrder = ro;
    const vis = len => scale <= 1 ? 1 : Math.min(scale, Math.max(1, 0.5 * scale / len));
    const sun = snap.sun, air = snap.air ?? (herp ? herp.tl : 15), yfN = snap.yf;
    const flying = sun > 0.15 && snap.weather < 2 && air > 14 && yfN > 0.24 && yfN < 0.6 ? Math.min(1, (air - 14) / 6) * Math.min(1, (sun - 0.15) * 4) : 0;
    if ((flying > 0) !== (lastFly > 0)) dirty = true; lastFly = flying;
    if (dirty || Math.hypot(tx - at[0], ty - at[1]) > 5 || Math.abs(Math.log(dist / at[2])) > 0.4) rebuild(tx, ty, dist, { flying });
    for (const p of PARTS) p.n = 0;   // (the logs and boulders — all of them, big enough to see from afar — are put once: placeLogs, the rocks')
    // THE PAINTED TURTLES: on a sunny warm day (sun up, no rain, the air ≥ 12 °C or spring's cold water under a strong sun) most bask on
    // the logs and rocks within ~25 m of their place, heads out; otherwise they swim at the surface or among the weeds
    const bask = sun > 0.3 && snap.weather < 2 && (air > 12 || sun > 0.6) ? (snap.weather === 0 ? 0.75 : 0.4) : 0;
    // (who holds which place on a log or a rock, counted before any turtle chooses: two never take one; a.slot's bit in spot.occ)
    for (const s of baskSpots) s.occ = 0;
    for (const u of T) if (u.spot && u.mode !== 'swim') u.spot.occ |= 1 << u.slot;
    for (const u of T) {
      u.mt += dt;
      if (u.x === undefined) { wander(u, u.hx, u.hy, 0, 0); u.Y = surfY(u.x, u.y) - 0.02; u.yaw = hash(u.id, 511) * TAU; }
      const camD = Math.hypot(cam[0] - u.x, cam[1] - u.y) + Math.max(0, cam[2] - u.Y);
      if (u.mode === 'swim') {
        if (bask > 0 && hash(u.id, 990) < bask && u.mt > 3) {   // to the nearest free basking place within ~25 m of its home
          let best = null, bs = -1, bd = 25 * 25;
          for (const s of baskSpots) { const d = (s.x - u.hx) ** 2 + (s.y - u.hy) ** 2; if (d >= bd) continue; for (let k = 0, n = s.log ? 3 : 2; k < n; k++) if (!(s.occ & (1 << k))) { bd = d; best = s; bs = k; break; } }
          if (best) { best.occ |= 1 << bs; u.spot = best; u.slot = bs; u.mt = 0; u.mode = u.fresh ? 'bask' : 'go'; u.cl = u.fresh ? 1 : 0; }   // (one first seen on a basking day is already out on its log)
          else u.mt = -rnd(5, 20);   // (none free near: it looks again in a while, not every frame)
        }
        u.fresh = false;
      }
      if (u.mode === 'swim') {   // about its home at ≤ 0.3 m/s, keeping to the water; at the surface or down among the weeds — ~12 s between
        const a = t * 0.05 + u.ph; wander(u, u.hx + Math.sin(a) * 2.5, u.hy + Math.sin(a * 1.31 + 1) * 2.5, 0.3, dt);
        const sY = surfY(u.x, u.y), z = Math.max(0.05, GEO.depthAt(u.x, u.y)), f = clamp(Math.sin(t * 0.02 + u.ph) * 4 + 0.5, 0, 1);
        u.Y = ease(u.Y, (sY - 0.02) * f + (sY - z + 0.05) * (1 - f), 0.25 * dt); frame(Mf, u.x, u.Y, -u.y, u.yaw, 0.15 * f, 0, u.k * vis(0.15)); P.painted.put(Mf, PAINT_C, sY);
      } else if (u.mode === 'go') {   // swimming at the surface to its log or rock (up from the weeds first, as it goes)
        const s = u.spot, dx = s.x - u.x, dy = s.y - u.y, d = Math.hypot(dx, dy);
        if (bask === 0) u.mode = 'swim';
        else if (d < 0.25) { u.mode = 'bask'; u.mt = 0; u.cl = 0; u.cx0 = u.x; u.cy0 = u.y; u.cY0 = u.Y; }
        else { const v = Math.min(0.3 * dt, d); u.x += dx / d * v; u.y += dy / d * v; u.yaw += angD(Math.atan2(dy, dx), u.yaw) * Math.min(1, 3 * dt); }
        const sY = surfY(u.x, u.y); u.Y = ease(u.Y, sY - 0.02, 0.25 * dt); frame(Mf, u.x, u.Y, -u.y, u.yaw, 0.15, 0, u.k * vis(0.15)); P.painted.put(Mf, PAINT_C, sY);
      } else if (u.mode === 'bask' || u.mode === 'slide') {
        const s = u.spot, off = (u.slot - (s.log ? 1 : 0.5)) * 0.22, x = s.x + Math.cos(s.yaw) * off, y = s.y + Math.sin(s.yaw) * off, sY = surfY(x, y), top = spotTop(s, off);
        let X = x, Yy = y, Y = s.base + top + 0.005, yaw = s.yaw + (u.slot % 2 ? Math.PI : 0) + 0.3 * Math.sin(u.ph), pitch = 0;
        if (u.mode === 'bask' && u.cl < 1) {   // (hauling itself out, from where it reached the log to its place on it)
          u.cl = Math.min(1, u.cl + dt / 1.5); const c = u.cl * u.cl * (3 - 2 * u.cl);
          X = u.cx0 + (x - u.cx0) * c; Yy = u.cy0 + (y - u.cy0) * c; Y = u.cY0 + (Y - u.cY0) * c; yaw = u.yaw + angD(yaw, u.yaw) * c; pitch = 0.45 * Math.sin(Math.PI * u.cl);
        }
        if (u.mode === 'bask' && (camD < 6 * vis(0.15) || (bask === 0 && u.mt > 5))) { u.mode = 'slide'; u.mt = 0; u.sd = slideDir(s, x, y); u.sYaw = yaw; }   // (too close, or the sun gone: off into the water)
        if (u.mode === 'slide') {   // (turning off its side, down into the deeper water nose first, a plop)
          const f = Math.min(1, u.mt / 0.8); yaw = u.sYaw + angD(u.sd, u.sYaw) * Math.min(1, 2 * f); X += Math.cos(u.sd) * 0.35 * f; Yy += Math.sin(u.sd) * 0.35 * f; Y -= (top + 0.12) * f * f; pitch = -0.5 * f;
          if (f >= 1 && !u.plop) { u.plop = true; ripple(X, Yy, t, 0.04, 0.8, 0.05); }
          if (u.mt > 1) { u.mode = 'swim'; u.mt = -rnd(40, 120); u.plop = false; u.spot = null; u.gx = X; u.gy = Yy; }   // (in the water where it went in: its wander back home from there)
        }
        u.x = X; u.y = Yy; u.Y = Y; u.yaw = yaw; frame(Mf, X, Y, -Yy, yaw, pitch, 0, u.k * vis(0.15)); P.painted.put(Mf, PAINT_C, sY);
      }
    }
    // THE SNAPPERS: walking slowly on the bed, or at the surface with the eyes and the top of the shell out
    for (const u of SN) {   // (about its home at ≤ 0.1 m/s, keeping to the water)
      const a = t * 0.004 + u.ph; wander(u, u.hx + Math.sin(a) * 1.5, u.hy + Math.sin(a * 1.3) * 1.5, 0.1, dt);
      const x = u.x, y = u.y, z = Math.max(0.1, GEO.depthAt(x, y)), sY = surfY(x, y), yaw = u.yaw;
      const lunge = u.lunge && t - u.lunge < 0.6 ? Math.sin((t - u.lunge) / 0.6 * Math.PI) : 0;
      frame(Mf, x + Math.cos(yaw) * lunge * 0.1, u.peri ? sY - 0.11 * u.k : sY - z, -(y + Math.sin(yaw) * lunge * 0.1), yaw, u.peri ? 0.12 : 0, 0, u.k * vis(0.5)); P.snapper.put(Mf, SNAP_C, sY);
      u.cx = x; u.cy = y;
    }
    // THE FROGS: sitting at the edge (bullfrogs floating, heads out); the camera too close — a jump and a plop, gone a while
    for (const f of FR) {
      f.mt += dt; const sY = surfY(f.x, f.y), k = f.k * vis(0.08 * f.k), Y0 = frogY(f, f.x, f.y);
      const camD = Math.hypot(cam[0] - f.x, cam[1] - f.y) + Math.max(0, cam[2] - Y0);
      if (f.mode === 'sit' && camD < (f.kind === 'bull' ? 4 : 2.5) * vis(0.08)) {
        // (a jump INTO the water — the shore's way out, leaning away from the eye — far enough to land in it; a frog with none ahead
        // within 2.5 m hops off into the grass)
        const away = Math.atan2(f.y - cam[1], f.x - cam[0]); f.jyaw = f.wd + clamp(angD(away, f.wd), -0.6, 0.6); f.jL = 0.6 * f.k;
        for (let s = 0.1; s <= 2.5; s += 0.1) if (wetAt(f.x + Math.cos(f.jyaw) * s, f.y + Math.sin(f.jyaw) * s, 0.04)) { f.jL = Math.max(f.jL, s + 0.15); break; }
        f.mode = 'jump'; f.mt = 0; f.jY0 = Y0;
      }
      if (f.mode === 'sit') {
        frame(Mf, f.x, Y0 + (f.kind === 'bull' ? 0.003 * Math.sin(t + f.ph) : 0), -f.y, f.yaw, 0, 0, k); P.frog.put(Mf, f.C, sY);
      } else if (f.mode === 'jump') {   // (the arc from where it sat to where it lands: the water's surface, or the ground)
        const u = Math.min(1, f.mt / (0.35 + 0.1 * f.jL)), x = f.x + Math.cos(f.jyaw) * f.jL * u, y = f.y + Math.sin(f.jyaw) * f.jL * u;
        const ex = f.x + Math.cos(f.jyaw) * f.jL, ey = f.y + Math.sin(f.jyaw) * f.jL, inW = wetAt(ex, ey, 0.02), Y1 = inW ? surfY(ex, ey) - 0.03 : gY(ex, ey);
        frame(Mf, x, f.jY0 + (Y1 - f.jY0) * u + Math.sin(u * Math.PI) * (0.12 + 0.12 * f.jL) * f.k, -y, f.jyaw, 0.6 - 1.2 * u, 0, k); P.frog.put(Mf, f.C, surfY(x, y));
        if (u >= 1) { f.mode = 'gone'; f.mt = 0; f.back = rnd(30, 120); if (inW) ripple(ex, ey, t, 0.03, 0.8, 0.05 * f.k); }
      } else if (f.mode === 'gone' && f.mt > f.back && camD > 5 * vis(0.08)) { f.mode = 'sit'; f.mt = 0; }
    }
    // THE NEWTS: creeping through the weeds near the bed; every few minutes up to the surface for air
    for (const u of NW) {   // (about its home at ≤ 8 cm/s, keeping to the water)
      const a = t * 0.03 + u.ph; wander(u, u.hx + Math.sin(a) * 0.8, u.hy + Math.sin(a * 1.4 + 2) * 0.8, 0.08, dt);
      const x = u.x, y = u.y, z = Math.max(0.05, GEO.depthAt(x, y)), sY = surfY(x, y);
      const gulp = Math.max(0, Math.sin(t * 0.03 + u.ph * 3) - 0.92) / 0.08, Y = sY - z + 0.01 + (z - 0.03) * gulp;
      frame(Mf, x, Y, -y, u.yaw, gulp > 0.05 ? 0.7 : 0, 0, u.k * vis(0.09)); P.newt.put(Mf, NEWT_C, sY);
    }
    // THE DRAGONFLIES AND DAMSELFLIES
    for (const o of OD) {
      const s = t + o.ph; let x, y, h, yaw;
      if (o.darner) {   // a patrol loop over the bed with darts and short hovers
        const a = s * 0.9, hov = Math.max(0, Math.sin(s * 0.7)) > 0.85 ? 1 : 0; x = o.hx + Math.cos(a) * o.r + 0.3 * Math.sin(s * 3.1) * (1 - hov); y = o.hy + Math.sin(a * 1.6) * o.r * 0.6; h = o.h + 0.2 * Math.sin(s * 1.3);
        yaw = Math.atan2(Math.cos(a * 1.6) * 1.6 * 0.6 * o.r, -Math.sin(a) * o.r);
      } else {   // a bluet: hovering and flitting low over the pads and reeds; perched a while, wings folded — settling where it is, and
        // flying (≤ 1.2 m/s) back into its round after: no jumps
        const p = Math.sin(s * 0.13) > 0.6 ? 1 : 0, a = s * 0.6;
        if (o.x === undefined) { o.x = o.hx + Math.sin(a) * o.r; o.y = o.hy + Math.sin(a * 0.77 + 1) * o.r; o.z = o.h; o.yaw = o.ph; }
        if (p && !o.perch) { o.px = o.x; o.py = o.y; }
        const gx = p ? o.px : o.hx + Math.sin(a) * o.r + 0.05 * Math.sin(s * 9), gy = p ? o.py : o.hy + Math.sin(a * 0.77 + 1) * o.r, gz = p ? 0.18 : o.h + 0.05 * Math.sin(s * 4);
        const dx = gx - o.x, dy = gy - o.y, dz = gz - o.z, d = Math.hypot(dx, dy, dz), st = Math.min(d, 1.2 * dt);
        if (d > 1e-4) { o.x += dx / d * st; o.y += dy / d * st; o.z += dz / d * st; if (Math.hypot(dx, dy) > 0.02) o.yaw += angD(Math.atan2(dy, dx), o.yaw) * Math.min(1, 6 * dt); }
        x = o.x; y = o.y; h = o.z; yaw = o.yaw; o.perch = p;
      }
      const sY = surfY(x, y), k = vis(o.darner ? 0.075 : 0.036);
      frame(Mf, x, sY + h, -y, yaw, 0, 0, k); (o.darner ? P.darner : P.bluet).put(Mf, o.darner ? DARNER_C : BLUET_C, -1e4);
      const fl = o.perch ? 0 : Math.sin(t * 95 + o.ph) * 0.45;
      part(Mp, Mf, 0, 0, 0, fl, 0, 0, 1, o.perch ? 1 : 1, o.perch ? 0.2 : 1); (o.darner ? P.dWing : P.bWing).put(Mp, WING_C, -1e4);
    }
    // the damselflies at the smallmouth's leaps: hovering where it rises, taken at the leap's top
    for (let q = victims.length - 1; q >= 0; q--) {
      const v = victims[q]; if (t > v.t1) { victims.splice(q, 1); continue; }
      const k = vis(0.036), sY = surfY(v.x, v.y); frame(Mf, v.x + 0.03 * Math.sin(t * 9), sY + v.h + 0.02 * Math.sin(t * 5), -v.y, v.yaw, 0, 0, k); P.bluet.put(Mf, BLUET_C, -1e4);
      part(Mp, Mf, 0, 0, 0, Math.sin(t * 95) * 0.45, 0, 0); P.bWing.put(Mp, WING_C, -1e4);
    }
    for (const p of PARTS) p.end();
  }
  // a leap begins at (x, y) (rises3view): a damselfly hovers where the fish will top out, taken there
  function onLeap(x, y, t, dur, h, dir) { if (lastFly <= 0 && Math.random() < 0.5) return; victims.push({ x: x + Math.cos(dir) * 0.15, y: y + Math.sin(dir) * 0.15, h: h * 0.95, yaw: Math.random() * TAU, t1: t + dur * 0.5 }); }
  // the sim's snapping turtle or bullfrog took a fish here (fish3 wildEv): the nearest drawn one lunges
  function onKill(w, x, y, L, k, t) {
    if (w === 'snapper') { let best = null, bd = 100; for (const u of SN) { const d = (u.cx - x) ** 2 + (u.cy - y) ** 2; if (d < bd) { bd = d; best = u; } } if (best) best.lunge = t; }
    ripple(x, y, t, 0.05, 0.7, w === 'bullfrog' ? 0.06 : 0);
  }
  // for "Find an animal" (main3): the log or rock with the most turtles out on it now, a bullfrog, a snapper — of those near the view
  function list() {
    const out = [], by = new Map(); for (const u of T) if (u.mode === 'bask' && u.spot) by.set(u.spot, (by.get(u.spot) || 0) + 1);
    let best = null, bn = 0; for (const [sp, n] of by) if (n > bn) { bn = n; best = sp; }
    if (best) { const sp = best; out.push({ kind: 'turtles', name: bn > 1 ? bn + ' painted turtles basking' : 'a painted turtle basking', key: 'turtles', size: 0.3, at: () => [sp.x, sp.base + sp.top + 0.05, -sp.y] }); }
    const bf = FR.find(f => f.kind === 'bull' && f.mode === 'sit'); if (bf) out.push({ kind: 'bullfrog', name: 'a bullfrog', key: 'bullfrog', size: 0.3, at: () => [bf.x, surfY(bf.x, bf.y), -bf.y] });
    const sn = SN[0]; if (sn && sn.cx !== undefined) out.push({ kind: 'snapper', name: 'a snapping turtle', key: 'snapper', size: 0.6, at: () => [sn.cx, surfY(sn.cx, sn.cy) - Math.max(0.1, GEO.depthAt(sn.cx, sn.cy)) * (sn.peri ? 0 : 1), -sn.cy] });
    return out;
  }
  return { group, setData, update, onLeap, onKill, list, relayout: () => { logsDirty = !!wood; }, stats: () => ({ painted: T.length, basking: T.filter(u => u.mode === 'bask').length, snappers: SN.length, frogs: FR.filter(f => f.kind !== 'bull').length, bullfrogs: FR.filter(f => f.kind === 'bull').length, newts: NW.length, tadpoles: tad.count, odonates: OD.length, logs: LOGS.length, rocks: ROCKS.length, herp: herp && herp.n }) };
}
