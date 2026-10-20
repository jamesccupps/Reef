# Checking the Gemini "Hot Brook records" report against its sources

**What was checked (2026-10-20).** The source is a Google Gemini Deep Research report that the user supplied: `docs/research_notes/fetched/gemini_2026-10-20_hot_brook_records.txt`. I also checked §2–3 of `gemini_2026-10-20_wildlife_mussels_winter_inverts.txt`. I looked for every claim in the source it cites, or in another primary source, and compared it with:
- `hot_brook_lake_records.md`, `sea_run_alewife.md`, `maine_freshwater_mussels.md` and `drainage_species_and_eel.md` (same folder);
- the 1949/2004 MDIFW survey sheets (`fetched/hot_brook_lake_upper.pdf`, `..._lower.pdf`, read with pymupdf, including the map pages).

**Rules followed.** Nothing blocked was bypassed. **www.maine.gov returned HTTP 403 to every fetch**: DMR, DACF/LUPC, the IFW pages and the MDIFW mussel PDF. Claims resting only on maine.gov pages are therefore marked UNVERIFIABLE (blocked), or PARTLY when a search-engine excerpt of that page was all I had. Those excerpts are tagged [SEC]. Other publishers also returned 403: mdpi.com, mass.gov, journals.uchicago.edu, nationalfisherman.com. Overpass (OSM) returned 406.

Sources I could read directly:
- the human's own copies of the MDIFW 2024 fishing guide and the 2024 Lower Hot Brook depth chart (in `C:\Users\james\Downloads\`);
- the state's ArcGIS services (gis.maine.gov; the Maine Stream Habitat Viewer);
- USGS NLDI and the EPA NHDPlus service;
- weather.gov PDFs;
- Crossref metadata;
- the 2008 Penobscot plan and the DMR 2008–19 trap-count table (FOMB cybrary copies);
- ASF, CT DEEP, NCWRC and OUP (Auk).

No fetched page contained instructions aimed at me.

**Verdicts:** CONFIRMED, PARTLY (part right, or only a search excerpt), WRONG, UNVERIFIABLE. "Derived" = my own arithmetic or GIS.

---

## Claims and verdicts

