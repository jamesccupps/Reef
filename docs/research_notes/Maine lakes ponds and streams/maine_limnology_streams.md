# Physical & chemical limnology of Maine lakes, ponds and connecting streams (for the Synapse Reef side-view sim)

Scope: values that a 2-D lake simulation needs (basin shape, ice and seasons, light, temperature, oxygen, nutrients, plants, invertebrates, streams, beaver) for eastern/northern Maine, using Upper and Lower Hot Brook Lake (Danforth, Washington/Aroostook counties) as the target system. Compiled 2026-10-15.

Method notes for the report writer:
- lakesofmaine.org returns HTTP 403 to automated fetches. Values attributed to it come from search-result snippets and are marked "(snippet)".
- Several Maine IF&W lake-survey sheets and USGS reports were downloaded and their text extracted directly. Values marked "(computed)" are my own arithmetic on primary tables, for example ice-out means from Hodgkins (2010) and monthly flow ratios from USGS NWIS.
- The web-search budget ran out before ice-on dates, Maine Kd values, zooplankton biomass and polymixis-scaling papers could be searched. Those are listed under Gaps.

---

## 1. The target system: what are Upper and Lower Hot Brook Lake and their connecting stream really like?

### Takeaway
Neither Hot Brook Lake is deep:
- Upper Hot Brook Lake: maximum 18 ft (5.5 m), mean about 11 ft (3.4 m).
- Lower Hot Brook Lake: maximum 13 ft (4.0 m), mean about 9 ft (2.7 m).

Both are flat-bottomed, muddy-bottomed, unstratified warm-water lakes ringed by spruce–fir forest. They are joined by a short (1/8 mile, about 200 m), rocky, hard-bottomed stream with no cold-water habitat. If the sim wants a *deep stratified* lake from the same neighbourhood, the obvious real model is East Grand Lake, which is also in Danforth: 128 ft maximum depth, 16,070 acres, a cold-water fishery.

### Cited Findings
**Upper Hot Brook Lake**
- Location: Danforth and T8 R4 NBPP, Washington Co. — [MDIFW lake survey, Upper Hot Brook Lake](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf)
- Area 912 acres; maximum depth 18 ft. Surface temperature 74 °F (23.3 °C) in the August 1949 survey (revised 1965 and 2004). — same source
- The sheet also prints "75 feet – 71 °F". That depth exceeds the lake's maximum, so it is a template error; the reading is probably a bottom or near-bottom value. — same source
- Habitat, quoted: "a typical warm water lake with excellent spawning and adult habitat for bass, perch, and pickerel. The lake is shallow and does not stratify during summer months." — same source
- Shoreline and bottom: shoreline "mostly rocky with some areas of sand, there is a large sandy beach in the northeast part of the lake, and mud but the lake bottom is mostly muddy". Wetlands lie on the south and west sides. — same source
- Tributaries: several small ones, but "none have any suitable habitat for coldwater fish". The outlet flows to Lower Hot Brook Lake and then to Baskahegan Stream. — same source
- Fishes: smallmouth bass, white perch, yellow perch, chain pickerel, bullhead (hornpout), white sucker, fallfish, blacknose dace, banded killifish, "minnows". Principal fisheries are smallmouth bass, white perch and chain pickerel. The lake is managed for larger-than-average bass, with a 25-fish bag limit on white perch. — same source

