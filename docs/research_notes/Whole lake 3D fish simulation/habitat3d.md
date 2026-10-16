# Innate habitat preferences for the 3-D fish — 8 species × 4 modes (Hot Brook lakes)

Compiled 2026-10-15 from `docs/research_notes/Seasonal fish habitat use/` (both notes) and
`Whole lake 3D fish simulation/fish_movement_and_groups.md`. Thermal values were checked against the companion notes
(`Maine lakes ponds and streams/centrarchid_percid_esocid_parameters.md` Q6; `sucker_shiner_bullhead_trout_parameters.md` §5).
The hypsography was computed from `src/w3/geometry.js` (`GEO.depth`, `GEO.shore`). Every citation is as given in the notes;
nothing new was searched.

## 0. Conventions

- **Zb** is the bottom depth (m) of the column the fish chooses. **hab** is height above the bed (m); **dbs** is depth below the surface.
- **Flags:**
  - **[sc]**: a deep or stratified-lake value rescaled to Hot Brook by the rule below.
  - **[inf]**: my inference, with no direct number.
  - **[sur]**: a surrogate species.
  - **[ag]**: an agency source. **[ang]**: an angler source.
  - **[sec]**: ADW, Ontario LHD or Fishes of Texas.
  - **[snip]**: seen only in a search summary.
  - Unflagged values are primary sources as labelled in the notes.
- **Units and clocks:**
  - Horizontal distances are **real metres**. The world is at 1/10 scale, so world distance = real ÷ 10 and world area = real ÷ 100.
  - BL/s speeds are real, because fish swim at real speed.
  - `DAY_LEN` 120 s, so **1 real hour of the diel cycle = 5 s of sim**. Key twilight changes on light at the fish, not on the clock.

**Bed hypsography (3-D world; % of lake area):**

| | q10 | q25 | q50 | q75 | q90 | max | ≤1 m | ≤2 m | ≤2.5 m | ≤3 m | ≤4 m |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Upper | 1.27 | 2.03 | 3.22 | 3.92 | 4.75 | 5.52 | 5 % | 24 % | 34 % | 44 % | 78 % |
| Lower | 1.35 | 2.16 | 2.86 | 3.35 | 3.59 | 3.94 | 6 % | 22 % | 35 % | 57 % | 100 % |
| Brook | 0.25 | 0.34 | 0.45 | 0.63 | 0.89 | 1.13 | | | | | |

**Mean Zb (Upper / Lower) by world shore distance** (real distance = ×10):

| World shore distance | 0–3 m | 3–6 m | 6–10 m | 10–15 m | 20–30 m | 30–50 m |
|---|---|---|---|---|---|---|
| Mean Zb (m) | 0.97 / 0.85 | 1.9 / 1.7 | 2.7 / 2.3 | 3.1 / 2.7 | 3.7 / 3.2 | 4.0 / 3.4 |

- The farthest any water lies from shore is about 50 world m (about 500 m real).
- So "within 30 m of shore" (real) is the outer 3 world m, where Zb is about 1 m.
- "344 m offshore" is about 34 world m, which is the basin centre.

**Scaling rule [sc]:**
- **"Deepest water available"** means the deepest quartile: Upper Zb ≥ 3.9 m, Lower ≥ 3.35 m. Upper's deep hole is in its north basin, by the outlet (the brook's upper mouth).
- **"Mid-depth"** means q50–q75: Upper 3.2–3.9 m, Lower 2.9–3.35 m.
- **Littoral** means Zb ≤ 2.5 m (about 34 % of each lake). I assume a weed edge at about 2.5–3 m [inf], from Opinicon's 2–3 m edge (Brown & Colgan 1982) and Secchi about 3.8 m.
- Encode bands as **quantiles** where possible, so Lower (max 3.9 m) inherits them.

**Physical context** (from the notes):
- **Summer:** the lakes are polymictic. Top-to-bottom difference is 0–3 °C and August water is 22–25 °C. Depth can therefore cool a perch or sucker only by 1–3 °C, and warm-water species find extra warmth only in sun-warmed shallow weeds by day.
- **Under ice:** 0–1 °C just under the ice and 3–4 °C at the bed. Every thermal pull points to the bed until bed O₂ fails.
- **O₂:** a generic behavioural avoidance at about **2 mg/L** (Hasler 2009, largemouth under ice [sur]; Roberts 2012, perch) is well above the lethal levels. Under ice, surface water holds the most O₂ (Cooper & Washburn 1946).

---

