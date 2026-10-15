// What becomes of each species' young-of-year? Hatched (schools made) vs still alive, lost to natural mortality,
// starvation (scramble), heat, hypoxia, fish predation (by predator species), and the rest (nymphs, fry cannibalism,
// recruitment). Also each species' fry mean feeding level p (n-weighted). Every 1/12 year.
//   node fryfate.mjs <seed> <years> [species,...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const S = +(process.argv[2] || 1), Y = +(process.argv[3] || 0.4), want = (process.argv[4] || 'catfish,perch,sunfish').split(',');
seed(S); const w = new World(); w.fryDiag = {};
const hatched = {}, eatenBy = {};
const mk = w._mkFry.bind(w); w._mkFry = function (k, x, y, n, ...r) { hatched[k] = (hatched[k] || 0) + n; return mk(k, x, y, n, ...r); };
const ef = w._eatFry.bind(w);
w._eatFry = function (a, ...r) {
  const before = {}; for (const f of w.fry) if (!f.dead) before[f.k] = (before[f.k] || 0) + f.n;
  const res = ef(a, ...r);
  const after = {}; for (const f of w.fry) if (!f.dead) after[f.k] = (after[f.k] || 0) + f.n;
  for (const k in before) { const d = before[k] - (after[k] || 0); if (d > 0) { const q = eatenBy[k] ??= {}; q[a.species] = (q[a.species] || 0) + d; } }
  return res;
};
const steps = Math.round(Y * CFG.TIME.YEAR_LEN * 30), rep = Math.round(CFG.TIME.YEAR_LEN / 12 * 30);
for (let s = 1; s <= steps; s++) {
  w.step(1 / 30);
  if (s % rep) continue;
  console.log(`--- yf ${w.env.yearFrac().toFixed(2)} T ${w.env.tempC.toFixed(1)}`);
  for (const k of want) {
    let alive = 0, pw = 0, L = 0; for (const f of w.fry) if (!f.dead && f.k === k) { alive += f.n; pw += f.n * (f.p ?? 0); L += f.n * f.L; }
    const d = w.fryDiag[k] || {}, e = eatenBy[k] || {}, eT = Object.values(e).reduce((t, v) => t + v, 0);
    const by = Object.entries(e).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s2, v]) => `${s2.slice(0, 3)} ${v | 0}`).join(' ');
    console.log(`${k.padEnd(8)} hatched ${(hatched[k] || 0) | 0} alive ${alive | 0} (L ${alive ? (L / alive).toFixed(1) : '-'} p ${alive ? (pw / alive).toFixed(2) : '-'}) | natural ${(d.natural || 0) | 0} starve ${(d.starve || 0) | 0} heat ${(d.heat || 0) | 0} hypox ${(d.hypoxia || 0) | 0} | eaten ${eT | 0} [${by}] | recruits ${w.stats.births[k]}`);
  }
}
