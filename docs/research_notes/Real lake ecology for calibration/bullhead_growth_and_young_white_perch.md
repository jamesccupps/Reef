# Brown bullhead growth, and the size of young-of-year white perch (Hot Brook calibration)

Compiled 2026-10-20. Two calibration questions:
- **Q1.** In the sim, adult bullheads barely grow (+0.04–0.25 cm a season), so recruits never mature.
- **Q2.** How big should young-of-year (YOY) white perch be by late September and at ice-on?

The lakes: shallow (3.9–5.5 m), unstratified and moderately coloured. On the sim's calendar (`SEASON.TEMP_KNOTS`) water is above 15 °C on 126 days and above 20 °C on 86, giving 1,458 degree-days > 10 °C and 751 > 15 °C [derived].

**Not repeated here** (already in the repo):
- the FB4 bullhead row and its reading (`../Maine lakes ponds and streams/sucker_shiner_bullhead_trout_parameters.md` §1);
- Rubec 1975 and Moe Pond (`../Whole lake 3D fish simulation/size_structure_whiteperch_sucker_bullhead.md` §3);
- YOY bullhead winter energetics and Raney & Webster 1940 (`../Predator winter energetics/predator_winter_energetics.md` Q5);
- Johnson & Evans 1990 and 1991, and Fitzgerald 2006 (`first_winter_mortality.md`, `gemini_white_perch_checked.md`);
- Cooper 1941's adult growth (`../fetched_sources_digest.md` §6).

**Tags.**
- Source: [FT] full text read; [ABS] abstract only; [SEC] search-engine digest only; [via] quoted in another source; [derived] my arithmetic; [inf] my inference.
- Region: **[ME]** Maine; **[NE]** rest of New England, NY, Ontario, Québec, Maritimes; **[MW]** Midwest / Great Lakes; **[S]** south or estuary; **[lab]** laboratory.
- Lengths are total length (TL) unless marked FL (fork) or SL (standard). Quotes are under 15 words.

---

## Takeaway

**Q1, bullhead.** Hartman's FB4 set is entered correctly; the problem is the set itself on a Maine calendar.
- **Its scope for growth is narrow, and narrowest for small fish.**
  - Just keeping a 5–100-g bullhead alive takes **0.35–0.56 of Cmax** at 18–24 °C [derived].
  - A 5-g yellow perch on its FB4 set needs only 0.25–0.32 [derived].
  - Bullhead Cmax scales as W^−0.225 but respiration as W^−0.271, so small fish have the least spare capacity.
- **What that does on Hot Brook's calendar** [derived; the sim's own `bioenergetics.js`]:
  - a 6.5-cm yearling needs **p ≈ 1.1–1.2** (more than its maximum ration) to reach 19 cm by its fourth autumn;
  - at p 0.7 it is still only 9–12 cm after six years.
- **Real northern bullheads grow much faster.**
  - YOY are 57–68 mm by late September–October (New York) [NE].
  - At 15–25 cm they add **~2.5–4.8 cm a year**: Ottawa River, Ontario [NE]; Little Lake Butte des Morts, Wisconsin, "no stunting" [MW].
- **Field context.** Lake Opinicon bullheads grow at their lab potential (Keast 1985); food is not limiting there.
- **Fix, in order of evidence:**
  1. Run bullheads under **30 g (≈ 13 cm)** on the existing juvenile stand-in, `juvW` (as smallmouth already do), instead of first-year only.
  2. Lower **ED from 6,700 to ~5,000 J/g.** 6,700 is a fat-catfish value; wild ictalurid tissue is leaner.
  3. Optionally, shift the cool limb (**CQ 15 → 12**). The evidence for this is weak.
- **Ration needed for the Hot Brook growth target:**
  - 1 + 2 together: p ≈ 0.83;
  - all three: p ≈ 0.73;
  - unchanged: p ≈ 1.2.
- **The sim must also deliver the food.** At a realised p ≈ 0.6, no parameter set here grows a bullhead past ~14–20 cm.

**Q2, young white perch.** No Maine measurement of YOY size exists in any source reached.
- **Target, built from the bracketing evidence:**
  - by late September, a mean of **~50–65 mm TL** (central ~57 mm);
  - at ice-on (~1 December), **~52–68 mm** (central ~60 mm);
  - individual fish ~35–80 mm, because spawning is spread out.
- **Little growth after late September.** The water falls below 16 °C about 25 September and below 15 °C about 28 September; adult scale growth in Maine ends early to mid September (Cooper 1941).
- **Diet.**
  - Zooplankton (copepods, and *Daphnia* where abundant) is the main food.
  - From ~30–40 mm, chironomid larvae and ostracods are added.
  - Where *Daphnia* is scarce the young eat mostly benthos and grow more slowly (Oneida Lake, NY).
