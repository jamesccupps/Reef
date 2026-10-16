# Hot Brook lakes: species likely present beyond MDIFW's list, American eel, and sea-run fish (Baskahegan / Mattawamkeag / Penobscot)

Scope: Upper (MIDAS 1076) and Lower (1072) Hot Brook Lake, Danforth / Bancroft / T8 R4 NBPP. This note does not repeat the lake records, regulations or 1949 survey text already in `hot_brook_lake_records.md` (same folder). Researched 2026-10-16.

How I worked:
- I downloaded MDIFW's *Lake Fish of Maine* workbook (2007 update) and parsed it locally. Its "About" sheet says 2,214 lakes; the "Current Species" sheet holds 2,207 distinct MIDAS codes in 17,367 rows, and the "Extirpated" sheet 756 rows.
- I joined it to the Maine DEP lake GIS (MIDAS → HUC-12, acres, maximum sounding depth) and to the USGS WBD HUC-12 names.
- "Analogue" lakes are those in the study set that hold the three species that define Hot Brook's fishery: smallmouth bass, white perch and chain pickerel. **The two Hot Brook lakes are excluded from every analogue count.**
- All counts and the route distances are my own arithmetic on the cited official data. They can be rechecked from the same sources.

Sites I could not read:
- maine.gov returned HTTP 403 to the fetch tool for the MDIFW survey sheets (Hot Brook Upper, Baskahegan Lake) and the DMR trap-count PDF.
- A Springer article page redirected to a sign-in.
- The UMaine Digital Commons repository has been retired.

I did not try to get round any of these.

---

## 1. Species across the Baskahegan / Mattawamkeag drainage and the surrounding towns: which are missing from Hot Brook's list?

### Takeaway
**Shallow warm analogue lakes:** 7 lakes with a maximum depth of 8 m or less (Brackett, Baskahegan, Crooked Brook Flowage, Jackson Brook, Drake, Wytopitlock, Long Lake). In these, the species that most often occur but are missing from Hot Brook's list are:
- **common shiner** (5 of 7);
- **American eel** (4 of 7);
- **golden shiner** (3 of 7);
- **redbreast sunfish** and **creek chub** (2 of 7 each).

**All 17 analogue lakes:** eel is the strongest gap. It is recorded in **14 of 17** analogue lakes and **14 of 15** analogues of 100 acres or more, including Baskahegan Lake and Crooked Brook Flowage, which sit upstream of Hot Brook on the same Baskahegan Stream.

**Cold-water species are habitat-limited, so their absence from Hot Brook is probably real:** rainbow smelt, landlocked salmon, brook trout, cusk (burbot), lake whitefish and longnose sucker are common in the deeper analogues but rare or absent in the shallow ones.

**Not recorded in any of the 61 lakes in the study set:** slimy sculpin, sea-run alewife and largemouth bass.

### Cited Findings
- **Source workbook.** *Lake Fish of Maine*, MDIFW, compiled for the Gulf of Maine KB by P. Vaux and uploaded 2009. Its abstract reads: "derived from MDIFW's lake survey database (2007 update)… a composite data resource based primarily on lake fish surveys, but also containing records obtained from other studies (e.g. Cooper surveys of the 1940s) and informal observations." It covers 2,214 lakes, and its "Extirpated" sheet lists losses by year. — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls) ([KB record](https://ww3.gulfofmaine.org/kb/record.html?recordid=9008))
- **Drainage assignment.** Each lake was assigned by its DEP `HUC_12` code:
  - 178 DEP lake points lie in the Mattawamkeag HUC-8 (01020003); 47 of them have fish lists in the workbook.
  - The Baskahegan Stream HUC-10 (0102000304) contains four HUC-12s: Baskahegan Lake, Crooked Brook Flowage, **"Lower Hot Brook Lake" (010200030403)** and Baskahegan Stream.

  — [DEP Lakes Data MapServer, layer 0](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/0); [USGS WBD HUC-12 service](https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/6)
- **Lake size and depth:** acres are from the DEP MIDAS polygons (layer 3), and maximum depth is the deepest DEP sounding point (layer 2). — [DEP layer 3](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/3); [DEP layer 2](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer/2)
- **Town filter:** Danforth, Weston, Bancroft, Orient, Amity, Haynesville, Brookton, Forest City, Reed, Topsfield, Springfield, Kingman, Codyville and T7–T9 R3–R4 NBPP. It added 22 lakes; 14 of them drain east to the **St. Croix** (HUC 01050001), not the Penobscot. Union of the drainage and town sets: **61 lakes**. — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)
- **Statewide baseline:** American eel is listed in **761 of 2,207** lakes (34%). — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)

#### Every lake in the study set (workbook species; DEP acres and maximum sounding depth)

**Groups:**
- **A** = Baskahegan Stream HUC-10;
- **B** = the rest of the Mattawamkeag HUC-8;
- **C** = lakes in the listed towns that drain to the St. Croix.

**Codes:**
- **Sunfish, bass and perch:** PS pumpkinseed, RBS redbreast sunfish, SMB smallmouth bass, WP white perch, YP yellow perch.
- **Pike family and catfish:** PKL chain pickerel, BB brown bullhead.
- **Suckers:** WS white sucker, LNS longnose sucker.
- **Minnows:**
  - shiners: CS common shiner, GS golden shiner, BNS blacknose shiner;
  - chubs and fallfish: FF fallfish, CC creek chub, LC lake chub;
  - daces: BND blacknose dace, NRD northern redbelly dace, PD pearl dace, FD finescale dace;
  - FHM fathead minnow.
- **Killifish and sticklebacks:** BK banded killifish, 9SB ninespine stickleback, 3SB threespine stickleback.
- **Trout, salmon and whitefish:** BKT brook trout, BNT brown trout, LT lake trout, LLS landlocked salmon, LWF lake whitefish, RWF round whitefish.
- **Others:** EEL American eel, SM rainbow smelt, CUSK burbot, ALW-L landlocked alewife.
- **Unidentified in the workbook:** MIN? "Minnows-carps", SUN? "Sunfish".

A dash means no DEP polygon or sounding was found. All rows are from the [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls), joined to the [DEP Lakes GIS](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer).

