# FEATURES — Synapse Reef subsystem reference

This is the detailed reference for how each subsystem works and where it lives. It moved out of `CLAUDE.md` on 2026-10-11, because that file is injected into every session and had grown to ~41 KB.

- **For quick facts:** read the short `CLAUDE.md`.
- **Before touching a subsystem:** read the matching section below.

The **2026-10-11 audit-fix changes** section comes first. Where it disagrees with the older narrative after it, it wins. The narrative itself is kept as it was.

---

## 2026-10-11 audit-fix changes (supersede the narrative below)

Every finding is listed in `AUDIT.md` with its status. Save format is now **v24**.

### Persistence
- **Exact resume.** A loaded lake continues byte-for-byte like the original; the gate tests this.
- **What v24 saves:**
  - the RNG state (`core.js getRandState/setRandState`);
  - a per-world id counter (`world._nextId`, saved as `nid`);
  - per agent: mating cooldown, steering smoothing, `velHeading`, stroke, last actions, and the plastic W2 block of `lw`;
  - corpses;
  - larva, snail and crayfish positions and phases;
  - plant `la` (light running mean) and `nu` (nutrient pool);
  - detritus `n`;
  - env: the cached means, `tempHypo`/`tempDiel`, and grid dimensions.
- **Validated, atomic load.** `parseSave` builds everything into local variables first. It throws a descriptive Error before touching the world if a file is unusable.
  - Unknown species are skipped and counted.
  - Every number is checked for finiteness and range.
  - Lists are capped.
  - Environment fields are resampled when the saved grid size differs.
  - `load()` returns a report (also kept on `world.lastLoad`).
- **Brain migration by save era.** `species.js BRAIN_ERAS` records every historical input/output layout. Old brains are remapped **by label**, through `core.js remapGenome`. The old positional migration had put hunger/fear weights on the compass, flow and prey-size inputs.
- **Caps.** `addAgent`, `makeFish` and `seedFromChampions` respect `GLOBAL_MAX`. `addAgent` and `makeFish` return `null` at the cap; `seedFromChampions` returns `{added, reseeded}`.

### Fish and plant ecology
- **No newborn cannibalism energy pump.** `BROOD.GRACE` protects same-species young for a few seconds, and broods are placed in a ring around the parents. Threat sensing is symmetric (`canPrey`), so juveniles sense cannibal adults of their own kind.
- **Asexual budding pays at least the child's energy.**
- **Feeding is per second, not per step.** This covers `FEED.HANDLE` item handling, `PLANKTON.FALLBACK_GRAZE`/s and `PLANT.BITE_RATE` px/s, so headless dt=1/30 matches the browser's 1/60.
- **Plant starvation** is judged on a per-plant running mean of light (`p.lightAvg`, τ = `PLANT.LIGHT_TAU_DAYS`), against a re-calibrated `MACRO.lightMin`. Seeding is light-gated, so beds survive night and winter.
- **Seed-parent search ignores turbidity** (`nearestPlant`).
- **Plants carry an N+P pool** (`p.nut`). Uptake is stoichiometric, and shedding, grazing and death return the plant's proportional share.
- **New innate reflexes (2026-10-12).** Each is a weighted nudge the brain can override, and each is tested A/B against an identical world in `headless.mjs`.
  - **Pursuit** (`innate.pursuit`, bass and pike): turn toward sensed prey.
  - **Hypoxia avoidance** (all species, `ENV.HYPOXIA_AVOID`): water below `o2Crit` × the margin retargets the depth reflex upward.
  - **Spawning aggregation** (`innate.spawnGround`, bass, pike, carp and catfish; `SPAWN.AGG_*`, `GROUND_X`): in season, breeding-ready adults migrate to the littoral spawning ground on their side of the lake.
- **Apex energetics.** Bass and pike were starving. Their maintenance metabolism now sits on the size trend (0.030 and 0.036), and fish meals are richer (`foodValueFish` 0.80 and 0.85).
- **Result** (1-year balance): immigrant share fell for bass 91→70%, pike 76→54%, catfish 48→29% and carp 52→39%.

### Water chemistry
- **Wet/dry mask** (`env.mask`). Below-bed cells are inert. Every process, diffusion step and mean runs over wet cells. Sediment O₂ demand and Mortimer P act on each column's bed cell.
- **Flux-form, conservative diffusion** with no flux at the edges or the bed.
- **Closed P and N budgets.** Boundary fluxes are tallied in `env.ledger`: inflow, outflow, burial, fixation and denitrification.
  - Algal and cyanobacteria uptake follow Redfield ratios (`PHYTO.N_USE`).
  - Grazing excretes `NUTRIENT.GRAZE_EXCRETE` and egests the rest as DOM.
  - Fish-death detritus carries no P.
- **Cyanobacteria** grow per-capita and logistically from a small inoculum, fix N₂ only for their deficit, and form toxic scum as an occasional event.
- **Temperature.** The hypolimnion has its own slow temperature (`tempHypo`), and the diurnal swing damps with depth (`tempDiel`, `THERMAL.DIEL_DEPTH`).
- **O₂ is clamped ≥ 0** before every rate term.
- **Storms mix the lake.** Re-stratification halts while the wind multiplier is ≥ `THERMAL.RESTRAT_MAX_WIND`.
- **Through-flow advection** (`OUTFLOW`) exports nutrients at the outflow, and burial happens only from the sediment store.
- **Removed knobs:** `THERMAL.DROP`, `NUTRIENT.DECAY`, `NUTRIENT.N_START`, `BASIN.SEDIMENT`, `PLANT.MAX_HEIGHT`, `PLANT.MIN_HEIGHT`, `PLANT.LIGHT_MIN`, `PLANT.SENESCE_TO_DOM`.

