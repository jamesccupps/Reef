# Birds, mammals, human use and iNaturalist at the Hot Brook lakes, 2026-10-21

A research sub-search's report, recorded by the coordinator (the sub-search wrote no file). It extends `hot_brook_lake_records.md`; see also
`full_biota_and_processes.md` and `herps_odonata_insects_evidence.md`.

## Method and limits

- **Search budget:** WebSearch's shared 200-call limit ran out early. After that, direct fetches and public data APIs: GBIF (the eBird and
  Maine Bird Atlas records), iNaturalist, the MDIFW/MaineDOT/USFWS ArcGIS services and OSM Overpass.
- **Blocked and not bypassed:** eBird (bot check), maine.gov (403), Wiley.
- **Other failures:** the Alces moose paper returned 404, and the legislature PDFs were unreadable.
- **"Regional"** = 45.50–45.80 N, 68.10–67.75 W (Danforth, Weston, Bancroft, Orient, Brookton, Crooked Brook Flowage, Baskahegan Lake, the
  Mattawamkeag, part of East Grand). Record counts measure effort, not abundance.
- **Atlas coverage at the lakes is thin.**
  - Only block Stetson Mtn_NW (the west half of Upper) had real summer effort.
  - Winter effort in all four lake blocks was 0–0.03 h.
  - **"Not recorded" = no data, not absence.**
  - The full species-by-block table (a 27-MB .dbf, https://digitalmaine.com/maine_bird_atlas_visualization_shapefiles/1) was not
    downloaded. It needs the human's go-ahead.
- **Auto-saved PDFs:** two (legislature moose reports) in the session tool-results folder, outside the repo.

## Corrections to what the repo assumed

- **The connecting brook is SHORT:** MDIFW calls it a "short (1/8 mile) non-navigable connecting stream", ≈ 150–200 m. **Check the 3-D
  geometry's brook length against this.**
- **The fishing zone is South** (all bass released, 25 white perch a day, artificial lures only Oct 1 – Dec 31). Already in the repo.
- **Wildlife Management District 11** (not 18 or 19).

## New site facts

1. **A bald eagle nest on Upper Hot Brook Lake.**
   - MDIFW nest 476A, in an eastern white pine on Kittery Island (45.611 N, 67.942 W; ~4 ha, the lake's one island).
   - Pair in 2008; 1 fledgling in 2013; eagles at the nest 2018-07-20; Maine Bird Atlas 2018–22: **confirmed breeding** in block Stetson
     Mtn_NW.
   - Neighbouring territories within ~20 km:
     - Crooked Brook Flowage, Danforth (085A–H, ~6 km E): pairs since 1962;
     - Baskahegan Lake (729A);
     - East Grand Lake, Five Islands (137A–D);
     - Mattawamkeag River, Haynesville (384A): 1–2 fledglings in 2003–2018.
   - Layers: ConservationLands_EagleNests, EagleNestDistribution_5yearIntervals, BirdAtlas_BAEA_BlockCodes (services1.arcgis.com/
     RbMX0mRVOFNTdLzd).
2. **Beaver mapped at the lakes** (USFWS NWI, the "b" beaver-modified code).
   - In a ~135 km² box: 119 polygons, 223 ha, 15 beaver ponds (26 acres).
   - Around the lakes: 35 polygons. A cluster on Lower's NE and outlet side (45.647–45.667 N, ~67.92 W): an 11-acre emergent wetland, a
     0.7-acre beaver pond, 6.7- and 21.8-acre forested wetlands.
   - More on the tributaries west of Upper.
   - Photo-interpreted only; no dated sighting.
3. **Black tern (Maine Endangered) habitat ~5 km east,** at Crooked Brook Flowage (MaineDIFW_ETSC_Summarized). The same layer holds brook
   floater polygons and Upper's yellow lampmussel polygon.
4. **Crossings:**
   - Route 169 crosses Hot Brook ABOVE Upper (MaineDOT bridge "HOT BROOK", 17.6 ft, 1979, 45.5821 N, 67.9448 W).
   - **No road crosses the connecting brook or Lower's outlet.**
   - The Eastern Maine Railway bridge is ~2.2 km below Lower's outlet (45.6785 N, 67.932 W).
   - 29 MaineDOT cross-culverts (12–48 in) along Route 169 by Upper's S and E shore, plus a 60-in concrete culvert at Upper's SE corner
     (45.603 N, 67.923 W): road-runoff and tributary inputs.
   - **No dam** of any kind mapped or recorded; any outlet control is beaver-made [inf].
5. **Lower is no longer camp-free.** OSM shows private roads on its east shore (Boat Landing Rd, Woodland Ridge Rd, Lakeview Rd, Black Point
   Rd), and lots are for sale. Upper's camp roads: Haney N/S, Toupin Mountain, Robbs, Lower Lake, Hot Brook Lake Rd, Lydic Ln, Huff Rd. No
   official camp count; 17 OSM buildings in Upper's box is a floor.

## Birds

### Waterbirds

- **Common loon:**
  - 2 loons on 2022-05-27 at the "Glenwood" atlas point (45.6436 N, 67.9545 W), very likely on Lower; 47 regional records.
  - No per-lake count online. The Maine Audubon count covers only south of 45 N (2025: 3,174 adults, 568 chicks).
- **Common merganser:**
  - **The human's brood photo (July 2026) confirms it at the lake.**
  - Regional: 12 on the Mattawamkeag 2021-07-27 (brood-sized); Grand Lake; Crooked Brook Flowage in April.
  - From ice-out to freeze-up; winters at open riffles.
- **Hooded merganser:** 9 regional records, July broods at Crooked Brook Flowage and the Mattawamkeag.
- **Dabbling ducks and geese:**
  - black duck (29 regional records; one obscured iNaturalist record beside Upper);
  - mallard 18; Canada goose 46 (a grazer and nutrient source);
  - wood duck 12 (11 at Crooked Brook Flowage in July 2022; a cavity nester in beaver wetlands);
  - ring-necked duck 9 (mostly migration, April and Oct–Nov).
- **Common goldeneye:**
  - Breeding-season dates (Haynesville June 2021; Little River Cove, Danforth, July 2021), so local nesting is plausible.
  - A diver on benthic invertebrates; it competes with young fish.
- **Double-crested cormorant:** confirmed inland (Crooked Brook Flowage May 2022; Danforth April 2007; flocks of 6–27 on Grand Lake in
  September). Likely a transient at Hot Brook.
- **Great blue heron:** 8 regional records; the atlas has "NA" in all six lake blocks; no heronry data public.
- **American bittern:** 12 regional records (Oskar's Swamp, Brookton). Likely in the emergent fringes.
- **Rails:** none recorded in the region (unconfirmed, not absent).
- **Belted kingfisher:** 33 regional records. Likely at the lakes and the brook.
- **Osprey:** 10 regional records; no nest mapped at Hot Brook (a 1980 nest on Sucker Lake island, East Grand).
- **Spotted sandpiper:** 17 regional records. Likely on the rocky shores (insects at the waterline).
- **Gulls and terns:** ring-billed and herring gulls (11 records each), common tern 7 (probably East Grand). Transients.
- **American woodcock:** a USFWS singing-ground route runs along Route 169 beside Upper (1–3 birds a stop). A riparian bird, not aquatic.

### Aerial insectivores (the daytime sink for emerging insects)

- Regional record counts:
  - cedar waxwing 98, eastern phoebe 65, alder flycatcher 59, tree swallow 48;
  - red-winged blackbird 44, swamp sparrow 41, least flycatcher 32, eastern kingbird 24;
  - barn swallow 22, olive-sided flycatcher 16, chimney swift 12, common nighthawk 8 (+ Danforth 2024);
  - bank and rough-winged swallow 3 each, cliff swallow 1.
- Swallows, swifts and nighthawks hunt over open water; kingbirds, phoebes and waxwings sally from the shore.
- Tree-swallow nestlings eat mostly Diptera, Hemiptera and Odonata, and aquatic insects supply omega-3s (Twining & Lawrence 2018).
- Breeding tree swallows forage within ~4 km, and nestling food comes from within ~200 m.
- Season: May–August; swallows leave by August–September.

### Winter

Eagles and the odd merganser or goldeneye at open riffles [inf] (an eagle on the Mattawamkeag at Haynesville, 2019-12-28).

## Mammals

- **Moose:**
  - iNaturalist record ~2 km E of Lower (2020-11-01).
  - Harvest by town: Danforth 9 a year in 2009–10, 0–1 a year in 2019–25; Bancroft 12, then 0–2 (permit-driven, not density).
  - Maine's aerial surveys: 0.4–4.0 moose/km² across nine northern WMDs (Kantar & Cumberland 2013, *Alces*; WMD 11's own figure not
    found).
  - In summer they feed on lilies and pondweeds for sodium, and can dive > 5.5 m; season June–August in shallow, lily-rich bays.
  - "Up to half the diet" (Wikipedia) is unverified.
- **White-tailed deer:** an MDIFW deer wintering area east of Upper (repo). They browse the shore and winter in conifer cover.
- **Black bear: COMMON.**
  - iNaturalist record ~2 km E of Lower (2020-06-24).
  - Harvest 2019–2025: Danforth 5, 12, 14, 9, 13, 13, 9; T8 R4 NBPP 7, 6, 9, 7, 8, 7, 2; Bancroft 3, 5, 15, 9, 0, 6, 3.
  - No record of bears fishing the brook's sucker run (plausible, unconfirmed).
- **Other land mammals:** fisher (~2 km E of Lower, 2021); red fox; coyote likely; porcupine, snowshoe hare, red squirrel.
- **River otter, mink, muskrat, raccoon:** no site or regional records found; likely but unconfirmed.
- **Water shrew (8–18 g):** a Vanceboro specimen (2017, ~35 km E). It dives for aquatic invertebrates and small fish along streams. Likely
  on the brook.
- **Star-nosed mole:** Penobscot County records. It forages on pond and stream bottoms (caddis, midges, leeches, small fish) and stays active
  under ice. Likely.
- **Bats** (BDN 2023 quoting MDIFW; Maine Audubon 2015):
  - Regulars: little brown, big brown, hoary, silver-haired, eastern red.
  - Rare: northern long-eared, tricolored. Absent: small-footed.
  - White-nose syndrome since 2011 (~95 % drop; little brown recovering slowly).
  - Little brown bats forage along water edges, 1.5–3 h after dusk plus a pre-dawn bout. Nightly intake: 5.5 g pregnant (61 % of body
    mass), 6.7 g lactating (85 %), ~9.9 g at peak lactation (Kurta et al. 1989). Prey: caddis, mayflies, Diptera.
  - **The night-time sink for emerging insects,** May–September.

## People

- Rules and the town landing (Route 169, Upper's south end) are already in the repo.
- New: the crossings, the culverts and Lower's private roads (above).

## iNaturalist in the lakes' box (45.595–45.672 N, 67.975–67.895 W)

50 observations, 42 taxa, most from one observer ~2 km E of Lower.

- **At the lakes:** a Cecropia moth at Upper (2024); a garter snake by Lower's east shore (2023); a northern two-lined salamander W of Upper
  (2017).
- **Nearby:** an eastern newt; **a dark fishing spider *Dolomedes tenebrosus*** (2026); a red-bellied snake; moose, fisher and bear.
- **Regional herps:** leopard frog 9, green frog 6, bullfrog 5, wood frog 5, newt 5, toad 3, blue-spotted salamander 3, pickerel frog 2,
  spotted salamander 2, mink frog 1, gray treefrog 1, peeper 1. Snapping turtle 2, smooth greensnake 2. **No painted-turtle records in the
  region** (records-wise).
- **Regional fish:** smallmouth bass and fallfish (Mattawamkeag); brook trout (Danforth 2008).

## Still open

- WMD 11 moose density.
- Heronries; loon pairs and chicks.
- Otter, mink and muskrat records; rails; goldeneye nesting.
- A quantitative bat diet; camp counts.
- The atlas .dbf.
- Bear, deer and moose at the water: done, see the next section. Still open there: WMD 11 moose and deer densities; any number for bears
  eating suckers; carcasses lost through the ice.

## Bears, deer and moose at the water

Added 2026-10-21 by the same sub-search, once the search budget reset.

**Tags:**
- (inf) = my inference from the cited numbers;
- (gk) = general knowledge, not fetched this session;
- "via search" = read from a search-engine summary of the source, not from the page itself.

**Fetching:**
- Blocked and not bypassed: MDPI, Springer (a login redirect), maine.gov (403) and the Alces PDF links (404).
- The three Isle Royale PDFs were read with `pdftotext` from WebFetch's automatic copies in the session tool-results folder. Nothing was
  saved into the repository.

### Moose

**Aquatic intake.** The only direct measurement is Belovsky & Jordan 1978, on Isle Royale, in the "Yellow Birch" study area.
- **Intake:**
  - An adult moose ate **868 g dry of aquatic plants a day**, out of 4,898 g dry in total. That is **17.7 % of dry intake** (leaves 74.7 %,
    herbs 7.6 %).
  - Aquatic plants are 95 % water (range 81–99 %), against 75 % for leaves. So the 868 g dry is **17.4 kg wet a day**, out of **33.6 kg
    wet** in total: about **half the wet intake**. That explains popular "half the diet" claims (inf).
  - In the coastal study area, whose pond was mostly the alga *Spirogyra*, aquatic intake was only 161 g dry a day (3.4 %).
  - Belovsky 1981 reuses these values: 868 g dry a day, a bulk of 20 g wet per g dry, a summer rumen throughput of 32.9 kg wet a day,
    94 % digestibility and 17.2 kJ/g dry. It also concludes that moose ate aquatics for **sodium** and leaves for energy.
- **Share of the diet:** "up to 18 %" (Belovsky & Jordan). Hoof stable isotopes give **13–27 % of the summer diet** from aquatic sources
  (Tischler et al. 2019).
  - Aquatic macrophytes have more crude protein and a lower C:N ratio than the land plants moose prefer (Tischler et al. 2022). So they
    are N-rich food, not just salt.
- **Season:**
  - Isle Royale: **108 days of aquatic feeding** in a 124-day summer (June 1 to early October). Aquatic feeding peaks in midsummer and
    drops off late in summer.
  - Aquatic feeding fell off in late July or early August where plants stayed plentiful, but went on into September where grazing had
    thinned them (Jordan et al. 1973, via search).
  - At Hot Brook (ice-out ~Apr 23, weed beds growing from May) expect **June to mid-September**, peaking in July (inf).
- **When in the day:** moose are mostly nocturnal in summer, but there is a separate **late-afternoon aquatic-feeding peak**. Cows fed in
  water 1.65–1.93 times as often as bulls.
- **Dives:** a moose stays under for **16.2 ± 8.1 s** per dive, crops 20.3 ± 3.1 g dry a minute under water, and fills a 416-cm³ mouth.
  Once at a chosen site it is unselective.
- **Plants eaten:**
  - In the Isle Royale pond, the diet by dry weight was:
    - stoneworts (*Nitella*/*Chara*) 58 %;
    - *Potamogeton* 15.5 %;
    - water horsetail (*Equisetum fluviatile*) 9.7 %;
    - *Carex* 9.2 %;
    - spikerush (*Eleocharis*) 5.8 %;
    - other 1.4 %.
  - In Ontario, moose preferred the species richest in **sodium**, and their heavily used lakes (6 of 24) were **shallower** with more
    mineral-rich sediment (Fraser, Chavez & Palohelmo 1984).
  - New Hampshire: bullhead pond lily (*Nuphar*), with moose "belly deep" and heads under (Forest Society).
  - They pull up whole plants, roots and all (Wikipedia, moose).
- **Depth:**
  - Usually belly-deep, about 1–1.5 m (inf from the NH account), in shallow bays.
  - Moose can dive more than 5.5 m (Wikipedia, citing Peterson).
  - Every lily and pondweed bed in both lakes is within reach (inf).
- **Grazing pressure:**
  - Exclosures in a ~2.5-ha beaver pond (inf from 3,217 kg ÷ 129,030 kg/km²): 6 moose removed **563 kg dry a summer**, about **17 % of
    the pond's 3,217 kg dry aquatic production** (inf from Tables I and X). Production was ~129 g dry/m² a summer.
  - Beaver and muskrat fed mostly on the hummocks.
- **Shore shrubs** (Isle Royale, share of plants browsed in summer):
  - mountain ash 57 %, pin cherry 50 %, mountain maple 48 %, **red-osier dogwood 44 %**, paper birch 37 %;
  - **speckled alder: trace only**;
  - balsam fir: 0 % in summer, 89 % in winter.
  - Browse reaches up to 2.8 m. Alder-lined shores therefore resist moose browsing; dogwood and willow fringes do not (inf).
  - Summer home range: 2–5 km² (range 1–10 km²).
- **Trampling:** no measurement found. Expect local disturbance of the lily bays and soft bottoms where moose feed day after day
  (inf).

**Density near Hot Brook.**
- The lakes are in **WMD 11** (1,769 mi²). MDIFW's aerial surveys covered WMD 11, but no WMD-specific density was found.
- MDIFW calls WMD 11 a "compromise zone" with fewer moose, and cut its permits after the 2012 census (Press Herald 2012).
- A search snippet of an older MDIFW "Moose assessment" gives a browse-based capacity of **~2.3 moose/mi² (~0.9/km²)**. The PDF is 403,
  so this is **unverified**.
- Northern Maine's double-count surveys gave 0.4–4.0 moose/km² across nine WMDs (Kantar & Cumberland 2013).
- **Scale estimate (inf):**
  - At 0.5–1 moose/km², the lakes' 77-km² catchment holds ~40–80 moose. Perhaps ~10–25 have home ranges that reach the 25 km of shore.
  - 10 moose × 0.87 kg dry a day × ~100 days ≈ **0.9 t dry of macrophytes a summer**: small lake-wide, heavy in the favoured bays.
- Danforth's moose harvest fell from 9 a year (2009–10) to 0–1 a year (2019–25) (main note).

### White-tailed deer

- **Confirmed at the lakes** by the human.
- **Aquatic feeding** (Rogers, Mooty & Dawson 1981, USDA FS GTR NC-65, reviewing the Upper Great Lakes):
  - Deer eat aquatic plants in **late spring and early summer**, most when water levels are low.
  - In NE Minnesota (Hennings 1977), in decreasing order of use: **bur-reeds**, filamentous algae, ribbonleaf pondweed, water horsetail,
    arrowhead, sedges, marsh cinquefoil, **white and yellow pond lily**, watershield, St John's-wort.
  - The share of the diet is "unknown but probably low".
  - Aquatic plants may meet sodium needs.
- **Daily intake:** ~2.5–3 % of body mass as dry matter, i.e. **~1.5–2 kg dry a day** for a 55–75-kg deer (gk). The aquatic part is a small
  fraction of that (inf from Hennings).
- **Wading:** shallow margins only (gk). Deer neither dive nor feed belly-deep the way moose do.
- **Winter yards** (MDIFW Deer Wintering Areas, layer 4):
  - **DWA 040087**: ~1,640 ha, starting ~1.4 km east of Upper (45.578–45.624 N, 67.908–67.824 W).
  - **DWA 100235**: ~143 ha, ~2–3 km NE of Lower's outlet (45.677–45.694 N, 67.907–67.888 W).
  - Deer yard in dense softwood (often lowland cedar and spruce along streams and shores) from about December to March, once the snow
    is deep (gk). Through the winter they browse cedar, fir and hardwood shoots there.
- **Density:**
  - MDIFW: deer in northern and Downeast Maine are below the desired density because of poor habitat and hard winters (via search).
  - No WMD 11 figure was found. The "<2 deer/mi² in some areas" claim (Realtree 2013) is not specific to WMD 11.

### Black bear

- **Confirmed at the lakes** by the human. Also an iNaturalist record ~2 km E of Lower (2020).
- **Harvest by town** (main note): Danforth 5–14 a year, T8 R4 NBPP 2–9, Bancroft 0–15.
- **Maine numbers:**
  - Statewide: **24,000–36,000** in the recent MDIFW range (via search; 23,000 "conservative" in 2009).
  - About **1 bear/mi²** (~0.4/km²) in occupied range (Maine Times 1996, via search).
  - Harvest density: 12 bears/100 mi² statewide in 2009 (MDIFW, via search).
  - Home ranges: females 6–9 mi², young males up to 100 mi². The research study areas include **Beddington, Washington County** (Northern
    Woodlands).
  - **Scale (inf):** ~0.4/km² over the 77-km² catchment ≈ **~30 bears** whose ranges touch it.
- **Season:**
  - Dens from mid-October to late November; emergence in **late April** (MDIFW bear-species sheet, via search). Most are active April 1 to
    November 1.
  - Spring is the leanest season: grasses, sedges, insects, last year's mast, skunk cabbage at wetland edges, and fawns in late May and
    June (BDN 2025; bear.org).
- **Fish:**
  - Around Ely, Minnesota, bears eat **no fish unless they live near a stream where white suckers spawn in spring**. They ignore
    non-spawning fish. Animal matter is **< 10 % of the annual diet** (North American Bear Center).
  - Analogue: in Yellowstone, **93 % of cutthroat spawning streams** had bear activity and **61 %** had evidence of bears fishing (USGS
    1990).
  - **No study quantifies black bears eating suckers.**
- **At Hot Brook (inf):**
  - White suckers spawn at ~7–10 °C, early April to early June (Wisconsin Sea Grant; Newfoundland and Labrador fisheries).
  - Here that falls in **early to mid-May** in the connecting brook's riffles and in the inlet below the Route 169 bridge: the bears'
    hungriest weeks, just after emergence.
  - The connecting brook is short (150–200 m), so it is a small, easily fished site.
  - Plausible intake: a few to some tens of 0.5–1.5-kg suckers per bear over a 1–3-week run. This is **an order-of-magnitude guess, not a
    measurement**.
- **Nutrients:**
  - Sucker runs raise stream **N and P 3–5×** and **double algal accrual** (Childress et al. 2014, *Ecosystems*, via search). The subsidy
    comes mostly from excretion and eggs; carcasses matter little, because suckers survive spawning (via search).
  - So bears carrying suckers onto land move only a small fraction of the run's N and P; most of the subsidy stays in the brook (inf).

### Dung, urine and carcasses

- **Moose:**
  - **5.66 pellet groups a moose a day**, and **no defecation seen in 65 h of watching moose in ponds**, against frequent defecation on
    land (Belovsky & Jordan 1978). Aquatic N and P therefore move from the lake to land.
  - Bump et al. 2009 (*J. Anim. Ecol.* 78:338): moose are a real aquatic-to-land N vector, seasonal and clumped around feeding sites and
    wolf-kill sites. A 2007 abstract by the same group gave **~4.5 kg N/ha/yr** in summer core areas, ~25 % of net N mineralisation
    (via search, preliminary).
  - **Scale (inf):** 0.9 t dry of macrophytes at ~2–3.5 % N and ~0.2–0.35 % P (gk) ≈ **20–30 kg N and ~2–3 kg P a summer** taken out of
    the two lakes. That is small beside the lakes' P stock, but it is a direction the sim does not yet have.
- **Deer:** ~13 pellet groups a deer a day (gk), dropped on land and in the yards. Their aquatic intake is small, so the transfer is
  minor (inf).
- **Carcasses:**
  - On Isle Royale, soils at moose carcass sites held **100–600 % more inorganic N, P and K**, and plants there **25–47 % more N** (MTU
    2009, on Bump et al. 2009 *Ecology*).
  - **No study of deer or moose lost through lake ice was found.**
  - Rough contents (gk): a 70-kg deer ≈ 2 kg N and 0.5 kg P; a 350-kg moose ≈ 10 kg N and 2–3 kg P.
  - A carcass on the ice is mostly scavenged by eagles, ravens, coyotes and fishers before ice-out. Only what sinks enters the lake (inf).

### Sources

- Belovsky & Jordan 1978, *Theor. Pop. Biol.* 14:76–104:
  https://belovskylab.nd.edu/assets/193221/belovsky_g.e._and_p.a._jordan._1978..pdf
- Belovsky 1981, *Ecology* 62:1020–1030: https://belovskylab.nd.edu/assets/193220/belovsky_g.e._1981b..pdf
- Tischler et al. 2019, *Diversity* 11:209: https://digitalcommons.mtu.edu/michigantech-p/1363
- Tischler et al. 2022, *Alces* 58:75–90:
  https://alcesjournal.scholasticahq.com/article/155938-aquatic-areas-provide-high-nitrogen-forage-for-moose-alces-alces-in-isle-royale-national-park-michigan-usa
- Bump et al. 2009: https://digitalcommons.mtu.edu/michigantech-p/11305
- MTU 2009, carcasses: https://www.mtu.edu/news/stories/2009/november/wolves-moose-biodiversity-unexpected-connection.html
- Fraser et al. 1984: https://www.wellbeingintlstudiesrepository.org/feebeh/6
- Forest Society: https://forestsociety.org/blog-post/moose-favor-aquatic-plants-summer
- Rogers et al. 1981: https://www.fs.usda.gov/nrs/pubs/gtr/gtr_nc065.pdf
- Press Herald 2012:
  https://www.pressherald.com/2012/04/08/how-many-moose-does-maine-have_-aerial-census-gets-closer-to-an-answer_2012-04-08/
- MDIFW Moose assessment (403): https://www.maine.gov/ifw/docs/moose-assessment.pdf
- WMD and DWA layers:
  - https://services1.arcgis.com/RbMX0mRVOFNTdLzd/ArcGIS/rest/services/Wildlife_Management_Districts_Dissolved/FeatureServer/0
  - https://gis.maine.gov/mapservices/rest/services/ifw/Wildlife_Habitat_Data/MapServer/4
- North American Bear Center: https://bear.org/bear-facts/animal-protein/
- USGS cutthroat streams:
  https://www.usgs.gov/publications/bear-use-cutthroat-trout-spawning-streams-yellowstone-national-park
- Northern Woodlands: https://northernwoodlands.org/articles/article/counting-bears
- BDN 2025:
  https://www.bangordailynews.com/2025/03/26/outdoors/wildlife/maine-black-bears-hibernation-hungry-bird-feeders-trash-tips/
- MDIFW bear-species sheet (via search): https://www.maine.gov/IFW/docs/bear-species.pdf
- Childress et al. 2014: https://doi.org/10.1007/s10021-013-9739-z
- Sucker spawning temperatures: https://www.gov.nl.ca/fal/?p=4230 and https://www.seagrant.wisc.edu/?p=7930
