# The fish on the GPU — plan (2026-10-18)

The human, 2026-10-18: "wheres the full simulated year running? anyway to make it faster? are we using the gpu and cpu for all
this to make it efficient?" — then "if the gpu makes this whole project better, we should do it".

## Where we are

- **The machine:** an NVIDIA GeForce RTX 3060 (Ampere, WebGPU with subgroups, f16 and timestamp queries; 2 GB storage
  buffers) and an AMD Ryzen 5 5600G (6 cores, 12 threads).
- **The sim runs on the CPU only.** The GPU draws the view (three.js WebGPU) and nothing else.
- **The true-size lakes** hold ~300,000 fish agents (1.2 million fish) and ~25,000–80,000 schools of young. Fast-forward
  steps them in 29-min coarse blocks: one decision by each fish's brain, then it goes where it chose, feeds, grows, spawns,
  is eaten or dies. A block costs ~15 µs an agent, ~4.5 s on one thread; the two shards (T5: Upper + the brook, Lower)
  bring it to ~2.4 s. **A simulated day is ~2.5 min, a year ~15 hours.**
- **The project's goal needs far more.** "Each animal actually thinking, learning, and behaving the way they would first, then
  eventually slowly evolving over time": evolution needs tens of generations — decades of simulated years. At 15 h a year,
  fifty years is a month of computing.

## The options

1. **More CPU threads** (each lake in several regions; a region sees its neighbour's edge through a read-only copy). On 6
   physical cores, ~2.5–3.5× over today: a year in ~4–6 h. Moderate work. Still far from decades.
2. **The GPU.** The RTX 3060 runs ~3,500 threads at once. 300,000 agents each doing the same kind of work every block is what
   it is built for: plausibly 20–100× today's block, a year in minutes to an hour, decades in days. Large work: fish3.js's
   per-fish step rewritten as compute shaders.

**The choice: the GPU**, for the long runs (the coarse block, the year engine) first. The CPU threads are skipped unless the
GPU work stalls.

## The architecture

- **The CPU sim stays the reference.** fish3.js remains the model's definition: the gate's tests, the exact-resume test, the
  1/10 world, and the fine 0.1-s steps of the fish near the camera. The GPU engine is a second implementation of the same
  model, for speed.
- **Validation is statistical, not bit for bit.** Bit-identity across the two is impossible (float32 against float64,
  parallel reductions). The GPU engine must match the CPU sim's populations, growth, diets, kill rates and young's fates over
  seasons, within the CPU's own seed-to-seed spread (≥ 3 seeds each), before it is trusted.
- **Deterministic on the GPU.** Every random draw comes from a counter-based generator keyed by (seed, agent, block, purpose),
  so the result doesn't depend on the order threads run. Shared totals (food taken from a column, prey claimed) use integer
  atomics in fixed point, which add up the same in any order.
- **It runs in the browser.** WebGPU is in Chrome and in this app's pane; the sim's worker hosts it (WebGPU works in workers).
  Long headless runs go in a runner page. No native npm dependency is needed (Node's WebGPU would need Google's Dawn package;
  possible later).
- **The water model stays on the CPU** at first (15,000 cells, small). Each block it uploads what the fish read (temperature,
  O₂, zooplankton, the bed's animals, the weeds, per cell) and reads back what they did (food taken, waste, biomass).
- **Data on the GPU, struct-of-arrays.** Each agent is ~40 numbers (place, heading, species, school size, length, mass, gut,
  gonads, age, sex, flags, home, lake, …) plus its genome (346 float32) and its learned block (60). ~0.6 GB for 300,000
  agents.

## The kernels of a coarse block (each fish's step in fish3.js, in order)

1. **The neighbour grid:** a counting sort of the agents into 4-m cells (atomics, a prefix sum).
2. **Senses:** each agent scans its cells for its nearest prey, threat and school, and reads the water and food fields
   (`_sense`).
3. **The brain:** the 26 → 10 → 6 recurrent net, one thread an agent (`forward3`).
4. **Drives and the relocation:** the steering pulls (`_drive`) and the hops through the bed grid (`_relocate`, `_hop`), on the
   depth and body rasters.
5. **Feeding:** each agent's demand per food per column summed with atomics, then each takes its share of what is there
   (`_feed`). This replaces the CPU's first-come order with proportional sharing (a known, small difference to validate).
6. **Predation:** each predator draws a prey among its candidates (`_strike`; the young: `_eatYoy`); a prey claimed by two goes to the higher
   random priority (atomicMax); the winners eat.
7. **The body:** digestion, respiration, growth, gonads (`_energetics`, FB4); maturity and ripeness.
8. **Death:** starvation, heat, hypoxia, age and the background hazard (`_hazards`), from the counter-based draws.
9. **Births and the young:** spawnings make young schools (`_spawn`, `_mkYoy`); the young's own step (`_yoyLive`, `_feedYoy`:
   feeding, growth, the scramble competition, being eaten); recruits become agents (`_recruit`). New agents append through a prefix sum; the dead are compacted every few blocks.
10. **The schools:** merge and split (`_schools`).

## G0 results (2026-10-18)

- **Where a coarse block's time goes** (true lakes, one thread, 303,810 agents and 83,503 young schools; 5.2 s a block — the
  water model only 35–76 ms of it, ~1 %): the senses 25 %, feeding 20 % (the zooplankton, weeds, bed animals and crayfish
  taken from the columns about each fish), the relocation 18 % (its hops 7 %), the brain 9 % (with learning), the drives 7 %,
  strikes at prey 4 %, the body (FB4) 4 %, the young's schools ~6 %, the per-fish step's own work ~9 %. Nearly all of it is the
  same work for every fish: what the GPU is built for. Feeding is the one that needs care (fish sharing a column's food).
- **The senses on the RTX 3060** (`tools/gpu/sense_bench.html?world=true`): the neighbour scan for all 303,841 fish — nearest
  threat, nearest prey, its own kind about it, the CPU's grid uploaded — **3.2 ms on the GPU against 984 ms on the CPU** (the
  CPU's with the food fields' look-up, ~25 % of it): ~300×. The GPU picks the same prey for 20,927 of 20,927 fish, the same
  threat for 16,885 of 16,886, the same count of its own kind for 303,829 of 303,841 (the rest float32 ties at a sense range's
  edge). Upload 49 ms and read-back 14 ms — once, in an engine whose data stays on the GPU.