### Rendering
- **GL depth fix.** `FRAG_COMP` measures depth as `dpt = 1 − uv.y`. `uv.y = 0` is the screen BOTTOM; every surface effect was previously drawn over the bed. The sun UV is `[su, 1 − sv]`.
- **Safer GL start-up.** `makePresenter` builds and compiles the whole GL pipeline on a throwaway canvas before claiming `#tank`. On a fatal failure, or a context loss not restored within 3 s, `Renderer._fallbackTo2D` swaps in a fresh `#tank` with a Canvas2D presenter, and `main.js` re-wires its input.
- **Colour and textures.**
  - Exact sRGB encode, with grain applied after the encode.
  - Alpha-bled, mipmapped fish textures.
  - No double depth, night or haze dimming on GL fish.
  - Correct sprite hue buckets.
- **Drawing.**
  - World-aligned bed and surface sampling.
  - A heading snap when a fish enters view.
  - Wrapped `uTime`.
  - DPR-correct effects.
  - A render-target fallback chain (RGBA16F → SRGB8_ALPHA8 → RGBA8).
- **Caches and overlays.** The sprite and GL-texture caches share one cap (1024). Overlays are composited above GL fish.
- **Main loop.**
  - The guarded frame loop (`makeGuardedLoop`) re-arms before running the frame.
  - Render interpolation between fixed steps uses render-only `a._px/_py/_ph` and `alpha`; the sim never reads them.
  - Shortcuts ignore modifier keys.
  - Real pinch zoom (`Camera.pinch`).

### UI and server
- **Escaping.** `escapeHTML` and number coercion for every data-derived value.
- **CSP.** A strict Content-Security-Policy, with no inline script or style. It's identical in the meta tag, `serve.mjs` and `serve.py`.
- **UI fixes.**
  - The overlay's °F/°C toggle is clickable.
  - The inspector shows 5 outputs and the evolved brain size.
  - Population caps on every add path; a 50 MB import limit.
  - Weather-dropdown sync.
  - Fullscreen restores the pause state.
  - Delayed blob revoke.
- **Servers.** `serve.mjs` (Node) and `serve.py` are localhost-only, with no directory listings and no dotfiles.

### Tests
- New gate files: `test/ui-check.mjs` and `test/serve-check.mjs`.
- The memory (LEAK) check reads the real block.
- `REEF_PERF_MIN` relaxes the speed budget while other work shares the CPU.
- Each fix has its own `// ==== audit-fixes: <area> ====` block before the summary line of `headless.mjs` and `smoke.mjs`.

---

# Subsystem narrative (as of 2026-06-18)

## Current state (keep honest; track changes in SESSION_STATE.md)
- **Phase 0 done:** world **2048×1152** (≈16:9, ~6.7× the old pond), side-view, entirely
  underwater, explored through a **camera**. World size is a single config number
  (`WORLD.W/H`); all populations/resources are **densities auto-scaled by `WORLD.AREA_SCALE`**,
  so per-area balance holds at any size. Supports ~1,000 agents (`GLOBAL_MAX` ≈ 1012).
- **Phase 1 done (habitat & abiotic environment):** the lake is a **non-rectangular basin** —
  `config.js` `bedY(x)` gives a realistic profile: a **flat shallow littoral shelf** hugging each
  shore → a **steep drop-off** → a flat-ish **deep basin** (`BASIN.SHELF_Y/DROP_Y/SHELF_T/DROP_T`),
  not a smooth U. Fish, plants, detritus and corpses all live above it; agents spawn in **per-species
  depth zones** (`species.js` `zone:[lo,hi]`), and shelf-dwellers (minnow/sunfish) spawn biased to the
  shallows (`littoralX`) while weed beds concentrate on the lit shelf (`world.js` `plantX`). **Seasons** (`SEASON.YEAR_LEN`, a year every ~14 min) drive a
  **thermal profile** (`env.tempAt(x,y)`: warm epilimnion → thermocline → cold hypolimnion);
  **summer stratification** isolates the deep (gated vertical O₂ mixing + a benthic sediment
  O₂ demand) so the **hypolimnion goes hypoxic**, and **spring/autumn turnover** re-oxygenates
  it (overturn term). Light attenuates strongly (shallow photic zone). Metabolism is
  **depth-local**. **Wind + an inflow→outflow through-current** (`env.currentAt`) drift plankton &
  weak swimmers; the inflow loads nutrient into the left littoral. **Turbidity** (`env.turbidity`,
  from algae + storms) clouds the water → more light attenuation + **shorter visual range**
  (`env.clarity()` scales the `q*` sense queries; `env.secchiDepth()`). **Habitat structure** —
  reed clumps on the shores + submerged logs on the bed (`world.reeds`/`world.logs`) + rooted weed beds +
  **submerged macrophyte beds** (`world.weedbeds`: tall cover bands on the littoral/drop-off reaching up
  into oxygenated mid-water — pike/sunfish habitat, rendered + saved) — gives **cover** (`world.coverAt`):
  prey hiding in it shrink a predator's strike range (refuge), and cover-seeking fish (`innate.cover` via
  `world.nearestCover`) migrate to it to lurk/hold.
  *(Deferred to later phases: distinct substrate-type effects beyond cover, shoreline inflow/outflow
  geometry, and heritable zonation-tolerance genes → Phase 4.)*
