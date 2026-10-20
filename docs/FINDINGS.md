# FINDINGS — what building and testing the Hot Brook lakes taught

The running log for the paper (ROADMAP "📄 The paper"). One dated entry per finding: **what** was found, **how** (the run, seeds,
tool), the **evidence** (numbers), and **where** it is documented in full. Model artifacts count as findings — what a whole-lake
model gets wrong, and why, is as useful to the next modeller as what it gets right. Newest first.

## 2026-10-19 — Copepods need a trade-off, and the winter O₂ budget leaned on too-bright ice (docs/HOT_BROOK_3D.md §4)
- **What.** With per-capita algae the zooplankton bloomed and crashed realistically, but copepods were still excluded by Daphnia
  and the crustaceans collapsed under the ice. The copepods' parameters gave them a higher food threshold AND lower growth than
  Daphnia — no trade-off, so they lost at every food level. Real copepods persist through low losses (fish rarely catch them;
  adults overwinter on lipid at ~0.05 %/day), not a lower threshold.
- **Evidence.** A research synthesis (copepod_daphnia_coexistence.md) set the copepods' threshold at ~1.06× Daphnia's, their
  growth at ~0.45×, their losses lower and colder-insensitive, ~30 % autumn dormancy and ephippia hatching at ~1 %/yr. Fish-free,
  the year then shows a clear-water peak and crash, an autumn Daphnia rebound and a copepod-dominated winter (10–15 µg/L, the
  field's 10–20); with fish, copepods hold 55–105 µg/L through summer (60–70 % of the crustaceans late in the season).
- **A side finding.** Under snowy ice (1–12 % of light) the winter algae fall to field levels but the fish-free lake's mean O₂
  falls to 2.7 mg/L: the model's under-ice O₂ had depended on photosynthesis through ice that passes 40 % of the light. Two errors
  (bright ice, and whatever sets the winter O₂ demand) had been cancelling.
- **What it leaves.** Year 2 still collapses: a planktivore crowd (white perch adults, which the model keeps on zooplankton at all
  sizes, and tens of millions of young perch) grazes the second summer's zooplankton to 12–20 µg/L.

## 2026-10-19 — Zero-order algal growth gave the zooplankton a free lunch (docs/HOT_BROOK_3D.md §4 "Item 4 found")
- **What.** The algae's growth term, inherited from the 2-D sim, was `GROW·light·nutrient·(1 − b)`, with no factor of the
  biomass b. Grazed to almost nothing, the algae kept making ~90 % of their ungrazed production, so the zooplankton were fed
  without limit and Daphnia held 900–1,500 µg/L all summer in a lake whose field level is ~50–150.
- **How.** The 3-D water run alone for a year without fish (true lakes, seed 611, CPU `Env3`), with tallies of the algae's
  growth and die-off (chem3 `algProd`, `algDecay`), their net production from their own O₂, and the zooplankton's production
  (`zooProd`); a zooplankton-free run to calibrate the replacement.
- **Evidence.** Grazed to 0.013 units, the algae grew 381 unit·L/m²/day against 425 ungrazed (ten turnovers a day); their O₂
  said net production had fallen from 662 to 37 mg C/m²/day. The zooplankton's production (0.34–0.67 g DW/m²/day ≈ 160–320 mg C)
  exceeded the algae's own, which is impossible. Field crustacean production is ~5–25 g DW/m² a year; the sim's capacity was
  ~60–100. With per-capita growth (`(b + INOC)·GROW_PC`, the form the sim's cyanobacteria already used), calibrated so the
  ungrazed season matches, fish-free Daphnia show the PEG pattern instead: a ~340 µg/L peak in mid-May, a clear-water crash to
  ~190, then 200–330 µg/L through early summer, with production ~4× lower (~10 g DW/m²/yr).
- **Why it matters.** A model that makes a resource's production independent of its standing stock cannot show
  consumer–resource control. The bug was invisible in the O₂ budgets because O₂ was computed per-capita while biomass was not:
  two descriptions of the same photosynthesis, which agreed only at the densities they were calibrated at. A check of production
  against an independent measure of the same process (here O₂) catches this; a check of standing stocks alone does not.

## 2026-10-19 — Maine's own field data move the calibration targets (docs/research_notes/fetched_sources_digest.md, fetched_sources_read_by_me.md)
- **What.** The human fetched the primary Maine sources the project had cited second-hand. Three of the project's targets were
  wrong, and the sim's year 1 overshoots the only Maine whole-lake counts.
- **Total fish biomass.** Rupp & DeRoche 1965 (*TAFS* 94:9, rotenone plus SCUBA counts of sunken fish, three small Maine lakes)
  give 44.5, 70.1 and 117.1 kg/ha for ALL species (Table 12: 39.7 / 62.5 / 104.5 lb/acre — checked in the scan). The sim's lakes
  grow to 140–165 kg/ha in year 1, and its white perch alone (55–63 kg/ha) exceed two of the three lakes' totals. Per species
  there: pickerel 4.1 and 8.4 kg/ha, white sucker 24–38, pumpkinseed 14.9 (mostly young-of-year, in a Washington County lake
  without perch or bass).
- **Predator diets.** Cooper 1941 (MDIFW Fish Survey Report 4; Tables XVI–XVII, checked in the scan), summer, white-perch lakes:
  adult pickerel (32–64 cm, 51 with food) ate 55 % white perch, ≈ 95 % fish and 0.5 % crayfish by volume; smallmouth (22–54 cm,
  36 with food) ate 61 % white perch, 80 % fish and 14 % crayfish. The project's targets (pickerel crayfish 10–30 %, bass 35–55 %)
  came from non-Maine lakes, and Cooper notes crayfish were "generally rare in Maine". The sim's pickerel take 34–36 % crayfish
  and its bass 63–64 %. The samples are small and a few lakes dominate the volumes (Snow Pond gives most of the bass's white perch).
  Hot Brook's crayfish density is unknown.
- **White perch mortality.** The adult A ≈ 0.50–0.56 the notes attributed to Cooper is not in Cooper. His ages of 1,827 fish
  give a catch curve with A ≈ 0.15–0.3 at ages 5–9 and ≈ 0.5 from age 9 (agent's arithmetic). So adult mortality rises with
  age, and the sim's ~30 %/yr is inside the Maine range; the regulation belongs in the young (first winter, stunting).
  Adults ≥ 15 cm ate 67 % bed animals and only ~6 % plankton by volume, so the sim's white perch zooplankton feeding to 40 cm is too planktivorous.
- **What it changes.** Stage R's targets (docs/HOT_BROOK_3D.md §4): a whole-lake total near 50–120 kg/ha; predators fed mostly
  on white and yellow perch; white perch regulated through the young and growth, not by a flat adult death rate.

## 2026-10-19 — The first multi-year runs: the lakes collapse in years 2–3 (docs/HOT_BROOK_3D.md §4 "Stage P3")
- **A year is not a test of self-sustainment.** Every calibration so far had been judged on one year; the first 3-year runs (seed
  612, true lakes) collapse in years 2–3 under the committed stage Y1 AND under stage P: pumpkinseed 1.7 → ~0 kg/ha, redbreast
  2.2 → ~0, killifish extinct, fallfish 7.1 → 1.4–1.8, then the pickerel (→ 0.5–0.7 kg/ha) — leaving perch, white perch and
  suckers; by year 3 the two versions are within a few tenths of a kg/ha of each other: stage P's predators hasten the littoral
  species' fall in years 1–2; they don't cause it.
- **The cause is the base of the web.** Year 1's summer zooplankton runs 500–970 µg/L (field summer crustaceans ~60–100); the fish
  grow from ~100 to ~165 kg/ha on it (white perch 31 → 61 kg/ha, perch 19.5 → 36 — research: white perch 15–35, and the human: "not
  nearly as many perch as fallfish and bass", the perch small); from year 2 the zooplankton never recovers (2 µg/L all winter, a
  May peak ~100–120, then 2–40 all summer), every adult's ration falls to 0.25–0.35, and the late-spawning sunfish's, killifish's
  and fallfish's young stall at 1–2 cm while the white perch's (3× year 1's cohort) keep growing. How: year.js's zooplankton
  line (fishside3 waterOf), the young's lengths by species, the 3-year runs (scratchpad y612_p3_3yr, y612_y1_3yr).
- **The census cap was the white perch's only regulator** (recruits held at 1.5× the census; ~91 % of each year's recruiting
  young discarded): with adults losing ~30 %/yr (field 45–65 %: research `white_perch_regulation.md`) and their recruits entering
  at 8 cm in their first September (field: overwinter as age-0, size-dependent first-winter mortality — the compensatory brake),
  nothing in the model's ecology limits them. A cap that binds is a missing mechanism.

## 2026-10-19 — Where the prey are and what the predators take (stages P1–P2; docs/HOT_BROOK_3D.md §4)
- **The lake's commonest fish were all but immune to its predators.** Yellow and white perch (~780,000 fish ≥ 7.5 cm) lost < 1 %
  a year to predators (2,800 and 900 eaten) while the bullhead fell to 0.66× and the killifish to 0.31× in a year; in the field
  perch are the pickerel's first-named prey in Maine and predators take ~15–35 %/yr of 7.5–15-cm perch (research
  `predator_diets_and_prey_mortality.md`). How: a strike diagnostic (`scratchpad/diag_strike.mjs`) tallying, per predator and prey
  species, the fish met within strike reach, those within gape, the size factor and the strike weights. A perch's per-capita
  risk to a pickerel was ~1/60 of a killifish's: encounter ×4.7 (every perch offshore by day), gape ×2, size selection ×3,
  spines ×1.7, the larger school ×1.4. **A predator-prey model's emergent diet is the product of several factors each
  individually defensible; check the product against field diets, not each factor.**
- **One behaviour fixed a third of a species' losses**: the bullhead's winter in the mud (cover 0.9 below 9 °C, research: "buries
  in soft, leafy ooze or mud … only mouth and gills exposed") cut the pickerel's kills of them from ~51k to ~31k a year and lifted
  the bullhead from 0.65–0.67× to 0.85–0.88× by count (3 seeds). In winter the pickerel had been taking bullheads at nearly the
  summer rate — 45 % of their winter strike weight.
- **Size-dependent habitat alone barely moved the perch** (eaten 2.8–4.4k → 5.1–6.3k a year): the year's recruits arrive at 8 cm in
  September and spend only ~6 weeks in the littoral before cold water sends every perch to the deep basin.
- **A habitat band is not where the fish are.** At true scale in July the killifish, given the whole shelf (0.1–1.3 m) by day,
  spent ~3/4 of it over water ≥ 0.6 m — the pickerel's — and 23 % deeper than their band; at 1/10 scale the same test could not
  separate predator from prey at all (the shelf 10× steeper puts every depth within a strike's reach). Habitat overlap must be
  measured in the world the predation runs in. How: `scratchpad/where.mjs` (bottom depth under each species, day and night).
- **The size rule was the largest single error** (research: the field's capture success falls ~linearly with relative size; the sim
  had (1 − depth/gape)²): it made a 10–13-cm perch 4–8× less catchable than a 6-cm killifish where field rules give ~2×. Replaced by
  1 − (depth/gape)², the pickerel's diet moved from 53 % to ~61 % fish and from 42 % to ~36 % crayfish (field 65–85 / 10–30).
- **Winter is where predator meets prey.** Putting the young perch in the shallow weeds at first ice (dishpan lakes' perch at 1.2–2.4 m)
  — while bass, sunfish, bullheads and crayfish go still or bury — took the perch lost to predators from ~19k to ~72k a year (~20 %/yr,
  the field's 15–35 %). A habitat assigned for one season can hide a whole predator–prey link for the other three.
- **Apparent competition emerges.** With perch in reach the pickerel grew (3.4 → 5.2–5.5 kg/ha, within the field's 2–6) and their
  other prey fell further — killifish 0.30 → 0.13×, fallfish 0.7–0.8 → 0.5×, sunfish 1.0 → 0.7 kg/ha: a food-limited predator kills each
  prey in proportion to meeting it, so a new abundant prey feeds more predators rather than sparing the rare ones (Holt 1977). Whether
  the small species then persist depends on their refuges — an open question in the model (3 seeds, a year).
- **Where the prey die is measurable, and it overturned the obvious fix.** A GPU tally of kills by the prey's bottom depth showed
  57 % of the killifish taken inside their own shallow band (0.1–0.6 m), mostly at partial cover — so a predator-side rule (a
  predator strikes at full effect only over water ≥ 0.02 m per cm of its length; Power 1987) replaced the prey-side shallow cover.
  It changed July's killifish kills by only ~5 %: the sim's pickerel then averaged 25 cm, and small pickerel do work that water —
  and do select killifish (Guillory 1979: selected by pickerel < 30 cm SL, avoided above). Moving the small pickerel onto the flats
  (the anglers' "small pickerel stay shallow in lily pads") cut cannibalism 22 % but raised their killifish kills 33 %: the founding
  size structure (16,000 pickerel at a mean 24 cm against a lightly fished population's 30–35) may drive the first year's losses.
- **A closed connecting brook can't hold its dace** once the lakes' predators pass through it (pickerel and bass take ~900 a year of
  ~1,400; at 1/10, without them, the dace hold): the field's brook dace are likely part of a stream population above and below the
  lakes that a two-lake model leaves out.

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
