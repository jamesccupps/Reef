# First-winter (overwinter) mortality of young-of-year fish, by size and winter length

Research for the Hot Brook sim's compensatory brake on recruitment: size-dependent mortality of age-0 fish through their first winter. Hot Brook (sim calendar, `SEASON.TEMP_KNOTS`): **208 days below 10 °C** (Oct 15 → May 12), **178 days below 6 °C** (Nov 4 → Apr 30), **161 days below 4 °C** (Nov 14 → Apr 24), ice ~Dec 1 → ~Apr 23, summer peak ~24 °C. I computed those day counts from `seasonalTemp()` in `src/config.js`; they are the sim's base curve, without weather.

Compiled 2026-10-19. It builds on and does not repeat `Maine lakes ponds and streams/recruitment_compensation_maturity.md` §3 (bluegill, largemouth and Oneida perch), `Predator winter energetics/predator_winter_energetics.md` (respiration sets, and young bullhead in Q5), `fetched_sources_digest.md` §9 (Dudley & Trial 2014), and `Predator winter energetics/esocid_first_year_survival.md`.

**Tags:**
- **[full text]**: I read the paper or thesis.
- **[abstract]**: from the publisher's abstract page only.
- **[via X]**: a number quoted in source X, which I read in full.
- **[search summary]**: a search-engine digest, not checked against the source.
- **[inf]**: my own derivation.

Lengths are total length (TL) unless marked FL (fork length).

No instructions aimed at the agent were found in any fetched page.

---

## 0. Key numbers

| Species | Where / how | Size effect | Numbers | Tag |
|---|---|---|---|---|
| Smallmouth bass | Spednic L., Maine (Shuter et al. 1980 model) | linear ramp in length; thresholds rise with winter days | WD 208 → C_min 48, C_max 92 mm; 1–41 % modelled loss; 36–49 % at measured 71–76 mm | [full text] (Dudley & Trial 2014) |
| Smallmouth bass | N. New Brunswick lakes, 3 winters | fish < 50 mm TL died under ice | survivors lost 22–54 % of AFDW | [abstract] Curry et al. 2005 |
| Smallmouth bass | MDIFW | YOY < ~56 mm (2.2 in) don't survive; ~200+ days below 50 °F | — | [full text] (existing notes) |
| Yellow perch | L. St. George, ON (Post & Evans 1989) | starvation model on L at start of winter + winter days | 154 ± 8 winter days; cohorts 60.7 ± 4.7 mm → 76 % die, 71.4 ± 4.1 mm → 42 % | [via Eckmann 2004] |
| Yellow perch | Post & Evans 1989 | fish reaching ~70 mm had low starvation mortality | — | [via Boussion 2025] |
| Yellow perch | 18 Great Lakes-basin lakes | size-selective in all | minimum ~60 mm to survive | [search summary] Fitzgerald 2000 |
| Yellow perch | L. Saint-Pierre, QC (otoliths) | ramp: 56.5-mm class SR 0.13; 63 → 0.53–0.57; ≥ 69.5 → ~1 | threshold 66–73 mm | [full text] Boussion 2025 |
| Yellow perch | lab, 2–4 °C, ~96 d (hatchery YOY) | larger lived longer | 37–55 % died in fresh/tap water; dead 3.3–3.8 % fat (dry), survivors 3.9–4.4 % | [full text] Toneys 1977 |
| Yellow perch | critical body fat | — | death at ~2.0–2.2 % fat of dry mass | [via Eckmann 2004; Thompson et al. 1991] Newsome & Leduc 1975 |
| Eurasian perch | L. Constance, 153 d | none (fish 91 ± 9 mm, fed all winter) | Post & Evans model → 0.6 % loss | [full text] Eckmann 2004 |
| White perch | lab, starved, 4.0 °C | PMORT = 7.29543·e^(0.02145·WD − 0.10804·FL) | 40.6 % dead at 180 d; fed fish 0 % | [abstract] Johnson & Evans 1990 |
| White perch | lab, starved, 2.5 °C | PMORT = 0.28054·e^(0.01862·WD − 0.03097·FL) | 68.4 % dead at 150 d | [abstract] Johnson & Evans 1990 |
| White perch | lab | days to 50 % death ∝ W^0.77 at 4.0 °C (starvation), W^0.29 at 2.5 °C (osmotic + starvation) | — | [abstract] Johnson & Evans 1996 |
| Pumpkinseed | lab, 4 °C, unfed, central Ontario | 30–37 mm outlived 20–24 mm; density shortened time to death | — | [abstract] Bernard & Fox 1997 |
| Bluegill | lab, 150 d, 4/9 °C, ± food | 20–30 mm: > 55 % died in every treatment, fed included | — | [abstract] Shoup & Wahl 2011 |
| Bluegill | Sunset L., WI (field) | 30–32-mm fish vanished; 33–39 mm thinned | fall 39.3 ± 4.9 → spring 43.3 ± 4.8 mm | [full text] Toneys 1977 |
| Largemouth bass | lab, 45 °N winter | small (< 100 mm) died more | survival 34.9 % (45 °N winter) vs 59–61 % (milder); fed 64.5 % vs starved 38.1 % | [abstract] Fullerton et al. 2000 |
| Colorado pikeminnow (cyprinid) | lab, 3–5 °C, 210 d | starved 30/36 mm: 3.3/6.7 % survived; fed: 95/98 %; 44 mm: 100 % either way | death at 3–6 % lipid of dry mass | [full text] Thompson et al. 1991 |
| Northern pike | L. Hestholm (DK); St. Lawrence telemetry | — | ~46 % Dec → Mar; 98–100 % of tagged 227–234-mm YOY still detected | [full text] (existing note); Walton-Rabideau et al. 2020 |

---

## 1. Yellow perch

### Post & Evans 1989, *CJFAS* 46:1958–1968 (lab, enclosure and field)

