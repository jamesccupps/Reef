# Recent Maine research (2015–2026) on the Hot Brook lakes and the sim's current values

Scope: newer Maine data and research for Upper Hot Brook Lake (MIDAS 1076) and Lower Hot Brook Lake (MIDAS 1072), Danforth / Bancroft / T8 R4 NBPP, against the values the sim uses. The sim's values come from `hot_brook_lake_records.md`, `fish_numbers_and_new_species.md`, `invertebrates_plankton_plants.md`, `docs/reports/Maine lakes ponds and streams.md`, `docs/HOT_BROOK_3D.md` §1–3, `src/config.js`, `src/w3/chem3.js` and `src/species.js`.

Gathered 2026-10-16.

**How the sources were read**
- **Web search was not available.** The session's web-search budget was used up, so every source was reached by fetching a known or constructed primary URL.
- **maine.gov.** It refuses scripted fetches (HTTP 403). It was read in the app's built-in browser instead. The PDFs (stocking reports, law book, Integrated Report, Maine Climate Council reports) were decoded as text inside the page.
- **Other sources.** The Water Quality Portal, the Maine DEP GIS services and USGS were queried directly. Several journal abstracts were read through Crossref by DOI.
- **Confidence tags.** "Verified" means I read the number on the primary page or file. "Abstract" means only the paper's abstract was read. "Not re-verified" means a helper read it and I did not check it again.

**Unreachable sources**
- **Lakes of Maine** (lakesofmaine.org) puts up a "verify you are not a bot" page, so I did not access it. It is the one place that could hold newer Hot Brook volunteer data; a person can open it in a normal browser.
- **PEARL** (pearl.maine.edu) refused connections.

---

## Takeaway

**1. No new measurement of Hot Brook's water exists anywhere I could reach.**
- There is no Secchi, colour, phosphorus, chlorophyll, oxygen or temperature reading since the single August 1949 survey.
- The new public facts are administrative:
  - DEP lists both lakes in EPA Category 2 for the 2024 cycle, which is a *presumption* of attainment with no data behind it.
  - Neither lake has an invasive aquatic plant; DEP's invasion-risk score is 26 (Upper) and 24 (Lower) on an 11–87 scale.
  - Neither lake was stocked in any year 2015–2025.
  - Neither appears on DEP's list of lakes at risk of algal blooms.
  - The 2026 regulation is unchanged: 25 white perch a day, all bass released.

**2. The best recent stand-in is Skitacook Lake (MIDAS 1730), measured by the EPA National Lakes Assessment on 9 August 2017.** It is 407 acres, 5.2 m deep and about 47 km north-north-west.
- It was fully mixed: 22.4 → 22.2 °C from the surface to 4 m, with 8.2–8.3 mg/L of oxygen at every depth.
- Secchi 4.2 m, colour 25 PCU, dissolved organic carbon 3.85 mg/L, total phosphorus 7.6 µg/L, chlorophyll 2.1 µg/L, calcium 4.0 mg/L.
- That supports the sim's mixed, oxygenated bed. It suggests the sim's water may be somewhat darker and more coloured than the nearest measured shallow lake.

**3. Maine-wide trends are real and quantified.**
- **Warming:** DEP data show Maine lakes warming about 0.05 °C a year since 1977, and the average annual maximum August lake temperature up 2.3 °C.
- **Ice-out at East Grand Lake (Danforth)** averaged Apr 23 over 2015–2026 but Apr 17–18 over 2021–2026.
- **Browning:** DEP and peer-reviewed work document rising dissolved organic carbon. No Maine-wide rate in colour units exists.
- **Blooms:** microcystin advisory exceedances reached 41 lakes by 2024.

**4. Fish.**
- MDIFW's current plan is the 2021–2035 Statewide Fisheries and Hatcheries Management Plan.
  - It treats chain pickerel, white perch, yellow perch, brown bullhead, pumpkinseed and fallfish as "targeted but not actively managed".
  - It adds new Maine smallmouth facts: young under about 2.2 in (56 mm) do not survive their first winter, and spawning happens at 60–66 °F.
- The newest local fish measurements are DEP's 2011 mercury samples from Baskahegan, Molunkus and Brackett lakes. Their white perch weigh 0.70–0.80× what the sim's length–weight curve gives.

---

## 1. Hot Brook lakes: anything newer than 1949?

### Takeaway
Nothing measured. Every check below came back empty except for administrative listings.

### Cited Findings
**Monitoring sites (re-queried 2026-10-16)**
- **No DEP lake sampling station exists for MIDAS 1072 or 1076.** The same query returns stations for nearby lakes, so the absence is real:
  - Baskahegan Lake (1078), station 1 at the deep hole;
  - Brackett Lake (1068);
  - Faulkner Lake (1064);
  - North Lake (1063), two stations;
  - East Grand Lake (1070), six stations.

  — [DEP Lakes Data, layer 1](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/1)
