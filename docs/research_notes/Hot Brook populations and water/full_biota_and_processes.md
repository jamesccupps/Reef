# Every organism and process of the real Hot Brook lakes: the full list (2026-10-21)

**Scope.** Upper Hot Brook Lake (MIDAS 1076, ~360–369 ha, max 5.5 m), Lower Hot Brook Lake (MIDAS 1072, ~274–277 ha, max 4.0 m) and the ~150–200 m connecting Hot Brook, in Danforth / Bancroft / Weston / T8 R4 NBPP (Washington and Aroostook counties). Drainage: Hot Brook → Baskahegan Stream → Mattawamkeag → Penobscot. The lakes are shallow and unstratified. The water is soft (alkalinity ~5–8 mg/L, Ca probably 2–4 mg/L), slightly tea-coloured (~20–46 PCU) and oligo-mesotrophic (TP ~9–12 µg/L). The bottoms are mostly mud, the shores mostly rock with some sand, and the catchment is spruce–fir and mixed forest with ~15% wetland. Ice cover runs from ~late Nov/early Dec to ~mid/late April.

**Why this file.** The owner wants every animal, plant and process that is really there represented. This is the census of *what exists*. It lists each taxon, its evidence, its rough importance and its role, and it points to the research note that holds the numbers. It does not repeat those numbers. Where no note covers a taxon, the last column says **none — needs research**.

**How it was built.**
1. I read the repo's research notes first: every folder under `docs/research_notes/`, `docs/reports/*.md`, `docs/FISH_CENSUS.md`, `docs/ECOLOGY_RESEARCH.md`, and the owner's field observations in project memory.
2. A few targeted web checks covered the fishing and ice-fishing laws, the mercury advisory, catchment forestry and the Stetson wind farms.
3. Four parallel web-research passes were started (birds and mammals; herps and insects; other invertebrates, parasites and microbes; plankton, algae and plants). **Their results were not available when this file was written**, and the session's search budget ran out. Items resting only on my general ecological knowledge are therefore flagged **(gk)**. They are unverified for this region and their note column reads "none".
4. Blocked sources (maine.gov to scripted fetches, lakesofmaine.org bot wall, paywalls) were not bypassed. They are listed in §13.

## Legend

**Evidence (column "Ev.")**
- **HB**: confirmed at the Hot Brook lakes or brook. The source is named: MDIFW survey sheets 1949/1965/2004, the MDIFW *Lake Fish of Maine* database (2007), the MDIFW 2024 depth chart for Lower, the MDIFW listed-species GIS, GBIF/iNaturalist records, or the owner's own observations and photos ("owner").
- **RG**: confirmed in the region, meaning the Baskahegan/Mattawamkeag drainage, the Danforth–Weston towns, or similar eastern-Maine lakes. Not recorded at Hot Brook itself.
- **LK**: likely but unconfirmed. Habitat, range and analogues all say it should be there.
- **UN**: unlikely or absent, with the reason. These are listed so they are not added by mistake.

**Abundance or importance (column "Ab.")**
- **D** dominant; **C** common; **O** occasional; **R** rare; **?** unknown.
- These are rough ranks. Numbers live in the cited notes.

**Note paths (column "Note")** are relative to `docs/research_notes/`, with folder abbreviations:

| Code | Folder |
|---|---|
| HBPW | `Hot Brook populations and water/` |
| SHORE | `Maine lake shores and catchment/` |
| MLPS | `Maine lakes ponds and streams/` |
| STRM | `Fish in streams connecting lakes/` |
| CAL | `Real lake ecology for calibration/` |
| W3D | `Whole lake 3D fish simulation/` |
| WINT | `Predator winter energetics/` |
| SEAS | `Seasonal fish habitat use/` |

"FC" is `docs/FISH_CENSUS.md`. "**none**" means none — needs research.

---

## 1. Fish

### 1a. Recorded in the lakes or the brook

Census values are fish ≥ 7.5 cm per ha of lake, from FC.

| Species | Ev. | Where | Ab. | Role in the lake | Note |
|---|---|---|---|---|---|
| **White perch** *Morone americana* | HB: MDIFW 1949 and 2007 (both lakes); principal fishery; owner catches "mostly white perch" | both lakes, brook (spawning night runs possible) | **D** (the most numerous adult fish; EMAP eastern-Maine nets median 42% of adults, 55–68% in Hot Brook-like lakes; census ~450/ha) | Roving schooling planktivore → benthivore (chironomids, *Chaoborus*, amphipods) → piscivore on young-of-year and juvenile alewives. Eaten by pickerel, bass, loon, osprey, mergansers, eagle. **Primary host of the state-Threatened yellow lampmussel**, also of tidewater mucket and elliptio. Not native to the drainage (introduced, Penobscot plan 2008). 25-fish bag limit, set by citizen petition | HBPW/species_numbers_northern_lakes, eastern_maine_relative_abundance; CAL/white_perch_habitat_and_predation, gemini_white_perch_checked; W3D/white_perch_regulation, size_structure_whiteperch_sucker_bullhead; SEAS/whiteperch_shiner_sucker_bullhead |
| **Yellow perch** *Perca flavescens* | HB: MDIFW both lakes; app catch; owner (small, fewer than fallfish and bass) | both lakes | **C** as juveniles (the most numerous young fish); adults uncommon and small (census ~500/ha, mostly 7.5–15 cm) | Zooplankton → benthos (~40 mm) → occasional fish (≥80 mm). The main young-of-year schools inshore. Key prey of bass (the "Marks Lake" pathway), pickerel, white perch, loon, herons and mergansers. Strands of eggs on wood and plants. Host of elliptio and lampmussels | HBPW/species_numbers_northern_lakes, eastern_maine_relative_abundance; CAL/forage_fish_early_life, larval_juvenile_energetics_panfish, first_winter_mortality; SEAS/perch_pickerel_smallmouth_pumpkinseed |
| **Smallmouth bass** *Micropterus dolomieu* | HB: MDIFW (both lakes; principal fishery; "managed for larger than average size"); ~60–70% of the owner's and app catches | both lakes, mostly shore-oriented; the brook (residents, spawners, and big bass in the 1.1-m mouth pool) | **C** (census ~40/ha, ~26,000 fish); catchability inflates its share of the catch | Top littoral piscivore: crayfish (few here), fish (perch young, killifish, fallfish, sunfish) and insects (mayflies, *Hexagenia*). Males guard nests (nest_guarding_costs). All bass catch-and-release (2019, 2023 law books). Not native to Maine (introduced 1868) | MLPS/centrarchid_percid_esocid_parameters; CAL/smallmouth_horizontal_habitat, juvenile_refuges_and_bass_young; STRM/bass_pickerel_in_connecting_streams; WINT/nest_guarding_costs, predator_winter_energetics |
| **Chain pickerel** *Esox niger* | HB: MDIFW (principal fishery); owner ("a few"; pickerel "swim through and hang out" in the brook) | both lakes (weedy margins), brook pools and slow weedy runs | **C** (~25/ha) | Ambush piscivore in vegetation. Cannibalistic. Spawns early on flooded vegetation (6–11 °C). Active under ice. Eagle prey. Native to Maine, but the Penobscot plan says it was introduced into this drainage | WINT/pickerel_population_dynamics, pickerel_young_of_year, esocid_*; W3D/pickerel_mortality_cannibalism, predator_diets_and_prey_mortality; STRM/bass_pickerel_in_connecting_streams |
| **Brown bullhead** *Ameiurus nebulosus* | HB: MDIFW both lakes; app catch (Upper) | both lakes, mud basins and weeds | **C** (~100/ha; ~70% < 20 cm) | Nocturnal benthic omnivore and scavenger: chironomids, *Chaoborus*, molluscs, crayfish, fish eggs and carrion. Guards young in balls. Favoured prey of **bald eagles** inland. The most frequent lake-to-lake mover after the sucker. Bycatch in eel traps | CAL/bullhead_growth_and_young_white_perch; W3D/size_structure_whiteperch_sucker_bullhead; MLPS/sucker_shiner_bullhead_trout_parameters; SEAS/whiteperch_shiner_sucker_bullhead |
| **White sucker** *Catostomus commersonii* | HB: MDIFW both lakes | both lakes; spawning runs into the brook and inlets after ice-out | **C** (~70/ha; ~60% juveniles < 30 cm) | Benthivore on chironomids, crustaceans, molluscs and detritus. Its stream spawning runs import nutrients and feed eagles, otters and gulls; its young are forage. The commonest lake-to-lake commuter (Adirondack telemetry). A bioturbator | MLPS/sucker_shiner_bullhead_trout_parameters; HBPW/species_numbers_northern_lakes; STRM/movement_between_connected_lakes; W3D/fallfish_spawning_brook, size_structure_* |
| **Pumpkinseed** *Lepomis gibbosus* | HB: MDIFW 2007 (Upper), 2024 chart (Lower); owner's catches and photo | brook pools, Upper's west-central cove, weedy shallows | **O–C** (~50/ha) | Littoral insectivore. Becomes a **snail crusher** above ~75–80 mm SL, but soft water keeps snails scarce, so the diet is mostly chironomids, isopods and amphipods. Surface-grazes under lily pads. Nest colonies. Host of elliptio and brook floater | W3D/littoral_invertebrates §2, lily_pad_fauna; STRM/minnows_and_sunfish_in_connecting_streams; MLPS/centrarchid_percid_esocid_parameters |
| **Redbreast sunfish** *Lepomis auritus* | HB: **owner only** (catches and photo, mostly redbreast); not on MDIFW lists; in 12 of 61 regional lakes, incl. Jackson Brook and Drake (Baskahegan HUC-10) | brook pools (current-tolerant stream sunfish), weedy shallows | **O–C** (~50/ha; brook adults 18–21 cm, ≥7–10 yr) | Insectivore (not a molluscivore). Rock- and wood-oriented. Brook pools hold the oldest fish. Pumpkinseed × redbreast hybrids are possible (East Branch Lake EMAP) | HBPW/fish_numbers_and_new_species Q5; STRM/minnows_and_sunfish_in_connecting_streams Q4; W3D/habitat3d_new_species |
| **Fallfish** *Semotilus corporalis* | HB: MDIFW both lakes; owner ("lots") | both lakes (rocky shores, mouths), brook (mound nests at pool tails and runs; schools of young passing) | **C** (~85/ha) | Large minnow; omnivore on aquatic and terrestrial insects, piscivore above ~10 cm. **Builds gravel mound nests** that common shiners and dace also spawn on. Young fallfish are the likely "minnow schools passing through the brook". Very catchable | W3D/fallfish_spawning_brook; STRM/minnows_and_sunfish_in_connecting_streams; HBPW/eastern_maine_relative_abundance Q3 |
| **Banded killifish** *Fundulus diaphanus* | HB: MDIFW both lakes (seine catch) | very shallow shelf (≤ ~1 m), sand and plant margins | **C** (~150,000 fish; shoals of 25–40) | Small inshore schooler: chironomids, zooplankton, surface insects. Prey for pickerel, bass, herons, kingfishers and mergansers. Host of the **tidewater mucket** (Threatened) and elliptio. Persists only with very-shallow refuges | CAL/killifish_persistence_and_predators; HBPW/small_fish_numbers; W3D/habitat3d_new_species |
| **Blacknose dace** *Rhinichthys atratulus* | HB: MDIFW both lakes; **not seen by the owner** | brook riffles (resident) | **R?** (~1,000 if present) | Benthic riffle insectivore on hydropsychids, blackflies and chironomids. Needs the lake-outlet food subsidy and the shallow-riffle refuge from piscivores. Host of the brook floater. Status uncertain | W3D/brook_food_web §4, fallfish_spawning_brook Q4; STRM/minnows_and_sunfish_in_connecting_streams Q1; HBPW/small_fish_numbers Q2 |
| **Sea-run alewife** *Alosa pseudoharengus* | HB: **MDIFW 2024 chart for Lower**; reached Danforth naturally from 2017; both lakes mapped as alewife habitat (DMR 2008) | spawns in lake shallows (May–June); young in open water Jul–Dec | **O now** (colonising; suggested default ~15 adults/acre; full restoration 235/acre) | Adults spawn and partly die in the lake, importing marine P (~0.97 g per adult). Young-of-year are pelagic zooplanktivores: large cladocerans collapse late May–June until they leave. A big forage pulse for bass, pickerel, white perch, eagles, osprey and loons. Young emigrate in rain pulses Jul–Dec. **Host of the alewife floater mussel** | HBPW/sea_run_alewife, gemini_angling_alewife_checked, drainage_species_and_eel §4; STRM/movement_between_connected_lakes |