- **What it means:** offloading only the senses would give ~1.3× (Amdahl: the rest stays on the CPU); the speed comes from the
  whole block on the GPU (G1). At ~300× a kernel, the block's ~5 s could become tens of milliseconds — a year in minutes —
  with feeding, predation and births (the parts with shared state) the ones to design carefully.

## G1 — the design as built (2026-10-18)

- **Files.** `src/w3/gpu/layout.js` (pure, Node-testable: the fields, packing a Fish3's agents and young into the struct of
  arrays and back, the statics, the water's sections, and the WGSL constants generated from the CPU sim's own config — the two
  engines read one set of numbers); `src/w3/gpu/wgsl.js` (the kernels as WGSL strings, each a port of the fish3.js function it
  names); `src/w3/gpu/gpufish.js` (the WebGPU host: buffers, pipelines, uploads, read-backs); `tools/gpu/g1_check.html`
  (each kernel against fish3.js on the same fish). The gate's `gpu` section checks the layout's round trip in Node.
- **Data.** One f32 buffer per kind, field-major (field f of agent i at f·cap + i: neighbouring threads read neighbouring
  words), integers as bit patterns. Agents: 102 fields; GN the genome (346) + genes (7); BR the brain's state (the plastic
  hidden→output block 60, h 10, o 6). Age in whole seconds (u32 — f32 would round a block's 1,752 s at a 17-year age by
  ~0.5 %), times of day-scale events in days (f32). Statics (5.4 MB at 1/10): the bed's rasters, the water's columns and cells,
  fish3's lookups (bedOf, the neighbour rings, each column's bed cells, the foraging footprints per radius), the species and FB4
  tables. The water the fish read (temperature, O₂, zooplankton, the bed's animals and organic layer, the weeds, the surface
  insects…) is uploaded each block (~0.7 MB).
