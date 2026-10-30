# FINDINGS — what building and testing the Hot Brook lakes taught

The running log for the paper (ROADMAP "📄 The paper"). One dated entry per finding: **what** was found, **how** (the run, seeds,
tool), the **evidence** (numbers), and **where** it is documented in full. Model artifacts count as findings — what a whole-lake
model gets wrong, and why, is as useful to the next modeller as what it gets right. Newest first.

## 2026-10-23 — E15: the camps' phosphorus is small, their docks' shade is not (test/w3.mjs `camps`, the 1/10 lakes, seeds 541/401)
- **What.** The 58 lived-in camps (54 docks) send ~0.28 kg of available P a camp a year — septic 0.08 (~75 days' use at NH DES's 0.1 kg
  per 90), lot 0.15 (Maine's PCAP coefficient), road ~0.01 (only 1.1–1.4 km of gravel lies within 76 m of the water) — under the
  research's central 0.4: Upper ~10 kg/yr, Lower ~6.1. Over the first summer Upper's TP rose +0.039–0.053 µg/L, 0.79–0.81× a one-box
  mass balance of the same load (100-day flushing, R 0.45); §3's steady state is +0.14 µg/L, ~1.7 % of the external load. The plants
  under the docks fell to 0.40–0.45× the bed beside them in the first summer and 0.17–0.18× in the second, on the way to the field's 0.05
  under long-standing piers (Garrison 2005) — with no tuning: 10 % light alone puts a shallow pondweed just below its compensation
  (−0.3 %/day) while the bed beside it fills its room. Docks cover < 0.01 % of the lakes' bed: local, as the field says.
- **The model's limit:** a patch has no lateral spread from the bed beside it, so a hand-pulled swim area (0.1 of its plants each June)
  thins year on year (0.26× → 0.12× by late August).
- **Where.** docs/HOT_BROOK_3D.md §5 "Built (E15)"; config CAMP3; src/w3/campfx3.js.

## 2026-10-23 — Arm AM (AL + Y4 + the forest + the burial fix): broader recruitment, but the white perch still go (GPU, true scale, seeds 611/613)
- **What.**

  | | Start | Year 1 | Year 2 | AL year 2 |
  |---|---|---|---|---|
  | Seed 611 | 79 kg/ha | 43 | 24 | 28 |
  | Seed 613 | 79 kg/ha | 56 | 38 | 40 |

  - Recruits over the two years (per seed): bullhead ~166,000, perch 112,000–139,000, fallfish ~98,000, redbreast 37,000–49,000, bass
    7,700–36,000, white perch 115–123 (AL: 0), killifish 16–39.
  - Summer crustaceans 84–116 µg/L (D + C). P inventory 112–126 % at the year ends.
- **The white perch (1.5–3.0 kg/ha by year 2) fail in two ways.**
  - **The founding stock is eaten in the first summer:** 57 % in 112 days, a Z of ~2.7/yr, where a stable white perch stock's adults run
    ~0.4–0.7/yr.
  - **The young still stall on the true lakes in year 1** (1.5–1.6 cm from mid-July to September). On the 1/10 lakes with the same
    settings they reach 37 mm. Year 2 is better (2.6 cm by early July), but they die 64–67 % "natural", 10–16 % starved and 19–22 %
    eaten.
- **Who eats the founding white perch** (probe wpdeath, the 1/10 lakes, occ-server):
  - The 7.5–15 cm band falls 257 → 75/ha in 112 days, while the 15–22 cm band holds (150 → 130).
  - Z by cause in mid-May: eaten 0.14, wildlife 0.24, other 0.39 /yr.
  - Z by early September: eaten 4.1 /yr (bass 2.4, pickerel 0.9, fallfish 0.8), wildlife ~0.3, other ~0.3.
  - Bass need ~15 kg/ha a year of fish, and white perch are the most numerous prey. In a real lake that is met by each year's young
    growing into the predators' window; without recruitment the predators eat the standing stock down. Y4's fewer young leave the bass
    more of the yearlings.
- **Next.**
  - Why the true lakes' young differ from the 1/10 (probe ywp3 on HB_WORLD=true, occ-server). The early alewife larvae run
    150,000–500,000/ha in June on both scales, against the field's sparse open-water larvae (~600–13,000/ha), while the late-summer
    juveniles (~5,800/ha) match Connecticut's.
  - Recruitment, the prey's production, remains the key.
- **Where.** scratchpad r22AM_611/613.txt (yrsum.mjs), queue_am.sh.

## 2026-10-22 — Y4: thinning the young at the yolk-sac stage lets the survivors grow at field rates (probe ywp3, occ-server)
- **What.** EGG3.YOLK_HATCH 0.95, the yolk-sac stage's survival, is an unsourced prior. The field's hatch → first feeding for perch is 0.12–0.73
  (Kinord, central ~0.3; Oneida egg + yolk sac ~0.08), and for white perch ~0.25–0.65 (egg → first feeding ~0.03–0.25, no field
  measurement). With 'yolkHatch' 0.2 for both (perch egg → first feeding ~0.17, white perch ~0.04: inside the bounds, the white perch at the
  low end):

  | On 1 September (the 1/10 lakes, seed 611) | 0.95 (before) | 0.2 | Field |
  |---|---|---|---|
  | White perch young | 15,900/ha at 26 mm | 9,000/ha at 37 mm | 40–55 mm; ~100–700 (Oneida), ~3,000 (Erie), ~7,200 (Hudson)/ha |
  | Perch young | 9,200/ha at 35 mm | 3,600/ha at 48 mm | 53 mm by 1 Aug (Oneida) |
  | Crustaceans | 75 µg/L | 87–176 µg/L | Maine median 147 |
  | Consumption ratio | ~0.55 | ~0.6–0.8 | field growth needs ~0.75–0.95 |

  - White perch at 0.1 instead: 4,700/ha at 39 mm.
  - Alewife at 0.1: 40/ha, against the field's 1,000–11,000, so the alewife keeps the default.
- **Lesson.** The young's growth was not limited by the lake's food or the feeding curve but by how many shared it. A loose prior at the
  stage where field larvae die most turned into a summer-long stall, and the field-like growth came back by thinning the cohort, not by
  feeding it more.
- **Gate.** The E3 check's white perch swim-up band is now the field's 3–25 % (was 8–40 %). W3_ONLY=eggs,young: 30 PASS, 0 FAIL.
- **Next.** Arm AM (GPU): do the white perch recruit?
- **Where.** config EGG3.sp.perch/whiteperch.yolkHatch; probes ywp3.mjs (ywp3_A–E.txt), eggpipe.mjs.

## 2026-10-22 — The white perch's young: every stage at the generous end of the field, compounding (probes eggpipe, ypred, ypred2; the 1/10 lakes; occ-server)
- **The pipeline (per ha).**

  | Stage | Sim | Field |
  |---|---|---|
  | Mature adults | 318 | — |
  | Eggs laid | 4.2 M (~13,000 per mature fish) | fecundity 20,000–150,000 per female |
  | Egg stage | 50 % base loss, 23 % eaten, 7 % cold, 0.5 % storm | — |
  | Eggs → swim-up | 18 % (777,000/ha) | ~6–48 % [inf] |
  | Swim-up → 20 mm | 8 % | 0.02–0.15 |
  | End of August | ~19,000/ha | ~100–700 (Oneida, clear water); ~3,000 (eutrophic Lake Erie) |

- **No stage alone is out of range;** together they leave far too many young.
  - Larval Z 0.055–0.09/d against the field's ~0.1–0.2.
  - Fish take ~0.03–0.05/d, where L2 was designed to give 0.12–0.16 and the field says fish do 70–90 % of larval deaths.
  - The young grow slowly in the crowd (local crop, above), so the larval stage lasts ~65 days instead of 30–45.
- **Why fish take too few.** Every larval request is granted in full (ypred2), and the predators' handling is far from saturated. So
  the encounter rate itself is low against L2's design. Suspects:
  - the larvae's refuge in the shallows and weeds (F3.YDEPTH's reach; q.cover);
  - the weeds' extent since E12b;
  - the predators' sight and cold (SPIN_SIGHT).
- **Next.** Rerun L2's own §3.4 check with today's model, term by term.
- **Where.** scratchpad probe eggpipe.mjs, ypred.mjs, ypred2.mjs (remote --put); research notes larval_mortality_and_density_in_lakes.md,
  fish_predation_on_larvae.md.

## 2026-10-22 — The young's slow growth is local crowding, not the lake's food or the feeding curve (probes ywp, ywp2; the 1/10 lakes)
- **What.** The young fish grow at about a third of the field's rate (white perch 0.2–0.35 mm/d in July, 24 mm by late August; field
  0.67–0.8 mm/d, 53–67 mm). Yet the water they sit in holds 150–250 µg/L of crustaceans in July, at or above Maine's median.
