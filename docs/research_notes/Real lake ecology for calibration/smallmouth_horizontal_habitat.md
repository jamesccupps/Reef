# How far from shore adult smallmouth bass live in lakes, by season and time of day

Compiled 2026-10-20 for the 3-D sim of Upper and Lower Hot Brook Lake, Maine. Both lakes are shallow, unstratified saucers:
- **Upper:** 369 ha, mean 3.0 m, max 5.5 m;
- **Lower:** 274 ha, mean 2.6 m, max 4.1 m.

The water is tea-coloured, with a Secchi depth of about 3–4 m. In MDIFW's words, the shoreline is "mostly rocky with some areas of sand" and the "lake bottom is mostly muddy" (`Hot Brook populations and water/hot_brook_lake_records.md`).

**The sim problem.** `src/w3/fish3.js` `S3.bass` gives adult bass only a bed-depth band:
- by day `H([1.5, 4.0], …)`;
- at night `H([1.0, 2.5], …)`;
- in winter `H([2.5, 5.5], …)`;
- a home range of `HOME(50, 700)` (700 m at true scale).

The code comment says "within ~50 m (real) of shore", but nothing enforces it. In these saucers that band covers most of the open basin. Bass spend half the day over it eating schooling perch, and they grow far faster than Maine bass (about 4 cm/yr at 26 cm). The human, who fishes these lakes, says bass are "usually closer to shore, but I've got some in the open area".

**How this note relates to the repo's notes.** It does not repeat what is already there. It cross-references:
- **HAB** = `Seasonal fish habitat use/perch_pickerel_smallmouth_pumpkinseed.md`. Holds smallmouth depth by season and diel period (Opeongo, Green Lake, Milipsigate), wintering sites, nest depth and nest distance from shore, and the perch dusk/dawn inshore migration.
- **JRB** = `Real lake ecology for calibration/juvenile_refuges_and_bass_young.md`. Holds the young bass's water, cannibalism, and depth refuges.
- **PEA** = `Real lake ecology for calibration/piscivore_encounter_attack.md`. Holds reaction distance, light, capture, the prey-size windows, and the dusk perch window.
- **FMG** = `Whole lake 3D fish simulation/fish_movement_and_groups.md`. Holds home ranges, speeds, Milipsigate seasonal maps, and the Cooke 2001 EMG activity data.

**What is new here:**
- Bevelhimer's measured distances from shore and time budget.
- Lake of Two Rivers positional telemetry (Bloomfield et al. 2022).
- The Opeongo track geometry (Ridgway et al. 2002, Table 4).
- Kaemingk 2011 and Carter 2012 on offshore use.
- The Illinois harbour reports (Savitz 2001).
- Substrate selection (Brown & Josephson 2000; Miranda et al. 2021).
- Water clarity and pelagic feeding (Stasko 2013).
- **Hot Brook's own geometry:** how depth maps onto distance from shore in the true-scale grid (§0).
- **A calibrated parameter set:** shore, depth, structure and time weights, checked against that grid (Implications).

**Tags.**
- [FT]: full text read;
- [ABS]: abstract or abstract-level record read;
- [SEC]: secondary source, search-engine digest or angler/agency page;
- [derived]: my arithmetic, or computed from `src/w3/true/hotbrook3d.js`.

**Instructions seen in fetched content.** None.

---

## Summary: the numbers that matter

| Quantity | Value | Basis |
|---|---|---|
| Adults within a short distance of shore, summer, lakes and reservoirs | **most of the time within 5 m of shore and 3 m of the surface** (steep reservoir banks, < 2 m deep); never in the open main channel except when crossing small embayments | Bevelhimer 1995 [FT] |
| Share of positions near shore, small lake (336 ha, max 17 m, rocky shallows, silt at depth) | **79 % of June positions within 50 m** of the east or west shore. June overlaps the nesting season. Spring (April–May): spread over the lake centre and both shores | Sergio 2026 [FT] |
| Summer niche, a 306-ha lake (positional array) | "shallow positions … in nearshore areas"; lowest overlap with lake trout in summer; winter niche deeper and **farthest offshore** | Bloomfield et al. 2022 [FT] |
| Home-range shape | along-shore: **0.84–1.68 km of shoreline** (mean 1.26 km) per fish in a reservoir; Opeongo max range extent 4.5 km, an island-shore strip of 4–5 km in Lake Ontario | Bevelhimer 1995 [FT]; Ridgway 2002 [FT]; Rupnik 2018 (HAB) |
| Daily track | 0.8–3.5 km/day (reservoir); 4.8 km per 11-h daytime track (1.3–9.0), mean 483 m/h, **net displacement 1.2 km**, track extent 1.9 km ≈ half the home-range extent | Bevelhimer 1995; Ridgway 2002 [FT] |
| Time moving | **42 % of daylight + twilight** (about 05:30–21:30), **28 % of 24 h** (6.7 h/day); activity peaks in the afternoon, minimal at night | Bevelhimer 1995 [FT] |
| Mean horizontal speed, all positions | summer 3.4–3.7 m/min (about 210 m/h); spring 1.5–3.3; fall 1.5; winter 1.1–1.2 | Bloomfield 2022 [FT] |
| Who goes offshore | **large fish (> 406 mm) in late summer** (deeper water > 8 m); **after spawning, both sexes go deeper and farther offshore, females farther than males**; smallmouth regularly at an artificial reef **about 2.3–2.8 km offshore at 7.5 m** (Lake Michigan) | Cole & Moring 1997 [ABS]; Kaemingk 2011 [ABS]; Carter 2012 [ABS] + IDNR [SEC] |
| Structure | when not moving, "often associated with" fallen trees, logs, boulders, overhanging bushes; adults seen **only over wood and cobble** (never sand or silted rock), > 300 mm nearly all on wood; adults **select rock/riprap, avoid sediment and aquatic plants** | Bevelhimer 1995 [FT]; Brown & Josephson 2000 [ABS]; Miranda et al. 2021 [ABS/SEC] |
| Pelagic feeding | rises with **water clarity** (clearer → more pelagic carbon, narrower niche); bass were littoral relative to walleye; in lakes < 4 m mean depth, isotopes can't separate the two zones | Stasko 2013 [FT] |
| Perch in bass diets | age-0 perch eaten by bass **nearshore, in fall and the perch's 2nd year** (offshore consumers in early summer: walleye and white perch) | Fetzer 2013 [SEC], also in PEA |
| **Hot Brook geometry** | the sim's day band (bed 1.5–4.0 m) puts the **median bass 150 m (Upper) / 180 m (Lower) from shore, 50–60 % beyond 150 m**; the shore's first 25 m is < 1 m deep; the 2–3 m contour lies 50–150 m out | §0 [derived] |
| Proposed day weighting | shore weight 1 to 60 m, falling to 0.05 at 120 m, times bed 1.0–3.0 m → **median 48 / 58 m, about 90 % within 100 m, 4–5 % beyond 150 m** | Implications [derived] |

