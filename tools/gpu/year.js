// GPU stage G3 (docs/GPU_SIM.md): THE YEAR RUNNER — the GPU engine's coarse blocks through whole years, seed after seed, its lines
// in tools/w3_season.mjs's format (the CPU's own year run) so the two compare line by line: each species' fish against the start,
// kg/ha, ration, mean cm, the young, spawnings and deaths (counted from the founding, as the CPU's are), and who ate whom at the end.
// ?kby=perch,dace: the species whose followed fish's killers get a line (default perch, killifish, bullhead, dace)
// ?yby=pike,bass,killifish: the species whose young's predators get a line (default the two piscivores)
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
const { PLANKTON } = await import('../../src/config.js');
const { GpuFish } = await import('../../src/w3/gpu/gpufish.js');
// A/B switches on the model's numbers, set before anything is built (each documented where it's defined): ?mjuvb= FRY.M_JUV_B,
// ?ycover= the young pickerel's weight on cover (fish3 S3.pike.yCover)
{ const { FRY } = await import('../../src/config.js'); if (qs.has('mjuvb')) FRY.M_JUV_B = +qs.get('mjuvb');
  for (const [k, v] of qs) if (k.startsWith('fry.') && k.slice(4) in FRY && typeof FRY[k.slice(4)] === 'number') FRY[k.slice(4)] = +v; }   // (?fry.KEY=v: any of FRY's numbers — calibration A/Bs)
// ?ylpisc= the length the young pickerel's schools take their first fish (species.js BIO.pike.yLpisc)
{ const { S3 } = await import('../../src/w3/fish3.js'); if (qs.has('ycover')) S3.pike.yCover = +qs.get('ycover'); if (qs.has('ylpisc')) S3.pike.sp.yLpisc = +qs.get('ylpisc'); }
// ?r5=1: stage R item 5's package (fish3 stageR5: the encounter–strike–capture rule; soft water's few crayfish, item 6's water — before the overrides below, which win)
{ const { stageR5 } = await import('../../src/w3/fish3.js'); if (qs.get('r5') === '1') stageR5(true); }
// ?f3.KEY=v: any of F3's numbers; ?s3.<species>.<path>=v: a species' entry (numbers, or comma lists — e.g. s3.killifish.hab.day.bot=0.1,0.6,
// s3.pike.schoolExp=0.5) — both read when the GPU tables and constants are built, after this
{ const { F3, S3 } = await import('../../src/w3/fish3.js');
  for (const [k, v] of qs) {
    if (k.startsWith('f3.') && typeof F3[k.slice(3)] === 'number') F3[k.slice(3)] = +v;
    else if (k.startsWith('s3.')) { const path = k.slice(3).split('.'), last = path.pop(); let o = S3; for (const q of path) o = o?.[q]; if (o) o[last] = v.includes(',') ? v.split(',').map(Number) : +v; }
  } }
