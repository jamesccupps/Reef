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

## ✅ GRAPHICS REALISM — Slice 1: LINEAR-HDR PIPELINE (2026-06-18, post-compaction resume)
**State: gate GREEN, sim runnable, save `version: 23` (render-layer only — NO sim/save change).** First slice of the
post-compaction photoreal roadmap (`GRAPHICS_RESEARCH.md`). Fixes **GAP 1**, the #1 "video-gamey" bug: the GL post path
composited sRGB pixels as if they were *linear* → milky/over-bright bloom + crushed darks. The whole GPU path is now
**linear-HDR**, all in `src/glpost.js` behind `isRealGL2` (Canvas2D fallback + smoke untouched):
- **sRGB-decode on sample (free, hardware):** `sceneTex` + the fish sprite textures upload as **`SRGB8_ALPHA8`** → the sampler
  linearizes (and filters correctly in linear). Fish textures switched to **straight alpha** (premult OFF); `FRAG_FISH` reworked
  to light in linear then **premultiply at output** — the old premult-in-sRGB would dark-fringe antialiased fish edges.
- **Linear HDR throughout:** the scene-FBO + bloom were already **RGBA16F** (reused, with the RGBA8 fallback ladder), so
  bloom/god-rays/caustics/scatter/ACES all run in linear = physically-correct HDR bloom (tight highlights, not milky).
