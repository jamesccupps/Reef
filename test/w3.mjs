// test/w3.mjs — the gate for the 3-D whole-lake sim (src/w3/), built alongside the 2-D one until it reaches parity.
// Run: node test/w3.mjs
import { GEO, BODIES, UPPER, LOWER, BROOK, LAND, cellIndex, WORLD_TRUE } from '../src/w3/geometry.js';
// (TRUE SCALE T2: HB_WORLD=true runs the sections on the true-size lakes — the water model's columns asked for in REAL metres:
// CS = 10 × the world's scale, so `col: 10 * CS` is 100 m real in either world)
const CS = 10 * GEO.SCALE;

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { if (ok) pass++; else fail++; console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const f1 = v => v.toFixed(1), f2 = v => v.toFixed(2);
// W3_ONLY=foodweb,plants runs only those sections (env chem core young forage foodweb plants; the geometry always) — for
// iterating on one; the gate runs them all
const ONLY = (process.env.W3_ONLY || '').split(',').filter(Boolean), run = k => !ONLY.length || ONLY.includes(k);
// TIME (stage R2): sim time is REAL seconds (src/w3/clock3.js). The gate runs the COARSE rung (stage R3): a fish step is a
// block of FB s (one decision, then the fish goes where its drives and brain point), a water step EW s — the 1-hour year's
// calendar resolution of feeding and the water (docs/W3_REALTIME_AUDIT.md §6.3); OLD is the 1-hour year's real seconds per sim second, for the checks
// still written in its terms
const OLD = 8760, FB = 0.2 * OLD, FM = 0.1, EW = 0.2 * OLD, DAYS = 86400;   // (a fish block and a water step: 1,752 s each)

// ============================================================
//  GEOMETRY — both lakes and the brook at 1/10 of their real size, true depths (src/w3/geometry.js)
// ============================================================
console.log('\n— geometry: the Hot Brook lakes at 1/10 —');
const [U, L, B] = BODIES;
if (!WORLD_TRUE) {   // (the 1/10 world's own checks; on the true world the `true` section checks the geometry)
// the real lakes (MDIFW / Lakes of Maine; the measured beds' means 3.05 / 2.67 m) at 1/100 of their area
check('Upper Hot Brook Lake: ~3.6–3.8 ha at 1/10 (real 360–375 ha), mean 3.0–3.4 m, max 5.5 m (18 ft)',
  U.area > 35000 && U.area < 39000 && U.mean > 2.9 && U.mean < 3.4 && Math.abs(U.max - 5.5) < 0.15, `${f2(U.area / 1e4)} ha, mean ${f2(U.mean)} m, max ${f2(U.max)} m`);
// (Lower's mean: MDIFW's 2.74 m is the 1949 survey's, whose soundings never reached the shore; the shallow shelf measured from
// the aerial photos — tools/hotbrook/shallows.py, its edge at the human's "chest height where the water gets darker" — is broad
// in Lower, 17 % of it ≤ 1 m, which brings the mean to ~2.55)
check('Lower Hot Brook Lake: ~2.7–2.9 ha (real 277–279 ha), mean 2.45–2.8 m, max ~4 m (13 ft)',
  L.area > 26500 && L.area < 29500 && L.mean > 2.45 && L.mean < 2.85 && Math.abs(L.max - 3.95) < 0.15, `${f2(L.area / 1e4)} ha, mean ${f2(L.mean)} m, max ${f2(L.max)} m`);
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
}

// ============================================================
//  GEOMETRY AT TRUE SCALE (docs/TRUE_SCALE.md T1) — the same lakes at their real size: 5-m cells (the 0–1.3 m shelf is often
//  under 15 m wide), the brook its real 154 m and ~8 m wide carved through the grid; src/w3/true/hotbrook3d.js through
//  makeGeometry (the sim still runs the 1/10 world until T2–T3)
// ============================================================
console.log('\n— geometry: the Hot Brook lakes at TRUE SCALE (T1) —');
if (run('true')) {
  const { makeGeometry } = await import('../src/w3/geometry.js');
  const t0 = performance.now(), { HB3: HBT } = await import('../src/w3/true/hotbrook3d.js'), W = makeGeometry(HBT), tMs = performance.now() - t0;
  const TG = W.GEO, [TU, TL, TBk] = W.BODIES;
  check('true scale: Upper Hot Brook Lake 360–375 ha (MDIFW 360, the lidar 369), mean 2.9–3.4 m, max 5.5 m (18 ft); 5-m cells',
    TG.CELL === 5 && TU.area > 3.6e6 && TU.area < 3.75e6 && TU.mean > 2.9 && TU.mean < 3.4 && Math.abs(TU.max - 5.5) < 0.15,
    `${f1(TU.area / 1e4)} ha, mean ${f2(TU.mean)} m, max ${f2(TU.max)} m; grid ${TG.NX} × ${TG.NY} (${(TG.N / 1e3).toFixed(0)}k cells) built in ${tMs.toFixed(0)} ms`);
  // (the deepest sounding resolved: 4.1 m where the 15-m cells averaged it to 3.9; MDIFW's max 13 ft ≈ 4.0)
  check('true scale: Lower Hot Brook Lake 270–280 ha (MDIFW 277, the lidar 274), mean 2.45–2.85 m, max ~4 m (13 ft)',
    TL.area > 2.7e6 && TL.area < 2.8e6 && TL.mean > 2.45 && TL.mean < 2.85 && Math.abs(TL.max - 4.0) < 0.2, `${f1(TL.area / 1e4)} ha, mean ${f2(TL.mean)} m, max ${f2(TL.max)} m`);
  check('true scale: the brook its real ~154 m, a channel ~8 m wide (on 5-m cells: 6–14 m), shallow, with the pool at its upper mouth over 1 m',
    Math.abs(TG.BROOK_LEN - 154) < 6 && TBk.area / TG.BROOK_LEN > 6 && TBk.area / TG.BROOK_LEN < 14 && TBk.max > 1.0 && TBk.max < 1.25 && TBk.mean < 0.7,
    `${f1(TG.BROOK_LEN)} m, ${f1(TBk.area / TG.BROOK_LEN)} m wide on average (${TBk.cells} cells), mean ${f2(TBk.mean)} m, pool ${f2(TBk.max)} m`);
  check('true scale: Upper\'s deepest point lies in its north basin by the brook\'s mouth (within ~1 km)', Math.hypot(...TU.deepest) < 1000, `${f1(Math.hypot(...TU.deepest))} m from the mouth`);
  const shareT = (b, z) => { let n = 0, s = 0; for (let i = 0; i < TG.N; i++) if (TG.body[i] === b) { n++; if (TG.depth[i] <= z) s++; } return s / n; };
  // (the shelf the aerial photos measured — tools/hotbrook/shallows.py at 5 m — is the visible-bottom band to its 1.3-m edge)
  check('true scale: each lake keeps its share of water ≤ 3 m (Upper ~44 %, Lower ~55 %) and the photos\' shelf ≤ 1 m (8–22 %)',
    Math.abs(shareT(UPPER, 3) - 0.44) < 0.04 && Math.abs(shareT(LOWER, 3) - 0.56) < 0.04 && [UPPER, LOWER].every(b => shareT(b, 1) > 0.08 && shareT(b, 1) < 0.22),
    `≤ 3 m: Upper ${(shareT(UPPER, 3) * 100).toFixed(0)} %, Lower ${(shareT(LOWER, 3) * 100).toFixed(0)} %; ≤ 1 m: ${(shareT(UPPER, 1) * 100).toFixed(0)} %, ${(shareT(LOWER, 1) * 100).toFixed(0)} %`);
  { const seen = new Uint8Array(TG.N), q = []; let s0 = W.cellIndex(...TG.INFLOW);
    if (s0 < 0 || TG.body[s0] === LAND) { let best = 1e9; for (let i = 0; i < TG.N; i++) if (TG.body[i] === UPPER) { const [x, y] = TG.cellCentre(i), d = Math.hypot(x - TG.INFLOW[0], y - TG.INFLOW[1]); if (d < best) { best = d; s0 = i; } } }
    q.push(s0); seen[s0] = 1; const reached = new Set();
    while (q.length) { const i = q.pop(); reached.add(TG.body[i]); const c = i % TG.NX, r = (i / TG.NX) | 0;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const cc = c + dc, rr = r + dr; if (cc < 0 || rr < 0 || cc >= TG.NX || rr >= TG.NY) continue; const j = rr * TG.NX + cc; if (!seen[j] && TG.body[j] !== LAND) { seen[j] = 1; q.push(j); } } }
    let wet = 0, got = 0; for (let i = 0; i < TG.N; i++) if (TG.body[i] !== LAND) { wet++; if (seen[i]) got++; }
    check('true scale: one connected water system, Upper\'s inflow through the brook to Lower (every water cell reachable); inflow at Upper\'s south end, outlet at Lower\'s north',
      reached.has(UPPER) && reached.has(BROOK) && reached.has(LOWER) && got === wet && TG.INFLOW[1] < -2500 && TG.OUTLET[1] > 2500, `${got}/${wet} water cells; inflow y ${f1(TG.INFLOW[1])}, outlet y ${f1(TG.OUTLET[1])}`); }
  { const [pool, stretch, cove] = TG.NOTES.map(n => n.xy);
    check('true scale: the angler\'s sunfish spots — the brook\'s upper-mouth pool (≥ 0.9 m), a shallower stretch, the cove between Upper\'s west points (< 3.3 m, ≤ 150 m from shore)',
      TG.bodyAt(...pool) === BROOK && TG.bodyAt(...stretch) === BROOK && TG.depthAt(...pool) >= 0.9 && TG.depthAt(...stretch) < TG.depthAt(...pool) && TG.bodyAt(...cove) === UPPER && TG.depthAt(...cove) < 3.3 && TG.shoreDist(...cove) <= 150,
      `pool ${f2(TG.depthAt(...pool))} m, stretch ${f2(TG.depthAt(...stretch))} m, cove ${f2(TG.depthAt(...cove))} m (${f1(TG.shoreDist(...cove))} m from shore)`); }
  // at true scale the slopes are real: the water by the shore (within a cell) is shallow — the shore taper and the photos' band
  { let worst = 0, n = 0, sum = 0; for (let i = 0; i < TG.N; i++) { if (TG.body[i] !== UPPER && TG.body[i] !== LOWER || TG.shore[i] > TG.CELL * 1.01) continue; n++; sum += TG.depth[i]; worst = Math.max(worst, TG.depth[i]); }
    check('true scale: the water at the shore is shallow (the shore cells ≤ 1.5 m, averaging under 0.6 m)', worst <= 1.5 && sum / n < 0.6, `${n} shore cells, mean ${f2(sum / n)} m, deepest ${f2(worst)} m`); }
  { let maxErr = 0; for (let i = 0; i < TG.N; i += 97) { const [x, y] = TG.cellCentre(i); maxErr = Math.max(maxErr, Math.abs(TG.depthAt(x, y) - TG.depth[i])); }
    const t1 = performance.now(); let s = 0; for (let k = 0; k < 1e6; k++) s += TG.depthAt(-500 + (k % 997), -1500 + (k % 991) * 3); const ns = (performance.now() - t1);
    check('true scale: depthAt matches the grid at cell centres and costs well under a microsecond', maxErr < 1e-3 && ns < 300 && Number.isFinite(s), `max centre error ${maxErr.toExponential(1)} m, ${ns.toFixed(0)} ns/call`); }
}

