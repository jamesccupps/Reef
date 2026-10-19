// GPU stage G3 (docs/GPU_SIM.md): THE YEAR RUNNER — the GPU engine's coarse blocks through whole years, seed after seed, its lines
// in tools/w3_season.mjs's format (the CPU's own year run) so the two compare line by line: each species' fish against the start,
// kg/ha, ration, mean cm, the young, spawnings and deaths (counted from the founding, as the CPU's are), and who ate whom at the end.
// THE DIAGNOSTICS (?diet=0 off): the ration p is the report interval's (the intake tallies reset after each report — the CPU's lines
// give it since the founding), with each species' mean condition K, and a line of its diet over the interval by food.
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
// A/B switches on the model's numbers, set before anything is built (each documented in config.js): ?mjuvb= FRY.M_JUV_B
{ const { FRY } = await import('../../src/config.js'); if (qs.has('mjuvb')) FRY.M_JUV_B = +qs.get('mjuvb'); }
const NK = KEYS3.length, NCAUSE = 7, CAUSES = ['starve', 'heat', 'hypoxia', 'other', 'old', 'eaten', 'stranded'];
const T_KILLS = 96, T_DIED = 224, T_SPAWNS = 412, T_RECRUITS = 460, T_FOODK = 512, NFOODK = 8;   // (tally pairs: wgsl.js's word offsets / 2)
const FOODS = ['fish', 'young', 'bed', 'weeds', 'cray', 'surface', 'zoo', 'mud'], DIET = qs.get('diet') !== '0';
const { dev, info } = await GpuFish.device(); log(`GPU: ${info.vendor} ${info.architecture}`);
window.YEAR = {};
for (const sd of SEEDS) {
  const t0 = performance.now();
  seed(sd); const env = new Env3({ yf0: YF }), F = new Fish3(env, { young: true });
  const G = new GpuFish(dev, F, env, { seed: sd }); G.uploadAgents(F.fish); G.uploadYoy(F.yoy); G.clearTallies(); await dev.queue.onSubmittedWorkDone();
  const st0 = JSON.parse(JSON.stringify(F.stats)), lines = window.YEAR[sd] = [];
  const say = s => { log(s); lines.push(s); };
  say(`\n#### seed ${sd} · founded in ${((performance.now() - t0) / 1000).toFixed(1)} s: ${F.fish.length} agents, ${F.yoy.length} young schools · arrays ${G.cap} agents, ${G.ycap} young`);
  let first = null, tB = 0, nB = 0, tlPrev = null; const lastYoy = {};
  const report = async tag => {
    const c = await G.census(), tl = await G.readTallies(); first = first || c;
    const kg = KEYS3.reduce((t, k) => t + c[k].kgHa, 0), w = waterOf(env), gl = await G.gridLoad();
    say(`== ${tag} · yf ${env.yearFrac().toFixed(3)} · ${((performance.now() - t0) / 60000).toFixed(1)} min (${nB ? (tB / nB).toFixed(1) : '-'} ms a block, the water included) · ${kg.toFixed(0)} kg/ha · Upper surface ${w[1].tS.toFixed(1)} °C, bottom O₂ ${w[1].oB.toFixed(1)} mg/L · agents ${G.n} · young schools ${G.ny} · arrays ${G.cap}/${G.ycap}${G.grew ? ` (grown ${G.grew}×)` : ''} · the fullest grid cell ${gl.max} agents (${gl.big} cells > 256)`);
    KEYS3.forEach((k, q) => {
      const r = c[k], r0 = first[k], d0 = st0.died[k] || {}, died = {};
      CAUSES.forEach((cs, j) => { died[cs] = (d0[cs] || 0) + tl[T_DIED + q * NCAUSE + j] / 1e6; });
      const sp = (st0.spawns[k] || 0) + tl[T_SPAWNS + q] / 1e6;
      say(`   ${k.padEnd(10)} ${(r.n / Math.max(1, r0.n)).toFixed(3)}× ${String(Math.round(r.n)).padStart(7)} fish ${r.kgHa.toFixed(1).padStart(5)} kg/ha p ${r.p.toFixed(2)}${DIET ? ` K ${r.K.toFixed(2)}` : ''} ${r.L.toFixed(1)} cm · young ${(r.yoyN / 1000).toFixed(0)}k @ ${r.yoyL.toFixed(1)} cm · spawnings ${Math.round(sp)} · starved ${Math.round(died.starve)} eaten ${Math.round(died.eaten)} other ${Math.round(died.other + died.old + died.heat + died.hypoxia)} · recruits ${Math.round((st0.recruits[k] || 0) + tl[T_RECRUITS + q] / 1e6)}`);
      if (DIET && tlPrev) {
        const g = FOODS.map((f, j) => tl[T_FOODK + q * NFOODK + j] - tlPrev[T_FOODK + q * NFOODK + j]), tot = g.reduce((a, b) => a + b, 0) / 1e6;
        if (tot > 0) say(`      diet ${(tot / 1000).toFixed(0)} kg: ` + FOODS.map((f, j) => [f, g[j] / 1e6 / tot]).filter(x => x[1] >= 0.005).map(([f, v]) => `${f} ${(100 * v).toFixed(0)}%`).join(' · '));
        // the young's losses since the last report, by fate (wgsl.js FRY_*), as a share of the young alive then
        const fd = j => (tl[320 + q * 7 + j] - tlPrev[320 + q * 7 + j]) / 1e6, y0 = (lastYoy[k] || 0) + fd(6);
        if (y0 > 1000) say(`      young's fates (of ${(y0 / 1e3).toFixed(0)}k): ` + ['natural', 'starved', 'heat', 'hypoxia', 'eaten', 'recruited'].map((f, j) => [f, fd(j) / y0]).filter(x => x[1] >= 0.001).map(([f, v]) => `${f} ${(100 * v).toFixed(1)}%`).join(' · '));
      }
    });
    tlPrev = tl; KEYS3.forEach(k => { lastYoy[k] = c[k].yoyN; }); if (DIET) await G.resetIntake();
    return tl;
  };
  await report('start');
  // a watchdog: a block that hasn't returned in WATCH s says what it is waiting on (gpufish.js block's stage) — once
  let tlast = performance.now(), told = false; const WATCH = 30;
  const dog = setInterval(() => { if (!told && performance.now() - tlast > WATCH * 1000) { told = true; say(`!! WATCHDOG: a block has not returned in ${WATCH} s — waiting on '${G.stage}' · agents ${G.n}/${G.cap}, young ${G.ny}/${G.ycap}, block ${G.blk}`); } }, 5000);
  let tl;
  for (let day = 1; day <= DAYS; day++) {
    for (let b = 0; b < PER_DAY; b++) {   // (the water model stepped while the GPU works — ?overlap=0: after, as fish3's runs do)
      const tb = performance.now(); if (OVERLAP) await G.block(B, () => env.step(B)); else { await G.block(B); env.step(B); } tB += performance.now() - tb; nB++; tlast = performance.now();
    }
    if (day % EVERY === 0 || day === DAYS) tl = await report(`day ${day}`);
  }
  const kills = []; KEYS3.forEach((kp, p) => KEYS3.forEach((kq, q) => { const v = tl[T_KILLS + p * NK + q] / 1e6; if (v > 0) kills.push([`${kp}>${kq}`, v]); }));
  kills.sort((a, b) => b[1] - a[1]); say('who ate whom (kills): ' + kills.slice(0, 14).map(([k, n]) => `${k} ${Math.round(n)}`).join(' · '));
  // who ate the young: the followed fish (T_YKILLS: pairs 608 + pred·NK + prey) and the young piscivores' schools (729 + …)
  for (const [tag, at] of [['followed fish', 608], ['young schools', 729]]) {
    const yk = []; KEYS3.forEach((kp, p) => KEYS3.forEach((kq, q) => { const v = tl[at + p * NK + q] / 1e6; if (v >= 1) yk.push([`${kp}>${kq}`, v]); }));
    yk.sort((a, b) => b[1] - a[1]); if (yk.length) say(`young fish eaten by the ${tag}: ` + yk.slice(0, 14).map(([k, n]) => `${k} ${n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'k' : Math.round(n)}`).join(' · '));
  }
  // the young's diet over the year by species (T_YFOODK: pairs 850 + k·5 + kind)
  say("the young's diet over the year: " + KEYS3.map((k, q) => { const g = [0, 1, 2, 3, 4].map(j => tl[850 + q * 5 + j] / 1e6), t = g.reduce((a, b) => a + b, 0); return t > 1000 ? `${k} ${(t / 1e3).toFixed(0)} kg (` + ['young fish', 'zoo', 'weeds', 'bed', 'mud'].map((f, j) => [f, g[j] / t]).filter(x => x[1] >= 0.01).map(([f, v]) => `${f} ${(100 * v).toFixed(0)}%`).join(' ') + ')' : null; }).filter(Boolean).join(' · '));
  // the year's young by species: hatched, then their fates (wgsl.js FRY_*: natural, starve, heat, hypoxia, eaten, recruited)
  const FATES = ['natural', 'starved', 'heat', 'hypoxia', 'eaten', 'recruited'], T_FRY = 320;
  const FK = ['natural', 'starve', 'heat', 'hypoxia', 'eaten', 'recruited', 'hatched'];   // (fish3 stats.fry's keys: the founding's season so far counted in)
  say("the year's young (hatched → fates): " + KEYS3.map((k, q) => { const f0 = st0.fry[k] || {}, v = j => tl[T_FRY + q * 7 + j] / 1e6 + (f0[FK[j]] || 0), h = v(6); return h > 0 ? `${k} ${(h / 1e6).toFixed(1)}M → ` + FATES.map((f, j) => [f, v(j) / h]).filter(x => x[1] >= 0.001).map(([f, x]) => `${f} ${(100 * x).toFixed(1)}%`).join(' ') : null; }).filter(Boolean).join(' · '));
  clearInterval(dog); G.destroy();
}
document.title = 'done';
