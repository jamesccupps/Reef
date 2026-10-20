# The review's plan: making every fish and the lakes behave as they really do

Written 2026-10-20. It merges five reviews of the true-scale 3-D Hot Brook lakes, each checked against the research notes and the human's field observations:
- [`predators.md`](predators.md): chain pickerel and smallmouth bass.
- [`perches.md`](perches.md): yellow perch and white perch.
- [`small_fish.md`](small_fish.md): pumpkinseed, redbreast, banded killifish, blacknose dace and fallfish.
- [`bottom_fish_and_young.md`](bottom_fish_and_young.md): white sucker, brown bullhead, and the young-of-year system of every species.
- [`environment_coverage.md`](environment_coverage.md): water, ice, weather, plankton, plants, invertebrates, other animals, people and land.

It also draws on two new notes:
- `docs/research_notes/Real lake ecology for calibration/white_perch_habitat_and_predation.md`;
- three Gemini reports the human supplied, being checked against their sources (`gemini_*_checked.md`).

The evidence is the GPU year runner on the true lakes (arm O = `stageR5` through item 6j + arm B's diets; seed 613, years 1–3), plus CPU probes. Each item gives:
- **Why:** the field evidence against what the sim does;
- **Check:** how we'll know it's fixed, on at least 3 seeds × 3 years;
- **Refs:** the review items behind it (P = predators.md, PE = perches.md, SF = small_fish.md, BY = bottom_fish_and_young.md, EN = environment_coverage.md).

## The diagnosis in one paragraph

The total biomass, the predator biomasses and adult growth are in range. **Who eats whom, where and when is wrong**, and that is why the small fish die out:
- **Prey switching:** pickerel and bass hardly meet white perch, which are 55–61 % of their food in Maine (Cooper 1941). They spend the day over 3.5–5.5 m while the predators hold the shore. So the predators eat what they do meet: killifish, fallfish, pumpkinseed, bullheads and spring recruits.
- **No refuges:** the small fish have no weed, rock or shallow-water refuge behaviour to protect them.
- **Mis-scaled appetite:** the predators' appetite is wrong at both ends:
  - a fixed 1 %BW hunger gate starves bass under 20 cm;
  - strikes ignore the cold, so bass kill suckers at 4 °C in April.
- **First winter:** the young of every species die of under-ice hypoxia (8–25 % a fortnight) because they sit on the organic beds that go anoxic first. Hot Brook is not a winterkill lake.
- **Census cap:** with the real mechanisms missing, the cap does the regulating. It discards 55–64 % of white perch and pumpkinseed recruits.

## Progress (2026-10-20 evening)
All in `stageR5` (not yet the default), CPU and GPU, each behind its own F3 flag or S3 value; GPU parity checked (g1_check ?r5=1).
- **Done in code, being tested (arm Q, seed 613, two true-scale years):** items 1, 2 (probe: the young grew under the ice), 4, 5, 6, 7,
  8 (bands, habJ, shore; not yet the autumn and early-ice bands or white perch's own diel feeding), 9 (yellow perch by day; not
  yet the juveniles' shore term), 10 (the bass's school term; white perch's dilution not yet), 11, 12 (spines, success; not yet the
  bullheads' day cover), 13, 14 (pickerel and sucker habJ, small bass's cold shelter), 15, 17, 19, 23 (sucker and bullhead young's
  water, the bullhead spawning window).
- **Done in code since arm Q's snapshot:** 24 (diets), 26 (the sunfishes' and fallfish's energy stand-ins), 28 (brook's
  sunfish share), 31 (settle rates), and the young's O₂ cushion made absolute (mg/L) and cold-water only.
- **Pending:**
  - 3: KD_COLOUR 0.4 with rebuilt plant starts (the weeds check ranges updated);
  - 16: birds — redistributing M_OTHER also lowers the large deep fish's background mortality, so it needs a per-species
    normalisation or a smaller share;
  - 18, 20, 21, 22 (the esocid size window, size-scaled M), 25, 27, 29, and phases 6–9;
  - bullhead growth: research running (bullhead_growth_and_young_white_perch.md).

## Order of work

Each phase is one or more slices, gated and pushed. Phases 1–5 are stage R's continuation. Phase 6 validates them. Phases 7–9 build what's missing.

