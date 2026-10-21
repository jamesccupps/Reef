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
- **Pending:** bear, deer and moose interactions with the water (asked of this sub-search on 2026-10-21; it may add a section).
