# SESSION_STATE.md — Synapse Reef

Living handoff log. Newest entry on top. Each session: update **Current status**, append a
dated entry, and leave the sim runnable with the headless test green.

---

## ▶ NOW — Audit-fix overnight run (started 2026-10-11) — READ THIS FIRST after a compaction
**Mandate (human, 2026-10-11, before bed):** post to GitHub and fix everything in `AUDIT.md`. Then
keep going autonomously: test, push, re-audit, improve ("as good as it can be"). Keep this block
current so a compaction loses nothing.

**Repo:**
- Remote: `origin` = https://github.com/jamesccupps/Reef (public).
- `main` = the untouched baseline (`d21ce5c`).
- All work happens on branch **`audit-fixes`** and is pushed as it's verified.
- Commit identity is repo-local `148652101+jamesccupps@users.noreply.github.com`. GitHub rejects
  pushes that expose the private Gmail (GH007).
- There's no `gh` CLI. PR link:
  https://github.com/jamesccupps/Reef/compare/main...audit-fixes?expand=1

**Done:**
- Audit (6 lenses), recorded in `AUDIT.md`.
- Baseline commit `d21ce5c`.
- Gate fixes `25b678e`:
  - the LEAK-offset memory check could never fail;
  - the eye probe now uses 7-gene arrays;
  - `REEF_PERF_MIN` env var relaxes the speed budget when the CPU is shared;
  - stray files removed.
- Gate green at `25b678e`: headless ALL PASS, smoke OK, 126 steps/s; ~8 min alone.

**In flight — wave 1.** Five worktree agents branched from `25b678e`; each commits on its own
branch and I merge into `audit-fixes`.

| Agent | Owns | Fixes |
|---|---|---|
| render | `render.js`, `glpost.js`, `camera.js`, `main.js` | GL orientation, GL-failure fallback, grain/OETF, fish fringe + mips, double dimming, hue bucket, bed edge gap, interpolation, frame guard, input |
| ui | `ui.js`, `inspector.js`, `index.html`, `styles.css`, `serve.py`, new `serve.mjs`, `.claude/launch.json` | XSS escape, CSP, °F toggle, inspector, layout, caps, server bind |
| integrity | `core.js`, `species.js`, world.js persistence/identity + death line, env toJSON/load | era-based brain migration, exact resume + RNG state (v24), atomic validated load, per-world ids |
| bio-ecology | world.js plants/reproduction/feeding/qPrey/qThreat, config PLANT/MACRO/COMPETE/SPAWN/FALLBACK | newborn cannibalism grace, plant light EMA, asexual energy, per-second rates |
| chemistry | `environment.js` (except toJSON/load), world.js plankton/detritus/mussel/corpse-P, config chem blocks | wet/dry mask, flux diffusion, P/N budgets, deep temp, O₂ clamp, storm, scum, outflow |

All agents append new tests at the END of test files under `// ==== audit-fixes: <area> ====`.

**Progress:**
- ✅ **ui merged** (`20740a1`).
  - New gate files: `test/ui-check.mjs` and `test/serve-check.mjs`.
  - `npm run serve` now runs `node serve.mjs`.
- ✅ **integrity merged** (`5d2aeb9`), plus a UI reconcile (`45de520`).
  - Save format is now **v24**.
  - `parseSave` validates everything into locals, then commits atomically.
  - The brain layout history lives in `BRAIN_ERAS` (`species.js`).
  - **Merge rule for the ecology/chemistry branches:** any new per-entity state they add must go into
    `toJSON` AND the `parseSave` builders (world.js, plant builder ~:150). Env state goes into
    `Environment.toJSON`/`load`. The strict resume test (load → 600 steps byte-identical) fails until
    that's done.
  - `addAgent`/`makeFish` now return `null` at `GLOBAL_MAX`.
- ✅ **render merged** (`e31c687`).
  - GL orientation fixed. GPU readback: caustics now change the TOP bands
    `[0,0,0,0,2.4,26.6,38.2,38.0,34.8,19.3]` (bottom→top).
  - Canvas-swap fallback, interpolation, pinch zoom.
  - **Still to verify in a FOREGROUND browser tab:** that interpolated motion looks smooth. The agent's
    tab was in the background, so its frame loop never ran.
  - The human should eyeball the grade now that the orientation is fixed.
- Commit messages: use `git commit -F <file>`. PowerShell 5.1 mangles quotes inside here-strings
  passed to git.

**Watch out:**
- **Worktrees are based on `d21ce5c`, not `25b678e`.**
- **Both test files END with `process.exit()`.** A block appended after it never runs. I told the agents to insert before the summary line; check this on every merge.

**Next:**
1. Merge each branch into `audit-fixes`. Expect conflicts where several agents appended to the end of
   the test files: keep all blocks.
2. Serialize any new per-entity state the ecology agents added (e.g. a plant light-EMA field). The
   integrity agent's strict resume test will flag anything missed.
3. Run the STRICT gate on its own: no browser preview, no other agents.
4. Run a joint `npm run balance 3`.
5. Re-verify GL orientation on the GPU (A/B readPixels diff per band: the caustics must change the
   TOP bands).
6. Push.
7. **Human, 2026-10-11: "don't use up all my usage by doing sub agents."** NO new subagents
   after wave 1. I do waves 2–3 myself, lean: read line ranges, not whole files.
8. Wave 2 (me):
   - test hardening: behavioural tests in place of formula copies, broader determinism, a WebGL2
     mock in smoke if it's cheap;
   - docs: slim CLAUDE.md, archive SESSION_STATE, rewrite README, LICENSE, `package.json` `serve`
     → `node serve.mjs` plus `engines` and `private`.
9. Wave 3 (me): a targeted self-audit of the merged diff. Fix what it finds, then merge
   `audit-fixes` → `main`.

**Wave-2 detail notes** (what `AUDIT.md` only summarizes: specific test gaps and the docs-restructure plan)
are in this session's scratchpad: `…\3fbb8b1d-0819-461b-9dac-5da076bd3f7a\scratchpad\wave2-notes.md`.

**Gotchas:**
- `renderer.draw(t)` needs `t`.
- In FRAG_COMP, `uv.y=0` is the screen BOTTOM.
- Run the gate with `REEF_PERF_MIN=0` while other agents run.
- G-drive zips: use `git archive` (the working tree now has `.git` and worktrees).

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
