// GPU stage G1 (docs/GPU_SIM.md): each kernel of the GPU engine (src/w3/gpu/) against fish3.js on the SAME fish.
// Open http://localhost:8000/tools/gpu/g1_check.html (the 1/10 lakes) or ?world=true (the true-size lakes; founding ~30 s).
// It founds the lakes with the season's young, lives one CPU coarse block, then sets up the next block as Fish3.step does and runs
// each phase twice from the same state — fish3's own code on every fish (one phase for all, then the next: the GPU's order) and
// the GPU kernel — and compares every fish's results field by field (f32 against f64: a relative tolerance; ties at a sense
// range's edge can fall either way). ?seed=N, ?kernels=grid,pre,… to pick.
import '../../src/w3/render3/world3sel.js';
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const qs = new URLSearchParams(location.search), SEED = +(qs.get('seed') || 611);
{ const { stageR5 } = await import('../../src/w3/fish3.js'); if (qs.get('r5') === '1') stageR5(true); }   // (?r5=1: stage R item 5's package)
{ const { F3 } = await import('../../src/w3/fish3.js'); if (qs.get('wild') === '1') F3.WILD = 1; }   // (?wild=1: the wildlife, E4)
{ const { EGG3 } = await import('../../src/config.js'); if (qs.get('eggs') === '1') EGG3.ON = 1; }   // (?eggs=1: the egg stage, E3)
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, F3, HID3, reinforce3, KEYS3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
const { ENV, FRY } = await import('../../src/config.js');
const { CLOCK3 } = await import('../../src/w3/clock3.js');
const L = await import('../../src/w3/gpu/layout.js');
const { GpuFish, HHX, HHY } = await import('../../src/w3/gpu/gpufish.js');
const B = 1752, YEAR = CLOCK3.YEAR_LEN;

log(`founding (seed ${SEED})…`); let t0 = performance.now();
seed(SEED); const env = new Env3({ yf0: +(qs.get('yf') || 0.4) }), F = new Fish3(env, { young: true });
F.step(B); env.step(B);
log(`founded and one block lived in ${((performance.now() - t0) / 1000).toFixed(1)} s: ${F.fish.length} agents, ${F.yoy.length} young schools`);
// ---------- the next block's start, as Fish3.step sets it up ----------
F.time += B; F.stepNo++; F.events.length = 0; F.rises.length = 0; F._coarse = true;
F._hashBuild(true); F._yoyHash();
if (F3.WILD) F._wildPrep();   // (E4: the wildlife's demand and reach at the step's start — the GPU's encodeWild below)
const yf = env.yearFrac(), att = env.chem.attenuation(), clar = env.chem.clarity(); F._yr = Math.floor(env.time / YEAR);
const lux0 = env.lux, luxB = [lux0, env.luxAhead(B / 2), env.luxAhead(B)]; F._cx = { yf, att, clar, lux0 };
const fish = F.fish, n = fish.length; for (const a of fish) if (!a.alive) throw new Error('a dead fish in the list');
const yoy = F.yoy, ny = yoy.length; for (const q of yoy) if (!q.alive) throw new Error('a dead school in the list');
// ---------- the GPU, from the same state ----------
const { dev, info } = await GpuFish.device(); log(`GPU: ${info.vendor} ${info.architecture}`);
const tau0 = F3.WANDER_TAU; F3.WANDER_TAU = 0;   // (the GPU built without the block's random wander — see the move check)
const G = new GpuFish(dev, F, env, { seed: SEED }); F3.WANDER_TAU = tau0;
G.uploadAgents(fish); G.uploadYoy(F.yoy); G.uploadWater(); G.setUniforms(B, { lux0, luxB }); G.clearTallies();
await dev.queue.onSubmittedWorkDone();
// ===== 0. THE WILDLIFE (fish3 _wildPrep: each wildlife's demand, the fish it can reach, its hazard per unit of accessibility ρ) =====
if (F3.WILD) { G.wildDemand(); await G.run(enc => G.encodeWild(enc)); const gl = new Float32Array(await G.read(G.B.GL, 1024)), { WILDK } = await import('../../src/w3/fish3.js');
  log('the wildlife’s ρ (/s per unit of accessibility), CPU · GPU: ' + WILDK.map((w, r) => `${w} ${F._wRho[r].toExponential(3)} · ${gl[144 + r].toExponential(3)}`).join('; ')); }
