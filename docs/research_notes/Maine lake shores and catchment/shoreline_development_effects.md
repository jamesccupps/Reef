# Shoreline development at small, shallow, coloured Maine lakes: what seasonal camps do to the water and its life

Compiled 2026-10-23 to drive the "lake effects" of the camps in the 3-D sim of Upper and Lower Hot Brook Lake (Danforth / T8 R4
NBPP, Washington County, Maine).

**The lakes:**
- Upper: 369 ha. Lower: 274 ha.
- Mean depth about 3 m; maximum 5.5 m (Upper) and 4 m (Lower).
- Unstratified, tea-coloured, Secchi about 3 m.
- Fish: smallmouth bass, chain pickerel, yellow and white perch, pumpkinseed, redbreast sunfish, brown bullhead, white sucker,
  fallfish and banded killifish. Sea-run alewife pass through.

**What "development" means here:**
- seasonal camps with docks;
- lawns or clearings;
- gravel camp roads;
- septic systems;
- one unimproved boat launch;
- small outboard boats, canoes and kayaks.

The note builds on what the repo already holds and does not repeat it. Where a value changes, it says so (§7).

**Existing notes this note cites:**
- **SGV** — `shore_geometry_and_vegetation.md`: §6 Christensen / Marburg / Sass wood numbers; §7 the MDIFW Hot Brook shore
  descriptions.
- **LSW** — `littoral_substrate_and_wood.md`: §2 wood densities and Hot Brook classes; §3 fish use of wood.
- **CPL** — `catchment_P_loads.md`: Upper and Lower hydrology and retention R. Upper: Q 1.28 m³/s, R ≈ 0.45; Lower: Q 1.55 m³/s,
  R ≈ 0.38. Upper's external load is about 525 kg P/yr from the catchment plus 59 kg/yr from the atmosphere.
- **LLS** — `land_lake_subsidies.md`: §1 insect fall-in, with developed shore at ×0.05–0.2; §7 the Maine DEP export
  coefficients.
- **SBM** — `shore_birds_and_mammals.md`: the loon leaflet. **TF** — `turtles_and_frogs.md`.
- **ANG** — `../Hot Brook populations and water/angling_effort_and_harvest.md`: effort about 12 h/ha/yr on Upper; nest angling.
- **FBP** — `../Hot Brook populations and water/full_biota_and_processes.md`; **HBR** — `hot_brook_lake_records.md`.
- **BMP** — `../Hot Brook populations and water/birds_mammals_people_evidence.md`: OSM camp roads and culverts.
- **SOP** — `../Whole lake 3D fish simulation/spawning_on_plants.md`: perch egg ribbons on wood and plants.
- **FIELD** — the human's own observations (auto-memory `hot-brook-field-observations.md`). The camp dock shore of Upper has
  "clear golden water over cobble/gravel with NO plants out to ~0.6 m, cedar + boulders on the bank". Shores are "a foot or two
  deep … to chest height". Bass are released.

**Tags.**
- **Access:**
  - [primary] — I, or a sub-researcher, read the original's full text;
  - [secondary — X citing Y];
  - [abstract];
  - [snippet] — a search-result summary only;
  - [inf] — my inference or arithmetic.
- **Region:** [ME] Maine, [NE] other New England, [ON] Ontario, [WI] Wisconsin and upper Michigan, [MN] Minnesota, [other].
- **Confidence (Values tables):** H high, M medium, L low.

**Method.**
- Q1, Q2 and Q4 were researched directly.
- Q3 (nutrients) and Q5–Q6 (boats, people, extras) were researched by two parallel sub-researchers under the same rules. Their
  sources and access levels are carried through unchanged.
- **Blocked sources:**
  - maine.gov returned 403 to scripted fetches, with one exception: two Maine DEP phosphorus control plans (PCAP-TMDLs) were
    served from www1.maine.gov, the URL the search engine returned.
  - www3.uwsp.edu (the Wisconsin lakeshore-training library) rejected the fetch tool's TLS certificate.
  - Taylor & Francis and Springer returned 403 or redirected to a login.
  - None of these blocks was worked around.
- One public 14.6-MB PDF was downloaded to the session scratch folder and converted to text: Engel & Pederson 1998, WDNR Research
  Report 177, from asset.library.wisc.edu. It was over the fetch tool's size limit.
- **Instructions seen in fetched content:** none, by me or by either sub-researcher.

---

## 0. Hot Brook's development as far as it is known, and the scenario sizes used below

**Upper Hot Brook Lake:**
- "an area of camp development along the south shore" (MDIFW sheet, revised 2004 [ME]; HBR);
- at least 15 buildings in OSM (a floor);
- an outfitter with about 1 mile of frontage;
- an unimproved boat launch at the south end off Route 169;
- Route 169 runs along the south and east shore, with 29 cross-culverts and a 60-in culvert (BMP).
- Camp roads: Haney N/S, Toupin Mountain, Robbs, Lower Lake, Hot Brook Lake Rd, Lydic Ln and Huff Rd (BMP).

**Lower Hot Brook Lake:** "There are no camps on this lake" (2004). OSM now shows private roads on its east shore (Boat Landing
Rd, Woodland Ridge Rd, Lakeview Rd, Black Point Rd), and lots are for sale (BMP). So Lower now has a few camps and probably its
own landing [inf].

**Scenario sizes [inf]**, until the human supplies a count or one is made from the aerial photographs the 3-D world already uses:

| | Camps (central) | Range | Camp shore | Local camp density | Lake-wide density |
|---|---|---|---|---|---|
| Upper (14.5 km of shore) | 20 | 15–40 | ~2–3 km of the south shore | ~7–12 per km | ~1.4 per km |
| Lower (10.8 km of shore) | 3 | 0–10 | — | — | — |

For scale against the literature:

| Study | Development density |
|---|---|
| Wagner et al. 2006, Michigan | 8–22 dwellings/km |
| Minnesota dock-study lakes | 0.4–46 docks/km |
| Marburg et al. 2006, Wisconsin | lakes with > 9 buildings/km never held > 200 logs/km |
| Ziegler et al. 2019 (citing Marburg 2006; Liu et al. 2007) | wood is "often completely absent" above 7 houses/km |

So Upper's camp shore sits at the density where wood is largely gone. The lake as a whole is lightly developed.

---

## 1. Docks as fish habitat

### Takeaway
- A dock removes light, plants and invertebrates beneath it and in a halo around it.
  - Light under Wisconsin piers was about **10× lower**.
  - Plant biomass under them was about **20× lower**.
  - Invertebrates were about **2–3× fewer**.
  - In Minnesota, the plant deficit extends at least **8 m** to each side, the farthest the study sampled.
  - Coarse wood is also scarcer near docks.
- A dock adds shade and a vertical surface.
- Fish use docks mostly for **shade and shelter by day, not for feeding or nesting.**
  - Young sunfish (< ~12 cm) hover under floating shade.
  - Adult bass visit docks but "seldom linger".
  - Yellow perch, white sucker, larger sunfish and rock bass showed no attraction to floating boards.
  - Pile piers had no measurable effect on fish density at Lake Tahoe; rock-crib piers concentrated fish by attraction.
  - Juvenile fish of many species are scarcer along developed shores. Smallmouth bass were equal or more abundant there.
- **Bass nest at undeveloped shores and natural structure, not at docks.**
  - Largemouth nest success fell from 0.77 to 0.45 across 8–22 dwellings/km.
  - 65 % of nests were on the 10 % of shore left undeveloped.
- Anglers concentrate along shore: > 90 % of Florida bass anglers fished within 50 m of it. Docks are classic targets.
- For Hot Brook, the dock effect is local. About 20 docks influence well under 1 % of Upper's area. The fish response is
  re-distribution (shade-seeking small sunfish, transient bass), not production.

### Cited findings

**Shading, plants and invertebrates under piers**

