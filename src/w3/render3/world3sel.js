// world3sel.js — which world the 3-D view shows (browser layer). `w3.html?world=true` opens the Hot Brook lakes at their TRUE
// size (docs/TRUE_SCALE.md); without it, the 1/10 world. Imported FIRST by main3.js and by the sim's worker (whose URL carries
// the same query), so that src/w3/geometry.js — which reads globalThis.HB_WORLD as Node reads HB_WORLD=true — picks the world.
const q = new URLSearchParams(globalThis.location ? globalThis.location.search : '');
if (q.get('world') === 'true') globalThis.HB_WORLD = 'true';
export const WORLD_Q = globalThis.location ? globalThis.location.search : '';
// THE WHOLE MODEL IN THE LIVE VIEW (the human, 2026-10-22: "this is now a whole environment simulator"): the view's sim runs the full
// package (fish3 stageR5 — the wildlife, the turtles and frogs, the anglers, the moose, the weather's fronts, the inflow's nitrogen, the
// census as the human knows it …), as the GPU year runner's ?r5=1 does; `?r5=0` shows the base model. Each worker and the page apply it
// before anything is built (sim3worker, shard3worker, main3)
export const R5 = q.get('r5') !== '0';   // (the worker's URL takes the page's query along: ?world=true, ?shards=0)