const cap = G.cap;
// ---------- comparing ----------
const rel = (a, b) => Math.abs(a - b) / Math.max(1e-6, Math.abs(a), Math.abs(b));
function compare(tag, fields, A, getCpu, opts = {}) {
  const tol = opts.tol ?? 1e-4, abs = opts.abs ?? 1e-5, bad = {}, ex = {};
  let checked = 0;
  for (let i = 0; i < n; i++) {
    if (opts.skip && opts.skip(i)) continue; checked++;
    const g = L.readAgent(A, cap, i), a = fish[i];
    for (const f of fields) {
      const cv = getCpu(a, f, i), gv = g[f]; let ok;
      if (typeof cv === 'boolean') ok = cv === !!gv; else if (cv === Infinity) ok = gv >= 3e38; else ok = cv === gv || Math.abs(cv - gv) <= abs || rel(cv, gv) <= tol;
      if (!ok) { bad[f] = (bad[f] || 0) + 1; if (!ex[f]) ex[f] = `#${i} ${a.s.key} cpu ${cv} gpu ${gv}`; }
    }
  }
  const nb = Object.values(bad).reduce((t, v) => t + v, 0);
  log(`${tag}: ${checked} fish × ${fields.length} fields — ${nb ? 'MISMATCHES ' + JSON.stringify(bad) : 'all agree'}`);
  for (const f in ex) log(`   e.g. ${f}: ${ex[f]}`);
  return nb;
}
const slotOf = new Map(fish.map((a, i) => [a, i]));
const timeIt = async (fn, reps = 10) => { await G.run(fn); const t = performance.now(); for (let r = 0; r < reps; r++) G.run(fn); await dev.queue.onSubmittedWorkDone(); return (performance.now() - t) / reps; };

// ===== 1. THE GRID =====
{
  await G.run(enc => G.encodeGrid(enc));
  const { HS, HI, HC } = await G.readGrid(); let cellsBad = 0, itemsBad = 0, hcBad = 0, hcEx = '';
  for (let i = 0; i < n; i++) if (HC[i] !== F.hCell[i]) { hcBad++; if (!hcEx) { const a = fish[i]; hcEx = `#${i} at (${a.x}, ${a.y}) cpu cell ${F.hCell[i]} gpu ${HC[i]}`; } }
  log(`grid: ${hcBad} fish in a different cell${hcEx ? ', e.g. ' + hcEx : ''}`);
  for (let c = 0; c <= G.NH; c++) if (HS[c] !== F.hStart[c]) cellsBad++;
  for (let q = 0; q < n; q++) if (HI[q] !== F.hItems[q]) itemsBad++;
  const tg = await timeIt(enc => G.encodeGrid(enc));
  log(`grid (${HHX}×${HHY} cells of ${F3.HC} m): starts differ in ${cellsBad} of ${G.NH + 1} cells, items in ${itemsBad} of ${n} — ${tg.toFixed(2)} ms on the GPU`);
  await G.run(enc => G.encodeYGrid(enc));
  const YS = new Uint32Array(await G.read(G.B.YHS)), YI = new Uint32Array(await G.read(G.B.YHI)); let ys = 0, yi = 0;
  for (let c = 0; c <= G.NH; c++) if (YS[c] !== F.yStart[c]) ys++; for (let q = 0; q < ny; q++) if (YI[q] !== F.yItems[q]) yi++;
  log(`the young's grid: starts differ in ${ys} cells, items in ${yi} of ${ny} schools`);
}
// ===== 2. THE START OF THE BLOCK (fish3 _livePre) =====
const pre0 = fish.map(a => ({ lake: a.lake, tripEnd: a.tripEnd, lhx: a.lhx }));
let tc = performance.now(); const modes = []; for (let i = 0; i < n; i++) { const m = F._livePre(fish[i], i, B, B, true, luxB); modes.push(m && { ...m, bot: [...m.bot] }); } tc = performance.now() - tc;
await G.run(enc => G.encodeKernel(enc, 'k_pre'));
let A = (await G.readAgents()).A;
const roamed = i => fish[i].lake !== pre0[i].lake || fish[i].tripEnd !== pre0[i].tripEnd || L.readAgent(A, cap, i).lake !== pre0[i].lake;
compare(`pre (CPU ${tc.toFixed(0)} ms)`, ['age', 'mateCd', 'missCd', 'nt', 'mature', 'ripe', 'inRun', 'bed', 'c', 'j', 'jb', 'T', 'o2', 'vis', 'visF', 'cover', 'fear', 'lake', 'inLake', 'alive'], A,
  (a, f) => f === 'age' ? Math.round(a.age) : a[f], { skip: roamed, tol: 2e-4 });
{ let r = 0; for (let i = 0; i < n; i++) if (roamed(i)) r++; log(`   (${r} fish moved between the lakes or set off on a trip — their own random draws, left out)`); }
// ===== 3. LEARNING (reinforce3) =====
tc = performance.now(); for (const a of fish) if (a.alive && a._dh) { reinforce3(a.lw, a.g, HID3, a.h, a.o, a._ate ? 1 : 0, B); a._ate = false; } tc = performance.now() - tc;
await G.run(enc => G.encodeKernel(enc, 'k_learn'));
let BR = (await G.readAgents()).BR;
{
  let bad = 0, ex = ''; for (let i = 0; i < n; i++) { const a = fish[i]; for (let q = 0; q < L.NBR - 16; q++) { const g = BR[q * cap + i]; if (Math.abs(g - a.lw[q]) > 1e-5 + 1e-5 * Math.abs(a.lw[q])) { bad++; if (!ex) ex = `#${i} w${q} cpu ${a.lw[q]} gpu ${g}`; break; } } }
  log(`learn (CPU ${tc.toFixed(0)} ms): the plastic block of ${n} fish — ${bad ? bad + ' differ, e.g. ' + ex : 'all agree'}`);
}
// ===== 4. THE SENSES =====
tc = performance.now(); for (let i = 0; i < n; i++) if (fish[i].alive) F._sense(fish[i], i); tc = performance.now() - tc;
await G.run(enc => G.encodeKernel(enc, 'k_sense'));
A = (await G.readAgents()).A;
compare(`senses (CPU ${tc.toFixed(0)} ms)`, ['prey', 'threat', 'td', 'fear', 'an', 'ax', 'ay', 'fk', 'fv', 'fx', 'fy', 'fz', 'fd'], A,
  (a, f) => f === 'prey' ? (a.prey ? slotOf.get(a.prey) : -1) : f === 'threat' ? (a.threat ? slotOf.get(a.threat) : -1) : a[f], { tol: 2e-4, abs: 1e-4, skip: i => !fish[i].alive });