**Lower Hot Brook Lake**
- Location: Danforth/T8 R4, Washington Co., and Bancroft, Aroostook Co. — [MDIFW lake survey, Lower Hot Brook Lake](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
- Area 713 acres; maximum depth 13 ft; surface 74 °F; same fish list as Upper. Shallow and does not stratify in summer. — same source
- Shoreline mostly rocky with some sand and mud; bottom mostly muddy; wetlands on the north and east sides; no camps. — same source

**The connecting stream**
- Quoted: the inlet from the upper lake "is rocky and hard bottomed [but] does not contain any suitable habitat for coldwater fish". — [MDIFW Lower Hot Brook Lake](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
- It is a "short (1/8 mile) non-navigable connecting stream". A boater "must be prepared to paddle, pole, or walk a boat through parts of the waterway". — same source

**Lakes of Maine database (snippet)**
- Lower Hot Brook Lake: maximum 13 ft, mean 9 ft, about 684 acres. — [Lakes of Maine, Lower Hot Brook Lake](https://www.lakesofmaine.org/lake-overview.html?m=1072) (snippet)
- Upper Hot Brook Lake: maximum 18 ft, mean 11 ft, about 890 acres. — (snippet, same search)
- The areas differ from the IF&W figures (713 and 912 acres); the depths agree.

**Soundings read from the IF&W maps (computed)**
- Upper: 83 soundings, mostly 10–18 ft. The deepest water (16–18 ft) is in the northern basin; the southern basin is 8–14 ft. Of all soundings, 41% are ≤10 ft (3 m), 78% are ≤13 ft (4 m) and 94% are ≤16 ft (5 m). — [MDIFW Upper map](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf)
- Lower: 63 soundings, mostly 9–12 ft. Of these, 59% are ≤10 ft and 100% are ≤13 ft. — [MDIFW Lower map](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
- Soundings were taken on transects and under-sample the nearshore, so the true shallow fraction is higher.

**East Grand Lake (the deep neighbour)**
- 16,070 acres, maximum depth 128 ft. In September 1952 the surface was 70 °F and 110 ft was 48 °F (8.9 °C). — [MDIFW East Grand Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/aroostook/grand_lake_east.pdf)
- Shoreline: "mostly very rocky with many sand beaches", with "numerous, prominant rocky reefs". — same source
- Water level: annual drawdowns of 6–7 ft "limit the productivity of the area along the shoreline". — same source
- Fishery: salmon, lake trout, smelt, smallmouth bass, white and yellow perch, chain pickerel, redbreast sunfish, burbot, landlocked alewives and others. It drains to the St Croix. — same source

### Inferences
- The brief says "a deep stratified lake, to be extended with a shallow pond and a connecting stream, after Upper/Lower Hot Brook Lake". Taken literally that is two shallow, polymictic, warm-water basins:
  - Upper is the "deeper" one at about 5.5 m, and its mean/max ratio is 0.61.
  - Lower is about 4 m deep, with a mean/max ratio of 0.69.

  These are saucer basins, much flatter than the typical Maine lake (ratio about 0.35; see section 2).

  A faithful Hot Brook pair therefore has no hypolimnion, no cold-water refuge and no summer anoxia in open water.
- A deep stratified main lake is best treated as a separate archetype: the "East Grand-type" deep lake right next door.
- Fish mismatch with the current sim roster:
  - Hot Brook has no pike (eastern Maine's esocid is chain pickerel), no carp and no trout.
  - No sunfish are listed at all. Neighbouring East and West Grand do list redbreast sunfish and pumpkinseed.
  - It does have white perch, white sucker, fallfish and blacknose dace, none of which the sim has.
- The connecting stream is short (about 200 m), riffle-dominated (rocky, hard bottom, shallow enough to wade a boat), and has a warm lake outlet as its source.

### Gaps
- No published modern bathymetry (hypsographic curve), Secchi, colour, TP, chlorophyll or DO profile for either Hot Brook Lake. lakesofmaine.org blocked fetching, and it is not clear that these remote lakes have Volunteer Lake Monitoring Program data.
- No discharge, width or temperature measurements for the Hot Brook connecting stream or outlet.
- The 1949 sheets give only one surface temperature, plus the garbled "75 feet" reading.

---

## 2. Bathymetry, littoral zone, substrates and macrophytes

### Takeaway
Typical Maine lakes:
- Mean depth about 7 m, maximum about 18 m, with mean/max ≈ 0.35 (range 0.21–0.55).
- Most lakes are small: 70% are ≤10 ha.

Shorelines are glacial (rocky, cobble, boulder, sand), with organic muck in coves and in the profundal zone. Plant cover is limited by substrate as much as by light:
- Clear lakes with rocky, gravelly or sandy littoral zones have sparse rooted plants, dominated by *Eriocaulon* (pipewort).
- Coloured lakes are dominated by *Scirpus* (bulrush) and floating-leaved plants.

### Cited Findings
**Maine lake counts and areas**
- 5,782 lakes and ponds with a MIDAS number are tracked by the Maine DEP, totalling 987,019 acres. Of these, 2,313 are "significant" publicly owned lakes covering 958,977 acres. — [Maine DEP 2024 Integrated Report (draft)](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf)
- "70% of Maine lakes are ≤ 10 ha." — [Assessment indices of littoral habitat condition for lakes in Maine and New England (Lake Reserv. Manage. 2023, PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10642257/)

**USGS 43-lake study (1980, with DEP)**
Ranges across the lakes — [USGS WRI 80-69, A limnological study of 43 selected Maine lakes](https://pubs.usgs.gov/wri/1980/0069/report.pdf):

| Measure | Range |
|---|---|
| Surface area | 9.3–2,259 ha (one special-study lake 6,504 ha) |
| Maximum depth | 5.5–51.8 m |
| Mean depth | 2.4–13.7 m |
| Hydraulic residence time | 0.07–7.6 yr |
| Mean Secchi | 1.9–9.0 m |
| Mean TP | 5–14 µg/L |
| Mean chlorophyll a | 1.4–10.6 µg/L |

- Computed from Table 2 of the same report (29 lakes with clean rows): mean/max depth ratio median 0.35, mean 0.37, range 0.21–0.55. Median mean depth 6.7 m; median maximum depth 18.3 m. — same source
- Example lakes, giving mean then maximum depth — same source:

| Lake | Mean depth (m) | Max depth (m) | Ratio |
|---|---|---|---|
| Green Lake | 11.0 | 51.8 | 0.21 |
| Eagle Lake | 13.7 | 42.7 | 0.32 |
| Pushaw Lake | 3.0 | 8.5 | 0.35 |
| Portage Lake | 2.4 | 7.6 | 0.32 |
| Long Pond | 3.0 | 5.5 | 0.55 |

**Littoral habitat study (2023)**
- Design: 102 Maine lakes, 10 shoreline stations per lake, littoral plots 10 m × 15 m. Lakes are split into deep and shallow at a 10 m maximum depth. — [PMC10642257](https://pmc.ncbi.nlm.nih.gov/articles/PMC10642257/)
- Cover classes: absent 0%; sparse 0–10%; moderate 10–40% (Maine splits this into 10–25% and 25–40%); heavy 40–75%; very heavy >75%.
- Deeper lakes generally have steeper littoral slopes, and sand cover rose with shoreland disturbance. — same source

**Macrophyte communities in the 43-lake study**
- Clear lakes (high TSI on that study's inverted scale): "lakes with rocky-gravelly-sandy littoral zones do not usually have abundant populations of rooted aquatic plants … Vegetation in these lakes is usually dominated by sparse populations of *Eriocaulon*." — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Coloured lakes: "Highly colored lakes had plant communities primarily composed of *Scirpus* and floating-leaved plants." *Pontederia* and floating-leaved plants were more abundant in more productive lakes. — same source
- Mapping method: plant stands were mapped in late summer, with density classes A (10–25%) and B (25–50%). Stands under 100 m² or under 10% density were not mapped. One example lake: emergent *Scirpus*, submerged *Isoetes* at 25–50% density, floating *Nuphar*. — same source

**Maximum colonisation depth of macrophytes**
- Light is the primary control. A Secchi–Zc regression from 20 Italian lakes gave Zc = 1.39·SD + 1.37 (R²adj 0.75). Adding lake area (Zc = 1.01·SD + 2.62·log A + 1.36) raised R² to 0.83. — [Azzella et al. 2014, J. Limnol.](https://jlimnol.it/jlimnol/article/download/jlimnol.2014.932/639/3830)
- In those lakes, vascular plants (*Ceratophyllum*) were the deepest plants where Zc was below 8.5 m. Charophytes went deeper: *Chara* at 10–20 m, *Nitella* at 20–26 m. — same source
- Middelboe & Markager (1997) and Schwarz et al. (2000) found the SD–Zc relation is asymptotic. — same source
- The classic North American regressions are Chambers & Kalff 1985 (CJFAS 42:701–709) and Canfield et al. 1985 (J. Aquat. Plant Manage. 23:25–28). — [Azzella et al. 2014 references](https://jlimnol.it/jlimnol/article/download/jlimnol.2014.932/639/3830); [Canfield 1985 at APMS](https://apms.org/?p=9235)

### Inferences
- For a sim basin modelled on a typical Maine lake, use mean/max ≈ 0.35. A Hot Brook-style pond should use ≈ 0.6–0.7 (flat floor, short steep margins).
- The littoral zone (≤3–5 m) covers:
  - most or all of a Hot Brook-type pond: 41–59% of soundings ≤3 m, 78–100% ≤4 m;
  - very roughly 20–40% of a typical deep Maine lake. This is a geometric guess from mean/max ≈ 0.35, not a sourced value.
- Applying the Azzella regression to Maine Secchi values (method borrowed from Italy, so treat as indicative only):
  - Clear lake, SD 7–9 m: Zc ≈ 11–14 m.
  - Typical Maine lake, SD 4.5–5 m: Zc ≈ 7.5–8.5 m.
  - Coloured lake, SD 2–3 m: Zc ≈ 4–5.5 m.
- A Hot Brook-type 4–5 m pond with moderate colour could therefore support rooted plants over essentially its whole bottom wherever the mud allows. The IF&W "excellent spawning habitat for bass, perch, and pickerel" is consistent with this.
- Substrate zonation for the side view:
  - rock, cobble or boulder on exposed shores and points;
  - sand beaches in places (Upper Hot Brook's NE beach);
  - organic muck in coves and on the basin floor (the IF&W sheets say "lake bottom is mostly muddy").

### Gaps
- No Maine-specific hypsographic curves or littoral-area fractions were found. A littoral fraction for Maine lakes would need GIS bathymetry.
- No Maine-measured macrophyte maximum depth, percent cover or biomass (g/m²) was found.
- The exact Chambers & Kalff and Canfield equations could not be verified because the sources were paywalled or returned 403/404.

---

## 3. Climate and ice

### Takeaway
Northern and eastern Maine lakes lose their ice around **late April to the first week of May**:
- West Grand Lake (Washington Co.): long-term mean about Apr 28.
- Aroostook lakes (Eagle, Portage): about May 7.

Ice-out has moved about 4–9 days earlier in the north since the late 1800s, with large year-to-year spread (SD 7–9 days). Ice-on is poorly documented: November–December, and later on large lakes. River ice in central Maine thinned by about 23 cm (46%) between 1912 and 2001.

### Cited Findings
**Ice-out climatology (computed from Hodgkins 2010 tables)**
Julian-day ice-out tables are in [USGS OFR 2010-1214, Historical ice-out dates for 29 lakes in New England, 1807–2008](https://pubs.usgs.gov/of/2010/1214/pdf/ofr2010-1214.pdf). From them (my calculation):

| Lake | Latitude | Record | Mean ice-out | SD | Extremes | 1979–2008 mean |
|---|---|---|---|---|---|---|
| West Grand, Washington Co. | 45.2°N | 1878–2008 | Apr 28 | 8.8 d | Apr 2 – May 19 | Apr 24 (pre-1900 mean May 3) |
| Eagle Lake, Aroostook | 47.0°N | 1922–2008 | May 7 | 6.9 d | Apr 14 – May 23 | May 5 |
| Portage Lake | 46.8°N | — | May 7 | 6.7 d | Apr 14 – May 26 | May 3 |
| Squa Pan Lake | 46.6°N | — | May 2 | 7.0 d | Apr 13 – May 18 | Apr 30 |
| Moosehead | 45.6°N | 1848–2008 | May 8 | 7.8 d | Apr 14 – May 29 | May 3–4 (pre-1900 May 12) |
| Sebec Lake | 45.3°N | — | Apr 29 | — | — | Apr 26 |
| Lake Auburn (central/southern Maine) | — | — | Apr 22 | — | — | Apr 14–15 (pre-1900 Apr 27) |
| Sebago (southern Maine) | — | — | Apr 16 | — | — | about Apr 6 (pre-1900 Apr 24) |

**Ice-out trend**
- Between 1850 and 2000 ice-out moved 9 days earlier in northern and mountainous New England (mainly northern and western Maine) and 16 days earlier farther south. This implies about 2.6 °F of late-winter/early-spring warming. March–April air temperature explains about half of the year-to-year variance. — [USGS FS 2005-3002](https://pubs.usgs.gov/fs/old.2005/3002/)
- Of the 29 lakes, 17 had significantly earlier ice-out, 12 showed no trend and 0 got later. — [Bacon (Maine DEP), LSM 2019 climate case studies](https://www.lakestewardsofmaine.org/wp-content/uploads/2019/08/ClimateChangeCaseStudies.pdf)
- Eagle and Scopan lakes (Aroostook), with records back to the 1920s and 1930s, changed by only 1–2 days. — [Bangor Daily News 2018](https://bangordailynews.com/2018/04/16/environment/milder-winters-shaving-weeks-off-ice-fishing-seasons-in-maine/)

**Recent ice-out examples**
- 2026: West Grand Lake Apr 17; Big Wood Lake Apr 24; Allagash and Chesuncook about May 1. 2025: Mattawamkeag Lake Apr 24; Long Lake (St Agatha) May 5. — [Maine DACF ice-out table](https://www.maine.gov/dacf/parks/water_activities/boating/ice_out_dates.shtml) (snippet)

**Ice-on (freeze-up)**
- Ice-in usually comes in November or December. Warm winters can delay full freeze-over of large lakes to January–February (Lake Stewards of Maine, as reported by the Bangor Daily News). — attributed in a search summary to [BDN coverage](https://www.bangordailynews.com/2025/12/26/outdoors/early-season-ice-unpredictable/). The exact article was not verified.
- Maine has no long ice-in record. A state climatologist said ice-ins are "likely" later, but this is an inference, not documented. — [Observer (Maine) ice-out records article](https://observer-me.com/?p=40575) (snippet)

**Ice thickness**
- Piscataquis River near Dover-Foxcroft, late-February ice thickness, 1912–2001: decreased about 23 cm (about 9 in), about 46%. Thickness correlated with winter air temperature, heating degree days, ice-out and snowmelt centre-of-volume dates (P < 0.01). — [Huntington, Hodgkins & Dudley 2003, Climatic Change 61:217–236 (USGS record)](https://pubs.usgs.gov/publication/70024935); [USGS FS 2005-3003](https://pubs.usgs.gov/publication/fs20053003)
- Over the same period, winter air temperature rose 1.7 °C and heating degree days fell about 7.5% (1900–1999). The river's final ice-out advanced 0.21 days/yr (1931–2002). — same sources
- MDIFW safety guidance for new clear ice: <4 in stay off; 4 in for foot traffic; 5–7 in for snowmobile/ATV; 8–12 in for a car; 12–15 in for a medium truck. White "snow ice" is about half as strong. — [MDIFW ice safety](https://www.maine.gov/ifw/programs-resources/outdoor-safety/ice-safety-tips.html)

**Winter warming and its effects**
- Winter is Maine's fastest-warming season, up about 5 °F from a century ago (Maine Climate Council data cited in news coverage). — [Sun Journal](https://new.sunjournal.com/?p=11032460) (snippet; attribution not verified)
- DEP lists the consequences of shorter ice cover: a longer growing season, earlier warming of the shallows, longer stratification, more deep-water O₂ loss and more sediment nutrient cycling. — [LSM/DEP 2019](https://www.lakestewardsofmaine.org/wp-content/uploads/2019/08/ClimateChangeCaseStudies.pdf)

### Inferences
- For Hot Brook (about 45.6°N, near Danforth, between West Grand and the Aroostook lakes), the nearest long record is West Grand (1979–2008 mean Apr 24). Small shallow lakes usually lose ice a few days before large deep ones, so mid-to-late April is plausible for Hot Brook. Use **ice-out ≈ Apr 20–30, SD ≈ 8 d**.
- In the sim's calendar (year-fraction 0 = Mar 1), Apr 25 ≈ yf 0.15.
- Ice-on for small shallow lakes in northern Maine is probably late November to mid-December (yf ≈ 0.74–0.79). This is an inference from the "Nov–Dec" statement, not a measurement.
- That implies about 135–150 ice days and an open-water season of about 215–230 days.
- The Piscataquis river data imply a late-February thickness of about 50 cm in the early 1900s and about 27 cm recently (derived from "23 cm = 46%"). Lake ice in Washington/Aroostook is probably 30–60 cm by late winter, but this is unsourced, so treat it as a plausible range only.

### Gaps
- No Maine ice-on dataset was obtained. The Lake Stewards of Maine ice-in records and a 2024 *Ecosphere* satellite ice-phenology study of 58 Maine lakes exist, but could not be searched after the budget ran out.
- No measured Maine lake-ice thickness climatology (cm by month).
- No snow-on-ice depth data.

---

## 4. Temperature: surface, thermocline, hypolimnion, polymixis, turnover, under-ice

### Takeaway
- Maine summer surface water is usually **21–26 °C** (August survey sheets: 69–78 °F). Heat waves now push it to **28–30 °C**.
- Deep lakes stratify from about June to late October or early November.
- Hypolimnion temperature depends on lake size: large, wind-exposed deep lakes keep a **9–11 °C** hypolimnion; small sheltered deep ponds stay near **4–5 °C**.
- Lakes shallower than about 8–10 m maximum depth generally do not stratify persistently. Lakes 11–15 m deep develop tiny hypolimnia (about 4–5% of volume).

### Cited Findings
**Survey-sheet temperatures (MDIFW)**

| Waterbody | Depth | Date | Surface | Deeper reading |
|---|---|---|---|---|
| Upper and Lower Hot Brook | 18 / 13 ft max | Aug 1949 | 74 °F | — |
| East Grand | 128 ft max | Sep 1952 | 70 °F | 48 °F at 110 ft (8.9 °C at 33.5 m) |
| West Grand | 128 ft max | Aug 1952 | 73 °F | 52 °F at 100 ft (11.1 °C at 30.5 m) |
| Cold Stream Pond | 205 ac, 62 ft max | Aug 1961 | 69 °F | 40 °F at 60 ft (4.4 °C at 18 m) |
| Great Pond, Cape Elizabeth | 5 ft max | — | 78 °F | 77 °F at 5 ft |
| Sherman's Mill Pond | 6 ft max | — | 77 °F | 74 °F at 6 ft |
| Passaconway Pond | 4 ft max | Aug 1960 | 78 °F | — |

Sources: [Hot Brook Upper](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf) and [Lower](http://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf); [East Grand](https://www.maine.gov/IFW/docs/lake-survey-maps/aroostook/grand_lake_east.pdf); [West Grand](https://www1.maine.gov/IFW/docs/lake-survey-maps/washington/grand_lake_west.pdf); [Cold Stream Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/somerset/cold_stream_pond.pdf); [Great Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/cumberland/great_pond.pdf); [Sherman's Mill Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/knox/shermans_mill_pond.pdf); [Passaconway Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/york/passaconway_pond.pdf)

**Heat-wave extremes**
- Range Ponds, July 12, 2024: surface 28.2, 28.7 and 30.2 °C, with strong stratification in July and August. — [Range Ponds 2024 Water Quality Assessment](https://www.rangeponds.org/s/Range-Ponds-2024-Water-Quality-Assessment-1.pdf)
- The same report claims Maine lake surfaces have reached "the low to mid 80's F" in recent years, "approximately 10 degrees warmer than three decades ago (Source: MDEP Data Summaries)". This is a lake-association claim that I could not verify, and it is probably overstated. — same source

**Stratification extent (USGS 43-lake study, late summer)**
- Of 35 lakes: 6 not stratified; 9 had 1–10% of volume stratified; 6 had 11–25%; 9 had 26–50%; 5 had 51–75%. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Not stratified: Portage (7.6 m max), Pushaw (8.5 m), Long Pond (5.5 m), Molasses Pond (14.3 m max but mean 5.2 m, 507 ha), Spectacle and Lower Shin. — same source
- Only about 4–5% stratified: Forest Lake (11.6 m), Madawaska (11.6 m), Raymond Pond (12.8 m), Brewer (14.6 m). — same source
- Timing: stratification "is established, probably in late June". "As autumn approaches, the thermocline drops and more of the lake bottom comes in contact with the mixed epilimnion". In shallow Pleasant River Lake (17.1 m max, 4.3 m mean), by mid-August "80 to 90 percent of the lake bottom is in contact with the mixed epilimnion". — same source

**Thermocline depths**
- Horseshoe Pond (Kezar watershed): thermocline about 6 m. Kezar's Lower Bay is "too shallow for strong stratification". — [Kezar Lake Watershed Association](https://kezarwatershed.org/water-quality-dissolved-oxygen)
- "In Maine, the thermocline on most lakes is 20–30 feet down" (6–9 m). This is a fishing-guide claim, low quality. — [Tracewski Fishing Adventures](https://fishguideme.com/kevins-magazine-articles/improved-catches-of-trout-and-landlocked-salmon-in-maine-lakes/)
- Colour thins the mixed layer. In small lakes, epilimnion depth ranged from 2.5 m (clearest) to 0.75 m (most coloured), and 91% of the variation was explained by colour. This was found in a search snippet that appears to come from the [Houser 2006 USGS-UMESC record](https://www.umesc.usgs.gov/documents/publications/2006/houser_b_2006.html); the attribution is not verified.
- In Acadia NP lakes, rising DOC reduced epilimnion thickness. — [Strock et al. 2017, JGR-Biogeosciences 122:1022–1035 (record)](https://dickinson.hykucommons.org/concern/generic_works/c8cb805d-c34e-4834-a70b-e6b8ee5892ae); [UMaine thesis](https://digitalcommons.library.umaine.edu/etd/2449)

**Season timing (Lakes Environmental Association sensors on 13 lakes)**
- Thermistors sit every 2 m and log every 15 min. Stratification appears from June to early November, and full mixing in late October to November. — [Maine Lakes (LEA) high-resolution temperature monitoring](https://mainelakes.org/high-resolution-temperature-monitoring/)
- Spring turnover happens when all layers are about 39 °F (4 °C). It takes "weeks for large lakes to days for small, protected lakes". — [Maine Boats, "Layer Cake Lake"](https://www.maineboats.com/node/3175)

**Under-ice conditions (43-lake study)**
- A dilute meltwater layer sits just under the ice: mean specific conductance 12 µS/cm, alkalinity 3 mg/L as CaCO₃. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Under-ice pH was 5.7–6.7 just below the ice and fell 0.1–1.0 units with depth. Summer epilimnion pH was 6.6–7.2 (range 5.9–7.6); stratified hypolimnia were 5.6–6.4. — same source

**Climate trend**
- Shallow Maine lakes that "have undergone little or no stratification in the past are now experiencing this phenomenon to varying degrees". — [Range Ponds 2024](https://www.rangeponds.org/s/Range-Ponds-2024-Water-Quality-Assessment-1.pdf), citing the DEP; [DEP 2019](https://www.lakestewardsofmaine.org/wp-content/uploads/2019/08/ClimateChangeCaseStudies.pdf)

### Inferences
**Sim parameters for a deep Maine lake (East Grand-type)**
- Epilimnion 20–24 °C in late July–August, 26–30 °C in heat waves.
- Thermocline about 5–7 m in July, deepening to about 9–12 m by September. Shallower (2–5 m) in small or coloured lakes.
- Hypolimnion 8–11 °C in large wind-exposed lakes, 4–6 °C in small sheltered deep ponds.
- Stratification onset early-to-late June (yf ≈ 0.27–0.32). Fall turnover late October to mid-November (yf ≈ 0.65–0.70).
- Under ice: inverse stratification, about 0–1 °C under the ice and about 3–4 °C at the bottom (standard limnology; the Kezar page states the 4 °C / 1 °C / 0 °C densities). Add a thin fresh meltwater lens in late winter.

**Hot Brook-type pond (4–5.5 m)**
- Polymictic and well mixed, with a top–bottom difference of about 0–3 °C (compare Great Pond 78/77 °F and Sherman's Mill 77/74 °F).
- August mean about 22–25 °C; heats and cools fast.
- Threshold for persistent stratification in Maine: maximum depth ≈ 8–10 m. That matches the 43-lake data (all lakes under 9 m were unstratified) and the 10 m deep/shallow split in DEP and EPA littoral work. Wind fetch matters too: Molasses Pond at 14 m did not stratify.

### Gaps
- No Maine dataset of modern July–August epilimnion temperature, thermocline depth and hypolimnion temperature was obtained. LSM/DEP profile data exist but are behind the blocked lakesofmaine.org.
- The Kirillin & Shatwell (2016) depth–area scaling for polymixis could not be retrieved.
- No measured under-ice profiles for a Maine lake.

---

## 5. Oxygen: summer hypolimnetic anoxia and winter depletion and winterkill

### Takeaway
Late-summer hypolimnetic O₂ depletion is **common** in stratified Maine lakes:
- In the 1970s 43-lake study, only 7 of about 29 stratified lakes kept more than 5 mg/L in the hypolimnion.
- Most productive lakes fell below 0.5 mg/L.

The DEP says funnel-shaped basins deplete naturally, and that onset is getting earlier. Winterkill in Maine is documented in very shallow, weedy ponds (1.2–1.8 m maximum depth), especially in snowy winters with thick ice or low flow. A 4–5.5 m pond like Hot Brook loses some winter O₂, but nothing found says it has winterkill.

### Cited Findings
**Summer hypolimnion (43-lake study)**
- Of lakes with TSI below 65 (more productive on that study's inverted scale), "only one had hypolimnetic dissolved oxygen greater than 2.0 mg/L, while 67 percent had dissolved oxygen concentrations less than 0.5 mg/L". In stratified lakes with TSI over 70 (the clearest), all hypolimnia were above 2 mg/L. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- "The seven lakes with greater than 5.0 mg/L dissolved oxygen in their hypolimnion are capable of supporting fisheries for landlocked salmon, lake trout, brook trout". — same source
- Lakes with tiny hypolimnia go anoxic. Forest Lake and Brettuns Pond "have very small hypolimnia which are anoxic during late summer", with green sulfur bacteria (*Chlorochromatium*) at the top of the anoxic layer. — same source
- Brewer Lake: hypolimnetic TP was 0.116 mg/L 1 m above the bottom. Epilimnion TP rose from 0.008 to 0.014 mg/L between mid-September and November at turnover, followed by an *Anabaena flos-aquae* bloom: "This pattern of autumnal blue-green blooms following turnover … has been observed on other Maine lakes." — same source
- Pushaw Lake (8.5 m, unstratified) was well oxygenated in summer but "showed depressed oxygen levels during the winter". — same source

**DEP assessment guidance (2024)**
- "Hypolimnetic water in some lakes will develop DO depletion naturally due to the shape of lake bottom. Lakes having a basin morphometry that is more funnel-shaped versus bowl shaped are expected to naturally develop depletion in the late summer because detritus is focused into the deeper regions." — [Maine DEP 2024 IR](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf)
- Historic profiles show "the onset of depletion has occurred earlier in the year over time, persists for a longer duration, and may be of greater magnitude". — same source
- Lake O₂ is assessed from about a month after ice-out to about a month before ice-on. — same source

**Example lakes**
- Horseshoe Pond: O₂ uniform in May, depleted below the thermocline (about 6 m) through summer, almost none below about 9 m by late August, uniform again in October. — [Kezar LWA](https://kezarwatershed.org/water-quality-dissolved-oxygen)
- Thresholds cited on that page: trout 7 ppm; pickerel 2 ppm; "critical" 5 ppm. Ponds deplete more because the volume below the thermocline is small. — same source
- Lower Range Pond, 2024: deep water anoxic (0.0 mg/L) in July and August, and below 2 mg/L at the deep stations on Aug 22. — [Range Ponds 2024](https://www.rangeponds.org/s/Range-Ponds-2024-Water-Quality-Assessment-1.pdf)
- Lake Auburn, 2012: early ice-out, then about 6 in of rain in under 24 h. This led to low deep O₂, sediment P release, a severe bloom and mortality of many lake trout. — same source

**General mechanisms**
- Hypolimnetic O₂ consumption rises linearly with mean hypolimnion thickness up to about 25 m. — [Müller et al., ES&T 2012](https://pubs.acs.org/doi/10.1021/es301422r)
- Stratification strength is the main covariate of O₂ depletion in northern lakes. — [Nature Climate Change 2024](https://www.nature.com/articles/s41558-024-02058-3)

**Winterkill (Maine survey sheets)**
- Passaconway Pond (26 ac, 4 ft maximum): "Winterkill occurs … during the more severe winters"; O₂ was 0.8 ppm in February 1961, used up by "decaying vegetation on the bottom". — [MDIFW](https://www.maine.gov/IFW/docs/lake-survey-maps/york/passaconway_pond.pdf)
- Great Pond, Cape Elizabeth (131 ac, 5 ft maximum, "shallow, weedy"): "susceptible to winter kill … most likely to occur during years of heavy snowfall and thick ice cover". — [MDIFW](https://www.maine.gov/IFW/docs/lake-survey-maps/cumberland/great_pond.pdf)
- Sherman's Mill Pond (37 ac, 6 ft maximum): "susceptible to winter fish kills especially during years when water flows are low". — [MDIFW](https://www.maine.gov/IFW/docs/lake-survey-maps/knox/shermans_mill_pond.pdf)

**Winterkill (general, Minnesota DNR)**
- Trout are most sensitive. Pike and carp are intermediate. Bullheads and fathead minnows are most tolerant.
- Lakes with regular winterkill become bullhead-dominated, and kills are rarely total. Early ice-on, late ice-out and heavy snow raise the risk.
- Source: [Minnesota DNR, What is winterkill?](https://dnr.state.mn.us/areas/fisheries/waterville/winterkill.html)

### Inferences
**Deep lake**
- From late July to September, expect the hypolimnion to fall below 2 mg/L in mesotrophic or coloured lakes and toward 0 mg/L over muck in a funnel-shaped deep hole.
- Clear oligotrophic lakes keep more than 5 mg/L, which is what lets salmon and togue survive.
- Turnover resets O₂ and injects P, which can trigger an autumn cyanobacteria bloom. This is a documented Maine pattern worth simulating.

**Shallow pond**
- Winter: O₂ declines under ice and snow, steepest over organic mud. For depths of 4–5.5 m, use slow depletion and a low but non-lethal minimum in normal winters.
- Reserve true winterkill for ponds of 1–2 m maximum depth, or for extreme snow-cover winters.
- Summer nights: oxygen sags in weed beds are possible but undocumented here.

### Gaps
- No statewide percentage of Maine lakes with summer anoxia. The DEP said it has a depletion model but did not publish counts.
- No under-ice O₂ time series for a Maine pond.
- No information on whether Hot Brook has ever had a winterkill or summer kill.

---

## 6. Colour/DOC, Secchi, light attenuation, trophic status, nutrients and productivity

### Takeaway
Maine lakes are mostly **mesotrophic**, soft-water and moderately coloured:
- Mean true colour about 21 SPU (range 0–197); "coloured" means >25–30 SPU.
- Mean epilimnetic TP about 11 µg/L.
- Statewide Secchi about 4.4–4.9 m (Landsat, 1995–2010).

Of 1,928 trophic-assessed lakes:

| Class | Share by number | Share by area |
|---|---|---|
| Mesotrophic | 58% | 72% |
| Eutrophic | 35% | 16% |
| Oligotrophic | 7% | 12% |

DOC rose for decades in Maine (browning) and may have levelled off recently. Clear low-DOC lakes reach Secchi 9–15 m; moderate-DOC lakes 5–6 m; strongly coloured ones about 2 m.

### Cited Findings
**DEP trophic criteria (long-term means)**
- Oligotrophic: Secchi >8 m, chlorophyll a <1.5 ppb, TP <4.5 ppb, TSI 0–25.
- Mesotrophic: Secchi 4–8 m, chlorophyll a 1.5–7 ppb, TP 4.5–20 ppb, TSI 25–60.
- Eutrophic: Secchi <4 m, chlorophyll a >7 ppb, TP >20 ppb, TSI >60 and/or repeated blooms.
- If colour is above 30 SPU, chlorophyll, DO and professional judgement are used instead of Secchi and TP.
- An algal bloom is defined as Secchi <2 m in uncoloured lakes.
- Source: [Maine DEP 2024 IR Table 4-4](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf)

**DEP trophic distribution (Table 4-31, all lakes; garbled table re-assembled and the totals check)**

| Class | Lakes | Acres |
|---|---|---|
| Eutrophic | 670 | 151,477 |
| Mesotrophic | 1,127 | 667,087 |
| Oligotrophic | 129 | 111,547 |
| Dystrophic | 2 | 34 |
| Total assessed | 1,928 | 930,145 |
| Unknown | 3,852 | 56,807 |

Source: [Maine DEP 2024 IR](https://www.maine.gov/dep/water/monitoring/305b/2024/2024_ME_IntegratedRpt-REPORT-DRAFT.pdf)

**Landsat clarity study (547 lakes)**
- Statewide mean Secchi fell from 4.94 m (1995) to 4.38 m (2010). — [UMaine summary of McCullough, Loftin & Sader (Freshwater Science 2013)](https://elh.umaine.edu/?p=3101)
- Northeastern lakes fell from 5.22 to 4.36 m. — same source
- Oligotrophic share fell from 14.8% to 6.8%; eutrophic share rose from 35.3% to 42.6%. — same source
- Clarity fell in 52 of 63 northeastern and western lakes. — same source

**Statewide averages and thresholds**
- True colour in Maine lakes ranges 0–197 SPU, average 20.7 SPU. — [Lakes of Maine, explanation of lake reports](https://www.lakesofmaine.org/data/Explanation%20of%20Individual%20Lake%20Water%20Quality%20Report%202017.pdf) (snippet)
- Epilimnetic TP ranges 1.0–426 ppb, average 11.2 ppb. — same source (snippet)
- Lakes above 25 SPU are considered coloured. Secchi ≤2 m usually means a severe bloom unless the lake is coloured or turbid. — [LSM distribution of water-quality data](https://lakestewardsofmaine.org/distribution-of-water-quality-data/)
- LSM productivity bands: low Secchi >8 m, TP <4.5, chl <1.5; medium 4–8 m, 4.5–20, 1.5–7; high <4 m, >20, >7. — same source

**Example lakes (colour SPU / Secchi / TP ppb / chl ppb)**
- Moosehead: 20 / 6.7 m / 4 / 1.3 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/0390.htm) (snippet)
- Mooselookmeguntic: 16 / 6.0 m / 6 / 3.7 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/3302.htm) (snippet)
- Great Pond, Belgrade: 14 / 6.0 m / 10 / 4.8 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/5274.htm) (snippet)
- Madawaska Lake (Aroostook): 38 / 3.3 m / 13 / 6.9 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/1802.htm) (snippet)
- China Lake: 28 / 3.9 m / 18 / 11.0 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/5448.htm) (snippet)
- Hermon Pond: 73 / 2.2 m / 31 / 22.7 — [Lakes of Maine](https://www.lakesofmaine.org/data/texts/2286.htm) (snippet)
- Great East Lake: Secchi 9.2 m, median TP 6.4, chl 1.2 — [Wikipedia, citing station data 1974–2008](https://en.wikipedia.org/wiki/Great_East_Lake)

**DOC, browning and transparency**
- Concentrations of DOC "increased across lakes of Maine for several decades before stabilizing or decreasing in recent years". Low-DOC lakes had mean Secchi 9–15 m versus 5–6 m in moderate-DOC lakes. — [UMaine MS thesis, 2021 (Saros lab)](https://digitalcommons.library.umaine.edu/etd/3454) (snippet; repository since retired)
- Acadia NP lakes since 1995: transparency fell while DOC rose and chlorophyll stayed stable. The decline was −0.3 m/yr in clear lakes versus −0.1 m/yr in brown lakes. — [Strock et al. 2017 record](https://dickinson.hykucommons.org/concern/generic_works/c8cb805d-c34e-4834-a70b-e6b8ee5892ae)
- About 25 Acadia lakes with 40 years of Secchi data: an inverted Secchi→DOC model reproduces measured DOC with RMS error <1.3 mg C/L. — [Roesler & Culbertson 2016 (USGS)](https://pubs.usgs.gov/publication/70161733)
- Storm response (six lakes): some show a DOC spike that recedes within days, some show a sustained rise, and the largest lakes show no change. — [Warner & Saros 2019, Water Research (UMaine summary)](https://elh.umaine.edu/?p=11575)
- Regional comparison: Adirondack DOC rose about 0.5 mg/L per decade (1994–2012), and browning is linked to recovery from acidification. — [Rose & Stetler, NALMS LakeLine 40(1)](https://www.nalms.org/wp-content/uploads/2020/04/40-1-4.pdf)
- Weather drives clarity: summer Secchi is inversely related to colour and to January–June precipitation, and lakes are clearer in drought years. — [Bacon & Williams analysis cited in Range Ponds 2024](https://www.rangeponds.org/s/Range-Ponds-2024-Water-Quality-Assessment-1.pdf); [citizen-monitoring paper on ResearchGate](https://www.researchgate.net/publication/293010805_Monitoring_by_citizen_scientists_demonstrates_water_clarity_of_Maine_USA_lakes_is_stable_not_declining_due_to_cultural_eutrophication)

**Nutrients and seasonal plankton (43-lake study)**
- "Most Maine lakes have significant nitrogen, so phosphorus is the nutrient most limiting". — [LSM indicators page](https://www.lakestewardsofmaine.org/volunteer-programs-tools/water-quality-monitoring/understanding-water-quality-indicators/)
- Forest Lake: diatoms were 86% of total cell area in June and 14% in July. Epilimnetic silica was 0.3 mg/L in September, followed by an October diatom maximum after turnover. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Spring and autumn diatom peaks with a midsummer minimum are typical; this was attributed to silica depletion and settling. — same source
- In lakes with colour >30 units, "phosphorus is tied up with the color producing compounds", and TP and Secchi overestimate productivity. — same source

### Inferences
**Light (Kd)**
- No Maine Kd(PAR) values were found. The common Poole–Atkins rule of thumb is Kd ≈ 1.7/SD (found only on a low-quality source). It gives:

| Lake type | Secchi | Kd (m⁻¹) |
|---|---|---|
| Clear oligotrophic | 9 m | ≈ 0.19 |
| Typical Maine | 4.5–5 m | ≈ 0.35–0.38 |
| Coloured (40–70 SPU) | 2–3 m | ≈ 0.6–0.85 |

- Use colour/DOC, not only phytoplankton, as the main control on attenuation in coloured lakes.

**Hot Brook pond defaults**
- It has spruce–fir and wetland edges and a muddy bottom, and is shallow and warm-water. Plausible but unmeasured values: colour 30–60 SPU, Secchi 2.5–4 m (likely to the bottom in places), TP 10–20 µg/L, chl 3–8 µg/L, i.e. mesotrophic and coloured. This is an inference from regional analogues such as Madawaska.

**Deep lake default (East Grand-type)**
- Colour 10–25 SPU, Secchi 5–8 m, TP 5–8 µg/L, chl 1.5–4 µg/L.

**Seasonal chlorophyll cycle**
- Spring diatom peak after ice-out, midsummer minimum (Si limitation), and an autumn diatom or cyanobacteria peak after turnover.

### Gaps
- No measured Maine Kd or PAR values.
- Did not get the statewide distribution histograms for Secchi and chlorophyll (images only) or the National Lakes Assessment Northeast results.
- No primary-production rates (mg C/m²/d) for Maine lakes.
- No DOC (mg/L) distribution for Maine lakes. A rough DOC ≈ colour relation is not sourced here.

---

## 7. Zooplankton, zoobenthos, littoral invertebrates, crayfish and snails

### Takeaway
Maine-specific zooplankton numbers are scarce:
- Communities are the usual northeastern soft-water mix: Daphniidae, *Bosmina*, *Holopedium*, calanoid and cyclopoid copepods, *Conochilus* and *Asplanchna* rotifers.
- Alewife predation strongly suppresses *Daphnia* and shrinks its size during the summer.
- The deep-lake profundal is dominated by *Chaoborus*, *Chironomus*, *Procladius* and tubificid worms, especially where the hypolimnion goes anoxic.

Crayfish: the native virile crayfish (*Faxonius virilis*) makes up 94% of stream catches, with *F. limosus* and *F. immunis* the others. Rusty crayfish (*F. rusticus*) and red swamp crayfish are the flagged invaders.

### Cited Findings
**Zooplankton**
- Damariscotta Lake, June–October 2008: eight groups recorded — Cyclopoida, Calanoida, Daphniidae, *Bosmina*, copepod nauplii, Asplanchnidae, *Conochilus*, *Holopedium*. Daphniidae were "initially abundant, then dropped sharply after juvenile alewives appeared". Nauplii increased greatly. Plankton were more abundant and larger in the north basin. No densities were given. — [Blair-Glantz, Wilson & Willis, GSA NE 2009](https://gsa.confex.com/gsa/2009NE/webprogram/Paper155679.html)
- Maine DEP alewife study (Sebasticook Lake, Webber and Threemile ponds vs China Lake): "in Sebasticook Lake, Daphnia decreases in size each successive month". — [DEP Alewife-Plankton Summary 2011](https://www.gulfofmaine.org/kb/files/9954/Alewife-Plankton%20Summary%20Report%202011a.pdf) (snippet; the file now returns 404)
- In soft-water boreal lakes with falling calcium (Ontario, Nova Scotia, Adirondacks), jelly-clad *Holopedium* is replacing calcium-rich *Daphnia*. — [PEARL, Queen's University](https://www.queensu.ca/pearl/media/jellification/jellification_pics.php)
- Maine lakes are soft water: meltwater conductance 12 µS/cm, alkalinity about 3 mg/L, summer epilimnion pH 6.6–7.2. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- Littoral and pelagic zooplankton were compared in 8 Maine lakes in July 2021 (results not retrieved). — [USM Thinking Matters poster 2022](https://digitalcommons.usm.maine.edu/thinking-matters-symposium/2022/poster_presentations/57)

**Profundal zoobenthos (43-lake study, deep-basin dredges)**
- Taxa recorded: Annelida (*Limnodrilus*, *Tubifex*/*Peloscolex*, *Lumbriculus*, *Nais*), Ostracoda, Amphipoda (*Hyalella azteca*), Ephemeroptera (*Hexagenia*), Diptera (*Procladius*, *Chironomus*, *Tanypus*, *Ablabesmyia*, *Dicrotendipes*, *Conchapelopia*), Mollusca. — [USGS WRI 80-69](https://pubs.usgs.gov/wri/1980/0069/report.pdf)
- "Lakes with anaerobic hypolimnia during winter months were essentially limited to populations of *Chaoborus* spp., *Chironomus* sp., *Procladius* sp., and certain Annelids". — same source
- *Chaoborus punctipennis* was "numerically abundant in all lakes except the deeper ones (>40 m)". It was the only organism in Nubble Pond. Its migration lets it escape anoxia but limits it to the shallow part of the hypolimnion. — same source

**Littoral snails (DEP biomonitoring)**
- Snails were about 28% of abundance in a 2024 Pemadumcook Lake sample (*Fossaria*, *Gyraulus*), about 7% in North Twin Lake and few in Ripogenus. — [Maine DEP Penobscot hydro water-quality certification reports](https://www.maine.gov/dep/ftp/HYDRO/WaterQualityCertifications/Ripogenus-PenobMills/Water%20Quality/2025-01-03%20SB-2023-407.pdf) (snippet; which report holds which lake was not verified)

**Crayfish**
- 2007–2008 MDIFW brook-trout stream surveys: crayfish presence assessed at 1,061 stream sites plus 13 USM sites. Catch was *O. virilis* (native) 94%, *O. limosus* 5.0%, *O. immunis* 1.0%. "Low crayfish diversity along with little habitat overlap" could leave Maine open to invasion. — [Marquis, Wilson & Gallagher, GSA NE 2009](https://gsa.confex.com/gsa/2009NE/webprogram/Paper155692.html)
- Rusty crayfish (*Orconectes/Faxonius rusticus*) and red swamp crayfish (*Procambarus clarkii*) are considered by state experts to "pose the greatest threat to native ecosystems". The statewide distribution "is not fully known", and LSM refers to a "*Faxonius quinebaugensis* problem" (not explained). — [LSM crayfish program](https://lakestewardsofmaine.org/volunteer-programs-tools/crayfish)
- Rusty crayfish "have been in Maine for several decades", probably brought by non-resident anglers as bait and spread by bait dealers. — [LSM, Invasive Crayfish Threaten Maine Ecosystems](https://lakestewardsofmaine.org/wp-content/uploads/2015/08/1.-Invasive-Crayfish-Threaten-Maine-Ecosystems.pdf) (snippet)

### Inferences
- For the sim, Maine lake zooplankton is a soft-water assemblage in which *Holopedium* is a realistic competitor to *Daphnia*, and planktivore pressure from alewife, smelt, young perch and white perch drives *Daphnia* size down through the summer.
- Biomass values must come from general northeastern literature; see `docs/ECOLOGY_RESEARCH.md`.
- Deep-lake benthos should shift to *Chaoborus*/*Chironomus*/tubificids below the oxycline. Shallow muddy ponds like Hot Brook should support a mixed chironomid, oligochaete, *Hyalella*, snail and possibly *Hexagenia* fauna.
- Crayfish: the native virile crayfish is the default. Rusty crayfish is the realistic "invader" scenario.

### Gaps
- No Maine zooplankton biomass (µg dry weight/L) or density (ind/L) values. EPA EMAP-Northeast and National Lakes Assessment zooplankton data could not be searched.
- No littoral invertebrate densities (ind/m²) or snail species lists for Maine lakes.
- Crayfish densities in Maine lakes not found.
- The current Maine status of rusty crayfish (which lakes; whether in Washington or Aroostook) is unknown.

---

## 8. Streams connecting lakes: size, pools and riffles, temperature, discharge, fish movement

### Takeaway
**Channel size.** Maine regional curves give bankfull width ≈ 7.67·DA^0.52 ft and mean depth ≈ 0.594·DA^0.34 ft (DA in mi²). A 5–20 mi² drainage gives a stream 5–11 m wide and 0.3–0.5 m deep at bankfull.

**Flow.** Snowmelt-dominated:
- An April freshet of about 2–3.3× the mean annual flow.
- August–September lows of about 0.3× the mean (the Mattawamkeag, Hot Brook's downstream basin).
- A secondary November–December rise.

**Temperature.** Lake outlets carry warm surface water, while spring-fed inlets and springs act as cold refuges. In the Rapid River (a lake-to-lake connector), trout fled more than 1 km to thermal refuges in ponds once river water topped 25 °C, while smallmouth bass stayed in the warm river.

**Barriers.** Falls and dams strongly control which fish move between lakes.

### Cited Findings
**Channel geometry (coastal and central Maine regional curves)**
- Qbkf = 5.19·DA^1.05 cfs; wbkf = 7.67·DA^0.52 ft; dbkf = 0.594·DA^0.34 ft; Abkf = 4.55·DA^0.86 ft². Valid for DA in mi²; Maine DOT gives the valid range as 2.92–298 mi². — [Dudley 2004, USGS SIR 2004-5042](https://pubs.usgs.gov/sir/2004/5042/pdf/sir2004-5042.pdf); range from [MaineDOT sizing sheet](https://www.maine.gov/dot/sites/maine.gov.dot/files/dot-project-documents/hr21924.00b.pdf) (snippet)
- Computed from those equations:

| Drainage area | Bankfull width | Bankfull depth | Qbkf |
|---|---|---|---|
| 2 mi² (5 km²) | 3.4 m | 0.23 m | 0.30 m³/s |
| 5 mi² | 5.4 m | 0.31 m | 0.80 m³/s |
| 10 mi² | 7.7 m | 0.40 m | 1.65 m³/s |
| 20 mi² | 11.1 m | 0.50 m | 3.4 m³/s |

- Bankfull flow is "roughly three times" the mean annual flow and is equalled or exceeded about 8.1% of the time (about 30 days/yr). — [Dudley 2004](https://pubs.usgs.gov/sir/2004/5042/pdf/sir2004-5042.pdf)
- Of the downstream increase in flow, 50% goes into width, 32% into depth and 18% into velocity. — same source

**Discharge seasonality (computed from USGS NWIS monthly means; ratio = month ÷ mean annual flow)**
- Mattawamkeag River near Mattawamkeag (01030500): 1,419 mi², 1934–2026, annual mean about 2,620 cfs (1.85 cfs/mi², about 640 mm/yr runoff).
  - Jan 0.61; Feb 0.49; Mar 0.95; **Apr 3.31**; May 1.99; Jun 0.75; Jul 0.42; **Aug 0.30; Sep 0.32**; Oct 0.60; Nov 1.13; Dec 1.13.
  - Lowest monthly mean on record: 38.6 cfs (September), about 1.5% of the mean.
  - Source: [USGS NWIS monthly statistics, 01030500](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030500&statReportType=monthly&statTypeCd=mean&parameterCd=00060)
- Narraguagus River at Cherryfield (01022500): 227 mi², coastal Washington Co.
  - Apr 2.38; Aug 0.27; Sep 0.34; Dec 1.39.
  - Source: [USGS NWIS 01022500](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01022500&statReportType=monthly&statTypeCd=mean&parameterCd=00060)
- Libby Brook near Northfield (01021470): 6.42 mi², 2000–2024, a small Washington Co. brook.
  - Apr 1.83; Jul–Sep about 0.48–0.54; Dec 1.32. Annual mean about 16 cfs.
  - Source: [USGS NWIS 01021470](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01021470&statReportType=monthly&statTypeCd=mean&parameterCd=00060)

**Flow-timing trends**
- Winter–spring centre-of-volume dates are 1–2 weeks earlier over the last 30 years in northern and mountainous New England. All 11 snowmelt-dominated gauges show significant earlier trends. The Piscataquis is about 2 weeks earlier than in 1970. — [USGS FS 2005-3019 (Hodgkins & Dudley)](https://pubs.usgs.gov/fs/2005/3019)
- North of 44°N, timing moved 4–9 days earlier. — [Hodgkins & Dudley 2006](https://water.usgs.gov/climate_water/hodgkins_dudley_2006b.pdf)
- Few significant trends in the timing or size of summer low flows in coastal Maine. Summer lows track summer rain and fall/winter flows, not snowmelt timing. — [USGS SIR 2005-5021](https://pubs.usgs.gov/sir/2005/5021) (snippet; exact report attribution not verified)

**Stream temperature**
- Brook trout prefer water below 20 °C and stop growing above 20 °C. Seven-day maximum mean temperatures of 22.5 °C (Eaton 1995) and 23.3 °C (Wehrly 2007) are harmful. — quoted in a search result, probably [Water 9(10):732](https://www.mdpi.com/2073-4441/9/10/732) (attribution not verified)
- Maine Ch. 582 discharge rule uses EPA criteria of 23 °C maximum and 19 °C weekly average. — (snippet, same search; source not pinned)
- Hart Brook (Lewiston): summer temperatures 15.8–20.0 °C at five sites. — [Maine DEP VRMP Hart Brook 2013](https://www.maine.gov/dep/water/monitoring/rivers_and_streams/vrmp/reports/2013/Hart%20Brook_2013_Report.pdf) (snippet)
- Headwater harvest with 0–36 ft buffers raised western Maine stream temperatures by 1.0–4.4 °C. — [AFS 2015 abstract](https://afs.confex.com/afs/2015/webprogram/Paper20627.html) (snippet)
- MDIFW runs more than 300 stream temperature stations logging every 30 min (since 2014). — [MDIFW blog](https://www.maine.gov/ifw/blogs/mdifw-blog/maine-stream-temperature-monitoring-and-modelling-network)

**Outlets warm, inlets and springs cold (MDIFW survey sheets)**
- Trout Pond (Lowell): the slow, muddy outlet is warm in summer; trout gather at spring and inlet cold water. — [MDIFW Trout Pond](https://www.maine.gov/ifw/docs/lake-survey-maps/penobscot/trout_pond_lowell.pdf) (snippet)
- Alder Pond: trout spawn in the outlet, and two spring-fed tributaries serve as heat refuges. — [MDIFW Alder Pond](https://www.maine.gov/ifw/docs/lake-survey-maps/somerset/alder_pond.pdf) (snippet)
- Cold Stream Pond: the outlet "is a mass of boulders through which the water trickles for some distance before it forms a visible stream". — [MDIFW](https://www.maine.gov/IFW/docs/lake-survey-maps/somerset/cold_stream_pond.pdf)

**Rapid River (Richardson Lakes to Umbagog): a lake–stream–lake system**

*Physical setting* — [MDIFW Rapid River report 2011](http://www.maine.gov/ifw/docs/fisheries-reports/2011/rapidriver.pdf)
- 3.2 miles long. Pond in the River (512 acres; mean 19 ft, maximum 40 ft) lies 0.6 miles below Middle Dam.
- Trout use Pond in the River "for summer temperature refuge and over-wintering".
- Umbagog (7,850 ac) is "largely homothermous" and warm-water, but is overwintering habitat for brook trout.
- Smallmouth bass were introduced illegally to Umbagog in the 1980s and "have since migrated to other connecting waters". Middle Dam blocks their spread upstream.

*Bass spawning and flows* — same source
- Bass spawn in late June to early July.
- More nests are built in flow-vulnerable spots when flow is 400–800 cfs. Pulses of 1,200 cfs for 10 h or more at night are used to disrupt spawning.

*Telemetry, summer 2005* — [Jackson & Zydlewski 2009, J. Freshwater Ecol. (USGS record)](https://pubs.usgs.gov/publication/70171380)
- 96% of brook trout and 72% of landlocked salmon made long moves (>1 km) to open water between June 28 and July 4.
- They then stayed in presumed thermal refugia from July 5 to September 16, while river temperatures exceeded 25 °C.
- 68% of smallmouth bass made no long moves and stayed in the mainstem.

**Barriers**
- The Big Musquash Stream outlet has a mile-long run of falls and fast water that has blocked bass for more than a century. — [Wired2Fish](https://www.wired2fish.com/news/emergency-rule-enacted-to-eliminate-bass-from-maine-lake)
- Tobey Falls, about 4.5 miles above Sebec Lake, blocks salmonids; only American eels pass it. The outlet dam has no upstream passage. — [MDIFW Sebec Lake 2013](https://www.maine.gov/ifw/docs/fisheries-reports/2013/sebeclake.pdf)
- The Maine fisheries plan says charr use of rivers and streams, where it occurs, is "limited to short-term, seasonal movement between connected waters", and that smallmouth bass thrive in lakes, large rivers and streams. — [MDIFW Fisheries Plan species assessments](https://www.maine.gov/ifw/docs/21-MDIFW-8-Fisheries-Plan_V3.pdf) (snippet)

**Lake-outlet invertebrates**
- Hydropsychid caddis density was 6,500/m² at a lake outlet, 1,427/m² at 200 m and 209/m² at 3,400 m downstream. This was driven by seston food quality (protein, ATP). — [Glacier NP outlet study](https://umimpact.umt.edu/en/publications/food-quality-and-hydropsychid-caddisfly-density-in-a-lake-outlet-) (snippet)
- In Swedish outlets, filter feeders and blackflies often peak a short distance below the lake (a quadratic rather than linear decline). — [Limnologica 2001](https://www.limnology-journal.org/articles/limn/abs/2001/03/limno20013p199/limno20013p199.html) (snippet)

### Inferences
**A Hot Brook-style connecting stream for the sim**
- About 200 m long, riffle-dominated, rocky with cobble and boulder, perhaps 3–8 m wide and 0.2–0.5 m deep at bankfull. In late summer it is much shallower: about 0.3× mean flow, so mostly trickling riffles with a few pools.
- Summer temperature should track Upper Hot Brook's surface (about 22–26 °C). There is no cold refuge; IF&W says there is no cold-water habitat.
- A cold inlet brook (spring-fed, shaded) would run about 14–20 °C in summer.

**Flow regime multipliers (Mattawamkeag pattern)**
- Peak in April (×3), recession through June, minimum August–September (×0.3), fall rise November–December (×1.1).
- Ice-covered February flow is low (×0.5).
- Small streams are flashier but have the same pattern; Libby Brook is damped by its pond and wetland storage.

**Fish movement**
- Supported by Maine evidence:
  - bass and other warm-water fish dispersing through connectors unless blocked by falls or dams;
  - trout seeking cold ponds or springs in summer and deep water in winter;
  - spring spawning use of streams.
- Spawning runs of white sucker and smelt into inlets at ice-out are widely known but **not sourced here**.
- The idea that "sunfish gather in warm outlet pools" is plausible but has **no source found**.

### Gaps
- No Maine study of lake-outlet thermal regimes (how far downstream warm lake water persists) or of sunfish, perch or pickerel use of outlet pools.
- Spawning-run data (white sucker, rainbow smelt, yellow perch, chain pickerel into inlets and outlets, April–May in Maine) could not be searched after the budget ran out.
- No pool/riffle ratios or wetted widths for small eastern Maine streams.
- No data on Baskahegan Stream or Hot Brook flows; the Hot Brook drainage area was not found.

---

## 9. Beaver dams in Maine stream–pond systems

### Takeaway
Beaver are abundant in Maine:
- Colony density in south-central Maine was 0.15–0.32 colonies/km², doubling within a few years of a trapping closure.
- Open water area rose 36% where beaver were left alone.

Beaver ponds both help and hurt trout. They give deep water and larger fish where the catchment is big enough (≥2.9 km²), but they warm the water in summer and block migration.

### Cited Findings
- South-central Maine, 1988–92 (111 km² site):
  - untrapped site: colony density rose from 0.15 to 0.32/km² (+113%); dams correlated with colony density (r = 0.99); water surface area rose from 115 to 158 ha (+36%);
  - trapped site: colony density stayed at 0.19–0.20/km².
  - Source: [McCall et al. 1996, Wetlands 16:163–172](https://pure.psu.edu/en/publications/beaver-populations-and-their-relation-to-wetland-habitat-and-bree/)
- Ontario beaver ponds: brook trout were present in 40% of 50 ponds and never in ponds with an upstream catchment under 2.9 km². Pond trout were on average 105 mm and 72 g larger than stream trout. — [Parker 2006, Lakehead MSc thesis](https://knowledgecommons.lakeheadu.ca/jspui/bitstream/2453/3680/1/ParkerS2006m-1a.pdf) (snippet)
- Wisconsin: impoundments act as "heat collecting units in summer and cold storage units in winter" and can favour fish that compete with trout. — [Wisconsin DNR report](https://asset.library.wisc.edu/1711.dl/MCHFK7OXO3DXD8Y/E/file-da134.pdf?dl) (snippet)
- Montana: beaver dam analogues caused no significant change in trout density, growth or survival. — [UMT dissertation](https://scholarworks.umt.edu/etd/12218) (snippet)
- Lithuania: 0.81 dams/km in larger (>0.5 m³/s) streams, and Atlantic salmon parr fell below dams. — [Kesminas et al., PMC4391911](https://pmc.ncbi.nlm.nih.gov/articles/PMC4391911/)
- Down East Maine: beaver numbers have increased on some rivers, and dams can block adult Atlantic salmon. — [BDN blog archive](https://archive.bdnblogs.com/?p=459022) (snippet; trade-press-style piece, not verified)

### Inferences
- In a Hot Brook-type stream–pond landscape, a beaver dam on the connecting stream or an inlet is realistic. Its effects would be to:
  - raise and warm a small pond;
  - add standing dead wood and flooded vegetation;
  - turn the riffle into a slack, mucky impoundment;
  - partially block fish passage at low flow (passable at high spring flows).
- A plausible density for an eastern Maine forest landscape is about 0.2–0.3 colonies/km², which implies one or more active dams per few km of small stream. That last figure is not sourced for Maine (the per-km value is Lithuanian).

### Gaps
- No Maine dams-per-km of stream, dam lifespan or pond-area statistics.
- No Maine study of beaver effects on warm-water fish or on lake–lake connectivity.

---

## Search-budget note
The web-search budget for this session ran out before these could be searched:
- ice-on dates (Lake Stewards ice-in data; the 2024 *Ecosphere* Maine satellite ice study);
- Maine Kd and PAR;
- zooplankton biomass (EMAP-NE, National Lakes Assessment);
- spawning runs into inlet streams;
- polymixis scaling (Kirillin & Shatwell 2016).

A follow-up session could close those gaps. lakesofmaine.org (per-lake Secchi, colour, TP, chl, DO, temperature and bathymetry) blocks automated fetching and would need a manual browser visit or a data download from Maine DEP.
