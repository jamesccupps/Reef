# SESSION_STATE.md — Synapse Reef

Living handoff log. The **NOW** block is the current state, so keep it accurate. The full history is in
`docs/archive/SESSION_LOG_2026-06.md`. Leave the sim runnable and the gate green.

---

## ▶ NOW — after the 2026-10-11/12 overnight audit-fix run

**New mandate (human, 2026-10-12 morning):** "fix everything, do what you think would be good, take screenshots
to analyze the GUI and everything yourself, keep everything updated in case chat compacts." The budget rule
still applies: no subagents.

**TOP PRIORITY (human, 2026-10-12):** "it's supposed to be a good visual like a screensaver, especially full
screen — make sure the visuals are good, high resolution, that even zoomed out you can see things, that it all
flows and acts real and that it's polished."

Screensaver plan:
- [x] Zoomed-out visibility (`8dd6471`): 91% of fish were 2-px dots at the overview. They're now oriented fish glyphs
      with a screen-scaled minimum length, plus a moonlight floor so nights aren't black.
- [x] Resolution: sprite tiers 14/28/56 px per unit. A 1080p close-up was a 2.5–7.7× upscale; now it's ≤~2×.
      ImageData rasterizer: tier builds cost 2.1 / 6.7 ms. GL textures are freed on sprite eviction.
- [x] Flow: glyph→sprite switch happens at an equal on-screen length (no pop). New tour mixes wide, habitat and
      follow shots, with slow cinematic easing and pull-back-then-push-in travel.
- [x] Fullscreen polish: the chrome and cursor fade after 3.5 s idle and come back on any input. Also: sediment
      texture on the bed, and dawn warmth fades with view depth (deep close-ups no longer turn muddy brown).

