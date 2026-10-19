# Small fish of a short lake-connecting brook: blacknose dace, young fallfish, other minnows, and sunfish in the pools (Hot Brook)

Compiled 2026-10-19. This note backs a fix for one problem in the 3-D sim: blacknose dace living in the closed brook are eaten out within one summer by the pickerel and bass that pass through it. It also checks the angler's summer observations.

**Builds on (does not repeat):**
- `Whole lake 3D fish simulation/habitat3d_new_species.md` Q2 (fallfish by mode) and Q4 (dace by mode: HSI habitat, Ucrit, Manitoba segregation, 680-m dispersal);
- `Whole lake 3D fish simulation/fallfish_spawning_brook.md` (dace densities 0.03–5.2/m², dace life span and mortality, fallfish piscivory, Fraser & Mottolese / Fraser & Emmons avoidance);
- `Whole lake 3D fish simulation/brook_food_web.md` §4 (Power 1987, Schlosser 1987 depth refuges; dace production);
- `Whole lake 3D fish simulation/movement_between_lakes.md` (bluegill and pumpkinseed crossing between lakes; CORDIS pumpkinseed);
- `Whole lake 3D fish simulation/fish_movement_and_groups.md` (redbreast tag–recapture);
- `Hot Brook populations and water/eastern_maine_relative_abundance.md` (EMAP Maine catches; young perch schools);
- `Hot Brook populations and water/drainage_species_and_eel.md` (61-lake regional species list).

**Conventions** (as the notes above):
- **Source flags:**
  - [ft] full text read;
  - [abs] abstract only;
  - [snip] seen only in a search summary;
  - [sec] a compilation (ADW, FishBase, Ontario LHD);
  - [ag] an agency page;
  - [ang] an angler account;
  - [sur] a surrogate species;
  - [inf] my inference.
- **Region tags:**
  - [N] New England, NY, Atlantic Canada, Quebec or Ontario;
  - [S] south of New Jersey;
  - [M] Midwest.

**Hot Brook settings (from the caller):**
- **The lakes:** Upper (~375 ha, 5.5 m) drains to Lower (~280 ha, 4 m). Both are shallow, unstratified and tea-coloured.
- **The brook:** ~150–200 m long and ~8 m wide. It has ~0.3-m riffles, a ~0.5-m run and a ~1.1-m pool at Upper's outlet, and it carries lake surface water.
- **The angler, in summer:**
  - Sunfish (mostly redbreast, some pumpkinseed, 18–21 cm) hold in the 3–4-ft pools.
  - Schools of small minnows pass through between the lakes; he is not sure whether they are young fallfish or dace.
  - Pickerel and bass are in the brook too.

**Access log:**
- **Blocked or failed:**
  - 403: mass.gov (MassWildlife), scholarlypublishingcollective.org (the relocated-dace paper), wildlife.nh.gov (the minnow ID poster), core.ac.uk;
  - a reCAPTCHA page at PMC (PMC2288673), which was skipped;
  - Springer redirects to a login (Harvey 1991; Harvey & Stewart 1991);
  - the Coweeta host for Hill & Grossman 1987 did not resolve.
- **Unreadable:** the Gerking 1953 PDF is a scanned image with no text layer, and no OCR tool was available.
- **Read in full:** MacRae & Jackson 2001 (PDF text layer) [ft]. Several fetches also returned model summaries of full pages: Brönmark et al. 2008 (PLoS ONE), Skov et al. 2013 (PMC), Gautreau & Curry 2012 (NENA online), and the CT DEEP, VT and WI DNR sheets.
- **Ignored:** two OpenAlex API responses carried embedded text asking an AI agent to request an API key using the user's e-mail. It was ignored.

**Key numbers at a glance**

| Quantity | Value | Source |
|---|---|---|
| Dace size | common 5.7 cm TL, max 12.4 cm; "commonly 1 to 3 inches", CT survey max 4.3 in (10.9 cm) | FishBase [sec]; CT DEEP [ag] |
| Dace lateral-line scales | **53–70** (fallfish **< 50**; creek chub 50–60) | FishBase; CT DEEP; WI DNR |
| Dace in ponds | "typically absent from large rivers and ponds" (CT). Less likely to occur in Adirondack lakes holding pike or bass, whose native-minnow richness is **~⅓** of lakes without them | CT DEEP [ag]; Findlay et al. 2000 [abs] |
| Small-bodied species lost to bass (Ontario lakes ≤ 50 ha) | **2.3 fewer** small-bodied species per lake. Fathead, *Phoxinus* (redbelly/finescale dace), brook stickleback and pearl dace were absent from every bass lake in the summer survey | MacRae & Jackson 2001 [ft] |
| Minnow crossing of a riffle (artificial streams) | **18.1 %** of fish per 30 min at 0 cm/s → **1.8 %** at 45 cm/s; **7.2 %** without predators → **20.2 %** with caged predators; mean group **1.2 fish** | Schaefer 2001 [abs][S] |
| Redbreast size, northern lake | mean **12.5 cm** TL (NB); guarding males **16.4 cm**; age 6 back-calculated **14.1 cm**. CT survey max **9.1 in (23 cm)**; "commonly 4 to 6 inches" | Gautreau & Curry 2012; CT DEEP |
| Stream fish movement direction | larger fish move **upstream**, smaller **downstream**; most movement in **spring**; spring 1969 daily means: 7 fish (1,081 g) up vs 17 fish (472 g) down | Hall 1972 [abs][S] |
| Winter refuge migration (surrogate) | roach leave the lake for streams **late Oct–Jan** and return **Feb–Apr**; staying in the lake raises cormorant predation (residents > 250 mm: up to **40 %** over winter) | Brönmark et al. 2008; Skov et al. 2013 [sur] |