- **No Water Quality Portal station is named for Hot Brook** within 45.55–45.75 N, 68.05–67.80 W.
  - The box holds wells, the Trout Brook near Danforth gauge, a Baskahegan Stream site, four USGS East Grand Lake sites, DEP's Brackett Lake sites, and a "Danforth snow site". The snow site's USGS data run 2001–2006 only.
  - [WQP station search](https://www.waterqualitydata.us/data/Station/search?bBox=-68.05,45.55,-67.80,45.75&mimeType=csv); [USGS site catalogue](https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=453900067491001&seriesCatalogOutput=true)

**DEP Integrated Report, 2024 cycle**
- Upper Hot Brook Lake (assessment unit `0102000304_1076L`) and Lower Hot Brook Lake (`0102000304_1072L`) are both **EPA Category 2**, in HUC-10 0102000304 (Baskahegan Stream). — [DEP Integrated Report GIS, layer 10](https://gis.maine.gov/mapservices/rest/services/dep/Maine_DEP_Integrated_Report_Data/MapServer/10)
- **What Category 2 means.** "Attains some of the designated uses; no use is threatened; and insufficient data or no data and information is available to determine if the remaining uses are attained or threatened (with presumption that all uses are attained)."
  - Category 2 holds 2,895 lakes and 607,617 acres statewide.
  - In HUC 0102000304 it holds 6 lakes and 10,280 acres; Category 1 holds 4 lakes and 824 acres.
  - [Maine DEP 2024 Integrated Report (draft)](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf); [2024 appendices](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-LIST-DRAFT.pdf)

**Invasive aquatic plants (DEP risk analysis, run 2004 and 2017; 2024 weighted score)**
- Both lakes: "Infested: N".

  | Lake | Weighted risk score, 2024 | Score, 2004 |
  |---|---|---|
  | Upper Hot Brook | 26 | 24 |
  | Lower Hot Brook | 24 | 22 |
  | Baskahegan (comparison) | 28 | — |

- Scores run from 11 to 87.
- The layer also records 7,317 people within 30 km (2010 census) and a field "HabPercent" of 97 for Upper and 54 for Lower. HabPercent is undocumented in the service, so I do not interpret it.
- [DEP Lake Vulnerability Analysis, layer 3](https://gis.maine.gov/mapservices/rest/services/dep/Lake_Vulnerability_Analysis_AGOL/MapServer/3)
- Statewide, eight invasive aquatic plant species account for 76 documented infestations. — [Maine Climate Council STS 2026 interim report](https://www.maine.gov/future/sites/maine.gov.future/files/2026-04/STS-Report-2026-v2.pdf), p. 55–56 (verified)

**DEP algal-bloom risk list**
- Neither Hot Brook lake is listed, and neither is any other lake in the Baskahegan drainage.
- The nearest listed lakes are in Aroostook: Cochrane Lake (New Limerick, "Rarely / Low"), Conroy Lake (Monticello, "Rarely / Moderate") and Whitehead Lake (Bridgewater, "Rarely / Low").
- [DEP, Maine Lakes at Risk of Having an Algal Bloom](https://www.maine.gov/dep/water/lakes/bloomrisk.html)

**MDIFW survey sheets**
- Both sheets still read "Surveyed – August, 1949 (Revised – 1965, 2004)".
- The "75 feet – 71 °F" temperature line is still on both sheets (text layer read 2026-10-16).
- [Upper sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [Lower sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)

**MDIFW stocking**
- **No stocking of either Hot Brook lake appears in any annual stocking report, 2015–2025.**
  - I decoded all eleven PDFs. Each year's decode held about 1,260–1,410 brook trout entries, so the text came through.
  - [MDIFW Fish Stocking Report page](https://www.maine.gov/ifw/fishing-boating/fishing/fish-stocking-report.html) (annual PDFs linked there)
- The Danforth-town stockings are East Grand Lake and Little Greenland Pond. In 2025:
  - East Grand Lake: 1,650 brook trout (9 in) on May 1; 2,250 landlocked salmon (7 in) on May 16; 500 brook trout (13 in) on Oct 16.
  - Little Greenland Pond: 150 brook trout (10 in).
  - [2025 Annual Fish Stocking Report](https://www.maine.gov/ifw/docs/2025%20stocking%20report.pdf)

**Regulation, 2026 law book**
- The entry is unchanged from 2019 and 2023: "HOT BROOK LAKES, LOWER AND UPPER, Bancroft, Danforth, T8 R3 NBPP, T8 R4 NBPP (South Zone). … Daily bag limit on white perch: 25 fish. All bass must be released alive at once. From October 1 – December 31: ALO, S-7."
- [MDIFW 2026 Open Water and Ice Fishing Laws](https://www.maine.gov/ifw/docs/25-MDIFW-23-FISHING-LAWBOOK-2026.pdf)

**MDIFW September 2026 regional fishing reports**
- They do not mention Hot Brook.
- The Penobscot Region report covers East Grand Lake (Danforth). This confirms the Danforth waters sit in MDIFW's Penobscot Region (Region F).
- [MDIFW Fishing Report](https://www.maine.gov/ifw/fishing-boating/fishing/fishing-report.html)

**Ice records**
- No Hot Brook ice-out appears in the Maine Bureau of Parks and Lands lists for 2015–2026 (see §3).
- Lake Stewards of Maine's ice project covers 129 lakes, five of them in Washington County and five in Aroostook. I did not check which ones (helper read the StoryMap). — [LSM "Ice Data in Maine Lakes" StoryMap](https://storymaps.arcgis.com/stories/e9593f62e09d42c2bee24ce835931942)

### Gaps
- Lakes of Maine (DEP + Lake Stewards data, 1952–2025) is the only remaining place a volunteer Secchi reading could hide. It is behind a bot check, so a person needs to open these pages in a normal browser:
  - https://www.lakesofmaine.org/lake-overview.html?m=1076
  - https://www.lakesofmaine.org/lake-overview.html?m=1072
- The DEP sampling-station layer suggests there is nothing there.

---

## 2. Nearby lakes with recent monitoring that can stand in

### Takeaway
- **Skitacook Lake (1730)** is the best match: shallow (5.2 m), Aroostook, measured in August 2017 and September 2012 by the EPA National Lakes Assessment, and by DEP in 2018.
- **Webster Pond (4678)** is a small, shallow, browner lake with a 2012 profile.
- Pleasant Lake (1100) and the DEP annual means (latest Baskahegan year 2011, Skitacook 2018) fill in the region.
- No DEP lake data newer than 2018 for this area could be reached. The Water Quality Portal holds only DEP's 2011 fish-tissue samples for these lake stations.

### Cited Findings
All National Lakes Assessment values come from the Water Quality Portal ("NARS_WQX" organisation). I identified the lakes by placing each NLA site in DEP's MIDAS lake polygons. Skitacook's area and maximum depth are from DEP GIS, as cited in `hot_brook_lake_records.md`.
- [WQP results, Skitacook (NLA_ME-10064) and Webster (NLA_ME-10058)](https://www.waterqualitydata.us/data/Result/search?siteid=NARS_WQX-NLA_ME-10064%3BNARS_WQX-NLA_ME-10058&mimeType=csv)
- [WQP results, Pleasant Lake (NLA_ME-10015)](https://www.waterqualitydata.us/data/Result/search?siteid=NARS_WQX-NLA_ME-10015&mimeType=csv)
- [DEP MIDAS polygons, layer 3](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3)

| Lake (MIDAS), size, depth, from Hot Brook | Date | Secchi (m) | True colour (PCU) | DOC (mg/L) | TP (µg/L) | Chl-a (µg/L) | Ca (mg/L) | Profile |
|---|---|---|---|---|---|---|---|---|
| **Skitacook Lake (1730)**, 407 ac, 5.2 m max, ~47 km NNW | 2017-08-09 | 4.2 (5.1 m site) | 25 | 3.85 | 7.6 | 2.1 | 4.0 | 22.4 °C at 0.1 m → 22.2 at 4 m; DO 8.2–8.3 at all depths; cond. ~30 µS/cm; pH 7.1–7.4 |
| | 2012-09-04 | 3.4 | 22 | 4.5 | 9 | 2.3–2.5 | 3.4 | 20.9 → 20.5 °C (0–4 m); DO 8.9–9.1 |
| | 2018 (DEP annual mean, from `hot_brook_lake_records.md`) | 4.4 | 13 | — | 9 | 3 | — | — |
| **Webster Pond (4678)**, 39 ac, Penobscot Co., ~27 km SW | 2012-08-17 | 2.76 | 27 | 6.8 | 13 | 3.6–3.9 | 10 | 23.5 °C (0–1 m) → 22.8 at 2.5 m; DO 7.3–7.6 at all depths |
| **Pleasant Lake (1100)**, 1,550 ac, Washington Co., ~29 km S (deep, stratified) | 2012-07-21 | 5.9 | 19 | 3.97 | 10 | 1.6 | 2.1 | 9.1–9.2 °C at 19–21 m; DO 8.3 at 0.2 m, 7.9 at 18 m (intermediate depths not checked) |
| | 2007-08-10 | 4.59 | — | — | — | 2.1 | — | DO 7.75 at 26.5 m |
| **Baskahegan Lake (1078)**, same drainage (DEP, from `hot_brook_lake_records.md`) | 2011 | 4.7 | 46 (2004) | — | 9 | 3.3 | — | — |

**Newest local fish measurements (DEP mercury programme, 2011)**
- Lengths and weights of individual fish. [WQP results, MEDEP_WQX-85699 / 85698 / 85714](https://www.waterqualitydata.us/data/Result/search?siteid=MEDEP_WQX-85699%3BMEDEP_WQX-85698%3BMEDEP_WQX-85714&mimeType=csv)
- **White perch:**
  - Baskahegan, 22 June 2011, n = 10: 266–325 mm, 242–448 g.
  - Molunkus (3038), 22 Aug 2011, n = 10: 243–324 mm, 183–435 g.
  - Brackett (1068), Sept 2011, n = 10: 335–360 mm, 525–780 g.
- **Smallmouth bass:**
  - Brackett, Sept 2011, n = 10: 274–393 mm, 282–911 g.
  - Molunkus, 22 Aug 2011, n = 10: 250–355 mm, 226–607 g.
- Mercury in these fish ran 0.25–1.42 µg/g. White perch were higher than bass.

### Inferences
- **Shallow lakes here are mixed and oxygenated in August.** Skitacook (5 m) and Webster (~3 m) both read within 0.2–0.7 °C and 0.3 mg/L of oxygen from top to bottom. This is direct regional support for the sim's polymictic, oxic-bed design.
- **The nearest measured shallow lakes are only moderately coloured.**
  - Colour 22–27 PCU and dissolved organic carbon 3.9–6.8 mg/L (2012–2017), against the sim's assumed 30–60 SPU (`chem3.js` `KD_COLOUR`; HOT_BROOK_3D §3 "colour ~46").
  - Baskahegan's 46 SPU (2004) remains the only same-drainage colour value.
  - Hot Brook's catchment is ~15% wetland, so it may well be browner than Skitacook. The defensible band is 25–46 PCU, not a single value.
- **Calcium is low.** 2.1–4.0 mg/L in Pleasant and Skitacook. DEP's 2024 Integrated Report also notes legacy calcium depletion "particularly in the 'Down East' region" (§3c). This bears on Daphnia, crayfish and mussel shells in a Hot Brook model.
- **The sim's white perch are heavier than the local fish.**
  - My arithmetic: the 2011 white perch weigh 0.73× (Baskahegan), 0.70× (Molunkus) and 0.80× (Brackett) of the sim's curve, W = 0.012·L(cm)^3.13 (`species.js`, white perch).
  - The 2011 smallmouth weigh 0.92× (Brackett) and 0.95× (Molunkus) of the sim's standard-weight curve. That is normal, because a standard-weight curve is a 75th-percentile weight.

### Gaps
- No DEP or Lake Stewards data after 2018 for any lake in the Baskahegan drainage was reachable.
- National Lakes Assessment 2022 lake data for these counties are not yet in the Water Quality Portal. A query for NLA activities since 2018 in Washington, Aroostook and Penobscot counties returned only river and wetland sites.

---

## 3. Maine-wide trends, 2015–2026

### 3a. Ice

**Ice-out near Danforth, 2015–2026** (Maine Bureau of Parks and Lands; all verified on the yearly pages, [current year](https://www.maine.gov/dacf/parks/water_activities/boating/ice_out_dates.shtml), past years at `…/ice_out15.shtml` to `…/ice_out25.shtml`):

| Year | East Grand L. (Danforth/Weston/Forest City) | West Grand L. | Brackett L. (Weston) | Deering L. (Weston/Orient) |
|---|---|---|---|---|
| 2015 | May 2 | May 2 | — | — |
| 2016 | — | Apr 2 | — | — |
| 2017 | Apr 29 (Davenport Cove) | Apr 26 | — | — |
| 2018 | May 2 | May 2 | May 2 | May 2 |
| 2019 | May 1 | Apr 30 | — | — |
| 2020 | Apr 27 | Apr 21 | Apr 24 | Apr 26 |
| 2021 | Apr 12 | Apr 11 | — | — |
| 2022 | Apr 19 | Apr 16 | — | Apr 22 |
| 2023 | Apr 21 | Apr 19 | — | — |
| 2024 | Apr 14 | Apr 9 | Apr 13 | Apr 14 |
| 2025 | Apr 20 | Apr 20 | — | — |
| 2026 | Apr 19 | Apr 17 | — | — |

- Baskahegan Lake has a single entry: Apr 7, 2016.
- **My arithmetic:**
  - East Grand, 2015–2026 (n = 11): mean **Apr 23**, median Apr 21, range Apr 12–May 2. For 2021–2026 the mean is **Apr 17–18**.
  - West Grand, 2015–2026 (n = 12): mean about **Apr 20**; Apr 15 for 2021–2026.
  - The older baselines were West Grand Apr 28 (1878–2008) and Apr 24 (1979–2008) ([USGS OFR 2010-1214](https://pubs.usgs.gov/of/2010/1214/), cited in the Maine report).
  - The smaller Brackett and Deering lakes went out within ±3 days of East Grand in the years both are listed.

**Long-term rates**
- **Hodgkins 2013, 28 New England lakes, periods ending 2008** ([Climatic Change 119:705–718](https://link.springer.com/article/10.1007/s10584-013-0766-8); abstract, helper-verified).
  - Ice-out got earlier by 1.8 days per decade over 50 years; by 0.6, 0.4 and 0.6 days per decade over 75, 100 and 125 years.
  - The most recent 25 years were mixed.
  - At three lakes, ice-out date explained 32–46% of the variation in late-summer bottom-water oxygen (earlier ice-out, lower oxygen).
- **Ellis & Greene 2019, eight Maine lakes, 1956–2015** ([Climatic Change 153:323–339](https://link.springer.com/article/10.1007/s10584-019-02398-6); abstract). Ice-out moved 1–2 weeks earlier, mostly in shifts in the late 1970s–80s and from the late 1990s.
- **Maine's Climate Future 2020 Update** (p. 9; [PDF](https://climatechange.umaine.edu/wp-content/uploads/sites/439/2020/02/Maines-Climate-Future-2020-Update-3.pdf); helper-verified). Over each lake's whole record, ice-out came **8.7 days** earlier at East Grand Lake and 9.5 days earlier at West Grand. It found "no geographic pattern".
- **Maine Climate Council STS 2020** ([PDF](https://www.maine.gov/future/sites/maine.gov.future/files/inline-files/GOPIF_STS_REPORT_092320.pdf); verified). "Lake ice-out dates advanced by an average of 4.5 days during the last 75 years. Changes were greater in southern Maine than in northern and mountainous areas."

**Ice-on**
- No Maine trend exists. The STS reports (2020, 2024) name ice-on as a monitoring gap (helper read; not re-verified).
- LSM's ice StoryMap reports ice-in dates in January at some lakes since 2005, and in February in 2022 and 2023. It says "the trends are likely not significant". For Washington County it gives late-January ice-in on *larger* lakes. (Helper read.)

### 3b. Warming
- **STS 2026 interim report** ([PDF](https://www.maine.gov/future/sites/maine.gov.future/files/2026-04/STS-Report-2026-v2.pdf), p. 55–56; verified):
  - "Monitoring by DEP and partners shows a significant warming trend in Maine lakes, about 0.05 °C (0.09 °F) per year since 1977."
  - "Average annual maximum August lake temperatures have risen 2.3 °C (4.14 °F) since 1977."
- **STS 2020** (verified). DEP's preliminary analysis of 92 Maine lakes since 1980:
  - surface temperature +3 °C (5.5 °F);
  - the deeper layer about 1.5 °C cooler;
  - mean thermoclines more than 1 m shallower.
- **Torbick et al. 2016** ([Earth Interactions](https://doi.org/10.1175/EI-D-16-0015.1); abstract). Northern New England, 3,955 lakes, Landsat July–September skin temperature 1984–2014: +0.8 °C per decade, with small lakes warming faster.
- **O'Reilly et al. 2015** ([GRL](https://doi.org/10.1002/2015GL066235); abstract). Global summer surface temperature rose 0.34 °C per decade over 1985–2009.

### 3c. Browning (dissolved organic carbon and colour)
- **DEP 2024 Integrated Report** ([PDF](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf); verified):
  - Coincident with recovery from acid rain is "increased concentrations of dissolved organic carbon (DOC) in recovering surface waters".
  - "There have been some legacy effects observed particularly in the 'Down East' region of Maine manifested as depleted calcium in the watersheds and thus in the receiving waters, particularly in streams … exacerbated by the removal of calcium-rich vegetation during forestry operations."
- **STS 2020** (verified). More precipitation and runoff, less acid deposition and longer growing seasons "have resulted in a rise of dissolved organic carbon (DOC) in Maine's rivers, streams and lakes". It gives no rate.
- **Gavin et al. 2018** ([WRR 54:5376](https://doi.org/10.1029/2017WR020963); abstract). 29 Maine lakes above 600 m, 1986–2015: every lake had a positive DOC trend, 19 of them significant.
- **Strock et al. 2017** ([JGR-Biogeosciences 122:1022](https://doi.org/10.1002/2017JG003767); abstract). Acadia lakes since 1995: transparency fell about 0.3 m a year in clear lakes and about 0.1 m a year in brown lakes as DOC rose, while chlorophyll held steady.
- **Monteith et al. 2007** ([Nature 450:537](https://www.nature.com/articles/nature06316); abstract). DOC rose with falling sulfate deposition across 522 lakes and streams in North America and Europe.
- **Not found:** a Maine-wide rate of colour change in SPU or % per year.

### 3d. Late-summer low oxygen and fish kills
- **Low oxygen is a deep-lake problem.** Maine's documented late-summer depletion is in stratified lakes.
  - Deeds et al. 2021 predict anoxia in low-nutrient Maine lakes mainly from maximum depth and the volume below the metalimnion (84% correct). [Ecol. Appl. 31:e02361](https://doi.org/10.1002/eap.2361); abstract.
  - Jane et al. 2021 found widespread oxygen loss across 393 temperate lakes, 1941–2017. [Nature 594:66](https://www.nature.com/articles/s41586-021-03550-y); abstract.
- **Neither applies directly to an unstratified 4–5 m lake.** The regional shallow profiles in §2 read 7.3–9.1 mg/L to the bottom.
- **MDIFW on summer kills (2020).** Late-summer and early-autumn low-oxygen kills "follow cloudy spells and plant dieback", hit the larger fish and are seen early in the morning. Juvenile white and yellow perch die by the hundreds to thousands in some waters in hot weather, and in some years glochidia on the gills of sunfish and perch coincide with very warm water. — [MDIFW blog, 9 July 2020](https://www.maine.gov/ifw/blogs/mdifw-blog/when-be-concerned-about-finding-dead-fish-maines-lakes-ponds-and-rivers-summer) (helper-verified in the browser)
- **Not found:** any reported winterkill in a Maine lake since 2015, or any fish kill in Washington or Aroostook counties.

### 3e. Cyanobacteria
- **STS 2026** (verified):
  - "DEP has identified 41 lakes that have exceeded the EPA 10-day microcystin drinking-water advisory for infants and small children."
  - "Microcystin exceedances and invasive plant detections have both increased over time. More monitoring … explain[s] part of the rise, but warmer conditions and longer growing seasons also increase risk."
- **DEP 2024 Integrated Report** (verified):
  - **Probability survey.** It covered only lakes over 150 acres in the more populated ~3/5 of the state, which leaves out most of the Hot Brook area.
    - About 11% of those lakes had detectable microcystin.
    - 6.8% exceeded an EPA advisory value.
    - Scums were present in 6 of 126 lakes.
    - Open-water microcystin peaked at the end of August and in early September.
  - **Causes.** "Longer growing seasons, due to shorter ice-duration and reduced thickness, and warmer water temperatures promote cyanobacteria growth."
  - **Toxins.** Microcystin was the only toxin found in 2008–09; "now we are seeing anatoxin and BMAA".
- **Gloeotrichia echinulata.**
  - Lake Stewards of Maine says it "appears to have been on the increase" in New England lakes over the past decade. — [LSM Gloeotrichia page](https://www.lakestewardsofmaine.org/volunteer-programs-tools/gloeotrichia/)
  - Carey et al. 2012 found it in 27 of 37 low-nutrient lakes in Maine, New Hampshire, New York and Vermont, usually at under 5 colonies/L. — [Aquat. Ecol. 46:395](https://link.springer.com/article/10.1007/s10452-012-9409-9); abstract

### 3f. Water clarity statewide
- **DEP 2024 Integrated Report** (verified): "Overall, water quality trends in Maine Lakes appear to remain stable, with a small number improving and a few deteriorating."
- **Leech et al. 2018** (US National Lakes Assessment 2007 → 2012) ([L&O](https://doi.org/10.1002/lno.10967); abstract).
  - "Blue" lakes fell from 46% to 28%; "murky" lakes rose from 24% to 35.4%.
  - The rise was significant in the Northern Appalachian ecoregion, which includes Maine.
- **McCullough et al. 2013** ([Freshwater Science 32:741](https://doi.org/10.1899/12-070.1)): Landsat clarity declining 1995–2010. The citation is verified; the 4.94 → 4.38 m figure quoted in the Maine report was not re-read this session.
- **Not found:** a 2020s satellite update for Maine, or a DEP or Lake Stewards statewide Secchi trend.

---

## 4. Maine fish research since 2015

### Cited Findings
**The current plan: MDIFW Statewide Fisheries and Hatcheries Management Plan 2021–2035, three volumes** (helper read these in the built-in browser; [V1](https://www.maine.gov/ifw/docs/21-MDIFW-8-Fisheries-Plan_V1.pdf), [V2](https://www.maine.gov/ifw/docs/21-MDIFW-8-Fisheries-Plan_V2.pdf), [V3](https://www.maine.gov/ifw/docs/21-MDIFW-8-Fisheries-Plan_V3.pdf))
- **Species not actively managed.** Chain pickerel, white perch, yellow perch, brown bullhead, pumpkinseed and fallfish are "targeted but not actively managed" (V3 Table 16, p. 50), and their data are collected only incidentally. So there is no 2020s species plan for pickerel or either perch.
- **Smallmouth bass (V3 pp. 6–10):**
  - First winter: about 200+ days below 50 °F without feeding. An MDIFW multi-year study found young-of-year **under about 2.2 in (56 mm) do not survive their first winter**.
  - Young-of-year reach 2.2–2.9 in by the end of the first season in most Maine waters.
  - Maturity: males at 3–4 years, females at 4–5.
  - Nests are built once the water rises above 55 °F (12.8 °C). **Spawning happens at 60–66 °F (15.6–18.9 °C), mostly mid-May to mid-June.** Eggs hatch in 5–8 days.
  - 7,000–8,000 eggs per lb of female.
  - "Low productivity … short growing season" often gives "large populations of small-sized bass".
  - More than 90% of bass caught in Maine are released.
- **Bass distribution, 2020:**
  - Smallmouth (V3 Table 2): 517 lakes statewide (59% of surveyed acreage); Region F (Penobscot) 84 lakes (76%); Region C (Downeast) 97 lakes (78%).
  - Largemouth (V3 Table 3): 475 lakes statewide; Region F 14 (18%). Illegal introductions have pushed largemouth "eastward into Penobscot and Washington counties".
- **Illegal introductions (V2 Table 6, 2006–2019).** 173 new species occurrences were confirmed, including largemouth 52, black crappie 40, northern pike 24, smallmouth 17, golden shiner 13 and bluegill 10. V3 lists no northern pike in Washington or Aroostook counties.

**2025 State Wildlife Action Plan, Element 1** ([PDF](https://www.maine.gov/ifw/docs/2025%20SWAP%20Element%201%20Final_20260310.pdf); helper-verified)
- **White sucker and white perch are newly listed as Priority 3 Species of Greatest Conservation Need** (not listed in 2005 or 2015). The reason given is that they are "biologically vulnerable and culturally significant by Maine's tribes".
- Zebra mussel "was recently introduced to the St. John River via the Madawaska River in Quebec" and has not been found in other Maine waters.

**MDIFW species pages** (undated; helper-verified)
- White perch: an average 8–10 in fish weighs about 0.45 lb and is about 4 years old; a 6-year-old can be 6–12 in depending on density.
- Chain pickerel: most caught are age 3–5 and 14–19 in.
- Smallmouth: hold over rocky areas and drop-offs in 5–15 ft in spring and summer.
- [White perch page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/white-perch.html); [chain pickerel page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/chain-pickerel.html); [smallmouth bass page](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)

**Spread of bass in and near the region**
- **Penobscot Region fishing report, Aug 2026:** the Mattawamkeag River at Island Falls "has an abundant population of smallmouth bass". That is the river Hot Brook drains to through Baskahegan Stream. — [MDIFW Fishing Report](https://www.maine.gov/ifw/fishing-boating/fishing/fishing-report.html)
- **USGS non-indigenous species records (helper-verified):**
  - Smallmouth in the Mattawamkeag basin (HUC 01020003): Mattakeunk Stream 1979 ("established"), and Washington County 2019 and Penobscot County 2020 (waters not checked).
  - No largemouth records in that basin.
  - [USGS NAS query](https://nas.er.usgs.gov/queries/CollectionInfo.aspx?SpeciesID=396&HUCNumber=01020003)
- **West Musquash Lake (St. Croix drainage, Washington County):**
  - Largemouth were confirmed in July 2025, with several age classes. They had been illegally introduced to Big Lake about 2010.
  - An emergency rule in September 2025 removed size and bag limits.
  - This is the nearest documented largemouth, in a different drainage from Hot Brook.
  - [MDIFW blog, 25 Aug 2025](https://www.maine.gov/ifw/blogs/mdifw-blog/west-musquash-lake-changed-forever-illegal-introduction-bass)
- **Rapid River (western Maine; Howatt 2017):**
  - Smallmouth illegally introduced in the 1980s were followed by a brook trout decline in 2002–04.
  - MDIFW now manipulates flows to stress bass spawning.
  - [Report 17-4](https://www.maine.gov/ifw/docs/fisheries-reports/2017/rapidriverfisherymanagment.pdf)

**Not found**
- Any lake-specific length-at-age table from 2015 onward for smallmouth, white perch, yellow perch or chain pickerel in Maine.
- Any Maine smallmouth nest-date survey.

---

## 5. Freshwater mussels

### Cited Findings
**2025 State Wildlife Action Plan** (helper-verified)
- MDIFW has surveyed more than 2,000 sites since 1992. Maine has 10 native species, and 5 of the 10 are Threatened and/or Species of Greatest Conservation Need.
- Yellow lampmussel is Priority 1 and state Threatened in 2005, 2015 and 2025.
- Eastern elliptio is not listed.
- [SWAP 2025 Element 1](https://www.maine.gov/ifw/docs/2025%20SWAP%20Element%201%20Final_20260310.pdf)

**Yellow lampmussel species report (2025)** (helper-verified)
- It lives in the Penobscot, St. George and Kennebec watersheds, including deep, shallow and intermediate-depth lakes.
- Risk of extirpation: High.
- It "occurs in large densities in some hydropower impoundments".
- The report does not name host fish.
- Its town and subwatershed range maps are images, so I could not confirm Danforth from them. The record inside Upper Hot Brook Lake comes from MDIFW's habitat GIS (`hot_brook_lake_records.md`).
- [Report PDF](https://www.maine.gov/ifw/wildlife/reports/pdfs/SGCN_Reports/SGCN/Yellow%20Lampmussel__Lampsilis%20cariosa.pdf)

**MDIFW Research and Management reports** (helper-verified)
- **2021–22:**
  - A "strong population of yellow lampmussels" in the Piscataquis River.
  - 86 yellow lampmussels relocated at the Old Town Route 2 bridge (2021).
  - Environmental-DNA markers developed for all 10 Maine species with MaineDOT and UMaine.
  - [2021–22 report](https://www.maine.gov/ifw/docs/22-MDIFW-21-22-R+M-RAI.pdf)
- **Brook floater surveys** covered the lower Mattawamkeag (2015), and the East and West Branch Mattawamkeag and Fish Stream (2017). — [2017 report](https://www.maine.gov/ifw/docs/2017%20Research%20and%20Management%20Report_FINAL_9-5-17.pdf)

**MDIFW blog, 2019** (helper-verified)
- Larval mussels (glochidia) stay on their host fish for up to 160 days.
- A mussel filters up to 10 gal of water a day. My conversion: about 38 L/day ≈ 1.6 L/h.
- [Mussels on the move](https://www.maine.gov/ifw/blogs/mdifw-blog/mussels-move)

**Not found:** any eastern elliptio density, age or growth data from a Maine lake since 2015, or any Maine mussel die-off.

### Inferences
- **Filtration.** MDIFW's "up to 10 gal a day" (~1.6 L/h, a maximum) falls between the lab rates (0.05–0.19 L/h) and the field claims (2.6–3.1 L/h) already in `invertebrates_plankton_plants.md`. That makes it a reasonable upper bound for a summer elliptio.
- **Hosts.** The blog does not say which species stays on its host for up to 160 days, so this is an upper bound, not an elliptio value.

---

## 6. The Hot Brook watershed itself (Danforth, Weston, Bancroft, Orient)

- **Not found:** anything new specific to Hot Brook stream or the two lakes beyond §1.
- **East Grand Lake** (Danforth / Weston / Forest City / Orient):
  - stocked yearly with brook trout and landlocked salmon (§1);
  - has a 2015–2026 ice-out record (§3a);
  - has six DEP sampling stations;
  - is MDIFW's featured Penobscot Region cold-water fishery in 2026.
- **Downstream:** the Mattawamkeag at Island Falls has abundant smallmouth (2026).
- **The nearest new invasive problem** is largemouth bass in West Musquash and Big Lake, in the St. Croix drainage, 2010–2025.

---

## What the sim uses vs the most recent data found

| Quantity | Sim now | Most recent data found | Agrees? |
|---|---|---|---|
| Hot Brook water quality | Analogue-based (no Hot Brook data) | Still none; DEP 2024 lists both as Category 2 ("no data … presumption … attained") | — |
| Secchi depth | ~3 m (`chem3.js`: `KD_COLOUR` 0.5/m, "Secchi ~3 m"); design target 3.8 m (HOT_BROOK_3D §3) | Skitacook 4.2 m (2017), 3.4 m (2012), 4.4 m (2018); Webster 2.76 m (2012); Baskahegan 4.7 m (2011) | The sim is at the dark end; 3.4–4.4 m is the regional shallow-lake band |
| True colour | 30–60 SPU assumed; "colour ~46" | Skitacook 25 / 22 / 13; Webster 27; Baskahegan 46 (2004) | The sim is on the brown side of the measured band (13–46) |
| Dissolved organic carbon | Not set as a target | 3.85–6.8 mg/L (2012–2017) | New target available |
| Total phosphorus, chlorophyll | Analogue TP 8–12 µg/L, chl 2.5–4 µg/L | TP 7.6–13, chl 1.6–3.9 | Agrees |
| Calcium | Not modelled | 2.1–4.0 mg/L (Pleasant, Skitacook); DEP notes Down East calcium depletion | New context |
| Summer surface peak | 24.0 °C at end of July (`SEASON.TEMP_KNOTS`) | 22.4 °C (Skitacook, Aug 9 2017); 23.5 °C (Webster, Aug 17 2012); statewide August maximum +2.3 °C since 1977 | Agrees for a typical year; warm years run higher |
| Summer bed oxygen | ≥ 5.7 mg/L at the north-basin bottom | 7.3–9.1 mg/L top to bottom in shallow analogues | Agrees (the sim is slightly conservative) |
| Ice-out | ~Apr 23 (2-D calendar); ~Apr 26 in a 3-D run | East Grand 2015–26 mean Apr 23 (range Apr 12–May 2); 2021–26 mean Apr 17–18; West Grand 2015–26 ~Apr 20 | Agrees with the 12-year mean; ~5 days late for the 2020s |
| Ice-on | ~Dec 1 (weakly sourced) | No measured record or trend; ice-on is a named monitoring gap | Unresolved |
| Blooms | None expected | Not on DEP's bloom-risk list; no drainage lake listed | Agrees |
| Invasive plants | None | Not infested; risk 26 (Upper) / 24 (Lower) of 11–87 | Agrees |
| Stocking | None | None in 2015–2025 | Agrees |
| Angler harvest | Bass catch-and-release; 25 white perch | Unchanged in the 2026 law book | Agrees |
| White perch length–weight | W = 0.012·L^3.13 (pinned to MDIFW's "8–10 in ≈ 0.45 lb") | DEP 2011 local fish: 0.70–0.80× the sim's weight at 24–36 cm | The sim is ~25–40% heavy |
| Smallmouth length–weight | Ws: a 0.00743, b 3.20 | DEP 2011: 0.92–0.95× | Agrees |
| Smallmouth spawning | `spawnT` 15–21 °C | Nests above 12.8 °C; spawns at 15.6–18.9 °C, mid-May to mid-June (MDIFW 2021) | Agrees |
| Smallmouth maturity | ~4–5 years | Males 3–4, females 4–5 | Close (males could mature a year earlier) |
| Smallmouth first winter | Emergent (starvation reserve plus cold-water mortality) | Young under ~56 mm do not survive; young reach 56–74 mm by autumn | Testable target |
| Mussel filtration | Poorly constrained (0.05–3.1 L/h in notes) | MDIFW: up to 10 gal/day (~1.6 L/h) | New upper bound |

## Recommended updates

1. **Retarget the 3-D water's clarity to the measured regional band.**
   - Aim for Secchi ~3.5–4.2 m and colour ~25–40 PCU (DOC ~4–5 mg/L), rather than Secchi ~3 m from `KD_COLOUR` 0.5/m.
   - Keep Baskahegan's 46 SPU as the brown end of a sensitivity range.
   - Recheck plant depth limits and bed light after the change.
2. **Give ice-out a realistic year-to-year spread and a "2020s" option.**
   - Keep the Apr 23 mean, which matches East Grand 2015–2026.
   - Draw each year within about Apr 12–May 2 (East Grand's 2015–2026 range).
   - A present-day scenario would centre on Apr 17–18. Leave ice-on at ~Dec 1, flagged as unmeasured.
3. **Allow warm summers.**
   - Keep the 24 °C mean peak: the measured August days in nearby shallow lakes are 22–23.5 °C.
   - Let the weather term reach the 26–28 °C seen in recent heat waves, since DEP measures the August maximum up 2.3 °C since 1977.
   - A "warming" scenario knob of +0.05 °C/yr since 1977 is documented.
4. **Check the white perch length–weight curve.**
   - Local DEP fish (2011) weigh 0.70–0.80× the sim's curve.
   - MDIFW's "8–10 in ≈ 0.45 lb" fits the 10-in end of the DEP fish. Pinning it at 9 in makes the sim's fish heavy.
   - Lowering `a` by about 25% would match both. This touches condition K and the starvation hazards, so test with the young-of-year fate audit.
5. **Add MDIFW's smallmouth first-winter threshold as a gate or audit target.** Young-of-year below ~56 mm in late autumn should rarely reach spring; those of 56–74 mm should. Males may mature at age 3.
6. **Note low calcium (2–4 mg/L)** as a reason for the Holopedium-type zooplankton and slow mussel and crayfish shell growth. It is context only unless the sim adds calcium.
7. **No changes are needed** for the mixed, oxygenated summer bed; no blooms; no invasive plants; no stocking; and bass catch-and-release. Recent data back all of them.
8. **To close the data gap,** ask the human to look at Lakes of Maine for MIDAS 1076 and 1072 in a normal browser. Or write to Lake Stewards of Maine (stewards@lakestewardsofmaine.org) about any volunteer Secchi readings, or about adopting the lakes for monitoring.
