// main3.js — the 3-D view's first light (browser layer): the real Hot Brook lakes at 1/10 with true depths, from the pure
// geometry module (src/w3/geometry.js). Terrain and lake beds from the survey data, the water surfaces, forest from the land
// cover, a sky and sun, tea-coloured water seen from below, a free camera. No simulation yet (stage 3 adds the fields).
// three.js r186 (vendor/, WebGPURenderer → WebGL2 fallback). Cosmetic randomness uses Math.random (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, BODIES, BODY_NAMES, LAND, UPPER, LOWER, BROOK } from '../geometry.js';
import { CameraRig } from './controls3.js';
import { FAR3 } from './far3d.js';

const { attribute } = THREE.TSL;
const $ = id => document.getElementById(id);
const BASE = GEO.SURF.upper;                                   // three's y = 0 at Upper's water surface
// world (x east, y north, absolute elevation) → three (X east, Y up, Z south)
const v3 = (x, y, h) => new THREE.Vector3(x, h - BASE, -y);

// ---------- renderer, scene, camera ----------
const canvas = $('view');
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.08, 6000);
const SKY_TOP = new THREE.Color(0x4f84c0), SKY_HORIZON = new THREE.Color(0xcfdde3);
const airFog = new THREE.FogExp2(0xc7d6dc, 0.00045);
// tea-coloured water (Secchi ~3.8 m, colour ~46 Pt-Co): light fades ~0.45 /m, red and green outlasting blue — a dim amber-olive.
// (Objects fade out over a few metres in such water; the view keeps ~5 m so the bed and, later, the fish can be seen.)
const waterFog = new THREE.FogExp2(0x3d3c24, 0.12);
scene.fog = airFog;

// ---------- terrain and lake bed: one heightfield (vertices at cell centres) ----------
const { NX, NY, CELL, X0, Y0 } = GEO;
const bedAbs = i => GEO.level[i] - GEO.depth[i];              // the ground on land, the lake bed under water (m a.s.l.)
const COVER_RGB = {
  evergreen: 0x2c3f26, mixed: 0x34482a, deciduous: 0x40552f, woody_wet: 0x3f4a2c, shrub_wet: 0x55603a, emergent_wet: 0x6a7443,
  shrub: 0x5f6640, grass: 0x6f7d47, pasture: 0x7c8650, crops: 0x8a8a55, dev_open: 0x7f7c66, dev_low: 0x7d786c, dev_med: 0x77736b,
  dev_high: 0x6e6b66, barren: 0x7f786a, beach: 0xc2b088, rock_shore: 0x77746a, stream: 0x6a6656, water: 0x5a5a48,
};
// cheap smooth value noise for patchy beds (cosmetic only)
const hash2 = (i, j) => { const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return h - Math.floor(h); };
function vnoise(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash2(i, j) * (1 - u) + hash2(i + 1, j) * u) * (1 - v) + (hash2(i, j + 1) * (1 - u) + hash2(i + 1, j + 1) * u) * v; }
function bedColour(d, c, x, y) {   // the lake bed by depth: rocky gravel and sand in the shallows (MDIFW: mostly rocky shores) → organic mud in the basins
  const gravel = new THREE.Color(0xa59672), sand = new THREE.Color(0xb7a57c), m = new THREE.Color(0x7a6a4a), mud = new THREE.Color(0x52432f);
  const patch = vnoise(x * 0.18, y * 0.18), fine = vnoise(x * 0.9 + 7, y * 0.9 - 3);
  if (d < 1.4) c.copy(patch > 0.55 ? sand : gravel).lerp(m, d / 1.4 * 0.7); else c.copy(m).lerp(mud, Math.min(1, (d - 1.4) / 1.8));
  if (d > 0.5 && d < 3.2 && patch < 0.3) c.lerp(new THREE.Color(0x4e5a2e), 0.45);   // weedy patches (until the plants are real)
  return c.multiplyScalar(0.8 + fine * 0.4);
}
function buildTerrain() {
  const pos = new Float32Array(NX * NY * 3), col = new Float32Array(NX * NY * 3), c = new THREE.Color();
  for (let r = 0; r < NY; r++) for (let q = 0; q < NX; q++) {
    const i = r * NX + q, x = X0 + (q + 0.5) * CELL, y = Y0 + (r + 0.5) * CELL;
    pos[i * 3] = x; pos[i * 3 + 1] = bedAbs(i) - BASE; pos[i * 3 + 2] = -y;
    if (GEO.body[i] !== LAND) bedColour(GEO.depth[i], c, x, y);
    else {
      c.setHex(COVER_RGB[GEO.CLASSES[GEO.cover[i]]] ?? 0x4a5532);
      const near = GEO.toWater[i];
      if (near < 3) c.lerp(new THREE.Color(0x807a6c), 1 - near / 3);   // the stony strip at the waterline
      c.multiplyScalar(0.9 + Math.random() * 0.2);
    }
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const idx = [];
  for (let r = 0; r < NY - 1; r++) for (let q = 0; q < NX - 1; q++) { const a = r * NX + q, b = a + 1, d = a + NX, e = d + 1; idx.push(a, b, d, b, e, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }));
  mesh.receiveShadow = true; return mesh;
}
scene.add(buildTerrain());

