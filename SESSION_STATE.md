# SESSION_STATE.md — Synapse Reef

Living handoff log. The **NOW** block is the current state, so keep it accurate. The full history is in
`docs/archive/SESSION_LOG_2026-06.md`. Leave the sim runnable and the gate green.

---

▶▶▶ IN PROGRESS (2026-10-15): ZOOPLANKTON FIELDS → WHOLE FOOD-WEB RECALIBRATION, branch `zoo-field` (not merged; science = main
= bc2ddc8 has docs/ECOLOGY_RESEARCH.md + docs/research_notes/). HUMAN DIRECTION (mid-slice): "just make it how it actually is in
the real environment, at least in New England, the ponds and lakes seem to be sustaining" → the target is a SELF-SUSTAINING lake
on real numbers; also: winter zooplankton are resting eggs (done: egg bank); sunfish pool in warm stream pools between lakes in
summer (Upper/Lower Hot Brook Lake, Maine) → research item added to ROADMAP's landscape step.
BUILT (see config PLANKTON comments): zooplankton = env.zooD/zooC g wet per cell (1 g/cell ≈ 40 µg dry/L; WORLD.PX_PER_M 79,
SLICE_M2 700); growth G_D 0.6 / G_C 0.3 × Q10 (3.0/2.7) × Holling (K_D 0.15 < K_C 0.2: Daphnia win on food), losses × Q10_L 2;
Daphnia warmth ramp + heat fall-off; type-II grazing returning N+P; anoxia; DAILY ROUND (oxic column, weighted by algae + FOOD0;
MIX) + HMIX horizontal mixing; DVM as a daily-mean exposure (TWILIGHT, DVM cost; the diel clock is cosmetic — never tie
physiology to it); RESTING-EGG BANK env.zooEgg (autumn dormancy, spring hatch); env.zooFeed: adults TYPE III (prey switching,
K_ADULT 60, `sig`), fry type II (K_FRY 30; FRY_DAPH_MIN 0.3; FRY_COPE 0.5); COPE_ESCAPE 0.5; larval Cmax × FRY.CMAX_LARVA 1.5;
FRY.M_LARVA 0.02 → 0.08 (field larval Z, mostly unsimulated predators); founders cut (sunfish start 16, perch 7, catfish 2.5,
carp 0.45: 513 → 376 kg/ha); render specks; UI µg/L + kg + eggs; save v30. Diagnostics (scratchpad verify/): zooflux2.mjs
(half-monthly zoo budget + fish census), energy.mjs (whole-lake audit: productions, agents' diet by food, fry's zoo),
fryfate.mjs, fryprobe.mjs, sunprobe.mjs, biomass.mjs. env.zooProd and world._larvaProd are DIAGNOSTIC tallies (never read).
FINDINGS: the OLD model fed the fish ~10–13 kg/month of zooplankton in summer and 3–5 under the ice (≈75 % of their diet) —
an unlimited subsidy that hid a BENTHOS DEFICIT (larvae production ~35 g/m²/yr vs Quinte zoobenthos ~125; sim lacks
oligochaetes/amphipods; deep bed anoxic all summer, no profundal chironomids). New model, year 1: zoo production 96–127
g/m²/yr ✓, adults' diet ~50 % benthic ✓, but fry (2–4× too many, ~1 % eaten — real larvae die mostly to predators) ate 8–10
kg/month Jun–Jul, stripped the zooplankton by August → adults starved over winter (sunfish 100 → 3). Rounds 9–14 (verify/zf2_r*, en_r*, dietsp_r*): M_LARVA 0.08; benthic production up (SEDOM.PERI_G 110 → 180, INSECT.YIELD
0.15 → 0.25); minnow founders 45 → 20; NEW BENTHOS pool (the bed's worms and scuds, env.benth per column, Quinte oligochaetes +
amphipods; fish feed within BENTHOS.REACH of the bed; save v30; 4 gate checks); K_ADULT back to 25 (type III); founders sunfish
12, perch 5; zoo upkeep R_D 0.12 / R_C 0.06 (food thresholds ≈ Boersma & Kreutzer; verify/zooonly.mjs — a zooplankton-only harness
with prescribed predation, a year a minute — gives a realistic year: summer 50–170 µg/L, July clear water, Nov pulse, winter
12–17 µg/L of copepods, Daphnia ~0); FRY_COPE 0.3; APEX DENSITY (research priority 5): pike 1 founder (K≈2), bass 3 (K≈4), carp 2,
trout 2 (the founders test now accepts one ripe female for a single-founder visitor). Per-species audit (dietsp.mjs) showed
sunfish eat 2–3.6 %bw/day (≈ break-even), but 2 pike + 5 bass ate ~0.5 kg of small fish a month, and 2.6 kg of trout ate 3 kg
of June zooplankton. Round 14 running. Still open: copepods eaten out in summer; bass condition/spawning (next slice).
LESSONS: memory research-to-design;
diagnostic wrappers must forward ALL arguments (a dropped arg silently disabled type III in one round).

▶▶▶ HUMAN (2026-10-14 evening, before compaction): "we need compact first and maybe you should do some more research on how the
ecosystem and bass and zooplankton and everything work in a real environment, after we compact though". → RESUME HERE: a
thorough RESEARCH pass (literature, real numbers) BEFORE more code: zooplankton dynamics (standing stock mg/L, P/B by
temperature, Daphnia vs copepods, diel vertical migration and other refuges, the clear-water phase, fish predation's real
share of production), fish–zooplankton coupling (planktivore consumption rates and field p values, larval/YOY fish food
needs and survival, critical period, density dependence), largemouth bass life history (spawning timing/temperature and
condition, nest guarding, fry balls, YOY diet shifts zoo → insects → fish, first-summer growth and survival, adult diet and
consumption in bluegill lakes), and whole-lake energy flow (fish biomass kg/ha, production, trophic transfer). Write the
findings up (a research doc, e.g. docs/ECOLOGY_RESEARCH.md) with sources, compare to the sim's numbers, THEN plan the
zooplankton/apex slice. (Parallel research agents are fine — usage limit lifted.)

## ▶ NOW (2026-10-14 evening) — state: main = science = 13be2b9 (+ this note); gate green; backup G:synapse-reef-backupssynapse-reef_20261014_1626_snails-limnetic.zip
Phase 1 is done as far as it goes without the ZOOPLANKTON slice (below). Next per the human's plan: (2) the GUI / graphics /
webpage information / graphs review — unless the human prefers to do the zooplankton slice first.
ZOOPLANKTON (parked on branch `zoo-growth-wip`, pushed, NOT merged): the current model refills swarms at full size up to the
cap at a rate ∝ algae (production ~10–17 kg/month in summer; fish eat 10–13, fry 2–5 — verify/zooflux.mjs, zf_base_s*.txt),
i.e. production does not follow zooplankton biomass. A growth model (swarms grow 0.4/day Daphnia, 0.15 copepods at 20 °C ×
Q10 2.5 × Holling on edible algae, invertebrate loss, starvation, splitting, resting-egg hatch, grazing per gram) collapsed
the standing stock to ~0.5–1.2 kg and production to 1–5 kg/month (fish lose ~2/3 of their zooplankton); swarm refuges (fish
0.6 g, fry 0.1 g) made it worse (fry keep every swarm tiny, fish get ~nothing). Real lakes hold 1.5–3 mg/L (~5–15 kg here)
with P/B 0.1–0.4/day. A proper slice needs: a higher standing stock (more grams per swarm / a 2-D density field), a refuge
that works for fish AND fry (DVM by depth/light, not per-swarm grams), and re-calibrating the planktivores (sunfish p 0.6–0.9
now vs field 0.3–0.5). It is the root of bass recruitment failure (fry starve) — see the APEX CHAIN note below.

