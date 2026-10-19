# ROADMAP — Synapse Reef → a whole-lake ecosystem

The goal: a large, detailed, realistic lake where every organism runs on a neural network
and many ecological processes interact — and it looks great full screen. This is the
backlog. Work **top-down**: Phase 0 unlocks everything else, so do it first. Each phase
lists what to build, a *definition of done*, and how to verify. Keep the pure/browser
split, keep `node test/headless.mjs` green, and update `SESSION_STATE.md` each session.

> **Status (2026-10-11): read this first.**
> - **Done and shipped:** Phases 0–1; Phase 2's biogeochemistry and benthic web; most of Phase 4 (multi-gene genome, mate choice, seasonal spawning and clutches, lifetime learning, evolvable brain size); Phase 5's carrying capacity and immigration; and the graphics passes 1–3.
> - **The audit fixes are done too** (see `AUDIT.md`): closed P/N budgets, a wet/dry mask, exact save/resume, a newborn grace period, plant overwintering, and the GL orientation fix.
> - **Older text below may still say TODO for things that are done.** `docs/FEATURES.md` is the authoritative description of what exists.
> - **Open, in priority order:** see "Build order & guards" at the bottom of this file.
>
> **Phases 0, 1, Phase 2 core, the "lake realism" slice, and per-species thermal/O₂ niches are DONE
> (2026-06-14).** A full 8-domain realism research pass (synthesized + adversarially verified against
> the code) produced a large prioritized backlog of additional limnological/ecological systems — see
> **"Realism research backlog" at the bottom of this file**. That backlog is the menu for the next
> sessions; items are tagged by phase, impact, and cost, with a recommended build order.

## ▶ Agreed plan (human, 2026-10-14) — supersedes older phase orders
1. **Finish implementing and make it accurate.** The bioenergetics/food-web leftovers (the bed's organic layer feeding
   the benthos, pike in year 2, perch growth), then **visible evolution** (trait history and variance over time, saved
   history, fast-forward).
   - **Self-sustaining over years, not one** (2026-10-19): the first 3-year runs of the 3-D lakes collapse in years 2–3 (a
     year-1 zooplankton boom grows the planktivores; the sunfish, killifish, fallfish and then the pickerel go) — NEXT, stage R,
     the planktivores' regulation (the young's first winter, the larvae's own food, white perch adult mortality, the year-1
     zooplankton; docs/HOT_BROOK_3D.md §4); every balance change judged on ≥ 3 seeds × ≥ 5 years from then on.
2. **Full review of the presentation:** the GUI, the graphics, the webpage's information text, and the graphs/charts.
   Known items: far-zoom wildlife silhouettes (turtles were rectangles — fixed 2026-10-14; re-check the rest).
3. **Landscape: several lakes, ponds, streams and rivers**, connected. Water itself becomes a dynamic quantity here
   (human notes 2026-10-14):
   - **A water budget and a moving water level:** rain, snowmelt and stream inflow in; evaporation, outflow and seepage
     out; ice as stored water. The level rises and falls with weather and season (today `bedY`, `H` and the wet mask
     are fixed everywhere — the biggest structural change of this stage).
   - **Rain and inflow as distinct water:** rain leaves a fresh, dilute, slightly different-temperature layer on top
     that mixes in over hours to days; a stream's water enters at its own temperature and chemistry — cold inflow sinks
     under the lake (underflow), warm inflow spreads over the surface — carrying its own O₂, nutrients and sediment.
   - **Sediment that moves:** erosion of banks and catchment with rain (more in storms and floods), suspended sediment
     carried by flow (turbidity as real material, not a weather number), settling where the water slows (deltas at
     stream mouths, the deep basin slowly filling — the shallows creeping out over years), resuspension by wind and
     bottom-feeding fish.
   - **Things that drift:** plant fragments, leaf litter and wood carried by the current and deposited downstream;
     organisms (fry, invertebrates, plankton) drifting between connected waters.
   - The organic bed layer built in step 1 (`SEDOM`) is the hook for the sediment part: erosion and deposition move
     both mineral sediment and that organic matter.
   - **Fish moving through the connecting streams** (human, 2026-10-15, from experience at Upper and Lower Hot Brook Lake,
     Maine): sunfish gather in warm pools of the stream between the lakes in summer. RESEARCH FIRST (before designing the
     streams): summer use of warm stream pools, backwaters and inlets by pumpkinseed / redbreast sunfish and other lake
     fish; movement between connected lakes (seasonal, spawning, thermal); how warm those pools run and how long fish
     stay; what draws them (warmth for growth, food, cover, spawning). Real streams are also nursery and thermal refuges.
     → STARTED 2026-10-15 (the Maine re-base): the world is a lake + stream + pond after the Hot Brook lakes (docs/reports/
     Maine lakes ponds and streams.md). The human's first-hand Hot Brook (2026-10-15): "all the sunfish are in the stream
     between the lakes", in pools 3–4 ft deep with lots of fish; chain pickerel in the lake; lots of freshwater mussels.
     Make the pools sunfish habitat by mechanism: warm sunlit pools (shallow-water heating), lake-outlet food (the outflow
     carries the lake's plankton — done — plus drift and the outlet's dense filter-feeding invertebrates), cover, current.
   - **The Maine re-base, in order** (2026-10-15, human-approved): ✅ juvenile compensation + plastic maturity; ✅ the
     landscape; ✅ the MAINE FISH (golden shiner, pumpkinseed, white sucker, white perch, smallmouth, chain pickerel; keep
     yellow perch and bullhead — FEATURES "Maine re-base, part 2"); the Maine calendar (a curve with a steep spring: ice-out
     ~Apr 23, 208 days < 10 °C, a 24 °C peak — prototyped), coloured mesotrophic water and under-ice O₂; stream behaviour;
     then multi-seed validation and merge.
   - **The land, the shore and the air** (human, 2026-10-15: "how everything interacts in and out of the lake needs to be
     taken into account, plants and animals and weather and everything"; "model the actual environment… first"): the world
     gains real banks above the water, the air (sky, weather, the loon flying in, frogs on the bank, turtles hauling out, fish
     rising to insects) and the catchment, as SIMULATED mechanisms, shown in a 2.5-D cut-away view. Done first: the real
     environment as a 3-D model (`tools/hotbrook/`, artifact https://claude.ai/artifact/7e75Q4UqJJw4jEfx5gF7ye) and the research
     (docs/reports/Maine lake shores and catchment.md — ranked mechanisms: catchment water and loads on a hydrograph, colour,
     snow on the ice, shore predators as a depth × size × light risk, shore wood, insects across the waterline, leaves, shade,
     wind, turtles, frogs…). OPEN (human to decide): the sim's lake as the real, shallow Upper Hot Brook (5.5 m max, never
     stratifies) or a deep generic Maine lake. Then: design (four-season walk-through) → build in stages.
   - **Fish where anglers find them** (human, 2026-10-15: "perch holes and where to find bass… fishing and ice fishing"): a
     season-by-season, day-and-night audit of every species' habitat against field and angler knowledge (research notes in
     docs/research_notes/Seasonal fish habitat use/; probe `test/diag/habitat.mjs`) — perch schooling in the deep holes under
     the ice, smallmouth on rocky drop-offs in summer and deep and torpid in winter, pickerel in the shallow weeds all year,
     pumpkinseed in the warm shallows, white perch roaming schools, bullheads on the bottom at night — reached through
     mechanisms (temperature, O₂, food, cover, light, predation, innate drives), not scripted positions.
   - **Crayfish:** Maine's crayfish are the native virile crayfish (94 % of those caught at 1,061 Maine stream sites, Marquis
     et al. 2009); a bass the human caught in another Maine lake had one in its stomach. Smallmouth now sense crayfish as
     prey. Later: virile crayfish life history (size classes, moulting, burrows), and the rusty crayfish as an invasive what-if.
   - **Plants accurate to New England / Maine** (human, 2026-10-15): today's four macrophyte forms are generic
     (`config.js` `MACRO`: pondweed, milfoil, water lily, muskgrass). Re-base them on Maine's flora — RESEARCH FIRST (Maine
     DEP / Maine Natural Areas Program / Lake Stewards of Maine plant surveys): which emergent, floating-leaved and submerged
     species dominate Maine lakes, ponds and stream margins (e.g. pickerelweed, bulrush and bur-reed at the edge; yellow and
     white water lilies and watershield floating; native pondweeds, waterweed, tape grass, bladderwort, pipewort, native
     milfoils and muskgrass submerged), their depth zones, light/colour limits, seasonal timing, palatability and cover;
     which are invasive here (variable-leaf milfoil, Eurasian milfoil, hydrilla, curly-leaf pondweed) for what-if scenarios;
     and the emergent reeds/structure and streamside plants. Then each `MACRO` form becomes a real Maine species (or guild)
     with its own parameters.
   - **Mussels:** freshwater mussels are abundant at Hot Brook (human). Today they're filtering beds (`MUSSEL`). A native
     unionid model (eastern elliptio and kin): a population with growth and mortality, filtering, biodeposits feeding the
     bed, and larvae (glochidia) that ride on host fish gills (yellow perch, others) — a fish–mussel link.
4. **What-if controls:** change a variable (warming, nutrient loading, stocking, pollution, rain) and see the response.
5. **Genetic variation, gene flow and adaptation (human, 2026-10-16: "make sure the fish have genes … new fish come in and
   sometimes they're different … if a pollutant gets introduced, maybe some fish are more resistant due to genes").**
   What the 3-D fish already have: 7 heritable trait genes (`core.js` GENE_KEYS: size at maturity, speed, tolerance, fin, eye,
   body, brain size — `fish3.js _traits`; `tol` sets each fish's heat, O₂ and under-ice limits at a metabolic cost) plus the
   brain's genome; founders vary ±5 % around 1.0; every spawning gives its young a crossover of both parents with mutation;
   selection acts through survival and reproduction. What's missing, to build after stage R (real time):
   - **Gene flow — new fish arriving.** Fish come in from the regional population (up the inflow stream into Upper, up the
     outlet into Lower) at real immigration rates, carrying their own population's gene distribution (not the lake's) — a
     source of new variation and of "different" fish. The 2-D sim has `IMMIGRATION`; the 3-D has none yet.
   - **Variation that lasts.** `crossoverGenes` BLENDS the parents (their mean), which halves the genetic variance every
     generation unless mutation restores it. Replace it with Mendelian polygenic inheritance (each trait the sum of several
     diploid loci, each young drawing one allele per locus from each parent), so variance persists, recessive variants hide
     and re-appear, and rare resistance alleles can sweep under selection. And a school agent carries one genome for its n
     fish, so a school species' variation lives only between schools: give school agents a small gene pool (a few genotypes
     with their shares) instead.
   - **Pollutants and heritable resistance.** A new trait gene per stressor class with a cost when unneeded (detoxification
     is metabolically expensive), and the stressors themselves as what-if scenarios on the 3-D water: a biomagnifying
     contaminant (mercury / PCB — the 2-D sim's `TOX`), road-salt chloride from the shore roads, acid pulses at snowmelt (Maine's
     acid-rain legacy), a pesticide or spill pulse in the inflow. The real precedent: Atlantic killifish in four polluted US
     estuaries evolved dioxin-like-PCB resistance within decades (Reid et al. 2016, Science), and Hudson River tomcod through a
     single AHR2 variant (Wirgin et al. 2011, Science) — so the sim should be able to show a resistant genotype rising after a
     pollutant arrives, at a cost elsewhere, and falling back after cleanup.
   - **Show it:** each trait's distribution over time per species (the 2-D sim's evolution history), the immigrants' share.
