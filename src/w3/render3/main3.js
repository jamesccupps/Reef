// main3.js — the 3-D view of the whole Hot Brook lakes (browser layer), from the pure geometry module (src/w3/geometry.js).
// Two worlds (render3/world3sel.js): by default the lakes at their TRUE size (docs/TRUE_SCALE.md T6), the land at true height (the
// slider ×1); with `?world=small` the lakes at 1/10 of their real horizontal size with TRUE depths, the LAND (hills, banks) drawn at
// the lakes' scale × the "land height" slider (×1: in proportion to the lakes; ×10: true metres). The
// water's depth — and everything that lives in it — is true size in both. Looks (map colours, the real aerial photo, a depth
// chart), seasons, a cut-away section, see-into-the-water, labels and the angler's field notes.
// three.js r186 (vendor/, WebGPURenderer → WebGL2). Cosmetic randomness uses Math.random (never core.rand).
import { WORLD_Q, R5 } from './world3sel.js';   // (first: it picks the world before geometry.js loads)
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, BODIES, LAND, BROOK, WORLD_TRUE, cellIndex } from '../geometry.js';
import { CameraRig } from './controls3.js';
import { Env3, buildColumns3 } from '../env3.js';
import { makeFishView } from './fish3view.js';
import { makePlantsView, LAYER as PLANT_LAYER } from './plants3view.js';
import { makeRisesView } from './rises3view.js';
import { makeBedView } from './bed3view.js';
import { makeWildView } from './wild3view.js';
import { makeShallowsView } from './shallows3view.js';
import { makeData3 } from './data3.js';
import { makeCampsView, clearedAt } from './camps3view.js';
import { WU, waterOut, underwaterFogColor, setClear } from './water3.js';
import { makeSky } from './sky3.js';
import { drawAtlas, drawBark, spireCards, pineCards, hardCards, ATLAS, TILE } from './trees3.js';
import { makeGpuForest } from './forest3.js';
import { ao } from '../../../vendor/three-0.186.1/addons/GTAONode.js';
import { bloom } from '../../../vendor/three-0.186.1/addons/BloomNode.js';
import { fxaa } from '../../../vendor/three-0.186.1/addons/FXAANode.js';
import { ENV as ENVC, PLANKTON } from '../../config.js';
import { stageR5 } from '../fish3.js';
stageR5(R5);   // (the page's copy of the model's tables — the data page, the legends — as the sim's workers run it: world3sel R5)
// (a failure while the lakes are built — a data module that won't load, an exception before start() — said where the page waits,
// not left as "Building the lakes…" for ever; once the view runs, #busy is gone and these stay quiet)
const busyFail = msg => { const b = document.getElementById('busy'); if (b && !b.classList.contains('done')) { b.textContent = 'Could not start the 3-D view: ' + msg; b.classList.add('failed'); } };
addEventListener('error', e => busyFail(e.message || String(e.error)));
addEventListener('unhandledrejection', e => busyFail(e.reason && e.reason.message || String(e.reason)));

// the far land and the photo of the world shown (the true world's: tools/hotbrook/build_world3d.py at true size → src/w3/true/)
const { FAR3 } = WORLD_TRUE ? await import('../true/far3d.js') : await import('./far3d.js');
const PHOTO_URL = new URL(WORLD_TRUE ? '../true/naip3.jpg' : './naip3.jpg', import.meta.url).href;
const KM = WORLD_TRUE ? 10 : 1;   // (the view's distances — camera reach, sky, fog, named views, label reach — at kilometres in the true world)
const { attribute, uniform, texture, mix, vec2, vec3, float, fract, smoothstep, min: tmin, clamp: tclamp, dot, reflector, cameraPosition, positionWorld, positionGeometry, normalize, pow, sin, cos, exp, time, abs: tabs, step, length,
  varying, transformNormalToView, negateOnBackSide, sRGBTransferEOTF, mx_noise_float, mx_fractal_noise_float, dFdx, dFdy, log2, max: tmax, uniformArray, int, select, positionViewDirection } = THREE.TSL;
