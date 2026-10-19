# FINDINGS — what building and testing the Hot Brook lakes taught

The running log for the paper (ROADMAP "📄 The paper"). One dated entry per finding: **what** was found, **how** (the run, seeds,
tool), the **evidence** (numbers), and **where** it is documented in full. Model artifacts count as findings — what a whole-lake
model gets wrong, and why, is as useful to the next modeller as what it gets right. Newest first.

## 2026-10-19 — Predation on the young by density (stage Y1; docs/HOT_BROOK_3D.md §4)
- **The point-school encounter hid most of the predation on larvae.** Replacing "a predator eats from the nearest school within
  0.6 m" with clearance of the water's density (Holling II, gut-limited; Persson et al. 2004's 400·L^0.6 L/d) raised the followed
  fish's take of young fish ~24× in the first fortnight (1/10 lakes) — the larvae of perch, white perch and suckers now meet the
  panfish that feed among them.
- **The recruitment cap had been doing the predators' work.** On the old rule a share of every prey species' young reached their
  recruiting length only to be discarded at the census cap (bullhead 19 %, bass 14 %, fallfish 12 % of the year's hatch); with
  density predation the surplus is eaten instead — and the background larval and juvenile mortality, calibrated when the lake's
  fish ate ~1 % of its larvae, now counts those predators twice (the perch's total loss unchanged, 75 → 73 %, but killifish, sucker
  and redbreast recruits fell 83–92 %): a background rate that stands in for unsimulated predators must shrink as they are simulated.
- CPU ⇄ GPU parity holds for the new rule (1/10, 3 seeds × 30 days), killifish at the edge (0.866 vs 0.843).
- **Three seeds, a year (old rule → density, calibrated):** pickerel recruits 175–257 → 1,742–1,789 and their biomass 2.4 → 3.4 kg/ha
  (start 3.2), bass 8.3 → 11.0 kg/ha (start 9.1) — the predators were starved of the young fish real ones live on; bullhead and
  killifish counts fall (0.83 → 0.66×, 0.46 → 0.31×). Counts and biomass tell different stories: report both.

## 2026-10-18 — The weed beds (stage 7h; docs/HOT_BROOK_3D.md §5)
- **A uniform starting state hid the beds' equilibrium.** Every species seeded at 15 % of its stand in every cell of its range gave
  a first summer with plants on 96–100 % of the bed and every species declining from June; all year runs and views had opened on
  it. How: `scratchpad/plants_audit.mjs` (true lakes, no fish). Fix: a generated start, the model's own beds after 5 years.
- **A maintenance floor borrowed from canopy-plant models (0.022/day) made the slow evergreen forms unviable** — rosettes (max
  growth 0.005–0.008/day) and Nitella died out over 3–5 years (stands 26 → 17 % of the bed). How: `plants_why.mjs` growth terms by
  species over 4 years. Literature gap: no isoetid dark respiration found.
- **Calibrating a plant's losses to break even on its light limit's day leaves the deep edge shrinking every year**: a pondweed
  keeping 30 % of its mass over winter must out-grow its losses ~3× in a season. Calibrated to the year (and to the lake's nutrient
  factor), the canopy holds to 2–3 m (research 2–2.7 m in coloured water).
- **The waves' fetch sets the shallow edge**: per-column effective fetch → a 10 m/s storm's wave depth (CEM) → 0.7–1.2 m in these
  lakes, matching Duarte's 0.75–1.25-m minimum depth of submerged plants in 25 NE lakes and the human's dock shore (bare to 0.6 m).
- **Fish cover from mean stems understates patchy cover** (the Hill cube): cover must be computed by stand — and given only to fish
  IN the stands (within the canopy's height of the bed): structure protects only the fish that use it.
- **The unrealistic lawn had been propping up the young pickerel.** With the generated (realistic) beds, the same year (seeds 611/612)
  recruited 247 / 344 young pickerel against 2,183 / 2,657 on the lawn: in June, when the young are 2–4 cm, real beds are still
  growing (column cover 0.15–0.35) where the lawn had covered most of the shallows (cover ≥ 0.5 over 65 % of the < 2-m columns by
  mid-June); the young were eaten 37–50 % a fortnight at 3–5 cm against 16–33 %. A calibration done on an unrealistic habitat
  transfers its error to the animals tuned on it — check the habitat first.

## 2026-10-18 — Predators' recruitment (docs/GPU_SIM.md "G3 — calibrating the year")
- **Super-individual schools meet only by coinciding**: young-on-young predation needed a prey school within 0.6 m; young pickerel
  allowed fish from 5 cm (the literature's onset) recruited only +4 %. Points don't overlap; densities do — the rule should be
  density-based (research: young_piscivore_functional_response.md).
- **The census cap silently discarded ~700,000 of 1.1 M young bass at recruitment** (a tally added: T_YCAP).
- **By biomass the bass held through a year (1.02×) while their count fell to 0.63×** — counts mislead where recruits are small.
- **Pickerel cannibalism ran ~2.5 %/week in late May** (90 % on 10–20-cm fish) against the evidence's ≤ 0.1–0.3 %; it took twice
  the year's recruits (4.7–5.3 k vs 2.2–2.7 k).
- **A preference of young pickerel for weed cover lowered recruitment** (1,799 vs 2,657): the weeds were also where the larva-eating
  panfish and the adult pickerel were — and the weeds themselves were then the uniform lawn above.

## 2026-10-18 — Winter energetics (docs/GPU_SIM.md)
- **FB4 sets fit at summer temperatures overstate winter needs 2–5×** (the Rice largemouth stand-in for young bass: energy 3.6×
  its mass over a 208-day winter; Whitledge's smallmouth respiration 64 vs the field's 20–35 mg O₂ kg⁻¹ h⁻¹ at 4 °C; the pike set
  2–4×, Chipps et al. 2000). With empirical cold rules, winter starvation disappeared (bass 0.23 → 0.66× after a year).
- **A constant energy density turns a lipid-dominated winter loss into 1.5–2× too much mass loss** — energy density by condition.
- **Nest guarding as published peak costs × low feeding killed 14 % of adult bass in late June**; staged guarding (eggs → fry) none.
- **Coarse time-steps underfeed bottom feeders**: a block places a fish at its habitat's mean height — 10 % of bass within reach of
  the bed vs ~51 % over fine steps; the fix (time-within-reach share, gamma heights) restored crayfish intake to ~90 % of fine.

## 2026-10-18 — The GPU engine (docs/GPU_SIM.md)
- A WebGPU engine (counter-based RNG, 64-bit fixed-point atomic tallies) reproduces the CPU reference statistically (every species
  within the seeds' spread) at ~40× the speed; a true-scale year in ~14–25 min instead of ~15 h.
- Building it exposed a CPU⇄GPU hand-over bug (mates resolved before their ids were set) — independent re-implementation as a test.
