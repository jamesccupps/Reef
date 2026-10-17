# Which plants actually grow in Upper and Lower Hot Brook Lake and the brook between them

Compiled 2026-10-16 for the "only what is actually there" plant census (the counterpart of the fish census). Upper Hot Brook Lake is MIDAS 1076 and Lower is MIDAS 1072 (Danforth / T8 R4 NBPP, Washington Co., Maine).

**Tags**
- [API]: a record I pulled myself from a public data API (GBIF, iNaturalist, iDigBio, the USFWS NWI map service). The query is linked.
- [read]: seen in the source text.
- [snippet]: from a search-engine summary only.
- (inf): my own arithmetic or judgement.

**What this extends** (I do not repeat these):
- `Whole lake 3D fish simulation/macrophytes.md`: growth forms, depth limits, biomass, parameters.
- `invertebrates_plankton_plants.md` §6: the MNAP/Cameron community types and the Highland Lake frequencies.
- `hot_brook_lake_records.md`: the MDIFW sheets, water chemistry, and the 2004 boat-launch note.
- `lidar_and_shallows.md`: the NAIP shelf method.

**Handling**
- Downloaded JSON went to the session scratchpad, one new folder per source, and was read with `python -I`.
- lakesofmaine.org (bot-walled) was **not** attempted.
- maine.gov returned 403 to every fetch (the DEP invasives page, the 2026 IAP map PDF, the MNAP community pages), and I did not try to get around it.

---

## 1. What plant records exist in or at the two lakes and the brook?

### Takeaway
Only **two** plant species have ever been recorded in the water of these lakes, both stoneworts, both from one 2015 visit:
- ***Nitella flexilis*** and ***Nitella tenuissima*** were collected on 15 July 2015 at Upper's south end, about 10 m from shore, by the boat launch.
- Nothing has been digitized for Lower Hot Brook Lake or the connecting brook.
- iNaturalist holds only upland plants on the camp shore.

Aerial near-infrared shows where the surface-reaching plants (floating leaves, emergent stems) are:
- a **thin shore fringe**, about 2.3 ha in Upper (0.6% of the lake) and about 0.8 ha in Lower (0.3%);
- concentrated at Upper's south and south-west end by the inlet wetlands, along Upper's west-side coves, and along Lower's east, north and west shores.

### Cited Findings

**The only in-lake specimens** (all [API]; one collection, 2 field numbers × 3 herbaria):