- **Consequence for the first winter.** At these sizes, about half of a cohort sits under the Johnson & Evans starvation threshold (~60 mm TL at 4 °C over 161 days). A heavy first-winter loss is the expected regime, not a bug.

---

## Q1. Brown bullhead growth

### (a) Hartman et al. 2017, the FB4 brown bullhead model

**The paper.** Hartman, K. J. 2017. Bioenergetics of brown bullhead in a changing climate. *TAFS* 146(4):634–644, doi 10.1080/00028487.2017.1293563 [ABS: [OUP](https://academic.oup.com/tafs/article-abstract/146/4/634/7819732)].
- **Validation.** In the lab, at two temperatures and two rations, observed and predicted values agreed "within 4%". The abstract does not give the temperatures, rations or fish sizes.
- **Application.** With water 4 °C warmer, growth rose in the north of the range and fell (to extirpation) in the south.
- **Access.** No open copy exists. [Semantic Scholar](https://api.semanticscholar.org/graph/v1/paper/DOI:10.1080/00028487.2017.1293563?fields=title,openAccessPdf) shows "CLOSED". FB4 cites it as "Hartman et al. 2017", but the TAFS paper has Hartman as sole author.

**Where the data come from.**
- **AFS 2011 poster P-197** (Porto, Hartman et al.) [SEC; the afs.confex.com host failed DNS again]:
  - consumption, metabolism and growth measured on fish of **2.5–130.7 g**;
  - at **10, 15, 20, 25 and 30 °C**;
  - maximum consumption and growth peaked at **20–25 °C**.
- **AFS 2015 talk** (Hartman) [SEC]:
  - lab consumption and metabolism data, validated by independent lab experiments;
  - applied to lower Great Lakes populations for PAH exposure.
- **So the cool limb is measured, not extrapolated.** It is fit to lab fish at 10 and 15 °C. The fish's origin is not stated; a West Virginia stock is likely [inf].

**FB4's table entry.** [FT: [Parameters_official.csv](https://raw.githubusercontent.com/jim-breck/FB4/master/Parameters_official.csv), Brown Bullhead row, life stage "juvenile and adult", Notes empty]
- Consumption: CEQ 3, CA 0.12, CB −0.225, CQ 15, CTO 24, CTM 26, CTL 30, CK1 0.473, CK4 0.55.
- Respiration: REQ 1, RA 0.0007, RB −0.271, RQ 0.0915, RTO 0.4055, RTM 0, RTL 0, RK1 1, RK4 0, RK5 0, ACT 1, BACT 0, SDA 0.172.
- Waste: EGEQ 1, FA 0.2; EXEQ 1, UA 0.07.
- Energy density: PREDEDEQ 1, **ED 6700 J/g**, constant.
- **These match `species.js` exactly.**

**What the curve means** [derived, with the sim's `bioenergetics.js`]:
- **Consumption by temperature, as a fraction of peak:** 6 °C 0.016, 8 °C 0.038, 10 °C 0.089, 12 °C 0.191, 15 °C 0.473, 18 °C 0.773, 20 °C 0.892, 24 °C 0.977.
- **Activity.** It is a constant ×1.5 (e^0.4055).
- **Respiration check.** A 128-g fish at 20 °C respires 73 mg O₂ kg⁻¹ h⁻¹.
- **Growth check at full ration** (128 g, 20 °C, prey 3,300 J/g): 0.72 %/day.
  - Pellet-fed cultured brown bullheads (initial 126–133 g; 20.0 ± 0.43 °C; Poland) grew **0.41–0.65 %/day**, final 172–198 g [FT: [*Sci. Rep.* 2020, PMC6981201](https://pmc.ncbi.nlm.nih.gov/articles/PMC6981201/), Table 2] [lab].
  - So at mid-size and 20 °C the set's maximum is realistic; the problem is elsewhere.

**Maintenance ration** (p at zero growth, prey 3,000 J/g; FB4 waste) [derived]:

| W (g) / TL (cm) | 10 °C | 12 °C | 15 °C | 18 °C | 20 °C | 22 °C | 24 °C |
|---|---|---|---|---|---|---|---|
| 5 / 7.2 | 1.71 | 0.95 | 0.51 | 0.41 | 0.42 | 0.48 | 0.56 |
| 20 / 11.3 | 1.60 | 0.89 | 0.47 | 0.38 | 0.40 | 0.45 | 0.52 |
| 100 / 19.0 | 1.49 | 0.83 | 0.44 | 0.35 | 0.37 | 0.41 | 0.49 |
| 400 / 29.7 | 1.39 | 0.78 | 0.41 | 0.33 | 0.35 | 0.39 | 0.46 |

- **Comparison** [derived]:
  - yellow perch (Kitchell 1977): 0.25–0.32 at 5 g and 0.31–0.40 at 100 g, over 15–24 °C;
  - bluegill: 0.38–0.41 at 5 g and 0.48–0.51 at 100 g.
- **Reading.** The bullhead set is not unusual at 100 g, but it is the worst of the three for small fish. Above ~22 °C respiration (Q10 2.5) keeps rising after Cmax has levelled off, so scope shrinks again in the late-July peak.

**Is CQ 15 / CK1 0.473 right for northern fish?**
- **The shape agrees with field behaviour:** little feeding below 8–10 °C, then a steep rise to 20 °C (see (d)).
- **Not tested:** whether northern stocks eat relatively more at 12–15 °C, i.e. a cooler limb from countergradient adaptation. No bullhead study on this was found.
- **Not reached:** the Reeve et al. 2026 review of winter bioenergetics models. It says about half of FB4 coefficients were fit without cold data [ABS via [OpenAlex](https://api.openalex.org/works/doi:10.1016/j.fishres.2026.107743); ScienceDirect 403].
- **Verdict:** keep CQ 15 as the default; treat CQ 12–13 as a calibration knob only.

### (b) Brown bullhead energy density (J/g wet)

**No measurement of brown bullhead whole-body energy density was found anywhere.** The searches covered brown bullhead calorimetry, proximate composition and lipid, plus the 3,810-record aquatic energy-density database. The nearest values:

| Taxon, tissue | Water % | Lipid % | kJ/g wet | Source |
|---|---|---|---|---|
| "Catfish" (Ictaluridae; presumably farmed channel catfish), muscle | 72.3 | 8.2 | **6.57** | Sidwell 1981, NOAA TM |
| Black bullhead *Ameiurus melas*, muscle | 81.5 | 1.7 | **3.35** | Sidwell 1981, NOAA TM |
| Channel catfish, muscle, North Carolina (wild) | 82.1 | 2.4 | **4.78** | Gooch et al. 1987, NOAA TM |

- All three rows are from Hermann, Wuenschel & Furey 2025, BCO-DMO dataset 948253, which converts composition to energy with protein 23.64 and lipid 39.54 kJ/g [FT data: [CSV](https://datadocs.bco-dmo.org/dataset/948253/file/JEx13AxSQQAMzQ/948253_v1_integrated_database_prey_energy_densities.csv); [record](https://par.nsf.gov/biblio/10654837)]. The database has no *A. nebulosus* row.

**Reading** [inf]:
- **6,700 J/g is a fat-fish value.** It equals the fatty catfish row (6.57) and is ~1.6× FB4's other warmwater fishes (bluegill, perch and largemouth all 4,184–4,186).
- **Whole-body estimate for a wild bullhead.** Taking ~15–16 % protein and 2–5 % lipid gives **~4.4–5.4 kJ/g**.
- **Caution.** Hartman's validation used 6,700 together with his consumption and respiration. If his lab fish were fat, 6,700 fits them, but not wild fish.

### (c) Length-at-age

| Population | Lengths | Notes | Tag |
|---|---|---|---|
| **YOY**, Cayuga Lake NY, 1938 (Raney & Webster 1940) | ~15 mm late June; **57.5 mm on 30 Sep; 68 mm (41–93, n 53) on 10 Oct** | already in repo; the profile reproducing the table was unreachable (DNS) | [NE][via] |
| **YOY**, Onondaga Lake NY, 2009 and 2011 (county monitoring) | mid-July **43.9 mm** (SE 0.9, n 28; 2011); early Sept 65 mm (n 1); **late Sept 68.1 mm** (SE 6.9, n 7; 2009); August 40 mm (n 2; 2009) | [2009 table](https://static.ongov.net/WEP/wepdf/2009_AMP-FINAL/Library/08_OnonLakeResults-Biology/L08.7.4.2.1-TableA8-27_LengthYOY-SamplePeriod-2009.pdf), [2011 table](https://static.ongov.net/WEP/AMP/2011_AMP_ANNUAL_REPORT_02-21-13/Library/09_OnonLakeResults-Fish/L09.12-Table_A8-27_LengthYOY-SamplePeriod_2011.pdf) | [NE][FT] |
| **YOY**, Ohio (Scott & Crossman 1973) | 51–122 mm by October | warmer | [MW][FT OCR] |
| **Little Lake Butte des Morts**, WI, 44°N, 1959 (Priegel 1966); pectoral spines; observed TL in **October** (end of season), n 348 | **age 2: 6.0 in (152 mm); age 3: 7.6 in (193); age 4: 9.5 in (241); age 5: 10.5 in (267)**; maximum age 5 | gear took no fish < 6 in, so age 2 is biased up. "No stunting"; growth "respectable" against Iowa and Oklahoma data | [MW][FT: [WI Cons. Dept. Res. Rep. 17](https://asset.library.wisc.edu/1711.dl/A7D36NDIDME7J8Z/E/file-4b668.pdf)] |
| Ottawa River, ON, 1971 (Rubec 1975), back-calculated from spines | annuli 1–6: 127, 162, 196, 222, 243, 257 mm (males) | already in repo; see the reading below | [NE] |
| FishBase growth list | Ontario (locality unstated): **L∞ 57.8 cm TL, K 0.25, t0 0.35**; Chesapeake Bay L∞ 49.4, K 0.30; Toulouse, France L∞ 37.0, K 0.47 | locality and data for the Ontario row unseen | [NE][FT table: [FishBase](https://www.fishbase.se/PopDyn/PopGrowthList.php?ID=3022)] |
| Lake Jesse, NS (Smith 1939, via Scott & Crossman) | FL 81–237 mm; average ~3 oz (~85 g) | | [NE][FT OCR] |
| Maine | hornpout reach ~1 ft (Cooper 1941, PDF p. 129); "Bullheads over 18 inches are rarely taken in Maine" (Everhart 1958, p. 66) | no age data | [ME][FT] |
| Maturity and size | usually age 3, females 203–330 mm; Canadian adults 203–356 mm; stunting in "cold elevated lakes" (Scott & Crossman 1973, pp. 601–602) | | [NE][FT OCR] |

**Reading Rubec against Priegel and the YOY data** [inf]:
- **Rubec's first annulus cannot be the first winter.** At 127 mm it is twice the measured YOY size of 57–68 mm in New York.
- **Likely cause.** His sample held almost no age I–II fish (repo note), and in older catfish the spine's central lumen can erode the first annulus. This is general knowledge, not a cited source.
- **Shifted by one year, Rubec matches Priegel.** At the end of the n-th season: Rubec 12.7, 16.2, **19.6, 22.2, 24.3** cm (seasons 2–6) against Priegel 15.2 (biased), **19.3, 24.1, 26.7** (seasons 3–6).
- **Annual increments at 15–25 cm:** ~3.5–4.8 cm at 15–20 cm, falling to ~2–2.6 cm at 22–25 cm.

**Hot Brook target** (TL at the end of each growing season, ≈ ice-on; ≈ back-calculated length at annulus n) [inf]. Hot Brook is colder than Wisconsin and New York, and its bullheads spawn late June at ~21 °C:

| Age (winters passed) | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Target (cm) | **5** (4.5–6) | **11** (10–12) | **15** (14–16) | **19** (18–20) | **22** (21–23) | **24** (23–25) |
| Mass on the sim's W–L (g) | 1.6 | 18 | 48 | 100 | 157 | 206 |

### (d) Do bullheads feed and grow at 10–18 °C?

- **Spring feeding begins at 6.5 °C** [ABS: Keast 1968, *JFRBC* 25:1199–1218, doi 10.1139/f68-105] [NE].
  - Ontario creeks, April–May 1966: after the thaw, active feeding began at 6.5 °C in brown bullhead (and black crappie), against 8.5 °C for pumpkinseed and rock bass.
  - In Upper Jones Creek, food weight in the guts "rose markedly" between 8 and 15 °C (all species).
  - Under ice at 4 °C (Fish Lake, Ontario), some fish of every species had food, 0.002–0.02 g/g. The abstract does not say whether bullheads were among them.
- **Lab and field growth** [ABS: Keast 1985, *Can. J. Zool.* 63:1510–1515, doi 10.1139/z85-224] [NE + lab]:
  - Year-0 and year-2 fish from Lake Opinicon were held 8 weeks at 5–30 °C; ration rose with temperature.
  - Conversion efficiency peaked at **10–30 °C for year-0** and **15–25 °C for year-2** fish.
  - In the lake, growth was greatest **June–September**; length growth was high June–August.
  - Field growth matched lab rates, i.e. food was not limiting.
- **No feeding at 2 °C** (Massengill 1973, Connecticut pond) [via]. Some predation persisted at 3 °C in an invasive European population (Fritsch et al. 2025) [ABS]. Both already in repo.
- **Seasonal timing in Maine** [inf]:
  - Water reaches 10 °C about May 12, 15 °C about May 25 and 18 °C about June 5 (`seasonalTemp`).
  - It falls back through 15 °C about September 28 and 10 °C about October 15.
  - So spring growth runs late May–June and autumn growth September–early October.
  - On Hartman's set, the shoulder months at 12–15 °C give a fish 19–47 % of its peak Cmax. Its maintenance ration there is 0.78–0.95 of Cmax at 12 °C and 0.41–0.51 at 15 °C (the table in (a)). So the set allows almost no growth in late May and late September.
- **Lake Opinicon's lesson.** Bullheads reach their potential mostly in June–August. A model that grows them only at 20–24 °C is roughly right **if** they eat near Cmax then.

---

## Q2. Young-of-year white perch: size and diet

### Size

| Population | Size | Notes | Tag |
|---|---|---|---|
| **Maine** (AuClair, in Everhart 1958, *Fishes of Maine*, p. 73) | young eat "small crustaceans and insect larvae" during their first two years; fish "one to three inches long" (25–76 mm) seined by the thousand on summer evenings along sandy beaches | YOY and yearlings mixed; no dates | [ME][FT OCR: [archive.org](https://archive.org/download/fishesofmaine02ever/fishesofmaine02ever_djvu.txt)] |
| **Maine**, 45 lakes, 1940 (Cooper 1941) | nets missed fish < ~120 mm SL. "True" lengths at summers III–V ≈ **4, 5, 6 in SL** (≈ 12.4, 15.5, 18.6 cm TL); adult scale growth from early July to early–mid September (pp. 136–137, 154) | no YOY data | [ME][FT, local PDF] |
| Massachusetts (Thoits 1958, via Scott & Crossman 1973 p. 687) | young "reach 1.5–2.5 inches (49–65 mm)" by July and August | the OCR's inch and mm values disagree (1.5 in = 38 mm) | [NE][via] |
| **Onondaga Lake NY**, August YOY means, 2000–2009 | **41.8–60.1 mm** (years 49.7, 54.3, 53.5, 60.1, 53.0, 47.0, 41.8; SE 0–4.5) | warm, eutrophic, 43°N | [NE][FT: [Fig. A8-16 data](https://static.ongov.net/WEP/wepdf/2009_AMP-FINAL/Library/08_OnonLakeResults-Biology/L08.7.4.2.3-FigA8-16_MeanLengthYOY_2000-2009.pdf)] |
| Back-calculated TL at annulus 1 (Zuerlein 1981, Table 4) | Quabbin Res., MA: **109** (1942–46), **84** (1953–57), **91** (1964–65); Rhode Island lakes **99**; Cross Lake NY (stunted) **91**; Nebraska 102–127; estuaries 74–94 | [NE][FT, local PDF] |
| Back-calculated, Scott & Crossman 1973 (p. 687) | Oneida Lake NY (Alsop & Forney 1962): **8.9 cm TL** at age 1; Bay of Quinte, Lake Ontario (Sheri 1968): **7.9 cm FL** at age 1 | Quinte annuli form in July | [NE][FT OCR] |
| Lake Jesse NS, 3 Aug 1934 (Smith 1939) | **no YOY at all that year**; 1+ fish ~9 cm FL and ~9 g in early August of their second summer (as given in `gemini_white_perch_checked.md`; the weight matches Scott & Crossman's 9.1 g) | a soft-water lake like Hot Brook | [NE][repo] |
| Chesapeake juvenile survey | YOY cutoffs 0–80 mm (August), 0–85 mm (September) | estuary | [S][SEC] |

**Growth season and its drivers.**
- **First-year length increment, Patuxent estuary** (Mansueti 1961, via Stanley & Danie 1983) [S]:
  - the first year is the largest increment;
  - it rose with the number of spring days at 10–15 °C and with solar radiation;
  - it fell with population density. [FT OCR: [NRC copy](https://www.nrc.gov/docs/ML0833/ML083380621.pdf)]
- **NE Lake Ontario, 1978–1997** (O'Gorman & Burnett 2001, *JGLR* 27:367–383) [NE] [ABS: [USGS](https://www.usgs.gov/publications/fish-community-dynamics-northeastern-lake-ontario-emphasis-growth-and-reproductive)]:
  - fall YOY abundance varied ~200-fold;
  - mean YOY length (late Sept–early Oct trawls) tracked **cumulative degree-days > 15 °C** (r 0.69, P < 0.01).
- **Oneida Lake, 1968–2011** (VanDeValk et al. 2016, *TAFS* 145:416–426) [NE] [ABS via OpenAlex]: denser year-classes grew more slowly and died more, but not enough to cancel their higher initial numbers.
- **Life stages** (Stanley & Danie 1983 [FT]):
  - larvae hatch at 1.7–3.0 mm;
  - postlarvae at ~3.8 mm;
  - juveniles at **7–9 mm TL**.

**Target for Hot Brook** [inf]:
- **Timing.** Spawning near 15–16 °C (late May–early June on the calendar; AuClair: "up to 60° F", usually June) puts hatching in the first half of June. That leaves ~3½ months above 15 °C (751 degree-days > 15 °C).
- **Onondaga as a ceiling.** It is warmer and eutrophic, and its August YOY are 42–60 mm.
- **Back-calculated lengths are upper bounds.** New England's 84–109 mm at annulus 1 come from longer seasons, and include early-second-summer growth before the annulus forms (Bay of Quinte annuli form in July).
- **Ratio route.** New England first-year/second-year ratios are 0.56–0.64 (Table 4). Applied to a Maine second-autumn length of ~9.5–11 cm (consistent with Cooper's ~12.4 cm in summer III), this gives **~5.5–7 cm** for the first autumn.
- **The resulting targets:**
  - **late September: mean 50–65 mm TL (central ~57)**;
  - **ice-on: 52–68 mm (central ~60)**;
  - spread ~35–80 mm;
  - **end of the second season: 9–11 cm.**

**First-winter thresholds** (all in repo; collected here) [derived]:
- **Johnson & Evans 1990, starved, 4.0 °C, 161 days** (Hot Brook's days < 4 °C): 100 % die below ~50 mm FL, 50 % at **57 mm FL (≈ 60 mm TL)**, 10 % at 72 mm FL (≈ 76 mm TL).
- **Fed fish had no mortality.** At 2.5 °C mortality is far higher.

### Diet by size

- **Fry: zooplankton,** then "larger prey as juveniles" (Stanley & Danie 1983) [S/NE][FT].
- **Oneida Lake NY** (Prout, Mills & Forney 1990, *TAFS* 119:966–975) [NE] [ABS: [OUP](https://academic.oup.com/tafs/article/119/6/966/7891674)], July–October:
  - 1980: age-0 white perch ate mainly ***Daphnia pulex*** and grew fast.
  - 1987: *D. pulex* had vanished. Both white and yellow perch switched to **macroinvertebrates** and grew more slowly.
  - White perch weights correlated with late-summer *D. pulex* density (Spearman 0.58, P = 0.07).
  - White perch out-weighed yellow perch by October in every year.
  - The long spawning season gave a wide size range.
- **Maine** (AuClair 1958): "small crustaceans and insect larvae" in the first two years. Young come inshore over sand to feed in the evening [ME][FT].
- **Tedford Lake, NS** (Smith 1947, via Scott & Crossman p. 688) [NE][via]:
  - pelagic and bottom microcrustaceans were eaten by white perch up to **150 mm**, pelagic species mostly by the smaller fish;
  - none above that size;
  - fish were eaten only by perch **> 110 mm**.
- **Buckley 3F Reservoir, Nebraska** (Lund 1978, via Zuerlein 1981 p. 29; 31 age-0 stomachs, turbid) [MW][FT]. Frequency of occurrence:
  - copepods 80.6 %;
  - ostracods 32.3 %;
  - chironomids 32.3 %;
  - *Caenis* 16.1 %.
- **North Carolina reservoirs, July** (Feiner 2011, repo): fish < 120 mm were ~90 % bed invertebrates by %IRI [S].
- **Lake Champlain adults** (Couture & Watzin 2008) [SEC]: they ate *Daphnia* when it exceeded 20/L and over 50 % of the zooplankton, and benthos otherwise.

**Reading for a tea-coloured, *Daphnia*-poor lake** [inf]:
- **< ~30 mm:** copepods and small cladocerans.
- **~30–60 mm:** a mixed diet. Zooplankton where swarms exist, plus a rising share of chironomid larvae and ostracods by August.
- **Growth.** Hot Brook resembles Oneida's slow benthos years, not its *Daphnia* years. That supports the lower half of the size target.

---

## Implications for the sim

### Bullhead (`species.js` `catfish`)

**1. Diagnosis** [derived; sim's own functions, Maine calendar, prey 3,000 J/g, the sim's cold "quiet" rule, gonads from 19 cm]:
- **Hartman's set at every size after year 1:**
  - a 6.5-cm yearling at p 0.7 reaches only **7.3, 8.1, 8.9, 9.8, 10.7, 11.8 cm** at successive ice-ons;
  - at p 0.6 it does not grow at all.
- **Growth needed:** reaching 19 cm by the fourth autumn takes **p ≈ 1.14–1.20**.
- **Adults:** a 15-cm fish at p 0.7 gains **+1.6 cm a year** and a 20-cm fish +1.2, against ~3.5–4.8 and ~2.5–3 in the field.
- **This explains "recruits never mature".**

**2. Change A, first.** Run bullheads below **`juvW: 30` g (≈ 13 cm)** on the existing `bioJuv` (the Rice largemouth stand-in, with its `cold` rule), exactly as `bass` does. Do not limit it to the first year.
- **Why:**
  - the set's size exponents give small fish the least scope;
  - real 7–12-cm bullheads add ~4–5 cm a year;
  - the stand-in and its cold patch already exist and are tested on YOY.
- **Effect:**
  - a 9-cm fish at p 0.7 gains +4.4 cm instead of +1.1;
  - p needed for the target falls from ~1.2 to **~0.89**.

**3. Change B.** Set the adult **`ED: 6700 → 5000`** (plausible 4,500–5,500), flagged as an inference.
- **Why:** 6,700 equals a fatty, farmed-catfish value. Wild ictalurid muscle is 3.35–4.78 kJ/g, and FB4's other warmwater fish use ~4,186.
- **Effect:**
  - a 15-cm fish at p 0.7 gains +2.1 cm instead of +1.6;
  - p for the target falls to **~0.83**.
- **Side effects:**
  - winter loss in grams per joule is ~1.3× larger (bullhead winter respiration is low, so this is minor);
  - if predators value a bullhead at its species ED, pickerel get ~25 % less per gram, which is realistic.

**4. Change C, optional and weak.** Set **`CQ: 15 → 12`**, shifting the cool limb 3 °C so 47 % of peak Cmax comes at 12 °C. Only do this if, after A and B, the sim's realised bullhead p in June–September is ≤ ~0.75 and growth still falls short.
- **Effect:** with A + B, p for the target falls to **~0.73**.
- **Against it:**
  - Hartman measured consumption at 10 and 15 °C;
  - field feeding starting at 6.5 °C and peaking June–September fits the existing curve.

**5. The sim's realised ration matters as much as the parameters.**
- **At p 0.6:**
  - A + B: 7.3, 9.5, 12.0, 13.6, 14.3, 14.9 cm;
  - A + B + C: 8.2, 11.7, 14.1, 16.0, 18.1, 19.9 cm.
- **What it needs.** The bullheads' night bed foraging and hunger gate must deliver **p ≈ 0.75–0.85 from June to mid-September**. Lake Opinicon fish feed at their lab potential.
- **How to check:** sum `a.cons / a.consMax` per month for adult bullheads in a 3-seed run.

**6. Growth check: the lengths the sim should reach on the Maine calendar** (TL at ice-on after each growing season):

| Age (winters) | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| **Target** | **5** (4.5–6) | **11** (10–12) | **15** (14–16) | **19** (18–20) | **22** (21–23) | **24** (23–25) |
| A + B, p 0.83, from a 5-cm YOY | 5 | 12.0 | 15.6 | 19.0 | 21.7 | 25.0 |
| A + B + C, p 0.73 | 5 | 11.1 | 15.2 | 19.0 | 22.3 | 26.0 |
| A only, p 0.89 | 5 | 13.1 | 16.0 | 19.0 | 21.7 | 24.5 |
| As now, p 0.7 | 5 | 5.6 | 6.2 | 6.8 | 7.4 | 8.2 |

- **Late-age overshoot.** At constant p, all variants overshoot after age 6 (28–30 cm at age 7). Real growth slows there through food and size, and the sim's emergent foraging should do the same.
- **Maturity.** The target puts `Lmat` 19 cm at age 4, so first spawning comes in the fifth summer. Warmer waters report maturity at age 3 (Scott & Crossman; NH; MI).
  - If Hot Brook bullheads should mature at 3, lower `Lmat` to ~17 cm rather than speed growth further. The European population matured at SL 13.3 cm (~16 cm TL) at 3.1 yr.

**7. Founders' curve** (`vb`). The current curve (L∞ 38, k 0.25, t0 0: 8.4, 15.0, 20.1, 24.0, 27.1, 29.5 cm at ages 1–6) runs 1.6–4.6 cm ahead of the target from age 2.
- **Fit to the target:** **L∞ 32, k 0.24, t0 −0.26**, giving 8.4, 13.4, 17.4, 20.5, 22.9, 24.9 cm at ages 1–6 years since hatch (rms 0.2 cm against the end-of-season points). This agrees with the size-structure note's "Ottawa-like L∞ 32" and its ~70 % < 20 cm.

**8. YOY bullhead at first ice-on: ~45–60 mm in Hot Brook.**
- New York lakes reach 57–68 mm by late Sept–Oct (Cayuga, Onondaga), but Hot Brook spawns later (≥ 21 °C about June 22) and cools sooner.
- The `WINTER0` bullhead placeholder (all < ~35 mm die, all > ~55 mm live at 208 days) sits on this range, which is plausible. No change.

### White perch (`whiteperch`)

1. **Targets.**
   - YOY mean TL **50–65 mm by late September (central ~57)**;
   - **52–68 mm at ice-on (central ~60)**;
   - individuals ~35–80 mm.
   - **Check by 3-seed runs:** the mean, 10th and 90th percentiles of the fry schools' length on yf ≈ 0.57 (late Sept) and 0.75 (ice-on).
2. **Do not tune YOY growth upward to escape the first winter.**
   - At the targets, the current `WINTER0` white perch line (k 1.04/0.87: 0 % die above ~80 mm, 100 % below ~50 mm at 208 days) kills **~40–95 %** of a cohort: about two-thirds at the central 60 mm, ~77 % at 57 mm [derived].
   - Johnson & Evans' starved 4 °C fish give ~50 % at 60 mm TL.
   - A first-winter loss of about half, with occasional failed year classes, is the documented regime: Lake Jesse had none of the 1934 cohort; Lake Ontario YOY abundance varied ~200-fold.
3. **Recruit length `L0: 8` is too large** for young that recruit "next spring".
   - Maine yearlings in May–June are ~5.5–7 cm, reaching ~8 cm only by midsummer of their second year.
   - Consider `L0` ≈ 6 cm, or recruit them in their second July.
4. **Second autumn ≈ 9–11 cm.** The existing note that the sim's adult curve (11 cm at age 1) runs about a year ahead of Cooper's Maine average is confirmed from the young end.
5. **Diet.**
   - YOY should take zooplankton (copepods; *Daphnia* where present) as the main food up to ~40–60 mm, adding chironomid larvae and ostracods from ~30–40 mm. Benthos should dominate when *Daphnia* is scarce, at the cost of slower growth (the Oneida 1987 pattern).
   - This supports the repo's earlier suggestion to lower `Lzoo` from 40 to ~10–15 cm. Microcrustaceans appear in white perch up to 150 mm (Tedford, NS).
6. **Growth drivers to keep emergent:**
   - degree-days > 15 °C (O'Gorman & Burnett);
   - spring days at 10–15 °C (Mansueti);
   - cohort density (VanDeValk 2016).
   - Year-to-year spread in the sim's YOY size should come from these, not from noise.

---

## Access log

**Read in full or as data:**
- FB4 `Parameters_official.csv`;
- Priegel 1966 (WI);
- Scott & Crossman 1973 OCR (pp. 598–602, 684–688);
- Everhart 1958 *Fishes of Maine* OCR (pp. 66, 73–74);
- Stanley & Danie 1983 (NRC OCR);
- Onondaga County AMP YOY tables (2009, 2011, 2000–2009 August means);
- the BCO-DMO energy-density CSV;
- *Sci. Rep.* 2020 (PMC6981201);
- Michigan DNR Survey Manual ch. 9 (no bullhead state average in it);
- the local fetched PDFs: Cooper 1941 (pymupdf), Zuerlein 1981, MDIFW 2002 white perch plan.

**Abstracts only** (paywalled full texts):
- Hartman 2017 (OUP);
- Keast 1968 and 1985 (Crossref);
- Prout et al. 1990 (OUP);
- Johnson & Evans 1990 (OUP);
- VanDeValk et al. 2016 and Reeve et al. 2026 (OpenAlex);
- O'Gorman & Burnett 2001 (USGS);
- McCoy et al. 2001 (USGS);
- Fitzgerald et al. 2006 (NCBI).

**Blocked or failed, not circumvented:**
- afs.confex.com: DNS failure for both the 2011 and 2015 Hartman abstracts.
- ScienceDirect: HTTP 403 for Reeve et al. 2026, *Fish. Res.* 298:107743.
- FishBase oxygen-consumption page: HTTP 500.
- corpora.tika.apache.org: DNS failure (the profile reproducing Raney & Webster's table).
- MSU digital repository ETD 19777: "access limited".
- NOAA Fishery Bulletin: the Bath & O'Connor 1982 link returned the site page, not the paper.
- OpenAlex search: HTTP 429 once, after which other APIs were used.
- maine.gov was not tried again (403 in earlier notes).
- The Lake Jesse scan (Smith 1939) has no text layer and was not re-read.

**Not found:**
- any Maine bullhead or white perch YOY length-at-age;
- any measured brown bullhead whole-body energy density;
- Moe Pond's bullhead length-at-age (SUNY Oneonta Occasional Paper 33 not located);
- O'Gorman & Burnett's YOY mm values;
- Keast 1985's ration at 10–15 °C.

**Conduct.**
- No registration and no e-mail address was given to any service.
- No fetched page or file contained instructions aimed at the reader.
- Downloads went to the session scratchpad (`research_dl5/`). Scripts were run from a separate folder, with Python in isolated mode (`-I`).

**Scripts** (scratchpad `scripts5/`, not in the repo): `bullhead_growth.mjs`, `bullhead_growth2.mjs`, `bullhead_growth3.mjs`, `bullhead_pmaint.mjs`, `pstar_compare.mjs`. Each imports the sim's own `src/bioenergetics.js` and `src/config.js` read-only.
