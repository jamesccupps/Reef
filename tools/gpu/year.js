// GPU stage G3 (docs/GPU_SIM.md): THE YEAR RUNNER — the GPU engine's coarse blocks through whole years, seed after seed, its lines
// in tools/w3_season.mjs's format (the CPU's own year run) so the two compare line by line: each species' fish against the start,
// kg/ha, ration, mean cm, the young, spawnings and deaths (counted from the founding, as the CPU's are), and who ate whom at the end.
//   http://localhost:8000/tools/gpu/year.html?world=true&seeds=611,612,613&yf=0.22&days=365&every=14
// The lines also go to window.YEAR (by seed) for a script to read; the page's title is 'done' at the end.
import '../../src/w3/render3/world3sel.js';
const out = document.getElementById('out');
const log = (...a) => { out.textContent += a.join(' ') + '\n'; console.log(...a); };
const qs = new URLSearchParams(location.search);
const SEEDS = (qs.get('seeds') || '611').split(',').map(Number), DAYS = +(qs.get('days') || 365), EVERY = +(qs.get('every') || 14), YF = +(qs.get('yf') || 0.22);
const B = 1752, PER_DAY = Math.round(86400 / B), OVERLAP = qs.get('overlap') !== '0';
const { Env3 } = await import('../../src/w3/env3.js');
const { Fish3, KEYS3 } = await import('../../src/w3/fish3.js');
const { seed } = await import('../../src/core.js');
const { waterOf } = await import('../../src/w3/render3/fishside3.js');
const { GpuFish } = await import('../../src/w3/gpu/gpufish.js');
const NK = KEYS3.length, NCAUSE = 7, CAUSES = ['starve', 'heat', 'hypoxia', 'other', 'old', 'eaten', 'stranded'];
const T_KILLS = 96, T_DIED = 224, T_SPAWNS = 412, T_RECRUITS = 460;   // (tally pairs: wgsl.js's word offsets / 2)
const { dev, info } = await GpuFish.device(); log(`GPU: ${info.vendor} ${info.architecture}`);
window.YEAR = {};
for (const sd of SEEDS) {
  const t0 = performance.now();
  seed(sd); const env = new Env3({ yf0: YF }), F = new Fish3(env, { young: true });
  const G = new GpuFish(dev, F, env, { seed: sd }); G.uploadAgents(F.fish); G.uploadYoy(F.yoy); G.clearTallies(); await dev.queue.onSubmittedWorkDone();
  const st0 = JSON.parse(JSON.stringify(F.stats)), lines = window.YEAR[sd] = [];
  const say = s => { log(s); lines.push(s); };
  say(`\n#### seed ${sd} · founded in ${((performance.now() - t0) / 1000).toFixed(1)} s: ${F.fish.length} agents, ${F.yoy.length} young schools · arrays ${G.cap} agents, ${G.ycap} young`);
  let first = null, tB = 0, nB = 0;
  const report = async tag => {
    const c = await G.census(), tl = await G.readTallies(); first = first || c;
    const kg = KEYS3.reduce((t, k) => t + c[k].kgHa, 0), w = waterOf(env);
    say(`== ${tag} · yf ${env.yearFrac().toFixed(3)} · ${((performance.now() - t0) / 60000).toFixed(1)} min (${nB ? (tB / nB).toFixed(1) : '-'} ms a block, the water included) · ${kg.toFixed(0)} kg/ha · Upper surface ${w[1].tS.toFixed(1)} °C, bottom O₂ ${w[1].oB.toFixed(1)} mg/L · agents ${G.n} · young schools ${G.ny} · arrays ${G.cap}/${G.ycap}${G.grew ? ` (grown ${G.grew}×)` : ''}`);
    KEYS3.forEach((k, q) => {
      const r = c[k], r0 = first[k], d0 = st0.died[k] || {}, died = {};
      CAUSES.forEach((cs, j) => { died[cs] = (d0[cs] || 0) + tl[T_DIED + q * NCAUSE + j] / 1e6; });
      const sp = (st0.spawns[k] || 0) + tl[T_SPAWNS + q] / 1e6;
      say(`   ${k.padEnd(10)} ${(r.n / Math.max(1, r0.n)).toFixed(3)}× ${String(Math.round(r.n)).padStart(7)} fish ${r.kgHa.toFixed(1).padStart(5)} kg/ha p ${r.p.toFixed(2)} ${r.L.toFixed(1)} cm · young ${(r.yoyN / 1000).toFixed(0)}k @ ${r.yoyL.toFixed(1)} cm · spawnings ${Math.round(sp)} · starved ${Math.round(died.starve)} eaten ${Math.round(died.eaten)} other ${Math.round(died.other + died.old + died.heat + died.hypoxia)} · recruits ${Math.round((st0.recruits[k] || 0) + tl[T_RECRUITS + q] / 1e6)}`);
    });
    return tl;
  };
  await report('start');
  let tl;
  for (let day = 1; day <= DAYS; day++) {
    for (let b = 0; b < PER_DAY; b++) {   // (the water model stepped while the GPU works — ?overlap=0: after, as fish3's runs do)
      const tb = performance.now(); if (OVERLAP) await G.block(B, () => env.step(B)); else { await G.block(B); env.step(B); } tB += performance.now() - tb; nB++;
    }
    if (day % EVERY === 0 || day === DAYS) tl = await report(`day ${day}`);
  }
  const kills = []; KEYS3.forEach((kp, p) => KEYS3.forEach((kq, q) => { const v = tl[T_KILLS + p * NK + q] / 1e6; if (v > 0) kills.push([`${kp}>${kq}`, v]); }));
  kills.sort((a, b) => b[1] - a[1]); say('who ate whom (kills): ' + kills.slice(0, 14).map(([k, n]) => `${k} ${Math.round(n)}`).join(' · '));
  G.destroy();
}
document.title = 'done';
