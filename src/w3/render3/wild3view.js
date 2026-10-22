// wild3view.js — the lakes' larger animals and their people on screen (browser layer): the fish-eating WILDLIFE of the sim (fish3
// WILD3: common loons, great blue herons, belted kingfishers, ospreys, the bald eagles, common and hooded mergansers, river otters,
// mink), the ANGLERS (WILD3 'angler': boats in the open-water months; 'iceAngler': tip-ups, a shelter and a jigger on the ice), the
// raccoons at the water's edge at night (not in the sim: drawn for the shore's life), and the large animals of the woods — MOOSE wading
// in the weedy shallows (plants3 PL3.MOOSE) and, once the forest model runs (src/w3/forest3.js: env.forest), its bears, deer and moose
// where it keeps them. True size, low-poly but recognisable (render3/wild3kit.js), each with its own simple life.
// WHAT THE SIM DECIDES: who is on the lakes and when — each one's season (WILD3 yf; the anglers' months; the ice: no loon, heron,
// kingfisher, osprey or merganser on a frozen lake, ice anglers only on it), its activity by the light (WILD3 act: day, twilight,
// night — a loon rests on the water at night, a mink hunts then, the kingfishers and ospreys are gone), WHERE it hunts (its depths and
// beds, WILD3 z and b: a heron wades in water ≤ 30–50 cm, a kingfisher dives in < 60 cm, a loon pursues to 8 m) and WHAT: each hunter
// looks for the sim's own fish of its sizes and depths (wild3kit preyPick — an osprey circles over the large fish near the surface, a
// heron stands where the small fish are in the shallows). At the fine speeds (≤ 6×) every fish the sim's wildlife and anglers take
// (fish3 wildEv) is a dive, a plunge, a strike or a fish on the line where it was taken; faster, the hunts keep their own time.
// HOW MANY: on the true-size lakes the sim's own numbers (fish3 _wildN); on the 1/10 lakes (a hundredth of the area, a tenth of the
// shore — the sim's own counts there are ~0.1 of a loon) what one sees on the real lakes along the drawn shore: each lake its own
// resident unit — a pair of loons, a heron, its kingfishers, the ospreys that fish it, the eagle pair on Upper (the human: they nest
// there), a merganser brood — and the mink, otters and anglers at the real shore's and effort's rates. Cosmetic motion and choices
// use Math.random and a hash (never core.rand); the sim never reads anything here.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, BODIES, LAND, UPPER, LOWER, WORLD_TRUE, cellIndex } from '../geometry.js';
import { WILD3, WILD_LAKE_HA, F3, S3, KEYS3 } from '../fish3.js';
import { PL3 } from '../plants3.js';
import { shape, partMesh, frame, part, segment, surfY, hash, rnd, clamp, angD, col, places, pickWater, pickShore, nearestShore, preyPick } from './wild3kit.js';
const { attribute } = THREE.TSL;

const BODY = [UPPER, LOWER], TAU = Math.PI * 2;
const inWin = ([a, b], yf) => a <= b ? yf >= a && yf < b : yf >= a || yf < b;   // (a window may wrap the year's end: the ice anglers')
// THE 1/10 LAKES' CENSUS (per lake [Upper, Lower]; a fraction: present on that share of days, by the day's hash) — see the header
const VIEW10 = { loon: [2, 2], heron: [1, 1], kingfisher: [2, 1], osprey: [1, 1], eagle: [2, 0], cmerganser: [1, 0], hmerganser: [0, 1], otter: [0.6, 0.4], mink: [1, 1] };
// THE ANGLERS (both worlds — WILD3's research: Upper ~12 angler-hours a hectare a year, Lower ~4; four-fifths in open water over
// May–November's 214 days of ~12 fishing hours: Upper ~1.4 boats out at a time, Lower ~0.35; a fifth through the ice over January–
// March: ~1–2 camps); the shore angler at the brook's upper mouth (the human's own pool) some mornings and evenings
const ANGLERS = { angler: [1.2, 0.35], iceAngler: [1.2, 0.3], shore: [0.4, 0] };
const GROUP = { cmerganser: 5, hmerganser: 4 };   // (the true lakes: birds a group)
const NAMES = { loon: 'a common loon', heron: 'a great blue heron', kingfisher: 'a belted kingfisher', osprey: 'an osprey', eagle: 'a bald eagle', cmerganser: 'common mergansers', hmerganser: 'hooded mergansers', otter: 'river otters', mink: 'a mink', raccoon: 'a raccoon', angler: 'anglers in a boat', iceAngler: 'an ice-fishing camp', shore: 'an angler on the bank', moose: 'a moose', bear: 'a black bear', deer: 'a white-tailed deer' };
// (render3/sim3worker.js packs env.forest's animals with these two lists)
const FOREST_KIND = ['bear', 'deer', 'moose'], FOREST_ACT = ['walk', 'graze', 'browse', 'drink', 'wade', 'fish', 'bed', 'den'];

