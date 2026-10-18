// w3_season.mjs — the 3-D lakes through a stretch of the season, headless, in shards (docs/TRUE_SCALE.md T5, T7):
//   HB_WORLD=true node tools/w3_season.mjs [yf0=0.22] [days=7] [seed=611] [every=1]
// Coarse 29-min blocks from date yf0 (the season's young so far included), the water stepped after each, the fish in 2 shard
// workers (src/w3/shardpool3.js on Node worker_threads). Every `every` days a line per species — fish against the start, kg/ha,
// ration, mean cm, the young (fish, cm), spawnings, deaths starved / eaten — and at the end who ate whom (kills of followed fish).
const R = new URL('../src/', import.meta.url).href;
const { Env3 } = await import(R + 'w3/env3.js'); const { KEYS3 } = await import(R + 'w3/fish3.js');
const { ShardPool } = await import(R + 'w3/shardpool3.js'); const { statsMerge } = await import(R + 'w3/render3/fishside3.js');
const { seed, getRandState } = await import(R + 'core.js'); const { nodeShardSpawner } = await import('./w3_shard_host.mjs');
const yf0 = +(process.argv[2] || 0.22), days = +(process.argv[3] || 7), sd = +(process.argv[4] || 611), every = +(process.argv[5] || 1), B = 1752;
seed(sd); const st0 = getRandState(); const e = new Env3({ yf0 });
const P = await ShardPool.start(e, 2, st0, nodeShardSpawner(process.env.HB_WORLD === 'true' ? '?world=true' : ''));
const t0 = performance.now(); let first = null;
const report = async tag => {
  const reps = await P.step(B, { stats: true }); e.step(B); P.envStepped();
  const m = statsMerge(reps.map(r => r.stats), e, P.lakeHa); first = first || m;
  const kg = KEYS3.reduce((t, k) => t + m.sp[k].kgHa, 0);
  console.log(`== ${tag} · yf ${m.yf.toFixed(3)} · ${((performance.now() - t0) / 60000).toFixed(1)} min · ${kg.toFixed(0)} kg/ha · Upper surface ${m.water[1].tS.toFixed(1)} °C, bottom O₂ ${m.water[1].oB.toFixed(1)} mg/L · agents ${m.agents} · young schools ${m.yoySchools}`);
  for (const k of KEYS3) { const r = m.sp[k], r0 = first.sp[k], d = r.died || {};
    console.log(`   ${k.padEnd(10)} ${(r.n / Math.max(1, r0.n)).toFixed(3)}× ${String(Math.round(r.n)).padStart(7)} fish ${r.kgHa.toFixed(1).padStart(5)} kg/ha p ${r.p.toFixed(2)} ${r.L.toFixed(1)} cm · young ${(r.yoyN / 1000).toFixed(0)}k @ ${r.yoyL.toFixed(1)} cm · spawnings ${r.spawns} · starved ${Math.round(d.starve || 0)} eaten ${Math.round(d.eaten || 0)} other ${Math.round((d.other || 0) + (d.old || 0) + (d.heat || 0) + (d.hypoxia || 0))}`); }
  return m;
};
await report('start');
const perDay = Math.round(86400 / B); let m;
for (let day = 1; day <= days; day++) {
  for (let b = 0; b < perDay - (day % every === 0 || day === days ? 1 : 0); b++) { await P.step(B); e.step(B); P.envStepped(); }
  if (day % every === 0 || day === days) m = await report(`day ${day}`);
}
console.log('who ate whom (kills):', m.eaten.map(([k, n]) => `${k} ${n}`).join(' · '));
P.stop();
