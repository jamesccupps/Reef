# Compensation audit: fish physiology and life history

Written 2026-10-21. This is one of the four reports of the compensation audit (`docs/review/PLAN.md`, "THE COMPENSATION AUDIT").

**Scope.** Every physiological and life-history parameter and rule for the eleven 3-D species:
- `src/species.js` BIO and makeSpecies;
- `src/w3/species3.js`;
- `src/bioenergetics.js`;
- `src/config.js` BIOE / SPAWN / FRY / WINTER0 / BRAIN;
- `src/w3/fish3.js` `stageR5()`, `_energetics`, `_gate`, `_feed`, `_feedYoy`, `_hazards`.

**Method.**
- Read-only on the code.
- Field values come from the research notes and reviews, cited by file:line.
- History comes from `git log -S` and the docs.
- A few derived numbers (marked [derived]) come from small Node scripts calling `bioenergetics.js` on the species sets, with and without `stageR5(true)`. Prey energy density: 3,300 J/g for bed prey, 3,000 for bass on crayfish (3,500 × 0.85 digestible), 4,186 for pickerel.

**Classes.**
- **R**, real: the published or field value, or a documented correction of a published model's known bias.
- **C**, compensation: moved away from the field to fix a symptom whose cause is a missing mechanism.
- **S**, stacked: a second fix on a symptom already fixed elsewhere, or one half of a paired correction.
- **P**, unsupported prior: a stand-in or guess, often chosen by outcome.

**Abbreviations.**
- Notes, under `docs/research_notes/`:
  - CPE `Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md`
  - SSB `…/sucker_shiner_bullhead_trout_parameters.md`
  - FNS `Hot Brook populations and water/fish_numbers_and_new_species.md`
  - BG `Real lake ecology for calibration/bullhead_growth_and_young_white_perch.md`
  - PFF `…/piscivore_field_feeding_rates.md`
  - KPP `…/killifish_persistence_and_predators.md`
  - FZC `…/fish_zooplankton_coupling.md`
  - FWM `…/first_winter_mortality.md`
  - PWE `Predator winter energetics/predator_winter_energetics.md`
  - PPD `Predator winter energetics/pickerel_population_dynamics.md`
  - WPR `Whole lake 3D fish simulation/white_perch_regulation.md`
  - PDM `…/predator_diets_and_prey_mortality.md`
  - FSD `fetched_sources_digest.md`
  - BFW `Whole lake 3D fish simulation/brook_food_web.md`
  - LI `Whole lake 3D fish simulation/littoral_invertebrates.md`
  - IPP `Hot Brook populations and water/invertebrates_plankton_plants.md`
  - report `docs/reports/Maine lakes ponds and streams.md`
- Reviews, under `docs/review/`: SF `small_fish.md`, BY `bottom_fish_and_young.md`, PR `predators.md`, PE `perches.md`, EN `environment_coverage.md`.
- Code: `sp` species.js, `s3` species3.js, `f3` fish3.js, `cfg` config.js, `bio` bioenergetics.js.

---

## A. Energy budgets: the parameter sets and their multipliers

