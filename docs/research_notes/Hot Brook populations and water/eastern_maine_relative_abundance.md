# Relative abundance of fish species in small, shallow, coloured lakes of eastern Maine (for calibrating the Hot Brook lakes)

Scope: how many of each species, *relative to each other*, in warm/coolwater eastern-Maine lakes with smallmouth bass, white perch, yellow perch, chain pickerel, bullhead, sucker and minnows. It also checks the fishing owner's report that "not nearly as many" perch as fallfish and bass are caught, and that the perch are small.

Tags used below:
- **[primary]**: I read the document or data myself.
- **[search summary]**: a search engine's summary of a page I could not open.

Access: maine.gov (all MDIFW PDFs and pages), lakesofmaine.org and mass.gov returned HTTP 403 to the fetch tool. BioOne returned an empty page. I did not try to get around any of these blocks; they are listed under Gaps. The quantitative core of this note is the **EPA EMAP Northeast Lakes 1991–94 fish-count file**, which holds 93 Maine lakes. I read it through the fetch tool in 100 kB chunks.

---

## Q1. Species composition in MDIFW / regional surveys of eastern-Maine lakes (and New England equivalents)

### Takeaway
Nine EMAP survey lakes in Washington, Hancock and Penobscot counties were netted in midsummer with several gear types: trap nets, gill nets, seines and minnow traps.
- **White perch dominate adult catches.** They make up a median of 42% of adults, and 55–68% in the most "Hot Brook-like" white-perch/bass/pickerel lakes.
- **Yellow perch are numerous mainly as juveniles and young-of-year.** Adult yellow perch are a median of only 6%.
- **Smallmouth bass** make up 0–40% of adults (median 2%). **Chain pickerel** are ≤3%. **White sucker** is 3–22% and **brown bullhead** 0–15%.
- **Fallfish** were present in 6 of 9 lakes and reached **23% of adults in Fourth Machias Lake and 9% in Lower Oxbrook Lake**.

Connecticut night boat electrofishing ranks bass much higher than nets do, because the gear catches bass well. In Connecticut lakes holding smallmouth, white perch and pickerel, the median catch per hour was:

| Species | Median catch/hr |
|---|---|
| White perch | 42 |
| Pumpkinseed | 30 |
| Yellow perch | 12 |
| Smallmouth bass | 8 |
| Pickerel | 6 |

### Cited Findings

**EMAP Northeast Lakes data set**