### Phase 0: measure first, and the one cheap baseline fix
1. **Tallies in the GPU year runner (and CPU probes).** Without these, none of the fixes below can be judged.
   - Length at age by cohort, for every species.
   - Depth and cover at death for pumpkinseed, redbreast and fallfish.
   - Young eaten, by predator kind.
   - The six-week loss after recruitment.
   - First-winter loss by cause.
   - Brook occupancy by species.
   - Kills by light (day, twilight, night).
   - Starvation deaths by size.
   - Distance from shore by size.
   - Refs: P15, PE6, SF18, BY checks.
2. **Probe: do the young really grow under the ice?** Track each school's length from September to April on the CPU, to separate growth from selection. White perch go 6 → 8.8 cm, yellow perch 7.5 → 10.2 and fallfish 7.0 → 8.8. If it is real growth, the young's growth stops below about 10 °C.
   - Refs: PE1a, SF11.
3. **Water clarity:** `KD_COLOUR` 0.5 → about 0.35. Secchi is 2.9–3.4 m; the field is 3.5–4.5, and the human says the water is clearer than the sim. Then regenerate `plants3init`, since the depth limits deepen.
   - Do this first, because it changes every fish's sighting distance.
   - Refs: EN9.

### Phase 1: appetite in proportion to size and temperature (fixes to stage R's own recent rules)
4. **The hunger gate scales with Cmax.** It is G0 = g0·Cmax(W,T)·1 day, g0 ≈ 0.2–0.25, in place of the fixed 1 %BW.
   - **Why:** a 15-cm bass can reach p 0.20–0.27 but needs 0.48–0.60 to hold weight.
   - **Check:** the cap is ≥ 1.5× maintenance from 9 to 40 cm; 26–36-cm bass hold p 0.3–0.36. Ask whether pickerel need it too: they made 192k kills in a year.
   - Refs: P1, SF1.
5. **Small-bass bioenergetics:** `juvW` 30 → about 150–250 g, or blend the Rice and Whitledge respiration over 30–250 g.
   - **Check:** 11 → 17 → 22 → 26 → 30 cm is reachable on one plausible p schedule.
   - Refs: P2.
6. **Cold appetite for every strike.** `_strike2`'s perf becomes min(perf, consumptionT) for all prey, CPU and GPU, extending 6k from the young to the agents.
   - Also: adult bass's winter feeding switch below about 10 °C, and autumn storage (Sep–Oct p 0.6–0.8).
   - **Why:**
     - bass near-still below 8–10 °C (Oliver 1977; MDIFW);
     - 83 % of adult killifish die Oct–Mar;
     - 62–126 % of recruits die in the 8 weeks around recruitment;
     - adult bass p is inverted (0.12–0.25 in summer, 0.45–0.73 under ice).
   - Refs: BY3a, SF5, P9, P3.
7. **Recruitment when the water warms:** `FRY.SPRING_YF` → the spring crossing of `winterWindow` (or ≥ WINTER0.T per school), not 30 March under the ice.
   - Refs: BY3b, SF3.

### Phase 2: the predators meet their real prey
8. **White perch time-of-day water**, from `white_perch_habitat_and_predation.md`.
   - **The bands:**
     - adults on 2.5–5.5 m of bottom by day (coloured water lifts the clear-lake band);
     - young 0.5–2.5 m;
     - everyone on the 0.5–1.5-m flats at night;
     - a **dusk and dawn pass along the 1–3.5-m weed edge**;
     - autumn and early-ice weed-edge bands;
     - Lower's bands relative to Lower's depth (3.9 m max).
   - Also: white perch feed at twilight and night (their own PRED3 activity row).
   - **Check:** white perch ≥ 30 % of pickerel and bass fish prey by mass; the eaten white perch mostly 7–10 cm; 0.15–0.6 white perch per adult pickerel a day in summer.
   - Refs: PE3, PE7, PE12, P7, SF1.
9. **Juvenile yellow perch get a littoral shore term.** Their median is 150–180 m offshore today. Also: yellow perch feed by day only, with no fish at night.
   - Refs: P7, PE12.
10. **School terms:** the bass's per-fish school exponent n^−0.8 → n^−0.6. White perch protection becomes dilution, not ×0.15 confusion (Morgan & Godin).
    - Refs: PE3, PE19.
