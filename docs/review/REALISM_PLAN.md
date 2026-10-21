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
