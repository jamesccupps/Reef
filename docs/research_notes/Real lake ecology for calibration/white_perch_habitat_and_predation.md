# White perch in shallow lakes: where they are by time of day and season, and how chain pickerel and smallmouth bass catch them (Hot Brook)

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine.
- **The lakes.** Upper is 360 ha, mean 3.3 m, max 5.5 m (the deep north basin is by the outlet; the broad south basin is 3.4–4.3 m with a 0.6–3-m shelf). Lower is 277 ha, mean 2.4 m, max 4 m. Both are unstratified and tea-coloured (Secchi ~3–4 m), with weed beds to ~2–3.5 m.
- **The fishery.** White perch are abundant here (a 25-fish bag). An angler on these lakes catches "mostly white perch, lots of fallfish and smallmouth bass, a few pickerel", usually at Upper's shallow south end by the inlet brook.

**The sim problem.**
- White perch hold a 3.5–5.5-m bed by day (`fish3.js` `S3.whiteperch.hab.day` [3.5, 5.5]; the young of 8–12 cm blend toward 2.4–3.6 m via `habJ`). They come onto 0.5–1.5-m flats at night.
- The predators hold the shore and the weed edge, then rest at night: pickerel over 0.5–2.5 m, bass over 1–3 m within ~60–120 m of shore.
- So the two almost never meet: one white perch was killed in 20 July days. White perch grow to 35–39 kg/ha, and the small species vanish.

**How this note relates to the repo.** It extends, and does not repeat, these notes:
- **WSSB** = `../Seasonal fish habitat use/whiteperch_shiner_sucker_bullhead.md` §1 and §6. It holds Stanley & Danie's 4–9 m by day and 0.9–1.2 m at night, plus the temperature, O₂, under-ice and angler material.
- **HAB3D** = `../Whole lake 3D fish simulation/habitat3d.md` §6, §9–12. It holds the encoded bands and the diel and seasonal calendar.
- **WPR** = `../Whole lake 3D fish simulation/white_perch_regulation.md`. It holds mortality, first winter, stunting, zooplankton and biomass.
- **FSD** = `../fetched_sources_digest.md` §6, the Cooper 1941 summary.
- **PDPM** = `../Whole lake 3D fish simulation/predator_diets_and_prey_mortality.md`, the pickerel and bass diets.
- **PEA** = `piscivore_encounter_attack.md`, the encounter, light and capture model.
- **SMH** = `smallmouth_horizontal_habitat.md`, how far bass go from shore.

**What is new here.**
1. A full shallow-lake fish census dominated by white perch: Missisquoi Bay, Lake Champlain, 2003, by 24-h gill nets at 3–4.9 m and seines at 0.5–2.5 m.
2. Cooper 1941 re-read for where and when the nets and seines caught white perch, and for the sizes and counts of white perch in pickerel and bass stomachs, including an October sample from a shallow Penobscot County lake.
3. Brodersen et al. 2015: pickerel move into open water where open-water prey are abundant.
4. Gosch et al. 2010 and 2011 and Wolfert & Miller 1978: which white perch predators eat, and whether predators can control them.
5. Major 1977 on twilight predation on schools.
6. A light-at-depth argument that the clear-lake 4–9-m day band is only ~1.5–5 m in Hot Brook's brown water.

**Tags.**
- [FT] full text read in this pass. "(repo)" means a full text was read in an earlier pass and is cited from the repo note named.
- [ABS] abstract or catalogue record only.
- [SEC] a search-engine digest or secondary summary; the page was not read.
- [derived] my arithmetic; [inf] my inference.
- Short quotes are under 15 words.

**Access.** No instructions were found inside any fetched content. Blocked or bot-checked sources were not bypassed (see Gaps).

---

## Takeaway

1. **Shallow-lake white perch are open-water fish by day, but not deep-hole fish.**
   - In Missisquoi Bay (45 km², 3–4.9 m, unstratified at 24.6–25.4 °C), 24-h gill nets at every open-water station (≥ 2.5 m) caught white perch. They were 66 % of the fish and > 64 % of the biomass, with a mean of ~20 cm and ~200 g.
   - The authors place white perch in the open centre of the bay and yellow perch more along shore.
   - Cooper found white perch most abundant in Maine's *shallow* lakes. He took them over "the deepest part of the shallower ponds", but not in the deep cold water of stratified lakes.
   - In Hot Brook's brown water, the light a white perch meets at 4–9 m in a clear lake lies at **~1.5–5 m**. The "day band" should therefore be the whole open bottom beyond the weeds, **bed ~2.5–5.5 m**, not only the deepest hole.
2. **The young live in the shallows by day; only the adults go offshore.**
   - Cooper's daytime seines (≤ 1.2 m) took 281 white perch, and he notes the young stay in the warm surface water all summer.
   - Missisquoi's September seines (0.5–2.5 m) took 254 white perch averaging ~11 g, patchily at 8 of 27 stations.
   - In Kerr Reservoir, white perch < 100 mm were found only along *unvegetated* littoral shores, and the young moved shallower after dark.
3. **The diel cycle is the main way white perch and predators meet.**
   - White perch move inshore across the weed edge at dusk, onto 0.5–1.5-m flats at night, and back at dawn (WSSB, HAB3D).
   - Twilight is when piscivores do best against schooling prey: in Major 1977, attacks peaked in civil twilight as schools broke up and formed.
   - Pike and pickerel activity peaks at dawn and dusk (PEA).
   - At Hot Brook depths the light in the first ~30–40 min after sunset still lets a pickerel see at half or more of its daytime range [derived].
4. **In Maine white-perch lakes, white perch are the main fish prey of both predators.**
   - Pickerel of 32–64 cm: ~95 % fish, with white perch 55 % of the volume and 28 of the 92 items (Cooper 1941).
   - Smallmouth of 22–54 cm: 80 % fish, with white perch 61 % (16 of 48 items).
   - In an October sample from Pushaw Pond (shallow; Penobscot County), white perch were 43 % of the pickerel's food and 9 of 18 items.
   - **The white perch eaten were mostly 7–10 cm** (mean ~8–9 g, partly digested) [derived]. These are yearlings in summer and young-of-year in autumn, not adults. In a non-stunted Nebraska population, every white perch that predators ate was immature (Gosch et al. 2010).