11. **A prey-size preference in the strike rule.** Optimal prey is about 25–43 % of predator length (Wahl & Stein 1988). Today a 42-cm pickerel crops 6-cm killifish because the capture term favours the smallest prey. Esocid young get their own fish-size window (peak 0.3–0.4 of length).
    - Refs: SF12, P3.
12. **Bullhead spines and day cover.** Gape tested against body depth × 1.6; CS3 bass 0.2 → 0.05; a day-rest cover.
    - **Why:** bullheads are the bass's top kill by count (18 %); the field has about 0.
    - **Check:** bass take about 0 bullheads; pickerel take 3–10 % of fish mass.
    - Refs: BY4, P7.

### Phase 3: the refuges that let small fish persist
13. **A cover drive for the sunfishes.** Pumpkinseed choose weed stands; redbreast choose rock and wood. Fish ≤ 8 cm stay inside cover; larger fish forage at the weed edge. Cover protects deep-bodied prey more than minnows.
    - **Check:** ≥ 60 % of pumpkinseed daytime blocks at cover ≥ 0.3; adult sunfish predation ≤ 20–30 %/yr.
    - Refs: SF2.
14. **Juvenile habitats.**
    - Pickerel `habJ` in the weeds, with stem cover against cannibals.
    - Small bass: cold shelter near a hard bed below 10 °C.
    - Fallfish under 12–15 cm: ≤ 0.5 m over gravel near the mouths and in the brook.
    - Yearlings stay under the young's rule until a size (sunfish about 7 cm).
    - **Check:**
      - pickerel cannibalism ≤ 10–30 % of age-1 deaths;
      - age-1 bass survival 0.5–0.6 a year;
      - age-1 pumpkinseed spring → autumn survival ≥ 40–60 %.
    - Refs: P4, P5, SF3.
15. **Killifish: the strip, for life.**
    - The young's day nursery: `yBed` 1.2 → about 0.5 m.
    - Spawning stays inside the ≤ 0.5-m strip with plants.
    - Re-check `FRY.LARVA_L` and adult cannibalism.
    - **Check:** egg → age 1 ≥ 0.2 %; age-0 25–32 mm by late September; June–July adult loss ≤ 8 %/fortnight.
    - Refs: SF4, SF5.
16. **Birds and mammals as a hazard field, taken out of `M_OTHER`.** By water depth × fish length × light × season:
    - kingfisher: ≤ 10 cm fish in < 60 cm of water;
    - heron: 5–25 cm fish in ≤ 50 cm, dawn and dusk;
    - mergansers;
    - loon: 10–70 g fish in open water;
    - osprey: 25–35 cm fish near the surface;
    - **bald eagle** (the human sees them on Upper; a nest on Kittery Island in Upper is reported, from a search excerpt only): bullheads, suckers, pickerel, white perch, spawning fish in the brook;
    - otter.

    The fish read it as a habitat cost. Each species' total M is unchanged.
    - **Why:** today the shallows are safe from above, so a refuge built in items 13–15 would be too safe (Power 1987).
    - Refs: EN5, SF13.

### Phase 4: the first year and the first winter
17. **The young's winter station.**
    - In cold water, choose by O₂ (≥ 2× o2Crit) before food.
    - Test and move before the hypoxia hazard is charged.
    - Apply the O₂ test in the zooplankton fallback too.
    - Bury young bullheads.
    - At true scale, spread a merged school's O₂ draw over its footprint.
    - **Check:** young hypoxia deaths ≈ 0 in a normal winter; first-winter survival 30–70 % (bullhead and sucker highest).
    - Refs: BY1, PE1b, P8, SF10.
18. **Snow on the ice, ice optics and the winter O₂ budget.**
    - Snow from the weather; ice thickness by Stefan's law (40–80 cm by March).
    - Layered light transmission: 1–12 % under snow, about 30 % after a thaw.
    - Late-winter convection; the bed's O₂ demand falling through winter.
    - **Why:** ice passes 40 % of light today, so winter algae beat summer's and the O₂ budget leans on it.
    - **Field:** East Grand Lake ice-out about Apr 12–21 (2021–26, from search excerpts); ice 8–10 in by 1 January.
    - **Check:** under-ice algae about 40 % of summer; no winterkill in a 3-m basin; no supersaturation at ice-out.
    - Refs: EN1.
19. **The young's unsimulated mortality is cold-scaled**, with its Lorenzen size multiplier capped at 3. Today it alone kills 20–35 % of the young over winter.
    - Refs: BY2.