- **Phase 2 core done (lower trophic web):** a **phytoplankton field** (`env.phyto`) is the base —
  it grows with light × nutrient (drawing nutrient down, recycled on decay), makes O₂ by day and
  respires/decomposes always, and shades the water (turbidity). **Zooplankton** are the
  `world.plankton` particles: they spawn ∝ photic-zone algae, **graze the phyto field**, **starve**
  where it's depleted, drift with the current, and are eaten by planktivores → a real
  **phyto→zoo→planktivore** chain that cycles. **Mussels** (`world.mussels`) are benthic filter
  feeders that clear phyto. **Eutrophication** works: a nutrient spike → algal bloom → turbidity +
  night/decomposition O₂ demand → crash → recovery. *(Deferred Phase 2: zooplankton as evolving
  agents, more benthic inverts (crayfish/insect larvae/snails), insect hatches, the microbial loop,
  and explicit N/P speciation.)*
- **Camera (`camera.js`):** pan (drag), zoom (scroll, ~0.8×–64× whole-lake fit),
  click-to-follow, keyboard (O/F/T/+/−), cinematic **auto-tour** (auto in fullscreen). The
  renderer draws in world space through the camera; only the visible region is drawn.
- **Render (`render.js`):** culling + 3-tier **LOD** (far→tinted dot [min 2px], mid/near→cached
  sprite, sub-pixel→skipped) + a lazily-built **sprite cache** keyed by (species, growth, hue,
  **light×depth**, anim-frame, morph, **effort/drive**), blitted via `drawImage` (LRU-capped ~1200). **GRAPHICS Pass 1
  (2026-06-17, canvas-2D, render-only):** the look was de-pixelated — sprite `BASE` 6→14 + a finer `drawFish` step
  (`su` floor 0.07) for ~2× internal detail, **`imageSmoothingEnabled=true`** anti-aliased blits (was nearest-neighbour),
  and **smooth gradient counter-shading** in `drawFish` (was 3 hard back/body/belly bands) + a **proportional eye** (was a flat
  0.7-unit floor → a huge dark eye on slim fish) with a catch-light glint; `styles.css #tank` is now `image-rendering:auto`.
  Plus **atmosphere**: soft **additive godrays** + **surface caustics** + drifting **marine-snow particulates** (`this.motes`,
  cosmetic — stateless render-clock animation, **never `core.rand`**), thin grass-blade **weed beds** + round flora line-caps,
  and a **day/night/seasonal colour grade + cool vignette**. **GRAPHICS Pass 2 (2026-06-17)** went further (still canvas-2D):
  **rich fish art** in `drawFish` (translucent rayed fins, scale texture, gill/mouth, a `source-atop` **volumetric sheen** built
  into the sprite), **particle FX** (rising **bubbles**, **soft contact shadows** grounding bottom-dwellers, edge-triggered
  **strike/flee ripple rings** via transient `a._fxAt`), and a water/post stack — **depth haze + spectral blue↔green tint** and a
  **cheap region-limited bloom** (top ~58% band; auto-skips on 4K+ backings). **Depth
  shading:** a `depthDim(y)` factor (1.0 surface → ~0.34 bed) feeds the sprite light bucket and the
  dot/corpse/plant lightness, and the water-column gradient runs sunlit-surface→abyss — so the lake
  reads as having real depth. Plus a **minimap** (whole lake + camera rect + density, click-to-jump)
  and a toggleable **perf HUD**. **GRAPHICS Pass 3 / slice 1 (2026-06-17, WebGL2):** post-processing moved to the GPU — the 2D
  scene is drawn to an **offscreen canvas** and composited to `#tank` by **`glpost.js`** (`makePresenter` → `GLPost` on real
  WebGL2, else a Canvas2D blit): **HDR float bloom + ACES tonemap + underwater refraction + chromatic aberration + fake DOF +
  grain + day/night grade + vignette**. `render.js` skips its own bloom/grade/vignette when `postInGL` (no double-post). This
  **recovered perf** (1080p whole-lake ~56→~139 fps) and raised fidelity. **Slice 2** folded a **GPU volumetric water + light**
  stage into the composite (pre-ACES): **screen-space god-rays** (a radial march of the resident half-res bloom texture toward the
  sun screen-UV), a **richer animated caustic net**, **in-scatter glow** + **surface sheen**; the 2D godrays/caustics are gated
  behind `postInGL` so they don't double. New uniforms `uSunUV/uSunInt/uSunUp/uRayExp/uCausAmt`; tunable via
  `renderer.present.rayExp`/`.causAmt` (baked 1.6/0.40). ~102 fps @1080p day. **Slice 3 (2026-06-17)** moved the FISH onto the GPU:
  when **`renderer.glFish`** is on, `render.js` collects per-fish quads instead of blitting, and `GLPost` assembles an **HDR
  scene-FBO** (background blit + **directionally-lit textured fish/corpse quads** — cylinder-normal half-Lambert + ambient floor +
  Fresnel rim + per-fish depth haze, lit from the surface sun) before the bloom/post, so fish bloom & grade with the water. Sprite
  canvases → GL textures cached by SpriteCache **entry-object identity** (LRU 512); gated behind `glFish` with the 2D fish path as
  the byte-identical fallback. Pixel-parity with 2D (only shading differs); ~169 fps @1080p. *(Far dot-tier + contact shadows +
  strike ripples stay 2D; instancing, per-species/normal-mapped art, true 3D water + depth buffer are the later Pass-3 slices.)*
- **6 fish species** (minnow, sunfish, catfish, carp, bass, pike) across a size gradient,
  each with its own brain shape, senses, diet, and a **distinct sprite SILHOUETTE** (`species.js` `drawFish`: a per-species body
  `profile(tn)` → asymmetric back/belly curves + parametrized dorsal `dorsalX/W/H` + `earSpot`/`scaleTex` — pike slender spindle
  w/ rear dorsal, sunfish round disc w/ ear-spot, catfish broad-head taper, carp deep round-bellied, bass streamlined, minnow slim).
- **Growth:** fish are born juveniles (~35% size) and grow to adult size with age.
  Predation is by **effective (growth-aware) size** (eat prey ≤ ~85% of your size), so
  juveniles are more vulnerable.
