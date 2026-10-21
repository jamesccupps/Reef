# The realism plan: restore the field values, build what the lakes are missing

Written 2026-10-21 from the compensation audit, for the human's instruction:

> "make sure there aren't other things that were adjusted but shouldn't have been because they weren't realistic … the real
> solution is to make it realistic and provide everything the environment has and the way the environment actually has it"

**The four reports** (each a table of every parameter with its field value, source, history, class and what it stood in for):

| Report | Covers |
|---|---|
| [`audit_predation.md`](audit_predation.md) | the encounter–strike–capture rule, refuges, the predators' habitat |
| [`audit_habitat_young.md`](audit_habitat_young.md) | habitat bands, refuges, spawning, the young-of-year, recruitment, the census cap |
| [`audit_physiology.md`](audit_physiology.md) | the eleven species' energy sets, mortality, reproduction, diet switches |
| [`audit_foodweb_environment.md`](audit_foodweb_environment.md) | zooplankton, the bed, the littoral, crayfish, plants, light, ice, and the MISSING ENVIRONMENT list |

This plan supersedes the order of work in [`PLAN.md`](PLAN.md) from here on. PLAN.md's items stay as the record and are mapped below.

## What the audit found, in one paragraph

Most of the community's failures trace to **compensations** (values moved away from the field to fix a symptom) that were set when
the lakes lacked plants, cover, a littoral or a satiation brake. Each later mechanism added a new limit without retiring the old one,
so the limits now **stack**.

- **The predators' brakes multiply.** Act (time hunting) and the bass's aMax cut (12 → 2.5 /h) were set while bass overfed, before
  the hunger gate existed. Cover is counted in both encounter and capture. Prey size is counted twice (CS0 was measured at a typical
  size ratio, then cut again by 1 − PPR/PPR0). E_h 30 /h has no source. The predators sit in bands too shallow for them and never
  move toward prey. Pickerel kill ~0.06 fish a day on the GPU, against the field's 0.4–0.8.
- **The young are under-killed and over-efficient.** Stage Y1 halved their background mortality and cut the larval take ×3 to keep
  the old recruit counts. Their larval Cmax is ×1.5 for every species, with maintenance 3–6× below Breck's. They keep eating
  zooplankton first to 12–16 cm, where real ones switch to the bed at 4–5 cm. So they eat the zooplankton out: 400–600 µg/L in late
  May, 1–6 µg/L from September to the next May.
