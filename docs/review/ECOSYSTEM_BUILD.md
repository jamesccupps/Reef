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
| E1 | **The shore's substrate and wood** | bedrock/boulder/cobble/gravel/sand/mud/organic by place (fetch, slope, lidar, photos); fallen trees; leaf packs. Feeds small fish's crevice cover, crayfish shelter, bass nest sites, stony-shore fauna and periphyton | running → Maine lake shores and catchment/littoral_substrate_and_wood.md |
| E2 | **The small plankton and the microbial loop** | rotifers that vanish in summer, copepod nauplii, small cladocerans (Bosmina, Ceriodaphnia, chydorids), bacteria, flagellates and ciliates on DOC, Chaoborus. First-feeding larvae need them | **note saved (partial: Q5 new; Q1–4, Q6 from the repo; two strands pending)** → Real lake ecology for calibration/small_zooplankton_and_microbial_loop.md. Rotifers do NOT vanish in real summers (Adirondack 19.4 µg/L; 39.8 % of production, Mirror L.) — the sim's collapse is an artefact (algae-only diet, a higher threshold than Daphnia). Design: rotifer food Daphnia can't strip (bacteria/flagellates/detritus from the DOM decay and the weeds), rotifers kept in the weeds, M2_R routed to copepods, nauplii exposed as a seasonal share, a 4th pool of small cladocerans (Bosmina, Ceriodaphnia, Chydorus, Diaphanosoma), the fry's prey ladder by gape; targets: summer rotifers 10–25 µg/L, under ice 2–5, pumpkinseed larvae ≥ 0.2–0.4 mm/d through 7–12 mm |
| E3 | **The egg stage** | incubation by degree-days; egg predation, fungus, cold snaps, waves, stranding; nest guarding's effect | running → Whole lake 3D fish simulation/egg_stage.md |
| E4 | **Fish-eating wildlife** | loon, great blue heron, belted kingfisher, osprey, bald eagle, common and hooded mergansers, river otter, mink, raccoon (cormorant, bittern) | **done** — Maine lake shores and catchment/shore_birds_and_mammals.md |
| E5 | **Angling** | open-water and ice fishing: harvest and catch-and-release by species | Hot Brook populations and water/gemini_angling_alewife_checked.md (+ more if needed) |
| E6 | **Herps** | frogs and tadpoles, painted and snapping turtles, newts (the 2-D sim had frogs, tadpoles and turtles; the 3-D has none) | Maine lake shores and catchment/turtles_and_frogs.md |
| E7 | **Insect emergence and the brook's drift** | Hexagenia, chironomids, Chaoborus, odonates (the 2-D sim had dragonflies) | Hot Brook populations and water/invertebrates_plankton_plants.md §3 |
| E8 | **The streams and the alewife** | runs up and down the inlet and outlet, emigration, sea-run alewife, beaver dams | Fish in streams connecting lakes/*, Hot Brook populations and water/sea_run_alewife.md |
| E9 | **Weather — the human asked for it explicitly** | now: a 4-state chain (clear/cloudy/rain/storm) driving wind, cloud, mixing and ice, but the SAME seasonal temperature curve every year, no air temperature or heat budget, rain carries no water, no hydrograph/water level, no diel wind, no interannual variation. Build: air temperature and a surface heat budget, real Danforth-like weather sequences (spells, heat waves, cold springs), rain→inflow→water level, year types | Maine lake shores and catchment/weather_and_catchment_hydrology.md |
| E10 | **Winter** | snow and ice optics, the under-ice hydrograph, the young's winter feeding | (R6) |
| E11 | **Behaviour in the habitat** | predator habitat by size, the weed edge, ambush relocation, prey diel behaviour, bullhead day refuge, fish sensing bird risk | REALISM_PLAN R4 |
| E12 | **Everything else the inventory finds** | | |

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

**Built (CPU, uncommitted→committed 2026-10-21 evening):** fish3 WILD3/WILDK, _wildPrep/_wildV/_wildH/_wildTally, hazards on followed fish and the young, cause 'wild', stats.wild; counts scale with the world's area (true scale: loons 8.6, herons 6.7, kingfishers 34, ospreys 4, eagles 2, mergansers 10+4, otters 3.4, mink 13; ~20 kg fish/day all told in summer). OFF in stageR5 until the GPU mirrors it (needs: a reduction kernel for A_w, ρ_w, the hazard in k_hazards and y_mort, T_WILD/T_YWILD tallies past 3768, NCAUSE 8, year.js printing). A 20-day 1/10 test ran (mergansers and herons on young suckers and perch, ospreys on fallfish/bass/white perch, eagles on bullheads/suckers).

**The fish's side (E11).** Fish sense the risk through the fear input: the bigger-deeper rule (fish > 5–7 cm avoid < 20 cm of water by
day).
