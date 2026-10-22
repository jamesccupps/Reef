# The ecosystem build: everything the Hot Brook lakes have, before any more tuning

The human, 2026-10-21: "lets just add everything in that needs to be in the enviorment and make it as realistic as it can be, we are
trying to tune a simulation that doesnt even have everything" — and "any animals or plants or anything that isnt in there needs to be
in there too."

So this phase BUILDS. No more validation arms between small fixes and no parameter moved to make an outcome come out
(memory realism-over-compensation). Each component is built from field values, on both engines (fish3.js / the GPU's WGSL), with a gate
check. The multi-seed arms come back when the build is complete, and then they validate rather than steer.

## How each component is built

1. **Research.** A sourced note under docs/research_notes/. Values are tagged [primary] / [secondary] / [abstract] / [snippet] / [inf].
2. **Design.** The design goes here: the state, the processes, what it eats and what eats it, its calendar and diel rhythm, its
   habitat, and which old compensation it replaces.
3. **CPU (fish3 / env3 / chem3 / plants3 / littoral3),** behind a stageR5 flag with restore-on-off, plus a gate check (test/w3.mjs).
4. **GPU mirror** (wgsl.js / layout.js / gpufish.js), then g1_check ?r5=1 (and ?yf=0.75 for winter) all agreeing.
5. **Docs.** A FINDINGS entry when the component teaches something.

## The inventory

(Filled from two inventories now running: what the sim models — src/w3 and the 2-D sim — and every organism and process recorded for
Hot Brook and similar eastern Maine lakes, docs/research_notes/Hot Brook populations and water/full_biota_and_processes.md.)

Components known missing now, with research status:

| # | Component | What is missing | Research |
|---|---|---|---|
| E1 | **The shore's substrate and wood** | bedrock/boulder/cobble/gravel/sand/mud/organic by place (fetch, slope, lidar, photos); fallen trees; leaf packs. Feeds small fish's crevice cover, crayfish shelter, bass nest sites, stony-shore fauna and periphyton | running → Maine lake shores and catchment/littoral_substrate_and_wood.md — **E1a built (LIT3.SUB_MAP, in stageR5):** tools/hotbrook/build_substrate3.py → substrate3.js (both worlds): each cell's rock/gravel/sand/organic by its wave exposure (critical wave base 0.77·1.66·√fetch) and shore (wetland → muck, beach → sand, camp → +sand); hard bed 6–8 %, wave-worked 24 %, mud line ~1.8 m; the crayfish's stony shelter (7.7 % of the bed, was 21.8 % by depth) and the rock dwellers' cover from it (CPU + GPU); next: logs, bass nests by gravel, mussels by substrate, sediment focusing |
| E2 | **The small plankton and the microbial loop** — **E2a built (ZOO3.MICRO, in stageR5):** the rotifers' field rates (K. cochlearis rmax 0.28/d, zero growth 0.6 of Daphnia's), a microbial food pool grown from the DOM decomposed (BGE 0.26, loss 0.15/d), cleared by rotifers and Daphnia at 0.5 of algae, Daphnia's interference by its large share only, the rotifers' predators feeding the copepods; **E2b built (ZOO3.DAPH_LIM + RESALG):** the grazing-resistant algae and the invertebrate predators of young Daphnia; **E2c/E2d built (ZOO3.SMALL, in stageR5; CPU + GPU written, GPU parity pending):** a fourth pool chem3.zooS of small cladocerans (Bosmina, Ceriodaphnia, Chydorus, Diaphanosoma) on Daphnia's equations with a threshold 1.1× Daphnia's (DeMott 1982), Bosmina's development Q10 3.2, no cold window or heat cut, bacteria at 0.3 of algae, the weeds' periphyton, the copepods' toxin tolerance, the invertebrate predators of young Daphnia, no migration or egg bank, START 0.15 g/cell (~10 % of crustaceans, LakePulse); adults catch them at 0.2 of Daphnia (reaction distance ∝ prey length); the bladderworts' main prey; the copepod field's NAUPLII a seasonal share (34 % at ice-melt → 0.15 summer → 0.1 autumn); THE YOUNG'S LADDER by gape (rotifers and nauplii from first feeding; small cladocerans 0.3 → all by 9 mm; copepodites 0.1 → 0.35 over 8–15 mm; Daphnia 0.05 → all over 10–15 mm) and BY COUNT (Holling's multi-prey disc equation, X = Σ catch × density / K: rotifers K 5 µg/L, nauplii 20 — ~100 prey/L at 0.05 and 0.2 µg, Hart & Werner 1987, Margulies 1989 — crustaceans K_FRY); off reproduces the old ladder exactly (u = c/K_FRY) | rotifers that vanish in summer, copepod nauplii, small cladocerans (Bosmina, Ceriodaphnia, chydorids), bacteria, flagellates and ciliates on DOC, Chaoborus. First-feeding larvae need them | **note saved (partial: Q5 new; Q1–4, Q6 from the repo; two strands pending)** → Real lake ecology for calibration/small_zooplankton_and_microbial_loop.md. Rotifers do NOT vanish in real summers (Adirondack 19.4 µg/L; 39.8 % of production, Mirror L.) — the sim's collapse is an artefact (algae-only diet, a higher threshold than Daphnia). Design: rotifer food Daphnia can't strip (bacteria/flagellates/detritus from the DOM decay and the weeds), rotifers kept in the weeds, M2_R routed to copepods, nauplii exposed as a seasonal share, a 4th pool of small cladocerans (Bosmina, Ceriodaphnia, Chydorus, Diaphanosoma), the fry's prey ladder by gape; targets: summer rotifers 10–25 µg/L, under ice 2–5, pumpkinseed larvae ≥ 0.2–0.4 mm/d through 7–12 mm |
| E3 | **The egg stage** | incubation by degree-days; egg predation, fungus, cold snaps, waves, stranding; nest guarding's effect | **researched** → Whole lake 3D fish simulation/egg_stage.md: incubation equations per species (perch D50 = 97/(T − 4.9); white perch 686.99·e^(−0.1402T) h; smallmouth ≈ 32.2/(T − 9.6) d; pickerel ≈ 86.7·e^(−0.203T); sucker ≈ 200·e^(−0.232T)); smallmouth nests 45–86 % succeed, ~28 % of eggs to swim-up inside them, a fall to ~10 °C deserts every nest in ~2 days; unguarded nests emptied in minutes (sunfish); perch ribbons refused by fish; white perch eggs killed by 2–3 °C drops and > 1–2 mm silt. Design: an egg cohort between _spawn and _mkYoy (a development clock on the bed's temperature, a yolk-sac stage), hazards by cause, guarding a state |
| E4 | **Fish-eating wildlife** | loon, great blue heron, belted kingfisher, osprey, bald eagle, common and hooded mergansers, river otter, mink, raccoon (cormorant, bittern) | **done** — Maine lake shores and catchment/shore_birds_and_mammals.md |
| E5 | **Angling** | open-water and ice fishing: harvest and catch-and-release by species | Hot Brook populations and water/gemini_angling_alewife_checked.md (+ more if needed) |
| E6 | **Herps** | frogs and tadpoles, painted and snapping turtles, newts (the 2-D sim had frogs, tadpoles and turtles; the 3-D has none) | Maine lake shores and catchment/turtles_and_frogs.md — **E6a built (two WILD3 rows, so both engines; the GPU's wildlife tallies moved to hold 16):** the SNAPPING TURTLE (1 /ha [inf: northern 1.5, falling with the water's size], ~50 g/day while the water is above 16 °C — its own weight a year, Kiviat 1980 — fish 0.2 live [inf: a third of Michigan's stomachs, part scavenged], slow fish preferred (suckers, bullheads ×2; bass, pickerel ×0.5), on the bottom of beds ≤ 2–4 m, day and night: ~6.4 kg of fish a day on the true lakes, the second fish-eater after the loons) and the BULLFROG (10 a km of shore [inf], ~10 g/day, fish ~5 % [inf]: 0.14 kg a day). Next: E6b the turtles' plants, snails and carrion (painted 5–15 /ha; snappers' plant third); E6c tadpoles (green frog overwintering once, bullfrog ~2 years; periphyton grazers; bullfrog tadpoles unpalatable to fish) and frogs on the shore's insects; red-spotted newts (fish reject them). PENDING: the herps' share of the adults' unsimulated M (as E4's, by an arm) |
| E7 | **Insect emergence and the brook's drift** | Hexagenia, chironomids, Chaoborus, odonates (the 2-D sim had dragonflies) | Hot Brook populations and water/invertebrates_plankton_plants.md §3 |
| E8 | **The streams and the alewife** | runs up and down the inlet and outlet, emigration, sea-run alewife, beaver dams | Fish in streams connecting lakes/*, Hot Brook populations and water/sea_run_alewife.md |
| E9 | **Weather — the human asked for it explicitly** | now: a 4-state chain (clear/cloudy/rain/storm) driving wind, cloud, mixing and ice, but the SAME seasonal temperature curve every year, no air temperature or heat budget, rain carries no water, no hydrograph/water level, no diel wind, no interannual variation. Build: air temperature and a surface heat budget, real Danforth-like weather sequences (spells, heat waves, cold springs), rain→inflow→water level, year types | Maine lake shores and catchment/weather_and_catchment_hydrology.md — **E9a built (WEATHER3.AIR):** synoptic + seasonal air anomalies (OU; January SD ~6 °C, July ~3; τ 3 / 30 d) move the water's target and the ice; **E9b (WEATHER3.HYDRO):** rain and snow on Houlton's normals → snowpack (~225 mm at peak, gone ~19 April) → HBV soil/stores → the through-flow × Q/Q_REF (April 3.5–4×, runoff 56 %; its "summer too wet" was an artifact of the month-long sky — E9d); **E9c:** the brook's depth × (Q/Q_REF)^0.4 (fish feel it; CPU + GPU); **E9d (WEATHER3.SYN):** fronts — a clear → cloud → rain → storm → clearing chain fitted to Houlton's daily record (NOAA GHCN-D 1991–2020, houlton_daily_precipitation.md: wet 39 % of days, spells 2.0 / 3.1 days, 6.9 days ≥ 25 mm, monthly CV 0.44 — the inherited 2-D chain cycled every ~27 days), per-episode gamma(2) rain, the storms' warm air (winter wet days +4–5 °C), HBV refitted to the eastern Maine gauges (August 0.4–0.6×, January 0.6–0.7×, recession 0.85–0.87, runoff ~590 mm; KNOWN GAP December ~0.9× vs 1.1–1.4×). NEXT: **E9e the catchment's loads** — the inflow's P is 94 % dissolved phosphate (~13 of ~14 µg/L), where Maine streams carry ≤ 3 µg/L dissolved and the rest as particulate and organic P, 50–80 % of it in events (load ∝ Q^b, b > 1), the particles settling at the inlets with ~20–50 % bioavailable (needs: a research pass on PP bioavailability and inlet deposition, and TP_in of comparable Maine streams; then BURY_MUL re-fitted); lake-level routing of the outflow (storage damping) |
| E10 | **Winter** | snow and ice optics, the under-ice hydrograph, the young's winter feeding | (R6) — **E10a built (with HYDRO):** ice thickness by Stefan (α 2.7 → 1.3 under snow), the snow on it, slush → white ice, Donini's layered light (40 cm black 33 %, +10 cm snow 1.8 %; was a fixed 40 %), a thaw can't lift thick ice; a winter start under the season's ice (CPU + GPU uniform) |
| E11 | **Behaviour in the habitat** | predator habitat by size, the weed edge, ambush relocation, prey diel behaviour, bullhead day refuge, fish sensing bird risk | REALISM_PLAN R4 |
| E12 | **Everything else the inventory finds** | | **E12a built (plants, both engines read them):** the near-certain flora missing from the lakes (plant_species_hot_brook.md §2 Tier B) — water horsetail, bogbean, wiregrass sedge, broad-leaved arrowhead (EM, the wetland edges), narrow-leaved bur-reed and floating-leaf pondweed (FL), spiny-spored quillwort and needle spikerush (IS, the sand shelf; quillwort at its kin's light limit in the tea-coloured water) — on their forms' physiology with numbers scaled from the form ranges [inf], sharing their form's room; the moose's diet (horsetail 9.7 %, sedges 9.2 %, spikerush 5.8 %), the spawning structures. Tier C (grassy and spiral pondweed) left out: on inferred numbers they took the stands from 47 % to 51 % of the bed (research 20–30 %). Gate checks made exact: the invertebrates' bare bed is now bare (≤ 5 g DW/m²), the crayfish's map-stones measured by the stones' term |
| E13 | **Land mammals at the water (the human, 2026-10-21: "there are bears and deer")** — researched: birds_mammals_people_evidence.md §Bears, deer and moose (moose 17.4 kg wet aquatic plants a day, Belovsky & Jordan 1978; 108 of 124 summer days; stoneworts 58 %, pondweeds 15.5 %; six moose took 17 % of a pond's plant growth; dung on land, not in the water; bears ~0.4 /km², spring sucker runs) | **black bear:** takes spawning white suckers in the brook in spring and carries the remains (N, P) to land; **moose and deer:** wade the shallows in summer grazing water lilies, pondweeds and bur-reed (moose (gk): tens of kg wet a day, much of their summer diet), trample the bed, browse the shore shrubs (litter, shade); winter deer yards; carcasses through the ice | asked of the birds-and-mammals sub-search (2026-10-21) — **moose built (PL3.MOOSE, in stageR5):** 15 moose [inf] eat 868 g dry each a day from the shallows' plants (≤ 1.2–2 m; pondweeds, lilies, stoneworts preferred) June – mid-September, the N and P taken ashore (ledger outP/outN) |

## The real lakes' inventory (docs/research_notes/Hot Brook populations and water/full_biota_and_processes.md, 13 sections; (gk) = general knowledge, not yet sourced)
- **Matter here, usually omitted:** mussels as the dominant bed biomass (eastern elliptio likely; state-Threatened yellow lampmussel in Upper's SW, white perch its host); sea-run alewife (nutrient import, a summer prey pulse, their young strip the large zooplankton); the brook as its own ecosystem (filterers, moss, resident sunfish, big bass in the pool; a dry 2025 nearly cut the lakes apart); beaver (modified wetlands within 500 m of both lakes); the eagle nest on Kittery Island (Upper); soft-water calcium limits (few crayfish, small snails, Holopedium for Daphnia); Nitella meadows (the only plants ever collected there); snow on ice (winter light and O₂); land inputs (insects, leaves, pollen); people (bass released, white perch 25/day, ice fishing all year with live bait, camps on Upper's south shore, forestry, culverts, wind farms, the mercury advisory).
- **Probable or possible, to decide:** American eel (14 of 17 similar lakes; Baskahegan upstream), common shiner, creek chub; brook floater, black tern, wood turtle, vernal pools nearby; parasites (black spot, yellow grub, swimmer's itch via mergansers), bats and swallows on emergence (gk).
- **Questions for the human (field knowledge):** which crayfish you photographed; eels ever seen or caught; beaver dams on the brook; how dry the brook got; loons nesting; the eagle nest now; ice-fishing effort; alewives seen in Lower or the outlet.
- **Research gaps, ranked (its §12):** no water-quality data for either lake; mussel species and density; fish parasites and disease; algal genera and periphyton; site birds and bats; herps by town; dragonflies, sponges, bryozoans, leeches; eel presence; crayfish species; beaver and the rail crossing; groundwater and lake level; angling effort; the alewife run size.

## The sim's own inventory (agent, 2026-10-21) — the main absences
- **Animals:** no birds, mammals, frogs, tadpoles, turtles, odonate predators in 3-D (the 2-D had a loon, dragonflies, frogs, tadpoles, painted turtles); no alewife, eel; no microbial food web; no invertebrate predators (Chaoborus, Leptodora, Asplanchna, odonate nymphs); no stony-shore fauna or epiphyton as a state; no emergence from the mud (Hexagenia, chironomids); brook drift absent; fish carry no N/P (no excretion); no fish eat plants or algae.
- **Habitat:** no substrate map (rock = bed < 1.5 m; mineral/organic only), wood only a spawning index (not cover), no shoreline development, no shade on the brook.
- **Physics:** no ice thickness/snow/slush (ICE.LIGHT_CUT lets 40 % through, field 1–12 %), no late-winter convection, no hydrograph/water level/groundwater, no moon, colour not linked to DOM, one lake-wide turbidity, no current felt by fish.
- **People:** no angling or ice fishing, no emigration over the outlet, no immigration; the census cap and M_OTHER stand in.
- **Plants missing:** bur-reed, bogbean, water horsetail, P. gramineus, quillwort, little floating-heart, sedges, sweet gale.
- **Stand-in energy sets:** sucker, white perch, pumpkinseed, redbreast, killifish, fallfish, dace.

## E4 — the lakes' fish-eating wildlife (design)

The source for every number here is shore_birds_and_mammals.md.

**What it is.** Each wildlife species is a predator population with:
- a **calendar** (year-fraction presence, ice);
- a **number on the lakes** (densities × the lakes' 655 ha and shoreline);
- a **daily need** (g of food a bird or mammal);
- its **fish share** of the diet, the rest crayfish, frogs and insects;
- a **prey-size window**;
- a **habitat window** (bed depth and the fish's depth below the surface);
- a **diel rhythm**.

**How it feeds.** It takes its need from the prey it can reach, following a Holling type II response on the accessible biomass. Each
accessible fish's share is its mass × its vulnerability to that predator. Followed fish die by a hazard, and a young school loses n·(1 −
e^−h·dt).

| Species | On the lakes (yf) | Number | Need g/day | Fish share | Prey | Where | When |
|---|---|---|---|---|---|---|---|
| Common loon | 0.14–0.75 | 2–3 pairs (1 pair per 40–280 ha) + chicks from July | adult ~1,100; chick 160–380 | ~0.9 (leeches, insects) | 10–70 g fish (~10–18 cm), up to 300 g; "often yellow perch", streamlined fish | pursuit dives, the whole water column < 10 m | day |
| Great blue heron | 0.05–0.70 | 1–3 | ~300 | ~0.8 (frogs, crayfish) | ≤ 25 cm, mostly ≤ 20 | bed ≤ 0.5 m, mostly 15–25 cm; firm, clear water | dawn and dusk peaks, some night |
| Belted kingfisher | 0.12–0.70 | 1 per ~0.8 km of lakeshore, with sheltered bays | ~60–75 | ~0.7 (crayfish 12–21 %, frogs) | 4–14 cm, mostly < 10 | fish in the top 15 cm (max 60), water < 60 cm, clear, calm | day, best at dusk |
| Osprey | 0.10–0.52 | 1–2 pairs | adult 300–400; family 850–1,250 | 1.0 | 150–300 g (25–35 cm), 50–1,200 | fish within ~0.5–1 m of the surface | day |
| Bald eagle | all year | 1 pair (nesting on Upper, the human) | ~500 | ~0.8 inland | bullheads, suckers, pickerel (Maine interior remains); scavenges under ice | the surface; dead and dying fish | day |
| Common merganser | 0.14–0.75 | broods | 255–400 | ~0.9 | 10–13 cm preferred; girth limits | pursuit diving, shallow to mid water | day |
| Hooded merganser | 0.14–0.75 | 23–29 per 100 km² (beaver country) | ~150 [inf] | ~0.45 (crayfish 22 %, insects) | small fish | shallow ponds and edges | day |
| River otter | all year, roaming | ~1 per 1.6 km of good shore | 1,100–1,800 | summer ~0.15, winter ~0.6 (crayfish the rest) | slow fish: suckers, bullheads, minnows | the whole column; under ice | any time, dawn peak |
| Mink | all year | 1.5–3 per km of good shore | ~150–200 [inf] | winter/spring fish, summer crayfish | small fish | the shore's shallows | night |
| Raccoon | 0.05–0.75 | shoreline | — | small | crayfish, frogs, fish in a few cm of water | ≤ 0.15 m | night |

**What it replaces.** The adults' unsimulated M share (M_OTHER) is cut by the part these predators now take. The census cap then
retires as a regulator (R5).

**Built (CPU, uncommitted→committed 2026-10-21 evening):** fish3 WILD3/WILDK, _wildPrep/_wildV/_wildH/_wildTally, hazards on followed fish and the young, cause 'wild', stats.wild; counts scale with the world's area (true scale: loons 8.6, herons 6.7, kingfishers 34, ospreys 4, eagles 2, mergansers 10+4, otters 3.4, mink 13; ~20 kg fish/day all told in summer). **GPU mirror built (ccf7191):** k_wildA/y_wildA (the reach at the block's start, before k_pre), k_wildRho, the hazard in k_hazards and y_mort, cause 'wild' (NCAUSE 8), T_WILD/T_WILDG/T_YWILD, year.js's 'the period's wildlife take'; g1_check ?wild=1: ρ agrees to 4 digits (July: all nine; December: otter, mink). Gate checks (test/w3.mjs 'wild'). Still OFF in stageR5 until M_OTHER is cut by the share the wildlife now takes (BIOE.M_OTHER 0.5 explicitly stood in for "birds and mammals besides the loon"): arm AD (one GPU year, f3.WILD=1) measures it by species. A 20-day 1/10 test ran (mergansers and herons on young suckers and perch, ospreys on fallfish/bass/white perch, eagles on bullheads/suckers).

**The fish's side (E11).** Fish sense the risk through the fear input: the bigger-deeper rule (fish > 5–7 cm avoid < 20 cm of water by
day).

## E8 — the sea-run alewife (design, 2026-10-22)

Every value is from docs/research_notes/Hot Brook populations and water/sea_run_alewife.md (its "Implications for the sim") unless [inf].
MDIFW's 2024 chart lists sea-run alewife in Lower; they have reached Danforth naturally since 2017. No count exists for Hot Brook.

**What it is.** The 12th species, `alewife`, a seasonal visitor that both engines carry like the others. The GPU's tally map is
already laid out from the species' count (f5dad76).
- **Adults** are school agents of a few hundred fish, with brains, as the other schooling species.
  - **Size:** 26–32 cm, about 230 g.
  - **Energetics:** FB4 Stewart & Binkowski 1986, Thornton–Lessem consumption. The swimming terms are entered in the sim's FB4
    convention (VEL = ACT·W^RK4·e^(BACT·T) at or below RTL, RK1·W^RK4·e^(RK5·T) above it): ACT 5.78, BACT 0.149, RK1 22.08, RK5 0,
    RK4 −0.045, RTL 9. The note's table lists the two the other way round; read literally, alewives would swim ~1 m/s at 20 °C and
    respire more than they can eat.
  - **Heat:** UILT 23.5 °C.
- **Young** are young-of-year schools that never recruit.
  - **Energetics:** the juvenile set (CQ 5, CTO 24, CTM 26, CTL 29), with no swimming multiplier.
  - **Length–weight:** ln W = −4.72 + 2.96 ln L(cm). The < 43-mm curve, which is 3× lighter at 2 cm, is not used: the sim holds one
    length–weight curve per species.
  - **Gape:** no prey over 1 mm until 25–30 mm. Their zooplankton ladder is read at half their length (S3 `zooLadderK` 0.5 [inf]).

**The run (spring).**
- **Size:** RUN_PER_ACRE × the lakes' DEP acres (1,574). The default is 15 (≈ 23,600 adults); the presets are 6, 35, 120 and 235.
  Each year's run is drawn lognormally with CV 0.5 from the seeded RNG.
- **Timing:** arrivals start when Lower's surface reaches 10 °C (≈ May 12, plus a few days' travel) and stop at 20 °C (≈ June
  18–25), peaking at 13–16 °C.
- **Where they arrive:** as ripe school agents at Lower's outlet column (`env.outCol`).
  - Sex 55 % male; gonads ♀ 10 %, ♂ 5 % of mass.
  - L ~ N(28.5, 1.2) cm [inf from 26–32].
  - The schools split between the lakes by area (57 : 43 Upper : Lower). Upper's share crosses Lower and climbs the brook by the
    existing trip routes, gated by the brook's depth.

**Spawning (late May – June).**
- At night, in 0.15–1 m (to 3 m) over sand, gravel, plants or detritus, at 10.5–21 °C (best 13–16), using the existing ripe-fish
  ground choice with a 'shore' site.
- About 100,000 eggs a female (fec a 4.56, b 3).
- The eggs go through the egg stage (EGG3.sp.alewife: 'exp', D = 25.1·e^(−0.089·T) days; yolk 2–5 d).

**Leaving and dying (June – July).**
- **Residence after spawning:** lognormal with a median of 17 d (range 1–64, Lake George). A leaving school swims to the outlet and is
  removed there: the 'emigrated' tally, with its P and N export.
- **Freshwater mortality:** 50 % of the run (0.3–0.9; Love Lake 0.91) as a hazard over the residence, cause 'spent'. Carcasses go to the
  bed's organic layer.
- **Heat:** any adult still in the lake at ≥ 23.5 °C dies by the existing heat hazard.
- **Adult diet:** zooplankton, midges, and fish larvae ≤ ⅓ of their length — yellow perch larvae in May–June, by the existing LARV_A
  rule.

**The young (June – ice-on).**
- **Diet:** pelagic schools on the zooplankton (the ladder at half length; filter-feeding at night [inf: the type II at night with the
  same K]). Here they strip the large Daphnia from late June.
- **No recruitment:** S3 `noRecruit`.
- **Emigration:** a hazard from mid-July (yf ≥ 0.37) to ice-on.
  - The base daily rate rises with length (≥ 4 cm) and through autumn [inf].
  - It is multiplied ×5 [inf] on a pulse day: rain or a flow rise (env.qFac up by ≥ 30 % on the day), or the air cooling ≥ 2 °C, so that
    > 80 % leave in 2–3 pulses.
  - It is blocked when the outflow is near zero.
  - Emigrants are removed, tallied with their P export. (First cut: a removal hazard in either lake, without the swim to the outlet;
    the outlet-pool ambush comes later.)
- **Cold:** below 5 °C a cold mortality [inf: 0.2 /d]; any left at ice-on die.

**Nutrients (closed budgets).** Fish bodies are outside the sim's P/N budget, since grazing returns nutrients at once. So:
- the adults' import enters the ledger (inP, inN): excretion while resident (2.17 µg P and 24.7 µg N per g per hour, to the cell's phos
  and NH₄) and carcass P/N (0.42 % P, 2.49 % N of wet mass, to the bed: sedP and the water's NH₄);
- the emigrants' export (0.43 % P, ~2.5 % N [inf] of their wet mass) is debited from the lake's dissolved pools (ledger outP, outN).

**Who eats them.**
- **Adults:** eagles and ospreys (WILD3 prefs ×2 [inf], the outlet), snappers.
- **Young:** bass (< 30 cm), pickerel, white and yellow perch (the existing piscivory by gape), loons and mergansers.

**Checks.**
- The run's numbers and dates.
- Adults gone by late July.
- Zooplankton: zooD and the cladocerans' mean size fall from late June to October, then rebound from December.
- Emigrants per adult 2–50, in 2–3 pulses.
- Net P import positive at ≥ 15/acre.
- White perch switch to the young alewives in late summer.
- The young yellow perch's food squeezed (a possible cause of the human's "perch small and few").

**Staging.**
- **E8a CPU:** the species, the run, spawning, residence and exit, the young's emigration and cold death, nutrients, tallies, and a
  gate check behind ALEWIFE.ON in stageR5.
- **E8b GPU:** arrivals created by a kernel at the outlet (as recruitment creates agents), the exits and the young's emigration as
  hazards, the tallies; then g1_check.
- **E8c:** predators gathering at the outlet in pulses, the swim to the outlet, the size-structured exit.
