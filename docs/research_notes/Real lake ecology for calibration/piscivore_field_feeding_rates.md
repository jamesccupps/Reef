# How much wild smallmouth bass and chain pickerel really eat, how often they strike, and why they stay below satiation

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine: shallow (mean 2.4–3.3 m), unstratified, tea-coloured soft water, Secchi ~3–4 m, few crayfish, ice ~December–April. Prey: yellow perch, white perch, pumpkinseed, redbreast, banded killifish, fallfish, blacknose dace, brown bullhead, white sucker.

**The sim problem.** With `F3.STRIKE2` on (`src/w3/fish3.js` `_strike2`, `PRED3`), bass find catchable fish so easily that they eat at **0.5–0.9 of FB4 Cmax** all summer and grow **~15 cm a year**. Maine smallmouth grow ~4 cm a year at 26 cm, which on the sim's FB4 set (Whitledge et al. 2003) means a season-long p ≈ 0.3. The rule is:
- encounters E = π·RD²·(u + v)·N, with RD = `strikeR` (bass 1.0 m) × light, u = `ENC_U` 0.1 m/s, v = bass hunting speed 0.2 m/s, and N = prey per m³ within `ENC_R` 6 m;
- strikes S = aMax·E/(E + E_h), with aMax 12 h⁻¹ (bass) or 3 h⁻¹ (pickerel) and E_h = `ENC_EH` 30 h⁻¹;
- capture by prey kind and size (`CS3`, `PPR0`);
- hunting share `act` by day / twilight / night: bass [0.3, 0.3, 0.1], pickerel [0.15, 0.2, 0.02];
- the only gate is the gut's room (`_feed`: room = 8 % of body mass for bass, less what is in it).

**How this note relates to the repo's notes.** It extends, and does not repeat:
- **PEA** = `Real lake ecology for calibration/piscivore_encounter_attack.md`: lab strike rates, capture per strike, RD, the STRIKE2 design; §3 and Addendum 2 hold Diana's pike meals, Vigg's 2.9 %BW/d, the Mille Lacs per-fish totals, and He & Wurtsbaugh evacuation.
- **RTF** = `Whole lake 3D fish simulation/realtime_foraging.md`: time budgets (Bevelhimer, Diana, Cooke), rations and evacuation (§2–§4).
- **PDPM** = `Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`: diet targets (§2.6, §7.1).
- **SHH** = `…/smallmouth_horizontal_habitat.md`: activity budget and speeds (Bevelhimer, Ridgway, Bloomfield).
- **JRB** = `…/juvenile_refuges_and_bass_young.md`.
- **LMB** = `…/largemouth_bass.md`: Rice & Cochran's seasonal p, Cochran & Adelman's ration.
- **PWE** = `Predator winter energetics/predator_winter_energetics.md`: the cold-water respiration correction.
- **FSR** = `fetched_sources_read_by_me.md`: Cooper 1941's Maine stomach tables.

**What is new here:**
- the sim's own FB4 set run on the Hot Brook calendar, giving **p and ration by month and kg a year by bass size**;
- field rations and p-values from Mille Lacs, Oneida, the Bay of Quinte, Windermere and the Alberta reservoirs;
- **diets of smallmouth where crayfish are scarce** (Provoking Lake, Ontario; Wentzells Lake, Nova Scotia);
- **Nova Scotia bass growth and condition**, the closest analogue to Maine, which is slower where pickerel are present;
- **why wild piscivores stay below satiation**: prey detect bass first and keep out of reach, prey vacate predator habitat, interference, and ~2–3× spare gut capacity;
- **density-dependent growth coefficients** for Opeongo smallmouth;
- field strike, encounter and time-hunting numbers (§2);
- **a diagnosis of which STRIKE2 parameters are too high** (Implications).

**Method.** One pass by the author plus three parallel sub-researchers: field strike rates (§2); why piscivores feed below Cmax (§3); and crayfish-poor diets plus esocid consumption (§4, §1.3). Their load-bearing numbers were checked against the full texts where those could be fetched (Dunlop 2005 Tables 3–4, MacMillan 2002 Table 2, Nelson 2017), and the author read Shuter & Ridgway 2002, IR 576, Lantry 2008 and Brinkmann 2015 directly.

**Tags.**
- [FT]: full text read;
- [ABS]: abstract read;
- [SEC]: secondary source or search digest;
- [derived]: my arithmetic, or the sim's code run in Node.

**Instructions seen in fetched content.** The OpenAlex API returned a rate-limit notice telling AI agents to create an API key by POSTing the user's e-mail address. Two researchers met it independently. It was not acted on, and no key or account was created.

---

## Takeaway
- **Maine-speed growth on the sim's own bass set needs a season-long p of ~0.3–0.35**: about 0.7–1.1 kg of food a year, ~1.1–2.5 %BW/d in July–August, ~1 fish a day in late summer. The one comparable whole-lake estimate is 0.87 kg per smallmouth a year (Mille Lacs). The sim's 0.5–0.9 is about 2× too high and gives its ~15 cm/yr.
- **Wild piscivores strike rarely.** No field study counts strikes per hour. From kills per day, time active and capture success, a wild smallmouth makes **~0.3 strikes at fish per hunting hour (~0.1 h⁻¹ over all daylight)**; the sim's bass makes up to 12. Pike and pickerel eat a meal every 2–3 days.
- **They stay below satiation for reasons the sim lacks:**
  - prey see them first and keep out of reach, or have left (or never colonised) the water they hunt;
  - wild guts run at a third to a half of capacity;
  - interference and crowding.
  - Density-dependent growth is real (Opeongo) but small at adult ages.
  - In Nova Scotia's soft lakes, bass sharing water with chain pickerel stay small and thin (Wr ~77).
- **Where crayfish are scarce, adult bass eat insects, not more fish.** Insects were 61–72 % of the diet at Provoking and > 99 % of invertebrates at Wentzells, NS, with slow growth and 30–50 % empty stomachs. Hot Brook's adult target should be ~50–65 % fish, 25–40 % insects, ≤ 10–15 % crayfish.
- **For the sim** (Implications):
  - the main lever is a **hunger gate** on hunting and all foraging (hunt only while the gut holds < ~0.5 %BW), not the 8 %-BW gut;
  - then **bass aMax 12 → 2–3 h⁻¹**, a twilight-weighted `act`, hunting speed 0.1 m/s, and a prey-vigilance factor;
  - a toy run with these gives p ≈ 0.35, ~1–1.5 fish a day and ~0.4–0.8 %BW in the stomach.

## Summary: the numbers that matter

