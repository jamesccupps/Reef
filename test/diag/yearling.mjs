// YEARLING GROWTH: plant N small fish of a species (length L) in the lake at a date and follow them for D days — length,
// mass, condition, the ~1-day mean feeding level p (a.pAvg), the swimming-effort respiration multiplier, trait upkeep —
// against the expected (Michigan bluegill 4.6 → 9.7 cm between ages 1 and 2: ~5 cm over the growing season)
//   node test/diag/yearling.mjs <seed> [species] [L cm] [yf] [days] [n]
const R = process.env.SRC || new URL('../../src/', import.meta.url).href;
const { seed } = await import(R + 'core.js'); const { World } = await import(R + 'world.js'); const C = await import(R + 'config.js');
await (await import('./ovr.mjs')).applySet(R);
const { stdWeight } = await import(R + 'bioenergetics.js');
const { BIOE } = C;
const S = +(process.argv[2] || 1), k = process.argv[3] || 'sunfish', L = +(process.argv[4] || 4), yf = +(process.argv[5] || 0.32), days = +(process.argv[6] || 40), N = +(process.argv[7] || 12);
seed(S); const w = new World().setDate(yf);
const fish = [], ate = {}; const tag = (fn, key) => { const o = w[fn].bind(w); w[fn] = function (a, ...r) { const g0 = a.gut, e0 = a.gutE; const res = o(a, ...r); if (fish.includes(a)) { const q = ate[typeof key === 'function' ? key(r) : key] ??= [0, 0]; q[0] += a.gut - g0; q[1] += a.gutE - e0; } return res; }; };
tag('_eatZoo', 'zoo'); tag('_graze', r => r[0] === w.larvaeGrid ? 'larva' : r[0] === w.insectGrid ? 'insect' : 'detritus'); tag('_ate', 'item'); tag('_meal', r => r[1] < 1000 ? 'poor' : 'meal'); tag('_eatFry', 'fry');
const tb = w.env.takeBenth.bind(w.env); let cur = null;
for (let i = 0; i < N; i++) { const f = w.makeFish(k, null, 0.9 * C.TIME.YEAR_LEN); if (!f) break; f.x = 200 + i * 140; f.y = w.bedY(f.x) - 60; f.L = L; f.W = stdWeight(f.sp.lw, L); f.K = 1; f.mature = false; f.gon = 0; f.age = 0.95 * C.TIME.YEAR_LEN; w.agents.push(f); fish.push(f); }
w.agentGrid.rebuild(w.agents);
const rep = d => { const a = fish.filter(f => !f.dead); const m = q => a.reduce((s, f) => s + q(f), 0) / Math.max(1, a.length);
  const diet = Object.entries(ate).map(([q, v]) => `${q} ${v[0].toFixed(1)}g@${(v[1] / Math.max(1e-9, v[0])).toFixed(0)}`).join(' '); for (const q in ate) delete ate[q];
  console.log(`day ${d.toFixed(0).padStart(3)} ${w.env.monthName()} ${w.env.tempC.toFixed(1)}°C alive ${a.length}/${fish.length}: L ${m(f => f.L).toFixed(2)} W ${m(f => f.W).toFixed(2)} K ${m(f => f.K).toFixed(2)} p ${m(f => f.pAvg || 0).toFixed(2)} swim× ${m(f => Math.exp(BIOE.SWIM * Math.max(0, (f.uAvg ?? f.sp.uRoutine) - f.sp.uRoutine))).toFixed(2)} upkeep× ${m(f => f.metabMul).toFixed(2)} u ${m(f => f.uAvg ?? 0).toFixed(2)} (routine ${fish[0].sp.uRoutine.toFixed(2)}) | ${diet}`); };
rep(0);
const steps = Math.round(BIOE.DAY * 30);
for (let d = 1; d <= days; d++) { for (let s = 0; s < steps; s++) w.step(1 / 30); if (d % 10 === 0) rep(d); }
