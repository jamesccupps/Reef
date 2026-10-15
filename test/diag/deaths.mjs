// DEATH LEDGER: per month, per species — deaths by cause (starve/old/heat/hypoxia/other, eaten by <predator>), recruits (births),
// immigrants, and the count. node deaths.mjs <seed> <months> [SET=...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
seed(+(process.argv[2] || 1)); const w = new World(); const e = w.env;
const months = +(process.argv[3] || 8), rep = Math.round(CFG.TIME.YEAR_LEN / 12 * 30);
const tp = w.takePrey.bind(w); w.takePrey = function (a, ...r) { const p = tp(a, ...r); if (p) p._by = a.species; return p; };
const want = ['sunfish', 'perch', 'minnow', 'bass'];
const L = {}; const add = (sp, k) => { const o = L[sp] ??= {}; o[k] = (o[k] || 0) + 1; };
let b0 = { ...w.stats.births }, i0 = { ...w.stats.immigrants };
for (let m = 1; m <= months; m++) {
  for (let s = 0; s < rep; s++) {
    const alive = w.agents.filter(a => !a.dead);
    w.step(1 / 30);
    for (const a of alive) if (a.dead) add(a.species, a._by ? 'eaten:' + a._by.slice(0, 4) : a.eatenBy ? 'eaten:' + String(a.eatenBy).slice(0, 4) : (a.cause || 'removed'));
  }
  console.log(`--- month ${m} (${e.monthName()}, ${e.tempC.toFixed(1)} °C)`);
  for (const sp of want) {
    const n = w.agents.filter(a => !a.dead && a.species === sp).length, o = L[sp] || {};
    console.log(`${sp.padEnd(8)} n ${String(n).padStart(4)} | births +${w.stats.births[sp] - (b0[sp] || 0)} immigrants +${w.stats.immigrants[sp] - (i0[sp] || 0)} | died: ${Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(', ') || '-'}`);
  }
  for (const k in L) delete L[k]; b0 = { ...w.stats.births }; i0 = { ...w.stats.immigrants };
}