// the real land beyond the sim's band (render-only data, far3d.js: 6-m cells out to 250 m), a little below the band so the
// band's finer ground wins where they overlap; and a plain beyond that, under the haze
const farDec = (b64, T) => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); };
const FAR_ELEV = farDec(FAR3.elev_cm, Uint16Array), FAR_COVER = farDec(FAR3.cover, Uint8Array);
const farElev = i => FAR3.E0 + FAR_ELEV[i] / 100;
function buildFar() {
  const n = FAR3.NX * FAR3.NY, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
  for (let r = 0; r < FAR3.NY; r++) for (let q = 0; q < FAR3.NX; q++) {
    const i = r * FAR3.NX + q; pos.set([FAR3.X0 + (q + 0.5) * FAR3.CELL, farElev(i) - BASE - 0.35, -(FAR3.Y0 + (r + 0.5) * FAR3.CELL)], i * 3);
    c.setHex(COVER_RGB[GEO.CLASSES[FAR_COVER[i]]] ?? 0x34482a).multiplyScalar(0.9 + Math.random() * 0.2); col.set([c.r, c.g, c.b], i * 3);
  }
  // (a hole where the sim's band is: the band draws its own ground and the lake beds; one far cell of overlap at its edge)
  const inBand = (q, r) => { const x = FAR3.X0 + (q + 1) * FAR3.CELL, y = FAR3.Y0 + (r + 1) * FAR3.CELL; return x > X0 + FAR3.CELL && x < GEO.XMAX - FAR3.CELL && y > Y0 + FAR3.CELL && y < GEO.YMAX - FAR3.CELL; };
  const idx = []; for (let r = 0; r < FAR3.NY - 1; r++) for (let q = 0; q < FAR3.NX - 1; q++) { if (inBand(q, r)) continue; const a = r * FAR3.NX + q, b = a + 1, d = a + FAR3.NX, e = d + 1; idx.push(a, b, d, b, e, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
}
scene.add(buildFar());
const far = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), new THREE.MeshStandardNodeMaterial({ color: 0x2f4127, roughness: 1 }));
{ let lo = Infinity; for (let i = 0; i < FAR3.NX * FAR3.NY; i++) lo = Math.min(lo, farElev(i)); for (let i = 0; i < GEO.N; i++) lo = Math.min(lo, bedAbs(i));
  far.position.set((X0 + GEO.XMAX) / 2, lo - BASE - 2, -(Y0 + GEO.YMAX) / 2); }   // (below everything — the deepest bed included)
scene.add(far);

