# GRAPHICS_RESEARCH.md — realism roadmap for Synapse Reef's renderer

> Synthesized 2026-06-17 from a 5-lens web-research workflow (water · volumetric light · organism
> shading · colour/post · WebGL2-WebGPU/perf) → one prioritized, codebase-tailored plan. **This is the
> graphics backlog to execute slice-by-slice after compaction.** Every slice is render-layer-only,
> animates from the render clock (never `core.rand`), and stays behind the `isRealGL2` gate so the
> Canvas2D fallback + headless smoke test stay green. Line numbers reference `src/glpost.js` /
> `src/render.js` as of this writing — re-confirm them before editing.

> **PROGRESS — ✅ Slice 1 (Linear-HDR pipeline core) SHIPPED 2026-06-18.** GAP 1 is fixed: scene + fish textures now
> `SRGB8_ALPHA8` (hardware sRGB→linear decode), all lighting/bloom/tonemap in linear on the RGBA16F FBOs, single sRGB-encode
> **+ TPDF dither** as the last op (so slice 2's dither half is also done), live `present.exposure` knob. Verified in real
> WebGL2 by pixel-readback (no clipping, healthy noon histogram, clean exposure sweep). **Next:** slice 2's remaining
> **AgX/PBR-Neutral tonemap swap** (behind a knob), then slice 3 (shared surface heightfield) / slice 4 (Beer-Lambert depth colour).

## Where we stand (executive summary)
The renderer is a Canvas2D scene uploaded as a GL texture, run through a competent but **physically-
ungrounded** WebGL2 post stack. It's ~70–80% of the way to "beautiful screensaver" but reads slightly
**"video-gamey" and flat** because of **two foundational gaps all five research lenses independently hit:**

- **GAP 1 — COLOUR (the #1 bug).** The scene texture + fish sprites upload as plain **RGBA8 with NO sRGB
  decode**, yet every additive light pass and the ACES tonemap run as if the data were **linear**. Result:
  milky/over-bright bloom, over-brightened midtones, crushed dark blues, wrong alpha-blended fish edges —
  a subtle wrongness across the **entire** image.
- **GAP 2 — DEPTH.** There is **no depth/occluder buffer**, so god-rays shine *through* fish, fog is ad-hoc
  (not Beer-Lambert), DOF is faked, and there's no AO. The scene's most physically-meaningful axis
  (`world-y` = surface→bed, already passed per-fish as `uWorldYN`/`depthDim`) is unused as real optical depth.

**Highest realism-per-cost path:** (1) make the pipeline **linear-HDR** (near-free, unlocks correct
bloom/tonemap/scatter); (2) add **one cheap screen-space depth+occluder MRT** (keystone → grounds DOF/fog/
god-rays + enables AO); (3) replace the hand-tuned gradient + haze fudges with one **wavelength-dependent
Beer-Lambert** extinction driven by the existing clarity/turbidity/Secchi fields; (4) give fish **per-pixel
normals** from a baked height/material aux channel → iridescence + fin translucency + a live eye glint.

## THE foundational upgrade (do this first — it unlocks the most)
A two-part **"linear-HDR float pipeline + a 1-channel screen-space depth/occluder G-buffer"**, in that order.

**PART A — Linear-HDR (do first, near-free, unblocks every lighting pass):**
1. **Decode on sample:** upload the fish sprite atlas (`_fishTex` ~L351) and the scene texture (~L401/412/435)
   as internalformat `SRGB8_ALPHA8` so the sampler hardware-linearizes — OR `pow(c, 2.2)` in-shader at the
   top of `FRAG_FISH`/`FRAG_COMP`.
2. **Promote the scene/fish FBO `RGBA8 → RGBA16F`.** RGBA16F is already proven (the bloom `bloomFmt`, gated on
   `EXT_color_buffer_float` which is already requested); **reuse that exact format object + its RGBA8 fallback
   ladder** for the sceneFBO so a driver without float MRT degrades gracefully.
3. Do **all** bloom/god-ray/caustic/scatter/tonemap work in **linear**, then ACES and a **single linear→sRGB
   encode** (`pow(1/2.2)` or an `SRGB8` output) as the **last** op before frag write. **Re-tune the grade
   constants once** (the warm/cool/turbidity multiplies were eyeballed in gamma space) — needs a human eyeball.

**PART B — Depth/occluder MRT (keystone enabling DOF/fog/god-ray-occlusion/AO):** WebGL2 has MRT in core.
Attach a 2nd half-float (or RGBA8-packed, with fallback) target to the scene FBO + `gl.drawBuffers([…0, …1])`.
`FRAG_FISH` writes `location=1 = vec4(uWorldYN /*depth*/, occluderMask=1, 0, 1)`; `FRAG_BLIT` writes the
background's analytic depth from `uv.y → bedY` (a field render.js already computes) with `mask=0`. This is
**not** a perspective depth buffer — it's a screen-space "how much water is in front of this pixel" scalar,
which is **exactly faithful in a side view**. ~+33% bandwidth on the scene FBO at 1080p (half-res at 4K).
**Gate-safe:** both parts live inside `GLPost` behind `isRealGL2`, inside the existing `present()/resize()`
try/catch + RGBA8-fallback ladder, so a missing extension / incomplete FBO / context loss degrades or
reverts to 2D, never throws, never blocks the post path.

## Prioritized slices (order = realism-per-cost)
| # | Slice | Eff | Depends on |
|---|-------|-----|-----------|
| ✅1 | **Linear-HDR pipeline core** *(SHIPPED 2026-06-18)* — sRGB-decode on sample (SRGB8_ALPHA8); scene/fish FBO already RGBA16F; all lighting in linear; sRGB-encode **+ TPDF dither** last; live `exposure` knob (grade re-tune = human eyeball, deferred). *The single highest fidelity-per-line change.* | S | none — **done** |
| 2 | **Blue-noise/TPDF dither + AgX (or PBR-Neutral) tonemap swap** — TPDF ±1 LSB dither before the 8-bit write (kills water-column/sky banding); swap ACES → AgX (no magenta hue-twist, richer) or PBR-Neutral (albedo-preserving), ~10 lines of matrices, behind a live knob. | S | Linear-HDR |
| 3 | **Shared 1D surface heightfield `h(x,t)`** — one render-clock sum-of-sines (optionally Gerstner crests); route the surface ripple, caustic net, god-ray occlusion, Snell band off it so the four currently-independent animations finally agree. | S | none (pairs w/ Beer-Lambert + god-rays) |
| 4 | **Wavelength-dependent Beer-Lambert depth colour** — replace the 4 gradient stops + `depthDim()` + the 2D depth-haze rect + `FRAG_FISH` haze with one per-channel `T(d)=exp(-σ_rgb·d)` (red dies fastest), `col·T + scatter·(1-T)`; σ from the Secchi/turbidity/clarity fields. *Biggest "is this real water?" cue — red objects desaturate-to-teal with depth; blooms physically green the water.* | M | Linear-HDR (optionally sharper w/ depth MRT) |
| 5 | **Depth/occluder MRT G-buffer** (PART B above) — the keystone enabling slices 6, 11. | M | Linear-HDR recommended first |
| 6 | **Occluder-masked god-rays + blue-noise** — gate `godRays()` by the occluder channel (shafts get raked/blinded as a fish crosses — the signature volumetric "wow"); per-step decay = the Beer-Lambert σ; blue-noise + temporal offset drops taps 24→~14 with no banding. | S | Depth MRT (occlusion); Beer-Lambert; `h(x,t)` |
| 7 | **Per-pixel fish normals from a baked height/material aux channel** — `SpriteCache._build` emits a 2nd canvas (R=height, G=material-id body/fin/eye/barbel, B=thickness/AO) via a parallel `putAux` (trivial — `drawFish` already routes every feature through `put`); `FRAG_FISH` does a 4-tap Sobel → tangent normal, blended onto the cylinder normal so scales/fin-rays/gill/eye self-shade. *Largest single jump in "real 3-D fish, not a lit decal."* | M | Linear-HDR |
| 8 | **Fish material lighting** — branch `FRAG_FISH` on material-id: BODY = Fresnel thin-film **iridescence** (IQ cosine palette × scale mask, ~0.1–0.2, species-gated — THE "live fish" flash); FIN/barbel = Frostbite back-light **translucency**; EYE = wrap-diffuse sphere + sharp tracking catch-light (replaces the static baked dot); + Kajiya-Kay anisotropic **wet sheen** along the body axis. | M | Per-pixel normals (#7) |
| 9 | **Henyey-Greenstein in-scatter** — replace the depth-only `exp` scatter with `phase(μ, g≈0.7)` where `μ=dot(view,sun)`, × `(1-T)` × sun, + a multiple-scatter floor for the milky green-water glow. *Dominant cue in turbid water.* | S | Beer-Lambert (shares T/distance) |
| 10 | **(grouped quick win) FXAA after tonemap** — context is `antialias:false` + linear-filtered quads, so fish silhouettes alias and bloom amplifies it; one post pass cleans every edge. | S | none |
| 11 | **Real DOF + screen-space AO (HBAO-lite)** — CoC from `|sceneDepth-focusDepth|` (auto-focus on the camera follow/inspect target), near/far disc blur (replaces the radial+screen-Y heuristic); AO = half-res 6–8-tap horizon pass over depth, bilateral upscale, on ambient; + a depth-driven contact shadow replacing the per-fish elliptical blob. *Cinematic focus-pull + seats fish onto the bed.* | L | Depth MRT (#5) |
| 12 | **Instanced sprites + GPU transform-feedback particulates** — collapse the per-fish `drawArrays` loop into ONE `drawArraysInstanced` + a sprite **atlas/texture-array**; move marine-snow/bubbles/plankton onto transform-feedback advected by `env.currentAt` (10–100k current-coupled motes). *Pure perf headroom → 4K + many-thousand agents; dense particulates are a top "real footage" cue.* Keep the Canvas2D no-op fallback. | L | none functionally — sequence AFTER the realism slices so it buys budget |

## Quick wins (layer on today's pipeline immediately)
- **Linear-HDR is itself near-free and the biggest single win** — treat it as quick-win #0.
- **TPDF/blue-noise dither** before the 8-bit write (uses the existing `hash()`).
- **AgX / PBR-Neutral tonemap** swap (~10 lines) behind a live knob like `rayExp`/`causAmt`.
- **God-ray blue-noise + guard-band** even *without* the depth buffer — fewer taps, no banding.
- **FXAA** after tonemap.
- **Shared `h(x,t)`** to unify surface ripple / caustics / god-ray occlusion / Snell band.
- **Tie each fish to its water:** make the `FRAG_FISH` rim colour = the in-scatter/haze colour (`uHazeTint`)
  scaled by depth+turbidity; soften the half-Lambert with a tunable wrap — zero new data.
- **Generalize the 4K bloom auto-skip into ONE frame-time-EMA quality knob** now, so every heavier slice
  degrades gracefully instead of hitting the hard skip cliff (also de-risks the contention-sensitive perf gate).

## Big bets (largest payoff)
1. **Per-pixel fish material system** (#7+#8) — largest leap in fish believability; what screenshots sell on.
2. **Depth/occluder MRT + everything it unlocks** (#5 → #6, #11) — biggest realism-per-feature multiplier;
   converts four faked screen-space effects into grounded ones. The minimal real-depth addition the 2.5D regime allows.
3. **Instancing + GPU particulates** (#12) — perf headroom to grow the lake (thousands of agents, dense plankton, 4K).
4. **(Defer indefinitely) WebGPU compute fast-path** w/ a WebGL2 fallback — only matters at the far end of the
   vision (50–150× particle/flocking throughput); doubles the renderer surface with no build step, must keep the
   Canvas2D gate green → opt-in AFTER everything above, kept cosmetic so determinism never touches the GPU.
   Froxel volumetric fog is likewise deferred — analytic Beer-Lambert + HG + occluder-masked rays capture ~90%
   for a single overhead light.

## Constraints every slice must honor
**Render-only / determinism:** all in `glpost.js` GLSL or `render.js` draw helpers; never touch
`core/world/species` or the seeded RNG; new animation rides the render clock (`p.time`/`h(x,t)`), never
`core.rand`. **Gate / Canvas2D fallback:** all GL slices behind `isRealGL2`; reuse the RGBA8-fallback ladder +
`present()` try/catch so missing extensions / incomplete FBO / context loss revert to 2D, never throw —
`smoke.mjs` stays green unchanged (it asserts `present.gl==null`, `postInGL===false`, `glFish===false` under
the stub + no-throw). **No build / no libs:** hand-written `#version 300 es` GLSL + plain JS. **Perf
(~60fps@1080p/1000 agents, 4K headroom):** sequenced so pure-headroom + cost-neutral refactors come before the
one genuinely new ~1ms pass (AO, half-res + bilateral behind the quality scaler). Heed the memory notes:
**bloom is the costly post-pass** (gate new taps behind the quality knob) and the **perf probe is
contention-sensitive** (park the preview before gating). **Human eyeball required** for the grade re-tune, the
Beer-Lambert column, and the fish material look (the headless gate can't judge visuals).

## Key sources (full list in the workflow transcript)
- **Colour/linear:** LearnOpenGL [Gamma Correction](https://learnopengl.com/Advanced-Lighting/Gamma-Correction) · [HDR](https://learnopengl.com/Advanced-Lighting/HDR) · [Web Colors, sRGB & WebGL — J. Gilbert](https://hackmd.io/@jgilbert/sRGB-WebGL) · [Minimal AgX — IOLITE](https://iolite-engine.com/blog_posts/minimal_agx_implementation) · [PBR-Neutral — Khronos](https://modelviewer.dev/examples/tone-mapping) · [CoD:AW post (bloom/dither) — Jimenez](https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/) · [Phys-Based Bloom — LearnOpenGL](https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom) · [Dual-Kawase — frost.kiwi](https://blog.frost.kiwi/dual-kawase/) · [Banding & dithering](https://shader-tutorial.dev/advanced/color-banding-dithering/)
- **Water:** [Beer-Lambert "Color of Water"](https://www.imaging.org/common/uploaded%20files/pdfs/Reporter/Articles/2014_29/Rep29_2_EI2014_9023-25_Breneman.pdf) · [Real-Time Underwater Spectral Rendering (CGF 2024)](https://onlinelibrary.wiley.com/doi/10.1111/cgf.15009) · [Caustics in WebGL — E. Wallace](https://medium.com/@evanwallace/rendering-realtime-caustics-in-webgl-2a99a29a0b2c) · [GPU Gems: Water Caustics](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-2-rendering-water-caustics) · [GPU Gems: Gerstner Water](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models) · [Snell's window](https://en.wikipedia.org/wiki/Snell's_window)
- **Volumetric:** [GPU Gems 3: Volumetric Light Scattering as a Post-Process](https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process) · [screen-space-godrays — math-araujo](https://github.com/math-araujo/screen-space-godrays) · [Volumetric raymarching for web — M. Heckel](https://blog.maximeheckel.com/posts/shaping-light-volumetric-lighting-with-post-processing-and-raymarching/) · [Henyey-Greenstein — Ocean Optics](https://oceanopticsbook.info/view/scattering/level-2/the-henyey-greenstein-phase-function) · [SSAO/HBAO/GTAO](https://superrendersfarm.com/article/ambient-occlusion-explained-ssao-hbao-gtao-2026)
- **Organisms:** [Normal maps for 2D — GameMaker](https://gamemaker.io/en/blog/using-normal-maps-to-light-your-2d-game) · [Sobel height→normal](https://godotshaders.com/shader/normal-based-edge-detection-with-sobel-operator-screenspace/) · [Approximating Translucency (SSS) — Barré-Brisebois](https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/) · [Thin-film iridescence — Belcour/Barla](https://belcour.github.io/blog/slides/2017-brdf-thin-film/slides.html) · [Kajiya-Kay](https://web.engr.oregonstate.edu/~mjb/cs557/Projects/Papers/HairRendering.pdf) · [Wrap diffuse — Self Shadow](https://blog.selfshadow.com/2011/12/31/righting-wrap-part-1/)
- **WebGL2/perf:** [WebGL best practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) · [Instanced drawing — webgl2fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html) · [Deferred/MRT G-buffer — T. Sherif](https://tsherif.github.io/webgl2examples/deferred.html) · [TF particles — gpfault](https://gpfault.net/posts/webgl2-particles.txt.html) · [pseudo-3D from depth map](https://webglfundamentals.org/webgl/lessons/webgl-qna-drawing-2d-image-with-depth-map-to-achieve-pseudo-3d-effect.html) · [From WebGL to WebGPU — Chrome](https://developer.chrome.com/docs/web-platform/webgpu/from-webgl-to-webgpu)
