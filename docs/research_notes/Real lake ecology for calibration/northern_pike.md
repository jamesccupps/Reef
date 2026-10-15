# Northern pike (Esox lucius) in small north-temperate lakes: feeding ecology, prey size, seasonal consumption, density, and sharing the piscivore role with largemouth bass

Calibration target: a simulated small mesotrophic lake, a slice of about 0.07 ha. In it, pike kills fall from 80 to 17 per 45 days between June and September at 23–26 °C. A 65-cm pike ignores fish under about 4.6 cm (`FEED.PREY_MIN` 0.07), and the prey are mostly 5–7 cm sunfish.

Notation:
- **TL** = total length.
- **BW** = body weight (wet).
- **%BW/d** = percent of body weight eaten per day.
- **Cmax** = the Fish Bioenergetics maximum consumption.
- **p** = the proportion of Cmax actually eaten.

Unless marked otherwise, the numbers come from north-temperate lakes. Values from rivers, reservoirs, large lakes, laboratories or southern-edge (warm) lakes are flagged as such.

Some findings are secondhand: I saw only an abstract, a citing paper, or a search-engine digest. Those are marked **(secondary)** and should be checked against the primary paper before anyone hard-codes them.

---

## Q1. Prey size: prey-to-pike length ratios (preferred, mean, maximum), the smallest prey large pike still eat, selection for small prey, and prey-type preferences

### Takeaway
In the field, pike eat prey far smaller than their gape allows:
- The **median prey is about 10–18 % of pike TL**, falling slightly as pike grow (about 73 mm for a 65-cm pike).
- The **largest prey (99th percentile) is about 30–45 % of TL**.
- Large pike keep eating small fish: the smallest prey rise only about 1–2 cm across the whole predator size range.

Within any prey species, pike prefer smaller, shallow-bodied, soft-rayed, fusiform prey. Deep-bodied, spiny bluegill are caught less efficiently per strike and become almost immune at **≥100–125 mm TL**.

So 5–7 cm sunfish are exactly the *median* prey size of a 65-cm pike. Prey size alone should not starve a pike. Prey *mass* per kill, and the number of kills needed, is the real constraint (see Q2 Inferences).

### Cited Findings
**Field prey-size regressions (Gaeta et al. 2018, PLoS ONE 13(3): e0194092, doi:10.1371/journal.pone.0194092)**
- **Pike data:** 784 pike and **2,233 prey items**, from 7 lake-years in 2 lakes (Alberta and Minnesota), 1976–2013. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
- **Pike quantile regressions** (prey TL = exp(α + β·ln predator TL), all prey shapes): — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
  - median (IP50): α = 1.62, β = 0.413;
  - maximum (IPmax, 99th percentile): α = −3.70, β = 1.43.
- **Pike trends with size:** median prey size *decreased or stayed roughly constant relative to* pike length, and relative IPmax was fairly constant. From the 5th to the 95th percentile of pike length, IP50 rose only 40–53 % while IPmax rose >126 %. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
- **Across all 7 piscivores** (pike, largemouth bass, smallmouth bass, walleye, muskellunge, crappie, rock bass): — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
  - median prey is **10–20 %** of predator TL (full range 9–25 %);
  - maximum prey is **32–46 %** (full range 32–57 %);
  - median log10 predator:prey mass ratios are **1.9–2.5**, i.e. the prey weighs about 0.3–1.3 % of the predator;
  - predators eat **larger fusiform prey than laterally compressed prey**.
- **Smallest prey (IPmin, 1st percentile):** across taxa (muskellunge excepted) it rose by only **about 7–14 mm** (described as +37–108 %) from the 5th to the 95th percentile of predator length. Pike-specific IPmin coefficients are in the S2 Appendix, which I did not retrieve. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
- **Earlier pike values quoted in Gaeta et al.:** 28 % (90th percentile, all prey); 50 % (maximum, all prey); **20–23 % for bluegill prey**; 40–42 % for gizzard shad prey. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
- **Largemouth bass comparison:** 959 bass and 1,486 prey items from 22 lakes in IL, MN, NY and WI. Unlike pike, bass IP50 *increased* with bass length (>200 % across the size range), while relative IPmax decreased. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)

