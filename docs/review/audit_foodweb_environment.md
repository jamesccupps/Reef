# Compensation audit: the food web and the physical environment (2026-10-21)

**The question (the human):** "make sure there aren't other things that were adjusted but shouldn't have been because they weren't realistic … and that the model just didn't have all the other variables it should have like the plants and cover … the real solution is to make it realistic and provide everything the environment has and the way the environment actually has it."

**Scope.** Every food-web and environment parameter or rule in the 3-D lakes:
- the zooplankton (`chem3.js`, `PLANKTON`, `ZOO3`) and the fish's feeding on it;
- the bed (`BENTHOS`, `SEDOM`, `CHEM3.ALLOCH`);
- the littoral fauna, surface insects, snails, crayfish and mussels (`littoral3.js` `LIT3`);
- the plants' roles (`plants3.js` `PL3`);
- light, ice, O₂, weather and flow (`ICE`, `ENV`, `THERMAL`, `env3.js` `H3`).

The fishes' own behaviour, predation and physiology belong to the companion audits (`audit_predation.md`, `audit_habitat_young.md`, `audit_physiology.md`). The broad inventory of what exists is `environment_coverage.md`. This file does not repeat it; it asks **which values were moved to make an outcome come out**.

**Method.**
- Code read at `zoo-field` 52be4eb.
- Values traced with `git log -S` and the design logs: `docs/HOT_BROOK_3D.md`, `SESSION_STATE.md` (including the 2026-10-15 2-D calibration rounds at lines 1130–1230), `docs/FINDINGS.md` and `docs/review/*.md`.
- Field values from the research notes. Two read-only extraction passes covered the zooplankton notes and the littoral and benthos notes.
- No long runs. A few `node -e` prints of the sim's own rates (marked [mine]). The coordinator's GPU arm T and CPU `zshal_509` figures were used as given; see §6 for a units caveat on the CPU probe.

**Classes.**
- **R**: real; set from field data. **R\*** means fitted to a field target for a mechanism the model lacks, which is acceptable.
- **C**: compensation; moved off the field value to fix a symptom of a missing mechanism.
- **S**: stacked; one of several compensations that act together on the same symptom.
- **U**: unsupported prior; a guess, or a value from another kind of lake.

**Research-note keys.**
- ZD = `Real lake ecology for calibration/zooplankton_dynamics.md`
- CD = `…/copepod_daphnia_coexistence.md`
- FZ = `…/fish_zooplankton_coupling.md`
- FF = `…/forage_fish_early_life.md`
- WEF = `…/whole_lake_energy_flow.md`
- PEA = `…/piscivore_encounter_attack.md`
- PFF = `…/piscivore_field_feeding_rates.md`
- IPP = `Hot Brook populations and water/invertebrates_plankton_plants.md`
- MA = `Whole lake 3D fish simulation/macrophytes.md`
- LI = `…/littoral_invertebrates.md`
- WP = `…/white_perch_regulation.md`
- BF = `…/brook_food_web.md`
- RTF = `…/realtime_foraging.md`
- WBC = `…/weed_bed_controls.md`
- WBS = `…/weed_bed_structure.md`
- PDPM = `…/predator_diets_and_prey_mortality.md`
- LPF = `…/lily_pad_fauna.md`
- SA = `Hot Brook populations and water/sea_run_alewife.md`
- MFM = `…/maine_freshwater_mussels.md`
- LLS = `Maine lake shores and catchment/land_lake_subsidies.md`
- SGV = `…/shore_geometry_and_vegetation.md`
- FSD = `research_notes/fetched_sources_digest.md`
- ENV = `docs/review/environment_coverage.md`

---

## 1. Top findings

1. **The young-of-year eat zooplankton FIRST, on a type-II curve, until they are 12–40 cm long.** This is the main reason the zooplankton stays collapsed.
   - The rule: `_feedYoy` takes zooplankton before anything else whenever `d.plankton || q.L < sp.Lzoo` (`fish3.js:2489`). Lzoo is 16 for yellow perch in stageR5 (25 by default) and 12 for white perch (40 by default). So every young perch and white perch takes zooplankton first all summer and autumn, even past `benthL` and while sitting on the bed.
   - Type II (`PLANKTON.K_FRY` 30, `chem3.js:523`) at low density gives the zooplankton a per-capita death rate of about Σwant/(K·V), whatever its own density.
   - At 1–5 young/m² that is about 0.09–0.46/day [mine], against the zooplankton's best net growth of 0.06–0.23/day.
   - The adults instead share their foraging time between bed and water (type III, `fish3.js:1883-1886`), which lets scarce zooplankton escape.
   - Field: perch over 50 mm turn to the bed when zooplankton is low (FZ:376, Wu & Culver 1992); white perch at about 40 mm (WP:201).
   - The young's numbers make it worse. The sim has 2–15/m² in July–August (`zshal_509`), against a field collapse threshold of about 2–4 YOY perch/m², or 20–40 kg/ha (FZ:406, ZD:349). Real lakes hit that threshold only in strong years. The sim hits it every year.
2. **The weeds' zooplankton refuge is a feeding discount on ONE pelagic field, and the water's currents carry that field in and out of the beds.**
   - In the sim, `plantRef` (0–0.8, `plants3.js:538-541`) hides a share of each weed cell's zooplankton from fish (`chem3.js:492`). The zooplankton itself is a single field, advected and mixed with the water.
   - Field: the plant-associated community (*Simocephalus* 11–171/L, *Eurycercus* 7–28/L, chydorids, *Sida*, ostracods) is plant-bound. It is about half of shallow-lake zooplankton biomass (ZD:21; MA:413). It is the first food of young sunfish, killifish, perch and smallmouth: Sididae were over 90 % of young smallmouth's food at Meddybemps (PDPM:272).
   - It does not exist in the sim. `PLANKTON.LIT_FOOD` 0.1 (`config.js:941`) only feeds the pelagic copepods inside weed cells.
   - Also, the young pick their cell by `zooEl`, which ignores the refuge (`chem3.js:501`).
3. **The 8-month zooplankton famine has four causes, and only the first is a consumer:**
   - **(a) Summer:** the young's zooplankton-first type II feeding (finding 1).
   - **(b) Autumn:** no release. Young perch and white perch stay zooplankton-first while Daphnia go dormant from the equinox (`chem3.js:263, 279`).
   - **(c) Winter:** the constant through-flow (residence 100 and 55 d, `env3.js:44`) flushes 1.0–1.8 %/day of the water. Copepods at 1–4 °C net at most about 1.6–3 %/day [mine]. So the winter stock converges on the inflow's own about 3 µg/L (`CHEM3.IN_ZOO`, `chem3.js:53`), the coordinator's "1–6 all winter". Real winter discharge is about 0.5–0.6× the mean (ENV §1.1).
   - **(d) Spring:** Daphnia do not grow below 4 °C (`PLANKTON.DAPH_T`, `config.js:936`). The egg bank correctly hatches about 1 %/yr. So spring is built from a near-empty overwintering stock (6 → 23 → 41 µg/L by June).

   The zooplankton's own physiology (`ZOO3`, 2026-10-19) is research-set and is not the fault.
