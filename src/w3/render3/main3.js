// main3.js — the 3-D view of the whole Hot Brook lakes (browser layer), from the pure geometry module (src/w3/geometry.js).
// The lakes are at 1/10 of their real horizontal size with TRUE depths; the LAND (hills, banks, trees) is drawn at the
// lakes' scale × the "land height" slider (×1: in proportion to the lakes, so every view matches the real place; ×10: true
// metres), while the water's depth — and everything that will live in it — stays true size. Looks (map colours, the real
// aerial photo, a depth chart), seasons, a cut-away section, see-into-the-water, labels and the angler's field notes.
// three.js r186 (vendor/, WebGPURenderer → WebGL2). Cosmetic randomness uses Math.random (never core.rand).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, BODIES, LAND, BROOK } from '../geometry.js';
import { CameraRig } from './controls3.js';
import { FAR3 } from './far3d.js';
import { Env3, CLOCK3, buildColumns3 } from '../env3.js';
import { makeFishView } from './fish3view.js';
import { makePlantsView, LAYER as PLANT_LAYER } from './plants3view.js';
import { WU, waterOut, underwaterFogColor, setClear } from './water3.js';
import { ENV as ENVC, PLANKTON } from '../../config.js';

const { attribute, uniform, texture, mix, vec2, vec3, float, fract, smoothstep, min: tmin, clamp: tclamp, dot, reflector, cameraPosition, positionWorld, positionGeometry, normalize, pow, sin, exp, time, abs: tabs } = THREE.TSL;
const $ = id => document.getElementById(id);
const BASE = GEO.SURF.upper;                                   // three's y = 0 at Upper's water surface
const { NX, NY, X0, Y0 } = GEO;
const S = { exag: 3, look: 'map', season: 'summer', cut: false, cutPos: 0.61, clear: true, water: true, trees: true, show: 'plain', fish: true, fishScale: 1, plants: true };
const kLand = () => S.exag / 10;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- renderer, scene, camera ----------
const canvas = $('view');
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 6000);
// the fog: the air's above the water; under it the tea-coloured water's, its colour following the gaze (render3/water3.js)
const airFog = new THREE.FogExp2(0xc7d6dc, 0.0007), waterFog = new THREE.FogExp2(0x3b3b20, 0.12);
scene.fog = airFog; setClear(S.clear);

// ---------- seasons: land cover and tree colours ----------
const C = h => new THREE.Color(h);
const COVER = {   // [legend label, July colour] — the land cover classes of the model (NLCD 2021, NWI, the shore notes)
  evergreen: ['Conifer forest', 0x2c3f26], mixed: ['Mixed forest', 0x34482a], deciduous: ['Hardwood forest', 0x40552f],
  woody_wet: ['Wooded swamp', 0x3f4a2c], shrub_wet: ['Shrub swamp', 0x55603a], emergent_wet: ['Marsh', 0x6a7443],
  shrub: ['Shrub / clearing', 0x5f6640], grass: ['Grass', 0x6f7d47], pasture: ['Pasture / hay', 0x7c8650], crops: ['Fields', 0x8a8a55],
  dev_open: ['Camps / roads', 0x7f7c66], dev_low: ['Camps / roads', 0x7d786c], dev_med: ['Developed', 0x77736b], dev_high: ['Developed', 0x6e6b66],
  barren: ['Bare ground', 0x7f786a], beach: ['Beach', 0xc2b088], rock_shore: ['Rocky shore', 0x77746a], stream: ['Stream', 0x6a6656], water: ['Water', 0x5a5a48],
};
const DECID = new Set(['deciduous', 'mixed', 'shrub', 'shrub_wet', 'grass', 'pasture', 'crops', 'emergent_wet', 'dev_open', 'dev_low']);
function seasonal(cls, c) {   // a land cover's colour in the current season
  c.setHex((COVER[cls] || COVER.mixed)[1]);
  const s = S.season;
  if (s === 'spring' && DECID.has(cls)) c.lerp(C(0x7aa04a), cls === 'mixed' ? 0.35 : 0.55);
  if (s === 'fall' && DECID.has(cls)) c.lerp(C(cls === 'deciduous' ? 0xa0562a : cls === 'mixed' ? 0x7a5a2c : 0x8a7a44), cls === 'deciduous' ? 0.7 : 0.45);
  if (s === 'winter') c.lerp(C(0xe6ebef), cls === 'evergreen' ? 0.35 : cls === 'woody_wet' || cls === 'mixed' ? 0.6 : 0.85);
  return c;
}
const TREE_COLS = {
  conifer: { spring: [0x24432a, 0x2a4a2c], summer: [0x1f3a24, 0x264529, 0x1b3320], fall: [0x1f3a24, 0x264529], winter: [0x50604f, 0x5a6a58] },
  broad: { spring: [0x7ea84c, 0x8db45a, 0x6c9a40], summer: [0x3d5e2c, 0x4a6b33, 0x56763a, 0x3a5a2a], fall: [0xc8642a, 0xd8a12e, 0xa8342a, 0x9a7a2e, 0xb8862c], winter: [0x6d6458, 0x7a7064, 0x5f584e] },
};

// ---------- the ground: the sim's band (1.5 m) and the far land (6 m), one material ----------
// land is raised by kLand about the level of the water around it; the lake bed keeps its true depth
const bedAbs = i => GEO.level[i] - GEO.depth[i];
const landY = (elev, level) => (level - BASE) + (elev - level) * kLand();
const farDec = (b64, T) => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); };
const FAR_ELEV = farDec(FAR3.elev_cm, Uint16Array), FAR_COVER = farDec(FAR3.cover, Uint8Array);
const farElev = i => FAR3.E0 + FAR_ELEV[i] / 100;
const farLevel = y => GEO.SURF.upper + (GEO.SURF.lower - GEO.SURF.upper) * Math.min(1, Math.max(0, (y + 15) / 70));
const PW = FAR3.NX * FAR3.CELL, PH = FAR3.NY * FAR3.CELL;   // the photo covers the far grid's extent, row 0 north
const photoUV = (x, y) => [(x - FAR3.X0) / PW, (y - FAR3.Y0) / PH];

