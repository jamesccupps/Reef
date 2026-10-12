# CLAUDE.md — Synapse Reef

This is the working brief for Claude Code. It's deliberately short.

**Every session:**
1. Read this file.
2. Read the **NOW** block of `SESSION_STATE.md`.

**Only when relevant:**
- `docs/FEATURES.md`: how each subsystem works and where it lives. Read the section for whatever you're touching.
- `ROADMAP.md`: plans.
- `AUDIT.md`: findings and their status.
- `docs/GRAPHICS_RESEARCH.md`: the render roadmap.

## Vision
A whole-lake ecosystem in which every fish is driven by its own neural network, and as many real ecological processes as possible interact to produce emergent, believable behaviour. It should be large, detailed, realistic and beautiful in full screen: part scientific toy, part living screensaver.

You may propose a different architecture, stack or runtime if it serves that goal better (see `docs/archive/HANDOFF_PROMPT.md`). Whatever you choose, keep these principles:
- a testable, deterministic simulation core;
- the simulation kept separate from rendering;
- verification before claiming.

## Invariants
- **Pure simulation layer: DOM-free and testable in Node.**
  - Files: `core.js`, `config.js`, `species.js`, `environment.js`, `world.js`, `camera.js`.
  - Never use `document`, `window`, `canvas` or `localStorage` there.
  - `species.js` `draw()` only calls a passed-in `put()`.
- **Browser layer:** `render.js`, `glpost.js`, `inspector.js`, `ui.js`, `main.js`.
- **Determinism.**
  - Use the seeded `core.rand` and a fixed timestep.
  - Render and cosmetic randomness must use `Math.random`, never `core.rand`.
  - The sim must never read render-only agent fields: `_px/_py/_ph`, `_rFrame`, `rHeading`, `facing`, `vis`, `_fxAt`, `_burst`.
- **Exact resume.** Any state that affects the future must be saved and restored:
  - `World.toJSON` + the `parseSave` builders in `world.js`;
  - `Environment.toJSON` / `load`.

  The gate's resume test (load → 600 steps must be byte-identical) catches anything missed. Bump the save version when the shape changes. It is **v24** now.
- **Mass conservation.** Every chemistry transfer debits its source. The gate checks closed P and N budgets, plants included.
- **Content-Security-Policy.** No inline `<script>` and no `style=` attributes. A new external origin must be added in all three places: `index.html` (meta), `serve.mjs` and `serve.py`. `test/ui-check.mjs` checks they match.