// ============================================================
//  ENVIRONMENT 3-D, slice 1 — columns, temperature, ice, the water's movement (src/w3/env3.js)
// ============================================================
console.log('\n— environment 3-D: columns, temperature, ice, transport —');
if (run('env')) {
  const { Env3, H3, REAL_S, CLOCK3 } = await import('../src/w3/env3.js');
  const { seed } = await import('../src/core.js');
  seed(301); const e = new Env3(); const G = e.G;
  // the grid holds the lakes' true water: the layer cells' volumes sum to the beds' volume (every 1.5-m cell counted once)
  let vGeo = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] !== LAND && GEO.depth[i] > 0) vGeo += GEO.depth[i] * GEO.CELL * GEO.CELL;
  let vGrid = 0; for (let j = 0; j < G.NCELL; j++) vGrid += G.vol[j];
  check('the water columns hold the lakes\' true volume (5-m columns × 0.5-m layers built from the 1.5-m beds)', Math.abs(vGrid - vGeo) / vGeo < 0.005 && G.NC > 2000 && G.NC < 3200,
    `${G.NC} columns, ${G.NCELL} cells, ${(vGrid / 1e3).toFixed(1)} vs ${(vGeo / 1e3).toFixed(1)} thousand m³`);
  { const par = Int32Array.from({ length: G.NC }, (_, i) => i), find = i => { while (par[i] !== i) i = par[i] = par[par[i]]; return i; };
    for (let f = 0; f < G.NF; f++) par[find(G.fa[f])] = find(G.fb[f]); const roots = new Set(); for (let c = 0; c < G.NC; c++) roots.add(find(c));
    check('the columns form one connected water system (Upper ↔ the brook ↔ Lower)', roots.size === 1, `${roots.size} component(s)`); }
  // (TRUE SCALE T2: an 8-m brook in 50-m columns would vanish into its banks' — it has its own stretches, ~20 m each, the pool's
  // and the riffles' depths kept, with no wind gyre through them)
  if (WORLD_TRUE) { const bc = []; for (let c = 0; c < G.NC; c++) if (G.body[c] === BROOK) bc.push(c);
    const fw = []; for (let f = 0; f < G.NF; f++) if (G.fBrook[f]) fw.push(Math.abs(e.ux[f]) + Math.abs(e.uy[f]));
    const pool = e.colAt(...GEO.NOTES[0].xy), dm = bc.map(c => G.depthMax[c]);
    check("true scale: the brook keeps its own water — ≥ 6 stretches of its own columns along its 154 m, its pool (> 0.9 m) and its riffles (< 0.5 m), no wind gyre through it; the angler's pool lies in it",
      bc.length >= 6 && Math.max(...dm) > 0.9 && Math.min(...dm) < 0.5 && fw.every(v => v === 0) && G.body[pool] === BROOK,
      `${bc.length} stretches, deepest ${f2(Math.max(...dm))} m, shallowest ${f2(Math.min(...dm))} m; ${fw.length} brook faces`); }
  // the wind's circulation: balanced in every column, two gyres — downwind over the shallows, upwind over the deep axis
  { let worst = 0, tot = 0; const net = new Float64Array(G.NC);
    for (let f = 0; f < G.NF; f++) { const Q = e.ux[f] * G.fh[f] * G.fl[f]; net[G.fa[f]] -= Q; net[G.fb[f]] += Q; tot += Math.abs(Q); }
    for (let c = 0; c < G.NC; c++) worst = Math.max(worst, Math.abs(net[c])); worst /= tot / G.NF;
    let sh = 0, deep = 0; for (let f = 0; f < G.NF; f++) { const Q = e.ux[f] * G.fh[f] * G.fl[f] * G.fnx[f]; if (G.fh[f] < 1.5) sh += Q; if (G.fh[f] > 3.5) deep += Q; }
    check('the wind\'s circulation balances in every column and has two gyres: downwind over the shallows, back upwind over the deep axis',
      worst < 1e-2 && sh > 0 && deep < 0, `imbalance ${worst.toExponential(1)} of a mean face flux; east wind: shallows ${sh.toFixed(1)}, deep ${deep.toFixed(1)} (transport east)`); }
  // transport moves things without making or losing them: a uniform field stays uniform; a dye's total is kept
  { e.step(FB); const save = Float32Array.from(e.temp); let dev = 0;
    for (const w of [0, 1, 2, 3]) { e.setWeather(w); e.temp.fill(13); e._transport(FB); for (let j = 0; j < G.NCELL; j++) dev = Math.max(dev, Math.abs(e.temp[j] - 13)); }
    const dye = new Float32Array(G.NCELL); for (let j = 0; j < G.NCELL; j++) dye[j] = (G.colOfCell[j] * 7919 % 13) / 13;
    const tot0 = e.total(dye), dfd = { a: dye }; e.setWeather(2);
    for (let i = 0; i < 5; i++) { for (let s = 0; s < e.nSub; s++) e._advect(dfd, e._F, FB / e.nSub); e._mixH(dye, FB); }
    const kept = Math.abs(e.total(dye) - tot0) / tot0;
    e.temp.set(save);
    check('transport moves water without making or losing anything: a uniform field stays uniform (every weather); a dye\'s total is kept',
      dev < 0.02 && kept < 1e-5, `uniform within ${dev.toFixed(4)} °C; dye total changed ${kept.toExponential(1)}`); }
  // the through-flow flushes each lake at its residence time. At steady state the water LEAVING a lake is as old as its
  // residence (age in = 0: a mass balance), however mixed the lake is; its mean age lies between plug flow (τ/2) and full
  // mixing (τ) — Upper is 3.4 km long with its inflow and outlet at opposite ends. Tested with residences 10× shorter (~6τ)
  { const keep = [H3.RES_UPPER_D, H3.RES_LOWER_D]; H3.RES_UPPER_D = 10; H3.RES_LOWER_D = 5.5;
    seed(302); const f = new Env3({ yf0: 0.4 }); f.age.fill(0); const day = 86400 / REAL_S;
    for (let t = 0; t < 60 * day; t += 0.25 * OLD) f.step(0.25 * OLD);
    const colMean = c => { let s = 0, v = 0; for (let k = 0; k < f.G.nL[c]; k++) { const j = f.G.cell0[c] + k; s += f.age[j] * f.G.vol[j]; v += f.G.vol[j]; } return s / v; };
    let bc = -1, bd = 1e9; for (let c = 0; c < f.G.NC; c++) if (f.G.body[c] === BROOK) { const d = Math.hypot(f.G.cx[c], f.G.cy[c]); if (d < bd) { bd = d; bc = c; } }   // the brook's first column: Upper's outflow
    const out = colMean(bc) / day, aU = f.mean(f.age, UPPER) / day;
    H3.RES_UPPER_D = keep[0]; H3.RES_LOWER_D = keep[1];
    check('the through-flow flushes each lake at its residence time: the water leaving Upper is as old as its residence; its mean age lies between plug flow (τ/2) and full mixing (τ)',
      Math.abs(out - 10) < 2 && aU > 5 && aU < 10.5, `water entering the brook ${out.toFixed(1)} d (residence 10); Upper's mean ${aU.toFixed(1)} d`); }
  // temperature: shallow water swings more through the day — warmer by afternoon, colder by dawn — than the basin
  { seed(303); const f = new Env3({ yf0: 0.38 }); f.setWeather(0);
    const shallow = [], deep = []; for (let c = 0; c < f.G.NC; c++) { if (f.G.depthMax[c] < 0.9 && f.G.body[c] !== BROOK) shallow.push(c); if (f.G.depthMax[c] > 4.5) deep.push(c); }
    const meanT = cols => cols.reduce((s, c) => s + f.temp[f.G.cell0[c]], 0) / cols.length;
    let maxD = -9, minD = 9; for (let t = 0; t < CLOCK3.DAY_LEN * 2; t += FB) { f.step(FB); if (t > CLOCK3.DAY_LEN) { const d = meanT(shallow) - meanT(deep); maxD = Math.max(maxD, d); minD = Math.min(minD, d); } }
    check('the coves\' water swings more through the day than the basin\'s: warmer by afternoon, colder by dawn (they siphon down on calm nights)',
      maxD > 0.6 && minD < -0.3, `shallow − deep surface: +${maxD.toFixed(2)} by day, ${minD.toFixed(2)} by night (${shallow.length} cove columns, ${deep.length} deep)`); }
  // summer: the lakes don't stay stratified — wind by day and convection by night mix the 5.5-m north basin (MDIFW: "does
  // not stratify during summer months"; the 1949 August survey: 74 °F at the surface, ~71 °F at the bottom)
  { seed(304); const f = new Env3({ yf0: 0.42 }); let dmax = 0, dsum = 0, n = 0; const c = f.colAt(...BODIES[0].deepest), j0 = f.G.cell0[c], jb = j0 + f.G.nL[c] - 1;
    for (let t = 0; t < CLOCK3.DAY_LEN * 3; t += FB) { f.step(FB); const d = f.temp[j0] - f.temp[jb]; dmax = Math.max(dmax, d); dsum += d; n++; }
    check('summer: Upper\'s 5.5-m basin doesn\'t stay stratified (surface − bottom small on average, a degree or two at most)', dsum / n < 1.2 && dmax < 3.5,
      `mean ${(dsum / n).toFixed(2)} °C, max ${dmax.toFixed(2)} °C over three days`); }
  // ice: the shallow coves freeze first; under the ice the water is inversely layered (~0 °C at the ice, ~4 °C at the bottom)
  { seed(305); const f = new Env3({ yf0: 0.69 }); let firstDepth = null, allT = null;
    for (let t = 0; t < 0.14 * CLOCK3.YEAR_LEN && allT === null; t += EW) {
      f.step(EW);
      if (firstDepth === null) for (let c = 0; c < f.G.NC; c++) if (f.ice[c] > 0.5) { firstDepth = f.G.depthMean[c]; break; }
      if (firstDepth !== null && f.iceMean > 0.99) allT = f.yearFrac();
    }
    const c = f.colAt(...BODIES[0].deepest), j0 = f.G.cell0[c], jb = j0 + f.G.nL[c] - 1; while (f.yearFrac() < 0.86) f.step(0.25 * OLD);   // (to January: the deep water warms toward 4 °C over weeks from the bed's stored heat)
    const medDepth = [...f.G.depthMean].sort((a, b) => a - b)[f.G.NC >> 1];
    check('ice: the shallows freeze first and the whole lake follows by early December; by January the water under it is inversely layered — ~0 °C at the ice, ~4 °C at the bottom of the basin',
      firstDepth !== null && firstDepth < medDepth && allT !== null && allT < 0.8 && f.temp[j0] < 1.5 && f.temp[jb] > 3, `first ice over ${firstDepth?.toFixed(2)} m (median column ${medDepth.toFixed(2)} m), all frozen at yf ${allT?.toFixed(3)}; top ${f.temp[j0].toFixed(2)} °C, bottom ${f.temp[jb].toFixed(2)} °C`); }
  // the night siphon: on a calm night the coves' colder water runs down into the basin — a dye from the coves reaches its deep layers
  { seed(306); const f = new Env3({ yf0: 0.6 }); f.setWeather(0);
    while (!f.isNight()) f.step(FB);
    const dye = new Float32Array(f.G.NCELL); for (let c = 0; c < f.G.NC; c++) if (f.G.depthMax[c] < 1.0) for (let k = 0; k < f.G.nL[c]; k++) dye[f.G.cell0[c] + k] = 1;
    f.fields.push({ name: 'dye', a: dye }); const tot0 = f.total(dye); let q = 0, n = 0;
    for (let t = 0; t < 15 * OLD; t += FB) { f.step(FB); q += f.siphonQ || 0; n++; }
    let deepDye = 0; for (let c = 0; c < f.G.NC; c++) if (f.G.depthMax[c] > 2.5) deepDye += dye[f.G.cell0[c] + f.G.nL[c] - 1] * f.G.vol[f.G.cell0[c] + f.G.nL[c] - 1];
    check('the night siphon runs on calm nights and carries the coves\' water down the slope into the basin', q / n > 0 && deepDye > 0.002 * tot0,
      `siphon ${(q / n).toFixed(0)} m³/s (world) on average; ${(100 * deepDye / tot0).toFixed(2)} % of the cove dye in the basin's bottom layers`); }
  { seed(307); const f = new Env3(); for (let i = 0; i < 10; i++) f.step(FB / 2);   // (a ~15-min water step, as the budget was set on)   // (warmed up: the steady cost, not the JIT's)
    let ms = Infinity; for (let r = 0; r < 3; r++) { const t0 = performance.now(); for (let i = 0; i < 50; i++) f.step(FB / 2); ms = Math.min(ms, (performance.now() - t0) / 50); }   // (the best of three rounds: the code's cost, not the machine's moment — it swings ±1 ms over a session)
    // (TRUE SCALE: the same ~15,000 water cells at real lengths need more transport sub-steps and the brook its own stretches;
    // at 1× the water updates once a simulated minute, and in fast-forward ~20 ms a 15-min update is ~2 s a simulated day)
    check('one environment update (temperature, ice, transport of its fields) costs a few milliseconds', ms < (WORLD_TRUE ? 20 : 12), `${ms.toFixed(2)} ms per update with ${f.fields.length} fields`); }
}

// ============================================================
//  ENVIRONMENT 3-D, slice 2 — the water's chemistry and plankton (src/w3/chem3.js)
// ============================================================
console.log('\n— environment 3-D: chemistry and plankton —');
if (run('chem')) {
  const { Env3, CLOCK3 } = await import('../src/w3/env3.js');
  const { V2, A2 } = await import('../src/w3/chem3.js');
  const { ENV: ENVC } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  // the N and P budgets close: inventory change = in − out − buried (− denitrified + fixed for N), in any season and weather
  { let worst = 0, txt = [];
    for (const [yf, w] of [[0.4, 0], [0.45, 3], [0.85, 1]]) {
      seed(401); const e = new Env3({ col: 10 * CS, yf0: yf }); const c = e.chem; e.setWeather(w); for (let i = 0; i < 6; i++) e.step(FB);
      const P0 = c.inventoryP(), N0 = c.inventoryN(), L0 = { ...c.ledger };
      for (let i = 0; i < 90; i++) e.step(FB);
      const L = c.ledger, eP = (L.inP - L0.inP) - (L.outP - L0.outP) - (L.buryP - L0.buryP), eN = (L.inN - L0.inN) - (L.outN - L0.outN) - (L.denitN - L0.denitN) + (L.fixN - L0.fixN);
      const rP = Math.abs(c.inventoryP() - P0 - eP) / P0, rN = Math.abs(c.inventoryN() - N0 - eN) / N0; worst = Math.max(worst, rP, rN); txt.push(`${rP.toExponential(0)}/${rN.toExponential(0)}`);
    }
    check('the 3-D water\'s N and P budgets close (inventory change = in − out − buried, − denitrified + fixed) in summer, a storm and under ice', worst < 1e-5, `P/N relative error ${txt.join(', ')}`); }
  // the bed's fluxes reach the water in proportion to its area over the water's volume: thin water over a lot of bed (the
  // coves, the slopes) loses O₂ to the mud faster than the open water does
  { seed(402); const e = new Env3({ col: 5 * CS, yf0: 0.4 }); const c = e.chem, G = e.G; let jc = -1, jd = -1;
    for (let j = 0; j < G.NCELL; j++) { if (G.bedA[j] > 0 && c.r[j] > 0.8 && jc < 0) jc = j; if (G.bedA[j] === 0 && G.zMid[j] > 2 && jd < 0) jd = j; }
    c.o2.fill(0.9); e.temp.fill(15); c._o2Demand(OLD); const dC = 0.9 - c.o2[jc], dD = 0.9 - c.o2[jd];
    check('the bed\'s O₂ demand reaches the water in proportion to its area over the water\'s volume (thin water over the mud draws down fastest)', dC > 3 * dD && dD > 0,
      `${(dC * ENVC.O2_MGL).toFixed(3)} vs ${(dD * ENVC.O2_MGL).toFixed(3)} mg/L in 2.4 h (bed/water ${c.r[jc].toFixed(2)} vs mid-water); V2 ${V2.toFixed(2)} m³, A2 ${A2.toFixed(1)} m²`); }
  // A YEAR of the lakes' water without fish (the coarse 10-m grid): the seasons of O₂, the spring diatoms, the P budget
  { seed(403); const e = new Env3({ col: 10 * CS }); const c = e.chem, G = e.G; const t0 = performance.now();
    const deep = [], all = []; for (let q = 0; q < G.NC; q++) { all.push(q); if (G.depthMax[q] > 4.5) deep.push(q); }
    const bottom = cols => cols.reduce((s, q) => s + c.o2[G.cell0[q] + G.nL[q] - 1], 0) / cols.length * ENVC.O2_MGL;
    const P0 = c.inventoryP(); let sumMinDeep = 99, winMinDeep = 99, winMeanMin = 99, iceOut = null, frozen = false, dia = [0, 0, 0, 0];
    for (let t = 0; t < CLOCK3.YEAR_LEN; t += EW) {
      e.step(EW); const yf = e.yearFrac();
      if (yf > 0.38 && yf < 0.55) sumMinDeep = Math.min(sumMinDeep, bottom(deep));
      if (yf > 0.9 || yf < 0.12) { winMinDeep = Math.min(winMinDeep, bottom(deep)); winMeanMin = Math.min(winMeanMin, e.mean(c.o2) * ENVC.O2_MGL); }
      if (e.iceMean > 0.9) frozen = true; if (frozen && iceOut === null && e.iceMean < 0.5) iceOut = yf;   // (after the winter's ice)
      if (yf > 0.05 && yf < 0.2) { dia[0] += c.meanDiatom; dia[1]++; } if (yf > 0.4 && yf < 0.55) { dia[2] += c.meanDiatom; dia[3]++; }
    }
    const L = c.ledger, ret = L.buryP / L.inP, keep0 = c.inventoryP() / P0;
    // (THE WINTER'S O₂ AND THE P KEPT, over three years' weather: the weather's own stream (env3 _wrand) gave seed 403 the harshest
    // winter of six — the lake's mean O₂ minimum 2.7–8.3 mg/L, the P kept 0.69–0.76 across seeds 403–408: a typical year is the
    // median, not one draw's)
    const yr = [[winMeanMin, keep0]];
    for (const sd of [404, 405]) {
      seed(sd); const e2 = new Env3({ col: 10 * CS }), c2 = e2.chem, Q0 = c2.inventoryP(); let wm = 99;
      for (let t = 0; t < CLOCK3.YEAR_LEN; t += EW) { e2.step(EW); const yf = e2.yearFrac(); if (yf > 0.9 || yf < 0.12) wm = Math.min(wm, e2.mean(c2.o2) * ENVC.O2_MGL); }
      yr.push([wm, c2.inventoryP() / Q0]);
    }
    const med = k => yr.map(v => v[k]).sort((p, q) => p - q)[1], winMed = med(0), keep = med(1);
    check('summer: the deep north basin\'s bottom water keeps its O₂ (≥ 4 mg/L: wind and night convection mix it — MDIFW "does not stratify")', sumMinDeep >= 4, `lowest ${sumMinDeep.toFixed(1)} mg/L (June–August)`);
    // (≥ 3 mg/L: with the coloured water (stage 7a) the ice passes little light for photosynthesis, and the bed's demand — 0.1–0.3
    // g O₂/m²/day under the ice, the measured 0.2–0.39 — draws a 3-m-deep lake down ~10 mg/L over a 4-month ice season: a
    // shallow brown lake's late winter, a hypoxic layer over the mud, the fish crowding up. The clear-water version's ≥ 5 came
    // from under-ice photosynthesis snowy ice doesn't allow)
    check('winter: under the ice the basin\'s bottom water runs down toward anoxia by late winter while the lake as a whole keeps O₂ (≥ 3 mg/L in a typical winter: the median of three)', winMinDeep < 3 && winMed >= 3,
      `bottom of the basin down to ${winMinDeep.toFixed(1)} mg/L; the lake's mean never below ${yr.map(v => v[0].toFixed(1)).join(' / ')} mg/L (seeds 403/404/405)`);
    check('ice-out comes in late April or early May (Maine: ~Apr 23)', iceOut !== null && iceOut > 0.13 && iceOut < 0.2, `half the lake open at yf ${iceOut?.toFixed(3)} (Apr 23 ≈ 0.145)`);
    check('the cold-water diatoms bloom in late winter and spring, not in summer', dia[0] / dia[1] > 2 * dia[2] / Math.max(1, dia[3]), `Mar–May mean ${(dia[0] / dia[1]).toFixed(3)}, Jun–Aug ${(dia[2] / Math.max(1, dia[3])).toFixed(3)}`);
    check('the lakes keep their P over a year with a realistic retention (the bed keeps ~half to three-quarters of the inflow\'s load: Larsen–Mercier 0.66–0.72)', ret > 0.5 && ret < 0.9 && keep > 0.7 && keep < 1.3,
      `retention ${ret.toFixed(2)}, inventory ${yr.map(v => (100 * v[1]).toFixed(0)).join(' / ')} % of the start (seeds 403/404/405: the median ${(100 * keep).toFixed(0)} %); a year in ${((performance.now() - t0) / 1000).toFixed(0)} s`); }
  { seed(404); const f = new Env3(); for (let i = 0; i < 6; i++) f.step(FB / 2); const t0 = performance.now(); for (let i = 0; i < 40; i++) f.step(FB / 2); const ms = (performance.now() - t0) / 40;
    check('a full environment update (5-m grid: temperature, ice, transport, chemistry and plankton of 13 fields) costs ~10 ms', ms < 16, `${ms.toFixed(1)} ms`); }
}