const photoTex = new THREE.TextureLoader().load(new URL('./naip3.jpg', import.meta.url).href);
photoTex.colorSpace = THREE.SRGBColorSpace; photoTex.anisotropy = 8;
const U = { photo: uniform(0), chart: uniform(0), snow: uniform(0), fallTint: uniform(0), springTint: uniform(0) };
// depth-chart colours: lighter → darker blue every 2 ft (MDIFW charts are in feet), a contour line at every 2-ft step
const FT2 = 0.6096;
function groundMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
  const vc = attribute('color', 'vec3'), land = attribute('land', 'float'), dep = attribute('dep', 'float');
  let ph = texture(photoTex, attribute('puv', 'vec2')).rgb;
  { const l0 = dot(ph, vec3(0.299, 0.587, 0.114)); ph = mix(vec3(l0, l0, l0), ph, 1.3).mul(0.62); }   // (NAIP is bright and hazy)
  // the photo is a summer one: warm the hardwoods in autumn (its brighter greens), freshen them in May, snow in February
  const lum = dot(ph, vec3(0.299, 0.587, 0.114)), green = tclamp(ph.g.sub(ph.r.add(ph.b).mul(0.5)).mul(6), 0, 1);
  ph = mix(ph, ph.mul(vec3(1.7, 1.1, 0.55)), U.fallTint.mul(green).mul(smoothstep(0.12, 0.3, lum)));
  ph = mix(ph, ph.mul(vec3(1.05, 1.25, 0.8)), U.springTint.mul(green));
  ph = mix(ph, vec3(0.86, 0.89, 0.92), U.snow.mul(smoothstep(0.06, 0.22, lum)).mul(0.85));
  const landCol = mix(vc, ph, U.photo);
  const bandIdx = dep.div(FT2).floor().mul(FT2).div(5.6);
  const chartBed = mix(vec3(0.55, 0.76, 0.84), vec3(0.02, 0.07, 0.2), tclamp(bandIdx, 0, 1));
  const f = fract(dep.div(FT2)), line = float(1).sub(smoothstep(0.0, 0.05, tmin(f, float(1).sub(f))));
  // sunlight focused by the ripples into moving bright lines on the shallow bed (caustics), fading with depth
  const P = positionWorld, tt = time;
  const w1 = sin(P.x.mul(1.7).add(tt.mul(0.9)).add(sin(P.z.mul(1.3).add(tt.mul(0.6))).mul(1.4)));
  const w2 = sin(P.z.mul(1.9).sub(tt.mul(0.8)).add(sin(P.x.mul(1.1).sub(tt.mul(0.5))).mul(1.4)));
  const caust = pow(float(1).sub(tabs(w1.add(w2)).mul(0.5)), 6).mul(exp(dep.mul(-0.8))).mul(smoothstep(0.03, 0.2, dep)).mul(WU.day).mul(float(1).sub(U.chart));
  const bedCol = mix(vc.mul(caust.mul(1.2).add(1)), mix(chartBed, vec3(0.05, 0.1, 0.18), line.mul(0.8)), U.chart.mul(smoothstep(0.02, 0.2, dep)));
  m.colorNode = mix(bedCol, landCol, land);
  m.outputNode = waterOut(dep);   // (the water between the bed and the eye: render3/water3.js)
  return m;
}
const groundMat = groundMaterial();

// THE WATER MODEL's grid (src/w3/env3.js): the cut-away's, the ice's and the weeds' lookups
const W3 = { G: buildColumns3() }; W3.colAt = Env3.prototype.colAt; W3.cellAt = Env3.prototype.cellAt;
// the weeds colour the bed where they stand (from afar single stems are smaller than a pixel): olive-green by their cover
const WEED = C(0x3e5426);
function weedBed(i, c) { const k = S.plants && plantsView ? plantsView.cover[i] : 0; return k > 0 ? c.lerp(WEED, k * 0.55) : c; }
function tintBed() {   // recolour only the bed (new plant data)
  const c = C(0), bc = band.geometry.attributes.color.array;
  for (let i = 0; i < GEO.N; i++) { if (GEO.body[i] === LAND) continue; const [x, y] = GEO.cellCentre(i); weedBed(i, bedColour(GEO.depth[i], c, x, y)); bc[i * 3] = c.r; bc[i * 3 + 1] = c.g; bc[i * 3 + 2] = c.b; }
  band.geometry.attributes.color.needsUpdate = true;
}
// cheap smooth value noise for patchy beds (cosmetic)
const hash2 = (i, j) => { const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return h - Math.floor(h); };
function vnoise(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash2(i, j) * (1 - u) + hash2(i + 1, j) * u) * (1 - v) + (hash2(i, j + 1) * (1 - u) + hash2(i + 1, j + 1) * u) * v; }
function bedColour(d, c, x, y) {   // rocky gravel and sand in the shallows (MDIFW: mostly rocky shores) → organic mud in the basins
  const patch = vnoise(x * 0.18, y * 0.18), fine = vnoise(x * 0.9 + 7, y * 0.9 - 3);
  if (d < 1.4) c.set(patch > 0.55 ? 0xb7a57c : 0xa59672).lerp(C(0x7a6a4a), d / 1.4 * 0.7); else c.set(0x7a6a4a).lerp(C(0x52432f), Math.min(1, (d - 1.4) / 1.8));
  return c.multiplyScalar(0.8 + fine * 0.4);
}

function gridMesh(nx, ny, at, keep) {   // a heightfield over a grid of cell centres; at(i) → [x, y]; keep(q, r) for each quad
  const n = nx * ny, g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), land = new Float32Array(n), dep = new Float32Array(n), puv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const [x, y, isLand, d] = at(i); pos[i * 3] = x; pos[i * 3 + 2] = -y; land[i] = isLand; dep[i] = d; const [u, v] = photoUV(x, y); puv[i * 2] = u; puv[i * 2 + 1] = v; }
  const idx = []; for (let r = 0; r < ny - 1; r++) for (let q = 0; q < nx - 1; q++) { if (!keep(q, r)) continue; const a = r * nx + q, b = a + 1, d = a + nx, e = d + 1; idx.push(a, b, d, b, e, d); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('land', new THREE.BufferAttribute(land, 1)); g.setAttribute('dep', new THREE.BufferAttribute(dep, 1)); g.setAttribute('puv', new THREE.BufferAttribute(puv, 2));
  g.setIndex(idx); return new THREE.Mesh(g, groundMat);
}
const band = gridMesh(NX, NY, i => { const [x, y] = GEO.cellCentre(i); return [x, y, GEO.body[i] === LAND ? 1 : 0, Math.max(0, GEO.depth[i])]; }, () => true);
// the far land, with a hole where the band draws its own ground (one far cell of overlap)
const inBand = (q, r) => { const x = FAR3.X0 + (q + 1) * FAR3.CELL, y = FAR3.Y0 + (r + 1) * FAR3.CELL; return x > X0 + FAR3.CELL && x < GEO.XMAX - FAR3.CELL && y > Y0 + FAR3.CELL && y < GEO.YMAX - FAR3.CELL; };
const farMesh = gridMesh(FAR3.NX, FAR3.NY, i => [FAR3.X0 + ((i % FAR3.NX) + 0.5) * FAR3.CELL, FAR3.Y0 + (Math.floor(i / FAR3.NX) + 0.5) * FAR3.CELL, 1, 0], (q, r) => !inBand(q, r));
function placeGround() {   // heights (the land-height slider)
  const bp = band.geometry.attributes.position.array;
  for (let i = 0; i < GEO.N; i++) bp[i * 3 + 1] = GEO.body[i] === LAND ? landY(GEO.elev[i], GEO.level[i]) : bedAbs(i) - BASE;
  band.geometry.attributes.position.needsUpdate = true; band.geometry.computeVertexNormals();
  const fp = farMesh.geometry.attributes.position.array;
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { const y = -fp[i * 3 + 2]; fp[i * 3 + 1] = landY(farElev(i), farLevel(y)) - 0.06; }
  farMesh.geometry.attributes.position.needsUpdate = true; farMesh.geometry.computeVertexNormals();
}
function colourGround() {   // map colours by season (the bed by depth)
  const c = C(0), bc = band.geometry.attributes.color.array;
  for (let i = 0; i < GEO.N; i++) {
    const [x, y] = GEO.cellCentre(i);
    if (GEO.body[i] !== LAND) weedBed(i, bedColour(GEO.depth[i], c, x, y));
    else { seasonal(GEO.CLASSES[GEO.cover[i]], c); const near = GEO.toWater[i]; if (near < 2.5) c.lerp(C(S.season === 'winter' ? 0xd8dde0 : 0x807a6c), (1 - near / 2.5) * 0.8); c.multiplyScalar(0.9 + hash2(x, y) * 0.2); }
    bc[i * 3] = c.r; bc[i * 3 + 1] = c.g; bc[i * 3 + 2] = c.b;
  }
  band.geometry.attributes.color.needsUpdate = true;
  const fc = farMesh.geometry.attributes.color.array;
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { seasonal(GEO.CLASSES[FAR_COVER[i]], c).multiplyScalar(0.9 + hash2(i, 7) * 0.2); fc[i * 3] = c.r; fc[i * 3 + 1] = c.g; fc[i * 3 + 2] = c.b; }
  farMesh.geometry.attributes.color.needsUpdate = true;
}

