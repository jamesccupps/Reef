# The fish of the real Hot Brook lakes: the census and the agents (design, 2026-10-16)

## The request

The human, before the true-scale rebuild (docs/TRUE_SCALE.md) puts the fish into the real-size lakes:
- "We should probably make sure all the fish we need are accounted for and in before trying to add them to the environment
  … we just need to make sure all the proportions are correct and everything gets an agent that should have one."
- "Maybe some things like minnow that are always in schools can just have one agent."
- "If there are enough agents when you do some of the smaller school fish, maybe the larger ones can still be their own; we
  want this as complex and realistic and true to the environment as we can."
- "This should only have the fish that are actually in the lakes."

So this doc fixes three things before any code: which species, how many of each and at what sizes, and which fish get their
own brain. Research: `docs/research_notes/Hot Brook populations and water/` — `species_numbers_northern_lakes.md` (per-ha
numbers for the larger species, new this round), `small_fish_numbers.md` (killifish, dace and fish under 7.5 cm, new),
`fish_numbers_and_new_species.md`, `eastern_maine_relative_abundance.md`, `hot_brook_lake_records.md`.

## 1. The species: only the fish actually in the lakes

| Species | Evidence | In the sim now? |
|---|---|---|
| White perch | MDIFW list, both lakes; a principal fishery; the human catches mostly white perch; app catches both lakes | yes |
| Yellow perch | MDIFW list, both lakes; app catch (Lower); the human: small and fewer than fallfish and bass | yes |
| Smallmouth bass | MDIFW list, both lakes; managed for larger-than-average size, all released; 70 % of logged app catches | yes |
| Chain pickerel | MDIFW list, both lakes; the human catches a few; app catches (Lower) | yes |
| Brown bullhead | MDIFW list, both lakes; app catch (Upper) | yes |
| White sucker | MDIFW list, both lakes | yes |
| Pumpkinseed | MDIFW database for Upper (not Lower); the human catches them in the brook; app catch (Upper) | yes |
| **Redbreast sunfish** | The human's catches in the brook — by their photo, most of the sunfish they keep are redbreast (long, all-black ear flaps, orange breasts) | **to add** |
| **Fallfish** | MDIFW list, both lakes; the human catches "lots" | **to add** |
| **Banded killifish** | MDIFW list, both lakes | **to add** |
| **Blacknose dace** | MDIFW list, both lakes (a stream minnow: the brook) | **to add** |

Left out:
- **Golden shiner.** It is in the sim at 430/ha (17 % of the census), but no record puts it in either lake. The earlier
  assumption that the survey sheets missed it was not evidence. Removed.
- **Largemouth bass.** Three logged app catches on Upper. MDIFW has no record of it, and the same app logged a smallmouth as a
  rock bass. The human: "probably mislabeled smallmouth".
- **Brook trout and Atlantic salmon.** From a real-estate listing; no survey or stocking record, no cold water.
- **American eel.** Probably present but never recorded (`drainage_species_and_eel.md`):
  - recorded in 14 of 17 similar lakes in the drainage, including Baskahegan Lake upstream on the same stream;
  - the two dams on the way from the sea (Milford, West Enfield) both pass eels;
  - nets rarely catch them.

  The human has never seen one, so it is left out until one is seen.
- **Alewife.** Alewives reached Danforth in 2017 and swim past the mouth of Hot Brook. The state's restoration plan lists both
  lakes as alewife habitat, but none are recorded in them. Left out; a restoration what-if later.
- **Others found in nearby lakes** (golden shiner, common shiner, creek chub; 61 lakes of the drainage tabulated): not recorded
  here, so not added. They come in only if the human or a record confirms them.

