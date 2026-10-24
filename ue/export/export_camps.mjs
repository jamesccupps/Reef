// export_camps.mjs — THE CAMPS, DOCKS AND ROADS AT THE HOT BROOK LAKES FOR UNREAL (Node): the people's places as the browser's view
// lays them out (src/w3/render3/camps3view.js LAYOUT, from the verified dataset src/w3/true/camps3d.js — docs/research_notes/Maine
// lake shores and catchment/camps_roads_docks_hot_brook.md), resolved to what a builder needs, for ue/export/build_camps.py to make
// each building and dock a mesh and AHotBrookCamps to stand them on the ground:
//   - each BUILDING: its type (camp, house, garage, shed, trailer, a camp with a trailer), its boxes in the world's metres (x east,
//     y north; a box: centre, angle counter-clockwise from east of its u axis, half its width along u and its length along v) — the
//     body, the trailers, the deck on the water side — its wall height, roof pitch and storeys, its colours (the roof's as the photos
//     show it, the walls a Maine camp's stains and paints), its chimney, porch, door (its wall and place along it) and its water side;
//     and the choices the browser doesn't make, by the same per-building hash: the siding (lap boards, vertical boards, logs), the
//     roof (painted steel or asphalt shingles, as its colour reads), the chimney's masonry;
//   - each DOCK: its waterline, heading, length and width, wood or aluminium, an L or T at its end, the boat's place alongside;
//   - the ROADS: their kind (paved, gravel, track), width, the camp roads' grassy crown, their polylines;
//   - THE CLEARED GROUND (camps3view clearedAt: the footprints and yards, the paths to the water, the docks' feet, the roads, the
//     beaches, the launch) as a 1-m raster, where AHotBrookGroundCover grows nothing (the forest's own export clears its trees).
// Out: Import/camps.json and Import/cleared.bin ("HBC1", int32 nx, ny, float64 x0, y0 — the sim's metres, cell 1 m — then
// nx × ny bits, rows from the south, each row's bits from the west, 1 = cleared). Cosmetic choices only: the browser's hash, never the sim's random stream.
//   HB_WORLD=true node ue/export/export_camps.mjs [out dir]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
if (process.env.HB_WORLD !== 'true') { console.error('run with HB_WORLD=true'); process.exit(1); }
const { LAYOUT } = await import('../../src/w3/render3/camps3view.js');
const { BUILD, DOCKS, ROADS, walls } = LAYOUT;
const { clearedAt } = await import('../../src/w3/render3/camps3view.js');
const { FAR3 } = await import('../../src/w3/true/far3d.js');
const { hash } = await import('../../src/w3/render3/wild3kit.js');
const OUT = process.argv[2] || 'G:/HotBrookUE/Import';
const r2 = v => Math.round(v * 100) / 100, r4 = v => Math.round(v * 10000) / 10000;
const box = o => o ? [r2(o.cx), r2(o.cy), r4(o.a), r2(o.hw), r2(o.hl)] : null;
const hex = c => '#' + c.toString(16).padStart(6, '0');
const DARK = new Set([0x6b4a30, 0x7c5a3a, 0x8a6a48, 0x6e5a44, 0x4a5a44]);

const lampOf = (B, W) => {
  if (!B.porch) return null;
  if (B.body) { const w = W[B.dside], s = w[6] * 2 * B.dOff + 0.75; return [r2(w[2] + w[4] * s + w[0] * 0.3), r2(w[3] + w[5] * s + w[1] * 0.3), 2.25]; }
  const U = B.units[0]; if (!U) return null; const w = walls(U)[B.dside]; return [r2(w[2] + w[4] * w[6] * 0.35 + w[0] * 0.35), r2(w[3] + w[5] * w[6] * 0.35 + w[1] * 0.35), 2.2];
};
const buildings = BUILD.map(B => {
  const h = B.h, c = B.c;
  // the siding: a stained camp of boards or logs, a painted one of lap boards (clapboard or vinyl) — trailers their own
  const siding = B.type === 'trailer' ? 'trailer' : DARK.has(B.wall) ? (h(30) < 0.2 ? 'log' : h(30) < 0.62 ? 'board' : 'lap') : (h(30) < 0.78 ? 'lap' : 'board');
  // the roof: steel where the photos show a colour (teal, red, green, maroon, white), shingles mostly where dark, either where grey
  const roofMat = ['teal', 'red', 'green', 'maroon', 'white', 'light'].includes(c.roof) ? 'metal' : c.roof === 'grey' ? (h(32) < 0.5 ? 'metal' : 'shingle') : (h(32) < 0.25 ? 'metal' : 'shingle');
  const doorCol = B.type === 'garage' ? (hash(B.ci, 5) < 0.5 ? 0xd8d6d0 : B.wall) : B.type === 'shed' ? (B.wall === 0x8a8880 ? 0x6a6a66 : 0x4a3a2a) : [0x5a3a26, 0x7a2a22, 0x3a4a5a, 0x4a3a2a][(h(17) * 4) | 0];
  const o = B.body || B.units[0], W = walls(o);
  return {
    id: c.id, ci: B.ci, type: B.type, kind: c.kind, home: B.home, lake: B.lake, toWater: c.toWater,
    anchor: [r2(o.cx), r2(o.cy)],
    body: box(B.body), units: B.units.map(box), deck: box(B.deck),
    H: r2(B.H), pitch: r4(B.pitch ?? 0.4), flat: !!B.flat, storeys: B.storeys, barn: c.kind.includes('barn'),
    wall: hex(B.wall), roof: hex(B.roof), roofName: c.roof, trim: hex(B.trim), found: hex(B.found), deckC: hex(B.deckC), door: hex(doorCol),
    siding, roofMat, foundMat: h(33) < 0.7 ? 'block' : 'stone',
    chim: B.chim, chimSide: h(10) < 0.5 ? 1 : -1, chimMat: h(9) < 0.6 ? 'brick' : 'stone',
    porch: !!B.porch, wside: B.wside, dside: B.dside, dOff: r4(B.dOff),
    // (the walls' outward normals and middles, in the order wside/dside index: [nx, ny, cx, cy, tx, ty, half-length])
    walls: W.map(w => w.map(r4)),
    shutters: !DARK.has(B.wall) && B.type !== 'shed' && B.type !== 'garage' && h(34) < 0.35,
    yr: !!c.yr,
    // (its porch lamp, as camps3view's planOpenings hangs it: by the door, ~2.2 m over the floor; lit all night at some)
    lamp: lampOf(B, W), lampAll: hash(B.ci, 77) < 0.3,
  };
});

