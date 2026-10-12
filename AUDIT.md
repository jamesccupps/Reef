# Synapse Reef — Project Audit (2026-10-11)

## Status of the fixes (updated during the 2026-10-11 overnight run, branch `audit-fixes`)

**Fixed and covered by gate tests:**

| Tier | Items |
|---|---|
| Tier 1 | #1 GL orientation (re-verified with a GPU readback: caustics now change the top bands); #2 newborn cannibalism; #3 plant starvation churn; #4 brain migration by save era; #5 LEAK check, eye probe, resume test |
| Tier 2 | #6 exact resume; #7 script injection, NaN poisoning, half-load; #8 frame-loop guard; #9 GL failure fallback; #10 dev server; #11 wet/dry mask, conservative diffusion, closed P/N budgets (plants included), Redfield N; #12 per-second rates |
| Tier 3 | Budding energy, `fitGenes` padding, seed-parent search, storms, scum calibration, every rendering item, and every UI item |
| Tier 4 | Git and GitHub, slim CLAUDE.md, SESSION_STATE archive, README rewrite, LICENSE, `package.json`, stray files, dead config |

**Still open (tracked in `ROADMAP.md` → "Build order & guards"):**
- **Apex-predator recruitment.** Bass and pike remain mostly immigrants. This was always true; it is now measured honestly, because the energy pumps are closed.
- **Some Tier 1 #5 test-hardening items:**
  - behavioural replacements for the formula-copy checks;
  - broader determinism scenarios;
  - a WebGL2 mock for smoke tests;
  - checks that can't fail.
- **N-fixation is rare** at the default inflow N:P.
- **Needs human eyes:**
  - the colour grade (the GL depth terms were upside down until this fix);
  - interpolated motion smoothness;
  - HUD values, since the means are now wet-only.

---

## Scope and method

Six independent auditors each read their whole area:

- sim core;
- ecology and environment;
- rendering and WebGL;
- UI, app shell and security;
- the test suite;
- docs and hygiene.

They confirmed suspected bugs with small Node scripts instead of guessing. I then re-checked the most important claims myself:

- in the code;
- with my own scripts;
- in the real browser, including reading pixels back from the GPU.

Each finding below is marked with how far it was verified.

| Tag | Meaning |
|---|---|
| **[verified]** | I reproduced it myself (script, GPU readback, or exact code line). |
| **[reproduced]** | An auditor confirmed it with a script; I checked the code path. |
| **[code]** | Evident from the code; not yet run. |
| **[needs eyes]** | Only a person looking at the running app can confirm it. |

**Baseline:**
- `npm test` passes (exit 0). The headless suite reports ALL CHECKS PASSED and the smoke test reports SMOKE OK.
- Speed: 121 sim steps/s with a peak of 466 agents.
- Determinism: same seed, same result (1084 === 1084).
- In the real browser:
  - the WebGL2 path is active (`GLPost`, GPU-lit fish ready);
  - `glError 0`, and nothing in the console;
  - after a forced WebGL context loss and restore, rendering recovers and the fish textures come back.

**Bottom line.** The project is ambitious, well commented and mostly sound in its structure: the sim/render split is clean, there are no RNG leaks into rendering, and the GL resources are handled correctly. But some core claims in CLAUDE.md and SESSION_STATE.md are false, and the test gate doesn't catch them:

- the GL "surface" effects are drawn upside down;
- predators eat their own newborns for a net energy gain;
- plants die off constantly;
- old saved brains load with their weights on the wrong inputs;
- save/load is not a faithful resume.

Several of these were recorded as "adversarially reviewed, SHIP" or "verified in browser". The lesson for the workflow: **tests and reviews that re-implement the code's own assumptions don't catch the code's mistakes.** Tests need to run the real behaviour.

---

## Tier 1: Fix first (high impact, mostly cheap)

