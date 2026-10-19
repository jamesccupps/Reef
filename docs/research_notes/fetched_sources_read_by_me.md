# Fetched sources: what I read myself (2026-10-19)

The human fetched these files into `docs/research_notes/fetched/`. That folder is gitignored because the files are large scans and some are copyrighted, so this note is the committed record. Every number below was read from the file, not from a summary. Each entry gives the row it answers in `blocked_sources_to_fetch.md` and then what it means for the sim. A background agent is writing `fetched_sources_digest.md` for the two big scans (Cooper 1941, A05; Rupp & DeRoche 1965, A14).

---

## A03. MDIFW lake survey sheets, Upper and Lower Hot Brook Lake

Surveyed August 1949; revised 1965 and 2004.

**The lakes**

| | Upper | Lower |
|---|---|---|
| Area | 912 acres (369 ha) | 713 acres (289 ha) |
| Maximum depth | 18 ft | 13 ft |
| August temperature | 74 °F at the surface, 71 °F at the bottom | 74 °F at the surface, 71 °F at the bottom |

- Neither lake stratifies.
- The species list matches the sim's eleven.
- Shores are mostly rocky with sand and mud. Beds are mostly muddy. Upper has a large sandy beach in the NE.
- There are wetlands on Upper's S/W shore and Lower's N/E shore, with spruce–fir woods around.

**The brook**
- It is 1/8 mile long, "rocky and hard bottomed", and non-navigable: a boat has to be paddled, poled or walked through.
- It is the only way into Lower.
- Flow: Upper's N outlet → Lower's S inlet → Lower's N outlet → Baskahegan Stream.

**The fisheries**
- The sheets call the lakes "excellent spawning and adult habitat for bass, perch, and pickerel".
- Principal fisheries: smallmouth bass, white perch and pickerel.
- Bass are managed for larger-than-average size.
- White perch bag limit is 25.
- There are no camps on Lower.

**For the sim**
- The geometry was built from these soundings and matches.
- The brook's hard, rocky bed is consistent with its riffles.

## A01. Warner 1973 (spring food of chain pickerel in Maine lakes), page 149 only

- Author: Kendall Warner, MDIFG, Bangor.
- The study covers Maine lakes in spring, within about a month of ice-out, alongside the stocked-salmonid predation study (Warner et al. 1968).
- It cites the earlier Maine pickerel food studies: Cooper 1941, Fuller & Cooper 1946, Barr 1962.
- **The results are on pp. 150–151. Ask the human for those two pages.**

## A04. MDIFW White Perch Management Plan (M. R. Smith, 2002; Region F, which includes Hot Brook)

**Spawning and reproduction**
- Spawns at about 59–60 °F (15–15.5 °C), in shallow water over almost any bottom.
- There are "heavy spawning runs of white perch in streams", which people travel to watch.
- Eggs hatch in 4–5 days at 15 °C.
- Fecundity is 20,000–300,000 eggs per female, by size. A 6-inch (15-cm) female carries about 22,000.
- "Their reproductive potential is so great that only major mortalities induced by unfavorable weather at spawning time can cause failures in certain year classes."

**Life span and habitat**
- Average life span is 5–7 years.
- They thrive in lakes of about 50 acres or more and about 25 ft or more deep, if the deep water keeps its winter oxygen. Both Hot Brook lakes are shallower than that and still hold principal fisheries.
- They do better where summer water reaches 75 °F (24 °C) or more. Hot Brook read 74 °F in August 1949.

**Diet**
- "Large perch will eat most small fish including their own species", i.e. they are cannibals.
- Schools feed at the surface with their dorsal fins out. This is visible behaviour worth rendering.

**Stunting**
- "Usually the problem is one of too many small perch."
- Stunting can be so extreme that "a 6-year-old perch may be only 4 inches long" (10 cm).
- The depleted food also slows the growth of bass, salmon and trout.
- Even small, slow-growing perch mature and spawn.
- The plan lists "proliferation of small size and/or stunted … populations" and "unexplained disappearances of white perch populations" as problems.

**Size and harvest**
- Anglers keep fish of 9–10.5 inches (23–27 cm), weighing 0.43–0.61 lb.
- "The average 8 to 10 inch perch from most Maine waters weighs about 0.45 pound and is approximately four years old." That is about 20–25 cm at age 4.
- About 50 % of desirable-size fish could be harvested without harm.

