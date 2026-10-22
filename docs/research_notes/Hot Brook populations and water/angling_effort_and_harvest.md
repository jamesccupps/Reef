# Anglers as a predator: effort, catch, release, exploitation and hooking mortality (for Upper and Lower Hot Brook Lake)

**Scope.** What the sim needs in order to add recreational anglers as a predator on the adult fish of the two lakes:
- effort per hectare by season and month, open water and ice;
- catch per angler-hour by species, the share released, the sizes kept;
- exploitation (the share of a stock harvested in a year);
- catch-and-release (hooking) mortality by water temperature and hook depth, and the sublethal effects;
- Maine ice fishing;
- anything specific to Hot Brook.

**What this note does not repeat.**
- `gemini_angling_alewife_checked.md` (this folder): the verdicts on the Gemini angling report, the Region C bass length-at-age fit, the law-book readings (bass released alive, white perch 25, ALO + S-7 Oct 1–Dec 31) and the blocked Sebec / Minor Sportfish claims. Its rows C1–C3 stay UNVERIFIABLE here too.
- `eastern_maine_relative_abundance.md` Q2 and Q6: bass catchability (Pallette Lake, 3–7 catches per bass a year), the relative-catchability table, the Vermont creel rates.
- The pickerel and white perch harvest arithmetic already in `../Predator winter energetics/pickerel_population_dynamics.md`, `../Whole lake 3D fish simulation/pickerel_mortality_cannibalism.md` and `../Whole lake 3D fish simulation/white_perch_regulation.md`. They are cited, not re-derived.

**How it was researched (2026-10-22).**
- **The web-search budget for this session was already used up**, so no new search was run. The sources are:
  - the project's own PDFs, read with `pdftotext`: `../fetched/blackbass.pdf` (MDIFW *Black Bass Management Plan*, Jordan 2001), `../fetched/whiteperch.pdf` (MDIFW *White Perch Management Plan*, Smith 2002), `../fetched/BassTechnicalWorkGroupNov2019.pdf`, both Hot Brook survey sheets, and the EPA lake-fisheries manual;
  - documents at URLs already named in the Gemini report or in the repo notes, downloaded to the scratchpad (not the repo): Snow 1978 (Murphy Flowage, Wisconsin), Sanderson 2010 (Sodus Bay creel, NYSDEC), Tomcko 1997 (Minnesota DNR esocid hooking-mortality review);
  - Crossref records and DOI redirects for papers known by citation, then their OUP abstract pages; the Ontario catch-and-release page.
- **Blocked, not bypassed:** www.maine.gov still returns HTTP 403 (the 2016 angler survey report, the Minor Sportfish, pickerel and yellow perch plans). The Deroba et al. 2007 PDF at canr.msu.edu served an Incapsula bot-check page. The 2017 Vermont bass plan URL in the repo now returns 404. Paywalled full texts were read as abstracts only.
- **Instructions in fetched content:** none found.

**Tags.**
- [FT] full text read;
- [ABS] abstract only;
- [SEC] a secondary account (a review or agency page citing the primary), named;
- [NOTE] a value from an existing repo note, not re-read today;
- "derived" = my arithmetic; [inf] = my inference.

**Units.** 1 acre = 0.4047 ha, so x per acre × 2.471 = per ha. An "angler-day" in the Maine questionnaires is a day on which a person fished. I convert it to hours at **4 h a day** (trips averaged 3.7 h in Wisconsin, 3.7 h open water and 5.4 h on the ice in New York; §1) [inf].

**Region.** Hot Brook is in MDIFW's **Region F (Penobscot)** (`gemini_hot_brook_checked.md` row 8b), not Region C (Downeast). Region F figures are therefore the nearest regional values; Region C is given alongside.

---

## Takeaway

1. **Effort is low.** Maine's 1998–99 questionnaires give Region F about **1.8 bass-water angler-days per acre a year** (1.4 summer + 0.4 winter) and 1.3 white-perch-lake days per acre: roughly **13–30 angler-h/ha/yr** for an average Region F lake [derived]. Hot Brook is remote (an unimproved launch on Upper, about 15 camps on Upper's south shore, no camps and no boat access on Lower). I suggest **Upper ≈ 12 h/ha/yr (5–25) and Lower ≈ 4 h/ha/yr (1–10)** [inf]. Heavily used New York lakes run about 9–230 h/ha in open water and Murphy Flowage (Wisconsin) 182 h/ha, up to 10–20 times more.
2. **About a fifth of the effort is on the ice** (Maine: 17–22 % of the days on bass, white perch and pickerel waters). In open water, effort is concentrated from late May through August, peaking in early July.
3. **Catch per angler-hour (all anglers)**, from Maine per-day rates: smallmouth ≈ 0.3 in summer and almost none through the ice; pickerel ≈ 0.12 in summer and ≈ 0.25–0.4 through the ice; white perch ≈ 0.5 open water and ≈ 0.3 ice. Anglers who target bass catch 1–5 an hour (6–14 in eastern-Maine boom years).
4. **Release.** Bass 97 % in summer and 87 % in winter statewide even where harvest is legal; 100 % at Hot Brook by law. Pickerel 94 % / 79 %. White perch in Region F 40 % / 32 % (most fish of keepable size are kept).
5. **Exploitation at this effort is small:** about 0–4 % a year for every species, plus release deaths under 1 % a year for bass [inf]. Natural mortality is ten times larger. The heavily fished, unregulated Murphy Flowage still took only 2–12 % of its panfish and about 27 % of its bass and pike a year.
6. **Hooking mortality rises with temperature and with bait.** It is about 1 % in cold water or through the ice, 2–7 % at 10–22 °C, and 10–30 % above about 27 °C (bluegill 1 % at 16.7 °C vs 25 % at 30 °C; largemouth tournaments at 27–33 °C 31 %). Smallmouth on live minnows 11 % vs 0 % on spinners. Maine smallmouth tournaments: 8.9 %. Pike through the ice on treble hooks under 1 %. Hot Brook's surface peak (~24 °C) stays mostly below the worst range, and its ALO rule from 1 October removes live bait in the cold months.
7. **The larger effect on bass may be sublethal:** guarding males played to exhaustion take four times longer to return to the nest, and angling nesting males cuts fry production in some Ontario waters.

---

## 1. Angling effort: per hectare, open water vs ice, by month

### Takeaway
- No creel survey exists for either Hot Brook lake or for any small Region F warmwater lake I could read.
- Maine's statewide questionnaires give effort per lake acre by region. Region F is about 40 % of the statewide average and a fifth of southern Maine's.
- Remote lakes get less effort than the regional average, because effort tracks distance from people.

