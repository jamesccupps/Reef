# Weather and catchment hydrology of Maine / New England lakes, ponds and small streams

Scope: how rain, snow, snowmelt, runoff, water level, wind and snow on ice drive a northern/eastern Maine lake (Hot Brook, Danforth, Washington Co.), its outlet stream and a small pond through the year, with numbers for building mechanisms. Region is flagged on every number: **[ME-N]** northern/eastern Maine, **[ME]** elsewhere in Maine, **[NE]** other New England, **[N-temp]** other northern temperate or arctic lakes.

Method note: several numbers below were computed by me from primary government data services rather than read from a report: NOAA NCEI 1991–2020 normals (Houlton, Caribou, Millinocket), NOAA Atlas 14 point precipitation frequency for Danforth (45.66 N, 67.87 W), and USGS NWIS daily, monthly and peak-flow records for northern/eastern Maine gauges. The source links point to those data services, and the computation is described where it is used.

Hydrologic setting: the Hot Brook lakes drain into Baskahegan Stream ([Maine IFW lake survey, Upper Hot Brook Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [Lower Hot Brook Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)). Baskahegan Stream drains to the Mattawamkeag River, so the Mattawamkeag gauge (USGS 01030500) integrates the Hot Brook catchment. Its neighbour, Wytopitlock Stream (USGS 01030350, 127 km²), is the closest small gauged stream. Upper Hot Brook Lake is about 912 acres (3.7 km²) and Lower Hot Brook about 713 acres. A short (about 1/8 mile) non-navigable stream joins them ([Maine IFW survey summary via search](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf)).

---

## 1. Precipitation climate of northern/eastern Maine (rain, snow, rain days, storm sizes, snowpack, snowmelt timing)

### Takeaway
Precipitation is spread evenly through the year: about 1,000–1,080 mm/yr, falling as 50–105 mm in each month, with no dry season. The wettest months are June, July and October and the driest is February. Measurable precipitation falls on about 40 % of days, but only about 7 days a year bring ≥25 mm. In the north, about 300 cm of snow builds a pack that lasts about 4.5 months; it peaks about 1 March at a median depth of about 53 cm, holds about 230 mm of water, and melts out from late March to late April. Half of the January–June runoff has passed by about 15–18 April.

### Cited Findings
**Monthly precipitation, 1991–2020 normals, Houlton Intl Airport [ME-N]** (in → mm). Jan 2.65 (67), Feb 1.95 (50), Mar 2.67 (68), Apr 2.94 (75), May 3.46 (88), Jun 4.04 (103), Jul 3.63 (92), Aug 3.52 (89), Sep 3.40 (86), Oct 4.04 (103), Nov 3.61 (92), Dec 3.37 (86). Annual 39.28 in (998 mm). — [NOAA NCEI 1991–2020 monthly normals, USW00014609](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00014609&format=csv&dataTypes=MLY-PRCP-NORMAL)

**Annual precipitation at the other stations [ME-N].**
- Caribou: 40.70 in (1,034 mm).
- Millinocket: 42.60 in (1,082 mm).
- Source: [NOAA NCEI 1991–2020 annual normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=USW00014607,USW00014609,USW00014610&format=csv&startDate=0001-01-01&endDate=9996-12-31)
- An older (1971–2010) Houlton normal of 38.63 in, and 41.34 in at Houlton 5N, agree with these. — [Maine: An Encyclopedia, normal precipitation](https://maineanencyclopedia.com/normal-precipitation)

**Days per year at or above each precipitation threshold, Houlton [ME-N].**
| Threshold | Days/yr |
|---|---|
| ≥0.01 in (0.25 mm) | 143.9 |
| ≥0.10 in (2.5 mm) | 83.7 |
| ≥0.25 in (6.4 mm) | 50.5 |
| ≥0.50 in (12.7 mm) | 25.1 |
| ≥1.00 in (25.4 mm) | 6.9 |
| ≥2.00 in (51 mm) | 0.8 |
| ≥4.00 in | 0.0 |

Millinocket is somewhat wetter in the tail: 9.4 days ≥1 in, 1.4 days ≥2 in and 0.1 days ≥4 in. — [NOAA NCEI 1991–2020 annual normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=USW00014607,USW00014609,USW00014610&format=csv&startDate=0001-01-01&endDate=9996-12-31)

**Monthly days ≥0.10 in, Houlton [ME-N].** Jan 5.8, Feb 5.0, Mar 6.4, Apr 7.5, May 8.6, Jun 8.1, Jul 7.7, Aug 6.7, Sep 6.1, Oct 7.5, Nov 7.1, Dec 7.2.
- Days ≥0.50 in: 1.2 (Feb) to 2.7 (Jun and Nov).
- Days ≥1.00 in: 0.2 (Feb) to 1.1 (Oct).
- Source: [NOAA NCEI monthly normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00014609&format=csv&dataTypes=MLY-PRCP-AVGNDS-GE010HI,MLY-PRCP-AVGNDS-GE050HI,MLY-PRCP-AVGNDS-GE100HI)

**Storm depths for Danforth, NOAA Atlas 14 (partial-duration series, mm) [ME-N].**
| Duration | 1-yr | 2-yr | 5-yr | 10-yr | 25-yr | 50-yr | 100-yr |
|---|---|---|---|---|---|---|---|
| 1 h | 16 | 21 | 27 | 33 | 41 | – | 53 |
| 6 h | 37 | 43 | 52 | 60 | – | – | – |
| 24 h | 57 | 65 | 79 | 91 | 107 | 120 | 132 |
| 2 days | 66 | 76 | 92 | 106 | – | – | 154 |
| 7 days | 94 | 105 | – | – | – | – | – |

Source: [NOAA Atlas 14 PFDS point query, Danforth](https://hdsc.nws.noaa.gov/cgi-bin/new/cgi_readH5.py?lat=45.66&lon=-67.87&type=pf&data=depth&units=metric&series=pds); [PFDS Maine map](https://hdsc.nws.noaa.gov/pfds/pfds_map_cont.html?bkmrk=me)

**Snowfall, Caribou 1991–2020 [ME-N].** Annual 118.2 in (300 cm).
- By month: Oct 1.7 in, Nov 10.4, Dec 25.2, Jan 25.0, Feb 25.3, Mar 21.4, Apr 8.3, May 0.8.
- Days with snow depth ≥1 in: 135.7/yr. Days ≥10 in: 77.6/yr. Days ≥20 in: 36.2/yr.
- Source: [NOAA NCEI 1991–2020 normals, USW00014607](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=USW00014607&format=csv&startDate=0001-01-01&endDate=9996-12-31)

**Older Houlton snowfall means [ME-N]** (period not verified): Jan 22.8 in, Feb 17.7, Mar 18.2, Apr 8.3, May 0.2, Oct 0.8. — [NWS mean monthly snowfall table](https://www.weather.gov/media/gyx/climo/Mean_Monthly_Snowfall.pdf)

**Median daily snow depth on the ground, Caribou 1991–2020 [ME-N]**, with the 25th–75th percentiles in brackets:
| Date | Median | 25th–75th percentile |
|---|---|---|
| 15 Nov | 3 in (8 cm) | – |
| 1 Dec | 4 in (10 cm) | – |
| 15 Dec | 6 in (15 cm) | – |
| 1 Jan | 9 in (23 cm) | 5–14 in |
| 15 Jan | 11 in (28 cm) | – |
| 1 Feb | 14 in (36 cm) | – |
| 15 Feb | 19 in (48 cm) | – |
| 1 Mar | 21 in (53 cm) | 12–26 in |
| 15 Mar | 19 in (48 cm) | – |
| 1 Apr | 13 in (33 cm) | – |
| 15 Apr | 8 in (20 cm) | 3–14 in |
| 1 May | no snow | – |

Source: [NOAA NCEI 1991–2020 daily normals, Caribou](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-daily-1991-2020&stations=USW00014607&format=csv&startDate=0001-01-01&endDate=9996-12-31)

**Snow water equivalent [ME].** USGS analysed 109 sites with about 43 years of record. Mean SWE on 1 March is above 9 in (230 mm) in northern Maine. Maximum observed SWE ranges from under 8 in in south-coastal Maine to over 20 in in the northwestern mountains. — [USGS WRIR 01-4258, Snowpack in Maine](https://pubs.usgs.gov/publication/wri20014258)

**Recent snowpacks [ME-N].**
- March 2016: 20–30 in of snow in the St. John Valley and Allagash. — [NWS Caribou March climate summary](https://weather.gov/car/MarchClimateSummary)
- 2025: 15–30 in early in the month in the north and Central Highlands, with 5–7 in SWE at higher elevations at month's end. — [NWS Caribou E5 2025-03](https://www.weather.gov/media/car/E5s/2025/E5_CAR_2025-03.pdf)

**Year-to-year variability [ME-N].** Winter 2025–26 was Houlton's driest winter on record (4.01 in below normal) and Millinocket's 2nd driest (3.36 in below). — [NWS Caribou winter 2025–26 narrative](https://www.weather.gov/car/Winter20252026SeasonalNarrativeforNorthernandEasternMaine)

**Snowmelt runoff timing [NE].** The winter–spring centre-of-volume date is the day by which half of the January–June flow has passed.
- It has become significantly earlier at all 11 snowmelt-dominated gauges in northern and mountainous Maine and New Hampshire, by 1–2 weeks, mostly over the last 30 years.
- It correlates with March–April air temperature (r = −0.72).
- It has varied by about 6 weeks over the record on the Piscataquis River.
- Sources: [Hodgkins & Dudley 2006 (USGS)](https://water.usgs.gov/climate_water/hodgkins_dudley_2006b.pdf); [USGS FS 2005-3001](https://pubs.usgs.gov/fs/2005/3001)

**Centre-of-volume dates I computed from USGS daily flows [ME-N].**
| Gauge | Median date | Range | Years |
|---|---|---|---|
| Mattawamkeag River 01030500 | 18 Apr | 1 Apr – 1 May | 36 (1990–2025) |
| Wytopitlock Stream 01030350 | 15 Apr | 25 Mar – 27 Apr | 17 |
| Williams Brook 01017550 | 15 Apr | 29 Mar – 26 Apr | 26 |

Source: [USGS NWIS daily values service](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01030500,01030350,01017550&parameterCd=00060&statCd=00003)

**Hubbard Brook, NH [NE].** Annual precipitation is about 1,400 mm, of which a quarter to a third falls as snow. About 62 % leaves as streamflow and ET is about 500 mm. — [Hubbard Brook online book, Hydrology](https://hubbardbrook.org/online-book-chapter/hydrology/)
- A secondary summary gives a snowpack lasting mid-December to mid-April, peaking in March at about 250–300 mm SWE ([Appalachian State HBEF intro](https://www.appstate.edu/~neufeldhs/ecosystems/hubbardbrookintroduction.htm); it is unclear which of the two pages carries this, as it came from a search summary). This is a higher, mountain site, so it is wetter and snowier than Danforth.

### Inferences
- **A weather state machine for Danforth** should give rain on about 23 % of days at ≥2.5 mm, roughly evenly through April–November (6–9 such days/month).
  - Use a heavier tail in June–November: about 2–3 days/month ≥12.7 mm and about 0.7–1.1 days/month ≥25 mm.
  - Typical wet-day depth is about 7 mm, and about 11 mm on days ≥2.5 mm (998 mm / 144 days; 0.95 × 998 / 84).
  - An annual-maximum 24-h storm is about 57–65 mm. A 10-year storm is about 90 mm/24 h and about 33 mm/h for 1 h, a thunderstorm burst.
- **Winter precipitation** (Dec–Mar) is about 270 mm. At Caribou about 80–90 % of it falls as snow, at roughly 10:1 snow:water (300 cm snowfall vs 230 mm SWE by 1 March). Rain-on-snow and thaws occur (see the December peaks in §2).
- **Snowpack on land** for the Danforth/Houlton latitude, slightly milder than Caribou: begin in mid- to late November, reach about 40–55 cm depth (about 200–230 mm SWE) by 1 March, and melt through late March–April. Ground is bare by about 25 April–1 May.
  - The freshet peak (§2) coincides with the last 2–3 weeks of melt, a few days before the sim's ice-out (about 23 April).

### Gaps
- No 1991–2020 snowfall or snow-depth normals for Houlton or Millinocket were returned (not in the NCEI normals for those stations). The Caribou values are about 80 km north of Danforth.
- No Danforth co-op station was found, and no SWE time series was found for Washington County.
- A rain-vs-snow phase split by month for Danforth was not found. The 10:1 ratio is an inference.

---

## 2. Runoff and streamflow of small Maine streams and lake outlets (hydrograph shape, flood pulses, response time)

### Takeaway
Northern/eastern Maine streams have one dominant snowmelt freshet in mid-April, when mean flow is 3–4× the annual mean and daily means reach about 4–6.5×. Flow falls to an August–early-September low of about 0.2–0.4× the annual mean, with near-zero flow (Q95 ≈ 0.02×) in small streams in drought years. A second, smaller high-flow season runs from November to December. Annual peaks are 6.5× the mean flow on large rivers and 9–20× on small streams. 60–75 % of annual peaks fall in April, and some come from December/March rain-on-snow. Small streams rise for 1–2 days after a storm and recede with a daily ratio of about 0.81–0.88 (half-life about 3–5 days). Runoff is about 580–710 mm/yr, roughly 60 % of precipitation.

### Cited Findings
**Long-term monthly mean flow as a ratio of the annual mean, computed from USGS monthly statistics [ME-N].**
| Gauge | Area | Record | Annual mean | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mattawamkeag River nr Mattawamkeag (01030500) | 1,418 mi² | 1934–2026 | 2,620 cfs | 0.61 | 0.49 | 0.95 | 3.31 | 1.99 | 0.75 | 0.42 | 0.30 | 0.32 | 0.60 | 1.13 | 1.13 |
| Wytopitlock Stream (01030350) | 48.9 mi² (127 km²) | 2008–2025 | 101 cfs | 0.69 | 0.50 | 1.32 | 3.30 | 1.18 | 0.61 | 0.47 | 0.33 | 0.39 | 0.71 | 1.10 | 1.41 |
| Williams Brook at Phair (01017550) | 3.97 mi² | – | 6.7 cfs | – | – | 1.00 | 3.89 | 1.30 | – | – | 0.42 | 0.41 | – | – | – |
| Pearce Brook at Houlton (01018009) | 6.88 mi² | – | – | – | – | – | 3.49 | – | – | – | 0.31 | – | – | – | – |
| Old Stream nr Wesley (01021480, coastal Washington Co.) | 29.9 mi² | – | – | 1.01 | 0.78 | 1.57 | 2.44 | 1.18 | 0.67 | 0.38 | 0.25 | 0.31 | 0.67 | 1.13 | 1.61 |

Source: [USGS NWIS statistics service, monthly means](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030500&statReportType=monthly&statTypeCd=mean&parameterCd=00060); [Mattawamkeag monitoring location](https://waterdata.usgs.gov/monitoring-location/USGS-01030500/statistics/)
- Mattawamkeag extremes: April ranged from 3,012 cfs (1944) to 14,620 (2019); the lowest monthly mean was 38.6 cfs (September 1995).
- The Wytopitlock April monthly mean ranged from 171 to 559 cfs.
- Old Stream is coastal, with more winter rain.

**Day-of-year mean hydrograph shape, computed from daily values for 1990–2025 [ME-N].**
| Gauge | Mean-daily peak | Mean-daily minimum |
|---|---|---|
| Mattawamkeag | 19 Apr, 4.1× annual mean | 28 Aug, 0.20× |
| Wytopitlock | 16 Apr, 4.7× | 2 Sep, 0.18× |
| Williams Brook | 15 Apr, 6.5× | 25 Aug, 0.29× |

Mattawamkeag through the year (ratio to annual mean):
- Spring: 1 Mar 0.66, 15 Mar 1.09, 1 Apr 2.22, 15 Apr 3.59, 1 May 3.09, 15 May 1.44, 1 Jun 0.86.
- Summer: 1 Jul 0.71, 1 Aug 0.34, 1 Sep 0.22.
- Autumn and winter: 1 Oct 0.48, 1 Nov 1.12, 15 Dec 1.52, 15 Feb 0.37.

Source: [USGS NWIS daily values](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01030500&parameterCd=00060&statCd=00003&startDT=1990-01-01&endDT=2025-12-31)

**Annual peak flows, computed from USGS peak records [ME-N].**
| Gauge | Median annual peak | Range | Multiple of mean flow | Months of peaks |
|---|---|---|---|---|
| Mattawamkeag (123 yrs) | 17,000 cfs | 6,190–46,600 | 6.5× | Apr 80, May 23, Jun 5, Dec 5, Mar 4, Nov 4, Sep 1, Oct 1 |
| Wytopitlock (17 yrs) | 949 cfs | 509–1,490 | 9.4× | Apr 10, Mar 2, Dec 2, May 1, Jun 1, Oct 1 |
| Williams Brook (26 yrs) | 131 cfs | 58–364 | 19.6× | Apr 17, Mar 3, Dec 3, Jul 1, Sep 1, Nov 1 |
| Pearce Brook (17 yrs) | 222 cfs | – | 17.8× | – |
| Old Stream (27 yrs) | 541 cfs | – | 8.7× | Dec 8, Apr 8, Mar 7, Sep 2, May 1, Oct 1 |

Source: [USGS NWIS peak-flow files](https://nwis.waterdata.usgs.gov/nwis/peak?site_no=01030350&agency_cd=USGS&format=rdb)

**Daily flow duration, water years 2009–2025 [ME-N]** (Q5 = flow exceeded on 5 % of days).
| Gauge | Q5 | Q50 | Q95 | Q99 | Max daily |
|---|---|---|---|---|---|
| Wytopitlock (mean 102 cfs) | 388 cfs (3.8× mean) | 51.6 (0.51×) | 1.83 (0.018×) | 0.32 | 1,240 |
| Williams Brook | 3.5× | 0.52× | 0.10× | – | – |
| Old Stream | 208 cfs (3.2×) | 40.6 (0.63×) | 4.6 (0.07×) | – | – |

The lowest monthly means were near zero in 1995 and similar droughts: Wytopitlock August 0.39 cfs; Pearce Brook September 0.03 cfs. — [USGS NWIS daily values](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01030350,01017550,01021480&parameterCd=00060&statCd=00003&startDT=2008-10-01&endDT=2025-09-30)

**Storm response in June–October, computed from daily flows [ME-N].** An event was counted when flow rose more than 30 % in a day.
| Gauge | Events (per yr) | Median rise to peak | Median peak/pre-event | 90th percentile | Median daily recession ratio |
|---|---|---|---|---|---|
| Wytopitlock | 183 in 17 yr (~11) | 2 days | 2.6× | 15× | 0.87 |
| Williams Brook | 300 (~18) | 1 day | 2.4× | 7× | 0.81 |
| Old Stream | 176 (~10) | 2 days | 2.2× | 8.9× | 0.88 |

Same USGS daily-values source as above.

**Unit runoff [ME-N].**
- Mattawamkeag: 2,620 cfs / 3,672 km² ≈ 638 mm/yr.
- Wytopitlock: about 712 mm/yr.
- Williams Brook: about 581 mm/yr.
- Against Houlton/Millinocket precipitation of 998–1,082 mm, the runoff ratio is about 0.6 (my arithmetic). The historical USGS station description lists 39.25 in annual precipitation over the Mattawamkeag basin. — [USGS HCDN station 01030500](https://pubs.usgs.gov/wri/wri934076/stations/01030500.html)

**Lake-outlet gauges with short records [ME-N].** The data are thin.
- Clayton Stream at the outlet of Clayton Lake (12.6 mi², 1982–84): spring still 2.4× the mean in May and 1.05× in June, vs 0.6–0.75× in June at unregulated streams.
- Cold Stream at Enfield, the Cold Stream Pond outlet (28.5 mi², 1904–06): mean peak in May–June (2.3–2.4×) instead of April.
- Source: [USGS NWIS monthly statistics](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01012515,01035500&statReportType=monthly&statTypeCd=mean&parameterCd=00060)

**Floods [ME].** Rain is the common denominator in Maine's major floods; snowmelt plays a supporting role. In mid-February 2026 northern rivers carried ice up to 22 in thick. — [Maine River Flow Advisory Commission 2026 report](https://www.maine.gov/mema/sites/maine.gov.mema/files/inline-files/2026%20RFAC%20Report.pdf)

**Summer low flows [NE].** Their size and timing did not correlate with the timing of spring snowmelt runoff. — [USGS, trends in summer and fall/winter streamflows](https://www.usgs.gov/publications/trends-timing-magnitude-and-duration-summer-and-fallwinter-streamflows-unregulated)

### Inferences
- **Outlet-stream flow multiplier** for the sim, as a fraction of annual-mean discharge Q̄:
  - Jan 0.6, Feb 0.5, Mar 1.0–1.3, Apr 3.3, May 1.2–2.0, Jun 0.7, Jul 0.45, Aug 0.3, Sep 0.35, Oct 0.65, Nov 1.1, Dec 1.1–1.4.
  - The ice-covered winter months are low because precipitation is stored as snow.
  - Peak around 15–19 April, at or just before ice-out.
  - Floor: August–September flows of about 0.2× Q̄ in a normal year and about 0.02× in a drought year, when a riffle could nearly dry and the 1-m pools become isolated.
- **Storm pulse in a small stream** (catchment 10–130 km²):
  - Rise over 1–2 days to a typical 2–3× pre-storm flow, up to about 7–15× for big storms.
  - Exponential recession with k ≈ 0.12–0.2 per day.
  - Annual flood about 10–20× Q̄ for a 10 km² brook and about 6–10× for a 100–3,600 km² river.
- **Hot Brook is a lake-to-lake connector**, so its flow is the outflow of Upper Hot Brook Lake (3.7 km²).
  - Lake storage damps and delays storm pulses. A 25 mm storm on a catchment maybe 10× the lake area, with about 30–50 % quick runoff, raises the lake by roughly 8–13 cm. Outflow then peaks about 1–3 days later and decays over a week or more. This is a rough storage-routing estimate; the catchment area is unknown.
  - The two old lake-outlet records suggest the outlet's spring high flow stays elevated into May–June longer than an unregulated brook.
  - The sim's "constant gentle through-flow" should become: base flow × the monthly multiplier, plus lake-level-driven storm pulses.
- **A November–December second high-flow season** follows leaf fall (ET shutdown) and autumn rains. It is also when rain-on-snow December floods occur (5 of 123 Mattawamkeag peaks; 8 of 27 at coastal Old Stream).

### Gaps
- No long-term gauge sits on a small lake-outlet stream in Washington/Aroostook/Penobscot. The two outlet records are 2–3 years long, one from 1904–06.
- The Hot Brook and Baskahegan catchment areas were not found here.
- Sub-daily (hourly) storm response for a small stream was not computed. Daily data cannot resolve rise times under 1 day, which is likely for Williams Brook.

---

## 3. Lake water level (natural seasonal range, timing, storm response)

### Takeaway
Natural (unregulated or spillway-controlled) New England lakes vary by a few tens of cm in a year, with outliers up to about 1 m. Typical range is about 30–60 cm. Levels are highest at or just after snowmelt (April–May) and after big autumn rains, and lowest in late summer–early autumn. Even a hurricane changed lake depth by less than 1 m. Regulated lakes differ: managed drawdowns of 0.1–2.7 m expose 9–71 % of the littoral zone. No long natural-lake level record was found for northern Maine; USGS lake gauges there are all on dam-controlled lakes.

### Cited Findings
**Three non-drawdown Massachusetts lakes, logged every 2 h for 3–4 years [NE].**
- October–April median levels ranged from 13.2 cm below to 62.4 cm above the reference summer pool.
- The lowest winter levels were 5.7–31.6 cm below pool, all in winter 2016–17.
- Summer levels ranged from −30.0 to +102.4 cm (median +0.5 cm) relative to the reference.
- Managed winter drawdowns in 18 other lakes were 0.07–2.66 m. They lasted 5–246 days (mean 171) and exposed 1.3–37.6 % of the lakebed and 9.2–71.1 % of the littoral zone.
- Source: [Carmignani et al. 2021, Lake and Reservoir Management 37:339–359 (USGS record)](https://pubs.usgs.gov/publication/70228607); full text at [UMass PDF](https://propel.umass.edu/sites/default/files/publications/2022-08/10402381.2021.pdf)

**Storms [NE/N-temp].** During Tropical Storm Irene (2011), storm inputs changed depth by less than 1 m in the lakes with depth data. — [Klug et al. 2012, ES&T 46:11693](https://bpb-us-w2.wpmucdn.com/hawksites.newpaltz.edu/dist/1/8098/files/2012/10/Klug2012-EST-HurricaneIrenePaper.pdf)

**Maine rule [ME].** Maine DEP rules define "natural variation of water level" as the expected seasonal and inter-annual fluctuation, and tie it to habitat, stratification and wetland health. — [Code of Maine Rules 06-096 ch. 587](https://regulations.justia.com/states/maine/06/096/chapter-587/section-096-587-2)

**USGS lake gauges in Maine are all regulated [ME].** They are West Grand Lake, Lewy Lake, Sebago Lake and Umbagog (from my query of the NWIS site service). — [USGS NWIS site service, lakes in Maine](https://waterservices.usgs.gov/nwis/site/?format=rdb&stateCd=ME&siteType=LK&outputDataTypeCd=dv&seriesCatalogOutput=true)

**Regulated example [NE].** Ossipee Lake (NH) is held at 407.25 ft in summer and drawn down to 404.10 ft by 1 January, about 0.96 m, then refilled from March. — [Ossipee Lake Alliance](https://www.ossipeelake.org/2022/09/the-smart-report-changing-seasons/)

### Inferences
- **Lake level in the sim**: an annual cycle of about ±15–25 cm around a summer pool.
  - High after the April freshet and ice-out (+15–30 cm), declining through summer as ET exceeds inflow.
  - Low in August–September (−10 to −30 cm).
  - Rising with November rains, then flat under ice.
  - Storms add pulses of roughly (rain × catchment-to-lake area ratio × runoff fraction): typically 2–10 cm, 20–60 cm in a hurricane-class event. The pulse drains through the outlet over days to weeks.
- **Shallow littoral (0–3 m slope)**: even a 30 cm drop exposes a measurable littoral strip (cf. the drawdown exposure figures). Late-summer low water shrinks the wettest macrophyte and spawning margin; a high spring stand floods shoreline vegetation, which matters for pike/pickerel spawning.
- **Outlet flow is a rating curve on lake level**: roughly Q ∝ (h − h_sill)^1.5 for a weir-like outlet (standard hydraulics). This links §2 and §3: once the lake falls toward the sill in a drought summer, the stream nearly stops.

### Gaps
- No natural northern-Maine lake level series (cm) was found. Lake associations or Maine DEP may hold staff-gauge readings; the Hot Brook lakes have no USGS gauge.
- Whether the Hot Brook lakes have an outlet dam or control structure was not confirmed; the IFW map PDF could not be read here.
- Evaporative drawdown rates for Maine lakes were not found (see §7).

---

## 4. Storm and snowmelt loads (P, sediment, DOC), turbidity and colour pulses

### Takeaway
Most of a catchment's annual DOC, and most of its particulate P and sediment, moves in a few high-flow events: storms plus snowmelt.
- DOC: up to about 80–86 % of annual export in northeastern forested catchments.
- P: up to about 80 % in a well-studied non-New England case.
- Storm P in New England streams spikes for only hours at peak flow, mostly as particulate and organic P.

In Maine lakes, a big storm gives one of three DOC responses (a spike that clears in days, a sustained rise, or nothing in the largest lakes). Summer-season precipitation is the best single predictor of year-to-year clarity changes. A hurricane-class storm destratified northeastern lakes within hours and pushed them net-heterotrophic, and the terrestrial-carbon effect outlasted the thermal one.

### Cited Findings
**DOC export [NE/N-temp].** Terrestrial carbon export rises during storms and snowmelt. Up to 86 % of annual DOC export from forested catchments, including sites in the Catskills, occurs during such events (Raymond & Saiers 2010, as cited by Klug et al.). — [Klug et al. 2012](https://bpb-us-w2.wpmucdn.com/hawksites.newpaltz.edu/dist/1/8098/files/2012/10/Klug2012-EST-HurricaneIrenePaper.pdf)
- A secondary citation of the same paper gives "more than 80 %". — [CHMI document](https://www.chmi.cz/documents/d/chmi.cz/978-80-7653-063-8-34)

**Tropical Storm Irene, 2011, nine northeastern lakes including Lake Sunapee NH [NE].**
- Schmidt stability fell within hours in all of them. The size of the drop depended on "potential volume replacement" (PVR = storm rain on lake + catchment ÷ lake volume): lakes above 50 % PVR were disrupted far more.
- Sunapee took 90 mm of rain, at about 5.4 % PVR.
- All but one lake recovered to within 80 % of pre-storm stability within one week.
- Change in GPP = 37.8 × ΔT(°C) + 84.9 (%; r² = 0.67).
- Respiration decoupled from GPP after the storm (terrestrial carbon), so the lakes became net-heterotrophic.
- Short-term residence time fell by 50 % and 33 % in two lakes.
- Inflow turbidity at the Ashokan reservoir likely exceeded 1,000–1,500 NTU.
- Parts of the region received over 200 mm in 24 h.
- Source: [Klug et al. 2012, ES&T](https://bpb-us-w2.wpmucdn.com/hawksites.newpaltz.edu/dist/1/8098/files/2012/10/Klug2012-EST-HurricaneIrenePaper.pdf); [ESA 2012 abstract](https://eco.confex.com/eco/2012/webprogram/Paper39115.html)

**Six Maine drinking-water lakes sampled around five severe storms [ME].**
- Some lakes showed a DOC spike that returned to pre-storm levels within days.
- Others showed DOC that rose and stayed high.
- The largest lakes showed no change.
- The DOC came from leaf and needle litter washed in by runoff.
- Source: [UMaine / Smart Water Magazine on Warner & Saros](https://smartwatermagazine.com/news/university-maine/understanding-effect-severe-rainstorms-freshwater-ecosystems); [UMaine Mitchell Center](https://umaine.edu/mitchellcenter/?p=18747)

**Clarity and colour in Maine [ME].**
- Jordan Pond (Acadia) Secchi fell from 45.6 ft (13.9 m) in 1995 to 40.1 ft (12.2 m) in 2021, attributed to DOC colour. — [Maine Boats, Tracking the Health of Acadia's Lakes](https://maineboats.com/node/4727)
- Landsat showed mean statewide clarity falling from 4.94 to 4.38 m over 1995–2010. — [McCullough et al., Freshwater Science 32(3)](https://bioone.org/journals/Freshwater-Science/volume-32/issue-3/12-070.1/Landsat-imagery-reveals-declining-clarity-of-Maines-lakes-during-19952010/10.1899/12-070.1.full)
  - Conflict: a multi-method analysis of volunteer Secchi data reports a small significant clarity increase over 1976–2013 (per a search summary; the source was not opened directly).

**Snowmelt events at Bear Brook watershed [ME]** (December 2001 and February 2002): total acid-soluble P, Al and Fe rose with discharge, while dissolved P stayed ≤0.1 µmol/L (≤3 µg/L). — [Water, Air & Soil Pollution: Focus (Bear Brook)](https://link.springer.com/article/10.1023/B%3AWAFO.0000028362.48966.17)

**Squam Lake tributary, NH [NE].** Stream P responded quickly to each rain onset, stayed high for only a few hours around peak flow, and fell as flow declined. — [Plymouth State University, P transport to Squam Lake during storms](https://plymouth.edu/sites/default/files/media/2023-12/phosphorus-transport-to-squam-lake-during-storm-events.pdf)

**Loch Leven, Scotland [N-temp].** Up to 80 % of the annual P load arrives in high-flow events. TP and SRP rose during under-24-h high flows, so routine sampling underestimates load. — [NERC Open Research Archive](https://nora.nerc.ac.uk/id/eprint/4544/)

**Taunton River tributaries, MA [NE].** The soluble reactive share of TP fell during high flows, which suggests more organic and particulate P in storms. — [Bridgewater State poster](https://vc.bridgew.edu/may_celebrations/2007/session1/6)

**Maine DEP P budgets [ME].** Lake phosphorus TMDLs attribute watershed P export to storm runoff and snowmelt by land use. For example, about 1,728 kg P/yr reaches Unity Pond from its direct watershed. — [Maine DEP Unity Pond PCAP](https://www1.maine.gov/dep/water/monitoring/tmdl/2004/2004unitypondreport.pdf)

### Inferences
- **Catchment input in the sim** should be event-driven, not a constant inflow:
  - Concentration × discharge with load ∝ Q^b, b > 1 for particulate P and sediment and b ≈ 1–1.5 for DOC.
  - About 50–80 % of annual P, sediment and DOC should arrive on the roughly 10–15 % of days with storm or melt flow.
  - The April freshet carries the largest single seasonal share, but much of it enters while the lake is cold and just mixing.
- **Pulse sizes after a big summer storm** (≥25–50 mm):
  - Turbidity and colour rise for days (small lake) to weeks (high-PVR lake), so light extinction rises.
  - DOC rises.
  - Respiration rises, and O₂ falls in proportion to the terrestrial carbon added.
  - A cold, dense inflow plunges along the bottom as an underflow (mechanism from §9).
  - Stratification partly breaks for under a week.
- **DOC is the main lever on colour.** The sim's turbidity response to "rain" should split into a short-lived mineral turbidity (settling over days) and a longer-lived DOC colour (weeks to months).
- **Dissolved P stays low during acidic snowmelt** (Bear Brook). The spring load is mostly particulate.

### Gaps
- No Maine study was found giving the percentage of annual P load in storms vs baseflow.
- Event DOC magnitudes in mg/L for Maine lakes (Warner & Saros) were not retrieved; the paper itself was not accessible.
- No Maine data on suspended sediment yield (t/km²/yr) for small forested catchments was found.
- The clarity-trend conflict (Landsat decline vs volunteer Secchi increase) is unresolved.

---

## 5. Snow on lake ice: ice and snow thickness, light through ice and snow, under-ice photosynthesis, O₂ depletion and winterkill, slush and white ice

### Takeaway
Light reaching the water under ice is set mainly by snow, not ice:
- snow-free clear (black) ice passes about 50–90 % of surface light;
- a few cm of snow cuts this to about 10 %;
- typical Maine midwinter snow-and-ice cover passes about 1–12 %.

Bayesian estimates from 46 lakes give medians of:
- black ice: albedo 0.55, attenuation k = 0.79 m⁻¹;
- white (snow) ice: albedo 0.60, k = 4.35 m⁻¹;
- snow: albedo 0.94, k = 8.96 m⁻¹.

Maine ice is about 30–75 cm in the south and west, and about 55–70 cm on northern lakes and rivers by mid- to late winter. Snow loading floods the ice and turns 10–40 % of the ice column into white snow-ice.

Under-ice O₂ falls steadily (about 0.2–0.4 g m⁻² d⁻¹ in shallow lakes, from arctic data). Hypoxia at ≤2 mg/L reached the bottom of 5 of 16 southern-Maine lakes in winter 2026. Snow cover decides whether under-ice algae offset the loss. Winterkill is a shallow-pond, heavy-snow, long-winter phenomenon, at about ≤1 mg/L for several days.

### Cited Findings
**Lakes Environmental Association, winter 2026, 16 lakes, Bridgton area [ME, western/southern Maine].**
- Ice thickness 31–50 cm in 2026 (past maxima 35–75 cm, 2018–2025). Ice grew 2.7–11.3 cm between visits about a month apart.
- In 2026 the ice was dominated by clear (black) ice, with less white ice and slush than in previous years.
- Light just under the ice was about 1–12 % of surface irradiance through the season. It fell with snow depth (measured snow 0 to about 20 cm), and snow was present on almost every visit.
- The 1 % light level defines the photic zone, so algal growth was confined to shallow layers.
- Chlorophyll often peaked within a few metres of the ice, sometimes directly under it, especially when snow reduced light. Chlorophyll fell as winter progressed.
- Surface DO was near saturation from under-ice photosynthesis.
- Five lakes had hypoxic bottom water (≤2 mg/L) on at least one visit.
- Winter Secchi depth was 3.0–9.3 m; TP 4.1–13.9 µg/L; chl-a 0.4–7.2 µg/L.
- Ice-in came in early December, but some lakes stayed open until early January after a December thaw. Most lakes were ice-free by early April.
- Inverse stratification: temperature rose quickly through the first metre below the ice, then slowly toward 4 °C at the bottom. Mid-column layers were sometimes convectively mixed.
- Source: [LEA Winter Monitoring Report 2026](https://mainelakes.org/wp-content/uploads/2026/06/LEAWinterMonitoringReport2026_final.pdf)

**Northern Maine ice [ME-N].**
- Northern rivers (St. John, Allagash, Aroostook) carried ice up to 22 in (56 cm) in mid-February 2026. — [Maine RFAC 2026](https://www.maine.gov/mema/sites/maine.gov.mema/files/inline-files/2026%20RFAC%20Report.pdf)
- Lower Moosehead Lake had about 24 in (61 cm) of ice in most areas in spring 2026, with one hole near 28 in (71 cm), per anglers. — [Bangor Daily News, Moosehead ice-out 2026](https://www.bangordailynews.com/2026/05/01/outdoors/outdoors-environment/moosehead-lake-ice-out-2026/)
- Shore leads: a band of open water usually develops along shorelines before the ice over the deep middle weakens. Ice-out ice is "honeycombed" (candled) into vertical crystals. — [Maine DEP, Seasonal Magic](https://www1.maine.gov/dep/water/lakes/lessons/seasonalmagic.pdf)

**Optical constants from 46 Northern Hemisphere lakes, 722 daily irradiance observations [N-temp].** Ice-quality data came from 15 of the lakes.
| Layer | Median albedo | Median attenuation (m⁻¹) |
|---|---|---|
| Black ice | 0.55 | 0.79 |
| White ice | 0.60 | 4.35 |
| Total ice | 0.56 | 1.75 |
| Snow | 0.94 | 8.96 |

The model is a Beer–Lambert law per layer; the units were confirmed in a secondary summary. Values vary widely between studies. — [Donini et al. 2026, GRL 53, e2025GL119595 (IRIS record)](https://iris.unitn.it/handle/11572/485537)

**Other snow and ice transmission values.**
- Snow extinction coefficients run 3–30 m⁻¹: slightly lower as snow ages, higher as density rises [N-temp]. — [Perovich 2007](https://home.chpc.utah.edu/~u0818471/Documents/2014/Continuity/Relevant%20Papers/Light%20Reflection%20of%20Snow%20-%20Perovich%20(2007).pdf)
- Lake Balaton, Hungary [N-temp]:
  - Ice under 4 cm of snow passed about 1/10 of surface light; snow-free ice passed about 1/2.
  - Phytoplankton production was 4 mg C m⁻² h⁻¹ under snow-covered ice vs 20 under snow-free ice.
  - Under snow-free ice, benthic algae were also very productive. Total production was about 560 mg C m⁻² d⁻¹, comparable to the summer plankton maximum.
  - Under-ice DO reached 9.6 mg/L.
  - Source: [Herodek & Oláh 1973 (REAL-MTAK)](https://real.mtak.hu/195744)
- Lake A, Ellesmere Island, a perennial-ice lake [N-temp]: only about 0.45 % of incident PAR passed through 2 m of ice and 0.5 m of snow. Removing the snow raised under-ice PAR about 13×. — [Université Laval (Vincent lab) PDF 160](https://science.cen.ulaval.ca/warwickvincent/PDFfiles/160.pdf) (from a search summary; the PDF was not opened)

**Slush and white ice [N-temp].**
- At Lake Pääjärvi, Finland, 1993–99, snow-ice made up 10–43 % of total ice thickness, averaging about 12 cm of snow-ice in 46 cm of ice. Slushing compacted the snow to about 2/3 of its original thickness before it froze. — [Leppäranta & Kosloff 2000, Geophysica 36](https://archive.geophysica.fi/pdf/geophysica_2000_36_1-2_233_lepparanta.pdf)
- Mechanism: snow load depresses the ice below the waterline (negative freeboard), and water floods up through cracks into the snow. Slush also forms by submersion and by melt. — [Water 15(13):2360, snow–slush–snow-ice observations](https://www.mdpi.com/2073-4441/15/13/2360/htm) (from a search summary; the negative-freeboard wording may come from a lake-ice-model review cited alongside it)

**Ice growth (Stefan's law), h = α√(freezing degree-days) [N-temp, Alaska].** α ranges from about 0.4 for snow-covered rivers to 2.7 for snow-free lakes. Windy coastal lakes are about 2.6; interior lakes with deep snow 1.3–2.0. — [The Cryosphere discussion tc-2020-125](https://tc.copernicus.org/preprints/tc-2020-125/tc-2020-125-AR1.pdf)

**Under-ice O₂ depletion in four Arctic lakes over multiple winters [N-temp].**
- 0.2–0.39 g O₂ m⁻² d⁻¹ in shallow lakes (9–13 m maximum depth) vs 0.03–0.14 in 24-m Toolik Lake. Smaller lakes lost O₂ faster because of their larger sediment-area-to-volume ratio.
- In the shallow lakes, rates fell to about 20–50 % of their initial values by late winter.
- Early-winter loss was smaller in years with minimal snow (more photosynthesis).
- Penetrative convection under the ice can mix O₂ downward.
- Sources: [Schwefel et al. 2023, L&O (record)](https://openpolar.no/Record/crwiley:10.1002%2Flno.12357); [EGU25-4281](https://meetingorganizer.copernicus.org/EGU25/EGU25-4281.html)
- Sediment respiration drives near-bottom density currents and anoxia under ice. — [MacIntyre et al. 2018, L&O Letters](https://par.nsf.gov/servlets/purl/10141357)

**Winterkill thresholds and risk factors.**
- Minnesota DNR [N-temp]:
  - Trout are stressed below 5 mg/L.
  - Walleye, yellow perch, northern pike and crappie tolerate down to about 2 mg/L.
  - Bluegill and largemouth bass are moderately sensitive; bullheads and fathead minnows are the most tolerant.
  - Readings below 2.0 mg/L trigger more testing.
  - Small, shallow lakes are most at risk. Winterkills seldom kill every fish, and the dead fish are usually seen at ice-out.
  - Source: [MN DNR, What is winterkill?](https://dnr.state.mn.us/areas/fisheries/waterville/winterkill.html)
- Penn State Extension [N-temp]: a 1-acre pond 6 ft deep is less prone to winterkill than one 3 ft deep. Keeping about 30 % of the ice free of snow lets in enough light for photosynthesis. — [Penn State Extension, Winterkill in ponds](https://extension.psu.edu/winterkill-in-ponds)
- Passaconway Pond, York County [ME]: winterkill occurs in more severe winters. DO was 0.8 mg/L in February 1961. — [Maine IFW lake survey](https://www.maine.gov/IFW/docs/lake-survey-maps/york/passaconway_pond.pdf)

### Inferences
- **Replace the sim's fixed 60 % ice light block** with a layered Beer–Lambert transmission:
  - T = (1 − α_top) · exp(−k_s·h_s − k_w·h_w − k_b·h_b)
  - Use α_top = 0.94 if snow is present, otherwise 0.55–0.60.
  - k_s ≈ 9 m⁻¹ (range 3–30), k_w ≈ 4.4 m⁻¹, k_b ≈ 0.8 m⁻¹.
- **Worked examples** with the Donini medians:
  | Cover | Transmission |
  |---|---|
  | 40 cm black ice, no snow | ≈ 33 % |
  | 10 cm white + 30 cm black ice, no snow | ≈ 20 % |
  | 10 cm snow on 40 cm black ice | ≈ 1.8 % |
  | 30 cm snow on 40 cm black ice | ≈ 0.3 % |

  This matches LEA's 1–12 % measured range and Balaton's 50 % (snow-free) vs 10 % (4 cm snow). The sim's 60 % block (40 % transmission) is appropriate only for thin, snow-free black ice in early winter or after a rain/thaw clears the snow.
- **Snow on the lake** should be its own state, fed by the weather machine's snowfall (§1) and reduced by wind drift, rain, thaw and slush conversion.
  - Snow depth on lake ice is usually less than on land, because of wind drift and flooding. This is an inference; no lake-vs-land data was found.
  - Snow-ice forms when the snow load exceeds the ice's buoyant freeboard: ρ_s·h_s > (ρ_w − ρ_i)·h_i. With ρ_i = 917 and ρ_w = 1,000 kg m⁻³, 30 cm of ice floods under about 2.5 cm SWE (about 8 cm of 300 kg m⁻³ snow). Archimedes' principle; the densities are assumed typical values.
  - Flooding converts snow into white ice (k ≈ 4.4 m⁻¹, much clearer than snow at k ≈ 9 m⁻¹ with albedo 0.94), so a slush event raises under-ice light.
- **Ice thickness for Danforth/Houlton.**
  - Freezing degree-days: Houlton monthly normals give TAVG of −6.2 °C (Dec), −10.6 (Jan), −9.6 (Feb) and −3.6 (Mar), for about 900 °C·d (my arithmetic).
  - Stefan's law gives h ≈ 40 cm (α 1.3, deep snow), 50–60 cm (α 1.7–2.0) or 80 cm (α 2.7, snow-free).
  - This fits the observed 30–75 cm (southern Maine) and 55–70 cm (northern Maine).
- **Winter O₂ budget.** Areal depletion of 0.2–0.4 g m⁻² d⁻¹ (an arctic analogue; Maine's warmer sediments may run higher) is a volumetric loss of:
  - about 0.04–0.08 mg L⁻¹ d⁻¹ for a lake with 5 m mean depth;
  - about 0.1–0.2 mg L⁻¹ d⁻¹ for a pond with 2 m mean depth.
  - Over a 120–140-day ice season, the 4-m pond, starting at about 12–13 mg/L at ice-on, can reach ≤2 mg/L in about 50–110 days if snow suppresses photosynthesis. That is late-winter winterkill risk.
  - The 14-m lake keeps an oxic upper water column, but its deep water can go hypoxic, as observed in 5 of 16 LEA lakes.
  - Snow-free, clear-ice periods add O₂ from photosynthesis near the ice. The sign of the net O₂ change under ice should therefore follow snow depth.

### Gaps
- No measured light transmission was found for northern Maine (Aroostook/Washington) lakes. The LEA data are from western Maine.
- No time series of snow depth on lake ice (as opposed to land) was found for Maine.
- No Maine white-ice fraction was found. LEA notes it varies by year and was low in 2026.
- The Bolsenga & Vanderploeg (1992) coefficients and the Lake Superior clear-ice transmittance (about 87 %) came from search summaries only. The GLERL PDF is a scanned image and its numbers could not be verified.
- Under-ice O₂ depletion rates for temperate New England lakes (g m⁻² d⁻¹) were not found. The Babin & Prepas (1985) regression could not be retrieved.
- No documented winterkill frequency was found for Washington County ponds.

---

## 6. Wind (speeds by season, fetch and sheltering, seiches, wave exposure, turnover and spring mixing)

### Takeaway
Airport winds in northern Maine average about 2.5–4 m/s (6–9 mph). They are windiest in March–April (about 3.7–3.9 m/s mean, 4.6 m/s in the afternoon) and calmest in July–August (about 2.5–2.6 m/s mean, 1.7 m/s at night, calm 17–19 % of hours). Forest edges shelter a lake surface for about 50 canopy heights (about 0.75–1 km for a 15–20 m forest), and full wind stress needs about 1 km of fetch. Small Maine ponds are therefore partly wind-sheltered, which favours strong, shallow summer stratification. Internal seiches in small stratified lakes have periods of a few hours. Autumn turnover in a southern Maine basin came around mid-October; deeper lakes in the north turn over later and more slowly. Spring mixing after ice-out is short.

### Cited Findings
**Caribou airport hourly wind normals, 1991–2020 [ME-N]** (mph; m/s = ×0.447).
| | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Monthly mean | 7.8 | 8.0 | 8.7 | 8.3 | 7.8 | 6.9 | 5.9 | 5.7 | 6.4 | 7.3 | 7.6 | 7.6 |
| Afternoon, 10:00–17:00 | 9.0 | – | – | 10.3 | – | – | – | 8.1 | – | – | – | – |
| Night, 22:00–05:00 | 7.0 | – | – | 6.8 | – | – | 3.9 | 3.7 | – | – | – | – |
| Calm hours (%) | – | – | – | 9.6 | – | – | 17.2 | 19.4 | – | – | – | – |

Hourly dew-point normals: July 56.8 °F (13.8 °C). Hourly air-temperature normals: July 66.4 °F (19.1 °C). — [NOAA NCEI 1991–2020 hourly normals, USW00014607](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-hourly-1991-2020&stations=USW00014607&format=csv&startDate=0001-01-01&endDate=9996-12-31)

**Wind sheltering [N-temp].**
- Behind a tree canopy or bluff, reduced surface shear stress extends about 50 canopy heights downwind of the shore. Canopy height alone predicts a usable wind-sheltering coefficient. — [Markfort et al. 2010, WRR (EPFL record)](https://infoscience.epfl.ch/record/204593?ln=en)
- Wake turbulence behind shoreline trees delays shear-stress development; full development may need fetch of order 1 km. — [Markfort et al., EGU2014-11486](https://opac.geologie.ac.at/ais312/dokumente/EGU/EGU2014-11486.pdf)

**Internal seiches [N-temp].**
- Two-layer period: T = 2L/(n·c₀), with c₀ = √(g′h₁h₂/H). — [Environmental Fluid Mechanics 2023](https://link.springer.com/article/10.1007/s10652-023-09928-y)
- In small Shikinawa Lake (Japan), the internal seiche responded to wind stress after about 25 minutes. Basin-scale internal waves appear at Wedderburn numbers of about 1–100. — [Kyushu Univ. PDF](https://catalog.lib.kyushu-u.ac.jp/opac_download_md/19540/p123.pdf)
- Sloping basin boundaries dissipate most internal-seiche energy. — [Environmental Fluid Mechanics 2023](https://link.springer.com/article/10.1007/s10652-023-09928-y)

**Turnover and stratification.**
- Moose Pond South Basin, Bridgton, 2024 [ME, southern]:
  - Already weakly stratified at sensor deployment on 15 April.
  - Peak surface 29.4 °C on 18 July.
  - Shallow water began cooling and mixing into mid-depths in mid-August.
  - Fully mixed (fall turnover) on 12 October.
  - Source: [Lakes Environmental Association, Moose Pond temperature 2024](https://mainelakes.org/?p=91796)
- The whole water column must cool to about 4 °C (fall overturn) before a lake can freeze. Small ponds ice over earlier than deep lakes. — [Maine DEP, Seasonal Magic](https://www1.maine.gov/dep/water/lakes/lessons/seasonalmagic.pdf)
- Fall mixing is slower than spring mixing. Mixing can take weeks on large lakes and days on small sheltered ones; very shallow lakes may never stratify stably. — [Maine Boats, Layer Cake Lake](https://www.maineboats.com/node/3175)
- In a small deep temperate lake, the surface can reach the temperature of maximum density before mixing finishes, leaving fall turnover incomplete [N-temp]. — [UBC thesis](https://open.library.ubc.ca/collections/24/items/1.0447129)
- Lake Sunapee, NH, July [NE]:
  - About 15 °C difference between surface and hypolimnion; thermocline at 5.5–8.5 m.
  - Only rare, very large storms (hurricanes) interrupted summer stratification.
  - Source: [Springer ESM supplement, Aquatic Sciences 2016](https://media.springernature.com/original/springer-static/esm/art%3A10.1007%2Fs00027-016-0499-7/MediaObjects/27_2016_499_MOESM1_ESM.pdf)
- Wind as a driver [N-temp]: five years of buoy data showed stronger winds and weaker stability in late spring delayed hypoxia onset. Calm, highly stable late summers slowed recovery, so wind drives year-to-year differences in stratification and hypoxia. — [NOAA repository report](https://repository.library.noaa.gov/view/noaa/48461/noaa_48461_DS1.pdf)

### Inferences
- **Sim wind** (open-lake 10-m values):
  - Monthly mean about 3.5 m/s in winter, 3.7–3.9 m/s in March–April, about 2.5 m/s in July–August.
  - Strong diurnal cycle: afternoon about 1.4× the daily mean, nights about 0.6×, with calm on about 1 in 5 summer nights.
  - Over a small, forest-ringed lake or pond, the effective wind stress should be reduced roughly by the wind-affected area fraction. For a 15–20 m forest, the first 0.75–1 km downwind is sheltered: almost all of the 4-m pond, and the upwind third to half of a 2–3 km lake. Over the stream, wind is negligible.
- **Seiche period for the sim's 14-m lake.** With a 5 m epilimnion at 22 °C over a 9 m hypolimnion at 8 °C, g′ ≈ 0.020 m s⁻², c₀ ≈ 0.26 m/s, and the first-mode period is about 2 h per km of basin length (about 4 h for a 2 km basin). A strong afternoon wind therefore tilts the thermocline: upwelling of cold, low-O₂ water at the upwind end and downwelling at the downwind end, sloshing over hours.
- **Turnover in the north.** Moose Pond South (southern Maine) mixed on 12 October. A deeper 14-m northern lake would plausibly turn over in late October–November. The sim's ice-on of about 1 December is consistent with a mid–late November completion of overturn. This should be checked against a northern Maine profile series, which was not found.
- **Spring mixing** after ice-out (late April) lasts days to two weeks before warming re-stratifies. March–April are the windiest months, which helps a full spring overturn.

### Gaps
- No over-lake wind measurements were found for small Maine lakes. The airport-to-lake ratio is unknown, beyond the general sheltering result.
- No wave-height or wave-exposure data were found for Maine shores. A fetch-limited wave formula (e.g., SMB/JONSWAP) could be applied, but no source was retrieved here.
- No documented autumn turnover dates were found for northern Maine (Aroostook/Washington) lakes.
- No surface-seiche amplitude data were found for small Maine lakes.

---

## 7. Air vs water temperature; fog and mist over lakes; evaporation

### Takeaway
The lake surface tracks smoothed air temperature with a lag and runs warmer than air in summer and autumn. A small Maine pond can reach 29 °C at the surface in a hot July, even though monthly mean air at Houlton peaks at 18.9 °C in July. Steam fog ("sea smoke") forms when cold air flows over much warmer water: on autumn and early-winter mornings, and on summer dawns after clear, cool nights, in light winds. No reliable Maine lake evaporation figure was found.

### Cited Findings
**Air temperature, Houlton 1991–2020 normals [ME-N]** (°F; °C in brackets). Jan 12.9 (−10.6), Feb 14.8 (−9.6), Mar 25.5 (−3.6), Apr 38.6 (3.7), May 51.2 (10.7), Jun 60.2 (15.7), Jul 66.1 (18.9), Aug 64.4 (18.0), Sep 56.2 (13.4), Oct 44.3 (6.8), Nov 33.1 (0.6), Dec 20.9 (−6.2). Annual 40.7 °F (4.8 °C). — [NOAA NCEI 1991–2020 monthly normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00014609&format=csv&dataTypes=MLY-TAVG-NORMAL)

**Lake surface temperature**
- Moose Pond South Basin, southern Maine [ME]: surface peaked at 29.4 °C on 18 July 2024. — [LEA](https://mainelakes.org/?p=91796)
- Two western Maine ponds (Tumbledown and Bigelow) [ME]: water and air followed similar trends, but average monthly air was cooler than average monthly water. Cloud cover strongly moderated surface water temperature. — [GSA NE 2008 abstract](https://gsa.confex.com/gsa/2008NE/webprogram/Paper135549.html)
- Northern New England [NE]: smaller lakes are warming faster. — [SUNY New Paltz news on lake warming](https://sites.newpaltz.edu/news/2017/07/lake-temperatures-rising-says-study-led-by-new-paltz-biology-professor/) (from a search summary; the claim was not confirmed on the page)

**Air-to-water models [N-temp].**
- air2water is a lumped ODE relating epilimnion temperature to air temperature alone. It achieves about 1 °C daily RMSE (about 0.5 °C monthly at Tahoe). — [Piccolroaz et al. 2013, HESS](https://hess.copernicus.org/articles/17/3323/2013/hess-17-3323-2013.pdf); [air2water guidelines](https://www.pagepressjournals.org/aiol/article/view/5791)
- Air temperature averaged over a period before day t predicts surface water temperature on day t. — [Matuszek & Shuter 1996](https://www.harkness.ca/PDFs/Contributions%201990s/matuszek%20shuter%201996.pdf)

**Steam fog [general meteorology].**
- It forms when water vapour is added to air much colder than its source, most commonly when very cold air drifts over relatively warm water. — [AMS Glossary, steam fog](https://glossary.ametsoc.org/wiki/Steam_fog)
- It is most common over deeper and larger lakes in late autumn and early winter, and needs light winds. In an example of steam devils, air was −21 °C over 1 °C water. Below about −29 °C the droplets can freeze into "frost smoke". — [Wikipedia, Steam devil](https://en.wikipedia.org/wiki/Steam_devil); [Echo Press, sea smoke](https://www.echopress.com/weather/weather-wednesday-sea-smoke)

**Evaporation**
- USGS water budgets for Lake Auburn and Sebago Lake include measured lake evaporation, but the values were not retrieved. — [USGS SIR 2004-5106 (Lake Auburn)](https://pubs.usgs.gov/sir/2004/5106)
- Catchment ET [ME/NE]: about 360–440 mm/yr for the Mattawamkeag basin (precipitation minus runoff, §2; my arithmetic) and about 500 mm/yr at Hubbard Brook. — [Hubbard Brook hydrology](https://hubbardbrook.org/online-book-chapter/hydrology/)

### Inferences
- **Surface temperature model.** A first-order lag of smoothed air temperature (time constant about 5–15 days for a 1–2 m mixed layer, longer for a deep mixed layer) plus a cloud and solar term would reproduce:
  - summer surface water warmer than the mean air temperature (24 °C sim peak vs 19 °C air);
  - autumn water staying warmer than air;
  - fog conditions.
- **Fog trigger.** Steam fog when T_water − T_air ≳ 8–10 °C and wind < about 3 m/s; this threshold is an inference, since the sources give only examples of large differences. Expected:
  - commonly on still September–November mornings (Houlton October air 6.8 °C mean, nights much colder, over 10–15 °C water);
  - on clear, calm summer dawns after cool nights;
  - not under ice.
  - Cosmetic in the sim (render-only), but it is a real marker of the season.
- **Lake evaporation.** Pending a Maine number, the open-water season (May–October) evaporation is plausibly of the same order as or higher than catchment ET (several hundred mm/yr). This drives part of the late-summer level decline in §3. It is unverified (see Gaps).

### Gaps
- No Maine or New England lake evaporation rate (mm/day or mm/yr) was confirmed. A search summary's "20–30 in/yr, 4–6 mm/day in summer" was from general knowledge, not a source, and is excluded.
- No measured lag (days) between air and surface water temperature was found for small New England lakes.
- No fog-frequency climatology was found for Maine lakes.

---

## 8. Groundwater inflow and springs (cold seeps used by fish)

### Takeaway
Groundwater can supply anywhere from a small fraction to over half of a small lake's inflow, depending on geology. Walden Pond (MA) gets 55 % of its inflow from groundwater; Lake Auburn (ME) gets about 62 % from surface streams. Its importance is in summer and winter: cold, steady seepage creates thermal refuges in streams, and slightly warm inflow under winter ice. Brook trout use groundwater seeps and confluences to survive hot summers. No Maine-specific seep temperatures or lake groundwater fractions were found.

### Cited Findings
**Lake water budgets.**
- Walden Pond, MA (flow-through kettle) [NE]: 45 % of inflow is precipitation (1.215 m/yr) and 55 % groundwater (1.47 m/yr). — [USGS WRIR 01-4137, Walden Pond](https://pubs.usgs.gov/publication/wri014137)
- Lake Auburn, ME [ME]: surface inflow is about 62 % of mean annual inflow; the rest is precipitation and groundwater. Municipal withdrawals are about 47 % of outflow. — [USGS SIR 2004-5106](https://pubs.usgs.gov/sir/2004/5106)
- Mirror Lake, NH (Hubbard Brook valley) [NE]:
  - Groundwater inflow estimates vary by method: 47,000 m³/yr (Darcy), 95,000 (geochemistry/isotopes), 133,000 (regional flow model). Groundwater terms carry the largest uncertainty in the budget.
  - Among the lake's sub-basins, the northwest one has the largest groundwater contribution at low flow.
  - Sources: [GW-Project Box 3, Mirror Lake](https://books.gw-project.org/groundwater-surface-water-exchange/?p=271); [Winter et al. 1989, USGS record](https://pubs.usgs.gov/publication/70185886)
- Southeastern Massachusetts: groundwater-flow models estimate budgets for 425 kettle ponds; for ponds without surface inlets or outlets, groundwater dominates inflow. — [USGS SIR 2011-5137](https://pubs.usgs.gov/publication/sir20115137)

**Groundwater and fish.**
- Brook trout use stream-confluence mixing zones and preferential groundwater discharge to survive warm summer periods, and seepage zones may be preferred spawning habitat [NE/N-temp]. — [Briggs et al. 2018, HESS 22:6383](https://hess.copernicus.org/articles/22/6383/2018/hess-22-6383-2018.html)
- Seeps fed by shallow flow paths (within about 5 m of the land surface) are more sensitive to seasonal air temperature and warming [NE/N-temp]. — same source.

**Groundwater under winter ice.** Highland Lake (Bridgton, ME) had unusually warm bottom water in winter 2026, possibly from sediment heat flux, groundwater intrusion or both [ME]. — [LEA Winter Monitoring Report 2026](https://mainelakes.org/wp-content/uploads/2026/06/LEAWinterMonitoringReport2026_final.pdf)

**Groundwater sustains low flow [N-temp].** Summer low flows in small Maine streams fall to about 0.02–0.1× the annual mean (§2), the groundwater-fed baseflow floor. Catchments with high groundwater discharge can stay cold despite warm summer air. — [Briggs et al. 2018](https://hess.copernicus.org/articles/22/6383/2018/)

### Inferences
- **Sim mechanism.** Add a small, steady groundwater inflow at fixed cells:
  - stream pool bottoms and the lake's littoral or deep margins;
  - temperature about the annual mean air temperature plus 1–2 °C, i.e. about 6–8 °C for Houlton's 4.8 °C mean (a standard hydrogeology rule of thumb, not sourced here);
  - roughly constant flow;
  - low O₂ and higher dissolved inorganic N and silica.
- **Effects:**
  - In summer, cold patches in the stream's pools act as thermal refuges that fish can find with a temperature sense.
  - In winter, the inflow is slightly warmer than 4 °C bottom water, and it keeps a small patch of the stream open.
  - It supplies the baseflow floor that keeps the stream's pools wet in a drought August, when the outlet nearly stops (§2, §3).
- **The groundwater share** of the Hot Brook lakes is unknown. A sensible default is 10–30 % of inflow (between Lake Auburn's surface-dominated budget and Walden's groundwater-dominated one), with a lower share for a lake on thin glacial till over bedrock.

### Gaps
- No Maine data were found on spring or seep temperatures or discharge.
- No groundwater fraction was found for a Washington County lake.
- The surficial geology (till vs outwash) of the Hot Brook catchment was not checked.

---

## 9. Thunderstorms, heat waves and their effects (mixing events, O₂ crashes) in small northern lakes

### Takeaway
Thunderstorms in northern Maine are a June–August phenomenon: about 2 days in May, 5 in June and 7 in July at Caribou, with severe hail and wind peaking in July. A 1-h, 10-year burst is about 33 mm at Danforth. Ordinary summer storms mostly stir the epilimnion and briefly deepen the mixed layer. Only very large events (hurricane remnants, about 90–200 mm) break stratification in deeper lakes, and even then stability recovers within about a week. The longer-lasting effect is ecological: terrestrial carbon raises respiration, so O₂ falls and the lake goes net-heterotrophic. Heat waves strengthen stratification and drive small-pond surface temperatures to about 29 °C.

### Cited Findings
**Thunderstorm frequency at Caribou [ME-N].** About 2 thunderstorm days in May, 5 in June and 7 in July. Severe weather (large hail, damaging winds) peaks in July. Severe thunderstorms occur somewhere in northern Maine in about every other May. — [NWS Caribou May climate](https://weather.gov/car/MayClimateSummary); [NWS Caribou June outlook](https://www.weather.gov/car/Juneoutlook); [NWS Caribou July 2017 outlook](https://weather.gov/car/July2017ClimateOutlook)

**Short-duration rain at Danforth [ME-N]** (NOAA Atlas 14 PDS).
- 15-minute: 9–12 mm at the 1–2-year return period.
- 1-hour: 16 mm (1-yr), 21 mm (2-yr), 33 mm (10-yr), 53 mm (100-yr).
- Source: [NOAA Atlas 14 PFDS, Danforth](https://hdsc.nws.noaa.gov/cgi-bin/new/cgi_readH5.py?lat=45.66&lon=-67.87&type=pf&data=depth&units=metric&series=pds)

**Large storm effects [NE].**
- Thermal stability fell within hours after Irene. All but one lake recovered to within 80 % of pre-storm stability within a week.
- Water cooling predicted the GPP drop.
- Increased respiration, decoupled from GPP, drove NEP negative.
- The thermal disturbance was shorter-lived than the disturbance from terrestrial inflows.
- Source: [Klug et al. 2012](https://bpb-us-w2.wpmucdn.com/hawksites.newpaltz.edu/dist/1/8098/files/2012/10/Klug2012-EST-HurricaneIrenePaper.pdf)

**Summer stratification [NE].** At Lake Sunapee, NH, it is strong (about 15 °C surface–hypolimnion difference) and was interrupted only by extremely large, rare storms such as hurricanes. — [Springer ESM, Aquatic Sciences 2016](https://media.springernature.com/original/springer-static/esm/art%3A10.1007%2Fs00027-016-0499-7/MediaObjects/27_2016_499_MOESM1_ESM.pdf)

**Storm mixing in a small shallow lake [N-temp, subtropical Taiwan].** Heavy rain can deliver more water than the lake holds, so inflow drives mixing. Whole-column mixing is distinct from upper-thermocline mixing, and convective cooling acts alongside wind stirring during storms. — [J. Limnol. 2016](https://www.jlimnol.it/jlimnol/article/view/jlimnol.2016.1477)

**Wind and hypoxia [N-temp].** Stronger late-spring winds delayed hypolimnetic hypoxia. Calm, stable late summers slowed its recovery. — [NOAA repository](https://repository.library.noaa.gov/view/noaa/48461/noaa_48461_DS1.pdf)

**Lake heatwaves [N-temp/global].**
- Defined as at least 5 days above the 90th-percentile surface temperature.
- They are projected to become hotter and longer, extending across multiple seasons under high emissions.
- High-latitude lakes see more intense heatwaves than low-latitude lakes.
- Source: [Woolway et al. 2021, Nature 589:402 (Bangor record)](https://research.bangor.ac.uk/portal/en/researchoutputs/lake-heatwaves-under-climate-change(9c36c873-7725-4942-8076-1adf883fa0e2)/export.html); [Freshwater Blog summary](https://freshwaterblog.net/2021/05/20/lake-heatwaves-to-become-hotter-and-longer-by-the-end-of-the-century/)

**Heat in southern Maine [ME].** Moose Pond South Basin reached 29.4 °C at the surface on 18 July 2024. — [LEA](https://mainelakes.org/?p=91796)

### Inferences
- **Thunderstorm events** in the weather machine: about 15–20 per summer (May–September), clustered in June–August, mostly afternoons. Each brings:
  - a gust front (wind 2–3× the mean for 10–60 min);
  - 10–30 mm of rain in under 1 h;
  - a cool, rapid inflow pulse in the stream (§2: 1-day rise);
  - a short turbidity spike.
- **Mixing response:**
  - The 14-m lake's epilimnion deepens by perhaps 0.5–2 m, through wind plus convective cooling under cold rain and cloud.
  - The 4-m pond can mix fully.
  - The hypolimnion is not reoxygenated except by hurricane-class events (≥90 mm, high PVR).
  - Partial mixing that entrains low-O₂ metalimnetic water into the epilimnion, together with the post-storm respiration rise from terrestrial carbon, is the mechanism for summer O₂ dips after storms. In the pond, full overnight mixing plus cloud-suppressed photosynthesis plus extra respiration can briefly drive whole-column O₂ low: the classic small-pond summer kill.
- **Heat waves** (5+ days with afternoon air > about 29–30 °C and calm nights):
  - The pond surface goes to about 28–30 °C.
  - Thermocline sharpening raises Schmidt stability.
  - Hypolimnetic O₂ depletion accelerates (warmer, longer isolation).
  - Fish are squeezed between warm surface water and anoxic deep water: the coolwater "habitat squeeze" for perch and white sucker. This links to the angler-observed summer positioning of fish.

### Gaps
- No annual thunderstorm-day total was found for Caribou or Bangor; August and September were not retrieved.
- No high-frequency storm-mixing data were found for a small Maine lake (GLEON has Sunapee NH, not Maine).
- No documented summer fish kill from a post-storm O₂ crash in a Maine pond was found.
- Woolway et al. 2021 mean heatwave intensity and duration values were not retrieved.