// ---------- water: the lakes' and the brook's surfaces; see-through in the shallows ----------
function buildWater() {
  const pos = new Float32Array(NX * NY * 3), alpha = new Float32Array(NX * NY);
  for (let r = 0; r < NY; r++) for (let q = 0; q < NX; q++) {
    const i = r * NX + q;
    pos[i * 3] = X0 + (q + 0.5) * CELL; pos[i * 3 + 1] = GEO.level[i] - BASE + 0.01; pos[i * 3 + 2] = -(Y0 + (r + 0.5) * CELL);
    const d = Math.max(0, GEO.depth[i]); alpha[i] = 0.45 + 0.5 * (1 - Math.exp(-d * 0.9));   // the bed shows through the shallows
  }
  const idx = [];
  for (let r = 0; r < NY - 1; r++) for (let q = 0; q < NX - 1; q++) {
    const a = r * NX + q, b = a + 1, d = a + NX, e = d + 1;
    if (GEO.body[a] || GEO.body[b] || GEO.body[d] || GEO.body[e]) idx.push(a, b, d, b, e, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('wAlpha', new THREE.BufferAttribute(alpha, 1));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.MeshPhysicalNodeMaterial({ color: 0x2b2b17, roughness: 0.06, metalness: 0, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  m.opacityNode = attribute('wAlpha', 'float');
  const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 2; return mesh;
}
scene.add(buildWater());

// ---------- forest: instanced conifers and broadleaf trees on the land cover (real heights) ----------
function buildTrees() {
  const P = { evergreen: [0.13, 0.85], mixed: [0.12, 0.5], deciduous: [0.12, 0.2], woody_wet: [0.08, 0.6], shrub_wet: [0.015, 0.5] };   // [trees per 1.5-m cell, share conifer]
  const con = [], brd = [];
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] !== LAND || GEO.toWater[i] < 1.5) continue;
    const p = P[GEO.CLASSES[GEO.cover[i]]]; if (!p || Math.random() > p[0]) continue;
    const [cx, cy] = GEO.cellCentre(i), x = cx + (Math.random() - 0.5) * CELL, y = cy + (Math.random() - 0.5) * CELL;
    (Math.random() < p[1] ? con : brd).push([x, y, GEO.elevAt(x, y)]);
  }
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) {   // the far land's forest (6-m cells: 16× a band cell's area, at ~1/3 the band's density)
    const q = i % FAR3.NX, r = (i / FAR3.NX) | 0, cx = FAR3.X0 + (q + 0.5) * FAR3.CELL, cy = FAR3.Y0 + (r + 0.5) * FAR3.CELL;
    if (cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX) continue;   // (the band has its own)
    const p = P[GEO.CLASSES[FAR_COVER[i]]]; if (!p) continue;
    for (let k = 0, m = p[0] * 16 * 0.35; k < m; k++) {
      if (Math.random() > m - k) break;
      const x = cx + (Math.random() - 0.5) * FAR3.CELL, y = cy + (Math.random() - 0.5) * FAR3.CELL;
      (Math.random() < p[1] ? con : brd).push([x, y, farElev(i) - 0.35]);
    }
  }
  const mk = (list, crownG, trunkH, hRange, wMul, cols) => {
    const crown = new THREE.InstancedMesh(crownG, new THREE.MeshStandardNodeMaterial({ roughness: 0.9 }), list.length);
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.2, 1, 5).translate(0, 0.5, 0), new THREE.MeshStandardNodeMaterial({ color: 0x4a3a2a, roughness: 1 }), list.length);
    const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), c = new THREE.Color();
    list.forEach(([x, y, h], k) => {
      const H = hRange[0] + Math.random() * (hRange[1] - hRange[0]), W = H * wMul * (0.8 + Math.random() * 0.4), th = H * trunkH;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28);
      mt.compose(v3(x, y, h + th), q, s.set(W, H - th, W)); crown.setMatrixAt(k, mt);
      mt.compose(v3(x, y, h - 0.2), q, s.set(1, th + 0.4, 1)); trunk.setMatrixAt(k, mt);
      crown.setColorAt(k, c.setHex(cols[(Math.random() * cols.length) | 0]).multiplyScalar(0.85 + Math.random() * 0.3));
    });
    crown.castShadow = true; return [crown, trunk];
  };
  // conifers (spruce, fir, white pine: 10–22 m), broadleaf (maple, birch, aspen: 9–20 m) — the forest of the Hot Brook shores
  const coneG = new THREE.ConeGeometry(0.5, 1, 7).translate(0, 0.5, 0), blobG = new THREE.IcosahedronGeometry(0.5, 1).scale(1, 0.85, 1).translate(0, 0.45, 0);
  [...mk(con, coneG, 0.12, [10, 22], 0.36, [0x1f3a24, 0x264529, 0x1b3320]), ...mk(brd, blobG, 0.35, [9, 20], 0.55, [0x3d5e2c, 0x4a6b33, 0x56763a, 0x3a5a2a])].forEach(m => scene.add(m));
  return con.length + brd.length;
}
const nTrees = buildTrees();

