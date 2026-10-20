# Review: white sucker (`sucker`), brown bullhead (`catfish`) and the young-of-year system

Written 2026-10-20 for the human's request: "make sure it's all behaving as it really would in the environment".

**Scope.**
- White sucker and brown bullhead, every aspect.
- The young-of-year (YOY) system for all species: hatch, larval and juvenile mortality, density compensation, the diet
  ladder, growth, habitat/targeting, predation on the young, the first winter, recruitment, and whether recruitment can
  sustain each population.

Everything is read with the stage R package applied (`stageR5()`, `src/w3/fish3.js:417`, about to become the default:
STRIKE2, ENC_DZ, RECRUIT_SPRING, BAND_REL, HUNGER_GATE, yBed/benthL for killifish, fallfish Lpisc 30, bass yLpisc 10, YCOLD).

**Sources** (cited inline by short tag):
- `docs/research_notes/`:
  - SSB = `Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md`;
  - RCM = `Maine lakes ponds and streams/recruitment_compensation_maturity.md`;
  - SFH = `Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md` (§3 sucker, §4 bullhead);
  - SIZ = `Whole lake 3D fish simulation/size_structure_whiteperch_sucker_bullhead.md`;
  - PDM = `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`;
  - YPF = `Whole lake 3D fish simulation/young_piscivore_functional_response.md`;
  - FWM = `Real lake ecology for calibration/first_winter_mortality.md`;
  - FFE = `Real lake ecology for calibration/forage_fish_early_life.md` (incl. its brown bullhead section);
  - FZC = `Real lake ecology for calibration/fish_zooplankton_coupling.md`;
  - PEA = `Real lake ecology for calibration/piscivore_encounter_attack.md`;
  - PFR = `Real lake ecology for calibration/piscivore_field_feeding_rates.md`;
  - KPP = `Real lake ecology for calibration/killifish_persistence_and_predators.md`;
  - SFN = `Hot Brook populations and water/small_fish_numbers.md`.
- `docs/FISH_CENSUS.md`, `docs/FINDINGS.md`, `docs/HOT_BROOK_3D.md` §4.
- The human's field notes (memory `hot-brook-field-observations.md`): bald eagles present; "schools of small fish or
  minnows in shallow areas"; bullhead and sucker on MDIFW's list for both lakes.

No web searches were needed: the repo's notes cover every point that has evidence. Where they have none (sucker first
winter, YOY densities of suckers and bullheads, sucker age-0 length) this file says UNKNOWN rather than guess.

