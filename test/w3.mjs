// test/w3.mjs — the gate for the 3-D whole-lake sim (src/w3/), built alongside the 2-D one until it reaches parity.
// Run: node test/w3.mjs
import { GEO, BODIES, UPPER, LOWER, BROOK, LAND, cellIndex } from '../src/w3/geometry.js';

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { if (ok) pass++; else fail++; console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const f1 = v => v.toFixed(1), f2 = v => v.toFixed(2);

// ============================================================
//  GEOMETRY — both lakes and the brook at 1/10 of their real size, true depths (src/w3/geometry.js)
// ============================================================
console.log('\n— geometry: the Hot Brook lakes at 1/10 —');
const [U, L, B] = BODIES;
// the real lakes (MDIFW / Lakes of Maine; the measured beds' means 3.05 / 2.67 m) at 1/100 of their area
check('Upper Hot Brook Lake: ~3.6–3.8 ha at 1/10 (real 360–375 ha), mean 3.0–3.4 m, max 5.5 m (18 ft)',
  U.area > 35000 && U.area < 39000 && U.mean > 2.9 && U.mean < 3.4 && Math.abs(U.max - 5.5) < 0.15, `${f2(U.area / 1e4)} ha, mean ${f2(U.mean)} m, max ${f2(U.max)} m`);
check('Lower Hot Brook Lake: ~2.7–2.9 ha (real 277–279 ha), mean 2.6–2.8 m, max ~4 m (13 ft)',
  L.area > 26500 && L.area < 29500 && L.mean > 2.55 && L.mean < 2.85 && Math.abs(L.max - 3.95) < 0.15, `${f2(L.area / 1e4)} ha, mean ${f2(L.mean)} m, max ${f2(L.max)} m`);
check('the brook: ~77 m (half its real 154 m) of shallow channel, with a pool over 1 m deep', Math.abs(GEO.BROOK_LEN - 77) < 3 && B.max > 1.0 && B.max < 1.25 && B.mean < 0.7,
  `${f1(GEO.BROOK_LEN)} m, ${f1(B.area)} m², mean ${f2(B.mean)} m, pool ${f2(B.max)} m`);
// Upper's deepest water is the north basin by its outlet (the 1949 chart's 18-ft hole), Lower's in its southern half
check('Upper\'s deepest point lies in its north basin by the brook\'s mouth (its northern third: within ~100 m of the mouth)', Math.hypot(...U.deepest) < 100, `${f1(Math.hypot(...U.deepest))} m from the mouth`);
// the share of shallow water — what sets the weed beds, the warm shallows and the littoral fish habitat
const shareLE = (b, z) => { let n = 0, s = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === b) { n++; if (GEO.depth[i] <= z) s++; } return s / n; };
check('each lake keeps its real share of water ≤ 3 m (Upper ~44 %, Lower ~57 %)', Math.abs(shareLE(UPPER, 3) - 0.44) < 0.04 && Math.abs(shareLE(LOWER, 3) - 0.57) < 0.04,
  `Upper ${(shareLE(UPPER, 3) * 100).toFixed(0)} %, Lower ${(shareLE(LOWER, 3) * 100).toFixed(0)} %`);

// the water is ONE connected system: a fish (or the through-flow) can go from Upper's inflow to Lower's outlet by the brook
{ const seen = new Uint8Array(GEO.N), q = []; const start = cellIndex(...GEO.INFLOW);
  let s0 = start; if (GEO.body[s0] === LAND) { let best = 1e9; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === UPPER) { const [x, y] = GEO.cellCentre(i), d = Math.hypot(x - GEO.INFLOW[0], y - GEO.INFLOW[1]); if (d < best) { best = d; s0 = i; } } }
  q.push(s0); seen[s0] = 1; let reached = new Set();
  while (q.length) { const i = q.pop(); reached.add(GEO.body[i]); const c = i % GEO.NX, r = (i / GEO.NX) | 0;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const cc = c + dc, rr = r + dr; if (cc < 0 || rr < 0 || cc >= GEO.NX || rr >= GEO.NY) continue; const j = rr * GEO.NX + cc; if (!seen[j] && GEO.body[j] !== LAND) { seen[j] = 1; q.push(j); } } }
  let wet = 0, got = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] !== LAND) { wet++; if (seen[i]) got++; }
  check('one connected water system: from Upper\'s inflow through the brook into Lower (every water cell reachable)', reached.has(UPPER) && reached.has(BROOK) && reached.has(LOWER) && got === wet, `${got}/${wet} water cells reached`); }