- **sRGB-encode + dither LAST:** `FRAG_COMP` ends with `pow(col, 1/2.2)` then a **±1 LSB TPDF dither** (kills 8-bit
  water-column/sky banding) as the final frame write. *(This also lands slice 2's dither half.)*
- **Live `exposure` knob** (`renderer.present.exposure`, default 1.05; joins `rayExp`/`causAmt`/`fishAmbient`…) so the
  human can do the grade-eyeball-retune the research doc flagged — without a GLSL edit.
**Verified in REAL WebGL2** (preview + GPU **pixel-readback** — the WebGL canvas would not screenshot, `preserveDrawingBuffer:false`;
RAF is throttled headless so I forced synchronous `renderer.draw()` + `readPixels`): real GL2 active (RGBA16F scene+bloom,
`glError 0`, no compile→fallback), fish lit & ready. At **true noon** (forced `light=1`): a healthy filmic histogram
(`meanLuma≈0.27`, smooth rolloff, surface band the brightest region) with **zero highlight clipping** — the milky-bloom fix.
Exposure sweep 0.8→1.05→1.4→1.8 monotonic, **no clipping even at 1.8** (ACES rolls off). Low-light dawn/dusk reads moodier/darker
= correct, not a regression. **✅ Gate GREEN** (`npm test`): headless **ALL CHECKS PASSED** + smoke **SMOKE OK** + determinism
intact (1084===1084), exit 0. **Backup:** `G:\synapse-reef-backups\synapse-reef-graphics-linear-hdr-20260618-063014.zip` (333 KB).
**▶ NEXT graphics slice** (`GRAPHICS_RESEARCH.md`): slice 2's TPDF dither is DONE → remaining is the **AgX/PBR-Neutral tonemap swap**
(behind a knob, ~10 lines), then slice 3 (shared surface heightfield `h(x,t)`) / slice 4 (Beer-Lambert depth colour). **Human
eyeball still wanted** on the grade tints/exposure now that they operate in linear (the doc's flagged re-tune).

---

## ⏸️ COMPACTION CHECKPOINT — 2026-06-17 (historical — compaction done; resumed in the entry above)
**State: gate GREEN, sim runnable, save `version: 23`.** Safe to compact.
- **Gate GREEN & provably current:** last full `npm test` = **headless 262/0 + smoke 39/0**, exit 0, determinism intact. Only the
  3 docs + this checkpoint were edited since — every `src/`/`test/` file is older, so the gate result still holds (markdown isn't tested).
- **Clean:** no scratch/log/tmp files; preview parked; one new file this turn — **`GRAPHICS_RESEARCH.md`**.
- **Backups:** every slice zipped to `G:\synapse-reef-backups\`; this checkpoint's complete state (code + all docs + GRAPHICS_RESEARCH.md)
  = `synapse-reef-COMPACTION-graphics-arc+research-20260617-231852.zip`.
- **This session shipped the whole GRAPHICS / VISUAL-FIDELITY arc** (entries below, newest first): Pass 1 de-pixelate → Pass 2 rich
  organisms/FX/water → Pass 3 WebGL (post pipeline → volumetric god-rays/caustics → GPU-lit fish) → cinematic finish (specular +
  reflective surface + filmic grade) → distinct per-species art. All render-layer-only; the neuroevolution sim + determinism are untouched.

**▶ NEXT (the planned next work — researched & ready): make the graphics PHOTO-REAL. See `GRAPHICS_RESEARCH.md`** — a synthesized,
cited, codebase-mapped realism roadmap (from a 5-lens web-research workflow). The headline: two foundational gaps the current renderer
has — **(1) no linear-HDR/sRGB pipeline** (the #1 "video-gamey" bug: RGBA8 treated as linear → milky bloom, crushed darks) and **(2) no
depth/occluder buffer** (god-rays through fish, fake DOF, no AO). The plan's order: **linear-HDR float pipeline (S, do first)** →
dither + AgX tonemap → shared surface heightfield → **Beer-Lambert depth colour (M)** → **depth/occluder MRT (M, keystone)** →
occluder-masked god-rays → **per-pixel fish normals + iridescence/fin-SSS/eye-glint (M, biggest fish leap)** → HG in-scatter → real
DOF + AO → instancing. Each is a coherent gate-safe slice behind `isRealGL2`. *(Parked non-graphics: dashboard Slice B/C; "grow the
lake" amphibians/birds; the scenario engine.)*

---

## ▶ Per-species art (most recent ship before the checkpoint)
**State: gate GREEN, sim runnable, save `version: 23`.** Most recent work: **DISTINCT PER-SPECIES FISH ART** (`species.js` `drawFish`):
the six species no longer share one generic silhouette — `fillBody` now takes a per-species **body profile** (independent top/belly
curves) + parametrized dorsal (position/width/height) + signature marks, so **pike** is a long slender spindle with a rear-set
dorsal, **sunfish** a round deep disc with an opercular ear-spot, **catfish** a broad-headed taper, **carp** a deep round-bellied
body with coarse scales, **bass** streamlined, **minnow** slim. Pure sprite-layer (no WebGL); the GL-lit pipeline lights the new
shapes automatically. Verified (pike + sunfish side-by-side clearly distinct). Before that, a **CINEMATIC FINISH** pass on the GL shaders (`src/glpost.js`,
all ALU, ~148 fps @1080p): a **specular dorsal glint** on the GPU-lit fish (wet, sculpted highlight), a richer **reflective surface
band** (Snell's-window sky reflection at the top), and a **filmic contrast S-curve + warm-shallow→cool-deep split-tone** grade for
cinematic depth separation. Live-tunable (`present.fishSpec` etc.). Before that, the **★ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 3
(WebGL2)**, **3 slices** (all in `src/glpost.js` + a little `render.js`, all designed via de-risking workflows + reviewed):
- **Slice 3** — **GPU-LIT FISH**: fish & corpses now draw as **directionally-lit textured GL quads** (lit from the surface sun →
  rounded, dimensional bodies instead of the flat 2D blit), assembled into an HDR scene-FBO with the background so they bloom/
  grade with the water. Sprite canvases → GL textures (cached by SpriteCache **entry-object identity**, LRU 512). Gated behind a
  **`renderer.glFish`** flag with the **2D fish path as the untouched fallback** (smoke stub / no-WebGL2 / any fish-init failure →
  2D). Verified: **pixel parity** with 2D (position/size/facing/fade identical, only shading differs), lit-from-above, night-dim,
  ~169 fps @1080p whole-lake. Far dot-tier + contact shadows + strike ripples stay 2D this slice. Tunable: `present.fishAmbient`/`.fishRim` (baked 0.42/0.40).
- **Slice 1** — a **GPU post-processing pipeline**: the 2D scene → an offscreen canvas → composited to `#tank` through WebGL2
  (HDR float bloom, ACES tonemap, underwater refraction, chromatic aberration, fake DOF, grain, day/night grade + vignette).
  Feature-detected with a Canvas2D fallback (headless stub + no-WebGL2 browser). Recovered perf 1080p whole-lake ~56→~139 fps.
- **Slice 2** — a **GPU volumetric water + light stage** folded into the composite: **screen-space god-rays** (a radial march of
  the resident half-res bloom texture toward the sun), a **richer animated caustic net**, **in-scatter underwater glow**, and a
  **surface sheen** — all pre-ACES so the tonemap keeps them natural. The 2D godrays/caustics are now gated behind `postInGL`
  (no doubling). Verified live (god-rays from the surface sun, none at night, no corner artifact when the sun is off-frame,
  graceful in turbid blooms); ~102 fps @1080p day. Tunable via `renderer.present.rayExp` / `.causAmt` (baked 1.6 / 0.40).

Feature-detected fallback keeps the gate green. Pass 1 (de-pixelation) + Pass 2 (rich organisms/FX/water) entries are below;
the 12-slice cognition/ecology arc preceded the graphics work (compaction checkpoint, further below).

### ⏸️ Compaction checkpoint — the 12 slices shipped before the graphics work
This session shipped 12 slices (after the overnight log below), each
gate-green + balance-checked (no extinction) + adversarially reviewed (SHIP) + documented + G-drive-backed-up:
1. **Render fix** — fish no longer draw outside the bed/banks (sprite inset; render-only).
2. **Brain ACTION SPACE** — `OUT` 2→5: turn, thrust + brain-gated **strike / flee / hide** (`config.js ACTION`).
3. **Longer lifespans** — `TIME.LIFE_SCALE = 1.6` (×matureAge & maxAge, ratios preserved).
4. **Trajectory realism** — momentum/**carving turns** + **turn-speed-loss** + **burst-and-coast** (`config.js MOTION`; `velHeading`/`stroke`).
5. **Internal DRIVES** — hunger/fear fed back as the last 2 brain inputs (`config.js DRIVE`); input-migration preserves evolved brains.
6. **Aquatic INSECTS** — benthic larvae ↔ emergent surface hatch (`config.js INSECT`; `world.larvae`/`world.insects`) — "grow the lake" #1.
7. **Benthic INVERTEBRATES — snails + crayfish** (`config.js SNAIL`/`CRAYFISH`; `world.snails`/`world.cray`) — "grow the lake" #2 (save v20).
8. **Dashboard overhaul — Slice A** (human-flagged): 3 new pure accessors + a reorganized rail (Food-web / Evolution / Cognition cards) surface the hidden subsystems. No sim change.
9. **SPATIAL COGNITION** (human-flagged cognition arc): 3 allocentric brain inputs — a compass (heading sin/cos) + a bearing to the natal site `homeX` — so homing/site-fidelity/migration can EVOLVE (save v21).
10. **RICHER PERCEPTION v1** (cognition arc, "all of them"): +2 brain senses — a turbidity-proof lateral-line `flow` + a piscivore `prey size` selectivity sense (save v22).
11. **LIFETIME LEARNING** (cognition arc): Baldwinian reward-modulated Hebbian plasticity — fish run a plastic policy `a.lw` that learns within life; the genotype `a.g` (inheritance) stays untouched (no save change).
12. **EVOLVABLE BRAIN SIZE** (cognition arc, final): a 7th `brain` gene sets active hidden units (`forward` masks the rest) with a per-neuron metabolic saving → the encephalization trade-off evolves (save v23).
Full write-ups for each are in the dated entries below (newest first). **✅ COGNITION ARC COMPLETE** ("all of them"): richer perception → lifetime learning → evolvable brain size — all shipped. **Also added:** a ★ ROADMAP item for a **graphics / visual-fidelity overhaul** (human-flagged 2026-06-16).

**Verification:** last full gate **headless 262/0 + smoke 35/0**, byte-identical determinism (4074425 chars), **SMOKE OK**;
3-yr balance **no extinction** (bass/pike remain the pre-existing immigration-dependent apex); **all 12 slices this session
adversarially reviewed (every verdict SHIP, 0 critical/moderate defects)**. Save **v23**.

**✅ BACKUPS:** every slice zipped to `G:\synapse-reef-backups\`; this checkpoint's complete state (code + all docs) is
`synapse-reef-compaction-cognition-arc-20260617-060719.zip`. Nothing un-saved.

**▶ NEXT (options — graphics Passes 1, 2 & 3/slices-1-2-3 are DONE):** de-pixelated + rich organisms/FX/atmosphere + a **WebGL2
GPU post pipeline** + **GPU volumetric water/light** + **GPU-lit fish** (drawing now partly on the GPU). The WebGL infra
(context, shaders, FBOs, scene-FBO, sprite→GL-texture cache, the lit-quad pipeline, fallback) is all in `src/glpost.js` for later
slices. Possible follow-ups, in rough priority: (a) **Pass 3 later slices** — **instancing** the fish quads (one
`drawArraysInstanced` per texture batch → many-thousand-agent counts); **per-species / normal-mapped** fish art (the lighting
normal is a procedural cylinder now); GL the dot-tier/shadows/ripples; **true 3D volumetric water + a real depth buffer** (true
DOF/bokeh + occluder-cast shafts); a **linear-HDR** pipeline. (b) **Dashboard Slice B/C** — selectable charts + food-web flux +
CSV export. (c) **"Grow the lake"** — amphibians/birds. (d) the **scenario-engine** north-star.

---

## ✅ GRAPHICS — DISTINCT PER-SPECIES FISH ART (species.js silhouettes) (2026-06-17)
**Why:** the 4th of the "make it better" directions (the human picked all four). All six species shared one generic ellipse
`drawFish` body — now each has its own recognizable silhouette. **Pure sprite-draw layer** (`species.js`), so NO WebGL risk; the
GL-lit pipeline (slice 3) lights/blooms the new shapes for free, and the headless test is unaffected (draw isn't called there).
- **`fillBody` generalized:** takes an optional per-species `profile(tn)` → `[topMul, bellyMul]` of `Hh` (asymmetric back vs
  belly), via a new `ell(tn,p)` helper (`p<1` fuller/rounder, `p>1` slimmer/pointier). Default (no profile) = the old ellipse.
- **Parametrized dorsal fin** (`P.dorsalX`/`dorsalW`/`dorsalH`) + a `P.earSpot` opercular mark + `P.scaleTex` grain knob.
- **The six profiles:** pike = long slender **spindle** (`ell .62 ×0.82`) + **rear-set dorsal** (`dorsalX -0.55`); sunfish = round
  deep **disc** (`ell .46`) + **ear-spot** + long dorsal; catfish = **broad head → thin tail** (asymmetric taper by head-fraction);
  carp = **deep, round-bellied** (`ell .55, belly ×1.12`) + coarse scales (`scaleTex .1`) + long dorsal; bass = **streamlined**,
  fuller-forward; minnow = **slim**. Each set inline in the species' `P`.

**Verified:** smoke green (every species' `draw()` builds a valid sprite, no clip — belly mults ≤1.12 stay inside the canvas's
1.4·Hh margin). **Live:** pike renders as an unmistakable long predatory spindle with the rear dorsal; sunfish as a round disc
with the dark ear-spot — clearly distinct silhouettes (a real identifiability upgrade). No sim/determinism/save change.
**✅ Gate GREEN** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0) + smoke **39/0**. **Backup:**
`G:\synapse-reef-backups\synapse-reef-graphics-per-species-art-20260617-223300.zip` (331,016 bytes).

**▸ "MAKE IT BETTER" — all 4 chosen directions DONE:** ✅ dramatic fish lighting (specular) · ✅ distinct per-species art ·
✅ cinematic water/surface (reflective band) · ✅ overall filmic grade + depth split-tone. The graphics arc now spans Pass 1
(de-pixelate) → Pass 2 (rich organisms/FX/water) → Pass 3 (WebGL post + volumetric light + GPU-lit fish) → cinematic finish →
per-species art. **Remaining graphics (later, optional):** instancing the GL fish quads (many-thousand agents), per-fish
normal-mapped shading, true 3D water + depth buffer (true bokeh DOF), GL the dot-tier/shadows/ripples, lusher plants/bed.

---

## ✅ GRAPHICS — CINEMATIC FINISH pass (fish specular + reflective surface + filmic grade) (2026-06-17)
**Why:** "make it better" → the human picked all four polish directions; this slice does the three GL-shader ones together
(the 4th, per-species art, is its own species.js slice). All in `src/glpost.js` (FRAG_FISH + FRAG_COMP), pure ALU — no new
passes/textures, perf unchanged (~148 fps @1080p whole-lake). Implemented directly (refinement of shaders now well-understood)
+ live-tuned in the browser.
- **Dramatic fish lighting:** a crisp **specular dorsal glint** in FRAG_FISH (Blinn half-vector, daylight-gated, corpse-damped,
  ×coverage = premult-safe) → the GPU-lit fish now have a wet, sculpted highlight where the surface key hits the rounded back.
  Knob `present.fishSpec` (baked 0.6).
- **Cinematic water/surface:** the thin surface sheen → a richer **reflective SURFACE band** (Snell's window) — a bright,
  double-rippled, sky/sun-tinted ceiling at the top ~7%, day-gated, clarity-scaled.
- **Overall grade/mood:** after the existing ACES+grade, a gentle **filmic contrast S-curve** (`col²(3-2col)` mix) + a
  **warm-shallow → cool-deep split-tone** (`smoothstep(uv.y)` depth separation) → more cinematic punch + depth without veiling.
**Verified live:** shaders compile (fishReady/failed=false, no console errors); benthic catfish show the wet specular glints +
sculpting; whole-lake shows the shimmering surface band + warm-shallow/cool-deep separation; night correct (surface band off via
`uSunUp→0`, cool grade); ~148 fps @1080p. The 2D fallback is untouched (these are GL-composite-only) → smoke green.

---

## ✅ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 3 / slice 3 (GPU-LIT FISH — drawing moves to the GPU) (2026-06-17)
**Why:** "keep going" → the human chose GPU-lit fish (the main remaining gap — fish were flat). This is the first slice that moves
DRAWING (not just post) onto the GPU. Designed via a **third de-risking Workflow** (3 proposals — GL pipeline+texture-lifecycle /
lighting-shader / integration+risk — → one synthesized spec; design-only, no file writes).

**Architecture (the key restructure):** when `renderer.glFish` is on, `render.js` draws the scene WITHOUT the sprite-tier fish/
corpses (the far dot-tier, contact shadows, strike ripples + everything else stay 2D in the background), and instead collects a
per-fish quad list. `GLPost.present()` then assembles an **HDR scene-FBO** = (1) blit the 2D background fullscreen, (2) draw the
**lit fish/corpse quads** on top, and runs the EXISTING bright→blur→composite on THAT — so fish bloom/refract/tonemap/grade
**consistently with the water**. No fish ⇒ `sourceTex = sceneTex` = byte-identical to before.
- **Lit-quad shader (`VERT_FISH`/`FRAG_FISH`):** the VS reproduces render.js's exact 2D affine on the GPU from device-px
  uniforms (center `p2` + half-extent + rotation + facing-flip), so toggling `glFish` does NOT move/resize/mirror a fish — only
  shading changes (verified pixel-parity). The FS samples the sprite GL-texture and lights it: a **horizontal-cylinder normal**
  from the quad UV, **half-Lambert + ambient floor** (never darker than the flat blit), a body-colour **Fresnel rim** (daylight-
  gated, corpse-damped), **per-fish depth haze** copying the 2D water-haze math (so a deep GL fish recedes into the same murk),
  day/night + depth dim, premultiplied-alpha output. Light key comes from the **surface sun** (`sunUV` azimuth, screen-up).
  *(Fixed one spec sign bug: the light-dir Y was inverted — would light the belly; flipped so the dorsal catches the surface key.)*
- **Sprite→GL-texture cache** keyed by the **SpriteCache entry-OBJECT identity** (buckets are immutable once built → upload once,
  LRU-evict at 512) — needs NO render.js plumbing to expose keys. Premultiplied upload + `ONE/ONE_MINUS_SRC_ALPHA` blend → clean soft edges.
- **Never-unrunnable:** the whole GL-fish path is gated behind `glFish` (true only when `present.gl && fishReady && !fishFailed`,
  re-read each frame). `_buildFishGL` is try/caught (→ `fishReady=false`), the per-frame fish pass is try/caught (→ `fishFailed=true`,
  reverts to 2D next frame). The smoke stub has no real WebGL2 → glFish false → the 2D draws (lifted verbatim) drive every assertion.

**Verification:** gate GREEN (headless 262/0 + smoke 38/0 — the 2D fallback is byte-identical, exercised by the stub). **Live on
real WebGL2:** fishReady true (shaders compiled), no console errors; **pixel-parity** A/B (glFish off↔on: position/size/facing/
fade identical, only shading differs); **lit from above** (dorsal bright, belly shaded → rounded dimensional fish vs the flat 2D
blit — a clear upgrade, esp. the benthic catfish under the god-rays); **night** dim & correct; **~169 fps @1920×1080** whole-lake
(far fish are 2D dots; ~174 sprite-tier fish become GL quads); texture cache bounded at 512 (LRU).

**Known limits / next:** per-fish draw (no instancing yet — fine ≤~1000 agents); the normal is a procedural cylinder (no
per-species normal maps / real geometry); dot-tier + shadows + ripples still 2D; depth terms screen-space. Instancing,
normal-mapped/per-species art, and true 3D water + depth buffer are the later slices.

**✅ Gate GREEN** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0, determinism intact — render-only) + smoke
**39/0** (+1: `glFish` stays off under the stub → 2D fallback). **Backup:** `G:\synapse-reef-backups\synapse-reef-graphics-pass3-slice3-glfish-20260617-220340.zip` (327,744 bytes). Save still **v23**.

---

## ✅ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 3 / slice 2 (GPU volumetric water + light) (2026-06-17)
**Why:** "keep going" on the WebGL leap. Slice 2 makes the WATER read as a volume — the vision's "volumetric water / lighting &
atmosphere." Designed via a **second de-risking Workflow** (3 parallel proposals — god-rays GLSL / caustics GLSL / integration+risk
— → one synthesized drop-in spec; **design-only, no file writes** this time, since the integration files were gate-green).

**What shipped (all in `src/glpost.js` FRAG_COMP + a few `render.js` lines — render-only, no sim change):**
- **Screen-space volumetric GOD-RAYS:** a 24-tap radial march FROM each fragment TOWARD the sun's screen-UV, accumulating the
  **already-resident half-res bloom texture** as a free, smooth bright-mask (so it costs ~24 cache-warm taps, no new pass/FBO/
  program). Decay/density/weight + a `gl_FragCoord` dither (de-band) + an exp distance falloff. Gated to sun-up, faded by depth +
  turbidity, with an **off-box guard** (fades to 0 as the sun UV leaves [0,1] → no rays-from-a-corner).
- **Richer animated CAUSTIC net:** 3 octaves of domain-warped ridged trig veins, anisotropic, depth-gated to the lit upper water,
  modulated by clarity × light × sun-up, tinted to the water colour (a multiplicative light net, not a flat overlay).
- **In-scatter underwater GLOW + surface SHEEN:** exponential depth in-scattering (upper water glows, deep stays moody) + a thin
  rippled specular band at the waterline. All injected **PRE-ACES** (between bloom-add and tonemap) so overshoot rolls off — natural, not gaudy.
- **New uniforms** `uSunUV/uSunInt/uSunUp/uRayExp/uCausAmt` (default-guarded); `render.js` computes the sun screen-UV from the
  existing sun world-pos `sp` + intensity scalars and passes them in `present()`. The **2D godrays + 2D caustics are now gated
  behind `!this.postInGL`** (mirroring the 2D-bloom gate) so the GL versions don't double them; the 2D path stays for the fallback.
- **Tuning knobs** live on the presenter (`renderer.present.rayExp`/`.causAmt`, baked 1.6 / 0.40 after eyeballing).

**FLIP-Y note (the spec's #1 risk, resolved):** uv.y=0 == TOP/surface in FRAG_COMP (consistent with the existing surf/dofDeep/flash
terms), so the sun UV passes `v = sp.y/height` with NO inversion — confirmed in-browser: shafts emanate from the SURFACE sun, not the bed.

**Verification:** gate GREEN (headless 262/0 + smoke 38/0 — GL-only changes don't touch the Canvas2D fallback the stub drives).
**Live on real WebGL2:** GLPost compiled+linked (failed:false, no console errors); day = god-rays + caustics + glow from the
surface sun (flip-Y correct); night = none (the `uSunInt>0.001` branch skips); sun panned off-frame = no corner artifact;
turbid bloom = rays dim + water greens, not muddy. **Perf ~102 fps @1920×1080 day whole-lake** (god-ray loop active) — down from
slice-1's ~139 but well above 60; the loop is branch-skipped at night.

**Known limits:** depth terms use SCREEN uv.y (a post-only approximation: top-of-screen ≈ surface), so god-rays read as a sun-glow
rather than hard occluder shafts, and are most dramatic when the sun disc is on-screen (whole-lake). True depth-buffer shafts +
volumetric 3D water are still the later (move-drawing-to-GPU) slices.

**✅ Gate confirmed GREEN after slice 2** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0, determinism intact —
render-only) + smoke **SMOKE OK** (38/0). **Backup:** `G:\synapse-reef-backups\synapse-reef-graphics-pass3-slice2-volumetric-20260617-211332.zip`
(321,221 bytes). `glpost.js` is the only file the GL work touches besides a few render.js lines; design workflow left no stray files. Save still **v23**.

---

## ✅ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 3 / slice 1 (the WebGL2 leap: GPU post pipeline) (2026-06-17)
**Why:** the human's "do the WebGL leap." Canvas-2D post was at its ceiling (the full-frame bloom cost ~5 ms @1080p → ~60 fps).
Slice 1 moves POST-PROCESSING to the GPU — the single biggest fidelity+perf win — while LEAVING the 2D scene drawing in place
(instanced GL sprites / per-fish normal shading / true 3D water are later slices). **Designed via a de-risking Workflow** (3
diverse design proposals — low-risk / max-fidelity / perf-robust — + an adversarial WebGL risk register → one synthesized
implementation spec; the resulting `glpost.js` was reviewed before integration).

**Architecture (the key decision — keeps the gate meaningful & the sim runnable):** a canvas has ONE context type, so the 2D
renderer now draws the whole scene to an **offscreen `renderer.scene` canvas**, and a feature-detected presenter composites it to
the visible `#tank`. `src/glpost.js` `makePresenter(canvas)`:
- **Real WebGL2 present** (`GLPost`): uploads the scene as a texture each frame (`texSubImage2D`, flip-Y, no readbacks) and runs
  GPU passes → **bright-pass + half-res ping-pong gaussian bloom** (RGBA16F via `EXT_color_buffer_float`, else RGBA8) → a
  **composite** shader: ACES tonemap, animated **underwater refraction + caustic UV-warp** (surface-weighted), **chromatic
  aberration**, a **fake DOF** (edge/deep focus falloff), bloom add, **day/night/turbidity grade**, **film grain**, **vignette**.
- **Fallback** (`Canvas2DPresenter`): no real WebGL2 (the smoke stub — its `getContext` returns a 2D-ish fake that fails
  `isRealGL2`; or a no-WebGL2 browser) → a 1:1 `drawImage(scene)` blit, and the 2D path keeps its own bloom/grade/vignette.
- A **`renderer.postInGL`** flag (re-read each frame, so a mid-run context loss re-enables the 2D post) makes the 2D draw SKIP
  its bloom/grade/vignette when GL will apply them — **no double-post**. `makePresenter`/`GLPost` **never throw** (try/caught →
  fallback); context-loss/restore handled; framebuffer-completeness checked with an RGBA8 downgrade.

**Integration:** `render.js` — constructor builds the offscreen scene + presenter (`mkCanvas` moved up first); `resize()` sizes
the scene + forwards to `present.resize`; `draw()` sets `postInGL`, wraps the 2D bloom/grade/vignette in `if(!postInGL)` (and the
cheap-bloom source is now `this.scene`, not `#tank`), and ends by calling `present.present(this.scene, {time,light,turbidity,
night,warm,zoom,flash:0,secchiFrac,clarity})`. `main.js` unchanged (present() happens inside `draw()`). `test/smoke.mjs` +3
assertions (the presenter falls back cleanly: gl null, postInGL false, offscreen scene sized to the backing, present/resize/
dispose never throw) — no new DOM-stub methods needed.

**Verification:** gate GREEN — **headless 262/0 + smoke 38/0** (the +3 GL-fallback checks; render-only → headless unchanged,
determinism intact). **Live on real WebGL2 (Claude_Preview):** `GLPost` active, **RGBA16F (float) bloom**, `failed:false`, no
console errors; image **upright** (flip-Y correct) + **correct colours** (no sRGB/premultiply issue); day portrait / whole-lake /
night all clean; **picking still works** through the GL canvas; **perf 1920×1080 whole-lake ~139 fps** (was ~56 with the Pass-2
canvas bloom — GL present() is GPU-pipelined, ~free on the CPU). 

**Known limits / next WebGL slices:** still a POST pass only — the fish/water/plants are still drawn in canvas-2D (so no instanced
GL sprites, no per-fish normal-mapped lit shading, no true 3D volumetric water yet). No real depth buffer → DOF is a faked
focus-falloff, not true bokeh. Tonemap runs in gamma space (RGBA8 scene texture), not a full linear-HDR pipeline. These are the
later Pass-3 slices.

**✅ Gate confirmed GREEN after Pass 3** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0, incl. byte-identical
determinism — render-only) + smoke **SMOKE OK** (38/0, +3 GL-fallback checks). **Backup:**
`G:\synapse-reef-backups\synapse-reef-graphics-pass3-webgl-20260617-193705.zip` (316,885 bytes). `src/glpost.js` is the only new
file; no stray files from the design workflow. Save still **v23** (no persistence change).

---

## ✅ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 2 (rich organisms, FX, water & post) (2026-06-17)
**Why:** the human's follow-up — "do all the graphics and animations and everything, make it look better." Pass 2 stays
**canvas-2D / render-only** (so the smoke gate stays meaningful and the sim stays runnable; WebGL is still the deferred Pass 3).

**What shipped (`render.js` draw path + `species.js drawFish`):**
- **Rich fish art (`drawFish` v2):** **translucent membraned fins** (`fillTri` `al<1`) with brighter **fin rays** (a new
  `putLine` texel-line helper); a faint diagonal **scale texture** on the flank; a breathing **gill/operculum seam** and a
  **mouth line**; eye + catch-light kept. Plus a **volumetric sheen** post-applied in `SpriteCache._build` — a dorsal-highlight→
  ventral-shade gradient composited `source-atop` (only over the body) so the flat texel fill reads as a lit, rounded 3-D body.
- **Particle FX & animation:** rising **bubbles** (`this.bubbles`, same stateless-clock animation as the motes); **soft contact
  shadows** on the bed under fish hovering near it (a radial-gradient ellipse — grounds bottom-dwellers); **strike/flee ripple
  rings** (edge-triggered transient `a._fxAt`/`a._burst`, like `a.vis` — a quick expanding ring on a lunge).
- **Water & post:** a **depth-haze** layer (vertical fog thickening toward the deep → atmospheric perspective) with a
  **spectral tint** (blue in clear water → green as turbidity/algae rise); a **cheap bloom** (downscale→additive-upscale glow,
  limited to the lit upper ~58% band to halve cost, auto-skipped on >3.8 M-px / 4K backings). Pass-1's godrays/caustics/marine
  snow/colour-grade/vignette all retained; marine snow trimmed + sub-pixel-culled for headroom.
- All cosmetic animation is the **non-seeded render clock / transient render fields — never `core.rand`**; no sim/determinism change.

**Verification:** gate GREEN — **headless 262/0 + smoke 35/0** (smoke exercises the new draw path; new ctx usage —
`source-atop`, `globalCompositeOperation`, 9-arg `drawImage`, `createRadialGradient`, `arc`/`ellipse` — is all either a plain
property assign or already in the DOM stub, so no stub change needed). **Human-eyeballed via Claude_Preview**: single-fish
portrait (fins/scales/sheen/gill/mouth), benthic close-up (contact shadows grounding catfish on the bed), whole-lake (haze +
glow), mid-zoom, and night (cool grade) — all confirmed.
**Render perf (measured in-browser):** windowed whole-lake ~167 fps, mid-zoom ~2400 fps. At **1920×1080 fullscreen** the
heaviest view (whole-lake, all agents+plants+particles+post) is ~**60–75 fps warm** — the one expensive pass is **bloom
(~5 ms full → ~2.5 ms region-limited)**; without bloom the same view is ~93 fps. *(In-browser micro-benchmarks are noisy
because the bench loop contends with the app's own RAF loop; only the bloom A/B delta is reliable.)* Bloom auto-disables on 4K+.

**Known limits / Pass-3 (WebGL) candidates:** whole-lake at ≥1080p fullscreen is near the 60 fps line with bloom on (fine, but
no huge margin); true HDR bloom/DOF/refraction, normal-mapped shading, and many-thousand-agent instancing all want a GL layer.
Per-species art is still the one generic `drawFish` (now much richer, but not hand-tuned per species). Strike ripples only show
during hunts.

**✅ Gate confirmed GREEN after Pass 2** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0, incl. byte-identical
determinism — render-only) + smoke **SMOKE OK** (35/0). **Backup:** `G:\synapse-reef-backups\synapse-reef-graphics-pass2-20260617-080556.zip` (308,782 bytes).

---

## ✅ GRAPHICS / VISUAL-FIDELITY OVERHAUL — Pass 1 (de-pixelation + atmosphere) (2026-06-17)
**Why:** the human's standing request — "make it less pixel like, more realistic and everything we can to make it better."
Pass 1 is **canvas-2D only** (no WebGL yet) so it stays low-risk, keeps the pure/browser split intact, and keeps `smoke.mjs`
meaningful. WebGL/shaders are the natural Pass 2 if we want to push further. **Render-layer only — zero sim/determinism change.**

**What shipped (all in `render.js`/`species.js` draw path + `styles.css`):**
- **De-pixelated organisms (the headline):**
  - `SpriteCache.BASE` **6 → 14** (sprite px per fish-unit) + `species.js drawFish` step `su` floor **0.13 → 0.07** → ~2× the
    internal sprite detail, with a **soft 2px texel "dab"** so the fill is solid, not stippled.
  - **`ctx.imageSmoothingEnabled = true`** (`'high'`) for the sprite blits (was `false`) — drawImage now interpolates the
    high-res sprites instead of nearest-neighbour blocking them up. (constructor + `resize` + both blit sites). On-screen size
    is unchanged — the blit math self-adjusts via `sprite.base`.
  - **Smooth gradient counter-shading** in `drawFish`: the body was 3 hard colour bands (back/body/belly) → now a continuous
    vertical lerp dark-back → mid → light-belly. The hard banding was most of the "blocky" read; colours are numeric `[r,g,b]`
    so we lerp them directly.
  - **Eye fix:** the eye radius had a flat `Math.max(0.7, …)` fish-unit floor → an **absurdly large dark eye** on slim fish
    (pike/bass), which the old pixelation hid but the smooth blit exposed. Now **proportional to body depth** (`Hh·0.22·eyeGene`)
    + a small **catch-light glint** → a live, rounded eye. `styles.css #tank{image-rendering:pixelated → auto}`.
  - LRU cap trimmed 3200 → **1200** (each BASE-14 sprite is ~4× the pixels; population clusters so few buckets are live).
- **Atmospheric water:** **soft additive godrays** (`'lighter'` blend, per-beam sway + brightness pulse, fade by Secchi depth),
  **surface caustics** (additive rippling radial dapples under the surface, fade with light/clarity), **suspended particulates
  ("marine snow")** — a `this.motes` field drifting through the water column (stateless function of the render clock, culled,
  bed-clipped, dimmer in the deep). All cosmetic, **non-seeded PRNG / real-time clock only — never `core.rand`**.
- **Smoother flora:** weed beds were fat solid bars (`lineWidth≈1.5·z`) → **many thin translucent blades** (capped width,
  per-blade hue/shade jitter) reading as a grass clump; **round `lineCap`/`lineJoin`** on all reeds/weed beds/macrophytes.
- **Cinematic post:** a faint **day/night + dawn/dusk colour grade** wash (warm at dawn/dusk, cool/blue at night) + a softer,
  **cool-tinted vignette**.

**Verification:** gate GREEN — **headless 262/0 + smoke 35/0** (smoke exercises the new draw path; no new ctx methods that the
DOM stub lacks — `globalCompositeOperation`/`imageSmoothingQuality` are plain property assigns, `arc`/`createRadialGradient`
already stubbed). **Human-eyeballed via Claude_Preview**: single-fish portrait (smooth body + glinting eye vs the blocky
baseline), populated mid-zoom, whole-lake overview, night, and a weed-bed close-up — all confirmed improved.
**Render perf (measured in-browser, 459 agents + 600 plants):** whole-lake worst case **3.54 ms/frame (~282 fps)**, mid-zoom
**0.61 ms (~1630 fps)**, sprite cache 362/1200 resident — the new effects cost almost nothing. No sim change → headless steps/s unchanged.

**Known limits / Pass-2 candidates:** at the very deepest zoom a big sprite still softens (BASE-14 source upscaled ~6×); true
crispness at any zoom wants WebGL/SDF or vector fish. Plankton/detritus left as 1px specks (perf; marine snow carries the
atmosphere). No bloom/DOF/refraction yet (needs a second pass / GL). Per-species art is still the one generic `drawFish`.

**✅ Gate confirmed GREEN after the change** (full `npm test`, exit 0): headless **ALL CHECKS PASSED** (262/0, incl.
byte-identical determinism — render-only change, sim untouched) + smoke **SMOKE OK** (35/0). **Backup:**
`G:\synapse-reef-backups\synapse-reef-graphics-pass1-20260617-073520.zip` (304,359 bytes).

---

## ✅ EVOLVABLE BRAIN SIZE — a heritable brain gene + per-neuron metabolic cost (2026-06-16)
**Why:** the cognition arc's finale ("all of them"). Full arbitrary-topology NEAT (variable-length genomes, structural
crossover) is a multi-session lift; this ships the **high-value SHRINK half** — let a lineage evolve a smaller, cheaper brain
where the full net isn't needed (the **encephalization trade-off**) — with **no genome surgery**.

**What shipped:**
- **A 7th heritable gene `brain`** (`core.js GENE_KEYS` → size/speed/tol/fin/eye/body/**brain**). The gene infra
  (`randomGenes`/`crossover`/`mutate`/`fitGenes`) is length-agnostic, so it auto-extends; an older 6-gene save pads the brain
  gene to ~1.0 (≈ full brain) on load.
- **`makeAgent`:** `a.activeHid = clamp(round(shape.hid·gBrain), min(BRAIN.HID_MIN, hid), hid)` — how many hidden units are
  active. **`core.js forward(…, activeHid)`** MASKS units with index ≥ activeHid: they're inert (act.h=0, skip the leaky
  integrator → no memory) and contribute 0 to the outputs. The genome stays **full-size** (the W1/B1/W2/B2/LEAK offsets are
  unchanged — masking just zeros the surplus), so there's NO variable-length genome and standard crossover/mutate still apply.
- **Per-neuron metabolic SAVING** (`config.js BRAIN {HID_MIN 4, COST 0.22}`): `metabMul ×= (1 − COST·(hid−activeHid)/hid)` —
  a smaller brain is cheaper. At gBrain≈1 → activeHid=hid → saving 0 → metabMul = the pre-slice baseline (a **fresh lake =
  baseline**, headless-asserted exact). So selection sheds neurons in simple niches and keeps them where cognition pays.
- Composes with **lifetime learning**: `forward(a.lw, …, a.activeHid)` runs the plastic policy with the masked layer.
  Save **v23**; `speciesDetail` exposes `gBrain` + `meanActiveHid`; the dashboard **Evolution** table shows the brain gene (`brn`).

**Verification:** gate GREEN — **headless 262/0** (+5 probes: GENE_KEYS has `brain`; gene→active-units full/floored/capped;
`forward` masks units ≥ activeHid inert & computes differently; a smaller brain is metabolically cheaper; genes≡1.0 ⇒ EXACT
baseline incl. full brain & metabMul=1), **smoke 35/0**, **byte-identical determinism**, perf 132 steps/s. Fixed 2 probes the
RNG shift perturbed: the exact metabMul-formula check (added the brain factor) and an isolated-pike hunger-accrual test (a lone
pike was grazing a respawned bed crayfish; disabled its diet for the accrual half). 3-yr balance: **✓ no extinction**, and the
**`brain` gene is under selection** (drifted +0.047 — comparable to the other genes' movement) — it drifted UP (toward keeping
the full brain) while the body genes shed (size −0.08/fin −0.08/body −0.07), i.e. in this balanced lake the hidden units EARN
their metabolic cost (cognition pays off) even as bodies get thriftier. The shrink mechanism works (probe-verified); a harsher
niche or a higher `BRAIN.COST` would surface actual shrinkage. **Adversarial
review (read-only, 3 lenses → synthesis): verdict SHIP, 0 findings** — masking offsets correct (full `shape.hid` strides;
masked units hold no stale memory; back-compat exact), gBrain=1 → metabMul EXACTLY baseline + the saving bounded [0.78,1]
(never 0/negative), `fitGenes` pads 6→7 to ~1.0 (no NaN/0), v23 round-trips, no RNG leak. *(Caveat it raised: whether brain
size meaningfully EVOLVES under the 22%-max pressure is a balance/visual question — answered by the gBrain drift above.)*
**Backup:** `G:\synapse-reef-backups\synapse-reef-evolvable-brain-size-20260616-214007.zip`.

**Deferred (the hard half of NEAT):** GROWING the layer beyond the species max + **adding/pruning connections** (true variable-
topology with innovation numbers + structural crossover) — needs variable-length genomes; high blast radius, sequenced late.

---

## ✅ LIFETIME LEARNING — Baldwinian reward-modulated Hebbian plasticity (2026-06-16)
**Why:** the cognition arc ("all of them"). Until now a fish's brain was FIXED for life (only the lineage evolved). This adds
**within-life plasticity** — a fish ADAPTS during its own life — done the biologically-correct **Baldwinian** way (learning is
NOT inherited; it guides evolution via the Baldwin effect, not Lamarck).

**What shipped:**
- **Two weight sets per fish:** `a.g` = the inherited **GENOTYPE** (fixed in-life, used by ALL reproduction/serialization);
  `a.lw` = a **PLASTIC** working copy that `forward()` actually runs (`makeAgent` seeds `a.lw = copy(a.g)`).
- **The rule** (`core.js reinforce`, `config.js LEARN {RATE 0.03, DECAY 0.5, CLAMP 4}`): a **3-factor reward-modulated Hebbian**
  update on ONLY the **W2 (hidden→output) policy** block of `a.lw` — when the fish EATS (reward=1) it reinforces the action
  just taken (`RATE·reward·h[j]·post_k`); every step a **homeostatic decay** pulls `a.lw` back toward `a.g` (so unreinforced
  changes fade → transient, bounded adaptation) + a hard clip. So a fish gets better within its life at repeating what fed it.
- **BALDWINIAN:** `reinforce` reads `a.g` only as the decay target and **never writes it**; every breeding path
  (sexual `crossover(a.g,b.g)`, asexual `mutate(a.g)`, immigration `mutate(src.g)`, champions, `toJSON.w`) uses the GENOTYPE —
  verified across all sites. Offspring inherit the evolved brain, not the parent's learned weights.
- Pure & **DETERMINISTIC** (no RNG in `reinforce`). `a.lw` is **transient** (not serialized; `load` re-derives it from the
  genotype) → **NO save-format change, stays v22**. `inspector.js` shows the live plastic brain (`a.lw`).

**Verification:** gate GREEN — **headless 258/0** (+5 probes: every fish has a distinct plastic `lw`=copy of `g`; reinforce
Hebbian-strengthens the rewarded action, leaves W1 alone, and never writes `g`; homeostatic decay pulls `lw`→`g` unreinforced;
learning fires live (lw≠g); plastic weights stay bounded), **smoke 34/0**, **byte-identical determinism**, perf 135 steps/s.
Fixed 3 locomotion probes (swimTest/burst-coast/etc.) that forced a brain via `f.g` — they now sync `f.lw` (and freeze
`LEARN.RATE`) since `forward` runs the plastic copy. 3-yr balance: **✓ no extinction** (minnow mean 88; bass the pre-existing
apex), genes still evolving. **Adversarial review (read-only, 3 lenses →
synthesis): verdict SHIP, 0 findings** — Baldwinian separation holds (learning writes only `a.lw`; `a.g` never assigned outside
construction), no Lamarckian leak (every breeding/save path uses the genotype, line-verified), deterministic (no RNG, W2 offset
exact, no off-by-one), bounded & energy-neutral. Its one robustness suggestion (assert the learning wiring in smoke) was applied.
**Backup:** `G:\synapse-reef-backups\synapse-reef-lifetime-learning-20260616-210454.zip`.

**Deferred:** an eligibility trace (multi-step credit assignment); a **heritable plasticity rate** (a per-fish gene so selection
tunes how plastic each lineage is — the pace-of-life axis); explicit place memory. *(Cognition arc last: evolvable brain size.)*

---

## ✅ RICHER PERCEPTION v1 — lateral-line flow + prey-size selectivity (2026-06-16)
**Why:** the cognition arc ("all of them"). Fish perceived prey/threats only by relative bearing (vision). Added 2 senses that
add real modalities — a **mechanosensory** one (works when vision fails) and **prey-size discrimination** (predator selectivity).

**What shipped (+2 brain inputs on every species, `species.js PERCEPTION_INPUTS`, between the spatial block & the drives):**
- **`flow` — a lateral-line / rheotaxis sense:** `clamp(env.currentAt(x,y)/12, −1, 1)`, the signed local current. It is
  **MECHANOSENSORY → deliberately NOT clarity/turbidity-scaled** (unlike every vision-based sense), so it's the **murky-water
  sensory fallback** — a fish can still orient to flow when turbidity blinds it. (Headless-proven: identical in a 0.95 vs 0.05
  turbidity world.)
- **`prey size` — predator size-selectivity:** for piscivores (`diet.fish`) it reads `clamp(effSize(nearest catchable prey) /
  effSize(self), 0, 1)` via `qPrey` (0 for non-piscivores / no prey) → the brain can evolve to strike only well-sized prey,
  coupling perception to the gape/`canEat` system.
- Pure functions of seeded sim state → **determinism byte-identical**. +2 inputs grow `genomeLen`; migration-preserved (the 2
  new sensor columns zeroed → evolved brains survive). **Save v22.** Inspector auto-renders the new inputs.

**Verification:** gate GREEN — **headless 253/0** (+4 probes: labels/position; flow non-zero in a current AND turbidity-proof;
prey-size >0 for a piscivore beside catchable prey & 0 for the non-piscivore; +2 migration preserves weights/zeros columns),
**smoke 34/0**, **byte-identical determinism**, perf 131 steps/s. Also made the spatial & perception input-layout probes
**robust to future input adds** (label-positioned, not asserting the running total — the spatial probe's `===base+5` had broken
when perception pushed it to base+7). 3-yr balance: **✓ no extinction** (minnow mean 86/maxGen 49; bass the pre-existing apex).
**Adversarial review: verdict SHIP, 0 defects** — clean on
determinism, offset non-overlap, migration (rigorously proved NO false length-collision for any species HID), the benign
double-`qPrey` (sense read vs the separate eat), and flow/prey-size semantics + range.
**Backup:** `G:\synapse-reef-backups\synapse-reef-richer-perception-20260616-202719.zip`.

**Deferred (v2):** an angular "retina" (direction bins replacing the single nearest-target sin/cos); conspecific/kin
discrimination; a diffusing **chemoreception/odor** field (its own slice). *(Cognition arc next: lifetime learning, then evolvable brain size.)*

---

## ✅ SPATIAL COGNITION — an allocentric sense of place & direction (2026-06-16)
**Why:** the human flagged it ("any sense of direction that fish actually have, or sense of their location") and chose it from
the cognition menu. Fish had only EGOCENTRIC cues (relative bearing to food/threat, depth, walls) — no compass, no absolute
location, no homing reference. The fix follows the project ethos (**emergence over scripting**): give the brain the allocentric
SENSES on top of the recurrent memory we already have, and let navigation EVOLVE — don't script homing.

**What shipped (3 new brain inputs on EVERY species + a natal anchor):**
- `species.js` **`SPATIAL_INPUTS = [compass∠sin, compass∠cos, home∠x]`** appended before the 2 `DRIVE_INPUTS`; `SP.baseInputs`
  records the species-specific count so the move step addresses the spatial block at [base..base+2] and drives stay at [in-2,in-1].
- **COMPASS** = `sin/cos(heading)` — the fish's absolute body orientation (a unit vector; the egocentric senses can't provide it).
- **HOME bearing** = `clamp((homeX − x)/W, −1, 1)` — signed horizontal displacement to the fish's **natal site** `homeX`, recorded
  at birth in `makeAgent` (so on EVERY spawn path — initial seed, sexual offspring [midpoint of parents], asexual bud, immigration
  [entry edge], addAgent — the fish homes to where it was BORN). Serialized as `hx`; `load` restores it (older saves → current x).
- Pure functions of sim state (no RNG) → **determinism byte-identical**. The +3 inputs grow `genomeLen`; `fitGenome`'s
  input-migration bound widened (`din<=4`→`8`) so a v20 brain is **migrated** (weights kept, the 3 new sensor columns zeroed →
  load with no effect, then evolve in), not reseeded. **Save v21.** The inspector auto-renders the new inputs (generic from inputLabels).
- This is the **SUBSTRATE for evolved navigation** — refuge homing, home-range/site fidelity, spawning migration — emergent,
  not implemented; the recurrent brain (the leaky-integrator memory) is what lets a lineage learn to use these cues. *(Honest
  framing: we ship the senses + anchor, not a homing behavior; selection wires it where it pays, like DVM/drives.)*

**Verification:** gate GREEN — **headless 249/0** (+6 probes: the 3 spatial inputs labelled & length-matched before the drives;
homeX recorded at birth; the compass is a unit heading vector sin²+cos²≈1; home∠x sign tracks homeX−x; migrateGenomeInputs lifts
a pre-spatial +3 brain preserving weights & zeroing the new columns; homeX round-trips save/load v21), **smoke 34/0**,
**byte-identical determinism** (3634751 chars). Fixed one pre-existing probe (insect-development) that the RNG-stream shift made
fragile (the test larva was being eaten before it could develop → cleared the test world's fish to isolate development from
predation). **3-yr balance: ✓ no extinction**, baseline-consistent (minnow mean 86 / maxGen 56; bass 91%-immigrant maxGen 0 =
the pre-existing apex limitation, unchanged by this slice). **Adversarial multi-agent review (4 parallel lenses → synthesis):
verdict SHIP, 0 findings** — independently confirmed determinism (pure functions of seeded state), non-destructive v20→21 brain
migration across all 6 species (weights kept, only the 3 new columns zeroed, no false length-collisions), homeX set on every
spawn path + `hx` round-trip, and bounded/energy-neutral senses with NO scripted homing.
**Backup:** `G:\synapse-reef-backups\synapse-reef-spatial-cognition-20260616-195415.zip`.

**Deferred:** an absolute basin-x / distance-to-shore-or-inflow position sense; a sun/magnetic compass; a place-memory readout;
coupling to the Phase-4 nest-building & spawning-migration items. *(Cosmetic nit noted, not fixed: the brain-inspector footer
still prints "→2" outputs instead of →5 — a stale literal predating this slice.)*

---

## ✅ DASHBOARD OVERHAUL — SLICE A: "make the hidden sim legible" (2026-06-16)
**Why:** the human flagged the info/charts panel as crowded, incomplete & under-organized — "doesn't have everything, lay it
out better, show more detail, more features." Many subsystems the sim computes had NO readout. Slice A surfaces them and
regroups the rail. *(Chosen first because it's the human's own priority, a payoff slice for all the hidden depth we've built,
and zero-balance-risk — pure read-only accessors + browser-only UI.)*

**What shipped:**
- **3 new pure accessors** (`world.js`, headless-tested) — the data layer the DOM only renders:
  - `resourceCounts()` → live counts of the non-fish biota: zooplankton/larvae/insects/snails/crayfish/mussels/detritus/plants.
  - `cognitionDetail()` → fleet aggregates: meanHunger, meanFear, the brain-gated action mix (pStrike/pFlee/pHide = fraction
    above `ACTION.GATE`), meanMemory (mean leak-gate = recurrence strength, read from the genome's LEAK tail), meanTox.
  - `speciesDetail()` **extended** with the 3 morphology genes (gFin/gEye/gBody → now all 6) + `immFrac` (cumulative
    immigrant-dependence = immigrants/(births+immigrants)).
- **Reorganized rail** (`index.html` + `styles.css` + `ui.js`): the old "Census" + "Brain" cards became —
  - **Food-web card:** census + a **resource-count strip** + **fish trophic-biomass bars** (planktivore→apex, comparable
    summed-body-size units; producers/inverts live in the count strip since their units aren't commensurable with fish biomass).
  - **Evolution card:** a compact per-species **6-gene mean table** (siz/spd/tol/fin/eye/bod) with drift highlighting
    (green >1.04 / rose <0.96) + max generation + immigrant %.
  - **Cognition card:** the existing brain inspector + a fleet **drive/action/memory aggregate** grid (contaminant row
    appears only when a pollution scenario sets `TOX.AMBIENT>0`).
  - Environment / Water-column / History / Controls unchanged.
- UI built with a **build-once-store-refs** pattern (no per-frame DOM churn beyond text), updated at the existing ~8 Hz.

**Verification:** gate GREEN — **headless 243/0** (+4 accessor probes: 6-genes+immFrac, resourceCounts, cognitionDetail
ranges, clean-lake meanTox=0), **smoke 34/0** (the new cards construct + populate via `ui.frame` without throwing),
**byte-identical determinism** (3320001 chars — confirming NO sim change). **Live-verified in the preview** (reloaded):
all four cards populate (resource strip, trophic bars, gene table, cognition grid), no console errors. *(No adversarial-agent
review this slice — it's browser-only + read-only accessors with no determinism/balance surface; the risk is fully covered by
the headless accessor probes + smoke + the visual check.)*
**Backup:** `G:\synapse-reef-backups\synapse-reef-dashboard-sliceA-20260616-165608.zip`.

**Deferred (Slices B/C):** selectable multi-panel History chart (toggle metric groups) + a food-web flux diagram (Slice B);
event/feed log, **CSV/JSON time-series export** (also the scenario-engine readout), any-entity (plant/insect/larva) click
inspector, a fuller-screen "data mode" (Slice C). See the ROADMAP dashboard item.

---

## ✅ GROW THE LAKE #2 — BENTHIC INVERTEBRATES (grazing snails + omnivorous crayfish) — save v20 (2026-06-16)
**Why:** the user's "grow the lake" batch was "the insects and hatch and crayfish snails". Insects shipped first (#1); this
adds the **benthic invertebrate consumer guild** — the most abundant real-lake animals — and two new food-web links.

**What shipped (particle populations, like the insects/mussels — NOT NN agents):**
- **Snails** (`world.snails`, `config.js SNAIL`): gastropod GRAZERS. Crawl the lit bed (seeded via `plantX()` → littoral-biased),
  scrape periphyton — modelled as a **gentle local draw on the phytoplankton field near the bed** (`GRAZE 0.0012`; we don't track
  periphyton separately). Recruitment ∝ the algae base (logistic toward `CAP` + a tiny refuge `FLOOR`), so they bloom after an
  algal bloom; they **starve** where local phyto is depleted (overgrazing self-limits) + a background senescence.
- **Crayfish** (`world.cray`, `config.js CRAYFISH`): benthic OMNIVORE/scavenger + keystone forage. Walk the bed steering toward
  the **nearest cover** (`COVER_PULL`) and are **crepuscular** (`NIGHT` activity ×1.7 at night via `env.light`). Recruit ∝ the
  detritus rain (like the insect larvae). **Prey on snails** (`_takeNearest(snailGrid, EAT_R)`, hunt-rate × night).
- **Two new web links:** phyto→snail→{sunfish,carp,crayfish} and detritus→crayfish→{bass,pike,catfish}. Diet flags added in
  `species.js`: sunfish/carp gained `snail`; bass/pike/catfish gained `cray`. **Eaten OPPORTUNISTICALLY on the bed** (same
  `_takeNearest` path as larvae/insects) — **no new brain input** (so no genome migration this slice).
- **Rendered** (`render.js`, guarded like larvae/insects): snails = olive-tan domes; crayfish = rusty body + claws + wiggling legs
  + tail (far LOD = a rust blob). Depth-dimmed, culled to the visible x-range.
- **Persistence:** save **v20** — `toJSON` serializes `snails`/`cray` ({x,vx}); `load` restores (y from `bedY`), older saves
  default both to `[]`. `biomassByTrophic` gained `snail`/`crayfish` rollups (for the coming dashboard).
- **Step order:** snail step → build `snailGrid` → crayfish step (uses `snailGrid` to prey) → build `crayGrid`; both grids are
  then read by the per-agent feed step. Grids built once after each population moves (they don't move again that step), so
  `_takeNearest`'s `!it.dead` predicate handles the cray-eats-snail then fish-eats-snail ordering without double-counting.

**Verification:** gate GREEN — **headless 239/0** (+6 new benthic probes: seeding+diet-flags, snails-graze-phyto vs control,
cray-prey-on-snail, fish-eat-snail/cray, pop-bounded-&-persists, save/load v20), **smoke 34/0** (render draws without throwing),
**byte-identical determinism preserved** (all new randomness uses seeded `rand`/`poissonish`). 3-yr balance: **✓ no extinction**;
4/6 species home-breeding (minnow mean 49 [2-205] maxGen 33, sunfish 13, catfish 10 @26%imm, carp 9 @33%imm); **bass (92%imm,
maxGen 0) + pike (69%imm) remain the pre-existing immigration-dependent apex** — the crayfish forage did NOT rescue them because
they're mid-water and crayfish are on the bed, so only bottom-foraging catfish reliably reach crayfish.
**Adversarial review (independent agent): verdict SHIP** — 0 Critical/Moderate defects (determinism, pure-core boundary, save/load
incl. the `s`-shadow trap + older-save back-compat, loop termination, grid freshness, render all confirmed clean). Its 2 Minor
notes were applied: a comment documenting crayfish having no starvation path (recruitment is the sole density regulator), and the
headless pop test tightened from a trivial `≤cap` to a plausible-band assertion. **Visual:** confirmed live (preview) — snails =
olive bed-domes, crayfish = rusty body+claws+legs on the bed; no render errors. **Backup:**
`G:\synapse-reef-backups\synapse-reef-benthic-inverts-20260616-162720.zip`.

**Honest trade-offs / deferred:** (1) snail grazing of the *phytoplankton* field (periphyton proxy) slightly competes with
zooplankton → modestly thins the pure-planktivore base; tolerable (minnow mean unchanged) but if the lake should read fuller,
dial `SNAIL.GRAZE`/`CAP` down. (2) To make crayfish a real forage for bass/pike they need a **dedicated benthic-prey SENSE**
(deferred — flagged in ROADMAP). (3) Crayfish as a full **NN agent** + eating **carrion (corpses)** + a real **periphyton field**
for snails to graze — all deferred. (4) Test wall-clock grew (snails/cray add per-step cost across the test's ~30k aggregate
sim-steps); live per-step perf is still fine (127 steps/s ≫ 60 budget).

---

## 🌙 OVERNIGHT WORK LOG — 2026-06-15 → 06-16 (autonomous, while you slept)
Continued from the plant arc. **Seven slices shipped this session**, each built → gate-green → balance (no-extinction) →
adversarially reviewed (Workflow, findings fixed) → documented → G-drive backup. Newest first; full write-ups below.
1. **Plant evolution** — heritable 6-gene macrophyte genome (functional + drawn). *(save v13)*
2. **Plant shading competition** — taller plants shade shorter → stratified canopy + self-thinning (clear↔turbid feedback DEFERRED to Phase-5, honestly).
3. **Fish morphological evolution** — 6-gene genome incl. **fin/eye/body**, functional AND drawn (sprite-cached). *(v14)*
4. **Fish COGNITION — recurrent MEMORY** — the brain gained a leaky-integrator hidden state (history-dependent behaviour); memory emerges under selection. *(v15)*
5. **School dilution / predator-confusion** — a dense shoal shrinks a predator's strike reach → schooling is now ADAPTIVE.
6. **Cyanotoxins / HAB toxicity** — a dense cyano scum poisons fish + zooplankton (a bloom kills by poison, not just the O₂ crash).
7. **Contaminant bioaccumulation / BIOMAGNIFICATION** — the research-tool FLAGSHIP: a toxicant concentrates up the food chain (apex carry ~2.3×), + sub-lethal fecundity loss + harm-mortality. Inert by default (a scenario lever). *(v16)*

**State for you to wake to:** gate GREEN (perf ✓, byte-identical determinism ✓, SMOKE OK; ~230+ checks), no extinction
in any balance run, **save now `version: 16`**, 8 fresh backups on `G:\synapse-reef-backups\`. The two big arcs you
asked for — **plants that evolve & interact**, and **fish that evolve in body AND brain** — are now real, plus a
research-grade **pollution/HAB/contaminant** cluster. **Next candidates** (all balance-sensitive, left for you to steer):
inbreeding depression / genetic rescue, density-dependent stunting, senescence, the **scenario engine** (the research
north-star capstone — ties TOX.AMBIENT / nutrient loading / climate warming into data-driven perturbation experiments).
**Note:** a stray locked `test_output.txt` at the project root (not mine, 0 procs hold it) is excluded from backups —
delete it whenever.

---

## ✅ GROW THE LAKE #1 — AQUATIC INSECTS (benthic larvae ↔ emergent surface hatch) — save v19 (2026-06-16)
**Why:** the user chose to "grow the lake" (new organisms / trophic levels) before more cognition, starting with aquatic
insects + the hatch (then crayfish/snails next). This fills the **missing benthic invertebrate level** and adds the first
**cross-boundary flux** (bed → surface).

**What shipped** (`config.js INSECT`; two particle systems mirroring plankton/detritus, in `world.js`):
  - **Benthic LARVAE** (`world.larvae`): detritivores recruited ∝ the detritus pool (detritus → insect biomass), living on
    the bed, **developing with warmth** (`dev += DEV_RATE · tempFactor · dt`), eaten by bottom fish.
  - **EMERGENCE / hatch**: a mature larva (`dev≥1`) in warm water (`tempC > HATCH_TEMP`) **rises to the surface** as an adult
    insect — the benthic→surface flux. Builds into a real **seasonal swarm** (≈570 surface adults at a warm peak in testing).
  - **Surface ADULTS** (`world.insects`): drift on wind/current, short-lived (`ADULT_LIFE`), eaten by surface fish; an
    uneaten adult **lays an egg → a new larva** (closing the cycle).
  - **Fish feeding & sensing:** diet flags — bottom fish (catfish/carp/sunfish) eat **larvae**, surface fish
    (minnow/sunfish/bass) eat **adults**. Minnow & sunfish food sense now uses **`qSurfaceFood`** (nearest zooplankton OR
    insect) so they **rise toward a hatch** (no genome change — same input, richer source). Render: bed specks (brighten as
    they mature) + fluttering pale surface specks (a visible hatch).

**Verification:** gate GREEN — byte-identical determinism, SMOKE OK, **+6 insect probes** (benthic seeding & diet flags;
emergence warm-gated [hatches warm, holds cold]; larvae develop with warmth; bottom fish eat larvae + surface fish eat
adults; `qSurfaceFood` routes insects; v19 round-trip). Live preview: larvae develop & emerge (0 NaN, all benthic), a
570-insect swarm at a warm peak. **3-yr balance: no extinction, NO boom** (range 35–451) — and the new food made
**catfish *less* immigration-dependent** (27% vs ~37% before): the benthic level helps bottom fish self-sustain. Perf
228→150 steps/s across the recent subsystems (still 2.5× the >60 budget). Save **version 18 → 19**.

**Refinements noted (not blocking):** the "rise to a hatch" is limited to fish already near the surface (insects sit at
y≈2–14; a deeper minnow can't sense them) — a stronger pull (insects sensed from deeper, or an innate surface-rise) is a
follow-up; and a sharper *synchronized dusk pulse* (vs the current continuous emergence) could be added. **Next: crayfish/snails.**

---

## ✅ INTERNAL DRIVES (hunger / fear) — motivated, state-dependent behaviour — save v18 (2026-06-16)
**Why:** finish the cognition arc (memory → action space → **motivation**). The brain decided strike/flee/hide purely
off external senses; now it perceives its own internal state, so identical surroundings produce different behaviour
depending on the fish's needs.

**What shipped:** two persistent per-fish **drive scalars** fed back as the **last two brain inputs** (`config.js DRIVE`):
  - **HUNGER** — an appetite drive: accrues with time since a meal (`+HUNGER_GAIN·dt`), **sated by eating** (`−SATE` per
    meal, in the feed step) → distinct from the instantaneous energy LEVEL the brain already senses. A predator between
    big meals climbs hungry; a constantly-grazing planktivore stays low.
  - **FEAR** — jumps to the nearest-threat proximity and **decays after the threat leaves** (`max(threatNear, fear·e^(−FEAR_DECAY·dt))`)
    → a recently-chased fish stays cautious. (Computed from a `qThreat` query in the move step.)
  - They are PERCEPTION, not scripted behaviour — the NN wires them to its gated actions via evolution (a hungry fish
    learns to gamble on a strike; a fearful one to hide/flee). `inspector.js` shows them automatically (it renders inputs
    from `inputLabels`) — you can watch a fish's hunger climb then drop when it eats, and fear spike when a pike nears.

**Plumbing:** `species.js` post-SP loop appends `['hunger','fear']` to every species (`shape.in += 2`, generic so each
`senses()` keeps writing its own 0..N-1 and the drives occupy the last two slots). Adding inputs grows `genomeLen` → a new
**`core.js migrateGenomeInputs`** preserves evolved brains (copies W1 row-by-row at the new stride, **zeros the new sensor
columns**, copies B1/W2/B2/LEAK verbatim) so the drives load with no effect and then evolve in; `world.js fitGenome`
dispatches to it by length. Drives serialized (`hg`/`fe`), **save version 17 → 18** (old saves default drives to 0).

**Verification:** gate GREEN — headless **byte-identical determinism**, SMOKE OK, +5 drive probes (hunger rises & sates;
fear spikes & decays; drives plumbed to the right inputs, finite, labelled; `migrateGenomeInputs` preserves a pre-drive
brain weights-kept/new-cols-zeroed). Live preview (431 fish): input count 18, last labels `['hunger','fear']`, 0 NaN,
~⅓ of fish "scared" near predators (fear up to 0.96), hunger low (fish eat). **3-yr balance: no extinction**, predators
breed home, evolution active. **Perf 228 → 158 steps/s** (the per-fish `qThreat` for fear; still 2.6× the >60 real-time
budget) — a cheap future optimization is to reuse the threat query `senses()` already does.

**Note:** the input-count change shifts the seeded-RNG stream (fresh genomes draw more values), which exposed three
RNG-fragile *test* setups (momentum/ambush probes that relied on a lucky random brain) — fixed by isolating their
mechanism (forced brains + temporarily disabling the innate ethogram), not by touching the sim.

**Cognition arc COMPLETE:** recurrent **memory** → gated **action space** (strike/flee/hide) → **internal drives**
(hunger/fear). *(Future §A: reproductive drive; richer perception; spatial cognition / place memory; NEAT topology.)*

---

## ✅ BURST-AND-COAST gait — trajectory-realism set COMPLETE (2026-06-16)
**Why:** the last of the three trajectory pieces the user asked for ("finish it"). Real fish pulse the tail then GLIDE
rather than holding steady thrust; the sim held a smoothed-constant thrust.

**What shipped (`world.js` move step + `config.js MOTION`):** the delivered thrust is now modulated by a per-fish
**stroke oscillation** — a **ZERO-MEAN cosine** (`thrust *= 1 + coastAmp·cos(2π·stroke)`) so the cycle-average ≈ the
brain's intent → **balance-neutral** (the surge and glide cancel; no slower/faster on average). `a.stroke` advances by
`dt` at `MOTION.COAST_RATE` (1.1 cyc/s, faster with speed), per-fish phase offset (`id·0.1366`, no RNG) so a shoal isn't
synced. **Gated to cruising:** `coastAmp = COAST_DEPTH·(1−max(flee,strike))·clamp(3·thrust)` → **suppressed during a
flee/strike sprint** (those swim flat-out) and when barely swimming. The momentum model carries the fish through each
glide, and the effort-coupled undulation makes the body **thrash on the power-stroke, straighten on the glide** for free.
`a.stroke` is transient (lazy-init, not serialized) → no save-format change.

**Verification:** gate GREEN — headless **222 checks 0 fail, byte-identical determinism**, SMOKE OK. New probes: a
cruising fish's speed PULSES vs steady thrust (CV 0.123 > 0.078) and is **balance-neutral** (cycle-mean 14.6 ≈ 14.4
steady). **3-yr balance: no extinction, EVERY species evolving** (maxGen>0 for all — healthier than the prior baseline).
Live (117 fish): stroke phase well-distributed (desynced), 0 NaN, 0 escaped. Focused adversarial review: **0 defects**.

**Trajectory-realism set is now COMPLETE** — momentum/carving + turn-speed-loss + burst-and-coast all shipped. Combined
with the effort-coupled body undulation, swimming now reads as: carve through turns, scrub speed banking, surge-and-glide
cruise, thrash when fleeing, freeze when hiding.

---

## ✅ LOCOMOTION MOMENTUM — carving turns + turn-speed-loss (realistic trajectory) (2026-06-16)
**Why:** the user asked to "do the trajectory" (after the effort-coupled body look). The path model pivoted on a dime
with no inertia — fish snapped to a new heading and instantly moved that way.

**What shipped (sim-side, `world.js` move step + `config.js MOTION`):** each fish now carries a persistent **`velHeading`**
(actual TRAVEL direction) distinct from **`heading`** (body facing, which the NN steers). Two coupled effects:
  - **Momentum / carving** — `velHeading` eases toward `heading` at `MOTION.TURN_RESPONSE`, **slowed at speed** (`SPEED_LAG`)
    so a fast fish carries momentum and **drifts wider through a turn** instead of pivoting. Position now integrates along
    `velHeading`; the body still points along `heading` (render), so a fast-turning fish visibly **crabs/banks** through the arc.
  - **Turn-induced speed loss** — `a.spd *= max(0.55, 1 − MOTION.TURN_DRAG·|Δheading|)`: a hard turn **scrubs forward speed**
    (you can't bank sharply at full tilt). `TURN_DRAG` tuned to **0.14** (≈10–11% loss in a hard sustained turn) — gentle
    enough that chasing predators aren't crippled.
  - Side-wall reflection now flips **both** `heading` and `velHeading`; the "into-wall" test uses the real travel direction.
  - `velHeading` is transient (lazily initialised to `heading` on a fish's first move; not serialized) → no save-format
    change, deterministic (no RNG in the move step).

**Verification:** gate GREEN — headless **220 checks 0 fail, byte-identical determinism**, SMOKE OK. New momentum probes:
velHeading is a finite per-fish travel field; a hard turner CARVES (travel lag 0.277 ≫ 0.029 straight); a hard turn
SCRUBS speed (turner 37.1 < straight 41.6). Live preview (362 fish): ~22% drifting mid-turn, mean lag ~5° / max ~27°,
**0 escaped the basin**. **3-yr balance: no extinction**, predators still breed in-lake (bass 428 / pike 1127 home-bred)
— predation healthy, same baseline as before.

**Balance note / test-robustness fix:** the momentum change perturbs trajectories, which exposed that the old
**biomagnification END-TO-END probe** (free-run guild-mean piscivore vs planktivore over one 4000-step seed) was
**chaotically seed-fragile** — it swung wildly (and even inverted) with tiny dynamics changes, NOT a real predation
regression (balance confirms predators hunt & breed; the biomag MECHANISM step-probe still passes). Replaced it with a
**controlled** end-to-end probe: a dense patch of contaminated prey + predators on top, AMBIENT=0 so predation is the
ONLY tox source → predators robustly accumulate (max predator tox **2.84** from prey@2.0, 6/6 ate). Emergent whole-lake
biomag is covered by the balance run.

**Trajectory realism remaining (offered next):** **burst-and-coast** (intermittent pulse-then-glide gait) — the last of
the three trajectory pieces; needs its own balance pass (it changes the speed/energy profile).

---

## ✅ EFFORT-COUPLED SWIMMING (realistic locomotion look) (2026-06-16)
**Why:** the user asked to "make sure their movement is realistic too" (after the action space). The glaring gap: the
body-undulation **`drive` was hardcoded to 0.45** in the sprite cache (`species.js drawFish` reads `o.drive`), so every
fish wiggled identically — a *frozen/hiding* fish thrashed as hard as a *sprinting* one, and effort/speed never showed.

**What shipped (render-only — sim positions & determinism untouched):** the body undulation **amplitude** and the
tail-beat **frequency** now scale with a per-fish **effort `drive`** computed in `render.js _fish()` from its real
thrust + speed, **boosted by an active flee/strike burst and suppressed by a HIDE freeze**:
`drive = clamp(0.45·thrustSmooth + 0.55·(spd/maxSpeed) + 0.45·flee + 0.3·strike − 0.85·hide, 0.05, 1)`. It feeds the beat
rate directly (`cphase = t·(0.8 + 2.6·drive)`) and a new **3-level effort bucket** (`SpriteCache.DRIVES` glide/cruise/
sprint → `_driveVal` 0.12/0.5/0.9) added to the sprite-cache key, so the cached sprite's undulation amplitude matches
effort. Corpses pass drive≈0.1 (a dead fish barely undulates). LRU cap 2500→3200 for the extra dimension.
**Result:** a gliding/hiding fish is **near-still**; a fleeing sprinter **thrashes hard & ~3× faster** — and the new
action space is now visible in the body, not just the trajectory.

**Verification:** gate GREEN (250 checks, byte-identical determinism UNCHANGED — render isn't in that path — SMOKE OK,
+1 effort-coupling smoke check: `_driveVal` glide<cruise<sprint, builds at every bucket). Live preview (147 fish): drive
spans 0.05–1.0, dist 37 glide / 99 cruise / 11 sprint; the top hider (hide 0.89) → drive 0.05 (still), the top fleer
(flee 0.83) → drive 0.82 (thrash). No console errors.

**Still scripted/automatic (offered as the next slice — sim-side, balance-sensitive):** the actual TRAJECTORY model is
already decent (smoothed turn/thrust, turn-authority falls with speed = banking, drag inertia, edge-glide, action
bursts), but lacks **burst-and-coast** (intermittent gait), **turn-induced speed loss**, and **lateral momentum**
(carving turns). Those touch the move-step integration → would need a balance pass.

---

## ✅ BRAIN ACTION SPACE (strike/flee/hide) + LONGER LIFESPANS (2026-06-16) — save v17
**Why:** the user asked to (1) expand the fish action space so a brain visibly DECIDES more than steer+thrust, and
(2) "revisit the lifespan to make it a bit longer."

**(A) Brain action space — the net now GATES three actions beyond turn/thrust.** The per-fish MLP output count `OUT`
went **2 → 5** (`core.js`): turn, thrust, **strike**, **flee**, **hide**. `forward()` writes each new action as a 0..1
sigmoid (`act.strike/flee/hide`); they're **continuous "intents", not a hard argmax**, so neuroevolution searches a
smooth landscape and they trade off through their EFFECTS (hide kills the thrust strike/flee need) + energy costs.
Wired in `world.js`'s move/feed steps (`config.js ACTION` knobs):
  - **STRIKE** — a predatory lunge: drives thrust toward full + **extends the predator's eat reach** by up to +60%
    (`takePrey`) + costs energy. **FLEE** — an escape sprint: drives thrust up + **lifts the speed cap** (a burst
    exceeds cruise) + costs the most energy. **HIDE** — a freeze: suppresses thrust + steers to the **nearest cover** +
    **conceals** the prey (shrinks a predator's reach by up to 50% in `takePrey`). So a predator's strike decision and a
    prey's hide/flee decision meet in `takePrey` — an emergent arms race.
  - Started **~OFF** at init (negative output bias in `randomGenome`) so a fresh lake swims at the old turn/thrust
    baseline and evolves the actions where the prey/threat/energy senses make them pay.
  - **Genome migration preserves evolved brains:** `core.js migrateGenome()` lifts an older **2-output** genome to the
    5-output layout, **keeping the learned input→hidden + turn/thrust weights + LEAK memory** and seeding the 3 new
    actions ~off (NOT a reseed). `world.js fitGenome` calls it for the `len2rec` (2-out recurrent) and `len2pre`
    (2-out pre-recurrence) lengths. So the user's evolved swimming/memory survives BOTH this upgrade and the earlier
    recurrence one. **inspector.js** now renders all 5 outputs (Turn/Thrust/Strike/Flee/Hide) — verified live in the
    preview (a hiding minnow showed Hide 0.52 / Flee 0.40). Save **version 16 → 17**.

**(B) Longer lifespans.** `config.js TIME.LIFE_SCALE = 1.6`; `species.js` multiplies every species' `matureAge` &
`maxAge` by it **once** after the SP literal (single source → growth curve, breeding-eligibility, old-age death,
immigrant spawn-age all see the scaled values). Fish live & mature ~1.6× longer in sim-seconds (calmer turnover, more
seasons per life) while the realistic **relative** life-history ratios are preserved exactly (minnow ≪ carp; matures at
~⅓ … ~13% of life). A tunable knob — dial it if you want them longer/shorter still.

**Verification:** **gate GREEN — 247 checks, 0 fail, perf 231 steps/s, byte-identical determinism, SMOKE OK.** New
headless probes: 5 outputs; forward writes finite strike/flee/hide∈[0,1]; fresh brains start actions ~off; migrateGenome
preserves a 2-out brain's weights+LEAK; STRIKE extends reach (prey just beyond base reach caught only with a committed
strike); HIDE conceals (a freezing prey not caught at a range a non-hider is). Live preview: 0 NaN, all genomes the
5-output length, ~20% of fish firing an action. **3-yr balance: no extinction**, pop 24–476, genes drifting (gen 53).
**Watch-item:** bass/pike standing maxGen 0–1 (immigration-supported) — consistent with the established baseline (the
rescue system exists precisely because apex predators struggle to self-sustain), not a regression; worth a look if you
later want apex lineages to self-sustain.

---

## ✅ RENDER FIX — fish no longer draw outside the lake bed/banks (2026-06-16)
**User report (live sim):** "why are the fish going out of the lake boundaries?" — plus "why does it look like the
fish are still only turn or thrust?"

**Diagnosis (verified empirically against the running sim via the preview MCP, `window.reef.world`):**
- **No fish actually leaves the basin.** Dumped all 442 agents: every centre is strictly inside `[0, bedY(x)]`
  vertically and `[0, W]` horizontally (`belowBed=0, aboveSurf=0, offX=0, maxOverBed=0`). The sim clamps correctly
  (`world.js` move step: `a.y → bedY(a.x)` at the bed, `a.y → 1` at the surface).
- It was a **render artifact**: those clamps bound the fish *centre*, with no margin for the drawn sprite, and the bed
  is drawn *before* the fish — so a bottom-hugging or drop-off-wall-pressed fish (catfish/carp/pike, and shelf minnows)
  drew its lower half over the brown bank. **22 of 346** fish sprites crossed the bed line at any instant; worst for the
  big bottom fish (carp body half-extent ≈ 7.5 world px) and on the steep drop-off walls (reads as "swimming into the bank").

**Fix (render-only — sim positions & determinism untouched):** in `render.js` `_fish`/`_corpse`, inset the *drawn*
position by the **rotated body half-extent** (`|sin|·noseTailReach + |cos|·bodyDepth`, with body-gene headroom) so the
whole sprite stays inside `[half, bedY(x)−half]`. Now a benthic fish's belly rests *on* the bed instead of sinking
through it. **Verified: sprite-crosses-bed 22 → 0** (`worstNewOver = 0`); preview reload shows no console errors; a
followed pike hovers in the water column along the drop-off. **Gate green** (headless byte-identical — render isn't in
the headless path; `SMOKE OK`).

**On "still only turn or thrust" — this is correct, and by design (not a bug):** the brain genuinely has exactly **2
motor outputs** (`core.js`: `const OUT = 2; // turn, thrust`). The cognition work shipped this week was *internal* —
**recurrent memory** (a leaky-integrator hidden state, so the brain now decides turn/thrust using temporal context, not
just the instantaneous frame) and **evolvable morphology** (fin/eye/body genes). The **expanded action space** (the brain
choosing discrete acts — strike / flee / hide — plus internal drives & place-memory) is still **roadmapped, not built**;
that's the next cognition slice and the thing that would make the inspector show more than Turn + Thrust.

---

## ✅ CONTAMINANT BIOACCUMULATION / BIOMAGNIFICATION — DONE (2026-06-16) — the research-tool flagship
**What shipped:** a persistent **contaminant** (mercury/PCB-style) that **biomagnifies up the food chain**. Each fish
carries a **body burden `a.tox`** that rises from (1) **gill uptake** of the dissolved toxicant (per-agent loop:
`a.tox += (TOX.GILL·AMBIENT − TOX.EXCRETE·a.tox)·dt`), (2) a **dose per base-food meal** (`+= TOX.FOOD·AMBIENT` in
every plankton/phyto-fallback/detritus/plant feed branch), and (3) the key step — **assimilating its fish PREY's whole
accumulated burden** when it eats one (`takePrey`: `a.tox += prey.tox·TOX.ASSIM`) — and falls only by **slow first-order
excretion**. Because elimination lags dietary intake, the burden **concentrates at each trophic step** → apex predators
carry the most (verified end-to-end: **piscivore 0.88 ≫ planktivore 0.38**, a ~2.3× factor up the chain). Above
`TOX.HARM` it raises mortality (the harm hazard uses the seeded RNG). **`TOX.AMBIENT = 0` is the default CLEAN lake →
every term is ×0 and the harm check short-circuits → a TRUE no-op on dynamics** (a fresh lake is exactly the pre-slice
baseline; verified inert: max tox 0.000); a **scenario** sets `AMBIENT > 0` (a pollution pulse) — the headline
research lever ("how does a pollutant move through the lake?"). Config `TOX {AMBIENT/GILL/FOOD/ASSIM/EXCRETE/HARM/MORT}`;
serialized as `tx`, **save v16**. **+6 probes** (clean-lake inert; the assimilation step exact 0.8×2.0; end-to-end
piscivore ≥ 1.5× planktivore; tx save round-trip; **HARM-mortality** [a burden ≫ HARM kills, a clean fish survives];
**offspring start clean** [contaminants aren't heritable]). Gate green (233 steps/s, byte-identical, SMOKE OK). **3-yr
balance was byte-for-byte IDENTICAL to the prior baseline** (every census/gene number matched) — proving the AMBIENT=0
default is a perfect no-op (no behaviour change, no extra RNG draws); no extinction, all evolving. **Lean adversarial
review (3 lenses):** code confirmed correct (the byte-identical balance proves the inert default); flagged 2 test-rigor
gaps — the end-to-end check was directional-only & the lethal/offspring paths were untested — both **FIXED** (the 1.5×
magnitude threshold + the harm-mortality & offspring-clean probes above).
- **Plus SUB-LETHAL reproductive impairment (same slice):** the breeding gate now multiplies its probability by
  `toxFecundity(a.tox)` (`world.js`, exported pure fn; `TOX.REPRO_HARM=1.0`/`REPRO_CUT=0.5`) → a contaminated fish
  **breeds less** as its burden rises and is **effectively sterile right at the lethal `HARM` threshold** (fecundity
  falls *before* mortality — the classic PCB/endocrine-disruptor story). Inert at `tox=0` (multiplies the threshold by
  1, no new RNG draw) → **byte-identical to the bioaccum baseline** (verified), so no separate balance needed. +1 probe
  (f(0)=1, f(2)=0.5, f(HARM)=0, monotonic). Save still v16 (`tx` already serialized).

## ✅ CYANOTOXINS / HAB toxicity — DONE (2026-06-16) — a bloom can kill by poison, not just the O₂ crash
**What shipped:** a DENSE cyanobacteria **surface scum** (local `env.cyano` > `CYANO.TOX_THRESH·CAP`) now releases a
toxin (microcystin-style HAB): **fish** lose extra energy (`world.js` metabolism block: `−CYANO.TOXIN·(cyanoAt −
TOX_THRESH·CAP)·dt`) and **zooplankton** die faster (plankton loop: `rand() < CYANO.TOX_ZOO·dt` in the scum). So a
cyano bloom now kills by **POISON** as well as via the existing night/decay O₂ crash. Exposure is **surface-
concentrated** (the scum is buoyant → mostly hits surface minnows; deep fish under a scum are unaffected) and **inert
below the threshold** (a fresh/clear lake is unchanged). Config `CYANO {TOX_THRESH:0.4, TOXIN:0.10, TOX_ZOO:0.4}`.
**+4 probes** (a surface fish drains faster in a forced scum; **inert below threshold** [fresh lake unchanged]; the
toxin kills zooplankton **isolated from competition** — phyto kept at CAP so the zoo can't starve → only the toxin can
kill: toxin-on 1146 ≪ toxin-off 2022; and a determinism re-run). Gate green (229 steps/s, byte-identical, SMOKE OK);
3-yr balance: **no extinction, minnow CV 0.20** (the toxin only bites during intermittent dense surface scums, so it
doesn't crash the web). **Lean adversarial review (3 lenses):** code confirmed correct; flagged 2 test-rigor gaps — the
zoo probe conflated toxin with the cyano↔phyto competition, and no explicit determinism check — both **FIXED** (the
keep-phyto-abundant isolation + the inert-below-threshold + the determinism probes above). A topical pollution/climate-
scenario amplifier (research-relevant).

## ✅ SCHOOL DILUTION / predator-confusion — DONE (2026-06-16) — schooling is now ADAPTIVE
**What shipped:** a predator's effective strike reach now **shrinks with the prey's local same-species shoal density**
(`world.js takePrey`: `reach = eatRadius · (1−coverAt·COVER.REFUGE) · (1 − SCHOOL.DILUTE · shoal)`, where
`shoal = allyStats(prey, SCHOOL.DILUTE_R).density` ∈ [0,1]). A fish tucked in a tight shoal is harder to single out
(real dilution/confusion). So the innate schooling cohesion finally **PAYS OFF** against predation → tight shoals are
selected for, not scripted. Stacks with the cover refuge; deterministic (no RNG, just an `allyStats` grid query).
Config `SCHOOL {DILUTE_R:44, DILUTE:0.5}`. **+2 probes** (a lone prey just within reach IS eaten; the same prey in a
dense shoal is NOT — cover-independent by computing the test range from the effective reach). Gate green (236 steps/s,
byte-identical, SMOKE OK); 3-yr balance: **no extinction, minnow CV 0.18** (the logistic-K cap prevents a minnow
explosion despite the survival edge), all species evolving (body gene drifted ↑ 1.14 — deep bodies now doubly favoured
by the predation-defence `bodyMul` + dilution). **Lean adversarial review (3 lenses):** flagged that the dilution
applies to ANY conspecific cluster, not only "schooling" species — kept as intended (it's a group-size property; a real
baitball of any species dilutes predation, and gating to schoolers would be less realistic — schooling is just the
behaviour that reliably forms a cluster), clarified the `takePrey` comment, and added a **density-graded monotonicity
probe** (reach× 1.00 > 0.75 > 0.50) to lock in the design.

## ✅ FISH COGNITION — RECURRENT MEMORY — DONE (2026-06-15) — the brain stopped being memoryless
**What shipped (the first fish-COGNITION slice, ROADMAP §A):** the per-fish neural net gained a **leaky-integrator
hidden state**, so behaviour can depend on **history**, not just the current instant — the brain now has MEMORY (the
single biggest step from "reflex animal" toward "thinking").
- **Mechanism** (`core.js`): the genome gained a per-hidden-unit **`[LEAK(hid)]`** block (last in the layout;
  `genomeLen += hid`). `forward()` now computes `h[j] = σ(leak)·h_prev[j] + (1−σ(leak))·tanh(Σ W1·in + B1)` — each unit
  keeps a learned fraction of its previous activation → the hidden state **integrates over time** (a fish can hold a
  recent-threat / food-patch trace and act non-reactively). `act.h` persists ON the agent across ticks; it stays in
  [-1,1] (convex blend → bounded, no runaway).
- **Determinism preserved**: `act.h` is zero-initialised at birth (`makeAgent`), advanced only by the fixed timestep,
  no RNG → **byte-identical re-verified**. The hidden state **IS serialized** (as agent field `m`) so a saved sim
  resumes with its in-flight working memory intact (added after the review flagged the gap; round-trip tested; older
  saves without `m` load blank).
- **Memory EMERGES, not imposed**: `randomGenome` biases the LEAK block to `rand(-3,-0.5)` (σ ≈ 0.05–0.38, low memory),
  so a fresh lake starts ~reactive (≈ the pre-recurrence baseline) and selection raises leak where memory pays off. At
  leak≈0 the net is exactly the old memoryless MLP (headless-asserted history-independence).
- **Old brains preserved**: `fitGenome` now keeps a pre-recurrence brain's weights and **appends memoryless leak
  params** (instead of reseeding) → the user's evolved brains survive the upgrade and can grow memory. Save **v15**.
- **Verified**: gate **green** (207 steps/s — perf unchanged; byte-identical; SMOKE OK); **+5 cognition probes**
  (memoryless⇒history-independent; high-leak⇒history-DEPENDENT = MEMORY, Δturn 0.082; the trace persists then DECAYS
  toward the baseline & stays bounded; pre-recurrence brain preserved on load). 3-yr balance: **no extinction, minnow
  CV 0.17 (baseline/steady)**, fish + plant genes still evolving — recurrent brains coexist fine (the innate ethogram
  floors behaviour regardless of the brain, so this was lower-risk than it sounds). *(A flaky plant shading-OUTCOME
  probe, exposed by the RNG-stream shift, was rewritten to be trajectory-independent.)* **Adversarially reviewed (42
  agents, 4 lenses):** flagged that `act.h` wasn't serialized (loaded agents reset memory) → **FIXED** (serialized as
  `m`, round-trip tested); for the "is memory actually used?" rigor concern, added probes that recurrence is **active &
  evolvable in the live sim** (mean leak ≈ 0.18, spread 0.16) — without falsely asserting memory *improves* fitness
  (that's a genuine empirical question; memory is made available & selectable, not imposed).
- **Next (§A):** an **expanded ACTION SPACE** so the brain *decides* (strike / flee / freeze / dive-to-cover) instead
  of feed/flee being automatic — the recurrent state is the substrate it builds on; then internal drives (hunger/fear).

## ✅ FISH MORPHOLOGICAL EVOLUTION (v1) — DONE (2026-06-15) — heritable, functional + drawn body-plan genes
**What shipped:** the fish trait genome grew from 3 → **6 genes** (`core.js GENE_KEYS` = size/speed/tol + **fin / eye /
body**), the [[plant-evolution]] pattern applied to fish: heritable, FUNCTIONAL, and VISIBLY DRAWN, with every benefit
costed so traits trade off.
- **Functional** (`world.js makeAgent` derives per-fish stats): **fin → `maxTurn`** (sharper turns) at a small drag
  cost; **eye → `senseRange`** (sees farther); **body-depth → `accel`** (more thrust) + **a predation defence**
  (`bodyMul`: a deeper-bodied fish is effectively larger to a gape-limited predator — applied to the prey side of
  `canEat` in `qThreat`/`qPrey`) + drag. **All costs fold into `metabMul`** → nothing is free. The move step uses
  `a.maxTurn`/`a.accel`, senses use `a.senseRange` (was the species constants).
- **Visible**: `species.js drawFish` reads `o.morph {fin,eye,body}` → scales **body depth (Hh), caudal + pectoral fins,
  and eye radius** per fish. Cached through the existing sprite cache via a **coarse morph bucket** (`render.js`
  `_morphBucket`: 3 levels/gene → ≤27 combos; `_morphVal` reconstructs it in `_build`, which sizes the canvas for the
  evolved extent). LRU cap raised **1000→2500** for the new buckets (each sprite ~10KB).
- **Guards/persistence**: `fitGenes()` pads an older short genome (preserves evolved size/speed/tol, new genes→~1.0);
  corpses carry genes; **save `version: 14`**. At genes≈1.0 every derived stat is **exactly** the species baseline
  (headless-asserted) → a fresh lake behaves like the pre-slice sim (no balance shift).
- **Verified**: gate **green** (274 steps/s, byte-identical determinism, SMOKE OK); **+9 probes** (each morphology
  gene→stat direction + trade-off, predation defence via `canEat`, the length guard, the **genes≡1.0 = baseline**
  invariant, and a **smoke test that two morph buckets build differently-sized sprites** — guards `_morphVal` against a
  stuck `{1,1,1}`). 3-yr balance: **no extinction, minnow CV 0.21 (baseline), and the morphology genes evolve under
  selection** — a run drifted **fin +0.11 / body +0.06 / eye −0.08** (the eye's metabolic cost outweighing its vision
  benefit = a real eco-evo outcome), alongside the established size↓/tol↑ thrifty strategy. `npm run balance` now prints
  a **fish-gene drift line**. **Adversarially reviewed (31 agents, 4 lenses):** implementation confirmed correct; the two
  test-coverage gaps it found (draw-differs-per-bucket; genes≡1.0=baseline) are now closed.
- **Open (v2):** per-species DRAWN tail-fork / mouth-gape detail; **gape→max-prey-size** as its own gene; allometry/
  ontogeny (juvenile↔adult proportions). Then the big **fish COGNITION** arc (action space + memory) per ROADMAP §A.

## ✅ PLANT INTERACTIONS: SHADING COMPETITION — DONE (2026-06-15); clear↔turbid feedback DEFERRED to Phase-5
**What shipped (slice 4 of the plant-realism overhaul):** **shading competition between macrophytes.** In the plant
growth step (`world.js`), live plants are bucketed into `COMPETE.RADIUS`-wide x-columns; each plant's **effective
light = `env.lightAtDepth(top) × exp(-COMPETE.SHADE · overhead)`**, where `overhead` = Σ over **strictly taller**
neighbours within RADIUS of (`cover × horizontal-falloff`) — `overheadFrom()` (O(n) via the bucket; a linear
`plantShadeFactor(p)` mirrors it for tests). Effective light feeds BOTH growth and the light-starvation death →
a **stratified canopy + self-thinning** of dense beds. Because `cover` folds in the per-plant **leaf** gene and the
**light**-requirement gene sets the death threshold, shading **selects for shade-tolerance & HEIGHT under a closed
canopy** — a real eco-evo loop with the [[plant-evolution]] genome (3-yr balance drifts `maxH`/`light`). Config:
a 2-knob `COMPETE { RADIUS:22, SHADE:0.6 }`. No save bump (shading is derived per step).
- **Also fixed (from the review): a mass-conservation bug** — a light-starved plant now **sheds its biomass to the DOM
  pool** (`env.addDOM`, like senescence) instead of silently vanishing; the microbial loop reclaims it. (Pre-existing
  since the seasonal-macrophyte slice; shading drives more such deaths, so it mattered.)
- **Verified:** **+4 headless probes** (the shading factor cuts a short plant's light 1.00→0.87; one-directional; no
  shade beyond RADIUS; a dynamic OUTCOME run where a canopied plant ends up stunted/dead — "open h13 vs under h6"). Gate
  **green** (perf 213 steps/s, ALL CHECKS PASSED, SMOKE OK, **byte-identical determinism**). 3-yr balance: **no
  extinction, every species evolving, minnow CV 0.23** (baseline), plant genes drift under selection.
- **DEFERRED — the macrophyte↔phytoplankton clear↔turbid feedback (→ Phase-5).** I built a per-column macrophyte→phyto
  nutrient-competition arm, tested it, and **removed it**, honestly: in a *closed, mass-conserving, P-limited* lake a
  per-column nutrient draw is **compensated** (the freed P just lets phyto rebound) and routing it to the sediment store
  **saturates**. A correct clear-water arm needs a **tracked macrophyte-P standing-biomass stock** + **bistability/
  hysteresis validation** — exactly the Phase-5 regime-shift item, now annotated in ROADMAP with this lesson. The
  turbidity→light-starvation arm is already in place as the other half. **Don't re-attempt the growth-rate suppression.**

## ✅ PLANT EVOLUTION — DONE (2026-06-15) — heritable, functional + visible macrophyte trait genome
**What shipped (slice 3 of the plant-realism overhaul; the human's "plants should slowly evolve too, with physical
traits — color, size, leaves"):** every dynamic plant now carries a **6-gene trait genome** (`core.js`
`PLANT_GENE_KEYS = ['maxH','grow','light','warmth','palat','leaf']`, multipliers ~1.0 clamped GENE_MIN..MAX) that is
heritable, mutating, **functional AND visibly rendered**.
- **Heredity / seeding from parents:** the seeding step (`world.js`) now finds the nearest established plant via
  `qPlant` and `newPlant(x, false, parent)` makes the seedling a **mutated clone** of that parent's genes + colour
  (`mutateGenes`, `gauss` hue drift) — local dispersal + inheritance, so selection accumulates. Isolated / cold-start
  seeds found with fresh `randomPlantGenes()`. Variety is still re-picked by **rooting depth** (`pickVariety`) so the
  depth-zonation invariant holds (genes drift *within* each form).
- **Gene → phenotype (`derivePlant`, exported):** maps variety `MACRO[p.v]` × genes → effective per-plant
  `growMul / lightMin / tempMin / palat / cover / o2 / leaf / hue / form`, with real **trade-offs** — shade-tolerance
  (low `light` req) and grazing-defence (low `palat`) both **cost growth**; bigger `leaf` raises `lightMin` (can't live
  as deep). So bright shallows favour fast palatable plants; turbid/deep favour slow shade-tolerant ones; grazed beds
  favour tough ones → **divergent selection**. Genes start ~1.0 ⇒ a fresh lake = the pre-evolution baseline (low risk).
- **Visible:** `render.js` draws per-plant `hue` (evolving colour), `leaf` (leaf/pad size) and height; `environment.js`
  photosynthesis uses per-plant `o2`; `coverAt`/`bitePlant`/growth/death all read the per-plant derived fields.
- **Persistence:** **save `version: 13`** serializes plant `g` (genes) + `hu` (hue); `load` reconstructs with a
  **genome-length guard** (old/short genome → reseed) and re-derives. The vigor window is floored (`Math.max(3, …)`)
  so a high warmth-req gene can't make growth a near-step.
- **Verified:** **+11 headless probes** (genome presence/length, every gene→phenotype direction + trade-off, heredity
  ≪ random founder, heritable hue, the light-starvation **selection filter**, warmth-gene direction, save round-trip) +
  **1 smoke** (plants carry the rendered phenotype). Gate **green** (perf 110–214 steps/s, ALL CHECKS PASSED, SMOKE OK,
  **byte-identical determinism**). **3-yr balance**: genes **drift under selection** (grow +0.21, shade-tolerance ↑,
  warmth-req ↑, colour 119°→155°), **no extinction**. `npm run balance` now prints a **plant-gene drift line**.
- **Adversarially reviewed** (Workflow, 46 agents, 5 lenses, cached-resume): functional/determinism/balance/persistence
  all verified correct; **one finding fixed** — the gene was named `cold` but `tempMin = base × gene` meant *higher =
  needs warmer = LESS cold-tolerant* (inverted) → **renamed `cold`→`warmth`** (a "requirement" gene, consistent with
  `light`) + added the missing directional probe.
- **Known/open:** the `grow` gene has **no direct cost** so it trends to its cap (bounded/stable — a future
  grow↔defence/maintenance cost would enrich it); variety itself isn't heritable (depth-determined). **Next plant
  slice = INTERACTIONS** (shading competition + the clear↔turbid feedback). Also added to ROADMAP this session: a big
  **"Cognition & morphological evolution"** section (fish action-space/memory/topology; fish & plant **physical**
  evolution; spatial/navigation sense; speciation, plasticity, arms races) per the human's research-grade asks.

## ✅ LAKE REALISM SLICE — DONE (2026-06-14, after Phase 2)
The human's 5 realism asks have all shipped (see the dated log entry below for details). Quick status:
1. **Swim animation slowed/smoothed** — `render.js` `_fish` beat `t*(3+spd*0.16)` → `t*(1.1+spd*0.07)`,
   `SpriteCache.FRAMES` 6→10, `drawFish` undulation amplitude/frequency softened. No more buzz.
2. **Depth shading** — new `depthDim(y)` in `render.js` (1.0 surface → ~0.34 bed); folded into the
   sprite light bucket (`LIGHTS` 4→6) and the dot/corpse/plant lightness; water-column gradient
   strengthened (sunlit surface band → steeper ramp to abyss).
3. **Far-zoom legibility** — dot LOD now min 2px + more alpha/contrast.
4. **Littoral shelf** — `config.js` `bedY(x)` reshaped from a smooth U into a **flat shallow shelf →
   steep drop-off → deep basin**; minnow/sunfish spawn biased to the shelves (`littoralX`).
5. **Littoral weed beds** — plant seeding biased to the lit shelf (`plantX`, `BASIN.SHELF_FRAC`);
   reeds were already shore-bound.
**Also shipped (two new roadmap items the human asked for):** a **½× "relaxed" speed** (screensaver
pace, auto-engaged in fullscreen) and **temperature in °F** (click the readout to toggle °F/°C).
**Verified** in the preview (Claude_Preview MCP): shelf+drop-off cross-section, the lighter-top/
darker-deep gradient in daylight, reeds + minnows/sunfish/bass on the shelf, °F in the HUD, the ½×
button, far-zoom dots all confirmed. *Motion smoothness is verified at the code level (beat ~⅓ the
old rate) — a human watching it live is still the best final check of the **feel**.*

---

## Current status — PRIOR-SESSION snapshot (SUPERSEDED by the "OVERNIGHT WORK LOG" + the 7 dated entries at the TOP; save is now `version: 16`, gate 239 checks. Kept below as historical context.)
- **Phase 0 ✅** camera/scale/LOD/sprite-cache/HUD/minimap. **Phase 1 ✅** basin (flat shelf→drop-off→deep),
  depth zonation, seasons, thermal stratification + **storm-driven** turnover, wind + inflow current,
  turbidity/Secchi, habitat structure (reeds/logs/**submerged weed beds**) + cover/refuge. **Phase 2 ✅+**
  phyto→zoo→planktivore web, mussels, **N/P nutrient split** (phosphate-limited, Liebig co-limitation,
  P-enriched inflow), **sediment-P internal loading** (Mortimer redox, reuses the summer dead zone),
  **nitrogen cycle** (ammonium⇌nitrate via aerobic nitrification [O₂-consuming] + anoxic denitrification
  [a permanent N sink → P stays the ultimate limiter]), **cyanobacteria** (an N-fixing 2nd producer strain that
  wins at low N:P, floats to a surface scum, and re-enriches N — emergent seasonal phyto↔cyano succession),
  eutrophication bloom, **microbial loop** (settling detritus → a `dom` pool → Q10 temperature-/O₂-limited bacterial
  decomposition that consumes O₂ and remineralizes N+P gradually — replaces the old instant detritus dump; DOM piles
  up in the cold deep). **Phase 4 (started)** — **multi-gene genome** (heritable size/speed/tolerance,
  selection visible), **per-species thermal/O₂ niches** (warm/cool guilds + summer squeeze), **DVM depth
  senses**, **trait-based mate choice** (sexual selection on the genome), **innate ethogram** (depth-home,
  cruise, schooling, pike ambush-in-weeds, catfish nocturnality). **Phase 5 ✅** — carrying capacity:
  the hard re-seed floors/caps are RETIRED for **logistic density-dependent reproduction** + **metapopulation
  immigration rescue** (rarity trickle + a tiny REFUGE backstop). **Food-web rebalance ✅** — **planktivore
  facultative omnivory** (minnow/sunfish graze phyto when zooplankton is scarce) → **4 species now self-sustain**
  (minnow 4% / sunfish 14% / carp 6% / catfish 0% immigrant; minnow CV 1.26→0.80, fuller + steadier); only the
  apex bass/pike lean on immigration (realistic). **Phase 6 (started)** — depth-shaded
  render, soft godrays, **cyanobacteria surface scum**, **detailed stats/chemistry dashboard** (per-species
  genetics, N·P, sediment-P, nitrate %, cyano, depth-resolved temp/O₂) + a **depth water-column profile view**
  (temp/O₂/N/P/phyto/cyano vs depth under the camera), ½× relaxed/screensaver speed, °F, **eased facing-flip**
  (smoother fish motion). **Genome-length guard** + save versioning.
- **LATER THIS SESSION (2026-06-15, all ✅ green + balance-verified + adversarially reviewed):** **temporal realism**
  — a 12-month calendar (`TIME` master block; day<month<season<year, months displayed) + realistic relative fish
  lifespans (~10× spread, mature at ⅓ of life) + **seasonal spawning** (spring/early-summer baby boom); **fecundity/
  clutch** (condition-bounded multi-young broods → the larger fish self-sustain again); and the **plant-realism
  overhaul** — **seasonal macrophyte phenology** (warm-season growth → autumn senescence→DOM pulse →
  overwinter rootstock; death by light-starvation = depth/turbidity limit) + **macrophyte varieties** (`MACRO`
  registry: pondweed/milfoil/lily/chara, depth-zonated) + **plant EVOLUTION** (a heritable **6-gene macrophyte genome**
  — height / growth / light- & warmth-requirement / palatability / leaf-area, **seeded from nearby parents** + mutated,
  with growth trade-offs; **functional AND drawn** — colour/leaf-size/height render per-plant; selection visibly drifts
  the genes over a multi-year run). **Save now `version: 13`; ~205 checks (177 headless + 28 smoke).** ⚠️ **Known/by-design
  caveat (human-flagged):** absolute fish lifespans are COMPRESSED
  (minnow ~1 month … carp ~10 months) to keep evolution watchable — feels short when you follow an individual; logged
  on ROADMAP ("Revisit fish lifespan absolute scale") to lengthen later.
- **THE BIG PICTURE for whoever picks this up:** the lake is now a deep, realistic ecosystem — fish behave
  like their real species (zonation, schooling, ambush, nocturnal), evolution acts on a real genome via
  sexual selection, and the biogeochemistry has genuine N+P co-limitation + internal loading. Continue from
  **"Next up"** below. Each slice this session was: build → headless probes → balance → preview → adversarial
  review (when substantial) → docs. Keep that rhythm.
- **World:** **2048×1152** (≈16:9, ~6.7× the old pond's area), side-view, all underwater.
  Size is now a **single config number** (`WORLD.W/H` in `config.js`); every population and
  resource count is a **density auto-scaled by `WORLD.AREA_SCALE`**, so the same per-area
  balance holds at any size. Default supports up to ~1,000 agents (`GLOBAL_MAX` ≈ 1012).
- **Camera:** new pure `src/camera.js` — pan (drag), zoom (scroll, ~0.8×–64× the whole-lake
  fit), click-to-follow, keyboard (O whole-lake, F follow, T tour, +/−), and a cinematic
  **auto-tour** (also auto-starts in fullscreen). Renderer draws in world space through the
  camera; only the visible region is drawn.
- **Render (`render.js` rewritten):** culling + 3-tier **LOD** (far = tinted dot, mid/near =
  cached **sprite**, sub-pixel = skipped) + a lazily-built **sprite cache** keyed by
  (species, growth, hue, light, anim-frame) blitted with `drawImage` (pixelated). Plus a
  **minimap** (whole lake + camera rect + density, click to jump) and a toggleable **perf HUD**
  (fps / drawn-vs-total / sprites / dots / sim ms / steps-s / zoom / cache size).
- **Runs:** `python3 serve.py` → http://localhost:8000 (desktop browser).
- **Tests:** `npm test` runs `node test/headless.mjs` (sim + camera + Phase 1 thermal/structure/
  **littoral shelf+drop-off+weed-bed** + Phase 2 trophic/eutrophication + **determinism** + content
  save/load + **thermal/O₂ niches** + **genome-length guard** + **depth (DVM) senses** + **storm
  mixing** + **multi-gene genome** + **stats accessors** + **behavioral baselines** + **N-cycle
  nitrification/denitrification** + **cyanobacteria N-fixing strain** + **depth water-column profile** +
  **Phase-5 carrying capacity** (logistic + immigration rescue + REFUGE no-extinction) + **food-web rebalance**
  (planktivore self-sustains) + **microbial loop** (Q10 temperature-/O₂-limited bacterial DOM decomposition, exact
  mass conservation) + **temporal realism** (12-month calendar with realistic day:month:season:year ratios + realistic
  relative fish lifespans + seasonal spawning) + **fecundity/clutch** (a spawning yields a condition-bounded brood of
  several young → restores larger-fish self-sustenance) + **seasonal macrophytes** (temp-driven growth, autumn
  senescence→DOM pulse, overwinter rootstock, light-starvation depth limit) + **macrophyte varieties** (a typed
  registry — pondweed/milfoil/lily/chara — depth-zonated, per-form params + render)) **and** `node test/smoke.mjs`
  (DOM-stub browser-layer smoke). **Both green — 193 checks (166 headless + 27 smoke).** Determinism byte-identical. Save `version: 12`
  (`dom` dissolved-organic-matter field, `cyano` field, inorganic N split into `nh4`+`no3`, phosphate `phos`,
  sediment-P `sedP`, `weedbeds`, per-agent `gn` genes; tolerantly loads older saves — missing `dom`/`cyano` default
  to the seed (0 / seed strain), v7/v8 `din` splits into nh4/no3, legacy `nut` splits N/P).
  The **littoral shelf was broadened** (`BASIN.SHELF_T` 0.22→0.34, `SHELF_Y`→0.25,
  `SHELF_FRAC`→0.30) to fix over-crowding at the shore (was 67% of fish in the littoral → 47%).
  `npm run balance [years]` (`test/balance.mjs`) is a non-gate long-run analyzer. Sim runs ~440 steps/s
  at ~300 agents; determinism is byte-identical under a seed. NB: balance's "standing maxGen" is a noisy
  *end-of-run snapshot* — bass/sunfish can show maxGen 0 there yet have **1000s of cumulative non-reseed
  births** (they reproduce fine; high-turnover predators just rarely have descendants alive at the exact
  final tick). Judge reproduction by `world.stats.births`, not the snapshot.
- **Verification status:** headless + smoke green; **rendering confirmed via the preview tool**
  (Claude_Preview MCP `reef` server): the new shelf+drop-off basin, the lighter-top/darker-deep depth
  gradient, littoral reeds + minnows/sunfish/bass on the shelf, °F HUD, the ½× relaxed button, far-zoom
  dot legibility. **A human watching it live is still the best check of motion *feel*.**
- **Known limitations / risks:**
  - Sprite cache builds lazily; a burst of new (hue/light/frame) buckets could cause a brief
    first-frame/light-flip hitch. LRU-capped at 600 sprites. Watch the perf HUD.
  - **Phase 5 ✅ + food-web rebalance ✅ (2026-06-15):** the hard re-seed floors + caps are RETIRED — populations
    are now logistic (density-dependent reproduction, K = `popMax`) + **metapopulation immigration rescue** (a
    rarity trickle, `RESCUE_N`=8) with a minimal `REFUGE`=2 quasi-extinction backstop. The **food-web rebalance**
    (planktivore facultative omnivory — `PLANKTON.FALLBACK_*`) then made **4 species self-sustain** (minnow 4% /
    sunfish 14% / carp 6% / catfish 0% immigrant). *Remaining (optional):* only the apex **bass 66% / pike 38%**
    lean on immigration (realistic for a small lake); a predator fallback would let them self-sustain too.
  - Old (version ≤2, 760×460) save files load but place fish in a corner of the new world;
    `environment.load` now tolerates field-size changes. New saves are `version: 3`.

## Next up  (post-compaction: read this first, then the newest log entries, then ROADMAP)
0. **RECOMMENDED NEXT — pick one (the food web is now a self-sustaining community; chemistry is deep):**
   - **(a) Cross-boundary life** — herons/kingfishers diving from above / the shoreline (high visible drama; a new
     agent type, predation from outside the water). The most *visible* next step toward the "living lake" vision.
   - **(b) Zooplankton → NN agents** — promote the zooplankton particles to tiny-MLP agents (sense light/predators/
     food → evolve diel vertical migration). A big step toward the "every organism on its own NN" vision (the
     human raised this); perf-gated (~2000 agents) → may want a Web Worker pass first.
   - **(c) ✅ The microbial loop is DONE** (2026-06-15 — detritus→DOM→Q10 bacterial O₂ demand + gradual N+P release).
     Remaining biogeochem: **pH/CO₂** (a `dic` field → closed-form pH; daytime blooms push pH>9), or the **visible
     sediment-ooze layer** (the slow benthic-mineralization end of this loop, rendered as a thickening silt bed).
   - **(d) ✅ Fecundity / clutch model DONE** (2026-06-15 — condition-bounded multi-young broods restored self-sustenance:
     catfish 31% / carp 40% / sunfish 13% immigrant; bass/pike still apex-dependent, which fecundity can't fix). Remaining
     reproduction realism: **egg→larva life stages** (a true larval phase with its own vulnerability/diet — now unblocked
     by Phase 5 + the clutch), and/or a **predator-energetics ease** if you want bass/pike less immigration-leaning.
   - **(e) The research/scenario tool** (the 🌟 north-star — invasive species / pollution / climate; see ROADMAP) —
     the capstone; needs a bit more realism + a scenario engine + CSV export first.
   **Also pending human visual checks:** the fish-twitch facing-flip fix; that the boom-bust variability reads well.
   🌱 **ACTIVE THREAD — plant realism overhaul** (human-requested): seasonal phenology ✅ + macrophyte varieties ✅ DONE;
   **next: (3) plant EVOLUTION (heritable trait genome, seed-from-parent), then (4) plant INTERACTIONS (shading
   competition + clear↔turbid feedback).** See ROADMAP "Plant realism" + the newest log entries.
   ✅ Just shipped: **macrophyte varieties** (typed registry — pondweed/milfoil/lily/chara, depth-zonated, per-form
   params+render), **seasonal macrophytes** (phenology + autumn DOM pulse + rootstock + light-death depth limit),
   **fecundity/clutch**, **temporal realism** (calendar + lifespans + seasonal spawning), **microbial loop**,
   **food-web rebalance**, **Phase 5 carrying capacity**, **depth water-column view**, **phyto base + History chart**.
1. **Other strong options** (all on `ROADMAP.md`): more ethogram v2.1 (schooling separation/alignment,
   depth-home *band*, absolute minnow home-depth); cross-boundary life; benthic inverts (crayfish/snails);
   egg→larva life stages (now unblocked). One coherent slice per session.
2. **Phase 5 ✅ DONE — what remains is food-web rebalancing.** The hard re-seed floors + caps are retired
   (logistic reproduction K=`popMax` + `IMMIGRATION` rescue + `REFUGE`=2). catfish/carp/minnow self-sustain
   (0–19% immigrant); sunfish/bass/pike lean on immigration (honest — the small-lake carrying-capacity truth).
   Judge reproduction by `world.stats.births` vs `world.stats.immigrants`, not the maxGen snapshot.
3. **Tuning knobs you'll likely touch:** `config.js` `FLOW.NUTRIENT` sets the lake's trophic state
   (1.3 = mesotrophic/lively; lower = oligotrophic); `SED_P.*` the internal loading; `NUTRIENT.*` the N/P
   limitation; `ENV.THERMAL_STRESS` + per-species `tempOpt/tempTol/o2Crit` the thermal niches; per-species
   `innate.*` the ethogram. **If a chemistry change destabilises the web, check `NUTRIENT.DECAY` (global
   sink) and `P_USE` vs `RECYCLE·ORGANIC_P` (internal P balance) first.**
4. *(Perf, if counts push past a few thousand)* Web Worker + OffscreenCanvas / WebGL. Sim is ~340–440
   steps/s now (all the new per-step systems added cost); still well over the 30/s real-time budget.

## Open decisions (resolved this session)
- **Stack:** kept vanilla JS / 2D canvas. Rationale: Claude can't open a browser to verify a
  GPU rewrite; the roadmap says go WebGL only at many-thousands; camera + culling/LOD + sprite
  caching reaches the ~1,000-agent target, and world size is now one config number, so scaling
  further later is trivial. WebGL/Worker noted as the next step if counts demand it.
- **First milestone scale:** 2048×1152 (~6.7× area), `GLOBAL_MAX` ≈ 1012, perf-budgeted in
  the headless test. Bump `WORLD.W/H` to grow further.

---

## Log

### (template — copy for each session)
**Date:** YYYY-MM-DD
**Did:** what shipped this session.
**Verified:** headless results, smoke results, anything the human confirmed visually.
**Decisions:** choices made and why.
**Next:** the immediate next step.
**Risks/notes:** anything the next session should watch.

### 2026-06-15 — Macrophyte varieties (plant realism, slice 2: typed growth forms, depth-zonated)
**Did:** Slice 2 of the plant overhaul — replaced the single generic macrophyte with a **variety registry** so the lake
has accurate, varied plants. `config.js MACRO` = 4 rooted growth forms, each with depth `zone`, `maxH`, `grow`, `cover`,
`o2`, `palat`, shade-tolerance `lightMin`, cold-tolerance `tempMin`, `hue`, render `form`:
- **pondweed** (common submerged, shelf→drop-off), **milfoil** (deep, dense, shade-tolerant, tough/low-palatability),
  **water lily** (shallow floating-leaved, warm, broad pads), **muskgrass/chara** (low benthic mat needing CLEAR water).
- `world.js`: `pickVariety(bedFrac)` assigns each new plant a depth-appropriate variety (so forms **zonate by depth** —
  shelf gets lily/chara/pondweed, drop-off pondweed/milfoil, deep basin milfoil only). Growth (vigor window + rate),
  light-starvation death threshold, grazing palatability, and cover all read the plant's variety. `environment.js`:
  plant O₂ ×variety. `render.js`: per-form drawing — swaying **stalk** (pondweed/milfoil), floating **pad** (lily, via
  ctx.ellipse), low benthic **mat** (chara) — colored by variety hue. Save **v12** (plants carry `v`; old saves default
  to pondweed). `smoke.mjs` gained a `ctx.ellipse` stub.
**Verified:** `npm test` green — **193 checks (166 headless + 27 smoke)**, +3 variety probes (4 of 4 forms present;
every plant within its depth zone; deep basin = milfoil only); 0 fail. **Determinism byte-identical.** Live preview:
all 4 varieties present (pondweed 193/milfoil 168/lily 171/chara 137), tall varied beds render in the littoral, no
console errors. **2-yr balance: ✓ no extinction, ✓ all evolving**, immigration-dependence held/improved (sunfish 13% /
catfish 29% / carp 33% / pike 43% / bass 73%), no overpopulation. **Adversarially reviewed** (2-lens workflow; it was
still completing at compaction time — the slice is independently gate-green + balance-verified + preview-confirmed, and
all 4 prior reviews this session returned 0 findings, so it's expected clean; check the workflow logs if needed).
**Decisions:** kept emergent **reeds** + tall static **weed beds** as separate cover structures (they already model
those forms). **Deferred free-floating duckweed** (drifting/blooming surface mat — needs surface-drift mechanics) and a
true at-surface lily canopy (rooted approximation for now). `pickVariety` is random among the depth-matching forms.
**Next (slice 3 of 3): plant EVOLUTION** — plants seed from nearby parents (not random spawn) inheriting + mutating a
trait genome (max-height / shade & cold tolerance / growth / palatability / depth optimum) → slow plant adaptation;
then **slice 4: interactions** (shading competition + the clear↔turbid feedback). **Risks/notes:** per-variety params
are config constants now — slice 3 makes them per-plant heritable; keep `p.v` always a valid MACRO index.

### 2026-06-15 — Seasonal macrophytes (plant realism, slice 1 of the plant overhaul: phenology)
**Did:** First slice of a human-requested **plant realism overhaul** (plants should grow/interact/evolve + have accurate
varieties, like a real ecosystem). Started with **seasonal phenology** of the rooted macrophytes (`world.plants`).
- `config.js PLANT`: `GROW_TEMP_MIN 14`/`GROW_TEMP_OPT 23` (temperature growth window), `SENESCE 0.05`, `WINTER_MIN 6`
  (rootstock), `SENESCE_TO_DOM 0.5`, `LIGHT_MIN 0.04`/`SHADE_DEATH 0.05` (light-starvation death).
- `world.js` plant growth loop: growth now × a **seasonal vigor** = `clamp((tempAt(p) − GROW_TEMP_MIN)/window,0,1)`
  (warm-season growth; uses depth-local temp so the cold deep can't grow tall = an emergent depth limit). **Autumn/winter
  senescence**: die-back toward `WINTER_MIN`, shedding biomass into the **microbial-loop DOM pool** (`addDOM`, the fall
  organic pulse). **Death is now light-starvation** (`lit < LIGHT_MIN` → uproot) — the depth/turbidity limit + the seed
  of the clear↔turbid feedback — instead of the old grazing-uproot. Seeding scaled by warm-season `seedVigor` (≈none in
  winter). `bitePlant`: grazes only ABOVE the **rootstock** (`WINTER_MIN`) — the below-sediment rhizome survives grazing
  AND winter, so perennials regrow in spring.
**Verified:** `npm test` green — **190 checks (163 headless + 27 smoke)**, +2 plant probes (summer biomass ≫ winter;
plants overwinter as rootstock, count>0 & shorter than summer); 0 fail. **Determinism byte-identical.** Live preview:
calendar at "July · Summer", sim runs clean (no console errors). **Adversarially reviewed** (2-lens). **3-yr balance: ✓
no extinction, a clean ANNUAL plant cycle** — spring-grow → summer-peak (plants ~500-750) → autumn die-back (→157) →
sparse winter rootstock (25-86) → spring regrowth; an **autumn DOM pulse** (dom 0.18-0.23 autumn vs ~0.06 summer);
immigration-dependence held/improved (catfish 31→27%, carp 40→35%, pike 57→47%).
**Decisions:** the realistic fix for winter survival was a **grazing-/winter-proof rootstock** (below-sediment rhizome)
+ moving plant death from grazing-uproot to **light-starvation** (so deep/turbid beds die back, freeing bed slots for
the lit littoral — also the depth limit). Per-plant params are GLOBAL now; they become **per-variety / heritable** in
the next slices. Summer mean height is a grazed-lawn ~9 (heavy herbivory equilibrium) — the tall visual cover is the
separate static `weedbeds`; accepted, not tuned.
**Next (the rest of the plant overhaul — human wants all of it):** **(1) macrophyte VARIETIES** (a typed species
registry — emergent/floating-leaved/submerged/free-floating/charophyte — unifying plants+reeds+weedbeds), **(2) plant
EVOLUTION** (seed-from-parent heritable trait genome — height/shade-&-cold-tolerance/growth/palatability/depth), **(3)
plant INTERACTIONS** (shading competition + macrophytes-suppress-phyto ↔ turbidity-shades-plants = the clear↔turbid
regime-shift). All added to ROADMAP under "Plant realism". **Risks/notes:** `PLANT` seasonal params are global — design
the variety/genome slices to move them per-plant; the light-starvation death uses `core.rand` (deterministic, short-
circuited to fire only when light-starved).

### 2026-06-15 — Fecundity / clutch model (restore larger-fish self-sustenance on top of realistic life histories)
**Did:** The temporal-realism slice (realistic slow life histories + seasonal spawning) had made the larger fish
immigration-dependent (catfish 49% / carp 55% / bass 89% / pike 70% immigrant). The realistic fix: **fecundity** — real
fish lay many young to offset high juvenile mortality. A successful spawning now yields a **condition-dependent clutch**
instead of one offspring.
- `species.js`: per-species `clutch` (max brood) — default 3; minnow 4, catfish 5, carp 5, bass 4, pike 4 (r- vs
  K-strategist-ish; carp/catfish very fecund).
- `world.js` reproduction (both paths): clutch = `max(1, min(sp.clutch, floor(min(parent energies)/reproCost), headroom))`
  — **bounded by parental energy** (each young costs both parents `reproCost`, so only well-fed fish afford a big brood
  → condition-dependent fecundity), by the species max, and by `WORLD.GLOBAL_MAX - liveTotal` headroom (never overshoots
  the cap). The **asexual budding** fallback broods a smaller clutch (`ceil(clutch/2)`) so a mate-less apex still gets a
  recruitment boost. Self-limiting: the logistic gate already throttles breeding near K, so clutches mostly accelerate
  sparse-population recovery.
**Verified:** `npm test` green — **188 checks (161 headless + 27 smoke)**, **+3 clutch probes** (a well-fed spawning
yields a 4-young brood; condition-dependent 4>3; never exceeds the species max); 0 fail. **Determinism byte-identical.**
**3-yr balance: ✓ no extinction, ✓ every species evolving; self-sustenance improved across the board** — catfish
49→**31%**, carp 55→**40%**, sunfish 27→**13%**, pike 70→**57%**, bass 89→**79%** immigrant (minnow 0%). Total agents
37→500 (cap ~1012 — no overpopulation; the logistic K + energy + headroom bounds held). **Adversarially reviewed**
(2-lens workflow: safety-bounds / determinism+stability).
**Decisions:** tuned in two balance passes — first clutch (catfish 3/carp 4/bass 3/pike 3), then bumped the big fish
(catfish 5/carp 5/bass 4/pike 4) for a modest further gain (catfish 41→31). Stopped there: **bass stayed ~79%** because
its limiter is low numbers + prey + finding mates, NOT brood size — bigger broods can't fix that, and a small-lake apex
being rescue-dependent is ecologically honest. Energy accounting is safe (gate ensures `energy ≥ reproEnergy > reproCost`,
and the affordability `floor` guarantees the brood is payable → no negative energy; `headroom` guarantees no cap overshoot).
**Next:** the food web is now a believable community on realistic life histories. Strong options: **cross-boundary life**
(herons/kingfishers — most visible), **zooplankton → NN agents**, **pH/CO₂** or the **visible sediment-ooze layer**
(biogeochem), or the **research/scenario tool** (the north-star). **Risks/notes:** clutch sizes are the recruitment knob —
if a future change over-inflates a species, lower its `clutch`; bass/pike can't be made self-sustaining via fecundity alone.

### 2026-06-15 — Temporal realism: 12-month calendar + realistic lifespan ratios + seasonal spawning (human-flagged)
**Did:** The human flagged that the time/season/lifespan ratios were unrealistic (a year = ~6 day/nights; fish died in
<0.15 sim-years; ~2× lifespan spread) and asked to add months + make fish behave for the time of year. Chose (via a
design question) **"realistic ratios, watchable scale"** — and built it in two gate-green phases.
- **Phase A — calendar + life histories.** New master `TIME` block (`config.js`): `DAY_LEN` 140→**60**, `YEAR_LEN`
  840→**1800** (30 min/yr), with `MONTH_LEN`/`SEASON_LEN` getters; `SEASON.YEAR_LEN`/`ENV.DAY_LEN` now REFERENCE `TIME`
  (single source). `environment.js`: a 12-name `MONTHS` calendar + `monthIndex()`/`monthName()`/`yearFrac()` (month 0 =
  March, aligned to the untouched `seasonName()`). Per-species `matureAge`/`maxAge` (`species.js`) recalibrated to
  realistic **relative** ratios — **~10× spread** (minnow 150 s → carp 1500 s) and **maturity at 13–33% of life** (carp
  matures early ~13% like real carp; minnow ~33%) — absolute scale compressed so fast species still turn over (true
  decades would freeze evolution = the explicit tradeoff the human accepted). `matingCooldown` rescaled. UI: Month/
  Season/Year rows + "Month · Season" overlay.
- **Phase B — seasonal spawning.** New `SPAWN` block (`FLOOR` 0.12, `SHARP` 4) + per-species `spawnPeak` (year-fraction;
  minnow 0.05, sunfish/bass 0.10, carp/catfish 0.18, pike 0.90 = earliest/coolest). `world.js` precomputes a per-species
  `cos`-bump seasonal multiplier (peak→1, half-year-off→FLOOR) from `env.yearFrac()` and multiplies it into the logistic
  breeding gate (both sexual & asexual paths) → a **spring/early-summer baby boom**, ~⅓-year spawning season.
**Verified:** `npm test` green — **185 checks (158 headless + 27 smoke)**, **+11 temporal probes** (calendar ratios,
12 months, yearFrac, ~10× lifespan spread, maturation fraction, ordering, spawn-factor shape, seasonal-spawning WIRING
[minnows breed 5× more in-season: peak 10 vs off 2 over a short window]); 0 fail. **Determinism byte-identical.**
**3-yr balance: ✓ no extinction, ✓ every species evolving (maxGen>0, incl. bass/pike now).** Live preview confirmed
the Month/Season/Year display ("March · Spring · Year 1"). Fixed one test fragility: `runSeason` now tracks the seasonal
PEAK surface temp (`tSurfMax`) so the thermal-niche check is robust to the shorter day's diel phase (was an instantaneous
read). **Adversarially reviewed** (4-lens workflow: determinism / calendar+spawn math / other-consumer breakage / balance).
**Decisions:** kept `seasonName()` untouched (preserves all seasonal-physics tests; months are a display layer aligned to
it). Seasonal spawning is a SOFT multiplier (never zero, `FLOOR`>0) so recruitment stays seasonal without starving the
rare species. Shortened the day (140→60) to fit a watchable year with meaningful seasons (per-second env means are
preserved — only diel swing amplitude shrinks — so no O₂/nutrient rebalance was needed).
**Accepted tradeoff (honest):** realistic K-selected life histories + seasonal spawning RAISE the larger fish's
immigration-dependence vs the prior food-web-rebalance baseline — catfish 2→**49%**, carp 6→**55%**, bass 69→**89%**,
pike 47→**70%** immigrant (minnow 0%, sunfish 27%). This is ecologically honest (large slow fish in a small isolated lake
ARE rescue/sink-dependent), no extinction, all evolving. **Next/lever:** a **fecundity/clutch** model (a spawning yields
several eggs, as real fish do to offset high juvenile mortality) is the way to restore more self-sustenance while keeping
the realistic lifespans + seasonality — a clean follow-up slice. **Risks/notes:** the seasonal-wiring headless test uses
small counts (10 vs 2) with a 1.5× margin — robust to value tweaks but watch it if the RNG stream shifts; `TIME.DAY_LEN`/
`YEAR_LEN` are the master watchability knobs (raise `YEAR_LEN` for a slower, more screensaver-paced year).

### 2026-06-15 — Microbial loop: detritus → DOM → Q10 bacterial decomposition (the next biogeochem piece)
**Did:** Replaced the **instant, free, temperature-independent** detritus→nutrient dump with a realistic
**microbial loop.** Settling detritus now dissolves into a new **DOM field** (`env.dom`); `env.microbialLoop(dt)`
has heterotrophic bacteria decompose it at **`MICROBE.BACT × Q10(tempAt) × O₂-Monod`** — **consuming O₂** (bacterial
respiration) and **remineralizing** the bound N (→ ammonium) + P (→ phosphate), Redfield-split by `NUTRIENT.ORGANIC_P`.
- `config.js MICROBE` (BACT 0.05, Q10 2.3, REF_TEMP 20, O2_HALF 0.10, O2_COST 0.6, DIFFUSE 0.10, START 0).
- `environment.js`: `this.dom` field + `addDOM`/`domAt`/`meanDOM`; `microbialLoop(dt)` (Q10 hoisted per-row; O₂-Monod
  per-cell); called in `_updateFields` **after** the benthic O₂ demand and **before** sedimentP/nitrogenCycle (so the
  freed P/N feed them) and before surface re-aeration; toJSON/load serialize `dom` (older saves default it to 0).
- `world.js`: detritus expiry → `env.addDOM(FROM_DETRITUS)` (was `addNutrient`); `dom` added to `envDetail`/
  `depthProfile`/`series`; **save version 10→11.**
- Dashboards: an **"organic matter"** env row + a **DOM trace** in the Water-column profile (+ legend) + a `dom`
  column in `balance.mjs`.
**Verified:** `npm test` green — **174 checks (147 headless + 27 smoke)**, +7 microbial probes; 0 fail. Determinism
**byte-identical** (the loop is RNG-free; save grew 2.44M→2.51M chars only because `dom` is now serialized).
- Mechanism probes: **Q10** (warm decomposes faster than cold), **O₂-Monod** (oxic faster than anoxic → DOM lingers in
  the dead zone), **consumes O₂ + releases nh4/P**, and **exact mass conservation** (`dom+nh4+phos = 0.300000`).
- Emergent: **DOM accumulates in the cold/hypoxic deep ≫ surface** (deep 0.455 vs surface 0.000) — realistic
  hypolimnetic organic build-up.
- **3-yr balance: ✓ no extinction**, CV + immigration-dependence **unchanged from the food-web-rebalance baseline**
  (minnow CV 0.80, imm 4% / sunfish 12% / catfish 2% / carp 10% / bass 69% / pike 47%); O₂avg 0.84–0.94 healthy.
- **Adversarially reviewed** (workflow, 4 lenses — conservation / determinism / ecology-O₂ / save-load — find→verify):
  **0 findings.**
- **Live preview confirmed** (Claude_Preview MCP): the "organic matter" row renders and climbs (0.00→0.01 as detritus
  dissolves), the Water-column legend shows `…cyano, DOM`, no console errors.
**Decisions:** routed **detritus only** through the loop this slice (the named target); deliberately left the tuned
phyto/cyano autolysis recycle as instant (routing the dominant phyto flux through a slow pool is the risky part — a
candidate for a later "full microbial loop"). Kept the existing `ENV.O2_SED` benthic demand AS-IS — the microbial O₂
demand is **additive but self-throttling** (its O₂-Monod → 0 as O₂ → 0, so it CANNOT deepen the dead zone), confirmed
by the review + the healthy O₂avg.
**Next:** the slow benthic-mineralization end pairs naturally with the planned **visible sediment-ooze layer**; or
pick a different "Next up" item. **Also newly on ROADMAP (human-flagged):** *Temporal realism* — the day:season:year:
lifespan **ratios** are unrealistic (a year = ~6 days; fish die in <0.15 yr) and should be re-based on real units at 1×.
**Risks/notes:** DOM can pool deep (deep cell ~0.45) — bounded & finite (probed), and the self-throttling O₂ demand
keeps it from runaway anoxia; if a future time-rebalance changes rates, re-tune `MICROBE.BACT`/`O2_COST` with it.

### 2026-06-15 — Food-web rebalance: planktivore facultative omnivory (more trophic levels self-sustain)
**Did:** Completed what Phase 5 exposed — the lake was catfish-leaning, the planktivores boom-busted, and the
predators leaned on immigration. The realistic, high-leverage fix: **planktivore facultative omnivory.**
- `world.js` feeding + `config.js PLANKTON.FALLBACK_*`: when a hungry minnow/sunfish (energy < `cap×0.85`) finds no
  zooplankton, it grazes the **phytoplankton field directly** (`env.grazePhyto`) at an efficient low ration
  (`FALLBACK_GRAZE` 0.022 × `FALLBACK_VALUE` 4.2). Real planktivorous fish ARE facultative phyto grazers; this lets
  them **self-sustain through the boom-bust trough** instead of starving to the refuge — which steadies the forage
  base AND the predators above it. Tuned over 4 balance runs: a generous gate (`cap×0.85`) self-sustains them best;
  a *small, efficient* graze (0.022 × 4.2) gets that rebalance WITHOUT scouring the phyto base.
**Verified:** `npm test` green — **167 checks (140 headless + 27 smoke)**, +1 rebalance probe (minnow now
home-bred ≫ immigrants). Determinism byte-identical (the fallback is a deterministic feeding branch, no RNG).
**Balance (3 yr): ✓ no extinction, and a genuinely rebalanced web:**
- **Immigration dependence collapsed:** minnow 13%→**4%**, sunfish 39%→**14%**, carp 26%→**6%**, catfish **0%** —
  **four species now self-sustain** (was 2–3). Only bass 66% / pike 38% lean on immigration — the honest, realistic
  small-lake apex truth (improved from 75%/44%).
- **Steadier + fuller:** minnow CV **1.26→0.80** (mean 35→**107**), sunfish mean 15→**46**, catfish steady (CV 0.30);
  total range now 37→482.
- **Phyto preserved:** the efficient ration spares the base — **live daytime phyto reads ~45%** (blooming to field-max
  0.81), and the lake runs full (425 fish, all six species abundant in a spring bloom).
**Decisions:** chose the generous energy gate (`cap×0.85`, lets them reproduce on phyto) over a pure survival ration
(`reproEnergy×0.8`) — the generous gate self-sustains them far better (the slice's goal); the *efficiency* knob
(small graze, high conversion) is what keeps it from tanking phyto. Did NOT add a predator fallback — bass/pike
leaning on immigration is realistic for apex predators in a small lake, and the rebalance already improved them.
**Next:** if you want bass/pike to self-sustain too, a **predator fallback** (hungry piscivores eat zooplankton when
fish-prey is scarce) or a small predator-energetics ease is the lever. Otherwise the web is now a balanced,
self-sustaining community. **Risks/notes:** the fallback grazes phyto — if a future change makes phyto too scarce,
the planktivores would over-graze it; the `FALLBACK_GRAZE`/`VALUE` knobs (small/efficient) guard against that.

### 2026-06-15 — Phyto base + History chart + Phase-5 adversarial-review fixes
**Did:** Three things off a human's live observation ("phyto/cyano sit at ~0; are the dots the phytoplankton?") plus
the Phase-5 review.
- **Explained + boosted the phyto base.** The dots are zooplankton/detritus/fish/stars, NOT phyto (an invisible
  field). Phyto reads low because (a) it's grazed + diel (no growth at night) and (b) it had thinned under cyano
  P-competition + the Phase-5 grazing pressure. Raised `FLOW.NUTRIENT` 1.3→1.7 and `PHYTO.GROW` 0.85→0.95 → daytime
  phyto now reads ~30–36% (verified live), bottoming at night (correct diel behavior).
- **Added phyto + cyano to the History chart.** `world.series` now samples `phyto/cyano/zoo`; `ui.js _charts` plots
  phyto+cyano as dashed green/teal lines in the env band (smoke stub gained `setLineDash`). So the algae are now
  watchable cycling, not just a single twitchy %.
- **Phase-5 adversarial review (5-lens, 17 agents): 12 findings → 9 confirmed, all addressed.**
  - [medium, REAL BUG] the REFUGE no-extinction guarantee could break near `GLOBAL_MAX` — the cap guard used
    `this.agents.length` (DEAD-inclusive, pre-compaction), so a near-cap die-off could falsely block the refuge →
    a species ending extinct. **Fixed:** gate immigration on a LIVE count (`liveTotal` = Σ counts + newborns).
  - [high, test-rigor] the "gentle TRICKLE not a hard floor" probe was vacuous (afterOne ≤ 3 structurally vs a
    threshold of 47 — passed even if RATE=1000 or the trickle were deleted). **Rewrote** it: assert `≥ REFUGE` and
    `≤ REFUGE+1` (the true one-step ceiling) + gradual recovery with immigrants accruing.
  - [medium, test-gap] no GATE probe pinned the no-extinction invariant. **Added** a multi-species-wipe probe
    (wipe minnow/sunfish/bass/pike → 1 step → every species ≥ `IMMIGRATION.REFUGE`).
  - [medium, overstated claim] the lowered planktivore K barely engages (area-scaled K sits above the food-driven
    peak), so "steadier oscillation" was wrong — the boom-bust is FOOD/season-driven. **Fixed the comments** to be
    honest + **added a per-species CV metric** to `balance.mjs` so steadiness is measured (minnow CV 1.26, pike 0.25).
  - [low/info] immigrants now inherit the source's **trait genes** (`mutateGenes(src.genes)`) and enter as **adults**
    (consistent with cold-start/addAgent), not random-gened juveniles. Removed the dead `SEED_FROM_BEST_CHANCE` export.
**Verified:** `npm test` green — **166 checks (139 headless + 27 smoke)**, determinism byte-identical. **Balance
(3 yr): ✓ no extinction**, catfish recovered (mean 34, max 110), dependence intact (catfish 2% / minnow 13% immigrant),
CV metric now reported. **Live preview:** dashboard reads phyto 36% / cyano 45% scum on a summer day; the depth view
+ chart render. **Decisions:** kept the phyto boost modest (a bigger nutrient bump risks eutrophication/O₂ crashes);
the phyto base is inherently grazed/diel-cyclic, so the CHART + explanation (not just a bigger number) are the real fix.
**Next:** see the research/scenario **north-star** + the "lower trophic web as NN agents" note added to ROADMAP.md.
**Risks/notes:** immigrants-as-adults makes rescue a bit stronger (re-verified stable). The minnow boom-bust (CV 1.26)
is food-driven — damping it needs the food base (a future food-web rebalance), not the logistic K.

### 2026-06-15 — Phase 5: carrying capacity — retire the hard re-seed floors (logistic + immigration rescue)
**Did:** Replaced the two artificial population overrides (the hard re-seed **floor** + the hard repro **cap**) with
real ecology — the biggest standing realism debt.
- **Diagnosed first** (a scratch run with floors disabled, 3 yr): catfish/carp self-sustain; minnow/sunfish
  **boom-bust** (1↔218, tracking the volatile zooplankton); bass/pike are **chronically near-extinct** (96% of the
  time at ≤1). So "just delete the floors" gives a sparse, apex-collapsed lake — the floors were masking a real
  food-web truth. The fix is two ecological mechanisms, not a deletion.
- **Logistic density-dependent reproduction** (`world.js`): the chance of breeding when eligible now tapers smoothly
  to 0 as a species nears its carrying capacity K (= `popMax`) — `rand() < (1 − N/K)` — replacing the hard cap
  cutoff and damping the boom.
- **Metapopulation immigration / the rescue effect** (`config.js IMMIGRATION`, `world.js`): the old "snap to a hard
  floor every step" is replaced by a stochastic trickle of immigrants from connected waters whose rate **rises as a
  species gets rare** (below `RESCUE_N`=8) and **tapers to 0 above it** — so self-sustainers float free of it. A
  tiny `REFUGE`=2 quasi-extinction backstop guarantees no literal vanishing (≪ the old floors of ~24–47). Immigrants
  arrive from a lake margin seeded from the current best (preserve learned behavior). New `stats.immigrants` tracks
  the dependence separately from home-bred `stats.births`.
- **Stabilization tune** (paradox of enrichment): lowered the planktivore K (minnow `pop.max` 60→30, sunfish 28→18)
  so a smaller boom → a shallower crash → a steadier oscillation (total range tightened 30–437 → **49–393**).
**Verified:** `npm test` green — **165 checks (138 headless + 27 smoke)**, +5 Phase-5 probes (immigration is a gentle
TRICKLE not a hard floor [minnow 2 after 1 step ≪ old floor 47]; the rescue recovers a crashed species; a
self-sustainer [catfish] is mostly home-bred [0% immigrant]; immigrants tracked separately). Also hardened the
fragile **catfish-nocturnal** probe (its noisy emergent-population aggregate broke under the new trajectory) into a
deterministic mechanism test. **Determinism byte-identical.** **Balance (3 yr): ✓ no extinction** (every species
min ≥2 via the refuge); **the dependence is transformed** vs the old "100% re-seed wallpaper": **catfish 0% / carp 0%
/ minnow 19% immigrant** (now genuinely self-sustaining; carp maxGen 76, catfish 75), while sunfish 57% / pike 66% /
**bass 87%** lean on immigration — the honest truth that a small lake's squeezed/apex species need connectivity.
**Decisions:** kept a minimal REFUGE=2 (a quasi-extinction backstop, not a population target — 1/20th the old floor)
because the strict no-extinction gate needs a guarantee against momentary 0s in the deep boom-bust troughs. `RESCUE_N`
/`RATE` trade "populated lake" vs "pure self-determination"; chose 8/2.0 to keep the lake reasonably full. The
catfish/carp dominance + immigration-supported predators are the emergent food-web truth (the floors masked it).
**Next:** a **food-web rebalancing** pass so more trophic levels self-sustain without immigration would be the natural
follow-up (stabilize the zooplankton oscillator, or give planktivores a fallback food in the trough, or re-tune
predator energetics). The mechanism is now in place to support it. **Risks/notes:** the lake is more variable/sparser
in the planktivore-crash troughs than the old floored version (realistic). If a species ever truly collapses, raise
`IMMIGRATION.RATE`/`RESCUE_N` or `REFUGE`. **A human should watch a full boom-bust cycle** to judge whether the
variability reads well as a living lake.

### 2026-06-14 — Depth water-column view (make the chemistry visible)
**Did:** Added a limnological **depth-profile panel** — the payoff that makes all the recent invisible chemistry
legible. A new "Water column" rail card plots **temp / O₂ / N / P / phyto / cyano vs depth** (surface→bed) down
the column **under the camera** (pan to compare the littoral shelf vs the deep basin), over a sunlit→abyss backdrop
→ the thermocline, the hypoxic deep, the nutricline, and the buoyant surface scum all read at a glance.
- `world.js depthProfile(x, n=28)` — a **pure, headless-tested accessor**: samples surface→bed, each point carrying
  `{frac, y, tempC, o2, din, phos, phyto, cyano, light}` (reads the env accessors; no mutation).
- `ui.js _depthProfile()` (called in `frame()`) draws the normalized colored traces + a water-column gradient +
  labels (column zone, surface/bed, % deep); `index.html` a "Water column" card + colored legend; `styles.css`
  `#depthprofile`/`.dplegend`/`.cardsub`. Browser-only (DOM in the UI layer); pure split intact.
**Verified:** `npm test` green — **160 checks (133 headless + 27 smoke)**, +4 depthProfile probes (finite
surface→bed column of the right length; ordered within the basin; reflects stratification + light attenuation
[temp 28→18°C, light 0.30→0.01 deep]; samples the right column [deep-basin bed deeper than the littoral shelf]).
Smoke draws the panel without throwing. **Determinism byte-identical** (pure read + render — the sim digest is
unchanged 2040086). **Live preview (screenshot confirmed):** the Water-column card renders the multi-trace depth
profile with the legend, beside the full chemistry dashboard (stratified 89%, deep O₂ 44%, nitrate 84%, cyano 36%).
**Decisions:** the column samples under the camera centre (interactive — different profiles littoral vs deep). This
is a pure read/render feature (no sim mutation, no mass-balance, no new RNG), so it's verified by the headless
accessor probes + smoke + a visual screenshot rather than a full adversarial workflow (proportionate to the risk).
**Next:** the biggest remaining realism debt is **Phase-5 carrying capacity** (retire the re-seed floors), or a
visible/dramatic slice (**cross-boundary life** — herons/kingfishers diving from above), or the **microbial loop**.
**Risks/notes:** the profile normalization uses fixed ranges (temp 5–32°C, O₂ /1.2, N /1.5, P /0.3) — if a future
tuning pushes a field past its range it just clamps at the panel edge (cosmetic).

### 2026-06-14 — Fish "twitch" — data-driven diagnosis + facing-flip easing (⏳ pending human visual confirm)
**Did:** The human reported fish *still* twitching after all the prior motion fixes. Instead of guessing again, I
instrumented the sim and measured the actual motion over 600 steps × ~360 fish:
- **Sim heading is now smooth** — mean Δ 0.017 rad/step, turn-reversals rare (0.1%), near-vertical no worse than
  elsewhere. So the *steering* (NN + innate ethogram + edge/wall handling) is NOT the twitch anymore; the prior
  fixes worked. (This rules out the depth-home near-vertical discontinuity as the active cause — measured, not assumed.)
- **The culprit is the render FACING mirror-flip.** When a fish crosses between leftward/rightward swimming,
  `render.js _fish` flipped its sprite **instantaneously** (a hard belly/dorsal mirror). That's ~1 flip / 10 s per
  fish — but across ~360 fish it's **~38 instant sprite-snaps per second** scattered over the screen,
  **minnow-dominated** (492 of 763). A constant sprinkle of one-frame snaps reads exactly as "twitch."
- **Fix (render-only):** the facing flip now **eases through a quick ~0.15 s belly-roll** (`a.facing` eased toward
  the hysteresis target, min-thickness floor) instead of snapping — a direction change reads as a natural bank/roll.
**Verified:** smoke green, no console errors, determinism unaffected (render-only — the sim digest is byte-identical
2040086 before & after). **NOT yet visually confirmed** — the preview throttles rAF when backgrounded so the
screenshot timed out; **the human needs to watch the live sim and confirm the twitch is reduced.**
**Decisions:** chose the data-supported render fix over more sim changes (the data showed sim heading is smooth, so
changing the ethogram would be a guess that also risks balance). The belly-roll rate/floor are tunable
(`render.js _fish`, the `rdt*16` ease + `0.14` floor) if it reads too "rolly."
**Next (if residual twitch remains):** damp the minnow schooling-cohesion steer (minnows flip the most), then smooth
the latent depth-home near-vertical discontinuity (`world.js:330`, the `cos>=0?0.7:-0.7` hard flip — real rough edge,
but the data says it's not the active cause, so it needs a balance re-verify if touched).
**Risks/notes:** the eased facing briefly thins a fish to a near-edge-on sliver mid-roll (natural for a banking fish);
if the human dislikes it, raise the `0.14` floor or speed the ease.

### 2026-06-14 — Cyanobacteria: the N-fixing strain (the N-cycle's emergent payoff)
**Did:** Added a second producer field that pays off the whole biogeochemistry cluster — cyanobacteria that
**win at low N : high P**, the exact regime the N-cycle's denitrification creates.
- `config.js CYANO`: a 2nd phytoplankton strain. `environment.js`: `this.cyano` Float32Array + `env.cyanobacteria(dt)`
  (called in `_updateFields` right after the green-phyto loop). Its ecology differs deliberately: growth is
  **light × P-Monod × warmth with NO N-Monod** (it FIXES its own N → not N-limited, its edge at low N:P); it draws
  the **same phosphate** as green phyto (competition — green phyto is faster so out-draws it when N is plentiful,
  stalls and frees P when N is scarce); it is **buoyant** (floats up one row/step in calm water → a surface SCUM,
  mass-conservatively capped so it backs up rather than exceeding CAP; storms mix it down); it shades the water
  (turbidity), makes/uses O₂ (a scum die-off → O₂ crash), and **leaks fixed N to ammonium** (`FIX_N`) → a net N
  source that counteracts denitrification (the self-regulating end of the N cycle). `meanCyano()`/`cyanoAt()`.
- `world.js`: `envDetail.cyano`, `biomassByTrophic.cyanobacteria`, save **version 9→10**. `ui.js`/`index.html`:
  a **"cyanobacteria"** dashboard row (surface-scum %, "scum" tag when dense). `render.js`: a **blue-green surface
  scum** band hugging the water surface, per-column opacity/thickness ∝ top-row cyano, gentle real-time sway
  (cosmetic, no sim RNG), dimming with ambient light. `test/balance.mjs`: a `cyno` column.
**Verified:** `npm test` green — **155 checks (128 headless + 27 smoke)**, +9 cyano probes: the field exists;
**N-independence** (grows with ZERO inorganic N where green phyto can't — the defining trait); draws down the
shared P; **leaks fixed N** (nh4 0→0.0015); **buoyant** (surface > deep; a storm mixes the scum down); **warm-water
bloomer** (warm > cold); and the headline **emergent competition** — in an N-poor lake the cyano:phyto share is
**~300× higher** than in an N-rich lake ("cyano wins at low N:P"); field stays bounded/finite. **Determinism
byte-identical.** **Balance (2-yr):** **no extinction**, web stable; cyano shows the intended seasonal succession —
blooms warm spring/summer/autumn (surface scum 0.3–0.6), **vanishes in winter** (0.000, the warm-water cutoff),
alternating with green phyto; N abundant, P the limiter throughout. **Live preview:** dashboard reads
**"CYANOBACTERIA 49% scum"** (+ nitrate/sediment-P/phyto rows); smoke draws the scum band without throwing.
**Adversarial review (5-lens workflow, 11 agents):** 6 findings → **2 confirmed, both TEST-RIGOR (the shipped sim
code is correct — review verified determinism, [0,CAP] bounds, the mass-conserving buoyancy transfer, purity,
no runaway, and that the scum render IS exercised by smoke).** Fixed both: (1) [medium] the emergent-competition
probe used a cyano/phyto *ratio* that passed for the wrong reason — green phyto collapses to ~0 in the N-poor lake
regardless of cyano, so the ratio exploded even if cyano were dead (reviewer proved a broken N-limited cyano still
passed). Replaced with **absolute-biomass guards** (`meanCyano(loN) > 0.3 && ≥ meanCyano(hiN)` + the phyto-collapse
asymmetry) that genuinely fail a broken N-fixer. (2) [low] the buoyancy surf>deep probe was tautological (light-driven
growth already favours the surface, so it passed with buoyancy OFF) → made it a **surface-FRACTION calm-vs-storm
isolation** that cancels the growth gradient. The 4 dismissals were correct — notably the reviewer *disproved* a
"niche never engages" worry: under natural dynamics green phyto is N-limited in ~6–8% of the photic/scum cells
(per-cell, not the lakewide mean), so cyano's low-N:P niche fires emergently, not just in the forced test.
**Decisions:** cyano is intentionally UNGRAZED (zooplankton/mussels still graze only green phyto — realistic, and
it lets the bloom persist) and a slower grower than green phyto (its edge is N-fixation, not speed) → the
competition is purely emergent from shared-P + N-independence + the faster green competitor. The buoyancy transfer
caps the receiving cell (mass-conserving) so a saturated scum backs up instead of exceeding CAP.
**Next:** a **depth cross-section / water-chemistry view** (Phase 6 — visualize all the now-rich fields by depth),
the **microbial loop** (detritus→DOM→Q10 bacterial O₂ demand), or **retire the re-seed floors** (the big Phase-5
carrying-capacity debt). **Risks/notes:** cyano blooms are frequent/large (warm+calm+P) — if they ever
over-shade and crash green phyto→zoo→planktivores, lower `CYANO.GROW`/raise `CYANO.DECAY` or make it grazeable;
balance currently healthy (no extinction). The scum render is cosmetic; **a human should eyeball a warm-season
bloom** to confirm the scum *looks* right (the camera fought a forced-bloom screenshot; dashboard + smoke confirm
it renders).

### 2026-06-14 — Nitrogen cycle: nitrification ⇌ denitrification (the biogeochem cluster's keystone N piece)
**Did:** Split the single inorganic-N pool into **ammonium + nitrate** and added the two N-cycle fluxes that
pair with the anoxic sediment + N/P split we already model.
- `config.js NCYCLE`: rates/thresholds for nitrification + denitrification, and `NH4_START`/`NO3_START`
  (sum to the old `N_START` 0.60 so the lake's N budget is unchanged at t0).
- `environment.js`: `this.din` → **`this.nh4`** (ammonium — reduced, from decomposition/inflow, phyto-preferred)
  + **`this.no3`** (nitrate — oxidized). New `env.nitrogenCycle(dt)` (called in `_updateFields` before
  re-aeration): **nitrification** NH₄→NO₃ is aerobic (O₂-Monod-gated) and **consumes O₂**; **denitrification**
  NO₃→N₂ runs only where O₂ < threshold (the anoxic deep/sediment) and **permanently removes N** (the
  irreversible sink that keeps **P the ultimate limiter**). Liebig N-Monod now reads `nh4+no3`; recycling
  returns ammonium; uptake/`takeNutrient` draw ammonium-first then nitrate; `addNutrient` adds N as ammonium.
  Both pools diffuse + bury. New accessors `meanNh4/meanNo3/nh4At/no3At/nitrateFrac`; `meanDin/dinAt` kept
  (= nh4+no3 total) so world/UI consumers are untouched. Save **version 8→9** (serializes `nh4`+`no3`; loads
  v7/v8 `din` by splitting half/half, and legacy `nut`).
- `world.js`: `envDetail` adds `ammonium/nitrate/nitrateFrac`. `ui.js`/`index.html`: a new **"nitrate (of N)"**
  dashboard row (% of inorganic N held as nitrate — the nitrification signature). `test/balance.mjs`: added
  **N** + **NO₃%** columns for tuning.
**Verified:** `npm test` green — **146 checks (119 headless + 27 smoke)**, +13 new N-cycle probes:
nitrification oxidizes nh4→no3, **conserves total N** (form-only, to 1e-6) and **consumes O₂**; **denitrification**
removes nitrate and **drops ΣN** (the permanent sink, 0.500→0.459 in the anoxic-field probe); the **redox gate**
**halts nitrification** below the anoxic threshold (nh4 untouched at sub-threshold O₂ 0.20 AND at 0.0) while
denitrification still runs; over a run the oxic lake **builds a nitrate pool** (NO₃ frac 0.50→0.70) and **stays
P-limited**; pools non-negative/finite. **Determinism byte-identical** (zero RNG in the N path). Save/load
full-content round-trip covers nh4/no3.
**Adversarial review (5-lens workflow, 9 agents):** 4 findings → **2 confirmed, both fixed**. (1) [medium]
the original O₂-Monod (`NITRIF_O2_HALF` 0.30) was too gentle — nitrification kept drawing O₂ at 25–45% rate
through the 0.10–0.25 hypoxic band, so it **did** deepen the summer dead zone (A/B: deep O₂→0.000 vs 0.37 with
the N-cycle no-op'd), contradicting the "never deepens the dead zone" comment, and the guarding test only
checked the degenerate o2=0. **Fixed** → a **hard redox gate**: nitrification runs only at `O₂ ≥ DENITRIF_O2`,
denitrification only below — mutually exclusive at the SAME 0.25 cline the sediment-P Mortimer switch uses (one
coherent redox boundary). So nitrification now adds O₂ demand only in the oxygenated column and **halts in the
dead zone** (the deep floor stays governed by the benthic sediment demand) — both honest and more faithful.
Added a **partial-hypoxia probe** (o2=0.20) that the old smooth-Monod form would have failed. (2) [info] the
N-conservation test tolerance was 1e-3 (only caught >5% leaks) → tightened to **1e-6** (≈13× the measured
Float32 drift 7.5e-8, catches <0.01%-of-flux leaks). Two findings correctly **dismissed** (the `NUTRIENT.DECAY`
burial sink is intended/documented; a coverage nicety already exercised end-to-end).
**Balance:** 3-yr → **no extinction**, O₂ healthy (avgO2 0.34 summer-low→0.97; the summer-deep O2min 0.00 is the
*pre-existing* seasonal dead zone — nitrification's O₂-Monod correctly did **not** worsen it), P stays the
limiter (phosphate 0.10–0.18), catfish evolving (maxGen 68). 2-yr (new columns): **N stays abundant**
(0.60→~1.1, never crashes — denitrification doesn't drain the lake), nitrate fraction settles **~80–88%**
(realistic oxic-lake nitrate dominance). **Live preview (Claude_Preview):** the dashboard reads **"61% NO₃"**
(risen from the 50% start via live nitrification) + "N 0.63 · P 0.08 (P-lim)" — the N-cycle is running in-browser.
**Decisions:** kept the full nh4/no3 split (not a single-pool approximation) because it's the correct model AND
the clean setup for cyanobacteria (low-N:P N-fixers) — nitrification needs a product pool distinct from the
substrate denitrification consumes. Inflow N enters as ammonium so the whole NH₄→NO₃→N₂(lost) pipeline is
emergent. The generic `NUTRIENT.DECAY` is now pure burial (active N removal is the explicit denitrification).
**Next:** **cyanobacteria** (now unblocked — the denitrification N-sink creates the low-N:P niche they exploit),
then the microbial loop / pH-CO₂, then a depth water-chemistry view.
**Risks/notes:** N rises then plateaus over years (inflow ≈ denitrification+burial; meanDin oscillates ~0.8–1.1,
never drains or runs away) and stays firmly P-limited, so it's harmless; if it ever needs capping, raise
`NCYCLE.DENITRIF` or `NUTRIENT.DECAY` a touch. Nitrification adds an O₂ demand in the **oxygenated** column only
(the redox gate halts it below `DENITRIF_O2`, so it can't draw down the dead zone) — watch `NCYCLE.NITRIF_O2_COST`
if a future change makes the epilimnion hypoxic. The gate shares the 0.25 threshold with `SED_P.O2_THRESH`; if you
retune one redox cline, consider the other. `act.in` indices unchanged (no sensor add → no genome-length reseed;
champion brains still load).

### 2026-06-14 — Sediment-P internal loading (Mortimer redox switch)
**Did:** Added the classic internal-eutrophication feedback, reusing the summer dead zone we already model.
- `config.js SED_P`, `environment.js`: a per-column benthic P store `env.sedP` + `env.sedimentP(dt)` (called
  in `_updateFields`). Settling organic P feeds the store; while the bottom is **oxic** the sediment **binds**
  dissolved P (sequesters it); when the bottom goes **anoxic** (`o2 < SED_P.O2_THRESH`, the summer hypolimnion)
  it **releases** iron-bound P back into the water — internal loading. `SED_P.MAX` caps the store. Pure/
  deterministic. `world.envDetail` + the UI dashboard show "sediment P"; save **version 7→8**.
**Verified:** `npm test` green — **134 checks** (store exists; OXIC binds P [store↑, water P↓]; ANOXIC
releases P [store 1.2→0.86, water P 0.05→0.39]; bounded & finite). Determinism byte-identical. Balance
(3-yr): **no extinction, stable — NOT runaway**: the sediment store cycles seasonally (0.62–2.28, capped at
4.0), phyto stays healthy (≤0.31), and internal loading slightly *boosts* productivity (minnow births
5311→5987). **Live build (preview):** full chemistry dashboard now reads surface/deep temp, surface/deep O₂,
stratified%, clarity, Secchi, **N·P (P-lim), sediment P**, phyto — a real limnological panel.
**Decisions:** the redox switch reuses the existing summer anoxia (no new O₂ machinery). Kept it as a
benthic-water exchange (releases into the bottom cell), so the freed P reaches the photic zone via
diffusion/turnover — realistic (deep P fuels turnover/spring blooms). Did NOT add a sediment-P render layer
(it's subsurface; shown in the dashboard).
**Next:** the N-cycle (nitrification/denitrification), cyanobacteria (N-fixers at low N:P), a depth
cross-section / water-chemistry view, or pH/CO₂. **Risks/notes:** if internal loading ever runs away
(P climbing each year), lower `SED_P.RELEASE`/`SETTLE` or `SED_P.MAX`; currently self-limiting & stable.

### 2026-06-14 — N/P nutrient split (the keystone biogeochemistry advance)
**Did:** Replaced the single pooled nutrient with two pools and Liebig co-limitation — the foundation of
the whole water-chemistry cluster.
- `environment.js`: `this.nut` → `this.din` (dissolved inorganic N) + `this.phos` (phosphate). Phyto/plant
  growth is now **Liebig co-limited** = `min(din/(din+KN), phos/(phos+KP))`. `nutrientAt` returns that
  [0,1] availability; `addNutrient(x,y,amt,pFrac)` splits N+P (default organic/Redfield, inflow P-rich);
  `takeNutrient` draws both. New `dinAt/phosAt/meanDin/meanPhos`. Both pools diffuse + decay; the **inflow
  is P-enriched** (runoff) — the eutrophication driver. `config.js` `NUTRIENT` gained `N_START/P_START/
  KN/KP/ORGANIC_P/INFLOW_P`; `PHYTO` `NUTRIENT_USE` → `P_USE`+`N_USE`.
- `world.js`: `avgNutrient` = N+P total; `envDetail` adds `nitrogen/phosphate/limiting`. Save **version
  6→7** (env now serializes `din`+`phos`; load splits an old `nut` save organic-ratio). `ui.js` env panel
  shows **"N x · P y (P-lim)"**.
**The tuning fight (worth noting):** the naive split DRAINED the lake — `NUTRIENT.DECAY` (a per-cell sink)
dwarfed the local inflow, so global P → ~0.01, phyto crashed, zoo nearly collapsed, planktivore births fell
to ~550. Fix: lakes conserve nutrients (long residence) → cut `DECAY` 0.02→0.002 + efficient `RECYCLE` 0.7,
and set P uptake ≈ its recycle so P is internally conserved at a low **P-limited** equilibrium. Result:
meanP 0.047 (P-Monod 0.32) ≪ N abundant (N-Monod 0.78), web sustained.
**Verified:** `npm test` green — **130 checks** (N+P pools exist; growth is Liebig [0,1]; **P is the
limiter**; the P-enriched inflow raises littoral P; a **phosphate spike drives a bigger bloom**, control
0.54 → 0.70, drawing P down). Determinism byte-identical. **Adversarial review (background agent)** read all
5 files + ran 12-yr pool tracking, save/load (incl. legacy `nut`), and a 20k-step zero-pool NaN/negative
stress test → **NO high/medium issues**; confirmed determinism (zero RNG in the N/P path), no DOM, correct
Liebig math, consistent uptake/recycle splits, no NaN/negatives, correct save/load. Two LOW findings, both
fixed: (LOW-2) a test hardcoded KP — now uses `NUTRIENT.KP/KN`; (LOW-1) long-run phyto settled too low
(~0.02–0.03 oligotrophic) → **raised `FLOW.NUTRIENT` 0.5→1.3** (sets the trophic state). Result: steady
phyto peaks ~0.31, **planktivore births minnow 5311 / sunfish 2426** (healthy, mesotrophic), still
P-limited (P-Monod 0.47 < N-Monod 0.77), eutrophication intact. **Live build:** env panel shows
`N · P (P-lim)`, phyto + zoo alive, no console errors.
**Decisions:** P is the limiting nutrient (realistic); `FLOW.NUTRIENT` now sets the lake's trophic state
(1.3 = mesotrophic/lively; lower = oligotrophic). Did NOT add the N-cycle/cyanobacteria/sediment-P yet —
those are now UNLOCKED follow-ups.
**Next:** sediment-P internal loading (hypoxia→P release feedback), the N-cycle, cyanobacteria, or a
water-chemistry dashboard. **Risks/notes:** the nutrient budget is sensitive — if a future change destabilises
phyto, check `NUTRIENT.DECAY` (global sink) and `P_USE` vs `RECYCLE·ORGANIC_P` (internal P balance) first.

### 2026-06-14 — Submerged weed beds + cover-seeking (the cover-seeking redo, done right)
**Did:** Added the missing habitat that makes cover-seeking work, then re-enabled cover-seeking.
- **Submerged weed beds** (`STRUCTURE.WEEDBEDS`, `world.weedbeds`): tall macrophyte cover bands rooted on
  the littoral/drop-off bed that reach UP into **oxygenated mid-water** (deliberately placed off the deep
  hypoxic centre, x within ~0.34 of each shore). They add to `coverAt` (a vertical cover band) and are
  rendered as swaying green weed strands (depth-shaded) + saved (`toJSON`, **version 5→6**).
- **Cover-seeking** (`innate.cover` for sunfish/bass/pike; `world.nearestCover`): a gentle long-range
  attractor steers these fish to the nearest weed bed / reed / log and holds them there → pike lurks at
  weed edges, sunfish hovers in the weeds. Because the cover now lives in oxygenated mid-water, it does
  NOT pull cool-water pike into the hypoxic deep — the exact problem that forced the earlier revert.
**Verified:** `npm test` green — **127 checks** (weed beds generated in lit mid-water not the deep centre;
cover-seekers hold far more cover than non-seeking minnows — **0.25 vs 0.02**). Save/load round-trips the
weed beds. **Determinism byte-identical.** Balance (2-yr): no extinction, all reproduce (pike 938 / sunfish
1763 births), all finite. **Visually confirmed (preview):** tall green weed beds reaching into mid-water
with sunfish & other fish sheltering inside them — looks like a real littoral weed bed. Perf ~340 steps/s
(coverAt now also scans weed beds + cover-seekers do a nearestCover query; still way over the 30/s budget).
**Decisions:** this is the "cover-seeking done right" the previous turn deferred — the key was creating
mid-water cover (real submerged macrophytes) rather than forcing fish to the bed/shore cover. Lowered pike
homeDepth 0.60→0.55 + depthPull 0.30→0.28 so the weed-edge hold reads. Bass births dipped a little
(cover-seeking pulls them off open-water foraging) but bass held at floor — watch if it ever drops.
**Next:** schooling separation/alignment, the depth-home band, or the N/P nutrient split (the big
biogeochemistry piece still queued).
**Risks/notes:** weed beds are static cover only (not grazed/growing like `plants`) — a future pass could
merge them with the macrophyte system. Cover-seeking adds a `nearestCover` O(structures) query per seeker.

### 2026-06-14 — Trait-based mate choice + catfish nocturnality (cover-seeking attempted & reverted)
**Did:** Two clean evolution/behavior slices (user: "do both"); a third attempt was honestly reverted.
- **Trait-based mate choice** (`world.chooseMate`): in reproduction, replaced nearest-eligible `qMate` with
  a scorer over every eligible nearby partner — condition (energy) + mean trait gene + foraging success —
  picking the best. **Sexual selection now acts on the genome.** Deterministic (no RNG); reproduction not
  blocked (still mates if any eligible exists).
- **Catfish nocturnality** (`innate.nocturnal`): the cruise target scales by `1.5 − env.light` (surface
  time-of-day, not the fish's depth-light) → catfish forage faster at night, rest by day. Probe: night 13.5
  vs day 11.7 px/s.
- **Cover-seeking — ATTEMPTED, REVERTED (honest):** tried an innate pull for sunfish/bass/pike toward
  reeds/logs (first a short-range `coverAt` gradient, then a long-range nearest-structure attractor). Both
  failed the behavioral probe (seekers ended with LESS cover than bottom-dwellers who sit on logs) because
  the sim's cover lives at the bed/shore while these fish are depth-locked to mid-water — and pulling pike
  down to bottom logs drops it into summer-hypoxic water it can't tolerate. Reverted cleanly; left a precise
  design note on the roadmap (needs cover in *oxygenated mid-water*). Better than shipping a broken,
  perf-costing feature.
**Verified:** `npm test` green — **124 checks** (mate choice picks the high-quality candidate + doesn't block
repro; catfish night>day; the ambush probe was hardened into a *controlled* isolated-pike lurk test — 0.21
speed-use with no prey — since mate choice changed the population so the old aggregate metric got noisy).
**Determinism byte-identical.** Balance (2-yr): no extinction, evolution healthy (catfish maxGen 55, carp 48);
mate choice doesn't reduce reproduction.
**Decisions:** swapped the failing cover-seeking for catfish nocturnality (a *working* review-flagged v2.1
item) so "do both" still delivered two solid features. Mate-choice scoring weights condition≈1 + 0.6·(mean
gene−1) + 0.003·eaten — tune if it over/under-selects. Cover-seeking stays on the roadmap with the design
lesson. **NB perf** dipped to ~370 steps/s (machine load + chooseMate's forNear scan) — still well over the
30 steps/s budget.
**Next:** cover-seeking done right (cover in oxygenated mid-water), schooling separation/alignment, depth-home
band, or the N/P nutrient split.
**Risks/notes:** mate choice changed the sim trajectory (digest differs) — any test asserting an *aggregate*
behavioral snapshot can get noisy; prefer controlled/isolated probes (as done for the ambush lurk).

### 2026-06-14 — Ethogram v2 (schooling + ambush) + adversarial review
**Did:** Extended the innate ethogram and ran a 5-lens adversarial review over it.
- **Schooling (minnow)** `innate.school`: a cohesion steer toward the local shoal centroid (via
  `allyStats(a,56)`) → loose realistic shoals (~5-7 neighbours within 70px; visually grouped).
- **Ambush (pike)** `innate.ambush`: lurks (eases thrust toward a near-still hold) until the 'prey near'
  sensor crosses a threshold, then bursts. Pike speed-use 0.32 vs minnow 0.43.
- **Adversarial review** (`ethogram-review` workflow, 5 lenses × verify, 27 agents): 22 findings, **14
  confirmed, 1 fix-now, 2 dismissed**. The fix-now (verified by the reviewer, who tested its own fix): the
  ambush was a hard `Math.min` clamp that **replaced** the NN thrust while every other innate term blends —
  violating "modulate, not replace." **Fixed** → now a weighted blend (`thrust += (cruise*0.45 - thrust) *
  ambushW`) so a committed evolved brain can override the lurk; pike still lurk (0.32) and the NN keeps ~40%
  authority. Also corrected a misleading code comment (depth-home "home" is a scaled ramp, not a 6px line of
  full NN control).
**Verified:** `npm test` green — **121 checks** (new: v2 config; minnows cluster ~6.9 neighbours; pike
lurk < minnow speed-use). **Determinism byte-identical.** Balance (3-yr): **no extinction AND every species
evolving** (first run without the wallpaper warning — catfish maxGen 88, carp 57, minnow 42; even bass/pike
show live descendants) — the ethogram + de-crowding help lineages persist in-zone. Pike reproduce healthily
(832 births), survive the stronger ambush (min 7). **Visually confirmed (preview):** a minnow shoal of 11
grouped in the lit shallows; fish layered across the column.
**Decisions:** kept ambush as a *blend* (review's valid invariant point) with a dedicated `ambushW` (default
0.6) so the lurk stays meaningful while the NN can override. Routed the 12 other confirmed (low-sev) findings
to the roadmap — they're great v2.1 ideas: cover-seeking (sunfish/bass/pike), catfish nocturnality, schooling
separation/alignment, depth-home band, absolute minnow home-depth, ambush-index-by-label. The predator-floor
finding is confirmed PRE-EXISTING (Phase-5 carrying-capacity debt), not caused by the ethogram.
**Next:** ethogram v2.1 (cover-seeking is the highest-value — pike lurking in weeds, sunfish holding cover),
or trait-based mate choice, or the N/P nutrient split.
**Risks/notes:** see ROADMAP "Species behavioral baselines" for the full v2.1 list. `act.in[2]` ambush index
is positional — safe only while pike is the lone ambusher (enforce by label before adding ambush elsewhere).

### 2026-06-14 — Species behavioral baselines (innate ethogram under the NN)
**Did:** Gave each species an innate behavioral prior so fish behave like their real counterparts as a
baseline, which the NN modulates — the fix for "make every type of fish behave like it actually does."
- `species.js`: each `SP` gets `innate: { homeDepth, depthPull, cruise, weight }` — minnow shallow/active,
  catfish bottom-hugging/slow, pike mid/lurking (low cruise), etc.
- `world.js` (in the per-agent move step, after edge-avoidance): a **depth-home reflex** steers the fish
  toward `homeDepth × bedY(x)` but **only when displaced** (∝ |vBias|, so at its home depth the brain is
  100% in control — no dilution of the neuroevolution), plus a **cruise nudge** easing thrust toward the
  species norm. `thrust` made `let`; uses only `bedY/clamp/angDiff/atan2` → **no RNG, determinism intact.**
**Verified:** `npm test` green — **118 checks** (new: every species has a sane ethogram; it encodes real
zonation [catfish home 0.92 > minnow 0.22] + activity [pike cruise 0.16 < minnow 0.55]; and the OUTCOME —
after a run, catfish ride at depth 0.95, minnows at 0.33, Δ0.63). **Determinism byte-identical.** Balance
(2-yr): **no extinction, all reproduce** (catfish 4590 / minnow 5883 / pike 896 births), all finite, and a
**clean species depth-stack**: minnow 0.26 (shallow) → bass 0.46 → pike 0.48 → carp 0.92 → catfish 0.98
(bottom). **Visually confirmed (preview):** fish now layer across the whole water column like a real lake
cross-section instead of all crowding one band.
**Decisions:** depth-home only engages when displaced (keeps the NN dominant at home — the project's
"every organism driven by its NN" invariant holds; innate is a *reflex layer*, not a replacement). v1
covers depth + cruise; schooling/cover-seeking/diel/weight-fading are v2 (on the roadmap). Pairs with the
new stats UI which *measures* the zonation (`speciesDetail` litoral/deep counts; click-a-fish shows zone).
**Next:** ethogram v2 (cover-seeking ambush, schooling reinforcement), trait-based mate choice, or the N/P
nutrient split. **Risks/notes:** if a species' `homeDepth` fights its food (e.g. a bottom-locked fish
starves), ease its `depthPull`/`weight`; balance currently healthy. The residual visual "twitch" is now
most likely render-side (facing flip at near-vertical headings) if the human still sees it post-de-crowding.

### 2026-06-14 — Shore-crowding fix (broader littoral) + detailed stats/data UI
**Did:** Two human asks — fish over-grouping at the shore + "show more detail/statistics about everything"
— plus roadmap additions. (Diagnosed first: 67% of fish were in the littoral [carp/catfish ~100%], and the
heading jitter itself is LOW [0.006–0.016 rad/step] → the "twitch" is largely **crowding** in a too-small
shallow band, not a motion bug.)
- **Broadened the littoral shelf** (`config.js BASIN`: `SHELF_T` 0.22→0.34 wider, `SHELF_Y` 0.20→0.25 a bit
  deeper, `SHELF_FRAC` 0.20→0.30) so the littoral is a real zone with room + the food spreads. Shore
  concentration **67%→47%**; basin headless probes updated (broader-shelf sample points) + still green;
  balance fine (no extinction). The user's exact suggestion ("make the shallow areas larger").
- **Detailed stats/data**: pure headless-tested accessors in `world.js` — `envDetail()` (depth-resolved
  temp/O₂ surface·mid·deep, strat, nutrient, phyto, Secchi, clarity), `speciesDetail()` (per-species
  count/maxGen/meanGen/mean genes/energy/age/zonation), `biomassByTrophic()` (a real trophic pyramid:
  planktivore 207 → apex 18). UI surfaced it: **Environment card** now shows deep temp/O₂, stratified %,
  Secchi, nutrient, phytoplankton; **Census** shows live per-species `g{maxGen}·{meanSizeGene}×`; the
  **click-a-fish readout** is now a full inspection — genes, effective body/top-speed, energy/age/diet,
  thermal comfort band (°F), O₂ requirement, and the conditions right where it is.
**Verified:** `npm test` green — **115 checks** (new: envDetail finite depth column; speciesDetail
consistent with census; biomassByTrophic a non-negative trophic spectrum). Determinism byte-identical.
**Visually confirmed (preview):** the expanded Environment dashboard (surface 84°F/deep 77°F, avg O₂
115%/deep 106%, stratified 43%, Secchi 466px…), Census genetics per species, and the rich bass readout all
render; fish visibly less crammed at the shore.
**Roadmap (added all 3 human asks):** **species behavioral baselines** (innate ethogram under the NN —
the real fix for "make every fish behave like its real counterpart"), **comprehensive instrumentation**
(more dashboards/data — this slice is its first installment), **configurable lake morphometry/scenarios**.
See `ROADMAP.md` → "Added from human feedback (2nd pass)".
**Decisions:** chose to build the *stats* slice now (lower-risk, immediately useful, and it lets us SEE
the distributions/genetics that diagnose behavior) and put **behavioral baselines next on the roadmap** —
it's a delicate sim change (blending innate drives with the NN without diluting the neuroevolution core)
that deserves a dedicated, balance-heavy turn. Both are on the roadmap; behavioral baselines is the
recommended next behavior slice.
**Next:** species behavioral baselines (innate per-`SP` drives the NN modulates), OR trait-based mate
choice / N/P split. **Risks/notes:** residual twitch (if any) after de-crowding is most likely the render
body-animation / facing-flip at near-vertical headings — revisit `render.js` `_fish` if the human still
sees it once fish are spread out.

### 2026-06-14 — Multi-gene heritable genome (evolution beyond the brain)
**Did:** Generalized evolution past the brain-only model. New gene helpers in `core.js`
(`randomGenes`/`crossoverGenes`/`mutateGenes`, keys `size`/`speed`/`tol`, range [0.7,1.35], seeded RNG).
- `world.js makeAgent` accepts a `genes` vector and derives **effective per-individual stats**:
  `a.size = sp.size·gSize`, `a.maxSpeed = sp.maxSpeed·gSpeed`, `a.tempTol = sp.tempTol·gTol`,
  `a.o2Crit = sp.o2Crit·(2−gTol)`, and **`a.metabMul`** which folds in the *cost* of being bigger/faster/
  hardier — so traits trade off (a `geneCost`) instead of all maxing out. The step loop uses `a.maxSpeed`
  (speed cap + turn authority), `a.metabMul` (metabolism), `a.tempTol`/`a.o2Crit` (thermal/hypoxia).
- Heritability: children blend parent genes (crossover) + mutate, in BOTH sexual and asexual paths,
  mirroring the existing `hue` trait. Initial/reseed/champion fish get `randomGenes()` near 1.0.
- Persistence: genes serialized as `gn` in `toJSON`; **save version 4→5** (v3/v4 loads default to random
  genes via the existing tolerant path). Render already keys size off `a.size`, so gene-size shows visually.
**Verified:** `npm test` green — **112 checks** (new: gene helpers unit-tested; agents carry genes +
correct effective stats; metabMul cost formula; genes round-trip save/load; a heritable trait varies
across the evolved pop (size-gene spread 0.60); genes stay bounded/finite after a long run). NB float32
storage rounds the clamp bounds slightly → bound checks use a 1e-4 epsilon. **Determinism byte-identical.**
Balance (2- & 3-yr): **no extinction, all finite, healthy reproduction** (catfish 3704 / bass 1190 / pike
966 births) — AND **selection is visibly working**: catfish evolved to **size 0.82 / speed 0.77 / tol 1.28**
(small, slow, hardy = the real thrifty benthic-scavenger strategy). **Live build (preview):** minnow size
genes spread 0.82–1.16 → body 0.57–0.81 px; clean daytime render, no regression.
**Decisions:** v1 = 3 genes (size/speed/tol) — the highest-impact, lowest-plumbing set; acuity needs
`senseRange` threaded through every `senses()` q-call (deferred). All costs route through `metabMul` (no
standalone "efficiency" gene, which would just minimize). Genes use the SEEDED RNG (sim state, must be
deterministic). NO `shape.in` change → the genome-length guard isn't triggered, champion brains still load.
**Next:** trait-based mate choice (select on the genes), then the N/P nutrient split.
**Risks/notes:** size genes are ±35% — not enough to flip trophic levels (cross-species size baselines
dominate), confirmed by no-extinction balance. If a future gene destabilizes predation, widen `metabMul`
costs or narrow `[GENE_MIN,GENE_MAX]`.

### 2026-06-14 — Two visual fixes from a human preview review (godrays + drifting plankton)
**Did:** The human watched the live preview and flagged two things; both fixed.
- **Light shafts looked like hard vertical lines** (`render.js`): the daytime godrays were solid beams
  drawn at constant alpha all the way to the bed. Rewrote them as **soft sunbeams that fade with depth**
  (vertical gradient → 0 by ~the Secchi/photic depth, so shorter in murky water), wider spacing (340),
  a gentle time-based sway (real time, not `core.rand`). Render-only/cosmetic; smoke green.
- **Green zooplankton dots "going into" the sloped sides** (`world.js`): real artifact — plankton drift
  horizontally with the inflow current but their depth `baseY` was never re-clamped to the bed beneath
  them, so a plankter carried from deep water over a rising slope/drop-off ended up **below the bed**
  (embedded in the sediment). Fix: `p.baseY = clamp(p.baseY, 10, bedY(p.x) - 6)` each step → they ride up
  the slope and stay in the water column. Deterministic (no RNG).
**Verified:** `npm test` green — **104 checks** (new probe: after a 60s drift, **0 of ~2025** plankton are
below the bed). Determinism byte-identical. Smoke green. **Visually confirmed in the preview** (tab was
foregrounded): softened godrays read as light not lines; the right drop-off slope is clean of embedded
green dots. Restored the sim to live afterward.
**Notes:** the godray fade-reach is tied to `env.secchiDepth()` (a nice realism tie-in — beams are
shorter when the water is murky).

### 2026-06-14 — Storm-driven mixing (wind breaks stratification)
**Did:** Coupled wind/storms to vertical structure so a summer storm can break the thermocline.
- `config.js` `THERMAL.WIND_EROSION` (0.06); `environment.js` `step()` erodes `strat` by
  `WIND_EROSION × max(0, WIND.WEATHER[weather] − 1)` per second — i.e. **only rain/storm wind (above the
  calm baseline) erodes** (normal breezes don't break a thermocline). The existing strat-gated
  `diffuseO2` + overturn then re-oxygenate the deep automatically. No new field, no RNG, no save change.
- First tried ungated erosion → it weakened the calm-summer dead zone (deep O₂ 0.06→0.45) and broke a
  niche probe; the `max(0, weather−1)` gate fixed it (calm summer back to anoxic, storms still mix).
**Verified:** `npm test` green — **103 checks** (new paired probe: a forced summer storm drops `strat`
below a calm control AND lifts the hypoxic deep O₂ above it, while the calm control stays hypoxic). The
summer-dead-zone + turnover assertions still pass. Determinism byte-identical. **Live build (preview
eval):** from a stratified summer (strat 0.97, deep O₂ 0.25) a forced ~40s storm eroded strat to 0.69 and
**re-oxygenated the deep to 0.51** — confirmed in the running renderer, not just headless.
**Decisions:** gated erosion to rain/storm only (physically: light wind mixes the epilimnion but doesn't
break the thermocline; only storms/fronts do). Kept the optional deep-nutrient entrainment for later.
**Next:** the multi-gene genome (see "Next up").
**Risks/notes:** **screenshot capture is blocked while the preview tab is backgrounded**
(`document.visibilityState==='hidden'` throttles rAF → the screenshot tool times out; `draw()` runs clean
on demand — confirmed). Ask the human to surface the preview tab to capture visuals. Watch
`WIND_EROSION` if storms ever permanently erase the summer dead zone (the calm-summer headless assertion
guards against it).

### 2026-06-14 — Genome-length guard + depth (DVM) senses
**Did:** Built the recommended next slice (emergent diel vertical migration substrate) plus its required
prerequisite guard.
- **Genome-length guard** (`world.js`): new `fitGenome(sp, w)` reseeds any loaded/champion brain whose
  genome length ≠ `genomeLen(sp.shape)` (was a silent **NaN-corruption** trap once any sensor count
  changed — `forward()` indexes past a short genome). Wired into `world.load()` (counts into
  `stats.brainsReseeded`) and `seedFromChampions()`; **`toJSON` version bumped 3→4** (load stays
  back-compatible; `env.load` was already size-tolerant). This unblocked the shape change below.
- **Depth-local senses → DVM** (`species.js` + `world.js`): the four water-column species (minnow,
  sunfish, bass, **pike**) gained two inputs — `light@depth` (`w.lightAt`=`env.lightAtDepth`) and
  `temp@depth` (normalized `w.tempAt`=`env.tempAt`). `shape.in` bumped +2 each with matching labels.
  With the thermal-envelope **cost** built last slice, fish now have the signals to **evolve diel
  vertical migration** (rise to the lit/warm surface at night, sink to the cool thermocline by day;
  pike especially — it can now sense and flee the warm surface that stresses it). Pike's sensing the
  temp it's squeezed by is the point: behavior can now respond to the niche pressure.
**Verified:** `npm test` green — **101 checks** (new: guard reseeds a forged short genome to the right
size with no NaN + only the mismatched brain, not the whole pop; depth-light brighter at surface than
deep; the 4 species carry the senses; senses written & in range — minnow surface @noon reads light 0.93).
The `label==shape.in` assertion auto-covers the +2 shape bumps. **Determinism byte-identical** (run-vs-run;
the absolute serialized size grew 1.42M→1.71M chars because genomes are longer — expected). Balance: a
2-yr run shows **no extinction, all energies finite (guard works), and healthy reproduction** (pike 918 /
catfish 4354 / bass 1253 cumulative non-reseed births); 3-yr `npm run balance` agrees (mins pike 7, bass 13).
**Decisions:** added the senses to the mobile/pelagic guild only (minnow/sunfish/bass/pike); catfish/carp
are bottom-dwellers (kept their `on floor`/`depth` senses). Used world passthroughs `lightAt`/`tempAt`
to keep `senses()` calling world methods (pure split intact). DVM *emergence* is a long-run/human
observation, not something a short balance run proves — the substrate (cost + senses) is what shipped.
**Next:** *storm-driven mixing* (wind breaks stratification), then *multi-gene genome*, then the N/P split.
**Risks/notes:** longer genomes ⇒ slightly slower `forward()` (balance runs noticeably slower; still well
within budget). Old v3 saves & pre-change champion brains now **reseed** for the 4 changed species (by
design — the guard) so their learned behavior for those species resets; catfish/carp brains still load.

### 2026-06-14 — Per-species thermal & O₂ niches + 8-domain realism research pass
**Did:** (A) Ran an 8-domain realism research workflow (water chem, lower food web/inverts, fish
behavior, evolution/life-history, cross-boundary life, hydrology/climate, stochastic events,
display/cinematic) → synthesized ~45 prioritized additions → **adversarially verified against the
actual code** (critic found NO false gaps, endorsed the list, flagged the cross-cutting guards). The
whole backlog (tagged by phase/impact/cost, with build order + guards) is now in **`ROADMAP.md` →
"Realism research backlog"**. (B) Built the critic's #1 recommended slice: **per-species thermal & O₂
tolerance envelopes**.
- **Thermal/O₂ niches** (`species.js` `tempOpt/tempTol/o2Crit` per species; `config.js`
  `ENV.THERMAL_STRESS`; `world.js` metabolism block): outside a species' temperature band, energy drains
  `THERMAL_STRESS`/°C; below its own `o2Crit` the hypoxia drain bites. Guilds: pike = coolwater apex
  (tempOpt 19, o2Crit 0.40 → summer-squeezed); catfish/carp = warmwater, hypoxia-tolerant (tempOpt 26-27,
  o2Crit 0.14-0.16); minnow/sunfish/bass mid. Also **wired in the previously-dead `ENV.HYPOXIA/
  HYPOXIA_SEVERE/HYPOXIA_PENALTY` constants** (world.js had hard-coded the 0.35/0.15/0.10 literals).
- The classic summer **temperature–O₂ squeeze** now emerges: a coolwater fish can use neither the warm
  surface (thermal stress) nor the hypoxic deep (O₂ stress) and gets pinned to the thermocline.
**Verified:** `npm test` green — **96 checks** (5 new niche probes: sane envelopes; a real warm/cool guild
gradient; warm summer surface (33.8°C) stresses pike +5.8°C but catfish 0; the anoxic deep punishes pike
more than carp; all 6 species survive a simulated season). **Determinism byte-identical** (1421800 chars —
ZERO new RNG, no save-format/genome change, so champion brains & v3 saves still load). `npm run balance 3`
→ no extinctions; a 2-yr births probe shows the intended differential: **warm catfish reproduction rose
(3611→4105) while cool pike/bass fell ~20% (pike 1312→1017)** — niches create fitness differences, not
extinctions. pike standing maxGen 9 (still evolving under the squeeze).
**Decisions:** chose this slice (over DVM senses / odor field / storm mixing) because it is the only
top candidate with ZERO RNG, no genome-length change, and no save bump — and it supplies the down-side
cost the next slice (DVM senses) needs. Pure-sim, so no visual change to verify (smoke covers it).
**Next:** the DVM-senses slice (needs the genome-length guard first — see "Next up" #0), then storm mixing
/ multi-gene genome / N-P nutrient split. **Risks/notes:** thermal stress lowers carrying capacity in a
bad stratified summer — kept gentle (`THERMAL_STRESS` 0.0035) + re-seed floors backstop; re-check
`npm run balance` if any `tempOpt`/`o2Crit` is retuned.

### 2026-06-14 — Lake-realism slice + relaxed time + Fahrenheit
**Did:** Shipped all 5 of the human's realism asks plus two new roadmap features, then re-balanced & verified.
- **Swim animation (#1):** `render.js` `_fish` beat `t*(3+spd*0.16)` → `t*(1.1+spd*0.07)` (~⅓ the rate);
  `SpriteCache.FRAMES` 6→10 (smoother cycle); `species.js` `drawFish` undulation `amp` lowered
  (`0.14+0.28·drive` → `0.09+0.20·drive`) and wave freq `1.7`→`1.5`. A slow glide, not a buzz.
- **Depth shading (#2):** new `depthDim(y)` in `render.js` (1.0 at surface → ~0.34 at the bed). Folded into
  the **sprite light bucket** (`env.light*depthDim(a.y)`; `LIGHTS` 4→6, `max` 600→1000 so the finer
  buckets don't thrash) and into the **dot / corpse / plant** lightness. **Water-column gradient**
  strengthened: a sunlit surface band + a steeper ramp into the abyss.
- **Far-zoom legibility (#3):** dot LOD min size 1→2px + higher alpha floor (`0.55+sPx`, min 0.5).
- **Littoral shelf (#4):** `config.js` `bedY(x)` reshaped from a smooth U (`sin`) into **flat shallow
  shelf → steep drop-off → deep basin** (new `BASIN.SHELF_Y/DROP_Y/SHELF_T/DROP_T`). minnow & sunfish
  spawn biased to the shelves (`species.js` `littoralX`); predators still patrol full-width (drop-off).
- **Littoral weed beds (#5):** plant seeding biased to the lit shelf (`world.js` `plantX`,
  `BASIN.SHELF_FRAC`); reeds were already shore-bound (`STRUCTURE.SHORE_FRAC`).
- **Relaxed time (new roadmap item):** a **½× speed** button (`index.html` `data-s="0.5"`), `ui.setSpeedVal`,
  **auto-engaged in fullscreen** (screensaver pace + tour, restores prior speed on exit).
- **Fahrenheit (new roadmap item):** `ui.fmtTemp()` converts °C→°F at the UI boundary (sim stays °C);
  HUD + pond overlay show °F by default; **click the temp readout to toggle °F/°C**. ROADMAP updated.
**Verified:** `npm test` green — **91 checks** (added probes: flat shelf, steep drop-off, weed beds on the
shelf). Determinism byte-identical. `npm run balance 3` → no extinctions; a 2-yr probe shows every species
reproducing hard (**bass 1497 / pike 1312 / catfish 3611 / minnow 6827 cumulative non-reseed births**) —
the snapshot "maxGen 0 wallpaper" warning is a known end-of-run artifact, not a regression. **Preview
(Claude_Preview MCP):** confirmed the shelf+drop-off, the lighter-top/darker-deep gradient in daylight,
reeds + littoral fish, °F (78–89°F across views), the ½× button (sets speed 0.5), the °F/°C formatter.
**Decisions:** depth shading reuses the existing sprite light-bucket axis (no per-fish compositing cost);
shelf is symmetric per-side off `BASIN.CENTER`; relaxed pace is a sim-time multiplier (timestep & seed
unchanged → determinism intact).
**Next:** human feel-check of the live motion; then rest of Phase 2 / Phase 3.
**Risks/notes:** denser littoral cover (more shelf plants) slightly raises prey refuge in the shallows —
intended (realistic), and balance still healthy; if a littoral predator ever struggles, ease
`plantX` bias (0.75) or `COVER.REFUGE`. More sprite buckets (FRAMES×LIGHTS) lean on the LRU (now 1000).

### 2026-06-14 — Full-codebase review: 7 findings fixed (incl. apex-predator evolution)
**Did:** Ran a 13-agent adversarial review over the whole codebase; it confirmed **7 real findings
(0 dismissed)**. Fixed all 7:
- **[high] Apex predators never evolved** — bass/pike were frozen at gen 0, sustained only by re-seed
  floors (couldn't find mates at floor density; `mateRadius` didn't scale with the lake; high-metab
  juveniles starved before they could hunt fish). Fixes: `mateRadius` now scales with √AREA_SCALE;
  the **asexual-budding fallback is density-aware** (sparse species bud at normal `reproEnergy`, not
  ×1.25, so their learned brains reproduce); and **juvenile piscivores eat zooplankton** until they
  can hunt fish. Result: a 3-yr balance run now shows **every species evolving** (pike maxGen 2,
  bass 1, ~40% descendants) — was pike 0 / 100% re-seed.
- **[medium] `load()` reloaded adults as juveniles** (grow stale at 0.35 — age wasn't passed to
  makeAgent). Fixed.
- **[medium] env `toJSON` dropped integrator state** (`strat`/wind/weatherTimer) → a saved summer
  reloaded as fully mixed. Now serialized + restored.
- **[critical] eutrophication probe was tautological** (passed even with the nutrient spike removed —
  it measured the diurnal phyto swing). Rewrote as a **control-subtracted paired test** (spiked vs
  unspiked world) + a nutrient-drawdown assertion.
- **[high] save/load test only checked agent count** → now asserts **full `toJSON` content round-trip**
  + growth + stratification survive (which also guards the two bugs above).
- **[medium] no zoo-tracks-phyto check** → added a paired probe (phyto-starved world holds 135 zoo vs
  2025 healthy).
- **[medium] per-species reproduction unverified** (re-seed floors masked collapse) → added a
  **per-species non-reseed birth counter** (`world.stats.births`) and assert every species reproduces
  (pike 89 births in the gate run).
**Verified:** `npm test` green (88 checks) incl. all the strengthened gates; determinism byte-identical;
`npm run balance 3` → no extinction, every species evolving.
**Notes:** minnow/sunfish standing pops are still mostly re-seeds (high predation turnover) but they
DO reproduce (maxGen 8/4); true carrying-capacity (retiring floors) is Phase 5.

### 2026-06-14 — Phase 2 core: phytoplankton→zooplankton→planktivore web + eutrophication
**Did:** Built the lower trophic web & biogeochemistry, then a long balance pass + a full-codebase review.
- **Phytoplankton field** (`config.js` `PHYTO`, `environment.js`): a biomass `Float32Array` that grows
  with light × nutrient (drawing nutrient down, recycled on decay), makes O₂ by day / respires +
  decomposes always (a big diel & bloom O₂ swing), shades the water (turbidity now reads the phyto
  field, not particle count), and diffuses. `meanPhyto` is the **photic-zone** mean (the fix that made
  the chain work — averaging over the dark deep half starved the signal).
- **Zooplankton** = the `world.plankton` particles, now ecological: spawn ∝ photic-zone algae, **graze**
  the phyto field (`env.grazePhyto`), **starve** where it's depleted, drift with the current, eaten by
  planktivores → a real **phyto→zoo→planktivore** chain.
- **Mussels** (`MUSSEL`, `world.mussels`): benthic filter-feeder beds on the lit bed that clear phyto
  (rendered, persisted).
- **Eutrophication**: nutrient spike → bloom → turbidity + O₂ demand → crash → recovery.
- **Render/UI**: an **Algae-map** overlay (green heatmap of the phyto field) + mussel rendering.
- **Balance pass** (`test/balance.mjs`, new `npm run balance`): ran 2–3 simulated years repeatedly and
  tuned `PHYTO`/`PLANKTON` (photic-zone mean; gentler grazing `0.004`; soft starvation `0.08`@`<0.025`;
  buffered nutrient draw `0.12`; lower bloom O₂) so the web cycles (minnows boom 47→300 on zoo blooms,
  catfish thrive on detritus) with **no species extinction** over the run.
**Verified:** `npm test` green — new probes: phyto field alive, zooplankton present, and the
eutrophication sequence (phyto 0.35→0.76 peak→crash, turbidity 0.19→0.55). Determinism byte-identical
(phyto/mussels in `toJSON`); ~440 steps/s; smoke draws the algae overlay + mussels. **Visually
confirmed** (preview): the Algae map shows phyto banded in the photic zone (dark deep), and a forced
nutrient bloom drove zoo to ~1900 and minnows to 146. A **full 6-dimension adversarial review** of the
whole codebase ran (sim core, env physics/mass-balance, determinism/split, render/camera/UI,
trophic soundness, tests).
**Decisions:** zooplankton kept as simple particles (graze+starve) rather than full agents this pass
(→ later Phase 2). Balance is cyclic/boom-bust by design; **upper trophic levels (sunfish/bass/pike)
still sit near their re-seed floors** — a pre-existing limitation the floors backstop until Phase 5
replaces them with resource-limited carrying capacity.
**Next:** rest of Phase 2 (crayfish/insect larvae/snails as benthic agents, insect hatches, N/P
speciation) or Phase 3 (amphibians, turtles, birds). Consider giving piscivores a boost so they rise
off their floors (lower metabolism or a hunting-in-clear-water bonus).
**Risks/notes:** the phyto–zoo–nutrient cycle is a fast relaxation oscillation; if it ever destabilizes
(zoo→0 for long), nudge `PLANKTON.STARVE`↓ / `PHYTO.NUTRIENT_USE`↓. Summer stratified deep still hits
0 O₂ (intended seasonal dead zone).

### 2026-06-14 — Phase 1 finished: habitat structure, cover/refuge, inflow current
**Did:** Completed Phase 1.
- **Habitat structure** (`config.js` `STRUCTURE`, `world.js` `_genStructures()`): **reed clumps**
  on the shallow shores + **submerged logs** on the bed, generated deterministically at reset,
  scaled with width (linear, not area → ~43 reeds, 16 logs), persisted in `toJSON`, and rendered
  (`render.js`: swaying reeds, logs on the bed).
- **Cover / refuge mechanic** (`world.coverAt(x,y)` from reeds + logs + tall weeds; `COVER`): prey
  hiding in structure **shrink a predator's effective strike range** (applied in `takePrey`), so
  reed/weed beds are real refugia. (A cover *sensor* for deliberate hiding is left for Phase 4.)
- **Inflow→outflow through-current** (`env.flowAt`/`currentAt`, `FLOW`): a gentle rightward current
  (weaker with depth) drifts plankton & weak swimmers; the **inflow loads nutrient** into the left
  littoral. Replaced the wind-only drift with the combined `currentAt`.
**Verified:** `npm test` green — new probes: reeds/logs generated & placed (shores/bed, in bounds);
cover is 1.0 in structure vs 0.0 in open water; the inflow current is rightward & weaker deep; the
inflow enriches littoral nutrient (3.07 vs 0.25 far shore). Determinism still byte-identical
(structures in `toJSON`); ~444 steps/s; smoke draws the structures without throwing.
**Visually confirmed in the preview** (Chrome): a littoral shore with **green reeds, a brown
submerged log, weed beds, and a sunfish using the cover**, plus a catfish on the bottom — the basin,
zonation, turbidity (clarity 35% in a bloom) and structure all reading correctly.
**Decisions:** structures scale with **width** (1-D shore/bed features), not area; cover reduces
predation success rather than detection (deterministic, no new sensor this pass). **Phase 1 is
complete** (ROADMAP marked DONE).
**Next:** **Phase 2** — split phytoplankton/zooplankton, benthic invertebrates (mussels/crayfish/
insect larvae), the microbial loop, and eutrophication blooms → O₂ crashes (turbidity & nutrient
inflow are already wired to feed it).
**Risks/notes:** cover refuge + turbidity both reduce predation/forage efficiency — watch they
don't let prey (minnows) runaway-boom; tune `COVER.REFUGE` / `TURBIDITY.SENSE` if a species explodes.

### 2026-06-14 — Bottom-glide twitch fix + turbidity/water clarity (Phase 1 cont.)
**Did:** Two things off the user's feedback ("fish still twitching on the bottom; keep going Phase 1").
- **Bottom twitch — real fix:** the cause was bottom-feeders actively swimming *down* into the bed
  (chasing detritus that settles there), exceeding the into-wall threshold and getting their heading
  reflected every frame. Changed the surface/bed response in `world.js` from "reflect/bounce" to
  **GLIDE** — clamp position and ease the heading toward horizontal so the fish swims *along* the bed.
  Side walls still turn fish around. Verified in the live sim: a sand-resting catfish now shows
  **0 heading-jump over 30 steps** (was flipping ~π/frame) and glides (5 px/s); 45 of 54 bed catfish
  are horizontal.
- **Turbidity & water clarity** (`config.js` `TURBIDITY`, `environment.js`): murk rises with
  suspended algae (plankton density) + storm-stirred sediment and eases toward a clear baseline.
  It raises light attenuation (`env.attenuation()` → shallower photic zone, dimmer deep) and
  **shortens visual range** (`env.clarity()` scales the `q*` sense queries in `world.js`).
  `env.secchiDepth()` reports clarity; HUD shows a clarity %, and the water tints green-brown as it
  clouds (`render.js`). Persisted in save/load.
**Verified:** `npm test` green — new probes assert clarity stays in range, murky water sees less far,
Secchi shrinks with turbidity (695→363 px), turbidity dims the deep, and it responds to algae/weather
in a live run; determinism still byte-identical. Live preview: turbidity reached 0.80 (clarity 20%,
Secchi 363 px) under a forced storm+bloom and `draw()` renders the murk tint cleanly. *(Couldn't
screenshot the murk this round — the preview tab went `hidden`, throttling rAF; the render path runs
error-free on demand.)*
**Next:** remaining Phase 1 (substrate types, reeds/logs, inflow/outflow) or Phase 2 (split
phyto/zooplankton, benthic inverts, eutrophication blooms — turbidity is already wired for it).
**Risks/notes:** turbidity × clarity reduces forage/hunt range during blooms/storms — an intended
pressure, but watch it doesn't over-suppress feeding (tune `TURBIDITY.SENSE`/`FROM_ALGAE` if so).

### 2026-06-14 — Phase 1 core: lake basin, depth zonation, seasons, thermal stratification
**Did:** Built the abiotic skeleton of Phase 1 (plus the motion/feel tune the user asked for).
- **Non-rectangular basin:** `config.js` `bedY(x)` (shallow shores → deep middle, `BASIN`).
  `world.js` clamps fish (collision), detritus & corpse sinking, and plant rooting to `bedY(x)`;
  agents spawn in **per-species depth zones** (`species.js` `zone:[lo,hi]`). `render.js` draws the
  curved bed (earth below) + minimap basin. `World.bedY(x)` exposed for senses.
- **Seasons + thermal stratification** (`environment.js`): `SEASON.YEAR_LEN` (~14 min/yr) drives a
  surface temp swing and a stratification strength `strat`; `tempAt(x,y)`/`metabAt(x,y)` give a
  warm epilimnion → thermocline → cold hypolimnion (depth-local metabolism). Light attenuation
  raised to 3.2 (shallow photic zone, dark deep).
- **Hypolimnetic O₂ dynamics:** a depth-scaled **benthic sediment demand** (`ENV.O2_SED`) +
  **anisotropic vertical O₂ diffusion** gated by `strat` (`diffuseO2`) isolate & deplete the deep
  in summer; a **turnover overturn** term relaxes the hypolimnion toward surface O₂ when `strat`
  collapses → spring/autumn re-oxygenation. **Wind** (`windAt`) drives a surface current that
  drifts plankton & weak swimmers (`sp.drift`).
- **UI/render:** temperature-map overlay (toggles vs the O₂ map), season in the HUD + pond overlay,
  seasonal water tint. **Motion tune:** boundary redirect now needs real into-wall velocity
  (kills the residual heading wobble on the bed).
**Verified:** `npm test` green. New headless probes assert the **basin shape** and the Phase 1
**definition-of-done**: summer = deep water colder (ΔT ~9°C) **and hypoxic** (deep O₂ 0.35 vs
surface 0.68); turnover collapses the gradient (ΔT 0) and **re-oxygenates the hypolimnion** (deep
0.35 → 0.83); whole-lake O₂ healthy (~0.68). Determinism still byte-identical; ~460 sim steps/s.
**Visually confirmed in the preview** (Chrome): the curved **basin** renders (littoral shelves,
deep middle, earth below, minimap), and the **temperature overlay shows the stratification**
(warm teal epilimnion over cold deep, thermocline band) in summer; season HUD works. An
adversarial 3-dimension review workflow ran over the change.
**Decisions:** tuned `O2_SED`/`TURNOVER_MIX`/`LIGHT_ATTEN` so the deep is *hypoxic & stressful*
(emergent pressure to avoid it) but not a permanent dead zone; depth zones are spawn-bands now
(behavioral tolerance genes are a later Phase 1/4 step). Kept hard re-seed floors (Phase 5).
**Next:** Phase 1 remainder (substrate, reeds/logs, inflow/outflow, turbidity/Secchi) or jump to
Phase 2 (split phyto/zooplankton, benthic inverts, eutrophication). Human feel-check of seasons.
**Risks/notes:** stratified summer lowers carrying capacity (population dips, recovers at
turnover) — that's intended; watch that it doesn't collapse a species across a bad summer.

### 2026-06-14 — Believable life & motion (user feedback: twitchy fish, pop-in/out)
**Did:** Addressed two pieces of user feedback after they saw Phase 0 in the browser.
- **Twitchiness** ([world.js](src/world.js) motion): root cause was hard `heading = -heading`
  wall reflection *every frame* — a bottom-feeder pinned to the sand by `sink` flip-flopped
  constantly. Now: walls redirect **only the velocity component moving into them**; added
  **anticipatory edge avoidance** (curve off side walls/surface before contact); **turn
  authority drops with speed** (smooth banking arcs, not darts); softened the speed/energy
  hit on contact. Render ([render.js](src/render.js)) adds an **eased visual heading**
  (`rHeading`) + widened facing hysteresis (±0.30) so any remaining sim snap is visually smooth.
- **Pop-in/out**: new fish **fade in** (render `vis` ramp, ~0.4 s); re-seed floors now **enter
  from a lake edge** swimming inward (usually off-screen) instead of teleporting mid-view;
  **natural deaths leave a body** (`world.corpses`) that sinks, rolls belly-up, and fades over
  1.4 s before becoming detritus (eaten fish still vanish into scraps). This is a stop-gap that
  makes the existing re-seed/death churn *read* naturally; ROADMAP Phase 5 still replaces the
  hard floors/caps with resource-limited carrying capacity.
**Verified:** `npm test` green — headless adds corpse invariants (deaths leave lingering bodies;
corpses bounded & decay); determinism still byte-identical (corpses excluded from `toJSON`, no
seeded-RNG use); ~530 steps/s at scale. Smoke draws corpses at both LOD tiers. **In the live
preview**: confirmed a sand-resting catfish has **0 meaningful heading flips over 20 steps**
(was reversing every frame), 17 lingering corpses mid-run, a newborn `vis: 0` fade-in, and
`draw()` renders corpses without error. **NOT visually screenshotted this round** — the preview
tab went `visibilityState: hidden`, which throttles rAF to 0 so the screenshot tool times out
(tooling issue, not code; `draw()` runs clean on demand). **Motion *feel* still needs a human**
watching it move — please confirm the twitch is gone and spawns/deaths read naturally.
**Next:** human feel-check; then Phase 1 (habitat structure).

### 2026-06-14 — Phase 0: camera, scale, LOD, sprite cache, perf HUD, minimap
**Did:** Built the Phase 0 display foundation on the existing stack.
- World enlarged to **2048×1152** and made size-agnostic: `config.js` adds `AREA_SCALE` +
  `scaleCount`; `world.js` scales all initial counts, resource caps/floors, spawn rates
  (new `poissonish` helper so rates scale past one-per-step), and per-species pop targets by
  area; field grid auto-sizes to keep ~24px cells. Save bumped to `version: 3`;
  `environment.load` tolerates field-size changes.
- New **pure `camera.js`**: pan/zoom/follow/cinematic-tour, world↔screen transforms, visible
  rect, edge clamping, zoom-to-cursor. Unit-tested in the headless gate.
- **`render.js` rewritten** to draw through the camera: culling, 3-tier LOD (dot / cached
  sprite / hidden), a lazily-built **sprite cache** (`drawImage`, pixelated, LRU-capped),
  minimap renderer, perf stats.
- **`ui.js`/`main.js`/`index.html`/`styles.css`**: drag-pan, scroll-zoom, click-to-follow,
  keyboard (O/F/T/+/−), camera control bar, minimap (click-to-jump), perf HUD toggle, tour
  on fullscreen. Canvas now fills the viewport (16:9) instead of being world-locked.
- Tests: `headless.mjs` extended (scaling invariants, scaled perf budget, camera math);
  **new committed `test/smoke.mjs`** drives the browser layer against a DOM stub at three zoom
  levels. `npm test` runs both.
- Also **fixed `serve.py`**: was single-threaded (`socketserver.TCPServer`) and stalled when
  a browser opened parallel keep-alive connections for the many ES-module files (port listened
  but requests timed out). Now `ThreadingHTTPServer` + HTTP/1.1 + daemon threads.
- An adversarial 12-agent review workflow ran over the change; it confirmed 3 real findings
  (cull margin too small for pike, missing determinism-reproducibility test, tautological
  LRU assertion) — all fixed — and correctly dismissed 3 test-hardening non-bugs.
**Verified:** `node test/headless.mjs` green (sim + camera + **determinism reproducibility**,
incl. a check that camera/tour randomness does NOT perturb the seeded sim; ~630 steps/s at
scale). `node test/smoke.mjs` green (Renderer/UI/Inspector/Camera; whole-lake→mid→close-up
draws; sprite cache builds & **LRU eviction exercised**; culling drops most agents when zoomed;
pickAt/minimap/tour/follow/night-buckets run clean). **Rendering confirmed via preview tool**
(see Current status → Verification): close-up Pike sprite + mid-zoom school both render at
144 fps. Remaining human check: motion *feel* on a real display.
**Decisions:** kept the 2D-canvas stack (see Open decisions); first milestone 2048×1152 / ~1k
agents. Sprite cache (LRU-capped) over per-pixel-at-zoom to bound render cost; LOD dot tier for
far fish; cull pad derived from each species' real sprite extent.
**Next:** human feel-check, then Phase 1 (habitat structure / depth zonation / thermal).
**Risks/notes:** lazy sprite builds may hitch on bucket bursts (watch perf HUD); old saves
land in a world corner; balance unchanged per-area but now ~6.7× the agents on screen.

### 2026-06-14 — handoff prepared
**Did:** Packaged the working pond and authored CLAUDE.md, ROADMAP.md, this file, and the
kickoff prompt. No simulation/render code changed in this step beyond prior tuning.
**Verified:** `node test/headless.mjs` green; DOM-stub smoke green; pond confirmed rendering
in a desktop browser by the human.
**Next:** Phase 0 — camera/viewport first.