| species | parameter | now (default / stageR5) | field value + source | history | class | restore to | missing mechanism |
|---|---|---|---|---|---|---|---|
| pumpkinseed, redbreast | respiration `RA` on FB4's bluegill set | 0.0154 / **× 0.7**, adult and juvenile (f3:554–555; sp:274; s3:38) | Bluegill runs 1.21–1.69× Roberts 1964's routine uptake (30 g). That ratio is the repo's own derivation, and the note says "a sensitivity range, not a correction" (CPE:117–129). The other data disagree: O'Hara 1968 (10 g, 25 °C) measured 180 mg O₂/kg/h, above what × 0.7 gives (~164) (CPE:99). Breck 1997 had to *double* Evans' pumpkinseed respiration (≈ 1.13× bluegill) to fit sunfish starvation (FZC:50). Brett & Sutherland's standard rate is 45 mg/kg/h at 20 °C (CPE:100). | Flagged as "one study is too thin to correct on" on 2026-10-15 (sp:272–273, 70a3fbd). Applied 2026-10-20 (84ea294) after pumpkinseed K fell 0.96 → 0.74 at an Aug–Oct ration of p 0.17–0.29 (SF:196–213). | **C** | × 1.0 (bluegill as published). For winter, a sunfish `cold`/quiet rule: near-still ≤ 7.9 °C, fasting ≤ 2–4 °C (Reeve 2022; SF:247; PWE:223). | The late-summer collapse of the littoral food (p 0.40–0.47 in June–July, then 0.17–0.29), when real pumpkinseed feed most in September (SF:208–212). Adults can reach only the weeds' *large* fauna (littoral3.js:343–349). No chydorid/ostracod pool exists (cfg:941–942, LIT_FOOD). No cover drive for small sunfish, which take 76–91 % of their diet from vegetation (SF:244). The brook holds 10.8 sunfish/m² (SF:54–57). |
| fallfish | adult set (`bio`) | Pikeminnow CA/CB on the *Phoxinus* dace set (s3:57). Waste FA/UA 0.4/0.1 → **0.2/0.07** (f3:556). | No fallfish model exists. FNS recommends dace below 10 cm and pikeminnow for adults, "temperature curve adjusted", and calls the construction "unvalidated" (FNS:393–396). The pikeminnow row is REQ 1, RA 0.00165, RB −0.285, FA 0.2, UA 0.07 (FNS:379). | Built 2026-10-16 (283216b). Waste changed 2026-10-20 (84ea294) after K 0.94 → 0.84 at p 0.21–0.28 (SF:346). | **P + S** | One coherent set: the whole pikeminnow row (C, R, F, U) on a CEQ-2 curve with CTO 22–24, CTM 29–30 (FNS:396), or dace throughout. Not dace respiration (RB −0.2, fit on 1–5-g *Phoxinus*) with pikeminnow waste. `bioJuv` (< 15 g) still has 0.4/0.1. | Surface/terrestrial insects are 30 % of the summer diet with an evening peak (KPP:154); the sim gives 1–3 % (SF:343). The fall egg pulse (eggs 86 % of the diet at ≥ 150 mm, KPP:152–159) is missing. No drift in the brook (EN:162). |
| banded killifish | FB4 set | Fathead minnow, Duffy 1998 (s3:22–23, 76) | FNS recommends the congener California killifish (Madon 2001; CTM 34 °C against the banded UILT of 34.5) and lists fathead only as a cross-check (FNS:365, 381, 391). Fathead CTM 30 sits 4.5 °C below the killifish's UILT. | The congener set starved them ("481 of 1,499 in a summer month at 57 % of the ration", s3:69–71; HOT_BROOK_3D:436). Switched 2026-10-16 (283216b). | **P** (chosen by outcome) | Choose on physiology, then test the food. Madon's ACT 1.25 is an activity term fitted to a salt-marsh fish; the congener set at ACT 1.0 is the realistic test. | The adults' ration falls to 0.43–0.47 by June: zooplankton is gone from the shallows and only bed fauna is left (PLAN:56–58). The strip's chydorids, midges, epiphytes and fallen insects are missing or out of reach (adults reach only the large weed fauna). See also REPRO_ALLOC (§C). |
| blacknose dace (golden shiner in 2-D) | FB4 set | *Phoxinus* "dace" (s3:91; sp:262) | A published set. Its CTM 29 matches the dace UILT (FNS:366). The "2× a shiner standard rate" flag compares routine with standard metabolism, about 2× normally (CPE:95, 100; PFF:168). | Unchanged | **R** (summer) | Keep. Add a `cold` rule (see the YW_T0 row, §D). | Brook drift is missing. Dace eat lake zooplankton in the drift (BFW:47, 190–198). |
| smallmouth bass | `juvW` (Rice largemouth set below it) | 30 / **250 g** (sp:360; f3:497) | Whitledge 2003 was tested only in the lab on 100–270-g fish (PFF:158). Its respiration was measured only at 18–30 °C, with RB −0.756, "about three times steeper than typical", recommended for fish > 50 g (PWE:50–54). On Whitledge a 30–60-g bass needs p 0.42–0.70 to hold weight; the two sets meet at ~250–300 g (f3:494–497). | 30 from 2026-10-15 (70a3fbd); 250 from 2026-10-20 (03e31d4) after an 11-cm bass stalled at ~14 cm (PR:111). | **P** (one stand-in for another; defensible) | Keep, labelled as a construction. It does not explain today's bass failure. [derived] On Rice a 60-g bass at 20 °C needs p 0.32 on fish prey but **0.44 on crayfish** (3,000 J/g net), so the crayfish diet itself costs ~40 % more ration. | Bass ration is 0.09–0.22 all year (field target 0.30–0.36, PFF:555, 640) because of the predation rule (PLAN:59–63), the cut crayfish, and insects at 1–2 % against 25–70 % in crayfish-poor water (PFF:609–627). |
| smallmouth bass | cold rule | R5 30 mg O₂/kg/h at 5 °C, (W/100)^−0.2, Q10 2, quiet 0.7 (sp:364; bio:97–107) | Field winter budgets: 15–30 mg/kg/h for adults, 30–55 for young of the year (PWE:497–514). | 2026-10-18 (bf3cbb1) | **R** | Keep | — |
| brown bullhead | `juvW` (Rice set below it); energy density ED | default: Rice in the first year, ED 6,700 / **juvW 30 g, ED 5,000** (f3:565; sp:315, 320) | Hartman 2017 is entered correctly; "the problem is the set itself on a Maine calendar" (BG:25, 80–85). 6,700 J/g is a fat farmed-catfish value; a wild bullhead is ~4.4–5.4 kJ/g. But "Hartman's validation used 6,700 together with his consumption and respiration" (BG:117–130). Lake Opinicon bullheads grow at lab potential (BG:36). | 2026-10-20 (672368d). The growth target still needs p ≈ 0.83 from June to mid-September (BG:45, 289–294). | **ED: R** (unmeasured); **juvW 30: P** (largemouth physiology on a bullhead to 13 cm); together **S** | ED ~5,000, but re-check Hartman's C and R as a set. Retire the Rice stand-in past the first year. | Bullhead food: microcrustaceans for the young (60 % crustacea, BY:192, 198), nest eggs and carrion (missing), and a bed shared with adult white perch. "Keep starvation, fix the food" (BY:225). |
| brown bullhead | cold rule | adultR/adultC, quiet 0.7 below 10 → 6 °C (sp:324) | Hartman's own set at 4 °C; dormancy is standard metabolism at Q10 2–3 (PWE:426–461) | bf3cbb1 | **R** | Keep | — |
| chain pickerel | pike set; cold respiration × 0.5 at ≤ 8 °C | Bevelhimer 1985; cold mul 0.5 (sp:379–381) | The esocid model overestimates winter consumption 2–4× (Chipps 2000). "Halving metabolism fixed most of the error" (Wahl & Stein 1991, PFF:180). The report's Cmax × 0.65–0.75 was the wrong lever and was dropped (sp:376–378). | bf3cbb1 | **R** | Keep | Summer ration of 0.22–0.31 against ~0.39–0.42 needed (PR:153–154; PFF:630) is prey supply and the predation rule, not physiology (PR:81). |
| white perch | FB4 set | Yellow perch adult + juvenile (sp:342–344) | No white perch set exists. SSB:107–112 recommends the striped bass set, adding "stunted Maine populations show food, not physiology, limits them". Perch-set Cmax at 100 g and 18.5 °C is 0.061, against **0.04 measured** for adults (Behr; sp:338). Young-of-the-year Cmax is 0.42 at 25 °C (Behr, SSB:84–86), against ~0.24 on the perch juvenile set [derived]. White perch's higher routine metabolism and winter cost are not represented (Johnson & Evans 1991; sp:339–341; PE:98 suggests × 1.3–1.5 below 6 °C). Preferendum 28.9–30.6 °C (PE:102). | The striped bass set was tried first; its winter consumption curve killed every white perch under the ice (sp:334–337). Perch set from 2026-10-15 (70a3fbd). | **P** (chosen by outcome). Its biases favour the very species that sits at the census cap. | A white perch set from Hanks & Secor 2011 (juvenile consumption, routine metabolism, excretion, ED) plus Behr's Cmax by size; winter respiration × 1.3–1.5. Or the striped bass set with its < 6 °C consumption set from white perch's measured winter feeding (they are ice-fished). | — (the white perch excess is mortality and harvest: §B) |
| white sucker | FB4 set | Yellow perch set, ED 5,300 (sp:303–304) | No model exists. The perch curve fits the sucker's 17–24 °C preference; ED 5,000–5,600 (SSB:120–123). | 70a3fbd | **P** (stated) / ED **R** | Keep, flagged | Suckers grow about half as fast as the prior at p 0.36–0.40; the fix is "the bed food that sets p" (BY:162). Cooper's offshore mayflies and midges are missing (EN:151). |
| yellow perch | FB4 set | Kitchell 1977 (sp:289–291) | Published. Known biases: it mis-estimates routine metabolism (Bajer 2003, CPE:80–85) and under-predicts field rations 25–50 % (FZC:493–494). | — | **R** | Keep | Late-summer p 0.15–0.28 against a field 0.3–0.6 (PE:56). |
| all agents | trait and brain multiplier on respiration, `metabMul` | (0.85 + 0.15·speed)·…·(1 − **BRAIN.COST 0.22**·(10 − active)/10) (f3:1061; cfg:1409). Genes run 0.7–1.35, so metabMul ≈ 0.76–1.05. | A teleost brain uses ~2–8 % of resting O₂ (Nilsson 1996, general literature, not in the notes). A 22 % saving lets evolution buy a cheaper body under a food shortage. | 2-D era | **P** | BRAIN.COST ~0.03–0.05. Keep the other trait terms small. | — |
| all agents | metabolic depression when thin | × (1 − 0.3·clamp((0.9 − K)/0.35)) (f3:1798; cfg:127–129) | Supported: −38 % on maintenance rations (Ranney 2023), −30–75 % fasting (PWE:196–227, 333) | 5b25253 | **R**, but **S** with `quiet` | Keep. Don't stack it on a cold `quiet` 0.7, which already includes the 30–75 % fasting drop (PWE:513). Apply one or the other. | — |
| all | ED_K 0.8 / ED_K_JUV 0.3 (energy density by condition) | bio:120–126; cfg:126 | Winter loss is 7–9 kJ/g in adults and 5–6 in the young (Breck 2008; PWE:244–248) | bf3cbb1 | **R** | Keep. Note there is no fat storage above Ws, so no autumn fattening (PWE:491). | — |
| all agents | swimming cost SWIM 2.0 above routine (= cruise/sprint) | f3:1797; cfg:135 | Direction supported (PFF:168). Klumb 2003: drop the activity term for fish < 1 g (`sea_run_alewife.md`:507–510). | 6bcc008 | **R** (agents) | Keep. The maintenance tables quoted in the reviews leave it out (PFF:104, 654). | — |
| young of every species | larval appetite CMAX_LARVA 1.5 (fading by 4 cm) | cfg:189; f3:2478 | Breck 1997 raised bluegill CA 50 % **and** used doubled measured respiration (FZC:49–50). ECOLOGY_RESEARCH.md:37: raise Cmax only *together with* the fry's activity cost (Post 1990). | ba3d516 (10-14) | **S** (half of a paired correction) | Either add the fry's activity cost or set it to 1.0. | Larval food (rotifers 0–9 µg/L in summer against a target of ¼–⅓ of the crustaceans, EN:130; no littoral microcrustacean pool) |
| young of every species | respiration floor R_WMIN 0.1 g | cfg:198; f3:2517 | Isometric early metabolism (Post & Lee 1996; Klumb 2003). The species' inflection masses were never found (FZC:223). | 6bcc008 | **P** (reasoned) | Keep | — |