- **Thermal / O₂ physiological niches:** each species has a temperature band (`tempOpt ± tempTol`)
  and a critical oxygen `o2Crit` (`species.js`). Outside the band, energy drains
  (`ENV.THERMAL_STRESS`/°C); below `o2Crit`, the hypoxia drain bites (`world.js` metabolism block,
  using the `ENV.HYPOXIA*` constants). This makes **warm- vs cool-water guilds** (pike = coolwater,
  O₂-demanding, summer-squeezed; catfish/carp = warmwater, hypoxia-tolerant) and the classic summer
  **temperature–O₂ squeeze** emergent, not scripted. The four water-column species (minnow/sunfish/bass/
  pike) also sense **`light@depth` + `temp@depth`** (`world.lightAt`/`tempAt`), giving them the signals to
  **evolve diel vertical migration** against that cost. A large research-pass backlog of further realism
  systems lives in `ROADMAP.md` → "Realism research backlog".
- **Time/calendar:** one master `TIME` block (`DAY_LEN` 60 s cosmetic day/night, `YEAR_LEN` 1800 s) → a realistic-ratio
  calendar: **a year = 12 months = 4 seasons** (`env.monthName`/`monthIndex`/`yearFrac`, displayed Month·Season·Year),
  day < month < season < year. Fish lifespans are realistic **relative** ratios (~10× carp:minnow, mature at ~13–33%
  of life; absolute scale compressed so evolution still turns over — see `species.js` `matureAge`/`maxAge`). A single
  **`TIME.LIFE_SCALE`** knob (currently 1.6) multiplies every species' `matureAge`+`maxAge` once (in `species.js`), so fish
  live & mature proportionally longer in sim-seconds (calmer turnover) while keeping those relative ratios — dial it to taste.