const $ = id => document.getElementById(id);
const BASE = GEO.SURF.upper;                                   // three's y = 0 at Upper's water surface
const { NX, NY, X0, Y0 } = GEO;
// (season: the leaves' state — 'spring' fresh, 'summer', 'fall' colours, 'winter' bare — by the date; snow: the land under snow, by
// the sim's ice)
const S = { post: true, exag: WORLD_TRUE ? 1 : 3, look: 'map', season: 'summer', snow: false, cut: false, cutPos: 0.61, clear: true, water: true, trees: true, show: 'plain', fish: true, fishScale: 1, plants: true, wild: true, camps: true };
const kLand = () => WORLD_TRUE ? S.exag : S.exag / 10;   // (the land's height × true: the 1/10 world's ×1 is in proportion to its lakes)
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- renderer, scene, camera ----------
const canvas = $('view');
// (the depth: REVERSED-Z — a float depth buffer run from 1 at the near plane to 0 at the far, as games draw kilometres of land: the
// 5-cm-to-60-km range stays sharp without the logarithmic buffer's depth written by every pixel's shader, which turned off the GPU's
// early depth test — every hidden leaf behind a crown was shaded in full. `?depth=log` the old way, to compare)
const LOGZ = new URLSearchParams(location.search).get('depth') === 'log';
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, logarithmicDepthBuffer: LOGZ, reversedDepthBuffer: !LOGZ, trackTimestamp: true });
// THE RESOLUTION, HELD TO THE FRAME RATE (games' dynamic resolution): the GPU's own time a frame (its timestamp queries) watched;
// past ~14.5 ms — a 60-Hz screen's frame with room for the rest — for a second, the pixels drawn a step fewer (the device's ratio,
// then ~5/6, 2/3, ~4/7 of it: FXAA smooths the edges); back up a step once the frame would fit again for 3 s. In the deep woods on
// the human's 21:9 screen at 150 % the near trees' leaf cards held ~20 ms at full resolution (tools/w3_render_bench.mjs)
const DYN = { steps: [1, 0.85, 0.7, 0.58].map(f => Math.max(0.75, Math.min(devicePixelRatio, 2) * f)).filter((v, i, a) => i === 0 || v < a[i - 1] - 0.01), i: 0, gpu: 0, hi: 0, lo: 0, busy: false, t: 0 };
renderer.setPixelRatio(DYN.steps[0]);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 6000 * KM);
// the fog: the air's above the water; under it the tea-coloured water's, its colour following the gaze (render3/water3.js)
// (the air's haze: the true world's as the 1/10 world's at ten times the distance)
// (the air's haze: 0.00045/m in true-world terms — 5 % at 5 km, 18 % at 10 km, 56 % at 20 km; it had been 0.0007, a ~3-km-visibility
// day, and the human asked for less: "less haze would be good", 2026-10-23 — Maine's clear days see much farther)
const airFog = new THREE.FogExp2(0xc7d6dc, 0.00045 / KM), waterFog = new THREE.FogExp2(0x3b3b20, 0.12);
const AIR = { col: uniform(new THREE.Color(0xc7d6dc)), den: uniform(airFog.density) };   // (the haze for the water's surface, which draws its own: lightByDay)
const WIND3 = { speed: uniform(3) };   // (the wind the trees and the water's ripples feel: the sim's, m/s — lightByDay)
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
  // (leaves off — April's mud season after ice-out, November before the ice: grey-brown hardwoods, straw-coloured grass and fields)
  if (s === 'winter' && DECID.has(cls)) c.lerp(C(cls === 'deciduous' ? 0x6a604f : cls === 'mixed' ? 0x52533f : 0x8a7d58), cls === 'deciduous' ? 0.6 : cls === 'mixed' ? 0.4 : 0.55);
  if (S.snow) c.lerp(C(0xe6ebef), cls === 'evergreen' ? 0.35 : cls === 'woody_wet' || cls === 'mixed' ? 0.6 : 0.85);
  return c;
}
const TREE_COLS = {
  conifer: { spring: [0x24432a, 0x2a4a2c], summer: [0x1f3a24, 0x264529, 0x1b3320], fall: [0x1f3a24, 0x264529], winter: [0x50604f, 0x5a6a58] },
  broad: { spring: [0x7ea84c, 0x8db45a, 0x6c9a40], summer: [0x3d5e2c, 0x4a6b33, 0x56763a, 0x3a5a2a], fall: [0xc8642a, 0xd8a12e, 0xa8342a, 0x9a7a2e, 0xb8862c], winter: [0x6d6458, 0x7a7064, 0x5f584e] },
};
// THE LEAVES BY THE DATE, THE SNOW BY THE ICE (the seasons went by calendar quarter: from March 1 to ice-out the land lost its snow
// and the hardwoods leafed out beside a frozen lake; fall colours from September 1; snow from December 1, frozen or not). A Maine
// year (yf 0 = March 1): leaf-out about May 15, full summer green by June 10, the colours turning from about Sept 20 (peak early to
// mid October), bare by November 1. The snow on the land comes and goes with the sim's ice (iceShare: the share of its water
// columns frozen; on past half, off below a quarter)
const LEAF = { out: 75 / 365, full: 101 / 365, turn: 203 / 365, off: 245 / 365 };
const seasonOf = yf => yf < LEAF.out || yf >= LEAF.off ? 'winter' : yf < LEAF.full ? 'spring' : yf < LEAF.turn ? 'summer' : 'fall';
// (a kind's colours now: the hardwoods' by their leaves; the conifers' snow-dusted under snow, else their summer green — bare
// months without snow included)
const treeCols = kind => TREE_COLS[kind][kind === 'conifer' ? (S.snow ? 'winter' : S.season === 'winter' ? 'summer' : S.season) : S.season];

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
const U = { photo: uniform(0), chart: uniform(0), snow: uniform(0), fallTint: uniform(0), springTint: uniform(0), bareTint: uniform(0) };
// depth-chart colours: lighter → darker blue every 2 ft (MDIFW charts are in feet), a contour line at every 2-ft step
const FT2 = 0.6096;
function groundMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
  const vc = attribute('color', 'vec3'), land = attribute('land', 'float'), dep = attribute('dep', 'float');
  let ph = texture(photoTex, attribute('puv', 'vec2')).rgb;
  { const l0 = dot(ph, vec3(0.299, 0.587, 0.114)); ph = mix(vec3(l0, l0, l0), ph, 1.3).mul(0.62); }   // (NAIP is bright and hazy)
  // the photo is a summer one: warm the hardwoods in autumn (its brighter greens), freshen them in May, grey-brown when their
  // leaves are off, snow when the lakes are frozen
  const lum = dot(ph, vec3(0.299, 0.587, 0.114)), green = tclamp(ph.g.sub(ph.r.add(ph.b).mul(0.5)).mul(6), 0, 1);
  ph = mix(ph, ph.mul(vec3(1.7, 1.1, 0.55)), U.fallTint.mul(green).mul(smoothstep(0.12, 0.3, lum)));
  ph = mix(ph, ph.mul(vec3(1.05, 1.25, 0.8)), U.springTint.mul(green));
  ph = mix(ph, vec3(lum, lum, lum).mul(vec3(1.12, 1.0, 0.8)), U.bareTint.mul(green).mul(smoothstep(0.12, 0.3, lum)).mul(0.8));
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
  // (the ground up close: grass, moss, litter and bare soil in patches of a metre or two and stands of tens — mottled, not the map's
  // one colour; the bed's sand and silt too. Faded with the eye's distance before the grain can shimmer)
  const dE = length(cameraPosition.sub(positionWorld)), nearG = float(1).sub(smoothstep(80, 600, dE));
  const gMot = mx_fractal_noise_float(P.xz.div(2.2), 3, 2.0, 0.5).mul(0.22).mul(nearG).add(mx_noise_float(P.xz.div(28).add(3.3)).mul(0.1)).add(1);
  const bMot = mx_noise_float(P.xz.div(1.6).add(7.7)).mul(0.12).mul(nearG).add(1);
  m.colorNode = mix(bedCol.mul(bMot), landCol.mul(gMot), land);
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
// THE LAND TO THE HORIZON: the far land ended in a slab over the grey void, plain from the default views. A skirt runs on from its
// edge, sharing its border vertices (no overlap: nothing to z-fight) — rings out to SKIRT_D m, their heights the edge's own smoothed
// outward to its mean, with low rolling hills, falling away with the earth's curve — in the colours of the distant woods; the air's
// haze takes it long before its end (cosmetic: hashed noise, never core.rand)
const SKIRT_D = [0, 25, 80, 220, 600, 1400, 3800].map(d => d * KM), SKIRT_W = [0, 0.2, 0.45, 0.75, 1, 1, 1], SKIRT_SM = [0, 2, 5, 12, 30, 0, 0], SKIRT_HILL = [0, 4, 9, 14, 10, 5, 0];
const PER = [];   // the far grid's border vertices, round from its south-west corner (east along the south row, north up the east side…)
for (let q = 0; q < FAR3.NX - 1; q++) PER.push(q);
for (let r = 0; r < FAR3.NY - 1; r++) PER.push(r * FAR3.NX + FAR3.NX - 1);
for (let q = FAR3.NX - 1; q > 0; q--) PER.push((FAR3.NY - 1) * FAR3.NX + q);
for (let r = FAR3.NY - 1; r > 0; r--) PER.push(r * FAR3.NX);
const SKY_CON = uniform(new THREE.Vector3(1, 1, 1)), SKY_BRD = uniform(new THREE.Vector3(1, 1, 1));   // (the skirt's canopy: colourSkirt)
const skirt = (() => {
  const M = PER.length, R = SKIRT_D.length, pos = new Float32Array(M * R * 3), idx = [];
  for (let k = 0; k < M; k++) {   // (each border vertex's rings straight out from its side; a corner's along the diagonal)
    const i = PER[k], q = i % FAR3.NX, r = (i / FAR3.NX) | 0, x = FAR3.X0 + (q + 0.5) * FAR3.CELL, y = FAR3.Y0 + (r + 0.5) * FAR3.CELL;
    let nx = q === 0 ? -1 : q === FAR3.NX - 1 ? 1 : 0, ny = r === 0 ? -1 : r === FAR3.NY - 1 ? 1 : 0; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    for (let j = 0; j < R; j++) { const o = (j * M + k) * 3; pos[o] = x + nx * SKIRT_D[j]; pos[o + 2] = -(y + ny * SKIRT_D[j]); }
  }
  for (let j = 0; j + 1 < R; j++) for (let k = 0; k < M; k++) { const a = j * M + k, b = j * M + (k + 1) % M; idx.push(a, a + M, b, b, a + M, b + M); }   // (facing up)
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(M * R * 3), 3)); g.setIndex(idx);
  // (a canopy from the air, as the drawn woods are: dark conifer and lighter hardwood patches ~25–60 m across, crowns and gaps finer
  // still, stands larger — the conifers' and hardwoods' colours as ratios to the woods' mean, SKY_CON / SKY_BRD, set by colourSkirt.
  // The fine grain fades with the eye's distance before it can shimmer. Plain, it read as a lawn once the haze was thinned)
  const m = new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }), P = positionWorld.xz, dE = length(cameraPosition.sub(positionWorld));
  const near = float(1).sub(smoothstep(1200, 6000, dE)), mid = float(1).sub(smoothstep(6000, 22000, dE));
  const patch = smoothstep(-0.55, 0.55, mx_fractal_noise_float(P.div(110), 4, 2.1, 0.55).add(mx_noise_float(P.div(14).add(5.1)).mul(0.35).mul(near))).mul(mid).add(float(0.5).mul(float(1).sub(mid)));
  m.colorNode = mix(mix(vec3(1, 1, 1), SKY_CON, 0.7), mix(vec3(1, 1, 1), SKY_BRD, 0.7), patch).mul(float(1).add(mx_noise_float(P.div(7)).mul(0.25).mul(near)).add(mx_noise_float(P.div(320).add(17.3)).mul(0.07)));
  return new THREE.Mesh(g, m);
})();
function placeSkirt() {   // its heights, from the far land's border as drawn (after placeGround's)
  const fp = farMesh.geometry.attributes.position.array, sp = skirt.geometry.attributes.position.array, M = PER.length, e = new Float32Array(M);
  let mean = 0; for (let k = 0; k < M; k++) { e[k] = fp[PER[k] * 3 + 1]; mean += e[k] / M; }
  for (let j = 0; j < SKIRT_D.length; j++) {
    const Dt = SKIRT_D[j] * (WORLD_TRUE ? 1 : 10), drop = kLand() * Dt * Dt / (2 * 6.371e6), w = SKIRT_SM[j];   // (the curve at the true distance)
    for (let k = 0; k < M; k++) {
      const o = (j * M + k) * 3; if (!j) { sp[o + 1] = e[k]; continue; }
      let s = 0; for (let q = -w; q <= w; q++) s += e[(k + q + M) % M]; s /= 2 * w + 1;
      const hill = (vnoise(sp[o] / (300 * KM) + 3.7, sp[o + 2] / (300 * KM) - 5.1) - 0.5) * 2 * SKIRT_HILL[j] * kLand();
      sp[o + 1] = s + (mean - s) * SKIRT_W[j] + hill - drop;
    }
  }
  // (its normals straight up: its rises are slight at its distances, and the long thin rings' computed normals lit it in bands and
  // in streaks toward the horizon)
  const g = skirt.geometry; if (!g.attributes.normal) { const nr = new Float32Array(sp.length); for (let i = 1; i < nr.length; i += 3) nr[i] = 1; g.setAttribute('normal', new THREE.BufferAttribute(nr, 3)); }
  g.attributes.position.needsUpdate = true; g.computeBoundingSphere();
}
function colourSkirt() {   // the border's colours, going over to the distant woods' (mixed forest, a little conifer-dark) outward
  const fc = farMesh.geometry.attributes.color.array, sp = skirt.geometry.attributes.position.array, sc = skirt.geometry.attributes.color.array, M = PER.length;
  // (the woods' own colour — their crowns', as the drawn trees average from above, half conifer — not the ground's under them: the
  // ground's pale green made the forest end at a plain)
  const mean = cs => cs.reduce((c, h) => c.add(C(h)), C(0)).multiplyScalar(1 / cs.length);
  const ground = seasonal('mixed', C(0)), gs = S.snow ? 0.35 : 0.15, con = mean(treeCols('conifer')).lerp(ground, gs).multiplyScalar(0.84), brd = mean(treeCols('broad')).lerp(ground, gs).multiplyScalar(0.84);
  const far = con.clone().lerp(brd, 0.6);   // (a little more hardwood than conifer, as the drawn far woods read)
  SKY_CON.value.set(con.r / far.r, con.g / far.g, con.b / far.b); SKY_BRD.value.set(brd.r / far.r, brd.g / far.g, brd.b / far.b);   // (the canopy's two tones about the mean)   // (× the crowns' shading; the snow's share: both matched to the drawn woods beside it in May and in February, Chrome readback)
  // (the border's colours smoothed along it, wider ring by ring as its heights are: each border vertex's own colour carried straight out
  // along its long ring triangles drew stripes — level ones off the east and west sides, rays to the north)
  const SM = [0, 8, 16, 30, 40, 40, 40], CW = [0, 0.9, 1, 1, 1, 1, 1], b = [0, 0, 0];   // (CW: over to the woods' colour sooner than the heights go over to their mean — the border's ground colours are the open ground's under the drawn trees)
  for (let j = 0; j < SKIRT_D.length; j++) for (let k = 0; k < M; k++) {
    const o = (j * M + k) * 3, w = CW[j], v = j === 1 || j === 2 ? 0.95 + 0.1 * vnoise(sp[o] / (120 * KM), sp[o + 2] / (120 * KM)) : 1;   // (no mottling far out: its vertices are too sparse for it)
    b[0] = b[1] = b[2] = 0; for (let q = -SM[j]; q <= SM[j]; q++) { const f = PER[(k + q + M) % M] * 3; b[0] += fc[f]; b[1] += fc[f + 1]; b[2] += fc[f + 2]; }
    const n = 2 * SM[j] + 1; sc[o] = (b[0] / n * (1 - w) + far.r * w) * v; sc[o + 1] = (b[1] / n * (1 - w) + far.g * w) * v; sc[o + 2] = (b[2] / n * (1 - w) + far.b * w) * v;
  }
  skirt.geometry.attributes.color.needsUpdate = true;
}
function placeGround() {   // heights (the land-height slider)
  const bp = band.geometry.attributes.position.array;
  for (let i = 0; i < GEO.N; i++) bp[i * 3 + 1] = GEO.body[i] === LAND ? landY(GEO.elev[i], GEO.level[i]) : bedAbs(i) - BASE;
  band.geometry.attributes.position.needsUpdate = true; band.geometry.computeVertexNormals();
  const fp = farMesh.geometry.attributes.position.array;
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { const y = -fp[i * 3 + 2]; fp[i * 3 + 1] = landY(farElev(i), farLevel(y)) - 0.06; }
  farMesh.geometry.attributes.position.needsUpdate = true; farMesh.geometry.computeVertexNormals();
  placeSkirt();
}
function colourGround() {   // map colours by season (the bed by depth); a narrow stony waterline (the banks are vegetated to the water — the human's photos)
  const c = C(0), bc = band.geometry.attributes.color.array;
  for (let i = 0; i < GEO.N; i++) {
    const [x, y] = GEO.cellCentre(i);
    if (GEO.body[i] !== LAND) weedBed(i, bedColour(GEO.depth[i], c, x, y));
    else { seasonal(GEO.CLASSES[SHOWN[i]], c); const near = GEO.toWater[i]; if (near < 1.2) c.lerp(C(S.snow ? 0xd8dde0 : 0x807a6c), (1 - near / 1.2) * 0.55); c.multiplyScalar(0.9 + hash2(x, y) * 0.2); }
    bc[i * 3] = c.r; bc[i * 3 + 1] = c.g; bc[i * 3 + 2] = c.b;
  }
  band.geometry.attributes.color.needsUpdate = true;
  const fc = farMesh.geometry.attributes.color.array;
  for (let i = 0; i < FAR3.NX * FAR3.NY; i++) { seasonal(GEO.CLASSES[FAR_SHOWN[i]], c).multiplyScalar(0.9 + hash2(i, 7) * 0.2); fc[i * 3] = c.r; fc[i * 3 + 1] = c.g; fc[i * 3 + 2] = c.b; }
  farMesh.geometry.attributes.color.needsUpdate = true;
  colourSkirt();
}

