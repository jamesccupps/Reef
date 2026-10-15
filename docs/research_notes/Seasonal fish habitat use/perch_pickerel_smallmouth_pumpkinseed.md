# Where yellow perch, chain pickerel, smallmouth bass and pumpkinseed are, by season and by time of day, in northern lakes

**Scope and sourcing.**
- **What and why:** collected 2026-10-15 for the sim's habitat mechanisms (temperature, O₂, food, cover, light, social) and its validation checks. The region is Maine, New England, Nova Scotia, Ontario, Quebec and the upper Midwest. Eurasian perch (*Perca fluviatilis*, "EP"), northern pike and bluegill are used only where the target species has no data, and are labelled.
- **Method:** four parallel research passes (one per species) plus a cross-species pass. The shared web-search budget ran out near the end of each pass, so some threads stop at abstract level (see §7).
- **Spot-checks against full text** (extracted with `pdftotext`):
  - Suski & Ridgway 2009 (smallmouth, Lake Opeongo);
  - Sergio 2026 (pickerel and smallmouth, Milipsigate Lake);
  - Imbrock et al. 1996 (EP, Lake Constance);
  - Cooper & Washburn 1946 (Michigan winterkill; OCR text layer);
  - Reeve et al. 2022 (pumpkinseed cold activity).
- **Labels:**
  - **[primary]:** the paper, or at least its abstract, was read.
  - **[via X]:** quoted by a secondary source.
  - **[agency]:** state or provincial fisheries agency.
  - **[angler]:** magazines, guides and forums. Useful for *where fish are caught*; weak on mechanism.
  - **[snippet]:** seen only in a search-result summary.
  - **[surrogate]:** a related species stands in for the target.
- **Lake types are flagged throughout,** because the patterns differ:
  - **Deep, stratified:** Opeongo (mean depth 14.8 m), Mendota (about 25 m), Milipsigate (17 m maximum), Constance.
  - **Shallow, mixed:** Opinicon (under 11 m maximum, does not stratify), Lake Madison SD (1.2–4.3 m used), the Michigan winterkill lakes, Maine ponds of 1–6 m.
  - Most Maine warm-water lakes and the sim's pond are the shallow kind.
- **Related notes:**
  - Thermal limits, under-ice O₂ lethal thresholds and spawning parameters are in [centrarchid_percid_esocid_parameters.md](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md) (Q4, Q6). They are not repeated here.
  - Lake physics (stratification, under-ice temperatures, winter O₂) is in [maine_limnology_streams.md](../Maine%20lakes%20ponds%20and%20streams/maine_limnology_streams.md) (§4–5).

---

## 0. Shared setting and mechanisms

### Takeaway
- **Under ice the bottom is the warmest water (3–4 °C) and the first to lose O₂.** Fish that sit deep for warmth are pushed up and toward inflows as winter goes on.
- **O₂ thresholds are behavioural before they are lethal.**
  - Fish avoid water below about **2 mg/L** under ice: largemouth bass telemetry, and perch in summer.
  - They die at about 0.6 mg/L (bass, bluegill) or about 0.3–0.4 mg/L (perch, pumpkinseed, pickerels).
  - In a Michigan winterkill, the tolerant species, including perch, pumpkinseed and pickerel, fled into an oxygenated inlet. Bass and bluegill did not and died.
- **Light gates visual feeding and schooling.**
  - A black bass catches prey at > 95% success down to moonlight, 62% at starlight, and about 0% in darkness.
  - Perch schools break up below about 100 lx (EP).
- **Fish treat temperature as a resource,** occupying a band about 4 °C wide around their preferendum.

### Cited findings

**Lake physics** (from the Maine limnology notes, §4–5)
- **Persistent stratification:** Maine lakes shallower than about **8–10 m** maximum depth do not stratify persistently.
- **A 4–5.5 m Hot Brook-type pond:** polymictic, top-to-bottom difference 0–3 °C, August mean about 22–25 °C.
- **Deep lakes:**
  - The thermocline sits at about 5–7 m in July and 9–12 m by September.
  - The hypolimnion of productive or coloured lakes falls below 2 mg/L O₂ by late summer.
- **Under ice:** about 0–1 °C just under the ice and about 3–4 °C at the bottom.
- **Winterkill in Maine** is documented in weedy ponds of 1.2–1.8 m maximum depth, in snowy winters.
- [maine_limnology_streams.md](../Maine%20lakes%20ponds%20and%20streams/maine_limnology_streams.md)

**Winter O₂: where the fish went (Cooper & Washburn 1946, southern Michigan, winter 1944–45)** [primary; OCR text read]
- **Where O₂ was highest:** "the surface samples (taken at a depth of from 6 inches to a foot below the surface) almost invariably had the most oxygen."
- **Green Lake inlet:**
  - The single inlet (about 150 yd long, about 50 gal/min, "sluggish") "served as a refuge for many fish."
  - **29 January:** 2,000–4,000 fish of 8–20 cm were in it: mud (grass) pickerel *E. americanus*, bullheads, chubsuckers, golden shiners, pumpkinseeds, yellow perch and mudminnows. "No bluegills, crappies, or bass were seen … among hundreds of fish identified."
  - **31 January:** about 15,000 fish were "packed" into it, with O₂ at 7.1 ppm at the head and 0.05 ppm at the mouth.
  - About 10,000 of them had moved in from the lake over 2 days, after living for "probably at least several days" below 1 ppm.
- **Open holes in the ice:**
  - Live bluegills, bullheads, pumpkinseeds and perch appeared in holes where surface O₂ was 0.4 ppm, "distressed, but otherwise normal".
- **Third Sister Lake air hole** (no inlet; an air-pump hole):
  - There was no concentration of fish at the hole while surface O₂ was 1–2 ppm.
  - At 0.4 ppm, young bluegills, chubsuckers, several hundred golden shiners and several adult mud pickerel were "crowding near the surface".
  - At 0.2 and 0.07 ppm, 10,000–20,000 fish milled at the surface of the hole, mostly shiners and bullheads, with a few pumpkinseeds, crappies, mud pickerel, mudminnows and one pike.
- **Batteese Lake:** anglers "had observed that fish were unusually near the surface" at the seasonal O₂ low.
- **Only one inflow escape:** Green Lake was "the only lake in which fish were observed … to concentrate in an inlet or outlet."
- Source: [Cooper & Washburn 1946, Michigan IFR Report 1078](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1001-RR1100/RR1078.pdf)
- Lethal thresholds from the same report are in the [parameter notes, Q6](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md).