// ---------- water: the lakes' and the brook's surfaces (ice in February) ----------
const water = (() => {
  const n = NX * NY, pos = new Float32Array(n * 3), alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [x, y] = GEO.cellCentre(i); pos[i * 3] = x; pos[i * 3 + 1] = GEO.level[i] - BASE + 0.01; pos[i * 3 + 2] = -y;
    alpha[i] = 0.5 + 0.45 * (1 - Math.exp(-Math.max(0, GEO.depth[i]) * 0.9));   // the bed shows through the shallows
  }
  const idx = []; for (let r = 0; r < NY - 1; r++) for (let q = 0; q < NX - 1; q++) {
    const a = r * NX + q, b = a + 1, d = a + NX, e = d + 1; if (GEO.body[a] || GEO.body[b] || GEO.body[d] || GEO.body[e]) idx.push(a, b, d, b, e, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('wAlpha', new THREE.BufferAttribute(alpha, 1));
  g.setAttribute('ice', new THREE.BufferAttribute(new Float32Array(n), 1)); g.setIndex(idx); g.computeVertexNormals();
  // the surface mirrors the shore and the sky (a planar reflection at Upper's level — Lower's sits 0.6 m lower, too little
  // to see), more strongly at low angles (Fresnel), broken by a light ripple; under it the tea-coloured body of the water
  const refl = reflector({ resolutionScale: 0.5 }); refl.target.rotateX(-Math.PI / 2); refl.target.position.y = 0.01; scene.add(refl.target);
  // (its camera, a clone of the view's made now, sees layer 0 only: the weeds' stems, on their own layer, stay out of the mirror)
  refl.reflector.getVirtualCamera(camera); camera.layers.enable(PLANT_LAYER);
  const P = positionWorld, t = time;
  const ripple = vec2(sin(P.x.mul(2.1).add(t.mul(1.3))).add(sin(P.z.mul(1.7).sub(t.mul(0.9)))), sin(P.z.mul(2.3).add(t.mul(1.1))).add(sin(P.x.mul(1.3).add(P.z.mul(0.8)).sub(t.mul(0.7))))).mul(0.0035);
  refl.uvNode = refl.uvNode.add(ripple);
  const view = normalize(cameraPosition.sub(P)), fres = pow(float(1).sub(tabs(view.y)), 4).mul(0.85).add(0.06);
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false });
  m.userData = { base: uniform(0.04), body: uniform(new THREE.Color(0x2b2b17)), mirror: uniform(1) };
  const ice = attribute('ice', 'float');   // the live ice cover (white-grey, snow-dusted, opaque)
  // FROM ABOVE: the mirror of the shore and the sky (Fresnel: strong at low angles) over the water — looking down, the surface
  // is nearly clear and the bed, the weeds and the fish show through, dimmed and tinted by the water itself (water3.js)
  const above = mix(m.userData.body.mul(WU.day), refl.rgb, fres.mul(m.userData.mirror));
  const aboveA = m.userData.base.add(fres.mul(m.userData.mirror).mul(0.95));
  // FROM BELOW: Snell's window — within ~48.6° of straight up the sky, bright and rippling; beyond it the surface mirrors the
  // dark water below
  // (the sky through the window is tinted by the water between it and the eye — golden-green in tea water — and broken by the
  // waves into bright moving lines)
  const s1 = sin(P.x.mul(3.1).add(t.mul(1.4)).add(sin(P.z.mul(2.2).add(t.mul(0.9))))), s2 = sin(P.z.mul(2.7).sub(t.mul(1.2)).add(sin(P.x.mul(1.9).sub(t.mul(0.8)))));
  const glint = pow(float(1).sub(tabs(s1.add(s2)).mul(0.5)), 5);
  const tintUp = exp(WU.kd.mul(WU.camDepth).negate());
  const win = smoothstep(0.6, 0.7, tabs(view.y)), skyLit = vec3(0.5, 0.68, 0.82).mul(WU.day).mul(glint.mul(1.5).add(0.35)).mul(tintUp).mul(0.75);
  const below = mix(WU.level.mul(WU.day).mul(glint.mul(0.6).add(1.1)), skyLit, win);
  m.colorNode = mix(mix(above, below, WU.under), vec3(0.82, 0.86, 0.89).mul(mix(float(1), float(0.45), WU.under)), ice);
  m.opacityNode = tclamp(mix(aboveA, float(1), WU.under).add(ice), 0, 1);
  const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 2; return mesh;
})();
function styleWater() {
  const m = water.material, chart = S.look === 'chart';
  m.userData.body.value.set(chart ? 0x6a8a96 : 0x2b2b17);
  m.userData.mirror.value = chart ? 0.2 : 1;
  m.userData.base.value = chart ? 0.12 : 0.04;
  WU.on.value = chart ? 0 : 1; setClear(S.clear);
  water.visible = S.water;
}
// the ice per vertex from the live water model's columns (each 1.5-m vertex reads the column it lies in)
const iceCol = new Int32Array(NX * NY).fill(-1);
function placeIce(ice) {
  const a = water.geometry.attributes.ice, v = a.array;
  for (let i = 0; i < NX * NY; i++) { let c = iceCol[i]; if (c === -2) continue; if (c < 0) { const [x, y] = GEO.cellCentre(i); c = W3.colAt(x, y); iceCol[i] = c < 0 ? -2 : c; if (c < 0) continue; } v[i] = ice[c] > 0.5 ? Math.min(1, (ice[c] - 0.5) * 2.5) : 0; }
  a.needsUpdate = true;
}

