// test/balance.mjs — long-run balance analysis (not a pass/fail gate). Prints the trophic web,
// O₂, nutrients, phytoplankton and seasons over several simulated years so we can tune.
// Run: node test/balance.mjs
import { seed, PLANT_GENE_KEYS, GENE_KEYS } from '../src/core.js';
import { World } from '../src/world.js';
import { SPECIES } from '../src/species.js';
import { SEASON, PHYTO } from '../src/config.js';

seed(2024);
const w = new World();
// mean macrophyte trait genes + colour over the live population — drift from the start = plant evolution
const plantGeneMeans = ww => { const live = ww.plants.filter(p => !p.dead), n = live.length || 1; return { g: PLANT_GENE_KEYS.map((_, i) => live.reduce((s, p) => s + p.gn[i], 0) / n), hue: live.reduce((s, p) => s + p.hue, 0) / n, n: live.length }; };
const pg0 = plantGeneMeans(w);
// mean fish trait genes (size/speed/tol/fin/eye/body) across the standing population — drift from the start = morphology evolution
const fishGeneMeans = ww => { const a = ww.agents, n = a.length || 1; return GENE_KEYS.map((_, i) => a.reduce((s, x) => s + x.genes[i], 0) / n); };
const fg0 = fishGeneMeans(w);
const dt = 1 / 30;
const YEARS = +(process.argv[2] || 3);
const totalSteps = Math.round((YEARS * SEASON.YEAR_LEN) / dt);
const sampleEvery = Math.round(totalSteps / 36);

const meanPhyto = () => w.env.meanPhyto();
const meanCyano = () => w.env.meanCyano();  // cyanobacteria surface-scum density (the N-fixing strain)
const meanDOM = () => w.env.meanDOM();      // dissolved organic matter (the microbial-loop substrate)
const meanNut = () => w.env.meanPhos();   // phosphate = the limiting nutrient (the bloom controller)
const meanN = () => w.env.meanDin();      // total dissolved inorganic N (nh4 + no3) — should stay abundant (P-limited lake)
const minO2 = () => { const f = w.env.o2; let m = 2; for (let i = 0; i < f.length; i++) if (f[i] < m) m = f[i]; return m; };

console.log('yr   season  | phyto  cyno  dom   zoo   P     N   NO3% O2avg O2min |  mnw sun cat car bas pik  tot | plants det deaths');
let deaths0 = 0;
const track = { minTot: Infinity, maxTot: 0, minSpecies: {}, maxSpecies: {}, sum: {}, sumSq: {}, n: 0 };
for (const k of SPECIES) { track.minSpecies[k] = Infinity; track.maxSpecies[k] = 0; track.sum[k] = 0; track.sumSq[k] = 0; }

for (let i = 0; i <= totalSteps; i++) {
  w.step(dt);
  const c = w.census(); let tot = 0; for (const k of SPECIES) { tot += c[k]; track.minSpecies[k] = Math.min(track.minSpecies[k], c[k]); track.maxSpecies[k] = Math.max(track.maxSpecies[k], c[k]); track.sum[k] += c[k]; track.sumSq[k] += c[k] * c[k]; }
  track.n++;
  track.minTot = Math.min(track.minTot, tot); track.maxTot = Math.max(track.maxTot, tot);
  if (i % sampleEvery === 0) {
    const c2 = w.census();
    const row = SPECIES.map(k => String(c2[k]).padStart(3)).join(' ');
    let tot2 = 0; for (const k of SPECIES) tot2 += c2[k];
    const deaths = w.stats.fishEaten;
    console.log(
      `${w.env.year.toFixed(2).padStart(4)} ${w.env.seasonName().padEnd(7)} | ` +
      `${meanPhyto().toFixed(3)} ${meanCyano().toFixed(3)} ${meanDOM().toFixed(3)} ${String(w.plankton.length).padStart(4)} ${meanNut().toFixed(2)} ${meanN().toFixed(2)} ${String((w.env.nitrateFrac() * 100) | 0).padStart(3)}% ${w.avgO2().toFixed(2)}  ${minO2().toFixed(2)}  | ` +
      `${row}  ${String(tot2).padStart(3)} | ${String(w.plants.length).padStart(4)} ${String(w.detritus.length).padStart(4)} ${deaths - deaths0}`
    );
    deaths0 = deaths;
  }
}
// per-species generations in the standing population (are they EVOLVING or just re-seed wallpaper?)
const genBy = {}; for (const k of SPECIES) genBy[k] = 0;
let gen0 = {}; for (const k of SPECIES) gen0[k] = 0;
for (const a of w.agents) { genBy[a.species] = Math.max(genBy[a.species], a.gen); if (a.gen === 0) gen0[a.species]++; }
const c = w.census();