**Runs read:**
- GPU, true-size lakes, seed 613, all with the arm-B URL overrides (white perch, sunfish, redbreast, fallfish, killifish
  and dace adults off zooplankton; not in the code — they do not touch suckers or bullheads directly):
  - r8O_613 (arm O: the package through 6j + 6k YCOLD), read to day 952 (year 3's first winter); scratchpad tools
    `yrsum.mjs`, `yrdem.mjs`, plus `review/ysp.mjs` and `review/ytab.mjs` (per-species time series);
  - r6M_613 (arm M, one year, with the end-of-year tallies: who ate whom, kills by length, the young's fates and diets).
- CPU probes written for this review (1/10 lakes, stageR5, scratchpad `review/`):
  - `yfate.mjs` — the young of each species through a year, two seeds (611, 612): numbers, length, bed depth, O₂, fates;
  - `spawnwhere.mjs` — where and when suckers and bullheads spawn, the young's water, who eats suckers and bullheads (seed 611);
  - `growth.mjs` — a season's growth and fate of the followed suckers and bullheads by starting length (seed 611);
  - `winterO2y.mjs` — the young's first winter: the O₂ in the cells they sit in, school sizes, fates (seed 611).

Single-seed GPU numbers swing; the patterns below recur in every season and both CPU seeds unless said otherwise.

**Status key:** **OK** matches the evidence · **OFF** wrong value or behaviour · **MISSING** process not modelled ·
**UNKNOWN** no evidence, or not measurable yet. Priority **H** / **M** / **L**.

---

## 0. The top issues (ranked)

1. **H — The young die of HYPOXIA under the ice, every species, 8–25 % a fortnight from mid-January (GPU).** First-winter
   survival of the young schools is 14–36 % for every species (sucker 22 % / 14 %, bullhead 18 % / 16 %, perch 33 % / 22 %,
   white perch 36 % / 34 %, bass 29 % / 26 %, pumpkinseed 19 % / 4 %; years 1 / 2). The field's first winter with predators
   leaves ~30–70 % alive, and bullhead and sucker young should be the hardiest (FWM §6–7). The ramp the sim built for this
   (WINTER0) kills almost nothing; the deaths come from O₂. The adults in the same water do not die of it. The CPU shows
   the mechanism (§3.L):
   - the young keep sitting on the RICHEST bed all winter, the organic beds that go anoxic first;
   - they test O₂ only in their own cell, against o2Crit, and only after the hour's hazard is charged.

   Hot Brook is not a winterkill lake: white perch, which need oxygenated deep water in winter, persist there.
2. **H — The young's "unsimulated" mortality is not cold-scaled and carries a Lorenzen size multiplier up to ×30**
   (`fish3.js:2198`). Over a first winter (1 Nov → mid-April) it alone kills 20–39 % of the young of every species (killifish 50 %),
   predators and ramp aside. Under ice there are no herons, kingfishers or mergansers, and Lorenzen's size dependence is
   mostly predation, which the sim now simulates.
3. **H — The spring hand-off to the followed fish is a hazard step.** Recruitment is at FRY.SPRING_YF 0.08 (≈ 30 March,
   three weeks before ice-out). The young schools are hunted under YCOLD (a predator's FB4 consumption curve, ~0.02–0.1 for
   bass at 1–7 °C). As agents the same fish face `_strike2` at the cold-performance factor only (bass 0.2–0.36). Over the
   eight weeks around recruitment (22 March → 17 May, water 0.7 → 9 °C), arm O's losses, counted against the fish that had
   just recruited:

   | Species | Year 1 | Year 2 |
   |---|---|---|
   | Sucker | 98 % (19,700 eaten) | 126 % |
   | Bass | 79 % | 62 % |
   | Fallfish | 75 % | 112 % |
   | Redbreast | 74 % | — |
   | Sunfish | 31 % | 78 % |
   | Bullhead | 23 % | 25 % |
   | Perch | 19 % | 47 % |
   | White perch | 11 % | 19 % |

   The same fish, as young schools in the eight weeks before, had lost ~3 % a fortnight to predators. The CPU shows
   smallmouth killing suckers and bullheads at 4–7 °C in April, when Maine bass are near-still. The predators review found
   the same for age-1 bass (63 % eaten within ~6 weeks).
4. **H — Bullheads are the smallmouth's commonest prey by count** (arm M: 16,389 kills, 18 % of the bass's kills; CPU 1/10:
   bass + pickerel took ~25 % of the founding bullheads between May and August). Field: no record of smallmouth eating brown
   bullhead, Maine smallmouth ~0 bullhead (Cooper 1941; PDM §2.2, §7.1); bullheads are "least vulnerable" (Mauck & Coble
   1971); spines deter esocids (aquarium pike 0/10). Bullhead biomass falls 10.4 → 6.6 → 4.1 → 3.0 kg/ha over 2.6 years
   (census ~10).
5. **M — The young bottom fish live in the wrong water.** Sucker and bullhead young settle on the richest bed anywhere: on the
   CPU they sat over 2–3.5 m of water in June–August. Field: sucker fry under 51 mm feed in 15–20 cm of water along shores
   (SFH §3); young bullheads keep to quiet coves in compact schools (FFE; SFH §4). Only killifish have a shelf limit (`yBed`).
6. **M — Starvation is a main SUMMER killer of young bullheads** (CPU: 26–29 % of the hatch starved by October, more than were
   eaten; GPU: 15–32 % a fortnight in August–September). Pickerel, bass and late sunfish young starve too. Field: predation,
   not starvation, kills the young in summer; starvation belongs in the first winter (FZC §2).
7. **M — Bullheads spawn late and over too long** (GPU years 2–3: mid-June to early September, peak late June – mid-July,
   ~30–40 % after mid-July). Field: late May – mid-June, most eggs laid in a 10–15-day window, once a year (Blumer 1985;
   FFE). `spawnT [21, 28]` (`species.js:574`) starts at ~19.5 °C (12 June on the sim's curve), and nothing ends it before
   SPAWN.SEASON_END (1 September).
8. **M — The census cap is doing white perch's and sunfish's regulation.** At the year-1 spring recruitment the cap discarded
   64 % of the surviving white perch cohort and 55 % of the pumpkinseed (arm O). The same problem is named in FINDINGS
   2026-10-19 ("a cap that binds is a missing mechanism").
9. **M — Chain pickerel recruitment is ~0.** Arm O: 237,000 hatched → 2 and 4 recruits a year. The young pickerel die by late
   August at 6–8 cm: starved 17–21 %, eaten 20–37 % and natural 6–30 % a fortnight. Field: Maine YOY pickerel are 10–13 cm by
   fall and 60–80 % survive the winter. Killifish recruit 13 (KPP needs ≥ ~0.2 % egg → age 1). Both are mainly other
   reviews' species; the mechanism belongs to the YOY system.
10. **L–M** — the smaller items in the tables: no egg incubation, no larval drift from the brook, sucker capture success set
    at the "most vulnerable" tier, no bury for young bullheads, sucker brook runs without a capacity, and others.

What is RIGHT and should be kept:
- the hatch → autumn growth of nearly every prey species (§3.I);
- the summer juvenile Z (0.02–0.04 /d);
- the density-based predation on the young (Y1);
- the diet ladder;
- the bullhead's adult behaviour (nocturnal, small range, winter burial) and tolerances;
- the sucker's adult habitat, home range, spawning calendar and fecundity.

---

## 1. White sucker (`sucker`)

Code: `S3.sucker` `fish3.js:288–290`; `MOVE3` `:356`; `SPAWN3` `:371`; `CS3` `:482`; `BIO.sucker` `species.js:299–312`;
`SP.sucker` `species.js:532–562`; `WINTER0.K.sucker` `config.js:453`.

| # | Aspect | Real (source) | Sim (file:line, value) | Status | Pri | Fix |
|---|---|---|---|---|---|---|
| 1 | Numbers, biomass, size | Census 70/ha ≥ 7.5 cm (FISH_CENSUS); ~60 % < 30 cm (50–75), ~300 g mean → ~21 kg/ha (SIZ §2); 12–20 % of a Maine lake's fish biomass (species.js note, MDIFW) | perHa 70 (`fish3.js:289`). Arm O: 17.1 → 14.1 → 11.5 → 12.0 kg/ha (years 0–3); **n 45,052 → 25,092 → 16,003 → 13,100; mean length 24.5 → 30.6 → 33.6 → 37.2 cm** | Biomass OK; numbers and size structure OFF (an ageing population, recruits about half of deaths) | H | Follow from items 18–19 below; judge on n and % < 30 cm, not kg/ha |
| 2 | Habitat by season and time of day | Nearshore benthic forager, within 1 m of the bottom 84–88 % of the time; flat bays, avoids steep basins; mean 3.8 m in spring, 4.9 summer, 5.0 fall, 6.1 winter in a 34-m lake; more active and inshore at night (secondary sources); in winter slightly deeper, least movement (Richter et al. 2024; SFH §3) | Day bed [2.5, 5.5] m, h 0.2, act 0.5; night [0.5, 2.5], act 0.8; winter [3.5, 5.5], act 0.3 (`fish3.js:290`). GPU: 91 % of fish-blocks by day over ≥ 2 m | OK (in a 5.5-m unstratified lake the deeper flats are the field's "deeper than summer"; the night inshore move rests on secondary sources) | — | — |
| 3 | Home range, movement | 95 % kernel 14.6–18.4 ha, core ~2 ha, 74–82 % seasonal overlap, 2.1–3.2 km/day (Richter 2024) | HOME(80, 230): a 230-m leash ≈ 16.6 ha | OK | — | — |
| 4 | Lake-to-lake | Connected Adirondack lakes: a subset commutes daily through the channel, larger fish more (Marcy-Quay & Kraft 2021, SFH §3) | settle 0.07 /yr (`fish3.js:356`); no daily commuting | MISSING (minor) | L | Optional: a `trip`-like diel commute for large suckers living near a mouth |
| 5 | Temperature | Field selects 10–16 °C (stratified lake); literature 17–24, final preferendum 23.4 (SFH §3) | tPref 18, tempOpt 21, uilt 30 (prior) | OK (no cool refuge in Hot Brook anyway) | — | — |
| 6 | O₂, winter | "Anoxia-intolerant": killed after ~12 days at max DO < 1 mg/L; survived at ~4 mg/L (Shroyer 2007) | o2Lethal 1.0 (25 °C), under-ice floor 0.8 mg/L, o2Crit 0.3 × 9.5 = 2.9 mg/L (`species.js:311`); BIOE.HYPOXIA_DAYS 2 | OK (threshold right; the 2-day half-life at threshold is faster than the field's 12 days at < 1 mg/L — a shared parameter) | L | — |
| 7 | Adult diet | Invertivore/detritivore: chironomids, microcrustaceans, detritus, small molluscs; strong benthic competitor (SSB §4) | detritus, larva, snail (`species.js:541`), Lsnail 12; year's diet bed 97 %, weeds 3 % (arm M) | OK | — | — |
| 8 | Bioenergetics | No published model; yellow perch set is the nearest curve (SSB §1) | FB4 yellow perch set, ED 5,300 (`species.js:303–305`), flagged "uncalibrated" | UNKNOWN (stated assumption) | L | Validate against growth (row 9) once Maine length-at-age is in hand (Begley et al. 2017, blocked) |
| 9 | Growth | Big Bear MI (45 °N): 342 mm at age III (dense) – 418 (thinned); La Grande QC: ~30 cm at age 7; the sim's prior reaches 30 cm at ~age 4 (SIZ §2) | vb prior L∞ 52, k 0.2 → 12/19/25/30/34 cm (`species.js:306`, founders only); growth emerges from FB4. CPU season's growth by size: [PENDING-GROWTH] | UNKNOWN → see probe | M | — |
| 10 | Maturity | ♂ 2–3, ♀ 3–4 yr (Ontario); NJ ♂ 2–6, ♀ 3–7; Missouri age 3 at 275 mm (SIZ §2.2) | Lmat 30 ♀ / 26 ♂, matMinAge 2 yr, PMRN floor 0.7 (`species.js:307`) | OK | — | — |
| 11 | Fecundity | 12,500–140,000 (Ontario); 20,000–50,000 (DFO); 36,000–139,000 (Vermont) | ~60 eggs/g: 30 cm 16,000, 40 cm 40,000, 50 cm 81,000 (`species.js:309`) | OK | — | — |
| 12 | Spawning time | Runs from ~10 °C soon after ice-out, peak 11–15 °C, about six weeks; entry peaks at sunset (SSB §3, SFH §3) | spawnT [10, 15] (`species.js:544`). CPU: first spawning 15 May; GPU: early May – 9 June, peak mid-May. 10 °C falls on 11 May on the sim's curve | OK | — | — |
| 13 | Spawning place | Inlets and outlets, gravel riffles < 30 cm deep at 14–90 cm/s; some on lake shoals or skip; thousands may gather (SFH §3) | Brook runners: fish living within BROOK_RUN (1.5 km real) of a brook mouth (`fish3.js:188, 884`); the rest on lake shoals over [0.2, 0.9] m (`:371`). CPU 1/10: 35 % of spawnings in the brook, mean spawning bed 0.45 m | OK in form. MISSING: a capacity for the brook (fallfish have `runK`; at true scale every ripe sucker within 1.5 km of either end crowds the ~1,700-m² brook); no skipped spawning | L | Count true-scale sucker spawnings in the brook (`stats.spawnAt.sucker.brook`); if thousands, give suckers a `runK` from egg-deposition densities |
| 14 | Eggs, incubation, larval drift | Adhesive eggs in gravel hatch in ~1–2 weeks; larvae drift down to the lake at night (SFH §3 inference; FZC) | The school appears at spawning at Lhatch 1.2 cm (`fish3.js:1985–1989`), sHatch 0.1 (prior). At true scale the brook's young may stay and feed in it (`fish3.js:2259` `free`) | MISSING (incubation; drift) | L | §3.A: an incubation delay; brook-hatched young of lake species drift down the brook (it flows Upper → Lower) |
| 15 | Young's habitat | Young-of-year in schools of several hundred; **fry < 51 mm feed in 15–20 cm of water along lake shores** (ADW via SFH §3); juveniles in the shallows and brooks where nets miss them (SIZ §2.1) | Zooplankton targeting, then the richest bed from 2.5 cm, no depth limit (`fish3.js:2263–2269`). CPU: the young over 2.4–3.6 m in June, 2.1–2.6 m July–October | OFF | M | `S3.sucker.yBed ≈ 0.8 m` while ≥ YBED_T (as killifish), perhaps until ~5 cm |
| 16 | Young's diet | Larvae near the surface on plankton, benthic at ~20–30 mm SL (Klamath suckers): chironomids, chydorids, ostracods (SSB §4) | Lzoo 5, benthL 2.5 (FRY.BENTH_L); the year's young ate zoo 63 %, bed 29 %, mud 7 % (arm M), zooplankton taken FIRST (`fish3.js:2301`) | OK-ish (zoo share high because of the order) | L | §3.F |
| 17 | Young's growth | No Maine data; ~50–80 mm (FWM table, a guess); vb prior 12 cm at age 1 | GPU: 6.6 cm 26 Aug, 7.2 cm 23 Sep, 8.0 cm 4 Nov (year 1); 6.7 / 7.6 (year 2). CPU: 6.7–6.9 cm 10 Oct, 7.4–7.5 mid-Nov | OK / UNKNOWN | — | — |
| 18 | Young's survival, summer | No sucker data; juvenile Z 0.03–0.06 /d generic (FZC §2) | GPU: Z 0.039 /d (3 June → 26 Aug), 0.023 /d (→ 4 Nov). CPU: 2.6–3.5 % of the hatch alive on 10 October | OK | — | — |
| 19 | First winter | No study; suckers live to the Arctic, so the young should tolerate winter well; a ramp is a placeholder (FWM §4); with predators ~30–70 % survive generally | WINTER0 K [0.73, 0.65] → 35–60 mm (`config.js:453`): ~0 % at 75–80 mm. **GPU survival 4 Nov → 22 Mar: 22 % (year 1), 14 % (year 2)**: hypoxia 10–25 %, natural 2.2–2.8 %, eaten ~3 % a fortnight | OFF | H | §3.L (hypoxia), §3.D (M_OTHER) |
| 20 | Recruitment and hand-off | — | Spring at 30 March (FRY.SPRING_YF 0.08) as individual agents. Arm O: 21,366 (year 1, 0.086 % of the seeded hatch) and 8,321 (year 2); **between 22 March and 17 May (0.7 → 9 °C) the suckers lost 21,000 fish in year 1 (19,700 eaten) — as many as had just recruited — and 10,500 against 8,321 recruits in year 2**. Mostly bass, then pickerel, perch, white perch and fallfish (CPU April tallies) | OFF | H | §3.M |
| 21 | Replacement | Lifetime eggs ~100–150k per female; at field-like juvenile survival (age 1 → 4 ≈ 0.3) egg → age 1 of ~0.005 % replaces, at the sim's (~0.13) ~0.012 % [inf] | Egg → age 1: 0.0086 % (year 1), ~0.005 % (year 2) | Recruitment OK in the summer; the deficit is the first winter and the spring hand-off | H | Fix 19–20; then re-check |
| 22 | Adult mortality | Survival 70–75 % for fish > 38 cm (Coble 1967); interior-Maine bald eagles take mostly bullheads, suckers and pickerel (Todd et al. 1982, PFR) | M 0.32 → M_OTHER 0.16 /yr × (L/40)^−0.87 (×0.5–3) (`fish3.js:2398`). Year 2: deaths 52 % of the population; eaten by length 37 % < 10 cm, 57 % 10–20, 6 % 20–30, none ≥ 30 (arm M) | Adults OK; juveniles high (items 19–20) | — | — |
| 23 | As prey | "Young suckers" in Maine pickerel and bass diets (Cooper 1941); target for pickerel: fallfish, dace, killifish and young sucker 15–35 % of fish mass (PDM §7.1). **Mauck & Coble 1971 rank white sucker "intermediate" with yellow perch and golden shiner** (PEA §b), not with fathead and shad | CS3 sucker [0.7, 0.6, 0.5] (`fish3.js:482`): the "most vulnerable" soft-rayed tier, with killifish and dace (PEA's own table lists "small sucker" at 0.70, contradicting its Mauck & Coble line) | OFF (likely) | L | ~[0.5, 0.5, 0.4] (between perch and killifish); check the pickerel's sucker share after |

---

## 2. Brown bullhead (`catfish`)

Code: `S3.catfish` `fish3.js:291–295` (bury, group); `F3.BURY_H` `:141`; `MOVE3` `:356`; `SPAWN3` `:371`; `CS3`, `SPINY3`
`:483–484`; `BIO.catfish` `species.js:313–332`; `SP.catfish` `species.js:564–592`; `WINTER0.K.catfish` `config.js:453`.

| # | Aspect | Real (source) | Sim (file:line, value) | Status | Pri | Fix |
|---|---|---|---|---|---|---|
| 1 | Numbers, biomass, size | Census 100/ha ≥ 7.5 cm; ~70 % < 20 cm; ~95 g mean → ~10 kg/ha (SIZ §3); Moe Pond 260/ha, 13 kg/ha; Cassidy 48/ha at ~290 g (with bass) | perHa 100 (`fish3.js:294`). Arm O: **10.4 → 6.6 → 4.1 → 3.0 kg/ha** (day 952); n 64,361 → 77,197 → 55,419 → 22,124; mean length 16.9 → 11.3 → 10.9 → 14.4 cm; spawnings 12.5k → 6.8k → 4.2k a year | OFF (a steady decline, numbers and biomass) | H | Items 9, 13, 15, 16 |
| 2 | Day/night habitat | Inactive by day in weeds or cover; forages over open mud after dark (activity gated at ~1 lux, Eriksson 1978); dawn and dusk feeding peaks; sheltered muddy coves; home range ~4.5 ha in summer, up to ~20 ha in spring (Sakaris & Jesien 2005; SFH §4) | Day bed [0.5, 3.0] m, h 0.02, act 0.1; night [0.3, 2.5], act 0.6 (`fish3.js:295`); HOME(40, 120) ≈ 4.5 ha | OK in place and timing. MISSING: daytime SHELTER — 45 % of the bullheads eaten were at cover < 0.1 (arm M tally) | M | A day-rest cover rule: by day a bullhead seeks and holds cover (weeds, wood, a burrow), cover ≈ 0.6–0.8 while resting — as S3 `bury` does in winter |
| 3 | Winter | Stops feeding, buries in soft ooze with only mouth and gills out; survives 0.2–0.3 ppm O₂; last fish standing in a winterkill (Cooper & Washburn 1946; SFH §4) | bury 0.9 at ≤ 5 °C within 0.3 m of the bed (`fish3.js:141, 294`); winter band [1, 4] m, act 0; cold rule quiet ×0.7 below 6 °C (`species.js:324`); o2Ice 0.2 mg/L (`:329`) | OK (adults). The young schools do not bury | L | Young bullhead schools: the same bury cover in cold water (`_yoyLive` cover, `fish3.js:2188`) |
| 4 | Temperature | Preferred 25–31 °C, UILT ~36–37.5 (SSB §5) | tPref 28, tempOpt 29, uilt 36 | OK | — | — |
| 5 | Adult diet | Bottom omnivore: chironomids, molluscs, crustaceans to crayfish, plants, detritus, **fish eggs and fish**; 7 % of substrate predation on bluegill nests (Gross & MacMillan 1981, RCM §2) | detritus, plants, larva, snail, cray 0.15 (`species.js:571`); year's diet bed 91–97 %, weeds 1–5 %, cray 2–3 %; eats larvae ≤ 2 cm (LARV_A) | OK. MISSING: nest-egg predation, carrion | L | Eggs on nests as food for bullheads (egg predation instead of a fixed sHatch) — later |
| 6 | Bioenergetics | FB4 brown bullhead (Hartman et al. 2017), official | Adults on it (`species.js:314`); YOY on largemouth (Rice) because FB4's set gives < 2 %/d at 1–4 cm (`:316–321`); cold respiration on the bullhead's own (`:322–324`) | OK (stated assumption, checked against field YOY growth) | — | — |
| 7 | Growth | Ottawa River 127/162/196/222/243 mm at annuli 1–5 (fast); 20 cm only at ~age 3; Maine adults usually ~25 cm (SIZ §3.2) | vb prior 8.5/15/20/24/27 cm (`species.js:325`); growth emerges. CPU season's growth by size: [PENDING-GROWTH] | see probe | M | — |
| 8 | Maturity, fecundity | First breeding at age 3 (Blumer; MI DNR); 2–3 yr (Ontario); 1,050–13,800 eggs (Ontario), Polish mean 3,227 (46/g) (SSB §3) | Lmat 19 cm both sexes, matMinAge 2 yr (`species.js:326`); 0.274·L^2.9 → 25 cm ≈ 3,100 (13/g) (`:328`) | OK | — | — |
| 9 | Spawning time | Michigan: late May – early June, peak in the first 16 days of June, **most eggs laid in a 10–15-day window**, once a year (Blumer 1985); NH from ~18 °C; Ontario 14–25 °C; Wisconsin 21–25 (SSB §3; FFE) | spawnT [21, 28] (`species.js:574`) → starts at 19.5 °C (12 June on the sim's curve), full from 21 °C (22 June), open until SPAWN.SEASON_END (1 Sep). CPU 1/10 (founders): 12 June – early July. **GPU years 2–3: 14 June – 6 Sep, peak late June – mid-July, 30–40 % after mid-July** | OFF | M | spawnT ≈ [18, 24]; a per-species spawning end (bullhead ~yf 0.38, mid-July) after which unspawned gonads are resorbed. Late-August broods are the ones that die in the winter |
| 10 | Nest and care | Saucer nests in sand, gravel or mud under logs, rocks, roots or banks in shallow water; both parents in 56 % of broods, male alone in 39 %; hatch in ~5.6 d; care to ~20 days after laying (to ~25–50 mm); fry balls (Blumer 1985; FFE; PDM §5.1) | Traditional grounds over [0.3, 1.5] m (`fish3.js:371`); male guards nestGuard 0.033 yr ≈ 12 d (`species.js:574`); guarded brood × (1 − BROOD.PROTECT 0.8) (`config.js:307`); sHatch 0.6; CPU spawning bed 0.79–0.81 m | OK. MISSING: cover/cavity needed for a nest | L | `SPAWN3.catfish.sub` = rigid structure or wood |
| 11 | Young's diet | Crustacea ~60 % (80 % ostracods and cladocerans), chironomids ~25 % from June (Raney & Webster 1940, FFE) | benthL 1.2, Lzoo 5 (`species.js:329–330`); the year's young ate zoo 45 %, bed 41 %, mud 12 % (arm M) | OK | — | — |
| 12 | Young's growth | Mean ≤ 76 mm by 10 Oct, some ~100 mm, the largest > 2× the smallest (Cayuga, Raney & Webster 1940); 50–76 mm typical (FFE) | GPU 6.7 cm (23 Sep) – 6.8 (4 Nov), year 1; 5.7–6.3 year 2; 6.5 year 3. CPU 5.6–5.8 cm (10 Oct) | OK (lower half of the field's range) | — | — |
| 13 | Young's habitat | Quiet coves; compact schools following the parents for weeks (Raney & Webster; Blumer; SFH §4) | After the guard, the richest bed anywhere (`fish3.js:2263`); CPU 1/10: 0.8–1.0 m while guarded, then **1.9–3.0 m** July–October | OFF | M | `S3.catfish.yBed ≈ 1.5 m` (≥ YBED_T), a small `yCover` |
| 14 | Young's starvation | Not the main summer killer of young fish (FZC §2) | **CPU: 26–29 % of the hatch starved by October (more than were eaten, 22–23 %)**; GPU: 15–28 % a fortnight in Aug–Sep (year 1), up to 32.5 % (year 2) | OFF | M | §3.H — their bed food is grazed down in late summer; item 13 (the coves' weed fauna) helps |
| 15 | First winter | **Bullhead should have the lowest first-winter loss of any species** (FWM §7); YOY 55–70 mm by October; bury and fast (Crawshaw Q10 2–3) | WINTER0 K [0.73, 0.60] → 35–55 mm (`config.js:453`): ~0 at 6.5–6.9 cm. **GPU survival 18 % (year 1), 16 % (year 2)**: hypoxia 10–21 % a fortnight Jan–Mar, natural 3.3–4 %, eaten 2–4 % | OFF | H | §3.L, §3.D; bury for the young (item 3) |
| 16 | Predation on bullheads | Smallmouth: no record of eating brown bullhead; Maine bass ~0 bullhead (Cooper 1941); pickerel: bullhead 3–10 % of fish mass, ≤ 10–20 % of older-fish kills by number, selected only by large pickerel (> 30 cm); aquarium pike 0/10; Mauck & Coble "least vulnerable"; **"treat spine-locked width as an effective body depth ~1.5× depthR"** (PDM §4.2, §7.1–7.2) | CS3 catfish [0.1, 0.2, 0.1], spiny ppr0 0.6 (`fish3.js:483–484`); depthR 0.20 with no spine width (`species.js:329`). **Arm M: bass>catfish 16,389 (18 % of bass kills — their commonest prey by count), pike>catfish 15,664 (8 %)**; bullheads eaten 39,793 a year (< 10 cm 43 %, 10–20 cm 55 %). CPU 1/10: bass 82 + pickerel 76 of ~635 founders by 30 Aug; in April at 4–7 °C bass took bullheads too | OFF | H | (a) the gape test on `bdep × SPINE_W` (bullhead 1.5–2; `canPrey`, `fish3.js:1405`, and the young's bins); (b) bass capture on bullheads ~0.05; (c) the day shelter (item 2); (d) the cold-water strike gate (§3.M) |
| 17 | Adult mortality | A ≈ 45–55 %/yr even without piscivores (Moe Pond 52 %, Murphy Flowage 50 %), "mostly not from fish predators once > 15 cm" (PDM §5.1, §7.1) | Year 2: deaths 55 % of the population (eaten 37k, other 26k, starved 3k); M_OTHER 0.27 /yr × (L/27)^−0.87, ×3 for the small ones (`fish3.js:2398`) | Total OK; composition OFF (mostly eaten) | — | Item 16 |
| 18 | Recruitment | Parental care should raise early survival (Blumer); unquantified | Hatched → age 1: 0.33 % (arm M), 74k and 45k recruits (arm O years 1–2) as groups of 25 until 10 cm (`fish3.js:294` group). Six weeks after the hand-off: −16 % (bury protects them; M_OTHER ×3 is 0.81 /yr) | OK at recruitment; the losses are before (winter) and after (summer predation) | — | — |

---

## 3. The young-of-year system (all species)

Code: `config.js:177–267` (FRY), `:448–462` (WINTER0); `fish3.js` `_spawn` `:1967`, `_mkYoy` `:1999`, `_yTable`/`_yReq`/
`_ySettle` `:2023–2089`, `_juvDens` `:2158`, `_yoyLive` `:2165`, `_yoyTarget` `:2249`, `_feedYoy` `:2288`, `_recruit` `:2348`,
`_mergeYoy` `:2367`, `_hazards` `:2387`; GPU mirror `src/w3/gpu/wgsl.js:1545–1840` (`y_*`). The GPU's kernels follow the CPU
line for line in the parts read (mortality `y_mort` `:1781`, targeting `y_target` `:1808`).

| # | Part | Real (source) | Sim (file:line, value) | Status | Pri | Fix |
|---|---|---|---|---|---|---|
| A | Hatch | Eggs incubate: sucker ~1–2 weeks, bullhead 5.6 d (to 13), perch 2–3 weeks (~100 °C-days above 5 °C), killifish, sunfish days–a week; egg loss to egg predators (FFE; SSB §3) | `_spawn` makes the school at once at Lhatch with eggs × sHatch × structure (`fish3.js:1985–1989`) | MISSING (incubation); egg predation folded into sHatch | L | An egg stage of a few degree-days (a school that does not move, feed or get eaten except by egg predators) — moves first feeding 1–3 weeks later, which matters for autumn length against WINTER0 |
| B | Larval mortality | Oneida perch 8–18 mm Z 0.042 /d; 0.04–0.15 /d supported, density-independent (Irwin et al. 2009; FZC §2; RCM §2) | M_LARVA3 0.04 / L(cm) fading by ~2–3 cm (`config.js:262`, `fish3.js:2197`), Q10 below 20 °C, + density predation (Y1) | OK | — | — |
| C | Juvenile background and compensation | Oneida 18 mm → autumn Z ≈ 0.035 /d; survival doubles as density halves (Beverton–Holt); larval stage not density-dependent (RCM §1–3) | M_JUV3 0.015 /d × (D + 0.5)/(3 + 0.5), D = the species' juveniles per lake m² (`config.js:218, 262`; `fish3.js:2160, 2197`), Q10 3 below 20 °C | OK in form. Note: D is lake-wide, never local (a crowded cove of bullhead broods is not "crowded") | L | — |
| D | The young's "unsimulated" mortality | Under ice no herons, kingfishers or mergansers feed; disease low in the cold; Lorenzen's M ∝ L^−0.87 is mostly predation (now explicit); the field's whole first-winter loss with predators is 30–70 % (FWM §6) | `sp.M · BIOE.M_OTHER · min(30, (L/Lref)^−0.87)` a year, **not temperature-scaled** (`fish3.js:2198`; GPU `wgsl.js:1789`). At first-winter sizes: bullhead 6.8 cm 0.90 /yr, sucker 8 cm 0.65, pumpkinseed 3.6 cm 0.83, perch 8.7 cm 0.51, bass 9 cm 0.56, white perch 7.4 cm 0.49, killifish 2.7 cm 1.55 (redbreast 3.4 cm 1.09, fallfish 7.3 cm 0.88) → **20–39 % of the young dead over 1 Nov – mid-April from this term alone (killifish 50 %)** | OFF | H | Scale it as M_JUV is (× min(1, Q10^((T−20)/10))), and cap the size multiplier for the young at the agents' 3 (or drop it: predation is explicit) |
| E | Diet ladder | Nauplii/rotifers → small cladocerans and copepods by ~8–12 mm → Daphnia; insects and benthos from ~2 cm (bass 1.5–2.5 cm), fish at 4–6 cm (pickerel), ~10 cm (smallmouth) (FZC §1; species notes) | PLANKTON.FRY_* ladder (`config.js:1001–1018`); weed fauna from 1.2 / 2.5 cm (`littoral3.js:67`); bed from benthL; fish from yLpisc | OK | — | — |
| F | Feeding order | Young benthic feeders take what they meet; bullhead YOY 60/25 crustacea/chironomids | `_feedYoy` takes zooplankton first, then weeds, bed, mud (`fish3.js:2301–2326`) | OK-ish | L | Share by profitability as the adults do (F3.SHARE) |
| G | Habitat / targeting | Bottom-fish and littoral young in the shallows (sucker < 51 mm in 15–20 cm water; bullhead coves; killifish ≤ 1.2 m; perch inshore by 30 mm; bass within ~88 m of the nest; SFH; SFN §Q6) | The richest food about the school (own column + ring), O₂ ≥ o2Crit for bed choices, `yBed` only for killifish (`fish3.js:2259–2270`), pelagic sunfish fry, no `yBed` elsewhere | OFF for sucker and bullhead (rows 1.15, 2.13) | M | `yBed` (and `yCover` where the field says weeds) per species |
| H | Starvation (scramble) | Predation, not starvation, kills young fish in summer; starvation is a first-winter, size-selective process (FZC §2) | `_feedYoy` scramble starvation (`fish3.js:2335–2342`). GPU arm M year: bass young 28.6 % starved, bullhead 11.9 %; pickerel 17–21 % a fortnight in Jul–Aug; CPU bullhead 26–29 % of the hatch | OFF (bottom-fish and piscivore young) | M | Find what empties their food: the bed's worms and scuds in August (shared with the adult white perch, whose diet runs 77 % bed in arm M) and the young piscivores' prey bins. Keep starvation, fix the food |
| I | Growth by autumn | Field age-0 lengths: perch 55–75 mm (productive 66–81); smallmouth 56–76 (Maine); pumpkinseed 25–45; bullhead 50–76; killifish 26–32 mm late Sep (to 49.5 at Opinicon); pickerel 10–13 cm; white perch ~45–70 (NJ annulus I 71); sucker unknown (~50–80) | Arm O, 23 Sep / 4 Nov (year 1; year 2 in brackets): perch 7.8/8.7 (7.0/7.9); bass 7.8/9.2 (5.2/7.8); pumpkinseed 3.3/3.6 (1.7/1.9); bullhead 6.7/6.8 (5.7/6.3); white perch 6.2/7.4 (5.7/6.7); sucker 7.2/8.0 (6.7/7.6); redbreast 3.1/3.4 (1.3/1.7); fallfish 6.5/7.3; killifish 2.4/2.7; pickerel 8.1 (Sep) then none | OK for most; killifish slightly small; pickerel OFF; year-2 pumpkinseed and redbreast late runts (few adults left) | — | — |
| J | Predation on the young | Clearance by density, Holling II on the gut (Persson et al. 2004); first-winter predation ~10–25 % (FWM §7) | Y1 (`fish3.js:2023–2089`), LARV_A 0.1, YCOLD (`:1661`). Summer young-school predation 0.02–0.03 /d (sucker); under ice 2–5 % a fortnight (~20–40 % a winter) | OK in summer; under-ice slightly high | L | Recheck after D and L |
| K | First-winter ramp | Shuter et al. 1980 lines scaled per species (FWM §5–7) | WINTER0 (`config.js:448–462`), applied in place of starvation (`fish3.js:2191–2192`) | OK in design; it kills little because the hypoxia does the killing first | — | — |
| L | The young under the ice: O₂ | Bullhead and sucker young should be the hardiest; adults of the same lake do not die of hypoxia | GPU arm O: **every species' young lose 8–25 % a fortnight to hypoxia from mid-January to recruitment** (perch 10–18 %, white perch 11–17 %, bass 9–18 %, pumpkinseed 8–15 %, redbreast 9–18 %, fallfish 8–16 %, sucker 10–25 %, bullhead 10–21 %), while the header's Upper bottom O₂ reads 7.7–10 mg/L (year 1). **CPU (`winterO2y`, seed 611, 1/10):**<br>• the young sit 0.1–0.6 m over the bed, in water 1–3 mg/L below their column's mean;<br>• lake cells < 1 mg/L rise from 0.3 % (late January) to 3 % (March), and the young's hypoxia deaths start with them: by 4 March sucker ~17 %, bullhead ~17 %, perch ~23 % of the young;<br>• the mean O₂ at the young stays 3–9 mg/L, so a minority of schools caught in near-anoxic bed cells dies;<br>• schools hold ≤ 5k fish at 1/10, so this is not self-depletion there.<br>**Why (code):**<br>(1) all winter a benthic school keeps targeting the RICHEST bed (`fish3.js:2263–2269`), though it barely feeds below ~4 °C; the food-rich organic beds are the high-demand ones that go anoxic first;<br>(2) it tests O₂ only in its own cell, against o2Crit, and AFTER the tick's hazard is charged (`:2196–2207`). An hour in an anoxic cell costs ~6 % of the school (h = ln2/2 d × e^1.5 ≈ 1.55 /d), more over a far block;<br>(3) the bed choice tests the column's representative bed cell at choosing time, with no margin;<br>(4) the zooplankton fallback, common in winter when no bed is above SENSE_MIN, ignores O₂ (`:2276`).<br>The adults hold h above the bed and escape early: at 3 × lethal or half o2Crit (F3.ESC_O2), and across the lake (O2_SEEK). | OFF | H | (a) Below ~6 °C, when the young are not feeding, pick the winter station by O₂ first: the best of the column and its ring with O₂ ≥ 2 × o2Crit, h ~0.3–0.5 m off the bed (the adults' winter hab), the bullhead young buried.<br>(b) Each tick, test O₂ and move BEFORE charging the hazard.<br>(c) Give the zooplankton fallback the same O₂ test.<br>(d) At true scale, spread a big merged school's O₂ draw (`:2193`) over its footprint.<br>Target: the young's winter hypoxia ≈ the adults' (~0). |
| M | Recruitment timing and the hand-off | Fisheries count recruits at age 1; the hazard a fish meets should be continuous across the switch (FINDINGS 2026-10-20 "Two rules for one fish") | At FRY.SPRING_YF 0.08 (30 March, ~3 weeks before ice-out) any school older than 0.4 yr recruits (`config.js:265–266`, `fish3.js:2211`). As a school it was hunted at min(cold performance, FB4 consumption) (YCOLD); as an agent at the cold performance alone (`fish3.js:1666, 1768`): bass 0.20–0.36 against 0.015–0.09 at 1–7 °C (×4–13); perch and fallfish ×2–2.5; white perch ×1.1; pickerel ×1 (its FB4 curve is not normalised, so YCOLD leaves it at perf). **Arm O, 22 Mar → 17 May (0.7 → 9 °C), the fish lost as a share of the spring's recruits (years 1 / 2):** sucker 98 / 126 % (19,700 eaten in year 1), bass 79 / 62 %, fallfish 75 / 112 %, redbreast 74 %, sunfish 31 / 78 %, bullhead 23 / 25 %, perch 19 / 47 %, white perch 11 / 19 %. The young schools lost ~3 % a fortnight in the eight weeks before | OFF | H | (a) Apply YCOLD's gate to `_strike2` too (`perf → min(perf, consumptionT)` for predators whose FB4 curve is normalised), so a bass at 4 °C hunts as little as it eats; (b) recruit at the spring crossing of WINTER0.T (`winterWindow[1]`, ≈ 12 May) instead of yf 0.08, so the ramp ends and the agents' rule begins in the same water |
| N | The census cap | A cap that binds is a missing mechanism (FINDINGS 2026-10-19) | `_recruit` keeps at most F3.CAP 1.5 × census (`fish3.js:2350`). Arm O year-1 spring: **white perch 64 % of the surviving cohort discarded, pumpkinseed 55 %**; sucker 0.2 %, bass 0.4 %, white perch year 2 again | OFF (for white perch; sunfish then collapsed anyway — §4) | M | Leave the cap as a safety but report it as a failure in every run; the white perch review's regulation (first winter, stunting) should make it slack |
| O | Merging | Real young schools of hundreds; the sim's school is a super-individual | `_mergeYoy` merges same-species, similar-size schools within 1.5 m with **no cap on n** (`fish3.js:2367–2383`); a school draws its O₂ from its one cell (`fish3.js:2193`) | See L | — | — |
| P | Young piscivores | YOY pickerel take fish from ~4–6 cm, 10–13 cm by fall, 60–80 % survive winter (PDM; FWM §4) | yLpisc 5 (`species.js:386`); arm O: 237k hatched → 34k on 1 Jul (3.5 cm) → 1k on 26 Aug (7.4 cm) → 0 by mid-Sep; starved 17–21 %, eaten 18–37 %, natural 6–31 % a fortnight; recruits 2 and 4 | OFF | H (for pickerel) | Diagnose the young pickerel's food: their bins of prey-sized young (r 0.1–0.4) and cover; field rations 10–25 %/d at 20–24 °C (HOT_BROOK_3D §4 Y1 targets) |
| Q | Sustainability | Recruits must replace deaths over 3–5 years (PDM §7.3) | Arm O, numbers at the end of years 0/1/2: sucker 45k/25k/16k; bullhead 64k/77k/55k (→ 22k by day 952); bass 25.7k/10.1k/6.1k; pickerel 16.1k/4.6k/2.3k; pumpkinseed 32k/34k/2.1k; redbreast 32k/9.9k/0.8k; fallfish 55k/6.2k/1.4k; killifish 150k/2.7k/0.7k; perch 322k/337k/201k; white perch 290k/411k/406k | Only white perch (and perch, roughly) hold | H | Items D, L, M first; then H, G and the species reviews' adult fixes |

### 3.1 Hatch → age 1 by species (GPU arm M and O)

| Species | Hatched → age-1 recruits | Field | Verdict |
|---|---|---|---|
| Yellow perch | ~0.3–0.6 % (21.6M seeded → 186k; arm M 0.2 % of the year's hatch) | Oneida 18 mm → age 2 0.4–1.6 %; egg → age 2 ~0.02 % (RCM §3) | OK |
| White perch | 0.2 % (+0.4 % capped) | none for the species; perch-like | OK (cap binds — N) |
| Smallmouth | 0.3 % | Clady 1975: egg → fall fingerling 1–4 %; first winter 40–60 % die | OK–low |
| Pumpkinseed | 0.1 % (+55 % of survivors capped) | bluegill egg → yearling ~0.05–1 % | OK |
| Redbreast | 0.1 % | — | OK |
| Brown bullhead | 0.33 % (egg → age 1 ~0.2 %) | unquantified; parental care | OK |
| White sucker | 0.04–0.09 % (egg → age 1 ~0.005–0.009 %) | none; replacement needs ~0.005–0.012 % (§1 row 21) | marginal |
| Fallfish | 0.05 % | — | UNKNOWN |
| Chain pickerel | ~0.001 % (2–5 recruits) | first-winter survival 0.6–0.8 at 10–13 cm | OFF |
| Banded killifish | ~0.001 % (1–13 recruits) | ≥ ~0.2 % egg → age 1 to persist (KPP) | OFF |

The summer (hatch → autumn) is close to the field for most species. The losses that do not match come after the summer:
the first winter (L, D) and the six weeks after recruitment (M). Adult survival, the other reviews' subject, comes after that.

---

## 4. What the latest runs show

**Arm O, seed 613 (true size, GPU), to day 952** (`yrsum`): total 93 → 81 → 85 kg/ha (years 1–3, the third partial).

| | yr 0 | yr 1 | yr 2 | yr 3 (partial) |
|---|---|---|---|---|
| sucker kg/ha | 17.1 | 14.1 | 11.5 | 12.0 |
| bullhead kg/ha | 10.4 | 6.6 | 4.1 | 3.0 |

Pumpkinseed, redbreast, killifish and dace are gone; fallfish 0.8 kg/ha; pickerel 2.1 kg/ha; white perch 42.4 kg/ha and rising.

**Sucker.**
- Recruits 21,366 (year 1) and 8,321 (year 2) against deaths of ~41,000 and ~17,400.
- The population ages: its mean length rises from 24.5 to 37 cm.
- Spawnings per year: 6,605 in year 1, 6,205 in year 2. The run peaks in mid-May.
- Adult diet ~100 % bed, p 0.3–0.55, K 0.91–0.99: they feed well.
- The young are at 7.2 cm by late September and 8 cm in November, then die under the ice (hypoxia).

**Bullhead.**
- Recruits 71,131 (year 1) and 44,961 (year 2).
- Spawnings fall 12,502 → 6,799 → 4,243, and the spawning drifts later each year: year 3's ran 14 June → early September.
- Bass and pickerel take ~16,000 each a year (arm M).
- The young starve in late summer and die of hypoxia in late winter.
- The population is in steady decline in both biomass and numbers.

**The young, every species.**
- Summer survival and growth are field-like.
- Winter hypoxia runs 8–25 % a fortnight from January.
- The spring hand-off loses 5–57 % of each species' fish in six weeks of cold water.

**CPU 1/10 (seeds 611, 612).**
- Sucker young: 3.5 % / 2.6 % of the hatch alive on 10 October, at 6.7–6.9 cm, over 2.1–2.5 m of water.
- Bullhead young: 2.3 % / 2.1 % alive, 5.6–5.8 cm, over 2.2–2.4 m.
- Bullhead fates by October: natural 50 %, starved 26–29 %, eaten 22–23 % of the hatch.
- Founders, mid-May → mid-November: suckers −34 % (eaten 25 %), bullheads −42 % (eaten 27 %).
- Bullhead spawning on the CPU (founders) is 12 June – early July. The GPU's late tail comes from fish ripening late in poor
  condition in later years.
- [PENDING-CPU-WINTER] [PENDING-GROWTH-SUMMARY]

---

## 5. Concrete fixes, in order

1. **The young's winter station** (`_yoyTarget` `fish3.js:2249`, `_yoyLive` `:2196–2207`; GPU `y_target`, `y_mort`):
   - in cold water, choose by O₂ (≥ 2 × o2Crit) before food, off the bed;
   - test and move before charging the hypoxia hazard;
   - put the O₂ test into the zooplankton fallback;
   - bury the young bullheads;
   - at true scale, spread a merged school's O₂ draw over its footprint.

   Judge by the young's winter hypoxia deaths ≈ 0 and first-winter survival 30–70 % (bullhead and sucker highest).
2. **The young's M_OTHER** (`fish3.js:2198`, `wgsl.js:1789`, and `_spinYoy` `fish3.js:1118`): × `min(1, FRY.M_JUV_Q10^((T−20)/10))`,
   size multiplier capped at 3 (the agents' cap, `fish3.js:2398`). Recalibrate M_JUV3 on the young's TOTAL summer Z (it
   should barely move: in summer M_OTHER is ~25 % of the natural term).
3. **The spring hand-off:**
   - (a) `_strike2`'s `perf` → `F3.YCOLD ? min(perf, consumptionT(...)) : perf` as in `_feed`'s `yEff` (`fish3.js:1661`), CPU and
     GPU. This is a predator-review lever too: smallmouth near-still below ~8–10 °C (Oliver 1977; MDIFW).
   - (b) FRY.SPRING_YF → the spring crossing `winterWindow[1]` (or a per-school temperature ≥ WINTER0.T).
   - Judge by each species' loss in the six weeks after recruitment against its summer juvenile Z.
4. **Bullhead spines and shelter:**
   - `canPrey`/the young's bins test `bdep × (sp.spineW || 1)` against the gape; bullhead spineW 1.6.
   - CS3 catfish bass 0.2 → 0.05.
   - A day-rest cover for bullheads.
   - Targets: bass ~0 bullhead, pickerel 3–10 % of fish mass (PDM §7.1).
5. **Bullhead spawning window:** spawnT [18, 24] plus a spawning end (a `spawnEnd` yf per species; bullhead ~0.38), with
   resorption of unspawned gonads.
6. **Young bottom fish's water:** `yBed` sucker ~0.8 m (to ~5 cm), bullhead ~1.5 m (+ a little `yCover`); bury for the young
   bullheads in cold water.
7. **Summer starvation of young bottom fish and piscivores:** trace what empties their food in August. Suspects: the bed
   shared with the adult white perch (77 % bed), and the young pickerel's prey bins. Fix the supply, not the starvation rule.
8. **L items:**
   - an egg stage (incubation);
   - larval drift down the brook;
   - sucker CS3 ~[0.5, 0.5, 0.4];
   - a sucker `runK` if true-scale brook counts are in the thousands;
   - bullhead nest cover;
   - the census cap reported as a failure.

**Checks:** ≥ 3 seeds × ≥ 3 years. For the young of every species, report:
- hatch → autumn → spring;
- first-winter loss by cause (target 30–70 %, bullhead and sucker the lowest);
- the six-week post-recruitment loss.

For suckers and bullheads, report n, % < 30 / < 20 cm and kg/ha against the census. For bass, report the bullhead share
of kills by number.