**Regional details**
- Fish in streams are often migrants from lakes.
- The 25-fish bag on seven eastern Maine lakes came from a citizen petition, "not for biological reasons". Hot Brook's bag is one of these.
- Region F catch rates: 1.29 white perch per angler-day through the ice; 1.90 per angler-day on lakes in open water.

**For the sim**
- A 5–7-year average life fits annual mortality A ≈ 0.45–0.55 (`white_perch_regulation.md` §7).
- Size at age 4 of about 20–25 cm is the growth check for unstunted Maine fish.
- In the field, crowding regulates white perch mainly through growth (stunting), not through mortality. A stage-R population that holds its numbers by starving its young into 1–2 cm "stalled" fish is the wrong mechanism, but slow, stunted growth at high density is right.
- Year-class failure comes from spawning-time weather.
- A spring white perch run up the brook is a field behaviour the sim lacks (to-do).

## A13. MDIFW "yellow perch" file

This is not a plan. It is the 2014 application for a permit to take yellow perch commercially (trap net, dip net, spear, seine), with its gear rules: trap nets ≤ 3/8-inch bar mesh, with escape panels for fish under 6 inches. It lists the lakes where commercial harvest is legal.

- **Hot Brook is not on the list.** Nearby lakes that are on it include Faulkner Lake (Weston, 70 ac), Big Greenland Pond (Danforth, 86 ac), Sucker Lake (Danforth, 256 ac), Upper Macwahoc and Mattaseunk.

**For the sim:** this is weak evidence, from an absence, that Hot Brook's yellow perch are not overabundant. It is consistent with the human's "perch small and fewer than fallfish and bass".

## A11. MDIFW Black Bass Management Plan (R. M. Jordan, 2001)

**First winter (the key mechanism)**
- The smallmouth's northern limit in Maine is set by "whether first-year bass achieve adequate body size and weight to survive the approximately 200+ day starvation period encountered during the first winter, when water temperatures cooler than 50° F result in cessation of feeding and growth".
- "There is a direct relationship between size and overwinter survival in first-year smallmouth bass." This is stage R's mechanism, for bass, in the state's own words. The sim's calendar has 208 days below 10 °C.

**Maturity and fecundity**
- Males mature at 3–4 years, females at 4–5. Size at maturity is 8–12 inches (20–30 cm), smaller in males.
- Effective fecundity is 2,000–3,000 eggs per lb of female. The ovaries hold 7,000–8,000 per lb, but not all are released.

**Spawning and nests**
- Spawning runs mid-May to mid-June.
- Males build nests once water passes 55 °F (12.8 °C). Eggs are laid at 60–66 °F (15.6–18.9 °C).
- Nests are in shallow water near rocks, logs, stumps or drop-offs.
- The male alone guards the eggs and fry for a few weeks. Hatching takes 5–8 days.
- A drawdown or a cold spell makes males desert their nests. They may re-nest, but the late young "may not experience an adequate growing season … to survive the first winter."

**Young of the year**
- By the end of their first summer, young are 2.2–2.9 inches (56–74 mm) in most Maine waters. Fast growers reach 4 inches.

**Year-class strength**
- Warm summers (5 of 6 in 1994–99) gave strong year classes: experimental angling caught 6–14 bass per hour in eastern Maine in 1999–2000, against 1–5 normally.
- Cool summers (1986, 1992, 1996) cut those cohorts sharply. Cool summers are ranked joint-first among bass management problems, with "the potential for complete year-class failures".

**Abundance and size**
- In many eastern Maine waters, "highly abundant spawning habitat and lack of significant predators on juvenile bass" give dense populations "comprised primarily of fish from 8-13 inches".
- Abundance objective: bass of 10 inches or more at 2.0 fish/acre and 2.3 lb/acre over bass habitat (water under 30 ft). That is about 5 fish/ha and 2.6 kg/ha of fish ≥ 25 cm.
- The plan notes that studies in the southern US put unmanaged black bass biomass at about 10 lb/acre (11 kg/ha).
- Region F harvested bass average 12.0 inches and 1.2 lb. The eastern/northern objective is 11 inches and 0.6 lb.

**Movement and anglers**
- Bass have small home ranges relative to lake size.
- In Washington and Hancock counties, bass are almost never caught by ice anglers. They are inactive in winter.
- Maine's low fertility and short season make its bass slower-growing than southern bass.
- Smallmouth are not native to Maine; they were introduced in 1868.
- Bass anglers release 97 % of their catch in summer.

## A12. MDIFW Bass Technical Work Group slides (J. Seiders, Nov 2019)

