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
- `docs/ECOLOGY_RESEARCH.md`: real-lake values (zooplankton, larval fish, bass, pike, whole-lake energy flow) against the sim, with a ranked calibration list; its sourced notes are in `docs/research_notes/`.
- `docs/reports/Maine lakes ponds and streams.md`: the Maine re-base (Hot Brook lakes and stream, the Maine species set and their parameters, Maine limnology, recruitment compensation), with a ranked change list; notes in `docs/research_notes/Maine lakes ponds and streams/`.

## Vision
A whole-lake ecosystem in which every fish is driven by its own neural network, and as many real ecological processes as possible interact to produce emergent, believable behaviour. It should be large, detailed, realistic and beautiful in full screen: part scientific toy, part living screensaver.

You may propose a different architecture, stack or runtime if it serves that goal better (see `docs/archive/HANDOFF_PROMPT.md`). Whatever you choose, keep these principles:
- a testable, deterministic simulation core;
- the simulation kept separate from rendering;
- verification before claiming.

## Invariants
- **Pure simulation layer: DOM-free and testable in Node.**
  - Files: `core.js`, `config.js`, `hotbrook_profile.js` (generated data), `bioenergetics.js`, `species.js`, `environment.js`, `world.js`, `camera.js`.
  - The 3-D whole-lake sim being built alongside (`src/w3/`: `geometry.js`, `hotbrook3d.js` (generated data), `clock3.js`, `env3.js`, `chem3.js`, `species3.js` (the lakes' eleven fish: species.js's seven + redbreast, fallfish, banded killifish, blacknose dace; docs/FISH_CENSUS.md), `fish3.js`, `plants3.js`, `littoral3.js`; see `docs/HOT_BROOK_3D.md`) is pure too.
  - Never use `document`, `window`, `canvas` or `localStorage` there.
  - `species.js` `draw()` only calls a passed-in `put()`.