### 1b. Probably present, unrecorded

| Species | Ev. | Ab. | Role, and why it matters | Note |
|---|---|---|---|---|
| **American eel** *Anguilla rostrata* | **RG/LK**. In 14 of 17 analogue lakes, including **Baskahegan Lake and Crooked Brook Flowage upstream on the same stream**. Milford and West Enfield pass eels. Daytime nets miss eels. The owner has never seen one, so it is out of the sim for now | R–O (≈1–5/ha suggested) | A nocturnal benthic predator of crayfish, fish and insects that buries in mud by day. Catadromous: yellow eels stay 7–20+ yr, then silver eels **emigrate downstream in autumn**. Mostly large females in lakes. Host of elliptio. Carries the invasive swim-bladder nematode *Anguillicola crassus* (Pennamaquan Lake, Washington Co., 3 of 3 eels) | HBPW/drainage_species_and_eel §3 |
| **Common shiner** *Luxilus cornutus* | RG: 5 of 7 shallow analogues; Baskahegan Lake | ? | A mid-water stream and lake minnow that spawns on fallfish mounds. Forage | HBPW/drainage_species_and_eel §1; STRM/minnows_and_sunfish_in_connecting_streams Q3 |
| **Golden shiner** *Notemigonus crysoleucas* | RG: 3 of 7 shallow analogues. **No Hot Brook record; the owner ruled it out** | — | Was the sim's old "minnow". **Live-bait introduction is a real risk**: South Zone general law allows live baitfish | MLPS/sucker_shiner_bullhead_trout_parameters; HBPW/eastern_maine_relative_abundance |
| **Creek chub** *Semotilus atromaculatus* | RG: 2 of 7 shallow analogues; Baskahegan Lake | ? | A stream minnow that preys on dace; a candidate for the brook | STRM/minnows_and_sunfish_in_connecting_streams |

### 1c. Transients, or present only in the wider drainage

