// PER-SPECIES CENSUS (2026-10-15, the Maine species set), every half-month: surface °C, total fish biomass (kg/ha), and per
// species the followed fish (n), their biomass (kg), the young-of-year in schools (thousands) — then each year's spawnings,
// recruits (births) and immigrants per species. For judging whether all eight species hold on and how the biomass splits.
//   node census.mjs <seed> <years> [SET=...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const { SPECIES } = await import(R + 'species.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { TIME, WORLD } = CFG;
const S = +(process.argv[2] || 1), Y = +(process.argv[3] || 1), dt = 1 / 30, YL = TIME.YEAR_LEN;
seed(S); const w = new World(); const e = w.env;
const steps = Math.round(Y * YL / dt), rep = Math.round(YL / 24 / dt);
const MON = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const AB = { minnow: 'shin', sunfish: 'pump', perch: 'yper', sucker: 'suck', catfish: 'bull', whiteperch: 'wper', bass: 'smb', pike: 'pick' };
const ha = WORLD.SLICE_M2 / 1e4;
console.log(`date       T°C  kg/ha | ` + SPECIES.map(k => `${AB[k] || k} n/kg/YOYk`).join(' | '));
const snap = () => { const o = {}; for (const k of SPECIES) o[k] = { n: 0, kg: 0, yoy: 0 }; for (const a of w.agents) { o[a.species].n++; o[a.species].kg += a.W / 1000; } for (const f of w.fry) if (!f.dead) o[f.k].yoy += f.n; return o; };
const y0 = { spawns: {}, births: {}, imm: {} }; const take = () => ({ spawns: { ...(w.stats.spawns || {}) }, births: { ...w.stats.births }, imm: { ...w.stats.immigrants } });
let last = take(), yr = 0;
for (let s = 1; s <= steps; s++) {
  w.step(dt);
  if (s % rep) continue;
  const yf = e.yearFrac(), mo = MON[Math.floor(yf * 12) % 12] + (yf * 24 % 2 < 1 ? 'a' : 'b'), o = snap();
  const tot = SPECIES.reduce((t, k) => t + o[k].kg, 0);
  console.log(`${String(Math.floor(w.time / YL))} ${mo.padEnd(5)} ${e.tempC.toFixed(1).padStart(5)} ${(tot / ha).toFixed(0).padStart(5)} | ` +
    SPECIES.map(k => `${String(o[k].n).padStart(4)} ${o[k].kg.toFixed(2).padStart(5)} ${(o[k].yoy / 1000).toFixed(1).padStart(5)}`).join(' | '));
  if (Math.floor(w.time / YL) !== yr) {   // a year boundary: the year's reproduction per species
    yr = Math.floor(w.time / YL); const now = take(), d = (a, b, k) => (a[k] || 0) - (b[k] || 0);
    console.log(`   year ${yr - 1}: spawns ` + SPECIES.map(k => `${AB[k]} ${d(now.spawns, last.spawns, k)}`).join(' ') +
      ` | recruits ` + SPECIES.map(k => `${AB[k]} ${d(now.births, last.births, k)}`).join(' ') + ` | immigrants ` + SPECIES.map(k => `${AB[k]} ${d(now.imm, last.imm, k)}`).join(' '));
    last = now;
  }
}
console.log('census', JSON.stringify(w.census()));