### 1. GL surface effects are drawn over the lake bed, not under the surface [verified on GPU]
- **What's wrong:** the shader treats the top of the screen as the bottom.
  - The fullscreen pass sets `vUv = p` with `gl_Position = p*2-1` (`src/glpost.js:42`), and the final composite draws to the default framebuffer (`:478`). So `uv.y = 0` is the **bottom** of the screen.
  - But FRAG_COMP treats `uv.y = 0` as the *surface* everywhere: `surf` (:121), `dofDeep` (:136), `causDepth` (:153), `scatter` (:158), `surfBand` (:161), god-ray `depthFade` (:168), lightning flash (:181) and `dsep` (:184).
  - `render.js:640-643` passes `sunUV = (su, sp.y/h)` with a comment that says "DO NOT invert". That comment is wrong.
- **Evidence:** I rendered the same frame with `causAmt` 0 and then 12, read back the pixels and compared each 10% horizontal band, bottom to top. The mean absolute differences were `[77, 138, 140, 116, 78, 7, 0, 0, 0, 0]`. The caustics change only the bottom half and the top 40% (the actual surface) not at all.
- **Effect:** the caustic net, Snell's-window band, in-scatter glow, refraction weighting, god-ray convergence and warm-shallow/cool-deep split-tone are all inverted. The "deep" depth-of-field blurs the surface.
- **Fix:** in FRAG_COMP use `float dpt = 1.0 - uv.y;` wherever depth is meant, and pass `sunUV: [su, 1 - sv]`.
- **Then:** eyeball the result, because the grade was tuned against the inverted version.

### 2. Bass and pike eat their own newborns within about 2 s, for a net energy gain [verified]
- **Cause:**
  - `qPrey` (`src/world.js:277`) has no species or kin filter.
  - `qThreat` (:276) requires a *different* species, so a juvenile never senses its parent as a threat.
  - Newborns are placed ±6 px from the parents (:700, :718), inside strike reach.
- **Evidence:** my re-run with seed 99 over 40 sim-seconds found pike ate 19 newborns under 2 s old against 26 births, and bass ate 13 against 24. The auditor measured an average **gain of 0.52 energy per newborn eaten**, while the pike breeding cost is only 0.38. Breeding and then eating the brood is an energy pump, and lifetime learning (`reinforce`) rewards the strike.
- **Why it matters:** this is a strong candidate for the long-standing "bass/pike are immigration-dependent apex, maxGen 0" problem in SESSION_STATE.
- **Fix (pick one or more):**
  - post-birth immunity, e.g. a conspecific with `age < GRACE` is not prey;
  - make `qThreat` symmetric so juveniles flee their own kind;
  - disperse broods further from the parents.
- Re-run `npm run balance` afterwards. Apex recruitment should improve.

### 3. Most macrophytes are below their light threshold all the time, so plant beds churn [verified, corrects the auditor]
- **Cause:** `src/world.js:481` kills a plant with hazard `SHADE_DEATH` whenever the *instantaneous* light `lit < p.lightMin`.
- **Evidence:**
  - My run: 621 plants fell to 370 in one sim-day. Deaths were about 24/s by day and about 22/s at night, which is close to the maximum possible hazard for the whole population in *both* phases.
  - The auditor found 383 of 508 plants below `lightMin` at noon. A late-autumn start went from 621 plants to 23 in 120 s, because winter recruitment is about 0.
- **Effect:** "established beds persist / overwinter as rootstock" is false. Mean plant life is about 25 s. Plant evolution partly resets every winter, because orphan seedlings get fresh genes. Fish cover churns.
- **Fix:**
  - judge starvation on an EMA of light (a daily mean), not the instantaneous value;
  - re-calibrate `lightMin` against the actual `lightAtDepth` scale;
  - add a headless check that established plants survive a full day/night cycle and a winter.

### 4. Old saved brains load with their weights on the wrong inputs [verified]
- **Cause:** `migrateGenomeInputs` (`src/core.js:131-137`) copies old weight columns *by position* and zeros the tail. But newer inputs were *inserted before* the drive inputs: spatial in v21 and perception in v22 (`src/species.js:357`).
- **Evidence:** my repro took a v21 minnow brain, migrated it, and found the hunger weight landed on `flow` and the fear weight on `prey size`, while the real `hunger` and `fear` columns were zeroed. For v18–v20 brains, the drives land on the compass inputs.
- **Also:** the 2-output migration (`src/world.js:37-40`) computes old lengths with the *current* input count, so it can never match a real v15–v16 save. Those brains are silently reseeded. [reproduced]
- **Effect:** loaded brains and localStorage champions behave differently with no error. The "weights preserved" claims from the spatial, perception and drives slices are false.
- **Fix:** map columns per save era, using the old genome length, which uniquely identifies the era. Chain the output migration and the input migration. Add a headless test that checks each era's drive weights land on the drive columns.

