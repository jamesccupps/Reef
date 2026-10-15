// WHERE IS THE BED FOOD, AND WHERE ARE THE SUNFISH? At a list of dates, per depth band of columns (bed depth in m):
// worms & scuds (benth) g/m², the organic layer (SEDOM) g/m², bottom O₂, insect larvae g/m² (all + above refuge), and the
// adult sunfish / perch counts over each band with their median height above the bed.
//   node autumn.mjs <seed> [SET=...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const C = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { GRID, WORLD, TIME, SEASON, INSECT, bedY } = C;
seed(+(process.argv[2] || 1)); const w = new World(); const e = w.env;
const COLS = GRID.FIELD_COLS, CW = WORLD.W / COLS, cm2 = WORLD.SLICE_M2 / COLS, PX = WORLD.PX_PER_M;
const bands = [[0, 1.5], [1.5, 3], [3, 5], [5, 8], [8, 99]];
const depthOf = x => bedY(x) / PX;   // bed depth in m below the surface (y = 0 is the surface)
// dates as year-fractions after the opening (yf from March 1)
const dates = [0.36, 0.46, 0.54, 0.62, 0.70, 0.80, 0.95, 1.12, 1.25];   // Jul, Aug, Sep, Oct, Nov, Dec, Feb, Apr, Jun (yf from March 1)
const t0 = w.time;
for (const yf of dates) {
  const target = (yf - SEASON.START_YF) * TIME.YEAR_LEN;
  while (w.time - t0 < target) w.step(1 / 30);
  console.log(`--- ${e.monthName()} (yf ${e.yearFrac().toFixed(2)}), ${e.tempC.toFixed(1)} °C, zoo ${e.meanZooUgl().toFixed(0)} µg/L`);
  console.log('band m    cols | benth g/m² | SEDOM g/m² | bedO2 | larvae g/m² (exposed) | sunfish n (med h px) | perch n');
  for (const [d0, d1] of bands) {
    let n = 0, b = 0, s = 0, o = 0;
    for (let c = 0; c < COLS; c++) { const d = depthOf((c + 0.5) * CW); if (d < d0 || d >= d1) continue; n++; b += e.benth[c]; s += e.sedOM[c]; o += e.o2[e.mask.bedRow[c] * COLS + c]; }
    if (!n) continue;
    let lm = 0, lx = 0; for (const L of w.larvae) if (!L.dead) { const d = depthOf(L.x); if (d >= d0 && d < d1) { lm += L.m; lx += Math.max(0, L.m - INSECT.REFUGE_M); } }
    const sun = w.agents.filter(a => !a.dead && a.species === 'sunfish' && a.L > 6 && depthOf(a.x) >= d0 && depthOf(a.x) < d1);
    const per = w.agents.filter(a => !a.dead && a.species === 'perch' && a.L > 8 && depthOf(a.x) >= d0 && depthOf(a.x) < d1);
    const h = sun.map(a => bedY(a.x) - a.y).sort((p, q) => p - q);
    const A = n * cm2;
    console.log(`${String(d0).padStart(4)}-${String(d1).padEnd(3)} ${String(n).padStart(4)} | ${(b / A).toFixed(2).padStart(6)} | ${(s / A).toFixed(0).padStart(6)} | ${(o / n).toFixed(2)} | ${(lm / A).toFixed(2).padStart(5)} (${(lx / A).toFixed(2)}) | ${String(sun.length).padStart(3)} (${h.length ? h[h.length >> 1].toFixed(0) : '-'}) | ${per.length}`);
  }
  const sun = w.agents.filter(a => !a.dead && a.species === 'sunfish' && a.L > 6);
  const K = sun.reduce((s, a) => s + a.K, 0) / Math.max(1, sun.length);
  console.log(`sunfish n ${sun.length}, mean W ${(sun.reduce((s, a) => s + a.W, 0) / Math.max(1, sun.length)).toFixed(1)} g, K ${K.toFixed(2)}`);
}
