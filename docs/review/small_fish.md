# Review: the small fish — pumpkinseed (`sunfish`), redbreast sunfish (`redbreast`), banded killifish (`killifish`), blacknose dace (`dace`), fallfish (`fallfish`)

Written 2026-10-20 for the full review (SESSION_STATE "A FULL REVIEW IS RUNNING"). The question: do these five behave as they
really would in Upper and Lower Hot Brook Lake and the brook, and why do they die out in the multi-year runs?

## 0. Basis, sources and how to read this

- **Code:** branch `zoo-field` at f640116, read **with `stageR5(true)` applied** (fish3.js:416–472, the package that will become the
  default, through item 6k), plus the **arm-B diet overrides** the runs carry in the URL (not in the code — see fix 17).
- **Runs** (true-scale GPU year runner, scratchpad): **r8O_613** (arm O = the package through 6j, i.e. without 6k's YCOLD; 5 years,
  in progress at day 812); **r6M_613** and **r6L_613** (1 year each, with the end-of-year who-ate-whom tallies O will only print at
  day 1825); **r1A/r1B_611/612/613** (5 years × 3 seeds, older code, before stage R). One seed for the package, so the numbers
  show direction; CLAUDE.md asks for ≥ 3 seeds before judging a change.
- **My probes** (scratchpad, no repo edits): `sfser.mjs` (per-fortnight series for one species from a run file, with the
  fortnight's deaths), `maint.mjs` / `maint2.mjs` (the maintenance ration of each species' FB4 set), `brookie_n.mjs` (how many
  brook-summering sunfish the founding implies at true scale). Paths at the end.
- **Research notes cited** (all under `docs/research_notes/`):
  - **KPP** `Real lake ecology for calibration/killifish_persistence_and_predators.md` (+ addendum)
  - **HNS** `Whole lake 3D fish simulation/habitat3d_new_species.md`
  - **FSB** `Whole lake 3D fish simulation/fallfish_spawning_brook.md`
  - **MSS** `Fish in streams connecting lakes/minnows_and_sunfish_in_connecting_streams.md`
  - **PPSP** `Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md` §4–§5 (pumpkinseed)
  - **FNS** `Hot Brook populations and water/fish_numbers_and_new_species.md` (Q5 life histories, Q6 FB4 sets)
  - **EMRA** `Hot Brook populations and water/eastern_maine_relative_abundance.md`
  - **PDPM** `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`
  - **PEA** `Real lake ecology for calibration/piscivore_encounter_attack.md`
  - **FWM** `Real lake ecology for calibration/first_winter_mortality.md`
  - **FFEL** `Real lake ecology for calibration/forage_fish_early_life.md`
  - **CEN** `docs/FISH_CENSUS.md`; **OBS** the human's field notes (memory `hot-brook-field-observations.md`)
- **Verdicts:** OK · OFF (present but wrong) · MISSING · UNKNOWN (no evidence either way) · PARTIAL.
- **Priority:** **P1** blocks persistence or is grossly wrong; **P2** clearly wrong, second-order for persistence; **P3** detail.

---

## 1. The top issues in one screen

1. **The predators feed on the shallow-water small fish because their real main prey is out of reach.** Over year 1 (r6M) the
   predators killed **86 %** of the killifish, **~80 %** of the fallfish and **77 %** of the pumpkinseed founders (r8O), but only
   **~5–8 %** of the white perch — the fish that are 55–61 % of Maine pickerel and smallmouth diets (Cooper 1941, via KPP). The small
   species are a predator pit, not a prey base.
2. **None of the five has the refuge behaviour that lets it live with pickerel and bass.** Pumpkinseed and redbreast hold a depth
   band with **no pull toward weeds or hard structure** (fish3.js `_drive` 1437 has no cover term). Young fallfish under 12 cm
   school in groups of 20 over **exactly the pickerel's band** (0.5–2.5 m). Ripe killifish leave their < 0.35-m strip for a 0.2–1.0-m
   spawning band. The brook's dace share the riffles with the fallfish spawning run.
3. **Shielding one species only moves the kills to the next.** Taking fallfish off killifish (Lpisc 10 → 18 → 30) removed 45–51 k
   fallfish→killifish kills, but total killifish kills fell only from 130 k to 118 k (L → M → O). Predator demand is fixed, so the
   exposed prey pay it.
4. **Spring recruitment feeds the yearlings straight into the adults' strike rule.** Under RECRUIT_SPRING (fish3.js:441) the
   4.8-cm age-1 pumpkinseed become followed fish under the ice in early April. **81 % are gone by mid-August.** Fallfish lose
   ~6,300 to predators from April to mid-June, as many as the 6,433 they recruited.
5. **Killifish recruitment is 0.001 % egg→age 1 (13 recruits from 1.1 M hatched); replacement needs ≥ 0.2 % (KPP).** The young
   are eaten at 20–37 % a fortnight from July to November. Every plankton or insect eater ≥ 3× their length takes them below
   2 cm (FRY.LARVA_L), and their 1.2-m shelf (yBed) runs past the shallow refuge.
6. **The brook is over-full.** About **3,200 brook-summering sunfish** (1,290 pumpkinseed + 1,940 redbreast) go into ~300 m² of
   ≥ 0.6-m water — **10.8 fish/m²** — and at true scale the lakes' young may feed there too. The brook's dace run at ration
   **p 0.12** with condition falling 0.96 → 0.72 in six weeks. They are also eaten inside their riffle refuge (86 % of dace kills at
   cover ≥ 0.5), ~93 % by fallfish (r6M). They are gone by day 70 in every arm.