// ---------- trees: layered spruce/fir/pine and lumpy hardwood crowns, sized with the land ----------
function mergeGeo(parts) {   // non-indexed position + normal concatenation
  const ps = [], ns = []; for (const g0 of parts) { const g = g0.index ? g0.toNonIndexed() : g0; g.computeVertexNormals(); ps.push(...g.attributes.position.array); ns.push(...g.attributes.normal.array); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(ns, 3)); return g;
}
const coniferG = mergeGeo([
  new THREE.CylinderGeometry(0.035, 0.05, 0.2, 5).translate(0, 0.1, 0),
  new THREE.ConeGeometry(0.42, 0.42, 8).translate(0, 0.32, 0), new THREE.ConeGeometry(0.33, 0.36, 8).translate(0, 0.52, 0),
  new THREE.ConeGeometry(0.23, 0.3, 7).translate(0, 0.7, 0), new THREE.ConeGeometry(0.13, 0.26, 6).translate(0, 0.87, 0),
]);
const broadG = mergeGeo([
  new THREE.CylinderGeometry(0.04, 0.06, 0.45, 5).translate(0, 0.225, 0),
  new THREE.IcosahedronGeometry(0.27, 0).translate(0, 0.66, 0), new THREE.IcosahedronGeometry(0.22, 0).translate(0.17, 0.56, 0.05),
  new THREE.IcosahedronGeometry(0.21, 0).translate(-0.15, 0.58, -0.08), new THREE.IcosahedronGeometry(0.2, 0).translate(0.02, 0.55, 0.18),
  new THREE.IcosahedronGeometry(0.18, 0).translate(-0.04, 0.82, -0.04),
]);
const TREES = { conifer: [], broad: [] };
{
  const P = { evergreen: [0.1, 0.85], mixed: [0.1, 0.5], deciduous: [0.1, 0.18], woody_wet: [0.07, 0.65], shrub_wet: [0.012, 0.5] };   // [trees per 1.5-m cell, share conifer]
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] !== LAND || GEO.toWater[i] < 0.8) continue;
    const p = P[GEO.CLASSES[GEO.cover[i]]]; if (!p || Math.random() > p[0]) continue;
    const [cx, cy] = GEO.cellCentre(i), x = cx + rnd(-0.75, 0.75), y = cy + rnd(-0.75, 0.75);
    (Math.random() < p[1] ? TREES.conifer : TREES.broad).push({ x, y, elev: GEO.elevAt(x, y), level: GEO.levelAt(x, y), rot: rnd(0, 6.28), k: Math.random() });
  }
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) {   // the far land's forest (6-m cells), sparser
    const q = i % FAR3.NX, r = (i / FAR3.NX) | 0, cx = FAR3.X0 + (q + 0.5) * FAR3.CELL, cy = FAR3.Y0 + (r + 0.5) * FAR3.CELL;
    if (cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX) continue;
    const p = P[GEO.CLASSES[FAR_COVER[i]]]; if (!p) continue;
    for (let k = 0, m = p[0] * 16 * 0.3; k < m && Math.random() < m - k; k++) {
      const x = cx + rnd(-3, 3), y = cy + rnd(-3, 3);
      (Math.random() < p[1] ? TREES.conifer : TREES.broad).push({ x, y, elev: farElev(i), level: farLevel(y), rot: rnd(0, 6.28), k: Math.random() });
    }
  }
  // real heights: spruce, fir, white pine 10–24 m; maple, birch, aspen, oak 9–20 m (drawn × the land's scale)
  for (const t of TREES.conifer) t.h = 10 + Math.pow(t.k, 0.8) * 14;
  for (const t of TREES.broad) t.h = 9 + t.k * 11;
}
const treeMeshes = {
  conifer: new THREE.InstancedMesh(coniferG, new THREE.MeshStandardNodeMaterial({ roughness: 0.9 }), TREES.conifer.length),
  broad: new THREE.InstancedMesh(broadG, new THREE.MeshStandardNodeMaterial({ roughness: 0.9 }), TREES.broad.length),
};
function placeTrees() {
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), kl = kLand();
  for (const kind of ['conifer', 'broad']) {
    const mesh = treeMeshes[kind], bare = kind === 'broad' && S.season === 'winter';
    TREES[kind].forEach((t, j) => {
      const H = t.h * kl, W = H * (kind === 'conifer' ? 0.85 : 0.95) * (0.85 + t.k * 0.3) * (bare ? 0.8 : 1);
      p.set(t.x, landY(t.elev, t.level) - 0.05 * kl, -t.y); q.setFromAxisAngle(up, t.rot); mt.compose(p, q, sc.set(W, H, W)); mesh.setMatrixAt(j, mt);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
  }
}
function colourTrees() {
  const c = C(0);
  for (const kind of ['conifer', 'broad']) {
    const cols = TREE_COLS[kind][S.season], mesh = treeMeshes[kind];
    TREES[kind].forEach((t, j) => { mesh.setColorAt(j, c.setHex(cols[Math.floor(t.k * 997) % cols.length]).multiplyScalar(0.82 + ((t.k * 7919) % 1) * 0.36)); });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
}

// ---------- sky and light ----------
let _skyDim = null; const skyDimNode = () => _skyDim || (_skyDim = uniform(1));
const sky = (() => {
  const g = new THREE.SphereGeometry(4500, 32, 16); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  const mat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, fog: false, depthWrite: false });
  mat.colorNode = attribute('color', 'vec3').mul(skyDimNode());
  const m = new THREE.Mesh(g, mat);
  m.position.set((X0 + GEO.XMAX) / 2, 0, -(Y0 + GEO.YMAX) / 2); m.renderOrder = -1; return m;
})();
function styleSky() {
  const top = C(S.season === 'winter' ? 0x8aa6c0 : 0x4f84c0), hor = C(S.season === 'winter' ? 0xe2e8ec : 0xcfdde3), g = sky.geometry, col = g.attributes.color.array, c = C(0);
  for (let k = 0; k < g.attributes.position.count; k++) { const t = Math.max(0, g.attributes.position.getY(k) / 4500); c.copy(hor).lerp(top, Math.pow(t, 0.6)); col.set([c.r, c.g, c.b], k * 3); }
  g.attributes.color.needsUpdate = true; airFog.color.copy(hor).lerp(C(0xc7d6dc), 0.5);
}
{ // the sky as an environment map, so the water reflects it
  const W = 256, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#4f84c0'); gr.addColorStop(0.47, '#cfdde3'); gr.addColorStop(0.5, '#56634a'); gr.addColorStop(1, '#2b3424');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const env = new THREE.CanvasTexture(cv); env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace;
  scene.environment = env; scene.environmentIntensity = 0.55;
}
const hemi = new THREE.HemisphereLight(0xc9dcec, 0x4d4a34, 0.9); scene.add(hemi);
const skyDim = skyDimNode();   // the sky dome's brightness (night → dark)
const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.position.set(-260, 420, 300); scene.add(sun, sun.target);