| Group | MIDAS | Lake | Town(s) | HUC-12 | Acres | Max depth m | n | Species |
|---|---|---|---|---|---|---|---|---|
| A | 1072 | Lower Hot Brook Lake | Bancroft, Danforth, T8 R4 NBPP | 010200030403 Lower Hot Brook Lake | 684 | 4.0 | 9 | WS YP PKL BB FF WP SMB BND BK |
| A | 1076 | Upper Hot Brook Lake | Danforth, T8 R4 NBPP | 010200030403 Lower Hot Brook Lake | 890 | 5.5 | 10 | WS YP PKL BB PS FF WP SMB BND BK |
| A | 1078 | Baskahegan Lake | Topsfield, Brookton Twp, T8 R3 NBPP | 010200030401 Baskahegan Lake | 6815 | 6.7 | 13 | WS BKT YP PKL BB PS EEL FF WP SMB CS CC BND |
| A | 1080 | Little Pickerel Pond | Brookton Twp | 010200030401 Baskahegan Lake | 26 | 7.0 | 6 | WS YP PKL BB FF SMB |
| A | 1082 | Crooked Brook Flowage | Danforth | 010200030402 Crooked Brook Flowage | 1254 | 6.1 | 9 | WS YP PKL BB PS EEL FF WP SMB |
| A | 1084 | Pickerel Pond | Topsfield | 010200030401 Baskahegan Lake | 32 | 5.2 | 5 | BKT YP PKL BB FF |
| A | 1334 | Jackson Brook Lake | Brookton Twp, Forest Twp | 010200030401 Baskahegan Lake | 737 | 6.1 | 10 | WS YP PKL BB PS WP SMB CS GS RBS |
| A | 1336 | Drake Lake | Forest Twp | 010200030401 Baskahegan Lake | – | 5.5 | 10 | WS YP PKL BB PS WP SMB CS GS RBS |
| B | 0425 | Tote Road Pond | Moro Plt | 010200030104 Alder Brook | 27 | 2.1 | 6 | WS BKT GS NRD FHM LC; extirpated: WS 1992, LC 1992, FHM 1992 |
| B | 1064 | Faulkner Lake | Weston | 010200030303 Upper Mattawamkeag River | 80 | 3.7 | 7 | BKT YP PKL BB PS CC BND |
| B | 1686 | Mattawamkeag Lake | Island Falls, T4 R3 WELS | 010200030111 Middle West Branch Mattawamkeag River | 4069 | 14.3 | 15 | WS BKT YP PKL BB PS EEL FF WP SMB SM LLS RBS LNS LWF |
| B | 1702 | Wytopitlock Lake | Glenwood Plt, T2 R4 WELS | 010200030501 Wytopitlock Lake | 1090 | 7.3 | 13 | WS YP PKL BB PS EEL FF WP SMB CS CC SM BND |
| B | 1716 | Read Lake | Merrill | 010200030201 Upper East Branch Mattawamkeag River | 7 | 1.5 | 2 | BKT NRD |
| B | 1728 | Pleasant Lake | Island Falls, T4 R3 WELS | 010200030203 Pleasant Lake | 1817 | 19.2 | 17 | WS BKT YP PKL BB PS EEL FF WP SMB CS SM BND LLS CUSK LNS LC |
| B | 1730 | Skitacook Lake | Oakfield, T4 R3 WELS | 010200030203 Pleasant Lake | 407 | 5.2 | 7 | WS YP PKL BB PS WP MIN? |
| B | 1734 | Mud Pond | Linneus | 010200030204 Beaver Brook | 22 | 11.9 | 9 | WS BKT YP PKL BB PS EEL WP MIN? |
| B | 1750 | Spaulding Lake | Oakfield | 010200030202 Middle East Branch Mattawamkeag River | 116 | 11.6 | 14 | WS BKT YP PKL BB PS EEL FF WP SMB CC SM LLS RBS |
| B | 1752 | Long Lake | Oakfield | 010200030202 Middle East Branch Mattawamkeag River | 55 | 1.2 | 6 | WS YP PKL BB WP SMB |
| B | 2204 | Wiley Pond | Patten | 010200030107 Fish Stream | 28 | 5.8 | 8 | WS BKT YP PS CS GS CC BND |
| B | 2238 | House Pond | Lee | 010200030701 Silver Lake | 11 | 1.2 | 6 | WS BKT EEL BK FHM BNS |
| B | 2242 | Silver (Mattakeunk) Lake | Lee | 010200030701 Silver Lake | 530 | 8.8 | 8 | BKT YP PKL BB WP SM MIN? SUN? |
| B | 3036 | Flinn Pond | Benedicta Twp, T1 R5 WELS | 010200030605 Lower Macwahoc Lake-Macwahoc Stream | 282 | 5.2 | 7 | WS YP PKL EEL CS CC RBS |
| B | 3038 | Molunkus Lake | Macwahoc Plt, Molunkus Twp, T1 R5 WELS | 010200030605 Lower Macwahoc Lake-Macwahoc Stream | 1108 | 11.6 | 16 | WS BKT YP PKL BB PS EEL FF WP SMB GS CC SM LLS RBS BNT |
| B | 3052 | Upper Macwahoc Lake | Sherman, T3 R4 WELS | 010200030606 Macwahoc Stream | 297 | 2.4 | 7 | WS BKT YP PKL PS EEL CS |
| B | 3056 | Plunkett Pond | Benedicta Twp, Silver Ridge Twp | 010200030608  | 380 | 11.0 | 10 | WS BKT YP PKL BB PS EEL WP SMB GS |
| B | 3088 | Reed Pond | Macwahoc Plt | 010200030607 Lower Molunkus Stream | 24 | 6.7 | 4 | WS YP PKL MIN? |
| B | 3630 | Lost Pond | Moro Plt | 010200030101 Rockabema Lake | 1 | – | 1 | BKT |
| B | 3632 | Chase Pond | Moro Plt | 010200030101 Rockabema Lake | 16 | – | 1 | BKT |
| B | 3634 | Rock Pond | Moro Plt | 010200030101 Rockabema Lake | 2 | – | 1 | BKT |
| B | 3636 | Rockabema Lake | Moro Plt | 010200030101 Rockabema Lake | 393 | 12.2 | 15 | WS BKT PS EEL FF CS GS CC SM BND LLS RBS NRD PD BNS |
| B | 3638 | Gilman Pond | Moro Plt | 010200030101 Rockabema Lake | 12 | 1.8 | 5 | WS BKT CC PD FD |
| B | 3640 | Huntley Pond | Moro Plt | 010200030101 Rockabema Lake | 10 | – | 1 | BKT |
| B | 3642 | Duck Pond | Moro Plt | 010200030101 Rockabema Lake | 9 | – | 1 | BKT |
| B | 3646 | Grass Pond | Moro Plt | 010200030101 Rockabema Lake | 45 | 1.2 | 7 | BKT PS FF CS CC NRD PD |
| B | 3648 | Green Pond | Moro Plt | 010200030101 Rockabema Lake | 12 | 2.4 | 4 | BKT NRD PD FD |
| B | 3651 | Bradford Pond | Moro Plt | 010200030109 Upper West Branch Mattawamkeag River | 13 | 1.2 | 4 | BKT EEL GS NRD |
| B | 3652 | Hale Pond | Moro Plt | 010200030104 Alder Brook | 42 | 11.9 | 7 | WS BKT GS CC NRD 9SB FHM; extirpated: PD 1993, GS 1993, 9SB 1993 |
| B | 3656 | Bear Mountain Pond | Moro Plt | 010200030104 Alder Brook | 9 | – | 1 | BKT |
| B | 3658 | Pickett Mountain Pond | Moro Plt, T6 R6 WELS | 010200030101 Rockabema Lake | 182 | 2.1 | 9 | WS BKT PS EEL FF CS GS BND PD |
| B | 3660 | Secret Pond | Moro Plt | 010200030109 Upper West Branch Mattawamkeag River | 10 | 1.5 | 10 | WS BKT EEL GS CC BND NRD PD FHM BNS |
| B | 3662 | Crystal Lake | Hersey | 010200030105 Crystal Lake-Crystal Brook | 145 | 3.4 | 11 | WS BKT YP PKL BB EEL FF CS CC BND RBS |
| B | 3670 | Pleasant (Mud) Lake | Moro Plt, T6 R6 WELS | 010200030101 Rockabema Lake | 455 | 5.5 | 10 | WS BKT PS EEL FF CS GS LLS RBS 9SB |
| B | 4678 | Webster Pond | Webster Plt | 010200030702 East Branch Mattakeunk Stream | 39 | – | 9 | WS YP BB PS FF WP CS RBS BK |
| B | 8512 | Giles Pond | Patten | 010200030107 Fish Stream | 0 | – | 1 | BKT |
| B | 8514 | Rock Crusher Pond | Island Falls | 010200030109 Upper West Branch Mattawamkeag River | 11 | – | 1 | BKT |
| B | 9769 | Haywire Pond | T1 R5 WELS | 010200030608  | 21 | 7.3 | 8 | WS YP PKL BB PS EEL FF CS |
| B | 9773 | Lawton Pond | Mount Chase | 010200030107 Fish Stream | 5 | 1.5 | 3 | WS BKT CC |
| C | 0121 | Spednik Lake | Vanceboro, Forest Twp, Forest City Twp, T11 R3 NBP | 010500010103 (St. Croix) | 19618 | – | 19 | WS YP PKL BB PS EEL FF WP SMB CS GS CC SM LLS PD CUSK 9SB LWF ALW-L |
| C | 0507 | Deering Lake (Longfellow Lake) | Orient, Weston | 010500010102 (St. Croix) | 506 | 14.9 | 20 | WS BKT YP PKL BB PS EEL FF WP SMB GS CC SM LLS NRD BK CUSK LWF RWF 3SB |
| C | 1063 | North Lake | Orient | 010500010101 (St. Croix) | 112 | 13.7 | 14 | WS BKT YP PKL BB EEL WP SMB GS SM LLS BK MIN? LNS |
| C | 1068 | Brackett Lake | Weston | 010500010102 (St. Croix) | 582 | 7.6 | 14 | WS YP PKL PS EEL FF WP SMB CS GS SM BND BK PD |
| C | 1070 | East Grand Lake (Schoodic Lake) | Orient, Weston, Danforth, Forest City Twp | 010500010102 (St. Croix) | 16805 | 38.8 | 22 | WS BKT YP PKL BB EEL FF WP SMB GS CC SM BND LLS BK CUSK 9SB LNS LWF LT ALW-L RWF |
| C | 1074 | Sucker Lake | Weston, Danforth | 010500010102 (St. Croix) | 201 | 9.8 | 11 | WS YP PKL PS EEL WP SM RBS CUSK MIN? LNS |
| C | 1086 | Farrow Lake | Topsfield | 010500010403 (St. Croix) | 287 | 26.2 | 17 | WS BKT YP BB PS EEL FF CS CC SM BND LLS RBS CUSK 9SB LC LT |
| C | 1088 | East Musquash Lake | Topsfield | 010500010401 (St. Croix) | 818 | – | 15 | WS BKT YP PKL BB PS EEL FF WP SMB SM BND LLS CUSK LT |
| C | 1320 | Little Tomah Lake | Codyville Plt, Topsfield | 010500010602 (St. Croix) | 146 | 6.1 | 6 | WS BKT YP PKL BB GS |
| C | 1322 | Butcher Lake | Codyville Plt | 010500010602 (St. Croix) | 6 | – | 4 | GS NRD BK FHM |
| C | 4680 | Lowell Pond | Carroll Plt, Springfield | 010500010302 (St. Croix) | 122 | 1.8 | 2 | PKL MIN? |
| C | 7419 | unnamed pond | Topsfield | 010500010401 (St. Croix) | 8 | – | 3 | BKT GS BK |
| C | 7469 | Big Greenland Pond | Danforth | 010500010102 (St. Croix) | 89 | 1.8 | 6 | WS YP PKL BB PS CS |
| C | 7526 | Little Greenland Pond | Danforth | 010500010102 (St. Croix) | 42 | 9.1 | 7 | WS BKT YP PKL BB PS CS |

