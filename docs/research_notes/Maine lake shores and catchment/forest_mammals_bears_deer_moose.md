# Forest mammals at the lakes: black bear, white-tailed deer, moose

For `src/w3/forest3.js` (config `FOREST3`): the individual bears, deer and moose on the land around the Hot Brook lakes, their
numbers, ranges, seasons and days, and what they do to the lakes. Written 2026-10-22. It extends
`docs/research_notes/Hot Brook populations and water/birds_mammals_people_evidence.md` §"Bears, deer and moose at the water",
whose values are reused here and not repeated in full.

**Tags:**
- [primary] = read from the paper or the agency's own page;
- [abstract] = read from an abstract or a journal's summary;
- [secondary] = read from a search-engine summary, a news item or a review quoting the source (not the source itself);
- [gk] = general knowledge of the field, not fetched this session;
- [inf] = my inference from the cited numbers.

**Fetching this session:** maine.gov PDFs return 403 (not bypassed); the Alces journal pages 404. Two Maine legislature moose
reports (2012, 2014) were read with `pdftotext` from WebFetch's automatic copies outside the repository: they hold no density by
district. Web search was used five times. Nothing was saved into the repository.

**Where the lakes are:** Wildlife Management District **11** (the WMD layer, earlier note). The neighbouring Downeast districts
18 and 19 are given for range.

## 1. Numbers on the land

### Black bear
- Maine: ~27,000 bears, "may be conservative" (MDIFW's Randy Cross, Northern Woodlands) [secondary]; 24,000–36,000 in MDIFW's
  recent range (earlier note) [secondary]; bears occupy ~85 % of the state (Portland library news item, via search) [secondary].
- "About one bear per square mile" (~0.4 /km²) where bears live (Maine Times 1996, via search) [secondary].
- Check [inf]: 27,000 ÷ (0.85 × 79,900 km²) = **0.40 /km²**; 36,000 → 0.53.
- Harvest density is highest in parts of northern, western and **eastern** Maine: 23–33 bears killed per 100 mi² of forest in
  WMDs 3, 6, 12 and 28 (2024 MDIFW harvest report, via search) [secondary].
- Elsewhere in the Northeast (hair-snare spatial capture–recapture): northern New York 0.20 /km², southern New York 0.137 /km²
  [abstract].
- **Used: 0.4 independent bears per km² of land** [inf]; cubs and yearlings ride with their mothers (`young`). Field range for
  the gate: 0.2–0.6 /km².

### White-tailed deer
- MDIFW's density table (LD 1569 §3 goals, via search) [secondary], post-hunt deer per mi²:
  - WMDs 1–11 (with **WMD 11**): current **2–6**, short-term objective 2–8, long-term 10;
  - WMDs 12–14 and 18: current 4–9;
  - WMDs 19, 27, 28: current 3–8.
- Deer in northern and Downeast Maine are below the desired density because of poor habitat and hard winters (MDIFW, via search;
  earlier note) [secondary].
- **Used: 1.5 adult deer per km²** (4 /mi², the middle of WMD 11's 2–6) [inf]; fawns ride with does. Field range for the gate:
  0.8–3.5 /km² (2–9 /mi²).

### Moose
- Northern Maine's double-count helicopter surveys: **0.4–4.0 moose/km²** across nine WMDs (Kantar & Cumberland 2013, *Alces*
  49) [abstract]. WMDs 11 and 19 were flown in 2011–12 (MDIFW report to the legislature, 2012) [primary], but no district's figure
  was found.
- WMD 11 is a "compromise zone" with fewer moose; its permits were cut after the 2012 census (Press Herald 2012) [secondary]. An
  older MDIFW browse-based capacity of ~0.9 /km² (snippet, unverified) [secondary]. Danforth's harvest fell from 9 a year
  (2009–10) to 0–1 (2019–25), permit-driven (earlier note).
- **Used: 0.6 moose per km²** [inf: the low end of the northern range, below the 0.9 capacity]; calves ride with cows. Field
  range for the gate: 0.4–1.5 /km².

### How the counts apply to the sim's worlds [inf]
- Each world counts its animals over the **real land its grid holds**: the land cells' area ÷ `GEO.SCALE²`.
  - True world: 9.3 km² of land → 4 bears, 14 deer, 6 moose.
  - 1/10 world (a wider re-cut placement): 15.6 km² real → 6 bears, 23 deer, 9 moose.
- What they do to the lakes is scaled like every other consumer: × the world's share of the real lakes' area
  (`fa = world lake ha ÷ 643.6`; 1 at true scale, ~0.01 at 1/10), as `WILD3`'s rows and `PL3.MOOSE` are.
- A home range's radius is × `GEO.SCALE` (as the lakes' widths). Walking speeds stay real, as the fish's do.

