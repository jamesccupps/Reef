# Upper and Lower Hot Brook Lakes (MIDAS 1076 / 1072) and the connecting Hot Brook: public records

Scope: every record I could reach for the two lakes and the stream between them (T8 R4 NBPP / Danforth / Bancroft, Washington and Aroostook counties, Maine). Where a value for these lakes does not exist, I give values from nearby lakes and **label each one as an analogue with its name**. Values marked "derived" are my own arithmetic on official data. The method is stated so it can be rechecked.

Blocked or unavailable sources:
- Lakes of Maine (lakesofmaine.org) returns HTTP 403 to non-browser clients for every page I tried (lake overview and water-clarity pages for 1076/1072). I did not try to get round it.
- The 2025 statewide Maine Lake Water Quality Data file (Gulf of Maine KB record 10103) has no download link on its record page.
- Maine Audubon's per-lake loon file (2016) is a dead link (404).

---

## Water quality: Secchi, colour, TP, chlorophyll-a, pH, alkalinity, conductivity, DOC, temperature and O2 profiles, trophic state

### Takeaway
**No water-quality measurement of any kind exists in the public record for either Hot Brook lake.** The only exception is one 1949 temperature pair. Neither lake has a Maine DEP / Lake Stewards sampling station. Neither lake appears in DEP's 1940–2018 statewide annual-means file or in the EPA/USGS Water Quality Portal.

The best analogue is **Baskahegan Lake (MIDAS 1078)**: shallow, 6.7 m maximum depth, in the same Baskahegan Stream drainage and about 13 km away. It reads Secchi 3.7–4.7 m, colour 46 SPU, TP 9–10 µg/L, chl-a 3.1–3.3 µg/L, pH 6.6, alkalinity 5.5 mg/L, conductivity 26 µS/cm. That is a moderately coloured, low-alkalinity, oligo-mesotrophic lake.