// ---------- the bodies ----------
// a WING (the right one along +z; the left its mirror), span s m from the shoulder, chord c: the leading edge out to the wrist (`wrist`
// of the span, `crook` m ahead — an osprey's bent wing), the hand tapering to the tip, `fingers` slotted primaries; its top `top`, its
// underside `under`, the hand `hand`/`handU` (palettes); dih: its dihedral (m up per m out); droop: the hand's droop (m)
function wingGeos(s, c, { wrist = 0.42, crook = 0, fingers = 0, top = 'A', under = 'A', hand = null, handU = null, dih = 0.05, droop = 0 } = {}) {
  const yAt = z => dih * z - (z > s * wrist ? droop * (z - s * wrist) / (s * (1 - wrist)) : 0);
  const L = [[c * 0.42, 0], [c * 0.5 + crook, s * wrist], [c * 0.22, s * 0.8], [c * 0.02, s]], T = [[-c * 0.5, 0], [-c * 0.55, s * wrist], [-c * 0.36, s * 0.8], [-c * 0.12, s * 0.97]];
  const tris = [];   // [a, b, c, top palette, under palette]
  const P = ([x, z]) => [x, yAt(z), z];
  for (let k = 0; k < 3; k++) { const h = k === 2, t = h && hand ? hand : top, u = h && handU ? handU : under; tris.push([P(L[k]), P(T[k]), P(T[k + 1]), t, u], [P(L[k]), P(T[k + 1]), P(L[k + 1]), t, u]); }
  for (let f = 0; f < fingers; f++) {   // (the slotted primaries: narrow feathers past the hand)
    const bx = c * (0.12 - 0.42 * f / Math.max(1, fingers - 1)), bz = s * (0.86 + 0.04 * (1 - f / Math.max(1, fingers))), w = c * 0.06;
    tris.push([P([bx + w, bz]), P([bx - w, bz]), P([bx - c * 0.08, s * (1.1 - 0.05 * f / fingers)]), hand || top, handU || under]);
  }
  const up = (a, b, cc) => (b[2] - a[2]) * (cc[0] - a[0]) - (b[0] - a[0]) * (cc[2] - a[2]) > 0;
  const build = mirror => {
    const S = shape();
    for (let [a, b, cc, t, u] of tris) {
      if (mirror) { a = [a[0], a[1], -a[2]]; b = [b[0], b[1], -b[2]]; cc = [cc[0], cc[1], -cc[2]]; }
      if (!up(a, b, cc)) [b, cc] = [cc, b];
      S.tri(a, b, cc, t); S.tri(a, cc, b, u);
    }
    return S.done();
  };
  return [build(false), build(true)];
}
const LOON_C = [col(0x101315), col(0xe6e8e4), col(0x8c1212), col(0x101315)], LOON_CHICK = [col(0x3e3128), col(0x5a4c40), col(0x2a2220), col(0x3e3128)], LOON_JUV = [col(0x55585a), col(0xd8d8d2), col(0x3a3030), col(0x55585a)];
function loonGeo() {
  const T = shape();
  T.ell([-0.02, 0, 0], [0.3, 0.1, 0.13], s => s[1] < -0.25 ? 'B' : 'A', { w: 10, h: 7 });
  for (let i = 0; i < 7; i++) for (const z of [-1, 1]) T.ell([-0.21 + i * 0.055, 0.075 + 0.01 * Math.sin(i * 1.7), z * (0.04 + 0.014 * (i % 2))], [0.011, 0.006, 0.009], 'B', { w: 4, h: 3 });   // (the back's white checks)
  T.ell([-0.31, 0.03, 0], [0.05, 0.02, 0.05], 'A', { w: 6, h: 4 });
  const H = shape();   // the neck and head about the neck's base
  H.tube([[0, 0, 0], [0.04, 0.07, 0], [0.08, 0.14, 0]], [0.05, 0.042, 0.04], (t, a) => t > 0.25 && t < 0.65 && Math.abs(Math.sin(a)) > 0.55 && Math.floor(t * 22) % 2 ? 'B' : 'A', 8);   // (the white necklace)
  H.ell([0.11, 0.17, 0], [0.065, 0.048, 0.045], 'A', { w: 8, h: 6 });
  H.tube([[0.16, 0.165, 0], [0.26, 0.152, 0]], [[0.012, 0.016], 0.002], 'K', 6);
  for (const z of [-1, 1]) H.ell([0.135, 0.18, z * 0.038], [0.009, 0.009, 0.006], 'C', { w: 4, h: 3 });
  return { torso: T.done(), head: H.done() };
}
// MERGANSERS: common (a drake's white body, black back, dark green head; a hen's grey with a rusty crested head; both a thin red bill)
// and hooded (a drake's black and white with a fan crest and rufous flanks; a hen brown with a cinnamon crest)
const CM_M = [col(0x111111), col(0xf2f0e8), col(0xc0281a), col(0x0f2a1c)], CM_F = [col(0x77787e), col(0xa2a3a8), col(0xc8461e), col(0x8a4422)], CM_D = [col(0x4a3a2c), col(0xe2dacb), col(0x9a6a46), col(0x7a4a2c)];
const HM_M = [col(0x141414), col(0xf4f2ea), col(0x8a4a22), col(0x141414)], HM_F = [col(0x5a4a3c), col(0x9a6a3a), col(0x7a6a5a), col(0x9a6a3a)], HM_D = [col(0x4a3c30), col(0x8a6a48), col(0x6a5a4a), col(0x6a5040)];
function mergGeo(hooded) {
  const T = shape(), r = hooded ? [0.19, 0.075, 0.09] : [0.25, 0.085, 0.11];
  T.ell([0, 0.02, 0], r, hooded ? (s => s[1] > 0.35 ? 'A' : s[0] > 0.45 ? 'B' : 'C') : (s => s[1] > 0.6 ? 'A' : 'B'), { w: 10, h: 7 });
  T.ell([-r[0] - 0.02, 0.04, 0], [0.06, 0.02, 0.05], 'A', { w: 6, h: 4 });
  const H = shape();
  H.tube([[0, 0, 0], [0.03, 0.06, 0], [0.05, 0.1, 0]], [0.035, 0.032, 0.03], t => t > 0.45 ? 'D' : hooded ? 'B' : 'B', 6);
  H.ell([0.07, 0.125, 0], hooded ? [0.045, 0.042, 0.035] : [0.055, 0.045, 0.04], 'D', { w: 8, h: 6 });
  if (hooded) H.ell([0.035, 0.15, 0], [0.06, 0.05, 0.014], s => s[0] * s[0] + s[1] * s[1] < 0.45 && s[0] < 0.3 ? 'B' : 'D', { w: 8, h: 6 });   // (the fan crest: white in a black rim — a hen's all cinnamon)
  else H.ell([0.03, 0.15, 0], [0.045, 0.025, 0.02], 'D', { w: 6, h: 4 });   // (the shaggy crest)
  H.tube([[0.11, 0.12, 0], [hooded ? 0.16 : 0.19, 0.11, 0]], [[0.01, 0.011], 0.005], hooded ? 'K' : 'C', 5);
  for (const z of [-1, 1]) H.ell([0.09, 0.135, z * 0.034], [0.007, 0.007, 0.005], 'K', { w: 4, h: 3 });
  return { torso: T.done(), head: H.done() };
}
// GREAT BLUE HERON: blue-grey, the neck paler, a black crown stripe and plume, a yellow dagger bill, long dark legs (~1.2 m standing,
// ~1.8-m wings)
const HERON_C = [col(0x6e7f8e), col(0xb8bec2), col(0xd8b040), col(0x1e2226)];
function heronGeo() {
  const T = shape();
  T.ell([0, 0, 0], [0.24, 0.11, 0.12], 'A', { w: 10, h: 7 });
  T.ell([0.12, -0.07, 0], [0.09, 0.1, 0.075], 'B', { w: 6, h: 5 });
  T.ell([-0.26, -0.02, 0], [0.09, 0.03, 0.07], 'A', { w: 6, h: 4 });
  T.ell([0.02, 0.06, 0], [0.18, 0.04, 0.125], s => s[0] < -0.2 ? 'D' : 'A', { w: 8, h: 4 });   // (the folded wings, their dark primaries)
  const N = shape();
  N.tube([[0, 0, 0], [0.07, 0.1, 0], [0.03, 0.2, 0], [0.09, 0.3, 0], [0.14, 0.36, 0]], [0.05, 0.04, 0.034, 0.031, 0.03], 'B', 7);
  N.ell([0.17, 0.38, 0], [0.065, 0.04, 0.034], 'B', { w: 8, h: 5 });
  N.ell([0.15, 0.405, 0], [0.06, 0.012, 0.03], 'D', { w: 6, h: 3 });
  N.tube([[0.12, 0.4, 0], [0.04, 0.425, 0], [-0.03, 0.42, 0]], [0.007, 0.004, 0.001], 'D', 4);
  N.tube([[0.22, 0.38, 0], [0.37, 0.368, 0]], [[0.012, 0.015], 0.002], 'C', 6);
  for (const z of [-1, 1]) N.ell([0.19, 0.39, z * 0.03], [0.007, 0.007, 0.004], 'C', { w: 4, h: 3 });
  const L = shape();   // one leg from the hip down
  L.tube([[0, 0, 0], [0, -0.38, 0], [0.01, -0.76, 0]], [0.013, 0.009, 0.008], 'D', 5);
  for (const [x, z] of [[0.09, 0], [-0.05, 0], [0.06, 0.05], [0.06, -0.05]]) L.tube([[0.01, -0.765, 0], [x, -0.77, z]], [0.005, 0.003], 'D', 4, false);
  return { torso: T.done(), neck: N.done(), leg: L.done() };
}
// BELTED KINGFISHER: blue-grey and white, a big ragged-crested head and heavy bill; the hen a rusty band below the blue one
const KF_M = [col(0x4a6a8c), col(0xf0f0ea), col(0xf0f0ea), col(0x222222)], KF_F = [col(0x4a6a8c), col(0xf0f0ea), col(0xa0502a), col(0x222222)];
function kingGeo() {
  const T = shape();
  T.ell([0, 0, 0], [0.085, 0.05, 0.048], s => s[0] > 0.25 && s[1] > -0.55 && s[1] < 0.05 ? 'A' : s[0] > 0.05 && s[1] <= -0.55 && s[1] > -0.85 ? 'C' : s[1] < -0.2 ? 'B' : 'A', { w: 8, h: 6 });
  T.ell([-0.1, -0.005, 0], [0.05, 0.012, 0.025], 'A', { w: 6, h: 3 });
  const H = shape();
  H.ell([0.03, 0.03, 0], [0.052, 0.046, 0.043], 'A', { w: 8, h: 6 });
  H.tube([[0.0, 0.06, 0], [-0.05, 0.09, 0]], [0.018, 0.001], 'A', 5); H.tube([[0.02, 0.07, 0], [-0.02, 0.1, 0]], [0.014, 0.001], 'A', 5);
  H.ell([0.0, -0.012, 0], [0.034, 0.018, 0.047], 'B', { w: 8, h: 4 });   // (the white collar)
  H.tube([[0.07, 0.028, 0], [0.145, 0.022, 0]], [[0.011, 0.012], 0.003], 'K', 6);
  for (const z of [-1, 1]) { H.ell([0.06, 0.045, z * 0.035], [0.007, 0.006, 0.004], 'B', { w: 4, h: 3 }); H.ell([0.05, 0.035, z * 0.04], [0.006, 0.006, 0.004], 'K', { w: 4, h: 3 }); }
  return { torso: T.done(), head: H.done() };
}
// OSPREY: dark brown above, white below, a white head with a dark stripe through the eye, a black hooked bill, the bent ('M') wings
const OSP_C = [col(0x3a2c22), col(0xeceae4), col(0xd8c030), col(0x2a2018)];
function ospreyGeo() {
  const T = shape();
  T.ell([0, 0, 0], [0.2, 0.08, 0.09], s => s[1] > 0.15 ? 'A' : 'B', { w: 10, h: 7 });
  T.ell([-0.25, -0.005, 0], [0.11, 0.015, 0.06], s => Math.floor((s[0] + 1) * 4) % 2 ? 'A' : 'D', { w: 8, h: 3 });
  const H = shape();
  H.ell([0.04, 0.03, 0], [0.06, 0.05, 0.045], 'B', { w: 8, h: 6 });
  for (const z of [-1, 1]) { H.ell([0.025, 0.035, z * 0.032], [0.05, 0.011, 0.012], 'A', { w: 6, h: 3 }); H.ell([0.065, 0.04, z * 0.03], [0.007, 0.007, 0.004], 'C', { w: 4, h: 3 }); }
  H.ell([-0.005, 0.06, 0], [0.04, 0.012, 0.03], 'A', { w: 6, h: 3 });
  H.tube([[0.085, 0.032, 0], [0.12, 0.024, 0], [0.128, 0.004, 0]], [[0.011, 0.013], 0.007, 0.002], 'K', 5);
  return { torso: T.done(), head: H.done() };
}
// BALD EAGLE: dark brown, the head and tail white, a big yellow hooked bill and yellow feet, plank-straight wings with fingered tips
// (~2-m span); the young all dark
const EAGLE_C = [col(0x2a1e14), col(0xf2f0ea), col(0xe0b020), col(0x2a1e14)], EAGLE_J = [col(0x3a2a1e), col(0x5a4632), col(0xb89a50), col(0x3a2a1e)], EAGLET = [col(0x6a645c), col(0x8a847a), col(0x4a443c), col(0x6a645c)];
function eagleGeo() {
  const T = shape();
  T.ell([0, 0, 0], [0.3, 0.13, 0.14], 'A', { w: 10, h: 7 });
  T.ell([-0.34, -0.01, 0], [0.14, 0.02, 0.09], 'B', { w: 8, h: 3 });
  const H = shape();
  H.ell([0, 0, 0], [0.08, 0.07, 0.07], 'B', { w: 8, h: 5 });
  H.ell([0.06, 0.035, 0], [0.08, 0.065, 0.058], 'B', { w: 8, h: 6 });
  H.tube([[0.12, 0.04, 0], [0.165, 0.03, 0], [0.18, 0.0, 0]], [[0.022, 0.027], 0.014, 0.003], 'C', 6);
  for (const z of [-1, 1]) H.ell([0.105, 0.055, z * 0.04], [0.009, 0.008, 0.005], 'C', { w: 4, h: 3 });
  return { torso: T.done(), head: H.done() };
}
const TALON_C = { osprey: [col(0x9aa0a0)], eagle: [col(0xe0b020)], kingfisher: [col(0x6a4a3a)] };
function talonGeo() {   // two short legs and their toes, down from the body
  const S = shape();
  for (const z of [-1, 1]) {
    S.tube([[0, 0, z * 0.045], [0.01, -0.09, z * 0.05]], [0.014, 0.011], 'A', 5);
    for (const [x, zz] of [[0.05, 0], [-0.04, 0], [0.035, 0.03], [0.035, -0.03]]) S.tube([[0.01, -0.095, z * 0.05], [0.01 + x, -0.1, z * 0.05 + zz]], [0.006, 0.002], 'A', 4, false);
  }
  return S.done();
}
// a NEST: a platform of sticks ~1.6 m across in a pine's crown
function nestGeo() {
  const S = shape();
  S.tube([[0, -0.45, 0], [0, 0, 0], [0, 0.05, 0]], [0.55, 0.8, 0.72], 'A', 10);
  for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 0.7 + 0.15 * (k % 3); S.tube([[Math.cos(a) * 0.4, -0.1 - 0.05 * (k % 2), Math.sin(a) * 0.4], [Math.cos(a + 0.4) * (r + 0.3), -0.15 + 0.1 * (k % 3), Math.sin(a + 0.4) * (r + 0.3)]], [0.025, 0.012], 'B', 4, false); }
  return S.done();
}
const NEST_C = [col(0x5a4630), col(0x46382a)];
// PREY in a bill or talons: a small fish, unit length (snout +0.5), silvery belly
function preyGeo() {
  const S = shape();
  S.ell([0, 0, 0], [0.42, 0.11, 0.05], s => s[1] > 0.15 ? 'A' : 'B', { w: 8, h: 5 });
  S.tri([-0.38, 0, 0], [-0.55, 0.12, 0], [-0.55, -0.12, 0], 'A', true);
  return S.done();
}
// RIVER OTTER (~1.1 m with its thick tail; dark brown, a paler throat) and MINK (the same build at half the size, chocolate-dark)
const OTTER_C = [col(0x3a2a1e), col(0x6e5c48), col(0x2a1e16), col(0x141010)], MINK_C = [col(0x24160e), col(0x2c1c12), col(0x24160e), col(0x0e0a08)];
function otterGeo() {
  const T = shape();
  T.tube([[-0.58, 0.02, 0], [-0.32, 0.0, 0], [-0.1, 0.0, 0], [0.12, 0.01, 0], [0.26, 0.03, 0]], [0.012, [0.05, 0.045], [0.085, 0.08], [0.09, 0.085], [0.07, 0.068]], (t, a) => Math.cos(a) < -0.5 && t > 0.5 ? 'B' : 'A', 8);
  const H = shape();
  H.ell([0.07, 0.02, 0], [0.085, 0.058, 0.064], 'A', { w: 8, h: 6 });
  H.ell([0.14, 0.0, 0], [0.045, 0.035, 0.045], 'B', { w: 6, h: 5 });
  H.ell([0.183, 0.01, 0], [0.012, 0.01, 0.016], 'D', { w: 4, h: 3 });
  for (const z of [-1, 1]) { H.ell([0.035, 0.065, z * 0.045], [0.012, 0.012, 0.008], 'A', { w: 4, h: 3 }); H.ell([0.12, 0.04, z * 0.035], [0.008, 0.008, 0.005], 'K', { w: 4, h: 3 }); }
  const L = shape();
  L.tube([[0, 0, 0], [0.01, -0.08, 0]], [0.026, 0.02], 'C', 5); L.ell([0.03, -0.085, 0], [0.035, 0.012, 0.025], 'C', { w: 5, h: 3 });
  return { torso: T.done(), head: H.done(), leg: L.done() };
}
// RACCOON (~0.85 m with its ringed tail; grey, the black mask and white brows)
const COON_C = [col(0x7a766e), col(0xd8d4cc), col(0x5a564e), col(0x161412)];
function coonGeo() {
  const T = shape();
  T.ell([0, 0.02, 0], [0.24, 0.14, 0.13], 'A', { w: 10, h: 7 }); T.ell([-0.14, 0.05, 0], [0.13, 0.13, 0.12], 'A', { w: 8, h: 6 });
  T.tube([[-0.24, 0.06, 0], [-0.38, 0.02, 0], [-0.52, -0.04, 0]], [0.05, 0.047, 0.035], t => Math.floor(t * 9) % 2 ? 'D' : 'A', 7);
  const H = shape();
  H.ell([0.05, 0.02, 0], [0.08, 0.07, 0.07], 'A', { w: 8, h: 6 });
  H.tube([[0.1, 0.0, 0], [0.18, -0.02, 0]], [0.038, 0.014], 'B', 6);
  H.ell([0.19, -0.02, 0], [0.012, 0.01, 0.012], 'D', { w: 4, h: 3 });
  H.ell([0.1, 0.03, 0], [0.035, 0.022, 0.075], 'D', { w: 8, h: 4 });
  H.ell([0.09, 0.06, 0], [0.03, 0.012, 0.062], 'B', { w: 6, h: 3 });
  for (const z of [-1, 1]) H.tube([[0.02, 0.07, z * 0.045], [0.0, 0.12, z * 0.055]], [0.022, 0.002], 'A', 4);
  const L = shape(); L.tube([[0, 0, 0], [0.01, -0.17, 0]], [0.028, 0.022], 'D', 5); L.ell([0.03, -0.172, 0], [0.035, 0.012, 0.025], 'D', { w: 5, h: 3 });
  return { torso: T.done(), head: H.done(), leg: L.done() };
}
// MOOSE (~2.8 m long, ~1.9 m at the shoulder; dark brown, the long legs greyer, the humped shoulders, the overhanging muzzle and the
// bell; a bull's palmate antlers spring to December), WHITE-TAILED DEER (~1.8 m, ~0.95 m; red-brown in summer, grey-brown in winter,
// the white flag), BLACK BEAR (~1.6 m, ~0.9 m; black, a tan muzzle)
const MOOSE_C = [col(0x2e2219), col(0x8a7c6a), col(0xb8a074), col(0x141010)], MOOSE_CALF = [col(0x6a4026), col(0x8a6a50), col(0xb8a074), col(0x201410)];
const DEER_S = [col(0x8a5530), col(0xf0ece4), col(0x8a5530), col(0x1a1410)], DEER_W = [col(0x6e6254), col(0xf0ece4), col(0x6e6254), col(0x1a1410)], FAWN = [col(0x9a6030), col(0xf0ece4), col(0xf2eadc), col(0x1a1410)];
const BEAR_C = [col(0x161412), col(0x8a6a4a), col(0x161412), col(0x080808)];
function mooseGeo() {
  const T = shape();
  T.ell([0, 1.42, 0], [0.98, 0.46, 0.4], 'A', { w: 12, h: 8 }); T.ell([0.42, 1.66, 0], [0.5, 0.38, 0.36], 'A', { w: 10, h: 7 }); T.ell([-0.58, 1.44, 0], [0.42, 0.42, 0.38], 'A', { w: 10, h: 7 });
  T.ell([-0.98, 1.6, 0], [0.06, 0.05, 0.05], 'A', { w: 5, h: 3 });
  const H = shape();   // about the neck's base
  H.tube([[0, 0, 0], [0.25, 0.08, 0], [0.45, 0.1, 0]], [0.3, 0.24, 0.17], 'A', 8);
  H.ell([0.7, 0.04, 0], [0.32, 0.15, 0.13], 'A', { w: 10, h: 6, rot: [0, 0, -0.3] });
  H.ell([0.95, -0.07, 0], [0.13, 0.12, 0.12], 'A', { w: 8, h: 6 });
  H.ell([1.05, -0.09, 0], [0.04, 0.05, 0.08], 'D', { w: 5, h: 4 });
  H.tube([[0.55, -0.08, 0], [0.55, -0.34, 0]], [[0.03, 0.05], 0.015], 'A', 5);
  for (const z of [-1, 1]) { H.tube([[0.42, 0.15, z * 0.08], [0.36, 0.33, z * 0.2]], [0.055, 0.004], 'A', 5); H.ell([0.62, 0.1, z * 0.11], [0.018, 0.018, 0.01], 'K', { w: 4, h: 3 }); }
  const AN = shape();   // a bull's antlers: two palms with tines, on the head's crown
  for (const z of [-1, 1]) {
    AN.tube([[0, 0, z * 0.08], [-0.02, 0.1, z * 0.25]], [0.04, 0.035], 'C', 5);
    AN.ell([-0.05, 0.16, z * 0.48], [0.2, 0.035, 0.26], 'C', { w: 8, h: 4, rot: [z * 0.35, 0, 0] });
    for (let k = 0; k < 5; k++) AN.tube([[-0.18 + k * 0.08, 0.18 + 0.03 * Math.sin(k), z * (0.6 + 0.05 * (k % 2))], [-0.2 + k * 0.08, 0.32, z * (0.72 + 0.04 * (k % 2))]], [0.025, 0.004], 'C', 4, false);
  }
  const L = shape();
  L.tube([[0, 0, 0], [0.03, -0.5, 0], [0, -1.05, 0], [0.03, -1.2, 0]], [0.1, 0.075, 0.05, 0.05], t => t < 0.35 ? 'A' : 'B', 6);
  L.ell([0.05, -1.22, 0], [0.07, 0.035, 0.05], 'D', { w: 5, h: 3 });
  return { torso: T.done(), head: H.done(), antler: AN.done(), leg: L.done() };
}
function deerGeo() {
  const spot = s => { const h = Math.sin(s[0] * 41 + s[2] * 17) * Math.sin(s[1] * 37 + s[0] * 11); return h > 0.55; };
  const T = shape();
  T.ell([0, 0.95, 0], [0.56, 0.24, 0.2], s => s[1] < -0.55 ? 'B' : s[1] > 0.2 && spot(s) ? 'C' : 'A', { w: 12, h: 7 });
  T.ell([0.32, 1.0, 0], [0.26, 0.24, 0.19], 'A', { w: 8, h: 6 });
  T.ell([-0.6, 1.02, 0], [0.05, 0.11, 0.05], s => s[0] < 0 ? 'B' : 'A', { w: 6, h: 4, rot: [0, 0, 0.5] });
  const H = shape();
  H.tube([[0, 0, 0], [0.12, 0.22, 0], [0.18, 0.4, 0]], [0.11, 0.08, 0.065], (t, a) => Math.cos(a) < -0.3 && t > 0.3 ? 'B' : 'A', 6);
  H.ell([0.29, 0.43, 0], [0.16, 0.075, 0.07], 'A', { w: 8, h: 5, rot: [0, 0, -0.45] });
  H.ell([0.43, 0.36, 0], [0.025, 0.025, 0.03], 'D', { w: 4, h: 3 });
  for (const z of [-1, 1]) { H.ell([0.16, 0.53, z * 0.09], [0.04, 0.1, 0.018], 'A', { w: 6, h: 4, rot: [z * 0.6, 0, 0.3] }); H.ell([0.3, 0.46, z * 0.055], [0.012, 0.012, 0.008], 'K', { w: 4, h: 3 }); }
  const AN = shape();
  for (const z of [-1, 1]) {
    AN.tube([[0, 0, z * 0.05], [-0.05, 0.12, z * 0.14], [0.05, 0.22, z * 0.2], [0.2, 0.22, z * 0.14]], [0.022, 0.018, 0.014, 0.006], 'C', 5, false);
    for (let k = 0; k < 3; k++) AN.tube([[0.0 + k * 0.07, 0.2, z * (0.19 - k * 0.02)], [0.0 + k * 0.07, 0.33 - k * 0.03, z * (0.18 - k * 0.02)]], [0.012, 0.003], 'C', 4, false);
  }
  const L = shape(); L.tube([[0, 0, 0], [0.02, -0.4, 0], [0, -0.8, 0]], [0.05, 0.034, 0.024], 'A', 5); L.ell([0.02, -0.82, 0], [0.03, 0.025, 0.022], 'D', { w: 4, h: 3 });
  return { torso: T.done(), head: H.done(), antler: AN.done(), leg: L.done() };
}
function bearGeo() {
  const T = shape();
  T.ell([0, 0.82, 0], [0.7, 0.36, 0.33], 'A', { w: 12, h: 8 }); T.ell([0.32, 0.92, 0], [0.38, 0.34, 0.33], 'A', { w: 8, h: 6 }); T.ell([-0.42, 0.86, 0], [0.34, 0.33, 0.31], 'A', { w: 8, h: 6 });
  const H = shape();
  H.ell([0.13, 0, 0], [0.19, 0.16, 0.16], 'A', { w: 8, h: 6 });
  H.tube([[0.24, -0.03, 0], [0.4, -0.06, 0]], [0.085, 0.055], 'B', 6); H.ell([0.41, -0.05, 0], [0.025, 0.022, 0.03], 'D', { w: 4, h: 3 });
  for (const z of [-1, 1]) { H.ell([0.07, 0.16, z * 0.11], [0.045, 0.055, 0.025], 'A', { w: 5, h: 4 }); H.ell([0.24, 0.05, z * 0.08], [0.012, 0.012, 0.008], 'K', { w: 4, h: 3 }); }
  const L = shape(); L.tube([[0, 0, 0], [0.02, -0.32, 0], [0.04, -0.58, 0]], [0.13, 0.1, 0.085], 'A', 6); L.ell([0.08, -0.6, 0], [0.11, 0.045, 0.08], 'D', { w: 5, h: 3 });
  return { torso: T.done(), head: H.done(), leg: L.done() };
}
// THE ANGLERS: a 14-ft aluminium boat with an outboard; a person seated or standing (shirt, trousers, skin, cap); a rod; the line
const BOAT_C = [col(0x9aa0a4), col(0x5e6468), col(0x3a6a4a), col(0x161616)];
const SHIRTS = [0x8a2a22, 0x5a6a3a, 0x2a4a7a, 0xd86a1a, 0x6a5a4a, 0x3a3a3a], PANTS = [0x3a3a40, 0x4a4a3a, 0x2a3040], HATS = [0x2a3a2a, 0xa08a5a, 0x8a1a1a, 0x1a2a4a];
function boatGeo() {
  const S = shape(), X = [-2.1, -1.2, 0.3, 1.4, 2.12], HW = [0.72, 0.76, 0.74, 0.52, 0.06], G = [0.36, 0.37, 0.4, 0.46, 0.56], BT = [-0.12, -0.15, -0.15, -0.07, 0.24];
  for (let k = 0; k < 4; k++) for (const z of [-1, 1]) {
    const g0 = [X[k], G[k], z * HW[k]], g1 = [X[k + 1], G[k + 1], z * HW[k + 1]], c0 = [X[k], BT[k] + 0.06, z * HW[k] * 0.8], c1 = [X[k + 1], BT[k + 1] + 0.06, z * HW[k + 1] * 0.8], k0 = [X[k], BT[k], 0], k1 = [X[k + 1], BT[k + 1], 0];
    S.quad(g0, g1, c1, c0, 'A', true); S.quad(c0, c1, k1, k0, 'A', true);
    S.quad([X[k], G[k] + 0.02, z * HW[k]], [X[k + 1], G[k + 1] + 0.02, z * HW[k + 1]], [X[k + 1], G[k + 1] + 0.02, z * (HW[k + 1] - 0.05)], [X[k], G[k] + 0.02, z * (HW[k] - 0.05)], 'C', true);
  }
  S.quad([X[0], G[0], -HW[0]], [X[0], G[0], HW[0]], [X[0], BT[0], 0.0], [X[0], BT[0], -0.01], 'A', true);
  S.quad([X[0], 0.02, -0.65], [X[3], 0.02, -0.45], [X[3], 0.02, 0.45], [X[0], 0.02, 0.65], 'B', true);
  for (const x of [-1.55, 0.05, 1.25]) S.box([x, 0.26, 0], [0.32, 0.05, x > 1 ? 0.95 : 1.4], 'B');
  S.box([-2.27, 0.42, 0], [0.32, 0.36, 0.28], 'D'); S.box([-2.25, 0.05, 0], [0.09, 0.5, 0.09], 'D'); S.box([-2.0, 0.45, 0], [0.4, 0.04, 0.04], 'D');
  return S.done();
}
function sitterGeo() {   // seated on a thwart (origin at the seat), facing +x, the hands out in front at (0.36, 0.32)
  const S = shape();
  S.tube([[0, 0.04, 0], [0.02, 0.32, 0], [0.03, 0.56, 0]], [[0.19, 0.12], [0.2, 0.12], [0.17, 0.11]], 'A', 8);
  S.ell([0.03, 0.72, 0], [0.095, 0.11, 0.09], 'C', { w: 8, h: 6 });
  S.ell([0.03, 0.79, 0], [0.11, 0.05, 0.1], 'D', { w: 8, h: 4 }); S.tube([[0.05, 0.79, 0], [0.17, 0.775, 0]], [[0.075, 0.008], [0.06, 0.008]], 'D', 6);
  for (const z of [-1, 1]) {
    S.tube([[0.02, 0.06, z * 0.1], [0.42, 0.1, z * 0.11], [0.46, -0.36, z * 0.12]], [0.075, 0.065, 0.055], 'B', 6);
    S.tube([[0.03, 0.5, z * 0.19], [0.16, 0.34, z * 0.16], [0.36, 0.32, z * 0.04]], [0.05, 0.045, 0.04], 'A', 5);
  }
  return S.done();
}
function standerGeo() {   // standing (origin at the feet), facing +x, the hands out in front at (0.32, 1.12)
  const S = shape();
  for (const z of [-1, 1]) S.tube([[0, 0.02, z * 0.1], [0.02, 0.45, z * 0.1], [0, 0.9, z * 0.1]], [0.07, 0.065, 0.075], 'B', 6);
  S.tube([[0, 0.88, 0], [0.01, 1.15, 0], [0.02, 1.42, 0]], [[0.19, 0.12], [0.2, 0.12], [0.17, 0.11]], 'A', 8);
  S.ell([0.02, 1.58, 0], [0.095, 0.11, 0.09], 'C', { w: 8, h: 6 });
  S.ell([0.02, 1.65, 0], [0.11, 0.05, 0.1], 'D', { w: 8, h: 4 }); S.tube([[0.04, 1.65, 0], [0.16, 1.635, 0]], [[0.075, 0.008], [0.06, 0.008]], 'D', 6);
  for (const z of [-1, 1]) S.tube([[0.02, 1.36, z * 0.19], [0.14, 1.16, z * 0.14], [0.32, 1.12, z * 0.04]], [0.05, 0.045, 0.04], 'A', 5);
  return S.done();
}
function rodGeo() {   // from the hands along +x, 2.1 m, the reel below
  const S = shape(); S.tube([[-0.25, 0, 0], [0.3, 0, 0], [2.1, 0, 0]], [0.016, 0.01, 0.0035], 'A', 5); S.ell([0.05, -0.04, 0], [0.03, 0.03, 0.025], 'B', { w: 5, h: 4 }); return S.done();
}
const ROD_C = [col(0x1a1a1a), col(0x8a8a90)];
function lineGeo() { const S = shape(); S.tube([[0, 0, 0], [1, 0, 0]], [1, 1], 'A', 3, false); return S.done(); }
// THE ICE CAMP: a pop-up shelter, a bucket seat, the holes, five tip-ups (a cross of sticks over a hole, an orange flag on a spring that
// flies up when a fish takes the bait), a sled
const SHACK_C = [[col(0x7a2a22), col(0x2a1a14)], [col(0x2a4a8a), col(0x141a2a)], [col(0x4a5a3a), col(0x1a2014)]];
function shackGeo() { const S = shape(); S.box([0, 0.95, 0], [1.9, 1.9, 1.8], 'A'); S.quad([0.951, 0.05, -0.4], [0.951, 0.05, 0.4], [0.951, 1.6, 0.4], [0.951, 1.6, -0.4], 'B'); S.box([0, 1.92, 0], [2.0, 0.06, 1.9], 'B'); return S.done(); }
function bucketGeo() { const S = shape(); S.tube([[0, 0, 0], [0, 0.42, 0]], [0.13, 0.155], 'A', 10); return S.done(); }
function holeGeo() { const S = shape(); S.ell([0, 0, 0], [0.13, 0.004, 0.13], 'K', { w: 10, h: 3 }); S.ell([0, -0.003, 0], [0.32, 0.006, 0.3], 'B', { w: 10, h: 3 }); return S.done(); }
function tipupGeo() { const S = shape(); S.box([0, 0.02, 0], [0.9, 0.03, 0.04], 'A'); S.box([0, 0.02, 0], [0.04, 0.03, 0.9], 'A'); S.tube([[0.05, 0.03, 0], [0.12, 0.08, 0]], [0.004, 0.003], 'B', 3); return S.done(); }
function flagGeo() { const S = shape(); S.tube([[0, 0, 0], [0, 0.45, 0]], [0.004, 0.003], 'B', 3); S.quad([0, 0.45, 0], [0, 0.31, 0], [0.16, 0.31, 0], [0.16, 0.45, 0], 'A', true); return S.done(); }
const TIP_C = [col(0x8a6a3a), col(0x2a2a2a)], FLAG_C = [col(0xff5a12), col(0x2a2a2a)], BUCKET_C = [[col(0xe8e4dc)], [col(0xd86a1a)]], HOLE_C = [col(0x101418), col(0xdfe6ea)];
function sledGeo() { const S = shape(); S.box([0, 0.12, 0], [1.4, 0.2, 0.6], 'A'); S.box([0.1, 0.32, 0], [0.9, 0.2, 0.45], 'B'); return S.done(); }
const SLED_C = [col(0x2a4a8a), col(0x5a4a3a)];
function snagGeo() {   // a dead pine: a bare grey trunk, unit height, a few broken limbs
  const S = shape(); S.tube([[0, 0, 0], [0.003, 0.5, 0], [0, 1, 0]], [0.009, 0.007, 0.004], 'A', 6);
  for (const [y, a, l] of [[0.45, 0.3, 0.09], [0.58, 2.4, 0.07], [0.7, 4.1, 0.06], [0.82, 1.2, 0.05], [0.9, 5.2, 0.04]]) S.tube([[0, y, 0], [Math.cos(a) * l, y + l * 0.3, Math.sin(a) * l]], [0.003, 0.001], 'B', 4, false);
  return S.done();
}
const SNAG_C = [col(0x8a8478), col(0x6e6a62)];
function branchGeo() { const S = shape(); S.tube([[0, 0, 0], [0.6, 0.1, 0], [1, 0.05, 0]], [1, 0.8, 0.5], 'A', 4); return S.done(); }
const BRANCH_C = [col(0x4a3e32)];