// ---------- the cut-away: a north–south position; everything south of it is clipped and the section face drawn ----------
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const clipped = new THREE.ClippingGroup(); clipped.clippingPlanes = [clipPlane]; clipped.enabled = false;
const fishView = makeFishView();   // the fish (src/w3/fish3.js), every one an instance, schools as their n fish
const plantsView = makePlantsView(W3);   // the weeds (src/w3/plants3.js): stems, fronds, pads and reeds by each patch's stand
// SPECKS in the water about the eye when under it (suspended detritus, plankton): a sense of depth and of the water moving —
// 2,500 tiny motes in a 10-m box that follows the camera, drifting; the fog fades them with distance (cosmetic)
const specks = (() => {
  const N = 2500, B = 10, g = new THREE.OctahedronGeometry(0.004, 0), seed = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) seed[i] = Math.random() * B;
  g.setAttribute('seed', new THREE.InstancedBufferAttribute(seed, 3));
  const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  const sd = attribute('seed', 'vec3'), drift = vec3(time.mul(0.03), time.mul(-0.012), time.mul(0.02)).add(vec3(sin(time.mul(0.3).add(sd.x)).mul(0.15), sin(time.mul(0.23).add(sd.y)).mul(0.1), sin(time.mul(0.27).add(sd.z)).mul(0.15)));
  const rel = fract(sd.add(drift).sub(cameraPosition).div(B)).sub(0.5).mul(B);   // (wrapped about the eye)
  mat.positionNode = positionGeometry.add(cameraPosition).add(rel);
  mat.colorNode = vec3(0.62, 0.6, 0.42).mul(WU.day).mul(0.6);
  mat.opacityNode = float(0.35);
  const m = new THREE.InstancedMesh(g, mat, N); m.frustumCulled = false; m.visible = false;
  return m;
})();
scene.add(specks);
clipped.add(band, farMesh, water, treeMeshes.conifer, treeMeshes.broad, fishView.mesh, fishView.shadow, plantsView.group);
scene.add(clipped, sky);
const sectionSoil = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicNodeMaterial({ vertexColors: true, side: THREE.DoubleSide }));
const sectionWater = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicNodeMaterial({ vertexColors: true, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
sectionWater.renderOrder = 3; scene.add(sectionSoil, sectionWater);
const cutY = () => Y0 + 8 + S.cutPos * (GEO.YMAX - Y0 - 16);   // (the cut runs through the lakes' band)
function buildSection() {
  sectionSoil.visible = sectionWater.visible = S.cut; clipped.enabled = S.cut; if (!S.cut) return;
  const y = cutY(); clipPlane.constant = -y;   // keep z ≤ −y (north of the cut)
  const xs = [], gy = [], wl = [], BOT = -40;
  for (let x = FAR3.X0 + 3; x <= FAR3.X0 + PW - 3; x += 0.75) {
    const inside = x > X0 && x < GEO.XMAX;
    let g, w = null;
    if (inside) { const b = GEO.bodyAt(x, y), d = GEO.depthAt(x, y), lv = GEO.levelAt(x, y); if (b !== LAND && d > 0) { g = lv - d - BASE; w = lv - BASE; } else g = landY(lv - d, lv); }
    else { const q = Math.min(FAR3.NX - 1, Math.max(0, Math.floor((x - FAR3.X0) / FAR3.CELL))), r = Math.min(FAR3.NY - 1, Math.max(0, Math.floor((y - FAR3.Y0) / FAR3.CELL))); g = landY(farElev(r * FAR3.NX + q), farLevel(y)); }
    xs.push(x); gy.push(g); wl.push(w);
  }
  const sp = [], sc = [], wp = [], wc = [], z = -y + 0.02, top = C(0x6b5a3f), deep = C(0x3a2e22), c = C(0);
  for (let k = 0; k < xs.length - 1; k++) {
    const a = [xs[k], gy[k]], b = [xs[k + 1], gy[k + 1]];
    sp.push(a[0], BOT, z, b[0], BOT, z, a[0], a[1], z, b[0], BOT, z, b[0], b[1], z, a[0], a[1], z);
    for (const yy of [BOT, BOT, a[1], BOT, b[1], a[1]]) { c.copy(deep).lerp(top, Math.min(1, Math.max(0, (yy - BOT) / (Math.max(a[1], b[1]) - BOT + 1e-6)))); sc.push(c.r, c.g, c.b); }
    if (wl[k] !== null && wl[k + 1] !== null) {
      // the water column at this x, a band per 0.25 m coloured by the live water's state there
      const xm = (a[0] + b[0]) / 2, top0 = Math.min(wl[k], wl[k + 1]), bot0 = Math.max(a[1], b[1]);
      for (let zz = top0; zz > bot0 - 0.25; zz -= 0.25) {
        const z1 = zz, z0 = Math.max(bot0, zz - 0.25); if (z1 <= z0) break;
        waterColour(xm, y, -(z1 + z0) / 2, c);
        wp.push(a[0], z0, z, b[0], z0, z, a[0], z1, z, b[0], z0, z, b[0], z1, z, a[0], z1, z); for (let q = 0; q < 6; q++) wc.push(c.r, c.g, c.b);
      }
    }
  }
  const g1 = new THREE.BufferGeometry(); g1.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); g1.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); g2.setAttribute('color', new THREE.Float32BufferAttribute(wc, 3));
  sectionSoil.geometry.dispose(); sectionWater.geometry.dispose(); sectionSoil.geometry = g1; sectionWater.geometry = g2;
  $('cutv').textContent = `${((y - Y0) * 10 / 1000).toFixed(2)} km from the south end`;
}