const docks = DOCKS.map(D => ({
  j: D.j, camp: buildings.find(b => b.ci === D.ci)?.id ?? null, lake: D.lake,
  w: [r2(D.wx), r2(D.wy)], dir: [r4(D.dx), r4(D.dy)], len: r2(D.len), hw: r2(D.hw), alu: D.alu,
  head: D.head ? { across: r2(D.head.across), hl: r2(D.head.hl), hd: r2(D.head.hd) } : null,
  boat: D.boat, slot: D.slot ? [r2(D.slot.x), r2(D.slot.y), r4(D.slot.yaw)] : null,
  canoe: D.canoe ? { kind: D.canoe.kind, onDeck: D.canoe.onDeck, at: [r2(D.canoe.x), r2(D.canoe.y), r4(D.canoe.yaw)] } : null,
  light: D.light,
  // (out of season: its sections stacked on the bank, the boat turned over beside them — camps3view's D.store, D.flip)
  store: [r2(D.store.x), r2(D.store.y), r4(D.store.yaw)], flip: [r2(D.flip.x), r2(D.flip.y), r4(D.flip.yaw)],
}));

// the lawns the dataset maps (tools/hotbrook/data/camps_roads.json, kept out of the repository: each a point and an area — a disc of
// that area there, the land of it; cleared below and drawn as mown grass by AHotBrookCamps)
const lawns = [];
try {
  const data = JSON.parse(readFileSync(new URL('../../tools/hotbrook/data/camps_roads.json', import.meta.url), 'utf8'));
  const model = JSON.parse(readFileSync(new URL('../../tools/hotbrook/data/hotbrook_model.json', import.meta.url), 'utf8'));
  const { lat0, lon0, mx, my } = model.meta, P0 = model.streams.find(s => s.name.includes('connecting')).pts[0];
  for (const L of data.lawns || []) lawns.push({ x: r2((L.lon - lon0) * mx - P0[0]), y: r2((L.lat - lat0) * my - P0[1]), r: r2(Math.sqrt((L.area_m2_est || 500) / Math.PI)) });
} catch (e) { console.log('(no lawns: ' + e.message + ')'); }
const onLawn = (x, y) => lawns.some(L => (x - L.x) ** 2 + (y - L.y) ** 2 < L.r * L.r);

const roads = ROADS.map(R => ({ id: R.id, kind: R.kind, town: R.town, crown: R.crown, width: R.width, pts: R.pts.map(p => [r2(p[0]), r2(p[1])]) }));

writeFileSync(join(OUT, 'camps.json'), JSON.stringify({ built: 'ue/export/export_camps.mjs', buildings, docks, roads, lawns }));
const by = {}; for (const b of buildings) by[b.type] = (by[b.type] || 0) + 1;
console.log(`camps.json: ${buildings.length} buildings ${JSON.stringify(by)}, ${docks.length} docks, ${roads.length} roads`);

// the cleared ground: the far land's extent at 1 m
{
  const x0 = Math.floor(FAR3.X0), y0 = Math.floor(FAR3.Y0), nx = Math.ceil(FAR3.NX * FAR3.CELL), ny = Math.ceil(FAR3.NY * FAR3.CELL);
  const rowBytes = Math.ceil(nx / 8), bits = new Uint8Array(rowBytes * ny); let n = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (clearedAt(x0 + i + 0.5, y0 + j + 0.5) || onLawn(x0 + i + 0.5, y0 + j + 0.5)) { bits[j * rowBytes + (i >> 3)] |= 1 << (i & 7); n++; }
  const head = Buffer.alloc(28); head.write('HBC1', 0, 'ascii'); head.writeInt32LE(nx, 4); head.writeInt32LE(ny, 8); head.writeDoubleLE(x0, 12); head.writeDoubleLE(y0, 20);
  writeFileSync(join(OUT, 'cleared.bin'), Buffer.concat([head, Buffer.from(bits)]));
  console.log(`cleared.bin: ${nx} x ${ny} m from (${x0}, ${y0}), ${(n / 1e4).toFixed(1)} ha cleared`);
}