### 5. The test gate has holes that let all of the above through [verified / reproduced]
- **The memory check can't fail** [verified]. `test/headless.mjs:149` computes the LEAK offset as `2*hid + 2`. That was right for 2 outputs; with `OUT = 5` it reads the strike-output weights. The auditor forced every LEAK to −20 and the check still passed. Use `a.g.length - hid`, or export a `leakOffset()` from `core.js`.
- **Some tests check a copy of the formula, not the sim** [reproduced]:
  - the thermal and hypoxia energy drain (:629-636) — deleting the drain lines in `world.js` still passes;
  - catfish nocturnality (:848);
  - the body-depth defence (:676);
  - mate choice prefers good genes (:859), which still passes with the genes swapped.
- **No resume test.** Save/load is only checked for JSON idempotence, so the divergence in Tier 2 #6 is never detected.
- **The determinism test is narrow:** one seed, 900 steps from year-fraction 0. It never reaches turnover, senescence, the toxin threshold or the `GLOBAL_MAX` branch.
- **A fragile check:** the eye-gene probe (:672) builds 6-gene arrays, so the 7th (brain) gene is random. It fails at **12% of RNG-stream positions**, so any unrelated RNG change can turn it red.
- **Checks that can't fail:**
  - "all species survive", because the REFUGE backstop guarantees at least 2 of each — the same applies to `balance.mjs`'s "no extinction";
  - O₂ within [0, 1.25], which is already clamped;
  - the calendar ratios, which are getters derived from each other.
- **The smoke test never runs WebGL2.** The stub fails `isRealGL2`, so `GLPost` (glpost.js:270-516), the GL fish path, every UI handler and `main.js` never execute in the gate.

---

## Tier 2: Correctness and robustness

### 6. Save/load is not a faithful resume [reproduced by two auditors independently]
- **Not serialized:**
  - per agent: `mateCd`, which is re-randomized and consumes RNG during load; `velHeading`; `turnSmooth`/`thrustSmooth`; `lw` (the learned policy);
  - `corpses`;
  - larva `y`;
  - the env cached means;
  - the id counter (ids restart at 1, and the burst-and-coast `stroke` phase is derived from the id);
  - **the RNG state**: `core.js` has no getter or setter for it.
- **Evidence:** load, then step with the same seed. The runs diverge from step 0; after 10 s there were 409 vs 426 agents. Transplanting exactly these fields makes the runs identical for 600 steps.
- **A related problem:** `_id` is module-global (`world.js:23`). Constructing a second `World` in the same process corrupts the first one's ids and changes its trajectory.

### 7. Imported files can run script and poison the sim [code + reproduced]
- **Script injection.** `ui.js:227` interpolates `sel.gen` and `sel.eaten` into `innerHTML`. `load()` and `seedFromChampions()` copy them from the file without checking their type (`world.js:929-930`, `:968`). A crafted state file runs script when the user clicks a fish. It then spreads to every descendant (string `gen + 1` concatenates), persists into the localStorage champions, and is re-exported. **Fix:** coerce to numbers on load, and use `textContent` or escaping.
- **NaN plague** [reproduced]. Any one of these corruptions turns all 4,080 O₂ and phyto cells and every agent NaN within 120 steps, permanently:
  - an agent missing `y` or `e`;
  - speed gene = 0;
  - env `t` or `weather` missing.

  `clamp` passes NaN through, and `a.energy <= 0` is false for NaN, so a NaN fish never dies.
