// camps3view.js — the people's places at the Hot Brook lakes on screen (browser layer): the camps, houses, trailers and sheds with
// their decks and lit windows, the docks and the boats tied at them, the roads, the boat launch and the beaches — from the verified
// dataset (src/w3/camps3.js: CAMPS, the docks' season docksIn, the camps' occupancy; docs/research_notes/Maine lake shores and
// catchment/camps_roads_docks_hot_brook.md). True size, low-poly, as the trees and the animals are.
// - THE LAYOUT (pure, at load: the world's metres, x east, y north) — each building's boxes from its footprint (w × l turned rot° counter-
//   clockwise from north — the footprint polygons' edges run at −rot), its deck on the water side, its windows and door; the docks from
//   their waterline out; the roads resampled inside the far land; the launch's lot; the beaches' strips along their waterline. And the
//   CLEARED GROUND (clearedAt): the footprints (+2 m, a home's yard +3), the road corridors (half the width + 1 m), the paths to the
//   water, the beaches and the launch — main3 asks it of every tree and shrub it places (a grid of 16-m tiles: a lookup, not a scan).
// - THE 1/10 WORLD (?world=small): its shores are a tenth of the real length and the buildings true size, so each building is moved in
//   from the water until it stands on dry land (its deck too) and drawn only if it overlaps none already placed (homes first); its
//   docks, whose lengths the data scales by a tenth, are not drawn (nor the boats at them).
// - THE VIEW: a few instanced parts (render3/wild3kit.js partMesh — each instance its colours) placed once, and again only when the land's
//   height, the season, the docks' being in or out change; the boats bob each frame (a few dozen matrices). Lights by night in the camps
//   lived in that day (occupied) — warm windows and a soft glow, a porch or a dock light at some — until bedtime. The roads, the lot and
//   the beaches are draped over the ground (sampled every ~3 m, lifted and drawn a little toward the eye so they never fight it).
// Cosmetic: hashes and Math.random, never core.rand; it reads the sim's snapshot only (its date, sun and clock).
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { GEO, LAND, WORLD_TRUE, cellIndex } from '../geometry.js';
import { CAMPS, docksIn, occupied } from '../camps3.js';
import { shape, partMesh, hash, BASE, surfY, nearestShore } from './wild3kit.js';
import { waterOut } from './water3.js';
const { FAR3 } = WORLD_TRUE ? await import('../true/far3d.js') : await import('./far3d.js');
const { attribute, uniform, vec3, float, length, smoothstep, cameraPosition, positionGeometry, positionWorld, uv } = THREE.TSL;

const SMALL = !WORLD_TRUE, D2R = Math.PI / 180, TAU = Math.PI * 2;
const FX0 = FAR3.X0, FY0 = FAR3.Y0, FX1 = FX0 + FAR3.NX * FAR3.CELL, FY1 = FY0 + FAR3.NY * FAR3.CELL;
const inFar = (x, y, m = 0) => x > FX0 + m && x < FX1 - m && y > FY0 + m && y < FY1 - m;
const inBand = (x, y) => x > GEO.X0 && x < GEO.XMAX && y > GEO.Y0 && y < GEO.YMAX;
const isWet = (x, y) => GEO.bodyAt(x, y) !== LAND;
const norm2 = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// ---------- oriented boxes (a: CCW from east of the box's u axis; hw along u, hl along v = u turned 90° CCW) ----------
const obb = (cx, cy, a, hw, hl) => ({ cx, cy, a, ux: Math.cos(a), uy: Math.sin(a), hw, hl });
function corners(o, m = 0) {
  const { cx, cy, ux, uy } = o, vx = -uy, vy = ux, w = o.hw + m, l = o.hl + m;
  return [[cx + ux * w + vx * l, cy + uy * w + vy * l], [cx - ux * w + vx * l, cy - uy * w + vy * l], [cx - ux * w - vx * l, cy - uy * w - vy * l], [cx + ux * w - vx * l, cy + uy * w - vy * l]];
}
function obbHit(A, B, m = 0) {   // (separating axes)
  for (const [ax, ay] of [[A.ux, A.uy], [-A.uy, A.ux], [B.ux, B.uy], [-B.uy, B.ux]]) {
    const rA = A.hw * Math.abs(ax * A.ux + ay * A.uy) + A.hl * Math.abs(-ax * A.uy + ay * A.ux), rB = B.hw * Math.abs(ax * B.ux + ay * B.uy) + B.hl * Math.abs(-ax * B.uy + ay * B.ux);
    if (Math.abs((B.cx - A.cx) * ax + (B.cy - A.cy) * ay) > rA + rB + m) return false;
  }
  return true;
}
// a box's four walls: [normal x, y, centre x, y, tangent x, y, half length] — 0 +u, 1 −u, 2 +v, 3 −v
function walls(o) {
  const { cx, cy, ux, uy, hw, hl } = o, vx = -uy, vy = ux;
  return [[ux, uy, cx + ux * hw, cy + uy * hw, vx, vy, hl], [-ux, -uy, cx - ux * hw, cy - uy * hw, vx, vy, hl], [vx, vy, cx + vx * hl, cy + vy * hl, ux, uy, hw], [-vx, -vy, cx - vx * hl, cy - vy * hl, ux, uy, hw]];
}
const segD2 = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy, t = L2 > 0 ? clamp(((px - ax) * vx + (py - ay) * vy) / L2, 0, 1) : 0, dx = px - ax - t * vx, dy = py - ay - t * vy; return dx * dx + dy * dy; };

// ---------- the buildings ----------
// kind → how it is drawn: a camp (one storey, gable roof; 'camp (large)', 'cabin', 'camp/RV site', 'camp/barn'), a house or the lodge
// (1½–2 storeys), a trailer (one, or two for 'trailers'), a camp with a trailer beside it, a garage, a shed
const TYPE = k => k.includes('lodge') || k.includes('house') ? 'house' : k === 'garage' ? 'garage' : k === 'outbuilding' ? 'shed' : k.includes('+ trailer') ? 'camptr' : k.includes('trailer') ? 'trailer' : 'camp';
// the colours: the roofs' as the photos show them (steel and asphalt), the walls' a Maine camp's stains and paints
const ROOFC = { teal: 0x3f7a76, grey: 0x7a7e82, red: 0x8a3226, dark: 0x3a3c40, white: 0xdcdedb, light: 0xaeaca4, green: 0x3e623e, maroon: 0x5c2428 };
const WALLC = {
  camp: [0x6b4a30, 0x7c5a3a, 0x5c6450, 0x8a8880, 0xd8d4c8, 0x4a5a44, 0x8a6a48, 0x6e5a44],
  house: [0xdcd8cc, 0xb8b2a2, 0x6e7a84, 0x8a8880, 0x7c5a3a, 0xc4b48c, 0x5c6450],
  shed: [0x6b4a30, 0x8a8880, 0x7a2e24, 0x5c6450, 0x7c5a3a],
  trailer: [0xe8e4d6, 0xdcd6c2, 0xf0eee6, 0xd0ccc0],
};
const DARKWALL = new Set([0x6b4a30, 0x7c5a3a, 0x8a6a48, 0x6e5a44, 0x4a5a44]);
function building(c, ci) {
  const h = s => hash(ci * 7 + 3, s), type = TYPE(c.kind), k = c.kind;
  const B = { ci, c, type, a: c.rot * D2R, cx: c.xy[0], cy: c.xy[1], home: !!c.home, lake: c.lake, h, units: [], deck: null, body: null, storeys: 1, flat: false };
  // (the lodge — U20, its use unknown to the human — a storey and a half under a tall gable: drawn as two, its 19-m walls strung with two
  // rows of windows read as an apartment block)
  if (type === 'house') { B.storeys = k.includes('lodge') ? 1.5 : h(1) < 0.5 ? 2 : 1.5; B.H = B.storeys === 2 ? 5.3 : 3.7; B.pitch = 0.5 + 0.25 * h(2); }
  else if (type === 'garage') { B.H = 2.8; B.pitch = 0.33 + 0.1 * h(2); }
  else if (type === 'shed') { B.H = 2.2 + 0.4 * h(1); B.flat = h(2) < 0.4; B.pitch = 0.35 + 0.25 * h(3); }
  else if (type === 'trailer') B.H = 2.75;
  else { B.H = k.includes('large') ? 2.9 : k.includes('barn') ? 3.4 : 2.5; B.pitch = k.includes('barn') ? 0.95 : 0.4 + 0.25 * h(2); }
  const pal = WALLC[type === 'camptr' ? 'camp' : type === 'garage' ? 'shed' : type];
  B.wall = k.includes('barn') ? 0x7a2e24 : pal[(h(11) * pal.length) | 0];
  B.roof = ROOFC[c.roof] ?? ROOFC.dark;
  B.trim = DARKWALL.has(B.wall) && h(12) < 0.55 ? 0x3a2c22 : 0xe6e4dc;
  B.found = h(13) < 0.6 ? 0x8a867e : 0x6e6a64;
  B.deckC = [0x8a7458, 0x7a6a56, 0x9a8466][(h(14) * 3) | 0];
  // a deck on the water side of a lived-in camp within ~60 m of the water (most camps; some houses)
  B.dd = (type === 'camp' || type === 'camptr' || type === 'house') && B.home && c.toWater <= 60 && h(4) < (type === 'house' ? 0.6 : 0.85) ? 2.4 + 1.2 * h(5) : 0;
  B.chim = (type === 'camp' || type === 'camptr' || type === 'house') && h(8) < 0.6 ? (h(9) < 0.3 ? 'pipe' : 'mason') : null;
  B.porch = B.home && type !== 'shed' && type !== 'garage' && h(20) < 0.55;
  return B;
}
// its boxes, from where it stands (the 1/10 world moves it): the body, the trailers, the deck; the water side and the door's side
function shapeB(B) {
  const { c, a, h } = B, ux = Math.cos(a), uy = Math.sin(a), [ox, oy] = norm2(c.out[0], c.out[1]);
  B.units = []; B.body = null; B.deck = null;
  if (B.type === 'trailer') {
    const n = c.kind === 'trailers' ? 2 : 1, lng = c.l >= c.w, aa = lng ? a : a + Math.PI / 2, hw = Math.min(c.w, c.l) / 2, hl = Math.max(c.w, c.l) / 2, wx = Math.cos(aa), wy = Math.sin(aa);
    for (let i = 0; i < n; i++) { const off = n === 1 ? 0 : (i - 0.5) * (2 * hw + 2.4); B.units.push(obb(B.cx + wx * off, B.cy + wy * off, aa, hw, hl)); }
  } else if (B.type === 'camptr' && c.w >= 9) {
    B.body = obb(B.cx - ux * 2.25, B.cy - uy * 2.25, a, (c.w - 4.5) / 2, c.l / 2);
    B.units.push(obb(B.cx + ux * (c.w / 2 - 1.75), B.cy + uy * (c.w / 2 - 1.75), a, 1.75, Math.min(c.l, 10) / 2));
  } else B.body = obb(B.cx, B.cy, a, c.w / 2, c.l / 2);
  const o = B.body || B.units[0];
  let W = walls(o), dots = W.map(w => w[0] * ox + w[1] * oy);
  B.wside = dots.indexOf(Math.max(...dots));
  if (B.dd && B.body) {   // (a footprint ≥ ~10 m deep toward the water holds its deck: the body gives it room)
    const k = B.wside, n = W[k], half = k < 2 ? o.hw : o.hl;
    if (2 * half >= 9.5) { const nh = half - B.dd / 2; B.body = k < 2 ? obb(o.cx - n[0] * B.dd / 2, o.cy - n[1] * B.dd / 2, a, nh, o.hl) : obb(o.cx - n[0] * B.dd / 2, o.cy - n[1] * B.dd / 2, a, o.hw, nh); W = walls(B.body); }
    const w = W[k], dh = w[6] * (0.6 + 0.4 * h(6)), sh = (w[6] - dh) * (2 * h(7) - 1) * 0.8, dx = w[2] + w[0] * B.dd / 2 + w[4] * sh, dy = w[3] + w[1] * B.dd / 2 + w[5] * sh;
    B.deck = k < 2 ? obb(dx, dy, a, B.dd / 2, dh) : obb(dx, dy, a, dh, B.dd / 2);
  }
  // the door: on the side away from the water (a garage's big door on its short side away from it)
  const ob = B.body || B.units[0]; W = walls(ob); dots = W.map(w => w[0] * ox + w[1] * oy);
  if (B.type === 'garage' || B.type === 'shed') { const sh = ob.hw <= ob.hl ? [2, 3] : [0, 1]; B.dside = dots[sh[0]] < dots[sh[1]] ? sh[0] : sh[1]; }
  else if (B.type === 'trailer') B.dside = dots[0] < dots[1] ? 0 : 1;   // (a trailer's door on a long side)
  else B.dside = dots.indexOf(Math.min(...dots));
  B.dOff = (h(16) < 0.5 ? 1 : -1) * 0.22;   // (the door's place along its wall, a share of the wall's length off centre)
}
const boxesOf = B => [B.body, ...B.units, B.deck].filter(Boolean);