## 1. Golden shiner (`minnow`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb (m)** | 0.5–3 [inf range], weedy mud-bottomed littoral (MDIFW [ag]; Hall et al. 1979 via Reebs 2002); some offshore over 3–4 m (a dominant offshore species in unstratified Opinicon, Keast & Fox 1992) | at dusk, open water over 2–5 [inf]; afterwards anywhere, dispersed | 0.5–2 [inf], weed beds in quiet water (MDIFW [ag]) | normoxic: 2–3.5 at the deeper weed edge [inf; no data exist]; hypoxic: wherever O₂ remains (Cooper & Washburn 1946) |
| **2 Vertical** | mid-column in or along the weeds, hab 0.3–1.5 [inf]; feeds from bottom to surface (Reebs 2002) | at dusk, dbs 0–1, following rising *Daphnia* (Hall 1979 [sec]); later mid-column, loose [inf] | in the plant canopy | normoxic: hab 0–0.5 [inf]; hypoxic: dbs 0–0.3 at the ice and holes (Cooper & Washburn 1946) |
| **3 Shore / cover** | strong weed affinity, mud bottom (MDIFW [ag]). Larvae of 10–30 mm stay in the vegetated littoral; those of 5–10 mm stay at the surface of the littoral edge (Faber 1980 via ADW [sec]) | limnetic, away from the weeds (Hall 1979) | over submerged plants and filamentous algae; sometimes over bass nests (Fishes of Texas [sec]) | deeper weed edge [inf] |
| **4 Activity** | **sustained ~1.9–2.0, 3-s burst 10–16 BL/s** at 12 cm (DFO curves; the cyprinid group is unknown, so both groups are given [inf]). Adults feed little by day; young-of-year feed by day (Helfman 1981 via Reebs 2002) | feeding peaks within ~1 h after sunset, is minimal through the night, with some before sunrise (Hall 1979 [snip]) | multiple bouts, June–August (companion notes) | low [inf] |
| **5 Group** | tight schools, "large shoals" (UW Limnology [sec]); no wild count, so 20–200 [inf]. Mixed shoals are sorted by species and length; shoals meet about every 1.1 min for about 3.7 s (Krause et al. 2000). NND about 1–1.5 BL (Pitcher & Partridge 1979 [sec]) | schools break up after sunset (Hall 1979); less aggregated at night (acoustic study [snip]) | spawning groups [inf] | loose aggregation [inf]; hypoxic: 10–20 thousand crowd an air hole with bullheads (Cooper & Washburn 1946) |
| **6 Range / moves** | whole lake, no site fidelity: "travel widely" (Scott & Crossman via Reebs 1996); learns feeding times and places (Reebs 1996) | a daily commute, littoral ↔ open water | apparent spawning run up an inlet (about 54 counted, Lievense 1947) | into an oxygenated inlet in a winterkill (Cooper & Washburn 1946) |
| **7 Temp / O₂** | preferred about 24–26 °C [inf: no measured preferendum; the FB4 "Dace" surrogate's Cmax peaks at 26 °C]; tolerates 35 °C (FishBase [sec]) | — | ≥ 20 °C (20.6 °C, Cooper 1935 [sec]); 20–27 °C (Jones 1978) | lethal about 0.2–0.3 mg/L; survives a week or more below 0.5 (Cooper & Washburn 1946); avoidance about 1 mg/L [inf] |

## 2. Pumpkinseed (`sunfish`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | 0.3–2.5: 80–90 % of fish biomass lies at ≤ 2.5 m (Keast & Harker 1977); weed edge at 2–3 m (Brown & Colgan 1982); offshore only "occasionally" (Keast & Fox 1992) | the same place (ADW [sec]) | nests mean **0.65 m** (0.15–1.68; yearly means 0.41–0.91); very few deeper than 1.5 m (Carbine 1948); < 1 m (DFO [sec]) | 1.5–3.5 [sc]: deep-littoral perennial weed stands (bluegill, Hall & Werner 1977 [sur]) or a shallow weedy bay (bluegill, Weimer 2004 [sur]) |
| **2 Vertical** | feeds at all levels, surface to bottom (WDNR [ag]); in a canopy standing 1.5–2.5 m off the bed (Brown & Colgan 1982), so hab 0–1.5 | rests near the bottom, hab 0–0.3 (ADW [sec]) | on the nest, hab 0–0.2; females wait in deeper water (WDNR [ag]) | on the bed, hab 0–0.5 (bluegill [sur]; anglers [ang]) |
| **3 Shore / cover** | within ~25–30 m (real) of shore, the weed-edge distance (Brown & Colgan 1982). Weedbeds > rock > sand (Keast et al. 1978); logs and docks. Fish < 75–80 mm SL stay inside dense vegetation while bass are present (Mittelbach 1984; Werner & Hall 1988); larger fish eat snails on the plants | in vegetation, or by rocks or logs (ADW [sec]) | any substrate (sand, gravel, peat, marl, roots), near plants (Carbine 1948) | dense or perennial vegetation (bluegill [sur]) |
| **4 Activity** | **sustained 1.7, 30 min 2.5, 10 s 7.2, 3 s 9.2 BL/s** (15 cm; DFO sunfish group, Katopodis & Gervais 2016); field cruise 0.5–1 BL/s [inf]; roaming bluegill about 57 m/h (Paukert 2004 via In-Fisherman [sec]) | substrate passes about half the daytime rate, but total strikes > 75 % of daytime through plankton feeding (Collins & Hinch 1993) | males guard day and night (Carbine 1948); bluegill moved ≥ 196 m/day while spawning (Weimer 2004 [sur]) | about 0 activity at ≤ 7.9 °C, and nearly all fish stop feeding by 2.2 °C (Reeve 2022); 10–50 % of stomachs hold food at 4 °C (Keast 1968b); bluegill move ≥ 32 m/day (Weimer 2004 [sur]) |
| **5 Group** | adults in pairs or loose groups of 3–4; the young in shoreline schools (WDNR [ag]) | dispersed | nests single or in 2–3, at most 6 (Carbine 1948); colonies of 3–15 (ADW [sec]) | aggregated in the weed stands (bluegill [sur]) |
| **6 Range / moves** | home range 0.23–1.12 ha (ADW [sec]); 97–98 % recaptured at home (McCairns & Fox 2004); mean displacement 43 m, max 156 m (Zięba 2015); homes from ≤ 670 m (Kudrna 1965). Bluegill: only half the fish site-faithful in a given month, ranges to 172 ha (Paukert 2004 [sur]), so 50–60 % residents and 40–50 % roamers [inf, notes]. **Brook: small fish (5–11 cm) drift up the inlet from mid-March to June, not to spawn, and many stay in its pools all summer** (654 counted, Lievense 1947; the owner's observation) | — | season about 54 days, to late July; up to 16 bouts; large males nest first (Carbine 1948; Danylchuk & Fox 1996) | in autumn, a progressive shift offshore to the deep littoral (Keast et al. 1978); relocations peak in autumn, 49 % of all (Zięba 2015); winter core range 0.8 ha (bluegill, Weimer 2004 [sur]) |
| **7 Temp / O₂** | final preferendum 27.7 °C (Hasnain 2013). Lake Monona field fish chose 27–32 °C (Neill & Magnuson 1974); the two notes assign the 28.5–32 and 27–29 ranges to day and night the opposite way round. Foraging falls below 15 °C (Collins & Hinch 1993) | — | first nests at 13.3–17.2 °C (Carbine 1948), 12.8–17.2 (WDNR [ag]); feeding resumes at 8.5 °C (Keast 1968b) | winter-acclimated preference 22.9 °C (Evans 1977), so seeks the warmest bed water; avoids < 2 mg/L (bluegill, Knights 1995 [sur]); lethal 0.3–0.4 (Cooper & Washburn 1946); endures hypoxia ≥ 2× longer than bluegill (Borowiec 2016) |

## 3. Yellow perch (`perch`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | **Upper 3–5.5, Lower 2.8–3.9**, the deepest available: shallow Lake Madison mean 3.4 m, range 1.2–4.3 (Radabaugh); high use at 2.5–6.5 (Lake Sinai, Bauer 2006); juveniles shallower, in the littoral (Mrnak; Feucht 2023 [snip]) | 0.5–2.5, inshore [sc]: Eurasian perch "few deeper than 5 m" at night, against a 6-m day median (Imbrock 1996) | 0.5–2 [sc]: 76 % of egg masses at 0–1 m in a brown lake, against a 5–6 m median in a clear one (Huff 2004), and these lakes are tea-coloured; 1.0–3.7 (NJ [ag]) | **first and last ice: 1–2.5**, green weeds (MN DNR [ag]; Sendek [ang]; 1.2–2.4 in "dishpan" lakes [snip]). **Midwinter: Upper ≥ 3.9, Lower ≥ 3.3** [sc] (Mendota fish at stations deeper than 15 m, Hergenrader & Hasler 1966) |
| **2 Vertical** | on or near the bed: more than half of Eurasian perch schools touched the bottom, and schools stood 2–4 m tall (Imbrock 1996), so hab 0–1.5 [sc] | resting on the bed, hab 0–0.2 (Imbrock 1996). Age-0 fish rise into the water column at night instead, at about 33× their daytime density there (Seďa 2010, Eurasian perch) | ribbons on brush and plants, hab 0–1 | near the bottom (MN DNR [ag]; Game & Fish [ang]); MDIFW sets bait 0.6–3 m off the bottom, so hab 0–1 here [sc] |
| **3 Shore / cover** | offshore: mean 344 m from shore, range 12.6–874 (Radabaugh); 150–350 m on 2–3° slopes (Bauer 2006); world 15–35 m, the basin. Open mud or sand flats, **never in vegetated areas** (Bauer 2006); hard-to-soft bottom transitions [ang] | the inshore littoral, open bottom (Imbrock 1996) | woody debris and submerged plants; the most complex trees preferred (Grausgruber 2021); nearest shore in spring (mean 251 m, Radabaugh) | mud flats with chironomids [ang]; Chara and green weeds early and late [ang]; drop-offs (MN DNR [ag]) |
| **4 Activity** | **sustained 1.6, 30 min 2.6, 10 s 9.7, 3 s 13.1 BL/s** (20 cm; DFO percid group, Katopodis & Gervais 2016); net 92.6 m/h (Radabaugh); lone perch swim at about half school speed (Hergenrader & Hasler 1967); moving ~0.8 [inf] | net 27.6 m/h, about 0.3× day (Radabaugh); 0 perch in 19 night camera frames (Imbrock 1996); moving ~0.2 [inf] | active day and night (Helfman 1981 via Reebs 2002); spawns from night to early morning (NJ [ag]) | **day only**, with peaks mid-morning and early afternoon (Hergenrader & Hasler 1966); speed lowest at 0–5 °C and rises linearly to a maximum at 20–25 °C (Hergenrader & Hasler 1967); feeds all winter |
| **5 Group** | **50–200**, spindle-shaped, sorted by size (Herman 1959 via ADW [sec]); 20–30 m across (Eurasian perch, Imbrock 1996); sexes often in separate schools (Craig 1987 [sec]); large adults sometimes alone | dispersed: schools break up below ~100 lx at 8 m (Eurasian perch, Imbrock 1996) | loose groups; males arrive first (ADW [sec]) | the year's largest schools, by day only [ang]; the schools make the activity peaks (Hergenrader & Hasler 1966) |
| **6 Range / moves** | tens to hundreds of ha [inf]. Eurasian perch used ~200 ha in summer and ~2,000 ha in winter (a deep lake, Imbrock 1996). **Autumn is the most mobile season** (97.6 against 45.6 m/h in summer), and perch are shallowest in fall in shallow Lake Madison (2.9 m) (Radabaugh) | inshore at dusk, offshore at dawn, along the bed | from deep wintering water to shallow spawning areas (ADW [sec]) | shallow, then deep, then shallow within the ice season (MN DNR [ag]); in late-winter hypoxia, into an oxygenated inlet (Cooper & Washburn 1946) |
| **7 Temp / O₂** | final preferendum 17.6 °C (Hasnain 2013); 17.6–20.1 at 24 °C acclimation (Fischer 1989); 18–24 (Ontario [sec]); Eurasian perch in the field at 13–19 (Imbrock 1996); young-of-year prefer about 4 °C warmer (Fischer 1989). **Use 18–22 °C**, cooler than the 2-D `tempOpt` 23 (perch note §6) | — | 7–13 °C (NJ [ag]); 6–12 (Ontario [sec]); optimum 9.1 (Hasnain 2013); spawning pauses at 5.9–7.1 (Grausgruber 2021) | the warmest bed water; avoids < 2 mg/L but makes brief forays (Roberts 2012); lethal 0.3–0.4 (Cooper & Washburn 1946) |

## 4. White sucker (`sucker`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | **Upper 2.5–5.5, Lower 2.5–3.9** [sc]: the Turkey Lake summer mean was 4.85 m in a 34-m lake, chosen for 14–16 °C (Richter 2024); "usually 6–9 m" (Ontario [sec]) | 0.5–2.5 [inf]: inshore and shallower at night, offshore by morning (ADW [sec]) | **brook riffles < 0.3 m deep, 14–90 cm/s, gravel** (companion notes); also lake shoals (MDIFW [ag]) | **Upper 3.5–5.5, Lower 3–3.9** [sc]: Turkey Lake winter mean 6.1 m, about 1.2 m deeper than summer (Richter 2024) |
| **2 Vertical** | **within 1 m of the bed 84–88 % of the time** (Richter 2024), so hab 0–0.5 | hab 0–0.5 | farthest off the bed in spring (Richter 2024) | hab 0–0.5 (Richter 2024) |
| **3 Shore / cover** | flat, gently sloping bays; avoids the steep main basin; core areas 92–100 % shallower than 10 m (Richter 2024); fine-to-mixed bottom; no cover | inshore flats | gravel riffles in the inflow and the brook | the same flats as summer (high fidelity) |
| **4 Activity** | **sustained 1.3, 30 min 2.0, 10 s 7.5, 3 s 10.1 BL/s** (40 cm; DFO walleye–white sucker subgroup, Katopodis & Gervais 2016); net 2.1–3.2 km/day (Richter 2024) | more active at night (ADW [sec]; NL [ag]) | spawns at dusk and night (MDIFW [ag]; NL [ag]). Stream entry is ×1.21 at sunset and ×0.75 at midnight relative to midday, and ×1.06 per °C (Swanson 2021) | the least movement: vertical 25 m/day against 36–49 in other seasons (Richter 2024) |
| **5 Group** | adults loose or solitary [inf]; young-of-year in schools of several hundred (ADW [sec]) | — | aggregations of thousands at traditional sites (NL [ag]) | loose |
| **6 Range / moves** | 95 % kernel 14.6–18.4 ha, core 2–4 ha; at most 35 % of the lake; seasons overlap 74–82 % (Richter 2024); world 0.15–0.18 ha. **Large fish commute daily between connected lakes, the direction set by time of day** (Marcy-Quay & Kraft 2021) | — | runs once the stream reaches ≥ 10 °C (Geen 1966 [snip]); a Michigan inlet run lasted mid-April to early May at 11–13 °C (Lievense 1947); stays ~10–30 days (western suckers [sur]); homes to its stream | core area largest in winter, 4 ha (Richter 2024) |
| **7 Temp / O₂** | selects 10–16 °C and avoids > 18 (Richter 2024), which is unavailable here, so it seeks the coolest bottom. Literature: 17–24 (Ontario [sec]); final preferendum 23.4 (Hasnain 2013) | — | ≥ 10 °C; run peaks at 11–15 °C | no thermal preference (Richter 2024). **Anoxia-intolerant:** dies when the maximum DO stays < 1 mg/L for ≥ 12 days, fine at ~4 mg/L (Shroyer 2007); avoidance 2–3 mg/L [inf] |

## 5. Brown bullhead (`catfish`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | 0.5–3, sheltered coves and weed beds (WDNR [ag]); NZ fyke catches in the < 5 m littoral (Barnes & Hicks) | 0.3–2.5, open mud flats and shallows (WDNR [ag]; Dedual 2002, NZ) | 0.3–1.5 [inf], shallow sheltered spots | buried in soft mud or leafy ooze "along the shore" (WDNR [ag]), or in slightly deeper mud in the north [snip], so 1–4 [inf]. In late-winter hypoxia it leaves the mud for holes or the inflow (Cooper & Washburn 1946) |
| **2 Vertical** | on the bed in cover, hab 0 | along the bed, hab 0–0.3; a chemosensory forager (WDNR [ag]) | nest on the bed | buried, hab < 0, with only mouth and gills exposed (WDNR [ag]) |
| **3 Shore / cover** | warm, quiet, soft-bottomed weedy coves; "loafing" in weeds (WDNR [ag]); logs, burrows | moves between weeds, sand, rock and gravel at night (Keast et al. 1978); sheltered muddy coves after dark (MDIFW [ag]) | a saucer nest sheltered by plants, a log, rock, overhanging bank, stump or muskrat burrow, on sand or rock (WDNR [ag]) | soft mud; NZ winter catches shifted from weeds to rock (Barnes & Hicks) |
| **4 Activity** | **sustained 1.4, 30 min 2.1, 10 s 5.9, 3 s 7.5 BL/s** (25 cm; DFO sunfish/catfish group, Katopodis & Gervais 2016). **Activity is suppressed above ~1 lux** (Eriksson 1978 via Reebs 2002); moving ~0.1 [inf] | night activity ≥ 3× day [inf]; feeding peaks at dawn and dusk whatever the light (Eriksson 1978) | active day and night while spawning (Helfman 1981 via Reebs 2002); both parents fan the eggs | stops feeding and is torpid (WDNR [ag]) |
| **5 Group** | gregarious: "travel in large schools along the bottom" (WDNR [ag]), so loose groups of 3–20 [inf] | loose | both parents herd the fry in compact schools for ~2 weeks (WDNR [ag]) | aggregated burial areas [inf]; hypoxic: thousands at the holes with shiners (Cooper & Washburn 1946) |
| **6 Range / moves** | summer 4.5 ha, linear range 0.5 km, all fish within 500 m (Sakaris & Jesien 2005, a river); world 450 m². Resident and site-faithful (USGS Presque Isle) | nightly forays into the shallows | spring range 19.7 ha, after moving ~1 km toward warming water (Sakaris & Jesien 2005); wanders up the inlet in the second half of March, not to spawn (Lievense 1947) | fall–winter range 15.9 ha (Sakaris & Jesien 2005); more stationary in winter (Dedual 2002, NZ) |
| **7 Temp / O₂** | preferred 25–31 °C (Ontario [sec]); final preferendum 29–31 (CBP 1975) | — | 18–25 °C: NH ≥ 18 [ag], Ontario 14–25 [sec], WDNR 21–25 [ag] | tolerates 0.2 mg/L (Ontario [sec]; Cooper & Washburn 1946); the last fish alive in a winterkill |

## 6. White perch (`whiteperch`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | **deepest open water [sc]: Upper 3.5–5.5, Lower 3–3.9.** By day, 4.0–9.0 m in other lakes (Stanley & Danie 1983). MDIFW names a "deep hole near the outlet" as a summer spot in Fifth Machias [ag]; Upper's 5.5-m hole is also by its outlet | **0.5–1.5** (0.9–1.2 m inshore at night, Stanley & Danie 1983) | 0–1.5 on shore flats over any bottom (Hardy 1978 via Stanley & Danie 1983), or up streams (MDIFW [ag]) | **deepest basin [sc]: Upper ≥ 3.9, Lower ≥ 3.3.** Elsewhere: 12–18 m in deep lakes (Stanley & Danie 1983); 4.6–7.6 m (NJ [ag]); a pond's deepest spot, ~4.6 m [ang]; a winter fishery in 6.1-m Horseshoe Lake, Maine [ag] |
| **2 Vertical** | near the bed or mid-water (notes table). On calm evenings it schools at the surface with dorsal fins out (MDIFW [ag]), so dbs 0–0.5 at dusk | the whole column of 1-m water | — | near the bed or suspended (3.7 m off the bottom in 12 m [ang]), so hab 0–2 [sc] |
| **3 Shore / cover** | offshore open water, **avoids cover** (Stanley & Danie 1983; NJ [ag]). Prefers level silt, mud, sand or clay; avoids muck, organic bottom, gravel and rock (AuClair 1956 via Stanley & Danie 1983) | inshore flats | any substrate | over basins, inside turns and steep breaks [ang] |
| **4 Activity** | **sustained 1.6, 30 min 2.6, 10 s 9.7, 3 s 13.1 BL/s** (20 cm; DFO group including Moronidae, Katopodis & Gervais 2016). Feeds day and night, more in low light (NJ [ag]). Diel-movement frequency was 49–57 % in summer against 13.8 % in winter (estuary telemetry, TAFS 2014) | inshore feeding; a dusk peak (MDIFW Northeast Pond [ag]) | egg release over 10–21 days, peaking at dusk and after rain (Stanley & Danie 1983) | active and feeding, roaming; a midwinter slump and a March rebound; peaks at dawn, dusk and the last hour of daylight [ang] |
| **5 Group** | schools from youth to adulthood (NJ [ag]); size unmeasured, so 50–200 [inf] | looser [inf] | groups of hundreds (Stanley & Danie 1983) | compact roaming schools that stay ~15 min at a spot [ang] |
| **6 Range / moves** | the whole basin; summer moves local, < 19 km (estuarine; Mansueti 1964 via Stanley & Danie 1983); space use expands in autumn and spring (estuary, 2012 [snip]) | offshore ↔ inshore daily | to deeper water after spawning (Stanley & Danie 1983) | in autumn, shallow weed edges first, then the nearest deep basin by midwinter (NJ [ag]) |
| **7 Temp / O₂** | final preferendum 28.9–30.6 °C (Hall, Hocutt & Stauffer 1979). Preference tracks acclimation, from ~5 °C in February to 32.2 in summer (Meldrim & Gift 1971 via Fischer, Hall & Sullivan 1989); Hudson adults avoided < 9.5 and > 34.5 (same synthesis) | — | ~15 °C (MDIFW [ag]); 11–16 (Ontario [sec]); 18–21 held for several days (AuClair 1956, Maine), which conflicts | **avoids < 35 % saturation** (Meldrim 1974), about **3–4.6 mg/L** at 0–21 °C [derived]; needs O₂ in deep water in winter (MDIFW [ag]) |

## 7. Smallmouth bass (`bass`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | **1.5–4**: Maine rocky areas and drop-offs at 1.5–4.6 m (MDIFW [ag]); in Opeongo the fish swam at 2–5 m by day and deepest (4–5 m) 06–13 h (Suski & Ridgway 2009). Large fish (> 406 mm) go deeper in late summer (Green Lake ME, Cole & Moring 1997), so **3–5.5 for large fish** [sc] | **1–2.5** (shallowest at 1.5–2.5 m, 23–03 h, Suski & Ridgway 2009) | nests 0.5–1.5: Opeongo 0.4–2.5, mostly 0.5–1.5 (Rejwan 1999); South Branch Lake ME 0.8 m (Forbes 1981). In tea-coloured water, 0.5–1.2 [inf] | **Upper 2.5–5.5, Lower 2.5–3.9** [sc]: Milipsigate 2–6 m, all sites shallower than 8 m (Sergio 2026); deep Opeongo 12–15 m |
| **2 Vertical** | near the bed, hab 0.2–1.5 [inf]; eats crayfish and fish on hard bottom (Bevelhimer 1995) | near the bed over shallower water [inf] | the male over his nest, hab 0–0.5 | on the bed (Scott & Crossman [sec]). The daily vertical range falls below 0.5 m by February, and fish sit slightly deeper at night (Suski & Ridgway 2009) |
| **3 Shore / cover** | rocky points, boulder and rubble shoals, drop-offs, logs, weed edges (MDIFW [ag]; Ontario [ag]; Bevelhimer 1995). **79 % of June positions within 50 m of shore** (Sergio 2026), world ≤ 5 m. Small fish use cover more (Cole & Moring 1997) | over the same hard bottom | gravel or rubble beside a boulder or log (one-sided shelter, Mraz 1960); sheltered bays, leeward shores, behind islands, 0.3–9 m from shore (Forbes 1981); the warmest littoral (Rejwan 1999) | traditional sites with rock structure; under rocks at 6–7 °C (HSI via gcdamp [sec]) |
| **4 Activity** | **sustained 1.3, 30 min 1.9, 10 s 5.5, 3 s 7.0 BL/s** (30 cm; Katopodis & Gervais 2016). Field mean about **1.0 BL/s** around the clock (EMG, 27 km/day, Cooke 2001). Tracks at 483 m/h mean, 1,120 m/h max (Ridgway 2002); moving ~0.7 [inf] | little horizontal movement (Ridgway 2002); less active at night (Bevelhimer 1995); crepuscular peaks (Emery 1973 [sec]; Reynolds & Casterlin 1976 [snip]) | the male guards 2–3 weeks, day and night (Hinch & Collins 1991 via Bevelhimer 1995) | **quiescent: about 0 horizontal movement, December to late March** (Sergio 2026); minimal feeding. Maine ice catch is 0.46 per angler-day against 1.7 in open water (MDIFW [ag]) |
| **5 Group** | solitary or loose | solitary | territorial males; a territory ~18 m across (Scott 1993 via Rejwan 1999) | aggregated at ≤ 4 sites with ≥ 2 tagged fish each (Sergio 2026); 65 bass on one spot on camera [ang] |
| **6 Range / moves** | **100–400 ha** (Ridgway 2002), i.e. world 1–4 ha, ¼ to all of Upper; 74 % year-to-year overlap; displaced fish home from 6.7 km (Ridgway & Shuter 1996); the summer range rarely includes the nest (Ridgway 2002) | — | nests within 20 m of last year's (Millers Lake [snip]). Age-0 stay ≤ 200 m from the nest, < 5 m from shore and < 1 m deep through September (Ridgway 2002) | leaves the summer range after mid-August (Ridgway 2002), or about 1 week after the fall equinox (Ridgway via Pyzer [sec]), working at 10–15 °C; at the wintering sites by December (Sergio 2026). Rises around the spring equinox under ice (Suski & Ridgway 2009); disperses in April–May (Sergio 2026) |
| **7 Temp / O₂** | field 21–27 °C, lab 28–31 (HSI [sec]); final preferendum 25.0 (Hasnain 2013); leaves 25–30 °C water (Schreer & Cooke 2002) | — | nest-building ≥ 12.8 °C, eggs at 15.6–18.9 °C, mid-May to mid-June (MDIFW [ag]); onset 15.0–15.7 °C (Forbes 1981) | inactive below 10 °C. Avoids < 2 mg/L (largemouth, Hasler 2009 [sur]); lethal ~0.6–1.0 mg/L [inf; Burdick 1954 via Doudoroff & Shumway 1970] |

## 8. Chain pickerel (`pike`)

| | (a) Day | (b) Night | (c) Spawning | (d) Under ice |
|---|---|---|---|---|
| **1 Zb** | **0.5–2.5**: 50 % of detections at 0.76–1.82 m (Sergio 2026); 0.6–3 m "most of the year" (NY DEC [ag]). Fish over 1.8 kg hold on outside deep weedlines at 3.7–4.6 m in midsummer [ang], so **2.5–3.5 for large fish** [sc] | 0.5–2 [inf]: pike stay in cover at night [sur]; ADW's "moves shallow at nightfall" is unsourced | **≤ 1**, flooded vegetation in "swampy areas" (MDIFW [ag]); the shallows to 3 m (NJ [ag]) | **0–2.5** (predicted October–April, Sergio 2026). Maine anglers fish weed beds < 3 m with tip-ups at 1.5–1.8 m [snip]; NY 1.5–4.6 m near weeds [ag]; big females at 0.6–0.9 m in February [ang] |
| **2 Vertical** | hovers motionless in or beside cover (MDIFW [ag]), so hab 0.3–1.5 [inf] | low in cover, hab 0–0.5 [inf] | over submerged plants | hab 0.3–1 (NY tip-up minnows 0.3–1 m off the bottom [ag]) |
| **3 Shore / cover** | dense submerged weeds, lily pads, bulrush, weed edges, island shallows (MDIFW [ag]; Sergio 2026). Small fish stay on the flats; big fish move to channels and drop-offs at midday [ang] | in cover | flooded marsh margins and inlets (a mud pickerel inlet run, Lievense 1947 [sur]) | **December: 80 % within 30 m of shore** over rocky shallows (world ≤ 3 m); January 91 % and February 97 % around single islands (Sergio 2026). Living weeds, dark bottom or wood next to deeper water [ang] |
| **4 Activity** | **sustained 0.5, 30 min 0.9, 60 s 2.8, 10 s 5.0, 3 s 7.5 BL/s** (45 cm; DFO pike group, Katopodis & Gervais 2016), the steepest curve, suited to ambush. Moving ~0.1–0.3 [inf]; dawn and dusk peaks (NY DEC, NJ [ag]) | low: pike are inactive at night (Baktoft 2012; Diana 1980 via Margenau [sur]) | spawns by day (NJ [ag]); a population spawns over 7–10 days (ADW [sec]) | **active by day**: pike swam 2.2 min/h by day and < 1 min/h at night, 0.7 against 0.06 m/min (Margenau 1986 [sur]). Hovers ~5 min before a slow strike; bites later in the day [ang] |
| **5 Group** | solitary, "a solitary stalker" (NJ [ag]) | solitary | several males per female (MDIFW [ag]) | loose clusters at islands and points (Sergio 2026) |
| **6 Range / moves** | no hectare data. Pike [sur]: activity areas mostly < 4.5 ha (Margenau 1986), and fish return to their summer centre within 6 days of displacement (Kobler 2008). Uses the whole lake in fall (Sergio 2026). "Extended summer migrations beyond" the lake (Sauriol); 6 of 18 fish left the array within 2 weeks (Sergio 2026) | — | moves from deeper wintering sites into vegetated water ≤ 3 m (ADW [sec]). Mud pickerel ran up an inlet at 7–10 °C; most returned, some stayed all summer (Lievense 1947 [sur]) | contracts to near-shore and island patches that shift monthly, re-expanding in March (Sergio 2026) |
| **7 Temp / O₂** | final preferendum 24 °C (Coutant 1977), 25.5 (Hasnain 2013); optimum 21–25 with O₂ > 4 mg/L (NJ [ag]); lethal 28.4 °C at 17.7 °C acclimation (Cvancara 1977) | — | **6–11 °C** (Ontario [sec]), 8–11 (NJ [ag]), peak 8.3–11.1 (ADW [sec]); right after ice-out | feeds at 1–4 °C; lethal ~0.3–0.4 mg/L (mud pickerel, Cooper & Washburn 1946 [sur]); pike depth limited below 3 mg/L (Pierce 2013 [sur]); Maine pond pickerel persist through Februaries at 0.8 ppm (Passaconway, MDIFW [ag]) |

---

## 9. Encoding summary (numbers only; sources above; * = [inf] or [sc])

### Position, grouping, temperature and O₂

| Species | Mode | Zb Upper / Lower (m) | Vertical | Shore & cover weights | Group | T pref °C | O₂ avoid / lethal (mg/L) |
|---|---|---|---|---|---|---|---|
| Shiner | Day | 0.5–3 / same* | hab 0.3–1.5* | littoral; weed ++, mud + | school 20–200*, NND 1–1.5 BL | 24–26* | ~1* / 0.2–0.3 |
| | Night | dusk 2–5 / 2–3.9* | dbs 0–1 at dusk | open water | dispersed | — | — |
| | Spawn | 0.5–2* | in canopy | weed/algae; ≥ 20 °C, Jun–Aug | groups* | ≥ 20 | — |
| | Ice | 2–3.5*; hypoxic → inflow, ice | hab 0–0.5*; hypoxic dbs 0–0.3 | deeper weed edge* | loose*; hypoxic crowds | warmest | ~1* / 0.2–0.3 |
| Pumpkinseed | Day | 0.3–2.5 | hab 0–1.5 | ≤ 25–30 m real from shore; weed ++, rock +, sand −; < 8 cm inside weeds | pairs, 3–4; young schools | 27.7 (field 27–32) | 2 / 0.3–0.4 |
| | Night | same spot | hab 0–0.3 | cover | dispersed | — | — |
| | Spawn | 0.15–1.7, mean 0.65 | nest | any substrate near plants; 13–17 °C first | nests 1–6 (to 15) | — | — |
| | Ice | 1.5–3.5* | hab 0–0.5 | perennial weed stands | aggregated | warmest | 2 / 0.3–0.4 |
| Yellow perch | Day | 3–5.5 / 2.8–3.9 | hab 0–1.5* | 150–350 m real offshore; open mud/sand; weed − | school 50–200, 20–30 m wide | 18–22 | 2 / 0.3–0.4 |
| | Night | 0.5–2.5* | hab 0–0.2, resting | littoral open bottom | dispersed | — | — |
| | Spawn | 0.5–2* | hab 0–1 | brush, plants; 7–13 °C | loose | — | — |
| | Ice | early/late ice 1–2.5; midwinter ≥ 3.9 / ≥ 3.3* | hab 0–1* | green weeds → mud flats | largest schools, by day | warmest | 2 / 0.3–0.4 |
| White sucker | Day | 2.5–5.5 / 2.5–3.9* | hab 0–0.5 | gentle flats; no cover | loose | coolest available | 2–3* / < 1 for 12 d |
| | Night | 0.5–2.5* | hab 0–0.5 | inshore flats | loose | — | — |
| | Spawn | brook riffles < 0.3 | bed | gravel, 14–90 cm/s; ≥ 10 °C | aggregations | — | — |
| | Ice | 3.5–5.5 / 3–3.9* | hab 0–0.5 | same flats | loose | none | 2–3* / < 1 for 12 d |
| Bullhead | Day | 0.5–3 | hab 0 | soft weedy coves; cover ++ | loose 3–20* | 25–31 | ~1* / 0.2 |
| | Night | 0.3–2.5 | hab 0–0.3 | open mud flats | loose | — | — |
| | Spawn | 0.3–1.5* | nest | cavity under log, rock or bank; sand/rock; 18–25 °C | pair + fry school | — | — |
| | Ice | 1–4* | buried | soft mud | aggregated* | — | — / 0.2 |
| White perch | Day | 3.5–5.5 / 3–3.9* | hab 0–2; calm-evening surface | offshore; level fine sediment; cover −, rock − | school 50–200* | 29–30 (tracks acclimation) | 3–4.6 / ~0.5–1 |
| | Night | 0.5–1.5 | whole column | inshore flats | looser* | — | — |
| | Spawn | 0–1.5 or the brook | — | any bottom; ~15 °C (11–21) | hundreds | — | — |
| | Ice | ≥ 3.9 / ≥ 3.3* | hab 0–2* | open basin | compact, roaming | ~5 (acclimated) | 3–4.6 / — |
| Smallmouth | Day | 1.5–4 (large 3–5.5*) / 1.5–3.9 | hab 0.2–1.5* | ≤ 50 m real from shore; rock ++, drop-off ++, wood + | solitary | 21–27 (25) | 2 / 0.6–1.0* |
| | Night | 1–2.5 | near bed* | same hard bottom | solitary | — | — |
| | Spawn | 0.5–1.5 | nest | gravel beside boulder/log, sheltered; ≥ 15 °C | territories ~18 m | — | — |
| | Ice | 2.5–5.5 / 2.5–3.9* | hab 0 | rock structure; ≤ 4 sites | ≥ 2 per site | inactive below 10 | 2 / 0.6–1.0* |
| Pickerel | Day | 0.5–2.5 (large 2.5–3.5*) | hab 0.3–1.5* | weed ++, edges, islands | solitary | 24–25.5 | 2–3* / 0.3–0.4 |
| | Night | 0.5–2* | hab 0–0.5* | in cover | solitary | — | — |
| | Spawn | ≤ 1 | — | flooded vegetation; 6–11 °C at ice-out | 1 female + several males | — | — |
| | Ice | 0–2.5 | hab 0.3–1 | ≤ 30 m real from shore; rock/weed shallows, islands | loose clusters | — | — / 0.3–0.4 |

### Speeds and activity

- **Speeds** are from the DFO fatigue curves (Katopodis & Gervais 2016), at the stated length, in BL/s.
- **Fraction of time moving** is my inference [inf]. It is anchored to:
  - perch day:night net movement 3.4:1 (Radabaugh);
  - pike under ice, 2.2 min/h (Margenau 1986);
  - smallmouth EMG about 1 BL/s around the clock (Cooke 2001);
  - pumpkinseed near-zero activity at ≤ 7.9 °C (Reeve 2022).

| Species (L) | 200 min | 30 min | 60 s | 10 s | 3 s | Field cruise | Moving: day / night / ice |
|---|---|---|---|---|---|---|---|
| Golden shiner (12 cm) | 1.9–2.0 | 2.8–3.2 | 5.5–7.5 | 7.9–11.7 | 10–16 | 1–2* | 0.8 / 0.3 (dusk 1.0) / 0.2 |
| Pumpkinseed (15) | 1.7 | 2.5 | 5.0 | 7.2 | 9.2 | 0.5–1* | 0.7 / 0.35 / ≤ 0.05 below 8 °C |
| Yellow perch (20) | 1.6 | 2.6 | 6.2 | 9.7 | 13.1 | 0.5–1; alone ×0.5 | 0.8 / 0.25 / 0.4 (by day) |
| White sucker (40) | 1.3 | 2.0 | 4.8 | 7.5 | 10.1 | 0.5–1* | 0.5 / 0.8 / 0.3 |
| Brown bullhead (25) | 1.4 | 2.1 | 4.1 | 5.9 | 7.5 | 0.3–0.6* | 0.1 / 0.6 / 0 (buried) |
| White perch (20) | 1.6 | 2.6 | 6.2 | 9.7 | 13.1 | 0.5–1.5* | 0.7 / 0.6 / 0.5 |
| Smallmouth (30) | 1.3 | 1.9 | 3.8 | 5.5 | 7.0 | ~1.0 | 0.8 / 0.3 / ≤ 0.05 |
| Chain pickerel (45) | 0.5 | 0.9 | 2.8 | 5.0 | 7.5 | 0.3–0.5* | 0.2 / 0.1 / 0.05 by day |

- Net path is far shorter than the path swum: a smallmouth swam ~27 km/day but netted 77 m/day (Cooke 2001). So match net displacement with local wandering, not with low speed.
- Raceway smallmouth beat Ucrit (Peake & Farrell 2004–05), so treat these speeds as floors for bursts.

---

## 10. Diel transitions

- **General rules:**
  - Day-active fish wind down gradually at dusk and wind up at dawn at *lower* light; the changeover is prolonged and variable (Helfman 1981).
  - Diel patterns break down in the breeding season (Helfman 1981).
  - 17 of 21 Ontario species schooled by day, more fish were in shallow water at night, and fish resting at night turned barred (Emery 1973).
  - School nearest-neighbour distance rises as light falls, and stabilises at ~1.5 BL above a threshold illuminance (arXiv 2301.09577 [snip]).
- **Light gates:**
  - Eurasian perch schools break up below ~100 lx at 8 m (Imbrock 1996).
  - Bullhead activity switches at ~1 lux (Eriksson 1978).
  - Bass capture success is > 95 % down to 3×10⁻³ lx, 62 % at 2×10⁻⁴ lx and ~0 in darkness (McMahon & Holanov 1995, largemouth [sur]).
  - The water is tea-coloured, so light at depth fails earlier than at the surface.

| Species | Dusk | Night | Dawn | Notes |
|---|---|---|---|---|
| Yellow perch | schools move inshore along the bed, disperse in the littoral and settle (Imbrock 1996); a strong sunset migration (Hasler & Bardach 1949 [snip]) | rest on the bed, inshore | reverse: re-school, move offshore | camera counts peaked at dusk and dawn at 4 m (Imbrock 1996). No twilight peaks in Lake Madison (Radabaugh); no diel difference in depth or distance from shore in Lake Sinai (Bauer 2006). Under ice: day only, peaks mid-morning and early afternoon |
| Golden shiner | schools break up just after sunset and go to open water to feed on rising *Daphnia* | little feeding, dispersed | brief open-water feeding before sunrise, then back to the weeds (Hall 1979 via Reebs 1996) | the feeding window is ~1 h after sunset, about 5 s of sim; a "late afternoon" variant exists [snip]; young-of-year stay day feeders |
| White perch | inshore; a feeding peak; feeding in the last hour of daylight on sunny days [ang] | on 0.9–1.2 m flats | back offshore and deeper | on overcast days, feeding runs all day [ang] |
| Smallmouth | rises "soon after sunset" | shallowest 23:00–03:00; little horizontal movement | descends "soon after sunrise"; deepest 06:00–13:00 | deeper by day in autumn; slightly deeper at night under ice (Suski & Ridgway 2009) |
| Chain pickerel | feeding peak; big fish come onto the weed flats [ang] | low, in cover | feeding peak; big fish return to drop-offs by midday [ang] | no pickerel telemetry. Pike [sur]: twilight peaks in summer only; day-active under ice (Baktoft 2012; Kobler 2008 [snip]) |
| Pumpkinseed | gradual wind-down | rests near the bed in cover; keeps plankton feeding | wind-up | three feeding peaks a day (Keast & Welsh 1968); heaviest in the afternoon (WDNR [ag]); cold damps the cycle (Reeve 2022) |
| White sucker | moves inshore and shallower (ADW [sec]); stream entry peaks at sunset (Swanson 2021) | active, inshore | offshore by morning | large fish commute between lakes on a time-of-day schedule (Marcy-Quay & Kraft 2021) |
| Brown bullhead | leaves cover once light falls below ~1 lux; dusk feeding peak | roams the mud flats, foraging by taste and smell | dawn feeding peak, then back to cover | active day and night while spawning |

## 11. Seasonal moves and the brook

Hot Brook calendar: ice-out ~Apr 23, 15 °C by late May, a 24 °C peak in late July, ice-on ~Dec 1.

- **Late March, under ice:**
  - Bullheads wander into the inlet (Lievense 1947).
  - Smallmouth begin rising toward the shallows around the equinox (Suski & Ridgway 2009, deep lake).
  - Big pickerel females move to 0.6–0.9 m [ang].
- **Ice-out to early May, 6–11 °C:**
  - Pickerel spawn in flooded margins, possibly the inflow and brook edges (mud pickerel inlet run [sur]).
  - Perch (7–13 °C) lay ribbons on brush at 0.5–2 m; males arrive first.
- **≥ 10 °C, late April to mid-May:**
  - Suckers run up the inflow and the brook's riffles (~0.35 m deep), entering at dusk and spawning at night.
  - They stay for days to weeks, then return to the lake.
- **Mid-March to June:**
  - Small sunfish drift into the brook, and many stay in its pools all summer (Lievense 1947: 654 pumpkinseed and 1,786 bluegill in 3 months through a 0.46-m-deep inlet; the owner's observation of the 1.1-m mouth pool).
  - They drift back from late summer into fall.
- **~15 °C, late May to June:**
  - White perch spawn en masse on 0–1.5 m flats or run into streams.
  - Smallmouth nest at 15–16 °C, within 20 m of last year's nest.
- **June to July:**
  - Pumpkinseed nest (first at 13–17 °C; about a 54-day season).
  - Bullheads nest at 18–25 °C.
  - Golden shiners spawn at ≥ 20 °C, June–August.
- **Mid-August to October:**
  - Bass leave their summer ranges and gather on a few sites (working range 10–15 °C).
  - Perch are at their most mobile.
  - Pumpkinseed move to the deep littoral.
  - White perch go to the weed edges, then the basin.
- **November to early December:**
  - Bass are at ≤ 4 wintering sites.
  - Pickerel sit within 30 m of shore over rocky shallows.
  - Bullheads bury.
  - Perch move to green weeds at first ice.
- **January to February:**
  - Perch and white perch are in the deep north basin of Upper and the 3.3–3.9 m centre of Lower.
  - Pickerel cluster at points and islands, shifting monthly.
  - Bass are still.
- **Late winter, hypoxia rule:** below ~2 mg/L at the bed (white perch below ~3–4.6), fish rise off the bed and move toward the best O₂: under the ice, Upper's south inflow, and the brook [inf: its riffles should aerate Upper's outflow].
  - Death order from first to last: sucker (< 1 mg/L for 12 days) → bass (~0.6–1.0) → perch ≈ pumpkinseed ≈ pickerel (0.3–0.4) → shiner ≈ bullhead (0.2–0.3).
  - The O₂ refuges crowd (Cooper & Washburn 1946: 15,000 fish in a 137-m inlet).
- **Between the lakes:** about 1 % of fish a year cross to the other lake (Daniels 2008 via Audubon [sec]). On top of that come commuting large suckers and pickerel summer excursions.

## 12. Angler realism (where they are caught)

**Yellow perch**
- **Summer:**
  - Schools sit on the bottom over the deepest open flats: Upper's north basin at 3.5–5.5 m and Lower's 3–3.9 m saucer, away from the weeds.
  - Fish worms on the bottom.
  - The schools come inshore at dusk.
- **Ice, first ice:** shallow green weeds and Chara at 1–2.5 m.
- **Ice, midwinter:**
  - Soft-bottom basin flats.
  - Bait 0.3–1 m off the bottom, or "pound the bottom".
  - The day bite peaks mid-morning and early afternoon (Hergenrader & Hasler 1966); MN DNR says dawn and dusk instead.
- **Ice, late ice:** back to the weeds near the spawning brush.
- **MDIFW:** jig at 1.5–6 m.

**Smallmouth bass**
- **May–June:** males on nests at 0.5–1.5 m on gravel beside boulders or logs in sheltered bays.
- **Summer:**
  - Rocky points, drop-offs and logs at 1.5–4 m, within ~50 m of shore.
  - Big fish sit deeper in August.
  - Best at dawn and dusk.
- **Fall:** fish condense on a few points and humps and feed hard at 10–15 °C.
- **Winter:** effectively uncatchable. MDIFW: "especially in Washington and Hancock counties, bass are almost never caught by winter anglers". Hot Brook is in Washington County.

**Chain pickerel**
- **All year:** in the weeds at 0.5–2.5 m.
- **The ice species:**
  - 1.18 per angler-day through the ice against 0.49 in summer (MDIFW).
  - Tip-up minnows 0.3–1 m off the bottom by weed beds at 1.5–1.8 m.
  - The bite is later in the day.
- **By month under ice:** in December, rocky shallows within 30 m of shore; in January–February, at points and islands.
- **Open water:** best from early May to July; large fish on the deep weedline.

**White perch**
- **Ice:**
  - The deepest basin.
  - If the bite stops for ~15 min, the school has moved.
  - Best at early ice and in March.
- **Summer:** schools in the open lake at dusk, and in the deep hole by the outlet.

**Hornpout (brown bullhead):** bait on the bottom of sheltered muddy coves after dark on calm, warm evenings.

**White sucker:** the spring run in the brook, at dusk and night.

## 13. Biggest inferred values (calibrate or replace)

- **Golden shiner:**
  - all winter positions;
  - its preferred temperature;
  - its school size;
  - which swimming-curve group it belongs to.
- **White perch:**
  - school size;
  - night cohesion;
  - day and night depths. These come from a 1983 compilation, with no lake telemetry.
- **Brown bullhead:**
  - burial depth;
  - nest depth;
  - group size;
  - day:night activity ratio.
- **Night bottom depths:** sucker and pickerel.
- **Fractions of time moving:** every one.
- **Vertical positions:** every hab for the bass and pickerel.
- **The brook as a winter O₂ refuge.**
- **Shallow-lake winter positions of perch, pumpkinseed and pickerel.** These are extrapolated from deep lakes, bluegill, Milipsigate and anglers. No under-ice telemetry exists for a shallow mixed lake.
- **Pickerel home range:** no hectare figure exists; the pike values stand in.
