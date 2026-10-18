// main3.js — the 3-D view of the whole Hot Brook lakes (browser layer), from the pure geometry module (src/w3/geometry.js).
// Two worlds (render3/world3sel.js): by default the lakes at 1/10 of their real horizontal size with TRUE depths, the LAND
// (hills, banks) drawn at the lakes' scale × the "land height" slider (×1: in proportion to the lakes; ×10: true metres);
// with `?world=true` the lakes at their TRUE size (docs/TRUE_SCALE.md T6), the land at true height (the slider ×1). The
// water's depth — and everything that lives in it — is true size in both. Looks (map colours, the real aerial photo, a depth
// chart), seasons, a cut-away section, see-into-the-water, labels and the angler's field notes.
// three.js r186 (vendor/, WebGPURenderer → WebGL2). Cosmetic randomness uses Math.random (never core.rand).
import { WORLD_Q } from './world3sel.js';   // (first: it picks the world before geometry.js loads)
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, BODIES, LAND, BROOK, WORLD_TRUE, cellIndex } from '../geometry.js';
import { CameraRig } from './controls3.js';
import { Env3, buildColumns3 } from '../env3.js';
import { makeFishView } from './fish3view.js';
import { makePlantsView, LAYER as PLANT_LAYER } from './plants3view.js';
import { makeRisesView } from './rises3view.js';
import { makeBedView } from './bed3view.js';
import { makeData3 } from './data3.js';
import { WU, waterOut, underwaterFogColor, setClear } from './water3.js';
import { ENV as ENVC, PLANKTON } from '../../config.js';

// the far land and the photo of the world shown (the true world's: tools/hotbrook/build_world3d.py at true size → src/w3/true/)
const { FAR3 } = WORLD_TRUE ? await import('../true/far3d.js') : await import('./far3d.js');
const PHOTO_URL = new URL(WORLD_TRUE ? '../true/naip3.jpg' : './naip3.jpg', import.meta.url).href;
const KM = WORLD_TRUE ? 10 : 1;   // (the view's distances — camera reach, sky, fog, named views, label reach — at kilometres in the true world)
const { attribute, uniform, texture, mix, vec2, vec3, float, fract, smoothstep, min: tmin, clamp: tclamp, dot, reflector, cameraPosition, positionWorld, positionGeometry, normalize, pow, sin, cos, exp, time, abs: tabs, step, length } = THREE.TSL;
const $ = id => document.getElementById(id);
const BASE = GEO.SURF.upper;                                   // three's y = 0 at Upper's water surface
const { NX, NY, X0, Y0 } = GEO;
const S = { exag: WORLD_TRUE ? 1 : 3, look: 'map', season: 'summer', cut: false, cutPos: 0.61, clear: true, water: true, trees: true, show: 'plain', fish: true, fishScale: 1, plants: true };
const kLand = () => WORLD_TRUE ? S.exag : S.exag / 10;   // (the land's height × true: the 1/10 world's ×1 is in proportion to its lakes)
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- renderer, scene, camera ----------
const canvas = $('view');
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 6000 * KM);
// the fog: the air's above the water; under it the tea-coloured water's, its colour following the gaze (render3/water3.js)
// (the air's haze: the true world's as the 1/10 world's at ten times the distance)
const airFog = new THREE.FogExp2(0xc7d6dc, 0.0007 / KM), waterFog = new THREE.FogExp2(0x3b3b20, 0.12);
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
// THE FOREST FROM THE AERIAL PHOTOS (the true world; the human, 2026-10-18: "use the aerial photos for the real clearings"):
// tools/hotbrook/build_canopy3.py reads USDA NAIP — the ~1-m colour and near-infrared tiles about both lakes, the ~4-m colour
// photo beyond — into true/canopy3.jpg: per 4-m cell the tree cover, the conifer share, the bare ground (roads, roofs, gravel)
// and how far to trust them (1 under the tiles, 0.6 on the coarse photo, 0 off it). Where trusted, the trees stand where the
// photo shows crowns, conifers where it shows conifers, and the ground is open where it is open; elsewhere (and in the 1/10
// world) NLCD's classes as before.
const CAN = WORLD_TRUE ? await loadCanopy() : null;
async function loadCanopy() {
  try {
    const { CANOPY } = await import('../true/canopy3.js');
    const blob = await (await fetch(new URL('../true/canopy3.jpg', import.meta.url))).blob();
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const { W, H } = CANOPY, cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0); bmp.close();
    const P = [0, 1, 2, 3].map(k => { const px = g.getImageData(k * W, 0, W, H).data, a = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) a[i] = px[i * 4]; return a; });
    return { ...CANOPY, P };   // (P: cover, conifer share, bare, trust; 0–255, row 0 north)
  } catch (e) { console.warn('canopy3.jpg not read: the forest from NLCD alone', e); return null; }
}
const canQ = new Float32Array(4);   // canopyAt's answer: cover, conifer share, bare, trust (0–1)
function canopyAt(x, y) {   // the photos' forest at a point (bilinear); trust 0 off them
  canQ[3] = 0; if (!CAN) return canQ;
  const u = (x - FAR3.X0) / CAN.M - 0.5, v = (FAR3.Y0 + FAR3.NY * FAR3.CELL - y) / CAN.M - 0.5;
  if (!(u >= 0 && v >= 0 && u < CAN.W - 1 && v < CAN.H - 1)) return canQ;
  const i = u | 0, j = v | 0, a = u - i, b = v - j, o = j * CAN.W + i, W = CAN.W;
  const w00 = (1 - a) * (1 - b) / 255, w10 = a * (1 - b) / 255, w01 = (1 - a) * b / 255, w11 = a * b / 255;
  for (let k = 0; k < 4; k++) { const A = CAN.P[k]; canQ[k] = A[o] * w00 + A[o + 1] * w10 + A[o + W] * w01 + A[o + W + 1] * w11; }
  return canQ;
}
const farLevel = y => GEO.SURF.upper + (GEO.SURF.lower - GEO.SURF.upper) * Math.min(1, Math.max(0, (y + 15 / GEO.SCALE / 10) / (70 / GEO.SCALE / 10)));
const PW = FAR3.NX * FAR3.CELL, PH = FAR3.NY * FAR3.CELL;   // the photo covers the far grid's extent, row 0 north
const photoUV = (x, y) => [(x - FAR3.X0) / PW, (y - FAR3.Y0) / PH];

const photoTex = new THREE.TextureLoader().load(PHOTO_URL);
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

