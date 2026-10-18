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
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, F3, HID3, reinforce3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
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
const yf = env.yearFrac(), att = env.chem.attenuation(), clar = env.chem.clarity(); F._yr = Math.floor(env.time / YEAR);
const lux0 = env.lux, luxB = [lux0, env.luxAhead(B / 2), env.luxAhead(B)]; F._cx = { yf, att, clar, lux0 };
const fish = F.fish, n = fish.length; for (const a of fish) if (!a.alive) throw new Error('a dead fish in the list');
// ---------- the GPU, from the same state ----------
const { dev, info } = await GpuFish.device(); log(`GPU: ${info.vendor} ${info.architecture}`);
const tau0 = F3.WANDER_TAU; F3.WANDER_TAU = 0;   // (the GPU built without the block's random wander — see the move check)
const G = new GpuFish(dev, F, env, { seed: SEED }); F3.WANDER_TAU = tau0;
G.uploadAgents(fish); G.uploadWater(); G.setUniforms(B, { lux0, luxB }); G.clearTallies();
await dev.queue.onSubmittedWorkDone();
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
{
  const cmC = new Float64Array(n);
  tc = performance.now();
  for (let i = 0; i < n; i++) { const a = fish[i]; if (!a.alive) continue; const sp = a.s.sp, bp = (sp.bioJuv && (sp.juvW ? a.W < sp.juvW : a.age < YEAR)) ? sp.bioJuv : sp.bio; cmC[i] = F._energetics(a, bp, a.T, B); }
  tc = performance.now() - tc;
  await G.run(enc => G.encodeKernel(enc, 'k_body'));
  A = (await G.readAgents()).A;
  compare(`body (CPU ${tc.toFixed(0)} ms)`, ['cm', 'W', 'L', 'K', 'gut', 'gutE', 'gon', 'rO2', 'uAvg', 'cons', 'consMax', 'spdMax', 'turnMax', 'senseR', 'gape', 'bdep', 'energy', 'hunger'], A,
    (a, f, i) => f === 'cm' ? cmC[i] : a[f], { tol: 2e-4, abs: 1e-7, skip: i => !fish[i].alive });
}
// ===== timings of the kernels so far =====
{
  const ts = {}; for (const [k, wg] of [['k_pre', 128], ['k_learn', 128], ['k_sense', 128], ['k_brain', 64], ['k_move', 64], ['k_body', 128]]) ts[k] = await timeIt(enc => G.encodeKernel(enc, k, wg));
  log(`GPU per kernel (ms, ${n} agents): ` + Object.entries(ts).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · '));
}
const tl = await G.readTallies(); log(`tallies: crossings ${Array.from(tl.slice(0, 11)).map(v => (v / 1000).toFixed(0)).join(',')}`);
document.title = 'done';
