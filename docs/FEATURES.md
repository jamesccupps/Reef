# FEATURES — Synapse Reef subsystem reference

This is the detailed reference for how each subsystem works and where it lives. It moved out of `CLAUDE.md` on 2026-10-11, because that file is injected into every session and had grown to ~41 KB.

- **For quick facts:** read the short `CLAUDE.md`.
- **Before touching a subsystem:** read the matching section below.

The **2026-10-15 zooplankton fields and food web** section comes first, then the **2026-10-14 visible evolution** and **2026-10-14 bed's organic layer** sections, then the **2026-10-13 bioenergetics** section, **polish**, **more life**, the **2026-10-12 realism overhaul** and the **2026-10-11 audit-fix changes**. Where any disagrees with the older narrative after them, the newer section wins. The narrative itself is kept as it was.

---

## 2026-10-15 zooplankton fields and a food web recalibrated to real lakes (save v30)

Built after a literature pass (`docs/ECOLOGY_RESEARCH.md`, sourced notes in `docs/research_notes/`). The old zooplankton
— ~2,000 swarm particles refilled at full size in proportion to the algae — produced about the right amount, but held a
third to a sixth of a real lake's standing stock, turned it over 2–4× too fast and fed the fish an unlimited supply (~10–13
kg a month in summer and 3–5 under the ice, ~75 % of their diet). Making the zooplankton real exposed the rest of the food
web that had been tuned on that subsidy; this slice rebuilt it piece by piece, each step against field numbers, with the
probes in `test/diag/` (see its README: half-monthly zooplankton budget, whole-lake energy audit, young-of-year fates,
death ledger, per-species diet, bed food vs where the fish are).

- **Zooplankton as fields** (`environment.js` `zooplankton()`, config `PLANKTON`): three biomass fields in g wet per field
  cell (1 g/cell ≈ 40 µg dry/L; the slice is `WORLD.SLICE_M2` 700 m² at `WORLD.PX_PER_M` 79, so a cell is `WORLD.CELL_L`
  ≈ 2,500 L) — `zooD` Daphnia and the other cladocerans, `zooC` copepods, `zooR` rotifers and nauplii. Each grows on its
  cell's algae (Holling; Daphnia have the lowest food threshold, Gliwicz 1990) × Q10 (growth more temperature-sensitive than
  losses), less maintenance and background mortality; Daphnia breed little below ~4–10 °C and suffer above 25 °C; rotifers
  carry a density-dependent loss to their invertebrate predators and Daphnia's interference. Grazing is type II on the
  cell's algae with the N + P returned at once (closed budgets). They die in anoxic water and in a toxic cyanobacterial scum.
  Rates are per real day (÷ `BIOE.DAY`). A year: ~240–260 g wet/m² of production (Bay of Quinte ~240).
- **Where they are**: the field is the animals' DAILY-MEAN place. Each column's oxic water shares them by its algae; each
  depth layer mixes across the lake about daily (`HMIX`), except that open-water Daphnia avoid the shore (`SHORE`, Siebeck
  1980).
- **Refuges** (daily means — the diel light cycle is cosmetic, one sim night is ~6 physiological days): DIEL VERTICAL
  MIGRATION (a share migrating that grows with the lake's fish biomass, where the column is deep enough, met by fish only at
  twilight, paying a growth cost); dense weeds hide some; fish see poorly in dim deep water and under snowy ice (`zooVis`).
  DVM protects zooplankton from the visual ADULT fish only (`zooFeed(..., dvm = false)` for larvae).
- **Resting eggs** (`env.zooEgg`, per column): shortening days and cool water turn the active zooplankton into ephippia;
  lengthening days and a warm bed hatch part of the bank each spring; a trace of arrivals keeps a floor. (The human pointed
  out mid-slice that in winter zooplankton are "like eggs".)
- **Feeding** (`env.zooFeed`, 3×3 cells, exposed density in µg dry/L): adults TYPE III (prey switching, K 25 µg/L) at up
  to Cmax × the appetite (O₂, guarding — `apt` scales the rates); copepods escape half their strikes; fry type II (K 30)
  taking rotifers and nauplii first, small cladocerans from first feeding, all by 1 cm. Brain sense: `env.zooBest`. Larval
  Cmax × 1.5 (`FRY.CMAX_LARVA`, Breck 1997). Adult carp and bullheads eat zooplankton only below `Lzoo`.
- **The bed's worms and scuds** (`env.benth`, config `BENTHOS`, per column): the non-insect zoobenthos (oligochaetes +
  amphipods) growing on the organic layer (SEDOM) — G 0.16/day so the whole zoobenthos produces ~110–125 g/m²/yr as in the
  Bay of Quinte — all of it staying in the lake; fish feed within ~1.5 m of the bed above a 3 g/m² refuge on a
  handling-limited type II (K_FISH 0.5 g/m²). `env.benthProd` is a diagnostic tally.
- **Bed foraging** (`env.benthBest` → `world.qBed`): a bottom forager senses the richest stretch of bed in sight that holds
  worms and scuds above the refuge (≥ `BENTHOS.SENSE_MIN`) under water it can breathe — the `food` target of sunfish, perch,
  bullheads and carp alongside larvae and zooplankton — so a fish whose patch is grazed bare moves on, and perch follow the
  profundal worms offshore once the autumn overturn reoxygenates them. Young bottom foragers past `benthL` (sunfish back
  from their limnetic phase, perch moving inshore, bullheads) live on the bed — larvae, worms and scuds, detritus — and go
  out after open-water zooplankton only when the bed in reach has none (Werner & Hall 1988).