// ============================================================
//  FISH 3-D, slice a — the agent core: founders, senses and brains, habitat drives, movement, feeding, bioenergetics, hazards
//  (src/w3/fish3.js)
// ============================================================
console.log('\n— fish 3-D: the agent core —');
if (run('core')) {
  const { Env3 } = await import('../src/w3/env3.js');
  const { Fish3, KEYS3, S3 } = await import('../src/w3/fish3.js');
  const { ENV } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  const inWater = a => GEO.bodyAt(a.x, a.y) !== LAND && a.z >= 0 && a.z <= Math.max(0.12, GEO.depthAt(a.x, a.y)) + 1e-3 && Number.isFinite(a.x + a.y + a.z + a.W + a.L);
  const run = (e, F, secs) => { for (let i = 0; i < Math.round(secs / 0.2); i++) { F.step(FB); e.step(EW); } };   // (secs: the 1-hour year's)
  // the founders: each species at its census (docs/FISH_CENSUS.md: fish ≥ minL per hectare; the brook's dace per m² of brook),
  // the lakes' fish biomass inside Maine's range
  { seed(501); const e = new Env3({ col: 10 * CS }), F = new Fish3(e), c = F.census(); let worst = 0; const txt = [];
    const brookA = GEO.body.reduce((t, b) => t + (b === BROOK ? GEO.CELL * GEO.CELL : 0), 0);
    for (const k of KEYS3) { const r = c[k], d = Math.abs((S3[k].brookRes ? r.n / brookA / S3[k].perM2 : r.perHa / S3[k].perHa) - 1); worst = Math.max(worst, d); txt.push(`${k} ${S3[k].brookRes ? (r.n / brookA).toFixed(2) + '/m²' : r.perHa.toFixed(0)}`); }
    const kg = F.biomass() / 1000 / F.lakeHa, wet = F.fish.every(inWater), schools = F.fish.every(a => a.school ? a.n > 1 : a.n === 1);
    // (the agents: within the budget — F3.AGENTS_HA a hectare of lake, the brook's dace aside — with the founders' solitary fish
    // all individuals; or, if the solitary fish alone exceed it, no schooling fish given its own brain)
    const { F3 } = await import('../src/w3/fish3.js'), lakeAg = F.fish.filter(a => !a.s.brookRes).length, budget = F3.AGENTS_HA * F.lakeHa, soloK = F.fish.filter(a => a.s.solo && !a.school).length;
    check('the founders: every species at its census (±10 %), ~12,700 fish in ~3,300 agents, 60–150 kg/ha, all in the water; the agents within the budget (the schooling fish with brains of their own only as it allows)', worst < 0.1 && kg > 60 && kg < 150 && wet && schools && (lakeAg <= budget || soloK === 0),
      `${F.count().toFixed(0)} fish in ${F.fish.length} agents (lakes ${lakeAg} of a budget of ${budget.toFixed(0)}; ${soloK} perch and white perch on their own, from ${F.soloL === Infinity ? '—' : f1(F.soloL) + ' cm'}), ${kg.toFixed(0)} kg/ha; per ha ${txt.join(', ')}`);
    // ONLY THE FISH ACTUALLY IN THE LAKES (the human, 2026-10-16; MDIFW's list + the human's redbreast; FISH_CENSUS.md §1): no
    // golden shiner; pumpkinseed founded in Upper (MDIFW lists it there only); the dace in the brook; the fallfish crowded
    // toward the brook's ends (fish of flowing water) — nearer them than the white perch, a fish of the open basin
    const BPt = GEO.BROOK_PATH, dEnd = a => Math.min(Math.hypot(a.x - BPt[0][0], a.y - BPt[0][1]), Math.hypot(a.x - BPt[BPt.length - 1][0], a.y - BPt[BPt.length - 1][1]));
    const mean = (k, f) => { let t = 0, n = 0; for (const a of F.fish) if (a.s.key === k) { t += f(a); n++; } return t / Math.max(1, n); };
    const want = ['sunfish', 'perch', 'sucker', 'catfish', 'whiteperch', 'bass', 'pike', 'redbreast', 'fallfish', 'killifish', 'dace'];
    const ps = F.fish.filter(a => a.s.key === 'sunfish'), bd = F.fish.filter(a => a.s.key === 'dace');
    check("only the fish in the lakes: the eleven species of MDIFW's list and the human's catches (no golden shiner), pumpkinseed founded in Upper, the dace in the brook, the fallfish toward the brook's ends (nearer them than the pickerel of the same shallows)",
      KEYS3.length === want.length && want.every(k => KEYS3.includes(k)) && ps.every(a => GEO.bodyAt(a.x, a.y) === UPPER) && bd.length > 50 && bd.every(a => GEO.bodyAt(a.x, a.y) === BROOK)
        && mean('fallfish', dEnd) < 0.7 * mean('pike', dEnd),
      `${KEYS3.join(', ')}; pumpkinseed ${ps.filter(a => GEO.bodyAt(a.x, a.y) === UPPER).length}/${ps.length} in Upper; dace ${bd.filter(a => GEO.bodyAt(a.x, a.y) === BROOK).length}/${bd.length} in the brook; mean distance to a brook end: fallfish ${mean('fallfish', dEnd).toFixed(0)} m, pickerel (the same shallow band) ${mean('pike', dEnd).toFixed(0)} m`); }
  // a summer's day and night: the fish stay in the water, swim, and each species keeps to its own water
  { seed(502); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e); const x0 = new Map(F.fish.map(a => [a.id, [a.x, a.y]]));
    const hab = (k, f, ok = () => true) => { let s = 0, n = 0; for (const a of F.fish) if (a.alive && a.s.key === k && ok(a)) { s += f(a) * a.n; n += a.n; } return s / Math.max(1, n); };   // (ok: which of them — the bullheads' rest is judged on the fish not breeding: spawning bullheads are active day and night)
    const med = (k, f, ok) => { const v = F.fish.filter(a => a.alive && a.s.key === k && ok(a)).map(f).sort((p, q) => p - q); return v.length ? v[v.length >> 1] : 0; };   // (the typical fish: a few frightened ones bolt)
    const snap = () => ({ wpBot: hab('whiteperch', a => a.bed), sfBot: hab('sunfish', a => a.bed), bhOver: hab('catfish', a => a.bed - a.z), pkZ: hab('pike', a => a.z), ypBot: hab('perch', a => a.bed), bhSpd: med('catfish', a => a.spd / (a.L / 100), a => !a.ripe && !(a.nt > 0)) });
    let wet = true, day = null, night = null, dark = 0;
    for (let i = 0; i < 700; i++) {
      F.step(FB); e.step(EW); if (i % 25 === 0 && !F.fish.every(inWater)) wet = false;
      if (!day && i > 150 && e.sun > 0.9) day = snap();
      if (day && !night) { if (e.sun <= 0) dark++; if (dark > 150) night = snap(); }
    }
    let moved = 0, n = 0; for (const a of F.fish) { const p = x0.get(a.id); if (p) { moved += Math.hypot(a.x - p[0], a.y - p[1]); n++; } } moved /= n;
    check('a summer\'s day and night: every fish stays in the water (above the bed, under the surface, never on land) and swims (mean > 5 m)', wet && moved > 5, `mean distance ${moved.toFixed(1)} m in 14 days`);
    check('by day each kind keeps to its water: white perch and yellow perch offshore (over ≥ 1 m deeper water than the pumpkinseed), bullheads on the bed, pickerel in the upper water',
      day && day.wpBot > day.sfBot + 1 && day.ypBot > day.sfBot + 1 && day.bhOver < 0.2 && day.pkZ < 1.5, day ? `bottom depth: white perch ${f2(day.wpBot)} m, yellow perch ${f2(day.ypBot)} m, pumpkinseed ${f2(day.sfBot)} m; bullheads ${f2(day.bhOver)} m over the bed; pickerel at ${f2(day.pkZ)} m` : 'no day sampled');
    check('at dusk the white perch and yellow perch come inshore (over ≥ 0.4 m shallower water by night) and the bullheads not breeding leave their rest (the typical one swims ≥ 2× faster)', !!(day && night && night.wpBot < day.wpBot - 0.4 && night.ypBot < day.ypBot - 0.4 && night.bhSpd > 2 * day.bhSpd),
      day && night ? `white perch over ${f2(day.wpBot)} → ${f2(night.wpBot)} m, yellow perch ${f2(day.ypBot)} → ${f2(night.ypBot)} m; bullheads ${f2(day.bhSpd)} → ${f2(night.bhSpd)} BL/s` : 'no night sampled'); }
  // the bookkeeping: a school's zooplankton and a bottom feeder's worms leave the water's fields gram for gram; respiration
  // takes its O₂ from the fish's own water
  { seed(503); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    const zooG = () => { let s = 0; for (let j = 0; j < G.NCELL; j++) s += (ch.zooD[j] + ch.zooC[j] + ch.zooR[j]) * ch.w[j]; return s; };
    const benG = () => { let s = 0; for (const j of ch.bedCells) s += ch.benth[j] * ch.a[j]; const Lt = e.lit; if (Lt) for (let i = 0; i < Lt.cells.length; i++) s += (Lt.S[i] + Lt.L[i] + Lt.sn[i] + Lt.crA[i] + Lt.crY[i]) * G.bedA[Lt.cells[i]]; return s; };   // (the bed and its weeds and crayfish: stages 7b–c)
    for (let j = 0; j < G.NCELL; j++) { ch.zooD[j] = 2; ch.zooC[j] = 1; } for (const j of ch.bedCells) ch.benth[j] = 12 * 8.2;
    let px = 0, py = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === UPPER && GEO.depth[i] > 2 && GEO.depth[i] < 2.4) { [px, py] = GEO.cellCentre(i); break; }
    const sch = F.add('whiteperch', 20, 80, 1.5, 2, 50), sk = F.add('sucker', px, py, null, 4, 1); sk.z = GEO.depthAt(sk.x, sk.y) - 0.1;
    sch.gut = 0; sk.gut = 0; F._hashBuild(); let dz = 0, dg = 0, db = 0, dgs = 0, wrong = 0;
    for (let i = 0; i < 20; i++) {
      const z0 = zooG(), b0 = benG(), g0 = sch.gut, gs0 = sk.gut;
      for (const a of [sch, sk]) { a.c = e.colAt(a.x, a.y); a.j = e.cellAt(a.x, a.y, a.z); a.bed = GEO.depthAt(a.x, a.y); a.jb = F.bedCell(a.c, a.bed); a.T = e.temp[a.j]; a.o2 = ch.o2[a.j]; const cm = F._energetics(a, a.s.sp.bio, a.T, 1e-9); F._feed(a, F.fish.indexOf(a), cm, 1, FB); }
      dz += z0 - zooG(); dg += (sch.gut - g0) * sch.n; db += b0 - benG(); dgs += sk.gut - gs0;
      const j = sch.j, o0 = ch.o2[j]; ch.o2[j] = Math.max(0, ch.o2[j] - sch.n * 0.01 * 0.1 / (G.vol[j] * ENV.O2_MGL)); if (Math.abs((o0 - ch.o2[j]) * G.vol[j] * ENV.O2_MGL - sch.n * 0.01 * 0.1) > 2e-3 * sch.n * 0.01 * 0.1) wrong++;   // (Float32 fields)
    }
    // (what the two fish ate = what the water and the bed lost: the school, short of zooplankton in a long block, also takes a
    // little from the bed — so the sums are compared, each fish's main food shown)
    check('a school\'s zooplankton and a sucker\'s worms (and weed insects and snails) leave the water\'s and the bed\'s fields gram for gram (and the O₂ the fish breathe from their own cell)', dz > 0 && db > 0 && Math.abs((dz + db) - (dg + dgs)) / (dz + db) < 1e-3 && !wrong,
      `school ate ${dg.toFixed(3)} g (field −${dz.toFixed(3)}), sucker ${dgs.toFixed(3)} g (bed −${db.toFixed(3)}); together ${(dg + dgs).toFixed(3)} g eaten, ${(dz + db).toFixed(3)} g taken`); }
  // PREDATION: a smallmouth beside a shoal of banded killifish strikes; each kill takes ONE fish from the school, whose mass lands
  // in the bass's gut
  { seed(504); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const b = F.add('bass', 20, 80, 1.5, 4, 1), sh = F.add('killifish', 20.4, 80, 1.5, 0.6, 60); sh.L = 5; sh.W = 1.3; sh.gon = 0; F._settle(sh);
    let kills = 0, gotG = 0; const n0 = sh.n;
    for (let i = 0; i < 400 && kills < 3; i++) {
      sh.x = b.x + 0.3; sh.y = b.y; sh.z = b.z; F._hashBuild(); b.missCd = 0;
      const g = F._strike(b, F.fish.indexOf(b), 50, 1, 1, FB); if (g > 0) { kills++; gotG += g; }
    }
    check('predation: a smallmouth beside a shoal of killifish kills, one fish per strike — the school loses exactly the fish eaten, the bass gets their mass',
      kills >= 3 && Math.abs(n0 - sh.n - kills) < 1e-9 && Math.abs(gotG - kills * 1.3) < 1e-6 && F.stats.eatenBy['bass>killifish'] === kills, `${kills} kills, school ${n0} → ${sh.n}, ${gotG.toFixed(1)} g eaten`); }
  // SCHOOLS meet and merge (keeping one parent's genome, never averaged), split above twice their size — the fish are conserved
  { seed(505); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const a = F.add('perch', 20, 80, 1.5, 2, 30), b = F.add('perch', 21, 80, 1.5, 2, 25); F.add('perch', -40, 60, 1.0, 2, 2 * S3.perch.school + 20);
    // (the budget off: in an empty lake it has room for every perch to have its own brain — FISH_CENSUS.md §3 — and they would)
    F._soloAt = Infinity; F.soloL = Infinity;
    const ga = a.g, gb = b.g, tot = F.count(); F._hashBuild(); F._schools(); F.fish = F.fish.filter(x => x.alive);
    const merged = F.fish.find(x => x.n === 55);
    check('schools of one kind and size merge (one parent\'s genome kept, not averaged) and split above twice their size — no fish gained or lost',
      !!merged && (merged.g === ga || merged.g === gb) && Math.abs(F.count() - tot) < 1e-9 && F.fish.length === 3 && Math.max(...F.fish.map(x => x.n)) <= 2 * S3.perch.school,
      `${tot} fish → ${F.fish.map(x => x.n).join(' + ')}`); }
  // STARVATION: a pumpkinseed in a lake emptied of its food loses condition and dies of hunger within weeks of summer
  { seed(506); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem;
    const a = F.add('sunfish', 20, 80, null, 3, 1); let t = 0, Kmin = a.K;
    ch.zooD.fill(0); ch.zooC.fill(0); ch.zooR.fill(0); for (const j of ch.bedCells) ch.benth[j] = 0;
    while (a.alive && t < 120 * DAYS) { F.step(FB); Kmin = Math.min(Kmin, a.K); t += FB; }
    check('starvation: a summer pumpkinseed without food wastes (condition K falls) and dies of hunger within weeks', !a.alive && a.cause === 'starve' && t / DAYS < 100, `died after ${(t / DAYS).toFixed(0)} days (${a.cause || 'alive'}), K → ${f2(Kmin)}`); }
  // HYPOXIA: a perch whose bottom water has no O₂ climbs out of it within seconds
  { seed(507); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    let c0 = -1, dm = 0; for (let c = 0; c < G.NC; c++) if (G.depthMax[c] > dm) { dm = G.depthMax[c]; c0 = c; }
    const a = F.add('perch', G.cx[c0], G.cy[c0], null, 3, 1); a.z = GEO.depthAt(a.x, a.y) - 0.2;
    const z0 = a.z; for (let i = 0; i < 50; i++) { for (let k = 2; k < G.nL[c0]; k++) ch.o2[G.cell0[c0] + k] = 0.01; F.step(FB); }
    check('hypoxia: a perch on an anoxic bottom gets out of the dead water — up, or (in a block) across to a column with O₂', a.alive && a.o2 > a.o2Crit && (a.z < 1.0 || a.c !== c0), `from ${f2(z0)} m to ${f2(a.z)} m${a.c !== c0 ? ` in another column, ${f1(Math.hypot(a.x - G.cx[c0], a.y - G.cy[c0]))} m away` : ''} (O₂ ${(a.o2 * ENV.O2_MGL).toFixed(1)} mg/L)`); }
  // DETERMINISM: the same seed makes the same lake of fish
  { const one = () => { seed(508); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e); run(e, F, 6); return F.fish.map(a => `${a.x.toFixed(5)},${a.z.toFixed(5)},${a.W.toFixed(6)},${a.n.toFixed(4)}`).join(';'); };
    check('determinism: the same seed gives the same fish (positions, masses, school sizes) after 30 blocks', one() === one()); }
  // A SUMMER MONTH (the coarse grid): every species feeds (consumption a realistic share of its maximum), none dies out, the
  // lakes' fish biomass holds inside Maine's range; the fish step's cost
  { seed(509); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e); run(e, F, 20); F.resetIntake(); const B0 = F.biomass();
    let tf = 0, steps = 0; for (let i = 0; i < 296 * 5; i++) { const t0 = performance.now(); F.step(FB); tf += performance.now() - t0; steps++; e.step(EW); }
    const c = F.census(), kg = F.biomass() / 1000 / F.lakeHa; const lowP = [], gone = [], txt = [];
    const brookA = GEO.body.reduce((t, b) => t + (b === BROOK ? GEO.CELL * GEO.CELL : 0), 0);
    for (const k of KEYS3) { const r = c[k]; txt.push(`${k} ${f2(r.p)}`); if (!(r.n > 0.5 * (S3[k].brookRes ? S3[k].perM2 * brookA : S3[k].perHa * F.lakeHa))) gone.push(k); if (!(r.p > 0.15)) lowP.push(k); }
    const st = F.stats.died; let starve = 0, all = 0; for (const k in st) for (const cs in st[k]) { all += st[k][cs]; if (cs === 'starve') starve += st[k][cs]; }
    // (how MUCH they eat — p, the share of the maximum ration — is the food web's calibration, stage 6: the water is still too
    // productive and the type III response too generous, p ~0.5–0.97 vs ~0.3–0.6 in real lakes; here every species must feed)
    check('a summer month: every species feeds (consumption ≥ 15 % of its maximum ration), none halves, biomass 60–170 kg/ha (Maine 60–150 + a summer of growth)',
      !lowP.length && !gone.length && kg > 60 && kg < 170, `p ${txt.join(', ')}; biomass ${(B0 / 1000 / F.lakeHa).toFixed(0)} → ${kg.toFixed(0)} kg/ha; deaths ${all.toFixed(0)} (starved ${starve.toFixed(0)})${gone.length ? '; halved: ' + gone.join(', ') : ''}`);
    const ms = tf / steps;
    // (the fine rung — watching in real time: ten 0.1-s steps after the warm month)
    for (let i = 0; i < 5; i++) F.step(0.1); const t1 = performance.now(); for (let i = 0; i < 20; i++) F.step(0.1); const msF = (performance.now() - t1) / 20;
    check('the fish\'s cost: a coarse 29-min block (~3,300 agents: one decision each, the relocation, feeding, bioenergetics) ≤ 45 ms — the 1-hour year\'s two steps; a real-time 0.1-s step (senses, brains at 5 Hz, swimming) ≤ 25 ms',
      ms < 45 && msF < 25, `block ${ms.toFixed(1)} ms (${(ms / F.fish.length * 1000).toFixed(1)} µs an agent); 0.1-s step ${msF.toFixed(1)} ms`); }
  // FIDELITY BY DISTANCE (TRUE_SCALE.md T3): with a focus the near fish live second by second, the far ones in banked blocks
  // (scheduled, each FAR_BLOCK s); over two minutes every fish's lived time keeps up with the clock within a block, the near ones
  // swim, none goes astray; the season's young the same (part 3)
  { const { F3 } = await import('../src/w3/fish3.js');
    seed(510); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { young: true }); const [cx, cy] = GEO.NOTES[2].xy; F.setFocus(cx, cy, 200 * GEO.SCALE);
    const age0 = new Map(F.fish.map(a => [a.id, a.age])), pos0 = new Map(F.fish.map(a => [a.id, [a.x, a.y]])), fN0 = new Map(F.fish.map(a => [a.id, a.n])), n0 = F.count(), T = 120;
    const yAge0 = new Map(F.yoy.map(q => [q.id, [q.age, q.n]])), yPos0 = new Map(F.yoy.map(q => [q.id, [q.x, q.y]])), yN0 = F.yoy.reduce((t, q) => t + (q.alive ? q.n : 0), 0);
    let ms = 0; for (let i = 0; i < T * 10; i++) { const t = performance.now(); F.step(0.1); ms += performance.now() - t; if (i % 600 === 599) e.step(60); }
    // (the young: each school's lived time against the clock — not one that took in another, its age the pair's mean — the near ones' swimming)
    let yLag = 0, yNear = 0, yMoved = 0, yFar = 0;
    for (const q of F.yoy) { if (!q.alive || !yAge0.has(q.id)) continue; const [ag0, n0q] = yAge0.get(q.id); if (q.n <= n0q * 1.0001) yLag = Math.max(yLag, T - (q.age - ag0)); if (q.near) { yNear++; const p = yPos0.get(q.id); if (Math.hypot(q.x - p[0], q.y - p[1]) > 0.02) yMoved++; } else yFar++; }
    const yN1 = F.yoy.reduce((t, q) => t + (q.alive ? q.n : 0), 0) + Object.values(F.stats.fry).reduce((t, r) => t + r.recruited, 0);
    // (P, the senses' copy of where each fish is, after a step: exactly every fish's place — each fish's own step keeps it)
    F.step(0.1); let pOff = 0; for (let i = 0; i < F._hashN; i++) { const a = F.fish[i], o = 4 * i; if (F.P[o] !== a.x || F.P[o + 1] !== a.y || F.P[o + 2] !== a.z) pOff++; }
    let lag = 0, near = 0, moved = 0, bad = 0, far = 0;
    for (const a of F.fish) { if (!a.alive || !age0.has(a.id)) continue; if (!Number.isFinite(a.x + a.y + a.z + a.W + a.age)) bad++;
      if (a.n <= fN0.get(a.id) * 1.0001) lag = Math.max(lag, T - (a.age - age0.get(a.id)));   // (not a school that took in another: its age is the pair's mean)
      if (a.near) { near++; const p = pos0.get(a.id); if (Math.hypot(a.x - p[0], a.y - p[1]) > 0.05) moved++; } else far++; }
    F.setFocus(null);
    check('fidelity by distance: with a focus the fish within it swim second by second and the rest live their time in banked blocks — after two minutes every fish has lived it to within a block, the population kept',
      near > 5 && moved >= 0.8 * near && far > near && lag <= F3.FAR_BLOCK + 0.2 && lag >= -0.2 && !bad && Math.abs(F.count() - n0) / n0 < 0.01,
      `${near} near (${moved} swam), ${far} far; the most behind ${lag.toFixed(1)} s (a block ${F3.FAR_BLOCK} s); fish ${n0.toFixed(0)} → ${F.count().toFixed(0)}; ${(ms / (T * 10)).toFixed(1)} ms a step`);
    check("fidelity by distance, the young: the schools within the focus swim each step and the rest live their time in scheduled blocks — every school has lived the two minutes to within a block, the young kept (alive + recruited); the senses' positions (P) exactly every fish's",
      yNear > 0 && yMoved >= 0.8 * yNear && yFar > yNear && yLag <= F3.FAR_BLOCK + 0.2 && yLag >= -0.2 && Math.abs(yN1 - yN0) / yN0 < 0.02 && pOff === 0,
      `${yNear} near (${yMoved} swam), ${yFar} far; the most behind ${yLag.toFixed(1)} s; young ${yN0.toFixed(0)} → ${yN1.toFixed(0)}; P off for ${pOff} of ${F._hashN}`); }
  // SHARDS (TRUE_SCALE.md T5): the fish split by water — Upper and the brook; Lower — each shard stepping only its own fish in its
  // own water, one after another here as they run side by side in workers: the founding split is the single founding's, a run
  // keeps the lakes as a single run does, fish that swim across are handed over, none is left in another's water, and a run
  // repeats itself exactly
  { const { ShardSet } = await import('../src/w3/shard3.js'); const { KEYS3 } = await import('../src/w3/fish3.js'); const { createHash } = await import('node:crypto');
    const tot = c => KEYS3.reduce((t, k) => t + c[k].n, 0), kgOf = c => KEYS3.reduce((t, k) => t + c[k].kgHa, 0);
    const fpOf = list => { const h = createHash('sha1'); for (const a of [...list].filter(a => a.alive).sort((p, q) => p.id - q.id)) h.update(`${a.id},${a.x},${a.n},${a.W};`); return h.digest('hex'); };
    const runS = sharded => { seed(520); const e = new Env3({ col: 10 * CS, yf0: 0.3 }); const F = sharded ? new ShardSet(e, { young: true }) : new Fish3(e, { young: true }); const c0 = F.census(), sp0 = JSON.stringify(F.stats.spawns) + JSON.stringify(F.stats.fry);
      for (let b = 0; b < 30; b++) { F.step(1752); e.step(1752); }
      const [cx, cy] = GEO.NOTES[2].xy; F.setFocus(cx, cy, 200 * GEO.SCALE); let acc = 0; for (let i = 0; i < 600; i++) { F.step(0.1); acc += 0.1; if (acc >= 60) { e.step(acc); acc = 0; } }
      F.setFocus(null); for (let b = 0; b < 4; b++) { F.step(1752); e.step(1752); }
      return { c0, sp0, c1: F.census(), F, fp: fpOf(F.fish) }; };
    const A = runS(false), B = runS(true), B2 = runS(true);
    const sameFound = KEYS3.every(k => Math.abs(A.c0[k].n - B.c0[k].n) < 1e-6) && A.sp0 === B.sp0;   // (the founding's tallies counted once, not once a shard)
    let wrong = 0, dup = 0; const ids = new Set(); B.F.shards.forEach((sh, i) => { for (const a of sh.F.fish) if (a.alive) { if (ids.has(a.id)) dup++; ids.add(a.id); if (B.F.owner[B.F.env.colAt(a.x, a.y)] !== i) wrong++; } });
    const dN = Math.abs(tot(B.c1) - tot(A.c1)) / tot(A.c1), dKg = Math.abs(kgOf(B.c1) - kgOf(A.c1)) / kgOf(A.c1);
    check('shards: the fish split by water (Upper and the brook; Lower) found as one, keep the lakes as one run does (fish and biomass within 2 %), hand over the fish that cross, leave none in another\'s water, and repeat a run exactly',
      sameFound && dN < 0.02 && dKg < 0.02 && B.F.handed > 0 && !wrong && !dup && B.fp === B2.fp,
      `founding ${sameFound ? 'the same' : 'DIFFERS'}; fish ${tot(A.c1).toFixed(0)} one / ${tot(B.c1).toFixed(0)} sharded, ${kgOf(A.c1).toFixed(1)} / ${kgOf(B.c1).toFixed(1)} kg/ha; handed over ${B.F.handed}; in another's water ${wrong}, duplicate ids ${dup}; repeats ${B.fp === B2.fp}`); }
}

