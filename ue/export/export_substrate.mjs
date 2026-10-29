// export_substrate.mjs — THE LAKES' BED AND SHORES FOR UNREAL (Node; the pure modules only): the sim's substrate map (src/w3/geometry.js
// GEO.sub — per 5-m cell the shares of boulder–cobble, gravel, sand and organic muck, mud the rest, from each spot's wave exposure:
// tools/hotbrook/build_substrate3.py) over the water grid, for M_Ground (the bed's and the shore's surface: cobble, gravel, sand, muck)
// and AHotBrookGroundCover (the shores' and the shallows' stones and boulders):
//   - substrate.png: RGBA 8-bit, one pixel a cell of the water grid (water.bin's), row 0 the SOUTH row — R rock, G gravel, B sand,
//     A organic muck; the land cells within 4 cells of the water given the mean of the wet cells about them (the shore above the
//     waterline as the bed below it: a beach's sand runs up it, a boulder shore's stones); farther land 0 (the forest floor's own);
//   - substrate.bin: "HBU1", int32 nx, ny, float32 x0, y0, cell (m), then the same bytes (rock, gravel, sand, muck a cell, rows from
//     the south) for the C++ side; plus substrate.json (its extent, for the material);
//   - waterlevel.png: 8-bit grey over the same grid, each cell's local water level (GEO.level: a lake's or the brook's surface, on land
//     the nearer water's) as cm above 127.5 m — Upper 143, Lower 73 —, so M_Ground's shore band stands its own height above the
//     water beside it at either lake (a fixed height had it ~1 m tall at Upper and ~1.7 m at Lower).
//   HB_WORLD=true node ue/export/export_substrate.mjs [out dir, default G:/HotBrookUE/Import]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
if (process.env.HB_WORLD !== 'true') { console.error('run with HB_WORLD=true (the true-size world)'); process.exit(1); }
const { GEO, LAND } = await import('../../src/w3/geometry.js');
const OUT = process.argv[2] || 'G:/HotBrookUE/Import';
const { NX, NY } = GEO, S = GEO.subData, px = new Uint8Array(NX * NY * 4), wet = new Uint8Array(NX * NY);
for (let i = 0; i < NX * NY; i++) if (GEO.body[i] !== LAND && GEO.depth[i] > 0) { wet[i] = 1; px[i * 4] = S.rock[i]; px[i * 4 + 1] = S.grav[i]; px[i * 4 + 2] = S.sand[i]; px[i * 4 + 3] = S.org[i]; }
// the shore above the waterline: four rings of land cells, each the mean of its already-set neighbours
let set = wet.slice(), shore = 0;
for (let ring = 0; ring < 4; ring++) {
  const next = set.slice();
  for (let r = 0; r < NY; r++) for (let q = 0; q < NX; q++) {
    const i = r * NX + q; if (set[i]) continue;
    const acc = [0, 0, 0, 0]; let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dq = -1; dq <= 1; dq++) {
      const qq = q + dq, rr = r + dr; if (qq < 0 || rr < 0 || qq >= NX || rr >= NY) continue; const j = rr * NX + qq;
      if (set[j]) { for (let c = 0; c < 4; c++) acc[c] += px[j * 4 + c]; n++; }
    }
    if (n) { for (let c = 0; c < 4; c++) px[i * 4 + c] = Math.round(acc[c] / n); next[i] = 1; shore++; }
  }
  set = next;
}
// the PNG (RGBA, rows top-first in the file: our row 0, the south, first — the material reads v from the south)
const raw = Buffer.alloc(NY * (1 + NX * 4));
for (let r = 0; r < NY; r++) { raw[r * (1 + NX * 4)] = 0; Buffer.from(px.buffer, r * NX * 4, NX * 4).copy(raw, r * (1 + NX * 4) + 1); }
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(NX, 0); ihdr.writeUInt32BE(NY, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
writeFileSync(join(OUT, 'substrate.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
const lraw = Buffer.alloc(NY * (1 + NX));
for (let r = 0; r < NY; r++) { lraw[r * (1 + NX)] = 0; for (let q = 0; q < NX; q++) lraw[r * (1 + NX) + 1 + q] = Math.max(0, Math.min(255, Math.round((GEO.level[r * NX + q] - 127.5) * 100))); }
const lhdr = Buffer.alloc(13); lhdr.writeUInt32BE(NX, 0); lhdr.writeUInt32BE(NY, 4); lhdr[8] = 8; lhdr[9] = 0;
writeFileSync(join(OUT, 'waterlevel.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', lhdr), chunk('IDAT', zlib.deflateSync(lraw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
const head = Buffer.alloc(24); head.write('HBU1', 0, 'ascii'); head.writeInt32LE(NX, 4); head.writeInt32LE(NY, 8); head.writeFloatLE(GEO.X0, 12); head.writeFloatLE(GEO.Y0, 16); head.writeFloatLE(GEO.CELL, 20);
writeFileSync(join(OUT, 'substrate.bin'), Buffer.concat([head, Buffer.from(px.buffer)]));
writeFileSync(join(OUT, 'substrate.json'), JSON.stringify({ nx: NX, ny: NY, x0: GEO.X0, y0: GEO.Y0, cell: GEO.CELL, note: 'RGBA = rock, gravel, sand, organic muck (0-255); row 0 the south; land within 4 cells of the water its neighbours\' mean' }, null, 1));
let wn = 0; for (let i = 0; i < NX * NY; i++) wn += wet[i];
console.log(`substrate ${NX}x${NY} cells at ${GEO.CELL} m: ${wn} wet, ${shore} shore cells given the water's → ${OUT}`);
