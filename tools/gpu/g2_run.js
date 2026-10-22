// GPU stage G2 (docs/GPU_SIM.md): the GPU engine's coarse blocks over days against fish3.js's own (F.step + env.step), each from
// its own founding with the same seed — the two engines' random streams differ, so they are compared as populations: fish, kg/ha,
// mean length, the young, spawnings, recruits, the eaten and the dead, by species, every `every` days.
//   http://localhost:8000/tools/gpu/g2_run.html?seeds=611,612,613&days=30&every=5&yf=0.3[&world=true][&mode=gpu|cpu|both]
// The CPU's true-size block is ~5 s (a day ~4 min): there, mode=gpu, and the CPU's own runs come from tools/w3_season.mjs.
import '../../src/w3/render3/world3sel.js';
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const qs = new URLSearchParams(location.search);
const SEEDS = (qs.get('seeds') || '611').split(',').map(Number), DAYS = +(qs.get('days') || 10), EVERY = +(qs.get('every') || 2), YF = +(qs.get('yf') || 0.3);
const MODE = qs.get('mode') || 'both', B = 1752, PER_DAY = Math.round(86400 / B);
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, KEYS3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
const { GpuFish } = await import('../../src/w3/gpu/gpufish.js');
const { TP } = await import('../../src/w3/gpu/layout.js');   // (the tallies' pair offsets by name)
const KS = ['sunfish', 'perch', 'sucker', 'catfish', 'whiteperch', 'bass', 'pike', 'redbreast', 'fallfish', 'killifish', 'dace'];
const fmt = (c, c0) => KS.map(k => { const r = c[k], r0 = c0[k]; return `${k.slice(0, 6).padEnd(6)} ${(r.n / Math.max(1, r0.n)).toFixed(3)}× ${r.kgHa.toFixed(1).padStart(5)} kg/ha ${r.L.toFixed(1).padStart(5)} cm · young ${(r.yoyN / 1e3).toFixed(0).padStart(6)}k @ ${r.yoyL.toFixed(2)} cm`; });
const { dev, info } = MODE === 'cpu' ? {} : await GpuFish.device(); if (info) log(`GPU: ${info.vendor} ${info.architecture}`);
const results = {};
for (const sd of SEEDS) {
  for (const eng of MODE === 'both' ? ['cpu', 'gpu'] : [MODE]) {
    const t0 = performance.now();
    seed(sd); const env = new Env3({ yf0: YF }), F = new Fish3(env, { young: true });
    log(`\n== seed ${sd} · ${eng.toUpperCase()} · founded in ${((performance.now() - t0) / 1000).toFixed(1)} s: ${F.fish.length} agents, ${F.yoy.length} young schools`);
    let G = null; if (eng === 'gpu') { G = new GpuFish(dev, F, env, { seed: sd }); G.uploadAgents(F.fish); G.uploadYoy(F.yoy); G.clearTallies(); await dev.queue.onSubmittedWorkDone(); }
    const census = async () => eng === 'gpu' ? G.census() : F.census();
    const c0 = await census(); const rows = [{ day: 0, c: c0 }]; let tBlocks = 0, nB = 0;
    const st0 = JSON.parse(JSON.stringify(F.stats));   // (the CPU's tallies at the start: the season's seeding counted its spawnings)
    for (let day = 1; day <= DAYS; day++) {
      for (let b = 0; b < PER_DAY; b++) {
        const tb = performance.now();
        if (eng === 'gpu') await G.block(B); else F.step(B);
        tBlocks += performance.now() - tb; nB++;
        env.step(B);
      }
      if (day % EVERY === 0 || day === DAYS) {
        const c = await census(); rows.push({ day, c });
        const kg = KS.reduce((t, k) => t + c[k].kgHa, 0);
        log(`-- day ${day} (yf ${env.yearFrac().toFixed(3)}): ${kg.toFixed(1)} kg/ha · ${(tBlocks / nB).toFixed(1)} ms a block (${eng})`);
        for (const l of fmt(c, c0)) log('   ' + l);
      }
    }
    if (eng === 'gpu') { const tl = await G.readTallies(); results[`${sd}-gpu`] = { rows, tl }; G.destroy(); }
    else results[`${sd}-cpu`] = { rows, stats: JSON.parse(JSON.stringify(F.stats)) };
    // the tallies: spawnings, recruits, followed fish eaten, deaths
    const r = results[`${sd}-${eng}`];
    if (eng === 'gpu') { const tl = r.tl; log('   spawnings ' + KS.map((k, q) => `${k.slice(0, 6)} ${(tl[TP.SPAWNS + q] / 1e6).toFixed(0)}`).join(' ') + ' · recruits ' + KS.map((k, q) => (tl[TP.RECRUITS + q] / 1e6).toFixed(0)).join('/') + ` · kills ${Array.from({ length: KS.length ** 2 }, (_, q) => tl[TP.KILLS + q] / 1e6).reduce((a, b) => a + b, 0).toFixed(0)}`); }
    else { const st = r.stats; log('   spawnings ' + KS.map(k => `${k.slice(0, 6)} ${st.spawns[k] - st0.spawns[k]}`).join(' ') + ' · recruits ' + KS.map(k => st.recruits[k] - st0.recruits[k]).join('/') + ` · kills ${st.kills - st0.kills}`); r.stats0 = st0; }
  }
}
// both engines side by side: each species' fish (× start), kg/ha and mean length at the end, mean ± range over the seeds
if (MODE === 'both') {
  log('\n== at the end, CPU · GPU over the seeds (mean [min–max]):');
  const stat = (eng, f) => { const v = SEEDS.map(sd => f(results[`${sd}-${eng}`].rows.at(-1).c, results[`${sd}-${eng}`].rows[0].c)); const m = v.reduce((a, b) => a + b, 0) / v.length; return `${m.toFixed(3)} [${Math.min(...v).toFixed(3)}–${Math.max(...v).toFixed(3)}]`; };
  for (const k of KS) log(`   ${k.padEnd(10)} fish ${stat('cpu', (c, c0) => c[k].n / Math.max(1, c0[k].n))} · ${stat('gpu', (c, c0) => c[k].n / Math.max(1, c0[k].n))}   kg/ha ${stat('cpu', c => c[k].kgHa)} · ${stat('gpu', c => c[k].kgHa)}   young ${stat('cpu', (c, c0) => c[k].yoyN / Math.max(1, c0[k].yoyN))} · ${stat('gpu', (c, c0) => c[k].yoyN / Math.max(1, c0[k].yoyN))}`);
}
window.G2 = results; document.title = 'done';