const BUILD = [];
{
  const order = CAMPS.camps.map((c, ci) => ci).sort((i, j) => (CAMPS.camps[j].home ? 1 : 0) - (CAMPS.camps[i].home ? 1 : 0) || i - j);   // (homes first: the 1/10 world's thinning keeps them)
  const placed = [];
  for (const ci of order) {
    const c = CAMPS.camps[ci], B = building(c, ci);
    if (SMALL) {   // in from the water until it stands on dry land, its deck too; then only if it overlaps none already placed
      const m = 2 + B.dd, [ox, oy] = norm2(c.out[0], c.out[1]);
      const dry = () => { const o = obb(B.cx, B.cy, B.a, c.w / 2 + m, c.l / 2 + m); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const x = o.cx + o.ux * o.hw * i - o.uy * o.hl * j, y = o.cy + o.uy * o.hw * i + o.ux * o.hl * j; if (isWet(x, y) || !inFar(x, y, 4)) return false; } return true; };
      let k = 0; while (!dry() && k++ < 120) { B.cx -= ox * 0.5; B.cy -= oy * 0.5; }
      if (!dry()) continue;
      shapeB(B);
      if (boxesOf(B).some(o => placed.some(p => obbHit(o, p, 1.5)))) continue;
      placed.push(...boxesOf(B));
    } else shapeB(B);
    BUILD.push(B);
  }
}
const BY_CI = new Map(BUILD.map(B => [B.ci, B]));

// ---------- the docks (the true world: from their waterline out along their heading) ----------
const PLANKS = { wood: [0x9a8a72, 0x8c7c64, 0xa69680, 0x80725e, 0x948470], alu: [0xd6d8d6, 0xcacdce, 0xdfe0dc] };
const DOCKS = [];
if (!SMALL) for (const d of CAMPS.docks) {
  const ci = CAMPS.camps.findIndex(c => c.id === d.camp); if (ci < 0 || !BY_CI.has(ci)) continue;
  const [dx, dy] = norm2(d.dir[0], d.dir[1]), px = -dy, py = dx;
  let wl = null, prevLand = false;   // (the first water past land, from 15 m behind its base)
  for (let s = -15; s <= 25; s += 0.25) { const w = isWet(d.base[0] + dx * s, d.base[1] + dy * s); if (w && prevLand) { wl = s; break; } prevLand = !w; }
  if (wl === null) wl = 0;
  const j = DOCKS.length, h = k => hash(j * 13 + 5, k), wx = d.base[0] + dx * wl, wy = d.base[1] + dy * wl, len = d.len;
  const D = { j, ci, lake: d.lake, dx, dy, px, py, wx, wy, len, hw: d.seen ? 0.6 : 0.5, alu: h(1) < 0.28, head: null, boat: null, canoe: null, light: h(10) < 0.3 };
  if (d.seen && len >= 9.5 && h(2) < 0.55) D.head = { across: h(3) < 0.5 ? 0 : (h(4) < 0.5 ? 1 : -1) * 1.4, hl: 2.4, hd: 0.9 };   // (an L or a T at its end)
  const pont = d.camp === 'U20', side = h(6) < 0.5 ? 1 : -1;
  // the boat's place alongside (the wild boats set out from it too): by the outer end, on one side — or off the end where that is too shallow
  { const along = Math.max(3, len - (D.head ? 4.2 : 2.3) - (pont ? 1.4 : 0)), off = D.hw + (pont ? 1.45 : 0.95);
    let x = wx + dx * along + px * side * off, y = wy + dy * along + py * side * off, yaw = Math.atan2(dy, dx) + (h(7) < 0.5 ? Math.PI : 0);
    if (!(isWet(x, y) && GEO.depthAt(x, y) >= 0.3)) { x = wx + dx * (len + 2.6); y = wy + dy * (len + 2.6); yaw = Math.atan2(dy, dx); }
    D.slot = { x, y, yaw };
    if (pont) D.boat = 'pontoon'; else if (h(5) < 0.5) D.boat = 'skiff';
  }
  if (h(8) < 0.4) {   // a canoe or a kayak, on the dock by its shore end (or by it on the bank) when the camp is lived in
    const kind = h(9) < 0.55 ? 'canoe' : 'kayak', Lc = kind === 'canoe' ? 5 : 3.6, on = len + 1.2 >= Lc + 0.8;
    D.canoe = on ? { kind, onDeck: true, x: wx + dx * (-0.7 + Lc / 2) - px * side * (D.hw - 0.45), y: wy + dy * (-0.7 + Lc / 2) - py * side * (D.hw - 0.45), yaw: Math.atan2(dy, dx) }
      : { kind, onDeck: false, x: wx - dx * 3.5 - px * side * 2.2, y: wy - dy * 3.5 - py * side * 2.2, yaw: Math.atan2(py, px) };
  }
  // out of season: its sections stacked on the bank, the boat turned over beside them
  D.store = { x: wx - dx * 4.5 + px * side * 1.8, y: wy - dy * 4.5 + py * side * 1.8, yaw: Math.atan2(py, px) };
  D.flip = { x: wx - dx * 4.8 - px * side * 2.6, y: wy - dy * 4.8 - py * side * 2.6, yaw: Math.atan2(py, px) + (h(11) < 0.5 ? Math.PI : 0) };
  DOCKS.push(D);
}

// ---------- the roads (resampled inside the far land) ----------
const STEP = SMALL ? 1.5 : 3;
const ROADS = CAMPS.roads.map((r, ri) => {
  let len = 0; for (let k = 1; k < r.pts.length; k++) len += Math.hypot(r.pts[k][0] - r.pts[k - 1][0], r.pts[k][1] - r.pts[k - 1][1]);
  // the town's roads (Rt 169, the plowed ones) and the camps' (a grassy crown between the wheel tracks)
  const town = r.id.startsWith('e911') && (r.kind === 'paved' || len * (SMALL ? 10 : 1) >= 1500), crown = r.kind === 'gravel' && !town;
  const width = r.kind === 'paved' ? 7 : r.kind === 'track' ? 3 : town ? 5 : 4;
  const strips = []; let cur = null;
  const push = (x, y, tx, ty) => { if (inFar(x, y, 30)) { if (!cur) strips.push(cur = []); cur.push(x, y, tx, ty); } else cur = null; };
  for (let k = 1; k < r.pts.length; k++) {
    const [ax, ay] = r.pts[k - 1], [bx, by] = r.pts[k], L = Math.hypot(bx - ax, by - ay); if (!(L > 0.01)) continue;
    const n = Math.max(1, Math.ceil(L / STEP)), tx = (bx - ax) / L, ty = (by - ay) / L;
    for (let j = 0; j < n; j++) push(ax + (bx - ax) * j / n, ay + (by - ay) * j / n, tx, ty);
    if (k === r.pts.length - 1) push(bx, by, tx, ty);
  }
  for (const S of strips) {   // (the tangents smoothed through the corners)
    const n = S.length / 4, T = S.slice();
    for (let i = 0; i < n; i++) { const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1); const [tx, ty] = norm2(T[a * 4 + 2] + T[i * 4 + 2] + T[b * 4 + 2], T[a * 4 + 3] + T[i * 4 + 3] + T[b * 4 + 3]); S[i * 4 + 2] = tx; S[i * 4 + 3] = ty; }
  }
  return { id: r.id, ri, kind: r.kind, town, crown, width, strips, pts: r.pts };
});

// ---------- the launch: the gravel lot from its shore up toward the camp road, the ramp into the water ----------
const LAUNCH = (() => {
  const L0 = CAMPS.launch, [ox, oy] = norm2(L0.out[0], L0.out[1]);
  let s = 0; while (s < 40 && isWet(L0.shore[0] - ox * s, L0.shore[1] - oy * s)) s += 0.25;
  const wx = L0.shore[0] - ox * s, wy = L0.shore[1] - oy * s, W = SMALL ? 9 : 12;
  let ax = -ox, ay = -oy, Lot = SMALL ? 16 : 30;
  const box = Lc => obb(wx + ax * Lc / 2, wy + ay * Lc / 2, Math.atan2(ay, ax), Lc / 2, W / 2);
  while (Lot > 14 && BUILD.some(B => boxesOf(B).some(o => obbHit(o, box(Lot), 1)))) Lot -= 1;
  const bx = ax * Lot, by = ay * Lot;
  // where a boat puts in: out from the waterline to water half a metre deep
  let t = 1; while (t < 40 && !(isWet(wx + ox * t, wy + oy * t) && GEO.depthAt(wx + ox * t, wy + oy * t) >= 0.5)) t += 0.5;
  const yaw = Math.atan2(ay, ax), px = -ay, py = ax, slots = [];
  for (const c of SMALL ? [-2.4, 2.4] : [-3.4, 0, 3.4]) slots.push({ x: wx + bx - ax * 3.5 + px * c, y: wy + by - ay * 3.5 + py * c, yaw });   // (a car's front 1 m short of the lot's end, its trailer behind)
  return { lake: L0.lake, wx, wy, ox, oy, ax, ay, px, py, W, Lot, inW: SMALL ? 3 : 6, start: { x: wx + ox * t, y: wy + oy * t, yaw: Math.atan2(oy, ox) }, slots, inland: [wx + ax * Lot * 0.6, wy + ay * Lot * 0.6] };
})();