// THE LAND'S PATCHES WITHOUT THE MAP'S SQUARES (the human, 2026-10-18, of the woods: "why is everything like all square? the
// plots in the woods..."). The land cover is NLCD's 30-m pixels (and the wetland inventory's), so a stand, a clearing or a field
// drawn cell by cell was a 30-m square or a staircase of them, and a conifer stand met the hardwoods along a ruler-straight line.
// Each point of the land now shows the class of a point displaced from it by a smooth random field (domain warping: up to
// WARP_A m, typically a third of that — about half a pixel, within the map's own error), so the patches keep their places and
// sizes but take ragged, natural edges. The shore's narrow classes (beach, rocky shore) neither spread nor give way, and the
// first WARP_SHORE m from the water keep the map's class (the shrub fringe). Cosmetic (a hash, never core.rand).
const WARP_A = 30 * GEO.SCALE, WARP_L = 70 * GEO.SCALE, WARP_SHORE = 6 * GEO.SCALE;
const WATERY = new Set(['water', 'stream'].map(k => GEO.CLASSES.indexOf(k))), FIXED = new Uint8Array(GEO.CLASSES.length);
for (const k of ['water', 'stream', 'beach', 'rock_shore']) FIXED[GEO.CLASSES.indexOf(k)] = 1;
// (smooth value noise from a lattice cached over the far land's extent, L m between its points: the displacement is sampled
// a few million times at start-up — the trees' places — and a Math.sin hash for each would cost seconds)
function latticeNoise(L, salt) {
  const nx = Math.ceil(FAR3.NX * FAR3.CELL / L) + 3, ny = Math.ceil(FAR3.NY * FAR3.CELL / L) + 3, t = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) t[j * nx + i] = hash2(i + salt, j - salt * 0.61);
  return (x, y) => {
    let u = (x - FAR3.X0) / L + 1, v = (y - FAR3.Y0) / L + 1; u = u < 0 ? 0 : u > nx - 2 ? nx - 2 : u; v = v < 0 ? 0 : v > ny - 2 ? ny - 2 : v;
    const i = u | 0, j = v | 0, fx = u - i, fy = v - j, a = fx * fx * (3 - 2 * fx), b = fy * fy * (3 - 2 * fy), o = j * nx + i;
    return (t[o] * (1 - a) + t[o + 1] * a) * (1 - b) + (t[o + nx] * (1 - a) + t[o + nx + 1] * a) * b;
  };
}
// the displacement: three octaves (WARP_L, /2.7, /8.1 across) for each of x and y (dropped once the trees are placed)
let WARPN = [1, 2.7, 8.1].flatMap((f, k) => [latticeNoise(WARP_L / f, 11 + 7 * k), latticeNoise(WARP_L / f, 53 + 13 * k)]);
const WARPK = [0.55, 0.3, 0.15];
function mapCover(x, y) {   // the map's class at a point: the band's cell (-1 on its water), else the far land's (-1 off it)
  const i = cellIndex(x, y); if (i >= 0) return GEO.body[i] === LAND ? GEO.cover[i] : -1;
  const q = Math.floor((x - FAR3.X0) / FAR3.CELL), r = Math.floor((y - FAR3.Y0) / FAR3.CELL);
  return q < 0 || r < 0 || q >= FAR3.NX || r >= FAR3.NY ? -1 : FAR_COVER[r * FAR3.NX + q];
}
// the class a point of land shows: its displaced point's — unless that is water or off the map (then `own`, its own cell's);
// d: its distance from the water (m)
function coverAt(x, y, d, own) {
  if (d < WARP_SHORE || FIXED[own]) return own;
  let wx = 0, wy = 0; for (let k = 0; k < 3; k++) { wx += WARPK[k] * WARPN[2 * k](x, y); wy += WARPK[k] * WARPN[2 * k + 1](x, y); }
  const c = mapCover(x + WARP_A * (2 * wx - 1), y + WARP_A * (2 * wy - 1));
  return c < 0 || FIXED[c] ? own : c;
}
// the ground's class at a point of land: NLCD's (displaced) — then, where the photos are trusted, a wooded class with no crowns
// shows as a clearing (bare ground: a road or a yard — in a wooded swamp, the bog's open mat), an open class under crowns as a stand by its conifer share; the
// wetlands, the shore and the water keep NLCD's
const CLI = k => GEO.CLASSES.indexOf(k), WOODED = new Uint8Array(GEO.CLASSES.length), OPENLAND = new Uint8Array(GEO.CLASSES.length);
for (const k of ['evergreen', 'mixed', 'deciduous', 'woody_wet']) WOODED[CLI(k)] = 1;
for (const k of ['grass', 'pasture', 'crops', 'shrub', 'dev_open', 'dev_low', 'barren']) OPENLAND[CLI(k)] = 1;
function shownAt(x, y, d, own) {
  const c = coverAt(x, y, d, own), q = canopyAt(x, y); if (q[3] < 0.5 || !(WOODED[c] || OPENLAND[c])) return c;
  if (q[2] > 0.6) return CLI(c === CLI('woody_wet') ? 'emergent_wet' : 'dev_open');   // (bare in a swamp: the bog's open mat and pools, not a road)
  if (q[0] < 0.35 && WOODED[c]) return CLI('shrub');
  if (q[0] > 0.65 && OPENLAND[c]) return CLI(q[1] > 0.65 ? 'evergreen' : q[1] < 0.35 ? 'deciduous' : 'mixed');
  return c;
}
// each cell's shown class at its centre (the ground's colours): the band's land cells, the far land's cells
const SHOWN = new Uint8Array(GEO.N), FAR_SHOWN = new Uint8Array(FAR3.NX * FAR3.NY);
for (let i = 0; i < GEO.N; i++) { if (GEO.body[i] !== LAND) continue; const [x, y] = GEO.cellCentre(i); SHOWN[i] = shownAt(x, y, GEO.toWater[i], GEO.cover[i]); }
for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { const own = FAR_COVER[i]; FAR_SHOWN[i] = WATERY.has(own) ? own : shownAt(FAR3.X0 + ((i % FAR3.NX) + 0.5) * FAR3.CELL, FAR3.Y0 + (Math.floor(i / FAR3.NX) + 0.5) * FAR3.CELL, 1e9, own); }

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
function colourGround() {   // map colours by season (the bed by depth); a narrow stony waterline (the banks are vegetated to the water — the human's photos)
  const c = C(0), bc = band.geometry.attributes.color.array;
  for (let i = 0; i < GEO.N; i++) {
    const [x, y] = GEO.cellCentre(i);
    if (GEO.body[i] !== LAND) weedBed(i, bedColour(GEO.depth[i], c, x, y));
    else { seasonal(GEO.CLASSES[SHOWN[i]], c); const near = GEO.toWater[i]; if (near < 1.2) c.lerp(C(S.season === 'winter' ? 0xd8dde0 : 0x807a6c), (1 - near / 1.2) * 0.55); c.multiplyScalar(0.9 + hash2(x, y) * 0.2); }
    bc[i * 3] = c.r; bc[i * 3 + 1] = c.g; bc[i * 3 + 2] = c.b;
  }
  band.geometry.attributes.color.needsUpdate = true;
  const fc = farMesh.geometry.attributes.color.array;
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { seasonal(GEO.CLASSES[FAR_SHOWN[i]], c).multiplyScalar(0.9 + hash2(i, 7) * 0.2); fc[i * 3] = c.r; fc[i * 3 + 1] = c.g; fc[i * 3 + 2] = c.b; }
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
// TREES — TRUE SIZE EVERYWHERE (the human, 2026-10-16: first, from their photos from the brook, "the trees, at least in the 1
// terrain height, are way off"; then, of trees shrinking inland, "if we are making this realistic and going to add cabins, and
// roads, the rest of the terrain needs to be realistic too"). Every tree is its real size whatever the land height — white pine
// 20–28 m, spruce and fir 12–20 m, red maple, birch and aspen 10–20 m, real crown proportions (conifers ~0.35 of their height
// across, hardwoods ~0.65) — and the woods are as DENSE as Maine forest (~85 % closed): one true-size crown (~7 m across) for
// every 38 m² of forest × 0.85. On the lakes' 1/10 land that is few trees (the land holds a hundredth of the real woods' area),
// each a real tree. The brook's banks take its scale: the brook is drawn at half its real size (GEO.BROOK_SCALE), so are the
// trees beside it — a 15-m pine by the 4-m brook stands as a 30-m one by the real 8-m brook (the proportion of the photos).
// By the water a second row stands behind the first (crowns overlap): seen from the lake the treeline is continuous.
const BP_ = GEO.BROOK_PATH, HC = GEO.CELL / 2;   // (HC: half a cell — the scatter about a cell's centre)
const brookDist = (x, y) => { let b = 1e9; for (let k = 0; k + 1 < BP_.length; k++) { const [ax, ay] = BP_[k], [bx, by] = BP_[k + 1], vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy))); b = Math.min(b, Math.hypot(x - ax - t * vx, y - ay - t * vy)); } return b; };
const nearScaleAt = (x, y, d) => brookDist(x, y) <= d + GEO.BROOK_W / 2 + 0.75 ? GEO.BROOK_SCALE : 1;
// (TRUE_SCALE T6a: each kind's trees in typed arrays — the true-size lakes and their land hold ~a million — binned in TREE_TILE
// tiles; there only those within TREE_R of where the camera looks are drawn, re-picked as it moves. The 1/10 world draws all)
const TREE_R = WORLD_TRUE ? 1200 : Infinity, TREE_TILE = 200, TREE_F = ['x', 'y', 'H', 'el', 'lv', 'rot', 'k'];
const treeStore = () => ({ n: 0, cap: 0 });
function treePush(T, v) {
  if (T.n === T.cap) { const cap = Math.max(4096, T.cap * 2); for (const f of TREE_F) { const a = new Float32Array(cap); if (T[f]) a.set(T[f]); T[f] = a; } T.cap = cap; }
  for (let q = 0; q < TREE_F.length; q++) T[TREE_F[q]][T.n] = v[q];
  T.n++;
}
const TREES = { conifer: treeStore(), broad: treeStore() };
{
  const P = { evergreen: [1, 0.85], mixed: [1, 0.5], deciduous: [1, 0.18], woody_wet: [0.7, 0.65], shrub_wet: [0.15, 0.5] };   // [stocking, share conifer]
  const COVER = 0.85, CROWN = 7, SHORE_ROWS = 2, SHORE_D = 6;   // (crown m across; by the water ×SHORE_ROWS within SHORE_D m)
  const perArea = (area, ns) => COVER * area / (Math.PI * (CROWN * ns / 2) ** 2);
  // (the conifers in clumps — stands of spruce and fir, of hemlock, among the hardwoods — not salt-and-pepper: each class's
  // conifer share ± up to CLUMP_D by a smooth random field CLUMP_L across)
  const CLUMP_L = 45 * GEO.SCALE, CLUMP_D = 0.6;
  const clumpN = latticeNoise(CLUMP_L, 97), shareAt = (x, y, sh) => Math.min(1, Math.max(0, sh + CLUMP_D * (2 * clumpN(x, y) - 1)));
  const PC = GEO.CLASSES.map(k => P[k] || null);   // (by class index)
  // (a cell takes candidate trees only if a wooded class lies within the displacement's reach of it)
  const woodedAt = (x, y) => { const c = mapCover(x, y); return c >= 0 && !!PC[c]; };
  const woodedNear = (x, y, own) => !!PC[own] || woodedAt(x + WARP_A, y) || woodedAt(x - WARP_A, y) || woodedAt(x, y + WARP_A) || woodedAt(x, y - WARP_A)
    || canopyAt(x, y)[3] > 0;   // (or the photos are trusted here: they may show crowns where NLCD has none)
  // a candidate's [stocking, conifer chance]: NLCD's for the class its place shows — or, where the photos are trusted, theirs:
  // the crowns' cover there (capped in the shrub swamps and marshes: alder and the bog's shrubs are as green as trees) and the
  // photo's conifer share. NLCD's own share is clumped (shareAt)
  const CAP = GEO.CLASSES.map((k, c) => FIXED[c] ? 0 : k === 'shrub_wet' ? 0.3 : k === 'emergent_wet' ? 0.4 : 1), st = new Float32Array(2);
  const stand = (x, y, cls) => {
    const p = PC[cls]; let s = p ? p[0] : 0, c = shareAt(x, y, p ? p[1] : 0.5); const q = canopyAt(x, y), t = q[3];
    if (t > 0) { s = t * q[0] * (1 - q[2]) * CAP[cls] + (1 - t) * s; c = t * q[1] + (1 - t) * c; }   // (none on bare ground: the roads, read at 4 m)
    st[0] = s; st[1] = c; return st;
  };
  const add = (x, y, d, ns, elev, level, cChance) => {
    const conifer = Math.random() < cChance, k = Math.random(), h = conifer ? 12 + Math.pow(k, 0.8) * 16 : 10 + k * 10;
    // (the trunk stands back from the water by ~40 % of its crown's half-width: crowns lean out over the bank, not across it)
    if (d < 0.4 * 0.5 * h * ns * (conifer ? 0.35 : 0.65)) return;
    treePush(conifer ? TREES.conifer : TREES.broad, [x, y, h * ns, elev, level, rnd(0, 6.28), k]);
  };
  // (each cell's candidates at full stocking, each kept by the stocking where it stands — stand)
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] !== LAND) continue;
    const own = GEO.cover[i], d = GEO.toWater[i]; if (d < 0.4) continue;
    const [cx, cy] = GEO.cellCentre(i); if (!woodedNear(cx, cy, own)) continue;
    const ns = d < 40 ? nearScaleAt(cx, cy, d) : 1, m = perArea(GEO.CELL * GEO.CELL, ns) * (d < SHORE_D ? SHORE_ROWS : 1);
    for (let n = 0; n < m + 1; n++) {
      if (Math.random() > m - n) break;
      const x = cx + rnd(-HC, HC), y = cy + rnd(-HC, HC), p = stand(x, y, coverAt(x, y, d, own)); if (!(p[0] > 0) || Math.random() > p[0]) continue;
      add(x, y, d, ns, GEO.elevAt(x, y), GEO.levelAt(x, y), p[1]);
    }
  }
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) {   // the far land's forest (6-m cells), the same stocking
    const q = i % FAR3.NX, r = (i / FAR3.NX) | 0, cx = FAR3.X0 + (q + 0.5) * FAR3.CELL, cy = FAR3.Y0 + (r + 0.5) * FAR3.CELL;
    if (cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX) continue;
    const own = FAR_COVER[i]; if (WATERY.has(own) || !woodedNear(cx, cy, own)) continue;
    const m = perArea(FAR3.CELL * FAR3.CELL, 1);
    for (let n = 0; n < m + 1; n++) {
      if (Math.random() > m - n) break;
      const x = cx + rnd(-FAR3.CELL / 2, FAR3.CELL / 2), y = cy + rnd(-FAR3.CELL / 2, FAR3.CELL / 2), p = stand(x, y, coverAt(x, y, 1e9, own)); if (!(p[0] > 0) || Math.random() > p[0]) continue;
      add(x, y, 1e9, 1, farElev(i), farLevel(y), p[1]);
    }
  }
  WARPN = null;   // (the displacement's lattices: only the start-up's)
}
// the tiles: each store's trees ordered by TREE_TILE tile (a counting sort) over the far land's extent
const TT = { X0: FAR3.X0, Y0: FAR3.Y0, NX: Math.ceil(FAR3.NX * FAR3.CELL / TREE_TILE) + 1, NY: Math.ceil(FAR3.NY * FAR3.CELL / TREE_TILE) + 1 };
const tileOf = (x, y) => Math.min(TT.NY - 1, Math.max(0, Math.floor((y - TT.Y0) / TREE_TILE))) * TT.NX + Math.min(TT.NX - 1, Math.max(0, Math.floor((x - TT.X0) / TREE_TILE)));
for (const T of Object.values(TREES)) {
  T.start = new Int32Array(TT.NX * TT.NY + 1); T.ord = new Int32Array(T.n); const cur = new Int32Array(TT.NX * TT.NY);
  for (let i = 0; i < T.n; i++) T.start[tileOf(T.x[i], T.y[i]) + 1]++;
  for (let t = 0; t < TT.NX * TT.NY; t++) T.start[t + 1] += T.start[t];
  cur.set(T.start.subarray(0, TT.NX * TT.NY)); for (let i = 0; i < T.n; i++) T.ord[cur[tileOf(T.x[i], T.y[i])]++] = i;
}
// THE FOREST IN THREE TIERS (TRUE_SCALE T6b). Every tier is one instanced draw per model from compact per-tree numbers — x,
// the ground's y, z, height (tp); crown width and rotation (tw); colour and bark brightness (tc) — so no matrices, and a tier
// leaves another's ground to it by collapsing the instances in its hole on the GPU (no rebuilds as the camera moves):
// - NEAR, within DET_R of the camera: the real forms. Spruce and fir are narrow spires of ragged, drooping whorls on a trunk; the
//   tallest conifers are white pines, tiers of irregular plumes above a long bare trunk; hardwoods have a trunk and limbs under a
//   lumpy crown, a birch's bark white, the crown gone in winter (bare limbs).
// - MID, within TREE_R of where the view looks (the 1/10 world: every tree): the simple layered cones and lumpy crowns.
// - FAR (the true world): every other tree a cone or a blob, out of the water's mirror (its camera sees layer 0 only).
const DET_R = 250, DET_MOVE = 30;   // m: the near tier's reach about the camera; how far the camera moves before it is re-picked
// geometry: triangles with a foliage flag (fol: 1 leaves, 0 bark) and a shade (ao: darker low and inside the crown)
function treeBuilder() {
  const P = [], F = [], A = [], N = [];
  const nrm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
  const faceN = (a, b, c) => nrm([(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])]);
  // (a triangle; its corners' normals given — or its face's, lifted toward the sky: a whorl of needles lit from above)
  const tri = (a, b, c, fol, ao, na = null, nb = null, nc = null) => {
    if (!na) { const f = faceN(a, b, c), u = nrm([f[0], Math.abs(f[1]) + 0.8, f[2]]); na = nb = nc = u; }
    P.push(...a, ...b, ...c); N.push(...na, ...nb, ...nc); F.push(fol, fol, fol); A.push(ao, ao, ao);
  };
  const cyl = (x0, y0, z0, x1, y1, z1, r0, r1, seg, ao) => {   // a tapered stem from (x0,y0,z0) to (x1,y1,z1)
    const d = [x1 - x0, y1 - y0, z1 - z0], L = Math.hypot(...d), u = d.map(v => v / L);
    const t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], e1 = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], n1 = Math.hypot(...e1);
    const a = e1.map(v => v / n1), b = [u[1] * a[2] - u[2] * a[1], u[2] * a[0] - u[0] * a[2], u[0] * a[1] - u[1] * a[0]];
    const ring = (c, r, s) => { const g = s / seg * Math.PI * 2, co = Math.cos(g) * r, si = Math.sin(g) * r; return [c[0] + a[0] * co + b[0] * si, c[1] + a[1] * co + b[1] * si, c[2] + a[2] * co + b[2] * si]; };
    const rn = s => { const g = s / seg * Math.PI * 2, co = Math.cos(g), si = Math.sin(g); return [a[0] * co + b[0] * si, a[1] * co + b[1] * si, a[2] * co + b[2] * si]; };
    for (let s = 0; s < seg; s++) {
      const p00 = ring([x0, y0, z0], r0, s), p01 = ring([x0, y0, z0], r0, s + 1), p10 = ring([x1, y1, z1], r1, s), p11 = ring([x1, y1, z1], r1, s + 1), n0 = rn(s), n1 = rn(s + 1);
      tri(p00, p10, p01, 0, ao, n0, n0, n1); tri(p01, p10, p11, 0, ao, n1, n0, n1);
    }
  };
  const blob = (cx, cy, cz, rx, ry, rz, ao, seed) => {   // a lump of leaves: an icosahedron, its corners pushed in and out a little
    const g = new THREE.IcosahedronGeometry(1, 0).toNonIndexed(), p = g.attributes.position.array;
    const jit = v => 0.82 + 0.36 * ((Math.sin(seed * 12.9898 + v * 78.233) * 43758.5453) % 1 + 1) % 1;
    for (let q = 0; q < p.length; q += 9) {
      const v = [0, 1, 2].map(k => { const o = q + k * 3, j = jit(Math.round(p[o] * 7 + p[o + 1] * 13 + p[o + 2] * 29)); return [cx + p[o] * rx * j, cy + p[o + 1] * ry * j, cz + p[o + 2] * rz * j]; });
      const n = v.map(w => nrm([(w[0] - cx) / rx, (w[1] - cy) / ry + 0.35, (w[2] - cz) / rz]));   // (rounded: the clump's own normal, a little skyward)
      tri(v[0], v[1], v[2], 1, ao * (0.85 + 0.15 * Math.max(0, (v[0][1] + v[1][1] + v[2][1]) / 3 - cy) / ry), n[0], n[1], n[2]);
    }
  };
  const hsh = (i, k) => { const h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); };
  const done = () => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('fol', new THREE.Float32BufferAttribute(F, 1)); g.setAttribute('ao', new THREE.Float32BufferAttribute(A, 1)); return g;
  };
  return { tri, cyl, blob, hsh, done };
}
function spireG() {   // spruce and balsam fir: a narrow spire of drooping, ragged whorls about a trunk; a spike on top
  const B = treeBuilder(), N = 12, SEG = 9;
  B.cyl(0, 0, 0, 0, 0.9, 0, 0.028, 0.008, 6, 0.75);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), y = 0.1 + t * 0.78, r = 0.5 * Math.pow(1 - t, 0.85) + 0.05, droop = 0.05 + 0.11 * (1 - t), rot = i * 0.71;
    const apex = [0, y + 0.05 + 0.05 * (1 - t), 0], rim = [];
    for (let s = 0; s < SEG; s++) { const a = rot + s / SEG * Math.PI * 2, rr = r * (0.78 + 0.44 * B.hsh(i, s)); rim.push([Math.cos(a) * rr, y - droop * (0.6 + 0.8 * B.hsh(i, s + 50)), Math.sin(a) * rr]); }
    for (let s = 0; s < SEG; s++) B.tri(apex, rim[(s + 1) % SEG], rim[s], 1, 0.58 + 0.42 * t);
  }
  for (let s = 0; s < 6; s++) { const a = s / 6 * Math.PI * 2, b = (s + 1) / 6 * Math.PI * 2; B.tri([0, 1, 0], [Math.cos(b) * 0.04, 0.86, Math.sin(b) * 0.04], [Math.cos(a) * 0.04, 0.86, Math.sin(a) * 0.04], 1, 1); }
  return B.done();
}
function pineG() {   // eastern white pine: a long trunk, then tiers of irregular plumes held out level, the top a plume too
  const B = treeBuilder();
  B.cyl(0, 0, 0, 0, 0.93, 0, 0.032, 0.01, 6, 0.75);
  for (let i = 0; i < 6; i++) {
    const y = 0.42 + i * 0.095, n = 3 + (i % 2), reach = (0.42 - i * 0.05) * (0.8 + 0.4 * B.hsh(i, 9));
    for (let b = 0; b < n; b++) {
      const a = i * 1.37 + b / n * Math.PI * 2 + (B.hsh(i, b) - 0.5) * 0.8, rr = reach * (0.75 + 0.5 * B.hsh(i, b + 20));
      B.cyl(0, y - 0.02, 0, Math.cos(a) * rr * 0.75, y + 0.01, Math.sin(a) * rr * 0.75, 0.008, 0.004, 4, 0.7);   // (the limb)
      B.blob(Math.cos(a) * rr * 0.62, y + 0.02, Math.sin(a) * rr * 0.62, rr * 0.48, 0.055 + 0.03 * B.hsh(i, b + 40), rr * 0.36, 0.62 + 0.38 * i / 5, i * 10 + b);
    }
  }
  B.blob(0.02, 0.97, 0, 0.1, 0.05, 0.08, 1, 99);
  return B.done();
}
function hardG() {   // red maple, aspen, birch: a trunk forking into limbs under a lumpy crown
  const B = treeBuilder();
  B.cyl(0, 0, 0, 0.01, 0.5, 0, 0.042, 0.028, 7, 0.8);
  for (let l = 0; l < 3; l++) { const a = l * 2.1 + 0.4; B.cyl(0.01, 0.46, 0, Math.cos(a) * 0.17, 0.74, Math.sin(a) * 0.17, 0.022, 0.009, 5, 0.75); }
  for (let q = 0; q < 24; q++) {
    const a = q * 2.399, u = B.hsh(q, 3), rr = 0.32 * Math.sqrt(B.hsh(q, 5)), y = 0.5 + 0.44 * u;
    const sz = 0.09 + 0.07 * B.hsh(q, 7);
    B.blob(Math.cos(a) * rr * (1 - 0.35 * u), y, Math.sin(a) * rr * (1 - 0.35 * u), sz * 1.15, sz * 0.9, sz * 1.15, 0.62 + 0.38 * u, q);
  }
  return B.done();
}
// a tier: one instanced draw of geometry `geo` holding up to `cap` trees; `holes`: [{C (uniform vec2: x, −y), R}] its trees inside
// are collapsed (another tier's ground); `bare`: a uniform that takes the leaves away (winter)
function tierMesh(geo, cap, { holes = [], side = THREE.FrontSide, bare = null, layer = 0 } = {}) {
  const g = new THREE.InstancedBufferGeometry(); if (geo.index) g.setIndex(geo.index);
  for (const k in geo.attributes) g.setAttribute(k, geo.attributes[k]);
  g.instanceCount = 0;
  const n = Math.max(1, cap);
  g.setAttribute('tp', new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4));
  g.setAttribute('tw', new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2));
  g.setAttribute('tc', new THREE.InstancedBufferAttribute(new Uint8Array(n * 4), 4, true));
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.9, side }), P = attribute('tp', 'vec4'), Wr = attribute('tw', 'vec2'), TC = attribute('tc', 'vec4');
  const leafy = !!geo.attributes.fol, fol = leafy ? attribute('fol', 'float') : float(1), ao = leafy ? attribute('ao', 'float') : float(1);
  let p = positionGeometry; if (bare && leafy) p = p.mul(float(1).sub(fol.mul(bare)));
  p = p.mul(vec3(Wr.x, P.w, Wr.x));
  const co = cos(Wr.y), si = sin(Wr.y);
  // (each tree leaves for the next tier at its own distance — RAG of the hole's radius, by its random turn — so a tier's edge is a
  // ragged band of mixed trees, not a circle on the forest)
  const rag = Wr.y.div(6.28).mul(0.5).add(0.75);
  let keep = float(1); for (const h of holes) keep = keep.mul(step(h.R.mul(rag), length(vec2(P.x, P.z).sub(h.C))));
  m.positionNode = vec3(p.x.mul(co).sub(p.z.mul(si)), p.y, p.x.mul(si).add(p.z.mul(co))).mul(keep).add(vec3(P.x, P.y, P.z));
  m.colorNode = mix(mix(vec3(0.2, 0.17, 0.13), vec3(0.8, 0.8, 0.76), TC.w), TC.xyz, fol).mul(ao.mul(0.45).add(0.55));   // (the shade softened: crowns seen from below stay green)
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.layers.set(layer); mesh.userData.cap = cap; return mesh;
}
const camHole = { C: uniform(new THREE.Vector2(1e9, 1e9)), R: uniform(DET_R) }, viewHole = { C: uniform(new THREE.Vector2(1e9, 1e9)), R: uniform(TREE_R) }, bareU = uniform(0);
const TIERS = {
  midConifer: tierMesh(coniferG, WORLD_TRUE ? Math.min(TREES.conifer.n, 200000) : TREES.conifer.n, { holes: [camHole] }),
  midBroad: tierMesh(broadG, WORLD_TRUE ? Math.min(TREES.broad.n, 200000) : TREES.broad.n, { holes: [camHole] }),
  spire: tierMesh(spireG(), 20000, { side: THREE.DoubleSide }),
  pine: tierMesh(pineG(), 8000, { side: THREE.DoubleSide }),
  hard: tierMesh(hardG(), 20000, { side: THREE.DoubleSide, bare: bareU }),
};
if (WORLD_TRUE) {
  TIERS.farConifer = tierMesh(new THREE.ConeGeometry(0.4, 0.85, 6, 1, true).translate(0, 0.575, 0), TREES.conifer.n, { holes: [viewHole, camHole], layer: PLANT_LAYER });
  TIERS.farBroad = tierMesh(new THREE.OctahedronGeometry(0.36, 0).scale(1, 0.8, 1).translate(0, 0.62, 0), TREES.broad.n, { holes: [viewHole, camHole], layer: PLANT_LAYER });
}
const PINE_H = 21;   // m: conifers this tall drawn as white pines near the camera (the canopy's emergent pines; spruce and fir are 12–20 m)
// one tree into a tier's slot j
function putTree(mesh, j, T, i, kind, wf) {
  const g = mesh.geometry, tp = g.attributes.tp.array, tw = g.attributes.tw.array, tc = g.attributes.tc.array, c = putTree.c || (putTree.c = C(0));
  const H = T.H[i], k = T.k[i], bare = kind === 'broad' && S.season === 'winter', cols = TREE_COLS[kind][S.season];
  tp[j * 4] = T.x[i]; tp[j * 4 + 1] = landY(T.el[i], T.lv[i]) - 0.05 * kLand(); tp[j * 4 + 2] = -T.y[i]; tp[j * 4 + 3] = H;
  tw[j * 2] = H * wf * (0.85 + k * 0.3) * (bare && wf === 0.65 ? 0.8 : 1); tw[j * 2 + 1] = T.rot[i];
  c.setHex(cols[Math.floor(k * 997) % cols.length]).multiplyScalar(0.82 + ((k * 7919) % 1) * 0.36);
  tc[j * 4] = Math.min(255, c.r * 255); tc[j * 4 + 1] = Math.min(255, c.g * 255); tc[j * 4 + 2] = Math.min(255, c.b * 255);
  tc[j * 4 + 3] = kind === 'broad' && ((k * 7919 * 3) % 1) < 0.18 ? 230 : kind === 'broad' ? 18 : 8;   // (a birch in six: white bark; the rest dark)
}
function tierDone(mesh, n) { const g = mesh.geometry; g.instanceCount = n; g.attributes.tp.needsUpdate = g.attributes.tw.needsUpdate = g.attributes.tc.needsUpdate = true; }
// the trees of a store within R of (x, y) by its tiles: fn(i) for each. ragged: each tree within its own RAG × R (0.75–1.25 by its
// random turn: the tier's edge a band of mixed trees, as tierMesh's holes take them)
const RAG = rot => 0.75 + 0.5 * rot / 6.28;
function treesNear(T, x, y, R, fn, ragged = false) {
  if (!Number.isFinite(R)) { for (let i = 0; i < T.n; i++) fn(i); return; }
  if (ragged) { const R0 = R; R *= 1.25; const f0 = fn; fn = i => { const r = R0 * RAG(T.rot[i]); if ((T.x[i] - x) ** 2 + (T.y[i] - y) ** 2 < r * r) f0(i); }; }
  const R2 = R * R, g0 = Math.max(0, Math.floor((x - R - TT.X0) / TREE_TILE)), g1 = Math.min(TT.NX - 1, Math.floor((x + R - TT.X0) / TREE_TILE));
  const h0 = Math.max(0, Math.floor((y - R - TT.Y0) / TREE_TILE)), h1 = Math.min(TT.NY - 1, Math.floor((y + R - TT.Y0) / TREE_TILE));
  for (let gy = h0; gy <= h1; gy++) for (let gx = g0; gx <= g1; gx++) {
    const t = gy * TT.NX + gx;
    for (let o = T.start[t]; o < T.start[t + 1]; o++) { const i = T.ord[o]; if ((T.x[i] - x) ** 2 + (T.y[i] - y) ** 2 < R2) fn(i); }
  }
}
function placeFarForest() {   // every tree in the far tier (the true world): on a change of the land's height or the season
  if (!TIERS.farConifer) return;
  for (const [kind, mesh] of [['conifer', TIERS.farConifer], ['broad', TIERS.farBroad]]) { const T = TREES[kind], wf = kind === 'conifer' ? 0.35 : 0.65; for (let i = 0; i < T.n; i++) putTree(mesh, i, T, i, kind, wf); tierDone(mesh, T.n); }
}
let treeAt = null, detAt = null;   // (where the mid tier was picked about — the view's target — and the near tier — the camera)
function placeNearTrees() {   // the near tier about the camera, and the hole the others leave it
  const x = camera.position.x, y = -camera.position.z; detAt = [x, y]; camHole.C.value.set(x, -y);
  let ns = 0, np = 0, nh = 0;
  treesNear(TREES.conifer, x, y, DET_R, i => { const pine = TREES.conifer.H[i] >= PINE_H; if (pine) { if (np < TIERS.pine.userData.cap) putTree(TIERS.pine, np++, TREES.conifer, i, 'conifer', 0.5); } else if (ns < TIERS.spire.userData.cap) putTree(TIERS.spire, ns++, TREES.conifer, i, 'conifer', 0.33); }, true);
  treesNear(TREES.broad, x, y, DET_R, i => { if (nh < TIERS.hard.userData.cap) putTree(TIERS.hard, nh++, TREES.broad, i, 'broad', 0.65); }, true);
  tierDone(TIERS.spire, ns); tierDone(TIERS.pine, np); tierDone(TIERS.hard, nh);
}
function placeTrees(treesOnly = false) {   // the mid tier about where the view looks (each tree's place, size and colour), then the near
  const tx = rig.goal.target.x, ty = -rig.goal.target.z; treeAt = [tx, ty]; viewHole.C.value.set(tx, -ty); bareU.value = S.season === 'winter' ? 1 : 0;
  if (!treesOnly) placeFarForest();
  for (const [kind, mesh] of [['conifer', TIERS.midConifer], ['broad', TIERS.midBroad]]) {
    const T = TREES[kind], cap = mesh.userData.cap, wf = kind === 'conifer' ? 0.35 : 0.65; let j = 0;
    treesNear(T, tx, ty, TREE_R, i => { if (j < cap) putTree(mesh, j++, T, i, kind, wf); }, true);
    tierDone(mesh, j);
  }
  placeNearTrees();
  if (!treesOnly) placeShrubs();
}
const treeMeshList = () => Object.values(TIERS);
// THE WATER'S EDGE: alder, sweetgale and leatherleaf thickets, true size (1.5–4 m), dense along every forested or wet bank
const shrubG = mergeGeo(Array.from({ length: 11 }, (_, k) => {   // (a leafy mass: eleven lumps on a low dome, fixed pseudo-random)
  const a = k * 2.399, r = 0.12 + 0.3 * ((k * 0.618) % 1), h = 0.25 + 0.45 * (1 - r / 0.42) * ((k * 0.381 + 0.3) % 1);
  return new THREE.IcosahedronGeometry(0.16 + 0.1 * ((k * 0.73) % 1), 0).translate(Math.cos(a) * r, h, Math.sin(a) * r);
}));
const SHRUBS = [];
{
  const P = { evergreen: 0.45, mixed: 0.5, deciduous: 0.5, woody_wet: 0.7, shrub_wet: 0.85, emergent_wet: 0.3, shrub: 0.6, grass: 0.12 };
  for (let i = 0; i < GEO.N; i++) {
    if (GEO.body[i] !== LAND) continue;
    const cls = GEO.CLASSES[GEO.cover[i]], d = GEO.toWater[i], p = P[cls];
    if (!p || d < 0.15 || d > Math.max(cls === 'shrub_wet' || cls === 'woody_wet' ? 3.5 : 2.2, 1.1 * GEO.CELL)) continue;   // (the first row of cells by the water, whatever the cell)
    for (let k = 0; k < 2 * GEO.CELL / 1.5; k++) {   // (two to a 1.5-m cell's length of bank)
      if (Math.random() > p * 0.6) continue;
      const [cx, cy] = GEO.cellCentre(i), x = cx + rnd(-HC, HC), y = cy + rnd(-HC, HC);
      SHRUBS.push({ x, y, elev: GEO.elevAt(x, y), level: GEO.levelAt(x, y), rot: rnd(0, 6.28), k: Math.random(), h: (1.2 + Math.random() * 2) * nearScaleAt(x, y, d) });
    }
  }
}
const shrubMesh = new THREE.InstancedMesh(shrubG, new THREE.MeshStandardNodeMaterial({ roughness: 0.95 }), Math.max(1, SHRUBS.length));
function placeShrubs() {
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), bare = S.season === 'winter';
  SHRUBS.forEach((t, j) => {
    const H = t.h * (bare ? 0.75 : 1), W = t.h * (0.8 + t.k * 0.6);
    p.set(t.x, landY(t.elev, t.level) - 0.1, -t.y); q.setFromAxisAngle(up, t.rot); mt.compose(p, q, sc.set(W, H, W)); shrubMesh.setMatrixAt(j, mt);
  });
  shrubMesh.count = SHRUBS.length; shrubMesh.instanceMatrix.needsUpdate = true; shrubMesh.computeBoundingSphere();
}
function colourShrubs() {
  const c = C(0), cols = { spring: [0x6e9a44, 0x5d8a3a], summer: [0x3f6a2c, 0x4d7634, 0x37602a], fall: [0x9a6a2c, 0xb08436, 0x7a4a26], winter: [0x5a4a3e, 0x6a5a4c] }[S.season];
  SHRUBS.forEach((t, j) => { shrubMesh.setColorAt(j, c.setHex(cols[Math.floor(t.k * 97) % cols.length]).multiplyScalar(0.8 + ((t.k * 7919) % 1) * 0.4)); });
  if (shrubMesh.instanceColor) shrubMesh.instanceColor.needsUpdate = true;
}
// ROCKS IN THE BROOK (the human's photos, 2026-10-16: the riffle "after the pool where there is shallow type rapids" — cobbles
// and boulders breaking the surface): on the brook's bed where it runs shallow, a few in the pool; partly buried, flattened
const ROCKS = [];
for (let i = 0; i < GEO.N; i++) {
  if (GEO.body[i] !== BROOK) continue;
  const [cx, cy] = GEO.cellCentre(i), n = Math.round((GEO.depth[i] < 0.7 ? 5 : 1) * (GEO.CELL / 1.5) ** 2);
  for (let k = 0; k < n; k++) {
    const x = cx + rnd(-HC, HC), y = cy + rnd(-HC, HC), dd = GEO.depthAt(x, y); if (!(dd > 0.05) || GEO.bodyAt(x, y) !== BROOK) continue;
    ROCKS.push({ x, y, dd, r: 0.08 + Math.pow(Math.random(), 2) * 0.42, sy: GEO.levelAt(x, y) - BASE, rx: rnd(0, 6.28), ry: rnd(0, 6.28), k: Math.random() });
  }
}
const rockMesh = (() => {
  const g = new THREE.DodecahedronGeometry(0.5, 0); g.setAttribute('sy', new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, ROCKS.length)), 1));
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.8, metalness: 0 }); m.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y));
  const mesh = new THREE.InstancedMesh(g, m, Math.max(1, ROCKS.length)), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c = C(0);
  ROCKS.forEach((r, j) => {
    p.set(r.x, r.sy - r.dd + r.r * 0.3, -r.y); e.set(r.rx * 0.2, r.ry, 0); q.setFromEuler(e); mt.compose(p, q, sc.set(r.r * 2, r.r * 1.2, r.r * 1.7)); mesh.setMatrixAt(j, mt);
    g.attributes.sy.array[j] = r.sy; mesh.setColorAt(j, c.setHex(r.k < 0.5 ? 0x4a4842 : 0x5e5446).multiplyScalar(0.75 + r.k * 0.5));
  });
  mesh.count = ROCKS.length; return mesh;
})();
function colourTrees() { colourShrubs(); }   // (the trees take their colours where placeTrees puts them)

