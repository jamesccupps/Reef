// WHERE EACH SPECIES LIVES, by month and by day vs night (2026-10-15 — for checking the fish against angler and field
// knowledge: perch holes under the ice, bass on the drop-offs, pickerel in the weeds…). For each species (adults, L > Lmat·0.8)
// every half-month, sampled each sim second and split by daylight (light ≥ 0.3) vs night: mean depth (m), height above the
// bed (m), share over the littoral (bed ≤ 3.5 m), share in the stream and in the pond, mean water temperature (°C) and O₂
// (mg/L) where the fish are. Under ice the lake's "deep holes" are the warmest water (~4 °C at the bed).
//   node habitat.mjs <seed> <years> [species,...]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js');
const { World } = await import(R + 'world.js');
const { SPECIES, SP } = await import(R + 'species.js');
const CFG = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { TIME, WORLD, bedY, basinAt, isLittoralX } = CFG;
const S = +(process.argv[2] || 1), Y = +(process.argv[3] || 1), only = process.argv[4] ? process.argv[4].split(',') : SPECIES, dt = 1 / 30, YL = TIME.YEAR_LEN;
seed(S); const w = new World(); const e = w.env, P = WORLD.PX_PER_M;
const steps = Math.round(Y * YL / dt), rep = Math.round(YL / 24 / dt);
const MON = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const blank = () => ({ n: 0, d: 0, h: 0, lit: 0, str: 0, pond: 0, T: 0, o2: 0 });
let acc = {}; const reset = () => { acc = {}; for (const k of only) acc[k] = { day: blank(), night: blank() }; }; reset();
const f1 = v => v.toFixed(1), pc = v => (100 * v).toFixed(0).padStart(3);
console.log('date        T°C ice | species      day: depth m  above-bed m  lit% str% pond%  T°C  O₂   | night: depth  above  lit% str% pond%  T°C  O₂   | n');
for (let s = 1; s <= steps; s++) {
  w.step(dt);
  if (s % 30 === 0) {
    const dn = e.light >= 0.3 ? 'day' : 'night';
    for (const a of w.agents) {
      if (a.dead || !acc[a.species] || a.L < (a.Lmat || SP[a.species].Lmat) * 0.8) continue;
      const q = acc[a.species][dn], bed = bedY(a.x), kind = basinAt(a.x).kind;
      q.n++; q.d += a.y / P; q.h += (bed - a.y) / P; q.lit += isLittoralX(a.x) ? 1 : 0; q.str += kind === 'stream' ? 1 : 0; q.pond += kind === 'pond' ? 1 : 0;
      q.T += e.tempAt(a.x, a.y); q.o2 += w.oxygenAt(a.x, a.y) * 9.5;   // (normalised O₂ × ~9.5 mg/L)
    }
  }
  if (s % rep) continue;
  const yf = e.yearFrac(), mo = MON[Math.floor(yf * 12) % 12] + (yf * 24 % 2 < 1 ? 'a' : 'b');
  const row = q => q.n ? `${f1(q.d / q.n).padStart(5)} ${f1(q.h / q.n).padStart(6)}      ${pc(q.lit / q.n)} ${pc(q.str / q.n)} ${pc(q.pond / q.n)}  ${f1(q.T / q.n).padStart(4)} ${f1(q.o2 / q.n).padStart(4)}` : '    -      -        -    -    -     -    -';
  for (const k of only) console.log(`${String(Math.floor(w.time / YL))} ${mo.padEnd(5)} ${f1(e.tempC).padStart(5)} ${(e.ice || 0).toFixed(1)} | ${SP[k].name.padEnd(15)} ${row(acc[k].day)} | ${row(acc[k].night)} | ${acc[k].day.n + acc[k].night.n}`);
  reset();
}