- **Order.** The GPU runs the block's phases for every fish at once (all fish's start, then all learn, all sense, …); fish3
  runs each fish's whole step before the next's. So on the GPU every fish senses the others where the block began, and reads a
  mate's or a threat's place from a SNAPSHOT (PX) taken after the start — never a position another thread is writing. This is
  the known, deliberate difference G2 validates statistically.
- **Determinism.** Counter-based random numbers (a hash of the seed, the agent's id, the block, a purpose and a draw index);
  the grid's cells sorted by agent index after the atomic scatter (the scan order — and ties in the senses — are the CPU's);
  shared sums in 64-bit fixed point (two u32 atomics, the carry by hand), the same in any thread order; the brook's nest sites
  given out by one workgroup walking the fish in index order.
- **Precision.** Two float32 traps found by the checks: summing schoolmates' absolute positions (~3 km out) lost ~0.2 m —
  summed as offsets from the fish now; the GPU's built-in tanh is the hardware's approximation (~5e-4 on NVIDIA) — the brain
  uses an exp-based tanh to f32 accuracy.

### G1 results so far (the checks: 1/10 lakes 3,202 agents; true lakes 303,841 agents, 83,503 young schools)

| Kernel (fish3.js) | 1/10 | True lakes | GPU ms (true) | CPU ms (true) |
|---|---|---|---|---|
| grid (`_hashBuild`) | exact | 21 fish within 1e-4 m of a cell edge land in the next (f32) | ~1–4 | — |
| start (`_livePre`) | 1 cover value at 2e-4 | 54 cover / 24 bed values at ~3e-4 (f32 bilinear); 2 fish on a column edge | ~4–7 | 420–650 |
| learning (`reinforce3`) | all | all | ~1 | 130–200 |
| senses (`_sense`) | all | prey and threat identical for every fish; 12 school counts at the radius' edge | ~4–5 | 1,300–1,700 |
| brain (`forward3`) | all (≤ 1.4e-4) | 0.9 % of fish > 2e-4 (an ill-conditioned school direction when the school's centre is within a hair of the fish; f32 inputs) | ~1.8 | 650–750 |
| movement (`_drive`, `_relocate`, `_hop`; no wander) | 1 fish's heading | mean move 28.30 m on both; 20 fish end > 1 m from the CPU's | ~1.8 | 1,600 |
| body (`_energetics`, FB4) | all 18 fields | all but 2 fish (whose moves differed) | ~0.5 | 265–360 |
| feeding (`_feed`: the fields) | totals within 0.5 %; 3,191 of 3,200 meals within 5 % | zooplankton 17,547 · 17,616 g, bed 5,607 · 5,602, weeds 5,468 · 5,466, crayfish 4,544 · 4,542; 301,610 of 303,526 meals within 5 % | — | 1,300 |
| fish eating the young (`_eatYoy`) | 28 · 24 | 2,896 · 2,825 young | — | (in feeding) |
| strikes (`_strike`) | (random; see below) | (random; see below) | — | |
| breath and death (`_hazards`, O₂) | O₂ identical in every cell; deaths 0.2 · 0.2 | O₂ identical in all 15,081 cells; deaths 23 · 26 (individuals' random draws) | — | 130 |
| the young (`_yoyLive`, `_feedYoy`, `_yoyTarget`) | 407 of 409 feeding schools' numbers within 2 %, every length within 1 % | 41,675 of 41,901 within 2 %; zooplankton 47,660 · 48,289 g, weeds 26,728 · 26,486; natural deaths 9,907 · 9,880 | ~10 | 230 |

So far ~40 ms on the GPU against ~6.5 s on the CPU for the same phases (the CPU numbers are with the year run sharing the
processor).

- **Sharing food.** Every fish (and school of young) asks for grams from the cells of its footprint as fish3 would on the
  untouched water; the asks are summed per cell and kind as T, the share of the cell's reachable food asked for, and V, the asks
  weighted by each feeder's appetite elasticity (its functional response's K/(E + K), 2K²/(E² + K²) for the adults' type III
  on zooplankton, 1 when capped at CROP of what is there). A cell gives up (1 − W)·min(T, 1) + W·(1 − e^(−T)) of its reachable
  food (W = V/T), each feeder that share of its ask: fish3's feeders, one after another, each ask for grams — an appetite that
  doesn't fall with the food gets its whole ask until the food runs out, one that falls in step with it strips the cell
  geometrically. Two first versions missed: the exponential alone (each a fraction of what is left) starved the crowded young
  by ~9 % with food to spare; rationing alone fed them ~3–5 % too well (the brook's young dace reached recruiting size days early,
  and recruited in 2 of 3 seeds where fish3's didn't). The crayfish keep the exponential (a crowd can't take every crayfish of a
  cell, the sheltered ones too, in a block).
- **Strikes: a finding about the CPU sim.** A coarse block's strikes look for prey through the neighbour grid built at the
  block's START, while by then every fish has moved (~28 m on the true lakes): a predator finds a prey only where its start cell
  is near where the predator got to — in practice the fish after it in the list, which haven't moved yet. With the grid rebuilt
  where all had moved, the true lakes' predators struck ~9× as often. The fish near the camera, stepped second by second with a
  fresh grid, are struck at the formula's full rate — so the far fish's predation runs below the near fish's. The GPU keeps the
  CPU's behaviour for now (the block-start grid; a fish earlier in the list where it moved to, a later one where it began), so the
  two can be validated against each other; correcting it means re-checking the predation calibration (the pickerel's ~1.3 % a
  week, the dace's losses) — a decision for after G2. (The per-phase harness can't compare strikes: in it every prey has moved
  before any predator feeds, as never happens in the CPU's own block — that comparison is G2's, on real blocks.)

- **Births and schools.** Spawning (mates in fish3's list order; claims so a male or partner school spawns once a block; the
  newborn school's genome a mutated crossover — core.js's operators on the newborn's own counter stream; the nest-guarding male),
  recruitment (the grown young into agents up to the species' cap), and every MERGE_EVERY blocks the schools (the own-brain cut
  from a length histogram, dissolves into fresh siblings, splits, merges by claims; the young's schools merge) — slots and ids
  from ordered single-workgroup walks. Compaction every 10 blocks. GpuFish.block(dt) runs the whole block in one submit.

### G2 — first validation (1/10 lakes, 3 seeds × 30 days from mid-June, tools/gpu/g2_run.html)

Each species' adults at day 30 as a share of the start, mean over seeds 611–613 [range], fish3's own blocks · the GPU engine
(before the schools pass and the blended sharing):

| | sunfish | perch | sucker | bullhead | white perch | bass | pickerel | redbreast | fallfish | killifish | dace |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fish3 | 0.969 | 0.970 | 0.960 | 0.908 | 0.976 | 0.923 | 0.896 | 0.958 | 0.912 | 0.855 | 0.891 |
| GPU | 0.966 | 0.971 | 0.968 | 0.902 | 0.977 | 0.925 | 0.901 | 0.957 | 0.902 | 0.855 | 1.081 |

Biomass, the young's numbers and lengths agree within the seeds' spread; so do the random processes the per-phase harness
couldn't compare — seed 611: spawnings 28 bullhead, 2 white perch, 1 sunfish, 3 dace (fish3) against 28, 2, 1, 4 (GPU); followed
fish eaten 245 against 224 — the list-order emulation of strikes and mates reproduces fish3's. The dace: the GPU's young dace grew
past their recruiting length (3.5 cm) days early (fish3's largest school 3.37 cm at day 30, seed 612) — the food sharing (fixed
since: the blended rule above) and the young's merging (the schools pass, added since). GPU ~17 ms a block, fish3 ~45–75 ms.

After the schools pass (merges in fish3's pair order) and the blended sharing, re-run (GPU, the same seeds): the young dace track
fish3's within ~4 % of length (the largest school 3.17 cm at day 25 against 3.05) — one school still crosses 3.5 cm a few days
before fish3's would (a threshold's timing); every other species as before.

### G2 — THE TRUE LAKES against the CPU's own year run (seed 611 from May 20; the CPU in its 2 shards, tools/w3_season.mjs)

Each species' adults as a share of the start · the young (millions @ mean cm), the CPU's year run · the GPU engine:

| day 28 | CPU | GPU |
|---|---|---|
| lakes | 102 kg/ha | 102.3 kg/ha |
| sunfish | 0.972 · 15.95M @ 0.8 | 0.974 · 15.99M @ 0.78 |
| perch | 0.971 · 8.87M @ 2.6 | 0.971 · 8.88M @ 2.62 |
| sucker | 0.976 · 11.63M @ 2.7 | 0.977 · 11.65M @ 2.72 |
| bullhead | 0.944 · 0.69M @ 1.6 | 0.947 · 0.77M @ 1.65 |
| white perch | 0.978 · 21.76M @ 1.6 | 0.978 · 21.58M @ 1.62 |
| bass | 0.949 · 1.95M @ 2.2 | 0.953 · 1.91M @ 2.18 |
| pickerel | 0.887 · 71k @ 2.2 | 0.888 · 68k @ 2.24 |
| redbreast | 0.965 · 4.04M @ 0.7 | 0.966 · 3.99M @ 0.67 |
| fallfish | 0.944 · 2.96M @ 2.3 | 0.943 · 3.00M @ 2.27 |
| killifish | 0.887 · 396k @ 1.1 | 0.890 · 394k @ 1.12 |
| dace | 0.747 · 3k @ 1.0 | 0.753 · 3k @ 0.93 |

Spawnings over the 28 days, CPU · GPU: sunfish 14,187 · 14,129, white perch 6,774 · 6,905, bass 4,006 · 3,960, redbreast
7,179 · 7,041, fallfish 10,201 · 10,245, killifish 1,983 · 2,034, bullhead 571 · 619, dace 107 · 121. Day 14 alike (every
species' adults within 0.003, the young within ~4 %). **Time: 73.9 ms a block on the GPU (the CPU's water model, its upload and
read-back included) against ~3.1 s on the CPU's two cores — ~40×: the 28 days in ~1.7 min against 85, a year in ~22 min against
~20 h.**

## G3 — in use (2026-10-18)

- **The year runner** (`tools/gpu/year.html?world=true&seeds=611,612,613&yf=0.22&days=365&every=14`): the GPU engine through
  whole years, seed after seed, its lines in tools/w3_season.mjs's format (each species against the start, kg/ha, ration, cm,
  the young, spawnings and deaths counted from the founding as the CPU's are, recruits; who ate whom at the end) — the CPU's year
  run and the GPU's compare line by line. `window.YEAR[seed]` holds the lines.
- **Room to grow.** A year's fish outgrow the arrays sized at the founding (the spring's recruits, June's spawnings). The kernels
  now hold back what has no room — a recruiting school waits a block, a spawning a block, a dissolving school a pass — and say
  how much they wanted (GL 43–45); `GpuFish.ensureRoom` then re-makes the arrays larger (`grow`: each field's column copied to
  its new stride, the scratch re-made, the pipelines rebuilt — the feeding's per-school sums are laid out by ycap). Checked
  (`tools/gpu/g3_grow.html`): the engine repeats a run exactly; a run grown ×1.5 at block 20 ends bit-identical to one with the
  larger arrays from the start; one started with no room grows itself and ends the same.
- **The hand-overs.** `GpuFish.upload()` puts the CPU sim's lakes on the GPU (room first, the spawning grounds, the block counter
  — the random draws' key — from fish3's step count). `GpuFish.download()` hands them back: the live slots read back (only the
  first n of each field), `layout.js materialize` makes them F's objects again — a fish F held keeps its object (by id), one born
  on the GPU gets a new one, arrays a fish shared (a merge's genome) made its own, the leak recomputed, the fidelity ladder's
  bookkeeping restarted — and `statsAdd` folds the GPU's tallies into F.stats. Gate (`gpu`): two like worlds materialized, one into
  its own objects and one into all-new ones, live on identically for 4 blocks; the tallies fold in.
- **The browser's fast-forward** (`render3/sim3worker.js`, the true lakes wherever WebGPU is; `?gpu=0` off, `?gpu=1` on the 1/10
  world): the fine speeds (½×–4×) on one Fish3 in the sim worker, as before shards; past FINE_UP the lakes go to the GPU and come
  back when the speed drops. While the GPU holds them the view gets only what it draws — `v_drawn` gathers the agents and young
  within DRAW_R of where the camera looks (≤ 30,000 and 20,000; the previous poses from the last gather, by id, for the view's
  interpolation) — the followed fish's card from its slot (`GpuFish.one`; the prey's species and the brain's inputs only the CPU
  knows), the data page from the GPU's census, a light copy of nine fields per agent and the tallies (`fishside3 gpuStatsPart`),
  and the run's history from each block's counts. `tools/gpu/g3_worker.html` drives the worker as the view does (no renderer).
  Measured on the true lakes: max speed ~13,000× real time (a day in 6.6 s; the CPU's fast-forward was ~54×), ~85 ms a tick with
  a block, the view's 60 Hz ticks keeping 1 h/s; the hand-over to the GPU ~5 s and back ~7 s (the sim pauses, the view keeps
  drawing) — most of it JS reading and writing 120 named fields on 300,000 objects (packAgents/unpackAgents now go through the
  arrays' typed views, ~1.5× faster; code generated per field would be the next step — the CSP rules out building it at run time).
  The fine speeds now run on one Fish3 (~48 ms a 0.1-s step: 1× keeps up, 4× runs ~2×, as before the shards).
- **The water model overlapped with the GPU's block.** `GpuFish.block(dt, during)`: the caller's water step runs while the GPU
  works, and the fish's takes come back as DIFFERENCES from what was uploaded (a cell no fish touched keeps its exact float64 value
  — before, every cell was rounded to float32 each block). The worker and the year runner use it (`?overlap=0` off).
- **Two couplings fixed.** The GPU path never set `chem.fishKgHa` (the fish biomass the zooplankton's daily migration and the
  mussels' hosts answer): it stayed at the founding's value — now each block's (the fish and young at its start, as fish3's hash
  sets it). The CPU's shards each counted the founding's tallies (the season's spawnings so far): the two-shard runs' spawnings
  read high by that much — now counted once, in shard 0 (gate `core`: the sharded founding's tallies equal one run's).

### G3 — the whole year on the GPU (seed 611 from May 20, true lakes; the CPU's own year run as far as it has got)

**A true-scale year in 27 minutes** (67–75 ms a block, the water model after the block — before the overlap; the CPU's two shards
need ~20 h). Where the CPU's run has got to, the two agree as at day 28 — day 42, CPU · GPU: lakes 105 · 105 kg/ha; bass 0.832 ·
0.833 with 3,190 · 3,199 starved; perch 0.957 · 0.957; killifish 0.842 · 0.845; the brook's dace 0.539 · 0.547; the young within
~3 % (perch 6.76M · 6.79M @ 3.6 cm both) — the GPU's young are held in fewer schools (46,900 · 61,300: its merges pair neighbours
more readily; the fish in them alike).

**What the first whole year shows — the MODEL, not the engine (the two agree where compared): the lakes are not yet
self-sustaining.** Each species' adults as a share of the start (fish, then deaths over the year by cause):

| | day 56 | day 126 | day 182 (Nov 19) | day 308 (Mar 25) | day 365 (May 20) | starved · eaten over the year |
|---|---|---|---|---|---|---|
| bass | 0.774 | 1.167 (recruits) | 0.530 | 0.271 | **0.230** | 22,054 · 18,758 |
| pickerel | 0.809 | 0.751 | 0.602 | 0.274 | **0.121** | 7,918 · 3,932 |
| bullhead | 0.895 | 1.499 (recruits) | 0.752 | 0.593 | **0.549** | 42,585 (late Sep–Nov) · 15,203 |
| dace (brook) | 0.295 | 0.018 | 0 | 0 | **0** | — · 1,209 (by fallfish and pickerel) |
| killifish | 0.801 | 1.495 | 1.231 | 0.690 | **0.562** | 5,433 · 97,883 (pickerel 71k) |
| fallfish | 0.895 | 1.500 | 1.280 | 0.797 | **0.686** | 7,441 · 24,824 |
| sunfish | 0.949 | 0.883 | 0.814 | 0.537 | 1.296 (spring recruits) | 11,162 · 1,518 |
| perch | 0.944 | 1.487 | 1.392 | 1.192 | 1.115 | 1,471 · 9,328 |
| white perch | 0.957 | 0.913 | 1.500 | 1.443 | 1.431 | 324 · 1,160 |
| sucker | 0.954 | 0.897 | 0.861 | 1.498 | 1.376 | 6 · 3,573 |

Biomass stays 109–131 kg/ha, but the community turns over: the piscivores STARVE — bass adults in midsummer (4,400, 17 % of
them, by mid-July), then the young bass recruited in August through October–November (+10,000), then on through the winter;
pickerel steadily, most of them over the winter (1,600 by November, 5,600 by late March) — while white perch and suckers fill to
the recruitment cap (F3.CAP × the census: the young beyond it are simply not made agents) and the young bullhead recruited in
August starve in the fall. The brook's dace are nearly gone by mid-August and extinct by November (the T7 finding: the spawning
fallfish packed into the brook). These are the first findings the GPU's speed makes visible — a year was 20 h on the CPU — and
the next calibration work: why bass and pickerel can't feed through the summer, fall and winter (their prey's sizes and numbers,
the strikes' reach — the coarse block's strike finding above — winter rations), the recruits' fall starvation, the dace in the
brook, and whether the cap should bind at all.

