// SPAWNERS ROSTER: run to a date, then list a species' fish (length, sex, mature, gonads as a share of ripe, condition, age)
// and, over the following days, count spawns and why the rest did not (not mature / gonads unripe / condition / no mate).
//   node test/diag/roster.mjs <seed> <yf from the opening, years> [species] [days]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const C = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { TIME, BIOE, SPAWN } = C;
const S = +(process.argv[2] || 2), Y = +(process.argv[3] || 2.1), k = process.argv[4] || 'sunfish', days = +(process.argv[5] || 30);
seed(S); const w = new World(); const t0 = w.time;
while (w.time - t0 < Y * TIME.YEAR_LEN) w.step(1 / 30);
const row = a => { const ripe = a.gon / ((a.sex === 0 ? a.sp.gsiF : a.sp.gsiM) * a.W); return `${a.sex === 0 ? 'F' : 'M'} L ${a.L.toFixed(1)} age ${(a.age / TIME.YEAR_LEN).toFixed(1)} mature ${a.mature ? 'y' : 'n'} ripe ${ripe.toFixed(2)} K ${a.K.toFixed(2)} mateCd ${(a.mateCd || 0).toFixed(0)}`; };
console.log(`${w.env.monthName()} ${w.env.tempC.toFixed(1)} °C — ${k}:`);
for (const a of w.agents.filter(a => !a.dead && a.species === k).sort((p, q) => q.L - p.L)) console.log('  ' + row(a));
const sp0 = (w.stats.spawns || {})[k] || 0;
for (let i = 0; i < Math.round(days * BIOE.DAY * 30); i++) w.step(1 / 30);
console.log(`after ${days} days (${w.env.monthName()}): spawns +${((w.stats.spawns || {})[k] || 0) - sp0}; SPAWN.K_READY ${SPAWN.K_READY}, GON_READY ${SPAWN.GON_READY}`);
for (const a of w.agents.filter(a => !a.dead && a.species === k).sort((p, q) => q.L - p.L)) console.log('  ' + row(a));