// ?cfg.BLOCK.KEY=v: any number or switch of config.js's blocks (e.g. cfg.PHYTO.PER_CAPITA=true), set before the lakes are built
{ const C = await import('../../src/config.js');
  for (const [k, v] of qs) if (k.startsWith('cfg.')) { const [, blk, key] = k.split('.'), o = C[blk]; if (o && key in o) o[key] = v === 'true' ? true : v === 'false' ? false : +v; } }
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
  let first = null, tB = 0, nB = 0, tlPrev = null; const lastYoy = {}, dietYr = {};
  // the plankton's own line: Daphnia / copepods / rotifers (µg dry/L, both lakes), the surface's algae, the zooplankton's production
  // over the interval (g dry/m² of water a day) — the year-1 bloom diagnosis (stage R item 4)
  const Gw = env.G, chw = env.chem; let wA = 0; for (let c = 0; c < Gw.NC; c++) wA += Gw.area[c];
  let zp0 = chw.zooProd, tz0 = env.time;
  const plankton = () => {
    let d = 0, cz = 0, r = 0, v = 0; for (let j = 0; j < Gw.NCELL; j++) { const q = Gw.vol[j]; d += chw.zooD[j] * q; cz += chw.zooC[j] * q; r += chw.zooR[j] * q; v += q; }
    const U = PLANKTON.UGL / v, days = Math.max(1e-9, (env.time - tz0) / 86400), prod = (chw.zooProd - zp0) * PLANKTON.DRY / wA / days;
    zp0 = chw.zooProd; tz0 = env.time;
    return `D ${(d * U).toFixed(0)} C ${(cz * U).toFixed(0)} R ${(r * U).toFixed(0)} µg/L, production ${prod.toFixed(3)} g DW/m²/day`;
  };
  const report = async tag => {
    const c = await G.census(), tl = await G.readTallies(); first = first || c;
    const kg = KEYS3.reduce((t, k) => t + c[k].kgHa, 0), w = waterOf(env), gl = await G.gridLoad();
    say(`== ${tag} · yf ${env.yearFrac().toFixed(3)} · ${((performance.now() - t0) / 60000).toFixed(1)} min (${nB ? (tB / nB).toFixed(1) : '-'} ms a block, the water included) · ${kg.toFixed(0)} kg/ha · Upper surface ${w[1].tS.toFixed(1)} °C, bottom O₂ ${w[1].oB.toFixed(1)} mg/L · zooplankton ${w[1].zoo.toFixed(0)} / ${w[2].zoo.toFixed(0)} µg/L (Upper / Lower) · agents ${G.n} · young schools ${G.ny} · arrays ${G.cap}/${G.ycap}${G.grew ? ` (grown ${G.grew}×)` : ''} · the fullest grid cell ${gl.max} agents (${gl.big} cells > 256)`);
    say(`   plankton: ${plankton()} · surface algae ${w[1].algae.toFixed(3)} / ${w[2].algae.toFixed(3)} · Secchi ${chw.secchi().toFixed(2)} m`);
    KEYS3.forEach((k, q) => {
      const r = c[k], r0 = first[k], d0 = st0.died[k] || {}, died = {};
      CAUSES.forEach((cs, j) => { died[cs] = (d0[cs] || 0) + tl[T_DIED + q * NCAUSE + j] / 1e6; });
      const sp = (st0.spawns[k] || 0) + tl[T_SPAWNS + q] / 1e6;
      say(`   ${k.padEnd(10)} ${(r.n / Math.max(1, r0.n)).toFixed(3)}× ${String(Math.round(r.n)).padStart(7)} fish ${r.kgHa.toFixed(1).padStart(5)} kg/ha p ${r.p.toFixed(2)}${DIET ? ` K ${r.K.toFixed(2)}` : ''} ${r.L.toFixed(1)} cm · young ${(r.yoyN / 1000).toFixed(0)}k @ ${r.yoyL.toFixed(1)} cm · spawnings ${Math.round(sp)} · starved ${Math.round(died.starve)} eaten ${Math.round(died.eaten)} other ${Math.round(died.other + died.old + died.heat + died.hypoxia)} · recruits ${Math.round((st0.recruits[k] || 0) + tl[T_RECRUITS + q] / 1e6)}`);
      if (DIET && tlPrev) {
        const g = FOODS.map((f, j) => tl[T_FOODK + q * NFOODK + j] - tlPrev[T_FOODK + q * NFOODK + j]), tot = g.reduce((a, b) => a + b, 0) / 1e6;
        if (tot > 0) say(`      diet ${(tot / 1000).toFixed(0)} kg: ` + FOODS.map((f, j) => [f, g[j] / 1e6 / tot]).filter(x => x[1] >= 0.005).map(([f, v]) => `${f} ${(100 * v).toFixed(0)}%`).join(' · '));
        { const y = dietYr[k] || (dietYr[k] = FOODS.map(() => 0)); g.forEach((v, j) => { y[j] += v / 1e6; }); }   // (the year's, by food)
        // the young's losses since the last report, by fate (wgsl.js FRY_*), as a share of the young alive then
        const fd = j => j === 7 ? (tl[910 + q] - tlPrev[910 + q]) / 1e6 : (tl[320 + q * 7 + j] - tlPrev[320 + q * 7 + j]) / 1e6, y0 = (lastYoy[k] || 0) + fd(6);   // (7: capped — T_YCAP, pairs 910 + k)
        if (y0 > 1000) say(`      young's fates (of ${(y0 / 1e3).toFixed(0)}k): ` + [['natural', 0], ['starved', 1], ['heat', 2], ['hypoxia', 3], ['eaten', 4], ['recruited', 5], ['capped', 7]].map(([f, j]) => [f, fd(j) / y0]).filter(x => x[1] >= 0.001).map(([f, v]) => `${f} ${(100 * v).toFixed(1)}%`).join(' · '));
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
  for (const kq of (qs.get('kby') || 'perch,killifish,catfish,dace').split(',')) {   // (?kby=: whose followed fish — every predator of each)
    const q = KEYS3.indexOf(kq); if (q < 0) continue; const by = [];
    KEYS3.forEach((kp, p) => { const v = tl[T_KILLS + p * NK + q] / 1e6; if (v >= 1) by.push([kp, v]); });
    by.sort((a, b) => b[1] - a[1]); if (by.length) say(`${kq} killed by: ` + by.map(([k, n]) => `${k} ${Math.round(n)}`).join(' · '));
  }
  // where the followed fish were eaten (wgsl T_KILLD: pairs 1390 + prey·5 + the bed's depth class; T_KILLC: 1445 + prey·3 + cover class)
  for (const kq of (qs.get('kby') || 'perch,killifish,catfish,dace').split(',')) {
    const q = KEYS3.indexOf(kq); if (q < 0) continue; const d = [0, 1, 2, 3, 4].map(c => tl[1390 + q * 5 + c] / 1e6), cv = [0, 1, 2].map(c => tl[1445 + q * 3 + c] / 1e6), t = d.reduce((a, b) => a + b, 0);
    if (t >= 1) say(`${kq} eaten over the bed's depth: ` + ['< 0.3', '0.3–0.6', '0.6–1', '1–2', '≥ 2 m'].map((c, j) => `${c} ${(100 * d[j] / t).toFixed(0)}%`).join(' · ') + ` — at cover ` + ['< 0.1', '0.1–0.5', '≥ 0.5'].map((c, j) => `${c} ${(100 * cv[j] / t).toFixed(0)}%`).join(' · '));
  }
  // where each kind spends the day (wgsl T_WHERE: pairs 1480 + k·5 + the bed's depth class, every 8th followed fish's n by day)
  { const parts = KEYS3.map((k, q) => { const v = [0, 1, 2, 3, 4].map(c => tl[1480 + q * 5 + c]), t = v.reduce((a, b) => a + b, 0); return t > 0 ? `${k} ` + v.map(x => (100 * x / t).toFixed(0)).join('/') : null; }).filter(Boolean);
    if (parts.length) say('by day over the bed's depth (< 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m, % of fish-blocks): ' + parts.join(' · ')); }
  // the strikes' encounters (wgsl T_STRM/T_STRG/T_STRW: pairs 1024 / 1145 / 1266 + pred·NK + prey): per predator, each prey's fish met
  // within reach, those it could take, and its share of the strike weight — who meets whom, and what decides the kills
  for (const kp of ['pike', 'bass', 'fallfish', 'perch', 'whiteperch']) {
    const p = KEYS3.indexOf(kp); if (p < 0) continue; const rows = []; let W = 0;
    KEYS3.forEach((kq, q) => { const m = tl[1024 + p * NK + q], g = tl[1145 + p * NK + q], w = tl[1266 + p * NK + q] / 1e6; if (m > 0) { rows.push([kq, m, g, w]); W += w; } });
    rows.sort((a, b) => b[3] - a[3]); if (rows.length) say(`${kp}'s strikes met: ` + rows.map(([k, m, g, w]) => `${k} ${m >= 1e6 ? (m / 1e6).toFixed(1) + 'M' : (m / 1e3).toFixed(0) + 'k'} (${(100 * g / m).toFixed(0)}% takeable, ${(100 * w / Math.max(1e-12, W)).toFixed(0)}% of the weight)`).join(' · '));
  }
  // the followed fish eaten by their length (T_KILLSZ: pairs 925 + prey·4 + class) and by the predator (T_KILLPZ: 970 + pred·4 + class)
  for (const [tag, at] of [['followed fish eaten by length (prey)', 925], ['kills by length (predator)', 970]]) {
    const parts = KEYS3.map((k, q) => { const v = [0, 1, 2, 3].map(c => tl[at + q * 4 + c] / 1e6), t = v.reduce((a, b) => a + b, 0); return t >= 1 ? `${k} ${Math.round(t)} (` + ['<10', '10-20', '20-30', '30+'].map((c, j) => [c, v[j] / t]).filter(x => x[1] >= 0.01).map(([c, f]) => `${c} ${(100 * f).toFixed(0)}%`).join(' ') + ')' : null; }).filter(Boolean);
    if (parts.length) say(`${tag}: ` + parts.join(' · '));
  }
  // who ate the young: the followed fish (T_YKILLS: pairs 608 + pred·NK + prey) and the young piscivores' schools (729 + …)
  for (const [tag, at] of [['followed fish', 608], ['young schools', 729]]) {
    const yk = []; KEYS3.forEach((kp, p) => KEYS3.forEach((kq, q) => { const v = tl[at + p * NK + q] / 1e6; if (v >= 1) yk.push([`${kp}>${kq}`, v]); }));
    yk.sort((a, b) => b[1] - a[1]); if (yk.length) say(`young fish eaten by the ${tag}: ` + yk.slice(0, 14).map(([k, n]) => `${k} ${n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'k' : Math.round(n)}`).join(' · '));
  }
  // the predators' young: who ate them, the followed fish and the young schools together
  for (const kq of (qs.get('yby') || 'pike,bass').split(',')) {   // (?yby=: whose young — default the predators')
    const q = KEYS3.indexOf(kq); if (q < 0) continue; const by = [];
    KEYS3.forEach((kp, p) => { const v = (tl[608 + p * NK + q] + tl[729 + p * NK + q]) / 1e6; if (v >= 1) by.push([kp, v, tl[729 + p * NK + q] / 1e6]); });
    by.sort((a, b) => b[1] - a[1]); if (by.length) say(`young ${kq} eaten by: ` + by.map(([k, n, y]) => `${k} ${n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : Math.round(n)}${y >= 1 ? ` (${Math.round(100 * y / n)}% by its young)` : ''}`).join(' · '));
  }
  // the followed fish's diet over the year by mass (the report intervals' summed)
  if (DIET) say("the year's diet (followed fish, by mass): " + KEYS3.filter(k => dietYr[k]).map(k => { const y = dietYr[k], t = y.reduce((a, b) => a + b, 0); return t > 1000 ? `${k} ${(t / 1e6).toFixed(1)} t (` + FOODS.map((f, j) => [f, y[j] / t]).filter(x => x[1] >= 0.01).map(([f, v]) => `${f} ${(100 * v).toFixed(0)}%`).join(' ') + ')' : null; }).filter(Boolean).join(' · '));
  // the young's diet over the year by species (T_YFOODK: pairs 850 + k·5 + kind)
  say("the young's diet over the year: " + KEYS3.map((k, q) => { const g = [0, 1, 2, 3, 4].map(j => tl[850 + q * 5 + j] / 1e6), t = g.reduce((a, b) => a + b, 0); return t > 1000 ? `${k} ${(t / 1e3).toFixed(0)} kg (` + ['young fish', 'zoo', 'weeds', 'bed', 'mud'].map((f, j) => [f, g[j] / t]).filter(x => x[1] >= 0.01).map(([f, v]) => `${f} ${(100 * v).toFixed(0)}%`).join(' ') + ')' : null; }).filter(Boolean).join(' · '));
  // the year's young by species: hatched, then their fates (wgsl.js FRY_*: natural, starve, heat, hypoxia, eaten, recruited)
  const FATES = ['natural', 'starved', 'heat', 'hypoxia', 'eaten', 'recruited', , 'capped'], T_FRY = 320;
  const FK = ['natural', 'starve', 'heat', 'hypoxia', 'eaten', 'recruited', 'hatched', 'capped'];   // (fish3 stats.fry's keys: the founding's season so far counted in)
  say("the year's young (hatched → fates): " + KEYS3.map((k, q) => { const f0 = st0.fry[k] || {}, v = j => (j === 7 ? tl[910 + q] : tl[T_FRY + q * 7 + j]) / 1e6 + (f0[FK[j]] || 0), h = v(6); return h > 0 ? `${k} ${(h / 1e6).toFixed(1)}M → ` + FATES.map((f, j) => [f, v(j) / h]).filter(x => x[1] >= 0.001).map(([f, x]) => `${f} ${(100 * x).toFixed(1)}%`).join(' ') : null; }).filter(Boolean).join(' · '));
  clearInterval(dog); G.destroy();
}
document.title = 'done';