#### Frequency in analogue lakes (smallmouth + white perch + chain pickerel; Hot Brook lakes excluded)
Analogue set (n = 17): Spednik, Deering, North, Brackett, East Grand, Baskahegan, Crooked Brook Flowage, East Musquash, Jackson Brook, Drake, Mattawamkeag, Wytopitlock, Pleasant (Island Falls), Spaulding, Long (Oakfield), Molunkus and Plunkett Pond.

**Species richness:**
- all analogues: mean 13.9, median 14;
- analogues of 100 acres or more (n = 15): mean 14.7;
- **shallow analogues, maximum depth 8 m or less (n = 7): mean 10.7, median 10.**
- Hot Brook lists 10 species (Upper) and 9 (Lower).

Source for all counts: [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls) + [DEP GIS](https://gis.maine.gov/mapservices/rest/services/dep/MaineDEP_Lakes_Data/MapServer).

| Species | All analogues (17) | Analogues ≥100 ac (15) | Shallow analogues ≤8 m (7) | Other Baskahegan HUC-10 lakes (6) | On Hot Brook list? |
|---|---|---|---|---|---|
| American eel | **14** | **14** | 4 | 2 (Baskahegan L., Crooked Brook Fl.) | no |
| Rainbow smelt | 11 | 11 | 2 | 0 | no |
| Brook trout | 10 | 10 | 1 | 2 | no |
| Landlocked salmon | 9 | 9 | 0 | 0 | no |
| Golden shiner | 9 | 8 | 3 | 2 (Jackson Brook, Drake) | no |
| Common shiner | 7 | 6 | **5** | 3 | no |
| Creek chub | 7 | 7 | 2 | 1 | no |
| Cusk (burbot) | 5 | 5 | 0 | 0 | no |
| Redbreast sunfish | 5 | 4 | 2 | 2 | no |
| Longnose sucker | 4 | 4 | 0 | 0 | no |
| Lake whitefish | 4 | 4 | 0 | 0 | no |
| Pearl dace | 2 | 2 | 1 | 0 | no |
| Ninespine stickleback | 2 | 2 | 0 | 0 | no |
| Landlocked alewife | 2 (East Grand, Spednik; St. Croix) | 2 | 0 | 0 | no |
| Lake trout / round whitefish | 2 / 2 | 2 / 2 | 0 | 0 | no |
| Northern redbelly dace / lake chub / threespine stickleback | 1 / 1 / 1 | 1 / 1 / 1 | 0 | 0 | no |
| Finescale dace, slimy sculpin, sea-run alewife, fathead minnow, blacknose shiner, largemouth bass | 0 | 0 | 0 | 0 | no |
| Pumpkinseed | 14 | 13 | 6 | 4 | Upper only |
| Fallfish | 12 | 12 | 4 | 4 | yes |
| Blacknose dace | 6 | 6 | 3 | 1 | yes |
| Banded killifish | 4 | 4 | 1 | 0 | yes |
| Brown bullhead / white sucker / yellow perch | 16 / 17 / 17 | 14 / 15 / 15 | 6 / 7 / 7 | 6 / 5 / 6 | yes |

- **Across the whole 61-lake union**, the most widespread species are:

  | Species | Lakes (of 61) |
  |---|---|
  | white sucker | 43 |
  | brook trout | 42 (mostly small trout ponds in Moro Plantation) |
  | yellow perch | 37 |
  | chain pickerel | 35 |
  | brown bullhead | 31 |
  | pumpkinseed | 30 |
  | **American eel** | **27** |
  | fallfish, white perch | 24 each |
  | smallmouth bass, common shiner, golden shiner | 20 each |
  | creek chub | 18 |
  | rainbow smelt, blacknose dace | 15 each |
  | landlocked salmon, redbreast sunfish | 12 each |
  | northern redbelly dace, banded killifish | 10 each |
  | pearl dace | 8 |
  | cusk | 7 |
  | ninespine stickleback, fathead minnow, longnose sucker | 5 each |
  | lake whitefish | 4 |
  | lake chub, lake trout, blacknose shiner | 3 each |
  | landlocked alewife, round whitefish, finescale dace | 2 each |
  | threespine stickleback, brown trout | 1 each |
  | slimy sculpin, sea-run alewife, largemouth bass, black crappie, northern pike | 0 |

  Burbot appears only under the name "cusk".

  — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)