---

## 0. Hot Brook's geometry: what a depth band means in distance from shore [derived]

Computed from the true-scale grid (`src/w3/true/hotbrook3d.js`: 5-m cells, the 1949 soundings fitted to today's shore). Distance to shore is the Euclidean distance to the nearest land cell, islands included. Script: a chamfer distance transform over `body`. It can be rebuilt in a few lines (see Implications (a)).

**Area by distance from shore, with the mean bed depth of each band:**

| Distance from shore | Upper: % of area (cum.) | Upper: mean bed | Lower: % of area (cum.) | Lower: mean bed |
|---|---|---|---|---|
| 0–25 m | 9.9 (9.9) | 0.78 m | 9.7 (9.7) | 0.54 m |
| 25–50 m | 9.5 (19.4) | 1.69 m | 9.2 (18.9) | 1.22 m |
| 50–75 m | 8.9 (28.4) | 2.45 m | 8.6 (27.6) | 1.91 m |
| 75–100 m | 8.5 (36.9) | 2.87 m | 8.3 (35.9) | 2.37 m |
| 100–150 m | 15.8 (52.7) | 3.22 m | 14.9 (50.8) | 2.83 m |
| 150–200 m | 14.0 (66.6) | 3.53 m | 13.4 (64.1) | 3.13 m |
| 200–300 m | 21.9 (88.5) | 3.77 m | 23.2 (87.3) | 3.30 m |
| 300–485 m | 11.5 (100) | 4.06 m | 12.7 (100) | 3.42 m |

**Shoreline length, islands included:** Upper ≈ 15 km and Lower ≈ 11 km. This is the land–water cell-edge count × 5 m × π/4 (the correction for random orientation). It agrees with the 0–25-m band's area ÷ 25 m (14.6 and 10.6 km).

**Bed depth against distance from shore** (% of each lake's area):

| Upper: bed \ distance | 0–25 | 25–50 | 50–100 | 100–150 | 150–250 | 250+ |
|---|---|---|---|---|---|---|
| 0–1 m | 7.5 | 2.4 | 1.1 | 0.3 | 0.2 | 0.0 |
| 1–1.5 m | 1.7 | 2.0 | 1.8 | 0.7 | 0.7 | 0.4 |
| 1.5–2 m | 0.6 | 1.7 | 2.1 | 1.6 | 1.4 | 0.4 |
| 2–3 m | 0.2 | 2.8 | 5.5 | 4.1 | 3.8 | 1.1 |
| 3–4 m | 0.0 | 0.6 | 5.1 | 4.3 | 10.6 | 11.8 |
| 4–6 m | 0.0 | 0.0 | 1.9 | 4.9 | 9.6 | 7.6 |

| Lower: bed \ distance | 0–25 | 25–50 | 50–100 | 100–150 | 150–250 | 250+ |
|---|---|---|---|---|---|---|
| 0–1 m | 9.0 | 4.2 | 2.3 | 0.2 | 0.0 | 0.0 |
| 1–1.5 m | 0.6 | 2.1 | 1.2 | 0.1 | 0.0 | 0.0 |
| 1.5–2 m | 0.1 | 1.7 | 2.6 | 0.5 | 0.0 | 0.0 |
| 2–3 m | 0.0 | 1.2 | 8.8 | 8.9 | 8.9 | 2.3 |
| 3–4 m | 0.0 | 0.0 | 2.1 | 5.1 | 16.7 | 21.1 |
| 4–6 m | 0.0 | 0.0 | 0.0 | 0.2 | 0.1 | 0.0 |

**What this means:**
- **The bed band 1.5–4.0 m is 58 % of Upper and 80 % of Lower.** Only 10 % (Upper) and 4 % (Lower) of it lies within 50 m of shore, and 32 % / 21 % within 100 m.
- **The first 25 m is a < 1-m shelf.** That is nest and night water, not the 1.5–4.6 m daytime water MDIFW gives for adults (HAB).
- **The adult's nearshore water in Hot Brook is about 25–100 m out.** This is the slope from 1 m to 3 m, which ends where the rocky shore band meets the mud. A "within 50 m" figure from a steeper lake (Milipsigate) therefore corresponds to roughly "within 75–100 m" here.
- **Upper has true offshore shoals:** about 3 % of the lake at 1–2 m bed more than 150 m from shore. Bass *should* find some fish there (the human's "some in the open area").
- **A depth band alone cannot confine bass to the shore.** Even a narrow 1.0–2.5-m band leaves 29 % (Upper) / 22 % (Lower) of bass weight beyond 150 m, with a median of 80–90 m.

---

## 1. Distance from shore, home-range shape, littoral vs offshore, by season and time of day

### Takeaway
- **Summer adults are littoral and shore-anchored.** Every lake or reservoir telemetry study with horizontal data places most summer positions along the shore, within tens of metres of it (5 m on steep reservoir banks; ≤ 50 m in a 17-m lake).
  - They are not seen over the open basin except when crossing small bays, or as a minority of positions.
- **Ranges are strips along the shore.** Home ranges are measured as shoreline length: 0.8–1.7 km per fish in a reservoir, and a 4–5-km island shore in Lake Ontario. Opeongo's 200–400-ha kernels have a maximum extent of about 4.5 km.
  - Fish cover a large part of the range each day (daily track about 110 % of the range's length), but net displacement is small.
- **Who and when goes offshore:**
  - large adults (> 40 cm) in late summer, into deeper water;
  - both sexes after spawning, females farther;
  - fish at offshore *structure*, such as a reef 2–3 km out in Lake Michigan;
  - in autumn, travel to wintering sites (HAB).
- **Under ice:** a few wintering sites, which in Lake of Two Rivers were the deepest and farthest-offshore niche of the year. At Milipsigate they were < 8 m deep.
- **Diel:**
  - active by day, with an afternoon peak or dawn/dusk peaks (studies differ);
  - little or no horizontal movement at night (Opeongo, Melton Hill);
  - by depth, shallower at night in Opeongo, but "shallow to deeper water at night where activity slowed and eventually stopped" by Emery 1973 and Helfman 1981 (via Bevelhimer).
  - In Hot Brook's gentle saucers a fish can be "shallower" by rising off the bed, so the depth result says little about distance from shore.
- **Shallow-lake direct data are scarce.**
  - Lake St. Clair (mean about 3.4 m) is, per Michigan DNR, "nearly all" bass habitat. That is a huge lake with offshore weed, rock and mussel cover, and no positional results are published yet.
  - No telemetry study of adult smallmouth in a *small* shallow saucer like Hot Brook was found.

### Cited findings
- **Melton Hill Reservoir, Tennessee** (ultrasonic temperature tags; 12 adults, 4 tracked > 12 h for activity; 1986–87) [FT] — [Bevelhimer 1995, Proc. SEAFWA 49:240–249](https://seafwa.org/sites/default/files/journal-articles/BEVELHIMER-240-249.pdf)
  - **Distance from shore and depth:** tracked fish were within 3 m of the surface and 5 m of the shore most of the time, whatever the inshore temperature (> 28 °C). The 1986 fish were usually in the littoral zone too. In the discussion: "usually near shore and in shallow (< 2 m depth) water".
  - **Open water:** except when crossing small embayments, smallmouth were never found in the open water of the main channel.
  - **No diel inshore/offshore commuting,** even though cooler water lay offshore. The study was designed to look for exactly that.
  - **Home range as shoreline:** observed shoreline ranges of 840, 1,680, 1,510 and 1,000 m (mean 1,258 m) for the four fish with the most fixes.
  - **Daily distance:** 825–3,477 m (mean 1,243 m).
  - Searches started 100–300 m up and down the shore from the last fix.
  - The reservoir is a dammed river: steep banks and a channel. The "5 m" is a steep-bank number.
- **Milipsigate Lake, NS** (336 ha, max 17 m, island-studded; rocky in the shallows, silt at depth; 12 adults; 21-receiver VPS array; Sept 2018 – July 2019) [FT] — [Sergio 2026, Dalhousie MSc, ch. 3](https://dal.scholaris.ca/bitstreams/0d151e69-14e6-46e0-ab65-3fac80168436/download)
  - **Sept–Oct:** spread across the array, partly an artefact of tagging and release.
  - **Dec–Mar:** four wintering sites, nearly sessile (HAB).
  - **April–May:** "dispersed broadly", over the lake centre and both shores. The author lists "pelagic areas, island perimeters, and lake shorelines" at the start of spawning.
  - **June:** 79 % of positions within 50 m of the east or west shore. The author attributes the summer pattern partly to spawning-habitat selection, since male guarding runs from late May to early July. So **June is inflated by nesting males.** July–August were not covered (the study ended in July).
  - **The model and the data disagree in summer:** the RSF predicted high use of the lake centre in summer, but very few or no positions were there.
  - Strong individual variation (significant random fish effect).
- **Lake of Two Rivers, Algonquin, ON** (306 ha, max 41.5 m, mean 14.5 m; dimictic; 17 tagged, 13 retained; positional array, 286,726 positions; error < 6 m) [FT] — [Bloomfield, Guzzo, Middel, Ridgway & McMeans 2022, *Front. Ecol. Evol.* 10:986459](https://www.frontiersin.org/articles/10.3389/fevo.2022.986459/full)
  - **Summer:** shallow positions in nearshore areas. Overlap with lake trout fell to 0.1 % (standard ellipse) in summer, against 6–12 % in spring and fall.
  - **Winter:** slightly deeper, with a narrower distance-to-shore range. The discussion calls it the deepest and farthest-offshore habitat of the year.
  - **Horizontal rate (m/min, mean ± SD):**
    - summer 3.7 ± 5.1 and 3.4 ± 5.2;
    - fall 1.5–1.6;
    - winter 1.1–1.2;
    - spring 1.5–3.3.
  - **Diet:** in spring, yellow perch and benthic invertebrates. In summer, no pelagic shift (no zooplankton, unlike lake trout); in the other lake, crayfish.
  - No numeric distance values are given in the text.
- **Lake Opeongo track geometry** (5,860 ha; 15 fish tracked 6–16 h in daylight at 15-min fixes) [FT] — [Ridgway, Shuter, Middel & Gross 2002, AFS Symp. 31, Table 4](https://www.harkness.ca/PDFs/Contributions%202000s/Ridgway%202002%20Smallmouth%20Bass%20the%20Jouvenile%20Transition%20Hypothesis.pdf)
  - **Per track:**
    - total distance 4.80 km (1.25–9.01);
    - maximum extent 1.90 km;
    - net displacement 1.23 km (0–4.2);
    - rate 483 m/h (110–1,120).
  - **Home range:** maximum extent 4.47 km (1.67–11.43).
  - A day's track covered about 110 % of the home range's length but reached only about half its extent. So the fish **patrol** a range rather than commute across it.
  - The lake has "a relatively narrow shallow zone around the perimeter", and fish were found by sweeping embayments and points. Two fish tracked 24 h showed little or no movement in the evening.
- **Green Lake, Maine** (44 radio-tagged fish, 10 June – 1 Sept 1993) [ABS] — [Cole & Moring 1997, *TAFS* 126:815](https://pubs.usgs.gov/publication/70019479). Already in HAB; here only the horizontal reading.
  - Large fish (> 406 mm) were in water > 8 m and at mid-depths (4–8 m) more often in late summer.
  - Small and medium fish used cover more.
  - Small fish had smaller total ranges.
  - Suski & Ridgway 2009 read this as size-dependent depth *within the littoral zone*.
- **Beaver Island Archipelago, Lake Michigan** (16 ultrasonic-tagged fish, 2007–08; site fidelity, excursions, **distance from shore**) [ABS] — [Kaemingk, Galarowicz, Clevenger & Clapp 2011, *J. Great Lakes Res.* 37:625](https://digitalcommons.unl.edu/natrespapers/709)
  - Post-spawn, both sexes moved into deeper, more offshore water, females farther than males.
  - Excursions were higher at spawning.
  - The PDF is behind a Cloudflare challenge; not bypassed.
- **North Point Marina, Lake Michigan** (26 smallmouth, 8 largemouth; radio and acoustic; 2005–06) [ABS] — [Carter, Weber, Dettmers & Wahl 2012, *J. Great Lakes Res.* 38:396](https://doi.org/10.1016/j.jglr.2012.02.003) ([record](https://experts.illinois.edu/en/publications/movement-patterns-of-smallmouth-and-largemouth-bass-in-and-around/))
  - Smallmouth left the warm harbour once the lake neared about 18.5 °C and came back on cooling.
  - Home ranges: smallmouth 142.6 ha, largemouth 12.9 ha.
  - **Offshore structure** [SEC]: adult smallmouth were found most often at an artificial reef about 1.4 miles (2.3 km) offshore in about 25 ft (7.6 m). A search digest gives 2.8 km / 7.5 m for late summer and fall. — [Outdoor Illinois, April 2006](https://dnr.illinois.gov/content/dam/soi/en/web/dnr/oi/documents/april06degrees.pdf)
- **Illinois harbours, Lake Michigan** (sonic tags; agency report) [FT] — [Savitz 2001, IDNR annual performance report](https://repository.library.noaa.gov/view/noaa/74136)
  - By mid-summer, smallmouth are "no longer effectively sampled" by nearshore electrofishing, and anglers catch fewer near shore in mid–late summer than in spring.
  - Tagged fish moved from the capture shoreline to the shipping channel and along the breakwall. Some reached the open lake.
  - No difference between morning and afternoon locations.
  - Summer departure to deeper water fits Lake Michigan surveys and Cole 1994.
- **South-central Lake Ontario and two tributaries** (temperature-sensing radio tags) [ABS via search digest] — Gerber & Haynes 1988, *J. Freshw. Ecol.* 4(4) ([SOAR record](https://soar.suny.edu/entities/publication/cef37268-63b2-4fbf-9e14-87e9fea7c510), 403 to me)
  - Fish that did not home "generally dispersed along the lake shore and eventually established small residence areas in the lake".
  - Most active in May, least in July.
  - Lake activity peaked at mid-day and correlated with light.
  - Occupied 20–22 °C when available.
- **Lake Opinicon, ON** (787 ha, max < 11 m, unstratified; offshore gillnets at 1.5–7 m) [ABS summary] — [Keast & Fox 1992, *Env. Biol. Fish.* 34:159](https://research.qubs.ca/projects/space-use-and-feeding-patterns-of-an-offshore-fish-assemblage-in-a-shallow-mesotrophic-lake)
  - The offshore assemblage was bluegill, black crappie, yellow perch, alewife and golden shiner. Smallmouth and largemouth occurred offshore only "in small numbers".
  - This is the nearest shallow-lake evidence that adult bass are a minority over the open basin.
- **Lake Erie, Ohio waters** (216 acoustic tags, 2023–24; preliminary) [SEC] — [Ohio Sea Grant 2025](https://ohioseagrant.osu.edu/news/2025/1dvkz/smallmouth-bass-lake-erie-sedentary-or-migratory)
  - Most fish stayed near their capture sites; a few made very long trips (partial migration).
  - They avoided the deeper Central Basin.
  - Most movement was in April (to spawning) and September–October (to wintering); little during May–June nesting.
- **Lake St. Clair** (mean about 3.4 m) [SEC] — [Michigan DNR bulletin](https://content.govdelivery.com/accounts/MIDNR/bulletins/382e9a5)
  - "Nearly all" of the lake is ideal smallmouth habitat. Anglers fish offshore cover, positioned by wind ([Bassmaster blog](https://www.bassmaster.com/blog/northern-okeechobee)).
  - A large shallow lake *with* offshore cover is used across its basin. Telemetry results are not out yet.
- **Night, older field work** [via Bevelhimer 1995, FT]: Emery (1973) and Helfman (1981) saw smallmouth move from shallow to deeper water at night, where activity slowed and eventually stopped. Nest-guarding males are the exception (Hinch & Collins 1991, via Reebs 2002).
- **Maine agency** (HAB): spring and summer adults on shallow rocky areas or rocky drop-offs at 1.5–4.6 m, using wood, weed beds and rock as cover.
  - The MDIFW bass plan counts all water < 30 ft (9 m) as usable bass habitat (all of Hot Brook), with a target of 2.0 bass > 10 in per acre (about 5/ha) over it [FT, repo `fetched/blackbass.pdf`].

### Disagreements
- **Night depth:** shallower at night in Opeongo (telemetry), but shallow → deeper at night (Emery; Helfman, via Bevelhimer). The two can coincide with no horizontal move: fish rise off a steep slope, or settle onto it.
- **Diel activity peak:**
  - afternoon (Bevelhimer; Gerber & Haynes);
  - crepuscular (Emery; lab, Reynolds & Casterlin 1976);
  - continuous (Cooke et al. 2001, an enclosed 675-m forebay; FMG).
- **Summer offshore drift:** the Great Lakes reports (Savitz; Kaemingk; Carter) see a mid/late-summer move to deeper, more offshore water, tied to temperature and structure. Small lakes (Melton Hill; Milipsigate June; Two Rivers) stay nearshore. In unstratified Hot Brook (about 24 °C peak), temperature gives no reason to leave the shore.

### Gaps
- No positional telemetry of adult smallmouth in a small, shallow (< 6 m) lake. The nearest analogues are Milipsigate (336 ha, but 17 m deep) and Lake St. Clair (shallow but about 1,100 km²).
- No July–August distance-from-shore figure for a small lake. Sergio's June number includes nesting males.
- Not read:
  - Savitz et al. 1993 (*Ecol. Freshw. Fish* 2:31, "Diel and seasonal utilization of home ranges in a small lake by smallmouth bass") — the most relevant missing paper;
  - Hubert & Lackey 1980 (*TAFS* 109:364);
  - Demers et al. 1996 (*TAFS* 125:434);
  - Emery 1973;
  - Helfman 1981;
  - Todd & Rabeni 1989 (a stream study);
  - the Kraai et al. Meredith Reservoir work (only a walleye paper was found: [Parks & Kraai, SEAFWA 45:460](https://seafwa.org/sites/default/files/journal-articles/PARKS-460-469.pdf), walleye mostly ≤ 8 m deep within 100 m of shore).

---

## 2. Do smallmouth forage offshore on schooling perch (or white perch) in open water, and when?

### Takeaway
- **No study found shows adult smallmouth routinely hunting perch schools over an open, soft-bottomed basin in a small lake.** The evidence goes the other way.
  - **Perch in bass diets are mostly small perch taken nearshore:** age-0 perch in fall and in their second year, 60–110 mm (PEA).
  - **Water clarity matters:** smallmouth use more pelagic carbon in clear lakes. Picking a fish out against open water is harder than against the cluttered littoral. Hot Brook's tea-coloured water argues for *less* pelagic hunting.
  - **Summer diets stay benthic and littoral** in Shield lakes (crayfish), with perch in spring.
- **Offshore feeding does happen:**
  - large fish in late summer;
  - after spawning (deeper, more offshore);
  - at offshore structure (reefs, shoals);
  - in lakes with pelagic forage fish (cisco, smelt, alewife), where anglers report "suspended" bass;
  - Opeongo bass dip into the metalimnion, possibly after young cisco (authors' speculation).
  - Anglers on some lakes describe bass pushing perch schools on weed flats (Candlewood Lake, CT).
- **When:**
  - dawn is when Opeongo bass "largely function within the epilimnion and metalimnion";
  - 32 % of the daily ration was taken 03:00–12:00 in Columbia River reservoirs (Zimmerman 1999, PEA);
  - afternoon activity peaks in reservoirs and Lake Ontario.
  - The perch's own dusk breakup and inshore move (HAB, PEA) is when adult perch come to the bass, not the other way round.
- **Share offshore:** no direct number. The best estimate for Hot Brook [derived, low confidence]:
  - **≤ 10–20 % of adult bass consumption from water > 150 m from shore**, mostly by fish > 40 cm in late summer, and at dawn and dusk;
  - **≤ 5–10 % of daytime positions** there.

### Cited findings
- **Water clarity and pelagic use** (34 small Boreal Shield lakes; δ¹³C/δ¹⁵N of smallmouth and walleye) [FT] — [Stasko 2013, MSc, Laurentian](https://laurentian.scholaris.ca/handle/10219/2008)
  - In clearer lakes the smallmouth niche narrowed and moved toward pelagic carbon.
  - Walleye sat higher in trophic level and more pelagic than bass (paired t-tests, p < 0.001).
  - The author argues that a low-scatter (high-Secchi) background is needed for efficient bass foraging in the pelagic zone.
  - In lakes < 4 m mean depth, littoral and limnetic carbon converge, so isotopes cannot split the zones.
  - Bass in clear water are described as daylight hunters (citing Scott & Crossman 1973; Carter et al. 2010).
- **Benthic reliance across lake fishes** (470 diet and 90 isotope populations, 15 species) [ABS] — [Vander Zanden & Vadeboncoeur 2002, *Ecology* 83:2152](https://corescholar.libraries.wright.edu/biology/585). Zoobenthos made up 50 % of prey, plus 15 % through benthivorous fish prey (total 65 %). Species-level smallmouth values were not seen in the abstract.
- **Lake of Two Rivers diets** [FT] (Bloomfield 2022, above): perch and benthic invertebrates in spring; no pelagic shift in summer.
- **Oneida Lake** (shallow, mean 6.8 m) [SEC via search digest; also in PEA] — Fetzer 2013, Cornell PhD ([record](https://ecommons.cornell.edu/entities/publication/8c357a43-d606-4688-ab37-4a40bb1624f5)). Age-0 perch were eaten offshore in early summer by walleye and white perch. In fall and the perch's second year they were eaten nearshore by walleye and by smallmouth and largemouth bass.
- **South Dakota glacial lakes** [ABS, in PEA]: age-0 perch made up 0–42 % of smallmouth diet by weight (Dembkowski et al. 2015).
- **Opeongo** [FT] ([Suski & Ridgway 2009](https://www.harkness.ca/PDFs/Contributions%202000s/Suski%20and%20Ridgway%20J%20Zoology%202009.pdf)): the night rise is read as foraging, perhaps on crayfish. The dips into the metalimnion may be after young cisco (M. Ridgway, unpublished data).
- **Little Moose Lake, NY** (introduced bass; littoral sampling ≤ 6 m) [ABS] — Weidel et al. 2000 (*J. Freshw. Ecol.* 15:411). Crayfish were the most frequent prey June–August. Bass used benthic, terrestrial and littoral pelagic food.
- **Anglers** [SEC]:
  - Candlewood Lake guides target smallmouth that chase yellow perch schools "like largemouth torment schools of shad" ([ODU Magazine](https://www.odumagazine.com/mimic-yellow-perch/)).
  - Michigan smallmouth swirl on perch high in the grass on big weed flats ([In-Fisherman](https://in-fisherman.com/editorial/bass-in-july/155966)).
  - In trout lakes, the biggest smallmouth suspend over deep water on cisco ([Midwest Outdoors](https://midwestoutdoors.com/fishing/giant-smallmouths-from-northwoods-trout-waters/)).
  - Note that each of these is a *weed flat* or a *pelagic-forage* lake.

### Gaps
- No diet-by-location study (stomachs of bass caught offshore against inshore) in a small lake.
- No smallmouth littoral-reliance fraction from a shallow lake (isotopes cannot resolve it there).
- No study of bass feeding on adult white perch. White perch come inshore at night (HAB), when bass are inactive.

---

## 3. Structure: how strongly adults stay near it, and station-holding vs cruising

### Takeaway
- **Strongly structure-oriented when still.** They choose rock, cobble and wood (logs, fallen trees), plus boulders and overhanging bushes. They avoid soft sediment and, in reservoirs, beds of aquatic plants. Weed *edges* serve as cover in Maine and Ontario agency accounts (HAB).
- **The structure tie weakens with size.** Small and medium adults use cover more. Fish > 40 cm are less tied to cover and go deeper and farther out in late summer. But at Little Moose Lake the > 300 mm fish were "nearly all" on wood.
- **Cover beats temperature.** In paired lab tests, smallmouth accepted water > 29.5 °C to stay in cover, and lowered their activity there (Bevelhimer 1996, via Bevelhimer 1995).
- **Time budget:**
  - mobile about 40 % of daylight and twilight, and almost nothing at night;
  - when moving, they cover 1–5 km a day along a strip of shore, with little net displacement (patrolling).
  - The rest of the day is spent station-holding at structure.
- **Hot Brook:** the hard structure (rocky shore, wood) lies in the shore band, and the open bottom is "mostly muddy". So the structure preference alone keeps bass near shore, except at the offshore shoals.

### Cited findings
- **Melton Hill** [FT] (Bevelhimer 1995):
  - When not moving, bass were "often" at structures visible from the surface: fallen trees, submerged logs, boulders, overhanging bushes, fish attractors.
  - Mobile 6.7 h/day = 28 % of 24 h = 42 % of daylight and twilight.
  - 4.2 m/min while moving.
  - Activity and distance per hour peaked in the afternoon and were minimal at night.
  - Bevelhimer also cites cover use in lakes, reservoirs and streams (Emery 1973; Peterson & Myhr 1977; Hubert & Lackey 1980; Todd & Rabeni 1989).
- **Lab** [via Bevelhimer 1995, FT]: Bevelhimer 1996 (*TAFS* 125:274). Smallmouth took on the cost of > 29.5 °C water to use cover, and were less active at high temperature. Both cover and food set where they ended up thermally.
- **Little Moose Lake, NY** (snorkel transects, late June – early August 1997, four habitats: sand, wood, silt-covered rock, clean cobble) [ABS] — [Brown & Josephson 2000, *J. Freshw. Ecol.* 15:135](https://www.canr.msu.edu/resources/summer-habitat-use-introduced-smallmouth-bass-oligotrophic-adirondack-lake), doi 10.1080/02705060.2000.9663731
  - Adult bass were only on wood and cobble, and nearly all > 300 mm were on wood.
  - Young-of-year were only on sand and silted rock.
  - Bass were the most numerous fish in the littoral.
- **Ten Tennessee River reservoirs** (21 years of fall shoreline electrofishing; six habitats: sediment, gravel, rock, riprap, brush, plants) [ABS / SEC] — [Miranda, Lakin & Faucheux 2021, *TAFS*, doi 10.1002/tafs.10302](https://pubs.usgs.gov/publication/70229114). Adult smallmouth selected rock and riprap and avoided aquatic plants and sediment-dominated shoreline. Lithic habitat was the key.
- **Green Lake, Maine** [ABS] (Cole & Moring 1997): small and medium fish were near cover more than large fish, in both early and late summer.
- **Opeongo** [FT] (Ridgway 2002): long, tortuous daily tracks with low net displacement. That is foraging along a learned range (they call it spatial learning).
- **Winter** (HAB): anglers find bass hugging the bottom at hard-to-soft transitions at about 5 °C. The same edge (rock band meets mud) is the summer drop-off in Hot Brook.

### Gaps
- No quantitative "fraction of time within X m of structure" for lake smallmouth.
- No in-lake comparison of rock vs wood vs weed edge for adults.
- Demers et al. 1996 (EMG, smallmouth vs largemouth activity) not read.

---

## 4. Where and when bass meet yellow perch

### Takeaway (mostly from repo notes, with the Hot Brook translation)
- **Adult perch by day are offshore.** In shallow lakes they hold over the deepest open bottom (Lake Madison, about 344 m offshore; high-use cells 150–350 m out at 2.5–6.5 m; HAB).
  - In the sim they get bed 3.0–5.5 m, which in Hot Brook is 100–400 m from shore (§0).
- **At dusk, perch schools break up as light falls, migrate inshore along the bottom, and rest dispersed in the littoral at night.** They reverse at dawn (Imbrock 1996; Helfman 1979; Bauer et al. 2009; HAB, PEA).
- **Juvenile perch (≤ 15 cm) are littoral and benthic by day** (HAB; JRB; the sim's `habJ`), and are the perch bass actually eat (PEA).
- **So bass and perch meet in three places:**
  1. **all day in the littoral and at the weed edge, with juvenile perch;**
  2. **at the outer littoral edge (bed about 2–3.5 m, 50–150 m out in Hot Brook) at dusk and dawn, as adult schools pass inshore and out**;
  3. at night inshore, where perch rest on the bed but bass vision fails (PEA: 62 % capture at starlight, about 0 in darkness).
- **Daytime meetings over the open basin should be rare.** They are bass sorties, mostly by large fish in late summer.
- Helfman's twilight work adds a mechanism. Young golden shiners stay day-active while adults are crepuscular, which Helfman explained by twilight predation, and predators are more active at twilight (Helfman 1981 via [Reebs 2002](https://gambusia.zo.ncsu.edu/readings/Reebs%202002.pdf) [FT]; PEA).

### Cited findings (new here)
- **Static overlap in Hot Brook** [derived]. Each fish is spread over its preferred band, weighted by area, ignoring food:

  | Prey | Upper: current | Upper: proposed | Upper: ratio | Lower: current | Lower: proposed | Lower: ratio |
  |---|---|---|---|---|---|---|
  | adult perch (bed 3–5.5) | 1.00 | 0.29 | 0.29 | 1.17 | 0.27 | 0.23 |
  | juvenile perch (bed 1.5–4) | 1.52 | 1.08 | 0.71 | 1.19 | 0.86 | 0.72 |
  | white perch (bed 3.5–5.5) | 0.84 | 0.30 | 0.36 | 1.13 | 0.41 | 0.36 |
  | pumpkinseed (bed 0.3–2.5) | 0.89 | 1.90 | 2.13 | 0.72 | 1.98 | 2.77 |

  - **Index:** N·Σ p_bass·p_prey, where 1 means both are uniform. "Current" is the bass day band 1.5–4.0 m; "proposed" is the Implications day weighting.
  - **Result:** daytime overlap with adult perch falls about 3–4×, and with white perch about 3×. Overlap with pumpkinseed (and, by extension, killifish and littoral young) roughly doubles.
- **Side observation** [derived]: the sim's juvenile perch band (bed 1.5–4.0 m) is itself mostly offshore in Hot Brook terms (median 150–180 m out), not littoral. If juvenile perch are meant to be littoral (HAB: Post & McQueen, about 30 mm and up exclusively nearshore), they need the same shore term. Out of scope here; flagged.

---

## Implications for the simulation

### Diagnosis [derived]
- `S3.bass.hab.day.bot = [1.5, 4.0]` with no distance-from-shore term puts the median bass **150 m (Upper) / 180 m (Lower) from shore, with 50 % / 60 % of positions beyond 150 m and only 12 % / 6 % within 50 m.**
- Combined with a 700-m home radius and a food-weighted foraging footprint, the bass follow the adult perch schools over the open mud. The field shows the reverse:
  - at least about 80 % of summer positions in the littoral;
  - structure-bound when still;
  - perch caught mostly as juveniles nearshore.
- A depth band alone cannot fix this in a saucer. Even 1.0–2.5 m leaves 22–29 % beyond 150 m (§0). The model needs **an explicit distance-from-shore preference plus structure**.

### (a) A distance-from-shore field and preference
- **The field:** `GEO.shoreDist[c]`, the metres from each water cell to the nearest land cell (islands included). Compute it once at load with a two-pass chamfer transform over `body`; about 1.3 s in Node for the 455 × 1385 grid. In the 1/10 world, scale by `GEO.SCALE`.
- **The preference:** a soft weight multiplying the existing bed-depth weight:
  - `w_shore(d) = 1` for d ≤ D0, linear down to `wOut` at D1, and `wOut` beyond.
- **Calibrated on the real grid** [derived] (area-weighted, before food and structure):

| Mode | Shore D0 / D1 / wOut | Bed band (out-of-band weight) | Upper: < 50 m / < 100 m / > 150 m, median | Lower: same |
|---|---|---|---|---|
| **Summer day** | **60 / 120 / 0.05** | **1.0–3.0 m** (0.2) | 52 % / 92 % / 4 %, 48 m | 40 % / 89 % / 5 %, 58 m |
| Day, looser variant | 75 / 150 / 0.05 | 1.2–3.5 m (0.2) | 37 % / 81 % / 4 %, 62 m | 27 % / 75 % / 7 %, 73 m |
| **Night** (rest) | **50 / 100 / 0.03** | **0.5–2.0 m** (0.2) | 76 % / 97 % / 2 %, 31 m | 72 % / 98 % / 2 %, 38 m |
| **Twilight** (edge patrol, sun 0.02–0.3) | **150 / 250 / 0.15** | 1.0–3.5 m (0.3) | 26 % / 54 % / 23 %, 92 m | 18 % / 46 % / 28 %, 107 m |
| **Large fish (> 40 cm), 15 Jul – 15 Sep, day** | 120 / 250 / 0.15 | 1.5–4.5 m (0.2) | 18 % / 48 % / 26 %, 104 m | 12 % / 40 % / 32 %, 116 m |
| *Current (for comparison)* | none | 1.5–4.0 m (0.1) | 12 % / 33 % / 50 %, 150 m | 6 % / 22 % / 60 %, 180 m |

- **Seasons** (dates as year-fractions in `clock3`):
  - **Ice-out → nesting (about late April – mid May):** a wide spread (Milipsigate April–May: the lake centre too). Use the twilight row by day.
  - **Nest:** `nt > 0` already overrides. Nests at 0.5–1.5 m, 0.3–9 m from shore (HAB), i.e. Hot Brook's < 25-m shelf.
  - **Post-spawn → mid-September:** the summer rows.
  - **Mid-September → wintering:** widen toward the wintering site (the existing site memory). Use the twilight row by day; Sept–Oct was the widest-ranging period at Milipsigate.
  - **Winter (`wf` > 0.5):** no shore term. The wintering sites govern (HAB V6: at most 4 sites per lake; Two Rivers' winter niche was the farthest offshore of the year).
- **Blend** day ↔ twilight ↔ night with the same `nf`-style smooth light factor `_mode` uses. Twilight is a band, e.g. `smooth(0.02, 0.3, sun)` rising and falling, not a third discrete state.

### (b) Narrow the bed bands
- **Day:** `bot [1.0, 3.0]`. MDIFW's 1.5–4.6 m is for clear-water rocky lakes. In tea-coloured Hot Brook, light and the rock/mud edge sit shallower. For > 40 cm in late summer, `[1.5, 4.5]`.
- **Night:** `bot [0.5, 2.0]`, near the bed (`h` about 0.2).
- **Winter:** unchanged (`[2.5, 5.5]`, wintering sites).
- The size term reuses the `habJ` blend pattern with an "adult-large" end (L 35 → 45 cm) instead of juvenile.

### (c) Structure weighting (station-holding)
- **Score multipliers for a cell**, used where the fish chooses where to sit and where to forage (`_mode`'s target and the foraging footprint):

| Feature (from existing fields) | Weight at rest (day lulls, night) | Weight while cruising/foraging |
|---|---|---|
| Hard bottom: bed < `LIT3.CR_ROCK_Z` (1.5 m; "gravel, cobble, rock") | ×3 | ×1.5 |
| Wood: logs within `WOOD_Z` (`plants3.js`) | ×4 (> 30 cm: ×5) | ×1.5 |
| The rock/mud transition: bed within ±0.5 m of `CR_ROCK_Z` (the "drop-off") | ×2 | ×2 |
| Weed edge (`cover` 0.1–0.4) | ×1.5 | ×1.5 |
| Dense weed interior (`cover` > 0.6) | ×0.5 | ×0.5 |
| Open mud, beyond the rock band, no wood, no weed | ×0.3 | ×0.6 |

- **Size:** for fish < 30 cm, raise the rest weights by 1.5× (Cole & Moring: smaller adults use cover more).
- **Overlap:** these multipliers overlap with the shore term, since structure is near shore. Tune them **together** against the targets in (g), not separately.

### (d) Home range as a strip along the shore
- **Replace the 700-m disc (`HOME(50, 700)`)** with a home *segment of shoreline*:
  - an anchor on the shore, plus an along-shore half-length of **400–1,000 m** (total 0.8–2 km: Bevelhimer's 0.84–1.68 km; Opeongo's 4.5 km is for a 5,860-ha lake);
  - a cross-shore extent set by (a).
- **Implementation:** project the fish's position onto the shoreline (nearest land cell, `shoreDist`'s argmin) and measure the along-shore distance from the anchor. "Home far" fires on that, not on the straight-line distance.
- **Scale check:** Upper's ~15 km of shore holds about 8–19 non-overlapping 0.8–2-km ranges, and Lower's ~11 km about 6–14. Smallmouth ranges overlap widely (Opeongo 200–400 ha each in a lake with thousands of adults), so overlap is expected and fine.
- **Fidelity:** 74 % year-to-year range overlap (males 81 %, females 46 %); ranges rarely include the nest site (HAB). Keep the existing site memory.

### (e) Activity and time budget
- **Summer day `act`:** about 0.5 (was 0.8). Bass move about 40–50 % of daylight (Bevelhimer 42 %); at a 1 BL/s cruise for a 30-cm fish, this gives about 2–5 km/day of track.
  - **Target:** daily path 1–5 km; net displacement < 1.5 km; a track spanning about half the home-range length (Ridgway).
- **Twilight `act`:** about 0.7–0.8, the hunting window.
- **Night `act`:** about 0.1 (was 0.3). There was little or no horizontal movement at night at Opeongo and Melton Hill; Cooke's forebay fish are the exception.
- **Seasonal mean horizontal rate:** summer ≈ 3× fall/winter (Bloomfield: 3.5 vs 1.1–1.6 m/min).

### (f) Offshore sorties
- **Keep a minority offshore** (the human's "some in the open area"). The soft `wOut` alone gives about 4–5 % of daytime weight beyond 150 m (more for large fish in late summer, 26–32 %), and about 25 % at twilight.
- **Sortie rule (optional):** if the soft weight proves too weak once food pulls offshore, add an explicit sortie:
  - a hungry bass that detects a prey school within `sense` range beyond D1 may chase for ≤ 10–15 min;
  - then the home/shore term resumes.
  - **Cap:** ≤ 10 % of daylight time beyond 150 m for fish < 40 cm.
- **Do not** let the foraging footprint's food score override the shore weight. Multiply them; never add the food score onto the shore weight.

### (g) Validation targets (summer, July–August unless stated; real-scale positions sampled across all adult bass ≥ 25 cm)

| ID | Target | Value | Basis |
|---|---|---|---|
| SH1 | Daytime share within 100 m of shore | **≥ 80 %** (Upper and Lower) | Bevelhimer; Milipsigate June 79 % within 50 m on a steeper shore; Two Rivers "nearshore"; §0 translation |
| SH2 | Daytime share within 50 m | 35–55 % (Hot Brook's < 25-m shelf is < 1 m deep) | §0 [derived] |
| SH3 | Daytime share beyond 150 m | **≤ 10 %** for fish < 40 cm; ≤ 30 % for fish > 40 cm, 15 Jul – 15 Sep | Cole & Moring; Kaemingk; the human |
| SH4 | Night share within 50 m | ≥ 70 %, with horizontal speed ≤ ¼ of the day's | Opeongo; Melton Hill |
| SH5 | Median distance from shore, day / twilight / night | about 40–70 m / about 90–110 m / about 30–40 m | §0 calibration |
| SH6 | Daily path / net displacement | 1–5 km / < 1.5 km | Bevelhimer; Ridgway |
| SH7 | Fraction of daylight moving | 35–50 % | Bevelhimer |
| SH8 | When perch are eaten | most adult-perch kills at twilight (sun 0.02–0.3) at bed 2–3.5 m; daytime perch kills mostly juveniles ≤ 15 cm in the littoral | §4; PEA; Fetzer |
| SH9 | Growth | Maine bass about +4 cm/yr at 26 cm (the brief). Re-check once SH1–SH8 hold | brief |
| SH10 | Winter | ≤ 4–6 wintering sites a lake, nearly still Dec–Mar | HAB V6 |

**Caveats on the calibration.**
- The shares above are area-weighted habitat weights. The fish's food choice, school-following, structure multipliers and the brain will move them.
- Treat (a)–(c) as starting values and tune to SH1–SH5 with a ≥ 3-seed A/B, as the working agreement asks.
- The 79 % Milipsigate figure is June (nest season) on a steeper rocky shore, so SH1 is the better target than a literal "79 % within 50 m".
- Restricting bass to the littoral will also raise bass–pumpkinseed, killifish and young-perch encounters (§4) and bass–bass crowding. Watch the bass's own young (JRB: cannibalism) and the littoral prey's mortality.

---

## Gaps
- **No small shallow-lake telemetry** of adult smallmouth. All horizontal numbers are from deeper lakes, a reservoir and the Great Lakes, so the Hot Brook translation (§0) is inference.
- **No July–August distance-from-shore data for a small lake.** Milipsigate stopped in July.
- **No offshore-vs-inshore diet split for bass.** The ≤ 10–20 % offshore consumption is a guess.
- **Hot Brook substrate map:** only MDIFW's "shoreline mostly rocky … bottom mostly muddy". The sim's rock band (bed < 1.5 m) is a proxy. Where the real offshore shoals are rocky (Upper's 1–2-m patches > 150 m out), bass should use them.

## To fetch (blocked or unread; not bypassed)
- Savitz, Bardygula-Nonn, Harder & Stuecheli 1993, *Ecol. Freshw. Fish* 2:31–39: diel and seasonal use of home ranges by smallmouth **in a small lake**. Not found online; the most useful missing paper.
- Kaemingk et al. 2011, *J. Great Lakes Res.* 37:625. The full PDF (distance-from-shore results) sits behind a Cloudflare challenge at digitalcommons.unl.edu; not bypassed.
- Hubert & Lackey 1980, *TAFS* 109:364. The AFS habitat-section pages return 403; no copy found.
- Helfman 1981 (*CJFAS* 38:1405) and Emery 1973 (*JFRBC* 30:761): cdnsciencepub returns 403. Helfman 1979 is the same.
- Demers et al. 1996, *TAFS* 125:434 (EMG activity, smallmouth vs largemouth): abstract not found.
- Bevelhimer 1996, *TAFS* 125:274 (lab: temperature vs food vs structure): read only through Bevelhimer 1995.
- Carter et al. 2012 full text: ScienceDirect returns 403.
- Smallmouth HSI (Edwards, Gebhart & Maughan 1983, FWS/OBS-82/10.36): DTIC and NWRC copies returned HTML, not the PDF.
- The Gerber & Haynes 1988 record (SUNY SOAR) returns 403.
- "Activity and metabolic rate of free-swimming smallmouth bass in large, interconnected ecosystems", *Animal Biotelemetry* 2026 (doi 10.1186/s40317-026-00455-3): redirects to a Springer sign-in; not read.
- The Lake St. Clair (Michigan DNR, about 115 fish a year from 2024) and Lake Erie GLATOS (LESMB) smallmouth projects: results not yet published. These are the best future source for **shallow-basin** horizontal use.