## B. Natural mortality: is M double counting?

| species | parameter | now (default / stageR5) | field value + source | history | class | restore to | missing mechanism |
|---|---|---|---|---|---|---|---|
| all adults | **BIOE.M_OTHER 0.5**: background hazard = M·0.5·clamp((L/Lref)^−0.87, 0.5, 3) | cfg:156–159; f3:2586; GPU wgsl:1365 | One global share is wrong both ways (see the next rows). The comment lists angling, but M is *natural* mortality: fishing is a separate F. The loon it names ("besides the loon") exists only in 2-D; the 3-D sim has no birds (EN:165–166). | a76fd0a (2026-10-13, 2-D era), never revisited; ported to 3-D in 28c05ab | **P** | Per species, as below. Take angling out of the comment and model it as F (PLAN item 37). | Birds, mammals and angling as explicit hazards. Birds and mammals come to a few kg/ha/yr, about 3–6 [derived]. The sim's "other" deaths are 10–20 kg/ha/yr (EN:168). |
| white perch | M 0.45 (maxAge 12), × 0.5 | sp:346 | Adults A 0.45–0.55 (Z 0.6–0.8). Predation ≲ 0.05–0.10 and F 0.02–0.08; the rest, ≈ 0.45–0.65, "should **not be halved**". maxAge 10 (M ≈ 0.6) (WPR:137–143, 470–475). The sim gives "about half the field rate" (WPR:138). | 70a3fbd | **P** (too low) | M ≈ 0.6 with the full non-predation share (M_OTHER ≈ 1 for white perch), plus harvest F 0.02–0.08 or more at a "principal fishery" | Spawning stress, winter cost (their higher routine metabolism, §A), angling harvest. Together with the generous perch set this is why white perch climb to the census cap. |
| brown bullhead, pumpkinseed | M 0.54, × 0.5 | sp:279, 326 | Bullhead A ≈ 50 % with no piscivores (Moe Pond 52 %), "mostly not from fish predators once > 15 cm" (PDM:474–477, 608). Pumpkinseed 60 % natural (PDM:324). | a76fd0a / 70a3fbd | **P** (too low a background) | M_OTHER ≈ 0.8–1.0 for the adults | Eagles (they favour bullheads, `shore_birds_and_mammals.md`:139), disease, senescence |
| pickerel, bass, sucker | M 0.62 / 0.36 / 0.32, × 0.5 | sp:383, 366, 307 | The pickerel background sits "inside these bands at every size"; its full M is 10–25 % above the central estimators (PPD:117, 347–353, 478). Bass: Maine "a 20-in bass ~20 yr", so maxAge 18–20 (PR:127, 257). Sucker S 70–75 % (BY:175). | 70a3fbd | **R** (pickerel M slightly high) | Pickerel M ≈ 0.5; bass maxAge 18–20 | Osprey and eagle on large fish |
| all | the size slope on the "other" share, (L/Lref)^−0.87 (adults clamped 0.5–3) | f3:2586 | Lorenzen's slope describes *total* M and is "mostly predation, which the sim now simulates" (BY:76, 221; PPD:103–116). Birds take size *windows*: kingfisher ≤ 10 cm, heron 5–25, osprey 25–35 (`juvenile_refuges_and_bass_young.md`:286–290). | a76fd0a | **S** (double-counts predation's size gradient) | A flat share, or bird kernels by size window and depth (PLAN item 16) | Birds by size window, depth and light |
| young of every species | M·M_OTHER·min(YM_CAP, (L/Lref)^−0.87) **on top of** M_LARVA3 0.04/L and M_JUV3 0.015/d | f3:2379–2380, 1273–1274; cfg:262. YM_CAP 30 / **3**, YM_COLD 0 / **1** (f3:515). | Both terms name the same causes: M_LARVA3/M_JUV3 stand for "cyclopoids, Chaoborus, insects, birds, disease, failed first feeding" (cfg:256–262). Over a first winter the M_OTHER term alone took 20–39 % of the young (killifish 50 %) with no birds about (BY:72–77). | M_OTHER term from 6bcc008; M_LARVA3/M_JUV3 halved from the 2-D values in 03a0497 (2026-10-19), calibrated to "the old rule's recruits" (GPU_SIM.md:408–413); cap and cold only in stageR5 (03e31d4) | **S** (double count) | Drop the M_OTHER term for the young, or make YM_CAP 3 and YM_COLD 1 the default. Then re-derive M_LARVA3/M_JUV3 from field total Z (Oneida 0.035/d) minus the explicit predation, per species. | Chaoborus, odonate nymphs as predators, birds (EN:131, 159–160) |
| all | death at maxAge (a cliff) | f3:2587 | 5.4/tmax assumes ~0.5 % reach tmax. With only half of M charged, ~16–21 % of mature bass, perch, white perch and pickerel reach maxAge and die at once [derived from agent arithmetic; PE:67, 100, 173]. | a76fd0a | **P** (structural) | An age-rising senescence hazard; for killifish, survival 0.68 from age 1 to 2, then 0.10 (KPP:95–100) | Senescence |
| all | starvation (logistic in K: K_S50 0.55, K_S99 0.68), heat (UILT, 7 d), hypoxia (lethal DO, 2 d) | cfg:119–143; f3:2581–2585 | Lab physiology: perch die after 46–55 % mass loss (ECOLOGY_RESEARCH.md:37); Fry 1947; Cooper & Washburn 1946 | a76fd0a | **R** | Keep. These don't overlap M by design, but because the M_OTHER share is fixed, total mortality runs above M when starvation is large (PR:89, 127). | — |
| killifish, fallfish, dace young | winter loss when they have no WINTER0 ramp | WINTER0.K has no entry for them (cfg:448–453), so the schools' scramble starvation runs all winter (f3:2528–2529) | No first-winter data exist for them (cfg:444) | 2026-10-20 | see §D (YW_T0) | — | — |