---

## Q1. Blacknose dace in lake-connecting streams: occurrence, grouping, movement, persistence with piscivores, lake use

### Takeaway
- **Habitat:** blacknose dace are fish of small streams, the commonest fish of small headwater streams in Connecticut and "typically absent from large rivers and ponds". They are bottom-oriented, day-active riffle and run fish.
- **Grouping:** no study describes them schooling. The evidence points to loose aggregations at good sites, and to territorial males in the western form.
- **Movement:** stay at reach scale with some dispersal: relocated fish moved up to 680 m in a month, and a congener's home range is < 1 km. Nothing shows dace moving *between* lakes.
- **Lakes:** they do turn up in some lakes (15 of 61 lakes in Hot Brook's region; Adirondack lakes), but piscivores (pike, bass) make them less likely to occur there. In the western form, adults and young moved into beaver ponds in late fall.
- **Persistence:** in streams they persist with predators by using shallow, fast riffles and structure, and by actively leaving patches that hold predators.

### Cited Findings
**Where they live**
- **Connecticut:**
  - "Connecticut's most abundant fish of small headwater streams", "found in most small streams in Connecticut, where they are typically common to abundant".
  - "Typically absent from large rivers and ponds".
  - Habitat: "Prefer pools and rocky riffles of small to medium-sized streams".
  - Size: "Commonly 1 to 3 inches", state survey maximum 4.3 in.
  - [N] — [CT DEEP, Blacknose Dace](https://portal.ct.gov/DEEP/Fishing/Freshwater/Freshwater-Fishes-of-Connecticut/Blacknose-Dace) [ag]
- **Vermont:** "small, clear, swift flowing streams having gravel bottoms"; average about 2 in. [N] — [VT Fish & Wildlife baitfish sheet](https://VTFISHANDWILDLIFE.COM/sites/fishandwildlife/files/documents/Fish/baitfish/blacknose-dace.pdf) [ag][ft]
- **FishBase:** adults live in "rocky runs and pools of headwaters, creeks and small rivers"; common length 5.7 cm TL, maximum 12.4 cm. — [FishBase *R. atratulus*](https://www.fishbase.se/summary/2943) [sec]
- **Ontario LHD:** riverine, with a riverine nursery; "runs and pools of clear, cool, swiftly-flowing creeks and small rivers with gravelly substrate"; preferred 19–25 °C. There are no confirmed Ontario records of the eastern species. — [Ontario Freshwater Fishes LHD](https://ontariofishes.ca/fish_detail.php?FID=69) [sec]
- **Lake records, Adirondacks:**
  - Data from the 1984–87 Adirondack Lakes Survey show four native minnows less likely to occur in lakes with northern pike, largemouth or smallmouth bass: **creek chub, redbelly dace, blacknose dace and common shiner**.
  - Native minnow richness in those lakes was about **one-third** of that in lakes without them.
  - Of 13 minnow species, only the non-native bluntnose minnow and golden shiner were unaffected.
  - [N] — Findlay, Bert & Zheng 2000, *CJFAS* 57:570 ([OpenAlex record](https://api.openalex.org/works?search=effect%20of%20introduced%20piscivores%20on%20native%20minnow%20communities%20in%20Adirondack%20lakes)) [abs]
- **Adirondack resurvey of 45 lakes (1994–2005):**
  - Blacknose dace, fallfish and fathead minnow were the three acid-sensitive minnows "ubiquitous enough" to serve as indicators.
  - The three species *together* held 1 population in 1984–87 and 4 in 1994–2005.
  - So dace occur in lakes, but rarely.
  - [N] — [Roy, Bulger & Driscoll, NADP 2009 abstract](https://nadp2.slh.wisc.edu/conf/2009/abstracts/roy.htm) [abs]
- **Hot Brook's region:** blacknose dace appear in **15 of 61** lakes of Hot Brook's region, and on Hot Brook's own MDIFW list as a seine-caught fish. — `Hot Brook populations and water/drainage_species_and_eel.md` (Lake Fish of Maine workbook)
- **Late-fall lentic use** (western form, Manitoba; now *R. obtusus*):
  - "In the late fall, blacknose adults and juveniles were found only in beaver ponds."
  - Young share "shallow, silted margins of the stream, of little or no current" and stay up to a year (to ~45 mm), then move to channels of 15–45 cm/s.
  - Males are "territorial over pea-sized gravel".
  - [N-west][sur] — [Gibbons 1971, U. Manitoba thesis](https://mspace.lib.umanitoba.ca/handle/1993/5822) [abs]

**Grouping**
- No field or lab study of blacknose dace schooling or shoaling was found (several searches).
- The only behavioural notes are:
  - territorial males in the western form (Gibbons 1971, above);
  - mass spawning with no territories in the eastern subspecies (Raney 1940, in `habitat3d_new_species.md` Q4).
- **Cyprinid surrogate:** minnows crossing riffles in artificial streams went mostly singly (mean group **1.2 fish**). Groups were larger only over shallow riffles or under predation threat. [S][sur] — [Schaefer 2001, *Freshwater Biology* 46](https://research.fs.usda.gov/treesearch/9696) [abs]

**Movement and site fidelity**
- **Congener home range:** Nooksack dace (*R. cataractae* ssp.) "hold very small home ranges (< 1 km)" and are not likely to "traverse over 10 km of unsuitable habitat". [sur] — [COSEWIC Nooksack dace, ch. 9](https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/nooksack-dace/chapter-9.html) [ag]
- **Virginia stream network** (Albanese, Angermeier & Dorai-Raj 2004, mark–recapture of 4 species and traps for 8):
  - Emigration from a reach **fell with habitat complexity** and with distance from the mainstem, and rose with intermittency and body size.
  - Upstream trap counts tracked flow, day length and temperature.
  - It is not confirmed that blacknose dace was among the species.
  - [S] — [USGS record](https://pubs.usgs.gov/publication/70027270) [abs]
- **Home range values:** Hill & Grossman 1987 (*Copeia* 1987:376–380) gives home ranges for three stream fishes. Only the citation was found. — [LTER bibliography](https://lternet.edu/biblio/home-range-estimates-for-three-north-american-stream-fishes) [snip]
- **No study** tracks blacknose dace through a lake or between lakes.

**Persistence with piscivores**
- **Patch avoidance:**
  - In a seminatural artificial stream, juvenile blacknose dace and creek chub "actively avoid locations in the artificial stream that contain predators" (adult creek chub).
  - Structure and time of day mediate the response: prey "are most likely to enter those patches during daylight or when structure is present".
  - — [Fraser & Cerri 1982, *Ecology* 63:307 (AGRIS)](https://agris.fao.org/search/zh/records/65de3a467c7033e84bea221b) [abs]
- **Michigan:** dace abundance was negatively associated with woody substrate and with brook trout density. [M] — [Upper Manistee study, Midwest F&W Conference 2018](https://midwestfishwildlifeconferen2018.sched.com/event/D10A/fish-habitat-genetics-habitat-associations-of-blacknose-dace-in-the-upper-manistee-watershed-michigan-usa) [snip]
- **Lakes:**
  - Vulnerable small-bodied species were absent from all bass lakes, or confined to complex habitat by day (MacRae & Jackson 2001; see Q3 and Q5).
  - Dace are less likely to occur in Adirondack piscivore lakes (Findlay et al. 2000, above).

### Inferences
- **Population structure:** Hot Brook's dace are a **brook-resident population**.
  - Dace found in the lakes would be at the mouths, close to the brook.
  - Between-lake movement through open lake water should be ~0, because the lakes are the predator-filled matrix where dace are excluded (Findlay; MacRae & Jackson) [inf].
- **No rescue:** dace from Upper's inlets or Lower's 2.95-km outlet can reach the brook only across a lake, so rescue is negligible. The brook population must persist on its own [inf].
- **Why the sim loses them:** real dace persist with pickerel, bass and trout because they hold water large fish don't hunt, and leave patches that hold predators.
  - A brook with no usable refuge, where dace do not avoid predators, loses its dace. That matches the lake pattern, where the vulnerable species disappear unless structure is available [inf].
- **Winter:** dace should winter in the brook's deepest slack water (the 1.1-m pool and the mouths) [inf]. The basis is the late-fall move into beaver ponds (Gibbons) and winter "deep water" (Trial 1983, in `habitat3d_new_species.md`).

### Gaps
- **Lake connections:** no study of blacknose dace at lake inlets or outlets, or in a stream connecting two lakes.
- **Movement:** no home-range, PIT or telemetry data for eastern blacknose dace.
  - The relocated-dace paper (*J. Appalachian Studies* 21:49) returned 403.
  - Hill & Grossman 1987 was not reachable.
- **Grouping:** no study of schooling, shoal size or nearest-neighbour distance.
- **Predation rates:** no measured predation rate on dace by chain pickerel or smallmouth bass in a stream. No study names pickerel as a dace predator.

---

## Q2. Young fallfish: schooling, lake vs stream, movements, and telling them from dace

### Takeaway
- **Look:** young fallfish are silvery, with a **dusky lateral band ending in a spot at the tail base**, **large scales (< 50 in the lateral line)** and a large terminal mouth.
- **Contrast with dace:** a blacknose dace has a **black band running through the eye and around the tip of the snout**, tiny scales (53–70) and a small mouth under an overhanging snout. The dace is a bottom-hugger.
- **Habitat:** young fallfish favour faster current than adults. Adults are "primarily solitary".
- **Movement:**
  - MassWildlife says adults and young-of-year "disperse downstream" after spawning and hatching.
  - Fallfish live in northern lakes, and young fallfish are in Maine lake catches.
- **Unknowns:** no study gives school size, the timing of age-0 movement between lakes and streams, or length-at-age.
- **The angler's mid-water schools** fit young fallfish (or young perch and suckers) far better than dace.

### Cited Findings
**Identification**
- **Connecticut:** "Juveniles are silvery and typically have a dusky lateral band". Fallfish have "larger scales (fewer than 50 lateral line scales)" than creek chub. "Commonly 4 to 9 inches", state survey maximum 16.5 in. [N] — [CT DEEP, Fallfish](https://portal.ct.gov/DEEP/Fishing/Freshwater/Freshwater-Fishes-of-Connecticut/Fallfish) [ag]
- **Vermont, fallfish:**
  - "Young individuals have a dark band along the sides and a spot at base of tail fin."
  - The large mouth is "slightly overhung by the snout (obvious in large individuals)", the eyes are large and the scales are large.
  - Adults have a dark crescent at the base of each dorsal scale.
  - Average 5–8 in, up to 18 in.
  - [N] — [VT baitfish sheet, fallfish](https://VTFISHANDWILDLIFE.COM/sites/fishandwildlife/files/documents/Fish/baitfish/fallfish.pdf) [ag][ft]
- **Vermont, blacknose dace:**
  - The "snout is long and slightly overhangs mouth. Upper lip of mouth is not separated from the snout by a groove."
  - "Scales are very small giving fish a smooth skinned appearance."
  - The black band runs "from base of tail, along lateral line, through eye, and around tip of snout".
  - The body is "peppered with numerous dark flecks", and males may show a black and reddish band.
  - [N] — [VT baitfish sheet, dace](https://VTFISHANDWILDLIFE.COM/sites/fishandwildlife/files/documents/Fish/baitfish/blacknose-dace.pdf) [ag][ft]
- **Wisconsin key:**
  - Blacknose dace: "upper lip not separate from snout", "barbels at corners of mouth", "snout barely projects over mouth", "chunky body".
  - Creek chub: "large mouth, extends beyond front of eye", 50–60 lateral-line scales, "often dark pigment at anterior base of dorsal fin".
  - [M] — [WI DNR, Confusing Wisconsin Minnows](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/VHS_IdConfusingMinnows.pdf) [ag][ft]
- **FishBase, dace:** 53–70 lateral-line scales; the stripe is "continuous in young, as blotches in adult". — [FishBase](https://www.fishbase.se/summary/2943) [sec]
- **ADW, fallfish:** "Juveniles of this species have dark stripes along their lateral sides, reaching from head to tail. By maturity, this stripe disappears." — [ADW *Semotilus corporalis*](https://animaldiversity.org/accounts/Semotilus_corporalis/) [sec]

**Behaviour, habitat, movement**
- **ADW:**
  - "The young are often found in faster flowing currents", while older fish are more often in slower pools.
  - "They are primarily a solitary species being one of the top predators in their habitat."
  - "These minnows are migratory", following food and temperature, with "no true home range besides access to their entire stream".
  - Northern populations "also live in lentic habits (lakes)".
  - Life span 3–8 yr, maximum 10.
  - Predators: larger fallfish, northern pike, osprey, herring gull.
  - — [ADW](https://animaldiversity.org/accounts/Semotilus_corporalis/) [sec]
- **MassWildlife:**
  - After spawning and hatching, adults and young-of-year "disperse downstream where they reside for the remainder of the year".
  - Young eat plankton until ~38 mm (1.5 in).
  - Massachusetts calls it a river specialist with no known samples from lakes and ponds.
  - [N] — [MassWildlife, fallfish](https://www.mass.gov/info-details/fallfish) [snip; the page returned 403]
- **Ontario LHD:** "lacustrine; riverine"; "gravel- and cobble-bottomed pools and runs of small to medium rivers, and lake margins"; preferred 22.3 °C; nursery riverine. — [Ontario LHD, fallfish](https://www.ontariofishes.ca/fish_detail.php?FID=74) [sec]
- **Maine lakes, young fallfish:** EMAP counts include juvenile and young-of-year fallfish in Maine lakes, e.g. Second Lake 7 A / 1 J / 7 YOY, and East Branch 2 adults / 10 juveniles. — `Hot Brook populations and water/eastern_maine_relative_abundance.md` (Whittier et al. EMAP data)
- **Larval drift, Lake Ontario tributaries (mid-June):**
  - Fallfish were not reported among the drifting larvae.
  - Fantail darter made up 70.2–100 % of the ichthyoplankton, and **96 %** of larvae drifted at night (peaks at 24:00 or 04:00).
  - "Peak spawning and larval drift of blacknose dace probably occurred later in the season."
  - [N] — [Johnson & McKenna 2007 (USGS)](https://pubs.usgs.gov/publication/70030205) [abs]
  - **Correction:** this is a refinement of how `habitat3d_new_species.md` uses the paper. The 96 % is pooled larvae dominated by darters, not dace.
- **Angler:** the deeper pools of a Pennsylvania creek held groups of fallfish with many small individuals. [ang] — [paflyfish forum](https://www.paflyfish.com/goto/post?id=924105) [snip]

### Inferences
- **Field key for the angler** [inf from the sheets above]:
  - **Young fallfish:** silvery; a dusky (not jet-black) band ending in a **tail-base spot**; coarse, visible scales; big mouth; holds mid-water in runs and pool tails; moves in loose groups.
  - **Blacknose dace:** a jet-black band from the **tip of the snout** through the eye; flecked back; "smooth-skinned" look; sits on or just above the gravel of riffles; does not travel through open water.
- **The passing schools:** silvery minnow groups seen passing through the brook in mid-water in summer are most likely **young fallfish**. In a lake list without shiners, the other candidates are young-of-year yellow perch (vertical bars) or white suckers (see `eastern_maine_relative_abundance.md` on YOY schools). They are not dace [inf].
- **Direction:** young produced on the brook's mounds (late May–June) should disperse **downstream to Lower** through the summer. Hall's larger-up, smaller-down pattern (Q4) and MassWildlife's downstream dispersal support this [inf].
- **Use of the current:** young fallfish favour faster current than adults (ADW), so they use the run and the riffle edges that dace also use. Above ~10 cm they begin eating fish (existing note), so yearling and older fallfish become dace predators [inf].

### Gaps
- **Schooling:** no quantitative study of fallfish schools (size, cohesion, mixed schools with common shiner).
- **Movement:** no age-0 or age-1 movement data (drift, emigration from streams into lakes, or timing).
- **Growth:** no length-at-age table, so young fallfish's late-summer size in Maine is unknown. My guess, not data: ~3–6 cm at age 0 and 6–10 cm at age 1.
- **Lake vs stream:** no measured share of young fallfish living in lakes vs streams.

---

## Q3. Other minnow schools of northeastern lake-connecting streams (context only)

### Takeaway
- **Region:** across New England and New York lakes, golden shiner is the only frequent minnow. Fallfish, creek chub and common shiner are "also common", and all other minnows are rare.
- **Predators:** creek chub, common shiner, blacknose dace and redbelly dace are less likely to occur in lakes with pike or bass.
- **Size matters:** larger-bodied minnows (creek chub) and deep-bodied centrarchids co-occur with bass. Small soft-rayed species are excluded or confined to structure.
- **Hot Brook:** its list has no shiners or chub, so its stream minnows are fallfish and dace.

### Cited Findings
- **EMAP, 203 random northeastern lakes (1991–96):** golden shiner was in ~71 % of lakes; fallfish, creek chub and common shiner were "also common"; all other minnows were in < 10 %. [N] — [Whittier, Halliwell & Daniels 2000, *Northeastern Naturalist* 7:131](https://nysm.nysed.gov/bibcite/reference/21097) [abs]
- **Adirondack lakes:** creek chub, redbelly dace, blacknose dace and common shiner were less likely with piscivores; golden shiner was unaffected. — Findlay et al. 2000 (Q1) [abs]
- **Central Ontario lakes ≤ 50 ha** (MacRae & Jackson 2001; 4 base lakes plus 14 summer-survey lakes; minnow traps and snorkel counts):
  - **Richness:** an average of **5.4** littoral species, the same with or without smallmouth bass. But bass lakes held **2.3 fewer small-bodied species**.
  - **Excluded species:** fathead minnow (p = 0.01), *Phoxinus* spp. (p = 0.03), brook stickleback (p = 0.08) and pearl dace were absent from all summer-survey bass lakes.
  - **Unaffected species:** common shiner, creek chub, pumpkinseed and yellow perch were found "in most lakes regardless of the presence or absence of smallmouth bass". Larger-bodied species (creek chub, yellow perch, white sucker) "often coexisted with smallmouth bass populations".
  - **Reduced species:** blacknose shiner and bluntnose minnow coexisted with bass but were more abundant without it. In bass lakes they used complex habitat by day, and were caught in open habitat in overnight traps.
  - [N] — [MacRae & Jackson 2001, *CJFAS* 58:342–351](https://harkness.ca/PDFs/Contributions%202000s/MacRae%20and%20Jackson%202001.pdf) [ft]
- **Hot Brook's region (61 lakes):** common shiner 20, golden shiner 20, creek chub 18, blacknose dace 15, blacknose shiner 3. — `drainage_species_and_eel.md`
- **Common shiners on fallfish nests:** they spawn on fallfish nests, up to ~100 per nest. — `fallfish_spawning_brook.md`
- **Diet flexibility (Maine river):** creek chub switched to terrestrial prey when benthos fell; blacknose dace could not. — `brook_food_web.md` §4

### Inferences
- **A typical community:** a Maine lake-outlet brook of Hot Brook's size would typically hold dace, creek chub, common shiner and fallfish. Of these, common shiner and young fallfish are the mid-water shoalers of pools and runs, while dace and creek chub are bottom- or cover-oriented [inf; no schooling study found for any of them].
- **The missing shiners and chub:** whether this is real or a survey gap is unresolved (see `drainage_species_and_eel.md`).
- **Body size is the predation filter:** dace (5–8 cm, slender, soft-rayed) sit on the vulnerable side of it. That is one more reason the sim's dace need refuges [inf from MacRae & Jackson].

### Gaps
- **Maine streams:** no Maine stream-fish survey giving minnow densities or school sizes for a lake outlet.
- **Schooling:** no school-size data for common shiner or creek chub in streams.

---

## Q4. Sunfish (redbreast, pumpkinseed) in small streams and lake outlets in summer

### Takeaway
- **Redbreast is the stream sunfish:** "more tolerant of current than other sunfishes", common in rivers and large streams, and uncommon to rare in lakes in Connecticut. That fits redbreast dominating Hot Brook's pools. Pumpkinseed is the lake and pond sunfish.
- **The angler's 18–21-cm fish are large for the region:**
  - Connecticut's survey maximum is 23 cm, and redbreast are "commonly 4 to 6 inches".
  - In a New Brunswick lake the mean was 12.5 cm, guarding males averaged 16.4 cm, and fish averaged 16.1 cm at age 6+.
  - So the brook's pool sunfish are probably the oldest, largest fish.
- **Movement:** stream sunfish are pool-faithful (see existing notes), and larger stream fish tend to move upstream in spring.
- **Unknowns:** no northern study documents a summer lake→outlet-pool residence and an autumn return. The reasons below are inferences.

### Cited Findings
- **Connecticut, redbreast:**
  - Habitat: "Prefer clear water and rocky areas of larger streams and lakes"; "Not typically associated with vegetation".
  - "They are more tolerant of current than other sunfishes and are often the dominant sunfish species in larger rivers"; "typically common in rivers and large streams and uncommon to rare in lakes".
  - "Not as tolerant of warm or poor-quality water as pumpkinseed or bluegill."
  - Size: "Commonly 4 to 6 inches", state survey maximum 9.1 in, maximum reported 12 in.
  - [N] — [CT DEEP, Redbreast Sunfish](https://portal.ct.gov/DEEP/Fishing/Freshwater/Freshwater-Fishes-of-Connecticut/Redbreast-Sunfish) [ag]
- **Yoho Lake, New Brunswick** (the northernmost population; 131 ha, mean depth 3.66 m, pH 6.6; a lake much like Hot Brook's):
  - **Where caught:** most fish were near large woody debris, especially old beaver lodges, and dense vegetation such as lilies.
  - **Size and growth:**
    - Mean TL **12.5 ± 3.1 cm**, 42.6 g; W = 0.0137·L^3.1092 (n = 286).
    - September mean TL at ages 1+–6+: **72, 91, 114, 139, 150, 161 mm**.
    - Back-calculated lengths at ages 1–6: **36, 64, 88, 111, 127, 141 mm**.
    - Guarding males **16.4 ± 1.3 cm**.
  - **Spawning:** late June–early July as littoral water neared 20 °C (nests 21.4 ± 0.9 °C). Nests were 52 cm across, at 1.6 cm/s, 87 % dug through a vegetation mat, spaced 2.1 ± 1.2 m apart. Males guarded 7–10 d.
  - **Diet** (n = 10): amphipods ~50 %, caddis larvae ~20 % by number.
  - **Population:** 325–744 fish (Petersen estimates).
  - **Co-occurring fish:** pumpkinseed, smallmouth bass, nine cyprinids, salmon and brook trout.
  - **Dispersal:** downstream dispersal from the lake "may explain" river records, but this was not measured.
  - [N] — [Gautreau & Curry 2012, *Northeastern Naturalist* 19(4)](https://www.eaglehill.us/NENAonline/articles/NENA-19-4/18-Gautreau.shtml) [ft via fetch summary]
- **Stream fish migration** (New Hope Creek, North Carolina; two-way weirs, Apr 1968–Jun 1970; 27 species):
  - "Most of the 27 species had a consistent pattern of larger fish moving upstream and smaller fish moving downstream."
  - "Both upstream and downstream movements were greatest in the spring."
  - Spring 1969 daily means: 7 fish (1,081 g) up and 17 fish (472 g) down.
  - [S] — [Hall 1972, *Ecology* 53:585 (AGRIS)](https://agris.fao.org/search/en/records/65df0c677c7033e84becc07d) [abs]
- **Pool fidelity, classic:** Gerking 1953 argues that "many stream fishes live in very restricted areas during most, if not all, of their lifetime" (Indiana; sunfishes and others). [M] — [Gerking 1953](https://www.fs.usda.gov/biology/nsaec/fishxing/fplibrary/Gerking-1953.pdf) [snip; scanned PDF, no text layer]
- **Pumpkinseed movement:**
  - **Clear Lake, Iowa:** displaced fish homed, distances never exceeded ~2,200 ft (~670 m), and larger fish homed more strongly. [M] — [core.ac.uk record](https://core.ac.uk/works/64833382) [snip; 403]
  - **A Polish pit lake** (introduced population): 49 % of relocations were in autumn, 36 % in summer and 15 % in spring, with strong site fidelity and displacements of tens of metres. [sur-region] — [Zięba & Copp, ECI 2015 abstract](https://doaj.org/article/fe08e90c7ee042a6a5df2e0ceacb6f40) [snip]
  - **Detroit River** (acoustic telemetry, June–November): site-faithful; fish did not cross a shipping channel; presence was linked to water temperature and level. [N] — [Klinard et al. 2018](https://scholar.uwindsor.ca/glierpub/325) [snip]
- **Already in the repo:**
  - Redbreast moves (two-thirds < 100 m; rare 4–9-km trips): `fish_movement_and_groups.md`, `habitat3d_new_species.md` Q1.
  - Winter "large aggregations … in low velocity, pool habitats" (Aho et al. 1986 HSI): `habitat3d_new_species.md` Q1.
  - Pumpkinseed moving from lakes into streams, shaped by "the type of water outlet": `movement_between_lakes.md`.
  - Outlet zooplankton stripped within ~200 m, and filter feeders peaking 40–160 m below outlets: `brook_food_web.md` §1.

### Inferences
- **Redbreast vs pumpkinseed:** the brook's pools belong to redbreast (current-tolerant, rock- and wood-oriented, a river sunfish). Pumpkinseed are the lake fish that spill in [inf from CT DEEP].
- **Age of the pool fish:** 18–21-cm redbreast in a Yoho-like growth regime are **≥ 7–10 yr old**, beyond Yoho's 6+ mean of 16.1 cm. So the pool holds the population's largest and oldest fish [inf]. This is a size-ordered use of the best pool, consistent with "larger fish move upstream" (Hall) and with the abundance–depth relation of the HSI.
- **Why they stay** (inference, no direct study):
  1. **Food delivered by the current:** lake zooplankton, drifting insects and terrestrial insects (brook_food_web §1–3).
  2. **Depth:** 1–1.2 m beats wading-bird and eagle reach, and the large sunfish are gape-safe from most pickerel and bass.
  3. **Hard cover:** rock and wood.
  - **Not temperature:** the brook carries lake surface water.
- **Season:**
  - They arrive with the spring movement peak, after ice-out and before spawning, and hold the pool through summer [inf].
  - In autumn they either drop back to the lakes or aggregate in the pool if it keeps flow and O₂ (Aho HSI winter aggregations) [inf].
  - The surrogate data (Polish pumpkinseed) put the most relocations in **autumn** [snip].

### Gaps
- **Lake–stream seasonality:** no northern study of sunfish moving from a lake into its outlet or connecting stream for summer and back for winter. No redbreast telemetry anywhere in the north.
- **Diet:** no diet of sunfish in a lake-outlet pool, so the role of lake zooplankton for pool sunfish is unmeasured.
- **Age:** no ages for big (≥ 18 cm) northern redbreast. Yoho's oldest sampled class (6+) averaged 16 cm.

---

## Q5. How small fish avoid piscivores in small streams: riffles, structure, schooling, and timing

### Takeaway
Small stream fish avoid piscivores with a few consistent tactics:
1. **Leaving patches that hold predators.** They re-enter mainly by day or where structure exists (Fraser & Cerri 1982).
2. **Using water too shallow or too fast for large fish:** riffles < 20–25 cm (Power, Schlosser; existing notes).
3. **Using structure.**

Two further results matter for movement:
- **Predators raise movement between pools:** riffle crossings went from **7.2 % to 20.2 % per 30 min**, and groups got larger.
- **Current suppresses crossing:** **18.1 % at 0 cm/s → 1.8 % at 45 cm/s**.

In lakes, bass exclude or confine small minnows, which feed in the open mainly at low light. A European surrogate shows prey fish using connecting streams as a *winter* predation refuge. Timing:
- dace are day-active;
- larvae drift at night;
- dace avoid large moving fish by day and by night (existing note).

### Cited Findings
- **Patch avoidance** (artificial stream):
  - Prey were juvenile blacknose dace and creek chub; the predator was adult creek chub.
  - Prey "actively avoid locations … that contain predators".
  - Structure and time of day mediate the response, and prey enter predator patches mostly "during daylight or when structure is present".
  - — [Fraser & Cerri 1982](https://agris.fao.org/search/zh/records/65de3a467c7033e84bea221b) [abs]
- **Riffle crossing** (eight outdoor artificial streams; three cyprinids: *Campostoma*, *Cyprinella*, *Notropis boops*):
  - **Layout:** pools 183 cm across and 45 cm deep; riffles 43 cm wide, at 0/15/30/45 cm/s, 10/50/100 mm thalweg depth and 183 or 549 cm long.
  - **Crossing rate:** 18.1 % of fish per 30 min at 0 cm/s vs 1.8 % at 45 cm/s.
  - **Predators:** 7.2 % without vs 20.2 % with caged predators in the pools.
  - **Groups:** mean group 1.2 fish, larger only over shallow riffles or under predation threat.
  - **Species:** *N. boops* moved least.
  - [S][sur] — [Schaefer 2001](https://research.fs.usda.gov/treesearch/9696) [abs]
- **Lakes with bass** (MacRae & Jackson 2001):
  - **Habitat use:** in bass lakes, vulnerable species trended toward complex over simple habitat (χ²₁₂ = 26.05, p = 0.053; binomial p = 0.03). In lakes without bass they were *more* abundant in simple habitat (χ²₁₈ = 20.95, p = 0.051).
  - **Night feeding:** blacknose shiner and bluntnose minnow used complex habitat by day, but were caught in open habitat in overnight traps. The authors suggest they "feed in simple habitats during low light levels while the predators are less active" (citing Naud & Magnan 1988).
  - **Exclusion:** four of six vulnerable species never coexisted with bass, which suggests "the lake conditions and habitat are insufficient to allow coexistence".
  - [N] — [MacRae & Jackson 2001](https://harkness.ca/PDFs/Contributions%202000s/MacRae%20and%20Jackson%202001.pdf) [ft]
- **Lake minnows, day and night:** northern redbelly dace schools gather in shallow water by day and disperse at night (Naud & Magnan 1988, Quebec). [N][sur] — [Montana AFS species sheet](https://oldunitsstaging.fisheries.org/montana/wp-content/uploads/sites/11/2020/04/MTAFS-Northern-Redbelly-Dace_web.pdf) [snip]
- **Winter refuge in streams, Lake Krankesjön, Sweden** (3.4 km², mean 1.5 m, max 3.0 m; a shallow lake like Hot Brook's; 1,293 roach PIT-tagged, 2003–04):
  - **Timing:** roach entered the inlet and outlet streams from 21 Oct to 20 Dec 2003 (to mid-January in 2004). They left 9–20 Mar and 3–20 Apr 2004, and from 5 Feb to 17 Apr in 2005.
  - **Predators:** pike reached up to 200/ha in the lake, but were only 0.1 % (and perch 0.8 %) of stream catches.
  - **Model:** roach growth g = 0.006·10^(0.128T); roach feed and grow only above ~12–15 °C. The predation/growth ratio in the lake was low in summer and high in winter.
  - **Conclusion:** "prey fish actually spend the major part of the year away from the lake".
  - [sur] — [Brönmark et al. 2008, *PLoS ONE* 3:e1957](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0001957) [ft via fetch summary]
- **Winter refuge in streams, two Danish lakes** (2,219 roach of 120–350 mm PIT-tagged over 4 yr):
  - 2–12 % of tags were recovered at great cormorant roosts.
  - More days spent out of the lake meant lower predation (χ²₁ = 24.58, p < 0.001); larger roach were more vulnerable.
  - 92.5 % of recovered tags came from fish last detected in the lake.
  - Residents > 250 mm faced "up to 40 per cent" winter cormorant predation.
  - [sur] — [Skov et al. 2013, *Biology Letters*](https://pmc.ncbi.nlm.nih.gov/articles/PMC3639769) [ft via fetch summary]
- **Piscivores in small streams:**
  - **Smallmouth bass:** stream smallmouth are "a sedentary species … with strong homing", with summer net movements < 1 km (citing Todd & Rabeni 1989). [S] — [Hafs, Gagen & Whalen 2010, *NAJFM* 30](https://faculty.bemidjistate.edu/ahafs/wp-content/uploads/sites/2/2024/05/2010.-Hafs-A.W.-Gagen-C.-J.-and-J.-K.-Whalen.-Smallmouth-bass-summer-habitat-use-movement-and-survival-in-response-to-lo.pdf) [snip]
  - **Chain pickerel:**
    - "Prefers small stream pool habitats", abandoned channels and backwaters. [S] — [WVDNR](https://wvdnr.gov/plants-animals/sportfish/chain-pickerel/) [ag][snip]
    - It lies motionless along vegetation margins or undercut banks to ambush prey. [S] — [Outdoor Alabama](https://outdooralabama.com/pickerel/chain-pickerel) [ag][snip]
- **Larval timing:** 96 % of stream fish larvae drift at night (Johnson & McKenna 2007, Q2) [abs].
- **Already in the repo:**
  - **Depth refuges:** with bass present, juveniles were confined to shallow riffles and raceways (Schlosser 1987). Bass held pools > 50 cm, and fish > 3–4 cm avoided < 20 cm (Power 1987). See `brook_food_web.md` §4.
  - **Avoidance of large fish:** dace avoid all large moving fish by day and night, and leave compartments holding chub (Fraser & Mottolese 1984; Fraser & Emmons 1984). See `fallfish_spawning_brook.md` Q4.

### Inferences
**Mechanisms for the sim's dace problem.** These are proposals with reasons, meant as checks, not tuning targets.
1. **Where predators hunt:**
   - Real stream bass are sedentary pool fish, and chain pickerel ambush from slow, vegetated margins and undercut banks. Neither works the riffles.
   - So pickerel and bass in the brook should hunt the **1.1-m pool, the 0.5-m run and slow edge cover**, and almost never riffle water **< ~25 cm deep at > ~30 cm/s**.
   - That riffle water is the dace's day refuge, and it is where dace live anyway (15–45 cm/s; spawning < 25 cm) [inf].
2. **Dace leave predator patches:** dace should treat a pool or run holding a large fish as a no-go patch. They re-enter by day or near cover once the predator has gone (Fraser & Cerri; Fraser & Emmons) [inf].
3. **Pickerel's slow water:** "passing" pickerel should hold in slow water, not cruise riffles [inf].
4. **Crossing is rare and solitary:**
   - Minnows cross fast riffles rarely (~2 % per 30 min at 45 cm/s) and singly.
   - A predator raises crossing ~3× (Schaefer).
   - So dace under threat should shift along the brook, riffle to riffle, rather than leave it, because the lakes beyond are lethal (Findlay; MacRae & Jackson) [inf].
5. **Timing:** dace feed by day on riffles, and their larvae drift at night into slack margins (`habitat3d_new_species.md` Q4) [inf].
6. **The brook as a winter refuge** (surrogate): the European roach work shows small prey fish can use a connecting stream as a *winter* refuge from lake piscivores. In Hot Brook the brook's open, flowing water could play that role for small fish in winter, if it stays ice-free and oxygenated [inf, speculative].

**Checks after a change** (not targets):
- dace persist through a summer of pickerel and bass in the brook, with weekly loss ~0.5–1.5 % from fallfish and a total ~4–6 %/week in the open-water season (see `fallfish_spawning_brook.md` Q4);
- with a predator in the pool, dace by day sit mostly on the riffles;
- no dace cross a lake.

### Gaps
- **Field predation rates:** no field measurement of pickerel or bass predation rates on stream minnows. The Harvey 1991 and Harvey & Stewart 1991 abstracts sat behind a Springer login.
- **Night movement:** no study of minnows passing a short connecting stream between lakes by night vs by day. No northern study of small fish using a connecting stream as a winter refuge.
- **Unread references:**
  - Gilliam & Fraser 2001 (movement in corridors under predation threat) was not found.
  - Hill & Grossman 1987 and the relocated-dace paper were not reachable.