- **Environment:** day/night (`TIME.DAY_LEN`) + **seasons** (`TIME.YEAR_LEN`); weather state machine
  (clear/cloudy/rain/storm) — rain is a **surface-only** effect, lightning a brief
  **surface-down gradient**; a **depth-stratified temperature** (`tempAt`) with summer
  stratification & spring/autumn turnover; a dissolved-**O₂ field** (photosynthesis by day,
  depth-local respiration, surface re-aeration, **benthic sediment demand**, stratification-gated
  vertical mixing + turnover overturn; the **hypolimnion goes hypoxic in summer**; phytoplankton
  also drives a big diel/bloom O₂ swing); **nutrient pools** — phosphate (`env.phos`) + dissolved inorganic
  nitrogen, the latter split by the **nitrogen cycle** into **ammonium** (`env.nh4`) + **nitrate** (`env.no3`):
  aerobic **nitrification** (NH₄→NO₃, consumes O₂) and anoxic **denitrification** (NO₃→N₂ gas, a permanent N sink
  → P stays the ultimate limiter), **redox-gated** mutually-exclusive at `DENITRIF_O2` (the same 0.25 cline as the
  sediment-P switch — nitrification only above it, denitrification only below), in `env.nitrogenCycle`.
  Phyto/plant growth is **Liebig co-limited** = min(N-Monod over nh4+no3, P-Monod), with Redfield-split recycling
  (N recycles as ammonium, drawn ammonium-first) and a **P-enriched inflow** (P is the limiter → P loading drives
  blooms); a **benthic sediment-P store** (`env.sedP`, the **Mortimer redox switch**: oxic sediment binds P, the
  anoxic summer deep releases it → internal-loading eutrophication feedback); a **phytoplankton field**; a
  **cyanobacteria field** (`env.cyano`, the **N-fixing 2nd producer strain**: grows on light × P × warmth with NO
  N-limitation, so it wins at low N:P; competes with green phyto for P; **buoyant** → a surface scum; leaks fixed
  N back → a net N source that counteracts denitrification — emergent seasonal phyto↔cyano succession; a **dense scum is
  TOXIC** (`CYANO.TOX_*`: a microcystin-style **cyanotoxin** drains fish energy + kills zooplankton above a threshold →
  a bloom can kill by **poison** as well as via the O₂ crash, surface-concentrated, inert below threshold); a
  **dissolved-organic-matter field** (`env.dom`, the **microbial loop** in `env.microbialLoop`: settling detritus
  dissolves into it, then heterotrophic bacteria decompose it at a **Q10 temperature- + O₂-limited (Monod)** rate —
  **consuming O₂** and **remineralizing** N(→ammonium)+P **gradually & mass-conservingly**, replacing the old instant
  detritus dump; cold/hypoxic deep decomposes slowly → **DOM accumulates in the hypolimnion**, and the O₂ demand
  self-throttles as O₂→0 so it can't deepen the dead zone); a **wind + inflow current**.
- **Resources:** a **phytoplankton biomass field** (base of the web) + a **cyanobacteria field** (the N-fixing
  competing strain), **zooplankton** (the drifting `plankton` particles — graze phyto, feed planktivores),
  **aquatic insects** (`world.larvae`/`world.insects`, `config.js INSECT`: benthic detritivore LARVAE that develop with
  warmth & feed bottom fish, then EMERGE as a warm-season surface HATCH of adults that surface fish rise to — the
  bed→surface cross-boundary flux; uneaten adults lay eggs, closing the cycle),
  sinking detritus (dissolves into the `env.dom` pool → **bacterially decomposed** by the microbial loop, not an
  instant nutrient dump), rooted plants/macrophytes — a **variety registry** (`config.js MACRO`: pondweed / milfoil /
  water-lily / muskgrass-chara, each a dynamic plant `p.v` picked by **rooting depth** `world.pickVariety`, with
  per-variety depth zone, size, growth, cover, O₂, palatability, light- (`lightMin`) & warmth- (`tempMin`) requirement,
  and render form) that **EVOLVE**: each plant carries a heritable **6-gene trait genome** (`PLANT_GENE_KEYS =
  maxH/grow/light/warmth/palat/leaf`, multipliers; `core.js randomPlantGenes`) — seedlings are **mutated clones of the
  nearest parent** (`newPlant(x,false,parent)` in the seeding step; isolated/cold-start seeds get fresh genes), and
  `world.derivePlant(p)` maps genes × variety → effective per-plant `growMul/lightMin/tempMin/palat/cover/o2/leaf/hue`
  with **trade-offs** (shade-tolerance & grazing-defence cost growth; big leaves raise the light requirement) so habitat
  drives **divergent selection** — **functional AND visibly rendered** (per-plant colour/leaf-size/height). Genes start
  ~1.0 (fresh lake = pre-evolution baseline). Layered on **seasonal phenology** (temperature-driven warm-season growth →
  autumn senescence that sheds into the DOM pool = the fall nutrient pulse → overwinter as a grazing-/winter-proof
  **rootstock** `WINTER_MIN`; death is **light-starvation**, the depth/turbidity limit, not grazing-uproot; grazed only
  above the rootstock; produce O₂) and **shade-compete** (taller macrophytes cut shorter neighbours' effective light,
  `COMPETE` → a stratified canopy + self-thinning, which selects for height/shade-tolerance) — plus separate static
  **reeds** (emergent) + **weed beds** (cover). Mussels (filter feeders). **Benthic invertebrates** (`world.snails`/`world.cray`,
  `config.js SNAIL`/`CRAYFISH`): grazing **snails** scrape periphyton (a gentle local draw on the phyto field near the bed),
  recruit ∝ the algae base, and are eaten by molluscivorous sunfish/carp + crayfish; omnivorous **crayfish** walk the bed
  (cover-seeking + crepuscular/night-active), recruit ∝ the detritus rain (like the insect larvae), prey on snails, and are a
  prime forage for bass/pike/catfish — two new benthic web links: phyto→snail→{sunfish,carp,cray} & detritus→cray→{bass,pike,catfish}.
  Both are particle populations (eaten opportunistically on the bed — no dedicated brain sense yet).
- **Reproduction & carrying capacity (Phase 5):** sexual **crossover** is primary; **asexual budding** is a
  fallback so sparse populations and the random cold-start still evolve. Density is now **LOGISTIC** — the chance
  of breeding when eligible tapers to 0 as a species nears its carrying capacity `K = popMax` (`rand() < 1−N/K`),
  not a hard cap. **Seasonal spawning** (`SPAWN` + per-species `spawnPeak`): the breeding chance is also multiplied
  by a seasonal factor that **peaks in each species' spawning season** (a spring/early-summer baby boom; pike spawn
  earliest in cool spring) and tapers to a soft `FLOOR` off-season — a `cos`-bump on the angular distance from the
  peak, keyed off `env.yearFrac()`, applied to both the sexual & asexual paths (`world.js` `spawnF`). **Fecundity /
  clutch** (per-species `SP.clutch`): a successful spawning yields a **condition-dependent brood** of several young
  (real fish are fecund), not one — bounded by the parents' energy (each young costs `reproCost`, so only well-fed fish
  afford a big clutch), by the species max, and by global headroom (never overshoots `GLOBAL_MAX`). This is what lets the
  slow-maturing larger species self-sustain on realistic life histories; the logistic gate keeps it self-limiting near K. The old hard re-seed floor is **retired** for **metapopulation immigration / the rescue effect**
  (`IMMIGRATION` in `config.js`): a stochastic trickle of edge-entering immigrants whose rate rises as a species
  drops below a low rarity threshold `RESCUE_N` and tapers to 0 above it (so self-sustaining species float free),
  plus a tiny `REFUGE` quasi-extinction backstop (never literally vanish). Immigrants are mutated copies of the
  species' current best (preserve learned behavior). `world.stats.immigrants` tracks rescue dependence vs home-bred
  `world.stats.births`. Both the **brain genome AND a multi-gene trait genome** are inherited. **Trait-based mate
  choice** (`world.chooseMate`): the initiating fish scores eligible nearby partners by condition + trait genes +
  foraging success and picks the best → sexual selection acts on the genome (not just nearest-mate pairing).
- **Multi-gene genome (evolution beyond the brain):** each fish carries a heritable **7-gene** trait genome
  (`core.js GENE_KEYS` = **size / speed / tol** physiology + **fin / eye / body** MORPHOLOGY + **brain** SIZE multipliers,
  `randomGenes`/`crossoverGenes`/`mutateGenes`) blended on crossover + mutated like `hue`. `makeAgent` derives
  effective per-fish stats — `a.size/maxSpeed/tempTol/o2Crit` **plus** `a.maxTurn` (fin → maneuver), `a.senseRange`
  (eye → vision), `a.accel` + `a.bodyMul` (body → thrust + a gape-limited **predation defence** in `qThreat`/`qPrey`'s
  `canEat`), with fin/body also adding **drag** to `maxSpeed`; the **brain** gene sets **`a.activeHid`** = how many hidden
  units are ACTIVE (`forward` MASKS the surplus inert — the EVOLVABLE BRAIN SIZE, `config.js BRAIN`), with a **per-neuron
  metabolic SAVING** for a smaller brain — and **every cost folded into `a.metabMul`** so traits trade off (nothing free;
  the brain gene is the encephalization trade-off — a thriftier brain is cheaper but computes with fewer units). The
  morphology is also **DRAWN** per-fish (`drawFish` reads `o.morph`; sprite-cached by a coarse morph bucket in `render.js`),
  so bodies visibly evolve. At genes≈1.0 stats are **exactly** the species baseline (full brain, `metabMul` = 1).
  Selection visibly acts (catfish evolve small/slow/hardy; a run drifted fin↑/body↑/eye↓). Seeded-RNG (sim state),
  serialized in `toJSON` (`gn`); a `fitGenes` length guard pads older saves (preserving evolved genes).