// ---------- the view ----------
// ctx: TREES (main3's trees: x, y, H per store), treeY(T, i) (a tree's base, three's y, at the land height shown), groundY(x, y)
// (the ground or the lake bed, three's y), plants (plantsView: its 1.5-m cells' weed cover), ripple (risesView's rings and splashes)
export function makeWildView(ctx) {
  const group = new THREE.Group(), PARTS = [];
  const pm = (geo, cap, o) => { const p = partMesh(geo, cap, o); PARTS.push(p); group.add(p.mesh); return p; };
  const G = {
    loon: (g => ({ torso: pm(g.torso, 40), head: pm(g.head, 40) }))(loonGeo()),
    cm: (g => ({ torso: pm(g.torso, 60), head: pm(g.head, 60) }))(mergGeo(false)),
    hm: (g => ({ torso: pm(g.torso, 40), head: pm(g.head, 40) }))(mergGeo(true)),
    heron: (g => ({ torso: pm(g.torso, 12), neck: pm(g.neck, 12), leg: pm(g.leg, 24) }))(heronGeo()),
    king: (g => ({ torso: pm(g.torso, 16), head: pm(g.head, 16) }))(kingGeo()),
    osprey: (g => ({ torso: pm(g.torso, 12), head: pm(g.head, 12) }))(ospreyGeo()),
    eagle: (g => ({ torso: pm(g.torso, 12), head: pm(g.head, 12) }))(eagleGeo()),
    otter: (g => ({ torso: pm(g.torso, 24), head: pm(g.head, 24), leg: pm(g.leg, 96) }))(otterGeo()),
    coon: (g => ({ torso: pm(g.torso, 8), head: pm(g.head, 8), leg: pm(g.leg, 32) }))(coonGeo()),
    moose: (g => ({ torso: pm(g.torso, 24), head: pm(g.head, 24), antler: pm(g.antler, 24), leg: pm(g.leg, 96) }))(mooseGeo()),
    deer: (g => ({ torso: pm(g.torso, 40), head: pm(g.head, 40), antler: pm(g.antler, 40), leg: pm(g.leg, 160) }))(deerGeo()),
    bear: (g => ({ torso: pm(g.torso, 16), head: pm(g.head, 16), leg: pm(g.leg, 64) }))(bearGeo()),
  };
  const WINGS = { broad: wingGeos(0.86, 0.36, { wrist: 0.45, top: 'A', under: 'A', hand: 'D', handU: 'D', dih: 0.03 }), crook: wingGeos(0.7, 0.27, { wrist: 0.4, crook: 0.08, fingers: 4, top: 'A', under: 'B', hand: 'A', handU: 'D', dih: 0.1, droop: 0.12 }),
    plank: wingGeos(0.88, 0.34, { wrist: 0.45, fingers: 6, top: 'A', under: 'A', dih: 0.06 }), point: wingGeos(0.26, 0.12, { wrist: 0.35, top: 'A', under: 'B', dih: 0.02 }) };
  const W = Object.fromEntries(Object.entries(WINGS).map(([k, [r, l]]) => [k, [pm(r, 16, { side: THREE.DoubleSide }), pm(l, 16, { side: THREE.DoubleSide })]]));
  const talons = pm(talonGeo(), 24), nest = pm(nestGeo(), 2), prey = pm(preyGeo(), 24), branch = pm(branchGeo(), 16), snag = pm(snagGeo(), 8);
  const boat = pm(boatGeo(), 6, { rough: 0.45, metal: 0.4 }), sitter = pm(sitterGeo(), 16), stander = pm(standerGeo(), 12), rod = pm(rodGeo(), 24), line = pm(lineGeo(), 24, { water: false });
  const shack = pm(shackGeo(), 4), bucket = pm(bucketGeo(), 6), hole = pm(holeGeo(), 32, { water: false }), tipup = pm(tipupGeo(), 24), flag = pm(flagGeo(), 24, { side: THREE.DoubleSide }), sled = pm(sledGeo(), 4);
  // WAKES: a pale V on the water behind a swimming animal or a boat (its strength per copy: 'fade')
  const wake = (() => {
    // (two thin arms from the bow back to unit length at ±19°, fading toward their ends: 'w' 1 at the bow, 0 at the end)
    const g = new THREE.BufferGeometry(), P = [], WT = [];
    for (const z of [-1, 1]) for (let k = 0; k < 6; k++) {
      const u0 = k / 6, u1 = (k + 1) / 6, h0 = 0.008 + 0.025 * u0, h1 = 0.008 + 0.025 * u1, a = [0.05 - u0, 0, z * 0.34 * u0 - h0], b = [0.05 - u1, 0, z * 0.34 * u1 - h1], c = [0.05 - u1, 0, z * 0.34 * u1 + h1], d = [0.05 - u0, 0, z * 0.34 * u0 + h0];
      P.push(...a, ...b, ...c, ...a, ...c, ...d); WT.push(1 - u0, 1 - u1, 1 - u1, 1 - u0, 1 - u1, 1 - u0);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('w', new THREE.Float32BufferAttribute(WT, 1));
    g.setAttribute('fade', new THREE.InstancedBufferAttribute(new Float32Array(64), 1).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.MeshBasicNodeMaterial({ color: 0xe8f0ee, transparent: true, depthWrite: false, side: THREE.DoubleSide }); m.opacityNode = attribute('fade', 'float').mul(attribute('w', 'float').pow(1.5));
    const mesh = new THREE.InstancedMesh(g, m, 64); mesh.count = 0; mesh.frustumCulled = false; mesh.visible = false; mesh.layers.set(2); mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(mesh);
    let n = 0; const F = g.attributes.fade.array, M4 = new THREE.Matrix4(), V3 = new THREE.Vector3();
    return { put(x, y, yaw, L, s) { if (n >= 64 || !(s > 0.02)) return; frame(M4, x, surfY(x, y) + 0.012, -y, yaw, 0, 0, 1); M4.scale(V3.set(L, 1, L)); mesh.setMatrixAt(n, M4); F[n++] = Math.min(0.4, s * 0.5); },
      end() { mesh.count = n; mesh.visible = n > 0; if (n) { mesh.instanceMatrix.needsUpdate = true; g.attributes.fade.needsUpdate = true; } n = 0; } };
  })();

  // ---------- the places ----------
  const lakeHa = (BODIES[0].area + BODIES[1].area) / 1e4, fa = lakeHa / WILD_LAKE_HA, PLC = places();
  const shoreN = [PLC.shore[UPPER].length, PLC.shore[LOWER].length], shoreKm = (shoreN[0] + shoreN[1]) / 4 * GEO.CELL * 0.8 / 1000;
  const areaSh = [BODIES[0].area, BODIES[1].area].map(a => a / (BODIES[0].area + BODIES[1].area)), shoreSh = shoreN.map(n => n / (shoreN[0] + shoreN[1]));
  // THE TREES ON THE BANK (within 12 m of the water; each with the way to its lake's nearest shore): the kingfishers' perches, the
  // ospreys' and the eagles' (the tall ones), the eagles' nest (Upper's tallest pine by the water)
  const KN = WORLD_TRUE ? Math.sqrt(10) : 1;   // (the true lakes' distances off the shore: ~√10 the 1/10 world's)
  const BANK = [[], []];
  for (const kind of ['conifer', 'broad']) {
    const T = ctx.TREES[kind];
    for (let i = 0; i < T.n; i++) {
      const x = T.x[i], y = T.y[i], c = cellIndex(x, y); if (c < 0 || GEO.body[c] !== LAND || GEO.toWater[c] > 12) continue;
      let best = null, bd = 1e18, lk = -1;
      for (const b of BODY) { const S = PLC.shore[b]; for (let o = 0; o < S.length; o += 4) { const d = (S[o] - x) ** 2 + (S[o + 1] - y) ** 2; if (d < bd) { bd = d; best = o; lk = b; } } }
      if (lk < 0) continue; const S = PLC.shore[lk], d = Math.sqrt(bd) || 1;
      BANK[lk - 1].push({ T, i, x, y, H: T.H[i], d, wx: (S[best] - x) / d, wy: (S[best + 1] - y) / d, conifer: kind === 'conifer' });
    }
  }
  for (const B of BANK) B.sort((a, b) => b.H - a.H);
  // (the big birds' trees: the tall conifers by each lake — white pines, spruce — the eagles' nest in one of Upper's five tallest)
  const PINES = BANK.map(B => B.filter(t => t.conifer));
  const nestTree = PINES[0].length ? PINES[0][Math.min(PINES[0].length - 1, (hash(7, 11) * Math.min(5, PINES[0].length)) | 0)] : null;
  // a tree's top (three's y) at f of its height — a big bird sits on the very top, in the open (main3's near-tier white pines, ≥ 21 m,
  // end in a plume a little above their height)
  const treeTop = (t, f = 1.0) => ctx.treeY(t.T, t.i) + t.H * f * (t.conifer && t.H >= 21 && f >= 0.99 ? 1.02 : 1);
  // SNAGS: dead pines at the water's edge standing above the canopy — the ospreys' and eagles' lookouts in the open (a dense shore's
  // living crowns hide a bird on a treetop from the water). Two a lake (by a hash) among its bank trees within 4 m of the water, the
  // first of Upper's within reach of the nest; each a bare grey trunk 2–4 m above the tallest crown within 10 m of it
  const SNAGS = BANK.map((B, lk) => {
    const C = B.filter(t => t.d <= 4 * KN), out = [];
    if (lk === 0 && nestTree) C.sort((a, b) => Math.hypot(a.x - nestTree.x, a.y - nestTree.y) - Math.hypot(b.x - nestTree.x, b.y - nestTree.y));
    for (let k = 0; k < 2 && C.length; k++) {
      const t = lk === 0 && k === 0 ? C[0] : C[(hash(lk * 7 + k, 41) * C.length) | 0], nb = B.filter(u => Math.hypot(u.x - t.x, u.y - t.y) < 10 * KN);
      out.push({ T: t.T, i: t.i, x: t.x + t.wx * 0.8, y: t.y + t.wy * 0.8, wx: t.wx, wy: t.wy, d: t.d, nb, extra: 2 + 2 * hash(lk, k + 43), conifer: true, snag: true });
    }
    return out;
  });
  const snagTop = s => { let top = 0; for (const u of s.nb) top = Math.max(top, ctx.treeY(u.T, u.i) + u.H * (u.conifer ? 1.02 : 1.12)); return top + s.extra; };
  const snagBase = s => ctx.treeY(s.T, s.i);
  const perchTop = t => t.snag ? snagTop(t) : treeTop(t);
  // BASS SPOTS (the anglers' summer water): 1.2–3.5 m deep, 3–20 m (true lakes ×√10) off the shore, weighted to the rocky shores and, on
  // Upper, the brook's mouth (the human: they fish near the stream area of Upper and the shoreline)
  const brookMouth = GEO.NOTES[0] ? GEO.NOTES[0].xy : GEO.BROOK_PATH[0];
  const SPOTS = BODY.map(b => {
    const out = [];
    for (let k = 0; k < 400 && out.length < 40; k++) {
      const p = pickWater(b, 1.2, 3.5, 3 * KN, 20 * KN, 10); if (!p) continue;
      const sp = nearestShore(b, p[0], p[1]), ci = sp ? cellIndex(sp[0] + sp[2] * GEO.CELL, sp[1] + sp[3] * GEO.CELL) : -1;
      const rock = ci >= 0 && GEO.subData ? GEO.subData.rock[cellIndex(sp[0], sp[1])] / 255 : 0, nearB = b === UPPER ? Math.exp(-Math.hypot(p[0] - brookMouth[0], p[1] - brookMouth[1]) / (40 * KN)) : 0;
      out.push([p[0], p[1], 0.3 + rock + 2 * nearB]);
    }
    return out;
  });
  const spotOf = lk => { const S = SPOTS[lk]; if (!S.length) return null; let tot = 0; for (const s of S) tot += s[2]; let u = Math.random() * tot; for (const s of S) { u -= s[2]; if (u <= 0) return s; } return S[0]; };
  // the boats' landings: a shore cell beside camps or a road (NLCD's developed classes), else the shore nearest the outlet / the brook
  const DEV = new Set(['dev_open', 'dev_low', 'dev_med'].map(k => GEO.CLASSES.indexOf(k)));
  const LAND_AT = BODY.map((b, lk) => { const E = PLC.edge[b], c = []; for (let o = 0; o < E.length; o += 4) { const ci = cellIndex(E[o], E[o + 1]); if (ci >= 0 && DEV.has(GEO.cover[ci])) c.push(o); }
    const o = c.length ? c[(hash(lk, 5) * c.length) | 0] : -1; if (o >= 0) return [E[o] + E[o + 2] * GEO.CELL, E[o + 1] + E[o + 3] * GEO.CELL];
    const q = lk === 0 ? brookMouth : GEO.OUTLET, s = nearestShore(b, q[0], q[1]); return s ? [s[0], s[1]] : null; });
  // THE PERCH HOLES (the ice anglers' winter water): over Upper's (and Lower's) deep basin; their tip-ups along the 1–3-m water
  // toward the weedy shore (chain pickerel: WILD3 iceAngler prefers them)
  const deepest = [BODIES[0].deepest, BODIES[1].deepest];

  // ---------- the census ----------
  const simN = (w, yf) => { const d = WILD3[w]; if (!inWin(d.yf, yf)) return 0; return d.perHa ? d.perHa * lakeHa : d.perKm ? d.perKm * shoreKm / GEO.SCALE * fa : d.perLake * fa; };
  // the expected number of w on lake lk now (a group's count for the mergansers); 0 out of its season
  function want(w, lk, S) {
    if (w === 'angler' || w === 'iceAngler') return inWin(WILD3[w].yf, S.yf) ? ANGLERS[w][lk] : 0;
    if (w === 'shore') return inWin(WILD3.angler.yf, S.yf) ? ANGLERS.shore[lk] : 0;
    if (w === 'raccoon') return S.yf > 0.1 && S.yf < 0.72 ? [1, 1][lk] : 0;   // (April–November; denned in the cold months)
    if (!inWin(WILD3[w].yf, S.yf)) return 0;
    if (!WORLD_TRUE) return VIEW10[w][lk];
    const d = WILD3[w], n = simN(w, S.yf) * (d.perKm ? shoreSh[lk] : areaSh[lk]);
    return n / (GROUP[w] || 1);
  }
  const KIDX = Object.fromEntries(['loon', 'heron', 'kingfisher', 'osprey', 'eagle', 'cmerganser', 'hmerganser', 'otter', 'mink', 'raccoon', 'angler', 'iceAngler', 'shore', 'moose'].map((k, i) => [k, i]));
  const OPEN = new Set(['loon', 'heron', 'kingfisher', 'osprey', 'cmerganser', 'hmerganser', 'angler', 'shore']);   // (need the lake open)
  // is slot s of w on lake lk here now (by the day's draw for a fraction; the hour's for the night-active and the anglers)
  function here(w, lk, s, S) {
    const c = want(w, lk, S); if (!(c > 0)) return false;
    const day = S.day, hr = Math.floor(S.time / 3600);
    if (w === 'eagle' && s >= Math.ceil(c)) return lk === 0 && s === Math.ceil(c) && inWin([0.38, 0.8], S.yf) && hash(Math.floor(S.time / (365 * 86400)), 31) < 0.8;   // (the year's fledgling, dark, about Upper)
    if (s >= Math.ceil(c) || (s === Math.floor(c) && hash(day * 13 + KIDX[w], lk * 7 + s) >= c - Math.floor(c))) return false;
    if (OPEN.has(w) && S.ice[lk] > 0.5) return false;
    if (w === 'iceAngler' && S.ice[lk] < 0.9) return false;
    const act = WILD3[w] ? WILD3[w].act[S.li] : 1;
    if (w === 'kingfisher' || w === 'osprey') return S.li < 2;   // (roosting off the lake at night)
    if (w === 'mink' || w === 'otter') return hash(Math.floor(hr / 3) * 5 + KIDX[w], lk * 11 + s) < act * (w === 'otter' ? 0.8 : 1);
    if (w === 'raccoon') return S.li === 2 || (S.li === 1 && S.tod > 0.5);
    if (w === 'angler' || w === 'iceAngler') return hash(day * 3 + hr, lk * 5 + s) < act || (S.li === 0 && s === 0);
    if (w === 'shore') return S.li === 1 || (S.li === 0 && hash(day, 99) < 0.3);
    return true;
  }

  // ---------- the animals ----------
  const AG = new Map();   // key → agent
  let nextId = 1;
  const Mf = new THREE.Matrix4(), Mp = new THREE.Matrix4(), Mq = new THREE.Matrix4(), V3S = new THREE.Vector3();
  const syAt = (x, y) => GEO.bodyAt(x, y) !== LAND ? surfY(x, y) : -1e4;
  const bedY = (x, y) => surfY(x, y) - Math.max(0, GEO.depthAt(x, y));
  const inLake = (x, y, b) => GEO.bodyAt(x, y) === b;
  const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  // on the water toward (tx, ty) at v m/s turning ≤ tr rad/s; false (and no move) where the way ahead is land or shallower than minD
  function swim(a, tx, ty, v, tr, dt, minD = 0.15, maxD = 1e9) {
    const want = Math.atan2(ty - a.y, tx - a.x), d = Math.hypot(tx - a.x, ty - a.y);
    a.yaw += clamp(angD(want, a.yaw), -tr * dt, tr * dt);
    const s = Math.min(v * dt, d), nx = a.x + Math.cos(a.yaw) * s, ny = a.y + Math.sin(a.yaw) * s, dd = GEO.depthAt(nx, ny);
    if (GEO.bodyAt(nx, ny) === LAND || dd < minD || dd > maxD) { a.spd = 0; return false; }
    a.x = nx; a.y = ny; a.spd = s / Math.max(dt, 1e-4); return true;
  }
  // on land (or wading) toward (tx, ty); ok(x, y) says where it may go
  function walk(a, tx, ty, v, tr, dt, ok) {
    const want = Math.atan2(ty - a.y, tx - a.x), d = Math.hypot(tx - a.x, ty - a.y);
    a.yaw += clamp(angD(want, a.yaw), -tr * dt, tr * dt);
    const s = Math.min(v * dt, d), nx = a.x + Math.cos(a.yaw) * s, ny = a.y + Math.sin(a.yaw) * s;
    if (ok && !ok(nx, ny)) { a.spd = 0; return false; }
    a.x = nx; a.y = ny; a.spd = s / Math.max(dt, 1e-4); a.gait += s * (a.stride || 3); return true;
  }
  // through the air toward (tx, ty) at height tY (three's y), v m/s, turning ≤ tr rad/s (banking into the turn), climbing ≤ cl m/s
  function fly(a, tx, ty, tY, v, tr, cl, dt) {
    const want = Math.atan2(ty - a.y, tx - a.x), dy = clamp(angD(want, a.yaw), -tr * dt, tr * dt);
    a.yaw += dy; a.roll += (clamp(-dy / Math.max(dt, 1e-4) * 0.5, -0.6, 0.6) - a.roll) * Math.min(1, 3 * dt);
    a.x += Math.cos(a.yaw) * v * dt; a.y += Math.sin(a.yaw) * v * dt;
    const dY = clamp(tY - a.Y, -cl * dt, cl * dt); a.Y += dY;
    a.pitch += (clamp(Math.atan2(dY / Math.max(dt, 1e-4), v), -0.9, 0.6) - a.pitch) * Math.min(1, 4 * dt); a.spd = v;
    return Math.hypot(tx - a.x, ty - a.y);
  }
  // a hunter's prey near (x, y) on lake b: the sim's fish of w's lengths and depths (WILD3 L, z, b), weighed by its preferences
  const preyOf = (w, b, x, y, R, extra = null) => { const d = WILD3[w]; return preyPick(S0.snap, (px, py, z, L, k, bed) => L > d.L[0] && L < d.L[3] && z <= d.z[1] && bed <= d.b[1] && GEO.bodyAt(px, py) === b && (!extra || extra(px, py, z, L, bed)) && Math.random() < Math.min(1, (d.pref[KEYS3[k]] ?? 1) / 2), x, y, R); };
  const S0 = { snap: null };
  const vis = len => S0.scale <= 1 ? 1 : Math.min(S0.scale, Math.max(1, 0.5 * S0.scale / len));   // (the "fish size" choice: the small ones larger)
  const FLIGHT = { t: 0 };
  const flap = (a, f, amp, on = 1) => on ? amp * Math.sin(FLIGHT.t * f * TAU + a.ph) : -0.06;
  // draw a bird's wings (kind k of WINGS) at its shoulders (sx, sy, ±sz) in frame F: beat b (rad, tip down +), sweep sw (rad, back −)
  function wings(F, k, sx, sy, sz, b, sw, C, sy0) {
    part(Mp, F, sx, sy, sz, b, sw, 0); W[k][0].put(Mp, C, sy0);
    part(Mp, F, sx, sy, -sz, -b, -sw, 0); W[k][1].put(Mp, C, sy0);
  }
  // a fish held (its species k: its colours) at (x, y, z) of frame F, L long (in F's units), turned ang about the vertical (crosswise in
  // a bill: π/2); sy the water's surface there
  const holdPrey = (F, x, y, z, fish, L, ang = 0, sy = -1e4) => { part(Mq, F, x, y, z, 0, ang, 0, L, L, L); prey.put(Mq, PREY_C[fish.k | 0] || PREY_C[0], sy); };
  const TIP = new THREE.Vector3(), LINE_C = [col(0xd8dcd0)];
  const PREY_C = KEYS3.map(k => { const t = new THREE.Color(S3[k].sp.tag); return [t.clone().multiplyScalar(0.55), t.clone().lerp(new THREE.Color(0xe8e8e0), 0.6)]; });

  // ===== THE COMMON LOON: on open water, diving for fish (30–60 s under), resting at night; the chicks from July =====
  const LOON = {
    len: 0.8,
    spawn(a, S) {
      const b = a.body, p = pickWater(b, 1.2, 99, 6 * KN) || pickWater(b, 0.4, 99, 1); if (!p) return false;
      Object.assign(a, { x: p[0], y: p[1], yaw: rnd(0, TAU), mode: 'under', mt: 0, dur: rnd(1, 4), next: rnd(10, 60), dz: 1, C: LOON_C });
      return true;
    },
    dive(a, S) {
      const b = a.body; let g = null;
      if (a.kill) { g = [a.kill[0], a.kill[1]]; a.carry = { L: a.kill[2], k: a.kill[3] }; a.kill = null; }
      else { const f = preyOf('loon', b, a.x, a.y, 35 * KN); g = f ? [f[0], f[1]] : pickWater(b, 1.2, 99, 4, 1e9, 30, [a.x, a.y], 30 * KN); a.carry = f && Math.random() < 0.3 ? { L: f[3], k: 0 } : null; }
      a.dgoal = g || [a.x, a.y]; a.mode = 'dive'; a.mt = 0; ctx.ripple(a.x, a.y, S.t, 0.12, 0.7);
      a.dur = clamp(Math.hypot(a.dgoal[0] - a.x, a.dgoal[1] - a.y) / 1.1, 20, 70);
    },
    step(a, S, dt) {
      const act = WILD3.loon.act[S.li], b = a.body, sY = surfY(a.x, a.y);
      if (a.parent) return this.chick(a, S, dt);
      if (a.mode === 'swim') {
        if (a.leaving) { this.dive(a, S); a.away = true; return; }
        if (!a.goal || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 2) a.goal = pickWater(b, 1.0, 99, 6 * KN, 1e9, 30, [a.x, a.y], 60 * KN) || [a.x + rnd(-5, 5), a.y + rnd(-5, 5)];
        if (!swim(a, a.goal[0], a.goal[1], act > 0 ? 0.32 : 0.04, 0.5, dt, 0.5)) a.goal = null;
        a.Y = sY - 0.03 * a.k; a.pitch *= 0.95; a.head += ((act > 0 ? 0 : 1) - a.head) * Math.min(1, dt);
        a.next -= dt * act;
        if (a.kill || (a.next <= 0 && act > 0)) this.dive(a, S);
        if (a.carry && (a.carryT -= dt) <= 0) a.carry = null;
      } else if (a.mode === 'dive') {   // tipping forward and sliding under
        const f = Math.min(1, a.mt / 0.9); a.pitch = -0.55 * f; a.Y = sY - 0.03 - 0.7 * f * f; swim(a, a.dgoal[0], a.dgoal[1], 0.6, 0.8, dt, 0.3);
        if (f >= 1) { a.mode = 'under'; a.mt = 0; }
      } else if (a.mode === 'under') {   // pursuing under water (true size: seen near, through the water)
        const z = Math.min(2.2, Math.max(0.4, GEO.depthAt(a.x, a.y) - 0.35));
        a.dz += (z - a.dz) * Math.min(1, dt); a.Y = sY - a.dz; a.pitch += (-0.08 - a.pitch) * Math.min(1, 2 * dt);
        if (a.dgoal) swim(a, a.dgoal[0], a.dgoal[1], 1.1, 1.2, dt, 0.35);
        if (a.mt > a.dur) { if (a.away) { a.gone = true; return; } a.mode = 'rise'; a.mt = 0; }
      } else if (a.mode === 'rise') {
        const f = Math.min(1, a.mt / 0.7); a.Y = sY - a.dz * (1 - f) - 0.03 * f; a.pitch = 0.25 * (1 - f);
        if (f >= 1) { a.mode = 'swim'; a.mt = 0; a.next = rnd(30, 110); ctx.ripple(a.x, a.y, S.t, 0.15, 0.85, 0.1 * a.k); if (a.carry) a.carryT = 5; }
      }
    },
    chick(a, S, dt) {   // keeps by its parent; waits while it dives
      const p = AG.get(a.parent); if (!p || p.gone) { a.gone = true; return; }
      a.k = clamp(0.32 + (S.yf - WILD3.loon.chick.yf) / 0.25 * 0.6, 0.32, 0.92); a.C = S.yf > 0.5 ? LOON_JUV : LOON_CHICK;
      const tx = p.mode === 'swim' ? p.x - Math.cos(p.yaw) * 1.2 + a.side * 0.4 : a.x, ty = p.mode === 'swim' ? p.y - Math.sin(p.yaw) * 1.2 : a.y;
      if (Math.hypot(tx - a.x, ty - a.y) > 0.3) swim(a, tx, ty, 0.45, 1.5, dt, 0.2); else a.spd = 0;
      a.Y = surfY(a.x, a.y) - 0.025 * a.k; a.mode = 'swim'; a.head = p.head;
    },
    draw(a, S) {
      const k = a.k * vis(this.len); frame(Mf, a.x, a.Y, -a.y, a.yaw, a.pitch, 0, k);
      G.loon.torso.put(Mf, a.C, a.sy);
      part(Mp, Mf, 0.17, 0.04, 0, 0, 0, -a.head * 1.2 - (a.mode === 'dive' ? 0.3 : 0), 1, 1 - a.head * 0.3, 1); G.loon.head.put(Mp, a.C, a.sy);
      if (a.carry && a.mode === 'swim') holdPrey(Mp, 0.27, 0.15, 0, a.carry, Math.max(0.06, a.carry.L / 100) / k, 1.57, a.sy);
      if (a.mode === 'swim' && a.spd > 0.08) wake.put(a.x, a.y, a.yaw, 0.9 * k, a.spd);
    },
  };
  // ===== THE MERGANSERS: a group along the shore — a pair in spring, a hen and her brood in early summer, the young later — diving =====
  const mergEra = yf => yf < 0.27 ? 0 : yf < 0.45 ? 1 : 2;   // (spring pairs; the broods of June–July; the young and hens after)
  const MERG = hooded => ({
    len: hooded ? 0.45 : 0.62,
    spawn(a, S) {
      const b = a.body, p = pickWater(b, hooded ? 0.3 : 0.5, hooded ? 1.5 : 2.5, 1.5, 10 * KN); if (!p) return false;
      Object.assign(a, { x: p[0], y: p[1], yaw: rnd(0, TAU), mode: 'swim', mt: 0, members: [], era: mergEra(S.yf) });
      // the group by the season: a pair; a hen with her brood (June–July: 5–9 ducklings, growing); four or five in hen's plumage
      const brood = S.yf >= 0.27 && S.yf < 0.45, n = brood ? 1 + 5 + ((hash(S.day >> 4, a.slot) * 5) | 0) : S.yf < 0.27 ? 2 : (hooded ? 4 : 5);
      for (let m = 0; m < n; m++) {
        const duck = brood && m > 0, C = duck ? (hooded ? HM_D : CM_D) : (!brood && S.yf < 0.27 && m === 0) ? (hooded ? HM_M : CM_M) : (hooded ? HM_F : CM_F);
        a.members.push({ x: p[0] + rnd(-2, 2), y: p[1] + rnd(-2, 2), Y: 0, yaw: rnd(0, TAU), pitch: 0, mode: 'under', mt: 0, dur: rnd(0.5, 3), next: rnd(10, 40), dz: 0.5, duck,
          C, k: duck ? clamp(0.35 + (S.yf - 0.27) / 0.18 * 0.45, 0.35, 0.85) : 1, ox: m === 0 ? 0 : -0.8 - 0.55 * m + rnd(-0.3, 0.3), oy: m === 0 ? 0 : rnd(-1, 1) * (duck ? 0.6 : 1.5), ph: Math.random() * 10, head: 0, spd: 0, gait: 0 });
      }
      return true;
    },
    step(a, S, dt) {
      const act = WILD3[hooded ? 'hmerganser' : 'cmerganser'].act[S.li], b = a.body, night = act < 0.1;
      if (a.era !== mergEra(S.yf) && !a.leaving) { a.leaving = true; a.regroup = true; }   // (the season has moved on: this group goes, the season's comes)
      if (!a.goal || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 2) a.goal = night ? pickWater(b, 0.2, 1.0, 0.5, 2.5 * KN, 30, [a.x, a.y], 25 * KN) : pickWater(b, hooded ? 0.3 : 0.5, hooded ? 1.5 : 2.5, 1.5, 9 * KN, 30, [a.x, a.y], 30 * KN);
      if (!a.goal) a.goal = [a.x, a.y];
      if (a.leaving) { a.away = true; }
      if (!swim(a, a.goal[0], a.goal[1], night ? 0.08 : 0.3, 0.6, dt, 0.2)) a.goal = null;
      let alive = 0;
      for (const m of a.members) {
        m.mt += dt; const sY = surfY(m.x, m.y);
        if (m.mode === 'swim') {
          const [ox, oy] = rot2(m.ox * (night ? 0.4 : 1), m.oy * (night ? 0.4 : 1), a.yaw), tx = a.x + ox, ty = a.y + oy, d = Math.hypot(tx - m.x, ty - m.y);
          if (d > 0.15) swim(m, tx, ty, Math.min(0.8, 0.15 + d * 0.5), 2, dt, 0.12); else { m.spd = 0; m.yaw += angD(a.yaw, m.yaw) * Math.min(1, dt); }
          m.Y = sY - 0.02 * m.k; m.pitch *= 0.9; m.head += ((night ? 1 : 0) - m.head) * Math.min(1, dt);
          m.next -= dt * act * (m.duck ? (S.yf > 0.33 ? 0.5 : 0.15) : 1);
          if ((m.next <= 0 && act > 0) || a.away) { m.mode = 'dive'; m.mt = 0; m.dur = a.away ? 1e9 : rnd(10, 25); ctx.ripple(m.x, m.y, S.t, 0.08, 0.6); }
        } else if (m.mode === 'dive') { const f = Math.min(1, m.mt / 0.5); m.pitch = -0.6 * f; m.Y = sY - 0.5 * f * f; swim(m, a.x, a.y, 0.5, 1, dt, 0.25); if (f >= 1) { m.mode = 'under'; m.mt = 0; } }
        else if (m.mode === 'under') {
          m.dz += (Math.min(hooded ? 1.4 : 2.5, Math.max(0.3, GEO.depthAt(m.x, m.y) - 0.25)) - m.dz) * Math.min(1, dt); m.Y = sY - m.dz; m.pitch += (-0.1 - m.pitch) * Math.min(1, 2 * dt);
          swim(m, a.x + rnd(-3, 3), a.y + rnd(-3, 3), 0.8, 1.5, dt, 0.25);
          if (m.mt > m.dur) { m.mode = 'rise'; m.mt = 0; }
        } else if (m.mode === 'rise') { const f = Math.min(1, m.mt / 0.5); m.Y = sY - m.dz * (1 - f); if (f >= 1) { m.mode = 'swim'; m.next = rnd(15, 50); ctx.ripple(m.x, m.y, S.t, 0.1, 0.7, 0.06); } }
        if (m.mode !== 'under' || m.mt < 30) alive++;
      }
      if (a.away && !alive) a.gone = true;
      a.x0 = a.members[0].x; a.y0 = a.members[0].y;
    },
    draw(a, S) {
      const g = hooded ? G.hm : G.cm;
      for (const m of a.members) {
        const k = m.k * vis(this.len), sy = syAt(m.x, m.y); frame(Mf, m.x, m.Y, -m.y, m.yaw, m.pitch, 0, k);
        g.torso.put(Mf, m.C, sy); part(Mp, Mf, hooded ? 0.13 : 0.17, 0.04, 0, 0, 0, -m.head * 1.3, 1, 1 - 0.3 * m.head, 1); g.head.put(Mp, m.C, sy);
        if (m.mode === 'swim' && m.spd > 0.1) wake.put(m.x, m.y, m.yaw, 0.6 * k, m.spd);
      }
    },
    pos(a) { const m = a.members[0]; return m ? [m.x, m.Y, m.y] : null; },
  });
  // ===== THE GREAT BLUE HERON: standing still in the shallows at the weed edge, a slow step, a strike; flying low to another spot =====
  function heronSpot(b, near = null) {
    const f = preyOf('heron', b, near ? near[0] : 0, near ? near[1] : 0, near ? 60 * KN : 1e9);
    for (let k = 0; k < 20; k++) {
      const p = f ? pickWater(b, 0.1, 0.32, 0, 8, 20, [f[0], f[1]], 6) : pickWater(b, 0.1, 0.32, 0, 8 * KN, 20, near, near ? 80 * KN : 1e9); if (!p) continue;
      const ci = cellIndex(p[0], p[1]), cov = ctx.plants && ci >= 0 ? ctx.plants.cover[ci] : 0;
      if (Math.random() < 0.35 + cov) return p;   // (the weed edge preferred)
    }
    return pickWater(b, 0.06, 0.4, 0, 10 * KN) || pickWater(b, 0.05, 1, 0);
  }
  const HERON = {
    len: 1.2,
    spawn(a, S) {
      const sp = heronSpot(a.body); if (!sp) return false; const d = rnd(0, TAU);
      Object.assign(a, { x: sp[0] + Math.cos(d) * 70, y: sp[1] + Math.sin(d) * 70, Y: surfY(sp[0], sp[1]) + 16, yaw: d + Math.PI, mode: 'fly', goal: sp, C: HERON_C, neck: 0, legs: 0, strikeT: rnd(10, 40), stay: rnd(400, 1200), stepT: rnd(4, 12) });
      return true;
    },
    step(a, S, dt) {
      const act = WILD3.heron.act[S.li], b = a.body;
      if (a.leaving && a.mode !== 'fly') { a.mode = 'fly'; a.Y = bedY(a.x, a.y) + 0.9; const d = rnd(0, TAU); a.goal = [a.x + Math.cos(d) * 90, a.y + Math.sin(d) * 90]; a.away = true; }
      if (a.mode === 'fly') {
        const gY = a.away ? surfY(a.x, a.y) + 25 : bedY(a.goal[0], a.goal[1]), d = Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y);
        const cruise = a.away ? gY : d > 10 ? Math.max(gY + 6, surfY(a.x, a.y) + 5) : gY + 0.86 + d * 0.4;
        fly(a, a.goal[0], a.goal[1], cruise, d > 6 ? 5 : Math.max(1.2, d), 1.2, 3, dt); a.flap = d > 12 ? 1 : 0;
        if (a.away && d < 4) { a.gone = true; return; }
        if (!a.away && d < 1) { a.mode = 'stand'; a.mt = 0; a.x = a.goal[0]; a.y = a.goal[1]; a.pitch = 0; a.roll = 0; }
      } else if (a.mode === 'stand' || a.mode === 'walk') {
        a.Y = bedY(a.x, a.y); a.pitch = 0; a.roll = 0;
        if (a.kill && Math.hypot(a.kill[0] - a.x, a.kill[1] - a.y) < 12) { a.wgoal = [a.kill[0] - Math.cos(a.yaw) * 0.6, a.kill[1] - Math.sin(a.yaw) * 0.6]; a.mode = 'walk'; a.strikeT = 0; a.pend = { L: a.kill[2], k: a.kill[3] }; a.kill = null; }
        if (a.mode === 'walk') {
          if (!walk(a, a.wgoal[0], a.wgoal[1], 0.15, 1, dt, (x, y) => GEO.bodyAt(x, y) === b && GEO.depthAt(x, y) < 0.42) || Math.hypot(a.wgoal[0] - a.x, a.wgoal[1] - a.y) < 0.05) { a.mode = 'stand'; a.mt = 0; }
        } else {
          a.spd = 0;
          if ((a.stepT -= dt) <= 0) { a.stepT = rnd(5, 18); const d = a.yaw + rnd(-0.8, 0.8), p = [a.x + Math.cos(d) * rnd(0.3, 1.2), a.y + Math.sin(d) * rnd(0.3, 1.2)]; if (inLake(p[0], p[1], b) && GEO.depthAt(p[0], p[1]) < 0.38) { a.wgoal = p; a.mode = 'walk'; } }
          if ((a.stay -= dt) <= 0) { a.goal = heronSpot(b, [a.x, a.y]) || a.goal; a.mode = 'fly'; a.stay = rnd(400, 1200); a.Y = bedY(a.x, a.y) + 0.9; a.pitch = 0.3; }
        }
        if ((a.strikeT -= dt * Math.max(act, 0.05)) <= 0) { a.mode = 'strike'; a.mt = 0; a.strikeT = rnd(20, 70); a.hit = !!a.pend || Math.random() < 0.4; }
      } else if (a.mode === 'strike') {   // the neck shoots down and forward (0.25 s), holds, comes back up with or without a fish
        const t = a.mt; a.neck = t < 0.25 ? t / 0.25 : t < 0.5 ? 1 : Math.max(0, 1 - (t - 0.5) / 0.9);
        if (t >= 0.25 && !a.splashed) { a.splashed = true; const [hx, hy] = rot2(0.55, 0, a.yaw); ctx.ripple(a.x + hx, a.y + hy, S.t, 0.06, 0.8, 0.07); }
        if (t > 1.4) { a.mode = 'stand'; a.neck = 0; a.splashed = false; if (a.hit) { a.carry = a.pend || { L: rnd(6, 14), k: 0 }; a.carryT = 3.5; } a.pend = null; }
      }
      if (a.carry && a.mode !== 'strike' && (a.carryT -= dt) <= 0) a.carry = null;
    },
    draw(a, S) {
      const k = vis(1.2), C = a.C;
      if (a.mode === 'fly') {   // neck folded back, legs trailing, slow deep beats
        frame(Mf, a.x, a.Y, -a.y, a.yaw, a.pitch, a.roll, k);
        G.heron.torso.put(Mf, C, a.sy);
        part(Mp, Mf, 0.16, 0.03, 0, 0, 0, -0.5, 0.9, 0.55, 0.9); G.heron.neck.put(Mp, C, a.sy);
        for (const z of [-0.05, 0.05]) { part(Mp, Mf, -0.12, -0.03, z, 0, 0, -1.45); G.heron.leg.put(Mp, C, a.sy); }
        wings(Mf, 'broad', 0.02, 0.05, 0.1, flap(a, 2.1, 0.55, a.flap), 0, C, a.sy);
        return;
      }
      frame(Mf, a.x, a.Y, -a.y, a.yaw, 0, 0, k);
      const sw = a.mode === 'walk' ? Math.sin(a.gait * 2) * 0.35 : 0;
      for (const [z, s] of [[-0.06, 1], [0.06, -1]]) { part(Mp, Mf, 0, 0.78, z, 0, 0, sw * s); G.heron.leg.put(Mp, C, a.sy); }
      const tp = 0.45 - a.neck * 0.35; part(Mp, Mf, 0, 0.87, 0, 0, 0, tp); G.heron.torso.put(Mp, C, a.sy);
      const [nx, ny] = rot2(0.17, 0.07, tp);
      part(Mp, Mf, nx, 0.87 + ny, 0, 0, 0, -a.neck * 1.75, 1, 1 - a.neck * 0.1, 1); G.heron.neck.put(Mp, C, a.sy);
      if (a.carry && a.mode !== 'strike') holdPrey(Mp, 0.36, 0.37, 0, a.carry, Math.max(0.06, a.carry.L / 100) / k, 1.57, a.sy);
    },
    pos(a) { return [a.x, a.Y + (a.mode === 'fly' ? 0 : 0.8 * vis(1.2)), a.y]; },
  };
  // ===== THE BELTED KINGFISHER: on a branch over the water, scanning; a rattling flight, a hover, a head-first plunge =====
  // (a hardwood by the water — its lower trunk bare: the perch a dead limb out over the water below the crown, 2.5–3.5 m up; a
  // conifer only where no hardwood is, the limb then past its lower whorls)
  const perchOf = (lk, maxD = 5) => { const near = BANK[lk].filter(t => t.d <= maxD * KN), B = near.filter(t => !t.conifer), C = B.length ? B : near; return C.length ? C[(Math.random() * C.length) | 0] : null; };
  const kPerch = t => { const out = t.conifer ? 0.2 * t.H + 0.4 : Math.min(t.d + 0.7, 3.5), x = t.x + t.wx * out, y = t.y + t.wy * out, base = ctx.treeY(t.T, t.i); return [x, y, Math.min(base + t.H * 0.42, Math.max(base + 1.4, surfY(x, y) + 2.4 + 0.9 * hash(t.i, 3))), base]; };
  const KING = {
    len: 0.33,
    spawn(a, S) {
      const t = perchOf(a.lake); if (!t) return false; a.perch = t; const p = kPerch(t), d = rnd(0, TAU);
      Object.assign(a, { x: p[0] + Math.cos(d) * 35, y: p[1] + Math.sin(d) * 35, Y: p[2] + 2, yaw: d + Math.PI, mode: 'fly', goal: [p[0], p[1], p[2]], C: hash(a.slot, a.lake) < 0.5 ? KF_F : KF_M, huntT: rnd(5, 30), moveT: rnd(200, 600) });
      return true;
    },
    step(a, S, dt) {
      const act = WILD3.kingfisher.act[S.li], b = a.body;
      if (a.leaving && !a.away) { a.away = true; const d = rnd(0, TAU); a.goal = [a.x + Math.cos(d) * 60, a.y + Math.sin(d) * 60, surfY(a.x, a.y) + 4]; a.mode = 'fly'; }
      if (a.mode === 'perch') {
        const p = kPerch(a.perch); a.x = p[0]; a.y = p[1]; a.Y = p[2]; a.pitch = 0; a.roll = 0; a.spd = 0; a.bob = Math.sin(S.t * 3 + a.ph) > 0.92 ? 1 : 0;
        if (a.kill && Math.hypot(a.kill[0] - a.x, a.kill[1] - a.y) < 25 * KN) { a.dp = [a.kill[0], a.kill[1]]; a.hit = true; a.pend = { L: a.kill[2], k: a.kill[3] }; a.kill = null; a.mode = 'fly'; a.goal = [a.dp[0], a.dp[1], surfY(a.dp[0], a.dp[1]) + 5]; a.hover = true; }
        else if ((a.huntT -= dt * act) <= 0) {
          const f = preyOf('kingfisher', b, a.x, a.y, 18 * KN), p = f ? [f[0], f[1]] : pickWater(b, 0.08, 0.6, 0, 1e9, 30, [a.x, a.y], 15 * KN);
          a.huntT = rnd(15, 60); if (p) { a.dp = p; a.hit = !!f && Math.random() < 0.6; a.mode = 'fly'; a.goal = [p[0], p[1], surfY(p[0], p[1]) + rnd(3, 6)]; a.hover = Math.random() < 0.5; }
        } else if ((a.moveT -= dt) <= 0) { a.moveT = rnd(200, 700); const t = perchOf(a.lake); if (t) { a.perch = t; const p = kPerch(t); a.mode = 'fly'; a.goal = [p[0], p[1], p[2]]; a.home = true; } }
      } else if (a.mode === 'fly') {
        const d = fly(a, a.goal[0], a.goal[1], a.goal[2], d0(a) > 3 ? 7 : 2.5, 3, 4, dt); a.flap = 1;
        if (a.away && d < 3) { a.gone = true; return; }
        if (d < 0.4) {
          if (a.dp && Math.hypot(a.dp[0] - a.x, a.dp[1] - a.y) < 1) { a.mode = a.hover ? 'hover' : 'plunge'; a.mt = 0; a.Y0 = a.Y; }
          else { a.mode = 'perch'; a.home = false; a.mt = 0; }
        }
      } else if (a.mode === 'hover') { a.pitch = 0.7; a.spd = 0; if (a.mt > 2) { a.mode = 'plunge'; a.mt = 0; a.Y0 = a.Y; } }
      else if (a.mode === 'plunge') {   // head first, wings swept back
        const sY = surfY(a.x, a.y), f = Math.min(1, a.mt / 0.45); a.pitch = -1.4; a.Y = a.Y0 + (sY - 0.12 - a.Y0) * f * f;
        if (f >= 1) { a.mode = 'emerge'; a.mt = 0; ctx.ripple(a.x, a.y, S.t, 0.06, 0.9, 0.12); }
      } else if (a.mode === 'emerge') {
        const sY = surfY(a.x, a.y); a.pitch = 0.9; a.Y = sY - 0.12 + Math.max(0, a.mt - 0.35) * 3;
        if (a.mt > 1.1) { if (a.hit) { a.carry = a.pend || { L: rnd(4, 9), k: 0 }; a.carryT = 8; } a.pend = null; a.dp = null; const p = kPerch(a.perch); a.mode = 'fly'; a.goal = [p[0], p[1], p[2]]; }
      }
      if (a.carry && a.mode === 'perch' && (a.carryT -= dt) <= 0) a.carry = null;
    },
    draw(a, S) {
      const k = vis(this.len), C = a.C, tp = a.mode === 'perch' ? 0.75 : 0;
      frame(Mf, a.x, a.Y + (a.mode === 'perch' ? 0.06 * k : 0), -a.y, a.yaw, a.mode === 'perch' ? 0 : a.pitch, a.roll, k);
      part(Mp, Mf, 0, 0, 0, 0, 0, tp); G.king.torso.put(Mp, C, a.sy);
      const [hx, hy] = rot2(0.075, 0.035, tp); part(Mp, Mf, hx, hy, 0, 0, 0, -tp * 0.9 - (a.bob ? 0.25 : 0)); G.king.head.put(Mp, C, a.sy);
      if (a.carry) holdPrey(Mp, 0.12, 0.02, 0, a.carry, Math.max(0.04, a.carry.L / 100) / k, 1.57, a.sy);
      if (a.mode !== 'perch') { const plunge = a.mode === 'plunge'; wings(Mf, 'point', 0.02, 0.03, 0.04, plunge ? 0 : flap(a, a.mode === 'hover' ? 11 : 8, 0.8, a.flap), plunge ? -1.0 : 0, C, a.sy); }
      else {   // the branch it sits on, from the trunk out over the water
        const t = a.perch; segment(Mq, t.x, a.Y - 0.02, -t.y, a.x + t.wx * 0.4, a.Y - 0.02, -(a.y + t.wy * 0.4), 0.035); branch.put(Mq, BRANCH_C);
      }
    },
  };
  const d0 = a => a.goal ? Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) : 0;
  // ===== THE OSPREY: circling high over the water, a hover, a feet-first plunge, lifting off heavy with a fish to a tall pine =====
  const tallOf = (lk, n = 30) => { if (SNAGS[lk].length && Math.random() < 0.9) return SNAGS[lk][(Math.random() * SNAGS[lk].length) | 0]; const B = PINES[lk]; if (!B.length) return null; return B[(Math.random() * Math.min(n, B.length)) | 0]; };
  const OSPREY = {
    len: 0.58,
    spawn(a, S) {
      const p = pickWater(a.body, 1, 99, 5 * KN); if (!p) return false; const d = rnd(0, TAU);
      Object.assign(a, { x: p[0] + Math.cos(d) * 120, y: p[1] + Math.sin(d) * 120, Y: surfY(p[0], p[1]) + 45, yaw: d + Math.PI, mode: 'soar', c: p, r: rnd(14, 24) * KN, C: OSP_C, alt: rnd(18, 30), huntT: rnd(30, 120) });
      return true;
    },
    step(a, S, dt) {
      const b = a.body, act = WILD3.osprey.act[S.li];
      if (a.leaving && !a.away) { a.away = true; a.mode = 'leave'; const d = rnd(0, TAU); a.goal = [a.x + Math.cos(d) * 160, a.y + Math.sin(d) * 160]; }
      if (a.mode === 'leave') { if (fly(a, a.goal[0], a.goal[1], surfY(a.x, a.y) + 50, 9, 0.8, 3, dt) < 6) a.gone = true; a.flap = (S.t + a.ph) % 4 < 1.5 ? 1 : 0; return; }
      if (a.mode === 'soar') {
        const ph = Math.atan2(a.y - a.c[1], a.x - a.c[0]) + 0.45, tx = a.c[0] + Math.cos(ph) * a.r, ty = a.c[1] + Math.sin(ph) * a.r;
        fly(a, tx, ty, surfY(a.c[0], a.c[1]) + a.alt, 7, 0.9, 2.5, dt); a.flap = (S.t + a.ph) % 5 < 1.6 ? 1 : 0;
        if (a.kill) { a.c = [a.kill[0], a.kill[1]]; a.tgt = a.c; a.carry0 = { L: a.kill[2], k: a.kill[3] }; a.kill = null; a.mode = 'approach'; }
        else if ((a.huntT -= dt * Math.max(0.05, act)) <= 0) {
          a.huntT = rnd(40, 140); const f = preyOf('osprey', b, a.c[0], a.c[1], 60 * KN);
          if (f) { a.tgt = [f[0], f[1]]; a.carry0 = Math.random() < 0.3 ? { L: f[3], k: 0 } : null; a.mode = 'approach'; }
          else { const p = pickWater(b, 1, 99, 5 * KN); if (p) a.c = p; }
        }
      } else if (a.mode === 'approach') {
        const sY = surfY(a.tgt[0], a.tgt[1]); if (fly(a, a.tgt[0], a.tgt[1], sY + 14, 6, 1.5, 3, dt) < 1.5) { a.mode = 'hover'; a.mt = 0; a.hov = rnd(1.5, 3.5); }
        a.flap = 1;
      } else if (a.mode === 'hover') { a.pitch = 0.5; a.roll *= 0.9; a.spd = 0; a.flap = 1; if (a.mt > a.hov) { a.mode = 'stoop'; a.mt = 0; a.Y0 = a.Y; } }
      else if (a.mode === 'stoop') {   // the plunge: steep, wings half-folded, talons thrown forward at the end
        const sY = surfY(a.x, a.y), f = Math.min(1, a.mt / 1.3); a.pitch = -1.25 + 0.9 * Math.max(0, f - 0.75) * 4; a.Y = a.Y0 + (sY - 0.15 - a.Y0) * f * f; a.flap = 0;
        if (f >= 1) { a.mode = 'splash'; a.mt = 0; ctx.ripple(a.x, a.y, S.t, 0.2, 1, 0.7); }
      } else if (a.mode === 'splash') { a.Y = surfY(a.x, a.y) - 0.05; a.pitch = 0.3; if (a.mt > 1.4) { a.mode = 'lift'; a.mt = 0; a.carry = a.carry0 && Math.random() < 0.9 ? a.carry0 : null; ctx.ripple(a.x, a.y, S.t, 0.3, 0.9, 0.4); } }
      else if (a.mode === 'lift') {
        a.flap = 1; fly(a, a.x + Math.cos(a.yaw) * 20, a.y + Math.sin(a.yaw) * 20, surfY(a.x, a.y) + 10, 4, 0.5, 2, dt);
        if (a.mt > 3) { if (a.carry) { a.perch = tallOf(a.lake); a.mode = a.perch ? 'carry' : 'soar'; } else a.mode = 'soar'; }
      } else if (a.mode === 'carry') {
        const t = a.perch, top = perchTop(t), d = fly(a, t.x, t.y, top + 1, 7, 1.2, 3, dt); a.flap = 1;
        if (d < 0.8) { a.mode = 'perch'; a.mt = 0; a.dur = rnd(90, 400); }
      } else if (a.mode === 'perch') {
        const t = a.perch; a.x = t.x; a.y = t.y; a.Y = perchTop(t); a.pitch = 0; a.roll = 0; a.spd = 0; a.yaw = Math.atan2(t.wy, t.wx);
        if (a.mt > a.dur) { a.carry = null; a.mode = 'soar'; a.c = pickWater(b, 1, 99, 5 * KN) || a.c; a.Y += 0.5; }
      }
    },
    draw(a, S) {
      const k = vis(this.len), C = a.C;
      if (a.mode === 'perch') {
        frame(Mf, a.x, a.Y, -a.y, a.yaw, 0, 0, k); part(Mp, Mf, 0, 0.17, 0, 0, 0, 1.0); G.osprey.torso.put(Mp, C, a.sy);
        part(Mp, Mf, 0.09, 0.36, 0, 0, 0, 0); G.osprey.head.put(Mp, C, a.sy); part(Mp, Mf, 0, 0.1, 0, 0, 0, 0); talons.put(Mp, TALON_C.osprey, a.sy);
        if (a.carry) holdPrey(Mf, 0.05, 0.02, 0, a.carry, Math.max(0.15, a.carry.L / 100) / k, 0, a.sy);
        return;
      }
      frame(Mf, a.x, a.Y, -a.y, a.yaw, a.pitch, a.roll, k); G.osprey.torso.put(Mf, C, a.sy);
      part(Mp, Mf, 0.16, 0.03, 0, 0, 0, -a.pitch * 0.5); G.osprey.head.put(Mp, C, a.sy);
      const stoop = a.mode === 'stoop', feet = a.mode === 'splash' || (stoop && a.mt > 0.9) || a.carry;
      wings(Mf, 'crook', 0.02, 0.04, 0.08, a.mode === 'splash' ? -0.9 : flap(a, a.mode === 'hover' ? 3.2 : 2.4, 0.5, a.flap), stoop ? -0.7 : 0, C, a.sy);
      if (feet) { part(Mp, Mf, 0.0, -0.06, 0, 0, 0, stoop ? 1.2 : -0.6); talons.put(Mp, TALON_C.osprey, a.sy); }
      if (a.carry && a.mode !== 'splash') holdPrey(Mf, -0.02, -0.12, 0, a.carry, Math.max(0.15, a.carry.L / 100) / k, 0, a.sy);   // (an osprey carries its fish head forward)
    },
  };
  // ===== THE BALD EAGLES: the pair on Upper — long hours in a tall pine by their nest, soaring, a swoop to snatch a fish at the surface;
  // the eaglets in the nest from May, a dark young bird from late July; in winter on the ice by the ice-fishing camps =====
  const ePerch = (a, near) => {   // (one of the tall pines by Upper within ~60 m of the nest — not the one its mate sits in)
    const used = new Set(); for (const b of AG.values()) if (b.kind === 'eagle' && b !== a && b.perch) used.add(b.perch);
    const sn = SNAGS[0].filter(t => !used.has(t)); if (sn.length && Math.random() < 0.75) return sn[(Math.random() * sn.length) | 0];   // (a snag by the water, often)
    const B = PINES[0].slice(0, 60).filter(t => (!near || Math.hypot(t.x - near.x, t.y - near.y) < 60 * KN) && !used.has(t)); return B.length ? B[(Math.random() * B.length) | 0] : nestTree; };
  const EAGLE = {
    len: 0.85,
    spawn(a, S) {
      const t = ePerch(a, nestTree); if (!t) return false; a.perch = t;
      Object.assign(a, { x: t.x, y: t.y, Y: perchTop(t), yaw: Math.atan2(t.wy, t.wx), mode: 'perch', mt: 0, dur: rnd(60, 900), C: a.slot >= Math.ceil(want('eagle', a.lake, S)) ? EAGLE_J : EAGLE_C, huntT: rnd(200, 900) });
      return true;
    },
    step(a, S, dt) {
      const act = WILD3.eagle.act[S.li], frozen = S.ice[0] > 0.5 && S.ice[1] > 0.5;
      if (a.leaving && a.mode !== 'leave') { a.mode = 'leave'; const d = rnd(0, TAU); a.goal = [a.x + Math.cos(d) * 200, a.y + Math.sin(d) * 200]; a.Y += 0.5; }   // (the young bird off to find its own lake)
      if (a.mode === 'leave') { if (fly(a, a.goal[0], a.goal[1], surfY(a.x, a.y) + 60, 9, 0.8, 3, dt) < 8) a.gone = true; a.flap = (S.t + a.ph) % 4 < 1.5 ? 1 : 0; return; }
      if (a.mode === 'perch') {
        const t = a.perch; a.x = t.x; a.y = t.y; a.Y = perchTop(t); a.pitch = 0; a.roll = 0; a.spd = 0; a.look = Math.sin(S.t * 0.3 + a.ph) * 0.8;
        if (a.kill) { a.tgt = [a.kill[0], a.kill[1]]; a.carry0 = { L: a.kill[2], k: a.kill[3] }; a.kill = null; a.mode = 'swoop'; a.mt = 0; return; }
        if (a.carry && (a.carryT -= dt) <= 0) a.carry = null;
        if (S.li === 2) return;   // (asleep in the pine)
        if (a.mt > a.dur) {
          a.mt = 0; a.dur = rnd(120, 900); const u = Math.random();
          if (frozen && camps.length && u < 0.4) { const c = camps[(Math.random() * camps.length) | 0]; a.tgt = [c.x + rnd(-8, 8), c.y + rnd(-8, 8)]; a.mode = 'toIce'; }
          else if (!frozen && u < 0.5 * act) { const lk = Math.random() < 0.7 ? 0 : 1, f = preyOf('eagle', BODY[lk], 0, 0, 1e9); if (f) { a.tgt = [f[0], f[1]]; a.carry0 = Math.random() < 0.4 ? { L: f[3], k: 0 } : null; a.mode = 'swoop'; } else a.mode = 'soar'; }
          else if (u < 0.75) { a.mode = 'soar'; a.c = pickWater(BODY[Math.random() < 0.7 ? 0 : 1], 0.5, 99, 0) || [a.x, a.y]; a.dur = rnd(60, 240); }
          else { a.perch = ePerch(a, nestTree); a.mode = 'move'; }
          a.Y += 0.3;
        }
      } else if (a.mode === 'soar') {   // high circles, few beats
        const ph = Math.atan2(a.y - a.c[1], a.x - a.c[0]) + 0.35, R = 40 * KN;
        fly(a, a.c[0] + Math.cos(ph) * R, a.c[1] + Math.sin(ph) * R, 55, 8, 0.6, 2, dt); a.flap = (S.t + a.ph) % 9 < 1.5 ? 1 : 0;
        if (a.mt > a.dur) { a.mode = 'move'; a.mt = 0; a.perch = ePerch(a, nestTree); }
      } else if (a.mode === 'swoop') {   // a long shallow glide down to the fish, talons forward, and up again with it
        const sY = surfY(a.tgt[0], a.tgt[1]), d = Math.hypot(a.tgt[0] - a.x, a.tgt[1] - a.y), tY = d > 40 ? Math.max(sY + 12, a.Y - 0.5) : sY + 0.15 + d * 0.3;
        fly(a, a.tgt[0], a.tgt[1], tY, 10, 1.2, 4, dt); a.flap = d > 50 ? ((S.t + a.ph) % 3 < 1 ? 1 : 0) : 0;
        if (d < 1) { ctx.ripple(a.x, a.y, S.t, 0.25, 1, 0.45); a.carry = a.carry0; a.mode = 'move'; a.mt = 0; a.perch = ePerch(a, nestTree); a.Y += 0.3; }
      } else if (a.mode === 'move') {
        const t = a.perch, d = fly(a, t.x, t.y, perchTop(t) + 1.5, 8, 1, 3, dt); a.flap = 1;
        if (d < 1) { a.mode = 'perch'; a.mt = 0; a.dur = rnd(300, 1500); a.carryT = rnd(60, 240); }
      } else if (a.mode === 'toIce') {
        const g = ctx.groundY(a.tgt[0], a.tgt[1]), d = fly(a, a.tgt[0], a.tgt[1], g + (d0t(a) > 15 ? 12 : 0.2), 8, 1, 3, dt); a.flap = d < 20 ? 1 : 0;
        if (d < 0.6) { a.mode = 'ice'; a.mt = 0; a.dur = rnd(120, 600); a.Y = g; a.pitch = 0; a.roll = 0; }
      } else if (a.mode === 'ice') {   // standing on the ice, scavenging by the camp
        a.Y = ctx.groundY(a.x, a.y) + 0.02; a.spd = 0; a.look = Math.sin(S.t * 0.4 + a.ph) * 0.9;
        if (a.mt > a.dur || !frozen) { a.perch = ePerch(a, nestTree); a.mode = 'move'; a.Y += 0.3; }
      }
    },
    draw(a, S) {
      const k = vis(this.len), C = a.C, sitting = a.mode === 'perch' || a.mode === 'ice';
      if (sitting) {
        frame(Mf, a.x, a.Y, -a.y, a.yaw, 0, 0, k); part(Mp, Mf, -0.02, 0.24, 0, 0, 0, 1.05); G.eagle.torso.put(Mp, C, a.sy);
        part(Mp, Mf, 0.08, 0.5, 0, 0, a.look || 0, 0); G.eagle.head.put(Mp, C, a.sy); part(Mp, Mf, 0, 0.12, 0, 0, 0, 0); talons.put(Mp, TALON_C.eagle, a.sy);
        if (a.carry) holdPrey(Mf, 0.12, 0.03, 0, a.carry, Math.max(0.2, a.carry.L / 100) / k, 0, a.sy);
        return;
      }
      frame(Mf, a.x, a.Y, -a.y, a.yaw, a.pitch, a.roll, k); G.eagle.torso.put(Mf, C, a.sy);
      part(Mp, Mf, 0.24, 0.04, 0, 0, 0, -a.pitch * 0.5); G.eagle.head.put(Mp, C, a.sy);
      wings(Mf, 'plank', 0.03, 0.05, 0.11, flap(a, 1.8, 0.45, a.flap), 0, C, a.sy);
      const near = a.mode === 'swoop' && d0t(a) < 8; if (near || a.carry) { part(Mp, Mf, 0.02, -0.1, 0, 0, 0, near ? 0.9 : -0.5); talons.put(Mp, TALON_C.eagle, a.sy); }
      if (a.carry) holdPrey(Mf, 0.0, -0.2, 0, a.carry, Math.max(0.2, a.carry.L / 100) / k, 0, a.sy);
    },
  };
  const d0t = a => a.tgt ? Math.hypot(a.tgt[0] - a.x, a.tgt[1] - a.y) : 0;
  // ===== THE RIVER OTTER: a family along the shore — porpoising, diving, hauling out on the bank to eat; on the ice in winter =====
  // ===== THE MINK: bounding along the water's edge at night, a short swim, a quick dive in the shallows =====
  const OTTER = mink => ({
    len: mink ? 0.55 : 1.1,
    spawn(a, S) {
      const e = pickShore(a.body, null, 1e9, 40, 'edge'); if (!e) return false;
      Object.assign(a, { x: e[0] - e[2] * 3, y: e[1] - e[3] * 3, yaw: Math.atan2(e[3], e[2]), mode: 'land', goal: [e[0] + e[2] * GEO.CELL, e[1] + e[3] * GEO.CELL], C: mink ? MINK_C : OTTER_C, stride: mink ? 9 : 5, next: rnd(8, 30), pups: [] });
      if (!mink && S.yf > 0.3 && S.yf < 0.85 && hash(S.day >> 5, a.slot + 3) < 0.7) for (let k = 0; k < 1 + (hash(a.slot, 9) < 0.5 ? 1 : 0); k++) a.pups.push({ x: a.x - 0.8 * (k + 1), y: a.y, Y: 0, yaw: a.yaw, pitch: 0, roll: 0, spd: 0, gait: 0, stride: 5, mode: 'land', k: 0.7, ph: Math.random() * 9, sy: -1e4, swimY: 0 });
      return true;
    },
    step(a, S, dt) {
      const b = a.body, act = WILD3[mink ? 'mink' : 'otter'].act[S.li], iced = S.ice[a.lake] > 0.5;
      const onIce = (x, y) => GEO.bodyAt(x, y) === b && GEO.shoreDist(x, y) < 20 * KN;
      if (a.leaving && !a.away) { a.away = true; const e = nearestShore(b, a.x, a.y, 'edge'); a.goal = e ? [e[0] - e[2] * 4, e[1] - e[3] * 4] : [a.x, a.y]; a.mode = 'land'; }
      const sY = surfY(a.x, a.y);
      if (iced && (a.mode === 'swim' || a.mode === 'dive' || a.mode === 'under')) { a.mode = 'land'; a.goal = [a.x, a.y]; }
      if (a.mode === 'land') {   // on the bank (or the ice): running to its goal
        const ok = iced ? (x, y) => GEO.bodyAt(x, y) === LAND || onIce(x, y) : null;
        walk(a, a.goal[0], a.goal[1], mink ? 1.2 : 1.4, 3, dt, ok);
        a.Y = GEO.bodyAt(a.x, a.y) === LAND ? ctx.groundY(a.x, a.y) : iced ? sY + 0.02 : Math.max(bedY(a.x, a.y), sY - 0.04); a.pitch = 0;
        if (Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 0.4) {
          if (a.away) { a.gone = true; return; }
          if (iced) { const p = pickWater(b, 0, 99, 0, 15 * KN, 30, [a.x, a.y], 25 * KN); a.goal = p || [a.x, a.y]; a.mode = 'land'; if (Math.random() < 0.3) { a.mode = 'pause'; a.mt = 0; a.dur = rnd(1.5, 5); } }
          else if (GEO.bodyAt(a.x, a.y) !== LAND) { a.mode = 'swim'; a.goal = null; }
          else { const e = mink ? pickShore(b, [a.x, a.y], 15, 30, 'line') : null; if (e && Math.random() < 0.6) a.goal = [e[0], e[1]]; else { const s = nearestShore(b, a.x, a.y); a.goal = s ? [s[0], s[1]] : [a.x, a.y]; } if (Math.random() < 0.3) { a.mode = 'pause'; a.mt = 0; a.dur = rnd(1.5, 5); } }
        }
      } else if (a.mode === 'pause') { a.spd = 0; if (a.mt > a.dur) a.mode = 'land'; }
      else if (a.mode === 'swim') {   // the head and back awash, porpoising now and then (an otter); a mink only its head
        if (!a.goal || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 1) a.goal = pickWater(b, 0.2, mink ? 1 : 4, 0.5, (mink ? 4 : 12) * KN, 30, [a.x, a.y], (mink ? 10 : 30) * KN) || [a.x, a.y];
        if (!swim(a, a.goal[0], a.goal[1], mink ? 0.4 : 0.7, 1.2, dt, 0.08)) a.goal = null;
        a.Y = sY - (mink ? 0.05 : 0.06) + (mink ? 0 : 0.03 * Math.max(0, Math.sin(S.t * 1.3 + a.ph))); a.pitch = mink ? 0.1 : 0.05 * Math.sin(S.t * 1.3 + a.ph);
        if ((a.next -= dt * Math.max(0.1, act)) <= 0) { a.next = rnd(10, 40); if (Math.random() < 0.25 || a.kill) { const e = nearestShore(b, a.x, a.y, 'line'); if (!a.kill && e) { a.goal = [e[0], e[1]]; a.mode = 'land'; } else this.dive(a, S); } else this.dive(a, S); }
      } else if (a.mode === 'dive') { const f = Math.min(1, a.mt / 0.6); a.pitch = -0.7 * f; a.Y = sY - 0.06 - 0.5 * f; swim(a, a.dg[0], a.dg[1], 0.8, 1.5, dt, 0.15); if (f >= 1) { a.mode = 'under'; a.mt = 0; } }
      else if (a.mode === 'under') {
        a.dz = Math.min(mink ? 0.6 : 2.5, Math.max(0.2, GEO.depthAt(a.x, a.y) - 0.15)); a.Y += (sY - a.dz - a.Y) * Math.min(1, 2 * dt); a.pitch += (-0.05 - a.pitch) * dt;
        swim(a, a.dg[0], a.dg[1], 1.0, 2, dt, 0.15);
        if (a.mt > a.dur) { a.mode = 'swim'; a.mt = 0; ctx.ripple(a.x, a.y, S.t, 0.1, 0.8, 0.08); if (a.hit) { a.carry = a.carry || { L: rnd(8, 20), k: 0 }; a.carryT = 25; const e = nearestShore(b, a.x, a.y, 'line'); if (e) { a.goal = [e[0], e[1]]; a.mode = 'land'; a.eat = true; } } }
      }
      if (a.mode === 'land' && a.eat && Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 0.6) { a.mode = 'eat'; a.mt = 0; a.eat = false; a.dur = rnd(15, 35); }
      if (a.mode === 'eat') { a.spd = 0; a.Y = GEO.bodyAt(a.x, a.y) === LAND ? ctx.groundY(a.x, a.y) : Math.max(bedY(a.x, a.y), sY - 0.04); a.pitch = 0.25; if (a.mt > a.dur) { a.carry = null; const s = nearestShore(b, a.x, a.y); a.goal = s ? [s[0] - s[2] * 2, s[1] - s[3] * 2] : [a.x, a.y]; a.mode = 'land'; } }
      // the pups follow their mother, into the water when she goes in, under when she dives
      for (const [i, p] of a.pups.entries()) {
        const tx = a.x - Math.cos(a.yaw) * 0.9 * (i + 1) + (i ? 0.4 : -0.4) * Math.sin(a.yaw), ty = a.y - Math.sin(a.yaw) * 0.9 * (i + 1);
        const d = Math.hypot(tx - p.x, ty - p.y), v = Math.min(2, 0.2 + d * 1.5), want = Math.atan2(ty - p.y, tx - p.x);
        if (d > 0.15) { p.yaw += clamp(angD(want, p.yaw), -4 * dt, 4 * dt); const s = Math.min(v * dt, d); p.x += Math.cos(p.yaw) * s; p.y += Math.sin(p.yaw) * s; p.spd = s / Math.max(dt, 1e-4); p.gait += s * p.stride; } else p.spd = 0;
        const pl = GEO.bodyAt(p.x, p.y) === LAND, ps = surfY(p.x, p.y); p.mode = pl || iced ? 'land' : a.mode === 'under' || a.mode === 'dive' ? 'under' : 'swim';
        p.Y = pl ? ctx.groundY(p.x, p.y) : iced ? ps + 0.02 : p.mode === 'under' ? ps - Math.min(1.5, Math.max(0.2, GEO.depthAt(p.x, p.y) - 0.15)) : Math.max(bedY(p.x, p.y), ps - 0.05); p.sy = syAt(p.x, p.y); p.pitch = a.pitch;
      }
      if (a.carry && a.mode === 'swim' && (a.carryT -= dt) <= 0) a.carry = null;
    },
    dive(a, S) {
      const b = a.body; let g = null;
      if (a.kill) { g = [a.kill[0], a.kill[1]]; a.carry = { L: a.kill[2], k: a.kill[3] }; a.hit = true; a.kill = null; }
      else { const f = preyOf(mink ? 'mink' : 'otter', b, a.x, a.y, (mink ? 6 : 15) * KN); g = f ? [f[0], f[1]] : pickWater(b, 0.2, mink ? 0.8 : 4, 0, 1e9, 30, [a.x, a.y], (mink ? 5 : 15) * KN); a.hit = !!f && Math.random() < (mink ? 0.3 : 0.45); }
      a.dg = g || [a.x, a.y]; a.mode = 'dive'; a.mt = 0; a.dur = mink ? rnd(4, 10) : rnd(15, 40); ctx.ripple(a.x, a.y, S.t, 0.08, 0.7);
    },
    drawOne(p, S, C, k0) {
      const k = k0 * vis(this.len), swimming = p.mode === 'swim' || p.mode === 'dive' || p.mode === 'under', g = G.otter;
      frame(Mf, p.x, p.Y + (swimming ? 0 : 0.1 * k / (mink ? 2 : 1)), -p.y, p.yaw, p.pitch, 0, k * (mink ? 0.5 : 1));
      const bound = swimming ? 0 : Math.sin(p.gait) * 0.12 * Math.min(1, p.spd);
      part(Mp, Mf, 0, bound * 0.3, 0, 0, 0, bound * 0.5); g.torso.put(Mp, C, p.sy);
      part(Mp, Mf, 0.26, 0.04 + (swimming ? 0.02 : 0), 0, 0, 0, swimming ? 0.15 : (p.mode === 'eat' ? -0.5 : 0)); g.head.put(Mp, C, p.sy);
      if (p.carry && (p.mode === 'eat' || p.mode === 'swim')) holdPrey(Mp, 0.2, -0.01, 0, p.carry, Math.max(0.08, p.carry.L / 100) / (k * (mink ? 0.5 : 1)), 1.4, p.sy);
      if (!swimming) for (const [i, [x, z]] of [[0.17, -0.06], [0.17, 0.06], [-0.24, -0.06], [-0.24, 0.06]].entries()) { part(Mp, Mf, x, -0.03, z, 0, 0, Math.sin(p.gait + (i < 2 ? 0 : Math.PI)) * 0.6 * Math.min(1, p.spd)); g.leg.put(Mp, C, p.sy); }
      if (p.mode === 'swim' && p.spd > 0.1) wake.put(p.x, p.y, p.yaw, (mink ? 0.4 : 0.9) * k, p.spd);
    },
    draw(a, S) { this.drawOne(a, S, a.C, 1); for (const p of a.pups) this.drawOne(p, S, a.C, p.k); },
  });
  // ===== THE RACCOON (not in the sim): at night wading the edge's shallows, feeling for crayfish and frogs with its hands =====
  const COON = {
    len: 0.85,
    spawn(a, S) { const e = pickShore(a.body, null, 1e9, 40, 'edge'); if (!e) return false; Object.assign(a, { x: e[0] - e[2] * 4, y: e[1] - e[3] * 4, yaw: Math.atan2(e[3], e[2]), mode: 'walk', goal: [e[0] + e[2] * 1.2, e[1] + e[3] * 1.2], C: COON_C, stride: 7 }); return true; },
    step(a, S, dt) {
      const b = a.body, ok = (x, y) => GEO.bodyAt(x, y) === LAND || GEO.depthAt(x, y) < 0.14;
      if (a.leaving && !a.away) { a.away = true; const e = nearestShore(b, a.x, a.y, 'edge'); a.goal = e ? [e[0] - e[2] * 5, e[1] - e[3] * 5] : [a.x, a.y]; }
      if (!walk(a, a.goal[0], a.goal[1], a.away ? 0.8 : 0.3, 2, dt, ok) || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 0.3) {
        if (a.away) { a.gone = true; return; }
        a.pause = rnd(2, 8); const p = pickWater(b, 0.01, 0.12, 0, 3, 30, [a.x, a.y], 10) || [a.x, a.y]; a.goal = p;
      }
      if (a.pause > 0) { a.pause -= dt; a.spd = 0; }
      a.Y = GEO.bodyAt(a.x, a.y) === LAND ? ctx.groundY(a.x, a.y) : bedY(a.x, a.y); a.dab = GEO.bodyAt(a.x, a.y) !== LAND;
    },
    draw(a, S) {
      const k = vis(this.len), C = a.C, g = G.coon; frame(Mf, a.x, a.Y + 0.2 * k, -a.y, a.yaw, a.dab ? -0.15 : 0, 0, k);
      g.torso.put(Mf, C, a.sy); part(Mp, Mf, 0.24, 0.02, 0, 0, 0, a.dab ? -0.5 + 0.1 * Math.sin(S.t * 3) : 0); g.head.put(Mp, C, a.sy);
      for (const [i, [x, z]] of [[0.15, -0.08], [0.15, 0.08], [-0.17, -0.08], [-0.17, 0.08]].entries()) { part(Mp, Mf, x, -0.02, z, 0, 0, Math.sin(a.gait + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.5 * Math.min(1, a.spd * 3) + (a.dab && i < 2 ? 0.5 + 0.3 * Math.sin(S.t * 5 + i) : 0)); g.leg.put(Mp, C, a.sy); }
    },
  };
  // ===== MOOSE, DEER, BEARS: four-legged, posed by what they are doing =====
  // Q: its parts; legs: the hips [x, y, z] (front left, front right, hind left, hind right); hp: the neck's base; hz: the head's angle
  function drawQuad(Q, F, C, sy, legs, hp, hz, gait, sa, antler = 0, legY = 1, lie = 0) {
    part(Mp, F, 0, -lie, 0); Q.torso.put(Mp, C, sy);
    part(Mp, F, hp[0], hp[1] - lie, 0, 0, 0, hz); Q.head.put(Mp, C, sy);
    if (antler > 0 && Q.antler) { const ah = Q === G.moose ? [0.62, 0.15] : [0.25, 0.5]; part(Mq, Mp, ah[0], ah[1], 0, 0, 0, Q === G.deer ? -0.35 : 0, antler, antler, antler); Q.antler.put(Mq, C, sy); }
    for (let i = 0; i < 4; i++) { const [x, y, z] = legs[i], ph = gait + (i === 0 || i === 3 ? 0 : Math.PI); part(Mp, F, x, y - lie, z, 0, 0, lie ? (i < 2 ? -1.4 : 1.4) : Math.sin(ph) * sa, 1, lie ? 0.55 : legY, 1); Q.leg.put(Mp, C, sy); }
  }
  const BIG = {
    moose: { Q: () => G.moose, len: 2.8, legs: [[0.6, 1.22, -0.2], [0.6, 1.22, 0.2], [-0.62, 1.22, -0.2], [-0.62, 1.22, 0.2]], hp: [0.82, 1.6], stride: 0.9, v: 0.5 },
    deer: { Q: () => G.deer, len: 1.8, legs: [[0.42, 0.82, -0.11], [0.42, 0.82, 0.11], [-0.42, 0.82, -0.11], [-0.42, 0.82, 0.11]], hp: [0.5, 1.05], stride: 1.6, v: 1.0 },
    bear: { Q: () => G.bear, len: 1.6, legs: [[0.4, 0.62, -0.18], [0.4, 0.62, 0.18], [-0.45, 0.62, -0.18], [-0.45, 0.62, 0.18]], hp: [0.62, 0.95], stride: 1.3, v: 0.9 },
  };
  // a moose's antlers by the date (a bull's: growing in velvet from April, full from late August, cast in December–January), a deer's
  // (a buck's: September – December)
  const antlerOf = (kind, yf) => kind === 'moose' ? (yf > 0.07 && yf < 0.83 ? clamp((yf - 0.07) / 0.4, 0.15, 1) : 0) : kind === 'deer' ? (yf > 0.4 && yf < 0.8 ? clamp((yf - 0.35) / 0.2, 0.3, 1) : 0) : 0;
  function drawBig(a, S) {
    const B = BIG[a.kind], k = a.k * vis(B.len), wade = GEO.bodyAt(a.x, a.y) !== LAND;
    const C = a.kind === 'moose' ? (a.young ? MOOSE_CALF : MOOSE_C) : a.kind === 'deer' ? (a.young && S.yf > 0.25 && S.yf < 0.5 ? FAWN : S.yf > 0.6 || S.yf < 0.15 ? DEER_W : DEER_S) : BEAR_C;
    frame(Mf, a.x, a.Y, -a.y, a.yaw, 0, 0, k);
    const act = a.act, down = act === 'graze' || act === 'drink' || act === 'fish' ? 1 : 0, up = act === 'browse' ? 1 : 0;
    let hz = -0.15 - down * (a.kind === 'moose' ? 1.25 : 1.1) + up * 0.45 + (a.dip || 0) * -1.2;
    if (a.kind === 'bear') hz = -0.1 - down * 0.8;
    const lie = act === 'bed' ? B.legs[0][1] * 0.75 : 0;
    drawQuad(B.Q(), Mf, C, a.sy, B.legs, B.hp, hz, a.gait, Math.min(0.5, a.spd * 0.6), a.bull ? antlerOf(a.kind, S.yf) : 0, 1, lie);
    if (wade && a.spd > 0.1) wake.put(a.x, a.y, a.yaw, 1.2 * k, a.spd * 0.5);
  }
  // THE MOOSE OF THE SHALLOWS (plants3 PL3.MOOSE: 15 moose use the lakes' weedy shallows June – mid-July… September, belly-deep at most
  // 1.2 m): while the forest model is off, a cow (a calf at her side some days) or a bull wades out from the woods at dawn and dusk and
  // feeds — the head under the water for half a minute, up to chew — then walks to another bed, and back into the trees
  const MOOSE = {
    len: 2.8,
    spawn(a, S) {
      const e = pickShore(a.body, null, 1e9, 40, 'edge'); if (!e) return false;
      a.bull = hash(S.day >> 3, a.lake + 1) < 0.35; a.young = false;
      Object.assign(a, { kind: 'moose', x: e[0] - e[2] * 8, y: e[1] - e[3] * 8, yaw: Math.atan2(e[3], e[2]), mode: 'walk', k: 1, stride: 0.9, act: 'walk', calf: null, dip: 0, dipping: false });
      a.goal = this.bed(a) || [e[0], e[1]];
      if (!a.bull && S.yf > 0.27 && S.yf < 0.6 && hash(S.day >> 2, a.lake + 7) < 0.6) a.calf = { kind: 'moose', young: true, x: a.x - 3, y: a.y, Y: 0, yaw: a.yaw, spd: 0, gait: 0, stride: 1.4, k: 0.6, act: 'walk', sy: -1e4 };
      return true;
    },
    bed(a) {   // a weedy bed 0.35–1.1 m deep (the moose's water, PL3.MOOSE_Z)
      for (let k = 0; k < 25; k++) { const p = pickWater(a.body, 0.35, Math.min(1.1, PL3.MOOSE_Z[0]), 1, 25 * KN, 10, [a.x, a.y], 60 * KN); if (!p) continue; const ci = cellIndex(p[0], p[1]); if (!ctx.plants || Math.random() < 0.2 + 2 * (ctx.plants.cover[ci] || 0)) return p; }
      return null;
    },
    step(a, S, dt) {
      const ok = (x, y) => GEO.bodyAt(x, y) === LAND || GEO.depthAt(x, y) < 1.3;
      if (a.leaving && !a.away) { a.away = true; const e = nearestShore(a.body, a.x, a.y, 'edge'); a.goal = e ? [e[0] - e[2] * 10, e[1] - e[3] * 10] : [a.x, a.y]; a.mode = 'walk'; }
      if (a.mode === 'walk') {
        a.act = 'walk'; a.dip = 0;
        if (!walk(a, a.goal[0], a.goal[1], GEO.bodyAt(a.x, a.y) === LAND ? 0.9 : 0.45, 0.6, dt, ok) || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 0.5) {
          if (a.away) { a.gone = true; return; }
          a.mode = 'feed'; a.mt = 0; a.dur = rnd(240, 900); a.dipT = 0;
        }
      } else if (a.mode === 'feed') {   // head under for 10–30 s, up for 8–20 (chewing)
        a.spd = 0; a.act = 'wade'; a.dipT -= dt;
        if (a.dipT <= 0) { a.dipping = !a.dipping; a.dipT = a.dipping ? rnd(10, 30) : rnd(8, 20); if (a.dipping) { const [hx, hy] = rot2(1.6, 0, a.yaw); ctx.ripple(a.x + hx, a.y + hy, S.t, 0.3, 0.9, 0.25); } }
        a.dip += ((a.dipping ? 1 : 0) - a.dip) * Math.min(1, 1.5 * dt);
        if (a.mt > a.dur) { a.goal = this.bed(a) || a.goal; a.mode = 'walk'; }
      }
      a.Y = GEO.bodyAt(a.x, a.y) === LAND ? ctx.groundY(a.x, a.y) : bedY(a.x, a.y);
      const c = a.calf; if (c) {
        const tx = a.x - Math.cos(a.yaw) * 2.5 + Math.sin(a.yaw) * 1.2, ty = a.y - Math.sin(a.yaw) * 2.5 - Math.cos(a.yaw) * 1.2, d = Math.hypot(tx - c.x, ty - c.y);
        if (d > 0.3) walk(c, tx, ty, Math.min(1.5, 0.2 + d * 0.5), 1.5, dt, ok); else c.spd = 0;
        c.Y = GEO.bodyAt(c.x, c.y) === LAND ? ctx.groundY(c.x, c.y) : bedY(c.x, c.y); c.sy = syAt(c.x, c.y); c.act = a.mode === 'feed' && hash(Math.floor(S.t / 20), 3) < 0.4 ? 'drink' : 'walk';
      }
    },
    draw(a, S) { drawBig(a, S); if (a.calf) drawBig(a.calf, S); },
    pos(a) { return [a.x, a.Y + 1.4 * vis(2.8), a.y]; },
  };
  // ===== THE ANGLERS IN A BOAT: out from the landing to a bass spot, casting toward the shore, a fish on now and then (the smallmouth let go
  // — catch-and-release by law — a white perch or a pickerel kept), on to another spot, home at dark =====
  const ANG = {
    len: 4.2,
    spawn(a, S) {
      const L0 = LAND_AT[a.lake], sp = spotOf(a.lake); if (!L0 || !sp) return false;
      const s = nearestShore(a.body, L0[0], L0[1]); const st = s ? [s[0] - s[2] * 2, s[1] - s[3] * 2] : L0;
      const two = hash(S.day, a.lake * 3 + a.slot) < 0.45;
      a.crew = [0, two ? 1 : -1].filter(v => v >= 0).map(i => ({ seat: i ? 1.0 : -1.3, face: i ? 0.6 : -0.9, C: [col(SHIRTS[(hash(S.day + i, a.slot) * SHIRTS.length) | 0]), col(PANTS[(hash(i, S.day) * PANTS.length) | 0]), col(0xc89a7a), col(HATS[(hash(S.day, i + 7) * HATS.length) | 0])], cast: rnd(0, 20), phase: 'wait', end: null, fight: 0, ph: Math.random() * 9 }));
      Object.assign(a, { x: st[0], y: st[1], yaw: rnd(0, TAU), mode: 'motor', goal: [sp[0], sp[1]], home: st, stay: rnd(600, 2000) });
      return true;
    },
    step(a, S, dt) {
      const b = a.body;
      if (a.leaving && !a.away) { a.away = true; a.mode = 'motor'; a.goal = a.home; }
      if (a.mode === 'motor') {
        if (!swim(a, a.goal[0], a.goal[1], 2.6, 0.5, dt, 0.25) || Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 1.5) {
          if (a.away) { a.gone = true; return; }
          a.mode = 'fish'; a.mt = 0; const s = nearestShore(b, a.x, a.y); a.toShore = s ? Math.atan2(s[1] - a.y, s[0] - a.x) : a.yaw;
        }
        for (const c of a.crew) { c.phase = 'wait'; c.end = null; }
      } else if (a.mode === 'fish') {   // drifting a little; the boat swings side-on to the shore
        a.yaw += clamp(angD(a.toShore + Math.PI / 2, a.yaw), -0.05 * dt, 0.05 * dt); swim(a, a.x + Math.cos(a.toShore + Math.PI / 2) * 5, a.y + Math.sin(a.toShore + Math.PI / 2) * 5, 0.04, 0, dt, 0.5); a.spd = 0;
        for (const c of a.crew) this.angler(a, c, S, dt);
        if (a.mt > a.stay && a.crew.every(c => c.phase !== 'fight')) { const sp = spotOf(a.lake); if (sp) { a.goal = [sp[0], sp[1]]; a.mode = 'motor'; a.stay = rnd(600, 2400); } }
      }
      a.Y = surfY(a.x, a.y);
    },
    angler(a, c, S, dt) {   // a cast every half-minute or so toward the shore: back, forward, the lure out 10–18 m, reeled in
      c.cast -= dt; const [sx, sy] = rot2(c.seat, 0, a.yaw);
      if (a.kill && c === a.crew[0]) { c.phase = 'fight'; c.fight = rnd(8, 18); c.fishL = a.kill[2]; c.fishK = a.kill[3]; a.kill = null; if (!c.end) c.end = [a.x + Math.cos(a.toShore) * 8, a.y + Math.sin(a.toShore) * 8, 1]; }
      if (c.phase === 'wait' && c.cast <= 0) { c.phase = 'cast'; c.t = 0; const ang = a.toShore + rnd(-0.6, 0.6), R = rnd(10, 18) * Math.min(1, KN); c.to = [a.x + sx + Math.cos(ang) * R, a.y + sy + Math.sin(ang) * R]; c.faceTo = ang; }
      c.t = (c.t || 0) + dt;
      if (c.phase === 'cast') { if (c.t > 1.1) { c.phase = 'out'; c.t = 0; c.end = [c.to[0], c.to[1], 0]; } }
      else if (c.phase === 'out') { if (c.t > 1) { c.phase = 'reel'; c.t = 0; ctx.ripple(c.to[0], c.to[1], S.t, 0.03, 0.6); c.end[2] = 1; } }
      else if (c.phase === 'reel') {   // the lure comes back to the boat over ~12 s; a strike now and then (cosmetic) — or a fish the sim gave the anglers
        const tx = a.x + sx, ty = a.y + sy, f = Math.min(1, dt / Math.max(0.5, 12 - c.t)); c.end[0] += (tx - c.end[0]) * f; c.end[1] += (ty - c.end[1]) * f;
        if (c.t > 12 || Math.hypot(tx - c.end[0], ty - c.end[1]) < 1) { c.phase = 'wait'; c.cast = rnd(6, 25); c.end = null; }
        else if (Math.random() < dt / 600) { c.phase = 'fight'; c.fight = rnd(6, 15); c.fishL = rnd(20, 38); c.fishK = KEYS3.indexOf('bass'); }
      } else if (c.phase === 'fight') {   // the rod bent, the fish thrashing at the line's end, brought to the boat
        c.fight -= dt; const tx = a.x + sx, ty = a.y + sy; c.end[0] += (tx - c.end[0]) * Math.min(1, dt * 0.25) + rnd(-0.3, 0.3) * dt * 4; c.end[1] += (ty - c.end[1]) * Math.min(1, dt * 0.25) + rnd(-0.3, 0.3) * dt * 4;
        if (Math.random() < dt * 1.5) ctx.ripple(c.end[0], c.end[1], S.t, 0.05, 0.9, Math.random() < 0.3 ? 0.12 : 0);
        if (c.fight <= 0) { c.phase = 'land'; c.t = 0; c.end = null; }
      } else if (c.phase === 'land') { if (c.t > 4) { c.phase = 'wait'; c.cast = rnd(10, 30); if (KEYS3[c.fishK] === 'bass' || Math.random() < 0.5) ctx.ripple(a.x + sx + Math.cos(a.yaw + Math.PI / 2) * 0.9, a.y + sy + Math.sin(a.yaw + Math.PI / 2) * 0.9, S.t, 0.05, 0.8, 0.1); } }
    },
    draw(a, S) {
      frame(Mf, a.x, a.Y, -a.y, a.yaw, a.mode === 'motor' ? 0.06 : 0, 0, 1); boat.put(Mf, BOAT_C, -1e4);
      if (a.mode === 'motor') wake.put(a.x, a.y, a.yaw, 5, 1.2);
      for (const c of a.crew) {
        const face = a.mode === 'fish' && c.faceTo !== undefined ? angD(c.faceTo, a.yaw) : 0;
        part(Mp, Mf, c.seat, 0.3, 0, 0, face, 0); sitter.put(Mp, c.C, -1e4);
        // the rod: held out ahead; back over the shoulder in the cast, forward as it goes; bent up in a fight
        let rz = 0.35, ry = 0; if (c.phase === 'cast') rz = c.t < 0.6 ? 0.35 + c.t / 0.6 * 1.2 : 1.55 - (c.t - 0.6) / 0.5 * 1.45; else if (c.phase === 'fight') rz = 0.9 + 0.1 * Math.sin(S.t * 7); else if (c.phase === 'reel') rz = 0.25 + 0.05 * Math.sin(S.t * 2 + c.ph);
        part(Mq, Mp, 0.36, 0.32, 0, 0, ry, rz); rod.put(Mq, ROD_C, -1e4);
        const tip = TIP.set(2.1, 0, 0).applyMatrix4(Mq);
        if (c.end && (c.phase === 'reel' || c.phase === 'fight' || c.phase === 'out')) {
          let ex = c.end[0], ey = c.end[1], eY = surfY(ex, ey); if (c.phase === 'out') { const f = Math.min(1, c.t); ex = tip.x + (ex - tip.x) * f; ey = -tip.z + (ey + tip.z) * f; eY = tip.y + (eY - tip.y) * f + Math.sin(f * Math.PI) * 2; }
          segment(Mq, tip.x, tip.y, tip.z, ex, eY, -ey, 0.004); line.put(Mq, LINE_C);
        }
        if (c.phase === 'land') { part(Mq, Mp, 0.45, 0.6, 0, 0, 0, 0.3); holdPrey(Mq, 0.1, 0, 0, { k: c.fishK }, Math.max(0.15, (c.fishL || 25) / 100), 1.57); }
      }
    },
    pos(a) { return [a.x, a.Y + 1, a.y]; },
  };
  // ===== THE ANGLER ON THE BANK at the brook's upper mouth (the human's pool): standing, casting into the pool =====
  const SHORE = {
    len: 1.7,
    spawn(a, S) {
      const p = brookMouth, e = nearestShore(UPPER, p[0], p[1], 'edge'); if (!e) return false;
      Object.assign(a, { x: e[0] - e[2] * 0.6, y: e[1] - e[3] * 0.6, yaw: Math.atan2(e[3], e[2]), mode: 'fish', C: [col(SHIRTS[(hash(S.day, 41) * SHIRTS.length) | 0]), col(PANTS[0]), col(0xc89a7a), col(HATS[1])], crew: [{ seat: 0, cast: rnd(0, 10), phase: 'wait', end: null, ph: 0 }], toShore: Math.atan2(e[3], e[2]) });
      return true;
    },
    step(a, S, dt) { if (a.leaving) { a.gone = true; return; } a.Y = ctx.groundY(a.x, a.y); for (const c of a.crew) ANG.angler(a, c, S, dt); },
    draw(a, S) {
      const c = a.crew[0], face = c.faceTo !== undefined ? c.faceTo : a.yaw; frame(Mf, a.x, a.Y, -a.y, face, 0, 0, 1); stander.put(Mf, a.C, -1e4);
      let rz = 0.5; if (c.phase === 'cast') rz = c.t < 0.6 ? 0.5 + c.t / 0.6 * 1.1 : 1.6 - (c.t - 0.6) / 0.5 * 1.3; else if (c.phase === 'fight') rz = 1.0 + 0.1 * Math.sin(S.t * 7);
      part(Mq, Mf, 0.32, 1.12, 0, 0, 0, rz); rod.put(Mq, ROD_C, -1e4);
      const tip = TIP.set(2.1, 0, 0).applyMatrix4(Mq);
      if (c.end && (c.phase === 'reel' || c.phase === 'fight')) { segment(Mp, tip.x, tip.y, tip.z, c.end[0], surfY(c.end[0], c.end[1]), -c.end[1], 0.004); line.put(Mp, LINE_C); }
    },
    pos(a) { return [a.x, a.Y + 1.5, a.y]; },
  };
  // ===== THE ICE CAMP: over the perch holes in the deep basin, five tip-ups along the weed edge for pickerel; a jigger on a bucket, a
  // shelter, a sled; a flag flies up — the angler hurries over and pulls the fish through =====
  const camps = [];
  const ICE = {
    len: 2,
    spawn(a, S) {
      const d = deepest[a.lake], c = pickWater(a.body, a.slot ? 2 : 3, 99, 6 * KN, 1e9, 40, d, (a.slot ? 60 : 25) * KN) || pickWater(a.body, 1.5, 99, 4); if (!c) return false;
      const tips = []; for (let k = 0; k < 5; k++) { const p = pickWater(a.body, 0.8, 3, 2, 1e9, 30, c, 30 * KN); if (p) tips.push({ x: p[0], y: p[1], up: 0, flag: 0 }); }
      const sh = nearestShore(a.body, c[0], c[1]) || [c[0], c[1]];
      Object.assign(a, { x: sh[0], y: sh[1], yaw: Math.atan2(c[1] - sh[1], c[0] - sh[0]), cx: c[0], cy: c[1], tips, mode: 'walk', goal: [c[0] - 0.7, c[1] + 0.1], shack: hash(S.day >> 2, a.lake * 3 + a.slot) < 0.6 ? (hash(a.slot, 77) * SHACK_C.length) | 0 : -1,
        C: [col(SHIRTS[(hash(S.day, a.slot + 51) * SHIRTS.length) | 0]), col(PANTS[(hash(S.day, 3) * PANTS.length) | 0]), col(0xc89a7a), col(HATS[(hash(S.day, 13) * HATS.length) | 0])], bucketC: BUCKET_C[(hash(a.slot, 9) * 2) | 0], stride: 3, flagT: rnd(600, 2400) });
      camps.push(a); return true;
    },
    step(a, S, dt) {
      if (a.leaving && !a.away) { a.away = true; const sh = nearestShore(a.body, a.x, a.y); a.goal = sh ? [sh[0] + sh[2] * 3, sh[1] + sh[3] * 3] : [a.x, a.y]; a.mode = 'walk'; }
      if (a.kill) { const t = a.tips.find(t => !t.up) || a.tips[0]; if (t) t.up = 1; a.kill = null; }
      if ((a.flagT -= dt * WILD3.iceAngler.act[S.li]) <= 0) { a.flagT = rnd(900, 3600); const t = a.tips[(Math.random() * a.tips.length) | 0]; if (t) t.up = 1; }
      for (const t of a.tips) t.flag += ((t.up ? 1 : 0) - t.flag) * Math.min(1, dt * 6);
      if (a.mode === 'walk') {
        walk(a, a.goal[0], a.goal[1], 1.1, 3, dt, null);
        if (Math.hypot(a.goal[0] - a.x, a.goal[1] - a.y) < 0.3) {
          if (a.away) { a.gone = true; camps.splice(camps.indexOf(a), 1); return; }
          if (a.pull) { a.mode = 'pull'; a.mt = 0; a.dur = rnd(10, 20); } else { a.mode = 'jig'; a.mt = 0; a.yaw = Math.atan2(a.cy - a.y, a.cx - a.x); }
        }
      } else if (a.mode === 'jig') { a.spd = 0; const t = a.tips.find(t => t.up > 0); if (t) { a.pull = t; a.goal = [t.x - 0.6, t.y]; a.mode = 'walk'; } }
      else if (a.mode === 'pull') { a.spd = 0; a.yaw = Math.atan2(a.pull.y - a.y, a.pull.x - a.x); if (a.mt > a.dur) { a.pull.up = 0; a.mode = 'walk'; a.pull = null; a.goal = [a.cx - 0.7, a.cy + 0.1]; a.fish = 4; } }
      if (a.fish > 0) a.fish -= dt;
      a.Y = surfY(a.x, a.y) + 0.03;
    },
    draw(a, S) {
      const iceY = x => surfY(x[0], x[1]) + 0.02;
      {   // (the camp: its holes, tip-ups, bucket, shelter and sled)
        for (const t of [{ x: a.cx, y: a.cy }, ...a.tips]) { frame(Mf, t.x, iceY([t.x, t.y]), -t.y, 0, 0, 0, 1); hole.put(Mf, HOLE_C, -1e4); }
        for (const t of a.tips) { frame(Mf, t.x, iceY([t.x, t.y]), -t.y, 0.4, 0, 0, 1); tipup.put(Mf, TIP_C, -1e4); part(Mp, Mf, 0.12, 0.08, 0, 0, 0, -1.5 * (1 - t.flag)); flag.put(Mp, FLAG_C, -1e4); }
        const cY = iceY([a.cx, a.cy]); frame(Mf, a.cx - 0.7, cY, -(a.cy + 0.1), 0, 0, 0, 1); bucket.put(Mf, a.bucketC, -1e4);
        if (a.shack >= 0) { frame(Mf, a.cx - 2.6, cY, -(a.cy - 1.4), 0.3, 0, 0, 1); shack.put(Mf, SHACK_C[a.shack], -1e4); }
        frame(Mf, a.cx + 1.6, cY, -(a.cy + 1.8), 1.2, 0, 0, 1); sled.put(Mf, SLED_C, -1e4);
      }
      if (a.mode === 'jig') {   // on the bucket by the hole, the short rod jigging
        frame(Mf, a.cx - 0.7, iceY([a.cx, a.cy]) + 0.1, -(a.cy + 0.1), Math.atan2(-0.1, 0.7), 0, 0, 1); part(Mp, Mf, 0, 0.32, 0, 0, 0, 0); sitter.put(Mp, a.C, -1e4);
        part(Mq, Mp, 0.36, 0.32, 0, 0, 0, -0.15 + 0.15 * Math.max(0, Math.sin(S.t * 3 + a.ph)), 0.4, 1, 1); rod.put(Mq, ROD_C, -1e4);
      } else {
        frame(Mf, a.x, a.Y, -a.y, a.yaw, 0, 0, 1);
        if (a.mode === 'pull') { part(Mp, Mf, 0, -0.45, 0, 0, 0, 0.35); stander.put(Mp, a.C, -1e4); } else { part(Mp, Mf, 0, 0.03 * Math.abs(Math.sin(a.gait * 0.5)), 0); stander.put(Mp, a.C, -1e4); }
        if (a.fish > 0) holdPrey(Mf, 0.4, 1.0, 0.1, { k: KEYS3.indexOf('pike') }, 0.45, 1.3);
      }
    },
    pos(a) { return [a.cx, surfY(a.cx, a.cy) + 1, a.cy]; },
  };
  const BEH = { loon: LOON, cmerganser: MERG(false), hmerganser: MERG(true), heron: HERON, kingfisher: KING, osprey: OSPREY, eagle: EAGLE, otter: OTTER(false), mink: OTTER(true), raccoon: COON, angler: ANG, shore: SHORE, iceAngler: ICE, moose: MOOSE };
  const SLOTS = { loon: 4, heron: 3, kingfisher: 6, osprey: 3, eagle: 3, cmerganser: 3, hmerganser: 2, otter: 2, mink: 4, raccoon: 1, angler: 2, iceAngler: 2, shore: 1, moose: 2 };

  // the census each second: who should be here; the newcomers arrive, the others leave in their own way
  let censusAt = -1e9, fNest = 0;
  function census(S) {
    const keep = new Set();
    const forest = !!S.forest;
    for (const w of Object.keys(BEH)) {
      if (w === 'moose') { if (forest || !PL3.MOOSE || !inWin(PL3.MOOSE_YF, S.yf) || S.ice[0] > 0.5) continue; }
      else if ((WILD3[w] || w === 'shore') && !F3.WILD) continue;   // (the base model: no wildlife or anglers in the sim)
      for (let lk = 0; lk < 2; lk++) {
        let n = w === 'moose' ? (WORLD_TRUE ? PL3.MOOSE_N * 0.2 * areaSh[lk] : [0.8, 0.5][lk]) : 0;
        const slots = WORLD_TRUE ? Math.ceil(w === 'moose' ? n : Math.max(want(w, lk, S), 0)) + 1 : SLOTS[w];
        for (let s = 0; s < Math.min(slots, 40); s++) {
          let ok;
          if (w === 'moose') { const act = [0.5, 1, 0.3][S.li]; ok = (s < Math.floor(n) || (s === Math.floor(n) && hash(S.day * 13 + 99, lk * 7 + s) < n - Math.floor(n))) && hash(Math.floor(S.time / 14400), lk * 3 + s) < act; }   // (a visit: four hours at a time)
          else ok = here(w, lk, s, S);
          if (!ok) continue;
          const key = w + '|' + lk + '|' + s; keep.add(key);
          let a = AG.get(key);
          if (a && a.leaving && !a.gone && !a.regroup) { a.leaving = false; a.away = false; if (a.members) for (const m of a.members) if (m.dur > 1e8) m.dur = m.mt + rnd(3, 10); }   // (wanted again: back it comes)
          if (!a) {
            a = { key, kind: w, lake: lk, body: BODY[lk], slot: s, id: nextId++, x: 0, y: 0, Y: 0, yaw: 0, pitch: 0, roll: 0, spd: 0, gait: 0, stride: 3, mode: '', mt: 0, k: 1, head: 0, neck: 0, ph: Math.random() * 10, sy: -1e4 };
            if (!BEH[w].spawn(a, S)) continue;
            AG.set(key, a);
          }
          // the pair's chick from July (WILD3 loon chick: 0.6 a pair — by the year's draw), by its parent
          if (w === 'loon' && s === 0 && !a.leaving && S.yf >= WILD3.loon.chick.yf && hash(Math.floor(S.time / (365 * 86400)), lk * 5 + 1) < WILD3.loon.chick.perPair) {
            const ck = 'loonchick|' + lk; keep.add(ck);
            if (!AG.get(ck)) AG.set(ck, { key: ck, kind: 'loon', lake: lk, body: BODY[lk], slot: 9, id: nextId++, x: a.x - 1, y: a.y, Y: 0, yaw: a.yaw, pitch: 0, roll: 0, spd: 0, gait: 0, mode: 'swim', mt: 0, k: 0.4, head: 0, ph: 0, sy: -1e4, parent: key, side: 1, C: LOON_CHICK });
          }
        }
      }
    }
    for (const [key, a] of AG) if (!keep.has(key) && !a.forest) {
      if (a.parent && !AG.has(a.parent)) a.gone = true;
      if (OPEN.has(a.kind) && S.ice[a.lake] > 0.5 && a.kind !== 'heron' && a.kind !== 'kingfisher' && a.kind !== 'osprey') { AG.delete(key); continue; }   // (the lake froze under it: no way off but gone)
      a.leaving = true;
    }
    // the eaglets: in the nest from the hatch (WILD3 eagle chick yf, ~May) to fledging in mid-July (yf ~0.38); 1.2 a pair
    fNest = F3.WILD && inWin([WILD3.eagle.chick.yf, 0.38], S.yf) ? (hash(Math.floor(S.time / (365 * 86400)), 31) < 0.2 ? 2 : 1) : 0;
  }
  // THE FOREST MODEL'S ANIMALS (env.forest): each where the forest keeps it, eased between its updates, posed by what it is doing
  function forestStep(S, dt) {
    const F = S.forest, seen = new Set();
    if (F) for (let o = 0; o + 7 < F.length; o += 8) {
      const id = F[o], kind = FOREST_KIND[F[o + 1]], act = FOREST_ACT[F[o + 5]] || 'walk'; if (!kind || act === 'den') continue;
      const key = 'forest|' + id; seen.add(key); let a = AG.get(key);
      if (!a) { a = { key, forest: true, kind, x: F[o + 2], y: F[o + 3], Y: 0, yaw: F[o + 4], pitch: 0, roll: 0, spd: 0, gait: 0, stride: BIG[kind].stride, k: 1, sy: -1e4, ph: Math.random() * 9, bull: hash(id, 3) < 0.5 }; AG.set(key, a); }
      a.tx = F[o + 2]; a.ty = F[o + 3]; a.th = F[o + 4]; a.act = act; a.young = F[o + 6] > 0; a.k = F[o + 7] > 0 ? F[o + 7] / BIG[kind].len : a.young ? 0.55 : 1;
    }
    for (const [key, a] of AG) {
      if (!a.forest) continue;
      if (!seen.has(key)) { AG.delete(key); continue; }
      const d = Math.hypot(a.tx - a.x, a.ty - a.y);
      if (d > 50) { a.x = a.tx; a.y = a.ty; a.spd = 0; }
      else if (d > 0.05) { const v = Math.min(BIG[a.kind].v * 4, d * 1.5 + 0.2), s = Math.min(v * dt, d); a.yaw += clamp(angD(Math.atan2(a.ty - a.y, a.tx - a.x), a.yaw), -2 * dt, 2 * dt); a.x += (a.tx - a.x) / d * s; a.y += (a.ty - a.y) / d * s; a.spd = s / Math.max(dt, 1e-4); a.gait += s * a.stride; }
      else { a.spd = 0; a.yaw += clamp(angD(a.th, a.yaw), -dt, dt); }
      a.Y = GEO.bodyAt(a.x, a.y) === LAND ? ctx.groundY(a.x, a.y) : bedY(a.x, a.y); a.sy = syAt(a.x, a.y);
      if (a.kind === 'moose' && a.act === 'wade') a.dip = Math.max(0, Math.sin(S.t * 0.15 + a.ph)) > 0.5 ? 1 : 0;
    }
  }
  // the sim's kills (fish3 wildEv) to the nearest of their taker on that lake (WILDK order: the WILD3 rows)
  const WKEYS = Object.keys(WILD3);
  function onKill(ev) {
    for (let o = 0; o + 5 < ev.length; o += 6) {
      const x = ev[o], y = ev[o + 1], w = WKEYS[ev[o + 3]], L = ev[o + 4], k = ev[o + 5], b = GEO.bodyAt(x, y);
      if (w === 'snapper' || w === 'bullfrog') { if (ctx.onHerpKill) ctx.onHerpKill(w, x, y, L, k); continue; }
      let best = null, bd = 1e18;
      for (const a of AG.values()) { if (a.kind !== w || a.leaving || a.parent) continue; const ax = a.members ? a.members[0].x : a.x, ay = a.members ? a.members[0].y : a.y, d = (ax - x) ** 2 + (ay - y) ** 2 + (a.body === b ? 0 : 1e6); if (d < bd) { bd = d; best = a; } }
      if (best) best.kill = [x, y, L, k];
      else if (w !== 'angler' && w !== 'iceAngler') ctx.ripple(x, y, performance.now() / 1000, 0.1, 0.5);
    }
  }

  // ---------- each frame ----------
  let lastT = -1;
  function update(t, snap, scale, cam) {
    const dt = lastT < 0 ? 0 : Math.min(0.1, Math.max(0, t - lastT)); lastT = t; FLIGHT.t = t;
    if (!snap) return;
    // (a jump through the year — the Jump-to buttons, a restored run: the lakes' animals are another season's; they are founded afresh)
    if (S0.time !== undefined && Math.abs(snap.time - S0.time) > 2 * 86400) { AG.clear(); camps.length = 0; censusAt = -1e9; }
    S0.time = snap.time; S0.snap = snap; S0.scale = scale;
    const sun = snap.sun, li = sun > 0.3 ? 0 : sun > 0.02 ? 1 : 2;
    const S = { t, dt, snap, yf: snap.yf, tod: snap.t, li, time: snap.time, day: Math.floor(snap.time / 86400), ice: iceShare(snap), forest: snap.forest };
    if (t - censusAt > 1) { censusAt = t; census(S); }
    forestStep(S, dt);
    for (const [key, a] of AG) {
      if (a.forest) continue;
      a.mt += dt; BEH[a.kind].step(a, S, dt);
      if (a.gone) { AG.delete(key); continue; }
      a.sy = syAt(a.x, a.y);
    }
    // draw
    for (const p of PARTS) p.n = 0;
    for (const a of AG.values()) { if (a.forest) drawBig(a, S); else BEH[a.kind].draw(a, S); }
    if (F3.WILD) for (const L of SNAGS) for (const sg of L) { const b0 = snagBase(sg) - 0.3, H = snagTop(sg) - b0; frame(Mf, sg.x, b0, -sg.y, hash(sg.i, 5) * 6.28, 0, 0, 1); Mf.scale(V3S.set(H, H, H)); snag.put(Mf, SNAG_C); }
    if (fNest && nestTree) {   // the nest and its eaglets
      const top = treeTop(nestTree, 0.86), k = vis(1.6); frame(Mf, nestTree.x, top, -nestTree.y, 0, 0, 0, k); nest.put(Mf, NEST_C);
      for (let i = 0; i < fNest; i++) { frame(Mp, nestTree.x + (i - 0.5) * 0.4 * k, top + 0.15 * k, -nestTree.y, i * 2 + Math.sin(t * 0.5 + i) * 0.4, 0.6, 0, 0.55 * vis(0.6)); G.eagle.torso.put(Mp, EAGLET); part(Mq, Mp, 0.1, 0.25, 0, 0, 0, -0.6); G.eagle.head.put(Mq, EAGLET); }
    } else if (nestTree && F3.WILD) { const top = treeTop(nestTree, 0.86); frame(Mf, nestTree.x, top, -nestTree.y, 0, 0, 0, vis(1.6)); nest.put(Mf, NEST_C); }
    for (const p of PARTS) p.end();
    wake.end();
  }
  // the ice on each lake (the share of its columns iced — main3's snapshot carries the ice per column), every couple of seconds
  let iceAt = -1e9, iceS = [0, 0];
  function iceShare(snap) {
    const now = performance.now(); if (now - iceAt < 2000 || !snap.ice || !ctx.colAt) return iceS; iceAt = now;
    const n = [0, 0], c = [0, 0];
    for (let lk = 0; lk < 2; lk++) { const W = PLC.water[BODY[lk]]; for (let q = 0; q < W.length; q += 7) { const [x, y] = GEO.cellCentre(W[q]), col = ctx.colAt(x, y); if (col < 0) continue; n[lk]++; if (snap.ice[col] > 0.5) c[lk]++; } }
    iceS = [n[0] ? c[0] / n[0] : 0, n[1] ? c[1] / n[1] : 0]; return iceS;
  }
  // what is on show (for "Find an animal"): each animal's kind, name, and where it is now (three-space), its size
  function list() {
    const out = [];
    for (const a of AG.values()) {
      if (a.parent) continue; const B = BEH[a.kind], p = B && B.pos ? B.pos(a) : a.forest ? [a.x, a.Y + 0.8 * a.k, a.y] : [a.x, a.Y, a.y]; if (!p) continue;
      // (hidden: a forest animal deep in the woods, under the crowns — Find skips it; at the water's edge, drinking, wading or fishing it is seen)
      const hidden = !!a.forest && GEO.shoreDist(a.x, a.y) < -6 && a.act !== 'drink' && a.act !== 'wade' && a.act !== 'fish';
      out.push({ kind: a.kind, name: NAMES[a.kind] || a.kind, key: a.key, hidden, perched: a.mode === 'perch', flying: !a.forest && !a.members && a.mode !== 'perch' && a.Y - surfY(a.x, a.y) > 2.5, at: () => { const q = AG.get(a.key); if (!q) return null; const r = BEH[q.kind] && BEH[q.kind].pos ? BEH[q.kind].pos(q) : q.forest ? [q.x, q.Y + 0.8 * q.k, q.y] : [q.x, q.Y, q.y]; return r ? [r[0], r[1], -r[2]] : null; }, size: a.forest ? BIG[a.kind].len : (B ? B.len : 1), x: p[0], y: p[2] });
    }
    return out;
  }
  function clear() { AG.clear(); camps.length = 0; for (const p of PARTS) { p.n = 0; p.end(); } wake.end(); }
  return { group, update, onKill, list, clear, stats: () => { const c = {}; for (const a of AG.values()) c[a.kind] = (c[a.kind] || 0) + (a.members ? a.members.length : 1) + (a.pups ? a.pups.length : 0); return c; } };
}