| Quantity | Value | Basis |
|---|---|---|
| **p that gives Maine growth on the sim's own bass set** (26 → 30 cm, Hot Brook calendar) | **0.34** constant (0.36 for a spawning female, 0.44 for a nesting male); 0.30 at 30 → 33 cm, 0.28 at 33 → 36.5 cm, 0.40 at 21 → 26 cm | §1.1 [derived] |
| p by month that also gives Maine growth | May 0.20, Jun 0.25, Jul 0.36, Aug 0.43, Sep 0.46, Oct 0.41, Nov 0.15, Dec–Apr ≈ 0 | §1.1 [derived], after Rice & Cochran's three-interval p (LMB) |
| **Annual food per bass** | 26–30 cm (250–400 g): **0.82 kg**; 30–33 cm: 0.95–0.99 kg; 33–36.5 cm: 1.09 kg; 21–26 cm: 0.68 kg (1.7–3.4× the fish's mean mass) | §1.1 [derived] |
| Field check: whole-lake bioenergetics | Mille Lacs **0.87 kg per smallmouth per year**; 2.1–2.3 kg per pike | Ahrenstorff & Holbrook 2016 [FT] |
| Summer ration (July–August) | **1.1–2.5 %BW/d ≈ 5–9 g/day** for a 250–750-g bass (FB4 Cmax 4.3–6.5 %BW/d) | §1.1 [derived] |
| Field rations of wild percid piscivores, northern lake | Oneida walleye, June–October: **0.9–3.8 %BW/d** by age (age 3+: 0.9–2.5); week-to-week CV 45–97 % | Lantry et al. 2008 [FT] |
| p from field bioenergetics, black bass | smallmouth **0.26–0.30** (Smith Mountain Lake, VA); largemouth 0.39–0.44 (WA reservoir); p moves ~1.7× with the activity assumption (wild largemouth: 0.62 → 0.37) | Moore 1988 [SEC]; Reeve et al. 2025 [FT] |
| Spare gut capacity in wild fish | predators carry **2–3× the digestive capacity of their mean intake** (639 estimates, 38 species) | Armstrong & Schindler 2011 [ABS] |
| Empty stomachs, adult smallmouth | **35 % (Opeongo), 40 % (Provoking)**, 23–50 % across years; 14 % after transplant to a richer lake | Dunlop et al. 2005 [FT] |
| Stomach contents, adult smallmouth | **1.9 g (Provoking) vs 4.3 g (Opeongo)**; prey 25 vs 38 mm | Dunlop et al. 2005 [FT] |
| Prey keep away | bluegill detected a bass at ~2 m (bass saw them at ~1.1 m) and kept **≥ 2 m** from a 44-cm bass when they could | Howick & O'Brien 1983 [FT] |
| Capture per attack, smallmouth on benthic prey | 1,510 reactions → 630 attacks → 164 kept: **26 % per attack**, 11 % per reaction | Michels 2020 [FT] |
| Density effect on bass growth (Opeongo) | elasticity of growth to the density of ages 1–4: −0.22 / −0.155 / −0.083 / −0.038 at ages 1 / 2 / 3 / 4; **+7–9 % per +1 °C** of summer air temperature | Shuter & Ridgway 2002 [FT] |
| Nova Scotia bass | Wr 73–86 (mean 77); L∞ 30–61 cm; **every lake with L∞ < 50 cm but one holds chain pickerel**; at L∞ 50, K 0.18 a 26-cm bass grows ~4 cm/yr | MacMillan et al. 2002 [FT] |
| **Crayfish-poor diets** | Provoking: **insects 61–72 %**, crayfish 2–14 %, fish 3–16 %; Wentzells Lake, NS (no native crayfish): **> 99 % invertebrates by weight** (60 % dragonfly nymphs) | Dunlop 2005 [FT]; Feener & MacLeod 2020 [FT] |
| Maine smallmouth (Cooper 1941) | white perch 61 %, crayfish 14 %, yellow perch 14 %, insects 4 % of food volume (36 stomachs with food) | FSR [FT] |
| Pike / pickerel annual food | Windermere pike **Q/B 2.7–3.8 yr⁻¹**; Mille Lacs 2.1–2.3 kg per pike; FB4 (published set) 40-cm pickerel 2.8 kg at p 0.53, or **~1.7–2.3 kg at p 0.33–0.43 once cold respiration is corrected** | Johnson 1966 [ABS]; IR 576 [FT]; §1.3 [derived] |
| **Fish killed a day, summer** | smallmouth 30–35 cm **~1 (0.3–2)**, all items 1–4; pike/pickerel 40 cm **0.4–0.8**, a meal every 2–3 days (Diana: 2.7–2.8 days in summer) | §2 [derived from field rations, stomachs, evacuation] |
| **Strikes at fish per hunting hour** | smallmouth **~0.3 (0.1–0.9)**; pike ~0.5 (0.15–1); **~0.1 h⁻¹ averaged over daylight** | §2 [derived]; no direct field count exists |
| Stomach load, wild smallmouth | **1.09 items, 4.6 g ≈ 0.4 %BW** (422-mm bass, Lake Ontario) | Nelson et al. 2017 [FT] |
| Time active | pike burst-active **~5 %** of time, long (feeding) bursts followed by > 24 h quiet; smallmouth movement peaks after sunrise and after sunset | Beaumont et al. 2005 [FT]; Todd & Rabeni 1989 [ABS] |
| Smallmouth evacuation, one 4-g fish, 550-g bass | 90 % in **10 h at 20 °C, 6 h at 24 °C** (the sim's bass: 22–28 h) | Rogers & Burley form [FT, USGS] |
| Nesting males | stop feeding **3–7 weeks** | Zweiacker & Summerfelt 1974 [FT]; LaHave 2025 [FT] |

---

## 1. Field consumption: kg a year, %BW a day by month, Q/B, p

### Takeaway
- **On the sim's own FB4 smallmouth set and the Hot Brook calendar, Maine growth needs a season-long p of about 0.3–0.35** for 26–36-cm bass. Females that spawn need 0.32–0.36. A nesting male that eats little for three weeks needs 0.44 for the rest of the year.
- That is **0.7–1.1 kg of food a year per bass** of 140–740 g, 1.7–3.4× the fish's mean mass. In July–August it is **1.1–2.5 %BW/d (5–9 g a day)**, against an FB4 Cmax of 4.3–6.5 %BW/d.
- **The one whole-lake field estimate that fits agrees.** At Mille Lacs, Minnesota, 28 million g a year was eaten by ~32,000 smallmouth: **0.87 kg per bass**.
- **Wild northern piscivores eat ~1–3 %BW/d in summer, very unevenly.** Oneida walleye's weekly rations varied with a CV of 45–97 %. A season-long p of 0.3–0.5 is the norm, low in spring and highest in late summer (Rice & Cochran 1984, LMB).
- **The sim's 0.5–0.9 all summer would grow a 26-cm bass to 36–53 cm in one year** on the same set (§1.1). The sim's ~15 cm/yr is that.
- **Esocids:** pike Q/B is ~2.7–3.8 yr⁻¹ (Windermere), and Mille Lacs pike eat ~2.1–2.3 kg a year each. On the published FB4 pike set a 40-cm pickerel needs p ≈ 0.53 (2.8 kg/yr), but that set's cold-water metabolism is 2–4× too high (PWE; Chipps 2000; Wahl & Stein 1991). With it corrected, **p ≈ 0.33–0.43 and 1.7–2.3 kg/yr**.

### 1.1 The sim's own bass set on the Hot Brook calendar [derived]
**Set-up.** A Node script imported `src/bioenergetics.js`, `species.js` `BIO.bass` and `config.js` `seasonalTemp`, and ran one year from 1 March with no edits to the repo:
- `BIO.bass`: Whitledge et al. 2003, the hot row above 26 °C, and the cold rule below 15–18 °C;
- `seasonalTemp`: the Maine calendar, with a 24 °C peak at the end of July and 208 days below 10 °C;
- prey energy density 4,186 J/g;
- FB4 routine activity. The sim's extra swimming cost is not included, so the sim's own p would need to be slightly higher.

It then found the p that grows a bass along the Maine von Bertalanffy curve used in `species.js` (L∞ 56.4, k 0.14: ~26, 30, 33.4, 36.5 cm at ages 4–7).

| Case | p (constant) | Annual food | Food ÷ mean mass |
|---|---|---|---|
| 21.5 → 26.3 cm (136 → 260 g) | 0.40 | 0.68 kg | 3.4 |
| **26 → 30 cm (251 → 396 g), somatic** | **0.34** | **0.82 kg** | 2.5 |
| 26 → 30 cm, female spawning 8 % of mass | 0.36 | 0.84 kg | 2.6 |
| 26 → 30 cm, male: 3 weeks on a nest at p × 0.2 and respiration × 1.6 | 0.44 | 0.84 kg | 2.6 |
| 30 → 33.4 cm (396 → 558 g) | 0.30 (0.32 with gonads) | 0.95–0.99 kg | 2.0–2.1 |
| 33.4 → 36.5 cm (558 → 742 g) | 0.28 | 1.09 kg | 1.7 |

**By month**, 26 → 30 cm at constant p 0.34 (the same bass):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec–Feb |
|---|---|---|---|---|---|---|---|---|---|---|
| Mean T (°C) | 0.3 | 1.9 | 11.5 | 19.8 | 23.3 | 23.0 | 18.5 | 10.5 | 4.1 | 0.3–0.5 |
| Cmax (%BW/d) | 0.08 | 0.15 | 1.86 | 5.41 | 5.54 | 5.37 | 4.30 | 1.17 | 0.22 | 0.06–0.07 |
| Ration (%BW/d) | 0.03 | 0.05 | 0.62 | 1.73 | 1.79 | 1.71 | 1.37 | 0.40 | 0.08 | 0.02 |
| g/day | 0.1 | 0.1 | 1.5 | 4.9 | 5.8 | 6.3 | 5.9 | 1.7 | 0.3 | 0.1 |
| g/month | 2 | 4 | 48 | 148 | 179 | 190 | 176 | 54 | 10 | 3 each |

June–September take 85 % of the year's food.

**A seasonal p that also gives Maine growth.** This uses the shape of Rice & Cochran 1984: low through spawning and before the year's young are catchable, highest in late summer.

| | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec–Mar |
|---|---|---|---|---|---|---|---|---|---|
| p | 0.10 | 0.20 | 0.25 | 0.36 | 0.43 | 0.46 | 0.41 | 0.15 | 0 |
| Ration (%BW/d) | 0.01 | 0.38 | 1.43 | 2.07 | 2.37 | 1.95 | 0.47 | 0.03 | 0 |
| g/day (26 → 30 cm) | 0 | 0.9 | 3.4 | 5.3 | 7.2 | 7.6 | 2.1 | 0.1 | 0 |

The year's food is again 0.81 kg. For 30 → 33.4 cm with gonads, the same shape scaled by 0.95 gives 0.98 kg.

**What the sim's p does.** With p 0.5 / 0.7 / 0.9 whenever the water is > 15 °C (and 0.4× that below), the same 26-cm bass ends the year at **35.9 / 44.8 / 53.4 cm** (0.7 / 1.4 / 2.5 kg), eating **1.4 / 2.7 / 4.5 kg**.

### 1.2 Smallmouth and other black bass: field estimates
- **Mille Lacs, Minnesota** — Ahrenstorff & Holbrook 2016, MN DNR Investigational Report 576, [PDF](https://files.dnr.state.mn.us/publications/fisheries/investigational_reports/576.pdf) [FT]:
  - smallmouth population consumption was 28.2 and 27.8 million g a year (Oct–Sep 2012–13 and 2013–14), for about 32,000 bass, i.e. **≈ 0.87 kg per bass per year** [derived division];
  - 514 smallmouth diets were dominated by crayfish and cisco; pike, ~75,000 fish, ate 159.9–170.0 million g, **≈ 2.1–2.3 kg per pike**;
  - the model used Shuter & Post's smallmouth set with RA 0.009 (Table 1);
  - no p is reported. The bass are large: Mille Lacs is a trophy fishery, and sampling was split at 305 mm.
- **Oneida Lake walleye, the nearest analogue for a wild percid piscivore in a shallow northern lake** — Lantry et al. 2008, TAFS 137:1406, [doi:10.1577/T07-051.1](https://doi.org/10.1577/T07-051.1), [PDF](https://www.esf.edu/biology/faculty/documents/66.Lantryetal2008walleye.pdf) [FT]:
  - weekly stomach-based rations, June–October, Table 2: age 1 2.48–3.80 %BW/d; age 2 1.62–2.70; age 3 1.36–2.48; age 4 2.07–2.90; ages 5–7 0.87–1.72;
  - **within a year and age, week-to-week CV was 45–97 %**;
  - the FB model over-predicted rations below 3.7 %BW/d (mean deviation 14 %, single weeks −93 % to +364 %).
- **Columbia River reservoir smallmouth:** 2.9 %BW/d averaged April–August (Vigg et al. 1991, PEA Addendum 2) — a warm, fast-growing population, about 1.6× the Hot Brook July value above.
- **Smith Mountain Lake, Virginia, smallmouth: p = 0.26–0.30.** A Washington reservoir's largemouth: p = 0.39–0.44. Both cited in Wolf et al. 2022, *West. N. Am. Nat.* 82(3), [doi:10.3398/064.082.0306](https://doi.org/10.3398/064.082.0306) [SEC; the original is Moore 1988, a scanned Virginia Tech PhD]. The same paper reports p highest at age 2 (0.54) in Starvation Reservoir, Utah, and falling with age [SEC, search digest].
- **Bay of Quinte Ecopath, Lake Ontario: smallmouth B 0.06 t/km², P/B 0.35, Q/B 4.07 yr⁻¹** (an allometric input, not a measurement) — Blukacz-Richards & Koops, Supplement 1, [PDF](https://aehms.org/wp-content/uploads/2018/08/Blukacz-Richards-and-Koops-Supplement.pdf) [FT]. Hot Brook's derived 1.7–3.4 is lower, as it should be: 208 days a year are below 10 °C.
- **Lake Cascade, Idaho:** 3.4 kg of yellow perch per smallmouth a year, with perch about 45 % of the bass's diet energy (PDPM §2.5) — another fast-growing western population.
- **p depends on the model's activity term.** For wild largemouth carrying heart-rate loggers over winter, p was 0.62 on the original model, 0.53 on the updated one and **0.37 with logger-informed activity**. The fish were inactive only ~2 % of the day in fall and burst-swam 0.1 % of the time. Reeve et al. 2025, CJFAS 82:1–16, [doi:10.1139/cjfas-2024-0254](https://doi.org/10.1139/cjfas-2024-0254) [FT, sub-researcher].
- **Bioenergetics models are biased by ration.** Across 7 models in the lab, growth was over-estimated 2–3× at high consumption and under-estimated 2–5× at low consumption; ration explained 70–96 % of the error. Bajer, Whitledge & Hayward 2004, CJFAS 61:2158, [doi:10.1139/F04-159](https://doi.org/10.1139/F04-159) [ABS].
- **Wild fish carry spare gut.** Across 639 load-to-capacity estimates from 38 wild species, predators had **2–3× more digestive capacity than their mean intake**, i.e. mean intake ≈ 0.33–0.5 of capacity. The authors read this as an adaptation to highly variable ("feast and famine") encounters. Armstrong & Schindler 2011, *Nature* 476:84, [doi:10.1038/nature10240](https://doi.org/10.1038/nature10240) [ABS].
- **The Whitledge et al. 2003 test was lab-only.** It used 100–270-g fish fed ad libitum at 22 °C, then 2.5 %BW/d at 22 °C, then 2 %BW/d at 27 °C. No field populations were used, despite later citations ([OUP abstract](https://academic.oup.com/tafs/article/132/2/316/7880738)) [ABS].

### 1.3 Pike and pickerel: field estimates
- **Windermere pike, England** — Johnson 1966, JFRBC, [doi:10.1139/f66-142](https://doi.org/10.1139/f66-142) [ABS, sub-researcher]:
  - before exploitation: biomass 8,182 kg, consumption 22,124 kg a year, **Q/B 2.7**;
  - after ten years of fishing: 4,349 kg and 16,563 kg/yr, **Q/B 3.8**. Thinner stocks ate more per kilogram.
- **Mille Lacs pike:** about 2.1–2.3 kg per pike per year (above).
- **Alberta reservoirs** — Brinkmann 2015, PhD thesis, U. Lethbridge, [PDF](https://opus.uleth.ca/server/api/core/bitstreams/4d97d577-ee92-4178-87d7-c7bc9288ab6e/content) [FT]:
  - method: a tracer (Cs/Hg) mass balance, giving the annual-mean ration in productive reservoirs with ~230 ice-free days;
  - piscivorous pike ate **0.032 g/g/d at age 2+, falling to 0.013 at age 7+** (15.6–72.3 g/d), i.e. ~4.7–12 g/g/yr. This is an upper bound for a rich water.
  - **Field activity multipliers were 3.4 at age 2+, falling to 2.0 at age 7+**: wild pike burned 2–3.4× the standard metabolism.
  - Pike forced onto amphipods ate more mass but ~1.5× fewer kJ, and grew slowly.
- **Upper Flathead River, Montana:** 1,200–1,300 pike ate 8.0 t of fish a year, **≈ 6.4 kg per pike** [derived] — large pike in river sloughs. Muhlfeld et al. 2008, NAJFM 28:636, [doi:10.1577/M07-004.1](https://doi.org/10.1577/M07-004.1) [ABS].
- **Lac Ste. Anne** (Diana 1979, CJZ 57:2121, [doi:10.1139/z79-279](https://doi.org/10.1139/z79-279) [ABS]):
  - ration was high May–August, **peaking in June**, and very low in winter;
  - both sexes fasted at spawning;
  - female rations were 1.5–2.3× males';
  - rare large prey (suckers, burbot) dominated calories.
  - Diana 1983 judged his field rations "probably inaccurate" against his model ([doi:10.1139/z83-259](https://doi.org/10.1139/z83-259)) [ABS].
  - The numeric tables are paywalled.
- **The esocid model over-predicts in the cold:**
  - tiger muskellunge consumption was over-estimated by **113–328 % at 7.5–10 °C** and by 4–58 % at 20–25 °C, worst at low ration (Chipps, Einfalt & Wahl 2000, TAFS 129:186) [ABS];
  - young-of-year esocids in Ohio reservoirs (~125–210 mm, September–April) needed **p 0.7–0.9, and > 1 (to 1.6) in November–December**, and halving metabolism fixed most of the error (Wahl & Stein 1991, TAFS 120:230) [FT, sub-researcher].
  - **Correction to PEA Addendum 2:** that paper is on young-of-year fish, and its abstract's over-estimate is **39–52 %**, not 32–59 % (32–52 % in the text is the under-estimate of mass).
  - Older pike models needed p > 1 (1.15–1.72) to reproduce Minnesota pike growth (Jacobson 1992, MN DNR IR 424) [FT, sub-researcher].
  - Finnish adult pike: stomach-based estimates were about half the bioenergetics estimates (Heikinheimo & Korhonen 1996) [SEC].
- **Chain pickerel: no published ration or p exists.** The sub-researcher's FB4 runs used the pike set (Bevelhimer 1985, as in `species.js`), Maine monthly temperatures, observed growth and a 10 % gonad:

  | | p (published set) | Annual food | %BW/d Jun / Jul–Aug / Sep | p with 0.5–0.75× respiration | Food with that |
  |---|---|---|---|---|---|
  | 40 → 47 cm pickerel (412 → 694 g) | 0.53 | 2.8 kg (5.0 g/g/yr) | 2.6 / 3.4 / 2.4 | **0.33–0.43** | **1.7–2.3 kg** |
  | 50 → 56 cm pike (830 → 1,179 g) | 0.51 | 4.3 kg (4.3 g/g/yr) | 2.2 / 2.9 / 2.1 | 0.31–0.41 | 2.6–3.5 kg |

  - On the published set, maintenance alone is 3.5–4.0 g/g/yr, already at or above the field totals above (Windermere 2.7–3.8; Mille Lacs). That is the cold-respiration excess PWE corrects with a cold rule.
  - **On the sim's own pickerel set**, with its cold rule (respiration × 0.5 at ≤ 8 °C, blended to 15 °C) and the Hot Brook calendar [derived, same script as §1.1]:

    | Growth | p | Annual food | %BW/d Jun / Jul / Aug |
    |---|---|---|---|
    | 40 → 44.5 cm (the sim's VB) | **0.39** (0.46 without the cold rule) | **1.8 kg** (3.6 g/g/yr) | 2.1 / 2.6 / 2.5 |
    | 40 → 47 cm (MDIFW) | 0.42 (0.49) | 2.1 kg (3.8 g/g/yr) | 2.3 / 2.7 / 2.6 |
- **Pickerel feeding season:** in Florida (Buntz 1966, [SEAFWA PDF](https://seafwa.org/sites/default/files/journal-articles/BUNTZ-315.pdf) [FT]):
  - 115 adults (mean 49.5 cm), 61.7 % empty, 47 prey in 44 fish, mean prey 15 cm;
  - **> 75 % fed in January but only 3–5 % in July** (> 40 % in a 3-day August cool spell);
  - this is heat depression at the warm end of the range. For Hot Brook (24 °C peak) it means a mild midsummer dip at most.

### Disagreements
- **FB-fitted p vs field truth.** Every source agrees wild piscivores sit near p 0.3–0.5 on the models' own terms. But the models' activity and cold-respiration terms move p by 1.5–2× (Reeve 2025; Brinkmann's 2–3.4× field activity; Wahl & Stein). For the sim, what matters is **p on the sim's own set** (§1.1), checked against growth and against stomach evidence: empty fraction, contents and items.

### Gaps
- No FB4 p for smallmouth in a northern natural lake was found in full text. Moore's 0.26–0.30 (Virginia) is secondary.
- Vigg et al. 1991's monthly rations and Liao et al. 2004's Spirit Lake per-species consumption are paywalled.
- No chain pickerel ration exists anywhere.

---

## 2. Field encounter, attack and capture rates, and time spent hunting

### Takeaway
- **No published field study counts strikes or kills per hour for wild bass or esocids.**
  - The one field study of encounter rates per hour (Turesson & Brönmark 2007, video in 15 lakes) stayed behind a login, and nobody quotes its numbers.
  - A 2016 review of biologging found "no studies … [that] quantified foraging behaviour in the wild" with accelerometers (Cooke et al. 2016).
- **What the field does pin down is kills per day and time active.** Per-hour rates follow by division [derived]:

  | | Smallmouth 30–35 cm, July–August | Pike / pickerel ~40 cm, summer |
  |---|---|---|
  | Fish killed per 24 h | **~1 (0.3–2)**; all items 1–4 | **0.4–0.8**; a meal every 2–3 days |
  | Hours hunting a day | ~6 (moving 42 % of daylight) | ~3 (active in 16–22 % of daylight intervals) |
  | Kills per hunting hour | **~0.17 (0.05–0.35)** | **~0.2 (0.1–0.3)** |
  | Strikes at fish per hunting hour | **~0.3 (0.1–0.9)**, ~2 a day | **~0.5 (0.15–1)**, ~1.7 a day |
  | Averaged over all daylight | ~0.1 strikes h⁻¹ | ~0.1 strikes h⁻¹ |

  **The sim's bass strikes at up to 12 h⁻¹ while hunting, 13–40× the field's strike rate per hunting hour.** At ~0.45 success that is ~5 kills h⁻¹, ~30× the field's ~0.17.
- **Movement is not hunting.**
  - Wild pike were burst-active only ~5 % of the time. Long bursts, taken as feeding, were sporadic and often followed by > 24 h of quiet (Beaumont et al. 2005).
  - Smallmouth showed raised muscle activity while apparently stationary (Demers 1996).
  - Largemouth roamed 2–7 km a day even at 5–8 °C (Hanson 2007).
- **Digestion is not what holds them back.** A smallmouth-specific evacuation model clears 90 % of one 4-g fish in ~10 h at 20 °C and ~6 h at 24 °C (550-g bass), room for 2–4 small meals a day. Yet wild bass carry ~1 item and are 25–50 % empty, so appetite and realised encounters set the pace. For pike, Diana's 48-h summer evacuation and the meal every 2.7 days are closer together.
- **Both bass and pike peak at dawn and dusk.** Smallmouth movement peaks just after sunrise and after sunset in every season. Largemouth do not feed from midnight to dawn: stomachs are 74–75 % empty in the morning.
- **Nesting males stop feeding** for 3–7 weeks.

### Cited findings

**Kills (meals) per day**
- **Pike, Lac Ste. Anne** — Diana 1979 PhD thesis, U. Alberta, [doi:10.7939/r3-9pt7-5j74](https://doi.org/10.7939/r3-9pt7-5j74) [FT, scanned pages read by a sub-researcher]. These are the numbers behind PEA's "~0.5 prey/day":
  - **days between meals, male / female:** May 3.1 / 2.3; June 1.9 / 2.2; July 2.1 / 2.8; August 3.8 / 2.6; September 3.5 / 4.2. **Summer mean 2.8 / 2.7 days**; winter 25 days;
  - summer ration 11.4 / 17.4 kcal kg⁻¹ d⁻¹, about **1.0–1.6 %BW/d**, in meals of ~2.8–4.3 %BW;
  - of non-empty stomachs, 61 % held one item, 20 % two and 8 % three; empty: June 40 %, July 58 %, August 50 %;
  - fish were 3-year-olds of 0.9–1.2 kg at 14–16 °C.
- **Gillnet "empties" overstate meal intervals.** In Scottish lochs 48–50 % of gillnetted pike had regurgitated their food (84 % in July); < 10 % were truly empty (Treasurer 1988, *J. Fish Biol.*, via NINA Rapport 2641) [SEC].
- **Heart-rate telemetry of wild pike** gave a metabolic rate ~1.5× standard and an intake of ~1.5 %BW/d (Lucas et al. 1991, *J. Fish Biol.* 39:325) [SEC; full text 403].
- **When pike switched from invertebrates to perch** (Mere Lake, mean 44.6 cm), empties rose from 0–12 % to 42 %, with fewer and larger items (Turner 1984, MSc, U. Alberta, [archive.org](https://archive.org/details/Turner1984_0)) [FT, OCR].
- Kakisa Lake pike were 35–40 % empty in June–August, about one meal every 2–3 days (Christiansen 1976, MSc, [archive.org](https://archive.org/details/Christiansen1976)) [FT, OCR].
- **Prey-pulse ceiling:** pike ate 29 % of 39,700 stocked smolts in one week, ≈ 1.1 smolts per pike > 40 cm per day (0.35–1.6) [derived]; Kekäläinen, Niva & Huuskonen 2008, *EFF* 17, [doi:10.1111/j.1600-0633.2007.00263.x](https://doi.org/10.1111/j.1600-0633.2007.00263.x) [ABS].
- **Smallmouth:**
  - Columbia River (meal-turnover method): **1.4 and 1.0 salmonids per bass per day** in early May and late June, with salmon 59 % of diet weight, so ~1.5–2 fish a day in all. This is a hot-spot ceiling with abundant 1–4-g prey (Tabor, Shively & Poe 1993, NAJFM 13:831) [ABS].
  - Yakima River, March–June: ≈ 0.4 prey fish per bass per day [derived], mostly small bass in cool water (Fritts & Pearsons 2004, TAFS 133:880) [ABS].
  - Snake River: subyearling Chinook alone peaked at 0.13–0.24 per bass per day (Tiffan et al. 2020, *EBF* 103:1231, [PMC7443614](https://pmc.ncbi.nlm.nih.gov/articles/PMC7443614)) [FT] — a single-prey floor.
- **Eastern Lake Ontario tournament bass** — Nelson, Holden, Eves & Tufts 2017, *PLoS ONE* 12:e0181914, [doi:10.1371/journal.pone.0181914](https://doi.org/10.1371/journal.pone.0181914) [FT, checked]:
  - 264 smallmouth of mean 422 mm FL (~1.1 kg) carried **1.09 ± 0.09 items and 4.62 ± 0.36 g per stomach, ≈ 0.4 %BW**, with prey of 4.25 g on average and round gobies dominant;
  - 84 largemouth carried 0.58 items and had more empties;
  - livewell-held fish may have regurgitated, so treat these as lower bounds.
- **Red Cedar River smallmouth:** an adult gaining ~200 g a year needs ≥ 425 three-gram or 230 five-gram crayfish a year, ≈ 1.5–2.8 items or ~8 g a day over ~150 days [derived] (Vannote 1963, Michigan IFR Rep. 1698, [PDF](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1601-RR1700/RR1698.pdf)) [FT].
- **John Day Reservoir smallmouth:** prey-fish ration peaked at 30.4 mg g⁻¹ d⁻¹ in 176–200-mm bass. **Feeding peaked 06:00–12:00 and 20:00–24:00**, and consumption peaked in July (Vigg et al. 1991, TAFS 120:421) [ABS].
- **Oklahoma largemouth** (Zweiacker & Summerfelt 1974, [SEAFWA PDF](https://seafwa.org/sites/default/files/journal-articles/ZWEIACKER-579.pdf)) [FT; adds to PEA]:
  - morning stomachs 74–75 % empty, afternoon 56–68 %, no feeding 00:00–06:00;
  - one item typical;
  - **nesting males stopped feeding for ~5–7 weeks**.
  - Wentzells Lake (NS) smallmouth were "not actively feeding" during the May–June spawning period (§4).

**Digestion (sets how many meals a day are possible)**
- **Smallmouth evacuation** (Rogers & Burley 1991, as modified by Fritts & Pearsons; used in USGS Lower Granite reports, [pubs.usgs.gov/publication/70202278](https://pubs.usgs.gov/publication/70202278)) [FT, sub-researcher]:
  - ET90 (h) = 24 × 24.542 · MW^0.29 · e^(−0.15·T) · W^(−0.23), with MW the meal (g), W the bass (g), T in °C;
  - **for a 550-g bass, one 4-g fish: 18.7 h at 16 °C, 10.3 h at 20 °C, 5.6 h at 24 °C; one 10-g fish: 24.4 / 13.4 / 7.3 h**;
  - fitted to soft salmon prey, so spiny perch and crayfish will clear more slowly.
  - **The sim's bass** (He & Wurtsbaugh pooled rate × `gerMul` 0.4) **clears 90 % in 22–28 h at 20–23 °C** [derived]: 2–4× slower for small soft prey, close to Hunt's 17.5 h for largemouth at 24–25 °C (RTF §4.1).

**Time active and when**
- **River Frome pike > 500 mm FL with motion-switch tags** — Beaumont, Hodder, Masters, Scott & Welton 2005, in *Aquatic Telemetry* (FAO/COISPA) pp. 231–243, [PDF](https://www.fao.org/4/y5999e/y5999e23.pdf) [FT]:
  - > 5,400 h of continuous logging on 8 fish;
  - **active pulses in only ~5 % of the time**;
  - long (≥ 5 s) bursts, taken as feeding, were "very sporadic" and often followed by > 24 h of quiet, peaking at dawn and dusk; short bursts happened around the clock;
  - pike roved between ambush points with short pursuits rather than holding one site;
  - a spawning male logged > 1,000 major events on some days.
- **Jacks Fork River smallmouth, tracked around the clock in all seasons:** movement **peaked soon after sunrise and again after sunset in every season**; within-pool movement rose from 120 m/day at 4 °C to 980 m/day at 27.5 °C (Todd & Rabeni 1989, TAFS 118:229) [ABS].
- **Ranger Lake, Ontario, EMG telemetry:** both bass species were diurnal, with **raised muscle activity while apparently stationary**. Movement is a poor proxy for hunting effort, in both directions (Demers et al. 1996, TAFS 125:434) [ABS].
- **Warner Lake largemouth:** 2.2–7.3 km a day even at 5–8 °C, with a 25-fold spread between individuals; > 80 % of fall time at ≤ 0.3 BL/s (Hanson et al. 2007, [PDF](https://www.fecpl.ca/wp-content/uploads/2007/07/HB-Hanson-et-al-2007.pdf)) [FT]. No feeding signal.
- **Other pike activity:**
  - higher by day than by night in every period, late summer to winter (Baktoft et al. 2012, *EFF* 21:386) [ABS];
  - individuals differed more than populations (Jepsen et al. 2001, *EFF* 10:26) [ABS/SEC];
  - three co-existing behavioural types, one "substantially more active" (Kobler et al. 2009, *Oecologia* 161:837) [SEC].
- **No field strike counts from biologgers exist** for these species (Cooke et al. 2016, review, [PDF](http://www.fecpl.ca/wp-content/uploads/2016/04/Cooke-et-al-2016Remote-Bioenergetic-Measurements.pdf)) [FT]. A pool study showed accelerometers detect pike strikes but cannot tell hits from misses ([DiVA BSc 2020](https://www.diva-portal.org/smash/get/diva2:1441625/FULLTEXT01.pdf)) [FT].

**Field capture and attack, qualitative**
- **A Maine prey-side benchmark.** In the Penobscot River, tethered salmon smolts were taken by **only smallmouth bass and chain pickerel**; 23 % were taken within a 1-h deployment, **rising from ~10 % to 33 % as water warmed from 5 to 15 °C** (Mensinger et al. 2025, CJFAS, [NOAA repository](https://repository.library.noaa.gov/view/noaa/72318)) [ABS]. A pinned prey that cannot avoid is found and taken at ~0.1–0.4 h⁻¹ in predator habitat.
- **Florida largemouth in a channelized river:** hunting was more frequent in vegetated, complex habitat, and only 38 % of bass were solitary (Annett 1998, *EBF* 53:75) [ABS]. Strike rates are in the paywalled full text.
- **Catskill creek, scuba:** smallmouth were diurnal, predator activity rose at twilight, and bass fed on prey flushed by feeding white suckers (Kirker 1989, dissertation) [ABS].
- **Browning:** across 871 Ontario lakes, pike were more abundant and smallmouth and largemouth less abundant in brown water. Most foraging studies found no browning effect, while growth was most often reduced (Roth et al. 2026, *Biol. Rev.*, [PMC12783421](https://pmc.ncbi.nlm.nih.gov/articles/PMC12783421/)) [FT, partial].

**Derivations [derived, sub-researcher, checked]**
- **Smallmouth, 30–35 cm (use 550 g), July–August at 20–24 °C:**
  - ration 1–3 %BW/d = 5.5–16.5 g/d, of which fish are 30–70 % = 2–10 g;
  - that is 0.5–3 young fish of 3–4 g or 0.2–1.2 yearlings of 8–12 g a day;
  - the stomach route (40–55 % empty × ~1.1 items × ~0.5 fish × 24/ET90) gives 0.5–0.9 fish a day;
  - the annual route (0.87–1.28 kg, ~70 % in ~120 days) gives 0.6–1.0 fish a day.
- **Pike / pickerel, 40 cm:**
  - Diana's meal every ~2.7 days of 1.5–2 prey gives 0.55–0.73 fish a day;
  - a ration of 1.0–1.6 %BW/d on 10-g prey gives 0.45–0.7 a day.
- **The hunting hours** are Bevelhimer's 42 % of daylight for smallmouth (SHH) and Diana's 16–22 % for pike. **The capture success** is 0.4–0.6 for bass (Webb's 0.15–0.6; Michels's 0.26 per attack) and 0.36 for pike from ambush.

### Gaps
- No direct field strikes per hour or field capture success for any of these species.
- Turesson & Brönmark 2007 and Annett 1998 are unread.
- No chain pickerel meal interval.
- Lucas et al. 1991 is from a digest only.

---

## 3. Why wild piscivores feed below satiation where prey are plentiful

### Takeaway
- **The biggest single cause is prey behaviour, not prey scarcity.** In daylight a small prey fish sees a bass first (~2 m vs ~1.1 m), keeps ≥ 2 m away when it can, schools, or hides in structure.
  - Prey vacate predator habitat quickly: minnows left bass pools within 3 h; pelagic roach fell 98 % after a piscivore arrived.
  - Emigration can remove as much prey biomass as being eaten.
  - So the prey a bass actually comes within strike range of are a small fraction of the prey counted within a few metres. **No study measured realised vs geometric encounters directly.**
- **The catchable prey are already gone.** Lakes with bass hold only the hard-to-catch species, and those at depressed densities: four soft-bodied minnows were absent from every small Ontario lake with smallmouth. At Little Moose Lake, removing bass raised six littoral species 4–90×.
  - Hot Brook's assemblage is mostly spiny-rayed: perch, white perch, pumpkinseed, bullhead. Its soft-rayed killifish and dace have lived with pickerel for a century, in refuges.
- **Capture per attack is low.** Smallmouth kept 26 % of attacked benthic prey; esocids catch 10–14 % of spiny sunfish (PEA).
- **Interference and crowding.**
  - Interference is the rule in feeding-rate data: median exponent m ≈ −0.7 across 51 estimates, though none is from fish.
  - Pike forage less with other pike near.
  - Crowded pike grew 24 % less at the same intake.
- **Density-dependent growth is real but too weak to close a 4× gap.** Opeongo elasticities at ages 3–4 are −0.04 to −0.08, so a 10× density change moves growth only 8–17 %.
  - Bass that share a lake with chain pickerel (Nova Scotia) and bass at very high density (Provoking) grow slowly and stay thin.
- **Wild guts run at a third to a half of capacity** (Armstrong & Schindler 2011), and real stomachs are often empty: 25–50 % of adult bass in summer.
  - A predator with prey always within reach would not show this. Encounters are patchy and appetite is satiable.

### Cited findings

**Prey avoidance and vigilance**
- **Howick & O'Brien 1983**, TAFS 112:508, [doi:10.1577/1548-8659(1983)112<508:PFBOLB>2.0.CO;2](https://doi.org/10.1577/1548-8659(1983)112%3C508:PFBOLB%3E2.0.CO;2) [FT, sub-researcher]. (The repo uses only their RD curve.)
  - A 29-cm largemouth detected a still bluegill at ~22.7 cm per cm of prey length (~1.1 m for a 5-cm prey) at 3,340 lx.
  - **Bluegill detected an approaching bass at ~200 cm in bright light and ~120 cm at 103 lx.** The advantage reverses in dim light.
  - "In a shallow pond, 10-cm bluegills maintained a distance of at least 2 m from a 44-cm largemouth bass whenever possible." Cornered bluegill turned side-on, back-pedalled, then fled.
- **Power, Matthews & Stewart 1985**, *Ecology* 66:1448 [ABS]:
  - three bass added to a stream pool sent grazing minnows from the deepest area to the shallows **within 3 h**;
  - minnow numbers fell over 5 weeks through behaviour, emigration and predation;
  - in a 14-pool census, bass and minnows co-occurred in more than 2 pools on only 2 of 7 dates.
- **He & Kitchell 1990**, TAFS 119:825 [ABS]: after pike were added to a predator-free lake, **prey biomass lost to emigration was at least as large as that eaten** while prey biomass was > 40 kg/ha (not below 30 kg/ha). The effect was strongest in the first weeks.
- **Brabrand & Faafeng 1993**, *Oecologia* 95:38, [doi:10.1007/BF00649504](https://doi.org/10.1007/BF00649504) [ABS]:
  - after pikeperch arrived, pelagic juvenile roach fell from 12,000–15,000 to 250 ha⁻¹ (−98 %);
  - littoral fish density held, but the community turned over from > 95 % roach to > 50 % perch.
- **Stream juveniles hide from adult bass:**
  - with adult smallmouth present, small chubs, suckers and bass kept to shallow riffles and used pools only where structure was complex; bass still caught some fish in the shallows (Schlosser 1987, *Ecology* 68:651) [ABS];
  - fish of 16–80 mm moved shallower, and their numbers fell with bass number (Harvey 1991, *Oecologia* 87:29, [doi:10.1007/BF00323776](https://doi.org/10.1007/BF00323776)) [ABS];
  - also Fraser & Cerri 1982, *Ecology* 63:307 [ABS].
- **Refuge use costs prey growth.**
  - With piscivorous perch present, crucian carp recruitment fell 90 %, and survivors stayed in vegetated inshore refuges and grew slowly (Tonn, Paszkowski & Holopainen 1992, *Ecology* 73:951) [ABS].
  - Small bluegill fed in vegetation at a third of the open-water return and grew 27 % less (Werner et al. 1983, *Ecology* 64:1540, [doi:10.2307/1937508](https://doi.org/10.2307/1937508)) [ABS].
  - In that 29-m pond, with abundant small bluegill, **each of 8 bass ate about one small bluegill every 3.8 days**.
  - Also Persson & Eklöv 1995, *Ecology* 76:1712 [ABS]; Eklöv & Persson 1995, *Ecology* 76:70 [ABS]: piscivore growth fell as prey refuges improved.
- **Prey species differ in escape.** Roach school, swim fast and jump; perch move slowly, disperse after an attack and hide on the bottom. Predator success was lowest in vegetation, and preference between the two reversed by habitat (Christensen & Persson 1993, *Behav. Ecol. Sociobiol.* 32:1) [SEC].
- **Hunger raises the risk prey accept.** With a pike present, crucian carp used the open, food-rich habitat less, and fed fish less than hungry ones (Pettersson & Brönmark 1993, *Oecologia* 95:353) [ABS]. Gilliam & Fraser 1987 (*Ecology* 68:1856) confirmed the "minimise μ/f" habitat rule with creek chubs [ABS].
- **Lakes with bass keep only hard-to-catch prey.**
  - In 14 central Ontario lakes < 50 ha, fathead minnow, pearl dace, *Phoxinus* and brook stickleback were absent from every lake with smallmouth.
  - Pumpkinseed, yellow perch, common shiner and creek chub remained, with a weak shift to complex habitat (p ≈ 0.05).
  - MacRae & Jackson 2001, CJFAS 58:342 [FT, sub-researcher].
  - At Little Moose Lake, removing 47,682 bass cut snorkel counts > 90 % in 2 years, and six littoral species rose 4–90× (Weidel, Josephson & Kraft 2007, TAFS 136:778) [SEC; in the repo].

**Capture**
- **Michels 2020**, MS thesis, Univ. Minnesota (published as TAFS 2021, [doi:10.1002/tafs.10293](https://doi.org/10.1002/tafs.10293)) [FT, sub-researcher]:
  - smallmouth on benthic prey in the lab: **1,510 reactions → 630 attacks → 164 prey kept: 26 % per attack, 10.9 % per reaction**;
  - reactions were fewest at mid-morning (31, vs ~53 in the dark); the bass swam almost continuously.
- The capture-per-strike ladder for esocids and bass is in PEA §2.

**Interference among predators**
- **Interference is common.**
  - Across 19 predator–prey data sets, Beddington–DeAngelis, Crowley–Martin and Hassell–Varley models beat Holling type II, with no single winner (Skalski & Gilliam 2001, *Ecology* 82:3083) [ABS].
  - Across 51 estimates from 37 studies, **the interference exponent m had median −0.7, mean −0.8** (range −2 to 0), and only one data set fitted no interference (DeLong & Vasseur 2011, *BMC Ecol.* 11:1, [doi:10.1186/1472-6785-11-1](https://doi.org/10.1186/1472-6785-11-1)) [FT]. None of these is a fish data set.
- **Pike:**
  - foraging alongside other pike lowered attack frequency and consumption, with no visible aggression; perch cooperated (Nilsson, Turesson & Brönmark 2006, *Behaviour* 143:733) [ABS];
  - handling exposes a pike to cannibals and kleptoparasites, so pike take smaller prey than energy maximising predicts (Nilsson & Brönmark 1999, *Behav. Ecol.* 10:557; 2000, *Oikos* 88:539) [SEC].
- **Crowding costs growth even at equal intake** — Edeline et al. 2010, *Proc. R. Soc. B* 277:843, [doi:10.1098/rspb.2009.1724](https://doi.org/10.1098/rspb.2009.1724) [FT]:
  - pike at 0.5 vs 1 m⁻² ate the same, 0.45 vs 0.43 prey per pike per day (not saturated);
  - **but mass growth fell from 1.85 to 1.41 g/d (−24 %)**, with stress indices worse in small, subordinate pike.

**Food limitation and density-dependent growth of smallmouth**
- **Lake Opeongo, 1937–1992** — Shuter & Ridgway 2002, AFS Symp. 31:235–249, Table 2, [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Shuter%20Ridgway%202002%20Bass%20in%20Time%20and%20Space.pdf) [FT]:
  - the fit was ln(annual length increment) = a + b·ln(abundance of ages 1–4) + c·(mean June–September air temperature);
  - **density coefficients b: age 1 −0.220; age 2 −0.155; age 3 −0.083; age 4 −0.038**;
  - temperature coefficients c: +0.015 (n.s.), +0.064, +0.083, +0.077 per °C;
  - abundance of ages 1–4 varied ~10-fold, so a 10× rise cuts growth ~30 % at age 2, 17 % at age 3 and 8 % at age 4 [derived];
  - the adults' "specific food resources (i.e., primarily crayfish)"; the competing age groups 1–4 share "larger benthic invertebrates, smaller littoral fish".
  - Ridgway, Shuter, Middel & Gross 2002 (AFS Symp. 31:47) [FT, sub-researcher] give correlations of −0.69 to −0.10 by age interval.
- **Provoking vs Opeongo** — Dunlop, Orendorff, Shuter, Rodd & Ridgway 2005, CJFAS 62:1720, [doi:10.1139/f05-089](https://doi.org/10.1139/f05-089), [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Dunlop%20et%20al%20Diet%20and%20Divergence%20in%20introduced%20smb.pdf) [FT]:
  - **3,741 vs 82 adults km⁻²** (Bridle 250);
  - Provoking's growth falls behind at 15–20 cm, the size at which Opeongo bass turn to crayfish;
  - nesting males averaged 25 vs 32 cm;
  - adult stomachs were 40 % vs 35 % empty, with 1.9 vs 4.3 g of contents and prey 25 vs 38 mm long;
  - Provoking bass moved to Bridle ate more fish and crayfish and were 14 % vs 30 % empty.
- **Little Moose Lake removal** — Zarri et al. 2025, *PNAS*, [doi:10.1073/pnas.2424067122](https://doi.org/10.1073/pnas.2424067122) [FT, sub-researcher]:
  - annual mortality rose from 39 % to 76 %, bass numbers rose 59 % and biomass fell 57 %;
  - **length-at-age rose by 7, 16, 36 and 56 mm at ages 1–4** (annual increments +1–2 cm at ages 2–4), partly from density and partly from selection.
- **Nova Scotia, the nearest analogue to Maine** — MacMillan, McNeill, Heighton & Ridgway 2002, AFS Symp. 31:535, Table 2, [PDF](https://novascotia.ca/fish/documents/special-management-areas-reports/Life_History_Charateristic_of_Smallmouth_Bass_Populations_in_Nova_Scotia.pdf) [FT]:
  - 13 lakes: **Wr 73–86, mean 77.3**, "most values below the 25th percentile observed for North America" (86);
  - K 0.123–0.352 (median 0.18), L∞ 29.6–60.8 cm;
  - **every population with L∞ < 50 cm except Killam co-exists with chain pickerel.** The authors suggest competition between the two littoral predators reduces adult bass size;
  - Gaspereau, with only white perch, has L∞ 53.1 cm; Provoking (only sparse yellow perch) 38.2 cm;
  - at L∞ 50, K 0.18, a 26-cm bass grows (50 − 26)(1 − e^−0.18) ≈ **4.0 cm a year** [derived], the Maine figure.
- Density-dependent growth after recruitment was significant in 9 of 16 long-term fish populations, acting on L∞ (Lorenzen & Enberg 2002, *Proc. R. Soc. B* 269:49) [ABS].

**Risk and time allocation**
- Under the μ/g trade-off, activity should fall as resources, handling or reserves rise (Werner & Anholt 1993, *Am. Nat.* 142:242) [ABS].
- For adult bass the risk from birds is probably small. Interior-Maine bald eagles took mostly bullhead, white sucker and chain pickerel; fish were 79 % of items (Todd et al. 1982, *J. Wildl. Manage.* 46:636) [SEC].
- Risk matters for bass under ~20 cm (pickerel, larger bass, mergansers, loons).

**Spiny-rayed prey**
- In reservoirs with only centrarchid prey, esocids ate fewer prey and grew more slowly; given shad as well, they took shad (Wahl & Stein 1988, PEA §2).
- Largemouth handling time at equal length runs crayfish > bluegill > yellow perch > stickleback > minnow > tadpole (Hoyle & Keast 1987, in PDPM §2.3).
- In lakes with pike, perch kept to the littoral, were fewer and grew faster (Persson et al. 1996, *Ecology* 77:900) [ABS].

### Gaps
- No field measure of how much avoidance cuts a bass's realised encounters.
- No fish-specific interference exponent.
- Lima & Dill 1990, Magurran & Pitcher 1987 and Hambright 1991 were not read.

---

## 4. Smallmouth diet where crayfish are few

### Takeaway
- **Where crayfish are scarce, smallmouth do not simply eat more fish. Insects take the crayfish's place**: dragonfly and damselfly nymphs above all, then mayflies, and terrestrial beetles in early summer.
  - The insect state comes with slow growth, small meals and 30–50 % empty stomachs (Provoking).
  - Fish dominate only where small fish are plentiful and catchable, as in the Maine lakes Cooper sampled (white perch 61 % of volume).
- The repo's adult target (PDPM §2.6: crayfish 35–55 %, fish 35–50 %, insects 5–15 %) is for crayfish-rich water. **For Hot Brook, where the owner says crayfish are not common, move crayfish down to ≤ 5–15 % and insects up to 25–40 %** (Implications (e)).

### Cited findings
- **Provoking, Opeongo and Bridle Lakes, Algonquin, Ontario** — Dunlop et al. 2005 [FT; checked against the PDF]:
  - **This is the "~62 % insects" source.**
  - Methods: summer only; gastric lavage in 1981–82, frozen fish in 2002. Values are the mean per-stomach percentage composition, which sums to ~100 per row.
  - Provoking is 1.1 km² with only splake and yellow perch besides bass, at 3,741 adults km⁻².

  Table 3, juveniles and adults pooled:

  | Lake, summer | Crayfish | Insects | Fish | Other | % empty | N |
  |---|---|---|---|---|---|---|
  | Provoking 1981 | 14 | **61** | 16 | 8 | 50 | 138 |
  | Opeongo 1981 | **74** | 11 | 14 | 1 | 23 | 97 |
  | Provoking 1982 | 10 | **72** | 14 | 4 | 30 | 64 |
  | Bridle 1982 | 45 | 28 | 15 | 9 | 13 | 63 |
  | Provoking 2002 | 2 | **62** | 3 | 32 | 33 | 60 |
  | Opeongo 2002 | 43 | 10 | 16 | 31 | 29 | 62 |

  Table 4, 2002 by bass length (fish / crayfish / insects / plankton / other %; % empty; N):

  | Length | Provoking | Opeongo |
  |---|---|---|
  | 5–10 cm | 0 / 0 / 12 / 25 / 62; 20 %; 5 | 0 / 0 / 28 / 72 / 0; 0 %; 4 |
  | 10–15 cm | 0 / 0 / 57 / 41 / 1; 28 %; 7 | 43 / 0 / 21 / 7 / 28; 22 %; 9 |
  | 15–20 cm | 0 / 0 / **85** / 4 / 10; 28 %; 18 | 8 / 44 / 14 / 6 / 28; 31 %; 13 |
  | 20–25 cm | 0 / 4 / **65** / 6 / 25; 33 %; 18 | 11 / 50 / 5 / 6 / 28; 44 %; 16 |
  | > 25 cm | 22 / 6 / 44 / 17 / 11; **50 %**; 12 | 14 / 71 / 0 / 4 / 11; 26 %; 19 |

  - **Caveat:** Provoking's insect diet is partly a density effect (37 adults ha⁻¹). Hot Brook's prey fish are far more diverse.
- **Wentzells Lake (LaHave River), Nova Scotia: brown water, white perch abundant, no native crayfish** — Feener & MacLeod (Coastal Action), *LaHave River Invasive Species Project 2019 Final Report*, [PDF](https://novascotia.ca/fish/documents/2020-FFRC-Invasive-species-in-LaHave-River.pdf) [FT, sub-researcher; grey literature]:
  - gastric lavage of angled fish, 25 April – 25 August 2019; 85 bass;
  - **invertebrates > 99 % of diet weight**: dragonfly nymphs 60 %, adult June beetles just over 12 %, then caddis, damselfly, mayfly, stonefly, horsefly and riffle-beetle larvae;
  - the number of non-empty stomachs is not given;
  - bass were "not actively feeding" through the May–early-June smolt run, i.e. around spawning ([2025 tagging report](https://novascotia.ca/fish/documents/2025-ffrc-lahave-river-smallmouth-bass-tagging-study.pdf)) [FT];
  - "There are no indigenous crayfish in Nova Scotia" (Saint Mary's University lab poster, [PDF](https://www.ap.smu.ca/~lcampbel/SMU_Research_Expo_2024_Invasive.pdf)) [FT].
  - Pickerel in the same lake were **~85 % fish by weight** (smolts 59 % in a 4-week window, then white perch, pickerel, brook trout and sucker) and ~15 % invertebrates, 89 % of them dragonfly nymphs. The angling catch rate was 1.98 pickerel h⁻¹ vs 0.88 bass h⁻¹.
- **Coeur d'Alene Lake, Idaho, where crayfish are virtually absent:** only 8 of 904 lavaged bass (39–492 mm) had eaten crayfish. Bass < 100 mm ate mayflies, odonates and Diptera, and fish rose with size; kokanee were in 5–15 % of stomachs but ~45 % of energy. Quist, Walrath & Firehammer 2025, *Northwest Sci.* 98:99, [doi:10.3955/046.098.0202](https://doi.org/10.3955/046.098.0202) [ABS].
- **Little Moose Lake, Adirondacks** (crayfish present): crayfish were the most frequent and numerous item; crayfish, mayflies, odonates and fish made up 77 % of items; the shift from mayflies to crayfish and fish came at ~150 mm (Weidel, Josephson & Krueger 2000) [SEC; PDPM].
- **Maine:**
  - Cooper 1941, read in FSR: 36 of 66 smallmouth (8.5–21.3 in) had food. White perch 61 % of volume (86.5 cc of it from 5 fish in Snow Pond), crayfish 14.4 %, yellow perch 14 %, insects 3.6 %, pumpkinseed 2 %. A small sample dominated by a few lakes.
  - The MDIFW bass plan (Jordan 2001): "The relationship of forage species to growth of bass in Maine is unknown" [FT, sub-researcher].
  - Young-of-year bass in St. Croix lakes eat mostly cladocerans (PDPM §2.4).
  - Watson 1965, "The Maine Smallmouth", stayed blocked.
- **South Dakota glacial lakes:** bass < 180 mm ate invertebrates in May–June and fish from July; bass > 280 mm ate mainly crayfish. Age-3 bass got 57 % of their energy from fish. **Bass eating mostly decapods (Oahe Dam) grew more slowly than fish eaters** (Bacula 2009, MS thesis, SDSU, [record](https://openprairie.sdstate.edu/etd/280)) [ABS].
- **Crayfish and calcium:** crayfish declines in Ontario Shield lakes have been tied to bass, aluminium and falling calcium (Edwards, Jackson & Somers 2009, *J-NABS* 28) [ABS/SEC]. See PEA §6 for the < 2 mg/L Ca threshold.
- **Fish matter more for energy than for counts.** In a stream study cited by the DFO synopsis, fish were 20 % of young bass's diet by number but ~80 % of calories (Brown et al. 2009, Can. MS Rep. 2887) [FT, sub-researcher].

### Gaps
- No by-weight adult smallmouth diet from a Maine lake since Cooper 1941.
- Watson 1965 and Warner 1973 are unread.
- The Wentzells sample size of non-empty stomachs is unknown.

---

## Gaps (overall)
- **No field estimate of how many strikes a wild smallmouth makes per hour of hunting in a lake** (§2).
- **No published chain pickerel ration, p, or strike rate.** Everything is a pike surrogate.
- **No northern-lake FB4 p for smallmouth in full text.** The derived p (§1.1) is on the sim's own set, which is what matters for calibration.
- Realised vs potential encounter (the prey-avoidance discount) is unmeasured.

## To fetch (blocked or unread; not bypassed)
- Watson 1965, "The Maine Smallmouth", MDIFW Fish. Res. Bull. 3 ([digitalmaine](https://digitalmaine.com/ifw_docs/217)): Cloudflare challenge, then 403.
- Moore 1988, Smith Mountain Lake PhD (scanned, [VT](https://vtechworks.lib.vt.edu/handle/10919/53590)): the p-values need OCR.
- Liao, Pierce & Larscheid 2004, NAJFM 24:890, [doi:10.1577/M02-178.1](https://doi.org/10.1577/M02-178.1): Iowa State repository 403; the Iowa DNR copy is 404.
- Vigg et al. 1991, TAFS 120:421 (monthly smallmouth rations); the BPA reports (Poe et al. 1987) on a govdocs mirror that would not resolve.
- Rose et al. 1999, *Ecol. Monogr.* 69:127 (the Oneida IBM's predation calibration): Deep Blue 403.
- Ahrenstorff, Sass & Helmus 2009 (largemouth consumption vs woody habitat): the UWSP PDF link is dead.
- Wuellner 2009 and Bacula 2009 (SDSU theses: smallmouth bioenergetics): university access only.
- Weidel et al. 2000 full text (MSU: Incapsula block); Diana 1979 tables; Kipling & Frost 1970; Mann 1982; Headrick & Carline 1993; Margenau et al. 1998.
- Armstrong & Schindler 2011 full text (per-species load:capacity): Nature login.
- Lima & Dill 1990; Magurran & Pitcher 1987; Hambright 1991; Post et al. 1999.
- **Turesson & Brönmark 2007**, *Oecologia* 153:281 (field encounter rates per hour, 15 lakes) and Turesson's 2003 thesis: Springer login; no file at Lund.
- Annett 1998 (field strike rates of largemouth), Ahrenstorff et al. 2009, Keast 1985: Springer login.
- Lucas et al. 1991 (pike heart-rate intake): Durham repository 403.
- Kobler et al. 2008, 2009: an Anubis bot check at HU Berlin.
- Wolf et al. 2022 PDF (BYU ScholarsArchive): 403. Masters 2003 thesis (St Andrews): connection refused.
- Craig et al. 2017 (*Ecol. Evol.* 7:6201, largemouth vs DOC) and Schaefer 2014 (largemouth foraging vs DOC): promising for tea-coloured water, not reached.
- Never searched (the shared search budget ran out): Bregazzi & Kennedy 1980; Headrick & Carline 1993; Venturelli & Tonn 2006; Frost 1954; Lawler 1965; Foote & Blake 1945; Warner 1973; Naughton 2004; Clady 1974; Nursall 1973; Chapman & Mackay 1984; Bozek et al. 1999.

---

## Implications for the simulation

### Diagnosis [derived]

**1. The strike rule is saturated almost everywhere.** A 30-cm bass by day uses RD 1.0 m, u + v = 0.3 m/s, CS̄ ≈ 0.3 (perch 0.45 × the size term ~0.67) and `act` 0.3:

| Water | Encounters E (h⁻¹) | Strikes S (h⁻¹) | Kills per daylight hour | Per 15-h day, if the gut never filled |
|---|---|---|---|---|
| Littoral, 0.5 fish m⁻² over 1.5 m (0.33 m⁻³) | 1,120 | 11.7 | 1.05 | 16 |
| Littoral, 0.1 fish m⁻² over 1.5 m | 227 | 10.6 | 0.95 | 14 |
| Open basin, adult perch 0.01 m⁻³ | 34 | 6.4 | 0.57 | 9 |
| Sparse, 0.002 m⁻³ | 7 | 2.2 | 0.20 | 3 |

Hot Brook's littoral holds ~0.5–2 fish m⁻² (`Hot Brook populations and water/small_fish_numbers.md`), so E ≫ E_h = 30 h⁻¹ everywhere a bass lives, and S ≈ aMax. **Field kills are ~1 fish a day**, so the potential is 10–25× too high (§2). The pickerel (aMax 3, `act` 0.15, v 0) gets ~0.15 kills per daylight hour, ~2 a day: 3–5× the field's 0.4–0.8.

**2. The only brake is the gut's room, and it brakes at p ≈ 1.**
- On the sim's evacuation (2.0–2.5 d⁻¹ at 20–23 °C for bass), **any gut content above ~2.3–2.7 %BW empties at the full Cmax rate**.
- With 9–16 kills possible a day and an 8-%BW gut, a bass can always hold that much. The result is p → 0.9–1, and the sim's 0.5–0.9 is that brake diluted by cooler hours, cover and school confusion.
- Field stomachs hold **~0.4 %BW (1.1 items) in Lake Ontario smallmouth**, with 25–50 % empty. On the sim's own evacuation, p 0.34 corresponds to a mean gut of ~0.8–0.9 %BW.
- The toy run below confirms it: with the gut as the only brake (threshold 2 %BW), p = 0.87–0.99 at any realistic kill rate.

**3. The continuous foods have the same problem.** `_feed` takes the weed fauna (crayfish, odonates) and surface insects at the Cmax "want" rate × availability whenever there is room. A hunger gate on fish alone would leave a bass topping up to Cmax on insects wherever they are dense.

**4. Growth follows.** On the sim's set, p 0.5 / 0.7 / 0.9 through the warm months takes a 26-cm bass to 36 / 45 / 53 cm in a year (§1.1). The sim's ~15 cm/yr is p ≈ 0.6–0.7.

### (a) Consumption targets: smallmouth (on the sim's own FB4 set and calendar)

| Month | p | %BW/d (26–30 cm) | g/day, 300-g bass | Fish killed a day, 25–35-cm bass | Notes |
|---|---|---|---|---|---|
| Dec–Mar (ice) | 0–0.05 | ≤ 0.02 | ~0 | ~0 | stomachs mostly empty (PWE) |
| Apr | ≤ 0.1 | ≤ 0.05 | ~0 | ~0 | |
| May | 0.2 | 0.4–0.6 | 1–1.5 | 0.2–0.4 | spawning; **nesting males ~0 for 3–7 weeks** |
| Jun | 0.25 | 1.4–1.7 | 3–5 | 0.3–0.6 | insects peak late June–July (§4) |
| Jul | 0.35 | 1.8–2.1 | 5–6 | 0.5–1.5 | |
| Aug | 0.43 | 1.7–2.4 | 6–7 | **1–2** (young of the year 3–6 cm) | |
| Sep | 0.46 | 1.4–2.0 | 6–8 | **1–2** | |
| Oct | 0.4 | 0.4–0.5 | 2 | 0.3–0.5 | fall feeding |
| Nov | 0.15 | < 0.1 | < 0.5 | ~0.1 | |
| **Season** | **0.30–0.36** | | | **~120–250 fish a year** | **0.7–1.1 kg a year by size (§1.1); Mille Lacs 0.87 kg** |

**If fall p is high instead.** PWE argues for p 0.6–0.8 in September–October so bass store lipid before the ice. The same Maine growth then needs **Jul–Aug p ≈ 0.29–0.32 and June ≈ 0.21–0.23** (Sep/Oct at 0.6/0.7 or 0.7/0.8; annual food 0.79 kg) [derived]. Either shape fits growth; the fall-heavy one fits PWE's storage and Rice & Cochran's late-season rise.

- **Never a fortnight above p ≈ 0.6** (Oneida walleye's weekly rations peaked ~2× their season mean). **Never a summer mean above 0.5.**
- **Annual food by size:** 21–26 cm 0.68 kg; 26–30 cm 0.82–0.84 kg; 30–33 cm 0.95–0.99 kg; 33–36.5 cm 1.09 kg.
- **Growth:** +4 cm/yr at 26 cm, +3.4 at 30, +3.1 at 33 (Maine VB; Nova Scotia gives 4.0 at L∞ 50, K 0.18). Condition can sit at Wr ~77–90 (Nova Scotia mean 77) rather than 100.
- **Stomachs (summer, adults):** 25–50 % empty; non-empty ones mostly with 1 item; mean content ~0.3–1 %BW.

### (b) The main lever: a hunger gate on hunting and foraging, not a full gut
Real piscivores stop hunting long before the gut is full:
- they carry 2–3× spare capacity (Armstrong & Schindler 2011);
- they hold ~0.4 %BW (Nelson 2017);
- they rest > 24 h after a long burst (Beaumont 2005);
- they take one meal every ~2.7 days (pike, Diana).

**Proposed form.** A fish hunts, and forages on the continuous foods, only in proportion to

  h = clamp(1 − gut / G₀, 0, 1)

with **G₀ ≈ 0.5 %BW for bass (0.3–1)**. That is about one young-of-year perch, or a quarter of a yearling, for a 300-g bass. The gate scales `act` in `_strike2` and `want` in `_feed`. Reuse the drive the brain already has (HUNGER) if it carries the same meaning.

**What the gate does** — a toy run (`Math.random`, one 300-g bass in July at 23 °C, prey drawn 50 % young fish 1–3 g, 30 % yearlings 5–12 g, 20 % insects 0.3–1 g; hunting 05:00–20:30 with twilight ×2; k = the realised kill hazard while hunting) [derived]:

| G₀ (%BW) | k (h⁻¹) | Sim's evacuation (90 % in 22 h): p / fish a day / % empty / mean gut %BW / % of daylight hunting | Smallmouth-specific evacuation (90 % in ~10 h) |
|---|---|---|---|
| 0.3 | 0.15 | 0.26 / 1.0 / 17 % / 0.59 / 42 % | 0.33 / 1.3 / 37 % / 0.34 / 62 % |
| **0.5** | **0.15** | 0.28 / 1.1 / 16 % / 0.64 / 55 % | **0.36 / 1.5 / 35 % / 0.37 / 70 %** |
| 0.5 | 0.25 | **0.35 / 1.4** / 7 % / 0.81 / 39 % | 0.51 / 2.1 / 20 % / 0.52 / 56 % |
| 1.0 | 0.15 | 0.35 / 1.5 / 12 % / 0.81 / 68 % | 0.41 / 1.7 / 37 % / 0.43 / 83 % |
| 2.0 (≈ the gut alone) | 0.25–3 | 0.64–0.99 / 2.4–3.6 / 0 % / 1.5–2.7 | — |

- **G₀ ≈ 0.5 %BW with a realised kill hazard k ≈ 0.15–0.25 h⁻¹ while hunting by day (×2 at twilight) reproduces the field together:** p ≈ 0.35, ~1–1.5 fish a day, stomach contents ~0.4–0.8 %BW, hunting ~40–70 % of daylight.
- For a 550-g bass at 20 °C the same G₀ gives p 0.21–0.26 at k 0.15–0.25. That matches the lower p of larger bass (§1.1: 0.28–0.30).
- **The field's 30–50 % empty stomachs appear only with the faster, smallmouth-specific evacuation** (ET90 ~10 h for a 4-g fish at 20 °C). The sim's `gerMul` 0.4 gives too few empties at the right p. If "% empty" is used as a check, raise the bass's evacuation for small prey toward the Rogers & Burley form (ET90 ∝ meal^0.29), keeping spiny prey and crayfish slower. Otherwise judge by p, kills and mean gut, not by empties.

### (c) The strike-rule parameters the evidence says are too high

| Parameter | Now | Evidence | Suggested |
|---|---|---|---|
| **Bass aMax** | 12 h⁻¹ | lab largemouth in open pools with prey always in view 31 h⁻¹, half cover 6–7 h⁻¹ (PEA); **field strikes at fish ≈ 0.3 per hunting hour (0.1–0.9)** (§2) | **2–3 h⁻¹** as the hungry, prey-in-view ceiling. With CS̄ ~0.3 and `act` 0.3 that gives k ≈ 0.2–0.3 h⁻¹ |
| **Encounters N** | every catchable fish within 6 m counts | by day prey see a bass at ~2 m (bass sees them at ~1.1 m) and keep ≥ 2 m away; minnows quit bass pools within 3 h; prey vacate predator habitat (§3); the advantage reverses at dusk (Howick & O'Brien; Pitcher & Turner) | multiply N by a **prey-vigilance factor**: **~0.1–0.2 by day, ~0.5–1 at twilight, ~0.3 at night** (when RD is short anyway). Single prey and loose schools of yellow perch are discounted most; prey busy feeding or flushed least. **In the littoral this shapes when and which prey are struck, not how many:** E stays above E_h (below) |
| Bass hunting speed v | 0.2 m s⁻¹ | field horizontal speeds 0.06 m s⁻¹ (summer mean, Bloomfield), 0.07 while moving (Bevelhimer), 0.13 on daytime tracks (Ridgway) (SHH) | **0.1 m s⁻¹** |
| `act` (bass) [day, twilight, night] | [0.3, 0.3, 0.1] | movement peaks just after sunrise and after sunset; little at night; largemouth do not feed 00:00–06:00 (§2) | **[0.2, 0.5, 0.05], × the hunger gate h** |
| `act` (pickerel) | [0.15, 0.2, 0.02] | pike active in 16–22 % of daylight intervals, 2 % at night; burst-active ~5 %; dawn and dusk peaks | keep, **× the hunger gate** (G₀ ~1 %BW; meals of 2.8–4.3 %BW give the 2–3-day meal interval by themselves) |
| Bass capture `CS3` | perch 0.45, white perch 0.4, soft-rayed 0.6, small sunfish 0.55 | smallmouth kept 26 % of attacked benthic prey (Michels 2020); Webb's 0.15–0.6; perch disperse and hide (§3) | perch 0.30–0.35, white perch 0.25–0.30, soft-rayed 0.45–0.5, sunfish 0.35–0.4. Second-order: change it only if (b)–(c) leave too many kills |
| E_h | 30 h⁻¹ | no field value | keep. Even after a 0.1–0.2 vigilance factor (and v 0.1), a littoral E is ~15–150 h⁻¹ by day at 0.1–0.5 fish m⁻², mostly above E_h. The hunger gate and aMax set the rate |
| Gut capacity `gut` 0.08 | the brake | wild guts run at ⅓–½ of capacity | keep as the physical maximum; **stop using it as the satiation signal** (b) |

**The order to try (each as a ≥ 3-seed A/B, CLAUDE.md):**
1. The hunger gate on all foods. It is what caps real p; without it, cutting aMax only moves the same p into fewer hours.
2. Bass aMax 12 → 2–3 h⁻¹. **This, not the vigilance factor, sets k:** with E_h 30 h⁻¹ a vigilance factor would have to be ~0.01 to matter in the littoral. Then add the vigilance factor (day 0.1–0.2, twilight 0.5–1) for the diel pattern and prey choice.
   - Worked check [derived]: aMax 2.5, v 0.1, vigilance 0.15 by day and 0.75 at twilight, CS̄ 0.3, `act` [0.2, 0.5] at 0.33 fish m⁻³ gives E 112 / 560 h⁻¹, S 2.0 / 2.4 h⁻¹, and **k 0.12 h⁻¹ by day, 0.36 h⁻¹ at twilight** — inside the toy's window in (b).
3. `act` with the twilight peak, and v 0.1.
4. CS3 only if needed.

Check after each: p by month (a), fish a day, mean gut %BW, growth at 26 cm, and the prey side. Perch and white perch age-1–2 fish-predation losses must stay at 15–35 %/yr (PDPM §7.1). Cutting bass kills 10× must not drop them below that: pickerel and the young-of-year routes must carry their share.

### (d) Diet targets for adult smallmouth in crayfish-poor water (replaces PDPM §2.6's crayfish-rich numbers for Hot Brook)

| Bass length | Fish | Insects (odonate nymphs first, mayflies, terrestrial beetles) | Crayfish | Other (zooplankton, leeches, frogs) |
|---|---|---|---|---|
| < 15 cm | ≤ 10 % | 50–60 % | 0 | 30–40 % (zooplankton) |
| 15–25 cm | 15–35 % | **50–70 %** | ≤ 5–10 % | small |
| ≥ 30 cm | **50–65 %** | 25–40 % | 5–10 % (≤ 15) | 2–5 % |

**By season (adults):**
- ice-out–June: little feeding around spawning; ~50 % fish (adult and yearling perch in the shallows) and ~40 % insects;
- late June–July: insects peak at 40–60 %, ~10 % of it terrestrial;
- August–October: fish rise to 60–80 % (young perch, white perch, pumpkinseed, killifish at 4–8 cm);
- under ice: ~0.

**Which fish:** white perch and yellow perch first (Cooper 1941: 61 % and 14 % of volume), then pumpkinseed, killifish, fallfish and dace, and young suckers. Bullhead ~0.

**The insect state goes with slow growth and frequent empties** (Provoking). If the sim's small fish become scarce, the bass should drift toward it and slow down, not starve.

Crayfish at ≤ 10 % needs the PEA §6 changes: `CR_PREF` ≤ 1, 10–20 % of crayfish exposed by day, and the carrying capacity checked against Hot Brook's calcium. **Insects must be available as real food for adult bass** (odonate nymphs in the weeds, surface insects in June–July). The current `big` rule drops worms and scuds for bass ≥ 15 cm; keep the weed fauna and surface insects for them.

### (e) Chain pickerel targets
- **Annual food:** 40-cm pickerel **1.7–2.3 kg** (3–4 g/g/yr). **On the sim's own set and cold rule that is p ≈ 0.39–0.42** (1.8–2.1 kg; Jul–Aug 2.5–2.7 %BW/d) (§1.3).
- **Summer:** 1.6–2.5 %BW/d; **0.4–0.8 fish a day; one meal every 2–3 days** (Diana: 2.7–2.8 days); 40–60 % of stomachs empty; 61 % of full ones holding 1 item.
- **Diet:** ~85–95 % fish (Cooper 1941: white perch 55 % of volume; Wentzells 85 %); the rest odonates; crayfish ≤ 5 %.
- **Strikes at fish:** ~0.5 per active hour, ~1.7 a day.
- **Hot water:** at Hot Brook's 24 °C peak, at most a mild midsummer dip (the Florida July collapse was at higher temperatures).

### (f) Validation targets (≥ 3 seeds; July–September unless stated)

| ID | Target | Value | Basis |
|---|---|---|---|
| FR1 | Bass season p (on its own set) | **0.30–0.36** (26–36 cm); no month mean > 0.5 | §1.1; Rice & Cochran; Oneida |
| FR2 | Bass p by month | May ~0.2, Jun ~0.25, Jul ~0.35, Aug–Sep 0.4–0.46, Oct ~0.4, ice ≤ 0.05 — or, fall-heavy (PWE), Jun ~0.22, Jul–Aug ~0.3, Sep–Oct 0.6–0.8 | §1.1; (a) |
| FR3 | Bass annual food | 0.7–1.1 kg (25–36 cm) | §1.1; Mille Lacs 0.87 |
| FR4 | Bass growth | +4 cm/yr at 26 cm, +3–3.5 at 30–33 | Maine VB; Nova Scotia |
| FR5 | Fish killed per bass a day | **0.5–2 in Jul–Sep (mean ~1); 0.2–0.6 in May–Jun; ~0 under ice** | §2 |
| FR6 | Bass mean gut content | 0.3–1 %BW (sim's evacuation: ~0.6–0.9) | Nelson 2017; Dunlop 2005; (b) |
| FR7 | Bass strikes at fish per daylight hour (population mean) | ~0.1 (0.05–0.3); ×2–3 at twilight | §2 |
| FR8 | Share of bass kills at twilight | ≥ 25–40 % of fish kills in the ~2 h around sunrise and sunset | §2; PEA §5; SHH SH8 |
| FR9 | Nesting males | ~0 food for 3–7 weeks | Zweiacker; LaHave |
| FR10 | Bass diet ≥ 30 cm, annual by mass | fish 50–65 %, insects 25–40 %, crayfish ≤ 10–15 % | §4 |
| FR11 | Pickerel | p 0.39–0.42 on its own set; 1.7–2.3 kg/yr (40 cm); 0.4–0.8 fish a day; meal interval 2–3 days; 40–60 % empty in summer | §1.3, §2 |
| FR12 | Prey side | perch and white perch age-1–2 fish-predation loss 15–35 %/yr | PDPM §7.1 |

### (g) Caveats
- **p is model-relative.** The field p values (0.26–0.54) sit on models whose activity and cold-respiration terms differ from the sim's. The derived targets in (a) use the sim's own set and calendar, so they are the right ones to calibrate to. They exclude the sim's extra swimming cost (`BIOE.SWIM`), which will push the needed p up a little.
- **Kills per day depend on prey size.** One yearling perch (6–12 g) ≈ 4 young-of-year (1.5–3 g). Judge p and grams first, kills second.
- **The vigilance factor and lower aMax stand in for the same unmeasured thing**, realised encounters. Numerically the aMax cut does the work in the littoral, and the vigilance factor sets the day–twilight contrast and works in sparse water. Calibrate them together against FR5–FR8.
- **The toy in (b) is a check, not the sim.** It uses one bass, fixed July temperature, random prey masses and no competition. Expect the gate to need re-tuning in the full sim, where cover, schools and the young-of-year route all change k.