## ▶ NOW (2026-10-14, session 6) — THE BED'S ORGANIC LAYER (216237a, merged) + VISIBLE EVOLUTION (merged, save v29)
Plan order (human, 2026-10-14; also in ROADMAP "Agreed plan"): (1) implement + accurate (this; then pike yr-2, perch
growth; then VISIBLE EVOLUTION), (2) GUI/graphics/info/graphs review, (3) multi-lake + streams/rivers/ponds WITH a water
budget/level, rain lenses, inflow plunging, sediment erosion/transport/deposition, drift (human notes 2026-10-14), (4) what-if.
Done this session:
- Far-zoom wildlife silhouettes (render.js `_drawWildlife`): turtles were rectangles at lake view (human report) → domed
  shell + head; frogs/tadpoles/nymphs ellipses. Verified by drawing them large into a debug canvas.
- SEDOM (save v28): `env.sedOM` g/column; in = SINK 0.25 × algal decay (all three algae, per column `_colDecay`) × PP_G 60
  + benthic algae PERI_G 110 × bed light × Q10 + plant litter (PLANT.LITTER_G 6 g/px shed) + expired particles; out =
  decomposition (0.144/d @20 °C, Q10 1.94, ×0.3 anoxic), larvae, sifting fish (SEDOM.SIFT). Carbon only (N/P untouched).
  Calibration (verify/somflux.mjs, somflux2.mjs, peri.mjs): baseline larvae were refilled at ~9,600 full patches/month and
  fish ate ~9.5 kg/month of them (~150 g/m²/yr — top of the real range, and blind to productivity); algae dying ≈ 24k
  field units/yr; plants shed ~40k px/yr (spring-heavy churn); shallow columns' bed light×Q10 ≈ 45 s-equivalents/yr.
- Larvae: grow on the column's layer (GROW, K_SOM 150, YIELD 0.15, RESP), real development (26 d @20 °C, local water
  temperature), anoxic die-off, new patches small (LARVA_M0 0.3), emerging adults keep 0.6 of the mass; REFUGE_M 1.0 g per
  patch out of reach of fish/fry/nymphs/turtles (`larvaFree`, `_biteLarva`; nymphs/turtles now bite, not kill a patch).
  Tuning trail: refuge 0.3 → fish held every patch on its floor (production ~15 g/m²/yr); no benthic algae → the shallows'
  layer was eaten out by July; GROW 0.2 → patches only tripled before emerging, fish got 0.1–0.3 kg/month above the refuge.
- Env panel: "bed detritus" (kg). Gate: 6 new checks (decay/settling, benthic algae, larval growth/starvation, sifting,
  save v28) + the dev-with-warmth and dt-independence checks updated.