// the live water's state at (x, y, depth z) as a colour, by the "in the water" choice
const LO = new THREE.Color(), HI = new THREE.Color(), MID = new THREE.Color();
function waterColour(x, y, z, c) {
  const f = LIVE.field, j = f && LIVE.fieldShow === S.show ? W3.cellAt(x, y, z) : -1;
  if (j < 0 || S.show === 'plain') return c.set(0x6f7a52);
  const ramp = (t, a, m, b) => { t = Math.min(1, Math.max(0, t)); return t < 0.5 ? c.copy(LO.set(a)).lerp(MID.set(m), t * 2) : c.copy(MID.set(m)).lerp(HI.set(b), (t - 0.5) * 2); };
  if (S.show === 'temp') return ramp(f[j] / 26, 0x2a4fd0, 0x3fb0a0, 0xe0502a);                     // 0 → 26 °C
  if (S.show === 'o2') return ramp(f[j] * ENVC.O2_MGL / 12, 0x9a1a1a, 0xd8b030, 0x2a80d8);       // 0 → 12 mg/L
  if (S.show === 'algae') return ramp(f[j] / 0.6, 0x4a4a40, 0x6a9a40, 0x40e040);
  if (S.show === 'zoo') return ramp(Math.log10(1 + f[j]) / 3, 0x404048, 0xa08050, 0xffd070);   // µg dry/L
  return c.set(0x6f7a52);
}