## 2. Ranges and movement

| | Home range | Walk | Daily travel |
|---|---|---|---|
| Bear | adult female **6–9 mi² (15.5–23 km²)**; young males up to **100 mi²** (Northern Woodlands, MDIFW's study areas incl. Beddington, Washington Co.) [secondary] | ~1.0 m/s [gk] | 2–8 km [gk] |
| Deer | summer ~1–2 km² [gk]; a yard's winter range a few tenths of a km² [gk]; DWAs 50–12,000 acres (via search) [secondary] | ~1.2 m/s [gk] | 1–3 km [gk] |
| Moose | summer **2–5 km² (1–10)** (earlier note) [secondary]; winter smaller [gk] | ~1.3 m/s [gk] | 1–2 km in summer [gk] |

**Used:** bear female 20 km², male 100 km²; deer summer 1.5 km², yard 0.4 km²; moose summer 3.5 km², winter 1.5 km² [inf].
Foraging moves slowly: deer and moose ~0.05–0.15 m/s, a bear ~0.2 m/s [gk].

## 3. Seasons and the day

### Black bear
- Dens mid-October to late November; emergence in **late April**; most are active **April 1 to November 1** (MDIFW species sheet,
  via search; earlier note) [secondary].
- Pregnant females den first, males last; males emerge first, females with newborn cubs last [gk]. **Used:** entry 15 Oct–25 Nov
  (females from 15 Oct, males from 1 Nov); emergence males 1–21 Apr, lone females 10–30 Apr, with new cubs 25 Apr–10 May [inf].
- Cubs are born in the den in January–February, litters of 2–3 [gk]. They stay with their mothers for **16 months**; survival to
  age one is 10–60 %, to age two ~90 % (Northern Woodlands) [secondary]. So a breeding female has cubs every other year, and the
  yearlings leave her in June [gk]. **Used:** litter 1–3 (mean ~2.3), the cubs' first-year survival ~0.5 [inf].
- Foods: spring is the leanest season — grasses, sedges, skunk cabbage at wetland edges, ants, last year's mast, fawns in late May
  and June (BDN 2025; bear.org) [secondary]; midsummer raspberries; fall black cherry, beech nuts, acorns (Northern Woodlands)
  [secondary]. Animal matter < 10 % of the year's diet (North American Bear Center) [secondary].
- The day: mostly by day and at twilight in spring and summer, resting at night; longer feeding days in the fall [gk].

### White-tailed deer
- Crepuscular: feeding peaks at dawn and dusk, bedded in cover through much of the day, some feeding at night [gk; Beier &
  McCullough 1990].
- Fawns are born late May to mid June, ~1.5–1.8 per adult doe, one for a yearling [gk].
- **Deer wintering areas (MDIFW's definition, via search)** [secondary]:
  - deer use them when snow is **> 12 in (30 cm)** in the open or in hardwoods, deer sink > 8 in, and the mean daily temperature
    is < 32 °F;
  - softwood stands of fir, spruce, cedar or hemlock with high crown closure; dense conifer cover holds up to 40 % less snow;
  - movements become restricted at ~18 in (46 cm).
- Two mapped DWAs near the lakes: 040087 (~1,640 ha) from ~1.4 km east of Upper, and 100235 (~143 ha) ~2–3 km NE of Lower's outlet
  (earlier note, the MDIFW GIS layer) [primary].
- **Used:** a deer goes to its yard (the densest softwood near it — evergreen and wooded-swamp cover) once the snow passes 30 cm
  and leaves when it is below 15 cm [inf: the hysteresis]. The snow is the catchment's (env3 `swe` ÷ 300 kg/m³ with
  `WEATHER3.HYDRO`; else a calendar curve from the Caribou–Houlton normals: none until ~20 Nov, 30 cm by New Year, 50 by 1 March,
  bare by ~20 April — weather_and_catchment_hydrology.md §1) [inf].

### Moose
- Aquatic feeding on **108 of a 124-day summer**, peaking in midsummer; mostly nocturnal in summer, with a separate
  **late-afternoon aquatic peak**; cows feed in water 1.65–1.93× as often as bulls (Belovsky & Jordan 1978; earlier note)
  [primary].
- An adult crops **868 g dry a day** of aquatics, **20.3 g dry a minute under water**, in dives of **16.2 s** [primary]. So ~43 min
  of cropping a day [inf]; with the surface time between dives, ~2–3 h in the water [inf].
- Calving mid-May to early June, mostly single calves [gk]; Maine's calves are hit by winter ticks in late winter [gk].
- In winter in mixed and conifer cover, moving little [gk].

## 4. What they do to the lakes

### Bears and the sucker run
- No study quantifies black bears eating suckers (earlier note). Near Ely, bears eat **no fish unless they live by a stream
  where white suckers spawn in spring**, and they skip non-spawning fish (North American Bear Center) [secondary]. They are not
  agile hunters of dodging prey (same) [secondary].
- Analogue: on Haida Gwaii, black bears took **~700 salmon a bear over a 45-day run** (~15 a day, a superabundant run, half of
  each carcass left in the forest; Reimchen, via an advocacy write-up) [secondary], and caught more **in the dark** than by day
  (Reimchen's observations) [secondary].
- Energetics [inf]:
  - a spring bear of 70–100 kg spends ~16–23 MJ a day (2–3 × Kleiber's 293 kJ·kg^0.75);
  - a white sucker holds ~5 kJ/g wet;
  - meeting half that from suckers is 1.6–2.4 kg, **2–3 suckers a day**;
  - over a 1–3-week run that is ~15–60 suckers a bear, inside the earlier note's "a few to some tens" (an order of magnitude).
- **Used:**
  - A bear whose range holds the brook "attends the run" while the brook is in the suckers' spawning water (the sim's own
    `SP.sucker.spawnT`, 10–15 °C, in spring). Field onset is ~7–10 °C, early to mid May here.
  - It fishes the brook's riffles at dusk, through the night and at dawn, in bouts of 40–90 min (~3 h a day), catching
    **0.6 kg an hour of fishing** when the fish are many [inf]. That is ~1.8 kg, ~2–3 suckers, a day.
  - Through `WILD3.bear` (fish3): the fishing bears' demand, Holling II on the fish it can reach (K a day's need): suckers (and
    spawning fallfish at half the preference) ≥ 20 cm, in the **brook** only, within 0.4–0.8 m of water.
  - Most of a run's N and P stays in the brook as excretion and eggs (Childress et al. 2014, earlier note), so the fish the bears
    carry off are a small export: the wildlife's take leaves the lakes, as WILD3's does.

### Deer at the water's edge
- Deer eat aquatic plants in **late spring and early summer**, most when water is low (Rogers, Mooty & Dawson 1981, USDA FS GTR
  NC-65) [primary].
- In NE Minnesota (Hennings 1977, in the same), in order of use: bur-reeds, filamentous algae, ribbonleaf pondweed, water
  horsetail, arrowhead, sedges, marsh cinquefoil, white and yellow pond lily, watershield, St John's-wort [primary]. The share of
  the diet is "unknown but probably low" [primary].
- Deer eat ~1.5–2 kg dry a day [gk]. No percentage was found this session (one search).
- **Used:**
  - Late May to early August [inf: "late spring and early summer"], a deer's dawn or dusk feeding bout may be at the shore (most
    likely in that window).
  - It crops the edge's emergent and floating plants within reach (water ≤ 0.5 m, the columns beside it) at **4 g dry a minute**
    [inf: a deer's forb intake rate] for 15–40 min.
  - With ~1 shore visit in 3 days that is a few % of its intake, "probably low" [inf].
  - Its dung falls on land (~13 pellet groups a day, earlier note [gk]), so the plants' N and P leave the lakes (chem3's ledger,
    as the moose's).
- Drinking: deer drink once or twice a day in summer, a few litres [gk]. Tens of litres a day for all the lakes' deer are nothing
  beside the through-flow (~10⁵ m³ a day), so drinking is behaviour only: they come to the water.

### Moose in the shallows
- E13 (`PL3.MOOSE`, plants3) already takes the moose's aquatic food: 15 moose using the lakes, 868 g dry a day in June to
  mid-September, ashore.
- The forest's moose **wade where that take falls**: each bout's spot is drawn from the same weights (the shoots × the moose's
  preference × the depth reach, `PL3.MOOSE_Z`) within the moose's range (else the nearest weedy shallows).
- Their bouts: late afternoon and at night, 60–100 min each, on ~87 % of summer days (108/124) [primary for the share; inf for the
  bout lengths].
- The 15 lake users of E13 come from the 77-km² catchment's band around the shore, wider than the grid's window. The forest holds
  the ~6–9 that live in the window, so it shows fewer moose in the water than the take implies [inf; a known gap].

## 5. Not modelled (known gaps)
- Bears' other foods (ants, berries, mast), and their take of fawns and moose calves (Ely: up to four fawns a bear in late May–June;
  a Pennsylvania study blamed bears for 33 % of fawn deaths — Northern Woodlands) [secondary]. Fawns and calves die here at a flat
  rate [inf].