20. **Size-dependent first-winter loss for white perch:** Johnson & Evans 1990/1991. The young stay active under ice, so mortality is about 11 % at 4 °C against about 71 % at 2.5 °C over 150 days (Johnson & Evans 1991, confirmed). In Oneida Lake their winter loss rose with predator biomass and their own numbers, not winter severity (Fitzgerald et al. 2006, confirmed).
    - Refs: PE1c.
21. **An egg stage (incubation) for every species.** Today larvae feed on the day of spawning.
    - Perch 8–27 days; white perch 4–5 days at 15 °C; pickerel and bass 2–3 weeks to swim-up.
    - Bass nest failure by the 15-day minimum temperature gives year-class variation.
    - Refs: P12, PE11, BY8.
22. **Pickerel's first year.**
    - Young in the weeds with the weeds' insect food (`yCover`); the esocid size window from item 11; size-scaled juvenile M.
    - **Targets:** 25–40 / 55–75 / 80–105 / 100–130 mm at the end of June / July / August / September; about 4–8k recruits a year. Today there are 2.
    - Refs: P3, BY9.
23. **The young bottom fish's water:**
    - sucker young in about 0.8 m of water (to 5 cm); bullhead young about 1.5 m;
    - fix what empties their food in August (summer starvation should be rare);
    - the bullhead spawning window [18, 24] °C, with a spawning end;
    - age-1 suckers get a juvenile band (habJ) in the shallows: on the CPU they sat over ~3 m among the perches, and 99 % were gone by June.
    - Refs: BY3, BY5–7.

### Phase 5: diets, energetics, the brook
24. **Commit the arm-B diets into the code.** Today they exist only as URL overrides; they must be in the code before `stageR5` becomes the default.
    - White perch: `Lzoo` about 10–12, with adults on zooplankton only when Daphnia are dense.
    - Yellow perch: `Lzoo` 25 → 15–18.
    - Killifish adults keep cladocerans.
    - White perch young eat from the bed from 4 cm.
    - Refs: PE4, PE8, PE9, SF9, SF17.
25. **Insects for adult bass, and crayfish in check.**
    - The weed edge's large insects and the surface insects become real food for bass ≥ 15 cm: 25–40 % of the diet at ≥ 30 cm, 50–70 % at 15–25 cm.
    - Crayfish ≤ 10–15 % when fish are scarce.
    - Fallfish feed at the surface: about 30 % surface insects.
    - Refs: P6, P10, SF14.