// ---------- labels and the angler's field notes ----------
const labels = [], lp = new THREE.Vector3(), lw = new THREE.Vector3();
function label(text, sub, x, y, h, cls, reach = 2500) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls;
  const b = document.createElement('b'); b.textContent = text; el.append(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.append(s); }
  $('labels').append(el); labels.push({ el, x, y, h, reach });
}
for (const B of BODIES) {
  if (B.id === BROOK) continue;
  let sx = 0, sy = 0, n = 0; for (let i = 0; i < GEO.N; i += 7) if (GEO.body[i] === B.id) { const [x, y] = GEO.cellCentre(i); sx += x; sy += y; n++; }
  label(B.name, `${(B.area / 1e4 * 100).toFixed(0)} ha · mean ${B.mean.toFixed(1)} m · max ${B.max.toFixed(1)} m (${(B.max / 0.3048).toFixed(0)} ft)`, sx / n, sy / n, 6, 'name');
}
{ const p = GEO.BROOK_PATH[Math.floor(GEO.BROOK_PATH.length / 2)]; label('Hot Brook', '154 m (shown at half length)', p[0], p[1], 4, 'name', 500); }
label('inflow', 'from the south', GEO.INFLOW[0], GEO.INFLOW[1], 3, 'name', 600); label('outlet', 'to Baskahegan Stream', GEO.OUTLET[0], GEO.OUTLET[1], 3, 'name', 600);
for (const n of GEO.NOTES) label(n.t.replace('Sunfish: ', 'sunfish · '), n.s.replace(/ \(angler's note, 2026\)/, ''), n.xy[0], n.xy[1], 2, 'note', 220);
function placeLabels(w, h) {
  for (const L of labels) {
    lw.set(L.x, GEO.levelAt(L.x, L.y) - BASE + L.h, -L.y); lp.copy(lw).project(camera);
    L.d = camera.position.distanceTo(lw); L.sx = (lp.x + 1) / 2 * w; L.sy = (1 - lp.y) / 2 * h;
    L.vis = lp.z < 1 && Math.abs(lp.x) < 1.05 && Math.abs(lp.y) < 1.05 && L.d < L.reach && !(S.cut && L.y < cutY());
  }
  const placed = [];   // nearest first; a label that would overlap one already shown waits until the camera moves apart
  for (const L of [...labels].sort((a, b) => a.d - b.d)) {
    if (L.vis) { const bw = (L.el.offsetWidth || 120) + 8, bh = (L.el.offsetHeight || 30) + 4, x0 = L.sx - bw / 2, y0 = L.sy - bh;
      if (placed.some(r => x0 < r[2] && x0 + bw > r[0] && y0 < r[3] && y0 + bh > r[1])) L.vis = false; else placed.push([x0, y0, x0 + bw, y0 + bh]); }
    L.el.classList.toggle('off', !L.vis);
    if (L.vis) L.el.style.transform = `translate(${L.sx.toFixed(1)}px, ${L.sy.toFixed(1)}px) translate(-50%, -100%)`;
  }
}

// ---------- legend ----------
function legend() {
  const el = $('legend'); el.replaceChildren();
  const item = (col, txt) => { const d = document.createElement('div'), i = document.createElement('i'); i.style.setProperty('--sw', col); d.append(i, txt); el.append(d); };
  if (S.look === 'chart') {
    $('legtitle').textContent = 'Depth (feet)';
    for (const ft of [0, 4, 8, 12, 16, 18]) { const t = Math.min(1, ft * 0.3048 / 5.6), c = C(0).setRGB(0.55 + (0.02 - 0.55) * t, 0.76 + (0.07 - 0.76) * t, 0.84 + (0.2 - 0.84) * t); item('#' + c.getHexString(), `${ft} ft`); }
    item('#0d1a2e', 'contour every 2 ft');
  } else if (S.look === 'photo') {
    $('legtitle').textContent = 'Aerial photo'; const d = document.createElement('div'); d.textContent = 'USDA NAIP (public domain), re-cut onto the 1/10 layout; tinted for the season'; el.append(d);
  } else {
    $('legtitle').textContent = 'Ground cover';
    const seen = new Set(), c = C(0);
    for (const k of ['evergreen', 'mixed', 'deciduous', 'woody_wet', 'shrub_wet', 'emergent_wet', 'pasture', 'dev_low', 'beach', 'rock_shore']) { const lab = COVER[k][0]; if (seen.has(lab)) continue; seen.add(lab); item('#' + seasonal(k, c).getHexString(), lab); }
    item('#a59672', 'Lake bed: gravel / sand'); item('#52432f', 'Lake bed: mud');
  }
  $('lookhint').textContent = { map: 'Land cover from NLCD 2021 and the wetland inventory; the lake beds from the 1949 soundings.', photo: 'The real shoreline from above: forest, rocky points, the beach on Upper\'s NE shore, the camps, the roads and fields.', chart: 'Every 2 ft of depth a shade darker, with a contour line — like the 1949 MDIFW charts. The water is made see-through.' }[S.look];
}

// ---------- camera: a free rig, named views, under water ----------
const groundAt = (x, z) => { const y = -z; if (x > X0 && x < GEO.XMAX && y > Y0 && y < GEO.YMAX) { const b = GEO.bodyAt(x, y), lv = GEO.levelAt(x, y), d = GEO.depthAt(x, y); return b !== LAND && d > 0 ? lv - d - BASE : landY(lv - d, lv); } return -2; };
const rig = new CameraRig(camera, canvas, { groundAt });
const [ux, uy] = BODIES[0].deepest, [lx, ly] = BODIES[1].deepest;
const VIEWS = {
  'Both lakes': { t: [-5, 10, 0], yaw: 0.25, pitch: -0.62, dist: 560 },
  'Upper lake': { t: [-35, -150, 0], yaw: 0.1, pitch: -0.5, dist: 300 },
  'The brook': { t: [30, 10, 0], yaw: -0.5, pitch: -0.6, dist: 80 },
  'Lower lake': { t: [lx, ly + 30, 0], yaw: 0.2, pitch: -0.5, dist: 260 },
  'West cove': { t: [GEO.NOTES[2].xy[0] + 10, GEO.NOTES[2].xy[1] - 5, 0], yaw: -0.9, pitch: -0.32, dist: 70 },
  'On the water': { t: [ux - 20, uy - 60, 0.2], yaw: 0.05, pitch: -0.04, dist: 28 },
  'Dive in': { t: [ux, uy - 8, -3.4], yaw: 0.9, pitch: -0.25, dist: 5 },
};
function go(name) {
  const v = VIEWS[name]; rig.set(new THREE.Vector3(v.t[0], v.t[2], -v.t[1]), v.yaw, v.pitch, v.dist);
  for (const b of $('views').children) b.setAttribute('aria-pressed', String(b.textContent === name));
}
for (const name of Object.keys(VIEWS)) { const b = document.createElement('button'); b.textContent = name; b.addEventListener('click', () => go(name)); $('views').append(b); }

// ---------- controls ----------
function applyLook() {
  U.photo.value = S.look === 'photo' ? 1 : 0; U.chart.value = S.look === 'chart' ? 1 : 0;
  for (const b of $('looks').children) b.setAttribute('aria-pressed', String(b.dataset.look === S.look));
  styleWater(); legend();
}
function applySeason() {
  U.snow.value = S.season === 'winter' ? 1 : 0; U.fallTint.value = S.season === 'fall' ? 1 : 0; U.springTint.value = S.season === 'spring' ? 1 : 0;
  for (const b of $('seasons').children) b.setAttribute('aria-pressed', String(b.dataset.season === S.season));
  colourGround(); colourTrees(); placeTrees(); styleWater(); styleSky(); legend();
}
function applyHeight() { $('exv').textContent = `×${S.exag}`; placeGround(); placeTrees(); buildSection(); }
for (const b of $('looks').children) b.addEventListener('click', () => { S.look = b.dataset.look; applyLook(); });
for (const b of $('seasons').children) b.addEventListener('click', () => { S.season = b.dataset.season; if (LIVE.worker) { LIVE.worker.postMessage({ type: 'season', yf: SEASON_YF[S.season] }); LIVE.lastSeason = null; } applySeason(); buildSection(); });
for (const b of $('shows').children) b.addEventListener('click', () => { S.show = b.dataset.show; if (LIVE.worker) LIVE.worker.postMessage({ type: 'show', show: S.show }); for (const x of $('shows').children) x.setAttribute('aria-pressed', String(x === b)); if (!S.cut && S.show !== 'plain') { const c = $('t-cut'); c.checked = true; c.dispatchEvent(new Event('change')); } buildSection(); });
$('play').addEventListener('click', () => { LIVE.run = !LIVE.run; $('play').textContent = LIVE.run ? '⏸ pause' : '▶ play'; LIVE.worker?.postMessage({ type: 'run', run: LIVE.run }); });
for (const b of $('speeds').children) b.addEventListener('click', () => { LIVE.speed = +b.dataset.speed; LIVE.worker?.postMessage({ type: 'speed', speed: LIVE.speed }); for (const x of $('speeds').children) x.setAttribute('aria-pressed', String(x === b)); });
$('exag').addEventListener('input', e => { S.exag = +e.target.value; applyHeight(); });
// (the cut opens through Upper's 18-ft north basin, the camera facing the water column; the slider moves it)
const cutAt = y => Math.min(1, Math.max(0, (y - Y0 - 8) / (GEO.YMAX - Y0 - 16)));
$('t-cut').addEventListener('change', e => {
  S.cut = e.target.checked; $('cutpos').disabled = !S.cut;
  if (S.cut) { S.cutPos = cutAt(uy); $('cutpos').value = String(Math.round(S.cutPos * 1000)); }
  buildSection(); if (S.cut) rig.set(new THREE.Vector3(ux, -2.2, -cutY()), 0, -0.12, 55);
});
$('cutpos').addEventListener('input', e => { S.cutPos = +e.target.value / 1000; buildSection(); if (S.cut) rig.goal.target.z = -cutY(); });
$('t-clear').addEventListener('change', e => { S.clear = e.target.checked; styleWater(); });
$('t-water').addEventListener('change', e => { S.water = e.target.checked; styleWater(); });
$('t-trees').addEventListener('change', e => { S.trees = e.target.checked; treeMeshes.conifer.visible = treeMeshes.broad.visible = S.trees; });
$('t-fish').addEventListener('change', e => { S.fish = e.target.checked; fishView.mesh.visible = fishView.shadow.visible = S.fish; });
$('t-plants').addEventListener('change', e => { S.plants = e.target.checked; plantsView.group.visible = S.plants; tintBed(); });
for (const b of $('fishsize').children) b.addEventListener('click', () => { S.fishScale = +b.dataset.scale; for (const x of $('fishsize').children) x.setAttribute('aria-pressed', String(x === b)); });
$('t-labels').addEventListener('change', e => document.body.classList.toggle('nolabels', !e.target.checked));
$('t-notes').addEventListener('change', e => document.body.classList.toggle('nonotes', !e.target.checked));
$('fold').addEventListener('click', () => { const f = $('ctl').classList.toggle('folded'); $('fold').textContent = f ? '+' : '–'; $('fold').setAttribute('aria-expanded', String(!f)); });

// ---------- the live water model and its clock ----------
// THE SIM runs in a Worker (render3/sim3worker.js): each frame the view sends the time passed — only once the last reply is in —
// and draws the latest snapshot meanwhile. W3: the water grid's geometry, for the cut-away's and the ice's lookups
const LIVE = { worker: null, snap: null, waiting: false, dtAcc: 0, rate: 1, lastT: 0, lastW: 0, run: true, speed: 1, lastSeason: null, sinceUI: 0, sinceSection: 0, drawn: 0, field: null, fieldShow: 'plain' };
const SEASON_YF = { spring: 0.24, summer: 0.39, fall: 0.59, winter: 0.95 };   // the season buttons' dates (late May, early July, early Oct, Feb)
const seasonOf = yf => yf < 0.25 ? 'spring' : yf < 0.5 ? 'summer' : yf < 0.75 ? 'fall' : 'winter';
const MONTHS = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];
const MDAYS = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28];
function dateOf(yf) { let d = yf * 365; for (let m = 0; m < 12; m++) { if (d < MDAYS[m]) return `${MONTHS[m]} ${1 + Math.floor(d)}`; d -= MDAYS[m]; } return 'February 28'; }
function liveTick(dtReal) {
  LIVE.dtAcc += dtReal;
  if (!LIVE.worker || LIVE.waiting || !LIVE.snap) return;
  LIVE.worker.postMessage({ type: 'tick', dt: LIVE.dtAcc }); LIVE.dtAcc = 0; LIVE.waiting = true;
}
function onSnap(m) {
  if (m.type === 'plants') { if (plantsView.setData(m.shoots, m.yf, m.mus)) tintBed(); return; }
  if (m.type !== 'snap') return;
  LIVE.snap = m; LIVE.waiting = false;
  if (m.field) { LIVE.field = m.field; LIVE.fieldShow = m.show; }
}
function lightByDay() {   // the sun's height and the sky's brightness follow the water model's day
  const e = LIVE.snap; if (!e) return;
  const s = e.sun, cover = ENVC.CLOUD_COVER[e.weather], day = Math.min(1, s * 1.6);
  sun.intensity = 0.15 + 2.3 * day * (1 - 0.6 * cover); hemi.intensity = 0.18 + 0.75 * day * (1 - 0.3 * cover);
  if (LIVE.under && S.clear) hemi.intensity *= 2.2;   // (under water, seeing into it: a fill light for watching — tea water is dim)
  const ang = (e.t - 0.25) * Math.PI * 2; sun.position.set(-300 * Math.cos(ang), 60 + 420 * Math.max(0.05, Math.sin(ang)), 260);
  sky.material.color = sky.material.color || new THREE.Color(); scene.environmentIntensity = 0.12 + 0.45 * day;
  skyDim.value = 0.12 + 0.88 * day * (1 - 0.35 * cover);
  WU.day.value = 0.1 + 0.9 * day * (1 - 0.3 * cover);   // (the water's light: render3/water3.js)
}
function liveUI() {
  const e = LIVE.snap; if (!e) return;
  // the speed the sim actually runs at (a busy machine can't keep up with the higher ones)
  const now = performance.now(); if (LIVE.lastW) { const r = (e.time - LIVE.lastT) / Math.max(1e-3, (now - LIVE.lastW) / 1000); LIVE.rate += (r - LIVE.rate) * 0.3; } LIVE.lastT = e.time; LIVE.lastW = now;
  const yf = e.yf, hh = Math.floor(e.t * 24), mm = Math.floor((e.t * 24 - hh) * 60);
  $('clock').textContent = `${dateOf(yf)} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} · ${['clear', 'cloudy', 'rain', 'storm'][e.weather]}, wind ${e.windSpeed.toFixed(0)} m/s · ${(e.temp0 ?? 0).toFixed(0)} °C${LIVE.run && LIVE.speed > 1 && LIVE.rate < LIVE.speed * 0.9 ? ` · running at ${LIVE.rate.toFixed(1)}×` : ''}`;
  const ss = seasonOf(yf); if (ss !== LIVE.lastSeason) { LIVE.lastSeason = ss; S.season = ss; applySeason(); }
  placeIce(e.ice);
}

// ---------- frame ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(), fps = 60, nFrames = 0; const UW_DIR = new THREE.Vector3(), SUN4 = [0, 1, 0, 0];
async function start() {
  await renderer.init();
  $('exag').value = String(S.exag);
  // the 3-D water (src/w3/env3.js + chem3.js), opening in late May, and its fish at the real lakes' numbers — in the Worker
  LIVE.worker = new Worker(new URL('./sim3worker.js', import.meta.url), { type: 'module' });
  LIVE.worker.onmessage = ev => onSnap(ev.data);
  LIVE.worker.onerror = ev => { $('status').textContent = 'the simulation stopped: ' + (ev.message || 'error'); console.error(ev); };
  LIVE.worker.postMessage({ type: 'init' });
  placeGround(); applyLook(); liveUI(); applySeason(); buildSection();
  resize(); go('Both lakes'); $('busy').classList.add('done');
  const backend = renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
  renderer.setAnimationLoop(now => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now; fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    rig.update(dt);
    liveTick(dt); lightByDay();
    if (S.plants) plantsView.update(rig.target.x, -rig.target.z, rig.dist);
    if (LIVE.snap && S.fish) {   // (the sun's direction and strength for the fish's shadows on the bed)
      const sp = sun.position, sl = sp.length() || 1, open = 1;
      SUN4[0] = sp.x / sl; SUN4[1] = sp.y / sl; SUN4[2] = sp.z / sl; SUN4[3] = Math.min(1, Math.max(0, LIVE.snap.sun * 1.6)) * (1 - 0.7 * ENVC.CLOUD_COVER[LIVE.snap.weather]) * (S.season === 'winter' ? 0 : open);
      LIVE.drawn = fishView.update(LIVE.snap, Math.min(1, LIVE.snap.acc / 0.1), S.fishScale, 1 - Math.min(1, LIVE.snap.sun * 4), now / 1000, camera.position.x, -camera.position.z, SUN4);
    }
    if ((LIVE.sinceUI += dt) > 0.25) { LIVE.sinceUI = 0; liveUI(); }
    if (S.cut && S.show !== 'plain' && (LIVE.sinceSection += dt) > 0.5) { LIVE.sinceSection = 0; buildSection(); }
    const cx = camera.position.x, cy = -camera.position.z, ch = camera.position.y + BASE;
    const inBandXY = cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX;
    const under = inBandXY && GEO.bodyAt(cx, cy) !== LAND && ch < GEO.levelAt(cx, cy) && S.water;
    WU.under.value = under ? 1 : 0; WU.camDepth.value = under ? GEO.levelAt(cx, cy) - ch : 0; LIVE.under = under;
    if (under) { camera.getWorldDirection(UW_DIR); underwaterFogColor(waterFog.color, UW_DIR.y); waterFog.density = WU.density.value; }
    scene.fog = under ? waterFog : airFog; sky.visible = !under; scene.background = under ? waterFog.color : null; specks.visible = under;
    $('uw').hidden = !under;
    $('needle').setAttribute('transform', `rotate(${(rig.yaw * 180 / Math.PI).toFixed(1)})`);
    renderer.render(scene, camera);
    placeLabels(innerWidth, innerHeight);
    if ((nFrames++ & 15) === 0) $('status').textContent = `${backend} · ${fps.toFixed(0)} fps · land ×${S.exag} · water model ${W3.G.NCELL.toLocaleString()} cells · ${LIVE.snap ? Math.round(LIVE.snap.count).toLocaleString() + ' fish (' + LIVE.snap.agents.toLocaleString() + ' brains) · ' + LIVE.snap.ny.toLocaleString() + ' schools of young' : 'starting the lakes…'}`;
  });
}
start().catch(e => { $('busy').textContent = 'Could not start the 3-D view: ' + e.message; console.error(e); });
window.hb3 = { renderer, scene, camera, rig, GEO, go, S, LIVE, fishView, plantsView, apply: { look: applyLook, season: applySeason, height: applyHeight, section: buildSection } };