- Population dynamics: the adults' census is fixed at the field's density; the young are carried and dropped [inf].
- Deer and moose crossing the ice; carcasses lost through it (no study found — earlier note).
- Browse on the bank's shrubs (red-osier dogwood, willow; speckled alder resists — earlier note): the land's plants are not yet
  simulated.

## Sources
- Northern Woodlands, "Counting bears": https://northernwoodlands.org/articles/article/counting-bears
- Portland library (Maine news), bears on 85 % of the state: https://digitalcommons.portlandlibrary.com/news_downeast/2227
- MDIFW 2024 bear harvest report (403 here; via search): https://www.maine.gov/IFW/docs/2024%20Bear%20harvest%20report.pdf
- Hair-snare SCR densities, New York (abstracts):
  https://www.usgs.gov/publications/estimating-black-bear-density-using-dna-data-hair-snares and
  https://pubs.usgs.gov/publication/70225757
- MDIFW deer density objectives (LD 1569 §3, via search): https://www1.maine.gov/IFW/docs/LD1569%20Sec%203%20goals.pdf
- MDIFW significant wildlife habitat (DWAs): https://www.maine.gov/IFW/programs-resources/environmental-review/significant.html
- Kantar & Cumberland 2013, *Alces* 49 (abstract): https://alcesjournal.org/index.php/alces/article/view/108
- MDIFW moose reports to the legislature: https://lldc.mainelegislature.org/Open/Rpts/ql737_u55m35_2012.pdf and
  https://lldc.mainelegislature.org/Open/Rpts/ql737_u55m35_2014.pdf
- North American Bear Center, animal protein: https://bear.org/animal-protein/
- Reimchen's bear–salmon work (secondary): https://savethegreatbear.org/news/detail/fish_and_the_forest_new_research_shows_salmon_are_feeding_b.c.html
  and https://ecoreserves.bc.ca/2009/03/15/tom-reimchen-addresses-friends-agm/
- Rogers, Mooty & Dawson 1981, USDA FS GTR NC-65: https://www.fs.usda.gov/nrs/pubs/gtr/gtr_nc065.pdf
- Belovsky & Jordan 1978 (earlier note): https://belovskylab.nd.edu/assets/193221/belovsky_g.e._and_p.a._jordan._1978..pdf