**▶ REALISM OVERHAUL IN PROGRESS (human, 2026-10-12: "do it all" → "make everything realistic, like you said earlier
what wasn't").** Baseline diagnostic (scratchpad `verify/recruit.mjs`, 3 seeds × 1 yr, pre-overhaul): sexual births
≈ 0 for every species but minnow (bass 0/228, pike 0/164 — all "home-bred" young were ASEXUAL BUDS of immigrant
adults); no juvenile bass/pike reached maturity; most large-fish adults STARVE (reserve lasts ~25 s: drain 0.045/s vs
cap ~1.35); no satiation (predators kill when full); K pyramid inverted (bass 88 / pike 40 vs minnow 202); climate wrong
(surface 22 °C on Mar 1, 31 °C peak Jun 1, never below 13 °C, no ice; strat = sin(year)). Phases, commit each green:
- R1 climate: T = 12.5 + 13·sin(2π(yf − 0.17)) (peak ~Aug 1, ~0–1 °C Jan), winter ICE (light ↓, no reaeration, no wind
  mixing → winter O₂ sag), hypolimnion floor 4 °C, stratification from the surface–deep temperature difference, seasonal
  day length/irradiance, asymmetric fish thermal stress (heat lethal; cold slows, Q10 metabolism).
- R2 energetics + life history: starvation times ~150 s (minnow) … ~400 s (pike) ∝ size^0.75; eat only when hungry;
  multi-year lives (minnow mature 0.5 yr / max 2.5 yr … carp 2 / 12 yr); temperature-triggered spawning windows (pike
  ~ice-out, perch spring, bass/carp late spring, sunfish/minnow repeat spawners in summer, catfish early summer); NO
  budding; K pyramid (minnow ≫ sunfish/perch ≫ catfish/carp/bass ≫ pike); initial multi-age population.
- R3 young fish: nest guarding (bass, sunfish, catfish), nursery cover, all fry eat zooplankton first.
- R4 immigrants from a regional gene pool (gene flow), not mutated copies of the lake's best (IMMIGRATION.FROM_BEST).
- R5 plants spread by rhizome runners (+ seeds), diatom spring bloom group, N-fixation by cyanobacteria.
- R6 new life: yellow perch, a fish-eating diving bird (loon: hunts underwater, fits the side view), then more.
- R7 multi-seed balance, docs, visuals. Judge with `verify/recruit.mjs` (births sexual vs budded, immigrants, deaths
  by cause juvenile/adult) over ≥3 seeds and ≥2 years.

**▶ REALISM STATUS (2026-10-12, before a context reset) — branch `realism` (WIP, gate NOT green; main/audit-fixes untouched):**
- DONE in code: R1 climate (temp cycle, ice, seasonal sun, Q10 metabolism, temp-driven strat, hypo ≥ 4 °C, start date
  SEASON.START_YF 0.22, primeSeason); Q10 on phyto/cyano/diatom/nitrif/sediment+pelagic O₂/plant night resp; plant
  dormancy (PLANT.DORMANT_T); inflow plume + aerated inflow (FLOW.PLUME_*, O2_MIX); plant O₂ spread along the stem;
  O2_RESP_FISH scaled 0.012→0.0015; R2 energetics (per-species metabolism/moveCost ~8–10× lower; all stress drains
  rescaled; actions ENGAGE-gated), satiation (FEED.SATIATE/HUNT_BELOW), fry eat zooplankton (FRY_GROW), juvenile
  massF^0.75 metabolism, life history in years (species.js yr()), temperature-triggered spawning (SP.spawnT,
  SPAWN.EDGE/SEASON_END/MATE_REACH, spawnSide grounds), NO budding, K pyramid, mixed initial ages, cheaper young + bigger
  clutches; R3 nest guarding (sp.nestGuard, BROOD.GUARD_*/PROTECT, a.nt/nx/ny/ni), nursery cover, PREY_MIN, gape 0.62,
  O₂-limited habitat choice (benthic → shelf); DIGESTION (FEED.MEAL_K 10, DIGEST 1200, a.dg by absorbed energy);
  R4 regional gene pool (world.genePool, poolFounder, IMMIGRATION.POOL_N/EMIGRATE; FROM_BEST retired; RESCUE_N 3,
  RATE 0.05); R5 clonal plant runners (PLANT.CLONAL/RUNNER), DIATOM group (env.diatom, diatoms(), sinks when stratified),
  CYANO TEMP_OPT 25/TOL 11; R6 PERCH species (SP.perch, 'vbars' art, qLarva, TROPHIC 'mesopredator'), LOON (BIRD config,
  world.birds, _stepBirds, qThreat includes diving loon, render _drawBirds), ice rendering. Save v25 (ice, diatom, nest,
  dg, birds, genePool). smoke passes.
- OPEN #1 — late-winter O₂ crash under ice (avg ~0.1 by March → bass/pike/minnow winterkill). Latest sink test (Jan
  snapshot, 300 s): baseline 0.68→0.10; no phyto resp → 0.46 (BIGGEST), no microbes → 0.31, sediment/pelagic ~0.18,
  nitrif/diatom small. Next: check PHYTO.O2_RESP vs where green phyto sits under ice (deep cells?) — real algae respire
  ~10% of max photosynthesis; consider lowering O2_RESP or tying it to light-limited growth; then microbes.
- OPEN #2 — balance (3 seeds × 2 yr via scratchpad verify/deaths.mjs): prey now OK (minnow ~330, sunfish ~100, catfish
  ~30); predators thin (perch, bass ~2–3, pike 3–8) partly from the winter crash. Re-judge after #1.
- THEN: fix headless tests to the new climate/model (turnover/storm/phyto/cyano-N:P/macrophyte-seasonal/resume/handling
  checks failed on R1; expect more), add tests for ice, diatoms, nest guarding, digestion, gene pool, loon, perch; UI
  (loon/ice/perch legend), docs (FEATURES, README, CLAUDE.md key facts), browser visual check, merge, G-drive backup.
- Scratchpad verify scripts (session-local; recreate if lost): recruit.mjs, deaths.mjs (deaths by cause×season incl.
  loon), energy.mjs (per-species energy budget), climate.mjs (monthly lake table), o2sinks2.mjs (winter O₂ sinks),
  hypwhere.mjs, shelfo2.mjs, profile.mjs.