- **Food that real lakes have is missing**, and consumers were patched instead:
  - the plant-dwelling microcrustaceans (about half a shallow lake's zooplankton);
  - stony-shore fauna and epiphyton;
  - *Hexagenia* and other emergence;
  - *Chaoborus*;
  - the microbial food of rotifers and cyclopoids;
  - the brook's drift;
  - fish eggs.

  The patches: the sunfishes' RA × 0.7, the fathead set for killifish, diet switches, bass insR. Meanwhile the bed food was raised
  4× for the old 2-D slice that had no shallows.
- **What regulates is what's left.** The census cap (white perch), a single M_OTHER and a 1.5-m "rock" proxy do the work of birds,
  angling, an egg stage, weather, a substrate map and the streams.

## The rules for this phase

1. **Every change cites a field value or a mechanism, never a target outcome.** Parameter screens are for diagnosis only.
2. **Retire compensations with their mechanism.** When a mechanism lands, retire the compensations it replaces in the same slice.
   Restoring a compensation before its food or refuge exists only brings back the symptom it hid (audit_physiology "Order to restore").
3. **Judge on the GPU at true scale, ≥ 3 seeds × ≥ 3 years.** The 1/10 lakes have 10× steeper slopes and a different food/fish
   geometry. They misled the predation probes (60–80 % "empty" calls there; 1 % at true scale), so use them only to debug a rule.
   For CPU diagnostics use HB_WORLD=true snapshots (audit_predation's `scratchpad/audit/prdT*.mjs`).
4. **Both engines in every slice** (fish3.js + wgsl.js), g1_check ?r5=1 parity, the gate green.

## The field targets every arm is read against

| Group | Target |
|---|---|
| Predators | p: pickerel 0.39–0.42, bass 0.30–0.36 · kills: pickerel 0.4–0.8 a day, bass ~1 · 35–60 % empty stomachs · Maine length at age · pickerel 4–8 kg/ha · bass at every age |
| Zooplankton | crustaceans 30–80 µg/L in summer, 10–20 under ice, copepods ≥ 70 % in winter · rotifers ¼–⅓ of crustaceans · an autumn recovery |
| Young-of-year | larval Z 0.1–0.5/d in the first weeks · juvenile Z ~0.035/d · July biomass ≤ 10–40 kg/ha (Mills & Forney) · autumn lengths in field ranges (killifish 2.6–3.2 cm by late September) |
| White perch | 15–35 kg/ha with the census cap never binding · non-predation adult mortality 0.45–0.65/yr |
| Bed and weeds | bed production 50–80 g wet/m²/yr · the weed fauna falling ≤ 3× under fish (now 10–20×) |
| Killifish | persisting at ~200–700 adults/ha with ~3 clutches a summer |

## The order of work

### R0. Measure first (cheap; before any change)

Gate checks:
- zooplankton by season (summer and under-ice ranges, an autumn recovery), not only the June peak (foodweb finding 10);
- young-of-year biomass in July;
- predator p and kills per fish-day by season.

Tallies in the year runner:
- the zooplankton's production by consumer: young by species, adults, bladderworts, mussels, outflow;
- larval and juvenile Z by species.

A true-scale CPU probe kit (prdT-style) for rule debugging.

### R1. The predation rule, undone to its research design (no new mechanism needed)

audit_predation §5, one arm:

1. **COVER_CS → 0.** Cover acts once, on attack initiation: E from uncovered prey, then (1 − cover) once on each prey's attack weight.
2. **The size term is renormalised** to the PPR at which each CS0 was measured.
3. **E_h ≈ aMax.** Bass aMax goes back to the lab ceiling (6–7 /h in half cover, or 12).
4. **act becomes a diel rhythm.** Pickerel [0.7, 1, 0.1], bass [0.6–1, 1, 0.1]. **Pickerel get pGate too.** The gate is the brake the
   research asked for; act and the aMax cut were its stand-ins.
5. **ENC_DZ → 0** at true scale. SHALLOW_K carries the shallows' refuge.

**Expected:** the strike hazard rises ~15–25× before the gate, and the gate then sets p. If small fish are eaten out, that tests their
REAL refuges, which R2–R4 supply. It does not call for re-braking the predators.

### R1b. Mortality and reproduction (independent of food)

audit_physiology "do now", audit_habitat_young G4/F4. A separate arm, or the same arm after R1 reads well.

- **Per-species M_OTHER:**
  - white perch ≈ 1 with M ≈ 0.6 (the field's non-predation 0.45–0.65/yr);
  - bullhead and pumpkinseed raised;
  - the L^−0.87 slope dropped from the non-predation part.
- **Drop the young's M_OTHER charge.** M_LARVA3 / M_JUV3 already carry it, so birds and disease are paid twice.
- **Per-species REPRO_ALLOC and gonad timing**, lost in the 2-D → 3-D port. Batch spawners (killifish, fathead-like) ~0.8, rebuilding
  between clutches.
- **White perch on a sourced set** (Hanks & Secor 2011; Behr), with their own harsher first winter. Johnson & Evans: they die 3.3×
  faster than yellow perch.
- **Smaller items:**
  - a senescence hazard in place of the maxAge cliff;
  - pumpkinseed fecundity per batch;
  - the nest guard ~5–10 days;
  - YW_T0 only with a winter ramp (killifish, fallfish and dace have none);
  - BRAIN.COST ≤ 0.05.

### R2. The young and the zooplankton (stack Z): the food base

audit_foodweb §8.2, audit_habitat_young §2 1–2 and §4 2–3.

1. **The young's prey switch by profitability.** Zooplankton → the bed and the weeds as each pays, at the field's lengths: perch ~5 cm
   when zooplankton is low (adult perch's Lzoo 16 stays: Cooper), white perch ~4 cm.
2. **The plant-dwelling microcrustaceans:** chydorids, *Simocephalus*, *Sida*, *Eurycercus*, ostracods, *Hyalella*. A pool per bed
   cell, bound to the plants, fed by epiphyton and detritus, with a partial stem refuge, reachable by small fish of any status (not
   only the young's schools).
3. **The young's depth geometry.** A bed-depth class in the young's prey table, so the shore fringe (2–20 m wide, lost in 50-m
   columns) can be a refuge. The shelf rule tests the bed, not column means.
4. **The young's energetics:**
   - CMAX_LARVA per species (perch ~0.9 × FB4);
   - Breck's maintenance with its 1.5 (R_WMIN);
   - K_FRY from its cited 30–75 µg/L with a clearance limit.
5. **Then re-fit what stood in for these:**
   - K_ZOO toward 10–20 µg/L;
   - larval and juvenile mortality re-derived from the field's totals minus the tallied explicit predation;
   - LARV_A restored;
   - the microbial food of rotifers and cyclopoids, if the rotifers still vanish in summer.

**Retires:** the killifish benthL 1.0 and the strip's narrowing (after R5's birds), the stageR5 adult-plankton removals (arm B) as the
littoral pool lands, K_ZOO 60, M_LARVA3/M_JUV3 halving, LARV_A 0.1, and (with R3) RA × 0.7.

### R3. The shore's substrate and its fauna (stacks B and K)

audit_foodweb §8.3 and §8.5; audit_habitat_young §4 1.

1. **A substrate map:**
   - rock and cobble (MDIFW "shoreline mostly rocky"; 60–75 % of shore);
   - sand (Upper's NE beach);
   - mud in the coves (from fetch / wave exposure);
   - wood (300–600 logs/km);
   - leaf packs.

   Sources: NAIP and LiDAR texture, a fetch rule, and the human's shore notes.
2. **Stony-shore (epilithic) fauna**, epiphyton on the plants, and a **proportional bed refuge** in place of BENTHOS.REFUGE's fixed
   3 g/m².
3. **Bed production brought to an oligo-mesotrophic lake** (BENTHOS.G toward P/B 5–10; K_FISH/K_BENTH unified; PERI_G to the bed's
   light; ALLOCH split).
4. **Crayfish by substrate × calcium.** stageR5's crayfish as the default, then the substrate's shelter.

**Retires:** CR_ROCK_Z as "rock", rockC/rockL, bass bury, CR_PREF 5, the Michigan crayfish stock.

### R4. Where the predators and prey really are

audit_predation §3–4; audit_habitat_young A, B1.

1. **Size-dependent predator habitat:**
   - large pickerel on the outer weed edge, 1.5–3.5 m, facing open bottom at dusk;
   - bass > 40 cm over 3–5.5 m in late summer.
2. **The weed edge as a place**, an edge cue and ambush posture.
3. **Predators that follow prey:** ambush-site relocation with a giving-up time, and pickerel to open water where schooling prey are.
4. **The prey's diel behaviour in the encounter:**
   - perch schools breaking up at dusk;
   - white perch inshore at night;
   - vigilance as a per-encounter attack probability (day 0.1–0.2, twilight 0.5–1) in place of a constant E_h refusal.
5. **The bullhead's day refuge and nocturnality.**
6. **One predation rule for young and agents**, with per-species size windows.

**Retires:** the bass juvenile band narrowing (0.3–1.2 → 0.4–2.0 m), catfish cs 0.05 / spineW 1.6, RECRUIT_SPRING's role, the
pickerel's fixed shallow band.

### R5. What else eats and takes fish (the regulators the census cap stands in for)

1. **Birds and mammals as a hazard field** by depth and fish size:
   - kingfisher: ≤ 10 cm fish in < 60 cm;
   - great blue heron: 5–25 cm in ≤ 50 cm;
   - common and hooded mergansers (a brood seen);
   - loon;
   - osprey;
   - bald eagle (nesting on Upper; bullheads, suckers, pickerel);
   - otter and mink.

   PLAN item 16.
2. **Angling** (PLAN item 37):
   - white perch 2–8 %/yr of adults;
   - pickerel 0.6–1 kept per ha a year;
   - bass 97 % released, with hooking losses;
   - ice fishing.
3. **An egg stage:**
   - incubation by degree-days;
   - egg predation (white perch eating their own eggs, bullheads, sunfish, crayfish on nests);
   - *Saprolegnia*;
   - wind and cold-snap losses;
   - stranding.

   PLAN item 21.
4. **Year-to-year weather** (PLAN 32–33): the field's 16–200-fold year-class swings.
5. **Then retire the census cap as a regulator.** It stays only as a performance ceiling that never binds. The adults' M is then
   split by cause.

**Retires:** M_OTHER as a uniform stand-in, the killifish strip's narrowing (1.3 → 0.25 m; back to the field's 0.1–0.6 m), SEED_M.

### R6. Winter and the water's year (stack W)

PLAN items 18, 34; audit_foodweb §8.4.

- snow and ice optics;
- late-winter convection;
- the bed's declining O₂ demand;
- the hydrograph with the winter low flow (now flushing the zooplankton at 1–1.8 %/d all winter).

**Retires:** ICE.LIGHT_CUT's compensation, M2_R's under-ice fit, the gate's 3 mg/L winter-O₂ floor (→ 5).

### R7. The rest of the lakes' world

PLAN items 35, 38 and the foodweb list.

- **The streams as boundaries:** sucker, fallfish and white perch runs; emigration over Lower's outlet (1–6 fish/acre/season, half in
  April–May); immigration; the brook's drift; the outlet's zooplankton stripping.
- **Sea-run alewife.**
- **Emergence:** *Hexagenia* (Maine dusk hatch late June–mid July) and chironomids from the mud.
- **Frogs, tadpoles and turtles in 3-D.**
- **The mussels' full role.**
- **Shoreline vegetation types** for insect fall-in.
- **Shore wood.**
- **Calcium.**

**Retires:** dace plankton off, fallfish Lpisc 30's role, bass insR 2, the fallfish hybrid set (one coherent set), killifish on the
fathead set (try its congener's at ACT 1 once its food exists).

## Progress

- **R1 (f7ca62a):** the predation rule undone — COVER_ONCE, SIZE_RENORM, EH_AMAX, bass aMax 12, act diel, pickerel gated, ENC_DZ off,
  REST_DIGEST. Arm W (613, 3 yrs): predators fed (pickerel summer p 0.37–0.41), white perch off the cap (31 → 22 kg/ha) — but bass p
  0.55–0.65 grew to 66 cm, pickerel to 60 cm by 5; prey (yellow perch, sunfishes, bullheads, killifish) fell. Follow-up (with R2b):
  REST_ALL (a sated fish forages for nothing) and pGates from growth (bass 0.35, pickerel 0.3).
- **R2a (3215c3e):** the young by what pays (YSHARE), per-species larval Cmax, R_WMIN for steep sets only, K_FRY 60, no adult ×0.7 on
  the sunfishes' larvae. 1/10 A/B: summer Daphnia 48–409 µg/L against 0–2; autumn 10–64 against ~0; young's autumn lengths in range.
- **R2b (a2ec762):** small fish reach the weeds' small fauna (SMALL_S, SM_L 7.5–15 cm); batch spawners' gonads 0.8 of surplus
  (reproA); with R1's follow-up (REST_ALL, pGates bass 0.35, pickerel 0.3).
- **Arm X** (R1 + follow-up + R2a + R2b; seed 613, 3 yrs): the zooplankton fixed (winter 8–31 µg/L against 1–6); white perch 31 → 46
  kg/ha (R1b not yet in); pickerel still 51.5 cm at age 5 — the cold-rule units slip, below; bass of ages 1–6 missing; the
  sunfishes and killifish ~0. (The GPU driver reset at day 1092; 611/612 superseded.)
- **The cold rules on a relative appetite + R1b white perch (1b5baa5):** FB4's Eq. 4 curve (the pickerel's) peaks at 8.3, so the
  cold rules divide by its peak (consumptionTrel: 0.12 at 2 °C, not 1.0); white perch mOther 1, M 0.54, maxAge 10, a harsher first
  winter (WINTER0 [1.1, 0.95]), the adults' size slope off (MOTHER_FLAT). **Arm Y** (to here; seed 613, 3 yrs; 611/612 stopped,
  superseded by arm Z): total 92 → 79 → 62 kg/ha; white perch 25 → 18 → 11 (below the field's 15–35), yellow perch 23 → 12,
  bullheads 7.6 → 3.7, pickerel 2.7 → 1.0 (no year-classes: the larvae's energy budget, FINDINGS), pumpkinseed, redbreast and
  killifish gone, bass ~10 — their age-1 recruits eaten in their first summer (35,655 → 1,736) and only 58-cm fish of 8+ left
  (Maine Linf ~50). The GPU hung at the year-4 recruitment (as arm X): the grid's insertion sort, fixed in c08b186.
- **R4·6, one rule for the young and the followed fish:**
  - **YENC (8b82143):** the young met through the predator's own encounter volume, not the percid cannibals' daily clearance
    (~1/1,700 of it). Six weeks at 1/10: pickerel and bass eat 0.91 kg of young against 0.12.
  - **YWIN_CS + RD_SIZE (e395ab3):** on that volume, the young are caught with the strike rule's capture success (not the
    perch-cannibal window: a 2.5-cm young pumpkinseed weighed 0.001 against 0.21 as an agent), their attacks count against the
    strike ceiling, and every prey — young or followed — is seen at its own reaction distance (the visual model R²·e^(cR) ∝ L², c
    1.7 /m). Six weeks at 1/10: 1.08 kg against 0.11. A 1/10 screen (3 seeds, 140 days): pickerel eat 2.1–2.9× the young,
    bass 2.3–3.1×, their kills of followed fish and p unchanged. The GPU's copy (c08b186) checked in g1_check (young eaten 137/137).
    **Arm Z** (c08b186 = arm Y + YENC + YWIN_CS + RD_SIZE; 613/611/612 × 3 yrs) running.
  - **R2·4 — the pickerel's first year (found in arm Y):** the young ran on the adult FB4 pike set, on which a full ration grows a
    0.9-cm larva 0.05–0.10 mm/d below 15 °C — no year-classes. From the measurements (esocid_larval_energetics.md): below 10 g, Cmax ∝
    W^−0.24 (Wieser et al. 1992) continuous at 10 g, respiration Q10 2.5 (Woynárovich 1960) equal at 22.5 °C with the adults' ×0.5
    winter cut off for it, FB4's juvenile esocid losses (FA 0.13, SDA 0.14). Unfitted, it reproduces lab pike larvae fed to excess
    (0.23–0.98 mm/d at 10–24 °C against 0.25–1.21). S3.pike.yCover 0.8 restored (Grimm 1994; Casselman & Lewis 1996).
  - **R2·3 — YDEPTH, the young's depth in the predators' reach (after arm Z: adult bass ate 1.36 M young bass, the cohort 3.1 M →
    16 k by mid-August):** the young's table by the bed's depth too (classes at 0.3 / 0.6 / 1.2 m), each predator reaching a bin by
    the followed fish's shallows rule (none at ≤ 0.5·SHALLOW_K·L, full at ≥ SHALLOW_K·L, on the bin's mean bed); young smallmouth on
    their first summer's shallows (S3 yBed 1.0 m: Forbes 1981's review, Aadland 1993, Ridgway 2002).
  - **R2·4b — the young's energy budgets, species by species (larval_juvenile_energetics_panfish.md §3–4, §7–8). NOT one fix:**
    - sunfishes: Kitchell's bluegill set on the adult 4,186 J/g caps a larva at ~0.25 mm/d (21 °C); at age-0 bluegill's measured
      2,300 J/g (Breck 1993) it gives the ponds' 0.46–0.66 — the larval ×1.5 Cmax (FRY.CMAX_LARVA, kept for the sunfishes in R2a)
      stood in for it. But the young pumpkinseed's 2.7–3.0 cm are already inside the northern range (Beard 1982: Sept 26–42 mm);
      their collapse is the age-1 recruits eaten (47k → 5k a year), so this is a refinement, not the fix;
    - white perch: on the yellow perch juvenile set a larva grows 1.6–3.8× Margulies' 1989 larvae fed to excess (efficiency 56 %
      against the measured K1 0.14–0.32), and young WP are energy-RICH (5.7–6.3 kJ/g at 3–9 g, Hanks 2009). Their small autumn size
      (4.4–5.5 cm; Lake Erie August 58, Hudson October 63–82) is the ration they get (67–111 M larvae a year — dense cohorts grow
      slower, Oneida, Hudson) — and the R1b winter ramp then kills all < 53 mm (Johnson & Evans's STARVED lab fish). Check the ramp
      against field first-winter survival of 45–55-mm Maine-like cohorts before touching growth;
    - smallmouth: 6–8.4 cm in autumn, inside Opeongo's 55–85 and Spednic's 71–76 — leave;
    - pickerel: done (R2·4).
  - **Known, parked:** the bass's cold respiration switches from the empirical curve to the Rice set between 15 and 18 °C — a
    ~5× step that grows young bass faster at 15 °C than at 18; the yellow perch's first-winter loss ~13 % against the field's
    40–50 % (Z 0.001/d against ~0.004).
  - Still to do in R4·6: the young's school dilution for bass (the followed rule's n^−0.8), a shared strike budget between the two
    routes (now each route has its own ceiling), the young piscivores' schools (still the percid clearance with its window).

## How PLAN.md's open items map here

| PLAN item | Goes to |
|---|---|
| 16 birds | R5 |
| 18 ice optics | R6 |
| 20 white perch winter | R1b |
| 21 egg stage | R5 |
| 22 pickerel first year | R4 / R1 |
| 29 zooplankton shape | R2 |
| 32–34 weather, hydrograph | R5 / R6 |
| 35 alewife | R7 |
| 37 angling | R5 |
| 38 streams, frogs, emergence | R7 |
| phase 6 (stageR5 the default) | after R1–R2 read well on 3 seeds |