*Garrison, Marshall, Stremick-Thompson, Cicero & Dearlove 2005* (WDNR PUB-SS-1006), Lakes Ripley and Rock, Jefferson County [WI].
- **The press release** [primary — [WDNR](https://dnr.wisconsin.gov/sites/default/files/topic/Waterways/effectsofpiershading.pdf)]:
  - "average light intensity readings in open areas 10 times as great as the readings under piers";
  - "Plant growth was 20 times greater away from the piers";
  - "insect numbers under the piers were three times lower";
  - where plants persisted, shade-tolerant species dominated, and "dead" areas lay under large decks;
  - mean pier size was 546 ft² (51 m²) on Ripley and 370 ft² (34 m²) on Rock;
  - Rock Lake piers rose from 96 (1950) to 276 (1996) to about 300;
  - the piers with the most juvenile fish ("overwhelmingly" sunfish family) were in areas with fewer piers, near designated
    Sensitive Areas;
  - "fish may seek shelter under piers if nothing else is available".
- **The report and DNR slides** [snippet — [search summary of the report](https://www3.uwsp.edu/cnr-ap/UWEXLakes/Documents/ecology/shoreland/background/pier_shading_jefferson_cty_final_report_2005.pdf); host refused the fetch tool]:

  | Measure | Under piers | Controls |
  |---|---|---|
  | Surface light | 3.8 % | 41 % |
  | Plant biomass, median | 5 g | 107 g |
  | Plant biomass, mean | 7.7 g | 157.2 g |
  | Macroinvertebrates, median | 23 | 61 |
  | Macroinvertebrates, mean | 75.5 | 140.8 |
  | Fish catch rate | 11.2 | 38.7 (in plant beds) |

**Light thresholds under docks** (Burdick & Short 1999, *Environ. Manage.* 23:231) [other, marine eelgrass; snippet]:
- Height above the bed is the most critical factor.
- Narrow, north–south docks shade least.
- Floating docks shade more than pier-supported ones.
- Eelgrass needed ≥ 15 % of surface light to survive. That threshold is secondary and marine; it is shown for form only.

**The dock halo** — Lepore / Vondracek, Minnesota [MN] [primary — [LCCMR final report 2010-05h](https://www.lccmr.mn.gov/projects/2010/finals/2010_05h.pdf);
published as Dustin & Vondracek 2017, *NAJFM* 37:432, [snippet](https://www3.uwsp.edu/cnr-ap/UWEXLakes/PublishingImages/resources/restoration-project/Nearshore%20Habitat%20and%20Fish%20Assemblages%20along%20a%20Gradient%20of%20Shoreline%20Development.pdf)]
- **Design:**
  - 18 transects parallel to each dock, at 0–8 m from its edge, from shore to the dock's end;
  - 11 northern Minnesota lakes at 0.4–46 docks/km;
  - 317 shoreline sites, half with a dock.
- **Emergent plants:**
  - "a 9 percent likelihood of emergent species occurrence at the edge of a dock";
  - logit model (Table 1): −2.63 + **0.32·distance (m)** − 4.05·depth (m) + substrate terms. So the odds of emergents rise
    ×1.38 per metre from the dock [inf: e^0.32].
- **Submerged biovolume** (Table 2): +0.03 per m on an intercept of 0.24. That roughly doubles from 0 to 8 m, other terms held
  [inf].
- **Floating-leaf biovolume:** +0.13 per m.
- **Coarse woody structure (CWS):** presence "increased with separation from docks".
- **Lake-wide:**
  - CWS presence and emergent species fell with dock density.
  - Developed sites (residence and dock) had lower macrophyte species richness, fewer emergent and floating-leaf plants and less
    CWS.
  - "A fish Index of Biological Integrity decreased as the density of docks increased" (11 lakes). The effect was weaker across
    29 and 114 lakes.
- **Score Your Shore** (a 0–100 site score): undeveloped sites averaged 87, developed sites 50.

**How fish use docks (review)** — Engel & Pederson 1998, *The construction, aesthetics, and effects of lakeshore development: a
literature review*, WDNR Research Report 177 [primary review; secondary for the studies it cites — [UW library PDF](https://asset.library.wisc.edu/1711.dl/SFUN6YTR5QIRF8B/E/file-7a455.pdf)]:
- **General:** "Piers, boat shelters, and canopied lifts are used by nearshore fishes for shade and shelter but rarely for feeding
  and nesting, because these structures lack the structural complexity of plant beds, rocky substrates, and woody debris."
- **Largemouth bass:**
  - In a Florida lake stripped of plants by grass carp, piers were preferred habitat for 4 of 27 radio-tagged bass. Even then
    "the bass seldom lingered under the piers and sought the remaining fringe of plant beds" (Colle et al. 1989).
  - "Adult largemouth bass also visit woody debris as well as piers but seldom linger" (Prince & Maughan 1979; Colle et al. 1989).
- **The advantage of shade:**
  - Fish hovering beneath floating objects can see predators at up to **2.7×** the distance at which the predators see them
    (Helfman 1981).
  - In a New York lake, bluegill and pumpkinseed **> 4.7 in (12 cm)**, and all rock bass, largemouth bass, yellow perch and
    white suckers, "showed no positive or negative attraction" to floating boards. The page break loses the species that were
    attracted; the text implies small sunfish.
  - The shade advantage "is lessened when lake water is turbid or at low level".
  - At Lake Tahoe, nearshore fishes showed no significant preference for hovering under any of 70 piers examined (Beauchamp et
    al. 1994).
  - "Plant beds, rock outcrops, boulder spits, and woody debris can draw fishes away from piers, despite adequate shade."
- **Juveniles at developed shores** (Spirit Lake, Iowa; Bryan & Scarnecchia 1992):
  - Juveniles of 18 species were scarcer along shores developed with piers, homes and beaches than along plant-bed shores.
  - Below 6.6 ft (2 m) depth, abundance was similar.
  - "Smallmouth bass at all depths were found in equal or greater abundance along developed shores."
- **Altered shores, Lake St. Clair** (Poe et al. 1986): bluegill and black bass preferred altered (dredged, bulkheaded) shores;
  minnows and darters preferred unaltered ones.
- **Pumpkinseed nesting:** pumpkinseed "prefer to nest in areas of a Canadian lake that were cleared of all woody debris longer
  than 10 inches" (Colgan & Ealey 1973).
- **Smallmouth nesting:** male smallmouth in Wisconsin lakes "excavated nests near logs and boulders" (Baylis et al. 1993).
- **Invertebrates on docks:** midge and caddisfly larvae colonize pier supports, but piers "decrease habitat for invertebrates
  by shading-out underlying plants".
- **Boats around piers:**
  - Adding piers "can increase boating pressure".
  - Wakes and hulls scour the bed to about 3 ft (0.9 m) (Wagner 1990).
  - Excluding motorboats from 20 × 40-ft plots on Lake Ripley raised *Chara* and *Najas* height and density (Asplund & Cook
    1997).

**Lake Tahoe** [other, clear oligotrophic] [primary — [TRPA Shoreline Plan, Piers memo 2016](https://trpa.gov/wp-content/uploads/documents/archive/05-Pier-Issues-v2016_7-20.pdf),
summarising Byron et al. 1989, Beauchamp et al. 1991 and Allen & Reuter 1996]:
- "Piling piers and solid bulkhead structures showed no statistically significant effects on littoral fish densities."
- Rock-crib piers held high densities of Lahontan redside and rainbow trout, "thought to be a result of local attraction rather
  than increased production".
- Substrate under the pier mattered more than the pier.
- "Boat traffic in marinas and near piers caused fish schools to retreat to cover, but they usually returned to normal activity
  patterns within **30 seconds**."
- Minnow egg survival "did decline with heavy shoreline disturbance".
- Beauchamp, Byron & Wurtsbaugh 1994 (*NAJFM* 14:385) [snippet]: fish densities were **5–12× higher at night** than by day on
  pier, rock-crib and control transects.

**Fish distribution and assemblages along development gradients**
- **Pacific Northwest lakes** (Scheuerell & Schindler 2004, *Ecosystems* 7:98) [abstract via search summary]:
  - "a significant decrease in the spatial aggregation of fishes with increased shoreline development";
  - lakes with high perimeter-to-area ratios and shallow littoral zones had much higher aggregation.
- **17 Wisconsin lakes** (Jennings et al. 1999, *NAJFM* 19:18; strata: walls, riprap, none) [abstract, via sub-researcher]:
  - site species richness was highest at riprap and rose with habitat complexity;
  - the intolerant-to-tolerant species balance shifted with cumulative modification.
- **Bluegill attraction to wood-like structure** (Johnson et al. 1988) [secondary — [Wolter 2012, WDNR review](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_LitWoodyHabReviewWolter2012.pdf)]:
  artificial structures that simulate wood "attracted 5–10 % of bluegill present in ponds despite accounting for less than 1 % of
  the area".

**Bass nests, docks and development**
- **Largemouth nests in two undeveloped Wisconsin lakes** (Weis & Sass 2011, *NAJFM* 31:943) [WI] [primary — [WDNR copy](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_BassNestsCWD.pdf)]:
  - 1,703 nests; 38 % within 0.5 m of prominent structure and 59 % within 1.25 m.
  - Of the 652 nests within 0.5 m of structure, the nearest structure was coarse wood (CWH) for 41 %, boulders 35 %, fine wood
    21 % and "human structure" 12 nests (2 %).
  - Substrate: 68 % on isoetid beds, 18 % sand.
  - Densities 52–129 nests/km.
  - Wood did not limit nest density.
- **Wisconsin's Northern Highland lakes** (Lawson et al. 2011, *NAJFM* 31:666) [WI] (LSW / largemouth note): "no nest was closer
  to a dock than to CWH".
- **Five Michigan lakes at 8–22 dwellings/km** (Wagner, Jubar & Bremigan 2006, *TAFS* 135:843) [WI-MI] [abstract]:
  - nest success (swim-up fry) fell from **0.77** in the least-developed lake to **0.45** in the most-developed (P = 0.018);
  - local nest habitat did not predict success;
  - lakewide angling effort did not explain the differences.
  - The same study is cited for "65 % of largemouth bass nests were on undeveloped shore that made up only 10 % of the
    shoreline" [secondary — [MN DNR Douglas County shoreline report 2008](https://files.dnr.state.mn.us/areas/fisheries/glenwood/douglas_county_shore_habitat.pdf),
    via sub-researcher].
- **Smallmouth bass:**
  - Wisconsin nests lay near wood or rock cover at **0.5–3.0 m**, on substrates with ≥ 40 % of particles 6.4–149 mm (Saunders et
    al. 2002) [snippet].
  - An Ontario cottage-lake note says bass "could be seen nesting at the end of docks in early June" [anecdote — [tinycottager.org](https://tinycottager.org/articles/2008Fall/farlainlake.html)].

**Anglers**
- **Florida, 1,873 ha** (Matthias, Allen, Ahrens, Beard & Kerns 2014, *Fisheries* 39:261) [other] [abstract]:
  - "over 90 % fished within 50 m from shore";
  - about a third of radio-tagged bass were offshore at any time;
  - catch rates were similar on- and offshore.
- **Structure and anglers** (Wolter 2012) [WI] [primary review]:
  - added structure in lakes with little existing structure may "only congregate populations making them more accessible to
    anglers";
  - "it may be possible for overfishing to occur".
- **Hot Brook** (ANG):
  - effort is low (Upper about 12 h/ha/yr);
  - shore fishing at the launch, the camps and the brook's pools;
  - bass are released;
  - angling on nests is in ANG §4.

### Species by season and day/night at a Hot Brook camp dock [inf]

From the findings above, the repo's seasonal habitat notes and FIELD. Docks are in the water only from late May to mid-October
(§5). No dock is in the water under ice.

| Species | Use of the dock (by day in summer unless stated) | Basis |
|---|---|---|
| Pumpkinseed / redbreast < 12 cm | Hover in the dock's shade at midday (high sun, clear water), leaving to feed. Night: disperse to the bed. Strongest July–August. | Helfman via Engel; Garrison (juvenile sunfish under piers in plant-rich areas) |
| Pumpkinseed / redbreast adults | Little attraction to shade. May nest on the bare, cleared sand/gravel of the camp frontage beside the dock (late May–July) | Engel (no attraction > 12 cm); Colgan & Ealey 1973; FIELD (bare cobble/gravel shore) |
| Smallmouth bass | Adults pass along dock edges and post lines, mostly at dawn/dusk and at night; do not linger. Males may nest near the dock's end only where cobble/boulder is there. Equal or higher abundance along developed shore. Leave the shallows by mid-summer. | Engel; Bryan & Scarnecchia; Saunders 2002; repo smallmouth notes |
| Chain pickerel | Ambush from the shade edge where weeds reach the dock. The camp shore is mostly bare (FIELD), so weak use. | Ambush-predator ecology; no direct data — L |
| Yellow perch | No attraction to shade (boards). Spawn on wood/plants, not docks (SOP). | Engel; SOP |
| White perch | Open-water schools; no dock use beyond passing | Repo white perch notes — L |
| Brown bullhead | By day under cover over soft bottom; out over the bed at night. A dock over mud is plausible cover. | No direct data — L |
| White sucker | No attraction | Engel |
| Fallfish, killifish | Killifish keep to very shallow, sparsely vegetated water, which a cleared frontage provides. Fallfish not tied to docks. | Repo killifish notes; L |

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Dock footprint, Maine seasonal camp | 12–20 m² (about 1.2 m × 10–15 m), plus a moored boat about 7 m² | 5–50 m² (Wisconsin piers 34–51 m²) | Stiles Dock Service 2016 (average 5 sections) [ME, via sub-researcher]; Garrison 2005 | L–M |
| Light under a dock (fraction of the adjacent open-water light) | 0.1 | 0.05–0.3; less shading with height and narrowness | Garrison 2005 (3.8 % vs 41 % of surface; "10×") | M |
| Plant biomass under a dock (× control) | 0.05 | 0.03–0.1 | Garrison (median 5 vs 107 g; mean 7.7 vs 157) | M |
| Invertebrates under a dock (× control) | 0.4 | 0.33–0.55 | Garrison (median 23 vs 61; mean 75.5 vs 141; "three times lower") | M |
| Halo: emergent-plant presence | 9 % at the dock edge; odds ×1.38 per m | to ≥ 8 m | Lepore/Vondracek MN | M |
| Halo: submerged and floating-leaf biovolume | Rises linearly away from the dock; about 2× by 8 m | — | MN Table 2 [inf] | M |
| Coarse wood near docks | Presence rises with distance; use the frontage factor (§2) within the dock's lot | — | MN; Jennings 2003 | M |
| Juvenile fish at a pier vs a plant bed | 0.3× | — | Garrison (11.2 vs 38.7) | M |
| Juvenile fish along developed vs plant-bed shore | Lower above 2 m depth; equal below | — | Bryan & Scarnecchia 1992 | M |
| Small sunfish (< 12 cm) shade attraction | Hover under dock shade when sun is high and water clear. Weight 0 at night, under cloud, or when the dock is ice-out-only | — | Helfman via Engel | M (direction); L (strength) |
| Fish ≥ 12 cm, perch, suckers | No attraction to dock shade | — | Helfman via Engel | M |
| Adult bass at docks | Visit, do not linger (transit weight only) | — | Colle 1989; Prince & Maughan 1979 | M |
| Response to a passing boat near a dock | Fish schools to cover; normal within 30 s | — | Beauchamp 1991 via TRPA | M |
| Day vs night fish density in the shallows | ×5–12 at night | — | Beauchamp 1994 | M |
| Bass nests at docks | About 0 (prefer wood, boulders, isoetid beds); < 2 % of near-structure nests by human structure | — | Weis & Sass 2011; Lawson 2011 | M–H |
| Bass nest success vs development | 0.77 → 0.45 across 8 → 22 dwellings/km. Apply only where local camp density is that high: Upper's camp shore, not the lake | — | Wagner 2006 | M |
| Angler position | > 90 % of bass effort within 50 m of shore; docks and wood are the targets | — | Matthias 2014; Wolter 2012 | M |
| Lake-wide share influenced by docks | About 20 docks × about 300 m² halo ≈ 0.6 ha ≈ 0.2 % of Upper | 0.1–0.5 % | [inf] | L |

### Gaps
- **No study of fish use of docks in Maine or New England.** No study separates sunfish species at docks, and none covers
  pickerel or bullhead at docks.
- **Unread primary sources:**
  - the Garrison 2005 full report (cert refused) and its periphyton data;
  - Radomski et al. 2010 (*Fisheries* 35:489), docks in Minnesota lakes;
  - Lewin et al. 2014 (*Hydrobiologia* 724:293), shoreline change and fish in German lakes.
- **No freshwater measurement of periphyton on dock posts or under docks.** On hard surfaces, the Vermont "aufwuchs" cover (§4)
  is the nearest value.
- **The human could supply** dock count, size and type (floating or post), and whether he catches bass and sunfish at docks, and
  in which months.

---

## 2. Coarse woody debris (fallen trees) vs shoreline development

### Takeaway
- **Development strips the littoral of wood.** At cabin frontage it holds about **10 %** of the undeveloped density: 57 vs 555
  logs/km, Christensen 1996, already in SGV and LSW.
  - New here: the first **New England** count. At Vermont lakes, unbuffered developed sites held **0.38×** the large wood of
    reference sites: 3.1 vs 8.1 pieces > 10 cm per 10 m of shore, out to 2 m depth.
  - Medium wood fell to **0.12×** and fine wood to **0.23×**.
- **Whole lakes:**
  - Wood is "often completely absent" above about 7 houses/km.
  - Lakes with > 9 buildings/km never exceed 200 logs/km.
  - Even forested stretches of developed lakes hold less (379 vs 555/km).
- **Recovery takes about two centuries.** Inputs are a few logs/km/yr; large pieces persist for centuries.
- **Fish:**
  - Losing wood cost largemouth bass growth and foraging efficiency.
  - It collapsed yellow perch in the one whole-lake removal (Sass 2006, Helmus & Sass 2008), by predation on young perch and
    loss of egg substrate.
  - Largemouth in highly developed lakes take about **1.5 growing seasons longer to reach 356 mm**.
  - Wood did **not** limit bass nest density, and did **not** change open-water mortality of young largemouth across 3–1,500
    logs/km.
  - Young smallmouth leave wood for cobble by August, because wood also harbours ambush predators.
  - Adding wood back has not produced fast population responses.
- **For Hot Brook:** the human reports **perch scarce and small, bass and fallfish plentiful.** This is consistent with a
  wood-poor camp shore, but Upper's camp shore is a small share of a long, mostly forested and wetland shoreline. Wood loss is a
  local effect on Upper and should not drive lake-wide perch scarcity by itself [inf].

### Cited findings

**Densities and the development gradient**
- **Christensen et al. 1996**, *Ecol. Appl.* 6:1143 [WI-MI] [abstract]: already in SGV §6 and LSW §2. In summary:
  - 16 lakes;
  - CWD vs riparian tree density r² = 0.78, and vs cabin density r² = 0.71 (negative);
  - undeveloped 555 logs/km; developed-lake forested sites 379, cabin sites 57;
  - effects last "about two centuries".
  - The fitted regression form was not in the abstract.
- **Marburg, Turner & Kratz 2006** [WI] [primary; LSW §2]: lakes with > 9 buildings/km never had > 200 pieces/km.
- **Ziegler et al. 2019**, *CJFAS* 76:998 [WI-MI] [primary — [NSF PAR copy](https://par.nsf.gov/servlets/purl/10111626)]:
  - Wood "is sensitive to human development and, often completely absent when there are more than **seven houses per kilometre**
    of shoreline (Marburg et al. 2006; Liu et al. 2007)".
  - The 13 study lakes spanned **2.5–1,500 pieces/km**.
  - The region overall spans 0–965 (Christensen 1996; Marburg 2006).
- **Jennings et al. 2003**, *Lake Reserv. Manage.* 19:272 [WI] [primary — [WDNR scan](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Outreach_LitHabLandUseJennings.pdf);
  [USFS record](https://research.fs.usda.gov/treesearch/14065)]:
  - 34 northern Wisconsin lakes of 18–80 ha; 15 × 5 m sites; a site was "developed" if a house stood within 100 m.
  - Large woody debris (> 10 cm) fell with both site development (P = 0.026) and lake development density (P = 0.004). The
    interaction (P = 0.030) left the least wood at developed sites in highly developed lakes.
  - Medium wood (4–10 cm) fell with lake density, regardless of the adjacent lot.
  - Small wood was unaffected.
  - Embeddedness: 4.12 with a house vs 3.54 without (0–5 scale).
- **Merrell, Howe & Warren 2009**, *LakeLine* 29(1):10 (Vermont DEC 2005–08) [NE] [primary — [VT ANR](https://anrweb.vt.gov/PubDocs/DEC/WSMD/lakes/Docs/lp_littorally.pdf)]
  - **Design:** 40 lakes; 151 unbuffered developed vs 234 reference sites; a 10-m transect at 0.5 m depth. Large wood was
    counted from the water's edge to the 2-m contour.
  - **Table 2, developed vs reference means:**

    | Measure | Developed | Reference |
    |---|---|---|
    | Large wood > 10 cm (count per 10 m site) | **3.1** | **8.1** |
    | Fine wood (% cover) | 3.5 | 14.9 |
    | Medium wood (% cover) | 0.6 | 5.0 |
    | Shoreline tree cover (%) | 2.7 | 55.0 |
    | Shading at 1 m, on a 0–17 scale | 7.2 | 15.1 |
    | Leaf litter (% cover) | 2.3 | 5.3 |
    | Sand (% cover) | 59.4 | 32.9 |
    | Embeddedness (%) | 58.0 | 38.4 |
    | Aufwuchs (% cover) | 22.2 | 31.2 |
    | Odonate exuviae (count) | 1.6 | 9.1 |
    | Aquatic plant cover (%) | 9.5 | 14.1 (n.s., P = 0.15) |

  - Large wood per km [inf]: **≈ 810 reference vs ≈ 310 developed**. These are pieces of any length, counted out to 2 m depth.
    They are not comparable one-to-one with Christensen's logs or Marburg's 0.5-m-contour count. Reference sites were chosen as
    high-quality, so 810 is an upper-end value.
  - Vermont's mapping (Capen et al. 2008) found development had impacted the vegetated buffer on "up to 74 percent of a lake's
    shoreline".
- **Minnesota dock study** [MN] [primary; §1]: coarse wood presence rises with distance from the nearest dock and falls with
  lake-wide dock density.
- **Francis & Schindler 2006**, *Ambio* 35:274 [other + WI] [abstract — [BioOne](https://bioone.org/journals/AMBIO-A-Journal-of-the-Human-Environment/volume-35/issue-6/06-R-141R2.1/Degradation-of-Littoral-Habitats-by-Residential-Development--Woody-Debris/10.1579/06-R-141R2.1.full)]:
  - 18 Pacific Northwest lakes compared with the 16 Midwest lakes;
  - development had "a strong negative effect on woody debris and riparian forest at both local and whole-lake scales";
  - riparian forest density was the strong positive correlate in both regions;
  - regional differences came from native forest type.
- **Mechanism:** owners thin the riparian forest and remove logs and limbs "to improve aesthetics or select recreational
  opportunities (swimming and boating)" (Wolter 2012 [primary review]; Sass et al. 2006).
- **Maine:** Maine DEP's 2005 report names excessive cutting of vegetation as the shoreland violation that "occurs most
  frequently" (§4) [ME].

**Persistence and recovery**
- Christensen 1996 [abstract]: "about two centuries".
- Wolter 2012 [primary review]:
  - "large pieces of CWH can have a residence time of several centuries (Guyette and Cole 1999)", and it "could take up to 200
    years for developed lakes to naturally replenish";
  - decay rises with temperature, pH and shredders;
  - cedar and oak last longer than basswood and pine;
  - spruce and hemlock bark extracts are toxic to some aquatic animals (Buchanan et al. 1976, estuarine organisms).
- Marburg 2006 resurveys: net change −1.1 to +1.9 logs/km/yr (SGV §6).

**Fish responses**
- **Whole-basin removal at Little Rock Lake** [WI]:
  - About 70–75 % of littoral wood was removed (Sass et al. 2006, in SGV §6), leaving 128 logs/km.
  - Helmus & Sass 2008 (*Freshw. Biol.* 53:1423) [abstract]: yellow perch, the lake's most abundant fish, fell to very low
    densities within two years; benthic invertebrate composition, diversity and density did **not** change.
  - Ziegler et al. 2019 attribute the perch failure to "increased predation pressure on YOY yellow perch and lack of spawning
    substrate".
  - Perch egg ribbons on wood and plants are covered in SOP.
- **Largemouth movement** (Ahrenstorff, Sass & Helmus 2009, *Hydrobiologia* 623:223) [abstract, plus Wolter's summary]:
  - with less wood: larger home ranges;
  - with more wood: smaller ranges, lower activity, more time in < 2 m water;
  - with more wood: higher consumption and a broader, sit-and-wait diet (Sass 2006).
- **Growth along development gradients:**
  - Schindler, Geib & Williams 2000, *Ecosystems* 3:229 [snippet]: in 14 lakes, size-specific growth of bluegill and largemouth
    fell with development (largemouth not significant). Bluegill growth rose with wood.
  - Gaeta, Guarascio, Sass & Carpenter 2011, *Ecol. Freshw. Fish* 20:92 [abstract via search]: in 16 lakes, growth rose with
    development for small bass but turned negative above about 210 mm (a 2009 poster says 164 mm). Bass in highly developed lakes
    take **about 1.5 growing seasons longer** to reach 356 mm.
- **Nests:** wood did not limit largemouth nest density (Weis & Sass 2011 [primary]; §1).
  - Wood levels: Camp Lake 41 → 141 logs/km after adding about 300 trees, one per 10 m of shore.
  - Little Rock: 475 → 128 after removal.
  - Nest densities: 52–129/km.
- **Young largemouth mortality** (Ziegler et al. 2019 [primary]): open-water instantaneous mortality of young-of-year (YOY)
  largemouth was **0.04–0.19 per day** (mean 0.11) in 13 lakes. It was unrelated to wood density (2.5–1,500/km), wood complexity
  or macrophyte cover. That is 68–99 % lost over the summer.
- **Young smallmouth** (Brown & Bozek 2010, *TAFS* 139:1247) [WI] [abstract — [USGS](https://pubs.usgs.gov/publication/70169302)]:
  - coarse substrate mattered for nests and for young-of-year;
  - young used wood after leaving the nest but "disassociated themselves from habitats with more complex woody structure by
    August";
  - abundance declined exponentially in wood and linearly in rock;
  - "Nonwoody cobble areas offer protection … without attracting predators."
- **Adding wood back:**
  - Sass et al. 2012 [snippet] found no fish population-level response to a whole-lake addition in an oligotrophic lake.
  - A multi-lake study found adding wood alone "did not, on average, enhance fish abundance" [snippet].
  - WDNR's long-term Sanford Lake tree-drop experiment (from 2015; 160 trees in 2018) is still the open test [primary —
    [WDNR](https://dnr.wisconsin.gov/sites/default/files/topic/Research/Coarse_Woody_Habitat.pdf)].
- **Wood elsewhere in the food web** (Merrell 2009 [primary]):
  - large wood loss means "less vertical substrate … for amphibians and fish to attach their eggs" and fewer turtle basking
    sites;
  - odonate emergence at developed sites was 0.18× reference.
  - Turtles and odonates are in TF and §6.

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Wood at a camp's own frontage (× the undeveloped value for that shore class) | **0.15** | 0.1 (Christensen cabin sites) – 0.38 (VT large wood) | Christensen 1996; Merrell 2009 | M |
| Medium and fine wood (branches, < 10 cm) at camp frontage | ×0.12 (medium), ×0.23 (fine) | — | Merrell 2009 | M |
| Wood on forested stretches of a developed lake (between camps) | ×0.7 | 0.68–1.0 | Christensen 1996 (379/555) | L–M |
| Lake-wide cap where local density > 7–9 camps/km | ≤ 200 logs/km; often about 0 | — | Marburg 2006; Ziegler 2019 | M |
| Upper's camp shore, absolute [inf] | 30–100 logs ≥ 10 cm per km (LSW's class kept) | 0–150 | LSW §2; this section | M |
| Wood removal timing | At camp building, then ongoing maintenance: removal of newly fallen trees within about 1 yr at occupied lots | — | [inf] from the mechanism (Wolter; Sass) | L |
| Natural wood input on undeveloped shore | 1–2 logs/km/yr; windthrow years higher | −1 to +2 net | Marburg resurveys | M |
| Recovery after abandonment | About 200 yr to undeveloped density | 100–300 | Christensen; Guyette & Cole | M |
| Perch egg substrate | Wood + plants. Losing both at camp frontage removes that frontage from perch spawning (SOP) | — | Sass 2006; Helmus & Sass 2008 | M |
| Bass home range vs wood | Larger with less wood; more time in < 2 m with more wood | — | Ahrenstorff 2009 | M (direction) |
| Bass growth vs development | Neutral or slightly positive < 210 mm; negative above, about +1.5 seasons to 356 mm in highly developed lakes | — | Gaeta 2011 | M (largemouth; smallmouth unknown) |
| YOY bass mortality vs wood | No dependence | 0.04–0.19 per day open-water | Ziegler 2019 | M |
| Young smallmouth habitat shift | Wood after swim-up → cobble/rock by August | — | Brown & Bozek 2010 | M |

### Gaps
- **No Maine lake wood count, before or after development.** Vermont's Table 2 is the nearest New England number.
- **Unread primary sources:**
  - Christensen 1996's fitted curve and the cabin densities of its lakes (full text not reached);
  - Francis & Schindler 2006 full text;
  - Sass et al. 2012 numbers;
  - Lewin et al. 2014.
- **Smallmouth evidence is indirect.** Smallmouth bass (Hot Brook's bass) growth vs development is unstudied here; the growth
  results are largemouth.
- **The Hot Brook camp-shore wood itself has not been surveyed.** The human could say whether the camp frontage holds fallen
  trees.

---

## 3. Phosphorus and nutrients from camps

### Takeaway
- **With realistic soil retention, a seasonal camp delivers about 0.4 kg of algal-available P a year** (about 0.7 kg as total
  P). The sources:
  - septic about 0.1 kg, as phosphate;
  - lot runoff about 0.15 kg;
  - its share of gravel camp road about 0.1 kg (available).
- **Upper's high flushing makes the whole-lake effect small.** About 3.7 lake volumes a year leave by the outlet.
  - 20 camps raise Upper's TP by about **+0.1 µg/L**.
  - 100 camps raise it by about **+0.5 µg/L**, or 1.4–7 % of the external load.
- **The real effect is local:**
  - a nearshore SRP rise of a few tenths to a few µg/L in front of a camp in summer;
  - nitrate that passes through septic soils;
  - fine sediment and particulate P at road culverts in storms and snowmelt.
- **The one Maine measurement of a gravel road serving cottages** gave 9.0 kg TP per hectare of road a year (about 22 %
  available), with 41 t/ha of sediment. That matches DEP's 2.0 kg/ha available-P coefficient.

### Cited findings (sub-researcher; access levels as reported)

**(a) Septic systems**
- **Ontario Lakeshore Capacity Model** [ON] [primary — [ontario.ca](https://ontario.ca/document/lakeshore-capacity-assessment-handbook-protecting-water-quality-inland-lakes/applying-lakeshore-capacity-model)]:
  - 0.66 kg P per capita per year;
  - occupancy in capita-years a year: seasonal cottage 0.69, extended seasonal 1.27, permanent 2.56;
  - 0 % soil retention as policy, within 300 m;
  - lot runoff 0.04 kg/lot/yr;
  - so a cottage delivers about 0.46 kg/yr and a permanent home about 1.69, with no retention.
- **NH DES Haunted Lake TMDL, 2019** [NE] [primary — [EPA PDF](https://www.epa.gov/sites/production/files/2019-10/documents/haunted-lake-tmdl-report.pdf)]:
  - a close analogue: 69 ha, mean depth 2.4 m, max 5.2 m, flushing 4.3/yr;
  - 2.5 persons; 65 gal/person/day at 8 mg/L TP, i.e. 0.72 kg P/person/yr;
  - 90 days seasonal, 365 year-round; 90 % attenuation; only systems within 125 ft count;
  - 19 seasonal and 2 year-round houses give 1.2 kg/yr, 0.6 % of 195 kg. That is about 0.045 kg per seasonal house [inf].
- **Wilson Pond PCAP, Maine 2007** [ME] [primary, www1.maine.gov]:
  - 118 dwellings on 9 mi of shore (70 seasonal, 48 year-round), 2.7 persons each;
  - delivered 0.05 (seasonal) and 0.15 (year-round) kg P per capita per year (Dennis & McPhedran 1991);
  - 28 kg/yr, 9 % of the direct-watershed load;
  - so 0.135 and 0.41 kg per camp [inf].
- **Long Pond PCAP, Belgrade 2008** [ME] [primary]:
  - 0.45 (seasonal) and 0.80 (year-round) kg P per capita (Reckhow & Chapra 1983); 2.6 persons per household, 3.8 in summer;
  - north basin: 267 dwellings at 17.5 per shore-mile give 126 kg/yr, 20 % of its load;
  - south basin: 126 dwellings at 9.2 per mile give 39 kg, 7 %;
  - the implied delivered fraction is about 0.25–0.3 [inf];
  - old pre-Plumbing-Code systems are noted, and a 100-ft setback is now required.
- **Robertson, Van Stempvoort & Schiff 2019**, *Sci. Total Environ.* 692:640 [ON] [primary, via a Lake George Park Commission
  copy]:
  - 24 systems, including cottages and campgrounds;
  - P removal averaged **97 % on non-calcareous** sediments (13 sites) and 69 % on calcareous ones;
  - cottage sites removed 96–99 %;
  - plumes were 1–4 m long;
  - plume nitrate-N was 0.1–76 mg/L.
- **USEPA 2002 Onsite Wastewater Manual**, chapter 3 [primary]:
  - low-P detergents cut wastewater P by 40–50 %;
  - P moves 52 cm/yr below drainfields in sands and 10 cm/yr in silt loams;
  - about 20 % of N is lost in the soil.
- **Septic load lags housing** [other] [abstract]: Puget Sound lakes tracked 1940 dwelling counts rather than 1960–70 counts
  (Gilliom 1983). The effect lags installation by decades.

**(b) Lots, lawns and roads**
- **Dudley, Olson & Handley 1997**, USGS WRIR 97-4041 [ME] [primary — [PDF](https://pubs.usgs.gov/wri/1997/4041/report.pdf)]:
  - Kimball Pond Road, a gravel road serving summer cottages:
    - **TP 8 lb/acre/yr (9.0 kg/ha)**, 21.6 % available;
    - sediment 36,500 lb/acre (41 t/ha).
  - Paved Routes 2 and 27, for comparison: TP 22–33 lb/acre, about 4 % available.
- **Maine PCAPs** [ME] [primary]:
  - shoreline lots about 0.15–0.2 kg per lot a year (Dennis et al. 1992; Long Pond 1.0 kg/ha on half an acre; Wilson 0.34 lb for
    10,000 ft² cleared, × a buffer factor of 1.0 / 0.9 / 0.75);
  - camp roads 2.0 kg/ha/yr, about 4.9 m wide;
  - shoreline development was about 1 % of the area but **16–23 % of the direct load** at those heavily developed ponds.
- **Graczyk et al. 2003**, USGS WRIR 03-4144 [WI] [primary]: lawn runoff carried about **10× the TP** and about **230× the
  nitrate** of wooded catchments. Groundwater nitrate and TP were 3–4× higher.
- **Maine watershed surveys** [ME] [primary]:
  - Great Pond 2018: 237 erosion sites; residential 62 %, private roads 15, driveways 20, beach and boat access 11.
  - Moose Pond 2020: roads and driveways were the largest group; > 65 % of sites drain straight to the water.

**(c) The boat launch:** no quantitative source.
- Power-loading scours a hole past the ramp toe and builds a mound beyond it [snippet].
- Beach and boat access are about 5 % of Maine erosion sites.

**(d) How far the effect reaches**
- Working septics on acid soils hold P within 1–4 m (Robertson 2019).
- Nitrate passes through.
- Periphyton at developed shores ranges from no effect (Lake Crescent, Tahoe) to about 2× (Pend Oreille: 4.3 vs 2.1 mg/m²
  chlorophyll on artificial substrates) [snippets].
- Lakes on septic had higher TP and chlorophyll than sewered lakes (Moore et al. 2003, *Ambio*) [abstract].
- Vermont found **less** aufwuchs cover at unbuffered developed sites: 22 vs 31 %, about 0.71× (Merrell 2009 [primary]; §2).
  The wood and leaf substrate is lost and sand is added. Any nutrient boost acts on less surface.

**(f) Nitrogen:** wastewater carries about 11.2 g N per person per day, about 4.1 kg/yr [snippet]. About 10–50 % is lost in the
soil. That gives about 1.5–2.3 kg nitrate-N a year from a seasonal camp and 6–9 kg from a year-round one [inf].

### (e) The whole-lake formula

ΔTP_lake (µg/L) = N · L_camp (kg/yr) · (1 − R) / Q (m³/yr) × 10⁶

- L_camp = septic + lot + road share.
- Use **available P** to compare with the sim's algae, or **TP** to compare with a measured lake TP.

**Factors per lake (CPL hydrology):**

| Lake | Q (m³/yr) | 1 − R | ΔTP per kg/yr | Load giving +1 µg/L |
|---|---|---|---|---|
| Upper | 4.04×10⁷ | 0.55 | **0.0136 µg/L** | ≈ 73 kg/yr |
| Lower (its own camps) | 4.89×10⁷ | 0.62 | **0.0127 µg/L** | ≈ 79 kg/yr |

Upper's camps also reach Lower: 55 % of Upper's added load leaves by the outlet.

**L_camp, available P:**

| Camp type | Central | Range | Breakdown |
|---|---|---|---|
| Seasonal | 0.4 kg/yr | 0.15–0.8 | septic 0.1 + lot 0.15 + 50–100 m of road at 2.0 kg/ha ≈ 0.1 |
| Year-round | 0.8 kg/yr | — | — |
| Seasonal, as total P | ≈ 0.7 kg/yr | — | roads ×4.5, lots about ×2 |

**Worked example, Upper** (external load 584 kg/yr):

| Camps | Central (0.4 kg/camp) | High (0.8) | Ontario, no retention (1.7) |
|---|---|---|---|
| 20 | +0.11 µg/L (1.4 % of external load) | +0.22 | +0.46 |
| 50 | +0.27 µg/L (3.4 %) | +0.54 | +1.2 |
| 100 | +0.54 µg/L (6.8 %) | +1.1 | +2.3 |

- Against Upper's computed baseline TP of about 8 µg/L (CPL), the central case adds 1–7 %.
- 50 camps add about 5.4 mg/m²/yr over the lake, about a third of atmospheric deposition (16 mg/m²/yr).
- Lower: 20 of its own seasonal camps add +0.10 µg/L. Upper's 50 add about +0.14 µg/L in Lower.

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Wastewater P per person | 0.66 kg/yr | 0.45–1.0 | Ontario; Reckhow & Chapra; NH 0.72 | M |
| Persons per camp; days occupied (seasonal) | 2.5–2.7 persons (3.8 summer peak); about 90 days | 30–100 days; Ontario 0.69 capita-yr | TMDLs; §5 | M |
| Septic P retention, acid non-calcareous soils | 0.95 | 0.69–0.99 (0.9 in NH budgets) | Robertson 2019 | M |
| Septic P delivered, seasonal / year-round camp | **0.1 / 0.4 kg/yr**, as SRP | 0.04–0.45 / 0.18–1.7 | NH DES; Wilson; Long Pond; Ontario | M–L |
| Septic delivery timing | Occupancy-weighted, late May–mid Oct, through groundwater. Arrival lags years to decades (old systems close to the water deliver most) | — | Gilliom 1983; Robertson | L |
| Lot runoff P | 0.15 kg/lot/yr, about 50 % available, in storms and snowmelt | 0.04–0.2 | Dennis et al. 1992 via PCAPs | M |
| Lawn vs forest runoff | ×10 TP; ×230 nitrate | — | Graczyk 2003 | M |
| Gravel camp road | **9.0 kg TP/ha of road/yr, 22 % available; 41 t sediment/ha/yr**; at culverts in events | DEP 2.0 kg/ha available | Dudley et al. 1997 | M (one site, one year) |
| Road per camp near shore | 4.9 m wide × 33–68 m | — | Wilson; Long Pond | M |
| Boat launch (unimproved gravel) | 0.2–0.45 kg TP/yr, plus resuspension at the ramp toe at each launch | — | [inf] | L |
| Whole-lake factor | 0.0136 (Upper), 0.0127 (Lower) µg/L per kg/yr | — | CPL Q and R | M |
| Nearshore SRP rise at an occupied camp | ≈ 1.4 µg/L | 0.3–3 | [inf]: 0.1 kg over 150 days into a 30 × 20 × 0.8 m band exchanged daily | L |
| Periphyton per unit hard surface at a camp | ×1–1.5 | ×1–2 | Mixed studies | L |
| Periphyton (aufwuchs) cover at camp frontage | ×0.7 (less wood and leaf surface, more sand) | — | Merrell 2009 | M |
| Septic nitrate-N, seasonal / year-round | 1.5–2.3 / 6–9 kg N/yr | — | EPA 2002; UF/IFAS | M–L |

### Gaps
- **Maine DEP manuals not read:** the Dennis 1986 and Dennis et al. 1992 manuals, and Maine Stormwater BMP Manual Vol. II
  Table 3.1, were blocked. A snippet gives roofs 0.5, driveways 1.75 and lawns 0.6–0.8 lb/acre/yr; unverified.
- **Hot Brook itself:** no Hot Brook camp count, septic survey or soil class.
- **Nearshore measurements:** none at any Maine camp shore.
- **Periphyton numbers:** Rosenberger et al. 2008 (*Freshw. Biol.* 53:1673) was not read (Wiley 403).

---

## 4. Macrophyte removal and shore clearing

### Takeaway
- **Developed frontage loses most of its emergent and floating-leaf plants:**
  - **about 66 % less** cover in front of developed lots in Minnesota;
  - about **20 % less** emergent in Wisconsin;
  - 20–28 % of these plants lost across Minnesota's developed lakes;
  - submerged plants change less, and in some lake classes not at all.
- **Docks add their own halo** (§1). Vermont's unbuffered frontage held about 0.7× the plant cover at 0.5 m, with the sign
  depending on lake class (losses in large and coloured lakes).
- **Clearing on land is the main change:**
  - Vermont: tree cover 2.7 vs 55 %;
  - Minnesota luxury-home lakes: 37 % of the whole shore altered;
  - Vermont: up to 74 % of a lake's buffer impacted;
  - Maine: excessive cutting is the most common shoreland violation.
- **Swimming areas** are cleared by hand. Maine allows hand removal and rock movement for swimming access under a permit-by-rule
  (Chapter 305 §6). Minnesota caps it at 2,500 ft² and 50 ft of frontage; Wisconsin at a 30-ft corridor.
- **For Hot Brook:** the camp shore is a wave-washed cobble and gravel bench, **already bare to about 0.6 m** (FIELD). Clearing
  there removes little underwater; the losses are on land (trees, shade, litter, insects) and in wood. In the sheltered weedy
  coves, any camp would remove emergent and floating-leaf beds as the studies show [inf].

### Cited findings
- **44 Minnesota lakes** (Radomski & Goeman 2001, *NAJFM* 21:46) [MN] [abstract and secondary]:
  - 12 aerial-photo plots of 935 m² per shore type;
  - **66 % less** emergent and floating-leaf coverage on developed shoreline;
  - an estimated **20–28 %** loss across Minnesota's clear-water centrarchid–walleye lakes;
  - plant occurrence correlated with relative biomass and mean size of northern pike, bluegill and **pumpkinseed**. The direction
    was not in the abstract.
- **Wisconsin** (Jennings et al. 2003) [WI] [primary]:
  - with a house in the adjacent riparian zone, "about 20 % less emergent vegetation" (P = 0.013);
  - floating vegetation fell with site development and lake density (both P < 0.0001), with an interaction;
  - submerged vegetation was affected by neither.
  - The authors cite direct removal, chemical treatment and boating (Asplund & Cook 1997).
- **Vermont** (Merrell et al. 2009) [NE] [primary]:
  - plant cover at 0.5 m was 9.5 vs 14.1 % (n.s. overall);
  - Fig. 7, read by eye: small oligotrophic and mesotrophic lakes had **more** cover at developed sites; large lakes and
    dystrophic (coloured) lakes had less;
  - the relative percent difference was about −35 % for small dystrophic and about −50 % for large mesotrophic lakes, i.e. about
    0.6–0.7× [inf].
- **Minnesota dock study** [MN] [primary]:
  - developed lots had fewer emergent and floating-leaf plants and lower richness;
  - emergent and floating richness and the number of sensitive species rose with the Score Your Shore score;
  - submerged biovolume was unrelated to that score.
- **Minnesota rule** [MN] [snippet — [MN DNR](https://dnr.state.mn.us/shorelandmgmt/apg/regulations.html); [Minn. R. 6280.0250](https://www.law.cornell.edu/regulations/minnesota/Minn-R-6280-0250)]:
  - no permit needed to cut or pull submerged plants for a swimming or docking area of **≤ 2,500 ft² (232 m²)**;
  - **≤ 50 ft (15 m)** of frontage or half the frontage, whichever is less;
  - plus a 15-ft channel;
  - not in posted spawning areas.
- **Wisconsin NR 109** [WI] [snippet]: manual removal without a permit along a **30-ft (9 m)** corridor.
- **Maine NRPA Permit by Rule, Chapter 305 §6** [ME] [snippet; text 403]:
  - "limited rock movement or hand removal of vegetation below the normal high water line of a great pond … to provide swimming
    or navigation access";
  - cut plants must be removed from the water;
  - later clearing must stay in the same footprint;
  - work is done at low water; no rock may be removed from the water;
  - photos are due within 20 days.
  - No area limit appeared in the snippet.
- **Maine shoreland vegetation rules** [ME] [snippet of DEP text, maine.gov 403; municipal ordinance via [ecode360](https://ecode360.com/45436725)]:
  - within 75 ft of the high-water line, at most 40 % of the volume of trees ≥ 4 in DBH may be removed in 10 years;
  - no canopy opening > 250 ft² (23 m²);
  - one footpath ≤ 6 ft wide per lot or per 250 ft of frontage, with no clear line of sight to the water;
  - a "well-distributed stand" scoring ≥ 12 points per 25 × 25 ft (one ordinance).
  - Camps built before shoreland zoning (1971) are grandfathered nonconforming structures, with a lifetime 30 % expansion limit.
- **Maine DEP Biennial Shoreland Zoning Report, 2005** [ME] [primary — [Maine Legislative Library](https://lldc.mainelegislature.org/Open/Rpts/kf5627_z99m246_2005.pdf)]:
  - 271 reporting code officers confirmed **566 violations** in 2002–03;
  - "Excessive cutting of vegetation appears to be the violation that occurs most frequently";
  - "Few violations pertain to the creation of new clear-cut swaths to the water", but owners tend "to reduce the width of the
    buffer, and cut more trees than permitted";
  - 1,255 new principal structures and 1,488 expansions statewide in two years.
- **Alteration of the whole shore** [MN] [primary, via sub-researcher — [MN DNR Douglas County 2008](https://files.dnr.state.mn.us/areas/fisheries/glenwood/douglas_county_shore_habitat.pdf)]:
  - 16 year-round, luxury-home lakes;
  - **37 %** of shoreline altered (11–75 %);
  - of alterations: riprap 70 %, imported sand 18.7 %, lawn 9.5 %, walls 2.2 %.
- **Vermont buffers** [NE] [primary — Merrell 2009, citing Capen et al. 2008]: development had impacted the buffer on up to 74 %
  of a lake's shoreline (74 lakes in Vermont's Northern Forest).
- **Northern Wisconsin lots** (Elias & Meyer 2003, *Wetlands* 23:800) [WI] [abstract]:
  - 97 developed vs 85 undeveloped lots;
  - less canopy, sub-canopy and especially shrub cover on developed lots;
  - less overhanging vegetation;
  - in the water, less coarse wood and floating vegetation.

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Emergent + floating-leaf plants in front of a camp | ×0.35 | 0.34–0.8 (Radomski 0.34; Jennings 0.8 for emergents) | Radomski & Goeman; Jennings 2003 | M |
| Submerged plants in front of a camp (beyond the dock halo) | ×0.8 | 0.6–1.0 (Vermont large and coloured lakes about 0.6–0.7; Wisconsin no change) | Merrell; Jennings; MN | L–M |
| Swim-area clearing (hand pulling and rock moving) | 0.3–1.2 m deep × 9–15 m wide × to about 15 m out (≤ 230 m²) at about half of occupied camps. Re-cleared each June in the same footprint | — | MN 2,500 ft² / 50 ft; WI 30 ft; ME PBR §6 (no area given) [inf for the share] | L |
| Shore trees at camp frontage | ×0.05–0.3 tree cover in the cleared view corridor; shading at 1 m ×0.48 | — | Merrell 2009 (2.7 vs 55 %; 7.2 vs 15.1) | M |
| Cleared fraction of a camp's frontage | 0.3–0.6. Grandfathered camps often open to the water; new ones 6-ft path plus ≤ 250 ft² openings | — | Maine rules; DEP 2005; [inf] | L |
| Leaf litter in the shallows at camp frontage | ×0.43 | — | Merrell (2.3 vs 5.3 %) | M |
| Sand / embeddedness at camp frontage | Sand ×1.8; embeddedness ×1.5 (fines from lots and roads) | — | Merrell; Jennings 2003 | M |
| Insect fall-in at camp frontage | ×0.05–0.2 (unchanged) | — | LLS §1 | — |

### Gaps
- **No Maine survey of lakefront buffer condition or lawn share.**
- **Unread primary sources:**
  - LakeSmart results;
  - the Maine Chapter 1000 guidelines (403);
  - Radomski & Goeman 2001 full text (the fish correlation directions);
  - Hicks & Frost 2011 (Ontario cottage lakes' macrophytes; not found).
- **How often Maine camp owners rake swim areas is unknown.** Ask the human.

---

## 5. Boats and people

### Takeaway
- Hot Brook's boats are small fishing outboards, canoes and kayaks. Upper has a launch; Lower can only be reached by paddling
  the brook, or from its new east-shore landing [inf].
- **Bed stirring by props:**
  - a 10-hp prop mixes to about 1.8 m and a 28-hp prop to about 3 m;
  - stirring is strongest at 0.9 m over silt and muck, half that at 1.8 m, none at 2.4 m;
  - few effects below about 3 m;
  - the worst case is "plowing" just below planing speed;
  - turbidity is back to background in about 5.5–24 h.
- **Maine's 200-ft (61 m) headway-speed zone** keeps planing boats off the camp shallows and loon nests, except for anglers
  "actively fishing". The 15-ft (4.6 m) / 300-ft wakesurf ban excludes almost all of Hot Brook.
- **Wildlife:**
  - loon nests sit 5–20 cm above water; a standard motorboat's wake is 13–15 cm at 15 m;
  - loons react to boats at about 140 m and flush from canoes at about 110 m; the advice is ≥ 46 m;
  - waterbirds flush from a 14-ft motorboat at 23–58 m; buffers are 100–180 m;
  - bald eagles: boats 100 m from nests, docks and moorings 200 m;
  - turtles are knocked off basking logs 0.15–1.23 times an hour from May to August, for about 24 min each time.
- **Seasonal camps:**
  - docks go in between ice-out and Memorial Day and come out mid-September to mid-October;
  - use runs about 90 days, peaking June–August;
  - holiday weekends bring 3–4.5× weekday boat traffic.

### Cited findings (sub-researcher, except where noted)

**(a) Motorboats in shallow water**
- **Effective mixing depth by engine size** (Nedohin & Elefsiniotis 1997, Table I) [other-CA] [primary — [NH legislative study copy](https://gc.nh.gov/statstudcomm/committees/1434/documents/Horsepower%20and%20mixing%20depth%20study%20Manitoba.pdf)]:
  10 hp → 1.8 m; 28 hp → 3.0 m; 50 hp → 4.6 m.
- **Asplund 2000** (WDNR PUBL-SS-948-00) [WI] [primary — [WDNR](https://dnr.wisconsin.gov/sites/default/files/topic/Lakes/BoatImpactOnLakes.pdf)]:
  - Yousef et al. 1980: TP up 28–55 % at mixed sites; peaks within 2 h; turbidity > 24 h to recover.
  - Hilton & Phillips 1982: background turbidity 5.5 h after boating stopped.
  - USACE 1994: in silt, stirring was greatest at 3 ft, about half at 6 ft and none at 8 ft. A boat pass at 3 ft equalled a
    20-mph wind.
  - Asplund 1996: holiday weekends had 200–350 % more boats; weekend Secchi was 10 % lower.
  - "Few impacts have been noted at depths greater than 10 feet."
  - Bhowmik 1992: boat waves averaged 1–25 cm, with a maximum of 60 cm.
  - Waves < 12 cm did not move sediment (St. Croix River). Banks erode above 30–35 cm (Nanson 1994).
  - Older 2-stroke motors pass 25–30 % of fuel unburned. Outboard exhaust was about 1 % of a lake's N load.
  - Mueller 1980: nesting sunfish leave the nest when canoes or motorboats pass, for longer when passes are close or slow.
    Lagler 1950: no egg or fry loss.
- **Beachler & Hill 2003** (*LRM* 19:15) [WI] [secondary, press release]: the greatest stirring was at 6–8 mph in < 6–8 ft of
  water.
- **Daeger et al. 2022** (*Proc. Indiana Acad. Sci.* 130:112) [other] [primary]: over muck, idling stirred the bed in 3 ft and
  plowing in 5 ft; nothing in 10–15 ft.
- **Anthony & Downing 2003** (Clear Lake, Iowa; mean 2.9 m) [abstract]: boat traffic was linked to turbidity rises of up to
  50 % and affects about 56 % of the lake. Wind confounds it; > 10 m/s winds mobilize > 46 % of the bed.
- **Macrophytes:**
  - Asplund & Cook 1997: excluding boats raised plant biomass, cover and height in about 1 m of water, by scour and cutting,
    not turbidity.
  - Murphy & Eaton 1983 (canals): plants were suppressed above about 2,000 passes a year.

**(b) Maine law and how camps are used**
- **12 MRSA §13001(29)** [ME] [primary — [statute](https://legislature.maine.gov/legis/statutes/12/title12sec13001.html)]: the
  "water safety zone" is the water within 200 ft of any shore.
- **12 MRSA §13068-A** [ME] [primary — [statute](https://legislature.maine.gov/legis/statutes/12/title12sec13068-A.html)]:
  - (13) headway speed only in that zone, except "while actively fishing" or picking up skiers;
  - (7) operators must avoid wake damage to piers, floats and shores;
  - (9) no harassing wildlife;
  - (18) no wakesurfing in < 15 ft of water or within 300 ft of shore;
  - (16) horsepower limits apply only to listed ponds; Hot Brook is not listed.
- **Docks in** [ME] [primary news — [Stiles Dock Service, 2016](https://business.thewindhameagle.com/2016/04/business-spotlight-stiles-dock-service.html)]:
  - customers want docks in "before Memorial Day";
  - in a late year, installs could not start until the third week of April;
  - removal is booked by Aug 31;
  - the average dock has 5 sections (range 1–25).
- **Docks out** [ME] [snippet]:
  - the Town of Wilton removed its launch docks in the week of Oct 13, 2025;
  - "temporary" docks are those in the water < 7 months a year (LD 2474 / LD 400).
- **Occupancy** [MN/WI] [primary news / snippet]:
  - Minnesota second homes: 93 days a year, peaking June–August;
  - northern Wisconsin: median 30 days;
  - Minnesota Lakes and Rivers Advocates: 55 days.
- **Danforth ZIP 04424** [ME] [snippet, aggregator]: 51.7 % of 1,021 housing units are "vacant", a proxy for seasonal camps. The
  Census API needs a key requested by email, so it was skipped.

**(c) Wildlife disturbance**
- **Loons:**
  - **Maine Audubon / Maine Lakes / LEA / Penobscot Nation brochure** [ME] [primary — [PDF](https://cdn.branchcms.com/DrynVOJolO-1457/docs/3_brochure_How-Close-Is-Too-Close_16-x-9-Open-Double-Gatefold-for-print-1.pdf)]:
    - incubation runs "between late May and July";
    - the advice is "at least 150 feet";
    - "Boat collisions are a leading cause of loon deaths";
    - quiet canoes and fishing boats along shore still startle nesting loons.
  - **Vermont Center for Ecostudies** [NE] [primary blog — [VCE](https://vtecostudies.org/blog/wakeboats-risks-loon-nests)]: nests
    sit 2–8 in above water; a standard motorboat at 50 ft makes about a 5–6 in wave.
  - **Reaction distances** [snippet]: mean flush from a canoe 110 m (Smith 1981); first reaction 140 ± 40 m on quiet lakes. Loons
    on motorboat lakes habituate (Titus & VanDruff 1981).
  - **Loon Preservation Committee, NH** [primary blog]: raccoons followed camp development; natural nest sites were lost.
  - **Spilman et al. 2014** (Adirondacks) [snippet]: nesting pairs were more likely on lakes with less development (R² = 0.25).
  - **McCarthy & DeStefano 2011** [abstract]: disturbance predicted nest-site choice, not territory success.
  - **Lead tackle** [NE] [snippet — [LPC](https://loon.org/loons-and-lead/ingested-lead-tackle/)]:
    - ingested lead jigs and sinkers caused **49 %** of New Hampshire adult loon deaths recovered in 1989–2011, and **36 %** in
      1989–2025;
    - that cost about a 1.4 % fall in the population growth rate;
    - Maine banned small lead sinkers in 2002 and later jigs; Maine loon lead deaths fell from > 30 % (1987–2001) to < 20 %
      (2013–2016).
- **Other waterbirds:**
  - Rodgers & Schwikert 2002 (*Conserv. Biol.* 16:216; 23 Florida species) [secondary]:
    - mean flush 75–190 ft from a 14-ft motorboat and 65–160 ft from personal watercraft;
    - buffers: wading birds 590 ft (180 m), terns and gulls 460 ft, osprey 490 ft.
  - Rodgers & Smith 1997 [abstract]: buffer = exp(m + 1.6495 s) + 40 m; about 100 m protects most species.
- **Bald eagles** (USFWS 2007 guidelines) [US] [primary table]: motorized and non-motorized watercraft 330 ft (100 m); dock or
  mooring installation and shoreline alteration 660 ft (200 m).
- **Turtles** (Jain-Schlaepfer et al. 2017; northern map turtle, Ontario) [ON] [secondary]:
  - boat disturbances 0.15 (early May), 0.32 (June), 0.96 (July) and 1.23 (August) per hour;
  - 24.3 min to resume basking;
  - −0.34 °C mean body temperature in May.
  - A boat approach cut basking by 43.8 % over the next 6 h [snippet].

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Headway-only zone | 61 m from any shore or island; anglers fishing exempt | — | 12 MRSA §13001(29), §13068-A(13) | H |
| Wakesurf exclusion | Depth < 4.6 m or < 91 m from shore (all of Hot Brook in practice) | — | §13068-A(18) | H |
| Typical Hot Brook motor | 9.9–25 hp on 14–16 ft boats | up to about 60 hp | [inf] from the unimproved launch and the fishery | L |
| Prop mixing depth | 10 hp 1.8 m; 28 hp 3.0 m; 50 hp 4.6 m | — | Nedohin & Elefsiniotis 1997 | M |
| Resuspension vs depth (silt, muck) | Max at 0.9 m; ½ at 1.8 m; 0 at 2.4 m | idle 0.9 m; plowing to 1.5 m | USACE 1994; Daeger 2022 | M |
| Worst speed | Plowing at 10–13 km/h | — | Beachler & Hill 2003 | M |
| Local TP after heavy boating | +28–55 % | — | Yousef 1980 | L–M |
| Decay after boating stops | Turbidity to background in 5.5 h | to > 24 h | Hilton & Phillips; Yousef | M |
| Boat traffic, weekend or holiday vs weekday | ×3–4.5 holiday; about ×2.5 ordinary weekend | — | Asplund 1996; ANG | M |
| Boat traffic, Upper | About 12 angler-h/ha/yr (ANG) ≈ 2,000–2,500 boat-h/yr, about 80 % in May–Sept; ≈ 10–20 boat-h per summer day | — | [inf] from ANG | L |
| Boat wave height | 13–15 cm at 15 m (standard motorboat) | mean 1–25 cm; max 60 cm | VCE; Bhowmik | M |
| Shore-sediment threshold / bank erosion | 12 cm / 30–35 cm waves | — | St. Croix; Nanson | M |
| Plants in boat lanes (< about 1 m) | Lower biomass, cover and height (scour); suppression above about 2,000 passes a year | — | Asplund & Cook 1997; Murphy & Eaton | M |
| Fish retreat from a passing boat | To cover, normal in 30 s; nesting sunfish leave the nest briefly | — | Beauchamp 1991; Mueller 1980 | M |
| Loon nest height; flooding wave | 5–20 cm; flood if wave ≥ nest freeboard | — | VCE | M |
| Loon response distances | Reaction 140 ± 40 m; flush 110 m (canoe); habituate on busy lakes | advice ≥ 46 m | Smith 1981; Titus & VanDruff | M |
| Loon lead mortality (adults) | About 20 % of adult deaths post-ban in Maine; 36–49 % in NH series | — | LPC | M |
| Waterbird flush distance, small motorboat | 23–58 m | PWC 20–49 m | Rodgers & Schwikert | M |
| Waterbird buffers | 100 m general; 180 m wading birds | — | Rodgers & Smith; R&S | M |
| Eagle nest buffers | Boats 100 m; docks and moorings 200 m | — | USFWS 2007 | M–H |
| Turtle basking disturbance | 0.15 → 1.23 per hour (May → Aug) where boats pass; 24 min off the log each | — | Jain-Schlaepfer 2017 | M |
| Docks in / out | In mid-May → Memorial Day (after ice-out, about Apr 23 in the sim's calendar); out mid-Sept → mid-Oct | in from late April; out by about Oct 31 | Stiles; Wilton; 7-month rule | M |
| Camp occupancy (seasonal) | About 75–95 days. Daily occupied fraction about: May 0.1, Jun 0.4, Jul 0.75, Aug 0.75, Sep 0.35, Oct 0.1, Nov–Apr about 0 (a few ice-fishing day visits). Weekends ×2 weekdays | 30–95 days | MN 93; WI 30; MLRA 55; NH TMDL 90; Ontario 0.69 capita-yr [inf for the monthly shape] | L–M |

### Gaps
- No Maine study of camp occupancy by month, and no Hot Brook boat or launch count.
- Heimberger et al. 1983 (cottages and loon nesting) and the Titus & VanDruff numbers were not read (403).
- No Maine loon nest-failure cause breakdown, and no Hot Brook loon nest site.
- Beachler & Hill 2003 and Yousef 1980 full texts not read.

---

## 6. Anything else for realism

### Takeaway
- **Lights at camp docks.** A shore lamp multiplies flying aquatic insects at it by **76–267×**, with emergence ×2. About ⅓ of
  attracted insects die by morning. Fish feed under lamps (planktivores take more zooplankton; large predators hold station at
  the light edge). A summer-evening insect hotspot belongs at occupied camps.
- **Riprap** is fish- and invertebrate-friendly compared with walls and beaches; richness ≈ natural or higher. It is common on
  heavily developed lakes (28 % of shore on Minnesota luxury lakes) and probably rare at Hot Brook's camps [inf].
- **Imported sand beaches** are the poorest littoral habitat; Maine forbids bringing sand in without a permit.
- **Docks and decks are emergence perches for dragonflies.** Lawns, beaches and smooth walls are not. Odonate exuviae at
  unbuffered frontage were **0.18×** reference.
- **The launch is the invasive-plant door.** About 3–4 % of boats inspected in Maine carry plant fragments, about 0.1 % carry an
  invasive, and variable milfoil reached Washington County (Big Lake) about 2018.
- **Lead tackle** remains a loon killer (§5).
- **Geese on lawns** add P; fuel from old 2-strokes is minor.

### Cited findings (sub-researcher, except Engel and Merrell)
- **Lights:**
  - **Manfrin et al. 2017** (*Front. Environ. Sci.*; one 70-W HPS lamp, max about 50 lux) [other] [primary — [Frontiers](https://www.frontiersin.org/journals/environmental-science/articles/10.3389/fenvs.2017.00061/full)]:
    - aquatic emergence ×2;
    - flying aquatic insects ×76 (2012) and ×267 (2013);
    - flying terrestrial insects ×34.
  - **Eisenbeis 2006** [secondary]: about ⅓ of attracted insects die. A streamside lamp killed as many caddisflies as emerged from
    200 m of stream in a season.
  - **Polish lake enclosures** (2022, PMC9692195) [other] [primary]: a 70-W lamp, about 8× full-moon light; young perch took more
    zooplankton; calanoids and *Diaphanosoma* fell.
  - **Becker et al. 2013** (estuary) [abstract]: predators > 500 mm held station under the lights.
- **Riprap and walls:**
  - **Brauns et al. 2007** (*J. Appl. Ecol.*; 7 German lakes) [abstract]:
    - eulittoral richness and abundance were lowest at beaches and walls, and riprap ≈ natural;
    - beaches cut mayflies, caddisflies and shredders at 0.2–1.2 m.
  - **Gabriel & Bodensteiner 2011** (*Wetlands* 32:105) [abstract]: fish were about 2× as abundant, and larger, at natural vs
    riprapped wetland shores.
  - **Riprap fauna** (Engel & Pederson 1998 [primary review]): it draws minnows and largemouth bass (Prince & Maughan 1979).
    Riprap and seawalls, "with solid attachment for snails and clams", can attract exotic attaching species.
- **Beaches:**
  - **Maine NRPA Chapter 305 §12** [ME] [snippet]: sand already on a great-pond beach may be retrieved and redistributed; sand
    "may not be brought in from off-site".
  - **Vermont** (Merrell 2009): sand cover 59 vs 33 % at developed frontage.
- **Docks as substrate** (Vermont; Burnham, Howe & Merrell) [NE] [primary slides]:
  - odonate exuviae were found on trees, ferns, emergents, "docks and decks" and rock walls;
  - never on smooth seawalls, beaches or lawns;
  - 70 % of all skins came from 3 lightly developed lakes.
  - Repo cross-references: *Dolomedes* fishing spiders hunt from docks; invertebrates live on wooden ramps (LSW).
- **Treated wood:**
  - Weis & Weis 1996 [snippet]: Cu/Cr/As leaching into estuarine sediments.
  - Other dock studies found little biological effect [snippet].
- **Invasives:**
  - **Maine Courtesy Boat Inspection** [ME] [snippet]:
    - 2022: 88,357 inspections, 3.6 % with fragments;
    - 2014: 2.6 % with fragments, 5 % of those invasive;
    - under 1 % of Maine's lakes are infested.
  - **Big Lake, Washington County** [ME] [primary — [LD 2141 testimony](https://legislature.maine.gov/testimony/resources/IFW20240131Palmer133509684840550117.pdf)]:
    invasive milfoil found "about six years ago".
- **Geese:**
  - 0.5–1.2 g P per goose per day (pond-management sources) [low].
  - Wintergreen Lake, Michigan: waterfowl supplied 70 % of external P (Manny et al. 1994) [abstract].
  - Haunted Lake TMDL: 0.0015 kg P per bird per day.
- **Trampling:** foot traffic eroded every trampled St. Croix site (Asplund 2000).

### Values for the sim

| Parameter | Value | Range | Source | Conf. |
|---|---|---|---|---|
| Dock or porch light at an occupied camp | Lit on about 50 % of occupied nights, dusk to about 23:00 [inf]. Flying aquatic insects ×76–267 within about 20 m; ⅓ fall into the water or die; local fall-in hotspot | — | Manfrin 2017; Eisenbeis | M (multiplier); L (usage) |
| Fish under a lit dock at night | Young perch, sunfish and fallfish feed at the light edge; zooplankton take up; bass and pickerel hold at the edge | — | Polish enclosure 2022; Becker 2013 | L–M |
| Riprap share of camp frontage, Hot Brook | 0–10 % | MN luxury lakes 28 % of shore | [inf]; MN DNR 2008 | L |
| Riprap habitat value | Fish and invertebrate richness ≈ natural; crayfish and smallmouth cover | — | Jennings 1999; Brauns 2007; Engel | M |
| Imported-sand beach | Rare (illegal without a permit); where present, inverts lowest; nests of pumpkinseed possible on sand/gravel | — | Maine PBR §12; Brauns; Colgan & Ealey | M |
| Odonate emergence at camp frontage | ×0.18, but docks and decks serve as perches | — | Merrell 2009; VT slides | M |
| Launch invasive pressure | Boats with fragments 3–4 %; invasive about 0.1 % of boats; regional milfoil since about 2018 | — | Maine CBI; LD 2141 | M |
| Old 2-stroke fuel loss | 25–30 % unburned; exhaust about 1 % of N load | — | Asplund 2000 | M |
| Goose P | 0.5–1.5 g per bird per day, only where lawns reach the water | — | Haunted Lake TMDL; secondary | L |

### Gaps
- No freshwater measurement of fish gathering under camp lights.
- No Maine data on dock size, riprap or beach prevalence.
- Nothing quantitative on pets, campfires or fish cleaning at docks. Fish offal is a small P and scavenger subsidy [inf].

---

## 7. What changes in the existing notes and reports

1. **CWD: the "No Maine or New England lake CWD count" gap** (SGV §6 Gaps; LSW §2 Gaps) is partly closed by Vermont DEC (Merrell
   et al. 2009):
   - large wood > 10 cm, counted to 2 m depth: about 810 pieces/km at reference sites and about 310 at unbuffered developed
     sites (×0.38);
   - medium wood ×0.12; fine wood ×0.23.
   - LSW's camp-shore class (30–100 logs/km) stands. The frontage factor is now sourced at 0.1–0.38.
2. **Shoreline residential P** (LLS §7: "0.25–2.7 kg/ha/yr") becomes **0.15–0.2 kg per lot a year** (available P; Dennis et al.
   1992 via Maine PCAPs). A per-hectare coefficient on a camp lot is the wrong unit for a sim that places individual camps.
3. **Camp roads** (LLS §7: 2.0 kg/ha/yr):
   - keep 2.0 as **available** P;
   - in the form-resolved inflow of CPL, deliver it as **9.0 kg TP/ha/yr of road surface, about 22 % available** (CPL's PP
     availability 0.2 fits), plus **41 t sediment/ha/yr**, at culverts during events (Dudley et al. 1997, a Maine cottage road).
4. **Septic** is new: SRP at the camp shore during occupancy, about 0.1 kg/yr per seasonal camp, plus about 1.5–2.3 kg
   nitrate-N.
5. **"Boat wakes on loon nests"** (reports/Maine lake shores and catchment.md, shore-type row) now has numbers:
   - waves of 13–15 cm at 15 m;
   - nests 5–20 cm above water;
   - Maine's 61-m headway zone.
6. **CPL's "if the lakes are mesotrophic, add camps" option** is ruled out as an explanation: 20–40 camps add only 0.1–0.2 µg/L
   lake-wide. Mesotrophy, if real, must come from wetland inflow or internal loading.
7. **ANG's "about 15 camps on Upper"** is kept as the floor. The scenario central value here is 20.

---

## 8. A camp as a sim entity [inf] — a proposed structure, not a coded change

**Each camp holds:**
- a shore position;
- frontage of 30–60 m;
- year built, or "pre-1971" grandfathered;
- seasonal or year-round;
- dock (yes/no, footprint);
- swim area (yes/no);
- light (yes/no);
- road length to shore;
- septic distance to water.

**Its effects, all scaled by an occupancy schedule (§5):**
- **Littoral habitat at the frontage:**
  - wood ×0.15 (and remove new windfalls);
  - emergent and floating-leaf plants ×0.35;
  - submerged plants ×0.8;
  - leaf litter ×0.43;
  - sand and fines up (×1.8 sand);
  - aufwuchs ×0.7;
  - insect fall-in ×0.05–0.2;
  - odonate emergence ×0.18.
- **Dock (in late May → mid-Oct):**
  - light ×0.1 and plants ×0.05 beneath;
  - halo to 8 m (emergent odds ×1.38 per m);
  - invertebrates ×0.4 beneath;
  - shade attraction for sunfish < 12 cm on bright days;
  - transit only for bass;
  - no attraction for perch and suckers;
  - no bass nests on the dock's own footprint.
- **Swim area:** plants hand-pulled each June over ≤ 230 m², at about half of camps.
- **Nutrients:**
  - septic SRP into the nearshore band during occupancy (0.1 kg/yr at full use, lagged);
  - lot runoff 0.15 kg P/yr in storms and snowmelt;
  - road 9 kg TP/ha of road a year, 22 % available, plus 41 t sediment/ha at the nearest culvert in events;
  - nitrate 1.5–2.3 kg N/yr.
- **People:**
  - boat trips from the camp, weekend-weighted;
  - headway speed within 61 m except when fishing;
  - prop stirring per §5 over < 2.4 m;
  - disturbance radii: loons 110–140 m, waterbirds 23–58 m (flush), turtles knocked off logs;
  - night light per §6;
  - angling at the dock (a shore angler at the camp; ANG).
- **Launch** (Upper south end):
  - boats per day as ANG and §5;
  - resuspension at the toe;
  - a small per-boat invasive-fragment chance (0.1 %) as a what-if switch.

**Validation targets for a gate or what-if, not to be tuned toward:**
- whole-lake TP change matches §3's formula;
- local plant and wood contrasts match Merrell, Garrison and Lepore;
- bass nests avoid docks (< 2 % at human structure).

---

## Access log

**Read in full (by me):**
- WDNR pier-shading press release
- Merrell, Howe & Warren 2009 (Vermont *LakeLine*)
- Jennings et al. 2003 (WDNR scan)
- Weis & Sass 2011 (WDNR copy)
- Wolter 2012 (WDNR review)
- Ziegler et al. 2019 (NSF PAR)
- WDNR Sanford Lake fact sheet
- TRPA piers memo 2016
- LCCMR Minnesota dock study final report
- Engel & Pederson 1998, the pier, woody-debris and riprap sections: a 14.6-MB PDF downloaded to the scratch folder and converted
  to text, because it was over the fetch tool's limit
- Maine DEP 2005 biennial shoreland zoning report (Maine Legislative Library)

**Read by sub-researchers:** listed in §3 and §§5–6, with their access tags.

**Blocked or unreadable (not worked around):**
- **TLS certificate rejected:** www3.uwsp.edu. This hosts the Garrison 2005 report, Schindler 2000, Scheuerell & Schindler 2004,
  Francis & Schindler 2006, Radomski & Goeman 2001, Ahrenstorff 2009, Helmus & Sass 2008, Elias & Meyer 2003 and Dustin &
  Vondracek 2017.
- **403:**
  - maine.gov: the DEP shoreland vegetation page and NRPA permit-by-rule pages; www1.maine.gov §6 gave 404;
  - Wiley (Rosenberger 2008);
  - Taylor & Francis (Beachler & Hill 2003; others);
  - Canadian Science Publishing and BHL (Heimberger 1983).
- **Login redirects, not followed:**
  - Springer link pages, redirected to idp.springer.com;
  - works.bepress.com (Beauchamp 1994 abstract), redirected to digitalcommons.elsevier.com.
- **404:** lakeripley.org studies page; WDNR ss1006.pdf; the Ontario loading page.
- **Over the size limit or a scan:** the full USEPA 2002 manual; the Pend Oreille report (scan).
- **Key needed:** api.census.gov wants an API key obtained by email. Skipped; no email address was given to any service.
