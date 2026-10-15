// ZOOPLANKTON FIELD budget (2026-10-15 slice), every half-month: surface °C, edible algae (photic band), the stock (kg Daphnia /
// copepods, lake-mean and epilimnion µg dry/L), net production (growth − maintenance − deaths: what the predators could eat,
// kg) and P/B per day, eaten by fish / fry / nymphs (kg) and fish's share of production, DVM migrant share; fish biomass
// (kg/ha), adult planktivores' p (sunfish, perch, minnow), fry schools (n by species) and their mean p.
//   node zooflux2.mjs <seed> <years> [SET=PLANKTON.K_ADULT=30,...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { PLANKTON: P, GRID, TIME, BIOE } = CFG;
const S = +(process.argv[2] || 1), Y = +(process.argv[3] || 1), dt = 1 / 30, YL = TIME.YEAR_LEN;
seed(S); const w = new World(); const e = w.env; const COLS = GRID.FIELD_COLS, ROWS = GRID.FIELD_ROWS;
const tot = () => e.zooTotal(0) + e.zooTotal(1);
const T = { prod: 0, fish: 0, fry: 0, nym: 0 }; // prod = net change from the zoo update (growth − losses ± eggs)
const zp = e.zooplankton.bind(e); e.zooplankton = function (d) { const a = tot(); zp(d); T.prod += tot() - a; };
const zf = e.zooFeed.bind(e); e.zooFeed = function (...args) { const r = zf(...args), g = r[0] + r[1], cC = args[3], K = args[5];   // (forward EVERY argument)
  if (K === P.K_FRY) T.fry += g; else if (cC === 1) T.nym += g; else T.fish += g; return r; };
const epi = () => { let s = 0, n = 0; const { lo, hi } = e.mask; for (let cy = 0; cy < ROWS * 0.3; cy++) for (let cx = lo[cy]; cx <= hi[cy]; cx++) { const i = cy * COLS + cx; s += e.zooD[i] + e.zooC[i]; n++; } return n ? s / n * P.UGL : 0; };
const algae = () => { let s = 0, n = 0; const { lo, hi } = e.mask; for (let cy = 0; cy < ROWS * 0.3; cy++) for (let cx = lo[cy]; cx <= hi[cy]; cx++) { const i = cy * COLS + cx; s += e.phyto[i] + e.diatom[i]; n++; } return n ? s / n : 0; };
const steps = Math.round(Y * YL / dt), rep = Math.round(YL / 24 / dt);
const MON = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
let bSum = 0, bN = 0, gp0 = 0, aSum = 0, aN = 0;
console.log('date      T°C algae | kgD  kgC  µg/L epi | gross net  P/B/d | fish  fry  fish%gross | mig | fishKg/ha YOYkg | p: sun per mnw | fry: sun bass perch other (k) p | eggs kg | n: sun per mnw bas | Ksun | benth kg');
for (let s = 1; s <= steps; s++) {
  w.step(dt); bSum += tot(); bN++; if (s % 30 === 0) { aSum += algae(); aN++; }   // (algae: the period's mean, sampled each second — a snapshot lands at a drifting time of day)
  if (s % rep) continue;
  const yf = e.yearFrac(), mo = MON[Math.floor(yf * 12) % 12] + (yf * 24 % 2 < 1 ? 'a' : 'b'), days = rep * dt / BIOE.DAY, B = bSum / bN;
  const pOf = k => { const a = w.agents.filter(x => x.species === k && x.L > 6); return a.length ? (a.reduce((t, x) => t + (x.pAvg || 0), 0) / a.length).toFixed(2) : ' -  '; };
  const fr = { sunfish: 0, bass: 0, perch: 0, other: 0 }; let fp = 0, fn = 0;
  for (const f of w.fry) { if (f.dead) continue; const k = fr[f.k] !== undefined ? f.k : 'other'; fr[k] += f.n; fp += (f.p || 0) * f.n; fn += f.n; }
  const k = v => (v / 1000).toFixed(2), kk = v => (v / 1000).toFixed(1);
  const G = e.zooProd - gp0; gp0 = e.zooProd; let yoy = 0; for (const f of w.fry) if (!f.dead) yoy += f.n * f.W;
  console.log(`${String(Math.floor(w.time / YL))} ${mo.padEnd(5)} ${e.tempC.toFixed(1).padStart(5)} ${(aN ? aSum / aN : algae()).toFixed(2)} | ${k(e.zooTotal(0))} ${k(e.zooTotal(1))} ${e.meanZooUgl().toFixed(0).padStart(4)} ${epi().toFixed(0).padStart(4)} | ${k(G).padStart(5)} ${k(T.prod).padStart(5)} ${(G / B / days).toFixed(3)} | ${k(T.fish)} ${k(T.fry)} ${G > 0 ? (100 * (T.fish + T.fry) / G).toFixed(0).padStart(4) : '   -'} | ${e._migD.toFixed(2)} | ${e.fishKgHa.toFixed(0).padStart(4)} ${k(yoy)} | ${pOf('sunfish')} ${pOf('perch')} ${pOf('minnow')} | ${kk(fr.sunfish)} ${kk(fr.bass)} ${kk(fr.perch)} ${kk(fr.other)} ${fn ? (fp / fn).toFixed(2) : '-'} | ${k(e.zooEggTotal(0) + e.zooEggTotal(1))} | ${['sunfish', 'perch', 'minnow', 'bass'].map(q => w.agents.filter(x => !x.dead && x.species === q).length).join(' ')} | ${(() => { const a = w.agents.filter(x => !x.dead && x.species === 'sunfish' && x.L > 6); return a.length ? (a.reduce((t, x) => t + x.K, 0) / a.length).toFixed(2) : '-'; })()} | ${e.totalBenth ? (e.totalBenth() / 1000).toFixed(2) : '-'}`);
  T.prod = 0; T.fish = 0; T.fry = 0; T.nym = 0; bSum = 0; bN = 0; aSum = 0; aN = 0;
}
const c = w.census(); console.log('census', JSON.stringify(c));
