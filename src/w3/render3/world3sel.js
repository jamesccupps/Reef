// world3sel.js — which world the 3-D view shows (browser layer). The view, w3.html, opens the Hot Brook lakes at their TRUE size
// (docs/TRUE_SCALE.md; the human, 2026-10-23: "true size should be default"); `w3.html?world=small` the 1/10 world. Other pages —
// the GPU tools in tools/gpu/ — keep the 1/10 world unless asked for `?world=true`. Imported FIRST by main3.js and by the sim's worker
// (whose URL carries the page's query, the world made explicit), so that src/w3/geometry.js — which reads globalThis.HB_WORLD as Node
// reads HB_WORLD=true — picks the world.
const loc = globalThis.location, search = loc ? loc.search : '', q = new URLSearchParams(search), asked = q.get('world');
const TRUE = asked === 'true' || (asked === null && !!loc && /\/w3\.html$/i.test(loc.pathname));
if (TRUE) globalThis.HB_WORLD = 'true';
export const WORLD_Q = TRUE && asked === null ? (search ? search + '&' : '?') + 'world=true' : search;
// THE WHOLE MODEL IN THE LIVE VIEW (the human, 2026-10-22: "this is now a whole environment simulator"): the view's sim runs the full
// package (fish3 stageR5 — the wildlife, the turtles and frogs, the anglers, the moose, the weather's fronts, the inflow's nitrogen, the
// census as the human knows it …), as the GPU year runner's ?r5=1 does; `?r5=0` shows the base model. Each worker and the page apply it
// before anything is built (sim3worker, shard3worker, main3)
export const R5 = q.get('r5') !== '0';   // (the worker's URL takes the page's query along: ?world=true, ?shards=0)