**The data set** — [EMAP NE Lakes index](https://archive.epa.gov/emap/archive-emap/web/html/nelakes.html); [fish-count metadata, fshcntm-2.pdf](https://archive.epa.gov/emap/archive-emap/web/pdf/fshcntm-2.pdf) [primary]
- It is a single midsummer snapshot per lake, taken July to mid-September 1991–94, with several gears across habitats.
- Gears were trap nets, minnow traps, gill nets and beach seines. Habitats were shallow and deep pelagic zones plus the shore.
- Counts are split into adult, juvenile and young-of-year (YOY). The metadata does not define these classes; it refers to Baker et al. 1997, which I did not read.
- The University of Maine was among the sampling teams.

**The Maine lakes in it** — [EMAP site file ldesign.txt](https://archive.epa.gov/emap/archive-emap/web/txt/ldesign.txt) [primary, via fetch tool]
- The site file lists 101 Maine visits to 93 lakes.
- Washington County lakes: Fourth Machias (621 ha, 1992), Cranberry Pond (6.6 ha), Lower Oxbrook (141 ha, 1993), Second Lake (116 ha, 1993), Lake Cathance (1,264 ha, 1993), Pleasant Lake (625 ha at 45.354 N, 67.923 W, 1993) and Crawford Lake (720 ha, 1994).
- Penobscot County lakes: Mattanawcook Pond (590 ha, 1993) and East Branch Lake (475 ha, 1994).
- Hancock County: Upper Middle Branch Pond (190 ha, 1993).
- Hot Brook itself was not sampled.

**Counts per lake** — [EMAP fish counts fshcnt-2.txt](https://archive.epa.gov/emap/archive-emap/web/txt/fshcnt-2.txt) [primary data, tallied by the fetch tool]
- The table gives adult / juvenile / YOY counts summed over all gears and visits, all sizes.
- Lake codes: WP white perch, YP yellow perch, SMB smallmouth bass, CP chain pickerel, FF fallfish, PS pumpkinseed, RB redbreast sunfish, BB brown bullhead, WS white sucker, GS golden shiner, CS common shiner, BK banded killifish.

| Lake (county, ha, year) | ~km from Hot Brook* | Counts A/J/Y (all-ages total) |
|---|---|---|
| Crawford L. (Wash., 720, 1994) | 72 | WP 246/97/0; **SMB 51/2/0**; YP 3/73/25; BB 32/2/0; PS 22/5/0; WS 12/1/1; CP 6/5/0; BK 1/9/0; GS 4; alewife 1/196/0; no FF. Largemouth, smelt and eel were present (counts not tallied). |
| Mattanawcook P. (Penob., 590, 1993, 2 visits) | 51 | WP 590/258/0; YP 63/241/81; BB 152/21/4; PS 91/72/12; WS 51; GS 38/11/8; CP 29/10/4; SMB 21/2/7 (the tool's listed values sum to 25, not 21); redbreast present; no FF, CS or BK. |
| East Branch L. (Penob., 475, 1994) | 63 | YP 45/577/331; WP 98/137/0; WS 27/7/7; BK 17/14; PS 12/23; PS×RB hybrids 8/30; RB 7/11; SMB 11/3/6; CS 4/11; **FF 2/10**; CP 1; eel 1. |
| Pleasant L. (Wash., 625, 1993) | 32 | YP 39/6/121; WP 24/30/64; BK 35; lake chub 0/34; PS 5/23/1; SMB 3/0/19; **FF 3/8**; WS 4/5; CS 1/4; eel 2/1; CP 0/1; Atlantic (landlocked) salmon 0/1. |
| Lower Oxbrook L. (Wash., 141, 1993) | 41 | WP 185; YP 24/124; WS 100/1; **FF 44/6**; BB 35; PS 5/39; N. redbelly dace 18; CS 10/3; blacknose shiner 10; *Phoxinus* hybrid 9; BK 7/1; GS 7; creek chub 5; smelt 4; eel 2; salmon 1. **No SMB, no CP.** |
| Fourth Machias L. (Wash., 621, 1992) | 55 | Adult field only: alewife 80, YP 66, **FF 65**, WP 54, PS 19, eel 19, GS 14, WS 13, BK 12, BB 9, CP 6, SMB 2. |
| Second L. (Wash., 116, 1993) | 94 | alewife 6/844/15; WP 209; WS 34; YP 18/11/21; BB 14; PS 12/2; FF 7/1/7; SMB 5/1/2; GS 4; CP 3. |
| Upper Middle Branch P. (Hancock, 190, 1993) | 86 | WP 206/0/20; WS 33/2/114; smelt 78; BK 2/1/107; PS 23/29; RB 20/6; CP 2/17/1; salmon 9; creek chub 3; FF 1. **No YP, no SMB.** |
| L. Cathance (Wash., 1,264, 1993) | 88 | SMB 38/5; YP 25/14/8; smelt 0/37; blacknose shiner 12/13; GS 2/8; WS 7/5; PS 4/4; salmon 4/3; eel 3/1; BB 1. **No WP in catch.** |

\*The distances are my own straight-line calculation from about 45.64 N, 67.95 W.

**Adult shares across the nine lakes** (my arithmetic from the table; alewife and smelt excluded)

| Species | Median | Range |
|---|---|---|
| White perch | 42% | 0–68 |
| White sucker | 7% | 3–22 |
| Yellow perch | 6% | 0–34 |
| Pumpkinseed | 5% | 1–9 |
| Brown bullhead | 3% | 0–15 |
| Smallmouth bass | 2% | 0–40 |
| Golden shiner | 1.3% | 0–5 |
| Fallfish | 0.9% | 0–23 |
| Banded killifish | 0.5% | 0–30 |
| Chain pickerel | 0.5% | 0–3 |

All ages together give a different order: white perch median 29%, yellow perch 23%, pumpkinseed 7%, white sucker 5%, bullhead 3%, smallmouth 1.7%, killifish 1.7%, golden shiner 1.1%, pickerel 0.9%, fallfish 0.9%.

**Older MDIFW lake-sheet notes on the same species set** [search summary; maine.gov blocked]
- [Upper Chain Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/hancock/chain_lake_upper.pdf) and [Middle Chain Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/hancock/chain_lake_middle.pdf) (Hancock): the principal fishery is smallmouth, pickerel and white perch, and more harvest of the abundant white perch / warmwater species is encouraged.
- [Webb Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/hancock/webb_pond.pdf) (Hancock): a shallow lake that is the same temperature top to bottom, fished for smallmouth, white perch and pickerel. White perch are abundant and give a consistently good fishery.
- [Big Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/big_lake.pdf) (Washington): smallmouth is the main sportfish, with white perch and pickerel also caught.

**Connecticut DEEP statewide lake electrofishing, 1980s–2018** — [CT DEEP Statewide Lake and Large River Electrofishing Survey (Jan 2018)](https://portal.ct.gov/-/media/deep/fishing/fisheries_management/statewidelakeandlargeriverelectrofishingsurveypdf.pdf) [primary; my parse of the PDF text]
- Methods: night boat electrofishing in spring and fall, reported as catch per hour of "stock-size" fish. Bass count from 20 cm and perch from 13 cm. Sunfish count from 8 cm. Non-game fish are counted at all sizes.
- Lake sites run 426. Fallfish were caught in only 45 of them (median 0 per hour). Smallmouth were caught in 126.
- In the **9 lakes with smallmouth ≥5/hr plus white perch and pickerel**, the median catch per hour was:

| Species | Median catch/hr |
|---|---|
| Bluegill | 59 |
| White perch | 42 |
| Pumpkinseed | 30 |
| Rock bass | 18 |
| Redbreast | 16 |
| Yellow perch | 12 |
| Largemouth | 10 |
| Smallmouth bass | 8 |
| White sucker | 7 |
| Chain pickerel | 6 |
| Golden shiner | 4 |
| Brown bullhead | 2 |
| Fallfish | 0 (caught in 2 of 9) |

- The 9 lakes are Easton Reservoir, Laurel Reservoir, Park Pond, Quassapaug Lake, Saugatuck Reservoir, Shenipsit Lake, Waramaug Lake, West Thompson Reservoir, plus one site whose name did not parse.
- Values are my averages over each lake's sampling years. A few PDF rows were misaligned, so treat these as ±20%.
- CT DEEP's own caveat: catch per hour gives only a rough idea of relative abundance *among* species, and is a precise index only *within* one species. Their vulnerability ranking:
  - high: bass and sunfish;
  - moderate: pickerel, perch, shiners, killifish, suckers;
  - low: bullheads and eels.

### Inferences for the simulation
- **White perch, not yellow perch, should be the most numerous adult fish.** Yellow perch should be the most numerous *young* fish.
  - The sim has yellow perch 860/ha and white perch 800/ha (≥7.5 cm). The EMAP adult split (median WP 42% vs YP 6%) argues for fewer large yellow perch.
  - Yellow perch numbers should sit mostly in the 7.5–15 cm juvenile classes, which nets record as "juvenile". The sim's YP total can stay high only if those fish are small.
- **Golden shiner is over-weighted.**
  - The sim has 430/ha, about 17% of its census. EMAP eastern-Maine lakes give adults a median of 1.3% (max 5%), and MDIFW does not list golden shiner for either Hot Brook lake (see `hot_brook_lake_records.md`).
  - Suggest cutting it to under 5% of the census, or replacing most of it with fallfish and banded killifish.
- **White sucker looks low.** The sim's 1.2% sits against an EMAP adult median of 7% (range 3–22%).
  - Nets catch suckers well, so the true share may be lower than 7%. Even so, 1.2% is below every lake in the sample.
  - A design value of 3–6% (about 80–150/ha) is defensible.
- **Smallmouth bass at 1.6% of the census matches net data** (median 2%). Electrofishing would rank them about level with yellow perch.
- **Brown bullhead (5.5%) and pickerel (0.8%) are already in range.**
- **Fallfish should be added as a lake species, not only a stream one.** The prior note's estimate of about 2/ha is too low for eastern Maine (see Q3).

### Gaps
- **The counts were tallied by the fetch tool's summariser, not by a script.**
  - For Crawford and East Branch I checked the per-row values and the sums are consistent.
  - For Mattanawcook, one inconsistency was found (smallmouth adults: 21 stated vs 25 from the listed values).
  - Fourth Machias has adult counts only.
  - Lower Oxbrook, Second, Upper Middle Branch, Cathance and Pleasant were tallied in one pass without per-row display.
  - An exact re-parse needs `fshcnt-2.txt` (1.69 MB) downloaded locally. **I did not download it because that requires the user's permission.**
- EMAP gives no catch-per-effort normalisation in this file, and its adult/juvenile/YOY definitions are not given in the metadata.
- No MDIFW trap-net, fyke-net or electrofishing catch-per-effort report for any Region C or F warmwater lake could be read: maine.gov returned 403. That covers Baskahegan, Skitacook, Grand, Mattawamkeag, Crooked Brook Flowage, Duck and Nicatous.
- I did not reach New Brunswick or Nova Scotia catch compositions. Kejimkujik and Grafton Lake (Acadia, 2001) exist, but no numbers surfaced. See the [Grafton Lake report](https://acer.acadiau.ca/tl_files/sites/acer/resources/PDF%20Files/66%20ACER%20Publication.pdf) (not read).

---

## Q2. Smallmouth bass catch rates and densities in Maine and New England, and the effect of catch-and-release

### Takeaway
No Maine catch-per-hour figure for smallmouth was readable online (MDIFW's pages are 403-blocked).
- In New England electrofishing, smallmouth catch is typically 5–50 fish/hr at ≥20 cm. In Vermont, the 75th-percentile catch is 13/hr for "quality" fish and 6/hr for "preferred" fish.
- Maine anglers already release almost all bass: open-water harvest is only 2.6%. So the Hot Brook catch-and-release rule changes little; growth and first-winter survival set bass numbers and sizes.
- Under heavy catch-and-release, each bass can be caught **3–7 times a year** (one Wisconsin lake). That alone can make bass dominate an angler's catch.

### Cited Findings
- **Vermont statewide, 1988–2015** (100 waterbodies, more than 500 electrofishing samples). — [VT Bass Management Plan 2017](https://VTFISHANDWILDLIFE.COM/sites/fishandwildlife/files/documents/Learn%20More/Library/REPORTS%20AND%20DOCUMENTS/FISHERIES%20MANAGEMENT/BASS%20MANAGEMENT%20PLAN%20-%202017.pdf) [primary]
  - 75th-percentile smallmouth catch is **13 / 6 / 1 per hour** for the quality, preferred and memorable size classes. For largemouth it is 23 / 8 / 1.6.
  - Smallmouth catch rates are higher in northern Vermont.
  - Full-season creel surveys (Bomoseen 1992, Champlain 1999, Morey 1995) give angler catch rates of a few hundredths to a few tenths of a bass per angler-hour. Smallmouth values are about 0.02–0.14/h. The table is garbled in the PDF text, so the exact pairing of value to lake is uncertain.
  - Resident anglers who keep no bass rose from 12–13% (1991) to 33% (2010). For non-residents the rise was from 20–22% to 57%.
- **Connecticut** smallmouth lakes (my parse of the [CT DEEP survey](https://portal.ct.gov/-/media/deep/fishing/fisheries_management/statewidelakeandlargeriverelectrofishingsurveypdf.pdf) [primary]):
  - In 57 lakes with smallmouth ≥5/hr, the median smallmouth catch was 12/hr at ≥20 cm (75th percentile 24/hr). The maximum lake average was about 119/hr.
- **New York:** Chenango Lake caught 70/hr of stock-size smallmouth, against a NY statewide average of 27/hr. — [NYSDEC Chenango Lake](https://extapps.dec.ny.gov/docs/fish_marine_pdf/tb7chenangolake18.pdf) [search summary]
- **Maine harvest.** MDIFW's 2019 Black Bass Technical Work Group (J. Seiders) cites the 2016 statewide survey: bass harvest is low, 2.6% in open water and 10.3% through the ice.
  - Southern-zone general law: 2 bass, only 1 over 14 in. Northern zone: no limits; illegally introduced bass are not actively managed.
  - Source: [MDIFW BTWG Nov 2019](https://www.maine.gov/ifw/docs/BassTechnicalWorkGroupNov2019.pdf) [search summary]; [2016 angler survey](https://www.maine.gov/IFW/docs/anglerreport_2016.pdf) [search summary: 48% of open-water anglers fished for black bass, 58% for trout].
- **Maine bass growth limit.** First-year bass must store enough to survive about 200+ days of first-winter starvation (feeding stops below about 50 °F). This sets bass range and year-class strength in Maine. — [MDIFW Black Bass Plan 2001 (R. Jordan)](https://www.maine.gov/IFW/docs/strategic-management-plans/blackbass.pdf) [search summary]
- **Downeast young-of-year bass sizes.** MDIFW fall electrofishing of YOY smallmouth in 10 Region C lakes (about 1990–2005) found:
  - YOY 37–106 mm, mostly 40–90 mm;
  - adult growth samples of about 100 angled bass per year in Big Lake, Grand Falls and Woodland flowages.
  - Source: [Willis 2006, St. Croix Alewife–Smallmouth Bass Interaction Study (Maine Rivers)](https://www.cybrary.friendsofmerrymeetingbay.org/Alewife/MaineRiversStCroixReportFinal.pdf) [primary].
- **Spednic Lake (St. Croix, Washington Co.).** Bass collapsed in the 1980s, which was blamed on a revived alewife run plus 9–14 ft drawdowns exposing bass nests and fry. — [Wikipedia Spednic Lake](https://en.wikipedia.org/wiki/Spednic_Lake) [search summary]; growth and mortality of under-yearlings 1970–2008 in [Dudley & Trial, USGS SIR 2014-5164](https://pubs.usgs.gov/publication/sir20145164) (page returned HTTP 500; not read)
- **Repeat catch under catch-and-release (Wisconsin, flagged non-NE).** — [Shaw, Preul-Stimetz & Sass, NAJFM, doi 10.1093/najfmt/vqag038](https://www.citedrive.com/en/discovery/vulnerability-to-angling-and-survival-of-smallmouth-bass-in-a-northern-wisconsin-lake/) [primary abstract page]
  - Pallette Lake, 2015–2025: angler catch ÷ abundance implies every smallmouth could be caught and released **3–7 times a year**.
  - 42% of tagged bass were never reported and 20% once; males were more catchable.
  - Annual survival was 80% (males) and 83% (females).
- **Harvest-era contrast (Wisconsin, 1970s).** On Clear Lake, exploitation by length group was 37–85%, and bass under 300 mm were 97–98% of the harvest. — [Clear Lake WI](https://minds.wisc.edu/items/63bc1cce-f6af-4b30-8cc7-11f73f884ca4) [search summary]
- **Habitat effect (South Dakota).** Electrofishing caught about 50 smallmouth/hr over rock and boulder, 7/hr over sand and gravel, and 0/hr over silt. — [core.ac.uk record](https://core.ac.uk/works/62555589) [search summary]
- **Density benchmark (Wisconsin, flagged).** Mildred Lake (2005) had 8.2 adult (≥8 in) smallmouth per acre, about 20/ha. — [WDNR Mildred Lake 2005](https://apps.dnr.wi.gov/doclink/lakes_fish-plant_reports/oneidamildredlake2005.pdf) [search summary]

### Inferences for the simulation
- **Keep smallmouth at roughly 20–60/ha (≥7.5 cm)** and concentrated on rocky shores. No Maine density exists.
  - The sim's 40/ha matches the Wisconsin benchmark (about 20/ha of adults ≥20 cm) plus juveniles.
  - It also matches the eastern-Maine net share (median 2%, up to 13–40% in bass lakes such as Crawford and Cathance).
- **Catch-and-release should not raise bass numbers much in the sim.** Maine harvest is already about 3%. A catch-and-release rule mainly lets fish reach larger sizes when growth allows.
- **The angler's "lots of bass" is consistent with modest density.** It needs high catchability (repeat catches) and a strong preference for rock and shore. Model it as catchability, not as more fish.

### Gaps
- No Maine smallmouth catch-per-hour, mark–recapture density or size-structure (PSD) figure was readable. The 2019 BTWG slides and the 2001 plan data sections are behind the 403.
- No study isolating a year-round catch-and-release-only smallmouth rule was found. Only spring catch-and-release seasons (Michigan, NY) and length limits (Minnesota) have been evaluated.
- No hooking-mortality figure was verified in this pass.

---

## Q3. Fallfish in lakes: how common, where, and how often anglers catch them

### Takeaway
Fallfish are a real lake species in eastern Maine:
- MDIFW lists them in about 461 Maine lakes, and they are on Hot Brook's own 1949 list.
- In EMAP nets they were present in 6 of 9 regional lakes, and **18–23% of the catch in Fourth Machias and 8–9% in Lower Oxbrook**. Both are lakes with significant streams.
- In Connecticut they are mainly stream fish, at low abundance in lakes with big tributaries.
- Fallfish are **very easy to catch** on worms, small lures and flies. So their share of an angler's catch, especially near inlets, outlets and the connecting brook, will far exceed their share of the fish present.

### Cited Findings
- **Maine lake counts:** fallfish in 461 lakes, common shiner in 462, golden shiner in 851 and banded killifish in 363. MDIFW notes more survey effort would raise these counts. — [MDIFW non-sport species plan](https://www.maine.gov/IFW/docs/strategic-management-plans/nonsportcommercial.pdf) [search summary]
- **EMAP minnow paper** (203 random lakes in New England, NY and NJ, 1991–96). Only golden shiner was frequent (71% of lakes). Fallfish, creek chub and common shiner were "also common"; all other minnows were in under 10% of lakes. — [Whittier, Halliwell & Daniels 2000, *Northeastern Naturalist* 7:131–156](https://nysm.nysed.gov/bibcite/reference/21097) [abstract page, primary]
- **EMAP Maine lake counts** (table in Q1) [primary data]:

| Lake | Fallfish counts (A/J/Y) | Fallfish share |
|---|---|---|
| Fourth Machias | 65 adults | about 23% of adults, ≈ yellow perch (66) |
| Lower Oxbrook | 44/6 | 8–9% |
| Second | 7/1/7 | 4% |
| Pleasant | 3/8 | 2.5% |
| East Branch | 2/10 | 1% |
| Upper Middle Branch | 1 | — |
| Crawford, Mattanawcook, Cathance | none | 0 |

- **Connecticut:**
  - Fallfish prefer small and medium streams with gravel or cobble, and sometimes occur at low abundance in lakes with significant tributaries.
  - Adults are commonly 4–9 in, with a CT survey maximum of 16.5 in.
  - They are very easy to catch on bait (worms) or small lures and flies, and are commonly caught by trout anglers.
  - Source: [CT DEEP fallfish page](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/fallfish) [primary].
  - In CT lake electrofishing they were caught in only 45 of 426 lake sites, usually at 0.5–15/hr — [CT DEEP survey](https://portal.ct.gov/-/media/deep/fishing/fisheries_management/statewidelakeandlargeriverelectrofishingsurveypdf.pdf) [primary].
- **Northern populations also use lakes;** southern ones are limited to streams. — [SciSpace fallfish digest](https://scispace.com/topics/fallfish-3o5slshq) [search summary]
- **They live in clear, gravel-bottomed streams and lakes.** — [NPS species profile](https://irma.nps.gov/NPSpecies/Species/Profile/104941) [search summary]
- **They also use lake margins.** — [FishBase](https://www.fishbase.se/summary/2953) [search summary]
- **Hot Brook's own record.** MDIFW lists fallfish in both lakes, and the 1949 sheet lists them among the minnows (see `hot_brook_lake_records.md`). The owner reports catching more fallfish than perch (memory note: field observations).

### Inferences for the simulation
- **Design value: fallfish about 3–10% of the ≥7.5 cm census, roughly 75–250/ha.**
  - Weight it toward the connecting brook, the inlet and outlet mouths, and rocky shores.
  - The lower end follows the regional median; the upper end follows lakes with good stream connections like Hot Brook's.
- **Fallfish should school loosely along rocky shores in summer.** They should spawn (build mounds) in the brook's riffles.
- **Give fallfish an angler catchability several times that of perch** (Q6). The owner fishes the stream pools.

### Gaps
- No fallfish density (per ha), lake catch-per-effort from Maine, or school-size figure was found.
- The MassWildlife fallfish page returned 403.
- Reed (1971, *Trans. AFS*) was seen only as a citation.

---

## Q4. The small-minnow guild near shore: which species make "schools of real small minnows"

### Takeaway
In eastern-Maine lakes the inshore small-fish schools are mostly young fish and a few small species:
- **YOY and juvenile yellow perch**, by far the most numerous: hundreds per lake in EMAP nets and seines;
- **YOY and juvenile white perch**;
- **YOY white sucker**;
- **banded killifish**, in very shallow water;
- **juvenile fallfish**;
- where present, golden shiner, common shiner, blacknose shiner, northern redbelly dace, lake chub and creek chub;
- in Hot Brook, also blacknose dace from the stream.

Hot Brook's MDIFW list has no golden or common shiner. Its "minnow schools" are therefore most likely YOY perch, white perch and suckers, banded killifish, and young fallfish and dace. Young perch schools typically number **50–200 fish**.

### Cited Findings
- **Juvenile and YOY counts dwarf adults in EMAP's small-fish classes** — [EMAP fshcnt-2.txt](https://archive.epa.gov/emap/archive-emap/web/txt/fshcnt-2.txt) [primary data, tallied by the fetch tool]:
  - East Branch Lake: yellow perch 577 juveniles + 331 YOY vs 45 adults.
  - Mattanawcook Pond: yellow perch 241 juveniles + 81 YOY; white perch 258 juveniles.
  - Upper Middle Branch: banded killifish 107 YOY; white sucker 114 YOY.
  - Pleasant Lake: yellow perch 121 YOY, white perch 64 YOY, banded killifish 35, lake chub 34.
  - Lower Oxbrook: small cyprinids together about 10% of the catch (N. redbelly dace 18, common shiner 13, blacknose shiner 10, *Phoxinus* hybrid 9, golden shiner 7, creek chub 5).
  - Lakes open to sea-run fish: juvenile alewife 844 (Second Lake) and 196 (Crawford).
- **Banded killifish** — [CT DEEP banded killifish](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/banded-killifish); [NJ DFW](https://www.nj.gov/dep/fgw/pdf/delriver/artdel_sp_banded_killifish.pdf) [search summaries]
  - They form moderate-sized schools in very shallow lake water (under 6 in), over sand near vegetation.
  - They are commonly abundant in the Northeast.
- **Killifish can dominate shallow-water catches.** In Presque Isle Bay (Lake Erie), killifish were 86% of the shallow-water catch. — [Phillips et al. 2007, *Northeastern Naturalist* 14(2)](https://www.eaglehill.us/NENAonline/articles/NENA-14-2/18-Phillips.shtml) [search summary]
- **Young yellow perch schools:**
  - YOY yellow perch school more than older fish. Schools are spindle-shaped, hold **50–200 fish**, and appear sorted by size and age. — [ADW *Perca flavescens*](https://animaldiversity.org/accounts/Perca_flavescens) [search summary]
  - They move inshore to a littoral life at about 30 mm in early August (Manitoba). In Oneida Lake the shift from open water to the bottom is complete by late July at 30–40 mm. — [U. Manitoba thesis](https://mspace.lib.umanitoba.ca/bitstreams/d0894e01-62f3-49f2-8c87-04d92d839d88/download) [search summary]
- **Yellow perch shoals in Lake Constance:** offshore by day, averaging about 6.6 m wide, and move into the littoral at dusk to rest on the bottom. — [U. Konstanz](https://kops.uni-konstanz.de/server/api/core/bitstreams/dd2c7fa7-f4c6-4632-81ef-a1d63d6ec64f/content) [search summary]
- **Maine lake counts:** banded killifish 363 lakes, golden shiner 851, common shiner 462. Golden shiner spawn over vegetation; common shiner need running water over gravel. — [MDIFW non-sport plan](https://www.maine.gov/IFW/docs/strategic-management-plans/nonsportcommercial.pdf) [search summary]

### Inferences for the simulation
- **The sim's young-of-year schools are the right mechanism for the owner's "schools of real small minnows".** Render them as many shoals of 50–200 near shore from July onward, mostly yellow perch, with white perch and sucker shoals mixed in.
- **Add banded killifish as a schooling inshore species** in water under about 0.3 m over sand and vegetation, about 1–5% of the census.
- **Keep golden shiner minor or absent in Hot Brook.**
- Blacknose dace belong to the brook (see the prior note).

### Gaps
- No seine or minnow-trap catch-per-effort survey of Maine lake shallows was found. EMAP gives counts but no effort.
- No school-size data for killifish, shiners or fallfish.
- I did not reach a University of Maine thesis on littoral fish.

---

## Q5. Yellow and white perch: small and stunted perch, typical sizes, and abundance relative to bass

### Takeaway
Both perch species are typically small in Maine:
- Yellow perch usually 6–12 in. White perch reach about 8–10 in by age 4, and size depends strongly on how crowded the population is.
- Landlocked white perch tend to become over-abundant and stunted. MDIFW repeatedly encourages white perch harvest to prevent stunting.
- In eastern-Maine nets, adult yellow perch are scarce relative to juveniles. In Crawford Lake there were 3 adults vs 98 juveniles and YOY, while adult smallmouth numbered 51. Bass grow well on abundant juvenile yellow perch (Marks Lake).
- Adult perch outnumber adult bass in most lakes:
  - white perch by about 18:1 (median of the 6 lakes with both species; 4.8–42), or about 9:1 if Cathance's zero is counted;
  - yellow perch by about 3.6:1 (median of 7 lakes).
- Bass equal or outnumber adult yellow perch in bass-rich lakes (Crawford, Cathance).

### Cited Findings
- **MDIFW species profiles** [search summaries]:
  - Yellow perch normally run 6–12 in and ¼–1 lb, occasionally up to 15 in and 1.6 lb — [MDIFW yellow perch](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/yellow-perch.html).
  - White perch: an 8–10 in fish weighs about 0.45 lb and is about 4 years old. A 6-year-old is 6–12 in. Size varies greatly with habitat and perch density, and lifespan is about 5–7 years — [MDIFW white perch](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/white-perch.html).
- **Crawford Lake (Washington).** White perch were abundant. Of 60 sampled in July 1973, about 30% were over 10 in. In [Long Lake](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/long_lake.pdf) some reached 12–13 in. — [MDIFW Crawford Lake sheet](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/crawford_lake.pdf) [search summary]
- **Marks Lake (Washington Co.).** Most bass are in excellent condition from feeding heavily on abundant juvenile yellow perch. — [MDIFW Marks Lake sheet (1966, rev. 1999)](https://www.maine.gov/ifw/docs/lake-survey-maps/washington/marks_lake.pdf) [search summary]
- **Stunting and over-population:**
  - [Pierce Pond](https://www.maine.gov/IFW/docs/lake-survey-maps/hancock/pierce_pond.pdf): harvest is wanted to guard against over-population and stunting.
  - [Pleasant Lake (Cumberland)](https://www.maine.gov/IFW/docs/lake-survey-maps/cumberland/pleasant_lake.pdf): extremely large numbers of white perch; anglers are asked to keep all they catch.
  - [George Pond](https://www.maine.gov/ifw/docs/lake-survey-maps/penobscot/george_pond.pdf): crowding of many abundant species has stunted the fish.
  - All three are search summaries.
- **Connecticut DEEP** [primary]:
  - White perch can be extremely abundant. Landlocked populations tend to become over-abundant and stunted; adults are commonly 5–9 in — [CT white perch](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/white-perch).
  - Yellow perch are typically common to abundant, commonly 6–11 in, and school in open water and along shores — [CT yellow perch](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/yellow-perch).
- **EMAP adult ratios** (Q1 table; my arithmetic):

| Lake | Adult WP : SMB | Adult YP : SMB |
|---|---|---|
| Fourth Machias | 27 | 33 |
| Second | 42 | 3.6 |
| Pleasant | 8 | 13 |
| Crawford | 4.8 | 0.06 |
| Mattanawcook | 28 | 3.0 |
| East Branch | 8.9 | 4.1 |
| Cathance | no WP | 0.66 |

- Elsewhere: Michigan experimental-lake perch stopped growing at 4–5 in once benthic food ran out — [MI DNR RR0334](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR0301-RR0400/RR0334.pdf) [search summary, flagged non-NE].

### Inferences for the simulation
- **Target a perch size structure with many fish of 8–15 cm and few over 20 cm.** Yellow perch over 25 cm should be rare. White perch should be mostly 13–23 cm (5–9 in), with about a quarter over 25 cm.
- The owner's "small perch" is then the expected outcome, not an error. The sim's density-dependent growth (scramble competition among schools) is the right mechanism.
- **Bass predation on juvenile yellow perch (the Marks Lake pattern) should be a main pathway** that keeps adult yellow perch scarce while bass stay in good condition.
- **Proposed ratios at ≥7.5 cm:** white perch ≥ yellow perch at adult sizes, and roughly 5–30 adult white perch per adult bass (EMAP range 4.8–42).
- Adult yellow perch should be only about 1–5 per adult bass. Total yellow perch (≥7.5 cm, juveniles included) can be about 5–15 per bass; the EMAP all-ages yellow perch : bass median is about 7.5.

### Gaps
- No Maine length-at-age table for yellow or white perch was readable. The MDIFW yellow perch and white perch plans are behind the 403: [yellowperch.pdf](https://www.maine.gov/ifw/docs/yellowperch.pdf), [whiteperch.pdf](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf).
- No mean length from a perch survey of a Region C or F warmwater lake was found.

---

## Q6. Angler catch vs abundance: how different can the two be?

### Takeaway
Angler catch composition can differ from net or electrofishing composition by an order of magnitude per species:
- Bass are the most vulnerable fish to both electrofishing and angling. Under catch-and-release, individual bass are re-caught several times a year.
- Fallfish are "very easy" to catch on lures, flies and worms.
- White perch and yellow perch are readily caught only on small baits and lures, where their roving schools happen to be.

An angler casting bass-sized lures from shore or in the brook will therefore catch mostly bass and fallfish, even in lakes where white perch are by far the most numerous adult fish.

### Cited Findings
- **CT DEEP gear vulnerability.** Electrofishing vulnerability is high for bass and sunfish, moderate for pickerel, perch, shiners, killifish and suckers, and low for bullheads and eels. Comparing catch per hour gives only a rough idea of relative abundance among species. — [CT DEEP survey](https://portal.ct.gov/-/media/deep/fishing/fisheries_management/statewidelakeandlargeriverelectrofishingsurveypdf.pdf) [primary]
- **Bass catchability.** Pallette Lake (Wisconsin): every bass could be caught and released 3–7 times a year, and males are more catchable. — [Shaw et al., NAJFM](https://www.citedrive.com/en/discovery/vulnerability-to-angling-and-survival-of-smallmouth-bass-in-a-northern-wisconsin-lake/) [primary abstract]
- **Ohio largemouth:** catchability was lower for bass below stock length. Angled bass (active, highly vulnerable fish) are contrasted with electrofished bass (passive capture) in a Lake Erie project. — [AFS 2016 abstract](https://afs.confex.com/afs/2016/webprogram/Paper24984.html); [GLATOS LESMB](https://glatos.glos.us/home/project/LESMB) [search summaries, flagged non-NE]
- **Fallfish** are very easy to catch on worms, small lures and flies, and are commonly caught by trout anglers in streams. — [CT DEEP fallfish](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/fallfish) [primary]
- **White and yellow perch** are readily caught on a wide range of *small* baits and lures (jigs, minnows, worms) — [CT white perch](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/white-perch); [CT yellow perch](https://portal.ct.gov/deep/fishing/freshwater/freshwater-fishes-of-connecticut/yellow-perch) [primary]
- **MDIFW on Grand Lake Region perch:** it highlights "hard-fighting smallmouth bass" and the "eager biting schools of white perch". — [MDIFW Region C guide](https://www.maine.gov/ifw/fishing-boating/fishing/maine-fishing-guide/regions/grand-lake-region.html) [search summary]
- **Angling and electrofishing agree on trends.** On the New River (NC) they agree on smallmouth trends; agreement on size structure depends on angling sample size. — [NC Wildlife](https://ncwildlife.org/media/3025/download) [search summary, flagged non-NE]
- **Gear also biases sizes.** In South Dakota, electrofished smallmouth were significantly smaller than fyke-netted ones. — [core.ac.uk record](https://core.ac.uk/works/62555589) [search summary]

### Inferences for the simulation
- **Do not calibrate population numbers to angler catch.** Calibrate to the EMAP net composition (Q1) and treat the owner's catches as catch-per-effort under strong selectivity.
- **If the sim ever models angling, use relative catchability per fish encountered.** A rough starting point:

| Species | Relative catchability |
|---|---|
| Smallmouth bass | 1.0 |
| Fallfish | 0.5–1.0 |
| Chain pickerel | about 0.5 |
| White perch | about 0.1–0.3, school-patchy |
| Yellow perch | about 0.1, and small fish are released or ignored |

  This is an inference from the qualitative sources above, not a measured value.
- **Owner's observation, checked:** "not nearly as many perch as fallfish and bass" plus "perch are small" plus "schools of small minnows" is what one expects in a lake where nets would show:
  - white perch at about 40–60% of adults;
  - yellow perch mostly juveniles;
  - bass a few percent to 15% of adults;
  - fallfish a few percent near streams.

  The sim's census needs mainly three fixes: fewer large yellow perch, fallfish and banded killifish added, and golden shiner cut.

### Gaps
- No study was found comparing creel catch composition with net composition in the same northeastern lake.
- No species-specific angling catchability coefficients exist for yellow perch, white perch or fallfish.

---

## Q7. Coordinator additions: (a) trout and salmon in Upper Hot Brook Lake, (b) the 25-fish white perch limit, (c) the bass rules

### Takeaway
- **(a) Trout and salmon.** No MDIFW record found here supports "occasional brook trout and Atlantic salmon" in Upper Hot Brook Lake.
  - MDIFW's survey sheets list no trout or salmon. They state that the lakes' small tributaries, and the rocky inlet from Upper, lack any coldwater habitat. Neither lake was stocked in 2015–2025.
  - The claim does appear in a real-estate listing for Lower Hot Brook Lake. That listing is the most likely origin of the owner's summary.
  - If trout or salmon ever occur, they would be rare strays: brook trout from the Baskahegan Stream drainage, or landlocked salmon. They could be there only from ice-out to early June and from mid-September to ice-on. A 24 °C unstratified lake exceeds brook trout's stress (about 20 °C) and growth (about 23 °C) limits all summer.
- **(b) White perch limit.** The 25-fish white perch bag limit on these lakes is a *restriction* adopted on a **citizen petition, "not for biological reasons"** (MDIFW 2002). It does not signal an overabundant or stunted population. Where MDIFW thinks white perch are overabundant, it *encourages* harvest instead.
- **(c) Bass rules.** Confirmed:
  - The survey sheets (1949, revised 1965 and 2004) say the lakes are managed for "a larger than average size bass fishery".
  - The 2019, 2023 and 2026 law books: 25 white perch a day, **all bass released alive at once**, and from Oct 1 to Dec 31 artificial lures only with trout/salmon/togue released (S-7).

### Cited Findings
**(a) Trout and salmon**
- **MDIFW Hot Brook survey sheets.** The fish lists for both lakes include no trout or salmon. The principal fisheries are bass, white perch and pickerel. Upper is a typical warm-water lake that does not stratify, and its small tributaries lack coldwater habitat. Lower's main inlet (from Upper) is rocky but has no suitable coldwater habitat. — [MDIFW Upper](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf); [MDIFW Lower](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_lower.pdf) [search summary this session; quoted directly in `hot_brook_lake_records.md`]
- **MDIFW Lake Fish of Maine database (2007).**
  - Upper's 10 species and Lower's 9 include no salmonids.
  - Neither lake appears in any MDIFW stocking report 2015–2025.
  - Danforth-town stockings go to East Grand Lake (brook trout and landlocked salmon) and Little Greenland Pond. East Grand drains to the St. Croix, not to Hot Brook.
  - See `hot_brook_lake_records.md` and `recent_maine_research.md` (prior research, primary).
- **Real-estate listing.** A listing for a house on Lower Hot Brook Lake (713 acres) claims brook trout, salmon, smallmouth bass, white perch and pickerel. — [landleader.com listing](https://landleader.com/property/log-cabin-on-lower-hot-brook-lake-washington-maine/31455) [search summary; page now 404]
- **Where trout could come from.**
  - Lower's outlet (Hot Brook) flows to Baskahegan Stream, then the Mattawamkeag and the Penobscot (prior note).
  - Baskahegan Stream supports a good seasonal trout fishery, yet brook trout are seldom caught in Baskahegan Lake itself. — [MDIFW Baskahegan Lake](https://www1.maine.gov/IFW/docs/lake-survey-maps/washington/baskahegan_lake.pdf) [search summary]
- **Sea-run Atlantic salmon** in the Penobscot number about 1,000–1,500 returning adults, against a historic 75,000–100,000.
  - The West Branch Mattawamkeag is designated critical habitat.
  - A $198,000 river-herring fishway is planned at Baskahegan Lake and Crooked Brook.
  - Sources: [Wolfden hearing exhibit 2023](https://www1.maine.gov/dacf/lupc/projects/wolfden/public-hearing/ZP779A_2023-10-18_TribesNonprofitsHearingExhibits.pdf); [ASF Maine Headwaters](https://www.asf.ca/?p=36632) [search summaries].
  - No record was found of salmon in Baskahegan Stream or Hot Brook.
- **Landlocked salmon in nearby lakes.** EMAP nets caught a few in lakes with salmon fisheries: Upper Middle Branch 9, Cathance 7, Lower Oxbrook 1, Pleasant 1. — [EMAP fshcnt-2.txt](https://archive.epa.gov/emap/archive-emap/web/txt/fshcnt-2.txt) [primary data]
- **Thermal limits.**
  - Brook trout: tolerance about 20 °C; lab lethal limit about 25 °C for juveniles. In lakes they shelter in summer on groundwater seeps at 18–20 °C, and cold groundwater flow explained 87% of trout density. — [Biro 1998](https://www.harkness.ca/PDFs/Contributions%201990s/biro%201998.pdf) [search summary]
  - Brook trout growth falls above 16 °C and is negative at 24 °C (upper limit for positive growth about 23.4 °C). — [Chadwick & McCormick, USGS](https://pubs.usgs.gov/publication/70209864) [search summary]
  - Atlantic salmon: juvenile incipient lethal temperature 27.8 °C; adults likely near 25 °C. — [DFO](https://waves-vagues.dfo-mpo.gc.ca/Library/346488.pdf) [search summary]
  - Salmon feeding stops at about 22.5 °C. — [KRIS Sheepscot](https://krisweb.com/krissheepscot/krisdb/html/krisweb/stream/temperature_sheepscot.htm) [search summary]

**(b) White perch bag limit**
- **2002 MDIFW White Perch Plan:** a 25 fish per day bag limit was imposed on seven eastern-Maine lakes on a citizen petition, not for biological reasons. — [MDIFW White Perch Plan 2002](https://www.maine.gov/ifw/docs/strategic-management-plans/whiteperch.pdf) [quoted in `hot_brook_lake_records.md`]
- **Historical resolves:** 1950s resolves *removed* white perch size and bag limits in several counties, including Washington and Hancock waters. — [1955 Resolves c.78](https://lldc.mainelegislature.org/Open/Laws/1955/1955_RES_c078.pdf) [search summary]
- Where MDIFW judged white perch over-abundant (Chain Lakes, Pierce Pond, Pleasant Lake), it encouraged harvest (Q1, Q5).

**(c) Bass rules**
- **Survey sheets:** "managed for a larger than average size bass fishery", plus a special 25-fish white perch limit. — [MDIFW Upper/Lower sheets](https://www.maine.gov/IFW/docs/lake-survey-maps/washington/hot_brook_lake_upper.pdf) [search summary this session; primary in prior note]
- **Law books** (prior research, primary): "HOT BROOK LAKES, LOWER AND UPPER … (South Zone). Daily bag limit on white perch: 25 fish. All bass must be released alive at once. From October 1 – December 31: ALO, S-7."
  - The entry is unchanged in [2019](https://www.maine.gov/ifw/docs/2019_MaineFishingLaws.pdf), [2023](https://www.maine.gov/ifw/docs/22-MDIFW-6-FISHING-LAWBOOK-2023.pdf) and [2026](https://www.maine.gov/ifw/docs/25-MDIFW-23-FISHING-LAWBOOK-2026.pdf).
  - The South Zone general law is 2 bass, only 1 over 14 in.
  - A 2024 MDIFW proposal to drop special bass rules on 14 *North Zone* waters does not apply to these South Zone lakes [search summary].
- **Earlier rule (unverified):** 1 bass, with 16–20 in fish released — [mainerec.com](http://www.mainerec.com/wafish.asp?Category=89&PageNum=89) [search snippet, prior note].

### Inferences for the simulation
- **(a)** Do not add resident trout or salmon.
  - At most, script a rare event: 0–a few brook trout a year entering from the outlet in spring or fall, leaving or dying once the surface passes about 20–22 °C (mid-June). This is optional and low priority.
  - The law book's S-7 clause is a standard Oct–Dec code attached to the extended artificial-lures season. My inference is that it is not evidence the species are present.
- **(b)** Treat white perch as abundant (a principal fishery, and the dominant adult fish in regional nets), but not as unusually over-abundant because of the bag limit.
  - Angler harvest under a 25-fish limit is light. Natural, density-dependent growth should set their size.
- **(c)** Bass harvest is zero in the sim; this is correct. Bass size structure should come from growth and first-winter survival (Q2), not from the rule.

### Gaps
- The maine.gov sheets themselves could not be re-read this session (HTTP 403). The coldwater-habitat statements rest on this session's search summary plus the prior note's direct quotes.
- No angler-diary, creel or MDIFW record of any salmonid in either Hot Brook lake was found.
- The real-estate listing page is now 404.
- The year the 25-fish limit began, and the seven lakes it covers, were not confirmed.