5. **Predators do enter the open water where white perch live.**
   - In Missisquoi's open-bay nets, northern pike turned up at 11 of 14 stations and smallmouth at 10 of 14.
   - Cooper's overnight nets, set mostly at 3–15 m, caught 78 pickerel and 66 bass. Cooper had "evidence of larger pickerel in deep waters" feeding there.
   - Pickerel become partly open-water fish where open-water prey are abundant (Brodersen et al. 2015).
6. **Regulation (Q3) is mostly in WPR.** New points:
   - Predation on white perch's young is consistent with non-stunted populations. Predation on the large adults coincides with stunting (Gosch et al. 2010).
   - Even the most efficient predators failed as biological control (Gosch & Pope 2011).
   - Crowded populations stay small and plankton-eating, while sparse ones grow larger and turn piscivorous (Feiner et al. [SEC]).
   - Maine sees occasional summer die-offs (heat stress, parasites).
   - Real lakes with dominant white perch keep their littoral small fish (Missisquoi; WPR §4). The sim's extinctions are an artefact.

---

## Q1. White perch habitat by time of day and season in shallow lakes (< 6 m)

### Takeaway
- **Adults (≥ ~15 cm) by day** sit over open, level, soft bottom beyond the weeds: the deepest third of a shallow lake, but also the 2.5–4-m flats. They form roaming schools near the bed, sometimes suspended.
- **Young-of-year and yearlings by day** are in the unvegetated littoral and along the weed edge, at bed 0.5–2.5 (to 3.6) m.
- **Everyone at night** is inshore and shallow, on flats of 0.5–1.5 m.
- **Twilight** is the transit, and the feeding peak for adults (MDIFW: dimples on the surface just before and after sunset).
- **By season:**
  - spring: inlet and outlet runs and shoreline spawning at 0–1.5 m;
  - summer: the diel cycle;
  - autumn: the weed edges;
  - early ice: the green weeds;
  - midwinter: the deepest basin;
  - late March: toward runoff and oxygen.
- No hydroacoustic or telemetry study of white perch in a lake was found. The diel depths still rest on Stanley & Danie's 1983 compilation, now backed by the net and seine contrasts below.

### Cited findings