// ============================================================
//  FISH 3-D, slice b — reproduction: spawning grounds and seasons, nests, the brook, young-of-year, recruitment
// ============================================================
console.log('\n— fish 3-D: reproduction and the young —');
if (run('young')) {
  const { Env3 } = await import('../src/w3/env3.js');
  const { Fish3, S3 } = await import('../src/w3/fish3.js');
  const { PLANKTON } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  // A SPRING (Apr 21 → late June, the coarse grid): who spawns when and where, the nests, the brook
  { seed(511); const e = new Env3({ col: 10 * CS, yf0: 0.14 }), F = new Fish3(e); const gd = []; let may = null, mayYf = 0;
    // (stage 7g: the plant spawners — the structure index of their band's water as they spawn, against where they spawned)
    // (the band: every point of the lakes at the species' spawning depths, read as the fish read them — F._subAt)
    const { GEO } = await import('../src/w3/geometry.js'), bandPts = {};
    const bandS = (u, lo, hi) => { const k = u + lo; if (!bandPts[k]) { bandPts[k] = []; for (let i = 0; i < GEO.N; i++) if ((GEO.body[i] === 1 || GEO.body[i] === 2) && GEO.depth[i] >= lo && GEO.depth[i] <= hi) bandPts[k].push(GEO.cellCentre(i)); }
      let s = 0; for (const [x, y] of bandPts[k]) s += F._subAt(u, x, y); return s / Math.max(1, bandPts[k].length); };
    const subB = { perch: [0, 0, 'rigid', 0.5, 2], pike: [0, 0, 'mat', 0.3, 1] };
    let siteMat = -1, siteBand = -1, ffIn = 0, ffBack = 0;   // (the brook's fallfish at their peak: ripe in it; turned back but in it)
    for (let i = 0; i < 62 * 49.3; i++) {
      if (i === 1) { const ps = [...F.sites.pike[1], ...F.sites.pike[2]]; siteMat = ps.reduce((t, p) => t + F._subAt('mat', p[0], p[1]), 0) / ps.length; siteBand = bandS('mat', 0.3, 1); }   // (the pickerel's grounds as the spring chose them)
      for (const k in subB) subB[k][1] = F.stats.spawns[k];
      F.step(FB); e.step(EW);
      for (const k in subB) { const b = subB[k], d = F.stats.spawns[k] - b[1]; if (d > 0) b[0] += d * bandS(b[2], b[3], b[4]); }
      if (!may && e.yearFrac() >= 0.22) { may = F.census(); mayYf = e.yearFrac(); }   // (May 20: the young so far — for seedSeason below)
      if (i % 25 === 0) for (const a of F.fish) if (a.nt > 0 && a.nt < a.s.guard - 2) gd.push(Math.hypot(a.x - a.nx, a.y - a.ny));
      if (i % 5 === 0) { let n = 0, nb = 0; for (const a of F.fish) if (a.alive && a.ripe && a.s.key === 'fallfish' && GEO.bodyAt(a.x, a.y) === BROOK) { n += a.n; if (a.runYr === F._yr) nb += a.n; } ffIn = Math.max(ffIn, n); ffBack = Math.max(ffBack, nb); }
    }
    const st = F.stats, at = st.spawnAt, day = k => at[k].first < 0 ? Infinity : (at[k].first / (365 * DAYS) - 0.14) * 365, bed = k => at[k].bed / Math.max(1, st.spawns[k]);
    const sp6 = ['pike', 'perch', 'sucker', 'whiteperch', 'bass', 'sunfish'];
    check('spring: pickerel, perch, suckers, white perch, smallmouth and pumpkinseed all spawn by late June — the cold-water spawners first (pickerel and perch in May, then the bass and the sunfish)',
      sp6.every(k => st.spawns[k] > 0) && day('pike') < day('bass') && day('perch') < day('bass') && day('perch') < day('sunfish') && day('bass') <= day('sunfish') + 20,
      'first spawning (days after Apr 21): ' + sp6.map(k => `${k} ${day(k).toFixed(0)}`).join(', ') + '; spawnings ' + sp6.map(k => st.spawns[k]).join('/'));
    // (suckers: the census's 70/ha — up from 30, FISH_CENSUS.md — puts most of them beyond a run's reach of the brook; 4 seeds give
    // 26–39 % of their spawnings in it, the rest on the lakes' shoals, standing in for the lakes' other inlets, not modelled)
    check('each species spawns on its own ground: perch on 0.5–2 m brush, smallmouth nests at 0.5–1.5 m, pumpkinseed colonies < 2 m, suckers up the brook\'s riffles (a fifth or more)',
      bed('perch') > 0.4 && bed('perch') < 2.3 && bed('bass') > 0.4 && bed('bass') < 1.8 && bed('sunfish') < 1.9 && at.sucker.brook >= 0.2 * st.spawns.sucker,
      `mean bottom depth: perch ${f2(bed('perch'))} m, smallmouth ${f2(bed('bass'))} m, pumpkinseed ${f2(bed('sunfish'))} m; suckers ${at.sucker.brook} of ${st.spawns.sucker} in the brook`);
    { const on = k => at[k].sub / Math.max(1, st.spawns[k]), band = k => subB[k][0] / Math.max(1, st.spawns[k]);
      check("perch and pickerel spawn on structure: perch lay their ribbons on rigid stems and wood richer than their band's water, the pickerel's spring grounds lie on its best mats (bare bed hatches ~half: Ward & Barnes 0.47)",
        st.spawns.perch > 0 && st.spawns.pike > 0 && on('perch') > band('perch') + 0.07 && siteMat > siteBand + 0.15,   // (an index saturates near 1: a margin, not a ratio — perch +0.10–0.15 on seeds 511–513)
        `perch laid on ${f2(on('perch'))} (their band ${f2(band('perch'))}); the pickerel's grounds ${f2(siteMat)} (their band ${f2(siteBand)}), where they spawned ${f2(on('pike'))} (${f2(band('pike'))})`); }
    // THE BROOK'S NEST SITES (fish3 spawn.runK; research_notes/…/fallfish_spawning_brook.md): ripe fallfish fill the brook to its
    // nest sites — a runner that finds them taken at the mouth spawns on its lake's shoals instead, and goes there (it neither
    // lingers in the brook nor hunts its dace; at true scale thousands did) — so they spawn both in the brook and on the shoals
    { const K = S3.fallfish.spawn.runK * GEO.body.reduce((t, b) => t + (b === BROOK ? GEO.CELL * GEO.CELL : 0), 0);
      check("the brook's nest sites: ripe fallfish in it peak at about its sites' number, the runners it turned back don't linger there, and fallfish spawn both in the brook and on the lakes' shoals",
        ffIn <= 1.3 * K + 3 && ffBack <= 0.3 * K + 2 && at.fallfish.brook > 0 && st.spawns.fallfish > at.fallfish.brook,
        `peak ${ffIn.toFixed(0)} ripe fallfish in the brook (its sites ${K.toFixed(0)}), turned back but in it ${ffBack.toFixed(0)}; spawnings ${at.fallfish.brook} in the brook of ${st.spawns.fallfish}`); }
    gd.sort((p, q) => p - q); const g90 = gd.length ? gd[Math.floor(gd.length * 0.9)] : Infinity;
    check('the nest guarders (smallmouth, pumpkinseed, bullhead males) keep to their nests (90 % of the time within 1.5 m)', gd.length > 20 && g90 < 1.5, `${gd.length} samples, 90th percentile ${f2(g90)} m`);
    // THE LAKES ARE ONE WATER (the human: "pickerel swim through the brook", "bass too", "everything does"; F3.ROAM_L, MOVE3):
    // over the spring, fish of many species reach the other lake through the brook — settlers, and the pickerel's spring trips
    const crossK = Object.keys(st.cross).filter(k => st.cross[k] > 0), crossN = Object.values(st.cross).reduce((p, q) => p + q, 0);
    check('the lakes are one water: through the spring, fish of five or more species cross the brook to the other lake, the pickerel on their spring trips among them',
      crossK.length >= 5 && st.trips.pike >= 3 && st.cross.pike > 0, `${crossN.toFixed(0)} fish crossed — ${crossK.map(k => `${k} ${st.cross[k].toFixed(0)}`).join(', ')}; pickerel trips ${st.trips.pike}`);
    let brook = 0, sun = 0; for (const a of F.fish) if (a.s.key === 'sunfish') { sun++; if (GEO.bodyAt(a.x, a.y) === BROOK) brook++; }
    const c = F.census();
    check('by June pumpkinseed are in the brook\'s pools (the angler\'s sunfish), and the young of the spring spawners swim in the lakes',
      brook >= 5 && c.perch.yoyN > 0 && c.sunfish.yoyN > 0 && c.whiteperch.yoyN > 0, `${brook} of ${sun} pumpkinseed in the brook; young: ` + ['perch', 'whiteperch', 'sunfish', 'bass', 'sucker', 'pike'].map(k => `${k} ${(c[k].yoyN / 1e3).toFixed(1)}k at ${f1(c[k].yoyL || 0)} cm`).join(', '));
    // THE YOUNG KEEP MOVING (the human, 2026-10-16: "do they all just swim in circles all the time?" — the young schools parked on
  // their feeding spot between their hourly decisions and the view drew them milling in place): in summer at the fine step,
  // over five minutes the young schools cruise — most move metres along a wandering path, none circles in place
  { seed(521); const e = new Env3({ col: 10 * CS, yf0: 0.45 }), F = new Fish3(e, { young: true }); for (let i = 0; i < 49.3; i++) { F.step(FB); e.step(EW); }
    const tr = new Map(); for (let t = 0; t < 3000; t++) { F.step(0.1); if (t % 10 === 0) for (const q of F.yoy) if (q.alive && !(q.gref && q.gref.alive)) { let r = tr.get(q.id); if (!r) tr.set(q.id, r = []); r.push([q.x, q.y]); } }
    const mv = [...tr.values()].filter(r => r.length > 200).map(r => { let L = 0; for (let i = 1; i < r.length; i++) L += Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); return [L, Math.hypot(r[r.length - 1][0] - r[0][0], r[r.length - 1][1] - r[0][1])]; });
    const med = mv.map(m => m[0]).sort((p, q) => p - q)[mv.length >> 1] || 0, still = mv.filter(m => m[0] < 0.5).length;
    check('the young keep moving: over five minutes of a summer day the free (unguarded) young schools cruise — the median one a few metres, under a tenth standing still',
      mv.length > 20 && med > 3 && still < 0.1 * mv.length, `${mv.length} schools, median path ${f1(med)} m, ${still} still`); }
  // THE SEASON'S YOUNG SO FAR (Fish3.seedSeason — the human, on a fresh lake: "it's saying there aren't any schools of young
    // fish, is that correct?"): a lake opened on May 20 holds the young of the spawnings before it — about as many and as big as
    // the spring above had on that day — and none of the later spawners'. (Calibrated on the full grid, 3 seeds: perch 1.05 cm
    // vs 1.05–1.07 run in full; the coarse grid's spring and this seed's weather spawn the perch a week later: ±30 % on size)
    { seed(519); const e2 = new Env3({ col: 10 * CS, yf0: mayYf }), F2 = new Fish3(e2, { young: true }), c2 = F2.census(), sp3 = ['perch', 'pike', 'sucker'];
      const near = k => c2[k].yoyN > 0.4 * may[k].yoyN && c2[k].yoyN < 2.5 * may[k].yoyN && Math.abs(c2[k].yoyL / may[k].yoyL - 1) < 0.3;   // (×0.4–2.5: one live spring's spawnings are noisy — its suckers' young on May 20 were 99k on one geometry, 55k on the next)
      for (let i = 0; i < 10; i++) { F2.step(FB); e2.step(EW); }
      check('a lake opened on May 20 already holds the young of the spawnings before it (perch, pickerel, suckers: ×0.4–2.5 the numbers, ±30 % the size of the same spring run in full), none of the later spawners (smallmouth, pumpkinseed), and runs on',
        sp3.every(near) && c2.bass.yoyN === 0 && c2.sunfish.yoyN === 0 && F2.yoy.some(q => q.alive && q.s.key === 'perch'),
        sp3.map(k => `${k} ${(c2[k].yoyN / 1e3).toFixed(1)}k at ${f2(c2[k].yoyL || 0)} cm (in full ${(may[k].yoyN / 1e3).toFixed(1)}k at ${f2(may[k].yoyL || 0)})`).join(', ')); } }
  // THE YOUNG'S BOOKKEEPING: a school of larvae takes its zooplankton (rotifers too) from the water gram for gram
  { seed(512); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    for (let j = 0; j < G.NCELL; j++) { ch.zooD[j] = 1; ch.zooC[j] = 1; ch.zooR[j] = 1; }
    const zooG = () => { let s = 0; for (let j = 0; j < G.NCELL; j++) s += (ch.zooD[j] + ch.zooC[j] + ch.zooR[j]) * ch.w[j]; return s; };
    const q = F._mkYoy(S3.perch.i, 20, 80, 1.0, 5000, null, null, 1, 0); q.L = 0.6; q.W = 0.002;
    q.c = e.colAt(q.x, q.y); q.j = e.cellAt(q.x, q.y, q.z); q.jb = F.bedCell(q.c, q.bed);
    const z0 = zooG(), r0 = ch.zooR[q.j], y0 = F.stats.food.yZoo, W0 = q.W; F._feedYoy(q, 0.4 * OLD, 20);
    const took = z0 - zooG(), ate = F.stats.food.yZoo - y0;
    check('a school of first-feeding larvae takes its zooplankton — the rotifers and nauplii first — from the water gram for gram, and grows',
      ate > 0 && Math.abs(took - ate) / ate < 1e-3 && ch.zooR[q.j] < r0 && q.W > W0, `${(ate * 1000).toFixed(1)} mg taken (water −${(took * 1000).toFixed(1)} mg), larva ${(W0 * 1000).toFixed(2)} → ${(q.W * 1000).toFixed(2)} mg`); }
  // PREDATION ON THE YOUNG: a smallmouth working a school of 3-cm pumpkinseed eats a bout of them — the school loses exactly
  // the fish eaten, the bass gets their mass
  { seed(513); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const b = F.add('bass', 20, 80, 1.5, 4, 1), q = F._mkYoy(S3.sunfish.i, 20.3, 80, 1.5, 2000, null, null, 1, 0);
    q.L = 3; q.W = 0.4; q.bdep = q.L * S3.sunfish.sp.depthR; F._yoyHash();
    const n0 = q.n; let got = 0; for (let i = 0; i < 30; i++) { b.gut = 0; got += F._eatYoy(b, 50, 1, FB) * b.n; }
    const k = n0 - q.n;
    check('predation on the young: a smallmouth working a school of 3-cm pumpkinseed eats a bout of them — one school loses exactly the fish the bass gets',
      k >= 3 && Math.abs(got - k * 0.4) < 1e-6 && F.stats.fry.sunfish.eaten === k, `${k} eaten in 3 s (${got.toFixed(1)} g), school ${n0} → ${q.n}`); }
  // RECRUITMENT: grown young of a school species become a school agent with a brain (their genome); an individual species'
  // become individuals — the fish conserved
  { seed(514); const e = new Env3({ col: 10 * CS, yf0: 0.6 }), F = new Fish3(e, { founders: false });
    const yp = F._mkYoy(S3.perch.i, 20, 80, 1.5, 500, F.add('perch', 20, 80, 1.5, 2, 2).g, null, 2, 0); yp.L = S3.perch.sp.L0; yp.W = 4.4; yp.genes = F.fish[0].genes; yp.age = 120;
    const ys = F._mkYoy(S3.sunfish.i, 20.5, 80, 1.0, 40, F.fish[0].g, F.fish[0].genes, 2, 0); ys.L = S3.sunfish.sp.L0; ys.W = 1.4; ys.age = 120;
    F.cnt.fill(0); const nA = F.fish.length; F._recruit(yp); F._recruit(ys);
    const school = F.fish.find(a => a.s.key === 'perch' && a.n > 100), sun = F.fish.filter(a => a.s.key === 'sunfish');
    // (the young pumpkinseed recruit at 5 cm, under their 7-cm own-brain size: groups of ≤ 25 — FISH_CENSUS.md §3)
    const sunN = sun.reduce((t, a) => t + a.n, 0);
    check('recruitment: grown young perch become one school agent of all 500 with their genome; 40 young pumpkinseed (5 cm) become two groups of them',
      !!school && Math.abs(school.n - 500) < 1e-9 && school.g === yp.g && sun.length === 2 && Math.abs(sunN - 40) < 1e-9 && sun.every(a => a.school && a.n <= 25) && F.fish.length === nA + 3 && !yp.alive && !ys.alive && F.stats.recruits.perch === 500,
      `perch school of ${school ? school.n : 0} (L ${school ? f1(school.L) : '-'} cm), pumpkinseed groups ${sun.map(a => a.n).join(' + ')}`);
    // WHO GETS A BRAIN (FISH_CENSUS.md §3): a school whose fish reach the own-brain length breaks up into individuals — the fish
    // conserved, the first with the school's genome and the rest its mutations — who keep schooling by choice; a group of young
    // pumpkinseed grown past 7 cm breaks up likewise
    const big = F.add('perch', -30, 60, 1.5, 4, 37); big.L = 24; big.W = 160; F._settle(big); F.soloL = 22;
    const grp = sun[0]; grp.L = 7.3; grp.W = 6; F._settle(grp); const gN = Math.floor(grp.n), bigG = big.g, n0 = F.count('perch'), m0 = F.count('sunfish');
    F._soloAt = e.time; F._schools();
    const solo = F.fish.filter(a => a.alive && a.s.key === 'perch' && !a.school && a.L === 24);
    check('who gets a brain: a school of 37 big perch past the cutoff becomes 37 perch with brains of their own (the fish conserved, one with the school\'s genome, the rest its mutations); young pumpkinseed past 7 cm leave their group as individuals',
      !big.alive && solo.length === 37 && Math.abs(F.count('perch') - n0) < 1e-9 && solo.filter(a => a.g === bigG).length === 1 && new Set(solo.map(a => a.g)).size === 37 && solo.every(a => a.n === 1 && a.sex !== 2)
        && !grp.alive && Math.abs(F.count('sunfish') - m0) < 1 && F.fish.filter(a => a.alive && a.s.key === 'sunfish' && !a.school).length >= gN,
      `${solo.length} perch on their own (perch ${n0} → ${F.count('perch')}), pumpkinseed ${m0} → ${F.count('sunfish').toFixed(0)} with ${F.fish.filter(a => a.alive && a.s.key === 'sunfish' && !a.school).length} on their own`); }
}