4. **Rotifers have no food in summer.** They eat only algae, with a zero-growth point at 0.05 units, above Daphnia's 0.034 (`config.js:1010` [mine]). Summer algae are grazed to 0.02–0.09, so rotifers sit at about 0 (ENV §2), where the field has about ¼–⅓ of the crustaceans' biomass (IPP:356).
   - Their invertebrate-predation term `M2_R` 0.3 (`config.js:1012`) was set in the 2-D sim to stop a rotifer bloom under the too-bright ice. It is a compensation stacked on `ICE.LIGHT_CUT`.
   - Missing: the brown lake's microbial food web (DOC → bacteria → flagellates and ciliates → rotifers and cyclopoids). It is also why cyclopoids, which need animal prey (CD:115-133), have no food but algae.
5. **The bed's food was raised four times in the 2-D slice, a lake with no littoral zone, and the 3-D lakes inherited all four.**
   - The four raises:
     - `BENTHOS.G` 0.08 → 0.16 (`config.js:888`);
     - `BENTHOS.K_FISH` 2 → 0.5 (`config.js:898`);
     - `SEDOM.PERI_G` 110 → 180 (`config.js:864`);
     - `CHEM3.ALLOCH` 800 (`chem3.js:82`), whose stated basis is "3 seeds: late-summer starvation halves".
   - The result: bed production of 110–125 g wet/m²/yr. That is the eutrophic Bay of Quinte's figure (WEF:221), "at or above the realistic upper bound" (IPP:292). A Hot Brook-type lake has a community P/B of about 5/yr, needing r₂₀ ≈ 0.03/day (LI:136-143), against the sim's 0.16.
   - The fourth raise (`ALLOCH`) is 10–100× the leaf research lake-wide, spread over 150 m where the leaves land within about 10 m (ENV §1.2).
6. **`BENTHOS.REFUGE` 3 g/m² is an absolute floor** (1.5 → 3 in a 2-D round, `config.js:897`).
   - It zeroes every poor bed: sand, the killifish strip, the brook-mouth gravel. Yet it leaves about 80 % of a rich bed open.
   - Maine's fish-cropped standing stock is about 5 g wet/m² in shallow lakes (Cooper 1941, FSD:76, 302-305). Field exclusion results give a share, not a floor: fish cut benthos 20–60 %. No note gives an absolute unreachable mass.
   - The young (`K_FISH` 0.5) and adults (`F3.K_BENTH` 3, `fish3.js:194`) use half-saturations 6× apart for the same food.
7. **Every littoral pool sits at its refuge by mid-June:**
   - the weeds' small fauna at its FLOOR (0.01–0.03 g/m²);
   - the large fauna at its REF (0.15–0.20, `littoral3.js:41`);
   - the zooplankton exposed to fish at 2–6 µg/L (`zshal_509`).

   Field: fish had no significant effect on most plant-dwelling invertebrates (LI:467-468), whose biomass falls only 2–2.5× from June to August (LI:26).
   - The small weed fauna have no stem refuge against the young; `takeYoy` takes them fully (`littoral3.js:385-389`).
   - All the weed fauna feed on the mud's organic layer (`littoral3.js:218`), not on the epiphyton of the leaves they live on.
   - There is no stony-shore (epilithic) fauna: the bare lit bed carries 0.1 g/m² (`littoral3.js:25`).
