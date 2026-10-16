// test/w3.mjs — the gate for the 3-D whole-lake sim (src/w3/), built alongside the 2-D one until it reaches parity.
// Run: node test/w3.mjs
import { GEO, BODIES, UPPER, LOWER, BROOK, LAND, cellIndex } from '../src/w3/geometry.js';

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
  { seed(307); const f = new Env3(); for (let i = 0; i < 10; i++) f.step(FB);   // (warmed up: the steady cost, not the JIT's)
    const t0 = performance.now(); for (let i = 0; i < 50; i++) f.step(FB); const ms = (performance.now() - t0) / 50;
    check('one environment update (temperature, ice, transport of its fields) costs a few milliseconds', ms < 12, `${ms.toFixed(2)} ms per update with ${f.fields.length} fields`); }
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
      seed(401); const e = new Env3({ col: 10, yf0: yf }); const c = e.chem; e.setWeather(w); for (let i = 0; i < 6; i++) e.step(FB);
      const P0 = c.inventoryP(), N0 = c.inventoryN(), L0 = { ...c.ledger };
      for (let i = 0; i < 90; i++) e.step(FB);
      const L = c.ledger, eP = (L.inP - L0.inP) - (L.outP - L0.outP) - (L.buryP - L0.buryP), eN = (L.inN - L0.inN) - (L.outN - L0.outN) - (L.denitN - L0.denitN) + (L.fixN - L0.fixN);
      const rP = Math.abs(c.inventoryP() - P0 - eP) / P0, rN = Math.abs(c.inventoryN() - N0 - eN) / N0; worst = Math.max(worst, rP, rN); txt.push(`${rP.toExponential(0)}/${rN.toExponential(0)}`);
    }
    check('the 3-D water\'s N and P budgets close (inventory change = in − out − buried, − denitrified + fixed) in summer, a storm and under ice', worst < 1e-5, `P/N relative error ${txt.join(', ')}`); }
  // the bed's fluxes reach the water in proportion to its area over the water's volume: thin water over a lot of bed (the
  // coves, the slopes) loses O₂ to the mud faster than the open water does
  { seed(402); const e = new Env3({ col: 5, yf0: 0.4 }); const c = e.chem, G = e.G; let jc = -1, jd = -1;
    for (let j = 0; j < G.NCELL; j++) { if (G.bedA[j] > 0 && c.r[j] > 0.8 && jc < 0) jc = j; if (G.bedA[j] === 0 && G.zMid[j] > 2 && jd < 0) jd = j; }
    c.o2.fill(0.9); e.temp.fill(15); c._o2Demand(OLD); const dC = 0.9 - c.o2[jc], dD = 0.9 - c.o2[jd];
    check('the bed\'s O₂ demand reaches the water in proportion to its area over the water\'s volume (thin water over the mud draws down fastest)', dC > 3 * dD && dD > 0,
      `${(dC * ENVC.O2_MGL).toFixed(3)} vs ${(dD * ENVC.O2_MGL).toFixed(3)} mg/L in 2.4 h (bed/water ${c.r[jc].toFixed(2)} vs mid-water); V2 ${V2.toFixed(2)} m³, A2 ${A2.toFixed(1)} m²`); }
  // A YEAR of the lakes' water without fish (the coarse 10-m grid): the seasons of O₂, the spring diatoms, the P budget
  { seed(403); const e = new Env3({ col: 10 }); const c = e.chem, G = e.G; const t0 = performance.now();
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
    const L = c.ledger, ret = L.buryP / L.inP, keep = c.inventoryP() / P0;
    check('summer: the deep north basin\'s bottom water keeps its O₂ (≥ 4 mg/L: wind and night convection mix it — MDIFW "does not stratify")', sumMinDeep >= 4, `lowest ${sumMinDeep.toFixed(1)} mg/L (June–August)`);
    // (≥ 3 mg/L: with the coloured water (stage 7a) the ice passes little light for photosynthesis, and the bed's demand — 0.1–0.3
    // g O₂/m²/day under the ice, the measured 0.2–0.39 — draws a 3-m-deep lake down ~10 mg/L over a 4-month ice season: a
    // shallow brown lake's late winter, a hypoxic layer over the mud, the fish crowding up. The clear-water version's ≥ 5 came
    // from under-ice photosynthesis snowy ice doesn't allow)
    check('winter: under the ice the basin\'s bottom water runs down toward anoxia by late winter while the lake as a whole keeps O₂ (≥ 3 mg/L)', winMinDeep < 3 && winMeanMin >= 3,
      `bottom of the basin down to ${winMinDeep.toFixed(1)} mg/L; the lake's mean never below ${winMeanMin.toFixed(1)} mg/L`);
    check('ice-out comes in late April or early May (Maine: ~Apr 23)', iceOut !== null && iceOut > 0.13 && iceOut < 0.2, `half the lake open at yf ${iceOut?.toFixed(3)} (Apr 23 ≈ 0.145)`);
    check('the cold-water diatoms bloom in late winter and spring, not in summer', dia[0] / dia[1] > 2 * dia[2] / Math.max(1, dia[3]), `Mar–May mean ${(dia[0] / dia[1]).toFixed(3)}, Jun–Aug ${(dia[2] / Math.max(1, dia[3])).toFixed(3)}`);
    check('the lakes keep their P over a year with a realistic retention (the bed keeps ~half to three-quarters of the inflow\'s load: Larsen–Mercier 0.66–0.72)', ret > 0.5 && ret < 0.9 && keep > 0.7 && keep < 1.3,
      `retention ${ret.toFixed(2)}, inventory ${(100 * keep).toFixed(0)} % of the start; a year in ${((performance.now() - t0) / 1000).toFixed(0)} s`); }
  { seed(404); const f = new Env3(); for (let i = 0; i < 6; i++) f.step(FB); const t0 = performance.now(); for (let i = 0; i < 40; i++) f.step(FB); const ms = (performance.now() - t0) / 40;
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
  // the founders: each species at the design census (fish ≥ 7.5 cm per hectare), the lakes' fish biomass inside Maine's range
  { seed(501); const e = new Env3({ col: 10 }), F = new Fish3(e), c = F.census(); let worst = 0; const txt = [];
    for (const k of KEYS3) { const r = c[k], d = Math.abs(r.perHa / S3[k].perHa - 1); worst = Math.max(worst, d); txt.push(`${k} ${r.perHa.toFixed(0)}`); }
    const kg = F.biomass() / 1000 / F.lakeHa, wet = F.fish.every(inWater), schools = F.fish.every(a => a.school ? a.n > 1 : a.n === 1);
    check('the founders: every species at its census density (±10 %), ~17,000 fish ≥ 7.5 cm in ~3,300 agents, 60–150 kg/ha, all in the water', worst < 0.1 && kg > 60 && kg < 150 && wet && schools,
      `${F.count().toFixed(0)} fish in ${F.fish.length} agents, ${kg.toFixed(0)} kg/ha; per ha ${txt.join(', ')}`); }
  // a summer's day and night: the fish stay in the water, swim, and each species keeps to its own water
  { seed(502); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e); const x0 = new Map(F.fish.map(a => [a.id, [a.x, a.y]]));
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
  { seed(503); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
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
  // PREDATION: a smallmouth beside a school of small shiners strikes; each kill takes ONE fish from the school, whose mass lands
  // in the bass's gut
  { seed(504); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const b = F.add('bass', 20, 80, 1.5, 4, 1), sh = F.add('minnow', 20.4, 80, 1.5, 0.6, 60); sh.L = 5; sh.W = 1.3; sh.gon = 0; F._settle(sh);
    let kills = 0, gotG = 0; const n0 = sh.n;
    for (let i = 0; i < 400 && kills < 3; i++) {
      sh.x = b.x + 0.3; sh.y = b.y; sh.z = b.z; F._hashBuild(); b.missCd = 0;
      const g = F._strike(b, F.fish.indexOf(b), 50, 1, 1, FB); if (g > 0) { kills++; gotG += g; }
    }
    check('predation: a smallmouth beside a school of small shiners kills, one fish per strike — the school loses exactly the fish eaten, the bass gets their mass',
      kills >= 3 && Math.abs(n0 - sh.n - kills) < 1e-9 && Math.abs(gotG - kills * 1.3) < 1e-6 && F.stats.eatenBy['bass>minnow'] === kills, `${kills} kills, school ${n0} → ${sh.n}, ${gotG.toFixed(1)} g eaten`); }
  // SCHOOLS meet and merge (keeping one parent's genome, never averaged), split above twice their size — the fish are conserved
  { seed(505); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const a = F.add('perch', 20, 80, 1.5, 2, 30), b = F.add('perch', 21, 80, 1.5, 2, 25); F.add('perch', -40, 60, 1.0, 2, 2 * S3.perch.school + 20);
    const ga = a.g, gb = b.g, tot = F.count(); F._hashBuild(); F._schools(); F.fish = F.fish.filter(x => x.alive);
    const merged = F.fish.find(x => x.n === 55);
    check('schools of one kind and size merge (one parent\'s genome kept, not averaged) and split above twice their size — no fish gained or lost',
      !!merged && (merged.g === ga || merged.g === gb) && Math.abs(F.count() - tot) < 1e-9 && F.fish.length === 3 && Math.max(...F.fish.map(x => x.n)) <= 2 * S3.perch.school,
      `${tot} fish → ${F.fish.map(x => x.n).join(' + ')}`); }
  // STARVATION: a pumpkinseed in a lake emptied of its food loses condition and dies of hunger within weeks of summer
  { seed(506); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem;
    const a = F.add('sunfish', 20, 80, null, 3, 1); let t = 0, Kmin = a.K;
    ch.zooD.fill(0); ch.zooC.fill(0); ch.zooR.fill(0); for (const j of ch.bedCells) ch.benth[j] = 0;
    while (a.alive && t < 120 * DAYS) { F.step(FB); Kmin = Math.min(Kmin, a.K); t += FB; }
    check('starvation: a summer pumpkinseed without food wastes (condition K falls) and dies of hunger within weeks', !a.alive && a.cause === 'starve' && t / DAYS < 100, `died after ${(t / DAYS).toFixed(0)} days (${a.cause || 'alive'}), K → ${f2(Kmin)}`); }
  // HYPOXIA: a perch whose bottom water has no O₂ climbs out of it within seconds
  { seed(507); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
    let c0 = -1, dm = 0; for (let c = 0; c < G.NC; c++) if (G.depthMax[c] > dm) { dm = G.depthMax[c]; c0 = c; }
    const a = F.add('perch', G.cx[c0], G.cy[c0], null, 3, 1); a.z = GEO.depthAt(a.x, a.y) - 0.2;
    const z0 = a.z; for (let i = 0; i < 50; i++) { for (let k = 2; k < G.nL[c0]; k++) ch.o2[G.cell0[c0] + k] = 0.01; F.step(FB); }
    check('hypoxia: a perch on an anoxic bottom gets out of the dead water — up, or (in a block) across to a column with O₂', a.alive && a.o2 > a.o2Crit && (a.z < 1.0 || a.c !== c0), `from ${f2(z0)} m to ${f2(a.z)} m${a.c !== c0 ? ` in another column, ${f1(Math.hypot(a.x - G.cx[c0], a.y - G.cy[c0]))} m away` : ''} (O₂ ${(a.o2 * ENV.O2_MGL).toFixed(1)} mg/L)`); }
  // DETERMINISM: the same seed makes the same lake of fish
  { const one = () => { seed(508); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e); run(e, F, 6); return F.fish.map(a => `${a.x.toFixed(5)},${a.z.toFixed(5)},${a.W.toFixed(6)},${a.n.toFixed(4)}`).join(';'); };
    check('determinism: the same seed gives the same fish (positions, masses, school sizes) after 30 blocks', one() === one()); }
  // A SUMMER MONTH (the coarse grid): every species feeds (consumption a realistic share of its maximum), none dies out, the
  // lakes' fish biomass holds inside Maine's range; the fish step's cost
  { seed(509); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e); run(e, F, 20); F.resetIntake(); const B0 = F.biomass();
    let tf = 0, steps = 0; for (let i = 0; i < 296 * 5; i++) { const t0 = performance.now(); F.step(FB); tf += performance.now() - t0; steps++; e.step(EW); }
    const c = F.census(), kg = F.biomass() / 1000 / F.lakeHa; const lowP = [], gone = [], txt = [];
    for (const k of KEYS3) { const r = c[k]; txt.push(`${k} ${f2(r.p)}`); if (!(r.n > 0.5 * S3[k].perHa * F.lakeHa)) gone.push(k); if (!(r.p > 0.15)) lowP.push(k); }
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
  { seed(511); const e = new Env3({ col: 10, yf0: 0.14 }), F = new Fish3(e); const gd = [];
    for (let i = 0; i < 62 * 49.3; i++) {
      F.step(FB); e.step(EW);
      if (i % 25 === 0) for (const a of F.fish) if (a.nt > 0 && a.nt < a.s.guard - 2) gd.push(Math.hypot(a.x - a.nx, a.y - a.ny));
    }
    const st = F.stats, at = st.spawnAt, day = k => at[k].first < 0 ? Infinity : (at[k].first / (365 * DAYS) - 0.14) * 365, bed = k => at[k].bed / Math.max(1, st.spawns[k]);
    const sp6 = ['pike', 'perch', 'sucker', 'whiteperch', 'bass', 'sunfish'];
    check('spring: pickerel, perch, suckers, white perch, smallmouth and pumpkinseed all spawn by late June — the cold-water spawners first (pickerel and perch in May, then the bass and the sunfish)',
      sp6.every(k => st.spawns[k] > 0) && day('pike') < day('bass') && day('perch') < day('bass') && day('perch') < day('sunfish') && day('bass') <= day('sunfish') + 20,
      'first spawning (days after Apr 21): ' + sp6.map(k => `${k} ${day(k).toFixed(0)}`).join(', ') + '; spawnings ' + sp6.map(k => st.spawns[k]).join('/'));
    check('each species spawns on its own ground: perch on 0.5–2 m brush, smallmouth nests at 0.5–1.5 m, pumpkinseed colonies < 2 m, suckers up the brook\'s riffles',
      bed('perch') > 0.4 && bed('perch') < 2.3 && bed('bass') > 0.4 && bed('bass') < 1.8 && bed('sunfish') < 1.9 && at.sucker.brook >= 0.3 * st.spawns.sucker,
      `mean bottom depth: perch ${f2(bed('perch'))} m, smallmouth ${f2(bed('bass'))} m, pumpkinseed ${f2(bed('sunfish'))} m; suckers ${at.sucker.brook} of ${st.spawns.sucker} in the brook`);
    gd.sort((p, q) => p - q); const g90 = gd.length ? gd[Math.floor(gd.length * 0.9)] : Infinity;
    check('the nest guarders (smallmouth, pumpkinseed, bullhead males) keep to their nests (90 % of the time within 1.5 m)', gd.length > 20 && g90 < 1.5, `${gd.length} samples, 90th percentile ${f2(g90)} m`);
    let brook = 0, sun = 0; for (const a of F.fish) if (a.s.key === 'sunfish') { sun++; if (GEO.bodyAt(a.x, a.y) === BROOK) brook++; }
    const c = F.census();
    check('by June pumpkinseed are in the brook\'s pools (the angler\'s sunfish), and the young of the spring spawners swim in the lakes',
      brook >= 5 && c.perch.yoyN > 0 && c.sunfish.yoyN > 0 && c.whiteperch.yoyN > 0, `${brook} of ${sun} pumpkinseed in the brook; young: ` + ['perch', 'whiteperch', 'sunfish', 'bass', 'sucker', 'pike'].map(k => `${k} ${(c[k].yoyN / 1e3).toFixed(1)}k at ${f1(c[k].yoyL || 0)} cm`).join(', ')); }
  // THE YOUNG'S BOOKKEEPING: a school of larvae takes its zooplankton (rotifers too) from the water gram for gram
  { seed(512); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
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
  { seed(513); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false });
    const b = F.add('bass', 20, 80, 1.5, 4, 1), q = F._mkYoy(S3.sunfish.i, 20.3, 80, 1.5, 2000, null, null, 1, 0);
    q.L = 3; q.W = 0.4; q.bdep = q.L * S3.sunfish.sp.depthR; F._yoyHash();
    const n0 = q.n; let got = 0; for (let i = 0; i < 30; i++) { b.gut = 0; got += F._eatYoy(b, 50, 1, FB) * b.n; }
    const k = n0 - q.n;
    check('predation on the young: a smallmouth working a school of 3-cm pumpkinseed eats a bout of them — one school loses exactly the fish the bass gets',
      k >= 3 && Math.abs(got - k * 0.4) < 1e-6 && F.stats.fry.sunfish.eaten === k, `${k} eaten in 3 s (${got.toFixed(1)} g), school ${n0} → ${q.n}`); }
  // RECRUITMENT: grown young of a school species become a school agent with a brain (their genome); an individual species'
  // become individuals — the fish conserved
  { seed(514); const e = new Env3({ col: 10, yf0: 0.6 }), F = new Fish3(e, { founders: false });
    const yp = F._mkYoy(S3.perch.i, 20, 80, 1.5, 500, F.add('perch', 20, 80, 1.5, 2, 2).g, null, 2, 0); yp.L = S3.perch.sp.L0; yp.W = 4.4; yp.genes = F.fish[0].genes; yp.age = 120;
    const ys = F._mkYoy(S3.sunfish.i, 20.5, 80, 1.0, 40, F.fish[0].g, F.fish[0].genes, 2, 0); ys.L = S3.sunfish.sp.L0; ys.W = 1.4; ys.age = 120;
    F.cnt.fill(0); const nA = F.fish.length; F._recruit(yp); F._recruit(ys);
    const school = F.fish.find(a => a.s.key === 'perch' && a.n > 100), sun = F.fish.filter(a => a.s.key === 'sunfish');
    check('recruitment: grown young perch become one school agent of all 500 with their genome; 40 young pumpkinseed become 40 individuals',
      !!school && Math.abs(school.n - 500) < 1e-9 && school.g === yp.g && sun.length === 40 && F.fish.length === nA + 41 && !yp.alive && !ys.alive && F.stats.recruits.perch === 500,
      `perch school of ${school ? school.n : 0} (L ${school ? f1(school.L) : '-'} cm), ${sun.length} pumpkinseed`); }
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
  { seed(521); const e = new Env3({ col: 10, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
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
  { seed(522); const e = new Env3({ col: 5, yf0: 0.4 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
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
  { seed(531); const e = new Env3({ col: 10, yf0: 0.2 }), F = new Fish3(e), ch = e.chem;
    let peak = 0, jp0 = 0, je0 = 0, jp1 = 0, je1 = 0, B = [], bassL = 0;
    for (let i = 0; i < 120 * 49.3; i++) {
      F.step(FB); e.step(EW);
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
  { seed(532); const e = new Env3({ col: 10, yf0: 0.95 }), F = new Fish3(e, { founders: false }), ch = e.chem, G = e.G;
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
  { seed(541); const e = new Env3({ col: 10, yf0: 0.2 }), P = e.plants, G = e.G, ch = e.chem;
    const snap = () => {
      const shoots = FORMS3.map((F, f) => P.total(f)), store = FORMS3.map((F, f) => { let s = 0; for (let i = 0; i < P.cells.length; i++) s += P.Br[f][i] * G.bedA[P.cells[i]]; return s; });
      let bedA = 0, veg = 0, edge = 0; for (let c = 0; c < G.NC; c++) { bedA += G.area[c]; if (P.pvi[c] > 0.05) veg += G.area[c]; }
      let deep = 0; for (let i = 0; i < P.cells.length; i++) if (P.Bs[2][i] > 30) deep = Math.max(deep, P.zb[i]);
      // the floating-leaved and emergent forms' share of the vegetated bed (by the area their stands cover)
      let flem = 0, all = 0; for (let i = 0; i < P.cells.length; i++) { const A = G.bedA[P.cells[i]]; let any = 0, fe = 0; for (let f = 0; f < FORMS3.length; f++) { const cov = P.Bs[f][i] / FORMS3[f].Bmax; if (cov > 0.1) { any = 1; if (FORMS3[f].window) fe = 1; } } all += any * A; flem += fe * A; }
      return { shoots, store, veg: veg / bedA, deep, flem: flem / Math.max(1, all), secchi: ch.secchi() };
    };
    // (stage 7b: the weeds' invertebrates, snails and the surface — littoral3.js — over the same run)
    const Lt = e.lit, litSnap = () => {
      let fu = 0, nf = 0; const lit = [];
      for (let i = 0; i < P.cells.length; i++) {
        let b = 0; for (let f = 0; f < FORMS3.length; f++) b += P.Bs[f][i];
        if (P.Bs[2][i] > 120) { fu += Lt.S[i] + Lt.L[i]; nf++; }
        if (P.zb[i] < 3) lit.push([b, i]);
      }
      // (the barest tenth of the lit bed < 3 m: every shallow cell grows a little)
      lit.sort((p, q) => p[0] - q[0]); const bare = lit.slice(0, Math.max(1, Math.round(lit.length / 10)));
      const ba = bare.reduce((s, [, i]) => s + Lt.S[i] + Lt.L[i], 0) / bare.length, snB = bare.reduce((s, [, i]) => s + Lt.sn[i], 0) / bare.length;
      return { full: fu / Math.max(1, nf), nf, bare: ba, bareB: bare[bare.length - 1][0], snBare: snB, ...Lt.stock() };
    };
    let peak1 = 0, feb = null, aug = null, augL = null, em0 = -1, emSpring = 0, emLate = 0, emPrev = 0, julBank = -1, julOpen = -1;
    let crRel = -1, crSep = null, crAug = null;   // (stage 7c: the crayfish)
    // (stage 7d: the mussels — the water of the cells they sit in, and what they clear of it in July and in January)
    let muV = 0; for (let i = 0; i < Lt.cells.length; i++) if (Lt.mu[i] > 0) muV += G.vol[Lt.cells[i]] * 1000;
    const muClr = { jul: [0, 0, -1], jan: [0, 0, -1] };   // [litres cleared, days, the clearance count at the start]
    const crZones = () => { const z = [[0, 0], [0, 0], [0, 0]]; for (let i = 0; i < Lt.cells.length; i++) { const a = G.bedA[Lt.cells[i]], K = Lt.Kcr[i], k = K >= 20 ? 0 : K > 2 ? 1 : 2; z[k][0] += (Lt.crA[i] + Lt.crY[i]) * a; z[k][1] += a; } return z.map(v => v[0] / Math.max(1, v[1])); };
    for (let t = 0; t < 1.25 * CLOCK3.YEAR_LEN; t += EW) {
      e.step(EW); const yf = e.yearFrac(), y = t / CLOCK3.YEAR_LEN;
      if (y < 0.5 && Math.round(t * 5) % 250 === 0) peak1 = Math.max(peak1, P.total(2));
      if (!feb && y > 0.5 && yf > 0.95) feb = snap();
      if (!aug && y > 1.0 && yf > 0.44) { aug = snap(); augL = litSnap(); }
      if (em0 < 0 && y >= 0.25) { em0 = Lt.emerged; emPrev = Lt.emerged; }
      if (em0 >= 0) { const d = Lt.emerged - emPrev; emPrev = Lt.emerged; if (yf >= 0.15 && yf < 0.42) emSpring += d; else emLate += d; }
      for (const [k, a, b] of [['jul', 0.36, 0.42], ['jan', 0.84, 0.9]]) if (y > 1.0 - (k === 'jan' ? 1 : 0) && y < 1.25 && yf >= a && yf < b) { const r = muClr[k]; if (r[2] < 0) r[2] = Lt.muCleared; r[0] = Lt.muCleared - r[2]; r[1] += EW / DAYS; }
      if (crRel < 0 && y < 0.5 && Lt.crReleased) crRel = Lt.stock().crYn;
      if (!crSep && y < 0.5 && yf > 0.5) crSep = Lt.stock();
      if (!crAug && y > 1.0 && yf > 0.44) crAug = { ...Lt.stock(), zones: crZones() };
      if (julBank < 0 && y > 1.0 && yf > 0.38) { let sb = 0, ab = 0, so = 0, ao = 0; for (let c = 0; c < G.NC; c++) { if (Lt.bank[c] > 0) { sb += Lt.surfT[c] * G.area[c]; ab += G.area[c]; } else { so += Lt.surfT[c] * G.area[c]; ao += G.area[c]; } } julBank = sb / ab; julOpen = so / Math.max(1, ao); }
    }
    const bedAll = P.cells.reduce((s, j) => s + G.bedA[j], 0), vegA = augL.vegShare * bedAll, emYr = (Lt.emerged - em0) / vegA / 6;   // (g DW: insects ~1/6 dry)
    const sum = a => a.reduce((s, v) => s + v, 0);
    check('the second summer: weeds on about a quarter to a half of the bed (research ~30 %), the submerged canopy down to 1.3–2.8 m in coloured water (Secchi 2.5–4 m; research 2–2.7 m)',
      !!aug && aug.veg > 0.2 && aug.veg < 0.5 && aug.deep >= 1.3 && aug.deep <= 2.8 && aug.secchi > 2.5 && aug.secchi < 4,
      aug ? `vegetated ${(aug.veg * 100).toFixed(0)} %, canopy to ${f1(aug.deep)} m, Secchi ${f1(aug.secchi)} m; shoots ${aug.shoots.map(v => (v / 1000).toFixed(0)).join('/')} kg (${FORMS3.map(F => F.key).join('/')})` : 'no August');
    check('lilies and emergent stands keep to the sheltered coves: a minority of the vegetated bed (the submerged canopy holds the open littoral)',
      !!aug && aug.flem < 0.4, aug ? `floating-leaved or emergent on ${(aug.flem * 100).toFixed(0)} % of the vegetated bed` : '');
    check('the weeds\' invertebrates: a full pondweed canopy carries 2–9 g wet/m² in its second August (0.5–1.5 g DW — Kirby 4,000–17,000 animals/m²), ≥ 5× the bare lit bed\'s',
      augL.nf > 0 && augL.full >= 2 && augL.full <= 9 && augL.full >= 5 * augL.bare, `full canopy ${f2(augL.full)} g/m² (${augL.nf} cells), the barest lit bed (≤ ${f1(augL.bareB)} g DW of plants/m²) ${f2(augL.bare)}; the beds' small ${f2(augL.vegS)}, large ${f2(augL.vegL)}`);
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
      !!feb && sum(feb.shoots) < 0.15 * peak1 * 3 && feb.store.every(v => v > 0) && aug.shoots[2] > 2 * feb.store[2],
      feb ? `February: shoots ${(sum(feb.shoots) / 1000).toFixed(1)} kg, storage ${feb.store.map(v => (v / 1000).toFixed(0)).join('/')} kg; the canopy ${(aug.shoots[2] / 1000).toFixed(0)} kg by August` : 'no February');
    // A DENSE BED'S O₂: on a calm clear summer day the water in a thick canopy rises by day and falls by night more than bare
    // water at the same depth does
    e.setWeather(0);
    let jb = -1, jo = -1, best = 0;
    for (let i = 0; i < P.cells.length; i++) { const tot = P.Bs[2][i] + P.Bs[1][i]; if (tot > best && P.zb[i] > 0.8 && P.zb[i] < 1.6) { best = tot; jb = P.cells[i]; } }
    { let low = 1e9; for (let i = 0; i < P.cells.length && jb >= 0; i++) { const tot = FORMS3.reduce((s, F, f) => s + P.Bs[f][i], 0); if (tot < low && Math.abs(G.zMid[P.cells[i]] - G.zMid[jb]) < 0.3) { low = tot; jo = P.cells[i]; } } }   // (the barest bed at its depth)
    let bMin = 9, bMax = 0, oMin = 9, oMax = 0;
    for (let t = 0; t < CLOCK3.DAY_LEN; t += EW) { e.step(EW); if (jb >= 0) { bMin = Math.min(bMin, ch.o2[jb]); bMax = Math.max(bMax, ch.o2[jb]); } if (jo >= 0) { oMin = Math.min(oMin, ch.o2[jo]); oMax = Math.max(oMax, ch.o2[jo]); } }
    const sb = (bMax - bMin) * ENV.O2_MGL, so = (oMax - oMin) * ENV.O2_MGL;
    check('a dense weed bed\'s water swings in O₂ by day and night more than bare water at its depth (production by day, respiration always)',
      jb >= 0 && jo >= 0 && sb > 1.3 * so, `bed (${best.toFixed(0)} g DW/m²): ${f2(sb)} mg/L a day; bare: ${f2(so)} mg/L`); }
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
if (fail) { console.log(`${fail} CHECK(S) FAILED`); process.exit(1); }
console.log('W3 OK — the 3-D world\'s checks pass');
process.exit(0);