### Cited Findings
**Hot Brook lakes themselves:**
- **No WQP lake station.** A Water Quality Portal station search over 45.57–45.72 N, 68.02–67.86 W returns only these sites: wells, the Trout Brook near Danforth gauge (USGS-01030300), a Baskahegan Stream site, a DEP stream site "SCX1", and an NWCA wetland. A county-wide search of Washington County lake/reservoir stations (165 stations) has no station named Hot Brook, and no MIDAS 1072 or 1076. — [WQP station search, bbox](https://www.waterqualitydata.us/data/Station/search?bBox=-68.02,45.57,-67.86,45.72&mimeType=csv); [WQP Washington Co. lakes](https://www.waterqualitydata.us/data/Station/search?countycode=US%3A23%3A029&siteType=Lake%2C%20Reservoir%2C%20Impoundment&mimeType=csv)
- **No DEP sampling station.** The DEP "Lake Sample Stations" GIS layer has **no stations for MIDAS 1072 or 1076**. The same query returns stations for nearby Baskahegan Lake (1078, station 1 = deep hole), Brackett Lake (1068) and North Lake (1063), so the layer works and the absence is real. — [Maine DEP Lakes Data MapServer, layer 1](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/1)
- **Not in the statewide annual-means file.** DEP's *Maine Lakes Transparency, Color & Chemistry: Annual Mean Values* covers 1940–2018 and 1,072 lakes, compiled by L. Bacon (DEP) and P. Vaux (LSM) and uploaded in Aug 2019. It has **no rows for MIDAS 1072 or 1076**. — [DEP annual means xlsx, via Gulf of Maine KB](https://ww3.gulfofmaine.org/kb/files/9679/MaineLakes_Secchi_Color_Chemistry_AnnualMeans.xlsx) ([record](https://ww3.gulfofmaine.org/kb/record.html?recordid=9679))
- **The newer 2025 file could not be checked.** *Maine Lake Water Quality Data 20251113* (LSM + DEP, 1952–2025) holds individual Secchi, temperature, DO, pH, colour, conductivity, alkalinity, TP and chl-a records. Its KB record carries no file link, and its data portal (Lakes of Maine) is bot-blocked. — [KB record 10103](https://ww3.gulfofmaine.org/kb/record.html?recordid=10103)
- **The only measured water property for either lake: the August 1949 MDIFW survey.**
  - The text layer reads "Temperatures: Surface – 74 °F" (23.3 °C) and "75 feet – 71 °F" (21.7 °C), and it is identical on both sheets.
  - "75 feet" is impossible in an 18 ft (Upper) or 13 ft (Lower) lake. It is probably an OCR or template error, perhaps for "15 feet"; I could not view the scanned image.
  - Both sheets say the lake "is shallow and does not stratify during summer months".
  — [MDIFW Upper Hot Brook Lake survey sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [MDIFW Lower Hot Brook Lake survey sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)

**Analogue lakes (DEP annual means), all labelled with name and MIDAS.** Areas and maximum depths come from the DEP MIDAS-polygon and depth-point layers. Units: Secchi in m, colour in SPU, chl-a and TP (epilimnetic core) in µg/L, alkalinity in mg/L as CaCO3, conductivity in µS/cm. All rows are from the [DEP annual means file](https://ww3.gulfofmaine.org/kb/files/9679/MaineLakes_Secchi_Color_Chemistry_AnnualMeans.xlsx) and the [DEP lakes GIS](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer).

| Analogue lake (MIDAS), size, max depth | Year | Secchi | Colour | Chl-a | pH | Alk | Cond | TP |
|---|---|---|---|---|---|---|---|---|
| **Baskahegan Lake (1078)**: same Baskahegan drainage, 6,815 ac, 6.7 m | 2001 | 4.3 | — | — | — | — | — | — |
| | 2003 | 3.7 | — | — | — | — | — | — |
| | 2004 | 3.8 | **46** | 3.1 | 6.61 | 5.5 | 26 | 10 |
| | 2011 | 4.7 | — | 3.3 | — | — | — | 9 |
| **Faulkner Lake (1064)**, Weston: 80 ac, 3.7 m | 2003–2006 | 3.5–4.5 | — | — | — | — | — | — |
| | 2004 | — | — | 3.6 | 6.83 | — | — | 12 |
| | 2006 | — | 18 | 5.5 | 6.98 | 8.4 | 30 | 9 |
| **Wytopitlock Lake (1702)**: 1,090 ac, 7.3 m | 1989 | 3.0 | — | 2.8 | 7.01 | 6.3 | 22 | 11 |
| **Skitacook Lake (1730)**: 407 ac, 5.2 m | 2012 | 3.4 | — | — | 6.75 | — | 28 | — |
| | 2018 | 4.4 | 13 | 3 | 7.27 | 12 | 29 | 9 |
| **Molunkus Lake (3038)**: 1,108 ac, 11.6 m | 1989 | 4.3 | — | 3.3 | 7.16 | 8.2 | 22 | 7 |
| | 2011 | 5.2 | — | 3.6 | — | — | — | 7 |
| **Upper Mattawamkeag / Mattawamkeag Lake (1686)**, Island Falls: 748 ac in GIS, 14.3 m | 1977–2018 (stn 1) | 2.5–4.9 | 17–74 | 1.3–7.1 | 6.25–7.58 | 14.5–24 | 41–80 | 9–20 |
| **Brackett Lake (1068)**, Weston: clearer contrast, 582 ac, 7.6 m | 1977–2012 | 6.2–7.8 | 8 (2002), 39 (2006) | 1.7–2.9 | 6.9–7.39 | 8–17.4 | 34–45 | 3–9 |
| **North Lake (1063)**, Orient: 112 ac, 13.7 m | 1992–2014 (2 stations) | 3.3–4.6 | — | — | — | — | — | — |
| **Tomah Lake (0135)**, Forest Twp: very clear contrast | 1974–1996 | 5.5–9.1 | — | 1.3–5 | 5.78–6.4 | 3.5–4.5 | 13–20 | 7–17 |

- **DOC: no measurement found** for these lakes or for the listed analogues. Neither the DEP annual-means file nor WQP holds DOC for them. — [DEP annual means xlsx](https://ww3.gulfofmaine.org/kb/files/9679/MaineLakes_Secchi_Color_Chemistry_AnnualMeans.xlsx)
- **Analogue-region weather and runoff** (EPA StreamCat, Hot Brook watershed itself): 1991–2020 mean precipitation 1,203–1,205 mm/yr, mean air temperature 5.4 °C, mean runoff 646 mm/yr. — [EPA StreamCat API, COMIDs 166173169 / 1969](https://api.epa.gov/StreamCat/streams/metrics?name=precip9120,tmean9120,runoff&aoi=ws&comid=166173169,1969,1695)

### Inferences
- **Expected chemistry.** If the sim needs numbers, the Baskahegan Lake analogue (same drainage, same shallow form, same fish community) is the most defensible starting point:
  - Secchi ≈ 3.5–4.5 m;
  - colour ≈ 20–50 SPU (moderately coloured);
  - TP ≈ 8–12 µg/L, chl-a ≈ 2.5–4 µg/L;
  - pH ≈ 6.6–7.2, alkalinity ≈ 5–12 mg/L, conductivity ≈ 22–30 µS/cm.

  This is an inference from analogues, not a measurement.
- **Colour (my reasoning).** The watershed is 14–16% wetland (see the physical section) and drains spruce-fir and mixed forest with wetlands on the south and west of Upper and the north and east of Lower. That makes moderately humic, tea-coloured water likely, so colour probably limits light more than algae do. This is also an inference.
- **Trophic state.** Carlson TSI applied to the Baskahegan 2004 analogue gives about 37 (TP), 42 (chl) and 41 (Secchi), i.e. the oligotrophic/mesotrophic boundary. That is my calculation with the standard Carlson (1977) equations on analogue data.
- **Light reaches most of the bed.** With an analogue Secchi of ~3.5–4.5 m, much of Lower (max 4.0 m, mean 2.7 m) and most of Upper (max 5.5 m, mean 3.35 m) would have light near the bed. This matches the sim's "mostly littoral" design.
- **No stratification.** The 1949 note and the 3–4 m mean depth mean no summer hypolimnion. Fully mixed warm water (~23 °C in August 1949) is the summer state.

### Gaps
- **No measured Secchi, colour, TP, chl-a, pH, alkalinity, conductivity or DOC for either lake.** The DEP/LSM 2025 dataset and Lakes of Maine pages could not be checked: no file link, and HTTP 403. The DEP sampling-station layer suggests none exist. The Lake Stewards of Maine contact (stewards@lakestewardsme.org) or DEP could confirm.
- **No dissolved-oxygen data and no profiles, summer or under ice.** Under-ice O2 is a real unknown for 4 m Lower Hot Brook Lake with its "mostly muddy" bottom, and no analogue winter DO series was found for a nearby shallow lake.
- **The 1949 "75 feet – 71 °F" reading** needs a look at the scanned image to resolve.

---

## Physical and catchment: watershed area, flushing, volume, elevation, shoreline, islands, outlet dam, land use, development

### Takeaway
**Upper Hot Brook Lake:**
- 890 ac (3.60 km²), mean 3.35 m, about 12.1 million m³.
- Water surface 424 ft (129.2 m).
- One ~4 ha island and 14.6 km of shoreline.
- Drains about 66 km².

**Lower Hot Brook Lake:**
- 684 ac (2.77 km²), mean 2.74 m, about 7.6 million m³.
- Water surface 422 ft (128.6 m).
- No islands and 10.8 km of shoreline.
- Drains about 77 km², about 85% of it through Upper and the connecting brook.

**Shared:**
- The watershed is ~70–73% forest, ~15% wetland and ~2.5–2.8% "developed" (mostly roads and open space).
- Derived flushing is fast: Upper about 3.5 times a year (~100-day residence), Lower about 6.6 times a year (~55 days).
- No dam is recorded at either outlet. A fish screen was proposed for Lower's outlet in 1949.

### Cited Findings
- **DEP lake points (layer 0):**
  - Upper Hot Brook Lake: MIDAS 1076, **elevation 424 ft**, centroid 45.6168 N 67.9354 W, HUC-12 010200030403, NHD COMID 145081982.
  - Lower Hot Brook Lake: MIDAS 1072, **elevation 422 ft**, centroid 45.6480 N 67.9401 W, same HUC-12, COMID 145081871.
  - Both carry the name note "Hot Brook Lake".
  — [Maine DEP Lakes Data MapServer, layer 0](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/0)
- **DEP MIDAS polygons (layer 3):** Upper **890.31 acres**, Lower **683.88 acres**. Upper's polygon extent is 45.6026–45.6338 N, 67.9511–67.9256 W. — [DEP MapServer, layer 3](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3)
- **Derived from the same polygons (my geometry, UTM 19N):**
  - Upper has **1 island (≈4.2 ha)**, a mainland shoreline of **13.3 km** plus 1.3 km of island shore (14.6 km in total), and spans 3.44 km N–S by 1.94 km E–W.
  - Lower has **no islands** and a **10.8 km** shoreline, and spans 3.31 km N–S by 1.66 km E–W.
  - These match the Lakes of Maine perimeters of 9 mi (14.5 km) and 6.7 mi (10.8 km) quoted in the earlier note `Maine lakes ponds and streams/maine_fish_community_hot_brook.md`.
  — [DEP MapServer, layer 3](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3)
- **MDIFW survey sheets (surveyed Aug 1949, revised 1965 and 2004; Federal Aid project F-28-P):**
  - Areas: **Upper 912 acres**, **Lower 713 acres**. Maximum depths: **Upper 18 ft**, **Lower 13 ft**.
  - **Upper:** "mostly surrounded by spruce fir forest with some wetlands on the south and west sides. The shoreline is mostly rocky with some areas of sand, there is a large sandy beach in the northeast part of the lake… but the lake bottom is mostly muddy." It has "several small tributaries… but none have any suitable habitat for coldwater fish."
  - **Lower:** "surrounded by spruce fir forest with some wetlands on the north and east sides… lake bottom is mostly muddy."
  — [MDIFW Upper sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [MDIFW Lower sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
- **DEP depth points (layer 2):** 84 digitised soundings for Upper (maximum 5.49 m) and 63 for Lower (maximum 3.96 m). Their source is the MDIFW depth map ("screendig", University of Maine Farmington, 2007). — [DEP MapServer, layer 2](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/2)
- **Watershed areas (derived).** I summed the area of the USGS NLDI upstream-basin polygon (NHDPlus catchments) at each lake's outlet flowline:
  - Upper (artificial path COMID 166173169, which ends at the outlet, 45.6321 N): **65.8 km² (25.4 mi², 16,260 ac)**.
  - Lower (COMID 1969, which ends at the outlet, 45.6588 N): **77.2 km² (29.8 mi²)**.
  - Hot Brook one reach below Lower (COMID 1695): 83.4 km².
  - DEP's own "Watersheds" layer has **no polygon** for MIDAS 1072 or 1076, although it does for Baskahegan, Brackett and others.
  — [NLDI basin, Upper outlet](https://api.water.usgs.gov/nldi/linked-data/comid/166173169/basin); [NLDI basin, Lower outlet](https://api.water.usgs.gov/nldi/linked-data/comid/1969/basin); [DEP MapServer, layer 4](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/4)
- **Land cover (NLCD 2019, whole upstream watershed, EPA StreamCat):**
  - **Upper outlet:**
    - forest 73.0% (deciduous 30.0, mixed 32.3, conifer 10.7);
    - woody wetland 14.4%, herbaceous wetland 0.7%, open water 5.7%;
    - shrub 1.7%, grass 1.5%, hay 0.17%, crop 0%;
    - developed 2.8% (open space 2.39, low 0.26, medium 0.14, high 0.02);
    - mean elevation 165 m.
  - **Lower outlet:**
    - forest 70.4% (28.2 / 32.7 / 9.5);
    - woody wetland 14.4%, herbaceous wetland 0.65%, open water 8.5%;
    - developed 2.5%; hay 0.27%; mean elevation 163 m.
  - **Runoff 646 mm/yr** at both.
  — [EPA StreamCat API](https://api.epa.gov/StreamCat/streams/metrics?name=pctconif2019,pctdecid2019,pctmxfst2019,pctwdwet2019,pcthbwet2019,pctow2019,pcturbop2019,pcturblo2019,pcturbmd2019,pcturbhi2019,pcthay2019,pctcrop2019,runoff,elev&aoi=ws&comid=166173169,1969,1695)
- **Regional runoff check** (USGS daily-value annual statistics):
  - Mattawamkeag River near Mattawamkeag (01030500; 1,419 mi²), 1935–2025: mean **2,626 cfs = 1.85 cfs/mi² = 0.64 m/yr of runoff**.
  - Wytopitlock Stream (01030350; 48.9 mi²), 2009–2025: 2.05 cfs/mi² = 0.71 m/yr.
  - Baskahegan Lake near Danforth (01030200) drains 123 mi².
  — [USGS stats 01030500](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030500&statReportType=annual&parameterCd=00060); [USGS stats 01030350](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=01030350&statReportType=annual&parameterCd=00060); [USGS site info](https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=01030500,01030350,01030200&siteOutput=expanded)
- **Mean depths.** Lakes of Maine gives Upper's mean depth as 11 ft (3.35 m) and Lower's as 9 ft (2.74 m). This is from the earlier search summary; the page is now 403 to me. — [Lakes of Maine 1076](https://www.lakesofmaine.org/lake-overview.html?m=1076); [Lakes of Maine 1072](https://www.lakesofmaine.org/lake-overview.html?m=1072)
- **Development:**
  - Upper: "an area of camp development along the south shore".
  - Lower: "There are no camps on this lake" (sheet revised 2004).
  - Access in 2004: an "unimproved boat launch site at the south end of Upper Hot Brook Lake that is accessible from Rt.# 169".
  — [MDIFW Upper sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [MDIFW Lower sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
  - The 2021 MDIFW fishing guide gives access as "Town landing off SR 169". — [MDIFW Fishing Guide 2021](https://www.maine.gov/ifw/docs/21-MDIFW-Fishing-Guide-2021.pdf)
  - An outfitter (Wilderness Escape Outfitters) has a "private location on the shore of Upper Hot Brook Lake" with "a mile of lake frontage". — [Wilderness Escape, Our Location](https://wildernessescape.com/our-location/)
  - OpenStreetMap (queried 2026-10-15) has **15 mapped buildings within 200 m of Upper's shore and none at Lower**. OSM building coverage in rural Maine is incomplete, so treat this as a floor. — [OpenStreetMap via Overpass API](https://overpass-api.de/api/interpreter)
- **Outlet dam:**
  - **No dam record was found for either outlet.** The nearest NID dam in Danforth (45.659 N, 67.869 W; built 1845; Baskahegan Dam Co.) lies about 5 km east, on the Baskahegan Stream side, not on Hot Brook. That rests on a search snippet; I did not verify the coordinates against the waterway. — [NID listing via recallcheck.net](https://recallcheck.net/dam-safety/35240)
  - A 1949 legislative document (94th Legislature, LD 1115) proposed **$750 for "a fish screen at outlet of Lower Hot Brook"**, to be kept clear by the Danforth Rod and Gun Club. — [LD 1115 (1949)](https://lldc.mainelegislature.org/Open/LDs/94/094-LD-1115.pdf)
- **Drainage route.** Upper drains through the short connecting stream into Lower. Lower's outlet (Hot Brook) flows into Baskahegan Stream, then the Mattawamkeag, then the Penobscot. — [MDIFW sheets](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
  - The NHDPlus downstream navigation is consistent: about 2.9 km and then 7.3 km of Hot Brook reaches leave Lower heading north and then north-west to about 45.719 N 67.992 W, after which flowlines run south-west toward the Mattawamkeag. — [NLDI downstream navigation](https://api.water.usgs.gov/nldi/linked-data/comid/166173169/navigation/DM/flowlines?distance=25)
- **Analogue watersheds (DEP watershed layer)**, for context: Baskahegan Lake total watershed 79,870 ac (323 km²), Wytopitlock Lake 14,110 ac, Molunkus Lake 22,310 ac. — [DEP MapServer, layer 4](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/4)

### Inferences
- **Volumes (derived):** Upper 3.603 km² × 3.35 m ≈ **12.1 × 10⁶ m³** (≈9,800 acre-ft). Lower 2.768 km² × 2.74 m ≈ **7.6 × 10⁶ m³** (≈6,160 acre-ft).
- **Mean outflow (derived):** watershed × 0.646 m/yr gives Upper ≈ 42.5 × 10⁶ m³/yr ≈ **1.35 m³/s (≈48 cfs)** and Lower ≈ 49.9 × 10⁶ m³/yr ≈ **1.58 m³/s (≈56 cfs)**.
- **Flushing (derived):** Upper ≈ **3.5 flushes/yr (residence ≈ 100–105 days)**; Lower ≈ **6.6 flushes/yr (residence ≈ 55 days)**. These are annual means. Spring snowmelt (April) will flush far faster, and late-summer low flow far slower.
- **Lower is mostly fed by Upper.** Lower's local catchment is only ≈ 77.2 − 65.8 = 11.4 km², including its own surface. So **≈85% of Lower's inflow arrives through the connecting brook from Upper**. Lower's water chemistry, plankton seeding and thermal regime should follow Upper's outflow closely. This is a strong mechanistic coupling for a two-lake sim.
- **Ratios:** watershed-to-lake-area ratio ≈ 18:1 for Upper and ≈ 28:1 for Lower on its total watershed. Land-use loading is low: ~2.5–2.8% developed (mostly roads), no row crops, hay < 0.3%. Phosphorus should be largely natural (forest and wetland) plus shoreline camps on Upper's south shore.
- **Datum caution:** the 912/713-acre (MDIFW 1949 planimetry) and 890/684-acre (DEP GIS) areas differ by 2–4%. Use the GIS values for geometry.

### Gaps
- No official DEP flushing rate, watershed area, or published volume was found; Lakes of Maine pages, which usually list "flushing rate" and "watershed area", are blocked. All flushing and volume figures above are derived.
- **Camp and dwelling counts:** no official count. The OSM count is incomplete; town assessor or LUPC records would be needed.
- **Outlet structure today:** unknown whether there is any beaver dam, old crib dam or culvert at Lower's outlet, and whether the 1949 fish screen was built (LD 1115 is a bill; I did not confirm enactment).

---

## Fisheries: MDIFW records after 1949, stocking, regulations, surveys, species additions, invasives

### Takeaway
MDIFW's records for these lakes are three items:
- the 1949 survey sheets (revised 1965 and 2004);
- the statewide "Lake Fish of Maine" species lists (2007 database);
- bass-waters, guide and law-book listings.

No electrofishing, creel or growth survey and no stocking record specific to these lakes was found.

**Correction to the earlier note:** MDIFW's species database **does list pumpkinseed for Upper Hot Brook Lake** (10 species), though not for Lower (9 species). Golden shiner, redbreast sunfish, common shiner and eel are listed for neither.

**Current regulation (2019 and 2023 law books):** 25 white perch a day, **all bass catch-and-release**, and artificial lures only from Oct 1 to Dec 31.

**UPDATE 2026-10-20 — MDIFW's 2024 depth chart for Lower (from the human):** it lists **pumpkinseed** and **sea-run alewife** for
Lower Hot Brook Lake. That confirms the inference below (pumpkinseed's absence from Lower's 2007 list was a gap). It also gives the
first record of alewives in the lakes: the restoration notes predicted them (`drainage_species_and_eel.md` §4: alewives at Danforth
from 2017, both lakes mapped as habitat for ~382,000 adults at 235 an acre) but found no record.

### Cited Findings
- **MDIFW depth chart, "Lower Hot Brook Lake", Bancroft, Danforth, T8 R4 NBPP, Washington Co.** [FT; a one-page chart, the human's
  copy `Lower-Hot-Brook-Lake-1072.pdf`, 2026-10-20; not in the repository]:
  - Surface area 684 acres (277 ha); perimeter 6.7 miles; mean depth 8 ft (2.44 m); maximum depth recorded 13 ft (3.96 m);
    Delorme page 45. Contours at 10 ft and 2.5 ft; the 10-ft contour encloses a long central trough. "Data source: Maine IFW –
    Historic", so the soundings are the old survey's, redrawn.
  - **Principal fish species (2024):** chain pickerel, smallmouth bass, white perch.
  - **Other fish species (2024):** banded killifish, blacknose dace, brown bullhead, fallfish, **pumpkinseed sunfish**, **sea-run
    alewife**, white sucker, yellow perch.
  - Against the sim: area matches (277 ha); the sim's Lower mean is 2.67 m (the 1949 soundings plus the photo-measured shelf),
    ~9 % deeper than the chart's 2.44 m; max matches (3.94 m).
- **MDIFW fishing guides 2016 and 2024 (Region F, bass waters)** [FT; the human's copies]: "Hot Brook Lakes (Upper & Lower)
  Danforth, Washington County. Max Depth: 18 feet, & 13 feet, Area: 912 acres & 713 acres. Primary Fishery: SMB, WHP, PKL. Access:
  Town landing off Rte 169" — the same entry as the 2021 guide. Nothing new on species.
- **Species lists, MDIFW *Lake Fish of Maine*.** The data come from MDIFW's lake survey database (2007 update), compiled for the Gulf of Maine KB by P. Vaux and uploaded in 2009. The data set is "a composite… based primarily on lake fish surveys, but also… informal observations." — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls) ([KB record](https://ww3.gulfofmaine.org/kb/record.html?recordid=9008))
  - **Upper Hot Brook Lake (1076):** brown bullhead, white sucker, chain pickerel, banded killifish, **pumpkinseed**, smallmouth bass, white perch, yellow perch, blacknose dace, fallfish.
  - **Lower Hot Brook Lake (1072):** brown bullhead, white sucker, chain pickerel, banded killifish, smallmouth bass, white perch, yellow perch, blacknose dace, fallfish (no pumpkinseed).
  - No extirpated-species entries exist for either lake.
  - **Analogue, Baskahegan Lake (1078):** the same core set plus pumpkinseed, **American eel, common shiner, creek chub and brook trout**.
- **1949 survey sheets (revised 1965, 2004).**
  - Fish listed: smallmouth bass, white perch, yellow perch, chain pickerel, bullhead (horn pout), banded killifish; minnows: blacknose dace, fallfish, white sucker.
  - Principal fisheries: smallmouth bass, white perch, chain pickerel.
  - Each lake is "a typical warm water lake with excellent spawning and adult habitat for bass, perch, and pickerel".
  - Management: "managed for a larger than average size bass fishery… special 25 fish bag limit on white perch… open to fishing until November 30."
  — [MDIFW Upper sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [MDIFW Lower sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)
- **Current special regulation**, identical in the 2019 and 2023 MDIFW law books: "HOT BROOK LAKES, LOWER AND UPPER, Bancroft, Danforth, T8 R3 NBPP, T8 R4 NBPP (South Zone). General fishing laws apply, except: Daily bag limit on white perch: 25 fish. **All bass must be released alive at once.** From October 1 – December 31: ALO, S-7."
  - In the same book, ALO = "Artificial lures only" and S-7 = "All trout, landlocked salmon, and togue caught must be released alive at once."
  - The South Zone general bass law is 2 fish, only 1 over 14 in, so the Hot Brook rule is stricter.
  — [MDIFW 2023 Fishing Law Book](https://www.maine.gov/ifw/docs/22-MDIFW-6-FISHING-LAWBOOK-2023.pdf); [MDIFW 2019 Fishing Laws](https://www.maine.gov/ifw/docs/2019_MaineFishingLaws.pdf)
- **Earlier bass rule (undated, unverified).** An older regulations reprint reportedly listed "Daily bag limit on bass: 1 fish; all bass between 16 and 20 inches must be released alive at once" for the Hot Brook Lakes. The page refused connections, so I am relying on a search snippet. This would fit the 2004 sheet's "larger than average size bass" language. — [mainerec.com (unverified)](http://www.mainerec.com/wafish.asp?Category=89&PageNum=89)
- **White perch bag limit.** In 2002 MDIFW wrote that "a 25 fish per day bag limit for white perch [was] imposed on seven lakes in eastern Maine … as a result of a citizen petition and not for biological reasons." — [MDIFW White Perch Plan 2002](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf)
- **MDIFW listings:**
  - The MDIFW *Maine Bass Waters* list (revised May 2004, Nov 2000, July 1998, June 1987) includes "Hot Brook Lakes, T8R4 NBPP, S [smallmouth], unimproved off of Rt 169". — [MDIFW Maine Bass Waters](https://www.maine.gov/ifw/docs/mainebasswaters.pdf)
  - The 2021 MDIFW fishing guide lists them under **Region F (Penobscot Region)**: "Hot Brook Lakes (Upper & Lower), Danforth… Max Depth: 18 feet, & 13 feet, Area: 912 acres & 713 acres. Primary Fishery: SMB, WHP, PKL." — [MDIFW Fishing Guide 2021](https://www.maine.gov/ifw/docs/21-MDIFW-Fishing-Guide-2021.pdf)
- **Historical records:**
  - **1949:** LD 1115 proposed a fish screen at Lower's outlet. Its statement of facts: "The Danforth Rod and Gun Club wish to introduce game fish into Upper Hot Brook and Lower Hot Brook lake." — [LD 1115 (1949)](https://lldc.mainelegislature.org/Open/LDs/94/094-LD-1115.pdf)
  - **1963:** Resolves ch. 56, "Regulating Fishing in Certain Waters in Washington County", directed the Commissioner to open listed lakes, including "Hot Brook Lakes, T. 8, R. 4", "to fishing for all fish except trout, salmon and togue from October 1st to October 31st of each year". — [Resolves 1963 ch. 56](https://lldc.mainelegislature.org/Open/Laws/1963/1963_RES_c056.pdf)
  - **Smallmouth bass in Maine:** "not native to Maine; they were first introduced in 1868", and since then "introduced, either legally or illegally, throughout much of the State". The 2001 bass plan does not mention Hot Brook. — [MDIFW Black Bass Management Plan 2001](https://www.maine.gov/IFW/docs/strategic-management-plans/blackbass.pdf)
- **Fish-tissue mercury (analogue only):** WQP holds DEP fish-tissue mercury with lengths and weights for Baskahegan Lake (station LK1078, 10 fish) and Brackett Lake (LK1068, 20 fish). There are none for Hot Brook. — [WQP results, MEDEP_WQX-85699 / 85698](https://www.waterqualitydata.us/data/Result/search?siteid=MEDEP_WQX-85699%3BMEDEP_WQX-85698&mimeType=csv)

### Inferences
- **Smallmouth date.** Smallmouth bass were present by the August 1949 survey; it lists them first among the fishes. However, the sheet was revised in 1965 and 2004, so the printed list may include later additions. LD 1115's statement that the local club "wish[ed] to introduce game fish" in March 1949 suggests stocking interest at that time. The species they meant (bass or trout) and the true introduction date remain uncertain.
- **Pumpkinseed.** The MDIFW database entry for Upper supports the user's field observation of sunfish in the stream pools. Lower's list lacks it, but the two lakes are connected by a 150 m brook, so absence from Lower is more likely a survey gap than a real absence. This is an inference.
- **Bass harvest.** Catch-and-release for all bass (in force by 2019) means angler harvest mortality on bass should be near zero in a "present-day" scenario. White perch and pickerel harvest is lightly regulated (25 white perch a day; pickerel under general law).

### Gaps
- No MDIFW electrofishing, trap-net, creel, age-growth, or stocking record specific to either lake was found online. Regional reports (Region F, Enfield) are not posted per lake.
- **Smallmouth introduction date and source:** not found.
- **Date the bass catch-and-release rule began:** not found. It is present in 2019; the earlier 1-fish / 16–20 in slot is unverified.
- **Invasive species:** no record for either lake. The earlier search summary of Lakes of Maine noted no known invasive aquatic plant, but that page is now blocked to me. No largemouth bass record exists for these lakes; the region's largemouth problem is in the St. Croix drainage (Grand Falls Flowage, 2012), noted in the earlier fish-community note.
- Golden shiner and redbreast sunfish: not recorded by MDIFW for either lake.

---

## Wildlife: loons, beaver, eagles/osprey, turtles (and other listed fauna)

### Takeaway
**Loons, eagles, osprey and beaver:** no lake-specific records were found.
- The lakes are north of the 45th parallel, outside the area covered by Maine Audubon's statewide loon estimate.
- Per-lake loon data are not online (the 2016 file is gone).

**MDIFW habitat GIS does hold records here:**
- a **yellow lampmussel (state Threatened)** element in the south-west of Upper Hot Brook Lake;
- obscured **Special Concern "rare animal"** records from 2013 in Danforth and Bancroft, with a NatureServe turtle code (most likely wood turtle, an inference);
- eight rated **Inland Waterfowl and Wading Bird Habitat** polygons around the lakes;
- a mapped **deer wintering area** east of Upper;
- a **significant vernal pool** in T8 R4 NBPP.

### Cited Findings
- **Yellow lampmussel (*Lampsilis cariosa*):** an MDIFW Endangered/Threatened/Special Concern Wildlife layer element, GRANK G3G4, SRANK S3, **state Threatened**, survey site "T8 R4 NBPP".
  - The polygon centroid is 45.6075 N 67.9492 W (extent 45.604–45.611 N, 67.953–67.946 W).
  - A point-in-polygon test places the centroid **inside Upper Hot Brook Lake (south-west part)**.
  - No observation date appears in the public layer.
  — [MDIFW Wildlife Habitat Data MapServer, layer 11](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/11); [DEP MIDAS layer, used for the point test](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3)
- **Yellow lampmussel biology:**
  - MDIFW lists it as Threatened. It "typically prefers medium to large rivers, but in Maine is often found in lakes and ponds", across silt, sand, gravel and cobble. — [MDIFW SGCN report, Yellow Lampmussel](https://www.maine.gov/ifw/wildlife/reports/pdfs/SGCN_Reports/SGCN/Yellow%20Lampmussel__Lampsilis%20cariosa.pdf)
  - Its host fish are **white perch and yellow perch**, confirmed in wild Maine populations. — [Freshwater Science 27(1), host use by wild populations](https://complete.bioone.org/journals/freshwater-science/volume-27/issue-1/07-036.1/Determination-of-fish-host-use-by-wild-populations-of-rare/10.1899/07-036.1.full)
- **"RARE ANIMAL" (identity obscured in the public layer):** two records, both with ELCODE **ARAAD02020**, GRANK G3, SRANK S4, status **Special Concern**.
  - "Danforth": observed **2013-06-14**; generalised polygon spanning 45.568–45.785 N.
  - "Bancroft": observed **2013-05-10**; generalised polygon spanning 45.642–45.773 N.
  — [MDIFW Wildlife Habitat Data MapServer, layer 11](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/11)
- **Inland Waterfowl and Wading Bird Habitat (IWWH):** eight polygons in the 45.60–45.67 N, 67.975–67.90 W box, mapped 2002–2011 (IFW and UMO surveys). They include:
  - Iwwh203682 (rating M) at Upper's south end, noted "Clipped upland buffer on lake shores based on Great Pond Rule";
  - Iwwh203654 (M) at Lower's north end / outlet, about 45.659 N 67.921 W;
  - Iwwh204089 (M) at about 45.666 N 67.923 W, along Hot Brook below Lower;
  - UMO-6416 (rated **H**) at about 45.647 N 67.976 W, west of Lower;
  - Iwwh203684 (**H**) at about 45.607 N 67.901 W, east of Upper.
  — [MDIFW Wildlife Habitat Data MapServer, layer 7](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/7)
- **Deer wintering area 040087:** about 45.578–45.624 N, 67.908–67.824 W, east and south-east of Upper. — [MDIFW Wildlife Habitat Data, layer 4](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/4)
- **Significant vernal pool** (pool 512, T8 R4 NBPP, status "Significant", surveyed 2008, 8.8 buffer acres). — [MDIFW Wildlife Habitat Data, layer 9](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/9)
- **Loons (statewide context only):**
  - Maine Audubon's 2025 estimate for "the bottom half of the state, south of the 45th parallel" is **3,174 adults and 568 chicks**. The count is held on the third Saturday in July.
  - Per-lake data for the north are not published in these articles.
  — [WBUR, 13 Dec 2025](https://www.wbur.org/news/2025/12/13/more-loons-are-filling-maines-lakes-with-their-ghost-like-calls); [WBUR, 17 Dec 2025](https://www.wbur.org/news/2025/12/17/maine-loon-count-population-health-audubon)
  - A search summary (unverified against a primary page) also reported 121 northern lakes surveyed in 2025, with 545 adults and 42 chicks. — [Boston Globe, 13 Dec 2025](https://www.bostonglobe.com/2025/12/13/metro/more-loons-are-filling-maines-lakes-with-their-ghost-like-calls/)
  - Maine Audubon's 2016 per-lake data file is no longer online (HTTP 404). — [Maine Audubon 2016 loon count data (dead link)](https://maineaudubon.org/wp-content/uploads-old/2017/03/Loon-Count-Data-2016.pdf)

### Inferences
- **The rare-animal records.** ARAAD02020 follows NatureServe's element-code pattern for turtles (Emydidae), and G3 / S4 / Maine "Special Concern" fits the **wood turtle (*Glyptemys insculpta*)**. Wood turtle is a brook-and-river turtle, consistent with records spread along streams in Danforth and Bancroft. I could not confirm the code-to-species mapping from a primary source.
- **Lampmussel recruitment link.** The lampmussel's confirmed hosts (white perch, yellow perch) are two of the most abundant fish here. A mussel record inside Upper therefore gives a real, documented host-fish dependency the sim could represent, with glochidia on perch in late spring and summer. It also fits the user's first-hand note of "lots of mussels".
- **Waterbirds.** The IWWH polygons at both lake ends and along Hot Brook mark the marshy margins where wading birds and waterfowl concentrate, and are plausible beaver habitat. Beaver activity itself is not recorded.

### Gaps
- **Loon counts** (adults/chicks by year) for either lake: not found online. Maine Audubon (conserve@maineaudubon.org) holds northern volunteer data.
- **Bald eagle and osprey nests:** none found. MDIFW nest locations are not public.
- **Beaver:** no records found.
- **Turtle species:** the identity of the "rare animal" is unconfirmed, and no painted or snapping turtle records specific to these lakes were found. Maine Amphibian and Reptile Atlas town-level records were not checked.
- **Yellow lampmussel:** observation date and abundance are not available in the public layer.

---

## The connecting brook (Upper → Lower): length, fall, width, substrate, gradient, fish and habitat

### Takeaway
The brook is a short (NHD ≈ 142 m; MDIFW "1/8 mile" ≈ 200 m), **"non-navigable"**, **"rocky and hard bottomed"** thoroughfare. It falls about **2 ft (0.6 m)** from Upper (424 ft) to Lower (422 ft), a gradient of about 0.3–0.4%. Derived mean discharge is about **1.35 m³/s**, so it carries nearly all of Lower's inflow. MDIFW says it has no coldwater habitat. **No width, depth, temperature or fish-use survey exists.**

### Cited Findings
- **MDIFW:**
  - "Upper Hot Brook Lake is separated from Lower Hot Brook Lake by a short (1/8 mile) non-navigable connecting stream."
  - "The major tributary [of Lower] is the inlet from the upper lake and although this stream is rocky and hard bottomed it does not contain any suitable habitat for coldwater fish."
  - "It is not possible to operate a boat through this stream and a boat operator must be prepared to paddle, pole, or walk a boat through parts of the waterway."
  — [MDIFW Lower sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf); [MDIFW Upper sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf)
- **NHDPlus geometry:**
  - Upper's lake flowline (COMID 166173169) ends at 45.6321 N 67.9363 W.
  - The connecting reach is **COMID 2043 (≈141 m)** plus COMID 2047 (≈1 m), ending at 45.6332 N 67.9354 W.
  - There it enters Lower's lake flowline (COMID 1969, ≈3.1 km).
  - Reach lengths are my geodesic sums of the returned coordinates.
  — [NLDI downstream navigation from Upper](https://api.water.usgs.gov/nldi/linked-data/comid/166173169/navigation/DM/flowlines?distance=25)
- **Lake surface elevations:** 424 ft (Upper) and 422 ft (Lower). — [DEP lake points, layer 0](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/0)
- **Name:** OSM maps "Hot Brook" (GNIS 568338) both as the stream entering Upper from the south and as the waterway at Lower. — [OpenStreetMap via Overpass](https://overpass-api.de/api/interpreter)
- **Runoff for discharge:** 646 mm/yr. — [EPA StreamCat](https://api.epa.gov/StreamCat/streams/metrics?name=runoff&aoi=ws&comid=166173169)

### Inferences
- **Gradient (derived):** a 0.6 m fall over 142–200 m is **≈ 0.3–0.4%**. That is a low-gradient riffle and run with a rocky, hard bed: consistent with "walk a boat through parts" (shallow riffles at summer low flow) and with the user's "riffles and pools".
- **Discharge (derived):** mean flow ≈ Upper's outflow ≈ **1.35 m³/s**. Spring snowmelt peaks would be several times that, and late-summer flows a fraction of it; this is an expected seasonal pattern, not a measurement. The brook delivers about 85% of Lower's water.
- **Temperature:** the brook draws surface water from a shallow, unstratified lake, so its summer temperature should track Upper's surface water (~23 °C in August 1949). That is why MDIFW rates it as having no coldwater habitat.
- **Fish use:** the only fish documented for the lakes that are typical riffle and stream users are blacknose dace, fallfish and white sucker. Their spring spawning in a rocky outlet riffle is plausible but unrecorded. Lake fish (bass, perch, pumpkinseed) may use the pools. This is inference; it agrees with the user's own observation of sunfish in 3–4 ft stream pools.

### Gaps
- **No measurements** of width, depth, pool and riffle dimensions, substrate size distribution, discharge, temperature, or fish use. No MDIFW stream survey was found.
- **Length disagreement:** NHD gives ≈142 m, MDIFW "1/8 mile" ≈ 200 m, and the project's elevation data ≈154 m. Field measurement or LiDAR would settle it.
- **Exact fall:** 424 vs 422 ft are rounded map elevations; a LiDAR water-surface comparison would give a better figure.