Where each lives at the start (they can move through the brook; where they end up is the sim's):
- **Pumpkinseed:** Upper and the brook (MDIFW lists Upper only).
- **Redbreast:** the brook and the weedy shallows of both lakes.
- **Fallfish:** both lakes, densest at the brook and the lake mouths.
- **Killifish:** the shallow shelf (≤ ~1 m) of both lakes.
- **Dace:** the brook.

## 2. How many: the census

The census counts fish of 7.5 cm and up per hectare of lake, in late summer, before the year's young reach that size. It is
the research's synthesis, adjusted to the human's field notes. No eastern Maine lake has a measured census, so each value is
a reasoned estimate inside the measured range of similar northern lakes. Lakes: Upper 369.1 ha + Lower 274.2 ha = 643 ha
(lidar).

| Species | Now (/ha) | Census (/ha) | Range | Whole lakes | Size split (by number) | Basis |
|---|---|---|---|---|---|---|
| White perch | 800 | **750** | 400–1,200 | ~480,000 | ~35 % 7.5–15 cm, ~45 % 15–22, ~20 % > 22 — **inconsistent with the density (2026-10-18, below): stunted at 750/ha, or ~55/35/10 at ~450/ha** | most numerous adults in eastern Maine nets (median 42 %); no northern per-ha count exists |
| Yellow perch | 860 | **500** | 300–700 | ~320,000 | ~60 % 7.5–12, ~25 % 12–15, ~15 % ≥ 15 | soft-water Crystal and Nebish lakes 230–240/ha; mostly juveniles in Maine nets; "small" |
| Pumpkinseed | 215 | **50** | 25–75 | ~32,000 | adults 15–20 cm in the brook | soft-water lakes 12–150/ha; shared with redbreast |
| Redbreast sunfish | — | **50** | 25–75 | ~32,000 | adults 15–20 cm in the brook | the human's catches; EMAP lakes with both have them in similar numbers |
| Brown bullhead | 140 | **100** | 50–150 | ~64,000 | **~70 % < 20 cm** (60–80; was ~50 %, an arithmetic slip — below) | Moe Pond 260, Cassidy 48/ha |
| White sucker | 30 | **70** | 50–100 | ~45,000 | **~60 % juveniles < 30 cm** (50–75; was ~45 % — below) | 20–110 adults/ha in northern lakes; 30 was below every estimate |
| Smallmouth bass | 40 | **40** | 25–45 | ~26,000 (~10,000 adults) | ~33 % age 1, 17 % age 2, 10 % age 3, 40 % age 4+ | soft-water Pallette and Nebish; catch-and-release lengthens the age tail |
| Chain pickerel | 20 | **25** | 15–40 | ~16,000 | ~55 % < 25 cm, 30 % 25–38, 15 % ≥ 38 | no northern count exists; Maine size data |
| Fallfish | — | **85** | 25–100 | ~55,000 | mostly < 20 cm; adults to 35–45 cm | EMAP 0–23 % of adults in lakes with streams; the human: "lots" |
| Golden shiner | 430 | **0** | | | | not in these lakes |
| **Total ≥ 7.5 cm** | **2,535** | **~1,670** | 1,300–2,500 | **~1.07 million** | | |

**The size splits revisited (2026-10-18; research_notes/Whole lake 3D fish simulation/size_structure_whiteperch_sucker_bullhead.md).**
The data page compared the founders with the splits above and found white perch, suckers and bullheads smaller than them. The
research re-ran the founders' rule under the literature's growth curves and checked each split against its own biomass. Nets and
anglers under-sample small fish (eastern Maine's EPA nets caught ~90 % adult suckers and bullheads), and a true count of every fish
≥ 7.5 cm is dominated by the youngest year-classes unless growth is fast:
- **Brown bullhead:** at Moe Pond's 48 % yearly survival age 1 alone is 52 % of the fish and ages 1–2 are 77 %; even fast-growing
  Ottawa River bullheads pass 20 cm only at about age 3; Moe Pond's 50-g mean means most are under 20 cm. **~70 % < 20 cm**
  (moderate confidence) — the sim's founders (69 %) agree.
- **White sucker:** 45 % < 30 cm needs suckers at 30 cm by ~age 2.2 or steady recruitment (thinned Big Bear Lake, Michigan; nothing
  northern found). Dense Big Bear gives 55–62 %, the sim's curve 66 %, subarctic Québec 84 %. **~60 %** (50–75; low confidence).
- **White perch: the split and the density can't both hold.** The split above is what normal Maine growth gives (20–25 cm at age 4;
  mean ~113 g): at 750/ha that is 82–112 kg/ha of white perch alone, against this census's own 20–35 kg/ha and the whole soft-water
  community's 50–90. Two consistent pairs: **stunted at ~750/ha** (the sim's founders, S3 `found` 0.72: 68/32/0 %, ~47 g) or **near-
  normal growth at ~450/ha** (~55/35/10 %, ~71 g: `found` ~0.85). For a lake like Hot Brook the evidence leans to the second —
  moderately rich water, abundant bass and pickerel (stunting goes with eutrophic water and few predators), Washington County lakes
  with normal-sized perch (Crawford ~30 % over 10 in, Meddybemps 10–12 in) — at low–moderate confidence. **The question for the
  human:** are the white perch caught at Hot Brook mostly 6–8 in, or 9–12 in?