// ---------- water: the lakes' and the brook's surfaces (ice in February) ----------
let MIRROR_CAM = null;   // (the water's mirror's own camera: what it sees by layers — the near trees' stand-ins, not their leaf cards)
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
  MIRROR_CAM = refl.reflector.getVirtualCamera(camera); camera.layers.enable(PLANT_LAYER);
  const P = positionWorld, t = time;
  const ripple = vec2(sin(P.x.mul(2.1).add(t.mul(1.3))).add(sin(P.z.mul(1.7).sub(t.mul(0.9)))), sin(P.z.mul(2.3).add(t.mul(1.1))).add(sin(P.x.mul(1.3).add(P.z.mul(0.8)).sub(t.mul(0.7))))).mul(WIND3.speed.mul(0.0011).add(0.0012))
    // (the wind's ripples break the mirror more as it blows — a flat calm at dawn is glass, 3 m/s ruffles it — in patches: cat's paws
    // drifting down the wind, where the surface is rougher)
    .mul(sin(P.x.mul(0.031).add(P.z.mul(0.019)).sub(t.mul(0.16))).mul(sin(P.z.mul(0.027).sub(P.x.mul(0.011)).add(t.mul(0.09)))).mul(0.6).add(1));
  refl.uvNode = refl.uvNode.add(ripple);
  const view = normalize(cameraPosition.sub(P));
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false });
  m.userData = { base: uniform(0.04), body: uniform(new THREE.Color(0x2b2b17)), mirror: uniform(1) };
  const ice = attribute('ice', 'float');   // the live ice cover (white-grey, snow-dusted, opaque)
  // FROM ABOVE: the mirror of the shore and the sky (Fresnel: strong at low angles) over the water — looking down, the surface
  // is nearly clear and the bed, the weeds and the fish show through, dimmed and tinted by the water itself (water3.js)
  // (the mirror ADDS the sky and shore it reflects, at Fresnel's share — Schlick, 2 % straight down, all of it at grazing — to the light
  // coming up out of the water: blended at alpha a, colour c, the eye gets F·mirror + base·body + (1 − a)·the water below. The lakes
  // from the air are dark slate-blue — the NAIP photo: (38, 45, 64) beside the forest's (91, 106, 85) — the sky's 2–4 % over a dark tea
  // water; mixed in at Fresnel's share of a 6–10 % alpha they had been olive-brown, the sky's part a fifth of what it is)
  const F = float(0.02).add(pow(float(1).sub(tabs(view.y)), 5).mul(0.98)).mul(m.userData.mirror), a0 = m.userData.base.add(F);
  const c0 = refl.rgb.mul(F).add(m.userData.body.mul(WU.day).mul(m.userData.base)).div(a0);
  // (and the air's haze, as on the land: the material draws its own — fog:false keeps three's off it under water — so the far water, and
  // what shows through it, fades into the haze as the far shore does; FogExp2's)
  const dA = length(cameraPosition.sub(P)).mul(AIR.den), ff = float(1).sub(exp(dA.mul(dA).negate()));
  const aboveA = float(1).sub(float(1).sub(ff).mul(float(1).sub(a0)));
  const above = c0.mul(a0).mul(float(1).sub(ff)).add(AIR.col.mul(ff)).div(aboveA);
  // FROM BELOW: Snell's window — within ~48.6° of straight up the sky, bright and rippling; beyond it the surface mirrors the
  // dark water below
  // (the sky through the window is tinted by the water between it and the eye — golden-green in tea water — and broken by the
  // waves into bright moving lines)
  const s1 = sin(P.x.mul(3.1).add(t.mul(1.4)).add(sin(P.z.mul(2.2).add(t.mul(0.9))))), s2 = sin(P.z.mul(2.7).sub(t.mul(1.2)).add(sin(P.x.mul(1.9).sub(t.mul(0.8)))));
  const glint = pow(float(1).sub(tabs(s1.add(s2)).mul(0.5)), 5);
  const tintUp = exp(WU.kd.mul(WU.camDepth).negate());
  const win = smoothstep(0.6, 0.7, tabs(view.y)), skyLit = vec3(0.5, 0.68, 0.82).mul(WU.day).mul(glint.mul(1.5).add(0.35)).mul(tintUp).mul(0.75);
  // (beyond the window the mirrored water is the fog's level colour at the eye's depth — water3's underwaterFogColor — and the
  // whole underside fades into the fog with distance as everything else under water does: the material isn't fogged by three —
  // fog:false, for the air's — and its bright ceiling ran on to the horizon, a seam against the fogged bed)
  const below = mix(WU.level.mul(WU.day).mul(tintUp.y).mul(glint.mul(0.6).add(1.1)), skyLit, win);
  const uwD = WU.density.mul(length(cameraPosition.sub(P))), uwFog = float(1).sub(exp(uwD.mul(uwD).negate()));   // (FogExp2's)
  // the ice and its snow, lit by the day: a moonlit grey at night (unlit material: it glowed white all the winter night)
  const iceC = vec3(0.82, 0.86, 0.89).mul(WU.day);
  m.colorNode = mix(mix(above, mix(iceC, AIR.col, ff), ice), mix(mix(below, iceC.mul(0.45), ice), WU.fogCol, uwFog), WU.under);
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
    if (clearedAt(x, y)) return;   // (none on the camps' footprints and yards, the roads, the paths to the water, the beaches, the launch: camps3view)
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
const PINE_H = 21;   // m: conifers this tall drawn as white pines near the camera (the canopy's emergent pines; spruce and fir are 12–20 m)
// THE FOREST GPU-DRIVEN (render3/forest3.js) wherever WebGPU runs: every tree in one storage buffer, culled to the view and sorted into
// its tier by its distance from the camera each frame on the GPU — seven draws, nothing behind the camera drawn, no re-picking as the
// view moves. Elsewhere (WebGL2, or `?forest=cpu`) the CPU tiers below: the mid tier re-picked about where the view looks, the near
// about the camera, every far tree drawn
const GPU_FOREST = !!navigator.gpu && !/[?&]forest=cpu\b/.test(location.search) && !!(await navigator.gpu.requestAdapter().catch(() => null));
// (the bands: HERO_R the near trees in full — every whorl and leaf cluster — DET_R the rest of the near tier in their lighter models,
// TREE_R the mid tier; each tree × its own 0.75–1.25. The near trees' leaf cards are drawn on NEAR_LAYER, out of the water's mirror,
// which sees MIRROR_LAYER's stand-ins for them instead)
const HERO_R = 70, NEAR_LAYER = 3, MIRROR_LAYER = 4;
const FOREST = GPU_FOREST ? makeGpuForest({ nC: TREES.conifer.n, nB: TREES.broad.n, hero: HERO_R, near: DET_R, mid: Number.isFinite(TREE_R) ? TREE_R : 1e9, pineH: PINE_H,
  caps: [6000, 3000, 6000, Math.min(TREES.conifer.n, 250000), Math.min(TREES.broad.n, 250000), TREES.conifer.n, TREES.broad.n, 20000, 8000, 20000, 30000, 25000] }) : null;