// ---------- sky and light (a summer afternoon) ----------
{
  const g = new THREE.SphereGeometry(4500, 32, 16), col = new Float32Array(g.attributes.position.count * 3), c = new THREE.Color();
  for (let k = 0; k < g.attributes.position.count; k++) { const t = Math.max(0, g.attributes.position.getY(k) / 4500); c.copy(SKY_HORIZON).lerp(SKY_TOP, Math.pow(t, 0.6)); col.set([c.r, c.g, c.b], k * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var sky = new THREE.Mesh(g, new THREE.MeshBasicNodeMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.position.set((X0 + GEO.XMAX) / 2, 0, -(Y0 + GEO.YMAX) / 2); sky.renderOrder = -1; scene.add(sky);
}
{ // the sky as an environment map, so the water (and everything) reflects it: zenith → horizon → the dark shore below
  const W = 256, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#4f84c0'); gr.addColorStop(0.47, '#cfdde3'); gr.addColorStop(0.5, '#56634a'); gr.addColorStop(1, '#2b3424');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const env = new THREE.CanvasTexture(cv); env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace;
  scene.environment = env; scene.environmentIntensity = 0.6;
}
scene.add(new THREE.HemisphereLight(0xc9dcec, 0x4d4a34, 0.8));
const sun = new THREE.DirectionalLight(0xfff2dc, 2.4);
sun.position.set(-260, 420, 300); sun.target.position.set(0, 0, 0); scene.add(sun, sun.target);

// ---------- labels: the lakes, the brook, the inflow and outlet, the angler's sunfish spots ----------
const labels = [];
function label(text, sub, x, y, h, cls = '', reach = 2000) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls;
  const b = document.createElement('b'); b.textContent = text; el.append(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.append(s); }
  $('labels').append(el); labels.push({ el, p: v3(x, y, h), reach });
}
for (const B of BODIES) {
  if (B.id === BROOK) continue;
  let sx = 0, sy = 0, n = 0; for (let i = 0; i < GEO.N; i += 7) if (GEO.body[i] === B.id) { const [x, y] = GEO.cellCentre(i); sx += x; sy += y; n++; }
  label(B.name, `${(B.area / 1e4).toFixed(2)} ha at 1/10 · mean ${B.mean.toFixed(1)} m · max ${B.max.toFixed(1)} m`, sx / n, sy / n, (B.id === UPPER ? GEO.SURF.upper : GEO.SURF.lower) + 6);
}
{ const p = GEO.BROOK_PATH[Math.floor(GEO.BROOK_PATH.length / 2)]; label('Hot Brook', `${GEO.BROOK_LEN.toFixed(0)} m (1/2 scale)`, p[0], p[1], GEO.levelAt(p[0], p[1]) + 4, '', 450); }
label('inflow', '', GEO.INFLOW[0], GEO.INFLOW[1], GEO.SURF.upper + 3, '', 450); label('outlet', '', GEO.OUTLET[0], GEO.OUTLET[1], GEO.SURF.lower + 3, '', 450);
for (const n of GEO.NOTES) label(n.t.replace('Sunfish: ', 'sunfish · '), '', n.xy[0], n.xy[1], GEO.levelAt(n.xy[0], n.xy[1]) + 2, 'note', 160);
const proj = new THREE.Vector3();
function placeLabels(w, h) {
  for (const L of labels) {
    proj.copy(L.p).project(camera);
    const vis = proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1 && camera.position.distanceTo(L.p) < L.reach;
    L.el.classList.toggle('off', !vis);
    if (vis) L.el.style.transform = `translate(${((proj.x + 1) / 2 * w).toFixed(1)}px, ${((1 - proj.y) / 2 * h).toFixed(1)}px) translate(-50%, -100%)`;
  }
}

// ---------- camera: a free rig and named views ----------
// the ground or the lake bed under a three-space (x, z), in three's y
const rig = new CameraRig(camera, canvas, { groundAt: (x, z) => GEO.levelAt(x, -z) - GEO.depthAt(x, -z) - BASE });
const [ux, uy] = BODIES[0].deepest;
const VIEWS = {
  'both lakes': { t: [0, 0, 0], yaw: 0.0, pitch: -0.95, dist: 760 },
  "Upper's north basin": { t: [ux, uy - 20, 0], yaw: 0.15, pitch: -0.5, dist: 95 },
  'the brook pool': { t: [GEO.NOTES[0].xy[0] + 8, GEO.NOTES[0].xy[1], 0], yaw: 0.3, pitch: -1.35, dist: 70 },
  'the west cove': { t: [GEO.NOTES[2].xy[0], GEO.NOTES[2].xy[1], 0], yaw: -0.6, pitch: -0.8, dist: 75 },
  'dive (north basin)': { t: [ux, uy, -3.6], yaw: 0.9, pitch: -0.18, dist: 5 },
};
function go(name) {
  const v = VIEWS[name]; rig.set(v3(v.t[0], v.t[1], BASE + v.t[2]), v.yaw, v.pitch, v.dist);
  for (const b of $('views').children) b.classList.toggle('on', b.textContent === name);
}
for (const name of Object.keys(VIEWS)) { const b = document.createElement('button'); b.textContent = name; b.addEventListener('click', () => go(name)); $('views').append(b); }

// ---------- frame ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(), fps = 60, nFrames = 0;
async function start() {
  await renderer.init();
  resize(); go('both lakes');
  const backend = renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
  renderer.setAnimationLoop(now => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now; fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    rig.update(dt);
    // under water: inside a water body, below its surface and above its bed
    const cx = camera.position.x, cy = -camera.position.z, ch = camera.position.y + BASE;
    const under = GEO.bodyAt(cx, cy) !== LAND && ch < GEO.levelAt(cx, cy) && ch > GEO.levelAt(cx, cy) - GEO.depthAt(cx, cy) - 0.5;
    scene.fog = under ? waterFog : airFog; $('under').hidden = !under; sky.visible = !under;
    scene.background = under ? waterFog.color : null;
    renderer.render(scene, camera);
    placeLabels(innerWidth, innerHeight);
    if ((nFrames++ & 15) === 0) $('status').textContent = `${backend} · ${fps.toFixed(0)} fps · ${nTrees.toLocaleString()} trees · Upper ${(BODIES[0].area / 1e4).toFixed(2)} ha, Lower ${(BODIES[1].area / 1e4).toFixed(2)} ha (1/10 scale)`;
  });
}
start().catch(e => { $('status').textContent = 'could not start the 3-D view: ' + e.message; console.error(e); });
window.hb3 = { renderer, scene, camera, rig, GEO, go };