- **The bog-pond minnows sit in small, predator-poor ponds.** Northern redbelly dace, pearl dace, finescale dace, lake chub, fathead minnow and the sticklebacks occur almost only in small Moro Plantation ponds of 1–45 ac with brook trout and few predators, such as Green, Gilman, Grass, Secret, Hale and Tote Road ponds. Two of those ponds have dated extirpations: Hale Pond (pearl dace, golden shiner and ninespine stickleback, 1993) and Tote Road Pond (white sucker, lake chub and fathead minnow, 1992). — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)
- **Penobscot-basin status of the candidate species** (2008 DMR/MDIFW plan, Table 4):
  - native: bridle shiner, brook stickleback, burbot, common shiner, creek chub, creek chubsucker, fallfish, fathead minnow, finescale dace, golden shiner, longnose dace, northern redbelly dace, pearl dace, redbreast sunfish, slimy sculpin, and the nine- and threespine sticklebacks;
  - introduced: smallmouth bass, largemouth bass, northern pike, black crappie, green sunfish and emerald shiner.

  — [Strategic Plan for the Restoration of Diadromous Fishes to the Penobscot River, March 2008](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf) ([Digital Maine record](https://digitalmaine.com/dmr_docs/52))
- **The same plan contradicts itself on two Hot Brook species:**
  - Chain pickerel: Table 4 lists it as native, but the species text says it is "Indigenous to Maine but not to the Penobscot drainage. Was introduced into the drainage and has expanded range to most waters."
  - White perch: "present in all coastal river drainages up to the first barrier… introduced throughout the drainage", and "Regulated by IFW in 3 bodies of water within the upper Mattawamkeag drainage."

  — [Penobscot Plan 2008, pp. 49–51](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **Bass and minnow loss.** Vaux & Webster (2007, annotated 2020) note that minnow species richness (golden shiner excluded) is higher in northern and western Maine lakes. They link this to the larger number of littoral predators, including largemouth and smallmouth bass, in southern lakes, and cite Whittier et al. 1997 (*CJFAS* 54:1593–1607) on "regional-scale minnow biodiversity losses". — [Vaux & Webster, *Fisheries Then & Now*, Maine Water Conference 2007](https://ww3.gulfofmaine.org/kb/files/10022/MWC07_2020%20edit.pdf)

### Inferences
- **Candidates for the sim, ranked by my judgement of how likely each is to be in the Hot Brook lakes today:**
  1. **American eel: probable.** See §3.
  2. **Common shiner: plausible.** It is in 5 of 7 shallow analogues and 3 of 6 other Baskahegan HUC-10 lakes, including Baskahegan Lake. It also lives in streams, so the brook and Hot Brook outlet are suitable.
  3. **Golden shiner: possible but undocumented.** It is in only 3 of 7 shallow analogues. In the Baskahegan HUC-10 it appears only in Jackson Brook and Drake lakes, which also carry redbreast sunfish and common shiner and so look like a different source community. **Golden shiner is the sim's current "minnow" species, but MDIFW's documented small fishes in Hot Brook are fallfish, blacknose dace and banded killifish.** This is a design point for the user.
  4. **Redbreast sunfish and creek chub: possible**, at 2 of 7 shallow analogues each.
  5. **Unlikely; absence is probably real:**
     - Cold-water species. Landlocked salmon, cusk, the whitefishes, longnose sucker and lake trout occur in **none** of the 7 shallow analogues, only in deeper or stocked lakes (maximum depth 11–39 m). Smelt occurs in only 2 shallow analogues, both at the 7–8 m end (Brackett 7.6 m, Wytopitlock 7.3 m). Hot Brook is under 5.5 m and unstratified, with no cold refuge.
     - Brook trout, except as transients from cold tributaries. It is in only 1 of 7 shallow analogues (Baskahegan Lake).
     - The bog-pond minnows. They are rare in bass–pickerel lakes, consistent with the predator-driven minnow losses Vaux & Webster and Whittier et al. describe.
- **Richness check.** Hot Brook's 9–10 species matches the shallow-analogue median of 10. Its shortfall against the 13.9-species analogue mean is almost entirely cold-water species. So the list is not grossly incomplete. The likely omissions are one to three species: eel, plus one or two shiners or sunfishes.
- **Lower Hot Brook's missing pumpkinseed** is almost certainly a gap. Pumpkinseed is in 6 of 7 shallow analogues and in Upper, which drains into Lower.

### Gaps
- The workbook gives no survey year, gear or abundance for any record. A record can be decades old, and absences are not reported as true zeros.
- I could not open the Baskahegan Lake survey sheet (maine.gov HTTP 403) to see when its eel, common shiner and creek chub records were made.
- For the St. Croix town lakes (group C), HUC-12 names were not looked up. The acres and depths come from the same DEP layers.

---

## 2. How MDIFW-era surveys sampled fish, and what they typically missed

### Takeaway
I could not read the methods of the August 1949 Hot Brook survey: the sheet returned HTTP 403, and no published methods text was found. What I could establish:
- The contemporary Maine lake surveys (Cooper & Fuller, 1937–1944) used **gill nets and seines, plus warden reports of species presence**.
- MDIFW's database adds **informal observations**.
- Analysts of these data treat minnows as "less-detectable" species and limit comparisons to about 22 readily detected, larger-bodied species.
- Daytime gill-net and seine surveys under-sample **eels** (nocturnal, bottom-dwelling, best caught in baited pots or fyke nets), small and cryptic **minnows in vegetated or boggy margins**, **sticklebacks and sculpins**, and **seasonal migrants** such as alewives.

This gear judgement is my inference; for eels it rests on their habit of feeding at night and burrowing in mud, and on the Pennamaquan trap result below.

The Hot Brook list itself shows shore seining was done: banded killifish and blacknose dace are seine-caught fishes. So absent large-bodied species (bass, perch and the like) are probably real, while absent eels and rarer shiners may be gaps.

### Cited Findings
- **The Cooper surveys.** The 1937–1944 surveys by G. Cooper and J. Fuller (University of Maine) covered fish species, size structure, age and growth, diets, water quality, benthos, plankton and depth maps. Fish were sampled "with gill nets and seines + warden reports of species presence".
  - Their primary aim was "to evaluate lakes from the perspective of fish stocking".
  - Most of the 206 Cooper lakes are in southern Maine below 500 ft elevation. Few lakes under 100 acres were surveyed.

  — [Vaux & Webster 2007/2020](https://ww3.gulfofmaine.org/kb/files/10022/MWC07_2020%20edit.pdf)
- **Detectability.** For their 1940s-versus-2004 comparison, Vaux & Webster "focus on 22 species that are readily detected — i.e. likely to appear in snapshot-type sampling (e.g. gamefish spp. and other larger-bodied spp. Ignore most minnow species)". They used "EMAP repeat-sampling data to identify readily detectable species", and they plot 2004 totals for "less-detectable" taxa (e.g. minnows) separately. — [Vaux & Webster 2007/2020](https://ww3.gulfofmaine.org/kb/files/10022/MWC07_2020%20edit.pdf)
- **Stocking.** By 2004, lakes held more of the "detectable" species than in the 1930s–40s. Most new smallmouth and largemouth records "resulted from illegal stocking / colonization, not from legal stocking". IF&W stopped stocking black bass in the 1970s. — [Vaux & Webster 2007/2020](https://ww3.gulfofmaine.org/kb/files/10022/MWC07_2020%20edit.pdf)
- **EMAP gear.** The Northeast Lakes EMAP protocol, used to define detectability, collects fish with overnight trap nets, minnow traps and gill nets, plus seining after sunset, in every major habitat. This is from a search excerpt of the field manual; I did not read the full manual. — [EMAP lake fish field methods (EPA archive)](https://archive.epa.gov/emap/archive-emap/web/pdf/lake_fis.pdf)
- **Age of eel records in the Penobscot basin.** In 1996 the upstream range of eels was compiled "using data compiled from MDIFW fish population surveys…, although most of the records were more than 20 years old at the time". — [Penobscot Plan 2008, p. 21](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **What eel-specific gear finds: an analogue Maine lake.** In 2017, at Pennamaquan Lake (Pembroke, Washington County), 20 baited eel traps set around the lake perimeter for 48 h at a time caught **69 yellow eels**. Eels were 7.7% of the trap catch; the bycatch was 96% catfish (793 bullheads), plus 28 sunfish and 2 bass. "Traps placed at greater depths showed the least amount of eels caught." — [Sipayik Environmental Dept., 2017 American eel mark–recapture report (NOAA repository)](https://repository.library.noaa.gov/view/noaa/38018)
- **What survives as a "species list" can be thin.** In the DEP fish-tissue records from the two nearest sampled lakes, Baskahegan and Brackett (2011), only white perch and smallmouth bass were analysed. — [WQP fish-tissue results, MEDEP_WQX-85699/85698](https://www.waterqualitydata.us/data/Result/search?siteid=MEDEP_WQX-85699%3BMEDEP_WQX-85698&mimeType=csv&dataProfile=biological)

### Inferences
- **What the 1949 list shows about the gear.** It contains a seine-caught killifish and a dace, so the crew seined the shallows. A daytime survey with gill nets and seines in a muddy-bottomed lake would rarely catch eels, which hide in mud and cover by day and feed at night. Bottom traps in a bullhead-rich Washington County lake caught eels readily, so an eel population could easily go unrecorded. That would explain eel's absence from Hot Brook while two upstream lakes on the same stream list it (§3).
- **How to judge each kind of absence:**
  - Absences of large, net-vulnerable species (bass, perch, pickerel, suckers, bullheads, smelt, salmonids) are probably real at the time of each survey.
  - Absences of minnows, sticklebacks, eels and seasonal sea-run visitors are weak evidence.
- **Revision dates.** The 1965 and 2004 revisions of the sheet may have updated the list, but I could not tell which species entered when.

### Gaps
- The Hot Brook 1949 sheet's own methods (nets, effort, seine hauls) could not be read: maine.gov HTTP 403. MDIFW Region F (Enfield) holds the survey files.
- I found no quantitative detection probabilities for eels in Northeast lake gill-net or seine surveys. The EMAP repeat-sampling analysis Vaux & Webster used is not online in a form I could reach.

---

## 3. American eel in the Penobscot → Mattawamkeag → Baskahegan → Hot Brook system

### Takeaway
**Eels can physically reach the Hot Brook lakes today.**
- **Distance.** The water route from Lower Hot Brook Lake's outlet to the end of the NHDPlus network in the Penobscot estuary is about 200 km.
- **Hydropower dams on the route: only Milford and West Enfield.** Both have upstream eel passage. Veazie and Great Works are gone. Weldon (Mattaceunk) lies upstream of the Mattawamkeag confluence, and the Howland bypass is on the Piscataquis, so neither is on the route.
- **Barriers above the Penobscot:** the Mattawamkeag main stem, Baskahegan Stream below Danforth and Hot Brook have no inventoried dam. One railroad crossing on Hot Brook is of unknown passability.
- **Eels are already upstream of Hot Brook's mouth.** MDIFW lists eel in Baskahegan Lake and Crooked Brook Flowage, which lie upstream of the Hot Brook confluence on the same stream, above a 16-ft dam. So eels pass Hot Brook's mouth.

**Expected numbers and size:**
- Densities this far inland are probably low. Published lake densities run from about 1 to 10 eels/ha.
- Lake-grown eels are overwhelmingly **female**, large (roughly 450–1,000 mm at silvering) and long-lived: 7–8 yr in a Washington County lake sample, and 17–22 yr at silvering in the Maritimes.
- Yellow eels stay in fresh water for up to about 22 years.

### Cited Findings
**Route and barriers**
- **The route, by name (my sums of NHDPlus flowline lengths along the NLDI downstream-main path):**

  | Reach | Length | Cumulative from the head of Lower |
  |---|---|---|
  | Lower Hot Brook Lake flowline (COMID 1969) | 3.15 km | — |
  | Unnamed outlet stream (Hot Brook, COMID 1695) | 2.95 km | ≈6.1 km |
  | Baskahegan Stream | ≈7.4 km | joins the Mattawamkeag at ≈13.5 km |
  | Mattawamkeag River | ≈53.8 km | joins the Penobscot at ≈67.3 km |
  | Penobscot River to the end of the returned network | ≈136 km | **≈203.5 km in total** |

  — [USGS NLDI downstream navigation from COMID 1969](https://api.water.usgs.gov/nldi/linked-data/comid/1969/navigation/DM/flowlines?distance=400); [EPA NHDPlus flowline attributes](https://watersgeo.epa.gov/arcgis/rest/services/NHDPlus/NHDPlus/MapServer/2)
- **Gauges on the route.** The downstream path passes these gauges:
  - Mattawamkeag River at and near Mattawamkeag;
  - Penobscot at West Enfield, Passadumkeag, Milford (Indian Island), Eddington and Bangor.

  It does **not** pass the Baskahegan Lake outlet gauge, confirming that Hot Brook joins Baskahegan Stream below the Danforth dam. — [NLDI downstream gauges](https://api.water.usgs.gov/nldi/linked-data/comid/1969/navigation/DM/nwissite?distance=200)
- **Where the Mattawamkeag joins.** The 2008 shad table puts the Mattawamkeag's confluence between West Enfield Dam and Mattaceunk (Weldon) Dam. Its reaches are "Milford Dam to West Enfield Dam 40.55 km", "West Enfield Dam to Mattaceunk Dam 46.50 km", and "Mattawamkeag: mouth to Mattawamkeag Lake 117.94 km" as one undammed reach. — [Penobscot Plan 2008, Table 5](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **Dam inventories.** The only NID dam in the area (45.58–45.76 N, 67.84–68.05 W) is **ME00178 "Danforth" on the Baskahegan, built 1845, 16 ft high, 160 ft long**, at 45.659 N 67.869 W. — [USACE National Inventory of Dams feature service](https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/NID_v1/FeatureServer/0)
  - The Maine Stream Habitat Viewer records the same structure as "Crooked Brook Dam" (surveyed 2009): spillway 10 ft, structure 13 ft, "Fishway: None", 36.1 mi blocked upstream.
  - Its crossings layer has **one Hot Brook railroad crossing at 45.6786 N 67.9318 W (class "Unknown", 2009)** on the outlet stream between Lower and Baskahegan Stream. A Route 169 culvert on Hot Brook at 45.5822 N, rated a "Potential Barrier", is above Upper and not on the route.

  — [Maine Stream Habitat Viewer feature service, layers 0–1](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer)
- **Eel passage at the two route dams:**
  - **Milford:** "An upstream fishway for American eel is installed seasonally at the spillway." The eelway was modified in 2015. In 2023 its opening was delayed by persistent high flows. — [LIHI Certificate #113, Milford](https://lowimpacthydro.org/?p=1478)
  - **West Enfield:** "Eel passage was provided at each Penobscot River hydroelectric facility per the Lower Penobscot River settlement accord of 2004". The project also has a vertical-slot fishway; construction started 2008-08-21. — [NOAA Restoration Center project 2465](https://www.habitat.noaa.gov/apps/rcdb_services/rcdb/project/2465)
  - **Weldon (Mattaceunk), for completeness; not on the Hot Brook route:** upstream eel passage installed in 2024, with 97.2% passage effectiveness in testing. — [LIHI Certificate #189, Mattaceunk](https://lowimpacthydro.org/?p=5177)
- **Downstream survival of silver eels (Mensinger, Blomberg & Zydlewski 2021, *CJFAS*).** A 4-year acoustic telemetry study of 355 eels found:
  - survival per river km of 0.984 (West Enfield) and 0.966 (Milford), against 0.998 in undammed reaches;
  - cumulative mortality of 8.7% over 4.4 km and 14.2% over 5.5 km of dammed sections, against 8.7% over 58.1 km of free river;
  - delays of more than 24 h for over 10% of eels, worse at low flow.

  — [USGS record, doi 10.1139/cjfas-2020-0402](https://www.usgs.gov/publications/consequences-dam-passage-downstream-migrating-american-eel-penobscot-river-maine)

**Eel distribution in the drainage**
- **Recorded upstream of Hot Brook's mouth.** MDIFW lists eel for **Baskahegan Lake (1078)** and **Crooked Brook Flowage (1082)**, both upstream of the Hot Brook–Baskahegan confluence. Elsewhere in the Mattawamkeag drainage it lists eel for Mattawamkeag, Wytopitlock, Pleasant (Island Falls), Spaulding, Molunkus, Plunkett, Flinn, Upper Macwahoc, Crystal and Rockabema lakes, plus Mud, House, Bradford, Pickett Mountain, Secret and Haywire ponds and Pleasant (Mud) Lake: 19 of the 47 drainage lakes in all. — [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)
- **2004 main-stem electrofishing.** Eels were collected from Hampden to East Millinocket and in the main tributaries, but the CPUE of young-of-year (<10 g) and juvenile (10–500 g) eels "above the breached Bangor Dam was dramatically less than the CPUE below the dam" (Yoder et al. 2004). Historical eel abundance was "no doubt" higher and wider. — [Penobscot Plan 2008, pp. 21–22 and Fig. 15](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **After the dam removals.** A 2016 conference abstract (Watson et al.) reports that the authors "no longer observe American eel… concentrating below Veazie Dam", suggesting a more even distribution through the watershed. The peer-reviewed papers stress that above Milford the river "remains dominated by lacustrine species". The abstract was read via search; the full paper's eel results were not read. — [AFS 2016 abstract](https://afs.confex.com/afs/2016/webprogram/Paper24747.html); [Watson et al. 2018, TAFS](https://www.usgs.gov/publications/dam-removal-and-fish-passage-improvement-influence-fish-assemblages-penobscot-river); [Whittum et al., a decade after dam removal](https://www.usgs.gov/publications/fish-assemblages-penobscot-river-a-decade-after-dam-removal)

**Densities, biomass and life history (Maine, Maritimes and nearby)**
- **Lake Sabbatia, Massachusetts** (95.9 ha headwater lake, recolonising after dam removals). A robust-design mark–recapture study gave yellow-eel densities of **0.70 (2013), 0.79 (2014), 1.44 (2015) and 1.28 eels/ha (2016)**. The authors contrast this with the Hudson estuary at 9.5 eels/ha (Morrison & Secor 2004). — [Turner, Chase & Bednarski 2018, NAJFM (accepted manuscript)](https://repository.library.noaa.gov/view/noaa/62478)
- **Gaspé (Québec) lakes:** **2.3 to 9.5 eels/ha**, against 17.4–19.3 eels/ha in the Saint-Jean estuary (Caron et al. 2009). The Saint-Jean system as a whole (1,124 km², 12 lakes over 5 ha) held an estimated 13,481–40,021 eels. — [COSEWIC American Eel assessment, 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
- **Maritime bays and estuaries (not lakes):** mean densities of 34.1 eels/ha (Gulf New Brunswick), 40.9 (Gulf Nova Scotia) and 155.7 (Prince Edward Island) (Hallett et al. 2010). — [COSEWIC 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
- **Biomass share:** "In many freshwater systems, eels accounted for more than 50 percent of the total fish biomass" (Smith & Saunders 1955; Lary et al. 1998). These are historical, coastal systems. — [COSEWIC 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
- **Time in fresh water:** "Generation time for eels residing in fresh water is as high as 22 years". Yellow-eel residence is typically 9 years in salt water and up to 22 in fresh water. — [COSEWIC 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
- **Silver-female size and age (COSEWIC 2012, Table 3).** The table's column alignment was unclear in extraction, so treat individual pairings with care.

  | Site | Mean length | Mean age |
  |---|---|---|
  | Long Pond, PEI | 693 mm | 19.5 yr |
  | Long + Campbells ponds, PEI | 714 mm | 17.8 yr |
  | Margaree River, NS | 645 mm | 21.9 yr |
  | LaHave River, NS | 610 mm | 19.4 yr |
  | Medway River, NS | 555 mm | 19.2 yr |
  | East River (Chester), NS | 468 mm | 17.1 yr |
  | Upper St. Lawrence | 915–1,001 mm | ≈20–21 yr (largest in the range) |

  — [COSEWIC 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
- **Sex ratio.** "More than 95% of sexually differentiated eel are female in most Canadian waters." Maritime rivers are more variable; in the Saint John River, males were 7.4% of 970 eels. — [COSEWIC 2012](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/american-eel-2012.html)
  - **Maine:** silver eels leaving five Maine rivers were **49–98% male**, and the proportion of males was inversely related to lake area: lake-grown eels are mostly female (Oliveira, McCleave & Wippelhauser 2001, *J. Fish Biol.* 58:943–952). The lake-area finding comes via a secondary summary; I did not read the full text. — [doi 10.1111/j.1095-8649.2001.tb00546.x](https://doi.org/10.1111/j.1095-8649.2001.tb00546.x); [catalog record](https://katalog.hcu-hamburg.de/vufind/Search2Record/NLEJ243256221)
- **Maine river eels (Oliveira & McCleave, *Env. Biol. Fish.* 2000).** Yellow-eel density, biomass and growth did not differ significantly among four Maine rivers, and sexual differentiation was complete by about 270 mm and about age 11. This is from a search summary of the abstract; the full text was behind a sign-in. — [Springer record](https://link.springer.com/article/10.1023/A:1007631108201)
- **Pennamaquan Lake, Washington County, Maine (2017):**
  - most measured eels were in the **600 mm length class**;
  - 3 eels aged by otolith were **7–8 years old**;
  - **all 3 carried the invasive swim-bladder nematode *Anguillicola crassus*** (36 worms, 30 of them in one eel).

  — [Sipayik Environmental Dept. 2017 report](https://repository.library.noaa.gov/view/noaa/38018)

### Inferences
- **Eel status in the Hot Brook lakes: probably present, at low density, and probably unrecorded** because of the gear (§2).
  - Eels recorded in Baskahegan Lake and Crooked Brook Flowage must have passed the Hot Brook mouth.
  - Hot Brook has no inventoried dam.
  - Eels climb past structures that block other fish.

  The main uncertainties are the railroad crossing, any beaver dams, and the very low number of elvers that get past Milford and West Enfield and then travel more than 130 km further upstream.
- **Suggested sim parameters (inference, not measurement):**
  - Density: **≈1–5 yellow eels/ha** as a central range. The low end is a recolonising headwater lake (Sabbatia, 0.7–1.4/ha); the high end is Gaspé lakes with open access (up to 9.5/ha). Distance inland and two dams argue for the low end. That gives roughly 360–1,800 eels in Upper (360 ha) and 280–1,400 in Lower (277 ha).
  - Size: mostly 400–900 mm females.
  - Age: 7–20+ yr. Silvering and leaving in late summer and autumn after about 15–20 yr.
  - Behaviour: nocturnal benthic predators of crayfish, fish and insects that bury in mud by day.
- **Optional mortality term for out-migrants (derived).** Silver eels leaving Hot Brook would pass West Enfield and Milford. Using Mensinger et al.'s dammed-section losses (8.7% and 14.2%), survival through both is 0.913 × 0.858 ≈ **0.78, a loss of about 22%**, plus free-river losses. The sim only needs this if it models emigration.
- **Biomass (my assumption).** A 600 mm yellow eel weighs on the order of 0.4–0.6 kg. That puts eel biomass at roughly 0.5–3 kg/ha, a small share next to the historical "50% of fish biomass" claims for coastal systems. **The weight is my assumption and is unsourced.**

### Gaps
- No eel survey, eel count or eDNA result exists for Hot Brook, Baskahegan Stream or the Mattawamkeag that I could find.
- The dates of the MDIFW eel records for Baskahegan Lake and Crooked Brook Flowage are unknown. They may be decades old.
- Annual upstream eel counts at Milford and West Enfield are filed with FERC and DEP each March but were not found online.
- I found no Maine-lake mark–recapture density. Pennamaquan (2017) had no recaptures.
- The passability of the Hot Brook railroad crossing is not assessed (class "Unknown"). Beaver dams on Hot Brook are not inventoried.

---

## 4. Sea-run species after the Penobscot River Restoration Project: alewife, blueback herring, sea lamprey, Atlantic salmon (and shad)

### Takeaway
**Alewives:**
- They now reach the upper Baskahegan. Maine DMR **confirmed alewives at Danforth in 2017**, and a pool-and-weir **fishway at the Baskahegan (Crooked Brook) Dam was built in 2023** to open about 9,000 acres of Baskahegan Lake and Crooked Brook Flowage.
- To reach Danforth, the alewives swim past the mouth of Hot Brook.
- The 2008 DMR/MDIFW restoration plan lists **Upper and Lower Hot Brook lakes as alewife habitat**, with a combined production potential of about 382,000 adults and a planned stocking of 6 fish/acre.
- **No record shows alewives in the Hot Brook lakes yet.** The state's habitat layer lists them, like every Mattawamkeag lake at the time it was compiled, as "Inaccessible – not stocked".

**Other sea-run species:**
- **Sea lamprey:** pass Milford (70–82%) and West Enfield (100%) and travel up to about 100 km above Milford. That could take a few into the lower Mattawamkeag, but Hot Brook is about 64 km further. No record.
- **Atlantic salmon:** have surveyed spawning and rearing habitat in the Mattawamkeag main stem at Bancroft and Reed Plantation, inside the Penobscot critical-habitat recovery unit. Salmon do not use lakes like Hot Brook.
- **Blueback herring and shad:** river spawners. The Mattawamkeag main stem is shad habitat in the 2008 plan. No Hot Brook relevance beyond possible transient use of the outlet stream.

### Cited Findings
- **Alewife production estimates (2008 plan, Table 6), "Baskahegan" rows:**

  | Lake | Surface acres | Adult production | % of basin | Stocking (6 fish/acre) | "Flagg" column |
  |---|---|---|---|---|---|
  | **Upper Hot Brook Lake** | 912 | **214,320** | 1.1 | **5,472** | blank |
  | **Lower Hot Brook Lake** | 713 | **167,555** | 0.9 | **4,278** | blank |
  | Crooked Brook Flowage (WW) | 1,645 | 386,575 | 2.0 | 9,870 | 386,575 |
  | Baskahegan Lake (WW) | 6,944 | 1,631,840 | 8.6 | 41,664 | 1,631,840 |

  - Production uses "a unit productivity of 235 fish per acre in all habitat regardless of trophic status". The basin total is 18.91 million.
  - The plan says its estimate exceeds Flagg's (1984) "because it includes the 40 lakes and ponds identified by Flagg and an additional 11 bodies of water below and 15 above the Veazie Project".
  - "MDMR has restored populations in numerous watersheds by stocking adult alewives at a rate of six fish per acre for a minimum of four years."

  — [Penobscot Plan 2008, pp. 18–20, 54–55](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **Historical runs:**
  - "By 1872, the towns of Howland, Milo, Sebec, Dover, Foxcroft, Brownville, and Mattawamkeag were demanding the restoration of salmon, shad, and alewives to their rivers."
  - Dams were built on the Mattawamkeag (Gordon Falls) in the early 1800s.

  — [Penobscot Plan 2008, pp. 10–11, 17](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
  - An 1879 U.S. Fish Commission letter describes salmon fry planted at Bancroft and Mattawamkeag village, and three dams "at least 12 feet" high between Mattawamkeag and Bancroft at that time. — [USFC 1879 salmon correspondence (penbay.org transcription)](https://www.penbay.org/usfc/usfc1879_salmon.html)
- **Stocking strategy, as reported in 2009.** DMR proposed stocking alewives and bluebacks, starting in the lower watershed (Chemo Pond and other warm lower ponds) and moving upstream over 25–50 years. "We're not going to put fish where they can't get to or get out of." — [Bangor Daily News, 25 Feb 2009](https://www.bangordailynews.com/2009/02/25/news/state-news/state-looks-to-stock-penobscot-river/)
- **Alewives at Danforth:**
  - "In 2017, Maine DMR confirmed alewives in Danforth"; "The alewives returning to Danforth are the farthest inland known to recolonize naturally on the East Coast."
  - The fishway, built in 2023 on Baskahegan Stream in Danforth (landowner: Baskahegan Dam Company), is "restoring access to 135 miles of river habitat and nearly 9,000 acres of pond habitat". The fishway-and-park project cost $2.5 million.

  — [ASF, 31 Jul 2024](https://www.asf.ca/danforth-celebrates-fishway-and-park-project-completion/)
  - Earlier ASF description: "install a fishway for river herring at Baskahegan Lake and Crooked Brook"; local residents had sat on a planning committee since 2017. — [ASF Rivernotes, 3 Sep 2021](https://www.asf.ca/?p=36632)
  - "Prior to Veazie Dam being removed, there were zero river herring effectively in the drainage" (M. Nemeth, ASF). Herring had reached Danforth "for the past couple of years" before the fishway. — [WABI, 30 May 2024](https://www.wabi.tv/2024/05/30/revitalization-brings-new-fishway-park-pavilion-danforth/)
- **The state alewife habitat layer** (Stream Habitat Viewer "Documented Habitat", owned by MDIFW / USFWS; statuses such as "DMR stocked" and "Commercial Harvest" show it is the river-herring lake layer):
  - lists **Upper Hot Brook Lake (890.3 ac) and Lower (683.9 ac) as "Inaccessible – not stocked; No Commercial Harvest"**, with Hot Brook mapped as a habitat stream;
  - gives the same status to **every** Mattawamkeag-drainage lake, including Baskahegan, Crooked Brook Flowage, Mattawamkeag, Molunkus and Wytopitlock;
  - by contrast, Pushaw and Chemo are "Accessible – DMR stocked".

  — [Maine Stream Habitat Viewer, layer 9](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer/9)
- **River herring passed at the Milford fish lift, 2024: 5,476,107** (provisional). ASF reported "more than 6 million returning this year to date" in July 2024; the two figures may count different things or dates. — [DMR trap counts 2024 (via search excerpt; the PDF returned 403)](https://www.maine.gov/dmr/sites/maine.gov.dmr/files/inline-files/Trap%20Counts%20for%20Web%20Page%202024.pdf); [ASF 2024](https://www.asf.ca/danforth-celebrates-fishway-and-park-project-completion/)
- **Sea lamprey (Peterson, Thors, Frechette & Zydlewski; NAJFM, doi 10.1002/nafm.10919).** Of 150 adults tagged in 2020–2021:
  - "Between 70–82%… [were] observed passing Milford Dam again" after mean delays of 9–11 d;
  - West Enfield passage was 100% (n = 63);
  - median upstream travel above Milford was 38.8 km, maximum about 100 km;
  - "most tagged Sea Lamprey ended their migration in the vicinity of a dam".

  — [Peterson et al., record](https://www.citedrive.com/en/discovery/adult-sea-lamprey-approach-and-passage-at-the-milford-dam-fishway-penobscot-river-maine-united-states)
- **Lamprey and blueback passage requirements.** The 2008 plan's table of species to be passed marks sea lamprey at Milford and West Enfield (and "X?" at Mattaceunk and Howland), and alewife, eel, shad, salmon and blueback at all lower main-stem dams. — [Penobscot Plan 2008, p. 62](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **Shad habitat.** The Mattawamkeag from its mouth to Mattawamkeag Lake (117.94 km) is counted as shad habitat with a potential of 205,744 adults. — [Penobscot Plan 2008, Table 5](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf)
- **Atlantic salmon:**
  - The Stream Habitat Viewer maps surveyed salmon **spawning habitat** in many Mattawamkeag River segments in Bancroft Twp and Reed Plt (classes "Yes" and "Limited"), and surveyed **rearing habitat** there.
  - "Mattawamkeag River (1)" and "(2)" HUC-10s are in the "Penobscot Basin" Salmon Habitat Recovery Unit occupation layer.
  - No salmon habitat segment is mapped on Hot Brook.

  — [Maine Stream Habitat Viewer, layers 4, 5 and 7](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer)
  - ASF: restoring headwater passage is "imperative because that is where spawning takes place". Mattawamkeag salmon had "crashed" by 1919 and were restocked in the 1940s–50s. — [ASF 2021](https://www.asf.ca/?p=36632)

### Inferences
- **Alewives in Hot Brook: physically possible since about 2017, but unconfirmed.**
  - Alewives that reached Danforth swam up Baskahegan Stream past the Hot Brook confluence, about 7 km above the Mattawamkeag.
  - Hot Brook is about 3 km long from Lower's outlet, has no inventoried dam, and Lower is a 684-acre warm lake: the habitat alewives seek.
  - The "Inaccessible" label is a basin-wide status from before the dam removals, not evidence of a Hot Brook barrier.
  - Uncertainties: whether straying adults have found Hot Brook; the railroad crossing; beaver dams; and the outlet structure (the 1949 fish-screen proposal in the earlier note).
- **Sim scenario: a restoration toggle.** Add a spring alewife run of up to about 235 adults/acre at full restoration. That is about 214k in Upper and 168k in Lower, the plan's planning figure regardless of trophic state, which the plan admits may be high for oligotrophic lakes. A founding run would be about 6 adults/acre. Spawning would be late May–June. Young-of-year would leave in summer and autumn, adding a strong pelagic forage pulse for bass, pickerel and white perch and grazing pressure on zooplankton. **The present-day default should be no alewives.**
- **Lamprey distances (derived).** The Mattawamkeag mouth lies within the West Enfield–Mattaceunk reach, so at most 40.55 + 46.5 ≈ 87 km above Milford (2008 plan, Table 5). That is within the ≈100 km maximum lamprey travel. The mouth of Hot Brook is a further ≈61 km (53.8 km of Mattawamkeag + 7.4 km of Baskahegan Stream), and Lower's outlet ≈64 km.
- **Sea lamprey and salmon.** Treat Hot Brook-relevant lamprey and salmon as **absent**. Lamprey spawn in streams and rarely get this far. Salmon spawning and rearing are in the Mattawamkeag main stem, not lakes or this small, warm outlet stream.
- **Blueback herring and shad** spawn in rivers. At most they would be transient in the Mattawamkeag. No lake role.

### Gaps
- No DMR or ASF count of alewives at the Danforth fishway, and no survey of Baskahegan Stream tributaries such as Hot Brook, was found.
- The date the Stream Habitat Viewer alewife layer was compiled is not stated.
- No sea lamprey or blueback herring records for the Mattawamkeag or Baskahegan were found.
- DMR's Penobscot alewife operational plan (the Phase 1 priority lakes) was not found online. NOAA project records refer to "13 Phase 1 priority lakes"; their list was not retrieved.

---

## 5. Later surveys and angler, forum or lake-association reports of other species in the Hot Brook lakes

### Takeaway
**Nothing reliable adds species to MDIFW's list.**
- No electrofishing, creel, eDNA or lake-association survey of either lake was found, and no angler-forum post naming largemouth, crappie, pike, eel, trout, salmon or shiner in the Hot Brook lakes.
- The only "extra species" claim is a **real-estate listing** that says Lower Hot Brook holds "brook trout, salmon". This is low reliability, and it contradicts MDIFW's statement that the system has no coldwater habitat.
- The state's non-native-fish layer flags both lakes as holding confirmed non-native fish, without naming species. This is consistent with the documented smallmouth bass, and with chain pickerel and white perch, which are not native to this drainage.

### Cited Findings
- **Real-estate listing (low reliability).** A listing for a log cabin on Lower Hot Brook Lake reportedly describes the lake as 713 acres and home to "brook trout, salmon, small mouth bass, white perch, and pickerel". This is from a search-result summary; the page returned HTTP 429 and a sister listing returned 404, so the wording is unverified. — [LandBroker MLS listing](https://www.landbrokermls.com/property/583577/log-cabin-on-lower-hot-brook-lake)
- **MDIFW's own text** says the tributaries and connecting stream lack "suitable habitat for coldwater fish". This is quoted in the earlier note and not repeated here. — [MDIFW Lower Hot Brook sheet](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf) (HTTP 403 to my fetch; text as quoted in `hot_brook_lake_records.md`)
- **Aggregator pages.** Lake-Link pages for Upper and Lower list smallmouth bass, yellow perch, chain pickerel and white perch. They appear to be derived from state data and add nothing. — [Lake-Link: Lower Hot Brook Lake](https://www.lake-link.com/maine-lakes/washington-county/lower-hot-brook-lake/318358/); [Lake-Link: Upper Hot Brook Lake](https://www.lake-link.com/maine-lakes/washington-county/upper-hot-brook-lake/318129/)
  - Fishbrain lists Crooked Brook Flowage as popular for smallmouth bass, chain pickerel and yellow perch. — [Fishbrain, Crooked Brook Flowage](https://fishbrain.com/fishing-waters/WDwIgMxT/crooked-brook-flowage)
- **Non-native-fish layer** (Stream Habitat Viewer): polygons for Upper Hot Brook Lake and Lower Hot Brook Lake are marked "Confirmed: Y". Hot Brook stream segments and several Baskahegan Stream segments are "Confirmed: N". East Grand, Deering, Brackett, Crooked Brook Flowage and Mattawamkeag River segments are "Y". No species field is published. — [Maine Stream Habitat Viewer, layer 16](https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Maine_Stream_Habitat_Viewer/FeatureServer/16)
- **Nearest largemouth bass problem.** It is in the **St. Croix** drainage. In 2012 MDIFW confirmed illegally introduced largemouth bass in Grand Falls Flowage and encouraged anglers to keep them from Grand Falls Flowage, Lewy, Long and Big lakes and the St. Croix River. — [Bangor Daily News, 29 Jun 2012](https://www.bangordailynews.com/2012/06/29/news/difw-encourages-down-east-take-of-largemouth-bass/)
- **Penobscot drainage generally.** Largemouth bass "has been recently illegally introduced into some Penobscot drainage waters". Northern pike, black crappie and green sunfish "are present as the result of recent illegal introductions". None of the 61 lakes in §1 lists any of them. — [Penobscot Plan 2008, pp. 51–52](https://cybrary.fomb.org/pages/20080300_PenobscotPlan.pdf); [Lake Fish of Maine xls](https://ww3.gulfofmaine.org/kb/files/9008/LakeFish_Maine.xls)
- **Statewide context.** MDIFW describes "hundreds of cases" of illegal introductions, including black crappie, rainbow smelt and largemouth and smallmouth bass. — [MDIFW "Keepers" invasive species page (via search excerpt)](https://www.maine.gov/ifw/keepers/scenarios/invasive-species.html)

### Inferences
- **Reliability ranking:**
  1. MDIFW survey and database (high for net-vulnerable game fish; weak for eels and minnows);
  2. the state GIS layers (high for what they show, but undated and species-blind);
  3. aggregators (derivative);
  4. the real-estate listing (low; probably boilerplate).
- **Trout and salmon.** The "brook trout, salmon" claim fits only transient brook trout from cold inlets, or landlocked salmon or brook trout stocked in nearby waters, such as Baskahegan Lake's brook trout record. It does not fit a resident population in a 23 °C, unstratified lake. The sim should not include them.
- **Largemouth bass, crappie and pike** are plausible future invaders by illegal stocking in this region, but are absent on all current evidence.

### Gaps
- Lakes of Maine (lakesofmaine.org), which hosts per-lake fish lists and sometimes newer records, has been HTTP 403 to fetch tools (per the earlier note). It was not re-tried.
- No lake association for the Hot Brook lakes was found. MDIFW Region F (Enfield) creel or angler-diary data, if any, are not online.
- The user's own field observations are noted in project memory: sunfish in the stream pools, pickerel, mussels, and bass more common than perch. They remain the only recent first-hand evidence of the community.