VALIDATION round 4 (GROW 0.3; verify/sf4_s*, so4_s*): benthos steady (larvae ~3 kg/month produced in summer, fish
1–2.3 kg/month direct + the hatch) BUT by 2.2 yr fish biomass 12–13 kg (baseline c5 15–23), perch 6–12 fish (14–46),
bullhead and carp at the immigrant floor (b 0–1): bullheads slowly STARVED on the bed's poor detritus (23 → 3; K 0.73–0.83).
Their sim diets were narrower than real (Scott & Crossman 1973: bullheads — larvae, molluscs, crustaceans incl.
cladocerans, crayfish, fish, weed; carp — larvae, molluscs, zooplankton, weed). → ROUND 5: catfish diet + snail +
plankton, carp + plankton; also ANOX_DEATH 0.05/day @20 °C × Q10 2 (cold anoxia slow): carp home-bred again, perch
5–9 (adult starvation 16–26 vs baseline 6–10). ROUND 6 (YIELD 0.2): no clear gain → kept 0.15. ROUND 7 (FINAL): larvae
settle only on an oxic bed + LARVA_CAP 240 → 400 (the count had sat ON the cap all summer): at 2.2 yr fish 12–17 kg,
perch 10–25 (b 19–48), carp 3–6 home-bred, sunfish 169–260, minnows 75–300, bullheads 3–4 (b 0–1), bass/pike immigrant.
Gate GREEN standalone (gate27: all checks, smoke, UI, serve; perf 87 st/s) after moving the dev-with-warmth test larva to an
oxic shallow bed (on the deep bed it could die in anoxia — RNG-fragile).
OPEN (next accuracy items): bullhead recruitment (0–1 home-bred in 2 yr: a clutch is right — ~2,500–3,900 eggs × sHatch
0.6 — but ~90 % of the fry are gone by early July (yf 0.34: 9–12 schools × 14–18, p 0.5–0.7) and ~all by mid-August; real
bullheads guard their fry balls for weeks — look at fry feeding (zoo, larvae above the refuge, detritus particles) and
guarding/predation; baseline c5 had 3–5 recruits), pike summer feeding (pikediag: ~2 takeable
fish in its arena but kills drop 80 → 17 per 45 days Jun → Sep at 23–26 °C > pike's 21 °C optimum — partly real),
perch age-2/3 growth still above Michigan means (founders), snails' 34-day life (real ~1 yr) and they could graze the
bed's benthic algae (SEDOM) instead of the phyto field.
Pike (round 4): 4–7 immigrant pike STARVED per run, year-2 p mostly 0.1–0.3 despite 180–270 small sunfish + ~100 minnows
(FEED.PREY_MIN 0.07: a 65-cm pike ignores fish < 4.6 cm; sunfish mean 5–7 cm) — NEXT diagnostic (verify/hunt.mjs-style).
VISIBLE EVOLUTION — built on branch `evo-history` (92a0b4d, 96243fc, 6ab3e4d), MERGED into science after 216237a (save v29):
world.evo trait history (EVO, sampled on the clock grid, thinned past MAX, saved) + Evolution-over-time chart (gene selector,
species pick, note) + fast-forward "Skip ahead" in a module Worker (src/ffworker.js; byte-identical to main-thread steps,
checked in Chrome; smoke runs the real worker behind a stub). Gate checks: sampling grid/values, thinning + round trip, FF smoke.
AFTER THE MERGE (committed): BULLHEAD RECRUITMENT FIX — verify/fryfate.mjs showed ~85 % of bullhead
fry STARVE by July at 1.0–1.6 cm (p 0.2–0.3), in the OLD code too (not the diet change: fryfate_nozoo / fryfate_base) —
no young fish could take bottom food before FRY.BENTH_L 2.5 cm. → species `benthL` (bullhead 1.2 cm: guarded fry balls
feed on the bottom from swim-up) + INSECT.REFUGE_FRY 0.05 g (fry pick small instars; the 1-g fish refuge hid them):
fry p ~0.4, ~140/clutch reach July, 10–12 recruits/yr/seed (was 0–1). Gate check added; the sifting check now clears
nymphs/plants (a nymph eaten by RNG luck had broken it). Evolution chart: scale from species with ≥ 5 fish, few-fish
lines dashed + clipped (real 2-yr history: trout/pike/bass means jump with each immigrant). FF worker yields via
MessageChannel (e1138bc). Embedded preview pane steps ~48 st/s (main thread too) — judge FF speed in real Chrome.
Round 8 (3 × 2.2 yr): bullheads 12–15 home-bred, 0 immigrants; carp home-bred; perch 5–20 (next). Gate GREEN (gate30, 92 st/s).
PERCH (diagnosed, verify/fryfate.mjs on new vs old code, 1.6 yr): egg-to-recruit survival is UNCHANGED (old 0.35 %, new
0.17–0.44 %); the old lake simply had more spawners (20.8k hatched vs 7–14k). The 100 founders (~7 kg) exceed what a lake
with real benthic production feeds; perch biomass relaxes to 0.4–2.8 kg at 2.2 yr ≈ 6–40 kg/ha (real yellow perch
10–50 kg/ha) — realistic, not a defect. LENGTH-AT-AGE now (round 7/8, mid-Aug yr 1.45) vs Michigan means: sunfish
4.2–5.2 / 9.3–10.9 / 12.3–13.3 / 14.6–15.3 / 16.5–17.1 (vb 4.4 9.2 12.8 15.4 17.4 — excellent); perch age 4–5 20.4–25.6 (vb
20.2/22.9), age 2–3 17–23 (vb 12.9/16.9; those are founders seeded at their age's vb length, then a fast first summer);
bass 29–35 at 4–5 (vb 28.5/32.9); bullhead ~10 % under. The old 'perch grow too fast' item is mostly resolved.
SESSION 7 (2026-10-14 afternoon, "keep going"): SNAILS reworked (uncommitted until round 9 + gate): annual life (M 1.2/yr),
warm-season per-capita breeding (R 6/yr, R_T 12–20 °C, young settle where the bed layer feeds them), graze the bed's SEDOM
layer (~1 mg AFDW/day each × Q10 2) instead of the phyto field, CAP 900×area (~3 g/m²), lit littoral bed only (MAX_DEPTH
0.5 H), a WEED REFUGE (0.12 × CAP out of reach — without it 324 crayfish + ~200 sunfish ate 2,025 seeded snails down to 521
in 13 s; pumpkinseed/crayfish do strip snails in real lakes, the weeds keep a stock). Gate snail checks rewritten.
APEX CHAIN — the main open accuracy item (diagnosed, NOT fixed): (1) adult bass are underfed (summer p 0.17–0.4) → spring
condition K 0.70–0.80 < SPAWN.K_READY 0.8 → they skip spawning most years (year 2 of round 8: 1 of 3 seeds spawned; same in
the old code); (2) when they do spawn, ~all bass fry STARVE at 1.1–1.5 cm (verify/fryfate.mjs: 8.6–9.6k of 11.6k by July, in
old and new code) — they compete for zooplankton with ~260k sunfish fry; NOT fixed by letting guarded fry roam
(fryfate_roam: 52 vs 6 alive in July) nor by a 60-px school reach (fryfate_eatr: no change). Real bass get a head start
(spawn at 15–18 °C, sunfish at 20+) — in year 1 the lake opens mid-May at ~17 °C so both spawn together (confounds year-1
tests; judge in year 2+). Next: bass/pike adult feeding (the p ~0.2–0.4 gap), then zooplankton production vs fry demand
(a zooplankton P/B model by temperature + littoral production), then re-test bass recruitment.
  FURTHER (same session): bass/pike diag (verify/preddiag.mjs <seed> <yrs> <species>): bass sit 90–100 % littoral, guts 6–19 %
  full; ~1–1.6 takeable fish in the arena (1.6–2.6 adult bluegill too deep for the gape — real), fish a small share of their
  food (crayfish + frogs/tadpoles dominate), young-of-year ~nothing — because YOY sunfish stay 0.6–1.4 cm all summer (starving).
  Fry maintenance vs Cmax (23 °C): bass (FB4 LMB, also the bullhead YOY stand-in) 0.32 g/g/day = 26–45 % of Cmax at 1.2–2 cm;
  bluegill/perch 0.10 (11–26 %). June zooplankton ~600/2025 swarms: fish + ~300k fry eat ~1.3 kg/day ≈ all the field makes
  (real ~2–7 kg/day) → THE NEXT ACCURACY SLICE: zooplankton production (biomass growth, P/B by temperature/food, littoral
  production, the cap a computing bound — as done for the larvae). ADDED: bluegill LIMNETIC PHASE (sp.pelagicFry 2.5 cm,
  Werner 1967/69): YOY sunfish 1.7–2.3 cm by Oct (was 1.2–1.8); bass fry unchanged. Round 9 (snails): fish 11.5–16 kg, perch
  12–31 (b 48–61), bullhead/carp home-bred, snails ~730 summer / ~400 late winter. Round 10 (+limnetic): so10_s*.txt. Pike: summer kills drop with
heat (23–26 °C > 21 °C opt — partly real); founders' perch growth is a transient.
(older list) REMAINING Phase-1 items: pike summer feeding (pikediag), founder seeding of age-1/2 perch, snails' 34-day life (now done).
NEXT: (a) look at the merged UI in the browser (bed detritus row, Evolution chart with a REAL multi-year history — run
Skip ahead 1–5 years), (b) the OPEN accuracy items above (bullhead recruitment, pike summer feeding, perch growth, snails),
then (2) the GUI/graphics/info/graphs review.

## ▶ (older) NOW — after the 2026-10-11/12 overnight audit-fix run

**New mandate (human, 2026-10-12 morning):** "fix everything, do what you think would be good, take screenshots
to analyze the GUI and everything yourself, keep everything updated in case chat compacts." The budget rule
still applies: no subagents.

**TOP PRIORITY (human, 2026-10-12):** "it's supposed to be a good visual like a screensaver, especially full
screen — make sure the visuals are good, high resolution, that even zoomed out you can see things, that it all
flows and acts real and that it's polished."

Screensaver plan:
- [x] Zoomed-out visibility (`8dd6471`): 91% of fish were 2-px dots at the overview. They're now oriented fish glyphs
      with a screen-scaled minimum length, plus a moonlight floor so nights aren't black.
- [x] Resolution: sprite tiers 14/28/56 px per unit. A 1080p close-up was a 2.5–7.7× upscale; now it's ≤~2×.
      ImageData rasterizer: tier builds cost 2.1 / 6.7 ms. GL textures are freed on sprite eviction.
- [x] Flow: glyph→sprite switch happens at an equal on-screen length (no pop). New tour mixes wide, habitat and
      follow shots, with slow cinematic easing and pull-back-then-push-in travel.
- [x] Fullscreen polish: the chrome and cursor fade after 3.5 s idle and come back on any input. Also: sediment
      texture on the bed, and dawn warmth fades with view depth (deep close-ups no longer turn muddy brown).

**▶ REALISM OVERHAUL IN PROGRESS (human, 2026-10-12: "do it all" → "make everything realistic, like you said earlier
what wasn't").** Baseline diagnostic (scratchpad `verify/recruit.mjs`, 3 seeds × 1 yr, pre-overhaul): sexual births
≈ 0 for every species but minnow (bass 0/228, pike 0/164 — all "home-bred" young were ASEXUAL BUDS of immigrant
adults); no juvenile bass/pike reached maturity; most large-fish adults STARVE (reserve lasts ~25 s: drain 0.045/s vs
cap ~1.35); no satiation (predators kill when full); K pyramid inverted (bass 88 / pike 40 vs minnow 202); climate wrong
(surface 22 °C on Mar 1, 31 °C peak Jun 1, never below 13 °C, no ice; strat = sin(year)). Phases, commit each green:
- R1 climate: T = 12.5 + 13·sin(2π(yf − 0.17)) (peak ~Aug 1, ~0–1 °C Jan), winter ICE (light ↓, no reaeration, no wind
  mixing → winter O₂ sag), hypolimnion floor 4 °C, stratification from the surface–deep temperature difference, seasonal
  day length/irradiance, asymmetric fish thermal stress (heat lethal; cold slows, Q10 metabolism).
- R2 energetics + life history: starvation times ~150 s (minnow) … ~400 s (pike) ∝ size^0.75; eat only when hungry;
  multi-year lives (minnow mature 0.5 yr / max 2.5 yr … carp 2 / 12 yr); temperature-triggered spawning windows (pike
  ~ice-out, perch spring, bass/carp late spring, sunfish/minnow repeat spawners in summer, catfish early summer); NO
  budding; K pyramid (minnow ≫ sunfish/perch ≫ catfish/carp/bass ≫ pike); initial multi-age population.
- R3 young fish: nest guarding (bass, sunfish, catfish), nursery cover, all fry eat zooplankton first.
- R4 immigrants from a regional gene pool (gene flow), not mutated copies of the lake's best (IMMIGRATION.FROM_BEST).
- R5 plants spread by rhizome runners (+ seeds), diatom spring bloom group, N-fixation by cyanobacteria.
- R6 new life: yellow perch, a fish-eating diving bird (loon: hunts underwater, fits the side view), then more.
- R7 multi-seed balance, docs, visuals. Judge with `verify/recruit.mjs` (births sexual vs budded, immigrants, deaths
  by cause juvenile/adult) over ≥3 seeds and ≥2 years.

**▶▶▶ PHASE 1 — session 4 (2026-10-13 afternoon): the food web around the bioenergetics. Branch `science`; main still
1a3c416 (green). Full gate GREEN on `science` (headless ALL PASS, perf ~80–100 st/s under load; smoke/ui/serve OK).**
Session-4 changes (all in FEATURES "2026-10-13 bioenergetics", rewritten):
- YOUNG-OF-YEAR = SUPER-INDIVIDUAL schools (Scheffer 1995) through their first year (not recruited at 2–4 cm as before —
  that threw away ~93 % of the young-of-year biomass predators should eat): feed zoo → benthos/detritus (FRY.BENTH_L) →
  other schools (young pike/bass), seek food, avoid hypoxia/heat, breathe O₂ (env), staggered FRY.TICK updates; SCRAMBLE
  competition (unfed share starves over its reserve time — physiological); larval respiration floor FRY.R_WMIN (FB4 W^RB
  overstates larval metabolism ~4×); recruit at L0 (now late-YOY lengths) or as yearlings in spring, within pop.max;
  slots CAP/SP_SHARE + MERGE_DAYS merging; piscivores eat schools in BOUTS (FRY.ATTACK 100 × capture × vuln, type-II in
  school size FRY.N_HALF; FEED.SCHOOL_MIN). Spawning no longer logistic-gated (density acts on the young); stats.spawns.
- Optimal-foraging diet order; POOR food (detritus/algae/plants) only as filler (FEED.POOR_GUT 0.15) — sunfish were
  starving at full ration on a gut of weed. Innate FORAGE reflex + animal-first food senses (carp/catfish/sunfish).
  Epiphytic larvae on macrophytes (INSECT.EPIPHYTE). Bass eat larvae; pike Lzoo 5; YOY bullheads borrow FB4 bass set.
- Activity cost on the ~1-day mean speed (`ua`), never below FB4 routine, SWIM 3→2 (Brett: ~4× routine at Ucrit).
- Hypoxia: graded CLIMB out of sub-critical water + escape burst that overrides diel rest/cold (catfish were dying on
  the anoxic bed cell). Starvation hazard K99 0.75→0.68, K_HAZARD 0.78 (K is W/Ws75; 0.8 is lean, not dying).
- PREY VULNERABILITY (BIO vuln: fathead 1, bluegill 0.35, bullhead 0.4, perch/bass 0.6 … Wahl & Stein 1988) — the single
  biggest community fix: pike were eating ~5 kg/yr of adult bluegill; now soft-rayed prey take the pressure.
- Founders: stable age structure (e^−M·age), first two of each species a ripe adult F+M pair; immigrants ripe. Pike
  refuge/rescue 1 (a ~0.07-ha slice holds ~1 pike at real densities), trout 1/2. Spawning migration is purposeful.
- Fathead batch spawning every ~4 d, reproAlloc 0.8. Juvenile FB4 sets only in the first year. UI shows meals again.
- Then (same session): PATCH RESIDENCE (FEED.RESIDE/RESIDE_T, saved `ft`) — a forager stays in the patch it's feeding in;
  gut EVACUATION never slower than a full stomach needs to pass Cmax (small fish on small prey); schools forage no better
  than single fish (FRY.EAT_R 40→24); young pike/bass eat insect larvae until 3× Lpisc; METABOLIC DEPRESSION under food
  deprivation (BIOE.K_DEPRESS 0.9, STARVE_DEPRESS 0.3 — Méndez & Wieser 1993) so lean summers stunt instead of starving.
Validation (scratchpad verify/: bioe_run2.mjs <seed> <yrs> — census, biomass, p, K, diet by source, deaths juvenile|
adult, YOY schools, mid-August length-at-age; webdiag.mjs — predation matrix; supply2.mjs — zooplankton made/eaten/died;
alone.mjs, yoygrow.mjs, bassyoy*.mjs, pdist.mjs, yearling*.mjs). Latest (y13, 3 seeds × 3 yr): every year sunfish recruit
~120–280 yearlings in spring that thin to ~30–40 by winter (now mostly predation + other, little starvation), 10–28 adults;
minnows 70–390 (most numerous, ~0.5–0.9 kg); perch 11–51 with home-bred recruits most years (~5–9 kg — the biggest
biomass, adults 25–30 cm, faster than Michigan means at these low densities); pike 1, bass 2–3, trout 2, carp 3,
catfish 2–9 mostly immigrant-held (carp/catfish recruit a few); total fish 13–23 kg + YOY. Gate green; perf 80–84 st/s
standalone (YOY schools cost ~30 %).
Still open: bass/catfish nests rarely produce recruits (larvae starve at swim-up near the nest, then perch eat the rest);
sunfish adults dwindle slowly (yearling mortality ~80 %/yr); minnow numbers high; browser visual check of YOY rendering
at full size; perf headroom.
- Then (session 4, later): eggs/nests in the LITTORAL (SPAWN.SHALLOWS — nests had landed on the anoxic deep bed);
  guarded broods forage within BROOD.GUARD_R of the nest; LITTORAL zooplankton among the weeds (PLANKTON.LITTORAL_RATE 15,
  fed by periphyton — survives the clear-water crash); big piscivores (> 3× Lpisc) skip insects/larvae (`bugs`); young
  pike/bass eat larvae (insectEater); perch Lzoo 25; HEAT ESCAPE reflex (within 3 °C of UILT: down if cooler, else
  offshore — trout were parking on the warm shelf); `fryDiag` (diagnostic, unsaved) splits YOY deaths by cause.
  TRIED + REVERTED: attack dash/turn + MISS_CD 0.1 (predators held by the rescue ate the forage out; y16 crashed to ~20
  agents); perch Lzoo 15 (perch starved). Lesson: predator efficiency vs the always-present rescued predators is THE
  sensitive balance — a future fix is to scale predator rescue/refuge by prey availability (numerical response).
  y18 (this config minus heat escape, 3 seeds × 3 yr): STABLE in all seeds — minnow 138–363, sunfish 37–259 (yearly
  pulses), perch 10–63 (recruit 77–202), catfish 3–12 (recruit 3–21), carp 3–7 (0–7), bass 2–3 (0–7), pike 1 (0–3);
  biomass 15–21 kg. Remaining: bass/pike underfed (agent prey capture rate ≪ physiological demand at compressed time),
  adult sunfish few (yearling mortality high), perch adults faster-growing than Michigan means.
98ce008 (heat escape + test fixes): gate19 GREEN (ALL PASS; smoke/ui/serve OK; perf 17 st/s only under 9-process load —
re-measure standalone before merging). y19 4 yr × 3 seeds stable but minnow-dominated (280–300), sunfish mostly YOY
recruits (adults 3–21), bass/pike immigrant-sustained (im 21–22 / 9–10), bass p ≤ 0.19.
SESSION 5 (2026-10-13 night, uncommitted on `science`): PREDATION AT COMPRESSED TIME. Diagnosis (verify/hunt.mjs): a bass
killed 1 fish per 23–66 s of hunting vs a physiological need of ~1 minnow per 1–2 s (1 s ≈ 5 h). takePrey is now a RATE:
FEED.ATTACK strikes/s × clarity over the fish in a hunting arena FEED.HUNT_R × eatRadius, weighted by closeness, success
capture × vuln × (new) SIZE REFUGE (1 − depth/gape)^FEED.SIZE_SEL; kills/misses thinned Poisson; `dt` omitted = one strike
(tests). MISS_CD 0.5→0.1. _shoalOf caches dilution per step. Gate checks updated (reach × HUNT_R) + new: rate/clarity,
gut-fit choice, size refuge. NOTE: verify/ wrappers of takePrey must pass (a, m, d) — old ones dropped maxW too.
Without the size refuge (h6/h20, 3 seeds × 1.5 yr) the community COLLAPSED (agents 60–115): pike ate 10–16 kg of ADULT
perch+sunfish in 0.6 yr (webdiag kills by depth/gape r mostly 0.5–0.75); a pike grew 74→116 cm. Runs hs6/hs12 (size
refuge, ATTACK 6/12) in progress. Literature for the refuge: Miller et al. 1988 review, Nilsson & Brönmark 2000, Paszkowski
& Tonn 1994, Gaeta et al. 2018 (median prey 10–20 %, max 32–46 % of predator TL). Browser check of YOY rendering: OK.
With the refuge (hs6/hs12, 3 seeds × 1.7 yr): ALL INTACT — sunfish 57–88 (39–60 adults; old model had 3–21), perch
29–84, minnow 74–320, agents 208–497; pike fed (summer agents 2–7 g/s ≈ Cmax), bass still immigrant-sustained.
Summer bass diagnosis (verify/schoolhunt.mjs, fryblock.mjs): Cmax 3–6 g/s vs intake 0.04–0.5 g/s. Fixed in this slice:
(a) _eatFry looked only at the NEAREST school and bass were shadowed by larval schools they can't use (nearest = larvae
42–54 % of steps) → piscivores now take the nearest school of young FISH (piscSchool; larvae only while < 3×Lpisc), also
in qPrey (fryPreyOf). Committed ec6fd2d with (b) bouts across the hunting arena + FRY.ATTACK 400 — but v1 validation
(3 seeds × 2.2 yr) showed the lake THINNING year on year (448 → 110–157 agents; YOY eaten ~5× more, minnows 6–23, bass
still p 0.06–0.2; v2 = HUNT_R 6 collapsed to 46–69) → (b) REVERTED (bouts in-school, FRY.ATTACK 100; larvae fix kept);
v3 validation (3 × 2.2 yr): stable (no trend). Then rare colonists PAIR UP (immigrant sex = the one the species' few
adults lack; a one-sex refuge never bred — gate rescue check had failed on seed 73) + trout A/B hardened (4 trout,
UILT-raised control: 18.9 vs 23.9 °C). v4 (with pairing, 3 × 2.2 yr): stable, agents 351–425 at 2.22 (sunfish 240–254,
minnow 83–125, perch 12–33, catfish 4–9, bass 3 b 0–8 im 13–15, pike 1). Gate GREEN, perf 100 st/s standalone.
MERGED: main = science = df28f1b (2026-10-14 00:36); backup G:\synapse-reef-backups\synapse-reef_20261014_0036_predation-size-refuge.zip.
NEXT SLICE — CRAYFISH at real biomass (the bass's missing staple): Momot & Gowing 1977 (3 Michigan lakes, O. virilis):
46–213 kg/ha standing, production 60–142 kg/ha/yr, P/B 0.94–1.53 → this slice ≈ 3–15 kg (sim: 0.1–0.9 kg, 11–74 × 12 g).
Bass diets: crayfish 54.6 % by weight Apr–Oct (Murphy Flowage WI), 80 % of prey in June / 40 % July (WI lake). Crayfish
recruitment is gated by detAvail = fresh detritus particles / (0.6·CAP) ≈ 0.01–0.03 → ~2 % of max. Plan: temperature-
driven logistic toward a habitat K (biomass 5–20 g/m²), not the particle count; predation via rate capture (+vuln),
not certain nearest-take; check perf with several hundred crayfish. Later: a slow sediment organic pool for larvae.
SLICE IN PROGRESS (uncommitted, 2026-10-14 ~01:30): CRAYFISH + LITTORAL BASS. Done: seasonal logistic (CRAYFISH.R 8/yr in
warm water R_T 10–20 °C, M 0.8/yr; SEED 48 ≈ 0.6 K; K = CAP 80×area = 540 × 12 g ≈ 9 g/m²); crayfish on the littoral/
sublittoral bed only (MAX_DEPTH 0.55 H; deep ones walk back up); fish hunt crayfish across the arena (HUNT_R × reach) with
a per-species skill diet.cray (bass 0.25, bullhead 0.15, perch 0.08, pike 0.05) × closeness × cover × day shelter
(SHELTER_DAY 0.7); SNAIL_HUNT 2→0.3. BASS: homeDepth 0.55→0.8 + innate.littoral 0.5 (turn back to shore over beds deeper
than 0.5 H, off during spawning migration) — they had spent 57–78 % of summer over the open basin, ~never within reach of
the bed (verify/basswhere.mjs, bedtime.mjs; NB June windows are bass spawning-migration time — measure in late July).
Diagnosis trail (verify/craydeath.mjs): with shared capture × 0.5 the 2 pike ate 124–140 crayfish in 0.13 yr and the stock
crashed to 5–9; with per-species skill + shelter + R 8 → stock 194 at 0.35 yr, bass the main crayfish eater (114/222).
New gate checks (session-5 block): crayfish depth + walk-back, warm/cold regrowth (immigration off), defended prey, littoral
bass. c3 (no gape/dormancy/shelter): stock eroded to 1–25 in 2 yr → added CRAYFISH.WIDTH 2.2 cm (gape), ACT_T 4–12 °C
(cold dormancy), SHELTER 0.4 K held by the OLDEST (array order = age; transient cf.sh each step, no save change) — c4 still
eroded (37/9/7), c5 with shelter: STABLE 150–240, bass summer p 0.2–0.6 (crayfish 54–90 % of diet), biomass 14–23 kg,
fatheads scarce (3–21 adults — realistic in bass lakes), sunfish dominant. Gate GREEN (101 st/s). COMMITTED + MERGED (see git log).
NEXT: phase-1 leftovers — a slow sediment organic pool (insect larvae recruitment still gated on fresh detritus particles;
det 0–30 on the bed), pike underfed in year 2 (p 0.03–0.5), perch adults fast-growing; then PHASE 2 (visible evolution —
Explore survey done 2026-10-13: Evolution card + world.series exist; missing trait history/variance/saved history/fast-forward).
▶▶▶ USER PLAN (2026-10-14, before compaction — supersedes the older phase order): (1) finish IMPLEMENTING everything and make
it ACCURATE (phase-1 leftovers above, then visible evolution: trait history + fast-forward); (2) a full review pass on the
GUI, the graphics, the webpage information text, and the graphs/charts; (3) on the roadmap: MULTI-LAKE landscape with
STREAMS, RIVERS and PONDS; (4) what-if controls. STATE: main = science = a7cdc1c, tree clean, gate green, backup
G:\synapse-reef-backups\synapse-reef_20261014_0204_crayfish-littoral-bass.zip. Resume at (1): the sediment organic pool.
Tried, no clear gain (reverted): HUNT_R 8/12 (pike gorge, bass unchanged), a worth-the-chase prey filter (CHASE_MIN).
ROOT of bass starvation: in June–July YOY are 1–2-cm larvae (~0.04 g), fathead adults thin out, crayfish few — crayfish
model predates bioenergetics and recruits from a near-EMPTY detritus pool (DETRITUS particles live 26 s ≈ 5 d → 0–30 on
the bed; real lakes have a large sediment organic pool). NEXT SLICE: a sediment organic pool (field, not particles) feeding
crayfish/larvae/bottom feeders, crayfish densities toward real (1–10 /m²) — then re-check bass.
Validation v1 (this config) / v2 (HUNT_R 6), 3 seeds × 2 yr, and gate20 were running.

**▶▶ RESUME HERE (2026-10-13, after compaction) — the human wants ALL THREE, in order, then what-if tooling:**
Goal (human): "a complete, realistic simulation, that looks good too and is polished … eventually good enough that you could
manually add in other variables to see how it would affect the ecosystem, but we have to get it accurate before that."
Usage limit lifted: be thorough (multi-seed, ≥3-yr validation, research published parameters; parallel agents OK).
State: main = 1a3c416 (gate green, save v26); working branch `science` (from main). Backups on G:.
1. BIOENERGETICS + FOOD-DEPENDENT GROWTH (first). Replace hand-set metabolism/moveCost/energy caps with the Wisconsin /
   "Fish Bioenergetics 4.0" (Deslauriers et al. 2017) equations and published per-species parameters (consumption CA/CB/CQ/
   CTO/CTM/CTL/CK1…, respiration RA/RB/RQ/RTO/RTM/ACT…, egestion/excretion FA/UA, SDA, energy density) for fathead minnow,
   bluegill/pumpkinseed, yellow perch, rainbow trout, (brown) bullhead or channel catfish, common carp, largemouth bass,
   northern pike. Fish carry MASS (g) and grow by consumption − respiration − waste; length from length–weight; size →
   gape, speed, fecundity (∝ mass), predation risk; condition factor; starvation when reserves deplete. Map sim time to real
   days via the 30-min year (1 sim-s ≈ 4.87 real hours) consistently. Then re-derive prey energy densities (J/g) for
   zooplankton, insects, fish. Validate: growth curves (length-at-age) vs published, consumption ≈ % body mass/day.
   Expect most tuning to disappear; calibrate remaining against field patterns (pattern-oriented modelling).
2. VISIBLE EVOLUTION: trait-trend charts per species (gene means/variance vs time & generation), selection-differential
   readouts, a fast-forward "evolve N years" mode (headless in a Worker), heritable traits that show in the art.
3. LANDSCAPE: several lakes (deep oligotrophic trout lake / current productive lake / shallow weedy pond) + a stream with
   riffles/pools (flowing-water physics; stream spawning for trout), real dispersal between them (replaces the abstract
   regional gene pool), per-lake views + a map; background lakes step at reduced cost.
4. THEN what-if controls (nutrient loading, warming, stocking, pollution, fishing, invasive species).
Known weak spots to revisit inside 1: perch/catfish/trout numbers; adult dragonflies only visible in the air strip.

**▶ POLISH (2026-10-13, session 3b — human: twitchy "resetting" swimming, plants through the bank, inaccurate looks):**
fixed as in FEATURES "2026-10-13 polish" (30 Hz browser step + no catch-up bursts, 30 Hz decisions, true body proportions,
real-scale wildlife, plants/logs/crayfish/nymphs follow the bed). Evolution evidence (verify/evo.mjs, seed 1): after 2.5 yr
(~75 min) minnows reach generation 2.6, others 1–2; trait means within ±6 % (mostly drift) — realistic generation times
make evolution invisible within a sitting. OPEN for the human: (1) bioenergetics with published per-species parameters +
food-dependent growth (removes most hand-tuning), (2) evolution visibility (trait-trend charts, fast-forward), (3) a
landscape of several lakes + a stream.

**▶ MORE LIFE (2026-10-13, session 3 — human: "keep going and do it all") — branch `realism2` → merged to main when green:**
- Added: Daphnia vs copepod zooplankton (p.k; clear-water phase, size-selective predation, copepods carry winter);
  dragonflies (benthic nymphs that ambush larvae/tadpoles/fry/zooplankton, emerge on warm sunny days, adults hawk insects
  and lay eggs, fly in from other waters); frogs (tadpoles graze + metamorphose, frogs float/dive/spawn/hibernate);
  painted turtles (forage, breathe/bask, hibernate, late-summer hatchlings); fish eat herps that fit the gape; RAINBOW
  TROUT (cold-water, O₂-hungry, stream spawner); behavioural thermoregulation (heat → cooler depth, offshore off the warm
  shelf; the O₂ check makes the summer squeeze); per-species cold activity floor (SP.coldPerf: trout .6, pike .5,
  perch .45); bottom-huggers don't sink into hypoxic water; fecund species spawn bigger clutches of cheaper young.
  Save v26. UI rows + legend for the wildlife. Seasonal water tint follows the temperature phase.
- Balance, 3 seeds × 2 yr (deaths_fin2_s*), mid-May yr 3 (pre-spawn low): minnow 249–334, sunfish 21–55, perch 17–29,
  trout 3–7, catfish 6–12, carp 13–35, bass 7–21, pike 5–14; frogs ~50–81 (cap 81), turtles 14–29, tadpoles cycle
  0 → 400 each spring. Dragonfly nymphs were dying out (fixed: CRYPTIC .02, SENESCE .0003, EGG_RATE .3, VISIT .02).
- Follow-ups: catfish still lose condition and some die in winter/summer hypoxia; trout persist mainly via the immigration
  floor (realistic for a eutrophic lake without a good spawning stream); adult dragonflies fly ABOVE the water, so they are
  only on screen when the view shows the air strip (zoomed out / tall screens).

**▶ REALISM STATUS (2026-10-12, session 2) — gate GREEN; `realism` fast-forwarded into `audit-fixes` and merged to `main`:**
- DONE in code: R1 climate (temp cycle, ice, seasonal sun, Q10 metabolism, temp-driven strat, hypo ≥ 4 °C, start date
  SEASON.START_YF 0.22, primeSeason); Q10 on phyto/cyano/diatom/nitrif/sediment+pelagic O₂/plant night resp; plant
  dormancy (PLANT.DORMANT_T); inflow plume + aerated inflow (FLOW.PLUME_*, O2_MIX); plant O₂ spread along the stem;
  O2_RESP_FISH scaled 0.012→0.0015; R2 energetics (per-species metabolism/moveCost ~8–10× lower; all stress drains
  rescaled; actions ENGAGE-gated), satiation (FEED.SATIATE/HUNT_BELOW), fry eat zooplankton (FRY_GROW), juvenile
  massF^0.75 metabolism, life history in years (species.js yr()), temperature-triggered spawning (SP.spawnT,
  SPAWN.EDGE/SEASON_END/MATE_REACH, spawnSide grounds), NO budding, K pyramid, mixed initial ages, cheaper young + bigger
  clutches; R3 nest guarding (sp.nestGuard, BROOD.GUARD_*/PROTECT, a.nt/nx/ny/ni), nursery cover, PREY_MIN, gape 0.62,
  O₂-limited habitat choice (benthic → shelf); DIGESTION (FEED.MEAL_K 10, DIGEST 1200, a.dg by absorbed energy);
  R4 regional gene pool (world.genePool, poolFounder, IMMIGRATION.POOL_N/EMIGRATE; FROM_BEST retired; RESCUE_N 3,
  RATE 0.05); R5 clonal plant runners (PLANT.CLONAL/RUNNER), DIATOM group (env.diatom, diatoms(), sinks when stratified),
  CYANO TEMP_OPT 25/TOL 11; R6 PERCH species (SP.perch, 'vbars' art, qLarva, TROPHIC 'mesopredator'), LOON (BIRD config,
  world.birds, _stepBirds, qThreat includes diving loon, render _drawBirds), ice rendering. Save v25 (ice, diatom, nest,
  dg, birds, genePool). smoke passes.
- FIXED #1 (2026-10-12, session 2) — under-ice O₂. Budget (verify/o2budget.mjs) showed the drains were (a) the wind-driven
  overturn still running under ice (non-conservative relaxation toward the depleted surface) → × (1 − ice); (b) weak
  under-ice mixing (ICE.STRAT 0.55 → 0.85, calm inverse stratification); (c) diatoms sinking into the dark deep and
  respiring at full rate → dark survival (PHYTO.DARK_RESP 0.15, RESP_IK; env.algaeRespAt); (d) cold-suppressed
  photosynthesis in dim light → Blackman photoRate (light-limited rate T-independent; Pmax ∝ Q10). Result (2 seeds × 2 yr):
  avg O₂ Jan 0.8–1.2, Mar 0.4–0.7, deep anoxic under ice, upper water oxygenated; spring diatom bloom → May clear-water
  phase → summer green → Aug cyano → autumn diatoms. All 7 species persist with seasonal cycles.
- FIXED in session 2: founders started with rand(0, matingCooldown) → once-a-year spawners skipped the opening season
  (now mateCd 0); a.feedAcc (cold foraging makes it fractional) was not saved → resume diverged (now `fa`, v25);
  effSize 0.6+0.4·grow made newborns 74 % of adult length → never cannibalised (now 0.3+0.7·grow); spawnFactor exported
  (pure); world.setDate(yf); UI ice/diatom/loon readouts + loon legend; CLAUDE.md/README/FEATURES updated.
- Tests: many headless checks rewritten to the new calendar/model (setDate dates, temperature spawning, no budding,
  total-P inflow A/B, thermal-stress scaling); NEW realism block (climate, ice form/melt/seal, under-ice O₂ profile,
  Blackman, dark survival, diatoms, nest guarding, digestion, gene flow, loon, perch, founders).
- Session-2 behaviour fixes: SPAWN.KEEP 0.25 (clutch paid from the surplus above a reserve → condition-dependent; 0.5
  halved recruitment of slow breeders); immigrants arrive with mateCd 0; nest guardians ignore their own fry as
  "intruders" (notOwnBrood), hover over the nest (BROOD.HOVER) and tether harder (GUARD_TETHER 2.5); a migrating
  spawner's depth-keeping keeps its migration direction (`mig`); season names are meteorological (Dec–Feb winter);
  UI day/dawn/night from the sun's height (env.sun), not the light under cloud/ice; primeSeason hypolimnion follows the
  seasonal phase (~6 → 15 °C through summer, ~5 under ice).
- Balance, 3 seeds × 2 yr (verify/deaths.mjs; census at mid-May yr 3 = the pre-spawn low): every species persists and
  breeds in its own season; predation is the main death cause of small fish. Baseline (old effSize, no KEEP): minnow
  254–332, sunfish 43–60, perch 2–13, catfish 9–17, carp 15–23, bass 6–15, pike 7–16. KEEP 0.25 + small juveniles:
  sunfish 8–56, perch 2–10, catfish 4–7, carp 4–13, bass 12–19, pike 3–12. FINAL code (+ nest-guard fixes):
  minnow 328–336, sunfish 6–36, perch 5–13, catfish 6–12, carp 5–13, bass 3–23, pike 8–12.
- NEXT (balance follow-ups, judge each on a ≥3-seed A/B, ideally 3 yr so early spawners get 2 springs):
  1. PERCH decline in every run (74 → 5–13): spring starvation (energy.mjs: 78 % hungry) + heavy predation on young.
     Real perch feed actively under ice — coldPerf (COLD_PERF_MIN 0.2) may be too harsh for cold-tolerant perch/pike
     (a per-species cold tolerance would be realistic).
  2. CATFISH hypoxia drain is their biggest cost (energy.mjs 10.95/1000/s): they sit in anoxic bottom water; the
     O₂-limited habitat steer should keep benthic fish out of water below o2Crit more firmly.
  3. SUNFISH vary by seed (6–56): young are heavily eaten since juveniles became realistically small; bluegill are
     hugely fecund nest-guarders (try SP.sunfish.clutch ↑).
  4. CARP summer starvation (s12–14/season).
  Optional realism adds still open: trout, dragonfly larvae, zooplankton types, frogs/turtles.
- Scratchpad verify scripts (session-local; recreate if lost): recruit.mjs, deaths.mjs (deaths by cause×season incl.
  loon), energy.mjs (per-species energy budget), climate.mjs (monthly lake table), o2sinks2.mjs (winter O₂ sinks),
  hypwhere.mjs, shelfo2.mjs, profile.mjs, o2budget.mjs (O₂ budget by process from a snapshot), iceprof.mjs (per-row
  under-ice profile), breedgate.mjs (why a species is not breeding), resume2.mjs (resume check — RNG is global: run the
  original path FIRST, then load and replay).

**▶ RESUME HERE (updated 2026-10-12, after the launcher + smoothness round):**
- **Human feedback this round:** "doesn't seem very smooth or high fps", "looks blurry when fully zoomed out",
  "add a batch file to easily launch this". All three were measured in REAL Chrome at 1920×1080 (RTX 3060, 144 Hz) and
  fixed:
  - `3cf2eb7` launchers (`Synapse Reef.bat`, `Synapse Reef - Screensaver.bat`) + `#screensaver` window mode; the GL
    scene upload went into an SRGB8 texture = Chrome CPU-readback slow path (19 → 70 fps with RGBA8 + shader decode);
    frame pacing (every k-th refresh on high-Hz displays); UI panel refresh staggered across frames.
  - `01e4329` crisp overview: warp / chromatic aberration / fake DOF now scale WITH zoom (were strongest zoomed out).
  - `26b8de6` sim step 7.1 → 4.5 ms, byte-identical (fingerprint hash unchanged; gate 154 → 256 steps/s).
  - `1d229a1` drawn fish pitch soft-limited to ±55° (no more vertical "falling cut-out" fish).
  - `8a9e78f` GL fish swim in FRAG_FISH from one straight-pose sprite per fish: the hi-res tiers needed
    30 sprites per fish (10 frames × 3 efforts) vs caps 160/48 → close shots rebuilt sprites every frame (20 fps, 230 ms
    stalls). Now 65 fps, 100% frames on target at 16× on the densest cluster.
  - `5e555d6` tall screens (16:10, 4:3, portrait) frame the surface at the top; earth fills the spare height.
  - `f6732e3` fish art for close-ups: species markings (bass band, minnow stripe, sunfish bars + orange breast, pike
    spots, catfish mottle), overlapping scales on the close-up tiers, forked tails, rounded snout, iris, soft edges;
    tour follow zoom 6–16×.
  - `beb24e9` plants up close: eelgrass weed-bed blades as tapered ribbons with a midrib, lance leaves on stalks,
    tapered reeds (all only at z ≥ 2.4); fish no longer fade in as see-through "ghosts" on every tour cut (only newborns
    fade).
- **How I measure in real Chrome (session-local scripts in the scratchpad; recreate if lost):** launch
  `chrome --app=http://localhost:8000/#screensaver --user-data-dir=%LOCALAPPDATA%\SynapseReef\bench
  --remote-debugging-port=9334 --window-size=640,400 --disable-backgrounding-occluded-windows
  --disable-renderer-backgrounding`, then a tiny Node CDP client (Node 24 has global WebSocket) that sends
  `Emulation.setDeviceMetricsOverride` 1920×1080 + `Runtime.evaluate` (frame-interval/pacing, wrapped draw/step
  timings), `Profiler.start/stop`, `Page.captureScreenshot`. The override drops when the session detaches, so do the
  setup and the captures in ONE session. Sim speed-ups: `simhash.mjs` = sha256 of `toJSON()` after 4000 steps with
  `seed(12345)`; it must not change.
- **Next, in order:**
  1. **Tall-screen framing.** camera.js `_clamp`: when the view is taller than the world (`hh*2 >= H`) it centres
     the lake (cy = H/2), leaving smoky "air" with god-ray streaks above the surface on portrait or 4:3 screens.
     Anchor the lake near the top instead: margin m = min(0.03·H, (viewH − H)/2), cy = hh − m. Do the same for the
     tcy/hh and cy/hh2 pairs. Standard 16:9 fit then stays unchanged, because FIT_PAD's margin (17.6) < 0.03·H.
     Check the headless camera tests around headless.mjs:1300 first.
  2. Optional fish-art polish (the fins read a bit flat at 30×); plant/bed art.
  3. Ecology, lower priority now: juvenile cover / nursery reflex for apex recruitment. Judge with a ≥3-seed A/B
     using `scratchpad/verify/seeds.mjs` (session-local; easy to recreate: per-seed 1-year births vs immigrants,
     with SP overrides via env).
  4. Merge `audit-fixes` → `main` again after each verified batch, then take a G-drive backup with `git archive`.
- **How I verify visuals:**
  - Built-in browser, preview `reef` (`node serve.mjs`).
  - Fake fullscreen: set `#viewport` to position:fixed inset:0, and `#tank` to 100vw × 56.25vw.
  - Pause with `reef.ui.paused = true`; force the time of day with `world.env.t` and `world.env.light`.
  - Capture with `computer` zoom on region [0,0,754,424].
  - The pane refuses real fullscreen requests; it scales emulated big viewports, so use the native size.
- **Lessons this round:**
  - Measure perf in real Chrome at the user's resolution, not in the preview pane: the pane hid a 4× GPU-process
    bottleneck. Chrome only GPU-copies a canvas into non-sRGB textures; never upload a canvas into SRGB8_ALPHA8.
  - Screen-space lens effects must scale with magnification, never 1/zoom.
  - Any per-fish sprite variant multiplies the cache working set; animate in the shader instead.
  - Run `node --check` after EVERY edit. A duplicate `const P` once broke app startup.
  - The smoke DOM stub lacks some canvas methods (`clip` was added). Add any new ctx method you use to the stub.
  - `ImageData` isn't in the stub, so the sprite rasterizer falls back to `fillRect` there.

**Plan for this round** (tick items off here as they ship):
- [x] GUI review in the built-in browser: screenshots at desktop, mobile, whole-lake, close-up, night,
      overlays and fullscreen. Fix layout and readability issues.
      Shipped `caa26ba`:
      - the legend was covered by the minimap and camera controls;
      - open on the whole lake;
      - neon fish and flora at night → dim and desaturate;
      - magenta sunfish;
      - near-white plants by day;
      - plankton "snow" at the overview;
      - truncated trophic labels;
      - mesh-gridded field overlays → a smooth heat map.

      Still to check: the mobile layout. Fullscreen can't be triggered without a user gesture.
- [ ] Colour grade / exposure: judge with screenshots and GPU-readback histograms, now that GL depth is
      right-side up.
- [x] Catfish nocturnality: `innate.dayRest` (catfish 0.5) damps daylight thrust, giving ~60% faster at night (was ~8%). A 3-seed A/B shows a cost within noise.
- [ ] Apex juvenile survival / brood protection.
- [x] Tests: the can't-fail checks are relabelled (REFUGE / clamp invariants). The Liebig check now asserts that the scarcer element sets the limit. A WebGL2 mock is still open.
- [ ] HUD O₂ readout semantics (it reads 100–116%).

**What happened.** On 2026-10-11 the human asked to "post it to GitHub and fix everything" in `AUDIT.md`.
They then asked for testing, pushing, re-auditing and improving to continue overnight, *without burning usage
on subagents*. Five worktree agents did the first wave of fixes. Everything after that was done solo.
All of it is on `main` via the `audit-fixes` branch.

**Repo:**
- https://github.com/jamesccupps/Reef (public).
- `main` = the latest verified state. `audit-fixes` = the working branch (merged).
- Commits use the repo-local noreply email (GitHub rejects the private Gmail with GH007).
- There's no `gh` CLI.
- On Windows PowerShell, commit with `git commit -F <msgfile>`.
- Budget rule from the human: don't fan out subagents or workflows unless they ask.

**Verified state (last strict gate):** `npm test` exit 0, ~131–144 steps/s, covering `headless.mjs`,
`smoke.mjs`, `ui-check.mjs` and `serve-check.mjs`.
- Save format is v24.
- Exact resume holds (load → 600 steps byte-identical at dt 1/60 and 1/30).
- P and N budgets are closed (plants included).
- GL orientation was verified on the GPU (caustics change the TOP bands).
- Interpolation was verified live (the drawn position moves every frame at ½×).
- No CSP violations or console errors.

**Shipped (details in `AUDIT.md` status and `docs/FEATURES.md` → "2026-10-11 audit-fix changes"):**
- **Wave 1:**
  - render: GL orientation, GL fallback, colour pipeline, interpolation, input;
  - UI: XSS, CSP, server, caps;
  - integrity: brain eras, exact resume, validated load;
  - bio: cannibalism grace, plant light average, per-second rates;
  - chemistry: wet/dry mask, conservative diffusion, closed budgets, hypolimnion, storms, outflow.
- **Solo follow-ups:**
  - plant N+P pool, which closed the last budget term;
  - apex energetics (diagnosis below);
  - round-trip fix and a strict no-negatives check;
  - a safe `makeFish` default age;
  - behavioural replacements for the formula-copy tests, plus a stress-scenario determinism check, a
    body-depth `qPrey` check and Baldwinian persistence checks;
  - docs: slim CLAUDE.md, FEATURES.md, README, LICENSE, ROADMAP status, archived history;
  - the step-rate badge fix.

**Apex predators (the main ecology finding):**
- Bass and pike didn't fail to breed; they **starved**. A bass burned ~0.09/s against an intake of ~0.05/s,
  and immigration rescue had become a treadmill. Diagnostic scripts: `scratchpad/verify/apex.mjs` and
  `budget.mjs`. They are session-local; recreate them from this description if needed.
- Fixes:
  - innate **pursuit** for bass/pike;
  - innate **hypoxia avoidance** for all species;
  - predator metabolism put on the size trend (bass 0.046→0.030, pike 0.056→0.036);
  - fish meals worth more (0.60/0.65 → 0.80/0.85).
- Result: bass immigrant share 91% → 80%, pike 76% → 61%, with prey steady.
- Then the remaining bottleneck turned out to be mate-finding. A lower breeding threshold was tested and
  rejected: births didn't rise. **Spawning aggregation** (`innate.spawnGround`) shipped instead.
- 1-year immigrant share now: bass 70%, pike 54%, catfish 29%, carp 39%, sunfish 16%. Total immigration **Caveat (2026-10-12):** those are single-seed (2024) figures. A 3-seed, 1-year A/B gives honest means of bass ~78%, pike ~59-66%, catfish ~47-49%, carp ~44-46% and sunfish ~22-24% immigrants. That is still better than the 91%/76% start, but less than seed 2024 suggested.
  is down 44%, and minnows hold steady (CV 0.04).
- Better, but bass and pike are **still not fully self-sustaining**. Next levers: juvenile survival and
  brood protection.

**Open / next (ranked in `ROADMAP.md` → "Build order & guards"):**
1. Apex self-sustainment: juvenile survival (pike eat many bass), the reproduction threshold, damping
   the immigration treadmill.
2. The rest of test hardening:
   - a WebGL2 mock in smoke (`GLPost` never runs under the stub);
   - relabel or replace the checks that can't fail (REFUGE "all species present", clamped O₂ range);
   - a faster gate (it's ~9 min serial; `node:test` with parallel files).
3. Catfish nocturnality is weak in effect (~8% faster at night).
4. N-fixation is rare at the default inflow.
5. The graphics realism roadmap. Re-tune the grade first: it was tuned against the upside-down GL depth.

**Needs the human's eyes:**
- the colour grade and exposure now that GL depth is right-side up;
- the HUD's average O₂ reading ~100–116% (wet-only means plus spring supersaturation);
- predator behaviour with pursuit (does it look natural?).

**Gotchas:**
- `renderer.draw(t[, alpha])` needs `t`.
- In FRAG_COMP, depth is `dpt = 1 − uv.y`.
- Test blocks go BEFORE the final summary `console.log`/`process.exit`.
- `World.makeFish` defaults to a living adult.
- Run new behavioural tests A/B against an identical world.
- `REEF_PERF_MIN=0` only while the CPU is shared.
- Agent worktrees are created at `main`.

---

## Before the audit: where things stood (2026-06-18)

The full verbatim history is in [`docs/archive/SESSION_LOG_2026-06.md`](docs/archive/SESSION_LOG_2026-06.md). It was moved out on 2026-10-11 because this file had grown to ~211 KB.

- **Last shipped:** graphics realism slice 1, a linear-HDR GPU pipeline (sRGB-decoded textures, RGBA16F, encode + dither last, live `present.exposure`).
- **Arcs completed before that:**
  - **Cognition/ecology (12 slices):**
    - brain action head (strike/flee/hide);
    - `LIFE_SCALE`;
    - motion realism (carving, turn-speed loss, burst-and-coast);
    - hunger/fear drives;
    - aquatic insects;
    - snails and crayfish;
    - dashboard slice A;
    - spatial cognition;
    - richer perception;
    - Baldwinian lifetime learning;
    - evolvable brain size.
  - **Graphics:**
    - Pass 1: de-pixelate;
    - Pass 2: rich organisms, effects and water;
    - Pass 3: WebGL post, volumetric light, GPU-lit fish;
    - a cinematic finish;
    - per-species fish art.
- **Planned graphics roadmap** ([`docs/GRAPHICS_RESEARCH.md`](docs/GRAPHICS_RESEARCH.md)):
  - AgX / PBR-Neutral tonemap;
  - shared surface heightfield;
  - Beer-Lambert depth colour;
  - depth/occluder MRT;
  - occluder-masked god-rays;
  - per-pixel fish normals, iridescence, fin SSS;
  - HG in-scatter;
  - real DOF + AO;
  - instancing.
- **Parked, non-graphics:**
  - dashboard slices B and C (selectable charts, food-web flux, CSV export);
  - "grow the lake" (amphibians, birds);
  - the scenario/preset engine.
- **Pending human eyeball:** the colour grade and exposure. The GL depth terms were upside-down until the 2026-10-11 fix, so the grade was tuned against the inverted image.