### Cited Findings
- **MDIFW 1998–99 angler questionnaires, bass waters (Bass Plan Tables 8–9, p. 21)** [FT] — `../fetched/blackbass.pdf` ([maine.gov copy, 403 now](https://www.maine.gov/IFW/docs/strategic-management-plans/blackbass.pdf)):

  | Region | Summer days/acre | Winter days/acre | Annual days/acre | Annual days/ha [derived] | Winter share [derived] |
  |---|---|---|---|---|---|
  | A (Sebago) | 9.2 | 1.3 | 10.5 | 25.9 | 12 % |
  | C (Downeast) | 1.5 | 0.5 | 2.0 | 4.9 | 25 % |
  | **F (Penobscot; Hot Brook)** | **1.4** | **0.4** | **1.8** | **4.4** | **22 %** |
  | State | 3.8 | 0.8 | 4.6 | 11.4 | 17 % |

  - Statewide, angler-days on bass doubled from 1.2 M (1982) to 2.4 M (1999). Winter was 17 % of annual effort.
  - The plan says effort in each region follows the distribution of Maine's human population.
  - Region F in 1999: 173,100 summer and 44,300 winter angler-days.
- **MDIFW *White Perch Plan* Table 1 (1998–99), Region F** [FT] — `../fetched/whiteperch.pdf`:
  - open water on lakes: 17,668 anglers, 158,309 angler-days (≈ 9 days per angler);
  - ice: 7,702 anglers, 38,404 angler-days (≈ 5 days per angler; statewide 6.2);
  - over Region F's 150,834 acres of white perch water that is **1.05 open-water + 0.25 ice = 1.30 days/acre (3.2/ha)** a year, **20 % of it on the ice** [derived].
- **Pickerel, statewide 1999** [NOTE: `pickerel_population_dynamics.md`, from the MDIFW pickerel assessment]: 345,000 winter angler-days, 18 % of the year's pickerel effort; so ≈ 1.9 M days in all, ≈ 3.8 days/acre over 514,205 acres [derived].
- **Remote access lowers effort.** At Murphy Flowage (73 ha, over 100 miles from a city), the author rates effort as about average for north-central waters but above average for sparsely populated areas. Earlier work there found the distance anglers travel falls as pressure rises (Churchill & Snow 1964, cited) — [Snow 1978, WDNR Tech. Bull. 103](http://embed.widencdn.net/pdf/download/widnr/asdpentqqi/SS0103.pdf?u=s6hrco&showinbrowser=true) [FT].
- **Murphy Flowage, Wisconsin, 1955–69** (73 ha, maximum 4.3 m, 70 % under 3 m, dense weeds; no closed season, bag or size limit; compulsory creel census) [FT, as above]:
  - effort averaged **73.6 h/acre/yr (182 h/ha)**, range 40.6–131.5;
  - **88 % in open water and 12 % through the ice** (3–22 % by year);
  - three-quarters of all fishing fell between 16 May and 31 August; the busiest half-month was 1–15 July (14 % of the year); the ice peak was 16–31 December;
  - effort was lowest at 1–15 April and 16 October–15 November, between the seasons;
  - 3,576 trips and 13,242 h a year, i.e. **3.7 h per trip** [derived];
  - 63 % of trips caught at least one fish; the most successful 10 % of anglers took about half the fish.
  - The report's comparison table: 8 Michigan lakes of 1–130 acres 21 h/acre; 14 Minnesota lakes 38 h/acre; Escanaba Lake (293 acres) 65; 12 Alabama lakes 567.
- **Sodus Bay, New York (1,358 ha, Lake Ontario embayment), Apr 2008–Mar 2009** — [Sanderson 2010, NYSDEC](https://extapps.dec.ny.gov/docs/fish_marine_pdf/sbaycreel.pdf) [FT]:
  - 161,356 angler-h a year: **26.0 h/acre open water and 22.1 h/acre on the ice** (119 h/ha in all; derived);
  - open-water trips 3.7 h, ice trips 5.4 h [derived from Table 12]; complete trips 5.2 h; parties of 2.1 anglers;
  - monthly daytime effort (Table 4), as a share of the year's daytime hours [derived]: Apr 8.2 %, May 8.2, Jun 11.1, Jul 8.3, Aug 6.9, Sep 4.1, Oct 3.1, Nov 2.0, Dec 0.2, **Jan 22.5, Feb 19.2**, Mar 6.2. Ice fishing (14 Dec–14 Mar) is 46 % of the year here because of a large yellow perch ice fishery;
  - **a weekend day carries 2.4–2.8 times a weekday's effort** [derived from the weekday/weekend columns];
  - night fishing (May–July only) was 2.5 % of the year's hours; bullhead was 26 % of the night shore effort, mostly in May.
- **Other New York lakes (Sodus report Table 12)** [FT, as above], angler-h per acre:
  - open water: Conesus 17.7, Hemlock 19.6, Chautauqua 25.8, Canadice 40.7, Bear 47.2, Irondequoit 58.3, Cassadaga 93.7 (boat only), Oneida 3.8–7.3 (boat only), Whitney Point 11.9;
  - ice: 0.1–43.2 (Hemlock 0.3, Conesus 7.6, Bear 14.2, Irondequoit 43.2).
  - That is **≈ 9–230 h/ha in open water and ≈ 0.2–107 h/ha on the ice** [derived]. These are well-populated western New York lakes.
- **Mooselookmeguntic Lake (Maine)**: 0.29–0.63 open-water angler-days per acre (Gemini report, from Boucher 2014 on digitalmaine). UNVERIFIED: digitalmaine is behind a challenge page.

### Inferences for the sim
- **Annual effort.** Upper ≈ 12 angler-h/ha/yr (≈ 4,400 h, ≈ 1,100 trips) and Lower ≈ 4 (≈ 1,100 h, ≈ 280 trips) [inf]. The reasoning:
  - a Region F lake averages about 1.3–1.8 angler-days per acre for one species' fishery. Species overlap (one day can count for bass and white perch), so the total is about 13–30 h/ha;
  - Hot Brook is about 2 h from Bangor, with 7,317 people within 30 km (`recent_maine_research.md`), an unimproved launch and about 15 camps on Upper, and no boat route into Lower. That puts Upper at or below the regional mean and Lower well below it.
- **Ice share:** 20 % (15–25 %) of annual hours [inf from the Maine 17–22 %].
- **Monthly profile** (share of the year's angler-hours) [inf]. It is built from Murphy's open-water shape (85 % of the open-water hours from mid-May through August), Maine's ~20 % winter share and Hot Brook's calendar (ice-out ~23 April, ALO from 1 October, ice-on ~1 December). See the Values table.
- **Weekly and daily structure:** weekend days ≈ 2.5 × weekdays; trips of ≈ 4 h in open water and ≈ 5 h on the ice; parties of about 2. Mostly daytime with dawn and dusk peaks; a little night bullhead fishing from shore in May–June.
- **Skewed success:** about a third of trips catch nothing and the top tenth catch half the fish (Murphy). Give the anglers a skill spread rather than identical catch rates.

### Gaps
- No Hot Brook or Region F lake creel. MDIFW's Enfield office holds the survey files (`../blocked_sources_to_fetch.md` D1).
- The 2016 statewide angler survey (Responsive Management) is 403; it would give newer per-region effort.
- No Maine month-by-month effort table was found. Deroba et al. 2007's weekday/weekend monthly profiles (Wisconsin) were behind a bot check.
- No Ontario per-hectare effort for remote lakes (Lester et al. 2003 abstract has no numbers — [OUP](https://academic.oup.com/najfm/article/23/4/1312/7847585)).

---

## 2. Catch and harvest rates by species; share released

### Takeaway
- Maine gives catch per angler-day by region and season for bass, white perch and pickerel. Dividing by ~4 h gives per-hour rates of a few tenths for each.
- For the panfish (yellow perch, sunfish, bullhead) the Maine figures sit in the 403-blocked Minor Sportfish Plan. The values below come from New York and Wisconsin.
- Release is near-total for bass and pickerel in open water, about half for white perch, and lower for everything through the ice.

### Cited Findings
- **Smallmouth bass, Maine 1998–99 (Bass Plan Tables 11–13, pp. 23–26)** [FT] — `../fetched/blackbass.pdf`:
  - catch per angler-day: **Region F 1.35 summer, 0.14 winter**; Region C 1.43 and 0.34; statewide 1.66 and 0.46;
  - harvest per angler-day: Region F 0.07 summer, 0.03 winter (state 0.05 / 0.06);
  - **kept: Region F 5.0 % in summer and 20.1 % in winter**; Region C 5.6 % and 10.2 %; statewide 3 % and 13 % (97 % / 87 % released);
  - Region F in 1999: 234,000 bass caught in summer (11,600 kept) and 6,300 in winter (1,300 kept). **Only 2.6 % of the region's bass catch came through the ice** [derived];
  - per hectare of Region F bass water: **≈ 4.9 bass caught and 0.26 kept a year** [derived from Tables 8, 9, 11];
  - winter-caught bass are larger on average, which is partly why winter anglers keep more;
  - in Washington and Hancock Counties bass are almost never caught through the ice;
  - biologists angling in late May and June catch 1–5 bass an hour. In 1999–2000 this rose to 6–14 an hour in many eastern Maine lakes after warm summers (25–60 bass in a 5-hour day). Ordinary anglers sometimes exceed 50 bass a day;
  - temporarily marked bass in eastern Maine were caught several times in a season.
- **Bass, 2016 statewide survey** (BTWG slides, 2019) [FT] — `../fetched/BassTechnicalWorkGroupNov2019.pdf`: harvest 2.6 % of the catch in open water and 10.3 % through the ice.
- **White perch, Maine 1998–99 (White Perch Plan Table 1, pp. 4–6)** [FT] — `../fetched/whiteperch.pdf`:

  | | Caught/day | Kept/day | % kept | Released [derived] |
  |---|---|---|---|---|
  | Region F, ice | 1.29 | 0.88 | 68 % | 32 % |
  | Region F, open water (lakes) | 1.90 | 1.14 [derived] | 60 % | 40 % |
  | Statewide, ice | 0.76 | 0.40 | 53 % | 47 % |
  | Statewide, open water (all) | 1.30 | 0.52 | 40 % | 60 % |

  - Per hectare of Region F white perch water: **≈ 5.7 caught and 3.5 kept a year** [derived].
  - Catch and keep rates fell from 1996 to 1999. The plan cannot tell whether release ethic or a shortage of keepable fish caused it.
- **Chain pickerel, Maine 1999** [NOTE: `perch_pickerel_smallmouth_pumpkinseed.md`, `pickerel_mortality_cannibalism.md`, from the MDIFW pickerel assessment]:
  - 0.49 per angler-day in summer and **1.18 through the ice**; ice rates 2–2.5 × open water in most regions;
  - a late-1950s warden census: 0.42 pickerel per angler-hour through the ice;
  - shallow meso- or eutrophic warmwater lakes: 1.0–2.0 pickerel per angler in winter;
  - **94 % released in open water and 79 % through the ice**; 1.19 M caught and 0.133 M kept statewide.
- **New York creel rates, all anglers (Sodus report Table 13)** [FT] — [Sanderson 2010](https://extapps.dec.ny.gov/docs/fish_marine_pdf/sbaycreel.pdf):
  - smallmouth 0.00–0.10 per angler-hour (Conesus 0.06, Hemlock 0.08, Cassadaga 0.07, Oneida 1997–98 0.10);
  - largemouth 0.04–0.78;
  - yellow perch 0.01–2.41 in open water and 0.03–5.68 through the ice.
  - Anglers targeting the species (Table 14): smallmouth 0.02–0.54, yellow perch 0.07–8.63 in open water and 0.13–5.39 on the ice.
- **Sodus Bay by species (Table 8)** [FT, as above]:

  | Species | Day boat caught/h | Day shore caught/h | Ice caught/h | Released (boat / shore / ice) [derived] |
  |---|---|---|---|---|
  | Yellow perch | 2.58 | 1.85 | 5.68 | 63 / 71 / 71 % |
  | Pumpkinseed | 0.42 | 0.78 | 0.04 | 79 / 89 / 63 % |
  | Bluegill | 0.62 | 1.80 | 0.05 | 67 / 77 / 58 % |
  | Brown bullhead | 0.01 | 0.11 | 0 | 30 / 21 / — |

- **Murphy Flowage** (Wisconsin; heavily fished, unregulated) [FT, Snow 1978]:
  - 1.88 fish harvested per hour overall: 4.20 an hour in winter against 1.58 in summer;
  - yellow perch were caught **6 ×** faster in winter (43 % of the perch harvest came through the ice); pike 3 ×, bluegill 3 ×;
  - largemouth bass were caught **10 ×**, pumpkinseed **4 ×** faster in summer. **Brown bullhead were never caught in winter.**
- **Brown bullhead, Maine 1999** (Gemini report, citing the Minor Sportfish Plan Table 2): statewide 1.76 caught and 0.72 kept per day (59 % released); Region F 0.36 caught and 0.36 kept per day. UNVERIFIED (403), as in `gemini_angling_alewife_checked.md` row C3, which notes Region F's bullhead effort is not distinguishable from zero.

### Inferences for the sim
- **Cross-check of the repo's relative catchability** (`eastern_maine_relative_abundance.md` Q6: bass 1.0, white perch 0.1–0.3). In Region F, anglers catch about 1.2 × as many white perch per hectare as bass (5.7 vs 4.9). Eastern-Maine nets show white perch 10–20 × as numerous as bass among adults. Per fish, then, a white perch is ~0.06–0.12 as catchable as a bass [derived], at the low end of the note's range. **Keep white perch at ~0.1.**
- **Catch per hour should emerge, not be imposed.** A lure is a prey-like stimulus: let the fish's own brain decide whether to strike (the `strike` output, hunger and fear inputs). Then calibrate lure attractiveness so all-angler rates land near the Values table. That way seasonal catch follows the fish's own feeding and location: pickerel feeding under the ice, bass torpid in winter, white perch schools roaming.
- **Per-species catchability by season** follows from the Maine and Wisconsin ratios: pickerel and yellow perch up 2–6 × through the ice; bass, sunfish and bullhead down by 10 × or to zero.

### Gaps
- No Maine per-hour or per-day rate for yellow perch, sunfish, redbreast or fallfish was readable (Minor Sportfish Plan 403).
- No white perch per-hour rate from a creel survey; the per-day rates are converted at 4 h.

---

## 3. Exploitation and size selectivity

### Takeaway
- At Maine effort levels, anglers take a few per cent of a stock a year at most. Even 15 years of heavy, unregulated fishing at Murphy Flowage (182 h/ha) took only 2–12 % of each panfish a year and about 27 % of the bass and pike.
- Anglers keep only larger fish: white perch from about 9 in (23 cm), pickerel around 17 in (43 cm), and bass (where legal) around 12 in (30 cm).

### Cited Findings
- **Murphy Flowage annual exploitation u (Table 7), mean (range)** [FT, Snow 1978]:

  | Species | Exploitation u | Natural mortality | Total A |
  |---|---|---|---|
  | Yellow perch | **5 %** (2–6) | 55 % | 61 % |
  | Pumpkinseed | **8 %** (3–18) | 60 % | 72 % |
  | Bluegill | 12 % (4–24) | 46 % | 61 % |
  | Brown bullhead | **2 %** (0–3) | 48 % | 50 % |
  | Rock bass | 18 % | 23 % | 44 % |
  | Largemouth bass | **27 %** (14–45) | 21 % | 48 % |
  | Northern pike | **26 %** (3–50) | 40 % | 66 % |

  - Natural mortality was several times the exploitation for most species; only largemouth exploitation exceeded its natural mortality.
  - For pike, most of the catch came from fish that would have died anyway; for bluegill and largemouth, about half. **Angling mortality was partly compensatory.**
  - Mean length of fish caught: yellow perch 6.0 in (15 cm), pumpkinseed 5.7 in (14.5 cm), bluegill 6.0 in, brown bullhead 11.8 in (30 cm), largemouth 11.7 in (30 cm), native pike 21.1 in (54 cm).
- **Maine bass** [FT, Bass Plan pp. 13, 24]:
  - harvested bass average 12.0 in and 1.2 lb in Region F, 12.4 in and 1.0 lb in Region C, 14.2 in and 1.5 lb statewide;
  - eastern and northern Maine bass caught average about 11 in and 0.6 lb, and 20–33 % exceed 12 in;
  - statewide harvest 0.25 bass/acre/yr; Region F 0.13 lb/acre/yr.
- **Maine white perch** [FT, White Perch Plan p. 11]:
  - anglers do not want to keep perch under 8–10 in; creel-survey fish kept were **9–10.5 in (23–27 cm) and 0.43–0.61 lb**;
  - an 8–10-in perch weighs ≈ 0.45 lb and is about four years old;
  - the plan estimates 50 % of desirable-size white perch could be harvested without harm, and recommends unlimited harvest at current pressure for most waters because of stunting.
- **Maine pickerel** [NOTE]: fish kept through the ice averaged 17.0 in (43 cm) and 1.2 lb; most fish caught are age 3–5 at 14–19 in (36–48 cm). Angling F ≈ 0.03–0.05 a year against ~25 fish/ha (`pickerel_population_dynamics.md`).
- **Maine white perch F ≈ 0.02–0.08** (statewide catch 6 % of standing crop in 1981) [NOTE: `white_perch_regulation.md`].
- **Smallmouth in a harvest era (Clear Lake, Wisconsin, 1970s):** exploitation 37–85 % by length group [NOTE: `eastern_maine_relative_abundance.md` Q2].
- **Size of bass that take a hook:** Clapp & Clark's 55 wild smallmouth angled on minnows or spinners were 6.3–12.6 in (16–32 cm) — [OUP abstract](https://academic.oup.com/najfm/article/9/1/81/7881667) [ABS].

### Inferences for the sim
- **Exploitation scales roughly with effort.** Hot Brook's ~10 h/ha is about 1/18 of Murphy's 182. With u ≈ 1 − e^(−qE), Murphy's yellow perch 5 % implies ~0.3 % at Hot Brook, and pumpkinseed 8 % implies ~0.5 % [derived; q held equal, a strong assumption]. Region F's own per-hectare catches give a direct check:
  - **bass:** ≈ 2–3 caught/ha/yr at Hot Brook's effort [derived from 4.9/ha at ≈ 18 h/ha]. Against ~15–30 bass/ha of hookable size, that is ~0.1–0.2 captures per bass a year. None are kept;
  - **white perch:** ≈ 2 kept/ha/yr against 250–750/ha of ≥ 7.5 cm, or ≈ 1–4 % of the keepable (≥ 20 cm) fish;
  - **pickerel:** statewide ≈ 0.6–1 kept/ha/yr at ≈ 37 h/ha (3.8 days/acre × 2.471 × 4 h) scales to ≈ 0.15–0.3 kept/ha/yr at Hot Brook, against ~25/ha: ≈ 0.5–1.5 %.
- **So angling at Hot Brook is a minor adult mortality** (≈ 0–4 %/yr by species, against natural M of 20–60 %). It still matters for three things: the size structure of white perch and pickerel (it removes the largest), the bass nests (§4), and as a readout comparable to the owner's own catches.
- **Do not double-count.** `BIOE.M_OTHER` (`config.js`) and the 3-D sim's per-species `mOther` (`fish3.js`) currently include angling among the unsimulated causes. If anglers become explicit, take their share (≈ 0.005–0.03/yr) out of that hazard.
- **Size windows** for keeping are in the Values table. The minimum hookable size follows the fish's own diet: a fish strikes a lure it would eat, so gape and prey-size preference set the lower limit (about 10–12 cm for panfish, 15–20 cm for bass and pickerel) [inf].

### Gaps
- No exploitation estimate (tag return, creel ÷ population) for any species in a Maine or New England warmwater lake.
- Yellow perch, sunfish and bullhead keep sizes in Maine are unverified (Minor Sportfish Plan 403).

---

## 4. Catch-and-release (hooking) mortality: temperature, bait, deep hooking, tournaments, nesting

### Takeaway
- In casual angling with lures, release mortality is near zero to a few per cent in cool water. Bait, deep hooking, heat, livewells and weigh-ins push it up.
- The clearest temperature contrast: bluegill on bait 1 % at 16.7 °C vs 25 % at 30 °C.
- Smallmouth: 0 % on spinners vs 11 % on live minnows; 8.9 % in Maine tournaments.
- Esocids: pike ≈ 4.5 % overall, under 1 % through the ice on treble hooks, 33 % on large "pike hooks"; deaths cluster in July–August.
- No study gives a smallmouth mortality curve by temperature; the black bass tournament meta-analysis shows temperature correlated with mortality but gives no curve in its abstract.

### Cited Findings
- **Smallmouth, casual angling (Michigan; Clapp & Clark 1989, NAJFM 9:81–85)** [ABS] — [OUP](https://academic.oup.com/najfm/article/9/1/81/7881667):
  - 55 tagged wild smallmouth (16–32 cm) in artificial stream channels over four 2-week periods;
  - mortality **11 % on live minnows (single hook), 0 % on spinners (treble hook), 4 % unhooked controls**;
  - minnow-hooked fish died significantly more often than both other groups. The authors suggest artificial lures only for no-kill bass rules.
- **Smallmouth and largemouth tournaments in Maine (Hartley & Moring 1995, NAJFM 15:666–670)** [ABS] — [OUP](https://academic.oup.com/najfm/article/15/3/666/7882446):
  - nine tournaments on three Maine lakes, June–October 1989; initial deaths at weigh-in plus deaths within 48 h;
  - **8.9 % of smallmouth and 3.2 % of largemouth died**; 0–19.5 % by tournament;
  - large tournaments had a significantly higher probability of death; fewer steps and less time between livewell and release lowered it.
- **Black bass tournaments, meta-analysis of 130 tournaments 1972–96 (Wilde 1998, *Fisheries* 23(10):12–22)** [ABS] — [OUP](https://academic.oup.com/fisheries/article/23/10/12/7884434):
  - initial mortality 19.5 % (1970s), 6.6 % (1980s), 6.5 % (1990s); delayed 20.9 % and 23.3 %; total **26.2 % and 28.3 %** in the 1980s and 1990s;
  - water temperature correlated with initial (r = 0.51) and delayed (r = 0.36) mortality; a nonlinear temperature regression explained 20–30 % of the variation. The fitted curve is in the paywalled full text.
- **Hot-water tournaments (Lake Eufaula, Alabama; Weathers & Newman 1997)** [ABS] — [OUP](https://academic.oup.com/najfm/article/17/1/131/7882716): 14 tournaments at **27.2–32.8 °C**; total mortality 30.8 % (9.1–68.4 %); larger fish died more.
- **Cool-water tournaments (Lake Minnetonka, Minnesota; Kwak & Henry 1995)** [ABS] — [OUP](https://academic.oup.com/najfm/article/15/3/621/7882539): total 4.7 % (1.4 % initial + 3.4 % within 3 days); a May tournament's catch and mortality were over 1.5 × a September one's (spawning condition). Tournament deaths were 2–6 % of angling mortality on the lake.
- **Bluegill by season (Muoneke 1992, Texas)** [ABS] — [OUP](https://academic.oup.com/najfm/article/12/3/645/7882221): on size-4 hooks, **1 of 95 died at 16.7 °C (winter, worms) and 19 of 75 at 30 °C (summer, crickets)**: 1.1 % vs 25.3 %. Season and bait changed together.
- **Esocids (Tomcko 1997, Minnesota DNR review of 10 studies)** [FT] — [MN Fish Management Report 32](https://www.lrl.mn.gov/docs/pre2003/other/970377.pdf):
  - northern pike **4.5 % (95 % CI 3.0–5.9)**, 5.3 % including pike hooks; muskellunge 15.6 %; tiger muskellunge 11.3 %;
  - **swallowed baits 13.5 % vs 4.2 % when not swallowed** (Grimm 1981, Netherlands, pike held 6–10 months);
  - on baited hooks, 29 % of pike were hooked beyond the gill arches (Beukema 1970), yet overall mortality was 5.2 %;
  - **through the ice**, pike on treble hooks with live bait died at < 1 %, and on Swedish pike hooks with dead smelt at 33 % — confirmed in the [DuBois et al. 1994 abstract](https://academic.oup.com/najfm/article/14/4/769/7882552) [ABS] (185 pike, 3 Wisconsin lakes, 48 h). Deeply hooked fish died more; 84 % of fish that bled survived;
  - tiger muskellunge: **50–85 % of hooking deaths came in July–August (mean 27.5 °C)**, which held only 22–33 % of the catch; April–June and September–October averaged 21.5 °C (Storck & Newman 1992). Muskellunge released at a mean 21.4 °C: 0 % (Strand 1986);
  - Beukema 1970's title reports acquired hook avoidance in pike [SEC, reference list].
- **Temperature, across species (Gale, Hinch & Donaldson 2013, *Fish and Fisheries* 14:1–33)** [ABS, via Crossref] — [doi](https://doi.org/10.1111/j.1467-2979.2011.00441.x):
  - 83 studies; warming increased mortality and stress in **70 %** of those that measured each;
  - release mortality rises at temperatures within, not only above, a species' preferred range.
- **Smallmouth recovery (Schreer, Cooke & McKinley 2001, TAFS 130:783–795)** [ABS] — [OUP](https://academic.oup.com/tafs/article/130/5/783/7891048):
  - fish acclimated to 12, 16 or 20 °C, played 20 s or to exhaustion (120–180 s);
  - cardiac recovery took ≈ 40 min (0–85) after brief play and ≈ 105 min (20–210) after exhaustion. Temperature did not change recovery time within 12–20 °C.
- **Ontario MNR guidance (Casselman 2005, summarised on [ontario.ca](https://www.ontario.ca/page/catch-and-release-fish-handling))** [SEC]:
  - an average of **16.2 %** release mortality across 118 studies (over 120,000 fish), all species and gears;
  - deep-hooked fish die more; cutting the line helps;
  - avoid releasing fish caught deeper than about 5–6 m (barotrauma; Kerr 2001);
  - no damage or death from cold-air exposure was found in ice-caught walleye (Ellis 2000).
- **The EPA lake-fisheries manual (Box 3-B, Gustaveson et al. 1991)** [FT] — `../fetched/Fish and Fisheries Management in Lakes and Resevoirs.txt`: largemouth stress was low after 1–5 min of play at 11–13 °C, moderate at 16–20 °C and severe after 5 min at 28–30 °C. Early-summer mortality was relatively high just after spawning (Lee 1989).
- **Nesting males.**
  - Kieffer et al. 1995 (TAFS 124:70–76; two Ontario lakes) [ABS] — [OUP](https://academic.oup.com/tafs/article/124/1/70/7892906): nesting male smallmouth played to exhaustion (2 min) took **four times longer** to return to the nest than those played under 20 s, which raised the predation risk to their broods.
  - Philipp et al. 1997 (NAJFM 17:557–567) [ABS] — [OUP](https://academic.oup.com/najfm/article/17/2/557/7882324): illegal preseason angling of nesting males was substantial in some Ontario waters and reduced fry production; whether this lowers recruitment at the population level was unresolved.
  - Maine's tournament rules forbid weigh-in tournaments during the nesting period (BTWG slide 6) [FT].
- **Release-related review** — Siepker et al. 2007, *Fish. Manage. Ecol.* 14:91–101 [ABS via Crossref, [doi](https://doi.org/10.1111/j.1365-2400.2007.00529.x)]: names air exposure, circle hooks, weigh-ins and barotrauma as the main factors, and population effects of angling nesting fish as unresolved.

### Inferences for the sim
- **Per-release mortality p(T, hook)** [inf, fitted by eye to the anchors above]:
  - base (lure, hooked shallow, casual release): **1 % at ≤ 10 °C**, 2 % at 15 °C, 4 % at 20 °C, 7 % at 24 °C, 12–25 % at ≥ 28 °C. An exponential p ≈ 0.01·e^(0.12·(T − 10)) fits up to ~25 °C;
  - **deep-hooked ×3** (Grimm 13.5 vs 4.2 %);
  - **chance of deep hooking:** ~5 % on lures, ~25 % on live bait (Beukema's 29 % on baited pike hooks);
  - species: esocids ×0.7 (≈ 4.5 % overall); sunfish and perch on bait in warm water at the top of the range (bluegill 25 % at 30 °C).
- **Hot Brook's regime keeps p low most of the year.**
  - From 1 October the lakes are ALO (`gemini_angling_alewife_checked.md` B2), so there is no live bait, and the water is cooling.
  - Ice fishing at 1–4 °C with treble or single hooks gives ~1 %.
  - Peak risk is late July–August, when the surface is ~22–24 °C.
- **Annual release deaths of bass at Hot Brook:** ~0.1–0.2 captures a year × ~4–7 % ≈ **0.5–1 %/yr** [derived]. Pallette Lake's 3–7 captures a year belong to a far more heavily fished lake.
- **Barotrauma:** the maximum depth is 5.5 m, at the threshold the Ontario guidance gives, so ignore it [inf].
- **Sublethal effects worth modelling:**
  - a released fish stops feeding and stays near cover for ~40–105 min (cardiac recovery);
  - a played nesting male bass leaves the nest for minutes to hours, during which egg and fry predators (sunfish, perch) can take the brood. This is the main channel by which catch-and-release angling might affect bass numbers [inf].
- **Learning:** pike learn to avoid hooks (Beukema 1970). This fits the sim's Baldwinian plastic weights (`a.lw`): a fish hooked and released could learn to avoid lures without inheriting it [inf].

### Gaps
- No smallmouth hooking-mortality curve by temperature: Wilde 1998's fitted curve and Bartholomew & Bohnsack 2005 / Muoneke & Childress 1994 are paywalled or Springer-blocked.
- No measured release mortality for yellow perch, white perch, pumpkinseed, redbreast, bullhead or fallfish in lake angling (only bluegill and the esocids).
- Hühn & Arlinghaus 2011 (the AFS meta-analysis) was not reached.

---

## 5. Ice fishing in Maine

### Takeaway
- Through the ice, Maine anglers catch pickerel (more readily than in summer), white perch and yellow perch, rarely bass, and (Wisconsin evidence) never bullhead.
- Ice fishing is mostly tip-ups (traps) with live bait, plus jigging.
- About a fifth of the effort on Maine warmwater lakes is on the ice, and ice trips are longer than open-water trips.

### Cited Findings
- **Gear (2016 statewide survey)**: traps or tip-ups 90 % of ice anglers, jigging 26 % (multiple answers allowed). Open water: spin 56 %, bait 35 %, trolling 19 %, fly 15 % — BTWG slide [FT] `../fetched/BassTechnicalWorkGroupNov2019.pdf`.
- **Effort share:** winter was 17 % of statewide bass-water effort, 22 % in Region F (Table 9); 20 % of Region F white perch effort (White Perch Plan Table 1); 18 % of pickerel effort statewide [NOTE] (§1).
- **Days per ice angler:** about 5 a winter in Region F (White Perch Plan) [derived].
- **Species and rates:**
  - pickerel 1.18 per ice angler-day against 0.49 in summer; 79 % released [NOTE];
  - white perch Region F 1.29 per day, 68 % kept [FT];
  - bass Region F 0.14 per day, 2.6 % of the year's bass catch [FT, derived];
  - Murphy Flowage: yellow perch 6 × and pike 3 × faster in winter, bullhead never caught [FT].
- **Where** [NOTE: `perch_pickerel_smallmouth_pumpkinseed.md`, `whiteperch_shiner_sucker_bullhead.md`]:
  - pickerel tip-ups on weed beds in under 3 m, often within ~20 yd of the beds in 1.5–1.8 m (Maine forum);
  - New York: 1.5–4.6 m around remaining weeds, with minnows 0.3–1 m off the bottom;
  - white perch schools roam, are compact, and stay at a spot for minutes to hours (anglers move after ~15 min);
  - Horseshoe Lake (Hancock Co.; 82 ha, max 6.1 m, isothermal in summer) is lightly used in open water but popular with ice anglers for white perch.
- **Season and rules** [NOTE: `full_biota_and_processes.md`, `gemini_angling_alewife_checked.md` B2]:
  - the 2026 law book (read in an earlier session) puts these South Zone lakes open to fishing all year, with ALO + S-7 from 1 October to 31 December;
  - the sim's ice-on is ~1 December, ice-out ~23 April.
- **Hooking mortality on the ice:** pike under 1 % on treble hooks (DuBois et al. 1994); no cold-exposure harm in walleye (Ellis 2000, via Ontario) (§4).

### Inferences for the sim
- **The bait ice fishery effectively starts on 1 January** [inf]: tip-ups need live or dead bait, which the ALO rule forbids until 31 December. December ice, if safe, would carry only a little jigging. The season runs to unsafe ice in late March or early April. Effort peaks in January–February (Sodus: 42 % of the year's hours in those two months, a perch-dominated extreme; Murphy peaked at first ice).
- **Where on Hot Brook** [inf]:
  - pickerel tip-ups along the weed edges at 1–3 m, mostly within reach of the Upper launch on the south basin;
  - jigging for white and yellow perch over Upper's deeper north basin (to 5.5 m) and Lower's 3–4 m saucer;
  - bass essentially not caught.
- **Access in winter** may favour Lower more than in summer: snowmobiles and Lower's private roads (`birds_mammals_people_evidence.md`) avoid the brook [inf; unverified]. Keep Lower's ice share of its own effort at about 25–35 % rather than 20 %.

### Gaps
- The number of lines allowed and the trap-tending rules were not re-read (law book 403).
- No Maine per-lake ice creel was readable (e.g., the Lake George, Maine, winter surveys on digitalmaine).
- The repo has no record of whether Hot Brook is ice-fished much (the owner's knowledge would settle it).

---

## 6. Hot Brook specifics

### Takeaway
- No creel, angler diary, tournament or effort record exists for either lake online.
- What is known is structural: where people can get on the water, the special rules, and which fisheries MDIFW calls principal.

### Cited Findings
- **MDIFW survey sheets (1949, revised 1965 and 2004)** [FT] — `../fetched/hot_brook_lake_upper.pdf`, `..._lower.pdf`:
  - principal fisheries: smallmouth bass, white perch, chain pickerel (both lakes);
  - managed for a larger-than-average bass fishery under special rules; 25-fish white perch bag;
  - access: an unimproved boat launch at the south end of Upper off Route 169;
  - Upper has camp development along its south shore. Lower has no camps (2004). Lower is reachable only through the brook, which cannot be run by motorboat: a boat must be paddled, poled or walked through parts of it.
- **MDIFW fishing guides (2016, 2021, 2024)** list the lakes under Region F, primary fishery SMB, WHP, PKL [NOTE: `hot_brook_lake_records.md`].
- **Shore:** at least 15 buildings on Upper's south shore, including an outfitter with about a mile of frontage [NOTE: `full_biota_and_processes.md`].
- **Tournaments:** Maine permits tournaments through MDIFW. Weigh-in tournaments are not allowed on waters under 500 acres or during the nesting period, at most 7 a year per water. Open tournaments are capped at 1 boat per 35 acres (max 100); club tournaments at 15 boats (BTWG slide 6) [FT].
- **Owner's field knowledge** [NOTE: memory `hot-brook-field-observations`]: fishes the brook's 3–4-ft pools (sunfish there), catches pickerel, bass catch-and-release, fewer and smaller perch than fallfish and bass.

### Inferences for the sim
- **Spatial effort** [inf]:
  - most boat effort within a few km of Upper's south-end launch and camps;
  - shore fishing at the launch, the camps and the brook's pools (fallfish, sunfish, bass);
  - Lower gets canoe and kayak trips through the brook in summer and some ice anglers in winter.
- **Tournaments** [inf]: Upper (912 acres) meets the 500-acre size rule, but the immediate-release bass rule rules out possession, so only catch-measure-release events would fit; at most ~26 boats for an open event (912/35) [derived]. No tournament record for these lakes was found, so leave tournaments off by default.

### Gaps
- MDIFW Region F (Enfield) files: any creel, angler counts, tournament permits.
- The owner could supply: boats seen on a typical summer weekend, ice shacks or flags in winter, how often Lower is visited.

---

## 7. Conflicts and corrections

1. **Open to fishing until 30 November (the brief) vs open all year.** The 30 November date is the 2004 survey sheet's wording: the old S-24 extended season (White Perch Plan Table 5 lists the white perch lakes on the extended 30 November season). The 2019, 2023 and 2026 law books, as read in earlier sessions, give the lakes ALO + S-7 from 1 October to 31 December, which implies an open December. `full_biota_and_processes.md` reads the 2026 South Zone general law as open all year. **The repo notes are probably right for the present day.** This could not be re-checked (maine.gov 403). It matters for the sim only in December, when ice is forming anyway.
2. **White Perch Plan text vs its own table.** The text (p. 6) says that in 1999 ice anglers kept 41 % and open-water anglers 53 %. Table 1 gives **53 % kept on the ice** (135,745 of 258,382) and **39.9 % in open water** (829,144 of 2,079,243), and the text's own 0.52 kept per open-water day matches the table. **The text has the two swapped.** `whiteperch_shiner_sucker_bullhead.md` quotes the per-day rates only, so it is unaffected.
3. **No hooking-mortality figure verified** (`eastern_maine_relative_abundance.md` Q2 Gaps): now partly filled (Clapp & Clark; Hartley & Moring, a Maine study; Tomcko's esocid review; Muoneke).
4. **Pickerel angling F at Hot Brook.** `pickerel_population_dynamics.md` gives F ≈ 0.03–0.05 from statewide catch per hectare. At Hot Brook's lower effort (about a quarter of the statewide pickerel-water mean of ≈ 37 h/ha), F ≈ 0.005–0.02 is more likely [inf]. A refinement, not a contradiction.
5. **Bass through the ice.** The Gemini report's claim of a March surge of bass through the ice is already flagged in `gemini_angling_alewife_checked.md` (item 11). Region F's own numbers agree with the flag: 2.6 % of the year's bass catch came through the ice.

---

## Values for the sim

Confidence: **H** = Maine data or several consistent primary sources; **M** = one primary source, a regional value, or an analogue lake; **L** = inference or a value from a distant analogue.

### Effort

| Quantity | Value (range) | Basis | Conf. |
|---|---|---|---|
| Region F lake average, all anglers | 13–30 angler-h/ha/yr | 1.3–1.8 angler-days/acre/yr for single-species fisheries, × 2.471 × 4 h, plus overlap (§1) | M |
| **Upper Hot Brook** | **12 h/ha/yr (5–25)** ≈ 4,400 h, ≈ 1,100 trips | Region F mean, scaled down for remoteness and the unimproved launch | L |
| **Lower Hot Brook** | **4 h/ha/yr (1–10)** ≈ 1,100 h | no camps; only reachable through the non-navigable brook | L |
| Ice share of annual hours | **20 % (15–25)**; Lower 25–35 % | Maine questionnaires 17–22 % (bass, white perch, pickerel) | M |
| Monthly share of annual hours | Jan 9, Feb 8, Mar 3, Apr 1, May 13, Jun 21, Jul 21, Aug 14, Sep 6, Oct 2, Nov 1, Dec 1 (%) | Murphy's open-water shape (75 % from 16 May to 31 Aug); Maine's ~20 % winter; Hot Brook calendar and ALO | L |
| Trip length | 3.7 h open water; 5.4 h ice; parties of ~2.1 | Murphy; Sodus Bay | M |
| Weekend vs weekday | a weekend day ≈ 2.4–2.8 × a weekday | Sodus Bay | M |
| Night share | < 5 % of hours (May–July ~9 %); bullhead fishing from shore | Sodus Bay | L |
| Angler skill spread | ~37 % of trips catch nothing; the top 10 % take ~50 % of fish | Murphy | M |

### Catch per angler-hour (all anglers, Hot Brook default; targeted anglers several × higher)

| Species | Open water | Ice | Basis | Conf. |
|---|---|---|---|---|
| Smallmouth bass | **0.3 (0.1–0.5)**; targeted 1–5 (6–14 in boom years) | **≤ 0.03** | Region F 1.35 and 0.14 per day; MDIFW experimental angling; NY 0.00–0.10 (all anglers) | M |
| Chain pickerel | **0.12 (0.05–0.2)** | **0.25 (0.2–0.45)** | Maine 0.49 and 1.18 per day; warden census 0.42/h on the ice | M |
| White perch | **0.5 (0.3–1)**, patchy on schools | **0.3 (0.2–0.5)** | Region F 1.90 and 1.29 per day | M |
| Yellow perch | 0.2 (0.05–0.5) | 0.3 (0.05–1); ×2–6 summer | NY 0.01–2.4 open water, 0.03–5.7 ice; Murphy 6 × faster in winter | L |
| Pumpkinseed, redbreast | 0.4 (0.1–0.8) | 0.03 | Sodus 0.42–0.78 and 0.04; Murphy 4 × faster in summer | L |
| Brown bullhead | 0.05 (0.01–0.1) by day; higher at night in May–June | 0 | Sodus 0.01–0.11; Murphy none in winter | L |
| Fallfish (brook, inlets) | 0.2–0.5 near streams | ~0 | relative catchability 0.5–1 × bass (`eastern_maine_relative_abundance.md` Q6) | L |
| White sucker | ~0.01 | 0 | rarely angled in lakes [inf] | L |

### Release share (of fish caught)

| Species | Hot Brook value | Basis | Conf. |
|---|---|---|---|
| Smallmouth bass | **100 %** (law: released alive at once) | law book; elsewhere in Maine 97 % summer, 87 % winter (Region F 95 / 80 %) | H |
| Chain pickerel | **94 % open water, 79 % ice** | Maine 1999 | H |
| White perch | **40 % open water, 32 % ice** (the rest kept, bag 25) | Region F 1999 (statewide 60 / 47 %) | H |
| Yellow perch | ~65 % | Sodus 63–71 % | L |
| Pumpkinseed, redbreast | ~85 % open water, ~65 % ice | Sodus 79–89 % and 63 % | L |
| Brown bullhead | ~25 % | Sodus 21–30 %; Maine statewide 59 % (unverified) | L |
| Fallfish, white sucker | ~100 % | not food fish [inf] | L |

### Exploitation (annual share of the stock harvested)

| Species | Hot Brook value | Basis | Conf. |
|---|---|---|---|
| Smallmouth bass | **0** harvest; release deaths **≈ 0.5–1 %/yr** | ~0.1–0.2 captures a bass a year × 4–7 % | M |
| Chain pickerel | **0.005–0.02** (+ ~0.3 % release deaths) | statewide 0.6–1 kept/ha/yr at ≈ 37 h/ha, scaled to ≈ 9 h/ha | M |
| White perch | **0.01–0.04** of fish ≥ 20 cm; ~0.003–0.01 of all ≥ 7.5 cm | Region F 3.5 kept/ha/yr at ~1.5 × Hot Brook's effort | M/L |
| Yellow perch | 0.005–0.02 | Murphy 5 % at 18 × the effort | L |
| Pumpkinseed, redbreast | 0.005–0.02 | Murphy 8 % (3–18) | L |
| Brown bullhead | 0.002–0.01 | Murphy 2 % (0–3) | L |
| Heavy-use reference | yellow perch 5, pumpkinseed 8, bluegill 12, bullhead 2, largemouth 27, pike 26 (%) | Murphy Flowage at 182 h/ha, no limits | H (for that lake) |

### Sizes caught and kept

| Species | Smallest usually caught | Kept window | Basis | Conf. |
|---|---|---|---|---|
| Smallmouth bass | ~15 cm | none kept; catch averages ~28 cm (11 in), 20–33 % over 30 cm | Bass Plan; Clapp & Clark (16–32 cm) | M |
| Chain pickerel | ~25 cm | kept ≳ 36 cm; mean kept 43 cm (17 in) | MDIFW pickerel assessment [NOTE] | M |
| White perch | ~12 cm | **kept ≥ 20–23 cm; typical 23–27 cm (0.20–0.28 kg)** | White Perch Plan p. 11 | H |
| Yellow perch | ~12 cm | kept ≥ 20 cm (8 in) | Maine perch usually 15–30 cm; Murphy caught mean 15 cm [inf] | L |
| Pumpkinseed, redbreast | ~10 cm | kept ≥ 15 cm | Murphy caught mean 14.5 cm [inf] | L |
| Brown bullhead | ~18 cm | kept ≥ 25 cm | Murphy caught mean 30 cm [inf] | L |

### Release (hooking) mortality per capture

| Condition | Value | Basis | Conf. |
|---|---|---|---|
| ≤ 10 °C or through the ice, treble or single hooks | **1 % (0–2)** | pike on the ice < 1 %; bluegill 1.1 % at 16.7 °C | M |
| 10–18 °C | **2–3 %** | smallmouth on spinners 0 %, unhooked controls 4 %; pike 4.5 % overall | M |
| 18–22 °C | **4–6 %** | Maine tournaments June–Oct 8.9 % (smallmouth, with livewell); Minnesota tournaments 4.7 % | M/L |
| 22–25 °C (Hot Brook's late-July peak) | **6–10 %** | tiger muskie deaths concentrated at 27.5 °C; Gale et al.: rises within the preferred range | L |
| ≥ 27 °C (rare here) | **12–30 %** | bluegill 25 % at 30 °C; largemouth tournaments at 27–33 °C 31 % | M |
| Live bait vs lure | bait ≈ +7 points for bass (11 vs 0 %, controls 4 %) | Clapp & Clark | M |
| Deep-hooked | **× 3** (13.5 vs 4.2 %); deep-hooking chance ~5 % lures, ~25 % bait | Grimm 1981; Beukema 1970 (via Tomcko) | M |
| Species | esocids × 0.7; sunfish and perch on bait in heat at the top of the range | Tomcko; Muoneke | L/M |
| Tournament (livewell, weigh-in) | + to 9 % (smallmouth, Maine); 26–28 % meta-analysis mean (mostly southern largemouth) | Hartley & Moring; Wilde | M |
| Barotrauma | none (lakes ≤ 5.5 m) | Ontario guidance: deep water starts at ~5–6 m | L |
| After release | no feeding, near cover for **40 min (brief play) to 105 min (exhausted)**, up to 210 min | Schreer et al. 2001 | M |
| Nesting male bass played to exhaustion | off the nest **4 ×** longer than one played briefly; brood exposed to predators | Kieffer et al. 1995 | M |

**The suggested curve** (base, lure, shallow hook, casual release): p(T) ≈ 0.01·e^(0.12·(T − 10)), capped at ~0.3; × 3 if deep-hooked; live bait raises the deep-hook chance from ~5 % to ~25 %; no live bait from 1 October (ALO) [inf].

---

## Worth getting by hand (blocked to me)

- MDIFW **2016 statewide angler survey** (Responsive Management; `maine.gov/IFW/docs/anglerreport_2016.pdf`): per-region effort, species sought, release by species.
- MDIFW **Minor Sportfish Plan** (2002) and **pickerel** and **yellow perch** plans: per-day catch and keep rates for yellow perch, sunfish and bullhead; a pickerel re-read.
- **MDIFW Region F (Enfield)**: any Hot Brook creel, angler counts, tournament permits.
- **Wilde 1998** full text: the fitted temperature curve for bass tournament mortality.
- **Bartholomew & Bohnsack 2005**, **Muoneke & Childress 1994**, **Hühn & Arlinghaus 2011**: species-specific release mortality, including yellow perch and white perch.
- **Deroba et al. 2007** (Wisconsin weekday/weekend and monthly effort profiles).
- **Lester et al. 2003** and Ontario Broad-scale Monitoring: effort per hectare against road access, for a remote-lake scaling.