| Species (as filed) | Date | Collectors / number | Herbaria and GBIF records | Locality and coordinates | Label notes |
|---|---|---|---|---|---|
| *Nitella flexilis* (L.) C.Agardh; "aff." on the PH and MARY duplicates | 2015-07-15 | R. S. Sleith & S. D. Gottschalk, **RSS2015.07.15-08b** (identified by Sleith 2015-12-30) | NY 02334374 ([GBIF 1928277843](https://www.gbif.org/occurrence/1928277843)); PH00780505 ([GBIF 4075533874](https://www.gbif.org/occurrence/4075533874)); MARY1014389 ([GBIF 5070843568](https://www.gbif.org/occurrence/5070843568)) | "Upper Hot Brook Lake", 45.60397 N, 67.92943 W, elevation 423 ft (129 m) | "Dioecious, male and female plants; KGK4461 male; KGK4462 female" (MARY) |
| *Nitella tenuissima* (Desv.) Kütz.; "aff." on PH | 2015-07-15 | same, **RSS2015.07.15-08a** | NY 02334373 ([GBIF 1928833655](https://www.gbif.org/occurrence/1928833655)); PH00780504 ([GBIF 4075533871](https://www.gbif.org/occurrence/4075533871)); MARY1018852 ([GBIF 5070873354](https://www.gbif.org/occurrence/5070873354)) | same point | "Monoecious, conjoined" (MARY) |

**How the 2015 collection was made**
- These come from the Sleith, Wehr & Karol charophyte survey ([Sleith et al. 2018, *Ecology & Evolution* 8:2802, PMC5838067](https://pmc.ncbi.nlm.nih.gov/articles/PMC5838067/)) [read]:
  - 740 water bodies in NY and New England were sampled in June–September of 2014 and 2015.
  - Each water body was sampled **once, from a single access point, by wading and with a dredge, for a target of 30 minutes**, with water chemistry measured in the field.
- Charophytes were found at 363 of the 740 sites (Table 2) [read]:

  | Taxon | Sites |
  |---|---|
  | *N. flexilis* | 147 |
  | *N.* aff. *flexilis* | 49 |
  | *N.* aff. *tenuissima* | 39 |
  | *N. furcata* | 34 |
  | *N. microcarpa* | 22 |
  | *N. transilis* | 19 |
  | *Chara contraria* | 37 |
  | *Nitellopsis obtusa* | 27 |

- In the same paper, *N. flexilis* is "a generalist", and *C. contraria* "was not detected across thousands of square kilometers in interior portions of Maine, where softer water occurs" [read].
- The "aff." qualifiers on the Hot Brook duplicates match the paper's "*N.* aff. *flexilis*" and "*N.* aff. *tenuissima*" categories (inf).
- **Where the point is.** It lies **inside Upper's outline, 10 m from the south-east shore** (inf; from the OSM outline in `tools/hotbrook/data/Upper_Hot_Brook_Lake.json`). MDIFW's 2004 sheet gives the only access as an "unimproved boat launch site at the south end of Upper Hot Brook Lake that is accessible from Rt. 169" (quoted in `hot_brook_lake_records.md` from the [MDIFW Upper sheet](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf)). So the sample is almost certainly from that launch, in wading-to-dredge depth (inf).
- **Lower was not sampled.** None of the survey's specimens from that day come from Lower Hot Brook Lake [API; GBIF and iDigBio searches below].
- **That day's route.** On the same day the team also collected *Nitella* at Jackson Brook Lake, Pocomoonshine, Pocumcus, Seavey, Lewy, Duck Lake and East Musquash Lake ([GBIF query, recordedBy Sleith, Maine](https://api.gbif.org/v1/occurrence/search?recordedBy=Robin%20S.%20Sleith%3B%20Stephen%20D.%20Gottschalk&stateProvince=Maine&limit=300)) [API].

**Searches that found nothing else in the water**
- **GBIF**, kingdom Plantae, box 45.58–45.70 N × 67.85–68.00 W: 49 records ([query](https://api.gbif.org/v1/occurrence/search?kingdomKey=6&decimalLatitude=45.58,45.70&decimalLongitude=-68.00,-67.85&limit=300)) [API].
  - Inside the lakes' outlines the only records are the six *Nitella* sheets.
  - Three upland iNaturalist plants sit on Lower's east shore at Lakeview Rd: painted trillium, field horsetail, fireweed.
  - The rest are at Danforth village (Baskahegan Stream, ~6 km NE and downstream) or along US-1/Rt 169.
- **iNaturalist**, box 45.598–45.668 N × 67.915–67.962 W ([plants query](https://api.inaturalist.org/v1/observations?nelat=45.668&nelng=-67.915&swlat=45.598&swlng=-67.962&iconic_taxa=Plantae&per_page=200)) [API]:
  - **10 observations of any kind; 5 plants, all upland.** They are *Tragopogon*, *Pteridium aquilinum*, *Equisetum arvense*, *Trillium undulatum* and *Chamaenerion angustifolium*, all at the Lakeview Rd camps (45.655–45.657 N, 67.928–67.930 W).
  - No aquatic or wetland plant has been observed at either lake or the brook.
- **iDigBio**, the same box: 4 records, all the Sleith *Nitella*. A locality search for "Hot Brook" returned 0 ([iDigBio search API](https://search.idigbio.org/v2/search/records)) [API].

**The nearest wetland-plant records, downstream at Danforth** (Baskahegan Stream, 6.1 km NE; Hot Brook drains there) [API]:
- *Pontederia cordata*, 2024-08-02 ([iNat 233511740](https://www.inaturalist.org/observations/233511740)). The same observer that day recorded *Persicaria pensylvanica*, *P. lapathifolia*, *Spiraea alba*, *Scutellaria lateriflora*, *Ranunculus pensylvanicus* and *Cuscuta gronovii* (GBIF box query above).
- *Myrica gale* (sweet gale), 2025-07-01 ([GBIF 6400020699](https://www.gbif.org/occurrence/6400020699)).
- *Typha angustifolia* (narrow-leaved cattail), "Baskahegan Stream", 2011-07-01: a **USGS Nonindigenous Aquatic Species** record ([GBIF 1897207151](https://www.gbif.org/occurrence/1897207151)).
- C. H. Knowlton's "Danforth" sheets (IND), coordinates a town centroid ±710 m, so the place is unknown:
  - *Scirpus cyperinus* "swamp" and *Carex retrorsa* "wet swamp", 1935-08-14 ([GBIF 5070596125](https://www.gbif.org/occurrence/5070596125), [5070594374](https://www.gbif.org/occurrence/5070594374));
  - *Salix petiolaris* "Swamp", 1938 ([GBIF 5070643189](https://www.gbif.org/occurrence/5070643189)).

**State sources**
- **MDIFW lake sheets** (1949, revised 1965 and 2004): no plant record. Shores are rocky with some sand and mud and the bottoms mostly muddy. Wetlands lie on Upper's S and W and Lower's N and E (`macrophytes.md` §6; [MDIFW Lower sheet](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf)) [read earlier].
- **Lakes of Maine.** Its "Lake Life" page for Lower lists Fish, **Plants**, Loons, Mussels & Crayfish and Aquatic Invaders sections ([lakesofmaine.org m=1072](https://lakesofmaine.org/lake-lake-life.html?m=1072)) [snippet]. So a plant list exists there. It sits behind the bot wall and was not attempted.

**Where surface-reaching vegetation shows from the air**
- **Method** (inf, from the project's own NAIP analysis, `tools/hotbrook/shallows.py` → `data/shallows.json`): on the ~1-m NAIP near-infrared band, a pixel counts as plant if NIR > deep water + 10 and NIR > red. This catches **floating leaves and emergent stems only**; submerged beds are invisible.
- **Upper:** 35,774 vegetated pixels.
  - 184 model cells (15 m) are ≥ 20% vegetated, which is 4.1 ha.
  - The vegetation-weighted area is **2.3 ha, 0.6% of 369 ha**.
- **Lower:** 12,066 pixels; 66 cells = 1.5 ha; weighted **0.84 ha, 0.3% of 274 ha**.
- **Where they sit:** every vegetated cell hugs the shore: median 15 m out, 90th percentile 45 m (Upper) and 15 m (Lower), at model depths of 0.3–1.0 m (10th–90th percentile).
- **Clusters (cells ≥ 20% vegetated, by 0.005° bin):**
  - **Upper's south end**, 45.600–45.610 N, 67.940–67.960 W (~96 of 184 cells). This is beside the inlet's shrub and forested wetlands (§3) and the *Nitella* site.
  - **Upper's west side**, 45.615–45.625 N, 67.945–67.950 W (38 cells): the coves between the western points.
  - **Lower's east shore**, 45.640–45.650 N, 67.930–67.935 W (17 cells).
  - **Lower's north end**, about 45.660 N, 67.940–67.945 W (13 cells), beside the only NWI marsh touching either lake.
  - **Lower's west shore**, 45.645–45.655 N, 67.945–67.955 W (~14 cells).

### Inferences
- **Confirmed for the census: only *Nitella flexilis* (aff.) and *N. tenuissima* (aff.), Upper.**
  - Both were fertile by mid-July: one dioecious with male and female plants, one monoecious with conjoined gametangia.
  - They grew within wading or dredge reach of the south-end launch, which on Upper's shelf is ≤ ~1.3 m (the shelf edge in `lidar_and_shallows.md`).
  - Two co-occurring *Nitella* species in a 30-minute search suggests *Nitella* is not rare there.
  - The deeper mud (2–4 m) is the usual charophyte zone (charophytes reach deeper than angiosperms: Chambers & Kalff in `macrophytes.md` §2), so a *Nitella* low meadow on Upper's and Lower's muddy floors is plausible but **unobserved**.
- **Floating-leaved and emergent beds are small.** They form a fringe of patches at 0.3–1 m, not broad lily fields; this measures the surface-reaching forms only. Submerged canopy, isoetid and *Nitella* cover can be much larger and is not measured.
- **Shore nature.** The specimens tell us nothing about the brook, Lower, or the vascular flora. Every vascular species placed in the sim is therefore an inference from analogues (§2), with the user's own sightings as the best local check.

### Gaps
- **The Lakes of Maine plant list** for MIDAS 1072 and 1076 (bot wall; not attempted). It is the single most valuable missing source. The user could copy it by hand.
- **The Consortium of Northeastern Herbaria portal** (portal.neherbaria.org), which holds the University of Maine (MAINE) herbarium, was **unreachable** (connection failed, HTTP 000). UMaine sheets from Danforth or Weston may exist there and not in GBIF.
- **The NAIP flight year and date** behind `naip_hr/` was not recorded. The NIR method also cannot tell lily from pickerelweed, nor see submerged beds.
- **No record at all** for Lower, the connecting brook, or Hot Brook below Lower.

---

## 2. What grows in the nearest analogue lakes, and how often?

### Takeaway
Within ~50 km (eastern Maine plus the adjacent New Brunswick border lakes), digitized records rank the soft-water flora as follows:
- **Most frequent:** pickerelweed, then fragrant water-lily, bogbean, pipewort, yellow pond-lily, narrow-leaved bur-reed, water horsetail, *Potamogeton gramineus*, *Nitella flexilis* and spiny-spored quillwort.
- **Next:** the bladderworts, watershield, little floating-heart, *P. epihydrus*, *P. natans*, *Sagittaria*, *Isoetes*, *Lobelia*, *Eleocharis*, *Littorella* and *Elatine*.

**Coverage of the named analogue lakes:**
- Baskahegan, Brackett, Crooked Brook Flowage, East Grand and Pleasant have **no** digitized plant records.
- The Mattawamkeag-chain lakes and Molunkus hold only charophytes (*Nitella flexilis*, *N. tenuissima*, *Chara braunii*) plus a 1931 *P. spirillus*.

The hard-water species (sago, curly-leaf and *Zosterella*) and *Chara contraria* are absent or near-absent here. That fits Hot Brook's alkalinity of ~5–8 mg/L, Hellquist's soft-water Group I–II.

### Cited Findings

**How often each taxon appears across 151 distinct 2-km sites**
- **The data** [API]: GBIF records of aquatic families and genera in the box 45.30–46.05 N × 67.40–68.45 W ([GBIF occurrence search](https://api.gbif.org/v1/occurrence/search)):
  - families: Potamogetonaceae, Nymphaeaceae, Cabombaceae, Menyanthaceae, Pontederiaceae, Eriocaulaceae, Lentibulariaceae, Typhaceae/Sparganiaceae, Haloragaceae, Hydrocharitaceae, Najadaceae, Isoetaceae, Characeae, Alismataceae, Podostemaceae, Fontinalaceae;
  - genera or species: *Lobelia dortmanna*, *Eleocharis*, *Schoenoplectus*, *Scirpus*, *Elatine*, *Zizania*, *Equisetum fluviatile*, *Juncus militaris*, *Carex lasiocarpa*, *Dulichium*, *Hippuris*, *Ranunculus flammula*, *Callitriche*, *Littorella*.
  - The pull is 424 records: herbarium sheets 1897–2017 plus research-grade iNaturalist. It includes New Brunswick, which is flagged.
  - "Sites" are distinct 0.02° cells (my aggregation).
- **This is a presence frequency biased by collecting effort**:
  - Lambert Lake 1908, Diggity Stream and Fifth Lake NB 1985, the NB protected-area surveys of 2006, and Sleith 2015 dominate the herbarium share.
  - Roadside lakes dominate the iNaturalist share.

| Taxon | Growth form | Sites (of 151) | % |
|---|---|---|---|
| *Pontederia cordata* | emergent | 22 | 14.6 |
| *Nymphaea odorata* | floating-leaved | 14 | 9.3 |
| *Menyanthes trifoliata* | emergent (fen margin) | 13 | 8.6 |
| *Eriocaulon aquaticum* | isoetid | 11 | 7.3 |
| *Nuphar variegata* | floating-leaved | 9 | 6.0 |
| *Sparganium angustifolium* | floating/emergent | 9 | 6.0 |
| *Equisetum fluviatile* | emergent | 9 | 6.0 |
| *Potamogeton gramineus* | submerged (+ floating leaves) | 8 | 5.3 |
| *Carex lasiocarpa* | emergent sedge (fen) | 8 | 5.3 |
| *Potamogeton alpinus* | submerged (streams) | 7 | 4.6 |
| *Nitella flexilis* | charophyte | 7 | 4.6 |
| *Isoetes echinospora* | isoetid | 7 | 4.6 |
| *Utricularia intermedia*, *U. macrorhiza*; *Brasenia schreberi*; *Nymphoides cordata*; *Sparganium natans*; *Sagittaria latifolia* | various | 6 each | 4.0 |
| *Potamogeton epihydrus*, *P. natans*; *Sagittaria cuneata*; *Utricularia cornuta*; *Fontinalis novae-angliae*; *Scirpus cyperinus* | various | 5 each | 3.3 |
| *Utricularia gibba*; *Eleocharis obtusa*; *Dulichium*; *Hippuris vulgaris* | | 4 each | 2.6 |
| *P. robbinsii*, *P. praelongus*, *P. obtusifolius*; *Myriophyllum alterniflorum*, *M. humile*; *Najas flexilis*; *Sagittaria graminea*; *Chara braunii*; *Isoetes lacustris*; *Podostemum*; *Sparganium emersum*, *S. americanum*; *Lobelia dortmanna*; *Ranunculus flammula*; *Elatine minima*; *Callitriche palustris*; *Zizania palustris*; *Scirpus pedicellatus*, *S. atrocinctus* | | 3 each | 2.0 |
| *P. spirillus*, *P. berchtoldii*, *P. pusillus*, *P. perfoliatus*; *Nitella tenuissima*, *N. mucronata*; *Utricularia radiata*, *U. purpurea*; *Isoetes tuckermanii*; *Littorella uniflora*; *Eleocharis robbinsii*, *E. acicularis*, *E. palustris*; *Alisma* spp.; *Typha angustifolia*; *Sparganium fluctuans*; *Scirpus microcarpus* | | 2 each | 1.3 |
| *P. amplifolius*, *P. zosteriformis*, *P. vaseyi*, *P. foliosus*, ***P. crispus*** (invasive; §5); *Elodea canadensis*; *Vallisneria americana*; *Typha latifolia*; *Nuphar pumila*/*microphylla*; *Myriophyllum verticillatum*; *Utricularia minor*, *U. geminiscapa*; *Schoenoplectus subterminalis*, *S. acutus*, *S. tabernaemontani*; *Chara globularis*; *Isoetes riparia*; *Callitriche hermaphroditica*; *Zizania aquatica*; *Fontinalis antipyretica*, *F. dalecarlica*, *F. sphagnifolia* | | 1 each | 0.7 |

- **No *Myriophyllum heterophyllum* (variable milfoil), *M. spicatum*, *Stuckenia pectinata*, *Cabomba* or *Najas minor*** appears anywhere in this box [API].

**The named analogue lakes** [API, from the regional pull; distance and direction from the lakes]:

| Lake | Distance | Record |
|---|---|---|
| **Baskahegan Lake** (same drainage, ~13 km) | — | **none digitized**; no iNaturalist plant in 45.50–45.62 N × 67.78–67.92 W |
| **Brackett Lake, Crooked Brook Flowage, East Grand Lake, Pleasant Lake** | — | none found |
| **Jackson Brook Lake** | 17 km SE | *Nitella* sp. 2015 (Sleith; [GBIF 1930913061](https://www.gbif.org/occurrence/1930913061)); *Sagittaria graminea* and *Utricularia cornuta* 1950 (CM; [GBIF 2859014232](https://www.gbif.org/occurrence/2859014232), [2859246931](https://www.gbif.org/occurrence/2859246931)) |
| **Brookton millpond** | 17.5 km SE | *Potamogeton berchtoldii*, *Utricularia macrorhiza* 1935 ([GBIF 5070580094](https://www.gbif.org/occurrence/5070580094), [5070688583](https://www.gbif.org/occurrence/5070688583)) |
| **Wytopitlock Lake** | 23.5 km NW | *Nitella flexilis* and *N. tenuissima* 2015 ([GBIF 1931147095](https://www.gbif.org/occurrence/1931147095), [1931115222](https://www.gbif.org/occurrence/1931115222)): the **same pair as Upper Hot Brook** |
| **Molunkus Lake** | 29 km W | *Chara braunii*, *Nitella flexilis* 2015 ([GBIF 1928472173](https://www.gbif.org/occurrence/1928472173), [1928623926](https://www.gbif.org/occurrence/1928623926)) |
| **Mattawamkeag Lake** | 43 km NW | *Chara braunii* "in the thoroughfare" and *Nitella mucronata*, 1897 ([GBIF 4955620885](https://www.gbif.org/occurrence/4955620885), [4955620886](https://www.gbif.org/occurrence/4955620886)); *P. spirillus* 1931 ([GBIF 5067929533](https://www.gbif.org/occurrence/5067929533)) |
| **Upper Mattawamkeag Lake** | 49 km NW | *N. flexilis* 2015 ([GBIF 1928877796](https://www.gbif.org/occurrence/1928877796)) |
| **East Musquash Lake** (Topsfield) | 28 km SE | *Isoetes tuckermanii* "submerged in shallow water; on gravel and between stone" 1964 ([GBIF 5052300928](https://www.gbif.org/occurrence/5052300928)); *N. flexilis* 2015 ([GBIF 1927895633](https://www.gbif.org/occurrence/1927895633)); *Fontinalis sphagnifolia* at the east-branch outlet stream 2011 ([GBIF 1257745150](https://www.gbif.org/occurrence/1257745150)) |
| **Topsfield** (lake unnamed), 1986 | 24 km SE | *Eriocaulon aquaticum*, *Isoetes lacustris*, *Lobelia dortmanna* (VT herbarium; S. R. Hill on two of the sheets; coordinates ±8.8 km) |
| **Lambert Lake**, 1908, Fernald et al. | 31 km E | *Isoetes echinospora* and *I. lacustris* "submersed or emersed at low water, granitic gravel and silt" ([GBIF 3865441774](https://www.gbif.org/occurrence/3865441774)); *Sparganium angustifolium* "margin of lake; granitic gravel and silt"; *S. natans* "in exsiccated shallow basins"; *P. robbinsii* "in the inlet" ([GBIF 2858988544](https://www.gbif.org/occurrence/2858988544)) |
| **Mattawamkeag River deadwater, Drew Plt** (same drainage, downstream of Hot Brook), one observer, 2024-07-03 | 17 km SW | research-grade: *Nymphaea odorata*, *Pontederia cordata*, *Brasenia schreberi*, *Eriocaulon aquaticum*, *Schoenoplectus subterminalis*, *Sagittaria cuneata*, *Persicaria amphibia*, *Calamagrostis stricta*, *Myrica gale*, *Chamaedaphne calyculata*, *Cephalanthus occidentalis*; needs-ID: *Potamogeton oakesianus*, *Zizania aquatica*, *Schoenoplectus acutus*, *Sparganium americanum*, *Carex lasiocarpa* ([iNat box query](https://api.inaturalist.org/v1/observations?nelat=45.565&nelng=-68.105&swlat=45.540&swlng=-68.14&iconic_taxa=Plantae&per_page=100)) |

**New Brunswick border lakes, 18–42 km E–NE** [API; flagged NB; habitat text from the labels]:
- **Spednic Lake protected area, 2006** (NBM):
  - *Littorella uniflora* "in 1–2 m water, sandy bottom" (Bolton Lake) and "shallow water near shore" (Spednic E shore) ([GBIF 4512923796](https://www.gbif.org/occurrence/4512923796), [4512923795](https://www.gbif.org/occurrence/4512923795));
  - *Elatine minima*, shallow and sandy;
  - *Utricularia radiata*, *U. gibba* and *U. geminiscapa*;
  - *Myriophyllum humile* and *Utricularia minor* "1–2 m water, mucky bottom, densely vegetated" (Liddle Lake; [GBIF 4512923769](https://www.gbif.org/occurrence/4512923769)).
- **Second Eel Lake, 1964**: *Eriocaulon* "standing in water", *Pontederia* "at edge of lake", *Nuphar variegata*, *Brasenia* "floating", *P. epihydrus* "floating", *Sagittaria latifolia* "mucky lake shore", *Ranunculus flammula* "muck on shore" ([GBIF 4512839878](https://www.gbif.org/occurrence/4512839878) and neighbours).
- **Eel River Lake**: *Lobelia dortmanna* "in water up to 18 in" ([GBIF 4512866807](https://www.gbif.org/occurrence/4512866807)).
- **First Eel Lake, 2003**: *Brasenia* "shallow bay"; *P. praelongus* in "~2 m water, with other large *Potamogeton* spp." ([GBIF 4512873450](https://www.gbif.org/occurrence/4512873450), [4512875578](https://www.gbif.org/occurrence/4512875578)).
- **Sixth Lake, 2006**: *Brasenia* "in moderately deep water on sandy/muddy and rocky bottom"; *Eleocharis robbinsii* "shallow water on mostly muddy bottom".
- **Third Eel Lake, 2006**: *P. vaseyi*, *Elatine*, *U. gibba* in a "shallow bay – diverse aquatic community".
- **North Lake** (East Grand chain), mouth of Bull Brook, 2006: *P. obtusifolius* "moderately deep water on mostly sandy bottom"; *Utricularia radiata*; *Zizania aquatica*; *Elatine minima*.
- **Fifth Lake, Rum Cove, 1985**: *Nuphar* (*pumila*/*microphylla*), *Pontederia*, *Utricularia intermedia*, *U. macrorhiza* and *U. purpurea*, plus *Fontinalis antipyretica* and *F. novae-angliae* "in shallow water of lake" ([GBIF 1804375795](https://www.gbif.org/occurrence/1804375795)).

**The 2015 charophyte survey across eastern Maine**
- 15–16 and 28–30 July 2015 [API, Sleith query above]:
  - *Nitella flexilis* at Cathance, Meddybemps, Second Machias, Spectacle, Lewy, Pocomoonshine, Pocumcus, Seavey, East Musquash, Molunkus, Wytopitlock, Upper Mattawamkeag, Cold Stream Pond, Saponac, South Branch and Pushaw, among others;
  - *N. tenuissima* at Spectacle, Lewy, Seavey, Plymouth, South Branch, Wytopitlock and **Upper Hot Brook**;
  - *N. microcarpa* at Second Machias and Six Mile;
  - *Chara* only at Duck Lake and Molunkus (*C. braunii*) and at Sebasticook and Plymouth (*C. globularis*, central Maine).
- *Nitella* appears at almost every eastern-Maine lake they visited (inf).

**How often each pondweed occurs across New England**
- [Hellquist 1980, *Rhodora* 82:331](https://archive.org/download/biostor-138628/biostor-138628_djvu.txt) sampled 321 sites [read via fetch]. Alkalinity is in mg HCO₃⁻/L (median and range).
- Hot Brook's ~5–8 mg/L as CaCO₃ is ~6–10 mg HCO₃⁻/L, inside Group I (inf).

| Species | Sites (of 321) | Median alkalinity | Range | Group |
|---|---|---|---|---|
| *P. epihydrus* var. *ramosus* | 154 | 13.4 | 2.4–161.7 | II |
| *P. natans* | 152 | 20.7 | 3.1–161.7 | III |
| *P. pusillus* var. *tenuissimus* | 143 | 19.5 | 3.1–206.3 | III |
| *P. gramineus* var. *gramineus* | 85 | 25.0 | 3.1–150.7 | III |
| *P. spirillus* | 78 | 13.4 | 3.1–70.2 | II |
| *P. amplifolius* | 78 | 28.1 | 4.3–150.7 | III |
| *P. zosteriformis* | 74 | 48.8 | 5.5–150.7 | IV |
| *P. foliosus* | 62 | 73.2 | | V |
| *P. robbinsii* | 49 | 25.6 | 3.7–122 | II |
| *P. perfoliatus* var. *bupleuroides* | 46 | 23.8 | | III |
| *P. praelongus* | 39 | 43.9 | | IV |
| *P. oakesianus* | 33 | 6.1 | 2.4–24.4 | I |
| *P. bicupulatus* | 32 | 5.5 | 1.8–25.6 | I |
| *P. crispus* | 31 | 93.4 | 14.6–207.5 | V |
| *P. alpinus* var. *tenuifolius* | 24 | 23.8 | | III |
| *P. pulcher* | 21 | 10.4 | 3.7–46.4 | I |
| *P. obtusifolius* | 18 | 58.5 | | IV |
| *P. confervoides* | 12 | 4.3 | 0.6–8.5 | I |
| *P. pectinatus* | 26 | 112.9 | 36.6–282.5 | VI |

- The Kennebec and Penobscot drainages (Hot Brook is Penobscot, via Baskahegan Stream and the Mattawamkeag) average **10.9**. Limestone Aroostook (St John) averages 56.4 [read].

**Community types and within-lake frequencies** are already in `invertebrates_plankton_plants.md` §6 (the MNAP/Cameron types; Highland Lake: *P. epihydrus* 81%, *Eriocaulon* 77%, *Nymphoides* 47%, *Brasenia* 31%, *Lobelia* 24%, *Nuphar* 20%, *Nymphaea* 13%, *Isoetes* 13%).

### Inferences

**The inferred Hot Brook plant list, ranked by evidence** (inf). The growth-form codes are those of `macrophytes.md`: EM emergent, FL floating-leaved, SC submerged canopy, IS isoetid rosette, DM deep low meadow.

| Tier | Species | Form | Where in these lakes | Basis |
|---|---|---|---|---|
| **A: recorded** | *Nitella flexilis* (aff.), *N. tenuissima* (aff.) | DM (also shallow) | Upper, S-end launch, ≤ ~1.3 m; probably the mud floors of both lakes to the light limit (~3–4 m) | 2015 specimens |
| **B: near-certain** (the region's commonest soft-water taxa, with habitat present) | *Pontederia cordata* | EM | sheltered organic shore: Upper's S/SW end, the W-side coves, Lower's N end and E shore (the NIR clusters) | 14.6% of regional sites; at Danforth 6 km downstream; Drew Plt |
| | *Nymphaea odorata*, *Nuphar variegata* | FL | the same coves, 0.5–1.8 m on mud | 9.3%, 6%; MNAP water-lily bed |
| | *Brasenia schreberi*, *Potamogeton epihydrus*, *P. natans* | FL | the coves and the outer edge of the lily fringe | regional 3–4%; Hellquist n 152–154; Highland 31–81% |
| | *Sparganium angustifolium* (and/or *S. fluctuans*) | FL/EM | shallow shores and the brook mouths | 6%; Lambert Lake "granitic gravel and silt" |
| | *Eriocaulon aquaticum*, *Isoetes echinospora*, *Lobelia dortmanna*, *Eleocharis acicularis* | IS | the sandy/rocky wave-washed shelf at 0–1 m (Upper's NE sand beach and rocky points; Lower's broad W and NE flats) | 7.3%, 4.6%, 2%; MNAP pipewort–lobelia bed |
| | *Utricularia* spp. (*intermedia*, *macrorhiza*, *purpurea*, *gibba*, *minor*; *U. cornuta* on wet sandy shores) | SC (rootless) | among lilies and on mud in the coves, 0.5–2 m | 6 + 6 + 5 sites |
| | *Schoenoplectus subterminalis* | SC/EM | soft bottoms of 0.5–2 m in the coves | Drew Plt; MNAP |
| | *Equisetum fluviatile*, *Scirpus cyperinus*, *Carex lasiocarpa*, *Menyanthes trifoliata*, *Sagittaria latifolia*/*cuneata* | EM (shore and fen edge) | the wetland edges: Upper S end, Lower N end | 3–9% |
| **C: likely** | *P. spirillus*, *P. robbinsii*, *P. gramineus*, *P. amplifolius*, *P. pusillus*/*berchtoldii*, *P. oakesianus* | SC | 1–3 m mud | Hellquist Groups I–III; regional 1–8 sites |
| | *Myriophyllum humile*, *M. alterniflorum*; *Najas flexilis*; *Elodea canadensis* | SC | | 1–3 sites each |
| | *Sagittaria graminea* (rosette), *Littorella uniflora*, *Elatine minima*, *Isoetes lacustris*/*tuckermanii*, *Ranunculus flammula*, *Eleocharis palustris*/*robbinsii* | IS/EM | sand–gravel shallows | NB lakes, Lambert, Jackson Brook, East Musquash |
| | *Nymphoides cordata* | FL | | 6 sites; Highland 47% |
| | Mosses (*Fontinalis*) | DM / rocks | rocky shallows and brook mouths | Fifth Lake "in shallow water of lake" |
| **D: possible, uncommon** | *Vallisneria americana*, *P. perfoliatus*, *P. praelongus*, *P. obtusifolius*, *Zizania* spp., *Hippuris vulgaris*, *Typha latifolia*, *Chara braunii* | | | 1–3 regional sites; or Group III–IV species in Hellquist |
| **Exclude** | *Stuckenia pectinata*, *P. crispus*, *P. foliosus*, *Chara contraria*, *Zosterella*, *M. heterophyllum*, *M. spicatum* | | | hard-water (Hellquist Groups V–VI; Sleith "not detected" in interior Maine) or invasive, and not recorded within ~50 km except one iNat *P. crispus* (§5) |

**Implications for the sim (inf)**
- The EM and FL forms are real but small, a 0.3–0.6% fringe.
- The isoetid form belongs on the sand and rock shelf.
- The SC and DM forms carry most of the biomass but are unmeasured.
- The single confirmed species list is DM (*Nitella*).

### Gaps
- No quantitative frequency survey (point-intercept or plots) for any lake within 50 km. The regional frequencies above are presence counts biased by effort.
- Lakes of Maine likely holds DEP and LSM plant lists for Baskahegan (MIDAS 1078), East Grand, Pleasant, Mattawamkeag and Molunkus. All are behind the bot wall.
- The NB 2006 protected-area survey report itself (beyond its herbarium sheets) was not found ([UNB herbarium records](https://unbherbarium.lib.unb.ca/node/48266) [snippet]).
- USGS WRI 80-69 (43 Maine lakes, plants by lake) exceeded the 10-MB fetch limit.

---

## 3. What do the NWI wetland classes say about where floating-leaved and emergent beds are?

### Takeaway
NWI maps each lake as one open-water polygon (**L1UBH**: lacustrine limnetic, unconsolidated bottom, permanently flooded). It maps **no lacustrine littoral aquatic bed (L2AB) or emergent (L2EM) polygon**, here or anywhere in a 0.8° × 0.55° box of eastern Maine. That is the mapping convention of this 1980s-era NWI sheet, not evidence that beds are absent.

The shores are lined with:
- needle-leaved evergreen forested swamp (**PFO4E**) and broad-leaved deciduous shrub swamp (**PSS1E**), largest at **Upper's south end** (the inlet complex: PSS1E 56 ac, PFO4E 112 and 125 ac);
- red-maple-type broad-leaved forested swamp (**PFO1E**) on many shore segments.

Only **one 1.6-acre persistent-emergent marsh (PEM1E)** touches either lake, at **Lower's north end**. The connecting brook is mapped as **R2UBH** (riverine lower perennial) and the outlet below Lower as **R3UBH** (upper perennial).

### Cited Findings

**NWI classes** [API]
- **The data:** NWI polygons from the USFWS map service (`Wetlands/MapServer/0`), stored in the project as `tools/hotbrook/data/nwi.geojson` ([service](https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0)). The file holds 392 polygons. The shore-contact analysis is mine (distance from each polygon's vertices to the OSM lake outlines).
- **The lakes:** Upper = one L1UBH of 898.3 ac and Lower = one L1UBH of 681.7 ac.
- **The brook:** the connecting brook is one **R2UBH of 0.4 ac** (≈ 1,600 m², touching both lakes). Below Lower, the outlet is **R3UBH, 3.6 ac**.
- **Polygons touching Upper** (≤ 30 m of the outline):
  - PFO4E 125, 112, 3.4, 2.1 and 1.6 ac (the S end and SW), and 61 ac on the W side (about 45.621 N);
  - PFO1E 45 ac at the SW corner;
  - PSS1E 56.4, 4.8, 1.9 and 0.5 ac (the S end);
  - PSS1/FO1E 9.6 ac and PSS1/4E 6.9 and 2.0 ac;
  - PFO1E 8.5 and 5.1 ac;
  - PFO4/2E 3.9 ac (W side);
  - a small R5UBH stream and an R2UBH inflow (3.4 ac) at the S end.
- **Polygons touching Lower:**
  - PSS1E 13.3 ac (N end), 1.4 and 0.7 ac;
  - PFO1E 8.1, 5.4, 4.5, 2.9, 1.4, 1.0 and 0.8 ac;
  - PFO4E 7.9 and 1.1 ac;
  - and **PEM1E 1.6 ac at 45.659 N, 67.944 W (N end), the only marsh in contact with either lake**.
- **Beaver-made marsh near the lakes** (within 500 m), all "b" (beaver):
  - PEM1Eb 6.5, 1.7, 1.5 and 0.7 ac;
  - PUBHb 0.6 ac (Lower's N end);
  - PUB/FO5Fb 1.9 ac (W of Upper);
  - PSS3Ba 1.2 ac (broad-leaved evergreen shrub, i.e. leatherleaf-type bog, 380 m W of Upper).
- **Class totals in the file:** PFO4E 1,287 ac (102 polygons), PSS1E 314, PFO1E 303, PEM1Eb 46, PEM1E 35, PSS1Eb 32. There is **no PAB (palustrine aquatic bed) polygon anywhere in the file**.

**No L2 aquatic-bed or emergent polygons anywhere in the region** [API]
- An NWI query for `ATTRIBUTE LIKE 'L2%'` over 45.40–45.95 N × 67.60–68.40 W returned 45 polygons ([same service](https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0)).
- **All** are L2RSCh (rocky shore, 32 polygons, 161 ac) or L2USCh (unconsolidated shore, 13 polygons, 75 ac), on Spednic and the East Grand chain's seasonally exposed, impounded shores (45.60–45.68 N, 67.62–67.73 W).
- **Zero L2AB and zero L2EM.**
- NWI's data-source layer gives the source map report for this point as `fredericton-a.pdf` ([NWI historic map report](https://documentst.ecosphere.fws.gov/wetlands/data/HisMapRep/fredericton-a.pdf)). Its garbled OCR cover reads "August 1983" [read, partial].

**What the codes mean**
- **Littoral** extends "from shore to a depth of 6.6 feet" (2 m), and limnetic is deeper.
- **Aquatic bed** is "dominated by plants that grow principally on or below the surface of the water … for most of the growing season in most years".
- **Emergent** is "erect, rooted herbaceous hydrophytes representing more than 30% of the areal cover".
- **Unconsolidated bottom** has "vegetative cover < 30%, and permanently flooded".
- **Lower-perennial** riverine is "water velocity slow … gradient is low"; **upper perennial** is "gradient high, water velocity fast".
- Source: [Illinois DNR Cowardin glossary](https://dnr.illinois.gov/conservation/wetlands/classification-glossary.html) [read].
- **Subclass and modifier codes** ([NWI code list, LIDAR Magazine](https://lidarmag.com/?p=1690)) [read]:
  - FO and SS subclasses: 1 broad-leaved deciduous; 2 needle-leaved deciduous; 3 broad-leaved evergreen; 4 needle-leaved evergreen; 5 dead.
  - EM subclasses: 1 persistent; 2 nonpersistent.
  - AB subclasses: 1 algal; 2 aquatic moss; 3 rooted vascular; 4 floating vascular.
  - Water regimes: B saturated; E seasonally flooded/saturated; F semipermanently flooded; H permanently flooded.
  - Modifiers: b beaver; h diked/impounded.
  - Riverine subsystems: 2 lower perennial; 3 upper perennial; 5 unknown perennial.

### Inferences
- **Why there are no L2 polygons** (inf). On 1980s small-scale photography, NWI folded littoral beds into the open-water polygon here, as it did across the whole region. The 0–2 m littoral zone exists: on the model bed, 24% of Upper and 22% of Lower lie ≤ 2 m (`macrophytes.md` §2.4). So NWI tells us **nothing about submerged beds**.
- **NWI does say where the sheltered, organic, wetland-backed shores are.** These are where MNAP's water-lily and pickerelweed beds and the emergent fringe belong:
  - **Upper's south end** (the inlet's 56-ac shrub swamp and 237 ac of conifer swamp);
  - **Upper's SW and W shore** (PFO4/2E, PSS1/4E);
  - **Lower's north end** (PSS1E 13 ac, the 1.6-ac PEM1E marsh and nearby beaver marshes);
  - patches on Lower's E and W shores.
- **NWI and NAIP agree.** These are exactly the shores where the NAIP near-infrared fringe clusters (§1), so the two independent sources agree on where FL and EM plants sit.
- **Shrub and forest species are not in NWI** (inf; not mapped or sourced here). The shore shrubs implied by PSS1 would be alder, sweet gale (recorded at Danforth), meadowsweet and willows (*Salix petiolaris* "Swamp", Danforth 1938). The PFO4 swamps imply spruce, fir, tamarack and cedar.
- **The brook is mapped as slow water.** R2 (lower perennial: "water velocity slow … gradient low") fits a 0.70-m fall from Upper (128.93 m) to Lower (128.23 m) along the brook (lidar levels in `HOT_BROOK_3D.md`). So the connecting brook is a gentle lake-to-lake run with riffles, not a torrent (inf).

### Gaps
- The photo year and scale behind this NWI sheet (the map report's text was unreadable), and whether a newer NWI update covers Washington Co.
- NWI subclass detail beyond the codes: the species in each polygon are not part of NWI.

---

## 4. What plants grow in the brook?

### Takeaway
No plant record exists for the connecting brook. By analogy with rocky streams within ~50 km and Maine statewide records, expect:
- **water mosses (*Fontinalis* spp.) on the riffle stones**: very likely, the brook's main plant;
- in the 1–1.2-m pools: **floating-leaved pondweeds and bur-reeds** (*P. epihydrus*, *Sparganium angustifolium*/*fluctuans*), with **yellow pond-lily** at the pool edges;
- on the margins: **water starwort (*Callitriche*)**;
- along the banks: **pickerelweed, bur-reed, water horsetail and sedges**, under **alder and sweet gale**.

**Riverweed (*Podostemum*)** is unlikely to possible:
- it is a fast-water plant of larger Maine rivers, with only two Washington County records (the Machias River);
- Maine lists it as rare or special concern;
- the brook's gentle 0.7-m fall makes the needed current marginal.

### Cited Findings

**Stream and lake-outlet records within ~50 km** [API; regional pull, §2]:
- ***Fontinalis novae-angliae*** "on rocks along stream", Mattagodus Stream at Rt 170, Webster Plt, 2002, 21 km SW ([GBIF 2028239051](https://www.gbif.org/occurrence/2028239051); also MO, US). The same site had *Dichelyma pallescens* "on bark of tree trunks, shrubs, and twigs in flood plain".
- ***Fontinalis dalecarlica*** "In brook", Carroll Plt, 1937 ([GBIF 1929386987](https://www.gbif.org/occurrence/1929386987)).
- ***Fontinalis sphagnifolia***, East Musquash Lake at its east-branch stream, Topsfield, 2011 ([GBIF 1257745150](https://www.gbif.org/occurrence/1257745150)): a **lake–stream junction**.
- ***Fontinalis novae-angliae***: Diggity Stream and the St. Croix River, NB, 1985 ([GBIF 1804400186](https://www.gbif.org/occurrence/1804400186), [1804527269](https://www.gbif.org/occurrence/1804527269)).
- ***Potamogeton alpinus***, Mattagodus Stream, Prentiss, 1937: "Cold clear stream, bottom of muddy gravel" (several sheets, e.g. CONN 00032007, [GBIF 4955551800](https://www.gbif.org/occurrence/4955551800)); 19–22 km SW.
- ***Potamogeton gramineus*** "rocky, shallow rapids", Eel River NB 2003 ([GBIF 4512873438](https://www.gbif.org/occurrence/4512873438)).
- ***Myriophyllum alterniflorum*** "0.5–1.5 m water in fast flowing river with rocky bottom", St. Croix River NB 2005 ([GBIF 4512891667](https://www.gbif.org/occurrence/4512891667)).
- ***Podostemum ceratophyllum*** "Bouldery rapids" and "Small, shallow, rocky rapids", Eel River NB 2003, 47 km NE ([GBIF 4512867300](https://www.gbif.org/occurrence/4512867300), [4512875624](https://www.gbif.org/occurrence/4512875624)).
- ***Callitriche palustris***: St. Croix River and Diggity Stream NB 1984–85 ([GBIF 1804588976](https://www.gbif.org/occurrence/1804588976), [1804609525](https://www.gbif.org/occurrence/1804609525)).
- ***Sparganium natans*** "ditch in flowing water", Crystal 1971 (UNH).
- Diggity Stream NB, 1985 (one site), recorded:
  - *Eriocaulon*, *Isoetes tuckermanii* and *I. riparia*;
  - *Myriophyllum humile*;
  - *Nymphaea odorata* and *Nymphoides cordata*;
  - *Sparganium angustifolium* and *S. emersum*;
  - *Utricularia macrorhiza* and *U. purpurea*;
  - *Alisma plantago-aquatica*; *Equisetum fluviatile* "in marshy edge of stream"; *Eleocharis* spp.; *Schoenoplectus acutus*; *Dulichium*;
  - and *Callitriche palustris*.
  - This is a slow stream's full lentic flora.

**Maine statewide** (GBIF, stateProvince = Maine) [API]:
- ***Podostemum***: 132 records, overwhelmingly Penobscot, Kennebec, Lincoln and York rivers. Labels read "abundant, attached to rocks in river current", "carpeting the rocks in the river current" and "in crevices of submersed rocks". **Washington County has 2 records** (the Machias River below Route 1) ([GBIF query, taxonKey 2418](https://api.gbif.org/v1/occurrence/search?taxonKey=2418&stateProvince=Maine&limit=300)).
- ***Fontinalis*** (Fontinalaceae): 1,176 records statewide, including Washington Co. for *F. antipyretica*, *F. dalecarlica*, *F. sphagnifolia* and *F. sullivantii*. Labels read "on rocks in small, fast flowing stream", "submerged on rocks and sand in fast moving stream", "on rock in shallow, fast moving stream", and "Abundant on emerging and submerged rocks" (Tunk Stream, Hancock Co.) ([GBIF query, Fontinalaceae](https://api.gbif.org/v1/occurrence/search?taxonKey=8756&stateProvince=Maine&limit=300)).
- ***Callitriche***: 206 records statewide; *C. palustris* has 14 in Washington Co. and 22 in Aroostook. Labels read "flowing brook", "shallow, muddy brook", "stranded on river edge" and "sandy shore" ([GBIF query, taxonKey 3039547](https://api.gbif.org/v1/occurrence/search?taxonKey=3039547&stateProvince=Maine&limit=300)).

**Riverweed's needs**
- *Podostemum* "grows attached to stable substrates in high water-velocity riverine habitats" ([Wood et al. 2019, USGS](https://www.usgs.gov/publications/water-velocity-regulates-macro-consumer-herbivory-benthic-macrophyte-podostemum)) [read abstract]:
  - biomass was sampled at **~0.1–1.4 m/s**, with "a positive relation (R² = 0.58) between *Podostemum* biomass and water velocity";
  - plants lost stem length in slow water unless grazers were excluded.
- "Seven states (CT, KY, **ME**, NY, OH, PA, RI) list *Podostemum* as threatened, endangered, historical, or a species of special concern" ([Wood et al., *Proc. WV Acad. Sci.*](https://pwvas.org/index.php/pwvas/article/view/443)) [read abstract].
- An older study found it most abundant at 3.5–4.1 ft/s (~1.1–1.25 m/s) and absent below 2.8 ft/s [snippet, source not identified]. That is only a lead.

**The brook itself (project sources)**
- About 150 m of brook at roughly 8 m wide, with 1–1.2 m pools and 0.3 m riffles (brief); NWI R2UBH 0.4 ac (§3).
- The fall is **0.70 m** between the lakes (2017 lidar water levels, `HOT_BROOK_3D.md`).
- The user's angler notes place pumpkinseed and redbreast in "the deeper pool where the brook leaves Upper" and in its "shallow stretch" (`tools/hotbrook/field_notes.json`).

### Inferences

**The brook's likely flora by habitat** (all inf; no record):

| Habitat | Plants | Likelihood |
|---|---|---|
| **Riffle and run stones** (0.3 m, current) | *Fontinalis* (*novae-angliae*, *dalecarlica* or *antipyretica*) streaming from the rock tops; filamentous algae and periphyton; *Dichelyma* on flood-washed alder stems | *Fontinalis* very likely; the most-recorded aquatic plant of small rocky Maine streams |
| | *Podostemum* | unlikely–possible (below) |
| **Pools** (1–1.2 m, slow, warm lake water) | *P. epihydrus* (the commonest New England pondweed, typical of slow soft streams; Hellquist n 154); floating *Sparganium angustifolium*/*fluctuans*; *Nuphar variegata* on silted pool margins; *Utricularia macrorhiza*; *Nitella* on silt | likely |
| | *P. alpinus* | its regional records are "cold clear streams", and this brook carries warm lake-surface water, so possible only |
| **Margins and gravel bars** | *Callitriche palustris*/*heterophylla*; *Eleocharis* spp.; *Ranunculus flammula*; *Sagittaria latifolia*/*cuneata* | likely |
| **Banks** | *Pontederia*; *Sparganium americanum*; *Equisetum fluviatile*; *Carex* (e.g. *C. lasiocarpa*, *C. utriculata*); *Calamagrostis canadensis*; *Scirpus cyperinus* | likely |
| **Bank shrubs** | alder; *Myrica gale* (Danforth 2025); *Spiraea alba*; *Salix* | likely |

**Riverweed is marginal** (inf).
- A 0.70-m fall over ~150–200 m is a slope of ~0.35–0.5%.
- At 0.15–0.3 m depth with Manning's n ≈ 0.04, riffle velocity is roughly **0.4–0.8 m/s** (Manning arithmetic).
- That is inside *Podostemum*'s sampled range but below where it is most abundant.
- With only two Washington County records statewide and its rare-plant listing in Maine, the census should leave *Podostemum* **out** unless someone sees it ("olive-green, stiff, moss-like turf welded to rocks in the current").

**Why a lake outlet suits mosses** (inf; general reasoning, not a sourced study).
- The lake buffers floods and freezes, so flow is steadier.
- Lake-made organic particles and plankton feed filterers.
- Water is warm in summer (Upper's surface, ~24 °C peak).
- Steady flow suits *Fontinalis*, and the warmth works against cold-stream pondweeds such as *P. alpinus*.

### Gaps
- No plant record for the connecting brook or the Hot Brook outlet. The user, who fishes the brook pools, is the best source for whether there are moss carpets, lily pads in the pools, or bur-reed ribbons.
- No measured velocity or discharge for the brook.
- No Maine-specific study of lake-outlet stream vegetation was found. The lake-outlet literature that turned up concerns invertebrates.
- Maine's exact rarity rank for *Podostemum* was not read (MNAP pages 403).

---

## 5. What is the invasive-plant status of these lakes?

### Takeaway
No invasive aquatic plant is recorded for either Hot Brook lake:
- Lakes of Maine lists "none known" [snippet];
- GBIF and iNaturalist hold no variable or Eurasian milfoil, curly-leaf pondweed, fanwort or hydrilla within ~40 km.

**The nearest confirmed infestation is variable water-milfoil in Big Lake (Princeton / Grand Lake Stream).**
- It was confirmed in 2019 and spread to connected waters.
- UMaine called it the first known infestation east of Augusta.
- It lies ~54 km S, in a different drainage (the St. Croix, not the Penobscot).

**Two nearer non-native records need flagging:**
- an unverified iNaturalist research-grade **curly-leaf pondweed** in Lee (40 km SW, 2022), absent from published Maine site lists;
- a USGS-NAS **narrow-leaved cattail** on Baskahegan Stream at Danforth (6 km downstream, 2011).

Hot Brook's soft water (~6–10 mg HCO₃⁻/L) is below the recorded range of curly-leaf pondweed (14.6–207.5).

### Cited Findings

**Hot Brook itself**
- The Lakes of Maine entry for Lower lists invasive aquatic plants as "None known" ([lakesofmaine.org m=1072](https://lakesofmaine.org/lake-lake-life.html?m=1072)) [snippet; page not opened]. The same was noted for both lakes in `macrophytes.md` [snippet].

**Big Lake (variable water-milfoil)**
- "Highly invasive milfoil", "variable milfoil", was discovered in Big Lake in 2019. It was then found "soon afterwards in other water bodies connected to Big Lake" ([Lake Stewards of Maine, "The Battle for Big Lake"](https://www.lakestewardsofmaine.org/the-battle-for-big-lake/)) [read].
- UMaine Extension, 9 Oct 2020: invasive milfoil in "Princeton's Big Lake", "the first known infestation east of Augusta" ([UMaine Cooperative Extension](https://extension.umaine.edu/invasivespecies/?p=1752)) [read].
- Camp owners' testimony to the Maine Legislature (31 Jan 2024, on LD 2141): "About six years ago, invasive Milfoil was discovered in our lake" (Big Lake, "eastern Washington County"). Removal is funded by a DEP grant ([testimony PDF](https://legislature.maine.gov/testimony/resources/IFW20240131Palmer133509684840550117.pdf)) [read].
- A search summary dates the confirmation to 2019 for *Myriophyllum heterophyllum* [snippet]. That fits the 2019 date in the Lake Stewards and Lakes of Maine pages.

**Curly-leaf pondweed**
- **The Lee record:** *Potamogeton crispus*, research grade, Lee, Maine, 2022-07-29. Three identifications say *P. crispus*; one *P. epihydrus* identification was withdrawn ([iNat 128642193](https://www.inaturalist.org/observations/128642193); [GBIF 3902367759](https://www.gbif.org/occurrence/3902367759)) [API]. It is 39.6 km WSW of the lakes.
- **Published Maine sites:** testimony in 2023 lists the state's known curly-leaf sites as Legion Pond (Kittery), West Pond (Parsonsfield), the Kennebec River, East Pond, Old Mill Stream and North Pond ([2023 testimony](https://legislature.maine.gov/testimony/resources/IFW20230213Cornwall133205268660583527.pdf)) [snippet]. **Lee is not among them.**
- **Chemistry:** *P. crispus* median alkalinity is 93.4 (14.6–207.5) mg HCO₃⁻/L; *P. pectinatus* (sago) median is 112.9 (36.6–282.5) ([Hellquist 1980](https://archive.org/download/biostor-138628/biostor-138628_djvu.txt)) [read].

**Other GBIF checks**
- **Narrow-leaved cattail:** *Typha angustifolia*, Baskahegan Stream, Danforth, 2011-07-01, from the USGS Nonindigenous Aquatic Species program ([GBIF 1897207151](https://www.gbif.org/occurrence/1897207151)) [API].
- **No milfoil:** the regional GBIF pull (45.30–46.05 N × 67.40–68.45 W; Haloragaceae included) holds only the native milfoils *Myriophyllum alterniflorum*, *M. humile* and *M. verticillatum*. There is no *M. heterophyllum* or *M. spicatum* [API].

**The state map**
- Maine DEP's infested-waters map ("Invasive Aquatic Plants In Maine Waters, January 2026") and program page both returned **403** ([map PDF](https://www.maine.gov/dep/water/invasives/Maine_IAP_Map_2026.pdf); [program page](https://www.maine.gov/dep/water/invasives/index.html)).
- A search summary of the map shows only southern and central Maine names in the visible excerpt [snippet].

### Inferences (inf)
- **Status for the sim: no invasive aquatic plant.** That is "what is actually there" as far as any record shows. Hot Brook has no recorded volunteer Invasive Plant Patrol survey that I could find, so "none known" also means "little looked".
- **Variable milfoil is the realistic threat.**
  - It is the invasive established nearest Hot Brook (Big Lake).
  - New England infestations are in soft-water lakes like Hot Brook (general knowledge; not sourced here).
  - The lakes are headwaters, so arrival would be by boat or trailer at the south-end launch, not from upstream.
- **Curly-leaf pondweed and sago** are hard-water plants. At ~6–10 mg HCO₃⁻/L, Hot Brook is below the lowest alkalinity Hellquist recorded for curly-leaf (14.6), so establishment is unlikely even if introduced.
- **The Lee iNaturalist record** should be treated as unconfirmed until DEP lists it. Curly-leaf and *P. epihydrus*/*P. perfoliatus* can be confused, and one identifier first called it *P. epihydrus*.
- **The narrow-leaved cattail** downstream at Danforth is a lowland and road-ditch plant. Hot Brook's shores are forest and shrub swamp with one small marsh, so cattail of either species is at most a minor cove plant there.

### Gaps
- DEP's current infested-waters list and map (403).
- Whether either lake has ever had a Lake Stewards IPP or DEP screening survey: the monitoring pages are on Lakes of Maine, behind the bot wall.
- Whether the Lee curly-leaf record is a verified DEP infestation or a misidentification. The waterbody is not named in the record.
- The *Typha angustifolia* NAS record's status: whether it is treated as introduced or as cryptogenic in Maine, and its exact place.

## 6. The human's photos (sent 2026-10-17)

### Takeaway
Twelve photos from the lakes and the brook, May 2024 – July 2026, with no GPS. They confirm several of the sim's species at the level of their growth form, and show two things the records don't: a bare cobble shore and the brook in a dry year. Nothing in them rules a species out. Lilies and rosettes are simply not in frame, and a few photos can't show absence.

### Findings (my identifications, by eye; [photo date])
- **Emergent bulrush [7 Jul 2026].** Stands of slender, round, green stems, with small brownish spikelet clusters just below the tips. They grow in shallow water in front of a shore fringe of grass and sedge, around a boulder.
  - The habit fits *Schoenoplectus*: soft-stem or hardstem bulrush, the sim's emergent "bulrush". A rush (*Juncus*) can't be ruled out at this resolution.
  - A **common merganser** brood (female and large ducklings) sat on the boulder among them. They eat fish: add them to the shore predators.
- **Submerged ribbon leaves in the brook [26 May 2024; 9 Jul 2025].** Long golden-olive strap leaves stream in the current over orange-brown sand in the slow brook and at its mouth. A chain pickerel was caught wading over them in July 2025.
  - These fit **ribbon-leaf pondweed** (*P. epihydrus*, whose submerged leaves are ribbons) or **bur-reed** (*Sparganium*, also ribbon-leaved in flowing water). Tape grass (*Vallisneria*) is also possible.
  - The sim's ribbon-leaf pondweed is allowed in the brook.
- **Fine-leaved submerged shoots [26 May 2024].** Branched stems with many short, narrow leaves, pale olive, among the ribbons.
  - These fit **bladderwort** or **milfoil** (*Myriophyllum*: the natives *M. tenellum*, *M. humile*). I can't tell which from the photo.
  - If bladderwort, it is growing in the brook's slow run, where the sim keeps bladderworts out (noBrook). That is left as is until a closer photo.
- **A dark leafy tuft on a stone in the cobble riffle at a brook mouth [8 Jul 2025].** This fits **water moss** (*Fontinalis*: the sim's brook moss), or a lodged clump of drift.
- **The camp dock shore [24 Aug 2024].** Clear golden water over cobble and gravel, with **no rooted plants out to ~0.6 m**. Northern white cedar and boulders on the bank.
  - The sim's wave-washed sand and gravel (second summer, no fish, seed 541): bare at 0–0.3 m (wave and ice scour); a thin ~18 g DW/m² of pondweed, bladderwort and rosettes at 0.3–0.6 m; denser below.
  - That is consistent enough. One shore doesn't justify a separate cobble bed class.
- **The dry year [24 Aug 2025].** The brook was nearly dry: a cobble bed with one thin channel, sensitive fern (*Onoclea sensibilis*) and grasses on the bars, and alder and birch over it. The same day, a lake shore showed a band of exposed stones grown with grass.
  - These are the human's "dry year" (memory: the brook "almost out of the water altogether").
  - They are evidence for the water-level work: stage varying by year, a dry-year brook that nearly cuts the lakes apart.
- **Along the banks:** shrub thickets at the waterline (sweet gale, *Myrica gale*, and alder), ferns, white pine, birch, cedar, spruce and fir. These agree with the landscape view's alder and shrub edge.

### Gaps
- No photo shows the coves where the aerial photos put the lilies, or the deeper beds.
- Which brook mouth the riffle photos show: Upper's outlet, or the brook entering Lower.
