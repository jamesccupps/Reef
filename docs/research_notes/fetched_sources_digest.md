# Fetched sources: digest for the Hot Brook simulation

Compiled 2026-10-19 from the 12 files the human placed in `docs/research_notes/fetched/`. The files were read in place and none was changed.

**How they were read.**
- All PDFs except the two GIF/TXT files carry a text layer, extracted with PyMuPDF. The Cooper report and the Behnke reader are ABBYY/OCR scans.
- Wherever a table's text layer was garbled, the page image was rendered and read by eye. That covers the two Hot Brook maps, Cooper Tables XVI–XIX, and Rupp & DeRoche Tables 1, 4, 7, 10 and 12.
- No OCR engine (tesseract) is installed, and none was needed.
- Cooper was read only for the sections that bear on the sim: fishes, white perch food and growth, the food of other fishes, bottom fauna, plankton, shallow-lake water, and the conclusions.

**Conventions.**
- "p." is the printed page and "PDF" is the page in the file.
- [inf] marks my own arithmetic or inference. TL means total length.
- 1 lb/acre = 1.121 kg/ha.

---

## Most important for the sim (ranked)

1. **Cooper (1941) does not support white perch adult mortality of 0.50–0.56. His data say mortality rises with age.**
   - What the project carried: Stanley & Danie's line that adult mortality was "similar to Cooper" (white_perch_regulation.md §0–1; blocked-list row A05). Cooper himself computes no rate.
   - His data: the age frequency of 1,827 white perch, mostly ≥ 15 cm, gill-netted in 43 southern-Maine lakes in 1938–40 (p. 135).
   - The catch curve from it [inf]:
     - ages 5–9: A ≈ 0.15. Net selectivity under-samples the young slow fish, so the true value is probably 0.2–0.35;
     - age 9 and older: A ≈ 0.50–0.54;
     - Chapman–Robson from age 5: A ≈ 0.31;
     - a regression over ages 5–16: A ≈ 0.43.
   - Cooper's own reading: "a considerable per cent live to be at least 8 to 10 years old, after which the rate of mortality increases greatly" (p. 136).
   - **Effect on the sim.** The sim's ~30 %/yr for adults is inside the Maine range. A flat M of 0.45–0.55 at all adult ages is not supported. An age-rising M (low at ages 3–8, high past ~9) and juvenile and first-winter regulation are.

2. **The only Maine whole-lake fish standing crops total 45–117 kg/ha for all species together** (Rupp & DeRoche 1965, inside `2491-36-10.pdf`).
   - The three lakes (rotenone, with SCUBA counts of the fish that sank): Shagg 44.5, Hills 70.1 and Coleback 117.1 kg/ha. Coleback is a 20-acre lake in Washington County, and eels make up 41 % of its weight.
   - The sim's year-1 rise from ~100 to ~165 kg/ha exceeds every one of them. Its white perch alone, at 61 kg/ha, exceed the total for two of the three lakes.
   - Per-species values: pickerel 4.1 and 8.4 kg/ha (83 and 175 fish/ha); white sucker 24–38 kg/ha; pumpkinseed 14.9 kg/ha (mostly young of the year) in the Washington County lake.

3. **In Maine, adult pickerel and bass in white-perch lakes ate mostly white perch, and almost no crayfish** (Cooper Tables XVI–XVII, pp. 155–159).
   - **Pickerel:** 110 fish of 32–64 cm, 51 with food. By volume: white perch 54.7 %, golden shiner 14.0 %, yellow perch 7.5 %, pickerel 6.2 %, bullhead 4.5 %, tadpoles 4.4 %, smelt 3.0 %. That is about 95 % fish, with crayfish 0.5 % and insects 0.2 %.
   - **Smallmouth bass:** 66 fish of 22–54 cm, 36 with food. By volume: white perch 61 %, yellow perch 14 %, crayfish 14 %, insects 4 %. That is 80 % fish.
   - Cooper adds "crayfish are generally rare in Maine" (p. 25). Only one crayfish turned up in 809 bottom samples (p. 83).
   - **Effect on the sim.** This contradicts the project's crayfish shares for Hot Brook (pickerel 10–30 %, bass 35–55 %) and its "small white perch 5–15 %". It fills the note's gap "no quantitative diet of adult smallmouth in a Maine lake".
   - **Warner (1973) did not arrive in full.** The GIF is only p. 149, the introduction. The data pages, 150–151, are still missing.

4. **A ready-to-code first-winter survival function for young bass, set for eastern Maine** (Dudley & Trial 2014, after Shuter et al. 1980).
   - Winter days (WD) count from the autumn day below 10 °C to the spring day at or above 10 °C.
   - Length limits: Cmin = 0.1938·WD + 7.917 mm and Cmax = 0.3375·WD + 22.083 mm.
   - Probability of dying over winter: p = (Cmax − L)/(Cmax − Cmin).
   - Spednic Lake (Washington County): WD = 208 ± 4 days, the same as the sim's 208 days below 10 °C. That gives 0 % survival below 48 mm and 100 % above 92 mm.
   - Measured Maine young bass in September–October averaged 71–76 mm, which means ≈ 35–50 % die over winter [inf].
   - The report also gives the nest-mortality and daily-growth equations and the spawning trigger.

5. **Adult white perch feed mainly on the bed, not on the plankton, and grow fast only where they eat fish** (Cooper pp. 125–152).
   - Fish ≥ 15 cm, by volume: 67 % bottom animals (mayfly nymphs alone 44 %), 26 % fish, ~6 % plankton crustaceans.
   - Over 100,000 water fleas were counted in the stomachs, so plankton led by number but not by volume.
   - Lakes vary: plankton crustaceans were 0–98 % of the diet.
   - Growth correlated with the share of fish in the diet (20–50 % in the fast-growing lakes). It did not correlate with bottom-fauna density.
   - **Effect on the sim.** The sim lets white perch eat zooplankton up to 40 cm (`Lzoo` 40). That is probably too planktivorous for adults. Young-of-year are the likelier zooplankton grazers: in Oneida Lake *Daphnia pulex* vanishes once age-0 yellow perch exceed 14,000/ha in August (EPA 1993, p. 165).