**Missisquoi Bay, Lake Champlain (Quebec part), August–September 2003** [FT] — Bilodeau, P., Dumas, B. & Massé, H. 2004. *Composition et état de santé de la communauté des poissons de la baie Missisquoi, lac Champlain, été 2003.* MRNFP Québec, Rapport technique 16-23, xii + 43 p. + annexes. [BAnQ PDF](https://collections.banq.qc.ca/document/s/t/GZlyIYdwoR_TNdsc2_ypJg).
- **The bay.**
  - ~45 km². Gill-net stations were 3.0–4.9 m deep, Secchi 0.65–1.0 m (far more turbid than Hot Brook), 24.6–25.4 °C at every station (unstratified).
  - Nets were not set shallower than 2.5 m.
  - White perch invaded in the mid-1990s.
- **Gill nets** (14 stations; one 60.8-m multi-mesh net per station, 1.8 m tall; set mid-morning and lifted ~24–27 h later, so they fished a full day and night; 18–22 August):
  - 2,033 fish of 16 species.
  - **White perch: 1,338 (65.8 %), > 64 % of the biomass, present at 14 of 14 stations, dominant at 13.**
  - Mean TL 197 mm (SD 33). 252 kg over 1,278 weighed fish gives ≈ 197 g mean [derived].
  - Yellow perch: 440 (21.6 %; 16.5 % of biomass).
  - Predators in the same open-bay nets: **northern pike 25 at 11 stations (79 %), smallmouth bass 39 at 10 (71 %), largemouth 8 at 5 (36 %)**. Brown bullhead: 58 at 13.
- **Seines** (27 shore stations, a 12.5-m seine with 3.2-mm mesh, 0.5–2.5 m deep, 9–11 September):
  - 2,758 fish of 22 species.
  - Yellow perch 1,260 (at 23 stations), pumpkinseed 356, *Lepomis* sp. 286.
  - **White perch 254 at only 8 stations, 2,722 g in all (≈ 10.7 g each, ≈ 9–10 cm [derived]).** The authors note white perch were absent from many seine stations, while yellow perch were missing from only two.
  - Also rock bass 132, banded killifish 29, and others.
- **The authors' reading:**
  - White perch and yellow perch share the bay, with white perch occupying more of its open centre.
  - There was no inverse relation between the two species' abundances across stations (R² 0.07 and 0.17, p > 0.05).
  - White perch tolerate winter cold less well than yellow perch and may move to deeper Lake Champlain water in winter (citing Schaeffer & Margraf 1986).
- **Relevance.** This is the best shallow-lake analogue found. White perch dominate the open 3–5-m water. Littoral species (yellow perch young, pumpkinseed, rock bass, killifish) persist in the shore zone, and white perch there are few, small and patchy.

**Cooper 1941, re-read for where and when** [FT; local file `../fetched/Fish Survey Report No. 4 _ A Biological Survey of Lakes and Ponds.pdf`] — Cooper, G. P. 1941. *A biological survey of lakes and ponds of the Androscoggin and Kennebec River drainage systems in Maine.* Maine Dept. Inland Fisheries & Game, Fish Survey Report 4 ([digitalmaine](https://digitalmaine.com/cgi/viewcontent.cgi?article=1071&context=ifw_docs)).
- **Nets and timing (p. 100).**
  - 86 sets of two 375-ft experimental gill nets, 15 June–11 September; all but 3 were overnight, averaging 21.7 h.
  - Cooper notes these nets "catch many more fish during the night than … daytime".
  - Most sets were at 10–50 ft (3–15 m). 56 were below the thermocline or "in the deepest part of the shallower ponds".
- **Where white perch were and were not (pp. 122–123).**
  - Net sets were distributed roughly in proportion to lake area by depth, "more in shallow water than in deep".
  - About **half as many extra sets, "mostly at greater depths", caught no perch**. That is, in stratified lakes the perch were not in the deep cold water.
- **Seasons (p. 24).** "There is some evidence that large bass and large White Perch spend at least part of their time in deep cold waters during the hot part of the summer, but the young of these same species live in the warm surface water during the entire summer."
- **Daytime shallows against overnight nets** [derived from p. 103].
  - Seines (by day, shore to 4 ft ≈ 1.2 m): white perch 281 against yellow perch 1,181, a ratio of **0.24**.
  - Gill nets (overnight, mostly 3–15 m, fish mostly ≥ 15 cm): 1,627 against 226, a ratio of **7.2**.
  - So by day the ≤ 1.2-m shallows hold few white perch (mostly young), while the open water holds the adults.
- **Shallow lakes hold the most white perch** (pp. 24, 150; FSD). Per 24-h set: 62–128 in four shallow unstratified lakes, against 7–46 in most deep lakes.
- **Food links to soft bottom** (p. 125; FSD). Mayfly nymphs were 44 % of the summer diet volume of fish ≥ 15 cm, all aquatic insects 60 %. These are mostly burrowers of soft bottom; the inference is that the day band is level mud, such as Hot Brook's "mostly muddy" basins.
- **Winter movement (p. 122).** White perch were "migrating" onto Great Pond's outlet screen on 3 February 1940.

**Kerr Reservoir, Virginia–North Carolina** [FT] — Harris 2006, Virginia Tech MS thesis ([PDF](https://vtechworks.lib.vt.edu/server/api/core/bitstreams/8e7bf951-84ae-4a7e-9efe-42cb0efa708e/content)). The predator-diet numbers are already in WPR; the habitat lines are new.
- "During my summer collections, small (< 100 mm) white perch were only collected in unvegetated, littoral areas."
- Young fish were sampled after dark, "the period when most age-0 fish migrate to shallow areas".
- In landlocked waters white perch move from deep to shallow water to spawn at 15–20 °C, with no habitat preference for spawning (Zuerlein 1981, cited there).

**Twilight and surface feeding, Maine**
- An MDIFW weekly fishing report (14 August 2015) advises watching for dimples or fins on the surface "just before and after sunset", when white perch come to the surface in the evening [SEC; search digest; [page](https://www.maine.gov/ifw/news-events/report.html?id=653100) returned 403]. It agrees with the MDIFW plan's surface schooling and the Northeast Pond survey's "open lake at dusk" (WSSB).
- **Late summer, Down East** [FT, popular] — *Bangor Daily News*, 30 August 2013, [article](https://www.bangordailynews.com/2013/08/30/outdoors/late-august-is-perfect-time-for-perch-fishing/):
  - MDIFW biologist G. Burr: perch are "really schooled up this time of year" (Second Gardner, Third Machias, Toddy, Big Lake, Grand Falls Flowage);
  - and they "can be concentrated in areas … where there is a lot of oxygen".

**Diel sampling evidence elsewhere**
- **Lake Erie, offshore bottom trawls by morning, afternoon and night, 1961–2001** [ABS] — Stapanian, M. A., Bur, M. T. & Adams, J. V. 2007. *Environ. Monit. Assess.* 129:169–178, [doi:10.1007/s10661-006-9350-2](https://doi.org/10.1007/s10661-006-9350-2).
  - Young-of-year catches were highest at night for 4 of 10 species. The abstract does not name them.
  - Programmes that skip night sampling may underestimate recruitment.
- **Lake Champlain main lake.** Night hydroacoustic surveys attribute the targets above the thermocline to a mix of alewife and white perch, from midwater trawls and floating gill nets [SEC] (USFWS Lake Champlain FWCO forage reports, [2012](https://www.fws.gov/sites/default/files/documents/LCFWCO_Forage_Report_2012.pdf)). This is a deep, stratified lake: white perch suspend in open water at night.
- **Estuary telemetry and day trawl avoidance in clearer western Lake Erie** are already in WSSB.

**Light at depth: why the clear-lake day band does not transfer** [derived]
- Fraction of surface light, with Kd = 0.3 m⁻¹ for a clear lake (Secchi ~5–6 m) and Kd = 0.5–0.85 m⁻¹ for Hot Brook (Secchi 3–4 m; `chem3.js` uses 0.85):

  | Depth | Clear lake (Kd 0.3) | Hot Brook, Kd 0.5 | Hot Brook, Kd 0.85 |
  |---|---|---|---|
  | 2 m | 55 % | 37 % | 18 % |
  | 3.5 m | 35 % | 17 % | 5 % |
  | 4 m | 30 % | 14 % | 3 % |
  | 5.5 m | 19 % | 6 % | 0.9 % |
  | 9 m | 7 % | — | — |

- The light at 4–9 m in a clear lake (30–7 %) is found at **2.4–5.4 m** (Kd 0.5) or **1.4–3.2 m** (Kd 0.85) in Hot Brook.
- If white perch track light, as Sheri & Power 1969's title suggests (not seen; WSSB), Hot Brook's daytime band should start at ~2–2.5 m, not 3.5 m.
- **Caveat.** The 4–9-m figures' original lakes are unknown. If they came from the turbid Bay of Quinte, the correction would go the other way.

**Hergenrader & Hasler and Webster, as named in the request**
- **Hergenrader & Hasler (1966, 1968)** sonar-tracked *yellow* perch under ice and in summer in Lake Mendota: dense day schools whose size rose with light. They are surrogates and are already in PEA and HAB3D. No white perch work by them was found.
- **Webster, D. A. 1943 [1942 volume].** "Food progression in young white perch *Morone americana* (Gmelin) from Bantam Lake, Connecticut." *Trans. Am. Fish. Soc.* 72:136–144, [doi:10.1577/1548-8659(1942)72[136:FPIYWP]2.0.CO;2](https://doi.org/10.1577/1548-8659(1942)72[136:FPIYWP]2.0.CO;2).
  - Bantam Lake is shallow (roughly 370–380 ha, max ~7.6 m; from memory, not verified [inf]), a close analogue.
  - No abstract exists online and the text was not reached.
  - Webster 1941 (Connecticut Geol. Nat. Hist. Survey Bull. 63:122–227, life histories of Connecticut fishes) was not reached either.

### Season-by-season summary for a 3–5.5-m lake
Built from WSSB, HAB3D and the new evidence. A star (*) marks [inf]. Calendar: ice-out ~23 April, 15 °C late May, 24 °C peak late July, ice-on ~1 December.

| Period | Adults ≥ 15 cm | Sub-adults 8–15 cm | Young-of-year | Basis |
|---|---|---|---|---|
| Ice-out → ~12 °C (late Apr–mid May) | leaving the basin for the shore, inlets and outlet; schools at bed 1–3 m* | same | — | MDIFW runs; Cooper p. 25 |
| Pre-spawn and spawning, ~15–21 °C (late May–June) | 0–1.5 m flats over gravel and sand, and up the inlet brook and the connecting brook; groups of hundreds; egg release peaks at dusk; adults return deeper afterwards | spawn too if mature (♂ ~7–8 cm, ♀ ~9–10 cm) | eggs and larvae in the shallows | WSSB; Harris; Cooper; the user's catches by Upper's inlet fit |
| Summer day (mid June–Aug) | bed **2.5–5.5 m**, mostly the deeper half; level mud; schools near the bed or suspended; no weeds | bed **1.5–3.6 m** at the outer weed edge and the open bottom beyond | bed **0.5–2.5 m**, unvegetated littoral and weed edge; schools | Missisquoi; Cooper; Harris; Stanley & Danie 2.4–3.6 m |
| Summer dusk (±1 h of sunset) | inshore along the bed across the 3.5→1.5-m contours; calm evenings: surface schools over open water, feeding peak | same | stay shallow | MDIFW; Northeast Pond; WSSB |
| Summer night | bed 0.5–1.5 (to 2.5) m flats, whole column, loose | same | 0.3–1.5 m | Stanley & Danie; Harris (young shallower after dark); CT night electrofishing at the shore, median 42 white perch/h (WPR §4) |
| Summer dawn | reverse of dusk, offshore by ~1 h after sunrise* | same | — | WSSB |
| Overcast or rough days | longer and shallower forays to bed 2–3.5 m* ("bite runs all day" [ang]) | | | WSSB |
| Autumn (Sept–Nov, < ~18 °C) | by day the weed edges and flats at bed 1.5–3.5 m, then the basin by ice-on | same | 4–8 cm, moving to the weed edges at 1.5–3.5 m | NJ (WSSB); Pushaw October pickerel stomachs (Q2) |
| Early ice (Dec, first 2–4 weeks) | shallow green weeds and edges, bed 1.5–3.5 m | same | basin edge* | NJ (WSSB); MN yellow perch analogue (HAB3D) |
| Midwinter (Jan–Mar) | deepest basin: Upper ≥ 3.9 m, Lower ≥ 3.3 m; compact roaming schools 0–2 m off the bed; active by day, dawn and dusk bites | same | same, or the 1.5–3.5-m edge* | WSSB; Horseshoe Lake ME |
| Late March | rebound; toward oxygenated inflows if the bed falls below ~3–4.6 mg/L | | | WSSB; HAB3D hypoxia rule |

### Gaps (Q1)
- No lake telemetry, hydroacoustic or day-against-night net study of white perch depth or distance from shore was found, in any lake. Missisquoi's nets fished 24 h, so day and night are pooled.
- Missisquoi is far more turbid (Secchi < 1 m) than Hot Brook. Its white perch may use the open bay more by day than they would in clearer water.
- AuClair 1956 (Sebasticook Lake, UMaine MS) is not online. Its author's obituary confirms *The White Perch of Sebasticook Lake* ([BDN obituary](https://www.bangordailynews.com/2016/03/18/obituaries/roger-p-auclair/)).
- Sheri & Power 1969, Webster 1941/1943 and Mansueti 1961 (*Chesapeake Sci.* 2:142–205) were not reached.

---

## Q2. When and where predators catch white perch; sizes eaten; diet shares

### Takeaway
- **Who eats them.** In Maine white-perch lakes, white perch are the main fish prey of both pickerel and smallmouth (Cooper 1941: 55 % and 61 % of food volume).
- **What size.** Mostly **yearlings and young-of-year, 6–12 cm** (central ~8 cm). Adults ≥ 15 cm are rarely taken except by the largest predators, or where white perch are stunted.
- **When.**
  - Summer and especially autumn, when the young are 5–8 cm and white perch use the weed edges. Cooper's October Pushaw pickerel held mostly white perch.
  - Little under ice, apart from early ice.
- **Time of day.**
  - Twilight, when schools pass the weed edge and break up or form. Major 1977: attacks peaked in civil twilight.
  - By day, where the young live in the littoral.
  - Few at full night.
- **Where.**
  - The outer weed edge and flats at bed 1–3.5 m.
  - The littoral, for the young.
  - The open basin edge for large predators. Pike and smallmouth were netted at 71–79 % of Missisquoi's open-bay stations. Cooper's deep overnight sets took 78 pickerel and 66 bass.

### Cited findings

**Cooper 1941, Tables XVI–XVII re-read for counts and sizes** [FT; local file]. All fish were gill-netted overnight in summer, mostly at 3–15 m. Volumes are in cc, with counts in brackets.
- **Smallmouth bass** (66 fish of 8.5–21.3 in ≈ 22–54 cm; 36 with food; 238.6 cc; 48 items):
  - white perch 145.5 (16); yellow perch 33.6 (5); pumpkinseed 5.0 (1); fish remains 7.55 (6);
  - crayfish 34.3 (7); insects 8.66 (13); vegetation 4.0.
  - In Snow Pond alone, 86.5 cc of white perch came from 5 fish.
  - Cooper: all identified fish were spiny-rayed, and bass took no smelt although smelt were present.
- **Chain pickerel** (110 fish of 12.6–25.0 in ≈ 32–64 cm, from 19 lakes; 51 with food; 397.3 cc; 92 items):
  - white perch 217.2 (28); golden shiner 55.6 (count not legible in the scan); yellow perch 29.7 (14);
  - pickerel 24.5 (1); fish remains 20.0 (16); horned pout 18.0 (1); tadpoles 17.5 (2); smelt 12.0 (2);
  - crayfish 2.1 (1); insects 0.87 (24).
  - Cooper: pickerel fed mostly on the fish "with which it is usually associated", namely white and yellow perch.
- **Pushaw Pond, 14–16 October** (32 pickerel of 12.6–21.9 in; 13 with food), [derived from the table row]:
  - white perch 44.2 (9); yellow perch 11.0 (1); horned pout 18.0 (1); pickerel 24.5 (1); fish remains 5.1 (6);
  - so white perch were **≈ 43 % of the volume and 9 of 18 items**;
  - all the table's bullhead and cannibalism came from this autumn sample.
- **Item sizes** [derived]. Converted with the sim's white perch length–weight (6, 8, 10 and 12 cm = 3.3, 8.1, 16.2 and 28.6 g). These are minimums, since the prey were partly digested:

  | Sample | cc per white perch | Approx. length |
  |---|---|---|
  | Pickerel, summer | 7.8 | ≈ 8 cm |
  | Bass, summer | 9.1 | ≈ 8.3 cm |
  | Bass, Snow Pond | 17.3 | ≈ 10 cm |
  | Pickerel, Pushaw, October | 4.9 | ≈ 7 cm (young-of-year) |
  | Yellow perch in pickerel | 2.1 | young-of-year |

- **Per-stomach rates** [derived]: 0.25 white perch per pickerel stomach (28/110) and 0.24 per bass stomach (16/66). With a 1–2-day residence for an 8-g fish at summer temperatures, that is **≈ 0.12–0.25 white perch per predator per day**.
  - This is a floor: fish digest in the net and 46–55 % of stomachs held food.
  - Energetics give a ceiling: a 40-cm pickerel needs ~8–13 g/day (PEA), and at ~50 % white perch by mass that is ~0.5–0.8 a day.
- **Where the predators were caught.** In the same overnight sets, mostly 3–15 m deep (78 pickerel and 66 bass in gill nets; Cooper notes bass avoid nets).
- Cooper (p. 25): pickerel eat "mostly warm-water minnows and the young of warm-water game fishes in shallow water". He adds "we have evidence of larger pickerel in deep waters feeding on young salmon".
- **Walleye** in Great Pond (8 fish, from deep water) were about half smelt and half white perch by volume (p. 156).
- Of 1,757 white perch, 66 bass and 110 pickerel stomachs, none held a sucker (pp. 216–217; FSD).

**Missisquoi Bay 2003** [FT] (Q1 citation). Over 24-h sets at 3–4.9 m, northern pike were at 11 of 14 open-bay stations, smallmouth at 10 of 14 and largemouth at 5 of 14. White perch were at all 14. Predators therefore enter the open shallow water where white perch school, at some hour of the day. The report has no diets.

**Pickerel go into open water where open-water prey are abundant** [FT] — Brodersen, J., Howeth, J. G. & Post, D. M. 2015. *Nature Communications* 6:8115, [doi:10.1038/ncomms9115](https://doi.org/10.1038/ncomms9115).
- 12 Connecticut and Massachusetts lakes of 13.9–194.7 ha (max depth 7–20 m; one 2.5-m pond).
- Littoral (< 2 m) sampling was by electrofishing starting right after sunset. Open-water sampling used gill nets "set 1.5 m below the surface over the deepest part", from afternoon to a few hours after sunset.
- Pickerel occurred in the littoral in every lake. Open-water pickerel (≥ 350 mm) were regularly caught **only where alewife were landlocked**, and their diet was almost all alewife.
- Diet across lakes: ~75 % fish, 20 % crayfish, 5 % small invertebrates. *Lepomis* were 45–62 % of the fish, and alewife 27–35 % where present.
- White perch are not mentioned.
- **Relevance.** Pickerel's habitat follows abundant, schooling open-water prey. In a lake where white perch are the abundant schooling fish, some large pickerel should hunt beyond the weed edge [inf].

**Nebraska reservoirs: who is eaten, and can predators control white perch?**
- **Gosch, N. J. C., Pierce, L. L. & Pope, K. L. 2010.** *Ecol. Freshw. Fish* 19:401–407, [doi:10.1111/j.1600-0633.2010.00423.x](https://doi.org/10.1111/j.1600-0633.2010.00423.x) [ABS]:
  - white perch dominated piscivore diets in non-stunted Pawnee Lake, and with gizzard shad in stunted Branched Oak Lake;
  - **all white perch eaten in Pawnee were sexually immature**;
  - in Branched Oak those eaten were larger and older, and many had spawned;
  - the authors suggest predation there reinforced stunting by removing the largest fish.
- **Gosch, N. J. C. & Pope, K. L. 2011.** *Knowl. Managt. Aquatic Ecosyst.* 403:02, [doi:10.1051/kmae/2011028](https://doi.org/10.1051/kmae/2011028) [ABS; full text 403]:
  - of nine predators, largemouth bass, walleye and sauger consumed white perch most efficiently;
  - past efforts to raise their biomass failed, so biological control with existing predators is unlikely.

**Lake Ontario pike** [ABS] — Wolfert, D. R. & Miller, T. J. 1978. *Trans. Am. Fish. Soc.* 107:696–702, [doi:10.1577/1548-8659(1978)107<696:AGAFON>2.0.CO;2](https://doi.org/10.1577/1548-8659(1978)107%3C696:AGAFON%3E2.0.CO;2).
- Eastern Lake Ontario pike, 1972–73, ate only fish.
- Alewife were the principal prey and were positively selected, more so from June to October. **White perch and yellow perch** were the other two commonest prey.

**Already in the repo (cited briefly)**
- Kerr Reservoir, a shad-rich water: white perch < 2 % of every sportfish diet, eaten at 82–152 mm (mean 110); even 69–77-cm striped bass took < 125 mm (WPR).
- Wentzells Lake NS (brown water): white perch the #2 fish prey of pickerel, which ate ~85 % fish (PDPM).
- Little River Lake NS (brown water): bass prey listed as yellow perch, white perch, bullhead and young alewife, with no crayfish (PEA).

**Timing: twilight and the predators' day**
- **Twilight predation on schools** [FT, marine surrogate] — Major, P. F. 1977. "Predator–prey interactions in schooling fishes during periods of twilight." *Fishery Bulletin* 75:415–426, [PDF](https://spo.nmfs.noaa.gov/sites/default/files/pdf-content/1977/752/major.pdf).
  - Silverside schools formed a mean 29 min before sunrise and broke up a mean 19 min (14–26) after sunset.
  - Predator attacks peaked just after the schools formed and just before they broke up, in civil twilight. Midday attacks were significantly fewer than at sunrise and sunset.
  - Attacks fell off as darkness deepened, when "it may have been too dark" for the predators.
- **Freshwater counterparts** (PEA §5 and Addendum).
  - Pike were active in 22 % of sunrise, 17 % of day, 21 % of sunset and 2 % of night intervals.
  - Grass pickerel held fresh food in 32 / 61 / 10 % of mid-afternoon / evening / dawn samples [SEC].
  - Minnows detected a stalking pike at ~⅓ of the daylight distance in dawn light (Pitcher & Turner 1986).
  - Smallmouth are shallowest at 23:00–03:00 (Suski & Ridgway) and took 32 % of their daily ration at 03:00–12:00 (Zimmerman 1999).
  - Pikeperch in a brown lake selected perch by day and roach at night (Ranåker et al. 2014, [PMC4224368](https://pmc.ncbi.nlm.nih.gov/articles/PMC4224368/) [FT]).
- **Light at the weed edge at dusk** [derived]:
  - Underwater light at 2 m = sky × 0.9 × e^(−0.85·2) ≈ 0.16 × sky.
  - Clear-sky illuminance is ~400 lx at sunset and ~3 lx at the end of civil twilight (~35–40 min after sunset in summer at 45–46° N). That gives **~65 lx and ~0.5 lx at a 2-m bed**.
  - With PEA's RD(I) = RD_day·I/(I + K_I) and the code's pickerel K_I 0.5 lx, a pickerel sees at full range at sunset and ~½ range at the end of civil twilight. Bass (K_I 0.003) see at full range through twilight.
  - **The white perch's inshore crossing (sunset to ~+40 min) falls inside both predators' working light.**

### Gaps (Q2)
- No study gives the time of day or the site at which pickerel or bass caught white perch. The twilight mechanism is a surrogate (Major; pike activity; yellow perch's dusk sequence).
- Cooper's are the only Maine stomach data. They are summer-only (plus one October lake), gill-netted (digestion and selectivity bias), and include lakes with smelt and golden shiner that Hot Brook lacks.
- Not reached:
  - Warner 1973 (Maine spring pickerel diet; data pages missing);
  - Watson 1965 (*The Maine Smallmouth*);
  - Gosch & Pope 2011 and Gosch et al. 2010 full texts (KMAE and UNL 403);
  - Couture & Watzin 2008 (BioOne);
  - Boileau 1985 (*Fisheries* 10:6–10);
  - Hartman & Margraf 1992 (Lake Erie walleye on white perch).

---

## Q3. What regulates white perch where predation is weak, and what holds them at 15–35 kg/ha

### Takeaway
Most of this is in WPR §1–3 and §7, with FSD's correction that Cooper's adult mortality rises with age. The new evidence:
- **Predators remove the young, not the adults.** That is consistent with normal, non-stunted size structure; stunting coincides with predators taking the large adults (Gosch et al. 2010).
- **Predators alone did not control white perch** where managers tried to raise them (Gosch & Pope 2011).
- **Density changes size and diet, not numbers** (Feiner et al. [SEC]). Crowded populations stay small, eat plankton and invertebrates, and are in poorer condition. Sparse populations grow larger and turn piscivorous in summer.
- **Diet is the same in stunted and non-stunted fish** (cladocerans and dipterans), so the stunted state is a density effect, not a different food (Gosch, Stittie & Pope 2010).
- **Shallow lakes carry the most white perch** (Cooper). Missisquoi's white perch were 66 % of net catch and > 64 % of biomass, yet its littoral species persisted.
- **Episodic summer die-offs happen in Maine.** They usually involve warm-water stress and parasites taken in with infected prey, and are normally a small fraction of the population [SEC].

### Cited findings (new to the repo)
- **Gosch, N. J. C., Stittie, J. R. & Pope, K. L. 2010.** *J. Freshw. Ecol.* 25:31–39, [doi:10.1080/02705060.2010.9664354](https://doi.org/10.1080/02705060.2010.9664354) [ABS]:
  - spring, summer and autumn diets of stunted (Branched Oak) and non-stunted (Pawnee) white perch were both dominated by cladocerans and dipterans;
  - fish-egg predation was similar in the two;
  - fish were rarely eaten.
- **Gosch et al. 2010; Gosch & Pope 2011:** see Q2.
- **Feiner, Z. S. et al.**
  - AFS 2011 talk 73-17, *Predictors of white perch population size structure and density*, on four Piedmont reservoirs, NC [SEC; afs.confex.com unreachable]:
    - high-abundance populations stayed small, fed on plankton and invertebrates, and had poorer condition;
    - low-abundance ones grew larger and switched to fish in summer;
    - the timing of piscivory may set maximum size.
  - Feiner, Aday & Rice 2012, *Biol. Invasions* 14:2315–2329 [SEC]: the newest invading population grew faster, matured earlier and had a higher GSI than older ones (2010 AFS abstract). The NCSU thesis page was behind a bot check and was not opened.
- **Porta, M. J. & Snow, R. A. 2017.** *Proc. Okla. Acad. Sci.* 97, [OJS](https://ojs.library.okstate.edu/osu/index.php/OAS/article/view/7374) [ABS]:
  - Sooner Lake white perch (monthly, April 2015–June 2016) ate zooplankton in spring and invertebrates in summer, and were mostly fish-eating in autumn and winter;
  - fish dominated the diet of the larger size classes.
- **Missisquoi 2003** [FT]: see Q1.
  - White perch at 66 % of net catch alongside yellow perch at 22 %, with no inverse relation between them across stations.
  - Pumpkinseed (356), rock bass (132), banded killifish (29) and young yellow perch (1,260) were all present in the shore seines.
  - The authors expect milder winters to favour white perch survival.
- **Cooper 1941** [FT; FSD]:
  - white perch most abundant in shallow lakes, and extremely stunted in shallow eutrophic Sabattus (16–17 cm at ages 5–9);
  - growth correlated with the share of fish in the diet (20–50 % in fast lakes), not with bottom-fauna density.
- **Maine summer die-offs** [SEC; MDIFW blog, D. Russell, 9 July 2020, [page](https://www.maine.gov/ifw/blogs/mdifw-blog/when-be-concerned-about-finding-dead-fish-maines-lakes-ponds-and-rivers-summer)]:
  - kills are often from temperature stress, worse with very warm or fluctuating temperatures;
  - they commonly involve parasites ingested with infected prey such as copepods;
  - usually only a small fraction of the population dies.
  - A 2013 white perch kill in Lake George (Wales, MA) was blamed on a warm-water pathogen [SEC; [NEPR](https://digital.nepr.net/news/2013/07/22/officials-say-heat-wave-blame-dead-fish-lake-george)].
- **MDIFW lake surveys** [SEC; snippets; maine.gov 403]:
  - Pierce Pond: "sufficient annual angler harvest" of white perch is desirable to guard against overpopulation and stunting.
  - Pleasant River Lake (Washington County) has "a dense population of stunted white perch".
  - Liberal or no bag limits on white perch date from 1950s Maine resolves.

### What holds a shallow Maine lake at ~15–35 kg/ha [derived and inf, combining WPR and FSD]
1. **Predation on ages 0–1** in the littoral and at twilight: this note.
   - **Consumption check.** Maine pickerel 4–8 kg/ha (Rupp & DeRoche, FSD) and bass ~3–8 kg/ha, at Q/B ≈ 3–4 a year, eat ~20–60 kg/ha/yr of food. At Cooper's 55–61 % white perch, that is **~10–35 kg/ha/yr of white perch**.
   - At ~8 g each, that is ~1,200–4,400 white perch per hectare per year, almost all young-of-year and yearlings. Much of the year's white perch production goes to predators before the fish reach the census size.
2. **Size-dependent first-winter mortality** (Johnson & Evans 1990; WPR §2).
3. **Food limitation**, giving slow growth rather than starvation (stunting at 7–10-cm maturity; WPR §3).
4. **Adult mortality rising with age**: low at ages 3–8, ~0.5/yr past 9 (FSD item 1).
5. **Egg predation and cannibalism** (WPR).
6. **Angling** (a few to ~10 %/yr of adults under a 25-fish bag), plus episodic summer die-offs.

Shallow lakes may sit at the upper end of the range (Cooper's CPUE), but white perch should not double in a year once established (WPR).

### Gaps (Q3)
- No northeastern study measures white perch density before and after a change in predators.
- No Maine white perch biomass by lake exists.
- Feiner's and Gosch's full texts were blocked, and the MDIFW lake surveys returned 403.

---

## Gaps and conflicts (overall)
- **Day band.** Stanley & Danie's 4–9 m (source lakes unknown) against the light-equivalent ~1.5–5 m in brown Hot Brook. Missisquoi's turbid open bay was used around the clock. Treat the day band as "beyond the weeds, over open soft bottom", not "the deepest hole".
- **Bass offshore.** SMH found no evidence of bass hunting schools offshore and put ≤ 10–20 % of bass food beyond 150 m. Against that, Missisquoi's open-bay nets took smallmouth at 71 % of stations, and Cooper's overnight sets at 3–15 m took 66 bass.
  - These are reconciled if bass (and pike or pickerel) make dusk-to-dawn forays over open bottom while holding the shore by day, as SMH's twilight band [150, 250] m already does.
  - Missisquoi's < 1-m Secchi may also make its open bay "cover".
- **Bass diet: crayfish against white perch.** PDPM's 35–55 % crayfish for bass versus Cooper's 14 % crayfish and 61 % white perch in Maine white-perch lakes (FSD flags this too). For Hot Brook (soft, coloured water; crayfish "not common" per the user), Cooper is the better guide.
- **Not reached (not bypassed):**
  - KMAE (Gosch & Pope 2011) 403;
  - UNL Digital Commons PDF 403;
  - BioOne (Couture & Watzin 2008);
  - NCSU repository (bot check);
  - maine.gov lake surveys and fishing report 403;
  - afs.confex.com (DNS failure);
  - the UVM thesis page 403.
- **Brodersen et al. 2015** was read through the publisher's own cookie redirect, with no login or bot check. Its figures and supplementary tables (catch rates, the share of pickerel caught in open water) were not readable.

---

## Implications for the sim

### A. White perch bands for a 3–5.5-m lake
Bed depth is for Upper; Lower is capped at its 3.9 m. Distances are from shore, using SMH's geometry: the weed edge at bed ~2–3.5 m lies ~50–150 m out. A star (*) marks [inf].

| Stage and time | Bed depth (m) | From shore | Column | Group | Notes |
|---|---|---|---|---|---|
| **Adult ≥ 15 cm, summer day** | **2.5–5.5**, weighted to the deeper half (~70 % ≥ 3.5)* | mostly ≥ 150 m* | 0–1.5 m off the bed, sometimes mid-column | schools 50–200, roaming | open soft bottom, never in weeds. Let ~20–30 % of daytime fish-hours be forays to bed 2–3.5 m (more on overcast days)* |
| Adult, dusk (sunset −45 min → +45 min) | crossing 3.5 → 1.5 | 150 → 30 m | near the bed; **on calm evenings a surface layer 0–0.5 m over open water** for ~30–60 min | schools breaking up after sunset | feeding peak |
| Adult, night | **0.5–1.5** (≤ 2.5) | ≤ ~60 m (pull inshore, none within ~20 m)* | whole column | loose | keep feeding at a lower rate |
| Adult, dawn (sunrise −45 → +45 min) | 1.5 → 3.5+ | 30 → 150 m | near the bed | reform schools before sunrise | |
| **Sub-adult 8–15 cm, summer day** | **1.5–3.6** | 30–200 m | near the bed | schools | the outer weed edge and the open bottom beyond. Stanley & Danie's juvenile 2.4–3.6 m is its deeper half |
| **Young of the year (≤ ~7 cm), July–Oct, day** | **0.5–2.5**, unvegetated bottom and the weed edge, not dense beds | ≤ 60 m* | near the bed or mid-column | dense schools, patchy | Missisquoi seines; Cooper's day seines; Harris |
| Young of the year, night | 0.3–1.5 | ≤ 30 m* | | | shallower after dark (Harris) |
| Spawning (~15–21 °C, late May–June) | 0–1.5 flats (gravel, sand) and **the inlet brook and the connecting brook** | shore | bed | hundreds | dusk peaks; a run into Upper's south inlet fits the user's catches |
| Autumn (water < ~18 °C → ice-on) | **1.5–3.5** by day, then the basin | 30–150 m | near the bed | schools | the sim blends to winter only below ~9 °C (`wf`). Add an autumn day band, or blend the day band toward 1.5–3.5 m from ~18 °C |
| Early ice (first 2–4 weeks) | 1.5–3.5 (green weeds and edges) | 30–150 m | 0–1 m off the bed | | then the basin |
| Midwinter | ≥ 3.9 (Upper), ≥ 3.3 (Lower) | basin | 0–2 m off the bed | compact, roaming | as now |

**Parameter sketch** for `S3.whiteperch` (`src/w3/fish3.js` l. 302–304), not applied:
- **`hab.day.bot`** [3.5, 5.5] → **[2.5, 5.5]**, keeping a deeper weighting if the band is sampled uniformly.
- **`habJ`** { L: [8, 12], bot: [2.4, 3.6] } → **{ L: [7, 15], bot: [0.5, 2.5] }**. Fish of ≤ 7 cm then hold 0.5–2.5 m, an 11-cm fish ~1.5–4 m, and a 15-cm fish the adult band.
- **Optionally a `shore` band** like the bass's: night [20, 60] m and twilight [60, 200] m real, none by day. This makes the night flats near shore rather than any 0.5–1.5-m bottom (Upper's offshore shoals included).
- **A dusk surface option** (v 2, h 0–0.5 m) on calm evenings.
- **An autumn day band** of 1.5–3.5 m and **an early-ice band** of 1.5–3.5 m.

### B. Where and when predators should meet white perch
Targets for July–October. Shares are of the predators' white perch kills [inf, anchored as stated].

| Window | Place (bed) | Predator | White perch caught | Share of white perch kills | Anchors |
|---|---|---|---|---|---|
| **Dusk and dawn, ±1 h of sunset and sunrise** | the outer weed edge and flats, **1–3.5 m, ~30–150 m out** | pickerel at the weed edge (active ~21–22 % of intervals), bass moving up and out (SMH twilight band 150–250 m) | adults and sub-adults crossing, schools breaking up or forming | **40–60 %** | Major 1977; PEA timing; light calculation above |
| Day, littoral | 0.5–2.5 m, unvegetated bottom and weed edges | pickerel ambushing from the edge; bass along rock and wood | young of the year (Aug–Oct, 4–8 cm) and yearlings (8–12 cm) | **25–45 %** | Cooper (young in warm shallow water; Pushaw October 4.9 g each); Harris; Missisquoi seines |
| Day, basin edge and open bottom | 2.5–4 m | large bass (> 40 cm, deeper in late summer) and large pickerel (> 45 cm, deep weedlines) | sub-adults and small adults | **5–20 %** | Cole & Moring (HAB3D); Cooper's "larger pickerel in deep waters"; Missisquoi and Cooper nets; Brodersen |
| Night | 0.5–2.5 m flats beside the weeds | bass (low-light vision; shallowest 23:00–03:00); pickerel near-inactive | feeding white perch | **≤ 5–10 %** | Suski & Ridgway; pike 2 % active at night |
| Spawning (late May–June) | 0–1.5-m flats and brook mouths, at dusk and night | pre-spawn bass; post-spawn pickerel | spawning adults | small; mostly eggs eaten by white and yellow perch | WPR |
| Under ice | early ice: weed edges 1.5–3.5 m; midwinter: basin | pickerel (≤ 2.5 m, within 30 m of shore); bass ~inactive | some at early and late ice; ~0 in midwinter | **< 5 % of the year's** | HAB3D; MDIFW ("bass almost never caught" in winter) |

**Season.**
- Autumn (September–November) should be the peak of white perch predation: the young at 5–8 cm, white perch on the weed edges, predators feeding hard at 10–20 °C.
- Cooper's October pickerel held 43 % white perch by volume, 9 of 18 items.

**Predator settings this implies.**
- Pickerel are active at dusk and dawn at the outer edge of the weeds (bed 1.5–3.5 m), facing open bottom. Fish > 45 cm are allowed to roam the 2.5–4-m deep weedline and open bottom by day.
- Bass keep their daytime shore band (SMH) but make the twilight forays already coded. Large bass are allowed over 3–5.5 m in late summer.
- Neither should be fully "at rest" during the ±1-h twilight windows.

### C. Diet-share targets
Annual, open-water season. The Maine numbers are Cooper 1941 volumes, close to mass.

| | Pickerel ≥ 30 cm | Smallmouth ≥ 22 cm |
|---|---|---|
| All fish | **85–95 %** (Cooper ~95 %; Wentzells 85 %) | **70–85 %** (Cooper 80 %) |
| White perch | **40–60 %** (Cooper 55 %; Pushaw October 43 %). Hot Brook lacks Cooper's golden shiner and smelt (17 %), so up to ~65 % is plausible | **40–60 %** (Cooper 61 %) |
| Yellow perch | 8–25 % (Cooper 7.5 %; MDIFW's first-named prey) | 10–20 % (Cooper 14 %) |
| Fallfish, dace, killifish, sunfish, bullhead, young sucker, cannibalism | 10–25 % (Cooper: bullhead 4.5 %, pickerel 6.2 %; **no suckers** in any stomach) | ≤ 10 % (Cooper: pumpkinseed 2 %) |
| Tadpoles and frogs | 2–5 % (Cooper 4.4 %) | ~0–4 % |
| Crayfish | **≤ 5 %** (Cooper 0.5 %) | **10–20 %** (Cooper 14 %) |
| Insects | ≤ 5 % (adults; Cooper 0.2 %; up to ~15 % odonates in brown NS water) | 3–8 % (Cooper 4 %) |

**By count.** White perch ≈ 30 % of all pickerel items and ≈ 40–45 % of fish items (28 of ~65). For bass, 33 % of all items (16 of 48) [derived].

**Sizes of white perch eaten.**
- 90 % should be 5–12 cm, with a median ~8 cm: yearlings in June–August, young-of-year from August.
- White perch ≥ 15 cm should be ≤ 10 % of white perch items. Most of those go to pickerel > 45 cm and bass > 40 cm.
- If the sim's white perch become stunted (most under 15 cm), the share of mature fish eaten should rise, as in Branched Oak.

**Rates.**
- ≈ **0.15–0.6 white perch per adult pickerel per day** from June to November, central ~0.3. This lies between Cooper's stomach-count floor (0.12–0.25) and the energy ceiling (0.5–0.8).
- Bass ≈ 0.1–0.5 per day from June to September; ~0 under ice.
- Lake-wide, with Maine predator biomasses, that is **~10–35 kg/ha/yr of white perch eaten** (~1,200–4,400 fish/ha/yr), almost all young-of-year and yearlings [derived].
- **Against the present sim.** One white perch in 20 July days is 3–4 orders of magnitude below the target, for any plausible number of predators.

### D. Checks to run (≥ 3 seeds; per CLAUDE.md)
1. **White perch summer positions by stage and hour.** Adults: daytime median bed ≥ 3 m and ≥ 70 % of positions beyond the weed edge. Night: ≥ 60 % over ≤ 1.5 m. Young-of-year by day: ≥ 60 % over 0.5–2.5 m.
2. **Kills by hour and by bed band** (a T_WHERE/T_WHEN-style tally). Twilight ±1 h should hold 40–60 % of summer white perch kills, day 30–55 % and night ≤ 10 %; bed 1–3.5 m should hold most of them.
3. **Predator diets by mass and count** against table C; white perch eaten by length (median ~8 cm).
4. **White perch numbers and biomass.** Ages 0–1 should lose a large share of their production to fish predators. Biomass should settle at 15–35 kg/ha without a census cap. Sunfish, killifish and yellow perch young should persist in the littoral (Missisquoi).
5. **Season.** September–November should be the white perch predation peak; under-ice kills should be < 5 % of the year's.