6. **The land as the maps show it (human, 2026-10-16).** "When you turn the terrain height to 1, the trees are smaller and it
   looks like there aren't enough, it's not dense enough … we should add roads and buildings to the surrounding terrain like
   they are on the maps too." Now that the terrain is the 2017 lidar:
   - **Trees.** Real canopy density and placement: from the lidar's first returns (canopy height = surface − bare earth) or
     from NAIP's near-infrared (a 1-m canopy map). Keep them dense at every land height; trees shouldn't shrink with the
     land-height slider.
   - **Roads and buildings.** The camp roads, the town road, the camps on Upper's east shore with their docks, and the
     fields: from public sources (OSM roads and buildings; the camps traced from NAIP), drawn on the land.
   - **The human's Google Earth images** stay the reference to check them against.
   - **The scale (human, 2026-10-16: true-size trees "all seem a bit tall to the size of the lake … it's just supposed to be
     realistic").** Trees are true size; the lakes are drawn at 1/10 of their real width, so every real object on the land
     stands 10× tall against them. The only fully realistic fix is a truer-scale lake: 1/5 (4× the water cells and fish)
     or true size (100×) — with the water model and the fish on the GPU (WebGPU compute). A later, deliberate decision.
7. **Water levels that vary (human, 2026-10-16).** "The lake level can vary, not just by time of year but sometimes by the
   year … on a drier year the brook was real low, you could walk through parts." This needs a water balance: rain, snowmelt,
   evaporation, the inflow, the outlet's sill. The stage then rises and falls by season and year, and the brook's depth and its
   passage for fish follow it. The lidar's 2017 levels (Upper 128.93 m, Lower 128.23 m) are one datum.
8. **The fish actually in the lakes, in their real numbers, before true scale (human, 2026-10-16).** "Make sure all the fish
   we need are accounted for and in before trying to add them to the environment … all the proportions are correct and
   everything gets an agent that should have one"; "this should only have the fish that are actually in the lakes".
   docs/FISH_CENSUS.md: 11 species (MDIFW's list + the human's redbreast; golden shiner out), ~1,670 fish ≥ 7.5 cm per ha
   (~1.07 M), killifish and dace counted whole; agents: schools for the small schooling fish, individuals for the solitary
   ones, the budget's rest to the biggest perch and white perch (~300,000 agents → every fish ≥ ~20 cm its own brain).
   Built first, then TRUE_SCALE.md T1–T7.
9. **A research paper when the build is done (human, 2026-10-18).** "When we are finished with all of this, we should write
   some sort of research paper, that puts together everything we have researched and found out by testing and making this
   environment." The capstone write-up — see "📄 The paper" below. Its running findings log starts now: `docs/FINDINGS.md`.

Guiding principles:
- **Emergence over scripting.** Prefer mechanisms (energy, senses, selection) that *produce*
  behavior over hard-coded behavior or hard caps. Replace the current re-seed floors and
  population caps with resource-limited, density-dependent dynamics as the web matures.
- **Every number in `config.js`.** New subsystems are config-driven and, ideally,
  scenario-selectable.
- **Honest realism.** Approximate real limnology (light, oxygen, nutrients, thermal
  structure, trophic transfer). It needn't be exact, but it should behave plausibly.
- **Verify before claiming.** Headless invariants + perf budget for sim; DOM-stub smoke +
  human eyes for rendering.

---

## 🌟 North star — a research-grade scenario tool (the long-term payoff)
Once the ecosystem is realistic enough, the goal is for **actual researchers to use Synapse Reef to predict how
environmental changes ripple through a lake**. The same config/scenario-driven engine that makes the screensaver
beautiful makes it a *predictive sandbox*: load a baseline lake, perturb one variable, and watch the cascade.
- **Scenario engine** — a data file (or UI) that sets the lake up and schedules perturbations on a timeline.
  Built on the "scenario/preset system" (already a Phase-0 TODO) once enough subsystems exist to perturb.
- **Researcher-facing scenarios:** **invasive species** introduction (a new `SP` with aggressive traits → watch
  it out-compete natives / collapse a trophic level); **pollution pulses** (nutrient loading → eutrophication →
  fish kills; or a toxicant that raises mortality in a guild); **climate change** (warming the `SEASON`/`THERMAL`
  base → longer stratification → bigger dead zone → cool-water-guild squeeze); **fishing pressure** (harvest a
  species → trophic cascade); **restoration** (cut nutrient loading → does it recover, or has it regime-shifted?).
- **Outputs for prediction:** the instrumentation (depth profiles, trophic biomass, per-species CV/extinction,
  N/P/O₂ time-series) IS the experimental readout. Add **CSV/JSON export of the time-series** + a **baseline-vs-
  scenario diff** so a run is a reproducible experiment (the seeded RNG already makes runs replicable).
- *Definition of done:* a researcher loads a scenario, perturbs one input, and gets a believable, reproducible,
  exportable trajectory of how the ecosystem responds. *(This is the capstone — it needs the realism phases first,
  but every config-driven, headless-tested, deterministic subsystem we build is a brick in it.)*

## 📄 The paper — what we researched and what building the lakes taught (human, 2026-10-18; write when the build is done)
A research paper that puts together everything researched for, and found out by testing and building, the Hot Brook lakes'
simulation. Two halves:
- **The synthesis of the field** — the Hot Brook lakes and brook (the 1949 soundings, the true-scale bathymetry, the fish
  census, the human's own observations), Maine lake limnology, and each organism's sourced parameters: the research notes
  (`docs/research_notes/` — ~60 notes, every number tagged primary/abstract/secondary/inference), `docs/ECOLOGY_RESEARCH.md`,
  `docs/reports/`, `docs/FISH_CENSUS.md`. Where the literature is thin (no chain pickerel age-0 survival, no isoetid dark
  respiration, no young-piscivore attack rates at these sizes), say so: those gaps are findings too.
- **What building and testing taught** — the things only a running whole-lake model could show, each with its evidence (the
  runs, seeds, the gate's checks): model artifacts and their fixes (a uniform plant seeding that hid the beds' real equilibrium
  for every earlier run; super-individual schools that can only meet by coinciding; the coarse block's bed feeding; a
  hand-over bug the GPU exposed), mechanisms that mattered (winter respiration in the cold, energy density by condition, the
  plants' annual budget at their depth limit, the waves' fetch setting the shallow edge, cover by stand), what the lakes need
  to be self-sustaining (recruitment, cannibalism, the census cap), and the engine itself (CPU reference vs WebGPU blocks,
  statistical parity, ~40× speed).
- **Form:** a manuscript (Markdown → PDF; figures from the year runner and the audits, the scripts that made them kept with
  it), Methods reproducible from the repo (seeded runs, the gate). Write it once the lakes run self-sustaining for decades and
  the evolution stage has results — but log findings as they happen in `docs/FINDINGS.md` (one dated entry each: what was
  found, how, the evidence, where it's documented), so nothing has to be reconstructed later.

## "Every organism on its own neural network" — the lower trophic web as agents
The vision is that **every organism is driven by its own NN**. Today only the **fish** are NN agents; the rest are
modeled at the appropriate fidelity, and that distinction is deliberate:
- **Phytoplankton & cyanobacteria are FIELDS, not NN agents — correctly.** They have no *behavior* to evolve (they
  drift, photosynthesize, divide); a neural net needs decisions to make. A reaction-diffusion field is the right,
  efficient model for a producer. *(They're "species in the water," but behaviorless ones.)*
- **Zooplankton & benthic invertebrates ARE good NN-agent candidates** — they *do* make decisions (diel vertical
  migration, predator avoidance, patch selection). Promoting the `plankton` particles to **tiny-MLP agents** is on
  the backlog ("Zooplankton as evolving NN micro-agents with diel vertical migration"); deferred only for perf
  (up to ~2000 of them) until a Web Worker / instancing budget exists. This is the next big step toward the vision.

---

## Phase 0 — Scale & display foundation (the key capability) — ✅ DONE (2026-06-14)
**Status:** built on the 2D-canvas stack. World is **2048×1152** (one config number,
`WORLD.W/H`; densities auto-scale by area). `camera.js` gives pan/zoom/follow/cinematic-tour;
`render.js` draws through the camera with culling, 3-tier LOD (dot/sprite/skip), a lazily-built
sprite cache, a minimap, and a perf HUD. Headless asserts the perf budget + camera math;
`test/smoke.mjs` covers the browser layer. Remaining: human visual confirmation; a Web
Worker + WebGL path only if counts push past a few thousand. (Original brief below.)

The headline display goal: a **much larger lake** with a camera that **zooms smoothly from
the whole lake in one view down to a single organism's detail**, plus pan and follow — at a
high agent count and a steady frame rate. Get this capability working early; the ecosystem
phases below are far easier on top of it. The techniques listed here are one route (and the
right one if you stay on the current 2D-canvas stack); if you adopt a different rendering
approach (GPU / WebGL / WebGPU, an engine, a different runtime), achieve the same capability
your own way.

- **Camera/viewport.** A world much larger than the screen with a camera: pan, zoom,
  follow-a-creature, and a cinematic auto-tour. Renderer draws in world space through a
  camera transform; only the visible region is drawn.
- **Culling + level-of-detail.** Skip drawing/animating off-screen agents; draw distant
  ones as simple dots; optionally update far agents at a lower tick rate.
- **Sprite caching.** Pre-render each organism to an offscreen sprite keyed by
  (species, size bucket, facing, a few animation frames) and `drawImage` it instead of
  per-pixel fills. (WebGL/instanced sprites only if counts hit many thousands.)
- **Performance HUD** (toggle): fps, agent count, draw calls, sim ms.
- **Minimap** of the whole lake with camera rect + density/heat.
- *Definition of done:* a world many times the screen size with **smooth zoom from whole-lake
  overview to individual-organism close-up**, plus pan and follow, at a high agent count
  (pick a target, e.g. 1,000+) and a steady frame rate on a desktop. *Verify:* perf HUD +
  a headless assertion that a large-world step stays within a ms budget.

## Phase 1 — Habitat structure & abiotic environment — ✅ DONE (2026-06-14)
**Status:** complete. A **non-rectangular basin** (`config.js` `bedY(x)`: shallow shores, deep
middle) with **depth zonation** (per-species `zone` bands); **thermal stratification** (`env.tempAt`:
warm epilimnion → thermocline → cold hypolimnion) driven by **seasons** (`SEASON.YEAR_LEN`);
**summer hypolimnetic hypoxia** (sediment O₂ demand + stratification-gated vertical mixing) that
**turnover re-oxygenates**; strong light attenuation (shallow photic zone); depth-local metabolism;
**wind + an inflow→outflow through-current** (with nutrient load) that drift drifters; **turbidity
& Secchi depth** (murk from algae + storms → more attenuation + shorter visual range); and **habitat
structure** — reeds, submerged logs & weed beds giving **cover** (refuge that shrinks a predator's
strike range on hidden prey). Headless probes assert the basin shape, the stratified/turnover
thermal+O₂ profile, turbidity/clarity/Secchi, and structure/cover/inflow; temp/O₂ overlays, the
clarity HUD, seasonal/murk tint, and the reed/log render visualize it. **Deferred to later phases:**
distinct substrate-type mechanics beyond cover, explicit inflow/outflow basin geometry, and
heritable zonation-tolerance genes (→ Phase 4). (Original brief below.)

Make space and physics matter.

- **Depth/zonation:** littoral (shallow, warm, weedy, oxygen-rich), limnetic/pelagic (open
  water), profundal (deep, dark, cold, low-O₂), benthic (bottom). Organisms have zone
  preferences and tolerances.
- **Substrate types:** sand / mud / gravel / rock / weed beds — affect spawning sites,
  foraging, and hiding.
- **Shoreline & morphometry:** reeds, submerged logs, drop-offs, an inflow stream and an
  outflow; a non-rectangular lake basin (depth varies with position).
- **Thermal structure:** summer stratification (warm epilimnion over cold hypolimnion with
  a thermocline) and spring/fall **turnover** (mixing re-oxygenates the depths).
- **Currents & wind:** wind drives surface mixing, waves, and circulation; inflow/outflow
  create gentle flow that drifts plankton and weak swimmers.
- **Light & turbidity:** light attenuates with depth and turbidity (Secchi depth); turbidity
  rises with algal blooms, sediment, and storms — and feeds back on photosynthesis and
  visual predators.
- *Definition of done:* a creature placed deep at night experiences cold + low O₂ + dark;
  turnover visibly re-oxygenates the hypolimnion; wind/inflow nudges drifters.
  *Verify:* headless probes of the thermal/oxygen profile by depth across a simulated year.

## Phase 2 — Lower trophic web & biogeochemistry — 🟦 CORE DONE (2026-06-14)
**Status:** the trophic base is in and the eutrophication loop is closed. Done: a **phytoplankton
field** (`env.phyto`: grows with light × nutrient, makes/uses O₂, shades the water) split from
**zooplankton** (the `world.plankton` particles — spawn ∝ photic-zone algae, graze phyto, starve
when depleted, feed planktivores) → a **phyto→zoo→planktivore chain that cycles**; **mussels** as
benthic filter feeders that clear the water; and **eutrophication** (a nutrient spike → algal bloom
→ turbidity + night/decomposition O₂ demand → crash → recovery). Headless probes assert the chain
and the bloom→cloud→recovery sequence; `npm run balance` shows the web cycling over years with no
extinctions; an Algae-map overlay visualizes the phyto field. **The biogeochemistry cluster is now
deep:** ✅ N/P nutrient split (Liebig co-limitation, P-limited), ✅ sediment-P internal loading (Mortimer
redox), ✅ the **nitrogen cycle** (ammonium⇌nitrate via nitrification + denitrification), ✅ **cyanobacteria**
(the N-fixing strain that wins at low N:P, scums, re-enriches N). **Still TODO in Phase 2:** the microbial loop
in detail, zooplankton as evolving agents, more benthic invertebrates (crayfish, insect larvae, snails, worms),
emergent insect hatches, and pH/CO₂. (Original brief below.)

The base everything depends on.

- **Split the producers/grazers:** phytoplankton (free-floating algae field, drives O₂ and
  is the base food) vs **zooplankton** (real drifting agents or a field that grazes
  phytoplankton and is eaten by planktivores) vs rooted macrophytes (existing plants) vs
  periphyton (on surfaces).
- **Benthic invertebrates:** insect larvae (midge/mayfly/dragonfly nymph), snails, **mussels
  (filter feeders that clear the water)**, worms, crayfish (omnivore/scavenger).
- **Emergent insect hatches:** periodic surface food pulses (mayfly/midge) that fish key on.
- **Decomposers / microbial loop:** detritus → dissolved organic matter → microbial uptake →
  nutrients; bacterial oxygen demand in sediments.
- **Full nutrient cycle:** nitrogen (ammonia → nitrite → nitrate) and phosphorus pools and
  fluxes; **eutrophication & algal/cyanobacteria blooms** that crash O₂ → fish kills; clear
  vs turbid regimes.
- *Definition of done:* a phyto→zoo→planktivore chain that cycles; a nutrient spike triggers
  a bloom then an O₂ crash then partial die-off then recovery. *Verify:* headless mass-balance
  and trophic-transfer checks over a long run.

## Phase 3 — More consumers & cross-boundary life
Fill the web and add drama.

- **More fish guilds/species:** distinct niches and life histories (planktivore,
  insectivore, benthivore, herbivore, omnivore, piscivore; ambush vs pursuit predators).
- **Amphibians:** frogs with a **tadpole (herbivore) → adult (insectivore)** metamorphosis;
  salamanders.
- **Reptiles:** turtles (omnivore/scavenger), water snakes.
- **Birds (top-down from outside the water — great for full-screen drama):** herons wading
  the shallows, kingfishers/ospreys diving from above, ducks dabbling plants/inverts.
- *(Optional)* edge mammals (otter/raccoon).
- *Definition of done:* predation pressure arrives from the surface and the shoreline, not
  just within the water; a tadpole cohort matures into adults. *Verify:* census shows
  cross-guild interactions; no single guild trivially collapses the rest.

## Phase 4 — Evolution & life-history realism
Make the "neural networks" into real biology.

- **Multi-gene genome.** Heritable traits beyond the brain that mutate and are selected:
  body size, top speed, coloration/pattern, sensory acuity, metabolic rate, temperature/O₂
  tolerance, fecundity. Crossover + mutation already exist for the brain — generalize it.
- **Sexual selection & breeding:** mate choice on traits/coloration, courtship, **nest
  building & guarding**, **spawning seasons** tied to temperature/season, **egg → larva**
  stages, parental care.
- **Senescence:** performance declines with age; mortality risk rises.
- **Lifetime learning/memory** (optional, in addition to evolution): location memory or a
  light Hebbian/RL tweak so individuals adapt within a life.
- **Disease/parasites:** density-dependent epidemics; heritable resistance.
- **Behavior:** camouflage/crypsis vs habitat, territoriality/dominance, shoaling (sensors
  exist — let it emerge), **migrations** (diel vertical migration; spawning runs to the
  shallows/inflow).
- *Definition of done:* over a long run, a measurable trait (e.g. mean size or color)
  shifts under a pressure you can name; a spawning season produces an egg→larva→juvenile
  cohort. *Verify:* headless trait-distribution tracking; lineage/heritability sanity checks.

## Phase 5 — Stochastic events & system dynamics
A lake is never at rest.

- **Disturbances:** droughts (level drop, concentration), floods (sediment/nutrient influx),
  pollution pulses, heat waves / cold snaps, **winter ice cover** (gas exchange cut →
  winterkill risk), big storms (mixing, debris).
- **Regime shifts & trophic cascades:** clear ↔ turbid lake states; removing a top predator
  cascades down the web.
- **✅ Density dependence — carrying capacity, not hard floors/caps** — DONE (2026-06-15). The hard re-seed
  floor + repro cap are retired for **logistic density-dependent reproduction** (breeding chance `1 − N/K`,
  K = `popMax`) + **metapopulation immigration / the rescue effect** (`IMMIGRATION`: a rarity trickle below
  `RESCUE_N`, off above it, with a tiny `REFUGE` quasi-extinction backstop). Diagnosed first (floors-off run);
  catfish/carp/minnow now self-sustain (0–19% immigrant) where they were "100% re-seed wallpaper"; sunfish/bass/
  pike lean on immigration (the honest small-lake carrying-capacity truth). Planktivore K lowered for a steadier
  oscillation (paradox of enrichment). No extinction over 3 yr. `stats.immigrants` vs `stats.births` measure the
  dependence. *(Remaining Phase-5: a food-web rebalance so more trophic levels self-sustain; the stochastic-event
  engine + regime shifts below.)*
- *(Optional toggles)* human pressures: fishing, nutrient loading.
- *Definition of done:* a forced perturbation produces a believable transient and recovery
  (or a regime shift). *Verify:* headless before/after-event invariants; no NaNs/instability.

## Phase 6 — Display polish & cinematic mode
Make it gorgeous and legible full-screen.

- **Views:** minimap (Phase 0), a **depth cross-section** view, a **food-web / energy-flow
  diagram**, a **water-chemistry dashboard** (O₂, temp profile, N/P, turbidity, Secchi),
  population & trophic-pyramid charts, the existing brain inspector, hover/click info on any
  organism.
- **Atmosphere:** seasonal color palettes, caustics, depth haze/fog, bubbles, sediment
  plumes, surface reflections, snow/ice in winter, godrays (exist).
- **Cinematic auto-director:** camera that finds and follows dramatic events (a heron strike,
  a pike ambush, a spawning aggregation), slow drifts, day/season color grading — a true
  screensaver mode.
- **Relaxed / adjustable time-scale (screensaver pacing):** beyond the existing pause/normal/
  fast controls, add a **slower-than-real-time "relaxed" speed** (e.g. 0.25×–0.5× sim
  multiplier, or a longer `DAY_LEN`/`SEASON.YEAR_LEN`) for a calm, slow-living-screensaver feel
  when left running on a big screen — fish drift, days and seasons pass gently. Should be a
  config-driven multiplier on the fixed-timestep accumulator (do **not** change the timestep
  itself — determinism depends on it), surfaced as a speed option in the UI and auto-selected in
  fullscreen/cinematic mode. Pairs with the auto-director above.
- **Temperature units (°F / °C):** display water temperature in **Fahrenheit** (with a °C/°F
  toggle, °F default). Internally the sim stays in °C — convert only at the render/UI boundary
  (HUD, pond-stats overlay, temperature-map legend, inspector). Keep `tempAt`/`metabAt` and all
  thermal config in °C so the physics and headless tests are unchanged.
- *Definition of done:* a hands-off cinematic mode that's genuinely nice to leave running on
  a big screen, plus dashboards that explain what's happening.

---

## Cross-cutting / ongoing
- **Keep the pure/browser split.** New simulation logic goes in the pure layer; only
  rendering/UI touch the DOM.
- **Tests grow with the sim.** Add headless invariants + a perf budget per subsystem; keep
  the DOM-stub smoke approach for the browser layer. Keep everything deterministic under a
  seed.
- **Performance.** SoA/typed-array agent storage, spatial hashing/quadtree, sprite caching,
  WebGL, Web Worker sim + OffscreenCanvas — adopt as counts demand, not before.
- **Scenarios/presets.** A data-driven way to spin up different lakes (oligotrophic vs
  eutrophic, with/without an apex predator, different climates) for play and for tests.
- **Docs.** Update `CLAUDE.md` (architecture/state) and `SESSION_STATE.md` (progress) as you
  go. If a phase changes the save format, bump the `version` and keep load back-compatible
  where feasible.

---

## Realism research backlog (2026-06-14)
An 8-domain research pass (water chemistry, lower food web/invertebrates, fish behavior/sensing,
evolution/life-history, cross-boundary life, hydrology/climate, stochastic events, display/cinematic)
was **synthesized and adversarially verified against the actual code** — the critic confirmed every
item below is a *genuine* gap (none already modeled) and flagged the cross-cutting risks noted at the
end. Tags: **impact** (realism payoff) / **cost**. Build top-down within a phase; respect the guards.

### Phase 1 — habitat & abiotic (additions)
- **Spectral light attenuation (R/G/B + UV)** — high/medium. Per-band exponential falloff so clear
  water goes blue-deep and eutrophic water green-shallow; phyto growth uses a weighted band sum (sets
  up blue/green-algae niches); the render water gradient becomes physically derived rather than tuned.

### Phase 2 — biogeochemistry & lower trophic web (additions)
- **✅ Split the pooled nutrient into phosphate (P) + dissolved inorganic nitrogen (N)** — DONE
  (2026-06-14, keystone). `env.nut` → `phos`+`din` fields; phyto/plant growth is **Liebig co-limited**
  = min(N-Monod, P-Monod); detritus/recycling/uptake split Redfield-weighted; the **inflow is
  P-enriched** (runoff) → the eutrophication driver. **Phosphate is the limiting nutrient** (scarce,
  P-Monod ≪ N-Monod), N stays abundant (over-recycled). A P spike drives a bloom (control 0.55 →
  P-spiked 0.70). The UI dashboard shows `N · P (X-lim)`. Save v7. Re-tuned the nutrient budget (low
  `DECAY`, efficient `RECYCLE`) so the web sustains under realistic P-limitation (planktivores still
  reproduce). **Now unlocked:** sediment-P internal loading, the N-cycle (nitrification/denitrification),
  cyanobacteria (N-fixers that win at low N:P), pH/CO₂ — the rest of the chemistry cluster.
- **✅ Sediment-P store with redox-gated internal loading** — DONE (2026-06-14). `env.sedP[col]` (benthic
  P store) + `env.sedimentP(dt)`: **oxic** sediment binds dissolved P out of the water; when the bottom goes
  **anoxic** (reusing the summer dead zone) it **releases** iron-bound P back in — the Mortimer redox switch /
  internal loading. Settling organic P feeds the store; `SED_P.MAX` caps it. Stable over 3 yr (store cycles
  seasonally 0.6–2.3, no runaway), and it slightly *boosts* productivity (the internal-loading feedback).
  Shown in the chemistry dashboard ("sediment P"). Save v8. *(Pairs with the existing summer hypolimnetic anoxia.)*
- **Benthic sediment accumulation — a visible, growing ooze layer** — medium/medium. Today detritus
  just *fades* when it decomposes; instead accumulate a per-column `sediment[col]` that **grows as
  detritus/corpses settle on the bed and slowly mineralizes** (releasing nutrient over time = the slow
  end of the microbial loop, and feeding the sediment-P store). Renders as a **thickening silt layer on
  the bed** — deepest in the basin where organic "snow" rains down, thin on the wave-swept shelf — so the
  lake visibly silts up over the years. Serialized in `world.toJSON`. Pairs with the sediment-P loading
  and the storm-wave resuspension items (a storm can re-suspend the top of the ooze → turbidity + nutrient
  pulse). The render half is also a Phase-6 beauty win (real lake-bed depositional texture).
- **✅ Nitrogen cycle — nitrification ⇌ denitrification** — DONE (2026-06-14). The inorganic-N pool is split
  into **ammonium** (`env.nh4`, reduced, from decomposition/inflow, phyto-preferred) + **nitrate** (`env.no3`,
  oxidized). `env.nitrogenCycle(dt)`: aerobic **nitrification** (NH₄→NO₃, **consumes O₂** — a real O₂ demand in
  the oxygenated column) and anaerobic **denitrification** (NO₃→N₂ gas, **permanently removed** — the real,
  irreversible N sink that keeps **P the ultimate limiter**) are **redox-separated by a hard gate at
  `DENITRIF_O2`** (the SAME 0.25 cline the sediment-P Mortimer switch uses → one coherent redox boundary): above
  it nitrification runs and adds hypolimnetic O₂ demand, below it nitrification HALTS (so it can't draw down the
  dead zone's residual O₂ — that floor stays set by the sediment demand) and denitrification takes over.
  `NCYCLE` config block. Liebig
  N-Monod now reads nh4+no3; recycling returns ammonium; uptake draws ammonium-first. Verified: nitrification
  conserves total N & draws O₂, denitrification removes it (ΣN sink), the oxic lake builds a nitrate pool
  (NO₃ frac 0.50→0.70) and stays P-limited; web stable over 3 yr. Save **v9**. Dashboard shows "nitrate (of N)".
  **Now unlocked:** cyanobacteria (the low-N:P niche the denitrification N sink creates is exactly their edge).
- **✅ Cyanobacteria — an N-fixing phytoplankton strain** — DONE (2026-06-14). A 2nd producer field `env.cyano`
  + `env.cyanobacteria(dt)`: growth is **light × P-Monod × warmth with NO N-Monod** (it FIXES its own N), so it
  **wins at low N : high P** — the regime the N-cycle's denitrification creates. It competes with the green phyto
  for the shared P (green phyto is faster → out-draws it when N is plentiful, stalls and frees P when N is scarce),
  is **buoyant** (floats to a surface SCUM in calm water, mass-conservatively capped; storms mix it down), shades
  the water (turbidity), crashes O₂ on a scum die-off, and **leaks fixed N to ammonium** (`CYANO.FIX_N`) → a net N
  source that counteracts denitrification (the self-regulating end of the N cycle). Renders as a **blue-green
  surface scum**; dashboard "cyanobacteria %". Verified: N-independence, P-competition, buoyancy (storm mixes it
  down), warm-water bloomer, and the **emergent competition** (cyano:phyto share ~300× higher in an N-poor lake);
  balance shows the seasonal phyto↔cyano succession (cyano blooms warm, vanishes in winter), no extinction. Save
  **v10**. *(Unblocks: making the low-N:P regime visible; pairs with future cyano-toxin / poor-grazing refinements.)*
- **✅ Microbial loop: detritus → DOM → Q10 temperature-dependent bacterial O₂ demand** — DONE (2026-06-15).
  Settling detritus now dissolves into a `env.dom` field (instead of an instant nutrient dump); `env.microbialLoop(dt)`
  decomposes it at `BACT × Q10(tempAt) × O₂-Monod`, **consuming O₂** (bacterial respiration) and **remineralizing**
  N (→ ammonium) + P (→ phosphate), Redfield-split — **mass-conserving** (DOM decomposed = N+P released, headless-exact).
  Cold/hypoxic deep decomposes slowly → **DOM accumulates in the hypolimnion** (probed: deep ≫ surface) and the O₂
  demand self-throttles to ~0 as O₂→0 (can't deepen the dead zone). Config `MICROBE`; save **v11**; dashboards: an
  "organic matter" env row + a DOM trace in the water-column profile + a `dom` column in `balance`. 7 headless probes;
  3-yr balance shows no extinction & unchanged CV/immigration-dependence; adversarially reviewed (4 lenses, 0 findings).
  *(The slow benthic mineralization end pairs with the planned visible sediment-ooze layer.)*
- **pH / alkalinity / CO₂ buffering** — medium/medium. A `dic` field reusing the existing
  photosynthesis/respiration magnitudes; derive pH closed-form from DIC+alkalinity; a daytime bloom
  pushes pH > 9 (+ optional ammonia-toxicity coupling).
- **Zooplankton as evolving NN micro-agents with diel vertical migration** — high/large. Promote the
  dumb plankton particles to tiny-MLP agents (sense phyto/light/predator/depth/O₂ → vertical bias);
  DVM emerges. *(Over-engineered as an early move — up to ~2000 of them blows the per-step budget; buy
  DVM cheaply on FISH first via the Phase-4 local-light/temp sense.)*
- **Periphyton: attached-algae biofilm on bed/logs/reeds/macrophytes** — high/medium. Per-surface
  biomass grows with light×nutrient, shaded by turbidity, scraped by grazers — the missing
  attached-production pathway and the food base for a scraper guild.
- **Benthic invertebrates: crayfish + grazing snails** — *population version SHIPPED 2026-06-16 (see the DONE entry below);
  closes detritus→cray→predator & phyto→snail→molluscivore.* Remaining/large: crayfish as a full **NN omnivore agent**
  (decisions, not a population), crayfish eating **carrion (corpses) directly**, and a dedicated **benthic-prey sense** so
  mid-water bass/pike actively hunt crayfish; snails as periphyton-tracking micro-agents once a periphyton field exists.
- **Chemoreception (smell) odor field for benthic foraging** — medium/medium. A diffusing odor scalar
  (reuse `diffuse()`) deposited by detritus/corpses/bitten plants; catfish/carp sense odor
  magnitude+gradient **not** cut by turbidity, so the dark-deep guild forages by plume. *(Needs a
  genome-length guard + save-version bump — see guards.)*

### ✅ Temporal realism — calendar (day:month:season:year) + realistic lifespans + seasonal spawning — DONE (2026-06-15)
- **Shipped (chosen design: "realistic ratios, watchable scale"):** a single master `TIME` block (`DAY_LEN` 60,
  `YEAR_LEN` 1800 → `MONTH_LEN` 150, `SEASON_LEN` 450; `SEASON.YEAR_LEN`/`ENV.DAY_LEN` derive from it). The calendar is
  exact (a year = **12 months** = 4 seasons; `Environment.monthIndex/monthName/yearFrac`, month 0 = March) and units
  are correctly ordered (day < month < season < year) — seasons now last ~7.5 min / many day-nights instead of flipping
  every ~1.5. Per-species lifespans recalibrated to realistic **relative** ratios (~**10× spread** carp:minnow; each
  matures at a realistic **13–33%** of its life; the long-lived persist across seasons) — absolute scale compressed so
  fast species still turn over (true decades would freeze evolution; the explicit tradeoff). **Seasonal spawning**
  (`SPAWN` + per-species `spawnPeak`): breeding peaks in each species' spawning season (a spring/early-summer baby boom;
  pike earliest, cool spring) and tapers to a soft `FLOOR` off-season — a `cos`-bump multiplier on the logistic gate,
  keyed off `yearFrac`. UI shows Month/Season/Year. **+11 headless probes; 3-yr balance: no extinction, every species
  evolving; determinism byte-identical; adversarially reviewed.** *Accepted tradeoff:* realistic K-selected life
  histories raise the larger fish's immigration-dependence (catfish 49% / carp 55% / bass 89% / pike 70%) — honest
  small-lake sink/rescue dynamics. **→ Followed up by the ✅ fecundity/clutch model (2026-06-15):** condition-bounded
  multi-young broods restored much of it (catfish 31% / carp 40% / sunfish 13% immigrant) — bass/pike stay apex-dependent
  (a numbers/prey/mate limit fecundity can't fix). Per-species `SP.clutch`; see the SESSION_STATE log.
- **The problem (today the *ratios* are unrealistic, not just the speed):** `DAY_LEN` = 140 s but
  `SEASON.YEAR_LEN` = 6 × 140 s, so a **year is only ~6 days** (reality: 365) and seasons flip every ~1.5 sim-days.
  Fish `maxAge` is 60–130 sim-s = **~0.07–0.15 *years*** — every fish dies in under a tenth of one sim-year, never
  living through even a full season — and the lifespan spread is only ~2× where reality spans ~10× (minnow ~2–3 yr,
  sunfish ~6–10, bass ~10–16, pike ~10–25, catfish ~15–25, carp ~20–40). `matureAge` 6–16 s ≈ 0.01 yr vs a real
  1–4 yr to mature. So at 1× nothing ages, breeds, or turns over on a believable calendar.
- **The goal:** at **1× speed** the *ratios* should match a real lake — still time-compressed overall, but
  day:season:year and maturity:lifespan:year realistic. Define ONE master compression constant (e.g.
  `TIME.SIM_S_PER_DAY`) and DERIVE everything from real units: `DAY_LEN = SIM_S_PER_DAY`, `YEAR_LEN = 365 × DAY_LEN`,
  per-species `matureAge`/`maxAge` from real **years**, breeding cooldown ≈ one spawning season, growth-to-adult
  over the species' real juvenile span.
- **Why it's a large slice (not a 2-constant edit):** EVERY per-second rate was tuned to today's fast clock —
  metabolism, growth, O₂ (photo/resp/aeration/sediment), nutrient uptake/decay, phyto/cyano growth+decay, the
  microbial `BACT`, immigration `RATE`, mating cooldowns. Re-basing time means re-deriving/re-tuning ALL of them so
  the energy economy + biogeochem stay balanced → a full `npm run balance` re-tune + new headless probes asserting
  the ratios (days/year ≈ 365; lifespan-in-years per species; mature < lifespan).
- **The tension to settle FIRST (with the human):** a strict 1:365 day:year with a *watchable* day (~1–2 min) makes
  a year take hours and a 30-yr carp take days of wall-clock. Options: (a) **single TIME_SCALE, true ratios** —
  most realistic, full years/lives only via fast-forward/screensaver; (b) **two clocks** — a fast *cosmetic*
  day/night plus a separate ratio-correct *biological/seasonal/aging* clock (stays watchable but breaks "one
  daylight cycle = one day of aging"); (c) **pragmatic middle** — compress uniformly to a sweet spot (~30–60
  days/yr, lifespans 2–30 yr) → far better ratios than today while staying watchable. The human's steer ("still
  sped up, but the ratios realistic") points at (c) or (b); confirm before building.

### Phase 3 — more consumers & cross-boundary life (additions)
- **Aerial diving predators (kingfisher/heron/osprey)** — high/large. Above-waterline NN agents with a
  dive state and a `qSurfacePrey(y<STRIKE_DEPTH)` query; they eat via `takePrey` so reed cover already
  foils them. The first top-down predation pressure on the photic zone (and great full-screen drama).
- **Surface-strike threat sense → emergent dive/cover response** — high/small. `qAerialThreat` returns
  overhead birds in a cone; wire 1–2 inputs into prey species; anti-predator diving evolves.
- **✅ Aquatic insects: benthic larvae → emergent surface hatch — DONE (2026-06-16).** *(First "grow the lake" slice.)*
  `world.larvae` (benthic detritivores, recruited ∝ detritus, develop on a temp timer) + `world.insects` (emerged surface
  adults, short-lived, drift) — `config.js INSECT`. A mature larva in warm water EMERGES (bed→surface flux, a warm-season
  swarm ≈570 at peak); bottom fish eat larvae, surface fish eat adults; minnow/sunfish food sense routes insects via
  `qSurfaceFood` (rise-to-hatch, no genome change); uneaten adults lay eggs (closed cycle). Save **v19**; gate green (+6
  probes), 3-yr balance no extinction & **catfish less immigration-dependent** (the benthic level helps bottom fish).
  *(Refinements: a sharper synchronized DUSK pulse vs continuous emergence; a stronger rise-to-hatch so deeper fish are
  drawn up — insects currently sit at y≈2–14 and a deep minnow can't sense them.)*
- **✅ Benthic invertebrates: grazing snails + omnivorous crayfish — DONE (2026-06-16).** *(Second "grow the lake" slice.)*
  `world.snails` (gastropod grazers: recruit ∝ the algae base, scrape the near-bed phyto = periphyton proxy, crawl the lit
  shelf, starve where algae is depleted) + `world.cray` (omnivore/scavenger: recruit ∝ the detritus rain like the larvae,
  walk the bed cover-seeking + crepuscular/night-active, prey on snails) — `config.js SNAIL`/`CRAYFISH`. Two new benthic web
  links: phyto→snail→{sunfish,carp,cray} & detritus→cray→{bass,pike,catfish} (sunfish/carp gained the `snail` diet flag;
  bass/pike/catfish the `cray` flag). Eaten OPPORTUNISTICALLY on the bed (no genome change — no dedicated benthic-prey sense).
  Both rendered (snail domes; crayfish body+claws+legs, LOD'd). Save **v20** (older saves default `snails`/`cray` to []); gate
  green (+6 probes; byte-identical determinism held), 3-yr balance no extinction.
  *(Deferred refinements: crayfish as a full NN agent (it's a population particle now); a dedicated benthic-prey SENSE so
  bass/pike actively hunt crayfish (currently only bottom-foraging catfish reliably reach them); crayfish consuming CORPSES
  directly (carrion); and the attached-PERIPHYTON field the snails really graze — see the periphyton backlog item above.)*
- **Frog tadpole → adult metamorphosis on the littoral shelf** — medium/large. Tadpoles graze phyto on
  the warm shelf, accumulate temp-driven development, become surface insectivore adults; seasonal egg
  clutch. The showcase ontogenetic niche shift.
- **Terrestrial-aquatic coupling: leaf litter + insect fall-in + riparian shading** — medium/medium.
  Autumn-pulsed shore leaf litter (detritus subsidy), edible surface insect particles, and a static
  riparian light/temp shade mask. Unlocks the surface-feeder food base.
- **Invertebrate drift** — medium/small. Benthic inverts flip to a drifting/catchable state (boosted at
  night & in storms), advect with `currentAt`, resettle or exit at outflow. Thin layer on existing flow.
- **Painted-turtle / water-snake bask-and-ambush guild** — medium/medium. Turtle: slow scavenger that
  eats corpses + a must-surface air reserve (emergent vertical migration). Snake: littoral ambush piscivore.
- **Ontogenetic diet shift (growth-gated diet stages)** — medium/small. Generalize the single
  `grow<0.55` juvenile-piscivore hack into a config `dietByGrow` table so cohorts graduate
  plankton→inverts→fish, spreading a population across trophic levels by age.
- **U-shaped cost-of-transport + swim-bladder buoyancy energetics** — medium/small. Quadratic drag-power
  (`DRAG_K·spd²`) so cruising has an optimum and sprint/ambush costs differ, plus a neutral-depth
  buoyancy set-point cost; retire the dead `buoyNight` field.

### Phase 4 — evolution & life history (additions)
- **✅ Per-species thermal & O₂ tolerance envelopes** — DONE (2026-06-14). `tempOpt/tempTol/o2Crit`
  per species; warm/cool guilds + the summer temperature–O₂ squeeze now emerge.
- **✅ Multi-gene heritable genome** — DONE (2026-06-14). A per-individual gene vector (v1:
  **size / speed / tolerance** multipliers in `core.js`) blended on crossover + mutated like `hue`, applied
  as effective per-fish stats (`a.size/maxSpeed/tempTol/o2Crit`) with the cost folded into `metabMul` so
  traits trade off. Selection visibly acts — a 2-yr run evolved **catfish to small/slow/hardy** (size 0.82,
  speed 0.77, tol 1.28: the real thrifty benthic-scavenger strategy). Serialized (save v5). **Still TODO:**
  add the remaining genes (acuity → needs `senseRange` plumbing, fecundity, coloration/pattern), and
  trait-based mate choice (next Phase-4 item) to select *on* them.
- **✅ Local thermal + light fish senses → emergent diel vertical migration** — DONE (2026-06-14).
  Added `light@depth`+`temp@depth` inputs to the four water-column species (minnow/sunfish/bass/pike);
  with the thermal-envelope cost, the substrate for evolved DVM (rise at night / sink by day, find the
  thermocline refuge) is in place. The required **genome-length guard** (below) shipped alongside it.
- **✅ Genome-length guard on brain load/seed** — DONE (2026-06-14). `world.load()`/`seedFromChampions()`
  now reseed any saved/champion brain whose genome length ≠ the species' current `genomeLen(shape)`
  (was silent NaN corruption); `World` save version bumped 3→4.
- **✅ Trait-based mate choice & sexual selection** — DONE (2026-06-14). `world.chooseMate()` replaces the
  nearest-eligible `qMate` in reproduction: it scores every eligible nearby partner by condition (energy) +
  mean trait gene + foraging success and picks the best, so **sexual selection now acts on the genome**.
  Deterministic. **Still TODO:** a heritable *preference* gene (Fisherian runaway) + nuptial coloration.
- **Egg → larva → juvenile life stages + the larval recruitment bottleneck** — high/large. Temp-incubated
  eggs → drifting high-mortality larvae → promote by age; year-class strength emerges. *(Fights the
  re-seed floors — soften/retire them first, a Phase-5 item.)*
- **Nest building, guarding & temperature-triggered spawning season** — medium/medium. Centrarchid males
  claim littoral nests in a warm-season window; guarding raises local egg O₂/lowers predation at a
  foraging cost (a "near own nest" sense). Couples breeding to season + place.
- **Senescence (age-graded decline)** — medium/small. Replace the hard `maxAge` cliff with a Gompertz-like
  decline of speed/metabolism/fecundity + an age-rising mortality hazard. Exposes the fast-vs-slow axis.
- **Disease & parasites: density-dependent transmission + heritable resistance** — medium/medium.
  Infection spreads via `agentGrid` contact scaled by density/temp/condition; drains energy, raises
  mortality, clears over time; a resistance gene with a metabolic cost. Outbreaks ignite in warm crowded shallows.
- **Lateral-line flow/wake sense + chemoreception fallback** — medium/medium. A rheotaxis flow sensor +
  a near-field neighbor-motion "wake" cue **not** cut by turbidity, so schooling/startle persist when
  vision fails — the realistic murky-water sensory fallback.

### Phase 5 — stochastic events & system dynamics (additions)
- **Config-driven stochastic event engine** — *high/medium, the spine for all of Phase 5.* A pure
  `events.js` owned by `Environment`: Poisson arrivals via **core.rand** (sim stream), an active-event
  intensity API that subsystems READ (events never write behavior directly), manual UI triggers, scenario presets.
- **✅ Storm-driven mixing & wind-event turnover** — DONE (2026-06-14). `THERMAL.WIND_EROSION` lets
  rain/storm wind (above a calm baseline) erode `strat`, so the existing `diffuseO2`+overturn
  re-oxygenate the deep — a summer storm now partially breaks the dead zone (verified: deep O₂ ~0.25→0.51
  under a forced storm) while calm weather preserves it. *(Optional deep-nutrient entrainment upward
  still TODO.)*
- **Flood & runoff nutrient/sediment pulses** — high/medium. A flood event scales the inflow load across
  a plume band + adds a settling `sediment` scalar feeding turbidity; the bloom rides existing phyto dynamics.
- **Clear↔turbid alternative stable states (regime-shift bistability)** — high/medium. Close two
  half-built feedbacks — turbidity uproots macrophytes (✅ the light-starvation death exists); dense macrophytes suppress
  local phyto — for two basins of attraction so a bloom can flip the lake turbid and it *stays* turbid. **LESSON LEARNED
  (2026-06-15, an attempt was built & reverted):** a *growth-rate* suppression of phyto does NOT work in a closed
  P-limited lake (the freed P just lets phyto rebound), and routing a per-column P draw into the saturating sediment
  store stalls once it fills. The clear-water arm must model macrophytes **holding P in a tracked standing-biomass
  stock** (P leaves the water while the plant lives, returns to DOM only on senescence/death — the DOM-on-death path is
  now ✅ wired) so a dense bed keeps a standing amount of P out of circulation → genuinely lower water-column P → less
  phyto; then validate **bistability/hysteresis** over a multi-year run (anti-correlate macrophyte vs phyto; perturb and
  confirm the flip persists). Pair with the storm/flood nutrient-pulse events as the perturbation.
- **Top-predator removal → trophic cascade + invasive introduction** — high/medium. An event suppresses a
  guild's re-seed floor/repro (so an apex can actually collapse) or stocks N agents; the cascade emerges.
  First step toward retiring the hard floors.
- **Winter ice cover & under-ice winterkill** — high/medium. An `ice` scalar (off the existing winter
  temp trough) gates surface aeration/wind/light by (1−ice); the existing O₂ sinks make winterkill
  emergent; spring melt re-oxygenates. Marquee seasonal event.
- **Wind-driven internal seiche → thermocline tilt & windward upwelling** — high/medium. A damped-oscillator
  `thermoTilt` forced by wind makes `_stratFrac` x-dependent; cold hypoxic deep water upwells on the
  windward shore. Connects two existing systems; visualizes free in the temp overlay.
- **Evaporation / inflow-outflow water balance & lake-level change** — medium/large. A `waterLevel`
  integrated from inflow+precip−evap−outflow; surface-referenced code reads `env.surfaceY()`; drought
  concentrates nutrients. *(High blast radius — touches every y=0 assumption; lowest priority here.)*
- **Storm-wave sediment resuspension** — medium/medium. Replace the uniform storm-turbidity constant with a
  depth-aware shelf-only resuspension that murks from the bed up, releases sediment nutrient, demands O₂, settles after.
- **Groundwater / spring seeps: cold oxygenated thermal refugia** — medium/small. A few deterministic
  benthic springs (saved like reeds/logs) relax local temp/O₂ toward cool oxygenated values; fish
  emergently aggregate there in summer hypoxia & under-ice winterkill. No new sensor needed.

### Phase 6 — display, cinematic & legibility (additions)
- **✅ Depth cross-section profile (water-column view)** — DONE (2026-06-14). Pure headless-tested
  `world.depthProfile(x, n)` (surface→bed sampler: temp/O₂/N/P/phyto/cyano/light per depth) feeds a **"Water
  column" rail card** plotting temp/O₂/N/P/phyto/cyano vs depth down the column **under the camera** (pan to
  compare littoral vs deep basin), over a sunlit→abyss backdrop — the thermocline, hypoxic deep, nutricline, and
  surface scum all read at a glance. *(Still open as add-ons: a Secchi gauge / trophic-state badge, and the
  schematic teaching overlay below.)*
- **Food-web / energy-flow diagram** — high/medium. Accumulate per-link flux counters (EMA) in the
  existing feeding branches; render compartment boxes sized by biomass with arrows weighted by flux.
- **Event-driven cinematic auto-director** — high/medium. A pure `director.js` scores a ring buffer of
  sim-emitted interest events (kills, bait balls, spawns) with time-decay+novelty and pre-frames imminent
  ambushes; slow-mo punch-in on the beat. *(Camera randomness must use the NON-seeded JS PRNG, never core.rand.)*
- **Volumetric depth haze + caustics + suspended particulates** — high/medium. Three render-only layers
  keyed to existing light/turbidity/attenuation/current: distance fog on sprites, an animated surface
  caustic net, and drifting motes (non-seeded PRNG pool like the stars). Makes the water read as volume.
- **Trophic-pyramid + biomass panel with regime-state readout** — medium/small. A pure
  `world.biomassByTrophic()` feeds a horizontal-bar pyramid + an oligo/meso/eutrophic + stratified/mixed badge.
- **Depth cross-section schematic overlay** — medium/small. A toggle drawing the thermocline band, Secchi
  line, photic/aphotic shading, littoral/drop-off/profundal labels and inflow/outflow arrows — a teaching layer.

### Added from human feedback (2026-06-14, 2nd pass)
- **✅ Species behavioral baselines — an innate ethogram under the NN** — DONE v1+v2 (2026-06-14). Each `SP`
  has an `innate` config; `world.js` applies a **depth-home reflex** (pull scales with displacement → gentle
  near home, firmer when strayed, so the NN drives in its zone) + a **cruise style** (lurkers slow, roamers
  brisk) + **schooling cohesion** (minnow → loose shoals, ~5-7 neighbours) + **ambush lurk-and-burst** (pike
  holds via a weighted blend until prey is close, then bursts). Deterministic (no RNG). Real vertical
  zonation emerges (minnow ~0.30 of column → bass/pike mid → carp/catfish ~0.95 bottom), no extinctions, and
  a 3-yr balance now reports **every species evolving**. Adversarially reviewed (5 lenses): the one
  fix-now — ambush was a hard `Math.min` clamp that *replaced* the NN — is fixed (now a blend).
  v2.1 progress: **✅ catfish nocturnal/diel** activity (`innate.nocturnal` scales the cruise target by
  `1.5 − env.light`). **✅ submerged weed beds + cover-seeking** — added `world.weedbeds` (tall macrophyte
  cover bands on the littoral/drop-off reaching up into *oxygenated mid-water*, rendered + saved), and
  cover-seeking (`innate.cover`) makes sunfish/bass/pike migrate to the nearest cover (`nearestCover`) and
  hold there → pike lurks at weed edges, sunfish hovers in the weeds (seeker cover 0.25 vs minnow 0.02).
  This was the *right* fix for the earlier reverted attempt: cover now exists in mid-water, so it doesn't
  pull cool-water pike into the hypoxic deep. **Still TODO:** **schooling separation + alignment**
  (cohesion-only over-clumps, saturating the density clamp ~⅓ of the time), a real depth-home **band**
  (currently a ~6px line; engages ~95% of steps), **absolute minnow home-depth** (shoals drift deeper over
  the basin), a bass ambush/burst signature, enforce the **ambush sensor index by label** (today `act.in[2]`
  is positional — safe only while pike is the lone ambusher), and fading the innate weight as the brain proves out.
- **★ Info / dashboard SCREEN OVERHAUL — redo the data & charts panel** — *high/large; 🟦 **Slice A DONE (2026-06-16)**.*
  *(Human-flagged 2026-06-16: "the info & display screen where the charts are doesn't have everything; lay it out better,
  show more detail, organize it better, more features.")* **✅ Slice A — "make the hidden sim legible":** 3 new pure
  accessors (`resourceCounts`, `cognitionDetail`, + `speciesDetail` extended with the fin/eye/body morphology genes &
  immigrant-fraction; all headless-tested) feed a **reorganized rail** — a **Food-web card** (census + a live resource-count
  strip [zoo/larvae/insects/snails/crayfish/mussels/detritus/plants] + **fish trophic-biomass bars**), an **Evolution
  card** (per-species **6-gene** mean table + gen + immigrant %), and a **Cognition card** (the brain inspector + fleet
  aggregates: mean hunger/fear, action mix strike/flee/hide, recurrent memory, contaminant burden when a scenario loads).
  Gate green (smoke + headless +4 accessor probes); no sim/determinism change (read-only accessors + browser-only UI).
  **Slices B/C remaining** (the redesign spec below):
  The right-hand panel had grown organically and was **crowded, incomplete, and under-organized** — many
  subsystems the sim computes had NO readout. The remaining redesign:
  - **Reorganize** into clear groups (collapsible/tabbed): **Environment** (temp-by-depth, O₂ surface/thermocline/deep,
    stratification, N/P + nitrate %, sediment-P, DOM, turbidity/Secchi/clarity, phyto/cyano, weather/season) ·
    **Biology/food-web** (per-species census + a live **trophic pyramid / food-web diagram** with biomass per level &
    feeding flux; resource counts: zooplankton, **insect larvae & adult-hatch**, detritus, mussels, plants) · **Evolution**
    (per-species mean **trait genes** [size/speed/tol + fin/eye/body] & their **drift over time**, max generation,
    home-bred vs immigrant %, plant gene drift) · **Cognition** (the selected brain inspector + aggregates: mean
    recurrence/memory, action-rate mix [strike/flee/hide], mean hunger/fear) · **Contaminant** (TOX burden by trophic
    level when AMBIENT>0).
  - **Richer charts:** the History band is overloaded — make it a **selectable / multi-panel** time-series (toggle metrics:
    populations, O₂/temp/light, phyto/cyano/**zoo/insects**, **N & P**, **per-trophic biomass**, mean genes) with a
    time-range. `world.series` already samples phyto/cyano/zoo — wire the rest in.
  - **More features:** a click/hover inspector for ANY entity (fish/plant/insect/larva), an **event/feed log** ("algal
    bloom crashed", "spring hatch", "pike rescued by immigration"), **CSV/JSON export** of the time-series (also the
    research/scenario-engine readout), and a fuller-screen "data mode".
  - **Stay headless-testable:** every number comes from a **pure `world.stats*` / accessor** (like the existing
    `envDetail`/`speciesDetail`/`biomassByTrophic`/`depthProfile`) so `smoke.mjs` can drive the panels; the DOM layer only
    renders. **Gaps to close (computed but not shown):** action-space rates, internal drives, recurrence, the full 6-gene
    morphology genome drift, per-trophic biomass spectrum, aquatic-insect larvae/hatch counts, contaminant biomagnification,
    immigration-vs-home-bred (`world.stats.births`/`immigrants`).
- **★ GRAPHICS / VISUAL-FIDELITY OVERHAUL — make it genuinely beautiful full-screen** — *high / large.* *(Human-flagged
  2026-06-16: "make the graphics better, finally.")* **✅ PASS 1 SHIPPED 2026-06-17 (canvas-2D, render-only)** — see SESSION_STATE
  "GRAPHICS … Pass 1": de-pixelated organisms (BASE 6→14 + finer `su` + **anti-aliased smoothing blit** + **smooth gradient
  counter-shading** + proportional glinting eye; `image-rendering:pixelated → auto`), atmospheric water (**soft additive
  godrays + surface caustics + marine-snow particulates**), smoother flora (thin grass-blade weed beds, round caps), and a
  **day/night/seasonal colour grade + cool vignette**. Human-eyeballed; perf untouched (~282 fps whole-lake). The vision is
  **"large, detailed, realistic, and beautiful full screen — part scientific toy, part living screensaver."**
  **✅ PASS 2 SHIPPED 2026-06-17 (canvas-2D, render-only)** — see SESSION_STATE "GRAPHICS … Pass 2": rich fish art (translucent
  rayed fins, scale texture, gill/mouth, `source-atop` volumetric sheen), particle FX (bubbles, soft contact shadows, strike
  ripples), depth haze + spectral tint, and a region-limited cheap bloom. Human-eyeballed; ~60–75 fps whole-lake @1080p fullscreen.
  **✅ PASS 3 / SLICE 1 SHIPPED 2026-06-17 (WebGL2 GPU POST PIPELINE)** — `src/glpost.js`: the 2D scene → an offscreen canvas →
  composited to `#tank` by a feature-detected WebGL2 presenter (HDR float bloom, ACES tonemap, underwater refraction, chromatic
  aberration, fake DOF, grain, day/night grade, vignette), Canvas2D fallback keeps the gate green. **Recovered perf** (1080p
  whole-lake ~56→~139 fps) + raised fidelity. See SESSION_STATE "Pass 3 / slice 1". Designed via a de-risking workflow + reviewed.
  **▶▶ FOR THE NEXT GRAPHICS WORK, READ `docs/GRAPHICS_RESEARCH.md`** — a synthesized, cited, codebase-mapped REALISM roadmap (5-lens
  web research, 2026-06-17). It supersedes the loose "remaining" bullets below with a prioritized, gate-safe slice order. Headline:
  two foundational gaps — **(1) no linear-HDR/sRGB pipeline** (#1 bug → milky bloom/crushed darks) and **(2) no depth/occluder
  buffer** — fix in that order (linear-HDR float pipeline first, then a depth MRT keystone), then Beer-Lambert depth colour,
  occluder-masked god-rays, per-pixel fish normals + iridescence, HG in-scatter, real DOF+AO, instancing.
  **▼ PASS 3 LATER SLICES (remaining — move DRAWING onto the GPU):** the post pass is done; the scene is still drawn in canvas-2D.
  Pieces:
  - **Water as a volume:** ✅ caustics, ✅ godrays, ✅ marine-snow, ✅ depth haze/fog, ✅ bubbles, ✅ strike-ripple FX, ✅ spectral
    tint, ✅ **GPU underwater refraction** (post-shader UV-warp), ✅ **GPU screen-space volumetric god-rays** (slice 2, march the
    bloom tex toward the sun), ✅ **GPU animated caustic net** + ✅ **in-scatter glow / surface sheen** (slice 2) — *remaining:*
    true **3D volumetric water** + a real **depth buffer** (true DOF/bokeh + occluder-cast shafts, not the screen-space sun-glow),
    a real **surface reflection** line, the spectral tint driven **physically** by the turbidity/attenuation fields.
  - **Beautiful organisms:** ✅ anti-aliased gradient-shaded fish reading evolved morphology + effort, ✅ translucent rayed fins,
    ✅ scale texture, ✅ gill/mouth, ✅ volumetric sheen, ✅ soft contact shadows, ✅ **GPU-LIT fish** (slice 3 — directionally-lit
    textured GL quads in an HDR scene-FBO: cylinder-normal half-Lambert + ambient + Fresnel rim + per-fish haze, lit from the
    surface sun; `renderer.glFish`, 2D fallback), ✅ **distinct per-species silhouettes** (`species.js` body `profile(tn)` +
    parametrized dorsal + ear-spot/scale knobs — pike spindle, sunfish disc, catfish broad-head, carp deep, bass streamline,
    minnow slim) — *remaining:* **instancing** the quads (many-thousand-agent counts), **per-fish normal-mapped** shading (the
    lighting normal is a procedural cylinder), true crispness at any zoom (SDF/vector); GL the dot-tier/shadows/ripples; lusher
    per-variety plants, detailed bed substrate/ooze, prettier reeds/logs.
  - **Lighting & atmosphere:** ✅ day/night + seasonal grade, ✅ dappled surface light, ✅ depth-darkening + haze —
    *remaining:* depth as true **shading** (normals), richer weather mood (storm gloom, ice sheen in winter).
  - **Post-processing:** ✅ vignette + grade + **GPU HDR float bloom** + **ACES tonemap** + **chromatic aberration** + **grain** +
    **fake DOF** — *remaining:* a true **linear-HDR** pipeline (the tonemap currently runs in gamma space on an RGBA8 scene texture).
  - **Constraints:** keep the **pure sim / render split** (this is ALL render-layer — no sim/determinism change) and the
    **perf budget** (cull/LOD must still hold at ~1000 agents; a GL path should *help* here); render/camera/particle randomness
    uses the **non-seeded PRNG, never `core.rand`**; keep `smoke.mjs` green (extend it for any new render entry points). A
    visual pass is the one thing the headless tests can't judge — **lean on a human (or the Claude_Preview screenshot) to eyeball it.**
  - *Definition of done:* a full-screen frame that looks like a living lake — volumetric water, lit & shaded organisms whose
    evolution is still legible, seasonal atmosphere — at a steady frame rate. *(The biggest single lever on the "beautiful" half
    of the vision; sequence it as a focused arc once the ecology/cognition depth is where you want it.)*
- **Configurable lake morphometry & scenarios** — medium/medium. Make basin shape (shelf width/depth,
  drop-off, basin depth — just hand-widened via `BASIN`), size, climate, and trophic makeup data-driven
  presets (oligotrophic vs eutrophic, broad-littoral vs steep-sided, with/without an apex). Extends the
  existing "Scenarios/presets" cross-cutting item.

### Additions — accepted 2026-06-15 (human-approved; build when reached)
Gaps judged against the realism + research-tool vision. Tags: impact / cost.
- **✅ Revisit fish lifespan absolute scale — lengthened — DONE (2026-06-16).** *(Human-flagged 2026-06-15: followed
  individuals, they died in under a month; 2026-06-16: "make it a bit longer.")* Added a single **`TIME.LIFE_SCALE`**
  knob (currently **1.6×**) that `species.js` multiplies every species' `matureAge`+`maxAge` by **once** (after the SP
  literal → single source, all consumers see it). Fish now live & mature ~1.6× longer in sim-seconds (minnow `maxAge`
  150→240 s, carp 1500→2400 s) — a calmer, more believable single life — while the realistic **relative** ratios are
  preserved exactly (the impossibility-triangle trade-off is now a dial). Gate green (maturation fractions still 8–40%,
  ordering intact); 3-yr balance: no extinction, evolution still turns over (gen 53). Dial `LIFE_SCALE` further (2–4×)
  if you want it slower still — accepting slower generational turnover. *(Could later split into separate maturation vs
  lifespan scales if high-mortality mid-predators like bass need faster recruitment — see the balance watch-item.)*
- **✅ Contaminant bioaccumulation & biomagnification — DONE (2026-06-16). *(The research-tool flagship.)*** Each fish
  carries a **body burden** `a.tox` that rises from (1) gill uptake of a dissolved toxicant, (2) a dose per base-food
  meal, and (3) — the key — **assimilating its fish PREY's whole accumulated burden** when it eats one (`takePrey`:
  `a.tox += prey.tox·TOX.ASSIM`), and falls only by **slow first-order excretion**. Because elimination lags dietary
  intake, the burden **concentrates UP the food chain** — verified end-to-end: under a pollution scenario the
  **piscivores carry ~2.3× the planktivore burden** (apex pike/bass hit hardest, the real mercury/PCB story). Above
  `TOX.HARM` it raises mortality. `TOX.AMBIENT = 0` is the **default clean lake** → every term is ×0 and the harm check
  short-circuits, so the slice is a **true no-op by default** (a fresh lake is exactly the pre-slice baseline) — a
  **SCENARIO** sets `AMBIENT > 0` (a pollution pulse) to study "how does a pollutant move through the lake?". Config
  `TOX`; serialized as `tx`, **save v16**. +6 probes (clean-lake inert; the assimilation step exact `0.8×2.0`; end-to-end
  piscivore ≥ 1.5× planktivore; tx save round-trip; HARM-mortality; offspring start clean). **Also includes SUB-LETHAL
  reproductive impairment** (`toxFecundity`/`TOX.REPRO_*`): a contaminated fish's breeding chance falls with its burden
  and hits 0 (sterile) right at the lethal threshold — the classic PCB/endocrine concern (fecundity drops before
  mortality). Inert at AMBIENT=0 (byte-identical baseline). The headline scenario for the research north-star. *(Next:
  tie AMBIENT to the inflow / a flood-runoff pulse via the scenario engine.)*
- **✅ Cyanotoxins / harmful-algal-bloom (HAB) toxicity — DONE (2026-06-16).** A DENSE cyanobacteria surface scum
  (local `env.cyano` > `CYANO.TOX_THRESH`·`CAP`) now releases a toxin: **fish** lose extra energy (`world.js` metabolism
  block: `−CYANO.TOXIN · (cyanoAt − TOX_THRESH·CAP) · dt`) and **zooplankton** die faster (plankton loop: `rand() <
  CYANO.TOX_ZOO·dt` inside the scum) — so a bloom can kill by **POISON**, not only via the night/decay O₂ crash. Exposure
  is naturally **surface-concentrated** (the scum is buoyant), so it mainly hits surface fish (minnows) — deep fish under
  a scum are unaffected. Inert below the threshold (a fresh lake is unchanged). Config `CYANO {TOX_THRESH:0.4,
  TOXIN:0.10, TOX_ZOO:0.4}`. +2 probes (a surface fish drains faster in a forced scum; a persistent forced scum collapses
  the zooplankton). Topical (microcystin HABs); a pollution/climate-scenario amplifier. Determinism preserved (zoo death
  uses the seeded RNG).
- **Density-dependent growth (stunting)** — medium / small. Growth-to-adult is currently pure age (`age/matureAge`).
  Make the growth *rate* also depend on per-capita food / local crowding, so an over-dense, food-poor cohort **stunts**
  (small adults) — the real stunted-bluegill/perch phenomenon. Emergent from existing energy + density; couples body
  size (a fitness/predation trait) to carrying capacity.
- **✅ Seasonal macrophyte phenology — DONE (2026-06-15).** Rooted macrophytes now grow on a **temperature-driven
  seasonal vigor** (`PLANT.GROW_TEMP_MIN/OPT` off `env.tempAt`), **senesce in the cold** (autumn/winter die-back) shedding
  biomass into the **microbial-loop DOM pool** (`SENESCE_TO_DOM` → the realistic fall organic pulse — balance shows
  autumn DOM 0.18–0.23 vs ~0.06 summer), and **overwinter as a grazing- & winter-proof rootstock** (`WINTER_MIN`).
  Plant death is now **light-starvation** (`LIGHT_MIN`/`SHADE_DEATH`) — the emergent depth/turbidity limit (and the seed
  of the clear↔turbid feedback) — instead of grazing-uproot; recruitment is seasonal (≈no winter seeding). 3-yr balance:
  a clean annual cycle (spring-grow→summer-peak→autumn die-back→sparse winter rootstock→regrow), no extinction,
  immigration-dependence held/improved. *(Per-plant params are global now; they become per-variety/heritable below.)*

### Plant realism — varieties, evolution & interactions (human-requested 2026-06-15; build after seasonal ✅)
The lake should have **realistic, varied, evolving, interacting plants** — the same depth of treatment the fish got.
- **✅ Macrophyte VARIETIES — DONE (2026-06-15).** A `MACRO` registry of growth forms; each dynamic plant carries a
  variety `p.v` chosen by its **rooting depth** (`pickVariety(bedFrac)`), with per-variety depth zone, size, growth,
  cover, O₂, palatability, shade/turbidity tolerance (`lightMin`) and cold tolerance (`tempMin`), and its own render
  form (stalk / floating pad / benthic mat) + hue. Shipped 4 rooted forms — **pondweed** (common submerged),
  **milfoil** (deep, dense, shade-tolerant, tough/low-palatability), **water lily** (shallow floating-leaved, warm),
  **muskgrass/chara** (low benthic mat needing CLEAR water — turbidity-sensitive). Emergent **reeds** + the tall static
  **weed beds** remain separate cover structures. Depth-zonation verified (deep basin = milfoil only). Save **v12**;
  3 headless probes; 2-yr balance no-extinction/all-evolving. *(Deferred: **free-floating duckweed** — a drifting,
  blooming surface mat — needs surface-drift mechanics; and a true at-surface canopy for lily. Per-variety params
  become per-plant HERITABLE in the evolution slice next.)*
- **✅ Plant EVOLUTION — a heritable macrophyte trait genome — DONE (2026-06-15).** Each dynamic plant carries a
  6-gene trait genome (`core.js` `PLANT_GENE_KEYS = maxH/grow/light/warmth/palat/leaf`, multipliers ~1.0). Plants now
  reproduce by **seeding from the nearest established plant** (`world.js` seeding step → `qPlant` → `newPlant(x,false,
  parent)`), inheriting + **mutating** its genes & colour (`mutateGenes`); isolated/cold-start seeds found with fresh
  genes. `derivePlant(p)` maps genes × variety → effective per-plant `growMul/lightMin/tempMin/palat/cover/o2/leaf/hue`,
  with real **trade-offs** (shade-tolerance & grazing-defence cost growth; big leaves raise the light requirement) so
  different habitats select different optima — **functional AND visible** (per-plant colour/leaf-size/height are
  rendered). Genes start ~1.0 so a fresh lake = the pre-evolution baseline. **Save v13** + genome-length guard. **+11
  headless probes** (genome presence, every gene→phenotype direction & trade-off, heredity vs random founder, heritable
  hue, the light-starvation selection filter, warmth-gene direction, save round-trip); **3-yr balance shows real drift
  under selection** (grow +0.21, shade-tolerance ↑, warmth-req ↑, colour 119°→155°), no extinction; determinism
  byte-identical; **adversarially reviewed (46 agents, 5 lenses)** — one finding (the `cold`→`warmth` gene-semantics
  footgun) fixed. *(The `grow` gene has no direct cost so it trends to its cap — bounded/stable; a future grow↔defence
  or maintenance cost would enrich it. Variety is still depth-determined, not heritable; **plant INTERACTIONS** —
  shading competition + clear↔turbid feedback — is the next plant slice.)*
- **Plant INTERACTIONS — competition & the clear↔turbid feedback** — 🟦 **SHADING COMPETITION DONE (2026-06-15); the
  clear↔turbid feedback DEFERRED to Phase-5.** Done: **shading competition** — `world.js` buckets live plants into
  `COMPETE.RADIUS`-wide x-columns and a plant's effective light = `lightAtDepth × exp(-SHADE·overhead)` where overhead =
  Σ(TALLER neighbours' cover × horizontal falloff); applied to BOTH growth and the light-starvation death → a
  **stratified canopy + self-thinning** of dense beds, and (since the per-plant `light`-requirement gene sets the
  light-starvation threshold, and `cover` folds in the `leaf` gene) it **selects for shade-tolerance & HEIGHT under a
  closed canopy** — an emergent eco-evo loop with the plant genome (a 3-yr balance evolved `maxH` and `light`). Also
  fixed a **mass-conservation bug** (a light-starved plant now sheds its biomass to the DOM pool instead of silently
  vanishing). 4 headless probes (the shading factor cuts a short plant's light; one-directional; beyond-RADIUS no
  shade; and a dynamic OUTCOME run where a canopied plant ends up stunted/dead vs an open one). No save bump (shading is
  derived per step). **DEFERRED — the macrophyte↔phytoplankton clear↔turbid alternative-stable-states feedback:** an
  attempt (a per-column macrophyte nutrient draw → phyto suppression) was built, tested, and **removed** because in a
  *closed, mass-conserving, P-limited* lake a simple per-column nutrient draw is **compensated** (freed P lets phyto
  rebound) and a sediment-store sink **saturates** — so a CORRECT clear-water arm needs a **tracked macrophyte-P biomass
  stock** that holds P out of the water while alive, plus **bistability/hysteresis validation**. That is precisely the
  Phase-5 regime-shift item (below) — build it there. The existing turbidity→light-starvation arm is already in place
  as the other half. *(Also still open here: explicit per-patch space/density limits.)*
- **Periphyton & epiphytes** (already listed under Phase 2) — attached algae on macrophyte surfaces, the food base for a
  scraper guild; couples to the plant beds.
- **✅ School dilution / predator-confusion payoff — DONE (2026-06-16).** A predator's effective strike reach now
  **shrinks with the prey's local same-species shoal density** (`world.js takePrey`: `reach = eatRadius ·
  (1−coverAt·REFUGE) · (1 − SCHOOL.DILUTE · shoal)`, `shoal = allyStats(prey, SCHOOL.DILUTE_R).density` ∈ [0,1]) — so a
  fish tucked in a tight shoal is harder to single out (the dilution/confusion effect that is WHY fish school). This
  makes the innate schooling cohesion **ADAPTIVE** — tight shoals now pay off against predation, so they're SELECTED
  for, not scripted. Stacks with the reeds/weeds cover refuge; deterministic (no RNG). Config `SCHOOL {DILUTE_R:44,
  DILUTE:0.5}`. +2 probes (a lone prey just within reach is eaten; the same prey in a dense shoal is not). 3-yr balance:
  no extinction, minnow CV 0.18 (the logistic K cap prevents a minnow explosion despite the survival edge).
- **Inbreeding depression & genetic rescue** — medium / medium. *(Extends the Phase-5 rescue work directly.)* Track a
  cheap genetic-diversity proxy per species (genome variance); low diversity in a small, immigration-propped population
  (bass/pike) imposes a mild fitness cost — and an immigrant is then literal **genetic rescue**, not just a head-count.
  Makes the sink/rescue dynamics we just built ecologically deeper and is research-relevant (small-population genetics).
- **Behavioral / personality genes (boldness–shyness, activity)** — medium / small. Add a heritable behavioural axis to
  the multi-gene genome (a bold↔shy / risk-tolerance gene scaling foraging aggression vs predator caution). Bold fish
  eat more but die younger → a real **pace-of-life** trade-off that selection can tune per niche/predation regime.
  Cheap extension of the existing gene vector (needs the genome-length guard + a save bump).

### Cognition & morphological evolution — research-grade depth (human-requested 2026-06-15)
The human's steer: *"are the fish actually thinking and reacting, or just moving and turning? There's a lot more
complexity to how each fish would act and think in a real ecosystem"* + *"for evolution there should be physical
evolutions too — fins, length, fish size, eyes, tails… for plants the physical too — color, size, leaves… as
realistic and intricate as a real ecosystem, research-grade."* This is the big push from a **reflex animal on 3
abstract genes** to a **thinking agent with an evolving, visible body**. Honest baseline (verified in code 2026-06-15)
*— now partly superseded:* the brain WAS a 1-hidden-layer MLP with only 2 motor outputs (turn, thrust), memoryless, a
size/speed/tol-only genome that didn't change the drawn body. **Since then:** the genome drives the **drawn morphology**
(fin/eye/body), the brain gained **recurrent memory** (LEAK), and the action space expanded to **5 outputs** — the brain
now DECIDES strike/flee/hide, not just steers (see the DONE items below). Still scripted/automatic: the ambush/cover/
schooling/home-depth ethogram (net only nudges), mate choice, and there's **no internal drive state or within-life
learning** yet. The items below close the rest. Tags: impact / cost.

#### A. Fish cognition — from a 2-output reflex to a deciding mind
- **✅ Expanded action space — the brain DECIDES, not just steers — DONE (2026-06-16).** *The keystone cognition item.*
  The MLP output count `OUT` went **2 → 5** (`core.js`): turn, thrust + three brain-GATED **continuous-intent** actions —
  **STRIKE** (predatory lunge: thrust burst + +60% eat reach in `takePrey` + energy cost), **FLEE** (escape sprint:
  thrust burst + a lifted speed cap + the highest energy cost), **HIDE** (freeze: suppress thrust + seek nearest cover +
  conceal, shrinking a predator's reach up to 50%). Continuous gates (not a hard argmax) so neuroevolution searches a
  smooth landscape; they trade off via their effects (hide kills the thrust strike/flee need) + costs. Started **~off**
  at init (`randomGenome` negative action bias) so a fresh lake = the old turn/thrust baseline, and the actions evolve
  where the prey/threat/energy senses make them pay (predator strike vs prey hide/flee meet in `takePrey` → an emergent
  arms race). **`core.js migrateGenome` / `world.js fitGenome` PRESERVE** older 2-output (and/or pre-recurrence) brains —
  keeping learned input→hidden + turn/thrust weights + LEAK, seeding the new actions off — so evolved swimming survives.
  `inspector.js` renders all 5 outputs (verified live). Save **v17**; gate green (247 checks, byte-identical, +6 action
  probes); 3-yr balance: no extinction. *(Still scripted/innate, as targets for the next pass: ambush burst, cover-seek,
  schooling weight, mate-pursuit — fold these into evolved gates too. Next §A: internal drives — hunger/fear feed the
  action head.)*
- **✅ Effort-coupled swimming look — DONE (2026-06-16).** Body undulation **amplitude** + tail-beat **frequency** now
  scale with each fish's real swimming **effort** (`render.js _fish` `drive` = thrust + speed, +flee/strike burst,
  −hide freeze; a 3-level effort bucket in the sprite cache + the beat-rate term) — a gliding/hiding fish is near-still,
  a fleeing sprinter thrashes hard & fast. Render-only (determinism untouched); gate green + a smoke effort-coupling
  check; live-verified (top hider drive 0.05, top fleer 0.82). *(Was: a hardcoded `drive=0.45` → every fish wiggled the same.)*
- **✅ Realistic swim TRAJECTORY — momentum & carving turns — DONE (2026-06-16).** *(Human-flagged 2026-06-16: "do the
  trajectory.")* Added locomotion **MOMENTUM** (`world.js` move step + `config.js MOTION`): a per-fish `velHeading` (travel
  direction) lags the body `heading` — slower at speed — so fast fish **carve/drift through turns** instead of pivoting;
  and a hard turn **scrubs forward speed** (`TURN_DRAG`, ≈10–11% in a sharp turn). Gate green (byte-identical determinism;
  +momentum probes: carve-lag 0.277≫0.029, turn-scrubs-speed); 3-yr balance no extinction, predators still breed; live-
  verified (~22% drifting, 0 escaped basin). `TURN_DRAG` tuned gentle (0.14) so chasing predators aren't crippled.
- **✅ Burst-and-coast gait — DONE (2026-06-16). Trajectory-realism set COMPLETE.** The last piece: the delivered thrust
  is modulated by a per-fish **stroke oscillator** — a **zero-mean cosine** (`thrust *= 1 + coastAmp·cos(2π·stroke)`,
  `MOTION.COAST_DEPTH/RATE`) so the cycle-average ≈ the brain's intent → **balance-neutral**; a cruising fish surges then
  GLIDES (the momentum model carries it through the glide, the effort-coupled undulation thrashes on the power-stroke /
  straightens on the glide). Gated to cruising — suppressed during a flee/strike sprint. Per-fish phase offset (no RNG),
  transient (not serialized). Gate green (byte-identical; +probes: speed CV 0.123>0.078, cycle-mean balance-neutral);
  3-yr balance no extinction with EVERY species evolving; focused adversarial review 0 defects. **The three trajectory
  pieces — carving momentum, turn-speed-loss, burst-and-coast — are all shipped.**
- **✅ Recurrent/temporal brain → memory — DONE (2026-06-15).** The memoryless MLP gained a **leaky-integrator hidden
  state**: the genome has a per-hidden-unit `[LEAK(hid)]` block (`core.js`, genome layout) and `forward()` now computes
  `h[j] = sigmoid(leak)*h_prev[j] + (1−sigmoid(leak))*tanh(Σ W1·in + B1)` — each unit keeps a learned fraction of its
  previous activation, so the hidden state **integrates over time** and behaviour can depend on history (a fish can
  carry a recent-threat/food trace). `act.h` persists on the agent, advanced by the fixed timestep → **deterministic**
  (byte-identical re-verified). The LEAK params init biased toward **low memory** (`rand(-3,-0.5)`), so a fresh lake
  starts ~reactive (≈ the old behaviour) and **memory EMERGES under selection** rather than being imposed; a fresh
  brain ≈ baseline (headless-asserted). `fitGenome` **preserves** a pre-recurrence brain (keeps its weights, appends
  memoryless leak) instead of reseeding → the user's evolved brains survive the upgrade. Save **v15**; perf unchanged
  (~the same cost as the feed-forward step); 3-yr balance: no extinction, evolution still acting. **+5 cognition probes**
  (memoryless⇒history-independent; high-leak⇒history-DEPENDENT=memory; the trace persists then decays, bounded;
  pre-recurrence brain preserved on load). *(Next §A: an expanded ACTION SPACE so the brain decides strike/flee/hide;
  then internal drives. The recurrent state is the substrate those build on.)*
- **✅ Internal state & motivation (hunger / fear) — DONE (2026-06-16).** Two persistent per-fish drive scalars fed back
  as the **last two brain inputs** (`config.js DRIVE`): **HUNGER** accrues with time-since-meal and is **sated by eating**
  (distinct from the energy LEVEL input); **FEAR** jumps to the nearest-threat proximity and **decays** after it leaves
  (lingering caution). PERCEPTION, not scripted — the NN wires them to its gated actions via evolution (a hungry fish
  gambles on a strike; a fearful one hides/flees). Generic (`species.js` post-loop appends to every species; the move
  step writes them after senses()); adding inputs is **migration-preserved** (`core.js migrateGenomeInputs` zeros the new
  sensor columns). Save **v18**; gate green (+5 drive probes, byte-identical), 3-yr balance no extinction; live-verified
  (~⅓ of fish scared near predators, hunger tracks feeding). Perf 228→158 steps/s (the fear `qThreat`; still 2.6× budget).
  *(Remaining: a reproductive drive; and feeding the drives could be made cheaper by reusing the senses() threat query.)*
- **Evolvable brain topology (NEAT-style) + a brain-size cost** — high / large; 🟦 **brain-SIZE v1 DONE (2026-06-16).**
  ✅ Shipped the **shrink** half: a 7th heritable **`brain` gene** (`core.js GENE_KEYS`) sets each fish's **active hidden-unit
  count** (`a.activeHid` = `clamp(round(hid·gBrain), HID_MIN, hid)`); `forward()` MASKS the surplus units inert (no activation,
  no memory), and a **per-neuron metabolic SAVING** (`config.js BRAIN.COST`, folded into `metabMul`) makes a smaller brain
  cheaper → the **encephalization trade-off** evolves per niche (a simple niche sheds neurons; a cognitively-demanding one
  keeps them — they must earn their cost in food). At gBrain≈1 the full layer is active and the saving is 0 → a fresh lake =
  baseline. No genome surgery (the genome stays full-size; masking + a cheap gene). Save **v23**; gate green (+5 probes:
  gene→active-units, forward masking inert, metabolic saving, exact baseline-identity incl. brain, the 7-gene formula),
  determinism byte-identical. `speciesDetail`/the dashboard Evolution table show the brain gene + realized `meanActiveHid`.
  **Remaining (the hard half):** GROWING the layer beyond the species max + **adding/pruning CONNECTIONS** (true variable-
  topology NEAT with innovation numbers + structural crossover) — needs **variable-length genomes**; high blast radius
  (genome layout, save format, perf) — sequence late.
- **✅ Lifetime learning (reward-modulated Hebbian) — DONE (2026-06-16).** A within-life plasticity rule so an individual
  adapts before the lineage does. Each fish runs a **plastic policy `a.lw`** (a working copy of the genotype that `forward`
  executes); a **3-factor reward-modulated Hebbian** rule (`core.js reinforce`, `config.js LEARN`) reinforces the action just
  taken on the W2 (hidden→output) block when the fish EATS, with a homeostatic decay back toward the genotype + a clip (bounded,
  transient). **BALDWINIAN, not Lamarckian** — the inherited genotype `a.g` is never written, so offspring/champions/saves carry
  the EVOLVED brain, not the learned weights (the Baldwin effect: learning guides evolution without inheriting acquired traits).
  Pure/deterministic; `a.lw` transient (no save-format change). Gate green (+5 probes: Hebbian strengthen, genotype-untouched,
  homeostatic decay, live divergence lw≠g, bounded), determinism byte-identical, balance no-extinction. **Deferred:** an
  eligibility trace (multi-step credit), a heritable per-fish plasticity rate (a gene), and explicit place memory.
- **Richer perception** — medium / medium; 🟦 **v1 DONE (2026-06-16).** ✅ Shipped 2 new senses (`species.js
  PERCEPTION_INPUTS`, save v22): a **lateral-line / rheotaxis `flow`** sense (signed local current — MECHANOSENSORY, NOT
  clarity-scaled → the turbidity-proof murky-water fallback) + a **`prey size`** sense (relative size of the nearest
  catchable fish, 0 for non-piscivores → evolved prey-size selectivity, couples to the gape/`canEat` system). Migration-
  preserved (+2 inputs, new columns zeroed); gate green (+4 probes incl. the turbidity-proof property), determinism
  byte-identical. **Remaining (v2):** the **angular "retina"** (several direction bins replacing the single nearest-target
  sin/cos), **conspecific-vs-heterospecific / kin discrimination**, and a **chemoreception/odor** field (its own slice —
  a diffusing scalar; see the Phase-2 odor backlog item). More to perceive → more to think about.

- **✅ Spatial cognition — a sense of place & direction — DONE (2026-06-16).** *(Human-flagged 2026-06-15: "any sense of
  direction that fish actually have, or sense of their location.")* Fish had only **egocentric** cues (relative bearing to
  food/threat, depth, walls). Added **3 allocentric brain inputs** to every species (`species.js SPATIAL_INPUTS`, appended
  before the drives): a **COMPASS** (`compass∠sin`/`compass∠cos` = sin/cos of the absolute body heading — an orientation
  reference) + a **HOME bearing** (`home∠x` = signed horizontal displacement to the fish's **natal site** `homeX`, recorded
  at birth on every spawn path, normalised by lake width). Layered on the **recurrent brain (A)**, these are the **substrate
  for EVOLVED navigation** — refuge homing, home-range/site fidelity, spawning migration — emergent, NOT scripted (the move
  step writes the senses; the NN decides). Pure functions of sim state → determinism byte-identical. `homeX` serialized as
  `hx` (**save v21**); the +3 inputs are migration-preserved (`fitGenome` widened, new sensor columns zeroed → evolved
  brains survive). Gate green (smoke + headless **+6 probes**: labels/length, compass unit-vector, home∠x sign, homeX birth
  + round-trip, migration). **Deferred extensions:** an absolute basin-x / distance-to-shore-or-inflow position sense; a
  sun/magnetic compass; explicit place-memory readout; coupling to the Phase-4 nest-building / spawning-migration items.

#### B. Fish MORPHOLOGICAL evolution — a heritable body-plan genome that is FUNCTIONAL and VISIBLE
Generalize the 3-gene vector (`core.js` size/speed/tol) into a **morphology genome** whose genes both *do something*
and *are drawn*, so you watch bodies evolve. Each gene must trade off (folded into `metabMul`/performance) — nothing free.
- **✅ v1 DONE (2026-06-15):** `GENE_KEYS` extended to **6 genes** — size/speed/tol + **fin / eye / body-depth**.
  Functional (`world.js makeAgent`): **fin → maxTurn** (maneuver) at a drag cost; **eye → senseRange** (vision); **body
  → accel + a predation defence** (`bodyMul` makes a deep-bodied fish effectively larger to a gape-limited predator,
  applied in `qThreat`/`qPrey` `canEat`) at a drag cost — **all costs folded into `metabMul`** (nothing free). Visible:
  `drawFish` reads `o.morph` to scale **body depth, caudal+pectoral fins, and eye radius** per-fish, sprite-cached via a
  coarse morph bucket (`render.js` `_morphBucket`/`_morphVal`, LRU cap raised 1000→2500). At genes≈1.0 every derived
  stat is **exactly** the species baseline (a fresh lake = the pre-slice sim — headless-asserted). `fitGenes` length
  guard + **save v14**; **+9 probes** (each gene→stat direction & trade-off, predation defence, the guard, the
  baseline-identity invariant, and a smoke test that morph buckets build differently-sized sprites). 3-yr balance:
  **no extinction; the morphology genes evolve under selection** (a run drifted fin +0.11 / body +0.06 / eye −0.08 — the
  eye's metabolic cost outweighing its vision benefit is a genuine eco-evo result). Adversarially reviewed (31 agents) —
  implementation confirmed correct, the two test-coverage gaps it found are closed. *(v2: per-species drawn tail-fork /
  mouth-gape detail, gape→prey-size as its own gene, and allometry/ontogeny — see below.)*
- **Body geometry genes** — high / large. **Body length & depth** (fusiform cruiser ↔ deep-bodied), **caudal/tail
  form** (forked = fast cruise ↔ rounded = acceleration/maneuver), **fin size** (pectoral/dorsal/anal), **mouth gape &
  position** (terminal ↔ sub-terminal benthic), **eye size**, **coloration & pattern**.
- **Functional couplings (the point — morphology must MATTER):** tail/body → **top speed vs turn radius + cost-of-
  transport**; **gape → max ingestible prey size** (couples to `canEat`); **eye size → sense range × `env.clarity`**
  (so turbid/dark water selects small-eyed chemoreception specialists) at a metabolic cost; body depth → drag/COT +
  **predation handling-time/vulnerability**; **color → crypsis** (predation risk vs habitat match) **+ sexual
  selection** (nuptial signal). Ties straight into the planned U-shaped cost-of-transport, mate-choice, and turbidity
  systems → a real eco-evo feedback.
- **Draw the phenotype** — medium / medium. Make the per-species `draw`/`P` parameters **per-fish, gene-driven**, so the
  sprite shows the evolved tail/body/eye/mouth/color. Add **allometry/ontogeny** (juvenile vs adult proportions shift
  with growth; couples to ontogenetic diet shift). This is what makes evolution *visible* full-screen.

#### C. Plant MORPHOLOGICAL evolution — physical traits, functional and visible (folds into the planned plant-evolution slice)
Extends the already-roadmapped **"Plant EVOLUTION — heritable macrophyte trait genome"** with the human's physical
traits, treated the same way as fish morphology (functional + drawn). Generalizes the fixed `MACRO` forms into a
per-plant phenotype that drifts and is selected.
- **Physical genes** — high / medium. **Max height/canopy, leaf size & shape, pigment/color, stem density, rooting
  depth**, growth allocation.
- **Functional couplings:** **leaf area → light capture vs self-shading + storm-breakage**; **pigment/color →
  photosynthetic efficiency by spectral depth** (couples to the spectral-light-attenuation item — red-absorbing
  pigments win deep) **+ cover value + camouflage** for prey hiding in the bed; **height → shading competition** (the
  clear↔turbid feedback); **toughness/palatability → grazing defense**. Selection → turbid lakes evolve shade-tolerant
  low forms; heavily grazed beds evolve tough, low-palatability plants. Render shows the morphology.

- **Plant tropisms — directional growth (the plant "sense of direction")** — medium / small. *(Human-flagged
  alongside the fish spatial sense — "maybe plants too.")* Plants don't navigate, but they DO orient: **phototropism**
  (shoots grow toward light / into canopy gaps, away from shade) and **gravitropism** (shoots up, roots down). A growing
  macrophyte biases its height/lean toward the best local light, so it fills gaps and reaches past competitors — making
  the shading-competition (the clear↔turbid feedback) spatially realistic rather than purely vertical.

#### D. Deeper eco-evolutionary realism (Claude-proposed for research grade — human asked "think of more")
- **Life-history allocation genome** — high / medium. A heritable split of the energy budget among **growth /
  reproduction / maintenance**, so **r-selected (fast, fecund, short-lived) ↔ K-selected (slow, few young, long-lived)**
  strategies *emerge* per niche instead of being hand-set per species. The unifying evolutionary axis.
- **Phenotypic plasticity / inducible defenses** — medium / medium. Same genome, environment-dependent expression — e.g.
  **predator-induced deep body** (the crucian-carp classic), faster maturation under high mortality. Couples to the
  planned density-dependent-growth/stunting item.
- **Co-evolutionary arms races (Red Queen)** — high / medium. The coupled morphology above makes **predator gape ↔ prey
  body-depth** and **plant defense ↔ grazer** co-evolve — a measurable arms race, not a static balance. Mostly emergent
  once B & C exist; the research payoff of the morphology work.
- **Speciation & reproductive isolation** — high / large. **Assortative mating** by trait similarity + genetic distance
  (builds on the existing `chooseMate` + the planned inbreeding genome-variance proxy) → a lineage can **split into
  reproductively isolated forms** over long runs. The holy grail of an evo-sim and squarely research-grade. Sequence
  last (needs the trait genome, mate choice, and the diversity proxy first).
- **Sensory-niche divergence** — medium / medium. With eye-size and chemoreception genes (B + the odor sense), lineages
  **specialize** to clear-water vision vs dark/turbid-water smell — divergent sensory niches driven by the habitat.
- **Alarm cues & signaling** — medium / small. Ostariophysan **alarm substance ("Schreckstoff")** released by injured
  prey → a diffusing fear field nearby fish sense (reuse `diffuse()`); plus nuptial-color signaling (Phase-4 mate-choice).

#### Cross-cutting guards for this whole cluster
- **Genome-length guard is mandatory** before ANY `shape.in`/output/topology change (already shipped for sensors) —
  reseed mismatched saves/champions, and **bump `World.version`** per change. A morphology genome also needs its own
  versioned (de)serialization in `toJSON`/`load`/`champions`.
- **Determinism:** all sim-affecting genetics/decisions use **core.rand**; only render of the evolved sprite may use
  the non-seeded PRNG. Never cross the streams.
- **Perf:** recurrence, bigger/topology-evolving nets, and per-fish sprite generation all add cost — add a headless
  **per-step budget assertion** and confirm the sprite cache still keys correctly on the gene-driven phenotype.
- **Verify evolution actually acts:** for each gene, a headless probe that a named pressure shifts its mean
  (e.g. turbid water → smaller mean eye gene; heavy grazing → tougher mean plant) + `npm run balance` no-extinction.

### Build order & guards (rewritten 2026-10-11, after the audit fixes)

This replaces the critic's June build order; everything on that list has shipped.

**Open work, highest priority first:**
1. **Apex-predator recruitment.**
   - **Update 2026-10-12:**
     - Diagnosed as starvation, then improved with innate pursuit, hypoxia avoidance and predator energetics on the size trend. Bass immigrant share went 91% → 80%, pike 76% → 61%.
     - **Lowering the breeding threshold does NOT help.** With bass at 0.80 and pike at 0.90, 2.6× more bass were "ready", but births only went 151 → 160, immigrants rose and starvation rose.
     - The binding constraint is now **mate-finding in a sparse population** (~8 bass across the lake). The likely real fix is **spawning aggregation / migration** (Phase 4): breeding adults gather on littoral spawning grounds in season.
     - **✅ Spawning aggregation shipped** (`innate.spawnGround`). Over a 1-year balance the immigrant share fell for bass 80→70%, pike 61→54%, catfish 48→29%, carp 39% (was 52%) and sunfish 23→16%, and total immigration dropped 44%. Bass and pike are still not fully self-sustaining. **Caveat (2026-10-12):** those are single-seed (2024) figures. A 3-seed, 1-year A/B gives honest means of bass ~78%, pike ~59-66%, catfish ~47-49%, carp ~44-46% and sunfish ~22-24% immigrants. That is still better than the 91%/76% start, but less than seed 2024 suggested.
     - **Next levers:** juvenile survival (pike eat many bass), and nest-guarding or brood protection near the spawning ground.
   - Bass and pike are still mostly immigrants: about 85–95% of bass and 60–85% of pike in multi-year balance runs. Earlier home-bred numbers were inflated by energy pumps (newborn cannibalism, free budding energy), and those are now closed.
   - Investigate why the apex can't self-sustain: prey availability, reproduction thresholds, clutch size, and juvenile survival.
2. **Test hardening.** The remaining gaps are listed in `AUDIT.md`:
   - behavioural tests in place of the formula-copy checks (thermal/hypoxia drain, nocturnality, body-depth defence, mate-choice genes);
   - broader determinism scenarios;
   - a recording WebGL2 mock so `GLPost` actually runs in smoke;
   - possibly `node:test` with parallel files, to cut the ~8-minute gate.
3. **The graphics realism roadmap** (`docs/GRAPHICS_RESEARCH.md`): AgX tonemap, then the surface heightfield, Beer–Lambert colour, depth/occluder MRT, fish normals, real DOF/AO, and instancing. Re-tune the grade first, because the GL depth terms were upside down until 2026-10-11.
4. **Catfish nocturnality is weak in effect.** In the real move step a catfish swims only ~8% faster at night than at noon, although its innate cruise target is ~2.7× higher at night: the brain's own thrust dominates the innate blend. Consider a stronger innate weight for activity rhythms, or a day-rest drive. Measure with the behavioural check in `headless.mjs`.
5. **N-fixation** barely runs at the default inflow N:P. Consider seasonal or episodic P loading so the low-N:P cyanobacteria regime actually occurs.
6. **Dashboard slice B/C:** selectable charts, a food-web flux diagram, an event log, and CSV export.
7. **Grow the lake:** amphibians and birds (cross-boundary life), then the scenario/preset engine (the north star).

**Guards that apply to every change:**
- **Brain or input layout.** Append a `BRAIN_ERAS` entry (`species.js`) and bump the save version. Never re-order existing inputs.
- **New state that affects the future.** Add it to `toJSON` and `parseSave` (or `Environment.toJSON`/`load`). The gate's exact-resume test catches anything missed.
- **Chemistry.** Every transfer must debit its source. The gate's P/N inventory test, with plants on, catches leaks.
- **Determinism.** Sim randomness uses `core.rand`; render, camera and director randomness uses `Math.random`. Never mix the two.
- **Balance after every ecological slice.** Run `npm run balance` and judge by home-bred vs immigrant births per species. REFUGE keeps everyone "present", so presence proves nothing.
