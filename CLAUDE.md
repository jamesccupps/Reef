# CLAUDE.md — Synapse Reef

Working brief for Claude Code. **Read this, then `ROADMAP.md` (the plan) and
`SESSION_STATE.md` (where we are), before changing anything.**

## Vision
A whole-lake ecosystem where every organism is driven by its own neural network, and
as many real ecological processes as we can model interact to produce emergent,
believable behavior. It should be **large, detailed, realistic, and beautiful full
screen** — part scientific toy, part living screensaver. Today it's a six-fish pond;
the goal is a full lake: many trophic levels, distinct habitats, seasons, water
chemistry, and cross-boundary life (insects, amphibians, birds) — without losing
detail or performance.

## Architecture — current design, open to revision
These are the invariants of the **current** implementation and the reasons behind them. You
are free to propose and adopt a different architecture, tech stack, or runtime if you judge
it better for the vision (see `HANDOFF_PROMPT.md`). If you do, carry the *principles* — a
testable simulation core, determinism, separation of simulation from rendering, and
verification before claiming — into the new design.

- **Pure simulation core, DOM-free and Node-testable:** `core.js`, `config.js`,
  `species.js`, `environment.js`, `world.js`, **`camera.js`**. Never reference `document`,
  `window`, `canvas`, `localStorage`, etc. in these. `species.js` has `draw()` functions, but
  they only call a passed-in `put()` callback — they never touch a canvas — so the module
  stays import-safe in Node. `camera.js` is pure math (the viewport size is passed in as
  numbers), so its transforms/clamping are unit-tested headlessly. Keep new simulation
  subsystems in this pure layer.
- **Browser layer, never imported by the sim test (but covered by `test/smoke.mjs`):**
  `render.js`, `inspector.js`, `ui.js`, `main.js`, **`glpost.js`**. DOM/WebGL are fine here. `render.js` draws the
  world (to an **offscreen scene canvas**) through the camera with culling + LOD + a sprite cache (see Current state);
  **`glpost.js`** is a **feature-detected WebGL2 presenter** that composites that scene to `#tank` on the GPU (HDR bloom / tonemap /
  refraction / volumetric god-rays+caustics / grade) and, when `renderer.glFish` is on, **draws the fish as directionally-lit GL
  quads** into an HDR scene-FBO before the post. The whole GPU path is now **linear-HDR** (the photoreal-roadmap slice 1, 2026-06-18):
  scene + fish sprite textures upload as **`SRGB8_ALPHA8`** so the sampler hardware-decodes sRGB→**linear** (fish use straight alpha,
  premultiplied after lighting); all bloom/god-ray/caustic/scatter/tonemap work runs in linear on the RGBA16F FBOs; `FRAG_COMP` does
  the single **linear→sRGB encode + ±1 LSB TPDF dither** as the final write (live `present.exposure` knob). A Canvas2D blit + 2D-fish
  fallback keeps the headless smoke stub (no real WebGL2) and any no-WebGL2 browser working — the sim layer is untouched by all of this.
- **ES modules need a server** (browsers block module loading over `file://`):
  `python3 serve.py` or `python3 -m http.server`.
- **Determinism:** the sim uses a seeded RNG (`core.js`) and a fixed timestep. Keep both —
  the headless test and reproducible runs depend on them. **Render/camera cosmetic randomness
  (tour subject, rain, star twinkle) must use the non-seeded JS PRNG, never `core.rand`** — or
  it desyncs the sim.

## The gate
`npm test` = `node test/headless.mjs` (pure sim + camera math) **and** `node test/smoke.mjs`
(committed DOM-stub browser-layer smoke). Run after every change and keep both green. Extend
them whenever you add a subsystem (assert the new invariants + a performance budget).
`test/smoke.mjs` fakes `document`/`canvas`/`window`, constructs `Camera`/`Renderer`/`Inspector`/
`UI`, and drives `draw()` at several zoom levels — extend it when you touch the browser layer.
`npm run balance [years]` (`test/balance.mjs`) is a **non-gate** long-run analyzer — prints the
trophic web / O₂ / nutrients / phyto / seasons over several simulated years; use it to tune balance.
**You (Claude Code) probably cannot open a real browser — say so, lean on the headless +
smoke tests, and ask the human to visually confirm anything that renders.**

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

## Scaling up — status (Phase 0 done) & what's left
The display foundation is built. To **grow the lake**, change only `WORLD.W/H` in `config.js`
(densities/caps/field-grid auto-scale); then run `npm test` to confirm the perf budget still
holds and ask a human to eyeball it.
1. ✅ **Camera/viewport** — `camera.js` + camera-space `render.js`; only the visible region is
   drawn. (Don't just enlarge the canvas — the camera is how "larger but detailed" works.)
2. ✅ **Culling + LOD** — off-screen agents skipped; far agents are tinted dots; mid/near use
   cached sprites.
3. ✅ **Sprite caching** — `SpriteCache` in `render.js` renders each organism once (via the
   `put()` draw) into an offscreen bitmap keyed by (species, growth, hue, light, frame) and
   `drawImage`s it (LRU-capped). Go to WebGL/instanced sprites only if counts hit many thousands.
4. **Sim cost (not yet needed).** Spatial grids are O(local) and nets are tiny; the sim does
   ~630 steps/s at ~300 agents. If the main thread strains at much higher counts, move the sim
   into a Web Worker + OffscreenCanvas. Keep the fixed timestep + seeded RNG.
5. **Stay config/scenario-driven.** Still TODO: a scenario/preset system so different lake
   setups (size, trophic makeup, climate) are data, not code.

## How to extend
- **Add a species/organism:** copy an `SP` entry; set `size`, `shape`, `inputLabels`
  (length MUST equal `shape.in` — the headless test asserts this), `diet`, speeds, bio
  params, `senses(agent, world)`, `draw(agent, put, t, env, o)`, `spawnPos`, `randomHue`.
- **Add a sensor:** bump `shape.in`, add a label, write the value into `agent.act.in[i]`
  in that species' `senses()`. The inspector renders any shape automatically.
- **Add a resource/field:** array + spawn/decay rule in `world.step()`, a spatial grid if
  counts are large, a `q*` query helper, a `diet` flag + feeding branch, and rendering.
- **Persistence:** `world.toJSON()/load()` (full state) and `champions()/seedFromChampions()`
  (best brain per species). Bump the `version` field when the shape changes.

## Working agreement
- One coherent slice per session. **Never leave the sim unrunnable** or the headless test
  red. Commit small.
- Prefer complete, drop-in modules over fragments. State honest tradeoffs.
- At the end of every session, update `SESSION_STATE.md` (done / in-progress / next /
  decisions / known issues) and the headless test.
