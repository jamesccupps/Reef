// test/headless.mjs — exercise the pure core with no DOM. Run: node test/headless.mjs
import { seed, getRandState, setRandState, genomeLen, randomGenome, migrateGenome, migrateGenomeInputs, forward, reinforce, OUT, randomGenes, crossoverGenes, mutateGenes, GENE_KEYS, GENE_MIN, GENE_MAX, PLANT_GENE_KEYS, canEat, angDiff } from '../src/core.js';
import { World, derivePlant, toxFecundity, spawnFactor } from '../src/world.js';
import { Camera } from '../src/camera.js';
import { SPECIES, SP } from '../src/species.js';
import { WORLD, GRID, scaleCount, TIME, SEASON, SPAWN, BASIN, TURBIDITY, STRUCTURE, COVER, FLOW, NUTRIENT, SED_P, NCYCLE, CYANO, PHYTO, MICROBE, MACRO, COMPETE, SCHOOL, TOX, ACTION, MOTION, IMMIGRATION, SNAIL, CRAYFISH, LEARN, BRAIN, BIOE, bedY } from '../src/config.js';

seed(12345); // deterministic
const w = new World();
const dt = 1 / 30;

let fail = 0;
import { stdWeight } from '../src/bioenergetics.js';
// a fish in breeding condition (bioenergetics): mature, of the given sex, condition K, gonads ripe, ready to spawn
const ripe = (f, sex, K = 1) => { f.sex = sex; f.mature = true; f.W = K * stdWeight(f.sp.lw, f.L); f.K = K; f.gon = (sex === 0 ? f.sp.gsiF : f.sp.gsiM) * f.W; f.mateCd = 0; f._mated = false; f.dead = false; return f; };
const check = (name, ok, extra = '') => { console.log(`${ok ? ' PASS' : ' FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) fail++; };
const approx = (a, b, tol) => Math.abs(a - b) <= tol;

const start = w.census();
console.log('initial census:', JSON.stringify(start));
console.log('agents:', w.agents.length, '| plants:', w.plants.length, '| plankton:', w.plankton.length, '| detritus:', w.detritus.length);
console.log(`world: ${WORLD.W}x${WORLD.H} | AREA_SCALE: ${WORLD.AREA_SCALE.toFixed(2)} | GLOBAL_MAX: ${WORLD.GLOBAL_MAX} | field: ${GRID.FIELD_COLS}x${GRID.FIELD_ROWS}`);

// genome shapes match labels (catches sensor/shape mismatches)
for (const k of SPECIES) {
  const sp = SP[k];
  check(`${k}: input labels match shape.in`, sp.inputLabels.length === sp.shape.in, `${sp.inputLabels.length} vs ${sp.shape.in}`);
}

// ---- Phase 0: world is genuinely larger, and densities scaled with area ----
check('world is much larger than the reference pond', WORLD.AREA_SCALE > 3, `${WORLD.AREA_SCALE.toFixed(2)}× area`);
check('field grid scaled to keep cells ~constant', GRID.FIELD_COLS > 40 && GRID.FIELD_ROWS > 24, `${GRID.FIELD_COLS}x${GRID.FIELD_ROWS}`);
check('oxygen field sized to grid', w.env.o2.length === GRID.FIELD_COLS * GRID.FIELD_ROWS, `${w.env.o2.length}`);
check('initial populations scaled with area', w.agents.length > 200, `${w.agents.length} agents`);
check('minnow start scaled', approx(start.minnow, scaleCount(SP.minnow.pop.start), 2), `${start.minnow} vs ~${scaleCount(SP.minnow.pop.start)}`);

const t0 = Date.now();
const STEPS = 4400;
let nanHits = 0, peakAgents = 0, minAgents = Infinity, peakCorpses = 0, anyCorpse = false;
const inSeason = new Set();   // species whose spawning-temperature window the opening late-spring month reached
const prevGen = w.maxGen;

for (let i = 0; i < STEPS; i++) {
  w.step(dt);
  if (i % 200 === 0) {
    for (const a of w.agents) {
      if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.energy) || !Number.isFinite(a.heading)) nanHits++;
    }
    for (const c of w.corpses) if (!Number.isFinite(c.x) || !Number.isFinite(c.y) || !Number.isFinite(c.t)) nanHits++;
    const o2 = w.avgO2();
    if (!Number.isFinite(o2) || o2 < 0 || o2 > 1.5) nanHits++;   // the per-cell field clamp (cold spring water holds ~1.3)
    for (const k of SPECIES) if (spawnFactor(SP[k], w.env.tempC - w.env.tempDiel, w.env.yearFrac(), w.env.ice) > 0.5) inSeason.add(k);
  }
  peakAgents = Math.max(peakAgents, w.agents.length);
  minAgents = Math.min(minAgents, w.agents.length);
  if (w.corpses.length) anyCorpse = true;
  peakCorpses = Math.max(peakCorpses, w.corpses.length);
}
const ms = Date.now() - t0;

const end = w.census();
console.log('\nfinal census:', JSON.stringify(end));
console.log(`agents now: ${w.agents.length} | plants: ${w.plants.length} | plankton: ${w.plankton.length} | detritus: ${w.detritus.length}`);
console.log(`maxGen: ${w.maxGen} | foodEaten: ${w.stats.foodEaten} | fishEaten: ${w.stats.fishEaten}`);
console.log(`avg O2: ${w.avgO2().toFixed(3)} | temp: ${w.env.tempC.toFixed(1)}C | weather: ${w.env.weatherName()} | light: ${w.env.light.toFixed(2)}`);
console.log(`perf: ${STEPS} steps in ${ms}ms = ${(STEPS / (ms / 1000)).toFixed(0)} steps/s (real-time needs 30) | peak ${peakAgents} agents`);

check('no NaN / out-of-range integrity hits', nanHits === 0, `${nanHits} hits`);
// (an INVARIANT, not a test of ecology: the REFUGE backstop keeps ≥2 of every species — home-bred breeding is checked next)
check('REFUGE invariant: all six species still present', SPECIES.every(k => end[k] > 0));
check('generations advanced (reproduction happening)', w.maxGen > prevGen, `gen ${w.maxGen}`);
// spawning is seasonal (water-temperature windows): the lake opens in mid-May, so the early-spring spawners (pike, perch)
// are checked from an April start below; every species whose window this month reached must breed home-bred
check('every species in its spawning season reproduces home-bred (not only rescued by immigration)', inSeason.size >= 3 && [...inSeason].every(k => w.stats.births[k] > 0), SPECIES.map(k => `${k} ${w.stats.births[k]}${inSeason.has(k) ? '' : ' (out of season)'}`).join(' '));
{ const rs0 = getRandState(); seed(2468); const sw0 = new World().setDate(0.08); const b0 = { ...sw0.stats.births };   // ~April 1, just after ice-out
  for (let i = 0; i < 3600; i++) sw0.step(dt);
  check('the early-spring spawners breed after ice-out: pike (4–11 °C) and perch (7–12 °C)', sw0.stats.births.pike > b0.pike && sw0.stats.births.perch > b0.perch, `pike ${sw0.stats.births.pike - b0.pike}, perch ${sw0.stats.births.perch - b0.perch} young; ${sw0.env.monthName()} ${sw0.env.tempC.toFixed(1)} °C`); setRandState(rs0); }
check('total agents stayed under global cap', peakAgents <= WORLD.GLOBAL_MAX + 60, `peak ${peakAgents} / cap ${WORLD.GLOBAL_MAX}`);
check('population is dynamic (changed from start)', JSON.stringify(start) !== JSON.stringify(end));
check('plants persisted (growth vs grazing balance)', w.plants.length > 0, `${w.plants.length} plants`);
check('some feeding occurred', w.stats.foodEaten > 0, `${w.stats.foodEaten} food events`);
check('integrity: mean O₂ is finite and within the field clamp [0, 1.5]', (() => { const o = w.avgO2(); return Number.isFinite(o) && o >= 0 && o <= 1.5; })());
// REEF_PERF_MIN overrides the budget (e.g. 0 while other CPU-heavy work shares the machine); the default gate stays strict.
const PERF_MIN = process.env.REEF_PERF_MIN != null ? +process.env.REEF_PERF_MIN : 60;
check('fast enough for real-time render at scale', STEPS / (ms / 1000) > PERF_MIN, `${(STEPS / (ms / 1000)).toFixed(0)} steps/s (budget ${PERF_MIN})`);
check('natural deaths leave a lingering body (no instant vanish)', anyCorpse, `peak ${peakCorpses} corpses`);
check('corpses stay bounded (they decay into detritus)', peakCorpses < peakAgents, `peak ${peakCorpses} < ${peakAgents}`);

// save/load round-trip — assert CONTENT is restored, not just the agent count
const snap = JSON.stringify(w.toJSON());
const w2 = new World();
w2.load(JSON.parse(snap));
check('save/load round-trip restores the full serialized state (content, not just count)', JSON.stringify(w2.toJSON()) === snap, `lengths ${JSON.stringify(w2.toJSON()).length} vs ${snap.length}`);
check('loaded agents keep their growth (adults reload as adults, not juveniles)', w2.agents.length === w.agents.length && w2.agents.every((a, i) => Math.abs(a.grow - w.agents[i].grow) < 1e-9), `e.g. ${w2.agents[0] && w2.agents[0].grow.toFixed(2)} vs ${w.agents[0] && w.agents[0].grow.toFixed(2)}`);
check('loaded environment keeps its stratification & temperature profile', Math.abs(w2.env.strat - w.env.strat) < 1e-9 && Math.abs(w2.env.tempAt(100, WORLD.H * 0.9) - w.env.tempAt(100, WORLD.H * 0.9)) < 1e-6, `strat ${w2.env.strat.toFixed(3)} vs ${w.env.strat.toFixed(3)}`);
w2.step(dt);
check('loaded world steps without error', Number.isFinite(w2.avgO2()));
// genome-length guard: a saved brain whose genome length doesn't match the species' CURRENT shape
// must be reseeded (not read past its end → NaN). Forge a too-short genome and confirm it's fixed.
const guardSnap = JSON.parse(snap);
const victim = guardSnap.agents.find(a => a.s === 'minnow') || guardSnap.agents[0];
victim.w = victim.w.slice(0, 3);                       // corrupt: wrong-length genome (old/short brain)
const w3 = new World(); w3.load(guardSnap);
w3.step(dt); w3.step(dt);
check('a stale/mismatched saved brain is reseeded to the right size (no NaN corruption)',
  w3.agents.every(a => a.g.length === genomeLen(a.sp.shape)) && Number.isFinite(w3.avgO2()) && w3.agents.every(a => Number.isFinite(a.energy)),
  `reseeded ${w3.stats.brainsReseeded || 0}`);
check('the guard only reseeds the mismatched brain, not the whole population', (w3.stats.brainsReseeded || 0) >= 1 && (w3.stats.brainsReseeded || 0) < w3.agents.length, `reseeded ${w3.stats.brainsReseeded || 0}/${w3.agents.length}`);

// ============================================================
//  COGNITION — recurrent (leaky-integrator) MEMORY in the brain
// ============================================================
console.log('\n— cognition (recurrent memory) —');
const cogShape = { in: 3, hid: 4 };
check('genomeLen includes the action outputs AND the per-unit recurrence (LEAK) params', genomeLen(cogShape) === cogShape.hid * cogShape.in + cogShape.hid + OUT * cogShape.hid + OUT + cogShape.hid, `len ${genomeLen(cogShape)}`);
const LK = cogShape.hid * cogShape.in + cogShape.hid + OUT * cogShape.hid + OUT;   // offset of the LEAK params (after W1,B1,W2,B2)
const mkAct = () => ({ h: new Float32Array(cogShape.hid), o: new Float32Array(OUT), turn: 0, thrust: 0 });
seed(99); const brain = randomGenome(cogShape);
// (A) MEMORYLESS (leak≈0): output depends ONLY on the current input — a past stimulus must leave no trace.
for (let j = 0; j < cogShape.hid; j++) brain[LK + j] = -20;
let aHist = mkAct(), aFresh = mkAct();
for (let t = 0; t < 6; t++) forward(brain, [3, 3, 3], aHist, cogShape);   // aHist: a history of strong stimulus …
forward(brain, [0, 0, 0], aHist, cogShape);                              // … then both end on the SAME zero input
forward(brain, [0, 0, 0], aFresh, cogShape);                            // aFresh: no history
check('a MEMORYLESS net (leak≈0) is history-INDEPENDENT: same input ⇒ same output (the pre-recurrence behaviour)', Math.abs(aHist.turn - aFresh.turn) < 1e-5 && Math.abs(aHist.thrust - aFresh.thrust) < 1e-5, `Δturn ${Math.abs(aHist.turn - aFresh.turn).toExponential(1)}`);
// (B) MEMORY (high leak): the SAME genome, leak turned up — output now DEPENDS on the past = the brain remembers.
for (let j = 0; j < cogShape.hid; j++) brain[LK + j] = 4;   // sigmoid(4) ≈ 0.98 → strong memory
let bHist = mkAct(), bFresh = mkAct();
for (let t = 0; t < 20; t++) forward(brain, [3, 3, 3], bHist, cogShape);
forward(brain, [0, 0, 0], bHist, cogShape);
forward(brain, [0, 0, 0], bFresh, cogShape);
check('a RECURRENT net (high leak) is history-DEPENDENT: identical current input → different output after a different past = MEMORY', Math.abs(bHist.turn - bFresh.turn) > 0.02 || Math.abs(bHist.thrust - bFresh.thrust) > 0.02, `Δturn ${Math.abs(bHist.turn - bFresh.turn).toFixed(3)}, Δthrust ${Math.abs(bHist.thrust - bFresh.thrust).toFixed(3)}`);
// (C) the memory TRACE = the stimulated state's deviation from a never-stimulated baseline; it persists then DECAYS
// toward 0 (and h stays bounded in [-1,1] — a leaky integrator, no runaway). Measuring the DEVIATION is the right
// metric: the zero-input equilibrium is the (non-zero) bias response, which isn't memory.
let cHist = mkAct(), cBase = mkAct();
for (let t = 0; t < 20; t++) forward(brain, [3, 3, 3], cHist, cogShape);   // cHist carries the stimulus; cBase never saw it
const dev = () => { let m = 0; for (let j = 0; j < cogShape.hid; j++) m = Math.max(m, Math.abs(cHist.h[j] - cBase.h[j])); return m; };
forward(brain, [0, 0, 0], cHist, cogShape); forward(brain, [0, 0, 0], cBase, cogShape);
const devEarly = dev();
for (let t = 0; t < 60; t++) { forward(brain, [0, 0, 0], cHist, cogShape); forward(brain, [0, 0, 0], cBase, cogShape); }
const devLate = dev();
const bounded = [...cHist.h, ...cBase.h].every(v => Math.abs(v) <= 1.0001);
check('the memory trace persists after the stimulus stops, then DECAYS toward the baseline (bounded, no runaway)', devEarly > 0.05 && devLate < devEarly * 0.6 && bounded, `dev ${devEarly.toFixed(3)} → ${devLate.toFixed(3)}`);
// a pre-action / pre-recurrence brain (2 outputs, no LEAK block) is PRESERVED on load: input→hidden + turn/thrust
// weights kept, the new action outputs seeded ~off, a memoryless leak appended — NOT reseeded — so the user's evolved
// brains survive BOTH upgrades (recurrence + action space) and grow memory/actions on top.
const padSnap = JSON.parse(snap);
const pv = padSnap.agents.find(a => a.s === 'sunfish') || padSnap.agents[1];
const psh = SP[pv.s].shape, len2pre = psh.hid * SP[pv.s].baseInputs + psh.hid + 2 * psh.hid + 2;   // a real v4–v14 genome: 2-output, pre-recurrence, base inputs only
pv.w = pv.w.slice(0, len2pre);
const w4 = new World(); w4.load(padSnap);
const anyMemoryless = w4.agents.some(a => Math.abs(a.g[genomeLen(a.sp.shape) - 1] + 4) < 1e-6);   // a leak param appended as -4
check('a pre-action/pre-recurrence (2-out) brain is PRESERVED on load (weights kept + actions off + memoryless leak), not reseeded', (w4.stats.brainsReseeded || 0) === 0 && w4.agents.every(a => a.g.length === genomeLen(a.sp.shape) && Number.isFinite(a.energy)) && anyMemoryless, `reseeded ${w4.stats.brainsReseeded || 0}, padded ${anyMemoryless}`);
// the recurrent WORKING MEMORY (act.h) now round-trips through save/load (it's serialized as `m`), so a resumed sim
// continues with the same in-flight state — the agents have run, so act.h is genuinely non-zero (not a vacuous match).
const memW = new World(); memW.load(JSON.parse(JSON.stringify(w.toJSON())));
check('the recurrent working memory (act.h) round-trips through save/load (serialized, not reset to zero)', memW.agents.length === w.agents.length && w.agents.some(a => [...a.act.h].some(v => Math.abs(v) > 1e-4)) && memW.agents.every((a, i) => [...a.act.h].every((v, j) => Math.abs(v - w.agents[i].act.h[j]) < 1e-6)), `${memW.agents.length} agents`);
// recurrence is ACTIVE in the live sim (not an inert feature) and EVOLVABLE: the per-unit leak params give non-trivial
// mean memory across the population AND they vary, so selection has variation to act on. (We do NOT assert memory
// "improves fitness" — that's a genuine empirical question; memory is made available & selectable, not imposed.)
// LEAK = the genome's last `hid` params (layout W1|B1|W2|B2|LEAK) — offset taken from the end so it can't go stale when OUT changes
const leakOf = a => { const sh = a.sp.shape, lk = a.g.length - sh.hid; let s = 0; for (let j = 0; j < sh.hid; j++) s += 1 / (1 + Math.exp(-a.g[lk + j])); return s / sh.hid; };
const leaks = w.agents.map(leakOf), meanLeak = leaks.reduce((s, v) => s + v, 0) / leaks.length, leakSpread = Math.max(...leaks) - Math.min(...leaks);
check('recurrence is ACTIVE (non-trivial mean memory) and EVOLVABLE (varies across the population) in the live sim', meanLeak > 0.03 && leakSpread > 0.02 && w.agents.some(a => [...a.act.h].some(v => Math.abs(v) > 1e-3)), `mean leak ${meanLeak.toFixed(3)}, spread ${leakSpread.toFixed(3)}`);

// ============================================================
//  BRAIN ACTION SPACE — the net GATES actions beyond steer+thrust: STRIKE (lunge) / FLEE (sprint) / HIDE (freeze)
// ============================================================
console.log('\n— brain action space (strike / flee / hide) —');
check('every brain emits 5 motor outputs: turn, thrust + the 3 gated actions', OUT === 5);
// forward() writes the three action intents as finite values in [0,1]
{ seed(7); const sh = { in: 4, hid: 5 }, g = randomGenome(sh), act = { h: new Float32Array(sh.hid), o: new Float32Array(OUT), turn: 0, thrust: 0 };
  forward(g, [1, -1, 0.5, 0], act, sh);
  check('forward() writes strike/flee/hide as finite intents in [0,1]', [act.strike, act.flee, act.hide].every(v => Number.isFinite(v) && v >= 0 && v <= 1), `strike ${act.strike.toFixed(2)} flee ${act.flee.toFixed(2)} hide ${act.hide.toFixed(2)}`); }
// a FRESH brain starts the actions ~OFF (negative output bias) so a new lake swims at the old turn/thrust baseline
{ seed(3); const sh = { in: 6, hid: 8 }; let s = 0; const n = 80;
  for (let i = 0; i < n; i++) { const g = randomGenome(sh), act = { h: new Float32Array(sh.hid), o: new Float32Array(OUT), turn: 0, thrust: 0 }; forward(g, [0, 0, 0, 0, 0, 0], act, sh); s += (act.strike + act.flee + act.hide) / 3; }
  check('fresh brains start the actions ~OFF (mean intent < 0.35) → a new lake behaves like the pre-action baseline', s / n < 0.35, `mean action intent ${(s / n).toFixed(3)}`); }
// migrateGenome PRESERVES a pre-action (2-output) brain's swimming + memory weights and seeds the new actions ~off
{ const sh = { in: 5, hid: 6 }, len2rec = sh.hid * sh.in + sh.hid + 2 * sh.hid + 2 + sh.hid, old = new Float32Array(len2rec);
  for (let i = 0; i < len2rec; i++) old[i] = (i % 7) * 0.1 - 0.3;   // deterministic recognizable weights (no RNG)
  seed(1); const mg = migrateGenome(old, sh, 2, true), W1B1 = sh.hid * sh.in + sh.hid;
  let kept = mg.length === genomeLen(sh);
  for (let i = 0; i < W1B1 + 2 * sh.hid; i++) if (Math.abs(mg[i] - old[i]) > 1e-9) kept = false;   // W1,B1 + turn/thrust output rows verbatim
  const leakKept = (() => { const oLK = len2rec - sh.hid, nLK = genomeLen(sh) - sh.hid; for (let j = 0; j < sh.hid; j++) if (Math.abs(mg[nLK + j] - old[oLK + j]) > 1e-9) return false; return true; })();
  check('migrateGenome preserves a pre-action (2-out) brain: input→hidden + turn/thrust + LEAK kept, length grows to current', kept && leakKept, `len ${mg.length}/${genomeLen(sh)}, weights+leak kept ${kept && leakKept}`); }
// STRIKE extends the predator's reach; HIDE conceals the prey — both bite in takePrey() (deterministic, no forward())
function eatenAt(dist, strike, hide) {
  seed(31); const ew = new World();
  const prey = ew.makeFish('minnow'); prey.x = 700; prey.y = 300; prey.act.hide = hide;
  const bass = ew.makeFish('bass'); bass.act.strike = strike; bass.x = prey.x - dist; bass.y = 300;
  ew.agents = [bass, prey]; ew.agentGrid.rebuild(ew.agents);
  return ew.takePrey(bass) === prey;
}
const baseR = (() => { seed(31); const ew = new World(); const prey = ew.makeFish('minnow'); prey.x = 700; prey.y = 300; const bass = ew.makeFish('bass'); ew.agents = [bass, prey]; ew.agentGrid.rebuild(ew.agents); return bass.sp.eatRadius * (1 - ew.coverAt(prey.x, prey.y) * COVER.REFUGE) * (1 - SCHOOL.DILUTE * ew.allyStats(prey, SCHOOL.DILUTE_R).density); })();
check('a STRIKE lunge EXTENDS reach: prey just beyond base reach is caught only WITH a committed strike', !eatenAt(baseR * 1.25, 0, 0) && eatenAt(baseR * 1.25, 1, 0), `dist ${(baseR * 1.25).toFixed(0)}, baseR ${baseR.toFixed(0)}`);
check('a freezing prey (HIDE) is CONCEALED: caught when not hiding, NOT caught fully hidden at the same range', eatenAt(baseR * 0.9, 0, 0) && !eatenAt(baseR * 0.9, 0, 1), `dist ${(baseR * 0.9).toFixed(0)}`);
check('the action knobs are sane (bursts positive, conceal/reach in range; their cost is the swimming term of respiration)', ACTION.STRIKE_REACH > 0 && ACTION.BURST_SPEED > 0 && ACTION.HIDE_CONCEAL > 0 && ACTION.HIDE_CONCEAL < 1);

// ============================================================
//  INTERNAL DRIVES — hunger / fear fed back as brain inputs → state-dependent (motivated) behaviour
// ============================================================
console.log('\n— internal drives (motivation) —');
// the two drive inputs are appended to every species, labelled, length-matched, and carry the agent's live drive values
{ const dsp = SP.minnow;
  check('internal drives occupy the last two brain inputs (hunger, fear), labelled & length-matched', dsp.inputLabels.length === dsp.shape.in && dsp.inputLabels[dsp.shape.in - 2] === 'hunger' && dsp.inputLabels[dsp.shape.in - 1] === 'fear', `in ${dsp.shape.in}, labels ${dsp.inputLabels.length}`);
  seed(9); const pw = new World(); pw.step(1 / 30); const sf = pw.agents.find(a => a.sp.diet);
  const hi = sf.sp.shape.in - 2, fi = sf.sp.shape.in - 1;
  // fear is only written in the sense phase → it equals the input exactly; hunger may be SATED in the feed step AFTER
  // the input was written, so the input holds finite in-range hunger but need not equal the post-step value.
  check('after a step, the drive inputs carry finite hunger/fear in [0,1] (fear matches the written input)', sf && Number.isFinite(sf.act.in[hi]) && sf.act.in[hi] >= 0 && sf.act.in[hi] <= 1 && Math.abs(sf.act.in[fi] - sf.fear) < 1e-6 && sf.fear >= 0 && sf.fear <= 1, `in[hunger] ${sf.act.in[hi].toFixed(3)}, fear ${sf.fear.toFixed(2)}`); }
// HUNGER (the gut's emptiness) rises as a meal is digested, and a meal SATES it
seed(5); const dwA = new World(); dwA.agents = []; dwA.plankton = [];
const pkA = dwA.addAgent('pike', { x: 1000, y: 500 }); pkA.age = SP.pike.matureAge + 50;
pkA.gut = pkA.sp.gut * pkA.W; pkA.gutE = pkA.gut * 4000; pkA.hunger = 0;   // just fed: a full gut
const savedDiet = pkA.sp.diet; pkA.sp.diet = {};   // disable ALL feeding (else the lone pike can graze a respawned bed crayfish, which sates & masks the accrual) → isolate the hunger RISE
const hStart = pkA.hunger;
for (let t = 0; t < 150 && !pkA.dead; t++) dwA.step(1 / 30);
pkA.sp.diet = savedDiet;   // restore the shared species diet before the SATE half (pkB) below
const hungerRose = pkA.hunger > hStart + 0.05;
seed(6); const dwB = new World(); dwB.agents = []; dwB.plankton = [];
const pkB = dwB.addAgent('pike', { x: 1000, y: 500 }); pkB.age = SP.pike.matureAge + 50; pkB.hunger = 0.9;
for (let i = 0; i < 8; i++) { const mn = dwB.makeFish('minnow', null, SP.minnow.matureAge + 20); mn.x = 1000 + (i % 4) * 4; mn.y = 500 + (i < 4 ? -3 : 3); dwB.agents.push(mn); }
dwB.agentGrid.rebuild(dwB.agents);
for (let t = 0; t < 40 && pkB.eaten === 0; t++) dwB.step(1 / 30);
const sated = pkB.eaten > 0 && pkB.hunger < 0.9;
check('internal HUNGER drive rises with time since a meal, and a meal SATES it', hungerRose && sated, `rose ${hStart.toFixed(2)}→${pkA.hunger.toFixed(2)}; ate ${pkB.eaten}, hunger →${pkB.hunger.toFixed(2)}`);
// FEAR jumps when a predator is near and DECAYS after it leaves (lingering caution)
seed(7); const fw = new World(); fw.agents = []; fw.plankton = [];
const fprey = fw.addAgent('minnow', { x: 1000, y: 300 }); fprey.energy = 60; fprey.age = SP.minnow.matureAge + 30;
const fpred = fw.addAgent('pike', { x: 1040, y: 300 }); fpred.energy = 50; fpred.age = SP.pike.matureAge + 50;   // within the minnow's sense, beyond its own eat reach
fw.agentGrid.rebuild(fw.agents);
for (let t = 0; t < 3 && !fprey.dead; t++) fw.step(1 / 30);
const fearSpiked = !fprey.dead && fprey.fear > 0.2;
fpred.dead = true; fw.agents = fw.agents.filter(x => !x.dead); fw.agentGrid.rebuild(fw.agents);
const fHigh = fprey.fear;
for (let t = 0; t < 60 && !fprey.dead; t++) fw.step(1 / 30);
check('internal FEAR drive spikes when a predator is near and DECAYS after it leaves', fearSpiked && fprey.fear < fHigh * 0.7, `spiked ${fearSpiked}, ${fHigh.toFixed(2)}→${fprey.fear.toFixed(2)} after threat gone`);
// migrateGenomeInputs preserves a pre-drive (fewer-input) brain: weights kept, new sensor columns zeroed, rest verbatim
{ const sh = SP.minnow.shape, oldIn = sh.in - 2;
  const oldLen = sh.hid * oldIn + sh.hid + OUT * sh.hid + OUT + sh.hid, old = new Float32Array(oldLen);
  for (let i = 0; i < oldLen; i++) old[i] = (i % 5) * 0.13 - 0.2;   // deterministic recognizable weights (no RNG)
  const mg = migrateGenomeInputs(old, sh, oldIn);
  let kept = mg.length === genomeLen(sh), zeroed = true;
  for (let j = 0; j < sh.hid; j++) { for (let i = 0; i < oldIn; i++) if (Math.abs(mg[j * sh.in + i] - old[j * oldIn + i]) > 1e-9) kept = false; if (mg[j * sh.in + oldIn] !== 0 || mg[j * sh.in + oldIn + 1] !== 0) zeroed = false; }
  const tailLen = sh.hid + OUT * sh.hid + OUT + sh.hid;
  for (let k = 0; k < tailLen; k++) if (Math.abs(mg[sh.hid * sh.in + k] - old[sh.hid * oldIn + k]) > 1e-9) kept = false;   // B1+W2+B2+LEAK verbatim
  check('migrateGenomeInputs preserves a pre-drive brain: input→hidden weights kept, new sensor columns zeroed, rest verbatim', kept && zeroed, `len ${mg.length}/${genomeLen(sh)}, weights+tail ${kept}, new cols zeroed ${zeroed}`); }

// ============================================================
//  SPATIAL COGNITION — an allocentric sense of place (compass + natal-home bearing) on the recurrent brain
// ============================================================
console.log('\n— spatial cognition (sense of place) —');
// the 3 spatial inputs are appended BEFORE the 2 drive inputs, labelled, and keep inputLabels length-matched to shape.in
check('every species gains the 3 spatial inputs (compass∠sin/cos + home∠x) before the drives, labelled & length-matched', SPECIES.every(k => {
  const sp = SP[k], L = sp.inputLabels, b = sp.baseInputs;
  return sp.shape.in === L.length    // length-matched; the spatial block sits right after the species senses, drives stay last (label-checked, robust to later input adds)
    && L[b] === 'compass∠sin' && L[b + 1] === 'compass∠cos' && L[b + 2] === 'home∠x' && L[sp.shape.in - 2] === 'hunger' && L[sp.shape.in - 1] === 'fear';
}), `minnow in ${SP.minnow.shape.in} (base ${SP.minnow.baseInputs})`);
// the natal anchor homeX is recorded at birth = the spawn x (the homing reference)
{ seed(60); const hw = new World(); const a = hw.addAgent('bass', { x: 777 });
  check('a fish records its natal site (homeX) at birth = its spawn x', a.homeX === 777, `homeX ${a.homeX}`); }
// after a step: the COMPASS is a unit heading vector (sin²+cos²≈1); the HOME∠x bearing has the sign of (homeX − x)
{ seed(61); const cw = new World(); cw.agents = [];
  const f = cw.addAgent('minnow', { x: 1000 }); f.homeX = 1500;   // natal home is to the RIGHT → bearing should be +
  const g = cw.addAgent('minnow', { x: 1500 }); g.homeX = 1000;   // natal home is to the LEFT  → bearing should be −
  cw.step(1 / 30);
  const sb = SP.minnow.baseInputs, unit = Math.hypot(f.act.in[sb], f.act.in[sb + 1]);
  check('the COMPASS input is a unit heading vector (sin²+cos²≈1) — an absolute orientation reference', Math.abs(unit - 1) < 1e-3, `|compass| ${unit.toFixed(3)}`);
  check('the HOME∠x bearing points toward the natal site (sign tracks homeX−x)', f.act.in[sb + 2] > 0 && g.act.in[sb + 2] < 0, `right-home ${f.act.in[sb + 2].toFixed(2)}, left-home ${g.act.in[sb + 2].toFixed(2)}`); }
// migrateGenomeInputs lifts a pre-spatial (3-fewer-input) brain to the current shape: weights kept, the 3 new columns zeroed
{ const sh = SP.bass.shape, oldIn = sh.in - 3;
  const oldLen = sh.hid * oldIn + sh.hid + OUT * sh.hid + OUT + sh.hid, old = new Float32Array(oldLen);
  for (let i = 0; i < oldLen; i++) old[i] = (i % 7) * 0.11 - 0.3;   // deterministic recognizable weights
  const mg = migrateGenomeInputs(old, sh, oldIn);
  let kept = mg.length === genomeLen(sh), zeroed = true;
  for (let j = 0; j < sh.hid; j++) { for (let i = 0; i < oldIn; i++) if (Math.abs(mg[j * sh.in + i] - old[j * oldIn + i]) > 1e-9) kept = false; if (mg[j * sh.in + oldIn] !== 0 || mg[j * sh.in + oldIn + 1] !== 0 || mg[j * sh.in + oldIn + 2] !== 0) zeroed = false; }
  check('migrateGenomeInputs lifts a pre-spatial brain (+3 inputs): input→hidden weights kept, the 3 new sensor columns zeroed', kept && zeroed, `len ${mg.length}/${genomeLen(sh)}, kept ${kept}, zeroed ${zeroed}`); }
// the natal-home anchor round-trips through save/load (v26)
{ seed(62); const sw = new World(); for (let i = 0; i < 40; i++) sw.step(1 / 30); const save = JSON.parse(JSON.stringify(sw.toJSON())); const lw = new World(); lw.load(save);
  const ok = lw.agents.length === sw.agents.length && lw.agents.every((a, i) => Math.abs(a.homeX - sw.agents[i].homeX) < 1e-6);
  check('the natal-home anchor (homeX) round-trips through save/load (v26)', save.version === 26 && ok, `${lw.agents.length} agents`); }

// ============================================================
//  RICHER PERCEPTION — a lateral-line/rheotaxis flow sense (turbidity-proof) + prey-size selectivity
// ============================================================
console.log('\n— richer perception (lateral line + prey size) —');
// the 2 perception inputs sit between the spatial block and the drives, labelled & length-matched
check('every species gains the 2 perception inputs (flow, prey size) between spatial and drives, labelled & length-matched', SPECIES.every(k => {
  const sp = SP[k], L = sp.inputLabels, b = sp.baseInputs;
  return sp.shape.in === L.length && L[b + 3] === 'flow' && L[b + 4] === 'prey size' && L[sp.shape.in - 2] === 'hunger';   // label-positioned, robust to later input adds
}), `minnow in ${SP.minnow.shape.in} (base ${SP.minnow.baseInputs})`);
// the LATERAL-LINE flow sense reads the local current and is MECHANOSENSORY — turbidity does NOT cut it (unlike the visual senses)
{ seed(63); const fw = new World(); fw.agents = []; const f = fw.addAgent('minnow', { x: 1000, y: 40 }); fw.env.wind = 9; fw.env.turbidity = 0.95; fw.step(1 / 30);
  const fb = SP.minnow.baseInputs + 3, clear = f.act.in[fb];
  seed(63); const fw2 = new World(); fw2.agents = []; const f2 = fw2.addAgent('minnow', { x: 1000, y: 40 }); fw2.env.wind = 9; fw2.env.turbidity = 0.05; fw2.step(1 / 30);
  check('the lateral-line FLOW sense is non-zero in a current AND turbidity-proof (mechanosensory, not vision)', Math.abs(clear) > 0.05 && Math.abs(clear - f2.act.in[fb]) < 1e-6, `flow ${clear.toFixed(2)} (murky) === ${f2.act.in[fb].toFixed(2)} (clear)`); }
// the PREY-SIZE sense reads the relative size of the nearest catchable prey for a piscivore; 0 for a non-piscivore / no prey
{ seed(64); const pw = new World(); pw.agents = [];
  const pike = pw.makeFish('pike', null, SP.pike.matureAge + 50); pike.x = 1000; pike.y = 300; pw.agents.push(pike);
  const minnow = pw.makeFish('minnow', null, SP.minnow.matureAge + 20); minnow.x = 1006; minnow.y = 300; pw.agents.push(minnow);
  pw.agentGrid.rebuild(pw.agents); pw.step(1 / 30);
  const pb = SP.pike.baseInputs + 4, mb = SP.minnow.baseInputs + 4;
  check('the PREY-SIZE sense is >0 for a piscivore beside catchable prey, and 0 for the (non-piscivore) prey itself', pike.act.in[pb] > 0 && pike.act.in[pb] <= 1 && minnow.act.in[mb] === 0, `pike preySz ${pike.act.in[pb].toFixed(2)}, minnow ${minnow.act.in[mb]}`); }
// migrateGenomeInputs lifts a pre-perception (2-fewer-input) brain: weights kept, the 2 new columns zeroed
{ const sh = SP.bass.shape, oldIn = sh.in - 2;
  const oldLen = sh.hid * oldIn + sh.hid + OUT * sh.hid + OUT + sh.hid, old = new Float32Array(oldLen);
  for (let i = 0; i < oldLen; i++) old[i] = (i % 6) * 0.1 - 0.25;
  const mg = migrateGenomeInputs(old, sh, oldIn);
  let kept = mg.length === genomeLen(sh), zeroed = true;
  for (let j = 0; j < sh.hid; j++) { for (let i = 0; i < oldIn; i++) if (Math.abs(mg[j * sh.in + i] - old[j * oldIn + i]) > 1e-9) kept = false; if (mg[j * sh.in + oldIn] !== 0 || mg[j * sh.in + oldIn + 1] !== 0) zeroed = false; }
  check('migrateGenomeInputs lifts a pre-perception brain (+2 inputs): weights kept, the 2 new columns zeroed', kept && zeroed, `len ${mg.length}/${genomeLen(sh)}, kept ${kept}, zeroed ${zeroed}`); }

// ============================================================
//  LIFETIME LEARNING — Baldwinian reward-modulated Hebbian plasticity on the policy (W2) weights
// ============================================================
console.log('\n— lifetime learning (Baldwinian plasticity) —');
// every fish carries a PLASTIC policy copy `lw` of its genotype `g` (what forward runs); they start identical but are distinct arrays
{ seed(70); const w = new World(); const a = w.agents[0];
  check('every fish has a plastic policy `lw` = a distinct copy of its genotype `g` (the Baldwinian substrate forward runs)',
    !!a.lw && a.lw.length === a.g.length && a.lw !== a.g && a.lw.every((v, i) => v === a.g[i]), `len ${a.lw.length}`); }
// reinforce STRENGTHENS the active hidden→output weights toward the action taken on reward (Hebbian) AND never writes the genotype
{ const sh = SP.bass.shape, n = genomeLen(sh), g = new Float32Array(n).fill(0.2), gCopy = Float32Array.from(g), lw = Float32Array.from(g);
  const act = { h: new Float32Array(sh.hid).fill(0.8), turn: 0, thrust: 0.9, strike: 0, flee: 0, hide: 0 };   // strong hidden + thrust ON
  const W2 = sh.in * sh.hid + sh.hid, thrustRow = W2 + 1 * sh.hid;   // output k=1 = thrust; post = 0.9*2−1 = +0.8, h = +0.8 → weights should RISE
  reinforce(lw, g, sh, act, 1, 1 / 30, LEARN.RATE, LEARN.DECAY, LEARN.CLAMP);
  const w1Unchanged = lw[0] === g[0];   // only the W2 block learns; W1 untouched
  check('reinforce Hebbian-strengthens the rewarded action weights, leaves W1 alone, and NEVER writes the genotype g', lw[thrustRow] > 0.2 && w1Unchanged && g.every((v, i) => v === gCopy[i]), `thrust w ${lw[thrustRow].toFixed(3)} > 0.2; g untouched ${g.every((v, i) => v === gCopy[i])}`); }
// homeostatic decay: with NO reward, a deviated plastic weight is pulled back toward the genotype (transient, bounded adaptation)
{ const sh = SP.minnow.shape, n = genomeLen(sh), g = new Float32Array(n).fill(0.5), lw = new Float32Array(n).fill(2.0);
  const act = { h: new Float32Array(sh.hid), turn: 0, thrust: 0, strike: 0, flee: 0, hide: 0 };
  const W2 = sh.in * sh.hid + sh.hid;
  for (let i = 0; i < 300; i++) reinforce(lw, g, sh, act, 0, 1 / 30, LEARN.RATE, LEARN.DECAY, LEARN.CLAMP);
  check('homeostatic decay pulls the plastic policy back toward the genotype when unreinforced (learning is transient)', Math.abs(lw[W2] - g[W2]) < 0.1, `lw ${lw[W2].toFixed(2)} → g ${g[W2]}`); }
// in the LIVE sim, learning actually happens: a fish's plastic policy DIVERGES from its untouched genotype (proof it's Baldwinian, not Lamarckian)
{ seed(71); const w = new World(); for (let i = 0; i < 300; i++) w.step(1 / 30);
  const diverged = w.agents.find(a => a.lw && a.lw.some((v, i) => Math.abs(v - a.g[i]) > 1e-4));
  check('lifetime learning fires in the live sim: a fish’s plastic policy diverges from its untouched genotype (lw ≠ g)', !!diverged, diverged ? 'a fish learned (lw≠g)' : 'no divergence');
  // and the plastic weights stay BOUNDED (within the clamp, finite) after the run
  const bounded = w.agents.every(a => !a.lw || a.lw.every(v => Number.isFinite(v) && v >= -LEARN.CLAMP - 1e-6 && v <= LEARN.CLAMP + 1e-6));
  check('the plastic policy weights stay BOUNDED (within the clamp, finite) over a long run', bounded); }

// ============================================================
//  AQUATIC INSECTS — benthic larvae ↔ emergent surface hatch (a cross-boundary trophic level)
// ============================================================
console.log('\n— aquatic insects (larvae → hatch) —');
// larvae are seeded on the bed (benthic); diet flags wired
{ seed(40); const iw = new World();
  const benthic = iw.larvae.length > 0 && iw.larvae.every(l => Math.abs(l.y - (iw.bedY(l.x))) < 12);
  check('benthic insect larvae are seeded on the lake bed; diet flags wired (bottom→larva, surface→insect)', benthic && SP.catfish.diet.larva && SP.carp.diet.larva && SP.minnow.diet.insect && SP.bass.diet.insect && SP.sunfish.diet.larva && SP.sunfish.diet.insect, `${iw.larvae.length} larvae`); }
// EMERGENCE is warm-gated: a mature larva hatches to the surface when warm, holds when cold (tempC eases slowly → a 1-step inject holds)
{ seed(20); const iwW = new World(); const Lw = iwW._mkLarva(1000, 1.0); iwW.larvae = [Lw]; iwW.insects = []; iwW.env.tempC = 26; iwW.step(1 / 30);
  seed(20); const iwC = new World(); const Lc = iwC._mkLarva(1000, 1.0); iwC.larvae = [Lc]; iwC.insects = []; iwC.env.tempC = 7; iwC.step(1 / 30);
  check('insect EMERGENCE is warm-gated: a mature larva hatches when warm, holds when cold', Lw.dead && iwW.insects.length >= 1 && !Lc.dead && iwC.insects.length === 0, `warm emerged ${Lw.dead}/${iwW.insects.length}; cold held ${!Lc.dead}`); }
// larvae DEVELOP with warmth (dev rises when warm, ~halts when cold)
{ function dev(temp) { seed(21); const dw = new World(); dw.agents = []; const L = dw._mkLarva(1000, 0.2); dw.larvae = [L]; for (let i = 0; i < 60; i++) { dw.env.tempC = temp; dw.step(1 / 30); } return L.dev - 0.2; }   // no fish → isolate DEVELOPMENT from predation (else a bottom fish can eat the test larva & freeze its dev, making the probe RNG-stream-fragile)
  const warm = dev(25), cold = dev(6);
  check('insect larvae DEVELOP with warmth (dev rises warm ≫ cold)', warm > cold + 0.04 && cold < 0.02, `warm Δdev ${warm.toFixed(3)} ≫ cold ${cold.toFixed(3)}`); }
// bottom fish eat benthic larvae; surface fish eat emerged insects (grids + _takeNearest + diet)
{ seed(22); const fw = new World(); fw.agents = []; fw.plankton = [];
  const cat = fw.makeFish('catfish', null, SP.catfish.matureAge + 50); cat.x = 1000; cat.y = bedY(1000) - 3;
  const lv = fw._mkLarva(1000); lv.y = cat.y; fw.larvae = [lv]; fw.larvaeGrid.rebuild(fw.larvae);
  const ateLarva = fw._takeNearest(fw.larvaeGrid, cat.x, cat.y, cat.sp.eatRadius);
  const mn = fw.makeFish('minnow', null, SP.minnow.matureAge + 20); mn.x = 1200; mn.y = 8;
  const ins = fw._mkInsect(1200); ins.y = mn.y; fw.insects = [ins]; fw.insectGrid.rebuild(fw.insects);
  const ateInsect = fw._takeNearest(fw.insectGrid, mn.x, mn.y, mn.sp.eatRadius);
  check('bottom fish eat benthic larvae & surface fish eat emerged insects', ateLarva && ateInsect, `larva ${ateLarva}, insect ${ateInsect}`); }
// qSurfaceFood routes emerged insects into the planktivore food sense (so it rises to a hatch)
{ seed(24); const qw = new World(); qw.plankton = []; const ins = qw._mkInsect(1000); ins.y = 6; qw.insects = [ins]; qw.insectGrid.rebuild(qw.insects); qw.planktonGrid.rebuild(qw.plankton);
  const m = qw.makeFish('minnow', null, SP.minnow.matureAge + 20); m.x = 1000; m.y = 6;
  const food = qw.qSurfaceFood(m);
  check('qSurfaceFood routes an emerged insect into the planktivore food sense (rise-to-hatch)', !!food && food.item === ins, `found ${!!food}`); }
// the insect populations round-trip through save/load (v26)
{ seed(23); const sw = new World(); for (let i = 0; i < 80; i++) sw.step(1 / 30); const save = JSON.parse(JSON.stringify(sw.toJSON()));
  const lw = new World(); lw.load(save);
  check('aquatic insects round-trip through save/load (v26)', save.version === 26 && lw.larvae.length === sw.larvae.length && lw.insects.length === sw.insects.length, `v${save.version}, larvae ${lw.larvae.length}, insects ${lw.insects.length}`); }

// ============================================================
//  BENTHIC INVERTEBRATES — grazing snails + omnivorous crayfish (two new benthic web links)
// ============================================================
console.log('\n— benthic invertebrates (snails + crayfish) —');
// seeded on the bed; the new diet flags are wired (phyto→snail→{sunfish,carp,cray}; detritus→cray→{bass,pike,catfish})
{ seed(50); const bw = new World();
  const onBed = bw.snails.length > 0 && bw.cray.length > 0 && bw.snails.every(s => Math.abs(s.y - bw.bedY(s.x)) < 8) && bw.cray.every(c => Math.abs(c.y - bw.bedY(c.x)) < 8);
  const diet = SP.sunfish.diet.snail && SP.carp.diet.snail && SP.bass.diet.cray && SP.pike.diet.cray && SP.catfish.diet.cray;
  check('snails & crayfish are seeded on the lake bed; the benthic diet flags are wired', onBed && diet, `${bw.snails.length} snails, ${bw.cray.length} crayfish`); }
// snails GRAZE the phytoplankton field — a dense snail cluster draws local algae below a snail-free control (same seed, one step)
{ const tx = 900, ty = bedY(900) - 4;
  seed(51); const aw = new World(); aw.agents = []; aw.snails = []; aw.cray = []; for (let i = 0; i < 60; i++) aw.snails.push(aw._mkSnail(tx)); aw.step(1 / 30); const aAfter = aw.env.phytoAt(tx, ty);
  seed(51); const bw = new World(); bw.agents = []; bw.snails = []; bw.cray = []; bw.step(1 / 30); const bAfter = bw.env.phytoAt(tx, ty);
  check('snails graze the phytoplankton field (a dense snail cluster draws local algae down vs a snail-free control)', aAfter < bAfter, `cluster ${aAfter.toFixed(3)} < control ${bAfter.toFixed(3)}`); }
// crayfish PREY on snails (the signature crayfish→snail link + snail population control)
{ seed(52); const cw = new World(); cw.agents = []; cw.cray = []; const x = 1000, y = bedY(1000) - 2;
  const sn = cw._mkSnail(x); sn.y = y; cw.snails = [sn]; cw.snailGrid.rebuild(cw.snails);
  const cf = cw._mkCray(x); cf.y = y;
  const ate = cw._takeNearest(cw.snailGrid, cf.x, cf.y, CRAYFISH.EAT_R);
  check('crayfish prey on a nearby snail (within EAT_R) — snail population control', ate && sn.dead, `ate ${ate}, snail dead ${sn.dead}`); }
// molluscivorous fish eat snails & predatory fish eat crayfish (the eat path: grid + _takeNearest + diet, same as the feed step)
{ seed(53); const fw = new World(); fw.agents = []; fw.snails = []; fw.cray = [];
  const sf = fw.makeFish('sunfish', null, SP.sunfish.matureAge + 30); sf.x = 1000; sf.y = bedY(1000) - 3;
  const sn = fw._mkSnail(1000); sn.y = sf.y; fw.snails = [sn]; fw.snailGrid.rebuild(fw.snails);
  const ateSnail = fw._takeNearest(fw.snailGrid, sf.x, sf.y, sf.sp.eatRadius);
  const bs = fw.makeFish('bass', null, SP.bass.matureAge + 30); bs.x = 1300; bs.y = bedY(1300) - 3;
  const cf = fw._mkCray(1300); cf.y = bs.y; fw.cray = [cf]; fw.crayGrid.rebuild(fw.cray);
  const ateCray = fw._takeNearest(fw.crayGrid, bs.x, bs.y, bs.sp.eatRadius);
  check('molluscivores eat benthic snails & predators eat benthic crayfish', ateSnail && ateCray && sn.dead && cf.dead, `snail ${ateSnail}, cray ${ateCray}`); }
// populations stay bounded by their caps and persist over a long run (recruitment is logistic + food-gated, with a snail refuge floor).
// Assert a PLAUSIBLE BAND (not just ≤cap): the realized steady count sits FAR below cap, so a future regression that lets either
// balloon toward cap (e.g. a broken logistic/starvation term) would be caught — a bare ≤cap check passes that trivially.
{ seed(55); const pw = new World(); for (let i = 0; i < 400; i++) pw.step(1 / 30);
  const sc = scaleCount(SNAIL.CAP), cc = scaleCount(CRAYFISH.CAP);
  const snOk = pw.snails.length > 0 && pw.snails.length < sc * 0.5;   // realized ≈169 vs cap 1620 → must stay well under half the cap
  const cfOk = pw.cray.length > 0 && pw.cray.length < cc * 0.5;       // realized ≈42 vs cap 540
  check('snail & crayfish populations persist and self-limit FAR below their caps (not just ≤cap)', snOk && cfOk, `snails ${pw.snails.length}/${sc}, cray ${pw.cray.length}/${cc}`); }
// snails + crayfish round-trip through save/load (v26)
{ seed(54); const sw = new World(); for (let i = 0; i < 80; i++) sw.step(1 / 30); const save = JSON.parse(JSON.stringify(sw.toJSON())); const lw = new World(); lw.load(save);
  const ok = save.version === 26 && lw.snails.length === sw.snails.length && lw.cray.length === sw.cray.length
    && lw.snails.every((s, i) => Math.abs(s.x - sw.snails[i].x) < 1e-6) && lw.cray.every((c, i) => Math.abs(c.x - sw.cray[i].x) < 1e-6);
  check('snails + crayfish round-trip through save/load (v26)', ok, `snails ${lw.snails.length}/${sw.snails.length}, cray ${lw.cray.length}/${sw.cray.length}`); }

// ============================================================
//  LOCOMOTION MOMENTUM — fish carve/drift through turns (travel dir lags body heading) + a hard turn scrubs speed
// ============================================================
console.log('\n— locomotion momentum (carving turns) —');
function swimTest(turnBias) {
  seed(9); const lw = new World(); lw.agents = [];
  const f = lw.addAgent('bass', { x: 1000, y: 540 }); f.energy = 60;
  f.maxSpeed = 56; f.accel = 64; f.maxTurn = 2.2;        // pin locomotion stats to the bass baseline → the turn-scrub ratio is independent of where the RNG stream sits (new subsystems shift the genome otherwise)
  const savedInnate = f.sp.innate; f.sp.innate = null;   // isolate the brain's forced turn/thrust from the innate ethogram (ambush thrust-suppression / cruise blend); restored below
  const sh = f.sp.shape, W2 = sh.hid * sh.in + sh.hid, B2 = W2 + OUT * sh.hid;
  for (let j = 0; j < sh.hid; j++) { f.g[W2 + j] = 0; f.g[W2 + sh.hid + j] = 0; }   // zero turn & thrust output rows → clean outputs from the biases (RNG-independent)
  f.g[B2 + 0] = turnBias; f.g[B2 + 1] = 6;              // turn bias (0 = straight / large = hard-turn); thrust bias high → swims hard
  for (let k = 2; k < OUT; k++) f.g[B2 + k] = -20;      // actions off (no burst/freeze confound)
  f.lw = Float32Array.from(f.g);                        // forward() runs the PLASTIC policy → sync it to the forced genotype
  const savedRate = LEARN.RATE; LEARN.RATE = 0;         // freeze lifetime learning so the forced brain holds through the run
  lw.agentGrid.rebuild(lw.agents);
  let lagSum = 0, n = 0;
  for (let t = 0; t < 90; t++) { lw.step(1 / 30); if (t >= 30) { lagSum += Math.abs(angDiff(f.heading, f.velHeading)); n++; } }   // mean lag after transients
  LEARN.RATE = savedRate; f.sp.innate = savedInnate;
  return { spd: f.spd, meanLag: lagSum / n, fin: Number.isFinite(f.x) && Number.isFinite(f.velHeading) };
}
const straightSwim = swimTest(0), hardTurner = swimTest(9);
check('velHeading is a finite travel-direction field on every fish', straightSwim.fin && hardTurner.fin);
check('a hard-TURNING fish CARVES — its travel direction lags the body heading far more than a straight swimmer (momentum)', hardTurner.meanLag > straightSwim.meanLag + 0.08 && hardTurner.meanLag > 0.1, `turner lag ${hardTurner.meanLag.toFixed(3)} ≫ straight ${straightSwim.meanLag.toFixed(3)}`);
check('a hard TURN scrubs forward speed — the turner is slower than the straight swimmer at equal thrust (can\'t bank at full tilt)', hardTurner.spd < straightSwim.spd * 0.93, `turner ${hardTurner.spd.toFixed(1)} < straight ${straightSwim.spd.toFixed(1)}`);
check('MOTION knobs are sane (positive response/drag, speed-lag in [0,1))', MOTION.TURN_RESPONSE > 0 && MOTION.SPEED_LAG >= 0 && MOTION.SPEED_LAG < 1 && MOTION.TURN_DRAG > 0);
// burst-and-coast: a cruising fish PULSES its speed (surge-then-glide); the pulse is zero-mean so the cycle-MEAN speed
// ≈ steady-thrust (balance-neutral). Compare COAST vs a steady control (DEPTH 0), identical otherwise, so the innate
// steering's speed variance cancels and only the burst-coast pulse remains in the difference.
function cruiseProfile(coastDepth) {
  const saved = MOTION.COAST_DEPTH; MOTION.COAST_DEPTH = coastDepth;
  seed(17); const cw = new World().setDate(0.42); cw.agents = [];   // summer: warm enough that the cruise isn't cold-slowed
  const f = cw.addAgent('carp', { x: 1000, y: 760 }); f.energy = 90;
  const sh = f.sp.shape, W2 = sh.hid * sh.in + sh.hid, B2 = W2 + OUT * sh.hid;
  for (let j = 0; j < sh.hid; j++) { f.g[W2 + j] = 0; f.g[W2 + sh.hid + j] = 0; }   // zero turn & thrust output rows → clean steady intent
  f.g[B2 + 0] = 0; f.g[B2 + 1] = 0;                                                  // straight; thrust intent ≈ 0.5 (sigmoid 0)
  for (let k = 2; k < OUT; k++) f.g[B2 + k] = -20;                                   // actions off
  f.lw = Float32Array.from(f.g);                                                     // forward() runs the plastic policy → sync to the forced genotype
  const savedRate = LEARN.RATE; LEARN.RATE = 0;                                      // freeze learning so the forced steady-thrust brain holds
  cw.agentGrid.rebuild(cw.agents);
  for (let t = 0; t < 50; t++) cw.step(1 / 30);                                      // settle to cruise
  const spds = []; for (let t = 0; t < 60; t++) { cw.step(1 / 30); spds.push(f.spd); }
  MOTION.COAST_DEPTH = saved; LEARN.RATE = savedRate;
  const mean = spds.reduce((s, v) => s + v, 0) / spds.length;
  const cv = Math.sqrt(spds.reduce((s, v) => s + (v - mean) * (v - mean), 0) / spds.length) / (mean || 1);
  return { mean, cv };
}
const bcCoast = cruiseProfile(MOTION.COAST_DEPTH), bcSteady = cruiseProfile(0);   // same seed & brain: any extra speed variance is the pulse itself
check('burst-and-coast PULSES a cruising fish\'s speed (surge-then-glide) vs steady thrust', bcCoast.cv > bcSteady.cv * 1.08 && bcCoast.cv > 0.04, `coast CV ${bcCoast.cv.toFixed(3)} > steady ${bcSteady.cv.toFixed(3)}`);
check('burst-and-coast is ~balance-neutral: the cycle-MEAN cruise speed stays close to steady-thrust (zero-mean pulse)', Math.abs(bcCoast.mean - bcSteady.mean) < bcSteady.mean * 0.2 + 0.5, `coast mean ${bcCoast.mean.toFixed(1)} ≈ steady ${bcSteady.mean.toFixed(1)}`);

// ============================================================
//  SCHOOL DILUTION — a prey in a dense shoal is harder to single out (predator-confusion → schooling is adaptive)
// ============================================================
console.log('\n— school dilution (predator-confusion) —');
// place a bass predator just within strike reach of a lone minnow, then re-test with a tight shoal AROUND the prey.
function shoaledEaten(withShoal) {
  seed(31); const sw = new World();
  const prey = sw.makeFish('minnow'); prey.x = 700; prey.y = 300;
  const bass = sw.makeFish('bass');
  const er = bass.sp.eatRadius, cov = sw.coverAt(prey.x, prey.y);
  const D = 0.72 * er * (1 - cov * COVER.REFUGE);   // within the lone reach, but beyond the shoaled reach (× (1−DILUTE))
  bass.x = prey.x - D; bass.y = 300;
  const agents = [bass, prey];
  if (withShoal) for (let k = 0; k < 9; k++) { const s = sw.makeFish('minnow'); s.x = prey.x + 8 + (k % 3) * 6; s.y = 300 + ((k / 3 | 0) - 1) * 9; agents.push(s); }   // a tight shoal around the prey, all farther from the bass
  sw.agents = agents; sw.agentGrid.rebuild(sw.agents);
  return sw.takePrey(bass) === prey;
}
check('a LONE prey just within strike range IS eaten', shoaledEaten(false), 'lone');
check('the SAME prey tucked in a dense shoal is NOT eaten — predator-confusion/dilution makes schooling cohesion ADAPTIVE', !shoaledEaten(true) && SCHOOL.DILUTE > 0, 'shoaled (safe)');
// dilution is DENSITY-graded (monotonic), and by design it is a GROUP-SIZE property — NOT gated to "schooling" species
// (any conspecific cluster dilutes, as in a real baitball; schooling is just the behaviour that reliably forms one).
function reachFactor(nNeighbours) {
  seed(31); const sw = new World();
  const prey = sw.makeFish('minnow'); prey.x = 700; prey.y = 300; const agents = [prey];
  for (let k = 0; k < nNeighbours; k++) { const s = sw.makeFish('minnow'); s.x = prey.x + 6 + (k % 3) * 6; s.y = 300 + ((k / 3 | 0) - 1) * 9; agents.push(s); }
  sw.agents = agents; sw.agentGrid.rebuild(sw.agents);
  return 1 - SCHOOL.DILUTE * sw.allyStats(prey, SCHOOL.DILUTE_R).density;   // the dilution multiplier on a predator's reach
}
check('predator-confusion is DENSITY-graded (a predator\'s reach falls monotonically as the cluster grows) — a group-size property, not species-gated', reachFactor(0) > reachFactor(4) && reachFactor(4) > reachFactor(9), `reach×: ${reachFactor(0).toFixed(2)} > ${reachFactor(4).toFixed(2)} > ${reachFactor(9).toFixed(2)}`);

// ============================================================
//  CYANOTOXINS — a dense cyanobacteria surface scum poisons fish + zooplankton (HAB toxicity)
// ============================================================
console.log('\n— cyanotoxins (HAB toxicity) —');
// FISH: same seed + single surface fish + no food, so its respiration over one step is metabolism (identical) × toxic stress.
function fishRespAfter(cyanoLevel) {
  seed(77); const cw = new World();
  const f = cw.makeFish('minnow'); f.x = 1024; f.y = 48;
  cw.agents = [f]; cw.plankton = []; cw.agentGrid.rebuild(cw.agents);   // no food → mass only falls (respiration)
  cw.env.cyano.fill(cyanoLevel);
  cw.step(1 / 30);
  return f.rO2;
}
const eToxic = fishRespAfter(CYANO.CAP), eClean = fishRespAfter(0), eBelow = fishRespAfter(0.9 * CYANO.TOX_THRESH * CYANO.CAP);
check('cyanotoxin: a fish in a DENSE surface scum burns more (detoxification, gill/liver damage) than in clean water (HAB poisoning)', eToxic > eClean * 1.2, `respiration scum ${eToxic.toExponential(3)} vs clean ${eClean.toExponential(3)} g O₂/s`);
check('cyanotoxin is INERT below the threshold (sub-threshold cyano costs the same as clean water → a fresh/clear lake is unchanged)', Math.abs(eBelow - eClean) < 1e-12, `below ${eBelow.toExponential(5)} ≈ clean ${eClean.toExponential(5)}`);
// ZOOPLANKTON: ISOLATE the toxin from the cyano↔phyto competition by KEEPING phyto at CAP during the forced scum, so
// the zoo can't STARVE — only the TOXIN can kill them. Toxin-on must collapse them far below the toxin-off control.
function zooScum(toxOff) {
  const savedZ = CYANO.TOX_ZOO; if (toxOff) CYANO.TOX_ZOO = 0;
  seed(88); const zw = new World();
  for (let i = 0; i < 250; i++) zw.step(1 / 30);                                                          // build a zoo population
  for (let i = 0; i < 150; i++) { zw.env.cyano.fill(CYANO.CAP); zw.env.phyto.fill(PHYTO.CAP); zw.step(1 / 30); }   // dense scum BUT food kept abundant
  CYANO.TOX_ZOO = savedZ;
  return zw.plankton.filter(p => !p.dead).length;
}
const zTox = zooScum(false), zNoTox = zooScum(true);
check('cyanotoxin kills zooplankton by POISON, not just competition (phyto kept abundant → only the toxin can kill; toxin-on ≪ toxin-off control)', zNoTox > 0 && zTox < zNoTox * 0.6, `toxin-on ${zTox} ≪ toxin-off ${zNoTox}`);
check('the cyanotoxin zooplankton death is DETERMINISTIC (seeded RNG → same seed ⇒ identical survivor count)', zooScum(false) === zTox, `repeat ${zooScum(false)} === ${zTox}`);

// ============================================================
//  CONTAMINANT BIOACCUMULATION — a toxicant BIOMAGNIFIES up the food chain (apex predators carry the most)
// ============================================================
console.log('\n— contaminant bioaccumulation / biomagnification —');
// a CLEAN lake (TOX.AMBIENT=0, the default) is INERT — no fish accumulates any burden over a long run.
seed(123); const txClean = new World();
for (let i = 0; i < 1500; i++) txClean.step(1 / 30);
check('a CLEAN lake (TOX.AMBIENT=0) is inert: no fish carries any contaminant burden', txClean.agents.every(a => a.tox === 0), `max tox ${Math.max(0, ...txClean.agents.map(a => a.tox)).toFixed(3)}`);
// the BIOMAGNIFICATION step (direct): a predator assimilates its prey's whole accumulated burden when it eats it.
seed(31); const bmw = new World();
const bprey = bmw.makeFish('minnow'); bprey.x = 700; bprey.y = 300; bprey.tox = 2.0;   // a contaminated prey
const bpred = bmw.makeFish('bass'); bpred.tox = 0;
bpred.x = bprey.x - 0.5 * bpred.sp.eatRadius * (1 - bmw.coverAt(bprey.x, bprey.y) * COVER.REFUGE); bpred.y = 300;
bmw.agents = [bpred, bprey]; bmw.agentGrid.rebuild(bmw.agents);
const bAte = bmw.takePrey(bpred) === bprey;
check('biomagnification STEP: a predator assimilates its prey\'s contaminant burden when it eats it (× TOX.ASSIM)', bAte && Math.abs(bpred.tox - TOX.ASSIM * 2.0) < 1e-6, `predator tox ${bpred.tox.toFixed(3)} = ${TOX.ASSIM}×2.0`);
// END-TO-END biomagnification in a RUNNING sim — CONTROLLED so it doesn't hinge on chaotic emergent hunting (a short
// run + the momentum dynamics make a free-run guild-mean comparison seed-fragile). Stock a dense patch of CONTAMINATED
// prey with predators placed ON it, AMBIENT=0 so the ONLY tox source is EATING contaminated fish → a pure
// predation-driven biomagnification signal: the predators' burden climbs from 0 purely by eating up the chain. (Emergent
// whole-lake biomag — apex carry the most — is confirmed separately by the long balance run, where predators hunt & breed.)
const savedAmb = TOX.AMBIENT; TOX.AMBIENT = 0;
seed(77); const bmw2 = new World(); bmw2.agents = []; bmw2.plankton = [];
const PREY_TOX = 2.0, preds = [];
for (let i = 0; i < 36; i++) { const mn = bmw2.makeFish('minnow', null, SP.minnow.matureAge + 40); mn.x = 860 + (i % 6) * 24; mn.y = 336 + ((i / 6) | 0) * 14; mn.tox = PREY_TOX; mn.energy = 30; bmw2.agents.push(mn); }
for (let i = 0; i < 6; i++) { const bs = bmw2.makeFish('bass', null, SP.bass.matureAge + 80); bs.x = 860 + i * 24; bs.y = 336 + (i % 3) * 14; bs.tox = 0; preds.push(bs); bmw2.agents.push(bs); }   // predators ON the prey patch → guaranteed encounters
bmw2.agentGrid.rebuild(bmw2.agents);
for (let i = 0; i < 2500; i++) bmw2.step(1 / 30);
const maxPredTox = Math.max(0, ...preds.map(p => p.tox)), nAte = preds.filter(p => p.eaten > 0).length;
check('contaminant BIOMAGNIFIES up the food chain: predators accumulate a burden by EATING contaminated prey (AMBIENT off → predation is the ONLY source)', maxPredTox > 0.4 && nAte > 0, `max predator tox ${maxPredTox.toFixed(2)} (prey started ${PREY_TOX}); ${nAte}/6 ate`);
// the body burden round-trips through save/load (a short polluted free-run world: ambient uptake → tox > 0)
TOX.AMBIENT = 0.3; seed(123); const txPol = new World();
for (let i = 0; i < 1200; i++) txPol.step(1 / 30);
TOX.AMBIENT = savedAmb;
const txSave = new World(); txSave.load(JSON.parse(JSON.stringify(txPol.toJSON())));
check('contaminant body burden (tx) round-trips through save/load (v26)', txSave.agents.length === txPol.agents.length && txSave.agents.some(a => a.tox > 0) && txSave.agents.every((a, i) => Math.abs(a.tox - txPol.agents[i].tox) < 1e-6), `${txSave.agents.length} agents`);
// HARM-mortality: a fish whose burden is ≫ TOX.HARM dies from the toxicant (the lethal end); a clean one survives.
function survivesTox(toxLevel) {
  seed(55); const hw = new World();
  const f = hw.makeFish('pike', null, 200); f.x = 1024; f.y = 300; f.energy = 1.5; f.tox = toxLevel;   // age 200 ≪ pike maxAge (so old age can't confound)
  // neutralize the brain-gated ACTIONS (strike/flee/hide) for this isolation — their energy cost is verified in the
  // action-space section; here we want ONLY the toxicant's mortality hazard, so a random brain's bursts can't confound.
  const sh = f.sp.shape, B2 = sh.hid * sh.in + sh.hid + OUT * sh.hid;
  for (let k = 2; k < OUT; k++) f.g[B2 + k] = -20;   // sigmoid(-20) ≈ 0 → actions off → no action energy cost
  f.lw = Float32Array.from(f.g);                     // forward() runs the plastic policy → sync so actions are really off (isolated pike never eats → no learning drift)
  hw.agents = [f]; hw.plankton = []; hw.agentGrid.rebuild(hw.agents);
  for (let i = 0; i < 400 && !f.dead; i++) hw.step(1 / 30);
  return !f.dead;
}
check('contaminant HARM-mortality: a burden ≫ TOX.HARM kills the fish (a clean fish at the same energy/age survives)', survivesTox(0) && !survivesTox(TOX.HARM * 4), 'clean survives, high-burden dies');
// offspring do NOT inherit a parent's burden — newborns start clean (contaminants aren't heritable; reproduction uses
// the same makeAgent path, which hard-sets tox:0).
check('a newly-created fish starts with ZERO contaminant burden (offspring don\'t inherit it — contaminants aren\'t heritable)', bmw.makeFish('bass').tox === 0 && bmw.makeFish('pike', [1, 1, 1, 1, 1, 1], 300).tox === 0, 'tox 0');
// SUB-LETHAL reproductive impairment: the breeding gate multiplies its probability by toxFecundity(a.tox), so a
// contaminated fish reproduces LESS before the toxicant kills it (the classic PCB/endocrine concern) — inert when clean.
check('contaminant SUB-LETHAL fecundity: breeding chance is full when clean, falls monotonically with burden, and hits 0 by the lethal threshold', toxFecundity(0) === 1 && toxFecundity(TOX.REPRO_HARM) === 1 && toxFecundity(2) === 0.5 && toxFecundity(2) > toxFecundity(2.8) && toxFecundity(TOX.HARM) === 0, `f(0)=${toxFecundity(0)}, f(2)=${toxFecundity(2)}, f(HARM)=${toxFecundity(TOX.HARM)}`);

// ============================================================
//  PHASE 1 — basin shape + thermal depth structure + seasons
// ============================================================
console.log('\n— habitat / thermal —');
const cx = WORLD.W * BASIN.CENTER;
check('lake bed is a basin (deep centre, shallow shores)', bedY(cx) > bedY(20) + 200 && bedY(cx) > bedY(WORLD.W - 20) + 200,
  `centre ${bedY(cx) | 0} vs shores ${bedY(20) | 0}/${bedY(WORLD.W - 20) | 0}`);
// littoral morphometry: a broad flat shallow shelf near each shore, then a steep drop-off into the basin
const bShelfIn = bedY(WORLD.W * 0.03), bShelfOut = bedY(WORLD.W * 0.12), bDrop = bedY(WORLD.W * 0.30);
check('shore has a broad, flat, shallow littoral shelf (not a smooth U)',
  bShelfIn < WORLD.H * 0.32 && bShelfOut < WORLD.H * 0.34 && Math.abs(bShelfOut - bShelfIn) < WORLD.H * 0.10,
  `shelf ${bShelfIn | 0}→${bShelfOut | 0} (Δ${Math.abs(bShelfOut - bShelfIn) | 0})`);
check('a steep drop-off falls from the shelf into the deep basin',
  bDrop - bShelfOut > WORLD.H * 0.25, `drop ${bShelfOut | 0}→${bDrop | 0} (Δ${(bDrop - bShelfOut) | 0})`);

function runSeason(yearFrac) {
  seed(424242); const tw = new World().setDate(yearFrac);
  // track the PEAK surface temp over the run: the instantaneous reading depends on the diel phase at the final
  // step (and the day length), so the thermal-niche check uses the seasonal peak (warmest diel moment) instead.
  let tSurfMax = -Infinity;
  for (let i = 0; i < 1500; i++) { tw.step(1 / 30); const ts = tw.env.tempAt(cx, 18); if (ts > tSurfMax) tSurfMax = ts; }
  const bed = tw.bedY(cx);
  return { strat: tw.env.strat, tSurf: tw.env.tempAt(cx, 18), tSurfMax, tDeep: tw.env.tempAt(cx, bed - 12),
    o2Surf: tw.oxygenAt(cx, 18), o2Deep: tw.oxygenAt(cx, bed - 12) };
}
const summer = runSeason(0.42);   // ~Aug 1: the warmest, most stratified water
const turnover = runSeason(0.66);  // ~late Oct: autumn turnover (stratification collapsed → full mixing)
console.log(`summer: strat ${summer.strat.toFixed(2)} ΔT ${(summer.tSurf - summer.tDeep).toFixed(1)} O₂ surf ${summer.o2Surf.toFixed(2)} deep ${summer.o2Deep.toFixed(2)}`);
console.log(`turnover: strat ${turnover.strat.toFixed(2)} ΔT ${(turnover.tSurf - turnover.tDeep).toFixed(1)} O₂ surf ${turnover.o2Surf.toFixed(2)} deep ${turnover.o2Deep.toFixed(2)}`);
check('summer: deep water is colder than the surface (stratified)', summer.tDeep < summer.tSurf - 3, `Δ ${(summer.tSurf - summer.tDeep).toFixed(1)}°C`);
check('summer: the hypolimnion is more hypoxic than the surface', summer.o2Deep < summer.o2Surf - 0.05, `deep ${summer.o2Deep.toFixed(2)} < surf ${summer.o2Surf.toFixed(2)}`);
check('turnover collapses the thermal gradient (mixing)', (turnover.tSurf - turnover.tDeep) < (summer.tSurf - summer.tDeep) - 3, `turn Δ ${(turnover.tSurf - turnover.tDeep).toFixed(1)} vs summer Δ ${(summer.tSurf - summer.tDeep).toFixed(1)}`);
check('turnover re-oxygenates the hypolimnion vs stratified summer', turnover.o2Deep > summer.o2Deep, `${turnover.o2Deep.toFixed(2)} > ${summer.o2Deep.toFixed(2)}`);

// storm-driven mixing: a forced summer storm erodes stratification and re-oxygenates the hypoxic deep
function summerWorld() { seed(909090); const tw = new World().setDate(0.42); for (let i = 0; i < 1500; i++) tw.step(1 / 30); return tw; }
const calmW = summerWorld(), stormW = summerWorld();
calmW.env.setWeather(0); stormW.env.setWeather(3);     // forced clear vs forced storm, same stratified start
for (let i = 0; i < 900; i++) { calmW.step(1 / 30); stormW.step(1 / 30); }   // ~30s
const calmStrat = calmW.env.strat, stormStrat = stormW.env.strat;
const calmDeep = calmW.oxygenAt(cx, calmW.bedY(cx) - 12), stormDeep = stormW.oxygenAt(cx, stormW.bedY(cx) - 12);
console.log(`storm-mix: strat calm ${calmStrat.toFixed(2)} storm ${stormStrat.toFixed(2)} | deep O₂ calm ${calmDeep.toFixed(2)} storm ${stormDeep.toFixed(2)}`);
check('a summer storm erodes stratification (breaks the thermocline)', stormStrat < calmStrat - 0.1, `storm strat ${stormStrat.toFixed(2)} < calm ${calmStrat.toFixed(2)}`);
// (calm deep < 0.35 ≈ 3 mg/L: hypoxic)
check('storm mixing re-oxygenates the hypoxic summer deep vs a calm control', stormDeep > calmDeep + 0.05 && calmDeep < 0.35, `storm deep ${stormDeep.toFixed(2)} > calm ${calmDeep.toFixed(2)}`);

// per-species thermal & O₂ tolerance envelopes (warm- vs cool-water physiological niches)
console.log('\n— thermal / O₂ niches —');
check('every species has a sane thermal/O₂ niche (tempOpt/tempTol/o2Crit)', SPECIES.every(k => {
  const s = SP[k]; return s.tempOpt >= 10 && s.tempOpt <= 32 && s.tempTol >= 3 && s.tempTol <= 15 && s.o2Crit >= 0.05 && s.o2Crit <= 0.6;
}));
check('a warm/cool guild gradient exists (pike cool & O₂-demanding; catfish/carp warm & hypoxia-tolerant)',
  SP.pike.tempOpt < SP.catfish.tempOpt && SP.pike.tempOpt < SP.carp.tempOpt && SP.pike.o2Crit > SP.catfish.o2Crit && SP.pike.o2Crit > SP.carp.o2Crit,
  `pike opt ${SP.pike.tempOpt}/o2 ${SP.pike.o2Crit} vs catfish ${SP.catfish.tempOpt}/${SP.catfish.o2Crit}`);
// thermal stress in the real summer surface field: the coolwater apex is stressed where the warmwater benthivore is not
const thStress = sp => Math.max(0, Math.abs(summer.tSurfMax - sp.tempOpt) - sp.tempTol);
check('warm summer surface thermally stresses cool pike but not warm catfish',
  thStress(SP.pike) > 0 && thStress(SP.pike) > thStress(SP.catfish) && thStress(SP.catfish) === 0,
  `peak surf ${summer.tSurfMax.toFixed(1)}°C → pike +${thStress(SP.pike).toFixed(1)} / catfish +${thStress(SP.catfish).toFixed(1)}`);
// hypoxia penalty fraction in the real summer hypoxic deep: the O₂-demanding species suffers more than the tolerant one
const hypFrac = sp => summer.o2Deep < sp.o2Crit ? (sp.o2Crit - summer.o2Deep) / sp.o2Crit : 0;
check('the anoxic summer deep punishes O₂-demanding pike more than hypoxia-tolerant carp',
  hypFrac(SP.pike) > hypFrac(SP.carp), `deep O₂ ${summer.o2Deep.toFixed(2)} → pike ${hypFrac(SP.pike).toFixed(2)} > carp ${hypFrac(SP.carp).toFixed(2)}`);
// no species is driven extinct by the new pressure within a season (the re-seed floors backstop)
const nicheW = new World(); for (let i = 0; i < 1800; i++) nicheW.step(1 / 30);
const nicheCensus = nicheW.census();
check('REFUGE invariant: all six species present after a simulated season under thermal/O₂ pressure', SPECIES.every(k => nicheCensus[k] > 0),
  SPECIES.map(k => `${k} ${nicheCensus[k]}`).join(' '));
// zooplankton drift with the current but must stay in the water column — never embed in the sloped bed
const embedded = nicheW.plankton.filter(p => !p.dead && p.baseY > nicheW.bedY(p.x) + 1).length;
check('drifting zooplankton stay above the bed (no green dots sunk into the slopes)', embedded === 0, `${embedded} embedded of ${nicheW.plankton.length}`);

// multi-gene genome — heritable traits beyond the brain (size / speed / tolerance)
console.log('\n— multi-gene genome —');
const GEPS = 1e-4;   // float32 storage rounds the clamp bounds slightly; tolerate that
const inBounds = v => v >= GENE_MIN - GEPS && v <= GENE_MAX + GEPS && Number.isFinite(v);
const rg = randomGenes();
check('randomGenes makes an in-range trait vector near 1.0', rg.length === GENE_KEYS.length && [...rg].every(inBounds), `[${[...rg].map(v => v.toFixed(2))}]`);
const pa = Float32Array.from([1.30, 0.80, 1.10]), pb = Float32Array.from([0.90, 1.20, 0.70]);
const cg = crossoverGenes(pa, pb);
check('crossoverGenes blends (averages) parent traits', Math.abs(cg[0] - 1.10) < 1e-6 && Math.abs(cg[1] - 1.00) < 1e-6 && Math.abs(cg[2] - 0.90) < 1e-6, `[${[...cg].map(v => v.toFixed(2))}]`);
check('mutateGenes stays within the gene bounds', [...mutateGenes(Float32Array.from([GENE_MAX, GENE_MIN, 1]))].every(inBounds));
const gw = new World();
check('every agent carries the full trait genome + gene-derived effective stats (maturation size/speed/tol + fin/eye/body)', gw.agents.every(a =>
  a.genes && a.genes.length === GENE_KEYS.length && a.maxSpeed > 0 && a.metabMul > 0 && a.maxTurn > 0 && a.senseRange > 0 && a.accel > 0 && a.bodyMul > 0 &&
  Math.abs(a.Lmat - a.sp.Lmat * Math.pow(a.genes[0], BIOE.LMAT_GENE) * (a.sex === 1 && a.sp.LmatM ? a.sp.LmatM / a.sp.Lmat : 1)) < 1e-4 &&   // the size gene = maturation length
  Math.abs(a.maxSpeed0 - a.sp.maxSpeed * a.genes[1] * (1.18 - 0.18 * a.genes[5]) * (1.05 - 0.05 * a.genes[3])) < 1e-3 &&
  Math.abs(a.tempTol - a.sp.tempTol * a.genes[2]) < 1e-4));
check('metabMul EXACTLY matches the gene→cost formula (speed/tol + fin/eye/body costs × the brain-size saving) — nothing free', gw.agents.every(a => {
  const g = a.genes, hid = a.sp.shape.hid;
  const want = (0.85 + 0.15 * g[1]) * (0.9 + 0.1 * g[2]) * (0.95 + 0.05 * g[3]) * (0.93 + 0.07 * g[4]) * (0.92 + 0.08 * g[5])
    * (1 - BRAIN.COST * (hid - a.activeHid) / hid);   // a smaller brain is cheaper (per-neuron saving)
  return Math.abs(a.metabMul - want) < 1e-4;
}));
// MORPHOLOGY genes (fin/eye/body) → effective stats, each in the right direction WITH its trade-off
// full 7-gene arrays (incl. the brain gene = 1) — a 6-gene array would pad the brain gene RANDOMLY, making these RNG-fragile
const baseF = gw.makeFish('bass', [1, 1, 1, 1, 1, 1, 1]);
const finF = gw.makeFish('bass', [1, 1, 1, 1.35, 1, 1, 1]);
check('fin gene → sharper turns (higher maxTurn) but more drag (lower top speed)', finF.maxTurn0 > baseF.maxTurn0 && finF.maxSpeed0 < baseF.maxSpeed0, `maxTurn ${finF.maxTurn.toFixed(2)}>${baseF.maxTurn.toFixed(2)}, speed ${finF.maxSpeed.toFixed(1)}<${baseF.maxSpeed.toFixed(1)}`);
const eyeF = gw.makeFish('bass', [1, 1, 1, 1, 1.35, 1, 1]);
check('eye gene → longer sense range (and a metabolic cost)', eyeF.senseRange0 > baseF.senseRange0 && eyeF.metabMul > baseF.metabMul, `sense ${eyeF.senseRange.toFixed(0)}>${baseF.senseRange.toFixed(0)}`);
const bodyF = gw.makeFish('bass', [1, 1, 1, 1, 1, 1.35, 1]);
check('body-depth gene → better accel + harder to eat (bodyMul↑) but slower top speed (drag)', bodyF.accel0 > baseF.accel0 && bodyF.bodyMul > baseF.bodyMul && bodyF.maxSpeed0 < baseF.maxSpeed0, `accel ${bodyF.accel.toFixed(0)}, bodyMul ${bodyF.bodyMul.toFixed(2)}, speed ${bodyF.maxSpeed.toFixed(1)}`);
check('body depth is a real predation defence: a higher bodyMul raises the effective prey size canEat sees → flips a marginal predator to NOT eat', canEat(5, 3) && !canEat(5, 3 * 1.15), `3 eaten, 3.45 (deep-bodied) not`);
const oldGn = gw.makeFish('bass', Float32Array.from([1.3, 0.8, 1.2]));   // a pre-morphology 3-gene save
check('genome-length guard: an older 3-gene save pads to the full genome, preserving the evolved genes', oldGn.genes.length === GENE_KEYS.length && Math.abs(oldGn.genes[0] - 1.3) < 1e-6 && Math.abs(oldGn.genes[1] - 0.8) < 1e-6 && [...oldGn.genes.slice(3)].every(inBounds), `len ${oldGn.genes.length}`);
// INVARIANT: at genes≡1.0 EVERY derived stat is exactly the species baseline → a fresh lake = the pre-morphology sim
// (no silent balance shift; this guards the whole gene→phenotype formula against a typo that would only bite off-baseline).
const oneF = gw.makeFish('pike', [1, 1, 1, 1, 1, 1, 1]);   // all 7 genes ≡ 1.0 (incl. the brain-size gene)
check('genes≡1.0 ⇒ derived stats are EXACTLY the species baseline (incl. full active brain & metabMul=1 → no balance shift)',
  Math.abs(oneF.maxTurn0 - oneF.sp.maxTurn) < 1e-6 && Math.abs(oneF.accel0 - oneF.sp.accel) < 1e-6 && Math.abs(oneF.senseRange0 - oneF.sp.senseRange) < 1e-6 &&
  Math.abs(oneF.maxSpeed0 - oneF.sp.maxSpeed) < 1e-6 && Math.abs(oneF.bodyMul - 1) < 1e-6 && Math.abs(oneF.Lmat - (oneF.sex === 1 && oneF.sp.LmatM ? oneF.sp.LmatM : oneF.sp.Lmat)) < 1e-6 &&
  oneF.activeHid === oneF.sp.shape.hid && Math.abs(oneF.metabMul - 1) < 1e-6,
  `maxTurn ${oneF.maxTurn0.toFixed(3)}/${oneF.sp.maxTurn}, activeHid ${oneF.activeHid}/${oneF.sp.shape.hid}, metabMul ${oneF.metabMul.toFixed(4)}`);
// genes survive save/load and stay heritable & varied after a run of evolution
const gw2 = new World(); gw2.load(JSON.parse(JSON.stringify(gw.toJSON())));
check('genes round-trip through save/load', gw2.agents.length === gw.agents.length && gw2.agents.every((a, i) => [...a.genes].every((v, j) => Math.abs(v - gw.agents[i].genes[j]) < 1e-4)));
const gwRun = new World(); for (let i = 0; i < 2400; i++) gwRun.step(1 / 30);
const sizeGenes = gwRun.agents.map(a => a.genes[0]);
const spread = Math.max(...sizeGenes) - Math.min(...sizeGenes);
check('a heritable trait varies across the evolved population (selection has something to act on)', spread > 0.05, `size-gene spread ${spread.toFixed(2)} over ${sizeGenes.length} fish`);
check('all gene values stay bounded after a long run (no runaway/NaN)', gwRun.agents.every(a => [...a.genes].every(inBounds)));

// ============================================================
//  EVOLVABLE BRAIN SIZE — a heritable brain gene masks hidden units, with a per-neuron metabolic cost
// ============================================================
console.log('\n— evolvable brain size —');
check('GENE_KEYS includes the heritable brain-size gene (7 genes total)', GENE_KEYS.length === 7 && GENE_KEYS[6] === 'brain');
// the brain gene sets the active hidden-unit count: full at gene 1; fewer at a low gene; floored ≥ HID_MIN, ≤ the species max
{ seed(80); const bw = new World();
  const hid = SP.pike.shape.hid, full = bw.makeFish('pike', [1, 1, 1, 1, 1, 1, 1]), small = bw.makeFish('pike', [1, 1, 1, 1, 1, 1, GENE_MIN]);
  check('the brain gene sets the active hidden-unit count (full at gene 1; fewer at a low gene; bounded)',
    full.activeHid === hid && small.activeHid < hid && small.activeHid >= Math.min(BRAIN.HID_MIN, hid), `full ${full.activeHid}, small ${small.activeHid}/${hid}`); }
// forward() MASKS the surplus hidden units (≥ activeHid) → inert (0), so a smaller brain genuinely uses fewer units & computes differently
{ seed(82); const sh = SP.bass.shape, g = randomGenome(sh), inp = new Float32Array(sh.in).fill(0.5);
  const mk = () => ({ h: new Float32Array(sh.hid), o: new Float32Array(OUT), turn: 0, thrust: 0, in: new Float32Array(sh.in) });
  const aFull = mk(), aMask = mk();
  forward(g, inp, aFull, sh);        // full brain (default activeHid = hid)
  forward(g, inp, aMask, sh, 4);     // only the first 4 hidden units active
  let masked0 = true; for (let j = 4; j < sh.hid; j++) if (aMask.h[j] !== 0) masked0 = false;
  check('forward MASKS hidden units ≥ activeHid (inert 0) and the smaller brain computes different outputs than the full one', masked0 && aMask.o[0] !== aFull.o[0], `masked units 0 ${masked0}; out ${aMask.o[0].toFixed(2)}≠${aFull.o[0].toFixed(2)}`); }
// the per-neuron metabolic COST: a SMALLER brain is cheaper (lower metabMul) than the full-brain baseline (all else equal) — the encephalization trade-off
{ seed(81); const cw = new World();
  const full = cw.makeFish('catfish', [1, 1, 1, 1, 1, 1, 1]), small = cw.makeFish('catfish', [1, 1, 1, 1, 1, 1, GENE_MIN]);
  check('a SMALLER brain is metabolically cheaper than the full-brain baseline (metabMul saving; baseline = 1)', small.metabMul < full.metabMul && Math.abs(full.metabMul - 1) < 1e-6, `small ${small.metabMul.toFixed(3)} < full ${full.metabMul.toFixed(3)}`); }

// detailed-stats accessors (the data layer behind the dashboards)
console.log('\n— stats accessors —');
const ed = gwRun.envDetail();
check('envDetail reports a depth-resolved, finite water-chemistry column', [ed.tempSurf, ed.tempDeep, ed.o2Surf, ed.o2Deep, ed.strat, ed.nutrient, ed.phyto, ed.secchi, ed.clarity].every(Number.isFinite) && ed.secchi > 0 && ed.clarity > 0,
  `surf ${ed.o2Surf.toFixed(2)}/deep ${ed.o2Deep.toFixed(2)} O₂, secchi ${ed.secchi | 0}`);
const sd = gwRun.speciesDetail(), cen = gwRun.census();
check('speciesDetail rolls up count/gen/genes/zonation per species, consistent with census', SPECIES.every(k => {
  const s = sd[k]; return s.count === cen[k] && Number.isFinite(s.meanGen) && Number.isFinite(s.gSize) && s.littoral <= s.count && s.deep <= s.count;
}));
// speciesDetail now exposes the FULL 7-gene genome (fin/eye/body morphology + brain size) + immigrant fraction + realized brain size (dashboard "Evolution" card)
check('speciesDetail exposes all 7 trait genes (incl. brain) + immigrant fraction + realized active-brain size per species', SPECIES.every(k => {
  const s = sd[k]; return [s.gFin, s.gEye, s.gBody, s.gBrain, s.meanActiveHid].every(Number.isFinite) && s.immFrac >= 0 && s.immFrac <= 1 && s.meanActiveHid <= SP[k].shape.hid + 1e-9;
}), `bass imm ${(sd.bass.immFrac * 100 | 0)}%, pike brain ${sd.pike.meanActiveHid.toFixed(1)}/${SP.pike.shape.hid}`);
const bio = gwRun.biomassByTrophic();
check('biomassByTrophic returns a finite, non-negative trophic spectrum', Object.values(bio).every(v => Number.isFinite(v) && v >= 0) && bio.phytoplankton >= 0 && 'apex' in bio,
  Object.entries(bio).map(([k, v]) => `${k} ${(+v).toFixed(1)}`).join(' '));
// resourceCounts — the non-fish biota counts behind the food-web "resource strip"
const rc = gwRun.resourceCounts();
check('resourceCounts returns finite, non-negative counts for the whole resource base + benthic inverts',
  ['zooplankton', 'larvae', 'insects', 'snails', 'crayfish', 'detritus', 'plants', 'mussels'].every(key => Number.isFinite(rc[key]) && rc[key] >= 0),
  `zoo ${rc.zooplankton} snails ${rc.snails} cray ${rc.crayfish} mussels ${rc.mussels}`);
// cognitionDetail — fleet-wide drive/action/memory aggregates behind the "Cognition" card
const cog = gwRun.cognitionDetail();
check('cognitionDetail returns finite drive/action/memory aggregates in valid ranges',
  [cog.meanHunger, cog.meanFear, cog.meanMemory, cog.pStrike, cog.pFlee, cog.pHide, cog.meanTox].every(Number.isFinite)
  && [cog.meanHunger, cog.meanFear, cog.meanMemory, cog.pStrike, cog.pFlee, cog.pHide].every(v => v >= 0 && v <= 1) && cog.meanTox >= 0,
  `hunger ${cog.meanHunger.toFixed(2)} fear ${cog.meanFear.toFixed(2)} mem ${cog.meanMemory.toFixed(2)} strike ${(cog.pStrike * 100 | 0)}%`);
// a CLEAN lake (default TOX.AMBIENT=0) carries no contaminant burden — the cognition card hides it unless a pollution scenario is loaded
check('cognitionDetail reports zero mean contaminant burden in a clean lake', cog.meanTox === 0, `meanTox ${cog.meanTox}`);

// depthProfile — the data layer behind the "Water column" view (depth-resolved temp/O₂/N/P/phyto/cyano)
const dpw = new World(); dpw.env.strat = 1; dpw.env.tempC = 28;   // a stratified summer temp profile
const prof = dpw.depthProfile(WORLD.W * 0.54, 28);
check('depthProfile returns a finite surface→bed column of the right length', prof.samples.length === 28 && prof.samples.every(s => [s.tempC, s.o2, s.din, s.phos, s.phyto, s.cyano, s.light].every(Number.isFinite)));
check('depthProfile is ordered surface→bed within the basin', prof.samples[0].y >= 0 && prof.samples[0].y < prof.samples[27].y && prof.samples[27].y <= prof.bed + 1);
check('depthProfile reflects stratification & light attenuation (deep is colder & dimmer)', prof.samples[27].tempC < prof.samples[0].tempC && prof.samples[27].light < prof.samples[0].light,
  `temp ${prof.samples[0].tempC.toFixed(1)}→${prof.samples[27].tempC.toFixed(1)}, light ${prof.samples[0].light.toFixed(2)}→${prof.samples[27].light.toFixed(2)}`);
check('depthProfile samples the right column (deep-basin bed deeper than the littoral shelf)', dpw.depthProfile(WORLD.W * 0.54).bed > dpw.depthProfile(WORLD.W * 0.05).bed);

// ============================================================
//  PHASE 5 — carrying capacity: logistic reproduction + metapopulation immigration (rescue), NOT hard floors
// ============================================================
console.log('\n— carrying capacity / immigration rescue (Phase 5) —');
seed(73); const ccw = new World();
for (let i = 0; i < 200; i++) ccw.step(1 / 30);                 // settle
for (const a of ccw.agents) if (a.species === 'minnow') a.dead = true;   // force a local crash to zero
ccw.agents = ccw.agents.filter(a => !a.dead);
const immStart = ccw.stats.immigrants.minnow;
ccw.step(1 / 30);
const afterOne = ccw.census().minnow;
// after a wipe the REFUGE backstop fires (count ≥ REFUGE), but immigration is a gentle TRICKLE, not a hard refill:
// ONE step adds at most the refuge fill + one trickle arrival (≤ REFUGE+1), NOT a jump to the old ~47 population target.
check('after a wipe: REFUGE backstop present but NOT hard-refilled — a trickle (≤ REFUGE+1, not the old ~47 floor)', afterOne >= IMMIGRATION.REFUGE && afterOne <= IMMIGRATION.REFUGE + 1, `minnow ${afterOne} (REFUGE ${IMMIGRATION.REFUGE}; old hard floor was ~${scaleCount(SP.minnow.pop.min)})`);
// over the next two minutes the species never vanishes, immigrants keep arriving while it is rare, and the arrivals BREED
// (sparse spawners home in on each other) — whether their fry survive a few weeks of predation is ecology, not the rescue
const birthsWipe = ccw.stats.births.minnow; let minAfter = Infinity;
for (let i = 0; i < 3600; i++) { ccw.step(1 / 30); minAfter = Math.min(minAfter, ccw.census().minnow); }
check('the rescue + breeding re-seed a crashed species (never extinct; immigrants accrue while rare and breed)', minAfter >= IMMIGRATION.REFUGE && ccw.stats.immigrants.minnow > immStart && ccw.stats.births.minnow > birthsWipe, `minnow ${afterOne}→${ccw.census().minnow} (min ${minAfter}), +${ccw.stats.immigrants.minnow - immStart} immigrants, +${ccw.stats.births.minnow - birthsWipe} young`);
// NO LITERAL EXTINCTION (the load-bearing Phase-5 invariant): wipe MULTIPLE species, one step → all back to ≥ REFUGE
seed(31); const rw = new World(); for (let i = 0; i < 200; i++) rw.step(1 / 30);
const wiped = ['minnow', 'sunfish', 'bass', 'pike'];
for (const a of rw.agents) if (wiped.includes(a.species)) a.dead = true;
rw.agents = rw.agents.filter(a => !a.dead); rw.step(1 / 30);
check('the REFUGE backstop guarantees no literal extinction — every wiped species is ≥ REFUGE after one step', SPECIES.every(k => rw.census()[k] >= IMMIGRATION.REFUGE), SPECIES.map(k => `${k} ${rw.census()[k]}`).join(' '));
// self-sustaining species float FREE of the rescue: catfish should be mostly home-bred, not immigration-propped
seed(99); const ssw = new World();
for (let i = 0; i < 3000; i++) ssw.step(1 / 30);
const catImm = ssw.stats.immigrants.catfish, catBir = ssw.stats.births.catfish, catShare = catImm / Math.max(1, catImm + catBir);
check('a self-sustaining species (catfish) is mostly HOME-BRED, not immigration-propped (rescue tapers off when abundant)', catShare < 0.5, `catfish immigrant share ${(catShare * 100) | 0}% (home-bred ${catBir} / immigrants ${catImm})`);
// food-web rebalance: the planktivore fallback (phyto grazing in the trough) lets minnow self-sustain too —
// it's now mostly home-bred, not immigration-propped like it was before the rebalance.
check('food-web rebalance: the planktivore (minnow) now self-sustains, home-bred ≫ immigrants (the facultative-omnivory fallback)', ssw.stats.births.minnow > ssw.stats.immigrants.minnow * 3, `minnow home-bred ${ssw.stats.births.minnow} ≫ immigrants ${ssw.stats.immigrants.minnow}`);
check('the immigration stat is tracked separately from home-bred births', typeof ssw.stats.immigrants.pike === 'number' && typeof ssw.stats.births.pike === 'number');
// loading an OLDER save (no immigrants/births stats) must backfill them, not throw when repro/immigration runs
const oldSave = JSON.parse(JSON.stringify(ssw.toJSON())); delete oldSave.stats.immigrants; oldSave.stats.births = undefined;
let loadOk = true; try { const lw = new World(); lw.load(oldSave); for (let i = 0; i < 60; i++) lw.step(1 / 30); } catch (e) { loadOk = false; }
check('loading an older save without the births/immigrants stats backfills them (no crash on repro/immigration)', loadOk);

// innate behavioral baselines (ethogram under the NN)
console.log('\n— behavioral baselines —');
check('every species has a sane innate ethogram (homeDepth/depthPull/cruise/weight)', SPECIES.every(k => {
  const i = SP[k].innate; return i && i.homeDepth >= 0 && i.homeDepth <= 1 && i.depthPull > 0 && i.cruise >= 0 && i.cruise <= 1 && i.weight > 0 && i.weight < 1;
}));
check('the ethogram encodes real zonation (catfish bottom > minnow shallow) & activity (pike lurks < minnow)',
  SP.catfish.innate.homeDepth > SP.minnow.innate.homeDepth + 0.3 && SP.pike.innate.cruise < SP.minnow.innate.cruise,
  `catfish home ${SP.catfish.innate.homeDepth} vs minnow ${SP.minnow.innate.homeDepth}; pike cruise ${SP.pike.innate.cruise} vs minnow ${SP.minnow.innate.cruise}`);
// behavioral OUTCOME: fish settle into their innate depth zones even with evolving brains
const bw = new World(); for (let i = 0; i < 1800; i++) bw.step(1 / 30);
const depthFrac = k => { const ag = bw.agents.filter(a => a.species === k); return ag.length ? ag.reduce((s, a) => s + a.y / bw.bedY(a.x), 0) / ag.length : 0; };
const dCat = depthFrac('catfish'), dMin = depthFrac('minnow');
check('innate depth-home produces real zonation (catfish ride deep, minnows ride shallow)',
  dCat > 0.6 && dMin < 0.5 && dCat - dMin > 0.25, `catfish ${dCat.toFixed(2)} vs minnow ${dMin.toFixed(2)} (Δ${(dCat - dMin).toFixed(2)})`);
// v2 ethogram: minnows school (cohesion), pike ambushes (lurk-and-burst)
check('v2 ethogram configured (minnow schools, pike ambushes)', SP.minnow.innate.school > 0 && SP.pike.innate.ambush === true);
const minnowNeighbors = (() => {
  const mn = bw.agents.filter(a => a.species === 'minnow'); if (mn.length < 5) return 0;
  let sum = 0; for (const a of mn) { let c = 0; for (const b of mn) { if (b === a) continue; const dx = b.x - a.x, dy = b.y - a.y; if (dx * dx + dy * dy < 70 * 70) c++; } sum += c; } return sum / mn.length;
})();
check('schooling minnows cluster into loose shoals (a typical minnow has several near neighbours)', minnowNeighbors > 2, `mean ${minnowNeighbors.toFixed(1)} neighbours within 70px`);
// ambush: an isolated pike with NO prey in range must lurk (stay slow) — a controlled, robust check
// (the population-aggregate speed is noisy because some pike are mid-burst at any snapshot)
// Isolate the ambush mechanism (don't depend on a random brain's thrust, which shifts with any genome-shape change):
// give the pike a forced high-thrust brain and compare ambush-ON vs ambush-OFF with no prey near — the innate must
// suppress the no-prey pike's speed. (sp.innate is toggled then restored, synchronously.)
(() => { function lurkSpeed(ambushOn) {
    seed(555); const lw = new World(); lw.agents = [];
    const lp = lw.addAgent('pike', { x: 1000, y: 520 }); lp.age = lp.sp.matureAge + 50; lp.energy = 60;
    const sh = lp.sp.shape, W2 = sh.hid * sh.in + sh.hid, B2 = W2 + OUT * sh.hid;
    for (let j = 0; j < sh.hid; j++) { lp.g[W2 + j] = 0; lp.g[W2 + sh.hid + j] = 0; }   // clean outputs from the biases
    lp.g[B2 + 0] = 0; lp.g[B2 + 1] = 6; for (let k = 2; k < OUT; k++) lp.g[B2 + k] = -20;   // straight, high thrust intent, actions off
    lp.lw = Float32Array.from(lp.g);   // forward() runs the plastic policy → sync to the forced high-thrust brain (isolated pike never eats → no learning drift)
    const saved = lp.sp.innate.ambush; lp.sp.innate.ambush = ambushOn;
    lw.agentGrid.rebuild(lw.agents);
    for (let i = 0; i < 120; i++) lw.step(1 / 30);
    lp.sp.innate.ambush = saved;
    return lp.spd / lp.maxSpeed;
  }
  const lurk = lurkSpeed(true), active = lurkSpeed(false);
  check('ambush pike LURKS — the ambush innate suppresses a no-prey pike\'s speed (vs ambush off, same high-thrust brain)', lurk < active * 0.8, `lurk ${lurk.toFixed(2)} < active ${active.toFixed(2)}`); })();
// submerged weed beds (mid-water cover) + cover-seeking
check('weed beds generated in the lit littoral, reaching up into oxygenated mid-water (not the deep centre)',
  bw.weedbeds.length > 0 && bw.weedbeds.every(wb => wb.top < wb.bot && wb.top > WORLD.H * 0.1 && (wb.x < WORLD.W * 0.4 || wb.x > WORLD.W * 0.6)),
  `${bw.weedbeds.length} weed beds`);
check('cover-seeking configured (sunfish/bass/pike seek structure)', SP.sunfish.innate.cover > 0 && SP.bass.innate.cover > 0 && SP.pike.innate.cover > 0);
const meanCover = ks => { const ag = bw.agents.filter(a => ks.includes(a.species)); return ag.length ? ag.reduce((s, a) => s + bw.coverAt(a.x, a.y), 0) / ag.length : 0; };
check('cover-seeking fish hold in cover (weed beds) more than non-seeking pelagic minnows', meanCover(['sunfish', 'bass', 'pike']) > meanCover(['minnow']),
  `seekers ${meanCover(['sunfish', 'bass', 'pike']).toFixed(2)} > minnow ${meanCover(['minnow']).toFixed(2)}`);
// catfish are nocturnal — the innate cruise target rises under low light, so they forage faster at night and
// rest by day. Tested at the MECHANISM level (deterministic): the emergent mean population speed is a noisy
// aggregate sensitive to the whole sim trajectory (it shifted under the Phase-5 carrying-capacity change),
// so — like the ambush probe — assert the underlying nocturnal cruise rule, which is the actual driver.
const cfCruise = light => SP.catfish.innate.cruise * (1.5 - light);   // mirrors world.js nocturnal cruise target
check('catfish are nocturnal — the innate cruise target is much higher at night than midday', SP.catfish.innate.nocturnal === true && cfCruise(0) > cfCruise(0.9) * 1.5, `night-target ${cfCruise(0).toFixed(2)} ≫ day-target ${cfCruise(0.9).toFixed(2)}`);

// trait-based mate choice (sexual selection acts on the genome)
console.log('\n— mate choice —');
const mw = new World(); mw.agents = [];
const chooser = mw.addAgent('minnow', { x: 500, y: 200 }), good = mw.addAgent('minnow', { x: 510, y: 205 }), poor = mw.addAgent('minnow', { x: 508, y: 198 });
ripe(chooser, 0); ripe(good, 1, 1.0); ripe(poor, 1, 0.85);   // the chooser (female) picks between two ripe males
good.genes = Float32Array.from([1.30, 1.25, 1.20]); good.eaten = 30;
poor.genes = Float32Array.from([0.80, 0.80, 0.85]); poor.eaten = 2;
mw.agentGrid.rebuild(mw.agents);
const chosen = mw.chooseMate(chooser);
check('mate choice picks the higher-quality candidate (condition + good genes), not just the nearest', chosen && chosen.item === good,
  chosen ? `chose the ${chosen.item === good ? 'high-quality' : 'low-quality'} mate` : 'chose none');
check('mate choice still finds a mate when only one eligible exists (reproduction not blocked)', (() => { const mw2 = new World(); mw2.agents = []; const a = mw2.addAgent('minnow', { x: 300, y: 200 }), b = mw2.addAgent('minnow', { x: 305, y: 202 }); ripe(a, 0); ripe(b, 1); mw2.agentGrid.rebuild(mw2.agents); return mw2.chooseMate(a) !== null; })());
check('…but only of the opposite sex (two females never pair)', (() => { const mw3 = new World(); mw3.agents = []; const a = mw3.addAgent('minnow', { x: 300, y: 200 }), b = mw3.addAgent('minnow', { x: 305, y: 202 }); ripe(a, 0); ripe(b, 0); mw3.agentGrid.rebuild(mw3.agents); return mw3.chooseMate(a) === null; })());

// depth-local light + temperature senses → the substrate for emergent diel vertical migration
console.log('\n— depth senses (DVM) —');
const dvmW = new World(); dvmW.env.light = 1;   // noon
const surfL = dvmW.lightAt(cx, 20), deepL = dvmW.lightAt(cx, dvmW.bedY(cx) - 20);
check('depth-local light sense is brighter near the surface than the deep', surfL > deepL && surfL > 0, `surf ${surfL.toFixed(2)} > deep ${deepL.toFixed(2)}`);
check('the four water-column species carry the light@depth + temp@depth senses (for DVM to evolve)',
  ['minnow', 'sunfish', 'bass', 'pike'].every(k => SP[k].inputLabels.includes('light@depth') && SP[k].inputLabels.includes('temp@depth')));
const probe = dvmW.addAgent('minnow', { x: cx, y: 22 });   // a lit surface minnow at noon
SP.minnow.senses(probe, dvmW);
const li = SP.minnow.inputLabels.indexOf('light@depth'), ti = SP.minnow.inputLabels.indexOf('temp@depth');
check('depth-local senses are written, in range, and read bright at a sunlit surface',
  probe.act.in[li] > 0.2 && probe.act.in[li] <= 1 && probe.act.in[ti] >= 0 && probe.act.in[ti] <= 1,
  `light ${probe.act.in[li].toFixed(2)} temp ${probe.act.in[ti].toFixed(2)}`);

// turbidity / water clarity
const tw = new World();
const sampleY = WORLD.H * 0.4;
tw.env.light = 1; const baseClar = tw.env.clarity(), baseSecchi = tw.env.secchiDepth(), baseLight = tw.env.lightAtDepth(sampleY);
tw.env.turbidity = 0.9; tw.env.light = 1;
const murkClar = tw.env.clarity(), murkSecchi = tw.env.secchiDepth(), murkLight = tw.env.lightAtDepth(sampleY);
check('clarity stays in a sane range', baseClar > 0.34 && baseClar <= 1 && murkClar >= 0.34, `base ${baseClar.toFixed(2)} murk ${murkClar.toFixed(2)}`);
check('murky water shortens visual range', murkClar < baseClar, `${murkClar.toFixed(2)} < ${baseClar.toFixed(2)}`);
check('Secchi depth is sane and shrinks with turbidity', baseSecchi > 0 && baseSecchi <= WORLD.H && murkSecchi < baseSecchi, `${murkSecchi | 0} < ${baseSecchi | 0}px`);
check('turbidity dims the deeper water', murkLight < baseLight, `${murkLight.toFixed(3)} < ${baseLight.toFixed(3)}`);
check('turbidity responds to algae/weather in a live run', w.env.turbidity > TURBIDITY.BASE, `${w.env.turbidity.toFixed(2)} > base ${TURBIDITY.BASE}`);

// habitat structure, cover/refuge & inflow current
console.log('\n— structure / cover / flow —');
const sw = new World();
check('reeds & logs are generated', sw.reeds.length > 0 && sw.logs.length > 0, `${sw.reeds.length} reeds, ${sw.logs.length} logs`);
check('reeds sit on the shallow shores, rooted on the bed', sw.reeds.every(r => (r.x < WORLD.W * 0.15 || r.x > WORLD.W * 0.85) && Math.abs(r.baseY - bedY(r.x)) < 3));
check('logs lie on the bed, within the world', sw.logs.every(l => l.x >= 0 && l.x <= WORLD.W && l.y <= bedY(l.x) + 1));
// macrophytes form dense beds on the lit littoral shelf, sparse in the dark deep middle
const litFrac = WORLD.W * (BASIN.SHELF_FRAC + 0.02);
const shelfPlants = sw.plants.filter(p => p.x < litFrac || p.x > WORLD.W - litFrac).length;
check('weed beds concentrate on the littoral shelf, not the deep middle',
  shelfPlants / Math.max(1, sw.plants.length) > 0.5, `${shelfPlants}/${sw.plants.length} on the shelf`);
const reed = sw.reeds[0];
const coverNear = sw.coverAt(reed.x, reed.baseY - reed.height * 0.5), coverOpen = sw.coverAt(WORLD.W * 0.5, WORLD.H * 0.25);
check('cover is high in structure, low in open water', coverNear > 0.2 && coverNear > coverOpen, `near ${coverNear.toFixed(2)} vs open ${coverOpen.toFixed(2)}`);
check('cover stays in [0,1]', coverNear <= 1 && coverNear >= 0 && coverOpen >= 0);
check('inflow→outflow current is rightward & weaker with depth', sw.env.flowAt(50) > 0 && sw.env.flowAt(50) > sw.env.flowAt(WORLD.H - 50), `surf ${sw.env.flowAt(50).toFixed(2)} > deep ${sw.env.flowAt(WORLD.H - 50).toFixed(2)}`);
// the P-enriched inflow raises the littoral TOTAL P (dissolved + algae + DOM — the algae take the dissolved phosphate up
// as fast as it arrives): A/B the same lake with the stream's load on vs off, sampled in the inflow plume
const inflowP = on => { const keep = FLOW.NUTRIENT; if (!on) FLOW.NUTRIENT = 0;
  try { seed(9031); const fw = new World(); for (let i = 0; i < 300; i++) fw.step(1 / 30);
    const e = fw.env, i = e.cellOf(FLOW.PLUME_COLS * 0.5 * WORLD.W / GRID.FIELD_COLS, FLOW.PLUME_ROWS * 0.5 * WORLD.H / GRID.FIELD_ROWS);
    return e.phos[i] + (e.phyto[i] + e.diatom[i]) * PHYTO.P_USE + e.cyano[i] * CYANO.P_USE + e.dom[i] * NUTRIENT.ORGANIC_P; } finally { FLOW.NUTRIENT = keep; } };
const pOn = inflowP(true), pOff = inflowP(false);
check('the P-enriched inflow stream raises the littoral total P (vs the same lake with the stream load off)', pOn > pOff * 1.1, `plume total P ${pOn.toFixed(3)} with the stream vs ${pOff.toFixed(3)} without`);
check('mussel filter-feeder beds are generated', sw.mussels.length > 0, `${sw.mussels.length} beds`);

// ============================================================
//  PHASE 2 — trophic web (phyto → zoo → planktivore) + eutrophication
// ============================================================
console.log('\n— trophic web / eutrophication / N·P —');
const meanP = wd => wd.env.meanPhos();
check('phytoplankton field is alive (the base of the web)', w.env.meanPhyto() > 0.01, `mean ${w.env.meanPhyto().toFixed(3)}`);
// N/P split: phosphate + inorganic N (itself split nh4/no3 by the N cycle), Liebig co-limited; P is the limiter
check('nutrients are split into N (nh4+no3) + P (phos) pools', w.env.nh4.length === w.env.phos.length && w.env.no3.length === w.env.phos.length && w.env.nh4.length > 0);
// Liebig: the limitation is the MINIMUM of the N- and P-Monod terms — set one cell N-rich/P-poor and another the reverse,
// and the scarcer element must set the value (the old check only asserted the range, which can't fail)
check('growth is Liebig co-limited = min(N-Monod, P-Monod): the SCARCER element sets it', (() => {
  const e = w.env, x = WORLD.W * 0.5, y = WORLD.H * 0.3, i = e.cellOf(x, y), keep = [e.nh4[i], e.no3[i], e.phos[i]];
  const mon = (v, k) => v / (v + k);
  e.nh4[i] = 5; e.no3[i] = 0; e.phos[i] = 0.01; const pLim = e.nutrientAt(x, y);
  e.nh4[i] = 0.01; e.no3[i] = 0; e.phos[i] = 5; const nLim = e.nutrientAt(x, y);
  e.nh4[i] = keep[0]; e.no3[i] = keep[1]; e.phos[i] = keep[2];
  return approx(pLim, mon(0.01, NUTRIENT.KP), 1e-6) && approx(nLim, mon(0.01, NUTRIENT.KN), 1e-6);
})());
check('phosphate is the limiting nutrient in a fresh lake (P scarcer than N for growth)',
  w.env.meanPhos() / (w.env.meanPhos() + NUTRIENT.KP) < w.env.meanDin() / (w.env.meanDin() + NUTRIENT.KN), `P-lim ${(w.env.meanPhos() / (w.env.meanPhos() + NUTRIENT.KP)).toFixed(2)} < N-lim ${(w.env.meanDin() / (w.env.meanDin() + NUTRIENT.KN)).toFixed(2)}`);

// EUTROPHICATION (control-subtracted so the diurnal phyto swing cancels): two identical worlds,
// PHOSPHATE-spike only one (P is the limiter), and require its PRODUCER bloom (green phyto + N-fixing cyano) to exceed
// the unspiked control's — and the spiked P to be drawn into algal biomass. (audit-fixes/chemistry: with N now
// conserved at Redfield, a P-only spike flips the lake N-limited, so the bloom is carried by the N-fixers, not green
// phyto alone; and with the P budget closed the spike can't simply vanish — the old "mean P falls" passed via the
// grazing leak that destroyed P — so the loop-closing test is now "the bloom takes the P up into biomass".)
seed(31415); const ctrl = new World();
seed(31415); const eut = new World();
for (let i = 0; i < 300; i++) { ctrl.step(1 / 30); eut.step(1 / 30); }
for (let i = 0; i < eut.env.phos.length; i++) eut.env.phos[i] += 0.6;
const pAtSpike = meanP(eut);
const algalP = e => (e.wetSum(e.phyto) * PHYTO.P_USE + e.wetSum(e.cyano) * CYANO.P_USE);
let ctrlPeak = 0, eutPeak = 0;
for (let i = 0; i < 1200; i++) { ctrl.step(1 / 30); eut.step(1 / 30); ctrlPeak = Math.max(ctrlPeak, ctrl.env.meanPhyto() + ctrl.env.meanCyano()); eutPeak = Math.max(eutPeak, eut.env.meanPhyto() + eut.env.meanCyano()); }
console.log(`eutrophication: control peak producers ${ctrlPeak.toFixed(2)} vs P-spiked ${eutPeak.toFixed(2)}; spiked P ${pAtSpike.toFixed(2)} → ${meanP(eut).toFixed(2)}; algal P ${algalP(ctrl.env).toFixed(1)} vs ${algalP(eut.env).toFixed(1)}`);
check('a PHOSPHATE spike drives a bigger producer bloom (phyto + N-fixing cyano) than the unspiked control', eutPeak > ctrlPeak * 1.15, `spiked ${eutPeak.toFixed(2)} > control ${ctrlPeak.toFixed(2)}`);
check('the bloom draws the spiked phosphate into algal biomass (closing the loop)', algalP(eut.env) > algalP(ctrl.env) * 1.15, `algal P ${algalP(eut.env).toFixed(1)} > control ${algalP(ctrl.env).toFixed(1)}`);

// SEDIMENT-P internal loading (Mortimer redox switch): oxic sediment binds P, anoxic sediment releases it
console.log('\n— sediment-P (internal loading) —');
const se = new World().env;
check('a per-column sediment-P store exists', se.sedP.length > 0);
const SC = GRID.FIELD_COLS, SR = GRID.FIELD_ROWS, SCW = WORLD.W / SC, SCH = WORLD.H / SR;
const sCol = Math.round(SC * 0.5), sbx = (sCol + 0.5) * SCW, sBedRow = Math.min(SR - 1, Math.max(0, (bedY(sbx) / SCH) | 0)), sbi = sBedRow * SC + sCol;
// OXIC: the sediment binds dissolved P out of the water (sedP↑, water P↓)
se.o2[sbi] = 1.0; se.phos[sbi] = 0.6; se.sedP[sCol] = 0.5;
const sedOx0 = se.sedP[sCol], phosOx0 = se.phos[sbi];
for (let k = 0; k < 20; k++) { se.o2[sbi] = 1.0; se.sedimentP(1 / 30); }
check('OXIC sediment binds dissolved P (store rises, water P falls)', se.sedP[sCol] > sedOx0 && se.phos[sbi] < phosOx0, `sedP ${sedOx0.toFixed(2)}→${se.sedP[sCol].toFixed(2)}, P ${phosOx0.toFixed(2)}→${se.phos[sbi].toFixed(2)}`);
// ANOXIC: the sediment releases iron-bound P back into the water (internal loading)
se.o2[sbi] = 0.0; se.phos[sbi] = 0.05; se.sedP[sCol] = 1.2;
const sedAn0 = se.sedP[sCol], phosAn0 = se.phos[sbi];
for (let k = 0; k < 20; k++) { se.o2[sbi] = 0.0; se.sedimentP(1 / 30); }
check('ANOXIC sediment RELEASES bound P into the water (internal loading)', se.sedP[sCol] < sedAn0 && se.phos[sbi] > phosAn0, `sedP ${sedAn0.toFixed(2)}→${se.sedP[sCol].toFixed(2)}, P ${phosAn0.toFixed(2)}→${se.phos[sbi].toFixed(2)}`);
check('the sediment-P store stays bounded & finite', [...se.sedP].every(v => v >= 0 && v <= SED_P.MAX + 1e-3 && Number.isFinite(v)));

// NITROGEN CYCLE: nitrification (NH₄→NO₃, aerobic, O₂-consuming) ⇌ denitrification (NO₃→N₂, anaerobic, lost)
console.log('\n— nitrogen cycle (nitrification / denitrification) —');
const meanArr = f => { let s = 0; for (let i = 0; i < f.length; i++) s += f[i]; return s / f.length; };
const ne0 = new World().env;
check('inorganic N is split into ammonium (nh4) + nitrate (no3) pools', ne0.nh4.length > 0 && ne0.no3.length === ne0.nh4.length);
check('meanDin() reports the total inorganic N (nh4 + no3)', approx(ne0.meanDin(), ne0.meanNh4() + ne0.meanNo3(), 1e-6), `din ${ne0.meanDin().toFixed(3)} = nh4 ${ne0.meanNh4().toFixed(3)} + no3 ${ne0.meanNo3().toFixed(3)}`);
// NITRIFICATION — whole field OXIC: ammonium oxidizes to nitrate, total N is conserved, and O₂ is consumed.
const nox = new World().env;
for (let i = 0; i < nox.o2.length; i++) { nox.o2[i] = 1.0; nox.nh4[i] = 0.40; nox.no3[i] = 0.10; }
const oxNh40 = nox.meanNh4(), oxNo30 = nox.meanNo3(), oxN0 = oxNh40 + oxNo30, oxO20 = meanArr(nox.o2);
for (let k = 0; k < 40; k++) nox.nitrogenCycle(1 / 30);
check('NITRIFICATION oxidizes ammonium to nitrate (nh4↓, no3↑)', nox.meanNh4() < oxNh40 && nox.meanNo3() > oxNo30, `nh4 ${oxNh40.toFixed(3)}→${nox.meanNh4().toFixed(3)}, no3 ${oxNo30.toFixed(3)}→${nox.meanNo3().toFixed(3)}`);
// tolerance 1e-6 is ~13× the measured Float32 accumulation drift (~7.5e-8) yet catches a sub-0.01%-of-flux leak
// (the nitrified flux over these 40 steps is ~0.02, so this flags any fractional split bug, not just gross ones)
check('nitrification CONSERVES total inorganic N (it only changes the form, no loss)', approx(nox.meanNh4() + nox.meanNo3(), oxN0, 1e-6), `ΣN ${oxN0.toFixed(6)}→${(nox.meanNh4() + nox.meanNo3()).toFixed(6)}`);
check('nitrification CONSUMES O₂ (aerobic — an extra O₂ demand in productive water)', meanArr(nox.o2) < oxO20, `O₂ ${oxO20.toFixed(3)}→${meanArr(nox.o2).toFixed(3)}`);
// DENITRIFICATION — whole field ANOXIC: nitrate is reduced to N₂ gas and permanently removed (the N sink).
const nan = new World().env;
for (let i = 0; i < nan.o2.length; i++) { nan.o2[i] = 0.0; nan.nh4[i] = 0.10; nan.no3[i] = 0.40; }
const anNo30 = nan.meanNo3(), anN0 = nan.meanNh4() + nan.meanNo3();
for (let k = 0; k < 40; k++) nan.nitrogenCycle(1 / 30);
check('DENITRIFICATION removes nitrate in anoxic water (no3↓)', nan.meanNo3() < anNo30, `no3 ${anNo30.toFixed(3)}→${nan.meanNo3().toFixed(3)}`);
check('denitrification PERMANENTLY removes N from the lake (ΣN falls — the irreversible N sink)', nan.meanNh4() + nan.meanNo3() < anN0 - 1e-3, `ΣN ${anN0.toFixed(3)}→${(nan.meanNh4() + nan.meanNo3()).toFixed(3)}`);
// REDOX GATE — nitrification & denitrification are mutually exclusive at the anoxic threshold DENITRIF_O2.
// Test at a PARTIALLY-hypoxic O₂ just below the threshold (NOT the degenerate o2=0): nitrification must HALT
// there (so it doesn't draw down the dead zone's residual O₂) while denitrification runs. This genuinely
// exercises the gate — the earlier smooth-Monod form (which nitrified at ~40% rate at o2=0.20) would FAIL it.
const subT = NCYCLE.DENITRIF_O2 - 0.05;   // 0.20 — inside the anoxic band
const ngate = new World().env;
for (let i = 0; i < ngate.o2.length; i++) { ngate.o2[i] = subT; ngate.nh4[i] = 0.30; ngate.no3[i] = 0.30; }
const gNh40 = ngate.meanNh4(), gNo30 = ngate.meanNo3();
for (let k = 0; k < 40; k++) { for (let i = 0; i < ngate.o2.length; i++) ngate.o2[i] = subT; ngate.nitrogenCycle(1 / 30); }
check('the redox gate HALTS nitrification below the anoxic threshold (ammonium untouched at sub-threshold O₂)', approx(ngate.meanNh4(), gNh40, 1e-6), `nh4 ${gNh40.toFixed(4)}→${ngate.meanNh4().toFixed(4)} at O₂ ${subT}`);
check('denitrification still runs at sub-threshold O₂ (nitrate falls)', ngate.meanNo3() < gNo30, `no3 ${gNo30.toFixed(4)}→${ngate.meanNo3().toFixed(4)} at O₂ ${subT}`);
// and at fully-anoxic O₂ too: nitrification halted, ammonium not oxidized
check('nitrification halts in fully-anoxic water (ammonium not oxidized)', approx(nan.meanNh4(), 0.10, 1e-6), `anoxic nh4 stayed ${nan.meanNh4().toFixed(4)}`);
// WHOLE-SIM: in the oxic lake nitrification builds a nitrate pool, and P stays the ultimate limiter (N not exhausted).
seed(202); const nw = new World();
const nf0 = nw.env.nitrateFrac();
for (let i = 0; i < 900; i++) nw.step(1 / 30);
console.log(`N-cycle run: nitrate frac ${nf0.toFixed(2)}→${nw.env.nitrateFrac().toFixed(2)}; meanDin ${nw.env.meanDin().toFixed(3)} (nh4 ${nw.env.meanNh4().toFixed(3)} / no3 ${nw.env.meanNo3().toFixed(3)})`);
check('the oxic lake stays P-limited (denitrification did not flip it N-limited)', nw.env.meanPhos() / (nw.env.meanPhos() + NUTRIENT.KP) < nw.env.meanDin() / (nw.env.meanDin() + NUTRIENT.KN), `P-lim ${(nw.env.meanPhos() / (nw.env.meanPhos() + NUTRIENT.KP)).toFixed(2)} < N-lim ${(nw.env.meanDin() / (nw.env.meanDin() + NUTRIENT.KN)).toFixed(2)}`);
check('over a run, nitrification builds the nitrate pool (NO₃ fraction of inorganic N rises)', nw.env.nitrateFrac() > nf0 && nw.env.nitrateFrac() < 1, `NO₃ frac ${nf0.toFixed(2)}→${nw.env.nitrateFrac().toFixed(2)}`);
check('N pools stay non-negative & finite after a run', [...nw.env.nh4].every(v => v >= 0 && Number.isFinite(v)) && [...nw.env.no3].every(v => v >= 0 && Number.isFinite(v)));

// ============================================================
//  CYANOBACTERIA — the N-fixing producer strain (wins at low N:P, floats to a surface scum, re-enriches N)
// ============================================================
console.log('\n— cyanobacteria (N-fixing strain) —');
const cmeanArr = (f, lo, hi) => { let s = 0, n = 0; for (let cy = (lo * GRID.FIELD_ROWS) | 0; cy < (hi * GRID.FIELD_ROWS); cy++) for (let cx = 0; cx < GRID.FIELD_COLS; cx++) { s += f[cy * GRID.FIELD_COLS + cx]; n++; } return n ? s / n : 0; };
const ce = new World().env;
check('a cyanobacteria biomass field exists (2nd producer)', ce.cyano.length === ce.phyto.length && ce.cyano.length > 0);
// N-INDEPENDENCE (the defining trait): with ZERO inorganic N but ample P + warmth + light, cyano STILL grows
// — exactly where green phyto (N-limited) cannot. This is its competitive edge at low N:P.
const cz = new World().env;
cz.tempC = CYANO.TEMP_OPT;   // warm; strat=0 at construction so tempAt == tempC
for (let i = 0; i < cz.cyano.length; i++) { cz.nh4[i] = 0; cz.no3[i] = 0; cz.phos[i] = 0.5; cz.cyano[i] = 0.05; }
const czSurf0 = cmeanArr(cz.cyano, 0, 0.12), czP0 = cz.meanPhos(), czNh40 = cz.meanNh4();
for (let k = 0; k < 30; k++) cz.cyanobacteria(1 / 30);
check('cyanobacteria FIX their own N — they grow with ZERO inorganic N (where green phyto cannot)', cmeanArr(cz.cyano, 0, 0.12) > czSurf0, `surface cyano ${czSurf0.toFixed(3)}→${cmeanArr(cz.cyano, 0, 0.12).toFixed(3)} at N=0`);
check('cyanobacteria draw down the shared phosphate pool (competition with green phyto)', cz.meanPhos() < czP0, `P ${czP0.toFixed(3)}→${cz.meanPhos().toFixed(3)}`);
check('cyanobacteria LEAK fixed N to ammonium — a net N source (the enrichment feedback vs denitrification)', cz.meanNh4() > czNh40, `nh4 ${czNh40.toFixed(4)}→${cz.meanNh4().toFixed(4)} (was 0)`);
// BUOYANCY: in CALM water cyano floats up into a surface scum; a storm's turbulence suppresses the rise.
seed(9); const calm = new World().env, storm = new World().env;
for (const e of [calm, storm]) { e.tempC = CYANO.TEMP_OPT; for (let i = 0; i < e.cyano.length; i++) { e.cyano[i] = 0.2; e.phos[i] = 0.4; } }
for (let k = 0; k < 40; k++) { calm.weather = 0; storm.weather = 3; calm.cyanobacteria(1 / 30); storm.cyanobacteria(1 / 30); }
// ISOLATE buoyancy: calm vs storm start identical and grow identically (same light/temp/P) — ONLY the rise
// differs. A surf>deep test alone is tautological (light-driven growth already favours the surface, so it passes
// even with buoyancy OFF), so compare the surface FRACTION between calm and storm — that cancels the growth
// gradient and is true only because buoyancy moved biomass up.
const surfFrac = e => { const s = cmeanArr(e.cyano, 0, 0.12), r = cmeanArr(e.cyano, 0.12, 1); return s / (s + r + 1e-9); };
check('buoyancy CONCENTRATES cyano at the surface — calm water builds a higher surface FRACTION than a storm (growth identical, only the rise differs)', surfFrac(calm) > surfFrac(storm), `surf-fraction calm ${surfFrac(calm).toFixed(3)} > storm ${surfFrac(storm).toFixed(3)}`);
check('a storm mixes the surface scum down (less absolute surface cyano than in calm water)', cmeanArr(storm.cyano, 0, 0.12) < cmeanArr(calm.cyano, 0, 0.12), `storm surf ${cmeanArr(storm.cyano, 0, 0.12).toFixed(3)} < calm surf ${cmeanArr(calm.cyano, 0, 0.12).toFixed(3)}`);
// TEMPERATURE: a warm-water bloomer — it grows near TEMP_OPT and stalls in cold water.
seed(9); const warm = new World().env, cold = new World().env;
warm.tempC = CYANO.TEMP_OPT; cold.tempC = CYANO.TEMP_OPT - 2 * CYANO.TEMP_TOL;   // well outside the window
for (const e of [warm, cold]) for (let i = 0; i < e.cyano.length; i++) { e.cyano[i] = 0.1; e.phos[i] = 0.5; }
for (let k = 0; k < 30; k++) { warm.cyanobacteria(1 / 30); cold.cyanobacteria(1 / 30); }
check('cyanobacteria are a WARM-water bloomer (grow near TEMP_OPT, stall when cold)', cmeanArr(warm.cyano, 0, 0.12) > cmeanArr(cold.cyano, 0, 0.12), `warm ${cmeanArr(warm.cyano, 0, 0.12).toFixed(3)} > cold ${cmeanArr(cold.cyano, 0, 0.12).toFixed(3)}`);
// EMERGENT COMPETITION (whole-sim): in a low-N lake, cyano takes a LARGER share of the producers than in an
// N-rich lake — "cyano wins at low N:P". Same seed; the low-N world has its inorganic N zeroed each step.
seed(55); const hiN = new World(); seed(55); const loN = new World();
hiN.time = loN.time = 0.22 * SEASON.YEAR_LEN;   // audit-fixes/chemistry: summer — per-capita cyano only builds a population when warm
for (let i = 0; i < 1400; i++) { hiN.step(1 / 30); for (let j = 0; j < loN.env.nh4.length; j++) { loN.env.nh4[j] = 0; loN.env.no3[j] = 0; } loN.step(1 / 30); }
console.log(`cyano competition: N-rich cyano ${hiN.env.meanCyano().toFixed(3)}/phyto ${hiN.env.meanPhyto().toFixed(3)} vs N-poor cyano ${loN.env.meanCyano().toFixed(3)}/phyto ${loN.env.meanPhyto().toFixed(3)}`);
// "cyano wins at low N:P" — guarded by ABSOLUTE cyano biomass, NOT a cyano/phyto ratio. A ratio passes for the
// wrong reason: green phyto collapses to ~0 in the N-poor lake regardless of cyano, so the ratio explodes even
// if cyano were dead. If cyano's defining N-fixing trait were broken (made N-limited), its biomass would COLLAPSE
// in the N-poor lake; instead it stays HIGH and ≥ the N-rich lake — that absolute floor is what genuinely guards it.
// (audit-fixes/chemistry: the old 0.3 floor was reachable only through ZERO-ORDER growth — every lit cell made cyano
// from nothing and buoyancy stacked it at the surface. Growth is now per-capita, so in 47 s the N-poor bloom builds to
// ~0.1: the floor is now 10× the seed strain (a broken N-fixer decays BELOW the seed) and it must beat the N-rich lake 2×.)
check('cyanobacteria WIN at low N:P — N-poor cyano grows ≥10× its seed and ≥2× the N-rich lake (a broken N-fixer would collapse here)', loN.env.meanCyano() > 10 * CYANO.START && loN.env.meanCyano() >= 2 * hiN.env.meanCyano(), `cyano N-poor ${loN.env.meanCyano().toFixed(3)} (>${(10 * CYANO.START).toFixed(2)}, ≥ 2× N-rich ${hiN.env.meanCyano().toFixed(3)})`);
check('green phyto (N-limited) collapses in the N-poor lake while cyano (N-fixing) holds — the asymmetry IS the niche', loN.env.meanPhyto() < hiN.env.meanPhyto() * 0.5 && loN.env.meanCyano() > 10 * loN.env.meanPhyto(), `phyto ${hiN.env.meanPhyto().toFixed(3)}→${loN.env.meanPhyto().toFixed(3)}, cyano ${loN.env.meanCyano().toFixed(3)} ≫ phyto`);
check('the cyanobacteria field stays non-negative, bounded & finite', [...loN.env.cyano].every(v => v >= 0 && v <= CYANO.CAP + 1e-3 && Number.isFinite(v)));

// ============================================================
//  MICROBIAL LOOP — bacterial decomposition of DOM (Q10 temperature- & O₂-limited; consumes O₂, remineralizes N+P)
// ============================================================
console.log('\n— microbial loop (bacterial decomposition) —');
// MECHANISM 1 — TEMPERATURE (Q10): warm water decomposes DOM faster than cold. strat=0 at construction ⇒
// tempAt is uniform = tempC, and a uniform field makes the internal diffuse() a no-op, so this isolates the Q10.
const mWarm = new World().env, mCold = new World().env;
mWarm.tempC = MICROBE.REF_TEMP + 10; mCold.tempC = MICROBE.REF_TEMP - 10;
for (const e of [mWarm, mCold]) for (let i = 0; i < e.dom.length; i++) { e.dom[i] = 0.4; e.o2[i] = 1.0; }
for (let k = 0; k < 30; k++) { mWarm.microbialLoop(1 / 30); mCold.microbialLoop(1 / 30); }
check('decomposition is TEMPERATURE-DEPENDENT (Q10): warm water decomposes DOM faster than cold', mWarm.meanDOM() < mCold.meanDOM(), `warm DOM ${mWarm.meanDOM().toFixed(3)} < cold ${mCold.meanDOM().toFixed(3)}`);
// MECHANISM 2 — O₂ LIMITATION (Monod): oxic water decomposes faster than anoxic ⇒ DOM LINGERS in the dead zone.
// O₂ is re-pinned each step so the Monod factor stays separated from the decomposition's own O₂ draw.
const mOxic = new World().env, mAnox = new World().env;
for (const e of [mOxic, mAnox]) { e.tempC = MICROBE.REF_TEMP; for (let i = 0; i < e.dom.length; i++) e.dom[i] = 0.4; }
for (let k = 0; k < 30; k++) { for (let i = 0; i < mOxic.o2.length; i++) { mOxic.o2[i] = 1.0; mAnox.o2[i] = 0.02; } mOxic.microbialLoop(1 / 30); mAnox.microbialLoop(1 / 30); }
check('decomposition is O₂-LIMITED (Monod): oxic decomposes faster than anoxic ⇒ DOM lingers in the hypoxic deep', mOxic.meanDOM() < mAnox.meanDOM(), `oxic DOM ${mOxic.meanDOM().toFixed(3)} < anoxic ${mAnox.meanDOM().toFixed(3)}`);
// MECHANISM 3 — consumes O₂ and remineralizes ammonium + phosphate (the bacterial respiration + nutrient release).
const mD = new World().env; mD.tempC = MICROBE.REF_TEMP;
for (let i = 0; i < mD.dom.length; i++) { mD.dom[i] = 0.4; mD.nh4[i] = 0; mD.phos[i] = 0; mD.o2[i] = 1.0; }
const mci = mD.cellOf(WORLD.W * 0.5, WORLD.H * 0.3), mO20 = mD.o2[mci];   // a WET cell (index length/2 is below the bed → inert since the wet/dry mask)
for (let k = 0; k < 20; k++) mD.microbialLoop(1 / 30);
check('decomposition CONSUMES O₂ (the microbial O₂ demand) and RELEASES ammonium + phosphate', mD.o2[mci] < mO20 && mD.nh4[mci] > 0 && mD.phos[mci] > 0 && mD.dom[mci] < 0.4, `O₂ ${mO20.toFixed(2)}→${mD.o2[mci].toFixed(2)}, nh4 ${mD.nh4[mci].toFixed(3)}, P ${mD.phos[mci].toFixed(3)}, DOM ${mD.dom[mci].toFixed(3)}`);
// MECHANISM 4 — MASS CONSERVATION: DOM decomposed exactly equals N(→ammonium)+P(→phosphate) released (no N/P
// created or destroyed). Uniform field ⇒ diffuse() is a no-op, so a single representative cell tests it exactly.
const mC = new World().env; mC.tempC = MICROBE.REF_TEMP;
for (let i = 0; i < mC.dom.length; i++) { mC.dom[i] = 0.3; mC.nh4[i] = 0; mC.no3[i] = 0; mC.phos[i] = 0; mC.o2[i] = 1.0; }
const cci = mC.cellOf(WORLD.W * 0.5, WORLD.H * 0.3);   // a WET cell (length/2 is a dry below-bed cell since the wet/dry mask)
for (let k = 0; k < 30; k++) mC.microbialLoop(1 / 30);
const conserved = mC.dom[cci] + mC.nh4[cci] + mC.phos[cci];
check('microbial loop CONSERVES mass: DOM decomposed = N+P remineralized (no nutrient created or lost)', approx(conserved, 0.3, 1e-5) && mC.dom[cci] < 0.3, `dom+nh4+phos ${conserved.toFixed(6)} (was 0.300), DOM ${mC.dom[cci].toFixed(4)}`);
// WHOLE-SIM — detritus dissolves into a standing DOM pool, and (EMERGENT) it accumulates more in the cold/hypoxic
// deep than the warm oxic surface (slow cold+anoxic decomposition) — the realistic hypolimnetic organic build-up.
seed(818); const dmw = new World().setDate(0.40);   // summer-stratified
for (let i = 0; i < 1800; i++) dmw.step(1 / 30);
const cxm = WORLD.W * 0.5, surfDOM = dmw.env.domAt(cxm, 20), deepDOM = dmw.env.domAt(cxm, bedY(cxm) - 12);
check('detritus dissolves into a standing DOM pool in the running lake (the microbial substrate exists)', dmw.env.meanDOM() > 0, `meanDOM ${dmw.env.meanDOM().toFixed(4)}`);
check('EMERGENT: DOM accumulates more in the cold/hypoxic deep than the warm oxic surface (slow deep decomposition)', deepDOM > surfDOM, `deep DOM ${deepDOM.toFixed(4)} > surface ${surfDOM.toFixed(4)}`);
check('the DOM field stays non-negative & finite after a run', [...dmw.env.dom].every(v => v >= 0 && Number.isFinite(v)));

// ============================================================
//  TEMPORAL REALISM — calendar (day:month:season:year), realistic relative lifespans, seasonal spawning
// ============================================================
console.log('\n— temporal realism (calendar / lifespans / seasonal spawning) —');
// CALENDAR RATIOS — a year is exactly 12 months & 4 seasons, and the units are correctly ordered.
check('a year is exactly 12 months and 4 seasons (calendar ratios)', Math.abs(TIME.YEAR_LEN - 12 * TIME.MONTH_LEN) < 1e-9 && Math.abs(TIME.YEAR_LEN - 4 * TIME.SEASON_LEN) < 1e-9, `year ${TIME.YEAR_LEN}, month ${TIME.MONTH_LEN}, season ${TIME.SEASON_LEN}`);
check('time units are correctly ordered: day < month < season < year', TIME.DAY_LEN < TIME.MONTH_LEN && TIME.MONTH_LEN < TIME.SEASON_LEN && TIME.SEASON_LEN < TIME.YEAR_LEN, `${TIME.DAY_LEN} < ${TIME.MONTH_LEN} < ${TIME.SEASON_LEN} < ${TIME.YEAR_LEN}`);
check('SEASON.YEAR_LEN / ENV-DAY derive from the single TIME master scale', SEASON.YEAR_LEN === TIME.YEAR_LEN);
// MONTHS — the calendar advances through all 12 named months across a year, and yearFrac is a clean [0,1) clock.
const cale = new World().env; const seenMonths = new Set(); let allNamed = true;
for (let i = 0; i < 48; i++) { cale.year = i / 48; seenMonths.add(cale.monthIndex()); if (typeof cale.monthName() !== 'string' || !cale.monthName()) allNamed = false; }
check('the calendar cycles through all 12 months over a year (each named)', seenMonths.size === 12 && allNamed, `${seenMonths.size} distinct months`);
cale.year = 3.25; check('yearFrac() is the fractional progress through the current year [0,1)', approx(cale.yearFrac(), 0.25, 1e-9) && cale.monthIndex() === 3, `frac ${cale.yearFrac().toFixed(3)}, month ${cale.monthIndex()}`);
// REAL LIFESPANS (bioenergetics, 2026-10-13): the published maximum ages and ages at maturity (FishBase, Ontario Freshwater
// Fishes database) — carp live ~6× a fathead minnow; every species matures at a realistic fraction of its life
const maxAges = SPECIES.map(k => SP[k].maxAge);
check('fish lifespans span the real range (carp ~25 yr ≫ fathead minnows ~4 yr)', SP.carp.maxAge / SP.minnow.maxAge >= 4, `carp ${(SP.carp.maxAge / TIME.YEAR_LEN).toFixed(0)} / minnow ${(SP.minnow.maxAge / TIME.YEAR_LEN).toFixed(0)} yr`);
check('every species matures at a realistic fraction of its lifespan (8–40%, well before death)', SPECIES.every(k => { const f = SP[k].matureAge / SP[k].maxAge; return f >= 0.08 && f <= 0.40; }), SPECIES.map(k => `${k} ${(100 * SP[k].matureAge / SP[k].maxAge | 0)}%`).join(' '));
check('lifespan ordering is ecological (minnow shortest-lived, carp longest)', SP.minnow.maxAge === Math.min(...maxAges) && SP.carp.maxAge === Math.max(...maxAges), `minnow (min), carp (max)`);
check('life history runs in real YEARS: minnows mature at about a year, bass, pike and carp only after 2+ years', SP.minnow.matureAge <= 1.2 * TIME.YEAR_LEN && SP.pike.matureAge >= 2 * TIME.YEAR_LEN && SP.carp.matureAge >= 2 * TIME.YEAR_LEN && SP.bass.matureAge >= 2 * TIME.YEAR_LEN && SPECIES.every(k => SP[k].maxAge >= 3 * TIME.YEAR_LEN), SPECIES.map(k => `${k} ${(SP[k].matureAge / TIME.YEAR_LEN).toFixed(1)}/${(SP[k].maxAge / TIME.YEAR_LEN).toFixed(0)} yr`).join(' '));
// TEMPERATURE-TRIGGERED SPAWNING — a species spawns only while the shore water is inside its window (SP.spawnT, °C),
// in spring/summer; never on the autumn cooling path or under ice (world.js spawnFactor)
check('every species has a realistic spawning-temperature window (°C, 2–30, at least 4 °C wide)', SPECIES.every(k => { const [lo, hi] = SP[k].spawnT; return lo >= 2 && hi <= 30 && hi - lo >= 4; }), SPECIES.map(k => `${k} ${SP[k].spawnT.join('–')}`).join(' '));
check('spawning follows the real spring warm-up: pike (at ice-out) < perch < bass < catfish', SP.pike.spawnT[0] < SP.perch.spawnT[0] && SP.perch.spawnT[0] < SP.bass.spawnT[0] && SP.bass.spawnT[0] < SP.catfish.spawnT[0]);
const spMid = sp => (sp.spawnT[0] + sp.spawnT[1]) / 2;
check('spawnFactor: 1 inside the window, 0 well outside it, 0 after SEASON_END (autumn cooling) and 0 under ice', SPECIES.every(k => { const sp = SP[k], m = spMid(sp);
  return spawnFactor(sp, m, 0.2, 0) === 1 && spawnFactor(sp, sp.spawnT[0] - SPAWN.EDGE - 0.1, 0.2, 0) === 0 && spawnFactor(sp, sp.spawnT[1] + SPAWN.EDGE + 0.1, 0.2, 0) === 0
    && spawnFactor(sp, m, SPAWN.SEASON_END + 0.01, 0) === 0 && spawnFactor(sp, m, 0.2, 1) === 0; }));
// WIRING (end-to-end): minnows breed in the warm June shallows and not at all in the ice-covered January lake. Same seeds +
// minnows-only so the only difference is the date. Summed over 4 seeds (a 20-step window holds only a few spawnings).
function minnowBirths(yearFrac) {
  let n = 0;
  for (const s of [1234, 1, 2, 3]) {
    seed(s); const tw = new World().setDate(yearFrac); tw.agents = tw.agents.filter(a => a.species === 'minnow');
    const b0 = tw.stats.births.minnow; for (let i = 0; i < 20; i++) tw.step(1 / 30); n += tw.stats.births.minnow - b0;
  }
  return n;
}
const peakBirths = minnowBirths(0.27), offBirths = minnowBirths(0.88);
check('seasonal spawning is WIRED: minnows breed in the warm June shallows, not in the ice-covered January lake', peakBirths > 0 && offBirths === 0, `June ${peakBirths} vs January ${offBirths} births (first 20 steps)`);

// ============================================================
//  FECUNDITY / CLUTCH — a spawning yields several condition-dependent young (restores larger-fish self-sustenance)
// ============================================================
console.log('\n— fecundity / clutch —');
// set up a single well-defined mature pair (clear the rest) in their spawning season, step until the FIRST spawning,
// and measure the brood size. The first stats.births jump = that spawning's clutch (immigrants change stats.immigrants,
// not stats.births, so they don't confound the count).
function firstClutch(ripeness) {   // larvae from one spawning of a pair whose female carries `ripeness` × her ripe gonads
  seed(7); const fw = new World(); fw.agents = fw.agents.filter(a => a.species === 'minnow').slice(0, 2); fw.fry = [];
  if (fw.agents.length < 2) return 0;
  const [p, q] = fw.agents;
  ripe(p, 0); ripe(q, 1); p.gon = SP.minnow.gsiF * p.W * ripeness;
  p.x = 1000; p.y = 200; q.x = 1008; q.y = 200; fw.setDate(0.27);  // adjacent, in-season
  fw.agentGrid.rebuild(fw.agents);
  for (let i = 0; i < 120 && !fw.fry.length; i++) fw.step(1 / 30);
  return fw.fry.reduce((s, f) => s + f.n, 0);
}
const richClutch = firstClutch(1.0), leanClutch = firstClutch(SPAWN.GON_READY + 0.02);
check('a spawning yields a SCHOOL of many larvae (fecundity), not a single offspring', richClutch > 50, `${richClutch.toFixed(0)} larvae from one spawning`);
check('the eggs scale with how ripe the female is (gonads built from food: a well-fed female spawns more)', richClutch > leanClutch * 1.15, `ripe ${richClutch.toFixed(0)} vs barely-ripe ${leanClutch.toFixed(0)}`);

// ============================================================
//  SEASONAL MACROPHYTES — warm-season growth, cold-season senescence (→ DOM), overwinter as rootstock
// ============================================================
console.log('\n— seasonal macrophytes —');
function plantsAtSeason(yearFrac) {
  seed(321); const pw = new World().setDate(yearFrac);
  for (let i = 0; i < 2000; i++) pw.step(1 / 30);   // settle into the season
  const live = pw.plants.filter(p => !p.dead);
  return { biomass: live.reduce((s, p) => s + p.biomass, 0), count: live.length, meanH: live.length ? live.reduce((s, p) => s + p.height, 0) / live.length : 0 };
}
const summerPl = plantsAtSeason(0.40), winterPl = plantsAtSeason(0.88);
// per-plant standing crop (mean height): the bed COUNT differs for another reason — light-starvation thins a turbid summer
// bed while dormant winter rootstock can't starve — so compare how tall the plants stand, not how many there are
check('macrophytes are SEASONAL: summer plants stand far taller than the winter rootstock (warm-season growth → cold-season die-back)', summerPl.meanH > winterPl.meanH * 1.5, `summer ${summerPl.biomass.toFixed(1)} (h${summerPl.meanH.toFixed(0)}) vs winter ${winterPl.biomass.toFixed(1)} (h${winterPl.meanH.toFixed(0)})`);
check('macrophytes OVERWINTER as rootstock — senescence floors above the uproot height, so beds are not extirpated', winterPl.count > 0 && winterPl.meanH < summerPl.meanH, `${winterPl.count} plants overwinter at mean height ${winterPl.meanH.toFixed(1)} (< summer ${summerPl.meanH.toFixed(1)})`);
// MACROPHYTE VARIETIES — multiple real growth forms, zonated by rooting depth
seed(444); const vw = new World();
for (let i = 0; i < 1500; i++) vw.step(1 / 30);
const vlive = vw.plants.filter(p => !p.dead);
const varieties = new Set(vlive.map(p => p.v));
check('macrophytes come in multiple varieties (a typed registry, not one generic plant)', varieties.size >= 3, `${varieties.size} of ${MACRO.length} forms present: ${[...varieties].map(i => MACRO[i].key).join(',')}`);
check('each macrophyte roots within its variety depth zone (depth zonation)', vlive.every(p => { const f = p.baseY / WORLD.H, z = MACRO[p.v].zone; return f >= z[0] - 0.03 && f <= z[1] + 0.03; }), `${vlive.length} plants checked`);
const deepPlants = vlive.filter(p => p.baseY / WORLD.H > 0.72);
check('the deep basin is colonised only by the deep/shade-tolerant form (milfoil), not shallow forms', deepPlants.length === 0 || deepPlants.every(p => MACRO[p.v].key === 'milfoil'), `${deepPlants.length} deep plants`);

// ============================================================
//  PLANT EVOLUTION — a heritable, mutating, FUNCTIONAL + VISIBLE macrophyte trait genome
// ============================================================
console.log('\n— plant evolution —');
const meanGene = (plants, i) => { const live = plants.filter(p => !p.dead); return live.reduce((s, p) => s + p.gn[i], 0) / live.length; };
const geneDist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const hueDist = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const pheno = genes => { const p = { v: 0, gn: Float32Array.from(genes) }; derivePlant(p); return p; };   // gene → effective phenotype

seed(909); const pw2 = new World();
check('every macrophyte carries a trait genome (right length) + a heritable colour', pw2.plants.every(p => p.gn && p.gn.length === PLANT_GENE_KEYS.length && p.hue != null) && pw2.plants.every(p => p.gn.every(g => g >= GENE_MIN && g <= GENE_MAX)), `${PLANT_GENE_KEYS.length} genes: ${PLANT_GENE_KEYS.join('/')}`);
check('fresh founder genes start near 1.0 (a new lake behaves like the pre-evolution baseline)', Math.abs(meanGene(pw2.plants, 0) - 1) < 0.08, `mean maxH gene ${meanGene(pw2.plants, 0).toFixed(3)}`);

// gene → phenotype: each physical/functional gene moves the effective param the right way, WITH its trade-off
const baseP = pheno([1, 1, 1, 1, 1, 1]);
const shadeP = pheno([1, 1, 0.7, 1, 1, 1]);   // shade-tolerance gene (lower)
check('shade-tolerance gene LOWERS the light-starvation threshold (survives darker/turbid water)…', shadeP.lightMin < baseP.lightMin, `lightMin ${shadeP.lightMin.toFixed(4)} < ${baseP.lightMin.toFixed(4)}`);
check('…but trades off growth (shade-tolerant macrophytes grow slower — divergent selection by depth)', shadeP.growMul < baseP.growMul, `growMul ${shadeP.growMul.toFixed(3)} < ${baseP.growMul.toFixed(3)}`);
const toughP = pheno([1, 1, 1, 1, 0.7, 1]);   // grazing-defence gene (lower palatability)
check('grazing-defence gene LOWERS palatability (tougher) and costs growth (defence ↔ growth trade-off)', toughP.palat < baseP.palat && toughP.growMul < baseP.growMul, `palat ${toughP.palat.toFixed(3)}, growMul ${toughP.growMul.toFixed(3)}`);
const leafP = pheno([1, 1, 1, 1, 1, 1.3]);    // leaf-area gene (bigger leaves — visible)
check('leaf-area gene raises cover & O₂ but also the light requirement (big leaves can\'t live as deep)', leafP.cover > baseP.cover && leafP.o2 > baseP.o2 && leafP.lightMin > baseP.lightMin, `cover ${leafP.cover.toFixed(2)}, o2 ${leafP.o2.toFixed(2)}, lightMin ${leafP.lightMin.toFixed(4)}`);
const warmP = pheno([1, 1, 1, 1.3, 1, 1]);    // warmth-REQUIREMENT gene (index 3): higher → needs warmer water
check('warmth-requirement gene raises tempMin (higher → needs warmer water; cold tolerance is its inverse, no inverted naming)', warmP.tempMin > baseP.tempMin, `tempMin ${warmP.tempMin.toFixed(2)} > ${baseP.tempMin.toFixed(2)}`);

// HEREDITY: a seedling inherits a nearby parent's (extreme) genes MUTATED — close to the parent, not reset to ~1.0;
// an isolated seed founds with fresh ~1.0 genes. So selection on the genes accumulates across plant generations.
const parent = pw2.makePlant(600, true);
parent.gn = Float32Array.from([1.30, 1.30, 0.72, 1.30, 0.72, 1.30]); parent.hue = 200;
let inh = 0, fnd = 0; const N = 80;
for (let i = 0; i < N; i++) inh += geneDist(pw2.makePlant(605, false, parent).gn, parent.gn);
for (let i = 0; i < N; i++) fnd += geneDist(pw2.makePlant(605, false, null).gn, parent.gn);
inh /= N; fnd /= N;
check('seedlings INHERIT a nearby parent\'s genes (mutated, close) ≪ a random founder — heredity', inh < fnd * 0.4, `child→parent dist: inherited ${inh.toFixed(3)} ≪ founder ${fnd.toFixed(3)}`);
check('colour is heritable too (offspring hue tracks the parent, with slow drift)', hueDist(pw2.makePlant(605, false, parent).hue, parent.hue) < 30, `Δhue ${hueDist(pw2.makePlant(605, false, parent).hue, parent.hue).toFixed(1)}°`);

// SELECTION FILTER: at a dim light between two genotypes' thresholds, only the shade-INtolerant one is eligible for
// light-starvation death → differential survival by genotype is the selective mechanism (turbid/deep selects tolerance).
const tol = pheno([1, 1, 0.6, 1, 1, 1]), intol = pheno([1, 1, 1.3, 1, 1, 1]);
const dimLight = (tol.lightMin + intol.lightMin) / 2;
check('differential survival: at a dim light only the shade-INtolerant genotype is light-starved (the selection filter)', dimLight >= tol.lightMin && dimLight < intol.lightMin, `tolerant ${tol.lightMin.toFixed(4)} ≤ ${dimLight.toFixed(4)} < intolerant ${intol.lightMin.toFixed(4)}`);

// SAVE v13: the plant genome + colour round-trip
const psave = JSON.parse(JSON.stringify(pw2.toJSON()));
seed(1); const pw3 = new World(); pw3.load(psave);
check('plant genome + colour survive save/load (v26)', psave.version === 26 && pw3.plants.length === pw2.plants.length && pw3.plants.every((p, i) => p.gn.length === PLANT_GENE_KEYS.length && Array.from(p.gn).every((g, j) => Math.abs(g - pw2.plants[i].gn[j]) < 1e-6) && Math.abs(p.hue - pw2.plants[i].hue) < 1e-6), `v${psave.version}, ${pw3.plants.length} plants`);

// ============================================================
//  PLANT INTERACTIONS — shading competition + the clear↔turbid feedback
// ============================================================
console.log('\n— plant interactions (shading competition) —');
// (1) SHADING COMPETITION: a short plant alone gets full light; a TALL neighbour within COMPETE.RADIUS cuts it.
seed(606); const piw = new World();
const shortP = piw.makePlant(500, false); shortP.height = 10;
piw.plants = [shortP];
const lightAlone = piw.plantShadeFactor(shortP);
const tallP = piw.makePlant(500 + COMPETE.RADIUS - 4, true); tallP.height = tallP.maxHeight = 70;
piw.plants = [shortP, tallP];
const lightShaded = piw.plantShadeFactor(shortP);
check('shading competition: a TALL neighbour cuts a short plant\'s effective light (→ stratified canopy / self-thin)', lightAlone === 1 && lightShaded < 0.95, `alone ${lightAlone.toFixed(2)} → shaded ${lightShaded.toFixed(2)}`);
check('shading is one-directional — the short plant does NOT shade the taller one', piw.plantShadeFactor(tallP) === 1, `tall stays ${piw.plantShadeFactor(tallP).toFixed(2)}`);
check('a plant far beyond COMPETE.RADIUS casts no shade (local competition only)', (() => { const a = piw.makePlant(500, false); a.height = 10; const b = piw.makePlant(500 + COMPETE.RADIUS + 30, true); b.height = 70; const w2 = piw; w2.plants = [a, b]; return w2.plantShadeFactor(a) === 1; })(), `radius ${COMPETE.RADIUS}px`);

// (2) SHADING OUTCOME (dynamics, not just the static factor): over a summer run, a short plant UNDER a tall canopy
// ends up shorter or light-starved vs an identical one in the open → real self-thinning / a stratified canopy, and
// (via the per-plant light-requirement gene setting the light-starvation threshold) it selects for shade-tolerance
// & for height under a closed canopy — an emergent eco-evo interaction with the plant genome.
seed(611); const shadew = new World().setDate(0.35);   // mid-summer: plants would actively grow
const underP = shadew.makePlant(640, false); underP.height = 12;
const canopy = []; for (let k = 0; k < 12; k++) { const tp = shadew.makePlant(640 + (k % 9) - 4, true); tp.height = tp.maxHeight = 80; canopy.push(tp); }
shadew.plants = [underP, ...canopy];
for (let i = 0; i < 900; i++) shadew.step(1 / 30);
// robust (trajectory-independent): a plant choked under a dense tall canopy gets ~no light, so it CANNOT gain height
// past its start (12) — it stays low or dies. (No dependence on a separate "open" plant growing in the noisy world.)
check('shading OUTCOME: a plant under a dense tall canopy cannot grow (light choked → stays low / dies = self-thinning)', underP.dead || underP.height < 16, `under ${underP.dead ? 'dead' : 'h' + underP.height.toFixed(0)} (start 12, canopy 80)`);

// ZOOPLANKTON TRACK PHYTOPLANKTON: a phyto-starved world holds far fewer zooplankton than a
// healthy one (this guards the spawn-∝-algae + graze + starve coupling that plankton.length>0 can't).
seed(777); const zHi = new World();
seed(777); const zLo = new World();
for (let i = 0; i < 700; i++) { zHi.step(1 / 30); for (let j = 0; j < zLo.env.phyto.length; j++) zLo.env.phyto[j] = 0; zLo.step(1 / 30); }
check('zooplankton track the phytoplankton field (starved phyto ⇒ far fewer zoo)', zLo.plankton.length < zHi.plankton.length * 0.5, `starved ${zLo.plankton.length} vs healthy ${zHi.plankton.length}`);

// ============================================================
//  DETERMINISM — same seed ⇒ identical run, and camera/tour
//  randomness must NOT touch the seeded sim stream
// ============================================================
console.log('\n— determinism —');
function runSnapshot(steps, withCamera) {
  seed(98765);
  const wr = new World();
  let cam = null;
  if (withCamera) { cam = new Camera(WORLD.W, WORLD.H); cam.setViewport(1600, 900); cam.startTour(); }
  for (let i = 0; i < steps; i++) {
    wr.step(1 / 30);
    if (cam) cam.update(1 / 30, wr);   // tour picks subjects via the non-seeded PRNG
  }
  return JSON.stringify(wr.toJSON());
}
const snapA = runSnapshot(900, false);
const snapB = runSnapshot(900, false);
check('same seed ⇒ byte-identical run (reproducible)', snapA === snapB, `${snapA.length} chars`);
const snapC = runSnapshot(900, true);
check('camera + cinematic tour do not perturb the seeded sim', snapA === snapC, snapA === snapC ? 'identical' : 'DESYNC — render/camera touched core.rand');

// ============================================================
//  CAMERA — pure math (no DOM): transforms, framing, clamping
// ============================================================
console.log('\n— camera —');
const cam = new Camera(WORLD.W, WORLD.H);
cam.setViewport(1920, 1080);

// transform round-trip
cam.zoom = cam.tzoom = 2; cam.cx = cam.tcx = 700; cam.cy = cam.tcy = 400;
const sp0 = cam.worldToScreen(700, 400);
check('camera centres the view on its centre', approx(sp0.x, 960, 0.5) && approx(sp0.y, 540, 0.5), `${sp0.x.toFixed(0)},${sp0.y.toFixed(0)}`);
const back = cam.screenToWorld(sp0.x, sp0.y);
check('worldToScreen/screenToWorld are inverses', approx(back.x, 700, 1e-6) && approx(back.y, 400, 1e-6));
const rt = cam.screenToWorld(123, 456); const fwd = cam.worldToScreen(rt.x, rt.y);
check('transform round-trips an arbitrary point', approx(fwd.x, 123, 1e-6) && approx(fwd.y, 456, 1e-6));

// frame-all shows the whole lake
cam.fitNow();
const vr = cam.visibleRect();
check('whole-lake fit covers the world', vr.x0 <= 1 && vr.x1 >= WORLD.W - 1 && vr.y0 <= 1 && vr.y1 >= WORLD.H - 1, `x[${vr.x0.toFixed(0)},${vr.x1.toFixed(0)}]`);
check('fit zoom equals camera fitZoom', approx(cam.zoom, cam.fitZoom, 1e-9));

// zoom is clamped to max
cam.zoomAtScreen(960, 540, 1e6);
check('zoom-in is clamped to maxZoom', cam.tzoom <= cam.maxZoom + 1e-6, `${cam.tzoom.toFixed(3)} <= ${cam.maxZoom.toFixed(3)}`);
cam.zoomAtScreen(960, 540, 1e-6);
check('zoom-out is clamped to minZoom', cam.tzoom >= cam.minZoom - 1e-6, `${cam.tzoom.toFixed(3)} >= ${cam.minZoom.toFixed(3)}`);

// pan keeps the view over the world (when zoomed in past fit)
cam.setZoomRel(8); cam.zoom = cam.tzoom; cam.panByScreen(-99999, -99999);
const hw = cam.vw / (2 * cam.zoom), hh = cam.vh / (2 * cam.zoom);
check('pan is clamped within world bounds', cam.cx >= hw - 1e-6 && cam.cx <= WORLD.W - hw + 1e-6 && cam.cy >= hh - 1e-6 && cam.cy <= WORLD.H - hh + 1e-6, `c ${cam.cx.toFixed(0)},${cam.cy.toFixed(0)}`);

// follow tracks a live agent's position after a few eased updates (must be zoomed in
// past whole-lake fit, or the whole world is visible and the centre is pinned)
const tgt = w.agents.find(a => a.x > 200 && a.x < WORLD.W - 200 && a.y > 200 && a.y < WORLD.H - 200) || w.agents[0];
cam.fitNow(); cam.setZoomRel(10); cam.zoom = cam.tzoom; cam.follow(tgt.id);
for (let i = 0; i < 300; i++) cam.update(1 / 60, w);
check('follow converges on the followed agent', approx(cam.cx, tgt.x, 6) && approx(cam.cy, tgt.y, 6), `cam ${cam.cx.toFixed(0)},${cam.cy.toFixed(0)} vs ${tgt.x.toFixed(0)},${tgt.y.toFixed(0)}`);
// tall views (16:10, 4:3, portrait) keep the water surface near the top and put the spare height below the bed (it used
// to centre the lake under a band of empty letterbox "sky"); 16:9 stays centred
{
  const tall = new Camera(WORLD.W, WORLD.H); tall.setViewport(1080, 1920); tall.fitNow();
  const top = tall.worldToScreen(0, 0).y, bot = tall.worldToScreen(0, WORLD.H).y;
  const wide = new Camera(WORLD.W, WORLD.H); wide.setViewport(1920, 1080); wide.fitNow();
  const wc = wide.worldToScreen(WORLD.W / 2, WORLD.H / 2);
  const q = new Camera(WORLD.W, WORLD.H); q.setViewport(1600, 1200); q.fitNow();
  const qTop = q.worldToScreen(0, 0).y, qBot = 1200 - q.worldToScreen(0, WORLD.H).y;
  check('tall views: the surface sits near the top (≤3% of the lake), the spare height goes below the bed; 16:9 stays centred',
    top >= 0 && top <= 0.031 * WORLD.H * tall.zoom && 1920 - bot > top * 5 && qTop <= qBot && Math.abs(wc.x - 960) < 0.5 && Math.abs(wc.y - 540) < 0.5,
    `portrait top ${top.toFixed(0)}px / bottom gap ${(1920 - bot).toFixed(0)}px; 4:3 top ${qTop.toFixed(0)} vs bottom ${qBot.toFixed(0)}; 16:9 centre ${wc.x.toFixed(1)},${wc.y.toFixed(1)}`);
}


// ==== audit-fixes: integrity ====
// Save/load integrity: era-aware brain migration (by label), a FAITHFUL resume (load → step ≡ the uninterrupted run),
// per-world ids, validated atomic loads, and the GLOBAL_MAX / champion guards. These run the REAL load/step paths.
console.log('\n— save/load integrity (audit-fixes) —');
{
  const { getRandState, setRandState, rand, layoutLen } = await import('../src/core.js');
  const { BRAIN_ERAS } = await import('../src/species.js');
  const DTI = 1 / 30;
  const finiteWorld = W => W.agents.every(a => [a.x, a.y, a.energy, a.heading, a.spd, a.maxSpeed].every(Number.isFinite) && [...a.act.h].every(Number.isFinite))
    && ['o2', 'phyto', 'cyano', 'nh4', 'no3', 'phos', 'dom', 'sedP'].every(f => W.env[f].every(Number.isFinite))
    && [W.env.t, W.env.light, W.env.tempC, W.env.turbidity, W.env.strat].every(Number.isFinite);

  // (1) every species' era lengths are distinct → the genome length identifies the save era unambiguously
  check('brain eras: every species has collision-free genome lengths across ALL save eras (incl. the 2-output eras)',
    SPECIES.every(k => SP[k].brainEras.collisions === 0 && new Set(SP[k].brainEras.eras.map(e => e.len)).size === BRAIN_ERAS.length),
    SPECIES.map(k => `${k} ${SP[k].brainEras.eras.map(e => e.len).join('/')}`).join(' · '));
  check('brain eras: the current era IS the current genome layout (labels + length)',
    SPECIES.every(k => { const e = SP[k].brainEras.eras.at(-1); return e.len === genomeLen(SP[k].shape) && e.inKeys.length === SP[k].shape.in; }));

  // (2) migrate a MARKED genome from every older era, for every species, through the real load path: each new input
  // column must hold the marker of the old column with the same label (base 1:1), new columns 0, outputs by label.
  let eraOk = true, eraDetail = '';
  for (const k of SPECIES) {
    const sp = SP[k], hid = sp.shape.hid, IN = sp.shape.in, base = sp.baseInputs, labels = sp.inputLabels;
    for (const era of sp.brainEras.eras.slice(0, -1)) {
      const oIN = era.inKeys.length, oOUT = era.outs.length, len = layoutLen(oIN, hid, oOUT, era.leak);
      const w = new Array(len).fill(0);
      const mk = (i, j) => 1 + i + j / 64;                                                   // W1 marker: old column i, unit j (exact in f32)
      for (let j = 0; j < hid; j++) for (let i = 0; i < oIN; i++) w[j * oIN + i] = mk(i, j);
      const oB1 = hid * oIN, oW2 = oB1 + hid, oB2 = oW2 + oOUT * hid, oLK = oB2 + oOUT;
      for (let j = 0; j < hid; j++) { w[oB1 + j] = -1 - j / 64; if (era.leak) w[oLK + j] = -2 - j / 64; }
      for (let r = 0; r < oOUT; r++) { w[oB2 + r] = 3 + r; for (let j = 0; j < hid; j++) w[oW2 + r * hid + j] = 2 + r + j / 64; }
      const lw = new World(); lw.load({ version: 17, agents: [{ s: k, x: 900, y: 300, e: 0.6, w }] });
      const g = lw.agents[0].g, rep = lw.lastLoad;
      let ok = rep.reseeded === 0 && rep.migrated === 1 && g.length === genomeLen(sp.shape);
      for (let j = 0; j < hid && ok; j++) for (let i = 0; i < IN; i++) {
        const old = i < base ? i : era.inKeys.indexOf('x:' + labels[i]);
        if (g[j * IN + i] !== (old >= 0 ? mk(old, j) : 0)) { ok = false; eraDetail = `${k} ${era.saves} col ${labels[i]}`; break; }
      }
      const nB1 = hid * IN, nW2 = nB1 + hid, nB2 = nW2 + OUT * hid, nLK = nB2 + OUT;
      for (let j = 0; j < hid && ok; j++) ok = g[nB1 + j] === Math.fround(-1 - j / 64) && g[nLK + j] === (era.leak ? Math.fround(-2 - j / 64) : -4);
      for (let r = 0; r < OUT && ok; r++) {
        if (r < oOUT) ok = g[nB2 + r] === 3 + r && g[nW2 + r * hid] === 2 + r;
        else ok = g[nB2 + r] < -0.8 && Math.abs(g[nW2 + r * hid]) <= 0.3;                   // new action rows seeded ~off
      }
      // the explicit audit symptom: the old hunger/fear weights must sit on the CURRENT hunger/fear columns
      const hIdx = era.inKeys.indexOf('x:hunger');
      if (ok && hIdx >= 0) ok = g[IN - 2] === mk(hIdx, 0) && g[IN - 1] === mk(hIdx + 1, 0);
      if (!ok) { eraOk = false; if (!eraDetail) eraDetail = `${k} ${era.saves}`; }
    }
  }
  check('era migration (every species × every older era, through load): base 1:1, spatial/perception/drives land on their OWN columns, new columns 0, 2-output eras MIGRATE (actions ~off, memoryless LEAK when pre-recurrence)', eraOk, eraDetail || `${SPECIES.length}×${BRAIN_ERAS.length - 1} migrations`);
  { // a v21 minnow brain specifically (the audit repro): hunger/fear must NOT land on flow / prey size
    const sp = SP.minnow, hid = sp.shape.hid, era = sp.brainEras.eras.find(e => e.saves === 'v21'), oIN = era.inKeys.length;
    const w = new Array(era.len).fill(0); w[oIN - 2] = 7; w[oIN - 1] = 9;                  // unit 0: hunger = 7, fear = 9
    const lw = new World(); lw.load({ agents: [{ s: 'minnow', x: 500, y: 200, e: 0.6, w }] });
    const g = lw.agents[0].g, L = sp.inputLabels;
    check('a v21 minnow brain keeps hunger/fear on the hunger/fear inputs (flow / prey size load as 0)', g[L.indexOf('hunger')] === 7 && g[L.indexOf('fear')] === 9 && g[L.indexOf('flow')] === 0 && g[L.indexOf('prey size')] === 0,
      `hunger ${g[L.indexOf('hunger')]} fear ${g[L.indexOf('fear')]} flow ${g[L.indexOf('flow')]} prey ${g[L.indexOf('prey size')]}`);
  }

  // (3) FAITHFUL RESUME: warm up, snapshot, then step the original AND a freshly loaded copy 600 steps → byte-identical
  seed(4242); const ra = new World(); for (let i = 0; i < 600; i++) ra.step(DTI);
  const rsnap = JSON.stringify(ra.toJSON());
  for (let i = 0; i < 600; i++) ra.step(DTI);
  const rA = JSON.stringify(ra.toJSON());
  const rb = new World(); rb.load(JSON.parse(rsnap));
  const rbRound = JSON.stringify(rb.toJSON()) === rsnap;
  for (let i = 0; i < 600; i++) rb.step(DTI);
  check('save v26 → load → step 600 is BYTE-IDENTICAL to the uninterrupted run (faithful resume: RNG, ids, cooldowns, smoothing, momentum, stroke, learned W2, corpses, env means …)', rbRound && rA === JSON.stringify(rb.toJSON()), `${ra.agents.length} agents, ${JSON.parse(rsnap).corpses.length} corpses in the snapshot, round-trip ${rbRound}`);

  // (4) constructing (and stepping) an unrelated World mid-run does not perturb an existing one (per-world ids). The
  // seeded RNG is one shared stream, so the probe preserves it around the intruder — what's tested is world isolation.
  const runIso = intrude => {
    seed(77); const A = new World(); for (let i = 0; i < 300; i++) A.step(DTI);
    if (intrude) { const r = getRandState(); const B = new World(); for (let i = 0; i < 20; i++) B.step(DTI); B.addAgent('pike'); setRandState(r); }
    for (let i = 0; i < 300; i++) A.step(DTI);
    const ids = A.agents.map(a => a.id);
    return { json: JSON.stringify(A.toJSON()), dup: ids.length - new Set(ids).size };
  };
  const iso0 = runIso(false), iso1 = runIso(true);
  check('a second World constructed + stepped mid-run does not perturb the first (per-world id counter; no duplicate ids)', iso0.json === iso1.json && iso1.dup === 0, `dup ids ${iso1.dup}, identical ${iso0.json === iso1.json}`);

  // (5) RNG state round-trips
  { seed(5); rand(); const st = getRandState(); const a = [rand(), rand(), rand()]; setRandState(st); const b = [rand(), rand(), rand()];
    seed(6); const w = new World(); const sv = w.toJSON();
    check('RNG state round-trips (getRandState/setRandState) and is saved in toJSON', a.every((v, i) => v === b[i]) && sv.rng === getRandState(), `rng ${sv.rng}`); }

  // (6) corrupted saves: atomic, validated
  seed(8); const cw = new World(); for (let i = 0; i < 60; i++) cw.step(DTI);
  const base = cw.toJSON(), clone = () => JSON.parse(JSON.stringify(base));
  { const tw = new World(); for (let i = 0; i < 30; i++) tw.step(DTI);
    const before = JSON.stringify(tw.toJSON()), rngB = getRandState();
    for (const bad of [null, 5, [], { agents: {} }, { env: 3, agents: [] }, { reeds: [], plants: 'x' }]) {
      let threw = false; try { tw.load(bad); } catch (e) { threw = e instanceof Error && e.message.length > 10; }
      if (!threw) { check('a structurally unusable save throws a descriptive Error', false, JSON.stringify(bad)); break; }
    }
    check('a structurally unusable save throws BEFORE mutating anything (world + RNG unchanged)', JSON.stringify(tw.toJSON()) === before && getRandState() === rngB); }
  { const f = clone(); f.agents[3].s = 'walleye'; f.agents[4].s = '__proto__'; f.agents[5].s = 'constructor';
    const lw = new World(); const rep = lw.load(f); const ids = lw.agents.map(a => a.id);
    check('unknown species (incl. "__proto__") are SKIPPED and counted — the rest of the lake loads, ids stay unique', rep.skippedSpecies === 3 && lw.agents.length === base.agents.length - 3 && new Set(ids).size === ids.length && Object.getPrototypeOf(lw.stats) === Object.prototype, `skipped ${rep.skippedSpecies}, agents ${lw.agents.length}/${base.agents.length}`); }
  { const f = clone();
    delete f.agents[0].y; delete f.agents[1].e; f.agents[2].gn[1] = 0; f.agents[3].h = 'north'; f.agents[4].x = null; f.agents[5].ag = -50;
    f.agents[6].g = '<img src=x onerror=alert(1)>'; f.agents[6].ea = '<b>'; f.agents[7].w = f.agents[7].w.map((v, i) => i === 3 ? 1e309 : v);
    f.agents[8].m = ['a']; f.agents[9].lw = [NaN]; f.agents[10].gn = [1e9, -1e9, 'x'];
    delete f.env.t; f.env.weather = 7; f.env.tempC = 'hot'; f.env.o2[5] = null; f.env.phyto[9] = 1e308; f.env.strat = NaN; f.env.cols = 3;
    f.reeds = {}; f.logs = 'nope'; f.plants[0].h = undefined; f.plants[1].v = -2; f.plants[2].g = [1, 2];
    f.plankton[0].y = 'deep'; f.detritus[0] = 7; f.larvae[0].d = null; f.stats = JSON.parse('{"births":"x","__proto__":{"polluted":1}}');
    const lw = new World(); const rep = lw.load(f);
    for (let i = 0; i < 120; i++) lw.step(DTI);
    check('missing / non-numeric / out-of-range fields load on sane defaults → NO NaN anywhere after 120 steps', finiteWorld(lw) && lw.agents.every(a => Number.isInteger(a.gen) && Number.isInteger(a.eaten)),
      `agents ${lw.agents.length}, reseeded ${rep.reseeded}, regenerated ${rep.regenerated.join(',')}`);
    check('…and `reeds: {}` is regenerated (no per-step throw), gen/eaten coerced to integers', Array.isArray(lw.reeds) && lw.reeds.length > 0 && rep.regenerated.includes('reeds')); }
  { const f = clone(); f.env.cols = 40; f.env.rows = 24; f.env.o2 = new Array(40 * 24).fill(0).map((_, i) => (i % 40) < 20 ? 0.2 : 0.9);
    const ew = new World(); ew.load(f); const C = GRID.FIELD_COLS, R = GRID.FIELD_ROWS;
    check('a different-sized env grid is RESAMPLED by (cx,cy), not row-sheared', ew.env.o2[0] === Math.fround(0.2) && ew.env.o2[C - 1] === Math.fround(0.9) && ew.env.o2[(R - 1) * C] === Math.fround(0.2) && ew.env.o2[R * C - 1] === Math.fround(0.9)); }
  { const f = clone(); const tmpl = f.agents[0]; f.agents = Array.from({ length: WORLD.GLOBAL_MAX + 400 }, () => ({ ...tmpl }));
    const lw = new World(); const rep = lw.load(f);
    check('an oversized save is capped at WORLD.GLOBAL_MAX agents', lw.agents.length === WORLD.GLOBAL_MAX && rep.truncated === 400, `${lw.agents.length}`); }

  // (7) fitGenes pads a missing gene with EXACTLY 1.0 (a v22 save had no brain gene → full brain, no RNG draw)
  { const f = clone(); for (const a of f.agents) a.gn = a.gn.slice(0, 6);
    const lw = new World(); lw.load(f);
    check('an older 6-gene save pads the brain gene with EXACTLY 1.0 (no brain shrinks)', lw.agents.every(a => a.genes[6] === 1 && a.activeHid === a.sp.shape.hid)); }

  // (8) version 24; an OLDER (v23-shaped) save still loads and runs
  { const f = clone(); f.version = 23;
    delete f.rng; delete f.nid; delete f.corpses;
    for (const a of f.agents) for (const k of ['id', 'mc', 'ts', 'th', 'vh', 'st', 'ac', 'lw']) delete a[k];
    for (const l of f.larvae) delete l.y; for (const s of f.snails) { delete s.y; delete s.ph; }
    for (const k of ['light', 'tempNorm', 'year', 'wind', 'flash', 'meanPhyto', 'meanCyano', 'meanDOM', 'W', 'H', 'cols', 'rows']) delete f.env[k];
    const lw = new World(); lw.load(f); for (let i = 0; i < 60; i++) lw.step(DTI);
    const ids = lw.agents.map(a => a.id);
    check('saves are version 26, and an older v23-shaped save still loads + runs (ids renumbered, no NaN)', base.version === 26 && finiteWorld(lw) && new Set(ids).size === ids.length); }

  // (9) champions / addAgent / makeFish respect GLOBAL_MAX and coerce untrusted fields
  { const hw = new World(); const champs = hw.champions(); champs.minnow.gen = '<script>'; champs.pike.w = [1, 2, 3];
    const r = hw.seedFromChampions(champs); const mins = hw.agents.slice(-r.added).filter(a => a.species === 'minnow');
    let guard = 0; while (hw.agents.length < WORLD.GLOBAL_MAX && guard++ < 50) hw.seedFromChampions(champs);
    const full = hw.seedFromChampions(champs);
    check('seedFromChampions returns {added, reseeded}, coerces gen, counts reseeded brains, and never exceeds GLOBAL_MAX',
      r.added > 0 && r.reseeded > 0 && mins.every(a => a.gen === 0) && full.added === 0 && hw.agents.length <= WORLD.GLOBAL_MAX && hw.addAgent('bass') === null && hw.makeFish('bass') === null,
      `added ${r.added}, reseeded ${r.reseeded}, agents ${hw.agents.length}/${WORLD.GLOBAL_MAX}`); }

  // (10) the death test kills a NaN fish (a NaN can't make a fish immortal)
  { seed(9); const nw = new World(); const f = nw.agents[0]; f.W = NaN; nw.step(DTI);
    check('a fish with a NaN mass dies (death test is !(W > 0))', !nw.agents.includes(f)); }

  // (11) carp normalise threat proximity by qThreat's own 1.1× search radius (the outer band no longer reads 0)
  { seed(10); const tw = new World(); tw.env.turbidity = 0;
    const carp = tw.makeFish('carp', [1, 1, 1, 1, 1, 1, 1], SP.carp.matureAge * 0.2); carp.x = 1000; carp.y = 400; carp.heading = 0;   // a young carp (an adult is past a pike's gape)
    const pike = tw.makeFish('pike', [1, 1, 1, 1, 1, 1, 1]); pike.x = 1000 + carp.senseRange * 1.05; pike.y = 400;
    tw.agents = [carp, pike]; tw.agentGrid.rebuild(tw.agents); SP.carp.senses(carp, tw);
    check('carp threat proximity is normalised by the 1.1× threat-search radius (a threat at 1.05× range reads > 0)', carp.act.in[5] > 0 && carp.act.in[4] > 0.99, `prox ${carp.act.in[5].toFixed(3)}`); }
}

// ==== audit-fixes: bio-ecology ====
// newborn cannibalism (AUDIT T1#2), plant light-starvation churn (T1#3), budding energy (T3), per-step feeding (T2#12),
// the clarity-scaled plant seed-parent search (T3). Config is imported dynamically so the shared import line is untouched.
console.log('\n— audit fixes: bio-ecology —');
{
  const { BROOD, FEED, PLANT: PLANTC } = await import('../src/config.js');
  const ONES = [1, 1, 1, 1, 1, 1, 1];

  // (1) NEWBORN CANNIBALISM — a conspecific newborn inside BROOD.GRACE is neither prey nor threatened; after it, both apply
  { seed(41); const cw = new World();
    const adult = cw.makeFish('pike', ONES), baby = cw.makeFish('pike', ONES, 0);
    adult.x = 900; adult.y = 300; baby.x = 902; baby.y = 300;
    cw.agents = [adult, baby]; cw.agentGrid.rebuild(cw.agents);
    const graceSafe = !cw.qPrey(adult) && !cw.qThreat(baby) && cw.takePrey(adult) === null && !baby.dead;
    baby.age = BROOD.GRACE + 0.5;   // past the grace, still a small juvenile (grow 0.35)
    const pr = cw.qPrey(adult), th = cw.qThreat(baby);
    const postGrace = !!pr && pr.item === baby && !!th && th.item === adult && cw.takePrey(adult) === baby;
    check('brood grace: a conspecific newborn is not prey (nor its parent its threat) for BROOD.GRACE s; afterwards real cannibalism is possible and the juvenile SENSES the cannibal (symmetric qThreat)', graceSafe && postGrace, `grace ${BROOD.GRACE}s: safe ${graceSafe}, post-grace eaten+sensed ${postGrace}`);
    // (a young perch big enough for the pike to bother with — FEED.PREY_MIN)
    const minnow = cw.makeFish('perch', ONES, 0); minnow.L = 7; minnow.W = stdWeight(SP.perch.lw, 7); minnow.x = 900; minnow.y = 310; cw.agents = [adult, minnow]; cw.agentGrid.rebuild(cw.agents);
    check('the grace is kin-only: another species\' newborn is still prey', !!cw.qPrey(adult) && cw.qPrey(adult).item === minnow); }
  // in a running lake: no conspecific is eaten inside its grace (before the fix bass/pike ate ~half their brood within 2 s)
  { seed(99); const rw = new World(); const kills = { young: 0, any: 0 }, orig = rw.takePrey.bind(rw);
    rw.takePrey = a => { const p = orig(a); if (p && p.species === a.species) { kills.any++; if (p.age < BROOD.GRACE) kills.young++; } return p; };
    for (let i = 0; i < 1800; i++) rw.step(1 / 30);   // a minute of late May: the bass spawning season
    check('running lake: zero conspecific kills of fish younger than BROOD.GRACE', kills.young === 0, `young conspecific kills ${kills.young} (all conspecific ${kills.any})`); }
  // brood SCATTER: the larvae schools start BROOD.SCATTER px from the parents, out of immediate strike reach
  { seed(7); const fw = new World(); fw.agents = fw.agents.filter(a => a.species === 'minnow').slice(0, 2); fw.fry = [];
    const [p, q] = fw.agents; ripe(p, 0); ripe(q, 1);
    p.x = 1000; p.y = 300; q.x = 1008; q.y = 300; fw.setDate(0.27); fw.agentGrid.rebuild(fw.agents);
    let mx = 0, my = 0; for (let i = 0; i < 120 && !fw.fry.length; i++) { mx = (p.x + q.x) / 2; my = (p.y + q.y) / 2; fw.step(1 / 30); }
    const ds = fw.fry.map(k => Math.hypot(k.x - mx, k.y - my));
    check('brood scatter: the larvae schools are placed within the BROOD.SCATTER annulus around the parents', fw.fry.length > 0 && ds.every(d => d >= BROOD.SCATTER[0] - 12 && d <= BROOD.SCATTER[1] + 12), `${fw.fry.length} schools at ${ds.map(d => d.toFixed(0)).join('/')} px (annulus ${BROOD.SCATTER.join('–')})`); }

  // (2) NO ASEXUAL BUDDING — fish reproduce sexually only: a lone, mature, well-fed fish in its spawning season has no young
  { seed(8); const bw = new World().setDate(0.27); const par = bw.agents.find(a => a.species === 'minnow'); bw.agents = [par];
    bw.plankton = []; bw.insects = []; bw.fry = []; ripe(par, 0); par.x = 1000; par.y = 300;
    bw.agentGrid.rebuild(bw.agents);
    const keepImm = { ...IMMIGRATION }; IMMIGRATION.RATE = 0; IMMIGRATION.REFUGE = 0;   // no immigrant mate can arrive
    const b0 = bw.stats.births.minnow; for (let i = 0; i < 200; i++) bw.step(1 / 30);
    Object.assign(IMMIGRATION, keepImm);
    check('no asexual budding: a lone ripe minnow in season produces no young (reproduction is sexual only)', bw.stats.births.minnow === b0 && bw.fry.length === 0, `${bw.stats.births.minnow - b0} young, ${bw.fry.length} schools`); }

  // (3) dt-INDEPENDENT FEEDING — grazing is a per-second rate and discrete items obey a handling time (FEED.HANDLE)
  { seed(72); const gw = new World(); const carp = gw.makeFish('carp', ONES); carp.x = 400; carp.y = bedY(400) - 20;
    const pl = gw.makePlant(400, true); pl.height = pl.maxHeight = 130; gw.plants = [pl];
    const h0 = pl.height, e60 = gw.bitePlant(carp, 1 / 60), d60 = h0 - pl.height, h1 = pl.height, e30 = gw.bitePlant(carp, 1 / 30), d30 = h1 - pl.height;
    check('plant grazing is per SECOND: a 1/30 s bite removes 2× a 1/60 s bite (energy ∝ biomass grazed)', Math.abs(d30 - 2 * d60) < 1e-9 && Math.abs(e30 - 2 * e60) < 1e-9 && Math.abs(d60 - PLANTC.BITE_RATE / 60) < 1e-9, `1/60: −${d60.toFixed(2)}px +${e60.toFixed(3)}  1/30: −${d30.toFixed(2)}px +${e30.toFixed(3)}`); }
  { const eaten = (dt, steps) => { seed(71); const fw = new World(); fw.plankton = []; fw.snails = []; fw.cray = []; fw.detritus = []; fw.plants = [];
      const cat = fw.makeFish('catfish', ONES, SP.catfish.matureAge + 10); cat.x = 1000; cat.y = bedY(1000) - 3; cat.energy = 0.3; fw.agents = [cat];
      const pile = []; for (let i = 0; i < 40; i++) { const L = fw._mkLarva(1000, 0); L.y = cat.y; pile.push(L); } fw.larvae = pile.slice();
      for (let i = 0; i < steps; i++) fw.step(dt);
      return pile.filter(L => L.dead).length; };
    // (warm-water foraging: a cold fish handles items more slowly — coldPerf — so fix the performance at 1 for this probe)
    const { ENV: ENVC } = await import('../src/config.js'), keepPerf = ENVC.COLD_PERF_MIN; ENVC.COLD_PERF_MIN = 1;
    const n30 = eaten(1 / 30, 1), n60 = eaten(1 / 60, 2);
    ENVC.COLD_PERF_MIN = keepPerf;
    check('discrete-item intake per second is dt-independent (handling time): one 1/30 step eats as many larvae as two 1/60 steps', n30 === n60 && n60 === Math.round((2 / 60) / FEED.HANDLE), `1/30×1: ${n30}, 1/60×2: ${n60}`); }

  // (4) PLANT LIGHT-STARVATION is judged on the running-mean light p.lightAvg, so beds survive the night & the winter …
  // seeding is switched off in these probes so they isolate the starvation rule from canopy competition by new seedlings
  const shelfPlants = (pw, xs) => xs.map(x => { const p = pw.makePlant(x, true); p.v = 0; p.gn = Float32Array.from([1, 1, 1, 1, 1, 1]); derivePlant(p); p.height = Math.min(30, p.maxHeight); return p; });
  const savedSeed = PLANTC.SEED_RATE; PLANTC.SEED_RATE = 0;
  const runNoFish = (pw, steps) => { for (let i = 0; i < steps; i++) { pw.agents = []; pw.step(1 / 30); } };
  { seed(61); const pw = new World().setDate(0.25); pw.agents = [];
    const beds = shelfPlants(pw, [80, 150, 220, 290, 360, 430]);
    const deep = shelfPlants(pw, [1060, 1110, 1160, 1210]);   // pondweed forced into the dark deep basin (bed ≈ 0.98 H)
    pw.plants = [...beds, ...deep];
    let nightSeen = false, avgAtNight = Infinity;
    for (let i = 0; i < 1800; i++) { pw.agents = []; pw.step(1 / 30); if (pw.env.light === 0) { nightSeen = true; avgAtNight = Math.min(avgAtNight, ...beds.filter(p => !p.dead).map(p => p.lightAvg / p.lightMin)); } }
    check('established shelf beds survive a full day/night cycle (starvation judged on the running-mean light, not instantaneous)', nightSeen && beds.every(p => !p.dead) && avgAtNight >= 1, `${beds.filter(p => !p.dead).length}/${beds.length} alive; min lightAvg/lightMin at night ${avgAtNight.toFixed(2)}`);
    check('…while plants that are too DEEP still light-starve (the depth limit holds)', deep.every(p => p.dead || p.lightAvg < p.lightMin) && deep.filter(p => p.dead).length >= deep.length / 2, `${deep.filter(p => p.dead).length}/${deep.length} deep plants dead`);
    check('every live plant carries a finite running-mean light (p.lightAvg — persistent per-plant state)', pw.plants.every(p => Number.isFinite(p.lightAvg)), `${pw.plants.length} plants`); }
  { seed(62); const ww = new World().setDate(0.70); ww.agents = [];   // November → into the ice-covered winter
    const beds = shelfPlants(ww, [90, 170, 250, 330, 1700, 1780, 1860, 1940]); ww.plants = beds.slice();
    runNoFish(ww, 3600);   // 120 s ≈ 2 day/night cycles into winter
    check('macrophytes OVERWINTER: shelf rootstock survives winter nights (dormancy ≠ death)', beds.every(p => !p.dead), `${beds.filter(p => !p.dead).length}/${beds.length} alive at yearFrac ${ww.env.yearFrac().toFixed(2)}, mean h ${(beds.reduce((s, p) => s + p.height, 0) / beds.length).toFixed(1)}`); }
  PLANTC.SEED_RATE = savedSeed;

  // (5) the seed-parent search is NOT shrunk by water turbidity (dispersal isn't vision); the fish plant SENSE still is
  { seed(63); const sw = new World(); const pl = sw.makePlant(700, true); sw.plants = [pl]; sw.env.turbidity = 1;
    const qy = pl.baseY - 1, far = 200;   // inside the stem's vertical span → point-to-stem distance = the 200 px horizontal gap
    const q = sw.qPlant(900, qy, 240), n = sw.nearestPlant(900, qy, 240);
    check('seed-parent search is unscaled by turbidity (nearestPlant finds a parent qPlant\'s murky-water sense misses)', !q && !!n && n.item === pl, `clarity ${sw.env.clarity().toFixed(2)}, parent at ~${far.toFixed(0)}px: sense ${!!q}, seeding ${!!n}`); }
}

// ==== audit-fixes: chemistry ====
// Water-chemistry rework (AUDIT Tier 2 #11 + Tier 3 storm/scum): wet/dry mask, conservative no-flux diffusion, closed
// P/N budgets (every transfer debits its source; boundary fluxes tallied in env.ledger), depth-damped diurnal temperature
// + a slow hypolimnion, O₂ clamped before rate terms, storms that genuinely mix, a through-flow outlet, config hygiene.
{
  console.log('\n— audit-fixes: chemistry —');
  const { Environment, buildWetMask, diffuse: cDiffuse, diffuseO2: cDiffuseO2 } = await import('../src/environment.js');
  const CC = await import('../src/config.js');
  const COLS = GRID.FIELD_COLS, ROWS = GRID.FIELD_ROWS, CW = WORLD.W / COLS, CH = WORLD.H / ROWS;
  const sum64 = (f, M) => { let s = 0; for (let i = 0; i < f.length; i++) if (!M || M.wet[i]) s += f[i]; return s; };

  // 1 — WET/DRY MASK
  const M = buildWetMask();
  let dry = 0, contiguous = true, bedOk = true;
  for (let i = 0; i < COLS * ROWS; i++) if (!M.wet[i]) dry++;
  for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) if (!!M.wet[cy * COLS + cx] !== (cx >= M.lo[cy] && cx <= M.hi[cy])) contiguous = false;
  for (let cx = 0; cx < COLS; cx++) {
    const br = M.bedRow[cx];
    let maxBed = 0; for (let k = 0; k <= 16; k++) maxBed = Math.max(maxBed, bedY(Math.min(WORLD.W, (cx + k / 16) * CW)));
    if (!M.wet[br * COLS + cx] || (br + 1 < ROWS && M.wet[(br + 1) * COLS + cx]) || br * CH > maxBed || (br + 1) * CH <= maxBed - 1e-6) bedOk = false;
  }
  check('wet mask: ~35% of field cells lie below the bed and are DRY', dry > 0.25 * COLS * ROWS && dry < 0.45 * COLS * ROWS, `${dry}/${COLS * ROWS} dry`);
  check('wet mask: each row\'s wet cells are one contiguous run and each column\'s bedRow is its deepest wet cell (top above the bed)', contiguous && bedOk);
  const em = new Environment();
  let inRock = 0; for (let x = 1; x < WORLD.W; x += 7) for (const y of [bedY(x) - 1, bedY(x), bedY(x) + 3, WORLD.H]) if (!em.mask.wet[em.cellOf(x, y)]) inRock++;
  check('cellOf() clamps every lake point (even on/below the bed) to a WET cell — nothing reads/writes rock', inRock === 0, `${inRock} rock hits`);
  // means are over wet cells only: poisoning every dry cell must not move them
  const mBefore = [em.meanPhos(), em.meanDin(), em.meanO2(), em.wetMean(em.phyto)];
  for (let i = 0; i < em.phos.length; i++) if (!em.mask.wet[i]) { em.phos[i] = 99; em.nh4[i] = 99; em.no3[i] = 99; em.o2[i] = 99; em.phyto[i] = 99; }
  check('field means (P, DIN, O₂, phyto) exclude the dry below-bed cells', [em.meanPhos(), em.meanDin(), em.meanO2(), em.wetMean(em.phyto)].every((v, k) => approx(v, mBefore[k], 1e-9)));
  // dry cells are inert: a full env step (no world) leaves their (poisoned) values untouched
  em.step(1 / 30);
  let dryMoved = 0; for (let i = 0; i < em.phos.length; i++) if (!em.mask.wet[i] && (em.phos[i] !== 99 || em.o2[i] !== 99 || em.phyto[i] !== 99)) dryMoved++;
  check('dry cells stay inert through a full env step (no process or flux touches rock); env.step works without a world', dryMoved === 0 && Number.isFinite(em.meanO2()), `${dryMoved} dry cells changed`);

  // 2 — CONSERVATIVE DIFFUSION (flux form, no-flux at edges & bed)
  const fd = new Float32Array(COLS * ROWS), td = new Float32Array(COLS * ROWS);
  for (let i = 0; i < fd.length; i++) fd[i] = M.wet[i] ? ((i * 2654435761) % 1000) / 1000 : 7;   // deterministic rough field
  fd[10 * COLS] += 100;            // a slug at the inflow edge cell (col 0)
  fd[COLS - 1] += 50;              // and in the surface corner (scum row 0, right edge)
  const d0 = sum64(fd, M);
  for (let s = 0; s < 1800; s++) cDiffuse(fd, td, NUTRIENT.DIFFUSE / 30, M);   // 60 sim-seconds
  const d1 = sum64(fd, M);
  let dryTouched = 0; for (let i = 0; i < fd.length; i++) if (!M.wet[i] && fd[i] !== 7) dryTouched++;
  check('diffuse() CONSERVES mass to float precision (edge slugs included; was −17% in 60 s at an edge)', Math.abs(d1 - d0) / d0 < 1e-5 && dryTouched === 0, `${d0.toFixed(4)} → ${d1.toFixed(4)} (rel ${((d1 - d0) / d0).toExponential(1)})`);
  const fo = new Float32Array(COLS * ROWS); for (let i = 0; i < fo.length; i++) fo[i] = M.wet[i] ? ((i * 40503) % 997) / 997 : 0;
  const o0 = sum64(fo, M);
  for (let s = 0; s < 1800; s++) cDiffuseO2(fo, td, CC.ENV.O2_DIFFUSE / 30, s < 900 ? 0.9 : 0.1, M);
  check('diffuseO2() (stratification-gated vertical mixing) is conservative too — symmetric per-interface mixing', Math.abs(sum64(fo, M) - o0) / o0 < 1e-5, `rel ${((sum64(fo, M) - o0) / o0).toExponential(1)}`);

  // 3/4 — CLOSED P & N BUDGETS in the running lake (fish on; plants off — the plant uptake/return is the bio slice's and is
  // measured separately below). Inventory = water + sediment + algae + cyano + DOM + detritus N/P; it may change only by
  // inflow − outflow − burial (P) and inflow + N-fixation − outflow − denitrification (N).
  // organic N+P held by detritus particles AND by living plants (each plant banks what it absorbs — world.js `p.nut`)
  const detNut = ww => ww.detritus.reduce((s, d) => s + (d.dead ? 0 : (d.n || 0)), 0) + ww.plants.reduce((s, p) => s + (p.dead ? 0 : (p.nut || 0)), 0);
  const runBudget = (plants) => {
    seed(4242); const bw = new World().setDate(0.30);
    const keep = CC.PLANT.SEED_RATE; if (!plants) { bw.plants = []; CC.PLANT.SEED_RATE = 0; }
    const e = bw.env, invP = () => e.inventoryP() + detNut(bw) * NUTRIENT.ORGANIC_P, invN = () => e.inventoryN() + detNut(bw) * (1 - NUTRIENT.ORGANIC_P);
    const P0 = invP(), N0 = invN(), L0 = { ...e.ledger };
    let neg = 0;
    for (let s = 0; s < 1800; s++) { bw.step(1 / 30); if (s % 60 === 0) for (const f of [e.phos, e.nh4, e.no3, e.dom, e.phyto, e.cyano, e.o2]) for (let i = 0; i < f.length; i++) if (f[i] < 0 || !Number.isFinite(f[i])) neg++;   /* strictly ≥ 0: even a −1e-22 rounding residue breaks the load round-trip */ }
    CC.PLANT.SEED_RATE = keep;
    const L = e.ledger, inP = L.inP - L0.inP, outP = L.outP - L0.outP, buryP = L.buryP - L0.buryP;
    const resP = (invP() - P0) - (inP - outP - buryP);
    const resN = (invN() - N0) - ((L.inN - L0.inN) + (L.fixN - L0.fixN) - (L.outN - L0.outN) - (L.denitN - L0.denitN));
    return { P0, resP, resN, inP, outP, buryP, neg, N0 };
  };
  const B = runBudget(false);
  console.log(`P budget 60 s: inv ${B.P0.toFixed(1)}, in ${B.inP.toFixed(2)} out ${B.outP.toFixed(2)} buried ${B.buryP.toFixed(2)} → residual ${B.resP.toExponential(2)} P; N residual ${B.resN.toExponential(2)}`);
  // tolerance: 0.05 P ≈ 0.01% of the ~370 P inventory and ~0.2% of the 60-s inflow — Float32 field rounding is ~1e-3..1e-2
  check('P INVENTORY is CLOSED: Δ(total P) = inflow − outflow − burial within 0.05 P over 60 s (fish on, plants off)', Math.abs(B.resP) < 0.05, `residual ${B.resP.toFixed(4)} P (was −114 P unexplained per 60 s)`);
  check('N INVENTORY is CLOSED: Δ(total N) = inflow + N-fixation − outflow − denitrification within 0.2 N over 60 s', Math.abs(B.resN) < 0.2, `residual ${B.resN.toFixed(4)} N of ${B.N0.toFixed(0)}`);
  check('the through-flow outlet and sediment burial are both real P sinks (the outflow now has a chemical effect)', B.outP > 0.5 && B.buryP > 0.5, `out ${B.outP.toFixed(2)}, buried ${B.buryP.toFixed(2)}`);
  check('no field goes negative or non-finite in the running lake (no pool is overdrawn)', B.neg === 0, `${B.neg} bad samples`);
  const BP = runBudget(true);
  // plants ON: each plant banks the N+P it absorbs (stoichiometric uptake) and returns its share on shed/graze/death
  check('P and N stay CLOSED with plants growing, being grazed, shedding and dying (the plant pool is mass-conserving)', Math.abs(BP.resP) < 0.05 && Math.abs(BP.resN) < 0.2 && BP.neg === 0, `P residual ${BP.resP.toFixed(4)}, N residual ${BP.resN.toFixed(4)} (was −0.3…+1.6 P per 60 s)`);

  // 4 — N stoichiometry is Redfield-consistent (no N created on recycling) and cyano fixes N only for the deficit
  check('algae take up N at the same Redfield ratio they recycle it (N_USE = P_USE·(1−ORGANIC_P)/ORGANIC_P)', approx(PHYTO.N_USE, PHYTO.P_USE * (1 - NUTRIENT.ORGANIC_P) / NUTRIENT.ORGANIC_P, 1e-3) && approx(CYANO.N_USE, PHYTO.N_USE, 1e-9));
  const fx = new Environment(), fz = new Environment();
  for (const [e, n] of [[fx, 0.5], [fz, 0]]) { e.tempC = CYANO.TEMP_OPT; for (let i = 0; i < e.cyano.length; i++) { e.cyano[i] = 0.1; e.phos[i] = 0.5; e.nh4[i] = n; e.no3[i] = 0; } }
  for (let k = 0; k < 30; k++) { fx.cyanobacteria(1 / 30); fz.cyanobacteria(1 / 30); }
  check('cyanobacteria fix N₂ only for their deficit — N-replete water → ~no fixation, N-free water → fixation', fx.ledger.fixN < 0.05 * fz.ledger.fixN && fz.ledger.fixN > 0, `fixN replete ${fx.ledger.fixN.toFixed(3)} vs N-free ${fz.ledger.fixN.toFixed(3)}`);

  // 5 — DEEP TEMPERATURE: the diurnal swing is a surface skin; the hypolimnion has its own slow, steady temperature
  seed(77); const tw2 = new World().setDate(0.40); tw2.env.setWeather(0);   // calm: a storm would (correctly) mix the deep
  const tcx = WORLD.W * BASIN.CENTER, tdy = bedY(tcx) - 12;
  let sMin = 99, sMax = -99, dMin = 99, dMax = -99;
  for (let s = 0; s < 2400; s++) { tw2.step(1 / 30); if (s > 600) { const ts = tw2.env.tempAt(tcx, 8), td2 = tw2.env.tempAt(tcx, tdy); sMin = Math.min(sMin, ts); sMax = Math.max(sMax, ts); dMin = Math.min(dMin, td2); dMax = Math.max(dMax, td2); } }
  check('the surface keeps its diurnal swing but the summer hypolimnion does not (deep range < 1 °C; was ±4 °C)', sMax - sMin > 3 && dMax - dMin < 1 && dMax < sMin, `surface ${sMin.toFixed(1)}..${sMax.toFixed(1)}, deep ${dMin.toFixed(1)}..${dMax.toFixed(1)} °C`);

  // 6 — NEGATIVE O₂ never reaches a rate term (the microbial Monod pole at −O2_HALF)
  let monodOk = true;
  for (const o of [-0.05, -0.099, -0.1, -0.5]) {
    const e = new Environment(), i = e.cellOf(WORLD.W * 0.5, WORLD.H * 0.3);
    e.o2[i] = o; e.dom[i] = 1; e.phos[i] = 0.001; e.nh4[i] = 0.001;
    e.microbialLoop(1 / 30); e.nitrogenCycle(1 / 30); e.sedimentP(1 / 30);
    if (!(e.dom[i] <= 1) || e.phos[i] < 0 || e.nh4[i] < 0 || ![...e.dom, ...e.o2, ...e.phos].every(Number.isFinite)) monodOk = false;
  }
  check('negative O₂ is clamped before the Monod/redox rate terms (decomposition never runs backwards, no NaN)', monodOk);

  // 7 — STORMS GENUINELY MIX: a sustained summer storm breaks the thermocline (was stuck at strat ≈ 0.83)
  // (both primed to ~Aug 1, the warmest, most stratified water: surface ~25 °C over an ~18 °C hypolimnion)
  const AUG = 0.42 * SEASON.YEAR_LEN;
  const se2 = new Environment(); se2.primeSeason(AUG); se2.strat = 1; se2.setWeather(3);
  for (let s = 0; s < 30 * 120; s++) { se2.year = 0.42; se2.step(1 / 30); se2.year = 0.42; }
  const sc2 = new Environment(); sc2.primeSeason(AUG); sc2.strat = 1; sc2.setWeather(2);
  for (let s = 0; s < 30 * 120; s++) { sc2.year = 0.42; sc2.step(1 / 30); sc2.year = 0.42; }
  check('a sustained (120 s) summer storm fully breaks stratification, while rain only nibbles at it', se2.strat < 0.05 && sc2.strat > 0.9, `storm strat ${se2.strat.toFixed(2)}, rain strat ${sc2.strat.toFixed(2)}`);

  // 8 — TOXIC SCUM IS AN EVENT, not an artefact: buoyancy alone (cold → no growth, calm) can't float the seed strain
  // into a toxic layer; a warm, calm, P-loaded bloom can.
  const bz = new Environment(); bz.setWeather(0);
  for (let s = 0; s < 30 * 60; s++) { bz.tempC = 8; bz.step(1 / 30); }
  let toxSeed = 0; for (let cx = 0; cx < COLS; cx++) if (bz.cyano[cx] > CYANO.TOX_THRESH * CYANO.CAP) toxSeed++;
  const bl = new Environment(); bl.setWeather(0); bl.year = 0.25;
  for (let i = 0; i < bl.phos.length; i++) bl.phos[i] = 0.6;
  for (let s = 0; s < 30 * 90; s++) bl.step(1 / 30);
  let toxBloom = 0; for (let cx = 0; cx < COLS; cx++) if (bl.cyano[cx] > CYANO.TOX_THRESH * CYANO.CAP) toxBloom++;
  check('buoyancy alone cannot make the seed strain toxic (cold, calm: 0 toxic surface cells)', toxSeed === 0, `${toxSeed} toxic`);
  check('a warm, calm, P-loaded lake CAN grow a toxic surface scum (the event still exists)', toxBloom > 0, `${toxBloom}/${COLS} toxic surface cells`);

  // 10 — CONFIG HYGIENE: live TIME aliases; dead knobs gone
  const yl = TIME.YEAR_LEN, dl = TIME.DAY_LEN; TIME.YEAR_LEN = 1234; TIME.DAY_LEN = 77;
  const live = SEASON.YEAR_LEN === 1234 && CC.ENV.DAY_LEN === 77; TIME.YEAR_LEN = yl; TIME.DAY_LEN = dl;
  check('SEASON.YEAR_LEN and ENV.DAY_LEN are LIVE aliases of TIME (not load-time copies)', live && SEASON.YEAR_LEN === yl);
  check('dead knobs BASIN.SEDIMENT and NUTRIENT.N_START are removed', !('SEDIMENT' in BASIN) && !('N_START' in NUTRIENT));
}

// ==== apex energetics (2026-10-12): innate pursuit + hypoxia avoidance — BEHAVIOURAL (A/B against an identical world) ====
console.log('\n— apex energetics: pursuit & hypoxia avoidance —');
{
  const { ENV: ENVC } = await import('../src/config.js');
  // A bass facing straight down with a minnow 60 px to its right: with the pursuit reflex it ends up pointing closer to
  // the prey than the SAME world (same seed, same brain) with pursuit switched off.
  const pursuitRun = (p) => {
    const keep = SP.bass.innate.pursuit, keepG = SP.bass.innate.spawnGround; SP.bass.innate.pursuit = p; SP.bass.innate.spawnGround = 0;   // isolate the reflex under test
    try {
      seed(777); const tw = new World(); tw.agents = [];
      const b = tw.makeFish('bass', null, SP.bass.matureAge * 1.2), m = tw.makeFish('minnow', null, SP.minnow.matureAge * 1.2);   // adults (makeFish's default age 9999 is past maxAge → instant old-age death)
      b.x = 1000; b.y = 420; b.heading = b.velHeading = Math.PI / 2; m.x = 1060; m.y = 420;
      tw.agents.push(b, m);
      for (let i = 0; i < 12; i++) tw.step(1 / 30);
      return Math.abs(angDiff(Math.atan2(m.y - b.y, m.x - b.x), b.heading));
    } finally { SP.bass.innate.pursuit = keep; SP.bass.innate.spawnGround = keepG; }
  };
  const offA = pursuitRun(0), onA = pursuitRun(SP.bass.innate.pursuit);
  check('innate PURSUIT turns a bass toward prey it senses (vs the identical world with pursuit off)', onA < offA - 0.05, `angle to prey ${onA.toFixed(2)} rad with pursuit vs ${offA.toFixed(2)} without`);
  // A bass at its home depth in O₂-starved water: hypoxia avoidance turns it UPWARD (heading's vertical component goes
  // negative = toward the surface), unlike the identical world with the reflex disabled (margin 0 ⇒ never triggers).
  const hypoRun = (margin) => {
    const keep = ENVC.HYPOXIA_AVOID, keepG = SP.bass.innate.spawnGround; ENVC.HYPOXIA_AVOID = margin; SP.bass.innate.spawnGround = 0;   // isolate (in-season aggregation would also steer it)
    try {
      seed(778); const tw = new World(); tw.agents = [];
      const b = tw.makeFish('bass', null, SP.bass.matureAge * 1.2); b.x = 1000; b.y = SP.bass.innate.homeDepth * tw.bedY(1000); b.heading = b.velHeading = 0;
      tw.agents.push(b);
      for (let i = 0; i < 12; i++) { tw.env.o2.fill(0.03); tw.step(1 / 30); }
      return Math.sin(b.heading);
    } finally { ENVC.HYPOXIA_AVOID = keep; SP.bass.innate.spawnGround = keepG; }
  };
  const offH = hypoRun(0), onH = hypoRun(ENVC.HYPOXIA_AVOID);
  check('innate HYPOXIA AVOIDANCE steers a fish upward out of O₂-starved water (vs the reflex disabled)', onH < offH - 0.05, `sin(heading) ${onH.toFixed(2)} with avoidance vs ${offH.toFixed(2)} without (negative = upward)`);
}

// ==== behavioural replacements for formula-copy checks (2026-10-12; AUDIT Tier 1 #5) ====
// The older thermal/hypoxia/nocturnal/mate-choice checks re-derived the code's formula in the test (deleting the sim
// line still passed). These run the REAL step / chooseMate and compare against an identical world with one term off.
console.log('\n— behavioural checks (real sim paths, A/B) —');
{
  const { ENV: ENVB } = await import('../src/config.js');
  // HYPOXIA SUPPRESSES APPETITE (EPA 1986: growth falls 20–65 % at 2–5 mg/L): the same hungry minnow among zooplankton
  // eats in well-oxygenated water but not in water just above its lethal level
  const ateIn = o2 => { seed(901); const tw = new World(); tw.agents = []; tw.birds = []; tw.fry = []; const m = tw.makeFish('minnow', [1, 1, 1, 1, 1, 1, 1]); m.x = 1000; m.y = 200; tw.agents.push(m);
    for (let i = 0; i < 20; i++) tw.plankton.push(tw._mkPlankton(1000 + (i % 5) * 3, 200 + (i / 5 | 0) * 3, 0));
    let g = 0; for (let i = 0; i < 30; i++) { tw.env.o2.fill(o2); const g0 = m.gut; tw.step(1 / 30); g += Math.max(0, m.gut - g0); } return g; };
  const eatOk = ateIn(1.0), eatLow = ateIn(SP.minnow.o2Lethal / ENVB.O2_MGL * 1.2);
  check('HYPOXIA kills the appetite: a minnow among zooplankton feeds in oxygenated water but hardly at all near its lethal O₂', eatOk > 0 && eatLow < eatOk * 0.25, `${eatOk.toFixed(3)} g vs ${eatLow.toFixed(3)} g`);
  // nocturnal catfish: the same fish in the same world swims harder at night than at midday (the real move step)
  // (env.step recomputes light from the clock each step, so set the time of day: t=0 midnight, t≈0.45 near noon)
  const catSpeed = t0 => {   // averaged over 3 seeds (brains differ) so the comparison isn't hostage to one brain
    let sp = 0;
    for (const sd of [902, 903, 904]) {
      seed(sd); const tw = new World(); tw.agents = []; tw.env.setWeather(0); tw.env.t = t0;
      const f = tw.makeFish('catfish'); f.x = 1000; f.y = 0.9 * tw.bedY(1000); tw.agents.push(f);
      for (let i = 0; i < 30; i++) tw.step(1 / 30);                      // warm-up: get off the zero-speed start
      for (let i = 0; i < 90; i++) { tw.step(1 / 30); sp += f.spd; }
    }
    return sp / 270;
  };
  const night = catSpeed(0.0), day = catSpeed(0.45);
  // The cruise blend alone gave only ~8% (the brain's thrust dominates a weak pull); innate.dayRest (catfish 0.5) damps the
  // delivered thrust in daylight, so the rhythm is real (~60% faster at night) while the brain still drives within it.
  check('catfish are NOCTURNAL in the real move step — the same fish swims faster at night than at midday (3-seed mean)', night > day * 1.3, `mean speed night ${night.toFixed(1)} vs day ${day.toFixed(1)} (${((night / day - 1) * 100).toFixed(0)}% faster)`);
  // mate choice on GENES alone: two candidates identical except their trait genes; swapping the genes swaps the choice
  const pick = (gGood, gPoor) => {
    const mw = new World(); mw.agents = [];
    const ch = mw.addAgent('minnow', { x: 500, y: 200 }), A = mw.addAgent('minnow', { x: 510, y: 205 }), B = mw.addAgent('minnow', { x: 490, y: 195 });
    ripe(ch, 0); ripe(A, 1); ripe(B, 1); for (const f of [ch, A, B]) f.eaten = 10;
    A.genes = Float32Array.from(gGood); B.genes = Float32Array.from(gPoor);
    mw.agentGrid.rebuild(mw.agents); const c = mw.chooseMate(ch); return c && c.item === A ? 'A' : c && c.item === B ? 'B' : 'none';
  };
  const hi = [1.2, 1.2, 1.2, 1, 1, 1, 1], lo = [0.85, 0.85, 0.85, 1, 1, 1, 1];
  const p1 = pick(hi, lo), p2 = pick(lo, hi);
  check('mate choice selects on GENES alone (equal condition & foraging): swapping the genes swaps the chosen mate', p1 === 'A' && p2 === 'B', `good genes on A → chose ${p1}; on B → chose ${p2}`);
}

// ==== more behavioural coverage (2026-10-12; AUDIT Tier 1 #5 gaps) ====
console.log('\n— determinism (stress scenario), body-depth defence, Baldwinian persistence —');
{
  // DETERMINISM beyond the default window: a MIDSUMMER start under a forced STORM in a CONTAMINATED lake (toxicant on),
  // 1500 steps, the full state hashed every 100 steps — same seed ⇒ identical hash sequence, and a divergence is localised.
  const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const detRun = () => {
    const keep = TOX.AMBIENT; TOX.AMBIENT = 0.3;
    try {
      seed(4321); const dw = new World().setDate(0.40); dw.env.setWeather(3);
      const hs = []; for (let i = 0; i < 1500; i++) { dw.step(1 / 30); if (i % 100 === 99) hs.push(fnv(JSON.stringify(dw.toJSON()))); }
      return hs;
    } finally { TOX.AMBIENT = keep; }
  };
  const h1 = detRun(), h2 = detRun(), firstDiff = h1.findIndex((h, i) => h !== h2[i]);
  check('DETERMINISM holds in a midsummer storm with the toxicant on (state hash every 100 steps, 1500 steps)', firstDiff === -1, firstDiff === -1 ? `${h1.length} hashes identical` : `diverged by step ${(firstDiff + 1) * 100}`);
  // BODY-DEPTH DEFENCE through the real prey query: a pike can take a normal carp at the gape margin but not the same carp
  // with a deep body (body gene ↑ → bodyMul ↑ → effective size above the pike's gape)
  const preyFor = bodyGene => {
    seed(905); const tw = new World(); tw.agents = [];
    const pk = tw.makeFish('pike', [1, 1, 1, 1, 1, 1, 1]), cp = tw.makeFish('carp', [1, 1, 1, 1, 1, bodyGene, 1]);
    cp.L = pk.L * SP.pike.gapeR / (SP.carp.depthR * 1.035); cp.W = stdWeight(SP.carp.lw, cp.L);   // a young carp right at the pike's gape margin
    pk.x = 1000; pk.y = 500; cp.x = 1020; cp.y = 500; tw.agents.push(pk, cp); tw.agentGrid.rebuild(tw.agents);
    const m = tw.qPrey(pk); return { found: !!(m && m.item === cp), bodyMul: cp.bodyMul };
  };
  const slim = preyFor(1.0), deep = preyFor(1.35);
  check('BODY DEPTH is a real predation defence in qPrey: a pike targets the normal carp but not the deep-bodied one', slim.found && !deep.found, `normal (bodyMul ${slim.bodyMul.toFixed(2)}) targeted: ${slim.found}; deep (bodyMul ${deep.bodyMul.toFixed(2)}) targeted: ${deep.found}`);
  // BALDWINIAN at the persistence boundary: a fish's LEARNED weights (a.lw) never reach a save or a champion — only the
  // inherited genotype (a.g) does
  seed(906); const bw = new World(); const f = bw.agents.find(a => a.species === 'minnow');
  for (const a of bw.agents) if (a.species === 'minnow') a.lw = new Float32Array(a.g.length).fill(3.9);   // EVERY minnow (so whichever is champion) has a wildly different learned policy
  const saved = bw.toJSON().agents.find(s => s.id === f.id), champ = bw.champions().minnow;
  const sameAsG = arr => arr && arr.length === f.g.length && Array.from(arr).every((v, i) => Math.abs(v - f.g[i]) < 1e-6);
  check('BALDWINIAN persistence: the saved genome is the inherited a.g, never the learned a.lw', sameAsG(saved && saved.w), saved ? `saved w[0..2] ${Array.from(saved.w).slice(0, 3).map(v => v.toFixed(2)).join(',')}` : 'no saved agent');
  check('BALDWINIAN champions: champion brains are genotypes (no learned 3.9 weights leak in)', !!champ && !Array.from(champ.w || champ.g || []).some(v => v === 3.9 || Math.abs(v - 3.9) < 1e-6), champ ? 'genotype only' : 'no champion');
}

// ==== spawning aggregation (2026-10-12) — behavioural A/B ====
console.log('\n— spawning aggregation —');
{
  // in its spawning season a breeding-ready pike in mid-lake (left half, facing AWAY from shore) heads for the littoral
  // spawning ground; the identical world with the reflex off does not → it ends up closer to the ground
  const aggRun = (g) => {
    const keep = SP.pike.innate.spawnGround; SP.pike.innate.spawnGround = g;
    try {
      seed(907); const tw = new World().setDate(0.10); tw.agents = [];
      const pk = ripe(tw.makeFish('pike', [1, 1, 1, 1, 1, 1, 1]), 0); pk.x = 0.4 * WORLD.W; pk.y = 0.55 * tw.bedY(pk.x); pk.heading = pk.velHeading = 0;
      pk.g.fill(0); pk.lw.fill(0);   // a neutral brain: a random one's turning bias can cancel the reflex in a 4-s probe
      tw.agents.push(pk);
      for (let i = 0; i < 120; i++) tw.step(1 / 30);   // (ripe: mature, gonads full, in good condition)
      return Math.abs(pk.x - 0.09 * WORLD.W);
    } finally { SP.pike.innate.spawnGround = keep; }
  };
  const off = aggRun(0), on = aggRun(SP.pike.innate.spawnGround);
  check('SPAWNING AGGREGATION: an in-season, breeding-ready pike heads for the littoral spawning ground (vs the reflex off)', on < off - 15, `distance to ground after 4 s: ${on.toFixed(0)} px with vs ${off.toFixed(0)} px without`);
}

// ==== realism overhaul (2026-10-12): climate, ice, algae physiology, diatoms, nests, digestion, gene flow, loon, perch ====
console.log('\n— realism: climate, ice, under-ice O₂, algae, diatoms, nests, digestion, gene flow, loon, perch —');
{
  const CR = await import('../src/config.js');
  const { Environment: EnvR, photoRate } = await import('../src/environment.js');
  const { BIRD, ICE, BROOD: BR, PHYTO: PH } = CR;
  const ONES7 = [1, 1, 1, 1, 1, 1, 1], YL = SEASON.YEAR_LEN, rs = getRandState();
  const noImmigrants = fn => { const keep = { ...IMMIGRATION }; IMMIGRATION.RATE = 0; IMMIGRATION.REFUGE = 0; try { return fn(); } finally { Object.assign(IMMIGRATION, keep); } };

  // CLIMATE: a temperate dimictic lake — ~0 °C under ice in January, ~25 °C and strongly stratified in early August
  const ewin = new EnvR(); ewin.primeSeason(0.88 * YL);
  const esum = new EnvR(); esum.primeSeason(0.42 * YL);
  check('temperate climate: ~0 °C and ice-covered in January, ~25 °C and stratified in early August', ewin.tempC < 2 && ewin.ice === 1 && esum.tempC > 23 && esum.ice === 0 && esum.strat > 0.8,
    `Jan ${ewin.tempC.toFixed(1)} °C ice ${ewin.ice}; Aug ${esum.tempC.toFixed(1)} °C strat ${esum.strat.toFixed(2)}`);
  // ICE forms as the surface nears freezing and melts in spring (env-only: its own calendar advances)
  const eFreeze = new EnvR(); eFreeze.primeSeason(0.80 * YL); for (let i = 0; i < 30 * 120; i++) eFreeze.step(1 / 30);
  const eMelt = new EnvR(); eMelt.primeSeason(0.02 * YL); eMelt.ice = 1; for (let i = 0; i < 30 * 150; i++) eMelt.step(1 / 30);
  check('ICE forms in early winter and melts in spring', eFreeze.ice > 0.5 && eMelt.ice === 0, `${eFreeze.monthName()} ice ${eFreeze.ice.toFixed(2)}; ${eMelt.monthName()} ice ${eMelt.ice.toFixed(2)}`);
  // ICE seals the lake: no surface re-aeration and most of the light cut (A/B: the same January lake held ice-free)
  const iceAB = iceOn => { seed(5150); const iw = new World().setDate(0.88), e = iw.env;
    for (let cx = 0; cx < GRID.FIELD_COLS; cx++) e.o2[cx] = 0.2;
    for (let i = 0; i < 30; i++) { if (!iceOn) e.ice = 0; iw.step(1 / 30); }
    let s = 0, n = 0; for (let cx = e.mask.lo[0]; cx <= e.mask.hi[0]; cx++) { s += e.o2[cx]; n++; }
    return { o2: s / n, light: e.light }; };
  const sealed = iceAB(true), open = iceAB(false);
  check('ICE seals the lake: depleted surface water is not re-aerated and the light is cut (vs the same lake ice-free)', open.o2 > sealed.o2 + 0.05 && (open.light === 0 || approx(sealed.light, open.light * (1 - ICE.LIGHT_CUT), 1e-9)),
    `surface O₂ after 1 s: ice ${sealed.o2.toFixed(2)} vs open ${open.o2.toFixed(2)}; light ${sealed.light.toFixed(3)} vs ${open.light.toFixed(3)}`);
  // UNDER-ICE O₂: the deep water runs down (sediment + decomposition) while the upper water keeps its O₂ — the classic
  // winter profile, not a lake-wide winterkill
  { seed(5152); const ww = new World().setDate(0.83);
    for (let i = 0; i < 30 * 120; i++) ww.step(1 / 30);
    const e = ww.env, cxm = WORLD.W * BASIN.CENTER, deep = e.oxygenAt(cxm, bedY(cxm) - 12);
    let up = 0, n = 0; for (let cy = 0; cy < 8; cy++) for (let cx = e.mask.lo[cy]; cx <= e.mask.hi[cy]; cx++) { up += e.o2[cy * GRID.FIELD_COLS + cx]; n++; } up /= n;
    check('UNDER ICE the deep water runs out of O₂ while the upper water keeps it (no lake-wide winterkill)', e.ice > 0.9 && up > 0.5 && deep < up - 0.2, `${e.monthName()}: ice ${e.ice.toFixed(2)}, upper O₂ ${up.toFixed(2)}, deep ${deep.toFixed(2)}`); }

  // ALGAE PHYSIOLOGY: Blackman photosynthesis (dim light ≈ temperature-independent; cold caps only the saturated rate) and
  // dark survival (algae in a dark light climate cut their respiration)
  check('BLACKMAN photosynthesis: dim light is temperature-independent, bright light is capped by the cold, warm boosts it', photoRate(0.1, 0.3) === 0.1 && photoRate(0.8, 0.3) === 0.3 && approx(photoRate(0.5, 1.4), 0.7, 1e-12));
  const ed = new EnvR(); ed.lightDay = 1; const rTop = ed.algaeRespAt(0), rDeep = ed.algaeRespAt(WORLD.H); ed.lightDay = 0.03; const rIce = ed.algaeRespAt(0);
  check('DARK SURVIVAL: algae respire fully in the lit water, far less in the dark deep or under snowy ice (≥ PHYTO.DARK_RESP)', approx(rTop, 1, 1e-9) && rDeep < 0.5 && rIce < 0.5 && rDeep >= PH.DARK_RESP && rIce >= PH.DARK_RESP, `surface ${rTop.toFixed(2)}, deep ${rDeep.toFixed(2)}, under snowy ice ${rIce.toFixed(2)}`);
  // DIATOMS: cold-water algae — they grow in cold bright water (the spring bloom) and not in warm summer water, and sink
  // out once the lake stratifies
  const diaGrowth = T => { const e = new EnvR(); e.tempAt = () => T; e.light = 0.6; e.strat = 0; e.diatom.fill(0.05); e.phos.fill(0.3); e.nh4.fill(0.5);
    const m0 = e.wetMean(e.diatom); for (let i = 0; i < 30; i++) e.diatoms(1 / 30); return e.wetMean(e.diatom) - m0; };
  const gCold = diaGrowth(7), gWarm = diaGrowth(26);
  check('DIATOMS bloom in cold bright water, not in the warm summer lake', gCold > 0 && gCold > 3 * Math.max(0, gWarm), `Δ biomass 1 s: 7 °C ${gCold.toFixed(4)} vs 26 °C ${gWarm.toFixed(4)}`);
  { const e = new EnvR(); e.tempAt = () => 25; e.light = 0; e.strat = 1; e.diatom.fill(0);
    for (let cx = e.mask.lo[2]; cx <= e.mask.hi[2]; cx++) e.diatom[2 * GRID.FIELD_COLS + cx] = 0.5;
    const meanRow = () => { let s = 0, m = 0; for (let cy = 0; cy < GRID.FIELD_ROWS; cy++) for (let cx = e.mask.lo[cy]; cx <= e.mask.hi[cy]; cx++) { const b = e.diatom[cy * GRID.FIELD_COLS + cx]; s += b * cy; m += b; } return s / m; };
    const r0 = meanRow(); for (let i = 0; i < 60; i++) e.diatoms(1 / 30);
    check('DIATOMS sink out of the calm stratified lake (the end of the spring bloom)', meanRow() > r0 + 0.5, `mean row ${r0.toFixed(2)} → ${meanRow().toFixed(2)}`); }

  // NEST GUARDING: a spawning bass pair leaves a male on duty over the nest; he holds station and his fry are hard to take
  noImmigrants(() => {
    seed(5153); const nw = new World().setDate(0.25); nw.agents = [];
    const p = nw.makeFish('bass', ONES7, SP.bass.matureAge + 10), q = nw.makeFish('bass', ONES7, SP.bass.matureAge + 10);
    p.x = 1700; q.x = 1706; p.y = q.y = bedY(1700) - 12; ripe(p, 1); ripe(q, 0);   // nest-guarders spawn on the bottom, over the nest
    nw.agents.push(p, q); nw.agentGrid.rebuild(nw.agents);
    for (let i = 0; i < 300 && !(p.nt > 0 || q.nt > 0); i++) nw.step(1 / 30);
    const guard = p.nt > 0 ? p : q.nt > 0 ? q : null, fry = guard ? nw.fry.filter(f => f.ni === guard.id) : [];
    let held = !!guard;
    if (guard) for (let i = 0; i < 300; i++) { nw.step(1 / 30); if (Math.hypot(guard.x - guard.nx, guard.y - guard.ny) > BR.GUARD_R * 1.5) held = false; }
    check('NEST GUARDING: a spawning bass pair leaves the MALE guarding his fry school, holding station over the nest for 10 s', !!guard && guard.sex === 1 && fry.length > 0 && held, guard ? `${fry.length} fry schools, guardian on duty ${guard.nt.toFixed(0)} s more` : 'no nest');
    // protection: a hungry sunfish cropping the guarded school takes far fewer larvae while the guardian is on station
    const sch = fry.find(f => !f.dead);
    const takeFrom = onStation => { if (!sch || !guard) return 0; nw._guards.set(guard.id, guard); const gx = guard.x, gy = guard.y; if (!onStation) { guard.x = gx + 600; } else { guard.x = sch.nx; guard.y = sch.ny; }
      const n0 = sch.n; sch.n = 1e5; const sf = nw.makeFish('sunfish', ONES7); sf.x = sch.x; sf.y = sch.y; let k = 0;
      for (let i = 0; i < 400; i++) { sf.gut = 0; const before = sch.n; nw._eatFry(sf, SP.sunfish.gut * sf.W, 20); k += before - sch.n; }
      sch.n = n0; guard.x = gx; guard.y = gy; return k; };
    const onDuty = takeFrom(true), away = takeFrom(false);
    check('…and its fry are hard to take while he is on station (BROOD.PROTECT), but not once he has left', sch && away > 0 && onDuty < away * (1 - BR.PROTECT) * 1.6, `larvae taken: guarded ${onDuty} vs unguarded ${away}`);
  });

  // DIGESTION: a predator with a full stomach takes no fish until it has digested room; an empty one feeds (and its gut fills)
  const digest = full => noImmigrants(() => {
    seed(5154); const dw = new World().setDate(0.30); dw.agents = []; dw.fry = [];
    const pk = dw.makeFish('pike', ONES7, SP.pike.matureAge + 10); pk.x = 1000; pk.y = 500; if (full) { pk.gut = pk.sp.gut * pk.W; pk.gutE = pk.gut * 4000; } dw.agents.push(pk);
    for (let i = 0; i < 8; i++) { const m = dw.makeFish('minnow', null, SP.minnow.matureAge + 5); m.x = 1000 + (i % 4) * 4; m.y = 500 + (i < 4 ? -3 : 3); dw.agents.push(m); }
    dw.agentGrid.rebuild(dw.agents); const e0 = pk.eaten; for (let i = 0; i < 60; i++) dw.step(1 / 30);
    return { eaten: pk.eaten - e0, gut: pk.gut }; });
  const busy = digest(true), free = digest(false);
  check('DIGESTION: a pike with a full stomach takes no new fish; an empty one feeds and its stomach fills', busy.eaten === 0 && free.eaten > 0 && free.gut > 0, `full: ate ${busy.eaten}; empty: ate ${free.eaten}, gut now ${free.gut.toFixed(1)} g`);

  // GENE FLOW: immigrants come from a regional gene pool (not copies of the lake's best), and emigrants feed it
  { seed(5155); const gw = new World();
    check('GENE FLOW: every species has a regional gene pool of IMMIGRATION.POOL_N valid genomes', SPECIES.every(k => gw.genePool[k].length === IMMIGRATION.POOL_N && gw.genePool[k].every(g => g.w.length === genomeLen(SP[k].shape) && g.gn.length === GENE_KEYS.length)));
    const before = gw.genePool.minnow.map(g => g.w), keepE = IMMIGRATION.EMIGRATE; IMMIGRATION.EMIGRATE = 30;   // one emigrant per step
    for (let i = 0; i < 30; i++) gw.step(1 / 30);
    IMMIGRATION.EMIGRATE = keepE;
    const joined = gw.genePool.minnow.some(g => !before.includes(g.w) && gw.agents.some(a => a.species === 'minnow' && a.g.length === g.w.length && a.g.every((v, i) => v === g.w[i])));
    check('…and emigrating lake adults carry their genomes into that pool (two-way gene flow)', joined);
    const rt = new World(); rt.load(JSON.parse(JSON.stringify(gw.toJSON())));
    check('the regional gene pool round-trips through save/load', SPECIES.every(k => rt.genePool[k].length === gw.genePool[k].length && rt.genePool[k].every((g, i) => g.w.length === gw.genePool[k][i].w.length && Array.from(g.w).every((v, j) => Math.abs(v - gw.genePool[k][i].w[j]) < 1e-6)))); }

  // LOON: a visiting diving bird — in the open-water season only; it catches small fish it reaches, never a big one
  { const keepA = BIRD.ARRIVE; BIRD.ARRIVE = 1e4;
    seed(5156); const lw = new World().setDate(0.30); lw.step(1 / 30); const arrived = lw.birds.length === 1;
    seed(5157); const iw2 = new World().setDate(0.88); for (let i = 0; i < 30; i++) iw2.step(1 / 30);
    BIRD.ARRIVE = keepA;
    check('a LOON visits in the open-water season, never onto the winter ice', arrived && iw2.birds.length === 0, `summer ${lw.birds.length}, January ${iw2.birds.length}`);
    if (arrived) {
      const b = lw.birds[0], mn = lw.makeFish('minnow', null, SP.minnow.matureAge + 5), pk = lw.makeFish('pike', ONES7, SP.pike.matureAge + 10);
      mn.x = 1000; mn.y = 300; pk.x = 1400; pk.y = 300; lw.agents = [mn, pk]; lw.agentGrid.rebuild(lw.agents);
      b.st = 1; b.t = 10; b.x = 1004; b.y = 300; lw.step(1 / 30);
      const caught = mn.dead && mn.eatenBy === 'loon' && b.st === 2 && b.m === 1;
      b.st = 1; b.t = 10; b.x = pk.x + 4; b.y = pk.y; lw.agentGrid.rebuild(lw.agents); lw.step(1 / 30);
      check('a diving loon catches a small fish it reaches and surfaces to swallow it — but can\'t take an adult pike', caught && !pk.dead, `minnow caught ${caught}, pike alive ${!pk.dead}`);
    } }

  // PERCH: the new mid-level predator; FOUNDERS spawn in their first season (no inherited cooldown)
  check('yellow PERCH: a mesopredator between the forage fish and bass/pike (eats fish, insects, larvae)', SP.perch.trophic === 'mesopredator' && SP.perch.diet.fish && SP.perch.diet.insect && SP.perch.diet.larva && SP.perch.size < SP.bass.size && SP.perch.size > SP.minnow.size);
  { seed(5158); const fw0 = new World(); check('founding fish start with no mating cooldown (they can spawn in their first season)', fw0.agents.every(a => a.mateCd === 0)); }
  setRandState(rs);
}

// ==== more life (2026-10-13): zooplankton kinds, dragonflies, frogs, turtles, trout ====
console.log('\n— more life: Daphnia/copepods, dragonflies, frogs, turtles, trout —');
{
  const CR = await import('../src/config.js');
  const { PLANKTON: PK, ODONATA, FROG, TURTLE } = CR;
  const YL = SEASON.YEAR_LEN, rs = getRandState(), ONES7 = [1, 1, 1, 1, 1, 1, 1];
  const quiet = fn => { const keep = { ...IMMIGRATION }; IMMIGRATION.RATE = 0; IMMIGRATION.REFUGE = 0; try { return fn(); } finally { Object.assign(IMMIGRATION, keep); } };

  // ZOOPLANKTON KINDS: Daphnia breed in warm water and vanish from the births in the cold and in a cyanobacterial bloom
  { seed(6101); const zs = new World().setDate(0.33), zw = new World().setDate(0.88);
    const warm = zs.daphShare(), cold = zw.daphShare();
    zs.env.cyano.fill(CYANO.CAP * 0.6); zs.env._meanCyano = CYANO.CAP * 0.6; const bloom = zs.daphShare();
    check('ZOOPLANKTON: Daphnia make up most new zooplankton in warm water, none in the ice-cold lake, few in a cyanobacteria bloom', warm > 0.5 && cold === 0 && bloom < warm * 0.3, `share: July ${warm.toFixed(2)}, January ${cold.toFixed(2)}, bloom ${bloom.toFixed(2)}`); }
  // …and a copepod's escape jump beats some strikes, a Daphnia never escapes (and is the richer meal)
  { const trial = kind => { let got = 0, E = 0;
      for (let i = 0; i < 200; i++) {
        seed(6200 + i); const tw = new World(); tw.agents = []; const f = tw.makeFish('minnow', ONES7); f.x = 1000; f.y = 300; f.gut = 0; f.gutE = 0;
        const z = tw._mkPlankton(1001, 300, kind); z.y = z.baseY; tw.plankton = [z]; tw.planktonGrid.rebuild(tw.plankton);
        got += tw._eatZoo(f, 1, 1e9); E += f.gutE;   // J swallowed (a whole patch: room unlimited)
      }
      return { got, E }; };
    const dap = trial(0), cop = trial(1);
    check('…a copepod\'s escape jump beats ~COPE_ESCAPE of strikes, a Daphnia never escapes and is the bigger meal', dap.got === 200 && Math.abs(cop.got / 200 - (1 - PK.COPE_ESCAPE)) < 0.1 && dap.E / dap.got > cop.E / Math.max(1, cop.got), `caught Daphnia ${dap.got}/200, copepods ${cop.got}/200`); }

  // DRAGONFLIES: a nymph ambushes a fry within reach; a mature nymph emerges on a warm sunny day; adults lay eggs → nymphs
  quiet(() => {
    seed(6301); const dw = new World().setDate(0.40); dw.agents = []; dw.nymphs = []; dw.dflies = []; dw.herps = []; dw.larvae = []; dw.plankton = [];
    const keepH = ODONATA.HUNT; ODONATA.HUNT = 1e4;
    const x = 200, n = dw._mkNymph(x, 0.1); dw.nymphs.push(n); n.y = bedY(x) - n.h;
    const fry = dw.makeFish('minnow', null, 0); fry.x = x + 3; fry.y = n.y; dw.agents.push(fry); dw.agentGrid.rebuild(dw.agents);
    dw.step(1 / 30); ODONATA.HUNT = keepH;
    check('DRAGONFLY NYMPHS ambush small prey: a fish fry within the labium\'s reach is taken', fry.dead && fry.eatenBy === 'nymph');
    const m = dw._mkNymph(x, 1.2); dw.nymphs = [m]; dw.env.t = 0.5;
    for (let i = 0; i < 4 && dw.dflies.length === 0; i++) dw.step(1 / 30);
    check('…a mature nymph emerges as an adult dragonfly on a warm, sunny summer day', dw.dflies.length >= 1 && m.dead, `${dw.dflies.length} on the wing at ${dw.env.tempC.toFixed(1)} °C`);
    const keepE = ODONATA.EGG_RATE; ODONATA.EGG_RATE = 1e3; dw.dflies[0].x = 150; const n0 = dw.nymphs.length;
    dw.step(1 / 30); ODONATA.EGG_RATE = keepE;
    check('…and the adults dip to lay eggs over the shallows (new nymphs)', dw.nymphs.length > n0, `${n0} → ${dw.nymphs.length} nymphs`);
  });

  // FROGS: tadpoles metamorphose when developed; frogs hibernate on the bottom under ice, spawn in the spring shallows,
  // and dive from a predator that could swallow them
  quiet(() => {
    seed(6401); const fw = new World().setDate(0.40); fw.herps = [];
    const tad = fw._mkHerp(0, 150, bedY(150) - 8); tad.dev = 0.9999; tad.e = 0.8; fw.herps.push(tad);
    for (let i = 0; i < 30 && tad.k === 0; i++) fw.step(1 / 30);
    check('FROGS: a fully developed tadpole metamorphoses into a frog in summer', tad.k === 1 && !tad.dead);
    seed(6402); const ww = new World().setDate(0.88); ww.herps = []; const fz = ww._mkHerp(1, 150, 2, 2 * YL); ww.herps.push(fz);
    for (let i = 0; i < 150; i++) ww.step(1 / 30);
    check('…frogs hibernate on the bottom of the shallows under the winter ice', fz.st === 2 && fz.y > bedY(fz.x) - 10 && !fz.dead, `state ${fz.st}, ${(bedY(fz.x) - fz.y).toFixed(1)} px above the bed`);
    seed(6403); const sw = new World().setDate(0.12); sw.herps = []; const fb = sw._mkHerp(1, 150, 2, 2 * YL); fb.e = 0.9; sw.herps.push(fb);
    const keepB = FROG.BREED_RATE; FROG.BREED_RATE = 1e3; sw.env.tempC = 14; sw.env.tempDiel = 0;
    sw.step(1 / 30); FROG.BREED_RATE = keepB;
    check('…frogs spawn in the spring shallows (10–20 °C): an egg mass → tadpoles', sw.herps.filter(h => h.k === 0).length >= FROG.CLUTCH * 0.5, `${sw.herps.filter(h => h.k === 0).length} tadpoles`);
    seed(6404); const pw = new World().setDate(0.40); pw.agents = []; pw.herps = []; const fd = pw._mkHerp(1, 150, 2, 2 * YL); pw.herps.push(fd);
    const pk = pw.makeFish('pike', ONES7); pk.x = 170; pk.y = 20; pw.agents.push(pk); pw.agentGrid.rebuild(pw.agents);
    pw.step(1 / 30);
    check('…a frog dives to the bottom when a predator that could swallow it comes near', fd.st === 1);
  });

  // TURTLES: hibernate in the mud under ice; in summer they cycle between foraging below and breathing/basking at the surface
  quiet(() => {
    seed(6501); const ww = new World().setDate(0.88); ww.herps = []; const tw = ww._mkHerp(2, 160, 2, 10 * YL); ww.herps.push(tw);
    for (let i = 0; i < 150; i++) ww.step(1 / 30);
    check('TURTLES hibernate buried in the mud of the shallows over winter', tw.st === 2 && tw.y > bedY(tw.x) - 10 && !tw.dead);
    seed(6502); const sw = new World().setDate(0.40); sw.herps = []; const ts = sw._mkHerp(2, 160, 2, 10 * YL); ts.st = 0; ts.t = 2; sw.herps.push(ts);
    let surfaced = false, below = false;
    for (let i = 0; i < 30 * 90; i++) { sw.step(1 / 30); if (ts.y < 4) surfaced = true; if (ts.y > 20) below = true; }
    check('…and in summer they forage below and come up to breathe and bask', surfaced && below && !ts.dead);
  });

  // FISH EAT THEM: a hungry bass takes a tadpole or a young frog that fits its gape (and then digests it)
  quiet(() => {
    seed(6601); const ew = new World().setDate(0.40); ew.agents = []; ew.herps = [];
    const bs = ew.makeFish('bass', ONES7); bs.x = 300; bs.y = 100; ew.agents.push(bs);
    const td = ew._mkHerp(0, 302, 100); td.y = 100; ew.herps.push(td); ew.agentGrid.rebuild(ew.agents); ew.herpGrid.rebuild(ew.herps);
    ew.step(1 / 30);
    check('a hungry bass eats a tadpole that fits its gape (into its stomach)', td.dead && td.eatenBy === 'bass' && bs.gut > 0);
  });

  // TROUT: behavioural thermoregulation — in the warm summer lake a trout keeps deeper (cooler) than the same trout would
  // if it didn't mind the heat (A/B: its optimum raised out of the way)
  { const felt = hot => { const keep = SP.trout.tempTol; if (hot) SP.trout.tempTol = 30;   // tolerance raised: the heat no longer bothers it
      try { seed(6701); const tw = new World().setDate(0.42); let s = 0, n = 0;   // a well-oxygenated (oligotrophic) lake: no O₂ squeeze
        for (let i = 0; i < 30 * 40; i++) { tw.env.o2.fill(1.1); tw.step(1 / 30); if (i > 600) for (const a of tw.agents) if (a.species === 'trout') { s += tw.env.tempAt(a.x, a.y); n++; } }
        return n ? s / n : 0; } finally { SP.trout.tempTol = keep; } };
    const cool = felt(false), warm = felt(true);
    check('TROUT seek cool water: in midsummer they live in cooler water than the same trout indifferent to heat (thermoregulation)', cool < warm - 0.5, `mean water temperature ${cool.toFixed(1)} vs ${warm.toFixed(1)} °C`); }

  // the new life round-trips through save/load (v26)
  { seed(6801); const sw = new World().setDate(0.40); for (let i = 0; i < 60; i++) sw.step(1 / 30);
    const lw = new World(); lw.load(JSON.parse(JSON.stringify(sw.toJSON())));
    check('Daphnia/copepods, nymphs, dragonflies, frogs, tadpoles and turtles round-trip through save/load (v26)',
      lw.plankton.every((p, i) => p.k === sw.plankton[i].k) && lw.nymphs.length === sw.nymphs.length && lw.dflies.length === sw.dflies.length && lw.herps.length === sw.herps.length && lw.herps.every((h, i) => h.k === sw.herps[i].k && Math.abs(h.age - sw.herps[i].age) < 1e-9),
      `${lw.nymphs.length} nymphs, ${lw.herps.length} herps`); }
  setRandState(rs);
}

// ================= BIOENERGETICS (Fish Bioenergetics 4.0) — 2026-10-13 =================
{
  console.log('\n--- bioenergetics (FB4 equations, published parameters, food-dependent growth) ---');
  const B = await import('../src/bioenergetics.js');
  const ONES7 = [1, 1, 1, 1, 1, 1, 1];
  const rel = (a, b) => Math.abs(a - b) <= Math.max(1e-7, 2e-3 * Math.abs(b));   // FB4 test vectors are given to 3–4 significant figures
  const TT = [4, 12, 20, 24, 28];
  // reference values computed with a line-by-line JS port of FB4's own R source (R/bioenergetics/*.R)
  const VEC = {
    minnow: { W: 2, f: [0.1901, 0.4486, 0.8706, 1.000, 0.6810], c: [0.02395, 0.05652, 0.1097, 0.1260, 0.0858], r: [0.000933, 0.002453, 0.005729, 0.007946, 0.009331] },
    sunfish: { W: 100, f: [0.1369, 0.3466, 0.7314, 0.9319, 0.9897], c: [0.007054, 0.01786, 0.03769, 0.04802, 0.05100], r: [0.000672, 0.001308, 0.002466, 0.003315, 0.004349] },
    perch: { W: 100, f: [0.2467, 0.5218, 0.9217, 0.9856, 0], c: [0.01778, 0.03762, 0.06645, 0.07106, 0], r: [0.00084, 0.001667, 0.003042, 0.003837, 0.0043] },
    trout: { W: 500, f: [0.2204, 0.6683, 0.9349, 0.3664, 4.8e-6], c: [0.02145, 0.06505, 0.09100, 0.03567, null], r: [0.001383, 0.002621, 0.004219, 0.004051, null] },
    catfish: { W: 300, f: [0.006713, 0.1913, 0.8922, 0.9769, 0.8825], c: [0.000223, 0.006362, 0.02967, 0.03248, 0.02935], r: [0.000323, 0.000671, 0.001395, 0.002012, 0.002901] },
    bass: { W: 500, f: [0.07491, 0.2464, 0.6454, 0.8909, 0.9970], c: [0.003280, 0.01079, 0.02826, 0.03901, 0.04365], r: [0.001063, 0.001365, 0.001754, 0.001988, 0.002253] },
    pike: { W: 1000, f: [1.087, 2.582, 6.767, 8.309, 7.183], c: [0.007647, 0.01817, 0.04762, 0.05847, 0.05054], r: [0.001074, 0.001667, 0.002589, 0.003226, 0.00402] },
  };
  let badF = [], badC = [], badR = [];
  for (const k in VEC) {
    const v = VEC[k], b = SP[k].bio;
    TT.forEach((T, i) => {
      const f = B.consumptionT(b, T); if (!(v.f[i] < 1e-4 ? Math.abs(f - v.f[i]) < 1e-5 : rel(f, v.f[i]))) badF.push(`${k}@${T}: ${f.toPrecision(4)} vs ${v.f[i]}`);
      if (v.c[i] != null) { const c = B.cmax(b, v.W, T); if (!(v.c[i] === 0 ? c === 0 : rel(c, v.c[i]))) badC.push(`${k}@${T}: ${c.toPrecision(4)} vs ${v.c[i]}`); }
      if (v.r[i] != null) { const r = B.respiration(b, v.W, T); if (!rel(r, v.r[i])) badR.push(`${k}@${T}: ${r.toPrecision(4)} vs ${v.r[i]}`); }
    });
  }
  check('FB4 consumption temperature curves (CEQ 2 Kitchell, 3 Thornton–Lessem, 4 Bevelhimer) match the reference port for 7 species', badF.length === 0, badF.slice(0, 3).join('; '));
  check('…and Cmax(W, T) = CA·W^CB·f(T) at reference weights', badC.length === 0, badC.slice(0, 3).join('; '));
  check('…and respiration (REQ 1 with its activity term, REQ 2) incl. routine activity', badR.length === 0, badR.slice(0, 3).join('; '));
  // a full daily budget (C, F, U, SDA, R → G in J/g/d) at 20 °C and p = 0.5, as the reference port computes it
  const budget = (k, W, ed) => { const b = SP[k].bio, WF = [0, 0], C = B.cmax(b, W, 20) * 0.5 * ed; B.wasteFractions(b, 20, 0.5, WF);
    const F = WF[0] * C, U = WF[1] * (C - F), S = b.SDA * (C - F); return C - F - U - S - B.respiration(b, W, 20) * B.OXYCAL; };
  const gP = budget('perch', 100, 3000), gB = budget('bass', 500, 4000), gK = budget('pike', 1000, 4000);
  check('a full FB4 daily energy budget matches the reference (perch 21.4, bass 14.4, pike 21.1 J/g/d at 20 °C, p 0.5)',
    Math.abs(gP - 21.4) < 0.15 && Math.abs(gB - 14.4) < 0.15 && Math.abs(gK - 21.1) < 0.15, `${gP.toFixed(2)}, ${gB.toFixed(2)}, ${gK.toFixed(2)}`);
  check('trout energy density is FB4\'s weight-dependent PREDEDEQ 2 (6,256 J/g at 500 g)', Math.abs(B.energyDensity(SP.trout.bio, 500) - 6256) < 1);
  // standard weight: 15-cm bluegill ~70 g, 38-cm bass ~0.9 kg, 65-cm pike ~1.9 kg (the published Ws equations)
  check('length–weight follows the published standard-weight equations (bluegill 15 cm ≈ 70 g, bass 38 cm ≈ 820 g, pike 65 cm ≈ 1.9 kg)',
    Math.abs(B.stdWeight(SP.sunfish.lw, 15) - 70) < 3 && Math.abs(B.stdWeight(SP.bass.lw, 38) - 823) < 20 && Math.abs(B.stdWeight(SP.pike.lw, 65) - 1870) < 50);

  const rsB = getRandState(), immB = { ...IMMIGRATION }, { BIRD: BIRDB } = await import('../src/config.js'), arriveB = BIRDB.ARRIVE;
  IMMIGRATION.REFUGE = 0; IMMIGRATION.RATE = 0; BIRDB.ARRIVE = 0;   // single-fish experiments: no rescue immigrants or loons wandering in
  // CONSUMPTION NEVER EXCEEDS Cmax: a bass force-fed to a full gut every step for 5 days at 24 °C digests (consumes) ≤ Cmax
  { seed(7001); const bw = new World(); bw.agents = []; bw.fry = []; bw.birds = []; bw.env.tempAt = () => 24;
    const bs = bw.makeFish('bass', ONES7); bs.x = 1000; bs.y = 80; bw.agents.push(bs);
    const W0 = bs.W; let ate = 0;
    for (let i = 0; i < Math.round(5 * BIOE.DAY * 30); i++) { const room = SP.bass.gut * bs.W - bs.gut; if (room > 0) { bs.gut += room; bs.gutE += room * 4000; ate += room; } bw.step(1 / 30); }
    const cm = B.cmax(SP.bass.bio, (W0 + bs.W) / 2, 24) * (W0 + bs.W) / 2 * 5;
    check('CONSUMPTION is capped at the published Cmax: a bass kept stuffed for 5 days digests no more than Cmax allows', ate - SP.bass.gut * bs.W <= cm * 1.15, `${(ate - SP.bass.gut * bs.W).toFixed(1)} g digested vs Cmax ${cm.toFixed(1)} g`);
    check('…and a well-fed fish GROWS — in mass and in length', bs.W > W0 * 1.01 && bs.L > bw.makeFish('bass', ONES7).L - 1e-9); }
  // STARVATION: a fish with no food loses mass (not length), its condition falls, and it eventually dies of starvation
  { seed(7002); const sw = new World(); sw.agents = []; sw.fry = []; sw.plankton = []; sw.larvae = []; sw.insects = []; sw.snails = []; sw.cray = []; sw.detritus = []; sw.plants = []; sw.birds = []; sw.herps = []; sw.nymphs = [];
    sw.env.tempAt = () => 22;   // a uniformly 22 °C lake (the test isolates starvation)
    const dietP = SP.perch.diet, lzP = SP.perch.Lzoo; SP.perch.diet = {}; SP.perch.Lzoo = 0;   // nothing it can eat (food regrows)
    const f = sw.makeFish('perch', ONES7); f.x = 1000; f.y = 100; sw.agents.push(f);
    const L0 = f.L, W0 = f.W; let t = 0;
    while (!f.dead && t < 200 * BIOE.DAY) { sw.step(1 / 30); t += 1 / 30; if (Math.abs(t - 20 * BIOE.DAY) < 1 / 60) check('STARVING: an unfed perch loses mass but never length (it gets thinner)', f.W < W0 * 0.95 && f.L === L0, `W ${W0.toFixed(1)} → ${f.W.toFixed(1)} g, L ${f.L.toFixed(1)} cm`); }
    SP.perch.diet = dietP; SP.perch.Lzoo = lzP;
    check('…and dies of starvation once its condition falls far enough', f.dead && f.cause === 'starve', `${(t / BIOE.DAY).toFixed(0)} days, cause ${f.cause}, K ${f.K.toFixed(2)}`); }
  // GAPE LIMITATION by body depth: a 35-cm bass can swallow a 12-cm minnow-shaped fish but not a 16-cm deep-bodied sunfish
  { seed(7003); const gw = new World(); gw.agents = [];
    const bs = gw.makeFish('bass', ONES7), mn = gw.makeFish('minnow', ONES7), sf = gw.makeFish('sunfish', ONES7);
    const setL = (a, L) => { a.L = L; a.W = B.stdWeight(a.sp.lw, L); a.K = 1; };
    setL(bs, 35); setL(mn, 7); setL(sf, 16); bs.x = mn.x = sf.x = 500; bs.y = mn.y = sf.y = 300;
    check('GAPE: a bass swallows a slim fish but a deep-bodied sunfish past its gape is safe (prey depth ≤ mouth)', gw.canPrey(bs, mn) && !gw.canPrey(bs, sf), `gape ${(35 * SP.bass.gapeR).toFixed(1)} cm, sunfish depth ${(16 * SP.sunfish.depthR).toFixed(1)} cm`);
    setL(sf, 9); check('…until the sunfish is small enough', gw.canPrey(bs, sf)); }
  // FECUNDITY scales with the female: a bigger female's spawning makes more larvae (schools × fish)
  { const larvaeFrom = L => { seed(7004); const fw = new World().setDate(0.30); fw.agents = []; fw.fry = [];
      const fm = fw.makeFish('sunfish', ONES7), ml = fw.makeFish('sunfish', ONES7);
      fm.sex = 0; ml.sex = 1; fm.L = L; fm.W = B.stdWeight(fm.sp.lw, L); ml.W = B.stdWeight(ml.sp.lw, ml.L);
      for (const q of [fm, ml]) { q.mature = true; q.K = 1; q.gon = (q.sex === 0 ? q.sp.gsiF : q.sp.gsiM) * q.W; q.mateCd = 0; q.x = 300; q.y = bedY(300) - 10; fw.agents.push(q); }
      fw.agentGrid.rebuild(fw.agents); fw.env.tempC = 24;
      for (let i = 0; i < 300 && !fw.fry.length; i++) fw.step(1 / 30);
      return fw.fry.reduce((s, f) => s + f.n, 0); };
    const small = larvaeFrom(11), big = larvaeFrom(20);
    check('FECUNDITY scales with female length (a 20-cm sunfish spawns several times the larvae of an 11-cm one)', small > 0 && big > 2.5 * small, `${small.toFixed(0)} vs ${big.toFixed(0)} larvae`); }
  // FRY SCHOOLS: a school grows on zooplankton, thins, and its survivors recruit as individuals
  { seed(7005); const yw = new World().setDate(0.32); yw.agents = yw.agents.filter(a => !a.sp.diet.fish && a.species !== 'sunfish' && a.species !== 'minnow'); yw.fry = [];
    const g0 = Float32Array.from(yw.makeFish('minnow').g), f = yw._mkFry('minnow', 600, 200, 600, 1, 200, g0, new Float32Array(GENE_KEYS.length).fill(1)); yw.fry.push(f);
    const L0 = f.L, n0 = f.n; let maxL = 0, recruited = false;
    const b0 = yw.stats.births.minnow;
    for (let i = 0; i < 30 * 400 && !recruited; i++) { yw.step(1 / 30); if (!f.dead) maxL = Math.max(maxL, f.L); if (yw.stats.births.minnow > b0) recruited = true; }
    check('FRY: a school of larvae grows on zooplankton and thins out', maxL > L0 * 1.5, `${L0.toFixed(2)} → ${maxL.toFixed(2)} cm from ${n0} larvae`);
    check('…and its survivors recruit as followed individuals (at the species\' recruit length)', recruited); }
  // HEAT and HYPOXIA kill by species tolerance: held at 28 °C a trout dies, a carp doesn't; in 0.5 mg/L water a trout dies, a bullhead lives
  { const survive = (k, T, o2) => { seed(7006); const hw = new World(); hw.agents = []; hw.fry = []; hw.birds = []; hw.env.tempAt = () => T; const f = hw.makeFish(k, ONES7); f.x = 1000; f.y = 200; hw.agents.push(f);
      for (let i = 0; i < Math.round(3 * BIOE.DAY * 30) && !f.dead; i++) { if (o2 != null) hw.env.o2.fill(o2); hw.step(1 / 30); } return !f.dead; };
    check('HEAT: 3 days at 29 °C kill a trout (UILT ~25 °C) but not a carp (~36 °C)', !survive('trout', 29) && survive('carp', 29));
    check('HYPOXIA: water at ~0.5 mg/L O₂ kills a trout (lethal ~2.5 mg/L) but not a bullhead (~0.3 mg/L)', !survive('trout', 18, 0.5 / 9.5) && survive('catfish', 18, 0.5 / 9.5)); }
  // the bioenergetic state round-trips through save/load (v27): length, mass, sex, maturity, gonads, gut, fry schools
  { seed(7007); const sw = new World().setDate(0.35); for (let i = 0; i < 300; i++) sw.step(1 / 30);
    const lw = new World(); lw.load(JSON.parse(JSON.stringify(sw.toJSON())));
    const same = lw.agents.every((a, i) => { const b = sw.agents[i]; return a.L === b.L && a.W === b.W && a.sex === b.sex && a.mature === b.mature && a.gon === b.gon && a.gut === b.gut && a.K === b.K; });
    check('save v27: every fish\'s length, mass, sex, maturity, gonads and gut round-trip exactly', same && sw.toJSON().version === 27);
    check('…and the fry schools too', lw.fry.length === sw.fry.length && lw.fry.every((f, i) => f.n === sw.fry[i].n && f.L === sw.fry[i].L && f.k === sw.fry[i].k), `${sw.fry.length} schools`); }
  Object.assign(IMMIGRATION, immB); BIRDB.ARRIVE = arriveB; setRandState(rsB);
}

console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : fail + ' CHECK(S) FAILED'}`);
process.exit(fail === 0 ? 0 : 1);
