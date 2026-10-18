// world3sel.js — which world the 3-D view shows (browser layer). `w3.html?world=true` opens the Hot Brook lakes at their TRUE
// size (docs/TRUE_SCALE.md); without it, the 1/10 world. Imported FIRST by main3.js and by the sim's worker (whose URL carries
// the same query), so that src/w3/geometry.js — which reads globalThis.HB_WORLD as Node reads HB_WORLD=true — picks the world.
const q = new URLSearchParams(globalThis.location ? globalThis.location.search : '');
if (q.get('world') === 'true') globalThis.HB_WORLD = 'true';
export const WORLD_Q = globalThis.location ? globalThis.location.search : '';   // (the worker's URL takes the page's query along: ?world=true, ?shards=0)
