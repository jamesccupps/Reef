# Checking the Gemini "Danforth hydrology and weather" report against its sources

**What was checked (2026-10-20).** The source is a Google Gemini report that the user supplied: `docs/research_notes/fetched/gemini_2026-10-20_danforth_hydrology_weather.txt`. I checked every number in its §1 (streamflow) and §3 (weather) against the primary source it cites, or against the USGS or NOAA data service behind it. Its §2, §4 and §5 report only "not found", so there was nothing to check there. I then compared the results with:
- `../Maine lake shores and catchment/weather_and_catchment_hydrology.md` (written WCH below);
- `docs/review/environment_coverage.md`.

**Sources read directly:**
- USGS SIR 2004-5026, Tables 1–3, read with pymupdf and the table pages checked as images;
- USGS WDR ME-96-1, p. 63, checked as an image;
- USGS SIR 2007-5170, Table 5;
- the USGS waterservices for daily values, instantaneous values, daily, monthly and annual statistics, peak flows and site data;
- NOAA NCEI 1991–2020 normals (monthly, annual and hourly) through the data service;
- the NWS Caribou drought statements of 17 Sep, 1 Oct, 8 Oct and 15 Oct 2026 (PDF), and the NWS Caribou summer-2026 and fall-2025 seasonal narratives.

**Rules followed.** Nothing blocked was bypassed. www.maine.gov (MEMA) returned HTTP 403, so that claim is UNVERIFIABLE. I did not use Gemini's third-party sites (snoflo.org, cityweatherdata.com) as evidence; I opened cityweatherdata once, only to see which station it names (it names none). No fetched page contained instructions aimed at me.

**Verdicts:** CONFIRMED, PARTLY, WRONG, UNVERIFIABLE. "[mine]" marks my own arithmetic on the agency data.

---

## Verdict table