- **Motion:** NN turn/thrust → **low-pass smoothed (~0.65 s)**; **turn authority falls with
  speed** (fast fish bank in arcs, not darts); **MOMENTUM** (`config.js MOTION`): each fish carries a `velHeading`
  (actual TRAVEL direction) distinct from `heading` (body facing) — `velHeading` eases toward `heading` slower at speed
  (`SPEED_LAG`), so a fast fish **carves/drifts through a turn** instead of pivoting, and a hard turn **scrubs forward
  speed** (`TURN_DRAG` ≈ 0.14 → can't bank at full tilt). Position integrates along `velHeading`; the body draws along
  `heading` so a fast turn visibly crabs/banks. **anticipatory edge avoidance** curves fish off side walls/surface;
  **side walls turn the fish around (heading+velHeading both flip), but the surface & curved bed make it
  GLIDE along the boundary** (heading eased to horizontal) instead of bouncing — so bottom-feeders
  foraging on the bed don't twitch; **burst-and-coast** (`MOTION.COAST_*`): a per-fish zero-mean stroke oscillation pulses
  the delivered thrust so a cruising fish SURGES then GLIDES (cycle-mean ≈ intent → balance-neutral), suppressed during a
  flee/strike sprint; a **traveling-wave** body undulation + beating fins whose **amplitude AND tail-beat
  frequency scale with the fish's actual swimming EFFORT** (`render.js _fish` `drive` = thrust + speed, boosted by a
  flee/strike burst, suppressed by a HIDE freeze → a gliding/hiding fish is near-still, a fleeing sprinter thrashes;
  bucketed into the sprite-cache key). Render adds an **eased visual heading** + wide facing hysteresis so sim snaps
  don't read as twitches. *(`velHeading`/`stroke` are transient — lazily init, not serialized. Trajectory-realism set is complete: carving momentum + turn-speed-loss + burst-and-coast.)*
- **Innate behavioral baseline (ethogram, `SP.innate`):** each species has a **depth-home reflex** (steers
  toward its real preferred zone `homeDepth × bedY`, pull scaling with displacement → gentle near home so
  the NN drives in-zone, the neuroevolution isn't diluted) + a **cruise style** (lurkers slow, roamers
  brisk; catfish **nocturnal** = more active at night) + **schooling cohesion** (minnow → loose shoals) +
  **ambush** (pike eases toward a hold until prey is close, then bursts — a *blend* so a committed brain
  can override). Applied in `world.js`'s move step,
  deterministic (no RNG); the NN **modulates** all of it. Produces real vertical zonation — minnow shallow,
  bass/pike mid, carp/catfish on the bottom. Adversarially reviewed. (v2.1 TODO: cover-seeking,
  catfish nocturnality, schooling separation, absolute minnow home-depth — see ROADMAP.)
- **Life-cycle visuals (believable spawn/death):** new fish **fade in** (render `vis` ramp);
  rescue **immigrants enter from a lake edge** and swim inward (usually off-screen) instead of popping in
  mid-view; **natural deaths leave a body** that sinks, rolls belly-up, and fades over ~1.4 s
  (`world.corpses`, render-drawn) before becoming detritus. Eaten fish still vanish into scraps.