### G3 — calibrating the year (2026-10-18; the human: "yeah keep going")

**The diagnosis** (the year runner's diagnostics — each fortnight's ration, mean condition and diet by species — seed 612 as 611;
a one-fish winter in Node, `scratchpad/winter_fish.mjs`; two research notes, `docs/research_notes/Predator winter energetics/`):
- **The young recruits starve in fall and winter, the adults mostly don't.** ~17,000 young bass and ~38,000 young bullhead die from
  October; the adult bass keep K ~0.85 all winter. Both young run on the Rice largemouth stand-in, whose respiration barely falls
  with the cold (Q10 1.37): at 4 °C a 5-g fish burns ~227 mg O₂ kg⁻¹ h⁻¹, 5.5× the bullhead's own set — over a 208-day winter,
  energy 3.6× its mass: every one dies whatever it eats.
- **Whitledge's smallmouth respiration** was measured at 18–30 °C; its mass exponent (−0.756) makes 100–150-g bass 2–4× too costly
  in winter (64 vs the field's 20–35 mg O₂ kg⁻¹ h⁻¹ at 4 °C). The **pike set** overstates the esocids' winter needs 2–4× (Chipps et
  al. 2000): maintenance at 1–4 °C was 72–77 % of Cmax, the pickerel getting ~40 % (realistic) and losing condition 0.84 → 0.72.
- **A constant energy density** (4,184 J/g) turned a lipid-dominated winter loss into 1.5–2× too much mass loss.
- **Nest guarding killed ~14 % of the adult bass in late June:** respiration ×1.6 (Hinch & Collins's PEAK) with feeding ×0.2 and the
  swimming cost on top — ~2 % of the body's energy a day, where real guards lose 3–8 % of their mass over ~4 weeks and none starve.
- **The strikes' stale grid** (above) was a real bias but a small one at true scale: the hash rebuilt after the moves raised the
  kills 12 % and the fish eaten 37 % over 2 days (CPU, seed 611) — bass and pickerel eat mostly crayfish (78 % / 57 % in June).
- **The water under the ice** is 1–2 °C through the column (3 °C in the bottom layer), where Maine lakes run ~0–1 °C under the ice
  and ~3–4 °C at the bottom, warming from the sediment through the winter — noted, not yet changed.

**The fixes** (both engines; CPU and GPU from one set of numbers):
- `F3.FRESH_HASH`: fish3's coarse block in two passes (every fish moves; the hash rebuilt where they got to; every fish feeds,
  spawns, breathes, meets its hazards); the GPU rebuilds its grid between k_move and k_body. Parity re-checked at 1/10 (3 seeds × 30
  days: ten species within the seeds' spread, bullhead 0.873 · 0.900). It exposed a hand-back bug: a mate later in the list was
  dropped when the arrays became new objects (its id checked before set) — fixed, the gate's hand-back check passing again.
- `bioenergetics.js coldResp / coldCmax`: a species' cold rule below T1, wholly below T0. **Bass** (every set, the Rice stand-in too):
  30 mg O₂ kg⁻¹ h⁻¹ at 5 °C for 100 g × (W/100)^−0.2 × 2^((T−5)/10) × 0.7 once it stops feeding (12 → 8 °C), FB4's above 18 °C, and a
  small bass's appetite in the cold its own species' set's. **Young bullhead**: the bullhead's own respiration and appetite below
  15 °C, × 0.7 buried and fasting. **Pickerel**: the pike set's respiration ×½ at ≤ 8 °C, back to FB4's by 15 °C.
- `bioenergetics.js energyOf / massOf`: below its standard weight a fish's energy density follows its condition — E = W·ED0·(1 +
  γ(K − 1)), γ 0.8 adults (the fat goes first, ~7.5 kJ a gram near K 1; the field's 7–9), 0.3 the year's young; at and above Ws
  FB4's own ED0, so summer growth is as the sets were fit.
- **Guarding by stage** (`BROOD.GUARD_METAB3 / GUARD_FEED3 / GUARD_EARLY / GUARD_QUIT`): ×1.4 and ~0.12 of a free fish's feeding over
  the eggs to swim-up (the first 9 days), then ×1.12 and ~0.45; no swimming cost on top; a guard under K 0.80 leaves its nest. The
  bullhead's guard 12 days (was 22; 10–14 in the field).
- One fish through a winter (Oct 16 → May 12), old → new: a 30-cm bass −35 % → −10 % of its mass (−18 % energy; the field −5 to
  −15 %, −15 to −25 %); a 21-cm bass −78 % → −12 %; young bass all dying → −33 to −45 % of their energy (those under ~6 cm ending in
  starving condition, over ~8 cm through — the field's 48–92-mm threshold); young bullhead all dying → −37 to −44 % (the 4-cm ones
  die); pickerel −30 to −45 % → holding or gaining; perch, white perch, sunfish, fallfish as before.

**The year with the fixes** (seed 611, the true lakes on the GPU, 23.6 min): each species' adults at the year's end, before → after
(deaths over the year, starved · eaten):

| | before | after | starved · eaten (after) |
|---|---|---|---|
| bass | 0.229 | **0.664** | 3,902 (July) · 30,777 (the August recruits: pickerel 18,135, other bass 12,246) |
| pickerel | 0.117 | **0.448** | 690 · 5,531 — only ~2,500 of the year's young reach their recruiting length |
| bullhead | 0.548 | **0.844** | 11,385 · 37,748 (pickerel 33,609) |
| fallfish | 0.711 | 0.707 | 2,834 · 27,642 |
| killifish | 0.578 | 0.534 | 2,540 · 105,013 (pickerel 79,516) |
| sunfish · perch · sucker · white perch · redbreast | 1.29 · 1.12 · 1.39 · 1.43 · 1.30 | 1.34 · 1.12 · 1.36 · 1.43 · 1.31 | |
| dace (brook) | 0 | 0 | |

Biomass 111 kg/ha. Winter starvation is gone (the adult bass's K 0.95–0.97 through the winter; the young bass and bullhead
recruited in August come through it). **Still open:** the pickerel's recruitment (and so its decline), the bass's July starvation (a
crayfish-heavy diet at ~3,000 J/g after its shell, at 23–24 °C, on Whitledge's summer respiration), the young bass's losses to
pickerel, the brook's dace, the cap the prey species fill.

## Stages

- **G0 — feasibility (first):** profile the CPU coarse block to see where the time goes, then port the costliest kernels (the
  grid, the senses, the brain, the relocation) for the true lakes' 300,000 agents and time them on the RTX 3060 against the
  CPU's. Decides whether the full port pays.
- **G1 — the full coarse block on the GPU**, kernel by kernel, each checked against the CPU on the same inputs (one block from a
  saved state: the distributions of where the fish went, what they ate, how they grew).
- **G2 — validation:** the season and the year against the CPU sim, ≥ 3 seeds each.
- **G3 — in use:** the browser's fast-forward and the headless year runner on the GPU; the fine steps near the camera stay on
  the CPU.
- **Later:** the water model at finer resolution on the GPU (the 50-m columns are its biggest simplification), and the fine
  0.1-s step of every fish (no more blocks away from the camera).
