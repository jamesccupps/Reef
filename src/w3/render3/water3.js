// water3.js — how the lakes' water looks (browser layer), shared by the bed, the weeds and the fish.
// Light that reaches a thing under the surface, and comes back up to an eye above it, is absorbed by the tea-coloured water
// per colour: blue most (the dissolved colour of a spruce–fir and wetland catchment), then green, red least — exp(−Kd·path).
// The water's own scattered light fills in what is lost, so deep water turns the colour of the water itself. A thing at
// depth d is lit by the sunlight that reached it (path d down); seen from above, its light climbs back to the surface along
// the refracted view ray (d / cos θw). Under water the fog carries the eye's path instead: its colour follows where you look
// — bright toward the sunlit surface, the water's colour level, dark below — and darkens as you go deeper.
// (Under water three's FogExp2 carries the eye's path — main3.js — its colour from underwaterFogColor.)
// "See into the water" thins the water (KD × CLEAR_MUL) so the fish show down to several metres — clearer than the real
// lakes' (Secchi ~3 m), for watching them.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';

const { uniform, vec4, float, exp, sqrt, max, normalize, cameraPosition, positionWorld, output } = THREE.TSL;

export const KD_TRUE = new THREE.Vector3(0.55, 0.75, 1.9);   // /m, red, green, blue — tea water (PAR Kd ~0.8: Secchi ~3.2 m)
export const CLEAR_MUL = 0.3;                                // "see into the water"
export const WU = {
  kd: uniform(KD_TRUE.clone()),
  scatter: uniform(new THREE.Color(0x2e2a14)),   // the water's own colour lit by a full day (seen from above: deep water)
  day: uniform(1),                               // the daylight's share (night → dark water)
  under: uniform(0),                             // 1 when the camera is under the surface
  camDepth: uniform(0),                          // m below the surface
  // under water: the fog's colours (looking up toward the bright surface, level, down into the dark) and its density /m
  up: uniform(new THREE.Color(0x9fa96c)), level: uniform(new THREE.Color(0x4b4a2a)), down: uniform(new THREE.Color(0x1e1e12)),
  density: uniform(0.12),
  on: uniform(1),                                // 0 for the depth chart's look (its colours are the depths)
};

// a material's lit colour once the water has had its way, for a fragment at depth `depth` (m below the local surface; ≤ 0
// above water: unchanged). For material.outputNode
export function waterOut(depth) {
  const d = max(depth, 0).mul(WU.on), kd = WU.kd;
  const V = normalize(cameraPosition.sub(positionWorld)), s2 = float(1).sub(V.y.mul(V.y));
  const cw = sqrt(max(float(1).sub(s2.div(1.77)), 0.04));          // the refracted ray's cosine under the surface (n = 1.33)
  const down = exp(kd.mul(d).negate());                             // the sunlight that reached it
  const T = exp(kd.mul(d.div(cw).mul(float(1).sub(WU.under))).negate());   // its light's way back up (an eye above the water)
  return vec4(output.rgb.mul(down).mul(T).add(WU.scatter.mul(WU.day).mul(float(1).sub(T))), output.a);
}

// the underwater fog's colour for an eye looking with vertical component dirY (−1 down … 1 up) at the camera's depth: bright
// toward the sunlit surface, the water's colour level, dark below (three's FogExp2 takes one colour: it follows the gaze)
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _c = new THREE.Color();
export function underwaterFogColor(target, dirY) {
  const s = Math.exp(-WU.kd.value.y * WU.camDepth.value) * WU.day.value;
  target.copy(WU.down.value).lerp(WU.level.value, sm(-0.75, 0.05, dirY));
  return target.lerp(_c.copy(WU.up.value), sm(0.15, 0.85, dirY)).multiplyScalar(s);
}
export function setClear(on) {
  WU.kd.value.copy(KD_TRUE).multiplyScalar(on ? CLEAR_MUL : 1);
  WU.density.value = on ? 0.035 : 0.12;
}