**Gape and selection for small prey**
- **Gape limit (Nilsson & Brönmark 2000, Oikos 88: 539–546, doi:10.1034/j.1600-0706.2000.880310.x):** pike gape scales linearly with pike length. The largest prey a pike can swallow is set by prey **body depth**, and the gape limit is larger than earlier work assumed. — [Nilsson & Brönmark 2000, Oikos](https://lup.lub.lu.se/record/146726)
- **Preferences in the same paper:** pike preferred shallow-bodied roach over deep-bodied bream, and **preferred the smaller prey within each species**. Handling time rose with prey depth. The authors argue that prey vulnerability depends on handling risk (kleptoparasitism, cannibalism), not on gape alone. — [Nilsson & Brönmark 2000, Oikos](https://lup.lub.lu.se/record/146726)
- **Handling (Nilsson & Brönmark 2000, J. Fish Biol. 57: 516–524):**
  - **small prey took the shortest manipulation time**;
  - intermediate prey were as slow to handle as large prey, because pike struggled to turn them head-first;
  - gastric evacuation of equal-mass rations did *not* differ between small and large prey.
  — [Nilsson & Brönmark 2000, JFB](https://lup.lub.lu.se/record/146713)
- **Baltic comparison with perch:** pike had a larger mean and maximum prey:predator size ratio than perch, but a *smaller* minimum ratio. In other words, pike span a wider range of prey sizes. **(secondary — attribution per search digest)** — [Environ. Biol. Fishes 2017, doi:10.1007/s10641-017-0710-2](https://link.springer.com/10.1007/s10641-017-0710-2)
- **Prey size of very large pike:** in Czech lakes (pike 79–86 cm mean TL), prey fish in stomachs were >10 cm, citing Vejřík et al. This is a large-lake, large-pike context. — [Říha et al. 2021, Sci. Rep. 11: 17472](https://pmc.ncbi.nlm.nih.gov/articles/PMC8410764/)
- **Agency rule of thumb:** "optimal food size has been estimated between 1/3 and 1/2 the length of the pike" (Maine DIFW 2001, no primary citation given). **This conflicts with the field medians above (10–18 %)**: it probably describes the energetically optimal or gape-limited size, not what pike actually eat. — [Maine DIFW Northern Pike Assessment](https://www1.maine.gov/ifw/docs/strategic-management-plans/northernpike.pdf)

**Prey-type preferences (soft-rayed vs spiny-rayed)**
- **Wahl & Stein 1988 (TAFS 117: 142–151), lab:** pike, muskellunge and tiger muskellunge did not differ in capture ability. **Mean captures per strike were 0.78 on gizzard shad and 0.67 on fathead minnow, versus lower on bluegill.** The online abstract prints the bluegill value as "0A4", most likely 0.44, so verify. — [Wahl & Stein 1988 abstract](https://muskiescanada.ca/en/document/selective-predation-by-three-esocids-the-role-of-prey-behaviour-and-morphology/)
- **Wahl & Stein 1988, field:** esocids in a reservoir whose only prey were centrarchids **ate fewer fish and grew more slowly** than esocids with gizzard shad available. Where both bluegill and shad occurred, esocids strongly preferred shad. — [Wahl & Stein 1988 abstract](https://muskiescanada.ca/en/document/selective-predation-by-three-esocids-the-role-of-prey-behaviour-and-morphology/)
- **Moody, Helland & Stein 1983 (tiger muskellunge, lab):** catching bluegill took **about 4× as many strikes**, and longer pursuits, as catching fathead minnows. Bluegill escape through cover-seeking and a deep, spiny body. — [Moody et al. 1983](https://kb.osu.edu/items/2d9c1542-ae6e-5da4-8e7d-802b170a400f)
- **Beyerle & Williams 1968 (TAFS 97: 28–31; aquaria):** given a choice, pike ate **soft-rayed minnows and chubsuckers rather than spiny-rayed centrarchids and percids**, and centrarchids rather than bullheads. The authors caution that differences in how accessible each prey was may partly explain the "selectivity". **(secondary — via Michigan DNR reports)** — [Michigan DNR Research Report 1704](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1701-RR1800/RR1704.pdf)
- **Bluegill size refuge:** bluegill "are relatively invulnerable to even large piscivores such as northern pike … and largemouth bass … after reaching **100–125 mm TL**", and "are usually not a preferred prey even at smaller sizes" (citing Beyerle & Williams 1968; Wahl & Stein 1988). Unless these piscivores occur at uncommonly high densities, they cannot eat enough bluegill to relieve stunting (Beyerle 1971, TAFS 100: 69–73). — [Schneider & Breck 1997, Michigan DNR Fish. Res. Rep. 1992](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1992.pdf)
- **Diet preference in small Wisconsin lakes:** pike feed opportunistically, with some preference for **yellow perch** and **soft-rayed white suckers** (Margenau et al. 1998). **(secondary)** — [Michigan DNR Rush Lake status report citing Margenau et al. 1998](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/IFR/ifrlibra/Status/Waterbody/2005-13_Rush_Lake.pdf)
- **Yellow perch as the main prey:** perch were the **preferred prey of pike regardless of perch abundance** (Spirit Lake, Iowa, a large natural lake). — [Iowa DNR / Liao et al. 2002 summary](https://pubs.usgs.gov/publication/70024215); [USGS consumption-dynamics record](https://www.usgs.gov/publications/consumption-dynamics-adult-piscivorous-fish-community-spirit-lake-iowa)
- **Voyageurs NP lakes (MN):** fish, mainly **yellow perch, made up >60 % of pike diet (by mean % mass) in every season**. — [Soupir, Brown & Kallemeyn 2000, Can. J. Zool. 78: 1759–1766](https://pubs.usgs.gov/publication/70174039)
- **Lac Ste. Anne, Alberta (Diana 1979; 1,290 pike):** diet by number was, in order, yellow perch, spottail shiner, burbot and white sucker. **Occasional large prey (suckers, burbot) had a significant effect on total calorie intake.** — [Diana 1979, Can. J. Zool. 57: 2121–2127](https://cdnsciencepub.com/doi/abs/10.1139/z79-279)

### Inferences
**Expected prey sizes.** Computed from the Gaeta et al. pike regressions (mm):

| Pike TL | Median prey | 99th-percentile prey |
|---|---|---|
| 300 mm | 53 mm (18 %) | 86 mm (29 %) |
| 400 mm | 60 mm (15 %) | 130 mm (33 %) |
| 500 mm | 66 mm (13 %) | 179 mm (36 %) |
| **650 mm** | **73 mm (11 %)** | **260 mm (40 %)** |
| 800 mm | 80 mm (10 %) | 350 mm (44 %) |

A 65-cm pike in the field therefore typically eats prey about 7 cm long. The 5–7 cm sunfish in the sim sit right at that median.

**The 4.6-cm cutoff.** Taxa-wide, IPmin climbs only about 7–14 mm across predator sizes, which implies that large pike still take fish of about **2–4 cm** at the low tail. The sim's `PREY_MIN` of 0.07 TL (4.6 cm) is therefore on the high side. Something like **0.03–0.05** would match the field data better. This matters little for 5–7 cm prey, but it does matter for YOY in the summer.

**Real-world vs sim strike success on sunfish.** The sim's per-strike success on a 6-cm sunfish is `capture` 0.6 × `vuln` 0.35 × the size refuge ≈ 0.56, which gives **about 0.12** before the lunge and cover factors. The lab-measured esocid captures per strike on bluegill was **about 0.4** (if "0A4" = 0.44), or about 4× fewer than on fatheads (Moody et al.). The sim's spiny-prey penalty may therefore be stacked too heavily: the vulnerability factor and the size refuge are multiplied together, and the lab value already includes both.

**Bluegill refuge.** The ≥100–125 mm refuge is a real, documented feature and should be preserved. A pike can physically swallow a 10–20 cm bluegill but rarely does.

### Gaps
- I could not find pike-specific IPmin (1st-percentile) coefficients. They are in Gaeta et al.'s S2 Appendix, which I did not retrieve.
- I could not access the full texts of Hart & Hamrin (1988, Oikos), Mann (1982, J. Anim. Ecol. 51: 81–95; River Frome, a river) or Mittelbach & Persson (1998, CJFAS), so their numeric preferred-size ratios are not reported here.
- A search digest reported a pike cannibalism study with a mean prey:cannibal length ratio of 66.2 % and a prey head depth:mouth width ratio of 87.6 %. I could not identify or verify its source.
- Mass-based prey-size distributions (rather than length-based) for pike in small Midwestern lakes were not found.

---

## Q2. Consumption: daily ration (%BW/d) by temperature and season, bioenergetics (Bevelhimer et al. 1985; FB4) and field p-values, annual consumption per kg of pike, meal frequency, and gastric evacuation

### Takeaway
Field and bioenergetics estimates put **annual pike consumption at about 3–4 g prey per g pike for adults (age 3–6), and 5–7 g/g for age 1–2**. Growth takes only 10–30 % of what is eaten.

Summer daily rations in the Alberta study were roughly 1–3 %BW/d, peaking in late summer and autumn. Winter rations are much lower. Gastric evacuation takes about 2 days in summer.

The standard esocid bioenergetics model **overestimates field consumption by 32–59 %**. FB4's pike set (Bevelhimer et al. 1985) was fitted to small pike of 9–53 g with a 25 °C growth optimum, so it overstates both the consumption ceiling and the warm optimum of large lake pike.

I found **no published field p-value for pike in a small Midwestern lake**.

### Cited Findings
**Field daily rations (Lac Ste. Anne, Alberta)**
- Diana 1979 built a daily-ration model for a top carnivore from 1,290 pike. Its key assumption is that feeding is brief relative to the interval between meals (pike are meal feeders). **Females ate about 1.5–2.3× as much as males in both summer and winter.** — [Diana 1979, Can. J. Zool. 57: 2121–2127, doi:10.1139/z79-279](https://cdnsciencepub.com/doi/abs/10.1139/z79-279)
- In winter, the daily meal and daily ration were considerably lower than in summer and autumn. Daily ration (g) rose with body size, while ration as %BW fell with body size. **(secondary — abstract digest)** — [Diana 1979 on ResearchGate](https://www.researchgate.net/publication/237984276_The_feeding_pattern_and_daily_ration_of_a_top_carnivore_the_northern_pike_Esox_lucius)
- A bioenergetics budget for the same Alberta lake reported monthly consumption of about **1 %BW/d in June, 2 % in July and 3 % in August–September**. Food intake estimated from heart rate was **1.5 %BW/d**. **(secondary — search digest; attribution to Diana 1983 and Lucas et al. 1991 is uncertain)** — [Diana 1983, Can. J. Zool., doi:10.1139/z83-259](https://doi.org/10.1139/z83-259); [Lucas et al. 1991, J. Fish Biol.](https://onlinelibrary.wiley.com/doi/10.1111/j.1095-8649.1991.tb03119.x)
- Diana's 1983 energy budget found that the model's predicted ration and growth fitted the field-estimated ration poorly. He concluded the **field ration data were probably inaccurate**, and computed budgets without them. — [Diana 1983 (abstract via search)](https://doi.org/10.1139/z83-259)
- Using Diana's (1979) rations, one rough area-based estimate is **about 7–11 kg wet fish prey ha⁻¹ d⁻¹** of pike consumption. **(secondary; the original source of this conversion was not identified, and it seems high)** — [Diana 1979 on ResearchGate](https://www.researchgate.net/publication/237984276_The_feeding_pattern_and_daily_ration_of_a_top_carnivore_the_northern_pike_Esox_lucius)
- Empty stomachs were common: **34.7–66.7 %** of pike in Voyageurs NP lakes (MN). — [Soupir et al. 2000](https://pubs.usgs.gov/publication/70174039)

**Annual consumption**
- **Heikinheimo 1996** (Ecol. Freshw. Fish 5; two lakes in northeastern Finland; bioenergetics model): — [Heikinheimo 1996](https://onlinelibrary.wiley.com/doi/10.1111/j.1600-0633.1996.tb00035.x)
  - annual specific consumption **7–5 g/g at ages 1–2** and **4–3 g/g at ages 3–6**;
  - **10–30 %** of ingested food went to growth, highest in the youngest fish.
- **River Frome, England (a river):** FishBase lists a population Q/B of **6.43 yr⁻¹**, credited to Palomares 1991. **(secondary; not checked against Mann 1982)** — [FishBase Q/B for Esox lucius](https://fishbase.ca/TrophicEco/FoodConsuSummary.php?autoctr=59)
- **Wisconsin DNR:** a pike "needs five to six pounds of food for every pound" of growth. This is a gross conversion of about 17–20 %, not an annual intake. — [Wisconsin DNR pike fact sheet](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_northernpike.pdf)

**Bioenergetics model accuracy and temperature parameters**
- **Wahl & Stein 1991** (TAFS 120: 230–246; field tests of the esocid model; I did not verify the study sites) is the source of the pike energy density used downstream: 1,049 cal/g (4,391 J/g). The northern pike model **overestimates consumption by 32–59 %** compared with field estimates; for comparison it is within 5–15 % for largemouth bass and salmonids. **(secondary — via a Colorado DNR document)** — [Colorado CWCB document citing Wahl & Stein 1991](https://dnrweblink.state.co.us/CWCB/0/doc/134067/Page6.aspx); [FishBase reference record](https://fishbase.org/references/FBRefSummary.php?id=32418)
- Follow-up work on tiger muskellunge (Chipps, Einfalt & Wahl 2000) supports those field tests: the esocid model **generally overestimates consumption, especially in winter and in fish with low feeding and growth rates**. — [Chipps et al. 2000 (USGS record)](https://pubs.usgs.gov/publication/70022528)
- **Bevelhimer et al. 1985 vs Casselman 1978:** — [Jacobson 1992, MN DNR Investigational Report 424](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)
  - Bevelhimer et al. used **small pike (9–53 g)** from an Ohio stock and found **25 °C optimal for growth**; their fish were still growing at 30 °C.
  - Casselman (1978a) used **larger pike (203–664 g)** from Ontario (about 45°54′N) and found an **optimum of 19 °C**, **growth stopping at 27.5 °C** and **death at 29.4 °C**.
  - Hokanson et al. (1973) put the optimum for larval pike (<55 mm) at 26 °C.
  - Jacobson suggests the optimum falls as pike get bigger.
- **Jacobson's Minnesota model** (Casselman's data used for Cmax; 100-g pike): — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)
  - **consumption peaks at 21.9 °C**;
  - scope for growth peaks at **about 21 °C**, and **growth ceases at 26 °C**;
  - it predicted lab growth well at 10–23 °C, but underestimated growth below 10 °C and above 23 °C, and overall by 40 % under very low rations;
  - below 10 °C, consumption was set to maintenance.
- **Jacobson's population simulations** (June 1–September 1 temperature held fixed): annual population **consumption peaked at a 22 °C summer**, and **production and weight-at-age-5 peaked at 21 °C**. **Production and weight at age 5 went negative when summer temperatures exceeded 26 °C.** — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)

**Meal frequency and gastric evacuation**
- Pike clear a meal in **about 48 h in summer at 14–18 °C** (Diana 1979, as cited by a later Mactaquac study). **(secondary)** — [Diana 1979](https://cdnsciencepub.com/doi/abs/10.1139/z79-279)
- Evacuation rate does not depend on prey size for equal-mass meals. Two intermediate-sized prey cannot fit in the stomach at once, so they are evacuated one after the other. — [Nilsson & Brönmark 2000, JFB](https://lup.lub.lu.se/record/146713)

### Inferences
**FB4 Bevelhimer pike set as coded in `src/species.js`.**
- The coded temperature term is CEQ 4: Cmax = 0.0244·W^−0.18·exp(−0.024T + 0.0125T² − 0.000326T³).
- Respiration is REQ 1: R = 0.0026445·W^−0.18·e^{0.055T}·e^{0.1222}, multiplied by 13,560 J/g O₂.
- Egestion FA is 0.2, excretion UA 0.0875 and SDA 0.175. Maintenance ration ≈ R / [(1 − FA)(1 − UA − SDA)], with prey at 4,186 J/g.

My calculations from these parameters:

| Pike | T (°C) | Cmax (%BW/d) | Maintenance (%BW/d) | p at maintenance | Maintenance (g/d) |
|---|---|---|---|---|---|
| 65 cm (1,870 g) | 15 | 2.4 | 0.96 | 0.40 | |
| | 19 | 3.9 | 1.20 | 0.31 | |
| | 21 | 4.6 | 1.34 | 0.29 | |
| | 23 | 5.1 | 1.50 | 0.29 | 28 |
| | 25 | 5.2 | 1.67 | 0.32 | 31 |
| | 26 | 5.1 | 1.77 | 0.35 | 33 |
| | 28 | 4.5 | 1.97 | 0.44 | |
| 45 cm (600 g) | 23–26 | 6.3–6.4 | 1.8–2.2 | | |

- The FB4 Cmax curve **peaks at about 24–25 °C**, a small-pike optimum. Casselman's and Jacobson's large-pike data instead peak at about 19–22 °C, with growth stopping at 26–27.5 °C.
- The FB4 set will therefore *not* produce a summer feeding depression at 23–26 °C on its own. If the sim's pike starve in summer, the cause is encounter or capture, not the Cmax curve.
- For realism, either:
  - apply a large-fish thermal correction (optimum about 20–21 °C, zero net growth at about 26 °C, after Jacobson/Casselman); or
  - scale Cmax down by about 0.6–0.75, following Wahl & Stein's 32–59 % overestimate.

**How many 5–7 cm sunfish is maintenance?** A bluegill weighs about 1.8 g at 5 cm, 3.3 g at 6 cm and 5.6 g at 7 cm (bluegill Ws, a = 0.00875, b = 3.316, TL in cm).
- A 65-cm pike at 23–26 °C needs **about 8–10 six-cm sunfish per day just to maintain weight**, about 380–450 in 45 days.
- To grow at a field-like p of about 0.4–0.5, it would need about 12–15 per day.
- The sim's 17 kills per 45 days (if that is per pike) is therefore about 4 % of maintenance with 3-g prey. Even 80 kills per 45 days is only about 20 %.
- Real pike close this gap with occasional large prey (perch 10–20 cm, suckers, YOY bass, frogs). Diana found that large prey dominate the calorie intake.
- So the most realistic fixes are:
  - more prey *mass* per kill (larger prey options: perch, suckers, larger shiners); and/or
  - higher per-strike success on small sunfish, near the lab value of about 0.4;
  - rather than relaxing the size cutoff.

**Annual budget.** At 3–4 g/g/yr, one 1.9-kg pike eats **about 5.6–7.5 kg of prey per year**, about 15–20 g/d averaged over the year. At 0.07 ha that is about 80–110 kg prey ha⁻¹ yr⁻¹ from a single pike. Real small lakes support this only at much lower pike biomass per hectare (see Q5).

### Gaps
- **No field p-value** (proportion of Cmax) for pike in a small Upper-Midwest lake was found. Wahl & Stein (1991) and Liao et al. (2004, Spirit Lake, NAJFM 24: 890–902) probably report p or field rations, but I could not access them.
- Diana's (1979) numeric daily rations (%BW/d by month) were not readable. The 1/2/3 %BW/d monthly figures are secondhand.
- I could not retrieve the exact FB4 pike parameters from the FB4 repository. I relied on the project's copy in `src/species.js`.
- I found no direct measurement of meal frequency (days between meals) in wild pike. The heart-rate studies (Armstrong 1986; Lucas et al. 1991) were paywalled.
- The winter gastric evacuation time ("12 days in winter", quoted in the species.js comment as Diana 1979) was not verified.

---

## Q3. Temperature: optimum for growth and consumption, summer depression above 22–25 °C, behavioural thermoregulation, condition, and winter feeding under ice

### Takeaway
For large pike:
- **Growth peaks at about 19–21 °C**, and consumption at about 22 °C.
- **Growth stops at about 26–27.5 °C**, and death comes at about 29.4 °C (Ontario stock).

In lakes whose summer water is 23–26 °C, real pike:
- move to the coolest oxygenated water available (≥3 mg/L DO), selecting **16–21 °C** where they can;
- reduce activity;
- grow less or lose weight. Growth falls measurably as July bottom temperature rises from 20 to 25 °C.

Pike keep feeding through winter, but at low rates (about 4 % of maximum growth) and only where DO is above about 2 mg/L.

### Cited Findings
**Thermal optimum and limits**
- **Casselman 1978 (Ontario stock):** optimum 19 °C; growth stops at 27.5 °C; death at 29.4 °C. — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)
- Casselman's linear-growth optimum is **19.8 ± 0.6 °C**. **(secondary)** — [Gibson & Haedrich 2010, citing Casselman 1978](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- Casselman's optimum for adult pike is **18–20 °C**; for YOY and yearling pike it is near **26 °C** (Hokanson et al. 1973). **(secondary)** — [Laine 1988 thesis, Lakehead University](https://knowledgecommons.lakeheadu.ca/handle/2453/2141?show=full)
- Pike's optimal growth temperature is **about 21 °C**, versus 15 °C for Arctic charr. This is a subarctic Swedish context. — [Fisheries Ireland review citing Byström et al. 2007](https://www.fisheriesireland.ie/sites/default/files/migrated/docman/2017/pike%20review/PikeImpact_InternationalReview.pdf)
- Jacobson's Minnesota bioenergetics: **Cmax peaks at 21.9 °C, growth is best at about 21 °C, and growth ceases at 26 °C**. Population production goes **negative at summer temperatures >26 °C**. — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)

**Thermoregulation and DO limits**
- **Minnesota telemetry (Pierce et al. 2013, TAFS; three lakes):** in July–August, **large pike followed the thermocline into cooler water** as the upper layers warmed. In **August, selection ratios showed they preferred 16–21 °C when water up to 28 °C was available**. They tolerated some DO **<3 mg/L**, but low DO generally constrained depth selection in summer and winter. **(secondary — search digest of the paper)** — [MN Legislative Reference Library copy](https://www.lrl.mn.gov/docs/2013/other/131208.pdf); [Deep Blue record](https://deepblue.lib.umich.edu/items/0454ea57-765e-48ad-ad19-7a7ee0b29001)
- **Headrick & Carline 1993** (TAFS 122: 228–236; two southern Ohio impoundments, i.e. southern-edge reservoirs):
  - summer habitat was **restricted by warm epilimnetic temperatures and anoxic bottom water**;
  - seasonal growth of tagged fish was related to how much suitable habitat was available;
  - pike moved to small cool areas (near drop-offs and submerged stream channels) **where they could hold body temperature near 25 °C**. In northern lakes, by contrast, pike stay in nearshore vegetation.

  — [Headrick & Carline 1993 abstract](https://academic.oup.com/tafs/article-abstract/122/2/228/7893160)
- **Headrick 1985 (Ohio reservoirs):** pike "would generally not move into water with less than 3.0 ppm DO during summer stratification". Jacobson therefore used the **temperature at 3.0 ppm DO** in August as his index of cool-water habitat. — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)
- **Thermoregulation and weight loss:** thermoregulation may limit weight loss in summer, when surface waters are too warm for good growth (Headrick 1985, as cited by Pierce et al. 2013). **(secondary)** — [MN LRL copy of Pierce et al. 2013](https://www.lrl.mn.gov/docs/2013/other/131208.pdf)
- **Indiana (southern edge):** year-round access to cool water **≤73 °F (22.8 °C) with ≥3 ppm DO** is a key condition for producing large pike. — [Indiana Northern Pike Strategic Plan](https://secure.in.gov/dnr/fish-and-wildlife/files/fw-Indiana-Northern-Pike-Strategic-Plan.pdf)
- **Czech lakes (252–311 ha, deep):** higher water temperature **reduced pike activity and pushed pike deeper**. — [Říha et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8410764/)

**Summer growth depression in warm lakes**
- **Nebraska Sandhill lakes** (shallow, warm, southern edge of range): **pike growth decreased as July bottom water temperature rose across 20–25 °C**. — [Paukert & Willis 2003, NAJFM 23: 313–322](https://www.usgs.gov/publications/population-characteristics-and-ecological-role-northern-pike-shallow-natural-lakes)
- **Nebraska Sandhill lakes, overall:** pike were in relatively poor condition, while panfish grew well. — [Paukert 2001 dissertation](https://openprairie.sdstate.edu/etd/567)
- **Lake Thompson, SD:** summer water temperature was above the optimum for pike growth in both years, which "may have restricted northern pike growth and movements during summer". **(secondary — search digest)** — [Neumann 1994, SDSU thesis](https://openprairie.sdstate.edu/etd/559)
- **Nebraska Sandhill warming scenarios (bioenergetics, 2040/2060):**
  - pike growth fell **by 3–45 %**, while bass weight changed only +4 to −6 %;
  - pike and bass daily and cumulative consumption over April–October were similar;
  - consumption is predicted to shift toward **spring and autumn**, away from summer.

  — [Breeggemann et al. 2015/16, Ecol. Freshw. Fish, doi:10.1111/eff.12248](https://pubs.usgs.gov/publication/70154842)
- **Minnesota statewide (3,713 fish, 112 lakes):** small, young pike grew fastest in **shallow, fertile lakes with long growing seasons**, while the largest pike came from **deep lakes with cisco** (cool, oxygenated hypolimnion). Bioenergetics indicated that summer temperature and density control growth. — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)

**Winter**
- **Winter feeding:** in Lac Ste. Anne pike fed in winter, but rations were much lower than in summer and autumn, and females still ate 1.5–2.3× as much as males. — [Diana 1979](https://cdnsciencepub.com/doi/abs/10.1139/z79-279)
- **Winter growth and DO (Casselman's work, via the popular press):** **(secondary/popular source — verify against Casselman's primary papers)** — [In-Fisherman, "Understanding Winter Pike"](https://www.in-fisherman.com/editorial/understanding-winter-pike/387779)
  - pike grow in winter, but at **only about 3.9 % of maximum**;
  - they **stop feeding below about 2 ppm DO** (about 22 % saturation);
  - they show no signs of stress at 0 °C for long periods.
- Cool-water fish such as pike and bluegill **lose weight over winter** ("they're not eating a lot"). — [UW Center for Limnology blog](https://blog.limnology.wisc.edu/?p=3579)

### Inferences
- In a 23–26 °C mesotrophic lake without a cool, oxygenated refuge, real adult pike would be at or past zero net growth. **Summer starvation or weight loss is realistic in direction**, but real pike keep feeding near maintenance rather than collapsing.
- A drop in kills from 80 to 17 per 45 days (about −80 %) is larger than the literature implies. Jacobson's curve has consumption at 23–26 °C still near its peak; growth, not intake, is what collapses.
- If the sim lake has a hypolimnion, pike should seek water at about 16–21 °C with DO ≥3 mg/L.
- If the sim's pike are hit by the FB4 thermal penalties but cannot reach cool water, they will lose weight. That is correct for southern-edge lakes (Ohio, Nebraska), but too severe for a typical Upper-Midwest lake with a thermocline.

### Gaps
- I could not read the full text of Headrick & Carline 1993 for the measured summer weight change (g or % per month) or condition indices.
- I could not read the full text of Pierce et al. 2013 for exact depths by month and size class.
- Casselman 1978 (AFS Spec. Publ. 11: 114–128) was not accessed directly; its values come via Jacobson 1992 and theses.
- I found no quantitative winter daily ration (%BW/d) at 1–4 °C for pike.

---

## Q4. Habitat and hunting: ambush in vegetation, depth use by season, activity patterns, and strike success

### Takeaway
Pike are sit-and-wait ambush predators of the littoral weed edge:
- **optimal cover is 35–80 % vegetation**, inversely related to pike size;
- they strike with an S-start fast-start;
- they are inactive much of the time, and warm water reduces activity further.

Large pike move deeper and offshore as summer warms (Q3). In structurally complex, weedy lakes they move less, use smaller areas and can grow more slowly than in open lakes, where they hunt more actively.

Lab capture success per strike is about **0.67–0.78 on soft-rayed fusiform prey**, and lower on bluegill (about 0.4?).

I found no field strike-success values.

### Cited Findings
- **Cover:** optimal juvenile and adult cover is **35–80 %**, inversely related to body size (Casselman & Lewis 1996, CJFAS 53 Suppl. 1). **(secondary)** — [Gibson & Haedrich 2010](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- **Vegetated pike habitat (Netherlands):** biomass of pike <54 cm FL depends strongly on vegetated area, up to **100–120 kg of pike per ha of pike habitat**. **(per ha of vegetation, not per ha of lake)** — [Grimm, FAO EIFAC document](https://www.fao.org/4/ae996b/AE996B02.htm)
- **Strike mechanics:** the esocid feeding strike is an **S-start fast-start**, in which the S-bend precedes and forms part of the capture (Webb & Skadsen 1980; Rand & Lauder 1981; Harper & Blake 1991). — [Schriefer & Hale 2004, J. Exp. Biol. 207: 535](https://journals.biologists.com/jeb/article/207/3/535/15301/Strikes-and-startles-of-northern-pike-Esox-lucius)
- **Lab captures per strike (esocids including pike):** 0.78 on gizzard shad and 0.67 on fathead minnow, lower on bluegill (printed "0A4", likely 0.44). — [Wahl & Stein 1988](https://muskiescanada.ca/en/document/selective-predation-by-three-esocids-the-role-of-prey-behaviour-and-morphology/)
- **Tiger muskellunge on bluegill vs fatheads:** 4× more strikes per capture on bluegill. — [Moody et al. 1983](https://kb.osu.edu/items/2d9c1542-ae6e-5da4-8e7d-802b170a400f)
- **Říha et al. 2021** (Czech lakes Milada, 252 ha with 60–91 % macrophyte cover inshore, and Most, 311 ha with 0.1–1.6 % cover; 25 pike of 79–86 cm tracked 27 May–10 October): — [Říha et al. 2021, Sci. Rep.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8410764/)
  - in the low-structure lake, pike were **more active**, used larger daily 95 % kernel areas, used open water more (odds ratio 16.35), and dived to 35 m;
  - back-calculated growth was **higher in the low-structure lake (142 ± 13.5 vs 90 ± 16.5)**, which the authors attribute to more prey encounters;
  - diets in both lakes relied heavily on littoral sources;
  - warmer water reduced activity and pushed pike deeper.
- **Activity cost:** activity costs were up to 15 % of standard metabolism in relatively active pike (Lucas et al.). **(cited in Říha et al.)** — [Říha et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8410764/)
- **Georgian Bay telemetry:** pike used shallow vegetated areas even where temperatures greatly exceeded the 19–21 °C optimum. Thermally suitable habitat grew from July to September but was confined to deeper water away from the coastal marshes. **(secondary — search digest; large-lake context)** — [McMaster thesis](https://macsphere.mcmaster.ca/bitstream/11375/14109/1/fulltext.pdf)
- **Ohio reservoirs:** summer refuges were near drop-offs and submerged stream channels, not in nearshore vegetation. — [Headrick & Carline 1993](https://academic.oup.com/tafs/article-abstract/122/2/228/7893160)

### Inferences
- The sim's pike `innate` settings (ambush, cover 0.55, weed-edge lurker) match the literature.
- In summer, though, real large pike trade weed-edge ambush for deeper, cooler water. Ambush success at the weed edge then falls, so pike in warm lakes may lose feeding opportunities as well as metabolic scope.
- Dense weeds raise sunfish refuge and lower pike encounter rates. Říha et al. found pike in the high-structure lake grew about 37 % slower.
- Per-strike success on soft-rayed prey of about 0.7 is a defensible ceiling for a well-placed strike. The value for deep-bodied centrarchids should be roughly half to two-thirds of that, not one-fifth.

### Gaps
- **No field (in-lake) pike strike-success or attack-rate data** were found. Webb & Skadsen (1980), Diana (1980, CJFAS 37: 1454–1458, on diel activity and swimming speed in Lac Ste. Anne) and Kobler et al. (2008, Hydrobiologia 601: 17–27, on summer vs winter movement in a small lake) were not accessible.
- Percent of time inactive, diel activity peaks and home range in small lakes were not quantified here.

---

## Q5. Population: density (fish/ha, kg/ha) in small Midwestern and Canadian lakes, size structure, growth, annual mortality, recruitment needs, and stunting

### Takeaway
In small north-temperate lakes:
- **pike ≥35 cm occur at about 3–59 fish/ha** (Minnesota), and **≥60 cm at only about 1.6/ha**;
- a high-density, newly established Nebraska population reached **35.8/ha and 22 kg/ha**;
- harvest alone took **1.8–8.8 pike/ha/yr (1.8–5.2 kg/ha/yr)** from small Minnesota lakes;
- total annual mortality averages **about 0.48** (0.64 in a stunted Wisconsin lake).

Growth is strongly density-dependent: high densities "stack up" small, slow-growing pike (stunting). Recruitment requires flooded, vegetated shallows at ice-out.

### Cited Findings
**Density**
- **Minnesota lakes (Pierce & Tomcko 2003, TAFS 132: 143–153; 2005, TAFS 134: 231–241):** pike >350 mm TL occur at **3.2–59.0 fish/ha**, and pike >600 mm average **1.6 fish/ha**. **(secondary)** — [Gibson & Haedrich 2010](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- **Minnesota small-lake study (Pierce & Tomcko 1997):** 8 small north-central Minnesota lakes of **27–254 ha**, maximum depth 11–20 m, 23–80 % of area shallower than 4.6 m. — [Pierce & Tomcko 1997, MN DNR Investigational Report 454](https://www.lrl.mn.gov/docs/pre2003/other/970162.pdf)
  - pre-regulation harvest was **1.8–8.8 pike/ha (1.8–5.2 kg/ha)** per year, mostly in summer (Pierce et al. 1995, NAJFM 15: 601–609);
  - annual exploitation was 0.04–0.22 (mean 0.09), against **total annual mortality averaging 0.48**, so natural mortality dominates;
  - exploitation of pike >500 mm was 2–9× that of smaller pike.
- **West Long Lake, Nebraska (25 ha):** four years after pike first appeared (1998), a 2002 mark–recapture gave **35.8 pike/ha and 22.0 kg/ha**. — [DeBates, Paukert & Willis 2003, J. Freshw. Ecol. 18: 353–359](https://pubs.usgs.gov/publication/70025129); [Fisheries Ireland review (25 ha)](https://www.fisheriesireland.ie/sites/default/files/migrated/docman/2017/pike%20review/PikeImpact_InternationalReview.pdf)
- **Minipi Lake, Labrador:** **8.6 pike/ha (95 % CI 5.7–16.2)** in a 12.4-ha, 1–2 m deep bay of an unexploited lake. — [Gibson & Haedrich 2010](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- **Productive southern English rivers (Mann 1980):** 32–80 pike/ha older than 0+. **(river)** — [Gibson & Haedrich 2010](https://naturenl.ca/pike-population-in-minipi-lake-labrador/)
- **River Tryggevælde, Denmark:** 12 adults/ha and **68.6 kg/ha** (mean 5.54 kg each), described as high for European rivers. **(river)** — [Tryggevælde report](https://admin.stevns.dk/Media/638094786001886115/Gedde%20i%20Tryggev%C3%A6lde%20%C3%85dal.pdf)
- **Baltic archipelago bay (spatial capture–recapture):** 65 pike/ha ≥42 cm and 31/ha ≥60 cm. **(coastal brackish water)** — [TAFS 155(2): 160](https://academic.oup.com/tafs/article/155/2/160/8405409)
- **Prey-fish biomass context:** in a small Wisconsin lake after pike introduction, emigration removed as much prey biomass as consumption when prey biomass was **>40 kg/ha**, but not when it was **<30 kg/ha**. — [He & Kitchell 1990, TAFS 119: 825–835](https://curate.nd.edu/articles/journal_contribution/Direct_and_indirect_effects_of_predation_on_a_fish_community_A_whole_lake_experiment/24829200)

**Size structure, growth and stunting**
- **Minnesota bioenergetics:** growth is **strongly density-dependent**. As recruitment rises (250 to 2,000 three-year-olds simulated), individual consumption falls once the population hits the prey "cap", and at high density length distributions "stack up" at small sizes (poor size structure). Lakes with a history of winterkill produced fewer trophy pike (0.0013 vs 0.0097 trophy entries/ha). — [Jacobson 1992](https://www.lrl.mn.gov/docs/pre2003/other/930346.pdf)
- **Bucks Lake, Wisconsin:** very slow growth (stunted), with total mortality averaging **64 %/yr** against 9 % exploitation. A minimum size limit only protected slow-growing fish with high natural mortality. — [Pierce & Tomcko 1997](https://www.lrl.mn.gov/docs/pre2003/other/970162.pdf)
- **Small Wisconsin lakes (Margenau et al. 1998):** density-dependent growth is an important factor in pike size structure; extensive littoral area and turbidity may limit growth. **(secondary)** — [Michigan DNR Rush Lake report](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/IFR/ifrlibra/Status/Waterbody/2005-13_Rush_Lake.pdf)
- **Island Lake, Wisconsin (Margenau 1995):** a stunted population showed no response to 8 years of manipulation, but pike that moved to Largon Lake grew well and gained condition. **(secondary)** — [Wisconsin DNR / UW digital collections](https://search.library.wisc.edu/digital/ANSEATOVTD3UKP8C/text/ANPILAXEKDO63783)
- **Voyageurs NP lakes (low productivity, <2 % vegetation):** — [Soupir 1998 thesis](https://openprairie.sdstate.edu/etd/418)
  - 62–82 % of pike were 35–71 cm, and none exceeded 71 cm;
  - growth matched Minnesota averages to age 3, then slowed, possibly from a lack of large prey;
  - relative weight Wr was 82–103, lowest in 53–71 cm pike;
  - PSD was 28–51 (16 in Brown Lake).

**Recruitment and spawning**
- **Spawning (Maine DIFW):** — [Maine DIFW 2001/update](https://www1.maine.gov/ifw/docs/strategic-management-plans/northernpike.pdf)
  - pike spawn just before or right after ice-out (late March–April), at water temperatures from the **mid-30s to mid-40s °F (about 2–7 °C)**, in shallow weedy bays, flooded wetlands and slow tributaries;
  - eggs are broadcast over vegetation in water **often <18 in (46 cm) deep**, over 2–5 days;
  - absent vegetation, cold, drawdowns, wind or rain inhibit spawning;
  - about 9,000 eggs per lb of female; hatch in **12–14 days**; larvae cling to vegetation on yolk for about 1 week;
  - young pike eat zooplankton and insects until about 2 in (5 cm), then fish;
  - egg and fry mortality from perch, minnows, insects, waterfowl, cannibalism and stranding is very high.
- **Pennsylvania:** flooded riparian zones and marshes characterize the spawning and nursery habitat essential for natural reproduction. — [PA Fish & Boat Commission Northern Pike Management Plan](https://www.fishandboat.com/Conservation/Plans/Management-Plans/Documents/NorthernPikeManagement.pdf)
- **Nebraska Sandhill lakes:** recruitment was lake-specific, with strong and weak year-classes in the same years in different lakes. — [Paukert & Willis 2003](https://www.usgs.gov/publications/population-characteristics-and-ecological-role-northern-pike-shallow-natural-lakes)

### Inferences
**Pike per 0.07-ha slice at real densities:**

| Source | Real density | Pike per 0.07 ha |
|---|---|---|
| Minnesota, ≥35 cm | 3–59/ha | **0.2–4.1** (typical mid-range ≈ 1) |
| Minnesota, ≥60 cm | 1.6/ha | **≈ 0.1** |
| Nebraska high-density | 35.8/ha, 22 kg/ha | 2.5 pike, **≈ 1.5 kg** |

- A single 65-cm (≈1.9 kg) pike in 0.07 ha is ≈ 27 kg/ha, already above the Nebraska high-density case.
- The sim's K ≈ 4 pike, if they are adults, is ≈ 57/ha. That is at the top of the Minnesota range and, for 65-cm fish, about 35× the real density of ≥60-cm pike.
- At that density, a summer prey shortfall is the *expected* real outcome (stunting or poor condition), not a bug.
- The best calibration is either about 1 adult pike per slice with juveniles, or a slice treated as part of a larger lake (pike moving in and out).

**Mortality.** A total mortality of about 0.48/yr (natural mortality dominant; exploitation about 0.09) is consistent with the sim's M = 0.30 plus other sources.

### Gaps
- Pierce & Tomcko 2003/2005 lake-by-lake tables (density and **biomass kg/ha**, production in kg/ha/yr, P/B) were not accessed. The IR 454 table text was too garbled by OCR to read reliably.
- Pike length-at-age for small Minnesota/Wisconsin lakes was not retrieved here. The project already uses Michigan averages (Schneider et al. 2000, per `src/species.js`): 29.7, 45.0, 52.8, 59.4 and 64.8 cm at ages 1–5.
- No age-0 survival or recruitment-per-spawner numbers for small lakes were found.

---

## Q6. Interactions with largemouth bass: diet overlap, prey partitioning, and pike effects on bass, bluegill and perch

### Takeaway
Where pike and largemouth bass coexist in north-temperate lakes:
- **Pike are the more strictly piscivorous** of the two: >60 % fish by mass, mainly yellow perch. Bass eat many insects (odonates) and crayfish, plus fish.
- Diet overlap is **seasonally significant**: >60 % in at least one season per lake.
- **Pike eat bass, but bass don't eat adult pike.**

Pike establishment reduces the abundance of bluegill, yellow perch and bass, shifts perch and bluegill toward smaller sizes and bass toward larger sizes, and increases growth of all three. Yellow perch respond more than bluegill, because pike prefer perch and soft-rayed prey over deep-bodied, spiny bluegill.

With warming, bass hold up while pike growth falls.

### Cited Findings
- **Voyageurs NP lakes, Minnesota (Soupir, Brown & Kallemeyn 2000, CJZ 78: 1759–1766, doi:10.1139/z00-126):** — [Soupir et al. 2000](https://pubs.usgs.gov/publication/70174039)
  - six boreal lakes at the northern edge of bass range, allopatric and sympatric;
  - pike diet >60 % fish (yellow perch) in every season;
  - bass diet insects 0–79.7 % (odonates, hemipterans) by mass;
  - **bass found in pike stomachs, but bass never ate pike**;
  - **diet overlap >60 % in at least one season in each sympatric lake**;
  - empty stomachs 38–54 % (bass) and 34.7–66.7 % (pike).
- **Soupir's thesis (same lakes):** — [Soupir 1998 thesis](https://openprairie.sdstate.edu/etd/418)
  - bass ate mainly odonates, cannibalized age-0 bass and crayfish;
  - bass grew faster and had higher Wr (88–119) in lakes with pike, likely because bass were less abundant there;
  - both species fed opportunistically.
- **Northeastern Minnesota lakes:** bass trophic position was lower than pike and walleye in most lakes, suggesting low diet overlap, and bass relied most on littoral carbon. **(secondary — search digest)** — [MN DNR Investigational Report 568](https://files.dnr.state.mn.us/publications/fisheries/investigational_reports/568.pdf)
  - **Contradiction:** the same search digest also attributed the *opposite* ordering (pike lowest, then bass) to a related Minnesota DNR summary. This is unresolved; read IR 568 directly before using either ordering. — [2024 FAS/MNDNR survey summary](https://fas.fisheries.org/wp-content/uploads/sites/56/2024/09/2024-FAS-SFR-Award-Research-Surveys-MNDNR.pdf)
- **Nebraska Sandhill lakes, 1998–1999 (Paukert & Willis 2003):** — [Paukert & Willis 2003](https://www.usgs.gov/publications/population-characteristics-and-ecological-role-northern-pike-shallow-natural-lakes)
  - without pike, bass abundance was positively related to yellow perch and bluegill size structure; **the relationships weakened where pike and bass coexisted**;
  - **yellow perch size structure was lower in lakes with pike; bluegill showed no such decline**;
  - pike act as a top-down predator structuring bass–panfish communities.
- **West Long Lake, Nebraska (25 ha), before (1998) and after (2002) pike establishment (DeBates et al. 2003):** — [DeBates et al. 2003](https://pubs.usgs.gov/publication/70025129)
  - the abundance of **bluegill, bass and yellow perch all declined**;
  - **bluegill and perch shifted to smaller sizes**, and **bass shifted to larger sizes**;
  - growth of all three increased, all within about 4 years;
  - the authors conclude that pike should be excluded where quality bluegill and perch fisheries are the goal.
- **Nebraska diets, 2001 (DeBates 2003 thesis):** — [DeBates 2003 thesis](https://openprairie.sdstate.edu/etd/322)
  - in Pelican and West Long lakes, pike ate mainly **yellow perch**; pike >710 mm switched to common carp in September, and pike <350 mm ate a variety of fishes;
  - bass in Pelican Lake also ate mainly yellow perch, while in West Long they ate a wider variety.
- **Nebraska Sandhill bioenergetics (Breeggemann et al. 2015/16):** — [Breeggemann et al.](https://pubs.usgs.gov/publication/70154842)
  - pike and bass had **similar daily and cumulative consumption over April–October**;
  - under warming, pike growth fell 3–45 % against bass +4 to −6 %;
  - combined demand for bluegill and yellow perch rises 3–24 % and shifts to spring and autumn.
- **Pike introduction to a small, piscivore-free Wisconsin lake (14 species; He & Kitchell 1990):** — [He & Kitchell 1990](https://curate.nd.edu/articles/journal_contribution/Direct_and_indirect_effects_of_predation_on_a_fish_community_A_whole_lake_experiment/24829200)
  - dominant northern redbelly dace collapsed and their mean size fell;
  - **sunfish (Lepomis) and creek chub increased**;
  - effects were species-selective and appeared immediately;
  - emigration was as important as consumption when prey biomass was >40 kg/ha.
- **Bluegill control:** pike and bass cannot control stunted bluegill unless they are at uncommonly high densities, because bluegill outgrow them at 100–125 mm and are not preferred prey (Beyerle 1971; Wahl & Stein 1988). Stocking yellow perch was impractical in Minnesota lakes with abundant, slow-growing pike (Goeman et al. 1990). — [Schneider & Breck 1997](https://www.dnr.state.mi.us/PUBLICATIONS/PDFS/DNRFishLibrary/ResearchReports/RR1901-RR2000/RR1992.pdf)
- **Prey-size scaling differs between the two predators:** bass median prey size rises steeply with bass length (>200 % across sizes) and bass take larger fusiform than compressed prey. Pike median prey size stays nearly constant (+40–53 %) while pike take a very wide range. — [Gaeta et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5854328/)
- **Prey-fish extirpation:** introduced pike extirpated prey-fish communities in small Boreal Shield lakes at the Experimental Lakes Area, Ontario (Nicholson et al. 2015). Prey in lakes without native piscivores were the most vulnerable. — [Fisheries Ireland review](https://www.fisheriesireland.ie/sites/default/files/migrated/docman/2017/pike%20review/PikeImpact_InternationalReview.pdf)

### Inferences
**Partitioning in a sim lake with both predators:**
- **Pike:** fish specialists on yellow perch, soft-rayed minnows, suckers and shiners, and on young bass. Their success on bluegill is limited.
- **Bass:** mixed insect, crayfish and fish diets, with more littoral and benthic prey.
- **Overlap:** strongest in seasons when YOY perch and sunfish are abundant (summer–autumn).

**Missing soft-rayed prey.** If the sim's prey base is mostly 5–7 cm sunfish with few soft-rayed or fusiform fish, the real-world expectation is that pike **eat fewer fish and grow more slowly** than bass (Wahl & Stein 1988 field result). Some summer stress is then realistic. But real pike lakes almost always contain perch, shiners or suckers, which act as a "buffer" that keeps pike fed (Beyerle 1970, per Michigan DNR). Adding such prey, or letting pike take bass YOY and frogs, may matter more than tuning bluegill catchability.

**Warm-water competition.** At 23–26 °C, bass (FB4 CTO 27.5 °C) are near their optimum while pike are past theirs. In warm, shallow lakes bass should outcompete pike for shared prey in summer, while pike regain the advantage in spring, autumn and under ice.

### Gaps
- The full text of Paukert et al. 2003 (J. Freshw. Ecol. 18: 13–24, bioenergetic modelling of pike vs bass with 10 years of community sampling) was not accessed; its consumption numbers (kg/ha/yr by predator) would directly calibrate predator-specific demand.
- Quantitative overlap indices (Schoener's α by season) from Soupir et al. 2000 were not retrieved beyond the ">60 % in ≥1 season" summary.
- I found no small-lake study quantifying bass predation on age-0 pike, or competition between YOY pike and bass, in the Upper Midwest.