// ---------- the beaches: strips along their polylines, from under the water up onto the land ----------
const BEACHES = CAMPS.beaches.map(b => {
  let pts = b.pts;
  if (pts.length < 2) {   // (a single point: along its shore, its length long)
    const s = nearestShore(b.lake, pts[0][0], pts[0][1]), [nx, ny] = s ? [s[2], s[3]] : [0, 1], L = Math.max(b.len * CAMPS.scale, SMALL ? 6 : 10) / 2;
    pts = [[pts[0][0] + ny * L, pts[0][1] - nx * L], [pts[0][0] - ny * L, pts[0][1] + nx * L]];
  }
  const S = [], st = SMALL ? 1 : 2;
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1], [bx, by] = pts[k], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / st)), tx = (bx - ax) / L, ty = (by - ay) / L;
    for (let j = 0; j <= n; j++) { if (j === 0 && k > 1) continue; S.push({ x: ax + (bx - ax) * j / n, y: ay + (by - ay) * j / n, tx, ty }); }
  }
  for (const p of S) {   // the way to the water (across the line, toward its nearest water) and how far the waterline is that way
    const s = nearestShore(b.lake, p.x, p.y), sg = s && (-p.ty * (s[0] - p.x) + p.tx * (s[1] - p.y)) < 0 ? -1 : 1;
    p.wx = -p.ty * sg; p.wy = p.tx * sg; p.o = 0;
    for (let q = -8; q <= 30; q += 0.25) if (isWet(p.x + p.wx * q, p.y + p.wy * q)) { p.o = q; break; }
  }
  for (let pass = 0; pass < 2; pass++) { const o = S.map(p => p.o); for (let i = 0; i < S.length; i++) S[i].o = (o[Math.max(0, i - 1)] + 2 * o[i] + o[Math.min(S.length - 1, i + 1)]) / 4; }
  return { id: b.id, lake: b.lake, S };
});

// ---------- THE CLEARED GROUND: no tree or shrub on a footprint, a road, a path to the water, a beach or the launch ----------
function buildClearing() {
  const segs = [], rects = [];
  for (const B of BUILD) {
    for (const o of boxesOf(B)) rects.push(obb(o.cx, o.cy, o.a, o.hw + (B.home && o === B.body ? 3 : 2), o.hl + (B.home && o === B.body ? 3 : 2)));
    if (B.home && B.c.toWater <= 60) {   // (the path to the water: to its dock, else to its shore)
      const w = walls(B.body || B.units[0])[B.wside], D = DOCKS.find(d => d.ci === B.ci), t = D ? [D.wx, D.wy] : B.c.shore;
      segs.push([w[2], w[3], t[0], t[1], 1.6]);
    }
  }
  for (const D of DOCKS) segs.push([D.wx, D.wy, D.wx - D.dx * 6, D.wy - D.dy * 6, 3.2]);   // (the dock's sections and the boat stored on the bank)
  for (const R of ROADS) {
    const hw = R.width / 2 + (R.kind === 'paved' ? 0.6 : 0.45) + 1;
    for (let k = 1; k < R.pts.length; k++) { const [ax, ay] = R.pts[k - 1], [bx, by] = R.pts[k]; if (inFar(ax, ay, -200) || inFar(bx, by, -200)) segs.push([ax, ay, bx, by, hw]); }
  }
  for (const Bc of BEACHES) for (let i = 1; i < Bc.S.length; i++) { const a = Bc.S[i - 1], b = Bc.S[i]; segs.push([a.x + a.wx * (a.o - 3), a.y + a.wy * (a.o - 3), b.x + b.wx * (b.o - 3), b.y + b.wy * (b.o - 3), 5.5]); }
  { const L = LAUNCH; rects.push(obb(L.wx + L.ax * L.Lot / 2, L.wy + L.ay * L.Lot / 2, Math.atan2(L.ay, L.ax), L.Lot / 2 + 1.5, L.W / 2 + 2)); }
  // the tiles: each feature listed in the 16-m tiles it may reach
  const T = 16, NXc = Math.ceil((FX1 - FX0) / T) + 1, NYc = Math.ceil((FY1 - FY0) / T) + 1, R2 = T * 0.7072, lists = new Map();
  const add = (t, f) => { let l = lists.get(t); if (!l) lists.set(t, l = []); l.push(f); };
  const tiles = (x0, y0, x1, y1, f, near) => {
    const q0 = Math.max(0, Math.floor((x0 - FX0) / T)), q1 = Math.min(NXc - 1, Math.floor((x1 - FX0) / T)), r0 = Math.max(0, Math.floor((y0 - FY0) / T)), r1 = Math.min(NYc - 1, Math.floor((y1 - FY0) / T));
    for (let r = r0; r <= r1; r++) for (let q = q0; q <= q1; q++) if (near(FX0 + (q + 0.5) * T, FY0 + (r + 0.5) * T)) add(r * NXc + q, f);
  };
  segs.forEach((s, i) => { const [ax, ay, bx, by, hw] = s; tiles(Math.min(ax, bx) - hw, Math.min(ay, by) - hw, Math.max(ax, bx) + hw, Math.max(ay, by) + hw, i, (x, y) => segD2(x, y, ax, ay, bx, by) <= (hw + R2) ** 2); });
  rects.forEach((o, i) => { const C = corners(o); tiles(Math.min(...C.map(p => p[0])), Math.min(...C.map(p => p[1])), Math.max(...C.map(p => p[0])), Math.max(...C.map(p => p[1])), -1 - i, () => true); });
  const start = new Int32Array(NXc * NYc + 1); for (const [t, l] of lists) start[t + 1] = l.length;
  for (let t = 0; t < NXc * NYc; t++) start[t + 1] += start[t];
  const items = new Int32Array(start[NXc * NYc]); for (const [t, l] of lists) items.set(l, start[t]);
  const SG = Float64Array.from(segs.flat());
  return (x, y) => {
    const q = Math.floor((x - FX0) / T), r = Math.floor((y - FY0) / T); if (q < 0 || r < 0 || q >= NXc || r >= NYc) return false;
    const t = r * NXc + q;
    for (let o = start[t]; o < start[t + 1]; o++) {
      const f = items[o];
      if (f >= 0) { const b = f * 5, hw = SG[b + 4]; if (segD2(x, y, SG[b], SG[b + 1], SG[b + 2], SG[b + 3]) <= hw * hw) return true; }
      else { const R = rects[-1 - f], dx = x - R.cx, dy = y - R.cy; if (Math.abs(dx * R.ux + dy * R.uy) <= R.hw && Math.abs(-dx * R.uy + dy * R.ux) <= R.hl) return true; }
    }
    return false;
  };
}
// is (x, y) cleared ground (main3: no tree or shrub is placed there)
export const clearedAt = buildClearing();