26. **Energy stand-ins:**
    - pumpkinseed and redbreast respiration × 0.7 (Roberts 1964);
    - fallfish take pikeminnow's own waste fractions.

    This lowers maintenance from p ~0.40 to ~0.28.
    - **Bullheads barely grow** (+0.04–0.25 cm a season; on the sim's FB4 set and the Maine calendar a 15-cm fish gains at most 2.3 cm a year even at p 0.7), so recruits never mature, spawnings fall 12.5k → 4.2k a year and biomass 10.4 → 3.0 kg/ha. Check the bullhead set against Maine and New England length at age, and use a better-founded set or a cold-water correction.
    - Refs: SF7, BY (bullhead growth).
27. **Gonads grow in autumn and winter**, not right after spawning. Refs: PE10.
28. **The brook.**
    - Brook-summering sunfish capped by pool area: about 60–150 instead of about 3,200. Ask the human.
    - Spawning fallfish don't hunt in the riffle cores.
    - The dace's food and activity cost.
    - White perch spawning runs.
    - Pickerel and bass summer trips.
    - Refs: SF6, PE13, P14.
29. **Zooplankton's seasonal shape:**
    - June peak 50–300 µg/L, not 300–550;
    - Daphnia ≤ 25 %;
    - rotifers about ¼–⅓ of crustaceans in summer;
    - a modest autumn recovery.

    The late-summer famine (p 0.17–0.29 in Aug–Oct) starves the small fish.
    - Refs: EN6, SF9.

### Phase 6: validate and make it the default
30. **Validate:** 3 seeds × 5 years on the GPU with every tally from Phase 0.
    - **Targets:**
      - total 50–120 kg/ha; pickerel 4–8; white perch 15–35;
      - every listed species present with home-bred recruits;
      - **the census cap never binding**;
      - predator diets in Cooper's proportions.
    - Then `stageR5` becomes the default, and the full gate (`npm test`) runs.
31. **Lake-to-lake settling** at the field's 1–5 %/yr, not 5–15 %. Count crossings by size. Refs: EN8.

### Phase 7: the water's year
32. **A weather generator:**
    - fronts every 3–5 days; rain 1–2 days; thunderstorm gusts;
    - wind decoupled from cloud, with a diel cycle;
    - Caribou and Houlton monthly means.

    Refs: EN2.
33. **Year types:** an ice-out shift (SD about 9 days), a summer-warmth offset of ±1–2 °C with heat waves, and the autumn-cooling date. Saved for exact resume.
    - **Why:** Maine bass year-classes are set by summer warmth.
    - Refs: EN3.
34. **A hydrograph, lake levels and the brook's depth:**
    - April about 3.3× the mean flow, August about 0.3×;
    - a rating curve per lake;
    - riffles close at 10–15 cm in a dry August; isolated pools heat and lose O₂.

    The survey sheet says boats are walked through the ⅛-mile brook in low water.
    - Refs: EN4.

### Phase 8: what's missing from the lakes
35. **Sea-run alewife** (stage A; designed). Run presets 0 / 6 / 15 / 35 / 120 / 235 per acre.
    - **New:**
      - Hot Brook enters Baskahegan Stream about 7 km below the Danforth dam, so alewives never needed its 2024 fishway;
      - Maine DMR's 235 per acre is total production (a fishery threshold), not an escapement; a report also gives a 35-per-acre escapement target (to check).
    - Refs: EN7.
36. **Mussels by species and host.** Yellow lampmussel (state threatened) is mapped in Upper (state GIS); brook floater (threatened) in Baskahegan Stream at Bancroft, near Hot Brook's mouth; the human sees lots of mussels. Gemini's alewife floater and Route 169 elliptio records did not check out. Each species' recruitment is tied to its host fish. Refs: EN13.
37. **Angling:**
    - a harvest hazard by species, legal size and season (white perch bag 25);
    - bass catch-and-release mortality;
    - ice fishing;
    - effort where the human fishes.
    - Refs: EN10.
38. **Frogs and turtles in 3-D; predatory dragonfly nymphs; the streams as spawning water; shore wood and rock as cover; the leaf band near shore; *Hexagenia* and midge emergence.** Refs: EN11, EN12, EN14, EN16–18.
39. **Bird and mammal agents in the view** (the eagle first), on the hazard field from item 16. Refs: EN5 step 2.

### Phase 9: what-ifs and completeness
40. Warming and browning knobs, eel, beaver, *Chaoborus*, moon phase, camps and docks, invasive milfoil. Refs: EN P3.

## Corrections and additions from checking the Gemini reports
- Checked in `docs/research_notes/Hot Brook populations and water/gemini_hot_brook_checked.md` and `docs/research_notes/Real lake ecology for calibration/gemini_white_perch_checked.md`.
- **Coexistence evidence:** Lake Jesse, Nova Scotia (6.6 m, unstratified; Smith 1939, open) held about 550 killifish/ha alongside 316 white perch/ha and 780 yellow perch/ha. Use it as a target for items 13–16.
- **White perch spawning temperature:** AuClair's Maine account gives about 15.6 °C against the notes' 18–21 °C. Settle it before item 21.
- **The inflow:** Hot Brook enters Upper on its south shore; the stream drains about 55 % of Upper's catchment and brings about 0.74 m³/s. Route 169 crosses it about 2.5 km upstream.
- **Unreliable:** Gemini's telemetry citation (the authors are McCauley et al. 2014, in a tidal river), Coleback Lake's 47–50 kg/ha (eels alone), and its 'Schoenebeck 160 mm'.

## Questions for the human (field knowledge only)
1. How many sunfish do you see in the brook's pools on a summer day: dozens, or hundreds?
2. Where do you see redbreast: in the brook, at the brook ends, along rocky shores?
3. Winter: how much snow is usually on the ice, is there slush, how thick is the ice in February? Have you ever seen dead fish at ice-out?
4. Birds: loons (how many pairs?), kingfishers, herons, mergansers, ospreys?
5. Frogs and turtles: which ones?
6. People: boats on a summer day, ice shacks in winter, and what gets kept (white perch, pickerel, perch)?
7. The brook in a dry August: can you still float a canoe through, or do you walk it? Any beaver dams?