- **Half-load** [reproduced]. An unknown species throws *after* `time`, `stats` and `env` have already been replaced. The result is a mixed world with **duplicate fish ids**, which breaks selection and follow.
- **Fix:** a two-phase `load`:
  1. validate everything into local variables (`Object.hasOwn(SP, s)`, `Number.isFinite` with defaults, clamp genes, cap the array sizes against `GLOBAL_MAX`);
  2. commit atomically.

  Also use `!(a.energy > 0)` as the death test.

### 8. One exception freezes the app until reload [code]
- **Cause:** `main.js:92` schedules the next frame only at the end of `loop`, and there is no try/finally.
- **Effect:** any throw stops rendering for good, and Reset doesn't recover it. This is reachable from a valid-looking import: `reeds: {}` loads with the toast "imported" and then throws every step.
- **Fix:** call `requestAnimationFrame(loop)` first, then wrap the body in try/catch → pause + toast + `console.error`.

### 9. If WebGL fails, the screen goes blank or freezes [code + observed]
- **Cause:** once `getContext('webgl2')` has succeeded on `#tank`, the browser returns `null` for `getContext('2d')` on that canvas. So the Canvas2D fallback can't attach after a GL init failure. And once `failed` is set, `present()` returns early forever with no message (`glpost.js:433`, `:498` swallows the error).
- **Observed:** during a forced context loss, `postInGL` stayed `true`. So the `render.js:215` comment that "a context loss re-enables the 2D post" is also false. Restore did work.
- **Fix:**
  - probe and compile on a throwaway canvas first;
  - `console.warn` on failure;
  - on fatal failure, swap in a fresh `#tank` with a 2D presenter.

### 10. Dev server exposes the project to the local network [code]
- `serve.py:44` binds `("", PORT)` (all interfaces), even though the banner says localhost.
- Directory listings are enabled for `/src/`, `/test/` and `/.claude/`.
- Path traversal is correctly blocked.
- **Fix:** bind `127.0.0.1`, 404 on directory listings, optionally check the `Host` header.

### 11. Water chemistry ignores the lake basin and is not mass-balanced [reproduced]
- **Below-bed cells.** 1,440 of 4,080 field cells (35%) lie *below the lake bed* and run every process: phyto growth, the N cycle, O₂ demand, diffusion. They hold about 125 of 352 total phosphate and contaminate the global means, which drive the HUD, zooplankton and snail recruitment, and turbidity. **Fix:** a wet/dry mask derived from `bedY`, with no-flux at the bed.
- **The P budget is open.** Over 60 s: sediment `SETTLE` creates P from nothing; grazing deletes the grazed biomass's P; fish-death detritus creates about 0.065 P per fish; plants return 18% of the P they take up. The net *unexplained* drift was −114 P, against an inflow of only +61. "P loading drives blooms" doesn't hold, because inflow is a minor term.
- **`diffuse()` is non-conservative at grid edges** (`environment.js:436-472`). It destroys about 17% of mass placed at an edge within 60 s. The inflow injects at edge column 0, and the scum sits in row 0. **Fix:** a flux-form stencil.
- **Nitrogen** recycles about 7.6× more than it takes up (`N_USE` 0.08 vs 0.609 recycled), so only about 5% of cells are ever N-limited. The Liebig N limb and the cyanobacteria low-N:P advantage are effectively inert.
- **Deep temperature** inherits the surface's ±4 °C per-minute diurnal swing (`environment.js:223`). The summer hypolimnion ranged 17–25 °C, warmer than the microbial `REF_TEMP`.
- **Negative O₂** reaches the Monod term (`environment.js:139`), so decomposition briefly runs backwards. **Fix:** clamp to ≥ 0 first.

### 12. Some rates are per step, not per second [reproduced]
- `FALLBACK_GRAZE` (`world.js:664`), `bitePlant` and `_takeNearest` all run once per step regardless of `dt`.
- The browser runs at dt = 1/60, while the headless tests and `balance.mjs` run at 1/30. So balance tuned headlessly doesn't carry over to the browser.
- **Fix:** per-second constants multiplied by `dt`.

---

## Tier 3: Smaller defects