// THE SEASON IN THE TREES (the GPU forest: worked out in its shaders from the date; the CPU tiers take a season's colours in putTree):
// each hardwood leafs out over ~3 weeks from about May 15 (LEAF.out), a pale young green deepening through June; it turns from late
// September — the red maples first, their reds and oranges, the birches and aspens ~2 weeks after, their yellows — its outer leaves
// before its inner, and drops them through October, bare by about November 1 (LEAF.off); each tree within ±5 days of its
// neighbours, each leaf cluster its own few days. The conifers keep their needles. Snow lies on the tops of boughs, twigs and crowns
// while the land is under snow (SEASON3.snow)
const SEASON3 = { yf: uniform(0.3), snow: uniform(0) };
const palette = hs => { const a = uniformArray(hs.map(h => new THREE.Color(h)), 'color'); a.n = hs.length; return a; };
const PAL = {
  con: palette([0x1f3a24, 0x264529, 0x1b3320, 0x22402a]),
  spring: palette([0x7ea84c, 0x8db45a, 0x6c9a40]), summer: palette([0x3d5e2c, 0x4a6b33, 0x56763a, 0x3a5a2a]),
  maple: palette([0xc8642a, 0xa8342a, 0xb8462a, 0xd8802c, 0x9a3a28]), birch: palette([0xd8a12e, 0xc8962c, 0xe0b040, 0xb8862c]),
  twig: palette([0x6d6458, 0x7a7064, 0x5f584e]),
};
const pick = (pal, k) => pal.element(int(fract(k.mul(997)).mul(pal.n)).min(pal.n - 1));
const shadeOf = k => fract(k.mul(7919)).mul(0.36).add(0.82);   // (each tree its own brightness, as putTree's)
function leafState(kk, k2, birch, dy = null) {   // a hardwood's leaves on the date (+ dy, a year fraction): their colour, how many (F 0–1)
  const D = 1 / 365, yf = dy ? SEASON3.yf.add(dy) : SEASON3.yf, j = k2.sub(0.5).mul(10 * D), b = shadeOf(kk);
  const out = float(LEAF.out).add(j), on = smoothstep(out, out.add(20 * D), yf);
  const turn = float(LEAF.turn).add(mix(float(-5 * D), float(9 * D), birch)).add(j), fall = smoothstep(turn, turn.add(18 * D), yf);
  const F = tmin(on, float(1).sub(smoothstep(turn.add(10 * D), float(LEAF.off).add(j).add(birch.mul(4 * D)), yf)));
  const green = mix(pick(PAL.spring, kk), pick(PAL.summer, kk), smoothstep(out.add(8 * D), out.add(35 * D), yf));
  return { col: mix(green, mix(pick(PAL.maple, kk), pick(PAL.birch, kk), birch), fall).mul(b), F, twig: pick(PAL.twig, kk).mul(b) };
}
// a tier's per-tree inputs, as shader nodes: P (x, the ground's y, z, height), W (crown width, m), rot, col (its colour, linear),
// leafCol/twig/F (a hardwood's leaves, twigs and how leafy), leafAt(dy) (its leaves a few days on), barkW (0 dark … 1 white), birch,
// fir, keep (0: in another tier's ground)
function cpuInst(g, cap, holes, bare) {   // (from instance attributes: putTree writes them)
  const n = Math.max(1, cap);
  g.setAttribute('tp', new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4));
  g.setAttribute('tw', new THREE.InstancedBufferAttribute(new Float32Array(n * 2), 2));
  g.setAttribute('tc', new THREE.InstancedBufferAttribute(new Uint8Array(n * 4), 4, true));
  g.instanceCount = 0;
  const P = attribute('tp', 'vec4'), Wr = attribute('tw', 'vec2'), TC = attribute('tc', 'vec4');
  // (each tree leaves for the next tier at its own distance — RAG of the hole's radius, by its random turn — so a tier's edge is a
  // ragged band of mixed trees, not a circle on the forest)
  const rag = Wr.y.div(6.28).mul(0.5).add(0.75);
  let keep = float(1); for (const h of holes) keep = keep.mul(step(h.R.mul(rag), length(vec2(P.x, P.z).sub(h.C))));
  // (the colour's bytes are sRGB, decoded here: 8-bit LINEAR posterised the dark greens — a conifer's red ~3/255 — into steps)
  const col = sRGBTransferEOTF(TC.xyz), F = bare ? float(1).sub(bare) : float(1);
  return { P, W: Wr.x, rot: Wr.y, col, leafCol: col, twig: col, F, leafAt: null, barkW: TC.w, birch: step(0.5, TC.w), fir: step(0.1, TC.w).mul(step(TC.w, 0.5)), keep };
}
function gpuInst(k, wf, kind) {   // (from the GPU forest's culled list: forest3)
  const { tp, tw } = FOREST.inst(k), kk = tw.y, k2 = tw.w, broad = kind === 'broad';
  const birch = broad ? step(2.5, tw.z) : float(0), fir = broad ? float(0) : step(0.5, tw.z);
  if (broad) {
    const L = leafState(kk, k2, birch);
    return { P: tp, W: tp.w.mul(wf).mul(kk.mul(0.3).add(0.85)).mul(L.F.mul(0.2).add(0.8)), rot: tw.x, col: mix(L.twig, L.col, L.F), leafCol: L.col, twig: L.twig, F: L.F,
      leafAt: dy => leafState(kk, k2, birch, dy), barkW: mix(float(0.07), float(0.9), birch), birch, fir, keep: float(1) };
  }
  const col = pick(PAL.con, kk).mul(shadeOf(kk)).mul(mix(vec3(1), vec3(0.9, 0.97, 1.06), fir));   // (a balsam fir a little bluer)
  return { P: tp, W: tp.w.mul(wf).mul(kk.mul(0.3).add(0.85)), rot: tw.x, col, leafCol: col, twig: col, F: float(1), leafAt: null, barkW: mix(float(0.03), float(0.16), fir), birch, fir, keep: float(1) };
}
// a tree's model into the world: its unit-height, crown-width model scaled, turned by its rot, swayed by the wind from its foot — the
// bend growing as the square of the height up it, its top ~0.4 % of its height at rest plus ~0.25 % a m/s of wind, a 3–4 s swing, out
// of step with its neighbours, gusting, down the prevailing west wind and a little across it (its shadow sways with it); `local` the
// model's own position (the leaf cards add their flutter to it)
function treePlace(I, local) {
  const P = I.P, p = local.mul(vec3(I.W, P.w, I.W)), co = cos(I.rot), si = sin(I.rot);
  const hn = positionGeometry.y.max(0), ph = P.x.mul(0.13).add(P.z.mul(0.17)), gust = sin(time.mul(0.11).add(ph.mul(0.3))).mul(0.35).add(0.65);
  const amp = P.w.mul(WIND3.speed.mul(0.0025).add(0.004)).mul(hn.mul(hn)).mul(gust);
  const sway = vec3(sin(time.mul(1.75).add(ph)).mul(amp), 0, sin(time.mul(1.3).add(ph.mul(1.7))).mul(amp).mul(0.35));
  return vec3(p.x.mul(co).sub(p.z.mul(si)), p.y, p.x.mul(si).add(p.z.mul(co))).add(sway).mul(I.keep).add(vec3(P.x, P.y, P.z));
}
const turnN = (I, n) => { const co = cos(I.rot), si = sin(I.rot); return vec3(n.x.mul(co).sub(n.z.mul(si)), n.y, n.x.mul(si).add(n.z.mul(co))); };
// (snow on what faces up: the surface's own facing — from the screen-space slope of its position, turned toward the eye — so a
// spray's top whitens and its underside, seen from below, stays green)
const snowOn = (amount) => {
  const nf = dFdx(positionWorld).cross(dFdy(positionWorld)).normalize(), n = nf.mul(dot(nf, cameraPosition.sub(positionWorld)).sign());
  return smoothstep(0.25, 0.75, n.y).mul(SEASON3.snow).mul(amount);
};
const SNOW_C = vec3(0.86, 0.89, 0.93);
// a tier: one draw of geometry `geo` — instanced from attributes holding up to `cap` trees (the CPU tiers: `holes`, [{C (uniform vec2:
// x, −y), R}], its trees inside are collapsed, another tier's ground; `bare`, a uniform that takes the leaves away), or (gpu: its draw
// in the GPU forest, wf its crown width a height, kind) the GPU forest's indirect draw of its culled list
function tierMesh(geo, cap, o = {}) {
  const { holes = [], side = THREE.FrontSide, layer = 0, bare = null, gpu = null } = o;
  if (gpu !== null && geo.index) geo = geo.toNonIndexed();   // (the indirect args are a non-indexed draw's)
  const g = gpu !== null ? new THREE.BufferGeometry() : new THREE.InstancedBufferGeometry(); if (geo.index) g.setIndex(geo.index);
  for (const k in geo.attributes) g.setAttribute(k, geo.attributes[k]);
  const I = gpu !== null ? gpuInst(gpu, o.wf, o.kind) : cpuInst(g, cap, holes, bare);
  if (gpu !== null) FOREST.bind(gpu, g);
  const mesh = new THREE.Mesh(g, geo.attributes.tf ? cardMaterial(I, o) : plainMaterial(I, geo, side, bare));
  mesh.frustumCulled = false; mesh.layers.set(layer); mesh.userData.cap = cap; return mesh;
}
function plainMaterial(I, geo, side, bare) {   // the mid and far tiers' simple crowns (and the CPU path's)
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.9, side });
  const leafy = !!geo.attributes.fol, fol = leafy ? attribute('fol', 'float') : float(1), ao = leafy ? attribute('ao', 'float') : float(1);
  let p = positionGeometry; if (bare && leafy) p = p.mul(float(1).sub(fol.mul(bare)));
  m.positionNode = treePlace(I, p);
  // (the normals turn with the tree — each its own random turn about its trunk — or every tree was lit from a random side)
  m.normalNode = negateOnBackSide(varying(transformNormalToView(turnN(I, attribute('normal', 'vec3'))), 'v_treeN').normalize());
  const c = mix(mix(vec3(0.2, 0.17, 0.13), vec3(0.8, 0.8, 0.76), I.barkW), I.col, fol);
  m.colorNode = mix(c, SNOW_C, snowOn(0.55)).mul(ao.mul(0.45).add(0.55));   // (the shade softened: crowns seen from below stay green)
  return m;
}
// THE NEAR TREES AS CARDS (render3/trees3.js): leaf clusters and needle sprays cut from the foliage atlas by its alpha (in the
// shadow map too: the sun comes through the gaps), the bark from the bark texture, each tree's colour tinting both; normals bent
// out of the crown; the light through backlit leaves (MeshSSSNodeMaterial's translucency, sss: how much — hardwood leaves more than
// needles); the clusters flutter in the wind as the tree sways (not in the shadow map: steady shadows)
const FOL = (() => {
  const a = new THREE.CanvasTexture(drawAtlas()), b = new THREE.CanvasTexture(drawBark());
  for (const t of [a, b]) { t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true; }
  b.wrapS = b.wrapT = THREE.RepeatWrapping; return { atlas: a, bark: b };
})();
function cardGeo(d) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(d.position, 3)); g.setAttribute('normal', new THREE.BufferAttribute(d.normal, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2)); g.setAttribute('tf', new THREE.BufferAttribute(d.tf, 4)); g.setAttribute('cr', new THREE.BufferAttribute(d.cr, 1)); return g;
}
function cardMaterial(I, { sss = 0, bare = null, kind }) {
  // (leaves are mostly diffuse: a low specular — at a grazing look the full Fresnel sheen of the sky turned the pines' plumes white)
  const m = new THREE.MeshSSSNodeMaterial({ roughness: 0.9, side: THREE.DoubleSide, specularIntensity: 0.25 });
  const TF = attribute('tf', 'vec4'), UV = attribute('uv', 'vec2'), nG = attribute('normal', 'vec3'), cr = attribute('cr', 'float');
  const fol = TF.x, aoA = TF.y, isCard = TF.z, hard = kind === 'broad';
  // (the clusters' flutter: a few cm along their normal, faster than the tree's sway, more at a card's far end and in more wind)
  const flut = sin(time.mul(6.3).add(dot(positionGeometry, vec3(41, 29, 53)))).mul(isCard.mul(UV.x).mul(WIND3.speed.mul(0.0007).add(0.0009)));
  m.positionNode = treePlace(I, positionGeometry.add(nG.mul(flut)));
  m.castShadowPositionNode = treePlace(I, positionGeometry);
  // (the bent normal turned toward the eye: a card seen from its back — a pine's level plume from below — kept a normal facing away,
  // and the lighting's grazing terms lit it white, "some of the trees white", the human, 2026-10-23)
  const nV = varying(transformNormalToView(turnN(I, nG)), 'v_cardN').normalize();
  m.normalNode = select(dot(nV, positionViewDirection).greaterThanEqual(0), nV, nV.negate());
  // a card's leaves on the date: each cluster its own few days — the outer ones (light: higher ao) ahead — in leaf or bare (its
  // random against the tree's leafiness), its colour; per card, so worked out per vertex
  let leafy = float(1), leafC = I.leafCol;
  if (hard && I.leafAt) { const L = I.leafAt(aoA.sub(0.7).mul(8 / 365).add(cr.sub(0.5).mul(6 / 365))); leafy = varying(step(cr, L.F), 'v_leafy'); leafC = varying(L.col, 'v_leafC'); }
  else if (hard && bare) leafy = float(1).sub(bare);
  // the atlas tile: the model's; a fir's sprays for the firs; a birch's or aspen's leaves where its bark is white; bare twigs on a
  // hardwood's card out of leaf
  let tile = TF.w.add(I.fir.mul(step(TF.w, 0.5)).mul(TILE.FIR - TILE.SPRUCE));
  if (hard) tile = mix(float(TILE.TWIGS), tile.add(I.birch), leafy);
  const uvA = vec2(tile.mod(ATLAS.COLS).add(UV.x).div(ATLAS.COLS), tile.div(ATLAS.COLS).floor().add(UV.y).div(ATLAS.ROWS));
  const tx = texture(FOL.atlas, uvA);
  // (the alpha raised with the mip level — Ben Golus's fix: mipmapped alpha averages a cluster's gaps away, the crowns thinned to
  // nothing with distance)
  const px = uvA.mul(vec2(ATLAS.COLS * ATLAS.T, ATLAS.ROWS * ATLAS.T)), dx = dFdx(px), dy = dFdy(px);
  const lod = log2(tmax(dot(dx, dx), dot(dy, dy)).max(1e-8)).mul(0.5).max(0);
  m.maskNode = isCard.lessThan(0.5).or(tx.a.mul(lod.mul(0.25).add(1)).greaterThan(0.5));
  const foliage = mix(I.twig, leafC, leafy);
  const leaf = mix(foliage.mul(0.8), foliage.mul(tx.rgb).mul(1.4), isCard);   // (the solid heart of a spire: its colour, darker)
  const bk = texture(FOL.bark, vec2(UV.x.mul(2), UV.y.mul(I.P.w).div(2.5))), barkL = mix(bk.r.mul(1.7), bk.g.mul(1.05), I.birch);
  const barkC = mix(vec3(0.2, 0.17, 0.13), vec3(0.8, 0.8, 0.76), I.barkW).mul(barkL);
  m.colorNode = mix(mix(barkC, leaf, fol), SNOW_C, snowOn(hard ? leafy.oneMinus().mul(0.25).add(0.35) : float(0.8))).mul(aoA.mul(0.5).add(0.5));
  if (sss > 0) {   // (the light through the leaves: DICE's fast translucency, seen against the sun)
    m.thicknessColorNode = leaf.mul(fol.mul(isCard).mul(leafy).mul(sss)); m.thicknessDistortionNode = float(0.2); m.thicknessAmbientNode = float(0);
    m.thicknessAttenuationNode = float(0.2); m.thicknessPowerNode = float(3); m.thicknessScaleNode = float(4);
  }
  return m;
}
const camHole = { C: uniform(new THREE.Vector2(1e9, 1e9)), R: uniform(DET_R) }, viewHole = { C: uniform(new THREE.Vector2(1e9, 1e9)), R: uniform(TREE_R) }, bareU = uniform(0);
const TIERS = FOREST ? {
  spire: tierMesh(cardGeo(spireCards()), 0, { gpu: 0, wf: 0.33, kind: 'conifer', sss: 0.3, layer: NEAR_LAYER }),
  pine: tierMesh(cardGeo(pineCards()), 0, { gpu: 1, wf: 0.5, kind: 'conifer', sss: 0.35, layer: NEAR_LAYER }),
  hard: tierMesh(cardGeo(hardCards()), 0, { gpu: 2, wf: 0.65, kind: 'broad', sss: 0.7, layer: NEAR_LAYER }),
  spireLite: tierMesh(cardGeo(spireCards({ lite: true })), 0, { gpu: 7, wf: 0.33, kind: 'conifer', sss: 0.3, layer: NEAR_LAYER }),
  pineLite: tierMesh(cardGeo(pineCards({ lite: true })), 0, { gpu: 8, wf: 0.5, kind: 'conifer', sss: 0.35, layer: NEAR_LAYER }),
  hardLite: tierMesh(cardGeo(hardCards({ lite: true })), 0, { gpu: 9, wf: 0.65, kind: 'broad', sss: 0.7, layer: NEAR_LAYER }),
  midConifer: tierMesh(coniferG, 0, { gpu: 3, wf: 0.35, kind: 'conifer' }),
  midBroad: tierMesh(broadG, 0, { gpu: 4, wf: 0.65, kind: 'broad' }),
  mirrorConifer: tierMesh(coniferG, 0, { gpu: 10, wf: 0.35, kind: 'conifer', layer: MIRROR_LAYER }),
  mirrorBroad: tierMesh(broadG, 0, { gpu: 11, wf: 0.65, kind: 'broad', layer: MIRROR_LAYER }),
} : {
  midConifer: tierMesh(coniferG, WORLD_TRUE ? Math.min(TREES.conifer.n, 200000) : TREES.conifer.n, { holes: [camHole] }),
  midBroad: tierMesh(broadG, WORLD_TRUE ? Math.min(TREES.broad.n, 200000) : TREES.broad.n, { holes: [camHole] }),
  spire: tierMesh(cardGeo(spireCards()), 20000, { sss: 0.3, kind: 'conifer' }),
  pine: tierMesh(cardGeo(pineCards()), 8000, { sss: 0.35, kind: 'conifer' }),
  hard: tierMesh(cardGeo(hardCards()), 20000, { bare: bareU, sss: 0.7, kind: 'broad' }),
};
if (FOREST) { camera.layers.enable(NEAR_LAYER); MIRROR_CAM.layers.enable(MIRROR_LAYER); }
if (WORLD_TRUE) {
  const farC = new THREE.ConeGeometry(0.4, 0.85, 6, 1, true).translate(0, 0.575, 0), farB = new THREE.OctahedronGeometry(0.36, 0).scale(1, 0.8, 1).translate(0, 0.62, 0);
  TIERS.farConifer = FOREST ? tierMesh(farC, 0, { gpu: 5, wf: 0.35, kind: 'conifer', layer: PLANT_LAYER }) : tierMesh(farC, TREES.conifer.n, { holes: [viewHole, camHole], layer: PLANT_LAYER });
  TIERS.farBroad = FOREST ? tierMesh(farB, 0, { gpu: 6, wf: 0.65, kind: 'broad', layer: PLANT_LAYER }) : tierMesh(farB, TREES.broad.n, { holes: [viewHole, camHole], layer: PLANT_LAYER });
}
// the GPU forest's trees: each one's place, height, turn and kind (0 spruce, 1 balsam fir — one conifer in three, 2 maple, aspen and
// the rest, 3 birch — one hardwood in six, as putTree's); again when the land's height changes (its ground)
function fillForest() {
  const kl = kLand(), c = TREES.conifer, b = TREES.broad;
  FOREST.fill((i, tp, tw) => {
    const T = i < c.n ? c : b, j = i < c.n ? i : i - c.n, k = T.k[j], o = i * 4;
    tp[o] = T.x[j]; tp[o + 1] = landY(T.el[j], T.lv[j]) - 0.05 * kl; tp[o + 2] = -T.y[j]; tp[o + 3] = T.H[j];
    tw[o] = T.rot[j]; tw[o + 1] = k; tw[o + 2] = T === c ? (((k * 7919 * 5) % 1) < 0.35 ? 1 : 0) : (((k * 7919 * 3) % 1) < 0.18 ? 3 : 2); tw[o + 3] = (k * 104729.17) % 1;
  });
  FOREST.kl = kl;
}
// one tree into a tier's slot j
function putTree(mesh, j, T, i, kind, wf) {
  const g = mesh.geometry, tp = g.attributes.tp.array, tw = g.attributes.tw.array, tc = g.attributes.tc.array, c = putTree.c || (putTree.c = C(0));
  const H = T.H[i], k = T.k[i], bare = kind === 'broad' && S.season === 'winter', cols = treeCols(kind);
  tp[j * 4] = T.x[i]; tp[j * 4 + 1] = landY(T.el[i], T.lv[i]) - 0.05 * kLand(); tp[j * 4 + 2] = -T.y[i]; tp[j * 4 + 3] = H;
  tw[j * 2] = H * wf * (0.85 + k * 0.3) * (bare && wf === 0.65 ? 0.8 : 1); tw[j * 2 + 1] = T.rot[i];
  c.setHex(cols[Math.floor(k * 997) % cols.length]).multiplyScalar(0.82 + ((k * 7919) % 1) * 0.36).convertLinearToSRGB();   // (sRGB bytes: tierMesh decodes)
  tc[j * 4] = Math.min(255, Math.round(c.r * 255)); tc[j * 4 + 1] = Math.min(255, Math.round(c.g * 255)); tc[j * 4 + 2] = Math.min(255, Math.round(c.b * 255));
  tc[j * 4 + 3] = kind === 'broad' ? (((k * 7919 * 3) % 1) < 0.18 ? 230 : 18) : ((k * 7919 * 5) % 1) < 0.35 ? 40 : 8;   // (a birch in six: white bark, the rest dark; a balsam fir in three conifers — paler bark, its own sprays — the rest spruce)
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
  if (!TIERS.farConifer || FOREST) return;
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
  if (FOREST) { if (!treesOnly) { if (FOREST.kl !== kLand()) fillForest(); placeShrubs(); } return; }   // (the GPU forest: its trees' ground on a new land height; the rest is the shader's)
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
      if (clearedAt(x, y)) continue;   // (a dock's foot, a path, a beach, the launch: open to the water)
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
// (three's physical sky — render3/sky3.js: the sun where it really is for the date and hour at 45.6° N, its disc, the clouds by the
// sim's weather — in place of a fixed blue gradient; it draws first, behind everything)
const SKY = makeSky(KM), sky = SKY.mesh;
// (the haze's colour in full day; lightByDay dims it with the sky each frame — set only here, distant fogged land stood as a pale
// band against the night sky)
const FOG_DAY = C(0xc7d6dc);
function styleSky() {   // (the haze's colour follows the sky's horizon each frame — lightByDay, sky3.js)
  airFog.color.copy(FOG_DAY).multiplyScalar(skyDim.value);
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
// (the shadow map sees layer 0 and the near trees' leaf cards — its own list: else it borrowed the layers of whichever camera drew first,
// the mirror's some frames, and the near trees cast no shadow then; and it is drawn every other frame — the trees' sway in it at 30 Hz,
// half its cost)
if (FOREST) sun.shadow.camera.layers.enable(NEAR_LAYER);
sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true;
// THE SUN'S SHADOWS: one map that follows where the view looks, sized to how far out it looks (the near and mid trees, the camps and
// their docks, the animals, the rocks cast; the ground, the trees and the camps take them) — soft-edged (PCF)
// (2048 texels a side: 4–10 cm a texel close up, ~0.9 m from the highest view. 4096 cost ~9 ms more a frame among the near trees'
// leaf cards — the map's fill is its texels × the crowns' overdraw, whatever its reach — for detail no one could see)
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6; sun.shadow.camera.near = 1; sun.shadow.camera.far = 6000;
const SHADOW = { R: 0, d: new THREE.Vector3(), on: true };
// AFTER THE SCENE (post-processing): ambient occlusion — the crowns' undersides, where trunks meet the ground, a camp's eaves and the
// gaps between its logs darken as the sky's light can't reach them (GTAO, half resolution, a few metres' reach) — and a soft bloom on
// what is brighter than white: the sun on the water, its disc, the lit windows at night. Plain rendering if it can't be built.
let POST = null;
function makePost() {
  try {
    const { pass, mrt, output, normalView, vec4, renderOutput } = THREE.TSL;
    // (the scene's pass single-sampled: the AO reads its depth, which a multisampled one can't give — FXAA smooths the edges after)
    const sp = pass(scene, camera, { samples: 0 }); sp.setMRT(mrt({ output, normal: normalView }));
    const col = sp.getTextureNode('output'), aoN = ao(sp.getTextureNode('depth'), sp.getTextureNode('normal'), camera);
    aoN.resolutionScale = 0.5; aoN.radius.value = 2.5; aoN.thickness.value = 2.5; aoN.distanceFallOff.value = 1;
    const lit = vec4(col.rgb.mul(aoN.getTextureNode().r.mul(0.85).add(0.15)), col.a);   // (never quite black: the sky's light scatters in)
    // (the bloom only on what is much brighter than the sky — the sun, its glints, lamps: the physical sky is itself above white)
    const pp = new THREE.RenderPipeline(renderer); pp.outputColorTransform = false; pp.outputNode = fxaa(renderOutput(lit.add(bloom(lit, 0.08, 0.3, 6))));   // (the human, 2026-10-23: "the light glare is too much" — a bloom from 2.2 washed the low sun's side of the view white) return pp;
  } catch (e) { console.warn('no post-processing:', e); return null; }
}
function placeShadow(dir) {   // the shadow map's square about the view's target, R m each way; the light 2 km back along the sun
  const R = Math.max(40, Math.min(900, rig.dist * 1.4)), c = sun.shadow.camera;
  if (Math.abs(R - SHADOW.R) > SHADOW.R * 0.08) { SHADOW.R = R; c.left = c.bottom = -R; c.right = c.top = R; c.updateProjectionMatrix(); }
  sun.target.position.copy(rig.target); sun.position.copy(rig.target).addScaledVector(SHADOW.d.copy(dir).normalize(), 2000);
}

// ---------- the cut-away: a north–south position; everything south of it is clipped and the section face drawn ----------
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
const clipped = new THREE.ClippingGroup(); clipped.clippingPlanes = [clipPlane]; clipped.enabled = false;
const fishView = makeFishView();   // the fish (src/w3/fish3.js), every one an instance, schools as their n fish
const plantsView = makePlantsView(W3);   // the weeds (src/w3/plants3.js): stems, fronds, pads and reeds by each patch's stand
const risesView = makeRisesView(W3);   // the insects on the film, the rises, splashes and leaps of the fish that take them
const bedView = makeBedView(plantsView);   // the crayfish out on the bed and the snails (littoral3), near the camera
// THE ANIMALS OF THE LAKES AND THEIR SHORES (render3/wild3view.js: the sim's fish-eating wildlife, its anglers, the moose and the forest's
// animals; shallows3view.js: the turtles, frogs, newts and tadpoles, the dragonflies, the logs and boulders they bask on)
const shallowsView = makeShallowsView({ plants: plantsView, colAt: (x, y) => W3.colAt(x, y), ripple: risesView.ripple, groundY: (x, y) => groundAt(x, -y) });   // (groundY: the frogs on the bank)
// THE CAMPS, THE DOCKS AND THEIR BOATS, THE ROADS, THE LAUNCH AND THE BEACHES (render3/camps3view.js, from src/w3/camps3.js's dataset): placed
// on the land as drawn (place: at start and when its height changes), lit by night where lived in; the wildlife view's boats put in
// at the launch and the docks (camps: its hooks)
const campsView = makeCampsView({ groundAt: (x, y) => drawnY(x, y) });
const wildView = makeWildView({ TREES, treeY: (T, i) => landY(T.el[i], T.lv[i]) - 0.05 * kLand(), groundY: (x, y) => groundAt(x, -y), plants: plantsView, ripple: risesView.ripple,
  colAt: (x, y) => W3.colAt(x, y), onHerpKill: (w, x, y, L, k) => shallowsView.onKill(w, x, y, L, k, LIVE.tNow), camps: campsView.hooks });
risesView.setLeapHook((...a) => { if (S.wild) shallowsView.onLeap(...a); });
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
clipped.add(band, farMesh, skirt, water, ...treeMeshList(), shrubMesh, rockMesh, fishView.mesh, fishView.shadow, plantsView.group, risesView.group, bedView.group, wildView.group, shallowsView.group, campsView.group);
scene.add(clipped, sky);
// (the fish and their shadows on the bed are always under the surface: on the weeds' layer, which the water's mirror camera leaves
// out — they were drawn twice a frame, ~2 M triangles for nothing; a leaping fish loses its reflection for its half second)
fishView.mesh.layers.set(PLANT_LAYER); fishView.shadow.layers.set(PLANT_LAYER);
// (the rings, the splashes and the insects of the rises lie on the film, 2–6 mm above the level, the water's mesh 1 cm: drawn after
// the water — its renderOrder 2 — not under it, where its layer washed them out; the insects, opaque, join the transparent pass —
// at full opacity — to be drawn after it)
risesView.group.traverse(o => { if (!o.isMesh || !o.material) return; o.material.transparent = true; o.renderOrder = 3; });
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
        waterColour(xm, y, (wl[k] + wl[k + 1]) / 2 - (z1 + z0) / 2, c);   // (depth below this column's own surface: Lower's sits 0.6 m below Upper's)
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
  $('labels').append(el); labels.push({ el, x, y, h, reach, note: cls === 'note', bw: 0, bh: 0, on: true, tr: '' });
}
// (the Labels and Field-notes boxes: a label they hide takes no room in the overlap test)
const LBL = { names: $('t-labels').checked, notes: $('t-notes').checked, sized: false };
document.body.classList.toggle('nolabels', !LBL.names); document.body.classList.toggle('nonotes', !LBL.notes);
for (const B of BODIES) {
  if (B.id === BROOK) continue;
  let sx = 0, sy = 0, n = 0; for (let i = 0; i < GEO.N; i += 7) if (GEO.body[i] === B.id) { const [x, y] = GEO.cellCentre(i); sx += x; sy += y; n++; }
  label(B.name, `${(B.area / 1e4 / GEO.SCALE ** 2).toFixed(0)} ha · mean ${B.mean.toFixed(1)} m · max ${B.max.toFixed(1)} m (${(B.max / 0.3048).toFixed(0)} ft)`, sx / n, sy / n, 6, 'name');
}
{ const p = GEO.BROOK_PATH[Math.floor(GEO.BROOK_PATH.length / 2)]; label('Hot Brook', WORLD_TRUE ? '154 m' : '154 m (shown at half length)', p[0], p[1], 4, 'name', 500 * Math.sqrt(KM)); }
label('inflow', 'from the south', GEO.INFLOW[0], GEO.INFLOW[1], 3, 'name', 600 * KM); label('outlet', 'to Baskahegan Stream', GEO.OUTLET[0], GEO.OUTLET[1], 3, 'name', 600 * KM);
for (const n of GEO.NOTES) label(n.t.replace('Sunfish: ', 'sunfish · '), n.s.replace(/ \(angler's note, 2026\)/, ''), n.xy[0], n.xy[1], 2, 'note', 220 * Math.sqrt(KM));
// (each label's box is measured once — its text never changes: a label hidden by .off measured 0 and fell back to a 120×30 box,
// so a wide one showed and hid on alternate frames; and every read after the last label's writes forced a layout per label per
// frame. Now all the reads, then all the writes)
function sizeLabels() {
  for (const L of labels) L.el.classList.remove('off');
  for (const L of labels) { const w = L.el.offsetWidth; if (w) { L.bw = w + 8; L.bh = L.el.offsetHeight + 4; } }   // (one layout; one hidden by a box measures on showing)
  LBL.sized = true;
}
function placeLabels(w, h) {
  if (!LBL.sized) sizeLabels();
  for (const L of labels) {
    lw.set(L.x, GEO.levelAt(L.x, L.y) - BASE + L.h, -L.y); lp.copy(lw).project(camera);
    L.d = camera.position.distanceTo(lw); L.sx = (lp.x + 1) / 2 * w; L.sy = (1 - lp.y) / 2 * h;
    L.vis = (L.note ? LBL.notes : LBL.names) && lp.z < 1 && Math.abs(lp.x) < 1.05 && Math.abs(lp.y) < 1.05 && L.d < L.reach && !(S.cut && L.y < cutY());
  }
  const placed = [];   // nearest first; a label that would overlap one already shown waits until the camera moves apart
  for (const L of [...labels].sort((a, b) => a.d - b.d)) {
    if (!L.vis) continue;
    const bw = L.bw || 128, bh = L.bh || 34, x0 = L.sx - bw / 2, y0 = L.sy - bh;
    if (placed.some(r => x0 < r[2] && x0 + bw > r[0] && y0 < r[3] && y0 + bh > r[1])) L.vis = false; else placed.push([x0, y0, x0 + bw, y0 + bh]);
  }
  let unsized = false;
  for (const L of labels) {   // the writes (only what changed)
    if (L.on !== L.vis) { L.on = L.vis; L.el.classList.toggle('off', !L.vis); }
    if (L.vis) { const tr = `translate(${L.sx.toFixed(1)}px, ${L.sy.toFixed(1)}px) translate(-50%, -100%)`; if (tr !== L.tr) { L.tr = tr; L.el.style.transform = tr; } if (!L.bw) unsized = true; }
  }
  if (unsized) for (const L of labels) if (L.vis && !L.bw) { const bw = L.el.offsetWidth; if (bw) { L.bw = bw + 8; L.bh = L.el.offsetHeight + 4; } }
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
// the ground's height (three's y) at (x, z): the band's own; beyond it the far land's, on the very triangles drawn (each quad split
// a-b-d / b-e-d as gridMesh splits it); off the far land, its edge's. (It knew only the band, and said −2 m beyond it: the camera's
// floor ignored hills tens of metres higher, and an orbit low or a Find on land put the eye inside them.) The camera's floor, the
// target's, the forest animals' footing (wild3view groundY)
function farY(x, y) {
  const fp = farMesh.geometry.attributes.position.array, NXF = FAR3.NX;
  let u = (x - FAR3.X0) / FAR3.CELL - 0.5, v = (y - FAR3.Y0) / FAR3.CELL - 0.5;
  u = u < 0 ? 0 : u > NXF - 1.0001 ? NXF - 1.0001 : u; v = v < 0 ? 0 : v > FAR3.NY - 1.0001 ? FAR3.NY - 1.0001 : v;
  const q = u | 0, r = v | 0, fx = u - q, fy = v - r, a = (r * NXF + q) * 3 + 1, b = a + 3, d = a + NXF * 3, e = d + 3;
  return fx + fy <= 1 ? fp[a] + (fp[b] - fp[a]) * fx + (fp[d] - fp[a]) * fy : fp[e] + (fp[d] - fp[e]) * (1 - fx) + (fp[b] - fp[e]) * (1 - fy);
}
const groundAt = (x, z) => { const y = -z; if (x > X0 && x < GEO.XMAX && y > Y0 && y < GEO.YMAX) { const b = GEO.bodyAt(x, y), lv = GEO.levelAt(x, y), d = GEO.depthAt(x, y); return b !== LAND && d > 0 ? lv - d - BASE : landY(lv - d, lv); } return farY(x, y); };
// the ground AS DRAWN at the world's (x, y): the band's own triangles (split as gridMesh splits them, as farY reads the far land's) — the
// lake bed under its water — else the far land's. What the camps' roads, lot and beaches are draped on (render3/camps3view.js): the
// bilinear groundAt runs up to a few decimetres off the drawn triangles on a slope, and a strip laid on it sank into the ground there
function drawnY(x, y) {
  if (!(x > X0 && x < GEO.XMAX && y > Y0 && y < GEO.YMAX)) return farY(x, y);
  const bp = band.geometry.attributes.position.array;
  let u = (x - X0) / GEO.CELL - 0.5, v = (y - Y0) / GEO.CELL - 0.5;
  u = u < 0 ? 0 : u > NX - 1.0001 ? NX - 1.0001 : u; v = v < 0 ? 0 : v > NY - 1.0001 ? NY - 1.0001 : v;
  const q = u | 0, r = v | 0, fx = u - q, fy = v - r, a = (r * NX + q) * 3 + 1, b = a + 3, d = a + NX * 3, e = d + 3;
  return fx + fy <= 1 ? bp[a] + (bp[b] - bp[a]) * fx + (bp[d] - bp[a]) * fy : bp[e] + (bp[d] - bp[e]) * (1 - fx) + (bp[b] - bp[e]) * (1 - fy);
}
// FOLLOWING: one owner at a time — Find's animal (FIND.follow) or the data page's picked fish (data3: its card's follow box). A named
// view, the cut-away, a pan or the keys let go of both (they set the target the follow would drag straight back)
function letGo() {
  if (FIND.follow) { FIND.follow = null; $('watching').textContent = ''; }
  LIVE.data3?.unfollow?.();
}
const rig = new CameraRig(camera, canvas, { groundAt, maxDist: 2200 * KM, bounds: { x0: FAR3.X0, x1: FAR3.X0 + PW, z0: -(FAR3.Y0 + PH), z1: -FAR3.Y0 }, onPan: () => letGo() });
const [ux, uy] = BODIES[0].deepest, [lx, ly] = BODIES[1].deepest, kN = Math.sqrt(KM);   // (kN: the near views' reach)
// (the brook's view: over its middle — the length-weighted centre of its course — from high and steep, looking along it from Upper's
// side: a narrow channel between true-size trees shows only from above; the cove's from out over the open water to its south-east.
// The old angles put the eye in, or behind, the bank's crowns in both worlds)
const BMID = (() => { let sx = 0, sy = 0, sl = 0; const P = GEO.BROOK_PATH; for (let k = 0; k + 1 < P.length; k++) { const l = Math.hypot(P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]); sx += (P[k][0] + P[k + 1][0]) / 2 * l; sy += (P[k][1] + P[k + 1][1]) / 2 * l; sl += l; } return [sx / sl, sy / sl]; })();
// (the dive: in the West cove's margin, a bed ~2 m down, looking up its slope toward the shallows the sunfish keep — the old one went down
// over Upper's deepest mud, 5.5 m deep and 230 m from shore, where nothing shows in the tea-coloured water but the dark)
const DIVE = (() => {
  const [cx, cy] = GEO.NOTES[2].xy; let bi = -1, bd = 1e18;
  for (let i = 0; i < GEO.N; i++) { const d = GEO.depth[i]; if (GEO.body[i] === LAND || GEO.body[i] === BROOK || !(d >= 1.8 && d <= 2.6)) continue; const [x, y] = GEO.cellCentre(i), q = (x - cx) ** 2 + (y - cy) ** 2; if (q < bd) { bd = q; bi = i; } }
  if (bi < 0) return { t: [ux, uy - 8, -3.4], yaw: 0.9 };
  const [x, y] = GEO.cellCentre(bi); return { t: [x, y, -0.5 * GEO.depth[bi]], yaw: Math.atan2(-(cx - x), cy - y) };   // (the rig looks along (−sin yaw, cos yaw))
})();
const VIEWS = {
  'Both lakes': { t: [-5 * KM, 10 * KM, 0], yaw: 0.25, pitch: -0.62, dist: 560 * KM },
  'Upper lake': { t: [-35 * KM, -150 * KM, 0], yaw: 0.1, pitch: -0.5, dist: 300 * KM },
  'The brook': { t: [BMID[0], BMID[1], 0], yaw: -1.2, pitch: -1.1, dist: 90 * kN },
  'Lower lake': { t: [lx, ly + 30 * KM, 0], yaw: 0.2, pitch: -0.5, dist: 260 * KM },
  'West cove': { t: [GEO.NOTES[2].xy[0] + 10 * kN, GEO.NOTES[2].xy[1] - 5 * kN, 0], yaw: 0.39, pitch: -0.55, dist: 100 * kN },
  'On the water': { t: [ux - 20, uy - 60, 0.2], yaw: 0.05, pitch: -0.04, dist: 28 },
  'Dive in': { t: DIVE.t, yaw: DIVE.yaw, pitch: -0.12, dist: 4 },
};
function go(name) {
  const v = VIEWS[name]; letGo(); rig.set(new THREE.Vector3(v.t[0], v.t[2], -v.t[1]), v.yaw, v.pitch, v.dist);
  for (const b of $('views').children) b.setAttribute('aria-pressed', String(b.textContent === name));
}
for (const name of Object.keys(VIEWS)) { const b = document.createElement('button'); b.textContent = name; b.addEventListener('click', () => { go(name); FIND.last = ''; }); $('views').append(b); }   // (a new view: Find starts again with what is near it)

// ---------- controls ----------
function applyLook() {
  U.photo.value = S.look === 'photo' ? 1 : 0; U.chart.value = S.look === 'chart' ? 1 : 0;
  for (const b of $('looks').children) b.setAttribute('aria-pressed', String(b.dataset.look === S.look));
  styleWater(); legend();
}
function applySeason() {   // (S.season: the leaves; S.snow: the land under snow)
  U.snow.value = S.snow ? 1 : 0; SEASON3.snow.value = S.snow ? 1 : 0; U.fallTint.value = S.season === 'fall' ? 1 : 0; U.springTint.value = S.season === 'spring' ? 1 : 0; U.bareTint.value = S.season === 'winter' ? 1 : 0;
  for (const b of $('seasons').children) b.setAttribute('aria-pressed', String(b.dataset.season === S.season && (S.season !== 'winter' || S.snow)));
  colourGround(); colourTrees(); placeTrees(); styleWater(); styleSky(); legend(); campsView.setSeason(S.season, S.snow);
}
function applyHeight() { $('exv').textContent = `×${S.exag}`; placeGround(); placeTrees(); buildSection(); campsView.place(); }
for (const b of $('looks').children) b.addEventListener('click', () => { S.look = b.dataset.look; applyLook(); });
// JUMP TO a date: the look changes at once, to the date asked for; the snapshots still on their way from before the jump are not
// let undo it (they flipped the season back and then forward again — a flash and three heavy recolours) until one from near
// that date arrives (LIVE.jump; a minute at most — the true lakes' jump to February takes ~20 s)
for (const b of $('seasons').children) b.addEventListener('click', () => {
  const yf = SEASON_YF[b.dataset.season];
  S.season = seasonOf(yf); S.snow = b.dataset.season === 'winter';   // (February: the lakes frozen, the land under snow — the sim's ice confirms it)
  if (LIVE.worker) { LIVE.worker.postMessage({ type: 'season', yf }); LIVE.jump = { yf, at: performance.now() }; }
  LIVE.lastSeason = S.season + (S.snow ? '+snow' : ''); applySeason(); buildSection();
});
for (const b of $('shows').children) b.addEventListener('click', () => { S.show = b.dataset.show; if (LIVE.worker) LIVE.worker.postMessage({ type: 'show', show: S.show }); for (const x of $('shows').children) x.setAttribute('aria-pressed', String(x === b)); if (!S.cut && S.show !== 'plain') { const c = $('t-cut'); c.checked = true; c.dispatchEvent(new Event('change')); } buildSection(); });
$('play').addEventListener('click', () => { LIVE.run = !LIVE.run; LIVE.lastW = 0; $('play').textContent = LIVE.run ? '⏸ pause' : '▶ play'; LIVE.worker?.postMessage({ type: 'run', run: LIVE.run }); });   // (lastW: the rate is measured afresh)
for (const b of $('speeds').children) b.addEventListener('click', () => { LIVE.speed = +b.dataset.speed; LIVE.rate = LIVE.speed; LIVE.lastW = 0; LIVE.worker?.postMessage({ type: 'speed', speed: LIVE.speed }); for (const x of $('speeds').children) x.setAttribute('aria-pressed', String(x === b)); });
// (the land-height slider: while it is dragged the ground — the true world's 630,000 normals — at most once a frame and the section;
// the trees, a million in the true world, once it is let go)
let heightQ = false;
$('exag').addEventListener('input', e => {
  S.exag = +e.target.value; $('exv').textContent = `×${S.exag}`;
  if (!heightQ) { heightQ = true; requestAnimationFrame(() => { heightQ = false; placeGround(); buildSection(); }); }
});
$('exag').addEventListener('change', e => { S.exag = +e.target.value; applyHeight(); });
// (the cut opens through Upper's 18-ft north basin, the camera facing the water column; the slider moves it)
const cutAt = y => Math.min(1, Math.max(0, (y - Y0 - 8) / (GEO.YMAX - Y0 - 16)));
$('t-cut').addEventListener('change', e => {
  S.cut = e.target.checked; $('cutpos').disabled = !S.cut;
  if (S.cut) { S.cutPos = cutAt(uy); $('cutpos').value = String(Math.round(S.cutPos * 1000)); }
  buildSection(); if (S.cut) { letGo(); rig.set(new THREE.Vector3(ux, -2.2, -cutY()), 0, -0.12, 55); }
});
$('cutpos').addEventListener('input', e => { S.cutPos = +e.target.value / 1000; buildSection(); if (S.cut) { letGo(); rig.goal.target.z = -cutY(); } });
$('t-clear').addEventListener('change', e => { S.clear = e.target.checked; styleWater(); });
$('t-water').addEventListener('change', e => { S.water = e.target.checked; styleWater(); });
$('t-trees').addEventListener('change', e => { S.trees = e.target.checked; for (const m of treeMeshList()) m.visible = S.trees; shrubMesh.visible = S.trees; });
// THE FAR SHORE IN THE MIRROR (off by default — the human, 2026-10-23): the far tiers' woods live on PLANT_LAYER, which the reflection's
// camera doesn't see; on, they join layer 0 too and a calm lake mirrors the whole far treeline (≈ a third more of the GPU, true world)
const applyMirror = () => { for (const m of [TIERS.farConifer, TIERS.farBroad]) if (m) { if ($('t-mirror').checked) m.layers.enable(0); else m.layers.disable(0); } };
$('t-mirror').addEventListener('change', applyMirror); applyMirror();
// (the sun's shadows, the AO and the bloom together: off, plain rendering — a slow machine's choice)
$('t-post').addEventListener('change', e => { S.post = e.target.checked; });   // (the shadows fade with it: lightByDay)
$('t-fish').addEventListener('change', e => { S.fish = e.target.checked; fishView.mesh.visible = fishView.shadow.visible = bedView.group.visible = S.fish; });
$('t-plants').addEventListener('change', e => { S.plants = e.target.checked; plantsView.group.visible = S.plants; tintBed(); });
$('t-camps').addEventListener('change', e => { S.camps = e.target.checked; campsView.group.visible = S.camps; });
$('t-wild').addEventListener('change', e => { S.wild = e.target.checked; wildView.group.visible = shallowsView.group.visible = S.wild; $('findwild').disabled = !S.wild; if (!S.wild) { FIND.follow = null; $('watching').textContent = ''; } });
// FIND AN ANIMAL: the camera goes to the next of the animals out on the lakes (by kind, in turn) and follows it — turn about it and
// zoom as you like — until you pan or move away; what is out now is listed in the Show group
const FIND = { follow: null, last: '' };
$('findwild').addEventListener('click', () => {
  // (the small life near the view first — the turtles on a log, a bullfrog, a snapper — then the lakes' animals by kind; each click the
  // next of another kind, round and round)
  const L = [...shallowsView.list(), ...wildView.list().filter(q => !q.hidden).sort((a, b) => a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.key < b.key ? -1 : 1)];
  if (!L.length) { FIND.follow = null; $('watching').textContent = 'none out on the lakes just now'; return; }
  const i0 = L.findIndex(q => q.key === FIND.last), k0 = i0 >= 0 ? L[i0].kind : null; let a = L[0];
  for (let j = 1; j <= L.length; j++) { const q = L[(Math.max(0, i0) + j) % L.length]; if (i0 < 0) { a = L[0]; break; } if (q.kind !== k0 || j === L.length) { a = q; break; } }
  letGo(); FIND.last = a.key; FIND.follow = a;   // (Find owns the camera now: the picked fish's follow lets go)
  const p = a.at(); if (!p) return; const k = S.fishScale > 1 ? Math.min(S.fishScale, Math.max(1, 0.5 * S.fishScale / a.size)) : 1;
  // (the camera over the open water if it can be — not inside the trees on the bank: the turn about the animal that puts it farthest from land)
  // (a bird on a treetop seen from out on the water, a little above it; one flying from farther back and below, against the sky; the
  // turtles from beyond the 6 m at which they slide off their log)
  const tall = a.perched && a.kind !== 'kingfisher', d = tall ? 30 * Math.sqrt(k) : a.perched ? 6 * Math.sqrt(k) : a.flying ? 14 * Math.sqrt(k) : a.kind === 'turtles' ? 8 * Math.sqrt(k) : Math.max(3.5, a.size * k * (a.kind === 'iceAngler' || a.kind === 'angler' ? 3 : 5)), pitch = tall ? -0.12 : a.perched ? 0.05 : a.flying ? 0.2 : -0.22, cp = Math.cos(pitch); let yaw = rig.goal.yaw, best = -1e9;
  for (let q = 0; q < 16; q++) { const y = rig.goal.yaw + (q % 2 ? 1 : -1) * Math.ceil(q / 2) * Math.PI / 8, cx = p[0] + Math.sin(y) * cp * d, cy = -(p[2] + Math.cos(y) * cp * d), s = GEO.shoreDist(cx, cy) - q * 0.05; if (s > best) { best = s; yaw = y; } }
  rig.set(new THREE.Vector3(p[0], p[1], p[2]), yaw, pitch, d);
  $('watching').textContent = 'watching ' + a.name;
});
// (turning about it and zooming keep following; panning — a right- or shift-drag, two fingers — or moving with the keys lets it
// go: the rig's onPan → letGo)
function wildOut() {   // what is out on the lakes now (the Show group's line)
  const c = wildView.stats(), sh = shallowsView.stats();
  const N = { loon: ['loon', 'loons'], heron: ['heron', 'herons'], kingfisher: ['kingfisher', 'kingfishers'], osprey: ['osprey', 'ospreys'], eagle: ['eagle', 'eagles'], cmerganser: ['common merganser', 'common mergansers'], hmerganser: ['hooded merganser', 'hooded mergansers'], otter: ['otter', 'otters'], mink: ['mink', 'mink'], raccoon: ['raccoon', 'raccoons'], moose: ['moose', 'moose'], bear: ['bear', 'bears'], deer: ['deer', 'deer'], angler: ['boat', 'boats'], iceAngler: ['ice camp', 'ice camps'] };
  const out = Object.entries(c).filter(([k, n]) => n > 0 && (N[k] || k === 'shore')).map(([k, n]) => k === 'shore' ? (n > 1 ? n + ' bank anglers' : 'a bank angler') : n + ' ' + N[k][n === 1 ? 0 : 1]);
  if (sh.basking) out.push(sh.basking + (sh.basking === 1 ? ' turtle' : ' turtles') + ' basking (near)');
  $('wildout').textContent = out.length ? 'Out now: ' + out.join(', ') : '';
}
for (const b of $('fishsize').children) b.addEventListener('click', () => { S.fishScale = +b.dataset.scale; for (const x of $('fishsize').children) x.setAttribute('aria-pressed', String(x === b)); });
$('t-labels').addEventListener('change', e => { LBL.names = e.target.checked; document.body.classList.toggle('nolabels', !LBL.names); });
$('t-notes').addEventListener('change', e => { LBL.notes = e.target.checked; document.body.classList.toggle('nonotes', !LBL.notes); });
$('fold').addEventListener('click', () => { const f = $('ctl').classList.toggle('folded'); $('fold').textContent = f ? '+' : '–'; $('fold').setAttribute('aria-expanded', String(!f)); });

// ---------- the live water model and its clock ----------
// THE SIM runs in a Worker (render3/sim3worker.js): each frame the view sends the time passed — only once the last reply is in —
// and draws the latest snapshot meanwhile. W3: the water grid's geometry, for the cut-away's and the ice's lookups
const LIVE = { frames: 0, tNow: 0, worker: null, snap: null, waiting: false, dtAcc: 0, rate: 1, lastT: 0, lastW: 0, run: true, speed: 1, lastSeason: null, sinceUI: 0, sinceSection: 0, drawn: 0, field: null, fieldShow: 'plain' };
const SEASON_YF = { spring: 0.24, summer: 0.39, fall: 0.59, winter: 0.95 };   // the season buttons' dates (late May, late July, early Oct, Feb)
const iceShare = ice => { let n = 0; for (let i = 0; i < ice.length; i++) if (ice[i] > 0.5) n++; return n / Math.max(1, ice.length); };
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
  if (m.type === 'history') { LIVE.data3?.onHistory(m.hist); return; }
  if (m.type === 'progress') { LIVE.progress = `${m.text} (${m.s.toFixed(1)} s)`; return; }
  if (m.type === 'error') { simFailed(m.text.split(String.fromCharCode(10))[0]); console.error(m.text); return; }
  if (m.type === 'plants') { if (plantsView.setData(m.shoots, m.yf, m.mus, m.dead)) tintBed(); if (m.surf) risesView.setSurf(m.surf); if (m.bed) bedView.setData(m.bed, m.wY); shallowsView.setData(m.herp, m.tad, m.fauna, m.wood, m.yf); return; }
  if (m.type !== 'snap') return;
  LIVE.snap = m; LIVE.snapAt = performance.now() / 1000; LIVE.waiting = false; if (m.sel) LIVE.data3?.onSel(m.sel);
  if (m.rises && m.rises.length && S.fish) risesView.add(m.rises, LIVE.tNow, S.fishScale);   // (on the frame loop's clock)
  if (m.field) { LIVE.field = m.field; LIVE.fieldShow = m.show; }
  if (m.wild && m.wild.length && S.wild) wildView.onKill(m.wild);   // (the fish the sim's wildlife and anglers took: a dive, a plunge, a fish on)
}
function lightByDay() {   // the sun's height and the sky's brightness follow the water model's day
  const e = LIVE.snap; if (!e) return;
  const s = e.sun, cover = ENVC.CLOUD_COVER[e.weather], day = Math.min(1, s * 1.6);
  sun.intensity = 0.15 + 2.3 * day * (1 - 0.6 * cover); hemi.intensity = 0.18 + 0.75 * day * (1 - 0.3 * cover);
  if (LIVE.under && S.clear) hemi.intensity *= 2.2;   // (under water, seeing into it: a fill light for watching — tea water is dim)
  // (the sun's light comes from where the sky draws it: sky3.js, for the date and hour; below the horizon it holds just above it — the
  // light's intensity is the sim's own day, which dims it)
  SEASON3.yf.value = e.yf;   // (the GPU forest's leaves: the date)
  const d = SKY.update(e.yf, e.t, e.weather, camera); placeShadow(SHADOW.d.set(d.x, Math.max(0.03, d.y), d.z));
  // (no shadows from a sun below the horizon, or with "Shadows and soft light" off: faded out and not redrawn — never castShadow off:
  // three disposed the map then, and the materials still sampling it broke their pipelines for good, a black view)
  SHADOW.on = S.post && d.y > 0.02 && day > 0.05; sun.shadow.intensity = SHADOW.on ? 1 : 0;
  FOG_DAY.copy(SKY.haze); scene.environmentIntensity = 0.12 + 0.45 * day;
  WIND3.speed.value += ((e.windSpeed || 0) - WIND3.speed.value) * 0.02;
  skyDim.value = 0.12 + 0.88 * day * (1 - 0.35 * cover); airFog.color.copy(FOG_DAY).multiplyScalar(skyDim.value); AIR.col.value.copy(airFog.color);   // (the haze dims with the sky)
  WU.day.value = 0.1 + 0.9 * day * (1 - 0.3 * cover);   // (the water's light: render3/water3.js)
}
function liveUI() {
  const e = LIVE.snap; if (!e) return;
  // the speed the sim actually runs at (a busy machine — or a tab the browser throttles — can't keep up with the speed asked, 1×
  // included); measured while it runs, a jump's leap in the sim's time skipped
  const now = performance.now();
  // (a jump in progress — the true lakes' spring-to-February spin takes ~20 s — is said, and is no measure of the speed)
  if (LIVE.jump) { const d = Math.abs(e.yf - LIVE.jump.yf); if (Math.min(d, 1 - d) >= 0.03 && now - LIVE.jump.at < 60000) { $('clock').textContent = `jumping to ${dateOf(LIVE.jump.yf)}…`; LIVE.lastW = 0; return; } LIVE.jump = null; LIVE.rate = LIVE.speed; }
  const st = e.simT ?? e.time;   // (the fish's clock: the water's, e.time, moves a simulated minute at a time at the fine speeds — the rate read 0 between)
  if (LIVE.lastW && LIVE.run) { const r = (st - LIVE.lastT) / Math.max(1e-3, (now - LIVE.lastW) / 1000); if (r >= 0 && r < LIVE.speed * 50 + 10) LIVE.rate += (r - LIVE.rate) * 0.3; }
  LIVE.lastT = st; LIVE.lastW = now;
  const yf = e.yf, hh = Math.floor(e.t * 24), mm = Math.floor((e.t * 24 - hh) * 60);
  $('clock').textContent = `${dateOf(yf)} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} · ${['clear', 'cloudy', 'rain', 'storm'][e.weather]}, wind ${e.windSpeed.toFixed(0)} m/s · ${(e.temp0 ?? 0).toFixed(0)} °C${LIVE.run && LIVE.rate < LIVE.speed * 0.9 ? ` · running at ${LIVE.rate >= 100 ? Math.round(LIVE.rate).toLocaleString() : LIVE.rate.toFixed(LIVE.rate < 1 ? 2 : 1)}×` : ''}`;
  // (a jump asked for: the snapshots from before it don't undo the look it set — until one from near its date arrives)
  const sh = iceShare(e.ice), snow = sh > 0.5 ? true : sh < 0.25 ? false : S.snow, ss = seasonOf(yf), key = ss + (snow ? '+snow' : '');
  if (key !== LIVE.lastSeason) { LIVE.lastSeason = key; S.season = ss; S.snow = snow; applySeason(); }
  if (!WORLD_TRUE || (LIVE.iceN = (LIVE.iceN || 0) + 1) % 8 === 1) placeIce(e.ice);   // (the true world's 630,000 vertices: every 2 s)
}
function simFailed(text) {   // (the sim's worker stopped: said, and kept said — the status line's refresh overwrote it within 16 frames)
  LIVE.failed = text || 'error'; $('status').textContent = 'the simulation stopped: ' + LIVE.failed;
}
// the link between the two worlds, and what the panel says of the one shown
function worldLink() {   // (the page is written for the true-size lakes, the default; the 1/10 world says its own)
  if (WORLD_TRUE) return;
  $('worldlink').href = 'w3.html'; $('worldlink').textContent = 'Open the lakes at their real size';
  $('about').textContent = 'Upper and Lower Hot Brook Lake and the brook between them, at 1/10 of their real size with their real depths (the 1949 survey soundings). The land is drawn at the lakes\' scale; the water\'s depth, and everything that lives in it, is true size. The water and its fish are simulated live: about 13,000 fish of the eleven species recorded in these lakes, at the real lakes\' numbers, each fish (or each school of perch, white perch and killifish) with its own brain.';
  $('exv').nextElementSibling.textContent = 'true metres'; $('exv').previousElementSibling.textContent = 'in proportion';
}

// ---------- frame ----------
// (the pixel ratio too: a browser zoom or another monitor changes it — the view was left blurry or oversampled; a move between
// monitors fires no resize, so the ratio's own media query is watched as well)
function resize() { const w = innerWidth, h = innerHeight; renderer.setPixelRatio(DYN.steps[DYN.i]); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
(function watchDpr() { matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener('change', () => { resize(); watchDpr(); }, { once: true }); })();
let last = performance.now(), fps = 60, nFrames = 0; const UW_DIR = new THREE.Vector3(), SUN4 = [0, 1, 0, 0];
async function start() {
  await renderer.init();
  if (!WORLD_TRUE) { const ex = $('exag'); ex.min = '1'; ex.max = '10'; ex.step = '0.5'; ex.setAttribute('aria-label', 'Land height: 1 = in proportion to the lakes, 10 = true metres'); }
  $('exag').value = String(S.exag); $('exv').textContent = `×${S.exag}`; worldLink();   // (the true world's ×1: the page's markup says ×3)
  // the 3-D water (src/w3/env3.js + chem3.js), opening in late May, and its fish at the real lakes' numbers — in the Worker
  LIVE.worker = new Worker(new URL('./sim3worker.js' + WORLD_Q, import.meta.url), { type: 'module' });
  // (the worker says when its modules have loaded — the true world's geometry awaits its 5-MB data module, and a message sent
  // before its handler exists would be lost — and only then is told to found the lakes; with it, what was chosen meanwhile: a
  // pause, a speed, the cut-away's field — those clicks went to a worker not listening yet)
  LIVE.worker.onmessage = ev => {
    if (ev.data.type !== 'loaded') { onSnap(ev.data); return; }
    const w = LIVE.worker; w.postMessage({ type: 'init', cam: [rig.goal.target.x, -rig.goal.target.z, rig.goal.dist] });
    w.postMessage({ type: 'run', run: LIVE.run }); w.postMessage({ type: 'speed', speed: LIVE.speed }); if (S.show !== 'plain') w.postMessage({ type: 'show', show: S.show });
  };
  LIVE.data3 = makeData3({ LIVE, camera, canvas, rig });   // (the data page and click-a-fish: render3/data3.js)
  LIVE.worker.onerror = ev => { simFailed(ev.message || 'error'); console.error(ev); };
  LIVE.worker.onmessageerror = ev => { simFailed('a message from it could not be read'); console.error(ev); };
  placeGround(); campsView.place(); applyLook(); liveUI(); applySeason(); buildSection();
  { // who casts the sun's shadows and who takes them (the far trees' tiers and the skirt neither: too many and too far)
    const cast = [TIERS.midConifer, TIERS.midBroad, TIERS.spire, TIERS.pine, TIERS.hard, TIERS.spireLite, TIERS.pineLite, TIERS.hardLite, shrubMesh, rockMesh], take = [band, farMesh, TIERS.midConifer, TIERS.midBroad, TIERS.spire, TIERS.pine, TIERS.hard, TIERS.spireLite, TIERS.pineLite, TIERS.hardLite, shrubMesh, rockMesh];
    for (const m of cast) if (m) m.castShadow = true; for (const m of take) if (m) m.receiveShadow = true;
    for (const g of [campsView.group, wildView.group]) g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }
  POST = makePost();
  resize(); go('Both lakes'); $('busy').classList.add('done');
  const backend = renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
  renderer.setAnimationLoop(now => {
    // (dt, capped, for the animation; the sim is sent the real time passed — capped at 1 s, the worker limits its own catch-up — or
    // below 10 fps it ran slower than real time at 1×: 0.1× in a throttled tab, the clock seeming frozen)
    const raw = Math.max(0, (now - last) / 1000), dt = Math.min(0.1, raw); last = now; fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    if (FIND.follow && LIVE.data3?.following?.()) { FIND.follow = null; $('watching').textContent = ''; }   // (the picked fish's follow, ticked since: it owns the camera)
    LIVE.data3?.update(); rig.update(dt); LIVE.tNow = now / 1000;
    if (Number.isFinite(TREE_R) && S.trees && treeAt && Math.hypot(rig.goal.target.x - treeAt[0], -rig.goal.target.z - treeAt[1]) > TREE_R / 5) placeTrees(true);
    else if (S.trees && detAt && Math.hypot(camera.position.x - detAt[0], -camera.position.z - detAt[1]) > DET_MOVE) placeNearTrees();   // (the near tier follows the camera)
    liveTick(Math.min(1, raw)); lightByDay();
    if (S.plants) plantsView.update(rig.target.x, -rig.target.z, rig.dist);
    risesView.update(now / 1000, rig.target.x, -rig.target.z, rig.dist);
    if (S.fish) bedView.update(now / 1000, rig.target.x, -rig.target.z, rig.dist);
    if (S.wild && LIVE.snap) {   // (LIVE.wildMs: the animals' CPU time a frame, smoothed)
      const w0 = performance.now(); wildView.update(now / 1000, LIVE.snap, S.fishScale, camera.position, camera); shallowsView.update(now / 1000, LIVE.snap, rig.target.x, -rig.target.z, rig.dist, camera.position, S.fishScale);
      LIVE.wildMs = (LIVE.wildMs || 0) * 0.95 + (performance.now() - w0) * 0.05;
    }
    if (S.camps) campsView.update(now / 1000, LIVE.snap, camera);   // (the boats at the docks rocking, the lights by night)
    if (FIND.follow) { const p = FIND.follow.at(); if (p) rig.goal.target.set(p[0], p[1], p[2]); else { FIND.follow = null; $('watching').textContent = ''; } }
    if (LIVE.snap && S.fish) {   // (the sun's direction and strength for the fish's shadows on the bed)
      const sp = SHADOW.d, sl = sp.length() || 1, open = 1;   // (the sun's direction: the light itself now stands 2 km back from the view's target)
      SUN4[0] = sp.x / sl; SUN4[1] = sp.y / sl; SUN4[2] = sp.z / sl; SUN4[3] = Math.min(1, Math.max(0, LIVE.snap.sun * 1.6)) * (1 - 0.7 * ENVC.CLOUD_COVER[LIVE.snap.weather]) * (S.snow ? 0 : open);   // (none under the snow-covered ice)
      // (the fish between the snapshot's last two steps: its leftover acc/h, advancing with the real time since it came at the rate
      // the sim is keeping — held at acc/h the fish stood still between snapshots and jumped at each)
      const sn = LIVE.snap, adv = LIVE.run ? Math.max(0, now / 1000 - LIVE.snapAt) * Math.min(LIVE.speed, Math.max(0, LIVE.rate)) : 0, alpha = Math.min(1, (sn.acc + adv) / (sn.h || 0.1));
      LIVE.drawn = fishView.update(sn, alpha, S.fishScale, 1 - Math.min(1, sn.sun * 4), now / 1000, camera.position.x, -camera.position.z, SUN4, risesView.leapAt,
        camera.position.y, renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360)));   // (its level of detail: the eye's height, the screen's pixels a radian)
    }
    if ((LIVE.sinceUI += dt) > 0.25) { LIVE.sinceUI = 0; liveUI(); if (S.wild && (LIVE.wildN = (LIVE.wildN || 0) + 1) % 8 === 0) wildOut(); }
    if (S.cut && S.show !== 'plain' && (LIVE.sinceSection += dt) > 0.5) { LIVE.sinceSection = 0; buildSection(); }
    const cx = camera.position.x, cy = -camera.position.z, ch = camera.position.y + BASE;
    const inBandXY = cx > X0 && cx < GEO.XMAX && cy > Y0 && cy < GEO.YMAX;
    const under = inBandXY && GEO.bodyAt(cx, cy) !== LAND && ch < GEO.levelAt(cx, cy) && S.water;
    WU.under.value = under ? 1 : 0; WU.camDepth.value = under ? GEO.levelAt(cx, cy) - ch : 0; LIVE.under = under;
    if (under) { camera.getWorldDirection(UW_DIR); underwaterFogColor(waterFog.color, UW_DIR.y); waterFog.density = WU.density.value; WU.fogCol.value.copy(waterFog.color); }   // (fogCol: the surface's underside fades into it)
    // (under water the tea-coloured water hides everything past ~20 m: the land's trees aren't drawn — the true world's million)
    if (under !== LIVE.wasUnder) { LIVE.wasUnder = under; const tv = S.trees && !under; for (const m of treeMeshList()) m.visible = tv; shrubMesh.visible = tv; campsView.setUnder(under); }
    scene.fog = under ? waterFog : airFog; sky.visible = !under; scene.background = under ? waterFog.color : null; specks.visible = under;
    $('uw').hidden = !under;
    $('needle').setAttribute('transform', `rotate(${(rig.yaw * 180 / Math.PI).toFixed(1)})`);
    // (the trees in view, by tier — from the third frame: a cull before the first frames' lights and shadow maps were built once
    // left a shadow node without its map, its pipelines broken for good)
    if (FOREST && TIERS.spire.visible && ++LIVE.frames > 2) FOREST.update(renderer, camera, SHADOW.on ? { x: sun.target.position.x, z: sun.target.position.z, R: SHADOW.R } : null);
    sun.shadow.needsUpdate = SHADOW.on && (nFrames & 1) === 0;
    if (POST && S.post) POST.render(); else renderer.render(scene, camera);
    dynRes(now);
    placeLabels(innerWidth, innerHeight);
    if ((nFrames++ & 15) === 0 && !LIVE.failed) $('status').textContent = `${backend} · ${fps.toFixed(0)} fps${DYN.i ? ` (${Math.round(100 * DYN.steps[DYN.i] / DYN.steps[0])} % res)` : ''} · land ×${S.exag} · water model ${W3.G.NCELL.toLocaleString()} cells · ${LIVE.snap ? Math.round(LIVE.snap.count).toLocaleString() + ' fish (' + LIVE.snap.agents.toLocaleString() + ' brains) · ' + (LIVE.snap.nyAll ?? LIVE.snap.ny).toLocaleString() + ' schools of young' + (WORLD_TRUE ? ` · ${LIVE.snap.nf.toLocaleString()} drawn near the view` : '') + (LIVE.snap.gpu ? ' · fast-forward on the GPU' : '') : 'starting the lakes…' + (LIVE.progress ? ' ' + LIVE.progress : '')}`;
  });
}
function dynRes(now) {   // (every half second: the last frame's GPU time, smoothed; a step down after a second over, up after 3 s under)
  // (opt-in, ?res=auto: through a remote desktop at 30 Hz — the human's usual view — or in a throttled window the GPU clocks down and its
  // frames time long, and this dropped the view to half resolution for nothing)
  if (DYN.busy || now - DYN.t < 500 || !renderer.backend?.trackTimestamp || !/[?&]res=auto/.test(location.search)) return;
  DYN.t = now; DYN.busy = true;
  renderer.resolveTimestampsAsync('render').then(g => {
    DYN.busy = false; if (!(g > 0)) return;
    DYN.gpu = DYN.gpu ? DYN.gpu * 0.6 + g * 0.4 : g;
    const i = DYN.i, up = i > 0 ? DYN.gpu * (DYN.steps[i - 1] / DYN.steps[i]) ** 2 : Infinity;   // (the frame at the next step up)
    // (only when the GPU is what holds the frame back: a screen or a remote desktop showing 30 frames a second clocks the GPU down and
    // its frames take longer — dropping the pixels then bought nothing)
    const frameMs = 1000 / Math.max(1, fps);
    DYN.hi = DYN.gpu > 14.5 && DYN.gpu > 0.8 * frameMs ? DYN.hi + 1 : 0; DYN.lo = up < 12 || up < 0.6 * frameMs ? DYN.lo + 1 : 0;
    let j = i; if (DYN.hi >= 2 && i < DYN.steps.length - 1) j = i + 1; else if (DYN.lo >= 6 && i > 0) j = i - 1;
    if (j !== i) { DYN.i = j; DYN.hi = DYN.lo = 0; resize(); }
  }).catch(() => { DYN.busy = false; });
}
start().catch(e => { $('busy').classList.remove('done'); busyFail(e.message); console.error(e); });
window.hb3 = { renderer, scene, camera, rig, GEO, go, S, LIVE, trees: TREES, tiers: TIERS, sun, DYN, post: { get: () => POST, set: p => { POST = p; } }, fishView, plantsView, risesView, bedView, wildView, shallowsView, campsView, apply: { look: applyLook, season: applySeason, height: applyHeight, section: buildSection } };