- **Stats/data accessors (pure, headless-tested):** `world.envDetail()` (depth-resolved temp/O₂,
  stratification, nutrient, nitrate %, phyto, cyano, Secchi, clarity), `world.speciesDetail()` (per-species
  count/gen/**all 6 mean trait-genes** size/speed/tol/fin/eye/body/condition/zonation/**immigrant-fraction**),
  `world.biomassByTrophic()` (trophic-spectrum biomass incl. snail/crayfish), `world.depthProfile(x,n)` (a
  surface→bed water-column profile: temp/O₂/N/P/phyto/cyano/light at each depth), **`world.resourceCounts()`**
  (live zoo/larvae/insects/snails/crayfish/mussels/detritus/plants counts), **`world.cognitionDetail()`** (fleet
  drives meanHunger/meanFear, the brain-gated action mix pStrike/pFlee/pHide, recurrent meanMemory, meanTox).
  The UI surfaces them in a reorganized rail (**Dashboard overhaul Slice A, 2026-06-16**): an **Environment card**
  (deep temp/O₂, stratified %, Secchi, nutrient, nitrate %, sediment-P, phyto, cyano, DOM), a **Water-column card**
  (depth-profile chart, pan to compare littoral vs deep), a **Food-web card** (census + a resource-count strip +
  fish trophic-biomass bars), an **Evolution card** (per-species 6-gene table + gen + immigrant %), a **Cognition
  card** (the brain inspector + the fleet drive/action/memory aggregates), a **History chart**, and a full
  **click-a-fish readout**. *(Slice B/C — selectable multi-panel charts, a food-web flux diagram, an event/feed
  log, CSV export, any-entity inspector — remain on the roadmap.)*
- **UI:** HUD, six-species census, population + environment charts, live **brain
  inspector**, selection readout, controls (pause/**speed incl. a ½× "relaxed" screensaver
  pace**/weather/oxygen-map/vision/add species/scatter food/save-load brains/export-import
  state/reset/**fullscreen**), an on-water **pond-stats overlay**, and fullscreen with a roaming
  auto-follow + auto-relaxed pace (screensaver). **Temperature shows in °F** by default (sim stays
  °C; convert only at the UI boundary via `ui.fmtTemp` — click the readout to toggle °F/°C).
- **Persistence:** champion brains per species (localStorage) + full state (JSON file,
  `version: 23` (v23 = the 7th `brain` trait gene — `gn` grows 6→7, older saves pad it to ~1.0; v22 = the +2 perception inputs; v21 the natal-home anchor `hx`; v20 `snails`/`cray`; older saves migrate / default) — agents carry a contaminant **body burden `tx`** (`TOX`: a mercury/PCB-style toxicant that
  **biomagnifies up the food chain** via prey-burden assimilation in `takePrey`, slow excretion → apex predators carry
  the most; `TOX.AMBIENT=0` = a clean lake, inert by default, a scenario lever) + brain weights `w` (a **recurrent** MLP with
  a **5-output ACTION head** — `core.js OUT=5`: turn, thrust, + the brain-GATED actions **strike/flee/hide** (`config.js ACTION`),
  each a 0..1 intent the move/feed steps turn into a visible lunge/sprint/freeze; plus a per-hidden-unit leaky-integrator `[LEAK]`
  block that gives the brain **MEMORY** — `forward` blends each unit's previous activation in; the hidden state `act.h`
  persists on the agent and **is serialized** as agent field `m` so working memory survives save/load, and `core.js migrateGenome`/
  `world.js fitGenome` **preserve** an older 2-output and/or pre-recurrence brain — keeping its learned input→hidden + turn/thrust
  weights + LEAK and seeding the new actions ~off — rather than reseeding) + a **6-gene** trait genome `gn` (size/speed/tol + fin/eye/body)
  + **internal-drive state `hg`/`fe`** (hunger/fear — persistent motivation scalars fed back as the **last two brain inputs**, `config.js DRIVE`;
  hunger accrues with time-since-meal & is sated by eating, fear spikes near a threat & decays — the NN wires them to its gated actions)
  + a **natal-home anchor `hx`** (the fish's birth x — the reference for **SPATIAL COGNITION**: `species.js SPATIAL_INPUTS` appends 3
  allocentric brain inputs before the drives — `compass∠sin`/`compass∠cos` (absolute body heading) + `home∠x` (signed horizontal
  bearing to `homeX`) — so on the recurrent brain, **homing / site-fidelity / spawning-migration can EVOLVE**, emergent not scripted;
  pure functions of sim state → deterministic; new-sensor columns zeroed on migration so evolved brains survive the input add)
  + **RICHER PERCEPTION** (`species.js PERCEPTION_INPUTS`, between the spatial block and the drives): a **lateral-line / rheotaxis
  `flow`** sense (the signed local current — MECHANOSENSORY, so **not** clarity-scaled → works when vision fails, the murky-water
  fallback) + a **`prey size`** sense (relative size of the nearest catchable fish, 0 for non-piscivores → evolved prey-size
  selectivity, coupling to the gape/`canEat` system)
  + **LIFETIME LEARNING** (within-life neural plasticity, `config.js LEARN`, `core.js reinforce`): each fish runs a **PLASTIC
  policy `a.lw`** (a working copy of the genotype that `forward` executes), reshaped in-life by a **3-factor reward-modulated
  HEBBIAN** rule on the W2 (hidden→output) block — when the fish EATS, the action just taken is reinforced; a homeostatic decay
  pulls `a.lw` back toward the genotype (transient, bounded) + a hard clip. It is **BALDWINIAN, not Lamarckian**: the inherited
  genotype `a.g` is never written, so ALL reproduction/serialization uses `a.g` (offspring inherit the evolved brain, not the
  learned weights). Pure/deterministic (no RNG); `a.lw` is transient (re-derived from `a.g` on load → no save-format change);
  **plants carry trait genes `g` + colour `hu`**;
  env serializes the `nh4`/`no3`/`phos`/`cyano`/`sedP`/`dom` fields; `environment.load` tolerates field-grid size
  changes + splits older `din`/`nut` saves + defaults a missing `cyano`/`dom` to the seed (seed strain / 0)).
  **Genome-length guard (`world.js fitGenome`):** an exact-length save loads as-is; a recognized older shape is
  **migrated, preserving evolved weights** — `migrateGenome` lifts a 2-output (and/or pre-recurrence) brain to the
  5-output recurrent layout, and **`migrateGenomeInputs` lifts a fewer-input brain to the current input count** (copies
  W1 row-by-row at the new stride, **zeros the new sensor columns**, copies B1/W2/B2/LEAK verbatim) — so adding a sensor
  no longer wipes evolved brains; only an unrecognized length reseeds (clean, never NaN).
- Per-area balance is tuned for the old ~45–150-agent density; at 2048×1152 that's ~200–360
  live agents (up to `GLOBAL_MAX` ≈ 1012). Since Phase 5 (logistic + immigration, no hard floors) the standing
  population is **more variable** (a 3-yr balance ranges ~49–393) as the planktivore boom-bust runs its course.

## Where things live
- **Balance knobs:** `config.js`. World size is `WORLD.W/H` (everything else derives via
  `WORLD.AREA_SCALE` / `scaleCount`). Also **`TIME`** (the master calendar — `DAY_LEN`/`YEAR_LEN` → derived
  month/season; the single source `SEASON.YEAR_LEN`/`ENV.DAY_LEN` reference; per-species lifespans/maturation/
  `spawnPeak` live in `species.js`), `BASIN` (bed shape + `bedY(x)`), `SEASON`/`THERMAL`
  (year length, stratification, sediment O₂ demand, turnover mixing, `WIND_EROSION` = storms break
  the thermocline), `WIND`, `FLOW` (inflow
  current + nutrient), `TURBIDITY`, `STRUCTURE` (reeds/logs) + `COVER` (refuge) + `SCHOOL` (predator-confusion/dilution:
  a dense shoal shrinks a predator's strike reach → schooling is adaptive) + `ACTION` (the brain-gated action space —
  strike/flee/hide burst/freeze/conceal magnitudes + energy costs) + `MOTION` (locomotion realism — `velHeading` carving
  turns + turn-speed-loss + burst-and-coast stroke pulse) + `DRIVE` (internal-state motivation — hunger/fear gains/decay
  fed back as brain inputs), `TIME.LIFE_SCALE` (global lifespan multiplier), `DAY_LEN`,
  weather, the O₂ budget (incl. `ENV.HYPOXIA*` + `ENV.THERMAL_STRESS` for the thermal/O₂ niches),
  `NUTRIENT` (N/P pools + Liebig) + `SED_P` (sediment-P redox) + `NCYCLE` (nitrification/denitrification) +
  `MICROBE` (the microbial loop: bacterial DOM decomposition — `BACT` rate, `Q10`/`REF_TEMP` temperature dependence,
  `O2_HALF` O₂-Monod, `O2_COST` respiration demand, `DIFFUSE`),
  `PHYTO` (phytoplankton) + `CYANO` (N-fixing cyanobacteria strain) + `PLANKTON` (zooplankton graze/starve +
  `FALLBACK_*` = planktivore facultative omnivory: hungry minnow/sunfish graze phyto when zooplankton is scarce →
  they self-sustain through the boom-bust trough) + `MUSSEL` + `INSECT` (aquatic insects: benthic larvae develop with
  warmth & feed bottom fish, then EMERGE as a surface hatch that feeds surface fish — the bed→surface cross-boundary flux) +
  `SNAIL` (benthic algae-grazing gastropods: recruit ∝ algae, scrape the near-bed phyto, food for sunfish/carp/crayfish) +
  `CRAYFISH` (benthic omnivore: recruit ∝ detritus, cover-seeking + crepuscular, prey on snails, forage for bass/pike/catfish),
  `IMMIGRATION` (Phase-5 carrying capacity: `RESCUE_N`/`RATE`/`REFUGE` rescue knobs; per-species `pop.max` = logistic K),
  `SPAWN` (seasonal breeding: `FLOOR` off-season floor + `SHARP` season width, × per-species `spawnPeak`),
  detritus rates, `PLANT` (incl. **seasonal phenology** `GROW_TEMP_MIN/OPT`/`SENESCE`/`WINTER_MIN`/`SENESCE_TO_DOM` +
  the **light-starvation** depth limit `LIGHT_MIN`/`SHADE_DEATH`), **`MACRO`** (macrophyte varieties: per-form `zone`/
  `maxH`/`grow`/`cover`/`o2`/`palat`/`lightMin`/`tempMin`/`hue`/`form` — these are the **baseline** the per-plant
  trait genes multiply: `core.js PLANT_GENE_KEYS` + `randomPlantGenes`, mapped to effective per-plant params by
  `world.derivePlant`), **`COMPETE`** (`RADIUS`/`SHADE` — macrophyte **shading competition**: a taller plant cuts a
  shorter neighbour's effective light → stratified canopy + self-thinning, selecting for height/shade-tolerance),
  `CAMERA`. Per-species
  `tempOpt/tempTol/o2Crit`/`spawnPeak`/`matureAge`/`maxAge`/`clutch` live in `species.js`.
- **Camera/rendering:** `camera.js` (pure transforms/pan/zoom/follow/tour); `render.js`
  (camera-space draw to an offscreen scene canvas, curved bed, culling, `SpriteCache`, LOD tiers, O₂/temp overlays, minimap);
  **`glpost.js`** (WebGL2 GPU post-processing presenter + Canvas2D fallback — bloom/tonemap/refraction/grade/vignette).
- **Per-species values:** `species.js` (`SP` registry: size, brain `shape{in,hid}`,
  `inputLabels`, `diet`, speeds, metabolism, breeding thresholds, `zone` (depth band), `drift`
  (current susceptibility), `senses`, `draw`).
- **Step order:** `world.js` `World.step(dt)` — env fields (incl. the microbial loop) → spawn plankton → detritus
  sink → (on expiry) dissolve into `env.dom` → insect larvae/hatch → benthic inverts (snails graze + build snailGrid →
  crayfish crawl/prey-on-snails + build crayGrid) → plant growth → rebuild spatial grids → per-agent (sense → forward →
  smooth controls → move (turn-authority + edge-avoid + side-wall turn / bed-surface glide) → hypoxia → feed →
  reproduce [logistic, density-dependent] → death→corpse) → corpse sink/fade → immigration rescue (edge entry) →
  compact arrays (incl. corpses) → sample time series.
- **Habitat structure & cover:** `world.js` `_genStructures()` (reeds on shores + logs on the
  bed, saved in `toJSON`), `world.coverAt(x,y)`, refuge applied in `takePrey()`.
- **Environment fields:** `environment.js` (day/night + seasons, weather FSM, depth-stratified
  temperature `tempAt`/`metabAt`, wind + inflow current `windAt`/`flowAt`/`currentAt`, **turbidity**
  `clarity`/`secchiDepth`/`attenuation`, O₂ + nutrient + **phytoplankton** (`phyto`/`meanPhyto`/
  `grazePhyto`) `Float32Array` fields with photosynthesis/respiration/aeration, **benthic sediment
  demand**, the **microbial loop** `microbialLoop` (DOM `dom`/`domAt`/`meanDOM`/`addDOM` → Q10 + O₂-Monod bacterial
  decomposition consuming O₂ + remineralizing N+P), stratification-gated vertical O₂ mixing `diffuseO2`, and a
  **turnover overturn** term).