- Harvest is low: 2.6 % of the catch in open water, 10.3 % through the ice.
- The northern region has no size or bag limit.
- Bass are surveyed by electrofishing and angling.
- **For the sim:** angler removal of bass is small.

## A15. Dudley & Trial 2014, USGS SIR 2014-5164

The report covers growth and mortality of under-yearling smallmouth in Spednic Lake, 1970–2008. Spednic is on the St. Croix, about 30 km east of Danforth, so this is the nearest validated model for Hot Brook's bass. It uses the model of Shuter et al. 1980.

**The model**

*Spawning*
- Spawning is triggered when the daily mean surface temperature T is between 15 and 27 °C and degree-days above 10 °C have accumulated to between 10 and 150.
- Spawning is then delayed by SD = 8 − 0.055·DD days.

*Nest mortality* (fertilisation to swim-up, 15 days), from the minimum daily mean temperature T_min over that time:

| T_min (°C) | p (mortality) |
|---|---|
| < 10 or > 30 | 1 |
| 10–15 | 3.0 − 0.2·T_min |
| 15–27 | 0 |
| 27–30 | 0.33·T_min − 9 |

*Daily growth increment* (mm/day):

| T (°C) | DGI (mm/day) |
|---|---|
| < 14.2 | 0 |
| 14.2–25.5 | 0.12·T − 1.7 |
| 25.5–31.5 | 1.4 |
| 31.5–35 | 14 − 0.4·T |

Length at autumn is L = 9.1 mm (size at swim-up) + ΣDGI.

*First-winter mortality*
- WD (winter days) is the number of days from below 10 °C in autumn to 10 °C or more in spring. **At Spednic it averaged 208 ± 4 days**, the sim's own figure.
- C_max = 0.3375·WD + 22.083 mm, which is about 92 mm at 208 days.
- C_min = 0.1938·WD + 7.917 mm, which is about 48 mm.
- Winter mortality p = (C_max − L)/(C_max − C_min). It is 0 for L > C_max and 1 for L < C_min.

**Results**
- **Spawning:** started on May 28 (median; range May 22–June 4) and ended on June 10. Mean spawning period 12 days (range 8–18).
- **Early cold:** cold early in the spawning period killed part of the cohort in 20 of 39 years (over 10 % in 17 years, over 30 % in 6). It hits the earliest, largest young.
- **Lengths:**
  - The model predicts 84–92 mm young.
  - Measured young were smaller: 73 mm on Sept 1, 1988 (Jordan 1988, n = 24, range 63–97); 70–76 mm on Oct 3, 1995 (Arndt). The model uses temperature only, not food.
  - At the measured sizes, first-winter mortality is about (92 − 73)/(92 − 48) ≈ 40 %.
- **Weak year classes:** a year class is weak when age-4 or age-5 fish make up less than 15 % of a 100-fish sample. 1986 and 1996 were weak across the region.

**For the sim (stage R item 1)**
- This is a ready, eastern-Maine-validated rule for size-dependent first-winter mortality in bass, with no free parameter except WD, which the sim's own thermal year supplies.
- It explains year-class strength by summer warmth, as the plan above does.
- White perch, perch and pumpkinseed need their own size thresholds: Johnson & Evans 1990/1991 (A06, A07) and pumpkinseed NAJFM 17:581 (B04). Those have not been fetched yet.

## noaa_2897_DS1.pdf

**This is the wrong file.** It is Able & Kaiser 1994, *Synthesis of Summer Flounder Habitat Parameters* (NOAA Coastal Ocean Program, Decision Analysis Series No. 1). Summer flounder is a marine flatfish, and no row in the blocked list asks for it. Not used. I'll tell the human.

## EPA 841-R-93-002: Baker, Olem, Creager, Marcus & Parkhurst 1993, *Fish and Fisheries Management in Lakes and Reservoirs*

Read: chapter 2 (biota, trophic pyramid, top-down control), chapter 3 (fish ecology, all of it), chapter 8 (stunted populations), chapter 9 (top-down management of the pelagic food web), chapter 12 (Bear Lake, WI) and Appendix A (species).

Skipped: chapters 4–7 (management process and agencies), 10 (sampling) and 11 (models: only the standard Ricker and Beverton–Holt curves), plus most of 12 (western reservoirs).

**Survival and compensation**
- For most fish species, fewer than 1 % (often less than 0.01 %) of eggs survive to age 1. Survival is higher where parents give care.
- Strong year classes are often followed by weak ones, through cannibalism and competition.
- Compensation works through growth, age at maturity and fecundity as well as through mortality: "at lower densities … fish grow faster, mature earlier, and usually produce more eggs".
- Overly abundant cover or too few predators gives high survival of the young, then crowding and stunting.