| # | Gemini claim | Verdict | What the source says (number or a short quote) | URL / file actually read | New to the project? |
|---|---|---|---|---|---|
| 1a | Upper 912 ac, Lower 713 ac (MDIFW) | **CONFIRMED** | Sheets "Area - 912", "Area - 713". 2024 guide: "Max Depth: 18 feet, & 13 feet, Area: 912 acres & 713 acres" | `fetched/hot_brook_lake_upper.pdf`, `..._lower.pdf`; human's `23-MDIFW-33-Maine-Fishing-Guide-2024-spreads.pdf` p. 19 | Known |
| 1b | NHD 909 / 684 ac | **PARTLY** | Lower 684 ac matches the DEP polygon (683.88) and MDIFW's 2024 chart. No source gives Upper 909. NHDPlus V2 waterbodies: Upper 3.634 km² (898 ac), Lower 2.865 km² (708 ac). DEP polygons: 890 / 684. The NHD high-res service returned 502 | [EPA NHDPlus waterbody layer](https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus/NHDPlus/MapServer/4) | NHDPlus V2 figures new; otherwise known |
| 1c | Lower mean depth 8 ft, shoreline 6.7 mi | **CONFIRMED** (via MDIFW, not Gemini's aggregator sites) | 2024 chart: "Perimeter (miles): 6.7", "Mean Depth (feet): 8", max 13 | human's `Lower-Hot-Brook-Lake-1072.pdf` (image, read visually) | Known |
| 1d | Max depths 18 ft and 13 ft | **CONFIRMED** | "Maximum depth - 18 feet" / "13 feet" | survey sheets; 2024 guide | Known |
| 2a | Yellow lampmussel in BOTH Upper and Lower ("MDIFW Freshwater Mussel Assessment PDF") | **PARTLY** | MDIFW's listed-species GIS has *L. cariosa* elements in **Upper** (survey site "T8 R4 NBPP", polygon inside Upper's SW), **Crooked Brook Flowage** ("Danforth", inside the 1,253.7-ac DEP polygon), **Brookton Twp** (Baskahegan Lake area), and the Mattawamkeag at **Bancroft** and **Drew Plt**. There is **no element in Lower**. The assessment PDF (Swartz & Nedeau, 29 Oct 2007) exists but returned 403 | [MDIFW Wildlife_Habitat_Data layer 11](https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/11); [DEP MIDAS polygons](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3); [assessment PDF (403)](https://www.maine.gov/ifw/docs/FWMussel_speciesassessment.pdf) | Upper known; the four other drainage sites are new |
| 2b | Alewife floater (*Anodonta / Utterbackiana implicata*) in Upper and Lower | **UNVERIFIABLE** (blocked) — and doubtful | Not a listed species, so it is not in the GIS layer. No search hit ties it to Hot Brook or Baskahegan. Gemini gives it **the same four sites as the yellow lampmussel**, a sign of copy-over. Its range is "confined to the upstream limits of its anadromous host fish" (CT DEEP). Two of those sites (Baskahegan Lake, Crooked Brook Flowage) were above an impassable dam from 1845 until 2023 | [CT DEEP alewife floater](https://portal.ct.gov/DEEP/Wildlife/Freshwater-Mussels/Alewife-Floater) | New claim, not accepted |
| 2c | Eastern elliptio shells at the Route 169 crossing of Hot Brook (LUPC Stetson II Exh. 11-13, Stantec) | **UNVERIFIABLE** (blocked) | LUPC Stetson II pages and PDFs returned 403, and no search excerpt mentions it. See row 4b for where that crossing actually is | [LUPC Stetson II (403)](https://www.maine.gov/dacf/lupc/projects/windpower/stetson/stetsonII.html) | — |
| 2d | Host fish | **PARTLY** (secondary) | **Yellow lampmussel** [SEC, search excerpt of Kneeland & Rhymer 2008]: white perch is the dominant wild host and yellow perch a confirmed one. Potential hosts are banded killifish, chain pickerel, white sucker, smallmouth and largemouth. **Alewife floater:** the alewife "appears to be the alewife floater's dominant fish host" (Johnson 1946, cited by NCWRC). The poster already in the project adds American shad. Kneeland & Rhymer **2007** (J. Moll. Stud. 73(3):279–282) is real but paywalled; I saw only its metadata. The "687 glochidia … 13 sites" figures belong to their **2008** paper (JNABS 27(1):150–160, on yellow lampmussel and tidewater mucket; *A. implicata* data incidental), not the 2007 key | [Crossref 10.1093/mollus/eym017](https://api.crossref.org/works/10.1093/mollus/eym017); [Crossref 10.1899/07-036.1](https://api.crossref.org/works/10.1899/07-036.1); [NCWRC](https://www.ncwildlife.gov/species/alewife-floater) | Lampmussel hosts known; potential hosts new |
| 3 | One active bald eagle nest on Upper (USFWS letter, Stetson II Exh. 11-13) | **PARTLY** [SEC] | A search excerpt of LURC's *Stetson II Response to Agency Comments* (2008–09) reads: "bald eagle nest on Kittery Island in Upper Hot Brook Lake". It adds about 1.3 mi to the nearest turbines. The PDF returned 403. That it is still active, and that the source is "Exhibit 11-13", are both unconfirmed. Upper's survey map shows one island (~4 ha) | LUPC PDF (403); search excerpt only | **New** (the earlier note said no nest was found) |
| 4a | Hot Brook joins Baskahegan Stream **below** the Danforth dam, so the 2024 fishway is not needed | **CONFIRMED** (direction); **WRONG** (distance) | Derived from NHD: the Hot Brook path from Lower meets the Baskahegan at 45.682 N 67.934 W, **≈7.1 km (4.4 mi) of flowline below the dam** (dam flowline COMID 1693). Gemini says 2.55 mi. The Crooked Brook Dam record (2009) has "Fishway: None" and 9,643 alewife pond-acres blocked | [NLDI DM from COMID 1969](https://api.water.usgs.gov/nldi/linked-data/comid/1969/navigation/DM/flowlines?distance=40) and from [1693](https://api.water.usgs.gov/nldi/linked-data/comid/1693/navigation/DM/flowlines?distance=40); [Stream Habitat Viewer, dams](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer/1) | Direction known (`drainage_species_and_eel.md`); distance new |
| 4b | Weldon fishway documented river herring | **CONFIRMED**, but Gemini's "any fish entering the Mattawamkeag must pass Weldon" is **WRONG** | DMR: "River herring were documented in the fishway, but no counts are provided." However, NID puts Mattaceunk/Weldon Dam at 45.5703 N 68.4095 W. The downstream path from Lower passes no closer than **6.9 km**, at the Mattawamkeag mouth (45.518 N 68.362 W). Weldon is **upstream** of the confluence and not on the route | [DMR trap counts 2008–19 (FOMB copy)](https://cybrary.fomb.org/pages/Maine%20DMR%20Historical%20Sea%20Run%20Partial%20Fishway%20Trap%20Counts%202008-2019.pdf); [NID feature service](https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/NID_v1/FeatureServer/0); [NLDI DM 120 km](https://api.water.usgs.gov/nldi/linked-data/comid/1969/navigation/DM/flowlines?distance=120) | Known; Gemini contradicts it |
| 4c | Danforth fishway "completed July–August 2024" | **PARTLY** | ASF (31 Jul 2024): the fishway was built in **2023**, with a dedication on 10 Aug 2024. It is "restoring access to 135 miles of river habitat and nearly 9,000 acres". $2.5 M covers the whole fishway-and-park project. Alewives were confirmed at Danforth in 2017 | [ASF](https://www.asf.ca/danforth-celebrates-fishway-and-park-project-completion/) | Known |
| 4d | Hot Brook enters Upper at the Route 169 bridge (south end) | **WRONG** (location) | Derived from NHD: Hot Brook (NHD 1881) enters Upper's **south shore at ≈45.605 N 67.940 W**. Route 169 crosses it **≈2.5 km upstream**, at 45.5822 N 67.9442 W: a metal pipe-arch culvert 17 ft wide, 10 ft high and 86 ft long, "Potential Barrier" (surveyed 2009-08-04). Drainage at the inlet ≈36.2 km², about 55% of Upper's 65.5 km². Mean inflow ≈0.74 m³/s (≈26 cfs) at 646 mm/yr runoff. The survey maps label only "OUTLET" (Upper, north) and "INLET" (Lower, south); several streams reach Upper's south shore | [NLDI UM from 166173169](https://api.water.usgs.gov/nldi/linked-data/comid/166173169/navigation/UM/flowlines?distance=30); [NLDI basin 1881](https://api.water.usgs.gov/nldi/linked-data/comid/1881/basin); [Stream Habitat Viewer crossings](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer/0); survey map pages | Inlet position, drainage and inflow new; the culvert was known |
| 5 | DMR: 235 adults per surface acre as a "minimum escapement density" | **PARTLY** (number right, meaning wrong) | 2008 plan: "the total production is 235 adult alewives/acre", i.e. 85% commercial harvest plus 15% escapement. Its planning escapement is "45% of total production" (≈106/acre). The DMR alewife page (403; [SEC] excerpt) uses it as "at least 235 fish/acre, the minimum for establishing a fishery". It is a production potential and fishery threshold, not a spawning floor; DMR's sustainability floor is 35/acre (SFMP 2024, in `sea_run_alewife.md`). Gemini's sums are right: 1,625 ac × 235 = 381,875, matching the plan's 214,320 + 167,555 | [Penobscot Plan 2008 (FOMB copy), pp. 18, 55, 93](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf); [DMR alewife page (403)](https://www.maine.gov/dmr/fisheries/sea-run-fisheries/sea-run-species/alewife) | Known (the 45% escapement detail is new) |
| 6 | Hot Brook between the lakes: 1/8 mile, non-navigable | **CONFIRMED** | "a short (1/8 mile) non-navigable connecting stream"; boats must "paddle, pole, or walk" | survey sheets | Known |
| 7 | No dam or water-level control on either lake | **CONFIRMED** (no record of one) | Within 45.55–45.75 N, 68.00–67.84 W the state dam layer holds only the Crooked Brook (Danforth) Dam; NID likewise. Hot Brook's only listed crossing below Lower is a railroad (45.6786 N, class "Unknown") | [Stream Habitat Viewer, dams and crossings](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer) | Known |
| 8a | White perch daily bag 25 | **CONFIRMED** (as far as it goes) | Sheets: "special 25 fish bag limit on white perch". Gemini **omits** what the 2019 and 2023 law books add: all bass released alive, plus artificial lures only Oct 1–Dec 31 (in `hot_brook_lake_records.md`). The 2024/2026 law books are on maine.gov (403) | survey sheets | Known |
| 8b | MDIFW Region F | **CONFIRMED** | 2024 guide lists Hot Brook Lakes under "Region F Penobscot Region"; Bancroft, Danforth and Weston are in Region F's town list. The DeLorme reference is **Map 45 B-2** (Gemini said 43/44) | human's 2024 guide pp. 5, 19 | Known |
| 9a | East Grand Lake ice-out 2021–2026 | **PARTLY** [SEC] | DACF search excerpts give 04/12/21, 04/21/23, 04/14/24, 04/20/25 and 04/19/26. **2022 (04/19) is unconfirmed.** DACF pages returned 403 | DACF ice-out pages (403), via search excerpts | New |
| 9b | West Grand ice-out 04/11/21, 04/09/24, 04/20/25, 04/17/26 | **PARTLY** [SEC] | Only 2025 (04/20/25) appeared in an excerpt | as above | New |
| 9c | East Grand 8–10 in of ice by Jan 1 | **UNVERIFIABLE** | Not found on eastgrandlake.com, which has no ice page | [eastgrandlake.com](https://www.eastgrandlake.com/) | — |
| 9d | NWS Caribou flood outlooks | **CONFIRMED**, but this is **river** ice | 6 Feb 2025 (#3): Central Highland/Penobscot "Ice thickness ranges from 6-15in"; snow "5-10in SD", SWE 0.8–1.9 in; Downeast/Bangor ice 3–10 in, snow 4–9 in; northern basins 10–18 in. 22 Jan 2026 (#2): northern 9–15 in; central 5–10 in, "isolated up to 12” thick in head ponds of dams". Both winters had **below-normal** snow | [NWS 6 Feb 2025](https://weather.gov/media/car/ESF%20PDF/SFO_2_6_2025.pdf); [NWS 22 Jan 2026](https://www.weather.gov/media/car/ESF%20PDF/2026/Jan222026_ESF.pdf) (image PDFs, read visually) | New |
| 10a | Piper et al. 2018: loon territory 55 ± 36 ha on whole lakes | **CONFIRMED**, but it is Wisconsin data | "entire small to medium-sized lakes (mean size ± SD = 55 ± 36 ha": 96 pairs in 2017, northern Wisconsin. Coves of large lakes: 358 ± 347 ha (29 pairs). This is the size of a territory (a whole lake or a cove), not a density. Gemini's "132 lakes in NH and NW Maine, 1977–2004" belongs to a different paper | [Auk 135:788 (OUP)](https://academic.oup.com/auk/article/135/3/788-797/5148950) | New |
| 10b | Zdorovennova et al. 2021: under-ice O₂ | **PARTLY** (abstract only; MDPI 403) | Lake Vendyurskoe (Karelia), DO 2007–2020: "oxygen content decreased by more than 50% by the end of winter" when ice came early; under 40% when it came late; **+10–15%** at the end of the ice season when convection began early and lasted long. Thinning spring snow and ice means more light and earlier convection. Same authors (EGU21-9741): spring snow plus ice 35–70 cm; under-ice sun ~0 to >150 W/m²; convection lasts 2–7 weeks. **No daily decline rate was readable.** Gemini's "convection to 5.5–10.5 m at 2.5–4 °C" and "<0.1 mg/L" are unverified | [Crossref abstract](https://api.crossref.org/works/10.3390/w13172435); [EGU21-9741](https://meetingorganizer.copernicus.org/EGU21/EGU21-9741.html) | New |

**Smaller errors in the Gemini report:**
- Milford counts: it gives 589,645 and 1,262,117. DMR's table says **589,503 (2015)** and **1,262,097 (2016)**.
- "Minnows" is a heading on the 1949 sheets, not a tenth species.
- It says Lower's list equals Upper's. It missed MDIFW's 2024 chart, which adds **pumpkinseed and sea-run alewife** for Lower.
- "Webster Brook", the LUPC classifications, MaineDOT bridge #1152 and the 2.55-mile "mileage chart" were all on blocked or unfound sources: **unverified**.

**Found in passing (MDIFW listed-species GIS, the same layer as row 2a):**
- **Brook floater** (*Alasmidonta varicosa*, state Threatened) in **Baskahegan Stream at Bancroft** (1994-07-26 and 1994-08-03) and the Mattawamkeag at Bancroft (1996), Reed/Drew Plt (1992–2006) and Haynesville (2014). The generalised polygons span 45.678–45.742 N, which includes the Hot Brook mouth (45.682 N).
- **Black tern** (state Endangered) at Crooked Brook Flowage, 2010–2012.

---

## What changes for the simulation

1. **Lake areas: no change.** The sim's Lower (277 ha) matches DEP and MDIFW 2024 (684 ac). Upper's sources span 890 (DEP), 898 (NHDPlus V2) and 912 (MDIFW 1949) acres, a 2.4% spread. Keep the DEP geometry.
2. **The main inflow belongs on Upper's south shore.**
   - Hot Brook enters at ≈45.605 N 67.940 W.
   - It drains ≈36 km², ≈55% of Upper's catchment.
   - Mean inflow is ≈0.74 m³/s (derived). The rest arrives through smaller streams, several of them also on the south shore.
   - The north-end outlet already matches the survey map.
   - Route 169 is a culvert ≈2.5 km up Hot Brook, not at the lake.
   - Use: wherever the 3-D world or the 2-D slice places an inflow, river water, nutrients and spring cooling should enter at the south end, opposite the deep north basin and outlet.
3. **Alewife access is clear of Weldon and of the Danforth dam.**
   - The route's only dams are Milford and West Enfield (unchanged from `drainage_species_and_eel.md`).
   - Hot Brook's mouth is ≈7 km below the Danforth dam. Alewives seen at the base of that dam since about 2017 swam past it.
   - The Danforth fishway (built 2023) matters to Hot Brook only as a competing destination upstream.
   - Keep `sea_run_alewife.md`'s present-day default (about 15 adults/acre, colonising) with 235/acre as the "full restoration" scenario.
   - 235/acre is DMR's **total run** at full production and its threshold for opening a fishery. The plan's escapement is 45% of it (≈106/acre).
4. **Mussels.**
   - The **yellow lampmussel** is documented in Upper (already known) and throughout the drainage: Crooked Brook Flowage, the Baskahegan Lake area, and the Mattawamkeag at Bancroft. It is the best-supported second species for the 7d split. Its hosts are white perch (dominant) and yellow perch, with banded killifish, pickerel, white sucker and smallmouth as possible hosts [SEC].
   - Put it in Upper first. Lower has no record but is connected by ~150 m of brook, and its hosts are there.
   - **Do not add the alewife floater yet.** Gemini's sole citation is blocked, and its site list copies the lampmussel's. If confirmed, its recruitment should follow the alewife run (alewife the host; shad and blueback secondary), which ties it to the alewife scenario. With alewives back only since about 2017, any population would be young or sparse.
   - **Brook floater** (Threatened) lives in Baskahegan Stream at Bancroft, near Hot Brook's mouth. It is a stream mussel, a candidate for the outlet stream and connecting brook only (hosts include dace and pumpkinseed; see `maine_freshwater_mussels.md`), and unrecorded on Hot Brook itself.
   - **Eastern elliptio** stays the default (Gemini's Route 169 record is unverifiable and lies upstream of the lakes anyway).
5. **Bald eagle.** One nest on Kittery Island in Upper (LURC 2008–09, search excerpt). With the user's own eagle sightings, this supports one resident pair centred on Upper's island that hunts both lakes. It also supports a spring peak on alewives when the run is on (eagles take alewives in the St. Croix record in `sea_run_alewife.md`).
6. **Loons.** Piper's 55 ± 36 ha is a whole-lake territory in Wisconsin. At 360 ha and 277 ha, both Hot Brook lakes are "large lakes" by that measure, holding cove territories. Expect **1–2 breeding pairs per lake**, not 5–6 (inference, not a Maine count). The sim's single loon is within that range.
7. **Ice and winter.**
   - **Ice-out.** Recent East Grand Lake ice-outs (Apr 12–21, 2021–26) are earlier than the sim's Apr 23 anchor (West Grand mean 1979–2008, Apr 24). For a present-day calendar, ice-out around Apr 15–20 fits better. Small shallow lakes usually clear before big deep ones; that part is inference.
   - **Ice thickness.** NWS river ice in mid-winter was 5–15 in (head ponds to 12 in) in two below-normal-snow winters. That is a floor for lake ice, not a lake value. The sim's ice is a cover fraction; no thickness change is needed.
   - **Under-ice O₂.** The Vendyurskoe abstract supports the sim's design (`ICE.LIGHT_CUT` letting light through for under-ice photosynthesis):
     - whole-column O₂ falls by **>50% by late winter when ice comes early, <40% when late**;
     - it recovers **10–15%** in spring convection.

     Hot Brook is shallower (mean 2.4–3.4 m against Vendyurskoe's deeper basin), so its relative decline should be faster; that is inference. These two percentages can serve as a check target for a winter run.

## Conflicts with existing notes

- **Weldon Dam.** Gemini puts it on the route to the Mattawamkeag. `drainage_species_and_eel.md` says it lies upstream of the confluence. **The existing note is right**: NID coordinates plus NLDI put it ≈6.9 km off the route.
- **Bald eagle nests.** `hot_brook_lake_records.md` says none were found. A LURC excerpt now indicates a nest on Kittery Island in Upper (2008–09). Update that gap and flag the evidence as [SEC].
- **Yellow lampmussel in Lower.** Gemini claims it; the state GIS (`hot_brook_lake_records.md`) shows it in Upper only. Unresolved; treat Lower as unrecorded.
- **Alewife floater.** `maine_freshwater_mussels.md` gives its range as coastal watersheds on alewife or shad runs. Gemini's Hot Brook, Crooked Brook and Baskahegan records conflict with that and are unverified.
- **Danforth fishway date.** The notes say built 2023; Gemini says completed 2024. Both are partly right: built 2023, dedicated 10 Aug 2024.
- **Distance of Hot Brook's mouth below Danforth.** Gemini gives 2.55 mi; NHD gives ≈7.1 km (4.4 mi). Use NHD.
- **235/acre.** Gemini calls it a minimum escapement. `sea_run_alewife.md` (production potential; sustainability floor 35/acre) and the 2008 plan (escapement 45% of production) are right.
- **Fishing rules.** Gemini lists only the white perch bag limit. `hot_brook_lake_records.md` (2019/2023 law books: all bass catch-and-release, artificial lures Oct–Dec) is more complete.
- **Lower's fish list.** Gemini's lists predate the 2024 MDIFW chart already in `hot_brook_lake_records.md` (pumpkinseed, sea-run alewife).
- **Upper's mean depth.** Gemini says not found; `hot_brook_lake_records.md` has 11 ft (3.35 m) from an earlier Lakes of Maine summary.

**Worth getting by hand (blocked to me):**
- the 2007 MDIFW *Freshwater Mussel Assessment* (https://www.maine.gov/ifw/docs/FWMussel_speciesassessment.pdf): settles the alewife floater and Lower's lampmussel;
- LURC's *Stetson II Response to Agency Comments* and Exhibit 11-13: settles the eagle nest and the elliptio at Route 169;
- the DACF 2022 ice-out page.