console.log('\nover the whole run:');
console.log('  total agents range:', track.minTot, '→', track.maxTot, '(global maxGen', w.maxGen + ')');
console.log('  per-species minimum:', SPECIES.map(k => `${k} ${track.minSpecies[k]}`).join(', '));
// per-species coefficient of variation (SD/mean over the whole run) — measures how STEADY vs boom-bust each is
console.log('  per-species mean·CV (steadiness):', SPECIES.map(k => { const m = track.sum[k] / track.n, v = Math.max(0, track.sumSq[k] / track.n - m * m); return `${k} ${m.toFixed(0)}·CV${(m > 0 ? Math.sqrt(v) / m : 0).toFixed(2)}[${track.minSpecies[k]}-${track.maxSpecies[k]}]`; }).join(', '));
console.log('  standing maxGen/species:', SPECIES.map(k => `${k} ${genBy[k]}`).join(', '));
console.log('  % gen-0 (immigrants+reseeds):', SPECIES.map(k => `${k} ${c[k] ? Math.round(100 * gen0[k] / c[k]) : 0}%`).join(', '));
// Phase-5 dependence: home-bred births vs rescue immigrants over the run (lower immigrant share = more self-sustaining)
const imm = w.stats.immigrants || {}, bir = w.stats.births || {};
console.log('  home-bred / immigrants:', SPECIES.map(k => { const b = bir[k] || 0, m = imm[k] || 0; return `${k} ${b}/${m}(${Math.round(100 * m / Math.max(1, b + m))}%imm)`; }).join(', '));
// plant evolution: how far the mean trait genes drifted from the founding ~1.0 (which trait selection pushed, and how)
const pg1 = plantGeneMeans(w);
console.log('  plant genes (mean, Δ from start):', pg1.g.map((v, i) => `${PLANT_GENE_KEYS[i]} ${v.toFixed(3)}(${v - pg0.g[i] >= 0 ? '+' : ''}${(v - pg0.g[i]).toFixed(3)})`).join(', '));
console.log(`  plant mean colour: ${pg1.hue.toFixed(0)}° (start ${pg0.hue.toFixed(0)}°), live ${pg1.n}`);
const plantEvolving = pg1.g.some((v, i) => Math.abs(v - pg0.g[i]) > 0.01);
console.log(plantEvolving ? '  ✓ plant trait genes drifted under selection (evolving)' : '  · plant genes ~unchanged (neutral / too short)');
const fg1 = fishGeneMeans(w);
console.log('  fish genes (mean, Δ from start):', fg1.map((v, i) => `${GENE_KEYS[i]} ${v.toFixed(3)}(${v - fg0[i] >= 0 ? '+' : ''}${(v - fg0[i]).toFixed(3)})`).join(', '));
const ok = SPECIES.every(k => track.minSpecies[k] > 0);
const evolving = SPECIES.every(k => genBy[k] > 0);
console.log(ok ? '  ✓ no species went extinct' : '  ✗ a species hit zero at some point');
console.log(evolving ? '  ✓ every species is evolving (standing maxGen > 0)' : '  ✗ a species is purely re-seed wallpaper (maxGen 0)');