**Gape**
- A largemouth bass can swallow shad up to ½ of its own total length and sunfish only up to ⅓, because sunfish are deep-bodied (Shelton et al. 1979). This supports the sim's body-depth gape rule (F3.SIZE_K).
- A scarcity of small prey gave one bass year class a bimodal size distribution: the early piscivores grew to 30–40 cm in their first year.

**Planktivores and zooplankton (the sim's open problem)**
- **Critical planktivore biomass.** Benndorf 1990 defines a "critical fish biomass" of zooplanktivores above which large herbivorous zooplankton cannot develop. It ranges from 20 to 1,000 kg/ha. It is lowest for the most efficient planktivores, such as **age-0 yellow perch**. Refuges and turbidity raise it.
- **Oneida Lake** (Mills et al. 1987):
  - In years when **age-0 yellow perch exceed about 14,000/ha in August, *Daphnia pulex* disappears**, chlorophyll nearly doubles and the water clouds.
  - The density of young perch in May is set by weather during egg incubation.
  - Once the young perch pass about 18 mm, predation by walleye and adult perch is the main control on their numbers.
- **Behaviour matters.** Minnows crowd into the littoral to avoid bass, so they graze little on the pelagic zooplankton (Peter Lake). After pike were introduced, losses of prey fish to emigration equalled losses to predation (Bolger Bog).
- **Zooplankton refuges:** deep or dark water by day (diel vertical migration), weed beds, and low-oxygen water.
- **Recovery.** Reduced planktivore populations recover in 1–3 years. In Round Lake, deep-bodied adult bluegill outgrew bass predation and recovered in 3 years. Pumpkinseed and white perch are similarly deep-bodied.
- **Piscivore share.** Benndorf's rule is that piscivores need to make up 30–40 % of fish biomass to control planktivores. At Bautzen, piscivores : (planktivores + benthivores) settled at 0.3–0.5.
- **Wintergreen Lake.** Winterkill removed the bass, golden shiners exploded and *Daphnia* crashed. Pumpkinseed, yellow perch, bullheads and golden shiners tolerate low oxygen better than bluegill or largemouth bass.

**Communities and yield**
- Tonn et al. 1983 (northern Wisconsin): pike lakes typically hold bullheads, white sucker, pumpkinseed and yellow perch.
- Soft-bodied minnows are rare in lakes with large piscivores (Tonn & Magnuson 1982). This fits a rare dace and a pressed killifish.
- Ryder's MEI yield: Y = 1.4·(TDS/z̄)^0.45 kg/ha/yr.

**Species notes (Appendix A)**
- **Chain pickerel**
  - Prefers summer water at 70–86 °F (21–30 °C).
  - Spawns at 47–52 °F (8–11 °C) in 3–10 ft (0.9–3 m) over flooded vegetation.
  - Esocids turn piscivorous at about 1.5 inches (3.8 cm).
- **Black bass**
  - Turn piscivorous at about 4 inches (10 cm). Feeding is restricted below 50 °F.
  - Smallmouth prefer the low 70s °F, spawn at a peak of 61–65 °F, and nest at 1–4 ft (to 15 ft; deeper in clearer water) on gravel or rock.
  - Young bass rely on weed cover.
- **Yellow perch** spawn at 45–55 °F, laying strands on vegetation and brush.
- **Pumpkinseed** spawn before bluegill (first week of June in northern Wisconsin) and prefer cooler water. Young sunfish feed "almost solely on small zooplankton during their first year".
- **Brown bullhead** spawn at 70–80 °F, and both parents guard the brood.
- **Bear Lake, WI** (300 acres, stunted pumpkinseed and bluegill): 40 lb/acre (about 45 kg/ha) of sunfish and bullheads was removed over 4 years with no clear change in their size structure.

**For stage R's question "why is year 1's zooplankton 10× the field's, then 2–40 µg/L from year 2?"**

The field keeps zooplankton at a moderate level through:
1. its refuges: DVM and weeds;
2. predation that thins the age-0 planktivores once they pass about 2 cm;
3. small fish hiding in the littoral under predation, where they graze the open water less.

Things to check in the sim:
- the age-0 densities per ha against Oneida's threshold of about 14,000/ha;
- whether the zooplankton fields have any refuge from the young;
- the piscivore share of fish biomass (30–40 % controls planktivores).