**▶ RESUME HERE (updated 2026-10-12, after the launcher + smoothness round):**
- **Human feedback this round:** "doesn't seem very smooth or high fps", "looks blurry when fully zoomed out",
  "add a batch file to easily launch this". All three were measured in REAL Chrome at 1920×1080 (RTX 3060, 144 Hz) and
  fixed:
  - `3cf2eb7` launchers (`Synapse Reef.bat`, `Synapse Reef - Screensaver.bat`) + `#screensaver` window mode; the GL
    scene upload went into an SRGB8 texture = Chrome CPU-readback slow path (19 → 70 fps with RGBA8 + shader decode);
    frame pacing (every k-th refresh on high-Hz displays); UI panel refresh staggered across frames.
  - `01e4329` crisp overview: warp / chromatic aberration / fake DOF now scale WITH zoom (were strongest zoomed out).
  - `26b8de6` sim step 7.1 → 4.5 ms, byte-identical (fingerprint hash unchanged; gate 154 → 256 steps/s).
  - `1d229a1` drawn fish pitch soft-limited to ±55° (no more vertical "falling cut-out" fish).
  - `8a9e78f` GL fish swim in FRAG_FISH from one straight-pose sprite per fish: the hi-res tiers needed
    30 sprites per fish (10 frames × 3 efforts) vs caps 160/48 → close shots rebuilt sprites every frame (20 fps, 230 ms
    stalls). Now 65 fps, 100% frames on target at 16× on the densest cluster.
  - `5e555d6` tall screens (16:10, 4:3, portrait) frame the surface at the top; earth fills the spare height.
  - `f6732e3` fish art for close-ups: species markings (bass band, minnow stripe, sunfish bars + orange breast, pike
    spots, catfish mottle), overlapping scales on the close-up tiers, forked tails, rounded snout, iris, soft edges;
    tour follow zoom 6–16×.
  - `beb24e9` plants up close: eelgrass weed-bed blades as tapered ribbons with a midrib, lance leaves on stalks,
    tapered reeds (all only at z ≥ 2.4); fish no longer fade in as see-through "ghosts" on every tour cut (only newborns
    fade).
- **How I measure in real Chrome (session-local scripts in the scratchpad; recreate if lost):** launch
  `chrome --app=http://localhost:8000/#screensaver --user-data-dir=%LOCALAPPDATA%\SynapseReef\bench
  --remote-debugging-port=9334 --window-size=640,400 --disable-backgrounding-occluded-windows
  --disable-renderer-backgrounding`, then a tiny Node CDP client (Node 24 has global WebSocket) that sends
  `Emulation.setDeviceMetricsOverride` 1920×1080 + `Runtime.evaluate` (frame-interval/pacing, wrapped draw/step
  timings), `Profiler.start/stop`, `Page.captureScreenshot`. The override drops when the session detaches, so do the
  setup and the captures in ONE session. Sim speed-ups: `simhash.mjs` = sha256 of `toJSON()` after 4000 steps with
  `seed(12345)`; it must not change.
- **Next, in order:**
  1. **Tall-screen framing.** camera.js `_clamp`: when the view is taller than the world (`hh*2 >= H`) it centres
     the lake (cy = H/2), leaving smoky "air" with god-ray streaks above the surface on portrait or 4:3 screens.
     Anchor the lake near the top instead: margin m = min(0.03·H, (viewH − H)/2), cy = hh − m. Do the same for the
     tcy/hh and cy/hh2 pairs. Standard 16:9 fit then stays unchanged, because FIT_PAD's margin (17.6) < 0.03·H.
     Check the headless camera tests around headless.mjs:1300 first.
  2. Optional fish-art polish (the fins read a bit flat at 30×); plant/bed art.
  3. Ecology, lower priority now: juvenile cover / nursery reflex for apex recruitment. Judge with a ≥3-seed A/B
     using `scratchpad/verify/seeds.mjs` (session-local; easy to recreate: per-seed 1-year births vs immigrants,
     with SP overrides via env).
  4. Merge `audit-fixes` → `main` again after each verified batch, then take a G-drive backup with `git archive`.
- **How I verify visuals:**
  - Built-in browser, preview `reef` (`node serve.mjs`).
  - Fake fullscreen: set `#viewport` to position:fixed inset:0, and `#tank` to 100vw × 56.25vw.
  - Pause with `reef.ui.paused = true`; force the time of day with `world.env.t` and `world.env.light`.
  - Capture with `computer` zoom on region [0,0,754,424].
  - The pane refuses real fullscreen requests; it scales emulated big viewports, so use the native size.
- **Lessons this round:**
  - Measure perf in real Chrome at the user's resolution, not in the preview pane: the pane hid a 4× GPU-process
    bottleneck. Chrome only GPU-copies a canvas into non-sRGB textures; never upload a canvas into SRGB8_ALPHA8.
  - Screen-space lens effects must scale with magnification, never 1/zoom.
  - Any per-fish sprite variant multiplies the cache working set; animate in the shader instead.
  - Run `node --check` after EVERY edit. A duplicate `const P` once broke app startup.
  - The smoke DOM stub lacks some canvas methods (`clip` was added). Add any new ctx method you use to the stub.
  - `ImageData` isn't in the stub, so the sprite rasterizer falls back to `fillRect` there.

