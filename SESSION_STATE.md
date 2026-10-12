# SESSION_STATE.md — Synapse Reef

Living handoff log. The **NOW** block is the current state, so keep it accurate. The full history is in
`docs/archive/SESSION_LOG_2026-06.md`. Leave the sim runnable and the gate green.

---

## ▶ NOW — Audit-fix overnight run (started 2026-10-11) — READ THIS FIRST after a compaction

**Mandate (human, 2026-10-11, before bed):** post to GitHub and fix everything in `AUDIT.md`. Then
keep going autonomously: test, push, re-audit, improve. Keep this block current.

**Budget rule (human):** "don't use up all my usage by doing sub agents." No new subagents. Work solo
and lean: read line ranges, and only the summary lines of long outputs.

**Repo:**
- Remote: `origin` = https://github.com/jamesccupps/Reef (public).
- `main` = the untouched baseline (`d21ce5c`).
- Work happens on **`audit-fixes`**, pushed at each green checkpoint.
- Commit identity is repo-local `148652101+jamesccupps@users.noreply.github.com` (GitHub rejects the
  private Gmail with GH007).
- No `gh` CLI. PR link: https://github.com/jamesccupps/Reef/compare/main...audit-fixes?expand=1
- Commit with `git commit -F <msgfile>`: PowerShell 5.1 mangles quotes passed to git.

**✅ Wave 1 complete:** five worktree agents (ui, integrity, render, bio-ecology, chemistry) all merged
into `audit-fixes` (last merge `4b646c0`).
- Exact resume verified on the merged tree: load → 600 steps is byte-identical at dt 1/60 and 1/30.
- Save format is **v24**.
- Merge fixes I made:
  - kept every appended test block;
  - serialized `plant.la` and `detritus.n`;
  - folded the chemistry toJSON/load wrapper into `Environment` (it had dropped load's `hint`);
  - made the pre-v24 fallback means wet-only.
- Docs done:
  - SESSION_STATE slimmed and history archived;
  - README rewritten;
  - LICENSE added;
  - `package.json` gained `private`, `engines` and `serve` → `node serve.mjs`;
  - GRAPHICS_RESEARCH moved to `docs/`.

**Known open items (measured, honest):**
- **Apex predators: improved, still open.**
  - Diagnosis (`scratchpad/verify/apex.mjs`, `budget.mjs`): they STARVED rather than failing to breed.
    A bass burned ~0.09/s against an intake of ~0.05/s.
  - Fixed 2026-10-12:
    - innate pursuit for bass/pike;
    - hypoxia avoidance for all species;
    - predator metabolism put on the size trend, and richer fish meals.
  - Result (1-year balance): bass immigrant share 91% → 80%, pike 76% → 61%, with prey steady.
  - Still not fully self-sustaining. Next levers: juvenile survival (pike eat many bass), the
    reproduction threshold, and immigration damping.
- ✅ **Plant P term closed** (`5b05004`): plants bank the N+P they absorb (`p.nut`, saved as `nu`), and
  the gate checks the budget with plants ON.
- **N-fixation barely runs at the default inflow load.** N limitation is real but seasonal.
- **Needs human eyes:**
  - the colour grade, now that the GL orientation is fixed;
  - smoothness of interpolated motion (a foreground tab is needed);
  - HUD values (wet-only means read higher than before).

**Next:**
1. Strict gate alone (no browser, no agents) on `4b646c0`, then push.
2. Joint `npm run balance 3` on the merged lake; compare with the agents' tables.
3. Browser check in a FOREGROUND tab:
   - no console errors or CSP violations;
   - GL-orientation readback (caustics change the TOP bands);
   - interpolation smoothness;
   - one screenshot.
4. Fix the plant P stoichiometry.
5. Investigate apex recruitment (bass/pike), lean.
6. CLAUDE.md rewrite: slim, key-facts table, the new "Add a sensor" recipe from the integrity report
   (append one `BRAIN_ERAS` entry); remove stale claims. Also ROADMAP: drop the stale "Recommended build
   order" section (ROADMAP.md ~:924) and add a status header.
7. Mark AUDIT.md items fixed / open.
8. Targeted self-review of the merged diff (no agents). Then merge `audit-fixes` → `main`.
9. G-drive backup: `git archive --format=zip -o G:\synapse-reef-backups\synapse-reef_<stamp>_<slice>.zip HEAD`.

**Gotchas:**
- `renderer.draw(t[, alpha])` needs `t`.
- In FRAG_COMP, depth is now `dpt = 1 - uv.y`.
- Test blocks go BEFORE the final summary `console.log`/`process.exit` in `headless.mjs` and `smoke.mjs`.
- `REEF_PERF_MIN=0` only when the CPU is shared.
- Worktrees from the Agent tool are created at `main`, not the current branch.
- Wave-2 detail notes are in this session's scratchpad: `…\3fbb8b1d-…\scratchpad\wave2-notes.md`.

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