| # | Gemini claim | Verdict | What the source says | URL read |
|---|---|---|---|---|
| 1a | Mattawamkeag R. nr Mattawamkeag (01030500), 1934–2001 monthly means: Jan 1,420, Feb 1,280, Mar 2,220, Apr 8,470, May 5,500, Jun 1,980, Jul 1,030, Aug 720, Sep 811, Oct 1,400, Nov 2,710, Dec 2,600; annual 2,520 cfs; 1,418 mi² | **CONFIRMED** | Table 1 gives every value exactly, for calendar years 1934–2001. Method: "computed as the mean of all monthly means" | [SIR 2004-5026](https://pubs.usgs.gov/sir/2004/5026/pdf/sir2004-5026.pdf) p. 5 |
| 1b | Meduxnekeag R. nr Houlton (01018000), 1940–82: Jan 152, Feb 156, Mar 264, Apr 1,080, May 619, Jun 216, Jul 108, Aug 88.1, Sep 112, Oct 178, Nov 331, Dec 284; annual 299 cfs; 175 mi² | **CONFIRMED** | Table 1, identical | same, p. 5 |
| 1c | Fractions of the annual mean: Mattawamkeag Apr 3.361, Aug 0.286; Meduxnekeag Apr 3.612, Aug 0.295 (and the rest of both columns) | **CONFIRMED** [mine] | All 24 fractions reproduce to 0.001 | derived from Table 1 |
| 1d | WDR column "WY 1935–1996": 10 months match, but Aug and Sep given as "Not found in snippet" | **PARTLY** | The ten months and the 2,512-cfs annual mean match. The source also gives **Aug 747** and **Sep 811** | [WDR ME-96-1](https://pubs.usgs.gov/wdr/1996/me-96-1/report.pdf) p. 63 |
| 1e | 7-day low flows and flow-duration percentiles (not in Gemini's report) | new | **7Q10:** Mattawamkeag 65.8 cfs (1934–2001); Meduxnekeag 5.46 cfs (1940–82) (SIR Table 3). **Flow duration, WY1935–96:** 10 % exceeds 6,480, 50 % 1,230, 90 % 265 cfs. Lowest daily mean 32 cfs (4 Sep 1995); lowest 7-day 33 cfs (1 Sep 1995); instantaneous minimum 30 cfs (7 Sep 1995); maximum 29,200 cfs (23 Mar 1936) (WDR p. 62–63) | SIR p. 7; WDR p. 62–63 |
| 2a | Wettest year WY1984, 4,015 cfs (160 %); driest WY1985, 1,307 cfs (52 %), in 1935–96 | **CONFIRMED** (for 1935–96) | WDR lists highest annual mean 4,015 (1984) and lowest 1,307 (1985). **Updated to WY2025** [mine, NWIS annual stats]: wettest are WY2006 4,266, WY2011 4,094, then 1984; WY1985 is still the driest, followed by 1957 (1,394), 2001 (1,526) and 1948 (1,540). WY1935–2025 mean 2,629 cfs; SD 629; CV 0.24 | WDR p. 63; [NWIS annual statistics](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030500&statReportType=annual&statYearType=water&parameterCd=00060) |
| 2b | WY1996: 3,408 cfs (136 %); 1,247,507 cfs-days; 14,200 cfs highest daily mean in April | **CONFIRMED** | "FOR 1996 WATER YEAR": 1247507, 3408, 14200 on Apr 26 | WDR p. 63 |
| 2c | "WY1995": 2,195 cfs (87 %); 801,263 cfs-days; 10,400 cfs on Apr 17; "moderately dry" | **WRONG** (mislabelled) | These are the WDR's **1995 calendar-year** column. The 1995 water year's mean was 1,871 cfs (74 %) [NWIS]. 1995 was a drought: it holds the record-low monthly mean (Sep 1995, 38.6 cfs) and the 1934–96 daily low | WDR p. 63; NWIS annual statistics |
| 3a | 12–17 Oct 2026: 23.0–48 cfs, gauge height 3.13–3.43 ft | **CONFIRMED** (provisional data) | Instantaneous: 23.0 cfs at 3.12 ft (12 Oct 00:00), rising to 56 cfs and 3.50 ft on 17 Oct. Daily means: 23.2, 24.9, 31.4, 33.9, 40.4, 52.0 cfs. All flagged "P" (provisional) | [NWIS IV](https://waterservices.usgs.gov/nwis/iv/?format=rdb&sites=01030500&parameterCd=00060,00065&startDT=2026-10-12&endDT=2026-10-17); [NWIS DV](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=01030500&parameterCd=00060&statCd=00003&startDT=2025-01-01&endDT=2026-10-20) |
| 3b | Against an Oct 17 median of ~1,250 cfs; 92 years of record | **PARTLY** | 92 years ✓. The NWIS daily statistics (approved data, WY1935–2026) give, for 17 Oct, a **mean of 1,470** and a **median of 920 cfs**. 1,250 cfs is the *mean* for 12–13 Oct | [NWIS daily statistics](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030500&statReportType=daily&statTypeCd=all&parameterCd=00060) |
| 3c | Real drought or artefact? (the question asked of me) | **Real drought** | (i) The flow falls smoothly from 69 cfs (21 Aug) to 23.1 cfs (11 Oct). (ii) It responds to rain from 13 Oct (23→77 cfs by 19 Oct). (iii) October is ice-free, and no ice or equipment codes appear. (iv) NWS Caribou: "2nd lowest flow since 1934 was set on 10/7/2026", after an earlier 2nd-lowest on 9/27/2026. The record approved daily low is 21.5 cfs (28 Sep 2020). Monthly means [mine]: Aug 2026 78.8, Sep 40.4 (Sep 1995 38.6 is the lowest month on record), 1–19 Oct 32.5 cfs. Water year 2026, partly provisional: 1,626 cfs (0.62×), about the 5th-driest of 92 | [NWS Caribou DGT 15 Oct 2026](https://www.weather.gov/media/car/DGT/DGT_CAR_10152026.pdf); [DGT 1 Oct 2026](https://www.weather.gov/media/car/DGT/DGT_CAR_10012026.pdf) |
| 3d | Drought in Washington/Aroostook, 2025–26 (the question asked of me) | **CONFIRMED** | **2025:** by November, north and central Aroostook and western Washington were in D2; Houlton's fall precipitation was 7.47 in, 3.58 in below normal; record-low streamflows "including … Mattawamkeag". **2026:** Aroostook was out of drought by late June, then D1 returned in August. On 17 Sep and 1 Oct, all of Aroostook and Washington were D1. On 15 Oct, all of Washington was D1, much of northern and central Aroostook D2, and Maine as a whole was 52 % D1, 43 % D2 and 4.6 % D3. NWS also reports lakes running low, "exposing rocks" | [NWS Fall 2025 narrative](https://www.weather.gov/car/Fall2025SeasonalNarrativeforNorthernandEasternMaine); [Summer 2026 narrative](https://www.weather.gov/car/Summer2026SeasonalNarrativeforNorthernandEasternMaine); [DGT 17 Sep 2026](https://www.weather.gov/media/car/DGT/DGT_CAR_09172026.pdf); DGT 15 Oct 2026 |
| 3e | MEMA Drought Task Force, 19 Dec 2025: about 60 % of Maine in severe drought (from my search, not from Gemini) | **UNVERIFIABLE** | maine.gov returned 403. The NWS fall narrative agrees in substance ("generally the entire state in severe drought or higher" in October 2025) | maine.gov/mema (blocked) |
| 3f | Maximum recorded peak 25,400 cfs (1934–2026, via Snoflo) | **WRONG** | 25,400 cfs is the 26 Apr 1958 peak, only about the 7th largest. The gauge's record is 29,200 cfs (23 Mar 1936). The peak file also holds estimated peaks of 29,400 (Apr 1934) and 46,600 (May 1923) from before the continuous record | WDR p. 62; [NWIS peaks](https://nwis.waterdata.usgs.gov/nwis/peak?site_no=01030500&agency_cd=USGS&format=rdb) |
| 5a | Trout Brook nr Danforth (01030300) is a crest-stage partial-record gauge | **PARTLY** | NWIS holds only 10 annual peaks (WY1964–73: 65–354 cfs, gauge 2.2–6.5 ft) and no daily data, which fits a partial-record peak station. Neither NWIS nor SIR 2007-5170 uses the word "crest-stage" for it. Site: 45.6953 N, 67.9014 W, Aroostook County, HUC 01020003 | [NWIS site](https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=01030300&siteOutput=expanded&siteStatus=all); [NWIS peaks](https://nwis.waterdata.usgs.gov/nwis/peak?site_no=01030300&agency_cd=USGS&format=rdb); [monitoring location](https://waterdata.usgs.gov/monitoring-location/USGS-01030300/) |
| 5b | Drainage 4.46 mi²; "peak-flow metrics 145.8, 497.9, 586.1 cfs" | **PARTLY** | SIR 2007-5170 Table 5 gives 4.46 mi² and these as the **2-, 50- and 100-year peaks** (Gemini didn't say which). The NWIS site file and monitoring page give **4.22 mi²** | [SIR 2007-5170](https://pubs.usgs.gov/sir/2007/5170/pdf/sir2007-5170.pdf) Table 5 |
| 4a | Houlton monthly high/mean/low, e.g. Jan 24/14/3 °F, Jul 78/66/54 °F | **PARTLY** | Within 0–1.4 °F of NOAA's Houlton Intl AP (USW00014609) normals, but not equal to them (table below). Its frost-day counts equal the **average of NOAA's two Houlton stations** (airport and Houlton 5N, USC00173944) to ±0.1 day. So cityweatherdata appears to blend the two [inference]; it names no station | [NCEI monthly normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00014609,USC00173944,USC00171833&format=csv&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL,MLY-TAVG-NORMAL,MLY-PRCP-NORMAL) |
| 4b | Annual means: high 50.2 °F, mean 41 °F, low 30.3 °F; days below 32 °F 183.7, below 0 °F 37.2, above 90 °F 2.5 | **PARTLY** (the high is WRONG) | Airport: 51.6 / 40.7 / 29.7 °F; 190.0 / 38.9 / 2.6 days. Houlton 5N: 52.7 / 41.8 / 30.9 °F; 178.1 / 35.6 / 2.3 days. 50.2 °F matches neither station | [NCEI annual normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-annualseasonal-1991-2020&stations=USC00171833,USC00173944,USW00014609&format=csv&startDate=0001-01-01&endDate=9996-12-31) |
| 4c | Annual precipitation 41.69 in (Houlton, 1991–2020) | **WRONG** as a NOAA station normal | Airport 39.28 in; Houlton 5N 44.14 in. Their mean is 41.71 in, which is Gemini's figure within rounding. **Danforth's own co-op station (USC00171833): 45.56 in (1,157 mm)** | same |
| 4d | Monthly precipitation, wind and cloud "not found" | now found | Monthly precipitation for Houlton AP, Houlton 5N and Danforth, and Houlton wind from the hourly normals: tables below. Cloud cover: Houlton's hourly normals hold cloud fields for only a few September–October hours, so it is effectively still not found | NCEI monthly and [hourly normals](https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-hourly-1991-2020&stations=USW00014609&format=csv&startDate=0001-01-01&endDate=9996-12-31) |

---

## The verified hydrograph, as fractions of the annual mean

Each value is the monthly mean flow divided by the annual mean flow. Columns A–D are means. Column E is the median month divided by the mean year: the "typical" year rather than the average one.

| Month | A. SIR, Mattawamkeag 1934–2001 (÷2,520) | B. SIR, Meduxnekeag 1940–82 (÷299) | C. WDR, Mattawamkeag WY1935–96 (÷2,512) | D. NWIS, Mattawamkeag 1935–2025 [mine] (÷2,626) | E. SIR median month ÷ mean annual, Mattawamkeag |
|---|---|---|---|---|---|
| Jan | 0.563 | 0.508 | 0.571 | 0.607 | 0.403 |
| Feb | 0.508 | 0.522 | 0.510 | 0.490 | 0.319 |
| Mar | 0.881 | 0.883 | 0.814 | 0.943 | 0.480 |
| Apr | **3.361** | **3.612** | 3.336 | 3.317 | 2.968 |
| May | 2.183 | 2.070 | 2.217 | 1.994 | 1.690 |
| Jun | 0.786 | 0.722 | 0.818 | 0.748 | 0.540 |
| Jul | 0.409 | 0.361 | 0.414 | 0.422 | 0.255 |
| Aug | **0.286** | **0.295** | 0.297 | 0.298 | 0.152 |
| Sep | 0.322 | 0.375 | 0.323 | 0.322 | 0.141 |
| Oct | 0.556 | 0.595 | 0.566 | 0.602 | 0.302 |
| Nov | 1.075 | 1.107 | 1.111 | 1.125 | 0.889 |
| Dec | 1.032 | 0.950 | 1.029 | 1.136 | 0.671 |

**Notes for the sim.**
- **Columns A–C are calendar- or water-year means.** Their day-weighted mean is within 0.4 % of 1. For an exact 1.0, divide A by 0.9961 [mine].
- **Column D reproduces WCH §2's table** (0.61 / 0.49 / 0.95 / 3.31 / 1.99 / 0.75 / 0.42 / 0.30 / 0.32 / 0.60 / 1.13 / 1.13).
- **D against A:** D has wetter winters (Jan, Mar, Dec +0.05 to +0.10) and a smaller May (−0.19). This is the period difference: D adds 2002–2025.
  - **For the current climate, use D**, as WCH does.
  - A–C confirm the shape: an April peak of about 3.3–3.6×, an August–September low of about 0.29–0.32×, and a second high-flow season in Nov–Dec of about 1.0–1.1×.
- **The median year is much lower in summer than the mean** (column E: Aug 0.15, Sep 0.14). Storm years pull the summer mean up. A "typical-summer" brook should sit nearer 0.15–0.2× than 0.3×.
- **Floors** (all [mine] from the figures above):
  - 7Q10 = 0.026× the mean (Mattawamkeag) and 0.018× (Meduxnekeag);
  - Q90 = 0.105×;
  - the 2026 minimum, 23 cfs, = 0.009×.
- **Year-to-year:** annual means range from 0.50× to 1.62× the long-term mean (WY1935–2025, CV 0.24).
- **Scale caveat:** both gauges drain large basins (175 and 1,418 mi²). Hot Brook is the outflow of Upper Hot Brook Lake, and lake storage damps and delays its peaks (WCH §2 inferences).

---

## Houlton and Danforth climate normals, 1991–2020 (NOAA NCEI)

**Houlton Intl Airport, USW00014609.** °F (°C); precipitation in inches (mm). "Gemini" gives the report's high / mean / low for comparison.

| Month | Mean high | Mean | Mean low | Precip | Days min < 32 °F | Days min < 0 °F | Days max > 90 °F | Gemini hi/mean/lo |
|---|---|---|---|---|---|---|---|---|
| Jan | 23.2 (−4.9) | 12.9 (−10.6) | 2.6 (−16.3) | 2.65 (67) | 30.2 | 14.7 | 0.0 | 24/14/3 |
| Feb | 26.3 (−3.2) | 14.8 (−9.6) | 3.2 (−16.0) | 1.95 (50) | 27.4 | 12.4 | 0.0 | 27/16/4 |
| Mar | 36.0 (2.2) | 25.5 (−3.6) | 15.0 (−9.4) | 2.67 (68) | 29.4 | 4.9 | 0.0 | 37/26/16 |
| Apr | 49.3 (9.6) | 38.6 (3.7) | 27.9 (−2.3) | 2.94 (75) | 21.9 | 0.1 | 0.0 | 50/40/28 |
| May | 63.6 (17.6) | 51.2 (10.7) | 38.9 (3.8) | 3.46 (88) | 7.7 | 0.0 | 0.2 | 65/52/40 |
| Jun | 72.5 (22.5) | 60.2 (15.7) | 48.0 (8.9) | 4.04 (103) | 0.6 | 0.0 | 0.7 | 73/61/49 |
| Jul | 78.1 (25.6) | 66.1 (18.9) | 54.1 (12.3) | 3.63 (92) | 0.0 | 0.0 | 0.7 | 78/66/54 |
| Aug | 76.7 (24.8) | 64.4 (18.0) | 52.1 (11.2) | 3.52 (89) | 0.0 | 0.0 | 0.8 | 78/65/53 |
| Sep | 68.3 (20.2) | 56.2 (13.4) | 44.0 (6.7) | 3.40 (86) | 4.0 | 0.0 | 0.2 | 68/56/45 |
| Oct | 54.5 (12.5) | 44.3 (6.8) | 34.0 (1.1) | 4.04 (103) | 15.5 | 0.0 | 0.0 | 54/44/34 |
| Nov | 41.3 (5.2) | 33.1 (0.6) | 24.8 (−4.0) | 3.61 (92) | 23.6 | 0.3 | 0.0 | 42/34/26 |
| Dec | 29.6 (−1.3) | 20.9 (−6.2) | 12.2 (−11.0) | 3.37 (86) | 29.5 | 6.4 | 0.0 | 30/22/12 |
| Year | 51.6 (10.9) | 40.7 (4.8) | 29.7 (−1.3) | 39.28 (998) | 190.0 | 38.9 | 2.6 | 50.2/41/30.3 |

**Danforth co-op, USC00171833** (45.661 N, 67.861 W, in the lakes' own town). Same units; snowfall in inches.

| Month | Mean high | Mean | Mean low | Precip | Snowfall | Days min < 32 °F | Days min < 0 °F | Days max > 90 °F |
|---|---|---|---|---|---|---|---|---|
| Jan | 25.2 (−3.8) | 13.4 (−10.3) | 1.6 (−16.9) | 3.44 (87) | 23.2 | 30.3 | 15.6 | 0.0 |
| Feb | 27.8 (−2.3) | 14.6 (−9.7) | 1.5 (−16.9) | 3.30 (84) | 22.1 | 27.2 | 14.9 | 0.0 |
| Mar | 37.7 (3.2) | 25.7 (−3.5) | 13.8 (−10.1) | 3.48 (88) | 22.1 | 29.2 | 5.8 | 0.0 |
| Apr | 49.9 (9.9) | 38.9 (3.8) | 27.9 (−2.3) | 3.58 (91) | 5.1 | 23.2 | 0.1 | 0.0 |
| May | 63.9 (17.7) | 50.8 (10.4) | 37.6 (3.1) | 3.67 (93) | 0.0 | 9.5 | 0.0 | 0.2 |
| Jun | 73.7 (23.2) | 60.9 (16.1) | 48.1 (8.9) | 3.54 (90) | 0.0 | 1.4 | 0.0 | 0.8 |
| Jul | 78.1 (25.6) | 65.8 (18.8) | 53.5 (11.9) | 4.08 (104) | 0.0 | 0.0 | 0.0 | 0.8 |
| Aug | 77.3 (25.2) | 64.6 (18.1) | 51.9 (11.1) | 3.75 (95) | 0.0 | 0.0 | 0.0 | 1.1 |
| Sep | 69.7 (20.9) | 56.4 (13.6) | 43.1 (6.2) | 3.79 (96) | 0.0 | 5.6 | 0.0 | 0.4 |
| Oct | 56.6 (13.7) | 44.4 (6.9) | 32.2 (0.1) | 4.65 (118) | 1.4 | 17.5 | 0.0 | 0.0 |
| Nov | 43.6 (6.4) | 33.9 (1.1) | 24.1 (−4.4) | 4.14 (105) | 4.4 | 24.2 | 0.4 | 0.0 |
| Dec | 31.6 (−0.2) | 21.4 (−5.9) | 11.2 (−11.6) | 4.14 (105) | 17.4 | 29.8 | 6.8 | 0.0 |
| Year | 52.9 (11.6) | 40.9 (4.9) | 28.9 (−1.7) | 45.56 (1,157) | 95.7 | 197.9 | 43.6 | 3.3 |

Houlton 5N (USC00173944) for reference: 44.14 in precipitation, 95.9 in snowfall, annual mean 41.8 °F.

**Wind, Houlton Intl AP**, 1991–2020 hourly normals (`HLY-WIND-AVGSPD`, `HLY-WIND-PCTCLM`). I averaged them by month [mine]; hours are local standard time.

| | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Year |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mean (mph) | 7.6 | 7.9 | 8.3 | 8.0 | 7.6 | 6.6 | 6.0 | 5.7 | 6.2 | 6.9 | 7.3 | 7.5 | 7.1 |
| Mean (m/s) | 3.40 | 3.51 | 3.72 | 3.58 | 3.40 | 2.95 | 2.67 | 2.56 | 2.78 | 3.07 | 3.27 | 3.33 | 3.18 |
| 10:00–17:00 (mph) | 9.1 | 10.0 | 10.6 | 10.6 | 10.1 | 9.0 | 8.4 | 8.4 | 8.8 | 9.1 | 8.8 | 8.6 | |
| 22:00–05:00 (mph) | 6.7 | 6.5 | 6.7 | 5.8 | 5.4 | 4.5 | 4.0 | 3.7 | 4.4 | 5.3 | 6.3 | 6.7 | |
| Calm hours (%) | 19.6 | 19.1 | 16.9 | 17.4 | 17.1 | 20.3 | 22.5 | 25.7 | 23.7 | 21.4 | 18.5 | 18.6 | |

---

## Conflicts with existing notes (and what is new or already known)

**Already known (Gemini adds nothing):**
- **The Mattawamkeag monthly hydrograph** is already in WCH §2, from NWIS 1934–2026: annual 2,620 cfs, Apr 3.31, Aug 0.30. My NWIS recompute (column D) matches it. SIR's 1934–2001 numbers (column A) confirm the shape.
- **Houlton monthly mean temperatures and monthly precipitation** (39.28 in) are in WCH §1 and §7, from the same NOAA airport normals.
- **The Caribou wind normals** (WCH §6).
- **The record-low monthly mean**, 38.6 cfs in September 1995 (WCH §2).
- **Winter 2025–26**, Houlton's driest on record (WCH §1).

**New:**
1. **A Danforth co-op station with full 1991–2020 normals** (USC00171833). WCH §1 "Gaps" says "No Danforth co-op station was found", so this closes that gap. Danforth is about 16 % wetter than Houlton airport: 45.56 against 39.28 in. Its monthly precipitation is 84–118 mm, against the 50–103 mm that environment_coverage plans to calibrate rain to; its annual snowfall is 95.7 in.
2. **Houlton airport wind**, monthly, with day and night values and calm percentages. It agrees with Caribou to within about 0.5 mph, but has more calm hours (17–26 % against Caribou's 9.6–19.4 % where both are listed).
3. **Low-flow statistics:**
   - 7Q10 is 65.8 cfs (0.026×) at Mattawamkeag and 5.46 cfs (0.018×) at Meduxnekeag;
   - the WY1935–96 flow-duration Q10 / Q50 / Q90 are 2.58× / 0.49× / 0.105× the mean;
   - the median-month hydrograph (column E) has summers about half the mean.
4. **Year-to-year flow for the planned year types:**
   - annual means range from 0.50× to 1.62× (CV 0.24);
   - wettest years: 2006, 2011, 1984;
   - driest years: 1985, 1957, 2001;
   - dry-summer examples: 1995, 2020, 2025, 2026.
5. **The present is a drought (2025–26, back-to-back).**
   - Mattawamkeag had its 2nd-lowest flow on record in September–October 2026: about 0.01× the mean.
   - Washington County is D1; northern and central Aroostook is D2.
   - NWS reports lakes running low and groundwater below normal, with a few monitoring wells at record lows.
   - This bears on what the human sees at the lakes now (low water, exposed rocks) and is a ready-made "drought year" for the sim.

**Conflicting or needing care:**
1. **Houlton annual precipitation.** Gemini's 41.69 in is not a NOAA station normal; WCH's 39.28 in (airport) is right for that station. For the lakes, though, Danforth's 45.56 in is the better number, so WCH's runoff ratio of about 0.6 (998–1,082 mm) should be re-read against 1,157 mm. The ratio drops to about 0.55 if Danforth is representative [mine].
2. **Mattawamkeag annual mean.** SIR's 2,520 cfs (1934–2001) against WCH's 2,620 cfs (1934–2026) is a difference of period, not an error. Recent decades are wetter in winter and lower in May. Use one period consistently.
3. **The peak-flow range.** WCH §2's "6,190–46,600 cfs" includes estimated peaks from before the gauge (1903–1934, peak code 2; the 46,600 is May 1923). The continuous record's maximum is 29,200 cfs (1936). Gemini's 25,400 cfs maximum is wrong.
4. **The "WY1995" dry-year example** in Gemini is the 1995 calendar year. Don't carry it into the notes as a water year.
5. **The Trout Brook drainage area** is 4.46 mi² in SIR 2007-5170 but 4.22 mi² in NWIS. It doesn't matter for the sim; it is a 1960s peak-only site of 10 years.
6. **Gemini's Houlton temperatures** differ from WCH's NOAA airport values by up to 1.4 °F (e.g. its Jan mean is 14 °F, against 12.9 °F). Keep WCH's values; the "50.2 °F" annual high is wrong.