// the inflow enters Upper's south end, the outlet leaves Lower's north end (water runs south → north)
check('the inflow is at Upper\'s south end and the outlet at Lower\'s north end', GEO.INFLOW[1] < -250 && GEO.OUTLET[1] > 250, `inflow y ${f1(GEO.INFLOW[1])}, outlet y ${f1(GEO.OUTLET[1])}`);

// the angler's sunfish spots (2026-10-15) land where they should: two on the brook (the pool at its upper mouth — the
// deepest water of the brook — and a shallower stretch) and one in the cove between Upper's two west points (the model's
// cove is 2–3 m: the 1949 soundings barely reach it and the bed there is interpolated — the angler calls it shallow, so its
// real depth is an open question for them)
{ const [pool, run, cove] = GEO.NOTES.map(n => n.xy);
  const bp = GEO.bodyAt(...pool), br = GEO.bodyAt(...run), bc = GEO.bodyAt(...cove);
  check('the angler\'s sunfish spots: the brook\'s upper-mouth pool (≥ 0.9 m), a shallower brook stretch, and the cove between Upper\'s west points (< 3.3 m, ≤ 15 m from shore)',
    bp === BROOK && br === BROOK && GEO.depthAt(...pool) >= 0.9 && GEO.depthAt(...run) < GEO.depthAt(...pool) && bc === UPPER && GEO.depthAt(...cove) < 3.3 && GEO.shoreDist(...cove) <= 15,
    `pool ${f2(GEO.depthAt(...pool))} m, stretch ${f2(GEO.depthAt(...run))} m, cove ${f2(GEO.depthAt(...cove))} m`); }

// the bed is CONTINUOUS through the shoreline (depth → 0 at the water's edge, rising as land behind it): a fish or a plant
// placed by depthAt never meets a cliff at the shore
{ let worst = 0, n = 0;
  for (let i = 0; i < GEO.N; i++) { if (GEO.body[i] === LAND || GEO.shore[i] > GEO.CELL * 1.01) continue; n++; const [x, y] = GEO.cellCentre(i);
    const dIn = GEO.depthAt(x, y); worst = Math.max(worst, dIn); }
  check('the bed is shallow at the water\'s edge (every shore cell < 2.2 m deep — the 1/10 scale steepens real slopes 10×)', worst < 2.2, `${n} shore cells, deepest ${f2(worst)} m`); }
{ // depthAt agrees with the cells at their centres, is negative on land, and inWater respects surface and bed
  let maxErr = 0; for (let i = 0; i < GEO.N; i += 97) { const [x, y] = GEO.cellCentre(i); maxErr = Math.max(maxErr, Math.abs(GEO.depthAt(x, y) - GEO.depth[i])); }
  const [ux, uy] = U.deepest;
  check('depthAt matches the grid at cell centres; land reads as ground above the water; inWater respects the surface and the bed',
    maxErr < 1e-3 && GEO.depthAt(GEO.X0 + 2, GEO.Y0 + 2) < 0 && GEO.inWater(ux, uy, 2) && !GEO.inWater(ux, uy, 6) && !GEO.inWater(ux, uy, -0.1),
    `max centre error ${maxErr.toExponential(1)} m`); }
{ // downhill points toward deeper water a few metres off a shore
  let ok = 0, n = 0; for (let i = 0; i < GEO.N; i += 13) { if (GEO.body[i] !== UPPER || GEO.shore[i] < 4 || GEO.shore[i] > 10) continue; n++; const [x, y] = GEO.cellCentre(i), [dx, dy] = GEO.downhill(x, y);
    if (GEO.depthAt(x + dx * 3, y + dy * 3) > GEO.depthAt(x, y)) ok++; }
  check('downhill() points toward deeper water (near shore, ≥ 90 % of samples)', ok / n > 0.9, `${ok}/${n}`); }
{ // cheap enough to call per fish per step
  const t0 = performance.now(); let s = 0; for (let k = 0; k < 1e6; k++) s += GEO.depthAt(-50 + (k % 997) * 0.1, -150 + (k % 991) * 0.3);
  const ns = (performance.now() - t0) * 1e6 / 1e6;
  check('depthAt costs well under a microsecond (it runs per fish per step)', ns < 300 && Number.isFinite(s), `${ns.toFixed(0)} ns/call`); }

console.log(`\n${pass} PASS, ${fail} FAIL`);
if (fail) { console.log(`${fail} CHECK(S) FAILED`); process.exit(1); }
console.log('W3 OK — the 3-D world\'s checks pass');
process.exit(0);