**Avoidance threshold under ice: largemouth bass, Warner Lake, ON** (8.3 ha; 9 adults; whole-lake acoustic array; 4.0–5.5 °C under ice) [primary abstract]
- In the field, fish avoided water below **2.0 mg/L** but made heavy use of intermediate-O₂ water.
- In the lab, winter-acclimated juveniles began yawning and moving vertically below 2.0 mg/L, without lactate build-up.
- Hasler et al. 2009, *Physiol. Biochem. Zool.* 82:143 — [QUBS project page](https://research.qubs.ca/projects/the-influence-of-dissolved-oxygen-on-winter-habitat-selection-by-largemouth-bass-an-integration-of-field-biotelemetry-studies-and-laboratory-experiment)

**Survival tactics in a northern Wisconsin winterkill lake** [snippet]
- Fish use oxygenated microhabitats.
- Several small species move to the ice–water interface.
- Some species emigrate through the outlet.
- Mudminnows breathe gas bubbles trapped under the ice.
- Magnuson et al. 1985 — [Springer chapter](https://link.springer.com/chapter/10.1007/978-94-017-1158-6_22); [Env. Biol. Fish 14:241](https://link.springer.com/article/10.1007/BF00002627)

**Lab "nosing" at the ice** [snippet]
- Under simulated ice (2.5–4 °C, O₂ stepped from 4 down to 0.25 mg/L), perch and pike "nosed" the underside of the ice; bluegill seldom did.
- Perch gill ventilation and locomotion peaked at 0.5 mg/L.
- Petrosky & Magnuson 1973, via Kramer 1987 — [Kramer 1987](https://link.springer.com/article/10.1007/BF00002597)

**Light and visual feeding: largemouth bass, lab** [primary abstract]
- Capture success **> 95%** from dim daylight (2.4 × 10² lx) to moonlight (3 × 10⁻³ lx).
- **62%** at starlight (2 × 10⁻⁴ lx); **about 0%** in darkness.
- McMahon & Holanov 1995, *J. Fish Biol.* 46:759 — [record](https://www.deepdyve.com/lp/doc/guLOFvynKW)

**Temperature as a resource** [primary abstract]
- Fish respond to temperature as they do to food.
- The fundamental thermal niche is about **4 °C wide** (mean ± 1 SD of temperatures occupied on a lab gradient), and field niches have a similar centre.
- Fitness is highest when a fish secures its thermal niche.
- Magnuson, Crowder & Medvick 1979, *Am. Zool.* 19:331 — [OUP](https://academic.oup.com/icb/article/19/1/331/174441)

**Maine winter guidance (MDIFW)** [agency]
- Warmwater fish (bass, perch, chain pickerel, sunfish) "can be found throughout the water column during winter" but favour cover: woody debris, weed beds and rocks.
- Jigging "in shallow water of 5 to 20 feet" (1.5–6 m) is very effective; set bait 2–10 ft (0.6–3 m) off the bottom.
- [MDIFW blog, winter ice-fishing tips by species (2022)](https://www.maine.gov/ifw/blogs/mdifw-blog/winter-ice-fishing-tips-targeting-specific-species)

**Maine catch rates: winter against summer** [agency]
- **Chain pickerel:** 1.18 per angler-day through the ice against 0.49 in summer (1999).
- **Smallmouth and largemouth bass:** 0.46 against 1.7.
- These are proxies for feeding activity under ice. They are not abundance.
- [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf); [MDIFW black bass plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)

---

## 1. Yellow perch (*Perca flavescens*)

### Takeaway
- **By day, perch school over open bottom at intermediate depth.** They are not deep in the weeds.
  - Schools hold 50–200 fish, sorted by size, and are 20–30 m across (EP).
  - In stratified lakes they sit in the epilimnion just above the thermocline (EP: school centres 2–6 m above it). They avoid water below 2 mg/L O₂ but make short foraging forays into it.
  - In shallow lakes they use the deepest water available: Lake Madison SD, summer mean 3.4 m, range 1.2–4.3 m, about 340 m offshore.
- **At night they rest on the bottom, inshore.**
  - At dusk, schools break up as light falls (EP: under 100 lx at 8 m), move inshore along the bottom, disperse and rest.
  - They reform and move back out at dawn.
  - Movement by day is about 3× that at night (93 vs 28 m/h).
  - Twilight peaks are reported by some sources and absent in others.
- **Autumn is the most mobile season,** with movement about twice the summer rate. Perch school up and shift with the basin: deeper in deep or complex basins, closer to shore at turnover in Mendota.
- **Under ice, perch stay active, keep feeding and keep schooling, by day only.**
  - In deep lakes they concentrate in the deep basin through the ice season (Mendota: stations deeper than 15 m), with activity peaks in mid-morning and early afternoon.
  - Agencies and anglers add a shallow-green-weed phase at first and last ice.
  - They tolerate O₂ down to about 0.3–0.4 mg/L, and in a Michigan winterkill they moved into an oxygenated inlet.
- **Spawning is second, after pickerel, at about 7–13 °C.**
  - Gelatinous egg ribbons go on woody debris and plants at 0.5–8 m.
  - Spawning depth tracks water colour: in a brown lake 76% of masses were at 0–1 m; in a clear lake the median was 5–6 m.
  - Males arrive first. The day–night pattern breaks down while they spawn.

### Open-water summer
- **Lake Constance, EP** (deep, stratified; hydroacoustics, gillnets, divers, July 1993–February 1994) [primary, full text]:
  - **Schools:**
    - In summer, perch were in dense schools in the sublittoral by day: 90% of echoes lay between the 6 and 30 m contours, mostly at the 10 m contour.
    - Schools sat at 3–15 m water depth (5–95% quantiles; median 6 m), and more than half touched the bottom.
    - School height was 2–4 m and diameter 20–30 m.
  - **Thermocline:**
    - "The centre of the fish schools was located between 2 and 6 m above the thermocline throughout the stratification period."
    - Median depth tracked thermocline depth from July to mid-October, at 12.9–18.6 °C (July–September) and 10.8–13 °C (October).
    - The epilimnion was O₂-saturated, so O₂ did not set the depth.
  - **Size:** the share of young-of-year fell with depth, and the share of fish aged 2+ rose with it.
  - **Summer area:** about 200 ha.
  - Imbrock, Appenzeller & Eckmann 1996, *J. Fish Biol.* 49:1 — [PDF](https://d-nb.info/110877895X/34)
- **Lake Madison, SD** (shallow; yellow perch telemetry) [primary abstract]:
  - Depths used were 1.2–4.3 m.
  - Summer was deepest (mean 3.4 m) and farthest offshore (mean 344 m; range 12.6–874 m). Depth was the only significant habitat predictor.
  - The diet was mostly benthic invertebrates (amphipods, corixids, chironomids); 95% of stomachs held food.
  - [Radabaugh thesis](https://openprairie.sdstate.edu/etd/367/)
- **Lake Sinai, SD** (a "complex" basin; 57 adults) [primary abstract]:
  - Small adults (about 230 mm) averaged 6.4 m deep and 298 m from shore; large adults (about 268 mm) averaged 4.7 m and 213 m.
  - **Fish were never located in vegetated areas.**
  - July high-use cells were 2.5–6.5 m deep, on 2–3° slopes, 150–350 m from shore; Daphnia were in 87–90% of stomachs.
  - [Bauer 2006 thesis](https://openprairie.sdstate.edu/etd/285/)
- **Basin shape changes the pattern:** in a simple basin, depth and distance from shore were greatest in summer; in a complex basin, perch were shallower in summer and distance from shore did not change. [snippet] — [Radabaugh et al. 2010, NAJFM](https://informahealthcare.com/doi/full/10.1577/M08-243.1); [Bauer et al. 2009, NAJFM 29:64](https://academic.oup.com/najfm/article-abstract/29/1/64/7847055)
- **Littoral or pelagic by size (Crystal Lake, WI):** about 22% of adults chose pelagic habitat after spawning. Larger perch selected pelagic habitat; sub-adults and juveniles the littoral. [snippet] — [Mrnak et al.](https://par.nsf.gov/servlets/purl/10316443); [Feucht et al. 2023](https://doaj.org/article/68c5f86ccee34a46b1307a56da8ac32b)
  - **Conflict:** in Lake Sinai the larger fish were *nearer* shore.
- **Lake Opinicon, ON** (shallow, unstratified):
  - 80–90% of all fish biomass lay along the margins at ≤ 2.5 m. [primary summary] — [Keast & Harker 1977](https://research.qubs.ca/projects/fish-distribution-and-benthic-invertebrate-biomass-relative-to-depth-in-an-ontario-lake)
  - Perch are also one of the dominant species offshore, in gillnets at 1.5–7 m. [primary summary] — [Keast & Fox 1992](https://research.qubs.ca/projects/space-use-and-feeding-patterns-of-an-offshore-fish-assemblage-in-a-shallow-mesotrophic-lake)
- **Agencies:**
  - Usually shallower than 9 m. [agency] — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=149)
  - Rarely taken deeper than about 9 m; shallower in spring and fall than in summer. [agency; snippet] — [Michigan DNR](https://www.michigan.gov/dnr/education/michigan-species/fish-species/yellow-perch)
  - Ideal lakes have 15–25% littoral area, with 25–50% of it giving cover. Perch move in loose schools sorted by size and are inactive at night. [agency, citing Krieger & Terrell 1983] — [NJ DFW](https://www.nj.gov/dep/fgw/pdf/fishfact/perch_yellow.pdf)
- **Schools** [via ADW]:
  - Schools are spindle-shaped, hold 50–200 fish and are sorted by size and age (Herman et al. 1959). Young-of-year school more than adults; large adults sometimes travel alone. The sexes are often in separate schools (Craig 1987).
  - All sizes move deeper and cooler as the water warms, avoiding both the cold deep water and the warm surface.
  - [ADW](https://animaldiversity.org/accounts/Perca_flavescens)
- **Summer hypoxia (Lake Erie central basin)** [primary abstract]:
  - Most perch avoided water below 2 mg/L, moving sideways or rising above the oxycline.
  - Some made foraging forays into the hypoxic hypolimnion after benthic prey, mostly when the hypolimnion was small or rich in chironomids.
  - [Roberts et al. 2012](https://pubs.usgs.gov/publication/70118127)
  - Consumption and growth fall at 2 mg/L or below. [snippet] — [Roberts et al. 2011](https://pubs.usgs.gov/publication/70118788)

### Autumn
- **Lake Mendota, WI (deep):** at fall turnover perch "move out of their deep water summer habitat and move closer to shore, often gathering in schools". [agency] — [WI DNR Mendota gillnet report](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Reports_DaneMendota20202024GillNet.pdf)
- **Lake Constance, EP:** in October, perch of all ages began moving to the profundal. [primary] — [Imbrock 1996](https://d-nb.info/110877895X/34)
- **Fall is the most mobile season:**
  - Lake Madison: 97.6 m/h in fall against 45.6 m/h in summer. [primary abstract] — [Radabaugh](https://openprairie.sdstate.edu/etd/367/)
  - Lake Sinai: 48.8 m/h, with fall dusk rates 52 m/h above any other season. [primary abstract] — [Bauer 2006](https://openprairie.sdstate.edu/etd/285/)
- **Fall depth depends on the basin:** deeper in the complex lake [snippet; Radabaugh 2010], but *shallowest* in fall in shallow Lake Madison (mean 2.9 m). [primary abstract] — [Radabaugh](https://openprairie.sdstate.edu/etd/367/)

### Winter under ice
- **Lake Mendota echo sounder** (deep; early January to mid-March; ice ≥ 50 cm, about 114 days) [snippet of abstract; DTIC returned 403]:
  - Perch "are active primarily during daylight hours with peak periods occurring in mid-morning and early afternoon"; the afternoon peak is usually smaller.
  - The peaks are "in large part owing to perch schools which are active at those times".
  - Fish counts were always much higher at stations deeper than 50 ft (15 m). Perch "remain concentrated in the deeper portions of the lake throughout the duration of ice cover".
  - Probably Hergenrader & Hasler 1966 — [DTIC AD0619974](https://apps.dtic.mil/sti/html/tr/AD0619974/index.html)
- **Swimming speed by season (Mendota sonar)** [snippet of abstract]:
  - Speed is lowest in winter at 0–5 °C and rises linearly with temperature to a midsummer maximum at 20–25 °C.
  - Lone perch swim at about half the speed of schools.
  - Day length sets how long perch are active each day, and temperature sets how fast.
  - Hergenrader & Hasler 1967, *TAFS* 96:373 — [OUP](https://academic.oup.com/tafs/article-abstract/96/4/373/7893637)
- **Lake Constance in winter, EP** (no ice; nearly uniform temperature) [primary]:
  - Perch lay between the 35 and 70 m contours, spread over about 2,000 ha (10× the summer area) at fewer than 1,000 fish/ha.
  - They rested on or near the bottom by day, then at dusk rose to as little as 20 m below the surface and dispersed through the water column at night. This is the reverse of summer. No yellow perch under-ice data test it.
  - [Imbrock 1996](https://d-nb.info/110877895X/34)
- **Winter feeding:**
  - Perch "remain active during the winter months". [agency] — [NJ DFW](https://www.nj.gov/dep/fgw/pdf/fishfact/perch_yellow.pdf)
  - Perch feed actively all winter. [agency] — [Scott & Crossman, via parameter notes Q6](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md)
  - EP in eutrophic Lake Kortowskie (17 m), October–March, 81 fish including some netted under ice [primary]:
    - 28% of guts were empty.
    - Zooplankton dominated in late autumn; fish and insect larvae in winter.
    - February: Chaoborus 40% and chironomids 40%. March: caddis larvae 80%.
    - [Wziątek et al. 2004](https://fal.infish.com.pl/index.php/FisheriesAndAquaticLife/article/download/155/155)
- **First ice to late ice (MN DNR)** [agency]:
  - Early winter: "shallow water in around healthy green vegetation".
  - Later: "deeper water, drop-offs and other structure".
  - Late winter: "return to shallow waters to spawn".
  - Best near dawn and dusk; fish near the bottom.
  - [MN DNR ice fishing for perch](https://www.dnr.state.mn.us/gofishing/ice-fishing-perch.html)
- **Anglers** [angler]:
  - "At first ice they can be very shallow"; they go deeper as winter goes on; "Toward spring, they come back shallow again". Chara beds are "a grocery store for perch" (S. Sendek, retired Michigan DNR biologist).
  - Hard-to-soft bottom transitions; "pound the bottom".
  - [Great Lakes Angler](https://www.glangler.com/blogs/articles/perch-on-ice-robert-gwizdz)
  - Midwinter brings the year's biggest schools, grazing mud flats for bloodworms (chironomids) and mayfly larvae. "A basin depth could be 18 feet deep or 50 feet deep" (5.5–15 m). Midday is prime. — [Midwest Outdoors](https://midwestoutdoors.com/?p=144940)
  - Winter perch hold near the bottom, whether in 3 m or 9 m. — [Game & Fish](https://www.gameandfishmag.com/editorial/5-baits-for-winter-yellow-perch-and-how-to-fish-them/389494)
  - In shallow "dishpan" lakes at first ice, perch are often at 1.2–2.4 m. [snippet]
- **Late-winter hypoxia:** perch were among the fish that moved from a lake below 1 ppm into the oxygenated Green Lake inlet. Perch, pike and pumpkinseed survived to about 0.4 ppm, while bass and bluegill died at about 0.6 ppm (§0). [primary] — [Cooper & Washburn 1946](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1001-RR1100/RR1078.pdf)

### Spring: staging, spawning, dispersal
- **Movement:** adults move "from deep water where they overwinter to shallow water spawning areas", and males arrive first. [via ADW] — [ADW](https://animaldiversity.org/accounts/Perca_flavescens)
  - Lake Madison fish were closest to shore in spring (mean 251 m). [primary abstract] — [Radabaugh](https://openprairie.sdstate.edu/etd/367/)
- **Agency parameters:**
  - April–June at 7–13 °C, at 1.0–3.7 m, over vegetation, sand or gravel. Spawning runs from night to early morning. Eggs hatch in 8–10 days. Eggs need a long cold spell below 10 °C to ripen. [agency, citing Krieger & Terrell 1983] — [NJ DFW](https://www.nj.gov/dep/fgw/pdf/fishfact/perch_yellow.pdf)
  - 6–12 °C, April–May. [agency] — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=149)
  - 7–11 °C at 0.5–8 m. Egg strands are 0.6–2.1 m long and 5–8 cm wide. [via ADW, citing Craig 1987 and Herman 1959] — [ADW](https://animaldiversity.org/accounts/Perca_flavescens)
- **Spawning depth tracks water colour (UV)** [primary, full text]:
  - In brown, high-DOC Lake Lacawac, PA, **76% of egg masses lay at 0–1 m**.
  - In clear Lake Giles, PA, **92% lay deeper than 3 m**; the median was 5–6 m and the deepest 14 m.
  - Artificial branch substrates in Giles caught 0 masses at 0.5 m, 18–25 at 6 m and 1–4 at 15 m.
  - UV killed 100% of surface eggs in the clear lake.
  - Incubation temperatures were 7.7–13.3 °C. Spawners prefer woody debris and submerged plants.
  - Huff et al. 2004, *TAFS* 133:718 — [OUP](https://academic.oup.com/tafs/article/133/3/718/7888496)
  - Tea-coloured Maine lakes should therefore spawn shallow.
- **Woody structure (Iowa pond, 5.3 ha):** 35 skeins were laid on cedar trees set at 1.8 m, with the most complex trees preferred. Spawning paused while the water was 5.9–7.1 °C. [primary] — [Grausgruber et al. 2021](https://academic.oup.com/najfm/article/41/6/1892/7817293)
- **The day–night pattern breaks down while spawning;** perch are active day and night. [via Reebs 2002, citing Helfman 1981] — [Reebs 2002](https://gambusia.bsp.ncsu.edu/readings/Reebs%202002.pdf)
- **Larvae** (Lake Itasca, MN) [primary abstract]:
  - Larvae hatch at 5.5–6 mm in the littoral and are in the limnetic zone within 2 weeks.
  - They return to the littoral at about 25 mm, growing about 0.5 mm/day.
  - [Swindoll 1981](https://trace.tennessee.edu/utk_gradthes/15308)
  - The pelagic stage lasts about 40 days. [via] — [Dembkowski et al. 2011](https://digitalcommons.unl.edu/tpn/34)

### Diel
- **Diurnal feeding:** perch are diurnal (stomachs sampled every 2–3 h in early summer, Lake Opinicon). [primary abstract] — [Keast & Welsh 1968](https://research.qubs.ca/projects/daily-feeding-periodicities-food-uptake-rates-and-dietary-changes-with-flour-of-day-in-sorne-lake-fishes)
- **Schools need vision;** they "break up in the evening and reform in the morning". [via ADW, citing Helfman 1979 and Hergenrader & Hasler 1968] — [ADW](https://animaldiversity.org/accounts/Perca_flavescens)
- **The dusk sequence, EP, Lake Constance** [primary, full text]:
  - At light below 100 lx at 8 m, echo energy and schooling fell sharply.
  - Divers found perch at 1–30 m by day but few deeper than 5 m at night.
  - "At dusk, dense perch schools migrated inshore close to the bottom. In the littoral zone schools dispersed and the fish rested on the bottom during darkness. At dawn they showed a reverse migration."
  - A camera at 4 m counted up to 47 perch per frame at dusk and dawn, and none in 19 frames at night.
  - The authors suggest night rest avoids predators that hunt by mechanical cues; resting perch become less sensitive to visual and mechanical stimuli (Helfman 1979).
  - [Imbrock 1996](https://d-nb.info/110877895X/34)
- **Agencies:**
  - Perch "travel shoreward each morning and evening to feed", rest on the bottom at night and do not feed. [agency; snippet] — [Michigan DNR](https://www.michigan.gov/dnr/education/michigan-species/fish-species/yellow-perch)
  - They feed morning and evening and rest on the bottom at night. [agency] — [Illinois DNR](https://dnr.illinois.gov/education/wildaboutpages/wildaboutfishes/wafperch/wafyellowperch.html)
- **Lake Mendota, May–October (Hasler & Bardach 1949):** a daily migration, strong at sunset and weaker at sunrise, with congregations at particular sites at sunset. [snippet, via Brown & Rosen 1951] — [Brown & Rosen 1951](https://scholarworks.uni.edu/pias/vol58/iss1/54)
- **Telemetry:**
  - Movement rose from dawn into day and fell from dusk into night; night was lowest. In the complex lake, perch moved offshore from night to dawn and onshore from day to night; the simple lake had no such pattern. [primary abstract] — [Bauer et al. 2009](https://academic.oup.com/najfm/article-abstract/29/1/64/7847055)
  - Lake Madison: **92.6 m/h by day against 27.6 m/h at night**, with no twilight peaks, in every season, size and sex. [primary abstract] — [Radabaugh](https://openprairie.sdstate.edu/etd/367/)
  - Lake Sinai: no diel difference in depth or distance from shore. [primary abstract] — [Bauer 2006](https://openprairie.sdstate.edu/etd/285/)
- **Young perch migrate vertically:**
  - Age-0 EP in a shallow mixed reservoir: about 1 fish/m³ in the water column at night, but only about 3% of that by day, when they hugged the bottom. Feeding did not explain it; the authors call it predator avoidance. [primary abstract] — [Seďa et al. 2010](https://www.jlimnol.it/jlimnol/article/view/jlimnol.2010.305)
  - Age-0 yellow perch prefer 16.7 °C before dawn and 23.8 °C at dusk (Reynolds & Casterlin 1979). [via] — [Fischer et al. 1989](https://www.govinfo.gov/content/pkg/CZIC-sh171-s89-1989/html/CZIC-sh171-s89-1989.htm)

### Temperature and O₂
All values below are from [Fischer et al. 1989](https://www.govinfo.gov/content/pkg/CZIC-sh171-s89-1989/html/CZIC-sh171-s89-1989.htm) [via] unless another link is given.
- **Preferred temperature:**
  - Adults: 22.5 °C at 25 °C acclimation; 17.6–20.1 °C at 24 °C acclimation.
  - Juveniles: 19–23 °C. Young-of-year: 23 °C.
- **Optima:** juvenile growth is best near 22 °C; the adult physiological optimum is 24.7 °C.
- **Winter preference conflicts:**
  - 6.3 °C in a 0–15 °C power-plant plume, against 12–16 °C in another study.
  - Young-of-year prefer 4 °C warmer than adults from spring to fall, but 2 °C colder in winter.
- **Field and agency values:**
  - EP in Lake Constance sat at 13–19 °C. [primary] — [Imbrock 1996](https://d-nb.info/110877895X/34)
  - Preferred 18–24 °C. [agency] — [Ontario database](https://www.ontariofishes.ca/fish_detail.php?FID=149)
  - Optimum 19–24 °C with O₂ above 5 mg/L. [agency] — [NJ DFW](https://www.nj.gov/dep/fgw/pdf/fishfact/perch_yellow.pdf)
  - Perch follow the 20 °C layer. [agency; snippet] — [Michigan DNR](https://www.michigan.gov/dnr/education/michigan-species/fish-species/yellow-perch)
- **O₂:**
  - Age-0 at 15 °C: opercular rate rose at 5 mg/L, feeding stopped at 2, balance was lost at 1 mg/L.
  - Juvenile growth is unaffected at 3.5 mg/L or more and significantly reduced below 2.0.

### Disagreements
- **Twilight peaks.** Reported by agencies, by Hasler & Bardach (sunset) and by Keast & Welsh (two a day). Lake Madison telemetry found none (day highest), and the under-ice Mendota peaks were mid-morning and early afternoon. MN DNR says dawn and dusk fish best; Midwest Outdoors says midday under ice.
- **Fall depth.** Deeper in deep and complex basins, but shallowest in fall in shallow Lake Madison.
- **Which sizes go offshore.** Bigger fish were pelagic in Crystal Lake and deeper in Constance, but nearer shore and shallower in Lake Sinai.
- **Winter depth.** Deep basin for the whole ice season (Mendota sonar, midwinter anglers), against shallow green weeds at first and last ice (MN DNR, Sendek). These fit together as a seasonal sequence within winter.
- **Night behaviour.** Resting on the bottom inshore (Constance summer, agencies), against an onshore move at dusk (Bauer complex lake), against no diel difference (Lake Sinai), against rising into the water column at night in winter (Constance EP).

---

## 2. Chain pickerel (*Esox niger*)

### Takeaway
- **A shallow-water fish all year.**
  - The only fine-scale telemetry with depth tags in the region (Milipsigate Lake, Nova Scotia) put half of all detections at **0.76–1.82 m**.
  - Predicted depth was 0–2.5 m from October to April.
  - Agencies agree: weedy water of 0.6–3 m "most of the year".
- **Active under ice, by day.** Pickerel keep moving and feeding at 1–4 °C. Maine anglers catch them at about **2.4× the summer rate** through the ice. Smallmouth bass in the same Nova Scotia lake sat still at their wintering sites.
- **Large adults may drop to deeper weed edges (3–5 m) in midsummer.** The evidence is weaker: anglers, a 1959 thesis quoted second-hand, and a model extrapolation.
- **Spawning comes first of all the species,** right after ice-out at about 6–11 °C, in flooded vegetation 1 m deep or less. There is no nest and no parental care.
- **Young-of-year live in weed patches,** where they are eaten by bass.
- **No pickerel-specific diel telemetry exists.** The diel pattern (day-active, dawn and dusk peaks in summer, inactive at night) rests on agency statements and northern pike as a surrogate.

### Open-water summer
- **Milipsigate Lake, NS** [primary, full text read]
  - **Lake:** 335.8 ha; 17 m maximum; island-studded; rocky shallows with patches of emergent plants; silt in the deep basin.
  - **Study:** 18 adults (32–69 cm TL) were tagged in Sep–Oct 2018 and tracked by acoustic positioning. The summer water column averaged 18 ± 3.9 °C (Jun–Aug).
  - **Depth:**
    - "50% of detections occurred between 0.76 to 1.82 m depth."
    - Maximum depths over 10 m were recorded only in October, November and July.
    - Depth use "did not change significantly over time"; fish were predicted to occupy "a narrow range (~2 m) of shallow depths year-round".
    - The depth model nonetheless rises from 2.5 m in April to about 8 m in August. The data end in July 2019, so August is extrapolated.
  - **Where:** in summer, fish gathered around the north-eastern islands (relative probability of use > 0.9).
  - **Against bass:** smallmouth bass in the same lake used water "on average ~3 times deeper", and the two species' space and depth use barely overlapped.
  - Sergio 2026, Dalhousie thesis, ch. 3 — [thesis record](https://dal.scholaris.ca//items/57c35737-f666-4cc9-8fb3-45eb5c0a0e46); [PDF](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **Armbruster 1959:** pickerel "occupy cooler and deeper waters in the summer" and return to shallower, weedier water as it cools in fall. [via Sergio 2026] — [PDF](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **George Lake, Kejimkujik, NS** [primary abstract]
  - 61 fish were tagged (31–62 cm), and 30 were tracked for 12 months.
  - They showed "extended summer migrations beyond George Lake", periods of winter inactivity, and individual differences in habitat. No numbers are given.
  - [Sauriol et al.](https://merseytobeatic.ca/sites/merseytobeatic.ca/files/agendafiles/Sauriol_Felixe.pdf)
- **Maine (MDIFW assessment, 2001, updated 2008)** [agency]
  - Pickerel occur in oligotrophic lakes but thrive in "shallow, warm" water with weed beds, lily pads and bulrushes. They are least abundant in oligotrophic lakes with little shallow weedy habitat.
  - They hunt by lying motionless and lunging.
  - In a late-1960s Maine study they were the main predator of newly stocked salmon in "shallow shoreline locations". Releasing the salmon over deep water cut the losses.
  - [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **New York DEC** [agency]
  - "weedy, shallow (2-10 foot) water most of the year" (0.6–3 m).
  - Best fishing early May to July.
  - [NY DEC](https://dec.ny.gov/things-to-do/freshwater-fishing/learn-to-fish/tips-skills/chain-pickerel)
- **Ontario** [via Ontario Fishes database]: ponds and shallow (< 3 m) lakes with abundant vegetation. [Ontario Fishes](https://ontariofishes.ca/fish_detail.php?FID=89)
- **Upper St. Lawrence** [primary]: one adult was gill-netted at 4.8 m, 20.4 °C, Secchi 5.0 m (16 Sep 2009). [Hoyle & Lake 2011](https://canadianfieldnaturalist.ca/index.php/cfn/article/download/1116/1120/4464)
- **Big fish in midsummer** [angler]
  - Small pickerel stay shallow in lily pads and grass.
  - Fish over about 1.8 kg hold on "outside deep weedlines", trolled at 3.7–4.6 m; some suspend near smelt or alewife schools. [In-Fisherman](https://www.in-fisherman.com/editorial/tactics-for-chain-pickerel/156304)
  - Big fish come onto the flats at dawn and dusk and spend midday in nearby channels and drop-offs; small fish stay on the flats all day. [Field & Stream](https://www.fieldandstream.com/fishing/pickerel-fishing-complete-guide)
- **Northern pike as a surrogate** [pike surrogate; snippet]
  - Large pike (> 71 cm) followed the thermocline down in July–August and preferred 16–21 °C even with 28 °C available.
  - O₂ below 3 mg/L limited their depth in summer and winter.
  - Small pike stayed in warm, shallow lily cover.
  - Pickerel are a warmer-water fish, so this is weak evidence.
  - [Pierce et al. 2013, TAFS](https://deepblue.lib.umich.edu/items/0454ea57-765e-48ad-ad19-7a7ee0b29001)

### Autumn
- **Milipsigate** [primary]: fall detections spanned the whole array, including the lake centre (48% of all positions). This is partly an artefact of tagging in Sep–Oct; the author suggests pre-winter foraging. [PDF](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **Anglers** [angler]: large pickerel return to shallow weedy flats next to deep water, where sunfish, perch and minnows gather. Shallow feeding is brief, late in the day when the water is warmest. [In-Fisherman](https://www.in-fisherman.com/editorial/tactics-for-chain-pickerel/156304); [Field & Stream](https://www.fieldandstream.com/fishing/pickerel-fishing-complete-guide)
- **Diet by size, Nova Scotia** [primary]
  - In 15 small lakes (mean 15.8 ha, mean depth 2.7 m), pickerel of 14.5–38.5 cm mostly ate insects (mayfly and dragonfly nymphs). 17.6% of stomachs were empty. [Mitchell et al.](https://www.ap.smu.ca/~lcampbel/impact-chain-pickerel.pdf)
  - Isotopes in Kejimkujik: fish of 4.2–10.9 cm got about 74% of their diet from odonate larvae; fish of 20.2–58.6 cm got about 72% from fish. [Swinemar 2024](https://library2.smu.ca/handle/01/32068)

### Winter under ice
- **Milipsigate** [primary] (water column 2.6 ± 0.6 °C, Dec–Feb)
  - Predicted depth stayed at 0–2.5 m from October to April.
  - **December:** 80% of positions were within 30 m of shore, over coarse rocky shallows.
  - **January:** 91% of positions were in one south-western section around an island, an area with deeper bedrock pockets.
  - **February:** 97% were around another island.
  - **March:** fish spread across the whole array again.
  - The author reads the monthly shifts as "low-level movement during the winter, similar to other Esocidae", unlike the "nearly sessile" bass.
  - [PDF](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **George Lake, NS** [primary abstract]: "periods of inactivity in the winter". [Sauriol](https://merseytobeatic.ca/sites/merseytobeatic.ca/files/agendafiles/Sauriol_Felixe.pdf)
- **Maine ice fishery (MDIFW)** [agency]
  - Pickerel "bite readily in the winter".
  - **Effort (1999):** 345,000 winter angler-days, 18% of the year's pickerel effort.
  - **Catch rates:** winter 1.18 pickerel per angler-day against 0.49 in summer. Ice catch rates ran 2–2.5× open water in most regions.
  - **Late-1950s warden census:** 0.42 pickerel per hour, against 0.08 for salmon, togue and trout combined.
  - **By lake type:** shallow eutrophic or mesotrophic warmwater lakes gave 1.0–2.0 pickerel per angler in winter; salmonid lakes gave 0.02–0.10.
  - **Size:** pickerel kept through the ice averaged 17.0 in (43 cm) and 1.2 lb.
  - [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Other agencies** [agency]
  - **New York:** "remain active in the winter"; fish 1.5–4.6 m around remaining weed beds, with minnows on tip-ups 0.3–1 m off the bottom. [NY DEC](https://dec.ny.gov/things-to-do/freshwater-fishing/learn-to-fish/tips-skills/chain-pickerel)
  - **Connecticut:** active through winter, including through the ice. [CT DEEP](https://portal.ct.gov/deep/fishing/fisheries-management/chain-pickerel-management)
  - **Virginia (outside the region):**
    - In cold weather pickerel are at their shallowest, 0.6–0.9 m, in coves with dying vegetation from December to February.
    - Living weeds are hotspots, as is hard bottom at 1.5–3 m just outside them.
    - They strike in water of about 1–3 °C.
    - [VA DWR](https://dwr.virginia.gov/blog/when-its-cold-check-out-chain-pickerel/)
- **Ice anglers** [angler]
  - Trophy females move into 0.6–0.9 m of weedy water in February, before spawning (Massachusetts). [In-Fisherman](https://www.in-fisherman.com/editorial/tactics-for-chain-pickerel/156304)
  - Fish sit at 0.9–1.2 m close to deeper water, over dark bottom or wood. The best bite comes later in the day as the water warms slightly. On camera, a pickerel hovered about 5 min before a slow strike. [Outdoor Life](https://www.outdoorlife.com/fishing/how-to-catch-pickerel-winter)
  - Maine forum anglers fish weed beds in less than 3 m, with tip-ups within about 20 yd of the beds in 1.5–1.8 m. [snippet] [iceshanty](https://iceshanty.com/threads/finding-chain-pickeral-first-ice.170187/latest)
  - Contrary view: most pickerel stay deeper in winter on dying milfoil and come shallow on mild days. [Field & Stream](https://www.fieldandstream.com/fishing/pickerel-fishing-complete-guide)
- **Late-winter hypoxia**
  - **Passaconway Pond, Maine** (26 ac, 1.2 m maximum) [agency survey]: it holds only pickerel and bullhead. O₂ was 0.8 ppm in February 1961 and winterkill occurs in severe winters, yet the pickerel persist. [MDIFW](https://www.maine.gov/IFW/docs/lake-survey-maps/york/passaconway_pond.pdf)
  - **Michigan, 1945** [primary; congener]: the grass ("mud") pickerel, *E. americanus*, not chain pickerel, moved with perch and pumpkinseed into an oxygenated inlet and crowded at air holes (§0).
- **Northern pike under ice** [pike surrogate]
  - **Potato Lake, Wisconsin** (Margenau 1986, n = 4) [Margenau 1986](https://asset.library.wisc.edu/1711.dl/EDKL5WLMNQCVV82/E/file-9a61f.pdf):
    - Weedy water at 1.5–3 m; activity areas mostly under 4.5 ha.
    - Under ice, fish moved 0.7 m/min by day and 0.06 m/min at night, swimming about 2.2 min per hour by day and under 1 min per hour at night.
    - During freeze-up they left the weeds for deeper bare bottom, then returned.
  - **Diana 1980** (via Margenau): pike under ice were almost completely inactive at night.
  - **Baktoft et al. 2012:** pike were as active in winter as in other seasons, and more active by day than by night in every season. [Baktoft et al. 2012](https://orbit.dtu.dk/en/publications/seasonal-and-diel-effects-on-the-activity-of-northern-pike-studie/)

### Spring and spawning
- **Maine** [agency]
  - Spawning "shortly after ice-out", when adults move into "swampy areas containing flooded vegetation".
  - Eggs are broadcast with no nest and no care; several males attend each female. Eggs hatch in 1–2 weeks.
  - Young-of-year are "largely confined to these patches of aquatic vegetation" and are eaten by largemouth bass.
  - [MDIFW pickerel assessment](https://www.maine.gov/ifw/docs/strategic-management-plans/pickerel.pdf)
- **Temperature and depth**
  - **New Jersey** [agency]: February–May at 8–11 °C, from the shallows to 3 m, on vegetation, in daytime; eggs hatch in 11–12 days. [NJ F&W](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Chain-Pickerel.pdf)
  - **Ontario** [via Ontario Fishes]: 6–11 °C, April–May. [link](https://ontariofishes.ca/fish_detail.php?FID=89)
  - **Peak 8.3–11.1 °C** [unsourced summary]: fish leave deeper wintering sites for vegetated water up to 3 m, and a population spawns over 7–10 days. [ADW](https://animaldiversity.org/accounts/Esox_niger/)
- **Milipsigate in spring** [primary]: positions concentrated in the island-studded north, the likeliest plant-growth zone. The author reads this as selection of spawning habitat. [PDF](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **Movement inshore** [popular science]: adults move "from the offshore zone where the bottom drops away" into weedy shallows right after ice-out. Pairs spawn over a day or two and scatter eggs over submerged plants. [Northern Woodlands 2022](https://northernwoodlands.org/outside_story/article/eggs-underwater)
- **Anglers on the post-spawn** [angler]
  - Pre-spawn feeding starts at 7–9 °C along channel edges and coves. [Field & Stream](https://www.fieldandstream.com/fishing/pickerel-fishing-complete-guide)
  - Fish are "hardest to find" from late March to mid-April and return to shallow weeds at 14–16 °C. [In-Fisherman](https://www.in-fisherman.com/editorial/tactics-for-chain-pickerel/156304)

### Diel
- **No pickerel-specific diel telemetry was found.** The full texts of Helfman 1981 and Emery 1973 could not be read, so it is unknown whether they include pickerel.
- **Agencies** [agency]
  - **New York:** catchable all day but "often more active early and late in the day". [NY DEC](https://dec.ny.gov/things-to-do/freshwater-fishing/learn-to-fish/tips-skills/chain-pickerel)
  - **New Jersey:** feeding peaks at dawn and dusk; a solitary stalker. [NJ F&W](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Chain-Pickerel.pdf)
  - **Missouri** (outside the region): "scarce on sunny days"; forages in open water near dusk and dawn and on overcast days. The same article wrongly says pickerel guard eggs, so reliability is low. [MDC](https://mdc.mo.gov/magazines/conservationist/2001-12/triggering-chain-reactions)
- **Conflicting unsourced claim:** "not considered nocturnal or diurnal". The same summary says adults sit in water up to 3 m by day and move shallow at nightfall. [ADW](https://animaldiversity.org/accounts/Esox_niger/)
- **Pike surrogate:** active by day and inactive at night under ice; twilight peaks in summer only (Baktoft 2012; Diana 1980 via Margenau; Kobler et al. 2008 [snippet]). [Kobler et al.](https://www.agrar.hu-berlin.de/de/institut/departments/dntw/jp_bfm/publ_html/kob_html)

### Temperature
- Ice-fishing catches show pickerel feeding at about 1–4 °C (Maine, New York, Virginia, above).
- **Preferred temperatures:**
  - 21–30 °C [via Ontario Fishes, uncited].
  - Optimum 21–25 °C and O₂ above 4 mg/L [agency NJ, citing Reynolds & Casterlin 1977, which was not obtained].
  - Final preferendum 24 °C; avoidance 20–27 °C (Coutant 1977), [via parameter notes Q6](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md).
- **Lethal:** one value, 28.4 °C at 17.7 °C acclimation. Every pickerel thermal value is weakly sourced (parameter notes Q6).

### Disagreements
- **Winter depth.**
  - Most sources say shallow, 0.5–3 m: the Milipsigate telemetry, Virginia, the Massachusetts February trophies and Maine anglers.
  - New Jersey and Field & Stream say deeper; New York says 1.5–4.6 m near weeds.
  - The likely reconciliation is weed edges and rocky shallows next to deeper water.
- **Midsummer depth of large fish.**
  - Armbruster, anglers and the Milipsigate model's August extrapolation say deeper. The Milipsigate statistics found no significant seasonal change.
  - Milipsigate is deep, stratified and sparsely vegetated, and ponds offer no deep option at all.
- **Spring.** Fish spawn at 6–11 °C right after ice-out, yet anglers report them returning to the shallows only at 14–16 °C. Post-spawn fish probably disperse to weed edges, then move back inshore as the weeds grow.

---

## 3. Smallmouth bass (*Micropterus dolomieu*)

### Takeaway
- **Summer: in the epilimnion over rock and hard bottom, never below the thermocline.** Opeongo telemetry, weekly means:
  - 2–4 m overall; by day 2–5 m, at night 1–3 m.
  - The fish "rarely crossed significant temperature gradients".
- **Large adults sit deeper than small ones in late summer.** In Maine's Green Lake, fish over 406 mm used water deeper than 8 m more often.
- **Home ranges in large lakes are big.** They span 100–400 ha, fish travel 1–9 km a day, and the ranges are re-used from year to year.
- **Autumn: a descent and a gathering.** As the thermocline erodes, bass descend from about 4 m in late September to 12–14 m by mid-November, working at 10–15 °C. They gather on a few traditional points, reefs and shoals, which are reused every year and can hold thousands of fish. They feed heavily before winter.
- **Winter: quiescent at the wintering site.**
  - **Deep, oligotrophic Opeongo:** about 14 m (12–15 m) for the whole 90-day ice period. The daily vertical range fell below 0.5 m by February, at under 2 °C.
  - **Milipsigate (17 m maximum):** four sites, all shallower than 8 m, used at 2–6 m, "remaining stationary throughout the winter until late March".
  - Feeding is minimal. In Maine, ice anglers catch about a quarter of the open-water rate, and in some regions "bass are almost never caught by winter anglers".
- **Spring: activity returns before ice-out.** Around the spring equinox, still under ice, bass rose from 10–12 m to 2 m over about 3 weeks.
  - **Nests:** typically at 0.5–1.5 m (Maine 0.8 m; clear lakes 1.8–6 m), on gravel or rubble next to a boulder or log, in sheltered bays.
  - **Timing:** spawning starts at about 15–16 °C.
  - **Care:** the male guards for 2–3 weeks, then the adults move to summer ranges *away from* the nests.
- **Diel: active by day, with dawn and dusk peaks reported.**
  - At Opeongo the fish rose soon after sunset (shallowest about 1.5–2.5 m, 23:00–03:00), but moved little horizontally at night.
  - They were deepest from 06:00 to 13:00 (4–5 m).

### Open-water summer
- **Lake Opeongo, ON** [primary, full text]
  - **Lake:** 5,860 ha, mean depth 14.8 m, Secchi about 6 m; oligotrophic and stratified.
  - **Study:** acoustic depth tags (±0.3 m) on 28 adults (317–451 mm FL), August 2004 to May 2006.
  - **Depth:**
    - The weekly mean was 2–4 m from June to August.
    - The weekly range of depths used was 6–8 m in 2004 and 4–6 m in 2005–06.
    - Mean depth never fell below the thermocline, though some hours went below 5 m.
    - The fish "largely function within the epilimnion and metalimnion especially at dawn" and "rarely crossed significant temperature gradients". Water at 1.5–4.5 m was about 22–25 °C in August.
    - Dips into the metalimnion may be pursuit of young cisco (the authors' speculation).
  - **Size:** larger fish were deeper than smaller ones in summer.
  - Suski & Ridgway 2009, *J. Zool.* 279:119 — [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- **Green Lake, Maine** [primary abstract] (44 radio-tagged fish, 10 June–1 Sept 1993)
  - **Late summer (15 July–1 Sept):**
    - Large fish (> 406 mm) used deep water (> 8 m) more than small (248–279 mm) or medium (305–356 mm) fish.
    - Large fish were also at mid-depths (4–8 m) more often.
  - **Cover:** small and medium fish used cover more often, especially in early summer.
  - **Ranges:** small fish had smaller total ranges.
  - Cole & Moring 1997, *TAFS* 126:815 — [USGS](https://pubs.usgs.gov/publication/70019479)
  - **Diver counts:** divers miss a significant share of large bass from mid-July to early September; surveys should be run from mid-June to mid-July. [primary abstract] [USGS](https://pubs.usgs.gov/publication/70019582)
- **Home range, Opeongo** [primary]
  - Adult home ranges are **200–400 ha** (95% kernel). Fish travel 1–9 km a day: a mean track of 4.8 km over 6–16 h at a mean 483 m/h (maximum 1,120 m/h), with small net displacement.
  - Ranges are set up soon after nesting and "rarely incorporate the nest site".
  - Year-to-year overlap was 74% (males 81%, females 46%). Females have larger ranges.
  - Fish begin leaving summer ranges after mid-August (day 218).
  - Ridgway & Shuter 1996 is cited for seasonal ranges of 100–300 ha and a mean range length of 4.24 km.
  - Ridgway 2002, AFS Symp. 31 — [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
- **Homing** [primary abstract]
  - 15 of 18 fish displaced (mean 6.7 km, via Rupnik 2018) returned home.
  - They stayed about a week at the release site (0.5–30 d), then took about 4 d to return (1–9 d).
  - Displacement did not change the date they left for wintering sites.
  - Ridgway & Shuter 1996, *NAJFM* 16:371 — [OUP](https://academic.oup.com/najfm/article/16/2/371/7920563)
- **Eastern Lake Ontario** [primary thesis]: summer ranges lay along a 4–5 km island shore (about 200–400 ha); fish wintered in deeper water east of the island and came back afterwards. [Rupnik 2018](https://queensu.scholaris.ca/server/api/core/bitstreams/91766d5f-8b10-4d78-8a8f-790cdb962fbe/content)
- **Milipsigate, NS** [primary]: depth use was broad from spring to fall (0–15 m). In June, 79% of positions were within 50 m of the east or west shore. [Sergio 2026](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **Habitat**
  - **Maine** [agency]: spring and summer on shallow rocky areas or rocky drop-offs at 1.5–4.6 m, using woody debris, weed beds and rocks as cover. [MDIFW](https://www.maine.gov/ifw/fish-wildlife/fisheries/species-information/smallmouth-bass.html)
  - **Maine plan** [agency]: large, deep, cold lakes contain many acres "of negligible value to bass, because it is too deep and too cold". [MDIFW black bass plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
  - **Ontario** [agency]: shoreline rocks and points, offshore shoals, deep points, submerged islands and weed edges. [ontario.ca](https://www.ontario.ca/page/smallmouth-bass)
  - **Ideal lake habitat** [via Bevelhimer 1995]: rock or gravel, 21–26 °C, cover (stumps, fallen trees, ledges, boulders), and small fish and crayfish to eat. [PDF](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf)

### Autumn
- **Opeongo descent** [primary]
  - Mean depth went from about 4 m in late September to 14 m by mid-November.
  - The widest weekly range (8–12 m) came as the lake turned isothermal.
  - The descent is "closely linked" to thermocline erosion. Fish exploit depths at 10–15 °C, and fall is the season of highest energy gain (lipid storage).
  - In fall the fish were deeper by day than at night, and smaller fish were deeper than larger ones.
  - [Suski & Ridgway 2009](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- **The classic model** [via Ridgway 2002]: three separate areas, namely nest sites, summer ranges and "one common location for the winter" (Webster 1954, Cayuga Lake). [PDF](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
- **Ridgway, as quoted by journalist G. Pyzer** [via]
  - The fall move begins about "a week after the fall equinox". It has happened at 15 °C in one year and 10 °C in another; Ridgway proposes day length as the cue.
  - Fall sites are "significantly fewer in number and much smaller in size than summer home ranges": main-lake points, reefs, bars, saddles and shoals that can hold thousands and are reused yearly.
  - Feeding hard before winter is "desperately important".
  - [Outdoor Canada](https://www.outdoorcanada.ca/?p=4491); [Outdoor Canada](https://www.outdoorcanada.ca/keeping-fall-smallmouth-in-your-livewell-all-day-you-may-be-killing-them/)
- **Anglers** [angler]: at about 9 °C most of the population is "near or associated with wintering habitat". Fish condense further in the mid-40s °F (about 7 °C) and "hug bottom" at hard-to-soft transitions in the low 40s °F (about 5 °C). [In-Fisherman](https://www.in-fisherman.com/editorial/winter-smallmouth-bass-parade/153378)
- **Rivers (contrast)** [snippet]: fish start moving below about 15.6 °C and travel up to 19 km a day, 35–109 km in total. Fish of age 0 and 1 do not migrate (Langhurst & Schoenike 1990, Wisconsin). [blog](https://www.glangler.com/blogs/articles/the-rivers-of-autumn-smallmouth-nirvana-by-matt-straw)
- **Milipsigate** [primary]: from November the fish narrowed onto specific aggregations, and by December–January every tagged bass was at one of four wintering sites. [Sergio 2026](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)

### Winter under ice
- **Opeongo** [primary, full text]
  - Bass held at **about 14 m** (12–15 m) through the whole 90-day ice period. They reached their deepest once the water was below 10 °C at every depth, and stayed about 24 weeks in isothermal water.
  - The daily depth range shrank from more than 1.5 m in early December to under 0.5 m by February, below 2 °C.
  - Night depth was slightly deeper (changes under 2 m), and small fish were about 0.5 m deeper than large ones.
  - The authors: "not truly dormant under ice but are quiescent with small movements occurring"; they may need to feed if their energy demand is high.
  - [Suski & Ridgway 2009](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- **Milipsigate (17 m maximum)** [primary, full text]
  - "Four unique over-wintering sites … smallmouth bass exhibited extremely little horizontal movement, remaining stationary throughout the winter until late March."
  - The depth range was 2–6 m from December to March (the model predicted about 10 m in January). The sites were "not distinctly deep, all being shallower than 8 m".
  - [Sergio 2026](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
  - This is the best evidence that bass in a modest lake winter at moderate depth, not necessarily in the deepest hole.
- **Eastern Lake Ontario** [primary abstract]: in winter bass were deeper and less active, vertically and horizontally; home ranges shrank and shifted toward deeper features. [Wolf 2022](https://queensu.scholaris.ca//items/047de2bd-b16c-4e4b-80db-d255eb744de9)
- **Energy** [primary review section]: adults are "inactive for much of the winter period" and live on stored reserves; condition declines over winter. [Ridgway 2002](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
- **Thresholds** [via gcdamp, citing the USFWS HSI; probably stream-derived (Munther 1970)]: at about 10 °C bass "become inactive and seek shelter"; at 6–7 °C most are beneath rocks. [gcdamp](https://gcdamp.com/index.php/Smallmouth_Bass_Page); see also the [parameter notes Q6](../Maine%20lakes%20ponds%20and%20streams/centrarchid_percid_esocid_parameters.md)
- **Maine** [agency]
  - Young-of-year face an "approximately 200+ day starvation period … when water temperatures cooler than 50 °F [10 °C] result in cessation of feeding and growth".
  - **Ice catch:** 0.46 bass per angler-day (0.03–0.58 by region) against 1.7 in open water. Winter takes 17% of annual bass effort, and winter fish are larger. "In many of Maine's bass waters, especially in Washington and Hancock counties, bass are almost never caught by winter anglers."
  - **Rules:** South Zone lakes and ponds over 10 acres are open year-round under general law. North Zone lakes are closed from 1 October to 31 March except where special rules apply [snippet of the 2026 lawbook].
  - [MDIFW black bass plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf); [MDIFW blog](https://www.maine.gov/ifw/blogs/mdifw-blog/there-are-more-early-season-fishing-opportunities-you-think)
- **Ice anglers** [angler] [In-Fisherman](https://in-fisherman.com/editorial/tactics-for-winter-smallmouths/372808)
  - Northern wintering sites are 4.6–15 m. A Minnesota guide finds most bass at 7.6–9.8 m, some on rock piles or humps at 12–15 m. On Lake of the Woods: 7.6–10.7 m on offshore humps and hard flats.
  - Radio-tagged fish "barely moved all winter".
  - A camera showed 65 bass on one spot.
  - Cold fronts kill the bite, which revives in late winter (March, snowmelt, more light).
  - Ridgway is quoted as saying northern lake bass do not eat in winter and can suffer up to 35% overwinter mortality [via Pyzer].

### Spring
- **Opeongo ascent** [primary]
  - Over about 3 weeks the mean depth rose from 10–12 m to 2 m, around the spring equinox and still under ice.
  - A shallow phase with a narrow range followed for 2–3 weeks (under 2 m in 2005, 2–3 m in 2006): pre-spawn and spawning.
  - [Suski & Ridgway 2009](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- **Milipsigate** [primary]: activity rose sharply in April–May, with fish spreading across the lake. [Sergio 2026](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
- **Nest depth**
  - **Opeongo** [primary]: 0.4–2.5 m, mostly 0.5–1.5 m. [Rejwan et al. 1999, Ecology 80:341](https://www.harkness.ca/PDFs/Contributions%201990s/Rejwan%20et%20al%201999.pdf)
  - **Forbes 1981 review** [primary review]: [Forbes 1981](https://sitesreservoirproject.riptideweb.com/references/REF17/Appx_12B_FisheriesImpactAssessment/Forbes_1981.pdf)
    - Nests are usually under 2 m deep.
    - Tadenac Lake, ON: 0.6–1.2 m deep and 0.3–2.4 m from shore.
    - Thousand Islands: 0.5–0.9 m deep and 3–9 m from shore.
    - **South Branch Lake, Maine: 0.8 m.**
    - Clear Lake Geneva, WI: 1.8–3.0 m, up to 6.1 m.
    - Depth tracks water clarity. Nests sit in sheltered bays, leeward shores and behind islands.
  - **Lake Geneva directly** [primary]: most nests are at 2.4–3.7 m. Males prefer an object (block, log, crib) sheltering one side of the nest. Unguarded nests fail. [Mraz 1960](https://asset.library.wisc.edu/1711.dl/TAMWK2GNUYZYV8M/E/file-104a5.pdf)
- **Where nests cluster** [primary]
  - Nest aggregations in Opeongo stay in the same places from year to year. [Rejwan et al. 1997](https://www.harkness.ca/PDFs/Contributions%201990s/Rejwan%20et%20al%201997.pdf)
  - Nest density rises with littoral temperature (the warmest 23% of sites were above 17.05 °C) and with shoreline complexity.
  - A guarding male defends a territory about 18 m across (Scott 1993, via Rejwan 1999).
- **Temperature**
  - Nest building and spawning start at about 15.0–15.7 °C (15.1 °C with slow warming, 18.5 °C with fast). Egg and fry survival drop below 14–15 °C. [primary review] [Forbes 1981](https://sitesreservoirproject.riptideweb.com/references/REF17/Appx_12B_FisheriesImpactAssessment/Forbes_1981.pdf)
  - **Maine** [agency]: nest building above 12.8 °C; eggs at 15.6–18.9 °C, mid-May to mid-June. Nests are "in shallow water near cover from rocks, logs, stumps, or sharp drop-offs". [MDIFW black bass plan](https://www.maine.gov/ifw/docs/strategic-management-plans/blackbass.pdf)
- **After spawning** [primary]
  - Parental care lasts 2–3 weeks; adults then move to summer home ranges away from the nests.
  - Age-0 fish moved a mean of 88 m (SD 61) from their nest by September, almost all within 200 m. They stayed within 5 m of shore and under 1 m deep.
  - [Ridgway 2002](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
  - Young are solitary after dispersal and shelter among stones or sticks, avoiding dense weeds. [primary review] [Forbes 1981](https://sitesreservoirproject.riptideweb.com/references/REF17/Appx_12B_FisheriesImpactAssessment/Forbes_1981.pdf)

### Diel
- **Opeongo, summer** [primary]
  - Bass rose "soon after sunset" and were shallowest (about 1.5–2.5 m) from about 23:00 to 03:00.
  - They went down "soon after sunrise" and were deepest (4–5 m) from 06:00 to 13:00. Hourly depth ranges were largest from 06:00 to 13:00 (1–3 m).
  - The authors read the night rise as foraging, possibly on nocturnal crayfish.
  - [Suski & Ridgway 2009](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)
- **Opeongo, 24-hour tracking** [primary]: two fish showed "little or no movement in the evening". Bass are shallow but horizontally still at night. [Ridgway 2002](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
- **Literature summary** [via Bevelhimer 1995]
  - Smallmouth "are less active at night" (Munther 1970; Emery 1973; Helfman 1981; Gerber & Haynes 1988), except nest-guarding males (Hinch & Collins 1991).
  - Emery called them crepuscular; Gerber & Haynes found afternoon highs in Lake Ontario.
  - In a Tennessee reservoir, activity peaked in the afternoon and was minimal at night.
  - [Bevelhimer 1995](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf)
- **Lab** [snippet of abstract]: crepuscular; avoided bright light; peaks at the start and end of darkness; the rhythm is endogenous (Reynolds & Casterlin 1976, *TAFS* 105:400).
- **Ontario** [agency]: best fishing early morning and late evening. [ontario.ca](https://www.ontario.ca/page/smallmouth-bass)
- **Diel by season (Opeongo)** [primary]: in autumn bass were deeper by day; under ice they were slightly deeper at night.

### Temperature
- **Field and lab preferences** [via gcdamp, citing the HSI]: [gcdamp](https://gcdamp.com/index.php/Smallmouth_Bass_Page)
  - Field: about 21–27 °C.
  - Lab final preferendum: 28–31 °C.
  - Fastest growth: 26–29 °C.
  - Growth starts at 10–14 °C.
- **Upper avoidance** [primary abstract]: in a heated Lake Erie canal, most bass left for cooler refuges at about 25–30 °C. [Schreer & Cooke 2002](https://people.potsdam.edu/schreejf/SchreerAndCooke2002SmallmouthBassAndTemp.pdf)
- **Thresholds summary:**
  - About **10 °C:** go to the wintering site and become quiescent.
  - **10–15 °C:** the working range in fall and spring.
  - Below 10 °C: young-of-year stop feeding.
  - **6–7 °C:** under rocks.
  - About **15–16 °C:** nest.

### Disagreements
- **Night depth.** Telemetry says shallower at night (Opeongo). One search summary claimed "deeper at night" citing Emery and Helfman, but the cited paper does not say so.
- **Night activity.** Science finds low activity at night (with dawn/dusk or afternoon peaks); anglers report catching bass at night.
- **Fall trigger.** About 15.6 °C (rivers), about 9 °C (anglers), day length (Ridgway) or thermocline erosion (Suski & Ridgway). All four track the same calendar.
- **Winter depth.** 12–15 m in deep Opeongo, 2–6 m in Milipsigate, 4.6–15 m among anglers. Wintering sites seem to be chosen for structure and shelter as much as for depth.
- **Winter feeding.** "Do not eat" (Ridgway via Pyzer), against a real Maine ice catch and late-winter bites. "Quiescent, not dormant" sits between.
- **Size and depth.** Larger fish are deeper in summer (Opeongo, Green Lake). Smaller fish are deeper in fall and winter (Opeongo).

---

## 4. Pumpkinseed (*Lepomis gibbosus*)

### Takeaway
- **Summer: a fish of the vegetated littoral.**
  - In unstratified Lake Opinicon, 80–90% of fish biomass sits at ≤ 2.5 m. The weed edge there is at 2–3 m, 25–30 m from shore.
  - Pumpkinseed are "not often found in open water".
  - Small fish (≤ 75–80 mm) stay in the vegetation because bass prey on them; larger fish (> 75 mm) forage on snails in the weeds.
  - Strong site fidelity: 97–98% are recaptured at their home site.
  - Adults move in pairs or loose groups of 3–4; the young form shoreline schools.
- **Autumn: a gradual move offshore.** Biomass leaves the littoral progressively from late summer. Foraging peaks in May and September.
- **Winter: lethargic, gathered in deep-littoral weeds** (bluegill surrogate).
  - Bluegill overwinter in localized stands of tall perennial vegetation in the deep littoral, or in shallow weedy bays.
  - In the lab, pumpkinseed activity is near zero at ≤ 7.9 °C, and by 2.2 °C all but one fish had stopped feeding ("winter-lethargic, not dormant").
  - Some fish caught under ice still have food in their stomachs (10–50% across six species at 4 °C).
- **Late-winter hypoxia: tolerant and mobile.** Pumpkinseed survive to about 0.3–0.4 mg/L, at least twice as long as bluegill at low O₂. In the Michigan winterkill they joined perch and pickerel in an oxygenated inlet, while bluegill and bass did not.
- **Spring: the last of the four to spawn, and the longest season.**
  - Active feeding resumes at about 8.5 °C.
  - Nests are single or in loose groups, at a mean 65 cm deep (15–168 cm), on any substrate.
  - The first spawn comes at 13–17 °C (before bluegill). Spawning runs about 54 days (into late July), with up to 16 bouts; larger males nest first.
  - Males guard day and night.
- **Diel: mainly diurnal, with a nocturnal component.**
  - At night they rest near the bottom in vegetation.
  - In a pond, night strikes were still over 75% of the daytime rate, because plankton feeding rose at night.

### Open-water summer
- **Lake Opinicon, ON** (787 ha; maximum under 11 m; more than half under 5 m; unstratified)
  - Strip counts put 80–90% of fish biomass along the margins at ≤ 2.5 m. [primary summary] [Keast & Harker 1977](https://research.qubs.ca/projects/fish-distribution-and-benthic-invertebrate-biomass-relative-to-depth-in-an-ontario-lake)
  - Milfoil grows at 2.5–3.5 m, with little vegetation beyond 3.5 m. Offshore gillnets at 1.5–7 m caught pumpkinseed only "occasionally"; bluegill dominated the offshore sunfish catch. [primary summary] [Keast & Fox 1992](https://research.qubs.ca/projects/space-use-and-feeding-patterns-of-an-offshore-fish-assemblage-in-a-shallow-mesotrophic-lake)
  - At the "weedy deep" sites the weed edge is at 2–3 m, 25–30 m from shore, with milfoil standing 1.5–2.5 m off the bottom. Young-of-year *Lepomis* were distributed vertically like older fish. [primary summary] [Brown & Colgan 1982](https://research.qubs.ca/projects/the-inshore-vertical-distribution-of-young-of-year-lepomis-in-lake-opinicon-ontario)
  - Habitat ranking: weedbeds held the most biomass and the most species and year classes, then rock, then sand. A species' abundance in a habitat often differed between day and night. [primary summary] [Keast, Harker & Turnbull 1978](https://research.qubs.ca/projects/nearshore-fish-habitat-utilization-and-species-associations-in-lake-opinicon-ontario-canada)
- **Wisconsin DNR** [agency] [WI DNR, Holtan 1998](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_pumpkinseed.pdf)
  - Pumpkinseed are tied to cover (vegetation, brush) and are "not often found in open water".
  - Adults move to "slightly deeper water" but stay near submerged vegetation. Adults travel in pairs or loose groups of 3–4; the young form large schools close to shore.
  - They feed at all levels from the surface to the bottom.
- **Canadian Shield lake** [snippet]: the littoral is a strip under 2 m deep and under 5 m wide, and adults rarely cross water deeper than 6 m to reach offshore shoals. [ResearchGate](https://www.researchgate.net/publication/403249350_Effects_of_spawning_habitat_on_the_performance_of_age-0_pumpkinseed_sunfish_Lepomis_gibbosus_ecotypes_in_a_Canadian_shield_lake)
- **Ecotypes:** some Ontario lakes hold a limnetic (open-water, zooplankton-eating) ecotype alongside the littoral form. [via DFO synopsis, Jordan et al. 2009] [DFO](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Size and predation** [primary]
  - **Michigan littoral communities:** species separate by depth (distance from shore), height in the water column and vegetation structure. Predation confines small size classes to dense cover. [Werner et al. 1977, JFRBC 34:360](https://doi.org/10.1139/f77-058)
  - **Pumpkinseed over 75 mm SL** specialise on snails living in vegetation; bluegill of that size eat open-water Daphnia. At ≤ 75 mm SL both species stay mostly in vegetation, with 76–91% of their diet from vegetation-dwelling prey. [Mittelbach 1984](https://doi.org/10.2307/1941412)
  - **[surrogate: bluegill]** Bluegill live in the vegetation for years and shift to open water at 50–83 mm SL; the shift size rises with bass density. Small fish face 40–80× the predation risk in open water. [Werner & Hall 1988](https://doi.org/10.2307/1941633)
  - **[surrogate: bluegill]** In a Michigan marl lake, bluegill under 80 mm stayed in vegetation all year. [Hall & Werner 1977](https://academic.oup.com/tafs/article/106/6/545/7895053)
  - Predation on pumpkinseed by largemouth bass "ceases at around 7.0 cm". [via DFO](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Thermocline:** no pumpkinseed number was found. In stratified lakes Daphnia retreat into a cold, dark refuge out of pumpkinseed reach. [via DFO, citing Hartleb & Haney 1998](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
- **Site fidelity and range**
  - **Ontario, 998 fish marked** [snippet]: 97% (limnetic) and 98% (littoral) of fish left in place were recaptured at their home site. Displaced fish returned with probability 0.74–0.93. [McCairns & Fox 2004](https://agris.fao.org/search/en/records/65de4a4db766d82b18fcf938)
  - **Home range** about 0.23–1.12 ha [unattributed; probably Fish & Savitz 1983]. [ADW](https://animaldiversity.org/accounts/Lepomis_gibbosus/)
  - **[surrogate: bluegill] Enemy Swim Lake, SD** (870 ha, mean depth 4.9 m) [primary abstract]: [Weimer 2004](https://openprairie.sdstate.edu/etd/599)
    - Minimum daily movement was 32 ± 13 m in winter and 196 ± 37 m during spawning.
    - The 50% core range was 0.8 ha in winter and 5.0 ha in fall.
    - Submerged vegetation was used in every season.

### Autumn
- **Opinicon** [primary summary]: littoral biomass falls in late summer as fish move progressively offshore. [Keast et al. 1978](https://research.qubs.ca/projects/nearshore-fish-habitat-utilization-and-species-associations-in-lake-opinicon-ontario-canada)
- **[surrogate: bluegill]** The autumn movement reverses the spring dispersal: fish regroup at overwintering areas in the deep littoral. [primary abstract] [Hall & Werner 1977](https://academic.oup.com/tafs/article/106/6/545/7895053)
- **Foraging** [primary abstract]: pumpkinseed foraging (passes and substrate strikes) peaks in May and September. [Collins & Hinch 1993](https://academic.oup.com/tafs/article/122/3/357/7893177)
- **October diet** [primary summary]: all year classes ate isopods at their peak biomass. [Keast 1978](https://research.qubs.ca/projects/feeding-interrelations-between-agegroups-of-pumpkinseed-lepomis-gibbosus-and-comparisons-with-bruegil-l-mauochirus)

### Winter under ice
- **[surrogate: bluegill] Location**
  - Bluegill overwintered in two localized areas of "tall perennial vegetation in the deep littoral". As the water warmed to 20 °C, these groups dispersed around the whole lake. [primary abstract] [Hall & Werner 1977](https://academic.oup.com/tafs/article/106/6/545/7895053)
  - In Enemy Swim Lake, bluegill used only dense vegetation in winter, and "many wintered in a shallow weedy bay"; no tagged fish were found in deep water in any season. Radio signals were hard to detect below about 4.9 m. [via In-Fisherman](https://www.in-fisherman.com/editorial/tracking-bluegill-research/156771)
- **Angler pattern, bluegill and panfish** [angler] [MeatEater](https://themeateater.com/fish/ice-fishing/how-to-catch-more-bluegill-ice-fishing); [Northland](https://www.northlandtackle.com/late-ice-panfish-tactics/)
  - **First ice:** weeds in flat bays at 1.2–3 m.
  - **Midwinter, after the weeds die:** soft-bottom basins at 4.6–9 m.
  - **Late ice:** inside weed edges at 0.9–3 m, averaging 1.2–1.8 m.
  - Sunfish stay near the bottom (crappies suspend). Weeds that stay green hold panfish all winter.
  - The "deep basin midwinter" pattern conflicts with the telemetry above and comes from larger, deeper lakes.
- **Activity and feeding**
  - **Lab** (adults from Lily Lake, New Brunswick) [primary]: [Reeve et al. 2022, J. Exp. Biol. 225:jeb243407](https://pmc.ncbi.nlm.nih.gov/articles/PMC9124485/)
    - "zero or near zero activity" at and below **7.9 °C**.
    - By 2.2 °C all but one fish had stopped feeding.
    - Cooling "greatly dampened the diel activity cycle" (pumpkinseed are diurnal), and sheltering increased.
    - Pumpkinseed are "winter-lethargic species, rather than winter dormant".
  - **Under ice, Fish Lake, ON** (January–March, 4 °C) [primary abstract]: fish fed irregularly, with 10–50% holding food across six species. Before the thaw, stomachs were shrunken and full of mucus. [Keast 1968b](https://doi.org/10.1139/f68-105)
  - **Wisconsin** [agency]: pumpkinseed take grubs early in winter but are less active from mid to late winter. [WI DNR](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_pumpkinseed.pdf)
  - **New Jersey (disagrees)** [snippet]: "do not feed during the winter months". [NJ DEP](https://dep.nj.gov/njfw/wp-content/uploads/njfw/Pumpkinseed.pdf)
  - **Juveniles in outdoor ponds** [snippet]: 88% caught in midwinter had prey in their stomachs. [Rooke & Fox 2020](https://link.springer.com/article/10.1007/s10641-020-00992-7)
  - **Age-0 fasting at 4 °C** [primary]: fish of 30–37 mm outlived fish of 20–24 mm, and high density shortened survival. [Bernard & Fox 1997](https://academic.oup.com/najfm/article/17/2/581/7882375)
- **Late-winter hypoxia**
  - Pumpkinseed were among the tolerant species that moved into the Green Lake inlet and appeared at air holes at 0.4 ppm (§0). [primary] [Cooper & Washburn 1946](https://www2.dnr.state.mi.us/publications/pdfs/DNRFishLibrary/ResearchReports/RR1001-RR1100/RR1078.pdf)
  - **Hypoxia tolerance** [primary]: at 15–25 °C pumpkinseed take at least twice as long as bluegill to lose equilibrium at 2 kPa O₂ (about 0.8–1.0 mg/L). The advantage disappears at 28 °C. [Borowiec et al. 2016](https://experts.mcmaster.ca/scholarly-works/761947)
  - **[surrogate: bluegill] Mississippi backwaters** [primary abstract]: above 2 mg/L O₂, bluegill chose water warmer than 1 °C with no current. Below 2 mg/L they moved to better-oxygenated water, even if it was ≤ 1 °C with about 1 cm/s current. [Knights et al. 1995](https://umesc.usgs.gov/documents/publications/1995/knights_a_1995.html)
  - **Winterkill ponds near Opinicon** [primary summary]: these hold small-bodied pumpkinseed that mature 1–2 years earlier and more than 20 mm smaller than lake fish. [Fox & Keast 1990](https://research.qubs.ca/projects/effects-of-winterkill-on-population-structure-body-size-and-prey-consumption-patterns-of-pumpkinseed-in-isolated-beaver-ponds)

### Spring and spawning
- **Feeding resumes** [primary abstract]: pumpkinseed began active feeding at 8.5 °C; brown bullhead and crappie started at 6.5 °C (Little Cataraqui Creek, ON, April). [Keast 1968b](https://doi.org/10.1139/f68-105)
- **[surrogate: bluegill]** Overwintering groups dispersed once the water reached 20 °C. Habitat segregation between species is weakest in spring. [primary abstract] [Hall & Werner 1977](https://academic.oup.com/tafs/article/106/6/545/7895053)
- **Deep Lake, Michigan, 1938–41** [primary] [Carbine 1948, MI IFR Report 1166](https://www2.dnr.state.mi.us/Publications/PDFS/DNRFishLibrary/ResearchReports/RR1101-RR1200/RR1166.pdf)
  - **Depth:**
    - Mean nest depth was **65.5 cm**: yearly means 41–91 cm, extremes 15–168 cm.
    - Very few nests were deeper than 1.5 m, where the bottom steepens. Larger fish tended to nest slightly deeper.
  - **Substrate:** every type was used (sand, gravel, peat, marl, clay, roots), with eggs on roots, *Eleocharis* and *Najas*.
  - **Grouping:** most nests were single or in groups of 2–3 (at most 6), apart from bluegill colonies. Mean nest diameter was 46 cm.
  - **Timing:**
    - First spawning on 1 June 1940 at 13.3–17.2 °C; bluegill first spawned on 5 June at 20–24 °C.
    - The last spawning was on 22 July, after 16 separate bouts. The season averaged 54 days (49–63).
  - **Guarding:** male pumpkinseed stayed on their nests day and night; male bluegill left by day.
- **Other figures**
  - **Wisconsin** [agency]: nest building starts at 12.8–17.2 °C. Nests are 15 cm to "several feet" deep on sand or gravel, in colonies of a few to 10–15. Females wait in deeper water. [WI DNR](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_pumpkinseed.pdf)
  - **DFO** [via]: spawning at 15–25 °C, continuing into August at up to 27.8 °C. Nests are under 1 m deep, often ringed by plants. The young leave the nest 10–11 days after hatching, into shallower water, and the males re-nest. [DFO](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf)
  - **Nesting order by size** [primary]: large males (≥ 80 mm, ages 4–6) nest earlier; small males (< 80 mm) make up more than 70% of late nesters. [Danylchuk & Fox 1996](https://doi.org/10.1139/z96-206)
  - **Stunted populations** [primary]: nest 1 week later and for 3–7 weeks longer. [Danylchuk & Fox 1994](https://doi.org/10.1139/f94-051)

### Diel
- **Lake Opinicon, early summer** [primary abstract]: pumpkinseed are "largely diurnal (with a nocturnal component)". Sunfish showed three feeding peaks per 24 h, with different prey by day and by night. [Keast & Welsh 1968](https://doi.org/10.1139/f68-099)
- **Shallow Ontario pond, infrared video** (72 h in each of 8 ice-free months) [primary abstract] [Collins & Hinch 1993](https://academic.oup.com/tafs/article/122/3/357/7893177)
  - Night passes were about half the daytime and twilight rate.
  - Substrate strikes were far fewer at night, but plankton feeding rose, so total night strikes were over 75% of the daytime value.
  - Month explained 40–50% of the variance.
- **Feeding peak (agencies disagree)**
  - DFO says feeding "peaks at dusk and dawn and is low during the day", citing Collins & Hinch; this looks like a misreading of the abstract above.
  - Wisconsin DNR says feeding is heaviest in the afternoon.
  - [DFO](https://waves-vagues.dfo-mpo.gc.ca/Library/337845.pdf); [WI DNR](https://dnr.wisconsin.gov/sites/default/files/topic/Fishing/Species_pumpkinseed.pdf)
- **Divers, Georgian Bay and Algonquin** (21 species) [primary abstract] [Emery 1973](https://doi.org/10.1139/f73-131)
  - 17 of 21 species schooled or aggregated by day; only smelt schooled at night.
  - More fish were in shallow water at night.
  - Fish resting on the bottom at night took on barred or mottled colour.
- **Cazenovia Lake, NY** [primary abstract] [Helfman 1981](https://doi.org/10.1139/f81-187)
  - Day-active fish wind down gradually at dusk and reverse at dawn, at lower light.
  - The changeover is prolonged and variable.
  - Normal diel patterns break down in the breeding season.
- **At night** pumpkinseed rest near the bottom, in dense vegetation, or by rocks or logs. [ADW](https://animaldiversity.org/accounts/Lepomis_gibbosus/)
- **[surrogate: bluegill] Pelican Lake, NE** (shallow) [primary abstract]: habitat use was the same day and night. [Paukert & Willis 2002](https://www.usgs.gov/publications/seasonal-and-diel-habitat-selection-bluegills-a-shallow-natural-lake)

### Temperature
Preferred temperatures (Wismer & Christie 1987 compilation) [via] — [Wismer & Christie](https://yosemite.epa.gov/oa/EAB_Web_Docket.nsf/Attachments%20By%20ParentFilingId/CA2563CFD9DABCD98525861C0041599C/$FILE/46_AR-196%20%28Wismer%20and%20Christie%29.pdf):
- **Field:** large fish in Lake Monona, WI, summer: 28.5–32 °C by day and 27–29 °C at night. Adults in summer: 27.7 °C.
- **Lab, by season (Evans 1977; the columns are poorly aligned in the PDF):**
  - Winter fish: 22.9 °C at 8 °C acclimation.
  - Spring fish: 23.2 °C at 8 °C.
  - Summer fish: 30.3 °C at 24 °C.
- **Optimum:** 24–32 °C. [via DFO; agency WI DNR]
- **Cold thresholds:**
  - Foraging falls below 15 °C (Collins & Hinch).
  - Feeding resumes at 8.5 °C in spring (Keast 1968b).
  - Near-inactive at ≤ 7.9 °C (Reeve 2022).

### Disagreements
- **Winter location.** Telemetry and diver evidence (bluegill) says deep-littoral or shallow weedbeds. Anglers say soft-bottom basins at 4.6–9 m in midwinter.
- **Winter feeding.** "Do not feed" (NJ), against irregular feeding (Keast 1968b; Wisconsin; outdoor ponds).
- **Peak feeding time.** Dawn and dusk (DFO), afternoon (Wisconsin), or three peaks a day (Keast & Welsh).

---

## 5. Cross-species contrasts usable as validation checks

These are the patterns where the evidence is consistent and the species differ. Each could be a check in `test/` or a balance audit. The numbers are for a shallow Maine-type lake unless stated otherwise.

| # | Check | Expected | Basis |
|---|---|---|---|
| V1 | **Summer daytime median depth order** | pickerel (about 0.8–1.8 m) ≤ pumpkinseed (≤ 2.5 m, in weeds) < perch (deepest available water; 3–6 m in a stratified lake, about 3.4 m in a shallow one) ≈ smallmouth (2–5 m by day) | Sergio 2026; Keast & Harker 1977; Radabaugh; Suski & Ridgway 2009 |
| V2 | **No summer fish below the thermocline** (stratified basin) | the median depth of perch and bass stays above the thermocline (EP school centres 2–6 m above it) | Imbrock 1996; Suski & Ridgway 2009 |
| V3 | **Perch school by day and disperse onto the bottom at night** | daytime nearest-neighbour distance ≪ night; at night most perch are inshore and within about 1 m of the bed and nearly still; movement by day ≈ 3× night | Imbrock 1996; Radabaugh |
| V4 | **Activity under ice ranking** | pickerel and perch keep moving and feeding by day; pumpkinseed are lethargic; smallmouth are nearly sessile (daily vertical range < 0.5 m, horizontal movement about 0) | Sergio 2026; Mendota sonar; Reeve 2022; Suski & Ridgway 2009 |
| V5 | **Feeding under ice relative to summer** (Maine angler catch as a proxy) | pickerel ≥ summer (about ×2); bass about ¼ of summer | MDIFW pickerel and bass plans |
| V6 | **Smallmouth gather at a few wintering sites** | from day of year about 270 (fall equinox + 1 week) or at 10–15 °C, bass leave summer ranges; by early ice they hold at ≤ 4 sites and return to the same sites the next year | Ridgway 2002; Sergio 2026; Webster 1954 |
| V7 | **Late-winter O₂ response** | when bottom O₂ falls below about 2 mg/L, fish move up and toward an inflow (in the sim's landscape, the stream mouth). Bass (about 0.6 mg/L) die before perch, pumpkinseed and pickerel (about 0.3–0.4 mg/L) | Hasler 2009; Cooper & Washburn 1946 |
| V8 | **Spawning order after ice-out** | pickerel (6–11 °C, at ice-out) → perch (7–13 °C) → smallmouth (about 15–16 °C) → pumpkinseed (first at 13–17 °C but peaking later, through late July) | the four species sections; parameter notes Q4 |
| V9 | **Spawning depth** | pickerel ≤ 1 m in flooded vegetation; pumpkinseed nests at about 0.4–0.9 m (mean 0.65 m); smallmouth nests at 0.5–1.5 m beside a boulder or log; perch ribbons at 0–1 m in a brown lake or 3–6 m in a clear one | Carbine 1948; Forbes 1981; Huff 2004 |
| V10 | **Size and habitat** | pumpkinseed < 75–80 mm stay inside vegetation; large smallmouth sit deeper than small ones in late summer | Mittelbach 1984; Werner & Hall 1988; Cole & Moring 1997 |
| V11 | **Bass leave the nest area after care** | home ranges "rarely incorporate the nest site"; age-0 bass stay within about 200 m of the nest and under 1 m deep through September | Ridgway 2002 |
| V12 | **Spring rise before ice-out** (deep lake) | wintering bass rise from 10–12 m to about 2 m around the spring equinox, still under ice | Suski & Ridgway 2009 |

---

## 6. Implications for a simulation

### How to read the tables
- **Depth** is the water depth the fish stands in, in metres. Where it matters, the table also gives the fish's position in the column.
- **Activity** is relative to summer daytime.
- **Mechanism** names the process the sim should model so that the pattern emerges rather than being scripted.
- **"Shallow lake"** means a 3–6 m, unstratified Maine lake or pond. **"Deep lake"** means a lake with a stratified basin (the sim's 14.4 m hole).

### Yellow perch

| Season | Depth band (m) | Habitat | Activity | Schooling | Mechanism |
|---|---|---|---|---|---|
| Ice-out → pre-spawn | moving from the basin to 1–4 m | weed edges, woody debris near shore | rising; males arrive first | schools, sorted by sex and size | photoperiod and warming; the spawning drive pulls toward structure |
| Spawn (7–13 °C) | 0–1 (brown water) to 3–6 (clear) | ribbons on woody debris and submerged plants | active day and night | loose spawning groups | spawning temperature window; a substrate-complexity rule; UV/clarity sets depth |
| Summer, day | shallow lake: deepest water, about 3–4.3 m, 200–350 m offshore. Deep lake: epilimnion just above the thermocline, 3–15 m | open bottom over mud or sand flats; weed edges; young fish closer to the vegetation | high; forages on benthos and zooplankton | 50–200 fish, sorted by size; 20–30 m across | temperature seeking (preferendum about 20–23 °C; avoid warm surface and cold, hypoxic water); food (benthos on the flats, zooplankton); O₂ avoidance below 2 mg/L |
| Summer, night | inshore littoral; few deeper than 5 m | on the bottom | resting; about ⅓ of day movement | dispersed | light threshold (about 100 lx): vision is needed to school and feed. Night rest avoids predators |
| Autumn | basin-dependent: deeper in deep lakes from October; in shallow lakes the shallowest of the year (about 2.9 m) | flats, drop-offs | the most mobile season (about 2× summer) | large schools forming | cooling; feeding before winter; turnover removes the deep-O₂ barrier |
| Early ice | shallow green weeds, about 1–3 m | Chara and green weed beds | moderate; day only | schools | food (invertebrates in green weeds); warmth at the weed bed |
| Mid-winter | deepest basin (deep lake); soft-bottom flats at 3–6 m (shallow lake) | on or near the bottom, mud flats | low but continuous; peaks mid-morning and early afternoon; inactive at night | the year's largest schools | temperature seeking (the 3–4 °C bottom water is warmest); food (chironomids in mud); a winter cold-performance floor that stays well above zero |
| Late winter, bottom hypoxia | shifted up the slope, toward an inflow or under the ice | inlet or stream mouth, upper water | stressed | crowding | O₂ avoidance below 2 mg/L outranks warmth; lethal at about 0.3–0.4 mg/L |
| Late ice | back to shallow weeds near spawning areas | weed edges | rising | schools | photoperiod; the pre-spawn drive |

### Chain pickerel

| Season | Depth band (m) | Habitat | Activity | Schooling | Mechanism |
|---|---|---|---|---|---|
| Ice-out → spawn (6–11 °C) | ≤ 1 | flooded marsh and margin vegetation, inlets | rising; the first spawner | none; several males per female | spawning temperature window; seeks the first-warming flooded vegetation |
| Post-spawn | 1–3 | weed edges | moderate | solitary | food; plants not yet grown |
| Summer, day | 0.5–2 (half of detections 0.8–1.8); large adults may sit at deeper weed edges (3–5 m) | dense submerged vegetation, lily pads, weed edges, island shallows | sit-and-wait ambush; lunges | solitary | cover-based ambush (sit in or beside cover, strike prey that passes); temperature (preferendum about 24 °C, so the largest fish avoid the warmest shallows); never in hypoxic water |
| Summer, dawn/dusk | onto the flats | weed flats | peak feeding (reported) | solitary | light: low-light advantage of a visual ambusher; prey movements |
| Summer, night | stays shallow | in cover | low | solitary | low light ends visual hunting (pike surrogate) |
| Autumn | whole basin at times; weedy flats next to deep water | weed flats near drop-offs | high; feeding before winter | solitary | food: prey gathered at the weed edges |
| Winter under ice | 0–2.5; near shore (80% of positions within 30 m in December) | rocky and weedy shallows; island margins | low but continuous, by day; strikes slowly | solitary; loose clusters | cold performance stays well above zero (pickerel feed at 1–4 °C); visual hunting in daylight under ice; food (minnows and perch in the weeds) |
| Late winter, bottom hypoxia | stays shallow, moves toward the inlet or open water | inlet, air holes | stressed | crowding | O₂ avoidance; tolerant (grass pickerel survived about 0.3–0.4 mg/L) |

### Smallmouth bass

| Season | Depth band (m) | Habitat | Activity | Schooling | Mechanism |
|---|---|---|---|---|---|
| Late winter → spring (still under ice) | rising from the wintering depth to about 2 | from the wintering site to the shallows | rising around the spring equinox | dispersing | photoperiod (the rise starts before any warming); then temperature |
| Spawn (≈ 15–16 °C) | 0.5–1.5 (clear lakes 2–6) | male's nest on gravel or rubble beside a boulder or log, in a sheltered bay; nest sites reused | male guards 2–3 weeks, active day and night | solitary territorial males, about 18 m apart | spawning temperature; a nest-site rule (hard substrate + one-sided shelter + warmest littoral); site memory |
| Summer, day | 2–5 (large fish deeper, > 8 m in late summer in a deep lake); never below the thermocline | rocky points, boulder and rubble shoals, drop-offs, logs; home range 100–400 ha in a large lake | high; travels km per day | solitary or loose | temperature seeking (field preference about 21–27 °C); food (crayfish and fish on hard bottom); a large, re-used home range (memory); size-dependent depth |
| Summer, night | 1.5–2.5 (rise after sunset) | over the same hard bottom | low horizontal movement | solitary | light: low-light foraging on crayfish; rest |
| Autumn | descending with the thermocline: about 4 → 12–14 (deep lake); fish move to a few points, reefs and shoals | traditional aggregation sites | high; heavy feeding (lipid build-up) | aggregations of many fish | photoperiod (about a week after the equinox) plus thermocline erosion; working range 10–15 °C; memory of the traditional site |
| Winter under ice | deep lake 12–15; modest lake 2–6 (sites < 8 m deep) | wintering sites with rock or structure | quiescent: daily vertical range < 0.5 m, almost no horizontal movement, minimal feeding | aggregated at ≤ 4 sites | below about 10 °C: a near-zero activity and feeding switch (stronger than a linear decline); site memory; avoid < 2 mg/L |
| Late winter, bottom hypoxia | upward or away from the hypoxic floor | — | — | — | O₂ avoidance below 2 mg/L. Bass are hypoxia-sensitive (die at about 0.6 mg/L), so in a winterkill pond they are the first to die |

### Pumpkinseed

| Season | Depth band (m) | Habitat | Activity | Schooling | Mechanism |
|---|---|---|---|---|---|
| Ice-out → spring | from the deep littoral to the shallows | warming shallows | feeding resumes at about 8.5 °C; groups disperse as the water warms (bluegill: by 20 °C) | loose groups | temperature seeking (shallows warm first); food |
| Spawn (first at 13–17 °C; runs to late July) | 0.15–1.7, mean 0.65 | nests single or in loose groups, on any substrate, near plants; large males nest first | males guard day and night; up to 16 bouts per season | small nest groups | spawning temperature window; a nest-depth rule; size-ordered nesting |
| Summer, day | 0.5–2.5 (to the 2–3 m weed edge); fish < 75–80 mm inside vegetation | vegetated littoral, weed edges, docks and logs; rarely open water | high; benthic foraging on snails and insects | adults in pairs or 3–4; the young in shoreline schools | cover and predation (the young need dense vegetation while bass are present); food (snails on plants); temperature (preferendum about 28 °C, so the warmest shallows suit them); site fidelity (home range about 0.2–1 ha) |
| Summer, night | same place | resting near the bottom in vegetation, by rocks or logs | reduced, but plankton feeding continues (night strikes > 75% of day in a pond) | dispersed | light (switch to plankton feeding); cover |
| Autumn | moving progressively offshore to the deep littoral, about 2–4 | perennial weed stands at the deep littoral edge | foraging peak in September | regrouping | cooling; weed die-back in the shallows; food (isopods) |
| Winter under ice | deep-littoral weed stands, about 2–4 (bluegill surrogate); on the bottom | dense or perennial vegetation, or a shallow weedy bay | lethargic: near-zero activity ≤ 7.9 °C; most stop feeding by 2–4 °C | aggregated | temperature (warmest bottom water); cover; a cold-performance curve that collapses near 8 °C |
| Late winter, bottom hypoxia | up and toward an inlet or air hole | inlet, under the ice | stressed | crowding | O₂ avoidance below 2 mg/L; tolerant (about 0.3–0.4 mg/L lethal; ≥ 2× bluegill's survival time) |

### Mechanism notes for Synapse Reef (proposals; not yet checked against the code beyond the lines named)

1. **Use absolute depth, not only a fraction of the column.**
   - In `species.js`, `zone` is a "preferred depth band (fraction of the local water column)": pickerel [0.3, 0.95], perch and bass [0.3, 0.9], pumpkinseed [0.15, 0.72].
   - The field patterns are set by **absolute depth and bottom type**: pickerel at 0.8–1.8 m water depth; pumpkinseed inside the ≤ 2.5 m vegetated band; perch and bass over 2–6 m hard or open bottom.
   - A fraction-of-column band lets a pickerel sit at 0.3–0.95 of the 14 m hole. The real fish would almost never be there.
   - Proposal: score a cell by (a) the water depth of its column, against a per-species, per-season band, and (b) habitat (cover, plants, rock, mud), not by fraction of the column alone.
2. **Temperature as a resource.** Each species already has `tempOpt`.
   - Behavioural thermoregulation should pull fish toward the temperature closest to it within reach. The niche width is about ±2 °C (Magnuson 1979).
   - With that rule, the following should emerge without scripting:
     - summer bass and perch above the thermocline;
     - winter perch and bass at the 3–4 °C bottom;
     - pumpkinseed in the warm shallows.
   - The current perch `tempOpt` (23 °C) is at the warm end of the field evidence (Constance EP 13–19 °C; agency 18–24 °C; final preferendum 17.6 °C). About 20–21 °C would put summer perch deeper than bass, as observed.
3. **Separate O₂ avoidance from the lethal threshold.** `o2Crit` holds lethal-scale values (0.21–0.47).
   - The field shows a behavioural avoidance threshold of about **2 mg/L** (bass under ice; perch in Lake Erie), well above the lethal level.
   - Fish should steer up the O₂ gradient below about 2 mg/L. They should crowd toward the stream inflow or the under-ice layer as bottom O₂ falls late in winter.
   - This gives the Cooper & Washburn inlet refuge and V7.
4. **Cold-activity curves differ in shape, not just in floor.**
   - Today `coldPerf` falls linearly from 1 at `tempOpt` to a floor at 2 °C (floor = `COLD_PERF_MIN` 0.2, or the species' `coldPerf`).
   - For smallmouth (`tempOpt` 27) this gives about 0.46 of summer activity at 10 °C and about 0.33 at 6 °C. The field shows quiescence below about 10 °C: almost no horizontal movement, a daily vertical range under 0.5 m, minimal feeding.
   - Pumpkinseed (`tempOpt` 28) get about 0.38 at 8 °C, against near-zero at ≤ 7.9 °C in the lab.
   - Perch and pickerel should keep a high floor (they feed through the ice).
   - Proposal: give a per-species sigmoid step for the warm-water centrarchids:
     - bass: about 0.05 below 8–10 °C;
     - pumpkinseed: about 0.1 below 8 °C, and about 0 feeding below 3 °C.
   - Keep the linear form for the percid and esocid.
5. **Light: diel rest and schooling.**
   - The sim's day–night clock is decoupled (`TIME.DAY_LEN` 60 s; about 30 day/nights a year), so diel behaviour runs on it.
   - Perch: school only while light at the fish is above a threshold (EP: about 100 lx at 8 m). Below it, disperse, move inshore along the bottom and rest. At dawn, reverse.
   - Pickerel and bass: scale visual strike success with light (bass > 95% down to moonlight, 62% at starlight, about 0 in darkness). Night foraging then falls naturally.
   - Pumpkinseed: switch to plankton feeding at night.
6. **Memory of places.** Smallmouth return to traditional wintering sites and nest sites, and re-use 74% of their home range from year to year. Pumpkinseed return to their home site with probability 0.74–0.93 after displacement.
   - The brain already has a "home bearing" input. A per-fish remembered **wintering site** (set where the fish spent its first winter, or inherited from the school it overwintered with) and a **nest site** would let the autumn convergence and spring return emerge.
   - A day-length cue (about a week after the fall equinox) should trigger the autumn move, with temperature (10–15 °C) as backup.
7. **Size-dependent habitat via predation risk.** Small sunfish stay in vegetation because open water is 40–80× riskier when bass are present. The threshold body length for leaving cover should rise with bass density (Werner & Hall 1988).
   - The sim's fear input and cover-seeking (`HIDE_COVER`) are the levers. A test: remove bass, and the < 75 mm sunfish should spread into open water.
8. **Spawning-site rules** (depths in V9):
   - pickerel: flooded vegetation ≤ 1 m at ice-out;
   - perch: complex woody or plant structure, with depth increasing with water clarity;
   - smallmouth: hard bottom, one-sided shelter, the warmest sheltered littoral, at 0.5–1.5 m;
   - pumpkinseed: 0.4–0.9 m near plants, any substrate.

---

## 7. Gaps
- **No under-ice telemetry for yellow perch, pumpkinseed or chain pickerel in a shallow (3–6 m), mixed lake.** Shallow-lake winter positions are inferred from:
  - Milipsigate (17 m maximum);
  - the deep Mendota sonar;
  - bluegill telemetry;
  - Cooper & Washburn;
  - anglers.
- **Classic papers read only as abstracts or not at all:** Helfman 1979 (the perch light threshold; within-population variation), Helfman 1981, Emery 1973 (species-level night behaviour), Hall & Werner 1977 and Werner et al. 1977 (pumpkinseed results), Hasler & Bardach 1949, Keast 1968, Magnuson et al. 1985, and Petrosky & Magnuson 1973. The publisher sites returned 403.
- **No home range in hectares for chain pickerel.**
- **No measured light threshold for yellow-perch school break-up.** The 100 lx figure is from Eurasian perch.
- **No Maine telemetry for any of the four species in winter.** The only Maine telemetry found is the Green Lake summer smallmouth study.
- **No smallmouth-specific O₂ avoidance threshold;** 2 mg/L comes from largemouth bass.
- **No pumpkinseed relation to the thermocline in stratified lakes.**
- **The current Maine bass rules for winter** (the 2026 lawbook) are unconfirmed.