### Simulation
- **Asexual budding creates energy.** The parent pays `reproCost`, but the child gets `childEnergy`: minnow pays 0.20, child gets 0.40 (`world.js:715-719`).
- **`fitGenes` pads missing genes with random values** instead of exactly 1.0. A v22 save upgraded that way shrinks about 19% of brains (`world.js:49-55`).
- **Plant seed-parent search is scaled by fish visibility.** It uses `qPlant`, which multiplies the radius by water clarity, so plant heredity weakens in murky water (`world.js:490`).
- **Storms don't break the thermocline.** Stratification relaxes at 0.5/s but storm erosion is only 0.084/s, which leaves strat at about 0.83 (`environment.js:270-274`).
- **Summer scum covers 81 of 85 surface cells** above the toxic threshold. The toxin is effectively always on in summer.

### Rendering
- **Bed polygon and surface line stop short of the right screen edge** at zooms past about 2.6× fit: 44 px on average and up to 127 px at tour zooms (`render.js:347-356`, `:591`). Sample on a world-aligned grid.
- **Film grain is added in linear space**, before the sRGB encode, which amplifies it in the darks. The encode is a plain 2.2 gamma, but the hardware decode is exact sRGB (`glpost.js:186-192`).
- **GL fish edges and minification:**
  - straight-alpha bilinear filtering followed by premultiplying gives a dark edge fringe (C·w²);
  - there are no mipmaps, so fish shimmer when zoomed out (`glpost.js:356-362`).
- **GL fish get depth-dim, night tint and haze twice** (sprite plus shader), so they are about 1/3 darker than the 2D path on the bed.
- **Sprite hues are off by half a bucket.** The key rounds to centres, but the build adds +11.25° (`render.js:73` vs `:89`). Colour pops at the dot↔sprite switch.
- **Cache thrash risk.** The GL texture cache (512) is smaller than the SpriteCache (1200). The light bucket forces rebuilds about 10 times per in-game day. Under GL, move the light into the shader.
- **Other:**
  - fish that come into view after a pan spin from a stale heading;
  - `uTime` is unbounded, so caustics lose float precision after hours;
  - post effects scale with DPR;
  - no `SRGB8_ALPHA8` fallback for GPUs without float render targets.

### UI
- **Movement judder.** There is a fixed 1/60 s step and no render interpolation, so at ½× (the fullscreen screensaver default) or on 120/144 Hz displays, fish update at about 30 Hz while the camera moves at 60 Hz. Visible stutter is likely [needs eyes]. **Fix:** interpolate between the previous and current position.
- **The °F/°C toggle on the on-water overlay can't be clicked.** `.pondstats` has `pointer-events: none`, which is inherited (`styles.css:146`).
- **The inspector footer** still shows "→2" outputs (`inspector.js:75`) and draws masked hidden units as if they were active.
- **Layout:** the overlay-toggle row doesn't wrap, so the page scrolls horizontally at about 1000 px wide (`index.html:141`) [verified in browser].
- **Other:**
  - leaving fullscreen unpauses;
  - shortcuts fire with Ctrl held (Ctrl+F, Ctrl+±);
  - two-finger touch makes the camera jump;
  - the weather dropdown goes stale after Reset;
  - `brainsReseeded` is never shown;
  - `dl()` revokes the blob URL synchronously;
  - nothing caps "Load brains" or "+species" at `GLOBAL_MAX` (10 clicks took the lake to 1,793 agents).

---

## Tier 4: Docs and project hygiene

- **No version control.** "Commit small" can't be followed. The only backups are zips on a second disk in the same machine. **Recommend:** `git init` + `.gitignore` + a commit per slice + a private remote. Also consider moving the project out of `Downloads`.
- **Context cost.** CLAUDE.md (about 11K tokens, injected every turn) plus SESSION_STATE (about 56K) plus ROADMAP (about 24K) makes **about 92K tokens of mandatory reading** per session. SESSION_STATE is larger than a single file read. There are five conflicting "NEXT" lists and a "read this first" block that is long out of date. **Recommend:**
  - CLAUDE.md of about 8 KB: invariants, a key-facts table, a module map, how to extend;
  - `docs/FEATURES.md` for the subsystem narrative;
  - SESSION_STATE of about 6 KB (NOW / NEXT / last 3 sessions);
  - archive the rest under `docs/archive/`.