// ---------- the parts' shapes (wild3kit shape(): palettes A–D, K black) ----------
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// a quad / triangle facing the side `hint` points to (whatever the corners' order)
const oq = (S, a, b, c, d, k, hint) => dot3(cross3(sub3(c, a), sub3(d, b)), hint) < 0 ? S.quad(a, d, c, b, k) : S.quad(a, b, c, d, k);
const ot = (S, a, b, c, k, hint) => dot3(cross3(sub3(b, a), sub3(c, a)), hint) < 0 ? S.tri(a, c, b, k) : S.tri(a, b, c, k);
function boxGeo() { const S = shape(); S.box([0, 0.5, 0], [1, 1, 1], 'A'); return S.done(); }   // (a unit box on its base)
function bodyGeo() {   // the walls (A), a trim board at the eaves and the sill (C)
  const S = shape(); S.box([0, 0.5, 0], [1, 1, 1], 'A'); S.box([0, 0.975, 0], [1.012, 0.05, 1.012], 'C'); S.box([0, 0.025, 0], [1.008, 0.05, 1.008], 'C'); return S.done();
}
function roofGeo() {   // a gable roof, the ridge along z at y 1, the eaves at x ±0.5, y 0: its slopes and edges B, the soffits C
  const S = shape(), t = 0.06, u = p => [p[0], p[1] - t, p[2]];
  for (const sx of [-1, 1]) {
    const e0 = [sx * 0.5, 0, -0.5], e1 = [sx * 0.5, 0, 0.5], r1 = [0, 1, 0.5], r0 = [0, 1, -0.5];
    oq(S, e0, e1, r1, r0, 'B', [sx, 1, 0]); oq(S, u(e0), u(e1), u(r1), u(r0), 'C', [-sx, -1, 0]); oq(S, e0, e1, u(e1), u(e0), 'B', [sx, 0, 0]);
    for (const z of [-0.5, 0.5]) oq(S, [sx * 0.5, 0, z], [0, 1, z], [0, 1 - t, z], [sx * 0.5, -t, z], 'B', [0, 0, z]);
  }
  return S.done();
}
function gableGeo() { const S = shape(); for (const z of [-0.5, 0.5]) ot(S, [-0.5, 0, z], [0.5, 0, z], [0, 1, z], 'A', [0, 0, z]); return S.done(); }
function trailerGeo() {   // a trailer's box with rounded top edges, across x, along z; a stripe B along its sides, its underside D
  // (the profile counter-clockwise from the bottom left; each point's palette is the side from it to the next)
  const S = shape(), P = [[-0.5, 0, 'D'], [0.5, 0, 'A'], [0.5, 0.4, 'B'], [0.5, 0.48, 'A']], r = 0.13, ry = 0.14;
  for (let k = 0; k <= 3; k++) { const a = k / 3 * Math.PI / 2; P.push([0.5 - r + r * Math.cos(a), 1 - ry + ry * Math.sin(a), 'A']); }
  for (let k = 3; k >= 0; k--) { const a = k / 3 * Math.PI / 2; P.push([-0.5 + r - r * Math.cos(a), 1 - ry + ry * Math.sin(a), 'A']); }
  P.push([-0.5, 0.48, 'B'], [-0.5, 0.4, 'A']);
  for (let i = 0; i < P.length; i++) {
    const [x0, y0, k] = P[i], [x1, y1] = P[(i + 1) % P.length];
    oq(S, [x0, y0, -0.5], [x1, y1, -0.5], [x1, y1, 0.5], [x0, y0, 0.5], k, [y1 - y0, -(x1 - x0), 0]);   // (outward: the side's direction turned clockwise)
  }
  for (const z of [-0.5, 0.5]) for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; ot(S, [0, 0.5, z], [a[0], a[1], z], [b[0], b[1], z], 'A', [0, 0, z]); }
  return S.done();
}
function skiffGeo() {   // a 14-ft aluminium boat (as wild3view's): A the hull, B the floor and seats, C the gunwale, D the outboard tilted up
  const S = shape(), X = [-2.1, -1.2, 0.3, 1.4, 2.12], HW = [0.72, 0.76, 0.74, 0.52, 0.06], G = [0.36, 0.37, 0.4, 0.46, 0.56], BT = [-0.12, -0.15, -0.15, -0.07, 0.24];
  for (let k = 0; k < 4; k++) for (const z of [-1, 1]) {
    const g0 = [X[k], G[k], z * HW[k]], g1 = [X[k + 1], G[k + 1], z * HW[k + 1]], c0 = [X[k], BT[k] + 0.06, z * HW[k] * 0.8], c1 = [X[k + 1], BT[k + 1] + 0.06, z * HW[k + 1] * 0.8], k0 = [X[k], BT[k], 0], k1 = [X[k + 1], BT[k + 1], 0];
    S.quad(g0, g1, c1, c0, 'A', true); S.quad(c0, c1, k1, k0, 'A', true);
    S.quad([X[k], G[k] + 0.02, z * HW[k]], [X[k + 1], G[k + 1] + 0.02, z * HW[k + 1]], [X[k + 1], G[k + 1] + 0.02, z * (HW[k + 1] - 0.05)], [X[k], G[k] + 0.02, z * (HW[k] - 0.05)], 'C', true);
  }
  S.quad([X[0], G[0], -HW[0]], [X[0], G[0], HW[0]], [X[0], BT[0], 0.0], [X[0], BT[0], -0.01], 'A', true);
  S.quad([X[0], 0.02, -0.65], [X[3], 0.02, -0.45], [X[3], 0.02, 0.45], [X[0], 0.02, 0.65], 'B', true);
  for (const x of [-1.55, 0.05, 1.25]) S.box([x, 0.26, 0], [0.32, 0.05, x > 1 ? 0.95 : 1.4], 'B');
  S.box([-2.3, 0.62, 0], [0.36, 0.34, 0.28], 'D'); S.box([-2.62, 0.5, 0], [0.62, 0.09, 0.09], 'D', [0, 0, 0.35]);
  return S.done();
}
function canoeGeo() {   // a 16-ft canoe, open: A outside, B inside, C the thwarts and seats
  const S = shape(), X = [-2.5, -2.0, -1.0, 0, 1.0, 2.0, 2.5], HW = [0.0, 0.3, 0.42, 0.45, 0.42, 0.3, 0.0], G = [0.5, 0.37, 0.32, 0.31, 0.32, 0.37, 0.5], K = [0.32, 0.06, 0, 0, 0, 0.06, 0.32];
  for (let k = 0; k < X.length - 1; k++) for (const z of [-1, 1]) {
    const g0 = [X[k], G[k], z * HW[k]], g1 = [X[k + 1], G[k + 1], z * HW[k + 1]], c0 = [X[k], K[k] + 0.09, z * HW[k] * 0.78], c1 = [X[k + 1], K[k + 1] + 0.09, z * HW[k + 1] * 0.78], k0 = [X[k], K[k], 0], k1 = [X[k + 1], K[k + 1], 0];
    oq(S, g0, g1, c1, c0, 'A', [0, -0.2, z]); oq(S, c0, c1, k1, k0, 'A', [0, -1, z * 0.3]);
    oq(S, g0, g1, c1, c0, 'B', [0, 0.2, -z]); oq(S, c0, c1, k1, k0, 'B', [0, 1, -z * 0.3]);
  }
  S.box([0, 0.3, 0], [0.07, 0.035, 0.88], 'C'); for (const x of [-1.75, 1.6]) S.box([x, 0.27, 0], [0.24, 0.035, 0.55], 'C');
  return S.done();
}
function kayakGeo() { const S = shape(); S.ell([0, 0.14, 0], [1.8, 0.15, 0.33], 'A', { w: 14, h: 6 }); S.ell([0.1, 0.27, 0], [0.45, 0.04, 0.24], 'K', { w: 10, h: 3 }); return S.done(); }
function pontoonGeo() {   // a 23-ft pontoon boat: A the tubes and posts, B the deck, C the fence and console, D the bimini, K the outboard
  const S = shape();
  for (const z of [-0.85, 0.85]) S.tube([[-3.4, 0.12, z], [2.9, 0.12, z], [3.45, 0.26, z]], [0.3, 0.3, 0.1], 'A', 10);
  S.box([0, 0.48, 0], [7.0, 0.1, 2.5], 'B');
  for (const z of [-1.2, 1.2]) S.box([-0.2, 0.92, z], [6.2, 0.78, 0.05], 'C');
  S.box([-3.3, 0.92, 0], [0.05, 0.78, 2.4], 'C'); for (const z of [-0.8, 0.8]) S.box([2.9, 0.92, z], [0.05, 0.78, 0.8], 'C');
  S.box([0.9, 0.95, 0.65], [0.6, 0.85, 0.55], 'C');
  for (const x of [-1.6, 0.6]) for (const z of [-1.15, 1.15]) S.box([x, 1.55, z], [0.04, 2.1, 0.04], 'A');
  S.box([-0.5, 2.6, 0], [2.6, 0.05, 2.36], 'D'); S.box([-3.75, 0.75, 0], [0.4, 0.7, 0.3], 'K');
  return S.done();
}
function carGeo() {   // a pickup or SUV, 4.9 m, facing +x: A the body, B the glass, C the trim, D the tyres
  const S = shape();
  S.box([0, 0.72, 0], [4.9, 0.66, 1.86], 'A'); S.box([0.15, 1.38, 0], [2.6, 0.62, 1.74], 'A'); S.box([0.15, 1.4, 0], [2.64, 0.4, 1.78], 'B');
  for (const x of [-1.5, 1.5]) for (const z of [-1, 1]) S.tube([[x, 0.36, z * 0.93 - 0.12], [x, 0.36, z * 0.93 + 0.12]], [0.36, 0.36], 'D', 10);
  S.box([2.46, 0.7, 0], [0.04, 0.22, 1.4], 'C'); S.box([-2.6, 0.45, 0], [0.4, 0.06, 0.1], 'C');
  return S.done();
}
function btrailerGeo() {   // an empty boat trailer, its tongue toward +x: A the galvanised frame, B the carpeted bunks, D the tyres
  const S = shape();
  for (const z of [-0.45, 0.45]) S.box([-0.3, 0.5, z], [5.0, 0.1, 0.08], 'A');
  S.box([2.9, 0.48, 0], [1.6, 0.09, 0.09], 'A'); S.box([-0.5, 0.36, 0], [0.08, 0.08, 1.6], 'A'); S.box([3.3, 0.66, 0], [0.05, 0.4, 0.05], 'A');
  for (const z of [-0.8, 0.8]) { S.tube([[-0.5, 0.3, z - 0.08], [-0.5, 0.3, z + 0.08]], [0.3, 0.3], 'D', 10); S.box([-0.5, 0.62, z], [0.9, 0.04, 0.32], 'A'); }
  for (const z of [-0.32, 0.32]) S.box([-0.6, 0.6, z], [3.2, 0.08, 0.1], 'B');
  return S.done();
}

// ---------- the draped strips' colours by season ----------
// per key: [summer, spring, fall, leaves-off, snow]
const DK = {
  asphalt: [0x3c3d3c, 0x3c3d3c, 0x3c3d3c, 0x404140, 0x505256], line: [0x8c7e48, 0x8c7e48, 0x8c7e48, 0x8a7e4a, 0x5e5c54], shoulder: [0x6a6452, 0x6a6452, 0x6e6650, 0x6e6650, 0xdce2e6],
  gravelTown: [0x8b8170, 0x8b8170, 0x8b8170, 0x8e8472, 0xb6b8b6], gravelCamp: [0x8a806c, 0x8a806c, 0x8a806c, 0x8c826e, 0xe0e5e9],
  crown: [0x5c683e, 0x6a8a44, 0x7a7448, 0x6e6650, 0xe0e5e9], verge: [0x5a6040, 0x678446, 0x766e46, 0x6a634e, 0xdde3e7],
  rut: [0x5e4e38, 0x5e4e38, 0x5e4e38, 0x5e4e38, 0xd2d7da], mid: [0x56623c, 0x6a8a44, 0x7a7448, 0x6e6650, 0xe2e6ea],
  sandUnder: [0x8e7c5a, 0x8e7c5a, 0x8e7c5a, 0x8e7c5a, 0x8e7c5a], sandWet: [0xa8946c, 0xa8946c, 0xa8946c, 0xa8946c, 0xd8dde0], sandDry: [0xc8b48e, 0xc8b48e, 0xc8b48e, 0xc0ae8a, 0xe2e6e8],
  beachEdge: [0x8a8462, 0x8e9064, 0x8e8460, 0x88806a, 0xdadfe2],
  lotGravel: [0x8c8270, 0x8c8270, 0x8c8270, 0x8e8472, 0xcfd3d4], lotWet: [0x7a6e58, 0x7a6e58, 0x7a6e58, 0x7a6e58, 0x7a6e58], lotEdge: [0x6e6a4e, 0x77804c, 0x7a7048, 0x726a54, 0xdde2e6],
};
const KEYS = Object.keys(DK), K = Object.fromEntries(KEYS.map((k, i) => [k, i]));
const SEASON_I = { summer: 0, spring: 1, fall: 2, winter: 3 };
const ROAD_BANDS = {
  paved: [[-4.1, -3.5, K.shoulder], [-3.5, -0.08, K.asphalt], [-0.08, 0.08, K.line], [0.08, 3.5, K.asphalt], [3.5, 4.1, K.shoulder]],
  track: [[-1.6, -1.1, K.verge], [-1.1, -0.65, K.rut], [-0.65, 0.65, K.mid], [0.65, 1.1, K.rut], [1.1, 1.6, K.verge]],
};
const gravelBands = (w, crown, town) => { const g = town ? K.gravelTown : K.gravelCamp, e = w / 2; return crown ? [[-e - 0.45, -e, K.verge], [-e, -0.4, g], [-0.4, 0.4, K.crown], [0.4, e, g], [e, e + 0.45, K.verge]] : [[-e - 0.45, -e, K.verge], [-e, e, g], [e, e + 0.45, K.verge]]; };
// (the near roads — within this of a lake — are in the water's mirror; the rest on the weeds' layer, which it leaves out)
const NEAR_W = SMALL ? 40 : 300, MIRRORLESS = 2;

// a draped strip's buffers: positions (three-space), colour keys and shades, the local water level (three's y; far below on dry land)
const drapeBuf = () => ({ P: [], K: [], N: [], S: [], I: [], n: 0 });
// a grid of rows × cols vertices (at(r, c) → [x, y, Y, key, sy]); each quad turned to face up
function gridInto(B, rows, cols, at) {
  const v0 = B.n;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const [x, y, Y, key, sy] = at(r, c); B.P.push(x, Y, -y); B.K.push(key); B.N.push(0.9 + 0.2 * hash(Math.floor(x * 1.7), Math.floor(y * 1.7))); B.S.push(sy); B.n++;
  }
  for (let r = 0; r + 1 < rows; r++) for (let c = 0; c + 1 < cols; c++) {
    const a = v0 + r * cols + c, b = a + cols, d = a + 1, e = b + 1, P = B.P;
    // (in three-space a face is up when its corners run counter-clockwise in (x, −z) — the world's x, y)
    const ax = P[a * 3], ay = -P[a * 3 + 2], bx = P[b * 3], by = -P[b * 3 + 2], ex = P[e * 3], ey = -P[e * 3 + 2], dx = P[d * 3], dy = -P[d * 3 + 2];
    if ((ex - ax) * (dy - by) - (ey - ay) * (dx - bx) > 0) B.I.push(a, b, e, a, e, d); else B.I.push(a, e, b, a, d, e);
  }
}