## Run, gate, verify
- **Serve:** `npm run serve` (that is `node serve.mjs`, http://localhost:8000, localhost only), or `python serve.py`. The browser preview config is `reef` in `.claude/launch.json`.
- **Gate:** `npm test` runs `test/headless.mjs`, `smoke.mjs`, `ui-check.mjs` and `serve-check.mjs`. It takes about 8 minutes alone. Keep it green after every change.
  - Add a check block for every new subsystem or fix **before the final summary line**. Both `headless.mjs` and `smoke.mjs` end with `process.exit`, so anything appended after it never runs.
  - Set `REEF_PERF_MIN=0` only while the CPU is shared. Otherwise the budget is strictly ≥60 steps/s; recent runs show about 120–135.
- **Balance:** `npm run balance [years]` is a long-run analyzer, not part of the gate. REFUGE keeps every species "present", so judge balance by home-bred vs immigrant births per species, seasonal O₂ and phyto, and plants standing.
- **Browser checks:** you *can* verify in the built-in browser.
  - `window.reef` exposes `{world, renderer, inspector, ui, camera}`.
  - `renderer.draw(t[, alpha])` requires `t`.
  - For any claim about where a GL shader effect appears on screen (surface, deep, sun), use an A/B `gl.readPixels` diff per horizontal band rather than eyeballing. Row 0 is the screen BOTTOM.
  - Ask the human only about taste and motion feel.

## Key facts (verified 2026-10-11)
| What | Value |
|---|---|
| World | `WORLD.W×H` = 2048×1152. Densities scale by `WORLD.AREA_SCALE`. `GLOBAL_MAX` ≈ 1012 agents |
| Field grid | `GRID.FIELD_COLS×ROWS`. About 1400 cells lie below the bed and are inert (`env.mask`) |
| Time | `TIME.DAY_LEN` 60 s, `YEAR_LEN` 1800 s (30 min; 12 months, 4 seasons), `LIFE_SCALE` 1.6. `SEASON.YEAR_LEN` and `ENV.DAY_LEN` are live aliases |
| Brain | Recurrent MLP. Inputs = species base + 7 shared extras: compass sin/cos, home bearing, flow, prey size, hunger, fear. Totals 23/20/17/17/17/16 (minnow → pike). `OUT` = 5: turn, thrust, strike, flee, hide. Per-unit LEAK memory. `activeHid` set by the brain gene |
| Genomes | Fish `GENE_KEYS` (7): size, speed, tol, fin, eye, body, brain. Plant `PLANT_GENE_KEYS` (6): maxH, grow, light, warmth, palat, leaf |
| Learning | Baldwinian: the plastic `a.lw` (only its W2 block changes) is never inherited, and every breeding path uses `a.g` |
| Save | v24. `BRAIN_ERAS` (`species.js`) holds the layout history used to migrate brains |
| Render | Sprite `BASE` 14. SpriteCache and GL fish-texture caches are both 1024. WebGL2 linear-HDR presenter with a Canvas2D fallback; FRAG_COMP depth is `dpt = 1 − uv.y` |

## Module map
- **`core.js`:** seeded RNG with state get/set, math, `SpatialGrid`, the recurrent net (`forward`, `reinforce`), genome create/mutate/crossover/remap, trait genes.
- **`config.js`:** every tunable value. Blocks:
  - **world and time:** `WORLD`, `TIME`, `SEASON`, `GRID`, `BASIN`, `CAMERA`;
  - **physics:** `THERMAL`, `ENV` (light, O₂, weather), `WIND`, `FLOW`, `OUTFLOW`, `TURBIDITY`;
  - **chemistry:** `NUTRIENT`, `SED_P`, `NCYCLE`, `MICROBE`;
  - **producers and invertebrates:** `PHYTO`, `CYANO`, `PLANKTON`, `MUSSEL`, `INSECT`, `SNAIL`, `CRAYFISH`, `DETRITUS`;
  - **plants:** `PLANT`, `MACRO`, `COMPETE`;
  - **habitat:** `STRUCTURE`, `COVER`;
  - **fish behaviour:** `SCHOOL`, `ACTION`, `MOTION`, `DRIVE`, `LEARN`, `BRAIN`, `FEED`;
  - **population:** `SPAWN`, `BROOD`, `IMMIGRATION`;
  - **toxicant:** `TOX`.
- **`species.js`:** the six fish (`SP`): senses, brain shape, diet, life history, art. Also `BRAIN_ERAS`.
- **`environment.js`:** light, seasons and weather, temperature (`tempAt`, `tempHypo`), current, and the O₂/N/P/phyto/cyano/DOM fields with closed budgets (`ledger`); validated `load`.
- **`world.js`:** organisms and `step()`, query helpers (`qPrey`, `qThreat`, …), the pure stats accessors, and `toJSON` / `parseSave` / `load`.
- **`camera.js`:** pan, zoom, pinch, follow, tour, interpolation helpers.
- **`render.js`:** camera-space Canvas2D scene with culling, LOD, `SpriteCache`, overlays, minimap, GL-fish quad collection, 2D fallback swap.
- **`glpost.js`:** WebGL2 presenter (bloom, ACES, god-rays, caustics, lit fish, overlay composite) with probe-first initialisation.
- **`ui.js` / `inspector.js` / `main.js`:** panels and controls (escaped), brain view, guarded fixed-timestep loop and input.

## How to extend
- **Species.** Copy an `SP` entry. `inputLabels.length` must equal `shape.in`; the gate checks it.
- **Shared sensor (every species).** Append ONE entry to `BRAIN_ERAS`: a copy of the last entry, with your label inserted where `World.step` writes it. Write `act.in[...]` in `World.step`. Never edit older entries. Bump the save version. Old brains keep every weight, and the new column loads as 0.
- **Species-specific sensor.** Append the label to the END of that species' `inputLabels`, bump `shape.in`, and write it in `senses()`. Then append a `BRAIN_ERAS` entry with `baseAdded: { <species>: ['<label>'] }` and bump the save version.
- **Resource or field.** You need:
  - the array plus its spawn/decay rule in `step()`, routing mass to and from the nutrient pools;
  - a spatial grid if counts are large, and a `q*` helper;
  - a `diet` flag;
  - rendering;
  - the save/load wiring (resume test);
  - a gate check.
- **Persistence.** `toJSON` / `parseSave` (validate every field, build into locals, commit atomically); `champions` / `seedFromChampions`.

## Working agreement
- One coherent slice per change. Never leave the sim unrunnable or the gate red.
- Git workflow:
  - commit small on a branch and push (origin: https://github.com/jamesccupps/Reef);
  - commits use the repo-local noreply email, because GitHub rejects the private address;
  - on Windows PowerShell use `git commit -F <file>`.
- Update `SESSION_STATE.md`'s NOW block at the end of a session (done, next, decisions, known issues). After a major slice, also run `git archive --format=zip -o G:\synapse-reef-backups\synapse-reef_<stamp>_<slice>.zip HEAD`.
- Usage is limited: don't fan out subagents or workflows unless the human asks.
- Prefer complete, drop-in changes. State tradeoffs honestly.