- **Young fish** (`FRY`): larval mortality (`M_LARVA` ∝ 1/length, mostly predators the lake doesn't simulate) then juvenile
  mortality (`M_JUV` 0.035/day, Irwin et al. 2009), BOTH × Q10 3 about 20 °C (larval mortality rises with temperature,
  Pepin 1991: late-summer broods die fast, a small fingerling isn't culled at the summer rate under the ice); a school
  thinned below one fish keeps its last fish with probability n (no truncation losses). Bluegill fry leave the nest at
  swim-up (Beard 1982); bass egg → swim-up set to Carbine's ~5,650 fry per nest; carp recruitment held down by sunfish
  eating carp eggs and larvae (Silbernagel & Sorensen 2013). Piscivores work a school across their HUNTING ARENA
  (`FEED.HUNT_R` × reach, full rate within reach, less with distance), and every predator strike — at schools and at
  single fish — slows in cold water (`coldPerf`).
- **Visitors** (`sp.pop.visit {stay, gap}` days — pike 20/60, trout 30/60): wide-ranging fish pass through the 0.07-ha
  slice — each leaves after a stay (removed, not a death) and another arrives after a gap; exempt from the REFUGE floor. (A
  resident 3-kg pike ate ~25 of the slice's sunfish and perch a year.)
- **The community** (`species.js` `pop`): founders at realistic densities (~260 kg/ha: sunfish ~40 kg/ha, perch ~25,
  bullheads ~20, fathead minnows, 3 bass, 3 carp, visiting pike and trout).
- **UI**: the environment rows show zooplankton in µg/L with kg of each kind and of resting eggs, and the bed's worms and
  scuds; zooplankton are drawn as specks from the fields.
- **Gate**: the zooplankton-field block (type-II fry response, DVM, vision, grazing with closed budgets, anoxia, a realistic
  stock after a season), the worms-and-scuds block, visitors, and bed foraging (the sense picks the richest breathable bed;
  a sunfish steers for it; young sunfish settle on it; schools in the hunting arena); particle-era tests rewritten (`noZoo`).
- **Known limits**: the lake has no 0–3 m zone (`BASIN.SHELF_Y` 0.25 → a flat 3.6-m shelf), where real New England ponds
  grow most of their littoral food and nest their sunfish; no weed-dwelling invertebrates as such; carp are not typical of
  New England ponds. See SESSION_STATE for the multi-seed results.

---

## 2026-10-14 visible evolution: the trait history and fast-forward

- **The record** (`world.evo`, config `EVO`, `world.js` `_evoRecord`): every `EVO.SAMPLE` s (twice a month) one sample per
  species — n, mean generation, and the mean and SD of each of the 7 trait genes over the recruited fish (young-of-year
  schools show up once they recruit). Samples sit on the absolute clock grid (`floor(time / SAMPLE)`), so a resumed run
  samples exactly where the uninterrupted one does; past `EVO.MAX` (960) the older half is thinned to every other sample,
  so the record always spans the whole run at decreasing resolution for the distant past. Saved (`evo`) and validated on
  load (time-ordered, finite rows of the right length, known species); it never shapes the future.
- **The chart** (Evolution card, `ui.js` `_evoChart`): a gene selector (size, speed, tolerance, fins, eyes, body, brain —
  tooltips say what each gene sets), each species' mean ±1 SD over the years against the 1.0 founder baseline; click a
  species row to pick it out (bold line and band, the rest dimmed) and read now vs the first sample in the note.
  Redrawn only when a sample lands, the selection changes or the box resizes.
- **Fast-forward** (Controls → Skip ahead: 1 month / season / 1 year / 5 years; `src/ffworker.js`, `ui.fastForward`): a
  module Worker loads the main thread's save and steps it flat out with no rendering, posting progress (date, %, steps/s,
  time left) about four times a second; "stop here" jumps to wherever it got. The main loop is paused and pause/speed are
  locked meanwhile. Exact by construction: the worker's result is byte-identical to the same steps on the main thread
  (checked in Chrome on 8.1 MB of state; smoke runs the real worker module behind a stub). Speed is the sim's own
  (~100–130 steps/s on a free core ≈ 4× real time; a year ≈ 7–9 min) — evolution over decades is a leave-it-running job.

---

## 2026-10-14 the bed's organic layer: benthic production that follows the lake's productivity

Save format **v28** (`env.sedOM`); v29 adds the evolution history.

- **Sediment organic matter** (`env.sedOM`, config `SEDOM`, `environment.js` `sedimentOM`): grams of labile organic
  detritus on the bed of each field column. In: a share `SEDOM.SINK` (0.25) of the algae (green, diatoms, cyano) that die
  in the column above settles onto its bed (`SEDOM.PP_G` g per unit of the algal fields — calibrated so the default lake
  lays down ~750 g wet/m²/yr, a quarter of a mesotrophic lake's production); BENTHIC ALGAE (periphyton, epipelon) growing on
  a lit bed (`SEDOM.PERI_G` × the light reaching it × Q10 — ~600 g wet/m²/yr on the default lake's shallows, ~nothing on
  the dark deep floor, and less as the water turns murky: the clarity → littoral-production link); plant litter (`PLANT.LITTER_G` g per px of
  height a plant sheds in senescence or loses dying); expired detritus particles; larval patches killed by anoxia. Out:
  first-order bacterial decomposition (plankton detritus 0.144/day at 20 °C, Q10 1.94; × `SEDOM.ANOX` on an anoxic bed),
  the larvae, and sifting bottom feeders. It is carbon/energy only: the N and P of the dying algae go where they always
  went (water, DOM, the sediment-P store), so the closed N/P budgets are untouched; the O₂ cost of decomposition stays in
  the microbial loop (DOM) and the fixed sediment demand `ENV.O2_SED`. Like real lakes, the deep basin gathers the most (it
  receives a whole water column's algae and decomposes slowly when anoxic) while the weedy shallows live on plant litter.
- **Larvae grow on it** (`INSECT`, `world.js` larvae step): a patch's grams grow at `INSECT.GROW` (0.3/day at the 25 °C
  optimum) × warmth × Monod in its column's layer (`K_SOM`) × (1 − m/`PREY.LARVA_G`), debiting the layer at 1/`YIELD`
  (0.15 g of larvae per g of detritus, wet), and shrink by respiration (`RESP`) when food is short; they die off on an anoxic
  bottom (`O2_MIN`, `ANOX_DEATH` × Q10 2 — they outlast weeks of cold anoxia). Development follows real chironomid timing (26 days to emerge at 20 °C, ~40 at 15 °C;
  *Chironomus decorus*) in the water each patch lives in (so the profundal larvae of the cold summer hypolimnion develop
  slowly), and an emerging patch's adults keep `EMERGE_M` of its mass. New patches start small
  (`LARVA_M0`) — from the eggs of uneaten adults and a warm-season background that settles where the bed has food and
  O₂. `LARVA_CAP` (400 × area) is only a computing bound: at 240 the patch count sat on it all summer; now food sets
  the count (it falls to ~1,400–1,700 patches in a lean July). Before: patches were refilled at full size at ~9,600 a month, gated on the count of fresh detritus particles (which
  the bottom feeders kept near zero) — benthic food was effectively unlimited and blind to the lake's productivity.
- **A refuge** (`INSECT.REFUGE_M`): the first gram of every patch is burrowed or cased, out of reach of fish, fry,
  dragonfly nymphs and turtles (`larvaFree`, `_biteLarva`; nymphs and turtles now take a bite, not a whole patch). Fish
  can cut a patch by ~2/3 at most; the burrowed stock regrows it. Without it the fish kept every patch on its floor.
  Young-of-year are the exception: they pick the small early instars off the mud surface (`INSECT.REFUGE_FRY` 0.05 g,
  `larvaFreeFry`).
- **Bottom-feeding fry** (`sp.benthL`, default `FRY.BENTH_L` 2.5 cm): young bullheads, guarded in a ball over the bottom,
  feed there from swim-up (`benthL` 1.2 cm). Diagnosed with `verify/fryfate.mjs` (hatched vs alive vs losses by cause):
  at the generic 2.5 cm ~85 % of the bullhead fry starved by July (feeding p 0.2–0.3) and 0–1 recruited in two years —
  in the old code too; with it they feed at p ~0.4, ~140 of a clutch reach July and ~10 recruit a year.
- **The bluegills' limnetic phase** (`sp.pelagicFry` 2.5 cm, `FRY.PELAGIC_X`/`PELAGIC_D`): once no guardian holds them,
  bluegill fry keep to the open-water epilimnion until ~2.5 cm, then return to the weeds (Werner 1967, 1969) — the
  lake's ~250k young sunfish spread over its open-water zooplankton instead of crowding the shallows (young sunfish reach
  ~1.7–2.3 cm by October with it, ~1.2–1.8 without; Michigan age-0 bluegill ~2.5–4).
- **Known gap — the young-of-year food bottleneck** (diagnosed 2026-10-14, `verify/fryfate.mjs`, `preddiag.mjs`): in June
  the zooplankton is grazed to ~600 of its ~2,000 swarms; fish + ~300k fry eat ~1.3 kg/day, about all the field produces
  (real lakes this size ~2–7 kg/day). Bass fry (FB4 LMB maintenance ~0.32 g/g/day, a third of their Cmax at 1–2 cm) starve
  to ~0 every year in old and new code alike; letting guarded schools roam or widening a school's reach didn't help. Fix
  = a zooplankton production model (biomass growth by temperature and food, the cap a computing bound) — next slice.
- **Snails graze it** (`SNAIL`, `world.js` snail block): pond snails scrape the bed's algae-and-detritus film
  (`SNAIL.GRAZE` ≈ 1 mg AFDW a day each × Q10 2) instead of the phyto field, live about a year (`SNAIL.M` 1.2/yr;
  *Physa gyrina* 12–13 months in the field) and breed in warm water (per-capita `SNAIL.R` 6/yr ramped over `R_T`
  12–20 °C, the young settling where the layer can feed them, logistic toward `CAP` 900 × area ≈ 3 g/m²). A weed REFUGE
  (`SNAIL.REFUGE` 0.12 × CAP, the first in array order — `exposedSnail`) keeps a stock out of reach of fish, crayfish and
  turtles, which otherwise strip the bed (as pumpkinseed and crayfish do in real lakes). They keep to the lit littoral
  bed (`MAX_DEPTH` 0.5 H). Before: a 34-day life on the phyto field near the bed at ~0.1 g/m².
- **Bottom feeders sift it** (`diet.detritus`: carp, bullhead): with no particle in reach, a fish at the bed takes up
  to `SEDOM.SIFT` × its gut capacity a second from the layer — a poor food (979 J/g, 35 % digestible). On a lean bed they
  turn to snails and zooplankton too (bullhead + carp diets widened to their real omnivory, Scott & Crossman 1973 — on
  detritus alone the bullheads slowly starved).
- Gate: decomposition (rate, warm/cold, anoxic), settling, benthic algae (lit shallows vs dark deep, clear vs murky),
  larval growth on it and starvation without it, sifting, and the save round-trip; larval development follows the
  water's warmth; the dt-independence check now grazes patches down to their refuge.

---

## 2026-10-13 bioenergetics: real bodies, published physiology, young-of-year (supersedes everything below)

Save format **v27**. Every number below is from a published source (cited inline in `species.js` `BIO` and `config.js`
`BIOE`/`PREY`/`FRY`); values not yet checked against a primary source are marked "(prior)" in the code.

- **The Wisconsin model** (`src/bioenergetics.js`, pure): Fish Bioenergetics 4.0 (Deslauriers et al. 2017) ported line by
  line from its R source — consumption CEQ 1–4 (Kitchell, Thornton–Lessem, Bevelhimer), respiration REQ 1/2 with the
  activity term, egestion/excretion EGEQ/EXEQ 1–4, SDA on (C − F), predator energy density PREDEDEQ 1–3, OXYCAL 13,560
  J/g O₂. The gate checks it against reference values from FB4's own code for 7 species (`f(T)`, `Cmax`, `R`, a full budget).
- **Parameters** (`species.js` `BIO`): FB4's official sets — fathead minnow (Duffy 1998), bluegill adult + juvenile
  (Kitchell et al. 1974; no pumpkinseed model exists), yellow perch adult + juvenile (Kitchell et al. 1977), rainbow trout
  (Railsback & Rose 1999), brown bullhead (Hartman et al. 2017; there is no channel-catfish set in FB4), largemouth bass (Rice
  et al. 1983), northern pike (Bevelhimer et al. 1985). **Common carp has no published Wisconsin model**: a composite from
  carp lab data (Beamish 1964 standard metabolism; Chakraborty 1992 energy budget) on FB4's bighead-carp temperature curve.
- **The fish's body** (`world.js` makeAgent/step): total length `L` (cm, never shrinks), wet mass `W` (g), condition
  `K = W / Ws(L)` (the published standard-weight equations), sex, maturity, gonads `gon` (g), gut contents `gut`/`gutE`.
  `energy` is now a derived reserve (K 0.6 → 0, K 1 → 1) for the brain and UI. Behaviour scales with length: speed ∝ L^0.6
  (Cano-Barbacil et al. 2020 Ucrit), reach ∝ L^0.7, vision ∝ L^0.3.
- **Eating and digesting**: every food item is real grams of prey with its measured energy density (J/g wet: Cummins &
  Wuycheck 1971, the Hermann et al. 2025 database, Nelson & Kruuk 1997 …) and digestibility (snail shells, crayfish
  exoskeleton, plants and detritus are poor food). The stomach empties exponentially at the measured gastric-evacuation
  rate (He & Wurtsbaugh 1993, × the species' own speed: pike ~2 days a meal, sunfish ~1) but never faster than FB4's Cmax —
  and never slower than a FULL stomach must empty to pass Cmax (Cmax is measured ad libitum, stomach and all; small fish on
  small prey turn their stomachs over faster than the adult-meal rates) — so a fish can't exceed its published maximum
  ration, and its achieved fraction `p` (a diagnostic `pAvg`) is set by the food it finds. Hunger is the gut's emptiness.
  A forager that has just fed in a patch STAYS in it (patch residence, `FEED.RESIDE`: the marginal-value rule) and keeps
  picking as its stomach empties — one behavioural second is ~5 h, so a fish that cruised off after every mouthful would
  starve in a lake full of food. Small invertebrates are PATCHES (a zooplankton swarm, a patch of midge
  larvae: `PREY.*_G` grams, reached within `PREY.PATCH_R`) that a small fish crops and a big one clears — the one
  calibrated quantity (it stands in for the slice of lake the 2-D world represents). Half the new insect-larva patches live
  up the macrophyte stems (`INSECT.EPIPHYTE` — the plant-dwelling invertebrates that feed bluegill and young perch), and a
  LITTORAL zooplankton (chydorids, cyclopoids among the weeds, fed by periphyton — `PLANKTON.LITTORAL_RATE` × plant cover)
  keeps breeding through the open water's clear-water crash: the food young fish in the weed beds live on.
- **Diet choice** (optimal foraging): a fish takes the most profitable food in reach first — fish, young-of-year,
  zooplankton, insects, nymphs, crayfish, larvae, snails — and the POOR foods (detritus ~340 J/g digestible, algae ~730,
  plants ~540) only as a hungry fish's filler when it found nothing better that step, and only up to `FEED.POOR_GUT` of its
  gut (a gut kept full of weed would starve it at full ration). Every forager has an innate orienting reflex toward the food
  it senses (`innate.forage`, scaled by hunger; the piscivores' `pursuit`), and the senses point at animal food first —
  real fish are born knowing how to feed, and with real life histories a lineage can't wait generations for its brains to
  discover it.
- **Growth**: the FB4 balance each step; a fish heavier than standard puts the surplus into length (inSTREAM's rule), so a
  starving fish thins but never shrinks. A mature fish routes half its surplus into gonads until ripe (GSI: perch ♀ 20 %,
  trout ♀ 20 %, pike ♂ 2.5 % …; fathead minnows `reproAlloc` 0.8 — a batch every ~4 days), carried over winter, so pike and
  perch spawn on gonads built the autumn before. FB4's juvenile sets (bluegill, perch — fit to age-0 fish) apply in the
  first year; yearlings use the adult set. YOY bullheads borrow FB4's largemouth-bass set (FB4's brown bullhead, fit to
  juveniles and adults, predicts < 2 %/day for a 1–4-cm fish where real ones grow ~5 %/day — a stated assumption).
- **Activity cost**: respiration × e^(`BIOE.SWIM`·(u − u_routine)) on the fish's ~1-day mean speed u (saved `ua`), never
  below FB4's routine rate (`SWIM` 2.0: ~4× routine at the critical speed, Brett 1964). One behavioural second is ~5 h of
  physiology, so the day's mean — not a momentary dash — is what metabolism sees.
- **Death** (hazards, cause tallied in `stats.died`): starvation (logistic in K: 50 %/day at K 0.55, 99 % at 0.68 — K is
  W / the 75th-percentile standard weight, so a lean fish at 0.8 is thin, not dying; below K 0.9 a fish turns its metabolism
  down — up to 30 % at K 0.55, as food-deprived fish do, Méndez & Wieser 1993 — so a lean summer stunts a crowded
  population rather than starving it), heat above the species' UILT and
  hypoxia below its acute lethal O₂ (EPA 1986; Moss & Scott 1961 …, rising 5.5 %/°C) — both judged on the O₂ and temperature
  EXPERIENCED over ~2 h (`BIOE.EXPOSE_TAU`), the share `BIOE.M_OTHER` of each species' published natural mortality that the
  lake doesn't simulate (disease, birds, angling: M = 5.4/tmax, Hamel & Cope 2022; bass and pike from field studies), old
  age (real lifespans). A fish in water below its critical O₂ CLIMBS out of it (slowly when barely hypoxic, at a burst from
  near-lethal water — the escape overrides the cruise norm, diel rest and the cold), and it never swims down into lethal
  water.
- **Gape**: prey body depth (length × the species' depth ratio × the body gene) must fit the predator's mouth (length ×
  gape ratio: bass 0.12, pike ≈ its own depth — Lawrence 1958, Hill et al. 2004, Nilsson & Brönmark 2000); a lone prey under
  7 % of the predator's length is ignored (a 65-cm pike's median prey is ~7 cm: Gaeta et al. 2018), a dense school of young
  fish down to half that (`FEED.SCHOOL_MIN`). Big piscivores (past ~3× their piscivory length: adult bass, pike) no longer
  graze insects and larvae — they live on fish and crayfish. Piscivory starts at a species length (`Lpisc`: pike 4 cm,
  bass 5, perch 14, trout 25); every fish eats zooplankton below `Lzoo` (pike until 5 cm).
- **Hunting at compressed time** (`takePrey`): one behavioural second is ~5 h of a predator's day, in which a real bass or
  pike makes many approaches — one lunge per encounter fed bass and pike a twentieth of their ration in a lake full of
  prey. So a piscivore with catchable fish in its hunting arena (`FEED.HUNT_R` × its strike reach, ~ a body length)
  strikes at a RATE (`FEED.ATTACK` per s × water clarity), spread over those fish by closeness; each strike connects with
  its `capture` (pike 0.6 … perch 0.15) × the prey species' `vuln` (fathead 1, bluegill 0.35 — Wahl & Stein 1988) × the
  SIZE REFUGE (1 − prey depth / gape)^`FEED.SIZE_SEL`: capture and handling fail more and more as the prey nears the gape
  (Miller et al. 1988 review; pike take the smaller fish of each species, Nilsson & Brönmark 2000; perch prey far below
  their gape, Paszkowski & Tonn 1994; median prey 10–20 % of predator length, Gaeta et al. 2018). Each prey's reach is cut
  by cover, by its own species' shoal (predator confusion), by freezing (HIDE) and by a guardian on station, and extended
  by a committed STRIKE lunge; a miss alarms the prey and costs the predator `FEED.MISS_CD`. Kills and misses are thinned
  Poisson draws on the seeded RNG; behaviour (search, pursuit, flight, shoaling, cover) decides whether there is prey in
  the arena at all. A big piscivore feeding at schools of young fish works the school of young FISH it is in
  (`FEED.SCHOOL_MIN` up), not larvae nearer by (those are for the planktivores and for young piscivores under 3× their
  piscivory length). (Tried and reverted: school bouts across the whole hunting arena at 4× the rate — the perch and other
  piscivores ate ~5× more young-of-year, recruitment failed and the lake thinned year on year, and the bass gained
  nothing.) Without the size refuge the rate-based
  hunting let the lake's pike eat 10–16 kg of adult perch and bluegill in half a year and the community collapsed; with
  it the adults mostly outgrow the risk and the predators live on the small fish and the young-of-year, as real ones do.
  Adult BASS were short of food in early summer (≈5–15 % of Cmax: the young-of-year are still 1–2-cm larvae and fathead
  adults thin out) until the crayfish stock and the bass's littoral habitat were made real (below): now summer p ≈ 0.2–0.6
  with crayfish 55–90 % of the diet, as in Wisconsin bass studies.
- **Reproduction**: sexes (opposite-sex pairs only; the male guards the nest, at a metabolic and feeding cost —
  `BROOD.GUARD_*`); eggs from the published length–fecundity regressions (perch: Schneider 1984; bass: Laarman & Schneider
  1985; pike: Priegel & Krohn 1975 …) × the female's ripeness; maturity by length AND age (the SIZE gene is now the
  maturation length — a heritable life-history trait). Eggs go in the LITTORAL wherever the pair met (`SPAWN.SHALLOWS`:
  nests on the shallow shelf's bed, scattered eggs over the shallows — never the deep, oxygen-poor bed); a guarded brood
  forages in a cloud within the guard radius of its nest. A ripe fish in season spawns whatever the crowd — density acts on the
  YOUNG (food, predation, cannibalism, then the agent budget at recruitment), not on the adults' readiness. Spawnings are
  counted per species (`stats.spawns`); a new generation exists from hatching (`maxGen`).
- **Young-of-year** (`world.fry`, `FRY`) — SUPER-INDIVIDUALS (Scheffer et al. 1995): a spawning's eggs that survive to
  swim-up (`sHatch`) become schools, each one record of `n` identical fish run on the same FB4 equations (updated every
  `FRY.TICK` s, staggered) and foraging no better than the same fish alone (`FRY.EAT_R`). They eat zooplankton first, then (from `FRY.BENTH_L`) the bed's and weeds' insect larvae and
  detritus as their species does, the young piscivores (pike, bass) other schools — cannibalism included; they head for the
  food they find, climb out of hypoxic water, drop out of near-lethal heat; they die at the larval critical-period rate
  (`FRY.M_LARVA`, fading by ~3 cm), the agents' size-scaled share of M, starvation, heat and hypoxia; they breathe the
  lake's O₂. They are FOOD for everything whose mouth they fit: planktivores pick off larvae (`FRY.CATCH`), a piscivore
  works a school in feeding bouts (`FRY.ATTACK` × capture × vuln × the size refuge, a type-II response in the school's
  size `FRY.N_HALF`), weeds
  shelter them, a guarded nest protects them. Through summer, autumn and winter they are the lake's main forage — as
  young-of-year are in real lakes. Survivors RECRUIT as followed individuals on reaching the species' recruit length `L0`
  (fast growers: fatheads, young bass and pike) or as yearlings the next spring: one agent per `FRY.N_PER_AGENT`, within the
  species' agent budget (pop.max). When the lake's or a species' school slots are full (`CAP`, `SP_SHARE`) a new spawning
  joins its species' youngest school (`MERGE_DAYS`; the genome kept or replaced in proportion to the fish each brings).
- **Community**: founders follow a STABLE AGE STRUCTURE (ages ≥ 1 yr from e^(−M·age), so mostly young fish), the first two
  of each species an adult female + male; adults start ripe (the lake opens in late spring). Founder numbers follow real
  ratios — hundreds of forage fish per adult bass. A slice of lake this size (~0.07 ha) holds about one pike at real
  densities, so pike (and trout) have a lower refuge/rescue (`pop.refuge`, `pop.rescue`): one in view, more only home-bred.
- **Crayfish** (`CRAYFISH`): the lake's big benthic omnivores and the largemouth bass's staple (55 % by weight of a
  Wisconsin flowage's bass diet April–October; 80 % of bass prey in June in another lake). Each is one ~12-g animal; the
  stock follows a seasonal logistic (`CRAYFISH.R` per capita a year, recruitment ramping in with warm water `R_T`, natural
  mortality `M` ~0.8/yr) toward a shelter-limited capacity of ~9 g/m² — Michigan lakes stood at 4.6–21 g/m² and produced
  ~1–1.5× that a year (Momot & Gowing 1977). They live on the littoral and sublittoral bed (`CRAYFISH.MAX_DEPTH`, ~8 m —
  not the summer-hypoxic profundal), shelter by day (`SHELTER_DAY`: they forage at night and hide from fish), lie dormant
  in their burrows in cold water (`ACT_T`), are too wide (`WIDTH` 2.2 cm) for a small perch's mouth, are SHELTER-LIMITED
  (`SHELTER`: burrows and stones for 40 % of the capacity, held by the oldest — bigger crayfish win shelter contests, and
  the unsheltered, mostly the young, take the predation; so the stock can't be eaten below its shelter, as real ones
  persist under heavy fish predation — Stein & Magnuson 1976, Hill & Lodge 1994; without it the stock eroded to a handful in
  two years), and are hunted
  across a fish's hunting arena; a strike lands with the species' own skill (`diet.cray`: bass 0.25, bullheads 0.15, perch
  0.08, pike 0.05 — bass are the crayfish specialists, pike fish specialists; priors ranked by the diet studies), less in
  cover. (Before: recruitment was gated on the count of fresh detritus particles, which the bottom feeders keep near zero,
  a 0.004/s turnover gave crayfish a ~25-day life, and they lived across the deep floor — the stock sat at 1–10 % of a real
  one, out of the bass's reach. A first cut with the shared capture × 0.5 let the two pike eat ~130 crayfish in a few
  weeks.) Crayfish take ~one snail a day.
- **Largemouth bass are littoral fish** (`innate.littoral`, `homeDepth` 0.8): low in the water over the shelf and the
  drop-off, among the weeds and near the bottom, turning back when they find themselves out over the open basin (outside
  the spawning migration). Before, they cruised mid-water over the deep basin 57–78 % of the time and almost never came
  within reach of the bed — or of the crayfish that make up half of a real bass's diet.
- **Render/UI**: fish are drawn at their true length (0.79 px/cm, a gentle floor under 10 cm); young-of-year schools are
  shimmering clouds — dashes for larvae, little fish once they're a few px long; the fish panel shows length, mass,
  condition, sex, maturity and how well it is feeding.

---

## 2026-10-13 polish: smooth motion, true proportions, plants on the bed

- **Smooth motion.** The realism work made a step ~2× slower (~9 ms at ~600 fish + wildlife); at the browser's old 60 Hz
  step that overran frames and the loop caught up in bursts of steps — every fish jumped together. Now the browser steps
  at 30 Hz like the headless gate (interpolated every frame), never more than 2 steps a frame (a slow frame slows the lake
  for a moment instead), fish brains decide at 30 Hz (`BRAIN.DECIDE_HZ`, real reaction ≈ 33 ms; `a.dAcc` saved), fish see
  zooplankton only a few body lengths off (`PLANKTON.SIGHT`), the shoal query runs once per fish per step, and
  burst-and-coast is gentler (`MOTION.COAST_DEPTH` 0.35).
- **True proportions.** Body depth ÷ length now matches each real species (minnow .27, sunfish .50, perch .29, trout .26,
  catfish .26, carp .34, bass .31, pike .17 — they were 30–50 % too deep: puffer-looking sunfish and carp). Wildlife is drawn
  at the lake's scale (~0.8 px/cm: a 70 cm pike ≈ 55 px): nymphs and tadpoles shrank, turtles doubled.
- **Plants and bottom life follow the bed.** Weed-bed blades, reed stems and chara tufts each root on the bed under their
  own x (blades rooted at the clump centre's depth stood inside the bank on the drop-off); logs rest on the bed along its
  slope; crayfish and nymphs lie along it; nymphs sit on the bottom.

## 2026-10-13 more life (supersedes everything below)

Save format **v26**.
- **Two kinds of zooplankton** (`plankton[].k`, `PLANKTON.DAPH_*`, `COPE_*`): Daphnia (big filter-feeders: graze hard → the
  late-spring clear-water phase; the richest prey; can't tolerate cyanobacteria; barely breed in cold water) and copepods
  (small, evasive — `COPE_ESCAPE` of strikes miss — cold-tolerant, they carry the zooplankton through winter). Daphnia's share
  of births (`world.daphShare`) follows temperature and collapses in a cyanobacterial bloom. Fish eat them via `_eatZoo`.
- **Dragonflies** (`world.nymphs`, `world.dflies`, `ODONATA`): predatory nymphs in the weedy shallows ambush insect larvae,
  tadpoles, fish fry (≤ `FRY_MAX`) and zooplankton; they take 1–2 years to mature and emerge on warm, sunny summer days as
  adults that dart low over the water, snatch emerged insects and lay eggs over the shallows. Fish find the cryptic nymphs
  only now and then (`CRYPTIC`).
- **Frogs** (`world.herps` k 0 tadpole / 1 frog, `FROG`): tadpoles graze algae in the shallows and metamorphose over the
  summer (late ones overwinter); frogs float at the surface over the shallows, take emerged insects (plus shore foraging),
  dive from a predator that could swallow them, spawn in spring at 10–20 °C, and hibernate on the bottom under the ice.
- **Painted turtles** (`world.herps` k 2, `TURTLE`): forage on the bottom (snails, larvae, carrion/plant debris), surface to
  breathe and bask (longer in sun), hibernate in the mud, live ~30 years; hatchlings reach the lake in late summer.
- **Fish eat them** when they fit the gape (`canEatHerp`, mass-scaled meal + digestion); larva-eaters take small tadpoles.
- **Rainbow trout** (`SP.trout`): cold-water (optimum 14 °C, stressed above ~20), O₂-hungry; spring stream spawner.
- **Behavioural thermoregulation** (world.js innate block): a fish too warm at its home depth seeks the shallowest cooler
  water below — trout and pike drop to the thermocline in summer — and the O₂ check then lifts it out of anoxic water: the
  summer temperature–oxygen squeeze. A heat-stressed fish pulls harder toward the cool depth, and one over the warm shallow
  shelf (no cool water beneath it) heads offshore. A/B in a well-oxygenated summer lake: trout live ~2 °C cooler than the same
  trout indifferent to heat.
- **Fecundity**: the very fecund sunfish, perch, catfish and carp spawn bigger clutches of cheaper young (lower `reproCost` /
  `childEnergy`; clutch max 12 / 14 / 12 / 16) — real fry are tiny, and recruitment rests on numbers.
- **Dragonflies fly in** from other waters in the flight season (`ODONATA.VISIT`), so a local crash isn't permanent.
- **Sparse spawners find each other** (`SPAWN.RARE`, `CUE_R`): in a rare species an in-season, breeding-ready adult homes in
  on the nearest ready mate over a long range (chemical/sound cues), and immigrants arrive mostly up the inflow stream, so a
  crashed population can pair up and recover instead of idling at the immigration floor.
- **Cold-water activity** (`SP.coldPerf`): trout, pike and perch keep more of their activity near 0 °C than warm-water fish.
- **Bottom-huggers** no longer sink into water too low in O₂ for them (catfish lost most of their energy to hypoxia).
- UI: environment rows for zooplankton, dragonflies, frogs, turtles; legend entries for frog, turtle, dragonfly.
- Tests: headless "more life" block (zooplankton kinds and escape, nymph predation/emergence/eggs, tadpole metamorphosis,
  frog hibernation/spawning/diving, turtle hibernation and breathing, fish eating tadpoles, trout thermoregulation, v26
  round-trip).

## 2026-10-12 realism overhaul

Goal (human): behave as much like a real temperate lake as possible, with evolution shown a bit faster than in nature. Save format is now **v25**.

### Climate, ice and the water column (`environment.js`, config `SEASON`, `ICE`, `THERMAL`, `ENV`)
- **Calendar.** Year-fraction 0 = March 1. Surface temperature T = `TEMP_BASE` 12.5 + `TEMP_AMP` 13 · sin(2π(yf − 0.17)): ~0 °C in January, ~25 °C around Aug 1. Day length and noon sun follow the solstice (`seasonalSun`). A new lake opens mid-May (`SEASON.START_YF`) with that season's thermal state (`env.primeSeason`); `world.setDate(yf)` jumps a lake to any date.
- **Stratification** comes from the surface-to-hypolimnion temperature difference (hypolimnion never below 4 °C), so the lake stratifies in summer and turns over in spring and autumn (a dimictic lake).
- **Ice** (`env.ice`) forms when the surface nears 0 °C and melts above `ICE.MELT_T`. It cuts `ICE.LIGHT_CUT` of the light, stops surface re-aeration, wind, storm-stirred sediment and the wind-driven overturn, and holds the column calm (`ICE.STRAT`).
- **Biology follows temperature (Q10)**: fish metabolism (`ENV.METAB_Q10`), algae (`PHYTO.Q10`), nitrification and denitrification (`NCYCLE.Q10`), bacteria and sediment/water-column O₂ demand (`MICROBE.Q10`), plant respiration (`PLANT.RESP_Q10`). Plants go dormant below `PLANT.DORMANT_T` instead of starving.
- **Under-ice oxygen** behaves like a real lake: the deep water runs out late in winter (sediment demand) while the upper water keeps its O₂ from the inflow and under-ice photosynthesis. The two algal-physiology rules that make this work:
  - **Blackman photosynthesis** (`photoRate`): light-limited photosynthesis barely depends on temperature; only the light-saturated maximum follows the Q10. Dim under-ice light still makes O₂.
  - **Dark survival** (`algaeRespAt`, `PHYTO.DARK_RESP`, `RESP_IK`): algae in a dark light climate (deep water, snowy ice) cut respiration to ~15 %. Night inside the photic zone still respires fully.
- **Inflow** enters as a plume (`FLOW.PLUME_*`) of well-aerated water (`FLOW.O2_MIX`).

### Producers (`environment.js`, config `DIATOM`, `PHYTO`, `CYANO`)
- **Diatoms** (`env.diatom`, `diatoms()`): cold-water algae (best ~7 °C) that bloom in the bright, freshly mixed spring and autumn water and sink out once the lake stratifies. Same Redfield N/P bookkeeping as the green algae, included in the P/N inventories.
- **Seasonal succession** that emerges: spring diatom bloom → May clear-water phase → summer green algae → late-summer cyanobacteria (warm, `CYANO.TEMP_OPT` 25, N-fixing) → autumn diatoms.
- **Plants** spread mostly by runners (`PLANT.CLONAL`, `RUNNER`): clonal ramets near an established plant of the same form; the rest are seeds.

### Fish life (`world.js`, `species.js`, config `FEED`, `SPAWN`, `BROOD`, `IMMIGRATION`)
- **Life history in years** (`species.js` `yr()`, mature / max): minnow 0.5 / 2.5 yr, sunfish and perch 1 / 6, bass 1.5 / 8, pike 1.5 / 9, catfish 2 / 10, carp 2 / 12. A new lake starts with a mixed age structure. `TIME.LIFE_SCALE` is retired.
- **Energetics.** Starvation time scales with size^0.75; juvenile metabolism ∝ mass^0.75. Fish only feed while they have room (`FEED.SATIATE`), and piscivores only hunt below `FEED.HUNT_BELOW`.
- **Digestion** (`a.dg`, `FEED.MEAL_K`, `DIGEST`): a fish meal's energy and its digestion time both scale with the prey's mass relative to the predator's, faster in warm water. A digesting predator takes no new fish.
- **Gape and juvenile size.** A predator can swallow prey up to 62 % of its length (`core.canEat`); young fish are much smaller than adults (`effSize` = size · (0.3 + 0.7·grow)), so adults can cannibalise young-of-year after the brief `BROOD.GRACE`.
- **Spawning is set off by water temperature** (`SP.spawnT` window, `world.js spawnFactor`): pike just after ice-out (4–11 °C), perch (7–12), bass (15–21), minnow (16–26) and carp (17–24), sunfish (20–28) and catfish (21–28); minnows and sunfish spawn repeatedly through summer. There's no spawning on the autumn cooling path (`SPAWN.SEASON_END`) or under ice. Reproduction is sexual only (budding removed). Founders start with no mating cooldown.
- **Nest guarding** (`sp.nestGuard`, `a.nt/nx/ny`, fry `a.ni`): a bass, sunfish or catfish guardian holds station over the nest and turns on intruders; fry inside the zone are hard to take (`BROOD.PROTECT`, `_guardCut`). Unguarded young shelter in cover (the nursery reflex), and all fry eat zooplankton first (`FEED.FRY_GROW`).
- **Oxygen-limited habitat:** fish move up or toward the shelf when their water runs low on O₂.
- **Gene flow** (`world.genePool`, `IMMIGRATION.POOL_N`, `EMIGRATE`): immigrants carry genomes from a regional pool of connected waters, not copies of the lake's best fish; emigrating adults slowly feed the pool. Immigration still only rescues rare species (`RESCUE_N`, `REFUGE`).
- **Cold foraging.** A cold fish handles food more slowly (`coldPerf`). The fractional handling remainder is saved (`fa`).

### New life
- **Yellow perch** (`SP.perch`, trophic `mesopredator`): a schooling mid-level predator of the open water and weed edge; eats small fish, insects and larvae; spawns in early spring; vertical-bar art.
- **Loon** (`world.birds`, `BIRD`, `_stepBirds`, render `_drawBirds`): a visiting diving bird in the open-water season. It rests on the surface, dives in daylight, chases and catches fish up to `BIRD.PREY_MAX`, surfaces to swallow, and leaves when sated. Fish sense a diving loon as a threat.

### UI
- Environment panel: ice cover, diatoms, loons. Legend: the loon visitor.

### Tests
- `test/headless.mjs` "realism" block: climate, ice formation, melt and sealing, under-ice O₂ profile, Blackman photosynthesis, dark survival, diatom bloom and sinking, nest guarding, digestion, gene flow, the loon, perch, founders. Seasonal spawning checks use temperature windows.

---

## 2026-10-11 audit-fix changes (supersede the narrative below)

Every finding is listed in `AUDIT.md` with its status. Save format is now **v24**.

### Persistence
- **Exact resume.** A loaded lake continues byte-for-byte like the original; the gate tests this.
- **What v24 saves:**
  - the RNG state (`core.js getRandState/setRandState`);
  - a per-world id counter (`world._nextId`, saved as `nid`);
  - per agent: mating cooldown, steering smoothing, `velHeading`, stroke, last actions, and the plastic W2 block of `lw`;
  - corpses;
  - larva, snail and crayfish positions and phases;
  - plant `la` (light running mean) and `nu` (nutrient pool);
  - detritus `n`;
  - env: the cached means, `tempHypo`/`tempDiel`, and grid dimensions.
- **Validated, atomic load.** `parseSave` builds everything into local variables first. It throws a descriptive Error before touching the world if a file is unusable.
  - Unknown species are skipped and counted.
  - Every number is checked for finiteness and range.
  - Lists are capped.
  - Environment fields are resampled when the saved grid size differs.
  - `load()` returns a report (also kept on `world.lastLoad`).
- **Brain migration by save era.** `species.js BRAIN_ERAS` records every historical input/output layout. Old brains are remapped **by label**, through `core.js remapGenome`. The old positional migration had put hunger/fear weights on the compass, flow and prey-size inputs.
- **Caps.** `addAgent`, `makeFish` and `seedFromChampions` respect `GLOBAL_MAX`. `addAgent` and `makeFish` return `null` at the cap; `seedFromChampions` returns `{added, reseeded}`.

### Fish and plant ecology
- **No newborn cannibalism energy pump.** `BROOD.GRACE` protects same-species young for a few seconds, and broods are placed in a ring around the parents. Threat sensing is symmetric (`canPrey`), so juveniles sense cannibal adults of their own kind.
- **Asexual budding pays at least the child's energy.**
- **Feeding is per second, not per step.** This covers `FEED.HANDLE` item handling, `PLANKTON.FALLBACK_GRAZE`/s and `PLANT.BITE_RATE` px/s, so headless dt=1/30 matches the browser's 1/60.
- **Plant starvation** is judged on a per-plant running mean of light (`p.lightAvg`, τ = `PLANT.LIGHT_TAU_DAYS`), against a re-calibrated `MACRO.lightMin`. Seeding is light-gated, so beds survive night and winter.
- **Seed-parent search ignores turbidity** (`nearestPlant`).
- **Plants carry an N+P pool** (`p.nut`). Uptake is stoichiometric, and shedding, grazing and death return the plant's proportional share.
- **New innate reflexes (2026-10-12).** Each is a weighted nudge the brain can override, and each is tested A/B against an identical world in `headless.mjs`.
  - **Pursuit** (`innate.pursuit`, bass and pike): turn toward sensed prey.
  - **Hypoxia avoidance** (all species, `ENV.HYPOXIA_AVOID`): water below `o2Crit` × the margin retargets the depth reflex upward.
  - **Spawning aggregation** (`innate.spawnGround`, bass, pike, carp and catfish; `SPAWN.AGG_*`, `GROUND_X`): in season, breeding-ready adults migrate to the littoral spawning ground on their side of the lake.
- **Apex energetics.** Bass and pike were starving. Their maintenance metabolism now sits on the size trend (0.030 and 0.036), and fish meals are richer (`foodValueFish` 0.80 and 0.85).
- **Result** (1-year balance): immigrant share fell for bass 91→70%, pike 76→54%, catfish 48→29% and carp 52→39%. **Caveat (2026-10-12):** those are single-seed (2024) figures. A 3-seed, 1-year A/B gives honest means of bass ~78%, pike ~59-66%, catfish ~47-49%, carp ~44-46% and sunfish ~22-24% immigrants. That is still better than the 91%/76% start, but less than seed 2024 suggested.

### Water chemistry
- **Wet/dry mask** (`env.mask`). Below-bed cells are inert. Every process, diffusion step and mean runs over wet cells. Sediment O₂ demand and Mortimer P act on each column's bed cell.
- **Flux-form, conservative diffusion** with no flux at the edges or the bed.
- **Closed P and N budgets.** Boundary fluxes are tallied in `env.ledger`: inflow, outflow, burial, fixation and denitrification.
  - Algal and cyanobacteria uptake follow Redfield ratios (`PHYTO.N_USE`).
  - Grazing excretes `NUTRIENT.GRAZE_EXCRETE` and egests the rest as DOM.
  - Fish-death detritus carries no P.
- **Cyanobacteria** grow per-capita and logistically from a small inoculum, fix N₂ only for their deficit, and form toxic scum as an occasional event.
- **Temperature.** The hypolimnion has its own slow temperature (`tempHypo`), and the diurnal swing damps with depth (`tempDiel`, `THERMAL.DIEL_DEPTH`).
- **O₂ is clamped ≥ 0** before every rate term.
- **Storms mix the lake.** Re-stratification halts while the wind multiplier is ≥ `THERMAL.RESTRAT_MAX_WIND`.
- **Through-flow advection** (`OUTFLOW`) exports nutrients at the outflow, and burial happens only from the sediment store.
- **Removed knobs:** `THERMAL.DROP`, `NUTRIENT.DECAY`, `NUTRIENT.N_START`, `BASIN.SEDIMENT`, `PLANT.MAX_HEIGHT`, `PLANT.MIN_HEIGHT`, `PLANT.LIGHT_MIN`, `PLANT.SENESCE_TO_DOM`.

### Rendering
- **GL depth fix.** `FRAG_COMP` measures depth as `dpt = 1 − uv.y`. `uv.y = 0` is the screen BOTTOM; every surface effect was previously drawn over the bed. The sun UV is `[su, 1 − sv]`.
- **Safer GL start-up.** `makePresenter` builds and compiles the whole GL pipeline on a throwaway canvas before claiming `#tank`. On a fatal failure, or a context loss not restored within 3 s, `Renderer._fallbackTo2D` swaps in a fresh `#tank` with a Canvas2D presenter, and `main.js` re-wires its input.
- **Colour and textures.**
  - Exact sRGB encode, with grain applied after the encode.
  - Alpha-bled, mipmapped fish textures.
  - No double depth, night or haze dimming on GL fish.
  - Correct sprite hue buckets.
- **Drawing.**
  - World-aligned bed and surface sampling.
  - A heading snap when a fish enters view.
  - Wrapped `uTime`.
  - DPR-correct effects.
  - A render-target fallback chain (RGBA16F → SRGB8_ALPHA8 → RGBA8).
- **Caches and overlays.** The sprite and GL-texture caches share one cap (1024). Overlays are composited above GL fish.
- **Screensaver look and frame rate (2026-10-12, measured in real Chrome at 1920×1080).**
  - The 2D scene is uploaded into an RGBA8 texture and `FRAG_BLIT` decodes sRGB into the linear scene FBO (the overlay
    likewise in `FRAG_OVER`). Chrome can only GPU-copy a canvas into non-sRGB formats; the old SRGB8_ALPHA8 upload went
    through a CPU readback every frame (~20 fps). The SRGB8 `sceneTex` path remains only as the no-FBO fallback.
  - Lens character (warp, chromatic aberration, fake DOF) scales WITH zoom (`lens` 0 at the whole-lake view → 1 from
    ~5×), so the overview is crisp. `FRAG_FISH` samples with a −0.5 mip bias.
  - GL fish swim in `FRAG_FISH`: one straight-pose sprite per fish (`drawFish` `o.still`), bent per pixel by
    `drawFish`'s own travelling wave + caudal swing (`uWave`, `uWaveG`). Keep the two formulas in step. The 2D fallback
    still uses the 10-frame × 3-effort sprites.
  - The drawn pitch is soft-limited to ±55° (`displayHeading`, render-only, with ±0.30 cos side hysteresis).
  - Tall views (16:10, 4:3, portrait) frame the surface near the top (`Camera._clamp`); the earth continues to the
    screen bottom.
- **Main loop.**
  - Frame pacing: on high-refresh displays render every k-th refresh, k = round(16.7 ms / refresh) (`main.js` `paced`).
  - The UI's ~8 Hz panel refresh runs one slice per frame; fullscreen / `#screensaver` skip the hidden panels.
  - The guarded frame loop (`makeGuardedLoop`) re-arms before running the frame.
  - Render interpolation between fixed steps uses render-only `a._px/_py/_ph` and `alpha`; the sim never reads them.
  - Shortcuts ignore modifier keys.
  - Real pinch zoom (`Camera.pinch`).

### UI and server
- **Escaping.** `escapeHTML` and number coercion for every data-derived value.
- **CSP.** A strict Content-Security-Policy, with no inline script or style. It's identical in the meta tag, `serve.mjs` and `serve.py`.
- **UI fixes.**
  - The overlay's °F/°C toggle is clickable.
  - The inspector shows 5 outputs and the evolved brain size.
  - Population caps on every add path; a 50 MB import limit.
  - Weather-dropdown sync.
  - Fullscreen restores the pause state.
  - Delayed blob revoke.
- **Servers.** `serve.mjs` (Node) and `serve.py` are localhost-only, with no directory listings and no dotfiles.
- **Launchers (Windows).** `Synapse Reef.bat` reuses a running reef server or starts one (Node, else Python 3) in a
  minimised window, skipping ports 8000–8009 held by other apps, then opens the browser. `Synapse Reef - Screensaver.bat`
  opens Chrome/Edge as a full-screen app window on its own profile at `#screensaver` (`UI.setWindowScreensaver`: the
  lake fills the window, relaxed tour, idle chrome fade; Esc returns to the page). Batch files are CRLF (`.gitattributes`).
- **Sim speed (byte-identical).** `SpatialGrid` clears only used buckets, checks distance before the predicate, and
  keeps `agentGrid.sub` (piscivores, filled in the same pass) for `qThreat`; `nearestPlant` uses an x-column index;
  `senses()`' threat/prey queries are reused by `step()`. 7.1 → 4.5 ms per step.

### Tests
- New gate files: `test/ui-check.mjs` and `test/serve-check.mjs`.
- The memory (LEAK) check reads the real block.
- `REEF_PERF_MIN` relaxes the speed budget while other work shares the CPU.
- Each fix has its own `// ==== audit-fixes: <area> ====` block before the summary line of `headless.mjs` and `smoke.mjs`.

---

# Subsystem narrative (as of 2026-06-18)

## Current state (keep honest; track changes in SESSION_STATE.md)
- **Phase 0 done:** world **2048×1152** (≈16:9, ~6.7× the old pond), side-view, entirely
  underwater, explored through a **camera**. World size is a single config number
  (`WORLD.W/H`); all populations/resources are **densities auto-scaled by `WORLD.AREA_SCALE`**,
  so per-area balance holds at any size. Supports ~1,000 agents (`GLOBAL_MAX` ≈ 1012).
- **Phase 1 done (habitat & abiotic environment):** the lake is a **non-rectangular basin** —
  `config.js` `bedY(x)` gives a realistic profile: a **flat shallow littoral shelf** hugging each
  shore → a **steep drop-off** → a flat-ish **deep basin** (`BASIN.SHELF_Y/DROP_Y/SHELF_T/DROP_T`),
  not a smooth U. Fish, plants, detritus and corpses all live above it; agents spawn in **per-species
  depth zones** (`species.js` `zone:[lo,hi]`), and shelf-dwellers (minnow/sunfish) spawn biased to the
  shallows (`littoralX`) while weed beds concentrate on the lit shelf (`world.js` `plantX`). **Seasons** (`SEASON.YEAR_LEN`, a year every ~14 min) drive a
  **thermal profile** (`env.tempAt(x,y)`: warm epilimnion → thermocline → cold hypolimnion);
  **summer stratification** isolates the deep (gated vertical O₂ mixing + a benthic sediment
  O₂ demand) so the **hypolimnion goes hypoxic**, and **spring/autumn turnover** re-oxygenates
  it (overturn term). Light attenuates strongly (shallow photic zone). Metabolism is
  **depth-local**. **Wind + an inflow→outflow through-current** (`env.currentAt`) drift plankton &
  weak swimmers; the inflow loads nutrient into the left littoral. **Turbidity** (`env.turbidity`,
  from algae + storms) clouds the water → more light attenuation + **shorter visual range**
  (`env.clarity()` scales the `q*` sense queries; `env.secchiDepth()`). **Habitat structure** —
  reed clumps on the shores + submerged logs on the bed (`world.reeds`/`world.logs`) + rooted weed beds +
  **submerged macrophyte beds** (`world.weedbeds`: tall cover bands on the littoral/drop-off reaching up
  into oxygenated mid-water — pike/sunfish habitat, rendered + saved) — gives **cover** (`world.coverAt`):
  prey hiding in it shrink a predator's strike range (refuge), and cover-seeking fish (`innate.cover` via
  `world.nearestCover`) migrate to it to lurk/hold.
  *(Deferred to later phases: distinct substrate-type effects beyond cover, shoreline inflow/outflow
  geometry, and heritable zonation-tolerance genes → Phase 4.)*
- **Phase 2 core done (lower trophic web):** a **phytoplankton field** (`env.phyto`) is the base —
  it grows with light × nutrient (drawing nutrient down, recycled on decay), makes O₂ by day and
  respires/decomposes always, and shades the water (turbidity). **Zooplankton** are the
  `world.plankton` particles: they spawn ∝ photic-zone algae, **graze the phyto field**, **starve**
  where it's depleted, drift with the current, and are eaten by planktivores → a real
  **phyto→zoo→planktivore** chain that cycles. **Mussels** (`world.mussels`) are benthic filter
  feeders that clear phyto. **Eutrophication** works: a nutrient spike → algal bloom → turbidity +
  night/decomposition O₂ demand → crash → recovery. *(Deferred Phase 2: zooplankton as evolving
  agents, more benthic inverts (crayfish/insect larvae/snails), insect hatches, the microbial loop,
  and explicit N/P speciation.)*
- **Camera (`camera.js`):** pan (drag), zoom (scroll, ~0.8×–64× whole-lake fit),
  click-to-follow, keyboard (O/F/T/+/−), cinematic **auto-tour** (auto in fullscreen). The
  renderer draws in world space through the camera; only the visible region is drawn.
- **Render (`render.js`):** culling + 3-tier **LOD** (far→tinted dot [min 2px], mid/near→cached
  sprite, sub-pixel→skipped) + a lazily-built **sprite cache** keyed by (species, growth, hue,
  **light×depth**, anim-frame, morph, **effort/drive**), blitted via `drawImage` (LRU-capped ~1200). **GRAPHICS Pass 1
  (2026-06-17, canvas-2D, render-only):** the look was de-pixelated — sprite `BASE` 6→14 + a finer `drawFish` step
  (`su` floor 0.07) for ~2× internal detail, **`imageSmoothingEnabled=true`** anti-aliased blits (was nearest-neighbour),
  and **smooth gradient counter-shading** in `drawFish` (was 3 hard back/body/belly bands) + a **proportional eye** (was a flat
  0.7-unit floor → a huge dark eye on slim fish) with a catch-light glint; `styles.css #tank` is now `image-rendering:auto`.
  Plus **atmosphere**: soft **additive godrays** + **surface caustics** + drifting **marine-snow particulates** (`this.motes`,
  cosmetic — stateless render-clock animation, **never `core.rand`**), thin grass-blade **weed beds** + round flora line-caps,
  and a **day/night/seasonal colour grade + cool vignette**. **GRAPHICS Pass 2 (2026-06-17)** went further (still canvas-2D):
  **rich fish art** in `drawFish` (translucent rayed fins, scale texture, gill/mouth, a `source-atop` **volumetric sheen** built
  into the sprite), **particle FX** (rising **bubbles**, **soft contact shadows** grounding bottom-dwellers, edge-triggered
  **strike/flee ripple rings** via transient `a._fxAt`), and a water/post stack — **depth haze + spectral blue↔green tint** and a
  **cheap region-limited bloom** (top ~58% band; auto-skips on 4K+ backings). **Depth
  shading:** a `depthDim(y)` factor (1.0 surface → ~0.34 bed) feeds the sprite light bucket and the
  dot/corpse/plant lightness, and the water-column gradient runs sunlit-surface→abyss — so the lake
  reads as having real depth. Plus a **minimap** (whole lake + camera rect + density, click-to-jump)
  and a toggleable **perf HUD**. **GRAPHICS Pass 3 / slice 1 (2026-06-17, WebGL2):** post-processing moved to the GPU — the 2D
  scene is drawn to an **offscreen canvas** and composited to `#tank` by **`glpost.js`** (`makePresenter` → `GLPost` on real
  WebGL2, else a Canvas2D blit): **HDR float bloom + ACES tonemap + underwater refraction + chromatic aberration + fake DOF +
  grain + day/night grade + vignette**. `render.js` skips its own bloom/grade/vignette when `postInGL` (no double-post). This
  **recovered perf** (1080p whole-lake ~56→~139 fps) and raised fidelity. **Slice 2** folded a **GPU volumetric water + light**
  stage into the composite (pre-ACES): **screen-space god-rays** (a radial march of the resident half-res bloom texture toward the
  sun screen-UV), a **richer animated caustic net**, **in-scatter glow** + **surface sheen**; the 2D godrays/caustics are gated
  behind `postInGL` so they don't double. New uniforms `uSunUV/uSunInt/uSunUp/uRayExp/uCausAmt`; tunable via
  `renderer.present.rayExp`/`.causAmt` (baked 1.6/0.40). ~102 fps @1080p day. **Slice 3 (2026-06-17)** moved the FISH onto the GPU:
  when **`renderer.glFish`** is on, `render.js` collects per-fish quads instead of blitting, and `GLPost` assembles an **HDR
  scene-FBO** (background blit + **directionally-lit textured fish/corpse quads** — cylinder-normal half-Lambert + ambient floor +
  Fresnel rim + per-fish depth haze, lit from the surface sun) before the bloom/post, so fish bloom & grade with the water. Sprite
  canvases → GL textures cached by SpriteCache **entry-object identity** (LRU 512); gated behind `glFish` with the 2D fish path as
  the byte-identical fallback. Pixel-parity with 2D (only shading differs); ~169 fps @1080p. *(Far dot-tier + contact shadows +
  strike ripples stay 2D; instancing, per-species/normal-mapped art, true 3D water + depth buffer are the later Pass-3 slices.)*
- **6 fish species** (minnow, sunfish, catfish, carp, bass, pike) across a size gradient,
  each with its own brain shape, senses, diet, and a **distinct sprite SILHOUETTE** (`species.js` `drawFish`: a per-species body
  `profile(tn)` → asymmetric back/belly curves + parametrized dorsal `dorsalX/W/H` + `earSpot`/`scaleTex` — pike slender spindle
  w/ rear dorsal, sunfish round disc w/ ear-spot, catfish broad-head taper, carp deep round-bellied, bass streamlined, minnow slim).
- **Growth:** fish are born juveniles (~35% size) and grow to adult size with age.
  Predation is by **effective (growth-aware) size** (eat prey ≤ ~85% of your size), so
  juveniles are more vulnerable.
- **Thermal / O₂ physiological niches:** each species has a temperature band (`tempOpt ± tempTol`)
  and a critical oxygen `o2Crit` (`species.js`). Outside the band, energy drains
  (`ENV.THERMAL_STRESS`/°C); below `o2Crit`, the hypoxia drain bites (`world.js` metabolism block,
  using the `ENV.HYPOXIA*` constants). This makes **warm- vs cool-water guilds** (pike = coolwater,
  O₂-demanding, summer-squeezed; catfish/carp = warmwater, hypoxia-tolerant) and the classic summer
  **temperature–O₂ squeeze** emergent, not scripted. The four water-column species (minnow/sunfish/bass/
  pike) also sense **`light@depth` + `temp@depth`** (`world.lightAt`/`tempAt`), giving them the signals to
  **evolve diel vertical migration** against that cost. A large research-pass backlog of further realism
  systems lives in `ROADMAP.md` → "Realism research backlog".
- **Time/calendar:** one master `TIME` block (`DAY_LEN` 60 s cosmetic day/night, `YEAR_LEN` 1800 s) → a realistic-ratio
  calendar: **a year = 12 months = 4 seasons** (`env.monthName`/`monthIndex`/`yearFrac`, displayed Month·Season·Year),
  day < month < season < year. Fish lifespans are realistic **relative** ratios (~10× carp:minnow, mature at ~13–33%
  of life; absolute scale compressed so evolution still turns over — see `species.js` `matureAge`/`maxAge`). A single
  **`TIME.LIFE_SCALE`** knob (currently 1.6) multiplies every species' `matureAge`+`maxAge` once (in `species.js`), so fish
  live & mature proportionally longer in sim-seconds (calmer turnover) while keeping those relative ratios — dial it to taste.
- **Environment:** day/night (`TIME.DAY_LEN`) + **seasons** (`TIME.YEAR_LEN`); weather state machine
  (clear/cloudy/rain/storm) — rain is a **surface-only** effect, lightning a brief
  **surface-down gradient**; a **depth-stratified temperature** (`tempAt`) with summer
  stratification & spring/autumn turnover; a dissolved-**O₂ field** (photosynthesis by day,
  depth-local respiration, surface re-aeration, **benthic sediment demand**, stratification-gated
  vertical mixing + turnover overturn; the **hypolimnion goes hypoxic in summer**; phytoplankton
  also drives a big diel/bloom O₂ swing); **nutrient pools** — phosphate (`env.phos`) + dissolved inorganic
  nitrogen, the latter split by the **nitrogen cycle** into **ammonium** (`env.nh4`) + **nitrate** (`env.no3`):
  aerobic **nitrification** (NH₄→NO₃, consumes O₂) and anoxic **denitrification** (NO₃→N₂ gas, a permanent N sink
  → P stays the ultimate limiter), **redox-gated** mutually-exclusive at `DENITRIF_O2` (the same 0.25 cline as the
  sediment-P switch — nitrification only above it, denitrification only below), in `env.nitrogenCycle`.
  Phyto/plant growth is **Liebig co-limited** = min(N-Monod over nh4+no3, P-Monod), with Redfield-split recycling
  (N recycles as ammonium, drawn ammonium-first) and a **P-enriched inflow** (P is the limiter → P loading drives
  blooms); a **benthic sediment-P store** (`env.sedP`, the **Mortimer redox switch**: oxic sediment binds P, the
  anoxic summer deep releases it → internal-loading eutrophication feedback); a **phytoplankton field**; a
  **cyanobacteria field** (`env.cyano`, the **N-fixing 2nd producer strain**: grows on light × P × warmth with NO
  N-limitation, so it wins at low N:P; competes with green phyto for P; **buoyant** → a surface scum; leaks fixed
  N back → a net N source that counteracts denitrification — emergent seasonal phyto↔cyano succession; a **dense scum is
  TOXIC** (`CYANO.TOX_*`: a microcystin-style **cyanotoxin** drains fish energy + kills zooplankton above a threshold →
  a bloom can kill by **poison** as well as via the O₂ crash, surface-concentrated, inert below threshold); a
  **dissolved-organic-matter field** (`env.dom`, the **microbial loop** in `env.microbialLoop`: settling detritus
  dissolves into it, then heterotrophic bacteria decompose it at a **Q10 temperature- + O₂-limited (Monod)** rate —
  **consuming O₂** and **remineralizing** N(→ammonium)+P **gradually & mass-conservingly**, replacing the old instant
  detritus dump; cold/hypoxic deep decomposes slowly → **DOM accumulates in the hypolimnion**, and the O₂ demand
  self-throttles as O₂→0 so it can't deepen the dead zone); a **wind + inflow current**.
- **Resources:** a **phytoplankton biomass field** (base of the web) + a **cyanobacteria field** (the N-fixing
  competing strain), **zooplankton** (the drifting `plankton` particles — graze phyto, feed planktivores),
  **aquatic insects** (`world.larvae`/`world.insects`, `config.js INSECT`: benthic detritivore LARVAE that develop with
  warmth & feed bottom fish, then EMERGE as a warm-season surface HATCH of adults that surface fish rise to — the
  bed→surface cross-boundary flux; uneaten adults lay eggs, closing the cycle),
  sinking detritus (dissolves into the `env.dom` pool → **bacterially decomposed** by the microbial loop, not an
  instant nutrient dump), rooted plants/macrophytes — a **variety registry** (`config.js MACRO`: pondweed / milfoil /
  water-lily / muskgrass-chara, each a dynamic plant `p.v` picked by **rooting depth** `world.pickVariety`, with
  per-variety depth zone, size, growth, cover, O₂, palatability, light- (`lightMin`) & warmth- (`tempMin`) requirement,
  and render form) that **EVOLVE**: each plant carries a heritable **6-gene trait genome** (`PLANT_GENE_KEYS =
  maxH/grow/light/warmth/palat/leaf`, multipliers; `core.js randomPlantGenes`) — seedlings are **mutated clones of the
  nearest parent** (`newPlant(x,false,parent)` in the seeding step; isolated/cold-start seeds get fresh genes), and
  `world.derivePlant(p)` maps genes × variety → effective per-plant `growMul/lightMin/tempMin/palat/cover/o2/leaf/hue`
  with **trade-offs** (shade-tolerance & grazing-defence cost growth; big leaves raise the light requirement) so habitat
  drives **divergent selection** — **functional AND visibly rendered** (per-plant colour/leaf-size/height). Genes start
  ~1.0 (fresh lake = pre-evolution baseline). Layered on **seasonal phenology** (temperature-driven warm-season growth →
  autumn senescence that sheds into the DOM pool = the fall nutrient pulse → overwinter as a grazing-/winter-proof
  **rootstock** `WINTER_MIN`; death is **light-starvation**, the depth/turbidity limit, not grazing-uproot; grazed only
  above the rootstock; produce O₂) and **shade-compete** (taller macrophytes cut shorter neighbours' effective light,
  `COMPETE` → a stratified canopy + self-thinning, which selects for height/shade-tolerance) — plus separate static
  **reeds** (emergent) + **weed beds** (cover). Mussels (filter feeders). **Benthic invertebrates** (`world.snails`/`world.cray`,
  `config.js SNAIL`/`CRAYFISH`): grazing **snails** scrape periphyton (a gentle local draw on the phyto field near the bed),
  recruit ∝ the algae base, and are eaten by molluscivorous sunfish/carp + crayfish; omnivorous **crayfish** walk the bed
  (cover-seeking + crepuscular/night-active), recruit ∝ the detritus rain (like the insect larvae), prey on snails, and are a
  prime forage for bass/pike/catfish — two new benthic web links: phyto→snail→{sunfish,carp,cray} & detritus→cray→{bass,pike,catfish}.
  Both are particle populations (eaten opportunistically on the bed — no dedicated brain sense yet).
- **Reproduction & carrying capacity (Phase 5):** sexual **crossover** is primary; **asexual budding** is a
  fallback so sparse populations and the random cold-start still evolve. Density is now **LOGISTIC** — the chance
  of breeding when eligible tapers to 0 as a species nears its carrying capacity `K = popMax` (`rand() < 1−N/K`),
  not a hard cap. **Seasonal spawning** (`SPAWN` + per-species `spawnPeak`): the breeding chance is also multiplied
  by a seasonal factor that **peaks in each species' spawning season** (a spring/early-summer baby boom; pike spawn
  earliest in cool spring) and tapers to a soft `FLOOR` off-season — a `cos`-bump on the angular distance from the
  peak, keyed off `env.yearFrac()`, applied to both the sexual & asexual paths (`world.js` `spawnF`). **Fecundity /
  clutch** (per-species `SP.clutch`): a successful spawning yields a **condition-dependent brood** of several young
  (real fish are fecund), not one — bounded by the parents' energy (each young costs `reproCost`, so only well-fed fish
  afford a big clutch), by the species max, and by global headroom (never overshoots `GLOBAL_MAX`). This is what lets the
  slow-maturing larger species self-sustain on realistic life histories; the logistic gate keeps it self-limiting near K. The old hard re-seed floor is **retired** for **metapopulation immigration / the rescue effect**
  (`IMMIGRATION` in `config.js`): a stochastic trickle of edge-entering immigrants whose rate rises as a species
  drops below a low rarity threshold `RESCUE_N` and tapers to 0 above it (so self-sustaining species float free),
  plus a tiny `REFUGE` quasi-extinction backstop (never literally vanish). Immigrants are mutated copies of the
  species' current best (preserve learned behavior). `world.stats.immigrants` tracks rescue dependence vs home-bred
  `world.stats.births`. Both the **brain genome AND a multi-gene trait genome** are inherited. **Trait-based mate
  choice** (`world.chooseMate`): the initiating fish scores eligible nearby partners by condition + trait genes +
  foraging success and picks the best → sexual selection acts on the genome (not just nearest-mate pairing).
- **Multi-gene genome (evolution beyond the brain):** each fish carries a heritable **7-gene** trait genome
  (`core.js GENE_KEYS` = **size / speed / tol** physiology + **fin / eye / body** MORPHOLOGY + **brain** SIZE multipliers,
  `randomGenes`/`crossoverGenes`/`mutateGenes`) blended on crossover + mutated like `hue`. `makeAgent` derives
  effective per-fish stats — `a.size/maxSpeed/tempTol/o2Crit` **plus** `a.maxTurn` (fin → maneuver), `a.senseRange`
  (eye → vision), `a.accel` + `a.bodyMul` (body → thrust + a gape-limited **predation defence** in `qThreat`/`qPrey`'s
  `canEat`), with fin/body also adding **drag** to `maxSpeed`; the **brain** gene sets **`a.activeHid`** = how many hidden
  units are ACTIVE (`forward` MASKS the surplus inert — the EVOLVABLE BRAIN SIZE, `config.js BRAIN`), with a **per-neuron
  metabolic SAVING** for a smaller brain — and **every cost folded into `a.metabMul`** so traits trade off (nothing free;
  the brain gene is the encephalization trade-off — a thriftier brain is cheaper but computes with fewer units). The
  morphology is also **DRAWN** per-fish (`drawFish` reads `o.morph`; sprite-cached by a coarse morph bucket in `render.js`),
  so bodies visibly evolve. At genes≈1.0 stats are **exactly** the species baseline (full brain, `metabMul` = 1).
  Selection visibly acts (catfish evolve small/slow/hardy; a run drifted fin↑/body↑/eye↓). Seeded-RNG (sim state),
  serialized in `toJSON` (`gn`); a `fitGenes` length guard pads older saves (preserving evolved genes).
- **Motion:** NN turn/thrust → **low-pass smoothed (~0.65 s)**; **turn authority falls with
  speed** (fast fish bank in arcs, not darts); **MOMENTUM** (`config.js MOTION`): each fish carries a `velHeading`
  (actual TRAVEL direction) distinct from `heading` (body facing) — `velHeading` eases toward `heading` slower at speed
  (`SPEED_LAG`), so a fast fish **carves/drifts through a turn** instead of pivoting, and a hard turn **scrubs forward
  speed** (`TURN_DRAG` ≈ 0.14 → can't bank at full tilt). Position integrates along `velHeading`; the body draws along
  `heading` so a fast turn visibly crabs/banks. **anticipatory edge avoidance** curves fish off side walls/surface;
  **side walls turn the fish around (heading+velHeading both flip), but the surface & curved bed make it
  GLIDE along the boundary** (heading eased to horizontal) instead of bouncing — so bottom-feeders
  foraging on the bed don't twitch; **burst-and-coast** (`MOTION.COAST_*`): a per-fish zero-mean stroke oscillation pulses
  the delivered thrust so a cruising fish SURGES then GLIDES (cycle-mean ≈ intent → balance-neutral), suppressed during a
  flee/strike sprint; a **traveling-wave** body undulation + beating fins whose **amplitude AND tail-beat
  frequency scale with the fish's actual swimming EFFORT** (`render.js _fish` `drive` = thrust + speed, boosted by a
  flee/strike burst, suppressed by a HIDE freeze → a gliding/hiding fish is near-still, a fleeing sprinter thrashes;
  bucketed into the sprite-cache key). Render adds an **eased visual heading** + wide facing hysteresis so sim snaps
  don't read as twitches. *(`velHeading`/`stroke` are transient — lazily init, not serialized. Trajectory-realism set is complete: carving momentum + turn-speed-loss + burst-and-coast.)*
- **Innate behavioral baseline (ethogram, `SP.innate`):** each species has a **depth-home reflex** (steers
  toward its real preferred zone `homeDepth × bedY`, pull scaling with displacement → gentle near home so
  the NN drives in-zone, the neuroevolution isn't diluted) + a **cruise style** (lurkers slow, roamers
  brisk; catfish **nocturnal** = more active at night) + **schooling cohesion** (minnow → loose shoals) +
  **ambush** (pike eases toward a hold until prey is close, then bursts — a *blend* so a committed brain
  can override). Applied in `world.js`'s move step,
  deterministic (no RNG); the NN **modulates** all of it. Produces real vertical zonation — minnow shallow,
  bass/pike mid, carp/catfish on the bottom. Adversarially reviewed. (v2.1 TODO: cover-seeking,
  catfish nocturnality, schooling separation, absolute minnow home-depth — see ROADMAP.)
- **Life-cycle visuals (believable spawn/death):** new fish **fade in** (render `vis` ramp);
  rescue **immigrants enter from a lake edge** and swim inward (usually off-screen) instead of popping in
  mid-view; **natural deaths leave a body** that sinks, rolls belly-up, and fades over ~1.4 s
  (`world.corpses`, render-drawn) before becoming detritus. Eaten fish still vanish into scraps.
- **Stats/data accessors (pure, headless-tested):** `world.envDetail()` (depth-resolved temp/O₂,
  stratification, nutrient, nitrate %, phyto, cyano, Secchi, clarity), `world.speciesDetail()` (per-species
  count/gen/**all 6 mean trait-genes** size/speed/tol/fin/eye/body/condition/zonation/**immigrant-fraction**),
  `world.biomassByTrophic()` (trophic-spectrum biomass incl. snail/crayfish), `world.depthProfile(x,n)` (a
  surface→bed water-column profile: temp/O₂/N/P/phyto/cyano/light at each depth), **`world.resourceCounts()`**
  (live zoo/larvae/insects/snails/crayfish/mussels/detritus/plants counts), **`world.cognitionDetail()`** (fleet
  drives meanHunger/meanFear, the brain-gated action mix pStrike/pFlee/pHide, recurrent meanMemory, meanTox).
  The UI surfaces them in a reorganized rail (**Dashboard overhaul Slice A, 2026-06-16**): an **Environment card**
  (deep temp/O₂, stratified %, Secchi, nutrient, nitrate %, sediment-P, phyto, cyano, DOM), a **Water-column card**
  (depth-profile chart, pan to compare littoral vs deep), a **Food-web card** (census + a resource-count strip +
  fish trophic-biomass bars), an **Evolution card** (per-species 6-gene table + gen + immigrant %), a **Cognition
  card** (the brain inspector + the fleet drive/action/memory aggregates), a **History chart**, and a full
  **click-a-fish readout**. *(Slice B/C — selectable multi-panel charts, a food-web flux diagram, an event/feed
  log, CSV export, any-entity inspector — remain on the roadmap.)*
- **UI:** HUD, six-species census, population + environment charts, live **brain
  inspector**, selection readout, controls (pause/**speed incl. a ½× "relaxed" screensaver
  pace**/weather/oxygen-map/vision/add species/scatter food/save-load brains/export-import
  state/reset/**fullscreen**), an on-water **pond-stats overlay**, and fullscreen with a roaming
  auto-follow + auto-relaxed pace (screensaver). **Temperature shows in °F** by default (sim stays
  °C; convert only at the UI boundary via `ui.fmtTemp` — click the readout to toggle °F/°C).
- **Persistence:** champion brains per species (localStorage) + full state (JSON file,
  `version: 23` (v23 = the 7th `brain` trait gene — `gn` grows 6→7, older saves pad it to ~1.0; v22 = the +2 perception inputs; v21 the natal-home anchor `hx`; v20 `snails`/`cray`; older saves migrate / default) — agents carry a contaminant **body burden `tx`** (`TOX`: a mercury/PCB-style toxicant that
  **biomagnifies up the food chain** via prey-burden assimilation in `takePrey`, slow excretion → apex predators carry
  the most; `TOX.AMBIENT=0` = a clean lake, inert by default, a scenario lever) + brain weights `w` (a **recurrent** MLP with
  a **5-output ACTION head** — `core.js OUT=5`: turn, thrust, + the brain-GATED actions **strike/flee/hide** (`config.js ACTION`),
  each a 0..1 intent the move/feed steps turn into a visible lunge/sprint/freeze; plus a per-hidden-unit leaky-integrator `[LEAK]`
  block that gives the brain **MEMORY** — `forward` blends each unit's previous activation in; the hidden state `act.h`
  persists on the agent and **is serialized** as agent field `m` so working memory survives save/load, and `core.js migrateGenome`/
  `world.js fitGenome` **preserve** an older 2-output and/or pre-recurrence brain — keeping its learned input→hidden + turn/thrust
  weights + LEAK and seeding the new actions ~off — rather than reseeding) + a **6-gene** trait genome `gn` (size/speed/tol + fin/eye/body)
  + **internal-drive state `hg`/`fe`** (hunger/fear — persistent motivation scalars fed back as the **last two brain inputs**, `config.js DRIVE`;
  hunger accrues with time-since-meal & is sated by eating, fear spikes near a threat & decays — the NN wires them to its gated actions)
  + a **natal-home anchor `hx`** (the fish's birth x — the reference for **SPATIAL COGNITION**: `species.js SPATIAL_INPUTS` appends 3
  allocentric brain inputs before the drives — `compass∠sin`/`compass∠cos` (absolute body heading) + `home∠x` (signed horizontal
  bearing to `homeX`) — so on the recurrent brain, **homing / site-fidelity / spawning-migration can EVOLVE**, emergent not scripted;
  pure functions of sim state → deterministic; new-sensor columns zeroed on migration so evolved brains survive the input add)
  + **RICHER PERCEPTION** (`species.js PERCEPTION_INPUTS`, between the spatial block and the drives): a **lateral-line / rheotaxis
  `flow`** sense (the signed local current — MECHANOSENSORY, so **not** clarity-scaled → works when vision fails, the murky-water
  fallback) + a **`prey size`** sense (relative size of the nearest catchable fish, 0 for non-piscivores → evolved prey-size
  selectivity, coupling to the gape/`canEat` system)
  + **LIFETIME LEARNING** (within-life neural plasticity, `config.js LEARN`, `core.js reinforce`): each fish runs a **PLASTIC
  policy `a.lw`** (a working copy of the genotype that `forward` executes), reshaped in-life by a **3-factor reward-modulated
  HEBBIAN** rule on the W2 (hidden→output) block — when the fish EATS, the action just taken is reinforced; a homeostatic decay
  pulls `a.lw` back toward the genotype (transient, bounded) + a hard clip. It is **BALDWINIAN, not Lamarckian**: the inherited
  genotype `a.g` is never written, so ALL reproduction/serialization uses `a.g` (offspring inherit the evolved brain, not the
  learned weights). Pure/deterministic (no RNG); `a.lw` is transient (re-derived from `a.g` on load → no save-format change);
  **plants carry trait genes `g` + colour `hu`**;
  env serializes the `nh4`/`no3`/`phos`/`cyano`/`sedP`/`dom` fields; `environment.load` tolerates field-grid size
  changes + splits older `din`/`nut` saves + defaults a missing `cyano`/`dom` to the seed (seed strain / 0)).
  **Genome-length guard (`world.js fitGenome`):** an exact-length save loads as-is; a recognized older shape is
  **migrated, preserving evolved weights** — `migrateGenome` lifts a 2-output (and/or pre-recurrence) brain to the
  5-output recurrent layout, and **`migrateGenomeInputs` lifts a fewer-input brain to the current input count** (copies
  W1 row-by-row at the new stride, **zeros the new sensor columns**, copies B1/W2/B2/LEAK verbatim) — so adding a sensor
  no longer wipes evolved brains; only an unrecognized length reseeds (clean, never NaN).
- Per-area balance is tuned for the old ~45–150-agent density; at 2048×1152 that's ~200–360
  live agents (up to `GLOBAL_MAX` ≈ 1012). Since Phase 5 (logistic + immigration, no hard floors) the standing
  population is **more variable** (a 3-yr balance ranges ~49–393) as the planktivore boom-bust runs its course.

## Where things live
- **Balance knobs:** `config.js`. World size is `WORLD.W/H` (everything else derives via
  `WORLD.AREA_SCALE` / `scaleCount`). Also **`TIME`** (the master calendar — `DAY_LEN`/`YEAR_LEN` → derived
  month/season; the single source `SEASON.YEAR_LEN`/`ENV.DAY_LEN` reference; per-species lifespans/maturation/
  `spawnPeak` live in `species.js`), `BASIN` (bed shape + `bedY(x)`), `SEASON`/`THERMAL`
  (year length, stratification, sediment O₂ demand, turnover mixing, `WIND_EROSION` = storms break
  the thermocline), `WIND`, `FLOW` (inflow
  current + nutrient), `TURBIDITY`, `STRUCTURE` (reeds/logs) + `COVER` (refuge) + `SCHOOL` (predator-confusion/dilution:
  a dense shoal shrinks a predator's strike reach → schooling is adaptive) + `ACTION` (the brain-gated action space —
  strike/flee/hide burst/freeze/conceal magnitudes + energy costs) + `MOTION` (locomotion realism — `velHeading` carving
  turns + turn-speed-loss + burst-and-coast stroke pulse) + `DRIVE` (internal-state motivation — hunger/fear gains/decay
  fed back as brain inputs), `TIME.LIFE_SCALE` (global lifespan multiplier), `DAY_LEN`,
  weather, the O₂ budget (incl. `ENV.HYPOXIA*` + `ENV.THERMAL_STRESS` for the thermal/O₂ niches),
  `NUTRIENT` (N/P pools + Liebig) + `SED_P` (sediment-P redox) + `NCYCLE` (nitrification/denitrification) +
  `MICROBE` (the microbial loop: bacterial DOM decomposition — `BACT` rate, `Q10`/`REF_TEMP` temperature dependence,
  `O2_HALF` O₂-Monod, `O2_COST` respiration demand, `DIFFUSE`),
  `PHYTO` (phytoplankton) + `CYANO` (N-fixing cyanobacteria strain) + `PLANKTON` (zooplankton graze/starve +
  `FALLBACK_*` = planktivore facultative omnivory: hungry minnow/sunfish graze phyto when zooplankton is scarce →
  they self-sustain through the boom-bust trough) + `MUSSEL` + `INSECT` (aquatic insects: benthic larvae develop with
  warmth & feed bottom fish, then EMERGE as a surface hatch that feeds surface fish — the bed→surface cross-boundary flux) +
  `SNAIL` (benthic algae-grazing gastropods: recruit ∝ algae, scrape the near-bed phyto, food for sunfish/carp/crayfish) +
  `CRAYFISH` (benthic omnivore: recruit ∝ detritus, cover-seeking + crepuscular, prey on snails, forage for bass/pike/catfish),
  `IMMIGRATION` (Phase-5 carrying capacity: `RESCUE_N`/`RATE`/`REFUGE` rescue knobs; per-species `pop.max` = logistic K),
  `SPAWN` (seasonal breeding: `FLOOR` off-season floor + `SHARP` season width, × per-species `spawnPeak`),
  detritus rates, `PLANT` (incl. **seasonal phenology** `GROW_TEMP_MIN/OPT`/`SENESCE`/`WINTER_MIN`/`SENESCE_TO_DOM` +
  the **light-starvation** depth limit `LIGHT_MIN`/`SHADE_DEATH`), **`MACRO`** (macrophyte varieties: per-form `zone`/
  `maxH`/`grow`/`cover`/`o2`/`palat`/`lightMin`/`tempMin`/`hue`/`form` — these are the **baseline** the per-plant
  trait genes multiply: `core.js PLANT_GENE_KEYS` + `randomPlantGenes`, mapped to effective per-plant params by
  `world.derivePlant`), **`COMPETE`** (`RADIUS`/`SHADE` — macrophyte **shading competition**: a taller plant cuts a
  shorter neighbour's effective light → stratified canopy + self-thinning, selecting for height/shade-tolerance),
  `CAMERA`. Per-species
  `tempOpt/tempTol/o2Crit`/`spawnPeak`/`matureAge`/`maxAge`/`clutch` live in `species.js`.
- **Camera/rendering:** `camera.js` (pure transforms/pan/zoom/follow/tour); `render.js`
  (camera-space draw to an offscreen scene canvas, curved bed, culling, `SpriteCache`, LOD tiers, O₂/temp overlays, minimap);
  **`glpost.js`** (WebGL2 GPU post-processing presenter + Canvas2D fallback — bloom/tonemap/refraction/grade/vignette).
- **Per-species values:** `species.js` (`SP` registry: size, brain `shape{in,hid}`,
  `inputLabels`, `diet`, speeds, metabolism, breeding thresholds, `zone` (depth band), `drift`
  (current susceptibility), `senses`, `draw`).
- **Step order:** `world.js` `World.step(dt)` — env fields (incl. the microbial loop) → spawn plankton → detritus
  sink → (on expiry) dissolve into `env.dom` → insect larvae/hatch → benthic inverts (snails graze + build snailGrid →
  crayfish crawl/prey-on-snails + build crayGrid) → plant growth → rebuild spatial grids → per-agent (sense → forward →
  smooth controls → move (turn-authority + edge-avoid + side-wall turn / bed-surface glide) → hypoxia → feed →
  reproduce [logistic, density-dependent] → death→corpse) → corpse sink/fade → immigration rescue (edge entry) →
  compact arrays (incl. corpses) → sample time series.
- **Habitat structure & cover:** `world.js` `_genStructures()` (reeds on shores + logs on the
  bed, saved in `toJSON`), `world.coverAt(x,y)`, refuge applied in `takePrey()`.
- **Environment fields:** `environment.js` (day/night + seasons, weather FSM, depth-stratified
  temperature `tempAt`/`metabAt`, wind + inflow current `windAt`/`flowAt`/`currentAt`, **turbidity**
  `clarity`/`secchiDepth`/`attenuation`, O₂ + nutrient + **phytoplankton** (`phyto`/`meanPhyto`/
  `grazePhyto`) `Float32Array` fields with photosynthesis/respiration/aeration, **benthic sediment
  demand**, the **microbial loop** `microbialLoop` (DOM `dom`/`domAt`/`meanDOM`/`addDOM` → Q10 + O₂-Monod bacterial
  decomposition consuming O₂ + remineralizing N+P), stratification-gated vertical O₂ mixing `diffuseO2`, and a
  **turnover overturn** term).