// ---------- the view ----------
// ctx: groundAt(x, y) — the ground's (or the lake bed's) three-space y at the world's (x, y), at the land height shown
export function makeCampsView(ctx) {
  const group = new THREE.Group(); group.name = 'camps';
  const gy = (x, y) => ctx.groundAt(x, y);
  const pm = (geo, cap, o) => { const p = partMesh(geo, cap, o); group.add(p.mesh); return p; };
  // the static parts (placed when the ground, the season or the docks change) and the boats and cars (each frame)
  const SP = { body: pm(bodyGeo(), 160, { water: false, rough: 0.9 }), roof: pm(roofGeo(), 160, { water: false, rough: 0.6, metal: 0.15 }), gable: pm(gableGeo(), 160, { water: false, rough: 0.9 }),
    trailer: pm(trailerGeo(), 24, { water: false, rough: 0.5, metal: 0.1 }), box: pm(boxGeo(), 6000, { rough: 0.85 }) };
  const DP = { skiff: pm(skiffGeo(), 64, { rough: 0.45, metal: 0.4 }), pontoon: pm(pontoonGeo(), 4, { rough: 0.5, metal: 0.3 }), canoe: pm(canoeGeo(), 48, { rough: 0.5 }), kayak: pm(kayakGeo(), 48, { rough: 0.45 }),
    car: pm(carGeo(), 6, { water: false, rough: 0.35, metal: 0.35 }), btrailer: pm(btrailerGeo(), 6, { water: false, rough: 0.6, metal: 0.4 }) };
  const C = h => new THREE.Color(h), SNOW = C(0xe8ecef);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), UP = new THREE.Vector3(0, 1, 0);
  // a part at the world's (x, y), its base at three's Y, turned yaw (CCW from east: its own +x then points that way), scaled
  const put = (P, x, Y, y, yaw, sx, sy, sz, cols, w = -1e4) => { _q.setFromAxisAngle(UP, yaw); _m.compose(_p.set(x, Y, -y), _q, _s.set(sx, sy, sz)); P.put(_m, cols, w); };
  // a part facing the way (nx, ny) (its +z that way: a window, a door on its wall)
  const putN = (P, x, Y, y, nx, ny, sx, sy, sz, cols) => put(P, x, Y, y, Math.atan2(nx, -ny), sx, sy, sz, cols);
  const st = { placed: false, in: false, snow: false, season: 'summer', day: -1, lightKey: -1, N: -1, yf: 0 };

  // ---- the windows: glass, lit warm at night in the camps lived in ----
  const WIN = [], DOORS = [], LAMPS = [];   // (LAMPS: porch and dock lights — their glow)
  const winGeo = new THREE.PlaneGeometry(1, 1), WCAP = 1800;
  winGeo.setAttribute('lit', new THREE.InstancedBufferAttribute(new Float32Array(WCAP), 1).setUsage(THREE.DynamicDrawUsage));
  const winMat = new THREE.MeshStandardNodeMaterial({ color: 0x10171c, roughness: 0.12, metalness: 0.4 });
  winMat.emissiveNode = vec3(1.0, 0.64, 0.32).mul(attribute('lit', 'float')).mul(2.6);
  const glass = new THREE.InstancedMesh(winGeo, winMat, WCAP); glass.count = 0; glass.frustumCulled = false; group.add(glass);
  // the soft glow about a lit window or a lamp: a camera-facing quad, added to what is behind it
  const GCAP = 2400, glowG = new THREE.InstancedBufferGeometry(), pg = new THREE.PlaneGeometry(1, 1);
  glowG.setIndex(pg.index); glowG.setAttribute('position', pg.attributes.position); glowG.setAttribute('uv', pg.attributes.uv); glowG.instanceCount = 0;
  glowG.setAttribute('gc', new THREE.InstancedBufferAttribute(new Float32Array(GCAP * 4), 4).setUsage(THREE.DynamicDrawUsage));
  glowG.setAttribute('gl', new THREE.InstancedBufferAttribute(new Float32Array(GCAP), 1).setUsage(THREE.DynamicDrawUsage));
  const BR = uniform(new THREE.Vector3(1, 0, 0)), BU = uniform(new THREE.Vector3(0, 1, 0));
  const glowMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  { const gc = attribute('gc', 'vec4'); glowMat.positionNode = gc.xyz.add(BR.mul(positionGeometry.x.mul(gc.w))).add(BU.mul(positionGeometry.y.mul(gc.w)));
    const r = length(uv().sub(0.5)).mul(2), f = float(1).sub(smoothstep(0, 1, r)); glowMat.colorNode = vec3(1.0, 0.66, 0.34).mul(f.mul(f)).mul(attribute('gl', 'float')); }
  const glow = new THREE.Mesh(glowG, glowMat); glow.frustumCulled = false; glow.renderOrder = 4; group.add(glow);

  // ---- the draped strips: the roads (near the lakes in the mirror, the rest not), the launch and the beaches ----
  const drapeMat = new THREE.MeshStandardNodeMaterial({ roughness: 0.95, metalness: 0 });
  { const P = positionGeometry, toC = cameraPosition.sub(P), d = length(toC);   // (drawn a little toward the eye: never fighting the ground beneath)
    drapeMat.positionNode = P.add(toC.div(d.max(0.001)).mul(d.mul(0.0012).add(0.03)));
    drapeMat.colorNode = attribute('color', 'vec3'); drapeMat.outputNode = waterOut(attribute('sy', 'float').sub(positionWorld.y)); }
  const drapeMesh = layer => { const m = new THREE.Mesh(new THREE.BufferGeometry(), drapeMat); m.layers.set(layer); m.visible = false; group.add(m); m.userData.buf = null; return m; };
  const roadsNear = drapeMesh(0), roadsFar = drapeMesh(MIRRORLESS), shore = drapeMesh(0);
  // the docks' decks (planks by vertex colour)
  const deckMat = new THREE.MeshStandardNodeMaterial({ roughness: 0.85, metalness: 0 }); deckMat.colorNode = attribute('color', 'vec3');
  const docksMesh = new THREE.Mesh(new THREE.BufferGeometry(), deckMat); docksMesh.visible = false; group.add(docksMesh);

  function fillDrape(mesh, B) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(B.n * 3), 3));
    g.setAttribute('sy', new THREE.Float32BufferAttribute(B.S, 1)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(B.I), 1));
    if (B.n) { g.computeVertexNormals(); g.computeBoundingSphere(); }
    mesh.geometry.dispose(); mesh.geometry = g; mesh.userData.buf = { K: Uint8Array.from(B.K), N: Float32Array.from(B.N) }; mesh.visible = B.n > 0;
  }
  function colourDrape(mesh) {
    const b = mesh.userData.buf; if (!b) return;
    const si = st.snow ? 4 : SEASON_I[st.season] ?? 0, A = mesh.geometry.attributes.color.array, c = new THREE.Color(), tab = KEYS.map(k => C(DK[k][si]));
    for (let i = 0; i < b.K.length; i++) { c.copy(tab[b.K[i]]).multiplyScalar(b.N[i]); A[i * 3] = c.r; A[i * 3 + 1] = c.g; A[i * 3 + 2] = c.b; }
    mesh.geometry.attributes.color.needsUpdate = true;
  }
  function buildRoads() {
    const near = drapeBuf(), far = drapeBuf();
    for (const R of ROADS) {
      const bands = R.kind === 'paved' ? ROAD_BANDS.paved : R.kind === 'track' ? ROAD_BANDS.track : gravelBands(R.width, R.crown, R.town);
      const offs = [...new Set(bands.flat().filter((v, i) => i % 3 !== 2))].sort((a, b) => a - b), lift = 0.06 + 0.004 * (R.ri % 8) + (R.kind === 'paved' ? 0.03 : 0);
      for (const S of R.strips) {
        const n = S.length / 4; if (n < 2) continue;
        // (the heights at each sample's band edges, once; the middle a little crowned)
        const Y = new Float32Array(n * offs.length);
        for (let i = 0; i < n; i++) { const x = S[i * 4], y = S[i * 4 + 1], nx = -S[i * 4 + 3], ny = S[i * 4 + 2]; offs.forEach((o, k) => { Y[i * offs.length + k] = gy(x + nx * o, y + ny * o) + lift + 0.05 * (1 - Math.min(1, Math.abs(o) / 2.5)); }); }
        // (split into runs near the lakes and away from them, each run a grid per band)
        const nearAt = i => { const x = S[i * 4], y = S[i * 4 + 1], c = cellIndex(x, y); return c >= 0 && (GEO.body[c] !== LAND || GEO.toWater[c] < NEAR_W); };
        let i0 = 0;
        while (i0 < n - 1) {
          const cls = nearAt(i0); let i1 = i0 + 1; while (i1 < n - 1 && nearAt(i1) === cls) i1++;
          const B = cls ? near : far, rows = i1 - i0 + 1;
          for (const [o0, o1, key] of bands) {
            const k0 = offs.indexOf(o0), k1 = offs.indexOf(o1);
            gridInto(B, rows, 2, (r, c) => { const i = i0 + r, o = c ? o1 : o0, x = S[i * 4] - S[i * 4 + 3] * o, y = S[i * 4 + 1] + S[i * 4 + 2] * o; return [x, y, Y[i * offs.length + (c ? k1 : k0)], key, -1e4]; });
          }
          i0 = i1;
        }
      }
    }
    fillDrape(roadsNear, near); fillDrape(roadsFar, far);
  }
  const lvl = (x, y) => inBand(x, y) ? GEO.levelAt(x, y) - BASE : -1e4;
  function buildShore() {
    const B = drapeBuf();
    { // the launch: the lot from the waterline in, the ramp out under the water
      const L = LAUNCH, st2 = SMALL ? 1.5 : 2, rows = Math.ceil((L.Lot + L.inW) / st2) + 1, cw = L.W / 2 + 1.5, cols = Math.ceil(2 * cw / 1.5) + 1;
      gridInto(B, rows, cols, (r, c) => {   // (o along the lot's axis — inland +, under the water −; q across it)
        const o = -L.inW + r * (L.Lot + L.inW) / (rows - 1), q = -cw + c * 2 * cw / (cols - 1), x = L.wx + L.ax * o + L.px * q, y = L.wy + L.ay * o + L.py * q;
        const key = o < -0.5 ? K.lotWet : Math.abs(q) > L.W / 2 || o > L.Lot - 1 ? K.lotEdge : K.lotGravel;
        return [x, y, gy(x, y) + 0.05, key, lvl(x, y)];
      });
    }
    for (const Bc of BEACHES) {   // the beaches: from 2.5 m under the water to 7.5 m up the land, about the waterline as drawn
      const S = Bc.S, n = S.length; if (n < 2) continue;
      const o = S.map(p => {   // (where the ground drawn dips under the water's level, near where the map has it)
        for (let q = p.o - 8; q <= p.o + 8; q += 0.25) { const x = p.x + p.wx * q, y = p.y + p.wy * q; if (gy(x, y) < lvl(x, y) - 0.02) return q; }
        return p.o;
      });
      for (let pass = 0; pass < 2; pass++) { const t = o.slice(); for (let i = 0; i < n; i++) o[i] = (t[Math.max(0, i - 1)] + 2 * t[i] + t[Math.min(n - 1, i + 1)]) / 4; }
      const Q = [-2.5, -1, 0, 1.2, 3, 5.5, 7.5], KQ = [K.sandUnder, K.sandUnder, K.sandWet, K.sandDry, K.sandDry, K.sandDry, K.beachEdge];
      gridInto(B, n, Q.length, (r, c) => {
        const p = S[r], f = Math.min(1, (r + 1) / 3, (n - r) / 3), q = Q[c] > 0 ? Q[c] * (0.4 + 0.6 * f) : Q[c], x = p.x + p.wx * (o[r] - q), y = p.y + p.wy * (o[r] - q);
        return [x, y, gy(x, y) + 0.04, KQ[c], lvl(x, y)];
      });
    }
    fillDrape(shore, B);
  }
  // the docks' decks: planks across their length (weathered wood, or white-painted aluminium), their stringers' sides below
  function buildDocks() {
    const P = [], Cc = [], c = new THREE.Color();
    const pushQ = (a, b, d, e, col, hint) => {   // (a quad of three-space corners facing the hint, flat)
      const n = cross3(sub3(d, a), sub3(e, b)), v = dot3(n, hint) < 0 ? [a, e, d, a, d, b] : [a, b, d, a, d, e];
      for (const p of v) { P.push(p[0], p[1], p[2]); Cc.push(col.r, col.g, col.b); }
    };
    const deck = (cx, cy, ax, ay, len, wid, Y, cols, side, seed) => {
      const px = -ay, py = ax, n = Math.max(1, Math.round(len / 0.155)), step = len / n, hw = wid / 2, at = (s, q, h = Y) => [cx + ax * s + px * q, h, -(cy + ay * s + py * q)];
      for (let k = 0; k < n; k++) {
        const s0 = -len / 2 + k * step, s1 = s0 + step * 0.88, s2 = s0 + step;
        c.setHex(cols[(hash(seed, k) * cols.length) | 0]).multiplyScalar(0.86 + 0.26 * hash(seed + 7, k)); pushQ(at(s0, -hw), at(s1, -hw), at(s1, hw), at(s0, hw), c, [0, 1, 0]);
        c.multiplyScalar(0.45); pushQ(at(s1, -hw, Y - 0.02), at(s2, -hw, Y - 0.02), at(s2, hw, Y - 0.02), at(s1, hw, Y - 0.02), c, [0, 1, 0]);
      }
      c.setHex(side);
      for (const q of [-hw, hw]) pushQ(at(-len / 2, q, Y - 0.22), at(len / 2, q, Y - 0.22), at(len / 2, q), at(-len / 2, q), c, [px * q, 0, -py * q]);
      for (const s of [-len / 2, len / 2]) pushQ(at(s, -hw, Y - 0.22), at(s, hw, Y - 0.22), at(s, hw), at(s, -hw), c, [ax * s, 0, -ay * s]);
    };
    for (const D of DOCKS) {
      const cols = D.alu ? PLANKS.alu : PLANKS.wood, side = D.alu ? 0xa8acb0 : 0x5e5040, end = D.len - (D.head ? 2 * D.head.hd : 0), L = end + 1.2;
      deck(D.wx + D.dx * (end - 1.2) / 2, D.wy + D.dy * (end - 1.2) / 2, D.dx, D.dy, L, 2 * D.hw, D.deckY, cols, side, D.j * 31 + 1);
      if (D.head) { const s = D.len - D.head.hd; deck(D.wx + D.dx * s + D.px * D.head.across, D.wy + D.dy * s + D.py * D.head.across, D.px, D.py, 2 * D.head.hl, 2 * D.head.hd, D.deckY, cols, side, D.j * 31 + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
    if (P.length) { g.computeVertexNormals(); g.computeBoundingSphere(); } docksMesh.geometry.dispose(); docksMesh.geometry = g;
  }

  // ---- the buildings' windows, doors and lamps (where they are: on the land as it stands) ----
  function planOpenings(B) {
    const isHome = B.home && B.type !== 'shed' && B.type !== 'garage', h = B.h;
    const win = (w, s, Yc, ww, wh, front) => { const [nx, ny, cx, cy, tx, ty] = w; WIN.push({ B, x: cx + tx * s + nx * 0.03, y: cy + ty * s + ny * 0.03, Y: Yc, nx, ny, w: ww, h: wh, lit: isHome, on: hash(B.ci * 41 + WIN.length, 3) < (front ? 0.85 : 0.6), k: 0.7 + 0.6 * hash(B.ci, WIN.length + 9) }); };
    const door = (w, s, F, dw, dh, col) => { const [nx, ny, cx, cy, tx, ty] = w; DOORS.push({ x: cx + tx * s + nx * 0.03, y: cy + ty * s + ny * 0.03, Y: F, nx, ny, w: dw, h: dh, col }); return s; };
    const row = (w, Yc, ww, wh, front, skip = null) => { const len = 2 * w[6], n = Math.max(front ? 1 : 0, Math.round((len - 1.5) / (front ? 2.4 : 3.3))); for (let j = 0; j < n; j++) { const s = (j + 0.5) * len / n - len / 2; if (skip !== null && Math.abs(s - skip) < ww / 2 + 0.8) continue; win(w, s, Yc, ww, wh, front); } };
    const F = B.F, doorCol = [0x5a3a26, 0x7a2a22, 0x3a4a5a, 0x4a3a2a][(h(17) * 4) | 0];
    for (const [ui, U] of B.units.entries()) {   // the trailers: three windows down each long side, a door on the land side
      const W = walls(U), Fu = U.F;
      for (const k of [0, 1]) { const w = W[k], sd = k === B.dside && ui === 0 ? door(w, w[6] * 0.35, Fu, 0.85, 1.95, 0xd8d4c8) : null; for (const s of [-0.6, 0, 0.6]) { const ss = s * w[6]; if (sd !== null && Math.abs(ss - sd) < 1.2) continue; win(w, ss, Fu + 1.45, 0.9, 0.65, k !== B.dside); } }
      if (B.porch && ui === 0) { const w = W[B.dside]; LAMPS.push({ B, x: w[2] + w[4] * w[6] * 0.35 + w[0] * 0.35, y: w[3] + w[5] * w[6] * 0.35 + w[1] * 0.35, Y: Fu + 2.2, s: 3, all: hash(B.ci, 77) < 0.3 }); }
    }
    if (!B.body) return;
    const W = walls(B.body), ridgeV = B.body.hl >= B.body.hw, ends = ridgeV ? [2, 3] : [0, 1];
    for (let k = 0; k < 4; k++) {
      const w = W[k], front = k === B.wside, sd = k === B.dside ? w[6] * 2 * B.dOff : null;
      // (a garage's big door, a shed's door, on the side away from the water; a small window in a wall beside it)
      const sideWall = B.dside < 2 ? 2 : 0;
      if (B.type === 'garage') { if (k === B.dside) DOORS.push({ x: w[2] + w[0] * 0.03, y: w[3] + w[1] * 0.03, Y: F, nx: w[0], ny: w[1], w: Math.min(2 * w[6] - 0.8, 2.7), h: 2.2, col: hash(B.ci, 5) < 0.5 ? 0xd8d6d0 : B.wall }); else if (k === sideWall && h(18) < 0.7) win(w, 0, F + 1.6, 0.8, 0.6, false); continue; }
      if (B.type === 'shed') { if (k === B.dside) door(w, 0, F, 1.0, 1.9, B.wall === 0x8a8880 ? 0x6a6a66 : 0x4a3a2a); else if (k === sideWall && h(18) < 0.6) win(w, 0, F + 1.4, 0.6, 0.6, false); continue; }
      if (k === B.dside) door(w, sd, F, 0.95, 2.05, doorCol);
      const big = B.type === 'house' ? [1.4, 1.35] : [1.5, 1.3], small = B.type === 'house' ? [1.0, 1.3] : [0.9, 1.0];
      row(w, F + 1.5, front ? big[0] : small[0], front ? big[1] : small[1], front, sd);
      if (B.storeys === 2) row(w, F + 4.1, front ? 1.2 : small[0], 1.2, front);
      else if (B.type === 'house' && ends.includes(k)) win(w, 0, F + B.H + 0.5, 0.8, 0.9, false);
    }
    if (B.porch) { const w = W[B.dside], s = w[6] * 2 * B.dOff + 0.75; LAMPS.push({ B, x: w[2] + w[4] * s + w[0] * 0.3, y: w[3] + w[5] * s + w[1] * 0.3, Y: F + 2.25, s: 3, all: hash(B.ci, 77) < 0.3 }); }
  }

  // ---- placing: on the land as shown (main3: at start and when the land's height changes) ----
  function place() {
    for (const B of BUILD) {
      let gmin = 1e9, gmax = -1e9;
      for (const o of boxesOf(B)) for (const [x, y] of [...corners(o), [o.cx, o.cy]]) { const g = gy(x, y); gmin = Math.min(gmin, g); gmax = Math.max(gmax, g); }
      // (the floor level over the highest corner, on a foundation to the lowest — a steep lot's lower side a tall wall, the uphill side dug in)
      B.gmin = gmin; B.gmax = gmax; B.F = Math.min(gmax + 0.3, gmin + 2.6);
      for (const U of B.units) { let m = -1e9; for (const [x, y] of corners(U)) m = Math.max(m, gy(x, y)); U.g = Math.min(...corners(U).map(([x, y]) => gy(x, y))); U.F = Math.min(m + 0.5, U.g + 2); }
    }
    for (const D of DOCKS) D.deckY = surfY(D.wx + D.dx * 2, D.wy + D.dy * 2) + 0.35;
    WIN.length = 0; DOORS.length = 0; LAMPS.length = 0;
    for (const B of BUILD) planOpenings(B);
    for (const D of DOCKS) if (D.light) LAMPS.push({ D, x: D.wx + D.dx * (D.len - 0.3), y: D.wy + D.dy * (D.len - 0.3), Y: D.deckY + 1.0, s: 2.6 });
    const n = Math.min(WIN.length, WCAP);
    for (let k = 0; k < n; k++) { const w = WIN[k]; _q.setFromAxisAngle(UP, Math.atan2(w.nx, -w.ny)); _m.compose(_p.set(w.x + w.nx * 0.04, w.Y, -(w.y + w.ny * 0.04)), _q, _s.set(w.w, w.h, 1)); glass.setMatrixAt(k, _m); }
    glass.count = n; glass.instanceMatrix.needsUpdate = true;
    for (const D of DOCKS) { D.store.g = gy(D.store.x, D.store.y); D.flip.g = gy(D.flip.x, D.flip.y); if (D.canoe) D.canoe.g = D.canoe.onDeck ? D.deckY : gy(D.canoe.x, D.canoe.y); }
    for (const s of LAUNCH.slots) { s.g = gy(s.x, s.y); const tx = s.x - Math.cos(s.yaw) * 5.95, ty = s.y - Math.sin(s.yaw) * 5.95; s.tg = gy(tx, ty); s.tx = tx; s.ty = ty; s.pitch = Math.atan2(s.g - s.tg, 5.95); }
    buildRoads(); buildShore(); buildDocks();
    colourDrape(roadsNear); colourDrape(roadsFar); colourDrape(shore);
    st.placed = true; st.lightKey = -1; rebuildStatic();
  }

  // ---- the static parts: the buildings, their decks and chimneys, the docks' posts (or, out of season, their sections on the bank) ----
  const cc = {};   // (colours by hex, made once)
  const col = h => cc[h] || (cc[h] = C(h));
  const snowy = (h, f) => st.snow ? col(h).clone().lerp(SNOW, f) : col(h);
  function rebuildStatic() {
    if (!st.placed) return;
    const box = (x, Y, y, yaw, sx, sy, sz, c, w) => put(SP.box, x, Y, y, yaw, sx, sy, sz, [c], w);
    for (const B of BUILD) {
      const cW = col(B.wall), cT = col(B.trim), cR = snowy(B.roof, 0.85), F = B.F;
      for (const U of B.units) {   // a trailer on its blocks, a dark skirt below
        box(U.cx, U.g - 0.2, U.cy, U.a, 2 * U.hw - 0.2, U.F - U.g + 0.2, 2 * U.hl - 0.3, col(0x4a4640));
        put(SP.trailer, U.cx, U.F, U.cy, U.a, 2 * U.hw, B.H, 2 * U.hl, [col(B.type === 'trailer' ? B.wall : 0xe8e4d6), col(B.ci % 2 ? 0x7a3a2a : 0x3a5a7a), cT, col(0x3a3834)]);
      }
      if (B.body) {
        const o = B.body, wallTop = F + B.H;
        box(o.cx, B.gmin - 0.4, o.cy, o.a, 2 * o.hw - 0.12, F - B.gmin + 0.4, 2 * o.hl - 0.12, col(B.found));
        put(SP.body, o.cx, F, o.cy, o.a, 2 * o.hw, B.H, 2 * o.hl, [cW, cW, cT, cT]);
        const ridgeV = o.hl >= o.hw, yaw = ridgeV ? o.a : o.a + Math.PI / 2, span = ridgeV ? o.hw : o.hl, lng = ridgeV ? o.hl : o.hw;
        const rx = ridgeV ? -o.uy : o.ux, ry = ridgeV ? o.ux : o.uy, sxv = ridgeV ? o.ux : -o.uy, syv = ridgeV ? o.uy : o.ux;   // (the ridge's way, and across it)
        if (B.flat) box(o.cx, wallTop, o.cy, o.a, 2 * o.hw + 0.5, 0.18, 2 * o.hl + 0.5, cR);
        else {
          // (the pitch held to a camp's or a house's height of roof: a 20-m footprint at 8/12 would stand a roof 7 m tall)
          const OH = B.type === 'shed' || B.type === 'garage' ? 0.3 : 0.45, rise = Math.min(span * B.pitch, B.type === 'house' ? 3.6 : B.c.kind.includes('barn') ? 4.2 : 2.8), base = wallTop - rise * OH / (span + OH) + 0.06 * rise, apex = base + 0.94 * rise;
          put(SP.roof, o.cx, base, o.cy, yaw, 2 * (span + OH), rise, 2 * (lng + 0.35), [cR, cR, cT, cR]);
          if (apex - wallTop > 0.05) put(SP.gable, o.cx, wallTop, o.cy, yaw, 2 * span, apex - wallTop, 2 * lng, [cW]);
          if (B.chim) {   // a stone or brick chimney through the ridge near one end, or a stove's pipe through a slope
            const sg = B.h(10) < 0.5 ? 1 : -1, al = sg * lng * 0.55;
            if (B.chim === 'mason') box(o.cx + rx * al, wallTop - 0.4, o.cy + ry * al, o.a, 0.7, apex - wallTop + 1.3, 0.7, col(B.h(9) < 0.6 ? 0x7a3e2c : 0x7c766c));
            else { const ac = span * 0.4 * sg, top = base + rise * (1 - (span * 0.4) / (span + OH)); box(o.cx + rx * al * 0.6 + sxv * ac, top - 0.3, o.cy + ry * al * 0.6 + syv * ac, o.a, 0.2, 1.3, 0.2, col(0x34363a)); }
          }
        }
        if (B.deck) {   // the deck: boards at the floor, posts to the ground, a rail round its three open sides
          const d = B.deck, top = F - 0.12, cD = snowy(B.deckC, 0.75), cP = col(B.deckC).clone().multiplyScalar(0.8), Wd = walls(d);
          box(d.cx, top - 0.15, d.cy, d.a, 2 * d.hw, 0.15, 2 * d.hl, cD);
          for (const [x, y] of corners(d, -0.12)) { const g = gy(x, y); if (top - 0.15 - g > 0.05) box(x, g - 0.2, y, d.a, 0.14, top - 0.15 - g + 0.2, 0.14, cP); }
          const [bnx, bny] = walls(o)[B.wside];
          for (const w of Wd) {
            if (w[0] * bnx + w[1] * bny < -0.9) continue;   // (the side against the building)
            const yaw2 = Math.atan2(w[5], w[4]), x = w[2] - w[0] * 0.04, y = w[3] - w[1] * 0.04;
            box(x, top + 0.9, y, yaw2, 2 * w[6], 0.07, 0.07, cP); box(x, top + 0.45, y, yaw2, 2 * w[6], 0.05, 0.05, cP);
            for (const s of [-1, 1]) box(x + w[4] * s * (w[6] - 0.05), top, y + w[5] * s * (w[6] - 0.05), yaw2, 0.09, 0.97, 0.09, cP);
          }
        }
      }
    }
    for (const w of WIN) putN(SP.box, w.x, w.Y - w.h / 2 - 0.07, w.y, w.nx, w.ny, w.w + 0.16, w.h + 0.14, 0.06, [col(w.B.trim)]);   // (the windows' frames)
    for (const d of DOORS) putN(SP.box, d.x, d.Y, d.y, d.nx, d.ny, d.w, d.h, 0.07, [col(d.col)]);
    for (const D of DOCKS) {
      if (st.in) {   // its posts, from the bed to the deck
        const cP = col(D.alu ? 0xb8bcc0 : 0x5a4a38), t = D.alu ? 0.08 : 0.12, end = D.len - (D.head ? 2 * D.head.hd : 0);
        const post = (x, y) => { const g = gy(x, y); box(x, g - 0.3, y, Math.atan2(D.dy, D.dx), t, D.deckY - 0.04 - g + 0.3, t, cP, surfY(x, y)); };
        for (let s = -0.9; s < end + 0.01; s += 2.4) for (const q of [-1, 1]) post(D.wx + D.dx * s + D.px * q * (D.hw - 0.07), D.wy + D.dy * s + D.py * q * (D.hw - 0.07));
        for (const q of [-1, 1]) post(D.wx + D.dx * (end - 0.1) + D.px * q * (D.hw - 0.07), D.wy + D.dy * (end - 0.1) + D.py * q * (D.hw - 0.07));
        if (D.head) { const s0 = D.len - D.head.hd; for (const a of [-1, 1]) for (const b of [-1, 1]) post(D.wx + D.dx * (s0 + a * (D.head.hd - 0.1)) + D.px * (D.head.across + b * (D.head.hl - 0.1)), D.wy + D.dy * (s0 + a * (D.head.hd - 0.1)) + D.py * (D.head.across + b * (D.head.hl - 0.1))); }
        if (D.light) box(D.wx + D.dx * (D.len - 0.3), D.deckY, D.wy + D.dy * (D.len - 0.3), 0, 0.1, 1.05, 0.1, col(0x2a2a2a));
      } else {   // out of season: its sections stacked on the bank
        const cs = snowy(D.alu ? 0xc8cacc : 0x8a7a64, 0.6), n = Math.min(4, Math.ceil((D.len + 1.2) / 3));
        for (let k = 0; k < n; k++) box(D.store.x, D.store.g + k * 0.16, D.store.y, D.store.yaw + (hash(D.j, k) - 0.5) * 0.12, 2.4, 0.14, 2 * D.hw, cs);
      }
    }
    for (const P of Object.values(SP)) P.end();
    docksMesh.visible = st.in && DOCKS.length > 0;
  }

  // ---- each frame: the boats bobbing at the docks, the cars at the launch; the lights ----
  const taken = new Uint8Array(Math.max(1, DOCKS.length)); let launchOut = 0;
  const occ = new Uint8Array(CAMPS.camps.length);
  const BOATC = { skiff: [[0x9aa0a4, 0x5e6468, 0x3a6a4a, 0x161616], [0x9aa0a4, 0x5e6468, 0x9aa0a4, 0x2a2a2a], [0x3e5a3e, 0x5e6468, 0x9aa0a4, 0x161616]], pontoon: [0xc0c4c8, 0x4a4a4e, 0xd8d4c8, 0x2a3a5a],
    canoe: [[0x2e5a3a, 0x3a6a4a, 0x8a6a48], [0x8a2a22, 0x9a3a2a, 0x8a6a48], [0xb0b4b6, 0x8a8e90, 0x6a6e70], [0x2a4a7a, 0x3a5a8a, 0x8a6a48]], kayak: [0xd8442a, 0xe8b020, 0x2a6ab0, 0x2a9a6a],
    car: [0x8a1a1a, 0x2a3a5a, 0xd8d8d4, 0x3a3a3a, 0x5a5e62, 0x2e4a2e], glass: 0x1e2a32, trim: 0x2a2a2a, tyre: 0x161616, trailer: [0x9a9ca0, 0x3a3a3a, 0x9a9ca0, 0x161616] };
  const cols = a => a.map(col);   // (the boats' and cars' colour sets, made once: nothing is allocated a frame)
  const CB = { skiff: BOATC.skiff.map(cols), pontoon: cols(BOATC.pontoon), canoe: BOATC.canoe.map(cols), kayak: BOATC.kayak.map(h => [col(h)]),
    car: BOATC.car.map(h => [col(h), col(BOATC.glass), col(BOATC.trim), col(BOATC.tyre)]), trailer: cols(BOATC.trailer) };
  function boats(t, sn) {
    const day = st.day;
    if (st.in) for (const D of DOCKS) {
      if (D.boat && !taken[D.j]) {   // tied alongside, rocking a little
        const ph = D.j * 1.7, s = D.slot, sy = surfY(s.x, s.y), pon = D.boat === 'pontoon', Y = sy + (pon ? 0.012 : 0.025) * Math.sin(t * 1.1 + ph);
        _e.set((pon ? 0.008 : 0.025) * Math.sin(t * 0.9 + ph * 2), s.yaw, 0.01 * Math.sin(t * 0.7 + ph), 'YZX'); _q.setFromEuler(_e); _m.compose(_p.set(s.x, Y, -s.y), _q, _s.set(1, 1, 1));
        if (pon) DP.pontoon.put(_m, CB.pontoon, sy); else DP.skiff.put(_m, CB.skiff[D.j % 3], sy);
      }
      if (D.canoe && occ[D.ci]) { const c = D.canoe; put(c.kind === 'canoe' ? DP.canoe : DP.kayak, c.x, c.g + (c.onDeck ? 0 : 0.02), c.y, c.yaw, 1, 1, 1, c.kind === 'canoe' ? CB.canoe[D.j % 4] : CB.kayak[D.j % 4]); }
    } else for (const D of DOCKS) if (D.boat === 'skiff') {   // out of season: turned over on the bank
      _e.set(Math.PI, D.flip.yaw, 0, 'YZX'); _q.setFromEuler(_e); _m.compose(_p.set(D.flip.x, D.flip.g + 0.42, -D.flip.y), _q, _s.set(1, 1, 1)); DP.skiff.put(_m, CB.skiff[D.j % 3]);
    }
    // the launch's lot: a car and its empty trailer for each boat out from it (wild3view), and some days one more by day in the open months
    const open = sn.yf > 0.15 && sn.yf < 0.74 && !st.snow, extra = open && sn.sun > 0.15 && hash(day, 5) < 0.55 ? 1 : 0, nCar = Math.min(LAUNCH.slots.length, launchOut + extra);
    for (let k = 0; k < nCar; k++) {
      const s = LAUNCH.slots[(k + day) % LAUNCH.slots.length];
      put(DP.car, s.x, s.g, s.y, s.yaw, 1, 1, 1, CB.car[(hash(day * 3 + k, 7) * CB.car.length) | 0]);
      _e.set(0, s.yaw, s.pitch * 0.8, 'YZX'); _q.setFromEuler(_e); _m.compose(_p.set(s.tx, s.tg, -s.ty), _q, _s.set(1, 1, 1)); DP.btrailer.put(_m, CB.trailer);
    }
    for (const P of DPL) P.end();
  }
  const DPL = Object.values(DP);
  // the lights: by night, in the camps lived in today, until each window's bedtime (a few up again before dawn)
  const LIT = winGeo.attributes.lit, GC = glowG.attributes.gc, GL = glowG.attributes.gl;
  function lights(sn) {
    const N = clamp((0.16 - sn.sun) / 0.12, 0, 1), tod = sn.t, key = st.day * 200 + Math.floor(tod * 96);
    if (key === st.lightKey && Math.abs(N - st.N) < 0.03) return;
    st.lightKey = key; st.N = N;
    const awake = (seed, early) => { const bed = 0.91 + 0.12 * hash(seed, 21); return tod >= 0.5 ? tod < bed : (bed > 1 && tod < bed - 1) || (early && tod > 0.22); };
    let g = 0; const L = LIT.array, gc = GC.array, gl = GL.array;
    for (let k = 0; k < glass.count; k++) {
      const w = WIN[k], on = N > 0 && w.lit && w.on && occ[w.B.ci] && awake(w.B.ci * 3 + (k % 3), hash(w.B.ci, 23) < 0.3);
      L[k] = on ? N * w.k : 0;
      if (on && g < GCAP) { gc[g * 4] = w.x + w.nx * 0.3; gc[g * 4 + 1] = w.Y; gc[g * 4 + 2] = -(w.y + w.ny * 0.3); gc[g * 4 + 3] = 1.6 * Math.max(w.w, w.h); gl[g++] = 0.32 * N * w.k; }
    }
    for (const l of LAMPS) {
      const ci = l.B ? l.B.ci : l.D.ci, on = N > 0.3 && occ[ci] && (l.D ? st.in : true) && (l.all || awake(ci * 3 + 1, false));
      if (on && g < GCAP) { gc[g * 4] = l.x; gc[g * 4 + 1] = l.Y; gc[g * 4 + 2] = -l.y; gc[g * 4 + 3] = l.s; gl[g++] = 0.75 * N; }
    }
    LIT.needsUpdate = true; glowG.instanceCount = g; GC.needsUpdate = GL.needsUpdate = true;
  }

  function update(t, sn, camera) {
    if (!group.visible || !st.placed) return;
    if (camera) { camera.updateMatrixWorld(); BR.value.setFromMatrixColumn(camera.matrixWorld, 0); BU.value.setFromMatrixColumn(camera.matrixWorld, 1); }
    if (!sn) return;
    st.yf = sn.yf;
    const day = Math.floor(sn.time / 86400), inS = docksIn(sn.yf) && !st.snow;
    if (day !== st.day) { st.day = day; for (let i = 0; i < occ.length; i++) occ[i] = BY_CI.has(i) && occupied(i, sn.yf, day) ? 1 : 0; st.lightKey = -1; }
    if (inS !== st.in) { st.in = inS; rebuildStatic(); }
    lights(sn); boats(t, sn);
  }
  // the season (main3 applySeason): the roads' and beaches' colours, snow on the roofs and decks, the docks out under snow
  function setSeason(season, snow) {
    st.season = season; st.snow = !!snow;
    if (st.snow && st.in) st.in = false;
    if (!st.placed) return;
    colourDrape(roadsNear); colourDrape(roadsFar); colourDrape(shore); rebuildStatic();
  }

  // ---- for the wildlife view's people (render3/wild3view.js): where boats put in, the docks' decks, the ice anglers' ways on ----
  const shown = () => group.visible && st.placed;
  const homesOn = body => BUILD.filter(B => B.home && B.lake === body && B.c.shore);
  const outFrom = (x, y, ox, oy) => { let t = 1.5; while (t < 30 && !(isWet(x + ox * t, y + oy * t) && GEO.depthAt(x + ox * t, y + oy * t) >= 0.35)) t += 0.5; return [x + ox * t, y + oy * t]; };
  const hooks = {
    // a place for a boat to set out from on lake `body` today: the launch (Upper's, the public one: half the trips when the docks are in),
    // the dock of a camp lived in today (its boat taken from it), else a lived-in camp's shore (pulled up there). { x, y, yaw, dock }: dock
    // the dock's number, −1 the launch, −2 a shore; null: none (wild3view keeps its own landing)
    landing(body, yf, day, slot) {
      if (!shown()) return null;
      const L = LAUNCH, docks = docksIn(yf) && !st.snow ? DOCKS.filter(D => D.lake === body && !taken[D.j] && occupied(D.ci, yf, day)) : [];
      if (L.lake === body && (!docks.length || hash(day * 7 + slot, body * 13 + 3) < 0.5)) return { x: L.start.x, y: L.start.y, yaw: L.start.yaw, dock: -1 };
      if (docks.length) { const D = docks[(hash(day, slot + body * 5) * docks.length) | 0]; return { x: D.slot.x, y: D.slot.y, yaw: D.slot.yaw, dock: D.j }; }
      const H = homesOn(body).filter(B => occupied(B.ci, yf, day)); if (!H.length) return null;
      const B = H[(hash(day, slot + 17) * H.length) | 0], [ox, oy] = norm2(B.c.out[0], B.c.out[1]), [x, y] = outFrom(B.c.shore[0], B.c.shore[1], ox, oy);
      return { x, y, yaw: Math.atan2(oy, ox), dock: -2 };
    },
    take(j) { if (j >= 0 && j < DOCKS.length) taken[j] = 1; else if (j === -1) launchOut++; },
    release(j) { if (j >= 0 && j < DOCKS.length) taken[j] = 0; else if (j === -1) launchOut = Math.max(0, launchOut - 1); },
    releaseAll() { taken.fill(0); launchOut = 0; },
    // the deck's top (three's y) if (x, y) is on a dock that is in (m: a margin about it — a boat's half-beam), else null
    deckAt(x, y, m = 0) {
      if (!st.in || !shown()) return null;
      for (const D of DOCKS) {
        const rx = x - D.wx, ry = y - D.wy, s = rx * D.dx + ry * D.dy, q = rx * D.px + ry * D.py;
        if (s >= -1.2 - m && s <= D.len + m && Math.abs(q) <= D.hw + m) return D.deckY;
        if (D.head) { const s0 = D.len - D.head.hd; if (Math.abs(s - s0) <= D.head.hd + m && Math.abs(q - D.head.across) <= D.head.hl + m) return D.deckY; }
      }
      return null;
    },
    // an angler's place at the end of a lived-in camp's dock today: { x, y, yaw (out over the water), deckY } or null
    dockSpot(body, yf, day) {
      if (!shown() || !docksIn(yf) || st.snow) return null;
      const C = DOCKS.filter(D => D.lake === body && D.len >= 4 && occupied(D.ci, yf, day)); if (!C.length) return null;
      const D = C[(hash(day, 61) * C.length) | 0], s = D.len - 0.7;
      return { x: D.wx + D.dx * s, y: D.wy + D.dy * s, yaw: Math.atan2(D.dy, D.dx), deckY: D.deckY };
    },
    // where an ice angler walks out from to a hole at (hx, hy): the launch (on Upper, near enough, half the days) or the shore of a camp
    // — one lived in if any is, the nearest the hole; { x, y (on the ice by the shore), inland: [x, y] (back up the land) } or null
    iceStart(body, hx, hy, yf, day, slot) {
      if (!shown()) return null;
      const L = LAUNCH, dL = Math.hypot(hx - L.wx, hy - L.wy);
      // (the nearest camp lived in that day if it is not much farther than the nearest of all — a day visitor comes down any camp's road)
      const H = homesOn(body), near = pool => { let b = null, bd = 1e18; for (const B of pool) { const d = Math.hypot(B.c.shore[0] - hx, B.c.shore[1] - hy); if (d < bd) { bd = d; b = B; } } return [b, bd]; };
      const [b0, d0] = near(H), [b1, d1] = near(H.filter(B => occupied(B.ci, yf, day))), best = b1 && d1 < Math.max(300 * (SMALL ? 0.1 : 1), 1.5 * d0) ? b1 : b0, bd = best === b1 ? d1 : d0;
      if (L.lake === body && (!best || (dL < Math.max(600 * (SMALL ? 0.1 : 1), bd * 2) && hash(day * 5 + slot, 93) < 0.5))) return { x: L.wx + L.ox * 2, y: L.wy + L.oy * 2, inland: L.inland };
      if (!best) return null;
      const [ox, oy] = norm2(best.c.out[0], best.c.out[1]), [sx, sy] = best.c.shore;
      return { x: sx + ox * 1.5, y: sy + oy * 1.5, inland: [sx - ox * 8, sy - oy * 8] };
    },
  };

  // (the eye under the water: the glows — added over what is behind them, the water's underside not hiding them — off)
  const setUnder = u => { glow.visible = !u; };
  return { group, place, update, setSeason, setUnder, hooks, stats: () => ({ buildings: BUILD.length, docks: DOCKS.length, windows: WIN.length, roads: ROADS.length, launchOut, taken: taken.reduce((a, b) => a + b, 0) }) };
}
