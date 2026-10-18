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
