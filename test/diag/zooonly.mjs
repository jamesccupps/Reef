// ZOOPLANKTON-ONLY HARNESS: the real environment (algae, nutrients, O₂, ice, the zooplankton fields + egg bank) stepped WITHOUT
// the fish model; fish predation is PRESCRIBED from the research: adults take PA of the exposed stock a day all year (× a
// warm-water factor), a young-of-year pulse takes PY a day from mid-June to August. Reports half-monthly stock (µg/L, by
// kind), algae, eggs. Runs a year in a few minutes — for calibrating the zooplankton's own seasonal cycle.
//   node zooonly.mjs <years> [PA=0.02] [PY=0.05] [SET=PLANKTON.G_D=0.5,...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { PLANKTON: P, GRID, TIME, BIOE } = CFG;
const Y = +(process.argv[2] || 1), PA = +(process.argv[3] ?? 0.02), PY = +(process.argv[4] ?? 0.05), dt = 1 / 30, YL = TIME.YEAR_LEN;
seed(1); const w = new World(); const e = w.env; w.agents = []; w.fry = [];
const COLS = GRID.FIELD_COLS, ROWS = GRID.FIELD_ROWS, { lo, hi } = e.mask;
e.fishKgHa = 200;   // a fish community of ~200 kg/ha (the DVM kairomone level)
const MON = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const steps = Math.round(Y * YL / dt), rep = Math.round(YL / 24 / dt);
console.log('date    T°C  algae | µg/L  D   C  R | eggs kg | eaten kg (half-month)');
let eaten = 0;
for (let s = 1; s <= steps; s++) {
  w.time += dt; e.step(dt, w);
  // prescribed predation on the EXPOSED zooplankton (copepods escape COPE_ESCAPE), daily rates scaled by warmth (Q10 2 about 20 °C)
  const yf = e.yearFrac(), T = e.tempC, warm = Math.pow(2, (T - 20) / 10), yoy = yf > 0.29 && yf < 0.5 ? PY : 0;
  const r = (PA + yoy) * warm * dt / BIOE.DAY;
  for (let cy = 0; cy < ROWS; cy++) for (let cx = lo[cy]; cx <= hi[cy]; cx++) {
    const i = cy * COLS + cx, v = e.zooVis((cy + 0.5) * (CFG.WORLD.H / ROWS));
    const tD = e.zooD[i] * e.zooExposed(i, 0) * v * r, tC = e.zooC[i] * e.zooExposed(i, 1) * v * r * (1 - P.COPE_ESCAPE);
    e.zooD[i] -= tD; e.zooC[i] -= tC; eaten += tD + tC;
  }
  if (s % rep) continue;
  let A = 0, n = 0; for (let cy = 0; cy < ROWS * 0.3; cy++) for (let cx = lo[cy]; cx <= hi[cy]; cx++) { A += e.phyto[cy * COLS + cx] + e.diatom[cy * COLS + cx]; n++; }
  const mo = MON[Math.floor(yf * 12) % 12] + (yf * 24 % 2 < 1 ? 'a' : 'b'), u = v => (v / e.mask.n * P.UGL).toFixed(0).padStart(4);
  console.log(`${Math.floor(w.time / YL)} ${mo.padEnd(5)} ${T.toFixed(1).padStart(5)} ${(A / n).toFixed(2)} | ${e.meanZooUgl().toFixed(0).padStart(4)} ${u(e.zooTotal(0))} ${u(e.zooTotal(1))} ${u(e.zooTotal(2))} | ${((e.zooEggTotal(0) + e.zooEggTotal(1)) / 1000).toFixed(2)} | ${(eaten / 1000).toFixed(2)}`);
  eaten = 0;
}