- **Evidence.**
  - Their consumption ratio (intake ÷ Cmax) is 0.4–0.68.
  - Lowering the young's crustacean half-saturation from the package's 60 to the field's 25, or even to an extreme 5, left both intake
    (~0.56) and growth unchanged.
  - Instrumenting the take: at 60 the feeding curve allows 66–70 %. At 5 it allows 84–92 %, but then the per-step crop of the
    catchable plankton in a school's patch (PLANKTON.CROP 0.3) binds in 35–84 % of the calls and the take stays at 53–60 %.
  - The young are supply-limited where they are: too many schools share each patch for each to get its fill. Young alewives are the
    biggest planktivores (asked 478 kg in three July weeks against white perch's 156; crop-bound in 98 % of the calls).
- **Why it matters.** Lake-mean zooplankton can look like plenty while the young starve. The density of the young, not the curve,
  sets their growth. Field late-summer white perch YOY run 2,900–7,200/ha against the sim's ~19,000 (the 1/10 lakes), and field
  larval mortality may run well above the sim's ~0.04–0.05/day (Hudson cohorts ~0.27/day; no lake value).
- **Where.** scratchpad probe ywp.mjs, ywp2.mjs (ywp_base/k25/k5.txt); research notes young_white_perch_growth_and_food.md,
  larval_mortality_and_density_in_lakes.md (pending).

## 2026-10-22 — Arm AL (Z1 + Z1b + Z2 + FEED_CV + R7): the first year classes recruit, but the white perch's young stall at 13–15 mm and the community still shrinks (GPU, true scale, seed 611)
- **What.** The re-based plankton, the young's unequal shares and the school-strike fix, against arm AJ (the same seed, without them):

  | | Start | End of year 1 | End of year 2 |
  |---|---|---|---|
  | AJ fish biomass | 79 kg/ha | 49 | 31 |
  | AL fish biomass | 79 kg/ha | 44 | 28 |

  - AL had recruits for the first time: perch 72,000, bullhead 124,000, pumpkinseed 6,400, bass 2,200 over the two years. AJ had
    almost none.
  - The summer algae are 63–75 % edible (AJ 16–19 %), and the crustaceans run ~65 µg/L, inside the field's 50–150.
- **The white perch collapse (10.7 → 2.2 kg/ha) is two things.**
  - **The founding stock is eaten in the first summer:** 289,622 fish, mean 13.7 cm; 165,000 eaten by day 112 in AL (AJ 162,000).
  - **No white perch year class:** 644 M hatched in year 1, 310 M in year 2, recruited 0. They died 54–60 % natural, 10–20 % starved,
    19–36 % eaten, and stayed at 1.3–1.5 cm from July into October (field YOY white perch reach 5–8 cm by fall).
  - Past the rotifer stage the young feed on the crustaceans at the package's K_FRY 60 µg/L. At AL's 30–40 µg/L that is ~37 % of their
    appetite, about maintenance. In the field the young switch to the bed's prey at 2–3 cm. Next: the young's path from the
    plankton to the bed, and the field's crustacean densities for small Maine lakes.
- **Seed 613 agrees:** 79 → 56 → 40 kg/ha. Recruits: bullhead 79,000, fallfish 81,000, redbreast 540; no perch this seed. White perch again
  12.5 → 3.2 kg/ha with 0 recruits (656 M and 332 M young hatched; 52–59 % natural, 13–23 % starved).
- **Where.** scratchpad r22AL_611.txt, r22AL_613.txt (yrsum.mjs), queue_al.sh (snap_al: the tree before the E14 merge and before Z2_BURY).

## 2026-10-22 — A school of piscivores fed every fish on one kill: n fish's meals for one prey's death, in both engines (R7)
- **What.** A followed-fish agent can be a school of up to 80 fish (perch ≥ 14 cm, white perch ≥ 15 cm hunt as schools). When it
  struck, both engines added the whole prey's mass to the gut of each fish it stands for (`gut += gr`, not `gr / n`), and the prey
  school lost one fish. So one prey death fed n predators. The prey died n times more slowly than the predators ate them, and fish
  mass was made from nothing.
- **How found.** The CPU–GPU agreement check (g1_check, yf 0.27) showed white perch eating 0.59 kg on the CPU against 0.04 on the GPU
  in one block. The food categories summed to 0.58 kg of the CPU's 1.1 kg of meals. It was not an engine mismatch: one white perch
  school's single lucky kill on one engine (≈ 80 × a 7-g fish).
- **Fix.** A school hunts as its n fish: the strike's hazard is × n (one kill a block at most), and a kill is shared, each fish
  gaining gr / n. A prey fits when its share fits the gut room. Both engines, both strike rules. The tallies count the prey's mass
  once. After the fix: white perch 0.05 · 0.05 kg, meals 0.6 · 0.5 kg, kills 34 · 32 (CPU · GPU).
- **Approximation.** One kill a block caps a big school when n × the single fish's chance is ≳ 1: at n·λ = 1 the members get 63 % of
  the linear rate. It is mass-conserving and errs on the predators' side.
- **Consequence.** Prey deaths to school piscivores were up to n-fold too few before. Every arm before 2026-10-22's AL ran with it.
- **Where.** fish3.js _strike2/_strike (nP), the feed caller (gk / n); wgsl.js k_strike (nP), k_strikeWin (gs); scratchpad
  g1_feedcv.txt, g1_head.txt, g1_r7.txt.

## 2026-10-22 — The plankton re-based on the field: the algae's P uptake and sinking by kind, the zooplankton growing from what they eat (Z1b, Z2)
- **What.** Following the diagnosis below:
  - the algae's P half-saturation is set to the field's 1 µg/L (was 10);
  - each algal kind sinks onto the bed at its own speed (greens 0.1, diatoms 0.5, resistant 0.1 m/day), replacing the greens-only
    0.33 m/day;
  - the die-off without the sinking is 0.08/day;
  - the copepods clear at 0.4 mL/µg/d;
  - the zooplankton grow from what they eat. Z1 cut Daphnia's clearance 3.9× and left their growth alone, so they grew about 190 %
    of what they ate. A Holling II with the field's clearance and maximum ingestion puts the half-saturation at Imax/F ≈ 0.48 mg C/L
    for Daphnia (was 0.15) and 0.36 for copepods, whose growth falls to ε·Imax 0.18/day.
- **How.** scratchpad probe z2year.mjs: the 1/10 lakes with fish for 98 days from yf 0.2; the true-scale lakes without fish for a year;
  seed 611.
- **Evidence.**

  | | Before (Z1) | Z1b + Z2 | Field |
  |---|---|---|---|
  | Edible algae dip, through the Daphnia peak | ~180× | 2.6–3.5× (4.4× at the late-summer low) | 1.5–3×, rarely 5–10× |
  | Rotifers at the Daphnia peak | 10–30/L | 370–480/L | ≥ 100–250/L |
  | Daphnia peak | 115–595 µg/L (no-fish runs) | ~100 µg/L | — |
  | Crustaceans, summer | up to ~1,100 µg/L | 100–180 µg/L | 50–150 µg/L |
  | Resistant share, late summer | 90–98 % | 47 % | median 58 %, IQR 28–85 % |
  | Summer dissolved P | 2.5 µg/L | ≲ 0.5 µg/L | ≲ 0.5 µg/L |

  - Secchi is 3.3–3.5 m.
  - The bed receives 20–40 % of production (field 20–50 %).
  - Winter bottom O₂ ≥ 5.2 mg/L (was 4.5).
  - The young grow faster (larvz_z2 against larvz_z1, mid-August): perch 25 against 20 mm, white perch 19 against 17, pumpkinseed 11
    against 7, bass 48 against 43, with more of them alive.
- **The burial refitted (Z2_BURY).** With every alga settling, the lakes kept 0.61–0.64 of their P at BURY_MUL 0.10 (field
  0.28–0.54), and July TP was 3–5 µg/L. At 0.05: R 0.48 by year 2 with the inventory steady, July TP 5.6 µg/L (probe bury2, the true lakes'
  50-m grid, seed 403).
- **Open.**
  - Summer TP: still ~5–6 µg/L against the reference 12 — the P cycle's seasons need a look.
  - Daphnia fall after their peak at ~0.06/day (field 0.1–0.2).
  - Copepods are still ~2× the region's ~20–30 µg/L.
- **Where.** config ZOO3 Z1_K_D, Z2_*; chem3 _algae (KPa, lys), _sedimentP (Z2 sinking), _zooplankton (gKc); fish3 stageR5; research
  note copepod_grazing_and_p_kinetics.md.

## 2026-10-22 — The late-spring algae crash was not Daphnia: a 2-D settling rule left on one algal group handed the summer to the ungrazed group (probe algbud, Z1 in the tree)
- **What.** After Z1 cut the cladocerans' clearance to the field's ~1 mL/µg/d, the edible algae still fell ~180× (0.55 → 0.003
  units) between mid-May and mid-June. A budget of the edible algae shows the grazers were not the cause of the fall. Three things were:
  1. **The bed's capture of settling algae (SED_P.SETTLE) drained the greens alone**, at a sinking speed of 0.33 m/day. That came
     on top of their 0.15/day die-off, which the config already describes as "sinking and lysis". The rule is the 2-D model's, from
     when the greens were its only algae; the diatoms and the grazing-resistant algae added since never settled.
  2. **The P half-saturation, NUTRIENT.KP 0.10 units**, is ≈ 10 µg/L of dissolved P (1 unit ≈ 100 µg/L at the lakes' reference
     TP). So the algae ran at 8–22 % of their P-saturated growth all of June.
  3. **With Daphnia at field clearance, the copepods became the main grazer.** Their GR_C/K_C gives ~1.6 mL/µg/d, more than the
     corrected Daphnia.
- **How.** scratchpad probe algbud.mjs (true-scale lakes, no fish, seed 611, from yf 0.2). Each week it reports the edible algae's
  per-capita rates: net growth (chem3 _algae), the grazing by each grazer (_zooplankton, measured and split by each grazer's
  ingestion), the mussels (littoral3 _mussels), the settling (_sedimentP) and the residual.
- **Evidence (/day, algae-weighted).**
  - Weeks 1–3: settled 0.079 → 0.034 (≈ 0.15/day of the greens alone), mussels 0.025–0.032, all four zooplankton grazers 0.01–0.04.
  - The greens went 0.28 → 0.15 → 0.04 → 0.000 by day 28. Over the same weeks the resistant algae, at half the greens' growth rate
    but neither grazed nor settled, held and then rose 0.13 → 0.43: ~95 % of the summer algae, against the field median of 58 %.
  - Lowering KP to 0.02 alone, or the copepods' clearance to ×0.25 alone, does not stop the crash.
  - Letting every kind settle at the greens' rate (CHEM3.SETTLE_ALL) crashes them all: total algae fall ~13× by late June. The
    0.33 m/day speed plus the 0.15/day die-off counts sinking twice.
- **Lesson for the model.** When a group is added beside an old one, every loss rule written for "the algae" has to be re-read for
  which arrays it touches. A loss left on one group is a competitive handicap, and the competition then shows its effect on that
  group as something else: here, a "clear-water phase".
- **Where.** chem3.js _sedimentP (the CHEM3.SETTLE_ALL option, off); config PHYTO.DECAY_PC, SED_P.SETTLE, NUTRIENT.KP, PLANKTON.GR_C;
  research note copepod_grazing_and_p_kinetics.md (pending). The re-base (one sinking term per kind at its field speed, die-off
  without sinking, the field P half-saturation, the copepods' field clearance) is next.

## 2026-10-22 — A canopy that grows by the light at its top colonises below the field's limit; the weed beds' extent (E12b)
- **What.** The second summer's weed stands covered 51 % of the bed against the research's ~15–17 % (macrophyte_area_cover.md), the
  canopy to 3.4 m against 2.0–3.0 m in coloured water. Three model artifacts and one inferred value carried most of it:
  - growth by the light at the canopy's TOP: a large-leaf stand seeded at 3.5 m, its top near the surface, paid its whole canopy —
    while the field's limit (Chambers & Kalff's 21 %) is the light at the deepest rooted plants' BED;
  - each canopy species self-shaded on its own leaves only, so four pondweeds in a cell carried ~four stands' worth;
  - every cell of a species' range was all room (a sand/mud flag), so the rocky shallows held full stands, and a rosette lawn and a
    canopy filled the same sand;
  - Robbins' pondweed's light limit 0.11 (the charophytes' value; inferred) — its clear-water colonies sit at the angiosperms' ~21 %.
- **Fix (plants3.js; no rate scaled).** PCLake's light integral over the canopy through the water and all the canopy's leaves; the
  rooted canopy at 21 % of the light at its bed; each species' room per bed cell from the E1 substrate map; the canopy's shade on the
  rosettes and meadow; the ice's reach into the bed (Duarte's 0.75–1.25 m). The generated starts regrown.
- **Evidence (no fish; probe e12b/probe.mjs, gate plants seed 541).** The second summer from the uniform seeding 51 → 29 % of the lakes'
  bed, canopy 3.4 → 2.5 m; from the bare seeding, August stands 24 / 22 / 22 % in years 3–5 (canopy edge 2.3 → 2.0 m); the regrown start
  16 % in mid-July. By depth band the 2–4-m bed now matches the research; the 0.5–1.5-m band still fills (0.6–0.95 vs ~0.25–0.4).
- **Lesson.** A depth limit measured at the bed must be applied at the bed: a light rule on a canopy's top turns the canopy's own
  height into a positive feedback that carries it past the field's limit. And a logistic stand with a propagule in every cell fills
  every cell its light and bed allow — the field's patchiness inside the reach (presence 84–88 % in the sim against 35–45 %) needs a
  mechanism the model does not have (clonal spread; no rate researched).
- **Where.** plants3.js (FORMS3 SC lightLim, PL3 ROOM_MIN, ICE_BED, the E12b comments in _grow); test/w3.mjs plants (E12b check and
  the presence GAP); docs/HOT_BROOK_3D.md §5 "Built (E12b)"; docs/review/ECOSYSTEM_BUILD.md E12.
## 2026-10-22 — Arm AI: no winterkill, but no year class either; the community shrinks by a quarter a year (GPU, true scale, 19edb3a)
- **What.** Arm AI ran the package at 19edb3a: N_FORM, the herps and tadpoles, the anglers and Y1. Two seeds (611, 613), two years
  each from mid-May. Fish biomass in kg/ha:

  | Seed | Start | End of year 1 | End of year 2 |
  |---|---|---|---|
  | 611 | ~97 | 69 | 44 |
  | 613 | ~97 | 71 | 51 |

  Arm AH, before N_FORM, had fallen to 43 by the end of year 1. The late-winter hypoxia is gone.
- **Still no recruits.** Every species' young-of-year fail in both years. In year 2 (seed 613) the young hatched and died as follows:

  | Species | Hatched | Natural deaths | Starved | Eaten |
  |---|---|---|---|---|
  | Yellow perch | 113 M | 34 % | 20 % | 45 % |
  | White perch | 438 M | 51 % | 23 % | 25 % |
  | Smallmouth bass | 5.5 M | 15 % | 57 % | 26 % |
  | Brown bullhead | 14 M | 6 % | 57 % | 37 % |

- **The prey carry the predators.** By year 2's end, pumpkinseed, redbreast, killifish and dace are gone, perch fell 12 → 3–4 kg/ha
  and white perch 17 → 5–6. Bass rose 9 → 12–13 kg/ha and suckers held.
  - From the first fortnight the followed prey were eaten fast: 70 % of the killifish in 14 days, half the sunfishes in six weeks.
  - The bass's and pickerel's diets ran 83–95 % fish, ~0.3 fish a predator a day.
  - With no young-of-year big enough to eat, the small adults are the predators' only fish.
- **The plankton** (seed 611): year 1 opens with a spring Daphnia surge (210 µg/L) that grazes the edible algae to ~0 and crashes the
  rotifers. In year 2 the rotifers peak at 9 µg/L in early June, then fall to 0–6 µg/L over the summer (field 2–24).
- **Where.** scratchpad r22AI_611.txt / r22AI_613.txt (yrsum.mjs); the young's failure is diagnosed in the next entry.

## 2026-10-22 — The perch census set the larval excess; at field larval densities the young still grow 2–4× too slowly (probe larvz, d2e735d)
- **What.** The census put yellow perch at 500/ha ≥ 7.5 cm, above its own soft-water comparables (Crystal and Nebish lakes,
  230–240/ha). The human, asked, says perch are "scarce at any size", ~50–100/ha. At 500/ha, ~50 perch larvae swam per m², and with the
  white perch's ~30 the larvae swamped their predators and ate the rotifers out.
- **A/B** (1/10 lakes, seed 611, from early May, the package; perch 500 → 75/ha):

  | Quantity | perch 500/ha | perch 75/ha |
  |---|---|---|
  | Perch larvae at the peak | 48/m² | 2–6/m² |
  | All larvae at the peak | ~77/m² | ~43/m² (white perch 30–37) |
  | Fish predation on perch larvae, Z | 0.02–0.03/d | 0.006–0.03/d (fewer adult perch to eat them) |
  | White perch young, mid-August | 0.2/m² at 8 mm (their early cohorts gone; a late one at 4 mm) | 0.9/m² at 11 mm |
  | Perch young, mid-August | 3.5/m² at 15 mm | 0.9/m² at 16 mm |
  | Pumpkinseed young | stalled at 5 mm | stalled at 5 mm |

- **Settlement checked.** Every larva the fish request is removed (probe larvsettle.mjs: requested = removed each day; the gut's room
  short ~0 times a day). The diagnostic larvdiag.mjs had read the fish's Z on perch larvae as 0.008/d because it counted only the
  swimming larvae as eaten; the yolk-sac larvae eaten are tallied with the eggs. The real Z is 0.02–0.05/d.
- **Reading.**
  - The census was the larval excess's main input. Its correction leaves the larvae inside the field's ≲ 10–40/m² once the white
    perch's early cohorts thin.
  - Growth is the remaining failure. Perch ~0.12 mm a day (field 0.3–0.5) and white perch ~0.09 (field 0.2–0.3), so perch are 16 mm in
    mid-August where Oneida's are 37–65 mm on 1 August. The feeding level is p ≈ 0.2–0.3 where field growth needs ~0.5.
  - A cohort below maintenance shares its food equally, so it neither grows nor dies; field larvae grow or die within days.
- **Next.** The young's unequal shares (FRY.FEED_CV, built and off, values being researched); what holds the 9–16-mm larvae's
  feeding at p 0.2–0.3 (their prey ladder, K, the summer zooplankton with fish).

## 2026-10-22 — A predator's rate set from a snapshot of its prey over-harvests; a lab hatch rate over-stocks the larvae (3a2df18)
- **What (E4, the wildlife).** Ospreys, eagles, herons and the rest take fish at a per-fish hazard ρ = D / (A + K): D is the day's
  need, A is the biomass they can reach, and K is a day's need. A was read at the start of each block. When a block began with few
  fish near the surface, ρ came out high, and every fish that rose into reach during the block was taken at that rate.
  - Over a late-July fortnight the birds took 128 % of their need.
  - The gate of af3723e failed E4 at 4.4 of 3.6 kg; a local run gave 4.6.
- **Fix.** ρ now uses the larger of A and A's running mean over F3.WILD_TAU = 1 day: the reach as a forager learns it, not as one
  instant shows it. Both engines have it: the CPU in fish3 `_wAe`, the GPU in `k_wildRho` with the mean in GL[160..].
  - After the fix: 3.3 of 3.6 kg (92 %); ospreys 0.4 kg, eagles 0.2.
- **Lesson.** A type-II predator coupled to a stepped prey field needs the prey it *expects*, not the prey of one instant. Otherwise a
  short dip in reach turns into a burst of over-harvest when the prey come back.
- **What (EGG3, the alewife).** The sea-run alewives' eggs hatched at 0.6, and their larvae swam at 62/m² in Lower Hot Brook Lake.
  - The best hatch the research reports is 38 %, in the lab near 17.8 °C (Edsall 1970; corrected 2026-10-29 from "Kellogg 1982",
    whose numbers in the note are the 36-h egg mortality and the incubation points).
  - On a lake bed it should be lower: white perch eggs hatch 0.8 in the lab and 0.45 on the bed.
  - At hatch 0.2 the larvae peak at 19/m² and reach 7–10 mm by mid-July, against 5–7 mm before (probe larvz). The larvae competing
    for the same rotifers had held each other back.
- **Where.** fish3.js F3.WILD_TAU (comment); config EGG3; test/w3.mjs E4; docs/review/ECOSYSTEM_BUILD.md E4/E8.

## 2026-10-22 — The inflow's nitrogen as ammonium nitrified a third of the lakes' winter O₂ (probes o2budget.mjs, winter.mjs; arm AH)
- **What.** Arm AH lost a third of its fish biomass (70 → 46 kg/ha) in February–March to late-winter hypoxia: the deep bottom at
  1.5 mg/L. A fishless package winter drew the lakes' mean O₂ to 1.6 mg/L by April, with 72–81 % of the water under 2 mg/L.
- **The budget under the ice** (January–February, g O₂ per m² a day; probe o2budget.mjs):

  | Process | g O₂/m² a day |
  |---|---|
  | The bed's demand | −0.255 |
  | Nitrification | −0.152 |
  | Bacteria on DOM | −0.043 |
  | Algae | −0.031 |
  | Plants | +0.014 |
  | Total | −0.45 (field under-ice demand 0.2–0.39) |

- **Cause.** The inflow carried ~3/4 of its dissolved inorganic N as ammonium (~400 µg/L). A forested northeastern stream's is
  mostly nitrate, with ammonium ~5–20 µg/L. Nitrifying ammonium costs 4.6 g O₂ a g of N.
- **Fix.** CHEM3.N_FORM, in the package: the same N in, 5 % of it ammonium. Three seeds' winters (coarse grid, fishless):
  - the lakes' lowest mean O₂ 2.8–4.7 mg/L, median 3.5, against 1.1–3.0 with the ammonium inflow;
  - a harsh winter (seed 611) still reaches ~2.
  The base world hid this: its ice passed a fixed 40 % of the light, and under-ice photosynthesis offset the demand. E10a's
  realistic light (0.2–3 %) exposed it.
- **Lesson.** Inflow chemistry by form matters as much for oxygen as for nutrients: a stream's nitrogen form is a winter O₂ term.

## 2026-10-22 — No year-class recruits: the young starve in their first summer (arms AF/AG/AH; probe sunlarva.mjs)
- **What.** In every true-scale arm, year 1's "period's young" had 0 % recruited, for every species. So each year the populations can
  only shrink, which is the deeper half of the "year-2 collapse". Arm AG (9229a90, seed 611):

  | Species | Hatched | Starved | Eaten | Natural deaths |
  |---|---|---|---|---|
  | Smallmouth bass | 4.4 M | 48 % | 39 % | 13 % |
  | Pumpkinseed | 99 M | 46 % | 20 % | 34 % |
  | Redbreast | 34 M | 46 % | 22 % | — |
  | White perch | 1.7 billion | 16 % | 31 % | 53 % |
  | Yellow perch | 434 M | 8 % | 57 % | — |

  The young's diet is ~100 % zooplankton. None reached the bed's or the weeds' fauna.
- **Where it fails** (probe sunlarva.mjs on HEAD, 1/10 world, seed 611, from early June):
  - Pumpkinseed young sit over water deeper than 2 m (69–97 % of them), get 12–57 % of their wanted ration, and stall at 5–6 mm for
    two months.
  - Smallmouth young reach 16–17 mm, eat at 25–46 % of their potential, and are gone by mid-July.
  - The rotifers, the first feeders' food, crash to ~0 µg/L from late June and stay there. Summer's edible algae are grazed down,
    the grazing-resistant algae dominate, and Daphnia's interference (~200 µg/L in early June) finishes them. Field mesotrophic lakes
    with Daphnia keep rotifers through summer.
- **Note.** The year runner's per-period "young's fates" line had been reading tally slots that the tally map had since moved (fixed).
  The year-end "period's young" line was right.
- **Measured on af3723e** (probe larvz.mjs, 1/10 world, seed 611, from early May):

  | Quantity | Sim | Field (young_first_summer.md §7) |
  |---|---|---|
  | Swimming larvae per m² | yellow perch ~50, white perch 26–37, alewife 62 (~150 all, ~50 per m³) | ≲ 10–40 all, ≲ 0.1–5 per m³ a species |
  | Newly hatched perch, Z | 0.009 a day | sunfish 0.1–0.4 a day in their first days |
  | Larval Z | 0.04–0.11 a day | 0.05–0.3 a day |
  | Larval growth | 0.06–0.1 mm a day, pumpkinseed stalled at 5 mm | 0.2–0.5 mm a day; a starving larva dies within days to two weeks, never stalls |

  Pumpkinseed and redbreast young have no shelf limit (S3 yBed), so they follow the zooplankton offshore; the field puts them
  in the weedy bays. The bed's food starts at 2.5 cm (FRY.BENTH_L); the field's switch is 9–20 mm.
- **Reading.** Too many larvae survive their first days. They then deplete the small prey and stall at about maintenance instead of
  dying fast as field larvae do (the critical period), so nothing grows into the safety of size.
- **The rotifers' budget** (probe rotbud.mjs, 1/10 world, seed 611, per capita a day):
  - Fishless, mid-June: the Daphnia peak (268 µg/L) costs them 0.29 a day while the clear-water phase takes their edible algae
    (0.52 → 0.002). They crash 480 → 8 per litre, then recover slowly from the floor (41/L by mid-August; field 270–470).
  - With fish: the same crash, then 2–7 per litre all summer although their net growth is +0.12 a day. The larvae eat all that is
    made. So the crash is a symptom of the larval excess as much as a cause.
  - Y1 (the sunfishes' young on the weed shelf, the bed's food at 1–1.5 cm) moved the pumpkinseed young inshore (beds 1.5–2.3 m,
    was 2.7–3.4), but they still stalled at 5 mm: at 5 mm their food is the rotifers and nauplii.
- **Next.** The first days' mortality by mechanism (first-feeding failure, the invertebrates' predation — L1 cyclopoids — and the
  fish's — L2); the sunfish's weedy-bay habitat; the diet switch at 9–20 mm.

## 2026-10-22 — With the literature's P forms the lakes turn ultra-oligotrophic: the mesotrophic analogue needs more available P (E9e trial; probe e9e.mjs)
- **What.** A stream's total P matches the sim's inflow: field ~13 µg/L (8–20), sim ~14 (catchment_P_loads.md). Its forms do not. The
  field has phosphate ~2 µg/L, dissolved organic P ~6 (about a quarter available to algae) and particulate P ~5 (about a fifth available
  once settled). The sim's inflow was 94 % phosphate, about 3× the field's algae-available P.
- **Trial.** CHEM3.LOADS ran the field's forms, with particulate P ∝ Q^0.6 (the wettest tenth of days carrying ~71 % of it), the air's P
  and the spring pollen. A fishless year on the 1/10 world (seed 611), each quantity off → on:

  | Quantity | Off | On |
  |---|---|---|
  | Summer TP | 8–9 µg/L | 3.9 µg/L by October, 2.3 by the next May |
  | Summer algal P | 3.5–5 µg/L | ~1 µg/L |
  | Daphnia | 35–113 µg/L | ~1 µg/L |
  | P inventory | 83 % | 42 % |
  | R | 0.32 | 0.73 (mostly the inert particles buried) |

- **So.** Fed only what the literature's fractions make available, the lakes would sit near 2–4 µg/L of available P, far below the
  coloured-mesotrophic analogue (TP 9–13, chlorophyll 3–8). One of these must hold, and only a Hot Brook measurement can say which:
  - the catchment exports more (wetlands 0.10–0.20 kg/ha/yr against forest's 0.02–0.04);
  - the bed's internal loading is larger (Webber Pond: internal = external);
  - these lakes' available fractions are higher.
- **For now** the all-available inflow stays: an effective calibration to the analogue, documented as one. E9e stays behind its flag
  (CHEM3.LOADS 0), ready for when the trophic state is known.
- **Lesson.** Matching a lake's total P inflow is not enough. The form decides what the algae can use, and here it changes the trophic
  state.

## 2026-10-22 — The P-retention target was the formula's complement (probe bury.mjs; true-scale world, 2 seeds)
- **What.** The bed's burial (CHEM3.BURY_MUL) was calibrated so the lakes kept 0.66–0.72 of their P load, citing "Larsen–Mercier
  R = 1/(1+√τ)". The formula is R = 1/(1+√ρ), with ρ the flushing rate (1/τ). 1/(1+√τ) is Vollenweider's P_lake/P_in, the share that
  leaves.
- **The field's retention for these lakes** (τ 0.27 and 0.15 years, mean depths 3.0 and 2.55 m): Larsen–Mercier 0.34 / 0.28,
  Kirchner–Dillon 0.54 / 0.49, Nürnberg 0.52 / 0.43, Brett–Benjamin 0.38 / 0.32. So about 0.3–0.55, not 0.7.
- **The bed's exchange is grid-dependent.** On the gate's coarse 100-m grid the bed-touching cells hold 32 % of the water, against 21 %
  on the arms' 50-m grid. The same setting buried 0.70 of the load there and 0.42–0.56 on the 50-m grids. Calibrate on the grid the
  runs use.
- **Re-fit on the true world** (the new weather, no fish; first year):

  | `BURY_MUL` | R (seeds 403 / 404) |
  |---|---|
  | 0.15 | 0.56 / 0.45 |
  | 0.10 (adopted) | 0.44 / 0.35 |
  | 0.07 | 0.35 / 0.27 |

  The lakes start at 12 µg/L TP, above their own steady state (~8 µg/L in July for this inflow), so year 1 still loses P: 4 % in a
  normal year, 13 % in a wet one, where the outlet carried 71 % of the load.
- **Year 2 at 0.10.** R 0.45 / 0.39, and burial and net import balance ((in − out) ÷ in 0.41 / 0.42). The inventory moves −7.8 % and
  +5.1 % with the year's weather, at 88–91 % of the start after two years. July TP is 6.8–7.5 µg/L, under the 9–13 µg/L of the
  coloured-lake analogues. The inflow's TP and its form are E9e.
- **Lesson.** Check which side of a retention formula a calibration targets, and whether the variable is the residence time or its
  inverse.

## 2026-10-22 — A month-long sky cycle starved the lakes of water and phosphorus (E9d; probes nutr.mjs, surf.mjs, wx.mjs, wx2.mjs, wxfit2.mjs)
- **What.** Arm AF's lakes starved in their second year: summer Daphnia ~0, and edible surface algae 0.002–0.07, where year 1 had
  0.1–0.47. A no-fish probe found the P inventory at 45 % of the start by late January. Over those 252 days the inflow had brought
  3,163 units of P while the bed buried 9,862. The catchment's flow sat at 0.01–0.08× its mean from July through February
  (gauges: 0.3–1.4×).
- **Cause: the sky's timing, not its totals.** The 3-D world inherited the 2-D sim's 4-state chain (clear, cloudy, rain, storm). Its
  shares were plausible, but self-loops and rain ⇄ cloud returns made a ~27-day cycle: a 10-day wet spell, then a 20-day dry one
  (the longest 201 days). Months went without rain beside 270-mm months (monthly CV 0.99), and no day passed 22 mm. On HBV's soil
  this gave a catchment whose median day ran at 0.16× the mean flow.
- **E9b's "summer too wet" was the same artifact.** Rare 9-day rains inflated the monthly means while the typical day was near zero.
  The diagnosis then (the conifers' interception) was wrong.
- **Evidence and fix.** Houlton's daily record (NOAA GHCN-D, 1991–2020; houlton_daily_precipitation.md): wet 39 % of days, P(wet|wet)
  0.50, spells 2.0 / 3.1 days, 6.9 days a year ≥ 25 mm, monthly CV 0.44.
  - A front cycle (clear → cloud → rain → storm → clearing) with per-episode gamma(2) intensities reproduces it: 40 %, 0.52, 2.1 / 3.1
    days, 6.5–6.8 days, monthly CV 0.49–0.51, the wettest 1 / 2 / 7 days 54–57 / 75–79 / 100–103 mm (56 / 69 / 95). It keeps the old
    chain's mean light.
  - **Storms bring warm air.** Houlton's winter wet days run +4–5 °C over the month's mean and its dry days −2. With independent air
    anomalies only ~15 % of December's precipitation fell above 0 °C (field 50 %).
  - Refitting HBV inside its ranges then gave the gauges' hydrograph: August 0.40–0.60×, January 0.59–0.71×, recession 0.85–0.87 a
    day, runoff 582–592 mm.
- **Result** (arm AH, f99d216 = E9d + BURY_MUL 0.10, seed 611, two true-scale years), each year then the next:

  | Quantity | Year 1 | Year 2 |
  |---|---|---|
  | Summer Daphnia | 61 µg/L | 38 µg/L (arm AG: 59, then 2) |
  | Summer TP | 7.1 µg/L | 8.0 µg/L |
  | P inventory at the year end | 84 % | 85 % |

  The year-2 plankton starvation is gone. Its fish still fell (97 → 43 → 27 kg/ha), from the late-winter kill (N_FORM, next entry)
  and zero recruitment.
- **Lesson.** For a small lake's flushing and nutrient supply, the weather's sequence matters as much as its monthly totals. Calibrate
  a weather generator on daily statistics (spell lengths, extremes, monthly variance), not on means.

## 2026-10-22 — A fertilisation rate entered as a hatch rate made 30–300× too many sucker larvae (E3b; probe eggsm2.mjs)
- **The sucker's egg hatch (0.9) was Stewart's "> 90 % fertilised".** Field egg → drifting larva in a brook is 0.3–3 % (scour, silt, drift),
  and only 25–50 % of adult suckers spawn in a given year. The sim made ~30 larvae/m² against the field's < 1. With the field's values,
  3 % swim up.
- **White perch's 0.8 was a lab hatch.** Unguarded demersal eggs on a lake bed do worse: an estimated 0.3–0.6. Its swim-up fell from 59 %
  to 22–28 %, against the field estimate of 8–40 %.
- **The yolk-sac stage had an unsourced 0.95 survival, and no predators.** Field perch go from hatch to first feeding at 0.12–0.73, mostly
  to fish. The prolarvae are now prey on the bed.
- **The founding's seeded young bypassed it all.** seedSeason's spin applied only the background and thermal losses: 75 perch eggs
  and larvae per m² at a lake's opening.
- **Lesson:** check what each "hatch" number in a parameter table measures (fertilisation, lab hatch, field survival) — they differ 10–100×.

## 2026-10-22 — Fish eat larvae at the rate they clear zooplankton — and at the sim's larval densities they are swamped (L2; probes larvz.mjs, larvdiag.mjs)
- **The fish's larva-picking was 3–60× too small per predator** (fish_predation_on_larvae.md), worst for large predators:
  - the old rule was CLEAR_A·L^0.6 × LARV_A 0.1 × a detectability of 0.2 at 6 mm;
  - the field's clearance on larvae is about the visual planktivore's clearance on zooplankton, 3.42×10⁻⁷·L(cm)^2.94 m³/s (~L³),
    × 0.08–0.3 with natural zooplankton about;
  - small larvae are as catchable as large ones.
- **Rebuilt on that,** the fish's predation on larvae rose ~5× in a 1/10 June. Eaten Z, per day:
  - perch 0.003 → 0.015;
  - white perch about 0.03;
  - sunfish 0.03–0.05;
  - pickerel fry 0.07–0.12, against the field's ~0.08 total; the old rule gave 0.02–0.05.
- **The perch's potential is 5× more than the fish can take.** Their potential Z from the encounter rule is 0.07–0.1, but the predators'
  appetite takes only a fifth of it:
  - ~200 larvae/m² of all species meet a 15-cm perch at ~270 a day, ~2 g — its whole Cmax;
  - so predator swamping holds per-capita Z down while the larvae stay 5–20× the field's typical 0.3–15/m².
  - The excess sits upstream, in the larvae produced: the adult census × fecundity × egg survival (perch eggs hatch at 0.95 here).
- **Littoral fry are over-taken.** Bass fry after dispersal are now taken at 0.13–0.18/d against the field's 0.02–0.05. Overlap with
  rock and nest cover needs the prey's habitat, not only the predator's species.

## 2026-10-22 — A realistic egg stage exposed a larval mortality fitted to the wrong stage (E3, E2c; probes e2c.mjs, larvz.mjs; arm AF)
- **The larval background rate had been fitted before the egg stage existed.** FRY.M_LARVA3 (0.04/d at 1 cm) was fitted when a low hatch
  fraction (sHatch 0.05–0.6) quietly absorbed the early deaths. The egg stage put first-feeders at field hatch rates (3–10× more).
- **The result was larval hordes:** ~70 perch and ~110 white perch larvae per m² in the 1/10 lakes (67/m² of perch in the true lakes), against field peaks of 0.3–15/m² (exceptional 64–125). They
  strip the zooplankton, stall at 1–1.6 cm all summer and starve — one path to the year-2 collapse (arm AF: pumpkinseed, redbreast,
  killifish and dace gone; summer Daphnia 1 µg/L).
- **The field says the missing killer is fish, not the background** (larval_mortality.md):
  - in lakes with fish, larvae die at 0.05–0.3/d, 70–90 % of it to fish;
  - predator-free enclosures give 0.01–0.03/d.
  - The sim's explicit fish predation on perch larvae ran 0.0003–0.01/d, held down by FRY.LARV_A 0.1 — itself fitted down from 0.3 when
    "the panfish took 41 % of the suckers' hatch". A compensation calibrated on one outcome had disabled the main larval process.
- **Count-based larval feeding needs a size limit.**
  - Larval thresholds are counts (100–250 prey/L), so a µg of rotifers is worth ~12× a µg of crustaceans to a first-feeder.
  - Applied at every size, it let 8–15-mm fry strip the rotifers to 0.07 µg/L.
  - The half-saturations must fade to the crustaceans' as the young outgrow the micro-prey. The young Daphnia (0.5–0.8 mm) must stay within
    a small larva's reach.

## 2026-10-22 — A published parameter table read the wrong way round would have starved the alewives (E8)
- **The table and the sim used opposite conventions.** Stewart & Binkowski's alewife respiration has swimming speed rising
  5.78·e^(0.149T) to 22.08 cm/s at 9 °C, then holding. The research note's table put the two terms on the opposite sides of RTL from FB4's
  convention, as the sim implements it.
- **Read literally**, alewives would swim ~1 m/s at 20 °C. Their activity multiplier would be e^(0.03·97) ≈ 18, and their respiration
  above their maximum intake.
- **The check that caught it:** the two forms meet at RTL (5.78·e^(0.149·9) = 22.07). Continuity tells which side each pair belongs on.

## 2026-10-21 — The lakes' birds and mammals take ~6 % of the fish a year, and the old "other mortality" was counting them twice (E4; arm AD)
- **What.** With the nine fish-eating wildlife populations at their Maine densities (loons, herons, kingfishers, ospreys, the eagle
  pair, both mergansers, otter, mink — ECOSYSTEM_BUILD.md E4) taking their daily need from the fish they can reach (Holling II, K a
  day's need), one true-scale year took ~2.9 t of fish from the lakes' ~48 t: loons 1,061 kg (mostly yellow perch), common
  mergansers 437, mink 388, herons 289, kingfishers 240, ospreys 213, eagles 166, otter 63, hooded mergansers 46.
- **The double count.** The adults' unsimulated mortality BIOE.M_OTHER (0.5 of each species' M) was defined as "disease, parasites,
  birds and mammals besides the loon, angling". The wildlife's kills against each species' remaining 'other' deaths: perch 0.61,
  pumpkinseed 0.66, redbreast 0.43, bass 0.34, pickerel 0.21, fallfish 0.20, white perch 0.18, bullhead 0.16, sucker 0.09 — and the
  banded killifish 2.6× its whole old allowance (small, shallow, schooling: every bird and the mink can reach them). The share is cut
  by that ratio per species (stageR5): a mechanism replacing the stand-in, not stacked on it.
- **How.** GPU year runner, f3.WILD=1, seed 611 (r21AD_611.txt); the tallies T_WILD/T_YWILD.

## 2026-10-21 — Summer Daphnia at 3–5× the field starve the small zooplankton; the rotifers' own fix is not enough (E2a; probe e2.mjs)
- **What.** Giving the rotifers their measured rates (K. cochlearis: rmax 0.28/d, zero growth 0.6 of Daphnia's food) and a microbial
  food (bacteria grown from the DOM the model decomposes, BGE 0.26) raised their summer biomass 2–20× — but only to 0.1–3 µg/L against
  the field's 2–10, because the Daphnia sat at 200–370 µg/L all summer (field summer crustaceans 45–100) and grazed the algae and the
  new bacteria (to 6–24 µg C/L against the field's 35–85) to almost nothing. The diel-migration refuge is not the cause (it is ~0 in
  lakes this shallow, as the research says it should be). Candidates the model lacks: calcium at 2–4 mg/L near Daphnia's limit, P-poor
  food (seston C:P), inedible algae, invertebrate predators of Daphnia (research launched: daphnia_summer_limits.md).
- **How.** 1/10 lakes from mid-May, 120 days, ZOO3.MICRO on and off, seed 611.

## 2026-10-21 — A winter thaw lifted the whole lake's ice in a day (E10a, a bug the weather exposed)
- **What.** With real air-temperature swings (E9a: January's daily SD ~6 °C), a +4 °C thaw pushed the water's target over the ice's
  melt threshold and the cover vanished in mid-January. The ice rule had keyed melting to the water's seasonal target, which never
  swung before. With the ice's thickness modelled (Stefan's growth, the snow on it, slush to white ice), the cover now goes only once
  the ice has melted through; a two-day +12 °C thaw leaves it (gate check). A lake opened on 1 March starts under ~71 cm of ice and
  its snow, ~0.25 % of the light through (Maine measured 1–12 %; the old fixed 40 %).

## 2026-10-21 — A catchment on Houlton's normals gets the snow and the freshet right but the summer too wet (E9b)
- **What.** HBV's structure on the weather chain's rain and snow (Houlton 1991–2020 normals): 180 years give precipitation 1,019 mm
  (998), runoff 575 mm (field 580–710), the snowpack's water ~225 mm at its peak (~230), gone ~19 April (late March – late April),
  April's flow 3.5–4× the mean (3–4×). But August's flow stays 0.5–0.9× the mean against the field's 0.2–0.4× under every soil and
  groundwater setting in HBV's ranges — even with the summer's transpiration at its potential. The likely missing loss: the
  conifers' interception (20–30 % of summer rain evaporates from the crowns). Known gap, not tuned away.

## 2026-10-21 — An adult bioenergetics set cannot grow a larva: the pickerel's missing year-classes (arm Y; scratchpad probe ypike.mjs)
- **What.** In the true-scale arm Y (seed 613) chain pickerel fell from 16,090 fish to 1,258 in under two years with 18 recruits in
  the first year: every year-class died as larvae. The young pickerel stayed at 0.9 cm for six weeks after hatching in early May
  (water 5–15 °C), starving at 29–52 % a fortnight, and then grew ~0.3 mm a day — 1.5 cm on 1 July, 4.4 cm in late September against
  the field's 25–40 mm at the end of June and 100–130 mm at the end of September (Underhill 1949 via Scott & Crossman; MDIFW
  102–127 mm) — so they spent the whole summer at sizes every panfish eats (eaten 17–39 % a fortnight) and never reached fish (5 cm).
- **Why.** The young run on the adult FB4 northern-pike set (Bevelhimer et al. 1985; consumption mass exponent −0.18). At a 2-mg
  larva it gives an appetite close to the measured (29 %BW/d at 15 °C, 42 % at 18 °C; pike larvae ~30 %/d at 13–16 mm, Grès et al.
  1996) but, with its respiration and waste, a full ration grows the larva only 0.05–0.10 mm a day below 15 °C and 0.2–0.3 at
  18–21 °C. The same functions grow perch larvae 0.2–0.5 mm/d and bass 0.2–0.95. The predators, the zooplankton and the young's
  habitat cannot rescue a fish whose energy budget is negative or flat at the temperatures it hatches into.
- **Which part fails (docs/research_notes/Predator winter energetics/esocid_larval_energetics.md).** The set was fitted on 9–53-g
  pike eating minnows. Its respiration is within 5–27 % of first-feeding pike's at 15–25 °C, but with too shallow a temperature slope
  (Q10 1.73 against the larva's 2.5, Woynárovich 1960) — the adults' ×0.5 winter cut had stood in for that. Its consumption ceiling
  is 1.2–2.6× short below ~0.1–0.3 g: its mass exponent −0.18 against the larval growth exponent −0.24 (Wieser et al. 1992).
- **Fix, from measurements only.** Below 10 g (the fitted range's floor) the young pickerel run on the same set with Cmax ∝ W^−0.24
  (continuous at 10 g), respiration Q10 2.5 (equal to the adult's at 22.5 °C; the winter cut off for it) and FB4's juvenile esocid
  losses (FA 0.13, SDA 0.14). Unfitted, a 1.25-cm larva at a full ration of zooplankton then grows 0.23 / 0.31 / 0.49 / 0.71 / 0.92
  / 0.98 mm/d at 10 / 12 / 15 / 18 / 21 / 24 °C against the measured 0.25 / 0.45 / 0.48–0.65 / 0.64–0.82 / 0.68–0.96 / 0.80–1.21
  (Górny 1992; Fey & Greszkiewicz 2021). At 1/10 scale the first week's starvation fell from 18.5 % to 0.2 % and the larvae grew
  0.92 → 1.22 cm (from 0.92 → 0.92) — though there they were still eaten at 64–91 % a week (the 1/10 strip packs the panfish 10×).
  Their cover preference (yCover 0.8: Grimm 1994; Casselman & Lewis 1996), switched off when the young in the weeds "recruited
  less", is back: they recruited less because they could not grow.
- **Why it matters.** Bioenergetics sets are fitted over a size range; extrapolated to larvae — four orders of magnitude lighter —
  they can fail silently, and the failure surfaces years later as a missing species, read as predation or habitat.

## 2026-10-21 — The ecology broke the engine: fish crowding into wintering water hung the GPU (c08b186)
- **What.** Two true-scale three-year runs (arms X and Y, seed 613) lost the GPU at the same block (53592, the fourth spring's
  recruitment) with DXGI_ERROR_DEVICE_HUNG. The spatial grid put each cell's agents in index order with an insertion sort, one GPU
  thread a cell, written for cells that "hold a few"; by the fourth winter the deep basin's wintering cells held ~1,400 agents (from
  ~250–700 in earlier winters), and each young school's recruits are placed within 0.6 m of it — one thread's n² work passed the
  operating system's 2-second watchdog. A Shell sort gives the identical order at ~n^1.25.
- **Why it matters.** An agent model's data structures carry assumptions about the ecology (fish spread out); the emergent
  behaviour (aggregation at wintering sites, as real fish do) can violate them years into a run, deterministically, with a symptom
  (a driver reset) that reads as hardware.

## 2026-10-21 — Two rules for one fish, again: the young-of-year were 1,700× harder to find and caught by another window (R4·6)
- **What.** A followed piscivore met the young-of-year schools through the percid cannibals' DAILY clearance (~15 m³/day for a 45-cm
  pickerel) and the followed fish through its in-bout encounter volume (π·RD²·(U + v) × the time it hunts: ~27,000 m³/day), and it
  caught the young by a perch-cannibal window peaking at a prey 19 % of its length (0.0015 at 6 %) where the followed fish met the
  strike rule's capture success, highest for the smallest prey. A 40-cm pickerel weighed a 4-cm young perch at 0.12 against 0.58 as a
  followed fish, a 2.5-cm young pumpkinseed at 0.001 against 0.21; the field's piscivores eat prey of a median 10–20 % of their length
  and their smallest prey barely rise with their size (Gaeta et al. 2018). So the spring's recruits and every small adult bore the
  predation the field puts on the year's young, and bass of ages 1–6 vanished in every arm.
- **Fix.** One encounter volume (F3.YENC), one capture success (YWIN_CS), each attack on the young against the same strike ceiling
  (h = 1/aMax), and every prey — young or followed — seen at its own reaction distance by the visual model R²·e^(cR) ∝ L² (Aksnes &
  Utne 1997; RD_SIZE), which a size window had stood in for.
- **Evidence.** Six weeks at 1/10 scale: pickerel and bass ate 0.12 kg of young on the old rule, 0.91 kg with the one volume, 1.08 kg
  with the whole rule. A 140-day screen on three seeds (509, 611, 613): pickerel ate 2.1–2.9× and bass 2.3–3.1× the young of the
  one-volume rule, while their kills of followed fish (pickerel 0.06–0.19 a day) and rations (p 0.27–0.45) hardly moved.
- **Why it matters.** An individual-based model that represents the young as super-individuals must give them the same predator
  physics as the individuals; otherwise the predation shifts to whichever representation is easier to find, and the diet tables
  still look plausible.
- **…and the whole physics, schooling included (arms AA, AB).** With the encounter volume, the capture success and the reaction
  distance shared but the young met as evenly spread fish, a true-scale year (arm AA, seed 611) ate young yellow perch at Z 0.05–0.16/d
  by July (25 M → 2 k by August), against Oneida's ~0.035/d all told. A followed school is met as n^0.65 fish by an esocid, confuses a
  bass (× n^−0.6) and cuts a perch-like predator's capture to 0.15; given the same terms by their species' school size (F3.YSCHOOL),
  the young perch died at 0.009–0.034/d all told (2.1 M at 6.3 cm in late September), white perch at 0.016–0.046 (field larvae
  0.03–0.08), and young bass at 0.045–0.09 eaten — inside DeAngelis et al.'s young-smallmouth curve and the field's 1–4 % from egg to
  autumn. Each shared piece alone moved predation the wrong way; only the complete rule landed in the field's range.

## 2026-10-21 — Compensations stack: every fix for a missing mechanism outlives it (docs/review/audit_*.md, REALISM_PLAN.md)
- **What.** Probes of the strike rule's terms (1/10 and true-scale CPU) found pickerel killing ~0.06 fish a day over the GPU year
  against the field's 0.4–0.8 and bass living on crayfish at p 0.09–0.22, under a product of brakes each added for an old symptom:
  the bass's strike ceiling cut 12 → 2.5 /h and a 'time hunting' share (10–20 %) set when bass met prey constantly and the gut
  was the only brake — before a hunger gate existed; cover counted in the encounter and again in the capture; prey size counted
  twice (capture successes measured at a typical size ratio, then cut again by 1 − PPR/PPR0); an unsourced half-saturation (30
  encounters /h against a 3 /h ceiling: a starving pickerel ignored ~90 % of the prey it met); a depth-contour band fixing an
  artifact of the 10×-steeper 1/10 slopes. A four-part audit of every parameter (predation, habitat and young, physiology, food
  web) found the same pattern across the model: the young's mortality halved to keep the old recruit counts (they then eat the
  zooplankton out — 400–600 µg/L in late May, 1–6 µg/L from September to May); bed food raised 4× for a 2-D slice with no
  shallows; consumers' energetics patched (respiration × 0.7) where their food was missing; a census cap regulating white perch.
- **The fix in kind.** Undo each compensation to its research value and let the mechanism the research named do the work: with
  cover once, the size term renormalised, E_h = aMax, the bass's lab ceiling, act a diel rhythm, and the hunger gate plus a meal's
  rest (no fish hunted until ~90 % of a satiating meal is digested — ET90) as the only brake, a June pickerel kills 0.37 fish a
  day at p 0.40 with 34 % empty stomachs (field 0.4–0.8, p 0.39–0.42, 35–60 % empty) — from 0.05–0.09 kills before.
- **Why it matters.** In an incrementally built ecosystem model a parameter moved to fix a symptom is a debt: when the missing
  mechanism arrives, the old fix stays and multiplies with it. Each looked defensible alone; together they starved the top of the
  food web by an order of magnitude and handed regulation to the census cap. A periodic audit of every value against its source,
  classifying it as field / compensation / stacked / prior, is a necessary part of building such a model.

## 2026-10-21 — Fed predators grow to giants: the satiation level is set by growth, not by the encounter rule (arms W, X)
- **What.** With the strike rule's stacked brakes undone (R1), the true-scale predators fed at the field's summer rations (pickerel p
  0.37–0.41) and white perch came off the census cap (31 → 22 kg/ha in three years) — but bass ran at p 0.55–0.65 all year and grew
  to a mean 66 cm at 8+ (Maine smallmouth Linf ~50), pickerel to 60 cm by age 5 and 85 at 8+ (Maine ~43 at 5, Linf 65), while the
  prey (yellow perch 17 → 6 kg/ha, the sunfishes, bullheads, killifish) fell. Two causes: a sated bass, barred only from hunting fish,
  grazed crayfish, insects and the bed between meals (a sated fish now forages for nothing); and the hunger gate's level, which in a
  Wisconsin-model fit is exactly what length at age sets (p), had been chosen when encounters, not appetite, limited the predators.
- **And a units slip in a cold rule.** The rule that slows strikes in cold water used FB4's consumption temperature curve as a 0–1
  appetite. Eq. 2 and 3 curves are ~1 at their optimum; Eq. 4 — the northern-pike set the chain pickerel run on — peaks at ~8.3, so at
  2 °C it read 1.0 and pickerel struck all winter at their full cold performance (field pike: a meal every ~25 days in winter, Diana
  1979); at 2 °C the relative appetite is 0.12.
- **Why it matters.** Once the encounter physics is right, the predators' growth is set by their satiation and their winter, and both
  must be checked against length at age, not only against summer rations or kill rates. Borrowed parameter sets carry their own
  conventions (an unnormalised temperature curve) that silently break rules written for another set's.

## 2026-10-21 — Two bookkeeping bugs that look like ecology (docs/review/PLAN.md progress)
- **A school laid ≤ 59 % of its eggs**: a schooling spawner's gonads are built to the sexes' mean GSI, but its eggs were scaled by
  the female's — killifish, yellow and white perch all ~0.6 of their fecundity (F3.EGG_SCHOOL).
- **A shelf rule on column means**: young kept to water ≤ 0.5 m tested the 50-m columns' MEAN depth, and only ~2 % of columns
  average that shallow — a school beside none of them wandered offshore and never came back (the killifish's young over 1.7–2.8 m).

## 2026-10-20 — A whole-model review against the field: who meets whom is wrong, not how much (docs/review/PLAN.md)
- **What.** Five parallel reviews compared every fish species and the environment with the research notes and the human's field
  observations, item by item (docs/review/*.md), on the true-scale GPU runs (arm O, seed 613, five years). The totals were in
  range — 80–96 kg/ha, predator biomass and adult growth plausible — but the food web was wrong in kind: pickerel and bass met
  white perch, 55–61 % of their food in Maine (Cooper 1941), for ≤ 5.5 % and ~10 % of their kills, and ate the small littoral
  fish, bullheads and spring recruits instead; pumpkinseed, killifish and dace went extinct while white perch rose 34.5 → 41.9
  kg/ha over four years and the census cap discarded 55–64 % of white perch and pumpkinseed recruits each spring.
- **Why.** No single error: the white perch's daytime band (3.5–5.5 m) kept them out of the predators' water; the small fish
  had no refuge behaviour (weeds, rock, the shallow strip); the young of every species died of under-ice hypoxia on the organic
  beds that go anoxic first; strikes ignored the cold; a fixed hunger gate starved small bass.
- **Why it matters.** Aggregate calibration (biomass, growth) can hold while the trophic links are wrong, and the wrong links
  surface only as extinctions years later. A model's diet matrix by predator and prey, its kills by place and time of day, and
  its census cap's discards are the diagnostics that catch it; the year runner now tallies all of them.

## 2026-10-20 — The young grew under the ice (docs/review/PLAN.md item 2)
- **What.** A CPU probe followed every young school BY ID from mid-September to March (1/10 lakes, seed 509, stageR5): the same
  schools grew through the winter — yellow perch +2.2 cm, white perch +1.9, sucker +2.2, fallfish +2.2 — most of it at 1–2 °C
  under the ice (yellow perch +0.9 cm by 1 December, +2.2 by March) at rations p 0.5–0.8 of their cold Cmax. Only the bass
  (+0.65, stopping at ~5 °C) and the bullheads (≈ 0) stopped: the two species with a cold-feeding rule.
- **Field.** Young perch stop growing below ~10–13.5 °C and live on their autumn lipid through the first winter (HSI; Boussion;
  Cooper's growth window July–early September); winter loss is size-selective because the small run out first (Johnson &
  Evans 1990, 1991; Post & Evans 1989).
- **Why it matters.** FB4's consumption curves leave a few percent of Cmax at 1–2 °C, and a young fish's maintenance there is
  tinier still, so a model fish that keeps feeding grows all winter — and the size-dependent first-winter mortality, the main
  regulator of perch and white perch recruitment in northern lakes, never bites. A winter-feeding cut is a mechanism the
  bioenergetics parameters alone don't supply.

## 2026-10-20 — A hunger gate must scale with the fish's own appetite (docs/review/PLAN.md item 4)
- **What.** The fixed gate (gut ≤ G0 = 1 %BW) caps the sustained ration at p = k·G0/Cmax, k the gastric evacuation a day: for
  bass 0.35–0.46 at 250 g in summer, but 0.20–0.27 at 43 g (15 cm), below its maintenance (0.48–0.60 on the sim's adult set) —
  no supply of prey could grow a small bass; pickerel, with slow evacuation, were capped at p 0.13.
- **Fix.** A gate in proportion to the fish's own appetite: G = pGate · Cmax · W / k, which holds the most a gated fish takes at
  ~pGate of Cmax at any size and temperature (bass pGate 0.5). With it, the smallmouth's adult FB4 set (Whitledge et al. 2003; RB
  −0.756) applies only from 250 g: on it a 30–60-g bass needs p 0.42–0.70 just to hold weight at 20–24 °C, against 0.26–0.32 on
  Rice et al.'s set; the two sets' maintenance as %BW a day meet at ~250–300 g (probe/bassets.mjs, gatek.mjs).

## 2026-10-20 — A full gut is the wrong satiation signal: the predators ate at Cmax until a hunger gate (docs/HOT_BROOK_3D.md §4 "Item 6")
- **What.** Through arms F–J (true-scale GPU, seed 613) every refuge added for the prey — depth overlap, the killifish's day and
  night water, encounter dilution for pickerel, a shore band for bass — moved WHERE prey died, not how many: the bass rose from
  9.4 to ~23 kg/ha a year every time, at p 0.46–0.67 in summer and ~0.9 in autumn, with field-like stomachs (35 % empty).
- **Why.** In the encounter–strike–capture rule a littoral bass meets prey far faster than its half-saturation (E ≫ E_h), so it
  strikes at aMax nearly everywhere, and the only brake was the gut's capacity (8 % of body weight). On the sim's own gastric
  evacuation any gut above ~2.5 %BW empties at the full Cmax rate, so feeding runs at p → 0.9–1 whatever the prey's refuges. Real
  bass hold ~0.4 %BW (Lake Ontario), use a third to a half of their gut, rest after a meal; field strikes at fish are ~0.3 per
  hunting hour; Maine growth needs p ≈ 0.34 on the sim's own FB4 set (0.7–1.1 kg of food a year; Mille Lacs 0.87 kg per bass) —
  research `piscivore_field_feeding_rates.md`. (A meal-then-rest cycle on the full gut alone still gives p 0.6–0.8: digestion clears
  a day's meal in about a day.)
- **Fix and evidence.** A hunger gate: a predator hunts and forages in proportion to h = 1 − gut/(G0·W), with the bass's field
  strike values (aMax 12 → 2.5 /h, hunting speed 0.1 m/s, act 0.2/0.5/0.05 by day/twilight/night). G0 0.5 %BW: bass 6.1 kg/ha, p
  0.16–0.21, 76 % empty, ~7,900 starved — too strong; G0 1 %BW (the research range 0.3–1): bass held at 7.4 kg/ha, ~28 → 33.5 cm
  in a year, p 0.20 in summer and 0.44–0.51 in autumn (the fall-heavy shape that also fits Maine growth), pickerel 4.9 kg/ha
  (target 4–8), whole lake 96 kg/ha. Pickerel were left ungated: they were not overfeeding (summer p 0.29–0.31).
- **Why it matters.** In predator–prey models the satiation brake decides the feeding level wherever prey are plentiful. A gut
  capacity is a physical maximum, not a satiation signal; using it as one silently pins predators at Cmax, and no amount of prey
  refuge, habitat or diet realism can then bring their growth down to the field's.

## 2026-10-20 — Two rules for one fish: the recruits fed the predators and did most of the killing (docs/HOT_BROOK_3D.md §4 "Item 6")
- **What.** In a true-scale GPU year with the encounter rule (arm E, seed 613), bass eating bass was the year's largest
  predator–prey pair (282,870 kills; 97 % of the bass eaten < 10 cm), and most kills took prey under 10 cm (bass's kills 55 %,
  pickerel's 76 %, yellow perch's 95 %, white perch's 93 %, fallfish's 93 % — the year's recruits; CORRECTED 2026-10-20: this tally
  is by the PREY's length, first misread as the predators'). Field stomachs hold almost no young bass (Maine 0 of 36, Wisconsin 0 of 303).
- **Why.** A young-of-year school becomes followed agents at its recruitment length (bass 6 cm). As a school it was hunted by a
  density rule calibrated to field young-of-year mortality (~1 %/day eaten); as agents, by the adults' encounter rule (~15 %/day),
  and the recruits hunted with the adults' strike rates in turn. 386,000 young bass and 350,000 young perch recruited in July–August
  and nearly all were eaten within days.
- **Fix.** Recruitment only in the spring of age 1 (as fisheries count it), so each fish meets one rule through its first year;
  and the young bass's own shallow water. CPU: the bass's August kills of young bass 58–73 % → 0.
- **But not the bass's overgrowth.** Arm F (spring recruitment) and G (+ the narrow band) grew the bass as fast (9.4 → 23.6
  kg/ha in a year): without the recruits they ate 10–20-cm perch and white perch (68 % of their kills by the prey's length), mostly
  over ≥ 2 m — 35 % of their stomachs empty by day (field 35–60 %), ~0.25 fish a day each.
- **Why it matters.** Individual-based models that switch representation by size (super-individuals → individuals) must keep the
  hazards continuous across the switch; a discontinuity becomes a hidden food subsidy that no diet target catches, because the
  diets still look piscivorous and plausible.

## 2026-10-20 — Growth pins the predators' feeding level, and a 6-m encounter disc erased the shallows' refuge (docs/HOT_BROOK_3D.md §4 "Item 6")
- **What.** With the encounter–strike–capture rule (arm D2, GPU, seed 613, year 1) the predators' diets turned to fish (pickerel
  76–98 %, bass 51–94 %), but the bass rose from 9.4 to 24.8 kg/ha and their mean length from 25.6 to 44.7 cm, and 100,000 of
  the lake's ~148,000 killifish were eaten in the first two weeks.
- **How.** The sim's own FB4 smallmouth set over the Maine calendar (scratchpad probe bassgrow.mjs): a 26-cm bass grows 4.4 cm
  in a year at a season-long p of 0.3, 9.5 at 0.4, 14.5 at 0.5, 22 at 0.65 — Maine's ~4 cm (MDIFW, ~22→26→30 cm at ages 3–5)
  pins p ≈ 0.3; the pickerel's 6 cm a year at ~32 cm pins p ≈ 0.37. D2's bass ran p 0.4–0.5 in June–July and 0.63–0.84 from
  August, when the year's young recruited — and on the CPU in August 53–72 % of the bass's kills were young bass, which recruit at
  6 cm into the adults' deep water (no juvenile habitat for bass).
- **Stomachs.** June (CPU, 1/10 lakes): 44–57 % of pickerel and bass empty, inside the field's 35–60 % — the predators did not eat
  too often early in the summer; the excess came with the recruits.
- **The refuge artifact.** 65 % of the pickerel's killifish were taken over 0.3–0.6 m of water by pickerel lying over 0.6–2 m:
  the rule counts prey over a 6-m disc, and on a shore's slope that disc spans fish that hold different depths of water. Weighting
  each prey by how near its water's depth is to the predator's own (1 − |Δbed|/0.3 m) and the killifish's day water at the shelf's
  edge (≤ 0.35 m, as netted in the field) cut a June fortnight's killifish losses 60 % → 29 % (the depth term alone 36 → 21 %).
- **Why it matters.** FB4 growth is steep in p (Δp 0.1 ≈ 2× a year's growth), so field length-at-age is a sharp, independent
  target for any predation rule — sharper than diets or stomach counts. And a neighbourhood density in place of positions is a
  mean-field assumption that silently removes the fine-scale habitat segregation that refuges are made of.

## 2026-10-20 — With the plankton fixed, the community collapses to perch and white perch; the predators eat crayfish (SESSION_STATE)
- **What.** Over five GPU years (seeds 613, 611; arms A and B), total biomass sits in Maine's range (95–105 kg/ha) and the summer
  zooplankton is realistic, but the community collapses to yellow perch, white perch (38 → 44–48 kg/ha) and suckers: pumpkinseed,
  redbreast, killifish and dace go extinct, bullheads 7.5 → 1.2, pickerel 4.6 → 0.1–0.5, bass 10.6 → 4–8. Moving the
  zooplankton-feeding species' adults to the bed (arm B) changes nothing.
- **Why.** Pickerel stop recruiting from year 2 and their adults starve; bass and bullhead adults starve too. In summer the
  predators eat crayfish (bass 65–77 %, pickerel 27–43 %) and young-of-year; other fish are ~3–22 %. Measured in the 1/10 lakes,
  pickerel meet mostly bullheads, and the perch and white perch they meet are adults too deep-bodied to swallow; bass find a
  catchable fish in range on 2.5 % of their strike checks. The pickerel's total intake is near a real one's; the mix is wrong
  (Cooper 1941, Maine: pickerel ~95 % fish, 0.5 % crayfish; smallmouth 80 % fish, 14 % crayfish).
- **Why it matters.** Fixing the base of the web exposed the top: a model's predators can hit their energy targets on the wrong
  prey, and the regulation that piscivory should provide (on the planktivores) never happens. Diet composition, not just intake,
  has to be a calibration target.

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