## C. Reproduction

| species | parameter | now (default / stageR5) | field value + source | history | class | restore to | missing mechanism |
|---|---|---|---|---|---|---|---|
| all | **REPRO_ALLOC 0.5** of surplus to the gonads, from any time after maturity | cfg:162; f3:1803; GPU wgsl:935 | No source. The 2-D engine reads a per-species `sp.reproAlloc` (world.js:1848); the fathead minnow, a batch spawner, had 0.8, "a batch every ~4 days" (FEATURES.md:337). fish3 and the GPU read only the global value, so the batch-spawner allocation was lost in the 3-D port. | a76fd0a; the per-species value dropped at the port (28c05ab) | **P** | Per species. Batch spawners (killifish, pumpkinseed, redbreast) ~0.8–1.0 in season. Capital spawners (yellow perch, white perch, pickerel, sucker, bass): build the gonads from ~yf 0.5 through the winter, not right after spawning (PE:58, 91, 163; BY:162, 348). | — (structure) |
| banded killifish | clutches a season | Cooldown 0.04 yr (~15 d) allows ~3. Realised: **~1** (PLAN:56–58). | ~3 clutches, ~201 yolked eggs each, GSI peak 15.8 % (FNS:315–318) | — | consequence | — | [derived] At p 0.45 and 22 °C a 4-g killifish has no surplus at all, and a 2-g one needs 93 days a clutch at alloc 0.5. Three clutches in ~6 weeks need p ≈ 0.8 at 0.5, or p ≈ 0.6–0.65 at 0.8–1.0. The missing piece is the strip's food, with REPRO_ALLOC stacked on it. |
| pumpkinseed | fecundity per spawning | 35.7·L^2.12, **per batch** (10 cm → 4,700), every ~22 d (sp:281, 476) | 2,451–10,633 eggs a female *a season*, over several batches (CPE:341; SF:256) | 70a3fbd | **P** (≈ 2× high) | The seasonal total ÷ batches | — |
| pumpkinseed, redbreast | nest guard | 0.005 yr ≈ **1.8 d** (sp:477; s3:37) | Males guard eggs ~7 d and fry ~11 d (CPE:567, 588); redbreast larvae stay 1–2 weeks in the nest (FNS:264) | Cut from 11 d on 2026-10-15 (fea9089): "held in the zooplankton-poor shallows, 84 % of them died there" (sp:477) | **C** | ~5–10 d past swim-up | Food for larvae in the nest shallows (littoral rotifers and microcrustaceans) |
| all | GON_READY 0.8, K_READY 0.8, K_RESORB 0.75 | cfg:75–76, 162 | No source | a76fd0a | **P** | Keep as priors, flagged | — |
| brown bullhead | spawnT, spawning end | [21, 28] / **[18, 24], spawnEnd yf 0.38** (f3:559) | Late May–June, most eggs in a 10–15-day window, once (Blumer 1985); NH from 18 °C (BY:196) | 84ea294 | **R** (a restoration). Only in stageR5; the 2-D sim keeps [21, 28]. | Put it in species.js | — |
| most species | egg → swim-up survival `sHatch` | pumpkinseed 0.5, redbreast 0.5, bullhead 0.6, sucker 0.1, white perch 0.05, fallfish 0.15, killifish 0.3, dace 0.2 | Field-backed only for perch (0.08 against Oneida's 7.7 %), bass (0.1) and pickerel (0.05, against 5–15 %, centre 8–10; PPD:150, 459). Killifish hatch is 0 % at 10 °C and > 74 % at 22–28 °C (SF:307). | 70a3fbd / 283216b | **P** | Pickerel 0.08. Temperature-dependent hatch for killifish. An egg stage (PLAN item 21). | Egg incubation (missing: larvae feed on the day of spawning) |
| most species | gonad GSI `gsiF/gsiM` | e.g. white perch 0.15/0.05, bass 0.08/0.008, sucker 0.12/0.05 | Field-backed only for perch females 0.20 and killifish 0.16 | 70a3fbd | **P** | Keep, flagged | — |

## D. The young's winter and appetite rules

| species | parameter | now (default / stageR5) | field value + source | history | class | restore to | missing mechanism |
|---|---|---|---|---|---|---|---|
| all young past 90 d | **YW_T0**: no feeding below 4 °C, eating ∝ (T − 4)/6 up to 10 °C | 0 / **4** (f3:516, 2477) | Young perch stop *growing* below ~10 °C. On the CPU the young grew 1.9–2.2 cm under the ice (f3:151–155; PE:64). | 03e31d4 (2026-10-20) | **R** for the perches; **S** for killifish, fallfish and dace | Apply it only where a WINTER0 ramp replaces starvation, or give the three a ramp and a cold rule | [derived] With no ramp, the scramble rule kills a fasting school at a *constant* 1/tStarve from day one, whatever its reserves (f3:2528–2529). Over a 150-day ice season that leaves ~1–3 % of 2.5-cm dace, ~4–8 % of 5-cm fallfish and ~28–43 % of 2–3-cm killifish. The dace set burns ~176 mg O₂/kg/h at 2 °C for a 0.15-g fish: no cold rule exists for the cyprinids, the killifish, the sunfishes, the perches or the sucker. *Verify with the year runner's first-winter loss by cause.* |
| white perch young | WINTER0 k | [1.04, 0.87], the same as yellow perch (cfg:451) | Higher routine metabolism, so a higher threshold and harsher cold (Johnson & Evans 1990/1991; PE:98; FWM) | 2026-10-20 | **P** (favours white perch) | e.g. [1.1, 0.95], or J&E 1990's own form (PE:98) | — |
| sucker, bullhead young | WINTER0 k | [0.73, 0.65] / [0.73, 0.60]: "placeholders" (cfg:444, 451–452) | No data | — | **P** | — | — |
| bass | hunger gate `pGate` 0.5 of Cmax (G0 off) | 0 / **0.5** (f3:488; `_gate` f3:1818–1823) | PFF:47–52: wild predators stay below satiation "for reasons the sim lacks": prey see them first, prey leave, interference. The gate is a stand-in for that prey behaviour. | G0 0.5 %BW at 4875ba0, when bass hit p 0.9–1 under an encounter rule with E ≫ E_h; aMax was cut 12 → 2.5/h at the same time. pGate at 03e31d4. | **S** (two brakes on one symptom; a third after refuges and COVER_CS) | Off (or ≥ 0.8) once the encounter rule's compensations are removed (`audit_predation.md`) | Prey vigilance and avoidance, interference. At bass p 0.09–0.22 the gate barely binds, but it still scales every strike. |
| predators | cold appetite on strikes (SCOLD, YCOLD): min(coldPerf, consumptionT) | 0 / **1** (f3:1840–1841) | Bass near-still below 8–10 °C (Oliver 1977; PLAN item 6) | 03e31d4 | **R** | Keep (no effect for pickerel: CEQ 4's consumptionT is ≥ 1 above ~2 °C) | — |
| all | cold-performance floors `coldPerf` (perch 0.45, sucker 0.4, pickerel 0.55, fallfish 0.45, dace 0.4; others 0.2) | sp:510, 544, 668; s3:56, 90; cfg:764 | Priors | 2026-10-13/16 | **P** | Keep, flagged | — |

## E. Diets and switch lengths

| species | parameter | now (default / stageR5) | field value + source | history | class | restore to | missing mechanism |
|---|---|---|---|---|---|---|---|
| white perch | adults on zooplankton; Lzoo | plankton on, Lzoo 40 / **off, 12** (f3:603–606) | Cooper, Maine ≥ 15 cm: "67 % bottom fauna (mayfly nymphs 44 %), 26 % fish, ~6 % plankton", ranging 0–98 % by lake (FSD:51–54). Adults take Daphnia above ~20/L (WPR:309). The review asked for Lzoo 10–12 *plus* zooplankton at high density, "better than off" (PE:86, 153). | Arm B began as a cure for the year-2 zooplankton collapse (HOT_BROOK_3D:749–755). The 5-year A/B found "B is not the lever" (FINDINGS.md:104). Committed 2026-10-20 (93d114e). | **C** (origin) / partly R | Plankton on with a density threshold (white perch K_ZOO 2–3× 60), Lzoo 10–12 | Offshore mayflies (*Hexagenia*) and Chaoborus are missing (EN:131, 151, 410–412). The zooplankton's seasonal shape: 300–550 µg/L in June, 1–6 from September to May (PLAN:69–71). |
| yellow perch | Lzoo | 25 / **16** | Cooper: no zooplankton in perch ≥ 16 cm (FSD:274) | 93d114e | **R** (Maine data). Note that it also offsets the June zooplankton excess (PE:52). | Keep | — |
| pumpkinseed, redbreast, fallfish | adults off zooplankton; Lzoo 4 → 5, 4 → 5, 10 | f3:603–606 | Pumpkinseed: cladocerans only below ~25 mm (LI:205, 310); redbreast sub-yearlings only; fallfish < 10 cm | 93d114e | **R** (pumpkinseed and redbreast Lzoo ~2.5–3 would be closer) | Lzoo ~3 for the sunfishes | Adults lose every microcrustacean, including the weeds' chydorids, which exist only as copepod food (cfg:941–942, LIT_FOOD) |
| blacknose dace | plankton | on / **off**, Lzoo 3 | Dace eat lake zooplankton in the brook's drift (BFW:47, 190–198). p 0.12–0.22 with it off, against 0.38–0.58 with it on (SF:222–223). | 93d114e | **C** | On, in the brook | Brook drift (1.3–6.1 animals/m³, ×10 at night: EN:162; BFW:120, 143–146) |
| banded killifish | young's bed food `benthL` | FRY 2.5 / **1.0** (f3:615) | Young eat chydorids and midges from a small size (Phillips 2007, f3:612–614) | c1685d9 | **C** (gives 1-cm larvae the bed's *worms and scuds*, because no chydorid pool exists) | 2.5, once small littoral fauna exist for small fish | A chydorid/ostracod/small-midge pool, reachable by small adults too |
| smallmouth bass | benthL | 2.0 (sp:369–371) | Maine and New Brunswick young of the year are "mostly cladocerans (Sididae > 90 % in Meddybemps)" (PDM:272); 30–40 % zooplankton below 15 cm (PFF:613) | 8cee19b: "no food between Lzoo (2) and 2.5 cm" | **C** | Littoral cladocerans to ~3–5 cm; benthL ~2.5 | Littoral Sida/chydorids |
| brown bullhead | benthL | 1.2 (sp:330) | Young on the bottom from swim-up, eating 60 % crustacea (ostracods, cladocerans) and 25 % chironomids (BY:192, 198) | f36d52d: "85 % of the fry starved" at 2.5 | **R** in place, **C** in food (worms and scuds stand in for ostracods) | Keep the place; give them microcrustaceans | Benthic microcrustaceans |
| fallfish | Lpisc | 10 / **30** (f3:621) | Partly piscivorous above ~10 cm, but fish ≤ 10–20 % except in fry pulses (KPP:151–169). s3:49 itself says "above ~10 cm". | 2d9db30, after 45–51k killifish kills | **C** (predation-side) | ~10–15 with a low fish preference. The predation rule is the lever (`audit_predation.md`). | 30 % terrestrial insects and egg pulses as alternative food |
| smallmouth young | yLpisc | 5 / **10** (f3:625) | Fish appear at 10–15 cm (Dunlop 2005; Weidel 2000) | 42cbec3 | **R** | Keep | — |
| smallmouth bass | insect reach `insR` | 0 / **2 m** (f3:572) | 25–40 % insects at ≥ 30 cm, 50–70 % at 15–25 cm in crayfish-poor water (PFF:609–627) | c313818, after bass fell 6.5 → 2.2 kg/ha with insects ~1 % | **C** (a reach extension) | 0, once bass go into the weeds and to the surface for insects by behaviour | The weed-edge insects and access to the surface |
| bass, pickerel | crayfish | capacity ÷ 5, CR_PREF 5 → 1 (f3:627) | "Not common" (the human); "generally rare in Maine" (FSD:294); Hot Brook-type 5–20 g/m² (IPP:96) | 0ddd1ef | **R** (direction); the size of the cut is a guess | Measure calcium | — |
| pumpkinseed / redbreast / sucker | Lsnail | 8 / 12 / 12 | Pumpkinseed 74–99 mm TL (CPE:617–631). Redbreast and sucker are priors. | 70a3fbd | **R** / **P** / **P** | — | Snails 0.5–5 g/m² in soft water (LI:211–216) |
| white perch young | benthL | FRY 2.5 | To the bed at ~4 cm (PE:95; WPR:491) | — | **P** (favours white perch) | 4.0 | — |

## F. Life history and limits (no compensation found; priors and errors)

| species | parameter | now | field value + source | class | restore to |
|---|---|---|---|---|---|
| white perch | tempOpt | 27 "prior" (sp:606) | Preferendum 28.9–30.6 (PE:102; sp:340 itself says 29–31) | **P** | 29–30 |
| white perch | maxAge / M | 12 / 0.45 | Typical 5–7, Maine maximum 17; field Z 0.6–0.8 → M ~0.6 (WPR:470–475) | **P** | §B |
| white sucker | matMinAge | 2 yr (sp:307), Ontario | MDIFW 5–8 yr in Maine (unverified); "the Maine figure should win" (report:235) | **P** | ~4–5 (verify) |
| brown bullhead | Lmat; lw | 19 cm; Bister Ws | ~17 cm on the Maine growth target (BG:307–308); Ontario a 0.009194 (SSB:146) | **P** | 17; the Ontario lw |
| redbreast | uilt; M; maxAge | 34; 0.6; 8 | "Less tolerant than pumpkinseed" (≤ 31–33); 5.4/8 = 0.68; the brook's 18–21-cm fish suggest ~10 yr (SF:287, 481) | **P** | ≤ 32; recompute M |
| pickerel | sHatch; M | 0.05; 0.62 | 8–10 % (PPD:150, 459); ~0.5 (PPD:117, 483) | minor | 0.08; 0.5 |
| bass | maxAge | 15 | Maine ~20 (PR:127, 257) | minor | 18–20 |
| all | `vb` (founders only), gut, gerMul, o2Ice/o2Lethal for sucker, white perch, redbreast, fallfish, killifish, dace | sp, s3 | Mostly priors (agent survey; CPE, SSB) | **P** | Flagged |
| all | header comment says bass and pike M come "from field studies" | sp:235–237; FEATURES.md:350 | Both are 5.4/tmax | doc error | Fix the comment |

---

## What the pattern says

1. **Most of the stageR5 physiology changes patched the consumer instead of supplying its food.** RA × 0.7 (sunfishes), the fallfish waste fractions, the fathead set for killifish, the bullhead's juvW and ED, and the bass's insR all arrived *after* a starvation symptom.
   - In every case the notes trace that starvation to a late-summer collapse of the zooplankton and the littoral fauna, and to foods the lakes don't have or fish can't reach:
     - the weeds' small fauna is reachable only by young-of-year schools, never by small adult fish;
     - there is no chydorid/ostracod pool;
     - there is no *Hexagenia*, Chaoborus, brook drift or fish eggs;
     - surface insects reach fallfish and bass at 1–3 % of their diet against 25–70 %;
     - crayfish are cut to a fifth.
   - The pumpkinseed correction is the clearest case. The same Roberts 1964 comparison was judged "too thin to correct on" on 2026-10-15 and applied on 2026-10-20 once the fish were starving. O'Hara 1968 and Breck 1997 point the other way.
2. **Mortality is mis-split, not simply double counted.**
   - For adults, the single `M_OTHER` 0.5 is roughly right for pickerel, bass and sucker. It is too low for white perch (field non-predation 0.45–0.65 against the sim's ~0.2), bullhead and pumpkinseed.
   - Its L^−0.87 slope re-applies predation's size gradient to non-predation causes.
   - For the young, birds and disease are charged twice: in `M_LARVA3`/`M_JUV3` and again in M·`M_OTHER`, which carries up to a ×30 size multiplier and no cold scaling unless stageR5 is on.
   - Angling is not natural mortality and is missing as F.
3. **White perch are favoured on every axis at once**, and they sit at the census cap:
   - a borrowed set whose adult Cmax is ~1.5× the measured value and whose winter metabolism is too low;
   - a young-fish winter ramp no harsher than yellow perch's;
   - bed food from 2.5 cm instead of 4;
   - half the field's non-predation mortality;
   - no harvest.

   Each of these is a prior or a stand-in chosen by outcome, not a tuned value. Restoring them to the field is realistic and pushes in the direction the census needs.
4. **Stacks to undo:**
   - the bass hunger gate on top of the 12 → 2.5 aMax cut, the refuges and COVER_CS;
   - CMAX_LARVA 1.5 without its paired fry activity cost;
   - `depress` on top of a cold `quiet` that already contains the fasting drop;
   - YW_T0's winter fast applied to killifish, fallfish and dace, which have no WINTER0 ramp and no cold rule (their young starve at a constant rate all winter: derived, to be verified);
   - the 2-D engine's per-species `reproAlloc`, lost in the port, so batch spawners allocate like capital spawners and build gonads right after spawning.
5. **What is real and should stay:**
   - the cold rules (bass R5, the bullhead's own set, the pickerel's ×½: each a documented bias of a warm-water fit);
   - ED by condition;
   - starvation, heat and hypoxia from lab physiology;
   - yellow perch's Lzoo 16 (Cooper), the bass's yLpisc 10, the bullhead's spawning window, fewer crayfish;
   - the dace and yellow perch sets as published.

## Order to restore (so nothing collapses mid-way)

Restoring a compensation before its food exists would only reproduce the starvation it hid. So:
1. **Build the missing food and access first** (`audit_foodweb_environment.md`):
   - littoral microcrustaceans reachable by small fish of any status;
   - *Hexagenia*/offshore mayflies and Chaoborus;
   - the brook's drift;
   - fish eggs;
   - surface-feeding behaviour (fallfish evenings, bass).
2. **Then, one A/B each on ≥ 3 seeds:**
   - RA × 0.7 → 1.0 (with a sunfish cold/quiet rule);
   - one coherent fallfish set;
   - killifish on its congener set at ACT 1;
   - dace plankton on in the brook;
   - killifish and bass benthL back;
   - insR 0;
   - the bass gate off.
3. **Mortality and reproduction, independent of food; do them now:**
   - per-species `M_OTHER` (white perch ≈ 1 with M ≈ 0.6);
   - drop the young's M_OTHER term;
   - a senescence hazard instead of the maxAge cliff;
   - per-species REPRO_ALLOC and gonad timing;
   - BRAIN.COST ≤ 0.05;
   - a white perch set from Hanks & Secor 2011 and Behr, with a harsher WINTER0 k;
   - pumpkinseed fecundity per batch;
   - nest guard ~5–10 d;
   - YW_T0 only with a ramp.

## Notes on the derived numbers

**Maintenance p** (share of Cmax that holds weight; no SWIM, prey ED as in Method):

| species, size | 15 °C | 20 °C | 24 °C |
|---|---|---|---|
| pumpkinseed 30 g, as published | 0.40 | 0.39 | 0.42 |
| pumpkinseed 30 g, RA × 0.7 | 0.28 | 0.27 | 0.29 |
| yellow / white perch 60 g | 0.27 | 0.29 | 0.35 |
| fallfish 60 g, as built | 0.43 | 0.42 | 0.42 |
| fallfish 60 g, with stageR5 waste | 0.31 | 0.30 | 0.31 |
| killifish 3 g | 0.34 | 0.39 | 0.47 |
| killifish 5 g | 0.38 | 0.43 | 0.52 |
| dace 3 g | 0.42 | 0.41 | 0.41 |

| species, size, set | 15 °C | 20 °C | 24 °C |
|---|---|---|---|
| bass 60 g, Whitledge | 0.22 | 0.58 | 0.72 |
| bass 60 g, Rice | 0.22 | 0.44 | 0.36 |
| bass 600 g, Whitledge | 0.28 | 0.21 | 0.26 |

- **Bullhead:** Cmax ≈ 0 below ~10 °C, so it fasts in winter, as real bullheads do.
- **Pickerel (pike set):** 0.30–0.40.

**Young killifish, fallfish and dace in winter.** These rows use tStarve = 0.4·ED/(R·OXYCAL) from `_feedYoy` at 1–4 °C, on FB4 respiration with no cold rule:

| fish | tStarve | survival over 150 days of fasting |
|---|---|---|
| dace, 2.5 cm | 33–41 d | 0.01–0.03 |
| fallfish, 5 cm | 48–60 d | 0.04–0.08 |
| killifish, 2–3 cm | 117–180 d | 0.28–0.43 |

**Not run:** no long simulations were run for this audit. Every population-level claim comes from the reviews' runs (arms O–U, the probes) as cited.