6. **The Hot Brook sheets confirm the sim's geometry but say nothing on netting effort.**
   - "75 feet – 71 °F" is printed that way in the scan itself, so it is a typo in the source, not an OCR error. It is identical on both sheets.
   - The mean of the map soundings is 10.7 ft (3.25 m) for Upper and 8.9 ft (2.71 m) for Lower [inf]. Lakes of Maine gives 11 and 9 ft.
   - Upper's deepest water, 15–18 ft, is in the north basin by the outlet.
   - The connecting stream is "short (1/8 mile) non-navigable… rocky and hard bottomed". No dam is mentioned.
   - Neither sheet gives netting methods, effort, growth or stocking (row A03's question stays open; data request D1).

7. **Eastern Maine bass are abundant, small and caught at high rates** (MDIFW Black Bass Plan 2001).
   - Populations are "comprised primarily of fish from 8–13 inches", thanks to abundant spawning habitat and the "lack of significant predators on juvenile bass".
   - Biologists angling in late May–June caught 1–5 bass an hour, and 6–14 an hour in 1999–2000 after warm summers.
   - Fish caught in eastern and northern Maine average 11 in and 0.6 lb.
   - The statewide stock objective was 2.0 bass > 10 in per acre and 2.3 lb/acre (4.9/ha and 2.6 kg/ha); the plan says it was met.
   - The plan gives 10 lb/acre (11 kg/ha) as the average in unmanaged southern US waters, and expects Maine's to be lower.
   - **Effect on the sim.** Its bass, at 9–11 kg/ha, sit at that southern level.
   - In Washington and Hancock Counties, bass are "almost never caught by winter anglers".

8. **Calibration checks from Cooper's 1940 field data.**
   - **August zooplankton (0–15 ft):** 613 copepods and 271 cladocerans per ft³, i.e. ≈ 22 and 10 per litre. The settled plankton volume was 0.73 mL/ft³. At ~3 µg dry mass per animal that is ≈ 90 µg/L [inf], which matches the project's field target of ~60–100 µg/L and is far below the sim's year-1 500–970 µg/L.
   - **Bottom animals (Ekman grabs, large clams excluded):** ≈ 5 g wet/m² and ~250 animals/m² in the shallow, unstratified lakes; ≈ 3.7 g/m² over all 44 lakes [inf]. That is at the low end of the sim's 5–20 g/m² (`BENTHOS.CAP` 15).

9. **White perch move through streams.**
   - Cooper reports "large spawning runs in the major inlet and outlet streams of some lakes" (p. 25).
   - He also has white perch "migrating" onto the screen of Great Pond's outlet, pinned by the current, on 3 February 1940 (p. 122).
   - MDIFW (2002) adds that stream white perch "may not be resident populations, but rather migrants from nearby lakes" and mentions "heavy spawning runs of white perch in streams" (pp. 3, 13).
   - **Effect on the sim.** The connecting brook should carry a white perch spawning run in May–June, and possibly winter movement too.

---

## 1. MDIFW lake survey sheets, Upper and Lower Hot Brook Lake (`hot_brook_lake_upper.pdf`, `hot_brook_lake_lower.pdf`)

**What they are.** Two-page MDIFW sheets: a text page and a sounding map in feet. Surveyed August 1949 and revised 1965 and 2004, under Federal Aid project F-28-P (L1072F). The Upper map is titled "O. and Bancroft Twp., Aroostook Co.", and the Lower map "T8 R4, Danforth, Washington Co., Bancroft Twp., Aroostook Co.".

**Key facts (p. 1 of each sheet).**

| | Upper | Lower |
|---|---|---|
| Area | 912 acres | 713 acres |
| Maximum depth | 18 ft (5.5 m) | 13 ft (4.0 m) |
| Temperature, Aug 1949 | surface 74 °F; "75 feet – 71 °F" (as printed) | identical |
| Stratification | "shallow and does not stratify during summer months" | same |
| Shore | spruce-fir forest, wetlands on the S and W; shore "mostly rocky with some areas of sand"; "large sandy beach in the northeast part"; "lake bottom is mostly muddy" | spruce-fir, wetlands on the N and E; rocky shore with sand and mud; bottom mostly muddy |
| Development | "an area of camp development along the south shore" | "There are no camps on this lake" |
| Tributaries | "several small tributaries… none have any suitable habitat for coldwater fish"; the outlet flows into Lower, then Baskahegan Stream | "The major tributary is the inlet from the upper lake… rocky and hard bottomed… not… coldwater" habitat; the outlet flows into Baskahegan Stream |
| Access | unimproved boat launch at the south end, off Rt. 169 | only through the inlet stream: "not possible to operate a boat through this stream… paddle, pole, or walk a boat" |

- **Fish (both sheets).** Smallmouth bass, white perch, yellow perch, chain pickerel, white sucker, bullhead (hornpout), banded killifish; under "minnows", blacknose dace and fallfish. No pumpkinseed or redbreast is listed. (*Lake Fish of Maine* adds pumpkinseed for Upper.)
- **Principal fisheries.** Smallmouth bass, white perch, chain pickerel. Yellow perch are present but not principal.
- **Habitat.** "Typical warm water lake with excellent spawning and adult habitat for bass, perch, and pickerel."
- **Management.** "Managed for a larger than average size bass fishery", with special regulations; a 25-fish daily bag on white perch; open until November 30.
- **The brook.** "A short (1/8 mile) non-navigable connecting stream." 1/8 mile is ≈ 200 m; the sim's GIS brook is 154 m.

**The maps (p. 2).**
- **Upper.** The outlet leaves the north tip. The north basin holds the deepest soundings: a row of 10–15–16–18–18–18–17–15 ft, and 16–17 ft nearby. A narrows of 13–16 ft (5 ft at the east edge) leads to a broad south basin of 11–14 ft. The south shore is a 2–10-ft shelf. There are two islands, an elongated one mid-west and a triangular one south-centre. Tributary lines enter on the west and south.
- **Lower.** The inlet enters at the south tip and the outlet leaves on the NE shore. Most soundings are 9–12 ft, with 13 ft south of centre. A large eastern bay runs 4–11 ft and the south end 4–9 ft.
- **Mean of the soundings** [inf, from my reading of the numbers; transects, not area-weighted]: Upper 10.7 ft (3.25 m) over 83 soundings, Lower 8.9 ft (2.71 m) over 63.

**What it settles.**
- Confirms the sim's areas, depths, the deep north basin by Upper's outlet, the lakes' lack of stratification, and the brook's character: short, rocky, shallow enough that boats are walked.
- Resolves the "75 feet" question in `hot_brook_lake_records.md`: it is a typo in the original, and the reading means a ~3 °F (1.7 °C) surface-to-bottom difference in August.
- **Not settled.**
  - No netting methods or effort, so "absent" (e.g. no pumpkinseed) cannot be judged.
  - No dam at either outlet. The sheets are silent, which is not evidence of absence.
  - No growth data, stocking history or mapped spawning areas.

---

## 2. MDIFW *White Perch Management Plan* (M. R. Smith, Region F, May 2002; `whiteperch.pdf`)

**What it is.** A 19-page species plan: life history, management history, angler-survey tables, goals, problems and strategies. **It contains no growth table, no length at age and no mortality estimate.**

**Key facts.**
- **Spawning (p. 2).**
  - Spawns "at water temperatures around 59-60 degrees F" (15–15.5 °C), "in shallow water over almost any bottom type".
  - 20,000–300,000 eggs a female; a 6-in (15-cm) fish carries ~22,000.
  - Eggs hatch in 4–5 days at 59–60 °F.
  - "The average life span is 5-7 years."
- **Habitat (p. 2).** "Perch can survive and often thrive in most Maine lakes… of approximately 50 acres or more… and about 25 feet or more in depth if the deeper water is not depleted of oxygen during the winter." White perch "do better in waters that reach… 75 degrees F."
  - [inf] Hot Brook, at 18 and 13 ft, is shallower than that rule of thumb yet supports a principal white perch fishery. Its winter O₂ must therefore stay adequate, and the sim should not winterkill it.
- **Diet (p. 2).** "Large perch will eat most small fish including their own species."
- **Population dynamics (p. 2).** "Only major mortalities induced by unfavorable weather at spawning time can cause failures in certain year classes… Usually the problem is one of too many small perch. Even small, slow-growing perch can mature and spawn."
- **Stunting (p. 3).** Protective regulations before the 1950s caused "over abundance and subsequent stunting… so extreme that a 6-year-old perch may be only 4 inches long". Depleting the food also "affects the growth of… salmon, trout, and bass".
- **Movement (pp. 3, 13).** Stream fisheries may be "migrants from nearby lakes and ponds"; "heavy spawning runs of white perch in streams".
- **Size and age (p. 11).** "The average 8 to 10 inch perch from most Maine waters weighs about 0.45 pound and is approximately four years old." Anglers keep fish of 9–10.5 in and 0.43–0.61 lb.
- **Harvest.**
  - Statewide harvest 964,889 fish/yr over 514 waters and 571,236 acres (pp. 4, 9), ≈ 4 fish/ha/yr [inf].
  - "50% of the desirable-size white perch could be harvested without harm" (p. 12).
  - Standing crop "cannot be estimated… because of inadequate data" (p. 9).
- **Region F (Penobscot region).** 94 waters and 150,834 acres. Ice fishing: 1.29 fish caught and 0.88 kept per angler-day (68 % kept). Open water: 1.90 caught per day (60 % kept) (Tables 1–2, pp. 5, 9).
- **The 25-fish limit (p. 11).** Imposed "on seven lakes in eastern Maine… as a result of a citizen petition and not for biological reasons". The 2002 meeting notes (p. 17) say Downeast anglers and guides feared over-harvest "for food, bear bait and sometimes just wasted".
- **"Unexplained disappearances of white perch populations"** is listed as a management problem (p. 15). The coldwater group ranked it first (p. 18).

**What it settles.**
- Confirms the sim's spawning temperature (15 °C), fecundity anchor (~22,000 at 15 cm), size at ~4 years (8–10 in, ~204 g) and the 5–7-yr typical life span.
- Gives a low angling harvest: F is a few percent.
- Does not give growth, mortality or density (row A04's "growth, length at age" is unmet here; Cooper supplies it).

---

## 3. MDIFW yellow perch file (`yellowperch.pdf`): not the management plan

**What it is.** A 2014 "Application to take yellow perch in the State of Maine" (commercial harvest permit, revised 2/14), with the trap-net and seine conditions and the list of lakes open to commercial yellow perch harvest. **It contains no biology and does not resolve row A13.**

**Facts that touch the sim.**
- Trap-net mesh ≤ 3/8-in bar, with escape slots so fish < 6 in can leave. Nets may be set from April 1 to the Friday before Memorial Day; seines from July 1 to December 31 (p. 2).
- Nearby lakes on the list (pp. 3–6):
  - Washington County: Big Greenland Pond and Sucker Lake in Danforth; Upper Oxbrook; Barrows; the Chain Lakes; Fifth Machias; Pickerel Pond (Topsfield);
  - Aroostook County: Skitacook Lake and Faulkner Lake (Weston).
- The Hot Brook lakes are not on the list. The list presumably marks waters with surplus perch [inf].

---

## 4. MDIFW *Black Bass Management Plan* (R. M. Jordan, Region C, 2001; `blackbass.pdf`)

**What it is.** A 39-page species plan: life history, history, regulations, angler-survey tables, goals and strategies.

**Key facts.**
- **The first winter (p. 2).** The northern limit of smallmouth "is based on whether first-year bass achieve adequate body size… to survive the approximately 200+ day starvation period… when water temperatures cooler than 50° F result in cessation of feeding and growth."
- **Maturity and fecundity (p. 2).**
  - Males mature at 3–4 yr and females at 4–5 yr, at 8–12 in.
  - Effective fecundity 2,000–3,000 eggs/lb against 7,000–8,000 eggs/lb in the ovary.
- **Spawning (pp. 2–3).**
  - Spawning runs mid-May to mid-June; nests are built above 55 °F; eggs are laid at 60–66 °F; eggs hatch in 5–8 days.
  - The male guards eggs and fry "for a few weeks".
  - Small drawdowns or cooling cause nest desertion. Late re-nests may not grow enough to survive the first winter.
- **Young-of-year (p. 3).** "Populations of young smallmouth bass typically reach average lengths of 2.2 - 2.9 inches [56–74 mm] by the end of their first growing season", fast ones 4 in. "Direct relationship between size and overwinter survival."
- **Eastern Maine (pp. 5, 20, 25).**
  - Abundant spawning habitat keeps populations "at high levels"; "highly abundant bass populations comprised primarily of fish from 8-13 inches".
  - Experimental angling in early June caught 6–14 bass per angler-hour in 1999–2000, against 1–5 earlier, "the result of increased recruitment… following 5 summers of above-average temperatures in a 6-year period". Biologists caught 25–60 bass in a 5-hour day.
- **Cool summers (pp. 24, 30, 36).** Cohort crashes followed cool summers in 1986, 1992 and 1996. "Heavy over-winter mortalities of bass fry produced during cool summers… potential for complete year-class failures" is ranked as a top management problem.
- **Stock (pp. 12–13, 20).**
  - Objective: bass > 10 in at 2.0 fish/acre and 2.3 lb/acre over usable habitat. Water deeper than ~30 ft counts as unusable, so all of Hot Brook counts. The plan says this was met statewide.
  - Southern US unmanaged waters average about 10 lb/acre of bass; Maine production is lower because of infertile waters and a short season.
- **Catch and harvest (pp. 13, 23–26, Tables 9–13).**
  - Eastern and northern Maine average 11 in and 0.6 lb.
  - Summer harvest is 3 % of the catch; winter 13 %.
  - Region F: 1.35 bass per angler-day in summer and 0.14 in winter; harvest 0.13 lb/acre/yr; harvested bass average 12.0 in and 1.2 lb.
  - "In… Washington and Hancock counties, bass are almost never caught by winter anglers."
  - Tagged bass were caught "multiple times over multiple years, indicating good survival" (p. 23).
- **Sampling (p. 20).** Bass are "not normally vulnerable to… trapnets", and have "a relatively small home range in relation to total lake size".
- **Regulations (pp. 11, 19).** The general minimum length is 10 in in Washington and Aroostook Counties.

**What it settles.**
- Confirms the sim's 208 days below 10 °C as the "200+ day" rule, its maturity sizes and ages, its fecundity, and young bass of 56–74 mm by autumn.
- Gives the bass/ha cross-check (§ "most important" 7).
- Says juvenile bass in Maine lakes lack significant predators.

---

## 5. MDIFW Black Bass Technical Work Group slides (J. Seiders, Nov 2019; `BassTechnicalWorkGroupNov2019.pdf`)

**What it is.** Twelve PowerPoint slides on history, sampling methods, regulations, tournaments and the 2016 angler survey. **There are no catch-per-hour, density or size-structure data.**

**Facts.**
- Smallmouth were introduced in the 1860s; neither bass species is raised in Maine hatcheries (slide 2).
- Sampling uses electrofishing, angling and creel surveys (slide 4).
- Northern Region: no size or bag limit (slide 5).
- Catch-and-release rules are "used where recruitment is severely limited… typically related to a lack of suitable habitat" (slide 6).
- Size bands: quality ≥ 14 in, trophy ≥ 20 in. Harvest is low: 2.6 % in open water, 10.3 % through the ice (slide 10).

**What it settles.** It confirms the low harvest already quoted in the notes. Row A12's hoped-for catch-per-hour and size structure are not in it. The bass plan (§ 4) supplies Maine angling catch rates instead.

---

## 6. Cooper (1941), MDIFW *Fish Survey Report No. 4*: Androscoggin and Kennebec lakes (`Fish Survey Report No. 4…pdf`)

**What it is.** G. P. Cooper's survey of 53 southern Maine lakes in 1940, published 10 Dec 1941. It covers water chemistry, plankton (H. A. Goodwin), bottom fauna, fishes, white perch food and growth (2,056 fish from 45 lakes, including 1938 collections and Pushaw Pond in Penobscot County), the food of 10 other species, maps and recommendations.

**The Hot Brook lakes, and Washington and Aroostook Counties, are not in it.** It covers only the Androscoggin and Kennebec drainages.

**The white perch's numbers and diet.**
- **Sampling (pp. 100–103).** Gill nets in 86 sets (1,869½ h) and seines in 45 hauls.
- **Gill-net totals:** white perch 1,627, sucker 388, yellow perch 226, pumpkinseed 117, bullhead 95, pickerel 78, golden shiner 73, smallmouth bass 66, redbreast 19, fallfish 7.
- **Seine totals:** yellow perch 1,181, golden shiner 799, sucker 694, pumpkinseed 414, fallfish 344, white perch 281, common shiner 203, bullhead 198, redbreast 177, smallmouth bass 82, pickerel 79, banded killifish 65, blacknose dace 3.
- [inf] By gill net, pumpkinseed are ~7 % and yellow perch ~14 % of the white perch count. In the shallows, young yellow perch outnumber young white perch about 4 to 1.
- **Where white perch are densest.** White perch were "more abundant in the shallow lakes" (pp. 25, 215). Per 24-h net set they numbered 128 at Sabattus, 105 at Cochnewagan, 80 at East and 62 at North (all shallow, unstratified lakes), against 7–46 in most deep lakes (Table XV, p. 150).
- **Diet (pp. 125–126; Tables XI–XII).** 1,252 fish ≥ 15 cm, summer 1940, 653 mL of food.
  - By volume: mayfly nymphs 44 % (all aquatic insects 60 %); fish 26 % (yellow perch 10.1 %, smelt 9.1 %, white perch 3.8 %, fallfish 0.9 %); crustaceans 12 % (water fleas 5.75 %, crayfish 4.0 %, amphipods 2.2 %); molluscs ~0, avoided even where common (p. 127).
  - Over 100,000 water fleas lead by number.
  - Over 20 lakes: 67 % bottom fauna, 26 % fish and 6 % plankton crustaceans by volume. The plankton share ranged 0–98 % by lake (Table XV, p. 150).
- **Growth (pp. 136–137, 151–152).** No relation to bottom-fauna density: the four fastest-growing lakes were among the poorest in bottom fauna. The best correlate was the share of fish in the diet. The fast-growing perch "had been supplementing their diet… with from 20 to 50 per cent fish" (p. 215).

**White perch age, growth and mortality (pp. 123–154; Table XIV, pp. 138–147).**
- **Selectivity.** The nets missed fish under ~120 mm SL (~6 in TL). "No first- or second-year fish"; only 9 in their third summer (p. 124).
- **Ages.** "Summer of life" includes the year of capture, so summer VI = age 5. Age frequency for summers III–XVII: 10, 236, 146, 326, 276, 254, 218, 161, 115, 42, 22, 14, 5, 1, 1 (p. 135). The oldest fish was 17 summers (Webb Lake, 12.3 in, 14.6 oz).
- **Average body (standard) length, summers VI–XIV:** 6.7, 7.1, 7.6, 8.0, 8.3, 8.7, 9.5, 9.8, 10.0 in. Weights: 4.7, 6.0, 7.3, 7.6, 8.5, 9.6, 12.9, 13.8, 13.6 oz (p. 136).
- **Young fish.** True body lengths at III–V "might be set at approximately 4, 5, and 6 inches" (p. 137).
- [inf] Converted at TL ≈ 1.22 × SL (from Table XIV): TL ≈ 12.4, 15.5, 18.6, 20.8 cm at ages 2–5, 25.7 cm at age 9 and 31 cm at age 13.
  - The sim's von Bertalanffy curve (`species.js`: 11, 15.8, 19.5, 22.2, 24.2 cm at ages 1–5) runs about a year ahead of Cooper's 1940 average.
  - It matches his faster lakes and MDIFW 2002 (8–10 in at ~4 yr). For example, East Pond (shallow): 16.8, 19.3, 20.1 cm at ages 3–5; Pushaw Pond: 17.0, 20.3, 21.3.
- **Stunted extremes.**
  - Sabattus: 6.4–6.7 in TL (16–17 cm) at ages 5–9, 1.7–2.0 oz.
  - Cochnewagan: a plateau at 9.5–10.4 in TL (≈ 25 cm) over ages 5–13.
  - Cooper: "growth was so slow in some lakes that it was requiring from 6 to 10 years for most fish to reach a length of 6 to 8 inches; after an age of ten years… a majority of the fish were either dying of old age or were being removed by fishermen" (p. 215).
- **Mortality.** "A decided drop in numbers… above a length of about 10 inches, indicating a considerable mortality among perch after this size" (p. 135). "Of those perch which reach a length of at least 6 inches, a considerable per cent live to be at least 8 to 10 years old, after which the rate of mortality increases greatly" (p. 136).
- **Slow growth, long life.** White perch "live longer in waters where they grow more slowly": the mean age was 7.6 in the 17 slow lakes against 6.9 in the 12 fast ones (p. 137).
- **Catch curves** [inf, from the age frequencies above; mine, not Cooper's]:

  | Fish | Ages 5–9 | Ages 9+ | Chapman–Robson from age 5 | Regression, ages 5–16 (fast lakes 5–13) |
  |---|---|---|---|---|
  | All 1,827 | Z 0.16, A 0.15 | Z 0.79, A 0.54 | A 0.31 | A 0.43 |
  | Gill net only | A 0.07 | A 0.54 | A 0.29 | A 0.42 |
  | 17 slow lakes | A 0.14 | A 0.53 | A 0.30 | A 0.42 |
  | 12 fast lakes | A 0.19 | A 0.40 (ages 9–13) | A 0.33 | A 0.33 |

  Caveats: lakes are pooled, it is one year's snapshot, and recruitment varies. Gill-net selectivity under-samples the young slow fish, so the ages 5–9 values are minimums.
- **Sex (pp. 153–154).** 856 males to 963 females (0.89:1). Females are 0.2–0.5 in longer at a given age (33 of 47 groups) and dominate past summer XII.
- **Growing season (p. 154).** Scale growth begins in the first or second week of July: no growth by June 28, annuli just formed July 11–13, and growth complete by early or mid-September. Adult growth is thus concentrated in July–August.
- **Spawning (p. 25).** "May and June", with "large spawning runs in the major inlet and outlet streams of some lakes". Wardens report eggs dropped "on gravel bottom in shallow water".
- **Winter movement (p. 122).** On 3 Feb 1940, Great Pond's outlet screen held white perch, "these migrating fish had been forced against the screen by the water current".

**The food of other fishes (pp. 155–163; Tables XVI–XIX).** All were gill-netted in summer, mostly adults over 6 in.

| Predator | n (with food) | TL | By volume |
|---|---|---|---|
| Smallmouth bass | 66 (36) | 8.5–21.3 in | **white perch 61.0 %**, yellow perch 14.1, pumpkinseed 2.1, fish remains 3.2 (fish 80 %); **crayfish 14.4**; insects 3.6; vegetation 1.7 |
| Chain pickerel | 110 (51) | 12.6–25.0 in | **white perch 54.7 %**, golden shiner 14.0, yellow perch 7.5, pickerel 6.2, fish remains 5.0, bullhead 4.5, smelt 3.0 (fish ≈ 95 %); tadpoles 4.4; **crayfish 0.5**; insects 0.2. By count: white perch 28 of 92 items, yellow perch 14 |
| Yellow perch | 231 (160) | 6.3–13.7 in | fish ≈ 46 % (white perch ~17, yellow perch ~11, one redbreast ~10, smelt ~2); mayfly 22; dragonfly 18; caddis 6; crayfish 3; pill clams 3 |
| Pumpkinseed | 66 (45) | 4.8–9.7 in | **snails 63 %** ("molar-like crushing teeth"); dragonfly nymphs next; all bottom fauna |
| White sucker | 28 (22) | 13–19 in | bottom fauna only |

- **Suckers as prey (pp. 216–217).** "We found no suckers in the stomachs of 1,757 White Perch, 66 Small-mouthed Bass, and 110 Common Pickerel." Cooper calls suckers direct competitors of white perch for bottom food.

**The other species (pp. 25, 109–121).**
- **Smallmouth bass.**
  - Bass "spawn on gravel shoals mostly in from 2 to 4 feet of water… mostly in June… require a water temperature above about 65° F".
  - Bass were "still on the spawning beds during the latter part of June", and females netted up to the first week of July still held ripe eggs (p. 213).
  - Young bass were scarce: 3.5 per hour of seining (pp. 105, 213).
  - Bass "avoid gill nets".
- **Pickerel.** "Best adapted to shallow, weedy lakes with mud bottom". Diet "almost entirely fish after it reaches a length of about 8 to 10 inches, and even small pickerel less than 5 inches long will feed on fish". Spawns "mostly in May in Maine, in shallow, weedy areas… or… quiet tributary streams". Netted fish were mostly ~2 lb, up to 3½ lb.
- **Yellow perch.** Young in the shallows, adults deeper in summer. Spawns "probably during May". Usually smaller than white perch, commonly infested with grubs. Young yellow perch are "a very important food item" of game fish.
- **Pumpkinseed and redbreast.** Pumpkinseed came from more waters than any other species, and fish of 8–10 in were common in the gill nets. Redbreast are less abundant. There were 13 hybrids.
- **White sucker.** The second most abundant species; 1–2 lb.
- **Bullhead.** Reaches ~1 ft.
- **Banded killifish.** Maximum ~3 in; "typically a lake fish, being found mostly on extensive lake shallows", in "large lakes with extensive wave-swept shallows".
- **Blacknose dace.** "Typically a stream fish"; taken in one lake only.
- **Fallfish.** The second commonest minnow; 1–2-lb fish in the gill nets.
- **Crayfish.** "Generally rare in Maine" (p. 25).

**Water, plankton and the bed.**
- **Shallow lakes.** Eight shallow lakes held warm water to the bottom all summer. East Pond and Cochnewagan had "quite uniform vertical distribution of temperature, dissolved oxygen, and pH from the surface to the bottom… very little seasonal change in dissolved oxygen or pH" (pp. 36–37, 66–67).
- **Plants and dams (p. 33).** Aquatic vegetation was "generally very scanty", mostly emergent, and concentrated "in some of the sluggish waterways running between ponds, or… around inlets and outlets". Many lakes have no outlet dams.
- **Plankton (Table V, p. 81).** Average over 53 lakes, August 1940, 0–15 ft: settled volume 0.73 mL/ft³; copepods 613/ft³, cladocerans 271/ft³, rotifers ~7,000/ft³.
  - Below 15 ft the volume falls to 0.08–0.19 mL/ft³.
  - Cyclops outnumber Diaptomus. Bosmina and Daphnia are the commonest cladocerans (pp. 77–78).
- **Bottom fauna (pp. 82–97).** 809 Ekman grabs (9 × 9 in; No. 20/40 sieves; large clams excluded).
  - All lakes: 31.1 animals and 0.34 mL per ft² (≈ 335/m², ≈ 3.7 mL/m² [inf]).
  - Shallow lakes with no thermocline: 0.267 mL and 13.0 animals per grab (≈ 5.1 mL/m² and ~250/m² [inf]). The animals there were larger (dragonfly and mayfly nymphs) than in deep lakes.
  - Bottom fauna and surface plankton were uncorrelated (r ≈ 0.02–0.06, p. 98).

**What it settles or changes.** It resolves row A05. Its effects on the sim are ranked items 1, 3, 5, 8 and 9 above. It also confirms the habitat notes for killifish, dace and fallfish and the pumpkinseed's switch to snails (`Lsnail`).

---

## 7. Warner (1973), "Spring food of chain pickerel (*Esox niger*) in Maine lakes", *TAFS* 102:149–151 (`tafs_102_1_tafs0149.pdf.gif`)

**What it is.** A 644 × 951 GIF of **p. 149 only**. The top of the page is the end of a cui-ui paper; Warner's note starts in the right column.

**Content.**
- The introduction cites Kendall (1917), Hunter & Rankin (1939), Foote & Blake (1945) and Wich (1958): pickerel are fish-eaters except the very young, which eat insects and crustaceans.
- "Food habits of pickerel in Maine waters have been studied by **Cooper (1941), Fuller and Cooper (1946), and Barr (1962)**."
- Pickerel predation on newly stocked salmonids was reported by **Warner et al. (1968)**.
- Purpose: food of pickerel "collected from Maine lakes in the spring, over a period of about 1 month from ice-out".

**There are no data on this page: no prey species, percentages, sizes or sample sizes.**

**What it settles.**
- Row A01 is only partly met. Pages 150–151 are still needed.
- It names three more Maine pickerel-diet sources: Fuller & Cooper 1946 (probably the next Fish Survey Report), Barr 1962, and Warner et al. 1968.
- Cooper 1941, now read, supplies the summer diet (§ 6).

---

## 8. `2491-36-10.pdf`: Rupp & DeRoche (1965) inside a course reader

**What it is.** An 86-page reader from the Robert Behnke archive (Montana State University).
- PDF pp. 1–19: **Rupp, R. S. & S. E. DeRoche 1965. "Standing crops of fishes in three small lakes compared with C14 estimates of net primary productivity." *TAFS* 94:9–25.**
- The rest, irrelevant to the sim: Swingle (Alabama pond culture); Goldman 1968 (aquatic primary production, *Am. Zool.* 8:31–42); Slobodkin 1968 ("How to be a predator"); Odum 1968 (energy flow review); Hutchinson 1967 (*Treatise* II, pp. 231–232); Deevey (diversity in fossil assemblages); Handler 1970 (ch. 11 excerpt); Marty (USSR, fisheries effects on stocks); Edmondson (a note on eutrophication).

**Method (pp. 9–13).** Rotenone, then four kinds of count: shoreline pickup of floating fish; snorkel pickup in shallow water; SCUBA transects of the fish that sank in deep water; and surface collection.
- At Shagg Lake **40 % by weight and 52 % by number sank** in water over 10 ft (p. 15). Smelts mostly sank; suckers and pickerel mostly floated (Tables 4 and 7). Surface-only rotenone counts therefore roughly halve the true crop.
- The 90 % confidence limits are about ±24 % at Coleback and Hills. The Shagg figure is a minimum (p. 21).

**The lakes (Table 1, p. 10; Table 12, p. 23).**

| Lake | Area | Mean / max depth | Water | Treated | Fish / ha | kg / ha |
|---|---|---|---|---|---|---|
| Shagg (Oxford Co.) | 55 ac | 19 / 40 ft | clear; alkalinity 1–4; pH 6.1–7.9 | 9 Sep 1957 | 3,232 | **44.5** (minimum) |
| **Coleback (Washington Co.)** | 20 ac | 17 / 28 ft | light brown; alkalinity 7; pH 6.3–6.9; 70 °F at the surface | 3 Sep 1958 | 14,011 | **117.1** |
| Hills (Franklin Co.) | 19 ac | 17 / 31 ft | clear | 3 Oct 1961 | 7,075 | **70.1** |

**By species** [inf: per-ha conversions of Tables 4, 7 and 10, pp. 16–20]:
- **Shagg.**
  - Smelt 2,725/ha, 9.9 kg/ha.
  - White sucker 275/ha, 24.5 kg/ha (mean 89 g).
  - Bullhead 149/ha, 5.1 kg/ha. This is an underestimate: divers saw bullheads that "had burrowed into the bottom silt as they died".
  - **Chain pickerel 83/ha, 4.1 kg/ha** (mean 49 g).
  - White perch 8/ha, 1.2 kg/ha, a recent illegal introduction (9–11-in adults and 1–4-in young).
  - One smallmouth bass.
- **Coleback.**
  - Smelt 7,108/ha, 7.9 kg/ha (mean 1.1 g; none over 5 in).
  - **Pumpkinseed 6,385/ha, 14.9 kg/ha** (mean 2.3 g: "the huge number of young-of-the-year"; none over 7 in).
  - **Eel 204/ha, 47.6 kg/ha (41 % of the weight)**.
  - **Chain pickerel 175/ha, 8.4 kg/ha** (mean 48 g).
  - White sucker 236/ha, 38.4 kg/ha (mean 163 g).
- **Hills.**
  - Smelt 3,398/ha, 40.5 kg/ha.
  - Bullhead 709/ha, 24.3 kg/ha (mean 34 g).
  - Redbelly dace 2,836/ha, 5.0 kg/ha.
  - **Blacknose dace 131/ha, 0.24 kg/ha** (mean 1.8 g; 4.4 % of the dace).
  - 5 brook trout.
- **Productivity.** C-14 net primary productivity was 1.9–7.0 mg C/m²/h. The authors judge the method "too crude" for Maine's soft waters, where an alkalinity error of 2.5 ppm nearly doubles the estimate (pp. 22–23).

**What it settles or changes.** It resolves row A14 and is the only Maine kg/ha.
- These are small, deeper, soft-water "potential trout lakes", likely less productive than Hot Brook. Even so, a whole-community total of ~50–120 kg/ha is the best Maine target [inf].
- The pickerel's 4–8 kg/ha supports the upper end of the project's 2–6 kg/ha band. The sim's ~25/ha at ~2–3 kg/ha sits at or below it.
- Pumpkinseed can reach ~15 kg/ha in a Washington County lake, against the sim's 1–1.7. Coleback, however, had no white perch, yellow perch or bass.
- Eels can dominate the biomass of an eastern Maine lake that eels can reach. Eels are not on the 1949 Hot Brook list.

---

## 9. Dudley & Trial (2014), USGS SIR 2014-5164: young-of-year smallmouth bass in Spednic Lake, 1970–2008 (`sir2014-5164.pdf`)

**What it is.** A 26-page USGS report.
- Spednic Lake is 6,970 ha on the St. Croix River in Washington County. A dam at Vanceboro controls a 4.38-m range.
- Daily lake surface temperatures are estimated from Vanceboro air temperatures, validated at Big Lake (±0.6 °C) and Grand Falls Flowage.
- These drive Shuter et al.'s (1980) model of smallmouth spawning, nest mortality, growth and first-winter survival.

**Equations (pp. 4–6; Tables 1–2; Fig. 2).**
- **Spawning trigger.** Daily mean T > 15 °C and ≤ 27 °C, with degree-days above 10 °C between 10 and 150. Spawning is delayed by SD = 8.0 − 0.055·DD days if SD > 0.
- **Nest mortality.** Based on Tmin over spawning date + 15 days:
  - Tmin < 10 or > 30 °C: p = 1;
  - Tmin 10–15 °C: p = 3.0 − 0.2·Tmin;
  - Tmin 15–27 °C: p = 0;
  - Tmin 27–30 °C: p = 0.33·Tmin − 9.
- **Daily growth increment (mm/d).**
  - T < 14.2 or > 35 °C: 0;
  - 14.2–25.5 °C: 0.12·T − 1.7;
  - 25.5–31.5 °C: 1.4;
  - 31.5–35 °C: 14 − 0.4·T.
  - Length L = Σ DGI + 9.1 mm (size at rise from the nest).
- **Winter.** WD runs from the autumn day below 10 °C to the spring day at or above 10 °C.
  - Cmax = 0.3375·WD + 22.083 and Cmin = 0.1938·WD + 7.917 (mm).
  - p(winter death) = 0 if L > Cmax, 1 if L < Cmin, else (Cmax − L)/(Cmax − Cmin).
  - These lengths are temperature-only maximums and ignore food.

**Results (pp. 7–10; Tables 3–5).**
- **Spawning.** Starts May 22–June 4 (median May 28) and ends June 6–13 (median June 10). The window lasts 12 days (8–18).
- **Nest mortality.** Above 0 in 20 of 39 years, above 10 % in 17, above 30 % in 6 (maximum 56 % in 1994). All of it falls on the earliest spawners.
- **Modelled autumn lengths.** 92.4 ± 1.4 mm for early spawners and 83.8 ± 2.8 mm for late ones.
- **Measured young bass were smaller than modelled:**
  - 73.0 mm (n 24, range 63–97) on 1 Sep 1988;
  - 70.7–76.3 mm (n 7–21) on 3 Oct 1995.
- **Winter.** WD averaged **208 ± 4 days**. Cmin averaged 48.3 mm and Cmax 92.4 mm.
  - Modelled winter mortality was 1–20 % for early spawners and 19–41 % for late ones.
  - At the measured 71–76 mm, the same formula gives 36–49 % [inf].
- **Weak year classes.** 1986 and 1996 were confirmed across the region (age 4–5 under 15 % of a 100-fish sample). 1994 and 2004 are also flagged.
- **Context (p. 1).** The Spednic bass fishery collapsed in the early 1980s. An alewife increase was one suspected cause; alewives were blocked in 1988 and 1995.

**What it settles.**
- Resolves row A15.
- Confirms the sim's 208 days below 10 °C (an exact match) and its 9.1-mm swim-up.
- Supplies the size-dependent first-winter survival that stage R needs for bass, with Maine parameters. It covers in part what row A10 (Shuter et al. 1989) was wanted for.

---

## 10. Baker, Olem, Creager, Marcus & Parkhurst (1993), *Fish and Fisheries Management in Lakes and Reservoirs*, EPA-841-R-93-002 (`Fish and Fisheries Management in Lakes and Resevoirs.txt`)

**What it is.** A general US EPA/Terrene Institute technical supplement to the *Lake and Reservoir Restoration Guidance Manual*. It is not Maine-specific; one reference is MDIFW 1986 on pickerel.

**Useful facts.**
- **Spawning temperatures (p. 36, Table 3-3; pp. 230, 236, 238).**
  - Yellow perch 45–55 °F (7–13 °C), on vegetation, brush or fallen trees.
  - Chain pickerel 47–52 °F (8–11 °C), "usually 3 to 10 feet" deep over flooded vegetation, shortly after ice-out.
  - Smallmouth begin at 55–60 °F and peak at 61–65 °F. Nests are "usually… 1 to 4 feet but can occur as deep as 15 feet", deeper where the water is clearer.
- **Temperature preferences (pp. 230–232, 238).** Smallmouth prefer the low 70s °F. Chain pickerel prefer summers of 70–86 °F (21–30 °C). Largemouth feeding is "restricted below 50 °F".
- **Diet shifts.** Esocids are piscivorous after ~1.5 in (p. 238); bass at ~4 in (p. 230).
- **Planktivores and Daphnia (pp. 162–163).** Critical planktivore biomass, above which large *Daphnia* cannot develop, is "20 to 1,000 kg/ha" (Benndorf 1990). Age-0 yellow perch are the most efficient planktivores and have the lowest threshold. For top-down control, piscivores should make up "30 to 40 percent of the total fish biomass".
- **Oneida Lake (p. 165, Mills et al. 1987).** "In years when the density of age 0+ yellow perch exceeds 14,000/ha in August, *Daphnia pulex* disappears." Chlorophyll then nearly doubles. Walleye and adult yellow perch control young perch numbers once the young reach ~18 mm.
- **Yield and standing crop (pp. 51, 189–191).** Ryder's morphoedaphic index uses TDS and mean depth. Yield: log Y = 0.168 + 0.446 log MEI. Reservoir standing crop (Jenkins 1982): log C = 1.498 + 0.677 log MEI − 0.223 (log MEI)².
  - [inf] For Hot Brook, conductivity 22–30 µS/cm (analogue lakes) gives TDS ≈ 15–20 mg/L; with a mean depth of ~3 m, MEI ≈ 6. That predicts yield ≈ 3 kg/ha/yr and standing crop ≈ 75 kg/ha.
  - This is a crude reservoir regression, but it agrees with Rupp & DeRoche's 45–117 kg/ha.
- **Stunting.** Yellow perch problems "generally relate to overcrowding" (p. 237). Sunfish "overpopulate and stunt if the numbers of small fish are not adequately controlled by predators" (p. 232).

**What it settles.** No blocked-list row. It gives secondary support to the total-biomass cap and to modelling the zooplankton crash as a young-of-year effect.

---

## 11. `noaa_2897_DS1.pdf`: not relevant

**What it is.** Able, K. W. & S. C. Kaiser (May 1994), *Synthesis of Summer Flounder Habitat Parameters*, NOAA Coastal Ocean Program Decision Analysis Series No. 1 (161 pp.). It covers a marine and estuarine flatfish. **Nothing in it bears on the Hot Brook sim, and it matches no blocked-list row.** It was perhaps fetched by mistake.

---

## How the fetched facts compare with the project

| Project claim or setting | Fetched evidence | Verdict |
|---|---|---|
| White perch adult A ≈ 0.50–0.56 "from Cooper" (white_perch_regulation.md §0–1; blocked row A05); sim target A 0.45–0.55 against the sim's ~0.30 | Cooper gives no rate. His age data give A ≈ 0.15–0.35 at ages 5–9 and ≈ 0.5 from age 9; ≈ 0.31 (Chapman–Robson) to 0.43 (regression) pooled from age 5 | **Contradicts the attribution.** The sim's 0.30 is within Maine's 1940 range. Use an age-rising adult M; put the regulation in the young and the first winter |
| White perch 31 → 61 kg/ha in sim year 1; research target 15–35 kg/ha | Maine whole-community totals of 45–117 kg/ha (Rupp & DeRoche); EPA's MEI regression ≈ 75 kg/ha [inf] | **Confirms the target and contradicts the sim.** 61 kg/ha of one species exceeds most Maine totals |
| Yellow perch 19.5 → 36 kg/ha in the sim | No Maine yellow perch kg/ha in the fetched files. Cooper's gill nets: yellow perch 14 % of white perch by count; young yellow perch dominate the shallows; adults small and grubby | **Not settled.** 36 kg/ha alongside 61 of white perch is implausible against a ~50–120 kg/ha total [inf] |
| Pickerel diet: fish 65–85 %, crayfish 10–30 %, small white perch 5–15 % (predator_diets_and_prey_mortality.md) | Cooper, Maine summer adults: fish ~95 %, white perch 55 %, yellow perch 7.5 %, crayfish 0.5 %, insects 0.2 % | **Contradicts** the crayfish share and the white perch share, at least for adults ≥ 32 cm in white-perch lakes. Warner's spring data are still missing |
| Smallmouth diet in Hot Brook-like lakes: crayfish 35–55 %, fish 35–50 %; "no quantitative Maine adult smallmouth diet" | Cooper: fish 80 % (white perch 61 %), crayfish 14 %, n = 36 with food | **Contradicts the crayfish share; fills the gap** (small n; crayfish "generally rare in Maine" then) |
| Pickerel ~25/ha at ~2–3 kg/ha; research band 15–40/ha and 2–6 kg/ha | Maine: 83 and 175/ha (all sizes, September, mean ~48 g), 4.1 and 8.4 kg/ha | **The sim is low**; the band's upper half is supported |
| Pumpkinseed 1.0–1.7 kg/ha in the sim | 14.9 kg/ha in Coleback (a Washington County lake without perch or bass); pumpkinseed found in more lakes than any other species (Cooper) | **The sim is low** (the analogue is imperfect) |
| White sucker ~19 kg/ha (sim year 3) | 24.5 and 38.4 kg/ha (Rupp & DeRoche) | **Plausible to slightly low** |
| Bass 9–11 kg/ha (sim) | Maine objective of 2.6 kg/ha for fish > 25 cm; southern US unmanaged ~11 kg/ha; eastern Maine bass very abundant but small (8–13 in) | **Probably high for Maine;** check against the > 25-cm fraction |
| 208 days below 10 °C (`SEASON`) | Spednic WD 208 ± 4; MDIFW "200+ day starvation period" | **Confirmed** |
| Bass swim-up 9.1 mm; young bass 56–76 mm by autumn | Shuter 9.1 mm; MDIFW 2.2–2.9 in; Spednic 71–76 mm | **Confirmed;** size-dependent winter death is now codeable (§ 9) |
| Bass maturity: ♂ 23 / ♀ 27 cm at 3–4 / 4–5 yr; effective fecundity ~⅓ of the ovary | MDIFW: 8–12 in; ♂ 3–4, ♀ 4–5 yr; 2,000–3,000 against 7,000–8,000 eggs/lb | **Confirmed** |
| White perch spawning at 15 °C; ~22,000 eggs at 15 cm; life span 5–7 yr; 8–10 in ≈ 204 g at ~4 yr | MDIFW 2002 says the same | **Confirmed.** Cooper's 1940 fish were slower and older (8–10 in at 5–9 yr, ages to 17) |
| White perch eat zooplankton up to 40 cm (`Lzoo` 40) | Adults ≥ 15 cm: ~6 % plankton crustaceans by volume overall (0–98 % by lake); 67 % bed animals; fast growth needs fish | **Probably too planktivorous for adults** [inf]. Test in stage R |
| Adult white perch growth season (temperature-driven FB4) | Scale growth only from early July to early September in southern Maine, 1940 | **A check to run:** does the sim grow adults in May–June? |
| Benthos `CAP` 15 g/m² (littoral 5–20) | Cooper, August Ekman grabs: shallow lakes ≈ 5 g/m², all lakes ≈ 3.7 g/m² (sieve losses; large clams excluded) | **The low end;** consistent with a refuge-limited, fish-cropped bed |
| Summer crustacean zooplankton field target ~60–100 µg/L; sim year 1 500–970 µg/L | Cooper: ≈ 31 crustaceans/L in August, 0–15 ft (≈ 90 µg/L [inf]) | **Confirms the field target;** the sim's year 1 is ~5–10× too rich |
| The 1949 sheets' "75 feet – 71 °F" | Printed so in the scan; a source typo | **Resolved** |
| An outlet dam? | The sheets don't mention one | **Still unknown** (silence is not absence) |
| Pumpkinseed in Upper | Not on the 1949/1965/2004 sheets; listed in *Lake Fish of Maine* | Unchanged: no netting effort is given |
| The brook: 154 m, rocky | "Short (1/8 mile) non-navigable… rocky and hard bottomed"; boats walked through | **Confirmed** |
| Smallmouth crayfish-heavy in "rocky" lakes | Cooper: "crayfish are generally rare in Maine" (1941); 1 crayfish in 809 grabs | **A caution.** Hot Brook's crayfish density is unknown; it should not be assumed high |

## Blocked-list rows these files resolve

| Row | File | Status |
|---|---|---|
| A01 Warner 1973 | `tafs_102_1_tafs0149.pdf.gif` | **Partly.** Only p. 149 (the introduction) arrived; pp. 150–151 (the data) are still needed |
| A03 Hot Brook survey sheets | `hot_brook_lake_upper.pdf`, `hot_brook_lake_lower.pdf` | **Fetched ✓.** Netting effort and the dam question are not on the sheets (data request D1 remains) |
| A04 White Perch Plan 2002 | `whiteperch.pdf` | **Fetched ✓.** It has no growth or length-at-age data |
| A05 Cooper 1941 | `Fish Survey Report No. 4…pdf` | **Fetched ✓** (growth tables and age frequencies; no explicit mortality rate) |
| A11 Black Bass Plan 2001 | `blackbass.pdf` | **Fetched ✓** |
| A12 BTWG slides 2019 | `BassTechnicalWorkGroupNov2019.pdf` | **Fetched ✓.** It has no catch per hour or size structure |
| A13 yellow perch plan | `yellowperch.pdf` | **Not resolved.** The file is the 2014 commercial-harvest permit application |
| A14 Rupp & DeRoche 1965 | `2491-36-10.pdf` (PDF pp. 1–19) | **Fetched ✓** |
| A15 Dudley & Trial 2014 | `sir2014-5164.pdf` | **Fetched ✓** |
| (none) | EPA 1993 manual (TXT); NOAA summer flounder synthesis | Background only; no row |

**New leads named in these files:**
- Fuller & Cooper 1946 and Barr 1962 (Maine pickerel food); Warner et al. 1968 (pickerel predation on stocked salmonids); Jordan 1988 (MDIFW Progress Report 1, growth of age-0 smallmouth in nine eastern Maine lakes); Dill et al. 2010 (St. Croix bass year-class strength).
- Shuter et al. 1980, *TAFS* 109:1–34: the source of § 9's equations.
