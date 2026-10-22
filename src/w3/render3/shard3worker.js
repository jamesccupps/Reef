// shard3worker.js — one SHARD of the 3-D lakes' fish on a core of its own (browser layer: a module Worker importing only the pure
// sim; docs/TRUE_SCALE.md T5). The sim's worker (render3/sim3worker.js) holds the water model and steps it; this worker builds a
// replica whose arrays are the water's own (shared memory: src/w3/envshare3.js), founds the lakes' fish as one worker would and
// keeps those of its water (src/w3/shard3.js: 0 Upper; 1 Lower and the brook), then, on each 'step', lives them through it and
// answers with the fish that left its water, its couplings (fish per species, young, biomass), and what the view draws.
import { R5 } from './world3sel.js';   // (first: the world, from this worker's URL)
import { Env3 } from '../env3.js';
import { Fish3, stageR5 } from '../fish3.js';
import { adoptArrays, setScalars } from '../envshare3.js';
import { waterOwners, shardBudgetHa, shardSeed, ID_STRIDE } from '../shard3.js';
import { getRandState, setRandState } from '../../core.js';
import { remember, drawnOf, packDrawn, selInfoOf, statsPart } from './fishside3.js';

let env = null, F = null, me = -1; const memo = {};
const reply = (m, tr = []) => postMessage(m, tr);
const couplings = () => ({ cnt: Float64Array.from(F.cnt), juvOwn: F.juvOwn ? Float64Array.from(F.juvOwn) : null, bio: F.bio, nearN: F.nearN || 0, agents: F.fish.length, nyAll: F.yoy.length });
onmessage = ev => {
  const m = ev.data;
  try {
    if (m.type === 'init') {
      me = m.me; stageR5(R5); setRandState(m.st0); env = new Env3();   // (the whole model, as the sim's worker: world3sel R5) const missed = adoptArrays(env, m.arrays); setScalars(env, m.scalars);
      const stF = getRandState(); F = new Fish3(env, { young: true });   // (the founding as one worker's, the same draws)
      F.setShard(me, waterOwners(env.G), shardBudgetHa(me)); F.nextId += me * ID_STRIDE; setRandState(shardSeed(stF, me)); remember(F, true);
      reply({ type: 'ready', me, missed, ...couplings() });
    } else if (m.type === 'step') {
      if (m.scalars) setScalars(env, m.scalars);
      F.cntOther = m.cntOther; F.juvOther = m.juvOther; if (m.adopt) F.adopt(m.adopt);
      if (m.focus) F.setFocus(m.focus[0], m.focus[1], m.focus[2]); else F.setFocus(null);
      remember(F, true); F.step(m.h, m.mv); const out = F.takeOut();
      const d = m.cam !== undefined ? packDrawn(F, drawnOf(F, F.fish, F._region, m.cam, true), drawnOf(F, F.yoy, F._yRegion, m.cam, true)) : null;
      const sel = m.sel ? selInfoOf(F, env, memo, m.sel[0], m.sel[1], m.h <= 0.1) : null;
      reply({ type: 'stepped', me, out, rises: F.rises.slice(), drawn: d, sel, stats: m.stats ? statsPart(F) : null, ...couplings() }, d ? [d.fb.buffer, d.yb.buffer] : []);
    } else if (m.type === 'season') {   // (a jump forward in the year: the water primed by the sim's worker; the skipped spawnings here)
      setScalars(env, m.scalars); F.seedSeason(m.y0, m.y1, true); remember(F, true); reply({ type: 'seasoned', me, ...couplings() });
    }
  } catch (e) { reply({ type: 'error', me, text: String(e && e.stack || e) }); }
};
postMessage({ type: 'loaded' });