- **Drift found:** 40 claims checked; 26 OK, 14 wrong. Notable ones:
  - CLAUDE.md says both "6-gene" and "7-gene" (the code has 7);
  - "a year every ~14 min" vs `YEAR_LEN` 1800 s (30 min);
  - "~630 steps/s" (the real figure is about 120–135 against a gate of 60);
  - the "Deferred / TODO" lists include work that is already done;
  - the "Add a sensor" recipe would silently scramble brains, per #4.
- **README.md describes the June-14 system:** 2-output feed-forward brain, re-seed floors, no ½×, missing diets.
- **Stray files:** `test_output.txt` (a stale v16 log) and `verify_deep.mjs` (one-off; superseded by `headless.mjs:1157-1164`). Both are safe to delete.
- **Dead config:** `BASIN.SEDIMENT`, `PLANT.MAX_HEIGHT`, `PLANT.MIN_HEIGHT`, `PLANT.LIGHT_MIN`, `NUTRIENT.N_START`. `SEASON.YEAR_LEN` and `ENV.DAY_LEN` are copied at module load, so runtime changes to `TIME` won't propagate.
- **package.json:** `python3` doesn't work on stock Windows (consider a Node `serve.mjs`). There's no `engines` field and no `private: true`. It declares `"license": "MIT"` but there's no LICENSE file.
- **A suggested drift guard:** a small test that asserts the CLAUDE.md key-facts table against the code (save version, `GENE_KEYS.length`, `OUT`, `TIME.*`, per-species `shape.in`).

---

## What was checked and found sound

- **Determinism boundary.** No `Math.random`, `Date` or `performance` in the sim layer. Render code never calls `core.rand`. Render-only agent fields never feed back into the sim. No Maps/Sets and no unstable sorts.
- **Genome layout.** The W1/B1/W2/B2/LEAK offsets agree across `genomeLen`, `randomGenome`, `forward`, `reinforce` and `cognitionDetail`. `activeHid` masking is correct. `reinforce` never writes `a.g` (Baldwinian learning holds).
- **Agent lifecycle.** Removal during iteration is safe. Clutches never exceed `GLOBAL_MAX`. The step accumulator can't spiral (`real` is clamped to 0.1 s).
- **GL lifecycle.**
  - Resize reuses textures and FBOs without leaks.
  - LRU eviction deletes textures.
  - Context restore rebuilds everything [verified in browser].
  - The viewport and blend state are reset between passes.
  - RGBA16F is filterable in core WebGL2.
  - The SRGB8_ALPHA8 upload format is valid.
  - The GL fish affine transform matches the 2D one.
- **Other:**
  - `serve.py` blocks path traversal and sends correct MIME types and no-store headers;
  - localStorage access is wrapped in try/catch;
  - every DOM id the UI looks up exists;
  - no prototype-pollution path;
  - the other `innerHTML` uses are safe;
  - grid indexing clamps correctly;
  - the nitrification/denitrification and Mortimer redox gates are implemented as documented.

---

## Suggested order of work

1. **`git init`**, and commit the current state as the baseline before touching anything.
2. **Strengthen the gate first**, so the fixes are protected:
   - fix the LEAK-offset check;
   - make the eye probe use 7 genes;
   - add a load→reseed→step **resume** test (expected to fail until #6 is fixed);
   - add a plant day/night survival test;
   - add a newborn-cannibalism test;
   - add brain-migration tests for each save era.
3. **Cheap, high-visibility fixes:**
   - GL orientation (#1);
   - the `main.js` frame guard (#8);
   - XSS and `load` validation (#7);
   - `serve.py` bind (#10).
4. **Ecology fixes, balanced against `npm run balance`:**
   - newborn grace (#2);
   - plant light EMA (#3);
   - per-second rates (#12).
5. **Brain migration** by save era (#4), plus faithful save/resume including RNG state (#6).
6. **The chemistry rework** (#11): wet/dry mask, flux-form diffusion, closed P/N budgets. This is the largest and most balance-sensitive item; it deserves its own slice.
7. **Docs restructure** and README rewrite.