**Plan for this round** (tick items off here as they ship):
- [x] GUI review in the built-in browser: screenshots at desktop, mobile, whole-lake, close-up, night,
      overlays and fullscreen. Fix layout and readability issues.
      Shipped `caa26ba`:
      - the legend was covered by the minimap and camera controls;
      - open on the whole lake;
      - neon fish and flora at night → dim and desaturate;
      - magenta sunfish;
      - near-white plants by day;
      - plankton "snow" at the overview;
      - truncated trophic labels;
      - mesh-gridded field overlays → a smooth heat map.

      Still to check: the mobile layout. Fullscreen can't be triggered without a user gesture.
- [ ] Colour grade / exposure: judge with screenshots and GPU-readback histograms, now that GL depth is
      right-side up.
- [x] Catfish nocturnality: `innate.dayRest` (catfish 0.5) damps daylight thrust, giving ~60% faster at night (was ~8%). A 3-seed A/B shows a cost within noise.
- [ ] Apex juvenile survival / brood protection.
- [x] Tests: the can't-fail checks are relabelled (REFUGE / clamp invariants). The Liebig check now asserts that the scarcer element sets the limit. A WebGL2 mock is still open.
- [ ] HUD O₂ readout semantics (it reads 100–116%).

**What happened.** On 2026-10-11 the human asked to "post it to GitHub and fix everything" in `AUDIT.md`.
They then asked for testing, pushing, re-auditing and improving to continue overnight, *without burning usage
on subagents*. Five worktree agents did the first wave of fixes. Everything after that was done solo.
All of it is on `main` via the `audit-fixes` branch.

**Repo:**
- https://github.com/jamesccupps/Reef (public).
- `main` = the latest verified state. `audit-fixes` = the working branch (merged).
- Commits use the repo-local noreply email (GitHub rejects the private Gmail with GH007).
- There's no `gh` CLI.
- On Windows PowerShell, commit with `git commit -F <msgfile>`.
- Budget rule from the human: don't fan out subagents or workflows unless they ask.

**Verified state (last strict gate):** `npm test` exit 0, ~131–144 steps/s, covering `headless.mjs`,
`smoke.mjs`, `ui-check.mjs` and `serve-check.mjs`.
- Save format is v24.
- Exact resume holds (load → 600 steps byte-identical at dt 1/60 and 1/30).
- P and N budgets are closed (plants included).
- GL orientation was verified on the GPU (caustics change the TOP bands).
- Interpolation was verified live (the drawn position moves every frame at ½×).
- No CSP violations or console errors.

**Shipped (details in `AUDIT.md` status and `docs/FEATURES.md` → "2026-10-11 audit-fix changes"):**
- **Wave 1:**
  - render: GL orientation, GL fallback, colour pipeline, interpolation, input;
  - UI: XSS, CSP, server, caps;
  - integrity: brain eras, exact resume, validated load;
  - bio: cannibalism grace, plant light average, per-second rates;
  - chemistry: wet/dry mask, conservative diffusion, closed budgets, hypolimnion, storms, outflow.
- **Solo follow-ups:**
  - plant N+P pool, which closed the last budget term;
  - apex energetics (diagnosis below);
  - round-trip fix and a strict no-negatives check;
  - a safe `makeFish` default age;
  - behavioural replacements for the formula-copy tests, plus a stress-scenario determinism check, a
    body-depth `qPrey` check and Baldwinian persistence checks;
  - docs: slim CLAUDE.md, FEATURES.md, README, LICENSE, ROADMAP status, archived history;
  - the step-rate badge fix.

**Apex predators (the main ecology finding):**
- Bass and pike didn't fail to breed; they **starved**. A bass burned ~0.09/s against an intake of ~0.05/s,
  and immigration rescue had become a treadmill. Diagnostic scripts: `scratchpad/verify/apex.mjs` and
  `budget.mjs`. They are session-local; recreate them from this description if needed.
- Fixes:
  - innate **pursuit** for bass/pike;
  - innate **hypoxia avoidance** for all species;
  - predator metabolism put on the size trend (bass 0.046→0.030, pike 0.056→0.036);
  - fish meals worth more (0.60/0.65 → 0.80/0.85).