8. **Crayfish:**
   - **The default is still the Michigan stock (`CR_ROCK` 25 / `CR_WEED` 15) with `CR_PREF` ×5.** The ×5 is documented as "5 propped up predators the old fish rule starved" (`littoral3.js:111-115`).
   - **stageR5** cuts the stock to ⅕ (the human's "not common") and sets `CR_PREF` 1 (`fish3.js:627`).
   - **The bass's 33–41 % crayfish under stageR5 is a predation symptom, not a stock one.** The bass kill 0.02–0.03 fish a day against the field's 0.5–2 (PLAN.md:58-63), and the weed insects sit at their refuge. So crayfish are the residual food. Cooper's Maine smallmouth ate 14 % crayfish in lakes where "crayfish are generally rare" (FSD:36-39); the target is ≤ 5–15 % (PFF:431).
   - **"Rock" is any bed shallower than 1.5 m** (`CR_ROCK_Z`, `littoral3.js:85, 192`), mud coves included. The shores are 60–75 % rock, 15–30 % wetland and 5–10 % sand (SGV:62-64).
9. **Too-bright ice is a stacked compensation.**
   - `ICE.LIGHT_CUT` 0.6 (`config.js:493`) passes 40 % of the light; Maine has 1–12 % under snowy ice.
   - Four things lean on it:
     - the winter O₂ (FINDINGS.md:123-125);
     - the rotifer term `M2_R`;
     - the calibration story of `ZOO3.Q10_C`;
     - the gate, whose winter lake-mean O₂ floor was lowered from 5 to 3 mg/L (`test/w3.mjs:282`).
   - These must be restored together with snow, ice optics, late-winter convection and the bed's declining winter O₂ demand.
10. **The gate does not see the famine.** The only zooplankton check is "June peaks above 100 µg/L while fish eat under its production" (`test/w3.mjs:707`). Nothing checks summer, autumn or winter zooplankton, rotifers, or the weed fauna's seasonal fall.
    - Add checks:
      - 30–80 µg/L summer crustaceans, copepod-heavy;
      - rotifers ¼–⅓ of the crustaceans;
      - 10–20 µg/L under ice, ≥ 70 % copepods (CD:498-507; IPP:356-358);
      - the weed fauna falling no more than about 3× under fish.

---

## 2. The zooplankton collapse in detail (the coordinator's top item)

### 2.1 What the runs show

**GPU arm T (true lakes, seed 613, stageR5)**, Upper / Lower in µg/L by fortnight from late May:

| Period | Upper / Lower (µg/L) |
|---|---|
| Late May (first fortnight) | 417 / 404 |
| Following fortnights to mid-August | 616/456, 127/82, 291/49, 197/18, 193/26 |
| Late August | 48 / 21 |
| September | 11/11, 5/6 |
| Early October | 3 / 4 |
| October | 1 / 2 |
| All winter | 1–6 |
| Late April | 6 / 6 |
| The next May–June | 23/20, 41/27 |

Later years' summer means fall: 141/55 → 43/28 → 35/14.

**Field** (CD:498-507; IPP:356-358; ZD:48):

| Period | Crustaceans (µg/L) | Composition |
|---|---|---|
| June peak | 40–100 | — |
| July–August | 30–60 | copepods 50–70 % |
| September–October | 30–60 | — |
| Under ice | 10–20 (about 25 % of summer) | ≥ 70 % copepods, which stay active (*L. minutus* breeds from February, CD:306-311) |

**CPU 1/10 lakes (`zshal_509`).** The probe prints g wet per 2-D cell, so multiply by 40 for µg/L (§6). In µg/L:
- **Late May:** about 330–360 Daphnia and 80 copepods in every depth class.
- **Mid-June to early August:** under 20 of each. Exposed to fish: 2–6.
- **Mid- to late August:** about 40 Daphnia and 40–80 copepods. Exposed: 17–72.
- **Rotifers:** under about 20–40 all along.

So the 1/10 lakes recover in August while the true lakes collapse from September.

### 2.2 Why: by season

| Season | Mechanism | Evidence | Real-lake counterpart |
|---|---|---|---|
| **Late May–July** | Young-of-year at 18–61/m² early June, 2–15/m² July–Aug (`zshal_509`), eat zooplankton first, type II (`fish3.js:2489-2499`, `chem3.js:523`). A young perch of 0.05 g has Cmax 0.36 g/g/d × `CMAX_LARVA` 1.5 at 20 °C [mine]; at E ≪ K the zooplankton's per-capita loss ≈ the young's demand per litre / K: ~0.09/d at 1 young/m², ~0.46/d at 5 [mine], vs its net growth 0.06 (copepods) – 0.23 (Daphnia) /d at algae 0.1–0.2 units [mine] | Stage 6b already noted young at 15–28 kg/ha by July (HOT_BROOK_3D.md:310-312) | Collapse at 20–40 kg/ha of age-0 perch (ZD:349) / 2–4 YOY/m² (FZ:406) in STRONG years (Oneida); cyclopoids compensated at Mendota (FZ:396); larvae barely dent small zooplankton (FZ:371-372); Keast 1980: May–June fall, recovery from August (FZ:368) |
| **August–October** | No autumn release: young perch (Lzoo 16 in stageR5) and white perch (12) stay zooplankton-first; their feeding stops only below `YW_T0` 4 °C (`fish3.js:516`). Daphnia start resting eggs from the equinox in water < 12 °C (`chem3.js:263, 279`) | Arm T 48 → 1 µg/L late Aug → Oct | Perch > 50 mm move to the bed when zooplankton is low (FZ:376); white perch at ~40 mm (WP:201); an autumn copepod/Bosmina recovery is the norm |
| **Winter** | Copepods' best net growth at 2–4 °C is 0.016–0.03/d on plentiful under-ice algae [mine: G 0.028–0.036 × food − losses 0.006–0.007]; the through-flow flushes 0.010 (Upper) – 0.018 (Lower) /d all winter and brings `IN_ZOO` 0.05 × START ≈ 3.2 µg/L (`chem3.js:53`, `env3.js:44`); Daphnia lose 1.5–1.9 %/d with no growth below 4 °C | Arm T 1–6 µg/L Nov → April | Winter discharge ~0.5–0.6× the mean (ENV §1.1); L. minutus adults lose ~0.0005/d (CD:363); under-ice crustaceans 10–20 µg/L |
| **Spring** | Daphnia grow only from 4 °C (full at 10); ephippia hatch ~1 %/yr (`ZOO3.HATCH_D`, correct — Cáceres); calanoid resting eggs hatch only at a ≥ 10 °C bed (`ZOO3.HATCH_T_C`), i.e. May–June | 6 → 23 → 41 µg/L by June | The spring stock is the overwintered one (CD:537); calanoid diapause eggs hatch 60–80 % in March–April under ice (CD:444-450); egg-bearing Daphnia ~6 % before ice-off (CD:355) |

### 2.3 Parameter table: zooplankton and its consumers

| Parameter | Now (default / stageR5) | Field value + source | History | Class | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|
| `ZOO3` copepods `G_C` 0.27, `R_C` 0.04, `M_C` 0.012, `K_C` 0.15 (`config.js:1041`) | same | M_C 0.01–0.015, R_C ~0.04, G_C/G_D 0.4–0.5, threshold 1.0–1.3× Daphnia's (CD:525-531) | 7c26519 (2026-10-19) from CD | R | keep | Copepods eat only algae (+ `LIT_FOOD`): cyclopoids need animal prey (CD:115-133); calanoids select flagellates/ciliates |
| `ZOO3.Q10_C` 3.5, `Q10_LD` 3.0, `Q10_LC` 3.5 (`config.js:1043-1046`) | same | Development Q10 ≈ 3.5–3.7 (ZD:228-236; CD:146-151); winter losses 0.001–0.005/d (CD:525-531) — the sim's 0.0055 at 2 °C [mine] ✓ | 7c26519; comment: "at 2.7 they grew 60–120 µg/L under the ice on the under-ice algae" | R (but its calibration was read against bright-ice algae — S with `ICE.LIGHT_CUT`) | keep; re-check after snow optics | — |
| Daphnia `G_D` 0.6, `R_D` 0.08, `M_D` 0.03, `K_D` 0.15 (`config.js:927-938`) | same | Field P/B 0.162/d above 10 °C (ZD:210-217); r_max 0.2–0.5/d [unverified] (ZD:252); threshold C₀ 17–55 µg C/L (CD:73-82) — at the item-4 mapping (1 unit ≈ 1.6 mg C/L, HOT_BROOK_3D.md:723-735) the sim's zero-growth 0.034 units ≈ 54 µg C/L | G_D 39297a4, R_D 0.12 → 0.08 in the 2-D rounds for "adult sunfish starve after the July crash" (SESSION_STATE.md:1181-1193) | C in origin, ≈ R now (inside the field range after the unit mapping) | keep; state it in mg C | — |
| `PLANKTON.DAPH_T` [4, 10] (`config.js:936`) | same | No hard limit; eggs develop in 20 d at 4 °C (ZD:228); overwintering females carry young in late January (CD:333) | 2-D | U | a slow ramp from ~1–2 °C | — |
| Dormancy and egg bank: `ZOO3.DORM_D` 0.005, `DORM_C` 0.006, `EGG_EFF_C` 0.85, `HATCH_D` 0.0002, `HATCH_C` 0.03, `HATCH_T_C` 10 (`config.js:1052-1057`) | same | 30–35 % of copepods dormant (CD:532-533); ephippia ~1 %/yr within 9 weeks of ice-out (ZD:307-311; CD:537) | 7c26519 | R (`HATCH_T_C` 10: U for calanoid eggs) | keep; calanoid eggs at ice-out temperatures | Calanoid diapause eggs (CD:431-450) |
| `CHEM3.IN_ZOO` 0.05 × START (`chem3.js:53`) + constant through-flow (`H3.RES_*`, `env3.js:44`) | same | Streams carry few lake zooplankton (agreed); outlet streams strip ~41 %/100 m (BF:43-44); winter discharge 0.5–0.6× mean (ENV §1.1) | 2026-10-16 (stage 3) | U | hydrograph (winter low flow); the brook strips zooplankton on its way to Lower | Hydrograph; outlet-stream zooplankton loss |
| DVM `DVM_MAX_D` 0.85, `DVM_B50` 50, `REF_DEPTH` 0.3 / `REF_RAMP` 0.2 of a 14.6-m column (`config.js:978-982`, `chem3.js:121`) | same | DVM under ~6 m gives little protection (ZD:426, 435) — the ramp gives Upper's 5.5-m basin ~0.38 of it [mine] | 2-D | R (consistent) | state in metres | The daytime shift to the weeds or the bed as a function of fish density (ZD:436-441) |
| Weed refuge `plantRef` = `PL3.REF_MAX` 0.8 · logistic(PVI, ½ at 0.2) (`plants3.js:133, 538-541`; `chem3.js:492`) | same | MA:541-545: × 1/(1 + (F/1.5)³), F small fish/m²; perch and sunfish get only 0.3–0.5 of the protection; refuge ≈ gone above ~4 fish/m² (MA:409-412); spring PVI < 10 % (MA:560) | df35210 (stage 7a) | R value, wrong mechanism (a feeding discount on one well-mixed pelagic field, advected in and out of the beds by `env3` transport) | the MA formula, but on a plant-bound community | The plant-associated microcrustaceans (finding 2) |
| `zooEl` (the young's choice of water, `chem3.js:501`) | ignores `plantRef` | — | Y1 | bug-like | rate cells by what is exposed | — |
| `PLANKTON.LIT_FOOD` 0.1 (`config.js:941`; `chem3.js:272`) | same | "plant-associated taxa ~half the zooplankton of shallow lakes" (ZD:21) — no value for this food | ba3d516 (2-D) | U / C (a stand-in for the missing littoral community, feeding the PELAGIC copepods in weed cells) | replace by a littoral microcrustacean pool on the plants | Littoral microcrustaceans; epiphyton |
| Rotifers `G_R` 1.0, `R_R` 0.2, `M_R` 0.05, `K_R` 0.15, `DAPH_INTERF` 0.05, `M2_R` 0.3 (`config.js:1010-1013`) | same | Rotifers ¼–⅓ of crustacean biomass in summer (IPP:339, 356); P/B 0.17/d at 20 °C (ZD:210-217); 17–66 % of zooplankton production (ZD:171-176) | fea9089 (2-D): `M2_R` added because "without it they reached ~1,000 µg/L under the ice" (`config.js:1012-1014`) — the bright-ice bloom | C / S (with `ICE.LIGHT_CUT`) | give rotifers bacterial and detrital food; route `M2_R` to explicit predators (cyclopoids eating rotifers — CD:526); re-fit after snow optics | The microbial food web; invertebrate predators |
| `FRY_COPE` 0.3 (`config.js:1018`) | same | Larvae < 8 mm eat nauplii, 8–12 mm adult copepods (FZ:111-119); zooC holds nauplii while zooR is "rotifers and nauplii" (overlap) | 2-D round (0.5 → 0.3) | U | split nauplii out of zooC | — |
| `ZOO3.COPE_ESCAPE` 0.65 (`config.js:1048`) | same | Capture 0.07–0.28 vs 0.76–0.96 (FZ:601) | 7c26519 | R | keep | — |
| `F3.K_ZOO` 60 µg/L, adults type III (`fish3.js:198`) | same | Fish stop being satiated at ~1–3 crustaceans/L ≈ 3–15 µg/L — "a calibration target for K_ZOO" (RTF:1021); the code comment's "saturate at 10–20 Daphnia/L" | 83104a7 (stage 6b): chosen so "the zooplankton settles where it pays as well as the bed" and the June peak holds (HOT_BROOK_3D.md:307-315); the 2-D's same knob went 60 → 25 for the opposite outcome (`config.js:993`) | C (protected the zooplankton from adults kept on it at every size — Lzoo 25–40, fixed by stageR5's diets, `fish3.js:603-606`) — S with those diets | ~10–20 µg/L once stageR5's diets are the default; re-test | Adult ontogenetic switch (built in stageR5); littoral prey |
| `PLANKTON.K_FRY` 30, type II, zooplankton FIRST (`config.js:994`; `fish3.js:2489-2499`) | same | Growth falls below ~20–50 crustaceans/L (Breck; Hoxmeier — `config.js:990-992`); perch > 50 mm switch to the bed when zooplankton is low (FZ:376); white perch ~40 mm (WP:201) | ba3d516 (2-D) | R value; **wrong rule** (no switch, no time-share) | the adults' time-share for young past `benthL`; type III or profitability switching from the field's lengths | The young's prey switching |
| `FRY.CMAX_LARVA` 1.5 (`config.js:189`) | same | Breck raised bluegill CA 50 % (FZ:191-192) | 2-D | R | keep | — |
| `FRY.M_LARVA3` 0.04 /L, `M_JUV3` 0.015 (`config.js:262`) | same | Larval Z 0.04–0.15/d, juvenile 0.03–0.06 (FZ:332-333); Oneida 8 → 18 mm 0.042, 18 mm → fall 0.035 (FZ:253-262); bluegill first 4 days after dispersal 0.11–0.39 (FF:236) | 03a0497: calibrated so recruits stay "within ~15 % of the old rule's" (`config.js:255-261`) — the old 2-D rule's `M_LARVA` 0.02 → 0.08 had been raised to stop fry stripping the zooplankton (`config.js:203-209`) | S (stand-ins for the unsimulated predators, calibrated to an earlier calibration) | derive from explicit predators (below); total Z inside 0.04–0.15 then 0.03–0.06 per species | Chaoborus, cyclopoids, odonate nymphs; kingfishers, herons, mergansers |
| `FRY.LARV_A` 0.1 (`config.js:253`) | same | none — "[inf; calibrated on the year's fates — at 0.3 the panfish took 41 % of the suckers' hatch and the killifish's, sucker's and redbreast's recruits fell 83–92 %]" | 03a0497 | C (cut to protect recruitment) | restore once the larvae have their spatial and seasonal refuges | Larval refuges (the weeds, the shore strip, timing) |

---

## 3. Parameter table: the bed, the littoral, crayfish, surface, mussels

| Parameter | Now (default / stageR5) | Field value + source | History | Class | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|
| `BENTHOS.CAP` 15 g wet/m² (`config.js:887`) | same | Maine shallow lakes ~5 g wet/m² standing stock under fish (Cooper 1941; FSD:76, 302-305); Mirror Lake 2.5 g DW ≈ 12 wet (IPP:224-231); Hot Brook soft mud inferred 10–45 g WW (IPP:286-289) | 6c87ce8 (2-D) | R as a fish-free capacity | keep; vary by substrate | Substrate |
| `BENTHOS.G` 0.16/d (`config.js:888`) | same | Community P/B ~5/yr → r₂₀ ≈ 0.03/d (LI:136-143); Mirror Lake 14 g DW/m²/yr (≈ 70 wet); median lake benthic production 2.3 g C/m²/yr (LLS:246); the sim's 110–125 g wet/m²/yr is the eutrophic Bay of Quinte (WEF:182-191, 221), "at or above the realistic upper bound" (IPP:292) | 00a3550 (2-D, 0.08 → 0.16): the slice's bed food per kg of fish was 0.4× Quinte's — a lake with NO 0–3-m zone (SESSION_STATE.md:1181-1219) | C / S | ~0.06–0.08 once the littoral's own food carries its share | The littoral zone (now real in 3-D), epilithic fauna, littoral microcrustaceans |
| `BENTHOS.REFUGE` 3 g/m², absolute (`config.js:897`; `chem3.js:542-557`) | same | Fish cut benthos 20–60 % (exclusion); no note gives an absolute unreachable mass; Maine's fish-cropped stock ~5 g wet/m² | fea9089 (2-D round, 1.5 → 3) | C | a SHARE of the stock (~40–60 %), by substrate (burrowers in mud more, sand and stones less) | Substrate-specific refuge |
| `BENTHOS.K_FISH` 0.5 (young; adults if SHARE 0) vs `F3.K_BENTH` 3 (adults) (`config.js:898`; `fish3.js:194`) | same | No field functional response for bed prey; nearest bluegill on stems (RTF:505) | 00a3550 (2 → 0.5: "held fish at ~45 % of their ration") | C; inconsistent (×6 for the same food) | one K, handling-limited, by fish size | — |
| `BENTHOS.SENSE_MIN` 0.5 (`config.js:904`) | same | — | 00a3550 (round 26) | U | — | — |
| `SEDOM.PERI_G` 180 (`config.js:864`) | same | Benthic algae 10–100 g C/m²/yr; 36 % (5–80) of whole-lake production (WEF:405-410) | 6c87ce8 (110 → 180: "the fish need the bed's 50–65 % share") | C (inside the range, set for the outcome) / S | re-fit to the coloured water's bed light, not to fish | — |
| `CHEM3.ALLOCH` 800 g wet/m²/yr, `LEAF_R` 150 m (`chem3.js:82-83`) | same | Leaves land within ~10 m (λ 3–5 m [inf]); lake-wide 0.02–1 (≤ 10) g dry/m²/yr; leachate 17.8 g DOC per m of shore a year (ENV §1.2) | df35210 (stage 7a): "(800 … 3 seeds: late-summer starvation halves)" | C / S (fourth raise of the bed food) | inflow particulate on the hydrograph + a 10-m leaf band by forest cover + DOC into colour and bacteria | Hydrograph; DOC → bacteria |
| `LIT3.KAPPA` 0.03, `FORM` (`littoral3.js:24`) | same | 3–10 mg DW fauna/g plant (LI:122-124); form factors (LI:115-120) | 8cee19b | R | keep | — |
| `LIT3.BARE` 0.1 g/m² < 3 m (`littoral3.js:25`) | same | Bare bottom 1,700–3,300/m² against 34–44k in beds (LI:81), ~1/10–1/20 of a bed's | 8cee19b | U (low) | ~0.3–0.5 on sand; an epilithic pool on rock | Stony-shore fauna; substrate map |
| `LIT3.R_S` 0.10, `R_L` 0.04, `K_S` 0.3, `EGGS` 0.15, `FLOOR` 0.02 (`littoral3.js:26-33`) | same | Community P/B ~5 (LI:28); with fish the fauna fall only 2–2.5× from June to August (LI:26, 89-91); fish did not significantly reduce most plant-dwelling invertebrates (LI:467-468) | 8cee19b; `K_S` added after "the small collapsed in the second year" (HOT_BROOK_3D.md:1164-1168) | U / C | the small fauna get the stems' refuge too (`reach`), and their food from the epiphyton | Epiphyton; stem refuge for the small fauna |
| Weed fauna eat 0.5 × the bed cell's organic layer (`littoral3.js:218-220`) | same | Epiphyton 100–400 µg chl a/g plant (LI:93), the fauna's grazing film | 8cee19b | U (mechanism) | an epiphyton pool on the plants | Epiphyton |
| `LIT3.REF` 0.15, `S50` 250 (`littoral3.js:41-42`) | same | S50 150–250 (LI:491) | 8cee19b | R / U | keep | — |
| `LIT3.EMERGE` (`littoral3.js:39`) | same | 0.7–1.1 g DW/m²/yr lake-wide (LLS:241, 247-248); midges and *Hexagenia* (50–300/m², Maine dusk hatch late June–mid July) from the mud (IPP:246-258) | 8cee19b | R for the weeds | add mud emergence | Mud emergence |
| `LIT3.FALL` 0.05 g DW/m/d, bank weight 0.2 + 0.8 × crowns (`littoral3.js:54, 139-145`) | same | ~50 (20–120) mg DW/m/d (LLS:24, 50); conifer ×0.4–0.6, closed deciduous ×1.7–4, grass 0.6, developed 0.05–0.2 (LLS:53-56) | 8cee19b | R rate; U weighting (a spruce–fir shore counts 1) | weight by forest type | — |
| `LIT3.K_SURF` 0.02, surface food "taken as met" (`littoral3.js:63`; `fish3.js:1890-1897`) | same; stageR5 `S3.bass.insR` 2 m (`fish3.js:572`) | Diet shares: smallmouth 0.1–2.6 %, redbreast 1.9–8 % (LLS:40) | 8cee19b; "as met" because "under the f⁴ time-share a minor food got none" (HOT_BROOK_3D.md:1169-1170); insR after arm S (bass insects ~1 %) | U; insR C (see `audit_predation.md`) | — | Wind-drift lines on the downwind shore [inf] |
| Snails `SN_*` (`littoral3.js:48-50`) | same | 0.5–5 g WW/m² in beds; Ca gate ½ at ~2 mg/L proposed (LI:211-216) | 8cee19b | R / U | add the Ca gate | Calcium |
| Crayfish capacity `CR_ROCK` / `CR_WEED` / `CR_MUD` / `CR_DEEP` (`littoral3.js:85`; `fish3.js:627`) | 25 / 15 / 2 / 0.5 · stageR5 5 / 3 / 0.4 / 0.1 | Michigan pothole lakes 4.6–21 g/m² (IPP:41-52); no Maine or New England density (IPP:113); "crayfish are generally rare in Maine", 1 in 809 grabs (Cooper 1941, FSD:36-39); crayfish nearly vanish below ~2 mg/L Ca; Maine crayfish-free in 1870, stocked 1959 (PEA:175; LI:171); Hot Brook Ca ~2–4 (ENV); the human: not common | 7f5f477 (Michigan); 0ddd1ef (⅕: the human) | default U (another kind of lake); stageR5 R-ish (fits the human; the ⅕ is a guess) | make stageR5's the default; then by substrate × a Ca factor | Substrate map; calcium |
| `CR_ROCK_Z` 1.5 m: "rock" = any bed shallower (`littoral3.js:85, 192`) | same | Shores rocky 60–75 %, wetland 15–30 %, sand 5–10 % (SGV:62-64); exposed shores coarse to 2–3.5 m by fetch, EB23 = 2.291·F^0.549 (WBC:107-110) | 7f5f477 | U (proxy) | a substrate class per bed cell from fetch + the aerial photos + the human's notes | Substrate map |
| `CR_PREF` (`littoral3.js:111`) | 5 · stageR5 1 | Smallmouth avoid crayfish or take them at chance (Carter 2010); 1.7 % of crayfish vs 35 % of sculpin eaten in 36 h (McNeely 1990) (PEA:162-164) | 7f5f477: "5 propped up predators the old fish rule starved"; 0ddd1ef → 1 | default C; stageR5 R | stageR5 as default | (Predation rule: `audit_predation.md`) |
| `CR_OUT` [day, night] (`littoral3.js:89`) | [0.3, 0.7] · stageR5 [0.15, 0.6] | 10–20 % out by day (Stein & Magnuson 1976; PEA) | 7f5f477 prior; 0ddd1ef research | default U; stageR5 R | stageR5 as default | — |
| Over-capacity adults all exposed; the young × 1.5 (`littoral3.js:331-332`) | same | Size refuge: on sand the smallest go first, ovigerous females and Form I males nearly exempt (Stein 1977, PEA:174) | 7f5f477 | U | a size and sex refuge | — |
| Mussels `MU_*` (`littoral3.js:97-110`) | same | Maine elliptio 0.4–27.6/m²; coves 30–60+; field filtering 0.05–3.1 L/h (IPP:139-190) | da8bd4b | R (`MU_CR` 0.8: U, the mid of a 60× range) | keep | Host-specific recruitment; their biodeposits as bed food |
| `CHEM3.BROOK_BENTH` 3× (`chem3.js:34`) | same | Riffles hold more invertebrates; "a bed fed like the lake's cannot sustain dace" (BF:192) | 77689e9: set because the dace starved | C, supported in direction | keep; add the drift | The brook's drift |

---

## 4. Parameter table: plants, light, ice, O₂, weather, flow

| Parameter | Now | Field value + source | History | Class | Restore to | Missing mechanism |
|---|---|---|---|---|---|---|
| `CHEM3.KD_COLOUR` 0.4 /m (`chem3.js:77`) | Secchi ~3.8 m | Analogue Secchi 3.5–4.5 m (Baskahegan 3.7–4.7 at 46 SPU); the human: clearer | eefcece (2026-10-20, 0.5 → 0.4) with the plants' starts rebuilt | R\* | keep | Colour as a DOC field rising with flow (ENV §3 item 9) |
| `ICE.LIGHT_CUT` 0.6 (`config.js:493`; `chem3.js:153, 163, 201`) | 40 % of light under ice | 1–12 % under snowy ice (Maine LEA); ~30 % after rain clears the snow (ENV §1.1) | 0d5a46d (2026-10-12, 2-D) | **C / S** — the winter O₂ (FINDINGS.md:123-125), `M2_R`, the `ZOO3.Q10_C` calibration story, the gate's 5 → 3 mg/L | layered snow and ice optics | Snow, ice thickness, slush, late-winter convection |
| `ENV.O2_SED` 0.08 (`config.js:743`) | constant by Q10 | 0.2–0.39 g O₂/m²/d under ice, falling to 20–50 % by late winter (ENV §1.1) | 2026-10-15 (halved to the field's rate) | R (rate) | keep; add the decline | The labile store's winter decline |
| Gate: winter lake-mean O₂ ≥ 3 mg/L (`test/w3.mjs:282`) | 3 | Hot Brook is no winterkill lake (white perch winter in it) | lowered 5 → 3 at stage 7a (SESSION_STATE stage 7a) | C (a gate relaxed to fit) | back toward 5 with snow, convection and the demand's decline | — |
| `H3.RES_UPPER_D` 100 / `RES_LOWER_D` 55, constant (`env3.js:44`) | — | Monthly ×mean: Apr 3.3, Aug 0.30, Jan 0.6 (ENV §1.1) | stage 3 | R mean, U constant | hydrograph | Hydrograph, levels |
| `ENV.WEATHER_DWELL` × 1/TS; `H3.WIND_MS` per weather state; `ENV.TEMP_WEATHER` cooling only (`config.js:718, 727`; `env3.js:37`) | Spells 2–4× too long; wind tied to cloud | Fronts every 3–5 d; Caribou 2.5–3.9 m/s with a diel cycle (ENV §1.1) | 2-D compat | U | a weather generator | Year types, heat waves |
| `THERMAL.MIX_M` 6, `NIGHT_MIX_M` 6 (`config.js:504, 509`) | — | Unstratified; 1949: 74 °F at the surface, ~71 at the bottom | 2026-10-15 | R | keep | — |
| `CHEM3.BED_EXCH` 0.35, `BURY_MUL` 0.15 (0.10 since 2026-10-22), `REL_OXIC` 0.0015 (`chem3.js:59-70`) | P retention 0.64–0.75 | Larsen–Mercier 0.66–0.72 (the formula's complement — the field's R ~0.3–0.55; FINDINGS 2026-10-22) | stage 3 / 6b | R\* (fitted to a field target for a boundary layer the 3-D cells lack) | keep | — |
| `CHEM3.IN_NUT` 1.1 (`chem3.js:51`) | constant | DEP export coefficients by land use (ENV §1.2) | stage 3 ("to be re-judged") | U | real loads on the hydrograph | — |
| `PL3.MINERAL_Z` 1.6, `MINERAL_SHELTER` 4 (`plants3.js:138`) | sand under 1.6 m where exposed | Mud line EB23 = 2.291·F^0.549 (WBC:107-110) | stage 7a | U (proxy) | per column from env3's fetch | Substrate map |
| `PL3.WAVE_IS` 0.02 (`plants3.js:107`) | — | "at 0.25 none held, at 0.05 the lawns thinned" | stage 7a/h | C (mild; fitted to the persistence of rosettes the field has) | keep | — |
| `PL3.WOOD` 60, `WOOD_W` 15 m, `WOOD_Z` 2.5 (`plants3.js:191`) | spawning structure only | 300–600 logs/km on forested shore, ≤ 100 on fen (SGV:468-473); perch collapsed when wood was cut (SGV:453-457) | stage 7g | U | wood as fish cover and invertebrate substrate | Shore wood |
| `BIOE.M_OTHER` 0.5 (`config.js:159`) | uniform hazard | Birds, mammals, anglers: by depth, light, season (ENV §1.6) | 2-D | C (stand-in for every missing predator) — see `audit_predation.md` | partly replace by hazard fields | Birds, mammals, angling |

---

## 5. Were food-web parameters tuned to make a fish outcome come out? (the coordinator's question 3)

**Yes: tuned to a fish outcome.** Each entry gives the stated reason for the change.

*Crayfish*
- `LIT3.CR_PREF` 5: "5 propped up predators the old fish rule starved" (`littoral3.js:111-115`). stageR5 restores 1; the default still carries 5.

*The bed's food*
- `BENTHOS.G` 0.08 → 0.16, `K_FISH` 2 → 0.5, `REFUGE` 1.5 → 3, `SENSE_MIN`, and `SEDOM.PERI_G` 110 → 180. All came from the 2-D rounds that tried to make a 0.07-ha slice with no littoral zone self-sustaining (SESSION_STATE.md:1130-1230). The 3-D lakes have the littoral those values stood in for.
- `CHEM3.ALLOCH` 800: chosen on "3 seeds: late-summer starvation halves" (`chem3.js:83`).
- `CHEM3.BROOK_BENTH` 3: set because the brook's dace starved (`chem3.js:29-31`).

*Zooplankton and the young*
- `F3.K_ZOO` 60: chosen so the zooplankton holds its June peak with adults that ate it at every size (HOT_BROOK_3D.md:307-315). The 2-D's same constant was moved 60 → 25 for the opposite reason (`config.js:993`).
- `PLANKTON.R_D` 0.12 → 0.08: adult sunfish starved after the July crash (2-D).
- `PLANKTON.M2_R`: held rotifers down under the too-bright ice (2-D).
- `FRY.M_LARVA` 0.02 → 0.08 (2-D): to stop fry stripping the zooplankton. Its 3-D successor `M_LARVA3` / `M_JUV3` was calibrated to keep recruits "within ~15 % of the old rule's".
- `FRY.LARV_A` 0.3 → 0.1: to keep the killifish's, suckers' and redbreast's recruits.

*Littoral fauna*
- `LIT3.K_S` 0.3 and `FLOOR`: added after "the small collapsed in the second year".

*The surface*
- Surface food "taken as met": "under the f⁴ time-share a minor food got none".
- `S3.bass.insR` 2: arm S, after the bass ate ~1 % insects.

**Set from data, or a defensible fit to a field (not a fish) target.**
- The zooplankton physiology (`ZOO3`; the Daphnia set within the item-4 unit mapping).
- The weed refuge's magnitude (`PL3.REF_MAX`, PVI).
- The weed fauna per gram of plant (`LIT3.KAPPA`), emergence, and the land insects' rate (`FALL`).
- Snails and mussels.
- `KD_COLOUR`, and the P-retention calibration.
- `CR_OUT` under stageR5.

**Crayfish stock.** The default is Michigan's (U). stageR5's ⅕ follows the human, not a fish outcome, but the factor itself is a guess.

**Surface insect supply.** The rate is from data (Mehner 2005). The bank weighting overstates a spruce–fir shore by about 2× (LLS:53-56).

**Stacks: restore each set together, or the remaining members will mis-fire.**

| Set | Symptom it held | Members | Restore together with |
|---|---|---|---|
| Z (zooplankton) | Fry and adults strip the zooplankton | `K_ZOO` 60; `M_LARVA3` / `M_JUV3` / `LARV_A`; `LIT_FOOD`; (2-D `R_D`) | the young's prey switch; the littoral microcrustaceans; the microbial food for rotifers and cyclopoids; explicit invertebrate predators and birds; the hydrograph's winter low flow |
| B (bed food) | Fish starve on a bed with no littoral | `BENTHOS.G`, `K_FISH` / `K_BENTH`, `REFUGE`, `PERI_G`, `ALLOCH` | substrate map; epilithic and plant-associated fauna; epiphyton; a proportional refuge; mud emergence |
| W (winter) | Winter O₂ and plankton under ice | `ICE.LIGHT_CUT`; `M2_R`; the gate's 3 mg/L; (`ZOO3.Q10_C`'s calibration story) | snow and ice optics; late-winter convection; the bed's declining O₂ demand; hydrograph |
| K (crayfish) | Starving predators | `CR_PREF` 5; Michigan capacity; `CR_ROCK_Z` proxy | stageR5 as default; substrate; Ca; the predators' fish catch (`audit_predation.md`) |

---

## 6. Caveats on the CPU probe the coordinator quoted (`scratchpad probe/zshal.mjs`)

**The "zoo D/C/R" columns are g WET per 2-D cell, not µg/L.**
- The probe averages `ch.zooD[j]` by volume and prints it raw. One g/cell is 40.1 µg dry/L (`PLANKTON.UGL`; `node`: CELL_L 2,493 L).
- So "8/2/0" in late May is about 320 / 80 / under 20 µg/L, and the August "1/1–2" is about 40 / 40–80.
- The "exposed" column (`zooE / zv`) is in µg/L.

**The "bed" column divides `ch.benth` by the 3-D cell's bed area.**
- `benth` is grams per 2-D column, A2 = 8.2 m² (`chem3.js:20, 542`). So g/m² = benth / A2.
- The printed value is therefore g/m² × A2 / bedA, which varies by cell. It is not g/m².

The "weeds" columns (`lit.S`, `lit.L`) are g wet/m² and are correct.

---

## 7. MISSING ENVIRONMENT, prioritised

Priority scale:
- **P1** changes what the fish community does now, or is a stack's missing half.
- **P2** has a moderate effect, or is realism the human asked for.
- **P3** is completeness.

Items `environment_coverage.md` already sets out in full are cross-referenced (ENV §3 item n) and kept short.

| # | Missing | Evidence it matters here | Sim outcome it affects | Pri |
|---|---|---|---|---|
| 1 | **The young's prey switch** (zooplankton → bed and weeds by profitability, at field lengths). A rule, but the food web's largest gap | Perch > 50 mm to benthos when zooplankton is low (FZ:376); white perch ~40 mm (WP:201); Keast 1980's recovery from August (FZ:368) | The zooplankton's summer collapse and missing autumn recovery; the young's growth (killifish 1.5 cm by October vs 3.2–5) | **P1** |
| 2 | **Plant-associated (littoral) microcrustaceans**: chydorids, *Simocephalus*, *Sida*, *Eurycercus*, ostracods, *Hyalella* — a pool per bed cell bound to the plants (P/B rotifer-like, not advected, partial stem refuge, fed by epiphyton and detritus) | ~half of shallow-lake zooplankton (ZD:21); *Simocephalus* 11–171/L in beds (MA:413); young smallmouth > 90 % Sididae at Meddybemps (PDPM:272); bluegill/pumpkinseed < 75 mm 76–91 % vegetation prey (FF:132); WP:496 asks for a pool young white perch don't deplete | The small fishes' and every larva's food; killifish adults' ration (0.43–0.47); the weed refuge's meaning | **P1** |
| 3 | **The microbial food web** of a brown lake: DOC → bacteria → flagellates and ciliates → rotifers and cyclopoids (the sim's bacteria only respire DOM) | Rotifers ¼–⅓ of crustaceans (IPP:356), ~0 in the sim's summer; cyclopoids need animal prey (CD:115-133); DOC 4–5 mg/L, colour 18–46 (ENV §1.2) | Rotifers and nauplii for the late spawners' larvae; copepod persistence; winter zooplankton | **P1** |
| 4 | **Invertebrate predators**: *Chaoborus* (50–500/m²; no anoxic refuge here, IPP:288-290), predatory cyclopoids, odonate nymphs (35–55/m²; 15–25 % BW/day, LI:503; the 2-D has them), plant-dwelling insects that took ~80 % of cladocerans (MA:418) | They are what `M2_R`, `M_D`/`M_C`, `M_LARVA3` and `LARV_A` stand for; nymphs eat larvae < 15–25 mm | Larval mortality by place and season (replacing flat rates); zooplankton mortality; food for perch and white perch (*Chaoborus*) | **P1–P2** |
| 5 | **A substrate map**: rock and cobble (60–75 % of shore), sand (Upper's NE beach), mud, wetland edge, wood, leaf packs; mud line from fetch (EB23) | MDIFW "mostly rocky", the human's cobble dock shore bare to 0.6 m (SGV:62-64, 516-529; WBS:263); crayfish prefer rock, sparse on muck (IPP:26, 110) | Crayfish shelter (now depth < 1.5 m), the stony-shore fauna, young bass and redbreast cover (`rockC`), bass nests, rosettes, mussels, the bed's refuge | **P1** |
| 6 | **Stony-shore (epilithic) fauna and periphyton grazers**: mayflies, caddis, *Hyalella*, chironomids on stones and wave-washed sand; and **epiphyton** on the plants as the weed fauna's food | Bare lit bed now 0.1 g/m² (`littoral3.js:25`); epiphyton 100–400 µg chl/g plant (LI:93); the killifish strip's food is "the next question" (PLAN.md:57) | The killifish, young bass, dace and fallfish of the shallows; the weed fauna's resistance to cropping (field 2–2.5× fall, sim 10–20×) | **P1** |
| 7 | **Hydrograph, levels and the winter low flow** (ENV §3 item 4) | Monthly ×mean Apr 3.3, Aug 0.30, Jan 0.6 | Winter zooplankton flushing (§2.2); summer nutrients; the brook's passability; dry years | **P1** |
| 8 | **Snow, ice optics, late-winter convection, the demand's decline** (ENV §3 item 1) | 1–12 % light under snowy ice; FINDINGS.md:123-125 | Winter algae, zooplankton and O₂; the stack W | **P1** |
| 9 | **Birds and mammals as predators**: belted kingfisher (fish ≤ 10 cm in < 60 cm of water; 10.5–18.7 % killifish in Maritime pellets), great blue heron, common and hooded mergansers (a brood seen), loon, osprey, bald eagle (nesting on Upper), otter, mink (ENV §1.6, §3 item 5) | The shallow strip is risk-free from above; `M_OTHER` is uniform | Where small fish and the young live and die; larval and juvenile Z by place | **P1** (hazard field) |
| 10 | **Emergence from the mud**: chironomids, *Hexagenia* (50–300/m²; Maine dusk hatch late June–mid July) | IPP:246-258; LLS:241 (0.7–1.1 g DW/m²/yr lake-wide, the sim 0.6 on the vegetated littoral only) | Surface food at dusk, perch and bass feeding, white perch's mayflies (Cooper: 44 % of adult food) | P2 |
| 11 | **Shore wood as cover and invertebrate substrate**; leaf packs | 300–600 logs/km (SGV:468-473); perch collapsed with wood removal (SGV:453-457); leaf packs colonised in 2 days (LLS:101-104) | Perch and young fish cover; bass structure; invertebrates near shore | P2 |
| 12 | **Shoreline vegetation types for fall-in** (conifer 0.4–0.6×, deciduous 1.7–4×, grass 0.6, camps 0.05–0.2) | LLS:53-56 | Surface food for fallfish, redbreast, killifish adults, bass | P2 |
| 13 | **The brook's drift** (1.3–6.1 animals/m³, ×10 at night) and the **outlet's zooplankton stripping** (~41 %/100 m) | BF:33, 43-44; ENV §1.5 | Dace, fallfish, the pools' sunfish; Lower's zooplankton import | P2 |
| 14 | **The streams as boundaries**: the inflow and outlet runs (sucker, fallfish, white perch spawning runs), emigration over Lower's outlet, immigration; **sea-run alewife** (MDIFW 2024) | ENV §1.7; sea_run_alewife.md (anadromous lakes lose large cladocerans from late June to October — Post 2008, SA:313-315) | Recruitment and gene flow; alewife will deepen the zooplankton question and feed the predators | P1/P2 (alewife), P2 |
| 15 | **Frogs, tadpoles, turtles in 3-D** (the 2-D has them) | Tadpoles graze periphyton; frogs are pickerel and bass prey; the human: "lots of frogs", bullfrogs, turtles (ENV §1.6) | Littoral grazing; predator diets | P2 |
| 16 | **Mussels' full role**: host-specific recruitment, the recorded yellow lampmussel, biodeposits as bed food, otter/muskrat/raccoon predation | IPP:139-190; MFM; the human: lots of mussels | Algae and rotifer filtering; bed food near beds | P2 |
| 17 | **Anglers** (harvest, catch-and-release losses, ice fishing for pickerel and perch) | ENV §1.8 | The adults' M by species and size; part of `M_OTHER` | P2 |
| 18 | **Calcium as a state** (gating snails and crayfish) | Ca 2–4 mg/L inferred; crayfish vanish below ~2 (PEA:175; LI:171) | The crayfish and snail stocks; the bass's crayfish share | P2 |
| 19 | **Wind-drift accumulation** of surface insects and zooplankton on downwind shores (windrows) [inf: no note] | — | Where surface feeders and small fish find food | P3 |
| 20 | **Groundwater and springs** (10–30 % of inflow at 6–8 °C [inf]) | ENV §1.1 | Winter refugia, summer cool water in coves | P3 |
| 21 | **Moonlight** | ENV §3 item 22 | Night feeding by esocids and planktivores | P3 |
| 22 | Seiches (19-min, 3 cm) | ENV §1.1: negligible | — | (none) |

---

## 8. Suggested order

1. **Measure first.** Add the gate checks of finding 10, and a fate tally of the zooplankton's production by consumer: young by species, adults, bladderworts, mussels, outflow. Fix the probe units (§6).
2. **Stack Z (zooplankton).** Build the young's prey switch (rule), the littoral microcrustacean pool, and microbial food for rotifers and cyclopoids. Then re-fit `K_ZOO` toward 10–20 µg/L, and `M2_R`. Then rebuild larval mortality from explicit predators and birds, and restore `LARV_A`.
3. **Stack B (bed food).** Build the substrate map (fetch, photos, the human's shore notes), the epilithic fauna, the epiphyton, and a proportional refuge. Then bring `BENTHOS.G` toward P/B ~5–10 and unify `K_FISH`/`K_BENTH`. Re-fit `PERI_G` to the bed's light. Split `ALLOCH`.
4. **Stack W (winter)** with the hydrograph: snow and ice optics, convection, the demand's decline, winter low flow. Then retire the `LIGHT_CUT` compensation and restore the gate's winter O₂ toward 5 mg/L.
5. **Stack K (crayfish).** Make stageR5 the default, then substrate × Ca. Judge the bass's crayfish share only after the predation rule is fixed (`audit_predation.md`).
6. **Judge on ≥ 3 seeds × ≥ 3 years.** Targets: crustaceans 30–80 µg/L summer and 10–20 under ice (copepods ≥ 70 %); rotifers ¼–⅓; the weed fauna falling ≤ 3× under fish; bed production 50–80 g wet/m²/yr; the young at field lengths (killifish 2.6–3.2 cm by late September).
