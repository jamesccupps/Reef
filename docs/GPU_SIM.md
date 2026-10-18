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
  untouched water; the asks are summed per cell and kind as T, the share of the cell's reachable food asked for; each gets its
  whole ask while T ≤ 1, its 1/T beyond. A first version shared by 1 − e^(−T) (each feeder a fraction of what is left) and starved
  the crowded young by ~9 % with food to spare: fish3's feeders ask for grams and get them until the food runs out. The crayfish
  keep the exponential (a crowd can't take every crayfish of a cell, the sheltered ones too, in a block).
- **Strikes: a finding about the CPU sim.** A coarse block's strikes look for prey through the neighbour grid built at the
  block's START, while by then every fish has moved (~28 m on the true lakes): a predator finds a prey only where its start cell
  is near where the predator got to — in practice the fish after it in the list, which haven't moved yet. With the grid rebuilt
  where all had moved, the true lakes' predators struck ~9× as often. The fish near the camera, stepped second by second with a
  fresh grid, are struck at the formula's full rate — so the far fish's predation runs below the near fish's. The GPU keeps the
  CPU's behaviour for now (the block-start grid; a fish earlier in the list where it moved to, a later one where it began), so the
  two can be validated against each other; correcting it means re-checking the predation calibration (the pickerel's ~1.3 % a
  week, the dace's losses) — a decision for after G2. (The per-phase harness can't compare strikes: in it every prey has moved
  before any predator feeds, as never happens in the CPU's own block — that comparison is G2's, on real blocks.)

Next: spawning (mates, the spawn, a mutated crossover genome for each new school, the nest guard), recruitment (the young into
agents), the schools (merge, split, the budget's own-brain cut, dissolve), compacting the dead; then the whole block in a loop
with the water model.

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