// ============================================================
//  FISH 3-D, stage 6a — adult foraging: the bed or the open water (shared foraging time), the foraging footprint
// ============================================================
console.log('\n— fish 3-D: foraging —');
if (run('forage')) {
  const { Env3 } = await import('../src/w3/env3.js');
  const { Fish3 } = await import('../src/w3/fish3.js');
  const { A2 } = await import('../src/w3/chem3.js');
  const { PLANKTON } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  // a perch school on the bed: with rich worms and scarce zooplankton it feeds on the bed; with the bed bare to its refuge
  // and rich zooplankton, in the open water — one or the other, its foraging time shared toward the better food
  { seed(521); const e = new Env3({ col: 10 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    let px = 0, py = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === UPPER && GEO.depth[i] > 2.4 && GEO.depth[i] < 2.6) { [px, py] = GEO.cellCentre(i); break; }
    const a = F.add('perch', px, py, null, 3, 40); a.z = GEO.depthAt(px, py) - 0.1;
    const feed = (benthGm2, zooUgl) => {
      for (const j of ch.bedCells) ch.benth[j] = benthGm2 * A2; for (let j = 0; j < G.NCELL; j++) { ch.zooD[j] = zooUgl / PLANKTON.UGL; ch.zooC[j] = 0; ch.zooR[j] = 0; }
      a.c = e.colAt(a.x, a.y); a.j = e.cellAt(a.x, a.y, a.z); a.bed = GEO.depthAt(a.x, a.y); a.jb = F.bedCell(a.c, a.bed); a.T = 20; a.o2 = 1; a.gut = 0; a.gutE = 0;
      const b0 = F.stats.food.benth, z0 = F.stats.food.zoo; F._feed(a, 0, F._energetics(a, a.s.sp.bio, 20, 1e-9), 1, EW);
      return [F.stats.food.benth - b0, F.stats.food.zoo - z0];
    };
    const [bA, zA] = feed(12, 5), [bB, zB] = feed(3, 300);
    check('the bed or the open water: a perch school eats worms where they are rich and the zooplankton scarce, zooplankton where it is rich and the bed bare — not both at once',
      bA > 0 && zA < 0.05 * bA && zB > 0 && bB === 0, `rich bed: ${bA.toFixed(2)} g worms, ${zA.toFixed(3)} g zooplankton; bare bed, rich water: ${bB.toFixed(2)} g worms, ${zB.toFixed(2)} g zooplankton`); }
  // THE FORAGING FOOTPRINT: a fish whose own patch is stripped to its refuge still feeds from the bed about it (the ground it
  // works over the hours a sim second stands for), and the take is spread over that ground
  { seed(522); const e = new Env3({ col: 5 * CS, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    let px = 0, py = 0; for (let i = 0; i < GEO.N; i++) if (GEO.body[i] === UPPER && GEO.depth[i] > 2.4 && GEO.depth[i] < 2.6) { [px, py] = GEO.cellCentre(i); break; }
    const a = F.add('whiteperch', px, py, null, 3, 60); a.z = GEO.depthAt(px, py) - 0.1;
    for (const j of ch.bedCells) ch.benth[j] = 10 * A2; for (let j = 0; j < G.NCELL; j++) { ch.zooD[j] = 0; ch.zooC[j] = 0; ch.zooR[j] = 0; }
    a.c = e.colAt(a.x, a.y); a.j = e.cellAt(a.x, a.y, a.z); a.bed = GEO.depthAt(a.x, a.y); a.jb = F.bedCell(a.c, a.bed); a.T = 20; a.o2 = 1; a.gut = 0;
    for (const j of F.colBed[a.c]) ch.benth[j] = 3 * A2;   // (its own column bare to the refuge)
    const before = Float32Array.from(ch.benth); const b0 = F.stats.food.benth; F._feed(a, 0, F._energetics(a, a.s.sp.bio, 20, 1e-9), 1, EW);
    let cols = new Set(); for (const j of ch.bedCells) if (ch.benth[j] < before[j] - 1e-6) cols.add(G.colOfCell[j]);
    check('the foraging footprint: a white perch school on a stripped patch still feeds from the bed about it, its take spread over the ground it works in a day',
      F.stats.food.benth - b0 > 0 && cols.size >= 5 && !cols.has(a.c), `${(F.stats.food.benth - b0).toFixed(2)} g from ${cols.size} columns within ${a.s.forageR} m`); }
}

// ============================================================
//  FISH 3-D, stage 6b — the food web through a summer: the zooplankton's June peak, the fish's share of it, the young's growth
// ============================================================
console.log('\n— fish 3-D: the food web through a summer —');
if (run('foodweb')) {
  const { Env3 } = await import('../src/w3/env3.js');
  const { Fish3 } = await import('../src/w3/fish3.js');
  const { PLANKTON } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  // MAY 12 → SEPTEMBER (the coarse grid): the zooplankton peaks in June (the spring Daphnia peak) while the fish take a minority
  // of its production — the adults turn to the bed when it thins (K_ZOO); a strong cohort of young then grazes it down in
  // midsummer (Mills & Forney 1983); the young grow to fingerlings by September
  { seed(531); const e = new Env3({ col: 10 * CS, yf0: 0.2 }), F = new Fish3(e), ch = e.chem;
    let peak = 0, jp0 = 0, je0 = 0, jp1 = 0, je1 = 0, B = [], bassL = 0, riseN = 0; const riseK = new Set();   // (rises: the surface's insects taken, for the view)
    for (let i = 0; i < 120 * 49.3; i++) {
      F.step(FB); e.step(EW); for (let q = 0; q < F.rises.length; q += 6) { riseN += F.rises[q + 5]; riseK.add(F.rises[q + 3]); }
      if (i % 50 === 0) {
        for (const q of F.yoy) if (q.alive && q.s.key === 'bass' && q.n >= 10) bassL = Math.max(bassL, q.L);   // (stage 7b)
        const yf = e.yearFrac(), z = (e.mean(ch.zooD) + e.mean(ch.zooC)) * PLANKTON.UGL, eat = F.stats.food.zoo + F.stats.food.yZoo;
        if (yf >= 0.25 && yf < 0.333) { peak = Math.max(peak, z); if (!jp0) { jp0 = ch.zooProd; je0 = eat; } jp1 = ch.zooProd; je1 = eat; }
        B.push(F.biomass() / 1000 / F.lakeHa);
      }
    }
    const share = (je1 - je0) / Math.max(1e-9, jp1 - jp0), c = F.census();
    // (the share: 31–47 % at stage 6b, 43–54 % on 3 seeds by stage 7c, 50–58 % with the mussels (7d), whose filtering takes part
    // of the zooplankton's algae — Strayer et al. 1999. The guard is against the predator pit, where fish took 70–110 %)
    check('June: the zooplankton peaks above 100 µg/L (the spring Daphnia peak) while the fish eat well under all of its production (the predator pit took 70–110 %) — the adults turn to the bed as it thins',
      peak > 100 && share < 0.65, `peak ${peak.toFixed(0)} µg/L; fish took ${(share * 100).toFixed(0)} % of June's production`);
    check('by September the young are fingerlings (perch and suckers ≥ 4.5 cm — real 5–8) and the lakes\' fish stay within 60–170 kg/ha',
      c.perch.yoyL >= 4.5 && c.sucker.yoyL >= 4.5 && Math.min(...B) > 60 && Math.max(...B) < 170,
      `young: perch ${f1(c.perch.yoyL)}, sucker ${f1(c.sucker.yoyL)}, white perch ${f1(c.whiteperch.yoyL)}, pumpkinseed ${f1(c.sunfish.yoyL)} cm; biomass ${Math.min(...B).toFixed(0)}–${Math.max(...B).toFixed(0)} kg/ha`);
    // (stage 7b) THE LITTORAL'S OWN FOOD: the weeds' insects and snails, and the surface's emerging and fallen insects
    const fd = F.stats.food, wShare = fd.weed / Math.max(1e-9, fd.weed + fd.benth);
    check('the weeds feed the fish too: adults take their insects (and pumpkinseed their snails) as a minority of their bed food, the young their small fauna, fish near the surface the hatch',
      wShare > 0.02 && wShare < 0.4 && fd.yWeed > 0 && fd.surf > 0, `weeds ${(wShare * 100).toFixed(0)} % of the adults' bed food (${(fd.weed / 1000).toFixed(0)} kg; worms and scuds ${(fd.benth / 1000).toFixed(0)}); the young ${(fd.yWeed / 1000).toFixed(1)} kg; the surface ${(fd.surf / 1000).toFixed(2)} kg`);
    // RISES (the human: "the bugs on the surface and bass or some fish jumping to get them"): the fish's surface feeding counted as
    // single insects for the view — never more insects than they ate, only from the insect eaters
    { const { F3, KEYS3, S3 } = await import('../src/w3/fish3.js'), kinds = [...riseK].map(k => KEYS3[k]);
      check('the fish\'s surface feeding becomes RISES for the view: insects taken one by one (never more than were eaten), only by the insect eaters',
        riseN > 100 && riseN * F3.INSECT_G <= fd.surf * 1.0001 && kinds.every(k => S3[k].sp.diet.insect),
        `${riseN.toLocaleString()} rises (${(riseN * F3.INSECT_G / 1000).toFixed(1)} of the ${(fd.surf / 1000).toFixed(1)} kg eaten at the surface: the rest past a block's cap) by ${kinds.join(', ')}`); }
    check('young smallmouth cross from copepods to midge larvae (1.5–2.5 cm) and grow on insects past 3 cm by midsummer (Lake Opeongo 3.8–4.6 by late July)',
      bassL >= 3, `the largest school of young smallmouth reached ${f1(bassL)} cm`);
    // (stage 7c) CRAYFISH: the adult smallmouth's staple, some of the pickerel's and bullheads', hardly the perch's; the fish take
    // part of the crayfish's production, not all of it
    const cb = F.stats.crayBy, ib = F.stats.intakeBy, sh = k => (cb[k] || 0) / Math.max(1e-9, ib[k] || 0), Lt = e.lit, crShare = Lt.crEaten / Math.max(1e-9, Lt.crProd);
    check('crayfish: the adult smallmouth\'s staple (over a third of what they eat), a share of the pickerel\'s and bullheads\', a sliver of the perch\'s; the fish take part of the crayfish\'s production',
      sh('bass') > 0.33 && sh('pike') > 0.1 && sh('catfish') > 0.02 && sh('perch') < 0.15 && crShare > 0.05 && crShare < 0.7,
      `crayfish in the diet: smallmouth ${(sh('bass') * 100).toFixed(0)} %, pickerel ${(sh('pike') * 100).toFixed(0)} %, bullhead ${(sh('catfish') * 100).toFixed(0)} %, perch ${(sh('perch') * 100).toFixed(0)} %; fish ate ${(crShare * 100).toFixed(0)} % of the crayfish production (${(Lt.crEaten / 1000).toFixed(0)} of ${(Lt.crProd / 1000).toFixed(0)} kg)`); }
  // SHORT OF O₂ UNDER THE ICE: a school in near-anoxic water swims ACROSS toward the oxygenated water beside it (the inflows,
  // the brook's mouth in a real winter), not only up (Fish3._o2Better)
  { seed(532); const e = new Env3({ col: 10 * CS, yf0: 0.95 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    let px = 0, py = 0;
    for (let i = 0; i < GEO.N && !px; i++) { if (GEO.body[i] !== UPPER || GEO.depth[i] < 2.2) continue; const [x, y] = GEO.cellCentre(i); let ok = true; for (let d = 4; d <= 30; d += 2) if (GEO.bodyAt(x + d, y) !== UPPER || GEO.depthAt(x + d, y) < 1.5) ok = false; if (ok) { px = x; py = y; } }
    const a = F.add('perch', px, py, 1.2, 3, 30), lo = 0.3 * a.o2Crit;
    const setO2 = () => { for (let c = 0; c < G.NC; c++) for (let k = 0; k < G.nL[c]; k++) ch.o2[G.cell0[c] + k] = G.cx[c] > px + 12 ? 1.0 : lo; };
    setO2(); const x0 = a.x;
    for (let i = 0; i < 200; i++) { F.step(FB); if (i % 25 === 0) setO2(); }
    check('short of O₂ under the ice, a school swims across the lake toward better water, not only up (fish crowd oxygenated inlets in a winterkill — Cooper & Washburn 1946)',
      a.alive && a.x > x0 + 8 && ch.o2[a.j] > lo, `moved ${f1(a.x - x0)} m east toward the oxygenated water (from ${f1(x0)}); O₂ where it is now ${(ch.o2[a.j] * 100).toFixed(0)} % of saturation`); }
}

// ============================================================
//  PLANTS 3-D, stage 7a — the weeds on the bed (src/w3/plants3.js): the depth limit in coloured water, the coves, the
//  seasons, the O₂ of a dense bed
// ============================================================
console.log('\n— plants 3-D: the weeds (and their invertebrates, stage 7b) —');
if (run('plants')) {
  const { Env3, CLOCK3 } = await import('../src/w3/env3.js');
  const { FORMS3 } = await import('../src/w3/plants3.js');
  const { ENV } = await import('../src/config.js');
  const { seed } = await import('../src/core.js');
  // MID-MAY → THE NEXT AUGUST without fish (the coarse grid): a winter between two growing seasons
  { seed(541); const e = new Env3({ col: 10 * CS, yf0: 0.2 }), P = e.plants, G = e.G, ch = e.chem;
    // (stage 7f: the plants are species — the submerged canopy's four summed, the floating-leaved three)
    const SCf = FORMS3.map((F, f) => F.form === 'SC' ? f : -1).filter(f => f >= 0), FLf = FORMS3.map((F, f) => F.form === 'FL' ? f : -1).filter(f => f >= 0);
    const scB = i => SCf.reduce((t, f) => t + P.Bs[f][i], 0), flB = i => FLf.reduce((t, f) => t + P.Bs[f][i], 0), scTot = () => SCf.reduce((t, f) => t + P.total(f), 0);
    const snap = () => {
      const shoots = FORMS3.map((F, f) => P.total(f)), store = FORMS3.map((F, f) => { let s = 0; for (let i = 0; i < P.cells.length; i++) s += P.Br[f][i] * G.bedA[P.cells[i]]; return s; });
      // (vegetated: bed under a tenth or more of a stand of any species — stage 7f: the low carpets fill little of the water, so
      // the weed volume no longer says where the weeds are)
      let bedA = 0, veg = 0, edge = 0; for (let i = 0; i < P.cells.length; i++) { const A = G.bedA[P.cells[i]]; bedA += A; if (FORMS3.reduce((t, F, f) => t + P.Bs[f][i] / F.Bmax, 0) > 0.1) veg += A; }
      let deep = 0; for (let i = 0; i < P.cells.length; i++) if (scB(i) > 30) deep = Math.max(deep, P.zb[i]);
      // (stage 7g: the canopy's vegetated share — the angiosperms, research ~30 % at a ~2.3-m limit — apart from the stoneworts'
      // low meadow, which grows deeper: charophytes' Zc 4.5–6.8 m at Secchi 2.5–4 against the angiosperms' 3.7–4.8, Chambers &
      // Kalff 1985; macrophytes.md. Now the evergreens keep their shoots, Nitella's sparse meadow alone adds ~15–20 % of the bed)
      // (stage 7h: BY STAND AREA — each species' shoots / its stand's peak, the share of its cell its stand holds; the research's
      // "bed covered", as plants3's cover — the presence count, > 0.1 of any stand, counted a cell with a thin stand as vegetated)
      const iN = FORMS3.findIndex(F => F.key === 'nitella'); let vegC = 0, vegP = 0, nitZ = 0;
      for (let i = 0; i < P.cells.length; i++) { const A = G.bedA[P.cells[i]]; const st = FORMS3.reduce((t, F, f) => t + (f === iN ? 0 : Math.min(1, P.Bs[f][i] / F.Bmax)), 0); vegC += Math.min(1, st) * A; if (st > 0.1) vegP += A; if (P.Bs[iN][i] > 3) nitZ = Math.max(nitZ, P.zb[i]); }
      // the floating-leaved and emergent forms' share of the vegetated bed (by the area their stands cover)
      let flem = 0, all = 0; for (let i = 0; i < P.cells.length; i++) { const A = G.bedA[P.cells[i]]; let any = 0, fe = 0; for (let f = 0; f < FORMS3.length; f++) { const cov = P.Bs[f][i] / FORMS3[f].Bmax; if (cov > 0.1) { any = 1; if (FORMS3[f].window) fe = 1; } } all += any * A; flem += fe * A; }
      let stand = 0; for (let i = 0; i < P.cells.length; i++) stand += Math.min(1, FORMS3.reduce((t, F, f) => t + Math.min(1, P.Bs[f][i] / F.Bmax), 0)) * G.bedA[P.cells[i]];   // (every form's stands: the beds' area)
      return { shoots, store, veg: veg / bedA, vegC: vegC / bedA, vegP: vegP / bedA, stand, nitZ, deep, flem: flem / Math.max(1, all), secchi: ch.secchi() };
    };
    // (stage 7b: the weeds' invertebrates, snails and the surface — littoral3.js — over the same run)
    const Lt = e.lit, litSnap = () => {
      let fu = 0, nf = 0; const lit = [], can = [];
      for (let i = 0; i < P.cells.length; i++) {
        let b = 0; for (let f = 0; f < FORMS3.length; f++) b += P.Bs[f][i];
        const occ = SCf.reduce((t, f) => t + P.Bs[f][i] / FORMS3[f].Bmax, 0); if (occ > 0.3) can.push([occ, i]);
        if (P.zb[i] < 3) lit.push([b, i]);
      }
      // (the full canopy: the twenty densest pondweed beds — stage 7f: four species share the canopy's room and seldom fill it)
      let fb = 0; can.sort((p, q) => q[0] - p[0]); for (const [, i] of can.slice(0, 20)) { fu += Lt.S[i] + Lt.L[i]; nf++; for (let f = 0; f < FORMS3.length; f++) fb += P.Bs[f][i]; }
      // (the barest tenth of the lit bed < 3 m: every shallow cell grows a little)
      lit.sort((p, q) => p[0] - q[0]); const bare = lit.slice(0, Math.max(1, Math.round(lit.length / 10)));
      const ba = bare.reduce((s, [, i]) => s + Lt.S[i] + Lt.L[i], 0) / bare.length, snB = bare.reduce((s, [, i]) => s + Lt.sn[i], 0) / bare.length;
      return { full: fu / Math.max(1, nf), perG: fu / Math.max(1e-9, fb) * 1000, fullB: fb / Math.max(1, nf), nf, bare: ba, bareB: bare[bare.length - 1][0], snBare: snB, ...Lt.stock() };
    };
    let peak1 = 0, feb = null, aug = null, augL = null, em0 = -1, emSpring = 0, emLate = 0, emPrev = 0, julBank = -1, julOpen = -1;
    let crRel = -1, crSep = null, crAug = null;   // (stage 7c: the crayfish)
    // (stage 7g: the plants' roles — last year's stems through the winter, the bladderworts' catch, the rosettes' sand, the pads'
    // insects, the spawning structure in spring against summer)
    const deadT = () => P.cells.reduce((t, j, i) => t + P.dead[i] * G.bedA[j], 0), bandS = (u, lo, hi) => { let s = 0, n = 0; for (let i = 0; i < P.cells.length; i++) { const z = P.zb[i]; if (z >= lo && z <= hi && !P.brook[i]) { const A = G.bedA[P.cells[i]]; s += P.spawnS[u][i] * A; n += A; } } return s / Math.max(1e-9, n); };
    let deadMax = 0, deadApr = -1, spApr = null, spJul = null, uAug = 0; const iU = FORMS3.findIndex(F => F.key === 'bladderwort');
    // (stage 7d: the mussels — the water of the cells they sit in, and what they clear of it in July and in January)
    let muV = 0; for (let i = 0; i < Lt.cells.length; i++) if (Lt.mu[i] > 0) muV += G.vol[Lt.cells[i]] * 1000;
    const muClr = { jul: [0, 0, -1], jan: [0, 0, -1] };   // [litres cleared, days, the clearance count at the start]
    const crZones = () => { const z = [[0, 0], [0, 0], [0, 0]]; for (let i = 0; i < Lt.cells.length; i++) { const a = G.bedA[Lt.cells[i]], K = Lt.Kcr[i], k = K >= 20 ? 0 : K > 2 ? 1 : 2; z[k][0] += (Lt.crA[i] + Lt.crY[i]) * a; z[k][1] += a; } return z.map(v => v[0] / Math.max(1, v[1])); };
    for (let t = 0; t < 1.25 * CLOCK3.YEAR_LEN; t += EW) {
      e.step(EW); const yf = e.yearFrac(), y = t / CLOCK3.YEAR_LEN;
      if (y < 0.5 && Math.round(t * 5) % 250 === 0) peak1 = Math.max(peak1, scTot());
      if (!feb && y > 0.5 && yf > 0.95) feb = snap();
      if (!aug && y > 1.0 && yf > 0.44) { aug = snap(); augL = litSnap(); }
      if (em0 < 0 && y >= 0.25) { em0 = Lt.emerged; emPrev = Lt.emerged; }
      if (em0 >= 0) { const d = Lt.emerged - emPrev; emPrev = Lt.emerged; if (yf >= 0.15 && yf < 0.42) emSpring += d; else emLate += d; }
      for (const [k, a, b] of [['jul', 0.36, 0.42], ['jan', 0.84, 0.9]]) if (y > 1.0 - (k === 'jan' ? 1 : 0) && y < 1.25 && yf >= a && yf < b) { const r = muClr[k]; if (r[2] < 0) r[2] = Lt.muCleared; r[0] = Lt.muCleared - r[2]; r[1] += EW / DAYS; }
      if (crRel < 0 && y < 0.5 && Lt.crReleased) crRel = Lt.stock().crYn;
      if (!crSep && y < 0.5 && yf > 0.5) crSep = Lt.stock();
      if (!crAug && y > 1.0 && yf > 0.44) crAug = { ...Lt.stock(), zones: crZones() };
      if (y < 1) deadMax = Math.max(deadMax, deadT());
      if (deadApr < 0 && y > 0.5 && yf >= 0.12 && yf < 0.3) { deadApr = deadT(); spApr = { rigid: bandS('rigid', 0.5, 2), mat: bandS('mat', 0.3, 1) }; }
      if (!spJul && y > 1.0 && yf > 0.38) spJul = { rigid: bandS('rigid', 0.5, 2), mat: bandS('mat', 0.3, 1), plant: bandS('plant', 0.2, 1) };
      if (y > 1.0 && yf > 0.44 && !uAug) uAug = P.total(iU);
      if (julBank < 0 && y > 1.0 && yf > 0.38) { let sb = 0, ab = 0, so = 0, ao = 0; for (let c = 0; c < G.NC; c++) { if (Lt.bank[c] > 0) { sb += Lt.surfT[c] * G.area[c]; ab += G.area[c]; } else { so += Lt.surfT[c] * G.area[c]; ao += G.area[c]; } } julBank = sb / ab; julOpen = so / Math.max(1, ao); }
    }
    const bedAll = P.cells.reduce((s, j) => s + G.bedA[j], 0), vegA = aug.vegC * bedAll, emYr = (Lt.emerged - em0) / vegA / 6;   // (g DW: insects ~1/6 dry; per m² of the weed BEDS — the canopy's, lilies', emergents' and rosettes' stands' area, stage 7h — not the deep Nitella meadow's sparse carpet, which emergence studies of the vegetated littoral don't sample)
    const sum = a => a.reduce((s, v) => s + v, 0);
    check("the second summer: weeds (the canopy, lilies, emergents, rosettes) in stands over about a fifth to a half of the bed (research ~20–30 %), the submerged canopy down to 1.3–3.2 m in coloured water (Secchi 2.5–4 m; research 2–2.7 m — colour lowers Duarte's Zmc = 1.9 + 0.63·Secchi ≈ 4 m), the stoneworts' meadow deeper (charophytes' Zc beyond the angiosperms')",
      !!aug && aug.vegC > 0.2 && aug.vegC < 0.5 && aug.deep >= 1.3 && aug.deep <= 3.2 && aug.secchi > 2.5 && aug.secchi < 4 && aug.nitZ > aug.deep,
      aug ? `in stands ${(aug.vegC * 100).toFixed(0)} % of the bed (present on ${(aug.vegP * 100).toFixed(0)} %; ${(aug.veg * 100).toFixed(0)} % with Nitella's sparse meadow, to ${f2(aug.nitZ)} m), canopy to ${f1(aug.deep)} m, Secchi ${f1(aug.secchi)} m; shoots ${aug.shoots.map(v => (v / 1000).toFixed(0)).join('/')} kg (${FORMS3.map(F => F.key).join('/')})` : 'no August');
    check('lilies and emergent stands keep to the sheltered coves: a minority of the vegetated bed (the submerged canopy holds the open littoral)',
      !!aug && aug.flem < 0.4, aug ? `floating-leaved or emergent on ${(aug.flem * 100).toFixed(0)} % of the vegetated bed` : '');
    // (stage 7f: per gram of plant — Cyr & Downing's ~5 mg DW of animals per g, ~30 mg wet; a full single-form canopy of 150+ g
    // carried 2–9 g/m², Kirby's 4,000–17,000 animals/m², but four species now share the canopy and its densest beds are lighter)
    check('the weeds\' invertebrates: the densest pondweed beds carry 10–80 mg wet per g of plant in their second August (Cyr & Downing ~5 mg DW/g), ≥ 5× the bare lit bed\'s per m²',
      augL.nf > 0 && augL.perG >= 10 && augL.perG <= 80 && augL.full >= 5 * augL.bare, `densest canopy ${f2(augL.full)} g/m² on ${f1(augL.fullB)} g DW of plants (${f1(augL.perG)} mg wet per g; ${augL.nf} cells), the barest lit bed (≤ ${f1(augL.bareB)} g DW of plants/m²) ${f2(augL.bare)}; the beds' small ${f2(augL.vegS)}, large ${f2(augL.vegL)}`);
    check('the snails of a soft-water lake: 0.5–5 g wet/m² in the weed beds, under 0.5 on the bare mud (calcium caps them — Vermont soft lakes)',
      augL.vegSn >= 0.5 && augL.vegSn <= 5 && augL.snBare < 0.5, `weed beds ${f2(augL.vegSn)}, bare ${f2(augL.snBare)} g wet/m²`);
    check('insects emerge from the weeds: 0.5–2 g DW/m² of the vegetated littoral a year (~30 % of their production), the spring hatch the larger',
      emYr >= 0.5 && emYr <= 2 && emSpring > emLate, `${f2(emYr)} g DW/m² a year; spring–early summer ${(emSpring / 1000).toFixed(1)} kg, late summer–autumn ${(emLate / 1000).toFixed(1)} kg`);
    check('crayfish (virile): 5–20 g/m² over the whole lakes (Michigan 4.6–21), 0.3–1.5 adults/m², the rocky shallows ≥ 3× the bare mud and the weed beds between',
      !!crAug && crAug.crA + crAug.crY >= 5 && crAug.crA + crAug.crY <= 20 && crAug.crAn >= 0.3 && crAug.crAn <= 1.5 && crAug.zones[0] >= 3 * crAug.zones[2] && crAug.zones[1] > crAug.zones[2],
      crAug ? `${f1(crAug.crA + crAug.crY)} g/m² (adults ${f2(crAug.crAn)}/m², young ${f1(crAug.crYn)}/m²); shallows ${f1(crAug.zones[0])}, weed beds ${f1(crAug.zones[1])}, mud ${f1(crAug.zones[2])} g/m²` : 'no August');
    check('the year\'s young crayfish: 5–20/m² released in early July, 60–90 % gone by mid-September (cannibalism), ~0.5–2 g each by then',
      crRel >= 5 && crRel <= 20 && !!crSep && crSep.crYn / crRel >= 0.1 && crSep.crYn / crRel <= 0.4 && crSep.wY >= 0.5 && crSep.wY <= 2,
      crSep ? `${f1(crRel)}/m² released; ${f1(crSep.crYn)}/m² left in mid-September (${((1 - crSep.crYn / crRel) * 100).toFixed(0)} % gone) at ${f2(crSep.wY)} g` : 'no September');
    { const z = { edge: [0, 0], firm: [0, 0], cove: [0, 0], deep: [0, 0] }, L3 = Lt.constructor.LIT3 || null;
      for (let i = 0; i < Lt.cells.length; i++) { const K = Lt.Kmu[i], a = G.bedA[Lt.cells[i]], k = K <= 3 ? (P.zb[i] < 0.5 ? 'edge' : 'deep') : K >= 30 ? 'cove' : 'firm'; z[k][0] += Lt.mu[i] * a; z[k][1] += a; }
      const d = k => z[k][0] / Math.max(1, z[k][1]), jul = muClr.jul[1] > 0 ? muClr.jul[0] / muClr.jul[1] / muV * 100 : -1, jan = muClr.jan[1] > 0 ? muClr.jan[0] / muClr.jan[1] / muV * 100 : -1;
      check('freshwater mussels (eastern elliptio): 5–25/m² on the firm margins, 25–60 in the sheltered coves, 0.5–5 on the deep mud (Maine 0.4–27.6; Connecticut 32–60)',
        d('firm') >= 5 && d('firm') <= 25 && d('cove') >= 25 && d('cove') <= 60 && d('deep') >= 0.5 && d('deep') <= 5,
        `firm ${f1(d('firm'))}, coves ${f1(d('cove'))}, deep mud ${f1(d('deep'))}, the scoured edge ${f1(d('edge'))} /m²`);
      check('the mussels filter the water over them in summer (0.4–24 % of it a day — the research\'s bracket) and nothing in winter (burrowed)',
        jul >= 0.4 && jul <= 30 && jan >= 0 && jan < 0.1, `July ${f1(jul)} %/day, January ${f2(jan)} %/day of the water they sit in`); }
    check('the land\'s insects fall on the water by the forested banks: in July the bank columns\' surface holds ≥ 5× the open water\'s',
      julBank > 5 * julOpen && julBank > 0, `${(julBank * 1000).toFixed(1)} vs ${(julOpen * 1000).toFixed(2)} mg wet/m²`);
    check('the weeds die back in autumn and overwinter as storage and evergreen shoots (every form keeps some), then grow again',
      !!feb && sum(feb.shoots) < 0.15 * peak1 * 3 && feb.store.every(v => v > 0) && SCf.reduce((t, f) => t + aug.shoots[f], 0) > 1.1 * SCf.reduce((t, f) => t + feb.store[f], 0),   // (stage 7f: Robbins' pondweed, evergreen, keeps 70 % — the canopy regrows past its winter stores)
      feb ? `February: shoots ${(sum(feb.shoots) / 1000).toFixed(1)} kg, storage ${feb.store.map(v => (v / 1000).toFixed(0)).join('/')} kg; the canopy ${(SCf.reduce((t, f) => t + aug.shoots[f], 0) / 1000).toFixed(0)} kg by August` : 'no February');
    check("last year's emergent stems stand through the winter (bulrush's culms): in April a quarter to two-thirds of the autumn's, falling into the bed by summer",
      deadMax > 0 && deadApr > 0.2 * deadMax && deadApr < 0.7 * deadMax, `${(deadMax / 1000).toFixed(0)} kg DW standing after the die-back, ${(deadApr / 1000).toFixed(0)} kg in April`);
    check("the bladderworts eat zooplankton: their traps take 0.5–8 % of the lakes' zooplankton production, and on their catch the stand holds through its second summer (rootless — on the water alone it died out)",
      P.caught > 0.005 * ch.zooProd && P.caught < 0.08 * ch.zooProd && uAug > 50e3, `caught ${(P.caught / 1000).toFixed(0)} kg wet of ${(ch.zooProd / 1000).toFixed(0)} kg produced (${(100 * P.caught / ch.zooProd).toFixed(1)} %); the stand ${(uAug / 1000).toFixed(0)} kg DW in its second August`);
    { const L = []; for (let i = 0; i < P.cells.length; i++) { if (!P.mineral[i] || P.brook[i] || P.zb[i] < 0.5 || P.zb[i] > 1.5) continue; const j = P.cells[i]; L.push([ch.lawn[j], ch.sedP[j]]); }
      L.sort((p, q) => p[0] - q[0]); const n3 = Math.floor(L.length / 3), mean = (a, k) => a.reduce((t, v) => t + v[k], 0) / Math.max(1, a.length), lo = L.slice(0, n3), hi = L.slice(L.length - n3);
      check("the rosettes oxidise the sand: the lake sand at their depths under the thickest third of lawns holds more of its P than under the thinnest third (lobelia: > 97 % of its O₂ through its roots)",
        n3 > 10 && mean(hi, 1) > 1.15 * mean(lo, 1), `bound P ${f2(mean(hi, 1))} under lawns of ${f2(mean(hi, 0))} cover, ${f2(mean(lo, 1))} under ${f2(mean(lo, 0))} (${L.length} cells)`); }
    check("the lily pads' grazers (beetles, caterpillars) drop food on the water: some, but a small share beside the land's insects",
      Lt.padFallen > 0 && Lt.padFallen < 0.3 * Lt.fallen, `${(Lt.padFallen / 1000).toFixed(2)} kg wet from the pads, ${(Lt.fallen / 1000).toFixed(1)} kg from the banks`);
    check("spawning structure: in April the perch's rigid structure (last year's stems, wood, Nitella) and the pickerel's mats are scarcer than in July's weeds",
      !!spApr && !!spJul && spApr.rigid < spJul.rigid && spApr.mat < spJul.mat && spApr.rigid > 0.05, spApr && spJul ? `April rigid ${f2(spApr.rigid)}, mat ${f2(spApr.mat)}; July rigid ${f2(spJul.rigid)}, mat ${f2(spJul.mat)}, live plants ${f2(spJul.plant)}` : 'missing');
    // A DENSE BED'S O₂: on a calm clear summer day the water in a thick canopy rises by day and falls by night more than bare
    // water at the same depth does
    // The eight densest canopy beds at 0.8–1.6 m, each against the barest bed at its depth AND with as much bed under as much
    // water (the lit bed's own algae swing thin water hard: like with like, so only the weeds differ), their swings averaged —
    // one bed alone may lie where the water is flushed (the lidar-and-photo beds of 2026-10-16 moved the densest one there)
    e.setWeather(0);
    const dense = []; for (let i = 0; i < P.cells.length; i++) { const tot = scB(i) + flB(i); if (P.zb[i] > 0.8 && P.zb[i] < 1.6) dense.push([tot, P.cells[i]]); }
    dense.sort((p, q) => q[0] - p[0]); const pairs = [], used = new Set();
    for (const [tot, jb] of dense.slice(0, 8)) {
      const rb = G.bedA[jb] / G.vol[jb]; let low = 1e9, jo = -1;
      for (let i = 0; i < P.cells.length; i++) { const c = P.cells[i], t2 = FORMS3.reduce((s, F, f) => s + P.Bs[f][i], 0), r = G.bedA[c] / G.vol[c];
        if (!used.has(c) && t2 < low && Math.abs(G.zMid[c] - G.zMid[jb]) < 0.3 && r > 0.7 * rb && r < 1.4 * rb) { low = t2; jo = c; } }
      if (jo >= 0) { used.add(jo); pairs.push({ jb, jo, tot, bMin: 9, bMax: 0, oMin: 9, oMax: 0 }); }
    }
    for (let t = 0; t < CLOCK3.DAY_LEN; t += EW) { e.step(EW); for (const p of pairs) { const b = ch.o2[p.jb], o = ch.o2[p.jo]; p.bMin = Math.min(p.bMin, b); p.bMax = Math.max(p.bMax, b); p.oMin = Math.min(p.oMin, o); p.oMax = Math.max(p.oMax, o); } }
    const sb = pairs.reduce((s, p) => s + p.bMax - p.bMin, 0) / Math.max(1, pairs.length) * ENV.O2_MGL, so = pairs.reduce((s, p) => s + p.oMax - p.oMin, 0) / Math.max(1, pairs.length) * ENV.O2_MGL;
    const best = pairs.reduce((s, p) => s + p.tot, 0) / Math.max(1, pairs.length);
    check('dense weed beds\' water swings in O₂ by day and night more than bare water at their depth (production by day, respiration always)',
      pairs.length >= 4 && sb > 1.3 * so, `${pairs.length} beds (mean ${best.toFixed(0)} g DW/m²): ${f2(sb)} mg/L a day; matched bare: ${f2(so)} mg/L`); }
  // (stage 7h) THE LAKES' WEEDS AT THEIR START, AND THE WAVES: a lake opens on its generated beds (plants3init.js — the model's own
  // after years grown from the bare seeding, tools/hotbrook/build_plants3.mjs), not the uniform lawn, and by July holds stands on a
  // fifth to a half of its bed (the canopy, lilies, emergents, rosettes; research ~20–25 %, rake hits 4–56 % of littoral points —
  // weed_bed_structure.md), the storm waves keeping the exposed shallows bare of the canopy (Chambers 1987: the submerged plants'
  // upper limit is the wave-mixing depth — plants3 zWave from env3's fetch)
  { const { SEASON } = await import('../src/config.js');
    seed(561); const e = new Env3({ yf0: SEASON.START_YF }), P = e.plants, G = e.G;
    for (let t = 0; t < 60 * CLOCK3.DAY_LEN; t += 1752) e.step(1752);   // (to mid-July)
    let bedA = 0, stA = 0, wA = 0, wSC = 0, dA = 0, dSC = 0; const SC = FORMS3.map(F => F.form === 'SC'), DM = FORMS3.map(F => F.form === 'DM');
    for (let i = 0; i < P.cells.length; i++) {
      const A = G.bedA[P.cells[i]], c = P.col[i], z = P.zb[i]; if (P.brook[i]) continue; bedA += A;
      let st = 0, sc = 0; FORMS3.forEach((F, f) => { const phi = Math.min(1, P.Bs[f][i] / F.Bmax); if (!DM[f]) st += phi; if (SC[f]) sc += phi; });
      stA += Math.min(1, st) * A;
      if (z < 0.5 * P.zWave[c]) { wA += A; wSC += Math.min(1, sc) * A; } else if (z > P.zWave[c] && z < 2.5) { dA += A; dSC += Math.min(1, sc) * A; }
    }
    const share = stA / bedA, wv = wSC / Math.max(1, wA), dp = dSC / Math.max(1, dA);
    check("a lake opens on its generated weed beds (the model's own after years, not a uniform lawn): stands on a fifth to a half of the bed by July, the storm waves keeping the exposed shallows bare of the canopy",
      P.fromInit && share > 0.15 && share < 0.5 && wv < 0.3 * dp, `generated start ${!!P.fromInit}; stands (no Nitella meadow) ${(100 * share).toFixed(0)} % of the bed; canopy stand share in the wave zone ${f2(wv)} vs ${f2(dp)} below it to 2.5 m`); }
}

// ============================================================
//  THE GPU ENGINE's DATA (src/w3/gpu/layout.js — docs/GPU_SIM.md G1): the kernels run only in a browser (tools/gpu/g1_check.html
//  checks each against fish3.js); here, in Node, what feeds them — the fish packed into the struct of arrays and back, every field
//  exact; the statics and the WGSL constants generated from the CPU sim's config without a NaN or a hole
// ============================================================
console.log('\n— the GPU engine\'s data —');
if (run('gpu')) {
  const { Env3 } = await import('../src/w3/env3.js'); const { Fish3 } = await import('../src/w3/fish3.js'); const { seed } = await import('../src/core.js');
  const Lg = await import('../src/w3/gpu/layout.js');
  seed(77); const e = new Env3({ yf0: 0.4 }), F = new Fish3(e, { young: true }); F.step(FB); e.step(FB);
  const fish = F.fish.filter(a => a.alive), cap = fish.length + 64, P = Lg.packAgents(fish, cap);
  const copies = fish.map(a => { const b = Object.assign(Object.create(Object.getPrototypeOf(a)), a); b.g = new Float32Array(a.g.length); b.lw = new Float32Array(a.lw.length); b.h = new Float32Array(a.h.length); b.o = new Float32Array(a.o.length); b.genes = new Float32Array(a.genes.length); for (const k of ['x', 'y', 'z', 'L', 'W', 'gut', 'age', 'mateCd', 'n']) b[k] = -7; return b; });
  const bySlot = []; for (const [a, i] of P.slot) bySlot[i] = copies[fish.indexOf(a)];
  Lg.unpackAgents(P, cap, bySlot);
  let bad = 0; const skip = new Set(['flags', 'prey', 'threat', 'mate', 'mateId', 'dhx', 'dhy', 'cm']);
  fish.forEach((a, q) => { const b = copies[q];
    for (const [name] of Lg.AGENT_FIELDS) { if (skip.has(name)) continue; const nm = name === 'lastSpawnD' ? 'lastSpawn' : name === 'tripEndD' ? 'tripEnd' : name, va = a[nm], vb = b[nm];
      if (typeof va === 'boolean') { if (va !== vb) bad++; continue; }
      if (!(va === vb || (va !== va && vb !== vb) || Math.abs(va - vb) <= 2e-7 * Math.abs(va) || (nm === 'age' && Math.abs(va - vb) <= 0.5) || (va === Infinity && vb >= 3e38) || (va <= -1e17 && vb <= -1e17))) bad++; }
    for (let k = 0; k < a.g.length; k++) if (a.g[k] !== b.g[k]) { bad++; break; }
    for (let k = 0; k < a.lw.length; k++) if (a.lw[k] !== b.lw[k]) { bad++; break; } });
  const Y = Lg.packYoy(F.yoy, F.yoy.length + 16, P.slot), S = Lg.packStatics(F, e), WL = Lg.waterLayout(e), W = Lg.packWater(F, e, WL);
  const src = Lg.wgslConstants(S, WL, { G: e.G }), holes = src.split('\n').filter(l => /NaN|undefined|Infinity/.test(l));
  let nanST = 0; for (let q = 0; q < S.ST.length; q++) if (S.ST[q] !== S.ST[q] && !Number.isNaN(new Int32Array(S.ST.buffer, q * 4, 1)[0])) nanST++;
  check('the GPU engine\'s layout: every fish packs into the struct of arrays and back exactly (fields, genome, learned block), the young too; its statics and WGSL constants have no NaN or hole',
    bad === 0 && Y.n === F.yoy.filter(q => q.alive).length && holes.length === 0 && S.ST.length > 1000 && W.length === WL.size,
    `${fish.length} fish (${Lg.NAF} fields, ${Lg.NGN} genome + genes, ${Lg.NBR} brain), ${bad} mismatches; ${Y.n} young schools; statics ${(S.ST.length * 4 / 1e6).toFixed(1)} MB, water ${(W.length * 4 / 1e3).toFixed(0)} KB, ${src.split('\n').length} constants${holes.length ? ', holes: ' + holes.slice(0, 3).join(' | ') : ''}`);
  // THE HAND-BACK (G3: fast-forward ends — the GPU's arrays become the CPU sim's objects again): two like worlds, each packed into
  // the arrays and materialized back — one into the objects it had (by id), one into objects all new (as the fish born on the GPU
  // get) — then lived on alike: they must stay identical (nothing a fish needs is left out of the arrays or the new objects); and
  // the GPU's tallies fold into the stats tree
  { const { getRandState, setRandState } = await import('../src/core.js'); const { createHash } = await import('node:crypto'); const { KEYS3 } = await import('../src/w3/fish3.js');
    const world = () => { seed(78); const e = new Env3({ yf0: 0.3 }), F = new Fish3(e, { young: true }); F.step(FB); e.step(FB); return { e, F }; };
    const hand = (F, fresh) => { const cap = F.fish.length + 99, ycap = F.yoy.length + 99, P = Lg.packAgents(F.fish, cap), Y = Lg.packYoy(F.yoy, ycap, P.slot);
      if (fresh) { F.fish = []; F.yoy = []; } return Lg.materialize(F, { A: P.A, BR: P.BR, GN: P.GN, Y: Y.Y, YG: Y.YG }, cap, ycap, P.n, Y.n, F.nextId); };
    const fp = F => { const h = createHash('sha1'); for (const a of [...F.fish].filter(a => a.alive).sort((p, q) => p.id - q.id)) h.update(`${a.id},${a.x},${a.y},${a.z},${a.n},${a.W},${a.L},${a.gut},${a.gon},${a.age},${a.yaw};`);
      for (const q of [...F.yoy].filter(q => q.alive).sort((p, r) => p.id - r.id)) h.update(`y${q.id},${q.n},${q.L},${q.W},${q.x},${q.y};`); return h.digest('hex'); };
    const W1 = world(), W2 = world(), h1 = hand(W1.F, false), h2 = hand(W2.F, true), st = getRandState();
    const live = ({ e, F }) => { setRandState(st); for (let b = 0; b < 4; b++) { F.step(FB); e.step(FB); } return fp(F); };
    const f1 = live(W1), f2 = live(W2);
    const st0 = W1.F.stats, stt = JSON.parse(JSON.stringify(st0)), tl = new Float64Array(512), NK = KEYS3.length;
    tl[412 + 2] = 3e6; tl[400 + 2] = 5000; tl[224 + 1 * 7 + 5] = 2.5e6; tl[96 + 6 * NK + 1] = 4e6;
    Lg.statsAdd(stt, tl, 99);
    const okS = stt.spawns.sucker === st0.spawns.sucker + 3 && stt.eggs.sucker === st0.eggs.sucker + 5000 && Math.abs((stt.died.perch.eaten || 0) - ((st0.died.perch || {}).eaten || 0) - 2.5) < 1e-9
      && stt.eatenBy['pike>perch'] - (st0.eatenBy['pike>perch'] || 0) === 4 && stt.kills === st0.kills + 4;
    check('the GPU engine\'s hand-back: the arrays materialized into the fish\'s own objects and into all-new ones live on identically (4 blocks); the GPU\'s tallies fold into the stats',
      f1 === f2 && h1.fish === h2.fish && h1.yoy === h2.yoy && h1.fish > 100 && h1.yoy > 10 && okS, `${h1.fish} fish, ${h1.yoy} young schools; own objects ${f1.slice(0, 8)} vs new ${f2.slice(0, 8)}; stats ${okS ? 'folded' : 'WRONG'}`); }
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
if (fail) { console.log(`${fail} CHECK(S) FAILED`); process.exit(1); }
console.log('W3 OK — the 3-D world\'s checks pass');
process.exit(0);