7. **The bioenergetic stand-ins make these fish expensive to keep alive.** On the bed's 3.3 kJ/g food, the maintenance ration is
   **p 0.39–0.46** for pumpkinseed and redbreast (bluegill set) and **0.42–0.45** for fallfish (the dace set's 40 % egestion), against
   **0.25–0.30** for the perches. The late-summer food crash (p 0.17–0.29) then drives condition to 0.74–0.86 and starvation.
   Hungry fish stray out of their bands (the `needy` term) into predator water.
8. **Winter:** adult strikes run at the predators' cold *performance* (0.4–0.55), not their cold *appetite*. Item 6k applies the
   appetite only to the young. Adult killifish lose **83 %** from October to March (r8O). The young of all three sunfish-like
   species die of **hypoxia at 8–18 % a fortnight** in Feb–March, although the reported bottom O₂ is 7.7–10 mg/L: they sit in local
   anoxic shelf cells.

---

## 2. What the latest runs show

### 2.1 Numbers through time (r8O_613; founders on 20 May, yf 0.22)

| Species (target) | Founded | +4 wk (17 Jun) | mid-Sep (d112) | 1 Apr (d322, before recruits) | End of yr 1 (d364) | Yr 2 (d728) |
|---|---|---|---|---|---|---|
| Pumpkinseed (CEN 50/ha ≈ 32 k, ~1.7 kg/ha) | 32,180 @ 11.2 cm, 1.7 kg/ha | 19,500 | 7,782 @ 14.3 | **2,794 (8.7 %)** @ 14.9 | 34,438 @ 4.8 (recruits), 0.2 kg/ha | **2,117 @ 6.1, 0.0 kg/ha** |
| Redbreast (CEN 50/ha) | 32,180 @ 12.1, 2.2 kg/ha | 21,156 | 10,137 @ 15.3 | 4,496 (14 %) | 9,874 @ 8.2, 0.4 | **781, 0.1** |
| Killifish (CEN ~150 k; 20–300 k) | 149,960 @ 5.8, 0.6 kg/ha | 98,808 | 34,382 | **3,871 (2.6 %)** | 2,653 | **686** |
| Dace (CEN ~1,000–1,400 in the brook) | 1,380 @ 5.0 | 466 | **0 (d84)** | 0 | 0 | 0 |
| Fallfish (CEN 85/ha ≈ 55 k, ~7 kg/ha; "lots") | 54,706 @ 16.6, 7.1 kg/ha | 23,715 | 10,216 @ 26.9 | 4,562 (8.3 %) @ 29.3 | 6,163 @ 21.9, 2.0 | **1,405 @ 29.4, 0.9** |

The same collapse appears on three seeds of the older code (r1A/r1B): pumpkinseed 0.3–0.6 → 0.0 kg/ha by year 2–3; redbreast
0.7–0.9 → 0.0 by year 3–4; fallfish 3.5–4.0 → 1.7–1.9 → 1.1–1.3 → 0.7–0.9 → 0.4–0.5 (about ×0.6 a year); killifish and dace 0
within year 1. White perch rose to 44–51 kg/ha over the same years.

### 2.2 Deaths in year 1 (r8O demography; cumulative from founding)

| Species | Starved | Eaten | Other | Spawnings (yr 1 → yr 2) | Recruits (yr 1 → yr 2) |
|---|---|---|---|---|---|
| Pumpkinseed | 3,937 | **33,856** | 5,557 | 12,894 → **278** | 45,610 → 1,985 |
| Redbreast | 9,331 | **29,248** | 4,335 | 9,829 → **499** | 20,626 → 322 |
| Killifish | 5,019 | **117,996** | 24,220 | 4,340 → 103 | **13** → 0 |
| Dace | 18 | **1,280** | 82 | 89 → 0 | 0 |
| Fallfish | 1,311 | **50,047** | 3,613 | 10,171 → 898 | 6,433 → 594 |

- **Founders only** (summed fortnightly to day 308): pumpkinseed 24,686 eaten = **77 %** of the founders; redbreast 21,858 =
  **68 %**; fallfish 46,018 = **84 %**, of which **22,616 (41 %) in the first 14 days**.
- **Against the targets:**
  - pumpkinseed M 0.54 (A ≈ 42 %/yr) and redbreast M 0.6;
  - fallfish M 0.6;
  - killifish adult Z 1.0–1.5 (A 63–78 %), with predation 40–60 % of it → 50–80 k of 150 k eaten in year 1, spread through the
    season (KPP). The sim took **118 k**, a third of it by mid-June;
  - dace ~4–6 %/week in open water, ≤ 0.5–1.5 %/week to fallfish (FSB Q4). The sim took **20–55 %/week** in late May–June.

### 2.3 The young (r6M year-1 fates; r8O per fortnight)

| Species | Hatched | Fates (r6M, % of hatched) | Egg→age-1 recruit | Size by mid-Oct (field) | First winter (r8O) |
|---|---|---|---|---|---|
| Pumpkinseed | 46.1 M | natural 74.7, eaten 23.8 (perch 4.9 M, white perch 3.7 M, young bass 0.73 M) | 0.10 % recruited + 0.16 % **discarded at F3.CAP** | 3.4 cm (Ontario age-1 3.3–5.2) ✓ | 1.07 M → 133 k Oct→Mar (**−88 %**: eaten 5–17 %, hypoxia 8–15 %/fortnight Feb–Mar) |
| Redbreast | 13.6 M | natural 77.8, eaten 21.1 | 0.11 % (M) – 0.15 % (O) | 3.2–3.4 cm yr 1 (Yoho 0+ 36 mm) ✓; **1.5–1.9 cm yr 2** ✗ | hypoxia 9–18 %/fortnight Feb–Mar |
| Killifish | 1.1 M | natural 44.5, eaten **54.7** (young bass 212 k in M, removed by 6j) | **0.001 %** (13) | 2.5 cm (25.6–32 mm by late Sep; 49.5 mm Opinicon) ✓ low end | eaten 13–15 %/fortnight under ice (O is pre-6k) |
| Dace | ~8 k | natural 37.8, eaten 61.5 | 0 | 2.3–3.6 cm (24–27 mm) ✓ | — |
| Fallfish | 7.3 M | natural 46.9, eaten **52.4** | 0.05 % (M) – 0.09 % (O) | 6.1–6.8 cm (guess 3–6) high | 7.0 → 8.8 cm **under the ice** (growth or selection: verify) |

### 2.4 Who ate them (r6M, year 1)

| | Pickerel | Smallmouth | Fallfish | White perch | Yellow perch |
|---|---|---|---|---|---|
| Killifish (128,435) | 46,585 (36 %) | 11,941 (9 %) | 45,198 (35 %; gone in N/O) | 18,020 (14 %) | 6,691 (5 %) |
| Fallfish (46,722) | 25,536 | 10,330 | — | — | — |
| Pumpkinseed (37,392) | 10,675 | 14,706 | — | — | — |
| Redbreast (27,553) | (< 10 k) | 11,762 | — | — | — |
| Dace (1,353) | 16 | 27 | **1,256 (93 %)** | 54 | — |

- **KPP targets for killifish deaths:** pickerel 35–50 %, smallmouth 10–20 %, yellow perch 10–20 %, white perch 5–15 %,
  fallfish ≤ 5–10 %, plus birds +0.1–0.3 Z. After O the shares fit roughly, but **the total is ~1.5–2.4× too high and front-loaded**.
- **The predators' prey mix, by number (r6M):**
  - Pickerel: killifish 24 %, yellow perch 21 %, fallfish 13 %, white perch 9.7 %, bullhead 8.2 %, pumpkinseed 5.6 %.
  - Smallmouth: bullhead 18 %, pumpkinseed 16 %, killifish 13 %, redbreast 13 %, fallfish 11 %, yellow perch 8.8 %, white
    perch ≤ 5.5 %.
  - Field (Cooper 1941, by volume): pickerel white perch 55 %, golden shiner 14 %, yellow perch 7.5 %; smallmouth white perch 61 %,
    yellow perch 14 %, crayfish 14 %. There is **no record of smallmouth eating killifish or bullhead** (PDPM §2.2).
- **Where they die (r6M):**
  - Killifish: by day 55 % of them hold over < 0.3 m and 35 % over 0.3–0.6 m, but 60 % die over 0.3–0.6 m and 21 % over 0.6–1 m;
    89 % die at weed cover < 0.1.
  - Dace: 79 % die over 0.3–0.6 m and **86 % at cover ≥ 0.5**, inside the riffle refuge.
  - Pumpkinseed and redbreast: depth and cover at death are not tallied (fix 18). Their day positions are 6/19/16/36/23 % and
    8/34/18/31/11 % over < 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m. Pickerel 2/17/39/30/13; smallmouth 5/16/16/31/33.

---

## 3. Why they decline (diagnosis)

**D1 — The predators' demand lands on the littoral small fish (community; shared with predators.md and perches.md).**
- Pickerel at 5.0 kg/ha and smallmouth at 7.3 kg/ha are inside their targets (4–8 and 5–10), and the total of 93 kg/ha is in the
  field range. Too many predators is not the problem.
- The problem is **whom they meet.** White perch spend 89–90 % of days over ≥ 2 m and yellow perch 72 %, where pickerel spend 13 %.
- The small species live inside the predators' water:
  - pumpkinseed and redbreast within 25–80 m of shore at 0.3–2.5 m;
  - fallfish at 0.5–2.5 m near the mouths;
  - killifish at the strip's edge.
- So per head the small species lose 10–20× more to predators than white perch do: killifish 86 %/yr, white perch ~5–8 %/yr.
- **No fix aimed at one small species can hold while this stands (D3).**

**D2 — No refuge behaviour.**
- **Pumpkinseed and redbreast:** `_mode`/`_drive` (fish3.js:1129, 1437) steer a fish only into a bottom-depth band (and a shore
  band, for bass), at 0.7 / 0.4 m above the bed. Cover comes only when weed stems happen to be under the fish (`_inWeeds` 1901).
  The field's defining rule for these fish is missing: small *Lepomis* (< 75–80 mm SL) stay inside vegetation because open water
  carries **40–80×** the predation risk (Werner & Hall 1988; Mittelbach 1984, PPSP §4). Natural weeds at 113–203 stems/m² cut bass
  predation on bluegill **10×** (Smith 1995, PEA).
- **Redbreast:** no hard structure (rock, wood, beaver lodges) exists as fish cover in the 3-D lakes, though littoral3 already
  classes rocky shallows for crayfish.
- **Fallfish:** founded 32 % under 12 cm (on their vb curve). Those fish live in groups of 20 (S3 group [12, 20]). To a pickerel a
  group is 20^0.65 ≈ 7 encounters at full soft-rayed capture (CS3 0.7), over **the pickerel's own band** [0.5, 2.5]. In the field,
  Maine juveniles live in streams and faster water ("juveniles occur in smaller streams than adults", Trial 1983 via HNS). Result:
  41 % of the founders eaten in 14 days.
- **Killifish:** when ripe, a fish takes its spawning band [0.2, 1.0] m day and night (`_mode` 1133, SPAWN3 378). The adults'
  worst fortnights (19 % and 16 % eaten) coincide with the June spawning peak (a likely cause, not yet isolated).
- **Dace:** the fallfish run's ~150 spawners sit on the riffles [0.15, 0.5] m, exempt from bigger-deeper while ripe, inside the
  dace's own band and refuge.

**D3 — Compensation: shielding one prey re-routes the kills.** Fallfish Lpisc 10 → 18 → 30 (arms L → M → O) took fallfish off
the killifish. Total killifish eaten went from 130 k to 128 k to 118 k, as pickerel, white perch and bass took up the slack. In
arm G, before the bass's hunger gate, bass alone killed 30 k pumpkinseed and 26 k redbreast. Predation on the small species tracks
the predators' unmet demand and the small fish's exposure, not the small fish's own numbers.

**D4 — The yearlings enter the strike rule small, in early spring.**
- With RECRUIT_SPRING the overwintered schools become followed fish from FRY.SPRING_YF 0.08, under the ice. At that point:
  - pumpkinseed are 4.8 cm, in groups of 25 below 7 cm;
  - redbreast are 6.1 cm;
  - fallfish are ~8–9 cm, in groups of 20 below 12 cm.
- They meet the agents' encounter rule, which is ~15× the young's density rule per F3's own comment (fish3.js:117).
- Pumpkinseed: 46,856 → 8,988 by mid-August (−81 %). Fallfish: ~6,300 eaten from April to mid-June, as many as the 6,433
  recruited.
- Field: largemouth predation on pumpkinseed "ceases at around 7.0 cm" (DFO via PPSP), and small sunfish live in the weeds.

**D5 — The year-2 squeeze.**
- With the founders gone, year 2 has few spawners: pumpkinseed 278 spawnings against 12,894.
- The spawners are small first-timers that spawn late, so the young are small by October (redbreast 1.5–1.9 cm against 3.2–3.4 in
  year 1).
- Small young then lose more to the first winter (WINTER0 ramp) and to under-ice hypoxia.
- The summer zooplankton crashes in year 2 (Daphnia 146 → 38 µg/L; environment review).
- Recruits fall to 1,985 pumpkinseed and 322 redbreast. The populations cannot rebuild.

**D6 — Expensive bodies, a late-summer famine.**

| FB4 set as the sim uses it | Maintenance ration p at 15 / 20 / 23 °C (prey 3.3 kJ/g) |
|---|---|
| Pumpkinseed 30 g, bluegill adult (species.js:272) | 0.40 / 0.39 / 0.41 |
| Pumpkinseed 3 g, bluegill juvenile | 0.46 / 0.43 / 0.43 |
| Redbreast 60 g, bluegill (species3.js:38) | 0.42 / 0.41 / 0.43 |
| Fallfish 150 g, pikeminnow CA/CB on dace FA 0.4 / UA 0.1 (species3.js:57) | 0.43 / 0.42 / 0.42 |
| Killifish 3 g, fathead (species3.js:76) | 0.31 / 0.36 / 0.40 (0.51 at 26 °C) |
| Dace 2 g, *Phoxinus* (species3.js:91) | 0.36 / 0.35 / 0.35 |
| Yellow perch 20 g / white perch 60 g (for comparison) | 0.25 / 0.27 / 0.30 and 0.27 / 0.29 / 0.32 |
| Pumpkinseed with RA × 0.7 (Roberts 1964: bluegill R is 1.2–1.7× pumpkinseed's) | 0.28 / 0.27 / 0.29 |
| Fallfish with pikeminnow's own FA 0.2 / UA 0.07 | 0.31 / 0.30 / 0.30 |

- The runs feed these fish at p 0.40–0.47 in June–July and **0.17–0.29 in August–October**, as the zooplankton and the shelf's
  bed are cropped.
- Condition falls: pumpkinseed K 0.96 → 0.86 (Aug) → 0.77 (Nov) → 0.74 (Mar); redbreast 0.77 by winter; fallfish 0.84;
  killifish 0.84 with 800–1,500 starved a fortnight in Aug–Oct.
- Real pumpkinseed foraging *peaks* in September (Collins & Hinch 1993, PPSP).
- Thin fish leave their bands to feed: `needy` in `_drive` cuts the band's pull by up to 80 %. That couples starvation to
  predation.

**D7 — The brook is over-full and its dace starve and are eaten.**
- Each sunfish founder within 600 m of its lake's end of the brook summers in the brook with chance 0.3 (pumpkinseed) or 0.5
  (redbreast) (fish3.js:883; SPAWN3 370/377; F3.BROOK_NEAR 188).
- At true scale that is **~1,290 + 1,940 fish into the 300 m² of ≥ 0.6-m water** (bigger-deeper sends fish ≥ 10 cm there) of a
  1,725-m² brook (`brookie_n.mjs`). By comparison, Yoho Lake's *whole* redbreast population is 325–744 (MSS Q4).
- The lakes' young may also feed in the brook at true scale (`free`, fish3.js:2259), and the fallfish run adds ~150 at a time.
- The dace's ration is p 0.12 under arm B (bed only) against their 0.35 maintenance. Under arm A (zooplankton on) it was
  0.38–0.58, yet K still fell to 0.66: check their activity cost.
- They die inside the refuge: RIFFLE_REFUGE cover 0.9 is not enough against 150 spawning fallfish sitting in the same 0.15–0.5-m
  water for three weeks.

**D8 — Winter keeps killing.**
- The followed fish's strikes use `perf × hg` (fish3.js:1651, 1666): cold *performance*, 0.4–0.55 near 0 °C.
- Item 6k (fish3.js:1661, 470) applies the FB4 appetite curve (~0 under the ice) only to hunting the young.
- r8O, which predates 6k:
  - adult killifish fell 22,754 → 3,871 from October to March (−83 %);
  - pumpkinseed recruits were eaten at 870–1,850 a fortnight under the ice;
  - the young of pumpkinseed, redbreast and fallfish died of **hypoxia** at 8–18 % a fortnight in Feb–March, at a lethal
    0.35 mg/L, while the reported bottom O₂ was 7.7–10 mg/L.
- The young sit in locally anoxic shelf cells. Benthic young target the bed (`_yoyTarget` 2249: tz = bed − 0.05) and escape only
  when their own cell falls below o2Crit at a tick. perches.md (High 1b) found the same for the perches' young.

---

## 4. Pumpkinseed (`sunfish`)

| Aspect | Real (source) | Sim (file:line, value; run) | Verdict | Pri · fix |
|---|---|---|---|---|
| Summer day habitat | Vegetated littoral ≤ 2.5 m (80–90 % of Opinicon's fish biomass); the weed edge at 2–3 m, 25–30 m from shore; "not often found in open water"; < 75–80 mm SL stay **inside** vegetation (40–80× open-water risk; 76–91 % of their diet is vegetation prey) (PPSP §4; FFEL) | Day bot [0.3, 2.5] m, h 0.7 m above the bed, act 0.7 (fish3.js:270–271). No cover term in `_drive` (1437); cover only if over a stand and below its canopy (`_inWeeds` 1901). Day position (r6M): 6/19/16/36/23 % (< 0.3 / 0.3–0.6 / 0.6–1 / 1–2 / ≥ 2 m), so **23 % over ≥ 2 m** | Depth OK; **cover MISSING** | **P1** · fix 2 |
| Night | Rests near the bottom in vegetation, rocks or logs; night strikes > 75 % of the day's (plankton) (Collins & Hinch 1993) | Night h 0.15, act 0.35 | OK (needs the cover of fix 2) | — |
| Autumn | Gradual move offshore; foraging peaks in May and September (Keast; Collins & Hinch) | Winter blend from 9 °C; Sep–Oct ration **p 0.17–0.25**, K 0.86 → 0.77 | Habitat OK; **food OFF** | P2 · fixes 7, 9 |
| Winter | Deep-littoral weed stands; near-zero activity ≤ 7.9 °C; fasting ≤ 2.2–4 °C; "winter-lethargic" (Reeve 2022) | Winter bot [1.5, 3.5], act 0.05; no `cold` rule (species.js has none for sunfish) | OK; minor: no quiescent respiration | P3 · fix 21 |
| Brook use | The human: sunfish (mostly redbreast) in the 3–4-ft pools; pumpkinseed are the lake fish that spill in (CT DEEP via MSS Q4) | 30 % of fish within 600 m of a brook end summer in its ≥ 0.6-m water (SPAWN3 370; fish3.js:883, 1134, 1908) → **~1,290 pumpkinseed** | **OFF** (no capacity) | **P1** · fix 6 |
| Schooling and groups | Adults in pairs or loose groups of 3–4; young in large shoreline schools (WI DNR via PPSP) | `group` [7, 25] below 7 cm; cohere 0.2 | OK | — |
| Movement | 97–98 % recaptured at home; home range 0.23–1.12 ha; lake-to-outlet moves exist (PPSP; MSS) | HOME(25, 45) m (~0.64 ha); MOVE3 settle 0.1/yr (fish3.js:355) | OK | — |
| Diet by size | < 75 mm SL: soft littoral invertebrates. > 75 mm SL: snails, > 80 % of prey mass in snail-rich lakes, less where snails are scarce (FFEL; Osenberg & Mittelbach 1989); some plankton at night | plankton/larva/insect/snail; Lsnail 8 cm (species.js:284); arm B: no zooplankton for adults (Lzoo 5, URL only). Run: bed 86–98 %, weeds 1–11 %, surface 1–3 % | PARTIAL: snails minor (plausible in soft water); the override is not in code | P3 · fix 17 |
| Feeding time | Diurnal with a nocturnal component; three peaks a day (Keast & Welsh 1968) | Sight by light (K_I 5, fish3.js:571); act 0.7 / 0.35 | OK | — |
| Growth | Ontario TL 3.3–5.2 / 5.8–7.5 / 7.6–11.7 cm at ages 1–3 (Copp 2004, species.js:277) | Young 3.4 cm mid-October, 4.1 in March, recruits 4.8 cm; 6.0 by mid-August and 7.5 by November of year 2 | OK | — |
| Condition | K ≈ 1 in summer; northern juveniles lose 12–20 % of lipid in the first half of winter (FWM) | Founders K 0.96 → 0.86 (Aug) → 0.77 (Nov) → 0.74 (Mar); 150–190 starved a fortnight all winter | **OFF** | **P2** · fix 7 |
| Maturity | Age 2–3 at ~6–8 cm TL; earlier and smaller under winterkill (Copp 2004; Fox & Keast) | Lmat 7.5 / 6.5, matMinAge 1.5 yr (species.js:278) | OK | — |
| Fecundity | 2,451–10,633 eggs a female a season, over several batches | 35.7·L^2.12 **per spawning** (10 cm → 4,700), repeatable every ~22 days | Likely ~2× high (an annual figure used per batch) | P3 · fix 22 |
| Spawning | First at 13.3–17.2 °C; season ~54 days into late July, up to 16 bouts; nests mean 0.65 m (0.15–1.68), single or in groups of 2–6, any substrate; large males first; males guard day and night; young leave the nest 10–11 days after hatching (Carbine 1948; DFO via PPSP) | spawnT [17, 26] − 2 °C lead; bot [0.15, 1.7]; 10 sites × 100 a lake at true scale; **nest guard 0.005 yr ≈ 1.8 d** (species.js:477). Run: 10,700 of 12,894 spawnings by mid-June, few after mid-July | Timing OK; guard short; season ends early | P3 · fix 23 |
| Young: habitat, food, growth | Littoral; fry vertically like adults in Opinicon (Brown & Colgan 1982); < 75 mm in weeds; 25–45 mm by fall | pelagicFry 1.8 (limnetic), benthL 1.8 (species.js:282); 46.1 M hatched; 1.07 M at 3.4 cm in mid-October | First summer OK | — |
| Young: first winter | Threshold ~25 → 42 mm (FWM); bluegill age-0 overwinter loss 10 % without predators, 39 % with any, 55 % with walleye (Schneider & Breck 1997) | WINTER0 k [0.52, 0.455] (config.js:452) plus predation, **hypoxia 8–15 %/fortnight Feb–Mar** → **−88 % Oct→Mar**; also 55 % of the spring survivors **discarded by F3.CAP** (fish3.js:201) | **OFF** (hypoxia artefact, too much predation) | **P2** · fixes 10, 11 |
| Yearlings (age 1) | Bass predation on pumpkinseed "ceases at around 7 cm"; small fish keep to the weeds (PPSP) | RECRUIT_SPRING (fish3.js:441): 4.8-cm recruits enter the agents' strike rule in early April; **−81 % by mid-August** | **OFF** | **P1** · fix 3 |
| Adult mortality | M 0.54 (species.js:279); Murphy Flowage pumpkinseed 72 % total, 60 % natural (PDPM) | Founders **91 % dead in 10 months (77 % eaten)**; −37 % in the first 4 weeks | **OFF** | **P1** · fixes 1, 2 |
| Predators | Pickerel > 30 cm select *Lepomis*; esocid capture per strike 0.10–0.14; bass 0.57–0.83 on small sunfish; sunfish 5–15 % of pickerel fish prey (PEA; PDPM) | CS3 [0.12, 0.55, 0.3], spiny PPR₀ 0.6 (fish3.js:483–484), gape 0.083, depth 0.38. r6M: smallmouth 14,706 (16 % of its kills), pickerel 10,675 (5.6 %) | Parameters OK; exposure OFF | via fixes 1–3 |
| Birds | Herons, kingfishers (≤ 10 cm), loons, mergansers, ospreys, eagles (OBS: mergansers, eagles) | Only BIOE.M_OTHER 0.5 × M, uniform (config.js:159) | MISSING | P2 · fix 13 |
| Thermal / O₂ | UILT 31.7 °C; preferred 27.7–32; under-ice lethal 0.3–0.4 mg/L; moves to oxygenated inlets (Cooper & Washburn 1946) | uilt 31.7, tPref 28, o2Ice 0.35 (species.js:286); O2_SEEK | OK | — |
| Density / biomass | CEN 50/ha (25–75; soft water 12–150); EMAP 5 % of adults (1–9 %); abundance tracks snails, which are few in soft water (FFEL); the human catches few pumpkinseed against redbreast | 50/ha, 1.7 kg/ha → 0.2 (yr 1) → 0.0 (yr 2) | **OFF** (collapse) | — |

---

## 5. Redbreast sunfish (`redbreast`)

| Aspect | Real (source) | Sim (file:line, value; run) | Verdict | Pri · fix |
|---|---|---|---|---|
| Habitat | **Hard structure and slow current.** Brook pools and runs 0.4–1.2 m, ≤ 35 cm/s; in lakes 0.3–2 m by woody debris, beaver lodges, dense vegetation (Yoho L., NB); CT: "not typically associated with vegetation", "uncommon to rare in lakes", the river sunfish (HNS Q1; MSS Q4) | Day bot [0.3, 2.0], h 0.4, act 0.6 (fish3.js:327–328); spread over both lakes at 50/ha; **no hard-structure cover in 3-D**. Day position 8/34/18/31/11 % | **OFF** (no structure; spread lake-wide) | **P1** · fix 2; P2 · fix 15 |
| Brook | The human: mostly redbreast in the 3–4-ft pools, 18–21 cm; "all the sunfish are in the stream" (OBS) | 50 % of fish within 600 m of a brook end (SPAWN3 377) → **~1,940 fish into 300 m²** | **OFF** (capacity) | **P1** · fix 6 |
| Night | Rests in cover; one river study peaks 20:00–04:00 (conflicting) | act 0.4 | OK | — |
| Winter | Aggregates in deep, slow water below 5 °C, by day, dispersing at night; brook pools (Aho HSI) | Winter bot [1.5, 3.5]; brook fish return to the lake once T ≤ 14 °C or yf ≥ 0.6 (`_brookSeason` 1908) | UNKNOWN (wintering in the pool allowed?) | P3 · fix 24 |
| Movement | Two-thirds move < 100 m; rare 4–9-km trips (Gatz & Adams 1994) | HOME(20, 80); settle 0.05/yr | OK | — |
| Diet | Sub-yearlings: cladocerans and copepods. Adults: aquatic insects (caddis-dominated in Yoho; amphipods ~50 % by number), terrestrial insects (more above ~10 cm), molluscs, some crayfish and small fish; never piscivorous (HNS; FNS) | plankton/larva/insect/snail; Lsnail 12 (species3.js:44); run: bed 94–99 %, surface 1–2 % | PARTIAL: terrestrial and drift share too low (no drift in the brook) | P3 · fix 25 |
| Growth | Yoho back-calculated 36 / 64 / 88 / 111 / 127 / 141 mm at 0+–5+; September 72–161 mm at 1+–6+; guarding males 16.4 cm; the human's brook fish 18–21 cm, ≥ 7–10 yr on Yoho growth (MSS) | Young 3.2–3.4 cm by mid-October (yr 1) ✓; **1.5–1.9 cm in yr 2** (late spawning); recruits 6.1 cm in April (above Yoho's 36 mm) | Yr 1 OK; yr 2 OFF (D5) | via fixes 1–3 |
| Condition | — | K 0.94 → 0.77 by winter; maintenance p 0.41–0.43 (D6) | OFF | P2 · fix 7 |
| Maturity | ~23 g ≈ 10.3 cm, age 3 on NB growth (Carlander; FNS) | Lmat 10.3 / 10, matMinAge 2 yr (species3.js:41) | OK | — |
| Fecundity | 963–8,250 at 14–23.5 cm (NC); 1,396–4,138 at 10–17.5 cm (FL) | 16.8·L^1.92 (20 cm → 5,300); a spawn every ~36 days | OK | — |
| Spawning | NB lakes: late June–early July as the water nears 20 °C (nests 21.4 °C); nests 0.43 m (0.25–0.6), 85 % within 1 m of a rock or log, 58 % > 5 m apart; males guard 7–10 d; larvae 1–2 weeks in the nest (COSEWIC; Gautreau & Curry) | spawnT [19, 26] − 2 °C lead → from ~17 °C; bot [0.25, 0.6]; brook share 0.5; **guard ≈ 1.8 d** (species3.js:37). Run: 7,131 of 9,829 spawnings on 3–17 June | **~2–3 weeks early**; guard short | P3 · fix 23 |
| Young | Fry in shallow water with structure or plants, < 10 cm/s; cannibalism (Aho; COSEWIC) | benthL 1.8; 13.6 M hatched → 0.15 % to age 1; 5,561 of 23,219 recruits died in April–May (the WINTER0 ramp, k [0.57, 0.5]) | OK (the ramp is size-selective, as designed) | — |
| Adult mortality | M ~0.6, to age 8 (COSEWIC) | Founders **86 % dead in 10 months (68 % eaten)** | **OFF** | **P1** · fixes 1, 2 |
| Predators | "Larger piscivorous fish, which may include chain pickerel, smallmouth bass, brown bullhead and American eel"; a smallmouth needs ~32 cm to swallow a 10-cm sunfish, so 13–20-cm adults are nearly safe; < 8 cm eaten by pickerel, bass, perches (HNS) | CS3 as pumpkinseed; r6M: smallmouth took 11,762 (13 % of its kills), **44 % of them 10–20 cm** | **OFF** (too many large adults eaten) | via fixes 1–2 |
| Thermal / O₂ | Unmeasured; "not as tolerant of warm or poor-quality water as pumpkinseed" (CT DEEP) | uilt **34** (above pumpkinseed's 31.7), o2 0.8 / 0.4 (species3.js:45) | OFF (minor) | P3 · fix 26 |
| Longevity | To age 8; the human's 18–21-cm fish imply older | maxAge 8 yr | Likely short | P3 · fix 26 |
| Density | Yoho Lake (131 ha): 325–744 fish (≈ 2.5–5.7/ha, trap-catchable); CT electrofishing 16/h against pumpkinseed's 30/h; Upper Middle Branch Pond (Hancock) PS 23/29, RB 20/6 (EMRA) | 50/ha (32,180) over both lakes | UNKNOWN; probably high in open lake water, low near the brook | P2 · fix 15 |

---

## 6. Banded killifish (`killifish`)

| Aspect | Real (source) | Sim (file:line, value; run) | Verdict | Pri · fix |
|---|---|---|---|---|
| Day habitat | Shelf 0.1–1.3 m; 74–93 % of seine catches ≤ 1.2 m; "often in water under 6 in" (CT); "rarely stray into water much over a foot" (Everhart 1958, Maine); a few inches below the surface; plants (isoetids, *Potamogeton*, *Chara* > 20 % biovolume); move shallower when bass are near (Dunlop). Conflict: Helfman 1981, 1–1.6 m by day (KPP; HNS) | stageR5 day [0.05, 0.35], 0.15 m below the surface, act 0.8 (fish3.js:422); BAND_REL. By day 55/35/6/4/1 %; **deaths 12/60/21/5/1 %**, 89 % at cover < 0.1 | Band OK; **the edge is where they die** | P1 · fixes 4, 5 |
| Night | Opinicon, with bass and pike: disperse into < 0.6 m (Helfman 1981); NL fyke nets: some move to deeper rocky water (COSEWIC) | [0.1, 0.6] (fish3.js:426) | OK (evidence-based) | — |
| Spawning place | On plants (*Potamogeton*) in weedy shallows; territorial males; 5–10 eggs an act | Ripe fish take SPAWN3 [0.2, 1.0] m, h 0.2, **day and night** (`_mode` 1133; fish3.js:378). Their worst fortnights (19 % and 16 % eaten) coincide with the June spawning peak (likely cause; not isolated) | **OFF** | **P1** · fix 5 |
| Schooling | Shoals of 25–40 sorted by size; larger under alarm; against white perch, dilution and **no confusion** (Morgan & Godin 1985) | school 40; bass n^−0.8, perch-like × 0.15 (fish3.js:1761), esocids n^0.65 | PARTIAL (white perch: perches.md) | P2 |
| Movement | Home range 0.3–2 ha, yet they cross a lake in 24 h; weak swimmers, blocked by current; almost never cross between lakes (HNS Q5) | HOME(30, 60); **settle 0.1/yr** (fish3.js:356) | OFF (minor) | P3 · fix 27 |
| Diet | Young: cladocerans. 1+: chironomids, amphipods, ostracods, cladocerans, copepods, flying insects at the surface; never piscivorous (Phillips 2007; COSEWIC) | plankton/larva/insect; arm B: adults no zooplankton (Lzoo 3.5). Run: bed 89–96 %, surface 3–11 %, **young 8–13 % in June** (adults eat larvae ≤ 2 cm, FRY.LARVA_L — their own) | PARTIAL | P2 · fixes 9, 17 |
| Growth | 0+ 25.6 mm SL by 21 Sep (Burton's Pond), 32 mm (Erie), 49.5 mm by mid-October (Opinicon); summer 67 / 79 / 93 mm at ages 1–3 | Young 2.5 cm by mid-October, 3.1–3.3 in winter; adults 5.8 → 6.2 (yr 1) → 7.2 cm (yr 2) | OK (low end) | — |
| Condition | Fatten in summer | K 0.98 (Jun–Jul) → **0.84 (Aug–Oct)**; 800–1,500 starved a fortnight at p 0.24–0.29 (maintenance 0.31–0.40) | **OFF** | P2 · fix 9 |
| Maturity | Age 1 (≥ 42–64 mm) | Lmat 5.5 / 5, matMinAge 0.9 (species3.js:78) | OK | — |
| Fecundity | 526 (age 1, 67 mm), 744, 1,062 eggs; ~3 clutches (201 yolked at a time) | Per clutch 0.58·L^2.85 (6 cm → ~97); cooldown 14.6 d (species3.js:75, 80) | OK (the sim's fish are smaller) | — |
| Spawning time | 19–23 °C, late June–mid-August (Erie GSI peak 9–29 July); **hatch 0 % at 10 °C, ≤ 10 % at 16, > 74 % at 22–28** (Penney 2019); 11–12 days at 22–27 °C | spawnT [19, 26] − 2 °C lead; sHatch 0.3 × (0.3 + 0.7 × plants) constant. Spawning from early June (1,533 on 3–17 June), peaking in June | ~2–3 weeks early; temperature-dependent hatch **MISSING** | P3 · fix 23 |
| Young | The very shallow vegetated littoral; egg→age 1 ≥ 0.2 % to replace, 0.5–2 % for resilience (KPP) | yBed 1.2 m while ≥ 10 °C, benthL 1.0 (fish3.js:459); any plankton or insect eater ≥ 3× their length takes them below 2 cm (FRY.LARVA_L, config.js:241). **Eaten 20–37 %/fortnight Jul–Nov** (r8O); **13 recruits from ~1.1 M (0.001 %)** | **OFF** | **P1** · fix 4 |
| Young: first winter | No data; generic ~30–40 % (FWM, very low confidence); inactive below 12 °C | No WINTER0 k (config.js:452); r8O (pre-6k) eaten 13–15 %/fortnight under the ice; 6k's CPU probe: ~0 | Fixed on CPU by 6k; GPU unvalidated | P2 · check |
| Adult mortality | Z ≈ 1.0–1.5, **rising with age** (S 0.68 from age 1 to 2, 0.10 from 2 to 3; post-spawning senescence); predation 40–60 % of it (KPP) | M 1.35 constant (species3.js:78); **eaten 118 k (79 %)**, a third by mid-June; Oct→Mar −83 % | **OFF** | **P1** · fixes 1, 5, 8; P3 · fix 28 |
| Predators | Kingfisher pellets 10.5–18.7 % killifish; heron; merganser. Pickerel < 30 cm select *Fundulus*, > 30 cm avoid them (Guillory 1979). No smallmouth, perch or white perch stomach records; fallfish never. Targets: pickerel 35–50 %, bass 10–20 %, yellow perch 10–20 %, white perch 5–15 %, fallfish ≤ 5–10 % | r6M: pickerel 36 %, fallfish 35 % (gone in O), white perch 14 %, bass 9 %, perch 5 %. The pickerel average **42 cm**, yet nothing biases them away from 6-cm prey (PPR 0.14 gets the highest capture term) | Shares ~OK after O; **size preference MISSING**; birds MISSING | P2 · fixes 12, 13 |
| Winter | Into deeper water in late fall; quiescent; inactive below 12 °C; fasting ≤ 3 °C (mummichog) | Winter [1.5, 3.0], act 0.05; the winter blend runs from 9 to 5 °C for every species | PARTIAL (onset ~12 °C) | P3 · fix 29 |
| Thermal / O₂ | UILT 34.5 °C; preferred 21 °C (NS); among the least hypoxia-tolerant *Fundulus* | uilt 34.5, tPref 21, o2 0.8 / 0.5 | OK | — |
| Density | ~150 k (20–300 k) = ~0.2/m² of the 88-ha ≤ 1-m shelf; Onondaga ≥ 0.34/m²; Burton's Pond ≥ 700/ha; larval catch varies 700-fold (KPP) | 149,960 → 2,653 → 686 | **OFF** (extinct) | — |

---

## 7. Blacknose dace (`dace`)

| Aspect | Real (source) | Sim (file:line, value; run) | Verdict | Pri · fix |
|---|---|---|---|---|
| Habitat | Brook riffles and runs 0.15–0.5 m, pool heads and tails, gravel–cobble, overhead cover, 15–45 cm/s; fry on silty slack margins < 15 cm/s; lakes rarely; persist with predators by riffles < 25 cm and by **leaving patches that hold predators** (Fraser & Cerri 1982) (HNS Q4; MSS Q1, Q5) | brookRes; day and night [0.15, 0.5], winter [0.8, 1.2] (fish3.js:348–349); RIFFLE_REFUGE 0.9 for fish < 10 cm in < 0.6 m (fish3.js:151); no current in the model (environment review) | Habitat OK; **predator-patch avoidance MISSING** | P2 · fix 6c |
| Density | 0.03–2.6/m² (Catskills), 0.2–5.2 (Mohawk) | 0.8/m² from age 1 → 1,380 | OK | — |
| Diet | Chironomids (the only consistent food), insect larvae, drift, terrestrial insects, some algae | larva/insect/plankton; arm B: no zooplankton (Lzoo 3). Run: bed 72–96 %, surface 2–11 % | OK in kind; **supply OFF** | **P1** · fix 6 |
| Ration and condition | Hold condition all summer (production 38–53 kg/ha/yr in a Maine river) | **p 0.12–0.22** (arm B) against maintenance 0.35–0.38; K 0.96 → 0.72 in 6 weeks. Arm A: p 0.38–0.58 but K still → 0.66 | **OFF** | **P1** · fix 6 (verify activity cost) |
| Growth, maturity, fecundity | Age 0 24–27 mm, age I 49–50 mm; mature at age II; 166–1,116 eggs | vb (9, 0.55), Lmat 5, matMinAge 1.5, fec 0.82·L^3.42 (species3.js:92–95) | OK | — |
| Spawning | 15.6–22 °C; in the north from 21 °C (~20 June on the sim calendar); riffles < 25 cm at 20–45 cm/s, gravel ≤ 2.5 cm; en masse, no care | spawnT [19, 23] − 2 °C lead; bot [0.1, 0.3] in the brook | OK | — |
| Young | Larvae drift at night to slack silty margins and stay there up to a year (≤ 45 mm) | brookYoy; dace young eaten **40–81 %/fortnight** (r8O) | **OFF** | via fix 6 |
| Adult mortality | 65–80 %/yr, i.e. ~4–6 %/week in open water; to fallfish ≤ 0.5–1.5 %/week (FSB Q4) | All 1,380 gone by day 70 (eaten 1,280: **20–55 %/week** late May–June) | **OFF** | **P1** · fix 6 |
| Predators | Smallmouth, trout, merganser, heron, kingfisher, loon; the congener creek chub eats dace; **no record of fallfish eating dace**; large fallfish should not hunt water < 20–25 cm or riffle cores (FSB) | r6M: fallfish 93 % of dace kills (Lpisc 18), **86 % at cover ≥ 0.5** (inside the riffle refuge); r8O (Lpisc 30) still 273–566 a fortnight | **OFF** | **P1** · fix 6b |
| Winter | Deep water, pools, under banks; downstream into larger water | Pools [0.8, 1.2] | OK | — |
| Thermal | UILT 28.8–29.9 °C; preferred 19–25 | uilt 29.3, tPref 21 | OK | — |
| Between the lakes | ~0 (the lakes are the predator matrix); the human's passing schools may be young fallfish or dace — unknown | brookRes: turns back at the mouths | OK / UNKNOWN | — |

---

## 8. Fallfish (`fallfish`)

| Aspect | Real (source) | Sim (file:line, value; run) | Verdict | Pri · fix |
|---|---|---|---|---|
| Adult habitat | Brook pools and deep runs 0.5–1.2 m; lake margins over gravel and cobble near the mouths; clear water; "primarily solitary"; dislikes mud (HNS Q2) | Day bot [0.5, 2.5], h 0.5 above the bed (fish3.js:332–333); founders weighted to the brook's ends (nearBrook 400 m, fish3.js:935). Day position 5/19/16/21/39 % (**39 % over ≥ 2 m**) | PARTIAL: depth plausible, no gravel or rock preference | P2 · fix 15 |
| Juvenile habitat | **Faster, shallower water (0.2–0.5 m, riffles); Maine juveniles in smaller streams than adults** (Trial 1983); young disperse downstream | No juvenile band: below 12 cm in **groups of 20 over the pickerel's own [0.5, 2.5]**; 32 % of founders under 12 cm. **41 % of founders eaten in 14 days** | **OFF** | **P1** · fix 3 |
| Vertical, feeding style | Drift and surface feeder: terrestrial invertebrates the main summer food (30 %); a single evening feeding peak (Johnson 2015) | v 0, 0.5 m over the bed → diet surface **1–3 %**; act 0.6 / 0.4, no dusk peak | **OFF** | P2 · fix 14 |
| Diet by size | < 10 cm: zooplankton, chironomids. Adults: insects, crayfish, algae, fish ≤ 10–20 % outside naive-fry pulses; none below 10 cm; no record of eating killifish or dace (KPP Q3; FSB Q3) | Lpisc **30** (stageR5, fish3.js:465); cray 0.1; plants. Run: fish 1–8 %, but **young 31–37 % in Aug–Oct**, bed 57–96 % | PARTIAL: check the late-summer "young" share | P3 · fix 30 |
| Growth | Adults 15.5–36.5 cm (typical 155–255 mm); no length-at-age (gap; guess 3–6 cm at 0, 6–10 at 1) | Young 6.1–6.8 cm by Sep–Oct; **7.0 → 8.8 cm under the ice** (selection or growth?); survivors average 29–33 cm | UNKNOWN; verify the under-ice growth (perches.md finds the same) | P2 · fix 11 |
| Condition | — | K 0.94 → 0.84; p 0.21–0.28 in Aug–Sep; maintenance 0.42–0.45 on the dace-derived set | **OFF** | P2 · fix 7 |
| Maturity, fecundity | Males III+ (2–3 yr), females IV+ (3–4); 2,000–12,321 eggs | Lmat 18 / 15, matMinAge 2, matureAge 3.5; 0.12·L^3.3 (species3.js:60, 62) | OK | — |
| Spawning | Maine fallfish run from larger waters into streams at ≥ 15 °C (optimum 17, pausing below 15), ~25 May–12 June; mounds ≤ 0.5 m near cover; < 10 % of males build; the brook holds ~50–300 at once; **most lake fish would use the other streams (Upper's inlet, Lower's 2.95-km outlet), off the map** (FSB §1–2) | site 'brook', runK 150/1,725 m² (~150 at once, fish3.js:377); the rest spawn on lake shoals [0.15, 0.5]; 9,236 spawnings 20 May–3 June ✓ | Timing OK; **off-map streams MISSING**; most young hatch in the lakes | P2 · fix 16 |
| Spawners' feeding | Nest-holders near zero; satellites and females ~half, mostly drifting eggs (FSB Q3) | RIPE_HUNT 0.5 for all (fish3.js:199); ripe fish exempt from bigger-deeper in the brook | OFF (dace) | **P1** · fix 6b |
| Young | Streams, faster shallow water; dispersing downstream; the human's summer schools passing through the brook | brookYoy, but most hatch on the lake shoals; 7.3 M hatched → **eaten 52 %**, recruits 0.09 % | **OFF** | P2 · fix 16 |
| Adult mortality | Lives 6–10 yr (M ~0.6); adults ≥ 30 cm only to large pickerel, eagles and ospreys | Founders −84 % eaten in 10 months (r8O); fallfish are 13 % of pickerel kills (r6M) | **OFF** | **P1** · fixes 1, 3 |
| Predators | Small fallfish (< 15 cm) to smallmouth, pickerel, perches and larger fallfish; osprey, herring gull (Maine), merganser; 0.9 % of white perch food (Cooper) | CS3 [0.7, 0.6, 0.5] soft-rayed (fish3.js:482), vuln 0.7, depth 0.21 | Parameters OK; **exposure OFF** | via fix 3 |
| Winter | No data; brook pools or the lake at 2–4 m [inf] | [2.0, 4.0], act 0.2 | UNKNOWN | — |
| Thermal / O₂ | Preferred 22.3 °C; seldom > 28 °C; O₂ unknown | tPref 22.3, uilt 31 (prior), o2 1.5 / 0.8 | OK | — |
| Lake-to-lake corridor | The human: schools pass between the lakes through the brook in summer (young fallfish or dace) | Not modelled (settle 0.1/yr only) | MISSING | P3 · fix 31 |
| Density | Design 3–10 % of the ≥ 7.5-cm census (75–250/ha); EMAP 0–23 % of adults (Fourth Machias 23 %); the human catches "lots", more than perch (EMRA Q3) | 85/ha, 7.1 kg/ha → 2.0 → 0.9 kg/ha (r8O); ×0.6 a year over 5 years on 3 seeds (r1A/B) | **OFF** | — |

---

## 9. Prioritized fix list

Each fix names its evidence and a **check**. Run every check on ≥ 3 seeds × ≥ 3 years: a year-1 check proves nothing here, since
the collapse plays out in years 2–4. Fixes 1–6 belong together; done singly, D3 says the kills will just move.

### P1 — needed for persistence

1. **Give the predators their real main prey (shared with predators.md and perches.md High 3).**
   - Bring white perch, and the 10–20-cm yellow perch, into the predators' water at the right times: a twilight weed-edge phase,
     shallower day bands for a coloured 5.5-m lake, and white perch's school term as dilution without confusion.
   - Also review whether the pickerel need a hunger gate like the bass (fish3.js:450 gates only bass). Pickerel made 192 k kills
     a year among ~5–16 k pickerel — 24 % of them killifish.
   - **Check:** white perch ≥ 30 % of pickerel and bass fish prey by mass. Small soft-rayed fish (killifish, fallfish, dace)
     10–25 % and sunfish 5–15 % of pickerel fish prey (PDPM). Killifish ≤ 0.5 % and bullhead ~0 of bass kills. Predation on adult
     killifish 50–80 k in year 1, spread through the season.
2. **A cover drive for the sunfishes** (`_mode`/`_drive`; the GPU's `mode`/`drive` in wgsl.js).
   - Weight the choice of water by structure: weed stands (plants3 `standCover`) for pumpkinseed, rock and wood for redbreast.
   - Expose hard structure as fish cover: littoral3 already classes rocky shallows, and wood would be new.
   - Hold the fish **within the canopy height** by day; rest in cover at night.
   - Make the size rule explicit: fish ≤ 8 cm stay inside cover (a habJ-like `cover` band), larger fish forage at the weed edge.
   - Optionally let cover protect deep-bodied prey more than minnows (Savino & Stein: at 1,000 stems/m² predators still caught
     minnows but not bluegill).
   - **Check:** ≥ 60 % of pumpkinseed by-day blocks at cover ≥ 0.3. Their deaths mostly at the weed edge, not in open water.
     Adult pumpkinseed and redbreast predation ≤ 20–30 %/yr. Add their depth and cover at death to year.js (fix 18).
3. **Yearlings and juveniles out of the adults' strike rule.**
   - With RECRUIT_SPRING, either keep a recruit under the young's density rule until a size (sunfish ~7 cm, "predation ceases
     at ~7 cm"; fallfish ~12–15 cm), or give the juveniles their own band.
     - Sunfish: the cover band of fix 2.
     - Fallfish below 12–15 cm: ≤ 0.5 m over gravel and cobble near the mouths and in the brook, where the pickerel's
       SHALLOW_K reach fails.
   - Consider recruiting when the water warms (≥ 8–10 °C, when sunfish resume feeding at 8.5 °C) rather than at yf 0.08 under
     the ice.
   - **Check:** age-1 pumpkinseed spring → autumn survival ≥ 40–60 %. Fallfish founders' first-month loss ≤ 5–10 %.
4. **Killifish young: a real shallow-water nursery.**
   - yBed 1.2 → ~0.5 m by day (KPP: the very shallow, weedy margin), so the young sit inside SHALLOW_REFUGE (full at ≤ 0.2 m,
     none at ≥ 0.8 m).
   - Re-check FRY.LARVA_L 2.0, under which every fish ≥ 3× a larva's length eats it, against the larva's detectability, and
     cap cannibalism by adults.
   - Add a tally in year.js of **young killifish eaten by predator kind** (the "young fish eaten by the followed fish" list
     cuts off at the top 14).
   - **Check:** egg → age 1 ≥ 0.2 % (0.5–2 % in good years); age-0 25–32 mm by late September; recruits per spawner ≥ 1.
5. **Killifish adults keep the strip when ripe and through the winter.**
   - Spawning band [0.2, 1.0] → the strip with plants, ≤ ~0.5 m: the plant spawner picks the best plants *within* its refuge
     depth, with `_pickSpot` limited to that depth.
   - Extend item 6k's cold appetite (min(perf, FB4 consumptionT)) to the agents' strikes on small followed prey, or on all prey.
     The strike rate under the ice then follows the predator's appetite, as V5 in PPSP has it (pickerel feed, bass ~¼).
   - **Check:** June–July adult loss ≤ ~8 %/fortnight; October → March adult loss ≤ 40 %; Z 1.0–1.5/yr overall.
6. **The brook: capacity, food and refuge.**
   - (a) Make the brook's sunfish **capacity-limited by pool area**, like the fallfish's runK. Take the largest fish first (Hall
     1972: larger fish move upstream; HSI abundance rises with depth). A starting value is ~0.2–0.5 fish/m² of ≥ 0.6-m water,
     i.e. ~60–150 sunfish instead of ~3,200 — an estimate; ask the human how many they see in the pool.
   - (b) Spawning fallfish in the brook: nest-holders don't hunt; satellites and females ≤ ½ and **not in the riffle cores**
     (water < 0.25 m). Ideally dace avoid patches holding large fish (Fraser & Cerri).
   - (c) Measure who eats the brook's benthos at true scale, and the dace's activity multiplier (`act` in `_energetics` 1629).
     Arm A's dace starved at p 0.4–0.58.
   - **Check:** dace K ≥ 0.9 all summer; ≤ 2 %/week of dace lost to fallfish in June; dace persist ≥ 3 years with home-bred
     recruits; the brook's invertebrates stay near 25–36 g/m² (HOT_BROOK_3D.md §4 "Built — the brook as a lake-outlet stream").

### P2 — clearly wrong, second-order for persistence

7. **FB4 stand-ins.**
   - Pumpkinseed and redbreast: bluegill RA × ~0.7 (Roberts 1964: bluegill respiration runs 1.2–1.7× a 30-g pumpkinseed's
     routine uptake; already flagged at species.js:272–273). That lowers maintenance from p ~0.40 to ~0.28.
   - Fallfish adults: pikeminnow's own FA 0.2 / UA 0.07 instead of the dace set's 0.4 / 0.1, lowering maintenance from 0.42 to
     0.30.
   - Keep the dace's published *Phoxinus* set.
   - **Check:** length at age against Yoho (redbreast 36 / 64 / 88 / 111 / 127 mm) and Ontario (pumpkinseed 3.3–5.2 / 5.8–7.5 /
     7.6–11.7 cm); autumn K ≥ 0.9.
8. Fold into fix 5: winter predation on adult small fish at the predators' cold appetite.
9. **The late-summer famine (environment).**
   - The Aug–Oct ration is p 0.17–0.29 for pumpkinseed, killifish and fallfish against the field's September foraging peak.
     Tie in the zooplankton crash and bed depletion (environment review).
   - Let adult killifish take cladocerans and copepods again (the arm-B override removes them; Phillips and COSEWIC list them).
10. **First-winter losses of the sunfish young** (−88 %, against ~40–55 % with predators, Schneider & Breck).
    - Hypoxia: find the anoxic shelf cells and make benthic young leave water below their critical O₂ *before* it is lethal
      (same as perches.md High 1b).
    - With fix 5's cold appetite applied to the young (6k), winter predation should fall.
11. **Under-ice growth of the young** (fallfish 7.0 → 8.8 cm November → March; perches.md found the same for white perch).
    Separate growth from selection with a CPU probe that tracks each school's L. If it is growth, stop somatic growth below
    ~10 °C.
12. **A prey-size preference for the strike rule (predators.md).** Large pickerel avoid *Fundulus* (Guillory 1979): optimal prey
    is ~25–43 % of predator length (Wahl & Stein 1988) and field prey average ~0.3 of it. Today the capture term
    (1 − PPR/PPR₀) favours the smallest prey, so 42-cm pickerel crop 6-cm killifish.
13. **Shore birds** (environment review P1): kingfisher (10.5–18.7 % killifish), mergansers (a brood seen), heron, eagle (seen).
    Take their share **out of** M_OTHER (config.js:159), not on top. This matters once fixes 2 and 4–5 make the shallows a fish
    refuge: the shallows are not a refuge from birds (Power 1987).
14. **Fallfish feed at the surface and in the drift:** day v 2 (near the surface) or a surface-feeding share, and a dusk feeding
    peak. **Check:** surface and terrestrial insects ~30 % of adult summer diet.
15. **Distributions.**
    - Redbreast weighted to the brook ends and rocky or wooded shores (a `nearBrook`-style founding). In the open lake perhaps
      10–30/ha rather than 50 (Yoho's 2.5–5.7/ha; CT "uncommon to rare in lakes"). Ask the human.
    - Fallfish adults toward gravel and rock.
16. **Off-map streams for fallfish** (FSB §2).
    - Runners turned back from a full brook go to an off-map sink: Upper's south inlet for Upper's fish, Lower's outlet for
      Lower's. They stay days to ~2 weeks and return, instead of spawning on the lake shoals.
    - Their young enter the lakes later, at stream survival (as late-summer age-0 at ~4–5 cm, or as yearlings).
    - **Check:** most young fallfish from streams; lake-spawned young ≤ ~10 %.
17. **Make the arm-B diet real** before stageR5 becomes the default. The validated runs carry it only in the URL (`s3.<k>.plank=0`,
    `sp.diet.plankton=0`, `sp.Lzoo`; armB_query.txt). Put it in species3.js or S3, but keep killifish adults on cladocerans
    (fix 9).
18. **Tallies in year.js:**
    - depth and cover at death for pumpkinseed, redbreast and fallfish;
    - the brook's occupancy by species (brookies, runners, dace, lake fish ranging in);
    - young eaten by predator kind for the small species;
    - length at age for these five.
    Without them fixes 2, 4 and 6 can't be judged.

### P3 — details

21. A `cold` quiet factor for pumpkinseed and redbreast (Reeve 2022: winter-lethargic, near-zero activity ≤ 7.9 °C).
22. Pumpkinseed fecundity is probably an annual total used per batch (species.js:281 with cooldown 0.06 yr). Check against
    Ontario's 2,451–10,633 a season.
23. **Spawning details:**
    - redbreast and killifish start ~2–3 weeks early: tune the 2 °C lead or the per-species start;
    - killifish hatch should depend on temperature (0 / ≤ 10 / > 74 % at 10 / 16 / 22–28 °C);
    - nest guarding should last 7–11 days for pumpkinseed and redbreast, not ~1.8. It was cut because guarded fry starved in
      food-poor shallows; revisit once the brood's food is right.
24. Let brook redbreast winter in the 1.1-m pool if it stays oxygenated (Aho HSI: winter aggregations in slow pools). Unknown:
    ask the human only if they volunteer it.
25. Drift in the brook: the outflowing lake plankton and insects as food for pool sunfish and dace (MSS Q4 "food delivered by the
    current"). A surface and terrestrial share for redbreast above 10 cm.
26. Redbreast uilt ≤ pumpkinseed's (~31–33 °C; CT: less tolerant than pumpkinseed). maxAge 8 → ~10, if the brook's 18–21-cm fish
    are to exist on northern growth.
27. Killifish settle 0.1 → ~0.01 a year: weak swimmers, blocked by current; a lake-to-lake crossing is rare.
28. Killifish M rising with age: low at age 1→2, ~2 after the second spawning season (Phillips' catch curve).
29. A species-specific winter onset: killifish inactive below ~12 °C; the shared blend runs from 9 to 5 °C.
30. Check why fallfish eat 31–37 % "young" in Aug–Oct (larvae ≤ 2 cm under LARVA_L, or the piscivores ≥ 30 cm). The field
    allows ≤ 10–20 % fish outside fry pulses.
31. A summer corridor for young-fallfish schools between the lakes (the human's observation). Model it once fix 3 gives young
    fallfish a stream-and-mouth habitat.

---

## 10. What is right (keep)

- **Pumpkinseed:**
  - depth bands by day, night and winter;
  - O₂ limits (Cooper & Washburn);
  - UILT;
  - maturity;
  - first-summer growth (3.4 cm by October);
  - the snail switch at 8 cm (Mittelbach).
- **Redbreast:**
  - nest depth 0.25–0.6 m;
  - growth of year 1's young (3.2–3.4 cm against Yoho's 36 mm);
  - maturity at 10.3 cm;
  - fecundity;
  - the bluegill stand-in, apart from RA.
- **Killifish:**
  - the day strip (< 0.35 m) and the night shallows (Helfman 1981);
  - schools of 40;
  - fecundity per clutch;
  - UILT 34.5;
  - young growth to ~2.5–3.2 cm;
  - fallfish no longer eating them (Lpisc 30).
- **Dace:**
  - brook-resident in riffles and runs, at Catskill density;
  - spawning band and season;
  - the thermal limits.
- **Fallfish:**
  - the brook spawning run with capacity (runK) at the right time (late May–mid June);
  - maturity and fecundity;
  - CS3 soft-rayed capture;
  - Lpisc 30;
  - the founders weighted to the brook ends.

---

## 11. Open questions and verification items

- **Seeds:** r8O 611 and 612 (queue_r8) will show whether these collapses repeat under the package. The older 3-seed A/B (r1A/r1B)
  says they will.
- **r8O's end tallies** (day 1825): who ate the dace and the young killifish once fallfish stopped (Lpisc 30); white perch's share of
  the kills.
- **For the human** (only if useful; their notes already cover a lot): how many sunfish they see in the upper pool at once;
  whether redbreast are also caught along the lakes' rocky shores away from the brook. Don't re-ask about bass use of the brook,
  dace vs fallfish schools, or Lower's sunfish (memory: don't re-ask).

**Probes used** (scratchpad, no repo edits):
- `C:\Users\james\AppData\Local\Temp\claude\C--Users-james-Downloads-synapse-reefclaudecode-synapse-reef\3fbb8b1d-0819-461b-9dac-5da076bd3f7a\scratchpad\sfser.mjs`
  (`node sfser.mjs r8O_613.txt <species>`)
- `…\scratchpad\maint.mjs`, `…\scratchpad\maint2.mjs` (maintenance rations)
- `…\scratchpad\brookie_n.mjs` (`HB_WORLD=true node brookie_n.mjs`: the true-scale brook and its summering sunfish)