- Result: bass immigrant share 91% → 80%, pike 76% → 61%, with prey steady.
- Then the remaining bottleneck turned out to be mate-finding. A lower breeding threshold was tested and
  rejected: births didn't rise. **Spawning aggregation** (`innate.spawnGround`) shipped instead.
- 1-year immigrant share now: bass 70%, pike 54%, catfish 29%, carp 39%, sunfish 16%. Total immigration **Caveat (2026-10-12):** those are single-seed (2024) figures. A 3-seed, 1-year A/B gives honest means of bass ~78%, pike ~59-66%, catfish ~47-49%, carp ~44-46% and sunfish ~22-24% immigrants. That is still better than the 91%/76% start, but less than seed 2024 suggested.
  is down 44%, and minnows hold steady (CV 0.04).
- Better, but bass and pike are **still not fully self-sustaining**. Next levers: juvenile survival and
  brood protection.

**Open / next (ranked in `ROADMAP.md` → "Build order & guards"):**
1. Apex self-sustainment: juvenile survival (pike eat many bass), the reproduction threshold, damping
   the immigration treadmill.
2. The rest of test hardening:
   - a WebGL2 mock in smoke (`GLPost` never runs under the stub);
   - relabel or replace the checks that can't fail (REFUGE "all species present", clamped O₂ range);
   - a faster gate (it's ~9 min serial; `node:test` with parallel files).
3. Catfish nocturnality is weak in effect (~8% faster at night).
4. N-fixation is rare at the default inflow.
5. The graphics realism roadmap. Re-tune the grade first: it was tuned against the upside-down GL depth.

**Needs the human's eyes:**
- the colour grade and exposure now that GL depth is right-side up;
- the HUD's average O₂ reading ~100–116% (wet-only means plus spring supersaturation);
- predator behaviour with pursuit (does it look natural?).

**Gotchas:**
- `renderer.draw(t[, alpha])` needs `t`.
- In FRAG_COMP, depth is `dpt = 1 − uv.y`.
- Test blocks go BEFORE the final summary `console.log`/`process.exit`.
- `World.makeFish` defaults to a living adult.
- Run new behavioural tests A/B against an identical world.
- `REEF_PERF_MIN=0` only while the CPU is shared.
- Agent worktrees are created at `main`.

---

## Before the audit: where things stood (2026-06-18)

The full verbatim history is in [`docs/archive/SESSION_LOG_2026-06.md`](docs/archive/SESSION_LOG_2026-06.md). It was moved out on 2026-10-11 because this file had grown to ~211 KB.

- **Last shipped:** graphics realism slice 1, a linear-HDR GPU pipeline (sRGB-decoded textures, RGBA16F, encode + dither last, live `present.exposure`).
- **Arcs completed before that:**
  - **Cognition/ecology (12 slices):**
    - brain action head (strike/flee/hide);
    - `LIFE_SCALE`;
    - motion realism (carving, turn-speed loss, burst-and-coast);
    - hunger/fear drives;
    - aquatic insects;
    - snails and crayfish;
    - dashboard slice A;
    - spatial cognition;
    - richer perception;
    - Baldwinian lifetime learning;
    - evolvable brain size.
  - **Graphics:**
    - Pass 1: de-pixelate;
    - Pass 2: rich organisms, effects and water;
    - Pass 3: WebGL post, volumetric light, GPU-lit fish;
    - a cinematic finish;
    - per-species fish art.
- **Planned graphics roadmap** ([`docs/GRAPHICS_RESEARCH.md`](docs/GRAPHICS_RESEARCH.md)):
  - AgX / PBR-Neutral tonemap;
  - shared surface heightfield;
  - Beer-Lambert depth colour;
  - depth/occluder MRT;
  - occluder-masked god-rays;
  - per-pixel fish normals, iridescence, fin SSS;
  - HG in-scatter;
  - real DOF + AO;
  - instancing.
- **Parked, non-graphics:**
  - dashboard slices B and C (selectable charts, food-web flux, CSV export);
  - "grow the lake" (amphibians, birds);
  - the scenario/preset engine.
- **Pending human eyeball:** the colour grade and exposure. The GL depth terms were upside-down until the 2026-10-11 fix, so the grade was tuned against the inverted image.