**Small species and small fish** (counted whole, all ages 1+; most below 7.5 cm):
- **Banded killifish:** ~150,000 across both lakes (range 20,000–300,000). That is ~0.2/m² of the 88 ha shelf ≤ 1 m.
  The only absolute count (two Newfoundland ponds) found ~20,600 in their shallows. Shoals hold 25–40 fish.
- **Blacknose dace:** ~1,000 from age 1 in the brook (~1,230 m², ~0.8/m²). Catskill streams hold 1.1 dace of all ages (the year's young among them) and 2.2 fish of all species per m² in late summer.

**Biomass:** ~70–110 kg/ha of fish ≥ 7.5 cm at founding, depending on the growth curves. The soft-water evidence is 50–90
kg/ha (Hot Brook: TP 9–10 µg/L, alkalinity ~5). The main levers if it runs high are white perch size and sucker numbers.

**Below 7.5 cm** there are many more fish than above it:
- **Size spectra** put at least 3–4 fish of 3–7.5 cm behind every fish ≥ 7.5 cm, before the year's young.
- **The year's young** come on top of that. The present sim makes 100,000–330,000 young per ha in early June, falling to
  ~17,000–21,000 by September and ~7,000–8,000 by December. The field gives 7,500 young perch/ha in October at Nebish Lake.
- At true scale that is ~200 million larvae in June and ~5 million young by December.

## 3. Who gets a brain: the agents

**The rule (the human's):**
1. **Small fish that always school are one agent a school:**
   - every species' young of the year (school records without brains, as now: ~13,000–30,000 at true scale through
     summer, ~50,000 at the June peak);
   - banded killifish (shoals of ~40);
   - young perch and white perch under ~10 cm (schools of ~80);
   - young sunfish under 7 cm, bullheads under 10 cm and fallfish under 12 cm (groups of 20–30).
2. **Fish that live alone or hold ground are one agent each at every size past those:** smallmouth, pickerel, suckers,
   bullheads, both sunfish, fallfish and the brook's dace.
3. **The rest of the budget goes to individual brains for the biggest schooling fish, largest first.** Adult white perch and
   yellow perch above a cutoff length each get their own brain. They school by their own choice (every brain already senses
   its schoolmates: `school right / ahead / density`), not as one brain steering 80 fish.

**At the true-scale budget of ~300,000 agents** (calculator: scratchpad `census_calc.py`, the census above):

| Species | Fish ages 1+ | Agents | Individuals |
|---|---|---|---|
| White perch | ~480,000 | ~25,000 | ~19,000 (every fish ≥ ~20 cm) |
| Yellow perch | ~320,000 | ~29,000 | ~25,000 (≥ ~20 cm) |
| Pumpkinseed + redbreast | ~88,000 | ~65,000 | every fish ≥ 7 cm |
| Brown bullhead | ~64,000 | ~64,000 | every fish ≥ 10 cm |
| White sucker | ~45,000 | ~45,000 | all |
| Smallmouth bass | ~26,000 | ~26,000 | all |
| Chain pickerel | ~16,000 | ~16,000 | all |
| Fallfish | ~55,000 | ~29,000 | every fish ≥ 12 cm |
| Banded killifish | ~150,000 | ~3,750 | (shoals of 40) |
| Blacknose dace | ~3,000 | ~3,000 | all |
| **Total** | **~1.25 million** | **~306,000** | |

What the budget buys:
- **The floor is ~260,000 agents**: every solitary fish an individual, the schooling fish in schools.
- **Each extra 100,000 agents** moves the schooling species' individual cutoff down by about 2–3 cm:

  | Budget | Schooling fish get their own brain from |
  |---|---|
  | 300,000 | ~20 cm |
  | 400,000 | ~17 cm |
  | 500,000 | ~15 cm |
  | 700,000 | ~12 cm |

- Memory and fast-forward speed set the budget (TRUE_SCALE.md T4/T5; ~1.2 KB an agent after T4).
- The Parry & Evans warning holds: super-individuals degrade in spatial models past ~10 fish an agent. Here only true schools
  carry more, and they move as one in reality.

**The same rule at the 1/10 world.** The budget is per hectare (~470 agents/ha). The 1/10 lakes (6.43 ha) get ~3,000 agents,
as now, with the same cutoffs. So the rule is built and tested now and carries straight over to true scale.

**Moving between rungs (built with the rule):**
- **A school member that grows past the cutoff leaves its school as an individual.** Its genome is the school's, with a fresh
  mutation, as recruits are now. It keeps schooling with its old school as long as its own brain chooses to.
- **The cutoff is recomputed each spring** from the census and the budget.
- **Densities, food and predation always use the fish counts** (Σ n × mass), never the agent counts.

## 4. Field targets the sim should reproduce (not set)

- **Brook sunfish adults ~18–20 cm, some bigger** (the human's photo: "those are typical, mostly from the brook"). The sim's
  pumpkinseed grow to ~13 cm today, so the growth on the brook's warm pools and drifting food needs checking once redbreast
  are in.
- **Fallfish plentiful,** most at the brook and the mouths.
- **Yellow perch small** (few ≥ 15 cm).
- **White perch the most numerous adult fish.**
- **What anglers catch is not what is there.** App logs: Upper 8 bass of 11 catches, Lower 16 of 22 (the "rock bass" was a
  smallmouth). Bass are the most catchable fish; nets show white perch far more numerous. A sim angler with bass lures should
  catch mostly bass anyway.

## 5. The build (before T1, as the human asked)

**Status (2026-10-16, night):**
- **Steps 1–2 BUILT:** the eleven species and their census (`src/w3/species3.js`, fish3.js S3; HOT_BROOK_3D.md §4 "Built — the fish actually in the lakes").
- **Built the same night, at the human's word:**
  - the lakes as one water, with movement through the brook;
  - the riffles' refuge;
  - the young schools that keep moving.
- **Step 3 BUILT — the agent rule** (fish3.js F3.AGENTS_HA 470, S3 `solo` / `group`, `_soloCut`, `_dissolve`):
  - the young of sunfish, redbreast, bullhead and fallfish recruit into groups of 20–25 and leave them as individuals at 7, 7, 10 and 12 cm;
  - perch and white perch schools whose fish reach the budget's cutoff break up into individuals, who school by choice (SOLO_COHERE);
  - the cutoff is recomputed every 10 days;
  - at founding (1/10) the lakes hold 2,990 agents against a budget of 3,023, with perch and white perch ≥ 20.4 cm on their own (46 + 104 fish) — the true-scale calculation's ~20 cm.
- **The brook's food web BUILT** (HOT_BROOK_3D.md §4 "Built — the brook as a lake-outlet stream"): the dace hold through the year.
- **Next:** TRUE_SCALE.md T1–T8.

1. **The new species' biology** (a 3-D species table, so the 2-D sim is untouched; research in
   `fish_numbers_and_new_species.md` Q5–Q6):
   - redbreast on the bluegill FB4 set;
   - fallfish on the dace set below 10 cm and a pikeminnow-shaped set above;
   - banded killifish on California killifish;
   - blacknose dace on the *Phoxinus* dace set;
   - each with its length–weight, growth, maturity, fecundity, spawning temperature and grounds, diet, gape, thermal and O₂
     limits, habitat by day, night and winter, and its look in the view.
2. **The census above in `S3`:** golden shiner removed; the new species added; yellow perch, pumpkinseed, bullhead and sucker
   re-set.
3. **The agent rule:** school records for the young, shoals for killifish, individuals by species and size, and the budget's
   cutoff for adult perch and white perch, with members leaving their schools as they grow past it.
4. **Gate:**
   - each species within its census range after founding;
   - biomass within 60–120 kg/ha;
   - agents within the per-hectare budget;
   - each new species spawns and recruits;
   - the young reach real autumn sizes, on 3 seeds.

Then T1–T7 as planned, with these fish.