// ===== 5. THE BRAIN =====
tc = performance.now(); for (let i = 0; i < n; i++) if (fish[i].alive) F._brain(fish[i], modes[i], B); tc = performance.now() - tc;
await G.run(enc => G.encodeKernel(enc, 'k_brain', 64));
BR = (await G.readAgents()).BR;
{
  let bad = 0, ex = '', worst = 0; for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue;
    for (let q = 0; q < 16; q++) { const cv = q < 10 ? a.h[q] : a.o[q - 10], gv = BR[(L.NBR - 16 + q) * cap + i], d = Math.abs(cv - gv); worst = Math.max(worst, d); if (d > 2e-4) { bad++; if (!ex) ex = `#${i} ${a.s.key} ${q < 10 ? 'h' + q : 'o' + (q - 10)} cpu ${cv} gpu ${gv}`; break; } } }
  log(`brain (CPU ${tc.toFixed(0)} ms): hidden state and outputs of ${n} fish — ${bad ? bad + ' differ, e.g. ' + ex : 'all agree'} (largest difference ${worst.toExponential(2)})`);
  // which INPUT differs: each fish's 26 inputs from the CPU's state against those from the GPU's (fish3's own senses() on both)
  if (bad) {
    const Ag = (await G.readAgents()).A, inC = new Float32Array(26), inG = new Float32Array(26), byIn = new Array(26).fill(0); let nf = 0;
    for (let i = 0; i < n; i++) {
      const a = fish[i]; if (!a.alive) continue; const o = L.readAgent(Ag, cap, i);
      F.senses(a, inC, a._dh);
      const th = o.threat >= 0 ? L.readAgent(Ag, cap, o.threat) : null;
      const fa = { s: a.s, yaw: o.yaw, x: o.x, y: o.y, z: o.z, fk: o.fk, fx: o.fx, fy: o.fy, fz: o.fz, fd: o.fd, fv: o.fv, senseR: o.senseR, threat: th && { x: th.x, y: th.y, z: th.z },
        fear: o.fear, an: o.an, ax: o.ax, ay: o.ay, bed: o.bed, vis: o.vis, T: o.T, o2: o.o2, energy: o.energy, hunger: o.hunger, hx: o.hx, hy: o.hy };
      F.senses(fa, inG, [o.dhx, o.dhy]);
      let any = false; for (let q = 0; q < 26; q++) if (Math.abs(inC[q] - inG[q]) > 1e-3) { byIn[q]++; any = true; } if (any) nf++;
    }
    log(`   inputs differing by > 1e-3 in ${nf} fish: ` + byIn.map((v, q) => v ? `${q}:${v}` : '').filter(Boolean).join(' '));
  }
}
// ===== 6. WHERE EACH FISH GOES (fish3 _mode, _drive, _relocate; the GPU's bookkeeping first: its snapshot, sums, the brook's sites) =====
// (the wander off — F3.WANDER_TAU 0 on both, the GPU built so: each engine draws its own random numbers; mates and threats frozen
// where they were at the block's start, as the GPU's snapshot has them — the CPU's fish see those earlier in the list where they moved)
{
  const frozen = new Map(fish.map(a => [a, { x: a.x, y: a.y, z: a.z, alive: a.alive, ripe: a.ripe, id: a.id }]));
  const refs = fish.map(a => [a.mate, a.threat]);
  for (const a of fish) { if (a.mate && frozen.has(a.mate)) a.mate = frozen.get(a.mate); if (a.threat && frozen.has(a.threat)) a.threat = frozen.get(a.threat); }
  const tau = F3.WANDER_TAU; F3.WANDER_TAU = 0;
  const x0 = fish.map(a => [a.x, a.y]), cand0 = fish.map(a => a.inRun);
  tc = performance.now(); for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const m = F._mode(a); F._drive(a, m, 0); F._relocate(a, m, B); } tc = performance.now() - tc;
  F3.WANDER_TAU = tau; fish.forEach((a, i) => { a.mate = refs[i][0]; a.threat = refs[i][1]; });
  await G.run(enc => { G.encodeBook(enc); G.encodeKernel(enc, 'k_move', 64); });
  A = (await G.readAgents()).A;
  const runner = i => fish[i].brookRun && fish[i].ripe;   // (the brook's runners: admitted at the mouth during the CPU's block, at its start on the GPU's)
  compare(`move (CPU ${tc.toFixed(0)} ms)`, ['x', 'y', 'z', 'yaw', 'bed', 'c', 'j', 'jb', 'spd', 'thrust', '_vx', '_vy', '_need', 'fz', 'esc', '_far', 'inRun'], A,
    (a, f) => f === 'esc' ? a.esc : a[f], { tol: 2e-3, abs: 0.05, skip: i => !fish[i].alive || runner(i) });
  let dC = 0, dG = 0, nn = 0, far = 0; const dists = [];
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const g = L.readAgent(A, cap, i), c = Math.hypot(a.x - x0[i][0], a.y - x0[i][1]), q = Math.hypot(g.x - x0[i][0], g.y - x0[i][1]); dC += c; dG += q; nn++; if (Math.abs(c - q) > 1) { far++; dists.push([i, c, q]); } }
  log(`   moved on average ${(dC / nn).toFixed(2)} m (CPU) and ${(dG / nn).toFixed(2)} m (GPU); ${far} fish ended > 1 m apart from the CPU's` + (dists.length ? `, e.g. #${dists[0][0]} ${fish[dists[0][0]].s.key} ${dists[0][1].toFixed(1)} vs ${dists[0][2].toFixed(1)} m` : ''));
  { let r = 0; for (let i = 0; i < n; i++) if (runner(i)) r++; const gl = await G.readGlobals(); log(`   (${r} ripe brook runners left out; the GPU's sums: ${gl.slice(0, 11).reduce((t, v) => t + v, 0).toFixed(0)} fish, ${(gl[32] / 1000 / F.lakeHa).toFixed(1)} kg/ha; the run's held sites ${gl.slice(16, 27).map(v => v.toFixed(0)).join(',')})`); }
}
// ===== 7. THE BODY (fish3 _energetics: FB4) =====
const cmC = new Float64Array(n);
{
  tc = performance.now();
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const sp = a.s.sp, bp = (sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio; cmC[i] = F._energetics(a, bp, a.T, B); }
  tc = performance.now() - tc;
  await G.run(enc => G.encodeKernel(enc, 'k_body'));
  A = (await G.readAgents()).A;
  compare(`body (CPU ${tc.toFixed(0)} ms)`, ['cm', 'W', 'L', 'K', 'gut', 'gutE', 'gon', 'rO2', 'uAvg', 'cons', 'consMax', 'spdMax', 'turnMax', 'senseR', 'gape', 'bdep', 'energy', 'hunger'], A,
    (a, f, i) => f === 'cm' ? cmC[i] : a[f], { tol: 2e-4, abs: 1e-7, skip: i => !fish[i].alive });
}
// ===== 8. FEEDING (fish3 _feed: strikes, the bed and weeds, the surface, the zooplankton, the organic layer) =====
// (fish3 feeds fish after fish, each on what those before it left; the GPU all at once, sharing a contested cell's food — so the
// check is on the totals and on each fish's meal where little is contested; the young: fish3's table built fresh and its requests
// settled at the end, _yTable/_ySettle, as the GPU's encodeFeed does with y_table, k_eatYoyReq and k_eatYoyGet)
{
  const ch = env.chem, lit = env.lit, Gg = env.G, sum = a => { let t = 0; for (let q = 0; q < a.length; q++) t += a[q]; return t; };
  const bedTot = () => { let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += ch.benth[j] * ch.a[j]; return t; };
  const zooTot = (f) => { let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += f[j] * ch.w[j]; return t; };
  const surfTot = () => { let t = 0; for (let c = 0; c < Gg.NC; c++) t += (lit.surfA[c] + lit.surfT[c]) * Gg.area[c]; return t; };
  const litTot = (f) => { let t = 0; for (let q = 0; q < lit.cells.length; q++) t += f[q] * Gg.bedA[lit.cells[q]]; return t; };
  const before = { bed: bedTot(), zD: zooTot(ch.zooD), zC: zooTot(ch.zooC), surf: surfTot(), L: litTot(lit.L), sn: litTot(lit.sn), cr: litTot(lit.crA) + litTot(lit.crY), sed: zooTot(ch.sedOM) };
  const food0 = { ...F.stats.food }, kills0 = F.stats.kills, gut0 = fish.map(a => a.gut), fryE0 = Object.fromEntries(Object.entries(F.stats.fry).map(([k, v]) => [k, v.eaten]));
  tc = performance.now();
  if (FRY.DENSITY && F._yTable) F._yTable();   // (the young available now, before anyone feeds)
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const sp = a.s.sp, bp = (sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio;
    const ate = F._feed(a, i, cmC[i], a.visF, B); a.hunger = 1 - Math.min(1, Math.max(0, a.gut / (sp.gut * a.W))); if (ate) a._ate = true; }
  if (FRY.DENSITY && F._ySettle) F._ySettle();   // (the young the followed fish asked for, settled)
  tc = performance.now() - tc;
  const after = { bed: bedTot(), zD: zooTot(ch.zooD), zC: zooTot(ch.zooC), surf: surfTot(), L: litTot(lit.L), sn: litTot(lit.sn), cr: litTot(lit.crA) + litTot(lit.crY), sed: zooTot(ch.sedOM) };
  G.clearTallies();
  const Wb = G.W.slice(); await G.run(enc => G.encodeFeed(enc));
  const Wa = new Float32Array(await G.read(G.B.WD)), o = G.WL.offs; A = (await G.readAgents()).A;
  const gsec = (W, sec, len) => W.subarray(o[sec], o[sec] + len);
  const gBed = W => { const b = gsec(W, 'benth', Gg.NCELL); let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += b[j] * ch.a[j]; return t; };
  const gZoo = (W, s) => { const b = gsec(W, s, Gg.NCELL); let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += b[j] * ch.w[j]; return t; };
  const gSurf = W => { const A1 = gsec(W, 'surfA', Gg.NC), T1 = gsec(W, 'surfT', Gg.NC); let t = 0; for (let c = 0; c < Gg.NC; c++) t += (A1[c] + T1[c]) * Gg.area[c]; return t; };
  const gLit = (W, s) => { const b = gsec(W, s, lit.cells.length); let t = 0; for (let q = 0; q < lit.cells.length; q++) t += b[q] * Gg.bedA[lit.cells[q]]; return t; };
  const used = (b, a) => `${(100 * (b - a) / Math.max(1e-12, b)).toFixed(2)} %`;
  log(`feeding (CPU ${tc.toFixed(0)} ms) — the share of each food eaten this block, CPU · GPU:`);
  log(`   the bed's worms ${used(before.bed, after.bed)} · ${used(gBed(Wb), gBed(Wa))}; Daphnia ${used(before.zD, after.zD)} · ${used(gZoo(Wb, 'zooD'), gZoo(Wa, 'zooD'))}; copepods ${used(before.zC, after.zC)} · ${used(gZoo(Wb, 'zooC'), gZoo(Wa, 'zooC'))}`);
  log(`   the surface's insects ${used(before.surf, after.surf)} · ${used(gSurf(Wb), gSurf(Wa))}; the weeds' insects ${used(before.L, after.L)} · ${used(gLit(Wb, 'litL'), gLit(Wa, 'litL'))}; snails ${used(before.sn, after.sn)} · ${used(gLit(Wb, 'litSn'), gLit(Wa, 'litSn'))}; crayfish ${used(before.cr, after.cr)} · ${used(gLit(Wb, 'litCrA') + gLit(Wb, 'litCrY'), gLit(Wa, 'litCrA') + gLit(Wa, 'litCrY'))}`);
  const tl = await G.readTallies(), FK = ['zoo', 'benth', 'weed', 'cray', 'surf', 'fish', 'sed', 'yoy'];
  { let fe = 0, fg = 0; const KS = Object.keys(F.stats.fry); KS.forEach((k, q) => { fe += F.stats.fry[k].eaten - fryE0[k]; fg += tl[L.TP.FRY + q * 7 + 4] / 1e6; }); log(`   young eaten by followed fish: CPU ${fe.toFixed(0)} · GPU ${fg.toFixed(0)}`); }
  log('   grams eaten, CPU · GPU: ' + FK.map((k, q) => `${k} ${(F.stats.food[k] - food0[k]).toFixed(0)} · ${(tl[L.TP.FOOD + q] / 1e6).toFixed(0)}`).join('; '));
  let gk = 0; for (let q = 0; q < KEYS3.length ** 2; q++) gk += tl[L.TP.KILLS + q] / 1e6; log(`   fish killed by followed fish: CPU ${F.stats.kills - kills0} · GPU ${gk.toFixed(0)}`);
  // each fish's meal
  let within = 0, fed = 0, both = 0, sc = 0, sg = 0; const bySp = {};
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const g = L.readAgent(A, cap, i); if (!g.alive) continue;
    const dc = (a.gut - gut0[i]) * a.n, dg = (g.gut - gut0[i]) * g.n; sc += dc; sg += dg;
    const r = bySp[a.s.key] || (bySp[a.s.key] = [0, 0]); r[0] += dc; r[1] += dg;
    if (dc > 0 || dg > 0) { fed++; if (Math.abs(dc - dg) <= 0.05 * Math.max(dc, dg) + 1e-9) within++; if (dc > 0 && dg > 0) both++; } }
  log(`   meals: ${fed} fish ate on one engine or both, ${both} on both, ${within} within 5 % of each other; total ${(sc / 1000).toFixed(1)} kg (CPU) · ${(sg / 1000).toFixed(1)} kg (GPU)`);
  log('   by species (kg, CPU · GPU): ' + Object.entries(bySp).map(([k, [c, g]]) => `${k} ${(c / 1000).toFixed(2)} · ${(g / 1000).toFixed(2)}`).join('; '));
  // (the largest single meals' differences among the piscivores: who they are — size, guarding, ripeness, gut, where — to trace a mismatch)
  { const rows = []; for (let i = 0; i < n; i++) { const a = fish[i], g = L.readAgent(A, cap, i); if (!(a.s.key === 'bass' || a.s.key === 'pike')) continue; const dc = (a.alive ? a.gut - gut0[i] : 0) * a.n, dg = (g.gut - gut0[i]) * g.n; if (Math.abs(dc - dg) > 1) rows.push([Math.abs(dc - dg), `#${i} ${a.s.key} ${a.L.toFixed(0)} cm nt ${(a.nt / 86400).toFixed(1)} d ripe ${a.ripe ? 1 : 0} gut0 ${(gut0[i] / (a.s.sp.gut * a.W)).toFixed(2)} bed ${a.bed.toFixed(2)} m · CPU ${dc.toFixed(1)} g GPU ${dg.toFixed(1)} g`]); }
    rows.sort((x, y) => y[0] - x[0]); if (rows.length) log(`   the piscivores' largest meal differences (${rows.length} > 1 g): ` + rows.slice(0, 8).map(r => r[1]).join(' | ')); }
}
// ===== 8b. SPAWNING (fish3 _spawn: mates, the spawn, the newborn school, the nest) =====
{
  const KS = Object.keys(F.stats.spawns), sp0 = { ...F.stats.spawns }, eg0 = { ...F.stats.eggs }, h0 = Object.fromEntries(KS.map(k => [k, F.stats.fry[k].hatched])), ny0 = F.yoy.length;
  let ripe = 0; for (const a of fish) if (a.alive && a.ripe) ripe++;
  tc = performance.now(); for (let i = 0; i < n; i++) { const a = fish[i]; if (a.alive && a.ripe) F._spawn(a, i, B); } tc = performance.now() - tc;
  G.clearTallies(); await G.run(enc => G.encodeSpawn(enc)); const cnt = await G.readCounts(), tl = await G.readTallies();
  log(`spawning (CPU ${tc.toFixed(0)} ms): ${ripe} ripe fish; new schools CPU ${F.yoy.length - ny0} · GPU ${cnt.born}`);
  log('   spawnings by species, CPU · GPU: ' + KS.map((k, q) => `${k} ${F.stats.spawns[k] - sp0[k]} · ${(tl[L.TP.SPAWNS + q] / 1e6).toFixed(0)}`).filter(x => !/ 0 · 0$/.test(x)).join('; '));
  log('   larvae hatched (thousands), CPU · GPU: ' + KS.map((k, q) => `${k} ${((F.stats.fry[k].hatched - h0[k]) / 1e3).toFixed(0)} · ${(tl[L.TP.FRY + q * 7 + 6] / 1e9).toFixed(0)}`).filter(x => !/ 0 · 0$/.test(x)).join('; '));
  G.ny = cnt.ny;
}
// ===== 9. BREATH AND DEATH (fish3 _live's O₂, _hazards) =====
{
  const ch = env.chem, Gg = env.G, o2c = Float32Array.from(ch.o2);
  const died0 = JSON.parse(JSON.stringify(F.stats.died)), n0 = fish.map(a => a.n);
  tc = performance.now();
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; ch.o2[a.j] = Math.max(0, ch.o2[a.j] - a.n * a.rO2 * B / (Gg.vol[a.j] * ENV.O2_MGL)); }
  let expDeaths = 0; for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; F._hazards(a, a.T, B); }
  tc = performance.now() - tc;
  await G.run(enc => G.encodeHaz(enc));
  const Wa = new Float32Array(await G.read(G.B.WD)), o = G.WL.offs; A = (await G.readAgents()).A;
  let o2bad = 0; for (let j = 0; j < Gg.NCELL; j++) if (Math.abs(Wa[o.o2 + j] - ch.o2[j]) > 1e-4 * Math.max(0.1, ch.o2[j])) o2bad++;
  compare(`hazards (CPU ${tc.toFixed(0)} ms): exposure`, ['xo', 'xt'], A, (a, f) => a[f], { tol: 1e-4, skip: i => !fish[i].alive });
  let schoolsBad = 0, schools = 0, deadC = 0, deadG = 0;
  for (let i = 0; i < n; i++) { const a = fish[i], g = L.readAgent(A, cap, i); if (n0[i] > 1) { schools++; if (Math.abs(a.n - g.n) > 1e-3 * n0[i] && a.alive && g.alive) schoolsBad++; } }
  const tl = await G.readTallies(); const causes = ['starve', 'heat', 'hypoxia', 'other', 'old', 'eaten', 'stranded', 'wild'];
  const dC = {}, dG = {}; for (const k in F.stats.died) for (const c in F.stats.died[k]) dC[c] = (dC[c] || 0) + F.stats.died[k][c] - ((died0[k] || {})[c] || 0);
  for (let k = 0; k < KEYS3.length; k++) causes.forEach((c, q) => { dG[c] = (dG[c] || 0) + tl[L.TP.DIED + k * causes.length + q] / 1e6; });
  log(`   O₂ after breathing: ${o2bad} of ${Gg.NCELL} cells differ; schools' losses: ${schoolsBad} of ${schools} differ`);
  log('   deaths this block by cause, CPU · GPU (the GPU’s eaten: its strikes this block): ' + causes.map(c => `${c} ${(dC[c] || 0).toFixed(1)} · ${(dG[c] || 0).toFixed(1)}`).join('; '));
}
// ===== 10. THE YOUNG (fish3 _stepYoy: each school's move, its feeding tick, its deaths, its next spot) =====
{
  const ch = env.chem, Gg = env.G, lit = env.lit, fr0 = JSON.parse(JSON.stringify(F.stats.fry)), yf0 = { ...F.stats.food };
  const zTot = f => { let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += f[j] * ch.w[j]; return t; };
  const b0 = { zD: zTot(ch.zooD), zC: zTot(ch.zooC), zR: zTot(ch.zooR) };
  const n0 = yoy.map(q => q.n), L0 = yoy.map(q => q.L), tk0 = yoy.map(q => q.tk);
  const dev0 = yoy.map(q => q.dev);   // (E3: the clutches on the bed at the block's start)
  tc = performance.now(); F._stepYoy(B, B, yf); tc = performance.now() - tc;
  const b1 = { zD: zTot(ch.zooD), zC: zTot(ch.zooC), zR: zTot(ch.zooR) };
  G.clearTallies();
  const Wb = new Float32Array(await G.read(G.B.WD)); await G.run(enc => G.encodeYoy(enc)); const Wa = new Float32Array(await G.read(G.B.WD)), o = G.WL.offs;
  const Yg = await G.readYoyArr(), tl = await G.readTallies();
  const gz = (W, s) => { const b = W.subarray(o[s], o[s] + Gg.NCELL); let t = 0; for (let j = 0; j < Gg.NCELL; j++) t += b[j] * ch.w[j]; return t; };
  const used = (b, a) => `${(100 * (b - a) / Math.max(1e-12, b)).toFixed(3)} %`;
  let feeders = 0, nOk = 0, LOk = 0, recC = 0, recG = 0, aliveC = 0, aliveG = 0, nC = 0, nG = 0;
  for (let q = 0; q < ny; q++) { const c = yoy[q], g = L.readYoy(Yg, G.ycap, q);
    if (c.alive) { aliveC++; nC += c.n; } if (g.alive) { aliveG++; nG += g.n; } if (g.recruit > 0) recG++; if (!c.alive && c.L >= c.s.sp.L0) recC++;
    if (q < ny && tk0[q] + B >= F3.YOY_TICK) { feeders++; if (c.alive && g.alive) { if (Math.abs(c.n - g.n) <= 0.02 * Math.max(c.n, 1)) nOk++; if (Math.abs(c.L - g.L) <= 0.01 * c.L) LOk++; } } }
  { let ne = 0, nOk = 0, dOk = 0, nC = 0, nG = 0; for (let q = 0; q < ny; q++) { if (!(dev0[q] < 2)) continue; ne++; const cq = yoy[q], g = L.readYoy(Yg, G.ycap, q); const cn = cq.alive ? cq.n : 0, gn = g.alive ? g.n : 0; nC += cn; nG += gn;
      if (Math.abs(cn - gn) <= 0.01 * Math.max(1, n0[q])) nOk++; if (Math.abs((cq.dev ?? 2) - (g.dev ?? 2)) <= 1e-3) dOk++; }
    if (ne) log(`the clutches on the bed (E3): ${ne} — numbers within 1 % in ${nOk}, development within 0.001 in ${dOk}; ${(nC / 1e3).toFixed(0)}k · ${(nG / 1e3).toFixed(0)}k eggs and yolk-sac larvae`); }
  log(`the young (CPU ${tc.toFixed(0)} ms): ${feeders} schools fed this block — ${nOk} with numbers within 2 %, ${LOk} lengths within 1 % of fish3's; ${aliveC} · ${aliveG} schools alive (${(nC / 1e3).toFixed(0)}k · ${(nG / 1e3).toFixed(0)}k fish); recruiting ${recC} · ${recG}`);
  log(`   zooplankton the young ate this block, CPU · GPU: Daphnia ${used(b0.zD, b1.zD)} · ${used(gz(Wb, 'zooD'), gz(Wa, 'zooD'))}; copepods ${used(b0.zC, b1.zC)} · ${used(gz(Wb, 'zooC'), gz(Wa, 'zooC'))}; rotifers ${used(b0.zR, b1.zR)} · ${used(gz(Wb, 'zooR'), gz(Wa, 'zooR'))}`);
  const FY = [['yZoo', 8], ['yWeed', 9], ['yBenth', 10], ['ySed', 11]]; log('   grams the young ate, CPU · GPU: ' + FY.map(([k, q]) => `${k} ${(F.stats.food[k] - yf0[k]).toFixed(0)} · ${(tl[L.TP.FOOD + q] / 1e6).toFixed(0)}`).join('; '));
  const C6 = ['natural', 'starve', 'heat', 'hypoxia', 'eaten', 'wild'], KS = Object.keys(F.stats.fry);
  log('   the young\u2019s deaths this block, CPU · GPU: ' + C6.map((cs, ci) => { let c = 0, g = 0; KS.forEach((k, q) => { c += (F.stats.fry[k][cs] || 0) - (fr0[k][cs] || 0); g += (cs === 'wild' ? tl[L.TP.YWILD + q] : tl[L.TP.FRY + q * 7 + ci]) / 1e6; }); return `${cs} ${c.toFixed(0)} · ${g.toFixed(0)}`; }).join('; '));
  { const r0 = fr0, nA0 = G.n; await G.run(enc => G.encodeRecruit(enc)); const cnt = await G.readCounts(), tl2 = await G.readTallies(); let rc = 0, rg = 0; KS.forEach((k, q) => { rc += F.stats.fry[k].recruited - r0[k].recruited; rg += tl2[460 + q] / 1e6; });
    log(`   recruits (fish): CPU ${rc.toFixed(0)} · GPU ${rg.toFixed(0)}; agents ${nA0} → ${cnt.n} on the GPU (+${cnt.recruits})`); G.n = cnt.n; }
  { const ts = {}; for (const k of ['y_move', 'y_feedReq', 'y_feedTake', 'y_mort', 'y_target']) ts[k] = await timeIt(enc => G.encodeY(enc, k)); log(`   GPU per kernel (ms, ${ny} schools): ` + Object.entries(ts).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · ')); }
}
// ===== timings of the kernels so far =====
{
  const ts = {}; for (const [k, wg] of [['k_pre', 128], ['k_learn', 128], ['k_sense', 128], ['k_brain', 64], ['k_move', 64], ['k_body', 128]]) ts[k] = await timeIt(enc => G.encodeKernel(enc, k, wg));
  log(`GPU per kernel (ms, ${n} agents): ` + Object.entries(ts).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · '));
}
const tl = await G.readTallies(); log(`tallies: crossings ${Array.from(tl.slice(0, 11)).map(v => (v / 1000).toFixed(0)).join(',')}`);
document.title = 'done';