// ---------- sky and light ----------
let _skyDim = null; const skyDimNode = () => _skyDim || (_skyDim = uniform(1));
const sky = (() => {
  const g = new THREE.SphereGeometry(4500 * KM, 32, 16); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  const mat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, fog: false, depthWrite: false });
  mat.colorNode = attribute('color', 'vec3').mul(skyDimNode());
  const m = new THREE.Mesh(g, mat);
  m.position.set((X0 + GEO.XMAX) / 2, 0, -(Y0 + GEO.YMAX) / 2); m.renderOrder = -1; return m;
})();
function styleSky() {
  const top = C(S.season === 'winter' ? 0x8aa6c0 : 0x4f84c0), hor = C(S.season === 'winter' ? 0xe2e8ec : 0xcfdde3), g = sky.geometry, col = g.attributes.color.array, c = C(0);
  for (let k = 0; k < g.attributes.position.count; k++) { const t = Math.max(0, g.attributes.position.getY(k) / (4500 * KM)); c.copy(hor).lerp(top, Math.pow(t, 0.6)); col.set([c.r, c.g, c.b], k * 3); }
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
const risesView = makeRisesView(W3);   // the insects on the film, the rises, splashes and leaps of the fish that take them
const bedView = makeBedView(plantsView);   // the crayfish out on the bed and the snails (littoral3), near the camera
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
clipped.add(band, farMesh, water, ...treeMeshList(), shrubMesh, rockMesh, fishView.mesh, fishView.shadow, plantsView.group, risesView.group, bedView.group);
scene.add(clipped, sky);
const sectionSoil = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicNodeMaterial({ vertexColors: true, side: THREE.DoubleSide }));
const sectionWater = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicNodeMaterial({ vertexColors: true, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
sectionWater.renderOrder = 3; scene.add(sectionSoil, sectionWater);
const cutY = () => Y0 + 8 + S.cutPos * (GEO.YMAX - Y0 - 16);   // (the cut runs through the lakes' band)
function buildSection() {
  sectionSoil.visible = sectionWater.visible = S.cut; clipped.enabled = S.cut; if (!S.cut) return;
  const y = cutY(); clipPlane.constant = -y;   // keep z ≤ −y (north of the cut)
  const xs = [], gy = [], wl = [], BOT = -40;
  for (let x = FAR3.X0 + 3; x <= FAR3.X0 + PW - 3; x += Math.max(0.75, GEO.CELL / 2)) {
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
  $('cutv').textContent = `${((y - Y0) / GEO.SCALE / 1000).toFixed(2)} km from the south end`;
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
function label(text, sub, x, y, h, cls, reach = 2500 * KM) {
  const el = document.createElement('div'); el.className = 'lbl ' + cls;
  const b = document.createElement('b'); b.textContent = text; el.append(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.append(s); }
  $('labels').append(el); labels.push({ el, x, y, h, reach });
}
for (const B of BODIES) {
  if (B.id === BROOK) continue;
  let sx = 0, sy = 0, n = 0; for (let i = 0; i < GEO.N; i += 7) if (GEO.body[i] === B.id) { const [x, y] = GEO.cellCentre(i); sx += x; sy += y; n++; }
  label(B.name, `${(B.area / 1e4 / GEO.SCALE ** 2).toFixed(0)} ha · mean ${B.mean.toFixed(1)} m · max ${B.max.toFixed(1)} m (${(B.max / 0.3048).toFixed(0)} ft)`, sx / n, sy / n, 6, 'name');
}
{ const p = GEO.BROOK_PATH[Math.floor(GEO.BROOK_PATH.length / 2)]; label('Hot Brook', WORLD_TRUE ? '154 m' : '154 m (shown at half length)', p[0], p[1], 4, 'name', 500 * Math.sqrt(KM)); }
label('inflow', 'from the south', GEO.INFLOW[0], GEO.INFLOW[1], 3, 'name', 600 * KM); label('outlet', 'to Baskahegan Stream', GEO.OUTLET[0], GEO.OUTLET[1], 3, 'name', 600 * KM);
for (const n of GEO.NOTES) label(n.t.replace('Sunfish: ', 'sunfish · '), n.s.replace(/ \(angler's note, 2026\)/, ''), n.xy[0], n.xy[1], 2, 'note', 220 * Math.sqrt(KM));
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
    $('legtitle').textContent = 'Aerial photo'; const d = document.createElement('div'); d.textContent = WORLD_TRUE ? 'USDA NAIP (public domain); tinted for the season' : 'USDA NAIP (public domain), re-cut onto the 1/10 layout; tinted for the season'; el.append(d);
  } else {
    $('legtitle').textContent = 'Ground cover';
    const seen = new Set(), c = C(0);
    for (const k of ['evergreen', 'mixed', 'deciduous', 'woody_wet', 'shrub_wet', 'emergent_wet', 'pasture', 'dev_low', 'beach', 'rock_shore']) { const lab = COVER[k][0]; if (seen.has(lab)) continue; seen.add(lab); item('#' + seasonal(k, c).getHexString(), lab); }
    item('#a59672', 'Lake bed: gravel / sand'); item('#52432f', 'Lake bed: mud');
  }
  $('lookhint').textContent = { map: CAN ? 'Land cover from NLCD 2021 and the wetland inventory; the trees, clearings and roads near the lakes from the USDA NAIP aerial photos; the lake beds from the 1949 soundings.' : 'Land cover from NLCD 2021 and the wetland inventory; the lake beds from the 1949 soundings.', photo: 'The real shoreline from above: forest, rocky points, the beach on Upper\'s NE shore, the camps, the roads and fields.', chart: 'Every 2 ft of depth a shade darker, with a contour line — like the 1949 MDIFW charts. The water is made see-through.' }[S.look];
}

// ---------- camera: a free rig, named views, under water ----------
const groundAt = (x, z) => { const y = -z; if (x > X0 && x < GEO.XMAX && y > Y0 && y < GEO.YMAX) { const b = GEO.bodyAt(x, y), lv = GEO.levelAt(x, y), d = GEO.depthAt(x, y); return b !== LAND && d > 0 ? lv - d - BASE : landY(lv - d, lv); } return -2; };
const rig = new CameraRig(camera, canvas, { groundAt, maxDist: 2200 * KM });
const [ux, uy] = BODIES[0].deepest, [lx, ly] = BODIES[1].deepest, BM = GEO.BROOK_PATH[Math.floor(GEO.BROOK_PATH.length / 2)], kN = Math.sqrt(KM);   // (kN: the near views' reach)
const VIEWS = {
  'Both lakes': { t: [-5 * KM, 10 * KM, 0], yaw: 0.25, pitch: -0.62, dist: 560 * KM },
  'Upper lake': { t: [-35 * KM, -150 * KM, 0], yaw: 0.1, pitch: -0.5, dist: 300 * KM },
  'The brook': { t: [WORLD_TRUE ? BM[0] : 30, WORLD_TRUE ? BM[1] : 10, 0], yaw: -0.5, pitch: -0.6, dist: 80 * kN },
  'Lower lake': { t: [lx, ly + 30 * KM, 0], yaw: 0.2, pitch: -0.5, dist: 260 * KM },
  'West cove': { t: [GEO.NOTES[2].xy[0] + 10 * kN, GEO.NOTES[2].xy[1] - 5 * kN, 0], yaw: -0.9, pitch: -0.32, dist: 70 * kN },
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
$('t-trees').addEventListener('change', e => { S.trees = e.target.checked; for (const m of treeMeshList()) m.visible = S.trees; shrubMesh.visible = S.trees; });
$('t-fish').addEventListener('change', e => { S.fish = e.target.checked; fishView.mesh.visible = fishView.shadow.visible = bedView.group.visible = S.fish; });
$('t-plants').addEventListener('change', e => { S.plants = e.target.checked; plantsView.group.visible = S.plants; tintBed(); });
for (const b of $('fishsize').children) b.addEventListener('click', () => { S.fishScale = +b.dataset.scale; for (const x of $('fishsize').children) x.setAttribute('aria-pressed', String(x === b)); });
$('t-labels').addEventListener('change', e => document.body.classList.toggle('nolabels', !e.target.checked));
$('t-notes').addEventListener('change', e => document.body.classList.toggle('nonotes', !e.target.checked));
$('fold').addEventListener('click', () => { const f = $('ctl').classList.toggle('folded'); $('fold').textContent = f ? '+' : '–'; $('fold').setAttribute('aria-expanded', String(!f)); });

// ---------- the live water model and its clock ----------
// THE SIM runs in a Worker (render3/sim3worker.js): each frame the view sends the time passed — only once the last reply is in —
// and draws the latest snapshot meanwhile. W3: the water grid's geometry, for the cut-away's and the ice's lookups
const LIVE = { tNow: 0, worker: null, snap: null, waiting: false, dtAcc: 0, rate: 1, lastT: 0, lastW: 0, run: true, speed: 1, lastSeason: null, sinceUI: 0, sinceSection: 0, drawn: 0, field: null, fieldShow: 'plain' };
const SEASON_YF = { spring: 0.24, summer: 0.39, fall: 0.59, winter: 0.95 };   // the season buttons' dates (late May, early July, early Oct, Feb)
const seasonOf = yf => yf < 0.25 ? 'spring' : yf < 0.5 ? 'summer' : yf < 0.75 ? 'fall' : 'winter';
const MONTHS = ['March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];
const MDAYS = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28];
function dateOf(yf) { let d = yf * 365; for (let m = 0; m < 12; m++) { if (d < MDAYS[m]) return `${MONTHS[m]} ${1 + Math.floor(d)}`; d -= MDAYS[m]; } return 'February 28'; }
function liveTick(dtReal) {
  LIVE.dtAcc += dtReal;
  if (!LIVE.worker || LIVE.waiting || !LIVE.snap) return;
  LIVE.worker.postMessage({ type: 'tick', dt: LIVE.dtAcc, cam: [rig.target.x, -rig.target.z, rig.dist] }); LIVE.dtAcc = 0; LIVE.waiting = true;   // (cam: where the view looks — the true-size lakes' focus)
}
function onSnap(m) {
  if (m.type === 'stats') { LIVE.data3?.onStats(m); return; }
  if (m.type === 'progress') { LIVE.progress = `${m.text} (${m.s.toFixed(1)} s)`; return; }
  if (m.type === 'error') { LIVE.failed = m.text; $('status').textContent = 'the simulation stopped: ' + m.text.split(String.fromCharCode(10))[0]; console.error(m.text); return; }
  if (m.type === 'plants') { if (plantsView.setData(m.shoots, m.yf, m.mus, m.dead)) tintBed(); if (m.surf) risesView.setSurf(m.surf); if (m.bed) bedView.setData(m.bed, m.wY); return; }
  if (m.type !== 'snap') return;
  LIVE.snap = m; LIVE.waiting = false; if (m.sel) LIVE.data3?.onSel(m.sel);
  if (m.rises && m.rises.length && S.fish) risesView.add(m.rises, LIVE.tNow, S.fishScale);   // (on the frame loop's clock)
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
  $('clock').textContent = `${dateOf(yf)} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} · ${['clear', 'cloudy', 'rain', 'storm'][e.weather]}, wind ${e.windSpeed.toFixed(0)} m/s · ${(e.temp0 ?? 0).toFixed(0)} °C${LIVE.run && LIVE.speed > 1 && LIVE.rate < LIVE.speed * 0.9 ? ` · running at ${LIVE.rate >= 100 ? Math.round(LIVE.rate).toLocaleString() : LIVE.rate.toFixed(1)}×` : ''}`;
  const ss = seasonOf(yf); if (ss !== LIVE.lastSeason) { LIVE.lastSeason = ss; S.season = ss; applySeason(); }
  if (!WORLD_TRUE || (LIVE.iceN = (LIVE.iceN || 0) + 1) % 8 === 1) placeIce(e.ice);   // (the true world's 630,000 vertices: every 2 s)
}
// the link between the two worlds, and what the panel says of the one shown
function worldLink() {
  if (!WORLD_TRUE) return;
  $('worldlink').href = 'w3.html'; $('worldlink').textContent = 'Open the 1/10-size lakes instead';
  $('about').textContent = 'Upper and Lower Hot Brook Lake and the brook between them at their REAL size — 369 and 274 ha, the brook 154 m — with their real depths (the 1949 survey soundings) and the land at its true height. The water and its fish are simulated live: about 1.2 million fish of the eleven species recorded in these lakes, at the real lakes\' numbers, each fish (or each school) with its own brain. The fish near where you look live second by second; the rest live their time in blocks.';
  $('exv').nextElementSibling.textContent = '×3'; $('exv').previousElementSibling.textContent = 'true';
}

// ---------- frame ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(), fps = 60, nFrames = 0; const UW_DIR = new THREE.Vector3(), SUN4 = [0, 1, 0, 0];
async function start() {
  await renderer.init();
  if (WORLD_TRUE) { const ex = $('exag'); ex.min = '1'; ex.max = '3'; ex.step = '0.25'; ex.setAttribute('aria-label', 'Land height: 1 = true metres'); }
  $('exag').value = String(S.exag); worldLink();
  // the 3-D water (src/w3/env3.js + chem3.js), opening in late May, and its fish at the real lakes' numbers — in the Worker
  LIVE.worker = new Worker(new URL('./sim3worker.js' + WORLD_Q, import.meta.url), { type: 'module' });
  // (the worker says when its modules have loaded — the true world's geometry awaits its 5-MB data module, and a message sent
  // before its handler exists would be lost — and only then is told to found the lakes)
  LIVE.worker.onmessage = ev => { if (ev.data.type === 'loaded') LIVE.worker.postMessage({ type: 'init', cam: [rig.goal.target.x, -rig.goal.target.z, rig.goal.dist] }); else onSnap(ev.data); };
  LIVE.data3 = makeData3({ LIVE, camera, canvas, rig });   // (the data page and click-a-fish: render3/data3.js)
  LIVE.worker.onerror = ev => { $('status').textContent = 'the simulation stopped: ' + (ev.message || 'error'); console.error(ev); };
  placeGround(); applyLook(); liveUI(); applySeason(); buildSection();
  resize(); go('Both lakes'); $('busy').classList.add('done');
  const backend = renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
  renderer.setAnimationLoop(now => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now; fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    LIVE.data3?.update(); rig.update(dt); LIVE.tNow = now / 1000;
    if (Number.isFinite(TREE_R) && S.trees && treeAt && Math.hypot(rig.goal.target.x - treeAt[0], -rig.goal.target.z - treeAt[1]) > TREE_R / 5) placeTrees(true);
    else if (S.trees && detAt && Math.hypot(camera.position.x - detAt[0], -camera.position.z - detAt[1]) > DET_MOVE) placeNearTrees();   // (the near tier follows the camera)
    liveTick(dt); lightByDay();
    if (S.plants) plantsView.update(rig.target.x, -rig.target.z, rig.dist);
    risesView.update(now / 1000, rig.target.x, -rig.target.z, rig.dist);
    if (S.fish) bedView.update(now / 1000, rig.target.x, -rig.target.z, rig.dist);
    if (LIVE.snap && S.fish) {   // (the sun's direction and strength for the fish's shadows on the bed)
      const sp = sun.position, sl = sp.length() || 1, open = 1;
      SUN4[0] = sp.x / sl; SUN4[1] = sp.y / sl; SUN4[2] = sp.z / sl; SUN4[3] = Math.min(1, Math.max(0, LIVE.snap.sun * 1.6)) * (1 - 0.7 * ENVC.CLOUD_COVER[LIVE.snap.weather]) * (S.season === 'winter' ? 0 : open);
      LIVE.drawn = fishView.update(LIVE.snap, Math.min(1, LIVE.snap.acc / (LIVE.snap.h || 0.1)), S.fishScale, 1 - Math.min(1, LIVE.snap.sun * 4), now / 1000, camera.position.x, -camera.position.z, SUN4, risesView.leapAt);
    }
    if ((LIVE.sinceUI += dt) > 0.25) { LIVE.sinceUI = 0; liveUI(); }
    if (S.cut && S.show !== 'plain' && (LIVE.sinceSection += dt) > 0.5) { LIVE.sinceSection = 0; buildSection(); }
    const cx = camera.position.x, cy = -camera.position.z, ch = camera.position.y + BASE;
    const inBandXY = cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX;
    const under = inBandXY && GEO.bodyAt(cx, cy) !== LAND && ch < GEO.levelAt(cx, cy) && S.water;
    WU.under.value = under ? 1 : 0; WU.camDepth.value = under ? GEO.levelAt(cx, cy) - ch : 0; LIVE.under = under;
    if (under) { camera.getWorldDirection(UW_DIR); underwaterFogColor(waterFog.color, UW_DIR.y); waterFog.density = WU.density.value; }
    // (under water the tea-coloured water hides everything past ~20 m: the land's trees aren't drawn — the true world's million)
    if (under !== LIVE.wasUnder) { LIVE.wasUnder = under; const tv = S.trees && !under; for (const m of treeMeshList()) m.visible = tv; shrubMesh.visible = tv; }
    scene.fog = under ? waterFog : airFog; sky.visible = !under; scene.background = under ? waterFog.color : null; specks.visible = under;
    $('uw').hidden = !under;
    $('needle').setAttribute('transform', `rotate(${(rig.yaw * 180 / Math.PI).toFixed(1)})`);
    renderer.render(scene, camera);
    placeLabels(innerWidth, innerHeight);
    if ((nFrames++ & 15) === 0 && !LIVE.failed) $('status').textContent = `${backend} · ${fps.toFixed(0)} fps · land ×${S.exag} · water model ${W3.G.NCELL.toLocaleString()} cells · ${LIVE.snap ? Math.round(LIVE.snap.count).toLocaleString() + ' fish (' + LIVE.snap.agents.toLocaleString() + ' brains) · ' + (LIVE.snap.nyAll ?? LIVE.snap.ny).toLocaleString() + ' schools of young' + (WORLD_TRUE ? ` · ${LIVE.snap.nf.toLocaleString()} drawn near the view` : '') : 'starting the lakes…' + (LIVE.progress ? ' ' + LIVE.progress : '')}`;
  });
}
start().catch(e => { $('busy').textContent = 'Could not start the 3-D view: ' + e.message; console.error(e); });
window.hb3 = { renderer, scene, camera, rig, GEO, go, S, LIVE, trees: TREES, tiers: TIERS, fishView, plantsView, risesView, bedView, apply: { look: applyLook, season: applySeason, height: applyHeight, section: buildSection } };