The full text is blocked (Canadian Science Publishing 403). I read the numbers below in two papers that cite it.

**From Eckmann 2004, *J. Fish Biol.* 65:1498–1511** [full text read; [PDF](https://kops.uni-konstanz.de/server/api/core/bitstreams/14e90056-fc51-4867-8d83-1fcc328a11c9/content)]
- "Overwinter mortality of yellow perch is clearly size-dependent, and mortality rates due to starvation can be predicted from initial body size and duration of the winter (Post & Evans 1989)."
- Post & Evans's model gives the probability of starvation death as a function of length at the start of winter and winter duration. Eckmann applied it to whole length distributions.
- **Lake St. George, Ontario** (~43°57′N [inf, garbled in the text], mean depth 5.7 m):
  - Winter was 154 ± 8 days of mean epilimnetic temperature below ~6 °C. The text has lost its symbol: "6 C".
  - Two cohorts started winter at **60.7 ± 4.7 mm** and **71.4 ± 4.1 mm**. Their cohort mortality was **76 %** and **42 %**.
- **Lake Constance:** a cohort of 91.0 ± 9.3 mm over 153 days gives **0.6 %** by the same model (1.2 % from January lengths).
- **Lough Neagh:** perch of 53–67 mm at the end of their first season would die faster than the St. George cohorts if they starved.

**From Boussion 2025** [full text read; [UQAC thesis](https://constellation.uqac.ca/10286/1/Boussion_Imanol_2025_m%C3%A9moire.pdf)]
- Post & Evans found that "Yellow Perch reaching 70 mm exhibited low winter mortality rates due to starvation."

**[inf] What the two St. George cohorts imply.**
- A straight-line ramp through them, at roughly the same winter length, runs from about **53 mm (all die)** to about **85 mm (none die)**, 31.5 mm wide. This treats each cohort's mean as representative, which is fine inside a linear ramp.
- That ramp predicts ~4 % for Lake Constance's 91 ± 9 mm fish, against the model's 0.6 %. The cohorts' winters differed by ±8 days, so this is only rough.
- It is a starvation-only bound: lab fish were unfed. Wild yellow perch keep feeding under ice.

### Boussion 2025 (UQAC MSc, Lake Saint-Pierre, Québec)

[full text]
- **Method:** autumn size was back-calculated from otoliths, comparing age-0 fish (YOY) with age-1 fish in spring (OYO).
- **Winter conditions:** the lake is often below 2 °C in winter. Perch need ≥ 13.5 °C to grow, which the lake does not reach from October to mid-May.
- **Table 3:** survival ratio (SR) by fall size-class index.
  - SR is the relative frequency of a class in age-1 fish ÷ in age-0 fish. It is relative to the cohort, not absolute survival.

  | Fall class index | 2020 cohort SR | 2021 cohort SR |
  |---|---|---|
  | 49.5 mm | 0 | — |
  | 56.5 mm | 0.13 | — |
  | 63.0 mm | 0.57 | 0.53 |
  | 69.5 mm | 1.47 | 0.96 |
  | 76.0 mm | 2.23 | 0.97 |
  | 81.5 mm | 4.21 | 1.58 |

- The author's threshold is "a pre-winter size between **66 and 73 mm**" above which survival probability is high.
- Selection was strong in the small 2020 cohort and absent in the large 2021 cohort.
- Mean YOY length in the lake fell from 85 mm (1980s) to 75 mm (early 2000s) to 65 mm (2019–20). Recruitment collapsed as the cohorts fell below the threshold (Magnan et al. 2022).

### Fitzgerald 2000 (Windsor PhD, 18 lake populations, 1958–1998)

[search summary of the abstract; the repository redirects]
- Overwinter survival was size-selective, "independent of lake size or predator community".
- Taken with Post & Evans: "a threshold of **60 mm** … minimum body length required for overwinter survival of the temperate winter in the Great Lakes basin."

### Irwin et al. 2009, *TAFS* 138:99–110 (Oneida Lake, > 40 years)

[[OUP](https://academic.oup.com/tafs/article/138/1/99/7888582); text partly read]
- The instantaneous winter mortality index (October 15 to early-May age-1 sampling) fell over the decades (N 38, R² 0.301).
- It was inversely related to October 15 total length (N 38, R² 0.382, P < 0.001).
- The lowest winter mortality was the 1995 cohort, the largest in autumn. The authors call this "delayed compensation".
- Index values and the regression equation are in a figure not rendered on the page.

### Toneys 1977 (UW–Stevens Point MSc; basis of Toneys & Coble 1979, 1980)

[full text, OCR; [MINDS@UW](https://minds.wisc.edu/handle/1793/79480)]
- **Design:** hatchery YOY perch (about 5 months old) held 9 days at 4 °C, then 86 days at 2 °C (96 days total). Food was assorted live invertebrates and brine shrimp, then discontinued.
- **Mortality:** 37.3 % in 90 % distilled water, 55.0 % in tap water, and 73–82 % in salt solutions.
- Survival time rose with length: survival days = −76.5 + 2.80·L in one solution. Correlations were weak to moderate, significant in 6 of 13 cases.
- **Fat (% of dry weight):** 6.50 ± 3.28 at the start. Dead fish had 3.3–3.8 %, survivors 3.9–4.4 %; the difference was significant in some solutions.
- Toneys cites Newsome & Leduc (1975): winter mortality of mature female perch at about **2.0 % fat**. Thompson et al. 1991 give **2.2 % of total dry weight** for the same source.
- Toneys concluded that salt intolerance, not minimum fat, caused most of these lab deaths.

### Counter-evidence: size-selection is not universal

- **Nebraska Sandhill lakes (Open Fish Sci. J. 6:58–70, 2013)** [search summary]: perch abundance was similar from fall to spring. Smaller fish died more in 1 of 8 instances; larger fish died more in 2.
- **Eurasian perch, central Europe:** no size-dependent winter mortality (Radke & Eckmann 1999). In Lake Constance the fish were large (91 mm) and fed at 40–80 m all winter. [via Eckmann 2004]

### Energy budget over winter (Eurasian perch, Lake Constance)

[Eckmann 2004, full text]

| Measure | Value |
|---|---|
| Fresh mass after 153 days | 85 % of November |
| Dry mass after 153 days | 73 % of November |
| Fresh-mass loss rate | ~0.1 % per day; 0.17 % per day in Nov–Jan, falling later |
| Lipid retained, 80 mm fish | 36 % of November |
| Lipid retained, 120 mm fish | 27 % of November |
| November lipid, % of dry mass | 0.07·LT + 9.88 (≈ 16 % at 90 mm) |
| April lipid, median | 6.5 % (1st percentile 4.4 %) |

- These fish fed through the winter.
- **Growth history matters as well as size** (Huss et al. 2008, *CJFAS* 65:2149–2156, Eurasian perch, 4 lakes × 3–6 years) [abstract]:
  - Within cohorts, winter survival rose with size.
  - Between cohorts, mean autumn size did not explain survival; late-season growth did. Fast growth late in the season shifts allocation to reserves.

---

## 2. White perch

### Johnson & Evans 1990, *TAFS* 119:301–313

[abstract; [OUP](https://academic.oup.com/tafs/article/119/2/301/7891805); DOI 10.1577/1548-8659(1990)119<0301:SWMOYW>2.3.CO;2]
- **Design:** lab YOY held at constant 2.5 °C and 4.0 °C, starved or fed ad libitum. Mortality depended on size, winter duration, temperature and food.
- **At 4.0 °C:** fed fish had **no** mortality; starved fish lost **40.6 % after 180 days**. The smallest fish died at high rates.
- **At 2.5 °C:** mortality reached **68.4 % after 150 days**.
- **Fitted models** (WD = winter days at that temperature, FL = fork length in mm, PMORT a proportion):
  - 4.0 °C: **PMORT = 7.29543·e^(0.02145·WD − 0.10804·FL)**
  - 2.5 °C: **PMORT = 0.28054·e^(0.01862·WD − 0.03097·FL)**
- **[inf] Checking the units.** Read as a proportion with FL in mm, the formulas reproduce the two reported mortalities at FL ≈ 62.5 mm (4 °C, 180 d) and 61.4 mm (2.5 °C, 150 d), a plausible mean size. Read as a percentage, the implied mean FL would be about 20 mm, which is implausible. Both formulas exceed 1 for small fish, so cap them at 1.
- **Context from the abstract:**
  - White perch reached Lake Ontario around 1946, during warm late-1940s summers and winters.
  - High white perch mortality occurred in Lake Ontario in very cold winters.
  - The cold Gaspé region likely blocks their spread.

**[inf] The 4.0 °C model at Hot Brook winter lengths:**

| WD (days) | FL all die | FL 50 % die | FL 10 % die |
|---|---|---|---|
| 120 | 42 mm | 49 mm | 64 mm |
| 161 (Hot Brook < 4 °C) | **50 mm** | **57 mm** | **72 mm** |
| 178 (< 6 °C) | 54 mm | 60 mm | 75 mm |
| 208 (< 10 °C) | 60 mm | 66 mm | 81 mm |

**[inf] The 2.5 °C model at WD 161:** p(FL 70) 0.64, p(80) 0.47, p(100) 0.25. It is far harsher, with a long tail into large fish.

### Johnson & Evans 1996, *TAFS* 125:466–471 (note)

[abstract; [OUP](https://academic.oup.com/tafs/article/125/3/466/7892672)]
- At 2.5 °C, fish used **less** energy, took up **more water**, and died far more than at 4.0 °C.
- Endurance time (days to 50 % death) scaled with body mass as **W^0.77 at 4.0 °C** and **W^0.29 at 2.5 °C**.
  - Theory predicts W^0.82 for starvation-limited endurance and W^0.18 for osmotic failure.
  - **Conclusion:** starvation drives death at 4 °C; osmoregulatory failure adds to it at 2.5 °C.

### Johnson & Evans 1991, *CJFAS* 48:672–680

Blocked. As cited by Eckmann 2004 [via]: yellow perch's routine metabolic rate is lower than white perch's, so their winter energy use, "and hence mortality rates", are much lower.

**[inf] For the sim:** white perch should have a **higher** size threshold per winter-day than yellow perch, and be sensitive to how cold the under-ice water is, not only to how long winter lasts.

---

## 3. Pumpkinseed and bluegill (*Lepomis*)

### Bernard & Fox 1997, *NAJFM* 17:581–590

This is the "NAJFM 17:581" paper of blocked row B04. [abstract; [OUP](https://academic.oup.com/najfm/article/17/2/581/7882375)]
- **Design:** YOY from a central Ontario pond, mid-November 1992. Size classes **20–24 mm** and **30–37 mm** TL, at 0.12–0.13 or 0.27–0.30 g/L, 4 °C, unfed.
- Larger fish lived significantly longer, and density significantly shortened time to death.
- Small fish moved more. Their lipid-loss rate was strongly and negatively related to size.
- Small fish had **higher** percent lipid at death, and higher weight-specific lipid before winter. So their earlier death reflects **metabolic allometry, not low lipid stores**.
- At high density fish were more active, lost lipid faster and died sooner.
- **Authors' conclusion:** below some size, age-0 fish are unlikely to survive a northern winter whatever their reserves; late sunfish progeny may fail; at high density late progeny may also lower survival of early, larger young.
- Times to death and percentages are in the paywalled text.

### Shoup & Wahl 2011, *TAFS* 140:1298–1304 (bluegill)

[abstract; [OUP](https://academic.oup.com/tafs/article-abstract/140/5/1298/7877534)]
- **Design:** 20–30 mm vs 50–60 mm TL; 4 vs 9 °C; food vs none; 150 days.
- Mortality was strongly size-selective and tied to condition, i.e. energy-limited.
- Fish were less active at 4 °C, which improved survival.
- Fed fish ate 2–4 % of body weight a day at 9 °C; at 4 °C, 1–2.5 % (small fish) and 0.4–0.8 % (large).
- **Small fish lost more than 55 % in every treatment, fed included.**
- Late-spawned small fish "are unlikely to survive long winters".

### Shoup & Wahl 2008, *TAFS* 137 (bluegill, Illinois ponds, 113 days)

[search summary; the PDF returned 403 to me]
- Size classes 20–30 and 40–65 mm.
- Large fish survived better in all ponds.
- Largemouth bass raised mortality by **16 %** (large) and **49 %** (small) over predator-free ponds.
- Condition rose in both treatments, so these deaths were predation, not starvation.

### Toneys 1977 / Toneys & Coble 1979 (*TAFS* 108:415–419)

[thesis full text; paper [abstract](https://academic.oup.com/tafs/article/108/4/415/7894768)]

**Field: 8 fall-vs-spring comparisons, Wisconsin**

| Population | Fall mean (mm) | Spring mean (mm) | Size-selective? |
|---|---|---|---|
| Sunset L. bluegill (n 411 / 309) | 39.3 ± 4.9 | 43.3 ± 4.8 | **yes**: 30–32 mm lost, 33–39 mm thinned |
| Thomas L. largemouth (n 97) | 52.7 ± 9.7 | 59.5 ± 10.7 | **yes** |
| Meyers L. bluegill (winterkill-prone) | 35.6 | 37.4 | no |
| Hatchery fathead minnow | 48.0 | 47.8 | no |
| Hatchery green sunfish | 37.9 | 39.2 | no |
| Hatchery white crappie | 49.2 | 49.7 | no; only ~84 of ~750 stocked survived |
| Hatchery bluegill < 30 mm | 25.0 | 25.9 | no |
| Hatchery largemouth (81 mm) | — | — | no |

- **Literature tally:** size-specific winter mortality appeared in **5 of 12** bluegill and largemouth studies and **5 of 8** walleye and sander studies.
- **Abstract's conclusion:** probably not common for bluegill and largemouth; may matter for walleye and sander.
- In the lab, larger fish tended to survive longer, and larger survivors had more fat and less water.

### Other pumpkinseed evidence

- **Garvey, Herra & Leggett 2002**, *Ecol. Appl.* 12:194–205 (Lake Opinicon bluegill and pumpkinseed, May 1998–May 1999) [QUBS summary]:
  - Most autumn juveniles came from larvae that hatched **after** mid-June. Early larvae died heavily.
  - Larval survival was often highest above 23.5 °C.
- **Cargnelli & Gross 1996**, *CJFAS* 53:360–367 (bluegill, Lake Opinicon): links yearling size and survival to birth date. I did not get the numbers; the PDF has moved.
- **Lake Ontario constructed embayments** (AFS 2011 abstract) [search summary]:
  - In a cool embayment, small mature pumpkinseed (57–79 mm) spawned late, and their young could not grow big enough to survive winter.
  - In a warm year, large fish (75–149 mm) spawned in early June.
- **Iberian vs Canadian pumpkinseed** (*Aquatic Sciences* 2014, doi 10.1007/s00027-014-0349-4) [search summary]: Canadian juveniles lost 12–20 % of lipid in the first half of winter; Iberian juveniles lost 49 % and died earlier. Northern populations are adapted to winter.
- **Winterkill ponds** (Fox & Keast) [QUBS summary]: pumpkinseed matured 1–2 years earlier and > 20 mm smaller. This is a life-history response to winter mortality.
- **Michigan ponds, age-0 bluegill stocked at 1.1 in (~28 mm)** (Schneider & Breck 1997, existing note): 10 % overwinter loss without predators; 39 % with any predator; 55 % with walleye.

**[inf] Pumpkinseed threshold.** Wisconsin bluegill lost everything at 30–32 mm. Pumpkinseed are more northern and cold-hardy, and Ontario YOY reach ~25–45 mm by fall (age-1 fish are 33–52 mm TL in Ontario, `species.js`). That points to a ramp of roughly **25 → 42 mm** for a Maine winter.

---

## 4. Chain pickerel / northern pike, white sucker, brown bullhead, cyprinids and killifish

**Esocids.** No chain pickerel first-winter data exist (`esocid_first_year_survival.md`).
- Maine YOY pickerel reach **10–13 cm** by fall (MDIFW).
- Pike are larger still: 227–234 mm TL in the St. Lawrence in fall. 98–100 % of tagged age-0 pike and muskellunge were detected on several receivers through fall and winter, "indicating high survival" (Walton-Rabideau et al. 2020, *Ecol. Freshw. Fish* 29:346–363, doi 10.1111/eff.12519) [full text]. Detection is not proof of survival.
- Lake Hestholm (DK): ~46 % survival December → March. Tiger muskellunge: 0 % with < 1 % vegetation, 13–20 % with 20–35 %, herons the main cause [existing note].
- **[inf]** Esocid YOY are far above any starvation threshold, and pickerel feed under ice (Maine ice fishery). Their first winter is lost to predation and cannibalism, not starvation. A starvation ramp should matter only for late or stunted fish under ~6–7 cm.
- The existing target is overwinter survival of **0.6–0.8** for 10–13-cm pickerel (`pickerel_population_dynamics.md`).

**White sucker.** No first-winter study was found (searches for *Catostomus* YOY overwinter returned nothing).
- **[inf]** Suckers live to the Arctic, so their YOY should tolerate winter well. Any size ramp is a placeholder.

**Brown bullhead.** No YOY overwinter survival data were found, here or in `predator_winter_energetics.md` Q5.
- YOY reach ~55–70 mm by October in Cayuga Lake.
- They bury and fast in winter, with metabolic Q10 ≈ 2–3 (Crawshaw).
- The existing note expects losses concentrated below ~40–45 mm, by analogy with smallmouth.
- Toneys's lab channel catfish: 0–80 % mortality at 2–4 °C, mostly fungal (87.5 % of the dead in tap water carried fungus). Not a size signal.

**Cyprinids and killifish** (golden shiner, fallfish, blacknose dace, banded killifish). No species-specific first-winter size data were found.
- **Colorado pikeminnow** (Thompson et al. 1991, *TAFS* 120:346–353) [full text; [PDF](https://www.grandcanyontrust.org/sites/default/files/resources/gc_Squawfish_Lipids_Research.pdf)]:
  - Starved 30 mm and 36 mm fish: **3.3 %** and **6.7 %** survived 210 days at 3–5 °C. Fed fish of the same sizes: **95.1 %** and **98.4 %**.
  - 44 mm fish: **100 %** whether fed or starved.
  - Dying fish held **3–6 % lipid of dry mass**. Lipid % = 220.89 − 2.54·(% body water).
  - The fish fed actively at 4 °C.
- **Roach, Lough Neagh** (Griffiths & Kirkwood 1995, *J. Fish Biol.* 47:537–554) [abstract]:
  - Small winter length gains after poor summers came, in roach, from size-selective mortality.
  - Dead roach late in winter 1992/93 had less fat than live ones.
- **Fathead minnow:** no size-selective loss in a hatchery pond (Toneys, 48-mm fish).
- **[inf]** Small-bodied species survive winter at small adult sizes: dace at age I are only 49–50 mm, and banded killifish YOY are 49.5 mm by mid-October at Lake Opinicon. Their thresholds must therefore sit well below the centrarchids' and percids' in absolute mm. Scale them to the species' own YOY size (§ 7).

---

## 5. The models: Shuter et al. 1980 (smallmouth) and Shuter & Post 1990 (general)

### Shuter, MacLean, Fry & Regier 1980, *TAFS* 109:1–34

[abstract; [OUP](https://academic.oup.com/tafs/article/109/1/1/7894915); DOI 10.1577/1548-8659(1980)109<1:SSOTEO>2.0.CO;2]
- **Two critical stages:** the nest, killed by extreme temperatures; and the first winter, lived on stored energy.
- "Large fish withstand winter starvation better than small fish because the ratio of stored energy to basal metabolic rate increases with size."
- The model predicted the observed northern range limit.

**The equations, as applied by Dudley & Trial 2014** (USGS SIR 2014-5164) [full text, in repo]
- WD = days from the autumn day below 10 °C to the spring day ≥ 10 °C.
- **C_max = 0.3375·WD + 22.083** and **C_min = 0.1938·WD + 7.917** (mm).
- **p = 0 if L > C_max; 1 if L < C_min; else (C_max − L)/(C_max − C_min).**
- L is the length at the end of the growing season: 9.1 mm at swim-up plus the sum of daily growth increments.
- **[inf]** p is monotone non-decreasing in WD for every L, so it can be spread over the winter as a daily hazard (§ 7).
- **[inf] Effective winter-length elasticity** at WD 208: d ln C/d ln WD ≈ 0.76 for C_max and 0.84 for C_min.

**Lab basis: Oliver, Holeton & Chua 1979, *TAFS* 108:130–136** [abstract; [OUP](https://academic.oup.com/tafs/article/108/2/130/7894631)]
- Hatchery YOY of 55–107 mm TL, wintered September 1975 → May 1976 at final temperatures of 2, 4 and 6 °C.
- Final temperature did not noticeably change mortality.
- Longer fish survived better.
- Dry/wet weight, lipid/dry weight and ignitable/dry weight all declined. Critical dry/wet and ignitable/dry percentages below which fish die are suggested; the values are in the paywalled text.

**Mechanistic form in DeAngelis, Shuter, Ridgway & Scheffer 1993, *TAFS* 122:927–941, appendix** [full text, OCR; [PDF](https://www.harkness.ca/PDFs/Contributions%201990s/deangelis%20et%20al%201993.pdf)]

As printed. The OCR is imperfect and the unit reading is mine.
- **Respiration** (g wet per day) = c^T·a·L^b / ratio:
  - c = 1.0806 per °C below 10 °C (Q10 ≈ 2.17; Shuter 1989's starvation Q10 was 2.2), 1.1048 above;
  - a = 0.32×10⁻⁶ below 10 °C, 0.36×10⁻⁶ above;
  - b = 1.929, with L in mm;
  - ratio (dry/wet) = 0.1363·L^0.0499 for L < 51 mm, and 0.165 above.
- **Starvation threshold:** AFDW_S = 4.07×10⁻⁷·L^3.21. The printed unit is mg; at 60 mm that gives 0.21, which only makes sense in **grams**.
- **Summer mortalities in the same model:** size-dependent 0.2·e^(−0.04·L) per day, plus 0.0002 per day size-independent.

**[inf] Cross-check against Hot Brook's winter.** I integrated the respiration over the 208 days below 10 °C of the sim's curve, starting from AFDW = wet mass (Maine W–L, `species.js`) × 0.165 × (1 − 10–15 % ash).
- The threshold is ~61–65 % of autumn AFDW, so a fish dies after losing ~35–39 %. Curry et al. 2005's survivors lost 22–54 %.
- The deterministic critical length came out **~87–103 mm**, bracketing Shuter's C_max of 92.
- The same reading under-predicts Shuter et al. 1989's 17 °C starvation endurance (14 mm: 8 days; 62 mm: 45 days) about twofold.
- Treat it as an order-of-magnitude mechanism, not as parameters to copy.

### Shuter & Post 1990, *TAFS* 119:314–336 (general model)

[abstract only; [OUP](https://academic.oup.com/tafs/article/119/2/314/7891812); DOI 10.1577/1548-8659(1990)119<0314:CPVATZ>2.3.CO;2]
- **Abstract:**
  - Warm- and coolwater fish can be strongly limited in feeding through long cold winters.
  - Small fish are hit harder: their weight-specific metabolism rises as size falls, but their capacity to store energy does not rise to match. So starvation endurance falls with size, as lab studies show.
  - Wild populations need enough first-year growth to survive, which gets harder northward: shorter growing seasons and longer starvation periods.
  - This alone can explain the northern limits of yellow perch (central and western North America), Eurasian perch and smallmouth bass (central North America). Warming would let yellow perch and smallmouth thrive well north of today's ranges.
- A search digest says the paper reduces its starvation model to "two straight lines that link body size, mortality and starvation time" [search summary, unverified]. That matches Shuter 1980's C_min/C_max lines.
- **Per-species parameters were not retrieved** (OUP paywall; ResearchGate 403).
- **[inf] Endurance scaling:**
  - Johnson & Evans 1996 give a theoretical starvation endurance ∝ W^0.82 and measured W^0.77 (white perch, 4 °C).
  - With W ∝ L^~3.1–3.2, endurance ∝ L^~2.4, so a pure constant-temperature starvation model gives a minimum length L* ∝ WD^~0.4.
  - Shuter's field-calibrated lines respond more strongly (elasticity ~0.8). Prefer the field form.

---

## 6. Starvation, predation or both, and typical survival

**Both. Which one dominates depends on latitude, winter length and food.**

**Energy depletion dominates in long, cold northern winters, especially for unfed fish:**
- smallmouth bass (Shuter 1980; Curry 2005: < 50 mm died under ice; survivors −22–54 % AFDW);
- yellow perch (Post & Evans 1989);
- white perch at 4 °C;
- Colorado pikeminnow, pumpkinseed and bluegill in the lab.

**Osmoregulatory failure in very cold water (~2–2.5 °C):**
- white perch: Johnson & Evans 1996;
- white crappie: a severe-winter treatment gave 47 % survival with dead and live fish of similar energy density [search summary];
- salt-sensitive species (Toneys).

**Predation is the size-selective agent in milder, mid-latitude winters and in ponds with food:**
- **Garvey, Wright & Stein 1998** (Ohio): rations of 0–1.5× maintenance did not change survival; small fish died at high rates only with predators.
- **Garvey, Ostrand & Wahl 2004**, *Ecology* 85(10), doi 10.1890/03-0329 [abstract; [SIU](https://opensiuc.lib.siu.edu/fiaq_pubs/11)], 38 °N ponds:
  - Fish gained mass and energy without predators and held steady with them.
  - Mortality never depended on size but was about **20 % higher** with predators.
  - Their model: small size reduces survival only when ration and fall fat are both low; size-selective predators always cut small-fish survival.
- **Shoup & Wahl 2008:** predators added 16 % mortality to large bluegill and 49 % to small.

**Winter feeding changes the outcome:**
- Fed white perch at 4 °C: 0 % died. Starved: 41 %.
- Fed vs starved largemouth: 64.5 % vs 38.1 % survived.
- Fed pikeminnow at 30–36 mm: 95–98 % vs 3–7 % survived.
- Eurasian perch fed under ice in Lake Constance and showed no size selection.
- Yellow perch, pickerel and pumpkinseed feed under ice in Maine. Smallmouth and bullhead mostly do not (smallmouth feed lethargically and eat ~nothing at 7.1 °C, Oliver 1977 [via Thompson et al. 1991]).

**Density effects make it compensatory:**
- Bernard & Fox 1997: crowding raised activity and lipid loss and shortened time to death.
- Crowded cohorts also grow less, so enter winter smaller (Irwin 2009, Boussion 2025).
- Late-hatched cohorts enter winter small (Cargnelli & Gross 1996; Garvey 2002; the embayment pumpkinseed).

**Typical first-winter survival of age-0 fish in northern waters**

| Case | Survival over first winter |
|---|---|
| Smallmouth, Spednic (model) | 59–99 % (early vs late spawners); ~51–64 % at the measured 71–76 mm |
| Largemouth, lab, 45 °N winter | 35 % (fed 65 %, starved 38 %, all latitudes) |
| Bluegill, Michigan ponds | 90 % (no predators), 61 % (predators), 45 % (walleye, range 11–75 %) |
| Yellow perch, L. St. George (model) | 24 % and 58 % for two cohorts |
| Eurasian perch, L. Constance | ~99 % |
| White perch, lab, starved | 59 % (4 °C, 180 d); 32 % (2.5 °C, 150 d) |
| Pike, L. Hestholm | ~46 % (Dec → Mar) |
| Walleye fingerlings, Minnesota ponds without predators (1987 cohort) | 66–83 % (Bandow & Anderson 1993, MN DNR Inv. Rep. 425 [full text]) |
| White crappie, hatchery pond | ~11 % (84 of ~750) |
| Rainbow trout, BC experimental lakes | ~10–40 % (Biro, Post & Beckmann 2021, *CJFAS* 78:738 [abstract]) |

**[inf] Summary.** With predators present, **~30–70 %** of a northern cohort typically survives its first winter. Survival swings from near 0 to near 100 % with autumn size relative to the species' threshold and with winter length. That swing is the main year-class signal for smallmouth in Maine (MDIFW; Dudley & Trial).

---

## 7. Implications for the simulation

### What the sim does now

`FRY.M_JUV_Q10` = 3 slows the juvenile rate under ice to ~0.005 per day, about 40–50 % lost over a first winter. It is the same for every size and species. FB4 starvation can also kill a school whose energy runs out. Neither gives the documented **step-like dependence on autumn length relative to a winter-length-dependent threshold**, which is the compensatory brake:
- Crowded or late cohorts are small, enter winter below threshold, and die.
- Sparse or early cohorts are large and survive.

### Recommended rule: Shuter's ramp per species, spread over the winter

1. **Count winter days.** For every age-0 school (and every age-0 agent), count w = days since the autumn crossing below 10 °C, using the physiological day `BIOE.DAY`. Use the water the fish is in (`tempAt`), or the lake surface as in Shuter. Stop counting at the spring crossing ≥ 10 °C. Then WD emerges from the sim's own weather.
2. **Freeze the length.** Set L to the school's length at the autumn crossing. There is no growth below ~10–13.5 °C anyway.
3. **Compute the cumulative loss** p(L, w) = clamp((C_max(w) − L)/(C_max(w) − C_min(w)), 0, 1), with:
   - C_min,s(w) = k_min,s·(0.1938·w + 7.917)
   - C_max,s(w) = k_max,s·(0.3375·w + 22.083)

   The bass lines are scaled by species factors k.
4. **Apply a daily hazard** h_w = (p(L,w) − p(L,w−1)) / (1 − p(L,w−1)). Kill n·h_w of a school's n fish each day (Bernoulli for an agent).
   - Deaths then fall in late winter, as fish run out of reserves, not all at once.
   - An early spring stops them.
   - [inf] Checked: the daily product equals 1 − p (bass, 70 mm: 0.494 both ways).
5. **Avoid double counting.** Turn off FB4 starvation death for age-0 fish while the counter runs, or keep it only as a floor. Lower the under-ice background (`M_JUV` × Q10) so that background plus ramp hits the targets below. Roughly 10–25 % background predation under ice is consistent with Garvey 2004 (+20 % with predators) and Shoup & Wahl 2008.
6. **Optional size-weighting of predation.** Small fish die more to predators in winter (Shoup & Wahl 2008; Garvey et al. 1998). `M_JUV_B` > 0 (Lorenzen) already does this year-round.

### Parameters at Hot Brook's WD = 208 (the k factors scale both lines with w)

| Species (sim key) | k_min | k_max | C_min–C_max at WD 208 | Typical Maine YOY autumn L | Expected loss at typical L | Confidence |
|---|---|---|---|---|---|---|
| Smallmouth bass (`bass`) | 1.00 | 1.00 | **48–92 mm** | 56–76 mm (MDIFW; Spednic 71–76) | 62–82 % at 56–65 mm; ~39 % at 75 | **High**: published, eastern-Maine-validated; L is a temperature-only model length; Curry 2005 (< 50 mm die) and MDIFW (< 56 mm die) agree |
| Yellow perch (`perch`) | 1.04 | 0.87 | **50–80 mm** | ~55–75 mm [inf] (productive lakes 66–81) | 18–84 %; ~50 % at 65 mm | **Moderate on the location** (60–73 mm: Fitzgerald, Boussion, Post & Evans "70 mm"); **low on the width** (St. George starvation-only fit 53–85 at a shorter winter; Boussion's field ramp ~55–70). Perch feed under ice: lean narrow/low if the sim's perch winter-feed |
| White perch (`whiteperch`) | — | — | use J&E 1990 directly: p = min(1, 7.29543·e^(0.02145·WD₄ − 0.10804·FL)), WD₄ = days < 4 °C (161), FL ≈ TL/1.06 [inf conversion] | ~45–70 mm [no Maine data found] | 100 % < FL 50, 50 % at FL 57, 10 % at FL 72 (WD₄ 161) | **Moderate for the form** (lab, starved, 4 °C), **low for the field level**: fed fish had 0 %. The 2.5 °C model is far harsher; use it only if under-ice water at the fish is < 3 °C |
| Pumpkinseed (`sunfish`), redbreast | 0.52 | 0.455 | **25–42 mm** (redbreast: ×1.1) [inf] | ~25–45 mm | ~70 % at 30 mm, ~40 % at 35, ~10 % at 40 | **Low**: Bernard & Fox and Shoup & Wahl give direction and 20–30-mm vulnerability; Sunset L. bluegill lost 30–32 mm. No published pumpkinseed threshold |
| Chain pickerel (`pike` key) | 0.83 | 0.76 | 40–70 mm [inf] | 100–130 mm | ~0 % (a late-runt filter only) + flat winter loss so total survival ≈ 0.6–0.8 | **Low** for the ramp (no esocid starvation data); **moderate** that starvation is irrelevant at normal sizes |
| White sucker (`sucker`) | 0.73 | 0.65 | 35–60 mm [inf] | unknown (~50–80) | — | **Very low**: placeholder from the generic rule below |
| Brown bullhead (`catfish`) | 0.73 | 0.60 | 35–55 mm [inf] | 55–70 mm (Cayuga) | ~0–5 % | **Very low**: matches the existing note's "losses below ~40–45 mm"; bullhead should be the most winter-tolerant |
| Fallfish, blacknose dace, banded killifish, golden shiner | generic | generic | ~0.72·L̄ to ~1.3·L̄ | dace ~25 mm, killifish ~50, fallfish ~30–60 (guess) | ~30–40 % at L̄ | **Very low**: generic rule; no species data |

**[inf] Generic rule for data-poor species.** For bass, perch and pumpkinseed, the thresholds at the reference winter sit at about **0.72–0.77 × and 1.2–1.4 ×** the species' typical autumn YOY length in a normal northern year. Only the bass pair is published; the perch and pumpkinseed pairs are my picks, so this ratio is partly circular. A typical-size cohort therefore loses ~30–50 %, and the loss swings strongly with ±10–20 % autumn size.
- Set C_min = 0.72·L̄_YOY and C_max = 1.3·L̄_YOY at WD 208, scaled with w like the bass lines.
- This is a calibration device, not a mechanism. Validate it with the young-of-year fate audit (`fryfate`).

### Calibration targets (first winter, age-0 → age-1, predators present)

| Target | Value |
|---|---|
| Smallmouth, typical Maine summer | ~40–60 % die |
| Smallmouth, cool summer (autumn L ≤ 60 mm) | ≥ 70 % die; near-failure of the year class (MDIFW 1986, 1992, 1996) |
| Yellow perch, typical | 30–60 % die; crowded small cohorts (≤ 60 mm) ≥ 70 % |
| Pumpkinseed, early cohorts | 10–40 % die |
| Pumpkinseed, late runts (< 30 mm) | ≥ 60 % die |
| Pickerel | 20–40 % die, little size dependence |
| Bullhead | lowest loss of any species |
| Winter length ±15 days | moves bass thresholds by ±3 mm (C_min) and ±5 mm (C_max); +14 days adds ~8 points of loss at mid-ramp lengths (70-mm bass: 51 → 59 %) |

**Whole-system checks:**
- Year-class strength should correlate with summer degree-days through autumn length.
- Recruits per spawner should rise when spawners are few, because sparse cohorts grow larger. That is the compensation the multi-year runs lack.
- Judge with ≥ 3 seeds and the young-of-year fate audit (CLAUDE.md).

### Mechanistic alternative (later)

Track an energy-reserve state per school: reserve = AFDW, or lipid as % of dry mass. Kill when it falls below a length-dependent floor:
- smallmouth: AFDW_S = 4.07×10⁻⁷·L^3.21 g (DeAngelis/Shuter; dies after losing ~35–40 % of autumn AFDW);
- yellow perch: ~2.0–2.2 % fat of dry mass (Newsome & Leduc);
- cyprinids: 3–6 % lipid of dry mass (Thompson et al.).

Then winter feeding, density-raised activity (Bernard & Fox) and late-season reserve allocation (Huss et al. 2008) emerge. This needs the FB4 winter respiration fixed first (`predator_winter_energetics.md`). Use the ramp until then, and keep it as the target the mechanism must reproduce.

---

## 8. Blocked sources ("to fetch")

| Source | Link / route | Blocked by | What it would settle |
|---|---|---|---|
| Post & Evans 1989, *CJFAS* 46:1958–1968 | cdnsciencepub.com (DOI not confirmed) | CSP 403 | The perch starvation model's equation and parameters (L at start of winter × WD); lab survival by size |
| Shuter & Post 1990, *TAFS* 119:314–336 | [OUP](https://academic.oup.com/tafs/article/119/2/314/7891812) | paywall; ResearchGate 403 | Per-species endurance allometry and minimum size vs winter length (yellow perch, Eurasian perch, smallmouth) |
| Johnson & Evans 1990, *TAFS* 119:301–313 (row A07) | [OUP](https://academic.oup.com/tafs/article/119/2/301/7891805) | paywall | FL range tested; fit statistics; the field/climate application |
| Johnson & Evans 1991, *CJFAS* 48:672–680 (row A06) | CSP | 403 | White vs yellow perch winter metabolism and mortality, per size |
| Johnson & Evans 1996, *TAFS* 125:466–471 | [OUP](https://academic.oup.com/tafs/article/125/3/466/7892672) | paywall | Endurance-time equations at 2.5 and 4.0 °C |
| Shuter, Ihssen, Wales & Snucins 1989, *J. Fish Biol.* 35:765–780 (row A10) | Wiley | 403 | Smallmouth starvation endurance by size, temperature, pH and hardness |
| Oliver, Holeton & Chua 1979, *TAFS* 108:130–136 | [OUP](https://academic.oup.com/tafs/article/108/2/130/7894631) | paywall | Critical dry/wet and ignitable/dry ratios at death; mortality by size |
| Bernard & Fox 1997, *NAJFM* 17:581–590 (row B04) | [OUP](https://academic.oup.com/najfm/article/17/2/581/7882375) | paywall | Pumpkinseed days-to-death by size and density at 4 °C |
| Cargnelli & Gross 1996, *CJFAS* 53:360–367 (row C43) | old U. Toronto lab PDF (now redirects) | moved | Bluegill survival to age 1 by birth date and size |
| Curry, Currie, Arndt & Bielak 2005, *Env. Biol. Fishes*, doi 10.1007/s10641-004-6582-2 | Springer | login redirect | New Brunswick smallmouth: in-lake cage survival by size and temperature (nearest to Maine) |
| Currie MSc thesis (UNB, late 1990s) | UNB library | not online | Same New Brunswick work in full |
| Fitzgerald 2000, U. Windsor PhD (etd 1485) | scholar.uwindsor.ca | redirect to home page | 18-lake perch winter survival; the 60-mm threshold's basis |
| Huss et al. 2008, *CJFAS* 65:2149–2156 | CSP | 403 | Eurasian perch reserve thresholds and late-season allocation |
| Garvey, Ostrand & Wahl 2004, *Ecology* 85 | [SIU PDF](https://opensiuc.lib.siu.edu/cgi/viewcontent.cgi?article=1009&context=fiaq_pubs) | 403 | The model's ration × fat × predation survival surface |
| Shoup & Wahl 2008, *TAFS* 137 | OSU-hosted PDF | 403 to me | Bluegill pond survival by size class with and without bass |
| Hurst 2007, *J. Fish Biol.* 71:315–345 | Wiley | not tried (paywall) | The standard review of winter mortality causes |
| Sogard 1997, *Bull. Mar. Sci.* 60:1129–1157 | — | no open copy | Review tally of size-selective overwinter mortality |
| Irwin 2006, Cornell PhD | eCommons | 405 | Oneida winter mortality index values vs October length |
| Fitzgerald et al. 2006, *Ecol. Appl.* (Oneida age-0 yellow and white perch winter mortality, gizzard shad) | — | not located; title recalled, unverified | White perch field winter mortality vs size |
| Pumpkinseed, *Aquatic Sciences* 2014 (doi 10.1007/s00027-014-0349-4); *Env. Biol. Fishes* 2026 (s10641-026-01836-6) | Springer | login redirect | Pumpkinseed winter lipid loss and the Shield-lake threshold |
| Toneys & Coble 1980, *CJFAS* 37:225–232 | CSP | not tried | The lab half of Toneys 1977, in print |