| Species | Ev. | Note |
|---|---|---|
| **Brook trout** *Salvelinus fontinalis* | RG: Baskahegan Lake list, Faulkner Lake (Weston). At Hot Brook at most a **rare spring/fall stray**: there is no cold tributary (MDIFW), and the "trout and salmon" claim traces to a real-estate listing | HBPW/eastern_maine_relative_abundance Q7, drainage_species_and_eel §5 |
| **Atlantic / landlocked salmon** *Salmo salar* | UN in the lakes. Sea-run salmon spawn and rear in the Mattawamkeag main stem at Bancroft (critical habitat) | HBPW/drainage_species_and_eel §4 |
| **Sea lamprey** *Petromyzon marinus* | UN. Maximum upstream travel is ~100 km above Milford; Hot Brook is ~150 km | HBPW/drainage_species_and_eel §4 |
| **Blueback herring, American shad** | UN in the lakes (river spawners; Mattawamkeag is shad habitat) | HBPW/drainage_species_and_eel §4 |
| **Rainbow smelt, burbot (cusk), lake whitefish, lake trout, longnose sucker, round whitefish** | UN: cold-water fish of the deeper analogues (11–39 m) such as East Grand and Pleasant; absent from all 7 shallow analogues | HBPW/drainage_species_and_eel §1 |
| **Bog-pond minnows**: northern redbelly, pearl and finescale dace, lake chub, fathead minnow, blacknose shiner; **sticklebacks** (nine-, three-spine, brook) | UN at Hot Brook. They live in small, predator-poor Moro Plt ponds; bass and pickerel exclude them | HBPW/drainage_species_and_eel §1 |
| **Slimy sculpin** *Cottus cognatus* | UN: Penobscot native but in none of 61 regional lakes; a cold-stream fish | HBPW/drainage_species_and_eel §1 |
| **Longnose dace, bridle shiner, creek chubsucker, American brook lamprey** | Penobscot natives (2008 plan); no regional lake record; stream or rare species. **No note examines them for the brook** | none |
| **Largemouth bass, black crappie, northern pike, green sunfish, emerald shiner** | UN today; **future invaders by illegal stocking** (Penobscot plan; largemouth in the St. Croix's Grand Falls Flowage 2012). The three app-logged "largemouth" on Upper are judged mislabelled smallmouth | HBPW/drainage_species_and_eel §5; FC |

**Fish takeaways for the sim.** The confirmed set is the 11 species already in `species3.js`, plus **sea-run alewife**, which is now confirmed for Lower. **Eel** is the one probable fish still missing. Its role (crayfish and fish predation at night, autumn emigration, a parasite carrier) is unlike any modelled fish.

---

> **Status of sections 2–7 (read first).** Four web-research passes were started for birds and mammals, herps and insects, other invertebrates and parasites, and plankton, algae and plants. **Their results had not arrived when this file was written**, and the session's web-search budget was used up. Sections 2–7 therefore rest on the repo notes plus my general ecological knowledge. Every item that rests only on general knowledge is marked **(gk)**: plausible, but not checked against a source for this region. A **(gk)** item's note column is "none".

## 2. Birds

| Species | Ev. | Ab. | Role in the lake | Note |
|---|---|---|---|---|
| **Bald eagle** | **HB**: the owner sees them; **a nest on "Kittery Island in Upper Hot Brook Lake"** (LURC Stetson II response 2008–09, search excerpt only; still-active status unknown) | C (resident pair) | Year-round fish predator and scavenger: bullhead, white sucker and pickerel inland; spawning suckers and alewives in spring; carrion on the ice in winter. Takes loon eggs and chicks. Top mercury accumulator | SHORE/shore_birds_and_mammals §4; HBPW/gemini_hot_brook_checked row 3 |
| **Common merganser** | **HB**: the owner's photo, a female with large ducklings on a rock in a bulrush stand (Jul 2026) | C (summer; broods) | Pursuit diver on fish of 5–13 cm, crayfish and insects; an adult eats ~400 g/day. Broods work lake and stream. **Definitive host of swimmer's-itch schistosomes** (*Trichobilharzia*), with *Stagnicola* snails as the intermediate host (gk) | SHORE/shore_birds_and_mammals §5; HBPW/plant_species_hot_brook §6 |
| **Common loon** | LK: no per-lake count online, and the lakes lie north of Maine Audubon's estimate area. Expect **1–2 breeding pairs per lake** (cove territories) | C (Apr–Nov) | Diving piscivore: ~1.1 kg/day per adult and ~2.5 kg/day per family, fish mostly ≤ 25 cm (perch, white perch, sunfish, fallfish). Nests at the waterline, often on islands such as Kittery Island, so nests flood when the water rises >0.3 m. **Black flies (*Simulium annulus*) drive loons off nests** (Piper et al. 2018, Wisconsin). Mercury sentinel | SHORE/shore_birds_and_mammals §1; HBPW/gemini_hot_brook_checked row 10a |
| **Osprey** | LK | O–C (Apr–Sep) | Plunge-diver taking fish of 150–300 g within ~1 m of the surface: suckers, white perch, bass, pickerel; alewives in spring | SHORE/shore_birds_and_mammals §4 |
| **Great blue heron** | LK: 8 MDIFW Inland Waterfowl and Wading Bird Habitat polygons ring the lakes and Hot Brook | C (Apr–Nov) | Wades ≤ 50 cm and takes fish ≤ 25 cm, frogs and crayfish; ~300 g/day; dawn and dusk. **Definitive host of yellow grub (*Clinostomum*)** and white grub (*Posthodiplostomum*) (gk) | SHORE/shore_birds_and_mammals §2, §9; HBPW/hot_brook_lake_records (IWWH) |
| **Belted kingfisher** | LK | C (Apr–Nov; some winter at open riffles) | Plunges for fish of 4–14 cm in water < 60 cm; about one per 0.8 km of shore. **Definitive host of black-spot trematodes** (*Uvulifer*) (gk) | SHORE/shore_birds_and_mammals §3 |
| Hooded merganser | LK (beaver ponds; tracks beaver) | O | Small fish, crayfish, insects; cavity nester | SHORE/shore_birds_and_mammals §5 |
| Double-crested cormorant | LK (occasional transient inland) | R–O | Eats yellow perch and white perch; a strong local predator if it colonises | SHORE/shore_birds_and_mammals §5 |
| **Black tern** (state Endangered) | **RG**: Crooked Brook Flowage, Danforth, 2010–12 (MDIFW GIS) | R at Hot Brook | Marsh-nesting tern; eats emerging insects and small fish | HBPW/gemini_hot_brook_checked ("found in passing") |
| American bittern, green heron, Virginia rail, sora | LK (gk for the rails) | R–O | Ambush small fish, frogs and insects in emergent marsh (Lower's N-end marsh, Upper's S-end wetlands) | SHORE/shore_birds_and_mammals §5 (bittern, green heron); rails none |
| **Dabbling and diving ducks and geese**: American black duck, mallard, wood duck, **ring-necked duck** (a breeding duck of eastern-Maine wetland lakes, gk), common goldeneye (cavity nester, gk), Canada goose | LK | O–C | **Grazers of plants, seeds and tubers** (lily, pondweed, wild-rice seeds) and of invertebrates. Duckling prey for pickerel, snapping turtles and eagles. Nutrient import in guano | W3D/plant_species_traits (ducks as plant feeders, brief); otherwise none |
| Gulls (herring, ring-billed) | LK (gk) | O | Scavenge dead alewives and spawned-out fish; carry eye flukes (*Diplostomum*) and *Ligula* (gk) | none |
| Spotted sandpiper | LK (gk) | O | Forages emerging insects on rocky shore and exposed cobble | none |
| **Aerial insectivores**: tree swallow, barn swallow, chimney swift, common nighthawk, eastern kingbird, eastern phoebe, olive-sided and alder flycatchers, cedar waxwing | LK (gk for species) | C (May–Aug) | **Take emerging chironomids, mayflies (*Hexagenia*) and odonates**, which exports lake production to land. Up to 25–100% of their energy can come from aquatic insects | SHORE/land_lake_subsidies §6 (general); species none |
| Marsh and shrub songbirds: red-winged blackbird, swamp sparrow, common yellowthroat, northern waterthrush | LK (gk) | C | Nest in emergents and alder; eat emerging insects | none |

## 3. Mammals

| Species | Ev. | Ab. | Role in the lake | Note |
|---|---|---|---|---|
| **Beaver** | **HB (indirect)**: NWI marks **beaver-modified wetlands within 500 m of both lakes** (PEM1Eb ×4, PUBHb at Lower's N end, PUB/FO5Fb W of Upper). Maine has 0.15–0.32 colonies/km² | C | **Ecosystem engineer**: dams on inlets, outlets and possibly the brook; ponds; dead-wood habitat. Cuts alder, aspen and birch within ~30 m of water. Lodges and dams give otters under-ice access. Raises merganser habitat. Blocks fish passage at low flow | HBPW/plant_species_hot_brook §3; SHORE/shore_birds_and_mammals §7; MLPS/maine_limnology_streams §9; STRM/lake_outlet_stream_ecology §5 |
| **White-tailed deer** | **HB (indirect)**: MDIFW deer wintering area 040087 east and south-east of Upper | C | Browses shore shrubs; winters in the conifer swamps | HBPW/hot_brook_lake_records |
| **River otter** | LK | O (roaming family, visits every few weeks) | Eats suckers, bullheads, sunfish, crayfish and frogs, ~1.2–1.8 kg/day; active all year, under the ice from beaver lodges. **Breaks open mussels and leaves shell middens** (floaters first) | SHORE/shore_birds_and_mammals §6; HBPW/maine_freshwater_mussels |
| **Mink** | LK | C (1–3 per km of good shore) | Nocturnal bank forager: fish in winter and spring, crayfish in summer, voles in fall; frogs | SHORE/shore_birds_and_mammals §6 |
| **Muskrat** | LK | O–C | Grazes cattail, bulrush and pondweeds and can eat out emergent stands; lodges add structure; **eats mussels** | SHORE/shore_birds_and_mammals §7; W3D/plant_species_traits |
| **Raccoon** | LK | C | Shoreline night forager on crayfish, frogs, mussels and stranded fish. **The main predator of turtle nests** (20–90% loss) and of loon nests | SHORE/shore_birds_and_mammals §7; SHORE/turtles_and_frogs §3 |
| **Moose** | LK (eastern Maine moose range, gk) | O (summer) | **Wades and feeds on aquatic plants** (pondweeds, lily leaves and rhizomes) in June–August for sodium. Tramples the shallows | W3D/plant_species_traits (mentioned); density none |
| Red fox, coyote | LK (gk) | C | Turtle-nest predators (fox); hunt the ice margins in winter | SHORE/turtles_and_frogs §3 (fox); none for coyote |
| Black bear | LK (gk) | O | Eats spawning suckers and dead alewives in streams; tears up turtle nests | none |
| Fisher, ermine | LK (gk) | O | Riparian; minor | none |
| Water shrew *Sorex palustris*, star-nosed mole *Condylura cristata* | LK (gk; both are northern-Maine wetland mammals) | ? | Dive for aquatic insects, small fish and amphipods along brook and fen edges. Prey of mink and pickerel | none |
| **Bats**: little brown (Endangered in Maine), northern long-eared (federally Endangered), tri-coloured, big brown, eastern red, hoary, silver-haired | LK (gk; white-nose syndrome has collapsed *Myotis* populations) | O now | **Night consumers of emerging aquatic insects** (chironomids, caddis, mayflies) over the water. Wind-turbine collision risk at Stetson | SHORE/land_lake_subsidies §6 (general); species none |

## 4. Reptiles and amphibians

| Species | Ev. | Ab. | Role in the lake | Note |
|---|---|---|---|---|
| **American bullfrog** | **HB**: owner ("definitely some bullfrogs") | C | Large aquatic frog; males on floating territories. Eats insects, frogs, small fish, crayfish, ducklings and newts. **Tadpoles take ~2 years.** Hibernates on the bottom (under-ice O₂ matters) | SHORE/turtles_and_frogs §6 |
| **Green frog** | **HB (likely)**: owner reports "frogs of several species"; statewide common | C–D on vegetated shores | Shore-edge frog. Eats insects, many of them terrestrial or emerging. Tadpoles overwinter once. Prey of herons, pickerel, bass, snapping turtles, mink and water snakes | SHORE/turtles_and_frogs §6 |
| **Mink frog** | LK (Maine is the southern edge of its range; includes the east) | O–C | Lives among lily pads; breeds late Jun–Aug | SHORE/turtles_and_frogs §6 |
| Wood frog, spring peeper, spotted salamander, **blue-spotted salamander** (gk) | LK: an **MDIFW Significant vernal pool** in T8 R4 NBPP (2008) | C in the catchment | Breed in fishless vernal pools and beaver flowages, not in the lake. Spring migrations on rainy nights. Their young are prey for herons and garter snakes | SHORE/turtles_and_frogs §7; HBPW/hot_brook_lake_records |
| American toad; northern leopard frog; pickerel frog; gray treefrog | LK (gk; treefrog range in NE Maine uncertain) | O | Toads breed in warm lake shallows (toxic tadpoles). Leopard and pickerel frogs use brook and marsh edges | turtles_and_frogs mentions toad, leopard, pickerel and treefrog once each; otherwise none |
| **Eastern (red-spotted) newt** | LK | C (often abundant in weedy shallows, gk) | **The one salamander that lives in lakes with fish.** Adults are toxic (tetrodotoxin), so fish reject them, but bullfrogs do not; larvae are eaten. Eats zooplankton, insects and amphibian eggs; active under ice | SHORE/turtles_and_frogs §7 |
| Northern two-lined salamander, northern dusky salamander | LK (gk) | ? | Brook banks and seeps; their larvae are stream benthos | none |
| **Painted turtle** | LK (the owner's "some turtles" are probably mostly painted) | C (≈5–15/ha of weedy shallows) | Omnivore: young carnivorous, adults increasingly plant-eating. Basks on logs and mats. Hibernates in the shallows. Nests mid-June; hatchlings overwinter in the nest. Hosts the turtle leech *Placobdella* (gk) | SHORE/turtles_and_frogs §1–3 |
| **Snapping turtle** | LK (common statewide) | O (1.5–2.4 adults/ha) | Bottom ambusher and scavenger: fish, frogs, ducklings, carrion; one-third to two-thirds plants. Nests in June up to km from water (road shoulders). Hatchlings emerge in September | SHORE/turtles_and_frogs §4 |
| **Wood turtle** (Special Concern) | **RG/HB?**: MDIFW "rare animal" records ARAAD02020 (G3/S4, Special Concern) observed in **Danforth (14 Jun 2013) and Bancroft (10 May 2013)**. The code's species is not public; the code pattern and rank fit wood turtle | R | Stream turtle: forages on brook banks and floodplain, overwinters under undercut banks in pools, nests on sandbars. A candidate for the brook and the inlet | HBPW/hot_brook_lake_records; SHORE/turtles_and_frogs §5 |
| Spotted, Blanding's, musk turtles | UN (southern and central Maine only) | — | — | SHORE/turtles_and_frogs §5 (spotted, Blanding's); musk none |
| Northern water snake | **Uncertain**: listed for eastern Maine but its range is patchy and disjunct; unconfirmed here | ? | Fish- and frog-eater basking on logs and lodges | SHORE/turtles_and_frogs §7 |
| Common garter snake (also red-bellied, ring-necked, smooth green, milk: terrestrial) | LK | C (garter) | Takes frogs, tadpoles and small fish at the shore | SHORE/turtles_and_frogs §7 |

## 5. Macroinvertebrates and other small animals

| Taxon | Ev. | Ab. | Role in the lake | Note |
|---|---|---|---|---|
| **Crayfish**: virile crayfish *Faxonius virilis* (94% of Maine stream catches; probable species). Spiny-cheek (*F. limosus*) and calico (*F. immunis*) are the other Maine species | **HB (genus)**: owner (present but "**not common**"; photo of a young crayfish; species not identified) | O | Omnivore and scavenger on snails, insects, eggs, plants and carrion. Prey of bass (above ~150 mm), otters, mink and herons. **Soft water (Ca < 3–5 mg/L) limits it** | HBPW/invertebrates_plankton_plants §1; W3D/littoral_invertebrates §5; MLPS/maine_limnology_streams §7 |
| Rusty crayfish (invader); white river crayfish *Procambarus acutus* (introduced, "restricted to Downeast") | UN now / invasion risk | — | Rusty crayfish displaces virile and devastates macrophytes and snails | HBPW/invertebrates_plankton_plants §1 |
| **Eastern elliptio** *Elliptio complanata* | **HB (likely species)**: owner's "**lots of mussels**". Maine's commonest mussel. The Gemini claim of shells at the Rte 169 crossing is unverifiable | **D** by biomass (likely 5–25/m² on firm 0.5–3 m bottoms; can outweigh all other benthos) | Filter-feeder that clears seston; at drought flows it dominates seston removal in the brook. Biodeposits enrich the bed. Glochidia parasitise perch, sunfish, bass, sucker, killifish and eel. Lives 15–30+ yr. Burrows in winter. Eaten by otters, muskrats and raccoons | HBPW/invertebrates_plankton_plants §2, maine_freshwater_mussels; STRM/lake_outlet_stream_ecology §1 |
| **Yellow lampmussel** *Lampsilis cariosa* (state **Threatened**) | **HB**: MDIFW listed-species GIS element inside **Upper's SW part** (date not public). Also in Crooked Brook Flowage, Baskahegan Lake area and the Mattawamkeag at Bancroft | R–O | Lure-displaying mussel; **hosts white perch (dominant) and yellow perch** | HBPW/hot_brook_lake_records, gemini_hot_brook_checked row 2a |
| Eastern floater *Pyganodon cataracta* | LK (statewide; soft mud, dense plants, low O₂) | C? | Thin-shelled, so the first eaten by muskrats and otters. Long-term brooder (glochidia in spring) | HBPW/maine_freshwater_mussels |
| Eastern lampmussel *L. radiata*; tidewater mucket *Atlanticoncha ochracea* (Threatened; hosts white perch and **banded killifish**) | LK (Penobscot watershed range; hosts present) | ? | — | HBPW/maine_freshwater_mussels |
| **Brook floater** *Alasmidonta varicosa* (Threatened) | **RG**: Baskahegan Stream at Bancroft (1994); the generalised polygon covers Hot Brook's mouth | R | Stream mussel; candidate for the connecting brook and outlet (hosts dace, pumpkinseed) | HBPW/gemini_hot_brook_checked |
| Triangle floater; alewife floater *Utterbackiana implicata* (host = alewife; Gemini claim unverified); creeper (rivers only); eastern pearlshell (cold streams) | LK brook / possible with alewives / UN / UN | — | — | HBPW/maine_freshwater_mussels, gemini_hot_brook_checked row 2b |
| **Fingernail and pea clams** (Sphaeriidae: *Sphaerium*, *Musculium*, *Pisidium*) | LK (Vermont soft-water lakes at pH ≥ 6 kept "strong" populations) | C | Small deposit and filter feeders in mud and weeds; important bullhead, perch and pumpkinseed food | W3D/littoral_invertebrates §2 (brief); otherwise none |
| **Snails**: small soft-water fauna of *Amnicola*, *Gyraulus*, *Ferrissia* (limpet), *Physa*, small *Helisoma/Planorbella*, *Valvata*, *Fossaria*, *Stagnicola* (gk) | **HB (group)**: owner ("snails") | O–C (weed beds 100–1,000/m²; mud 5–50/m²) | Graze epiphyton, which helps the plants. **Intermediate hosts of trematodes** (black spot, yellow and white grub, swimmer's itch). Pumpkinseed food above 75 mm | W3D/littoral_invertebrates §2 |
| Chinese mystery snail (invasive in parts of Maine, gk) | UN / risk | — | — | none |
| **Oligochaetes** (tubificids, naidids, lumbriculids) | LK | **D** in mud | Deposit feeders and bioturbators; bullhead, sucker and perch food | HBPW/invertebrates_plankton_plants §3; W3D/littoral_invertebrates |
| **Leeches**: *Macrobdella decora* (American medicinal leech), *Placobdella* (turtles and fish), *Helobdella*, *Erpobdella/Nephelopsis*, *Haemopis* (gk for species) | LK | C? (they dominated a eutrophic *Potamogeton* bed's biomass) | Predators of snails, chironomids and worms; blood-feeders on fish, turtles, frogs and waders. Perch and sunfish food | W3D/littoral_invertebrates §1 (brief); species none |
| Flatworms (*Girardia*), nematodes, gastrotrichs, tardigrades (meiofauna) | LK | D by number (Mirror Lake NH: ~1.2 million/m² of all benthos, 98% small fauna) | Meiofaunal grazers and predators; food for chironomids and fish larvae | HBPW/invertebrates_plankton_plants §3 (whole community); taxa none |
| **Amphipod** *Hyalella azteca* | LK ("relatively common" in Maine) | C (hundreds to ~2,000/m² in weeds < 2 m) | Grazer and detritivore; key food of young perch, sunfish and pickerel | HBPW/invertebrates_plankton_plants §3; W3D/littoral_invertebrates |
| Isopods *Caecidotea*; ostracods; cladoceran and copepod littoral fauna | LK | C | Detritivores in leaf packs and weeds; pumpkinseed food; bladderwort prey | W3D/littoral_invertebrates, bladderwort_isoetid_chemistry |
| **Chironomid midges** (*Chironomus*, *Procladius*, *Tanypus*, many littoral genera; 163 species in Maine) | LK | **D** (hundreds to thousands per m²) | The base of the benthic food web and 60–80% of emerged insect biomass. Emerge from just after ice-out, main pulse May–June, again Aug–Sep. Some bore lily petioles or mine *Brasenia* leaves | HBPW/invertebrates_plankton_plants §3; W3D/littoral_invertebrates, lily_pad_fauna |
| **Phantom midge** *Chaoborus punctipennis* | LK | C (~50–500/m²) | Night-migrating planktivore. **No anoxic refuge here, so it hides in the mud by day.** Food of perch and white perch | HBPW/invertebrates_plankton_plants §3 |
| **Burrowing mayfly** *Hexagenia limbata* | LK (the Maine "Hex hatch" on ponds) | C? where mud is soft and oxic (~50–300/m²) | Burrows and aerates the mud. **Dusk emergence late June–mid July at 18–21 °C** is a surface feast for bass, perch and fallfish, and for birds and bats | HBPW/invertebrates_plankton_plants §3 |
| Other mayflies: *Caenis*, *Ephemera*, *Callibaetis*, *Leptophlebia*; heptageniids in brook riffles | LK | C | Grazers and collectors; young-bass food; June–August emergence | W3D/littoral_invertebrates, brook_food_web §2 |
| **Caddisflies**: lake Phryganeidae, Polycentropodidae, Leptoceridae (*Oecetis*), Limnephilidae; **net-spinning Hydropsychidae in the brook** | LK | C; **D in the brook outlet reach** (gk for taxa in the lake) | Outlet filterers peak 40–160 m below a lake outlet, so the whole brook is in that zone. They are dace and fallfish food. Shredders in leaf packs | W3D/brook_food_web §1–2; STRM/lake_outlet_stream_ecology §1 |
| **Black flies** (Simuliidae) | LK | **D in the brook in spring** (gk for timing) | Filter lake seston at the outlet (they remove 21–30% of phytoplankton per 100 m when dense). Adults bite; ***Simulium annulus* feeds on loons** | W3D/brook_food_web §1 |
| Stoneflies | LK (brook only; few, because the water is warm) | R | Riffle shredders and predators | W3D/brook_food_web (brief) |
| **Dragonflies and damselflies**: *Epitheca*, *Leucorrhinia*, *Libellula*, *Aeshna*, *Anax*, *Sympetrum*, Gomphidae, Macromiidae; *Enallagma*, *Ischnura*, *Lestes*; *Calopteryx* in the brook (gk for the species list) | LK | C (~100 larvae/m² in lentic littoral) | Predators of zooplankton, chironomids, fish larvae and each other. Prey of fish (depressed by fish). Emerge late May–August on emergent stems. Adults hunt emerging insects. **No regional species list in the notes** | W3D/littoral_invertebrates §4, §6; W3D/lily_pad_fauna §4 |
| Alderflies *Sialis* (in mud), fishflies and dobsonflies (brook) | LK (gk) | O | Large benthic predators; fish food | none |
| **Water beetles** (Dytiscidae, Gyrinidae whirligigs on the surface, Haliplidae on plants, Hydrophilidae) | LK (gk) | C | Predators and scavengers; whirligig rafts at the shore; large dytiscids take tadpoles and fish larvae | none |
| **True bugs**: water striders (Gerridae), backswimmers (Notonectidae), water boatmen (Corixidae), giant water bugs (Belostomatidae), water scorpions (*Ranatra*) | LK (striders noted on lily pads) | C | Surface and water-column predators of fallen insects, larvae and tadpoles. Food for small sunfish and fishing spiders | W3D/lily_pad_fauna §3 (striders, backswimmers); others none |
| **Pad and stem herbivores**: lily leaf beetle *Galerucella nymphaeae*, reed beetles *Donacia/Plateumaris*, *Bellura* borer moths, aquatic caterpillars *Parapoynx*/*Elophila*/*Synclita*, lily aphid, planthopper *Megamelus* | LK | C on floating-leaved beds Jun–Sep | Eat 3–6% of floating-leaf production. Drowned stages and swimming *Bellura* larvae become fish food | W3D/lily_pad_fauna |
| Mosquitoes (incl. *Coquillettidia* larvae tapping emergent roots, gk), biting midges, horse- and deer-fly larvae in margins | LK | C | Larvae are fish and newt food; adults feed swallows, bats and dragonflies | none (passing mentions only) |
| **Water mites** (Hydrachnidia) | LK (gk) | C | Predators of microcrustaceans; parasitise insects as larvae | none |
| **Fishing spider** *Dolomedes triton*; shore orb-weavers (Tetragnathidae) | LK | C (≈0.2–0.5/m² of emergent and floating edge, placeholder) | Eat striders, backswimmers and emerging insects; small sunfish eat them | W3D/lily_pad_fauna §3; SHORE/land_lake_subsidies §6 |
| **Freshwater sponges** (*Spongilla lacustris*, *Eunapius*, *Ephydatia*) and spongillaflies (Sisyridae) | LK (gk) | ? | Filter bacteria and fine seston on wood, stones and pad undersides. Host spongillafly larvae | W3D/lily_pad_fauna §3 (mention); none |
| **Bryozoans** (*Plumatella*, *Fredericella*, *Cristatella mucedo*, *Pectinatella magnifica*) | LK (gk) | ? | Colonial filter-feeders on wood and plants; statoblasts overwinter | W3D/lily_pad_fauna §3 (mention); none |
| *Hydra*; freshwater jellyfish *Craspedacusta* | LK (*Hydra*, gk) / unknown (*Craspedacusta*) | ? | Predators of zooplankton and fish larvae | none |
| Spiny water flea *Bythotrephes*, zebra mussel, Asian clam | UN (zebra mussel and Asian clam absent from Maine; zebra mussel excluded by low Ca) | — | Invasion risks | HBPW/maine_freshwater_mussels; CAL/zooplankton_dynamics (*Bythotrephes* in general) |

## 6. Zooplankton

| Taxon | Ev. | Ab. | Role | Note |
|---|---|---|---|---|
| **Calanoid copepods**: *Leptodiaptomus minutus* (28% of pooled biomass in lakes ≤ 250 km of Danforth), *Epischura lacustris* (3.5%), *Skistodiaptomus pygmaeus* | RG (LakePulse NB, NS and QC lakes) | **D** | Grazers of small algae. Dominate in soft water and under ice. Food of larval fish | HBPW/invertebrates_plankton_plants §4; CAL/copepod_daphnia_coexistence, zooplankton_dynamics |
| **Cyclopoid copepods**: *Mesocyclops edax* (19%), *Cyclops scutifer*, *Tropocyclops*, *Diacyclops*; **nauplii** | RG | **D–C** | Omnivores that prey on rotifers, nauplii and fish larvae. Nauplii are the first food of fish larvae | as above |
| ***Daphnia***: *D. catawba* (11.5%), *D. galeata mendotae* (9%), *D. pulicaria* | RG | C, variable (≤ 25%; absent in ~30% of regional lakes) | Large grazers that make the spring clear-water phase. **Crash under young perch, white perch and alewife predation** from late May. Limited by low Ca | as above; HBPW/sea_run_alewife §3 |
| ***Holopedium*** (jelly-coated, soft-water specialist) | RG (30–43% of regional lakes) | O–C | Replaces *Daphnia* where calcium falls ("jellification"). Poor fish food | HBPW/invertebrates_plankton_plants §4 |
| *Bosmina longirostris*, *Diaphanosoma*, *Ceriodaphnia*, *Sida*, *Leptodora* (predatory), *Polyphemus*; **littoral chydorids** (*Chydorus*, *Alona*) in weeds | RG / LK | C | Small grazers that survive fish predation. Weed-bed microcrustaceans feed young sunfish and bladderworts | CAL/zooplankton_dynamics; W3D/bladderwort_isoetid_chemistry |
| **Rotifers**: *Keratella*, *Kellicottia*, *Polyarthra*, *Conochilus*, *Asplanchna* | RG / LK | C (~¼–⅓ of crustacean biomass) | First food of larval fish; grazers of bacteria and small algae | HBPW/invertebrates_plankton_plants §4; CAL/zooplankton_dynamics |
| **Ciliates and heterotrophic nanoflagellates** | LK | C | The microbial loop: they eat bacteria and are eaten by copepods and rotifers. They matter in DOC-rich water | CAL/copepod_daphnia_coexistence (brief) |
| **Resting eggs** and dormant copepodites in the mud | LK | — | Carry the populations over winter and through fish crashes | CAL/zooplankton_dynamics |

**Planktivores ranked:** age-0 perch and white perch, alewife young (when present), *Chaoborus*, odonates in weeds, bladderworts, killifish and young sunfish.

## 7. Algae, microbes, fungi, parasites and disease

| Taxon or group | Ev. | Ab. | Role | Note |
|---|---|---|---|---|
| **Diatoms**: *Asterionella*, *Tabellaria*, *Aulacoseira*, *Cyclotella*, *Fragilaria* (gk for genera) | RG ("most Maine lakes have a diatom bloom in spring and fall") | D in spring and fall | Silica-limited spring pulse after ice-out; best food for *Daphnia* | HBPW/invertebrates_plankton_plants §5; MLPS/maine_limnology_streams §6 |
| **Chrysophytes** (*Dinobryon*, *Synura*, *Mallomonas*, *Uroglena*) and **cryptophytes** (*Cryptomonas*) | LK (gk: typical of soft, coloured, low-P NE lakes and of under-ice flagellate communities) | C–D | Mixotrophs that eat bacteria; good grazer food | **none** |
| **Dinoflagellates** (*Peridinium*, *Ceratium*); **raphidophyte *Gonyostomum semen*** (nuisance in brown lakes) | LK (gk) / unknown | ? | *Gonyostomum* migrates vertically, is inedible and causes swimmer skin irritation in brown lakes | **none** |
| **Greens and desmids** (*Staurastrum*, *Cosmarium*, *Closterium*, *Sphaerocystis*) | LK (gk: desmids are rich in soft water) | C in summer | — | **none** |
| **Cyanobacteria**: *Dolichospermum* (*Anabaena*), *Microcystis*, *Aphanizomenon*, **colonial *Gloeotrichia echinulata*** (blooms from sediment in low-nutrient New England lakes, gk), picocyanobacteria | RG (Maine autumn *Anabaena* blooms after turnover; statewide cyanobacteria trend) | O (late-summer pulses in calm, warm spells) | **N-fixers.** Possible toxins. *Gloeotrichia* carries sediment P up into the water | HBPW/invertebrates_plankton_plants §5, recent_maine_research §3e; genus-level none |
| **Periphyton**: epiphyton on plants, epilithon on brook and shore stones (5–17 mg chl-a/m² open canopy), epipelon on mud; **metaphyton** (*Mougeotia*, *Zygnema*, *Spirogyra* mats in soft water, gk) | LK | C | A major base for snails, mayflies, chironomids and young fish in clear, littoral lakes like these. Shaded out under the brook's alders in summer | W3D/brook_food_web §2, plant_species_traits; CAL/whole_lake_energy_flow; SHORE/land_lake_subsidies §5 |
| **Bacteria and the microbial loop** (DOC-fuelled heterotrophs, nitrifiers including winter nitrification, methanogens and methanotrophs in the mud, iron bacteria, N-fixers) | LK | D (processes) | Respire terrestrial DOC, so brown lakes run net-heterotrophic. Drive under-ice O₂ loss and sediment P release. Remineralise | CAL/whole_lake_energy_flow; W3D/oxygen_metabolism; fetched Gemini (Cavaliere & Baulch winter nitrification) |
| **Fungi**: aquatic hyphomycetes on leaf litter, chytrid parasites of diatoms and cyanobacteria, ***Saprolegnia*** water mould on eggs and stressed winter fish | LK (gk) | C | Leaf conditioning for shredders (alder litter fast, conifer slow). Chytrids pass algal carbon to zooplankton. *Saprolegnia* kills eggs in cold water | SHORE/land_lake_subsidies §2 (decay); *Saprolegnia* in CAL/forage_fish_early_life (one line); otherwise none |
| **Mussel glochidia** on fish gills and fins | HB/RG (the hosts and mussels are here) | C each June | Larval parasitism that disperses mussels; rarely harms fish | HBPW/invertebrates_plankton_plants §2 |
| **Black spot** (*Uvulifer ambloplitis*, *Crassiphiala*; kingfisher → snail → fish), **yellow grub** (*Clinostomum marginatum*; heron → *Helisoma* → perch and sunfish), **white grub** (*Posthodiplostomum minimum*; heron → *Physa* → sunfish), **eye fluke** *Diplostomum* (gulls) | LK (gk; very common in NE warm-water lakes; anglers call perch "grubby") | C | Couple birds, snails and fish. Heavy infections cut juvenile survival. Snail scarcity in soft water may limit them | **none — needs research** |
| **Bass tapeworm** *Proteocephalus ambloplitis* (copepod → small fish → bass; damages bass gonads); **pike tapeworm** *Triaenophorus* (copepod → perch → pickerel); *Ligula* (gulls) | LK (gk) | ? | Parasitic castration and reduced fecundity of bass | CAL/largemouth_bass (one mention); otherwise none |
| Fish lice *Argulus*, anchor worm *Lernaea*, leeches on fish, *Ichthyophthirius*, columnaris, largemouth bass virus (also infects smallmouth), *Heterosporis* (perch microsporidian) | LK (gk) | ? | Disease mortality, mostly in warm-water stress or spawning stress | **none** |
| ***Anguillicola crassus*** (eel swim-bladder nematode) | RG: Pennamaquan Lake, Washington Co., 3 of 3 eels | — | Reduces silver-eel migration fitness | HBPW/drainage_species_and_eel §3 |
| **Swimmer's itch** (avian schistosomes *Trichobilharzia*; merganser → *Stagnicola* snail) | LK (gk; the merganser host is confirmed here) | ? | Links mergansers, snails and swimmers | **none** |
| Amphibian disease: ranavirus, chytrid (*Bd*); turtle leeches | LK (gk) | ? | Tadpole die-offs | **none** |

---

## 8. Aquatic plants, mosses and charophytes

**Context.** The only in-lake plant specimens ever collected are two stoneworts from one 30-minute visit to Upper's boat launch on 15 Jul 2015. The owner confirmed there is **no Lakes of Maine plant list** for these lakes. Everything else below comes from:
- regional records within ~50 km (GBIF and iNaturalist pull of 151 sites);
- the MNAP community types;
- Hellquist's alkalinity groups;
- the NWI wetland classes;
- the NAIP near-infrared fringe;
- the owner's photos.

**Where the beds are.** Aerial near-infrared shows floating and emergent plants as a thin fringe only: ~2.3 ha in Upper (0.6%) and ~0.8 ha in Lower (0.3%). They sit at Upper's south end and western coves, and on Lower's north, east and west shores. Submerged and charophyte beds are invisible from the air and unmeasured. They probably carry most of the plant biomass on the 0.3–4 m mud.

**Tiers** (from `HBPW/plant_species_hot_brook.md`):
- **A** recorded;
- **B** near-certain;
- **C** likely;
- **D** possible;
- **X** exclude.

### 8a. By growth form

| Taxon | Ev. (tier) | Where | Ab. | Role | Note |
|---|---|---|---|---|---|
| ***Nitella flexilis* (aff.)**, ***N. tenuissima* (aff.)** (stoneworts) | **HB (A)**: Sleith 2015 specimens, Upper S end, ~10 m from shore; fertile in July | probably low meadows on the mud floors to the light limit (~3–4 m) of both lakes | ? (two species in 30 min suggests not rare) | Deep low meadow; dense invertebrate habitat per gram; sediment stabiliser; P sink. The same pair occurs at Wytopitlock Lake | HBPW/plant_species_hot_brook §1–2; W3D/macrophytes, weed_bed_structure |
| *Chara braunii* | RG (Molunkus, Duck Lake) | — | ? | Charophyte; minor | HBPW/plant_species_hot_brook §2 |
| **Water moss** *Fontinalis* (*novae-angliae*, *dalecarlica*, *antipyretica*, *sphagnifolia*) | **LK**: the owner's photo shows a dark tuft on a brook-mouth riffle stone; regional records include one at the East Musquash lake–stream junction | **brook riffle stones**; rocky lake shallows | C in the brook (inf) | The brook's main plant. Habitat for blackflies, hydropsychids, chironomids and dace food. Lake-outlet steady flow suits it | HBPW/plant_species_hot_brook §4; W3D/brook_food_web |
| *Sphagnum*, other mosses (*Drepanocladus*, *Dichelyma* on flood-washed alder stems) | LK (fen mats; *Dichelyma* at Mattagodus Stream) | fen and bog margins (PSS3 leatherleaf bog 380 m W of Upper) | ? | Peat formation, acidity and DOC source | HBPW/plant_species_hot_brook §4; SHORE/shore_geometry_and_vegetation |
| **Isoetids**: pipewort *Eriocaulon aquaticum*, water lobelia *Lobelia dortmanna*, spiny-spored quillwort *Isoetes echinospora* (also *I. lacustris*, *I. tuckermanii*), needle spikerush *Eleocharis acicularis*, *Littorella uniflora*, *Elatine minima*, *Sagittaria graminea* rosettes, *Ranunculus flammula* | **LK (B–C)**. MNAP pipewort–lobelia bed is the type on mineral shallows. Regional: Topsfield, Lambert, East Musquash, Spednic (NB) | sand and rock shelf at 0.3–1 m: Upper's NE sand beach, rocky points, Lower's broad W and NE flats. The owner's dock shore is bare to ~0.6 m (wave and ice scour) | C (sparse cover, low biomass) | Evergreen under ice. **Radial O₂ loss oxidises sediment and keeps P bound.** Low invertebrate density. Sensitive to siltation and browning | W3D/bladderwort_isoetid_chemistry, plant_species_traits; HBPW/plant_species_hot_brook |
| **Floating-leaved**: fragrant water-lily *Nymphaea odorata*, yellow pond-lily *Nuphar variegata*, watershield *Brasenia schreberi*, floating pondweed *Potamogeton natans*, ribbon-leaf pondweed *P. epihydrus*, Oakes' pondweed *P. oakesianus*, floating bur-reeds *Sparganium angustifolium* / *S. fluctuans*, little floating-heart *Nymphoides cordata*, water smartweed *Persicaria amphibia* | **LK (B)**. NIR fringe; NWI wetland-backed shores; regional frequencies (*Nymphaea* 9%, *Nuphar* 6%); Drew Plt deadwater 2024 | sheltered organic coves at 0.5–1.8 m (Upper S and W; Lower N and E); pools of the brook (*P. epihydrus*, bur-reed, *Nuphar*) | C locally, small in area | Cover for pickerel and sunfish. **Pad fauna**: *Galerucella*, *Donacia*, *Bellura*, *Parapoynx*, aphids, fishing spiders. Rhizome reserves. Methane venting through aerenchyma. Turtle basking mats. Moose and muskrat food | W3D/lily_pad_fauna, plant_species_traits, weed_bed_*; HBPW/plant_species_hot_brook |
| **Submerged pondweeds**: *P. spirillus*, *P. robbinsii*, *P. gramineus*, *P. amplifolius*, *P. pusillus* / *berchtoldii*, *P. praelongus*, *P. perfoliatus*, *P. obtusifolius*, *P. vaseyi*, *P. alpinus* (cold-stream; possible in the brook only) | LK (C–D); Hellquist Groups I–III fit alkalinity ~6–10 mg HCO₃⁻/L | 1–3 m mud | ? | Weed-bed structure, epiphyton substrate, spawning substrate (perch strands, sunfish) | HBPW/plant_species_hot_brook §2; W3D/spawning_on_plants |
| **Bladderworts** *Utricularia vulgaris/macrorhiza*, *U. intermedia*, *U. purpurea*, *U. gibba*, *U. minor*, *U. radiata*; *U. cornuta* on wet sand | LK (B); the owner's May 2024 photo of fine-leaved brook shoots is either bladderwort or milfoil | among lilies and on cove mud at 0.5–2 m | C (inf) | **Carnivorous, rootless**: traps cladocerans, copepods, ostracods and young larvae. Competes with fish larvae for zooplankton; dense cover | W3D/bladderwort_isoetid_chemistry |
| **Milfoils** (native) *Myriophyllum humile*, *M. alterniflorum*, *M. tenellum*, *M. verticillatum* | LK (C) | soft coves; *M. alterniflorum* in rocky flowing water | ? | Fine-leaved cover; high epiphytic invertebrate density | HBPW/plant_species_hot_brook |
| *Najas flexilis*, *Elodea canadensis*, *Vallisneria americana*, submersed bulrush *Schoenoplectus subterminalis*, water-starwort *Callitriche palustris* (brook margins) | LK (C–D) | soft bottoms 0.5–2 m; *Callitriche* on brook bars | ? | Submerged canopy; annual *Najas* gains after disturbance | HBPW/plant_species_hot_brook §2, §4 |
| **Emergents**: round-stemmed bulrush *Schoenoplectus* (soft-stem or hardstem), pickerelweed *Pontederia cordata*, water horsetail *Equisetum fluviatile*, wool-grass *Scirpus cyperinus*, sedges (*Carex lasiocarpa*, *C. utriculata*, *C. retrorsa*), three-way sedge *Dulichium*, spikerushes *Eleocharis palustris* / *robbinsii*, arrowheads *Sagittaria latifolia* / *cuneata*, bur-reeds *Sparganium americanum* / *emersum*, bogbean *Menyanthes*, bluejoint *Calamagrostis canadensis* | **HB (bulrush, owner photo Jul 2026)**; the rest **LK (B)** | shore fringe at 0–0.7 m; bulrush beds 0.15–1 m near the inlet and outlet; the 1.6-ac marsh at Lower's N end | C locally | Odonate emergence stems; *Donacia/Plateumaris* hosts; bird nesting cover (red-winged blackbird, swamp sparrow); muskrat food; pickerel spawning when flooded in spring | SHORE/shore_geometry_and_vegetation §2; HBPW/plant_species_hot_brook |
| Cattails *Typha latifolia*; narrow-leaved *T. angustifolia* | LK minor; *T. angustifolia* is a USGS-NAS record at Danforth on Baskahegan Stream (non-native / cryptogenic) | coves, road ditches | R | Muskrat food and lodges; an invader of disturbed margins | HBPW/plant_species_hot_brook §5 |
| Wild rice *Zizania palustris / aquatica* | RG (Drew Plt, North Lake NB, regional) | — | ? (D) | Waterfowl food | HBPW/plant_species_hot_brook |
| Duckweeds *Lemna*, *Spirodela*; blue flag *Iris versicolor*; bladder sedge; *Leersia* | LK minor (not examined for Hot Brook) | beaver ponds, sheltered fen pools | ? | Minor | none (duckweed in W3D/plant_species_traits only generically) |
| Riverweed *Podostemum ceratophyllum* | UN (fast-water river plant; 2 Washington Co. records; brook current marginal) | — | — | — | HBPW/plant_species_hot_brook §4 |
| **Invasive aquatic plants** | **None recorded** (DEP map read in the built-in browser: neither lake infested). The nearest threat is **variable water-milfoil** *M. heterophyllum* in Big Lake, Princeton (2019; ~54 km S, St. Croix drainage). Curly-leaf and sago are excluded by soft water. An unverified iNat curly-leaf record exists at Lee (40 km) | — | — | Boat-launch introduction risk at Upper's south-end landing | HBPW/plant_species_hot_brook §5, recent_maine_research |

### 8b. Shore, wetland and upland vegetation that feeds the lake

| Group | Ev. | Role in the lake | Note |
|---|---|---|---|
| **Shrub fringe**: sweet gale *Myrica gale* (owner photos; Danforth 2025 record), speckled alder *Alnus incana* (owner photos), leatherleaf *Chamaedaphne*, meadowsweet *Spiraea alba*, willows (*Salix petiolaris*, Danforth 1938), buttonbush *Cephalanthus* (Drew Plt), winterberry *Ilex verticillata* (LK) | HB (gale, alder) / LK | **Alder fixes N** (N-rich, fast-decaying litter). It shades the brook (60–90% closure inferred) and supplies terrestrial insects (alder ≫ conifer), root cover and undercut banks. Sweet gale also fixes N | SHORE/shore_geometry_and_vegetation §2–3; SHORE/land_lake_subsidies §1–2, §5 |
| **Forested swamps and upland**: red spruce, black spruce, balsam fir, northern white cedar (owner photo, dock shore), tamarack (PFO4 swamps, 237 ac at Upper's S end), white pine, eastern hemlock, red maple (PFO1 swamps), paper, yellow and gray birch, aspen | HB (MDIFW "spruce fir forest"; NWI classes; owner photos) / LK for species | **Leaf litter** (~300 g leaves/m²/yr under canopy; mid-October pulse; most within 10 m of shore). **Pine pollen** (P pulse mid-May–June). **Insect fall-in** (peak Jul–Aug). **Coarse woody habitat** (300–600 logs/km on undeveloped shores). DOC and colour from wetlands. Shading. **Conifer needles decay slowly** | SHORE/land_lake_subsidies; SHORE/shore_geometry_and_vegetation §6 |
| Ferns and herbs on brook bars and banks: sensitive fern (owner photo, dry year 2025), ostrich fern, bluejoint, grasses on exposed lake-shore stones | HB (owner photos) | Colonise exposed bars in low-water years; flood-scour annually | HBPW/plant_species_hot_brook §6 |

## 9. Land–water exchanges (the lake is not closed)

| Flux | Direction | Size and timing | Note |
|---|---|---|---|
| Terrestrial insects (beetles, ants, caterpillars, spiders) | in | ~50 mg dry per m of forested bank per day at the Jul–Aug peak, spread over the first 5–15 m of water. Alder banks ≫ conifer; developed shores ×0.05–0.2. A large share of the diet of fallfish and surface feeders | SHORE/land_lake_subsidies §1 |
| Leaf litter, needles, twigs | in | ~300 g leaves/m²/yr under canopy, mostly within 10 m of shore. Mid-October pulse. The brook receives full litterfall | SHORE/land_lake_subsidies §2 |
| Pine pollen | in | P pulse of ~0.3–1.7 mg P/m²/day for ~45 days after ice-out (mid-May–June) | SHORE/land_lake_subsidies §4 |
| DOC and colour from wetlands | in | Snowmelt and storm pulses; 15% of the catchment is wetland | SHORE/land_lake_subsidies §3 |
| Emerging insects | out | 0.5–2 g dry/m²/yr from the littoral. Most stays on land within 100 m and feeds swallows, bats, spiders and dragonflies | SHORE/land_lake_subsidies §6 |
| Fish and mussels eaten by eagles, ospreys, loons, herons, otters, mink, raccoons, mergansers and anglers | out | Seasonal; a loon family ~2.5 kg fish/day; an otter 1.2–1.8 kg/day | SHORE/shore_birds_and_mammals |
| Alewife adults and young | in / out | Marine P in, juvenile export out | HBPW/sea_run_alewife |
| Amphibian metamorphs, turtle nesting trips, beaver wood | both | Spring and summer | SHORE/turtles_and_frogs |

---

## 10. Processes

Evidence codes as above. "Status" says how well the process is known for Hot Brook itself.

### 10a. Physical: ice, heat, wind, light, water

| Process | What happens at Hot Brook | Ev. | Note |
|---|---|---|---|
| **Ice cover** | Ice-on ~late Nov–mid Dec. Ice-out ~Apr 15–28: recent East Grand ice-outs were Apr 12–21 (2021–26), and the West Grand 1979–2008 mean was Apr 24. ~135–150 ice days. Ice 30–70 cm, often with slush and white snow-ice. **Snow controls under-ice light** (1–12% transmission), and with it under-ice photosynthesis and O₂. Inverse stratification (0–1 °C under the ice, ~4 °C at the bottom). Radiatively driven convection in late winter | RG (East and West Grand ice-out records; NWS ice) | SHORE/weather_and_catchment_hydrology §5; MLPS/maine_limnology_streams §3; HBPW/gemini_hot_brook_checked row 9 |
| **Ice push and ice scour** | Ice-push ramparts 0.5–1.5 m high on gently sloping till and gravel shores of 0.8–4 km lakes, exactly this size class. Scour keeps the 0–0.3 m (to ~0.6 m) wave-and-ice zone bare. The brook's riffles stay open longer than the lakes | LK (owner: bare cobble to 0.6 m at the dock shore) | SHORE/shore_geometry_and_vegetation §1; HBPW/plant_species_hot_brook §6 |
| **Thermal regime** | Unstratified and polymictic all summer: late-August profiles in analogue lakes are uniform at 19–24 °C with 7.6–8.9 mg/L O₂ at the bottom. Surface peak ~24 °C at the end of July; heat waves push it to 28–30 °C. Night convection. Spring warm-up is fast. **The brook is Upper's surface water**, with a diel swing of ~1.5–3 °C, rising to 4–7 °C in drought pools at 27–30 °C | HB (1949: "does not stratify"; 74 °F in Aug 1949) / RG | HBPW/maine_dep_lakes_data_2025; STRM/lake_outlet_stream_ecology §2; W3D/shallow_lake_3d_physics |
| **Wind, waves, resuspension, seiches** | Mean wind 2.5–4 m/s: windiest Mar–Apr, calm Jul–Aug (calm 17–19% of hours). Forest edges shelter ~0.75–1 km of water. Fetch is 2–3.4 km along each lake. Wave-washed rocky shores carry sparse rosettes, and sheltered coves the lily beds. Wind resuspends mud in 2–4 m water, raising turbidity and recycling P. Surface seiches are small; there are no internal seiches because there is no thermocline | RG / LK | SHORE/weather_and_catchment_hydrology §6; W3D/shallow_lake_3d_physics |
| **Light and colour (DOC)** | Secchi ~3.5–4.5 m. The owner says the water is "a bit clearer" than the sim's. Colour 18–46 PCU, mostly from wetland DOC. Kd scales ~DOC^0.45. Light reaches most of the bed, so the lakes are largely littoral. Browning trend +0.5 mg/L DOC per decade (NE US) | RG (Faulkner, North, Baskahegan lakes) / owner | HBPW/hot_brook_lake_records, maine_dep_lakes_data_2025, invertebrates_plankton_plants §5; SHORE/land_lake_subsidies §3 |
| **Hydrology and flushing** | **Main inflow is Hot Brook on Upper's south shore** (~36 km², ~0.74 m³/s mean), plus smaller south-shore streams. Upper drains through the connecting brook, which carries ~85% of Lower's inflow, and Lower drains north to Baskahegan Stream. Flushing: Upper ~3.5×/yr (~100 d residence), Lower ~6.6×/yr (~55 d). Snowmelt freshet mid-April at 3–4× mean flow; Aug–Sep low at 0.2–0.4×; drought ~0.02×; a second high in Nov–Dec | HB (derived from NHD and StreamCat) | HBPW/hot_brook_lake_records, gemini_hot_brook_checked row 4d; SHORE/weather_and_catchment_hydrology §2 |
| **Lake level and dry years** | Natural outlets with no dam. Level varies ~0.3–0.5 m a year: high after ice-out, low in Aug–Sep. Storms add 2–10 cm. The outlet is a "fill-and-spill" threshold. **Dry year (24 Aug 2025, owner photos): the brook was nearly dry**, with riffles walkable and lake shores exposed. In such years the lakes are cut apart and fish are trapped in the brook pools, which heat and lose O₂ | HB (owner) / RG | SHORE/weather_and_catchment_hydrology §3; STRM/lake_outlet_stream_ecology §4; W3D/brook_food_web §5 |
| **Storms** | ~15–20 thunderstorms a summer (Jun–Aug) and occasional hurricane remnants (90–200 mm). 50–80% of annual P, DOC and sediment arrives on storm and melt days. Storms bring turbidity and colour pulses, post-storm heterotrophy and O₂ dips, fish movement pulses through the brook, and young alewives leaving | RG | SHORE/weather_and_catchment_hydrology §4, §9 |
| **Groundwater** | Share unknown (default 10–30% of inflow). Cold seeps would be summer refuges and winter open patches, and a baseflow floor for the brook pools | LK | SHORE/weather_and_catchment_hydrology §8 (no Hot Brook data) |
| **Fog and steam fog** | On still autumn mornings and summer dawns. Cosmetic | RG | SHORE/weather_and_catchment_hydrology §7 |

### 10b. Chemistry, nutrients and contaminants

| Process | What happens | Ev. | Note |
|---|---|---|---|
| **Phosphorus and nitrogen loading** | Export coefficients in kg TP/ha/yr: forest 0.04, wetlands 0.10–0.20, harvested forest 0.40 for a few years, camps and roads 0.25–2.7, atmospheric 0.16 on open water. Most arrives at snowmelt and in storms. No measured Hot Brook TP; analogues run 9–12 µg/L. N export is unsourced for Maine | RG | SHORE/land_lake_subsidies §7; HBPW/hot_brook_lake_records |
| **Internal recycling** | Oxic, mixed bed all summer, so no anoxic P release. Recycling happens through resuspension, mineralisation in the warm sediment, macrophyte uptake and senescence, and fish and mussel excretion. Isoetids oxidise the sediment | LK | W3D/oxygen_metabolism, bladderwort_isoetid_chemistry, shallow_lake_3d_physics |
| **Biological P transport** | Alewife adults import marine P (~0.97 g each) and their emigrating young export it. White sucker spawning runs move P. Insect emergence exports 0.5–2 g dry/m²/yr to land. Terrestrial insects, pollen (P pulse after ice-out), leaf litter and bird guano import it | RG | HBPW/sea_run_alewife; SHORE/land_lake_subsidies §1, §4, §6 |
| **Oxygen** | Summer: saturated, top to bottom. Weed-bed dawn sags are plausible but undocumented. **Under ice: whole-column O₂ falls >50% by late winter when ice comes early**; snow cover decides how far. True winterkill is reserved for 1–2 m ponds, but shallow coves and the brook pools could approach it. Hypoxia also hits the drought pools | RG / LK (**no Hot Brook DO data exist**) | SHORE/weather_and_catchment_hydrology §5; MLPS/maine_limnology_streams §5; HBPW/gemini_hot_brook_checked |
| **Calcium, acidity and soft water** | Ca ~2–4 mg/L (Pleasant, Skitacook). DEP notes legacy calcium depletion "Down East". This limits snail size and diversity, crayfish (owner: "not common"), *Daphnia* (favouring *Holopedium* and copepods) and mussel shell growth. pH ~6.6–7.0 | RG | HBPW/recent_maine_research §2; W3D/littoral_invertebrates §2 |
| **Mercury** | Statewide fish-consumption advisory for all inland waters (atmospheric Hg; highest in pickerel and bass). The Northeast is a biological Hg hotspot, carried up to loons and eagles | RG | none for Hot Brook (DEP fish-tissue Hg exists for Baskahegan and Brackett 2011, HBPW/hot_brook_lake_records) |
| **Methane and carbon** | Shallow mud lakes ebullate methane; lily aerenchyma vents it. Brown lakes are often net heterotrophic, and storms push them further | LK | W3D/plant_species_traits (brief), oxygen_metabolism; **none** for ebullition rates |

### 10c. Biological processes

| Process | What happens at Hot Brook | Ev. | Note |
|---|---|---|---|
| **Spawning calendar** | Pickerel at ice-out (6–11 °C, flooded vegetation). Yellow and white perch Apr–May (10–15 °C). White sucker runs into streams after ice-out. Alewives mid-May–June (13–16 °C peak). Fallfish mounds late May–mid June (15–19 °C). Smallmouth late May–June (15–18 °C; some spawn in the brook). Sunfish and bullhead June–July. Dace ~21 °C (~20 June). Killifish summer | RG / LK | per-species notes in §1; W3D/spawning_on_plants, fallfish_spawning_brook; SEAS/* |
| **Spawning runs up and down the brook and inlets** | White sucker and fallfish into the brook and inlets. Some smallmouth spawn in the brook and stay all summer. White perch may make night runs. Pickerel runs are possible only if spring floods the margins. Runs are "trickles over weeks", not mass pulses | HB (owner: "everything swims through the brook") / RG | STRM/movement_between_connected_lakes Q3; W3D/fallfish_spawning_brook Q5; STRM/bass_pickerel_in_connecting_streams |
| **Sea-run alewife migration** | Adults come up the Penobscot, past Milford and West Enfield, up the Mattawamkeag and Baskahegan Stream, then up Hot Brook's ~3 km outlet into Lower and probably through the brook into Upper, mid-May–June. Survivors leave within 1–4 weeks; adult freshwater mortality in Maine is 32–90%. Young emigrate Jul–Dec in rain pulses; any left at ice-on die | HB (2024 chart, Lower) | HBPW/sea_run_alewife |
| **Eel migration** (if present) | Glass eels and elvers arrive over years; yellow eels stay 7–20+ yr; silver eels emigrate in autumn (~22% dam mortality at West Enfield and Milford) | RG | HBPW/drainage_species_and_eel §3 |
| **Lake-to-lake movement and emigration** | Two linked populations, not one. Movement between the lakes is mostly suckers and bullheads (~0.1–1% of tagged fish per year); pickerel make summer excursions. There is a pulsed **downstream flux of young centrarchids**, Upper → Lower and Lower → outlet, in spring and on storms, likely low thousands a year. Brook residents form a third, tiny local population (sunfish, small bass). **Emigration over Lower's outlet into Baskahegan Stream is a loss term**, and so is the alewife young's exit | HB (owner) / RG | STRM/movement_between_connected_lakes; W3D/movement_between_lakes |
| **Glochidia–host links** | Elliptio broods short-term and releases glochidia in June onto perch, sunfish, bass, sucker and killifish. Eastern floater broods long-term. Yellow lampmussel uses **white perch** and yellow perch. Tidewater mucket uses white perch and killifish. Brook floater uses dace and pumpkinseed. Alewife floater uses alewife. Mussel recruitment is therefore tied to host abundance, and host fish carry the larvae between lakes | RG / HB (yellow lampmussel record in Upper) | HBPW/maine_freshwater_mussels, invertebrates_plankton_plants §2, gemini_hot_brook_checked |
| **Beaver engineering** | **NWI marks beaver-modified wetlands within 500 m of both lakes** (PEM1Eb ×4, PUBHb at Lower's N end, PUB/FO5Fb W of Upper). A dam on the brook would turn the riffles into a pond, block passage at low flow, keep water in a drought and add merganser habitat. Lodges give otters under-ice access. Beavers cut woody stems within ~30 m of water | HB (NWI "b" modifiers near the lakes) / RG | HBPW/plant_species_hot_brook §3; SHORE/shore_birds_and_mammals §7; STRM/lake_outlet_stream_ecology §5; MLPS/maine_limnology_streams §9 |
| **Herbivory on plants** | Lily beetles (*Galerucella*), reed beetles (*Donacia*), *Bellura* borers and aquatic caterpillars on the pads; crayfish (local); snails grazing periphyton; **muskrat** on emergents; **moose** on aquatic plants in summer; waterfowl (ring-necked duck, black duck, Canada goose) | RG / LK | W3D/lily_pad_fauna, plant_species_traits; SHORE/shore_birds_and_mammals §7 |
| **Insect emergence and fall-in** | Chironomids emerge from just after ice-out (main pulse mid-May–June, a second Aug–Sep), *Chaoborus* late May–July, odonates late May–August, *Hexagenia* late June–mid July at 18–21 °C, caddis June–August. ~30% of insect production emerges and most leaves the lake. Terrestrial insects fall in at ~50 mg dry/m of forested shore/day at the Jul–Aug peak | RG | W3D/littoral_invertebrates §4; SHORE/land_lake_subsidies §1, §6 |
| **Decomposition** | Leaf packs are processed by shredders and aquatic hyphomycete fungi (alder fast, conifers slow); half becomes FPOM. Sediment organic matter is respired by bacteria | RG | SHORE/land_lake_subsidies §2; W3D/brook_food_web §2 |
| **Density dependence, cannibalism, first-winter starvation** | Pickerel and bass cannibalism. Young-of-year starve over the 208-day cold season below threshold sizes. Scramble competition in young schools | RG | WINT/*; CAL/first_winter_mortality; W3D/pickerel_mortality_cannibalism |

### 10d. Human processes

| Process | What happens | Ev. | Note |
|---|---|---|---|
| **Angling (open water)** | South Zone water under special law: **all bass released alive**; white perch 25/day (set by citizen petition); **artificial lures only Oct 1–Dec 31**; otherwise general law, so pickerel, perch and others may be kept. Live baitfish are legal outside the lures-only window, which is a route for minnow introductions. Bass are caught 3–7 times a year each under catch-and-release; hooking mortality applies. Access is the town landing off Rte 169 at Upper's south end. The brook is non-navigable, so Lower is reached by walking or poling a boat through it | HB (2019, 2023 law books; MDIFW sheets) | HBPW/hot_brook_lake_records; HBPW/eastern_maine_relative_abundance Q2, Q6; fetched/gemini_2026-10-20_angling |
| **Ice fishing** | South Zone general law: lakes are open to ice and open-water fishing all year (2026 law book), so **ice fishing is legal once ice forms**; tip-ups and live bait outside Oct 1–Dec 31. Targets are pickerel, white perch, yellow perch and bullhead. No creel data | RG (law book) | SEAS/perch_pickerel_smallmouth_pumpkinseed (ice-fishing habitat); **none** for Hot Brook effort |
| **Shoreline development** | Camps along Upper's south shore (≥15 buildings in OSM; an outfitter with ~1 mile of frontage). Lower had no camps in 2004. Development removes coarse wood (~57 vs ~555 logs/km), cuts insect fall-in (×0.05–0.2), adds P from lots and roads, and disturbs loon nests | HB (MDIFW sheets, OSM) | SHORE/shore_geometry_and_vegetation §6–7; SHORE/land_lake_subsidies |
| **Forestry** | The catchment is ~70–73% forest, much of it managed timberland (e.g., the FSC-certified Baskahegan Company, ~100–150k acres around Danforth and Topsfield, using shelterwood cutting). Harvest raises P export ~10× for a few years; logging roads add sediment; spruce budworm outbreaks change insect fall-in | RG | SHORE/land_lake_subsidies §7 (coefficients); **none** for Hot Brook harvest history |
| **Roads, culverts, rail** | Rte 169 crosses the inlet ~2.5 km above Upper on a 17-ft pipe-arch culvert rated a "potential barrier". A railroad crosses Hot Brook below Lower (passability unknown). Neither lake has a dam | HB (Stream Habitat Viewer) | HBPW/drainage_species_and_eel §3, gemini_hot_brook_checked |
| **Dams downstream** | Milford and West Enfield both pass eels and alewives. The Danforth (Crooked Brook) dam fishway (built 2023) opens Baskahegan Lake, a competing alewife destination upstream | HB / RG | HBPW/drainage_species_and_eel §3–4 |
| **Wind energy** | The Stetson I and II wind farms (~2009–2010) on ridges off Rte 169 between Danforth and Springfield, visible from Upper. Turbines are ~1.3 mi from the Kittery Island eagle nest (LURC excerpt). Collision risk for eagles, migrating birds and bats | RG | HBPW/gemini_hot_brook_checked row 3; **none** for fatality data |
| **Climate change** | Ice-out 4–9 days earlier in the north since the 1800s; surface warming; browning; more heat waves (28–30 °C); the 2016, 2020 and 2025 droughts | RG | MLPS/maine_limnology_streams §3; HBPW/recent_maine_research §3 |
| **Invasion pathways** | Boats at the Upper landing carry plants (variable milfoil at Big Lake). Bait buckets carry minnows. Illegal stocking (largemouth, crappie, pike in the region) | RG | HBPW/plant_species_hot_brook §5, drainage_species_and_eel §5 |

---

## 11. What a lake simulation would usually omit, but matters here

1. **Sea-run alewife** (MDIFW 2024, Lower). A seasonal marine subsidy and forage pulse that collapses the large zooplankton for half the summer and then leaves.
2. **Freshwater mussels as dominant benthic biomass**: elliptio, plus the **Threatened yellow lampmussel recorded in Upper**. They filter the brook's seston and their recruitment is tied to specific host fish (white perch for the lampmussel).
3. **The lake-outlet brook as its own ecosystem**: filter-feeder caddis and black flies, Fontinalis, drift, resident sunfish, the big-bass ambush pool, a dry-year disconnection, and **beaver** dams.
4. **Soft-water calcium limits**: few crayfish, small thin-shelled snails, *Holopedium* over *Daphnia*. They reshape the diets of bass and pumpkinseed.
5. **Bird- and mammal-centred links**: an eagle nest on Upper's island, loons on islands harried by black flies, mergansers as swimmer's-itch hosts, kingfishers and herons as the final hosts of black-spot and grub parasites carried by snails and fish, otters cracking mussels, raccoons and foxes on turtle nests.
6. **Land subsidies and exports**: insect fall-in, leaf litter, pollen, and emergence feeding swallows and bats.
7. **The American eel** (probable but unseen): a nocturnal benthic predator with a 15–20-yr residence that ends in emigration.
8. **Charophyte meadows** (*Nitella*, the only plants ever collected here) and isoetid rosettes that oxidise the sediment, rather than the usual pondweed-and-lily picture.
9. **Ice and snow as ecosystem drivers**: snow sets under-ice light and O₂, and ice push and scour keep the shallows bare.
10. **People**: catch-and-release bass, the white perch bag limit, year-round ice fishing with live bait as an introduction route, camps on Upper's south shore, forestry, culverts, wind turbines and mercury.

## 12. Gaps that need dedicated research (ranked)

1. **No water measurements at all** for either lake: Secchi, colour, TP, Ca, DO, under-ice O₂. Everything comes from analogue lakes. Contacting Lake Stewards of Maine or DEP, or sampling once, would anchor the chemistry.
2. **Mussel species and density**: which species the owner's "lots of mussels" are; whether eastern floater, eastern lampmussel, tidewater mucket and the brook floater occur; elliptio density by depth and substrate. The MDIFW 2007 Freshwater Mussel Assessment (maine.gov, blocked to scripts) would settle the alewife floater and Lower's lampmussel.
3. **Parasites and disease**: black spot, yellow and white grub, bass and pike tapeworms, swimmer's itch, *Saprolegnia*, LMBV, amphibian ranavirus and Bd. **No note covers them.** They link birds, snails and fish.
4. **Phytoplankton and periphyton taxa**: no note gives eastern-Maine genera (chrysophytes, desmids, *Gloeotrichia*, *Gonyostomum*) or periphyton biomass on stones, wood and plants.
5. **The birds and bats of the site**: Maine Audubon loon counts for these lakes, eagle-nest status (LURC Stetson II Exhibit 11-13), eBird and Maine Bird Atlas blocks for Danforth, waterfowl and aerial insectivores, Maine bats after white-nose syndrome, and Stetson wind-farm fatality monitoring.
6. **Herps at county level**: the Maine Amphibian and Reptile Atlas town records for Danforth and Weston (mink frog, gray treefrog, leopard and pickerel frogs, four-toed and two-lined salamanders, water snake); confirming the wood turtle behind MDIFW's rare-animal records.
7. **Odonata and aquatic insects**: the Maine Damselfly and Dragonfly Survey species for Washington and Aroostook; water beetles, bugs, mites, Megaloptera; Maine *Hexagenia* density; black fly species and timing in the brook.
8. **Sponges, bryozoans, *Hydra*, leeches, flatworms**: whether they are present, and where.
9. **The eel question**: eel pots or eDNA in Lower, which would also test the dace's status and the passing "minnow" schools (young fallfish vs dace vs common shiner).
10. **Crayfish species**: virile vs spiny-cheek in the owner's photo, and density on cobble.
11. **Beaver on Hot Brook and the outlets**: current dams, past dams, and the condition of the railroad crossing and the 1949 fish-screen site.
12. **Groundwater and the lake-level record**: seeps, the outlet sill elevation, and the dry-year minimum.
13. **Human effort**: angling and ice-fishing effort, camp counts, harvest history in the catchment.
14. **The alewife run's size at Hot Brook**: no count exists for Baskahegan Stream or the Hot Brook outlet.

## 13. Sources that blocked scripted access (not bypassed)

- **www.maine.gov**: MDIFW survey sheets, the mussel assessment, the DMR alewife pages, LUPC/LURC Stetson II exhibits and the DACF ice-out pages. Some can be read by hand or in the app's built-in browser.
- **lakesofmaine.org**: a bot wall. It has no plant list for these lakes (owner, 2026-10-17).
- Publisher paywalls: Wiley, T&F, CSP, Springer, MDPI, journals.uchicago.edu.
- `docs/research_notes/blocked_sources_to_fetch.md` lists them in full.
- This compilation's own web searches stopped when the session's search budget ran out. That is why sections 2–7 carry **(gk)** flags.

## Key primary sources (all cited inside the notes above)

- MDIFW Upper and Lower Hot Brook Lake survey sheets (1949, rev. 1965, 2004); MDIFW *Lake Fish of Maine* (2007, Gulf of Maine KB 9008); MDIFW 2024 Lower Hot Brook depth chart (the owner's copy); MDIFW 2019, 2023 and 2026 fishing law books.
- MDIFW Wildlife Habitat Data GIS (yellow lampmussel, rare animal ARAAD02020, IWWH polygons, deer wintering area, vernal pool); USFWS NWI (beaver-modified wetlands); Maine Stream Habitat Viewer (dams, crossings, alewife habitat).
- Sleith et al. 2018 / GBIF records of *Nitella flexilis* and *N. tenuissima*, Upper Hot Brook Lake, 15 Jul 2015.
- DMR/MDIFW *Strategic Plan for the Restoration of Diadromous Fishes to the Penobscot River* (2008); ASF on the Danforth alewives (2017) and fishway (2023–24).
- Maine DEP / VLMP Lakes Data Tables 2025 (analogue lakes); DEP annual means 1940–2018.
- Maine statewide freshwater-fish mercury advisory (Maine CDC / MDIFW consumption-advisory page): https://www.maine.gov/IFW/fishing-boating/fishing/laws-rules/consumption-advisory.html
- MDIFW 2026 fishing law book (South Zone: lakes open to ice and open-water fishing all year): https://www.maine.gov/IFW/docs/25-MDIFW-23-FISHING-LAWBOOK-2026.pdf
- Baskahegan Company timberland around Danforth, FSC certified (Forest Stewards Guild; FSC US newsroom): https://www.foreststewardsguild.org/enews/one-guild-episode-of-a-forests-stories-on-a-most-honored-set
- Stetson wind projects near Danforth (Bangor Daily News 2009): https://www.bangordailynews.com/2009/03/04/news/maine-wind-farm-expansion-is-approved/
- The owner's field observations, photos and catch logs (project memory `hot-brook-field-observations.md`; `tools/hotbrook/field_notes.json`).