- **Browser layer:** `render.js`, `glpost.js`, `inspector.js`, `ui.js`, `main.js`, `ffworker.js` (the fast-forward module Worker: imports only the pure modules).
  - The 3-D view: `w3.html` + `w3.css` → `src/w3/render3/` (`main3.js`, `controls3.js`, `fish3view.js`, `plants3view.js`, `rises3view.js` (the insects on the water; the fish's rises, splashes and leaps), `bed3view.js` (the crayfish and snails on the bed), `water3.js` (how the water looks: attenuation, the fog's colour), the sim's module Worker `sim3worker.js` (imports only the pure `src/w3/` modules), generated `far3d.js`), on three.js r186 vendored in `vendor/three-0.186.1/` (one bundled ES module, served from the project so the CSP stays `script-src 'self'`).
- **Determinism.**
  - Use the seeded `core.rand` and a fixed timestep.
  - Render and cosmetic randomness must use `Math.random`, never `core.rand`.
  - The sim must never read render-only agent fields: `_px/_py/_ph`, `_rFrame`, `rHeading`, `facing`, `vis`, `_fxAt`, `_burst`.
- **Exact resume.** Any state that affects the future must be saved and restored:
  - `World.toJSON` + the `parseSave` builders in `world.js`;
  - `Environment.toJSON` / `load`.

  The gate's resume test (load → 600 steps must be byte-identical) catches anything missed. Bump the save version when the shape changes. It is **v33** now (older full saves are refused: they are the old generic lake; their champion brains still load).
- **Mass conservation.** Every chemistry transfer debits its source. The gate checks closed P and N budgets, plants included.
- **Content-Security-Policy.** No inline `<script>` and no `style=` attributes. A new external origin must be added in all three places: `index.html` (meta), `serve.mjs` and `serve.py`. `test/ui-check.mjs` checks they match.

## Run, gate, verify
- **Serve:** `npm run serve` (that is `node serve.mjs`, http://localhost:8000, localhost only), or `python serve.py`. The browser preview config is `reef` in `.claude/launch.json`.
- **Gate:** `npm test` runs `test/headless.mjs`, `smoke.mjs`, `ui-check.mjs`, `serve-check.mjs` and `w3.mjs` (the 3-D sim's own gate). It takes about 18 minutes (w3 alone ~10). Keep it green after every change.
  - Add a check block for every new subsystem or fix **before the final summary line**. Both `headless.mjs` and `smoke.mjs` end with `process.exit`, so anything appended after it never runs.
  - Set `REEF_PERF_MIN=0` only while the CPU is shared. Otherwise the budget is strictly ≥60 steps/s; recent runs show about 120–135.
- **Balance:** `npm run balance [years]` is a long-run analyzer, not part of the gate. REFUGE keeps every species "present", so judge balance by home-bred vs immigrant births per species, seasonal O₂ and phyto, and plants standing.
  - `balance.mjs` runs a single seed (2024). Single seeds swing by 10–20 points of immigrant share, so judge a balance change on a **≥3-seed A/B** (same seeds, change on/off) before claiming it.
- **Browser checks:** you *can* verify in the built-in browser.
  - `window.reef` exposes `{world, renderer, inspector, ui, camera}`.
  - `renderer.draw(t[, alpha])` requires `t`.
  - For any claim about where a GL shader effect appears on screen (surface, deep, sun), use an A/B `gl.readPixels` diff per horizontal band rather than eyeballing. Row 0 is the screen BOTTOM.
  - Ask the human only about taste and motion feel.

## Key facts (verified 2026-10-12)
| What | Value |
|---|---|
| World | THE REAL HOT BROOK LAKES (2026-10-15, docs/HOT_BROOK_SIM.md): Upper Hot Brook Lake (x 0–2846: its deep north basin, 5.5 m, by the outlet) → the connecting brook (to 3972: the 1.1-m pool at its upper mouth, riffles, a shallower run) → Lower Hot Brook Lake (to 6507: a 2.5–3.9 m saucer). The bed is DATA (`src/hotbrook_profile.js`, generated by `tools/hotbrook/slice_profile.py` from the 3-D model: the 1949 MDIFW soundings, each lake's real area-at-depth; true depths, lakes ~90× compressed along the slice). The world ends at the 0.25-m waterlines; the banks rise beyond (bedY < 0 for x < 0 or x > W). `WORLD.W×H` = 6507×456. Fraction-of-column parameters read against `WORLD.DEPTH_REF` (1152 px, the old 14.6-m column) so their absolute depths hold; mixing, wind and outflow are in metres (`THERMAL.MIX_M` + night convection: the lakes don't stratify). `AREA_SCALE` ≈ 5.8; `SLICE_M2` ∝ W (700 m² per 2048 px). Never place things by fractions of W — use the basin helpers |
| Field grid | `GRID.FIELD_COLS×ROWS` (271×19, 0.3-m cells). 2,756 of 5,149 cells lie below the bed and are inert (`env.mask`): a cell is wet iff it lies above its column's bed; below the brook's depth a row holds Upper's and Lower's water with dry ground between, so loops over `lo..hi` check `mask.wet[i]`, and `mask.bruns[cy]` gives each row's wet runs per water body |
| Time | `TIME.DAY_LEN` 60 s, `YEAR_LEN` 1800 s (30 min; 12 months, 4 seasons). Year-fraction 0 = March 1. The MAINE CALENDAR (`SEASON.TEMP_KNOTS` → `seasonalTemp(yf)`): ice-out ~Apr 23, 15 °C by late May, a 24 °C peak at the end of July, ice-on ~Dec 1, 208 days below 10 °C. A new lake opens mid-May (`SEASON.START_YF`); `world.setDate(yf)` jumps to a date with its thermal state. Physiology runs on the real calendar (one real day = `BIOE.DAY` = YEAR_LEN/365 ≈ 4.9 s), so growth, maturity and lifespans are the real ones (`species.js` `BIO`: golden shiner matures in its 2nd year, smallmouth ~4–5, white sucker lives 17). `SEASON.YEAR_LEN` and `ENV.DAY_LEN` are live aliases |
| Brain | Recurrent MLP. Inputs = species base + 7 shared extras: compass sin/cos, home bearing, flow, prey size, hunger, fear. Totals 23/20/19/18/17/17/17/16 (minnow, sunfish, perch, sucker, catfish, whiteperch, bass, pike). `OUT` = 5: turn, thrust, strike, flee, hide. Per-unit LEAK memory. `activeHid` set by the brain gene |
| Genomes | Fish `GENE_KEYS` (7): size (= maturation length), speed, tol, fin, eye, body, brain. Plant `PLANT_GENE_KEYS` (6): maxH, grow, light, warmth, palat, leaf |
| Learning | Baldwinian: the plastic `a.lw` (only its W2 block changes) is never inherited, and every breeding path uses `a.g` |
| Save | v33 (v33: the real Hot Brook lakes — older full saves refused; v26: zooplankton kind, dragonflies, frogs/tadpoles/turtles; v27: bioenergetics — fish length/mass/sex/maturity/gonads/gut/respiration/exposure/activity, food-patch masses, young-of-year schools; v28: the bed's organic layer `env.sedOM`; v29: the evolution history `evo`). v30: zooplankton as biomass fields `env.zooD/zooC/zooR` + resting eggs `env.zooEgg` (the swarm particles are gone) and the bed's worms and scuds `env.benth`; v31: the landscape (wider grid — an older save's fields map by absolute x into the lake); v32: the Maine species set (an older save's carp and trout are skipped on load). `BRAIN_ERAS` (`species.js`) holds the layout history used to migrate brains |
| Young fish | A spawning makes SCHOOLS (`world.fry`): super-individuals — one record of `n` identical fish on the same FB4 equations — that feed, grow, starve (scramble competition), are eaten and breathe O₂ through their first year, then RECRUIT as followed agents at the species' `L0` or the next spring (1 per `FRY.N_PER_AGENT`, within pop.max). Past `benthL` young bottom foragers live on the bed (`env.benthBest`); their natural mortality slows in cold water (`FRY.M_JUV_Q10`). Reproduction checks count `stats.spawns`, not `births` (births = recruits, months later). Judge a population change with the young-of-year fate audit, not adult counts alone |
| Render | Sprite `BASE` 14 (close-up tiers 28/56). SpriteCache and GL fish-texture caches are both 1024. WebGL2 linear-HDR presenter with a Canvas2D fallback; FRAG_COMP depth is `dpt = 1 − uv.y`. GL fish swim in FRAG_FISH from one straight sprite per fish: keep its wave in step with `drawFish`. Never upload a canvas into an SRGB8 texture (Chrome CPU-readback path); scene/overlay go in RGBA8 and are decoded in the shader |
| Perf | Judge in real Chrome at the user's resolution (CDP, see SESSION_STATE), not the preview pane. The browser steps the sim at **30 Hz** (main.js `DT`, the same step as the headless gate; ≤ 2 steps a frame — no catch-up bursts) and interpolates every frame; fish brains decide at `BRAIN.DECIDE_HZ` 30. Sim ≈ 9 ms/step with ~600 fish + wildlife |

## Module map
- **`core.js`:** seeded RNG with state get/set, math, `SpatialGrid`, the recurrent net (`forward`, `reinforce`), genome create/mutate/crossover/remap, trait genes.
- **`config.js`:** every tunable value. Blocks:
  - **world and time:** `WORLD`, `TIME`, `SEASON`, `ICE`, `GRID`, `BASIN`, `CAMERA`;
  - **physics:** `THERMAL`, `ENV` (light, O₂, weather), `WIND`, `FLOW`, `OUTFLOW`, `TURBIDITY`;
  - **chemistry:** `NUTRIENT`, `SED_P`, `NCYCLE`, `MICROBE`;
  - **producers and invertebrates:** `PHYTO`, `DIATOM`, `CYANO`, `PLANKTON` (the zooplankton fields), `MUSSEL`, `INSECT`, `SNAIL`, `CRAYFISH`, `DETRITUS`, `SEDOM` (the bed's organic layer), `BENTHOS` (its worms and scuds);
  - **plants:** `PLANT`, `MACRO`, `COMPETE`;
  - **habitat:** `STRUCTURE`, `COVER`;
  - **fish behaviour:** `SCHOOL`, `ACTION`, `MOTION`, `DRIVE`, `LEARN`, `BRAIN`, `FEED`;
  - **population:** `SPAWN`, `BROOD`, `IMMIGRATION`, `FRY` (young-of-year schools);
  - **physiology:** `BIOE` (bioenergetics clock, starvation/heat/hypoxia hazards, gastric evacuation, gonads), `PREY` (food grams, energy densities, digestibility);
  - **scripted wildlife:** `BIRD` (the diving loon), `ODONATA` (dragonfly nymphs + adults), `FROG` (frogs + tadpoles), `TURTLE` (painted turtles);
  - **toxicant:** `TOX`.
- **`bioenergetics.js`:** the Wisconsin model (Fish Bioenergetics 4.0) as pure functions: Cmax, respiration, waste, energy density, length–weight.
- **`species.js`:** the eight fish of a Maine lake (`SP`; keys → species: `minnow` golden shiner, `sunfish` pumpkinseed, `perch` yellow perch, `sucker` white sucker, `catfish` brown bullhead, `whiteperch` white perch, `bass` smallmouth bass, `pike` chain pickerel): senses, brain shape, diet, art, and `BIO` — each species' published FB4 parameters, length–weight, length-at-age, maturity, fecundity, gape, thermal/O₂ limits (sources inline). Also `BRAIN_ERAS`.
- **`environment.js`:** light, seasons and weather, ice, temperature (`tempAt`, `tempHypo`), current, and the O₂/N/P/phyto/diatom/cyano/DOM fields with closed budgets (`ledger`); Q10 biology, Blackman photosynthesis (`photoRate`), algal dark survival (`algaeRespAt`); validated `load`.
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
- Usage limit lifted (2026-10-13): thoroughness over economy — multi-seed validation, research, parallel agents where they genuinely help.
- Prefer complete, drop-in changes. State tradeoffs honestly.
